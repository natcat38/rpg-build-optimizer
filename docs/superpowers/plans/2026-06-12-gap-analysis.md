# Gap Analysis Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The v1.1 centerpiece — compare a player's best owned build against a frozen meta build recipe and tell them what's missing and what to farm (feasibility gaps + numeric shortfall + one grounded action), with a one-click overridable "Use meta build" prefill.

**Architecture:** A dataset prerequisite makes all 49 sets available. Frozen `META_TARGETS` data + a `metaToConstraints` helper feed the existing `useOptimizeRequest` store ("Use meta build" = `applyPreset`). A pure `computeGapReport` derives the report from the meta recipe, the inventory, and the existing per-build diagnostics (`marginalBySlot`). A `GapReport` component renders it in the Results area.

**Tech Stack:** TypeScript, React, Zustand, Vitest + Testing Library, `tsx` (dataset regen).

**Spec:** `docs/superpowers/specs/2026-06-12-gap-analysis-design.md`

---

## File Structure

- **Modify `scripts/build-dataset.ts`** — `buildSets()` retains sets with unparseable 2pc (empty `twoPiece`) instead of dropping them.
- **Regenerate `src/game/genshin/data.generated.json`** — via `npm run build:data`.
- **Modify `src/game/genshin/adapter.test.ts`** — assert the meta sets are present.
- **Create `src/meta/metaTargets.ts`** — `MetaTarget` type, `META_TARGETS`, `metaToConstraints`. Test: `src/meta/metaTargets.test.ts`.
- **Modify `DATA_LICENSE`** — meta-data attribution.
- **Modify `src/components/OptimizePanel.tsx`** — "Use meta build" button. Update `src/components/OptimizePanel.test.tsx`.
- **Create `src/meta/gap.ts`** — `GapReport` type + `computeGapReport`. Test: `src/meta/gap.test.ts`.
- **Create `src/components/GapReport.tsx`** — the report UI. Test: `src/components/GapReport.test.tsx`.
- **Modify `src/components/App.tsx`** — render `GapReport` in the Results area for meta characters on fresh, non-shared builds.

---

## Task 1: Dataset — retain all artifact sets

**Files:**

- Modify: `scripts/build-dataset.ts`
- Modify: `src/game/genshin/adapter.test.ts`
- Regenerate: `src/game/genshin/data.generated.json`

- [ ] **Step 1: Write the failing test**

Append to `src/game/genshin/adapter.test.ts` (reuse the existing `genshinAdapter` import; add the block):

```ts
describe('artifact set snapshot', () => {
  it('retains conditional-2pc meta sets (Golden Troupe, Marechaussee Hunter)', () => {
    const keys = new Set(genshinAdapter.sets().map((s) => s.key));
    expect(keys.has('GoldenTroupe')).toBe(true);
    expect(keys.has('MarechausseeHunter')).toBe(true);
  });

  it('still scores a flat-stat 2pc bonus (Emblem Energy Recharge)', () => {
    const emblem = genshinAdapter
      .sets()
      .find((s) => s.key === 'EmblemOfSeveredFate');
    expect(emblem?.twoPiece?.er_pct).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/game/genshin/adapter.test.ts`
Expected: FAIL — `GoldenTroupe`/`MarechausseeHunter` not present in the snapshot.

- [ ] **Step 3: Change `buildSets()` to retain all sets**

In `scripts/build-dataset.ts`, in `buildSets()`, replace this block:

```ts
const twoPiece = parse2pc(a['2pc']);
const fourPiece = parse4pcStatOnly();

// Only include if we recognise the 2pc bonus as a stat. Warn (don't silently
// drop) so a parser gap on a stat-granting set is visible at build time.
if (!twoPiece) {
  console.warn(
    `  ⚠ dropped set "${name}" — unparsed 2pc: ${JSON.stringify(a['2pc'])}`,
  );
  continue;
}

const key = goodKey(name); // GOOD-standard set key so imported artifacts match
```

with:

```ts
// Retain every set. Flat-stat 2pc bonuses are scored; conditional/non-stat
// 2pc bonuses (e.g. Golden Troupe, Marechaussee Hunter) are kept with an empty
// bonus so the set is still requirable as a constraint (ADR-0003) — it just
// contributes 0 to stat scoring.
const twoPiece = parse2pc(a['2pc']) ?? {};
const fourPiece = parse4pcStatOnly();
if (Object.keys(twoPiece).length === 0) {
  console.log(`  · retained set "${name}" with no scored 2pc bonus`);
}

const key = goodKey(name); // GOOD-standard set key so imported artifacts match
```

