import type { Artifact, OptimizeContext, OptimizeConstraints, Objective, StatVec, StatKey } from '../game/types';

export function addInto(acc: StatVec, v: StatVec): void {
  for (const k of Object.keys(v) as StatKey[]) acc[k] = (acc[k] ?? 0) + (v[k] ?? 0);
}

export function countSets(build: Artifact[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const a of build) counts[a.setKey] = (counts[a.setKey] ?? 0) + 1;
  return counts;
}

function artifactContribution(a: Artifact): StatVec {
  const v: StatVec = {};
  v[a.mainStat] = (v[a.mainStat] ?? 0) + a.mainStatValue;
  for (const s of a.subStats) v[s.key] = (v[s.key] ?? 0) + s.value;
  return v;
}

export function totals(ctx: OptimizeContext, build: Artifact[]): StatVec {
  const t: StatVec = {};
  addInto(t, ctx.base);
  for (const a of build) addInto(t, artifactContribution(a));
  const counts = countSets(build);
  for (const setKey of Object.keys(counts)) {
    const n = counts[setKey];
    const b = ctx.setBonuses[setKey];
    if (!b) continue;
    if (n >= 2 && b.two) addInto(t, b.two);
    if (n >= 4 && b.four) addInto(t, b.four);
  }
  return t;
}

export function objectiveValue(t: StatVec, objective: Objective): number {
  if (objective === 'crit_value') return (t.crit_rate ?? 0) * 2 + (t.crit_dmg ?? 0);
  return t[objective] ?? 0;
}

function meetsSetRequirement(build: Artifact[], req: NonNullable<OptimizeConstraints['setRequirement']>): boolean {
  const c = countSets(build);
  if (req.kind === '4pc') return (c[req.setKey] ?? 0) >= 4;
  if (req.kind === '2pc') return (c[req.setKey] ?? 0) >= 2;
  const [a, b] = req.setKeys;
  return (c[a] ?? 0) >= 2 && (c[b] ?? 0) >= 2;
}

export function satisfies(constraints: OptimizeConstraints, build: Artifact[], t: StatVec): boolean {
  if (constraints.setRequirement && !meetsSetRequirement(build, constraints.setRequirement)) return false;
  if (constraints.minStats) {
    for (const k of Object.keys(constraints.minStats) as StatKey[]) {
      if ((t[k] ?? 0) < (constraints.minStats[k] ?? 0)) return false;
    }
  }
  if (constraints.mainStatLocks) {
    for (const a of build) {
      const lock = constraints.mainStatLocks[a.slot];
      if (lock && a.mainStat !== lock) return false;
    }
  }
  return true;
}

/**
 * Soft tiebreak: penalise distance of crit_rate/(crit_rate+crit_dmg) from `target`.
 * The target is that ratio, NOT the CR:CD ratio: target 0.5 => CR==CD (1:1); the
 * conventional Genshin 1:2 CR:CD corresponds to target ≈ 0.333. Returns 0 when
 * target is undefined (the v1.0 UI does not expose this control).
 */
export function critRatioPenalty(t: StatVec, target?: number): number {
  if (target === undefined) return 0;
  const cr = t.crit_rate ?? 0;
  const cd = t.crit_dmg ?? 0;
  if (cr + cd === 0) return 0;
  const ratio = cr / (cr + cd);
  return Math.abs(ratio - target) * (cr + cd);
}
