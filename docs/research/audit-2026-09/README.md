# Audit index — 2026-09

Eight audits ran over this repo on 2026-09-06, each from a different skill's
lens. `repo-review.md` then did one pass applying the small, mechanical,
already-identified fixes across all seven others (see "Already fixed"
below). This file is the index over all eight, plus one table: every finding
left open after that pass, deduplicated across reports and prioritized. It
is the input for turning this audit round into GitHub issues — precise
enough that an issue can be filed straight from a row.

## The eight reports

| Report | Lens | Headline |
|---|---|---|
| [`architecture.md`](architecture.md) | `improve-codebase-architecture` — module/interface/depth/seam/locality | Codebase matches its ADRs; the friction is five parallel "how good is this?" scoring modules and two curated tables (`teammates.ts`/`comps.ts`) that have drifted apart despite ADR-0017 naming convergence as the target. |
| [`tech-debt.md`](tech-debt.md) | `tech-debt` audit | Unusually clean baseline (no `TODO`/`@ts-ignore`/skipped tests); the debt found is real but small — a stale `CHANGELOG.md`, no enforced coverage floor, a Fast-Refresh-breaking module split. |
| [`testing-strategy.md`](testing-strategy.md) | `testing-strategy` | High-coverage (96% lines) unit-heavy suite with a strong brute-force oracle test; zero integration/e2e layer, and a prioritized list of 11 specific test gaps ordered by risk × silence. |
| [`repo-review.md`](repo-review.md) | `repo-review` (recruiter-readiness) | Applied the mechanical fixes the other seven reports had already identified (docs, `type="button"`, `aria-label` fix, dead Tailwind token); left every refactor, test-writing task, and design decision for a deliberate follow-up. |
| [`accessibility.md`](accessibility.md) | WCAG 2.1 AA | 9 findings (0 critical, 2 major, 7 minor) in an already accessibility-literate codebase; the one real gap is an untested focus-return path on the app's only modal dialog. |
| [`hallmark-audit.md`](hallmark-audit.md) | Anti-AI-slop design review | 1 critical (a ✨ emoji on the AI-explain button), 3 major (mismatched icon voice, a section-heading layout that pattern-matches a banned eyebrow shape, hex/RGB palette instead of OKLCH), 3 minor. |
| [`web-design-guidelines.md`](web-design-guidelines.md) | Vercel Web Interface Guidelines | Small, mostly `name`/`aria-label` form-hygiene gaps (since fixed) plus two informational notes (locale-format formatting, state-not-in-URL) that read as deliberate scope choices rather than defects. |
| [`ponytail-audit.md`](ponytail-audit.md) | Over-engineering / YAGNI audit | Lean codebase; one finding — `src/game/registry.ts`'s single-member `GameId` registry re-grows the exact speculative-multi-game shape ADR-0012 already removed once, at the display-copy layer instead of the adapter layer. |

## Already fixed (by `repo-review.md`, 2026-09-06)

Do not re-file these as issues — confirmed applied and verified (`npm run
lint`/`typecheck`/`test`/`docs:check` green, 613/613 tests passing):

