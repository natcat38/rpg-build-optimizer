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
  aloy: {
    source: 'https://keqingmains.com/aloy/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'EmblemOfSeveredFate',
      },
      mains: {
        sands: 'atk_pct',
        goblet: 'elemental_dmg',
      },
      erTarget: 140,
      objective: 'crit_value',
    },
    substats: {
      priority: ['crit_rate', 'crit_dmg', 'atk_pct', 'er_pct'],
      floors: { er_pct: 140 },
    },
    weapons: [
      {
        weaponKey: 'polar_star',
        rank: 1,
      },
      {
        weaponKey: 'elegy_for_the_end',
        rank: 2,
      },
      {
        weaponKey: 'skyward_harp',
        rank: 3,
      },
      {
        weaponKey: 'the_stringless',
        rank: 4,
        note: 'F2P, best at R5',
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
        name: 'Aloy Quickswap Melt',
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
  charlotte: {
    source: 'https://keqingmains.com/q/charlotte-quickguide/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'NoblesseOblige',
      },
      mains: {
        sands: 'er_pct',
        goblet: 'atk_pct',
      },
      erTarget: 180,
      objective: 'crit_value',
    },
    substats: {
      priority: ['er_pct', 'atk_pct', 'crit_rate', 'crit_dmg'],
      floors: { er_pct: 180 },
    },
    constellations: [
      {
        level: 1,
        note: 'Adds sustained partywide healing for several seconds after casting her Burst.',
      },
      {
        level: 2,
        note: 'Grants a temporary ATK buff scaling with enemies hit by her Elemental Skill.',
      },
      { level: 3, note: '+3 Elemental Burst level.' },
      {
        level: 4,
        note: 'Boosts her Elemental Skill damage and restores Energy on activation.',
      },
      { level: 5, note: '+3 Elemental Skill level.' },
      {
        level: 6,
        note: 'Adds a coordinated Cryo attack and healing when teammates hit her marked enemies.',
      },
    ],
    weapons: [
      {
        weaponKey: 'prototype_amber',
        rank: 1,
        note: 'best for healing',
      },
      {
        weaponKey: 'favonius_codex',
        rank: 2,
      },
      {
        weaponKey: 'thrilling_tales_of_dragon_slayers',
        rank: 3,
        note: 'low-ER scenarios',
      },
      {
        weaponKey: "kagura's_verity",
        rank: 4,
        note: 'offensive playstyle',
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
        name: 'Charlotte Hydro Support',
        slots: [
          {
            role: 'main Hydro DPS',
            options: ['furina', 'neuvillette'],
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
  chongyun: {
    source: 'https://keqingmains.com/chongyun/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'NoblesseOblige',
      },
      mains: {
        sands: 'em',
        goblet: 'elemental_dmg',
      },
      objective: 'em',
    },
    substats: {
      priority: ['em', 'crit_rate', 'crit_dmg', 'atk_pct'],
    },
    constellations: [
      {
        level: 1,
        note: 'Increases the damage of the final hit in his Normal Attack chain — negligible in most rotations.',
      },
      {
        level: 2,
        note: "Reduces the party's ability cooldowns — his best constellation.",
      },
      { level: 3, note: '+3 Elemental Burst level.' },
      {
        level: 4,
        note: 'Restores Energy when hitting Cryo-affected enemies.',
      },
      { level: 5, note: '+3 Elemental Skill level.' },
      {
        level: 6,
        note: 'Greatly increases his Elemental Burst damage.',
      },
    ],
    weapons: [
      {
        weaponKey: "wolf's_gravestone",
        rank: 1,
        note: 'team ATK buff',
      },
      {
        weaponKey: 'sacrificial_greatsword',
        rank: 2,
        note: 'particle generation',
      },
      {
        weaponKey: 'serpent_spine',
        rank: 3,
      },
      {
        weaponKey: 'luxurious_sealord',
        rank: 4,
        note: 'F2P option',
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
        name: 'Chongyun Melt Enabler',
        slots: [
          {
            role: 'main DPS (Melt)',
            options: ['hu_tao'],
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
  citlali: {
    source: 'https://keqingmains.com/q/citlali-quickguide/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'ScrollOfTheHeroOfCinderCity',
      },
      mains: {
        sands: 'em',
        goblet: 'elemental_dmg',
      },
      erTarget: 170,
      objective: 'em',
    },
    substats: {
      priority: ['er_pct', 'em', 'crit_rate', 'atk_pct'],
      floors: { er_pct: 170 },
    },
    constellations: [
      {
        level: 1,
        note: 'Grants a stacking buff scaling with her Elemental Mastery, consumed per damage instance.',
      },
      {
        level: 2,
        note: 'Grants Citlali and her teammates bonus Elemental Mastery and increases her RES shred.',
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Periodically summons an additional Spiritvessel Skull during her Skill, restoring Energy and Nightsoul points.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Grants her Nightsoul state a large Pyro/Hydro DMG Bonus to the team.',
      },
    ],
    weapons: [
      {
        weaponKey: "starcaller's_watch",
        rank: 1,
      },
      {
        weaponKey: 'thrilling_tales_of_dragon_slayers',
        rank: 2,
        note: 'strong ATK buff',
      },
      {
        weaponKey: 'wandering_evenstar',
        rank: 3,
      },
      {
        weaponKey: 'a_thousand_floating_dreams',
        rank: 4,
        note: 'teamwide buff',
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
        name: 'Citlali Vapemelt',
        slots: [
          {
            role: 'main Pyro DPS',
            options: ['mavuika'],
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
  diona: {
    source: 'https://keqingmains.com/diona/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'NoblesseOblige',
      },
      mains: {
        sands: 'hp_pct',
        goblet: 'hp_pct',
      },
      objective: 'hp_pct',
    },
    substats: {
      priority: ['er_pct', 'crit_rate', 'hp_pct'],
    },
    constellations: [
      {
        level: 1,
        note: 'Reduces her Elemental Burst Energy cost.',
      },
      {
        level: 2,
        note: 'Increases shield DMG absorption and grants shields to co-op teammates.',
      },
      { level: 3, note: '+3 Elemental Burst level.' },
      {
        level: 4,
        note: 'Reduces the charge time of her Aimed Shot — niche for on-field play.',
      },
      { level: 5, note: '+3 Elemental Skill level.' },
      {
        level: 6,
        note: 'Grants a large Elemental Mastery buff above 50% HP and bonus healing below it.',
      },
    ],
    weapons: [
      {
        weaponKey: 'sacrificial_bow',
        rank: 1,
        note: 'shield uptime + particle generation',
      },
      {
        weaponKey: 'favonius_warbow',
        rank: 2,
        note: 'F2P energy option',
      },
      {
        weaponKey: 'elegy_for_the_end',
        rank: 3,
        note: 'best 5-star, inconsistent proc',
      },
      {
        weaponKey: 'recurve_bow',
        rank: 4,
        note: 'F2P HP stat stick',
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
        name: 'Diona Freeze Support',
        slots: [
          {
            role: 'main Cryo DPS',
            options: ['ganyu'],
          },
          {
            role: 'off-field Hydro application',
            options: ['xingqiu'],
          },
          {
            role: 'Anemo grouper/buffer',
            options: ['kaedehara_kazuha'],
          },
        ],
      },
    ],
  },
  escoffier: {
    source: 'https://keqingmains.com/q/escoffier-quickguide/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'GoldenTroupe',
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
        note: 'Grants the party a large Cryo CRIT DMG bonus in Hydro/Cryo-only teams.',
      },
      {
        level: 2,
        note: 'Grants a stacking Cryo DMG bonus from Cold Dish stacks.',
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Extends her healing and restores Energy over several procs.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Adds multiple AoE Cryo hits per rotation — her strongest personal-damage constellation.',
      },
    ],
    weapons: [
      {
        weaponKey: 'symphonist_of_scents',
        rank: 1,
        note: 'signature',
      },
      {
        weaponKey: 'staff_of_homa',
        rank: 2,
      },
      {
        weaponKey: 'calamity_queller',
        rank: 3,
      },
      {
        weaponKey: 'deathmatch',
        rank: 4,
        note: 'best F2P option',
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
        name: 'Escoffier Mono Cryo',
        slots: [
          {
            role: 'main Cryo/Hydro DPS',
            options: ['skirk'],
          },
          {
            role: 'main Hydro DPS',
            options: ['furina'],
          },
          {
            role: 'Cryo buffer/debuffer',
            options: ['shenhe'],
          },
        ],
      },
    ],
  },
  eula: {
    source: 'https://keqingmains.com/eula/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'PaleFlame',
      },
      mains: {
        sands: 'atk_pct',
        goblet: 'physical_dmg',
      },
      erTarget: 135,
      objective: 'crit_value',
    },
    substats: {
      priority: ['er_pct', 'crit_rate', 'crit_dmg', 'atk_pct'],
      floors: { er_pct: 135 },
    },
    constellations: [
      {
        level: 1,
        note: 'Grants a temporary Physical DMG buff when consuming Grimheart stacks.',
      },
      {
        level: 2,
        note: 'Reduces her held Elemental Skill cooldown to match the quick-press version.',
      },
      { level: 3, note: '+3 Elemental Burst level.' },
      {
        level: 4,
        note: 'Increases Lightfall Sword damage against low-HP enemies.',
      },
      { level: 5, note: '+3 Elemental Skill level.' },
      {
        level: 6,
        note: 'Her Lightfall Sword starts with bonus stacks and gains more per ability use — her most transformative constellation.',
      },
    ],
    weapons: [
      {
        weaponKey: 'song_of_broken_pines',
        rank: 1,
        note: 'signature',
      },
      {
        weaponKey: "wolf's_gravestone",
        rank: 2,
      },
      {
        weaponKey: 'the_unforged',
        rank: 3,
      },
      {
        weaponKey: 'serpent_spine',
        rank: 4,
        note: 'best F2P/4-star',
      },
    ],
    talents: {
      priority: ['burst', 'auto', 'skill'],
      levels: {
        burst: 9,
        auto: 9,
        skill: 1,
      },
    },
    teams: [
      {
        name: 'Eula Triple Cryo',
        slots: [
          {
            role: 'off-field Electro DPS',
            options: ['fischl'],
          },
          {
            role: 'Cryo battery/debuffer',
            options: ['rosaria'],
          },
          {
            role: 'Cryo battery/shielder',
            options: ['diona'],
          },
        ],
      },
    ],
  },
  freminet: {
    source: 'https://keqingmains.com/q/freminet-quickguide/',
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
      priority: ['er_pct', 'crit_rate', 'crit_dmg', 'atk_pct'],
      floors: { er_pct: 140 },
    },
    constellations: [
      {
        level: 1,
        note: 'Adds bonus CRIT Rate to his Shattering Pressure attack — loses value once CRIT Rate is capped.',
      },
      {
        level: 2,
        note: 'Restores Energy on Shattering Pressure activation, significantly easing his ER requirement.',
      },
      { level: 3, note: '+3 Normal Attack level.' },
      {
        level: 4,
        note: 'Grants a temporary ATK buff when triggering Frozen/Shatter/Superconduct.',
      },
      { level: 5, note: '+3 Elemental Skill level.' },
      {
        level: 6,
        note: 'Stacks a large CRIT DMG buff from reaction triggers.',
      },
    ],
    weapons: [
      {
        weaponKey: 'a_thousand_blazing_suns',
        rank: 1,
      },
      {
        weaponKey: 'fang_of_the_mountain_king',
        rank: 2,
      },
      {
        weaponKey: 'tidal_shadow',
        rank: 3,
        note: 'F2P, best 4-star',
      },
      {
        weaponKey: 'serpent_spine',
        rank: 4,
        note: 'F2P alternative',
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
        name: 'Freminet Mono Cryo',
        slots: [
          {
            role: 'main Hydro DPS',
            options: ['furina'],
          },
          {
            role: 'off-field Cryo DPS/support',
            options: ['escoffier'],
          },
          {
            role: 'Cryo buffer/debuffer',
            options: ['shenhe'],
          },
        ],
      },
    ],
  },
  kaeya: {
    source: 'https://keqingmains.com/kaeya/',
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
      priority: ['er_pct', 'atk_pct', 'crit_dmg', 'crit_rate'],
      floors: { er_pct: 140 },
    },
    constellations: [
      {
        level: 1,
        note: 'Grants bonus CRIT Rate against Cryo-affected enemies — only relevant for on-field DPS builds.',
      },
      {
        level: 2,
        note: 'Extends his Elemental Burst duration for each enemy defeated during it.',
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Auto-triggers a shield when his HP drops low — an unreliable survivability tool.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Adds a fourth icicle to his Burst and refunds Energy on cast, greatly easing his ER requirement.',
      },
    ],
    weapons: [
      {
        weaponKey: 'mistsplitter_reforged',
        rank: 1,
      },
      {
        weaponKey: 'light_of_foliar_incision',
        rank: 2,
      },
      {
        weaponKey: 'haran_geppaku_futsu',
        rank: 3,
      },
      {
        weaponKey: 'kagotsurube_isshin',
        rank: 4,
        note: 'F2P option',
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
        name: 'Kaeya Quickswap Freeze',
        slots: [
          {
            role: 'main Cryo DPS',
            options: ['rosaria'],
          },
          {
            role: 'off-field Hydro application',
            options: ['xingqiu'],
          },
          {
            role: 'Anemo grouper/buffer',
            options: ['kaedehara_kazuha'],
          },
        ],
      },
    ],
  },
  layla: {
    source: 'https://keqingmains.com/layla/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'TenacityOfTheMillelith',
      },
      mains: {
        sands: 'hp_pct',
        goblet: 'hp_pct',
      },
      erTarget: 150,
      objective: 'hp_pct',
    },
    substats: {
      priority: ['er_pct', 'hp_pct', 'crit_rate'],
      floors: { er_pct: 150 },
    },
    constellations: [
      {
        level: 1,
        note: 'Increases her shield absorption and generates weaker shields for co-op teammates.',
      },
      {
        level: 2,
        note: 'Shooting Stars from her Elemental Burst restore Energy on hitting enemies.',
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Grants a Normal/Charged Attack DMG buff scaling with her max HP when Shooting Stars fire.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Increases Shooting Star and Starlight Slug damage and speeds up Night Star generation.',
      },
    ],
    weapons: [
      {
        weaponKey: 'key_of_khajnisut',
        rank: 1,
        note: 'best shield strength',
      },
      {
        weaponKey: 'favonius_sword',
        rank: 2,
        note: 'ER + team particles',
      },
      {
        weaponKey: 'primordial_jade_cutter',
        rank: 3,
        note: 'solid HP%',
      },
      {
        weaponKey: 'harbinger_of_dawn',
        rank: 4,
        note: 'F2P if ER met',
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
        name: 'Layla Freeze Shielder',
        slots: [
          {
            role: 'main Cryo DPS',
            options: ['kamisato_ayaka'],
          },
          {
            role: 'off-field Hydro application',
            options: ['sangonomiya_kokomi'],
          },
          {
            role: 'Anemo grouper/buffer',
            options: ['kaedehara_kazuha'],
          },
        ],
      },
    ],
  },
  lohen: {
    source: 'https://keqingmains.com/q/lohen-quickguide/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'ADayCarvedFromRisingWinds',
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
        note: 'Increases his Will to Win cap, strengthening his special Skill and Burst.',
      },
      {
        level: 2,
        note: 'Adds an AoE strike and grants allies bonus Elemental Mastery.',
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Restores Energy, easing his ER requirement.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Doubles his special Skill casts and adds a large CRIT DMG bonus.',
      },
    ],
    weapons: [
      {
        weaponKey: 'disaster_and_remorse',
        rank: 1,
        note: 'signature',
      },
      {
        weaponKey: 'primordial_jade_wingedspear',
        rank: 2,
      },
      {
        weaponKey: "crimson_moon's_semblance",
        rank: 3,
      },
      {
        weaponKey: 'deathmatch',
        rank: 4,
        note: 'F2P default',
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
        name: 'Lohen Forward Melt',
        slots: [
          {
            role: 'off-field Anemo/PHEC support',
            options: ['durin'],
          },
          {
            role: 'support/healer',
            options: ['nicole'],
          },
          {
            role: 'off-field Cryo/Geo application',
            options: ['citlali'],
          },
        ],
      },
    ],
  },
  mika: {
    source: 'https://keqingmains.com/mika/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'NoblesseOblige',
      },
      mains: {
        sands: 'hp_pct',
        goblet: 'hp_pct',
      },
      erTarget: 220,
      objective: 'hp_pct',
    },
    substats: {
      priority: ['er_pct', 'crit_rate', 'hp_pct'],
      floors: { er_pct: 220 },
    },
    constellations: [
      {
        level: 1,
        note: 'Reduces the interval between his coordinated heals, scaling with Attack SPD.',
      },
      {
        level: 2,
        note: 'Generates a Detector stack from his first Elemental Skill hit — valuable in single-target fights.',
      },
      { level: 3, note: '+3 Elemental Burst level.' },
      {
        level: 4,
        note: 'Restores Energy per coordinated heal, significantly easing his ER requirement.',
      },
      { level: 5, note: '+3 Elemental Skill level.' },
      {
        level: 6,
        note: 'Increases his max Detector stacks and grants a large Physical CRIT DMG bonus.',
      },
    ],
    weapons: [
      {
        weaponKey: 'favonius_lance',
        rank: 1,
        note: 'best for team Energy generation',
      },
      {
        weaponKey: 'dialogues_of_the_desert_sages',
        rank: 2,
        note: 'strong HP scaling',
      },
      {
        weaponKey: 'rightful_reward',
        rank: 3,
        note: 'craftable alternative',
      },
      {
        weaponKey: 'prototype_starglitter',
        rank: 4,
        note: 'F2P ER stat stick',
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
        name: 'Mika Physical Support',
        slots: [
          {
            role: 'main Physical DPS',
            options: ['eula'],
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
  qiqi: {
    source: 'https://keqingmains.com/qiqi/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'BlizzardStrayer',
      },
      mains: {
        sands: 'atk_pct',
        goblet: 'elemental_dmg',
      },
      objective: 'crit_value',
    },
    substats: {
      priority: ['crit_rate', 'crit_dmg', 'atk_pct'],
    },
    constellations: [
      {
        level: 1,
        note: 'Refunds Energy when her Herald hits Talisman-marked enemies.',
      },
      {
        level: 2,
        note: 'Increases Physical/Charged Attack DMG against Cryo-affected enemies.',
      },
      { level: 3, note: '+3 Elemental Burst level.' },
      {
        level: 4,
        note: 'Reduces the ATK of enemies marked by her Talisman.',
      },
      { level: 5, note: '+3 Elemental Skill level.' },
      {
        level: 6,
        note: 'Revives a fallen teammate and restores HP once per long cooldown — a safety net, not a damage constellation.',
      },
    ],
    weapons: [
      {
        weaponKey: 'sacrificial_sword',
        rank: 1,
        note: 'enables double Skill procs',
      },
      {
        weaponKey: 'aquila_favonia',
        rank: 2,
        note: 'stat stick',
      },
      {
        weaponKey: 'primordial_jade_cutter',
        rank: 3,
        note: 'stat stick',
      },
      {
        weaponKey: 'favonius_sword',
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
        name: 'Qiqi Permafreeze',
        slots: [
          {
            role: 'main Cryo DPS',
            options: ['kaeya'],
          },
          {
            role: 'off-field Hydro application',
            options: ['xingqiu'],
          },
          {
            role: 'Anemo grouper/buffer',
            options: ['kaedehara_kazuha'],
          },
        ],
      },
    ],
  },
  rosaria: {
    source: 'https://keqingmains.com/rosaria/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'BlizzardStrayer',
      },
      mains: {
        sands: 'atk_pct',
        goblet: 'elemental_dmg',
      },
      erTarget: 130,
      objective: 'crit_value',
    },
    substats: {
      priority: ['crit_dmg', 'crit_rate', 'atk_pct', 'er_pct'],
      floors: { er_pct: 130 },
    },
    constellations: [
      {
        level: 1,
        note: 'Provides a small damage increase — negligible value.',
      },
      {
        level: 2,
        note: 'Extends her Elemental Burst duration, adding extra damage ticks — her most valuable constellation.',
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Restores Energy on a Skill CRIT hit.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Reduces enemy Physical RES — strong alongside Physical-focused teammates like Eula.',
      },
    ],
    weapons: [
      {
        weaponKey: "wavebreaker's_fin",
        rank: 1,
      },
      {
        weaponKey: 'staff_of_homa',
        rank: 2,
      },
      {
        weaponKey: 'primordial_jade_wingedspear',
        rank: 3,
      },
      {
        weaponKey: 'the_catch',
        rank: 4,
        note: 'F2P craftable',
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
        name: 'Rosaria Freeze Support',
        slots: [
          {
            role: 'main Cryo DPS',
            options: ['kaeya'],
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
  sandrone: {
    source: 'https://keqingmains.com/q/sandrone-quickguide/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'DisenchantmentInDeepShadow',
      },
      mains: {
        sands: 'atk_pct',
        goblet: 'atk_pct',
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
        note: 'Grants a Stellar-Conduct DMG bonus and slows her Fagio charge-attack cadence.',
      },
      {
        level: 2,
        note: 'Adds bonus CRIT DMG to her condensed beams, stacking up to three times.',
      },
      { level: 3, note: '+3 Normal Attack level.' },
      {
        level: 4,
        note: 'Summons a coordinated cannon attack periodically.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Her third condensed beam becomes a stronger Condensed Cluster Beam and grants bonus Stellar-Conduct DMG.',
      },
    ],
    weapons: [
      {
        weaponKey: 'a_teaspoon_of_transcendence',
        rank: 1,
        note: 'signature',
      },
      {
        weaponKey: 'a_thousand_blazing_suns',
        rank: 2,
      },
      {
        weaponKey: "wolf's_gravestone",
        rank: 3,
      },
      {
        weaponKey: 'tidal_shadow',
        rank: 4,
        note: 'F2P, best 4-star',
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
        name: 'Sandrone On-Field DPS',
        slots: [
          {
            role: 'off-field Electro DPS',
            options: ['yae_miko'],
          },
          {
            role: 'healer',
            options: ['qiqi'],
          },
          {
            role: 'support/shielder',
            options: ['escoffier'],
          },
        ],
      },
    ],
  },
  shenhe: {
    source: 'https://keqingmains.com/shenhe/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'NoblesseOblige',
      },
      mains: {
        sands: 'atk_pct',
        goblet: 'atk_pct',
      },
      erTarget: 190,
      objective: 'crit_value',
    },
    substats: {
      priority: ['er_pct', 'atk_pct', 'crit_rate', 'crit_dmg'],
      floors: { er_pct: 190 },
    },
    constellations: [
      {
        level: 1,
        note: 'Grants her Elemental Skill an additional charge — best for short rotations.',
      },
      {
        level: 2,
        note: "Extends her Elemental Burst's duration — better for longer fights.",
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Mostly increases her own personal damage — negligible team benefit.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Normal and Charged Attacks no longer consume Icy Quill stacks, enabling Burst-less playstyles.',
      },
    ],
    weapons: [
      {
        weaponKey: 'calamity_queller',
        rank: 1,
        note: 'signature',
      },
      {
        weaponKey: 'engulfing_lightning',
        rank: 2,
      },
      {
        weaponKey: 'favonius_lance',
        rank: 3,
        note: 'best 4-star, reduces team ER needs',
      },
      {
        weaponKey: 'skyward_spine',
        rank: 4,
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
        name: 'Shenhe Ayaka Freeze',
        slots: [
          {
            role: 'main Cryo DPS',
            options: ['kamisato_ayaka'],
          },
          {
            role: 'off-field Hydro application',
            options: ['sangonomiya_kokomi'],
          },
          {
            role: 'Anemo grouper/buffer',
            options: ['kaedehara_kazuha'],
          },
        ],
      },
    ],
  },
  skirk: {
    source: 'https://keqingmains.com/q/skirk-quickguide/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'FinaleOfTheDeepGalleries',
      },
      mains: {
        sands: 'atk_pct',
        goblet: 'elemental_dmg',
      },
      objective: 'crit_value',
    },
    substats: {
      priority: ['crit_rate', 'crit_dmg', 'atk_pct'],
    },
    constellations: [
      {
        level: 1,
        note: 'Void Rift absorption triggers a bonus crystal blade Charged Attack.',
      },
      {
        level: 2,
        note: "Adds Serpent's Subtlety from her Skill and extends her Burst damage scaling.",
      },
      { level: 3, note: '+3 Elemental Burst level.' },
      {
        level: 4,
        note: 'Grants a stacking ATK buff from her ascension passive — her weakest constellation.',
      },
      { level: 5, note: '+3 Elemental Skill level.' },
      {
        level: 6,
        note: 'Void Rift absorption grants Sever stacks, enabling additional coordinated attacks.',
      },
    ],
    weapons: [
      {
        weaponKey: 'azurelight',
        rank: 1,
        note: 'signature',
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
        weaponKey: 'calamity_of_eshu',
        rank: 4,
        note: 'F2P, rivals 5-stars',
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
        name: 'Skirk Quickswap Hydro-Cryo',
        slots: [
          {
            role: 'main Hydro DPS',
            options: ['neuvillette', 'furina'],
          },
          {
            role: 'off-field Cryo support',
            options: ['escoffier'],
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
