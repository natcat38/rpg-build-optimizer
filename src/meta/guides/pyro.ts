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
    substats: {
      priority: ['crit_rate', 'crit_dmg', 'atk_pct', 'em'],
    },
    constellations: [
      {
        level: 1,
        note: 'Extends the Aurous Blaze mark duration and grants a temporary ATK bonus when marked enemies are defeated.',
      },
      {
        level: 2,
        note: 'Grants a Pyro DMG bonus on crit hits, even while off-field.',
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: "Reduces her Elemental Skill's cooldown when Aurous Blaze marks explode.",
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Chance for Normal Attacks to fire an additional Blazing Arrow during Skill uptime.',
      },
    ],
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
    substats: {
      priority: ['er_pct', 'crit_rate', 'crit_dmg', 'atk_pct'],
      floors: { er_pct: 150 },
    },
    constellations: [
      {
        level: 1,
        note: 'Doubles the damage bonus from her Mask of the Red Death state and grants interruption resistance on Normal/Charged Attacks.',
      },
      {
        level: 2,
        note: 'Blood-Debt Directives convert immediately into Dues; clearing Dues triggers an AoE Pyro attack and RES buffs.',
      },
      { level: 3, note: '+3 Normal Attack level.' },
      {
        level: 4,
        note: "Absorbing a Blood-Debt Directive reduces her Burst's cooldown and restores Energy.",
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Burst damage scales with her Bond of Life, and her attacks gain CRIT buffs after using her Elemental Skill.',
      },
    ],
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
    substats: {
      priority: ['er_pct', 'crit_rate', 'crit_dmg', 'em'],
      floors: { er_pct: 160 },
    },
    constellations: [
      {
        level: 1,
        note: "Guoba's attacks reduce enemy Pyro RES on hit.",
      },
      {
        level: 2,
        note: 'Normal Attack strings apply a delayed AoE Pyro explosion.',
      },
      { level: 3, note: '+3 Pyronado (Elemental Burst) level.' },
      {
        level: 4,
        note: "Extends Pyronado's duration — her single strongest constellation in any team.",
      },
      { level: 5, note: '+3 Guoba Attack (Elemental Skill) level.' },
      {
        level: 6,
        note: 'Grants nearby party members a Pyro DMG Bonus for the duration of Pyronado.',
      },
    ],
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
    substats: {
      priority: ['hp_pct', 'er_pct', 'crit_rate', 'crit_dmg'],
      floors: { er_pct: 180 },
    },
    constellations: [
      {
        level: 1,
        note: 'Removes the cap on his ATK buff and adds a portion of his own base ATK to it.',
      },
      {
        level: 2,
        note: 'Grants bonus Energy Recharge whenever his HP drops below a threshold.',
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Adds a follow-up attack to a charged variant of his Elemental Skill.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Grants nearby melee allies a Pyro DMG Bonus and Pyro infusion.',
      },
    ],
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
  amber: {
    source: 'https://keqingmains.com/amber/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'ShimenawasReminiscence',
      },
      mains: {
        sands: 'em',
        goblet: 'elemental_dmg',
      },
      objective: 'em',
    },
    substats: {
      priority: ['crit_dmg', 'em', 'atk_pct'],
    },
    constellations: [
      {
        level: 1,
        note: 'Fires two arrows per Aimed Shot; the second deals bonus damage.',
      },
      {
        level: 2,
        note: 'Allows her to manually detonate Baron Bunny with a fully-charged Aimed Shot for bonus damage.',
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: "Reduces Baron Bunny's cooldown and grants it an additional charge.",
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Triggering her Burst grants the party a temporary Movement SPD and ATK buff.',
      },
    ],
    weapons: [
      {
        weaponKey: "amos'_bow",
        rank: 1,
      },
      {
        weaponKey: 'thundering_pulse',
        rank: 2,
      },
      {
        weaponKey: 'elegy_for_the_end',
        rank: 3,
        note: 'support option',
      },
      {
        weaponKey: 'favonius_warbow',
        rank: 4,
        note: 'F2P energy option',
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
        name: 'Amber Melt',
        slots: [
          {
            role: 'off-field Cryo application',
            options: ['diona'],
          },
          {
            role: 'ATK buffer + healer',
            options: ['bennett'],
          },
          {
            role: 'off-field Cryo application',
            options: ['rosaria'],
          },
        ],
      },
    ],
  },
  chevreuse: {
    source: 'https://keqingmains.com/q/chevreuse-quickguide/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'NoblesseOblige',
      },
      mains: {
        sands: 'er_pct',
        goblet: 'hp_pct',
      },
      erTarget: 190,
      objective: 'hp_pct',
    },
    substats: {
      priority: ['er_pct', 'hp_pct', 'crit_rate'],
      floors: { er_pct: 190 },
    },
    constellations: [
      {
        level: 1,
        note: 'Restores Energy to the active character when an Overloaded reaction triggers.',
      },
      {
        level: 2,
        note: 'Her held Elemental Skill triggers two additional chain explosions, improving Pyro application.',
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: "Removes her held Elemental Skill's cooldown for a short time after her Burst.",
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Grants teammates a Pyro/Electro DMG Bonus per heal, stacking, plus teamwide healing.',
      },
    ],
    weapons: [
      {
        weaponKey: 'symphonist_of_scents',
        rank: 1,
        note: 'CRIT DMG + ATK% with teammate buff',
      },
      {
        weaponKey: 'favonius_lance',
        rank: 2,
        note: 'lowers team ER needs',
      },
      {
        weaponKey: 'black_tassel',
        rank: 3,
        note: 'accessible HP option',
      },
      {
        weaponKey: 'rightful_reward',
        rank: 4,
        note: 'craftable HP option',
      },
    ],
    talents: {
      priority: ['skill', 'burst', 'auto'],
      levels: {
        skill: 6,
        burst: 6,
        auto: 1,
      },
    },
    teams: [
      {
        name: 'Chevreuse Overloaded',
        slots: [
          {
            role: 'main Pyro DPS',
            options: ['mavuika'],
          },
          {
            role: 'main Electro DPS',
            options: ['raiden_shogun'],
          },
          {
            role: 'off-field Electro support',
            options: ['iansan'],
          },
        ],
      },
    ],
  },
  dehya: {
    source: 'https://keqingmains.com/dehya/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'EmblemOfSeveredFate',
      },
      mains: {
        sands: 'atk_pct',
        goblet: 'elemental_dmg',
      },
      erTarget: 200,
      objective: 'crit_value',
    },
    substats: {
      priority: ['er_pct', 'crit_rate', 'crit_dmg', 'atk_pct'],
      floors: { er_pct: 200 },
    },
    constellations: [
      {
        level: 1,
        note: 'Increases her max HP and grants her Skill and Burst bonus HP scaling.',
      },
      {
        level: 2,
        note: 'Extends her Skill duration and boosts its coordinated attack damage while active.',
      },
      { level: 3, note: '+3 Elemental Burst level.' },
      {
        level: 4,
        note: 'Her Burst attacks restore Energy and HP.',
      },
      { level: 5, note: '+3 Elemental Skill level.' },
      {
        level: 6,
        note: 'Grants her Burst bonus CRIT Rate and CRIT DMG per hit, and extends its duration.',
      },
    ],
    weapons: [
      {
        weaponKey: 'beacon_of_the_reed_sea',
        rank: 1,
      },
      {
        weaponKey: 'redhorn_stonethresher',
        rank: 2,
      },
      {
        weaponKey: 'akuoumaru',
        rank: 3,
      },
      {
        weaponKey: 'favonius_greatsword',
        rank: 4,
        note: 'F2P energy option',
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
        name: 'Dehya Mono Pyro',
        slots: [
          {
            role: 'ATK buffer + healer',
            options: ['bennett'],
          },
          {
            role: 'off-field Pyro DPS',
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
  diluc: {
    source: 'https://keqingmains.com/diluc/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'CrimsonWitchOfFlames',
      },
      mains: {
        sands: 'atk_pct',
        goblet: 'elemental_dmg',
      },
      objective: 'crit_value',
    },
    substats: {
      priority: ['crit_dmg', 'crit_rate', 'em', 'atk_pct'],
    },
    constellations: [
      {
        level: 1,
        note: 'Deals bonus damage to enemies above 50% HP.',
      },
      {
        level: 2,
        note: 'Gains a stacking ATK buff when taking damage.',
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Grants Searing Onslaught bonus damage after a brief delay.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'His next two Normal Attacks after using his Elemental Skill gain bonus DMG and Attack SPD.',
      },
    ],
    weapons: [
      {
        weaponKey: 'redhorn_stonethresher',
        rank: 1,
        note: 'requires Bennett',
      },
      {
        weaponKey: "wolf's_gravestone",
        rank: 2,
        note: 'versatile generalist',
      },
      {
        weaponKey: 'serpent_spine',
        rank: 3,
        note: 'strong 4-star, high refinement',
      },
      {
        weaponKey: 'rainslasher',
        rank: 4,
        note: 'Vaporize option',
      },
    ],
    talents: {
      priority: ['skill', 'auto', 'burst'],
      levels: {
        skill: 9,
        auto: 9,
        burst: 6,
      },
    },
    teams: [
      {
        name: 'Diluc Vaporize',
        slots: [
          {
            role: 'off-field Hydro application',
            options: ['xingqiu'],
          },
          {
            role: 'ATK buffer + healer',
            options: ['bennett'],
          },
          {
            role: 'Anemo grouper/buffer',
            options: ['sucrose'],
          },
        ],
      },
    ],
  },
  durin: {
    source: 'https://keqingmains.com/q/durin-quickguide/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'CrimsonWitchOfFlames',
      },
      mains: {
        sands: 'atk_pct',
        goblet: 'elemental_dmg',
      },
      erTarget: 130,
      objective: 'crit_value',
    },
    substats: {
      priority: ['er_pct', 'crit_rate', 'crit_dmg', 'atk_pct'],
      floors: { er_pct: 130 },
    },
    constellations: [
      {
        level: 1,
        note: 'Grants ATK-scaling buffs from his Cycle of Enlightenment stacks.',
      },
      {
        level: 2,
        note: 'Grants the team a large Pyro DMG Bonus and a bonus for their corresponding element.',
      },
      { level: 3, note: '+3 Elemental Burst level.' },
      {
        level: 4,
        note: 'Increases his Burst damage and grants a chance to preserve his stacks.',
      },
      { level: 5, note: '+3 Elemental Skill level.' },
      {
        level: 6,
        note: 'His Burst ignores a portion of enemy DEF, with additional state-specific effects.',
      },
    ],
    weapons: [
      {
        weaponKey: 'athame_artis',
        rank: 1,
        note: 'best-in-slot',
      },
      {
        weaponKey: 'primordial_jade_cutter',
        rank: 2,
      },
      {
        weaponKey: 'haran_geppaku_futsu',
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
        skill: 6,
        auto: 1,
      },
    },
    teams: [
      {
        name: 'Durin Overloaded',
        slots: [
          {
            role: 'main Electro DPS',
            options: ['raiden_shogun'],
          },
          {
            role: 'off-field Electro DPS',
            options: ['fischl'],
          },
          {
            role: 'support/healer',
            options: ['chevreuse'],
          },
        ],
      },
    ],
  },
  gaming: {
    source: 'https://keqingmains.com/q/gaming-quickguide/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'MarechausseeHunter',
      },
      mains: {
        sands: 'atk_pct',
        goblet: 'elemental_dmg',
      },
      erTarget: 180,
      objective: 'crit_value',
    },
    substats: {
      priority: ['er_pct', 'crit_rate', 'em', 'atk_pct'],
      floors: { er_pct: 180 },
    },
    constellations: [
      {
        level: 1,
        note: 'Restores HP when his Man Chai returns, enabling healer-free play with shields.',
      },
      {
        level: 2,
        note: 'Grants a temporary ATK buff when healing overflows.',
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Restores Energy per Plunging Attack, easing his ER requirement.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Grants his Plunging Attacks bonus CRIT Rate and CRIT DMG — his best constellation.',
      },
    ],
    weapons: [
      {
        weaponKey: 'serpent_spine',
        rank: 1,
      },
      {
        weaponKey: 'fruitful_hook',
        rank: 2,
      },
      {
        weaponKey: 'a_thousand_blazing_suns',
        rank: 3,
      },
      {
        weaponKey: 'redhorn_stonethresher',
        rank: 4,
      },
    ],
    talents: {
      priority: ['skill', 'burst', 'auto'],
      levels: {
        skill: 9,
        burst: 6,
        auto: 1,
      },
    },
    teams: [
      {
        name: 'Gaming Melt',
        slots: [
          {
            role: 'off-field Cryo DPS/RES shred',
            options: ['citlali'],
          },
          {
            role: 'ATK buffer + healer',
            options: ['bennett'],
          },
          {
            role: 'Anemo grouper/buffer',
            options: ['sucrose'],
          },
        ],
      },
    ],
  },
  lyney: {
    source: 'https://keqingmains.com/q/lyney-quickguide/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'MarechausseeHunter',
      },
      mains: {
        sands: 'atk_pct',
        goblet: 'elemental_dmg',
      },
      erTarget: 130,
      objective: 'crit_value',
    },
    substats: {
      priority: ['crit_rate', 'crit_dmg', 'atk_pct', 'er_pct'],
      floors: { er_pct: 130 },
    },
    constellations: [
      {
        level: 1,
        note: 'Allows two Hats to be active simultaneously.',
      },
      {
        level: 2,
        note: 'Grants a ramping CRIT DMG buff while he is on-field.',
      },
      { level: 3, note: '+3 Normal Attack level.' },
      {
        level: 4,
        note: 'Applies a Pyro RES shred to enemies.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Adds a Pyrotechnic Strike to each Prop Arrow — his strongest constellation.',
      },
    ],
    weapons: [
      {
        weaponKey: 'the_first_great_magic',
        rank: 1,
        note: 'signature',
      },
      {
        weaponKey: 'aqua_simulacra',
        rank: 2,
      },
      {
        weaponKey: 'thundering_pulse',
        rank: 3,
      },
      {
        weaponKey: "amos'_bow",
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
        name: 'Lyney Mono Pyro',
        slots: [
          {
            role: 'ATK buffer + healer',
            options: ['bennett'],
          },
          {
            role: 'Anemo grouper/buffer',
            options: ['kaedehara_kazuha'],
          },
          {
            role: 'shielder/universal RES shred',
            options: ['zhongli'],
          },
        ],
      },
    ],
  },
  mavuika: {
    source: 'https://keqingmains.com/q/mavuika-quickguide/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'ObsidianCodex',
      },
      mains: {
        sands: 'atk_pct',
        goblet: 'elemental_dmg',
      },
      objective: 'crit_value',
    },
    substats: {
      priority: ['crit_rate', 'crit_dmg', 'em', 'atk_pct'],
    },
    constellations: [
      {
        level: 1,
        note: 'Increases her Nightsoul point cap and Fighting Spirit efficiency, plus a temporary ATK buff.',
      },
      {
        level: 2,
        note: 'Grants bonus base ATK and either a DEF shred or enhanced attack multipliers.',
      },
      { level: 3, note: '+3 Elemental Burst level.' },
      {
        level: 4,
        note: "Makes her ascension passive's damage buff permanent instead of decaying.",
      },
      { level: 5, note: '+3 Elemental Skill level.' },
      {
        level: 6,
        note: 'Adds bonus damage instances to her Skill forms and improves terrain traversal.',
      },
    ],
    weapons: [
      {
        weaponKey: 'a_thousand_blazing_suns',
        rank: 1,
        note: 'signature',
      },
      {
        weaponKey: 'verdict',
        rank: 2,
      },
      {
        weaponKey: 'beacon_of_the_reed_sea',
        rank: 3,
      },
      {
        weaponKey: 'tidal_shadow',
        rank: 4,
        note: 'F2P option',
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
        name: 'Mavuika Forward Melt',
        slots: [
          {
            role: 'off-field Cryo DPS/RES shred',
            options: ['citlali'],
          },
          {
            role: 'off-field Geo/Nightsoul support',
            options: ['xilonen'],
          },
          {
            role: 'ATK buffer + healer',
            options: ['bennett'],
          },
        ],
      },
    ],
  },
  thoma: {
    source: 'https://keqingmains.com/thoma/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'NoblesseOblige',
      },
      mains: {
        sands: 'er_pct',
        goblet: 'hp_pct',
      },
      erTarget: 220,
      objective: 'hp_pct',
    },
    substats: {
      priority: ['er_pct', 'hp_pct'],
      floors: { er_pct: 220 },
    },
    constellations: [
      {
        level: 1,
        note: 'Reduces ability cooldowns while his shield is active.',
      },
      {
        level: 2,
        note: "Extends his shield's duration and DMG absorption.",
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Restores Energy after his Burst — his best constellation for ER economy.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Grants party members a temporary Normal/Charged/Plunging ATK buff.',
      },
    ],
    weapons: [
      {
        weaponKey: 'favonius_lance',
        rank: 1,
      },
      {
        weaponKey: 'kitain_cross_spear',
        rank: 2,
      },
      {
        weaponKey: 'prototype_starglitter',
        rank: 3,
      },
      {
        weaponKey: 'black_tassel',
        rank: 4,
        note: 'needs sufficient ER',
      },
    ],
    talents: {
      priority: ['skill', 'burst', 'auto'],
      levels: {
        skill: 6,
        burst: 6,
        auto: 1,
      },
    },
    teams: [
      {
        name: 'Thoma Shield Support',
        slots: [
          {
            role: 'main Pyro DPS',
            options: ['hu_tao'],
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
  xinyan: {
    source: 'https://keqingmains.com/xinyan/',
    build: {
      setRequirement: {
        kind: '2+2',
        setKeys: ['PaleFlame', 'BloodstainedChivalry'],
      },
      mains: {
        sands: 'atk_pct',
        goblet: 'physical_dmg',
      },
      erTarget: 160,
      objective: 'crit_value',
    },
    substats: {
      priority: ['er_pct', 'crit_dmg', 'crit_rate', 'atk_pct'],
      floors: { er_pct: 160 },
    },
    constellations: [
      {
        level: 1,
        note: 'Grants a temporary Attack SPD buff after landing a CRIT hit.',
      },
      {
        level: 2,
        note: 'Guarantees a CRIT on Physical DMG from her Burst and grants a Level 3 shield.',
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Applies a temporary Physical RES shred.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Reduces Charged Attack stamina cost and converts a portion of her DEF into ATK.',
      },
    ],
    weapons: [
      {
        weaponKey: 'redhorn_stonethresher',
        rank: 1,
      },
      {
        weaponKey: 'serpent_spine',
        rank: 2,
      },
      {
        weaponKey: 'skyward_pride',
        rank: 3,
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
        name: 'Xinyan Superconduct',
        slots: [
          {
            role: 'ATK buffer + healer',
            options: ['bennett'],
          },
          {
            role: 'off-field Electro DPS',
            options: ['fischl'],
          },
          {
            role: 'Cryo battery/debuffer',
            options: ['rosaria'],
          },
        ],
      },
    ],
  },
  yanfei: {
    source: 'https://keqingmains.com/yanfei/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'CrimsonWitchOfFlames',
      },
      mains: {
        sands: 'atk_pct',
        goblet: 'elemental_dmg',
      },
      erTarget: 125,
      objective: 'crit_value',
    },
    substats: {
      priority: ['crit_rate', 'crit_dmg', 'atk_pct', 'em'],
      floors: { er_pct: 125 },
    },
    constellations: [
      {
        level: 1,
        note: 'Reduces her Charged Attack stamina cost and grants interruption resistance.',
      },
      {
        level: 2,
        note: 'Grants bonus CRIT Rate against enemies below 50% HP.',
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Generates a shield on casting her Elemental Burst.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Increases her max Scarlet Seal count.',
      },
    ],
    weapons: [
      {
        weaponKey: 'lost_prayer_to_the_sacred_winds',
        rank: 1,
      },
      {
        weaponKey: 'the_widsith',
        rank: 2,
      },
      {
        weaponKey: "kagura's_verity",
        rank: 3,
      },
      {
        weaponKey: 'skyward_atlas',
        rank: 4,
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
        name: 'Yanfei Vaporize',
        slots: [
          {
            role: 'off-field Hydro application',
            options: ['xingqiu'],
          },
          {
            role: 'ATK buffer + healer',
            options: ['bennett'],
          },
          {
            role: 'Anemo grouper/buffer',
            options: ['kaedehara_kazuha'],
          },
        ],
      },
    ],
  },
};
