import cors from 'cors';
import express from 'express';
import { clerkMiddleware } from '@clerk/express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { assistantRouter } from './features/assistant/assistant.routes.js';
import { mealPlanRouter } from './features/meal-plan/meal-plan.routes.js';
import { profileRouter } from './features/profile/profile.routes.js';
import { progressRouter } from './features/progress/progress.routes.js';
import { reviewRouter } from './features/review/review.routes.js';
import { contactRouter } from './features/contact/contact.routes.js';
import { env } from './config/env.js';

export const app = express();

class CorsOriginError extends Error {}

app.disable('x-powered-by');
if (env.nodeEnv === 'production') app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || env.nodeEnv !== 'production' || env.corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new CorsOriginError('Origin is not allowed by CORS.'));
  },
}));
app.use(express.json({ limit: '64kb' }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again shortly.' },
});

const assistantLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Assistant request limit reached. Please try again later.' },
});

const reviewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many reviews submitted. Please try again later.' },
});

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many messages submitted. Please try again later.' },
});

app.use('/api', apiLimiter);
if (env.clerkPublishableKey && env.clerkSecretKey) app.use(clerkMiddleware());

app.get('/api/health', (_req, res) => {
  const isDatabaseReady = mongoose.connection.readyState === 1;
  res.status(isDatabaseReady ? 200 : 503).json({
    ok: isDatabaseReady,
    database: isDatabaseReady ? 'connected' : 'disconnected',
  });
});

app.use('/api/profiles', profileRouter);
app.use('/api/meal-plans', mealPlanRouter);
app.use('/api/progress', progressRouter);
app.post('/api/reviews', reviewLimiter);
app.use('/api/reviews', reviewRouter);
app.use('/api/contact', contactLimiter, contactRouter);
app.use('/api/assistant', assistantLimiter, assistantRouter);

app.use('/api', (_req, res) => {
  res.status(404).json({ message: 'API route not found.' });
});

app.use((error: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof CorsOriginError) {
    res.status(403).json({ message: 'Origin is not allowed.' });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({ message: 'Invalid request data.', issues: error.flatten().fieldErrors });
    return;
  }

  if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
    res.status(400).json({ message: 'Invalid request data.' });
    return;
  }

  if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
    res.status(409).json({ message: 'That record already exists.' });
    return;
  }

  if (error instanceof SyntaxError && 'status' in error && error.status === 400) {
    res.status(400).json({ message: 'Request body must contain valid JSON.' });
    return;
  }

  if (typeof error === 'object' && error !== null && 'status' in error && error.status === 413) {
    res.status(413).json({ message: 'Request body is too large.' });
    return;
  }

  console.error('Unexpected API error:', { method: req.method, path: req.path, error });
  res.status(500).json({ message: 'Unexpected server error.' });
});
