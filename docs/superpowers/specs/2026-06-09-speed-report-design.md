# RPG Build Optimizer — Speed Report (v1.1 §5.2) Design

> **Status:** approved design, pre-build (2026-06-09).
> **Implements:** §5.2 of `docs/superpowers/specs/2026-06-05-depth-layer-and-portfolio-design.md`.
> **Grounds in:** [ADR-0004 — exact branch-and-bound](../../adr/0004-exact-branch-and-bound-optimisation.md). The report is the _measured_ half of "provably optimal, and proven"; the correctness test (§5.3) is the proved half and already exists in `src/optimizer/search.test.ts`.
> **Audience:** algorithms/backend reviewers first; the headline number is for everyone.

---

## 1. Purpose

Produce a committed report plus a one-command regenerator (`npm run bench`) that proves the branch-and-bound pruning is real and large: for a ramp of inventory sizes, show the **naive** number of full builds we would have to evaluate, the number we **actually explore**, and the wall-clock time. The whole point is that we never run the naive search — we only compute its size to quantify what the bound lets us skip.

This is a measurement and reporting task. It adds **no UI** and does **not** change the optimizer engine (one optional, clearly-gated exception in §9).

---

## 2. What it proves, and exact definitions

The report states these definitions inline so the numbers are honest:

- **Naive** — the number of complete builds in the brute-force space: the product of the per-slot pool sizes, `∏ |pool[slot]|`. Computed arithmetically, never executed.
- **Explored** — complete builds actually evaluated (recursion leaves reached), read from `OptimizeResult.explored`.
- **Pruned** — internal subtrees cut by the admissible bound, read from `OptimizeResult.pruned`. (Different unit from leaves — reported for transparency, not used in the headline.)
- **Reduction** — `naive ÷ explored`, phrased as "explores 1 in N" / "N× reduction."

The headline is **naive vs. explored**: the bound is admissible (ADR-0004), so explored builds are a tiny fraction of naive while the returned optimum is still exact.

---

## 3. Components

1. **`src/optimizer/benchmark.ts` — reusable harness (pure, no I/O).**
   - `makeInventory(size, seed): Artifact[]` — seeded synthetic but realistic inventory (see §4).
   - `runBenchmark(sizes, scenarios): BenchRow[]` where
     `BenchRow = { size; scenario; naive; explored; pruned; reductionFactor; ms }`.
     Builds the context once per scenario via `buildContext(genshinAdapter, req)` with a fixed representative character + weapon, `topK: 10`; times `optimize()` as the **median of 3 runs** per cell.
   - Computes `naive` as the product of per-slot pool sizes for the request (respecting any main-stat locks; none are used here, so it is the product of slot counts).

2. **`scripts/benchmark.ts` — thin CLI.** Imports the harness, runs the configured sizes/scenarios, renders `docs/speed-report.md`. Wired as `"bench": "tsx scripts/benchmark.ts"` (mirrors the existing `build:data` script).

3. **`docs/speed-report.md` — generated, committed.** Environment line (Node version, OS/arch), a short method paragraph, the column definitions from §2, and the results table(s) from §6.

4. **`src/optimizer/benchmark.test.ts` — smoke test.** Calls `runBenchmark` at one small size for one scenario and asserts: at least one row; `naive` equals the product of pool sizes; `explored > 0`; `explored ≤ naive`; a valid build is returned. No timing assertions. Keeps the harness from bit-rotting as the engine evolves.

5. **README "Performance" section.** One headline sentence (e.g. "explores ~X of Y billion combinations to return the exact optimum") linking to `docs/speed-report.md`.

---

## 4. Synthetic inventory generation

Deterministic given `(size, seed)` so committed numbers reproduce on any machine.

- **RNG:** a small seeded PRNG (mulberry32). All randomness flows from the seed.
- **Slot distribution:** spread `size` artifacts as evenly as possible across the 5 slots (floor/ceil), guaranteeing every slot is non-empty so builds are always feasible structurally.
- **Set key:** uniform random from `genshinAdapter.sets()` (real set keys, so real 2pc/4pc bonuses participate).
- **Main stat:** uniform random from the standard per-slot main-stat pool:
  - flower → `hp`
  - plume → `atk`
  - sands → `hp_pct, atk_pct, def_pct, em, er_pct`
  - goblet → `hp_pct, atk_pct, def_pct, em, elemental_dmg, physical_dmg`
  - circlet → `hp_pct, atk_pct, def_pct, em, crit_rate, crit_dmg, healing`
  - `mainStatValue` resolved via `genshinAdapter.mainStatValue(mainStat, 5, 20)`.
