# RPG Build Optimizer — v1.1 Depth Layer & Portfolio Design

> **Audience:** the builder (you) + future reviewers of the repo.
> **Status:** approved design, pre-build.
> **Companion docs:** `docs/RPG_Build_Optimizer_Product_Scope.md`, `docs/RPG_Build_Optimizer_Tech_Scope.md`.
> **Date:** 2026-06-05.

---

## 1. Purpose

The product and tech scopes already define a lean, shippable **Phase 1 Artifact Optimizer**. This document does not change that scope. It defines a deliberately-planned **depth layer (v1.1)** that deepens the project *after* the lean version ships, and frames the whole project as a portfolio showpiece for a **mixed audience** (product/frontend, algorithms/backend, and general software-engineering reviewers).

The guiding decisions behind this design:

- **Audience:** mixed — the project must read well to three different reviewer types at once.
- **Effort posture:** *phase it.* Ship the lean ~11-day Phase 1 by end-June 2026, then build the depth layer as a clearly-planned v1.1. The deadline is protected; depth never competes with it.
- **Emphasis:** craftsmanship (Approach C) + instant playability (Approach B), plus the *written/tested* proof of the algorithm (the overlap between "show off the brain" and "craftsmanship"). The purely-visual live search animation is an explicit stretch item.

---

## 2. Two-tier release shape

### v1.0 — "It works and it's shipped" (by end-June 2026)
The existing Phase 1 scope, unchanged: import gear (UID / GOOD file / manual) → pick character + weapon → define constraints + a target stat → get top builds → share any build via link. Lean and complete. **No new scope is added here — this tier exists to protect the deadline.**

### v1.1 — "The depth layer" (planned now, built after v1.0 ships)
Three bundles plus one stretch item, detailed in §3–§5.

| Bundle | Items |
|---|---|
| **B — Instantly playable** | "Try with example gear" button · "Explain this result" panel |
| **C — Professionally built** | Decision notes (ADRs) + glossary (CONTEXT.md) · Speed report · Correctness check · End-to-end test robot + quality badges · Extensibility proof |
| **A-overlap — Written proof of the brain** | Speed report + correctness check (listed under C; they are the written/tested half of "show off the brain") |
| **Stretch** | Live "watch it search" animation |

> Note: the "speed report" and "correctness check" satisfy both the algorithm story (Approach A) and the craftsmanship story (Approach C). They are documented once, under Bundle C (§4), and counted as the realized portion of Approach A.

---

## 3. Bundle B — Instantly playable (user-facing)

### 3.1 "Try with example gear" button
On the empty starting screen, alongside the existing import options, a button such as *"No gear handy? Try a sample inventory."* One click loads a realistic pre-made set (~150 artifacts) with a character already selected, landing the visitor directly on a results screen.

- **Why:** today a stranger must own the game and export a file before seeing anything. This removes that wall — the difference between "looks interesting" and "I see what it does." It gates the value of every other feature.
- **Build:** a bundled sample data file + a loader button. Low effort, high payoff.
- **Acceptance:** clicking the button with an empty inventory populates a known sample, selects a character, and shows ranked results without any further input.

### 3.2 "Explain this result" panel
On any result build, an expandable panel that states, in plain language, why the build ranked where it did. Examples of the lines it surfaces:

- Which constraint was binding — *"Required Energy Recharge ≥ 160% — this build reaches 162%."*
- Which piece matters most — *"Swapping the Sands piece would lose the most Crit Value."*
- Search effort — *"3 constraints active; 1,240 of ~3.4 million combinations were actually checked."*

- **Why:** turns a black box into a tool that teaches the player; reads as product maturity.
- **Build:** moderate. The optimizer already computes these numbers; this surfaces them in friendly language. Requires the optimizer to expose per-build diagnostics (binding constraints, marginal contribution per slot, explored/pruned counts).
- **Acceptance:** every returned build can show at least the binding-constraint line, the most-impactful-piece line, and the explored/pruned counts.

---

## 4. Bundle C — Professionally built (craftsmanship + written proof)

### 4.1 Decision notes (ADRs) + glossary (CONTEXT.md)
Use the repo's existing conventions: `docs/adr/` for decision records and `CONTEXT.md` for the domain glossary.

- **ADRs** covering at least: smart-skip (branch-and-bound) search vs. exhaustive brute force; client-only / no-backend architecture; link-based sharing vs. accounts; the `GameAdapter` seam for multi-game support.
- **Glossary** defining the domain language: artifact, slot (flower/plume/sands/goblet/circlet), main stat, sub-stat, set bonus (2pc/4pc), Energy Recharge, Crit Value, objective, constraint.
- **Why:** demonstrates deliberate, explainable decisions and a shared vocabulary — what interviewers probe for.
- **Build:** low effort, pure writing.
- **Acceptance:** at least 4 ADRs exist; CONTEXT.md defines every domain term used in the UI.

