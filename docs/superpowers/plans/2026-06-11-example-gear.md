# "Try with example gear" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add one-click "Sample builds" presets that load a shared curated inventory, set a character + constraint, auto-run the optimiser, and land on ranked results — so a first-time visitor sees the tool work instantly.

**Architecture:** A deterministic curated sample inventory + a preset list (data). The optimise request moves from `OptimizePanel`'s local state into a shared Zustand store so presets can drive both the panel and the run. `App` owns a single `runCurrent()` used by both the Optimise button and the presets. A new `SampleGear` card renders in "sample mode" (empty or all-`sample-` inventory). Plus a prerequisite data fix: the adapter adds the universal 100% base Energy Recharge.

**Tech Stack:** React, TypeScript, Zustand, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-06-11-example-gear-design.md`

---

## File Structure

- **Modify `src/game/genshin/adapter.ts`** — `baseStats()` adds `er_pct: 100` (universal base ER). Test in `src/game/genshin/adapter.test.ts`.
- **Create `src/sample/presets.ts`** — `SamplePreset` type + `SAMPLE_PRESETS` (the four presets).
- **Create `src/sample/sampleInventory.ts`** — deterministic `SAMPLE_INVENTORY: Artifact[]`.
- **Create `src/sample/sampleInventory.test.ts`** — determinism + per-preset feasibility.
- **Create `src/state/optimizeRequest.ts`** — shared request store + `currentRequest()` helper. Test in `src/state/optimizeRequest.test.ts`.
- **Modify `src/workers/optimizeClient.ts`** — add `optimizeFor(req, inventory)`.
- **Modify `src/components/OptimizePanel.tsx`** — bind the store; call `onRun` prop. Update `src/components/OptimizePanel.test.tsx`.
- **Create `src/components/SampleGear.tsx`** — the presets card. Test in `src/components/SampleGear.test.tsx`.
- **Modify `src/components/App.tsx`** — own `runCurrent()` + `running`; render `SampleGear` in sample mode; give Results an id for scrolling.

---

## Task 1: Base Energy Recharge correction (data prerequisite)

**Files:**

- Modify: `src/game/genshin/adapter.ts`
- Test: `src/game/genshin/adapter.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `src/game/genshin/adapter.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { genshinAdapter } from './adapter';

describe('baseStats base Energy Recharge', () => {
  it('includes the universal 100% base ER for every character', () => {
    const anyWeapon = genshinAdapter.weapons()[0].key;
    for (const c of genshinAdapter.characters().slice(0, 10)) {
      const base = genshinAdapter.baseStats(c.key, anyWeapon, 90);
      expect(base.er_pct ?? 0).toBeGreaterThanOrEqual(100);
    }
  });
});
```

