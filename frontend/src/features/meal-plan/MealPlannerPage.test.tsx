import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MealPlannerPage } from './MealPlannerPage';

vi.mock('../../shared/clerk', () => ({ isClerkConfigured: true }));
vi.mock('@clerk/react', () => ({
  useAuth: () => ({ isLoaded: true, isSignedIn: false, getToken: vi.fn() }),
  SignInButton: ({ children }: { children: React.ReactNode }) => children,
  SignUpButton: ({ children }: { children: React.ReactNode }) => children,
}));

describe('MealPlannerPage guest state', () => {
  it('allows exploring the form but requires sign-in before saving', async () => {
    const user = userEvent.setup();
    render(<MealPlannerPage />);

    await user.type(screen.getByLabelText('Name'), 'Alex');
    await user.click(screen.getByRole('button', { name: 'Save profile' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Please sign in to see your personalised meal plan.');
  });
});
