import type {
  Artifact,
  OptimizeContext,
  OptimizeRequest,
  BuildResult,
  BuildDiagnostics,
  SetRequirement,
  Slot,
  StatKey,
} from '../game/types';
import { SLOTS } from '../game/types';
import { totals, evaluateObjective, artifactContribution } from './score';
import { statLabel, setRequirementLabel } from '../labels';

/** A minStat is "binding" when the build clears it by less than this fraction
 *  of the target. 5% is a display heuristic (call a constraint "just barely
 *  met" vs "comfortable") — not correctness-critical. */
const BINDING_MARGIN = 0.05;

export function buildDiagnostics(
  ctx: OptimizeContext,
  req: OptimizeRequest,
  b: BuildResult,
  chosen: Artifact[],
  explored: number,
  pruned: number,
): BuildDiagnostics {
  const binding: string[] = [];
  if (req.constraints.setRequirement)
    binding.push(
      `Set requirement: ${setRequirementLabel(req.constraints.setRequirement)}`,
    );
  for (const k of Object.keys(req.constraints.minStats ?? {}) as StatKey[]) {
    const need = req.constraints.minStats![k] ?? 0;
    const have = b.totals[k] ?? 0;
    if (have - need < need * BINDING_MARGIN)
      binding.push(`${statLabel(k)} ≥ ${need} (build has ${have.toFixed(1)})`);
  }

  const marginalBySlot: Partial<Record<Slot, number>> = {};
  const fullObj = evaluateObjective(ctx, req.objective, totals(ctx, chosen));
  for (const slot of SLOTS) {
    const without = chosen.filter((a) => a.slot !== slot);
    marginalBySlot[slot] =
      fullObj - evaluateObjective(ctx, req.objective, totals(ctx, without));
  }
  return { bindingConstraints: binding, marginalBySlot, explored, pruned };
}

/** How far a single minStat floor is out of reach, given the inventory. */
export interface StatCeiling {
  key: StatKey;
  /** The floor the request asks for. */
  need: number;
  /** The best total this stat can reach over the inventory, set requirement
   *  and main-stat locks included. */
  best: number;
}

/** Pairs of indices into a 5-slot list — the ten ways to place a "2pc" half. */
function pairs(slots: Slot[]): [Slot, Slot][] {
  const out: [Slot, Slot][] = [];
  for (let i = 0; i < slots.length; i++)
    for (let j = i + 1; j < slots.length; j++) out.push([slots[i], slots[j]]);
  return out;
}

/**
 * Every slot→set layout that satisfies the requirement, as a map of the slots
 * it pins (unlisted slots are free). Small by construction: 1 layout with no
 * requirement, 5 for a 4pc, 10 for a 2pc, 30 for a 2+2 — cheap enough to walk
 * exhaustively rather than search.
 */
function setLayouts(req?: SetRequirement): Partial<Record<Slot, string>>[] {
  if (!req) return [{}];
  if (req.kind === '4pc')
    return SLOTS.map((free) => {
      const layout: Partial<Record<Slot, string>> = {};
      for (const s of SLOTS) if (s !== free) layout[s] = req.setKey;
      return layout;
    });
  // A 2+2 naming the same set twice is just "≥2 of that set" — the same shape
  // as a 2pc, and pairing it against itself would demand four pieces.
  const two = (setKey: string) =>
    pairs([...SLOTS]).map(([a, b]) => ({ [a]: setKey, [b]: setKey }));
  if (req.kind === '2pc' || req.setKeys[0] === req.setKeys[1])
    return two(req.kind === '2pc' ? req.setKey : req.setKeys[0]);
  const [ka, kb] = req.setKeys;
  const out: Partial<Record<Slot, string>>[] = [];
  for (const [a, b] of pairs([...SLOTS])) {
    const rest = SLOTS.filter((s) => s !== a && s !== b);
    for (const [c, d] of pairs(rest))
      out.push({ [a]: ka, [b]: ka, [c]: kb, [d]: kb });
  }
  return out;
}

/**
 * The highest total of `key` any build over `inventory` can reach while
 * honouring the set requirement and the main-stat locks — or `null` when the
 * set requirement itself cannot be formed from the inventory at all.
 *
 * Per slot this takes the piece contributing most of `key`, which is exact for
 * the artifact contributions (they simply add) but blind to a set bonus a
 * *different* piece in a free slot might have triggered. So it can understate
 * by one incidental 2pc bonus; it never overstates the artifact side, and the
 * layout's own bonuses are counted because the chosen five run through
 * `totals`.
 */
export function maxReachable(
  ctx: OptimizeContext,
  req: OptimizeRequest,
  inventory: Artifact[],
  key: StatKey,
): number | null {
  const locks = req.constraints.mainStatLocks;
  let best: number | null = null;
  for (const layout of setLayouts(req.constraints.setRequirement)) {
    const chosen: Artifact[] = [];
    let feasible = true;
    for (const slot of SLOTS) {
      const want = layout[slot];
      const lock = locks?.[slot];
      let pick: Artifact | undefined;
      let pickValue = -Infinity;
      for (const a of inventory) {
        if (a.slot !== slot) continue;
        if (want && a.setKey !== want) continue;
        if (lock && a.mainStat !== lock) continue;
        const v = artifactContribution(a)[key] ?? 0;
        if (v > pickValue) {
          pickValue = v;
          pick = a;
        }
      }
      // A pinned slot with nothing to put in it kills this layout; a free slot
      // can simply stay empty.
      if (!pick && want) {
        feasible = false;
        break;
      }
      if (pick) chosen.push(pick);
    }
    if (!feasible) continue;
    const value = totals(ctx, chosen)[key] ?? 0;
    if (best === null || value > best) best = value;
  }
  return best;
}

/**
 * The minStat floors no build over this inventory can reach, cheapest-first
 * cause for an infeasible search. An empty list means the floors are all
 * individually reachable — the clash is elsewhere (two floors that can't be
 * met by the same five pieces, say), and the caller should stay vague.
 */
export function unreachableMinStats(
  ctx: OptimizeContext,
  req: OptimizeRequest,
  inventory: Artifact[],
): StatCeiling[] {
  const out: StatCeiling[] = [];
  for (const key of Object.keys(req.constraints.minStats ?? {}) as StatKey[]) {
    const need = req.constraints.minStats![key] ?? 0;
    const best = maxReachable(ctx, req, inventory, key);
    if (best !== null && best < need) out.push({ key, need, best });
  }
  return out;
}
