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
};
