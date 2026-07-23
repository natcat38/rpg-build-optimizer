import type {
  OptimizeConstraints,
  OptimizeRequest,
  StatKey,
  TalentSlot,
} from '../../game/types';
import type { OwnedWeapon, RosterEntry } from '../../import/good';
import { isPctStat, statLabel } from '../../labels';
import { anemo } from './anemo';
import { cryo } from './cryo';
import { dendro } from './dendro';
import { electro } from './electro';
import { geo } from './geo';
import { hydro } from './hydro';
import { pyro } from './pyro';
import type {
  CharacterGuide,
  MetaTarget,
  TalentTargets,
  TeamComp,
  WeaponRec,
} from './types';

export type {
  CharacterGuide,
  ConstellationNote,
  MetaTarget,
  TalentTargets,
  TeamComp,
  TeamSlot,
  WeaponRec,
} from './types';

/** Every curated character guide, merged from the per-element files (kept
 *  separate on disk so each stays reviewable at up to ~116 entries). */
export const GUIDES: Record<string, CharacterGuide> = {
  ...anemo,
  ...cryo,
  ...dendro,
  ...electro,
  ...geo,
  ...hydro,
  ...pyro,
};

/**
 * Translate a meta recipe into the optimiser's constraint shape.
 *
 * `statTargets` is deliberately NOT folded into `minStats` here: it's a
 * grading rubric, not a hard requirement. Most inventories can't reach a full
 * endgame stat line on every stat at once, so treating it as a constraint
 * would make most real inventories infeasible. `erTarget` stays the only stat
 * promoted to a hard floor by default — it's a "the build doesn't function
 * below this" threshold, not an aspirational target.
 */
export function metaToConstraints(meta: MetaTarget): OptimizeConstraints {
  const c: OptimizeConstraints = {
    setRequirement: meta.setRequirement,
    mainStatLocks: meta.mains,
  };
  if (meta.erTarget != null) c.minStats = { er_pct: meta.erTarget };
  if (meta.critRatioTarget != null) c.critRatioTarget = meta.critRatioTarget;
  return c;
}

/** Best-ranked weapon the player owns for this character. Prefers an owned
 *  copy that's unequipped or already on this character; otherwise flags
 *  which character it would need to be pulled from. Pure. */
export function bestOwnedWeapon(
  characterKey: string,
  owned: OwnedWeapon[],
): {
  rec: WeaponRec;
  ownedAs: OwnedWeapon;
  conflictWith: string | null;
} | null {
  const recs = GUIDES[characterKey]?.weapons;
  if (!recs) return null;
  const sorted = [...recs].sort((a, b) => a.rank - b.rank);
  for (const rec of sorted) {
    const copies = owned.filter((w) => w.key === rec.weaponKey);
    if (copies.length === 0) continue;
    const free =
      copies.find((w) => w.location === null || w.location === characterKey) ??
      copies[0];
    return {
      rec,
      ownedAs: free,
      conflictWith:
        free.location && free.location !== characterKey ? free.location : null,
    };
  }
  return null;
}

/** Shortfalls vs target, in priority order. `owned` undefined (no GOOD talent
 *  data) reports every slot with `have: null` rather than assuming maxed. */
export function talentGaps(
  target: TalentTargets,
  owned: Partial<Record<TalentSlot, number>> | undefined,
): { slot: TalentSlot; have: number | null; want: number }[] {
  const out: { slot: TalentSlot; have: number | null; want: number }[] = [];
  for (const slot of target.priority) {
    const want = target.levels[slot];
    const have = owned?.[slot] ?? null;
    if (have === null || have < want) out.push({ slot, have, want });
  }
  return out;
}

/** Rank comps by how many slots the owned roster can fill; resolve each slot
 *  to its best-ranked owned option. `null` in `filled` = "you don't own
 *  anyone for this role" — the UI shows the top-ranked option as a pull/farm
 *  target. Returns `null` only when there's no comp data at all. */
export function bestFieldableComp(
  comps: TeamComp[],
  ownedKeys: Set<string>,
): { comp: TeamComp; filled: (string | null)[]; filledCount: number } | null {
  if (comps.length === 0) return null;
  let best: {
    comp: TeamComp;
    filled: (string | null)[];
    filledCount: number;
  } | null = null;
  for (const comp of comps) {
    const filled = comp.slots.map(
      (slot) => slot.options.find((k) => ownedKeys.has(k)) ?? null,
    );
    const filledCount = filled.filter((k) => k !== null).length;
    if (!best || filledCount > best.filledCount) {
      best = { comp, filled, filledCount };
    }
  }
  return best;
}

/** Resolve a character's display name, falling back to the raw key rather
 *  than crashing when the dataset doesn't have them (e.g. a very new
 *  character). */
export function resolveTeammateName(
  characterKey: string,
  characters: { key: string; name: string }[],
): string {
  return characters.find((c) => c.key === characterKey)?.name ?? characterKey;
}

/** "Energy Recharge (≥120%) > Crit Rate > ATK" — same literal format as
 *  official guide pages' substat priority line. */
export function formatSubstatPriority(entry: {
  priority: StatKey[];
  floors?: Partial<Record<StatKey, number>>;
}): string {
  return entry.priority
    .map((key) => {
      const floor = entry.floors?.[key];
      return floor != null
        ? `${statLabel(key)} (≥${floor}${isPctStat(key) ? '%' : ''})`
        : statLabel(key);
    })
    .join(' > ');
}

/** Build the OptimizeRequest for a meta-curated character's auto-run/grading
 *  solve: the player's equipped weapon if known, else the best-ranked weapon
 *  they own; the meta's objective/constraints; roster build level or 90.
 *  Returns null when there's no sane request (no owned ranked weapon at all)
 *  — callers skip compute rather than guess (ADR-0016). */
export function buildMetaRequest(
  characterKey: string,
  meta: MetaTarget,
  entry: RosterEntry | undefined,
  ownedWeapons: OwnedWeapon[],
): OptimizeRequest | null {
  const weaponKey =
    entry?.weaponKey ??
    bestOwnedWeapon(characterKey, ownedWeapons)?.rec.weaponKey;
  if (!weaponKey) return null;
  return {
    characterKey,
    weaponKey,
    buildLevel: entry?.buildLevel ?? 90,
    objective: meta.objective,
    constraints: metaToConstraints(meta),
    // Explicit (matches search.ts's own default) so this request is
    // byte-for-byte comparable to state/optimizeRequest.ts's currentRequest()
    // output — both feed the same useBuildCache freshness check.
    topK: 10,
  };
}
