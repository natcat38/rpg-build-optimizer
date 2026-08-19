# 0016. Damage engine as an optimisation objective

- Status: Accepted
- Date: 2026-08-20
- Supersedes: [0003](0003-stat-only-model-no-damage-engine.md) (the stat-only objectives remain, as the fallback)

## Context

[0003] declined a damage engine: modelling damage looked like character, enemy,
reaction and rotation modelling with heavy per-character maintenance, for a tool
that wanted to stay fast, explainable and character-agnostic.

The v2 endgame planner changes what the tool is for. Ranking a character's own
artifacts by a single stat is a good proxy while the build is one of many stats;
it stops being one when the output is "here are the builds for your eight Abyss
characters". A crit-value ranking cannot tell a Neuvillette HP goblet from an
ATK goblet, and cannot compare an EM-heavy Alhaitham build to a crit-heavy one.

Research (`docs/research/2026-08-20-damage-calc-and-game-data.md`) found that
nothing off the shelf is installable: genshin-optimizer's Pando engine is
unpublished Nx-internal code and gcsim is a Go rotation simulator. It also found
that the KQM formula is short, closed-form and stable across patches, and that
build ranking in practice uses **target functions** — a small weighted set of
hits — not full rotation simulation.

## Decision

Add `avg_damage` as a third kind of **objective**, alongside the stat keys and
`crit_value`:

- `src/damage/formula.ts` implements the KQM damage formula as pure functions.
- A **damage profile** (`src/damage/profiles.ts`) is a weighted list of stand-in
  hits per character. The **target function** is `Σ weight × hit damage`.
- `evaluateObjective(ctx, objective, totals)` in `src/optimizer/score.ts` is the
  single evaluator that scores a build — the search and the diagnostics both go
  through it, so no second scoring path can drift from it. (Gap analysis reads
  the totals and diagnostics it produced rather than scoring anything itself.)
- The optimiser stays **exact** ([0004](0004-exact-branch-and-bound-optimisation.md)).
  The scalar-additive pruning bound does not hold for a multiplicative objective,
  so `avg_damage` searches run the same recursion in **vector mode**: the bound
  evaluates the objective on an optimistic _stat vector_ (running totals + the
  statwise maximum of everything still selectable + a statwise set-bonus
  ceiling). This is admissible because the damage function is monotone in every
  stat it reads — asserted directly in `formula.test.ts` and proved end-to-end by
  the brute-force oracle in `search.test.ts`.
- Every damage figure in the UI carries the copy
  `estimated — for comparing builds, not matching in-game numbers`.
- The objective is offered only for characters with a curated profile; the
  picker drops the selection when the user switches to one without.

Multipliers are read at **talent level 9** from the frozen `genshin-db` snapshot
([0002](0002-frozen-bundled-reference-dataset.md)), so profiles introduce no new
data source. Which hits appear, and their weights, approximate the rotation the
character's KQM guide describes and are reviewed by the owner as content.

### Deliberately excluded from v1

- **Transformative reactions** (swirl, overload, bloom family). They do not scale
  with the build's crit or DMG bonus, so they cannot discriminate between
  artifacts — including them would add noise, not ranking power.
- **DEF shred / DEF ignore knobs.** Both are constant factors on every candidate
  build, so they cannot change the ranking. YAGNI until the app compares
  characters rather than a character's own artifacts.
- **Reaction DMG bonus%** from sets and weapons (Crimson Witch 4pc, etc.), for
  the same reason as above at the level of a single character's ranking.
- **Rotation simulation** (energy, cooldowns, buff uptime). That is gcsim's job.

## Consequences

- Neuvillette-style HP scalers, EM scalers, and reaction triggers now rank
  correctly against each other within one character's inventory.
- A per-character curated file joins `META_TARGETS` as content that goes stale
  with the meta and needs owner review on refresh.
- Cross-character damage comparisons are **not** supported: the weights are a
  per-character approximation, so the absolute numbers share no scale.
- The scalar path is untouched — explored/pruned counts in `docs/speed-report.md`
  are unchanged.
