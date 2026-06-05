import type { GameAdapter, CharacterMeta, WeaponMeta, ArtifactSetMeta } from '../GameAdapter';
import type { StatKey, StatVec, BuildLevel } from '../types';
import { SLOTS } from '../types';
import data from './data.generated.json';

const STAT_KEYS: StatKey[] = [
  'hp',
  'hp_pct',
  'atk',
  'atk_pct',
  'def',
  'def_pct',
  'em',
  'er_pct',
  'crit_rate',
  'crit_dmg',
  'elemental_dmg',
  'physical_dmg',
  'healing',
];

function vec(obj?: Record<string, number>): StatVec {
  return (obj ?? {}) as StatVec;
}

export const PATCH: string = data.patch;

export const genshinAdapter: GameAdapter = {
  id: 'genshin',
  slots: SLOTS,
  statKeys: STAT_KEYS,

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

  baseStats(characterKey: string, weaponKey: string, level: BuildLevel): StatVec {
    const c = data.characters.find((x) => x.key === characterKey);
    const w = data.weapons.find((x) => x.key === weaponKey);
    const out: StatVec = {};
    const add = (src?: Record<string, number>) => {
      if (!src) return;
      for (const k of Object.keys(src)) {
        out[k as StatKey] = (out[k as StatKey] ?? 0) + src[k];
      }
    };
    add(c?.baseByLevel[String(level)]);
    add(w?.byLevel[String(level)]);
    return out;
  },

  mainStatValue(mainStat: StatKey, rarity: number, level: number): number {
    const byStat = (data.mainStatValues as Record<string, Record<string, number[]>>)[
      String(rarity)
    ];
    const arr = byStat?.[mainStat];
    if (!arr) return 0;
    return arr[Math.max(0, Math.min(level, arr.length - 1))] ?? 0;
  },
};
