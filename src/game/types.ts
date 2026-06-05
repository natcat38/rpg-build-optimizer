export type Slot = 'flower' | 'plume' | 'sands' | 'goblet' | 'circlet';
export const SLOTS: Slot[] = ['flower', 'plume', 'sands', 'goblet', 'circlet'];

export type StatKey =
  | 'hp' | 'hp_pct' | 'atk' | 'atk_pct' | 'def' | 'def_pct'
  | 'em' | 'er_pct' | 'crit_rate' | 'crit_dmg'
  | 'elemental_dmg' | 'physical_dmg' | 'healing';

const STAT_KEYS: readonly StatKey[] = [
  'hp', 'hp_pct', 'atk', 'atk_pct', 'def', 'def_pct',
  'em', 'er_pct', 'crit_rate', 'crit_dmg',
  'elemental_dmg', 'physical_dmg', 'healing',
];

export function isStatKey(x: unknown): x is StatKey {
  return typeof x === 'string' && (STAT_KEYS as readonly string[]).includes(x);
}

export type BuildLevel = 1 | 20 | 40 | 50 | 60 | 70 | 80 | 90;
export const BUILD_LEVELS: BuildLevel[] = [1, 20, 40, 50, 60, 70, 80, 90];

/** A sparse stat vector. Missing keys are treated as 0. */
export type StatVec = Partial<Record<StatKey, number>>;

export interface SubStat {
  key: StatKey;
  value: number;
}

export interface Artifact {
  id: string;
  setKey: string;
  slot: Slot;
  rarity: number;          // 4 or 5
  level: number;           // 0..20
  mainStat: StatKey;
  mainStatValue: number;   // resolved from rarity+level tables at creation/import time
  subStats: SubStat[];     // <=4, none equal to mainStat
}

export type SetRequirement =
  | { kind: '4pc'; setKey: string }
  | { kind: '2+2'; setKeys: [string, string] }
  | { kind: '2pc'; setKey: string };

export interface OptimizeConstraints {
  setRequirement?: SetRequirement;
  minStats?: StatVec;
  mainStatLocks?: Partial<Record<Slot, StatKey>>;
  critRatioTarget?: number; // soft tiebreak only
}

export type Objective = StatKey | 'crit_value';

export interface OptimizeRequest {
  characterKey: string;
  weaponKey: string;
  buildLevel: BuildLevel;          // drives character + weapon (ADR-0006)
  constraints: OptimizeConstraints;
  objective: Objective;
  topK?: number;                   // default 10
  // artifactLevelMode: reserved for v1.1 "+20 projection"; v1.0 always uses current level.
}

/** Plain, structured-clone-safe context the worker needs (no adapter, no DOM). */
export interface OptimizeContext {
  /** character base @ buildLevel + weapon main + secondary stat line, with elemental_dmg pre-resolved. */
  base: StatVec;
  /** scored flat-stat set bonuses, elemental bonuses pre-resolved to elemental_dmg. */
  setBonuses: Record<string, { two?: StatVec; four?: StatVec }>;
}

export interface BuildDiagnostics {
  bindingConstraints: string[];
  marginalBySlot: Partial<Record<Slot, number>>;
  explored: number;
  pruned: number;
}

export interface BuildResult {
  artifactIds: Record<Slot, string>;
  totals: StatVec;
  objectiveValue: number;
  score: number;                 // objectiveValue - critRatioPenalty
  diagnostics: BuildDiagnostics;
}

export interface OptimizeResult {
  builds: BuildResult[];
  explored: number;
  pruned: number;
  reason?: 'NO_FEASIBLE_BUILD';
}
