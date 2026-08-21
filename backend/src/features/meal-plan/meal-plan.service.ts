import type { ProfileInput } from '../profile/profile.model.js';

// Unsplash photo ids -> a ready-to-use, sized CDN url.
function photo(id: string) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=400&q=80`;
}

interface MealTemplate {
  time: string;
  title: string;
  ingredients: string;
  photoId: string;
  calorieShare: number;
  proteinShare: number;
  ingredientsList: string[];
  steps: string[];
}

const mealTemplates: MealTemplate[] = [
  {
    time: 'Breakfast', title: 'Greek yogurt power bowl', ingredients: 'Greek yogurt, oats, berries, chia seeds', photoId: '1725883691833-97103ecd582a',
    calorieShare: 0.27, proteinShare: 0.25,
    ingredientsList: ['200 g Greek yogurt', '60 g rolled oats', '100 g mixed berries', '1 tbsp chia seeds', '1 tsp honey (optional)'],
    steps: ['Add the oats to the bottom of a bowl.', 'Spoon the Greek yogurt over the oats.', 'Top with mixed berries and chia seeds.', 'Drizzle with honey if using, and serve immediately or chill overnight.'],
  },
  {
    time: 'Lunch', title: 'Mediterranean chicken bowl', ingredients: 'Chicken, quinoa, roasted vegetables, tahini', photoId: '1688923130928-8468d6af8d7e',
    calorieShare: 0.32, proteinShare: 0.32,
    ingredientsList: ['150 g grilled chicken breast, sliced', '80 g cooked quinoa', '100 g roasted mixed vegetables (zucchini, pepper, red onion)', '1 tbsp tahini', 'Lemon juice and parsley'],
    steps: ['Season and grill the chicken breast, then slice it.', 'Roast the mixed vegetables at 200°C for 20 minutes.', 'Assemble the quinoa, vegetables, and chicken in a bowl.', 'Drizzle with tahini and lemon juice, and finish with parsley.'],
  },
  {
    time: 'Snack', title: 'Apple & peanut butter', ingredients: 'Apple slices with natural peanut butter', photoId: '1609404543812-4b9fdda52a55',
    calorieShare: 0.13, proteinShare: 0.13,
    ingredientsList: ['1 medium apple, sliced', '2 tbsp natural peanut butter'],
    steps: ['Core and slice the apple into wedges.', 'Serve with peanut butter for dipping.'],
  },
  {
    time: 'Dinner', title: 'Salmon rice plate', ingredients: 'Salmon, brown rice, broccoli, lemon', photoId: '1623800849430-13c191263e9f',
    calorieShare: 0.28, proteinShare: 0.3,
    ingredientsList: ['150 g salmon fillet', '150 g cooked brown rice', '120 g steamed broccoli', '1 tsp olive oil', 'Lemon wedge'],
    steps: ['Season the salmon fillet with salt, pepper, and a little olive oil.', 'Bake the salmon at 200°C for 12–15 minutes, or until cooked through.', 'Steam the broccoli until tender.', 'Serve the salmon over brown rice with broccoli, finished with a squeeze of lemon.'],
  },
];

// Mifflin-St Jeor formula for resting energy expenditure, scaled by activity level, then adjusted
// for the goal direction. Protein/carbs/fats are then derived from that calorie target, not tracked
// independently — this keeps the macros internally consistent with each other.
export function getTargets(profile: ProfileInput) {
  const base = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age + (profile.sex === 'male' ? 5 : -161);
  const factor = { low: 1.2, light: 1.375, moderate: 1.55, high: 1.725 }[profile.activity];
  const adjustment = { lose: -400, maintain: 0, gain: 350 }[profile.goal];
  const calories = Math.round(base * factor + adjustment);
  return { calories, protein: Math.round(profile.weightKg * (profile.goal === 'gain' ? 1.8 : 1.6)), carbs: Math.round(calories * 0.45 / 4), fats: Math.round(calories * 0.25 / 9) };
}

export function buildPlan(profile: ProfileInput) {
  const targets = getTargets(profile);
  const meals = mealTemplates.map((template) => ({
    time: template.time,
    title: template.title,
    ingredients: template.ingredients,
    image: photo(template.photoId),
    ingredientsList: template.ingredientsList,
    steps: template.steps,
    calories: Math.round(targets.calories * template.calorieShare),
    protein: Math.round(targets.protein * template.proteinShare),
    confirmed: null as boolean | null,
  }));
  return { targets, meals };
}
