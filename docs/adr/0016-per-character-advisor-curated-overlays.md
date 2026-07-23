# 0016. Per-character advisor: curated weapon/talent/team overlays

- Status: Accepted
- Date: 2026-07-17
- Amends: [0015](0015-good-roster-import.md)

## Context

[0015] gave every owned character a build level and equipped weapon, but the
app still only ever evaluated one manually-selected character at a time —
there was no "for everyone I own, what should I improve" view, no notion of
which weapon a player actually owns being better than what's equipped, and no
talent-level guidance. The static `TEAMMATES` table ([0007]-style, but never
formally documented) recommended the same four teammates for a character
regardless of who the player's roster actually contains.

[0015] explicitly declined to parse `characters[].talent`, reasoning the
stat-only model ([0003]) had "no lever a talent level could act on." That
holds for damage math, but a curated _target_ talent level (e.g. "Burst 9 /
Skill 9") needs only the player's _current_ level to compare against — a
plain integer comparison, not a damage multiplier. The same is true for
weapon choice: recommending "switch to X" needs only a curated ranking of
weapons plus the player's owned-weapon list, not a stat/DPS comparison
between them.

## Decision

Three new curated, frozen tables in `src/meta/` follow the exact shape and
epistemic contract [0007]'s `META_TARGETS` already established (hand-sourced
from KQM guides, a `source` URL per entry, gracefully absent rather than
guessed for uncovered characters):

- `weapons.ts` (now folded into [`guides/`](../../src/meta/guides/index.ts) — see [ADR-0018](0018-character-guides-unified-model.md)) — `WEAPON_RANKINGS`, an ordinal
  weapon list per character, and `bestOwnedWeapon(characterKey, owned)`,
  which picks the highest-ranked weapon the player owns (preferring an
  unequipped copy or one already on this character) and flags when the only
  owned copy is equipped on someone else. The rank is **never** fed to the
  solver or treated as a stat comparison — it's guide consensus, full stop.
- `talents.ts` (now folded into [`guides/`](../../src/meta/guides/index.ts)) — `TALENT_TARGETS`, a priority
  order plus target level per talent slot, and `talentGaps(target, owned)`,
  a plain integer comparison against `RosterEntry.talent` (now parsed by
  [`parseGOODRoster`](../../src/import/good.ts), validating each of
  `auto`/`skill`/`burst` as an integer 1–10, mirroring the `ascension` guard
  style [0015] already used). This is curated-target comparison, **not**
  damage modeling — [0003] stands unmodified. Constellations remain
  unparsed and out of scope, unchanged from [0015].
- `teamComps.ts` (now folded into [`guides/`](../../src/meta/guides/index.ts)) — `TEAM_COMPS`, replacing
  the ad hoc `TEAMMATES` table, structures each character's best-known comp
  as three role slots with ranked options, and `bestFieldableComp(comps,
ownedKeys)` resolves each slot to the best-ranked _owned_ character,
  reporting `null` (with the top pick surfaced as "you don't own X") for
  slots the roster can't fill.

**Full weapon inventory, not just equipped-per-character.** GOOD's
`weapons[]` array also carries unequipped copies and refinement, which
[0015]'s `parseGOODRoster` never captured (it only reads `location` to
populate `RosterEntry.weaponKey`). A new `parseGOODWeapons` (same file) and
`useWeaponInventory` store (mirroring
[`useRoster`](../../src/state/roster.ts): zustand + `persist`, wholesale
replace per import) carry the complete owned-weapon list so
`bestOwnedWeapon` can recommend a weapon equipped on nobody, not only the
one already on the selected character.

**Roster dashboard composes the existing pipeline per character, not a new
one.** [`RosterDashboard`](../../src/components/RosterDashboard.tsx) grades
every owned character that has a `META_TARGETS.statTargets` entry by calling
the existing `optimize()` ([`optimizeClient.ts`](../../src/workers/optimizeClient.ts))
and `gradeBuild()` ([`grade.ts`](../../src/meta/grade.ts)) — the same
functions the single-character flow already used — **sequentially**, one
character at a time, updating a local grade map as each resolves so cards
fill in progressively rather than blocking on a batch. This is a deliberate
concurrency=1 choice: each `optimize()` call spins up a fresh Web Worker
(~10–50ms), which is fine one at a time for a full account's roster but
would contend for the main thread if fired concurrently. Characters with no
`statTargets` render with no badge and trigger no compute at all — the same
"omit rather than fake" contract `gradeBuild` already had.
[`CharacterDetail`](../../src/components/CharacterDetail.tsx) then composes
the weapon/talent/team cards above alongside the _unmodified_
`OptimizePanel`/`GapSection`/`Results` flow for the selected character.

## Consequences

- Curation staleness now spans four tables instead of two (`META_TARGETS`,
  `WEAPON_RANKINGS`, `TALENT_TARGETS`, `TEAM_COMPS`) — no new mitigation
  beyond the existing `source`-link re-verification convention; this is a
  larger surface to go stale after a patch or kit rework.
- Coverage starts at the same ~28-30 characters `META_TARGETS` already
  covered (of 116 in the dataset); the other characters render with
  progressively fewer curated cards (some, none) rather than blocking or
  guessing. Growing coverage toward the full roster is ongoing, tracked via
  an advisory `scripts/meta-coverage.ts` reporter — not a CI gate.
- `TEAMMATES` is deleted; `TEAM_COMPS` is the only teammate-recommendation
  table going forward.
- The roster dashboard is now the primary UI flow once any roster is
  imported ([0015]); the flat single-character `OptimizePanel` flow remains
  for sample mode, manual entry, and UID-only imports (which never populate
  a roster).

[0003]: 0003-stat-only-model-no-damage-engine.md
[0007]: 0007-gap-analysis-with-frozen-meta-snapshot.md
[0015]: 0015-good-roster-import.md
