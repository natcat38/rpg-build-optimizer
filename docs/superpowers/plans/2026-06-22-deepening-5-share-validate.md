# Deepening #5 — Validate the decoded share link Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop untrusted share-link input at one seam. `decodeBuild` currently checks only that three fields _exist_, then returns a raw JSON parse — a crafted link with unknown stat/character keys or an invalid build level is accepted and rendered. Add a focused `parseBuildSnapshot` validator (mirroring `parseExplainPayload`'s discipline) so the render path trusts a validated shape.

**Architecture:** `src/share/url.ts` gains `parseBuildSnapshot(unknown): BuildSnapshot | null` that structurally validates the fields the render path reads. `decodeBuild` inflates + JSON-parses as today, then delegates to `parseBuildSnapshot`; null → `{ error: 'UNREADABLE' }`. No App.tsx change needed (it already branches on `'error' in out`). No behaviour change for valid links.

**Trust boundary (why thorough validation is correct, not over-built):** the `?b=` param is fully attacker-controlled and crosses straight into React render (`BuildCard` does `build.objectiveValue.toFixed(1)` and `build.totals[k].toFixed(1)`; `Results` indexes `build.artifactIds[slot]`). This is input validation at a trust boundary — validate every field the render touches.

**Tech Stack:** TypeScript (strict), Vitest. Run commands with `npm`.

