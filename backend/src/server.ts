import { app } from './app.js';
import { env } from './config/env.js';
import { connectDatabase } from './shared/database.js';

async function startServer() {
  try {
    await connectDatabase();
    app.listen(env.port, () => console.log(`FitMeal API running on :${env.port}`));
  } catch (error) {
    console.error('FitMeal API failed to start:', error);
    process.exitCode = 1;
  }
}

void startServer();
