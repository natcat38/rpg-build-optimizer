import { describe, it, expect } from 'vitest';
import { genshinAdapter } from './adapter';

describe('genshinAdapter', () => {
  it('exposes the five slots', () => {
    expect(genshinAdapter.slots).toEqual(['flower', 'plume', 'sands', 'goblet', 'circlet']);
  });
  it('returns a non-empty character list', () => {
    expect(genshinAdapter.characters().length).toBeGreaterThan(0);
  });
  it('produces base stats with positive base ATK at level 90', () => {
    const chars = genshinAdapter.characters();
    const weapons = genshinAdapter.weapons();
    const base = genshinAdapter.baseStats(chars[0].key, weapons[0].key, 90);
    expect((base.atk ?? 0)).toBeGreaterThan(0);
  });
  it('resolves a 5-star ATK% main stat value at +20 to a known ~46.6%', () => {
    const v = genshinAdapter.mainStatValue('atk_pct', 5, 20);
    expect(v).toBeGreaterThan(40);
    expect(v).toBeLessThan(50);
  });
});
