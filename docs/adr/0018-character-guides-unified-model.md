# 0018. Character guides: unified data model, auto-run, and full-roster coverage

- Status: Accepted
- Date: 2026-07-23
- Amends: [0015](0015-good-roster-import.md), [0016](0016-per-character-advisor-curated-overlays.md)

## Context

[0016] gave the app curated weapon/talent/team overlays per character, but
four things kept it short of the official-style per-character guide page
(e.g. Kuro Games' Wuthering Waves guide pages) it's now explicitly aiming to
match, personalized against the player's real GOOD inventory instead of
static prose:

1. **Four parallel curated tables** (`META_TARGETS`, `WEAPON_RANKINGS`,
   `TALENT_TARGETS`, `TEAM_COMPS`), each keyed by character but curated from
   the _same_ single source guide per character. Splitting one guide's worth
   of information across four files was awkward to curate and about to
   become worse — this ADR adds two more sections (substats,
   constellations), which would have made it six.
2. **No auto-run.** The artifact recommendation — the centerpiece of a guide
   page — required a manual "Optimise" click even for a fully curated
   character with an owned ranked weapon.
3. **Missing guide sections.** No recommended-stat thresholds, no substat
   priority order, no constellation guidance, and only one team comp per
   character with no visibility into a teammate's own recommended gear.
4. **Coverage stuck at 30/116** characters.

## Decision

**One `CharacterGuide` record per character**
([`src/meta/guides/types.ts`](../../src/meta/guides/types.ts)), replacing the
four tables. Each optional section (`build`, `substats`, `weapons`,
`talents`, `constellations`, `teams`) mirrors its predecessor's shape
exactly — this is a re-grouping of existing data, not a new schema — plus one
canonical `source` URL per character instead of one per table (verified
identical across the four legacy tables' entries before merging). Curated
per-element files (`anemo.ts`, `cryo.ts`, …) keep each file reviewable at up
to ~116 entries; `src/meta/guides/index.ts` merges them into `GUIDES` and
carries the same pure helpers [0016] already had
(`bestOwnedWeapon`, `talentGaps`, `bestFieldableComp`, `metaToConstraints`),
plus new ones below. Same epistemic contract as before: hand-transcribed from
`source`, gracefully absent rather than guessed for uncovered characters or
sections.

**Auto-run on open, shared with roster grading.** A new non-persisted
`useBuildCache` store ([`src/state/buildCache.ts`](../../src/state/buildCache.ts))
holds meta-preset solves keyed by character. `RosterDashboard`'s existing
per-character grading loop ([0016]) writes every solve it computes into this
cache; selecting a curated character in `App.tsx` applies the same "Use meta
build" preset pipeline and either serves the cached result (freshness =
reference equality on the artifacts/weapons/roster snapshot the solve used,
valid because every import/roster mutation in this codebase replaces its
store's array/object wholesale) or runs it fresh — never both, so a curated
character's build is solved at most once per inventory state. Manual
`OptimizePanel` overrides bypass the cache entirely; it holds meta-preset
solves only.

**Two new curated sections**, same contract as the rest:
`substats` (ranked priority + optional hard floors, rendered
"Energy Recharge (≥120%) > CRIT Rate > ATK" — the same literal format
official guide pages use) and `constellations` (recommended breakpoints with
a one-line note each).

**Constellation guidance is now personalized, amending [0015]/[0016]'s
exclusion.** [0015] declined to parse `characters[].constellation` reasoning
the stat-only model ([0003]) had no lever for it; [0016] repeated that
exclusion. Neither reasoning applies to _displaying curated guidance_: a
recommended breakpoint list needs only the player's _current_ constellation
level to check off against, the same plain-integer-comparison shape talent
targets already use — not a damage lever. `parseGOODRoster` now also reads
`characters[].constellation` (0–6) into `RosterEntry.constellation`. The
comparison stays advisory/ordinal only; [0003]'s no-damage-engine stance is
untouched.

**Team comps use their existing array for real.** `TeamComp[]` was already
plural in [0016]'s schema (`comps: TeamComp[]`) but every character had
exactly one entry. The advisor now shows the best-fieldable comp plus any
others as alternatives, and each teammate slot (in the primary comp and
alternatives) shows that teammate's own recommended weapon and artifact set
inline, resolved from their own `GUIDES` entry — pure reuse, no new data.

**Hash route.** `#/c/<characterKey>` syncs with the selected character in
`App.tsx` (~15 lines, no router dependency) so a refresh or shared link keeps
the guide page open, matching how the reference guide pages are addressable.

**Explicit scope-outs**, so these read as decisions rather than gaps:

- **Alternative artifact-set configs** (the reference page's second
  recommended-echo-set block) — moot here. The recommended build is computed
  from the player's real inventory, so "the alternative" is whatever their
  owned pieces actually support; there's no second static config to show.
- **Long-form playstyle prose** ("Guide Details" on the reference page) —
  curation burden ×116 characters for content the `source` link already
  covers one click away. `role` stays a one-line overview only.

**Full-roster coverage (116/116) is ongoing batch curation**, tracked by
`scripts/meta-coverage.ts` (rewritten to report per-section coverage across
all six `CharacterGuide` sections, still accepting an optional GOOD-file
argument for a "your roster" priority bucket) — not a CI gate, same posture
[0016] established for the original four tables.

## Consequences

- Curation now happens in one place per character (one `CharacterGuide`
  record, one `source`) instead of four-then-six scattered table entries —
  a curation-ergonomics win, not just a code tidy-up.
- The coverage denominator changes from 4 tables to 6 sections. The 30
  characters migrated from the old tables now report partial coverage
  (missing `substats`/`constellations`/second `teams` entry) until batch
  curation backfills them — a numeric "regression" in the coverage script's
  output that reflects added scope, not lost data.
- `bestOwnedWeapon`, `talentGaps`, and `bestFieldableComp` keep their exact
  signatures and behavior; only their data source moved. `MetaTarget` no
  longer carries `characterKey`/`source` (both now live on the owning
  `CharacterGuide`) — `computeGapReport` in
  [`gap.ts`](../../src/meta/gap.ts) takes `characterKey` as an explicit
  parameter instead of reading it off the recipe.
- `docs/RPG_Build_Optimizer_Product_Scope.md`,
  `docs/RPG_Build_Optimizer_Tech_Scope.md`, and the v1.1 depth-layer spec are
  deleted as superseded (they described a `GameAdapter` seam removed by
  [0012]/[0017] and a "Phase 2 team optimizer" that was never built — the
  actual Phase 2 was [0016]'s account advisor). Historical, still in git
  history; the handful of other spec docs that referenced the deleted
  depth-layer spec are annotated in place rather than deleted, since their
  own content is still accurate.

[0003]: 0003-stat-only-model-no-damage-engine.md
[0012]: 0012-collapse-gameadapter-seam-to-concrete-adapter.md
[0015]: 0015-good-roster-import.md
[0016]: 0016-per-character-advisor-curated-overlays.md
[0017]: 0017-genshin-only-remove-multi-game-facade.md
