# Deepening #1 — One Optimisation Entry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Collapse the three-step "run an optimisation" pipeline into one deep entry — `optimize(request, inventory, adapter?)` — that owns context assembly, worker dispatch, and the synchronous fallback, so callers wire nothing.

**Architecture:** The pure branch-and-bound search (`optimize` in `search.ts`) is renamed `searchBuilds` and becomes an optimizer-internal export used only by the worker, the benchmark, and the correctness oracle. A new public `optimize` in `optimizeClient.ts` builds the `OptimizeContext` from the `GameAdapter` (defaulting to Genshin, honouring ADR-0008) and dispatches to the worker, falling back to a synchronous call where `Worker` is unavailable. `buildContext` stays but is no longer wired by any caller. The untyped `postMessage` gains the shared `WorkerRequest` type. No behaviour changes.

**Tech Stack:** TypeScript (strict), Vitest, Vite Web Workers, Zustand. Run commands with `npm`.

**Spec:** `docs/superpowers/specs/2026-06-19-architecture-deepenings-design.md` (section #1).

**Branch:** Work on a feature branch off the latest `origin/main` (e.g. `refactor/deepen-optimise-entry`) — do not commit to `main`.

---

### Task 1: Rename the pure search `optimize` → `searchBuilds`

The pure branch-and-bound search is currently exported as `optimize`, colliding with the two wiring functions. Rename it to `searchBuilds`. It has three importers: `search.test.ts`, `benchmark.ts`, `optimize.worker.ts`. `bruteForce` is untouched.

**Files:**
- Modify: `src/optimizer/search.ts:97`
- Modify: `src/optimizer/search.test.ts:2,46,49,57,67,79,135,147` (import, `describe` label, all call sites)
- Modify: `src/optimizer/benchmark.ts:12,192`
- Modify: `src/workers/optimize.worker.ts:1,13`

- [ ] **Step 1: Update the test to expect the new name (make it fail first)**

In `src/optimizer/search.test.ts`, change the import on line 2:

```ts
import { searchBuilds, bruteForce } from './search';
```

Change the `describe` label on line 46:

```ts
describe('searchBuilds', () => {
```

Replace every `optimize(` call in this file with `searchBuilds(`. There are seven, in these tests:
- `returns NO_FEASIBLE_BUILD when a slot pool is empty` → `const r = searchBuilds(req, inv, ctx);`
- `finds the maximum crit_value build` → `const r = searchBuilds(req, inv, ctx);`
- `honours a minStats constraint (infeasible)` → `const r = searchBuilds({ ...req, constraints: { minStats: { crit_dmg: 1000 } } }, inv, ctx);`
- `branch-and-bound matches brute force...` → `const bnb = searchBuilds(req, inv, ctx);`
- `matches brute force with set bonuses active...` → `const bnb = searchBuilds(reqEr, inv, ctxSets);`
- `applies an anti-clone cap...` → `const r = searchBuilds({ ...req, topK: 5 }, inv, ctx);`
- `emits explored/pruned counts...` → `const r = searchBuilds(req, inv, ctx);`

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/optimizer/search.test.ts`
Expected: FAIL — `"searchBuilds" is not exported by ... search.ts` (or a transform/import error).

- [ ] **Step 3: Rename the export in `search.ts`**

In `src/optimizer/search.ts` line 97, change:

```ts
export function searchBuilds(
  req: OptimizeRequest,
  inventory: Artifact[],
  ctx: OptimizeContext,
): OptimizeResult {
```

(Body unchanged. `bruteForce` and all internal helpers stay as-is.)

- [ ] **Step 4: Update the other two importers**

In `src/workers/optimize.worker.ts` line 1:

```ts
import { searchBuilds } from '../optimizer/search';
```

and line 13:

```ts
    const result = searchBuilds(req, inventory, ctx);
```

In `src/optimizer/benchmark.ts` line 12:

```ts
import { searchBuilds } from './search';
```

and line 192:

```ts
        const res = searchBuilds(req, inv, ctx);
```

- [ ] **Step 5: Verify no stale `optimize` import from `./search` remains**

Run: `git grep -n "from './search'" src && git grep -n "from '../optimizer/search'" src`
Expected: every match imports `searchBuilds` and/or `bruteForce` — no bare `optimize`.

- [ ] **Step 6: Run the affected suites + typecheck**

Run: `npm test -- src/optimizer/search.test.ts && npm run typecheck`
Expected: PASS (search tests green; `tsc -b` clean).

- [ ] **Step 7: Commit**

```bash
git add src/optimizer/search.ts src/optimizer/search.test.ts src/optimizer/benchmark.ts src/workers/optimize.worker.ts
git commit -m "refactor: rename pure search optimize -> searchBuilds"
```

---

### Task 2: Deep `optimize` entry in `optimizeClient.ts`

Replace `runOptimize(req, inv, ctx)` + `optimizeFor(req, inv)` with one public `optimize(request, inventory, adapter = genshinAdapter)`. The worker dispatch/fallback moves into a private `dispatch` helper; `optimize` builds the context then calls it. Type the worker message with the shared `WorkerRequest`.

**Files:**
- Modify (rewrite): `src/workers/optimizeClient.ts`
- Modify (rewrite): `src/workers/optimizeClient.test.ts`

- [ ] **Step 1: Rewrite the test to drive the deep entry (fail first)**

Replace the entire contents of `src/workers/optimizeClient.test.ts` with:

```ts
import { describe, it, expect } from 'vitest';
import { optimize } from './optimizeClient';
import { genshinAdapter } from '../game/genshin/adapter';
import type { Artifact, OptimizeRequest } from '../game/types';
import { SLOTS } from '../game/types';

let c = 0;
const inv: Artifact[] = SLOTS.flatMap((slot) =>
  [0, 1].map((i) => ({
    id: `i${c++}`,
    setKey: 'A',
    slot,
    rarity: 5,
    level: 20,
    mainStat: 'crit_rate' as const,
    mainStatValue: i,
    subStats: [],
  })),
);

describe('optimize (deep entry, sync fallback)', () => {
  it('builds context from the adapter and resolves with builds', async () => {
    const chars = genshinAdapter.characters();
    const weapons = genshinAdapter.weapons();
    const req: OptimizeRequest = {
      characterKey: chars[0].key,
      weaponKey: weapons[0].key,
      buildLevel: 90,
      constraints: {},
      objective: 'crit_value',
      topK: 3,
    };
    const r = await optimize(req, inv);
    expect(r.builds.length).toBeGreaterThan(0);
  });
});
```

Note: this exercises the full deep path (real adapter → `buildContext` → synchronous `searchBuilds`). It relies on the same test environment as the original suite, where `typeof Worker === 'undefined'` so the fallback runs.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/workers/optimizeClient.test.ts`
Expected: FAIL — `optimize` is not exported by `optimizeClient` (the module still exports `runOptimize`/`optimizeFor`).

- [ ] **Step 3: Rewrite `optimizeClient.ts`**

Replace the entire contents of `src/workers/optimizeClient.ts` with:

```ts
import type {
  Artifact,
  OptimizeContext,
  OptimizeRequest,
  OptimizeResult,
} from '../game/types';
import type { GameAdapter } from '../game/GameAdapter';
import { genshinAdapter } from '../game/genshin/adapter';
import { buildContext } from '../optimizer/context';
import { searchBuilds } from '../optimizer/search';
import type { WorkerRequest } from './optimize.worker';

/** Dispatch a fully-built request to the worker, with a synchronous fallback
 *  for environments without Worker (tests, SSR). */
function dispatch(
  req: OptimizeRequest,
  inventory: Artifact[],
  ctx: OptimizeContext,
): Promise<OptimizeResult> {
  if (typeof Worker === 'undefined') {
    return Promise.resolve(searchBuilds(req, inventory, ctx));
  }
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./optimize.worker.ts', import.meta.url), {
      type: 'module',
    });
    worker.onmessage = (e: MessageEvent) => {
      if (e.data.type === 'done') {
        resolve(e.data.result as OptimizeResult);
        worker.terminate();
      } else if (e.data.type === 'error') {
        reject(new Error(e.data.message));
        worker.terminate();
      } else {
        reject(new Error(`Unexpected worker message: ${String(e.data?.type)}`));
        worker.terminate();
      }
    };
    worker.onerror = (e) => {
      reject(new Error(e.message));
      worker.terminate();
    };
    const message: WorkerRequest = { req, inventory, ctx };
    worker.postMessage(message);
  });
}

/**
 * The optimiser: build the game context for a request and return the top builds
 * over an inventory. Owns context assembly + worker dispatch + sync fallback, so
 * callers wire nothing. Game-agnostic via the adapter (defaults to Genshin,
 * ADR-0008).
 */
export function optimize(
  request: OptimizeRequest,
  inventory: Artifact[],
  adapter: GameAdapter = genshinAdapter,
): Promise<OptimizeResult> {
  const ctx = buildContext(adapter, request);
  return dispatch(request, inventory, ctx);
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/workers/optimizeClient.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/workers/optimizeClient.ts src/workers/optimizeClient.test.ts
git commit -m "refactor: single deep optimize() entry owning context + dispatch"
```

---

### Task 3: Update the App call site

`App.tsx` is the only consumer of the old `optimizeFor`. Point it at the new `optimize`.

**Files:**
- Modify: `src/components/App.tsx:15,91`

- [ ] **Step 1: Confirm App is the only remaining consumer**

Run: `git grep -n "optimizeFor\|runOptimize" src`
Expected: matches only in `src/components/App.tsx` (the old import + call). If anything else appears, update it the same way in this task.

- [ ] **Step 2: Update the import**

In `src/components/App.tsx` line 15, change:

```ts
import { optimize } from '../workers/optimizeClient';
```

- [ ] **Step 3: Update the call in `runCurrent`**

In `src/components/App.tsx` line 91, change:

```ts
      const r = await optimize(req, inv);
```

- [ ] **Step 4: Verify the rename is complete**

Run: `git grep -n "optimizeFor\|runOptimize" src`
Expected: no matches.

- [ ] **Step 5: Run the App test + typecheck**

Run: `npm test -- src/components/App.test.tsx && npm run typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/App.tsx
git commit -m "refactor: App uses the deep optimize() entry"
```

---

### Task 4: Full verification

Confirm the whole suite, lint, build, and formatting are clean before opening a PR.

**Files:** none (verification only).

- [ ] **Step 1: Full test suite**

Run: `npm test`
Expected: all suites PASS (notably `search.test.ts`, `optimizeClient.test.ts`, `App.test.tsx`).

- [ ] **Step 2: Typecheck (app + api projects)**

Run: `npm run typecheck`
Expected: clean (`tsc -b` + the `api` project check).

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 4: Production build (exercises the real Web Worker bundling)**

Run: `npm run build`
Expected: build succeeds, no worker/import resolution errors.

- [ ] **Step 5: Format check on changed files only**

> Note: a full-repo `npm run format:check` fails on Windows checkouts due to CRLF — that is a pre-existing line-ending artifact, not a real failure (CI checks out LF and passes). Verify only the files this branch touched:

Run: `git diff --name-only main...HEAD | grep -E '\.(ts|tsx)$' | xargs npx prettier --check`
Expected: "All matched files use Prettier code style!" If any file is flagged, run `npx prettier --write` on it, confirm `git diff` shows only formatting, and commit.

- [ ] **Step 6: Final commit (only if Step 5 reformatted anything)**

```bash
git add -A
git commit -m "style: prettier formatting"
```

---

## Self-Review

**Spec coverage (section #1):**
- One public deep entry `optimize(request, inventory, adapter=genshinAdapter)` → Task 2. ✓
- Inner search renamed `optimize`→`searchBuilds`, kept for benchmark + oracle → Task 1. ✓
- `buildContext` stays, private to the optimiser, no caller wires it → Tasks 2 (it's called inside `optimize`) + 3 (App stops wiring). `context.ts` and `context.test.ts` unchanged — `buildContext` remains exported for its own unit test (internal-seam test). ✓
- Shared `WorkerRequest` type on `postMessage` → Task 2 (imported from `optimize.worker.ts`, applied to `message`). ✓
- Delete `optimizeFor` + caller-facing `runOptimize` → Task 2 (removed) + Task 3 (call site moved). ✓
- `benchmark.ts` keeps direct `searchBuilds` for sync timing → Task 1 (import + call updated, still direct). ✓
- ADR-0008 honoured (adapter param) → Task 2. No behaviour change → verified by unchanged `search.test.ts` oracle assertions (Task 1) + full suite (Task 4). ✓

**Placeholder scan:** No TBDs; every code step shows full code; every command states expected output. ✓

**Type consistency:** `searchBuilds(req, inventory, ctx): OptimizeResult` (Task 1) is called with that exact signature in `optimize.worker.ts`, `benchmark.ts`, and inside `dispatch` (Task 2). The public `optimize(request, inventory, adapter?): Promise<OptimizeResult>` (Task 2) is called as `optimize(req, inv)` in the test (Task 2) and App (Task 3). `WorkerRequest { req, inventory, ctx }` matches the object built in `dispatch`. ✓

---

**Plan complete.** After #1 lands and merges, the next plan (`#2 — GapSection`) gets written the same way.
