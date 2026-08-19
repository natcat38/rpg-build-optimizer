export type Reaction =
  | 'none'
  | 'vaporize-2x'
  | 'vaporize-1.5x'
  | 'melt-2x'
  | 'melt-1.5x'
  | 'aggravate'
  | 'spread';

export interface DamageHit {
  name: string; // "Charged Attack (per tick)"
  scaling: 'atk' | 'hp' | 'def' | 'em';
  multiplier: number; // % of scaling stat at talent lv9 (e.g. 200 = 200%)
  bonus: 'elemental' | 'physical'; // which DMG% bucket applies
  reaction: Reaction;
  weight: number; // contribution weight in the target function
}

export interface DamageProfile {
  characterKey: string; // dataset key (snake_case)
  hits: DamageHit[];
  erRequirement?: number; // default er_pct floor when optimising with this profile
  source: string; // guide URL the numbers were transcribed from
}

/** Enemy assumptions damage is computed against. `res` is a fraction (0.10 = 10%). */
export interface EnemyConfig {
  level: number;
  res: number;
}

export const DEFAULT_ENEMY: EnemyConfig = { level: 100, res: 0.1 };

export interface DamageContext {
  profile: DamageProfile;
  enemy: EnemyConfig;
  charLevel: number; // = OptimizeRequest.buildLevel
}
