import { describe, expect, it } from 'vitest';
import { buildPlan, getTargets } from './meal-plan.service.js';

const baseProfile = {
  name: 'Test', age: 30, sex: 'male' as const, heightCm: 180, weightKg: 80,
  activity: 'moderate' as const, goal: 'maintain' as const, clerkUserId: 'user_1',
};

describe('getTargets', () => {
  it('subtracts a flat 400 kcal for a "lose" goal, relative to "maintain"', () => {
    const maintain = getTargets({ ...baseProfile, goal: 'maintain' });
    const lose = getTargets({ ...baseProfile, goal: 'lose' });
    expect(maintain.calories - lose.calories).toBe(400);
  });

  it('adds a flat 350 kcal for a "gain" goal, relative to "maintain"', () => {
    const maintain = getTargets({ ...baseProfile, goal: 'maintain' });
    const gain = getTargets({ ...baseProfile, goal: 'gain' });
    expect(gain.calories - maintain.calories).toBe(350);
  });

  it('targets more protein per kg of bodyweight for "gain" than other goals', () => {
    const gain = getTargets({ ...baseProfile, goal: 'gain' });
    const maintain = getTargets({ ...baseProfile, goal: 'maintain' });
    expect(gain.protein).toBeGreaterThan(maintain.protein);
    expect(gain.protein).toBe(Math.round(baseProfile.weightKg * 1.8));
    expect(maintain.protein).toBe(Math.round(baseProfile.weightKg * 1.6));
  });

  it('applies the Mifflin-St Jeor male/female offset, scaled by the activity factor', () => {
    const male = getTargets({ ...baseProfile, sex: 'male' });
    const female = getTargets({ ...baseProfile, sex: 'female' });
    // Same body stats; only sex differs, so the whole gap comes from the formula's +5 vs -161 offset.
    const moderateActivityFactor = 1.55;
    expect(male.calories - female.calories).toBe(Math.round(166 * moderateActivityFactor));
  });

  it('scales the calorie target up as the activity level rises', () => {
    const low = getTargets({ ...baseProfile, activity: 'low' });
    const light = getTargets({ ...baseProfile, activity: 'light' });
    const moderate = getTargets({ ...baseProfile, activity: 'moderate' });
    const high = getTargets({ ...baseProfile, activity: 'high' });
    expect(low.calories).toBeLessThan(light.calories);
    expect(light.calories).toBeLessThan(moderate.calories);
    expect(moderate.calories).toBeLessThan(high.calories);
  });

  it('derives carbs and fats from the calorie target', () => {
    const targets = getTargets(baseProfile);
    expect(targets.carbs).toBe(Math.round((targets.calories * 0.45) / 4));
    expect(targets.fats).toBe(Math.round((targets.calories * 0.25) / 9));
  });
});

describe('buildPlan', () => {
  it('returns exactly one meal for each of the four time slots, in order', () => {
    const { meals } = buildPlan(baseProfile);
    expect(meals.map((meal) => meal.time)).toEqual(['Breakfast', 'Lunch', 'Snack', 'Dinner']);
  });

  it('gives every meal a title, an image url, ingredients and steps, and starts it unconfirmed', () => {
    const { meals } = buildPlan(baseProfile);
    for (const meal of meals) {
      expect(meal.title.length).toBeGreaterThan(0);
      expect(meal.image).toMatch(/^https:\/\/images\.unsplash\.com\//);
      expect(meal.ingredientsList.length).toBeGreaterThan(0);
      expect(meal.steps.length).toBeGreaterThan(0);
      expect(meal.confirmed).toBeNull();
    }
  });

  it('splits the daily calorie target across meals without drifting beyond rounding error', () => {
    const { targets, meals } = buildPlan(baseProfile);
    const total = meals.reduce((sum, meal) => sum + meal.calories, 0);
    // Each meal's calorie share is rounded independently, so the sum can be off by at most
    // roughly one calorie per meal versus the exact target.
    expect(Math.abs(total - targets.calories)).toBeLessThanOrEqual(meals.length);
  });

  it('produces a different plan (higher calories) for a bigger, more active profile', () => {
    const smaller = buildPlan(baseProfile);
    const bigger = buildPlan({ ...baseProfile, weightKg: 100, heightCm: 195, activity: 'high' });
    expect(bigger.targets.calories).toBeGreaterThan(smaller.targets.calories);
  });
});
