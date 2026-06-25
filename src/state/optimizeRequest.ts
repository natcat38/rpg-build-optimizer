import { create } from 'zustand';
import type {
  BuildLevel,
  Objective,
  OptimizeConstraints,
  OptimizeRequest,
} from '../game/types';
import { genshinAdapter } from '../game/genshin/adapter';

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

const defaults = () => ({
  characterKey: genshinAdapter.characters()[0]?.key ?? '',
  weaponKey: genshinAdapter.weapons()[0]?.key ?? '',
  buildLevel: 90 as BuildLevel,
  objective: 'crit_value' as Objective,
  constraints: {} as OptimizeConstraints,
});

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
