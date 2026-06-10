import type {
  Artifact,
  OptimizeContext,
  OptimizeRequest,
  OptimizeResult,
  BuildResult,
  Slot,
} from '../game/types';
import { SLOTS } from '../game/types';
import { totals, objectiveValue, satisfies, critRatioPenalty } from './score';
import { buildDiagnostics } from './diagnostics';

function poolsBySlot(
  inventory: Artifact[],
  req: OptimizeRequest,
): Record<Slot, Artifact[]> {
  const pools = {} as Record<Slot, Artifact[]>;
  for (const slot of SLOTS) {
    let pool = inventory.filter((a) => a.slot === slot);
    const lock = req.constraints.mainStatLocks?.[slot];
    if (lock) pool = pool.filter((a) => a.mainStat === lock);
    pools[slot] = pool;
  }
  return pools;
}

function objectiveContribution(
  a: Artifact,
  objective: OptimizeRequest['objective'],
): number {
  if (objective === 'crit_value') {
    let cr = 0,
      cd = 0;
    if (a.mainStat === 'crit_rate') cr += a.mainStatValue;
    if (a.mainStat === 'crit_dmg') cd += a.mainStatValue;
    for (const s of a.subStats) {
      if (s.key === 'crit_rate') cr += s.value;
      if (s.key === 'crit_dmg') cd += s.value;
    }
    return cr * 2 + cd;
  }
  let v = a.mainStat === objective ? a.mainStatValue : 0;
  for (const s of a.subStats) if (s.key === objective) v += s.value;
  return v;
}

/**
 * Admissible over-estimate of the objective gain any reachable set-bonus layout
 * can grant (ADR-0004). With 5 slots the only bonus-bearing layouts are:
 *   - {4,1} or {5}: a single set's (2pc + 4pc)  -> max over sets of (two+four)
 *   - {2,2,1}:      two different sets' 2pc each -> sum of the two largest 2pc
 * The ceiling is the max of those, so it never underestimates (e.g. two
 * ER-bonus sets in a 2+2 build for an er_pct objective).
 */
function maxSetBonusObjective(
  ctx: OptimizeContext,
  objective: OptimizeRequest['objective'],
): number {
  let bestSingle = 0; // best (two + four) from one set, for {4,1}/{5}
  const twoValues: number[] = [];
  for (const key of Object.keys(ctx.setBonuses)) {
    const b = ctx.setBonuses[key];
    const two = b.two ? objectiveValue(b.two, objective) : 0;
    const four = b.four ? objectiveValue(b.four, objective) : 0;
    bestSingle = Math.max(bestSingle, two + four);
    twoValues.push(two);
  }
  twoValues.sort((a, b) => b - a);
  const bestTwoPlusTwo = (twoValues[0] ?? 0) + (twoValues[1] ?? 0); // two distinct sets' 2pc
  return Math.max(bestSingle, bestTwoPlusTwo);
}

function makeBuildResult(
  ctx: OptimizeContext,
  req: OptimizeRequest,
  chosen: Artifact[],
): BuildResult {
  const t = totals(ctx, chosen);
  const ov = objectiveValue(t, req.objective);
  const score = ov - critRatioPenalty(t, req.constraints.critRatioTarget);
  const ids = {} as Record<Slot, string>;
  for (const a of chosen) ids[a.slot] = a.id;
  return {
    artifactIds: ids,
    totals: t,
    objectiveValue: ov,
    score,
    diagnostics: {
      bindingConstraints: [],
      marginalBySlot: {},
      explored: 0,
      pruned: 0,
    },
  };
}

