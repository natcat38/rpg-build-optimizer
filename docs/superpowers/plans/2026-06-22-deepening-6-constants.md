# Deepening #6 — Concentrate constants & formulas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove four duplications so each fact lives in one place: the stat-key list, the stat/objective labels, the crit-value formula, and the `Objective` type guard. No user-facing behaviour change (one intended consolidation: diagnostics' ad-hoc labels unify onto the canonical set — see Task 2).

**Spec:** `docs/superpowers/specs/2026-06-19-architecture-deepenings-design.md` (section #6). The `isObjective` consolidation (Task 3) is a follow-up surfaced by deepening #5's review — folded here because #6 is about concentrating shared kernels.

**Tech Stack:** TypeScript (strict), React 18, Vitest. Run commands with `npm`.

**Branch:** `refactor/deepen-constants` (already created off `main`). Do not commit to `main`.

**ADR-0004:** Task 1(c) shares the crit-value _formula_ only, not the pruning bound's admissible optimism — `objectiveContribution` keeps its own per-piece accumulation and merely calls the shared kernel for the final `cr*2+cd`. Honoured.

---

### Task 1: Share the crit-value kernel (c) and derive STAT_KEYS (a)

**Files:** `src/optimizer/score.ts`, `src/optimizer/search.ts`, `src/game/types.ts`, `src/game/genshin/adapter.ts`

- [ ] **Step 1 (c): add `critValue` to `score.ts`**

In `src/optimizer/score.ts`, add an exported kernel and route `objectiveValue` through it. Replace:

```ts
export function objectiveValue(t: StatVec, objective: Objective): number {
  if (objective === 'crit_value')
    return (t.crit_rate ?? 0) * 2 + (t.crit_dmg ?? 0);
  return t[objective] ?? 0;
}
```

with:

```ts
/** Crit value: CRIT Rate weighted 2:1 against CRIT DMG. The one place this
 *  formula lives — both the score and the search pruning bound call it. */
export function critValue(cr: number, cd: number): number {
  return cr * 2 + cd;
}

export function objectiveValue(t: StatVec, objective: Objective): number {
  if (objective === 'crit_value')
    return critValue(t.crit_rate ?? 0, t.crit_dmg ?? 0);
  return t[objective] ?? 0;
}
```

- [ ] **Step 2 (c): use `critValue` in `search.ts`**

In `src/optimizer/search.ts`, add `critValue` to the existing score import:

```ts
import {
  totals,
  objectiveValue,
  satisfies,
  critRatioPenalty,
  critValue,
} from './score';
```

In `objectiveContribution`, replace the final `return cr * 2 + cd;` with `return critValue(cr, cd);`. Leave the per-piece `cr`/`cd` accumulation above it unchanged (ADR-0004: the bound keeps its own accumulation).

- [ ] **Step 3 (a): export `STAT_KEYS` from `types.ts`**

In `src/game/types.ts`, change `const STAT_KEYS = [` to `export const STAT_KEYS = [` (keep the `as const`). No other change — `StatKey`/`isStatKey` already derive from it.

- [ ] **Step 4 (a): derive the adapter's stat keys from `types.STAT_KEYS`**

In `src/game/genshin/adapter.ts`:

- Delete the local `const STAT_KEYS: StatKey[] = [ … 13 entries … ];`.
- Add `STAT_KEYS` to the runtime import from `../types`: `import { SLOTS, STAT_KEYS } from '../types';`.
- Change the adapter field to spread the readonly tuple into the mutable `StatKey[]` the interface expects: `statKeys: [...STAT_KEYS],`.

(`StatKey` may now be unused as a named type import in this file — if lint flags it, remove it from the `import type` line; if it's still used elsewhere in the file, leave it.)

- [ ] **Step 5: Verify** — `npm test` (existing `score.test.ts`, `search.test.ts`, `adapter.test.ts` cover the formula + stat keys and must still pass), `npm run typecheck`, `npm run lint`.

- [ ] **Step 6: Commit**

```bash
git add src/optimizer/score.ts src/optimizer/search.ts src/game/types.ts src/game/genshin/adapter.ts
git commit -m "refactor: share critValue kernel; derive adapter STAT_KEYS from types (#6 a,c)"
```

---

### Task 2: Move canonical labels to a neutral home (b)

**Files:** create `src/labels.ts`; modify `src/ui/labels.ts`, `src/meta/gap.ts`, `src/optimizer/diagnostics.ts`, `src/ai/explainShared.ts`

- [ ] **Step 1: Create `src/labels.ts`** — the canonical, non-UI label data + helpers (moved verbatim from `ui/labels.ts`):

```ts
import type { Objective, Slot, StatKey } from './game/types';

/** Human-friendly display names for stat keys. */
export const STAT_LABELS: Record<StatKey, string> = {
  hp: 'HP',
  hp_pct: 'HP%',
  atk: 'ATK',
  atk_pct: 'ATK%',
  def: 'DEF',
  def_pct: 'DEF%',
  em: 'Elemental Mastery',
  er_pct: 'Energy Recharge',
  crit_rate: 'CRIT Rate',
  crit_dmg: 'CRIT DMG',
  elemental_dmg: 'Elemental DMG',
  physical_dmg: 'Physical DMG',
  healing: 'Healing Bonus',
};

/** Display names for optimization objectives (stat keys plus crit value). */
export const OBJECTIVE_LABELS: Record<Objective, string> = {
  crit_value: 'Crit Value',
  ...STAT_LABELS,
};

export const SLOT_LABELS: Record<Slot, string> = {
  flower: 'Flower',
  plume: 'Plume',
  sands: 'Sands',
  goblet: 'Goblet',
  circlet: 'Circlet',
};

export function statLabel(key: StatKey): string {
  return STAT_LABELS[key] ?? key;
}

export function objectiveLabel(obj: Objective): string {
  return OBJECTIVE_LABELS[obj] ?? obj;
}

/** Turn a PascalCase set key (e.g. "EmblemOfSeveredFate") into spaced words. */
export function formatSetName(setKey: string): string {
  return setKey
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .trim();
}
```

- [ ] **Step 2: Reduce `src/ui/labels.ts` to a re-export + the UI-only glyphs**

Replace the entire file with:

```ts
import type { Slot } from '../game/types';

// Canonical labels live in src/labels.ts (neutral, no domain→ui dependency).
// Components keep importing from here; this re-exports plus the UI-only glyphs.
export * from '../labels';

/** A small glyph per slot for compact, scannable build lists. */
export const SLOT_GLYPH: Record<Slot, string> = {
  flower: '✿',
  plume: '⟁',
  sands: '⧖',
  goblet: '♟',
  circlet: '◆',
};
```

(Components importing `STAT_LABELS`/`statLabel`/`SLOT_LABELS`/`formatSetName`/`SLOT_GLYPH`/etc. from `../ui/labels` keep working unchanged.)

- [ ] **Step 3: Point non-UI consumers at `src/labels.ts`**

- `src/meta/gap.ts`: change the import block `from '../ui/labels'` → `from '../labels'` (same named imports: `formatSetName, objectiveLabel, SLOT_LABELS, statLabel`).
- `src/ai/explainShared.ts`: change `import { objectiveLabel, statLabel } from '../ui/labels';` → `from '../labels';`.
- `src/optimizer/diagnostics.ts`: delete the private `const STAT_LABEL: Partial<Record<StatKey, string>> = { … };`, add `import { statLabel } from '../labels';`, and change the binding-constraint line from `` `${STAT_LABEL[k] ?? k} ≥ …` `` to `` `${statLabel(k)} ≥ …` ``. (If `StatKey` becomes an unused type import after removing the private map, drop it from the `import type` line — but it is still used by the `as StatKey[]` cast in the loop, so keep it.)

> Intended consolidation: diagnostics previously printed `Crit Rate`/`Crit DMG`; the canonical labels say `CRIT Rate`/`CRIT DMG`. After this change diagnostics uses the canonical text. No test asserts the old text (verified). This is the duplication #6(b) exists to remove.

- [ ] **Step 4: Verify no stale references** — `git grep -n "STAT_LABEL\b" -- src` returns nothing (the private map is gone); `git grep -n "ui/labels" -- src/meta src/optimizer src/ai` returns nothing (non-UI code now uses `src/labels`).

- [ ] **Step 5: Verify** — `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` (build confirms components still resolve their `ui/labels` imports via the re-export).

- [ ] **Step 6: Commit**

```bash
git add src/labels.ts src/ui/labels.ts src/meta/gap.ts src/optimizer/diagnostics.ts src/ai/explainShared.ts
git commit -m "refactor: canonical labels in src/labels.ts; drop domain→ui label dep (#6 b)"
```

---

### Task 3: Single `isObjective` in `types.ts` (d)

**Files:** `src/game/types.ts`, `src/share/url.ts`, `src/ai/explainShared.ts`

- [ ] **Step 1: Add the guard to `types.ts`** — directly below `isStatKey`:

```ts
export function isObjective(x: unknown): x is Objective {
  return x === 'crit_value' || isStatKey(x);
}
```

(`Objective` is already declared in `types.ts` further down — a function can reference a type declared later in the same module. If TS complains about use-before-declaration for the _type_, it won't: type positions are hoisted. Place the function after `isStatKey`.)

- [ ] **Step 2: Use it in `src/share/url.ts`** — delete the private `function isObjective(…)`, and add `isObjective` to the runtime import from `../game/types`: `import { isStatKey, isObjective, BUILD_LEVELS, SLOTS } from '../game/types';`.

- [ ] **Step 3: Use it in `src/ai/explainShared.ts`** — delete the private `function isObjective(…)`, and add `isObjective` to its runtime import from `../game/types` (currently `import { isStatKey } from '../game/types';` → `import { isStatKey, isObjective } from '../game/types';`).

- [ ] **Step 4: Verify no duplicate definitions** — `git grep -n "function isObjective" -- src` returns ONLY `src/game/types.ts`.

- [ ] **Step 5: Verify** — `npm test`, `npm run typecheck`, `npm run lint`.

- [ ] **Step 6: Commit**

```bash
git add src/game/types.ts src/share/url.ts src/ai/explainShared.ts
git commit -m "refactor: single isObjective guard in types (#6 d)"
```

---

### Task 4: Full verification

- [ ] **Step 1:** `npm test` — all suites PASS.
- [ ] **Step 2:** `npm run typecheck` — clean.
- [ ] **Step 3:** `npm run lint` — no errors.
- [ ] **Step 4:** `npm run build` — succeeds.
- [ ] **Step 5: Format check on changed files only** (full-repo `format:check` false-fails on Windows CRLF; the `verify` CI job DOES check Markdown — keep `.md`):

Run: `git diff --name-only main...HEAD | grep -E '\.(ts|tsx|md)$' | grep -v package-lock | xargs -r ls -d 2>/dev/null | xargs npx prettier --check`
Expected: "All matched files use Prettier code style!" If a new/edited file is flagged, `npx prettier --write` it, confirm via `git diff` the change is real (not line-ending only), commit only real changes.

- [ ] **Step 6: Final commit** (only if Step 5 reformatted real content): `git add -A && git commit -m "style: prettier formatting"`.

---

## Self-Review

**Spec coverage (section #6):**

- (a) `genshinAdapter.statKeys` derives from `types.STAT_KEYS` (exported, spread) — Task 1 Steps 3–4. ✓
- (b) canonical labels in neutral `src/labels.ts`; `ui/labels.ts` re-exports + keeps `SLOT_GLYPH`; `meta/gap.ts`, `optimizer/diagnostics.ts` (and `ai/explainShared.ts`, also non-UI) import from `src/labels.ts` — Task 2. ✓ Removes the domain→ui label dependency. ✓
- (c) `critValue(cr, cd)` kernel in `score.ts`; both `objectiveValue` and `search.ts:objectiveContribution` call it — Task 1 Steps 1–2. ADR-0004 honoured (formula shared, not the bound's optimism). ✓
- (d) single `isObjective` in `types.ts`; `url.ts` + `explainShared.ts` drop their private copies — Task 3. ✓

**Behaviour:** the only text change is diagnostics' binding-constraint labels unifying to the canonical `CRIT …` spelling (no test pins the old text). All formula/stat-key/label values are preserved verbatim. Existing `score.test.ts`/`search.test.ts`/`adapter.test.ts`/label-consuming tests guard the rest. ✓

**Placeholder scan:** full code for every new/replaced block. ✓

**Type consistency:** `critValue(cr: number, cd: number): number`; `STAT_KEYS` spread → `StatKey[]` matches `GameAdapter.statKeys`; `isObjective(x: unknown): x is Objective` matches the two private copies it replaces; `src/labels.ts` exports identical types to the moved declarations. ✓
