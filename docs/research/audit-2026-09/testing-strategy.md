# Testing strategy audit — 2026-09

Scope: assess the current test suite (unit, integration, e2e) and design a
forward test strategy. No tests were written as part of this audit.

## 1. Current state

Run: `npm run test:coverage` — 58 test files, 613 tests, all passing, ~83s.

```
Statements   : 94.62% (2518/2661)
Branches     : 87.82% (1746/1988)
Functions    : 94.69% (607/641)
Lines        : 96.03% (2182/2272)
```

This is a high-coverage, unit-test-heavy suite (vitest + jsdom + Testing
Library). There is no integration or e2e layer — the pyramid is effectively
all "unit," with component tests standing in for integration where React
components are involved. No flaky tests were observed in this run (single
run only; see §5 for repeat-run risk areas).

### Module → test map

| Module | Source | Test | Notes |
|---|---|---|---|
| Optimizer core | `src/optimizer/search.ts` (733 lines) | `search.test.ts` (631 lines) | Includes a brute-force oracle (`bruteForce`) cross-checked against the real branch-and-bound search — the strongest test in the repo. 99.4% stmt / 91.2% branch. |
| Optimizer scoring | `src/optimizer/score.ts` | `score.test.ts` | 92.75% stmt; lines 97-99 uncovered. |
| Optimizer diagnostics | `src/optimizer/diagnostics.ts` | `diagnostics.test.ts` | 100% stmt, lines 42-43/113 branch gaps. |
| Optimizer context/benchmark | `context.ts`, `benchmark.ts` | `context.test.ts`, `benchmark.test.ts` | benchmark.ts 68% branch (18-20, 99, 124 uncovered) — instrumentation/CLI-ish code, low risk. |
| Damage formula (KQM) | `src/damage/formula.ts` | `formula.test.ts` | 100% stmt but only 76.7% branch — lines 39-56 (level-multiplier table lookup path) and 127-130 uncovered. Each internal term is exported and pinned individually against the published formula, which is good practice, but the level-interpolation edge cases aren't exercised. |
| Damage profiles / set bonuses | `profiles.ts`, `setBonuses.ts` | `profiles.test.ts`, `setBonuses.test.ts` | setBonuses.ts is 96.5% stmt / 90.5% branch — a few uptime-assumption branches (341, 348-350, 386) untested. |
| Adapter (reference data) | `src/game/genshin/adapter.ts` | `adapter.test.ts` | 79.3% branch — lowest branch coverage of any non-trivial module; likely fallback/edge paths in stat lookups. |
| Import — GOOD | `src/import/good.ts` | `good.test.ts` (37 tests) | 95.8% stmt, thorough on parsing/validation; lines 84-88, 193, 222 uncovered (likely malformed-input edge cases). |
| Import — UID (Enka) | `src/import/uid.ts` | `uid.test.ts` (21 tests) | 96% stmt / 86.5% branch; no test exercises the real Enka network call — appropriately mocked, but that means the actual HTTP/parsing contract is unverified beyond the mock shape. |
| Import — dedupe | `src/import/dedupe.ts` | `dedupe.test.ts` | 85.7% stmt — smallest file, one branch (line 13) and one function uncovered. |
| Share links | `src/share/url.ts` | `url.test.ts` (39 tests) | 92% stmt/branch — the single largest test file by test count, reflecting the encode/decode surface's importance (self-contained state, ADR-0005). Lines 202, 260 uncovered — likely a decode-failure or malformed-URL branch. |
| Meta / gap analysis | `src/meta/gap.ts` | `gap.test.ts` | Only 4 tests for the "v1.1 centerpiece" per CONTEXT.md; 79.3% branch, lines 53-57 uncovered (the `2pc` and multi-2pc branches of `setRequirementGap` look under-exercised relative to the `4pc` branch). |
| Meta targets/teammates/grade | `metaTargets.ts`, `teammates.ts`, `grade.ts` | respective `.test.ts` | grade.ts 80% branch (lines 42, 44). teammates.ts only 2 tests. |
| Plan composition | `src/plan/composePlan.ts` | `composePlan.test.ts` (7 tests) | 96.7% stmt but only 75% branch — composePlan is the v2 aggregation point (teams → builds → farming list) and has fewer tests than its downstream `PlanView.test.tsx` (10 tests, mostly UI-level). Logic-level edge cases (partial team failures, empty farming list, discarded stale runs) are only indirectly covered through the UI test. |
| Investment advice | `src/invest/advise.ts` | `advise.test.ts` (7 tests) | 85% stmt / 63.6% branch — lowest branch coverage of any src module. Line 42 (`craftableFor`, the weapon-type match inside the curated obtainability loop) uncovered. |
| Teams (comps/recommend) | `comps.ts`, `recommend.ts` | `comps.test.ts` (5), `recommend.test.ts` (11) | recommend.ts (roster→archetype matching, the most combinatorial piece here) has the deepest test file of the two. |
| Roster / build score | `buildScore.ts` | `buildScore.test.ts` (12 tests) | 100% stmt, 91.7% branch. |
| API — explain proxy | `api/explain.ts` | `explain.test.ts` (23 tests) | Excellent: covers method/size/origin/rate-limit/API-key/error-leak paths individually, with SDK and rate-limiter mocked via `vi.hoisted`. This is a model for how the rest of the suite could test boundary conditions. |
| API — rate limiter | `api/_ratelimit.ts` | `_ratelimit.test.ts` (8 tests) | Equally strong: covers unconfigured/partially-configured/fail-open-vs-fail-closed-by-environment, sequencing of per-IP vs global budget, and limiter reuse across calls. One test explicitly documents ordering coupling ("Runs first: the warn latch is module-level") — a maintenance hazard, see §5. |
| State (zustand stores) | `src/state/*.ts` | matching `.test.ts` | inventory.ts only 90% lines/stmt (line 45); safeStorage.ts 90% (lines 26, 48 — likely the storage-quota-exceeded / parse-failure fallback paths). |
| Workers | `optimizeClient.ts`, `protocol.ts`, `optimize.worker.ts` | `optimizeClient.test.ts`, `protocol.test.ts` | `optimize.worker.ts` itself (the actual `self.onmessage` Worker entry point) has **no direct test** — it's a 17-line pass-through to `runSearchRequest` (in `protocol.ts`, which is tested), so risk is low, but the worker's message-passing glue is only exercised indirectly through `optimizeClient.test.ts`'s worker mock, never as a real Worker. |
| Components (React) | `src/components/*.tsx` | matching `.test.tsx` | Good breadth (App, ArtifactForm, BuildCard, ErrorBoundary, ExplainBuild, GapReport/Section, ImportPanel, OptimizePanel, Results, SampleGear). `ArtifactForm.tsx` is the weakest at 66.7% branch / 71.4% functions — form-validation branches likely under-tested. `Results.tsx` 82.4% branch, largest uncovered block (lines ~236-238, 363-413) — worth checking what UI states that block covers (likely an empty/error/no-results state). `landing.tsx` has no dedicated test file but is exercised at 84.6% stmt via `App.test.tsx`. |
| UI primitives | `src/components/ui/*` | `Combobox.test.tsx`, `Drawer.test.tsx`, `Segmented.test.tsx` | Badge/Callout/CharacterLine/Disclosure/ElementName/GradeMarker/Marker/SearchCounts/SourceLink/cn/tone/elementTone have no dedicated test files but hit 100% via consuming component tests. Fine — they're presentational one-liners; a dedicated test would be over-testing. |

