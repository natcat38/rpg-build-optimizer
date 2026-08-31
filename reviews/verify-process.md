# Process verification — 2026-08-29

## A. No CHANGELOG.md, git tags, or GitHub Releases exist

**CONFIRMED.**

- `git tag` → empty output.
- `gh release list` → empty output.
- `ls CHANGELOG.md` → `No such file or directory`.

No changelog, tags, or releases exist anywhere in the repo/remote.

## B. Lighthouse CI feasibility

**CONFIRMED (not present) / feasible with caveats.**

- `.github/workflows/` contains only `ci.yml` (and one other, `okf`-related). No lighthouse config or workflow file exists; `grep -ril lighthouse` across `.yml`/`.yaml`/`.json` returned no matches.
- Current recommended approach: `treosh/lighthouse-ci-action` (latest major v12 supports Vercel/Netlify/Cloudflare Pages preview-deployment awareness) run against a URL, either:
  - **Production URL** (`https://rpg-build-optimizer.vercel.app`) — simplest, no coordination needed with Vercel's deploy timing, but only tests main after merge, not PRs.
  - **Vercel preview URL** — requires either (a) waiting on/reading the Vercel bot's PR comment for the preview URL (needs a "wait for deployment" action such as `patrickedqvist/wait-for-vercel-preview` or similar), or (b) driving `vercel` CLI directly in the workflow with a token to produce a URL synchronously. Both add real setup/secrets complexity (`VERCEL_TOKEN`, org/project IDs).
- Gotchas: preview-URL runs are flaky if the action races the deployment; production-URL runs are simpler but only catch regressions post-merge, not pre-merge on PRs. Given this is a 100% static client-side app (ADR-0001) with no server, the production-URL approach is the lower-effort, honest starting point — a PR-preview integration is a second, more involved iteration, not a quick add.

## C. Open backlog (as of 2026-08-29)

**Current state — refutes the "yesterday" baseline of 5 dependabot PRs / 2 issues; today shows 5 open PRs (4 dependabot + 1 non-dependabot) / 2 issues.**

Open PRs (`gh pr list`):

| PR  | Title                                      | mergeStateStatus              | mergeable | Checks                                 |
| --- | ------------------------------------------ | ----------------------------- | --------- | -------------------------------------- |
| #74 | bump @vitejs/plugin-react 5.2.0→6.1.0      | BEHIND                        | MERGEABLE | all green (verify, validate×2, Vercel) |
| #73 | bump @types/node 22.20.1→26.2.0            | BEHIND                        | MERGEABLE | all green                              |
| #72 | bump the minor-and-patch group (4 updates) | BEHIND                        | MERGEABLE | **verify job FAILED**, others green    |
| #71 | bump actions/setup-node 6→7                | BEHIND                        | MERGEABLE | all green                              |
| #54 | bump jsdom 29.1.1→30.0.1                   | (not re-checked individually) | —         | **verify job FAILED**, others green    |

