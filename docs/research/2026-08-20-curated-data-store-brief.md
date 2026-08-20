# Brief: should the curated game data live somewhere other than TypeScript literals?

**Status:** superseded — the open questions are answered and a direction picked in
[2026-08-20-curated-data-store-next-step.md](./2026-08-20-curated-data-store-next-step.md);
execute from there. Original framing kept below for the reasoning record.

**Original status:** problem statement, not a decision. Written for a fresh session to
investigate. **Do not start implementing from this doc** — it deliberately stops at
options and open questions, because the right answer depends on things only the
maintainer can decide (see [Open questions](#open-questions)).

**Why now:** a verification pass on 2026-08-20 found that **ten of twenty-two**
newly-added build recipes were materially wrong, including one artifact set that does
not exist in any guide. That pass is written up in
[2026-08-20-meta-targets-verification.md](./2026-08-20-meta-targets-verification.md).
The errors were caught, but only because someone went and read 22 guides by hand. There
is no mechanism that would have caught them otherwise, and no mechanism that will catch
the same class of error next patch.

## What the curated surface actually is

Five hand-maintained tables, none generated, none validated against their sources:

| File                          | Lines | What it holds                                     | `source:` links |
| ----------------------------- | ----- | ------------------------------------------------- | --------------- |
| `src/teams/comps.ts`          | 1065  | comp archetypes, 4 slots each, ranked substitutes | 30              |
| `src/meta/teammates.ts`       | 760   | per-character teammate suggestions                | 31              |
| `src/damage/profiles.ts`      | 633   | rotations + talent multipliers for `avg_damage`   | 18              |
| `src/meta/metaTargets.ts`     | 523   | build recipes: set, mains, ER floor, objective    | 53              |
| `src/invest/obtainability.ts` | —     | banner/obtainability facts                        | —               |

≈90KB of transcribed data, 132 source URLs, all stamped "curated as of patch 6.7" in a
comment. `docs/runbooks/patch-refresh.md` is currently the only thing keeping it honest,
and it is a checklist a human has to choose to run.

## The issues

### 1. Transcription from memory is unreliable, and nothing detects it

The 2026-08-20 pass is the evidence. Errors found included a fabricated artifact set
(`FinaleOfTheDeepGalleries` for Escoffier, which appears in no guide), a character built
for entirely the wrong stat (Gorou for DEF when his guide says ER then CRIT Rate), and a
healer built as HP-scaling when she scales off ATK (Charlotte). Types caught none of
these — every one of them is a _valid_ `MetaTarget`. Only reading the source caught them.

### 2. `source:` is a URL, not a check

Every entry carries a link to the guide it came from. Nothing fetches it, diffs it, or
notices when it 404s or gets rewritten. The link documents intent; it does not enforce
anything. Several guides in this pass had moved to `/q/<name>-quickguide/` URLs, and two
long-form pages are empty stubs that defer to their quick guide.

### 3. One recipe cannot hold what a guide actually says

Guides give _ranges and conditions_; `MetaTarget` holds one value. Kokomi's ER
requirement is 195–245% on-field but 260–315% as an off-field support. Xianyun needs
190–300% in solo-Anemo teams and 100–130% alongside Xiao and C6 Faruzan. We record one
number and lose the condition. Same for sets: several characters have a genuinely
different best set depending on whether a teammate already holds it.

### 4. Sources disagree, and the schema has nowhere to put that

KQM ranks Marechaussee Hunter first for Skirk _in Furina teams_; Prydwen calls Finale of
the Deep Galleries her best "regardless of how Skirk is played". Both are right about
different things. The current schema forces a coin flip and records neither the
disagreement nor the reasoning — the reasoning currently survives only as a hand-written
code comment, which is better than nothing and worse than data.

### 5. Main-stat locks are load-bearing in a non-obvious way

`mains` is a hard pool filter (`src/optimizer/search.ts:41`), so it silently deletes
candidates. Locking a circlet to `crit_dmg` removes every CRIT Rate circlet — and
Prydwen's usage data for Ororon shows CRIT Rate 51.8% vs CRIT DMG 19.6%, so that lock
would have discarded the majority of real pieces. Nothing in the type system says
"this field is a filter, be careful"; it took reading the optimiser to know. A data
store with validation could encode that rule once instead of relying on a comment.

### 6. `erTarget` can make a recipe unsatisfiable

It is promoted to a hard `minStats.er_pct` floor. Set it at a guide's
burst-every-rotation ceiling and the recipe becomes infeasible for inventories that
legitimately need less, surfacing to the user as "Couldn't gear X". Currently mitigated
by judgement — pick the representative figure — which is exactly the kind of judgement
that does not survive a hurried patch-day update.

### 7. Coverage is guarded, correctness is not

`src/teams/comps.test.ts` now fails if a weight-1.0 comp pick has no `META_TARGETS`
recipe. That is a real guard and it works. But it only proves an entry _exists_ — a
recipe full of confidently wrong values passes it cleanly.

### 8. Patch-version skew is invisible

The dataset is pinned to 6.7 via `PATCH` in `src/game/genshin/adapter.ts`. Guides are
stamped with their own versions and drift independently — this pass hit a guide "updated
for Version 7.0" describing a build that turned out to be 6.7-era after all, which took
manual checking to establish. Nothing links a curated entry to the patch it was verified
against, so there is no way to query "what has not been re-checked since 6.4?".

### 9. Fandom is not a source, and that knowledge lives nowhere

Two separate research passes wasted effort on the Fandom wiki before establishing that
its character pages carry no build recommendations at all. Prydwen blocks plain HTTP
fetches and needs a real browser session. This is exactly the sort of operational fact
that should be written down once — it is now in the verification doc, but it belongs
with whatever the data pipeline becomes.

## Options

Roughly in order of effort. These are sketches to react to, not proposals.

**A. Leave it in TypeScript, add validation.** Keep the literals; add a test that
asserts structural sanity beyond types — no crit-circlet locks, ER floors inside a sane
band, set keys present in the dataset, `characterKey` matching its own map key. A
throwaway script doing exactly this already caught nothing on the current data, which is
weak evidence it would earn its keep, but it is cheap and it locks in the rules that
were learned the hard way. _Does not address staleness at all._

**B. Move the data to JSON + a schema.** Same content, but data stops being code, gains
a machine-checkable schema, and can carry metadata TypeScript literals make awkward:
`verifiedAt`, `verifiedAgainstPatch`, `confidence`, `sourcesAgree`. Enables a "what is
stale?" report. Costs a loader and a build step, and JSON is markedly worse to hand-edit
than the current well-commented TS.

**C. Build-time fetch with a diff gate.** Snapshot each `source:` URL at build time, and
fail CI when a guide's content hash changes so a human goes and looks. Turns silent drift
into a visible signal. Fragile against site redesigns, needs a real browser for
Prydwen-class sites, and adds a network dependency to a project whose whole architecture
is "client-side only, no network" (ADR-0001) — though a build-time fetch does not
actually violate that, worth confirming.

**D. An actual database / CMS.** Probably the wrong shape: the data is ~90KB, read-only
at runtime, and versioned alongside code, which is exactly what a git-tracked file is
good at. Worth stating explicitly so it can be ruled out on the record rather than
re-litigated. If "database" really means "structured store with provenance", that is
option B.

**E. Consume someone else's curated data.** Genshin Optimizer and similar projects
already model conditional set effects as data records. Adopting a community schema would
replace transcription with integration. Large change, licensing questions, and it
couples the project's correctness to an upstream — but it is the only option that
removes the hand-transcription problem rather than instrumenting it.

## What this connects to

The deferred **D1 damage-engine work** (see
`docs/superpowers/plans/2026-08-20-ux-overhaul-and-docs-refresh.md`) wants conditional
4pc set effects modelled as data records, because today only flat 2pc stat bonuses are
scored — 13 of 57 sets in the snapshot have no scored bonus at all, which is why
mixed-set "rainbow" builds can beat real sets. **That work needs a data model anyway.**
Deciding the storage question independently of D1 risks solving it twice, and is
probably the single strongest argument for looking at these together.

## Open questions

Answer these before designing anything:

1. **How much curation will the maintainer actually sustain per patch?** Every option
   above is really a bet on this number. If the honest answer is "an hour, occasionally",
   that rules out C and E and probably B.
2. **Is the goal freshness, or provenance?** Detecting staleness (C) and recording why an
   entry says what it says (B) are different problems with different solutions.
3. **Should conditional recommendations be modelled at all** — per-team, per-constellation
   variants — or is one representative recipe the honest scope for this tool?
4. **Does this get decided with or after D1?** See above.
5. **Is a wrong recipe worse than no recipe?** Currently an uncovered character gets a
   visible "no curated recipe yet" label, while a wrong one looks authoritative. That
   asymmetry might argue for a `confidence` field that downgrades the UI presentation.

## Suggested first step

Not code. Take three characters whose guides genuinely disagree (skirk, escoffier,
citlali are documented cases in the verification doc) and write down what a schema would
have to hold to represent them honestly. If one recipe per character cannot survive that
exercise, the shape of the answer follows from it. If it can, option A plus a diligent
runbook may be the whole job.
