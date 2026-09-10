import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { clearTestDb, connectTestDb, disconnectTestDb } from '../../test/db.js';
import { Profile } from '../profile/profile.model.js';

const { sendContactEmail } = vi.hoisted(() => ({
  sendContactEmail: vi.fn().mockResolvedValue(undefined),
}));

const authState: { userId: string | null } = { userId: null };

vi.mock('@clerk/express', () => ({
  clerkMiddleware: () => (_req: unknown, _res: unknown, next: () => void) => next(),
  getAuth: () => ({ userId: authState.userId }),
}));

vi.mock('../contact/contact.service.js', () => ({
  isContactEmailConfigured: () => true,
  sendContactEmail,
}));

let app: Express;

beforeAll(async () => {
  await connectTestDb();
  ({ app } = await import('../../app.js'));
});
afterEach(async () => {
  await clearTestDb();
  authState.userId = null;
  vi.clearAllMocks();
});
afterAll(disconnectTestDb);

const validReview = {
  rating: 5,
  comment: 'The daily meal suggestions made planning much easier for me.',
};

const validProfile = {
  name: 'Alex Morgan', age: 30, sex: 'other' as const, heightCm: 175, weightKg: 70,
  activity: 'moderate' as const, goal: 'maintain' as const,
};

describe('public review routes', () => {
  it('requires a signed-in account with a FitMeal profile', async () => {
    await request(app).post('/api/reviews').send(validReview).expect(401);

    authState.userId = 'user_without_profile';
    const missingProfile = await request(app).post('/api/reviews').send(validReview).expect(404);
    expect(missingProfile.body.message).toMatch(/create your fitmeal profile/i);
  });

  it('creates only one review per profile and derives its public name from that profile', async () => {
    authState.userId = 'user_a';
    await Profile.create({ ...validProfile, clerkUserId: authState.userId });

    const created = await request(app).post('/api/reviews').send(validReview).expect(200);
    const updated = await request(app).post('/api/reviews').send({
      rating: 3,
      comment: 'The updated review still belongs to the same profile.',
    }).expect(200);

    expect(created.body.name).toBe(validProfile.name);
    expect(updated.body._id).toBe(created.body._id);
    expect(updated.body).toMatchObject({ name: validProfile.name, rating: 3 });

    const listed = await request(app).get('/api/reviews').expect(200);
    expect(listed.body).toMatchObject({ total: 1, averageRating: 3 });
    expect(listed.body.reviews).toHaveLength(1);
    const mine = await request(app).get('/api/reviews/mine').expect(200);
    expect(mine.body._id).toBe(created.body._id);
  });

  it('rejects spoofed names and invalid review content', async () => {
    authState.userId = 'user_a';
    await Profile.create({ ...validProfile, clerkUserId: authState.userId });

    await request(app).post('/api/reviews').send({ ...validReview, name: 'Someone Else' }).expect(400);
    await request(app).post('/api/reviews').send({ ...validReview, rating: 0 }).expect(400);
    await request(app).post('/api/reviews').send({ ...validReview, comment: 'Too short' }).expect(400);
  });
});

describe('contact email route', () => {
  it('sends a private message through the configured email service', async () => {
    const contact = {
      topic: 'Technical support',
      message: 'Please help me with my meal plan.',
      senderName: 'Alex',
      senderEmail: 'alex@example.com',
    };
    const response = await request(app).post('/api/contact').send(contact).expect(202);

    expect(response.body).toEqual({ message: 'Your message was sent to FitMeal.' });
    expect(sendContactEmail).toHaveBeenCalledWith(contact);
  });

  it('rejects an empty message or invalid reply address', async () => {
    const contact = { topic: 'Support', senderName: 'Alex', senderEmail: 'alex@example.com' };
    await request(app).post('/api/contact').send({ ...contact, message: '' }).expect(400);
    await request(app).post('/api/contact').send({ ...contact, senderEmail: 'invalid', message: 'Please help.' }).expect(400);
    expect(sendContactEmail).not.toHaveBeenCalled();
  });
});
