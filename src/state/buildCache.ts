import { create } from 'zustand';
import type { Artifact, OptimizeRequest, OptimizeResult } from '../game/types';
import type { OwnedWeapon, RosterEntry } from '../import/good';

/** Holds meta-preset solves only, keyed by characterKey — RosterDashboard's
 *  grading loop and CharacterDetail's auto-run share results here so a
 *  curated character's build is never solved twice. Manual OptimizePanel
 *  overrides bypass this cache entirely (not persisted — it's a derived
 *  cache, not user data). */
export interface CachedBuild {
  request: OptimizeRequest;
  result: OptimizeResult;
  // Snapshot of the inputs used to compute this build. Reference equality
  // against the live store values is enough to detect staleness: every
  // import/roster mutation in this codebase replaces the array/object
  // wholesale, so a changed reference always means "recompute".
  artifacts: Artifact[];
  ownedWeapons: OwnedWeapon[];
  rosterEntries: Record<string, RosterEntry>;
}

interface BuildCacheState {
  builds: Record<string, CachedBuild>;
  setBuild: (characterKey: string, entry: CachedBuild) => void;
  clear: () => void;
}

export const useBuildCache = create<BuildCacheState>((set) => ({
  builds: {},
  setBuild: (characterKey, entry) =>
    set((s) => ({ builds: { ...s.builds, [characterKey]: entry } })),
  clear: () => set({ builds: {} }),
}));

/** True when `cached` was computed from the exact same request and the exact
 *  same inventory/roster/weapon snapshot passed here. */
export function isFreshBuild(
  cached: CachedBuild | undefined,
  request: OptimizeRequest,
  artifacts: Artifact[],
  ownedWeapons: OwnedWeapon[],
  rosterEntries: Record<string, RosterEntry>,
): cached is CachedBuild {
  return (
    !!cached &&
    cached.artifacts === artifacts &&
    cached.ownedWeapons === ownedWeapons &&
    cached.rosterEntries === rosterEntries &&
    JSON.stringify(cached.request) === JSON.stringify(request)
  );
}
