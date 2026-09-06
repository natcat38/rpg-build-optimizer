# 0017. Curated comp-archetype database

- Status: Accepted; converged 2026-09-06 (issue #90) — see addendum below
- Date: 2026-08-20

## Context

Recommending teams needs a model of what a good team _is_. Three options:

1. **Rules from first principles** — derive comps from elements, reactions and
   roles. Expressive on paper; in practice it reinvents theorycrafting badly and
   confidently proposes teams no player would run.
2. **Simulation** — score candidate lineups with a rotation simulator. That is
   gcsim's job, needs action lists per comp, and is far heavier than the
   recommendation is worth ([0016](0016-damage-engine-objective.md) already
   declined rotation simulation for the same reason).
3. **Curation** — transcribe the comps the community already agrees on.

The project already curates game knowledge this way twice: `META_TARGETS`
([0007](0007-gap-analysis-with-frozen-meta-snapshot.md)) and `TEAMMATES`.

## Decision

Comps live in a curated database, `src/teams/comps.ts`. A **comp archetype** is
four slots; each slot names a **role** and a ranked list of characters who can
fill it, weighted 1.0 ideal / 0.85 strong sub / 0.7 workable / 0.5 stopgap. Each
archetype carries a tier, the endgame modes it applies to, a `source` guide URL,
and a one-line note on why the comp exists.

**Curation workflow** — the same shape as `META_TARGETS`:

1. The agent drafts entries from cited sources (KQM guides, current Abyss usage).
2. The owner reviews the content in the PR. Lineups, substitutes and weights are
   data, not code, and a code review does not check them.
3. Refresh per patch alongside `META_TARGETS`, using each entry's `source` link.

Shape is enforced by tests (real character keys, https sources, non-increasing
weights in (0,1], four distinct ideals per archetype); accuracy is enforced by
the owner.

`TEAMMATES` stays for now — it drives the existing per-character panel and
answers a different question ("who plays with X?" rather than "what team do I
run?"). Phase 4's Plan page is where the two converge.

## Consequences

- The recommendation is only as current as the last curation pass; a new
  character is invisible until someone adds them.
- Adding an archetype is a data edit, reviewable by someone who plays the game
  rather than someone who reads TypeScript.
- The database cannot invent a comp the curator did not know about — a
  deliberate trade against the rules-based option's confident nonsense.

## Addendum (2026-09-06, issue #90)

`TEAMMATES` did not stay "for now" long enough to converge gracefully — by
the 2026-09 architecture audit it had already drifted from `comps.ts` (e.g.
Furina's flat teammate list no longer matched her role/substitutes in
`neuvillette-mono-hydro`). `src/meta/teammates.ts` and its test are deleted.
`OptimizePanel`'s "Works well with" panel is now `teammatesFor()` in
`comps.ts`: it picks the archetype where the character has its highest
substitution weight and lists the ideal pick of every other slot, using the
archetype's `notes` as the shared rationale. `comps.ts` is the single source
of truth for "who teams with whom."
