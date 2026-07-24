import { describe, it, expect } from 'vitest';
import { genshinAdapter } from '../../game/genshin/adapter';
import { isStatKey } from '../../game/types';
import type { OwnedWeapon } from '../../import/good';
import {
  GUIDES,
  bestFieldableComp,
  bestOwnedWeapon,
  buildMetaRequest,
  formatSubstatPriority,
  metaToConstraints,
  resolveTeammateName,
  talentGaps,
  type TalentTargets,
  type TeamComp,
} from './index';

function weapon(
  key: string,
  location: string | null,
  overrides: Partial<OwnedWeapon> = {},
): OwnedWeapon {
  return { key, level: 90, refinement: 1, location, ...overrides };
}

describe('metaToConstraints', () => {
  it('maps a recipe to OptimizeConstraints', () => {
    const c = metaToConstraints(GUIDES.furina.build!);
    expect(c.setRequirement).toEqual({ kind: '4pc', setKey: 'GoldenTroupe' });
    expect(c.mainStatLocks).toEqual({
      sands: 'hp_pct',
      goblet: 'elemental_dmg',
    });
    expect(c.minStats?.er_pct).toBe(130);
  });

  it('omits minStats when there is no ER target', () => {
    const c = metaToConstraints(GUIDES.nahida.build!);
    expect(c.minStats?.er_pct).toBeUndefined();
  });
});

