# RPG Build Optimizer — Knowledge

A client-side web app for Genshin Impact. Given a GOOD account export, it
recommends, for every character a player owns, the best owned artifact build,
the best owned weapon, which talents to level, an endgame team the roster can
field, and what to farm to close the remaining gap to a meta target. No
backend, no accounts; sharing is via self-contained links.

This bundle is the agent- and reviewer-readable knowledge map. The canonical
glossary is [`CONTEXT.md`](../CONTEXT.md); decisions live in [`docs/adr/`](../docs/adr/).

## Domain

- [Artifact](/domain/artifact.md) — a gear piece with a main stat and up to four sub-stats.
- [Build](/domain/build.md) — exactly one artifact per slot, scored by an objective.
- [Constraint](/domain/constraint.md) — a hard requirement a build must satisfy.
- [Objective](/domain/objective.md) — the single stat the optimiser maximises.

## Components

- [Optimiser](/components/optimiser.md) — exact branch-and-bound top-K search.
- [GameAdapter](/components/game-adapter.md) — the concrete `genshinAdapter` owning game data and baselines.
- [Share link](/components/share-link.md) — the self-contained build snapshot in a URL.

## Data

- [Reference data](/data/reference-data.md) — the frozen game rulebook + inventory import.
- Advisor overlays — curated, frozen tables in `src/meta/`: `WEAPON_RANKINGS` (weapon rec), `TALENT_TARGETS` (talent priority/levels), `TEAM_COMPS` (roster-filterable team comps), alongside the existing `META_TARGETS`. See [ADR-0016](../docs/adr/0016-per-character-advisor-curated-overlays.md).

## Decisions

The full decision record is in [`docs/adr/`](../docs/adr/):

- [ADR-0001 — client-side-only architecture](../docs/adr/0001-client-side-only-architecture.md)
- [ADR-0002 — frozen bundled reference dataset](../docs/adr/0002-frozen-bundled-reference-dataset.md)
- [ADR-0003 — stat-only model, no damage engine](../docs/adr/0003-stat-only-model-no-damage-engine.md)
- [ADR-0004 — exact branch-and-bound optimisation](../docs/adr/0004-exact-branch-and-bound-optimisation.md)
- [ADR-0005 — self-contained share links](../docs/adr/0005-self-contained-share-links.md)
- [ADR-0006 — inventory import and build-level model](../docs/adr/0006-inventory-import-and-build-level-model.md) _(amended by ADR-0015)_
- [ADR-0007 — gap analysis with frozen meta snapshot](../docs/adr/0007-gap-analysis-with-frozen-meta-snapshot.md)
- [ADR-0008 — GameAdapter seam for multi-game](../docs/adr/0008-gameadapter-seam-for-multi-game.md) _(superseded by ADR-0012)_
- [ADR-0009 — adapter owns universal game baselines](../docs/adr/0009-adapter-owns-universal-game-baselines.md)
- [ADR-0010 — serverless proxy for AI explain](../docs/adr/0010-serverless-proxy-for-ai-explain.md)
- [ADR-0011 — elemental DMG as single fungible stat](../docs/adr/0011-elemental-dmg-as-single-fungible-stat.md) _(amended by ADR-0014)_
- [ADR-0012 — collapse the GameAdapter seam to a concrete adapter](../docs/adr/0012-collapse-gameadapter-seam-to-concrete-adapter.md) _(completed by ADR-0017)_
- [ADR-0013 — per-IP rate limiting on the AI explain proxy](../docs/adr/0013-rate-limit-ai-proxy.md)
- [ADR-0014 — element-aware goblet scoring](../docs/adr/0014-element-aware-goblet-scoring.md)
- [ADR-0015 — GOOD roster import](../docs/adr/0015-good-roster-import.md) _(amended by ADR-0016)_
- [ADR-0016 — per-character advisor: curated weapon/talent/team overlays](../docs/adr/0016-per-character-advisor-curated-overlays.md)
- [ADR-0017 — Genshin-only: remove the multi-game display facade](../docs/adr/0017-genshin-only-remove-multi-game-facade.md)
