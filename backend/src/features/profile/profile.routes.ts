import { Router } from 'express';
import { z } from 'zod';
import { Profile } from './profile.model.js';
import { requireUserId } from '../../shared/auth.js';

const profileSchema = z.object({ name: z.string().min(1), age: z.number().min(16).max(100), sex: z.enum(['female', 'male', 'other']), heightCm: z.number().min(100).max(250), weightKg: z.number().min(30).max(350), activity: z.enum(['low', 'light', 'moderate', 'high']), goal: z.enum(['lose', 'maintain', 'gain']) });

export const profileRouter = Router();

// Every route here is scoped to the signed-in Clerk user (clerkUserId), so one account can never
// read or overwrite another account's profile.
profileRouter.get('/latest', async (req, res, next) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    res.json(await Profile.findOne({ clerkUserId: userId }).sort({ createdAt: -1 }));
  } catch (error) {
    next(error);
  }
});

profileRouter.post('/', async (req, res, next) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const data = profileSchema.parse(req.body);
    res.status(201).json(await Profile.create({ ...data, clerkUserId: userId }));
  } catch (error) {
    next(error);
  }
});

profileRouter.patch('/:profileId', async (req, res, next) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const profile = await Profile.findOne({ _id: req.params.profileId, clerkUserId: userId }).catch(() => null);
    if (!profile) { res.status(404).json({ message: 'Profile not found' }); return; }

    const data = profileSchema.parse(req.body);
    profile.set(data);
    await profile.save();
    res.json(profile);
  } catch (error) {
    next(error);
  }
});
