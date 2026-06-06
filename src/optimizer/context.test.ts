import { describe, it, expect } from 'vitest';
import { buildContext } from './context';
import { genshinAdapter } from '../game/genshin/adapter';

describe('buildContext', () => {
  it('produces a base vector and set-bonus map from the adapter', () => {
    const chars = genshinAdapter.characters();
    const weapons = genshinAdapter.weapons();
    const ctx = buildContext(genshinAdapter, { characterKey: chars[0].key, weaponKey: weapons[0].key, buildLevel: 90, constraints: {}, objective: 'crit_value' });
    expect((ctx.base.atk ?? 0)).toBeGreaterThan(0);
    expect(Object.keys(ctx.setBonuses).length).toBeGreaterThan(0);
  });
});
