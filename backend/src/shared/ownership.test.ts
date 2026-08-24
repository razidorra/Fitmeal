import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { clearTestDb, connectTestDb, disconnectTestDb } from '../test/db.js';
import { Profile } from '../features/profile/profile.model.js';
import { findOwnedProfile } from './ownership.js';

beforeAll(connectTestDb);
afterEach(clearTestDb);
afterAll(disconnectTestDb);

const baseProfile = {
  name: 'Test User', age: 30, sex: 'female' as const, heightCm: 170, weightKg: 65,
  activity: 'moderate' as const, goal: 'maintain' as const,
};

// findOwnedProfile is the one function standing between a signed-in user and someone else's
// profile data, so it's worth covering every branch directly rather than only through routes.
describe('findOwnedProfile', () => {
  it('returns the profile when it belongs to the requesting user', async () => {
    const profile = await Profile.create({ ...baseProfile, clerkUserId: 'user_a' });
    const found = await findOwnedProfile(String(profile._id), 'user_a');
    expect(found?._id.toString()).toBe(profile._id.toString());
  });

  it('returns null when the profile belongs to a different user', async () => {
    const profile = await Profile.create({ ...baseProfile, clerkUserId: 'user_a' });
    const found = await findOwnedProfile(String(profile._id), 'user_b');
    expect(found).toBeNull();
  });

  it('returns null (never throws) for a malformed id instead of a 500', async () => {
    await expect(findOwnedProfile('not-a-valid-object-id', 'user_a')).resolves.toBeNull();
  });

  it('returns null when no profile exists with that id', async () => {
    const missingId = new mongoose.Types.ObjectId().toString();
    const found = await findOwnedProfile(missingId, 'user_a');
    expect(found).toBeNull();
  });
});
