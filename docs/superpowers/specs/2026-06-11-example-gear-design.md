# RPG Build Optimizer — "Try with example gear" (v1.1 §4.1) Design

> **Status:** approved design (lineup + shared-inventory + one-click), pre-build (2026-06-11).
> **Implements:** §4.1 of `docs/superpowers/specs/2026-06-05-depth-layer-and-portfolio-design.md`.
> **Goal:** remove the import wall — a first-time visitor (recruiter) lands on ranked results in one click, and can flip between several showcase builds over the same sample account.

---

## 1. Purpose

The app's empty state currently demands an import before anything happens. This adds a **"Sample builds"** card with several one-click presets. Each preset loads one shared, realistic sample inventory, selects a character + weapon + objective + a representative constraint, runs the real optimiser (Web Worker path), and shows ranked results — no further input. Flipping between presets re-optimises the **same** inventory for a different character/constraint, demonstrating "one account, several optimal builds."

---

## 2. The preset lineup

All keys verified present in the frozen snapshot. Each preset demonstrates a **different constraint mechanism** (the "variety beyond ER" requirement). Objective is `crit_value` for all (it prunes fast and reads as a clean, balanced result).

| Preset character | key           | Weapon (signature)           | Constraint demoed                            | `constraints` value                                               |
| ---------------- | ------------- | ---------------------------- | -------------------------------------------- | ----------------------------------------------------------------- |
| **Furina**       | `furina`      | `aquila_favonia`             | Energy Recharge floor (`minStats`)           | `{ minStats: { er_pct: 200 } }`                                   |
| **Nahida**       | `nahida`      | `a_thousand_floating_dreams` | Elemental Mastery floor (`minStats`, non-ER) | `{ minStats: { em: 550 } }`                                       |
| **Navia**        | `navia`       | `beacon_of_the_reed_sea`     | Required 4-piece set (`setRequirement`)      | `{ setRequirement: { kind: '4pc', setKey: 'GladiatorsFinale' } }` |
| **Neuvillette**  | `neuvillette` | `cashflow_supervision`       | Locked goblet main stat (`mainStatLocks`)    | `{ mainStatLocks: { goblet: 'elemental_dmg' } }`                  |

All presets: `buildLevel: 90`, `topK: 10`, `objective: 'crit_value'`.

### 2.1 Base Energy Recharge correction (prerequisite)

