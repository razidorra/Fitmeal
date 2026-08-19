import mongoose from 'mongoose';
import { env } from '../config/env.js';

export async function connectDatabase() {
  if (!env.mongoUri) {
    console.warn('MONGODB_URI is not set. API will start, but database requests will fail.');
    return;
  }
  await mongoose.connect(env.mongoUri);
  console.log('Connected to MongoDB');
}
