# 0003. Stat-only model, no damage engine

- Status: Accepted
- Date: 2026-06-06

## Context

"Best build" could mean maximising in-game DPS, but modelling damage requires character/enemy/reaction/rotation modelling and heavy per-character maintenance. We want a fast, explainable, character-agnostic tool.

## Decision

The optimiser maximises a **single chosen stat** under constraints; it does **not** compute damage. Stat totals are:

```
total[stat] = character base (at build level) + weapon + Σ artifact mains + Σ artifact subs + scored set bonuses
crit_value  = crit_rate * 2 + crit_dmg
```

Modelling rules:

- **Weapon:** main stat + secondary stat line only. **Passives are not modelled** (most are conditional buffs that need a rotation model).
- **Set bonuses:** score the **flat-stat portion of 2-piece bonuses** and the rare 4pc that grants an unconditional flat stat. **Conditional / non-stat 4-piece effects are not scored**, but 4pc / 2+2 are still **honoured as hard constraints**.
- **`elemental_dmg`** resolves to the **character's damage element**; only element-matching elemental bonuses count toward it.
- Build level: characters and weapons are evaluated at a user-selected ascension-breakpoint level (see [0006]); artifacts at their **current owned level** in v1.0.

## Consequences

- Fast, correct for every character, zero per-character maintenance.
- A direct, documented limitation: two builds both satisfying "4pc Emblem" are ranked purely by stats — the 4pc's damage *effect* does not move the score. This is stated openly in the UI and docs; being explicit about the model's edges is a strength.
- A damage engine, weapon-passive modelling, and 4pc-effect modelling are all explicitly out of scope (possible far-future phase).
