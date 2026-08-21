import { create } from 'zustand';
import type {
  BuildLevel,
  Objective,
  OptimizeConstraints,
  OptimizeRequest,
} from '../game/types';
import { genshinAdapter } from '../game/genshin/adapter';
import { META_TARGETS } from '../meta/metaTargets';
import { getDamageProfile } from '../damage/profiles';

export interface PresetInput {
  characterKey: string;
  weaponKey: string;
  objective: Objective;
  constraints: OptimizeConstraints;
}

export interface OptimizeRequestState {
  characterKey: string;
  weaponKey: string;
  buildLevel: BuildLevel;
  objective: Objective;
  /** Single home for all constraints, including the ER floor (minStats.er_pct). */
  constraints: OptimizeConstraints;
  setCharacterKey: (k: string) => void;
  setWeaponKey: (k: string) => void;
  setBuildLevel: (l: BuildLevel) => void;
  setObjective: (o: Objective) => void;
  /** Write the ER floor from a text input value. Empty string or NaN removes the floor. */
  setMinER: (v: string) => void;
  applyPreset: (p: PresetInput) => void;
  reset: () => void;
}

/**
 * What the app opens on.
 *
 * Sort order used to pick this — `characters()[0]` + `weapons()[0]` — which
 * produced "Aino + Absolution": a claymore user holding a sword, alphabetically
 * arrived at, and the first thing a reader saw. The curated tables already know
 * a better answer, so take the first META_TARGETS entry that names a signature
 * weapon *and* carries a damage profile: a pair the app can also demonstrate
 * the `avg_damage` objective on, chosen from data rather than from an accident
 * of ordering. `Object.values` preserves insertion order, so this is fixed as
 * long as the table is.
 */
const MARQUEE = Object.values(META_TARGETS).find(
  (m) => m.weapon != null && getDamageProfile(m.characterKey) != null,
);

/** The opening character/weapon pair, exported so a caller can tell "still
 *  untouched" from "deliberately chosen" (see App's roster hydration). */
export const DEFAULT_SELECTION = {
  characterKey: MARQUEE?.characterKey ?? genshinAdapter.characters()[0]?.key,
  weaponKey: MARQUEE?.weapon ?? genshinAdapter.weapons()[0]?.key,
} as { characterKey: string; weaponKey: string };

const defaults = () => ({
  characterKey: DEFAULT_SELECTION.characterKey ?? '',
  weaponKey: DEFAULT_SELECTION.weaponKey ?? '',
  buildLevel: 90 as BuildLevel,
  objective: 'crit_value' as Objective,
  constraints: {} as OptimizeConstraints,
});

/** Whether the selection is still exactly what the app opened on — the only
 *  state in which replacing it can't overwrite something the reader chose. */
export function isDefaultSelection(s: {
  characterKey: string;
  weaponKey: string;
}): boolean {
  return (
    s.characterKey === DEFAULT_SELECTION.characterKey &&
    s.weaponKey === DEFAULT_SELECTION.weaponKey
  );
}

export const useOptimizeRequest = create<OptimizeRequestState>((set, get) => ({
  ...defaults(),
  setCharacterKey: (characterKey) => set({ characterKey }),
  setWeaponKey: (weaponKey) => set({ weaponKey }),
  setBuildLevel: (buildLevel) => set({ buildLevel }),
  setObjective: (objective) => set({ objective }),
  setMinER: (v) => {
    const num = v.trim() === '' ? NaN : Number(v);
    const prev = get().constraints;
    if (Number.isNaN(num)) {
      // Remove er_pct; drop minStats entirely if it becomes empty.
      if (!prev.minStats || !('er_pct' in prev.minStats)) return;
      const rest = { ...prev.minStats };
      delete rest.er_pct;
      const minStats = Object.keys(rest).length ? rest : undefined;
      set({ constraints: { ...prev, minStats } });
    } else {
      set({
        constraints: {
          ...prev,
          minStats: { ...(prev.minStats ?? {}), er_pct: num },
        },
      });
    }
  },
  applyPreset: (p) => {
    set({
      characterKey: p.characterKey,
      weaponKey: p.weaponKey,
      objective: p.objective,
      constraints: p.constraints,
    });
  },
  reset: () => set(defaults()),
}));

/** Project the store state into an OptimizeRequest (no merge logic needed). */
export function currentRequest(s: OptimizeRequestState): OptimizeRequest {
  return {
    characterKey: s.characterKey,
    weaponKey: s.weaponKey,
    buildLevel: s.buildLevel,
    constraints: s.constraints,
    objective: s.objective,
    topK: 10,
  };
}
