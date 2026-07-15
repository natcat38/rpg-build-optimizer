import type {
  Artifact,
  OptimizeContext,
  OptimizeRequest,
  OptimizeResult,
  BuildResult,
  Slot,
} from '../game/types';
import { SLOTS } from '../game/types';
import {
  totals,
  objectiveValue,
  satisfies,
  critRatioPenalty,
  critValue,
} from './score';
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
    return critValue(cr, cd);
  }
  let v = a.mainStat === objective ? a.mainStatValue : 0;
  for (const s of a.subStats) if (s.key === objective) v += s.value;
  return v;
}

/** Inclusive suffix count: how many of pools[slotIndex..end] contain at least
 *  one artifact matching `setKey` — an admissible upper bound on how many more
 *  set-matching pieces could still be picked from here on. */
function suffixSetPotential(
  pools: Record<Slot, Artifact[]>,
  setKey: string,
): number[] {
  const flags = SLOTS.map((s) => pools[s].some((a) => a.setKey === setKey));
  const suffix = new Array(SLOTS.length + 1).fill(0);
  for (let i = SLOTS.length - 1; i >= 0; i--)
    suffix[i] = suffix[i + 1] + (flags[i] ? 1 : 0);
  return suffix;
}

interface RelevantSetBonus {
  key: string;
  two: number;
  four: number;
  /** Inclusive suffix count of how many more pieces of this set could still
   *  be picked from pools[slotIndex..end] — see suffixSetPotential. */
  remaining: number[];
}

/** Sets whose 2pc/4pc grants a nonzero contribution to this objective — most
 *  sets grant 0 (their bonus is a different stat, or unscored per ADR-0003),
 *  so this list is typically tiny (0-5 entries) even across a full dataset. */
function relevantSetBonuses(
  ctx: OptimizeContext,
  objective: OptimizeRequest['objective'],
  pools: Record<Slot, Artifact[]>,
): RelevantSetBonus[] {
  const out: RelevantSetBonus[] = [];
  for (const key of Object.keys(ctx.setBonuses)) {
    const b = ctx.setBonuses[key];
    const two = b.two ? objectiveValue(b.two, objective) : 0;
    const four = b.four ? objectiveValue(b.four, objective) : 0;
    if (two || four) {
      out.push({ key, two, four, remaining: suffixSetPotential(pools, key) });
    }
  }
  return out;
}

/**
 * Admissible over-estimate of the objective gain any reachable set-bonus layout
 * can grant (ADR-0004), given how many pieces of each relevant set are already
 * chosen (`matched`, parallel to `relevant`) and how many more could still be
 * picked from here (`relevant[i].remaining[slotIndex]`). Unlike a single
 * global constant, this shrinks as choices rule sets out — e.g. once a set's
 * 2pc is no longer reachable, its contribution drops out of the bound instead
 * of inflating every branch's ceiling for the rest of the search.
 */
