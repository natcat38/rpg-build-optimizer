import type { CharacterGuide } from './types';

export const dendro: Record<string, CharacterGuide> = {
  nahida: {
    source: 'https://keqingmains.com/nahida/',
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
};
