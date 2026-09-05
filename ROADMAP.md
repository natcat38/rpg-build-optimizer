# Roadmap — RPG Build Optimizer

**Current stage: Define**
**Next up:** triage `docs/research/audit-2026-09` findings into issues, then Define next feature.

Lifecycle: Define → Plan → Build → Verify → Review → Ship.
Agents: read this file at session start, state the current stage and next unchecked item before any other work, and update this file (checkboxes + Current stage + Next up) before ending. Product and design decisions belong to the user — elicit them with questions, never decide for them.

## History

- **v1.0.0** (2026-08-29) — first tagged release: artifact build optimiser, roster/team/plan views, GOOD import, shareable links, generated dataset pipeline. Full cycle (Define → Ship) completed; see `CHANGELOG.md`.
- **2026-09 repo audit** — mature-repo hygiene pass (this branch, `chore/repo-audit-2026-09`); findings captured under `docs/research/audit-2026-09/`, not yet triaged into issues.

## 1 · Define — why this exists (before any code)

- [x] Problem, audience, and scope captured in `README.md` and `docs/adr/0001-client-side-only-architecture.md` (v1.0.0).
- [ ] <!-- TODO: owner decision --> Next feature to Define is not yet chosen — pick after triaging the 2026-09 audit findings.

Exit: user has signed off the product scope. Skills: superpowers:brainstorming, grill-with-docs, feature-scope-docs.

## 2 · Plan — how it gets built

- [x] Stack, data model, and ADR trail established (20 ADRs in `docs/adr/`, v1.0.0).
- [ ] Tech scope for the next feature — pending Define.

Exit: numbered vertical slices exist and the user approves. Skills: superpowers:writing-plans, to-issues, hallmark (design direction).

## 3 · Build — the only stage where feature code happens

- [x] Day-1 hygiene, CI, and vertical-slice delivery in place (v1.0.0 through #89).
- [ ] Next feature's slices — pending Plan.

Exit: all slices to the cut line done, CI green. Skills: tdd, ponytail.

## 4 · Verify — does the real thing work

- [x] v1.0.0 and subsequent PRs (#71–#89) verified end-to-end before merge.
- [ ] Next feature verification — pending Build.

Exit: no known broken flows. Skills: run, webapp-testing, diagnose.

## 5 · Review — quality gate before polish

- [x] Prior review passes recorded in `CHANGELOG.md` (e.g. UI/UX audit fixes, #84).
- [x] 2026-09 repo audit run; findings in `docs/research/audit-2026-09/` awaiting triage into issues.

Exit: findings addressed or explicitly waived. Skills: code-review, simplify, web-design-guidelines.

## 6 · Ship — recruiter-ready

- [x] v1.0.0 tagged, live demo deployed, README/CHANGELOG/ADRs in place.
- [ ] Re-run after the next feature cycle ships.

Exit: /repo-review comes back clean. Skills: repo-review.

## House rules

- Docs before code; scope doc changes are cheaper than code changes.
- Enforcement lives in the backend; the UI mirrors it.
- One well-finished project beats three tutorial follow-alongs.
- If a stage feels like ceremony for a tiny project, shrink the doc to a few sentences — but never skip the stage.
