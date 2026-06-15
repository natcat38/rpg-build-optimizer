---
type: Domain Entity
title: Build
description: A complete set of exactly one artifact per slot, scored by the chosen objective.
resource: ../../CONTEXT.md
tags: [domain]
timestamp: 2026-06-15T00:00:00Z
---

# Schema

A build is exactly one [artifact](/domain/artifact.md) per slot (flower, plume, sands,
goblet, circlet), evaluated at a single **build level** (default 90) for both character
and weapon.

- **2+2** — a build satisfying two different `2pc` set bonuses simultaneously.
- **Build snapshot** — the self-contained state encoded in a [share link](/components/share-link.md):
  character, weapon, build level, five full artifacts, constraints, objective, meta target.
- **Anti-clone cap** — the results rule preventing near-identical builds from filling the top-K.

A build is produced by the [optimiser](/components/optimiser.md), must satisfy every
[constraint](/domain/constraint.md), and is ranked by its [objective](/domain/objective.md) score.

# Citations

[`CONTEXT.md`](../../CONTEXT.md);
[ADR-0006](../../docs/adr/0006-inventory-import-and-build-level-model.md).
