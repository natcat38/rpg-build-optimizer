import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OptimizePanel } from './OptimizePanel';
import { useInventory } from '../state/inventory';

describe('OptimizePanel', () => {
  beforeEach(() => useInventory.getState().clear());

  it('disables Optimise with a hint when no artifacts exist', () => {
    render(<OptimizePanel onResult={() => {}} />);
    expect(screen.getByRole('button', { name: /Optimise/i })).toBeDisabled();
    expect(screen.getByText(/Add or import artifacts before optimising\./i)).toBeInTheDocument();
  });

  it('enables Optimise once a character is chosen and artifacts exist', () => {
    useInventory.getState().add({ id: 'a', setKey: 'A', slot: 'flower', rarity: 5, level: 20, mainStat: 'hp', mainStatValue: 1, subStats: [] });
    render(<OptimizePanel onResult={() => {}} />);
    expect(screen.getByRole('button', { name: /Optimise/i })).toBeEnabled();
  });
});
