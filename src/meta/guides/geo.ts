import type { CharacterGuide } from './types';

export const geo: Record<string, CharacterGuide> = {
  navia: {
    source: 'https://keqingmains.com/navia/',
    role: 'Explosive Geo burst DPS built around Shrapnel-charged Normal Attacks.',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'NighttimeWhispersInTheEchoingWoods',
      },
      mains: {
        sands: 'atk_pct',
        goblet: 'elemental_dmg',
      },
      erTarget: 140,
      critRatioTarget: 0.333,
      objective: 'crit_value',
    },
    substats: {
      priority: ['er_pct', 'crit_rate', 'crit_dmg', 'atk_pct'],
      floors: { er_pct: 140 },
    },
    constellations: [
      {
        level: 1,
        note: 'Consuming Crystal Shrapnel charges on her Skill restores energy and reduces Burst cooldown.',
      },
      {
        level: 2,
        note: 'Grants bonus Skill CRIT Rate based on Shrapnel consumed and triggers extra Cannon Fire Support shots.',
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Reduces nearby opponents’ Geo RES for a short time when her Burst hits.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Grants bonus Skill CRIT DMG and returns consumed Shrapnel beyond the first few charges.',
      },
    ],
    weapons: [
      {
        weaponKey: 'verdict',
        rank: 1,
        note: 'signature',
      },
      {
        weaponKey: 'serpent_spine',
        rank: 2,
      },
      {
        weaponKey: 'the_unforged',
        rank: 3,
      },
      {
        weaponKey: 'favonius_greatsword',
        rank: 4,
        note: 'F2P energy option',
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
        name: 'Navia Geo',
        slots: [
          {
            role: 'Geo buffer/RES shredder',
            options: ['xilonen'],
          },
          {
            role: 'ATK buffer + Pyro application',
            options: ['bennett'],
          },
          {
            role: 'Hydro buffer',
            options: ['furina'],
          },
        ],
      },
    ],
  },
  arataki_itto: {
    source: 'https://keqingmains.com/itto/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'HuskOfOpulentDreams',
      },
      mains: {
        sands: 'def_pct',
        goblet: 'elemental_dmg',
      },
      erTarget: 130,
      objective: 'crit_value',
    },
    substats: {
      priority: ['er_pct', 'crit_rate', 'crit_dmg', 'def_pct'],
      floors: { er_pct: 130 },
    },
    constellations: [
      {
        level: 1,
        note: 'Grants Superlative Superstrength stacks immediately, then more shortly after casting his Burst.',
      },
      {
        level: 2,
        note: "Nearby Geo party members reduce his Burst's cooldown and restore Energy.",
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'On Burst end, grants nearby party members a DEF and ATK bonus.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Charged Attacks gain bonus CRIT DMG and a chance to not consume Superstrength stacks.',
      },
    ],
    weapons: [
      {
        weaponKey: 'redhorn_stonethresher',
        rank: 1,
        note: 'signature',
      },
      {
        weaponKey: 'serpent_spine',
        rank: 2,
        note: 'second BiS',
      },
      {
        weaponKey: 'skyward_pride',
        rank: 3,
      },
      {
        weaponKey: 'whiteblind',
        rank: 4,
        note: 'F2P craftable DEF option',
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
        name: 'Itto Mono-Geo',
        slots: [
          {
            role: 'Geo battery/buffer',
            options: ['gorou'],
          },
          {
            role: 'off-field Geo DPS',
            options: ['albedo'],
          },
          {
            role: 'shielder/RES shred',
            options: ['zhongli', 'diona'],
          },
        ],
      },
    ],
  },
  zhongli: {
    source: 'https://keqingmains.com/zhongli/',
    build: {
      setRequirement: {
        kind: '2pc',
        setKey: 'TenacityOfTheMillelith',
      },
      mains: {
        sands: 'hp_pct',
        goblet: 'hp_pct',
        circlet: 'hp_pct',
      },
      objective: 'hp_pct',
    },
    substats: {
      priority: ['hp_pct', 'crit_rate'],
    },
    constellations: [
      { level: 1, note: 'Allows two Stone Steles to exist at once.' },
      {
        level: 2,
        note: 'His Burst grants a shield to nearby characters when the meteor lands.',
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: "Enlarges his Burst's radius and extends the Petrification duration.",
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Converts a portion of incoming shield damage into healing for the active character.',
      },
    ],
    weapons: [
      {
        weaponKey: 'black_tassel',
        rank: 1,
        note: 'F2P — shield-bot BiS',
      },
      {
        weaponKey: 'favonius_lance',
        rank: 2,
        note: 'F2P energy option',
      },
      {
        weaponKey: 'the_catch',
        rank: 3,
        note: 'craftable ER option',
      },
      {
        weaponKey: 'primordial_jade_wingedspear',
        rank: 4,
        note: 'DPS-build alternative',
      },
    ],
    talents: {
      priority: ['skill', 'burst', 'auto'],
      levels: {
        skill: 6,
        burst: 1,
        auto: 1,
      },
    },
    teams: [
      {
        name: 'Zhongli Shield Support',
        slots: [
          {
            role: 'off-field Hydro DPS + damage reduction',
            options: ['xingqiu'],
          },
          {
            role: 'off-field Electro DPS',
            options: ['fischl'],
          },
          {
            role: 'off-field Geo DPS',
            options: ['albedo'],
          },
        ],
      },
    ],
  },
  albedo: {
    source: 'https://keqingmains.com/albedo/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'HuskOfOpulentDreams',
      },
      mains: {
        sands: 'def_pct',
        goblet: 'elemental_dmg',
      },
      erTarget: 100,
      objective: 'crit_value',
    },
    substats: {
      priority: ['crit_rate', 'crit_dmg', 'def_pct'],
      floors: { er_pct: 100 },
    },
    constellations: [
      {
        level: 1,
        note: 'Grants Energy per Transient Blossom, reducing his ER needs if bursting.',
      },
      {
        level: 2,
        note: 'Transient Blossoms grant stacks that increase Burst/Fatal Blossom damage scaling with his DEF.',
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Buffs Plunging Attacks within his flower field — largely ineffective for his usual playstyle.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Grants shielded on-field teammates a DMG bonus.',
      },
    ],
    weapons: [
      {
        weaponKey: 'cinnabar_spindle',
        rank: 1,
        note: 'best-in-slot, event-exclusive',
      },
      {
        weaponKey: 'harbinger_of_dawn',
        rank: 2,
        note: 'best F2P option',
      },
      {
        weaponKey: 'primordial_jade_cutter',
        rank: 3,
        note: 'best 5-star for Burst-focused builds',
      },
      {
        weaponKey: 'light_of_foliar_incision',
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
        name: 'Albedo Geo Hypercarry',
        slots: [
          {
            role: 'main Geo DPS',
            options: ['arataki_itto'],
          },
          {
            role: 'Geo battery/buffer',
            options: ['gorou'],
          },
          {
            role: 'shielder/universal RES shred',
            options: ['zhongli'],
          },
        ],
      },
    ],
  },
  chiori: {
    source: 'https://keqingmains.com/q/chiori-quickguide/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'GoldenTroupe',
      },
      mains: {
        sands: 'def_pct',
        goblet: 'elemental_dmg',
      },
      objective: 'crit_value',
    },
    substats: {
      priority: ['crit_rate', 'crit_dmg', 'def_pct', 'atk_pct'],
    },
    constellations: [
      {
        level: 1,
        note: "Increases her Tamoto's AoE and summons an additional Tamoto with any Geo teammate.",
      },
      {
        level: 2,
        note: 'Summons Kinu dolls after her Burst — her most impactful constellation.',
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Summons additional Kinu dolls while attacking on-field.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Reduces her Elemental Skill cooldown and increases Normal Attack scaling, enabling an on-field playstyle.',
      },
    ],
    weapons: [
      {
        weaponKey: 'uraku_misugiri',
        rank: 1,
        note: 'best-in-slot',
      },
      {
        weaponKey: 'primordial_jade_cutter',
        rank: 2,
      },
      {
        weaponKey: 'harbinger_of_dawn',
        rank: 3,
        note: 'F2P accessible',
      },
      {
        weaponKey: 'cinnabar_spindle',
        rank: 4,
      },
    ],
    talents: {
      priority: ['skill', 'auto', 'burst'],
      levels: {
        skill: 9,
        auto: 6,
        burst: 1,
      },
    },
    teams: [
      {
        name: 'Chiori Mono Geo',
        slots: [
          {
            role: 'main Geo DPS',
            options: ['arataki_itto'],
          },
          {
            role: 'Geo battery/buffer',
            options: ['gorou'],
          },
          {
            role: 'shielder/universal RES shred',
            options: ['zhongli'],
          },
        ],
      },
    ],
  },
  gorou: {
    source: 'https://keqingmains.com/gorou/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'NoblesseOblige',
      },
      mains: {
        sands: 'er_pct',
        goblet: 'elemental_dmg',
      },
      erTarget: 220,
      objective: 'crit_value',
    },
    substats: {
      priority: ['er_pct', 'crit_rate', 'def_pct'],
      floors: { er_pct: 220 },
    },
    constellations: [
      {
        level: 1,
        note: 'Reduces his Elemental Skill cooldown when Geo teammates deal Geo damage.',
      },
      {
        level: 2,
        note: 'Extends his Burst duration when picking up Crystallize shards.',
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Grants periodic healing scaling with his DEF while his buff is active.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Grants a large CRIT DMG bonus to Geo damage based on buff level.',
      },
    ],
    weapons: [
      {
        weaponKey: 'favonius_warbow',
        rank: 1,
        note: 'best-in-slot, battery',
      },
      {
        weaponKey: 'elegy_for_the_end',
        rank: 2,
        note: 'situational buff',
      },
      {
        weaponKey: 'sacrificial_bow',
        rank: 3,
        note: 'needs refinement for consistency',
      },
      {
        weaponKey: 'end_of_the_line',
        rank: 4,
        note: 'ER substat alternative',
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
        name: 'Gorou Geo Hypercarry',
        slots: [
          {
            role: 'main Geo DPS',
            options: ['arataki_itto'],
          },
          {
            role: 'Geo support',
            options: ['albedo'],
          },
          {
            role: 'shielder/universal RES shred',
            options: ['zhongli'],
          },
        ],
      },
    ],
  },
  illuga: {
    source: 'https://keqingmains.com/q/illuga-quickguide/',
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
        note: 'Regains Energy after triggering Geo reactions.',
      },
      {
        level: 2,
        note: 'Summons Aedon for off-field damage, enabling full uptime on his set.',
      },
      { level: 3, note: '+3 Elemental Burst level.' },
      {
        level: 4,
        note: 'Grants active party members bonus DEF during his Burst.',
      },
      { level: 5, note: '+3 Elemental Skill level.' },
      {
        level: 6,
        note: 'Enhances his ascension passive to grant the team bonus Geo CRIT.',
      },
    ],
    weapons: [
      {
        weaponKey: "dragon's_bane",
        rank: 1,
        note: 'highest EM among polearms',
      },
      {
        weaponKey: 'favonius_lance',
        rank: 2,
      },
      {
        weaponKey: 'kitain_cross_spear',
        rank: 3,
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
        name: 'Illuga Lunar-Crystallize',
        slots: [
          {
            role: 'main Geo DPS',
            options: ['zibai'],
          },
          {
            role: 'off-field Hydro support',
            options: ['columbina'],
          },
          {
            role: 'shielder/universal RES shred',
            options: ['zhongli'],
          },
        ],
      },
    ],
  },
  kachina: {
    source: 'https://keqingmains.com/q/kachina-quickguide/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'ScrollOfTheHeroOfCinderCity',
      },
      mains: {
        sands: 'def_pct',
        goblet: 'elemental_dmg',
      },
      erTarget: 200,
      objective: 'def_pct',
    },
    substats: {
      priority: ['er_pct', 'def_pct', 'crit_rate'],
      floors: { er_pct: 200 },
    },
    constellations: [
      {
        level: 1,
        note: 'Absorbs Crystallize shards and restores Energy when teammates pick them up.',
      },
      {
        level: 2,
        note: 'Her Burst restores Nightsoul Points, enabling shorter rotations with full buff uptime.',
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Grants the active character a DEF bonus scaling with enemy count during her Burst.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: "Deals Geo damage when the active character's shield breaks or is replaced.",
      },
    ],
    weapons: [
      {
        weaponKey: 'favonius_lance',
        rank: 1,
        note: 'particle generation',
      },
      {
        weaponKey: 'footprint_of_the_rainbow',
        rank: 2,
        note: 'craftable, large DEF% scaling',
      },
      {
        weaponKey: 'deathmatch',
        rank: 3,
      },
      {
        weaponKey: 'staff_of_the_scarlet_sands',
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
        name: 'Kachina Lyney Hypercarry',
        slots: [
          {
            role: 'main Pyro DPS',
            options: ['lyney'],
          },
          {
            role: 'ATK buffer + healer',
            options: ['bennett'],
          },
          {
            role: 'shielder/universal RES shred',
            options: ['zhongli'],
          },
        ],
      },
    ],
  },
  linnea: {
    source: 'https://keqingmains.com/q/linnea-quickguide/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'HuskOfOpulentDreams',
      },
      mains: {
        sands: 'def_pct',
        goblet: 'def_pct',
      },
      erTarget: 170,
      objective: 'def_pct',
    },
    substats: {
      priority: ['er_pct', 'crit_rate', 'def_pct', 'em'],
      floors: { er_pct: 170 },
    },
    constellations: [
      {
        level: 1,
        note: 'Grants Field Catalog stacks that add a damage bonus to teammates.',
      },
      {
        level: 2,
        note: 'Grants a large CRIT DMG bonus to Hydro/Geo party members — her most impactful constellation.',
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Grants her and the active character a DEF buff after her Harmony effect triggers.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: "Increases the party's Lunar-Crystallize damage and boosts her own nuke potential.",
      },
    ],
    weapons: [
      {
        weaponKey: 'golden_frostbound_oath',
        rank: 1,
        note: 'signature',
      },
      {
        weaponKey: 'aqua_simulacra',
        rank: 2,
      },
      {
        weaponKey: 'elegy_for_the_end',
        rank: 3,
      },
      {
        weaponKey: 'slingshot',
        rank: 4,
        note: 'F2P best option',
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
        name: 'Linnea Zibai Hypercarry',
        slots: [
          {
            role: 'main Geo DPS',
            options: ['zibai'],
          },
          {
            role: 'off-field Hydro support',
            options: ['columbina'],
          },
          {
            role: 'Geo/Lunar support',
            options: ['illuga'],
          },
        ],
      },
    ],
  },
  ningguang: {
    source: 'https://keqingmains.com/ningguang/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'EmblemOfSeveredFate',
      },
      mains: {
        sands: 'atk_pct',
        goblet: 'elemental_dmg',
      },
      erTarget: 120,
      objective: 'crit_value',
    },
    substats: {
      priority: ['er_pct', 'crit_dmg', 'crit_rate', 'atk_pct'],
      floors: { er_pct: 120 },
    },
    constellations: [
      {
        level: 1,
        note: 'Adds AoE damage to her Normal Attacks — generally low value.',
      },
      {
        level: 2,
        note: 'Resets her Jade Screen cooldown when it shatters.',
      },
      { level: 3, note: '+3 Elemental Burst level.' },
      {
        level: 4,
        note: 'Grants nearby characters a small Elemental RES buff — largely useless.',
      },
      { level: 5, note: '+3 Elemental Skill level.' },
      {
        level: 6,
        note: 'Grants bonus Star Jades after her Burst — a strong capstone constellation.',
      },
    ],
    weapons: [
      {
        weaponKey: 'memory_of_dust',
        rank: 1,
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
        note: 'good 4-star',
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
        name: 'Ningguang Geo Support',
        slots: [
          {
            role: 'Geo battery/buffer',
            options: ['albedo'],
          },
          {
            role: 'ATK buffer + healer',
            options: ['bennett'],
          },
          {
            role: 'off-field Electro DPS',
            options: ['fischl'],
          },
        ],
      },
    ],
  },
  noelle: {
    source: 'https://keqingmains.com/noelle/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'MarechausseeHunter',
      },
      mains: {
        sands: 'def_pct',
        goblet: 'elemental_dmg',
      },
      erTarget: 140,
      objective: 'def_pct',
    },
    substats: {
      priority: ['er_pct', 'crit_rate', 'def_pct', 'atk_pct'],
      floors: { er_pct: 140 },
    },
    constellations: [
      {
        level: 1,
        note: 'Improves healing reliability while her Burst and shield are active — synergizes with Furina.',
      },
      {
        level: 2,
        note: 'Reduces Charged Attack stamina cost and increases Charged Attack damage.',
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Deals bonus Geo damage when her shield expires.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Converts a portion of her DEF to ATK and extends her Burst duration per defeated enemy.',
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
        weaponKey: 'verdict',
        rank: 3,
      },
      {
        weaponKey: 'whiteblind',
        rank: 4,
        note: 'F2P craftable',
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
        name: 'Noelle Mono Geo',
        slots: [
          {
            role: 'Geo battery/buffer',
            options: ['gorou'],
          },
          {
            role: 'main Hydro DPS',
            options: ['furina'],
          },
          {
            role: 'shielder/universal RES shred',
            options: ['zhongli'],
          },
        ],
      },
    ],
  },
  xilonen: {
    source: 'https://keqingmains.com/q/xilonen-quickguide/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'ScrollOfTheHeroOfCinderCity',
      },
      mains: {
        sands: 'er_pct',
        goblet: 'def_pct',
      },
      erTarget: 180,
      objective: 'def_pct',
    },
    substats: {
      priority: ['er_pct', 'crit_rate', 'def_pct'],
      floors: { er_pct: 180 },
    },
    constellations: [
      {
        level: 1,
        note: 'Reduces Nightsoul consumption and extends its time limit, plus grants interruption resistance.',
      },
      {
        level: 2,
        note: 'Keeps her Geo buff always active and grants tailored buffs to other elements.',
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Grants teammates bonus Normal/Charged/Plunging Attack DMG scaling with her DEF.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Transforms her into a viable on-field DPS with large ATK bonuses and universal healing.',
      },
    ],
    weapons: [
      {
        weaponKey: 'peak_patrol_song',
        rank: 1,
        note: 'signature',
      },
      {
        weaponKey: 'favonius_sword',
        rank: 2,
        note: 'handles ER needs',
      },
      {
        weaponKey: 'freedomsworn',
        rank: 3,
      },
      {
        weaponKey: 'flute_of_ezpitzal',
        rank: 4,
        note: 'F2P DEF option',
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
        name: 'Xilonen Hydro Support',
        slots: [
          {
            role: 'main Hydro DPS',
            options: ['neuvillette'],
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
  yun_jin: {
    source: 'https://keqingmains.com/yunjin/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'HuskOfOpulentDreams',
      },
      mains: {
        sands: 'def_pct',
        goblet: 'def_pct',
      },
      erTarget: 160,
      objective: 'def_pct',
    },
    substats: {
      priority: ['er_pct', 'def_pct', 'crit_rate'],
      floors: { er_pct: 160 },
    },
    constellations: [
      {
        level: 1,
        note: 'Reduces her Elemental Skill cooldown.',
      },
      {
        level: 2,
        note: 'Grants a temporary Normal Attack DMG bonus after her Burst.',
      },
      { level: 3, note: '+3 Elemental Burst level.' },
      {
        level: 4,
        note: 'Grants a DEF buff after a Crystallize reaction.',
      },
      { level: 5, note: '+3 Elemental Skill level.' },
      {
        level: 6,
        note: 'Increases Normal Attack speed during her Burst.',
      },
    ],
    weapons: [
      {
        weaponKey: 'favonius_lance',
        rank: 1,
        note: 'ER + particle generation',
      },
      {
        weaponKey: 'engulfing_lightning',
        rank: 2,
      },
      {
        weaponKey: 'the_catch',
        rank: 3,
        note: 'F2P option',
      },
      {
        weaponKey: 'prototype_starglitter',
        rank: 4,
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
        name: 'Yun Jin Charged-Attack Support',
        slots: [
          {
            role: 'main Pyro DPS',
            options: ['yoimiya'],
          },
          {
            role: 'off-field Hydro DPS',
            options: ['yelan'],
          },
          {
            role: 'off-field Hydro application',
            options: ['xingqiu'],
          },
        ],
      },
    ],
  },
  zibai: {
    source: 'https://keqingmains.com/q/zibai-quickguide/',
    build: {
      setRequirement: {
        kind: '4pc',
        setKey: 'NightOfTheSkysUnveiling',
      },
      mains: {
        sands: 'def_pct',
        goblet: 'def_pct',
      },
      erTarget: 130,
      objective: 'crit_value',
    },
    substats: {
      priority: ['crit_rate', 'crit_dmg', 'def_pct', 'em'],
      floors: { er_pct: 130 },
    },
    constellations: [
      {
        level: 1,
        note: 'Grants a fifth Elemental Skill charge and a large damage boost to his first Skill use.',
      },
      {
        level: 2,
        note: 'Grants a Lunar-Crystallize DMG bonus during Lunar Phase Shift and enhances his ascension passive.',
      },
      { level: 3, note: '+3 Elemental Skill level.' },
      {
        level: 4,
        note: 'Prevents his Normal Attack sequence from resetting and doubles a Lunar-Crystallize DMG buff.',
      },
      { level: 5, note: '+3 Elemental Burst level.' },
      {
        level: 6,
        note: 'Increases his Radiance gain rate and converts excess Radiance into bonus damage — his best constellation.',
      },
    ],
    weapons: [
      {
        weaponKey: 'lightbearing_moonshard',
        rank: 1,
        note: 'signature',
      },
      {
        weaponKey: 'uraku_misugiri',
        rank: 2,
      },
      {
        weaponKey: 'harbinger_of_dawn',
        rank: 3,
        note: 'best non-5-star with a shielder',
      },
      {
        weaponKey: 'flute_of_ezpitzal',
        rank: 4,
        note: 'best craftable 4-star',
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
        name: 'Zibai Lunar-Crystallize',
        slots: [
          {
            role: 'off-field Geo/Lunar support',
            options: ['illuga'],
          },
          {
            role: 'off-field Geo/Lunar support',
            options: ['linnea'],
          },
          {
            role: 'off-field Hydro support',
            options: ['columbina'],
          },
        ],
      },
    ],
  },
};