(If the file already has imports for `describe/it/expect`/`genshinAdapter`, don't duplicate them — just add the `describe` block.)

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/game/genshin/adapter.test.ts`
Expected: FAIL — `er_pct` is 0, not ≥ 100.

- [ ] **Step 3: Implement**

In `src/game/genshin/adapter.ts`, in the `baseStats` method, immediately before `return out;`, add:

```ts
// Every Genshin character has a universal 100% base Energy Recharge that the
// frozen snapshot does not capture. Add it so ER totals and ER constraints
// are correct across the app.
out.er_pct = (out.er_pct ?? 0) + 100;
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/game/genshin/adapter.test.ts`
Expected: PASS. Then `npm test` — the full suite stays green.

- [ ] **Step 5: Commit**

```bash
git add src/game/genshin/adapter.ts src/game/genshin/adapter.test.ts
git commit -m "fix(adapter): add universal 100% base Energy Recharge"
```

(End every commit body with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.)

---

## Task 2: Sample presets + curated inventory + feasibility tests

**Files:**

- Create: `src/sample/presets.ts`
- Create: `src/sample/sampleInventory.ts`
- Test: `src/sample/sampleInventory.test.ts`

- [ ] **Step 1: Create the presets**

Create `src/sample/presets.ts`:

```ts
import type { Objective, OptimizeConstraints } from '../game/types';

export interface SamplePreset {
  label: string;
  characterKey: string;
  weaponKey: string;
  objective: Objective;
  constraints: OptimizeConstraints;
}

/** Each preset demonstrates a different constraint mechanism over the shared sample bag. */
export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    label: 'Furina',
    characterKey: 'furina',
    weaponKey: 'aquila_favonia',
    objective: 'crit_value',
    constraints: { minStats: { er_pct: 200 } },
  },
  {
    label: 'Nahida',
    characterKey: 'nahida',
    weaponKey: 'a_thousand_floating_dreams',
    objective: 'crit_value',
    constraints: { minStats: { em: 550 } },
  },
  {
    label: 'Navia',
    characterKey: 'navia',
    weaponKey: 'beacon_of_the_reed_sea',
    objective: 'crit_value',
    constraints: {
      setRequirement: { kind: '4pc', setKey: 'GladiatorsFinale' },
    },
  },
  {
    label: 'Neuvillette',
    characterKey: 'neuvillette',
    weaponKey: 'cashflow_supervision',
    objective: 'crit_value',
    constraints: { mainStatLocks: { goblet: 'elemental_dmg' } },
  },
];
```

- [ ] **Step 2: Write the failing test**

Create `src/sample/sampleInventory.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { SAMPLE_INVENTORY } from './sampleInventory';
import { SAMPLE_PRESETS } from './presets';
import { SLOTS } from '../game/types';
import { genshinAdapter } from '../game/genshin/adapter';
import { buildContext } from '../optimizer/context';
import { optimize } from '../optimizer/search';
import type { OptimizeRequest } from '../game/types';