### Not exercised by any test

- `src/workers/optimize.worker.ts` as an actual Web Worker (only its logic, via `protocol.ts`, is tested — never spun up in a real worker thread).
- `scripts/*.ts` (build-dataset, check-docs, benchmark, check-bench) — repo tooling, correctly out of scope per the testing-strategy skill's "skip: one-off scripts" guidance, but `check-docs.ts`/`check-bench.ts` gate CI and a silent regression there would only surface as a red CI run, not a red test run.
- True end-to-end flow: import → optimize → share-link round-trip → re-import from link, across real component boundaries with a real Web Worker. Today this path is validated only in pieces (import tests, optimizer tests, share/url tests, worker-mocked component tests) — nothing asserts the seams compose correctly end-to-end in a browser-like environment.

## 2. Critical-path assessment (the four areas called out for special attention)

**Optimizer / branch-and-bound (`src/optimizer/search.ts`)** — Strongest area in the repo. `search.test.ts` runs a brute-force oracle (`bruteForce`, lines ~695-733 of `search.ts`) and cross-checks it against the real B&B search, which is the correct way to test an "exact, never approximate" optimizer (ADR-0004). 99%+ line coverage. Residual risk is narrow: one uncovered line (707) and branch coverage at 91% — worth a quick look at what branch is missed (likely a rare pruning-bound tie-break), but this is not a priority gap.

