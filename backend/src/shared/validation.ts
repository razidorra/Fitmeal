import { z } from 'zod';

export const localDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a date in YYYY-MM-DD format.').refine((value) => {
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}, 'Use a real calendar date.');

export function trimmedText(minLength: number, maxLength: number) {
  return z.string().trim().min(minLength).max(maxLength);
}
