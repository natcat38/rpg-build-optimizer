import type {
  Artifact,
  OptimizeContext,
  OptimizeRequest,
  BuildResult,
  BuildDiagnostics,
  Slot,
  StatKey,
} from '../game/types';
import { SLOTS } from '../game/types';
import { totals, objectiveValue } from './score';
import { statLabel } from '../labels';

/** A minStat is "binding" when the build clears it by less than this fraction of the target. */
const BINDING_MARGIN = 0.05;

export function buildDiagnostics(
  ctx: OptimizeContext,
  req: OptimizeRequest,
  b: BuildResult,
  inventory: Artifact[],
  explored: number,
  pruned: number,
): BuildDiagnostics {
  const binding: string[] = [];
  if (req.constraints.setRequirement)
    binding.push(
      `Set requirement: ${JSON.stringify(req.constraints.setRequirement)}`,
    );
  for (const k of Object.keys(req.constraints.minStats ?? {}) as StatKey[]) {
    const need = req.constraints.minStats![k] ?? 0;
    const have = b.totals[k] ?? 0;
    if (have - need < need * BINDING_MARGIN)
      binding.push(
        `${statLabel(k)} ≥ ${need} (build has ${have.toFixed(1)})`,
      );
  }

  const byId = new Map(inventory.map((a) => [a.id, a]));
  const chosen = SLOTS.map((s) => byId.get(b.artifactIds[s])!).filter(Boolean);
  const marginalBySlot: Partial<Record<Slot, number>> = {};
  const fullObj = objectiveValue(totals(ctx, chosen), req.objective);
  for (const slot of SLOTS) {
    const without = chosen.filter((a) => a.slot !== slot);
    marginalBySlot[slot] =
      fullObj - objectiveValue(totals(ctx, without), req.objective);
  }
  return { bindingConstraints: binding, marginalBySlot, explored, pruned };
}
