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

The pruning upper bound is `baseObjective + runningObjective + suffixMax[slot] + setBonusCeiling` (`src/optimizer/search.ts`, in `recurse`). It is admissible **only because** `objectiveContribution(a)` (`src/optimizer/search.ts`) is the exact per-artifact additive term of `objectiveValue(totals)` (`src/optimizer/score.ts`): for `crit_value` both are `cr*2 + cd`; for a single-stat objective both are the summed stat. The two formulas are **duplicated and must stay in lockstep**.

- **Why duplicated, not shared:** `objectiveValue` operates on a summed `StatTotals` object, while `objectiveContribution` operates on one artifact's main + sub-stats and runs in the hot recursion path. Unifying them would force materialising per-artifact totals on every step — the duplication is deliberate, not an oversight.
- **Dropping the penalty is safe:** the bound omits `critRatioPenalty`. Because that penalty is always `≥ 0`, omitting it can only _raise_ the bound, so admissibility is preserved.
- **Danger:** making the objective non-linear, or editing one formula without the other, turns the bound into an underestimate — pruning could then discard the true optimum and silently return a wrong-but-confident result. This is guarded by the brute-force equivalence test named above; no additional guard is introduced.

**Supporting performance notes (correctness-neutral):**

- _Sort-before-search_ (`src/optimizer/search.ts`) orders each slot pool by descending objective contribution so the kept list fills with strong builds early and the bound tightens sooner. This is iteration order only — the returned optimum is unchanged (covered by the equivalence test).
- _k×6 kept margin_ (`src/optimizer/search.ts`) retains `k * 6` candidates during the search so the anti-clone cap can still return `k` builds when the strongest candidates share a 4-piece core.
