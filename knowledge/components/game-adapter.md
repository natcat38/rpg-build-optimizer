---
type: Component
title: GameAdapter
description: The interface isolating game-specific data so a second game can slot in without touching the optimiser.
resource: ../../src/game
tags: [component, architecture, seam]
timestamp: 2026-06-15T00:00:00Z
---

# Schema

`GameAdapter` is the seam that keeps the [optimiser](/components/optimiser.md) game-agnostic.
Genshin ships first; Wuthering Waves can slot in later behind the same interface. The
adapter also owns universal game-wide baselines — e.g. the 100% base Energy Recharge every
character starts from — rather than the frozen [reference data](/data/reference-data.md) snapshot.

# Citations

[ADR-0008 — GameAdapter seam for multi-game](../../docs/adr/0008-gameadapter-seam-for-multi-game.md);
[ADR-0009 — adapter owns universal game baselines](../../docs/adr/0009-adapter-owns-universal-game-baselines.md).
Source: [`src/game`](../../src/game).
