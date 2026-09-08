import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Checkin } from '../../shared/types';
import { WeightTrendChart } from './WeightTrendChart';

describe('WeightTrendChart', () => {
  it('positions measurements according to elapsed time', () => {
    const checkins: Checkin[] = [
      { _id: 'first', weightKg: 70, date: '2026-01-01T08:00:00.000Z' },
      { _id: 'second', weightKg: 69.8, date: '2026-01-02T08:00:00.000Z' },
      { _id: 'third', weightKg: 69.5, date: '2026-01-11T08:00:00.000Z' },
    ];

    const { container } = render(<WeightTrendChart checkins={checkins} />);
    const points = container.querySelectorAll('circle');

    expect(screen.getByRole('img', { name: /weight trend from 70 to 69.5 kilograms/i })).toBeInTheDocument();
    expect(Number(points[1].getAttribute('cx'))).toBeLessThan(200);
  });
});
