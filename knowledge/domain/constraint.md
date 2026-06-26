---
type: Domain Entity
title: Constraint
description: A hard requirement a build must satisfy; infeasible constraints yield NO_FEASIBLE_BUILD.
resource: ../../CONTEXT.md
tags: [domain, optimisation]
timestamp: 2026-06-15T00:00:00Z
---

# Schema

A constraint is a hard requirement on a [build](/domain/build.md):

- **Set requirement** — e.g. a `4pc` set, or a `2+2`.
- **Minimum stats** — e.g. Energy Recharge ≥ 160% (`er_pct`). Every character starts
  from a universal 100% base ER supplied by the [genshinAdapter](/components/game-adapter.md).
- **Main-stat lock** — fixing a slot's main stat (e.g. sands = `atk_pct`).

Infeasible constraints produce `NO_FEASIBLE_BUILD`. Conditional `4pc` set effects are
honoured here as a constraint rather than scored. The crit ratio (healthy ≈ 1:2) is a
**soft tiebreak**, never a hard constraint.

# Citations

[`CONTEXT.md`](../../CONTEXT.md);
[ADR-0009](../../docs/adr/0009-adapter-owns-universal-game-baselines.md).
