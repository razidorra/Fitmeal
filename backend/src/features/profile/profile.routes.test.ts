import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { clearTestDb, connectTestDb, disconnectTestDb } from '../../test/db.js';

// Stands in for real Clerk auth: whichever userId is set here is what requireUserId() sees for
// the next request, so tests can switch "who's signed in" without a real Clerk JWT.
const authState: { userId: string | null } = { userId: null };

vi.mock('@clerk/express', () => ({
  clerkMiddleware: () => (_req: unknown, _res: unknown, next: () => void) => next(),
  getAuth: () => ({ userId: authState.userId }),
}));

let app: Express;

beforeAll(async () => {
  await connectTestDb();
  ({ app } = await import('../../app.js'));
}, 60000);

afterEach(async () => {
  await clearTestDb();
  authState.userId = null;
});

afterAll(disconnectTestDb);

const validProfile = { name: 'Alex', age: 28, sex: 'female', heightCm: 165, weightKg: 60, activity: 'light', goal: 'lose' };

describe('POST /api/profiles', () => {
  it('rejects an unauthenticated request with 401', async () => {
    const res = await request(app).post('/api/profiles').send(validProfile);
    expect(res.status).toBe(401);
  });

  it('creates a profile owned by the signed-in user', async () => {
    authState.userId = 'user_a';
    const res = await request(app).post('/api/profiles').send(validProfile);
    expect(res.status).toBe(201);
    expect(res.body.clerkUserId).toBe('user_a');
    expect(res.body.name).toBe('Alex');
  });

  it('rejects an invalid payload with 400 instead of crashing', async () => {
    authState.userId = 'user_a';
    const res = await request(app).post('/api/profiles').send({ ...validProfile, age: 5 });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/profiles/latest', () => {
  it('never returns another user\'s profile', async () => {
    authState.userId = 'user_a';
    await request(app).post('/api/profiles').send(validProfile).expect(201);

    authState.userId = 'user_b';
    const res = await request(app).get('/api/profiles/latest');
    expect(res.status).toBe(200);
    expect(res.body).toBeNull();
  });

  it('returns the signed-in user\'s own profile', async () => {
    authState.userId = 'user_a';
    await request(app).post('/api/profiles').send(validProfile).expect(201);

    const res = await request(app).get('/api/profiles/latest');
    expect(res.status).toBe(200);
    expect(res.body.clerkUserId).toBe('user_a');
  });
});

describe('PATCH /api/profiles/:profileId', () => {
  it('refuses to let one user edit another user\'s profile', async () => {
    authState.userId = 'user_a';
    const created = await request(app).post('/api/profiles').send(validProfile);
    const profileId = created.body._id;

    authState.userId = 'user_b';
    const res = await request(app).patch(`/api/profiles/${profileId}`).send({ ...validProfile, name: 'Hijacked' });
    expect(res.status).toBe(404);

    authState.userId = 'user_a';
    const check = await request(app).get('/api/profiles/latest');
    expect(check.body.name).toBe('Alex');
  });

  it('lets the owner update their own profile', async () => {
    authState.userId = 'user_a';
    const created = await request(app).post('/api/profiles').send(validProfile);
    const profileId = created.body._id;

    const res = await request(app).patch(`/api/profiles/${profileId}`).send({ ...validProfile, name: 'Alexandra' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Alexandra');
  });
});