The frozen snapshot has **no base Energy Recharge** (`baseStats(...).er_pct === 0` for every character), but in Genshin **every character has a universal 100% base ER**. Without it, ER totals are ~100% too low and any ER constraint is misleading/infeasible. Fix this app-wide in the adapter: `genshinAdapter.baseStats()` adds `er_pct: 100` to its result (with a regression test). This makes the Furina `ER ≥ 200` floor realistic and feasible, and corrects ER everywhere in the app (e.g. the panel's "Minimum Energy Recharge %" field). Nahida's base EM is already ~379, so her floor is set to **550** to remain a binding constraint.

---

## 3. The shared sample inventory

A single deterministic fixture (~90–120 artifacts) built by a curated builder, so the bundle is realistic **and** every preset finds a coherent, feasible top build from the same bag.

- **Location:** `src/sample/sampleInventory.ts` exporting `SAMPLE_INVENTORY: Artifact[]` (a module constant, built once at import via a deterministic helper — not random per load).
- **Ids:** every artifact id is prefixed `sample-` (used for sample-mode detection, §5).
- **Construction:** for each featured set, lay down ~2 pieces per slot with slot-legal main stats and Crit-heavy substats; reuse the `subValue` magnitude helper and the seeded PRNG from `src/optimizer/benchmark.ts` (export them if not already exported) with a fixed seed, but with **controlled** set/main distribution (not the random benchmark distribution).
- **Featured sets:** `GladiatorsFinale`, `GildedDreams`, `EmblemOfSeveredFate`, plus filler `CrimsonWitchOfFlames` and `HuskOfOpulentDreams` for realism and anti-clone variety.
- **Feasibility guarantees (the builder MUST satisfy these, asserted in tests):**
  - **Furina ER ≥ 200:** with the +100 base ER (§2.1), include an ER% sands and generous ER substats (each non-sands slot can carry an ER sub) so 200% ER is reachable — forcing a real crit-vs-ER tradeoff.
  - **Nahida EM ≥ 550:** base EM is ~379; include EM sands and EM goblet options (187 each at +20) so ≥550 EM is reachable alongside a Crit circlet.
  - **Navia 4pc Gladiator's:** include ≥1 `GladiatorsFinale` piece in **every** slot (provide 2 where possible) so a 4-piece is always formable.
  - **Neuvillette goblet lock = `elemental_dmg`:** include ≥2 goblets with `mainStat: 'elemental_dmg'` (Crit substats), so the locked pool is non-empty.
  - Every slot has ≥1 piece overall (no empty-pool infeasibility).

---

## 4. Components and wiring

To let presets drive the optimise panel **and** the results, the optimise request becomes shared state instead of living privately inside `OptimizePanel`.

- **New `src/state/optimizeRequest.ts`** — a small Zustand store holding the editable request: `characterKey`, `weaponKey`, `buildLevel`, `objective`, and `constraints` (plus the `minER` text field's source of truth). Defaults match today's `OptimizePanel` initial values. Exposes setters and a `setRequest(partial)` for presets.
- **`OptimizePanel` refactor** — bind its selects/inputs to `useOptimizeRequest` instead of local `useState`. Its "Optimise" button calls a shared run function (below). Behaviour and the existing accessible roles/text ("Optimise" button, the "Add or import artifacts before optimising." hint) are preserved so `OptimizePanel.test` still passes.
- **Shared run path** — extract `optimizeFor(req, inventory): Promise<OptimizeResult>` (wraps `buildContext` + `runOptimize`) into `src/workers/optimizeClient.ts`. `App` owns `runCurrent()` which reads the request + inventory stores, calls `optimizeFor`, and sets `result`/`request`. Both the Optimise button and the sample presets trigger `runCurrent()`.
- **New `src/components/SampleGear.tsx`** — renders the "Sample builds" card (heading + one button per preset). On click it: (1) `clear()` then `addMany(SAMPLE_INVENTORY)`, (2) `setRequest(preset)` on the request store, (3) awaits `runCurrent()`, (4) scrolls Results into view. Buttons show a loading state while running.

Data flow: `SampleGear` → request store + inventory store → `runCurrent()` (in App) → `optimizeFor` (worker) → `App` result state → `Results`/`OptimizePanel` reflect the preset.

---

## 5. Behaviour, sample-mode detection, and edge cases

- **Sample mode** = inventory is empty **or** every artifact id starts with `sample-`. No separate flag needed.
- **Where the card shows:** `SampleGear` renders only in sample mode. So it appears on the empty state and stays available (as the preset switcher) after a sample is loaded — letting the visitor flip characters. Once the user imports/adds **real** gear (non-`sample-` ids), the card disappears and never touches their data.
- **Flipping presets:** clicking another preset clears and reloads the same `SAMPLE_INVENTORY` (idempotent) and re-runs for the new character/constraint.
- **No destructive surprise:** because the card is hidden whenever real gear is present, a preset click can never wipe a user's imported inventory.
- **Worker fallback:** uses the existing `runOptimize` which already falls back to synchronous `optimize()` when `Worker` is undefined (tests/SSR).

---

## 6. Testing

- **Sample inventory unit tests** (`src/sample/sampleInventory.test.ts`): deterministic (same array across imports); every slot non-empty; the four feasibility guarantees from §3 (e.g., `optimize()` with each preset's request returns ≥1 build, not `NO_FEASIBLE_BUILD`).
- **SampleGear component test**: rendering the card shows the four preset buttons; clicking one populates the inventory store with sample artifacts and calls the run path (assert results appear / `onResult` fired).
- **Preserve existing tests**: `OptimizePanel.test` and `App.test` must still pass; update them only as needed for the store refactor (keeping the same roles/text).

---

## 7. Acceptance criteria

1. On the empty state, a "Sample builds" card shows four preset buttons (Furina, Nahida, Navia, Neuvillette).
2. Clicking any preset lands on ranked results with **no further input**, with the optimise panel reflecting that preset's character/weapon/objective/constraint.
3. Each preset yields a feasible, coherent top build (no `NO_FEASIBLE_BUILD`); the constraint is visibly honoured (ER ≥ 200 / EM ≥ 550 / all-Gladiator's 4pc / goblet = Hydro DMG).
4. Flipping between presets re-optimises the same sample inventory.
5. The card is hidden once the user has their own (non-sample) gear; presets never overwrite real inventory.
6. `npm run typecheck`, `lint`, `test`, `build` all pass.

---

## 8. Out of scope

- Gap analysis / meta-target prefill (later v1.1 items).
- The AI "explain this build" feature.
- Per-preset bespoke inventories (we use one shared bag by design).
- Animating the search (stretch item).