describe('SAMPLE_INVENTORY', () => {
  it('is non-empty, sample-prefixed, with a piece in every slot', () => {
    expect(SAMPLE_INVENTORY.length).toBeGreaterThan(40);
    expect(SAMPLE_INVENTORY.every((a) => a.id.startsWith('sample-'))).toBe(
      true,
    );
    for (const slot of SLOTS) {
      expect(SAMPLE_INVENTORY.some((a) => a.slot === slot)).toBe(true);
    }
  });

  it('has unique ids', () => {
    const ids = SAMPLE_INVENTORY.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('yields a feasible build for every preset, honouring its constraint', () => {
    for (const p of SAMPLE_PRESETS) {
      const req: OptimizeRequest = {
        characterKey: p.characterKey,
        weaponKey: p.weaponKey,
        buildLevel: 90,
        constraints: p.constraints,
        objective: p.objective,
        topK: 10,
      };
      const ctx = buildContext(genshinAdapter, req);
      const res = optimize(req, SAMPLE_INVENTORY, ctx);
      expect(res.reason, `${p.label} should be feasible`).not.toBe(
        'NO_FEASIBLE_BUILD',
      );
      expect(res.builds.length, `${p.label} builds`).toBeGreaterThan(0);
      const top = res.builds[0];
      if (p.constraints.minStats?.er_pct != null) {
        expect(top.totals.er_pct ?? 0).toBeGreaterThanOrEqual(
          p.constraints.minStats.er_pct,
        );
      }
      if (p.constraints.minStats?.em != null) {
        expect(top.totals.em ?? 0).toBeGreaterThanOrEqual(
          p.constraints.minStats.em,
        );
      }
    }
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/sample/sampleInventory.test.ts`
Expected: FAIL — cannot find module `./sampleInventory`.

- [ ] **Step 4: Implement the curated inventory**

Create `src/sample/sampleInventory.ts`:

```ts
import type { Artifact, Slot, StatKey, SubStat } from '../game/types';
import { genshinAdapter } from '../game/genshin/adapter';

// Featured sets present in the snapshot. GladiatorsFinale appears in every slot
// so Navia's 4pc is always formable; the rest add realism and anti-clone variety.
const FEATURED_SETS = [
  'GladiatorsFinale',
  'GildedDreams',
  'EmblemOfSeveredFate',
  'CrimsonWitchOfFlames',
  'HuskOfOpulentDreams',
];

// Slot-legal main stats we populate so presets + the optimiser have real choices.
const SLOT_MAINS: Record<Slot, StatKey[]> = {
  flower: ['hp'],
  plume: ['atk'],
  sands: ['er_pct', 'em', 'atk_pct', 'hp_pct'],
  goblet: ['elemental_dmg', 'em', 'atk_pct', 'hp_pct'],
  circlet: ['crit_rate', 'crit_dmg', 'atk_pct', 'em'],
};

const SLOTS_ORDER: Slot[] = ['flower', 'plume', 'sands', 'goblet', 'circlet'];

// Crit-first substat priority; er_pct kept high enough that an ER build can reach
// 200% (base 100 + ER sands 51.8 + ~3 ER subs). em high so EM floors are reachable.
const SUB_PRIORITY: StatKey[] = [
  'crit_rate',
  'crit_dmg',
  'er_pct',
  'em',
  'atk_pct',
  'hp_pct',
];
const SUB_VALUE: Record<string, number> = {
  crit_rate: 6.2,
  crit_dmg: 12.4,
  er_pct: 16.2,
  em: 40,
  atk_pct: 9.3,
  hp_pct: 9.3,
};

/** Four distinct substats, never equal to the main, crit/ER/EM-leaning. */
function subsFor(main: StatKey): SubStat[] {
  return SUB_PRIORITY.filter((s) => s !== main)
    .slice(0, 4)
    .map((key) => ({ key, value: SUB_VALUE[key] ?? 6 }));
}

function build(): Artifact[] {
  const inv: Artifact[] = [];
  let n = 0;
  for (const setKey of FEATURED_SETS) {
    for (const slot of SLOTS_ORDER) {
      for (const mainStat of SLOT_MAINS[slot]) {
        inv.push({
          id: `sample-${n++}`,
          setKey,
          slot,
          rarity: 5,
          level: 20,
          mainStat,
          mainStatValue: genshinAdapter.mainStatValue(mainStat, 5, 20),
          subStats: subsFor(mainStat),
        });
      }
    }
  }
  return inv;
}

/** Deterministic curated sample inventory (~70 pieces), built once at import. */
export const SAMPLE_INVENTORY: Artifact[] = build();
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/sample/sampleInventory.test.ts`
Expected: PASS. If the Furina ER or Nahida EM feasibility assertion fails, raise `SUB_VALUE.er_pct`/`SUB_VALUE.em` slightly or add another ER/EM main option to `SLOT_MAINS` until feasible, then re-run. Do not change the preset thresholds.

- [ ] **Step 6: Commit**

```bash
git add src/sample/presets.ts src/sample/sampleInventory.ts src/sample/sampleInventory.test.ts
git commit -m "feat(sample): curated sample inventory + showcase presets"
```

---

## Task 3: Shared optimise-request store

**Files:**

- Create: `src/state/optimizeRequest.ts`
- Test: `src/state/optimizeRequest.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/state/optimizeRequest.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useOptimizeRequest, currentRequest } from './optimizeRequest';

describe('optimizeRequest store', () => {
  beforeEach(() => useOptimizeRequest.getState().reset());

  it('builds a request from the minER field', () => {
    useOptimizeRequest.getState().setMinER('160');
    const req = currentRequest(useOptimizeRequest.getState());
    expect(req.constraints.minStats?.er_pct).toBe(160);
    expect(req.topK).toBe(10);
    expect(req.buildLevel).toBe(90);
  });

  it('applyPreset surfaces an ER floor into minER and keeps other constraints', () => {
    useOptimizeRequest.getState().applyPreset({
      characterKey: 'furina',
      weaponKey: 'aquila_favonia',
      objective: 'crit_value',
      constraints: { minStats: { er_pct: 200 } },
    });
    const s = useOptimizeRequest.getState();
    expect(s.characterKey).toBe('furina');
    expect(s.minER).toBe('200');
    expect(currentRequest(s).constraints.minStats?.er_pct).toBe(200);
  });

  it('applyPreset keeps a setRequirement and leaves minER empty', () => {
    useOptimizeRequest.getState().applyPreset({
      characterKey: 'navia',
      weaponKey: 'beacon_of_the_reed_sea',
      objective: 'crit_value',
      constraints: {
        setRequirement: { kind: '4pc', setKey: 'GladiatorsFinale' },
      },
    });
    const s = useOptimizeRequest.getState();
    expect(s.minER).toBe('');
    expect(currentRequest(s).constraints.setRequirement).toEqual({
      kind: '4pc',
      setKey: 'GladiatorsFinale',
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/state/optimizeRequest.test.ts`
Expected: FAIL — cannot find module `./optimizeRequest`.

- [ ] **Step 3: Implement the store**

Create `src/state/optimizeRequest.ts`:

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/state/optimizeRequest.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/state/optimizeRequest.ts src/state/optimizeRequest.test.ts
git commit -m "feat(state): shared optimise-request store"
```

---

## Task 4: Extract `optimizeFor` helper

**Files:**

- Modify: `src/workers/optimizeClient.ts`

- [ ] **Step 1: Add the helper**

In `src/workers/optimizeClient.ts`, add these imports at the top (merge with existing import lines; `runOptimize` already lives in this file):

```ts
import { buildContext } from '../optimizer/context';
import { genshinAdapter } from '../game/genshin/adapter';
```

Then append at the end of the file:

```ts
/** Build the context and run the optimiser for a request over an inventory. */
export function optimizeFor(
  req: OptimizeRequest,
  inventory: Artifact[],
): Promise<OptimizeResult> {
  const ctx = buildContext(genshinAdapter, req);
  return runOptimize(req, inventory, ctx);
}
```

(`Artifact`, `OptimizeRequest`, `OptimizeResult` are already imported in this file — reuse them.)

- [ ] **Step 2: Verify typecheck**

Run: `npm run typecheck`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/workers/optimizeClient.ts
git commit -m "feat(workers): optimizeFor convenience wrapper"
```

---

## Task 5: Refactor OptimizePanel + App to a shared run path

**Files:**

- Modify: `src/components/OptimizePanel.tsx`
- Modify: `src/components/OptimizePanel.test.tsx`
- Modify: `src/components/App.tsx`

- [ ] **Step 1: Update the OptimizePanel test for the new props**

Replace the body of `src/components/OptimizePanel.test.tsx` with:

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OptimizePanel } from './OptimizePanel';
import { useInventory } from '../state/inventory';
import { useOptimizeRequest } from '../state/optimizeRequest';

describe('OptimizePanel', () => {
  beforeEach(() => {
    useInventory.getState().clear();
    useOptimizeRequest.getState().reset();
  });

  it('disables Optimise with a hint when no artifacts exist', () => {
    render(<OptimizePanel onRun={() => {}} running={false} />);
    expect(screen.getByRole('button', { name: /Optimise/i })).toBeDisabled();
    expect(
      screen.getByText(/Add or import artifacts before optimising\./i),
    ).toBeInTheDocument();
  });

  it('enables Optimise once a character is chosen and artifacts exist', () => {
    useInventory.getState().add({
      id: 'a',
      setKey: 'A',
      slot: 'flower',
      rarity: 5,
      level: 20,
      mainStat: 'hp',
      mainStatValue: 1,
      subStats: [],
    });
    render(<OptimizePanel onRun={() => {}} running={false} />);
    expect(screen.getByRole('button', { name: /Optimise/i })).toBeEnabled();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/components/OptimizePanel.test.tsx`
Expected: FAIL — `OptimizePanel` doesn't accept `onRun`/`running` yet (type error / build fail).

- [ ] **Step 3: Refactor OptimizePanel**

Replace the entire contents of `src/components/OptimizePanel.tsx` with:

```tsx
import { useMemo } from 'react';
import type { BuildLevel, Objective } from '../game/types';
import { BUILD_LEVELS } from '../game/types';
import { genshinAdapter } from '../game/genshin/adapter';
import { useInventory } from '../state/inventory';
import { useOptimizeRequest } from '../state/optimizeRequest';
import { objectiveLabel } from '../ui/labels';
import { Combobox } from './ui/Combobox';

const OBJECTIVES: Objective[] = [
  'crit_value',
  'em',
  'atk_pct',
  'atk',
  'er_pct',
  'elemental_dmg',
];

export function OptimizePanel({
  onRun,
  running,
}: {
  onRun: () => void | Promise<void>;
  running: boolean;
}) {
  const artifacts = useInventory((s) => s.artifacts);
  const chars = useMemo(() => genshinAdapter.characters(), []);
  const weapons = useMemo(() => genshinAdapter.weapons(), []);

  const characterKey = useOptimizeRequest((s) => s.characterKey);
  const weaponKey = useOptimizeRequest((s) => s.weaponKey);
  const buildLevel = useOptimizeRequest((s) => s.buildLevel);
  const objective = useOptimizeRequest((s) => s.objective);
  const minER = useOptimizeRequest((s) => s.minER);
  const setCharacterKey = useOptimizeRequest((s) => s.setCharacterKey);
  const setWeaponKey = useOptimizeRequest((s) => s.setWeaponKey);
  const setBuildLevel = useOptimizeRequest((s) => s.setBuildLevel);
  const setObjective = useOptimizeRequest((s) => s.setObjective);
  const setMinER = useOptimizeRequest((s) => s.setMinER);

  const hasArtifacts = artifacts.length > 0;
  const canRun = hasArtifacts && !!characterKey;
  const hint = !hasArtifacts
    ? 'Add or import artifacts before optimising.'
    : !characterKey
      ? 'Pick a character to start.'
      : null;

  return (
    <div className="panel space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="block">
          <span className="field-label">Character</span>
          <Combobox
            options={chars.map((c) => ({ value: c.key, label: c.name }))}
            value={characterKey}
            onChange={setCharacterKey}
          />
        </div>
        <div className="block">
          <span className="field-label">Weapon</span>
          <Combobox
            options={weapons.map((w) => ({ value: w.key, label: w.name }))}
            value={weaponKey}
            onChange={setWeaponKey}
          />
        </div>
        <label className="block">
          <span className="field-label">Build level</span>
          <select
            className="field"
            value={buildLevel}
            onChange={(e) =>
              setBuildLevel(Number(e.target.value) as BuildLevel)
            }
          >
            {BUILD_LEVELS.map((l) => (
              <option key={l} value={l}>
                Lv. {l}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="field-label">Maximise</span>
          <select
            className="field"
            value={objective}
            onChange={(e) => setObjective(e.target.value as Objective)}
          >
            {OBJECTIVES.map((o) => (
              <option key={o} value={o}>
                {objectiveLabel(o)}
              </option>
            ))}
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="field-label">Minimum Energy Recharge %</span>
          <input
            className="field"
            type="number"
            value={minER}
            onChange={(e) => setMinER(e.target.value)}
            placeholder="Optional — e.g. 200"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4">
        {hint ? (
          <p className="text-sm text-muted">{hint}</p>
        ) : (
          <p className="text-sm text-muted">
            Searching{' '}
            <span className="font-semibold text-parchment">
              {artifacts.length}
            </span>{' '}
            artifacts for the exact optimum.
          </p>
        )}
        <button
          className={`btn-primary ${running ? 'animate-pulse-glow' : ''}`}
          disabled={!canRun || running}
          onClick={() => onRun()}
        >
          {running ? 'Searching…' : 'Optimise'}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Wire App to own `runCurrent` + `running`**

In `src/components/App.tsx`:

(a) Update imports — replace the `OptimizeRequest`/`OptimizeResult` type import line and add the new deps:

```ts
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ImportPanel } from './ImportPanel';
import { ArtifactForm } from './ArtifactForm';
import { OptimizePanel } from './OptimizePanel';
import { Results } from './Results';
import { decodeBuild } from '../share/url';
import { PATCH } from '../game/genshin/adapter';
import { useInventory } from '../state/inventory';
import { useOptimizeRequest, currentRequest } from '../state/optimizeRequest';
import { optimizeFor } from '../workers/optimizeClient';
import type { Artifact, OptimizeRequest, OptimizeResult } from '../game/types';
```

(b) Inside `App`, add a `running` state next to the others and a `runCurrent` function (place it after the `artifactsById` memo):

```ts
const [running, setRunning] = useState(false);

async function runCurrent() {
  const req = currentRequest(useOptimizeRequest.getState());
  const inv = useInventory.getState().artifacts;
  if (inv.length === 0 || !req.characterKey) return;
  setRunning(true);
  try {
    const r = await optimizeFor(req, inv);
    setSharedArtifacts(null);
    setResult(r);
    setRequest(req);
  } finally {
    setRunning(false);
  }
}
```

(c) Replace the `<OptimizePanel onResult={...} />` block with:

```tsx
<OptimizePanel onRun={runCurrent} running={running} />
```

(d) Give the Results section a scroll target — change its opening tag to include an id by wrapping its content. Replace the Results `<Section ...>` block with:

```tsx
{
  result && request && (
    <div id="results-section">
      <Section n={3} title="Results" delay="0s">
        <Results
          result={result}
          request={request}
          artifactsById={artifactsById}
        />
      </Section>
    </div>
  );
}
```

- [ ] **Step 5: Run tests + typecheck**

Run: `npx vitest run src/components/OptimizePanel.test.tsx src/components/App.test.tsx` then `npm run typecheck`.
Expected: all pass; no type errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/OptimizePanel.tsx src/components/OptimizePanel.test.tsx src/components/App.tsx
git commit -m "refactor(optimize): shared request store + App-owned run path"
```

---

## Task 6: SampleGear card + render in sample mode

**Files:**

- Create: `src/components/SampleGear.tsx`
- Test: `src/components/SampleGear.test.tsx`
- Modify: `src/components/App.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/SampleGear.test.tsx`:

```tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SampleGear } from './SampleGear';
import { useInventory } from '../state/inventory';
import { useOptimizeRequest } from '../state/optimizeRequest';

describe('SampleGear', () => {
  beforeEach(() => {
    useInventory.getState().clear();
    useOptimizeRequest.getState().reset();
  });

  it('renders a button for each preset', () => {
    render(<SampleGear onRun={() => {}} />);
    for (const name of ['Furina', 'Nahida', 'Navia', 'Neuvillette']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
  });

  it('loads sample gear, applies the preset, and runs on click', async () => {
    const onRun = vi.fn();
    render(<SampleGear onRun={onRun} />);
    await userEvent.click(screen.getByRole('button', { name: 'Nahida' }));
    const inv = useInventory.getState().artifacts;
    expect(inv.length).toBeGreaterThan(0);
    expect(inv.every((a) => a.id.startsWith('sample-'))).toBe(true);
    expect(useOptimizeRequest.getState().characterKey).toBe('nahida');
    expect(onRun).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/components/SampleGear.test.tsx`
Expected: FAIL — cannot find module `./SampleGear`.

- [ ] **Step 3: Implement SampleGear**

Create `src/components/SampleGear.tsx`:

```tsx
import { useState } from 'react';
import { useInventory } from '../state/inventory';
import { useOptimizeRequest } from '../state/optimizeRequest';
import { SAMPLE_PRESETS, type SamplePreset } from '../sample/presets';
import { SAMPLE_INVENTORY } from '../sample/sampleInventory';

export function SampleGear({ onRun }: { onRun: () => void | Promise<void> }) {
  const clear = useInventory((s) => s.clear);
  const addMany = useInventory((s) => s.addMany);
  const applyPreset = useOptimizeRequest((s) => s.applyPreset);
  const [busy, setBusy] = useState<string | null>(null);

  async function load(preset: SamplePreset) {
    setBusy(preset.label);
    clear();
    addMany(SAMPLE_INVENTORY);
    applyPreset(preset);
    try {
      await onRun();
    } finally {
      setBusy(null);
    }
    document
      .getElementById('results-section')
      ?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="panel space-y-3">
      <div>
        <h2 className="font-display text-lg font-bold tracking-wide text-parchment">
          No gear handy? Try a sample build
        </h2>
        <p className="text-xs text-muted">
          Loads a realistic sample account and optimises it in one click — each
          preset shows a different kind of constraint.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {SAMPLE_PRESETS.map((p) => (
          <button
            key={p.label}
            className="btn-ghost"
            disabled={busy !== null}
            onClick={() => load(p)}
          >
            {busy === p.label ? 'Optimising…' : p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/components/SampleGear.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Render SampleGear in App's sample mode**

In `src/components/App.tsx`:

(a) Add the import:

```ts
import { SampleGear } from './SampleGear';
```

(b) Add a sample-mode derivation after `const artifacts = useInventory((s) => s.artifacts);`:

```ts
const sampleMode =
  artifacts.length === 0 || artifacts.every((a) => a.id.startsWith('sample-'));
```

(c) Render the card at the top of the sections list (just inside `<div className="space-y-10">`, before Section 1):

```tsx
{
  sampleMode && (
    <div className="animate-fade-up">
      <SampleGear onRun={runCurrent} />
    </div>
  );
}
```

- [ ] **Step 6: Verify the suite + typecheck + lint**

Run: `npm test`, then `npm run typecheck`, then `npm run lint`.
Expected: all green (App.test still finds the import-panel text; new tests pass).

- [ ] **Step 7: Commit**

```bash
git add src/components/SampleGear.tsx src/components/SampleGear.test.tsx src/components/App.tsx
git commit -m "feat(ui): one-click Sample builds presets"
```

---

## Final verification

- [ ] `npm run typecheck` — clean.
- [ ] `npm run lint` — clean.
- [ ] `npm test` — all pass (adapter ER, sample feasibility, store, OptimizePanel, SampleGear, App).
- [ ] `npm run format:check` — Prettier-clean (run `npx prettier --write <changed files>` if needed; never `prettier --write .`).
- [ ] `npm run build` — production build succeeds.
- [ ] Manual smoke (optional, `npm run dev`): empty state shows the "Sample builds" card; clicking each preset lands on ranked results; the optimise panel reflects the preset; flipping presets re-runs; importing/adding real gear hides the card.

---

## Self-review

**Spec coverage:**

- §2 preset lineup (4 presets, exact keys, constraint each) → Task 2 (`presets.ts`). ✓
- §2.1 base ER correction → Task 1. ✓
- §3 shared curated inventory + feasibility guarantees → Task 2 (builder + feasibility test). ✓
- §4 request store, OptimizePanel refactor, `optimizeFor`, App `runCurrent`, SampleGear → Tasks 3–6. ✓
- §5 sample-mode detection (`sample-` prefix), card visibility, flipping, no-overwrite, worker fallback → Task 6 (sampleMode) + Task 2 (ids) + Task 4 (runOptimize fallback). ✓
- §6 testing (sample, SampleGear, preserve OptimizePanel/App) → Tasks 2, 5, 6. ✓
- §7 acceptance criteria → Final verification + per-task tests. ✓

**Placeholder scan:** none — every step has concrete code/commands. The only conditional ("raise SUB_VALUE if feasibility fails") is a data-tuning instruction with an explicit method, not unfinished content.

**Type consistency:** `SamplePreset`/`SAMPLE_PRESETS`, `SAMPLE_INVENTORY`, `useOptimizeRequest`/`currentRequest`/`reset`/`applyPreset`/`setMinER`, `optimizeFor(req, inventory)`, and the `OptimizePanel` `{ onRun, running }` props are defined once and used identically across tasks. `OptimizeConstraints`, `OptimizeRequest`, `BuildLevel`, `Objective`, `Artifact`, `SubStat`, `Slot`, `SLOTS` match `src/game/types.ts`. Keys (`furina`, `nahida`, `navia`, `neuvillette`; weapons; `GladiatorsFinale`) verified against the dataset.
