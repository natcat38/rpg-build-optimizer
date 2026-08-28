# Memory index

- [Subagent "spend limit" = 5hr limit](subagent-spend-limit-is-5hr.md) — don't pause/escalate on that dispatch error; just retry.
- [autocrlf format:check gotcha](autocrlf-formatcheck-gotcha.md) — local `format:check` fails on CRLF but CI is green; check only changed files.
- [No unrequested artifacts](no-unrequested-artifacts.md) — global preference: only publish Artifacts when explicitly asked
- [Subagent Write is env-dependent](subagents-cannot-write-files.md) — instruct file-first reports with a text fallback.
- [Token economy & subagent tiering](token-economy-practices.md) — Sonnet-default tiering, diff-scoped reviews, 3–4-agent waves, file-first reports.

## How this works (any agent, any machine)

This folder is the whole memory system — no `.claude/` needed. One fact per
file, this file is the index (one `- [Title](file.md) — hook` line each).
Frontmatter: `name`, `description`, `metadata.type` (user | feedback |
project | reference). Link related facts with `[[name]]`.

Read this index at session start; read a file when its hook looks relevant.
Write new memories here, not to any agent-tool-specific memory directory.

Search is just `grep -ril <keyword> memory/` — flat folder, one fact per file,
no index rebuild needed. If it ever outgrows one screen, group by `metadata.type`.
