import type { CharacterGuide } from './types';

export const dendro: Record<string, CharacterGuide> = {
  nahida: {
    source: 'https://keqingmains.com/nahida/',
    role: 'Off-field Dendro applicator and Elemental Mastery buffer, enabling reaction-based teams.',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'GildedDreams',
      },
      mains: {
        sands: 'em',
        goblet: 'em',
      },
      objective: 'crit_value',
      statTargets: {
        em: 900,
      },
    },
    substats: {
      priority: ['er_pct', 'em', 'crit_rate', 'crit_dmg'],
      floors: { em: 900 },
    },
    constellations: [
      {
        level: 1,
        note: 'Counts Pyro/Electro/Hydro teammates as extra elements for her Burst buff, boosting Skill damage in varied teams.',
      },
      {
        level: 2,
        note: 'Grants Dendro reaction damage the ability to CRIT, plus a DEF shred after Quicken — a major damage increase.',
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Grants bonus Elemental Mastery based on marked enemies.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Enables extra reaction procs during her Burst from Normal/Charged Attacks — strong for an on-field Nahida.',
      },
    ],
    weapons: [
      {
        weaponKey: 'a_thousand_floating_dreams',
        rank: 1,
        note: 'signature',
      },
      {
        weaponKey: "kagura's_verity",
        rank: 2,
      },
      {
        weaponKey: 'sacrificial_fragments',
        rank: 3,
        note: 'F2P option',
      },
      {
        weaponKey: 'wandering_evenstar',
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
        name: 'Nahida Quicken',
        slots: [
          {
            role: 'on-field Dendro DPS',
            options: ['alhaitham'],
          },
          {
            role: 'Electro applicator (Aggravate)',
            options: ['fischl'],
          },
          {
            role: 'off-field Electro + healer',
            options: ['kuki_shinobu'],
          },
        ],
      },
    ],
  },
  alhaitham: {
    source: 'https://keqingmains.com/q/alhaitham-quickguide',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'GildedDreams',
      },
      mains: {
        sands: 'em',
        goblet: 'elemental_dmg',
      },
      erTarget: 105,
      objective: 'crit_value',
      statTargets: {
        em: 200,
      },
    },
    substats: {
      priority: ['er_pct', 'em', 'crit_rate', 'crit_dmg'],
      floors: { er_pct: 105, em: 200 },
    },
    constellations: [
      {
        level: 1,
        note: "Projection Attack hits reduce his Elemental Skill's cooldown — mainly useful in overworld/co-op.",
      },
      {
        level: 2,
        note: 'Each Mirror stack grants bonus Elemental Mastery, up to a cap.',
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Consuming or generating Mirrors via his Burst grants EM to teammates and Dendro DMG to Alhaitham.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Guarantees Mirrors after his Burst and grants CRIT buffs when the Mirror cap is exceeded — his best constellation.',
      },
    ],
    weapons: [
      {
        weaponKey: 'light_of_foliar_incision',
        rank: 1,
        note: 'signature — BiS single-target',
      },
      {
        weaponKey: 'primordial_jade_cutter',
        rank: 2,
        note: 'excels multi-target',
      },
      {
        weaponKey: 'mistsplitter_reforged',
        rank: 3,
      },
      {
        weaponKey: 'iron_sting',
        rank: 4,
        note: 'F2P EM option',
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
        name: 'Alhaitham Quickbloom',
        slots: [
          {
            role: 'Dendro battery/EM buffer',
            options: ['nahida'],
          },
          {
            role: 'Hydro applicator (Bloom)',
            options: ['furina'],
          },
          {
            role: 'shielder/RES shredder',
            options: ['zhongli'],
          },
        ],
      },
    ],
  },
  baizhu: {
    source: 'https://keqingmains.com/baizhu/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'OceanHuedClam',
      },
      mains: {
        sands: 'hp_pct',
        goblet: 'hp_pct',
      },
      erTarget: 150,
      objective: 'hp_pct',
    },
    substats: {
      priority: ['er_pct', 'hp_pct'],
      floors: { er_pct: 150 },
    },
    constellations: [
      {
        level: 1,
        note: 'Grants an additional Elemental Skill charge, improving healing and Dendro application.',
      },
      {
        level: 2,
        note: 'Triggers periodic Dendro damage when teammates attack, improving off-field application.',
      },
      { level: 3, note: '+3 Elemental Burst level.' },
      {
        level: 4,
        note: 'Grants the party bonus Elemental Mastery after his Burst.',
      },
      { level: 5, note: '+3 Elemental Skill level.' },
      {
        level: 6,
        note: 'Adds HP-scaling damage to his Burst and spawns shields from Skill hits.',
      },
    ],
    weapons: [
      {
        weaponKey: "jadefall's_splendor",
        rank: 1,
        note: 'signature',
      },
      {
        weaponKey: 'prototype_amber',
        rank: 2,
        note: 'F2P, matches signature performance',
      },
      {
        weaponKey: 'favonius_codex',
        rank: 3,
        note: 'reduces team ER needs',
      },
      {
        weaponKey: 'thrilling_tales_of_dragon_slayers',
        rank: 4,
        note: 'strong ATK buff, ER-hungry',
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
        name: 'Baizhu Quicken Support',
        slots: [
          {
            role: 'main Electro DPS',
            options: ['raiden_shogun'],
          },
          {
            role: 'off-field Electro DPS',
            options: ['yae_miko'],
          },
          {
            role: 'Anemo grouper/buffer',
            options: ['kaedehara_kazuha'],
          },
        ],
      },
    ],
  },
  collei: {
    source: 'https://keqingmains.com/collei/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'DeepwoodMemories',
      },
      mains: {
        sands: 'er_pct',
        goblet: 'elemental_dmg',
      },
      erTarget: 200,
      objective: 'crit_value',
    },
    substats: {
      priority: ['er_pct', 'crit_rate', 'crit_dmg', 'em'],
      floors: { er_pct: 200 },
    },
    constellations: [
      {
        level: 1,
        note: 'Increases her Energy Recharge while off-field, easing her ER requirement.',
      },
      {
        level: 2,
        note: "Auto-grants the Sprout effect on her boomerang's return and extends its duration per reaction.",
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Grants nearby party members bonus Elemental Mastery.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Her boomerang creates a miniature Cuilein-Anbar dealing bonus Dendro damage.',
      },
    ],
    weapons: [
      {
        weaponKey: 'elegy_for_the_end',
        rank: 1,
        note: 'best-in-slot',
      },
      {
        weaponKey: 'sacrificial_bow',
        rank: 2,
        note: 'reduces ER needs',
      },
      {
        weaponKey: 'the_stringless',
        rank: 3,
        note: 'excellent 4-star',
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
        skill: 9,
        auto: 1,
      },
    },
    teams: [
      {
        name: 'Collei Hyperbloom',
        slots: [
          {
            role: 'off-field Electro DPS',
            options: ['kuki_shinobu'],
          },
          {
            role: 'off-field Hydro DPS',
            options: ['yelan'],
          },
          {
            role: 'Anemo grouper/buffer',
            options: ['kaedehara_kazuha'],
          },
        ],
      },
    ],
  },
  emilie: {
    source: 'https://keqingmains.com/q/emilie-quickguide/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'UnfinishedReverie',
      },
      mains: {
        sands: 'atk_pct',
        goblet: 'elemental_dmg',
      },
      erTarget: 180,
      objective: 'crit_value',
    },
    substats: {
      priority: ['er_pct', 'crit_rate', 'crit_dmg', 'atk_pct'],
      floors: { er_pct: 180 },
    },
    constellations: [
      {
        level: 1,
        note: 'Increases her Elemental Skill and ascension passive damage; teammates generate additional Scents on triggering Burning.',
      },
      {
        level: 2,
        note: 'Reduces enemy Dendro RES on hit.',
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: "Extends her Burst's duration and shortens its targeting interval.",
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Converts her Normal/Charged Attacks to Dendro with bonus scaling after using her Skill or Burst.',
      },
    ],
    weapons: [
      {
        weaponKey: 'lumidouce_elegy',
        rank: 1,
        note: 'best option',
      },
      {
        weaponKey: 'calamity_queller',
        rank: 2,
      },
      {
        weaponKey: 'staff_of_the_scarlet_sands',
        rank: 3,
      },
      {
        weaponKey: 'deathmatch',
        rank: 4,
        note: 'best 4-star',
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
        name: 'Emilie Burning',
        slots: [
          {
            role: 'off-field Pyro DPS',
            options: ['kinich'],
          },
          {
            role: 'ATK buffer + healer',
            options: ['bennett'],
          },
          {
            role: 'off-field Pyro DPS',
            options: ['mavuika'],
          },
        ],
      },
    ],
  },
  kaveh: {
    source: 'https://keqingmains.com/kaveh/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'DeepwoodMemories',
      },
      mains: {
        sands: 'er_pct',
        goblet: 'em',
      },
      erTarget: 200,
      objective: 'em',
      statTargets: {
        em: 700,
      },
    },
    substats: {
      priority: ['er_pct', 'em', 'crit_rate'],
      floors: { er_pct: 200, em: 700 },
    },
    constellations: [
      {
        level: 1,
        note: 'Grants a Dendro RES and Healing Bonus buff after using his Elemental Skill.',
      },
      {
        level: 2,
        note: 'Increases his Attack SPD during his Elemental Burst.',
      },
      { level: 3, note: '+3 Elemental Burst level.' },
      {
        level: 4,
        note: 'Owned Bloom Cores deal bonus damage.',
      },
      { level: 5, note: '+3 Elemental Skill level.' },
      {
        level: 6,
        note: 'Auto-triggers Core rupture periodically during his Burst, improving Dendro application and Bloom generation.',
      },
    ],
    weapons: [
      {
        weaponKey: 'favonius_greatsword',
        rank: 1,
        note: 'best energy economy',
      },
      {
        weaponKey: 'sacrificial_greatsword',
        rank: 2,
        note: 'extra Skill casts',
      },
      {
        weaponKey: 'skyward_pride',
        rank: 3,
      },
      {
        weaponKey: 'mailed_flower',
        rank: 4,
        note: 'F2P EM option',
      },
    ],
    talents: {
      priority: ['burst', 'auto', 'skill'],
      levels: {
        burst: 6,
        auto: 1,
        skill: 1,
      },
    },
    teams: [
      {
        name: 'Kaveh Nilou Bloom',
        slots: [
          {
            role: 'main Hydro DPS',
            options: ['nilou'],
          },
          {
            role: 'off-field Hydro application',
            options: ['xingqiu'],
          },
          {
            role: 'Dendro applicator/EM buffer',
            options: ['nahida'],
          },
        ],
      },
    ],
  },
  kinich: {
    source: 'https://keqingmains.com/q/kinich-quickguide/',
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
      priority: ['crit_rate', 'crit_dmg', 'atk_pct', 'er_pct'],
      floors: { er_pct: 110 },
    },
    constellations: [
      {
        level: 1,
        note: 'Grants a large CRIT DMG buff to his Scalespiker Cannon and increased mobility.',
      },
      {
        level: 2,
        note: 'Applies a Dendro RES shred, and his first cannon shot gains bonus damage and AoE.',
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Restores Energy and increases his Elemental Burst damage.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'His cannon shots bounce to a second target.',
      },
    ],
    weapons: [
      {
        weaponKey: 'fang_of_the_mountain_king',
        rank: 1,
        note: 'best option',
      },
      {
        weaponKey: 'a_thousand_blazing_suns',
        rank: 2,
      },
      {
        weaponKey: 'beacon_of_the_reed_sea',
        rank: 3,
      },
      {
        weaponKey: 'earth_shaker',
        rank: 4,
        note: 'F2P option',
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
        name: 'Kinich Burning',
        slots: [
          {
            role: 'main Pyro DPS',
            options: ['mavuika'],
          },
          {
            role: 'off-field Dendro DPS',
            options: ['emilie'],
          },
          {
            role: 'ATK buffer + healer',
            options: ['bennett'],
          },
        ],
      },
    ],
  },
  kirara: {
    source: 'https://keqingmains.com/kirara/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'NoblesseOblige',
      },
      mains: {
        sands: 'hp_pct',
        goblet: 'hp_pct',
      },
      erTarget: 160,
      objective: 'hp_pct',
    },
    substats: {
      priority: ['er_pct', 'hp_pct', 'crit_rate'],
      floors: { er_pct: 160 },
    },
    constellations: [
      {
        level: 1,
        note: 'Adds Burst projectiles scaling with her HP — a minor improvement.',
      },
      {
        level: 2,
        note: 'Grants co-op-only shields — no Spiral Abyss value.',
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Applies off-field Dendro application via coordinated attacks.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Grants the party a flat all-element DMG bonus.',
      },
    ],
    weapons: [
      {
        weaponKey: 'key_of_khajnisut',
        rank: 1,
        note: 'best-in-slot shield strength',
      },
      {
        weaponKey: "the_dockhand's_assistant",
        rank: 2,
      },
      {
        weaponKey: 'favonius_sword',
        rank: 3,
      },
      {
        weaponKey: 'sacrificial_sword',
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
        name: 'Kirara Quicken Shielder',
        slots: [
          {
            role: 'main Electro DPS',
            options: ['keqing'],
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
  lauma: {
    source: 'https://keqingmains.com/q/lauma-quickguide/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'SilkenMoonsSerenade',
      },
      mains: {
        sands: 'em',
        goblet: 'em',
      },
      erTarget: 170,
      objective: 'em',
    },
    substats: {
      priority: ['er_pct', 'em', 'crit_rate'],
      floors: { er_pct: 170 },
    },
    constellations: [
      {
        level: 1,
        note: 'Grants healing after triggering Lunar-Bloom — a comfort pickup.',
      },
      {
        level: 2,
        note: "Enhances her Burst's buffs to Bloom/Lunar-Bloom reactions.",
      },
      { level: 3, note: '+3 Elemental Burst level.' },
      {
        level: 4,
        note: 'Restores Energy periodically from Elemental Skill hits.',
      },
      { level: 5, note: '+3 Elemental Skill level.' },
      {
        level: 6,
        note: 'Her Frostgrove Sanctuary deals Lunar-Bloom damage, enabling an on-field playstyle.',
      },
    ],
    weapons: [
      {
        weaponKey: "nightweaver's_looking_glass",
        rank: 1,
        note: 'signature',
      },
      {
        weaponKey: 'etherlight_spindlelute',
        rank: 2,
      },
      {
        weaponKey: 'a_thousand_floating_dreams',
        rank: 3,
      },
      {
        weaponKey: 'blackmarrow_lantern',
        rank: 4,
        note: 'F2P option',
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
        name: 'Lauma Lunar-Bloom',
        slots: [
          {
            role: 'off-field Dendro/Lunar support',
            options: ['nefer'],
          },
          {
            role: 'off-field Hydro support',
            options: ['columbina'],
          },
          {
            role: 'Dendro applicator/EM buffer',
            options: ['nahida'],
          },
        ],
      },
    ],
  },
  nefer: {
    source: 'https://keqingmains.com/q/nefer-quickguide/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'NightOfTheSkysUnveiling',
      },
      mains: {
        sands: 'em',
        goblet: 'em',
      },
      erTarget: 100,
      objective: 'em',
    },
    substats: {
      priority: ['er_pct', 'crit_rate', 'em'],
      floors: { er_pct: 100 },
    },
    constellations: [
      {
        level: 1,
        note: 'Boosts her Lunar-Bloom base damage, scaling with a portion of her Elemental Mastery.',
      },
      {
        level: 2,
        note: "Extends her Veil of Falsehood's duration and increases its stack limit.",
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Speeds up Verdant Dew generation and applies a Dendro RES shred while in Shadow Dance.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Converts a second Phantasm hit to Lunar-Bloom and increases all Lunar-Bloom damage.',
      },
    ],
    weapons: [
      {
        weaponKey: 'reliquary_of_truth',
        rank: 1,
        note: 'signature',
      },
      {
        weaponKey: "nightweaver's_looking_glass",
        rank: 2,
      },
      {
        weaponKey: "surf's_up",
        rank: 3,
      },
      {
        weaponKey: 'blackmarrow_lantern',
        rank: 4,
        note: 'F2P option',
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
        name: 'Nefer Lunar Support',
        slots: [
          {
            role: 'off-field Hydro support',
            options: ['aino'],
          },
          {
            role: 'off-field Dendro support',
            options: ['lauma'],
          },
          {
            role: 'healer/support',
            options: ['kuki_shinobu'],
          },
        ],
      },
    ],
  },
  tighnari: {
    source: 'https://keqingmains.com/tighnari/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'DeepwoodMemories',
      },
      mains: {
        sands: 'atk_pct',
        goblet: 'elemental_dmg',
      },
      erTarget: 140,
      objective: 'crit_value',
    },
    substats: {
      priority: ['crit_rate', 'crit_dmg', 'atk_pct', 'em'],
      floors: { er_pct: 140 },
    },
    constellations: [
      {
        level: 1,
        note: 'Grants bonus CRIT Rate on his Charged Attacks.',
      },
      {
        level: 2,
        note: 'Grants a temporary Dendro DMG Bonus on-field and briefly after leaving the field.',
      },
      { level: 3, note: '+3 Elemental Burst level.' },
      {
        level: 4,
        note: 'Grants the party bonus Elemental Mastery on Burst, more if a Catalyze reaction triggers.',
      },
      { level: 5, note: '+3 Elemental Skill level.' },
      {
        level: 6,
        note: 'Speeds up his Charged Attack and fires an extra Clusterbloom Arrow per shot.',
      },
    ],
    weapons: [
      {
        weaponKey: "hunter's_path",
        rank: 1,
      },
      {
        weaponKey: 'aqua_simulacra',
        rank: 2,
      },
      {
        weaponKey: 'polar_star',
        rank: 3,
      },
      {
        weaponKey: 'slingshot',
        rank: 4,
        note: 'F2P baseline',
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
        name: 'Tighnari Aggravate',
        slots: [
          {
            role: 'off-field Electro DPS',
            options: ['fischl'],
          },
          {
            role: 'off-field Electro DPS',
            options: ['kuki_shinobu'],
          },
          {
            role: 'Anemo grouper/buffer',
            options: ['kaedehara_kazuha'],
          },
        ],
      },
    ],
  },
  yaoyao: {
    source: 'https://keqingmains.com/yaoyao/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'DeepwoodMemories',
      },
      mains: {
        sands: 'hp_pct',
        goblet: 'hp_pct',
      },
      erTarget: 260,
      objective: 'hp_pct',
    },
    substats: {
      priority: ['er_pct', 'crit_rate', 'hp_pct'],
      floors: { er_pct: 260 },
    },
    constellations: [
      {
        level: 1,
        note: 'Grants nearby allies a temporary Dendro DMG Bonus from Radish explosions and restores Stamina.',
      },
      {
        level: 2,
        note: 'Restores Energy on Radish hits during her Burst, significantly easing her ER requirement.',
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Grants a temporary Elemental Mastery buff scaling with her max HP.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Periodically generates larger Mega Radishes with enhanced healing and AoE damage.',
      },
    ],
    weapons: [
      {
        weaponKey: 'dialogues_of_the_desert_sages',
        rank: 1,
      },
      {
        weaponKey: 'favonius_lance',
        rank: 2,
      },
      {
        weaponKey: 'rightful_reward',
        rank: 3,
      },
      {
        weaponKey: 'kitain_cross_spear',
        rank: 4,
        note: 'F2P option',
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
        name: 'Yaoyao Hyperbloom',
        slots: [
          {
            role: 'off-field Electro DPS',
            options: ['kuki_shinobu'],
          },
          {
            role: 'off-field Hydro DPS',
            options: ['yelan'],
          },
          {
            role: 'main DPS',
            options: ['raiden_shogun'],
          },
        ],
      },
    ],
  },
};
