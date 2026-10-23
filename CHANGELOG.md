# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow
[semver](https://semver.org/).

## [Unreleased]

Changes on `main` since the `v1.0.0` tag (#71–#119).

### Features

- Plan now grades the currently-equipped build alongside the optimizer's best, so a
  player can see how much headroom their existing loadout has left (#89).

### Fixed

- Results and Optimise ordering: the best build is the first thing under "Results" (it was below the gap card and two caption paragraphs), followed by the search proof, the gap card and the runners-up. The Optimise button now sits directly under the Maximise and Energy Recharge fields, with the meta recipe and teammates folded under it. Plan rows with no build say why on the row. `text-2xs` is 12px (was 11.2px), so no text on the page is under 12px.
- Two-pane layout and navigation: from `lg` the page is two panes (Load, the sample shortcut and Optimise in a sticky left column; Results, Roster, Teams and Plan on the right), so a fresh desktop load is 1.7 screens instead of 2.5 and a sample run 3.0 instead of 4.8. On phones Teams and Plan fold behind their headings. The step nav scrolls to keep the active chip in view, hides the locked chips on phones and explains them on tap elsewhere, and marks the last section scrolled past rather than the first one still on screen. The jump to Results waits for the page to stop growing (the demo hero now holds its height while it solves, so desktop layout shift is 0 instead of 0.068) and lands with the heading visible.
- Phone and reflow quick wins: form fields are 16px below `sm` so iOS Safari no longer zooms on focus; the Optimise panel and roster "Source" links have a 24px hit area (44px on touch); Plan rows wrap instead of collapsing names to "Y…"; runner-up build cards wrap artifact names instead of truncating them; and nothing scrolls sideways at 320px (Inventory header, Teams cards).
- `/api/explain` returned a 500 (`FUNCTION_INVOCATION_FAILED`) on every request in production: its relative imports had no `.js` extension, which Node ESM cannot resolve. Imports reachable from `api/` now carry `.js`, `tsconfig.api.json` uses `NodeNext` so typecheck rejects a regression, and `npm run api:check` loads the compiled handler under Node in CI.
- Inline field errors, the infeasible-search notice, and plan-build failure/progress
  messages are announced through persistent screen-reader live regions instead of
  freshly-mounted `role="alert"` nodes, which many browser/AT combinations skip (#127).
- Shared `warning` tone (contrast-measured amber), success callout on the gap report's
  "all met" message, a `.btn-danger` recipe for Clear Inventory, a shared chevron glyph,
  an external-link glyph on source links, a "no curated recipe" fallback in gap analysis,
  and a "Shortcut" chip on the sample-gear heading (#126).
- Focus now returns to the triggering row button after the roster drawer closes (#108).
- Teammate blurb in the optimizer is derived from the curated comp database instead of a
  second, drifted table; 751-line `teammates.ts` deleted (#109).
- Emoji and bare Unicode glyphs replaced with inline SVG marks matching the icon system (#107).
- Landing section numbers folded into headings instead of a side-by-side badge (#110).
- UI/UX audit fixes: accessibility, error recovery, and clarity issues found in a
  validated pass over the app (#84).
- Vite dev server port pinned to avoid collisions with sibling repos (#88).

### Changed

- Branding: the existing gold crosshair is now the small mark beside the "RPG Build Optimizer" name in the header, and the site has Open Graph and Twitter tags with a generated 1200x630 card (`public/og.png`, source `docs/brand/og-card.html`), an apple-touch-icon, PNG icons and a `site.webmanifest`. No new art: palette and type are the app's own.
- First screen: the hero now leads with the name, the claim and two actions ("Load your gear", "Try a sample"); the fixed 219.4 demo is a smaller caption beneath them. Wording unchanged.
- Audit P3 batches: placeholder contrast raised to AA, `aria-invalid`/`aria-describedby` on
  form inputs, list markers via CSS (#118); `Intl.NumberFormat` for stat labels, placeholder
  copy convention, easing policy documented (#116); run-lifecycle logic extracted to a
  `useOptimizeRun` hook, worker and rate-limit tests hardened, landing module split (#119);
  patch/minor dependency bumps and `npm audit` fixes (#117).
- 2026-09 repo audit: eight reports under `docs/research/audit-2026-09/`, mechanical
  a11y/docs fixes, `ROADMAP.md`, testing runbook, CONTEXT glossary (#105).
- Single-member game registry removed per ADR-0012 precedent (#106).
- Roster build score calls the optimizer's objective directly; locking test added (#111).
- Coverage thresholds enforced in CI (94/87/95/95) after filling branch gaps; 37 new tests
  across curated data, share links, damage formula, worker, and an e2e golden path (#112, #113, #114).
- Repo presentation: package metadata, demo GIF, and README engineering highlights (#86).
- Coverage badge now shown in the README (#79).
- `reviews/` working files dropped from the repo (#85).

### Infrastructure

- CI bumped from Node 20 to Node 22, required by the `jsdom` 30 upgrade (#87).
- `actions/setup-node` bumped from v6 to v7 (#71).
- Dependency bumps: `jsdom` 29.1.1 → 30.0.1 (#54), `@vercel/node` 5.10.1 → 10.0.0 (#83),
  `@vitejs/plugin-react` 5.2.0 → 6.1.0 (#74), `@types/node` 22.20.1 → 26.2.0 (#73), plus
  two Dependabot minor-and-patch groups (#80, #81).

## [1.0.0] — 2026-08-29

First tagged release. Summarises the shipped feature set plus the repo-quality work that
accompanied the tag.

### Features

- Artifact build optimiser for Genshin Impact: exhaustive-with-pruning search over a character's
  artifact pool, scoring builds against damage profiles and set bonuses.
- Team and roster views, character detail, plan view, and build explanation.
- GOOD-format import for bringing an existing account's artifacts in.
- Shareable build links.
- Generated dataset built from `genshin-db`, kept in sync by a CI gate.

### Changed

- Main bundle code-split: non-first-paint panels load lazily via `React.lazy` + `Suspense`.
- Landing/hero components extracted out of `App.tsx` into their own module.
- Generated dataset no longer duplicated across the main and optimizer-worker bundles.

### Added (project infrastructure)

- Bundle-size drift gate in CI (`npm run size:check`) against a checked-in gzip baseline.
- Test coverage runs in CI, with a coverage badge published to the `badges` branch.
- Report-only Lighthouse workflow against production, on main pushes and weekly.
- Non-goals section in the README and a branch-protection note in CONTRIBUTING.