describe('bestOwnedWeapon', () => {
  it('returns null when the character has no ranking table', () => {
    expect(bestOwnedWeapon('zzz_not_curated', [])).toBeNull();
  });

  it('returns null when nothing owned matches the ranking list', () => {
    expect(bestOwnedWeapon('furina', [weapon('dull_blade', null)])).toBeNull();
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

describe('talentGaps', () => {
  const target: TalentTargets = {
    priority: ['burst', 'skill', 'auto'],
    levels: { burst: 9, skill: 9, auto: 6 },
  };

  it('reports every slot with have:null when owned is undefined', () => {
    expect(talentGaps(target, undefined)).toEqual([
      { slot: 'burst', have: null, want: 9 },
      { slot: 'skill', have: null, want: 9 },
      { slot: 'auto', have: null, want: 6 },
    ]);
  });

  it('omits slots already at or above target', () => {
    const gaps = talentGaps(target, { burst: 9, skill: 5, auto: 6 });
    expect(gaps).toEqual([{ slot: 'skill', have: 5, want: 9 }]);
  });

  it('returns [] when every slot meets its target', () => {
    expect(talentGaps(target, { burst: 10, skill: 9, auto: 10 })).toEqual([]);
  });

  it('preserves priority order in the output', () => {
    const gaps = talentGaps(target, { burst: 1, skill: 1, auto: 1 });
    expect(gaps.map((g) => g.slot)).toEqual(['burst', 'skill', 'auto']);
  });
});

describe('bestFieldableComp', () => {
  const comps: TeamComp[] = [
    {
      name: 'Comp A',
      slots: [
        { role: 'a', options: ['x', 'y'] },
        { role: 'b', options: ['z'] },
        { role: 'c', options: ['w'] },
      ],
    },
    {
      name: 'Comp B',
      slots: [
        { role: 'a', options: ['p'] },
        { role: 'b', options: ['q'] },
        { role: 'c', options: ['r'] },
      ],
    },
  ];

  it('returns null when there are no comps', () => {
    expect(bestFieldableComp([], new Set(['x']))).toBeNull();
  });

  it('picks the comp that fills the most slots', () => {
    const result = bestFieldableComp(comps, new Set(['p', 'q', 'r']));
    expect(result?.comp.name).toBe('Comp B');
    expect(result?.filledCount).toBe(3);
  });

  it('resolves each slot to the best-ranked owned option', () => {
    const result = bestFieldableComp(comps, new Set(['y', 'z']));
    expect(result?.comp.name).toBe('Comp A');
    expect(result?.filled).toEqual(['y', 'z', null]);
  });

  it('returns a fully-null fill (not null overall) when nothing is owned', () => {
    const result = bestFieldableComp(comps, new Set());
    expect(result).not.toBeNull();
    expect(result?.filledCount).toBe(0);
    expect(result?.filled).toEqual([null, null, null]);
  });
});

describe('resolveTeammateName', () => {
  it('falls back to the raw key when the character is not in the dataset', () => {
    expect(resolveTeammateName('not_a_real_key', [])).toBe('not_a_real_key');
  });

  it('resolves a known character to its display name', () => {
    expect(
      resolveTeammateName('bennett', [{ key: 'bennett', name: 'Bennett' }]),
    ).toBe('Bennett');
  });
});

describe('formatSubstatPriority', () => {
  it('joins priority with " > "', () => {
    expect(
      formatSubstatPriority({ priority: ['crit_rate', 'crit_dmg', 'atk'] }),
    ).toBe('CRIT Rate > CRIT DMG > ATK');
  });

  it('annotates a floor with ≥ and % for percent stats', () => {
    expect(
      formatSubstatPriority({
        priority: ['er_pct', 'crit_rate'],
        floors: { er_pct: 120 },
      }),
    ).toBe('Energy Recharge (≥120%) > CRIT Rate');
  });

  it('omits % for non-percent stats with a floor', () => {
    expect(
      formatSubstatPriority({ priority: ['em'], floors: { em: 200 } }),
    ).toBe('Elemental Mastery (≥200)');
  });
});

describe('buildMetaRequest', () => {
  const meta = GUIDES.furina.build!;

  it('uses the roster-equipped weapon when present', () => {
    const req = buildMetaRequest(
      'furina',
      meta,
      { weaponKey: 'favonius_sword' },
      [],
    );
    expect(req?.weaponKey).toBe('favonius_sword');
    expect(req?.buildLevel).toBe(90);
  });

  it('falls back to bestOwnedWeapon when no weapon is equipped', () => {
    const owned = [weapon('primordial_jade_cutter', null)];
    const req = buildMetaRequest('furina', meta, undefined, owned);
    expect(req?.weaponKey).toBe('primordial_jade_cutter');
  });

  it('returns null when there is no equipped or owned ranked weapon', () => {
    expect(buildMetaRequest('furina', meta, undefined, [])).toBeNull();
  });

  it('respects an explicit roster buildLevel over the 90 default', () => {
    const req = buildMetaRequest(
      'furina',
      meta,
      { weaponKey: 'favonius_sword', buildLevel: 70 },
      [],
    );
    expect(req?.buildLevel).toBe(70);
  });
});

describe('GUIDES data integrity', () => {
  const characterKeys = new Set(genshinAdapter.characters().map((c) => c.key));
  const weaponKeys = new Set(genshinAdapter.weapons().map((w) => w.key));
  const setKeys = new Set(genshinAdapter.sets().map((s) => s.key));

  // Character weapon classes, hand-maintained: the character dataset has no
  // weapon-type field, and without this check a curated entry can recommend
  // a weapon the character cannot equip (it happened — see the fix-1509 sweep).
  const WEAPON_CLASS: Record<string, string> = {
    furina: 'sword',
    nahida: 'catalyst',
    navia: 'claymore',
    neuvillette: 'catalyst',
    hu_tao: 'polearm',
    arataki_itto: 'claymore',
    raiden_shogun: 'polearm',
    xiao: 'polearm',
    klee: 'catalyst',
    tartaglia: 'bow',
    keqing: 'sword',
    kamisato_ayaka: 'sword',
    yoimiya: 'bow',
    alhaitham: 'sword',
    cyno: 'polearm',
    wanderer: 'catalyst',
    ganyu: 'bow',
    arlecchino: 'polearm',
    xingqiu: 'sword',
    yelan: 'bow',
    xiangling: 'polearm',
    bennett: 'sword',
    kaedehara_kazuha: 'sword',
    zhongli: 'polearm',
    kuki_shinobu: 'sword',
    faruzan: 'bow',
    sigewinne: 'bow',
    kujou_sara: 'bow',
    wriothesley: 'catalyst',
    clorinde: 'sword',
    chasca: 'bow',
    ifa: 'catalyst',
    jahoda: 'bow',
    jean: 'sword',
    lan_yan: 'catalyst',
    lynette: 'sword',
    prune: 'catalyst',
    sayu: 'claymore',
    shikanoin_heizou: 'catalyst',
    sucrose: 'catalyst',
    varka: 'claymore',
    venti: 'bow',
    xianyun: 'catalyst',
    yumemizuki_mizuki: 'catalyst',
    aloy: 'bow',
    charlotte: 'catalyst',
    chongyun: 'claymore',
    citlali: 'catalyst',
    diona: 'bow',
    escoffier: 'polearm',
    eula: 'claymore',
    freminet: 'claymore',
    kaeya: 'sword',
    layla: 'sword',
    lohen: 'polearm',
    mika: 'polearm',
    qiqi: 'sword',
    rosaria: 'polearm',
    sandrone: 'claymore',
    shenhe: 'polearm',
    skirk: 'sword',
    baizhu: 'catalyst',
    collei: 'bow',
    emilie: 'polearm',
    kaveh: 'claymore',
    kinich: 'claymore',
    kirara: 'sword',
    lauma: 'catalyst',
    nefer: 'catalyst',
    tighnari: 'bow',
    yaoyao: 'polearm',
    beidou: 'claymore',
    dori: 'claymore',
    fischl: 'bow',
    flins: 'polearm',
    iansan: 'polearm',
    ineffa: 'polearm',
    lisa: 'catalyst',
    ororon: 'bow',
    razor: 'claymore',
    sethos: 'bow',
    varesa: 'catalyst',
    yae_miko: 'catalyst',
    albedo: 'sword',
    chiori: 'sword',
    gorou: 'bow',
    illuga: 'polearm',
    kachina: 'polearm',
    linnea: 'bow',
    ningguang: 'catalyst',
    noelle: 'claymore',
    xilonen: 'sword',
    yun_jin: 'polearm',
    zibai: 'sword',
    aino: 'claymore',
    barbara: 'catalyst',
    candace: 'polearm',
    columbina: 'catalyst',
    dahlia: 'sword',
    kamisato_ayato: 'sword',
    mona: 'catalyst',
    mualani: 'catalyst',
    nilou: 'sword',
    sangonomiya_kokomi: 'catalyst',
  };

  it('every characterKey resolves against the dataset', () => {
    for (const key of Object.keys(GUIDES)) {
      expect(characterKeys.has(key), `missing character: ${key}`).toBe(true);
    }
  });

  it('every entry has a source URL', () => {
    for (const [key, guide] of Object.entries(GUIDES)) {
      expect(guide.source, `${key} source`).toMatch(/^https?:\/\//);
    }
  });

  it('covers at least the four original showcase characters', () => {
    for (const key of ['furina', 'nahida', 'navia', 'neuvillette']) {
      expect(GUIDES[key], key).toBeTruthy();
    }
  });

  it('build.setRequirement resolves to real sets', () => {
    for (const [key, guide] of Object.entries(GUIDES)) {
      if (!guide.build) continue;
      const req = guide.build.setRequirement;
      const keys = req.kind === '2+2' ? req.setKeys : [req.setKey];
      for (const sk of keys)
        expect(setKeys.has(sk), `${key} set ${sk}`).toBe(true);
    }
  });

  it('every ranked weapon resolves against the dataset', () => {
    for (const [key, guide] of Object.entries(GUIDES)) {
      for (const rec of guide.weapons ?? []) {
        expect(
          weaponKeys.has(rec.weaponKey),
          `${key}: missing weapon ${rec.weaponKey}`,
        ).toBe(true);
      }
    }
  });

  it('every ranked weapon matches the character weapon class', () => {
    const typeByKey = new Map(
      genshinAdapter.weapons().map((w) => [w.key, w.type]),
    );
    for (const [key, guide] of Object.entries(GUIDES)) {
      if (!guide.weapons) continue;
      const cls = WEAPON_CLASS[key];
      expect(cls, `add ${key} to WEAPON_CLASS`).toBeDefined();
      for (const rec of guide.weapons) {
        expect(typeByKey.get(rec.weaponKey), `${key} → ${rec.weaponKey}`).toBe(
          cls,
        );
      }
    }
  });

  it('every talent entry has levels defined for every slot in its priority', () => {
    for (const [key, guide] of Object.entries(GUIDES)) {
      if (!guide.talents) continue;
      for (const slot of guide.talents.priority) {
        expect(
          guide.talents.levels[slot],
          `${key}: missing level for ${slot}`,
        ).toBeGreaterThan(0);
      }
    }
  });

  it('every team comp characterKey (both table keys and slot options) resolves against the dataset', () => {
    for (const [key, guide] of Object.entries(GUIDES)) {
      for (const comp of guide.teams ?? []) {
        for (const slot of comp.slots) {
          for (const option of slot.options) {
            expect(
              characterKeys.has(option),
              `${key}/${comp.name}: missing option ${option}`,
            ).toBe(true);
          }
        }
      }
    }
  });

  it('every constellation level is 1-6', () => {
    for (const [key, guide] of Object.entries(GUIDES)) {
      for (const c of guide.constellations ?? []) {
        expect(c.level, `${key}`).toBeGreaterThanOrEqual(1);
        expect(c.level, `${key}`).toBeLessThanOrEqual(6);
      }
    }
  });

  it('every substat priority key is a valid StatKey', () => {
    for (const [key, guide] of Object.entries(GUIDES)) {
      if (!guide.substats) continue;
      for (const s of guide.substats.priority) {
        expect(isStatKey(s), `${key}: invalid substat key ${s}`).toBe(true);
      }
    }
  });
});