**Damage engine (`src/damage/formula.ts`, `setBonuses.ts`)** — Solid but the weakest-tested "core math" module by branch %. Each KQM formula term is unit-pinned individually (good design — catches regressions term-by-term against the published spec), but the level-multiplier lookup (`levelMult`, lines 39-56) and a tail branch (127-130) aren't hit, meaning off-nominal character levels are untested even though `LEVEL_MULT`/`LEVELS` supports more than the single `BUILD_LEVEL` the rest of the app uses. `setBonuses.ts` has three specific curated-bonus branches (341, 348-350, 386) untested — these are exactly the kind of curated-data entries where a typo (wrong uptime assumption, wrong stat key) would otherwise ship silently, per ADR-0020's own admission that these are hand-curated.

**Import parsers (`src/import/good.ts`, `uid.ts`, `dedupe.ts`)** — Good breadth (37 + 21 + 7 tests) on the parsing/validation surface. `good.ts`'s few uncovered lines (84-88, 193, 222) look like malformed-GOOD-file edge cases. `dedupe.ts` is the thinnest (7 tests, 85.7% stmt, one function fully uncovered) despite dedupe correctness being what stands between a player and silently-duplicated inventory on repeated imports.

**Share links (`src/share/url.ts`)** — Well tested (39 tests, the single biggest test file), consistent with it being explicitly self-contained state per ADR-0005 (no server to fall back on if this breaks). 92% branch; two uncovered lines (202, 260) are worth a look — likely the "malformed/tampered link" decode-failure path, which is exactly the path a naive user hitting a stale bookmark would trigger.

**`api/` proxy + rate limiting** — The best-designed tests in the repo. `explain.test.ts` and `_ratelimit.test.ts` systematically cover: method gating, two independent size-limit mechanisms (content-length pre-check vs. actual-body re-check), CORS/origin allow-listing across four origin scenarios, fail-open vs. fail-closed rate-limiter configuration by environment, per-IP vs. global budget sequencing, and error-message leak prevention (asserting the raw upstream error text never reaches the client). This is a strong reference pattern the rest of the suite doesn't uniformly follow.

## 3. Low-value / risky tests

- **Ordering-coupled tests in `api/_ratelimit.test.ts`**: two tests are explicitly commented as depending on run order (`// Runs first: the warn latch is module-level, so this is the only test that can observe the first (and only) warning` and the `vi.resetModules()` test that follows it to "reset the latch"). This works today because vitest runs tests within a file in declaration order by default, but it is a documented fragility — a reorder, a `test.concurrent`, or a future refactor that changes module caching would silently break test intent (a false pass, not a crash) rather than fail loudly. Low priority to fix given it's self-documented, but worth a `beforeEach(() => vi.resetModules())` if this file is touched again.
- **No systematically flaky tests found** in a single clean run — no `setTimeout`/`Date.now`/real-network calls detected in test files (grep came up empty), and slow tests (`OptimizePanel.test.tsx` ~9.3s, `PlanView.test.tsx` ~10.8s) look like real `userEvent` interaction cost rather than timing flakiness. Worth watching in CI over time rather than acting on now.
- **No low-value/tautological tests observed** in the files sampled — assertions consistently check externally-observable behavior (status codes, payload shapes, call arguments) rather than implementation internals.

## 4. Missing integration / e2e coverage

This is the single biggest structural gap. The suite is unit/component-heavy with zero true integration or e2e layer:

1. **No real end-to-end run**: import a GOOD file → pick a character → set constraints → run the optimizer (via the real Worker, not a mock) → view results → generate a share link → open that link in a fresh session → verify the rebuilt state matches. Each segment is unit-tested; the seams are not.
2. **No real Web Worker test**: `optimizeClient.test.ts` mocks the worker boundary; `optimize.worker.ts` is never instantiated as an actual `Worker` in a test (vitest + jsdom can do this, or a small Node worker_threads-based harness). A protocol mismatch between `optimizeClient.ts`'s expectations and `optimize.worker.ts`'s actual message shape would not be caught today except by the (mocked) unit tests on each side agreeing with each other, not with reality.
3. **No contract test against the live `/api/explain` endpoint** (reasonable given no live secrets in CI) — but there's also no lightweight local integration test that boots the Vercel handler against a real (sandboxed/dev) Redis or a recorded Anthropic response, only fully-mocked unit tests. Acceptable for a solo/client-side project, but worth naming as a conscious tradeoff rather than an oversight.
4. **No visual or accessibility regression testing** — this is a data-dense, meter/marker/badge-heavy UI (`src/components/ui/*`, `Meter.tsx`, `GradeMarker.tsx`) with no snapshot or axe-based accessibility check anywhere in the suite.

## 5. Prioritized list of tests to add

Ordered by (risk × silence — i.e., how badly a regression here could ship unnoticed) rather than raw coverage-percentage gap.

