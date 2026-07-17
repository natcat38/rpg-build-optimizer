import type {
  Objective,
  OptimizeConstraints,
  SetRequirement,
  Slot,
  StatKey,
  StatVec,
} from '../game/types';

// ponytail: this whole table is hand-transcribed from the `source` guides below
// and has no automated check against patch drift or guide updates — the `source`
// links are the re-verification path. Curated as of patch 6.7 (see PATCH in
// game/genshin/adapter.ts); re-check entries after a kit rework or major meta shift.

/** A frozen, overridable meta build recipe (ADR-0007). Adapted from KQM guides. */
export interface MetaTarget {
  characterKey: string;
  setRequirement: SetRequirement; // 4pc | 2pc | 2+2
  mains: Partial<Record<Slot, StatKey>>; // usually sands + goblet; circlet left free
  erTarget?: number; // er_pct floor (includes the +100 base ER)
  critRatioTarget?: number; // score.ts convention: cr/(cr+cd); 1:2 CR:CD ≈ 0.333
  objective: Objective;
  source: string; // KQM guide URL
  /** Endgame-ready stat-line floors (e.g. { crit_rate: 70, crit_dmg: 140 }), for
   *  grading a build against (Item 4) — not a hard optimiser constraint. See
   *  metaToConstraints for why these never become minStats. */
  statTargets?: StatVec;
}

