import { Router } from 'express';
import { z } from 'zod';
import { Review } from './review.model.js';
import { trimmedText } from '../../shared/validation.js';

export const reviewRouter = Router();

const createReviewSchema = z.object({
  name: trimmedText(2, 60),
  email: z.string().trim().email().max(254).optional(),
  rating: z.number().int().min(1).max(5),
  comment: trimmedText(10, 800),
}).strict();

reviewRouter.get('/', async (_req, res, next) => {
  try {
    const [reviews, statistics] = await Promise.all([
      Review.find().select('name rating comment createdAt').sort({ createdAt: -1 }).limit(30).lean(),
      Review.aggregate<{ averageRating: number; total: number }>([
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

reviewRouter.post('/', async (req, res, next) => {
  try {
    const input = createReviewSchema.parse(req.body);
    const review = await Review.create(input);

    res.status(201).json({
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
