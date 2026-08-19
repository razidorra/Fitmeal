import { app } from './app.js'; import { env } from './config/env.js'; import { connectDatabase } from './shared/database.js';
connectDatabase().then(() => app.listen(env.port, () => console.log(`FitMeal API running on :${env.port}`))).catch(console.error);
