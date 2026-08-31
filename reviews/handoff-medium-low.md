# Handoff: verified medium + low improvements

Source: repo review 2026-08-28, every item below re-verified with evidence on 2026-08-29
(see `reviews/verify-code.md`, `reviews/verify-process.md`). All claims CONFIRMED unless noted.
Work top-down; one PR per item (or batch the low doc nits). Verification gate per commit:
`npm run lint && npm run typecheck && npm test && npm run build` (plus `docs:check` when docs change).

## Medium

### M1. Code-split the main bundle

Main chunk is 573,465 bytes raw / 159.87 kB gzip; zero `React.lazy`/dynamic `import()` anywhere in
`src/`. `src/components/App.tsx` statically imports every feature panel (PlanView, TeamsView,
RosterView/CharacterDetail, ImportPanel, ExplainBuild). Wrap the heavy, not-first-paint panels in
`React.lazy` + `Suspense`. Verify with a before/after `npm run build` size comparison.

### M2. Deduplicate data.generated.json across main + worker bundles

`src/game/genshin/adapter.ts` imports `data.generated.json` (321 KB); it is serialized into BOTH
`dist/assets/index-*.js` AND `dist/assets/optimize.worker-*.js` (verified via unique strings present
once in each). Fix options: fetch-and-cache the JSON once and `postMessage` the parsed object to the
worker at startup, or a Vite shared-chunk arrangement. If instead judged intentional (static +
cacheable), document the decision in an ADR — don't leave it silent.

### M3. Bundle-size CI check

No size-limit/bundlewatch/any budget config exists in package.json or `.github/`. Add `size-limit`
(or a tiny script comparing `dist/assets/*.js` gzip totals to a checked-in baseline, matching the
existing `bench:check` drift-gate pattern) as a CI step. Do this AFTER M1/M2 so the baseline is the
improved one.

### M4. Coverage in CI + badge

Coverage tooling exists (`npm run test:coverage`, real numbers: 96.3% lines / 94.95% statements /
88.12% branches) but CI never runs it and nothing surfaces it. Add a coverage step to
`.github/workflows/ci.yml`; simplest no-account badge is a CI job writing a shields.io endpoint JSON
to a gist or branch (Codecov works too but needs account setup — ask the user which).

### M5. CHANGELOG / GitHub Releases

Confirmed: no CHANGELOG.md, no git tags, no releases. Start lightweight: tag a v1.0.0, hand-write
release notes summarizing the current feature set, and keep a CHANGELOG.md going forward.

### M6. Lighthouse CI

Confirmed absent and feasible. Simplest: `treosh/lighthouse-ci-action` in a workflow hitting the
production URL (https://rpg-build-optimizer.vercel.app) on a schedule or on main pushes. Running
against per-PR Vercel preview URLs is possible but needs the Vercel bot comment or CLI wait — more
setup; start with prod-URL mode.

### M7. Clear the PR/issue backlog (state as of 2026-08-29)

5 open dependabot PRs, ALL behind main; #72 and #54 have a failing `verify` check (needs rebase
and/or a real fix — investigate before merging). #74, #73, #71 need update-branch then merge. Open
issues: #65 (dev-server port collision) and #32 (GOOD `location` field) — triage or close.

## Low

### L1. Delete/fix stale `formatReduction` TSDoc

`src/optimizer/benchmark.ts` exports `formatReduction()` whose TSDoc claims App.tsx uses it. Verified:
only `scripts/benchmark.ts` calls it; App.tsx has no reference and no duplicated formatting logic.
Fix the comment (it's NOT dead code — the bench script uses it); don't delete the function.

### L2. Split App.tsx (710 lines)

Confirmed exactly 710 lines containing `Section`, `ThesisHero`, `SolvedHero`, `useScrollSpy`,
`SharedBuildBanner` plus the `App` shell. Move landing/hero pieces to their own module(s); purely
organizational, no behavior change, keep the diff mechanical.

### L3. FILE-MAP.md drift

`src/` root row says 5 source files; actual is 7. Bump the count (FILE-MAP self-describes as a rough
aid, so this is a one-line fix; other checked rows matched).

### L4. Non-goals section

Rotation-DPS sim, leaderboards, and multi-game have scattered mentions in ADR-0001/0012/0016 but no
consolidated statement; i18n is mentioned nowhere. Add a short "Non-goals" note to README (or
CONTEXT.md) listing: full rotation damage simulation, public leaderboards/accounts, i18n, multi-game
support — each with a one-line reason and ADR link where one exists. Don't duplicate ADR prose; link it.

### L5. Branch-protection note

No committed doc describes main-branch protection (required PR, linear history, CI gate). One or two
lines in CONTRIBUTING.md. Optional.

## Sequencing note

M1 → M2 → M3 in that order (splitting changes chunk layout; the size baseline should come last).
M7 is independent and can go first. Everything in Low is independent and safe to batch.
