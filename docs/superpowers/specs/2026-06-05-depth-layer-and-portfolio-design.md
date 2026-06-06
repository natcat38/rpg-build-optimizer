# RPG Build Optimizer — v1.1 Depth Layer & Portfolio Design

> **Audience:** the builder (you) + future reviewers of the repo.
> **Status:** approved design, pre-build. Refined 2026-06-06 by a design grill — see `docs/adr/` for the resulting decision records and `CONTEXT.md` for the glossary.
> **Companion docs:** `docs/RPG_Build_Optimizer_Product_Scope.md`, `docs/RPG_Build_Optimizer_Tech_Scope.md`.
> **Date:** 2026-06-05 (refined 2026-06-06).

---

## 1. Purpose

The product and tech scopes define a lean, shippable **Phase 1 Artifact Optimizer**. This document defines a deliberately-planned **depth layer (v1.1)** built _after_ the lean version ships, and frames the whole project as a portfolio showpiece for a **mixed audience** (product/frontend, algorithms/backend, and general software-engineering reviewers).

Guiding decisions:

- **Audience:** mixed — must read well to three reviewer types at once.
- **Effort posture:** _phase it._ Ship the lean Phase 1 by end-June 2026, then build the depth layer as a clearly-planned v1.1. The deadline is protected.
- **Emphasis:** craftsmanship + instant playability, plus the _written/tested_ proof of the algorithm. The purely-visual live search animation is an explicit stretch item.
- **v1.1 centerpiece:** **gap analysis** — "what should I farm to reach a meta build" — the feature the owner personally wants. See [ADR-0007](../../adr/0007-gap-analysis-with-frozen-meta-snapshot.md).

This refinement folds the earlier standalone "explain this result" panel **into gap analysis** (it is the same machinery surfaced), and adds the artifact **"+20 projection" toggle** as a v1.1 item.

---

## 2. Two-tier release shape

### v1.0 — "It works and it's shipped" (by end-June 2026)

The existing Phase 1 scope: import gear (GOOD file primary; UID via Enka.Network as convenience) → pick character + weapon + **build level** → define constraints + a target stat → get top builds (exact, anti-clone capped) → share any build via a self-contained link. **No new scope here — this tier protects the deadline.** Note: the v1.0 optimiser must already emit **per-build diagnostics** ([ADR-0004](../../adr/0004-exact-branch-and-bound-optimisation.md)) so v1.1 gap analysis is a presentation layer, not an engine rewrite.

### v1.1 — "The depth layer"

| Bundle                           | Items                                                                                                                              |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **★ Gap analysis (centerpiece)** | Meta-target snapshot + overridable prefill · gap report (Levels 1+2+light-3) · absorbs the "explain this result" panel             |
| **B — Instantly playable**       | "Try with example gear" sample inventory · artifact "+20 projection" toggle                                                        |
| **C — Professionally built**     | ADRs + glossary (done as of this grill) · speed report · correctness check · E2E test robot + quality badges · extensibility proof |
| **Stretch**                      | Live "watch it search" animation                                                                                                   |

> The **speed report** and **correctness check** are the written/tested half of the "show off the brain" angle — counted under Bundle C.

---

## 3. Gap analysis (the centerpiece)

See [ADR-0007](../../adr/0007-gap-analysis-with-frozen-meta-snapshot.md). Compares the best **owned** build against a **meta target** and tells the player what's blocking them and what to chase.

**Meta target.** A frozen, bundled **build-recipe snapshot** (per character: recommended set(s), main stat per slot, ER target, crit-ratio target), extracted from **KQM** (primary, attributed), labeled "Meta data: patch X.Y". It is a **one-click default that pre-fills the constraint/target builder**; every field is **user-overridable**. It is a build _recipe_, not a tier list. 100% client-side — no live API.

**Gap report depth (Levels 1 + 2 + light 3; no roll simulation):**

1. **Feasibility gaps** — _"You own no ATK% Sands,"_ _"Only 2 Emblem pieces — can't make 4pc."_
2. **Numeric shortfall** — _"Best build hits ER 152% vs. your 160% target — short by 8%."_
3. **One grounded action** — _"Your Goblet contributes least; replacing it helps most."_ Based on provable facts (missing main stat, weakest equipped piece), **never** on simulating random substat rolls.

**Explicitly excluded:** Level-4 "simulated perfect build" ceiling and any random-roll modelling (false precision).