- [ ] **Step 4: Regenerate the snapshot**

Run: `npm run build:data`
Expected: prints `Sets: 49` (up from 35). Then verify the diff only **adds** sets:

Run: `git diff --stat src/game/genshin/data.generated.json`
Then spot-check: `git diff src/game/genshin/data.generated.json | grep -E '^[-]' | grep -v '"twoPiece"' | grep -vE '^---' | head`
Expected: no **removed** content other than reformatting around the new entries — only added set objects. If character/weapon data changed, STOP and report (the regen should be set-only).

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/game/genshin/adapter.test.ts` (passes). Then `npm test` — full suite stays green (existing set-bonus/optimizer tests must still pass).

- [ ] **Step 6: Commit**

```bash
git add scripts/build-dataset.ts src/game/genshin/data.generated.json src/game/genshin/adapter.test.ts
git commit -m "feat(data): retain all artifact sets (incl. conditional-2pc) in snapshot"
```

(End every commit body with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.)

---

## Task 2: Meta-target data + `metaToConstraints`

**Files:**

- Create: `src/meta/metaTargets.ts`
- Create: `src/meta/metaTargets.test.ts`
- Modify: `DATA_LICENSE`

- [ ] **Step 1: Write the failing test**

Create `src/meta/metaTargets.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { META_TARGETS, metaToConstraints } from './metaTargets';
import { genshinAdapter } from '../game/genshin/adapter';

