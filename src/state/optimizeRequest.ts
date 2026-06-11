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
  /** UI text for the Energy Recharge floor; '' = no floor. */
  minER: string;
  /** Constraints set by a preset beyond the ER floor (EM floor, set req, main locks). */
  presetConstraints: OptimizeConstraints;
  setCharacterKey: (k: string) => void;
  setWeaponKey: (k: string) => void;
  setBuildLevel: (l: BuildLevel) => void;
  setObjective: (o: Objective) => void;
  setMinER: (v: string) => void;
  applyPreset: (p: PresetInput) => void;
  reset: () => void;
}

const defaults = () => ({
  characterKey: genshinAdapter.characters()[0]?.key ?? '',
  weaponKey: genshinAdapter.weapons()[0]?.key ?? '',
  buildLevel: 90 as BuildLevel,
  objective: 'crit_value' as Objective,
  minER: '',
  presetConstraints: {} as OptimizeConstraints,
});

export const useOptimizeRequest = create<OptimizeRequestState>((set) => ({
  ...defaults(),
  setCharacterKey: (characterKey) => set({ characterKey }),
  setWeaponKey: (weaponKey) => set({ weaponKey }),
  setBuildLevel: (buildLevel) => set({ buildLevel }),
  setObjective: (objective) => set({ objective }),
  setMinER: (minER) => set({ minER }),
  applyPreset: (p) => {
    // Surface an ER floor into the visible minER field; keep the rest as presetConstraints.
    const er = p.constraints.minStats?.er_pct;
    const presetConstraints: OptimizeConstraints = { ...p.constraints };
    if (presetConstraints.minStats) {
      const rest = { ...presetConstraints.minStats };
      delete rest.er_pct;
      if (Object.keys(rest).length) presetConstraints.minStats = rest;
      else delete presetConstraints.minStats;
    }
    set({
      characterKey: p.characterKey,
      weaponKey: p.weaponKey,
      objective: p.objective,
      minER: er != null ? String(er) : '',
      presetConstraints,
    });
  },
  reset: () => set(defaults()),
}));

/** Compose the effective OptimizeRequest from the store (merges minER into constraints). */
export function currentRequest(s: OptimizeRequestState): OptimizeRequest {
  const constraints: OptimizeConstraints = { ...s.presetConstraints };
  const erNum = s.minER.trim() === '' ? NaN : Number(s.minER);
  if (!Number.isNaN(erNum)) {
    constraints.minStats = { ...(constraints.minStats ?? {}), er_pct: erNum };
  }
  return {
    characterKey: s.characterKey,
    weaponKey: s.weaponKey,
    buildLevel: s.buildLevel,
    constraints,
    objective: s.objective,
    topK: 10,
  };
}
