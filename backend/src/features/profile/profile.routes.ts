import { Router } from 'express';
import { z } from 'zod';
import { Profile } from './profile.model.js';
import { MealPlan } from '../meal-plan/meal-plan.model.js';
import { Checkin } from '../progress/checkin.model.js';
import { Review } from '../review/review.model.js';
import { requireUserId } from '../../shared/auth.js';
import { trimmedText } from '../../shared/validation.js';

const profileSchema = z.object({
  name: trimmedText(1, 80),
  age: z.number().int().min(16).max(100),
  sex: z.enum(['female', 'male', 'other']),
  heightCm: z.number().min(100).max(250),
  weightKg: z.number().min(30).max(350),
  activity: z.enum(['low', 'light', 'moderate', 'high']),
  goal: z.enum(['lose', 'maintain', 'gain']),
}).strict();

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
    const existingProfile = await Profile.exists({ clerkUserId: userId });
    if (existingProfile) { res.status(409).json({ message: 'A profile already exists for this account.' }); return; }

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

    const data = profileSchema.partial().refine((value) => Object.keys(value).length > 0, 'Provide at least one profile field.').parse(req.body);
    profile.set(data);
    await profile.save();
    await Review.updateOne({ profileId: profile._id }, { name: profile.name });
    res.json(profile);
  } catch (error) {
    next(error);
  }
});

profileRouter.delete('/:profileId', async (req, res, next) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const profile = await Profile.findOne({ _id: req.params.profileId, clerkUserId: userId }).catch(() => null);
    if (!profile) { res.status(404).json({ message: 'Profile not found' }); return; }

    // Delete account-scoped dependent records before the profile they belong to. The Clerk
    // identity itself is managed separately by Clerk and is intentionally not removed here.
    await Promise.all([
      MealPlan.deleteMany({ profileId: profile._id }),
      Checkin.deleteMany({ profileId: profile._id }),
      Review.deleteMany({ profileId: profile._id }),
    ]);
    await profile.deleteOne();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