### 4.2 Speed report (written half of "show off the brain")
A short documented report (e.g. `docs/benchmarks.md` plus a script that generates the numbers) with a table proving the search is fast across inventory sizes — naïve combination count vs. combinations actually explored vs. wall-clock time.

- **Why:** the headline technical proof. "Fast" claimed is nothing; "fast" with a reproducible table is credible.
- **Build:** a script that runs the optimizer at several inventory sizes and records counts + timings; results written into the report.
- **Acceptance:** a single command regenerates the table; the report shows at least 3 inventory sizes with naïve count, explored count, and timing.

### 4.3 Correctness check
An automated test that runs an exhaustive (slow, guaranteed-correct) search on small inputs and asserts the smart-skip search returns the *identical* best build(s).

- **Why:** preempts the obvious technical question — "how do you know skipping never discards the real winner?"
- **Build:** modest; lives with the normal test suite. Random small inventories compared against brute force.
- **Acceptance:** a test compares smart-skip vs. brute force across many randomized small inventories and passes in CI.

### 4.4 End-to-end test robot + quality badges
One automated end-to-end test that drives the app like a real user: load sample gear → optimize → copy share link → reopen the link → confirm the same build appears. Plus README badges (passing tests; a speed/accessibility score such as Lighthouse).

- **Why:** proves the whole flow works start-to-finish, not just in isolated units; badges give an at-a-glance "ships real software" signal.
- **Build:** moderate. E2E via a browser-driving test tool; badges wired to CI.
- **Acceptance:** the E2E test passes in CI; README shows a passing-tests badge and a quality/score badge.

### 4.5 Extensibility proof
The architecture separates Genshin-specific data from the game-agnostic optimizer via the `GameAdapter` seam. To *demonstrate* (not merely claim) the seam, add a tiny stub second-game adapter used only in tests, showing the optimizer runs unchanged against different game data.

- **Why:** "designed for extension" is a common claim; demonstrating it is rare and convincing.
- **Build:** small, test-only.
- **Acceptance:** a test instantiates a stub non-Genshin adapter and runs the optimizer against it with no changes to optimizer code.

---

## 5. Stretch — Live "watch it search" animation

While the optimizer runs, instead of a plain progress bar, visualize the search: a fast-climbing counter of combinations checked vs. skipped, and a small visual of builds being tested and discarded as a better one is found. **Built last, only if v1.1 time allows.**

- **Why:** the single most memorable feature — makes invisible cleverness visible; pleases product and technical reviewers simultaneously.
- **Build:** the most frontend-heavy item here, which is why it is the final, optional item. Requires the worker to stream progress events (explored/pruned counts, current best) to the UI at a throttled rate.
- **Acceptance (if built):** during a run the UI shows live explored/pruned counts and the current best build updating, without blocking the main thread.

---

## 6. How the finished project reads to each reviewer

- **Product / frontend reviewer:** opens the live link, clicks *"Try with example gear,"* sees ranked builds in ~5 seconds, expands *"explain this result,"* and (if built) watches the search animate. → *builds things people enjoy using.*
- **Algorithms / backend reviewer:** finds the speed report with real numbers and the correctness check proving the shortcut is safe. → *did real CS work and proved it.*
- **General-craftsmanship reviewer:** sees ADRs, glossary, the E2E test robot, green badges, and the demonstrated extensibility seam. → *ships professional, maintainable software.*

Underneath all three: a clean commit history and a visible *scoped → shipped → deliberately deepened* roadmap.

---

## 7. Out of scope (unchanged from the product scope)

- User accounts / server-side storage.
- A damage-formula / DPS engine.
- A public build gallery.
- Wuthering Waves as a *shipped* game (the seam is proven in tests only; no full second-game dataset).
- Team-composition optimization (Phase 2).

---

## 8. Build order within v1.1

1. **Decision notes + glossary** (§4.1) — cheap, and clarifies vocabulary for everything after.
2. **"Try with example gear"** (§3.1) — small, unlocks the demo experience.
3. **Correctness check** (§4.3) — locks in algorithm trust before building on it.
4. **Speed report** (§4.2) — the headline technical proof.
5. **Extensibility proof** (§4.5) — small, test-only.
6. **"Explain this result" panel** (§3.2) — needs optimizer diagnostics exposed.
7. **E2E test robot + badges** (§4.4) — validates the full flow once features exist.
8. **Stretch: live search animation** (§5) — only if time remains.
