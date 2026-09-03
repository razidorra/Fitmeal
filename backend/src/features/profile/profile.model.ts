import { Schema, model } from 'mongoose';

export type Goal = 'lose' | 'maintain' | 'gain';
export interface ProfileInput { name: string; age: number; sex: 'female' | 'male' | 'other'; heightCm: number; weightKg: number; activity: 'low' | 'light' | 'moderate' | 'high'; goal: Goal; clerkUserId: string; }

const profileSchema = new Schema<ProfileInput>({
  name: { type: String, required: true, trim: true, minlength: 1, maxlength: 80 },
  age: { type: Number, required: true, min: 16, max: 100 },
  sex: { type: String, required: true, enum: ['female', 'male', 'other'] },
  heightCm: { type: Number, required: true, min: 100, max: 250 },
  weightKg: { type: Number, required: true, min: 30, max: 350 },
  activity: { type: String, required: true, enum: ['low', 'light', 'moderate', 'high'] },
  goal: { type: String, required: true, enum: ['lose', 'maintain', 'gain'] },
  clerkUserId: { type: String, required: true, unique: true },
}, { timestamps: true });
export const Profile = model<ProfileInput>('Profile', profileSchema);
