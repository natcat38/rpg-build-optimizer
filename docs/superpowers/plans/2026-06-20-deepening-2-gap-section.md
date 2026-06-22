# Deepening #2 — GapSection module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lift the gap-section assembly out of App.tsx's JSX IIFE into a self-contained `GapSection` module that owns the meta gate, the gap-report computation, and the rendering of both children.

**Architecture:** A new `src/components/GapSection.tsx` takes `result`, `request`, `artifacts`, and `sharedArtifacts`. It owns the visibility gate (`sharedArtifacts` set → null; no `META_TARGETS[characterKey]` → null), calls `computeGapReport`, and renders `<GapReport>` + `<ExplainBuild>`. App.tsx's 20-line IIFE collapses to a single `<GapSection … />`, and four now-unused imports leave App. No behaviour change.

**Tech Stack:** TypeScript (strict), React 18, Vitest + Testing Library. Run commands with `npm`.

**Spec:** `docs/superpowers/specs/2026-06-19-architecture-deepenings-design.md` (section #2).

**Branch:** `refactor/deepen-gap-section` (already created off `main`). Do not commit to `main`.

---

### Task 1: Create the `GapSection` component (TDD)

**Files:**

- Create: `src/components/GapSection.tsx`
- Test: `src/components/GapSection.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/GapSection.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GapSection } from './GapSection';
import { META_TARGETS } from '../meta/metaTargets';
import type { OptimizeRequest, OptimizeResult } from '../game/types';

const metaKey = Object.keys(META_TARGETS)[0];

function makeRequest(characterKey: string): OptimizeRequest {
  return {
    characterKey,
    weaponKey: 'w',
    buildLevel: 90,
    constraints: {},
    objective: 'crit_value',
  };
}

const emptyResult: OptimizeResult = { builds: [], explored: 0, pruned: 0 };

describe('GapSection', () => {
  it('renders the gap report for a meta character on a fresh build', () => {
    render(
      <GapSection
        result={emptyResult}
        request={makeRequest(metaKey)}
        artifacts={[]}
        sharedArtifacts={null}
      />,
    );
    expect(screen.getByText('Gap vs meta build')).toBeInTheDocument();
  });

  it('renders nothing for a non-meta character', () => {
    const { container } = render(
      <GapSection
        result={emptyResult}
        request={makeRequest('definitely-not-a-character')}
        artifacts={[]}
        sharedArtifacts={null}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when viewing a shared build', () => {
    const { container } = render(
      <GapSection
        result={emptyResult}
        request={makeRequest(metaKey)}
        artifacts={[]}
        sharedArtifacts={[]}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/GapSection.test.tsx`
Expected: FAIL — cannot resolve `./GapSection` (module does not exist yet).

- [ ] **Step 3: Create the component**

Create `src/components/GapSection.tsx`:

```tsx
import type { Artifact, OptimizeRequest, OptimizeResult } from '../game/types';
import { META_TARGETS } from '../meta/metaTargets';
import { computeGapReport } from '../meta/gap';
import { GapReport } from './GapReport';
import { ExplainBuild } from './ExplainBuild';

/**
 * The gap-analysis section shown beneath fresh, non-shared results for a meta
 * character: a GapReport plus the optional AI "Explain this build" panel. Owns
 * its own visibility gate so App renders it unconditionally.
 */
export function GapSection({
  result,
  request,
  artifacts,
  sharedArtifacts,
}: {
  result: OptimizeResult;
  request: OptimizeRequest;
  artifacts: Artifact[];
  sharedArtifacts: Artifact[] | null;
}) {
  const meta = META_TARGETS[request.characterKey];
  // Only for meta characters on freshly-optimised (non-shared) builds.
  if (sharedArtifacts || !meta) return null;

  const report = computeGapReport(meta, artifacts, result.builds[0] ?? null);

  return (
    <div className="mb-4">
      <GapReport report={report} />
      <ExplainBuild
        characterKey={request.characterKey}
        objective={request.objective}
        totals={result.builds[0]?.totals ?? {}}
        report={report}
      />
    </div>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/components/GapSection.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/GapSection.tsx src/components/GapSection.test.tsx
git commit -m "feat: GapSection module owning the gap-analysis gate + assembly"
```

---

### Task 2: Wire `GapSection` into App and remove the IIFE

**Files:**

- Modify: `src/components/App.tsx` (imports near lines 7–10; the IIFE at lines 178–197)

- [ ] **Step 1: Replace the four now-unused imports with the GapSection import**

In `src/components/App.tsx`, replace these four lines:

```tsx
import { GapReport } from './GapReport';
import { ExplainBuild } from './ExplainBuild';
import { META_TARGETS } from '../meta/metaTargets';
import { computeGapReport } from '../meta/gap';
```

with this single line:

```tsx
import { GapSection } from './GapSection';
```

(Leave all other imports untouched — `Artifact`, `OptimizeRequest`, `OptimizeResult` on the `../game/types` line are still used elsewhere in the file.)

- [ ] **Step 2: Replace the IIFE with the component**

In `src/components/App.tsx`, replace this block:

```tsx
{
  !sharedArtifacts &&
    META_TARGETS[request.characterKey] &&
    (() => {
      const report = computeGapReport(
        META_TARGETS[request.characterKey],
        artifacts,
        result.builds[0] ?? null,
      );
      return (
        <div className="mb-4">
          <GapReport report={report} />
          <ExplainBuild
            characterKey={request.characterKey}
            objective={request.objective}
            totals={result.builds[0]?.totals ?? {}}
            report={report}
          />
        </div>
      );
    })();
}
```

with:

```tsx
<GapSection
  result={result}
  request={request}
  artifacts={artifacts}
  sharedArtifacts={sharedArtifacts}
/>
```

(This sits inside the existing `{result && request && ( … <Section n={3}> … )}` block, so `result` and `request` are non-null here. `GapSection` owns the `sharedArtifacts`/meta gate, so the old `!sharedArtifacts && META_TARGETS[...]` guard is no longer needed in App.)

- [ ] **Step 3: Verify no dangling references remain in App.tsx**

Run: `git grep -n "computeGapReport\|META_TARGETS\|GapReport\|ExplainBuild" -- src/components/App.tsx`
Expected: NO matches (all four moved into GapSection).

- [ ] **Step 4: Run the App test + typecheck**

Run: `npm test -- src/components/App.test.tsx && npm run typecheck`
Expected: PASS and typecheck CLEAN (no unused-import errors — strict TS / the lint rule would flag a leftover unused import).

- [ ] **Step 5: Commit**

```bash
git add src/components/App.tsx
git commit -m "refactor: App renders GapSection instead of an inline gap IIFE"
```

---

### Task 3: Full verification

**Files:** none (verification only).

- [ ] **Step 1: Full test suite**

Run: `npm test`
Expected: all suites PASS, including the new `GapSection.test.tsx` (3) and `App.test.tsx`.

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: clean.

- [ ] **Step 3: Lint** (catches any unused import left in App)

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 4: Production build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 5: Format check on changed files only**

> Note: a full-repo `npm run format:check` fails on Windows checkouts due to CRLF — a pre-existing line-ending artifact, not a real failure (CI checks out LF and passes). Verify only the files this branch touched:

Run: `git diff --name-only main...HEAD | grep -E '\.(ts|tsx)$' | xargs npx prettier --check`
Expected: "All matched files use Prettier code style!" If a file is flagged, run `npx prettier --write` on it, confirm via `git diff` the change is real formatting (not line-ending only), and commit.

- [ ] **Step 6: Final commit (only if Step 5 reformatted anything real)**

```bash
git add -A
git commit -m "style: prettier formatting"
```

---

## Self-Review

**Spec coverage (section #2):**

- `src/components/GapSection.tsx` taking `result`/`request`/`artifacts`/`sharedArtifacts` → Task 1. ✓
- Owns the gate (`sharedArtifacts` + `META_TARGETS` lookup → null if N/A) → Task 1 component body. ✓
- Owns `computeGapReport` and renders `<GapReport>` + `<ExplainBuild>` → Task 1. ✓
- App's IIFE collapses to `<GapSection … />` → Task 2. ✓
- New `GapSection.test.tsx`: null for non-meta, null for shared, report for meta+result → Task 1 (3 tests). ✓
- No new CONTEXT.md vocabulary (named after existing "Gap analysis"). ✓ No behaviour change → guarded by unchanged App test + full suite (Task 3). ✓

**Placeholder scan:** None — full code in every step, exact commands with expected output. ✓

**Type consistency:** `GapSection` props `{ result: OptimizeResult; request: OptimizeRequest; artifacts: Artifact[]; sharedArtifacts: Artifact[] | null }` (Task 1) match exactly what App passes (Task 2). `computeGapReport(meta, artifacts, result.builds[0] ?? null)` matches the real signature `computeGapReport(meta: MetaTarget, inventory: Artifact[], build: BuildResult | null)`. `ExplainBuild` props (`characterKey`, `objective`, `totals`, `report`) match its existing interface. ✓
