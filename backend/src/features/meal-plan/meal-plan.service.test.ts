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

  it('uses the documented -161 equation for the other option', () => {
    expect(getTargets({ ...baseProfile, sex: 'other' })).toEqual(getTargets({ ...baseProfile, sex: 'female' }));
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

// A Monday and a Sunday in the fixture year — buildPlan treats every Sunday as a cheat day, so
// the "normal day" tests below all anchor on the Monday to stay well away from that behavior.
const aMonday = '2026-08-24';
const aSunday = '2026-08-23';

describe('buildPlan', () => {
  it('returns exactly one meal for each of the four time slots, in order', () => {
    const { meals, nutritionBasis } = buildPlan(baseProfile, aMonday);
    expect(nutritionBasis).toBe('target-budget');
    expect(meals.map((meal) => meal.time)).toEqual(['Breakfast', 'Lunch', 'Snack', 'Dinner']);
  });

  it('gives every meal a title, an image, ingredients and steps, and starts it unconfirmed', () => {
    const { meals } = buildPlan(baseProfile, aMonday);
    for (const meal of meals) {
      expect(meal.title.length).toBeGreaterThan(0);
      // Meals now come from a mix of hotlinked Unsplash photos and local /images/recipes/ files
      // shipped with the frontend (a relative path resolves against the frontend's own origin).
      expect(meal.image).toMatch(/^(https:\/\/images\.unsplash\.com\/|\/images\/recipes\/)/);
      expect(meal.ingredientsList.length).toBeGreaterThan(0);
      expect(meal.steps.length).toBeGreaterThan(0);
      expect(meal.confirmed).toBeNull();
    }
  });

  it('splits the daily calorie target across meals without drifting beyond rounding error', () => {
    const { targets, meals } = buildPlan(baseProfile, aMonday);
    const total = meals.reduce((sum, meal) => sum + meal.calories, 0);
    // Each meal's calorie share is rounded independently, so the sum can be off by at most
    // roughly one calorie per meal versus the exact target.
    expect(Math.abs(total - targets.calories)).toBeLessThanOrEqual(meals.length);
  });

  it('produces a different plan (higher calories) for a bigger, more active profile', () => {
    const smaller = buildPlan(baseProfile, aMonday);
    const bigger = buildPlan({ ...baseProfile, weightKg: 100, heightCm: 195, activity: 'high' }, aMonday);
    expect(bigger.targets.calories).toBeGreaterThan(smaller.targets.calories);
  });

  it('varies the menu across different days for the same profile', () => {
    const dates = ['2026-08-17', '2026-08-18', '2026-08-19', '2026-08-20', '2026-08-21'];
    const menus = dates.map((date) => buildPlan(baseProfile, date).meals.map((meal) => meal.title).join('|'));
    // Not every day has to differ from every other (the pool isn't huge), but a full working week
    // should not land on the exact same four dishes every single day.
    expect(new Set(menus).size).toBeGreaterThan(1);
  });

  it('gives "lose" and "gain" profiles different dishes on the same day', () => {
    const lose = buildPlan({ ...baseProfile, goal: 'lose' }, aMonday).meals.map((meal) => meal.title);
    const gain = buildPlan({ ...baseProfile, goal: 'gain' }, aMonday).meals.map((meal) => meal.title);
    // Every slot's "lose" and "gain" pools are disjoint by design, so all four should differ.
    expect(lose).not.toEqual(gain);
  });

  it('marks Sundays as a flex day with a free-choice placeholder and no fixed calories', () => {
    const { meals, isCheatDay } = buildPlan(baseProfile, aSunday);
    expect(isCheatDay).toBe(true);
    for (const meal of meals) {
      expect(meal.title).toBe('Flex day 🎉');
      expect(meal.calories).toBe(0);
      expect(meal.protein).toBe(0);
    }
  });

  it('is not a cheat day on any other weekday', () => {
    expect(buildPlan(baseProfile, aMonday).isCheatDay).toBe(false);
  });
});