export function optimize(
  req: OptimizeRequest,
  inventory: Artifact[],
  ctx: OptimizeContext,
): OptimizeResult {
  const k = req.topK ?? 10;
  const pools = poolsBySlot(inventory, req);
  if (SLOTS.some((s) => pools[s].length === 0)) {
    return { builds: [], explored: 0, pruned: 0, reason: 'NO_FEASIBLE_BUILD' };
  }

  // Surface high-contribution pieces first so the kept list fills with strong
  // builds early and the admissible bound tightens sooner. Iteration order only —
  // the returned optimum is unchanged (covered by the brute-force equivalence test).
  for (const s of SLOTS) {
    pools[s].sort(
      (a, b) =>
        objectiveContribution(b, req.objective) -
        objectiveContribution(a, req.objective),
    );
  }

  const maxBySlot = SLOTS.map((s) =>
    Math.max(...pools[s].map((a) => objectiveContribution(a, req.objective))),
  );
  const suffixMax: number[] = new Array(SLOTS.length + 1).fill(0);
  for (let i = SLOTS.length - 1; i >= 0; i--)
    suffixMax[i] = suffixMax[i + 1] + maxBySlot[i];
  const setBonusCeiling = maxSetBonusObjective(ctx, req.objective);
  // The base stats always contribute to the objective (e.g. crit_rate/crit_dmg from character/weapon).
  // Include this in the upper bound so pruning remains admissible.
  const baseObjective = objectiveValue(ctx.base, req.objective);

  const kept: BuildResult[] = [];
  let explored = 0;
  let pruned = 0;
  const chosen: Artifact[] = [];

  function minKeptScore(): number {
    return kept.length >= k ? kept[k - 1].score : -Infinity;
  }
  function offer(b: BuildResult) {
    // v1.0: a full sort of up to k*6 entries on every feasible leaf. Negligible for
    // small inventories with heavy pruning; swap for a min-heap in the v1.1 speed report.
    kept.push(b);
    kept.sort((x, y) => y.score - x.score);
    // k*6 margin: the anti-clone filter may return fewer than k builds if the top
    // candidates share a 4-piece core. A larger/exact margin would need full tracking.
    if (kept.length > k * 6) kept.length = k * 6;
  }

  function recurse(slotIndex: number, runningObjective: number) {
    if (slotIndex === SLOTS.length) {
      explored++;
      const t = totals(ctx, chosen);
      if (!satisfies(req.constraints, chosen, t)) return;
      offer(makeBuildResult(ctx, req, [...chosen]));
      return;
    }
    const upper =
      baseObjective + runningObjective + suffixMax[slotIndex] + setBonusCeiling;
    if (upper <= minKeptScore()) {
      pruned++;
      return;
    }
    for (const a of pools[SLOTS[slotIndex]]) {
      chosen.push(a);
      recurse(
        slotIndex + 1,
        runningObjective + objectiveContribution(a, req.objective),
      );
      chosen.pop();
    }
  }

  recurse(0, 0);

  if (kept.length === 0)
    return { builds: [], explored, pruned, reason: 'NO_FEASIBLE_BUILD' };

  // Anti-clone cap: drop exact duplicates; at most 2 results per shared 4-piece core.
  const seenExact = new Set<string>();
  const coreCount: Record<string, number> = {};
  const final: BuildResult[] = [];
  for (const b of kept) {
    const exact = SLOTS.map((s) => b.artifactIds[s]).join(',');
    if (seenExact.has(exact)) continue;
    const core = SLOTS.slice(0, 4)
      .map((s) => b.artifactIds[s])
      .join(',');
    if ((coreCount[core] ?? 0) >= 2) continue;
    seenExact.add(exact);
    coreCount[core] = (coreCount[core] ?? 0) + 1;
    final.push({
      ...b,
      diagnostics: buildDiagnostics(ctx, req, b, inventory, explored, pruned),
    });
    if (final.length >= k) break;
  }
  return { builds: final, explored, pruned };
}

/** Exhaustive reference search — used only by the correctness test. */
export function bruteForce(
  req: OptimizeRequest,
  inventory: Artifact[],
  ctx: OptimizeContext,
): OptimizeResult {
  const pools = poolsBySlot(inventory, req);
  if (SLOTS.some((s) => pools[s].length === 0))
    return { builds: [], explored: 0, pruned: 0, reason: 'NO_FEASIBLE_BUILD' };
  let best: BuildResult | null = null;
  const chosen: Artifact[] = [];
  function rec(i: number) {
    if (i === SLOTS.length) {
      const t = totals(ctx, chosen);
      if (!satisfies(req.constraints, chosen, t)) return;
      const r = makeBuildResult(ctx, req, [...chosen]);
      if (!best || r.score > best.score) best = r;
      return;
    }
    for (const a of pools[SLOTS[i]]) {
      chosen.push(a);
      rec(i + 1);
      chosen.pop();
    }
  }
  rec(0);
  return best
    ? { builds: [best], explored: 0, pruned: 0 }
    : { builds: [], explored: 0, pruned: 0, reason: 'NO_FEASIBLE_BUILD' };
}
