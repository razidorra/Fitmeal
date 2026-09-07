import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { MobileAuthMenu } from './MobileAuthMenu';

const { signOut } = vi.hoisted(() => ({ signOut: vi.fn().mockResolvedValue(undefined) }));

vi.mock('@clerk/react', () => ({
  useClerk: () => ({ signOut }),
  Show: ({ when, children }: { when: string; children: ReactNode }) => when === 'signed-in' ? children : null,
  SignInButton: ({ children }: { children: ReactNode }) => children,
  SignUpButton: ({ children }: { children: ReactNode }) => children,
}));

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children, activeProps: _activeProps, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { to: string; children: ReactNode; activeProps?: unknown }) => <a href={to} {...props}>{children}</a>,
}));

it('shows the signed-in mobile actions and logs out to the application base', async () => {
  const handleNavigate = vi.fn();
  const user = userEvent.setup();

  render(<MobileAuthMenu onNavigate={handleNavigate} />);

  expect(screen.getByRole('link', { name: 'Account' })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Log out' }));

  expect(handleNavigate).toHaveBeenCalledOnce();
  expect(signOut).toHaveBeenCalledWith({ redirectUrl: '/' });
});
