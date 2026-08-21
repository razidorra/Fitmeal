import { Schema, model } from 'mongoose';

const mealPlanSchema = new Schema({
  profileId: { type: Schema.Types.ObjectId, ref: 'Profile', required: true },
  date: { type: String, index: true }, // "YYYY-MM-DD" in the user's own local day, not the server's.
  // Optional (not required) so old plans from before this field existed keep working — they just
  // never match a dated query. "One plan per day" is enforced in the route (get-or-create), not
  // by a DB constraint, so those old undated rows never collide with anything.
  targets: Object,
  meals: Array,
}, { timestamps: true });

export const MealPlan = model('MealPlan', mealPlanSchema);
