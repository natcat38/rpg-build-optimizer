import type { CharacterGuide } from './types';

export const hydro: Record<string, CharacterGuide> = {
  furina: {
    source: 'https://keqingmains.com/furina/',
    role: 'Field-changing Hydro support/sub-DPS — buffs HP-scaling damage and enables Hydro application for the team.',
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
    substats: {
      priority: ['er_pct', 'crit_rate', 'crit_dmg', 'hp_pct'],
      floors: { er_pct: 130 },
    },
    constellations: [
      {
        level: 1,
        note: 'Raises the Fanfare cap and grants starting stacks — a solid personal-damage upgrade.',
      },
      {
        level: 2,
        note: 'Best stopping point: greatly increases Fanfare gain and converts overcapped Fanfare into team HP.',
      },
      { level: 3, note: '+3 Elemental Burst level.' },
      {
        level: 4,
        note: 'Restores energy on Salon Member hits, easing the ER requirement.',
      },
      { level: 5, note: '+3 Elemental Skill level.' },
      {
        level: 6,
        note: 'Enables an on-field, Hydro-infused playstyle with bonus healing and damage.',
      },
    ],
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
    role: 'Charged-attack on-field Hydro DPS with a HP-scaling kit and built-in team damage reduction.',
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
    substats: {
      priority: ['crit_rate', 'crit_dmg', 'hp_pct', 'er_pct'],
    },
    constellations: [
      {
        level: 1,
        note: 'Auto-grants a normal-attack stack on entering the field and boosts interruption resistance during charged attacks.',
      },
      {
        level: 2,
        note: 'Adds bonus CRIT DMG to enhanced charged attacks based on stack count.',
      },
      { level: 3, note: '+3 Normal Attack talent level.' },
      {
        level: 4,
        note: 'Generates a Sourcewater Droplet whenever Neuvillette is healed.',
      },
      { level: 5, note: '+3 Elemental Burst talent level.' },
      {
        level: 6,
        note: 'Extends charged-attack duration and adds extra damage instances by absorbing droplets mid-attack.',
      },
    ],
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
    substats: {
      priority: ['er_pct', 'crit_rate', 'crit_dmg', 'atk_pct'],
      floors: { er_pct: 125 },
    },
    constellations: [
      {
        level: 1,
        note: 'Reduces Elemental Skill cooldown, enabling shorter ranged/melee rotations.',
      },
      {
        level: 2,
        note: 'Defeating an enemy affected by Riptide restores Energy.',
      },
      { level: 3, note: '+3 Melee Stance (Elemental Skill) level.' },
      {
        level: 4,
        note: 'Automatically triggers Riptide effects periodically while in Melee Stance.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Resets Melee Stance cooldown after using his Elemental Burst while in Melee Stance.',
      },
    ],
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
    substats: {
      priority: ['er_pct', 'crit_rate', 'crit_dmg', 'atk_pct'],
      floors: { er_pct: 140 },
    },
    constellations: [
      {
        level: 1,
        note: 'Increases his max Rain Sword count, improving healing and damage reduction uptime.',
      },
      {
        level: 2,
        note: "Extends his Burst's duration and applies a Hydro RES shred to enemies.",
      },
      { level: 3, note: '+3 Elemental Burst level.' },
      {
        level: 4,
        note: "Boosts his Elemental Skill's damage for the duration of his Burst.",
      },
      { level: 5, note: '+3 Elemental Skill level.' },
      {
        level: 6,
        note: 'Changes his sword-rain attack pattern and restores Energy, sharply reducing his ER requirement.',
      },
    ],
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
    substats: {
      priority: ['er_pct', 'crit_rate', 'crit_dmg', 'hp_pct'],
      floors: { er_pct: 160 },
    },
    constellations: [
      {
        level: 1,
        note: 'Grants an additional Elemental Skill charge, easing rotation and Energy needs.',
      },
      {
        level: 2,
        note: 'Burst waves fire an extra arrow that deals bonus Hydro DMG based on max HP.',
      },
      { level: 3, note: '+3 Elemental Burst level.' },
      {
        level: 4,
        note: 'Marked enemies grant nearby party members a Max HP bonus — strong with HP-scaling teammates.',
      },
      { level: 5, note: '+3 Elemental Skill level.' },
      {
        level: 6,
        note: 'After her Burst, Normal Attacks become enhanced Hydro shots for a short window.',
      },
    ],
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
    substats: {
      priority: ['er_pct', 'hp_pct', 'crit_rate', 'crit_dmg'],
      floors: { er_pct: 115 },
    },
    constellations: [
      {
        level: 1,
        note: 'Increases her bubble bounce count, improving buff stacking and healing.',
      },
      {
        level: 2,
        note: 'Applies a Hydro RES shred to enemies hit and grants personal shields during her Skill and Burst.',
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: "Extends her Burst's duration for additional healing/damage instances.",
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Her Burst gains CRIT Rate and CRIT DMG scaling with her max HP.',
      },
    ],
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
  aino: {
    source: 'https://keqingmains.com/q/aino-quickguide/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'SilkenMoonsSerenade',
      },
      mains: {
        sands: 'em',
        goblet: 'em',
      },
      erTarget: 190,
      objective: 'em',
    },
    substats: {
      priority: ['er_pct', 'crit_rate', 'em'],
      floors: { er_pct: 190 },
    },
    constellations: [
      {
        level: 1,
        note: 'Grants Aino and the active character bonus Elemental Mastery after her Skill or Burst.',
      },
      {
        level: 2,
        note: 'Her off-field Burst triggers coordinated water balls when the active character attacks.',
      },
      { level: 3, note: '+3 Elemental Burst level.' },
      {
        level: 4,
        note: 'Restores Energy when her Skill hits opponents, greatly easing her ER requirement.',
      },
      { level: 5, note: '+3 Elemental Skill level.' },
      {
        level: 6,
        note: 'Grants the active character a bonus reaction DMG buff depending on Moonsign level.',
      },
    ],
    weapons: [
      {
        weaponKey: 'favonius_greatsword',
        rank: 1,
      },
      {
        weaponKey: 'makhaira_aquamarine',
        rank: 2,
        note: 'EM + team ATK buff',
      },
      {
        weaponKey: 'flameforged_insight',
        rank: 3,
        note: 'high EM + flat energy',
      },
      {
        weaponKey: 'master_key',
        rank: 4,
        note: 'craftable EM/ER',
      },
    ],
    talents: {
      priority: ['burst', 'skill', 'auto'],
      levels: {
        burst: 6,
        skill: 1,
        auto: 1,
      },
    },
    teams: [
      {
        name: 'Aino Lunar-Charged',
        slots: [
          {
            role: 'off-field Electro support',
            options: ['flins'],
          },
          {
            role: 'off-field Electro support',
            options: ['ineffa'],
          },
          {
            role: 'Anemo grouper/buffer',
            options: ['sucrose'],
          },
        ],
      },
    ],
  },
  barbara: {
    source: 'https://keqingmains.com/barbara/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'MaidenBeloved',
      },
      mains: {
        sands: 'hp_pct',
        goblet: 'hp_pct',
      },
      objective: 'hp_pct',
    },
    substats: {
      priority: ['hp_pct'],
    },
    constellations: [
      {
        level: 1,
        note: 'Restores a small amount of Energy periodically — minimal impact.',
      },
      {
        level: 2,
        note: 'Reduces her Elemental Skill cooldown and grants a Hydro DMG bonus while it is active.',
      },
      { level: 3, note: '+3 Elemental Burst level.' },
      {
        level: 4,
        note: 'Restores Energy per enemy hit by her Charged Attack.',
      },
      { level: 5, note: '+3 Elemental Skill level.' },
      {
        level: 6,
        note: 'Automatically revives a fallen teammate once per long cooldown.',
      },
    ],
    weapons: [
      {
        weaponKey: 'everlasting_moonglow',
        rank: 1,
      },
      {
        weaponKey: 'prototype_amber',
        rank: 2,
        note: 'craftable alternative',
      },
      {
        weaponKey: 'thrilling_tales_of_dragon_slayers',
        rank: 3,
        note: 'team ATK buff',
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
        name: 'Barbara Freeze Support',
        slots: [
          {
            role: 'main Cryo DPS',
            options: ['ganyu'],
          },
          {
            role: 'Anemo grouper/buffer',
            options: ['kaedehara_kazuha'],
          },
          {
            role: 'ATK buffer',
            options: ['bennett'],
          },
        ],
      },
    ],
  },
  candace: {
    source: 'https://keqingmains.com/candace/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'EmblemOfSeveredFate',
      },
      mains: {
        sands: 'er_pct',
        goblet: 'elemental_dmg',
      },
      erTarget: 260,
      objective: 'crit_value',
    },
    substats: {
      priority: ['er_pct', 'crit_rate', 'crit_dmg', 'hp_pct'],
      floors: { er_pct: 260 },
    },
    constellations: [
      {
        level: 1,
        note: 'Extends her buff duration, improving rotation flexibility.',
      },
      {
        level: 2,
        note: 'Grants a permanent HP buff after using her Elemental Skill.',
      },
      { level: 3, note: '+3 Elemental Burst level.' },
      {
        level: 4,
        note: 'Equalizes her held and tapped Elemental Skill cooldowns — a quality-of-life improvement.',
      },
      { level: 5, note: '+3 Elemental Skill level.' },
      {
        level: 6,
        note: 'Her off-field Elemental Burst triggers periodic bonus damage waves — a major boost to her support output.',
      },
    ],
    weapons: [
      {
        weaponKey: 'staff_of_homa',
        rank: 1,
      },
      {
        weaponKey: 'staff_of_the_scarlet_sands',
        rank: 2,
      },
      {
        weaponKey: 'favonius_lance',
        rank: 3,
        note: 'arguably her 4-star BiS',
      },
      {
        weaponKey: 'deathmatch',
        rank: 4,
      },
    ],
    talents: {
      priority: ['burst', 'skill', 'auto'],
      levels: {
        burst: 6,
        skill: 6,
        auto: 1,
      },
    },
    teams: [
      {
        name: 'Candace Reverse Vaporize',
        slots: [
          {
            role: 'main Pyro DPS',
            options: ['hu_tao'],
          },
          {
            role: 'off-field Hydro application',
            options: ['xingqiu'],
          },
          {
            role: 'ATK buffer + healer',
            options: ['bennett'],
          },
        ],
      },
    ],
  },
  columbina: {
    source: 'https://keqingmains.com/q/columbina-quickguide/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'SilkenMoonsSerenade',
      },
      mains: {
        sands: 'er_pct',
        goblet: 'hp_pct',
      },
      erTarget: 195,
      objective: 'hp_pct',
    },
    substats: {
      priority: ['er_pct', 'crit_rate', 'hp_pct', 'em'],
      floors: { er_pct: 195 },
    },
    constellations: [
      {
        level: 1,
        note: 'Immediately triggers Gravity Interference on Skill cast, adding a minor Lunar Reaction DMG buff.',
      },
      {
        level: 2,
        note: 'Increases Gravity accumulation and grants a large HP buff on Interference trigger — a strong stopping point.',
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Restores Energy per Gravity Interference and adds an HP-scaling damage boost.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Grants a large CRIT DMG bonus to matching elements after Lunar reactions.',
      },
    ],
    weapons: [
      {
        weaponKey: "nocturne's_curtain_call",
        rank: 1,
        note: 'signature',
      },
      {
        weaponKey: 'sacrificial_jade',
        rank: 2,
        note: 'second-best off-field',
      },
      {
        weaponKey: 'prototype_amber',
        rank: 3,
        note: 'utility, healing',
      },
      {
        weaponKey: 'favonius_codex',
        rank: 4,
        note: 'team energy support',
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
        name: 'Columbina Lunar-Charged',
        slots: [
          {
            role: 'off-field Electro support',
            options: ['ineffa'],
          },
          {
            role: 'off-field Electro support',
            options: ['flins'],
          },
          {
            role: 'Anemo grouper/buffer',
            options: ['sucrose'],
          },
        ],
      },
    ],
  },
  dahlia: {
    source: 'https://keqingmains.com/q/dahlia-quickguide/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'NoblesseOblige',
      },
      mains: {
        sands: 'hp_pct',
        goblet: 'hp_pct',
      },
      erTarget: 240,
      objective: 'hp_pct',
    },
    substats: {
      priority: ['er_pct', 'crit_rate', 'hp_pct'],
      floors: { er_pct: 240 },
    },
    constellations: [
      {
        level: 1,
        note: 'Restores Energy, significantly easing her ER requirement.',
      },
      {
        level: 2,
        note: 'Increases her shield strength after it breaks.',
      },
      { level: 3, note: '+3 Elemental Burst level, increasing shield HP.' },
      {
        level: 4,
        note: 'Extends her Favonian Favor buff duration.',
      },
      {
        level: 5,
        note: '+3 Elemental Skill level — a marginal damage increase.',
      },
      {
        level: 6,
        note: 'Grants a flat Attack SPD buff and an emergency revive.',
      },
    ],
    weapons: [
      {
        weaponKey: 'favonius_sword',
        rank: 1,
        note: 'best for ER needs',
      },
      {
        weaponKey: 'freedomsworn',
        rank: 2,
        note: 'DMG bonus on reaction trigger',
      },
      {
        weaponKey: 'peak_patrol_song',
        rank: 3,
      },
      {
        weaponKey: 'key_of_khajnisut',
        rank: 4,
        note: 'HP stat stick',
      },
    ],
    talents: {
      priority: ['burst', 'skill', 'auto'],
      levels: {
        burst: 6,
        skill: 1,
        auto: 1,
      },
    },
    teams: [
      {
        name: 'Dahlia Skirk Support',
        slots: [
          {
            role: 'main Hydro/Cryo DPS',
            options: ['skirk'],
          },
          {
            role: 'off-field Cryo support',
            options: ['escoffier'],
          },
          {
            role: 'main Hydro DPS',
            options: ['furina'],
          },
        ],
      },
    ],
  },
  kamisato_ayato: {
    source: 'https://keqingmains.com/ayato/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'HeartOfDepth',
      },
      mains: {
        sands: 'atk_pct',
        goblet: 'elemental_dmg',
      },
      erTarget: 140,
      objective: 'crit_value',
    },
    substats: {
      priority: ['er_pct', 'crit_rate', 'crit_dmg', 'atk_pct'],
      floors: { er_pct: 140 },
    },
    constellations: [
      {
        level: 1,
        note: 'Grants bonus Shunsuiken damage against low-HP enemies.',
      },
      {
        level: 2,
        note: 'Increases his max Namisen stacks and grants a large Max HP buff at 3+ stacks.',
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Grants the team a temporary Normal Attack SPD buff after his Burst.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Adds two extra Shunsuiken strikes — his best constellation, though he performs excellently at C0.',
      },
    ],
    weapons: [
      {
        weaponKey: 'haran_geppaku_futsu',
        rank: 1,
      },
      {
        weaponKey: 'primordial_jade_cutter',
        rank: 2,
      },
      {
        weaponKey: 'mistsplitter_reforged',
        rank: 3,
      },
      {
        weaponKey: 'the_black_sword',
        rank: 4,
        note: 'F2P baseline',
      },
    ],
    talents: {
      priority: ['skill', 'auto', 'burst'],
      levels: {
        skill: 9,
        auto: 1,
        burst: 6,
      },
    },
    teams: [
      {
        name: 'Ayato Anemo Overvape',
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
            role: 'off-field Electro DPS',
            options: ['fischl'],
          },
        ],
      },
    ],
  },
  mona: {
    source: 'https://keqingmains.com/mona/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'HeartOfDepth',
      },
      mains: {
        sands: 'atk_pct',
        goblet: 'elemental_dmg',
      },
      objective: 'crit_value',
    },
    substats: {
      priority: ['atk_pct', 'crit_rate', 'crit_dmg', 'em'],
    },
    constellations: [
      {
        level: 1,
        note: 'Enhances Hydro-related reactions against enemies affected by her Omen DMG buff.',
      },
      {
        level: 2,
        note: 'Normal Attacks have a chance to trigger a free Charged Attack with no stamina cost.',
      },
      { level: 3, note: '+3 Elemental Burst level.' },
      {
        level: 4,
        note: 'Grants attackers of Omen-afflicted enemies a CRIT Rate bonus.',
      },
      { level: 5, note: '+3 Elemental Skill level.' },
      {
        level: 6,
        note: 'Charged Attacks gain a stacking DMG bonus while sprinting.',
      },
    ],
    weapons: [
      {
        weaponKey: 'skyward_atlas',
        rank: 1,
      },
      {
        weaponKey: 'lost_prayer_to_the_sacred_winds',
        rank: 2,
      },
      {
        weaponKey: 'memory_of_dust',
        rank: 3,
        note: 'shines with Zhongli shield',
      },
      {
        weaponKey: 'the_widsith',
        rank: 4,
        note: 'best for vaporize DPS and nuke',
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
        name: 'Mona Vaporize Nuke',
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
            role: 'main Pyro DPS',
            options: ['klee'],
          },
        ],
      },
    ],
  },
  mualani: {
    source: 'https://keqingmains.com/q/mualani-quickguide/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'ObsidianCodex',
      },
      mains: {
        sands: 'hp_pct',
        goblet: 'elemental_dmg',
      },
      objective: 'hp_pct',
    },
    substats: {
      priority: ['crit_rate', 'crit_dmg', 'hp_pct', 'em'],
    },
    constellations: [
      {
        level: 1,
        note: "Increases her first Surging Bite's damage and reduces Phlogiston consumption.",
      },
      {
        level: 2,
        note: 'Grants Wave Momentum stacks on entering her Skill state and extra Nightsoul regeneration.',
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Her Puffers restore Energy and boost her Burst damage.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: "Extends her C1 buff to all Sharky's Bites — limited practical value.",
      },
    ],
    weapons: [
      {
        weaponKey: "surf's_up",
        rank: 1,
        note: 'signature',
      },
      {
        weaponKey: 'tome_of_the_eternal_flow',
        rank: 2,
      },
      {
        weaponKey: 'the_widsith',
        rank: 3,
        note: 'best accessible option',
      },
      {
        weaponKey: 'ring_of_yaxche',
        rank: 4,
        note: 'F2P craftable',
      },
    ],
    talents: {
      priority: ['skill', 'auto', 'burst'],
      levels: {
        skill: 9,
        auto: 1,
        burst: 1,
      },
    },
    teams: [
      {
        name: 'Mualani Forward Vaporize',
        slots: [
          {
            role: 'main Pyro DPS',
            options: ['mavuika'],
          },
          {
            role: 'off-field Geo/Nightsoul support',
            options: ['xilonen'],
          },
          {
            role: 'Anemo grouper/buffer',
            options: ['sucrose'],
          },
        ],
      },
    ],
  },
  nilou: {
    source: 'https://keqingmains.com/nilou/',
    build: {
      setRequirement: {
        kind: '2+2',
        setKeys: ['TenacityOfTheMillelith', 'VourukashasGlow'],
      },
      mains: {
        sands: 'hp_pct',
        goblet: 'hp_pct',
      },
      erTarget: 150,
      objective: 'hp_pct',
    },
    substats: {
      priority: ['hp_pct', 'em', 'er_pct'],
      floors: { er_pct: 150 },
    },
    constellations: [
      {
        level: 1,
        note: 'Increases her Luminous Illusion damage and extends her Tranquility Aura duration.',
      },
      {
        level: 2,
        note: "Reduces the Hydro RES of enemies hit while under her Golden Chalice's Bounty buff.",
      },
      { level: 3, note: '+3 Elemental Burst level — minor for Bloom teams.' },
      {
        level: 4,
        note: 'Restores Energy after her third Skill hit and boosts her Burst damage.',
      },
      { level: 5, note: '+3 Elemental Skill level — minor for Bloom teams.' },
      {
        level: 6,
        note: 'Grants CRIT Rate and CRIT DMG scaling with her max HP, enabling Vaporize viability.',
      },
    ],
    weapons: [
      {
        weaponKey: 'key_of_khajnisut',
        rank: 1,
        note: 'uncontested best-in-slot',
      },
      {
        weaponKey: "the_dockhand's_assistant",
        rank: 2,
        note: 'best 4-star HP%',
      },
      {
        weaponKey: "xiphos'_moonlight",
        rank: 3,
        note: 'best EM secondary',
      },
      {
        weaponKey: 'iron_sting',
        rank: 4,
        note: 'F2P EM option',
      },
    ],
    talents: {
      priority: ['skill', 'burst', 'auto'],
      levels: {
        skill: 1,
        burst: 1,
        auto: 1,
      },
    },
    teams: [
      {
        name: 'Nilou Double Hydro Bloom',
        slots: [
          {
            role: 'off-field Hydro application/healer',
            options: ['sangonomiya_kokomi'],
          },
          {
            role: 'Dendro applicator/EM buffer',
            options: ['nahida'],
          },
          {
            role: 'off-field Dendro application',
            options: ['collei'],
          },
        ],
      },
    ],
  },
  sangonomiya_kokomi: {
    source: 'https://keqingmains.com/kokomi/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'OceanHuedClam',
      },
      mains: {
        sands: 'hp_pct',
        goblet: 'elemental_dmg',
      },
      erTarget: 180,
      objective: 'hp_pct',
    },
    substats: {
      priority: ['er_pct', 'hp_pct', 'atk_pct', 'em'],
      floors: { er_pct: 180 },
    },
    constellations: [
      {
        level: 1,
        note: 'Fires an extra projectile on her final Normal Attack, improving Hydro application consistency.',
      },
      {
        level: 2,
        note: 'Grants bonus healing to allies below 50% HP — minimal value since she prevents low HP.',
      },
      { level: 3, note: '+3 Elemental Burst level — negligible impact.' },
      {
        level: 4,
        note: 'Grants a Normal Attack SPD buff and restores Energy — a quality-of-life improvement.',
      },
      { level: 5, note: '+3 Elemental Skill level — low value.' },
      {
        level: 6,
        note: 'Grants a large Hydro DMG bonus after healing a target above 80% HP.',
      },
    ],
    weapons: [
      {
        weaponKey: 'everlasting_moonglow',
        rank: 1,
        note: 'signature',
      },
      {
        weaponKey: 'prototype_amber',
        rank: 2,
        note: 'F2P',
      },
      {
        weaponKey: 'hakushin_ring',
        rank: 3,
      },
      {
        weaponKey: 'thrilling_tales_of_dragon_slayers',
        rank: 4,
        note: 'support ATK buff',
      },
    ],
    talents: {
      priority: ['burst', 'skill', 'auto'],
      levels: {
        burst: 6,
        skill: 6,
        auto: 1,
      },
    },
    teams: [
      {
        name: 'Kokomi Electro-Charged Driver',
        slots: [
          {
            role: 'off-field Electro DPS',
            options: ['beidou'],
          },
          {
            role: 'off-field Electro DPS',
            options: ['fischl'],
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
