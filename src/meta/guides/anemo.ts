import type { CharacterGuide } from './types';

export const anemo: Record<string, CharacterGuide> = {
  xiao: {
    source: 'https://keqingmains.com/xiao/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'VermillionHereafter',
      },
      mains: {
        sands: 'atk_pct',
        goblet: 'elemental_dmg',
      },
      erTarget: 120,
      critRatioTarget: 0.333,
      objective: 'crit_value',
      statTargets: {
        crit_rate: 70,
      },
    },
    weapons: [
      {
        weaponKey: 'primordial_jade_wingedspear',
        rank: 1,
        note: 'best-in-slot',
      },
      {
        weaponKey: 'staff_of_homa',
        rank: 2,
      },
      {
        weaponKey: 'lumidouce_elegy',
        rank: 3,
      },
      {
        weaponKey: 'favonius_lance',
        rank: 4,
        note: 'F2P energy option',
      },
    ],
    talents: {
      priority: ['auto', 'skill', 'burst'],
      levels: {
        auto: 9,
        skill: 8,
        burst: 8,
      },
    },
    teams: [
      {
        name: 'Xiao Burst DPS',
        slots: [
          {
            role: 'Anemo battery/buffer',
            options: ['faruzan'],
          },
          {
            role: 'shielder/RES shred',
            options: ['zhongli'],
          },
          {
            role: 'healer/ATK buffer',
            options: ['bennett'],
          },
        ],
      },
    ],
  },
  wanderer: {
    source: 'https://keqingmains.com/wanderer/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'DesertPavilionChronicle',
      },
      mains: {
        sands: 'atk_pct',
        goblet: 'elemental_dmg',
      },
      erTarget: 100,
      critRatioTarget: 0.333,
      objective: 'crit_value',
    },
    weapons: [
      {
        weaponKey: "tulaytullah's_remembrance",
        rank: 1,
        note: 'signature',
      },
      {
        weaponKey: 'skyward_atlas',
        rank: 2,
      },
      {
        weaponKey: 'lost_prayer_to_the_sacred_winds',
        rank: 3,
      },
      {
        weaponKey: 'the_widsith',
        rank: 4,
        note: 'strong 4★ option',
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
        name: 'Wanderer Anemo DPS',
        slots: [
          {
            role: 'Anemo RES shred / buffer',
            options: ['faruzan'],
          },
          {
            role: 'ATK buffer / healer',
            options: ['bennett'],
          },
          {
            role: 'shielder / RES shredder',
            options: ['zhongli'],
          },
        ],
      },
    ],
  },
  kaedehara_kazuha: {
    source: 'https://keqingmains.com/kazuha/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'ViridescentVenerer',
      },
      mains: {
        sands: 'em',
        goblet: 'em',
      },
      erTarget: 190,
      objective: 'em',
    },
    weapons: [
      {
        weaponKey: 'freedomsworn',
        rank: 1,
        note: 'signature',
      },
      {
        weaponKey: "xiphos'_moonlight",
        rank: 2,
        note: 'best at high refinement',
      },
      {
        weaponKey: 'favonius_sword',
        rank: 3,
        note: 'F2P energy option',
      },
      {
        weaponKey: 'fleuve_cendre_ferryman',
        rank: 4,
        note: 'best free sword, low ER',
      },
    ],
    talents: {
      priority: ['burst', 'skill', 'auto'],
      levels: {
        burst: 9,
        skill: 6,
        auto: 1,
      },
    },
    teams: [
      {
        name: 'Kazuha Swirl Support',
        slots: [
          {
            role: 'off-field Hydro application',
            options: ['xingqiu'],
          },
          {
            role: 'ATK buff + Pyro self-aura',
            options: ['bennett'],
          },
          {
            role: 'off-field Electro application',
            options: ['fischl'],
          },
        ],
      },
    ],
  },
  faruzan: {
    source: 'https://keqingmains.com/faruzan/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'NoblesseOblige',
      },
      mains: {
        sands: 'er_pct',
      },
      erTarget: 275,
      objective: 'crit_value',
    },
    weapons: [
      {
        weaponKey: 'favonius_warbow',
        rank: 1,
        note: 'BiS in nearly all scenarios — team ER',
      },
      {
        weaponKey: 'elegy_for_the_end',
        rank: 2,
        note: 'team buff',
      },
      {
        weaponKey: 'sacrificial_bow',
        rank: 3,
        note: 'F2P option',
      },
      {
        weaponKey: "hunter's_path",
        rank: 4,
        note: 'C6 personal-damage option',
      },
    ],
    talents: {
      priority: ['skill', 'burst', 'auto'],
      levels: {
        skill: 9,
        burst: 1,
        auto: 1,
      },
    },
    teams: [
      {
        name: 'Faruzan Anemo DPS Support',
        slots: [
          {
            role: 'main Anemo on-field DPS',
            options: ['wanderer', 'xiao'],
          },
          {
            role: 'shielder',
            options: ['zhongli'],
          },
          {
            role: 'off-field Electro DPS (Thundering Fury)',
            options: ['fischl'],
          },
        ],
      },
    ],
  },
};
