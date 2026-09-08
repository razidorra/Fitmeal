import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RecipesPage } from './RecipesPage';

vi.mock('../../shared/clerk', () => ({ isClerkConfigured: false }));

describe('RecipesPage', () => {
  it('filters by search and category and can reset the collection', async () => {
    const user = userEvent.setup();
    render(<RecipesPage />);

    await user.type(screen.getByLabelText('Search recipes'), 'lentils');
    expect(screen.getByRole('heading', { name: '1 recipe found' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Lentil vegetable soup' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Fruits' }));
    expect(screen.getByRole('heading', { name: 'No matching recipes yet.' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Show all recipes' }));
    expect(screen.queryByRole('heading', { name: 'No matching recipes yet.' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'All types' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('explains unavailable guest access and restores focus when the modal closes', async () => {
    const user = userEvent.setup();
    render(<RecipesPage />);

    const recipeCard = screen.getByRole('button', { name: /chicken quinoa salad/i });
    recipeCard.focus();
    await user.keyboard('{Enter}');

    const dialog = screen.getByRole('dialog', { name: 'Recipe details require an account.' });
    expect(dialog).toBeInTheDocument();
    expect(document.body).toHaveStyle({ overflow: 'hidden' });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus());

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.body).not.toHaveStyle({ overflow: 'hidden' });
    expect(recipeCard).toHaveFocus();
  });
});