describe('META_TARGETS', () => {
  it('covers the four showcase characters with sets present in the snapshot', () => {
    const setKeys = new Set(genshinAdapter.sets().map((s) => s.key));
    const charKeys = new Set(genshinAdapter.characters().map((c) => c.key));
    for (const key of ['furina', 'nahida', 'navia', 'neuvillette']) {
      const m = META_TARGETS[key];
      expect(m, key).toBeTruthy();
      expect(charKeys.has(m.characterKey)).toBe(true);
      const req = m.setRequirement;
      const keys = req.kind === '2+2' ? req.setKeys : [req.setKey];
      for (const sk of keys)
        expect(setKeys.has(sk), `${key} set ${sk}`).toBe(true);
    }
  });

  it('metaToConstraints maps a recipe to OptimizeConstraints', () => {
    const c = metaToConstraints(META_TARGETS.furina);
    expect(c.setRequirement).toEqual({ kind: '4pc', setKey: 'GoldenTroupe' });
    expect(c.mainStatLocks).toEqual({
      sands: 'hp_pct',
      goblet: 'elemental_dmg',
    });
    expect(c.minStats?.er_pct).toBe(130);
  });

  it('omits minStats when there is no ER target', () => {
    const c = metaToConstraints(META_TARGETS.nahida);
    expect(c.minStats?.er_pct).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/meta/metaTargets.test.ts`
Expected: FAIL — cannot find module `./metaTargets`.

- [ ] **Step 3: Implement**

Create `src/meta/metaTargets.ts`:

```ts
import type {
  Objective,
  OptimizeConstraints,
  SetRequirement,
  Slot,
  StatKey,
} from '../game/types';

/** A frozen, overridable meta build recipe (ADR-0007). Adapted from KQM guides. */
export interface MetaTarget {
  characterKey: string;
  setRequirement: SetRequirement; // 4pc | 2pc | 2+2
  mains: Partial<Record<Slot, StatKey>>; // usually sands + goblet; circlet left free
  erTarget?: number; // er_pct floor (includes the +100 base ER)
  critRatioTarget?: number; // score.ts convention: cr/(cr+cd); 1:2 CR:CD ≈ 0.333
  objective: Objective;
  source: string; // KQM guide URL
}

export const META_TARGETS: Record<string, MetaTarget> = {
  furina: {
    characterKey: 'furina',
    setRequirement: { kind: '4pc', setKey: 'GoldenTroupe' },
    mains: { sands: 'hp_pct', goblet: 'elemental_dmg' },
    erTarget: 130,
    objective: 'crit_value',
    source: 'https://keqingmains.com/furina/',
  },
  nahida: {
    characterKey: 'nahida',
    setRequirement: { kind: '4pc', setKey: 'GildedDreams' },
    mains: { sands: 'em', goblet: 'em' },
    objective: 'crit_value',
    source: 'https://keqingmains.com/nahida/',
  },
  navia: {
    characterKey: 'navia',
    setRequirement: {
      kind: '4pc',
      setKey: 'NighttimeWhispersInTheEchoingWoods',
    },
    mains: { sands: 'atk_pct', goblet: 'elemental_dmg' },
    erTarget: 140,
    critRatioTarget: 0.333,
    objective: 'crit_value',
    source: 'https://keqingmains.com/navia/',
  },
  neuvillette: {
    characterKey: 'neuvillette',
    setRequirement: { kind: '4pc', setKey: 'MarechausseeHunter' },
    mains: { sands: 'hp_pct', goblet: 'elemental_dmg' },
    critRatioTarget: 0.333,
    objective: 'crit_value',
    source: 'https://keqingmains.com/neuvillette/',
  },
};

/** Translate a meta recipe into the optimiser's constraint shape. */
export function metaToConstraints(meta: MetaTarget): OptimizeConstraints {
  const c: OptimizeConstraints = {
    setRequirement: meta.setRequirement,
    mainStatLocks: meta.mains,
  };
  if (meta.erTarget != null) c.minStats = { er_pct: meta.erTarget };
  if (meta.critRatioTarget != null) c.critRatioTarget = meta.critRatioTarget;
  return c;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/meta/metaTargets.test.ts` (3 pass). Then `npm run typecheck` (clean).

- [ ] **Step 5: Add attribution to `DATA_LICENSE`**

Append to `DATA_LICENSE`:

```markdown
## Meta build recipes

The "meta build" recipes in `src/meta/metaTargets.ts` (recommended set, main stats,
and stat targets per character) are hand-adapted from the community guides at
KQM (KeqingMains, https://keqingmains.com). They are summaries of public guidance,
not copied text, and are used as an optional, overridable comparison target. Genshin
Impact and all related data are property of HoYoverse.
```

- [ ] **Step 6: Commit**

```bash
git add src/meta/metaTargets.ts src/meta/metaTargets.test.ts DATA_LICENSE
git commit -m "feat(meta): meta-target recipes + metaToConstraints"
```

---

## Task 3: "Use meta build" prefill button

**Files:**

- Modify: `src/components/OptimizePanel.tsx`
- Modify: `src/components/OptimizePanel.test.tsx`

- [ ] **Step 1: Add failing tests**

Append to `src/components/OptimizePanel.test.tsx` (it already imports `render`, `screen`, `useInventory`, `useOptimizeRequest`; add `userEvent`, `vi`, and `currentRequest`):

```ts
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { currentRequest } from '../state/optimizeRequest';

function addFlower() {
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
}

describe('OptimizePanel meta prefill', () => {
  beforeEach(() => {
    useInventory.getState().clear();
    useOptimizeRequest.getState().reset();
  });

  it('shows "Use meta build" for a character with a meta recipe', () => {
    addFlower();
    useOptimizeRequest.getState().setCharacterKey('furina');
    render(<OptimizePanel onRun={() => {}} running={false} />);
    expect(
      screen.getByRole('button', { name: /Use meta build/i }),
    ).toBeInTheDocument();
  });

  it('hides "Use meta build" for a character without a meta recipe', () => {
    useOptimizeRequest.getState().setCharacterKey('zzz_not_meta');
    render(<OptimizePanel onRun={() => {}} running={false} />);
    expect(
      screen.queryByRole('button', { name: /Use meta build/i }),
    ).toBeNull();
  });

  it('clicking "Use meta build" applies the meta constraints and runs', async () => {
    addFlower();
    useOptimizeRequest.getState().setCharacterKey('navia');
    const onRun = vi.fn();
    render(<OptimizePanel onRun={onRun} running={false} />);
    await userEvent.click(
      screen.getByRole('button', { name: /Use meta build/i }),
    );
    const c = currentRequest(useOptimizeRequest.getState()).constraints;
    expect(c.setRequirement).toEqual({
      kind: '4pc',
      setKey: 'NighttimeWhispersInTheEchoingWoods',
    });
    expect(onRun).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/components/OptimizePanel.test.tsx`
Expected: FAIL — no "Use meta build" button.

- [ ] **Step 3: Implement the button**

In `src/components/OptimizePanel.tsx`:

(a) Add imports after the existing ones:

```ts
import { META_TARGETS, metaToConstraints } from '../meta/metaTargets';
```

(b) Add the `applyPreset` selector with the other store selectors:

```ts
const applyPreset = useOptimizeRequest((s) => s.applyPreset);
```

(c) After the `hint` computation, derive the meta:

```ts
const meta = META_TARGETS[characterKey];
```

(d) Replace the footer action area — change:

```tsx
<button
  className={`btn-primary ${running ? 'animate-pulse-glow' : ''}`}
  disabled={!canRun || running}
  onClick={() => onRun()}
>
  {running ? 'Searching…' : 'Optimise'}
</button>
```

to:

```tsx
<div className="flex gap-2">
  {meta && (
    <button
      className="btn-ghost"
      disabled={!canRun || running}
      onClick={() => {
        applyPreset({
          characterKey,
          weaponKey,
          objective: meta.objective,
          constraints: metaToConstraints(meta),
        });
        onRun();
      }}
    >
      Use meta build
    </button>
  )}
  <button
    className={`btn-primary ${running ? 'animate-pulse-glow' : ''}`}
    disabled={!canRun || running}
    onClick={() => onRun()}
  >
    {running ? 'Searching…' : 'Optimise'}
  </button>
</div>
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/components/OptimizePanel.test.tsx` (all pass). Then `npm run typecheck` + `npm run lint` (clean).

- [ ] **Step 5: Format + commit**

```bash
npx prettier --write src/components/OptimizePanel.tsx src/components/OptimizePanel.test.tsx
git add src/components/OptimizePanel.tsx src/components/OptimizePanel.test.tsx
git commit -m "feat(ui): Use meta build prefill button"
```

---

## Task 4: `computeGapReport`

**Files:**

- Create: `src/meta/gap.ts`
- Create: `src/meta/gap.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/meta/gap.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { computeGapReport } from './gap';
import type { MetaTarget } from './metaTargets';
import type { Artifact, BuildResult, Slot, StatKey } from '../game/types';

const meta: MetaTarget = {
  characterKey: 'furina',
  setRequirement: { kind: '4pc', setKey: 'GoldenTroupe' },
  mains: { sands: 'hp_pct', goblet: 'elemental_dmg' },
  erTarget: 130,
  objective: 'crit_value',
  source: 'x',
};

let n = 0;
function art(slot: Slot, setKey: string, mainStat: StatKey): Artifact {
  return {
    id: `g${n++}`,
    setKey,
    slot,
    rarity: 5,
    level: 20,
    mainStat,
    mainStatValue: 1,
    subStats: [],
  };
}

/** A 4pc Golden Troupe inventory with the meta mains, so there are no feasibility gaps. */
function fullInventory(): Artifact[] {
  return [
    art('flower', 'GoldenTroupe', 'hp'),
    art('plume', 'GoldenTroupe', 'atk'),
    art('sands', 'GoldenTroupe', 'hp_pct'),
    art('goblet', 'GoldenTroupe', 'elemental_dmg'),
    art('circlet', 'GoldenTroupe', 'crit_rate'),
  ];
}

function build(
  totals: Partial<Record<StatKey, number>>,
  marginalBySlot = {},
): BuildResult {
  return {
    artifactIds: { flower: '', plume: '', sands: '', goblet: '', circlet: '' },
    totals,
    objectiveValue: 0,
    score: 0,
    diagnostics: {
      bindingConstraints: [],
      marginalBySlot,
      explored: 0,
      pruned: 0,
    },
  };
}

describe('computeGapReport', () => {
  it('flags a set feasibility gap and makes farming it the action', () => {
    const inv = [
      art('flower', 'GoldenTroupe', 'hp'),
      art('sands', 'EmblemOfSeveredFate', 'hp_pct'),
    ];
    const r = computeGapReport(meta, inv, null);
    expect(r.feasibility.some((f) => /Golden Troupe/.test(f))).toBe(true);
    expect(r.action).toMatch(/Farm Golden Troupe/);
  });

  it('flags a missing meta main stat', () => {
    // 4pc Golden Troupe present, but goblet main is wrong (no elemental_dmg goblet)
    const inv = [
      art('flower', 'GoldenTroupe', 'hp'),
      art('plume', 'GoldenTroupe', 'atk'),
      art('sands', 'GoldenTroupe', 'hp_pct'),
      art('goblet', 'GoldenTroupe', 'atk_pct'),
      art('circlet', 'GoldenTroupe', 'crit_rate'),
    ];
    const r = computeGapReport(meta, inv, null);
    expect(r.feasibility.some((f) => /Elemental DMG Goblet/i.test(f))).toBe(
      true,
    );
  });

  it('reports an ER shortfall vs the target', () => {
    const r = computeGapReport(meta, fullInventory(), build({ er_pct: 118 }));
    expect(r.shortfalls.some((s) => /ER 118% vs 130%/.test(s))).toBe(true);
  });

  it('names the weakest slot as the action when nothing is missing', () => {
    const r = computeGapReport(
      meta,
      fullInventory(),
      build(
        { er_pct: 140 },
        { flower: 50, plume: 50, sands: 50, goblet: 5, circlet: 50 },
      ),
    );
    expect(r.feasibility).toHaveLength(0);
    expect(r.action).toMatch(/Goblet contributes least/);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/meta/gap.test.ts`
Expected: FAIL — cannot find module `./gap`.

- [ ] **Step 3: Implement**

Create `src/meta/gap.ts`:

```ts
import type { Artifact, BuildResult, Slot, StatKey } from '../game/types';
import { SLOTS } from '../game/types';
import type { MetaTarget } from './metaTargets';
import {
  formatSetName,
  objectiveLabel,
  SLOT_LABELS,
  statLabel,
} from '../ui/labels';

export interface GapReport {
  characterKey: string;
  feasibility: string[]; // Level 1
  shortfalls: string[]; // Level 2
  action: string | null; // Level 3 — exactly one
}

function distinctSlots(inventory: Artifact[], setKey: string): number {
  const s = new Set<Slot>();
  for (const a of inventory) if (a.setKey === setKey) s.add(a.slot);
  return s.size;
}

/** The required set the inventory can't form, if any. */
function setGap(
  meta: MetaTarget,
  inventory: Artifact[],
): { setKey: string; have: number; need: number } | null {
  const req = meta.setRequirement;
  if (req.kind === '4pc') {
    const have = distinctSlots(inventory, req.setKey);
    return have < 4 ? { setKey: req.setKey, have, need: 4 } : null;
  }
  if (req.kind === '2pc') {
    const have = distinctSlots(inventory, req.setKey);
    return have < 2 ? { setKey: req.setKey, have, need: 2 } : null;
  }
  for (const setKey of req.setKeys) {
    const have = distinctSlots(inventory, setKey);
    if (have < 2) return { setKey, have, need: 2 };
  }
  return null;
}

function mainGaps(
  meta: MetaTarget,
  inventory: Artifact[],
): { slot: Slot; want: StatKey }[] {
  const gaps: { slot: Slot; want: StatKey }[] = [];
  for (const slot of Object.keys(meta.mains) as Slot[]) {
    const want = meta.mains[slot];
    if (!want) continue;
    if (!inventory.some((a) => a.slot === slot && a.mainStat === want))
      gaps.push({ slot, want });
  }
  return gaps;
}

export function computeGapReport(
  meta: MetaTarget,
  inventory: Artifact[],
  build: BuildResult | null,
): GapReport {
  // Level 1 — feasibility (inventory vs recipe)
  const feasibility: string[] = [];
  const sg = setGap(meta, inventory);
  if (sg)
    feasibility.push(
      `You own ${sg.have} ${formatSetName(sg.setKey)} piece${sg.have === 1 ? '' : 's'} across slots — need ${sg.need} for the meta set.`,
    );
  const mg = mainGaps(meta, inventory);
  for (const g of mg)
    feasibility.push(
      `You own no ${statLabel(g.want)} ${SLOT_LABELS[g.slot]} (meta wants ${statLabel(g.want)} ${SLOT_LABELS[g.slot]}).`,
    );

  // Level 2 — numeric shortfall (best build vs targets)
  const shortfalls: string[] = [];
  if (build) {
    if (meta.erTarget != null) {
      const have = build.totals.er_pct ?? 0;
      if (have < meta.erTarget)
        shortfalls.push(
          `Best build reaches ER ${have.toFixed(0)}% vs ${meta.erTarget}% target — short by ${(meta.erTarget - have).toFixed(0)}%.`,
        );
    }
    if (meta.critRatioTarget != null) {
      const cr = build.totals.crit_rate ?? 0;
      const cd = build.totals.crit_dmg ?? 0;
      if (cr + cd > 0) {
        const ratio = cr / (cr + cd);
        if (Math.abs(ratio - meta.critRatioTarget) > 0.05) {
          const haveX = cr > 0 ? (cd / cr).toFixed(1) : '∞';
          const targetX =
            meta.critRatioTarget > 0
              ? ((1 - meta.critRatioTarget) / meta.critRatioTarget).toFixed(1)
              : '∞';
          shortfalls.push(
            `Crit ratio is 1:${haveX} vs meta's ~1:${targetX} — ${ratio > meta.critRatioTarget ? 'favour CRIT DMG' : 'favour CRIT Rate'}.`,
          );
        }
      }
    }
  }

  // Level 3 — exactly one grounded action (prioritised)
  let action: string | null = null;
  if (sg) {
    action = `Farm ${formatSetName(sg.setKey)} — you can't form the meta set yet.`;
  } else if (mg.length > 0) {
    action = `Farm a ${statLabel(mg[0].want)} ${SLOT_LABELS[mg[0].slot]} — the meta wants it and you have none.`;
  } else if (build) {
    let weakest: Slot | null = null;
    let min = Infinity;
    for (const slot of SLOTS) {
      const v = build.diagnostics.marginalBySlot[slot];
      if (v != null && v < min) {
        min = v;
        weakest = slot;
      }
    }
    if (weakest)
      action = `Your ${SLOT_LABELS[weakest]} contributes least to ${objectiveLabel(meta.objective)} — upgrading it has the most upside.`;
  }

  return { characterKey: meta.characterKey, feasibility, shortfalls, action };
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/meta/gap.test.ts` (4 pass). Then `npm run typecheck` (clean).

- [ ] **Step 5: Commit**

```bash
git add src/meta/gap.ts src/meta/gap.test.ts
git commit -m "feat(meta): computeGapReport (feasibility / shortfall / action)"
```

---

## Task 5: `GapReport` UI + App wiring

**Files:**

- Create: `src/components/GapReport.tsx`
- Create: `src/components/GapReport.test.tsx`
- Modify: `src/components/App.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/GapReport.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GapReport } from './GapReport';

describe('GapReport', () => {
  it('renders feasibility, shortfall, and the action', () => {
    render(
      <GapReport
        report={{
          characterKey: 'x',
          feasibility: ['You own no HP% Sands'],
          shortfalls: ['ER short by 8%'],
          action: 'Farm Golden Troupe',
        }}
      />,
    );
    expect(screen.getByText(/no HP% Sands/)).toBeInTheDocument();
    expect(screen.getByText(/ER short by 8%/)).toBeInTheDocument();
    expect(screen.getByText(/Farm Golden Troupe/)).toBeInTheDocument();
  });

  it('shows the all-met state when there are no gaps or shortfalls', () => {
    render(
      <GapReport
        report={{
          characterKey: 'x',
          feasibility: [],
          shortfalls: [],
          action: null,
        }}
      />,
    );
    expect(screen.getByText(/already build the meta/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/components/GapReport.test.tsx`
Expected: FAIL — cannot find module `./GapReport`.

- [ ] **Step 3: Implement the component**

Create `src/components/GapReport.tsx`:

```tsx
import type { GapReport as GapReportData } from '../meta/gap';

export function GapReport({ report }: { report: GapReportData }) {
  const allMet =
    report.feasibility.length === 0 && report.shortfalls.length === 0;
  return (
    <div className="panel space-y-3">
      <h2 className="font-display text-lg font-bold tracking-wide text-parchment">
        Gap vs meta build
      </h2>

      {allMet && (
        <p className="text-sm text-jade">
          Your gear can already build the meta — nice.
        </p>
      )}

      {report.feasibility.length > 0 && (
        <div>
          <p className="field-label">What&apos;s missing</p>
          <ul className="space-y-1 text-sm text-parchment/90">
            {report.feasibility.map((f, i) => (
              <li key={i}>• {f}</li>
            ))}
          </ul>
        </div>
      )}

      {report.shortfalls.length > 0 && (
        <div>
          <p className="field-label">Shortfall</p>
          <ul className="space-y-1 text-sm text-parchment/90">
            {report.shortfalls.map((s, i) => (
              <li key={i}>• {s}</li>
            ))}
          </ul>
        </div>
      )}

      {report.action && (
        <div className="rounded-lg border border-mora/25 bg-mora/10 px-3 py-2 text-sm text-mora-bright">
          <span className="font-semibold">Next:</span> {report.action}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run the component test**

Run: `npx vitest run src/components/GapReport.test.tsx` (2 pass).

- [ ] **Step 5: Wire into App**

In `src/components/App.tsx`:

(a) Add imports:

```ts
import { GapReport } from './GapReport';
import { META_TARGETS } from '../meta/metaTargets';
import { computeGapReport } from '../meta/gap';
```

(b) Replace the Results block:

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

with:

```tsx
{
  result && request && (
    <div id="results-section">
      <Section n={3} title="Results" delay="0s">
        {!sharedArtifacts && META_TARGETS[request.characterKey] && (
          <div className="mb-4">
            <GapReport
              report={computeGapReport(
                META_TARGETS[request.characterKey],
                artifacts,
                result.builds[0] ?? null,
              )}
            />
          </div>
        )}
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

- [ ] **Step 6: Verify**

Run: `npm test` (report counts), `npm run typecheck` (clean), `npm run lint` (clean). All pass; `App.test` unaffected (the gap report only renders when a meta exists and a result is present — App.test renders no results).

- [ ] **Step 7: Format + commit**

```bash
npx prettier --write src/components/GapReport.tsx src/components/GapReport.test.tsx src/components/App.tsx
git add src/components/GapReport.tsx src/components/GapReport.test.tsx src/components/App.tsx
git commit -m "feat(ui): gap-vs-meta report in results"
```

---

## Final verification

- [ ] `npm run typecheck` — clean.
- [ ] `npm run lint` — clean.
- [ ] `npm test` — all pass (adapter sets, metaTargets, gap, GapReport, OptimizePanel, plus existing suite).
- [ ] `npm run format:check` — Prettier-clean (run `npx prettier --write <changed files>` if needed; never `prettier --write .`).
- [ ] `npm run build` — production build succeeds.
- [ ] Manual smoke (optional, `npm run dev`): select Furina → "Use meta build" appears → click → results + a "Gap vs meta build" report; load sample gear (Furina preset) and confirm the gap report flags farming Golden Troupe.

---

## Self-review

**Spec coverage:**

- §2 dataset retain-all-sets + regen → Task 1. ✓
- §3 meta data (MetaTarget, META_TARGETS, metaToConstraints, attribution) → Task 2. ✓
- §4 "Use meta build" prefill via the request store → Task 3. ✓
- §5 computeGapReport (L1/L2/L3 from inventory + diagnostics) → Task 4. ✓
- §6 GapReport UI + App placement (meta character, fresh non-shared build, renders when infeasible via `build = null`) → Task 5. ✓
- §7 edge cases: no meta (button/report absent — Task 3/5 guards), infeasible (`result.builds[0] ?? null`), shared build (`!sharedArtifacts`), optimised-without-prefill (report always compares to meta) → covered. ✓
- §8 testing per layer → Tasks 1–5 tests. ✓
- §9 acceptance criteria → Final verification. ✓

**Placeholder scan:** none — every step has concrete code/commands. Task 1 Step 4's diff check is an explicit verification instruction with exact commands, not a placeholder.

**Type consistency:** `MetaTarget`, `META_TARGETS`, `metaToConstraints`, `GapReport`, `computeGapReport(meta, inventory, build)` are defined in Tasks 2/4 and consumed identically in Tasks 3/5. `SetRequirement`, `OptimizeConstraints`, `Slot`, `StatKey`, `Objective`, `Artifact`, `BuildResult`, `SLOTS` match `src/game/types.ts`. `applyPreset` / `currentRequest` match the `useOptimizeRequest` store from the example-gear feature. `formatSetName`/`statLabel`/`SLOT_LABELS`/`objectiveLabel` exist in `src/ui/labels.ts`.
