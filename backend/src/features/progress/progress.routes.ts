import { Router } from 'express';
import { z } from 'zod';
import { Checkin } from './checkin.model.js';
import { Profile } from '../profile/profile.model.js';
import { MealPlan } from '../meal-plan/meal-plan.model.js';
import { askGemini, GeminiError } from '../../shared/gemini.js';

export const progressRouter = Router();

progressRouter.get('/:profileId', async (req, res, next) => {
  try {
    res.json(await Checkin.find({ profileId: req.params.profileId }).sort({ date: 1 }));
  } catch (error) {
    next(error);
  }
});

progressRouter.post('/', async (req, res, next) => {
  try {
    const data = z.object({ profileId: z.string(), weightKg: z.number().min(30).max(350), note: z.string().max(300).optional() }).parse(req.body);
    res.status(201).json(await Checkin.create(data));
  } catch (error) {
    next(error);
  }
});

const reviewSystemPrompt = "You are FitMeal AI's progress coach. Given a summary of someone's weight check-ins, their goal, and how well their "
  + "recent custom meal choices matched their nutrition targets, write a short (3-4 sentence), encouraging but honest review: say clearly whether "
  + 'they look on track for their goal, and if not, suggest one concrete adjustment. Reference the numbers naturally rather than just repeating them. '
  + 'You are not a doctor: never diagnose, and suggest a qualified professional for anything medical.';

// Computes a real weight-trend verdict from check-in history, then asks Gemini to turn it into a short written review.
progressRouter.post('/:profileId/review', async (req, res, next) => {
  try {
    const profile = await Profile.findById(req.params.profileId);
    if (!profile) { res.status(404).json({ message: 'Profile not found' }); return; }

    const checkins = await Checkin.find({ profileId: req.params.profileId }).sort({ date: 1 });
    const latestPlan = await MealPlan.findOne({ profileId: req.params.profileId }).sort({ createdAt: -1 });

    const firstWeight = checkins[0]?.get('weightKg') ?? profile.weightKg;
    const latestWeight = checkins.at(-1)?.get('weightKg') ?? profile.weightKg;
    const totalChangeKg = Number((latestWeight - firstWeight).toFixed(1));

    let weeklyRateKg: number | null = null;
    if (checkins.length >= 2) {
      const daysTracked = Math.max(1, (checkins.at(-1)!.get('date').getTime() - checkins[0].get('date').getTime()) / 86_400_000);
      weeklyRateKg = Number((totalChangeKg / (daysTracked / 7)).toFixed(2));
    }

    const goalDirection = { lose: -1, maintain: 0, gain: 1 }[profile.get('goal') as 'lose' | 'maintain' | 'gain'];
    let onTrack = true;
    if (weeklyRateKg !== null) {
      onTrack = profile.get('goal') === 'maintain' ? Math.abs(weeklyRateKg) < 0.3 : weeklyRateKg * goalDirection > 0.05;
    }

    const meals = ((latestPlan?.get('meals') as Array<Record<string, unknown>>) ?? []).filter((meal) => typeof meal.verdict === 'string');
    const greatFitCount = meals.filter((meal) => meal.verdict === 'great fit').length;
    const poorFitCount = meals.filter((meal) => meal.verdict === 'poor fit').length;

    const stats = {
      goal: profile.get('goal'), firstWeight, latestWeight, totalChangeKg, weeklyRateKg,
      checkinCount: checkins.length, onTrack: checkins.length >= 2 ? onTrack : null,
      mealsChecked: meals.length, greatFitCount, poorFitCount,
    };

    const prompt = `Goal: ${stats.goal} weight. Check-ins logged: ${stats.checkinCount}. `
      + (weeklyRateKg !== null ? `Weight has changed ${totalChangeKg >= 0 ? '+' : ''}${totalChangeKg} kg overall, averaging ${weeklyRateKg} kg/week. `
        : 'Not enough check-ins yet for a weekly trend. ')
      + `Custom meal choices reviewed: ${meals.length} (${greatFitCount} great fit, ${poorFitCount} poor fit).`;

    const summary = await askGemini(reviewSystemPrompt, [{ role: 'user', parts: [{ text: prompt }] }]);
    res.json({ stats, summary: summary || 'Keep logging check-ins so we can build a clearer picture of your trend.' });
  } catch (error) {
    if (error instanceof GeminiError) {
      res.status(error.status).json({ message: error.message });
      return;
    }
    next(error);
  }
});
