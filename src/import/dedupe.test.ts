import { describe, it, expect } from 'vitest';
import { artifactHash, mergeNew } from './dedupe';
import type { Artifact } from '../game/types';

const base: Artifact = {
  id: 'x',
  setKey: 'EmblemOfSeveredFate',
  slot: 'sands',
  rarity: 5,
  level: 20,
  mainStat: 'atk_pct',
  mainStatValue: 46.6,
  subStats: [{ key: 'crit_dmg', value: 14 }],
};

describe('artifactHash', () => {
  it('is identical for the same content regardless of id', () => {
    expect(artifactHash(base)).toBe(artifactHash({ ...base, id: 'different' }));
  });

  it('differs when a sub-stat value differs', () => {
    expect(artifactHash(base)).not.toBe(
      artifactHash({ ...base, subStats: [{ key: 'crit_dmg', value: 15 }] }),
    );
  });
});

describe('mergeNew', () => {
  it('drops incoming pieces whose content already exists (ignoring id)', () => {
    const existing = [base];
    const incoming = [{ ...base, id: 'dup' }];
    expect(mergeNew(existing, incoming)).toEqual([]);
  });

  it('keeps incoming pieces with distinct content', () => {
    const distinct: Artifact = { ...base, id: 'y', slot: 'goblet' };
    expect(mergeNew([base], [distinct])).toEqual([distinct]);
  });

  it('is independent of the order of existing', () => {
    const a2: Artifact = { ...base, id: 'a2', slot: 'circlet' };
    const incoming = [{ ...base, id: 'dup' }, { ...a2, id: 'dup2' }];
    expect(mergeNew([base, a2], incoming)).toEqual([]);
    expect(mergeNew([a2, base], incoming)).toEqual([]);
  });

  it('returns all incoming when existing is empty', () => {
    expect(mergeNew([], [base])).toEqual([base]);
  });
});
