---
type: Domain Entity
title: Artifact
description: A gear piece occupying one slot, with one main stat and up to four sub-stats.
resource: ../../CONTEXT.md
tags: [domain, gear]
timestamp: 2026-06-15T00:00:00Z
---

# Schema

- **Slot** — one of `flower`, `plume`, `sands`, `goblet`, `circlet`. A [build](/domain/build.md)
  is exactly one artifact per slot.
- **Main stat** — the artifact's primary stat. Flower/plume are fixed (HP/ATK);
  sands/goblet/circlet vary.
- **Sub-stat** — a secondary stat (≤4, none equal to the main stat).
- **Artifact set** — a family granting **set bonuses** at 2 (`2pc`) and 4 (`4pc`) pieces.
  Only the flat-stat portion of `2pc` (and rare flat-stat `4pc`) is **scored**;
  conditional `4pc` effects are honoured as a [constraint](/domain/constraint.md), not scored.
- **Stat keys** — `hp, hp_pct, atk, atk_pct, def, def_pct, em, er_pct, crit_rate,
crit_dmg, elemental_dmg, physical_dmg, healing`.

# Citations

Glossary: [`CONTEXT.md`](../../CONTEXT.md). Scoring rationale:
[ADR-0003](../../docs/adr/0003-stat-only-model-no-damage-engine.md).
