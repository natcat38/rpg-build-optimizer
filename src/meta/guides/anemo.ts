import type { CharacterGuide } from './types';

export const anemo: Record<string, CharacterGuide> = {
  xiao: {
    source: 'https://keqingmains.com/xiao/',
    role: 'Burst-window Anemo plunge DPS with high, self-inflicted HP drain.',
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
    substats: {
      priority: ['er_pct', 'crit_rate', 'crit_dmg', 'atk_pct'],
      floors: { er_pct: 120 },
    },
    constellations: [
      {
        level: 1,
        note: 'Grants an extra Elemental Skill charge — a minor rotation convenience.',
      },
      {
        level: 2,
        note: 'Increases Energy Recharge while off-field — low value since Xiao is meant to stay on-field.',
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      { level: 4, note: 'Grants a DEF bonus below 50% HP — rarely relevant.' },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Changes his kit to favor Skill spam, strong in multi-target scenarios.',
      },
    ],
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
    substats: {
      priority: ['crit_rate', 'crit_dmg', 'atk_pct', 'er_pct'],
      floors: { er_pct: 100 },
    },
    constellations: [
      {
        level: 1,
        note: 'Increases Normal/Charged Attack speed in Windfavored state and adds damage to his wind arrows.',
      },
      {
        level: 2,
        note: 'Increases Burst damage based on remaining Kuugoryoku Points when cast.',
      },
      { level: 3, note: '+3 Elemental Burst level.' },
      {
        level: 4,
        note: 'Grants a random elemental buff when his Skill contacts an element, up to three at once.',
      },
      { level: 5, note: '+3 Elemental Skill level.' },
      {
        level: 6,
        note: 'Normal Attacks fire additional Anemo arcs and restore Kuugoryoku Points when low.',
      },
    ],
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
    substats: {
      priority: ['er_pct', 'em', 'atk_pct', 'crit_rate'],
      floors: { er_pct: 190 },
    },
    constellations: [
      {
        level: 1,
        note: 'Reduces his Elemental Skill cooldown and resets it on casting his Burst.',
      },
      {
        level: 2,
        note: 'Grants Kazuha and the on-field character bonus Elemental Mastery while his Burst field is active.',
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Regenerates Energy when his Skill cooldown is low, and while gliding.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Grants Anemo infusion after using his Skill or Burst and scales his attacks with Elemental Mastery.',
      },
    ],
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
    substats: {
      priority: ['er_pct', 'crit_rate', 'crit_dmg', 'atk_pct'],
      floors: { er_pct: 275 },
    },
    constellations: [
      {
        level: 1,
        note: 'Allows firing up to two Hurricane Arrows per Elemental Skill cast, as a backup if one misses.',
      },
      {
        level: 2,
        note: "Extends her Burst's duration, improving buff and debuff uptime.",
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: "Her Skill's vortices restore additional Energy based on enemies hit.",
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Adds an Anemo CRIT DMG buff and enables off-field vortex triggers during her Burst.',
      },
    ],
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
  chasca: {
    source: 'https://keqingmains.com/q/chasca-quickguide/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'ObsidianCodex',
      },
      mains: {
        sands: 'atk_pct',
        goblet: 'elemental_dmg',
      },
      erTarget: 110,
      objective: 'crit_value',
    },
    substats: {
      priority: ['crit_rate', 'crit_dmg', 'atk_pct', 'em'],
      floors: { er_pct: 110 },
    },
    constellations: [
      {
        level: 1,
        note: 'Converts her second Shell into a Shining Shell, adding elemental flexibility in mixed-element teams.',
      },
      {
        level: 2,
        note: 'Grants a free stack of Spirit of the Radiant Shadow and adds AoE damage during her Skill.',
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Restores Energy per Burst and adds AoE damage.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Reduces charge time and grants bonus CRIT DMG after triggering Spiritbinding Conversion.',
      },
    ],
    weapons: [
      {
        weaponKey: "astral_vulture's_crimson_plumage",
        rank: 1,
        note: 'signature',
      },
      {
        weaponKey: 'aqua_simulacra',
        rank: 2,
      },
      {
        weaponKey: 'flowerwreathed_feathers',
        rank: 3,
        note: '4-star banner-exclusive',
      },
      {
        weaponKey: 'hamayumi',
        rank: 4,
        note: 'F2P craftable option',
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
        name: 'Chasca Overvape',
        slots: [
          {
            role: 'ATK buffer + Pyro application',
            options: ['bennett'],
          },
          {
            role: 'off-field Hydro DPS (Vaporize)',
            options: ['furina'],
          },
          {
            role: 'Nightsoul/ATK support',
            options: ['iansan'],
          },
        ],
      },
    ],
  },
  ifa: {
    source: 'https://keqingmains.com/q/ifa-quickguide/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'ViridescentVenerer',
      },
      mains: {
        sands: 'em',
        goblet: 'em',
      },
      erTarget: 140,
      objective: 'em',
    },
    substats: {
      priority: ['er_pct', 'em', 'crit_rate'],
      floors: { er_pct: 140 },
    },
    constellations: [
      {
        level: 1,
        note: 'Restores Energy on Tonicshot hit.',
      },
      {
        level: 2,
        note: 'Greatly increases Rescue Essentials gains above a Nightsoul point threshold.',
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Extends her Burst grouping and grants bonus Elemental Mastery after it ends.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Chance for an extra Tonicshot when holding Normal Attack.',
      },
    ],
    weapons: [
      {
        weaponKey: 'sunny_morning_sleepin',
        rank: 1,
        note: 'signature',
      },
      {
        weaponKey: "starcaller's_watch",
        rank: 2,
      },
      {
        weaponKey: 'cashflow_supervision',
        rank: 3,
      },
      {
        weaponKey: 'wandering_evenstar',
        rank: 4,
        note: 'F2P EM option',
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
        name: 'Ifa VV Support',
        slots: [
          {
            role: 'off-field Electro DPS (Electro-Charged)',
            options: ['ororon'],
          },
          {
            role: 'main Hydro DPS',
            options: ['furina'],
          },
          {
            role: 'Anemo swirl/driver',
            options: ['sayu'],
          },
        ],
      },
    ],
  },
  jahoda: {
    source: 'https://keqingmains.com/q/jahoda-quickguide/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'ViridescentVenerer',
      },
      mains: {
        sands: 'atk_pct',
        goblet: 'atk_pct',
      },
      erTarget: 145,
      objective: 'crit_value',
    },
    substats: {
      priority: ['er_pct', 'atk_pct', 'crit_rate', 'crit_dmg'],
      floors: { er_pct: 145 },
    },
    constellations: [
      {
        level: 1,
        note: 'Meowballs gain a bonus chance to bounce to additional targets.',
      },
      {
        level: 2,
        note: 'Can track two elements simultaneously for dual passive effects.',
      },
      { level: 3, note: '+3 Elemental Burst level.' },
      {
        level: 4,
        note: 'Gains Energy per robot conversion, easing her ER requirement.',
      },
      { level: 5, note: '+3 Elemental Skill level.' },
      {
        level: 6,
        note: 'Grants nearby Moonsign characters bonus CRIT Rate and CRIT DMG.',
      },
    ],
    weapons: [
      {
        weaponKey: 'elegy_for_the_end',
        rank: 1,
        note: 'premium — team EM/ATK buff',
      },
      {
        weaponKey: 'favonius_warbow',
        rank: 2,
        note: 'default energy option',
      },
      {
        weaponKey: "rainbow_serpent's_rain_bow",
        rank: 3,
        note: 'ER stat with ATK passive',
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
        name: 'Jahoda Moonsign Support',
        slots: [
          {
            role: 'Moonsign DPS',
            options: ['flins'],
          },
          {
            role: 'Moonsign support/buffer',
            options: ['nefer'],
          },
          {
            role: 'off-field application',
            options: ['ineffa'],
          },
        ],
      },
    ],
  },
  jean: {
    source: 'https://keqingmains.com/jean/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'ViridescentVenerer',
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
        note: 'Increases the damage of a held Gale Blade after a short delay.',
      },
      {
        level: 2,
        note: 'Grants a movement and ATK speed buff on picking up elemental orbs/particles.',
      },
      { level: 3, note: '+3 Elemental Burst level.' },
      {
        level: 4,
        note: 'Applies a large Anemo RES shred within her Burst field — especially strong alongside Xiao.',
      },
      { level: 5, note: '+3 Elemental Skill level.' },
      {
        level: 6,
        note: 'Grants damage reduction in and after her Burst field.',
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
        weaponKey: 'freedomsworn',
        rank: 3,
      },
      {
        weaponKey: 'amenoma_kageuchi',
        rank: 4,
        note: 'F2P energy option',
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
        name: 'Jean VV Support',
        slots: [
          {
            role: 'main DPS',
            options: ['xiao'],
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
  lan_yan: {
    source: 'https://keqingmains.com/q/lan-yan-quickguide/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'ViridescentVenerer',
      },
      mains: {
        sands: 'atk_pct',
        goblet: 'atk_pct',
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
        note: 'Fires an additional Feathermoon Ring during her Elemental Skill, doubling its hits.',
      },
      {
        level: 2,
        note: "Regenerates her shield over time from teammates' Normal Attack hits.",
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Grants the party a temporary Elemental Mastery bonus after her Burst.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Grants her Elemental Skill an additional charge.',
      },
    ],
    weapons: [
      {
        weaponKey: "starcaller's_watch",
        rank: 1,
        note: 'best overall',
      },
      {
        weaponKey: 'thrilling_tales_of_dragon_slayers',
        rank: 2,
        note: 'best general option',
      },
      {
        weaponKey: 'hakushin_ring',
        rank: 3,
        note: 'strong in Aggravate teams',
      },
      {
        weaponKey: 'sacrificial_fragments',
        rank: 4,
        note: 'F2P, enables shield uptime',
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
        name: 'Lan Yan Aggravate Support',
        slots: [
          {
            role: 'off-field Electro DPS (Aggravate)',
            options: ['clorinde'],
          },
          {
            role: 'off-field Electro DPS',
            options: ['fischl'],
          },
          {
            role: 'Dendro applicator/EM buffer',
            options: ['nahida'],
          },
        ],
      },
    ],
  },
  lynette: {
    source: 'https://keqingmains.com/q/lynette-quickguide/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'ViridescentVenerer',
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
        note: 'Adds a grouping effect to her held Elemental Skill.',
      },
      {
        level: 2,
        note: 'Doubles the Vivid Shots fired by her Elemental Burst.',
      },
      { level: 3, note: '+3 Elemental Burst level.' },
      {
        level: 4,
        note: 'Grants her Elemental Skill an additional charge.',
      },
      { level: 5, note: '+3 Elemental Skill level.' },
      {
        level: 6,
        note: 'Grants Anemo infusion on her Elemental Skill, enabling an on-field playstyle.',
      },
    ],
    weapons: [
      {
        weaponKey: 'favonius_sword',
        rank: 1,
        note: 'general best-in-slot',
      },
      {
        weaponKey: 'sacrificial_sword',
        rank: 2,
        note: 'duplicates Skill',
      },
      {
        weaponKey: 'freedomsworn',
        rank: 3,
        note: 'transformative reaction damage',
      },
      {
        weaponKey: 'fleuve_cendre_ferryman',
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
        name: 'Lynette VV Support',
        slots: [
          {
            role: 'main DPS',
            options: ['xiao'],
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
  prune: {
    source: 'https://keqingmains.com/q/prune-quickguide/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'ViridescentVenerer',
      },
      mains: {
        sands: 'atk_pct',
        goblet: 'atk_pct',
      },
      erTarget: 195,
      objective: 'crit_value',
    },
    substats: {
      priority: ['er_pct', 'atk_pct', 'crit_rate'],
      floors: { er_pct: 195 },
    },
    constellations: [
      {
        level: 1,
        note: 'Restores Energy after Banehunter Oathhammer hits, easing her ER requirement.',
      },
      {
        level: 2,
        note: 'Grants a stacking ATK buff during her Burst.',
      },
      { level: 3, note: '+3 Elemental Burst level.' },
      {
        level: 4,
        note: 'Banehunter Oathhammer ricochets to additional nearby enemies.',
      },
      { level: 5, note: '+3 Elemental Skill level.' },
      {
        level: 6,
        note: "Extends her Burst's duration and grants flat ATK to Prune and the active character on reaction triggers.",
      },
    ],
    weapons: [
      {
        weaponKey: 'oathsworn_eye',
        rank: 1,
        note: 'significantly reduces ER requirement',
      },
      {
        weaponKey: 'flowing_purity',
        rank: 2,
        note: 'F2P craftable ATK option',
      },
      {
        weaponKey: 'hakushin_ring',
        rank: 3,
        note: 'strong at high ER',
      },
      {
        weaponKey: 'skyward_atlas',
        rank: 4,
        note: '5-star ATK option',
      },
    ],
    talents: {
      priority: ['burst', 'skill', 'auto'],
      levels: {
        burst: 1,
        skill: 1,
        auto: 1,
      },
    },
    teams: [
      {
        name: 'Prune Double Anemo',
        slots: [
          {
            role: 'main Anemo DPS',
            options: ['varka'],
          },
          {
            role: 'off-field Anemo/PHEC support',
            options: ['durin'],
          },
          {
            role: 'support/healer',
            options: ['nicole'],
          },
        ],
      },
    ],
  },
  sayu: {
    source: 'https://keqingmains.com/q/sayu-quickguide/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'ViridescentVenerer',
      },
      mains: {
        sands: 'er_pct',
        goblet: 'atk_pct',
      },
      erTarget: 160,
      objective: 'crit_value',
    },
    substats: {
      priority: ['er_pct', 'atk_pct', 'em'],
      floors: { er_pct: 160 },
    },
    constellations: [
      {
        level: 1,
        note: 'Her Daruma both attacks and heals simultaneously — arguably her best constellation.',
      },
      {
        level: 2,
        note: 'Modestly increases Whirlwind Kick damage the longer it channels.',
      },
      { level: 3, note: '+3 Elemental Burst level.' },
      {
        level: 4,
        note: 'Recovers Energy on Swirl triggers, easing her ER requirement.',
      },
      { level: 5, note: '+3 Elemental Skill level.' },
      {
        level: 6,
        note: 'Her Daruma benefits from Elemental Mastery — her second-best constellation.',
      },
    ],
    weapons: [
      {
        weaponKey: 'favonius_greatsword',
        rank: 1,
      },
      {
        weaponKey: 'skyward_pride',
        rank: 2,
      },
      {
        weaponKey: 'katsuragikiri_nagamasa',
        rank: 3,
      },
      {
        weaponKey: 'serpent_spine',
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
        name: 'Sayu Mono Pyro Support',
        slots: [
          {
            role: 'main Pyro DPS',
            options: ['xiangling'],
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
  shikanoin_heizou: {
    source: 'https://keqingmains.com/heizou/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'ViridescentVenerer',
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
        note: 'Increases his Normal Attack speed and grants a stack of Declension Curse.',
      },
      {
        level: 2,
        note: 'Improves his Elemental Burst grouping and extends its duration.',
      },
      { level: 3, note: '+3 Heartstopper Strike (Elemental Skill) level.' },
      {
        level: 4,
        note: 'His Burst restores a large amount of Energy, easing his ER requirement.',
      },
      { level: 5, note: '+3 Windmuster Kick (Elemental Burst) level.' },
      {
        level: 6,
        note: 'Each Declension Curse stack grants bonus CRIT Rate, and his Conviction state grants bonus CRIT DMG.',
      },
    ],
    weapons: [
      {
        weaponKey: 'skyward_atlas',
        rank: 1,
      },
      {
        weaponKey: 'memory_of_dust',
        rank: 2,
      },
      {
        weaponKey: "kagura's_verity",
        rank: 3,
      },
      {
        weaponKey: 'the_widsith',
        rank: 4,
        note: 'F2P, strong support option',
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
        name: 'Heizou Reverse Vaporize',
        slots: [
          {
            role: 'main Pyro DPS',
            options: ['diluc'],
          },
          {
            role: 'ATK buffer + healer',
            options: ['bennett'],
          },
          {
            role: 'off-field Hydro application',
            options: ['xingqiu'],
          },
        ],
      },
    ],
  },
  sucrose: {
    source: 'https://keqingmains.com/sucrose/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'ViridescentVenerer',
      },
      mains: {
        sands: 'em',
        goblet: 'em',
      },
      erTarget: 130,
      objective: 'em',
    },
    substats: {
      priority: ['er_pct', 'em'],
      floors: { er_pct: 130 },
    },
    constellations: [
      {
        level: 1,
        note: 'Grants her Elemental Skill an additional charge — her best constellation.',
      },
      {
        level: 2,
        note: "Extends her Elemental Burst's duration.",
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Normal/Charged Attacks periodically reduce her Skill cooldown, enabling an on-field playstyle.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: "Her Burst's elemental absorption grants a matching elemental DMG bonus.",
      },
    ],
    weapons: [
      {
        weaponKey: 'sacrificial_fragments',
        rank: 1,
        note: 'highest 4-star EM, extra Skill charge',
      },
      {
        weaponKey: 'a_thousand_floating_dreams',
        rank: 2,
        note: 'highest EM 5-star',
      },
      {
        weaponKey: 'wandering_evenstar',
        rank: 3,
        note: 'strong for ATK%-scaling teams',
      },
      {
        weaponKey: 'thrilling_tales_of_dragon_slayers',
        rank: 4,
        note: 'F2P ATK buff support',
      },
    ],
    talents: {
      priority: ['skill', 'auto', 'burst'],
      levels: {
        skill: 1,
        auto: 1,
        burst: 1,
      },
    },
    teams: [
      {
        name: 'Sucrose Taser',
        slots: [
          {
            role: 'off-field Hydro application',
            options: ['xingqiu'],
          },
          {
            role: 'off-field Electro DPS',
            options: ['fischl'],
          },
          {
            role: 'off-field Electro DPS',
            options: ['beidou'],
          },
        ],
      },
    ],
  },
  varka: {
    source: 'https://keqingmains.com/q/varka-quickguide/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'ADayCarvedFromRisingWinds',
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
        note: 'Immediately uses his special Skill mode on activation, with the first cast dealing bonus damage.',
      },
      {
        level: 2,
        note: 'Adds an extra Anemo hit after his special attacks.',
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Swirl triggers grant the party a temporary Anemo/elemental DMG bonus.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Allows chaining his special Skill/Charged Attacks without consuming charges, and stacks grant bonus CRIT DMG.',
      },
    ],
    weapons: [
      {
        weaponKey: 'gest_of_the_mighty_wolf',
        rank: 1,
        note: 'signature',
      },
      {
        weaponKey: 'a_thousand_blazing_suns',
        rank: 2,
      },
      {
        weaponKey: 'redhorn_stonethresher',
        rank: 3,
      },
      {
        weaponKey: 'serpent_spine',
        rank: 4,
        note: 'best F2P/4-star',
      },
    ],
    talents: {
      priority: ['skill', 'auto', 'burst'],
      levels: {
        skill: 9,
        auto: 9,
        burst: 1,
      },
    },
    teams: [
      {
        name: 'Varka Double Anemo',
        slots: [
          {
            role: 'Anemo grouper/buffer',
            options: ['venti'],
          },
          {
            role: 'ATK buffer + healer',
            options: ['bennett'],
          },
          {
            role: 'PHEC/Anemo support',
            options: ['durin'],
          },
        ],
      },
    ],
  },
  venti: {
    source: 'https://keqingmains.com/venti/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'ViridescentVenerer',
      },
      mains: {
        sands: 'atk_pct',
        goblet: 'elemental_dmg',
      },
      erTarget: 165,
      objective: 'crit_value',
    },
    substats: {
      priority: ['er_pct', 'crit_rate', 'crit_dmg', 'atk_pct'],
      floors: { er_pct: 165 },
    },
    constellations: [
      {
        level: 1,
        note: 'Fires two additional arrows on his Aimed Shot — a minor personal-damage increase.',
      },
      {
        level: 2,
        note: 'Adds an Anemo and Physical RES shred to his Elemental Skill.',
      },
      { level: 3, note: '+3 Elemental Burst level.' },
      {
        level: 4,
        note: 'Grants a temporary Anemo DMG Bonus on picking up an Elemental Particle.',
      },
      { level: 5, note: '+3 Elemental Skill level.' },
      {
        level: 6,
        note: 'Adds an elemental RES shred to enemies hit by his Burst and the absorbed element.',
      },
    ],
    weapons: [
      {
        weaponKey: 'polar_star',
        rank: 1,
      },
      {
        weaponKey: 'the_stringless',
        rank: 2,
      },
      {
        weaponKey: 'aqua_simulacra',
        rank: 3,
      },
      {
        weaponKey: 'skyward_harp',
        rank: 4,
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
        name: 'Venti Wanderer Hypercarry',
        slots: [
          {
            role: 'main Anemo on-field DPS',
            options: ['wanderer'],
          },
          {
            role: 'Anemo DPS support',
            options: ['faruzan'],
          },
          {
            role: 'ATK buffer + healer',
            options: ['bennett'],
          },
        ],
      },
    ],
  },
  xianyun: {
    source: 'https://keqingmains.com/q/xianyun-quickguide/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'ViridescentVenerer',
      },
      mains: {
        sands: 'atk_pct',
        goblet: 'atk_pct',
      },
      erTarget: 150,
      objective: 'crit_value',
    },
    substats: {
      priority: ['er_pct', 'atk_pct', 'em'],
      floors: { er_pct: 150 },
    },
    constellations: [
      {
        level: 1,
        note: 'Grants her Elemental Skill an additional charge, easing her ER requirement.',
      },
      {
        level: 2,
        note: 'Doubles the effectiveness of her ascension passive buff.',
      },
      { level: 3, note: '+3 Elemental Burst level.' },
      {
        level: 4,
        note: 'Adds healing to her Skill-enhanced Plunging Attacks.',
      },
      { level: 5, note: '+3 Elemental Skill level.' },
      {
        level: 6,
        note: 'Enables an on-field Plunging Attack playstyle with no Skill cooldown after her Burst.',
      },
    ],
    weapons: [
      {
        weaponKey: "crane's_echoing_call",
        rank: 1,
        note: 'best-in-slot',
      },
      {
        weaponKey: 'favonius_codex',
        rank: 2,
      },
      {
        weaponKey: 'oathsworn_eye',
        rank: 3,
      },
      {
        weaponKey: 'thrilling_tales_of_dragon_slayers',
        rank: 4,
        note: 'strong with Xiao/C6 Faruzan',
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
        name: 'Xianyun Xiao Support',
        slots: [
          {
            role: 'main Anemo on-field DPS',
            options: ['xiao'],
          },
          {
            role: 'Anemo DPS support',
            options: ['faruzan'],
          },
          {
            role: 'off-field Hydro DPS',
            options: ['furina'],
          },
        ],
      },
    ],
  },
  yumemizuki_mizuki: {
    source: 'https://keqingmains.com/q/mizuki-quickguide/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'ViridescentVenerer',
      },
      mains: {
        sands: 'em',
        goblet: 'em',
      },
      erTarget: 160,
      objective: 'em',
    },
    substats: {
      priority: ['er_pct', 'crit_rate', 'em'],
      floors: { er_pct: 160 },
    },
    constellations: [
      {
        level: 1,
        note: 'Grants an empowered Swirl with bonus EM scaling per trigger.',
      },
      {
        level: 2,
        note: 'Grants nearby teammates a DMG Bonus that scales with her Elemental Mastery.',
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Removes the healing cap on her Skill and grants Energy per Snack pickup.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Grants her Swirls bonus CRIT Rate and CRIT DMG.',
      },
    ],
    weapons: [
      {
        weaponKey: 'hakushin_ring',
        rank: 1,
        note: 'best for Electro teams',
      },
      {
        weaponKey: 'favonius_codex',
        rank: 2,
        note: 'team battery support',
      },
      {
        weaponKey: 'a_thousand_floating_dreams',
        rank: 3,
        note: 'personal damage + EM buff',
      },
      {
        weaponKey: 'wandering_evenstar',
        rank: 4,
        note: 'F2P EM option',
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
        name: 'Mizuki Aggravate',
        slots: [
          {
            role: 'off-field Electro DPS',
            options: ['fischl'],
          },
          {
            role: 'off-field Electro DPS',
            options: ['yae_miko'],
          },
          {
            role: 'Dendro applicator/EM buffer',
            options: ['nahida'],
          },
        ],
      },
    ],
  },
};
