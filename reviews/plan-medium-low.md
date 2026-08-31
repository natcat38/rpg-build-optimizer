# Execution plan: medium + low improvements

Source: `reviews/handoff-medium-low.md` (all items pre-verified 2026-08-29).
Executor: Opus, this session. One PR per phase. Gate per commit:
`npm run lint && npm run typecheck && npm test && npm run build` (+ `npm run docs:check` when docs change).

## Revision (user directive 2026-08-29)

ALL code/doc work lands in ONE PR on branch `improvements/medium-low`, built with parallel
subagents on disjoint files (no agent commits — orchestrator commits per wave and runs the gate).
M7 (backlog) is gh-side work on other PRs/issues, done in parallel outside the PR. M5's tag +
GitHub release happen after the PR merges; CHANGELOG.md itself is in the PR.

Wave 1 (parallel agents, disjoint files):

- Agent A: L1 + L3 + L4 + L5 (benchmark.ts TSDoc, FILE-MAP.md, README non-goals, CONTRIBUTING note)
- Agent B: L2 then M1 (App.tsx extraction, then lazy-loading — same files, so one agent, sequential)
- Agent C: M2 (worker data dedup)

Wave 2 (orchestrator, after wave-1 commit + build): M3 size-check script + baseline, M4 coverage
CI + badge job, M6 Lighthouse workflow, M5 CHANGELOG. Then full gate, push, PR.

## Order (original per-PR plan, superseded by revision above but steps still authoritative)

1. **Phase A — M7** (backlog, independent, do first so later PRs rebase cleanly)
2. **Phase B — Low batch** (L1–L5, one PR, mechanical)
3. **Phase C — M1** (code-split)
4. **Phase D — M2** (worker data dedup)
5. **Phase E — M3** (size budget CI — baseline AFTER C/D)
6. **Phase F — M4** (coverage in CI + badge)
7. **Phase G — M6** (Lighthouse CI)
8. **Phase H — M5** (tag v1.0.0 + CHANGELOG — last, so release notes cover this work)

## Phase A — M7: backlog

- `gh pr list` to refresh state. For #74, #73, #71: `gh pr update-branch`, wait CI, merge.
- #72, #54: check out locally, reproduce the failing `verify` check, fix or rebase; merge if green, close with a comment if obsolete.
- Issues #65, #32: read each; apply triage labels (`ready-for-agent` / `wontfix` per `docs/agents/triage-labels.md`) or close with a one-line reason. Don't implement them — triage only.

## Phase B — Low batch (one PR)

- **L1**: fix `formatReduction()` TSDoc in `src/optimizer/benchmark.ts` to say `scripts/benchmark.ts` uses it. Do NOT delete the function.
- **L2**: move `Section`, `ThesisHero`, `SolvedHero`, `useScrollSpy`, `SharedBuildBanner` out of `src/components/App.tsx` into new module(s) (e.g. `src/components/landing.tsx` — fewest files that reads well). Pure move, zero behavior change. Note: do BEFORE Phase C to avoid churn — C touches App.tsx imports too; keep the L2 diff mechanical.
- **L3**: bump `src/` root file count in FILE-MAP.md (5 → 7; re-count at execution time).
- **L4**: add "Non-goals" section to README: rotation-DPS sim, leaderboards/accounts, i18n, multi-game — one line + ADR link each (ADR-0001/0012/0016 where applicable). Link, don't duplicate.
- **L5**: 1–2 lines in CONTRIBUTING.md describing main-branch protection (PR required, linear history, CI gate, no force-push).
- Run `docs:check` in the gate.

## Phase C — M1: code-split

- Wrap non-first-paint panels in `src/components/App.tsx` (PlanView, TeamsView, RosterView/CharacterDetail, ImportPanel, ExplainBuild) in `React.lazy` + one `<Suspense>` boundary with a minimal fallback.
- Record before/after `npm run build` gzip sizes in the PR description (before: main 573,465 B raw / 159.87 kB gzip).
- Smoke-test the built app renders (preview + tab switch) since lazy loading changes runtime behavior.

## Phase D — M2: dedupe data.generated.json

- Preferred fix: main thread parses/holds the data once and `postMessage`s the parsed object to the worker at startup, removing the worker's static import in `src/game/genshin/adapter.ts` path. Structured clone of ~321 KB JSON at worker init is fine.
- If that entangles the adapter badly, fallback: Vite `manualChunks` shared chunk. If BOTH prove ugly, write a short ADR documenting duplication as intentional and stop — the handoff explicitly allows this exit.
- Verify: unique data strings appear in only one dist chunk; worker tests still pass.

## Phase E — M3: size budget CI

- Follow the existing `bench:check` pattern: `scripts/check-size.ts` comparing gzip total of `dist/assets/*.js` to a checked-in baseline JSON, fail above ~5% drift. No new dependency (zlib + fs). Add as CI step after build, plus a `size:check` npm script and a documented way to re-baseline.
- Baseline from post-C/D build.

## Phase F — M4: coverage CI + badge

- Add `npm run test:coverage` step to `.github/workflows/ci.yml`.
- Badge (default, no-account): on main pushes, a job writes a shields.io endpoint JSON (`{schemaVersion:1,label:"coverage",message:"96%",color:"brightgreen"}`) to a `badges` branch via `git push`; README badge points at the raw URL. Skip Codecov (needs account — user can ask for it later).

## Phase G — M6: Lighthouse CI

- New workflow using `treosh/lighthouse-ci-action` against https://rpg-build-optimizer.vercel.app on push to main + weekly schedule. Prod-URL mode only; no PR-preview integration (deferred per handoff). Assert nothing at first (report-only) or soft budgets — don't make it a merge blocker.

## Phase H — M5: release + changelog

- Write `CHANGELOG.md` (Keep-a-Changelog-lite): v1.0.0 entry summarizing current features + the improvements from phases A–G.
- `git tag v1.0.0` on main, `gh release create v1.0.0` with the same notes.

## Rules for the executor

- Read `memory/MEMORY.md` first if not already.
- One PR per phase; merge each before starting the next (A's cleanup especially).
- Any CONFIRMED claim that turns out stale at execution time (counts, sizes, PR states): trust the repo, note the discrepancy in the PR, keep going.
- No new dependencies except the Lighthouse action; size check is hand-rolled per the bench:check pattern.
