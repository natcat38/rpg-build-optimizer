# RPG Build Optimizer — Gap Analysis (v1.1 §3) Design

> **Status:** approved design, pre-build (2026-06-12).
> **Implements:** §3 of the v1.1 depth-layer design (that spec was removed as superseded — see [ADR-0018](../../adr/0018-character-guides-unified-model.md)), per [ADR-0007](../../adr/0007-gap-analysis-with-frozen-meta-snapshot.md).
> **Goal:** the v1.1 centerpiece — compare a player's best **owned** build against a frozen **meta** build recipe and tell them what's missing and what to farm. Also the prerequisite for the later AI "Explain this build" feature.

---

## 1. Purpose

Beyond "best build from what I own," show "what am I missing vs. the meta, and what should I farm." A frozen, overridable **meta target** (recommended set, per-slot mains, ER / crit-ratio targets) per character acts as the comparison point. The **gap report** then surfaces, in plain language: feasibility gaps, numeric shortfall, and one grounded action. 100% client-side, no live API, no random-roll simulation (ADR-0007).

The optimiser already emits the per-build diagnostics this needs (`bindingConstraints`, `marginalBySlot`), so the gap report is largely a presentation layer.

---

## 2. Prerequisite — retain all artifact sets in the snapshot

The frozen snapshot currently holds **35** of `genshin-db`'s **49** sets: `buildSets()` (`scripts/build-dataset.ts`) **drops** any set whose 2-piece bonus isn't a flat stat (`parse2pc` returns null) — which excludes meta sets like **Golden Troupe** ("Elemental Skill DMG +20%") and **Marechaussee Hunter** ("Normal/Charged ATK DMG +15%").

**Fix:** change `buildSets()` to **keep** every set. When `parse2pc` returns null, include the set with `twoPiece: {}` (empty) and log a softer note (e.g. "retained {name} with no scored 2pc bonus") instead of dropping it. Regenerate `src/game/genshin/data.generated.json` (`npm run build:data`).

- This **aligns with ADR-0003**: a set whose bonus is conditional/non-stat is still **requirable as a constraint**, it just contributes 0 to stat scoring. Scoring of existing flat-stat sets is unchanged (`totals` only adds `b.two`/`b.four` when present; empty bonuses add nothing).
- Result: ~49 sets including Golden Troupe + Marechaussee, so meta recipes can reference the real sets.
- Regeneration must be reviewed for diff sanity: it should only **add** the previously-dropped sets (character/weapon data unchanged — same pinned `genshin-db` 4.3.6).

---

## 3. Meta-target data

A hand-curated, frozen, attributed dataset.

- **Location:** `src/meta/metaTargets.ts` exporting `META_TARGETS: Record<string, MetaTarget>` (keyed by characterKey) and a `metaToConstraints(meta)` helper.
- **Type:**

```ts
interface MetaTarget {
  characterKey: string;
  setRequirement: SetRequirement; // reuse the existing union: 4pc | 2pc | 2+2
  mains: Partial<Record<Slot, StatKey>>; // typically sands + goblet; circlet left free
  erTarget?: number; // er_pct floor (already includes the +100 base, post Task-1 of example-gear)
  critRatioTarget?: number; // score.ts convention: cr/(cr+cd); 1:2 CR:CD ≈ 0.333
  objective: Objective;
  source: string; // KQM guide URL
}
```

- **Why circlet is usually left free:** meta says "CR or CD circlet" — locking one main is too strict. Locking `sands`/`goblet` (the stats that define the build) plus `objective: 'crit_value'` (and `critRatioTarget`) lets the optimiser pick the better crit circlet.
- **Seed (4 showcase characters; exact mains/targets verified against KQM when authoring):**

| key           | setRequirement                           | mains (sands / goblet)  | erTarget | critRatioTarget | objective  |
| ------------- | ---------------------------------------- | ----------------------- | -------- | --------------- | ---------- |
| `furina`      | 4pc `GoldenTroupe`                       | hp_pct / elemental_dmg  | 130      | —               | crit_value |
| `nahida`      | 4pc `GildedDreams`                       | em / em                 | —        | —               | crit_value |
| `navia`       | 4pc `NighttimeWhispersInTheEchoingWoods` | atk_pct / elemental_dmg | 140      | 0.333           | crit_value |
| `neuvillette` | 4pc `MarechausseeHunter`                 | hp_pct / elemental_dmg  | —        | 0.333           | crit_value |

- **Attribution:** add a "Meta data" line to `DATA_LICENSE` — recipes adapted from KQM (KeqingMains) character guides, labelled with the data patch. Each entry carries its `source` URL.
- **`metaToConstraints(meta): OptimizeConstraints`** = `{ setRequirement, mainStatLocks: meta.mains, ...(erTarget ? { minStats: { er_pct } } : {}), ...(critRatioTarget != null ? { critRatioTarget } : {}) }`.

---

## 4. Prefill — "Use meta build"

Reuses the shared request store (`useOptimizeRequest`) from the example-gear feature.

