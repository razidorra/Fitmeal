import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ProfileForm } from './ProfileForm';

describe('ProfileForm', () => {
  it('submits trimmed, typed profile values', async () => {
    const user = userEvent.setup();
    const handleSave = vi.fn();
    render(<ProfileForm onSave={handleSave} isSaving={false} />);

    await user.type(screen.getByLabelText('Name'), '  Alex  ');
    await user.clear(screen.getByLabelText('Age'));
    await user.type(screen.getByLabelText('Age'), '28');
    await user.selectOptions(screen.getByLabelText(/^Calorie equation/), 'male');
    await user.selectOptions(screen.getByLabelText('Activity level'), 'high');
    await user.selectOptions(screen.getByLabelText('Goal'), 'gain');
    await user.click(screen.getByRole('button', { name: 'Save profile' }));

    expect(handleSave).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Alex',
      age: 28,
      sex: 'male',
      activity: 'high',
      goal: 'gain',
    }));
  });

  it('disables submission while saving', () => {
    render(<ProfileForm onSave={vi.fn()} isSaving />);
    expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
  });
});
