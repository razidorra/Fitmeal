import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReviewsPage } from './ReviewsPage';

const { getCustomerReviews, addCustomerReview, sendContactMessage } = vi.hoisted(() => ({
  getCustomerReviews: vi.fn(),
  addCustomerReview: vi.fn(),
  sendContactMessage: vi.fn(),
}));

vi.mock('../../shared/api', () => ({
  api: { getCustomerReviews, addCustomerReview, sendContactMessage },
}));

describe('ReviewsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCustomerReviews.mockResolvedValue({ reviews: [], averageRating: 0, total: 0 });
  });

  it('submits a rated review and adds it to the public list', async () => {
    const user = userEvent.setup();
    addCustomerReview.mockResolvedValue({
      _id: 'review-1',
      name: 'Alex Morgan',
      rating: 5,
      comment: 'The daily plan was practical and easy to follow.',
      createdAt: '2026-09-09T10:00:00.000Z',
    });
    render(<ReviewsPage />);

    await screen.findByText('Be the first to share your experience.');
    await user.click(screen.getByRole('radio', { name: '5 stars' }));
    await user.type(screen.getByLabelText('Name'), 'Alex Morgan');
    await user.type(screen.getByLabelText('Your comment'), 'The daily plan was practical and easy to follow.');
    await user.click(screen.getByRole('button', { name: 'Publish review' }));

    await waitFor(() => expect(addCustomerReview).toHaveBeenCalledWith({
      name: 'Alex Morgan',
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
