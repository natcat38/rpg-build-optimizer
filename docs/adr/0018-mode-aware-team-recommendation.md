# 0018. Mode-aware team recommendation

- Status: Accepted
- Date: 2026-08-20

## Context

"Recommend me a team" has no single answer — it depends on the content. Spiral
Abyss needs **two teams at once, sharing no character**. Imaginarium Theater
draws from a rotating element pool with a much wider cast requirement. Stygian
Onslaught is a single-team boss rush.

A recommender that ignores this returns the two strongest teams on paper, which
in Abyss frequently means the same four characters twice — useless advice.

## Decision

Recommendation is **mode-aware**, keyed by an **endgame mode**
(`abyss | theater | stygian`), and each archetype declares the modes it applies
to. Abyss ships; the other two are listed in the UI as coming soon rather than
silently absent, so the shape of the feature is honest.

For Abyss, `recommendAbyss` instantiates every archetype against the roster,
then searches every ordered pair (first half, second half) with the first half's
members excluded from the second, and keeps the pair that **maximises the weaker
half**. An Abyss clear is bounded by its worse team, so max-min is the objective
that matches the content — maximising the sum would happily pair a stacked first
half with an unclearable second.

Slot filling within an archetype is greedy in listed order, taking the owned
option that maximises `optionWeight × buildScore`
(`// ponytail: greedy slot fill, exact 4-slot assignment if curation ever makes
greedy visibly wrong`). Archetypes short exactly one slot become **gaps** —
near-misses worth reporting, and Phase 5's input for investment advice.

Theater and Stygian are additive later: Theater needs element-pool filtering and
a wider roster-coverage objective; Stygian needs single-team ranking. Neither
changes the archetype schema.

## Consequences

- Two halves are guaranteed disjoint, which is what the content requires.
- The pair search is O(archetypes²) instantiations — ~900 cheap pure calls for
  the current 30 archetypes, well inside a render.
- A roster that cannot field two teams gets an explicit "not yet" rather than a
  fabricated second half.