**Acceptance:** with a meta target selected, the report shows (a) every infeasible constraint with its cause, (b) numeric shortfall vs. each target for feasible builds, and (c) the single highest-impact grounded action.

---

## 4. Bundle B — Instantly playable

### 4.1 "Try with example gear"

A button on the empty screen — _"No gear handy? Try a sample inventory."_ — loads a realistic ~150-artifact bundled set with a character pre-selected, landing the visitor on results in one click. Removes the import wall for strangers/recruiters. Low effort, high payoff.

- **Acceptance:** one click on an empty inventory populates the sample, selects a character, and shows ranked results with no further input.

### 4.2 Artifact "+20 projection" toggle

A toggle that evaluates all artifacts as if maxed to +20 (vs. their current owned level, which is the v1.0 default — see [ADR-0006](../../adr/0006-inventory-import-and-build-level-model.md)). Answers "what's my _potential_" vs. "what can I equip _now_," and enriches gap analysis.

- **Acceptance:** toggling recomputes results using +20 stat values; off by default.

---

## 5. Bundle C — Professionally built

### 5.1 ADRs + glossary — **done (this grill)**

`docs/adr/0001–0008` and `CONTEXT.md` now exist. Keep them current as the build proceeds.

### 5.2 Speed report

A documented report + a script that runs the optimiser across inventory sizes, recording naïve count vs. explored count vs. wall-clock time. The headline technical proof.

- **Acceptance:** one command regenerates a table of ≥3 inventory sizes with naïve/explored/timing.

### 5.3 Correctness check

A test that runs exhaustive brute force on randomised small inventories and asserts branch-and-bound returns the identical optimum. Proves the pruning never discards the true best ([ADR-0004](../../adr/0004-exact-branch-and-bound-optimisation.md)).

- **Acceptance:** passes in CI across many randomised inputs.

### 5.4 E2E test robot + quality badges

One end-to-end test: load sample gear → optimise → copy share link → reopen → confirm same build. Plus README badges (passing tests; Lighthouse/quality score).

- **Acceptance:** E2E passes in CI; README shows both badges.

### 5.5 Extensibility proof

A stub second-game adapter used in tests, showing the optimiser runs unchanged on different game data ([ADR-0008](../../adr/0008-gameadapter-seam-for-multi-game.md)).

- **Acceptance:** a test runs the optimiser against a non-Genshin stub adapter with no optimiser changes.

---

## 6. Stretch — Live "watch it search" animation

During a run, visualise the search: a fast-climbing explored-vs-pruned counter and a small visual of builds being tested/discarded as a better one is found. The worker streams throttled progress events. Built last, only if time allows.

- **Acceptance (if built):** live explored/pruned counts and current-best update during a run without blocking the main thread.

---

## 7. How the finished project reads to each reviewer

- **Product / frontend:** clicks _"Try with example gear,"_ sees ranked builds in ~5s, reads the gap report ("here's what to farm"), maybe watches the search animate.
- **Algorithms / backend:** finds the speed report with real numbers and the correctness check proving the shortcut is safe — _provably optimal, and proven._
- **General-craftsmanship:** sees ADRs, glossary, the E2E robot, green badges, the demonstrated extensibility seam.

Underneath all three: clean commit history and a visible _scoped → shipped → deliberately deepened_ roadmap.

---

## 8. Out of scope (unchanged)

User accounts / server storage · a damage/DPS engine · weapon-passive & conditional-4pc modelling · a public build gallery · Wuthering Waves as a _shipped_ game (seam proven in tests only) · team-composition optimisation (Phase 2) · live meta data · random-roll simulation.

---

## 9. Build order within v1.1

1. **Speed report + correctness check** (§5.2–5.3) — locks in the algorithm story first.
2. **"Try with example gear"** (§4.1) — small, unlocks the demo experience.
3. **Meta-target snapshot + prefill** (§3) — data + constraint-builder integration.
4. **Gap report** (§3) — presentation over the v1.0 diagnostics.
5. **"+20 projection" toggle** (§4.2) — feeds richer gap analysis.
6. **Extensibility proof** (§5.5) — small, test-only.
7. **E2E test robot + badges** (§5.4) — validates the full flow once features exist.
8. **Stretch: live search animation** (§6) — only if time remains.

(ADRs + glossary, §5.1, are already done.)
