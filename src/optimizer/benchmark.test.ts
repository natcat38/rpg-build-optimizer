import { describe, it, expect } from 'vitest';
import { makeInventory } from './benchmark';
import { SLOTS } from '../game/types';

describe('makeInventory', () => {
  it('produces exactly `size` artifacts spread across all five slots', () => {
    const inv = makeInventory(50, 1);
    expect(inv).toHaveLength(50);
    for (const slot of SLOTS) {
      expect(inv.filter((a) => a.slot === slot).length).toBe(10);
    }
  });

  it('gives every artifact a unique id and a slot-legal main stat', () => {
    const inv = makeInventory(40, 7);
    expect(new Set(inv.map((a) => a.id)).size).toBe(inv.length);
    const flowers = inv.filter((a) => a.slot === 'flower');
    expect(flowers.every((a) => a.mainStat === 'hp')).toBe(true);
    const circlets = inv.filter((a) => a.slot === 'circlet');
    expect(
      circlets.every((a) =>
        [
          'hp_pct',
          'atk_pct',
          'def_pct',
          'em',
          'crit_rate',
          'crit_dmg',
          'healing',
        ].includes(a.mainStat),
      ),
    ).toBe(true);
  });

  it('is deterministic for a given (size, seed)', () => {
    expect(makeInventory(35, 99)).toEqual(makeInventory(35, 99));
  });

  it('gives each artifact four distinct substats not equal to the main stat', () => {
    const inv = makeInventory(50, 3);
    for (const a of inv) {
      const keys = a.subStats.map((s) => s.key);
      expect(keys).toHaveLength(4);
      expect(new Set(keys).size).toBe(4);
      expect(keys).not.toContain(a.mainStat);
    }
  });

  it('distributes a remainder to the leading slots when size is not a multiple of 5', () => {
    const inv = makeInventory(7, 1);
    expect(inv).toHaveLength(7);
    const count = (slot: string) => inv.filter((a) => a.slot === slot).length;
    // distribute(7) = base 1 + remainder 2 to the first two slots
    expect(count('flower')).toBe(2);
    expect(count('plume')).toBe(2);
    expect(count('sands')).toBe(1);
    expect(count('goblet')).toBe(1);
    expect(count('circlet')).toBe(1);
  });
});
