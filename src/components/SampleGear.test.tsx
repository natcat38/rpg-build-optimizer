import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SampleGear } from './SampleGear';
import { useInventory } from '../state/inventory';
import { useOptimizeRequest } from '../state/optimizeRequest';

describe('SampleGear', () => {
  beforeEach(() => {
    useInventory.getState().clear();
    useOptimizeRequest.getState().reset();
  });

  it('renders a button for each preset', () => {
    render(<SampleGear onRun={() => {}} running={false} />);
    for (const name of ['Furina', 'Nahida', 'Navia', 'Neuvillette']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
  });

  it('loads sample gear, applies the preset, and runs on click', async () => {
    const onRun = vi.fn();
    render(<SampleGear onRun={onRun} running={false} />);
    await userEvent.click(screen.getByRole('button', { name: 'Nahida' }));
    const inv = useInventory.getState().artifacts;
    expect(inv.length).toBeGreaterThan(0);
    expect(inv.every((a) => a.id.startsWith('sample-'))).toBe(true);
    expect(useOptimizeRequest.getState().characterKey).toBe('nahida');
    expect(onRun).toHaveBeenCalled();
  });

  it('disables preset buttons while a run is already in flight elsewhere', () => {
    render(<SampleGear onRun={() => {}} running={true} />);
    expect(screen.getByRole('button', { name: 'Furina' })).toBeDisabled();
  });
});
