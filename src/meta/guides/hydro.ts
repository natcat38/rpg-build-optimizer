import type { CharacterGuide } from './types';

export const hydro: Record<string, CharacterGuide> = {
  furina: {
    source: 'https://keqingmains.com/furina/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'GoldenTroupe',
      },
      mains: {
        sands: 'hp_pct',
        goblet: 'elemental_dmg',
      },
      erTarget: 130,
      objective: 'crit_value',
    },
    weapons: [
      {
        weaponKey: 'splendor_of_tranquil_waters',
        rank: 1,
        note: 'signature',
      },
      {
        weaponKey: 'finale_of_the_deep',
        rank: 2,
      },
      {
        weaponKey: 'primordial_jade_cutter',
        rank: 3,
      },
      {
        weaponKey: 'favonius_sword',
        rank: 4,
        note: 'F2P energy option',
      },
    ],
    talents: {
      priority: ['burst', 'skill', 'auto'],
      levels: {
        burst: 9,
        skill: 9,
        auto: 1,
      },
    },
    teams: [
      {
        name: 'Furina Vaporize',
        slots: [
          {
            role: 'mono-hydro on-field DPS',
            options: ['neuvillette'],
          },
          {
            role: 'Anemo grouping/buffer',
            options: ['kaedehara_kazuha'],
          },
          {
            role: 'ATK buffer + healer',
            options: ['bennett'],
          },
        ],
      },
    ],
  },
  neuvillette: {
    source: 'https://keqingmains.com/neuvillette/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'MarechausseeHunter',
      },
      mains: {
        sands: 'hp_pct',
        goblet: 'elemental_dmg',
      },
      critRatioTarget: 0.333,
      objective: 'crit_value',
    },
    weapons: [
      {
        weaponKey: 'tome_of_the_eternal_flow',
        rank: 1,
        note: 'signature',
      },
      {
        weaponKey: 'sacrificial_jade',
        rank: 2,
      },
      {
        weaponKey: "surf's_up",
        rank: 3,
      },
      {
        weaponKey: 'prototype_amber',
        rank: 4,
        note: 'F2P, healing side-value',
      },
    ],
    talents: {
      priority: ['auto', 'skill', 'burst'],
      levels: {
        auto: 9,
        skill: 6,
        burst: 6,
      },
    },
    teams: [
      {
        name: 'Neuvillette Hydro Resonance',
        slots: [
          {
            role: 'Hydro Resonance buffer/DPS',
            options: ['furina'],
          },
          {
            role: 'Anemo grouping/RES shred',
            options: ['kaedehara_kazuha'],
          },
          {
            role: 'shield/universal RES shred',
            options: ['zhongli'],
          },
        ],
      },
    ],
  },
  tartaglia: {
    source: 'https://keqingmains.com/childe/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'NymphsDream',
      },
      mains: {
        sands: 'atk_pct',
        goblet: 'elemental_dmg',
      },
      erTarget: 125,
      objective: 'crit_value',
    },
    weapons: [
      {
        weaponKey: 'polar_star',
        rank: 1,
        note: 'signature — BiS when pre-stacked',
      },
      {
        weaponKey: 'aqua_simulacra',
        rank: 2,
      },
      {
        weaponKey: "hunter's_path",
        rank: 3,
        note: 'strong with EM investment',
      },
      {
        weaponKey: 'the_viridescent_hunt',
        rank: 4,
        note: 'best F2P 4-star',
      },
    ],
    talents: {
      priority: ['skill', 'burst', 'auto'],
      levels: {
        skill: 9,
        burst: 9,
        auto: 1,
      },
    },
    teams: [
      {
        name: 'Childe Melee Vaporize',
        slots: [
          {
            role: 'ATK buffer + Pyro application',
            options: ['bennett'],
          },
          {
            role: 'off-field Pyro (Reverse Vape)',
            options: ['xiangling'],
          },
          {
            role: 'Anemo grouper/buffer',
            options: ['kaedehara_kazuha'],
          },
        ],
      },
    ],
  },
  xingqiu: {
    source: 'https://keqingmains.com/xingqiu/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'EmblemOfSeveredFate',
      },
      mains: {
        sands: 'er_pct',
        goblet: 'elemental_dmg',
      },
      erTarget: 140,
      objective: 'crit_value',
    },
    weapons: [
      {
        weaponKey: 'primordial_jade_cutter',
        rank: 1,
      },
      {
        weaponKey: 'mistsplitter_reforged',
        rank: 2,
      },
      {
        weaponKey: 'haran_geppaku_futsu',
        rank: 3,
      },
      {
        weaponKey: 'favonius_sword',
        rank: 4,
        note: 'F2P, team energy battery',
      },
    ],
    talents: {
      priority: ['burst', 'skill', 'auto'],
      levels: {
        burst: 9,
        skill: 9,
        auto: 1,
      },
    },
    teams: [
      {
        name: 'Xingqiu Vaporize Support',
        slots: [
          {
            role: 'on-field Vaporize DPS',
            options: ['hu_tao'],
          },
          {
            role: 'ATK buffer',
            options: ['bennett'],
          },
          {
            role: 'Anemo buffer',
            options: ['kaedehara_kazuha'],
          },
        ],
      },
    ],
  },
  yelan: {
    source: 'https://keqingmains.com/yelan/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'EmblemOfSeveredFate',
      },
      mains: {
        sands: 'hp_pct',
        goblet: 'elemental_dmg',
      },
      erTarget: 160,
      critRatioTarget: 0.333,
      objective: 'crit_value',
      statTargets: {
        hp: 30000,
        crit_rate: 70,
        crit_dmg: 140,
      },
    },
    weapons: [
      {
        weaponKey: 'aqua_simulacra',
        rank: 1,
        note: 'signature — all-purpose BiS',
      },
      {
        weaponKey: 'favonius_warbow',
        rank: 2,
        note: 'premier F2P option',
      },
      {
        weaponKey: 'elegy_for_the_end',
        rank: 3,
        note: 'team-wide reaction support',
      },
      {
        weaponKey: 'slingshot',
        rank: 4,
        note: 'F2P, low-ER alternative',
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
        name: 'Yelan Double Hydro',
        slots: [
          {
            role: 'off-field Hydro application',
            options: ['xingqiu'],
          },
          {
            role: 'Anemo grouper/buffer',
            options: ['kaedehara_kazuha'],
          },
          {
            role: 'shielder / RES shredder',
            options: ['zhongli'],
          },
        ],
      },
    ],
  },
  sigewinne: {
    source: 'https://keqingmains.com/q/sigewinne-quickguide',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'OceanHuedClam',
      },
      mains: {
        sands: 'hp_pct',
        goblet: 'hp_pct',
      },
      erTarget: 115,
      objective: 'hp_pct',
      statTargets: {
        hp: 65000,
      },
    },
    weapons: [
      {
        weaponKey: 'silvershower_heartstrings',
        rank: 1,
        note: 'signature',
      },
      {
        weaponKey: 'elegy_for_the_end',
        rank: 2,
        note: 'team buff + ER',
      },
      {
        weaponKey: 'recurve_bow',
        rank: 3,
        note: 'F2P HP option',
      },
      {
        weaponKey: 'favonius_warbow',
        rank: 4,
        note: 'F2P energy option',
      },
    ],
    talents: {
      priority: ['burst', 'skill', 'auto'],
      levels: {
        burst: 9,
        skill: 1,
        auto: 1,
      },
    },
    teams: [
      {
        name: 'Sigewinne Healer Support',
        slots: [
          {
            role: 'main Hydro DPS',
            options: ['furina'],
          },
          {
            role: 'off-field Electro DPS (Hyperbloom)',
            options: ['fischl'],
          },
          {
            role: 'off-field Electro DPS (Electro-Charged)',
            options: ['yae_miko'],
          },
        ],
      },
    ],
  },
};
