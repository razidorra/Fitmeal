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
    slug: 'grilled-chicken-quinoa-bowl', title: 'Grilled Chicken Quinoa Bowl', goal: 'maintain', category: 'meal', image: '/images/recipes/grilled-chicken-quinoa-bowl.jpg', tags: ['High Protein', 'Gluten Free'], prepMinutes: 25, servings: 1,
    description: 'A balanced high-protein bowl with lean chicken, whole-grain quinoa and colorful vegetables.',
    healthNote: 'Grilled chicken and quinoa provide complete protein and fibre, while broccoli and avocado add vitamins and healthy fats.',
    nutrition: { calories: 550, protein: 52, carbs: 48, fats: 16 },
    ingredients: ['150 g chicken breast', '100 g cooked quinoa', '100 g broccoli', '½ avocado', '6 cherry tomatoes', '1 tsp olive oil', 'Lemon juice, paprika, salt and pepper'],
    steps: ['Season the chicken and grill it until fully cooked, then slice it.', 'Steam the broccoli and warm the cooked quinoa.', 'Arrange everything in a bowl with avocado and tomatoes.', 'Finish with olive oil and lemon juice.'],
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
    slug: 'banana-date-energy-bowl', title: 'Banana date energy bowl', goal: 'gain', category: 'fruit', image: photo('1612347104559-9720d69b876a'), tags: ['Vegetarian', 'Quick & Easy'], prepMinutes: 5, servings: 1,
    description: 'Sliced banana with chopped dates, almonds and a honey drizzle — a naturally calorie-dense way to fuel up.',
    healthNote: 'Bananas and dates provide quick natural energy, while almonds add healthy fats and a bit of protein to round out the bowl.',
    nutrition: { calories: 320, protein: 6, carbs: 55, fats: 10 },
    ingredients: ['2 bananas, sliced', '4 medjool dates, chopped', '2 tbsp almonds, chopped', '1 tbsp honey', 'Pinch of cinnamon'],
    steps: ['Slice the bananas into a bowl.', 'Add the chopped dates and almonds.', 'Drizzle with honey and dust with cinnamon.', 'Serve immediately.'],
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
    slug: 'date-pistachio-parfait', title: 'Date & pistachio yogurt parfait', goal: 'lose', category: 'dessert', image: '/images/recipes/date-pistachio-parfait.jpg', tags: ['Vegetarian', 'Gluten Free'], prepMinutes: 10, servings: 1,
    description: 'Layers of creamy yogurt and chopped dates, finished with pistachios and almonds — a naturally sweet treat with no added sugar needed.',
    healthNote: 'Dates provide natural sweetness and fibre, while Greek yogurt and nuts add protein and healthy fats to keep this dessert satisfying in a modest portion.',
    nutrition: { calories: 280, protein: 12, carbs: 42, fats: 9 },
    ingredients: ['150 g Greek yogurt', '6 medjool dates, chopped (plus 2 whole for topping)', '1 tbsp chopped pistachios', '1 tbsp chopped almonds', 'Drizzle of honey (optional)'],
    steps: ['Layer half the chopped dates in the bottom of a glass.', 'Spoon the Greek yogurt over the dates.', 'Top with chopped pistachios, almonds, and the whole dates.', 'Drizzle with honey if using, and serve immediately.'],
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
  {
    slug: 'protein-oatmeal', title: 'Protein Oatmeal', goal: 'lose', category: 'meal', image: '/images/recipes/protein-oatmeal.jpg', tags: ['High Protein', 'Vegetarian'], prepMinutes: 10, servings: 1,
    description: 'A warm, protein-boosted oatmeal topped with banana, blueberries and walnuts.',
    healthNote: 'Oats provide slow-release carbohydrates and fibre, while added protein powder and walnuts round out a balanced start to the day.',
    nutrition: { calories: 420, protein: 28, carbs: 50, fats: 12 },
    ingredients: ['60 g rolled oats', '200 ml milk', '1 scoop vanilla protein powder', '1 banana, sliced', '80 g blueberries', '1 tbsp chopped walnuts', 'Fresh mint to garnish'],
    steps: ['Cook the oats with milk over low heat, stirring, for 5 minutes.', 'Stir in the protein powder once the oats have cooled slightly.', 'Top with banana, blueberries, and walnuts.', 'Garnish with fresh mint and serve warm.'],
  },
  {
    slug: 'lemon-garlic-salmon', title: 'Lemon Garlic Salmon', goal: 'maintain', category: 'meal', image: '/images/recipes/lemon-garlic-salmon.jpg', tags: ['High Protein', 'Low Carb'], prepMinutes: 25, servings: 2,
    description: 'Pan-seared salmon fillets finished with garlic, lemon and fresh microgreens.',
    healthNote: 'Salmon is rich in omega-3 fats and high-quality protein, making this a light, low-carb dinner option.',
    nutrition: { calories: 580, protein: 45, carbs: 10, fats: 40 },
    ingredients: ['2 salmon fillets (about 150 g each)', '2 cloves garlic, minced', '1 lemon', '¼ red onion, thinly sliced', 'A handful of microgreens or cress', '1 tbsp olive oil', 'Salt and pepper'],
    steps: ['Rub the salmon fillets with garlic, olive oil, salt, and pepper.', 'Pan-sear or bake the salmon for 12–15 minutes until cooked through.', 'Squeeze fresh lemon juice over the fillets.', 'Serve topped with red onion and microgreens.'],
  },
  {
    slug: 'chickpea-avocado-salad', title: 'Chickpea Avocado Salad', goal: 'lose', category: 'meal', image: '/images/recipes/chickpea-avocado-salad.jpg', tags: ['Vegan', 'High Fiber'], prepMinutes: 15, servings: 1,
    description: 'A colourful bowl of roasted squash, quinoa, chickpeas and avocado with a hummus finish.',
    healthNote: 'Chickpeas and quinoa combine plant protein with fibre, while roasted squash and avocado add vitamins and healthy fats.',
    nutrition: { calories: 350, protein: 15, carbs: 40, fats: 14 },
    ingredients: ['100 g roasted butternut squash, cubed', '70 g cooked quinoa', '150 g chickpeas', '½ avocado, sliced', 'A handful of spinach leaves', '6 cherry tomatoes, halved', '2 tbsp hummus', 'Lemon wedge'],
    steps: ['Roast the butternut squash cubes at 200°C for 20 minutes.', 'Arrange the quinoa, chickpeas, and spinach in a bowl.', 'Add the roasted squash, avocado, and cherry tomatoes.', 'Finish with a dollop of hummus and a squeeze of lemon.'],
  },
  {
    slug: 'avocado-toast', title: 'Avocado Toast', goal: 'lose', category: 'meal', image: '/images/recipes/avocado-toast.jpg', tags: ['Vegetarian', 'Quick & Easy'], prepMinutes: 10, servings: 1,
    description: 'Crisp sourdough topped with creamy avocado, chili flakes and mixed seeds.',
    healthNote: 'Avocado provides unsaturated fats and fibre, and mixed seeds add a little extra protein and crunch.',
    nutrition: { calories: 320, protein: 12, carbs: 32, fats: 16 },
    ingredients: ['1 thick slice sourdough bread, toasted', '1 ripe avocado', '½ tsp chili flakes', '1 tsp mixed seeds', 'Squeeze of lemon juice', 'Salt and pepper'],
    steps: ['Toast the sourdough until golden and crisp.', 'Mash or thinly slice the avocado and fan it over the toast.', 'Drizzle with lemon juice and season with salt and pepper.', 'Finish with chili flakes and mixed seeds.'],
  },
  {
    slug: 'berry-protein-smoothie', title: 'Berry Protein Smoothie', goal: 'lose', category: 'smoothie', image: '/images/recipes/berry-protein-smoothie.jpg', tags: ['High Protein', 'Vegan'], prepMinutes: 5, servings: 1,
    description: 'A fruity, protein-packed smoothie blending banana, strawberries and pineapple.',
    healthNote: 'Blending fruit with a plant protein powder turns a simple smoothie into a more balanced, filling option.',
    nutrition: { calories: 280, protein: 25, carbs: 35, fats: 4 },
    ingredients: ['1 banana', '100 g strawberries', '80 g pineapple chunks', '1 scoop vanilla protein powder', '200 ml plant milk', 'A few raspberries to garnish'],
    steps: ['Add the banana, strawberries, pineapple, protein powder, and milk to a blender.', 'Blend until smooth.', 'Pour into a glass and top with raspberries.', 'Serve immediately with a straw.'],
  },
  {
    slug: 'veggie-stir-fry', title: 'Veggie Stir Fry', goal: 'lose', category: 'meal', image: '/images/recipes/veggie-stir-fry.jpg', tags: ['Vegetarian', 'Low Fat'], prepMinutes: 20, servings: 1,
    description: 'A quick sizzling stir-fry of tofu, peppers, zucchini and pineapple.',
    healthNote: 'Tofu adds plant protein while colourful vegetables keep this stir-fry light, fibre-rich and low in saturated fat.',
    nutrition: { calories: 420, protein: 22, carbs: 50, fats: 15 },
    ingredients: ['200 g firm tofu, cubed', '1 red bell pepper, sliced', '1 green bell pepper, sliced', '1 zucchini, sliced', '80 g pineapple chunks', '1 tbsp soy sauce', '1 tsp sesame seeds', '1 tsp sesame oil'],
    steps: ['Pan-fry the tofu cubes until golden on all sides, then set aside.', 'Stir-fry the peppers and zucchini in sesame oil for 4–5 minutes.', 'Add the pineapple and soy sauce, and toss everything together with the tofu.', 'Sprinkle with sesame seeds and serve hot.'],
  },
  {
    slug: 'berry-yogurt-parfait', title: 'Berry Yogurt Parfait', goal: 'lose', category: 'snack', image: '/images/recipes/berry-yogurt-parfait.jpg', tags: ['Vegetarian', 'Gluten Free'], prepMinutes: 10, servings: 1,
    description: 'Layers of Greek yogurt, mixed berries and gluten-free granola.',
    healthNote: 'Greek yogurt adds protein and calcium, while berries contribute antioxidants and fibre without much added sugar.',
    nutrition: { calories: 290, protein: 19, carbs: 35, fats: 8 },
    ingredients: ['200 g Greek yogurt', '100 g mixed berries (blackberries, strawberries)', '40 g gluten-free granola', '1 tsp honey (optional)'],
    steps: ['Spoon a layer of Greek yogurt into a glass.', 'Add a layer of granola, then a layer of mixed berries.', 'Repeat the layers until the glass is full.', 'Drizzle with honey if using, and top with extra berries.'],
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