All 5 are dependabot PRs (no non-dependabot PR currently open — the claim's premise of "5 dependabot + tracking a delta" doesn't hold; it's 5 dependabot PRs, period). All are marked `mergeStateStatus: BEHIND` (need rebase/update against main), and two (#72, #54) have a failing `verify` CI job while the rest are fully green.

Open issues (`gh issue list`):

1. #65 — "Dev server port collides with sibling repos; the fix lives in a gitignored file"
2. #32 — "Capture GOOD 'location' field to grade currently-equipped builds"

Matches the expected count of 2 open issues, same two as before.

## D. FILE-MAP.md source-file-count drift

**CONFIRMED for `src/` root; spot-checked others are not obviously stale.**

- `src` root actually contains **7 files directly** (not counting subdirectories): `index.css`, `labels-core.test.ts`, `labels-core.ts`, `labels.test.ts`, `labels.ts`, `main.tsx`, `vite-env.d.ts`.
- FILE-MAP.md's table row for `src` says **5**. Confirmed stale — actual is 7, a drift of +2 (likely `labels-core.ts`/`labels-core.test.ts` added after the count was last updated).
- Did not exhaustively recount every one of the other 21 rows (out of scope for time budget), but the file itself states the count is "a rough orientation aid rather than a checked invariant" and is hand-maintained — so further drift elsewhere is plausible but unverified. Recommend re-running an automated recount across all rows if this is going to be relied on, or dropping the numeric column per the file's own disclaimer.

## E. Non-goals documentation

**PARTIAL — the substance is already scattered across ADRs; no consolidated "Non-goals" statement exists in README.md, and none of the four named items (rotation-DPS, leaderboards, i18n, multi-game) has a single authoritative single-line disclaimer.**

What's already documented, per-topic:

- **Multi-game support**: ADR-0008 introduced a `GameAdapter` seam for a hypothetical second game (Wuthering Waves candidate); ADR-0012 **removed** it, explicitly calling it "speculative flexibility (YAGNI)" since no second game was ever built. This is a decisive "not now" but phrased as removing infrastructure, not as a forward-looking non-goal statement.
- **Rotation-DPS simulation**: ADR-0003 (superseded) and ADR-0016 both discuss this directly. ADR-0016 states "gcsim is a Go rotation simulator" (ruled out as unavailable/unsuitable) and that damage modelling uses "target functions... not full rotation simulation" — this is the closest thing to an explicit non-goal, but it's inside ADR-0016's Context/Decision, not a scannable non-goals list.
- **Leaderboards**: ADR-0001's Consequences section says "A future 'live meta' or 'build gallery' feature would require introducing a backend — explicitly out of scope, flagged as v2." This is the closest match to "leaderboards" (a gallery/live-meta feature) but doesn't use the word "leaderboard" and is a side note under a different decision (client-side-only architecture).
- **i18n**: Grepped README.md, CONTEXT.md, and all of `docs/adr/` for "i18n"/"internationalization" — **no mentions found anywhere**. This is a genuine documentation gap, not something already covered.
- README.md itself: grepped for "scope", "leaderboard", "rotation", "dps sim", "i18n", "multi-game" — **zero matches**. There is no non-goals section in the README at all today.

**Conclusion**: a README "Non-goals" section would NOT be pure duplication — i18n has zero existing coverage, and the other three have only indirect/scattered ADR mentions (ADR-0001, ADR-0012, ADR-0016) rather than an explicit itemized list. If added, the README section should link to those three ADRs rather than restating their reasoning, and should be the first place i18n is addressed at all.

## F. Coverage badge feasibility

**CONFIRMED — CI does not run coverage today; simplest no-account path is a self-hosted shields.io endpoint JSON, not Codecov.**

- `.github/workflows/ci.yml` steps: checkout → setup-node → `npm ci` → typecheck → lint → docs:check → bench:check → format:check → `npm test` (plain `vitest run`, no `--coverage`) → build → build:data → diff-check. **No coverage step, no upload step, no badge job.**
- `package.json` already has `test:coverage: "vitest run --coverage"` and `@vitest/coverage-v8` as a devDependency — the tooling is present, just not wired into CI.
- Two realistic options:
  1. **Add a Codecov account** (or similar SaaS) — least CI-code to write, but requires creating and configuring a third-party account/token, which the repo doesn't have today.
  2. **No-account shields.io endpoint**: add a CI step running `vitest run --coverage`, parse the summary (e.g. `coverage/coverage-summary.json`), write a small JSON in the [shields.io endpoint schema](https://shields.io/badges/endpoint-badge), and commit/push it to a `badges` branch or gist (needs a `GITHUB_TOKEN`-authenticated push or a gist PAT). More CI code, but zero new external accounts.
- Given ADR-0001's client-side-only, no-backend, "free static hosting" philosophy and the project's general aversion to new external dependencies (see ADR-0012's YAGNI framing), the shields.io-endpoint-in-a-branch approach fits the project's existing philosophy better than adding a Codecov account, at the cost of a few more lines of workflow YAML.
