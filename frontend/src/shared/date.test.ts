import { describe, expect, it } from 'vitest';
import { getLocalDateString, getWeekStart } from './date';

describe('date helpers', () => {
  it('formats a date without converting it to UTC', () => {
    expect(getLocalDateString(new Date(2026, 8, 2, 23, 30))).toBe('2026-09-02');
  });

  it('uses Monday as the beginning of a week, including for Sundays', () => {
    expect(getWeekStart('2026-09-02')).toBe('2026-08-31');
    expect(getWeekStart('2026-09-06')).toBe('2026-08-31');
  });
});
