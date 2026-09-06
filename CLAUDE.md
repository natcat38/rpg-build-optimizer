## Agent skills

### Issue tracker

Issues and PRDs are tracked as GitHub issues via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

Per-patch data refresh: `docs/runbooks/patch-refresh.md`.

### Persistent memory

`memory/` at the repo root. Read `memory/MEMORY.md` at session start; write new
memories there too. It is deliberately standalone — no `.claude/` dependency —
so any agent on any machine picks it up.

## Merging and CI (learned 2026-09-06)

- Auto-merge is disabled on this repo (`gh pr merge --auto` errors); the ruleset
  requires linear history, so a PR whose `mergeStateStatus` is `BEHIND` must be
  rebased onto `origin/main` and re-pass CI before `gh pr merge --squash`. Merge
  a batch sequentially: rebase → wait CI → merge → repeat for the next.
- The `verify` job runs `prettier --check .` over the whole tree, including
  `.md`. Run `npx prettier --check` on every changed file (docs too) before
  pushing.
