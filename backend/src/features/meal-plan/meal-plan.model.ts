import { Schema, model } from 'mongoose';
const mealPlanSchema = new Schema({ profileId: { type: Schema.Types.ObjectId, ref: 'Profile', required: true }, targets: Object, meals: Array }, { timestamps: true });
export const MealPlan = model('MealPlan', mealPlanSchema);
