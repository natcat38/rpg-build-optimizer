import { describe, it, expect } from 'vitest';
import { runOptimize } from './optimizeClient';
import type { Artifact, OptimizeContext, OptimizeRequest } from '../game/types';
import { SLOTS } from '../game/types';

const ctx: OptimizeContext = {
  base: { crit_rate: 5, crit_dmg: 50 },
  setBonuses: {},
};
let c = 0;
const inv: Artifact[] = SLOTS.flatMap((slot) =>
  [0, 1].map((i) => ({
    id: `i${c++}`,
    setKey: 'A',
    slot,
    rarity: 5,
    level: 20,
    mainStat: 'crit_rate' as const,
    mainStatValue: i,
    subStats: [],
  })),
);
const req: OptimizeRequest = {
  characterKey: 'c',
  weaponKey: 'w',
  buildLevel: 90,
  constraints: {},
  objective: 'crit_value',
  topK: 3,
};

describe('runOptimize (sync fallback)', () => {
  it('resolves with builds when Worker is unavailable', async () => {
    const r = await runOptimize(req, inv, ctx);
    expect(r.builds.length).toBeGreaterThan(0);
  });
});
