import { it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Results } from './Results';
import type { Artifact, OptimizeResult, OptimizeRequest } from '../game/types';

const req: OptimizeRequest = { characterKey: 'c', weaponKey: 'w', buildLevel: 90, constraints: {}, objective: 'crit_value' };

it('shows the infeasible message when there are no builds', () => {
  const r: OptimizeResult = { builds: [], explored: 10, pruned: 2, reason: 'NO_FEASIBLE_BUILD' };
  render(<Results result={r} request={req} artifactsById={{}} />);
  expect(screen.getByText(/No build satisfies all constraints/i)).toBeInTheDocument();
});

it('renders one card per build with its objective value and pieces', () => {
  const artifactsById: Record<string, Artifact> = {
    f: { id: 'f', setKey: 'EmblemOfSeveredFate', slot: 'flower', rarity: 5, level: 20, mainStat: 'hp', mainStatValue: 4780, subStats: [] },
    p: { id: 'p', setKey: 'EmblemOfSeveredFate', slot: 'plume', rarity: 5, level: 20, mainStat: 'atk', mainStatValue: 311, subStats: [] },
    s: { id: 's', setKey: 'EmblemOfSeveredFate', slot: 'sands', rarity: 5, level: 20, mainStat: 'atk_pct', mainStatValue: 46.6, subStats: [] },
    g: { id: 'g', setKey: 'EmblemOfSeveredFate', slot: 'goblet', rarity: 5, level: 20, mainStat: 'elemental_dmg', mainStatValue: 46.6, subStats: [] },
    c: { id: 'c', setKey: 'NoblesseOblige', slot: 'circlet', rarity: 5, level: 20, mainStat: 'crit_rate', mainStatValue: 31.1, subStats: [] },
  };
  const r: OptimizeResult = {
    explored: 100, pruned: 50,
    builds: [{
      artifactIds: { flower: 'f', plume: 'p', sands: 's', goblet: 'g', circlet: 'c' },
      totals: { crit_rate: 60, crit_dmg: 120, atk: 2000 }, objectiveValue: 240, score: 240,
      diagnostics: { bindingConstraints: [], marginalBySlot: {}, explored: 100, pruned: 50 },
    }],
  };
  render(<Results result={r} request={req} artifactsById={artifactsById} />);
  expect(screen.getByText(/240/)).toBeInTheDocument();
  expect(screen.getAllByText(/EmblemOfSeveredFate/).length).toBeGreaterThan(0);
});
