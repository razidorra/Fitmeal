import { Profile } from '../features/profile/profile.model.js';

/** Finds a profile only if it belongs to this Clerk user. Returns null (never throws) on a bad id or someone else's profile. */
export async function findOwnedProfile(profileId: string, clerkUserId: string) {
  try {
    return await Profile.findOne({ _id: profileId, clerkUserId });
  } catch {
    return null;
  }
}