function setBonusCeilingAt(
  relevant: RelevantSetBonus[],
  matched: number[],
  slotIndex: number,
): number {
  let bestSingle = 0;
  const twoValues: number[] = [];
  for (let i = 0; i < relevant.length; i++) {
    const r = relevant[i];
    const feasibleMax = matched[i] + r.remaining[slotIndex];
    const two = feasibleMax >= 2 ? r.two : 0;
    const four = feasibleMax >= 4 ? r.four : 0;
    bestSingle = Math.max(bestSingle, two + four);
    twoValues.push(two);
  }
  twoValues.sort((a, b) => b - a);
  const bestTwoPlusTwo = (twoValues[0] ?? 0) + (twoValues[1] ?? 0);
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

export function searchBuilds(
  req: OptimizeRequest,
  inventory: Artifact[],
  ctx: OptimizeContext,
): OptimizeResult {
  const k = req.topK ?? 10;
  const pools = poolsBySlot(inventory, req);
  if (SLOTS.some((s) => pools[s].length === 0)) {
    return { status: 'infeasible', explored: 0, pruned: 0 };
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
  const relevantSets = relevantSetBonuses(ctx, req.objective, pools);
  const relevantIndex = new Map(relevantSets.map((r, i) => [r.key, i]));
  const matchedRelevant: number[] = new Array(relevantSets.length).fill(0);
  // The base stats always contribute to the objective (e.g. crit_rate/crit_dmg from character/weapon).
  // Include this in the upper bound so pruning remains admissible.
  const baseObjective = objectiveValue(ctx.base, req.objective);

  // A setRequirement (e.g. 4pc) is otherwise only checked at the leaf via
  // satisfies(), so on an inventory spanning many sets almost every branch is
  // explored to full depth just to be rejected. This mirrors suffixMax above,
  // but bounds "how many more required-set pieces could still be picked" —
  // an admissible feasibility bound, so pruning stays exact (ADR-0004) while
  // engaging long before the leaf.
  const setReq = req.constraints.setRequirement;
  let neededA = 0,
    neededB = 0,
    setKeyA = '',
    setKeyB = '';
  let remainingA: number[] | null = null;
  let remainingB: number[] | null = null;
  if (setReq) {
    if (setReq.kind === '2+2') {
      [setKeyA, setKeyB] = setReq.setKeys;
      neededA = 2;
      neededB = 2;
      remainingB = suffixSetPotential(pools, setKeyB);
    } else {
      setKeyA = setReq.setKey;
      neededA = setReq.kind === '4pc' ? 4 : 2;
    }
    remainingA = suffixSetPotential(pools, setKeyA);
  }

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

  function recurse(
    slotIndex: number,
    runningObjective: number,
    matchedA: number,
    matchedB: number,
  ) {
    if (slotIndex === SLOTS.length) {
      explored++;
      const t = totals(ctx, chosen);
      if (!satisfies(req.constraints, chosen, t)) return;
      offer(makeBuildResult(ctx, req, [...chosen]));
      return;
    }
    const upper =
      baseObjective +
      runningObjective +
      suffixMax[slotIndex] +
      setBonusCeilingAt(relevantSets, matchedRelevant, slotIndex);
    if (upper <= minKeptScore()) {
      pruned++;
      return;
    }
    if (remainingA && matchedA + remainingA[slotIndex] < neededA) {
      pruned++;
      return;
    }
    if (remainingB && matchedB + remainingB[slotIndex] < neededB) {
      pruned++;
      return;
    }
    for (const a of pools[SLOTS[slotIndex]]) {
      chosen.push(a);
      const relIdx = relevantIndex.get(a.setKey);
      if (relIdx !== undefined) matchedRelevant[relIdx]++;
      recurse(
        slotIndex + 1,
        runningObjective + objectiveContribution(a, req.objective),
        matchedA + (setKeyA && a.setKey === setKeyA ? 1 : 0),
        matchedB + (setKeyB && a.setKey === setKeyB ? 1 : 0),
      );
      if (relIdx !== undefined) matchedRelevant[relIdx]--;
      chosen.pop();
    }
  }

  recurse(0, 0, 0, 0);

  if (kept.length === 0) return { status: 'infeasible', explored, pruned };

  // Anti-clone cap: drop exact duplicates; at most 2 results per shared 4-piece core.
  const byId = new Map(inventory.map((a) => [a.id, a]));
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
    // Every id came from an inventory artifact (via the pools), so byId always
    // resolves it — the assertion holds and no defensive filter is needed.
    const chosen = SLOTS.map((s) => byId.get(b.artifactIds[s])!);
    final.push({
      ...b,
      diagnostics: buildDiagnostics(ctx, req, b, chosen, explored, pruned),
    });
    if (final.length >= k) break;
  }
  return { status: 'ok', builds: final, explored, pruned };
}

/** Exhaustive reference search — used only by the correctness test. */
export function bruteForce(
  req: OptimizeRequest,
  inventory: Artifact[],
  ctx: OptimizeContext,
): OptimizeResult {
  const pools = poolsBySlot(inventory, req);
  if (SLOTS.some((s) => pools[s].length === 0))
    return { status: 'infeasible', explored: 0, pruned: 0 };
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
    ? { status: 'ok', builds: [best], explored: 0, pruned: 0 }
    : { status: 'infeasible', explored: 0, pruned: 0 };
}
