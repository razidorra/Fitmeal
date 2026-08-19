import { Schema, model } from 'mongoose';

export type Goal = 'lose' | 'maintain' | 'gain';
export interface ProfileInput { name: string; age: number; sex: 'female' | 'male' | 'other'; heightCm: number; weightKg: number; activity: 'low' | 'light' | 'moderate' | 'high'; goal: Goal; }

const profileSchema = new Schema<ProfileInput>({
  name: { type: String, required: true, trim: true }, age: { type: Number, required: true }, sex: { type: String, required: true },
  heightCm: { type: Number, required: true }, weightKg: { type: Number, required: true }, activity: { type: String, required: true }, goal: { type: String, required: true },
}, { timestamps: true });
export const Profile = model<ProfileInput>('Profile', profileSchema);
