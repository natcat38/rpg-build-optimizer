# 0004. Exact branch-and-bound optimisation (no approximation)

- Status: Accepted
- Date: 2026-06-06

## Context

Brute force over five slots explodes for large inventories. We need it fast, but the project's headline technical story is _"finds the provably best build."_ A cap-and-approximate fallback would make searches always fast but would forfeit that claim.

## Decision

Use **pruned branch-and-bound** that is **exact always** — it always returns the true optimum, never a capped approximation. Robustness against rare slow searches is handled by **UX**, not by cutting corners: the search runs in a Web Worker with **live progress + a cancel button**, plus a soft nudge ("locking main stats narrows this") after a few seconds.

The upper bound used for pruning must be **admissible** (never underestimate the best achievable score of a completion), including any **set-bonus contribution** to the objective — otherwise pruning could discard the true optimum. Correctness is protected by a test comparing branch-and-bound against exhaustive brute force on randomised small inventories.

Results are **top-K by score** with a **light anti-clone cap** (drop exact stat-duplicates; limit how many results share the same 4-piece core). Proper diversity clustering is deferred to v1.1.

The optimiser's result carries **per-build diagnostics** (binding constraints, per-slot marginal contribution to the objective, explored/pruned counts) from day one, so gap analysis ([0007]) is a presentation layer rather than an engine rewrite.

## Consequences

- Preserves the "provably optimal + correctness proof" portfolio story.
- The correctness test and a benchmark/speed report become first-class deliverables.
- A hard combination/time cap is a v2 idea only if real benchmark numbers ever demand it.

## Amendment (2026-06-21): bound–score admissibility invariant

This refines the decision above; it does not supersede it. Status remains Accepted.

> Two parts of this amendment — the duplicated `objectiveContribution()` and the _k×6 kept margin_ — were themselves superseded by the 2026-08-21 amendment below. They are left in place as the record of what was believed at the time; read the later amendment for the current invariant.

The pruning upper bound is `baseObjective + runningObjective + suffixMax[slot] + setBonusCeiling` (`src/optimizer/search.ts`, in `recurse`). It is admissible **only because** `objectiveContribution(a)` (`src/optimizer/search.ts`) is the exact per-artifact additive term of `objectiveValue(totals)` (`src/optimizer/score.ts`): for `crit_value` both are `cr*2 + cd`; for a single-stat objective both are the summed stat. The two formulas are **duplicated and must stay in lockstep**.

- **Why duplicated, not shared:** `objectiveValue` operates on a summed `StatTotals` object, while `objectiveContribution` operates on one artifact's main + sub-stats and runs in the hot recursion path. Unifying them would force materialising per-artifact totals on every step — the duplication is deliberate, not an oversight.
- **Dropping the penalty is safe:** the bound omits `critRatioPenalty`. Because that penalty is always `≥ 0`, omitting it can only _raise_ the bound, so admissibility is preserved.
- **Danger:** making the objective non-linear, or editing one formula without the other, turns the bound into an underestimate — pruning could then discard the true optimum and silently return a wrong-but-confident result. This is guarded by the brute-force equivalence test named above; no additional guard is introduced.

**Supporting performance notes (correctness-neutral):**

- _Sort-before-search_ (`src/optimizer/search.ts`) orders each slot pool by descending objective contribution so the kept list fills with strong builds early and the bound tightens sooner. This is iteration order only — the returned optimum is unchanged (covered by the equivalence test).
- _k×6 kept margin_ (`src/optimizer/search.ts`) retains `k * 6` candidates during the search so the anti-clone cap can still return `k` builds when the strongest candidates share a 4-piece core.

## Amendment (2026-08-21): one shared fold, and a survivor-based prune threshold

This refines the 2026-06-21 amendment; it does not supersede the original decision. Status remains Accepted.

### The per-artifact term is no longer duplicated

`objectiveContribution()` is gone. `searchBuilds` now folds each artifact **once**, up front, into two id-keyed maps (`src/optimizer/search.ts`):

- `contributions` — `artifactContribution(a)` (`src/optimizer/score.ts`): the artifact's main + sub-stats as a `StatVec`;
- `scalarValues` — `objectiveValue(contributions.get(id), objective)`: the very same `objectiveValue` the leaf score calls, applied to that vector.

The bound's per-artifact term and the leaf score are therefore the _same two functions composed_. There is one formula, not two that must be kept in lockstep, so bound and score cannot drift apart.

**The "unifying is rejected" trade-off is reversed.** The 2026-06-21 text argued that sharing `objectiveValue` would force materialising per-artifact totals on every step of the hot recursion. That is true of a per-_step_ fold and false of a per-_artifact_ one: the maps are built once, in O(inventory), and `recurse` only does a `Map.get`. The sorts, the suffix bounds and the recursion all read the same cached values — so unifying is now strictly cheaper _and_ removes the drift hazard that the earlier amendment could only warn about.

**Non-finite values fail loudly.** Building `scalarValues` throws if any artifact's contribution is not finite. `NaN` makes every `upper <= threshold` comparison false (the search silently stops pruning); `Infinity` prunes indiscriminately. Either way the search quietly stops being exact, so a corrupt inventory must raise rather than return a wrong-but-confident result.

### Prune threshold = the k-th anti-clone survivor

This replaces the _k×6 kept margin_ bullet, which was filed under "correctness-neutral" and was not: the retention size and the prune threshold were load-bearing for ranks 2..K.

`offer()` now binary-inserts each feasible build by descending score and re-runs the anti-clone greedy (drop exact duplicates, at most 2 results per shared 4-piece core, stop at `k`) over the whole sorted list. `kept` is thus always exactly what a from-scratch filter over everything found so far would produce, and `minKeptScore()` is the **k-th survivor's** score. `bruteForce` (the oracle) applies the same filter over _all_ feasible leaves, with no retention buffer on either side — the search implements precisely that spec.

Admissibility rests on two properties of the per-core cap:

1. _Suppression is monotone._ A build is suppressed only when ≥2 better builds share its 4-piece core, and anything that later displaces a displacer shares that same core — a suppressed build can never be revived.
2. _Truncating at `k` is safe._ Evicting a survivor ranked above score `s` needs newcomers that outrank it, or a pair that suppresses it — and that pair itself fills at least as many output slots as it displaces. The count of survivors at or above `s` never decreases.

So the k-th survivor score is non-decreasing and is a lower bound on the final k-th score: pruning at it is exact. Verified against the oracle across 10,800 configurations with zero mismatches, exploring 4–6.8× fewer leaves than the `k * 6` scheme (see [speed-report.md](../speed-report.md)).

> **Caveat (v1.1).** This proof holds only while the anti-clone rule is a **per-core cap** — a partition matroid: one class per build, fixed quota. It is **void** under the general diversity clustering the original decision defers to v1.1, where a candidate could be suppressed by a cluster that a later discovery dissolves. Replacing the cap means re-deriving this bound or reverting to a raw `k * 6` retention buffer.

### Note: a 2+2 naming the same set twice

`{ kind: '2+2', setKeys: ['A', 'A'] }` is rejected at the share/decode boundary as a domain rule — a 2+2 means _two different_ sets. Inside the search it is nonetheless collapsed defensively to "≥2 of A" (`setCeilingVector`), because summing A's 2pc twice understates what a five-piece build can reach (it can also light A's 4pc), which would make the ceiling inadmissible.