**Spec:** `docs/superpowers/specs/2026-06-19-architecture-deepenings-design.md` (section #5).

**Branch:** `refactor/deepen-share-validate` (already created off `main`). Do not commit to `main`.

---

### Task 1: Add `parseBuildSnapshot` and route `decodeBuild` through it — TDD

**Files:**

- Modify: `src/share/url.ts`
- Modify: `src/share/url.test.ts`

- [ ] **Step 1: Write the failing tests** — append to `src/share/url.test.ts`

The existing test file defines valid `request`, `build`, `artifacts` consts and a `snapshot`. Add a `describe('decodeBuild validation', …)` block. Each case encodes a _tampered_ snapshot via `encodeBuild` (so it passes inflate + JSON-parse + the three existence checks) and asserts `decodeBuild` returns `{ error: 'UNREADABLE' }`; plus one positive round-trip case. Use the existing `request`/`build`/`artifacts` fixtures:

```ts
describe('decodeBuild validation', () => {
  it('round-trips a valid snapshot unchanged', () => {
    const out = decodeBuild(encodeBuild({ request, build, artifacts }));
    expect(out).toEqual({ request, build, artifacts });
  });

  it('rejects an unknown objective', () => {
    const bad = encodeBuild({
      request: { ...request, objective: 'haste' as never },
      build,
      artifacts,
    });
    expect(decodeBuild(bad)).toEqual({ error: 'UNREADABLE' });
  });

  it('rejects an out-of-range build level', () => {
    const bad = encodeBuild({
      request: { ...request, buildLevel: 999 as never },
      build,
      artifacts,
    });
    expect(decodeBuild(bad)).toEqual({ error: 'UNREADABLE' });
  });

  it('rejects an unknown stat key in build.totals', () => {
    const bad = encodeBuild({
      request,
      build: { ...build, totals: { bogus_stat: 50 } as never },
      artifacts,
    });
    expect(decodeBuild(bad)).toEqual({ error: 'UNREADABLE' });
  });

  it('rejects an artifact with an unknown slot', () => {
    const bad = encodeBuild({
      request,
      build,
      artifacts: [
        { ...artifacts[0], slot: 'ring' as never },
        ...artifacts.slice(1),
      ],
    });
    expect(decodeBuild(bad)).toEqual({ error: 'UNREADABLE' });
  });

  it('rejects an artifact with a non-stat mainStat', () => {
    const bad = encodeBuild({
      request,
      build,
      artifacts: [
        { ...artifacts[0], mainStat: 'luck' as never },
        ...artifacts.slice(1),
      ],
    });
    expect(decodeBuild(bad)).toEqual({ error: 'UNREADABLE' });
  });
});
```

(If the existing tests don't already export/inline reusable `request`/`build`/`artifacts`, reuse the consts already declared at the top of the file — they are module-scoped.)

- [ ] **Step 2: Run, verify these new cases FAIL** — `npm test -- src/share/url.test.ts` (today's `decodeBuild` accepts them because it only checks field existence).

- [ ] **Step 3: Implement `parseBuildSnapshot` in `src/share/url.ts`**

Add the import for the guards/constants and the validator. Update the type import line to include what's needed:

```ts
import type {
  Artifact,
  BuildResult,
  Objective,
  OptimizeRequest,
  StatVec,
  SubStat,
} from '../game/types';
import { isStatKey, BUILD_LEVELS, SLOTS } from '../game/types';
```

Add these module-private guards + the exported validator (place above `decodeBuild`):

```ts
function isObjective(x: unknown): x is Objective {
  return x === 'crit_value' || isStatKey(x);
}

function isStatVec(x: unknown): x is StatVec {
  if (typeof x !== 'object' || x === null) return false;
  return Object.entries(x).every(
    ([k, v]) => isStatKey(k) && typeof v === 'number' && Number.isFinite(v),
  );
}

function isSubStat(x: unknown): x is SubStat {
  if (typeof x !== 'object' || x === null) return false;
  const s = x as Record<string, unknown>;
  return (
    isStatKey(s.key) && typeof s.value === 'number' && Number.isFinite(s.value)
  );
}

function isArtifact(x: unknown): x is Artifact {
  if (typeof x !== 'object' || x === null) return false;
  const a = x as Record<string, unknown>;
  return (
    typeof a.id === 'string' &&
    typeof a.setKey === 'string' &&
    (SLOTS as string[]).includes(a.slot as string) &&
    typeof a.rarity === 'number' &&
    typeof a.level === 'number' &&
    isStatKey(a.mainStat) &&
    typeof a.mainStatValue === 'number' &&
    Number.isFinite(a.mainStatValue) &&
    Array.isArray(a.subStats) &&
    a.subStats.every(isSubStat)
  );
}

function isOptimizeRequest(x: unknown): x is OptimizeRequest {
  if (typeof x !== 'object' || x === null) return false;
  const r = x as Record<string, unknown>;
  return (
    typeof r.characterKey === 'string' &&
    typeof r.weaponKey === 'string' &&
    (BUILD_LEVELS as number[]).includes(r.buildLevel as number) &&
    isObjective(r.objective) &&
    typeof r.constraints === 'object' &&
    r.constraints !== null
  );
}

function isBuildResult(x: unknown): x is BuildResult {
  if (typeof x !== 'object' || x === null) return false;
  const b = x as Record<string, unknown>;
  // Render reads objectiveValue, totals, artifactIds[slot]; require those
  // strictly and require one string id per slot.
  if (
    typeof b.objectiveValue !== 'number' ||
    !Number.isFinite(b.objectiveValue)
  )
    return false;
  if (typeof b.score !== 'number') return false;
  if (!isStatVec(b.totals)) return false;
  if (typeof b.artifactIds !== 'object' || b.artifactIds === null) return false;
  const ids = b.artifactIds as Record<string, unknown>;
  if (!SLOTS.every((s) => typeof ids[s] === 'string')) return false;
  if (typeof b.diagnostics !== 'object' || b.diagnostics === null) return false;
  return true;
}

/**
 * Structurally validate an untrusted decoded share snapshot. Returns the typed
 * snapshot, or null if any field the render path reads is malformed. This is the
 * trust-boundary guard for the ?b= link (parity with parseExplainPayload).
 */
export function parseBuildSnapshot(input: unknown): BuildSnapshot | null {
  if (typeof input !== 'object' || input === null) return null;
  const o = input as Record<string, unknown>;
  if (!isOptimizeRequest(o.request)) return null;
  if (!isBuildResult(o.build)) return null;
  if (!Array.isArray(o.artifacts) || !o.artifacts.every(isArtifact))
    return null;
  return {
    request: o.request,
    build: o.build,
    artifacts: o.artifacts,
  };
}
```

- [ ] **Step 4: Route `decodeBuild` through the validator**

Replace the body's existence-check block:

```ts
const parsed = JSON.parse(json) as BuildSnapshot;
if (!parsed.request || !parsed.build || !Array.isArray(parsed.artifacts))
  return { error: 'UNREADABLE' };
return parsed;
```

with:

```ts
const snapshot = parseBuildSnapshot(JSON.parse(json));
if (!snapshot) return { error: 'UNREADABLE' };
return snapshot;
```

(Keep the surrounding `try`/`catch` and the empty-`param` guard. `JSON.parse` returns `unknown` into `parseBuildSnapshot` — drop the `as BuildSnapshot` cast.)

- [ ] **Step 5: Run, verify PASS** — `npm test -- src/share/url.test.ts` (all old + new cases). Then `npm run typecheck`.

- [ ] **Step 6: Commit**

```bash
git add src/share/url.ts src/share/url.test.ts
git commit -m "feat: validate decoded share snapshot at the trust boundary"
```

---

### Task 2: Full verification

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

**Spec coverage (section #5):**

- `parseBuildSnapshot(unknown): BuildSnapshot | null` added → Task 1 Step 3. ✓
- `decodeBuild` now calls it; signature unchanged (`BuildSnapshot | { error: 'UNREADABLE' }`) → Task 1 Step 4. ✓
- Validates `request.objective` (isObjective), `request.buildLevel` ∈ BUILD_LEVELS, `request.characterKey`/`weaponKey` strings, `build.totals` keys (isStatKey), `artifacts` array of well-formed `Artifact`s (slot ∈ SLOTS, mainStat/sub keys via isStatKey) → Task 1 Step 3. ✓
- Also guards the other render-read build fields (`objectiveValue`, `artifactIds[slot]`) since they cross into render — trust-boundary completeness. ✓
- Tests: tampered-but-existence-passing snapshot with unknown stat/objective/level/slot/mainStat → UNREADABLE; valid round-trips → Task 1 Step 1. ✓

**Placeholder scan:** Full code for every guard and the validator; full test block. ✓

**Type consistency:** Guards narrow to the exact `game/types` interfaces; `parseBuildSnapshot` returns the existing `BuildSnapshot`. `decodeBuild`'s return type is unchanged, so App.tsx's `'error' in out` branch still type-checks. `isObjective` is inlined (a 1-liner) rather than imported from the AI module to avoid coupling `share` → `ai`. ✓
