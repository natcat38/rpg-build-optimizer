import { describe, it, expect } from 'vitest';
import { artifactHash } from './hash';
import type { Artifact } from '../game/types';

const base: Artifact = {
  id: 'x', setKey: 'EmblemOfSeveredFate', slot: 'sands', rarity: 5, level: 20,
  mainStat: 'atk_pct', mainStatValue: 46.6, subStats: [{ key: 'crit_dmg', value: 14 }],
};

describe('artifactHash', () => {
  it('is identical for the same content regardless of id', () => {
    expect(artifactHash(base)).toBe(artifactHash({ ...base, id: 'different' }));
  });

  it('differs when a sub-stat value differs', () => {
    expect(artifactHash(base)).not.toBe(artifactHash({ ...base, subStats: [{ key: 'crit_dmg', value: 15 }] }));
  });
});
