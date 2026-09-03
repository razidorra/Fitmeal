import dotenv from 'dotenv';
import { resolve } from 'node:path';

// The normal location is backend/.env.  Keep the temporary src/.env location
// working as a fallback so existing local setups do not suddenly stop.
dotenv.config({ path: resolve(process.cwd(), '.env') });
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: resolve(process.cwd(), 'src/.env') });
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGODB_URI ?? '',
  clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  clerkSecretKey: process.env.CLERK_SECRET_KEY,
  groqApiKey: process.env.GROQ_API_KEY ?? '',
  groqModel: process.env.GROQ_MODEL ?? 'openai/gpt-oss-20b',
  corsOrigins: (process.env.CORS_ORIGINS ?? '').split(',').map((origin) => origin.trim()).filter(Boolean),
};

if (!Number.isInteger(env.port) || env.port < 1 || env.port > 65_535) {
  throw new Error('PORT must be an integer between 1 and 65535.');
}

if (env.nodeEnv === 'production') {
  const missingVariables = [
    !env.mongoUri && 'MONGODB_URI',
    !env.clerkPublishableKey && 'CLERK_PUBLISHABLE_KEY',
    !env.clerkSecretKey && 'CLERK_SECRET_KEY',
    env.corsOrigins.length === 0 && 'CORS_ORIGINS',
  ].filter(Boolean);

  if (missingVariables.length > 0) {
    throw new Error(`Missing required production configuration: ${missingVariables.join(', ')}`);
  }
}
