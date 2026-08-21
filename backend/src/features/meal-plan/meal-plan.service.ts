import type { ProfileInput } from '../profile/profile.model.js';

// Unsplash photo ids -> a ready-to-use, sized CDN url.
function photo(id: string) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=400&q=80`;
}

export function getTargets(profile: ProfileInput) {
  const base = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age + (profile.sex === 'male' ? 5 : -161);
  const factor = { low: 1.2, light: 1.375, moderate: 1.55, high: 1.725 }[profile.activity];
  const adjustment = { lose: -400, maintain: 0, gain: 350 }[profile.goal];
  const calories = Math.round(base * factor + adjustment);
  return { calories, protein: Math.round(profile.weightKg * (profile.goal === 'gain' ? 1.8 : 1.6)), carbs: Math.round(calories * 0.45 / 4), fats: Math.round(calories * 0.25 / 9) };
}

export function buildPlan(profile: ProfileInput) {
  const targets = getTargets(profile);
  const meals = [
    ['Breakfast', 'Greek yogurt power bowl', 'Greek yogurt, oats, berries, chia seeds', '1725883691833-97103ecd582a'],
    ['Lunch', 'Mediterranean chicken bowl', 'Chicken, quinoa, roasted vegetables, tahini', '1688923130928-8468d6af8d7e'],
    ['Snack', 'Apple & peanut butter', 'Apple slices with natural peanut butter', '1609404543812-4b9fdda52a55'],
    ['Dinner', 'Salmon rice plate', 'Salmon, brown rice, broccoli, lemon', '1623800849430-13c191263e9f'],
  ].map(([time, title, ingredients, photoId], index) => ({ time, title, ingredients, image: photo(photoId), calories: Math.round(targets.calories * [0.27, 0.32, 0.13, 0.28][index]), protein: Math.round(targets.protein * [0.25, 0.32, 0.13, 0.3][index]) }));
  return { targets, meals };
}
