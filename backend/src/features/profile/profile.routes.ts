import { Router } from 'express';
import { z } from 'zod';
import { Profile } from './profile.model.js';

const profileSchema = z.object({ name: z.string().min(1), age: z.number().min(16).max(100), sex: z.enum(['female', 'male', 'other']), heightCm: z.number().min(100).max(250), weightKg: z.number().min(30).max(350), activity: z.enum(['low', 'light', 'moderate', 'high']), goal: z.enum(['lose', 'maintain', 'gain']) });
export const profileRouter = Router();
profileRouter.get('/latest', async (_req, res) => res.json(await Profile.findOne().sort({ createdAt: -1 })));
profileRouter.post('/', async (req, res) => res.status(201).json(await Profile.create(profileSchema.parse(req.body))));
