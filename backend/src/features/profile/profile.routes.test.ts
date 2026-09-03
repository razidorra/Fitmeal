import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { clearTestDb, connectTestDb, disconnectTestDb } from '../../test/db.js';
import { MealPlan } from '../meal-plan/meal-plan.model.js';
import { Checkin } from '../progress/checkin.model.js';

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

  it('enforces one profile per account', async () => {
    authState.userId = 'user_a';
    await request(app).post('/api/profiles').send(validProfile).expect(201);
    const duplicate = await request(app).post('/api/profiles').send(validProfile);
    expect(duplicate.status).toBe(409);
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

  it('supports a real partial update', async () => {
    authState.userId = 'user_a';
    const created = await request(app).post('/api/profiles').send(validProfile);
    const res = await request(app).patch(`/api/profiles/${created.body._id}`).send({ name: '  Alexandra  ' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Alexandra');
    expect(res.body.goal).toBe('lose');
  });
});

describe('DELETE /api/profiles/:profileId', () => {
  it('deletes the owner profile together with plans and check-ins', async () => {
    authState.userId = 'user_a';
    const created = await request(app).post('/api/profiles').send(validProfile).expect(201);
    const profileId = created.body._id;
    await request(app).post(`/api/meal-plans/generate/${profileId}`).send({ date: '2026-09-03' }).expect(201);
    await request(app).post('/api/progress').send({ profileId, weightKg: 60 }).expect(201);

    await request(app).delete(`/api/profiles/${profileId}`).expect(204);

    expect((await request(app).get('/api/profiles/latest').expect(200)).body).toBeNull();
    expect(await MealPlan.countDocuments({ profileId })).toBe(0);
    expect(await Checkin.countDocuments({ profileId })).toBe(0);
  });

  it('does not let another account delete the data', async () => {
    authState.userId = 'user_a';
    const created = await request(app).post('/api/profiles').send(validProfile).expect(201);

    authState.userId = 'user_b';
    await request(app).delete(`/api/profiles/${created.body._id}`).expect(404);

    authState.userId = 'user_a';
    expect((await request(app).get('/api/profiles/latest').expect(200)).body._id).toBe(created.body._id);
  });
});

describe('POST /api/meal-plans/generate/:profileId', () => {
  it('rejects impossible calendar dates', async () => {
    authState.userId = 'user_a';
    const profile = await request(app).post('/api/profiles').send(validProfile);
    await request(app).post(`/api/meal-plans/generate/${profile.body._id}`).send({ date: '2026-02-31' }).expect(400);
  });

  it('persists and returns the Sunday cheat-day status', async () => {
    authState.userId = 'user_a';
    const createdProfile = await request(app).post('/api/profiles').send(validProfile);

    const generated = await request(app)
      .post(`/api/meal-plans/generate/${createdProfile.body._id}`)
      .send({ date: '2026-08-23' });

    expect(generated.status).toBe(201);
    expect(generated.body.isCheatDay).toBe(true);

    const latest = await request(app).get(`/api/meal-plans/latest/${createdProfile.body._id}`);
    expect(latest.status).toBe(200);
    expect(latest.body.isCheatDay).toBe(true);
  });

  it('returns the same stored plan for repeated requests on one date', async () => {
    authState.userId = 'user_a';
    const profile = await request(app).post('/api/profiles').send(validProfile);
    const path = `/api/meal-plans/generate/${profile.body._id}`;
    const first = await request(app).post(path).send({ date: '2026-08-24' }).expect(201);
    const second = await request(app).post(path).send({ date: '2026-08-24' }).expect(200);
    expect(second.body._id).toBe(first.body._id);
  });

  it('feeds confirmed and changed meals into the progress review', async () => {
    authState.userId = 'user_a';
    const createdProfile = await request(app).post('/api/profiles').send(validProfile);
    const generated = await request(app)
      .post(`/api/meal-plans/generate/${createdProfile.body._id}`)
      .send({ date: '2026-08-24' });

    await request(app)
      .patch(`/api/meal-plans/${generated.body._id}/meals/Breakfast/confirm`)
      .expect(200);
    await request(app)
      .post(`/api/meal-plans/${generated.body._id}/meals/Lunch`)
      .send({ description: 'Vegetable soup and bread' })
      .expect(200);

    const review = await request(app).post(`/api/progress/${createdProfile.body._id}/review`);

    expect(review.status).toBe(200);
    expect(review.body.stats).toMatchObject({
      loggedMealCount: 2,
      confirmedMealCount: 1,
      changedMealCount: 1,
    });
  });
});

describe('request validation', () => {
  it('rejects invalid history limits and whitespace-only meal replacements', async () => {
    authState.userId = 'user_a';
    const profile = await request(app).post('/api/profiles').send(validProfile);
    const generated = await request(app)
      .post(`/api/meal-plans/generate/${profile.body._id}`)
      .send({ date: '2026-08-24' });

    await request(app).get(`/api/meal-plans/${profile.body._id}/history?days=-1`).expect(400);
    await request(app)
      .post(`/api/meal-plans/${generated.body._id}/meals/Lunch`)
      .send({ description: '   ' })
      .expect(400);
  });

  it('requires check-ins from different days before producing a trend', async () => {
    authState.userId = 'user_a';
    const profile = await request(app).post('/api/profiles').send(validProfile);
    const body = { profileId: profile.body._id, weightKg: 60 };
    await request(app).post('/api/progress').send(body).expect(201);
    await request(app).post('/api/progress').send({ ...body, weightKg: 59.8 }).expect(201);

    const review = await request(app).post(`/api/progress/${profile.body._id}/review`).expect(200);
    expect(review.body.stats.weeklyRateKg).toBeNull();
    expect(review.body.stats.onTrack).toBeNull();
  });

  it('rejects blank assistant messages before contacting the provider', async () => {
    authState.userId = 'user_a';
    await request(app).post('/api/assistant/chat').send({ message: '   ' }).expect(400);
  });
});

describe('API behavior', () => {
  it('returns readiness details and security headers', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, database: 'connected' });
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('returns JSON for unknown API routes', async () => {
    const res = await request(app).get('/api/not-a-route');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: 'API route not found.' });
  });
});