- In `OptimizePanel`, when `META_TARGETS[characterKey]` exists, render a **"Use meta build"** button next to Optimise.
- On click: `applyPreset({ characterKey, weaponKey, objective: meta.objective, constraints: metaToConstraints(meta) })` (current character/weapon kept), then trigger the shared `onRun()`.
- Every field remains user-overridable afterward (the panel's selects/inputs are bound to the same store; the ER floor shows in "Minimum Energy Recharge %").

---

## 5. Gap report — computation

A pure module `src/meta/gap.ts`:

```ts
interface GapReport {
  characterKey: string;
  feasibility: string[]; // Level 1
  shortfalls: string[]; // Level 2
  action: string | null; // Level 3 — exactly one
}
function computeGapReport(
  meta: MetaTarget,
  inventory: Artifact[],
  build: BuildResult | null,
): GapReport;
```

- **Level 1 — feasibility (inventory vs recipe; independent of the run):**
  - **Set:** count owned pieces of each required set across distinct slots. `4pc` needs ≥4, `2pc` ≥2, `2+2` ≥2 of each. If short → e.g. "You own only 2 Golden Troupe pieces — can't form the 4-piece." (Use `formatSetName`.)
  - **Mains:** for each `meta.mains[slot]`, if no inventory artifact in that slot has that main stat → e.g. "You own no HP% Sands (meta wants HP% Sands)." (Use `statLabel`/`SLOT_LABELS`.)
- **Level 2 — numeric shortfall (best build vs targets; only when `build` present):**
  - `erTarget`: if `build.totals.er_pct < erTarget` → "Best build reaches ER 132% vs 130% target" only when short (`d = target − have`), e.g. "…short by 8%."
  - `critRatioTarget`: report the build's CR:CD vs the meta's target ratio as guidance (informational; not a hard "short by"), e.g. "Crit ratio 1:1.6 vs meta's ~1:2 — favour CRIT DMG."
- **Level 3 — one grounded action (exactly one, prioritised):**
  - If any feasibility gap exists → the highest-impact one (set gap first, else a missing main): "Farm Golden Troupe — you can't form the meta 4-piece yet."
  - Else if `build` present → the slot with the **lowest** `build.diagnostics.marginalBySlot` value: "Your Goblet contributes least to crit value — upgrading it has the most upside." (Use `SLOT_LABELS`, `objectiveLabel`.)
  - Else `null`.
- **No random-roll simulation, no Level-4 ceiling** (ADR-0007).

Unit-tested per level with small fixtures.

---

## 6. Gap report — UI

- `src/components/GapReport.tsx` renders a `GapReport` as a styled panel (reusing `panel`, `text-muted`, accent classes): a "Gap vs meta build" heading, then the feasibility list, the shortfall list, and the single highlighted action. Empty sections are omitted; if everything is met it shows a positive "Your gear can already build the meta" state.
- **Where:** in `App`, inside the Results area (above `<Results>`), rendered when **(a)** the result's character has a `META_TARGET` **and (b)** the build is freshly optimised (not a shared-link build — gap analysis is about _your_ inventory, so skip it when `sharedArtifacts` is set). It renders even when the run was `NO_FEASIBLE_BUILD` (passing `build = null`), since "why infeasible + what to farm" is the most valuable case.
- Inputs: `meta = META_TARGETS[request.characterKey]`, `inventory = useInventory` artifacts, `build = result.builds[0] ?? null`.

---

## 7. Behaviour & edge cases

- **No meta for the character:** no "Use meta build" button, no gap report. Normal flow unchanged.
- **Infeasible under meta constraints:** Results shows its "No build satisfies all constraints" message; the gap report still renders (feasibility gaps + the farming action).
- **User optimised without the meta prefill:** the gap report still compares their best build to that character's meta (feasibility from inventory + shortfall from their build) — always informative.
- **Shared-link build:** no gap report (not the viewer's inventory).
- **The sample inventory** lacks Golden Troupe / Marechaussee / Nighttime pieces, so those presets' gap reports show real feasibility gaps ("farm …"); Nahida (Gilded Dreams is in the bag) shows numeric shortfall instead — built-in demo variety.

---

## 8. Testing

- **Dataset:** an adapter/sets test asserting Golden Troupe + Marechaussee Hunter are now present (and a flat-stat set like Emblem still has its 2pc bonus).
- **metaToConstraints:** maps a `MetaTarget` to the expected `OptimizeConstraints` (setRequirement, mainStatLocks, er floor, crit-ratio).
- **computeGapReport:** fixtures covering each level — a feasibility gap (no required set / missing main), a numeric shortfall (ER below target), and the weakest-slot action; plus the infeasible (`build = null`) path.
- **GapReport component:** renders the three sections; omits empty ones; shows the all-met state.
- **Existing tests stay green** (dataset regen must not break set-bonus/optimizer tests).

---

## 9. Acceptance criteria

1. The snapshot includes Golden Troupe + Marechaussee Hunter (and all 49 sets); existing optimizer/set tests still pass.
2. Selecting a meta character shows "Use meta build"; clicking it prefills the request (set / mains / ER / crit-ratio / objective), runs, and the panel reflects it (overridable).
3. After a run for a meta character, a "Gap vs meta build" report shows feasibility gaps, any numeric shortfall, and exactly one grounded action — and renders even when the run is infeasible.
4. The gap report is absent for non-meta characters and for shared-link builds.
5. No random-roll simulation anywhere.
6. `npm run typecheck`, `lint`, `test`, `build` all pass.

---

## 10. Out of scope

- The AI "Explain this build" feature (next, separate spec — consumes this gap report).
- Level-4 "perfect build" ceiling / roll simulation (ADR-0007 exclusion).
- Expanding meta coverage beyond the 4 showcase characters (later data refresh).
- A set-requirement / main-lock editor in the panel UI (prefill sets them; manual editing of those is a future nicety — only the ER field is panel-editable today).

---

## 11. Decomposition

One spec, one plan, ~7 TDD tasks: (1) dataset retain-all-sets + regen, (2) meta-target data + `metaToConstraints` + tests, (3) "Use meta build" prefill button, (4) `computeGapReport` + tests, (5) `GapReport` UI + App wiring, (6) final verification. The AI feature is a separate spec built on top.
