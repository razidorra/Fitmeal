import { Schema, model, type Types } from 'mongoose';

export interface PlannedMeal {
  time: string;
  title: string;
  ingredients: string;
  image?: string;
  calories: number;
  protein: number;
  confirmed: boolean | null;
  isCustom?: boolean;
  originalTitle?: string;
  originalImage?: string;
  ingredientsList?: string[];
  steps?: string[];
  originalIngredientsList?: string[];
  originalSteps?: string[];
}

interface MealPlanRecord {
  profileId: Types.ObjectId;
  date: string;
  nutritionBasis: 'target-budget';
  targets: { calories: number; protein: number; carbs: number; fats: number };
  meals: PlannedMeal[];
  isCheatDay: boolean;
}

const mealSchema = new Schema<PlannedMeal>({
  time: { type: String, required: true, enum: ['Breakfast', 'Lunch', 'Snack', 'Dinner'] },
  title: { type: String, required: true, trim: true, maxlength: 300 },
  ingredients: { type: String, required: true, trim: true, maxlength: 1_000 },
  image: { type: String },
  calories: { type: Number, required: true, min: 0 },
  protein: { type: Number, required: true, min: 0 },
  confirmed: { type: Boolean, default: null },
  isCustom: { type: Boolean },
  originalTitle: { type: String },
  originalImage: { type: String },
  ingredientsList: [{ type: String }],
  steps: [{ type: String }],
  originalIngredientsList: [{ type: String }],
  originalSteps: [{ type: String }],
}, { _id: false });

const mealPlanSchema = new Schema<MealPlanRecord>({
  profileId: { type: Schema.Types.ObjectId, ref: 'Profile', required: true },
  date: { type: String, required: true },
  nutritionBasis: { type: String, required: true, enum: ['target-budget'], default: 'target-budget' },
  targets: {
    calories: { type: Number, required: true, min: 0 },
    protein: { type: Number, required: true, min: 0 },
    carbs: { type: Number, required: true, min: 0 },
    fats: { type: Number, required: true, min: 0 },
  },
  meals: { type: [mealSchema], required: true },
  isCheatDay: { type: Boolean, required: true, default: false },
}, { timestamps: true });

mealPlanSchema.index({ profileId: 1, date: 1 }, { unique: true });

export const MealPlan = model<MealPlanRecord>('MealPlan', mealPlanSchema);
