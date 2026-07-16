# Deepening #4 — Dedupe behind the import seam Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lift the import dedupe out of `ImportPanel` into a pure `src/import/dedupe.ts` module, so the dedupe rule is testable without a render and lives in one place.

**Architecture:** Today `ImportPanel.mergeDedupe` mixes pure logic (hash + filter) with UI side-effects (`setErr`/`setMsg`/`addMany`) and reads store state. Extract the pure part to `src/import/dedupe.ts`: `mergeNew(existing, incoming)` returns the incoming artifacts whose content-hash isn't already present, and `artifactHash` folds in from `hash.ts` (kept exported for its own test). `ImportPanel` keeps only `addMany(mergeNew(artifacts, out))` + its own messaging. `hash.ts` is deleted (its only non-doc caller is this path). No behaviour change — `mergeNew` filters incoming against existing only, exactly as `mergeDedupe` does today.

**Tech Stack:** TypeScript (strict), React 18, Vitest. Run commands with `npm`.

**Spec:** `docs/superpowers/specs/2026-06-19-architecture-deepenings-design.md` (section #4).

**Branch:** `refactor/deepen-import-dedupe` (already created off `main`). Do not commit to `main`.

---

### Task 1: Create `src/import/dedupe.ts` (`mergeNew` + `artifactHash`) — TDD

**Files:**

- Create: `src/import/dedupe.ts`
- Create: `src/import/dedupe.test.ts`

- [ ] **Step 1: Write the failing test** — `src/import/dedupe.test.ts`

Port the two existing `artifactHash` assertions from `src/import/hash.test.ts` verbatim (changing the import to `'./dedupe'`), then add `mergeNew` cases:

```ts
import { describe, it, expect } from 'vitest';
import { artifactHash, mergeNew } from './dedupe';
import type { Artifact } from '../game/types';

const base: Artifact = {
  id: 'x',
  setKey: 'EmblemOfSeveredFate',
  slot: 'sands',
  rarity: 5,
  level: 20,
  mainStat: 'atk_pct',
  mainStatValue: 46.6,
  subStats: [{ key: 'crit_dmg', value: 14 }],
};

describe('artifactHash', () => {
  it('is identical for the same content regardless of id', () => {
    expect(artifactHash(base)).toBe(artifactHash({ ...base, id: 'different' }));
  });

  it('differs when a sub-stat value differs', () => {
    expect(artifactHash(base)).not.toBe(
      artifactHash({ ...base, subStats: [{ key: 'crit_dmg', value: 15 }] }),
    );
  });
});

describe('mergeNew', () => {
  it('drops incoming pieces whose content already exists (ignoring id)', () => {
    const existing = [base];
    const incoming = [{ ...base, id: 'dup' }];
    expect(mergeNew(existing, incoming)).toEqual([]);
  });

  it('keeps incoming pieces with distinct content', () => {
    const distinct: Artifact = { ...base, id: 'y', slot: 'goblet' };
    expect(mergeNew([base], [distinct])).toEqual([distinct]);
  });

  it('is independent of the order of existing', () => {
    const a2: Artifact = { ...base, id: 'a2', slot: 'circlet' };
    const incoming = [
      { ...base, id: 'dup' },
      { ...a2, id: 'dup2' },
    ];
    expect(mergeNew([base, a2], incoming)).toEqual([]);
    expect(mergeNew([a2, base], incoming)).toEqual([]);
  });

  it('returns all incoming when existing is empty', () => {
    expect(mergeNew([], [base])).toEqual([base]);
  });
});
```

- [ ] **Step 2: Run the test, verify it FAILS** — `npm test -- src/import/dedupe.test.ts` → cannot resolve `./dedupe`.

- [ ] **Step 3: Create `src/import/dedupe.ts`**

Fold in `artifactHash` verbatim from `src/import/hash.ts`, add `mergeNew`:

```ts
import type { Artifact } from '../game/types';

/** Stable content hash for dedupe. Independent of `id`. */
export function artifactHash(a: Artifact): string {
  const subs = [...a.subStats]
    .sort((x, y) => x.key.localeCompare(y.key))
    .map((s) => `${s.key}:${s.value}`)
    .join(',');
  return `${a.setKey}|${a.slot}|${a.rarity}|${a.level}|${a.mainStat}|${subs}`;
}

/**
 * The subset of `incoming` whose content (per artifactHash, id-independent) is
 * not already present in `existing`. Pure: callers add the result to the store.
 */
export function mergeNew(
  existing: Artifact[],
  incoming: Artifact[],
): Artifact[] {
  const seen = new Set(existing.map(artifactHash));
  return incoming.filter((a) => !seen.has(artifactHash(a)));
}
```

- [ ] **Step 4: Run the test, verify it PASSES** — `npm test -- src/import/dedupe.test.ts`. Also `npm run typecheck`.

- [ ] **Step 5: Commit**

```bash
git add src/import/dedupe.ts src/import/dedupe.test.ts
git commit -m "feat: import/dedupe module (mergeNew + artifactHash)"
```

---

### Task 2: Wire `ImportPanel` to `mergeNew`, delete `hash.ts`

**Files:**

- Modify: `src/components/ImportPanel.tsx`
- Delete: `src/import/hash.ts`, `src/import/hash.test.ts`

- [ ] **Step 1: Repoint `ImportPanel` to the new module**

In `src/components/ImportPanel.tsx`:

- Change the import `import { artifactHash } from '../import/hash';` → `import { mergeNew } from '../import/dedupe';`.
- Replace the body of `mergeDedupe` so it delegates the pure step:

```tsx
function mergeDedupe(incoming: Artifact[]) {
  const fresh = mergeNew(artifacts, incoming);
  addMany(fresh);
  setErr(null);
  setMsg(`Imported ${fresh.length} artifacts.`);
}
```

(`artifactHash` is no longer referenced in this file — the import is gone.)

- [ ] **Step 2: Delete the old module + its test**

```bash
git rm src/import/hash.ts src/import/hash.test.ts
```

- [ ] **Step 3: Verify no dangling references**

Run: `git grep -n "import/hash\|from './hash'\|artifactHash" -- src`
Expected: matches ONLY in `src/import/dedupe.ts` and `src/import/dedupe.test.ts` (the new home). No references to `import/hash` and none in `ImportPanel.tsx`.

- [ ] **Step 4: Verify** — `npm test`, `npm run typecheck`, `npm run lint` all clean (lint catches the now-unused `Artifact` import if it became unused — it is still used by `mergeDedupe`'s param type, so it stays).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: ImportPanel uses mergeNew; drop import/hash"
```

> NOTE: do NOT `git add` untracked files outside the task (e.g. `.playwright-mcp/`, `*.png`). Stage only the source files you changed: `git add src/components/ImportPanel.tsx` plus the `git rm` deletions are already staged. If unsure, `git add -A` is acceptable ONLY after confirming `git status` shows no unrelated untracked files — otherwise stage explicitly.

---

### Task 3: Full verification

- [ ] **Step 1:** `npm test` — all suites PASS (incl. `dedupe.test.ts`).
- [ ] **Step 2:** `npm run typecheck` — clean.
- [ ] **Step 3:** `npm run lint` — no errors.
- [ ] **Step 4:** `npm run build` — succeeds.
- [ ] **Step 5: Format check on changed files only** (full-repo `format:check` false-fails on Windows CRLF; the `verify` CI job DOES check Markdown — keep `.md` in the filter; ignore "No files matching" lines for deleted files):

Run: `git diff --name-only main...HEAD | grep -E '\.(ts|tsx|md)$' | grep -v package-lock | xargs -r ls -d 2>/dev/null | xargs npx prettier --check`
Expected: "All matched files use Prettier code style!" If a NEW or edited file is flagged, `npx prettier --write` it, confirm via `git diff` the change is real content (not line-ending only — empty diff = CRLF-only, CI-safe), commit only real changes.

- [ ] **Step 6: Final commit** (only if Step 5 reformatted real content): `git add -A && git commit -m "style: prettier formatting"`.

---

## Self-Review

**Spec coverage (section #4):**

- `src/import/dedupe.ts` with `mergeNew(existing, incoming): Artifact[]` and folded-in `artifactHash` (kept exported for its test) → Task 1. ✓
- `ImportPanel` becomes `addMany(mergeNew(artifacts, out))` + its own messaging → Task 2 Step 1. ✓
- `hash.ts` deleted (only this path consumed it) → Task 2 Step 2. ✓
- `dedupe.test.ts`: filters exact-duplicate content, keeps distinct, order-independent; `hash.test.ts` assertions moved in → Task 1. ✓
- No behaviour change: `mergeNew` filters incoming against existing only, exactly as `mergeDedupe` did (no within-incoming dedup introduced) → guarded by unchanged messaging + full suite. ✓

**Placeholder scan:** Full code in every step. Ported assertions are an explicit verbatim instruction. ✓

**Type consistency:** `mergeNew(existing: Artifact[], incoming: Artifact[]): Artifact[]` — `artifacts` (store) and `out` (parseGOOD/fetchUidArtifacts result) are both `Artifact[]`; `addMany(a: Artifact[])` accepts the result. ✓
