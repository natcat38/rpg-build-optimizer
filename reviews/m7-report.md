# M7 report — Dependabot merges, verify diagnosis, issue triage

Date: 2026-08-29

## 1. Dependabot PRs #74, #73, #71 — NOT merged (blocked, root cause found)

`gh pr merge --auto` failed for all three: auto-merge is disabled at the repo
level (`enablePullRequestAutoMerge` is off in repo settings). Ran
`gh pr update-branch` on all three (succeeded), then merge was attempted
directly.

After rebasing onto current `main` (414ba71), **all three now fail the
`verify` check's `format:check` step** — this is not PR-specific staleness,
it's a break already present on `main` itself:

- `main`'s own latest CI run (`414ba71`, PR #75 "chore: move agent memory
  into the repo") is failing `verify` → `npm run format:check` because three
  new files aren't Prettier-formatted:
  - `memory/autocrlf-formatcheck-gotcha.md`
  - `memory/no-unrequested-artifacts.md`
  - `memory/subagent-spend-limit-is-5hr.md`
- Every PR rebased onto current `main` inherits this failure. The repo's
  active branch ruleset ("main") requires the `verify` check, so none of
  these three can merge until `main` is fixed.

**Action taken:** did not push a fix (out of scope / instructed not to touch
the working tree). Flagged a background task (`task_f40b3dca`) to run
`prettier --write` on the three memory files and land a fix on `main`. PRs
#74/#73/#71 are left open, branches already updated; they should merge
cleanly once `main`'s format:check is fixed and they're rebased again.

## 2. PRs #72 and #54 — genuine verify failures (not staleness), comments posted

### PR #72 (`chore(deps): bump the minor-and-patch group with 4 updates`)

Bumps `@anthropic-ai/sdk`, `@vercel/node`, **`genshin-db`**, and `vite`.

Failure: `npm run build:data && git diff --exit-code src/game/genshin/data.generated.json`
fails. Per ADR-0002, `data.generated.json` is a frozen snapshot baked from
`genshin-db` and committed to the repo, not auto-regenerated. The bumped
`genshin-db` version emits new character data (e.g. "Alyosha") not present in
main's committed snapshot (confirmed absent on `main` too), so the
regenerated file diverges from what's committed.

Genuine, PR-specific failure — requires regenerating and committing the
dataset via `docs/runbooks/patch-refresh.md` alongside this dependency bump.
Diagnosis posted as a PR comment; no fix pushed.

### PR #54 (`chore(deps-dev): bump jsdom from 29.1.1 to 30.0.1`)

Failure: every test worker fails to start with
`TypeError: webidl.util.markAsUncloneable is not a function`, thrown from
jsdom 30's bundled `undici` (`node_modules/jsdom/node_modules/undici/lib/web/cache/cachestorage.js`).
This API isn't present under the Node version CI runs (Node 20.20.2) —
a genuine incompatibility between jsdom 30.0.1's bundled undici and the
current Node/vitest setup, not a rebase/staleness issue.

Diagnosis posted as a PR comment; no fix pushed. Recommend holding this
dependency back (or upgrading CI's Node version) before merging.

## 3. Issue triage

Read `docs/agents/triage-labels.md`. None of the five triage labels
(`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`,
`wontfix`) existed in the repo except a stock `wontfix`; created the missing
four (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`)
before applying.

- **#65** — "Dev server port collides with sibling repos; the fix lives in a
  gitignored file". Thoroughly specified, root cause diagnosed, options
  weighed, author already leans toward a concrete fix (pin
  `server.port`/`strictPort` in `vite.config.ts`). Labeled
  **`ready-for-agent`**.
- **#32** — "Capture GOOD 'location' field to grade currently-equipped
  builds". Concrete, scoped proposal (capture `location` on import,
  reconstruct equipped 5-piece set, run `gradeBuild()` against it). Filed as
  an explicit "file it, don't build it" follow-up per the Phase 2 plan, but
  fully actionable as written. Labeled **`ready-for-agent`**.

## Summary of side effects

- Branches updated (not merged): #74, #73, #71
- PR comments posted: #72, #54 (diagnosis only)
- Labels created: `needs-triage`, `needs-info`, `ready-for-agent`,
  `ready-for-human`
- Labels applied: #65 → `ready-for-agent`, #32 → `ready-for-agent`
- Background task flagged: fix `main`'s broken `format:check`
  (`task_f40b3dca`)
