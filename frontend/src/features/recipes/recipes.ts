import type { Goal } from '../../shared/types';

export interface Recipe {
  slug: string;
  title: string;
  goal: Goal;
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
    slug: 'chicken-quinoa-salad', title: 'Chicken quinoa salad', goal: 'lose', prepMinutes: 25, servings: 1,
    description: 'A filling lunch with lean protein, fibre-rich quinoa, and fresh vegetables.',
    healthNote: 'Protein and fibre can help this meal feel satisfying while keeping the portion balanced.',
    nutrition: { calories: 470, protein: 42, carbs: 43, fats: 14 },
    ingredients: ['120 g chicken breast', '70 g cooked quinoa', '2 handfuls mixed salad leaves', '½ cucumber', '8 cherry tomatoes', '1 tsp olive oil', 'Lemon juice and herbs'],
    steps: ['Season the chicken with herbs, salt, and pepper.', 'Cook the chicken in a non-stick pan for 5–6 minutes per side.', 'Add quinoa, chopped vegetables, and salad leaves to a bowl.', 'Slice the chicken and finish with olive oil and lemon juice.'],
  },
  {
    slug: 'lentil-vegetable-soup', title: 'Lentil vegetable soup', goal: 'lose', prepMinutes: 30, servings: 2,
    description: 'A warm plant-based bowl with lentils, vegetables, and whole-grain bread.',
    healthNote: 'Lentils provide plant protein, iron, and fibre; add vitamin-C-rich vegetables for balance.',
    nutrition: { calories: 410, protein: 22, carbs: 59, fats: 9 },
    ingredients: ['150 g cooked lentils', '1 carrot', '1 celery stalk', '½ onion', '400 ml vegetable stock', '100 g chopped tomatoes', '1 slice whole-grain bread', 'Paprika, cumin, and parsley'],
    steps: ['Dice the carrot, celery, and onion.', 'Cook the vegetables in a pot with a splash of water for 4 minutes.', 'Add lentils, tomatoes, stock, and spices.', 'Simmer for 20 minutes and serve with whole-grain bread.'],
  },
  {
    slug: 'salmon-sweet-potato-plate', title: 'Salmon sweet potato plate', goal: 'maintain', prepMinutes: 35, servings: 1,
    description: 'A balanced dinner with omega-3-rich salmon, complex carbohydrates, and greens.',
    healthNote: 'Salmon contributes omega-3 fats and protein, while sweet potato and broccoli add fibre and micronutrients.',
    nutrition: { calories: 640, protein: 39, carbs: 58, fats: 27 },
    ingredients: ['140 g salmon fillet', '250 g sweet potato', '150 g broccoli', '1 tsp olive oil', 'Lemon wedge', 'Salt, pepper, and dill'],
    steps: ['Heat the oven to 200°C and cut the sweet potato into wedges.', 'Toss the wedges with oil and bake for 25 minutes.', 'Season the salmon and bake beside the potato for the final 12 minutes.', 'Steam broccoli and serve everything with lemon and dill.'],
  },
  {
    slug: 'turkey-avocado-wrap', title: 'Turkey avocado wrap', goal: 'maintain', prepMinutes: 15, servings: 1,
    description: 'A quick whole-grain wrap for busy days, with turkey, avocado, and crunchy vegetables.',
    healthNote: 'The wrap combines protein, unsaturated fats, and vegetables in one practical meal.',
    nutrition: { calories: 570, protein: 36, carbs: 55, fats: 22 },
    ingredients: ['1 whole-grain wrap', '100 g turkey breast slices', '½ avocado', '1 handful spinach', '½ red pepper', '2 tbsp Greek yogurt', 'Lime juice and black pepper'],
    steps: ['Mash avocado with lime juice and black pepper.', 'Spread Greek yogurt and avocado over the wrap.', 'Add turkey, spinach, and sliced red pepper.', 'Roll tightly, cut in half, and serve.'],
  },
  {
    slug: 'peanut-butter-oats', title: 'Peanut butter protein oats', goal: 'gain', prepMinutes: 10, servings: 1,
    description: 'A calorie-dense breakfast made with oats, yogurt, banana, and peanut butter.',
    healthNote: 'Oats provide carbohydrates and fibre, while yogurt and peanut butter increase protein and energy.',
    nutrition: { calories: 760, protein: 38, carbs: 94, fats: 29 },
    ingredients: ['80 g rolled oats', '200 g Greek yogurt', '1 banana', '25 g peanut butter', '150 ml milk', '1 tsp chia seeds', 'Cinnamon'],
    steps: ['Mix oats, milk, yogurt, and cinnamon in a bowl.', 'Top with sliced banana, peanut butter, and chia seeds.', 'Eat immediately or chill overnight for a thicker texture.'],
  },
  {
    slug: 'beef-rice-power-bowl', title: 'Beef rice power bowl', goal: 'gain', prepMinutes: 30, servings: 1,
    description: 'A substantial post-training-style meal with beef, rice, beans, and vegetables.',
    healthNote: 'This bowl adds energy through rice and beans, with protein and iron from lean beef.',
    nutrition: { calories: 850, protein: 51, carbs: 99, fats: 27 },
    ingredients: ['150 g lean beef strips', '180 g cooked rice', '100 g black beans', '½ red pepper', '80 g corn', '1 tsp olive oil', 'Lime juice, paprika, and cumin'],
    steps: ['Cook rice according to its package instructions.', 'Season beef with paprika and cumin, then cook in oil for 4–5 minutes.', 'Warm the beans and corn in a small pan.', 'Build a bowl with rice, vegetables, beans, and beef; finish with lime juice.'],
  },
];

export const goalLabels: Record<Goal, string> = {
  lose: 'Weight loss',
  maintain: 'Maintain weight',
  gain: 'Weight gain',
};
