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
  // --- Comp-ideal picks, verified against KQM guides on 2026-08-20 -------------
  // Every weight-1.0 "ideal" pick in src/teams/comps.ts needs a recipe here, or the
  // plan solves them unconstrained and returns a rainbow stat-stick. The coverage
  // guard lives in src/teams/comps.test.ts; the source record, the encoding rules
  // and the per-character ER ranges are in
  // docs/research/2026-08-20-meta-targets-verification.md.
  albedo: {
    characterKey: 'albedo',
    setRequirement: { kind: '4pc', setKey: 'HuskOfOpulentDreams' },
    mains: { sands: 'def_pct', goblet: 'def_pct' },
    erTarget: 140,
    critRatioTarget: 0.333,
    objective: 'crit_value',
    source: 'https://keqingmains.com/q/albedo-quickguide/',
  },
  baizhu: {
    characterKey: 'baizhu',
    setRequirement: { kind: '4pc', setKey: 'DeepwoodMemories' },
    mains: { sands: 'hp_pct', goblet: 'hp_pct', circlet: 'hp_pct' },
    erTarget: 150,
    objective: 'hp_pct',
    source: 'https://keqingmains.com/q/baizhu-quickguide/',
  },
  charlotte: {
    characterKey: 'charlotte',
    setRequirement: { kind: '4pc', setKey: 'NoblesseOblige' },
    mains: { sands: 'er_pct', goblet: 'atk_pct', circlet: 'healing' },
    erTarget: 200,
    objective: 'atk_pct',
    source: 'https://keqingmains.com/q/charlotte-quickguide/',
  },
  chasca: {
    characterKey: 'chasca',
    setRequirement: { kind: '4pc', setKey: 'ObsidianCodex' },
    mains: { sands: 'atk_pct', goblet: 'atk_pct' },
    erTarget: 110,
    critRatioTarget: 0.333,
    objective: 'crit_value',
    source: 'https://keqingmains.com/q/chasca-quickguide/',
  },
  chevreuse: {
    characterKey: 'chevreuse',
    setRequirement: { kind: '4pc', setKey: 'NoblesseOblige' },
    mains: { sands: 'hp_pct', goblet: 'hp_pct', circlet: 'hp_pct' },
    erTarget: 100,
    objective: 'hp_pct',
    source: 'https://keqingmains.com/q/chevreuse-quickguide/',
    statTargets: { hp: 40000 },
  },
  // Goblet: KQM lists "EM | Cryo DMG" unranked; five second sources put EM first.
  // Sands is deliberately unlocked — every source lists it as EM-or-ER, and an ER
  // sands is often what meets the 175 floor, so a lock would fight erTarget.
  citlali: {
    characterKey: 'citlali',
    setRequirement: { kind: '4pc', setKey: 'ScrollOfTheHeroOfCinderCity' },
    mains: { goblet: 'em' },
    erTarget: 175,
    objective: 'em',
    source: 'https://keqingmains.com/q/citlali-quickguide/',
  },
  emilie: {
    characterKey: 'emilie',
    setRequirement: { kind: '4pc', setKey: 'UnfinishedReverie' },
    mains: { sands: 'atk_pct', goblet: 'elemental_dmg' },
    erTarget: 140,
    critRatioTarget: 0.333,
    objective: 'crit_value',
    source: 'https://keqingmains.com/q/emilie-quickguide/',
  },
  // Sands unlocked: KQM says ATK%, Prydwen prefers ER% to reach the requirement.
  // With a 150 floor in play, let the search pick whichever clears it.
  escoffier: {
    characterKey: 'escoffier',
    setRequirement: { kind: '4pc', setKey: 'GoldenTroupe' },
    mains: { goblet: 'elemental_dmg' },
    erTarget: 150,
    critRatioTarget: 0.333,
    objective: 'crit_value',
    source: 'https://keqingmains.com/q/escoffier-quickguide/',
  },
  fischl: {
    characterKey: 'fischl',
    setRequirement: { kind: '4pc', setKey: 'GoldenTroupe' },
    mains: { sands: 'atk_pct', goblet: 'elemental_dmg' },
    erTarget: 130,
    critRatioTarget: 0.333,
    objective: 'crit_value',
    source: 'https://keqingmains.com/fischl/',
  },
  // Gorou's own multipliers are DEF-scaling, but the guide is explicit that his
  // artifacts go to ER and CRIT Rate (Favonius uptime) — his personal damage is
  // low enough that DEF% is a leftover, not the target.
  gorou: {
    characterKey: 'gorou',
    setRequirement: { kind: '4pc', setKey: 'ScrollOfTheHeroOfCinderCity' },
    mains: { sands: 'er_pct', goblet: 'elemental_dmg' },
    erTarget: 220,
    objective: 'crit_value',
    source: 'https://keqingmains.com/q/gorou-quickguide/',
  },
  kamisato_ayato: {
    characterKey: 'kamisato_ayato',
    setRequirement: { kind: '4pc', setKey: 'HeartOfDepth' },
    mains: { sands: 'atk_pct', goblet: 'elemental_dmg' },
    erTarget: 140,
    critRatioTarget: 0.333,
    objective: 'crit_value',
    source: 'https://keqingmains.com/ayato/',
  },
  kinich: {
    characterKey: 'kinich',
    setRequirement: { kind: '4pc', setKey: 'ObsidianCodex' },
    mains: { sands: 'atk_pct', goblet: 'elemental_dmg' },
    erTarget: 110,
    critRatioTarget: 0.333,
    objective: 'crit_value',
    source: 'https://keqingmains.com/q/kinich-quickguide/',
  },
  // No erTarget: her Burst charges off Fighting Spirit, not Energy, and the guide
  // says outright that she should not build ER%.
  mavuika: {
    characterKey: 'mavuika',
    setRequirement: { kind: '4pc', setKey: 'ObsidianCodex' },
    mains: { sands: 'atk_pct', goblet: 'elemental_dmg' },
    critRatioTarget: 0.333,
    objective: 'crit_value',
    source: 'https://keqingmains.com/q/mavuika-quickguide/',
  },
  // HP-scaling on-field DPS: the HP% sands guarantees the scaling stat and the
  // objective maximises crit on top, same shape as neuvillette/hu_tao above.
  mualani: {
    characterKey: 'mualani',
    setRequirement: { kind: '4pc', setKey: 'ObsidianCodex' },
    mains: { sands: 'hp_pct', goblet: 'elemental_dmg' },
    critRatioTarget: 0.333,
    objective: 'crit_value',
    source: 'https://keqingmains.com/q/mualani-quickguide/',
  },
  nilou: {
    characterKey: 'nilou',
    setRequirement: {
      kind: '2+2',
      setKeys: ['TenacityOfTheMillelith', 'VourukashasGlow'],
    },
    mains: { sands: 'hp_pct', goblet: 'hp_pct', circlet: 'hp_pct' },
    erTarget: 200,
    objective: 'hp_pct',
    source: 'https://keqingmains.com/q/nilou-quickguide/',
    statTargets: { hp: 30000 },
  },
  ororon: {
    characterKey: 'ororon',
    setRequirement: { kind: '4pc', setKey: 'ScrollOfTheHeroOfCinderCity' },
    mains: { sands: 'atk_pct', goblet: 'elemental_dmg' },
    erTarget: 140,
    critRatioTarget: 0.333,
    objective: 'crit_value',
    source: 'https://keqingmains.com/q/ororon-quickguide/',
  },
  // Her kit gives -100% CRIT Rate, so the Healing Bonus circlet is mandatory
  // rather than a preference — never let the optimiser hand her a crit circlet.
  sangonomiya_kokomi: {
    characterKey: 'sangonomiya_kokomi',
    setRequirement: { kind: '4pc', setKey: 'OceanHuedClam' },
    mains: { sands: 'hp_pct', goblet: 'elemental_dmg', circlet: 'healing' },
    erTarget: 220,
    objective: 'hp_pct',
    source: 'https://keqingmains.com/q/kokomi-quickguide/',
  },
  shenhe: {
    characterKey: 'shenhe',
    setRequirement: { kind: '4pc', setKey: 'NoblesseOblige' },
    mains: { sands: 'atk_pct', goblet: 'atk_pct', circlet: 'atk_pct' },
    erTarget: 160,
    objective: 'atk_pct',
    source: 'https://keqingmains.com/q/shenhe-quickguide/',
  },
  // No erTarget: her Burst runs on Serpent's Subtlety, not Energy.
  // Finale over Marechaussee: KQM ranks Marechaussee first *in Furina teams*,
  // Prydwen calls Finale her best "regardless of how Skirk is played". We don't
  // know the team here, so the unconditional answer wins.
  skirk: {
    characterKey: 'skirk',
    setRequirement: { kind: '4pc', setKey: 'FinaleOfTheDeepGalleries' },
    mains: { sands: 'atk_pct', goblet: 'elemental_dmg' },
    critRatioTarget: 0.333,
    objective: 'crit_value',
    source: 'https://keqingmains.com/q/skirk-quickguide/',
  },
  xianyun: {
    characterKey: 'xianyun',
    setRequirement: { kind: '4pc', setKey: 'NoblesseOblige' },
    mains: { sands: 'er_pct', goblet: 'atk_pct', circlet: 'atk_pct' },
    erTarget: 230,
    objective: 'atk_pct',
    source: 'https://keqingmains.com/q/xianyun-quickguide/',
  },
  xilonen: {
    characterKey: 'xilonen',
    setRequirement: { kind: '4pc', setKey: 'ScrollOfTheHeroOfCinderCity' },
    mains: { sands: 'def_pct', goblet: 'def_pct', circlet: 'def_pct' },
    erTarget: 150,
    objective: 'def_pct',
    source: 'https://keqingmains.com/q/xilonen-quickguide/',
  },
  // Stellar-Conduct Yae, which landed in 6.7 alongside the Disenchantment set —
  // an ATK% goblet, not the Electro DMG one older builds used, and no ER because
  // this archetype skips her Burst to keep field time.
  yae_miko: {
    characterKey: 'yae_miko',
    setRequirement: { kind: '4pc', setKey: 'DisenchantmentInDeepShadow' },
    mains: { sands: 'atk_pct', goblet: 'atk_pct' },
    critRatioTarget: 0.333,
    objective: 'crit_value',
    source: 'https://keqingmains.com/q/yae-quickguide/',
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
