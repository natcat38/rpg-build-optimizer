import type { CharacterGuide } from './types';

export const electro: Record<string, CharacterGuide> = {
  raiden_shogun: {
    source: 'https://keqingmains.com/raiden/',
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
      critRatioTarget: 0.333,
      objective: 'crit_value',
    },
    substats: {
      priority: ['crit_rate', 'crit_dmg', 'atk_pct', 'er_pct'],
    },
    constellations: [
      {
        level: 1,
        note: 'Speeds up Resolve stacking, especially from Electro Elemental Bursts on the team.',
      },
      {
        level: 2,
        note: "Best stopping point: during her Burst, her attacks ignore a portion of enemies' DEF.",
      },
      { level: 3, note: '+3 Elemental Burst level.' },
      {
        level: 4,
        note: 'On Burst end, grants nearby party members a temporary ATK bonus.',
      },
      { level: 5, note: '+3 Elemental Skill level.' },
      {
        level: 6,
        note: "During her Burst, her attacks reduce nearby allies' Elemental Burst cooldowns.",
      },
    ],
    weapons: [
      {
        weaponKey: 'engulfing_lightning',
        rank: 1,
        note: 'signature',
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
        note: 'craftable ER, F2P option',
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
        name: 'Raiden Hypercarry',
        slots: [
          {
            role: 'ATK buffer + healer',
            options: ['bennett'],
          },
          {
            role: 'Electro buffer',
            options: ['kujou_sara'],
          },
          {
            role: 'Anemo buffer/grouper',
            options: ['kaedehara_kazuha'],
          },
        ],
      },
    ],
  },
  keqing: {
    source: 'https://keqingmains.com/keqing/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'ThunderingFury',
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
        note: 'Adds AoE Electro damage at both the start and end of her Elemental Skill blink.',
      },
      {
        level: 2,
        note: 'Chance to generate Elemental Particles when hitting Electro-affected enemies.',
      },
      { level: 3, note: '+3 Elemental Burst level.' },
      {
        level: 4,
        note: 'Grants a temporary ATK bonus after triggering an Electro reaction.',
      },
      { level: 5, note: '+3 Elemental Skill level.' },
      {
        level: 6,
        note: 'Grants a brief Electro DMG Bonus on attacking, stacking independently.',
      },
    ],
    weapons: [
      {
        weaponKey: 'mistsplitter_reforged',
        rank: 1,
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
        weaponKey: "lion's_roar",
        rank: 4,
        note: 'F2P (Electro-adjacent) option',
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
        name: 'Keqing Aggravate',
        slots: [
          {
            role: 'off-field Electro applicator (Aggravate)',
            options: ['fischl'],
          },
          {
            role: 'Dendro applicator / EM buffer',
            options: ['nahida'],
          },
          {
            role: 'Anemo grouper/buffer',
            options: ['kaedehara_kazuha'],
          },
        ],
      },
    ],
  },
  cyno: {
    source: 'https://keqingmains.com/q/cyno-quickguide',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'ThunderingFury',
      },
      mains: {
        sands: 'em',
        goblet: 'elemental_dmg',
      },
      erTarget: 140,
      objective: 'crit_value',
    },
    substats: {
      priority: ['er_pct', 'crit_rate', 'crit_dmg', 'em'],
      floors: { er_pct: 140 },
    },
    constellations: [
      {
        level: 1,
        note: 'Grants a bonus Normal Attack SPD boost after casting his Burst, refreshed by Judication hits.',
      },
      {
        level: 2,
        note: 'Normal Attacks grant a stacking Electro DMG Bonus.',
      },
      { level: 3, note: '+3 Elemental Burst level.' },
      {
        level: 4,
        note: 'Restores Energy to nearby teammates when triggering Elemental Reactions.',
      },
      { level: 5, note: '+3 Elemental Skill level.' },
      {
        level: 6,
        note: 'Grants a stacking buff that triggers bonus Duststalker Bolts on Normal Attacks.',
      },
    ],
    weapons: [
      {
        weaponKey: 'staff_of_the_scarlet_sands',
        rank: 1,
        note: 'signature',
      },
      {
        weaponKey: 'primordial_jade_wingedspear',
        rank: 2,
      },
      {
        weaponKey: 'ballad_of_the_fjords',
        rank: 3,
        note: 'second-best BP option',
      },
      {
        weaponKey: 'white_tassel',
        rank: 4,
        note: 'F2P, on par with Deathmatch',
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
        name: 'Cyno Quickbloom',
        slots: [
          {
            role: 'Dendro applicator/EM buffer',
            options: ['nahida'],
          },
          {
            role: 'off-field Hydro DPS',
            options: ['yelan'],
          },
          {
            role: 'shielder',
            options: ['zhongli'],
          },
        ],
      },
    ],
  },
  kuki_shinobu: {
    source: 'https://keqingmains.com/q/shinobu-quickguide/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'FlowerOfParadiseLost',
      },
      mains: {
        sands: 'em',
        goblet: 'em',
        circlet: 'em',
      },
      erTarget: 135,
      objective: 'em',
    },
    substats: {
      priority: ['em', 'er_pct', 'hp_pct'],
      floors: { er_pct: 135 },
    },
    constellations: [
      {
        level: 1,
        note: "Increases her Burst's AoE, better for hitting multiple enemies.",
      },
      {
        level: 2,
        note: "Extends her Skill's duration, improving uptime.",
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Her Normal Attacks trigger bonus AoE Electro damage periodically while her Skill is active.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Survives lethal damage once on a cooldown and gains bonus Elemental Mastery at low HP.',
      },
    ],
    weapons: [
      {
        weaponKey: 'freedomsworn',
        rank: 1,
        note: 'signature — highest EM secondary',
      },
      {
        weaponKey: "xiphos'_moonlight",
        rank: 2,
        note: 'F2P, EM + energy support',
      },
      {
        weaponKey: 'iron_sting',
        rank: 3,
        note: 'F2P craftable EM option',
      },
      {
        weaponKey: 'favonius_sword',
        rank: 4,
        note: 'F2P energy option',
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
        name: 'Shinobu Hyperbloom',
        slots: [
          {
            role: 'main Electro DPS (Hyperbloom)',
            options: ['cyno'],
          },
          {
            role: 'off-field Electro DPS (Hyperbloom)',
            options: ['fischl'],
          },
          {
            role: 'Anemo VV shred + grouping',
            options: ['kaedehara_kazuha'],
          },
        ],
      },
    ],
  },
  kujou_sara: {
    source: 'https://keqingmains.com/sara/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'EmblemOfSeveredFate',
      },
      mains: {
        sands: 'atk_pct',
        goblet: 'elemental_dmg',
      },
      erTarget: 160,
      critRatioTarget: 0.333,
      objective: 'crit_value',
    },
    substats: {
      priority: ['er_pct', 'atk_pct', 'crit_rate', 'crit_dmg'],
      floors: { er_pct: 160 },
    },
    constellations: [
      {
        level: 1,
        note: 'Reduces her Elemental Skill cooldown when Tengu Juurai grants buffs or hits opponents.',
      },
      {
        level: 2,
        note: 'Leaves a weaker Crowfeather at her original position when using her Elemental Burst.',
      },
      { level: 3, note: '+3 Elemental Burst level.' },
      {
        level: 4,
        note: 'Increases the number of Tengu Juurai: Stormcluster released by her Skill follow-up.',
      },
      { level: 5, note: '+3 Elemental Skill level.' },
      {
        level: 6,
        note: 'Grants a large bonus CRIT DMG to the Electro damage of characters she buffs.',
      },
    ],
    weapons: [
      {
        weaponKey: 'elegy_for_the_end',
        rank: 1,
        note: 'best buffing option',
      },
      {
        weaponKey: 'skyward_harp',
        rank: 2,
      },
      {
        weaponKey: 'fading_twilight',
        rank: 3,
        note: 'best F2P option',
      },
      {
        weaponKey: 'favonius_warbow',
        rank: 4,
        note: 'F2P energy option',
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
        name: 'Sara Electro Buffer',
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
            role: 'Anemo VV shred + grouping',
            options: ['kaedehara_kazuha'],
          },
        ],
      },
    ],
  },
  clorinde: {
    source: 'https://keqingmains.com/q/clorinde-quickguide/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'FragmentOfHarmonicWhimsy',
      },
      mains: {
        sands: 'atk_pct',
        goblet: 'elemental_dmg',
      },
      erTarget: 110,
      objective: 'crit_value',
    },
    substats: {
      priority: ['er_pct', 'crit_rate', 'crit_dmg', 'atk_pct'],
      floors: { er_pct: 110 },
    },
    constellations: [
      {
        level: 1,
        note: 'Her Normal Attacks generate coordinated shade strikes during Night Vigil.',
      },
      {
        level: 2,
        note: "Increases her ascension passive's buff value and grants interruption resistance at max stacks.",
      },
      { level: 3, note: "+3 Hunter's Vigil (Elemental Skill) level." },
      {
        level: 4,
        note: 'Boosts her Elemental Burst damage based on her current Bond of Life.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Grants CRIT buffs, summons defensive shades, and grants damage reduction during Night Vigil.',
      },
    ],
    weapons: [
      {
        weaponKey: 'absolution',
        rank: 1,
        note: 'signature',
      },
      {
        weaponKey: 'haran_geppaku_futsu',
        rank: 2,
      },
      {
        weaponKey: 'mistsplitter_reforged',
        rank: 3,
      },
      {
        weaponKey: 'finale_of_the_deep',
        rank: 4,
        note: 'F2P craftable, strongest free option',
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
        name: 'Clorinde Overload',
        slots: [
          {
            role: 'Overload enabler',
            options: ['chevreuse'],
          },
          {
            role: 'off-field Electro DPS',
            options: ['fischl'],
          },
          {
            role: 'Anemo VV shred + grouping',
            options: ['kaedehara_kazuha'],
          },
        ],
      },
    ],
  },
  beidou: {
    source: 'https://keqingmains.com/beidou/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'EmblemOfSeveredFate',
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
        note: 'Creates an Electro shield absorbing damage based on her max HP.',
      },
      {
        level: 2,
        note: "Her Elemental Skill's arc lightning jumps to two additional targets.",
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Normal Attacks gain a bonus Electro DMG instance for a short time.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: "Reduces nearby enemies' Electro RES.",
      },
    ],
    weapons: [
      {
        weaponKey: 'serpent_spine',
        rank: 1,
      },
      {
        weaponKey: "wolf's_gravestone",
        rank: 2,
      },
      {
        weaponKey: 'akuoumaru',
        rank: 3,
        note: 'F2P, nearly identical to Serpent Spine',
      },
      {
        weaponKey: 'luxurious_sealord',
        rank: 4,
        note: 'budget F2P option',
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
        name: 'Beidou Taser',
        slots: [
          {
            role: 'Anemo grouper/buffer',
            options: ['sucrose'],
          },
          {
            role: 'off-field Electro DPS',
            options: ['fischl'],
          },
          {
            role: 'off-field Hydro application',
            options: ['xingqiu'],
          },
        ],
      },
    ],
  },
  dori: {
    source: 'https://keqingmains.com/q/dori-quickguide/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'GildedDreams',
      },
      mains: {
        sands: 'em',
        goblet: 'elemental_dmg',
      },
      erTarget: 210,
      objective: 'em',
    },
    substats: {
      priority: ['er_pct', 'crit_rate', 'em', 'atk_pct'],
      floors: { er_pct: 210 },
    },
    constellations: [
      {
        level: 1,
        note: 'Adds a bonus After-Sales Service round, applying extra Electro.',
      },
      {
        level: 2,
        note: 'Her Jinni fires bonus projectiles and applies extra Electro.',
      },
      { level: 3, note: '+3 Elemental Burst level.' },
      {
        level: 4,
        note: 'Connected characters gain bonus Healing and Energy Recharge at low HP/Energy.',
      },
      { level: 5, note: '+3 Elemental Skill level.' },
      {
        level: 6,
        note: 'Applies an Electro infusion after using her Elemental Skill and grants nearby allies healing on Normal Attack hits.',
      },
    ],
    weapons: [
      {
        weaponKey: 'favonius_greatsword',
        rank: 1,
      },
      {
        weaponKey: 'sacrificial_greatsword',
        rank: 2,
      },
      {
        weaponKey: 'serpent_spine',
        rank: 3,
        note: 'Aggravate option',
      },
      {
        weaponKey: 'katsuragikiri_nagamasa',
        rank: 4,
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
        name: 'Dori Hyperbloom',
        slots: [
          {
            role: 'Anemo grouper/buffer',
            options: ['jean'],
          },
          {
            role: 'off-field Hydro DPS',
            options: ['yelan'],
          },
          {
            role: 'Dendro applicator/EM buffer',
            options: ['nahida'],
          },
        ],
      },
    ],
  },
  fischl: {
    source: 'https://keqingmains.com/fischl/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'GoldenTroupe',
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
        note: 'Oz fires coordinated attacks during her Normal Attacks while off-field.',
      },
      {
        level: 2,
        note: 'Her Elemental Skill deals bonus damage and increases its AoE.',
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Her Elemental Burst deals bonus damage on cast and heals on ending.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: "Extends Oz's duration, and his coordinated attacks deal bonus Electro damage — her best constellation.",
      },
    ],
    weapons: [
      {
        weaponKey: 'polar_star',
        rank: 1,
      },
      {
        weaponKey: "hunter's_path",
        rank: 2,
      },
      {
        weaponKey: 'aqua_simulacra',
        rank: 3,
      },
      {
        weaponKey: 'the_stringless',
        rank: 4,
        note: 'best 4-star for Aggravate',
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
        name: 'Fischl Aggravate',
        slots: [
          {
            role: 'main Electro DPS',
            options: ['keqing'],
          },
          {
            role: 'Anemo grouper/buffer',
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
  flins: {
    source: 'https://keqingmains.com/q/flins-quickguide/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'NightOfTheSkysUnveiling',
      },
      mains: {
        sands: 'atk_pct',
        goblet: 'atk_pct',
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
        note: 'Reduces his special Skill cooldown and restores Energy from Lunar-Charged reactions.',
      },
      {
        level: 2,
        note: 'His first Normal Attack after his Skill deals bonus Lunar-Charged damage and shreds Electro RES.',
      },
      { level: 3, note: '+3 Elemental Burst level.' },
      {
        level: 4,
        note: 'Grants a temporary ATK buff and enhances his Elemental Mastery passive.',
      },
      { level: 5, note: '+3 Elemental Skill level.' },
      {
        level: 6,
        note: 'Increases his Lunar-Charged damage and grants teammates a Lunar buff — his best constellation.',
      },
    ],
    weapons: [
      {
        weaponKey: 'bloodsoaked_ruins',
        rank: 1,
        note: 'signature',
      },
      {
        weaponKey: 'staff_of_the_scarlet_sands',
        rank: 2,
      },
      {
        weaponKey: 'deathmatch',
        rank: 3,
        note: 'best 4-star',
      },
      {
        weaponKey: "prospector's_shovel",
        rank: 4,
        note: 'best free option',
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
        name: 'Flins Lunar-Charged',
        slots: [
          {
            role: 'off-field Electro support',
            options: ['ineffa'],
          },
          {
            role: 'off-field Hydro support',
            options: ['columbina'],
          },
          {
            role: 'Anemo grouper/buffer',
            options: ['sucrose'],
          },
        ],
      },
    ],
  },
  iansan: {
    source: 'https://keqingmains.com/q/iansan-quickguide/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'NoblesseOblige',
      },
      mains: {
        sands: 'atk_pct',
        goblet: 'atk_pct',
      },
      erTarget: 220,
      objective: 'atk_pct',
    },
    substats: {
      priority: ['er_pct', 'atk_pct', 'crit_rate'],
      floors: { er_pct: 220 },
    },
    constellations: [
      {
        level: 1,
        note: 'Restores Energy periodically.',
      },
      {
        level: 2,
        note: 'Grants the on-field character a temporary ATK buff while she is off-field.',
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Enhances her Nightsoul point generation.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Extends her Burst duration and grants a DMG bonus on Nightsoul overflow.',
      },
    ],
    weapons: [
      {
        weaponKey: 'symphonist_of_scents',
        rank: 1,
      },
      {
        weaponKey: 'engulfing_lightning',
        rank: 2,
      },
      {
        weaponKey: 'calamity_queller',
        rank: 3,
      },
      {
        weaponKey: 'favonius_lance',
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
        name: 'Iansan Nightsoul Support',
        slots: [
          {
            role: 'main Electro DPS',
            options: ['varesa'],
          },
          {
            role: 'main Hydro DPS',
            options: ['furina'],
          },
          {
            role: 'Anemo grouper/buffer',
            options: ['xianyun'],
          },
        ],
      },
    ],
  },
  ineffa: {
    source: 'https://keqingmains.com/q/ineffa-quickguide/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'AubadeOfMorningstarAndMoon',
      },
      mains: {
        sands: 'atk_pct',
        goblet: 'atk_pct',
      },
      erTarget: 190,
      objective: 'crit_value',
    },
    substats: {
      priority: ['er_pct', 'crit_rate', 'crit_dmg', 'atk_pct'],
      floors: { er_pct: 190 },
    },
    constellations: [
      {
        level: 1,
        note: 'Grants the team a Lunar-Charged DMG bonus while her shield is active.',
      },
      {
        level: 2,
        note: 'Her Burst applies a mark that deals bonus Lunar-Charged damage.',
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Restores Energy on Lunar-Charged reaction triggers.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Deals additional periodic Lunar-Charged damage while her C1 buff is active.',
      },
    ],
    weapons: [
      {
        weaponKey: 'fractured_halo',
        rank: 1,
        note: 'signature',
      },
      {
        weaponKey: 'staff_of_the_scarlet_sands',
        rank: 2,
      },
      {
        weaponKey: 'bloodsoaked_ruins',
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
        burst: 1,
        auto: 1,
      },
    },
    teams: [
      {
        name: 'Ineffa Lunar-Charged',
        slots: [
          {
            role: 'off-field Electro support',
            options: ['flins'],
          },
          {
            role: 'off-field Hydro support',
            options: ['columbina'],
          },
          {
            role: 'Anemo grouper/buffer',
            options: ['sucrose'],
          },
        ],
      },
    ],
  },
  lisa: {
    source: 'https://keqingmains.com/lisa/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'ThunderingFury',
      },
      mains: {
        sands: 'em',
        goblet: 'elemental_dmg',
      },
      erTarget: 140,
      objective: 'em',
    },
    substats: {
      priority: ['crit_rate', 'crit_dmg', 'em', 'atk_pct'],
      floors: { er_pct: 140 },
    },
    constellations: [
      {
        level: 1,
        note: 'Generates flat Energy while holding her Elemental Skill.',
      },
      {
        level: 2,
        note: 'Grants a DEF bonus and interruption resistance while holding her Elemental Skill.',
      },
      { level: 3, note: '+3 Elemental Burst level.' },
      {
        level: 4,
        note: 'Her Lightning Rose unleashes additional lightning bolts — arguably her best constellation.',
      },
      { level: 5, note: '+3 Elemental Skill level.' },
      {
        level: 6,
        note: 'Auto-applies Conductive stacks to enemies on switching to her.',
      },
    ],
    weapons: [
      {
        weaponKey: "kagura's_verity",
        rank: 1,
      },
      {
        weaponKey: 'the_widsith',
        rank: 2,
      },
      {
        weaponKey: 'mappa_mare',
        rank: 3,
      },
      {
        weaponKey: 'magic_guide',
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
        name: 'Lisa Quicken',
        slots: [
          {
            role: 'Dendro applicator/EM buffer',
            options: ['nahida'],
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
  ororon: {
    source: 'https://keqingmains.com/q/ororon-quickguide/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'ScrollOfTheHeroOfCinderCity',
      },
      mains: {
        sands: 'atk_pct',
        goblet: 'elemental_dmg',
      },
      erTarget: 110,
      objective: 'crit_value',
    },
    substats: {
      priority: ['er_pct', 'crit_rate', 'crit_dmg', 'atk_pct'],
      floors: { er_pct: 110 },
    },
    constellations: [
      {
        level: 1,
        note: 'His Spirit Orb bounces additional times and applies a bonus DMG buff to Hypersense.',
      },
      {
        level: 2,
        note: 'Grants a DMG bonus to the party after his Burst.',
      },
      { level: 3, note: '+3 Elemental Burst level.' },
      {
        level: 4,
        note: 'Reduces his Burst rotation time and restores Energy.',
      },
      { level: 5, note: '+3 Elemental Skill level.' },
      {
        level: 6,
        note: 'His Hypersense activates on cast and grants the active character an ATK buff.',
      },
    ],
    weapons: [
      {
        weaponKey: 'elegy_for_the_end',
        rank: 1,
      },
      {
        weaponKey: 'polar_star',
        rank: 2,
      },
      {
        weaponKey: 'favonius_warbow',
        rank: 3,
        note: 'F2P energy option',
      },
      {
        weaponKey: 'chain_breaker',
        rank: 4,
        note: 'F2P Natlan craftable',
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
        name: 'Ororon Electro-Charged',
        slots: [
          {
            role: 'main Hydro DPS',
            options: ['neuvillette', 'furina'],
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
  razor: {
    source: 'https://keqingmains.com/razor/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'PaleFlame',
      },
      mains: {
        sands: 'atk_pct',
        goblet: 'physical_dmg',
      },
      objective: 'crit_value',
    },
    substats: {
      priority: ['crit_rate', 'crit_dmg', 'atk_pct', 'er_pct'],
    },
    constellations: [
      {
        level: 1,
        note: 'Grants a DMG bonus for a short time after picking up an Elemental Particle.',
      },
      {
        level: 2,
        note: 'Increases his CRIT Rate against low-HP enemies.',
      },
      { level: 3, note: '+3 Elemental Burst level.' },
      {
        level: 4,
        note: 'Applies a DEF shred — his best constellation.',
      },
      { level: 5, note: '+3 Elemental Skill level.' },
      {
        level: 6,
        note: 'Grants Electro infusion to his Normal Attacks.',
      },
    ],
    weapons: [
      {
        weaponKey: "wolf's_gravestone",
        rank: 1,
      },
      {
        weaponKey: 'the_unforged',
        rank: 2,
        note: 'strong with shields',
      },
      {
        weaponKey: 'serpent_spine',
        rank: 3,
        note: 'best 4-star',
      },
      {
        weaponKey: 'skyward_pride',
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
        name: 'Razor Superconduct',
        slots: [
          {
            role: 'Cryo battery/support',
            options: ['diona'],
          },
          {
            role: 'off-field Electro DPS',
            options: ['fischl'],
          },
          {
            role: 'off-field Hydro application',
            options: ['xingqiu'],
          },
        ],
      },
    ],
  },
  sethos: {
    source: 'https://keqingmains.com/q/sethos-quickguide/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'WanderersTroupe',
      },
      mains: {
        sands: 'em',
        goblet: 'elemental_dmg',
      },
      erTarget: 140,
      objective: 'em',
    },
    substats: {
      priority: ['er_pct', 'crit_rate', 'em', 'atk_pct'],
      floors: { er_pct: 140 },
    },
    constellations: [
      {
        level: 1,
        note: 'Grants bonus CRIT Rate to his Shadowpiercing Shots.',
      },
      {
        level: 2,
        note: 'Grants a stacking Electro DMG Bonus.',
      },
      { level: 3, note: '+3 Normal Attack level.' },
      {
        level: 4,
        note: 'Grants the party bonus Elemental Mastery when hitting multiple enemies.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Restores Energy after his Shadowpiercing Shots — his best constellation.',
      },
    ],
    weapons: [
      {
        weaponKey: "hunter's_path",
        rank: 1,
      },
      {
        weaponKey: 'slingshot',
        rank: 2,
        note: 'strong 3-star alternative',
      },
      {
        weaponKey: 'aqua_simulacra',
        rank: 3,
      },
    ],
    talents: {
      priority: ['burst', 'auto', 'skill'],
      levels: {
        burst: 6,
        auto: 9,
        skill: 1,
      },
    },
    teams: [
      {
        name: 'Sethos Quicken',
        slots: [
          {
            role: 'off-field Electro DPS',
            options: ['fischl'],
          },
          {
            role: 'Anemo grouper/buffer',
            options: ['sucrose'],
          },
          {
            role: 'Dendro/Quicken support',
            options: ['kirara'],
          },
        ],
      },
    ],
  },
  varesa: {
    source: 'https://keqingmains.com/q/varesa-quickguide/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'LongNightsOath',
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
        note: 'Enhances her ascension passive to a large, consistent ATK bonus and reduces Nightsoul consumption while traversing.',
      },
      {
        level: 2,
        note: 'Enables a short Burst after every Plunging Attack and restores Energy per hit.',
      },
      { level: 3, note: '+3 Elemental Burst level.' },
      {
        level: 4,
        note: 'Grants large damage buffs during Fiery Passion or to her next Plunge after a normal Burst.',
      },
      { level: 5, note: '+3 Normal Attack level.' },
      {
        level: 6,
        note: 'Restores her Nightsoul, adds bonus Energy on Apex Drive entry, and grants CRIT buffs to her Plunges and Bursts.',
      },
    ],
    weapons: [
      {
        weaponKey: 'vivid_notions',
        rank: 1,
        note: 'signature',
      },
      {
        weaponKey: "kagura's_verity",
        rank: 2,
      },
      {
        weaponKey: "crane's_echoing_call",
        rank: 3,
      },
      {
        weaponKey: 'the_widsith',
        rank: 4,
        note: 'strong at high refinement',
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
        name: 'Varesa Hypercarry',
        slots: [
          {
            role: 'off-field Electro support',
            options: ['iansan'],
          },
          {
            role: 'main Hydro DPS',
            options: ['furina'],
          },
          {
            role: 'Anemo grouper/buffer',
            options: ['xianyun'],
          },
        ],
      },
    ],
  },
  yae_miko: {
    source: 'https://keqingmains.com/yae/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'GoldenTroupe',
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
        note: 'Restores Energy on her Elemental Burst, easing her ER requirement.',
      },
      {
        level: 2,
        note: "Increases her Elemental Skill's damage and range.",
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Grants the party a large Electro DMG Bonus with near-full uptime.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: "Her Elemental Skill ignores a portion of enemies' DEF.",
      },
    ],
    weapons: [
      {
        weaponKey: "kagura's_verity",
        rank: 1,
      },
      {
        weaponKey: 'a_thousand_floating_dreams',
        rank: 2,
        note: 'strong in Aggravate',
      },
      {
        weaponKey: 'solar_pearl',
        rank: 3,
      },
      {
        weaponKey: 'the_widsith',
        rank: 4,
        note: 'good 4-star',
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
        name: 'Yae Raikou',
        slots: [
          {
            role: 'main Electro DPS',
            options: ['raiden_shogun'],
          },
          {
            role: 'Anemo grouper/buffer',
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
};
