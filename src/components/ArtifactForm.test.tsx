import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ArtifactForm } from './ArtifactForm';
import { useInventory } from '../state/inventory';

describe('ArtifactForm', () => {
  beforeEach(() => useInventory.getState().clear());

  it('adds a valid artifact to the inventory', async () => {
    render(<ArtifactForm />);
    await userEvent.click(screen.getByText(/add artifact/i));
    expect(useInventory.getState().artifacts.length).toBe(1);
  });

  it('shows an error for level out of range', async () => {
    render(<ArtifactForm />);
    const level = screen.getByLabelText(/Level/i);
    await userEvent.clear(level);
    await userEvent.type(level, '25');
    await userEvent.click(screen.getByText(/add artifact/i));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Level must be between 0 and 20.',
    );
  });

  it('flags an out-of-range level on blur and links the message to the field', async () => {
    const user = userEvent.setup();
    render(<ArtifactForm />);
    const level = screen.getByLabelText(/level/i);
    await user.clear(level);
    await user.type(level, '25');
    await user.tab();
    const err = await screen.findByRole('alert');
    expect(err).toHaveTextContent(/between 0 and 20/i);
    expect(level).toHaveAttribute('aria-describedby', err.id);
  });
});
