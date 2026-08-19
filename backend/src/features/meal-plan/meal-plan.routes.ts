import { Router } from 'express';
import { Profile } from '../profile/profile.model.js';
import { MealPlan } from './meal-plan.model.js';
import { buildPlan } from './meal-plan.service.js';
export const mealPlanRouter = Router();
mealPlanRouter.post('/generate/:profileId', async (req, res) => { const profile = await Profile.findById(req.params.profileId); if (!profile) return res.status(404).json({ message: 'Profile not found' }); const plan = buildPlan(profile); res.status(201).json(await MealPlan.create({ profileId: profile.id, ...plan })); });
mealPlanRouter.get('/latest/:profileId', async (req, res) => res.json(await MealPlan.findOne({ profileId: req.params.profileId }).sort({ createdAt: -1 })));
