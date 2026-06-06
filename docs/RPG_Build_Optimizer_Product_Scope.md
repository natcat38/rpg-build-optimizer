# RPG Build Optimizer — Product Scope

> **Audience:** product/portfolio readers (and the recruiter/hiring-manager who lands on the repo). Plain language, no code.
> **Status:** scoped, pre-build. Anchor project #1.
> **Target ship:** Phase 1 by **end of June 2026**.

---

## 0. Resolved design decisions (2026-06-06)

A design grill refined this scope. Canonical decisions live in `docs/adr/` and the glossary in `CONTEXT.md`; this list is the product-facing summary.

- **No damage engine — stat-only model** ([ADR-0003](docs/adr/0003-stat-only-model-no-damage-engine.md)). Weapon **passives are not modelled**. Set bonuses: **2-piece flat stats are scored** (plus the rare flat-stat 4pc); **conditional/non-stat 4-piece effects are honoured as a constraint but not scored**. `Elemental DMG` resolves to the character's element. This limitation is stated openly in the UI.
- **Build level is a user input** ([ADR-0006](docs/adr/0006-inventory-import-and-build-level-model.md)): one ascension-breakpoint dropdown (default 90) driving **both** character and weapon, encoded in the share link. Artifacts are evaluated at their **current owned level** in v1.0 (a "treat all as +20" toggle is v1.1).
- **Import:** GOOD file is the **primary** path (full inventory); UID via **Enka.Network** is a **convenience/demo** (showcased characters only).
- **Optimiser is exact, always** ([ADR-0004](docs/adr/0004-exact-branch-and-bound-optimisation.md)) — never a capped approximation; robustness via worker progress + cancel. Results are top-K with a **light anti-clone cap** so the list isn't near-identical builds.
- **Share links are self-contained and view-first** ([ADR-0005](docs/adr/0005-self-contained-share-links.md)) — the five artifacts are embedded; the inventory is not. Recipients view the build, then "load your own gear to optimise".
- **Gap analysis is the v1.1 centerpiece** ([ADR-0007](docs/adr/0007-gap-analysis-with-frozen-meta-snapshot.md)) — see §6. This supersedes the originally-deferred "team-composition" framing as the _next_ headline feature; team composition remains a later phase.

---

## 1. Background & Problem Statement

In gacha RPGs like **Genshin Impact**, a character's strength comes mostly from their five **artifacts** — gear pieces, each with one main stat and up to four random sub-stats, drawn from a large pool. A serious player accumulates **hundreds** of artifacts. Finding the _best_ five-piece combination for a given character — one that respects the bonuses you want (e.g. a 4-piece set effect), clears a needed **Energy Recharge** threshold, and then maximises damage-relevant stats like **Crit Value** — is a genuine **combinatorial optimisation problem**. Done by hand it is slow, error-prone, and most players just guess.

Existing community tools exist (e.g. Genshin Optimizer) but are heavy, have a steep learning curve, and are tied to a single game. There is room for a **fast, focused, shareable** optimizer that does one thing well: _"given the artifacts I actually own, what is the best build for this character under these constraints?"_ — and lets the player share the result with a single link.

This project is also a **portfolio showpiece**: it demonstrates real algorithmic work (constrained combinatorial search) wrapped in a clean React interface, shipped publicly and used by a real community. It leads with **output** — a live, linkable tool people use — rather than a description of skills.

---

## 2. Proposed Solution

A **client-side web app** (no login, no server) that optimises a character's artifact build from the player's own inventory.

**Phase 1 — Artifact Optimizer (ships end of June):**

- The player loads their artifacts by **importing** them (via their in-game UID, or a standard inventory export file) and/or **entering/editing** them manually.
- They pick a **character** and **weapon**, then define what "best" means:
  - **Constraints** that the build _must_ satisfy — e.g. equip a specific **artifact set** (2-piece / 4-piece), reach **≥ a chosen Energy Recharge %**, or hit a target **crit ratio**.
  - A **single stat to maximise** — e.g. **Crit Value**, **Elemental Mastery**, **ATK%**, etc.
- The app **searches every valid combination** of their owned artifacts and returns the **top builds**, with the resulting stat sheet for each.
- Any build can be turned into a **shareable link** that encodes the full build — open the link and you see the exact same build, no account needed.

**Phase 2 — Team-Composition Optimizer (later, not in the end-June ship):**

- Suggests/optimises multi-character team compositions. Goal-level only in this doc.

### Core rule: how "best" is defined

The optimizer does **not** model in-game damage formulas (that is explicitly out of scope — see §7). Instead it uses a transparent, character-agnostic model:

> **The optimizer returns the build that maximises the chosen target stat, among all combinations of owned artifacts that satisfy every active constraint.** If no combination satisfies the constraints, it says so clearly rather than returning a "closest" guess.

This keeps the tool **fast, explainable, and correct for every character** without per-character maintenance.

---

## 3. Scope of Work

