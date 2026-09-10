import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { ReviewsPage } from './ReviewsPage';

const { getToken, getProfile, getMyCustomerReview, getCustomerReviews, saveCustomerReview, sendContactMessage } = vi.hoisted(() => ({
  getToken: vi.fn().mockResolvedValue('test-token'),
  getProfile: vi.fn(),
  getMyCustomerReview: vi.fn(),
  getCustomerReviews: vi.fn(),
  saveCustomerReview: vi.fn(),
  sendContactMessage: vi.fn(),
}));

vi.mock('@clerk/react', () => ({
  useAuth: () => ({ isLoaded: true, isSignedIn: true, getToken }),
  SignInButton: ({ children }: { children: ReactNode }) => children,
  SignUpButton: ({ children }: { children: ReactNode }) => children,
}));
vi.mock('../../shared/clerk', () => ({ isClerkConfigured: true }));
vi.mock('../../shared/api', () => ({
  api: { getProfile, getMyCustomerReview, getCustomerReviews, saveCustomerReview, sendContactMessage },
}));

describe('ReviewsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCustomerReviews.mockResolvedValue({ reviews: [], averageRating: 0, total: 0 });
    getProfile.mockResolvedValue({
      _id: 'profile-1', name: 'Alex Morgan', age: 30, sex: 'other', heightCm: 175,
      weightKg: 70, activity: 'moderate', goal: 'maintain',
    });
    getMyCustomerReview.mockResolvedValue(null);
  });

  it('publishes one review under the signed-in profile name', async () => {
    const user = userEvent.setup();
    const savedReview = {
      _id: 'review-1',
      name: 'Alex Morgan',
      rating: 5,
      comment: 'The daily plan was practical and easy to follow.',
      createdAt: '2026-09-09T10:00:00.000Z',
    };
    saveCustomerReview.mockResolvedValue(savedReview);
    getCustomerReviews
      .mockResolvedValueOnce({ reviews: [], averageRating: 0, total: 0 })
      .mockResolvedValue({ reviews: [savedReview], averageRating: 5, total: 1 });
    render(<ReviewsPage />);

    await screen.findByText('Posting as');
    expect(screen.getByText('Alex Morgan')).toBeInTheDocument();
    expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: '5 stars' }));
    await user.type(screen.getByLabelText('Your comment'), 'The daily plan was practical and easy to follow.');
    await user.click(screen.getByRole('button', { name: 'Publish review' }));

    await waitFor(() => expect(saveCustomerReview).toHaveBeenCalledWith('test-token', {
      rating: 5,
      comment: 'The daily plan was practical and easy to follow.',
    }));
    expect(await screen.findByRole('status')).toHaveTextContent('Thank you!');
    expect(screen.getByText('“The daily plan was practical and easy to follow.”')).toBeInTheDocument();
    expect(screen.getByText('— Alex Morgan')).toBeInTheDocument();
  });

  it('sends a private contact message without leaving the page', async () => {
    const user = userEvent.setup();
    sendContactMessage.mockResolvedValue({ message: 'Your message was sent to FitMeal.' });
    render(<ReviewsPage />);
    const contactSection = screen.getByRole('region', { name: 'Email the FitMeal team.' });

    await user.type(within(contactSection).getByLabelText('Your name'), 'Alex');
    await user.type(within(contactSection).getByLabelText('Reply email'), 'alex@example.com');
    await user.selectOptions(within(contactSection).getByLabelText('What can we help with?'), 'Technical support');
    await user.type(within(contactSection).getByLabelText('Your message'), 'Please help me with my plan.');
    await user.click(within(contactSection).getByRole('button', { name: 'Send message' }));

    await waitFor(() => expect(sendContactMessage).toHaveBeenCalledWith({
      senderName: 'Alex',
      senderEmail: 'alex@example.com',
      topic: 'Technical support',
      message: 'Please help me with my plan.',
    }));
    expect(await within(contactSection).findByRole('status')).toHaveTextContent('sent to FitMeal');
  });
});
