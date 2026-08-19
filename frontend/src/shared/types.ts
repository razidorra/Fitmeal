export type Goal = 'lose' | 'maintain' | 'gain';
export interface Profile { _id: string; name: string; age: number; sex: 'female' | 'male' | 'other'; heightCm: number; weightKg: number; activity: 'low' | 'light' | 'moderate' | 'high'; goal: Goal; }
export interface MealPlan { _id: string; targets: { calories: number; protein: number; carbs: number; fats: number }; meals: { time: string; title: string; ingredients: string; calories: number; protein: number }[]; }
export interface Checkin { _id: string; weightKg: number; note?: string; date: string; }
