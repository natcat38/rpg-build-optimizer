# Repo review — 2026-09-06

Full recruiter-readiness pass over the whole repo, driven by the seven
existing audit reports in this directory (design, code quality, docs,
accessibility, architecture, tech debt, testing) rather than re-auditing.
This pass applied the small, mechanical, already-identified fixes; it did
not re-derive findings.

## Applied

**Docs**

- `CHANGELOG.md` — added an `[Unreleased]` section covering all 15 commits
  landed since the `v1.0.0` tag (`git log v1.0.0..HEAD --oneline`), grouped
  into Features / Fixed / Changed / Infrastructure. Closes tech-debt TD-2.
- `FILE-MAP.md` — rewrote the `src/roster` and `api` purpose lines per the
  architecture audit (finding #5): `src/roster` now names `buildScore.ts`'s
  role as a shared scoring input consumed by `App.tsx`, `teams/recommend.ts`,
  and `invest/advise.ts`, not just the character drawer; `api` now states the
  two-window (per-IP + global) rate limiter and the `Origin` allowlist per
  ADR-0013, instead of undersold "rate limiting by client IP."
- Confirmed `AGENTS.md` (tech-debt TD-10) just points at `CLAUDE.md`/`memory/`
  — no drift, no change needed.

**Code (mechanical only, per the audits' own fixes)**

- Added `type="button"` to the 7 buttons the accessibility/web-design audits
  flagged as inconsistent with the rest of the codebase's explicit
  convention: `src/roster/RosterView.tsx` (row button, "Show All
  Characters", "Optimise This Character"), `src/components/BuildCard.tsx`
  (Copy Share Link), `src/components/Results.tsx` (Relax stat, Show All
  Builds), `src/components/ErrorBoundary.tsx` (Reload).
- `src/roster/RosterView.tsx` — added the `.touch-target` class to the row
  button, matching every other interactive control in the design system.
- `src/components/ImportPanel.tsx` — removed the mismatched `aria-label="UID"`
  on the UID input (WCAG 2.5.3 Label in Name); the existing
  `<label htmlFor>` ("Import by UID") now supplies the accessible name.
  Updated `ImportPanel.test.tsx`'s 9 `getByLabelText('UID')` calls to match
  the now-correct accessible name.
- `src/components/ArtifactForm.tsx` — added `name="level"` to the level
  input.
- `src/components/OptimizePanel.tsx` — added `name="minEnergyRecharge"` to
  the minimum ER input.
- `tailwind.config.js` — deleted the dead `boxShadow.glow` token (confirmed
  via grep that only `shadow-glow-accent` and `shadow-panel` are ever
  applied in `src/`).

**Verification gate**

- `npm run lint` — 0 errors (2 pre-existing Fast-Refresh warnings in
  `landing.tsx`, tech-debt TD-1, left as-is — fixing it means splitting the
  file, which is a refactor out of scope for this pass).
- `npm run typecheck` — clean.
- `npm test` — 613/613 passing (58 files), after updating the one test file
  whose selector depended on the now-removed `aria-label`.
- `npm run docs:check` — clean (20 ADRs, contiguous, links resolve).
- `npx prettier --check` on every changed file — clean (`FILE-MAP.md` needed
  one `--write` pass to re-align its table column widths after the two
  purpose-line edits; not a CRLF issue).

## Deliberately left alone

Everything the task scoped out as a refactor, plus lower-priority findings
better handled as their own follow-up work:

- **App.tsx split, scoring-module consolidation (5 parallel "how good is
  this?" modules), `teammates.ts`/`comps.ts` unification, `GameId`
  registry removal** — all explicitly excluded refactors (architecture audit
  findings #1–#3, ponytail-audit finding #1).
- **Hallmark findings** (sparkle emoji on the AI-explain button, mismatched
  icon voice — SVG/Unicode/emoji mixed, section-badge layout, hex/RGB
  palette instead of OKLCH) — visual/design decisions, not mechanical typos;
  left for a deliberate design pass.
- **Cosmetic placeholder nits** (ellipsis convention on two placeholders,
  placeholder contrast at 2.96:1) — both explicitly flagged as
  advisory/optional in the accessibility audit, not defects.
- **Coverage thresholds, missing branch-coverage tests, Web Worker smoke
  test, e2e golden path** (tech-debt TD-6/TD-7, testing-strategy report) —
  test-writing work, not a mechanical repo-review fix.
- **Dependency bumps (TD-3), dev-only `npm audit` findings (TD-4), local
  `node_modules` staleness (TD-5)** — routine maintenance already tracked by
  Dependabot / CI, not something to bundle into a docs/hygiene pass.
- **`AppDrawer` focus-return regression test** (accessibility audit's one
  Major finding) — a real test to write, not a mechanical fix.

No app-behavior changes were made; every edit above is either documentation
or a same-behavior attribute/class addition already verified by the existing
test suite.
