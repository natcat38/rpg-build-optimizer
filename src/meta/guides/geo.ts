import type { CharacterGuide } from './types';

export const geo: Record<string, CharacterGuide> = {
  navia: {
    source: 'https://keqingmains.com/navia/',
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
