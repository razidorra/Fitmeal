import type { ChatMessage, Checkin, MealPlan, Profile, ProgressReview } from './types';

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '');

async function request<T>(token: string | null, path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message ?? 'Something went wrong. Please try again.');
  }

  return response.json() as Promise<T>;
}

// Every call takes the caller's Clerk session token (from `useAuth().getToken()`) so the
// backend can identify who's asking — profiles, plans, and check-ins are all per-user.
export const api = {
  getProfile: (token: string | null) => request<Profile | null>(token, '/profiles/latest'),
  saveProfile: (token: string | null, profile: Omit<Profile, '_id'>) => request<Profile>(token, '/profiles', { method: 'POST', body: JSON.stringify(profile) }),
  updateProfile: (token: string | null, profileId: string, profile: Omit<Profile, '_id'>) => request<Profile>(token, `/profiles/${profileId}`, { method: 'PATCH', body: JSON.stringify(profile) }),
  getPlan: (token: string | null, profileId: string) => request<MealPlan | null>(token, `/meal-plans/latest/${profileId}`),
  generatePlan: (token: string | null, profileId: string, date: string, regenerate = false) => request<MealPlan>(token, `/meal-plans/generate/${profileId}`, { method: 'POST', body: JSON.stringify({ date, regenerate }) }),
  getPlanHistory: (token: string | null, profileId: string, days = 14) => request<MealPlan[]>(token, `/meal-plans/${profileId}/history?days=${days}`),
  getCheckins: (token: string | null, profileId: string) => request<Checkin[]>(token, `/progress/${profileId}`),
  addCheckin: (token: string | null, data: { profileId: string; weightKg: number; note?: string }) => request<Checkin>(token, '/progress', { method: 'POST', body: JSON.stringify(data) }),
  askAssistant: (token: string | null, message: string, history: ChatMessage[]) => request<{ reply: string }>(token, '/assistant/chat', { method: 'POST', body: JSON.stringify({ message, history }) }),
  customizeMeal: (token: string | null, planId: string, time: string, description: string) => request<MealPlan>(token, `/meal-plans/${planId}/meals/${encodeURIComponent(time)}`, { method: 'POST', body: JSON.stringify({ description }) }),
  confirmMeal: (token: string | null, planId: string, time: string) => request<MealPlan>(token, `/meal-plans/${planId}/meals/${encodeURIComponent(time)}/confirm`, { method: 'PATCH' }),
  getReview: (token: string | null, profileId: string) => request<ProgressReview>(token, `/progress/${profileId}/review`, { method: 'POST' }),
};
