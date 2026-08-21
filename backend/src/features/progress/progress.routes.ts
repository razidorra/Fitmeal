import { Router } from 'express';
import { z } from 'zod';
import { Checkin } from './checkin.model.js';
import { MealPlan } from '../meal-plan/meal-plan.model.js';
import { findOwnedProfile } from '../../shared/ownership.js';
import { requireUserId } from '../../shared/auth.js';

export const progressRouter = Router();

progressRouter.get('/:profileId', async (req, res, next) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const profile = await findOwnedProfile(req.params.profileId, userId);
    if (!profile) { res.status(404).json({ message: 'Profile not found' }); return; }

    res.json(await Checkin.find({ profileId: req.params.profileId }).sort({ date: 1 }));
  } catch (error) {
    next(error);
  }
});

progressRouter.post('/', async (req, res, next) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const data = z.object({ profileId: z.string(), weightKg: z.number().min(30).max(350), note: z.string().max(300).optional() }).parse(req.body);
    const profile = await findOwnedProfile(data.profileId, userId);
    if (!profile) { res.status(404).json({ message: 'Profile not found' }); return; }

    res.status(201).json(await Checkin.create(data));
  } catch (error) {
    next(error);
  }
});

interface ReviewStats {
  goal: 'lose' | 'maintain' | 'gain';
  totalChangeKg: number;
  weeklyRateKg: number | null;
  checkinCount: number;
  onTrack: boolean | null;
  mealsChecked: number;
  greatFitCount: number;
  poorFitCount: number;
}

// Rule-based review — no AI involved, so it never depends on any external quota. Every sentence
// here is derived directly from the computed stats, not generated.
function buildReviewSummary(stats: ReviewStats): string {
  if (stats.onTrack === null) {
    return "Not enough check-ins yet to see a trend — log at least one more on a different day so we can measure how you're doing.";
  }

  const rate = stats.weeklyRateKg ?? 0;
  const pace = Math.abs(rate).toFixed(1);

  if (stats.onTrack) {
    let message = `Great work — you're on track for your ${stats.goal} goal, averaging ${pace} kg/week in the right direction. Keep following your plan and stick with your regular check-ins.`;
    if (stats.mealsChecked > 0 && stats.poorFitCount === 0) message += ' Your logged meal swaps have all been solid fits too — nice consistency.';
    return message;
  }

  const suggestions: string[] = [];
  if (stats.goal === 'lose') {
    suggestions.push(rate > 0
      ? "you're actually gaining weight while aiming to lose it — try trimming portion sizes a little, cutting one snack, or adding a short daily walk"
      : "you're losing weight, but slower than expected — a modest cut to portions or a bit more daily movement should help speed things up");
  } else if (stats.goal === 'gain') {
    suggestions.push(rate < 0
      ? "you're losing weight while aiming to gain — add an extra snack or larger portions, especially protein-rich ones"
      : "you're gaining, but slower than expected — increase portion sizes a bit or add a calorie-dense snack between meals");
  } else {
    suggestions.push(rate > 0
      ? 'your weight is trending up — scale back portions slightly to stay level'
      : 'your weight is trending down — add a bit more food to hold steady');
  }

  if (stats.poorFitCount > 0) {
    suggestions.push(`${stats.poorFitCount} of your ${stats.mealsChecked} logged meal swap${stats.mealsChecked === 1 ? '' : 's'} ${stats.poorFitCount === 1 ? 'was' : 'were'} flagged as a poor fit for your goal — that's a good place to start`);
  }

  return `You're not quite on track for your ${stats.goal} goal right now: ${suggestions.join('. ')}. Log another check-in soon to see if the adjustment helps.`;
}

// Computes a real weight-trend verdict from check-in history and turns it into a tailored,
// rule-based review — praise when on track, concrete suggestions when not.
progressRouter.post('/:profileId/review', async (req, res, next) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const profile = await findOwnedProfile(req.params.profileId, userId);
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

    const goal = profile.get('goal') as 'lose' | 'maintain' | 'gain';
    const goalDirection = { lose: -1, maintain: 0, gain: 1 }[goal];
    let onTrack = true;
    if (weeklyRateKg !== null) {
      onTrack = goal === 'maintain' ? Math.abs(weeklyRateKg) < 0.3 : weeklyRateKg * goalDirection > 0.05;
    }

    const meals = ((latestPlan?.get('meals') as Array<Record<string, unknown>>) ?? []).filter((meal) => typeof meal.verdict === 'string');
    const greatFitCount = meals.filter((meal) => meal.verdict === 'great fit').length;
    const poorFitCount = meals.filter((meal) => meal.verdict === 'poor fit').length;

    const stats: ReviewStats = {
      goal, totalChangeKg, weeklyRateKg,
      checkinCount: checkins.length, onTrack: checkins.length >= 2 ? onTrack : null,
      mealsChecked: meals.length, greatFitCount, poorFitCount,
    };

    res.json({ stats: { ...stats, firstWeight, latestWeight }, summary: buildReviewSummary(stats) });
  } catch (error) {
    next(error);
  }
});
