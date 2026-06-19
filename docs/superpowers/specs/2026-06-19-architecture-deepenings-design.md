# Architecture deepenings — design

**Status:** approved (2026-06-19)
**Type:** internal architecture (no user-facing behaviour change)
**Source:** `/improve-codebase-architecture` review + grilling loop

Six deepening opportunities surfaced by an architecture review and grilled into
locked designs. The optimiser core and game data are already deep and well-tested;
the friction sits at the edges — assembly logic that leaked into React components,
a multi-step optimisation callers wire by hand, and shallow modules around the AI
feature. **No user-facing behaviour changes.** Each item is judged by the deletion
test (does removing the module concentrate complexity, or just move it?).

Build order: **#1 first** (highest leverage), then #2, #3, #4, #5, #6. #6 is
independent and safe; the rest are roughly independent but #2 reads cleanest after
#1 lands.

No new CONTEXT.md vocabulary is required (names map to existing terms or are
non-domain). No ADRs are superseded; ADR-0004 (admissible bound) and ADR-0008
(GameAdapter seam) constrain #1 and #6 and are honoured below.

---

## #1 — One optimisation entry (Strong)

**Files:** `src/workers/optimizeClient.ts`, `src/optimizer/search.ts`,
`src/optimizer/context.ts`, `src/workers/optimize.worker.ts`,
`src/optimizer/benchmark.ts`, `src/components/App.tsx`.

**Problem.** "Run an optimisation" is a pipeline the caller assembles:
`buildContext(adapter, req)` then `runOptimize(req, inv, ctx)` / `optimizeFor`.
Three near-identically-named functions sit in the path — `optimize` (pure search,
`search.ts`), `runOptimize` (worker dispatch), `optimizeFor` (context + dispatch).
`context.ts` is 18 lines: interface as big as implementation.

**Design.** One public deep entry owns the whole operation; everything else becomes
an optimizer-internal seam.

```
src/workers/optimizeClient.ts
  optimize(request, inventory, adapter = genshinAdapter): Promise<OptimizeResult>
     └─ private: buildContext → worker dispatch → sync fallback

src/optimizer/search.ts
  searchBuilds(req, inventory, ctx)   // was optimize(); internal — facade + benchmark + oracle
  bruteForce(...)                     // unchanged; correctness oracle only

src/optimizer/context.ts
  buildContext(adapter, req)          // stays; private to the optimiser, no caller wires it
```

- `adapter` is a defaulted param → honours ADR-0008 (the entry stays game-agnostic).
- `buildContext` must run on the main thread (reads adapter/snapshot; the plain
  `ctx` is serialized to the worker, keeping the adapter out of the worker bundle).
  It is hidden, not deleted.
- `searchBuilds` + `bruteForce` stay exported **only** for `benchmark.ts` (sync
  timing) and `search.test.ts` (oracle) — two real consumers justify the seam.
- Share the `WorkerRequest` type between `optimize.worker.ts` and the entry — kills
  the untyped `postMessage`.
- **Delete** `optimizeFor` and the caller-facing `runOptimize(…, ctx)` wiring.
- `optimize()` maps to CONTEXT.md's existing **Optimiser** term; `searchBuilds` is
  an internal name, not domain vocabulary.

**Call-site updates.** `App.tsx` drops its `buildContext` call and calls
`optimize(request, inventory)`. `benchmark.ts` keeps calling `searchBuilds` directly
for clean synchronous timing.

**Tests.** `context.test.ts` (private `buildContext`), `search.test.ts`
(`searchBuilds` vs `bruteForce`), `optimizeClient.test.ts` (now exercises the deep
`optimize` fallback path).

**Wins.** locality: context assembly in one place · benchmark stops re-wiring ·
leverage: callers learn one interface · delete the shallow `context.ts` seam.

---

## #2 — `GapSection` module (Strong)

**Files:** `src/components/App.tsx` (lines 175–205), `src/meta/gap.ts`,
`src/components/ExplainBuild.tsx`, `src/components/GapReport.tsx`.

**Problem.** An IIFE in App's JSX decides visibility
(`!sharedArtifacts && META_TARGETS[characterKey]`), calls `computeGapReport`, and
assembles props for two children — assembly logic with no locality, untestable
without a render.

**Design.**

```
src/components/GapSection.tsx
  <GapSection result request artifacts sharedArtifacts />
     └─ owns the gate (sharedArtifacts + META_TARGETS lookup) → null if N/A
     └─ owns computeGapReport
     └─ renders <GapReport> + <ExplainBuild>
```

App's JSX collapses from the IIFE to a single `<GapSection … />`. `GapSection` is
named after the existing **Gap analysis** domain term — no new vocabulary.

**Tests.** New `GapSection.test.tsx`: renders null for a non-meta character and for
shared artifacts; renders the report for a meta character with a result.

**Wins.** the gate becomes testable · App shrinks toward pure layout · locality: gap
wiring in one module.

---

## #3 — Two ai modules + assembly helper (Worth exploring)

**Files:** `src/ai/explainPayload.ts`, `src/ai/explainPrompt.ts`,
`src/ai/explainClient.ts`, `src/components/ExplainBuild.tsx`, `api/explain.ts`.

**Problem.** `ExplainBuild` hand-derives the payload (`gap: { feasibility,
shortfalls, action }`) by mirroring `GapReport` fields — silent drift if `GapReport`
gains a field. Three files for one operation.

