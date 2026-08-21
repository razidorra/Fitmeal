import type { Goal } from '../../shared/types';

// Unsplash photo ids -> a ready-to-use, sized CDN url.
function photo(id: string) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;
}

export type RecipeCategory = 'meal' | 'fruit' | 'snack' | 'dessert' | 'smoothie';

export interface Recipe {
  slug: string;
  title: string;
  goal: Goal;
  category: RecipeCategory;
  image: string;
  tags: string[];
  description: string;
  healthNote: string;
  prepMinutes: number;
  servings: number;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  ingredients: string[];
  steps: string[];
}

export const recipes: Recipe[] = [
  {
    slug: 'chicken-quinoa-salad', title: 'Chicken quinoa salad', goal: 'lose', category: 'meal', image: photo('1688923130928-8468d6af8d7e'), tags: ['High Protein', 'Gluten Free'], prepMinutes: 25, servings: 1,
    description: 'A filling lunch with lean protein, fibre-rich quinoa, and fresh vegetables.',
    healthNote: 'Protein and fibre can help this meal feel satisfying while keeping the portion balanced.',
    nutrition: { calories: 470, protein: 42, carbs: 43, fats: 14 },
    ingredients: ['120 g chicken breast', '70 g cooked quinoa', '2 handfuls mixed salad leaves', '½ cucumber', '8 cherry tomatoes', '1 tsp olive oil', 'Lemon juice and herbs'],
    steps: ['Season the chicken with herbs, salt, and pepper.', 'Cook the chicken in a non-stick pan for 5–6 minutes per side.', 'Add quinoa, chopped vegetables, and salad leaves to a bowl.', 'Slice the chicken and finish with olive oil and lemon juice.'],
  },
  {
    slug: 'lentil-vegetable-soup', title: 'Lentil vegetable soup', goal: 'lose', category: 'meal', image: photo('1559561723-c3f4195835db'), tags: ['Vegan', 'High Fiber'], prepMinutes: 30, servings: 2,
    description: 'A warm plant-based bowl with lentils, vegetables, and whole-grain bread.',
    healthNote: 'Lentils provide plant protein, iron, and fibre; add vitamin-C-rich vegetables for balance.',
    nutrition: { calories: 410, protein: 22, carbs: 59, fats: 9 },
    ingredients: ['150 g cooked lentils', '1 carrot', '1 celery stalk', '½ onion', '400 ml vegetable stock', '100 g chopped tomatoes', '1 slice whole-grain bread', 'Paprika, cumin, and parsley'],
    steps: ['Dice the carrot, celery, and onion.', 'Cook the vegetables in a pot with a splash of water for 4 minutes.', 'Add lentils, tomatoes, stock, and spices.', 'Simmer for 20 minutes and serve with whole-grain bread.'],
  },
  {
    slug: 'salmon-sweet-potato-plate', title: 'Salmon sweet potato plate', goal: 'maintain', category: 'meal', image: photo('1727056353458-d985e6aa06b4'), tags: ['High Protein', 'Gluten Free'], prepMinutes: 35, servings: 1,
    description: 'A balanced dinner with omega-3-rich salmon, complex carbohydrates, and greens.',
    healthNote: 'Salmon contributes omega-3 fats and protein, while sweet potato and broccoli add fibre and micronutrients.',
    nutrition: { calories: 640, protein: 39, carbs: 58, fats: 27 },
    ingredients: ['140 g salmon fillet', '250 g sweet potato', '150 g broccoli', '1 tsp olive oil', 'Lemon wedge', 'Salt, pepper, and dill'],
    steps: ['Heat the oven to 200°C and cut the sweet potato into wedges.', 'Toss the wedges with oil and bake for 25 minutes.', 'Season the salmon and bake beside the potato for the final 12 minutes.', 'Steam broccoli and serve everything with lemon and dill.'],
  },
  {
    slug: 'turkey-avocado-wrap', title: 'Turkey avocado wrap', goal: 'maintain', category: 'meal', image: photo('1762631383439-18ca3151e825'), tags: ['Quick & Easy', 'High Protein'], prepMinutes: 15, servings: 1,
    description: 'A quick whole-grain wrap for busy days, with turkey, avocado, and crunchy vegetables.',
    healthNote: 'The wrap combines protein, unsaturated fats, and vegetables in one practical meal.',
    nutrition: { calories: 570, protein: 36, carbs: 55, fats: 22 },
    ingredients: ['1 whole-grain wrap', '100 g turkey breast slices', '½ avocado', '1 handful spinach', '½ red pepper', '2 tbsp Greek yogurt', 'Lime juice and black pepper'],
    steps: ['Mash avocado with lime juice and black pepper.', 'Spread Greek yogurt and avocado over the wrap.', 'Add turkey, spinach, and sliced red pepper.', 'Roll tightly, cut in half, and serve.'],
  },
  {
    slug: 'peanut-butter-oats', title: 'Peanut butter protein oats', goal: 'gain', category: 'meal', image: photo('1682622110332-d50f50b7146d'), tags: ['Vegetarian', 'High Protein'], prepMinutes: 10, servings: 1,
    description: 'A calorie-dense breakfast made with oats, yogurt, banana, and peanut butter.',
    healthNote: 'Oats provide carbohydrates and fibre, while yogurt and peanut butter increase protein and energy.',
    nutrition: { calories: 760, protein: 38, carbs: 94, fats: 29 },
    ingredients: ['80 g rolled oats', '200 g Greek yogurt', '1 banana', '25 g peanut butter', '150 ml milk', '1 tsp chia seeds', 'Cinnamon'],
    steps: ['Mix oats, milk, yogurt, and cinnamon in a bowl.', 'Top with sliced banana, peanut butter, and chia seeds.', 'Eat immediately or chill overnight for a thicker texture.'],
  },
  {
    slug: 'beef-rice-power-bowl', title: 'Beef rice power bowl', goal: 'gain', category: 'meal', image: photo('1679279726946-a158b8bcaa23'), tags: ['High Protein', 'Gluten Free'], prepMinutes: 30, servings: 1,
    description: 'A substantial post-training-style meal with beef, rice, beans, and vegetables.',
    healthNote: 'This bowl adds energy through rice and beans, with protein and iron from lean beef.',
    nutrition: { calories: 850, protein: 51, carbs: 99, fats: 27 },
    ingredients: ['150 g lean beef strips', '180 g cooked rice', '100 g black beans', '½ red pepper', '80 g corn', '1 tsp olive oil', 'Lime juice, paprika, and cumin'],
    steps: ['Cook rice according to its package instructions.', 'Season beef with paprika and cumin, then cook in oil for 4–5 minutes.', 'Warm the beans and corn in a small pan.', 'Build a bowl with rice, vegetables, beans, and beef; finish with lime juice.'],
  },
  {
    slug: 'mixed-berry-fruit-bowl', title: 'Mixed berry fruit bowl', goal: 'lose', category: 'fruit', image: photo('1493770348161-369560ae357d'), tags: ['Vegetarian', 'Low Calorie'], prepMinutes: 5, servings: 1,
    description: 'A refreshing bowl of mixed berries with a light yogurt drizzle — a naturally sweet way to add vitamins and fibre.',
    healthNote: 'Berries are rich in fibre and antioxidants while staying low in calories, making this a satisfying light option.',
    nutrition: { calories: 150, protein: 5, carbs: 30, fats: 2 },
    ingredients: ['150 g mixed berries (strawberries, blueberries, raspberries)', '2 tbsp Greek yogurt', 'Fresh mint leaves', '1 tsp honey (optional)'],
    steps: ['Rinse and slice the strawberries.', 'Combine all berries in a bowl.', 'Drizzle with Greek yogurt and honey.', 'Garnish with fresh mint and serve chilled.'],
  },
  {
    slug: 'tropical-mango-pineapple-bowl', title: 'Tropical mango pineapple bowl', goal: 'maintain', category: 'fruit', image: photo('1596120275998-93d9d2ffeca4'), tags: ['Vegan', 'High Fiber'], prepMinutes: 10, servings: 1,
    description: 'A bright, vitamin-C-packed bowl of mango, pineapple, and lime — a tropical way to stay hydrated and refreshed.',
    healthNote: 'Mango and pineapple provide vitamin C and digestive enzymes, offering a naturally sweet, hydrating snack.',
    nutrition: { calories: 180, protein: 3, carbs: 42, fats: 1 },
    ingredients: ['100 g mango, cubed', '100 g pineapple, cubed', '½ lime, juiced', 'Handful of shredded coconut', 'Fresh mint'],
    steps: ['Cube the mango and pineapple.', 'Toss with fresh lime juice.', 'Top with shredded coconut and mint.', 'Serve chilled.'],
  },
  {
    slug: 'hummus-broccoli-dippers', title: 'Hummus & broccoli dippers', goal: 'lose', category: 'snack', image: photo('1627045812165-cda2825d1e30'), tags: ['Vegan', 'High Fiber'], prepMinutes: 10, servings: 1,
    description: 'A crunchy, plant-based snack pairing creamy hummus with fresh broccoli and vegetable dippers.',
    healthNote: 'Chickpea-based hummus adds plant protein and fibre, helping keep this snack filling without excess calories.',
    nutrition: { calories: 220, protein: 9, carbs: 22, fats: 11 },
    ingredients: ['4 tbsp hummus', '100 g broccoli florets', '1 carrot, cut into sticks', '½ cucumber, cut into sticks', 'Paprika to garnish'],
    steps: ['Blanch the broccoli florets briefly, if desired.', 'Arrange broccoli, carrot, and cucumber sticks on a plate.', 'Spoon hummus into a small bowl at the centre.', 'Sprinkle with paprika and serve.'],
  },
  {
    slug: 'peanut-butter-granola-bar', title: 'Peanut butter granola bar', goal: 'gain', category: 'snack', image: photo('1457713409680-36c1e1a904eb'), tags: ['Quick & Easy', 'High Protein'], prepMinutes: 5, servings: 1,
    description: 'A grab-and-go granola bar with peanut butter and oats — an easy way to add energy between meals.',
    healthNote: 'Oats and peanut butter combine slow-release carbohydrates with protein and healthy fats for lasting energy.',
    nutrition: { calories: 240, protein: 8, carbs: 28, fats: 11 },
    ingredients: ['1 oat granola bar', '1 tbsp peanut butter for dipping', 'Small glass of milk (optional)'],
    steps: ['Warm the peanut butter slightly for easier dipping, if desired.', 'Dip or spread the granola bar with peanut butter.', 'Pair with a glass of milk for extra protein.'],
  },
  {
    slug: 'chocolate-protein-mug-cake', title: 'Chocolate protein mug cake', goal: 'gain', category: 'dessert', image: photo('1578985545062-69928b1d9587'), tags: ['High Protein', 'Quick & Easy'], prepMinutes: 5, servings: 1,
    description: 'A rich, single-serving chocolate cake made in a mug and ready in minutes — a dessert that still supports your protein goal.',
    healthNote: 'Using protein powder in place of some flour boosts the protein content of this treat without sacrificing flavour.',
    nutrition: { calories: 310, protein: 20, carbs: 32, fats: 11 },
    ingredients: ['1 scoop chocolate protein powder', '3 tbsp oat flour', '1 egg', '3 tbsp milk', '½ tsp baking powder', '1 tsp cocoa powder', 'A few dark chocolate chips'],
    steps: ['Whisk the egg, milk, protein powder, oat flour, cocoa, and baking powder in a mug.', 'Stir in the chocolate chips.', 'Microwave for 60–90 seconds until set.', 'Let cool slightly before eating.'],
  },
  {
    slug: 'chocolate-dipped-strawberries', title: 'Chocolate-dipped strawberries', goal: 'maintain', category: 'dessert', image: photo('1737587540791-e52d903f4b03'), tags: ['Vegetarian', 'Gluten Free'], prepMinutes: 15, servings: 2,
    description: 'Fresh strawberries dipped in melted dark chocolate — an elegant, portion-controlled way to satisfy a sweet craving.',
    healthNote: 'Dark chocolate provides antioxidants, and pairing it with fruit naturally limits added sugar compared to many desserts.',
    nutrition: { calories: 180, protein: 3, carbs: 24, fats: 8 },
    ingredients: ['200 g fresh strawberries', '60 g dark chocolate (70%+)', '1 tsp coconut oil'],
    steps: ['Melt the dark chocolate with coconut oil over a double boiler or in short microwave bursts.', 'Wash and thoroughly dry the strawberries.', 'Dip each strawberry halfway into the melted chocolate.', 'Place on parchment paper and chill for 15 minutes until set.'],
  },
  {
    slug: 'green-protein-smoothie', title: 'Green protein smoothie', goal: 'lose', category: 'smoothie', image: photo('1759524323778-436094781e5b'), tags: ['High Protein', 'Vegetarian'], prepMinutes: 5, servings: 1,
    description: 'A vibrant blend of spinach, banana, and protein powder — a fast, nutrient-dense way to start the day or refuel.',
    healthNote: 'Spinach adds iron, fibre, and micronutrients while staying very low in calories, letting the protein and fruit lead the flavour.',
    nutrition: { calories: 260, protein: 24, carbs: 28, fats: 6 },
    ingredients: ['1 handful spinach', '1 banana', '1 scoop vanilla protein powder', '200 ml unsweetened almond milk', 'Ice cubes'],
    steps: ['Add spinach, banana, protein powder, and almond milk to a blender.', 'Blend until smooth.', 'Add ice and blend again to chill.', 'Pour into a glass and serve immediately.'],
  },
  {
    slug: 'berry-banana-protein-smoothie', title: 'Berry banana protein smoothie', goal: 'gain', category: 'smoothie', image: photo('1645783916385-1c99860a2a42'), tags: ['High Protein', 'Quick & Easy'], prepMinutes: 5, servings: 1,
    description: 'A thick, calorie-dense smoothie blending berries, banana, oats, and protein — built to support a weight-gain goal.',
    healthNote: 'Combining oats, banana, and protein powder makes this smoothie energy-dense while still delivering fibre and protein.',
    nutrition: { calories: 380, protein: 28, carbs: 52, fats: 8 },
    ingredients: ['1 banana', '150 g mixed frozen berries', '40 g rolled oats', '1 scoop protein powder', '250 ml whole milk', '1 tbsp peanut butter'],
    steps: ['Add all ingredients to a blender.', 'Blend until smooth and creamy.', 'Add more milk if too thick.', 'Pour into a large glass and serve.'],
  },
];

export const goalLabels: Record<Goal, string> = {
  lose: 'Weight loss',
  maintain: 'Maintain weight',
  gain: 'Weight gain',
};

export const categoryLabels: Record<RecipeCategory, string> = {
  meal: 'Meals',
  fruit: 'Fruits',
  snack: 'Snacks',
  dessert: 'Desserts',
  smoothie: 'Smoothies',
};
