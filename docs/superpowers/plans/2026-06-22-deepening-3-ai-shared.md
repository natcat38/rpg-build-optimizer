# Deepening #3 — Two ai modules + assembly helper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Collapse the three AI files into a clean server/browser seam: one `explainShared.ts` (validation + prompt + a new `toExplainPayload` assembly helper, all server-safe) and the unchanged browser `explainClient.ts`. `ExplainBuild` stops hand-mirroring `GapReport` fields.

**Architecture:** Today `explainPayload.ts` (types + validation, imported by both runtimes) and `explainPrompt.ts` (server-only prompt) are separate, and `ExplainBuild.tsx` hand-builds the `gap` payload by mirroring `GapReport` fields — silent drift if `GapReport` gains a field. Merge `explainPayload.ts` + `explainPrompt.ts` into `src/ai/explainShared.ts` and add `toExplainPayload(characterKey, objective, totals, report)`. `explainClient.ts` (browser `fetch`) stays separate — the real server/browser seam. `api/explain.ts` imports `explainShared`; `ExplainBuild` imports `explainClient` + `toExplainPayload`.

**Tech Stack:** TypeScript (strict), React 18, Vitest. Run commands with `npm`.

**Spec:** `docs/superpowers/specs/2026-06-19-architecture-deepenings-design.md` (section #3).

**Branch:** `refactor/deepen-ai-shared` (create off `main`). Do not commit to `main`.

**ADR-0010 constraint:** the browser bundle must never pull the server path (Anthropic SDK / prompt). `explainShared.ts` stays DOM-free and Node-free (pure TS + game types). `explainClient.ts` is the only browser transport. Do not import `explainShared`'s prompt into anything that would force the SDK into the client bundle — it doesn't import the SDK, so this holds.

---

### Task 1: Create `explainShared.ts` (merge payload + prompt, add `toExplainPayload`) — TDD

**Files:**

- Create: `src/ai/explainShared.ts`
- Create: `src/ai/explainShared.test.ts`
- (later tasks delete `explainPayload.ts`, `explainPrompt.ts` and their tests)

- [ ] **Step 1: Write the failing test**

Create `src/ai/explainShared.test.ts`. It must cover everything the two old test files covered PLUS the new `toExplainPayload` round-trip. Port the existing assertions from `src/ai/explainPayload.test.ts` and `src/ai/explainPrompt.test.ts` verbatim (same cases), changing only the import to `'./explainShared'`. Then add:

```ts
import { describe, it, expect } from 'vitest';
import {
  parseExplainPayload,
  buildExplainPrompt,
  toExplainPayload,
} from './explainShared';
import type { ExplainPayload } from './explainShared';
import type { GapReport } from '../meta/gap';

// ... (ported parseExplainPayload + buildExplainPrompt describe blocks) ...

describe('toExplainPayload', () => {
  it('assembles a valid payload from a GapReport (round-trips through parseExplainPayload)', () => {
    const report: GapReport = {
      characterKey: 'furina',
      feasibility: ['You own 0 Golden Troupe pieces — need 4.'],
      shortfalls: ['Best build reaches ER 150% vs 200% target.'],
      action: 'Farm Golden Troupe.',
    };
    const payload = toExplainPayload(
      'furina',
      'crit_value',
      { crit_rate: 70, crit_dmg: 180 },
      report,
    );
    expect(payload.gap).toEqual({
      feasibility: report.feasibility,
      shortfalls: report.shortfalls,
      action: report.action,
    });
    // The assembled payload must pass the validator unchanged.
    expect(parseExplainPayload(payload)).toEqual(payload);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/ai/explainShared.test.ts`
Expected: FAIL — cannot resolve `./explainShared`.

- [ ] **Step 3: Create `explainShared.ts`**

Create `src/ai/explainShared.ts` by concatenating the FULL current contents of `src/ai/explainPayload.ts` and `src/ai/explainPrompt.ts` into one module (dedupe the shared `import type { StatKey }` line; keep all of `parseExplainPayload` and `buildExplainPrompt` and their helpers/constants verbatim), then add the assembly helper:

```ts
import type { GapReport } from '../meta/gap';

/**
 * Assemble the AI payload from a build + its gap report. Single source of truth
 * for the shape, so ExplainBuild no longer hand-mirrors GapReport fields
 * (which silently drifts when GapReport gains one).
 */
export function toExplainPayload(
  characterKey: string,
  objective: Objective,
  totals: StatVec,
  report: GapReport,
): ExplainPayload {
  return {
    characterKey,
    objective,
    totals,
    gap: {
      feasibility: report.feasibility,
      shortfalls: report.shortfalls,
      action: report.action,
    },
  };
}
```

(`Objective`, `StatVec`, `ExplainPayload` are already in scope from the merged file. The `GapReport` import is type-only → erased at compile, no runtime/bundle dependency on `meta/gap`.)

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/ai/explainShared.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ai/explainShared.ts src/ai/explainShared.test.ts
git commit -m "feat: explainShared module (payload + prompt + toExplainPayload)"
```

---

### Task 2: Repoint consumers, delete the old two modules

**Files:**

- Modify: `api/explain.ts` (imports)
- Modify: `src/ai/explainClient.ts` (import of `ExplainPayload` type)
- Modify: `src/components/ExplainBuild.tsx` (use `toExplainPayload`)
- Delete: `src/ai/explainPayload.ts`, `src/ai/explainPayload.test.ts`, `src/ai/explainPrompt.ts`, `src/ai/explainPrompt.test.ts`

- [ ] **Step 1: Repoint `api/explain.ts`**

Replace the two imports:

```ts
import { parseExplainPayload } from '../src/ai/explainPayload';
import { buildExplainPrompt } from '../src/ai/explainPrompt';
```

with one:

```ts
import {
  parseExplainPayload,
  buildExplainPrompt,
} from '../src/ai/explainShared';
```

- [ ] **Step 2: Repoint `explainClient.ts`**

Change `import type { ExplainPayload } from './explainPayload';` → `import type { ExplainPayload } from './explainShared';`. Nothing else changes.

- [ ] **Step 3: Use `toExplainPayload` in `ExplainBuild.tsx`**

Add import `import { toExplainPayload } from '../ai/explainShared';`. Replace the inline object passed to `explainBuild({ characterKey, objective, totals, gap: { ... } })` with:

```ts
const text = await explainBuild(
  toExplainPayload(characterKey, objective, totals, report),
);
```

(`report` is the `GapReport` prop already in scope. The `explainBuild` import from `./explainClient` stays.)

- [ ] **Step 4: Delete the old modules and their tests**

```bash
git rm src/ai/explainPayload.ts src/ai/explainPayload.test.ts src/ai/explainPrompt.ts src/ai/explainPrompt.test.ts
```

- [ ] **Step 5: Verify no dangling references**

Run: `git grep -n "explainPayload\|explainPrompt" -- src api`
Expected: NO matches (everything points at `explainShared`; `explainClient` is untouched by this grep).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: point AI consumers at explainShared; drop split modules"
```

---

### Task 3: Full verification

**Files:** none (verification only).

- [ ] **Step 1:** `npm test` — all suites PASS (incl. `explainShared.test.ts`, `explainClient.test.ts`).
- [ ] **Step 2:** `npm run typecheck` — clean.
- [ ] **Step 3:** `npm run lint` — no errors (catches unused imports).
- [ ] **Step 4:** `npm run build` — succeeds. Confirms the client bundle still builds without the server path (ADR-0010).
- [ ] **Step 5: Format check on changed files only** (full-repo `format:check` false-fails on Windows CRLF; CI is authoritative on LF — but the `verify` CI job DOES check Markdown, so keep `.md` in the filter):

Run: `git diff --name-only main...HEAD | grep -E '\.(ts|tsx|md)$' | grep -v package-lock | xargs npx prettier --check`
Expected: "All matched files use Prettier code style!" If flagged, `npx prettier --write` it, confirm via `git diff` the change is real (not line-ending only), and commit.

- [ ] **Step 6: Final commit** (only if Step 5 reformatted anything real):

```bash
git add -A && git commit -m "style: prettier formatting"
```

---

## Self-Review

**Spec coverage (section #3):**

- `explainShared.ts` = server-safe `ExplainPayload` + `parseExplainPayload` + `buildExplainPrompt` + NEW `toExplainPayload` → Task 1. ✓
- `explainClient.ts` browser transport unchanged in shape (only the type-import path moves) → Task 2 Step 2. ✓
- `api/explain.ts` imports only `explainShared` → Task 2 Step 1. ✓
- `ExplainBuild` imports `explainClient` + `toExplainPayload`, stops mirroring fields → Task 2 Step 3. ✓
- Validation + prompt still independently unit-tested; `toExplainPayload` round-trips through `parseExplainPayload` → Task 1. ✓
- ADR-0010 key boundary untouched; bundle never pulls server path → Task 3 Step 4 (build) + explainShared imports no SDK. ✓

**Placeholder scan:** ported test assertions are "copy verbatim from the two existing test files" — not a placeholder, an explicit instruction. Full code given for the new helper and every import change. ✓

**Type consistency:** `toExplainPayload(characterKey: string, objective: Objective, totals: StatVec, report: GapReport): ExplainPayload` — args match exactly what `ExplainBuild` holds (`characterKey: string`, `objective: Objective`, `totals: StatVec`, `report: GapReport`). Output is the existing `ExplainPayload` shape. ✓
