import type { CharacterGuide } from './types';

export const cryo: Record<string, CharacterGuide> = {
  kamisato_ayaka: {
    source: 'https://keqingmains.com/ayaka/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'BlizzardStrayer',
      },
      mains: {
        sands: 'atk_pct',
        goblet: 'elemental_dmg',
      },
      erTarget: 140,
      objective: 'crit_value',
    },
    substats: {
      priority: ['er_pct', 'crit_dmg', 'atk_pct', 'crit_rate'],
      floors: { er_pct: 140 },
    },
    constellations: [
      {
        level: 1,
        note: 'Reduces Elemental Skill cooldown on Normal/Charged Attack hits — minor rotational impact.',
      },
      {
        level: 2,
        note: 'Elemental Burst creates two extra miniature storms, adding solid single-target and boss damage.',
      },
      { level: 3, note: '+3 Elemental Burst level.' },
      {
        level: 4,
        note: "Applies a DEF shred to nearby opponents, boosting both her and the team's damage.",
      },
      { level: 5, note: '+3 Elemental Skill level.' },
      {
        level: 6,
        note: 'Grants a large DMG bonus to one Charged Attack periodically — pairs well with Shenhe or speedrun setups.',
      },
    ],
    weapons: [
      {
        weaponKey: 'mistsplitter_reforged',
        rank: 1,
        note: 'signature',
      },
      {
        weaponKey: 'haran_geppaku_futsu',
        rank: 2,
      },
      {
        weaponKey: 'primordial_jade_cutter',
        rank: 3,
      },
      {
        weaponKey: 'finale_of_the_deep',
        rank: 4,
        note: 'F2P craftable, best 4-star',
      },
    ],
    talents: {
      priority: ['burst', 'auto', 'skill'],
      levels: {
        burst: 9,
        auto: 9,
        skill: 6,
      },
    },
    teams: [
      {
        name: 'Ayaka Freeze',
        slots: [
          {
            role: 'Anemo grouper/buffer',
            options: ['kaedehara_kazuha'],
          },
          {
            role: 'off-field Hydro applicator/healer',
            options: ['sangonomiya_kokomi'],
          },
          {
            role: 'Cryo buffer/debuffer',
            options: ['shenhe'],
          },
        ],
      },
    ],
  },
  ganyu: {
    source: 'https://keqingmains.com/ganyu/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'BlizzardStrayer',
      },
      mains: {
        sands: 'atk_pct',
        goblet: 'elemental_dmg',
      },
      erTarget: 111,
      critRatioTarget: 0.167,
      objective: 'crit_value',
      statTargets: {
        crit_rate: 35,
        crit_dmg: 200,
        atk: 1800,
      },
    },
    substats: {
      priority: ['er_pct', 'crit_dmg', 'atk_pct', 'crit_rate'],
      floors: { er_pct: 111 },
    },
    constellations: [
      {
        level: 1,
        note: 'Charged Attacks reduce enemy Cryo RES and generate Energy on hit.',
      },
      { level: 2, note: 'Elemental Skill gains an additional charge.' },
      { level: 3, note: '+3 Elemental Burst level.' },
      {
        level: 4,
        note: 'Enemies caught in her Burst take increasingly more damage over its duration.',
      },
      { level: 5, note: '+3 Elemental Skill level.' },
      {
        level: 6,
        note: 'Frostflake Arrow charges instantly for a short time after using her Elemental Skill.',
      },
    ],
    weapons: [
      {
        weaponKey: "amos'_bow",
        rank: 1,
        note: 'best-in-slot',
      },
      {
        weaponKey: "hunter's_path",
        rank: 2,
      },
      {
        weaponKey: 'the_stringless',
        rank: 3,
        note: 'F2P option',
      },
      {
        weaponKey: 'favonius_warbow',
        rank: 4,
        note: 'F2P energy option',
      },
    ],
    talents: {
      priority: ['auto', 'burst', 'skill'],
      levels: {
        auto: 9,
        burst: 9,
        skill: 6,
      },
    },
    teams: [
      {
        name: 'Ganyu Melt',
        slots: [
          {
            role: 'Anemo grouper / battery',
            options: ['venti'],
          },
          {
            role: 'ATK buffer / Pyro applicator',
            options: ['bennett'],
          },
          {
            role: 'off-field Pyro DPS (Melt)',
            options: ['xiangling'],
          },
        ],
      },
    ],
  },
  wriothesley: {
    source: 'https://keqingmains.com/q/wriothesley-quickguide/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'MarechausseeHunter',
      },
      mains: {
        sands: 'atk_pct',
        goblet: 'elemental_dmg',
      },
      erTarget: 100,
      objective: 'crit_value',
    },
    substats: {
      priority: ['crit_rate', 'crit_dmg', 'atk_pct', 'er_pct'],
      floors: { er_pct: 100 },
    },
    constellations: [
      {
        level: 1,
        note: 'Unlocks an enhanced Charged Attack after finishing a Normal Attack chain in his Skill state, extending Skill duration on landing it.',
      },
      {
        level: 2,
        note: 'Stacks from his ascension passive increase his Burst damage.',
      },
      { level: 3, note: '+3 Normal Attack level.' },
      {
        level: 4,
        note: 'Increases the healing from his enhanced Charged Attack and grants an Attack SPD buff when it overflows.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'His enhanced Charged Attack gains bonus CRIT stats and fires an additional icicle strike.',
      },
    ],
    weapons: [
      {
        weaponKey: 'cashflow_supervision',
        rank: 1,
        note: 'signature',
      },
      {
        weaponKey: 'the_widsith',
        rank: 2,
      },
      {
        weaponKey: 'prototype_amber',
        rank: 3,
        note: 'F2P option',
      },
      {
        weaponKey: 'mappa_mare',
        rank: 4,
      },
    ],
    talents: {
      priority: ['auto', 'skill', 'burst'],
      levels: {
        auto: 9,
        skill: 9,
        burst: 1,
      },
    },
    teams: [
      {
        name: 'Wriothesley Reverse Melt',
        slots: [
          {
            role: 'shielder',
            options: ['zhongli'],
          },
          {
            role: 'ATK buff + healer',
            options: ['bennett'],
          },
          {
            role: 'Cryo buffer',
            options: ['shenhe'],
          },
        ],
      },
    ],
  },
};
