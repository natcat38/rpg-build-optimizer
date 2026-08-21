# Curated data store — evaluated next step (handoff for an executing session)

**Status:** decision-ready. This resolves the open questions in
[the brief](./2026-08-20-curated-data-store-brief.md) and picks a direction. An
executing session should start from **Execution plan** below; the rest is the
reasoning behind it.

## Owner decisions (asked and answered 2026-08-20)

1. **Effort budget:** half a day per patch. Enough to run the
   [patch-refresh runbook](../runbooks/patch-refresh.md) properly and re-verify
   changed guides. Not enough to maintain a fetch pipeline.
2. **D1 coupling:** decide now, independently of D1 (rationale below).
3. **Confidence:** yes — the schema carries a confidence field and the UI
   downgrades presentation for medium-confidence entries. A wrong recipe that
   looks authoritative is worse than no recipe.

## Evaluation of the brief's options

**E (consume community data) is out for this problem** — and this is the one
finding that changes the brief's framing. Genshin Optimizer's data records
(`libs/gi/sheets/`) are _mechanical_ game data: set effects and weapon passives,
structurable from `genshin-db` params. The brief's problem is _editorial_ data:
which set a guide recommends, what ER floor, which stat to lock. No community
project publishes that as structured data — GO computes builds, it does not
curate recommendations. E therefore cannot replace the hand-transcription of
guides; it stays relevant only to D1's set-effect modelling. This also dissolves
the brief's "decide with D1" argument: the two datasets share only the concept
"conditional on team", not a source, a correctness model, or a refresh cadence.
Editorial data is verified by reading guides; mechanical data is verified
against game files. Different problems, decided separately (owner concurred).

**D (database/CMS) stays out** for the brief's own reasons: ~90KB, read-only at
runtime, versioned with code. Git-tracked files win.

**C (build-time fetch + diff gate) is out** at full strength: Prydwen needs a
driven browser, KQM URLs already moved once (`/q/<name>-quickguide/`), and a
content-hash gate on redesign-prone fan sites is a recurring false-alarm
generator that would eat the half-day budget on plumbing instead of
verification. A **cheap remnant survives**: a runbook-time (not CI) link-check
script that flags 404s/redirects on `source:` URLs — minutes to write, catches
the URL-moved failure mode actually observed.

**B (JSON + schema) is right about the metadata, wrong about the format.** The
value of B is `verifiedAt` / `verifiedAgainstPatch` / `confidence` /
structured sources — none of which requires leaving TypeScript. TS literals
already give a machine-checkable schema (the compiler), comments, and review
diffs; JSON adds a loader and worse hand-editing for nothing. **Extend the TS
types with the provenance fields instead.** A "what is stale?" report is then a
trivial script over the literals.

**A (validation tests) is in**, but reframed: its value is not catching today's
errors (the data was just verified — of course it catches nothing), it is
locking in the encoding rules that were learned the hard way in
[the verification pass](./2026-08-20-meta-targets-verification.md), so a
hurried patch-day edit cannot silently violate them.

**Chosen direction: A + B-lite.** Keep the data in TypeScript; add provenance
fields, a validation test encoding the learned rules, a staleness report, and
the confidence-aware UI presentation.

## Does one recipe per character survive? (the brief's schema exercise)

Mostly answered already by the verification pass, which faced the three
documented disagreement cases and resolved each with a _rule_, not a coin flip:

- **skirk** — KQM's Marechaussee is conditional on Furina; Prydwen's Finale is
  unconditional. Rule: _the unconditional answer wins_ (team unknown at solve
  time). One recipe survives; the condition belongs in data, not a comment.
- **escoffier / citlali** — sources disagree on a main stat, or a lock fights
  the ER floor. Rule: _disagreement → leave unlocked_; the objective and floor
  already encode intent. One recipe survives.
- **kokomi / xianyun ER ranges** — one number loses the condition. But
  `erTarget` is a _floor_, and the encoding rule already says record the
  representative common-team figure. The range belongs in data (`erRange` +
  note) for the next verifier, not as multiple recipes.

Conclusion: **single recipe per character survives**, provided the schema gains
fields to hold what currently lives in comments and in the verification doc:
the range, the disagreement, and the condition under which the runner-up wins.
The executing session should still spend the first timeboxed hour writing these
three characters against the draft schema on paper — if a field is missing, it
is cheapest to discover there.

## Execution plan (for the new session)

Scope: `src/meta/metaTargets.ts` first (it has the verified corpus and the
incident history); the same provenance block extends to the other four curated
files as a follow-up, not in this pass.

1. **Paper check (timebox ~1h):** write skirk, escoffier, citlali as literals
   against the draft schema below. Adjust fields; do not add variants.
2. **Schema:** extend `MetaTarget` with:
   - `verifiedAt: string` (ISO date) and `verifiedAgainstPatch: string`
   - `confidence: 'high' | 'medium'`
   - `sources: { url: string; stance?: string }[]` (replaces bare `source`;
     `stance` holds e.g. "Marechaussee, conditional on Furina" — the recorded
     disagreement)
   - `erRange?: [number, number]` (documentation for the next verifier;
     `erTarget` remains the single enforced floor)
   - `notes?: string` (the encoding judgement, promoted out of comments)
     Populate from the verification doc — every value in it is already sourced
     (ranges in "Known range-dependence", stances in "Third-source pass",
     confidence in the table).
3. **Validation test** (`metaTargets.validation.test.ts`), encoding the learned
   rules: no crit-stat circlet lock; no ER-locked sands together with an
   `erTarget` unless the floor is satisfiable (the "recipe fights itself"
   case); `erTarget` within `erRange` when both present; every `setKey` exists
   in the frozen snapshot; `characterKey` equals its map key; every entry has
   `verifiedAgainstPatch` and non-empty `sources`.
4. **Staleness report:** a small script (`npm run stale-data` or a test that
   warns) listing entries whose `verifiedAgainstPatch` ≠ current `PATCH`
   (`src/game/genshin/adapter.ts`).
5. **Link check:** runbook-time script flagging 404/redirect on source URLs.
   Not CI, no content hashing, no browser automation.
6. **UI:** medium-confidence entries get a visibly softer presentation in the
   recipe panel (`src/components/OptimizePanel.tsx`) — wording per D3's
   help-page tone, e.g. "community sources disagree on parts of this build".
7. **Docs:** new ADR recording this decision and explicitly ruling out C, D,
   and E-for-editorial-data; fold the new fields into the patch-refresh
   runbook's verification steps; note in the D1 brief that mechanical
   set-effect records are a separate, still-open data question.

Operational facts the executing session needs (from the verification doc, do
not rediscover): Fandom has no build data; Prydwen blocks plain HTTP and needs
a driven browser; KQM long-form pages for ororon/escoffier are empty stubs —
their quick guides are the source.

## What this does not solve

Staleness detection stays human-triggered (the runbook + staleness report),
by explicit owner choice of a half-day budget. If that budget stops being met,
the fallback is the confidence field: entries past N patches unverified could
auto-downgrade — noted here so the option is on the record, not planned.