> **Phase 1 — Artifact Optimizer (end-June ship).** Goal: a player can import their artifacts, define constraints + a target, get the best build, and share it.

| Layer  | Task                                                                                                       | Effort      | Component    |
| ------ | ---------------------------------------------------------------------------------------------------------- | ----------- | ------------ |
| Data   | Genshin static dataset (characters, weapons, artifact sets, stat tables) behind a game-adapter abstraction | 1.5 d       | Data layer   |
| Data   | Inventory model + manual add/edit/delete of artifacts                                                      | 1 d         | Inventory    |
| Import | UID import (showcased artifacts)                                                                           | 1 d         | Import       |
| Import | Inventory-export (GOOD-format) file import                                                                 | 1 d         | Import       |
| Core   | Constrained combinatorial optimiser (in-browser, off main thread)                                          | 2 d         | Optimizer    |
| UI     | Character/weapon picker + constraint & target builder                                                      | 1.5 d       | Optimizer UI |
| UI     | Results view (ranked builds + stat sheets)                                                                 | 1 d         | Results      |
| Share  | Encode/decode full build state into a shareable URL                                                        | 0.5 d       | Sharing      |
| Shell  | App shell, routing, empty/loading/error states, deploy                                                     | 1 d         | Shell        |
|        | **Phase 1 total**                                                                                          | **~11.5 d** |              |

> **Phase 2 — Team-Composition Optimizer (post-launch).** Goal: optimise multi-character teams. Detailed scope deferred.

| Layer | Task                           | Effort | Component      |
| ----- | ------------------------------ | ------ | -------------- |
| Core  | Team-comp model + optimisation | TBD    | Team optimizer |
| UI    | Team builder & results         | TBD    | Team UI        |

**Total estimated effort (Phase 1): ~11.5 developer-days.**

---

## 4. User-Facing Behaviour

### 4.1 Loading artifacts (Import)

The player can populate their inventory in two ways; both feed the same inventory:

- **By UID** — they enter their in-game UID. The app fetches their **publicly showcased** characters and the artifacts equipped on them.
  - ⚠️ Expectation to set clearly: a UID only exposes the artifacts on **showcased** characters (a small set), **not** the full inventory. The UI states this so users aren't surprised.
- **By file** — they upload a standard **inventory-export file** (the format produced by community inventory scanners). This can contain the player's **entire** artifact inventory.

UI states:

- **Loading:** spinner + "Fetching artifacts…" / "Reading file…".
- **Success:** toast — `Imported 142 artifacts.` and the inventory list populates.
- **Error (UID):** inline — `Couldn't find that UID, or no characters are showcased. Check the UID and that Character Showcase is on.`
- **Error (file):** inline — `That file isn't a recognised inventory export. Expected a GOOD-format .json.`

### 4.2 Manual entry / editing

- The player can **add** an artifact (choose set, slot, main stat, sub-stats, level), **edit** any field, or **delete**.
- Used both for players who don't use a scanner and for correcting imported data.
- Field constraints are enforced inline (see §4.5).

### 4.3 Setting up an optimisation

The player picks a **character** and **weapon**, then builds the request:

- **Constraints (must-haves):** any of —
  - **Set requirement** — e.g. "4-piece _Emblem of Severed Fate_", or "2-piece A + 2-piece B".
  - **Minimum Energy Recharge** — e.g. `≥ 160%`.
  - **Main-stat locks** per slot — e.g. Sands = ATK%, Goblet = Elemental DMG, Circlet = Crit DMG.
  - **Target crit ratio** (optional) — e.g. keep Crit Rate : Crit DMG near 1:2.
- **Objective (maximise one):** Crit Value, Elemental Mastery, ATK%, total ATK, etc.

UI states:

- **Idle / not enough info:** the **Optimise** button is disabled with a hint — `Pick a character to start.`
- **Running:** progress indicator — `Searching 8,400 combinations…` with a cancel option.
- **Done:** results view (§4.4).

### 4.4 Results

- A **ranked list** of the best builds (default top 5–10), each showing the five artifacts and the **resulting stat sheet** (ATK, Crit Rate, Crit DMG, ER, EM, Crit Value, etc.).
- The player can **pin/compare** builds and open any one as a detailed view.
- **Share:** a **Copy share link** button (see §4.6).

### 4.5 Constraints & Validation _(hard rules that block a run)_

| Trigger                                                         | Where it appears                          | Message                                                                                                |
| --------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| No artifacts in inventory                                       | Inline on Optimise panel; button disabled | `Add or import artifacts before optimising.`                                                           |
| No character selected                                           | Button disabled                           | `Pick a character to start.`                                                                           |
| A slot has zero artifacts matching the locked main stat         | Inline warning under that constraint      | `No Sands with ATK% main stat — relax this lock or add one.`                                           |
| Constraints are mutually infeasible (no valid 5-piece exists)   | Result area (not a crash)                 | `No build satisfies all constraints. Try relaxing the set requirement or the Energy Recharge minimum.` |
| Manual artifact: >4 sub-stats, or sub-stat duplicates main stat | Inline on the field                       | `An artifact can have at most 4 sub-stats, none matching the main stat.`                               |
| Manual artifact: level out of range                             | Inline on the field                       | `Level must be between 0 and 20.`                                                                      |

