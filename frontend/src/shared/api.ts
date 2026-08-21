import type { ChatMessage, Checkin, MealPlan, Profile, ProgressReview } from './types';

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '');

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message ?? 'Something went wrong. Please try again.');
  }

  return response.json() as Promise<T>;
}
export const api = {
  getProfile: () => request<Profile | null>('/profiles/latest'),
  saveProfile: (profile: Omit<Profile, '_id'>) => request<Profile>('/profiles', { method: 'POST', body: JSON.stringify(profile) }),
  getPlan: (profileId: string) => request<MealPlan | null>(`/meal-plans/latest/${profileId}`),
  generatePlan: (profileId: string) => request<MealPlan>(`/meal-plans/generate/${profileId}`, { method: 'POST' }),
  getCheckins: (profileId: string) => request<Checkin[]>(`/progress/${profileId}`),
  addCheckin: (data: { profileId: string; weightKg: number; note?: string }) => request<Checkin>('/progress', { method: 'POST', body: JSON.stringify(data) }),
  askAssistant: (message: string, history: ChatMessage[]) => request<{ reply: string }>('/assistant/chat', { method: 'POST', body: JSON.stringify({ message, history }) }),
  customizeMeal: (planId: string, time: string, description: string) => request<MealPlan>(`/meal-plans/${planId}/meals/${encodeURIComponent(time)}`, { method: 'POST', body: JSON.stringify({ description }) }),
  getReview: (profileId: string) => request<ProgressReview>(`/progress/${profileId}/review`, { method: 'POST' }),
};
