import { Router } from 'express';
import { z } from 'zod';
import { MealPlan } from './meal-plan.model.js';
import { buildPlan } from './meal-plan.service.js';
import { findOwnedProfile } from '../../shared/ownership.js';
import { requireUserId } from '../../shared/auth.js';

export const mealPlanRouter = Router();

const generateSchema = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), regenerate: z.boolean().optional() });

// Get-or-create semantics: called once per day when the planner loads, it returns today's plan if
// one already exists (so custom swaps and per-meal confirmations survive a page reload) and only
// builds a fresh one the first time a given day is seen. Pass `regenerate: true` (the "Refresh
// plan" button) to force a brand-new plan for that day, discarding whatever was there.
mealPlanRouter.post('/generate/:profileId', async (req, res, next) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const profile = await findOwnedProfile(req.params.profileId, userId);
    if (!profile) { res.status(404).json({ message: 'Profile not found' }); return; }

    const { date, regenerate } = generateSchema.parse(req.body);

    if (!regenerate) {
      const existing = await MealPlan.findOne({ profileId: profile.id, date });
      if (existing) { res.json(existing); return; }
    }

    const built = buildPlan(profile);
    const plan = await MealPlan.findOneAndUpdate(
      { profileId: profile.id, date },
      { profileId: profile.id, date, ...built },
      { upsert: true, new: true },
    );

    res.status(201).json(plan);
  } catch (error) {
    next(error);
  }
});

mealPlanRouter.get('/latest/:profileId', async (req, res, next) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const profile = await findOwnedProfile(req.params.profileId, userId);
    if (!profile) { res.status(404).json({ message: 'Profile not found' }); return; }

    res.json(await MealPlan.findOne({ profileId: req.params.profileId }).sort({ createdAt: -1 }));
  } catch (error) {
    next(error);
  }
});

// Recent days' plans for the "this week / previous week" history view. Undated legacy plans are
// excluded automatically since they never match the date range.
mealPlanRouter.get('/:profileId/history', async (req, res, next) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const profile = await findOwnedProfile(req.params.profileId, userId);
    if (!profile) { res.status(404).json({ message: 'Profile not found' }); return; }

    const days = Math.min(Number(req.query.days) || 14, 60);
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceDate = since.toISOString().slice(0, 10);

    res.json(await MealPlan.find({ profileId: profile.id, date: { $gte: sinceDate } }).sort({ date: -1 }));
  } catch (error) {
    next(error);
  }
});

// Confirms "I had the suggested meal as planned" for one slot — no Gemini call needed, it's free and instant.
mealPlanRouter.patch('/:planId/meals/:time/confirm', async (req, res, next) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const plan = await MealPlan.findById(req.params.planId).catch(() => null);
    if (!plan) { res.status(404).json({ message: 'Meal plan not found' }); return; }

    const owningProfile = await findOwnedProfile(String(plan.get('profileId')), userId);
    if (!owningProfile) { res.status(404).json({ message: 'Meal plan not found' }); return; }

    const meals = plan.get('meals') as Array<Record<string, unknown>>;
    const mealIndex = meals.findIndex((meal) => meal.time === req.params.time);
    if (mealIndex === -1) { res.status(404).json({ message: 'Meal slot not found in this plan' }); return; }

    plan.meals = meals.map((meal, index) => index === mealIndex ? { ...meal, confirmed: true } : meal);
    await plan.save();

    res.json(plan);
  } catch (error) {
    next(error);
  }
});

const customMealSchema = z.object({ description: z.string().min(1).max(300) });

// Replace one meal slot with a freely-typed meal — just records what you actually had, no AI
// involved, so it never depends on any external quota. Nutrition numbers keep the slot's original
// budget since we have no way to know the real values without asking something to estimate them.
mealPlanRouter.post('/:planId/meals/:time', async (req, res, next) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const plan = await MealPlan.findById(req.params.planId).catch(() => null);
    if (!plan) { res.status(404).json({ message: 'Meal plan not found' }); return; }

    const owningProfile = await findOwnedProfile(String(plan.get('profileId')), userId);
    if (!owningProfile) { res.status(404).json({ message: 'Meal plan not found' }); return; }

    const meals = plan.get('meals') as Array<Record<string, unknown>>;
    const mealIndex = meals.findIndex((meal) => meal.time === req.params.time);
    if (mealIndex === -1) { res.status(404).json({ message: 'Meal slot not found in this plan' }); return; }

    const { description } = customMealSchema.parse(req.body);
    const slot = meals[mealIndex];

    // Keep the very first suggested title and its recipe details even across repeated swaps, so the
    // UI can always show "was X, now Y" in history, and still show how the original suggestion was
    // meant to be prepared, instead of losing that the moment it's swapped.
    const originalTitle = (slot.originalTitle as string | undefined) ?? (slot.title as string);
    const originalIngredientsList = (slot.originalIngredientsList as string[] | undefined) ?? (slot.ingredientsList as string[] | undefined);
    const originalSteps = (slot.originalSteps as string[] | undefined) ?? (slot.steps as string[] | undefined);
    const originalImage = (slot.originalImage as string | undefined) ?? (slot.image as string | undefined);

    plan.meals = meals.map((meal, index) => index === mealIndex ? {
      time: slot.time,
      title: description.length > 60 ? `${description.slice(0, 57)}...` : description,
      ingredients: description,
      originalTitle,
      originalIngredientsList,
      originalSteps,
      originalImage,
      calories: slot.calories,
      protein: slot.protein,
      isCustom: true,
      confirmed: false,
    } : meal);
    await plan.save();

    res.json(plan);
  } catch (error) {
    next(error);
  }
});
