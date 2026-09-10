import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { clearTestDb, connectTestDb, disconnectTestDb } from '../../test/db.js';

const { sendContactEmail } = vi.hoisted(() => ({
  sendContactEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@clerk/express', () => ({
  clerkMiddleware: () => (_req: unknown, _res: unknown, next: () => void) => next(),
  getAuth: () => ({ userId: null }),
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
  vi.clearAllMocks();
});
afterAll(disconnectTestDb);

const validReview = {
  name: 'Alex Morgan',
  email: 'alex@example.com',
  rating: 5,
  comment: 'The daily meal suggestions made planning much easier for me.',
};

describe('public review routes', () => {
  it('stores a review but never returns its private email address', async () => {
    const created = await request(app).post('/api/reviews').send(validReview).expect(201);
    expect(created.body).toMatchObject({ name: validReview.name, rating: 5, comment: validReview.comment });
    expect(created.body).not.toHaveProperty('email');

    const listed = await request(app).get('/api/reviews').expect(200);
    expect(listed.body).toMatchObject({ total: 1, averageRating: 5 });
    expect(listed.body.reviews).toHaveLength(1);
    expect(listed.body.reviews[0]).not.toHaveProperty('email');
  });

  it('calculates the average rating across submitted reviews', async () => {
    await request(app).post('/api/reviews').send(validReview).expect(201);
    const reviewWithoutEmail = {
      name: validReview.name,
      rating: 3,
      comment: validReview.comment,
    };
    await request(app).post('/api/reviews').send(reviewWithoutEmail).expect(201);

    const listed = await request(app).get('/api/reviews').expect(200);
    expect(listed.body).toMatchObject({ total: 2, averageRating: 4 });
  });

  it('rejects invalid ratings, emails, and very short comments', async () => {
    await request(app).post('/api/reviews').send({ ...validReview, rating: 0 }).expect(400);
    await request(app).post('/api/reviews').send({ ...validReview, email: 'not-an-email' }).expect(400);
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
