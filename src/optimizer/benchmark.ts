import type { Artifact, Slot, StatKey, SubStat } from '../game/types';
import { SLOTS } from '../game/types';
import { genshinAdapter } from '../game/genshin/adapter';

/** Deterministic PRNG so committed benchmark numbers reproduce anywhere. */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Standard Genshin main-stat pools per slot. */
const MAIN_BY_SLOT: Record<Slot, StatKey[]> = {
  flower: ['hp'],
  plume: ['atk'],
  sands: ['hp_pct', 'atk_pct', 'def_pct', 'em', 'er_pct'],
  goblet: [
    'hp_pct',
    'atk_pct',
    'def_pct',
    'em',
    'elemental_dmg',
    'physical_dmg',
  ],
  circlet: [
    'hp_pct',
    'atk_pct',
    'def_pct',
    'em',
    'crit_rate',
    'crit_dmg',
    'healing',
  ],
};

const SUBSTAT_POOL: StatKey[] = [
  'hp',
  'atk',
  'def',
  'hp_pct',
  'atk_pct',
  'def_pct',
  'em',
  'er_pct',
  'crit_rate',
  'crit_dmg',
];

const round1 = (x: number): number => Math.round(x * 10) / 10;

/** Plausible single-artifact substat magnitudes; realism affects which build wins, not the proof. */
function subValue(stat: StatKey, rng: () => number): number {
  switch (stat) {
    case 'crit_rate':
      return round1(2 + rng() * 6);
    case 'crit_dmg':
      return round1(5 + rng() * 14);
    case 'em':
      return round1(16 + rng() * 40);
    case 'er_pct':
    case 'hp_pct':
    case 'atk_pct':
    case 'def_pct':
      return round1(4 + rng() * 10);
    case 'hp':
      return Math.round(200 + rng() * 1000);
    case 'atk':
      return Math.round(14 + rng() * 80);
    case 'def':
      return Math.round(16 + rng() * 90);
    default:
      return round1(rng() * 10);
  }
}

function pickSubstats(main: StatKey, rng: () => number): SubStat[] {
  const pool = SUBSTAT_POOL.filter((s) => s !== main);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 4).map((key) => ({ key, value: subValue(key, rng) }));
}

/** Spread `size` artifacts as evenly as possible across the five slots. */
function distribute(size: number): number[] {
  const base = Math.floor(size / SLOTS.length);
  const rem = size % SLOTS.length;
  return SLOTS.map((_, i) => base + (i < rem ? 1 : 0));
}

/** Seeded, realistic synthetic inventory (real sets, slot-legal mains, 4 substats). */
export function makeInventory(size: number, seed: number): Artifact[] {
  const rng = mulberry32(seed);
  const sets = genshinAdapter.sets();
  const counts = distribute(size);
  const inv: Artifact[] = [];
  SLOTS.forEach((slot, si) => {
    for (let i = 0; i < counts[si]; i++) {
      const set = sets[Math.floor(rng() * sets.length)];
      const mainPool = MAIN_BY_SLOT[slot];
      const mainStat = mainPool[Math.floor(rng() * mainPool.length)];
      inv.push({
        id: `${slot}-${i}`,
        setKey: set.key,
        slot,
        rarity: 5,
        level: 20,
        mainStat,
        mainStatValue: genshinAdapter.mainStatValue(mainStat, 5, 20),
        subStats: pickSubstats(mainStat, rng),
      });
    }
  });
  return inv;
}
