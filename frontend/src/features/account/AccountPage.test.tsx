import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Profile } from '../../shared/types';
import { AccountPage } from './AccountPage';

const { getToken, getProfile, getPlan, getCheckins, deleteProfile } = vi.hoisted(() => ({
  getToken: vi.fn().mockResolvedValue('test-token'),
  getProfile: vi.fn(),
  getPlan: vi.fn(),
  getCheckins: vi.fn(),
  deleteProfile: vi.fn(),
}));

vi.mock('../../shared/clerk', () => ({ isClerkConfigured: true }));
vi.mock('../../shared/api', () => ({ api: { getProfile, getPlan, getCheckins, deleteProfile } }));
vi.mock('@clerk/react', () => ({
  useAuth: () => ({ isLoaded: true, isSignedIn: true, getToken }),
  useUser: () => ({ user: { id: 'user-1', fullName: 'Test User', primaryEmailAddress: { emailAddress: 'test@example.com' } } }),
  SignInButton: ({ children }: { children: ReactNode }) => children,
  SignUpButton: ({ children }: { children: ReactNode }) => children,
}));
vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { to: string; children: ReactNode }) => <a href={to} {...props}>{children}</a>,
}));

const profile: Profile = {
  _id: 'profile-1',
  name: 'FitMeal Profile Name',
  age: 30,
  sex: 'female',
  heightCm: 170,
  weightKg: 70,
  activity: 'moderate',
  goal: 'maintain',
};

describe('AccountPage privacy controls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getProfile.mockResolvedValue(profile);
    getPlan.mockResolvedValue(null);
    getCheckins.mockResolvedValue([]);
    deleteProfile.mockResolvedValue(undefined);
  });

  it('requires confirmation and deletes the signed-in user’s FitMeal data', async () => {
    const user = userEvent.setup();
    render(<AccountPage />);

    expect(await screen.findByRole('heading', { name: 'FitMeal Profile Name' })).toBeInTheDocument();
    await user.click(await screen.findByRole('button', { name: 'Delete my FitMeal data' }));
    expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Permanently delete data' }));

    await waitFor(() => expect(deleteProfile).toHaveBeenCalledWith('test-token', 'profile-1'));
    expect(screen.getByRole('status')).toHaveTextContent('profile, meal plans, and check-ins were deleted');
    expect(screen.getByRole('button', { name: 'No FitMeal data to delete' })).toBeDisabled();
  });

  it('shows a recoverable error instead of treating a failed request as an empty account', async () => {
    const user = userEvent.setup();
    getProfile.mockRejectedValueOnce(new Error('Account service unavailable')).mockResolvedValueOnce(profile);

    render(<AccountPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Account service unavailable');
    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByRole('heading', { name: 'FitMeal Profile Name' })).toBeInTheDocument();
    expect(getProfile).toHaveBeenCalledTimes(2);
  });
});
