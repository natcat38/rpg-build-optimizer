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
