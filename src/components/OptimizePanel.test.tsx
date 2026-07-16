import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { OptimizePanel } from './OptimizePanel';
import { useInventory } from '../state/inventory';
import { useOptimizeRequest } from '../state/optimizeRequest';
import { currentRequest } from '../state/optimizeRequest';

describe('OptimizePanel', () => {
  beforeEach(() => {
    useInventory.getState().clear();
    useOptimizeRequest.getState().reset();
  });

  it('disables Optimise with a hint when no artifacts exist', () => {
    render(<OptimizePanel onRun={() => {}} running={false} />);
    expect(screen.getByRole('button', { name: /Optimise/i })).toBeDisabled();
    expect(
      screen.getByText(/Add or import artifacts before optimising\./i),
    ).toBeInTheDocument();
  });

  it('enables Optimise once a character is chosen and artifacts exist', () => {
    useInventory.getState().add({
      id: 'a',
      setKey: 'A',
      slot: 'flower',
      rarity: 5,
      level: 20,
      mainStat: 'hp',
      mainStatValue: 1,
      subStats: [],
    });
    render(<OptimizePanel onRun={() => {}} running={false} />);
    expect(screen.getByRole('button', { name: /Optimise/i })).toBeEnabled();
  });
});

function addFlower() {
  useInventory.getState().add({
    id: 'a',
    setKey: 'A',
    slot: 'flower',
    rarity: 5,
    level: 20,
    mainStat: 'hp',
    mainStatValue: 1,
    subStats: [],
  });
}

describe('OptimizePanel meta prefill', () => {
  beforeEach(() => {
    useInventory.getState().clear();
    useOptimizeRequest.getState().reset();
  });

  it('shows "Use meta build" for a character with a meta recipe', () => {
    addFlower();
    useOptimizeRequest.getState().setCharacterKey('furina');
    render(<OptimizePanel onRun={() => {}} running={false} />);
    expect(
      screen.getByRole('button', { name: /Use meta build/i }),
    ).toBeInTheDocument();
  });

  it('hides "Use meta build" for a character without a meta recipe', () => {
    useOptimizeRequest.getState().setCharacterKey('zzz_not_meta');
    render(<OptimizePanel onRun={() => {}} running={false} />);
    expect(
      screen.queryByRole('button', { name: /Use meta build/i }),
    ).toBeNull();
  });

  it('clicking "Use meta build" applies the meta constraints and runs', async () => {
    addFlower();
    useOptimizeRequest.getState().setCharacterKey('navia');
    const onRun = vi.fn();
    render(<OptimizePanel onRun={onRun} running={false} />);
    await userEvent.click(
      screen.getByRole('button', { name: /Use meta build/i }),
    );
    const c = currentRequest(useOptimizeRequest.getState()).constraints;
    expect(c.setRequirement).toEqual({
      kind: '4pc',
      setKey: 'NighttimeWhispersInTheEchoingWoods',
    });
    expect(onRun).toHaveBeenCalled();
  });

  it('shows a read-only summary of the meta recipe, including statTargets', () => {
    addFlower();
    useOptimizeRequest.getState().setCharacterKey('xiao');
    render(<OptimizePanel onRun={() => {}} running={false} />);
    expect(screen.getByText(/4pc Vermillion Hereafter/i)).toBeInTheDocument();
    expect(screen.getByText(/ER target 120%/i)).toBeInTheDocument();
    expect(screen.getByText(/CRIT Rate 70%/i)).toBeInTheDocument();
    const sourceLinks = screen.getAllByRole('link', { name: /Source/i });
    expect(
      sourceLinks.some(
        (a) => a.getAttribute('href') === 'https://keqingmains.com/xiao/',
      ),
    ).toBe(true);
  });

  it('omits the summary for a character without a meta recipe', () => {
    useOptimizeRequest.getState().setCharacterKey('zzz_not_meta');
    render(<OptimizePanel onRun={() => {}} running={false} />);
    expect(screen.queryByRole('link', { name: /Source/i })).toBeNull();
  });
});

describe('OptimizePanel teammates', () => {
  beforeEach(() => {
    useInventory.getState().clear();
    useOptimizeRequest.getState().reset();
  });

  it('shows "Works well with" recs for a covered character', () => {
    useOptimizeRequest.getState().setCharacterKey('xiao');
    render(<OptimizePanel onRun={() => {}} running={false} />);
    expect(screen.getByText(/Works well with/i)).toBeInTheDocument();
    expect(screen.getByText(/Faruzan/)).toBeInTheDocument();
  });

  it('omits the teammates section for a character without recs', () => {
    useOptimizeRequest.getState().setCharacterKey('zzz_not_meta');
    render(<OptimizePanel onRun={() => {}} running={false} />);
    expect(screen.queryByText(/Works well with/i)).toBeNull();
  });
});
