import type { CharacterGuide } from './types';

export const pyro: Record<string, CharacterGuide> = {
  hu_tao: {
    source: 'https://keqingmains.com/hutao/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'CrimsonWitchOfFlames',
      },
      mains: {
        sands: 'hp_pct',
        goblet: 'elemental_dmg',
      },
      critRatioTarget: 0.333,
      objective: 'crit_value',
    },
    substats: {
      priority: ['crit_rate', 'crit_dmg', 'hp_pct', 'atk_pct'],
    },
    constellations: [
      {
        level: 1,
        note: 'Charged Attacks during Paramita Papilio consume no stamina, enabling more attacks per rotation.',
      },
      {
        level: 2,
        note: 'Increases Blood Blossom damage based on max HP; can also be applied via her Burst.',
      },
      { level: 3, note: '+3 Guide to Afterlife (Elemental Skill) level.' },
      {
        level: 4,
        note: 'Defeating an enemy afflicted with Blood Blossom grants nearby party members a CRIT Rate bonus.',
      },
      { level: 5, note: '+3 Spirit Soother (Elemental Burst) level.' },
      {
        level: 6,
        note: 'At low HP or on lethal damage, briefly survives with greatly increased RES, CRIT Rate, and interruption resistance.',
      },
    ],
    weapons: [
      {
        weaponKey: 'staff_of_homa',
        rank: 1,
        note: 'signature — uncontested BiS',
      },
      {
        weaponKey: 'staff_of_the_scarlet_sands',
        rank: 2,
      },
      {
        weaponKey: "dragon's_bane",
        rank: 3,
        note: 'F2P, strong vs Hydro/Pyro',
      },
      {
        weaponKey: 'white_tassel',
        rank: 4,
        note: 'F2P Liyue chest option',
      },
    ],
    talents: {
      priority: ['auto', 'skill', 'burst'],
      levels: {
        auto: 9,
        skill: 9,
        burst: 6,
      },
    },
    teams: [
      {
        name: 'Hu Tao Vaporize',
        slots: [
          {
            role: 'shielder/universal RES shred',
            options: ['zhongli'],
          },
          {
            role: 'Anemo grouper/buffer',
            options: ['kaedehara_kazuha'],
          },
          {
            role: 'off-field Hydro application',
            options: ['xingqiu'],
          },
        ],
      },
    ],
  },
  klee: {
    source: 'https://keqingmains.com/klee/',
    build: {
      setRequirement: {
        kind: '2+2',
        setKeys: ['CrimsonWitchOfFlames', 'GladiatorsFinale'],
      },
      mains: {
        sands: 'atk_pct',
        goblet: 'elemental_dmg',
      },
      erTarget: 100,
      objective: 'crit_value',
    },
    substats: {
      priority: ['er_pct', 'crit_rate', 'crit_dmg', 'atk_pct'],
      floors: { er_pct: 100 },
    },
    constellations: [
      {
        level: 1,
        note: 'Attacks and Elemental Skill summon sparks that deal bonus damage, counted as Burst damage for buff purposes.',
      },
      {
        level: 2,
        note: "Jumpy Dumpty mines lower nearby enemies' DEF.",
      },
      { level: 3, note: '+3 Jumpy Dumpty (Elemental Skill) level.' },
      {
        level: 4,
        note: "Switching off-field during Sparks 'n' Splash triggers an AoE Pyro explosion.",
      },
      { level: 5, note: "+3 Sparks 'n' Splash (Elemental Burst) level." },
      {
        level: 6,
        note: 'During her Burst, party members gain Energy Recharge and a Pyro DMG Bonus.',
      },
    ],
    weapons: [
      {
        weaponKey: 'dodoco_tales',
        rank: 1,
        note: 'signature',
      },
      {
        weaponKey: 'the_widsith',
        rank: 2,
        note: 'F2P, can rival 5-stars',
      },
      {
        weaponKey: 'lost_prayer_to_the_sacred_winds',
        rank: 3,
      },
      {
        weaponKey: 'sacrificial_fragments',
        rank: 4,
        note: 'F2P option',
      },
    ],
    talents: {
      priority: ['skill', 'burst', 'auto'],
      levels: {
        skill: 9,
        burst: 9,
        auto: 6,
      },
    },
    teams: [
      {
        name: 'Klee Burst',
        slots: [
          {
            role: 'ATK buffer + healer + battery',
            options: ['bennett'],
          },
          {
            role: 'Anemo grouper/buffer',
            options: ['kaedehara_kazuha'],
          },
          {
            role: 'Hydro buffer',
            options: ['furina'],
          },
        ],
      },
    ],
  },
  yoimiya: {
    source: 'https://keqingmains.com/yoimiya/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'ShimenawasReminiscence',
      },
      mains: {
        sands: 'atk_pct',
        goblet: 'elemental_dmg',
      },
      objective: 'crit_value',
    },
    weapons: [
      {
        weaponKey: 'thundering_pulse',
        rank: 1,
        note: 'signature',
      },
      {
        weaponKey: 'rust',
        rank: 2,
        note: 'best accessible 4-star',
      },
      {
        weaponKey: 'slingshot',
        rank: 3,
        note: 'F2P, strong with Bennett/Yun Jin',
      },
      {
        weaponKey: 'aqua_simulacra',
        rank: 4,
      },
    ],
    talents: {
      priority: ['auto', 'skill', 'burst'],
      levels: {
        auto: 9,
        skill: 6,
        burst: 1,
      },
    },
    teams: [
      {
        name: 'Yoimiya Vaporize',
        slots: [
          {
            role: 'ATK buffer / healer',
            options: ['bennett'],
          },
          {
            role: 'off-field Hydro DPS/enabler',
            options: ['yelan'],
          },
          {
            role: 'off-field Hydro / defensive support',
            options: ['xingqiu'],
          },
        ],
      },
    ],
  },
  arlecchino: {
    source: 'https://keqingmains.com/q/arlecchino-quickguide',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'FragmentOfHarmonicWhimsy',
      },
      mains: {
        sands: 'atk_pct',
        goblet: 'elemental_dmg',
      },
      erTarget: 150,
      objective: 'crit_value',
    },
    weapons: [
      {
        weaponKey: "crimson_moon's_semblance",
        rank: 1,
        note: 'signature',
      },
      {
        weaponKey: 'primordial_jade_wingedspear',
        rank: 2,
      },
      {
        weaponKey: 'staff_of_the_scarlet_sands',
        rank: 3,
        note: 'strong in Vaporize teams',
      },
      {
        weaponKey: 'white_tassel',
        rank: 4,
        note: 'best F2P option',
      },
    ],
    talents: {
      priority: ['auto', 'burst', 'skill'],
      levels: {
        auto: 9,
        burst: 6,
        skill: 1,
      },
    },
    teams: [
      {
        name: 'Arlecchino Mono/Vape',
        slots: [
          {
            role: 'ATK buffer',
            options: ['bennett'],
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
  xiangling: {
    source: 'https://keqingmains.com/xiangling/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'EmblemOfSeveredFate',
      },
      mains: {
        sands: 'er_pct',
        goblet: 'elemental_dmg',
      },
      erTarget: 160,
      critRatioTarget: 0.333,
      objective: 'crit_value',
    },
    weapons: [
      {
        weaponKey: 'the_catch',
        rank: 1,
        note: 'F2P craftable — top recommendation',
      },
      {
        weaponKey: 'staff_of_the_scarlet_sands',
        rank: 2,
      },
      {
        weaponKey: 'staff_of_homa',
        rank: 3,
      },
      {
        weaponKey: "dragon's_bane",
        rank: 4,
        note: 'F2P option, strong on-element',
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
        name: 'Xiangling Vaporize',
        slots: [
          {
            role: 'battery + ATK buff',
            options: ['bennett'],
          },
          {
            role: 'off-field Hydro application (Vaporize)',
            options: ['xingqiu'],
          },
          {
            role: 'Anemo VV shred + grouping',
            options: ['kaedehara_kazuha'],
          },
        ],
      },
    ],
  },
  bennett: {
    source: 'https://keqingmains.com/bennett/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'NoblesseOblige',
      },
      mains: {
        sands: 'er_pct',
        goblet: 'hp_pct',
      },
      erTarget: 180,
      objective: 'hp_pct',
    },
    weapons: [
      {
        weaponKey: 'aquila_favonia',
        rank: 1,
        note: 'signature — best-in-slot support',
      },
      {
        weaponKey: 'favonius_sword',
        rank: 2,
        note: 'F2P energy option',
      },
      {
        weaponKey: 'prototype_rancour',
        rank: 3,
        note: 'F2P craftable',
      },
      {
        weaponKey: 'iron_sting',
        rank: 4,
        note: 'F2P EM option',
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
        name: 'Bennett Pyro Support',
        slots: [
          {
            role: 'main Pyro sub-DPS',
            options: ['xiangling'],
          },
          {
            role: 'off-field Hydro application',
            options: ['xingqiu'],
          },
          {
            role: 'Anemo VV shred + grouping',
            options: ['kaedehara_kazuha'],
          },
        ],
      },
    ],
  },
};
