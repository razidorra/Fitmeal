export type Goal = 'lose' | 'maintain' | 'gain';
export interface Profile { _id: string; name: string; age: number; sex: 'female' | 'male' | 'other'; heightCm: number; weightKg: number; activity: 'low' | 'light' | 'moderate' | 'high'; goal: Goal; }
export interface MealPlan {
  _id: string;
  date: string;
  isCheatDay?: boolean;
  nutritionBasis: 'target-budget';
  targets: { calories: number; protein: number; carbs: number; fats: number };
  meals: { time: string; title: string; originalTitle?: string; ingredients: string; image?: string; originalImage?: string; calories: number; protein: number; isCustom?: boolean; confirmed?: boolean | null; ingredientsList?: string[]; steps?: string[]; originalIngredientsList?: string[]; originalSteps?: string[] }[];
}
export interface Checkin { _id: string; weightKg: number; note?: string; date: string; }
export interface ChatMessage { role: 'user' | 'assistant'; content: string; }
export interface ProgressReview {
  stats: { goal: Goal; firstWeight: number; latestWeight: number; totalChangeKg: number; weeklyRateKg: number | null; checkinCount: number; onTrack: boolean | null; loggedMealCount: number; confirmedMealCount: number; changedMealCount: number };
  summary: string;
}
export interface CustomerReview { _id: string; name: string; rating: number; comment: string; createdAt: string; }
export interface ReviewSummary { reviews: CustomerReview[]; averageRating: number; total: number; }
