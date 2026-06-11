import type { Artifact, Slot, StatKey, SubStat } from '../game/types';
import { genshinAdapter } from '../game/genshin/adapter';

// Featured sets present in the snapshot. GladiatorsFinale appears in every slot
// so Navia's 4pc is always formable; the rest add realism and anti-clone variety.
const FEATURED_SETS = [
  'GladiatorsFinale',
  'GildedDreams',
  'EmblemOfSeveredFate',
  'CrimsonWitchOfFlames',
  'HuskOfOpulentDreams',
];

// Slot-legal main stats we populate so presets + the optimiser have real choices.
const SLOT_MAINS: Record<Slot, StatKey[]> = {
  flower: ['hp'],
  plume: ['atk'],
  sands: ['er_pct', 'em', 'atk_pct', 'hp_pct'],
  goblet: ['elemental_dmg', 'em', 'atk_pct', 'hp_pct'],
  circlet: ['crit_rate', 'crit_dmg', 'atk_pct', 'em'],
};

const SLOTS_ORDER: Slot[] = ['flower', 'plume', 'sands', 'goblet', 'circlet'];

// Crit-first substat priority; er_pct kept high enough that an ER build can reach
// 200% (base 100 + ER sands 51.8 + ~3 ER subs). em high so EM floors are reachable.
const SUB_PRIORITY: StatKey[] = [
  'crit_rate',
  'crit_dmg',
  'er_pct',
  'em',
  'atk_pct',
  'hp_pct',
];
const SUB_VALUE: Record<string, number> = {
  crit_rate: 6.2,
  crit_dmg: 12.4,
  er_pct: 16.2,
  em: 40,
  atk_pct: 9.3,
  hp_pct: 9.3,
};

/** Four distinct substats, never equal to the main, crit/ER/EM-leaning. */
function subsFor(main: StatKey): SubStat[] {
  return SUB_PRIORITY.filter((s) => s !== main)
    .slice(0, 4)
    .map((key) => ({ key, value: SUB_VALUE[key] ?? 6 }));
}

function build(): Artifact[] {
  const inv: Artifact[] = [];
  let n = 0;
  for (const setKey of FEATURED_SETS) {
    for (const slot of SLOTS_ORDER) {
      for (const mainStat of SLOT_MAINS[slot]) {
        inv.push({
          id: `sample-${n++}`,
          setKey,
          slot,
          rarity: 5,
          level: 20,
          mainStat,
          mainStatValue: genshinAdapter.mainStatValue(mainStat, 5, 20),
          subStats: subsFor(mainStat),
        });
      }
    }
  }
  return inv;
}

/** Deterministic curated sample inventory (~70 pieces), built once at import. */
export const SAMPLE_INVENTORY: Artifact[] = build();
