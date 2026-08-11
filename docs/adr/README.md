# Architecture Decision Records

The decision log for rpg-build-optimizer. This file is the ADRs' own index --
`knowledge/index.md` links to this directory and stops, so the list lives in
exactly one place.

`npm run docs:check` enforces that every ADR in this directory appears below,
that numbering is contiguous, and that these links resolve.

- [ADR-0001 — client-side-only architecture](0001-client-side-only-architecture.md)
- [ADR-0002 — frozen bundled reference dataset](0002-frozen-bundled-reference-dataset.md)
- [ADR-0003 — stat-only model, no damage engine](0003-stat-only-model-no-damage-engine.md)
- [ADR-0004 — exact branch-and-bound optimisation](0004-exact-branch-and-bound-optimisation.md)
- [ADR-0005 — self-contained share links](0005-self-contained-share-links.md)
- [ADR-0006 — inventory import and build-level model](0006-inventory-import-and-build-level-model.md) _(amended by ADR-0015)_
- [ADR-0007 — gap analysis with frozen meta snapshot](0007-gap-analysis-with-frozen-meta-snapshot.md)
- [ADR-0008 — GameAdapter seam for multi-game](0008-gameadapter-seam-for-multi-game.md) _(superseded by ADR-0012)_
- [ADR-0009 — adapter owns universal game baselines](0009-adapter-owns-universal-game-baselines.md)
- [ADR-0010 — serverless proxy for AI explain](0010-serverless-proxy-for-ai-explain.md)
- [ADR-0011 — elemental DMG as single fungible stat](0011-elemental-dmg-as-single-fungible-stat.md) _(amended by ADR-0014)_
- [ADR-0012 — collapse the GameAdapter seam to a concrete adapter](0012-collapse-gameadapter-seam-to-concrete-adapter.md) _(completed by ADR-0017)_
- [ADR-0013 — per-IP rate limiting on the AI explain proxy](0013-rate-limit-ai-proxy.md)
- [ADR-0014 — element-aware goblet scoring](0014-element-aware-goblet-scoring.md)
- [ADR-0015 — GOOD roster import](0015-good-roster-import.md) _(amended by ADR-0016, ADR-0018)_
- [ADR-0016 — per-character advisor: curated weapon/talent/team overlays](0016-per-character-advisor-curated-overlays.md) _(amended by ADR-0018)_
- [ADR-0017 — Genshin-only: remove the multi-game display facade](0017-genshin-only-remove-multi-game-facade.md)
- [ADR-0018 — character guides: unified data model, auto-run, and full-roster coverage](0018-character-guides-unified-model.md)
