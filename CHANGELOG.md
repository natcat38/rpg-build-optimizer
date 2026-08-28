# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow
[semver](https://semver.org/).

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
