import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';

vi.mock('@clerk/express', () => ({
  clerkMiddleware: () => (_req: unknown, _res: unknown, next: () => void) => next(),
  getAuth: () => ({ userId: 'security_test_user' }),
}));

let app: Express;
let env: typeof import('./config/env.js').env;
let originalNodeEnv: string;
let originalCorsOrigins: string[];

beforeAll(async () => {
  ({ env } = await import('./config/env.js'));
  originalNodeEnv = env.nodeEnv;
  originalCorsOrigins = [...env.corsOrigins];
  // Security tests exercise the route boundary, never the external AI provider.
  env.groqApiKey = '';
  ({ app } = await import('./app.js'));
});

afterEach(() => {
  env.nodeEnv = originalNodeEnv;
  env.corsOrigins.splice(0, env.corsOrigins.length, ...originalCorsOrigins);
});

describe('API security boundary', () => {
  it('allows configured production origins and rejects other browser origins', async () => {
    env.nodeEnv = 'production';
    env.corsOrigins.splice(0, env.corsOrigins.length, 'https://fitmeal.example');

    const allowed = await request(app).get('/api/not-a-route').set('Origin', 'https://fitmeal.example');
    expect(allowed.headers['access-control-allow-origin']).toBe('https://fitmeal.example');

    const blocked = await request(app).get('/api/not-a-route').set('Origin', 'https://attacker.example');
    expect(blocked.status).toBe(403);
    expect(blocked.body).toEqual({ message: 'Origin is not allowed.' });
  });

  it('rejects malformed JSON and payloads above 64kb with specific client errors', async () => {
    const malformed = await request(app)
      .post('/api/assistant/chat')
      .set('Content-Type', 'application/json')
      .send('{"message":');
    expect(malformed.status).toBe(400);
    expect(malformed.body).toEqual({ message: 'Request body must contain valid JSON.' });

    const oversized = await request(app)
      .post('/api/assistant/chat')
      .send({ message: 'x'.repeat(70 * 1024) });
    expect(oversized.status).toBe(413);
    expect(oversized.body).toEqual({ message: 'Request body is too large.' });
  });

  it('rate-limits the assistant independently from the wider API', async () => {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const response = await request(app).post('/api/assistant/chat').send({ message: 'protein ideas' });
      expect(response.status).toBe(200);
    }

    const limited = await request(app).post('/api/assistant/chat').send({ message: 'one more question' });
    expect(limited.status).toBe(429);
    expect(limited.body).toEqual({ message: 'Assistant request limit reached. Please try again later.' });
    expect(limited.headers['ratelimit-policy']).toBeDefined();
  });
});
