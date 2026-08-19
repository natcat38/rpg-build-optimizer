import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlanView } from './PlanView';
import { useRoster } from '../state/roster';
import { useInventory } from '../state/inventory';
import { searchBuilds } from '../optimizer/search';
import { buildContext } from '../optimizer/context';
import type { RunOptimize } from './composePlan';
import type { Artifact, Slot, StatKey } from '../game/types';
import { SLOTS } from '../game/types';

const run: RunOptimize = (req, inv) =>
  Promise.resolve(searchBuilds(req, inv, buildContext(req)));

let n = 0;
function art(slot: Slot, setKey: string, main: StatKey): Artifact {
  return {
    id: `p${n++}`,
    setKey,
    slot,
    rarity: 5,
    level: 20,
    mainStat: main,
    mainStatValue: 46,
    subStats: [
      { key: 'crit_rate', value: 8 },
      { key: 'crit_dmg', value: 16 },
      { key: 'er_pct', value: 22 },
    ],
  };
}

const MAINS: Record<Slot, StatKey> = {
  flower: 'hp',
  plume: 'atk',
  sands: 'hp_pct',
  goblet: 'elemental_dmg',
  circlet: 'crit_rate',
};

function seed() {
  const entry = {
    buildLevel: 90 as const,
    talents: { auto: 9, skill: 9, burst: 9 },
    weaponKey: 'the_catch',
    weaponLevel: 90,
  };
  useRoster
    .getState()
    .setRoster(
      Object.fromEntries(
        [
          'neuvillette',
          'furina',
          'kaedehara_kazuha',
          'charlotte',
          'raiden_shogun',
          'xiangling',
          'xingqiu',
          'bennett',
        ].map((k) => [k, entry]),
      ),
    );
  const inv: Artifact[] = [];
  for (const s of SLOTS)
    for (let i = 0; i < 10; i++)
      inv.push(
        art(s, i % 2 ? 'EmblemOfSeveredFate' : 'MarechausseeHunter', MAINS[s]),
      );
  useInventory.getState().addMany(inv);
}

describe('PlanView', () => {
  beforeEach(() => {
    useRoster.getState().clear();
    useInventory.getState().clear();
  });

  it('asks for an import before it can plan anything', () => {
    render(<PlanView runOptimize={run} />);
    expect(
      screen.getByRole('button', { name: /Build my Abyss plan/i }),
    ).toBeDisabled();
  });

  it('never runs eight solves without an explicit click', () => {
    seed();
    const spy = vi.fn(run);
    render(<PlanView runOptimize={spy} />);
    expect(spy).not.toHaveBeenCalled();
  });

  it('builds the plan on click and renders teams, builds and one farming list', async () => {
    const user = userEvent.setup();
    seed();
    render(<PlanView runOptimize={run} />);
    await user.click(
      screen.getByRole('button', { name: /Build my Abyss plan/i }),
    );

    expect(await screen.findByText('What to farm')).toBeInTheDocument();
    const cards = screen.getAllByTestId('plan-member');
    expect(cards).toHaveLength(8);
    // Damage-objective members carry the estimate caveat.
    expect(
      screen.getAllByText(
        'estimated — for comparing builds, not matching in-game numbers',
      ).length,
    ).toBeGreaterThan(0);
  });
});