export const META_TARGETS: Record<string, MetaTarget> = {
  furina: {
    characterKey: 'furina',
    setRequirement: { kind: '4pc', setKey: 'GoldenTroupe' },
    mains: { sands: 'hp_pct', goblet: 'elemental_dmg' },
    erTarget: 130,
    objective: 'crit_value',
    source: 'https://keqingmains.com/furina/',
  },
  nahida: {
    characterKey: 'nahida',
    setRequirement: { kind: '4pc', setKey: 'GildedDreams' },
    mains: { sands: 'em', goblet: 'em' },
    objective: 'crit_value',
    source: 'https://keqingmains.com/nahida/',
    statTargets: { em: 900 },
  },
  navia: {
    characterKey: 'navia',
    setRequirement: {
      kind: '4pc',
      setKey: 'NighttimeWhispersInTheEchoingWoods',
    },
    mains: { sands: 'atk_pct', goblet: 'elemental_dmg' },
    erTarget: 140,
    critRatioTarget: 0.333,
    objective: 'crit_value',
    source: 'https://keqingmains.com/navia/',
  },
  neuvillette: {
    characterKey: 'neuvillette',
    setRequirement: { kind: '4pc', setKey: 'MarechausseeHunter' },
    mains: { sands: 'hp_pct', goblet: 'elemental_dmg' },
    critRatioTarget: 0.333,
    objective: 'crit_value',
    source: 'https://keqingmains.com/neuvillette/',
  },
  hu_tao: {
    characterKey: 'hu_tao',
    setRequirement: { kind: '4pc', setKey: 'CrimsonWitchOfFlames' },
    mains: { sands: 'hp_pct', goblet: 'elemental_dmg' },
    critRatioTarget: 0.333,
    objective: 'crit_value',
    source: 'https://keqingmains.com/hutao/',
  },
  arataki_itto: {
    characterKey: 'arataki_itto',
    setRequirement: { kind: '4pc', setKey: 'HuskOfOpulentDreams' },
    mains: { sands: 'def_pct', goblet: 'elemental_dmg' },
    erTarget: 130,
    objective: 'crit_value',
    source: 'https://keqingmains.com/itto/',
  },
  raiden_shogun: {
    characterKey: 'raiden_shogun',
    setRequirement: { kind: '4pc', setKey: 'EmblemOfSeveredFate' },
    mains: { sands: 'atk_pct', goblet: 'elemental_dmg' },
    erTarget: 200,
    critRatioTarget: 0.333,
    objective: 'crit_value',
    source: 'https://keqingmains.com/raiden/',
  },
  xiao: {
    characterKey: 'xiao',
    setRequirement: { kind: '4pc', setKey: 'VermillionHereafter' },
    mains: { sands: 'atk_pct', goblet: 'elemental_dmg' },
    erTarget: 120,
    critRatioTarget: 0.333,
    objective: 'crit_value',
    source: 'https://keqingmains.com/xiao/',
    statTargets: { crit_rate: 70 },
  },
  klee: {
    characterKey: 'klee',
    setRequirement: {
      kind: '2+2',
      setKeys: ['CrimsonWitchOfFlames', 'GladiatorsFinale'],
    },
    mains: { sands: 'atk_pct', goblet: 'elemental_dmg' },
    erTarget: 100,
    objective: 'crit_value',
    source: 'https://keqingmains.com/klee/',
  },
  tartaglia: {
    characterKey: 'tartaglia',
    setRequirement: { kind: '4pc', setKey: 'NymphsDream' },
    mains: { sands: 'atk_pct', goblet: 'elemental_dmg' },
    erTarget: 125,
    objective: 'crit_value',
    source: 'https://keqingmains.com/childe/',
  },
  keqing: {
    characterKey: 'keqing',
    setRequirement: { kind: '4pc', setKey: 'ThunderingFury' },
    mains: { sands: 'atk_pct', goblet: 'elemental_dmg' },
    objective: 'crit_value',
    source: 'https://keqingmains.com/keqing/',
  },
  kamisato_ayaka: {
    characterKey: 'kamisato_ayaka',
    setRequirement: { kind: '4pc', setKey: 'BlizzardStrayer' },
    mains: { sands: 'atk_pct', goblet: 'elemental_dmg' },
    erTarget: 140,
    objective: 'crit_value',
    source: 'https://keqingmains.com/ayaka/',
  },
  yoimiya: {
    characterKey: 'yoimiya',
    setRequirement: { kind: '4pc', setKey: 'ShimenawasReminiscence' },
    mains: { sands: 'atk_pct', goblet: 'elemental_dmg' },
    objective: 'crit_value',
    source: 'https://keqingmains.com/yoimiya/',
  },
  alhaitham: {
    characterKey: 'alhaitham',
    setRequirement: { kind: '4pc', setKey: 'GildedDreams' },
    mains: { sands: 'em', goblet: 'elemental_dmg' },
    erTarget: 105,
    objective: 'crit_value',
    source: 'https://keqingmains.com/q/alhaitham-quickguide',
    statTargets: { em: 200 },
  },
  cyno: {
    characterKey: 'cyno',
    setRequirement: { kind: '4pc', setKey: 'ThunderingFury' },
    mains: { sands: 'em', goblet: 'elemental_dmg' },
    erTarget: 140,
    objective: 'crit_value',
    source: 'https://keqingmains.com/q/cyno-quickguide',
  },
  wanderer: {
    characterKey: 'wanderer',
    setRequirement: { kind: '4pc', setKey: 'DesertPavilionChronicle' },
    mains: { sands: 'atk_pct', goblet: 'elemental_dmg' },
    erTarget: 100,
    critRatioTarget: 0.333,
    objective: 'crit_value',
    source: 'https://keqingmains.com/wanderer/',
  },
  ganyu: {
    characterKey: 'ganyu',
    setRequirement: { kind: '4pc', setKey: 'BlizzardStrayer' },
    mains: { sands: 'atk_pct', goblet: 'elemental_dmg' },
    erTarget: 111,
    critRatioTarget: 0.167,
    objective: 'crit_value',
    source: 'https://keqingmains.com/ganyu/',
    statTargets: { crit_rate: 35, crit_dmg: 200, atk: 1800 },
  },
  arlecchino: {
    characterKey: 'arlecchino',
    setRequirement: { kind: '4pc', setKey: 'FragmentOfHarmonicWhimsy' },
    mains: { sands: 'atk_pct', goblet: 'elemental_dmg' },
    erTarget: 150,
    objective: 'crit_value',
    source: 'https://keqingmains.com/q/arlecchino-quickguide',
  },
  xingqiu: {
    characterKey: 'xingqiu',
    setRequirement: { kind: '4pc', setKey: 'EmblemOfSeveredFate' },
    mains: { sands: 'er_pct', goblet: 'elemental_dmg' },
    erTarget: 140,
    objective: 'crit_value',
    source: 'https://keqingmains.com/xingqiu/',
  },
  yelan: {
    characterKey: 'yelan',
    setRequirement: { kind: '4pc', setKey: 'EmblemOfSeveredFate' },
    mains: { sands: 'hp_pct', goblet: 'elemental_dmg' },
    erTarget: 160,
    critRatioTarget: 0.333,
    objective: 'crit_value',
    source: 'https://keqingmains.com/yelan/',
    statTargets: { hp: 30000, crit_rate: 70, crit_dmg: 140 },
  },
  xiangling: {
    characterKey: 'xiangling',
    setRequirement: { kind: '4pc', setKey: 'EmblemOfSeveredFate' },
    mains: { sands: 'er_pct', goblet: 'elemental_dmg' },
    erTarget: 160,
    critRatioTarget: 0.333,
    objective: 'crit_value',
    source: 'https://keqingmains.com/xiangling/',
  },
  bennett: {
    characterKey: 'bennett',
    setRequirement: { kind: '4pc', setKey: 'NoblesseOblige' },
    mains: { sands: 'er_pct', goblet: 'hp_pct' },
    erTarget: 180,
    objective: 'hp_pct',
    source: 'https://keqingmains.com/bennett/',
  },
  kaedehara_kazuha: {
    characterKey: 'kaedehara_kazuha',
    setRequirement: { kind: '4pc', setKey: 'ViridescentVenerer' },
    mains: { sands: 'em', goblet: 'em' },
    erTarget: 190,
    objective: 'em',
    source: 'https://keqingmains.com/kazuha/',
  },
  zhongli: {
    characterKey: 'zhongli',
    setRequirement: { kind: '2pc', setKey: 'TenacityOfTheMillelith' },
    mains: { sands: 'hp_pct', goblet: 'hp_pct', circlet: 'hp_pct' },
    objective: 'hp_pct',
    source: 'https://keqingmains.com/zhongli/',
  },
  kuki_shinobu: {
    characterKey: 'kuki_shinobu',
    setRequirement: { kind: '4pc', setKey: 'FlowerOfParadiseLost' },
    mains: { sands: 'em', goblet: 'em', circlet: 'em' },
    erTarget: 135,
    objective: 'em',
    source: 'https://keqingmains.com/q/shinobu-quickguide/',
  },
  faruzan: {
    characterKey: 'faruzan',
    setRequirement: { kind: '4pc', setKey: 'NoblesseOblige' },
    mains: { sands: 'er_pct' },
    erTarget: 275,
    objective: 'crit_value',
    source: 'https://keqingmains.com/faruzan/',
  },
  sigewinne: {
    characterKey: 'sigewinne',
    setRequirement: { kind: '4pc', setKey: 'OceanHuedClam' },
    mains: { sands: 'hp_pct', goblet: 'hp_pct' },
    erTarget: 115,
    objective: 'hp_pct',
    source: 'https://keqingmains.com/q/sigewinne-quickguide',
    statTargets: { hp: 65000 },
  },
  kujou_sara: {
    characterKey: 'kujou_sara',
    setRequirement: { kind: '4pc', setKey: 'EmblemOfSeveredFate' },
    mains: { sands: 'atk_pct', goblet: 'elemental_dmg' },
    erTarget: 160,
    critRatioTarget: 0.333,
    objective: 'crit_value',
    source: 'https://keqingmains.com/sara/',
  },
  wriothesley: {
    characterKey: 'wriothesley',
    setRequirement: { kind: '4pc', setKey: 'MarechausseeHunter' },
    mains: { sands: 'atk_pct', goblet: 'elemental_dmg' },
    erTarget: 100,
    objective: 'crit_value',
    source: 'https://keqingmains.com/q/wriothesley-quickguide/',
  },
  clorinde: {
    characterKey: 'clorinde',
    setRequirement: { kind: '4pc', setKey: 'FragmentOfHarmonicWhimsy' },
    mains: { sands: 'atk_pct', goblet: 'elemental_dmg' },
    erTarget: 110,
    objective: 'crit_value',
    source: 'https://keqingmains.com/q/clorinde-quickguide/',
  },
};

/**
 * Translate a meta recipe into the optimiser's constraint shape.
 *
 * `statTargets` is deliberately NOT folded into `minStats` here: it's a
 * grading rubric (Item 4), not a hard requirement. Most inventories can't
 * reach a full endgame stat line on every stat at once, so treating it as a
 * constraint would make most real inventories infeasible. `erTarget` stays
 * the only stat promoted to a hard floor by default — it's a "the build
 * doesn't function below this" threshold, not an aspirational target.
 */
export function metaToConstraints(meta: MetaTarget): OptimizeConstraints {
  const c: OptimizeConstraints = {
    setRequirement: meta.setRequirement,
    mainStatLocks: meta.mains,
  };
  if (meta.erTarget != null) c.minStats = { er_pct: meta.erTarget };
  if (meta.critRatioTarget != null) c.critRatioTarget = meta.critRatioTarget;
  return c;
}
