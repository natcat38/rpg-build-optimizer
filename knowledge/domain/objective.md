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

- **Crit Value (CV)** — `crit_rate * 2 + crit_dmg`, the default proxy for crit-scaling
  damage dealers.
- **Elemental Mastery (EM)** — `em`, for reaction-driven kits.
- **Average damage (`avg_damage`)** — estimated damage from the character's curated
  rotation, using the KQM formula ([ADR-0016](../../docs/adr/0016-damage-engine-objective.md)).
  Unlike the stat objectives it is not a plain sum over stat contributions, so the
  scalar-additive pruning bound does not apply to it.

Which objective a character gets is resolved in order: `avg_damage` when a curated
damage profile exists, otherwise the character's meta-recipe objective (e.g. `hp_pct`
for HP-scaling kits, `em` for reaction supports), otherwise `crit_value`. Every figure
`avg_damage` produces is labelled _estimated_ in the UI — it compares builds, it does
not match in-game numbers.

Ties are broken softly by crit ratio; the objective itself is always a single scalar so
the search returns an exact, totally-ordered top-K.

# Citations

[`CONTEXT.md`](../../CONTEXT.md);
[ADR-0004](../../docs/adr/0004-exact-branch-and-bound-optimisation.md).