1. **`src/damage/setBonuses.ts` — curated 4pc bonus entries (lines ~341, 348-350, 386)**. Hand-curated numeric data feeding the `avg_damage` objective; a typo here silently mis-ranks builds. Add one test per currently-unhit branch asserting the exact uptime-adjusted value against the ADR-0020 source citation.
2. **`src/meta/gap.ts` — `setRequirementGap`'s `2pc` and multi-`2pc`-choice branches (lines 53-57)**. Only the `4pc` branch looks well exercised (4 tests total for this "v1.1 centerpiece" per CONTEXT.md). Add cases for: a `2pc` requirement already met, a `2pc` requirement short by 1, and the multi-setKey loop finding the gap on a non-first candidate.
3. **`src/invest/advise.ts` — `craftableFor` (line 42)**. Lowest branch coverage (63.6%) of any src module; it drives what the plan tells a player to craft next. Add a test where the requested `weaponType` matches a craftable-tier entry and one where it doesn't (falls through to `undefined`).
4. **`src/import/dedupe.ts`**. Smallest file, lowest stmt coverage (85.7%) among import modules, and dedupe correctness is what prevents inventory duplication bugs on repeated import — a class of bug a user would notice as "my artifact count keeps growing." Cover the currently-uncovered function and branch (line 13).
5. **`src/share/url.ts` — malformed/tampered-link decode path (lines 202, 260)**. Self-contained state per ADR-0005 means this is the only thing standing between a stale/edited URL and a crash or silently-wrong build. Add a test decoding a link with a corrupted payload segment and one with a valid-shape-but-out-of-range value (e.g., an unknown slot key), asserting a clean decode error rather than a thrown exception or garbage state.
6. **`src/damage/formula.ts` — `levelMult` at non-`BUILD_LEVEL` inputs (lines 39-56, 127-130)**. Currently only the single default build level is exercised end-to-end even though the lookup table supports more. Add tests at a level between two tabulated entries (nearest-match behavior) and at the table's min/max.
7. **`src/plan/composePlan.ts` — branch coverage at 75% (lines ~129, 156, 164)**. This is the v2 aggregation point (teams → per-member builds → farming list); its edge cases (a team member with no feasible build, an empty farming list, a partially-stale plan run) are currently only reachable indirectly through `PlanView.test.tsx`'s UI-level tests. Add direct unit tests at the `composePlan` level so a regression fails at the logic layer, not only via a UI assertion three layers up.
8. **`src/components/ArtifactForm.tsx` — validation branches (66.7% branch, 71.4% functions, the weakest component)**. Add cases for each rejected-input path (out-of-range substat, main-stat/slot mismatch, etc.) if not already covered by `state/artifactValidation.test.ts` at the logic layer — confirm the component actually surfaces those validation states, not just the pure function.
9. **Real Web Worker smoke test** for `src/workers/optimize.worker.ts`. Instantiate the actual worker (vitest supports this in a jsdom/happy-dom environment with a worker polyfill, or add a small Node-side `worker_threads` harness) and post one real `WorkerRequest`, asserting a well-formed `WorkerResponse` comes back. This is the one true integration seam with zero direct coverage today.
10. **One end-to-end "golden path" integration test**: render `App`, import the committed fixture (`src/import/__fixtures__/sample-account.good.json`), drive the real optimize flow through to a rendered result (worker mocked is acceptable here, since #9 covers the worker itself), generate a share link, decode it back, and assert the rebuilt request/result match. This closes the "seams compose correctly" gap named in §4 without requiring a new test framework — it can live alongside the existing `App.test.tsx` using the same Testing Library setup.
11. **`api/_ratelimit.test.ts` ordering fragility**: not a coverage gap, but add `beforeEach(() => vi.resetModules())` (or restructure the two order-dependent "first warning" tests to each do their own fresh import) so the file's correctness stops depending on declaration order.

## 6. What not to do

- Do not add tests for the presentational one-liners in `src/components/ui/*` (Badge, Callout, cn, tone, etc.) beyond what consuming component tests already give them — they're at 100% coverage via natural usage, and dedicated unit tests would be pure overhead per the testing-strategy skill's "skip trivial" guidance.
- Do not add coverage-chasing tests for `scripts/*.ts` or `optimizer/benchmark.ts`'s CLI-reporting branches (lines 18-20, 99, 124) — these are developer tooling, not shipped behavior; a broken `npm run bench` fails loudly and locally.
- Do not introduce a heavyweight e2e framework (Playwright/Cypress) for item 10 above — the existing Testing Library + jsdom setup can express the golden-path test without new infrastructure, given the app is 100% client-side with no server round trips to simulate beyond the already-mocked `/api/explain` proxy.
