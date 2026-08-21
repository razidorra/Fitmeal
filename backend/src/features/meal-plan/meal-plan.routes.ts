import { Router } from 'express';
import { z } from 'zod';
import { Profile } from '../profile/profile.model.js';
import { MealPlan } from './meal-plan.model.js';
import { buildPlan } from './meal-plan.service.js';
import { askGemini, GeminiError, parseGeminiJson } from '../../shared/gemini.js';

export const mealPlanRouter = Router();

mealPlanRouter.post('/generate/:profileId', async (req, res, next) => {
  try {
    const profile = await Profile.findById(req.params.profileId);
    if (!profile) { res.status(404).json({ message: 'Profile not found' }); return; }
    const plan = buildPlan(profile);
    res.status(201).json(await MealPlan.create({ profileId: profile.id, ...plan }));
  } catch (error) {
    next(error);
  }
});

mealPlanRouter.get('/latest/:profileId', async (req, res, next) => {
  try {
    res.json(await MealPlan.findOne({ profileId: req.params.profileId }).sort({ createdAt: -1 }));
  } catch (error) {
    next(error);
  }
});

const customMealSchema = z.object({ description: z.string().min(1).max(300) });

interface NutritionEstimate {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  verdict: 'great fit' | 'reasonable' | 'poor fit';
  note: string;
}

const nutritionSystemPrompt = 'You are a nutrition estimation engine inside a meal-planning app. Given a short meal description and the '
  + "calorie/protein/carb/fat budget it needs to fit into, estimate realistic nutrition for that meal and judge how well it fits the budget and the user's goal. "
  + 'Respond with ONLY compact JSON, no markdown, no extra text, in exactly this shape: '
  + '{"calories": number, "protein": number, "carbs": number, "fats": number, "verdict": "great fit" | "reasonable" | "poor fit", "note": "one short sentence explaining why"}.';

// Replace one meal slot with a freely-typed meal: Gemini estimates its nutrition and judges the fit,
// then the plan is updated and persisted so the swap sticks.
mealPlanRouter.post('/:planId/meals/:time', async (req, res, next) => {
  try {
    const plan = await MealPlan.findById(req.params.planId);
    if (!plan) { res.status(404).json({ message: 'Meal plan not found' }); return; }

    const meals = plan.get('meals') as Array<Record<string, unknown>>;
    const mealIndex = meals.findIndex((meal) => meal.time === req.params.time);
    if (mealIndex === -1) { res.status(404).json({ message: 'Meal slot not found in this plan' }); return; }

    const { description } = customMealSchema.parse(req.body);
    const slot = meals[mealIndex];
    const targets = plan.get('targets') as { calories: number; protein: number; carbs: number; fats: number };

    const prompt = `Meal: "${description}". This meal slot's budget is about ${slot.calories} kcal and ${slot.protein}g protein, `
      + `part of a full day totalling ${targets.calories} kcal, ${targets.protein}g protein, ${targets.carbs}g carbs and ${targets.fats}g fats.`;

    const reply = await askGemini(nutritionSystemPrompt, [{ role: 'user', parts: [{ text: prompt }] }], true);
    const estimate = parseGeminiJson<NutritionEstimate>(reply);

    plan.meals = meals.map((meal, index) => index === mealIndex ? {
      time: slot.time,
      title: description.length > 60 ? `${description.slice(0, 57)}...` : description,
      ingredients: description,
      calories: Math.round(estimate.calories),
      protein: Math.round(estimate.protein),
      carbs: Math.round(estimate.carbs),
      fats: Math.round(estimate.fats),
      isCustom: true,
      verdict: estimate.verdict,
      note: estimate.note,
    } : meal);
    await plan.save();

    res.json(plan);
  } catch (error) {
    if (error instanceof GeminiError) {
      res.status(error.status).json({ message: error.message });
      return;
    }
    next(error);
  }
});