- **Substats:** 4 distinct stats drawn from the standard substat pool (`hp, atk, def, hp_pct, atk_pct, def_pct, em, er_pct, crit_rate, crit_dmg`), excluding the main stat, each with a plausible randomized value. Substat realism affects which build wins, not the validity of the proof.
- **Level/rarity:** all `rarity: 5`, `level: 20` (v1.0 owned-level model is irrelevant to the search-size proof).

The generator is exported and dependency-light specifically so the later "Try with example gear" item (§4.1 of the depth-layer spec) can reuse it. Building that feature is **not** in scope here.

---

## 5. Scenarios and sizes

**Scenarios (run per size):**

1. `objective: 'crit_value'`, no constraints — the everyday case.
2. `objective: 'er_pct'`, no constraints — exercises the **2+2 set-bonus ceiling** in `maxSetBonusObjective` (two stacking 2-piece ER bonuses), the admissibility edge case from ADR-0004. Demonstrates the bound generalizes across objectives.

> **Why not a constrained scenario.** Pruning is driven solely by the objective upper bound vs. the best kept score (`search.ts`). Constraints do not enter the bound; a constraint tight enough to leave the kept list empty makes `minKeptScore()` stay `-Infinity` so nothing prunes — which at large N explodes runtime. A second _objective_ is the safe, honest way to show the bound is general.

**Sizes:** `50, 100, 200, 400`. Attempt `800` during implementation and keep it only if it completes in reasonable time (the spec requires ≥3 sizes).

**Fixed context:** a single representative character + weapon (e.g. Raiden + Engulfing Lightning, present in the snapshot) for all cells, so size is the only independent variable.

---

## 6. Output format

`docs/speed-report.md` contains one table (size × the two scenarios) or two tables (one per scenario) — whichever reads cleaner — with columns:

| Inventory | Scenario | Naive builds | Explored | Pruned | Reduction | Time (median) |
| --------- | -------- | ------------ | -------- | ------ | --------- | ------------- |

Large integers are formatted with thousands separators. A leading paragraph states the environment and that explored/naive/pruned/reduction are deterministic for the given seed while time varies by machine.

---

## 7. Timing methodology

- Wall-clock via `performance.now()` around `optimize()` only (not generation or context build).
- Median of 3 runs per cell to damp noise.
- Reported as "measured on Node `vX`, `<platform> <arch>`"; understood to vary. Never asserted in CI.

---

## 8. CI and testing

- **Not** a CI timing gate.
- The Vitest smoke test (§3.4) runs in the normal `npm test` suite and therefore in CI, protecting the harness without timing flakiness.
- The report itself is regenerated manually with `npm run bench` and committed.

---

## 9. Contingency: a safe pruning lever (not pre-applied)

`optimize()` iterates each slot's pool in arbitrary order, so strong builds may not surface early, which can weaken pruning at large N. If measurement shows explored is uncomfortably high (e.g. 400 is slow):

- **Lever:** sort each slot's pool by **descending objective contribution** before recursing, so the kept list fills with strong builds quickly and the bound tightens sooner. This changes iteration order only — the returned optimum is unchanged, so it is correctness-preserving (and still covered by the existing brute-force equivalence test).
- If applied, the report shows before/after explored counts as an additional result.

This is **not** done up front (YAGNI). It is a decision to make from data during implementation.

---

## 10. Out of scope

- The "Try with example gear" sample-inventory feature (reuses the generator later).
- Any UI, including the stretch live-search animation.
- CI timing thresholds.
- Engine changes other than the optional, data-gated lever in §9.

---

## 11. Acceptance criteria

1. `npm run bench` regenerates `docs/speed-report.md` with ≥3 inventory sizes, each showing naive / explored / pruned / reduction / time for both scenarios.
2. Reported numbers are reproducible (deterministic columns identical) on re-run with the same seed.
3. The Vitest smoke test passes in CI, asserting `explored ≤ naive` and a valid build for at least one cell.
4. The README "Performance" section shows the headline number and links to the report.
5. No change to optimizer results; existing tests still pass (the §9 lever, if applied, leaves the brute-force equivalence test green).
