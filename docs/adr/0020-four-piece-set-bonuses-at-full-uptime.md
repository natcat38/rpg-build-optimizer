# 0020. 4-piece set bonuses, modelled at full uptime

- Status: Accepted
- Date: 2026-08-22
- Amends: [0003](0003-stat-only-model-no-damage-engine.md) (which declined to score conditional 4pc effects) and the "reaction DMG bonus% from sets" exclusion in [0016](0016-damage-engine-objective.md)

## Context

[0003] scored only the flat-stat part of a 2-piece bonus and honoured 4-piece
requirements as a **hard constraint** the score could not see. That was a
defensible edge while the objective was "maximise one stat": a 4pc effect is
prose, and turning prose into a number needs an assumption nobody had written
down.

It stopped being defensible once [0016] added `avg_damage`. A damage number that
silently omits "+40% CRIT Rate against Frozen opponents" is not a conservative
estimate — it is the wrong shape. Two Blizzard Strayer builds are ranked as if
the set did nothing, and a Marechaussee Hunter build that trades away CRIT Rate
substat rolls (because the set hands it 36% for free) is scored as though it
had thrown those rolls away.

The frozen `genshin-db` snapshot cannot help: every `sets[].fourPiece` in
`data.generated.json` is absent, because the source data has the bonus as
descriptive text, not a stat vector.

## Decision

Model 4-piece set bonuses at **full uptime / max stacks**, from a hand-curated
table — `src/damage/setBonuses.ts` — that sits alongside `DAMAGE_PROFILES` and
`META_TARGETS` as owner-reviewed content, not generated data. Each entry cites
its source and **states its uptime assumption in prose**, next to the number.

Where a set has no honest self-buff number, it is **not** given one: it goes in
`UNMODELLED_FOUR_PIECE` with the reason, so the omission is visible rather than
a silent zero. Enemy RES shred (Viridescent Venerer, Deepwood Memories) stays
out for two reasons — it is a team effect the wearer's build does not control,
and it is a constant factor across every candidate build, so it cannot change
a ranking either way. Transformative-reaction bonuses stay out under [0016].

### Two channels, because the pruning bound can only see a stat vector

- **`sheet`** — the flat sheet stat the effect reduces to at full uptime
  (Crimson Witch's three stacks are simply "+22.5% Pyro DMG"). Honest for any
  objective, so it feeds the scalar path too: a `crit_value` search on a
  Blizzard Strayer build now knows about the 40% CRIT Rate.
- **`hitDmg` / `burstDmgFromEr`** — a DMG% restricted to one or more hit kinds
  ("+35% Normal Attack DMG"). Not a sheet stat, so it **never** reaches a
  scalar objective. It is folded into `elemental_dmg` only for `avg_damage`,
  weighted by the share of that character's damage profile the buffed hit kinds
  account for, measured at the character's base stats.

`DamageHit` therefore gained a `kind` field (`normal | charged | plunge | skill
| burst`) — every curated profile hit declares which DMG-bonus bucket it is in.

Two special cases are handled by data rather than by exception:

- **Weapon gates.** Gladiator's Finale and Wanderer's Troupe do nothing for the
  wrong weapon class, so entries carry `weaponTypes` and `buildContext` drops
  them when the request's weapon does not match. An _unknown_ weapon key keeps
  the bonus, matching `canEquip`'s "absence of evidence is not evidence".
- **Emblem of Severed Fate** scales with the build's own ER, which is not a
  constant. It is resolved once against the damage profile's `erRequirement`
  (the ER floor the build is being optimised toward), not against each
  candidate's ER. A per-build value would make the bound non-constant; see
  admissibility below.

### Where the bonus is applied

Nowhere new. `totals()` (`src/optimizer/score.ts`) already added
`ctx.setBonuses[key].four` at `countSets >= 4`; that path was dormant because
nothing ever populated `four`. `buildContext` (`src/optimizer/context.ts`) now
populates it from the curated table. The damage engine picks the bonus up for
free, because `targetFunctionScore` reads those same totals.

### Admissibility (ADR-0004) is untouched — by construction

Everything a 4pc grants becomes a `StatVec` **before** the search starts, in
`buildContext`. The consequences:

- `setCeilingVector` and `setBonusCeilingAt` (`src/optimizer/search.ts`) already
  bound `four` correctly; they need no change and got none.
- The bound and the leaf score read the **identical** vector out of `ctx`, so
  they cannot drift — the same property the 2026-08-21 amendment to [0004]
  established for the per-artifact term.
- The damage function is monotone in every stat it reads ([0016]), and the
  ceiling is a statwise maximum, so an optimistic vector carrying a 4pc that the
  leaf may not actually light up still over-estimates. The `avg_damage` oracle
  fixture in `search.test.ts` now carries non-empty `four` vectors on both sets,
  so this case is actually exercised rather than assumed.

**The honest caveat.** Folding a hit-kind bonus into `elemental_dmg` is an
approximation: the true share of damage coming from Normal Attacks shifts a
little as artifacts change the totals, and the model freezes it at the base
stats. It is an approximation of the _objective_, not of the _search_ — the
optimiser still returns the provable optimum of the objective it is given.

## Consequences

- Builds that satisfy the same 4pc requirement are no longer ranked as if the
  set were inert, which was [0003]'s most-cited limitation.
- Every damage figure now rests on stated assumptions ("3 Marechaussee stacks",
  "the target is Frozen"). `fourPieceAssumptions(setKeys)` returns one line per
  set a build actually activates; the UI prints these under the damage-profile
  source line in `CharacterDetail`, beside the existing
  `estimated — for comparing builds, not matching in-game numbers` copy.
- Optimistic by design. Vermillion Hereafter at 4 HP-loss stacks and Blizzard
  Strayer against a permanently Frozen target flatter those sets relative to an
  unconditional one. Full uptime is a convention, chosen because it matches how
  community build guides quote these sets, and because the alternative — a
  guessed uptime fraction per set — would be a second layer of invention.
- A second content file goes stale with the meta, and belongs on the
  patch-refresh runbook's review list alongside `DAMAGE_PROFILES`.
- **Not done here:** hit-kind-restricted **2-piece** bonuses (Noblesse Oblige's
  +20% Burst DMG, Golden Troupe's +20% Skill DMG) are still unscored, because
  the snapshot stores 2pc as a stat vector and these have no vector form. The
  `hitDmg` channel would extend to them unchanged; it is left for a follow-up so
  this decision changes one thing at a time.

## Sourcing note

The bonus text was gathered from the Genshin Impact Fandom wiki pages cited per
entry, cross-read against community build guides. Direct page fetches were
unavailable during the research pass (the fetch tool returned HTTP 402
throughout), so the wording came from search-result excerpts of those pages
rather than a byte-exact read. The two newest sets in the meta table —
Scroll of the Hero of Cinder City and Disenchantment in Deep Shadow — could not
be confirmed to that standard and are listed as unmodelled rather than guessed.
A patch refresh should re-verify the table against the wiki directly.
