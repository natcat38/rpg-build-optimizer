import { describe, it, expect } from 'vitest';
import { genshinAdapter } from './adapter';
import data from './data.generated.json';

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

  // Regression: weapon base ATK must never be overwritten by the secondary stat.
  // Previously, weapons whose secondary stat was 'ATK' (ATK%) had base ATK
  // replaced with the raw fractional secondary value (e.g. 0.41 instead of ~509).
  it('preserves weapon base ATK at level 90 for 5★ ATK% secondary weapons', () => {
    // Wolf's Gravestone: 5★ claymore, base ATK ~608, secondary ATK%
    const wolfStats = data.weapons.find((w) => w.key === "wolf's_gravestone");
    expect(wolfStats).toBeDefined();
    expect(wolfStats?.byLevel['90']?.atk).toBeGreaterThan(400);

    // Akuoumaru: 4★ claymore, base ATK ~510, secondary ATK%
    const akuStats = data.weapons.find((w) => w.key === 'akuoumaru');
    expect(akuStats).toBeDefined();
    expect(akuStats?.byLevel['90']?.atk).toBeGreaterThan(400);

    // Amos' Bow: 5★ bow, base ATK ~608, secondary ATK%
    const amosStats = data.weapons.find((w) => w.key === "amos'_bow");
    expect(amosStats).toBeDefined();
    expect(amosStats?.byLevel['90']?.atk).toBeGreaterThan(400);
  });

  it('stores weapon ATK% secondary in percent-points (not 0..1 fraction)', () => {
    // Wolf's Gravestone ATK% secondary at 90 should be ~49.6, not ~0.5
    const wolfStats = data.weapons.find((w) => w.key === "wolf's_gravestone");
    const atk_pct = wolfStats?.byLevel['90']?.atk_pct ?? 0;
    expect(atk_pct).toBeGreaterThan(10);   // definitely not a 0..1 fraction
    expect(atk_pct).toBeLessThan(100);     // and not unreasonably large
  });

  it('every weapon with a level-90 entry has base ATK > 300', () => {
    const broken = data.weapons.filter(
      (w) => w.byLevel['90'] !== undefined && (w.byLevel['90'] as Record<string, number>).atk <= 300,
    );
    expect(broken.map((w) => w.key)).toEqual([]);
  });

  // Regression: parse2pc must recognise the "is increased by N%" phrasing.
  // Pale Flame's 2pc is "Physical DMG is increased by 25%." which lacks the
  // literal "+" the old physMatch regex required, so the set was dropped.
  it('parses Pale Flame 2pc as physical_dmg: 25', () => {
    const set = data.sets.find((s) => s.key === 'pale_flame');
    expect(set).toBeDefined();
    expect(set?.twoPiece).toEqual({ physical_dmg: 25 });
  });

  // Regression: parse2pc must recognise the value-before-element phrasing.
  // Archaic Petra's 2pc is "Gain a 15% Geo DMG Bonus." (value precedes the
  // element name), so the old element regex didn't match and the set was dropped.
  it('parses Archaic Petra 2pc as elemental_dmg: 15', () => {
    const set = data.sets.find((s) => s.key === 'archaic_petra');
    expect(set).toBeDefined();
    expect(set?.twoPiece).toEqual({ elemental_dmg: 15 });
  });
});
