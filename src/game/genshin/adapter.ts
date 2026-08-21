/**
 * The `genshinAdapter`: the concrete object owning all Genshin-specific
 * reference data (characters, weapons, artifact sets, base/main stats) and
 * the universal game baselines, loaded from the frozen `data.generated.json`
 * snapshot (ADR-0002, ADR-0009, ADR-0012).
 * @packageDocumentation
 */

import type { StatKey, StatVec, BuildLevel, Element } from '../types';
import { STAT_KEYS } from '../types';
import type { Snapshot } from './snapshot';
import rawData from './data.generated.json';

export interface CharacterMeta {
  key: string;
  name: string;
  element: Element | 'physical';
}

export interface WeaponMeta {
  key: string;
  name: string;
  type: string;
}

export interface ArtifactSetMeta {
  key: string;
  name: string;
  twoPiece?: StatVec;
  fourPiece?: StatVec;
}

const data = rawData as unknown as Snapshot;

function vec(obj?: Record<string, number>): StatVec {
  return (obj ?? {}) as StatVec;
}

export const PATCH: string = data.patch;

// The snapshot is frozen for the app's lifetime (ADR-0002), so the three
// dataset views are mapped once at module load and handed out as-is. Frozen
// because they are shared: a caller that sorted one in place would reorder it
// for every other caller.
const CHARACTERS: readonly CharacterMeta[] = Object.freeze(
  data.characters.map((c) => ({
    key: c.key,
    name: c.name,
    element: c.element as CharacterMeta['element'],
  })),
);

const WEAPONS: readonly WeaponMeta[] = Object.freeze(
  data.weapons.map((w) => ({ key: w.key, name: w.name, type: w.type })),
);

const SETS: readonly ArtifactSetMeta[] = Object.freeze(
  data.sets.map((s) => ({
    key: s.key,
    name: s.name,
    twoPiece: vec(s.twoPiece),
    fourPiece: s.fourPiece ? vec(s.fourPiece) : undefined,
  })),
);

const CHARACTER_BY_KEY = new Map(CHARACTERS.map((c) => [c.key, c]));
const WEAPON_BY_KEY = new Map(WEAPONS.map((w) => [w.key, w]));

export const genshinAdapter = {
  statKeys: [...STAT_KEYS] as StatKey[],

  characters(): readonly CharacterMeta[] {
    return CHARACTERS;
  },

  /** Single-character lookup without mapping the full dataset. */
  character(key: string): CharacterMeta | undefined {
    return CHARACTER_BY_KEY.get(key);
  },

  /** The one place a character key becomes display copy. Falls back to the raw
   *  key rather than crashing when the frozen dataset doesn't have them (e.g. a
   *  character newer than the snapshot). */
  characterName(key: string): string {
    return CHARACTER_BY_KEY.get(key)?.name ?? key;
  },

  weapons(): readonly WeaponMeta[] {
    return WEAPONS;
  },

  /** Single-weapon lookup without mapping the full dataset. */
  weapon(key: string): WeaponMeta | undefined {
    return WEAPON_BY_KEY.get(key);
  },

  sets(): readonly ArtifactSetMeta[] {
    return SETS;
  },

  baseStats(
    characterKey: string,
    weaponKey: string,
    level: BuildLevel,
  ): StatVec {
    // Fail loud on an unresolved key rather than silently returning a
    // wrong-but-plausible near-empty build: the meta/sample presets carry
    // hardcoded keys that could drift from the frozen dataset.
    const c = data.characters.find((x) => x.key === characterKey);
    if (!c) throw new Error(`Unknown character key: ${characterKey}`);
    const w = data.weapons.find((x) => x.key === weaponKey);
    if (!w) throw new Error(`Unknown weapon key: ${weaponKey}`);
    const out: StatVec = {};
    const add = (src?: Record<string, number>) => {
      if (!src) return;
      for (const k of Object.keys(src)) {
        out[k as StatKey] = (out[k as StatKey] ?? 0) + src[k];
      }
    };
    add(c.baseByLevel[String(level)]);
    add(w.byLevel[String(level)]);
    // The universal 100% base Energy Recharge every character shares is a
    // game-wide rule, not per-character snapshot data, so the adapter owns it
    // (see ADR-0009). Add it so ER totals and ER constraints are correct
    // across the app.
    out.er_pct = (out.er_pct ?? 0) + 100;
    return out;
  },

  mainStatValue(mainStat: StatKey, rarity: number, level: number): number {
    const byStat = data.mainStatValues[String(rarity)];
    const arr = byStat?.[mainStat];
    if (!arr) return 0;
    return arr[Math.max(0, Math.min(level, arr.length - 1))] ?? 0;
  },
};
