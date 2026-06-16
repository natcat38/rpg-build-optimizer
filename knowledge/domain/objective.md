---
type: Domain Entity
title: Objective
description: The single stat the optimiser maximises when ranking valid builds.
resource: ../../CONTEXT.md
tags: [domain, optimisation]
timestamp: 2026-06-15T00:00:00Z
---

# Schema

The objective is the single value the [optimiser](/components/optimiser.md) maximises
over all feasible [builds](/domain/build.md). It is either a stat key
(see [artifact](/domain/artifact.md)) or a derived quantity:

- **Crit Value (CV)** — `crit_rate * 2 + crit_dmg`, a common objective.
- **Elemental Mastery (EM)** — `em`.

Ties are broken softly by crit ratio; the objective itself is always a single scalar so
the search returns an exact, totally-ordered top-K.

# Citations

[`CONTEXT.md`](../../CONTEXT.md);
[ADR-0004](../../docs/adr/0004-exact-branch-and-bound-optimisation.md).
