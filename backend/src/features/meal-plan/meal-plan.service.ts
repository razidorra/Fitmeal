import type { Goal, ProfileInput } from '../profile/profile.model.js';

// Unsplash photo ids -> a ready-to-use, sized CDN url.
function photo(id: string) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=400&q=80`;
}

// Local photos already shipped with the frontend (frontend/public/images/recipes/) — a relative
// path resolves against the frontend's own origin in the browser, so no external hotlink is needed.
function localPhoto(slug: string) {
  return `/images/recipes/${slug}.jpg`;
}

interface MealTemplate {
  time: string;
  title: string;
  ingredients: string;
  image: string;
  goals: Goal[];
  ingredientsList: string[];
  steps: string[];
}

// Every option within a slot receives that slot's calorie/protein budget from the daily target.
// These values guide portion adjustment; they are not calculated nutrition for the fixed example
// ingredient quantities. Each dish is tagged with the goals it suits: "lose" gets leaner, lower-calorie-
// density options; "maintain"/"gain" share a heartier pool. That's what makes the plan actually
// look different for someone losing weight vs. someone trying to gain, not just differently sized
// portions of the same four dishes.
const SHARES: Record<string, { calorieShare: number; proteinShare: number }> = {
  Breakfast: { calorieShare: 0.27, proteinShare: 0.25 },
  Lunch: { calorieShare: 0.32, proteinShare: 0.32 },
  Snack: { calorieShare: 0.13, proteinShare: 0.13 },
  Dinner: { calorieShare: 0.28, proteinShare: 0.3 },
};

const mealPool: Record<string, MealTemplate[]> = {
  Breakfast: [
    {
      time: 'Breakfast', title: 'Greek yogurt power bowl', ingredients: 'Greek yogurt, oats, berries, chia seeds', image: photo('1725883691833-97103ecd582a'), goals: ['lose', 'maintain'],
      ingredientsList: ['200 g Greek yogurt', '60 g rolled oats', '100 g mixed berries', '1 tbsp chia seeds', '1 tsp honey (optional)'],
      steps: ['Add the oats to the bottom of a bowl.', 'Spoon the Greek yogurt over the oats.', 'Top with mixed berries and chia seeds.', 'Drizzle with honey if using, and serve immediately or chill overnight.'],
    },
    {
      time: 'Breakfast', title: 'Protein oatmeal', ingredients: 'Oats, protein powder, banana, blueberries, walnuts', image: localPhoto('protein-oatmeal'), goals: ['lose'],
      ingredientsList: ['60 g rolled oats', '200 ml milk', '1 scoop vanilla protein powder', '1 banana, sliced', '80 g blueberries', '1 tbsp chopped walnuts'],
      steps: ['Cook the oats with milk over low heat, stirring, for 5 minutes.', 'Stir in the protein powder once the oats have cooled slightly.', 'Top with banana, blueberries, and walnuts.', 'Serve warm.'],
    },
    {
      time: 'Breakfast', title: 'Peanut butter protein oats', ingredients: 'Oats, Greek yogurt, banana, peanut butter, chia seeds', image: photo('1682622110332-d50f50b7146d'), goals: ['maintain', 'gain'],
      ingredientsList: ['80 g rolled oats', '200 g Greek yogurt', '1 banana', '25 g peanut butter', '150 ml milk', '1 tsp chia seeds', 'Cinnamon'],
      steps: ['Mix oats, milk, yogurt, and cinnamon in a bowl.', 'Top with sliced banana, peanut butter, and chia seeds.', 'Eat immediately or chill overnight for a thicker texture.'],
    },
    {
      time: 'Breakfast', title: 'Date pistachio breakfast parfait', ingredients: 'Greek yogurt, dates, pistachios, oats, banana', image: localPhoto('date-pistachio-parfait'), goals: ['gain'],
      ingredientsList: ['250 g Greek yogurt', '50 g rolled oats', '1 banana, sliced', '3 medjool dates, chopped', '25 g pistachios, chopped', '1 tsp honey'],
      steps: ['Spoon half of the yogurt into a glass or bowl.', 'Layer in the oats, banana, and chopped dates.', 'Add the remaining yogurt.', 'Top with pistachios and honey, then serve or chill overnight.'],
    },
  ],
  Lunch: [
    {
      time: 'Lunch', title: 'Mediterranean chicken bowl', ingredients: 'Chicken, quinoa, roasted vegetables, tahini', image: photo('1688923130928-8468d6af8d7e'), goals: ['maintain', 'gain'],
      ingredientsList: ['150 g grilled chicken breast, sliced', '80 g cooked quinoa', '100 g roasted mixed vegetables (zucchini, pepper, red onion)', '1 tbsp tahini', 'Lemon juice and parsley'],
      steps: ['Season and grill the chicken breast, then slice it.', 'Roast the mixed vegetables at 200°C for 20 minutes.', 'Assemble the quinoa, vegetables, and chicken in a bowl.', 'Drizzle with tahini and lemon juice, and finish with parsley.'],
    },
    {
      time: 'Lunch', title: 'Grilled chicken quinoa bowl', ingredients: 'Chicken, quinoa, broccoli, avocado, tomatoes', image: localPhoto('grilled-chicken-quinoa-bowl'), goals: ['maintain'],
      ingredientsList: ['150 g chicken breast', '100 g cooked quinoa', '100 g broccoli', '½ avocado', '6 cherry tomatoes', '1 tsp olive oil', 'Lemon juice, paprika, salt and pepper'],
      steps: ['Season the chicken and grill it until fully cooked, then slice it.', 'Steam the broccoli and warm the cooked quinoa.', 'Arrange everything in a bowl with avocado and tomatoes.', 'Finish with olive oil and lemon juice.'],
    },
    {
      time: 'Lunch', title: 'Chickpea avocado salad', ingredients: 'Chickpeas, quinoa, roasted squash, avocado, hummus', image: localPhoto('chickpea-avocado-salad'), goals: ['lose'],
      ingredientsList: ['100 g roasted butternut squash, cubed', '70 g cooked quinoa', '150 g chickpeas', '½ avocado, sliced', 'A handful of spinach leaves', '6 cherry tomatoes, halved', '2 tbsp hummus'],
      steps: ['Roast the butternut squash cubes at 200°C for 20 minutes.', 'Arrange the quinoa, chickpeas, and spinach in a bowl.', 'Add the roasted squash, avocado, and cherry tomatoes.', 'Finish with a dollop of hummus and a squeeze of lemon.'],
    },
    {
      time: 'Lunch', title: 'Veggie stir fry', ingredients: 'Tofu, peppers, zucchini, pineapple, sesame', image: localPhoto('veggie-stir-fry'), goals: ['lose'],
      ingredientsList: ['200 g firm tofu, cubed', '1 red bell pepper, sliced', '1 green bell pepper, sliced', '1 zucchini, sliced', '80 g pineapple chunks', '1 tbsp soy sauce', '1 tsp sesame seeds'],
      steps: ['Pan-fry the tofu cubes until golden on all sides, then set aside.', 'Stir-fry the peppers and zucchini for 4–5 minutes.', 'Add the pineapple and soy sauce, and toss everything together with the tofu.', 'Sprinkle with sesame seeds and serve hot.'],
    },
    {
      time: 'Lunch', title: 'Beef rice power bowl', ingredients: 'Beef, rice, black beans, pepper, corn', image: photo('1679279726946-a158b8bcaa23'), goals: ['gain'],
      ingredientsList: ['150 g lean beef strips', '180 g cooked rice', '100 g black beans', '½ red pepper', '80 g corn', '1 tsp olive oil', 'Lime juice, paprika, and cumin'],
      steps: ['Cook rice according to its package instructions.', 'Season beef with paprika and cumin, then cook in oil for 4–5 minutes.', 'Warm the beans and corn in a small pan.', 'Build a bowl with rice, vegetables, beans, and beef; finish with lime juice.'],
    },
  ],
  Snack: [
    {
      time: 'Snack', title: 'Apple & peanut butter', ingredients: 'Apple slices with natural peanut butter', image: photo('1609404543812-4b9fdda52a55'), goals: ['maintain', 'gain'],
      ingredientsList: ['1 medium apple, sliced', '2 tbsp natural peanut butter'],
      steps: ['Core and slice the apple into wedges.', 'Serve with peanut butter for dipping.'],
    },
    {
      time: 'Snack', title: 'Berry yogurt parfait', ingredients: 'Greek yogurt, mixed berries, granola', image: localPhoto('berry-yogurt-parfait'), goals: ['lose', 'maintain'],
      ingredientsList: ['200 g Greek yogurt', '100 g mixed berries', '40 g gluten-free granola', '1 tsp honey (optional)'],
      steps: ['Spoon a layer of Greek yogurt into a glass.', 'Add a layer of granola, then a layer of mixed berries.', 'Repeat the layers until the glass is full.'],
    },
    {
      time: 'Snack', title: 'Berry protein smoothie', ingredients: 'Banana, strawberries, pineapple, protein powder', image: localPhoto('berry-protein-smoothie'), goals: ['lose'],
      ingredientsList: ['1 banana', '100 g strawberries', '80 g pineapple chunks', '1 scoop vanilla protein powder', '200 ml plant milk'],
      steps: ['Add the banana, strawberries, pineapple, protein powder, and milk to a blender.', 'Blend until smooth.', 'Pour into a glass and serve immediately.'],
    },
    {
      time: 'Snack', title: 'Peanut butter granola bar', ingredients: 'Granola bar with peanut butter', image: photo('1457713409680-36c1e1a904eb'), goals: ['gain'],
      ingredientsList: ['1 oat granola bar', '1 tbsp peanut butter for dipping', 'Small glass of milk (optional)'],
      steps: ['Warm the peanut butter slightly for easier dipping, if desired.', 'Dip or spread the granola bar with peanut butter.', 'Pair with a glass of milk for extra protein.'],
    },
    {
      time: 'Snack', title: 'Banana date energy bowl', ingredients: 'Banana, dates, almonds, honey', image: photo('1612347104559-9720d69b876a'), goals: ['gain'],
      ingredientsList: ['2 bananas, sliced', '4 medjool dates, chopped', '2 tbsp almonds, chopped', '1 tbsp honey', 'Pinch of cinnamon'],
      steps: ['Slice the bananas into a bowl.', 'Add the chopped dates and almonds.', 'Drizzle with honey and dust with cinnamon.', 'Serve immediately.'],
    },
  ],
  Dinner: [
    {
      time: 'Dinner', title: 'Salmon rice plate', ingredients: 'Salmon, brown rice, broccoli, lemon', image: photo('1623800849430-13c191263e9f'), goals: ['maintain', 'gain'],
      ingredientsList: ['150 g salmon fillet', '150 g cooked brown rice', '120 g steamed broccoli', '1 tsp olive oil', 'Lemon wedge'],
      steps: ['Season the salmon fillet with salt, pepper, and a little olive oil.', 'Bake the salmon at 200°C for 12–15 minutes, or until cooked through.', 'Steam the broccoli until tender.', 'Serve the salmon over brown rice with broccoli, finished with a squeeze of lemon.'],
    },
    {
      time: 'Dinner', title: 'Lemon garlic salmon', ingredients: 'Salmon, garlic, lemon, red onion, microgreens', image: localPhoto('lemon-garlic-salmon'), goals: ['maintain'],
      ingredientsList: ['2 salmon fillets (about 150 g each)', '2 cloves garlic, minced', '1 lemon', '¼ red onion, thinly sliced', 'A handful of microgreens', '1 tbsp olive oil'],
      steps: ['Rub the salmon fillets with garlic, olive oil, salt, and pepper.', 'Pan-sear or bake the salmon for 12–15 minutes until cooked through.', 'Squeeze fresh lemon juice over the fillets.', 'Serve topped with red onion and microgreens.'],
    },
    {
      time: 'Dinner', title: 'Veggie stir fry', ingredients: 'Tofu, peppers, zucchini, pineapple, sesame', image: localPhoto('veggie-stir-fry'), goals: ['lose'],
      ingredientsList: ['200 g firm tofu, cubed', '1 red bell pepper, sliced', '1 green bell pepper, sliced', '1 zucchini, sliced', '80 g pineapple chunks', '1 tbsp soy sauce', '1 tsp sesame seeds'],
      steps: ['Pan-fry the tofu cubes until golden on all sides, then set aside.', 'Stir-fry the peppers and zucchini for 4–5 minutes.', 'Add the pineapple and soy sauce, and toss everything together with the tofu.', 'Sprinkle with sesame seeds and serve hot.'],
    },
    {
      time: 'Dinner', title: 'Chickpea avocado salad', ingredients: 'Chickpeas, quinoa, roasted squash, avocado, hummus', image: localPhoto('chickpea-avocado-salad'), goals: ['lose'],
      ingredientsList: ['100 g roasted butternut squash, cubed', '70 g cooked quinoa', '150 g chickpeas', '½ avocado, sliced', 'A handful of spinach leaves', '6 cherry tomatoes, halved', '2 tbsp hummus'],
      steps: ['Roast the butternut squash cubes at 200°C for 20 minutes.', 'Arrange the quinoa, chickpeas, and spinach in a bowl.', 'Add the roasted squash, avocado, and cherry tomatoes.', 'Finish with a dollop of hummus and a squeeze of lemon.'],
    },
    {
      time: 'Dinner', title: 'Beef rice power bowl', ingredients: 'Beef, rice, black beans, pepper, corn', image: photo('1679279726946-a158b8bcaa23'), goals: ['gain'],
      ingredientsList: ['150 g lean beef strips', '180 g cooked rice', '100 g black beans', '½ red pepper', '80 g corn', '1 tsp olive oil', 'Lime juice, paprika, and cumin'],
      steps: ['Cook rice according to its package instructions.', 'Season beef with paprika and cumin, then cook in oil for 4–5 minutes.', 'Warm the beans and corn in a small pan.', 'Build a bowl with rice, vegetables, beans, and beef; finish with lime juice.'],
    },
  ],
};

// Simple, stable string hash (djb2). It supplies a different starting point for each goal and slot;
// the calendar-day number then advances through that pool one item at a time. This keeps a saved
// date deterministic while guaranteeing that consecutive dates do not select the same dish when a
// pool has at least two options.
function hashString(input: string): number {
  let hash = 5381;
  for (let index = 0; index < input.length; index += 1) hash = ((hash << 5) + hash + input.charCodeAt(index)) >>> 0;
  return hash;
}

function getCalendarDayNumber(date: string): number {
  const [year, month, day] = date.split('-').map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

function pickMeal(time: string, goal: Goal, date: string): MealTemplate {
  const pool = mealPool[time];
  const matching = pool.filter((template) => template.goals.includes(goal));
  const options = matching.length > 0 ? matching : pool;
  const index = (getCalendarDayNumber(date) + hashString(`${goal}-${time}`)) % options.length;
  return options[index];
}

// A weekly flex day (every Sunday) — no fixed menu that day, just a reminder that one planned,
// guilt-free meal is a normal part of a sustainable eating pattern rather than a slip-up.
function isCheatDay(date: string): boolean {
  return new Date(`${date}T00:00:00Z`).getUTCDay() === 0;
}

const mealTimes = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];

// Mifflin-St Jeor formula for resting energy expenditure, scaled by activity level, then adjusted
// for the goal direction. Protein/carbs/fats are then derived from that calorie target, not tracked
// independently — this keeps the macros internally consistent with each other.
export function getTargets(profile: ProfileInput) {
  // Mifflin-St Jeor publishes two equation constants. The profile UI makes this choice explicit;
  // `other` remains a privacy/inclusion option and intentionally uses the -161 equation.
  const equationConstant: Record<ProfileInput['sex'], number> = { male: 5, female: -161, other: -161 };
  const base = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age + equationConstant[profile.sex];
  const factor = { low: 1.2, light: 1.375, moderate: 1.55, high: 1.725 }[profile.activity];
  const adjustment = { lose: -400, maintain: 0, gain: 350 }[profile.goal];
  const calories = Math.round(base * factor + adjustment);
  return { calories, protein: Math.round(profile.weightKg * (profile.goal === 'gain' ? 1.8 : 1.6)), carbs: Math.round(calories * 0.45 / 4), fats: Math.round(calories * 0.25 / 9) };
}

export function buildPlan(profile: ProfileInput, date: string) {
  const targets = getTargets(profile);

  if (isCheatDay(date)) {
    const meals = mealTimes.map((time) => ({
      time,
      title: 'Flex day 🎉',
      ingredients: 'Eat what you enjoy today — no fixed menu.',
      ingredientsList: [] as string[],
      steps: [] as string[],
      calories: 0,
      protein: 0,
      confirmed: null as boolean | null,
    }));
    return { targets, meals, isCheatDay: true, nutritionBasis: 'target-budget' as const };
  }

  const meals = mealTimes.map((time) => {
    const template = pickMeal(time, profile.goal, date);
    const { calorieShare, proteinShare } = SHARES[time];
    return {
      time: template.time,
      title: template.title,
      ingredients: template.ingredients,
      image: template.image,
      ingredientsList: template.ingredientsList,
      steps: template.steps,
      calories: Math.round(targets.calories * calorieShare),
      protein: Math.round(targets.protein * proteinShare),
      confirmed: null as boolean | null,
    };
  });
  return { targets, meals, isCheatDay: false, nutritionBasis: 'target-budget' as const };
}
