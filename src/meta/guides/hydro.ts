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
