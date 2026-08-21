import type { Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import { env } from '../config/env.js';

/**
 * Returns the signed-in Clerk user id for this request, or writes the appropriate
 * error response (503 if Clerk isn't configured, 401 if not signed in) and returns null.
 * Callers should `return` immediately when this returns null.
 */
export function requireUserId(req: Request, res: Response): string | null {
  if (!env.clerkPublishableKey || !env.clerkSecretKey) {
    res.status(503).json({ message: 'Sign-in is not configured yet — add CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY.' });
    return null;
  }

  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ message: 'Sign in to continue.' });
    return null;
  }

  return userId;
}
