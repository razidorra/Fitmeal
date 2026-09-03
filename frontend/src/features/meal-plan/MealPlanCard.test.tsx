import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MealPlan } from '../../shared/types';
import { MealPlanCard } from './MealPlanCard';

const { getToken, confirmMeal, customizeMeal } = vi.hoisted(() => ({
  getToken: vi.fn().mockResolvedValue('test-token'),
  confirmMeal: vi.fn(),
  customizeMeal: vi.fn(),
}));

vi.mock('@clerk/react', () => ({ useAuth: () => ({ getToken }) }));
vi.mock('../../shared/api', () => ({
  api: { confirmMeal, customizeMeal },
}));

const plan: MealPlan = {
  _id: 'plan-1',
  date: '2026-09-03',
  nutritionBasis: 'target-budget',
  targets: { calories: 2000, protein: 120, carbs: 250, fats: 67 },
  meals: [{
    time: 'Breakfast',
    title: 'Protein oats',
    ingredients: 'Oats, yogurt and berries',
    ingredientsList: ['80 g oats', '200 g yogurt'],
    steps: ['Mix and serve.'],
    calories: 500,
    protein: 30,
    confirmed: false,
  }],
};

describe('MealPlanCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('confirms a suggested meal and returns the saved plan', async () => {
    const user = userEvent.setup();
    const handlePlanChange = vi.fn();
    const savedPlan = { ...plan, meals: [{ ...plan.meals[0], confirmed: true }] };
    confirmMeal.mockResolvedValue(savedPlan);
    render(<MealPlanCard plan={plan} onPlanChange={handlePlanChange} />);

    await user.click(screen.getByRole('button', { name: 'Same as suggested' }));

    await waitFor(() => expect(confirmMeal).toHaveBeenCalledWith('test-token', 'plan-1', 'Breakfast'));
    expect(handlePlanChange).toHaveBeenCalledWith(savedPlan);
  });

  it('saves a labelled replacement and reports API failures', async () => {
    const user = userEvent.setup();
    customizeMeal.mockRejectedValue(new Error('Replacement could not be saved.'));
    render(<MealPlanCard plan={plan} onPlanChange={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Something else' }));
    const replacementForm = screen.getByRole('textbox', { name: 'What did you have instead of Protein oats?' }).closest('form')!;
    await user.type(within(replacementForm).getByRole('textbox'), 'Soup and bread');
    await user.click(within(replacementForm).getByRole('button', { name: 'Save' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Replacement could not be saved.');
    expect(customizeMeal).toHaveBeenCalledWith('test-token', 'plan-1', 'Breakfast', 'Soup and bread');
  });
});
