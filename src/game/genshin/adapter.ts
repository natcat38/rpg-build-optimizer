import type { StatKey, StatVec, BuildLevel } from '../types';
import { STAT_KEYS } from '../types';
import type { Snapshot } from './snapshot';
import rawData from './data.generated.json';

export interface CharacterMeta {
  key: string;
  name: string;
  element:
    | 'pyro'
    | 'hydro'
    | 'electro'
    | 'cryo'
    | 'anemo'
    | 'geo'
    | 'dendro'
    | 'physical';
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

export const genshinAdapter = {
  statKeys: [...STAT_KEYS] as StatKey[],

  characters(): CharacterMeta[] {
    return data.characters.map((c) => ({
      key: c.key,
      name: c.name,
      element: c.element as CharacterMeta['element'],
    }));
  },

  weapons(): WeaponMeta[] {
    return data.weapons.map((w) => ({
      key: w.key,
      name: w.name,
      type: w.type,
    }));
  },

  sets(): ArtifactSetMeta[] {
    return data.sets.map((s) => ({
      key: s.key,
      name: s.name,
      twoPiece: vec(s.twoPiece),
      fourPiece: s.fourPiece ? vec(s.fourPiece) : undefined,
    }));
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
