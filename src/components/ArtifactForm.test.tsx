import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ArtifactForm } from './ArtifactForm';
import { useInventory } from '../state/inventory';

describe('ArtifactForm', () => {
  beforeEach(() => useInventory.getState().clear());

  it('adds a valid artifact to the inventory', async () => {
    render(<ArtifactForm />);
    await userEvent.click(screen.getByText('Add artifact'));
    expect(useInventory.getState().artifacts.length).toBe(1);
  });

  it('shows an error for level out of range', async () => {
    render(<ArtifactForm />);
    const level = screen.getByLabelText(/Level/i);
    await userEvent.clear(level);
    await userEvent.type(level, '25');
    await userEvent.click(screen.getByText('Add artifact'));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Level must be between 0 and 20.',
    );
  });
});
