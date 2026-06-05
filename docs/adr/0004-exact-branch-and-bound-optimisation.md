# 0004. Exact branch-and-bound optimisation (no approximation)

- Status: Accepted
- Date: 2026-06-06

## Context

Brute force over five slots explodes for large inventories. We need it fast, but the project's headline technical story is *"finds the provably best build."* A cap-and-approximate fallback would make searches always fast but would forfeit that claim.

## Decision

Use **pruned branch-and-bound** that is **exact always** — it always returns the true optimum, never a capped approximation. Robustness against rare slow searches is handled by **UX**, not by cutting corners: the search runs in a Web Worker with **live progress + a cancel button**, plus a soft nudge ("locking main stats narrows this") after a few seconds.

The upper bound used for pruning must be **admissible** (never underestimate the best achievable score of a completion), including any **set-bonus contribution** to the objective — otherwise pruning could discard the true optimum. Correctness is protected by a test comparing branch-and-bound against exhaustive brute force on randomised small inventories.

Results are **top-K by score** with a **light anti-clone cap** (drop exact stat-duplicates; limit how many results share the same 4-piece core). Proper diversity clustering is deferred to v1.1.

The optimiser's result carries **per-build diagnostics** (binding constraints, per-slot marginal contribution to the objective, explored/pruned counts) from day one, so gap analysis ([0007]) is a presentation layer rather than an engine rewrite.

## Consequences

- Preserves the "provably optimal + correctness proof" portfolio story.
- The correctness test and a benchmark/speed report become first-class deliverables.
- A hard combination/time cap is a v2 idea only if real benchmark numbers ever demand it.
