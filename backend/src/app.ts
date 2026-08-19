import cors from 'cors'; import express from 'express';
import { clerkMiddleware } from '@clerk/express';
import { profileRouter } from './features/profile/profile.routes.js'; import { mealPlanRouter } from './features/meal-plan/meal-plan.routes.js'; import { progressRouter } from './features/progress/progress.routes.js';
import { env } from './config/env.js';
export const app = express();
if (env.clerkPublishableKey && env.clerkSecretKey) app.use(clerkMiddleware());
app.use(cors());
app.use(express.json());
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/profiles', profileRouter);
app.use('/api/meal-plans', mealPlanRouter);
app.use('/api/progress', progressRouter);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : 'Unexpected server error';
  res.status(400).json({ message });
});
