import { describe, it, expect } from 'vitest';
import { META_TARGETS, metaToConstraints } from './metaTargets';
import { genshinAdapter } from '../game/genshin/adapter';

describe('META_TARGETS', () => {
  it('covers the four showcase characters with sets present in the snapshot', () => {
    const setKeys = new Set(genshinAdapter.sets().map((s) => s.key));
    const charKeys = new Set(genshinAdapter.characters().map((c) => c.key));
    for (const key of ['furina', 'nahida', 'navia', 'neuvillette']) {
      const m = META_TARGETS[key];
      expect(m, key).toBeTruthy();
      expect(charKeys.has(m.characterKey)).toBe(true);
      const req = m.setRequirement;
      const keys = req.kind === '2+2' ? req.setKeys : [req.setKey];
      for (const sk of keys)
        expect(setKeys.has(sk), `${key} set ${sk}`).toBe(true);
    }
  });

  it('metaToConstraints maps a recipe to OptimizeConstraints', () => {
    const c = metaToConstraints(META_TARGETS.furina);
    expect(c.setRequirement).toEqual({ kind: '4pc', setKey: 'GoldenTroupe' });
    expect(c.mainStatLocks).toEqual({
      sands: 'hp_pct',
      goblet: 'elemental_dmg',
    });
    expect(c.minStats?.er_pct).toBe(130);
  });

  it('omits minStats when there is no ER target', () => {
    const c = metaToConstraints(META_TARGETS.nahida);
    expect(c.minStats?.er_pct).toBeUndefined();
  });
});
