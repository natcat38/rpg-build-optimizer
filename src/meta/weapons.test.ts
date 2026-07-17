import { describe, it, expect } from 'vitest';
import { WEAPON_RANKINGS, bestOwnedWeapon } from './weapons';
import { genshinAdapter } from '../game/genshin/adapter';
import type { OwnedWeapon } from '../import/good';

function weapon(
  key: string,
  location: string | null,
  overrides: Partial<OwnedWeapon> = {},
): OwnedWeapon {
  return { key, level: 90, refinement: 1, location, ...overrides };
}

describe('bestOwnedWeapon', () => {
  it('returns null when the character has no ranking table', () => {
    expect(bestOwnedWeapon('zzz_not_curated', [])).toBeNull();
  });

  it('returns null when nothing owned matches the ranking list', () => {
    expect(
      bestOwnedWeapon('furina', [weapon('dull_blade', null)]),
    ).toBeNull();
  });

  it('picks the highest-ranked owned weapon', () => {
    const owned = [
      weapon('favonius_sword', null), // rank 4
      weapon('freedomsworn', null), // rank 3
    ];
    const result = bestOwnedWeapon('furina', owned);
    expect(result?.rec.weaponKey).toBe('freedomsworn');
    expect(result?.conflictWith).toBeNull();
  });

  it('prefers an unequipped or self-equipped copy over one equipped elsewhere', () => {
    const owned = [
      weapon('splendor_of_tranquil_waters', 'kamisato_ayaka'),
      weapon('splendor_of_tranquil_waters', null),
    ];
    const result = bestOwnedWeapon('furina', owned);
    expect(result?.ownedAs.location).toBeNull();
    expect(result?.conflictWith).toBeNull();
  });

  it('flags a conflict when every owned copy is equipped elsewhere', () => {
    const owned = [weapon('splendor_of_tranquil_waters', 'kamisato_ayaka')];
    const result = bestOwnedWeapon('furina', owned);
    expect(result?.conflictWith).toBe('kamisato_ayaka');
  });

  it('does not flag a conflict when equipped on the character itself', () => {
    const owned = [weapon('splendor_of_tranquil_waters', 'furina')];
    const result = bestOwnedWeapon('furina', owned);
    expect(result?.conflictWith).toBeNull();
  });
});

describe('WEAPON_RANKINGS data integrity', () => {
  const characterKeys = new Set(genshinAdapter.characters().map((c) => c.key));
  const weaponKeys = new Set(genshinAdapter.weapons().map((w) => w.key));

  it('every characterKey resolves against the dataset', () => {
    for (const key of Object.keys(WEAPON_RANKINGS)) {
      expect(characterKeys.has(key), `missing character: ${key}`).toBe(true);
    }
  });

  it('every weaponKey resolves against the dataset', () => {
    for (const [charKey, { recs }] of Object.entries(WEAPON_RANKINGS)) {
      for (const rec of recs) {
        expect(
          weaponKeys.has(rec.weaponKey),
          `${charKey}: missing weapon ${rec.weaponKey}`,
        ).toBe(true);
      }
    }
  });
});
