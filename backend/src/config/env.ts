import dotenv from 'dotenv';
import { resolve } from 'node:path';

// The normal location is backend/.env.  Keep the temporary src/.env location
// working as a fallback so existing local setups do not suddenly stop.
dotenv.config({ path: resolve(process.cwd(), '.env') });
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: resolve(process.cwd(), 'src/.env') });
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGODB_URI ?? '',
  clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  clerkSecretKey: process.env.CLERK_SECRET_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY ?? '',
  geminiModel: process.env.GEMINI_MODEL ?? 'gemini-flash-latest',
};
