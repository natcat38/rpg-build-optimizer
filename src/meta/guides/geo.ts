import type { CharacterGuide } from './types';

export const geo: Record<string, CharacterGuide> = {
  navia: {
    source: 'https://keqingmains.com/navia/',
    role: 'Explosive Geo burst DPS built around Shrapnel-charged Normal Attacks.',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'NighttimeWhispersInTheEchoingWoods',
      },
      mains: {
        sands: 'atk_pct',
        goblet: 'elemental_dmg',
      },
      erTarget: 140,
      critRatioTarget: 0.333,
      objective: 'crit_value',
    },
    substats: {
      priority: ['er_pct', 'crit_rate', 'crit_dmg', 'atk_pct'],
      floors: { er_pct: 140 },
    },
    constellations: [
      {
        level: 1,
        note: 'Consuming Crystal Shrapnel charges on her Skill restores energy and reduces Burst cooldown.',
      },
      {
        level: 2,
        note: 'Grants bonus Skill CRIT Rate based on Shrapnel consumed and triggers extra Cannon Fire Support shots.',
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Reduces nearby opponents’ Geo RES for a short time when her Burst hits.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Grants bonus Skill CRIT DMG and returns consumed Shrapnel beyond the first few charges.',
      },
    ],
    weapons: [
      {
        weaponKey: 'verdict',
        rank: 1,
        note: 'signature',
      },
      {
        weaponKey: 'serpent_spine',
        rank: 2,
      },
      {
        weaponKey: 'the_unforged',
        rank: 3,
      },
      {
        weaponKey: 'favonius_greatsword',
        rank: 4,
        note: 'F2P energy option',
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
        name: 'Navia Geo',
        slots: [
          {
            role: 'Geo buffer/RES shredder',
            options: ['xilonen'],
          },
          {
            role: 'ATK buffer + Pyro application',
            options: ['bennett'],
          },
          {
            role: 'Hydro buffer',
            options: ['furina'],
          },
        ],
      },
    ],
  },
  arataki_itto: {
    source: 'https://keqingmains.com/itto/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'HuskOfOpulentDreams',
      },
      mains: {
        sands: 'def_pct',
        goblet: 'elemental_dmg',
      },
      erTarget: 130,
      objective: 'crit_value',
    },
    substats: {
      priority: ['er_pct', 'crit_rate', 'crit_dmg', 'def_pct'],
      floors: { er_pct: 130 },
    },
    constellations: [
      {
        level: 1,
        note: 'Grants Superlative Superstrength stacks immediately, then more shortly after casting his Burst.',
      },
      {
        level: 2,
        note: "Nearby Geo party members reduce his Burst's cooldown and restore Energy.",
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'On Burst end, grants nearby party members a DEF and ATK bonus.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Charged Attacks gain bonus CRIT DMG and a chance to not consume Superstrength stacks.',
      },
    ],
    weapons: [
      {
        weaponKey: 'redhorn_stonethresher',
        rank: 1,
        note: 'signature',
      },
      {
        weaponKey: 'serpent_spine',
        rank: 2,
        note: 'second BiS',
      },
      {
        weaponKey: 'skyward_pride',
        rank: 3,
      },
      {
        weaponKey: 'whiteblind',
        rank: 4,
        note: 'F2P craftable DEF option',
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
        name: 'Itto Mono-Geo',
        slots: [
          {
            role: 'Geo battery/buffer',
            options: ['gorou'],
          },
          {
            role: 'off-field Geo DPS',
            options: ['albedo'],
          },
          {
            role: 'shielder/RES shred',
            options: ['zhongli', 'diona'],
          },
        ],
      },
    ],
  },
  zhongli: {
    source: 'https://keqingmains.com/zhongli/',
    build: {
      setRequirement: {
        kind: '2pc',
        setKey: 'TenacityOfTheMillelith',
      },
      mains: {
        sands: 'hp_pct',
        goblet: 'hp_pct',
        circlet: 'hp_pct',
      },
      objective: 'hp_pct',
    },
    substats: {
      priority: ['hp_pct', 'crit_rate'],
    },
    constellations: [
      { level: 1, note: 'Allows two Stone Steles to exist at once.' },
      {
        level: 2,
        note: 'His Burst grants a shield to nearby characters when the meteor lands.',
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: "Enlarges his Burst's radius and extends the Petrification duration.",
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Converts a portion of incoming shield damage into healing for the active character.',
      },
    ],
    weapons: [
      {
        weaponKey: 'black_tassel',
        rank: 1,
        note: 'F2P — shield-bot BiS',
      },
      {
        weaponKey: 'favonius_lance',
        rank: 2,
        note: 'F2P energy option',
      },
      {
        weaponKey: 'the_catch',
        rank: 3,
        note: 'craftable ER option',
      },
      {
        weaponKey: 'primordial_jade_wingedspear',
        rank: 4,
        note: 'DPS-build alternative',
      },
    ],
    talents: {
      priority: ['skill', 'burst', 'auto'],
      levels: {
        skill: 6,
        burst: 1,
        auto: 1,
      },
    },
    teams: [
      {
        name: 'Zhongli Shield Support',
        slots: [
          {
            role: 'off-field Hydro DPS + damage reduction',
            options: ['xingqiu'],
          },
          {
            role: 'off-field Electro DPS',
            options: ['fischl'],
          },
          {
            role: 'off-field Geo DPS',
            options: ['albedo'],
          },
        ],
      },
    ],
  },
};