> **Validation is enforced in the UI before the search runs, and again as a guard inside the optimiser** — the optimiser never assumes the request is well-formed, so a bad state can't crash the worker. This is a single-layer client app (no backend), so there is no server-side bypass to worry about; the guard is defence against malformed shared links.

### 4.6 Sharing a build

- **Copy share link** encodes the selected build (character, weapon, the five artifacts, constraints, objective) into the URL.
- Opening that URL **reconstructs the exact build** — no account, nothing stored server-side.
- If a shared link is malformed or references unknown data, the app shows: `This shared build couldn't be read — it may be from a newer version.` and falls back to an empty state.

---

## 5. Decision Matrix

✅ = proceeds / valid · ❌ = blocked with the message in §4.5

| Scenario                                  | Inventory present? | Character picked? | Constraints feasible? | Outcome                                                           |
| ----------------------------------------- | :----------------: | :---------------: | :-------------------: | ----------------------------------------------------------------- |
| Happy path                                |         ✅         |        ✅         |          ✅           | ✅ Returns ranked builds                                          |
| Empty inventory                           |         ❌         |         —         |           —           | ❌ `Add or import artifacts…` (button disabled)                   |
| No character                              |         ✅         |        ❌         |           —           | ❌ `Pick a character…` (button disabled)                          |
| Locked main stat with no matching pieces  |         ✅         |        ✅         |          ❌           | ❌ Inline warning on that constraint                              |
| Over-tight constraints (no valid 5-piece) |         ✅         |        ✅         |          ❌           | ❌ `No build satisfies all constraints…` in results area          |
| Partial inventory (e.g. UID import only)  |     ✅ (small)     |        ✅         |          ✅           | ✅ Optimises over what's available; banner notes the set is small |
| Import parse failure                      |         ❌         |         —         |           —           | ❌ Inline import error; inventory unchanged                       |
| Malformed shared link                     |        n/a         |        n/a        |          n/a          | ❌ Friendly fallback to empty state                               |

---

## 6. Gap Analysis _(v1.1 — the next headline feature)_

The pure optimizer answers _"what's the best build from the artifacts I already own?"_ Gap analysis answers the question the owner actually cares about: _"what am I missing, and what should I farm to reach the ideal?"_ It is the **centerpiece of the v1.1 depth layer** (full design: `docs/superpowers/specs/2026-06-05-depth-layer-and-portfolio-design.md`; decision: [ADR-0007](docs/adr/0007-gap-analysis-with-frozen-meta-snapshot.md)).

- **Meta target.** A frozen, bundled **build-recipe** per character (recommended set(s), main stat per slot, ER target, crit-ratio target), sourced from **KQM** and labeled "Meta data: patch X.Y". One click pre-fills the constraint/target builder; **every field is overridable**. It is a build _recipe_, not a tier ranking. Fully client-side — no live data.
- **What it reports (no random-roll guessing):**
  - _Feasibility gaps_ — "You own no ATK% Sands," "Only 2 Emblem pieces — can't make 4pc."
  - _Numeric shortfall_ — "Best build hits ER 152% vs. your 160% target."
  - _One grounded action_ — "Your Goblet contributes least; replacing it helps most."
- **Out of scope for gap analysis:** simulated "perfect build" ceilings and random substat-roll modelling (avoids false precision).

## 6b. Team-Composition Optimizer _(later phase — deferred)_

A still-later phase that optimises **multi-character teams** rather than a single character's gear. Out of scope for the end-June launch and for v1.1. Detailed product behaviour to be scoped after gap analysis has shipped and seen real use.

---

## 7. Out of Scope

- **User accounts / server-side storage** — the app is client-only; sharing is via URL.
- **A damage-formula engine** — the optimizer maximises a chosen _stat_ under constraints; it does **not** compute in-game DPS or model character/enemy reactions. (Possible far-future phase.)
- **A public build gallery / browseable library** — would require a backend; sharing is point-to-point via links only.
- **Wuthering Waves at launch** — the data layer is built to add it later, but only Genshin ships first.
- **Team-composition optimisation** — Phase 2.
- **Auto-syncing a player's full live inventory** — limited to UID showcase + manual file import; there is no full-account scrape.

---

## 8. Rollout Plan

- **Phase 1 — Artifact Optimizer:** ~11.5 dev-days · target **end of June 2026** · deployed as a static site on a free host with a public live link, MIT-licensed, README with screenshot/GIF.
- **Phase 2 — Team-Composition Optimizer:** post-launch, effort TBD.
- **Default behaviour:** first-time visitors land on an empty inventory with a clear "Import by UID / Upload export / Add manually" choice and a short example to try.
- **Game expansion:** Wuthering Waves becomes a candidate once the Genshin version is stable and the game-adapter seam is proven.
