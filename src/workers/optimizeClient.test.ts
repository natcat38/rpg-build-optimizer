import { describe, it, expect } from 'vitest';
import { optimize } from './optimizeClient';
import { genshinAdapter } from '../game/genshin/adapter';
import type { Artifact, OptimizeRequest } from '../game/types';
import { SLOTS } from '../game/types';

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

describe('optimize (deep entry, sync fallback)', () => {
  it('builds context from the adapter and resolves with builds', async () => {
    const chars = genshinAdapter.characters();
    const weapons = genshinAdapter.weapons();
    const req: OptimizeRequest = {
      characterKey: chars[0].key,
      weaponKey: weapons[0].key,
      buildLevel: 90,
      constraints: {},
      objective: 'crit_value',
      topK: 3,
    };
    const r = await optimize(req, inv);
    expect(r.builds.length).toBeGreaterThan(0);
  });
});
