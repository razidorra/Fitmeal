import { Router } from 'express';
import { z } from 'zod';
import { Review } from './review.model.js';
import { Profile } from '../profile/profile.model.js';
import { requireUserId } from '../../shared/auth.js';
import { trimmedText } from '../../shared/validation.js';

export const reviewRouter = Router();
const verifiedReviewFilter = { profileId: { $exists: true }, clerkUserId: { $exists: true } };

const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: trimmedText(10, 800),
}).strict();

reviewRouter.get('/', async (_req, res, next) => {
  try {
    const [reviews, statistics] = await Promise.all([
      Review.find(verifiedReviewFilter).select('name rating comment createdAt').sort({ createdAt: -1 }).limit(30).lean(),
      Review.aggregate<{ averageRating: number; total: number }>([
        { $match: verifiedReviewFilter },
        { $group: { _id: null, averageRating: { $avg: '$rating' }, total: { $sum: 1 } } },
      ]),
    ]);
    const averageRating = statistics[0]?.averageRating ?? 0;
    const total = statistics[0]?.total ?? 0;

    res.json({ reviews, averageRating, total });
  } catch (error) {
    next(error);
  }
});

reviewRouter.get('/mine', async (req, res, next) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const review = await Review.findOne({ clerkUserId: userId }).select('name rating comment createdAt').lean();
    res.json(review);
  } catch (error) {
    next(error);
  }
});

reviewRouter.post('/', async (req, res, next) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const profile = await Profile.findOne({ clerkUserId: userId });
    if (!profile) {
      res.status(404).json({ message: 'Create your FitMeal profile before leaving a review.' });
      return;
    }

    const input = createReviewSchema.parse(req.body);
    const review = await Review.findOneAndUpdate(
      { clerkUserId: userId },
      { profileId: profile._id, clerkUserId: userId, name: profile.name, ...input },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    );

    res.json({
      _id: review.id,
      name: review.name,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
    });
  } catch (error) {
    next(error);
  }
});
