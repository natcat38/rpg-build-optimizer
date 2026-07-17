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
      weapon('primordial_jade_cutter', null), // rank 3
    ];
    const result = bestOwnedWeapon('furina', owned);
    expect(result?.rec.weaponKey).toBe('primordial_jade_cutter');
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

  // Character weapon classes, hand-maintained: the character dataset has no
  // weapon-type field, and without this check a curated entry can recommend
  // a weapon the character cannot equip (it happened — see the fix-1509 sweep).
  const WEAPON_CLASS: Record<string, string> = {
    furina: 'sword', nahida: 'catalyst', navia: 'claymore',
    neuvillette: 'catalyst', hu_tao: 'polearm', arataki_itto: 'claymore',
    raiden_shogun: 'polearm', xiao: 'polearm', klee: 'catalyst',
    tartaglia: 'bow', keqing: 'sword', kamisato_ayaka: 'sword',
    yoimiya: 'bow', alhaitham: 'sword', cyno: 'polearm',
    wanderer: 'catalyst', ganyu: 'bow', arlecchino: 'polearm',
    xingqiu: 'sword', yelan: 'bow', xiangling: 'polearm',
    bennett: 'sword', kaedehara_kazuha: 'sword', zhongli: 'polearm',
    kuki_shinobu: 'sword', faruzan: 'bow', sigewinne: 'bow',
    kujou_sara: 'bow', wriothesley: 'catalyst', clorinde: 'sword',
  };

  it('every ranked weapon matches the character weapon class', () => {
    const typeByKey = new Map(
      genshinAdapter.weapons().map((w) => [w.key, w.type]),
    );
    for (const [charKey, { recs }] of Object.entries(WEAPON_RANKINGS)) {
      const cls = WEAPON_CLASS[charKey];
      expect(cls, `add ${charKey} to WEAPON_CLASS`).toBeDefined();
      for (const rec of recs) {
        expect(
          typeByKey.get(rec.weaponKey),
          `${charKey} → ${rec.weaponKey}`,
        ).toBe(cls);
      }
    }
  });
});
