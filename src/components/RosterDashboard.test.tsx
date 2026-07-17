import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RosterDashboard } from './RosterDashboard';
import { useRoster } from '../state/roster';
import { useInventory } from '../state/inventory';
import { useWeaponInventory } from '../state/weapons';
import type { BuildResult, OptimizeResult } from '../game/types';
import { SLOTS } from '../game/types';

const { optimize } = vi.hoisted(() => ({ optimize: vi.fn() }));
vi.mock('../workers/optimizeClient', () => ({ optimize }));

function makeResult(totals: Record<string, number>): OptimizeResult {
  const build: BuildResult = {
    artifactIds: Object.fromEntries(SLOTS.map((s) => [s, `x-${s}`])) as Record<
      (typeof SLOTS)[number],
      string
    >,
    totals,
    objectiveValue: 100,
    score: 100,
    diagnostics: { bindingConstraints: [], marginalBySlot: {}, explored: 1, pruned: 0 },
  };
  return { status: 'ok', builds: [build], explored: 1, pruned: 0 };
}

describe('RosterDashboard', () => {
  beforeEach(() => {
    optimize.mockReset();
    useRoster.getState().clear();
    useInventory.getState().clear();
    useWeaponInventory.getState().clear();
  });

  it('renders every owned character, curated or not', () => {
    useRoster.getState().setRoster({
      furina: { weaponKey: 'favonius_sword', buildLevel: 90 },
      zzz_not_a_real_character_key: {},
    });
    render(<RosterDashboard onSelect={() => {}} />);
    expect(screen.getByText('Furina')).toBeInTheDocument();
    expect(
      screen.getByText('zzz_not_a_real_character_key'),
    ).toBeInTheDocument();
  });

  it('never calls optimize for an uncurated character', async () => {
    useRoster.getState().setRoster({
      // furina has no statTargets in META_TARGETS — nothing to grade.
      furina: { weaponKey: 'favonius_sword' },
      zzz_not_a_real_character_key: {},
    });
    render(<RosterDashboard onSelect={() => {}} />);
    await act(async () => {
      await Promise.resolve();
    });
    expect(optimize).not.toHaveBeenCalled();
  });

  it('grades progressively as each optimize call resolves', async () => {
    // xiao has statTargets: { crit_rate: 70 } in META_TARGETS.
    useRoster.getState().setRoster({
      xiao: { weaponKey: 'black_tassel', buildLevel: 90 },
    });
    let resolveFn!: (r: OptimizeResult) => void;
    const pending = new Promise<OptimizeResult>((r) => (resolveFn = r));
    optimize.mockReturnValueOnce(pending);

    render(<RosterDashboard onSelect={() => {}} />);
    expect(optimize).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('S')).toBeNull();

    await act(async () => {
      resolveFn(makeResult({ crit_rate: 80 }));
      await pending;
    });
    expect(screen.getByText('S')).toBeInTheDocument();
  });

  it('calls onSelect with the character key when a card is clicked', async () => {
    useRoster.getState().setRoster({ furina: {} });
    const onSelect = vi.fn();
    render(<RosterDashboard onSelect={onSelect} />);
    await userEvent.click(screen.getByText('Furina'));
    expect(onSelect).toHaveBeenCalledWith('furina');
  });
});
