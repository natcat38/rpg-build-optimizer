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
- Advisor overlays — one curated `CharacterGuide` record per character in `src/meta/guides/` (build recipe, substats, weapons, talents, constellations, teams), merged from per-element files into `GUIDES`. See [ADR-0016](../docs/adr/0016-per-character-advisor-curated-overlays.md) and [ADR-0018](../docs/adr/0018-character-guides-unified-model.md).

## Decisions

The decision log lives in [`docs/adr/`](../docs/adr/), indexed with titles
and supersession notes in [`docs/adr/README.md`](../docs/adr/README.md).
