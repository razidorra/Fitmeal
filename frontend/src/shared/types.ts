export type Goal = 'lose' | 'maintain' | 'gain';
export interface Profile { _id: string; name: string; age: number; sex: 'female' | 'male' | 'other'; heightCm: number; weightKg: number; activity: 'low' | 'light' | 'moderate' | 'high'; goal: Goal; }
export type MealVerdict = 'great fit' | 'reasonable' | 'poor fit';
export interface MealPlan {
  _id: string;
  targets: { calories: number; protein: number; carbs: number; fats: number };
  meals: { time: string; title: string; ingredients: string; image?: string; calories: number; protein: number; carbs?: number; fats?: number; isCustom?: boolean; verdict?: MealVerdict; note?: string }[];
}
export interface Checkin { _id: string; weightKg: number; note?: string; date: string; }
export interface ChatMessage { role: 'user' | 'assistant'; content: string; }
export interface ProgressReview {
  stats: { goal: Goal; firstWeight: number; latestWeight: number; totalChangeKg: number; weeklyRateKg: number | null; checkinCount: number; onTrack: boolean | null; mealsChecked: number; greatFitCount: number; poorFitCount: number };
  summary: string;
}