- `CHANGELOG.md` — `[Unreleased]` section backfilled (tech-debt TD-2).
- `FILE-MAP.md` — `src/roster` and `api` purpose lines corrected (architecture #5).
- `type="button"` added to the 7 buttons missing it (accessibility #4).
- `.touch-target` class added to `RosterView`'s row button (web-design-guidelines).
- Mismatched `aria-label="UID"` removed from `ImportPanel`'s UID input; test selectors updated (accessibility/web-design-guidelines WCAG 2.5.3 finding).
- `name` attributes added to `ArtifactForm`'s level input and `OptimizePanel`'s minimum-ER input (web-design-guidelines).
- Dead `tailwind.config.js` `boxShadow.glow` token deleted (hallmark-audit #7).
- `AGENTS.md` confirmed as a pointer to `CLAUDE.md`/`memory/`, no drift (tech-debt TD-10).

## Consolidated prioritized findings

Deduplicated across all eight reports (the same underlying fact reported by
more than one audit — e.g. the `aria-label`/`type="button"` items above
appeared in both `accessibility.md` and `web-design-guidelines.md` — is
listed once, above, as already fixed). P1 = ships-as-slop, correctness risk,
or a decision the project has already made and not yet executed. P2 = real
value, moderate effort, no urgent externally-visible harm. P3 = cosmetic,
speculative, or routine maintenance.

| Pri | Area | Source report | Action |
|---|---|---|---|
| P1 | Domain data | architecture #2 | Derive `OptimizePanel`'s teammate blurb from `comps.ts`'s per-character archetype slot instead of maintaining `src/meta/teammates.ts` as a second, drifted table — executes ADR-0017's own named target state (~700 lines net deletion). |
| P1 | Design/AI feature | hallmark-audit #1 | Remove the ✨ emoji from `ExplainBuild.tsx`'s "Explain This Build"/"Regenerate" buttons; the label text alone already carries the action. |
| P1 | Design/icons | hallmark-audit #2 | Replace the four bare Unicode/emoji glyphs (`▶` in `RosterView.tsx`/`Results.tsx`, `✓` in `BuildCard.tsx`, `🔒` in `App.tsx`) with hand-drawn inline SVGs, matching the discipline `SlotGlyph.tsx` already established and documented. |
| P1 | Testing | accessibility #5 | Add a regression test asserting focus returns to the triggering row button after `AppDrawer` closes — the app's only true modal dialog, currently with zero coverage for that behavior. |
| P2 | Testing infra | tech-debt TD-6 + TD-7 | Fill the specific low-branch-coverage gaps (`Drawer.tsx` 50%, `ArtifactForm.tsx` 66.7%, `advise.ts` 63.6%, `landing.tsx` ~68%) first, then add `thresholds` to `vite.config.ts`'s `test.coverage` block so a coverage regression actually fails CI instead of only appearing in the report. |
| P2 | Testing gaps | testing-strategy §5 (items 1–4) | Add the four highest risk×silence test gaps: `damage/setBonuses.ts`'s untested curated 4pc branches (~341, 348-350, 386), `meta/gap.ts`'s `2pc`/multi-`2pc` branches (53-57), `invest/advise.ts`'s `craftableFor` (line 42), and `import/dedupe.ts`'s uncovered function/branch — each is hand-curated data or dedupe logic where a silent regression ships wrong. |
| P2 | Testing gaps | testing-strategy §5 (items 5–10) | Add: `share/url.ts`'s malformed/tampered-link decode path (202, 260); `damage/formula.ts`'s `levelMult` at non-default levels (39-56, 127-130); `plan/composePlan.ts` branch coverage (~129, 156, 164); `ArtifactForm.tsx` validation branches; a real Web Worker smoke test for `optimize.worker.ts`; one end-to-end golden-path test (import → optimize → share → decode) per the report's worked plan. |
| P2 | Architecture | architecture #1 | Give the five "how good is this?" scoring surfaces a documented hierarchy (now in `CONTEXT.md`'s "Five things called 'score'") and replace `roster/buildScore.ts`'s `pieceCritValue()` reimplementation with a direct call into `optimizer/score.ts`'s `objectiveValue()`, so the two formulas can't silently diverge. |
| P2 | YAGNI | ponytail-audit #1 | Delete `src/game/registry.ts` (single-member `GameId`/`GAMES` registry, one call site); inline its six `GameDescriptor` fields as local constants in `App.tsx` and `landing.tsx`. Re-introduce only when a second game is actually built, per ADR-0012's own precedent. |
| P2 | Design | hallmark-audit #3 | Stack the numbered section badge above the heading (or fold the number into the heading text) in `landing.tsx`'s shared `Section` wrapper, instead of the current side-by-side flex row that pattern-matches a banned eyebrow-beside-heading shape. |
| P2 | Design system | hallmark-audit #4 | Re-express the accent (`bright`/`DEFAULT`/`deep`) and seven `element.*` hex/RGB values as OKLCH triplets sharing one perceptual-lightness formula, so a future accent step or eighth element hue doesn't require freehand hex-picking. |
| P3 | Accessibility | accessibility #1 | Decide deliberately on placeholder contrast (currently `placeholder:text-muted/60` ≈ 2.96:1, below 4.5:1) — raise to `/80` or accept given every field has a persistent visible label. |
| P3 | Accessibility | accessibility #2 | Run an automated contrast check over all 7 `element.*` hues (only pyro/dendro were hand-verified) as a one-time sanity pass. |
| P3 | Accessibility | accessibility #3 | `Combobox` listbox option rows (~34-36px) fall short of the app's own 44px `.touch-target` floor — a AAA-level nit (2.5.5), not an AA failure; raise `py` or leave as a deliberate density trade-off for a 235-option list. |
| P3 | Accessibility | accessibility #7 | Tie `ArtifactForm`'s "hand-added pieces carry no sub-stats yet" caveat to a specific control via `aria-describedby` rather than body copy alone. |
| P3 | Accessibility | accessibility #8 | Add inline `aria-invalid`/validation to `OptimizePanel`'s minimum-ER input instead of surfacing bad input only via a post-run "No build satisfies all constraints." |
| P3 | Accessibility | accessibility #9 | Replace the literal `•` bullet characters in `GapReport.tsx`/`PlanView.tsx`'s `<li>`s with `list-style`/`::marker` or an `aria-hidden` glyph — screen readers already announce list membership. |
| P3 | i18n | web-design-guidelines | `labels-core.ts`'s `formatScore`/`formatStat`/`formatCritRatio` use `Number.toFixed()` (en-US-hardcoded) instead of `Intl.NumberFormat`; latent gap only, app is English/US-only by design today. |
| P3 | Copy | web-design-guidelines | `OptimizePanel`'s and `ImportPanel`'s example-value placeholders (`"Optional — e.g. 200"`, `"700000000"`) don't follow the project's ellipsis convention for placeholders — cosmetic. |
| P3 | Design system | hallmark-audit #5 | Add named easing tokens (`--ease-out`/`--ease-in`/`--ease-in-out`) to `tailwind.config.js`, or document that Tailwind's default timing is the deliberate house choice — closes a "no policy" gap, not a visible bug. |
| P3 | Architecture | architecture #3 | Extract `App.tsx`'s run-lifecycle + live-region-announcer block (`runToken`, `currentRun`, `cancelCurrent`, `runCurrent`, `announce`) into a `useOptimizeRun()` hook for independent testability and locality — readability cost, not a bug; nothing here is untested today. |
| P3 | Architecture | architecture #4 | Audit `workers/optimizeClient.ts`'s `dispatch()` branches (message success/error, `onerror`, `onmessageerror`, cancel-before/after-worker-created, no-Worker fallback) for direct (non-integration) test coverage before the module grows further. |
| P3 | Code hygiene | tech-debt TD-1 | Split `landing.tsx`'s `STEPS`/`LOCKED_HINT` constants and `useScrollSpy` hook into sibling modules to clear the 2 Fast-Refresh ESLint warnings. |
| P3 | Dependencies | tech-debt TD-3 | Batch the 19 outdated patch/minor packages via the existing Dependabot flow; schedule `@vercel/node` 12, Tailwind 4, TypeScript 7, and Vitest 5 as separate, manually-verified major-bump PRs. |
| P3 | Dependencies | tech-debt TD-4 | Re-run `npm audit` after the `@vercel/node` major bump (TD-3) lands — the 9 current findings (1 critical, 5 high) are all in dev-only transitive deps (`tar`, `undici` via `@vercel/nft`/`jsdom`), not shipped code. |
| P3 | Code/data | tech-debt TD-8 | No action needed now — `comps.ts` (1097 lines), `teammates.ts` (751), `search.ts` (733), `profiles.ts` (690), `metaTargets.ts` (647) are mostly curated data, not tangled logic; revisit `search.ts` only if it gains a second regular contributor. |
| P3 | CI hygiene | tech-debt TD-9 | Add a one-line comment to `.github/workflows/coverage-badge.yml` explaining why the force-push to the disposable `badges` branch is safe, so the pattern isn't copied somewhere riskier. |
| P3 | Test hygiene | testing-strategy §3 | Add `beforeEach(() => vi.resetModules())` to `api/_ratelimit.test.ts` so its two order-dependent "first warning" tests stop relying on Vitest's default declaration-order execution. |

## Not carried into the table

- **Accessibility #6** ("no keyboard path to a zero-result Combobox state
  beyond visible text") — the report itself marks this "✅ Pass, documented
  for completeness," not a gap.
- **Hallmark-audit #6** (coloured glow shadow on the primary CTA) — the
  report's own verdict is "no change needed," flagged only so the pattern
  isn't copied elsewhere.
- **Web-design-guidelines'** "state not reflected in the URL" note — read by
  its own report as a deliberate scope decision (the app already has a
  purpose-built share mechanism for the one thing worth deep-linking), not a
  defect.
- **Tech-debt TD-5** (local `node_modules` staleness on the audit machine) —
  not a repo defect; a local `npm ci` note, not issue-worthy.

## Using this table

Each P1/P2 row is scoped tightly enough to become one issue; several P3 rows
naturally batch together (e.g. the five small accessibility P3s, or the
testing-strategy items already grouped as two rows above). See
`docs/agents/issue-tracker.md` for this repo's issue conventions before
filing.
