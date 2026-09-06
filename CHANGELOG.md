# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow
[semver](https://semver.org/).

## [Unreleased]

Changes on `main` since the `v1.0.0` tag (#71–#114).

### Features

- Plan now grades the currently-equipped build alongside the optimizer's best, so a
  player can see how much headroom their existing loadout has left (#89).

### Fixed

- Focus now returns to the triggering row button after the roster drawer closes (#108).
- Teammate blurb in the optimizer is derived from the curated comp database instead of a
  second, drifted table; 751-line `teammates.ts` deleted (#109).
- Emoji and bare Unicode glyphs replaced with inline SVG marks matching the icon system (#107).
- Landing section numbers folded into headings instead of a side-by-side badge (#110).
- UI/UX audit fixes: accessibility, error recovery, and clarity issues found in a
  validated pass over the app (#84).
- Vite dev server port pinned to avoid collisions with sibling repos (#88).

### Changed

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
