# 0008. GameAdapter seam for multi-game extensibility

- Status: Superseded by [ADR-0012](0012-collapse-gameadapter-seam-to-concrete-adapter.md)
- Date: 2026-06-06

## Context

Genshin ships first, but Wuthering Waves is a future candidate. We want to add a second game without rewriting the optimiser, UI, or share layer.

## Decision

All Genshin-specific code lives behind a **`GameAdapter`** interface (slots, characters, weapons, sets, base stats). The optimiser, UI, and share layer depend **only** on `GameAdapter`, never on Genshin-specific imports. Genshin-only `Slot`/`StatKey` vocabularies stay on the adapter, not leaked into shared code.

The seam is **proven, not just claimed**: a tiny stub second-game adapter is used in tests to show the optimiser runs unchanged against different game data (v1.1 craftsmanship item).

## Consequences

- Adding Wuthering Waves later = a new dataset + adapter; core stays untouched.
- Wuthering Waves is **not** a shipped game in this phase — the seam is proven in tests only; no full second-game dataset.
- Reinforces the testability/architecture story for the portfolio.