**Constraint (why not collapse to one).** There is a **real server/browser seam**:
`explainPayload` (validation + types) is imported by both runtimes; `explainPrompt`
is server-only; `explainClient` (`fetch`) is browser-only. Merging all three would
force the server function to import the browser `fetch` wrapper. Two adapters = real
seam → keep the seam.

**Design.** Two modules + a pure helper:

```
src/ai/explainShared.ts        // server-safe; no DOM, no Node
  ExplainPayload (type)
  parseExplainPayload(unknown): ExplainPayload | null   // cost/abuse guard
  buildExplainPrompt(payload): { system, user }
  toExplainPayload(characterKey, objective, totals, report): ExplainPayload  // NEW

src/ai/explainClient.ts        // browser transport, unchanged shape
  explainBuild(payload): Promise<string>
```

- `api/explain.ts` imports only `explainShared` (validate + prompt).
- `ExplainBuild` imports `explainClient` + `toExplainPayload`; stops mirroring
  fields.
- Both validation and prompt remain independently unit-tested (satisfies the
  original spec's testability rationale; ADR-0010 key boundary untouched — verify
  the bundle still never pulls the server path).

**Tests.** `explainShared.test.ts` (validation + prompt + `toExplainPayload`
round-trip from a `GapReport`), `explainClient.test.ts` (unchanged).

**Wins.** ExplainBuild stops mirroring GapReport · one shared module across server +
both validate/prompt · payload drift eliminated.

---

## #4 — Dedupe behind the import seam (Worth exploring)

**Files:** `src/components/ImportPanel.tsx` (`mergeDedupe`, lines 16–22),
`src/import/hash.ts`, `src/import/good.ts`, `src/import/uid.ts`.

**Problem.** The only dedupe lives in a component, mixes pure logic with UI
side-effects (`setErr`/`setMsg`), and reaches into store state — untestable without
a render. Both import paths depend on it.

**Design.**

```
src/import/dedupe.ts
  mergeNew(existing: Artifact[], incoming: Artifact[]): Artifact[]
  artifactHash(a: Artifact): string   // folded in from hash.ts; kept exported for its test
```

`ImportPanel` becomes `addMany(mergeNew(artifacts, out))` plus its own messaging.
`hash.ts` is deleted (its only caller is this path).

**Tests.** `dedupe.test.ts`: filters exact-duplicate content, keeps distinct pieces,
is order-independent; existing `hash.test.ts` assertions move/merge in.

**Wins.** dedupe testable as a pure function · import contract leaves the UI ·
locality: one place owns the hash rule.

---

## #5 — Validate the decoded share link (Worth exploring)

**Files:** `src/share/url.ts` (`decodeBuild`), `src/components/App.tsx` (lines
61–72).

**Problem.** `decodeBuild` checks three fields exist, then returns a raw JSON parse.
A crafted link with unknown stat keys / character keys is accepted and rendered.
Untrusted input crosses into the render path unvalidated.

**Design.** A focused validator mirroring `parseExplainPayload`'s discipline:

```
src/share/url.ts
  parseBuildSnapshot(unknown): BuildSnapshot | null
  decodeBuild(param): BuildSnapshot | { error: 'UNREADABLE' }   // now calls parseBuildSnapshot
```

Validate the fields the render path reads: `request.objective` via `isObjective`,
`request.buildLevel` ∈ `BUILD_LEVELS`, `request.characterKey`/`weaponKey` strings,
`build.totals` keys via `isStatKey`, `artifacts` an array of well-formed `Artifact`s
(reuse the slot/stat checks). Reject → `UNREADABLE`.

**Tests.** `url.test.ts` additions: a snapshot that passes the three existence
checks but carries an unknown stat key / unknown objective → `UNREADABLE`; a valid
snapshot still round-trips.

**Wins.** render trusts a validated shape · untrusted input stops at one seam ·
parity with the AI payload guard.

---

## #6 — Concentrate constants & formulas (Speculative)

Three independent dedups.

**(a) `STAT_KEYS`.** `genshin/adapter.ts` re-declares the array from `types.ts`.
Derive `genshinAdapter.statKeys` from `types.STAT_KEYS`. Trivial, safe.

**(b) Stat labels.** `diagnostics.ts:STAT_LABEL` and `ui/labels.ts:STAT_LABELS`
duplicate. **Move the canonical labels to a neutral home** `src/labels.ts`
(`STAT_LABELS`, `statLabel`, `objectiveLabel`, `SLOT_LABELS`, `formatSetName`);
`ui/labels.ts` re-exports for components. `meta/gap.ts` and `optimizer/diagnostics.ts`
import from `src/labels.ts` — removes the domain→ui dependency for both.

**(c) Objective formula.** `search.ts:objectiveContribution` (per-piece, pruning
bound) and `score.ts:objectiveValue` (over a total vector) both hard-code
`cr*2 + cd`. Share only the kernel:

```
src/optimizer/score.ts
  critValue(cr: number, cd: number): number   // cr*2 + cd
```

Both call it. ADR-0004 stays satisfied — we share the *formula*, not the bound's
admissible optimism.

**Tests.** `(a)` covered by existing adapter tests; `(b)` adjust import paths, add a
`labels.test.ts` smoke if missing; `(c)` existing `score.test.ts` / `search.test.ts`
continue to pass unchanged.

**Wins.** one place to change the formula · no silent label drift · bound can't
diverge from score · no domain→ui label dependency.
