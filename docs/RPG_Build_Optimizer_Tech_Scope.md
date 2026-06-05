# RPG Build Optimizer — Tech Scope

> **Audience:** engineers (you, building it). Code-level breakdown.
> **Stack:** Vite + React + TypeScript + Tailwind. Pure client-side SPA. Optimisation runs in a **Web Worker**. Deployed static (Vercel). MIT.
> **Companion doc:** `RPG_Build_Optimizer_Product_Scope.md`.

---

## 1. Overview

> **Phase 1 — Artifact Optimizer (end-June ship).** Dependency note: **Task 2 (data layer) must land before Tasks 4–7** — the importer, optimiser, and UI all consume `GameAdapter` types. The optimiser (Task 5) can be built and unit-tested against fixture data before the import UI (Task 4) is done.

| # | Task | Layer | File(s) | Effort |
|---|------|-------|---------|--------|
| 1 | Project scaffold + tooling + deploy | Shell | `vite.config.ts`, `index.html`, CI | 0.5 d |
| 2 | Static dataset + `GameAdapter` abstraction | Data | `src/data/*`, `src/game/*` | 1.5 d |
| 3 | Inventory store + manual entry/edit | State/UI | `src/state/inventory.ts`, `src/components/ArtifactForm.tsx` | 1.5 d |
| 4 | Import: UID + GOOD file | Import | `src/import/*` | 2 d |
| 5 | Optimiser core + Web Worker | Core | `src/optimizer/*`, `src/workers/optimize.worker.ts` | 2.5 d |
| 6 | Optimisation request UI (constraints + target) | UI | `src/components/OptimizePanel.tsx` | 1.5 d |
| 7 | Results view + compare | UI | `src/components/Results.tsx` | 1 d |
| 8 | Share-link encode/decode | Share | `src/share/url.ts`, route loader | 0.5 d |
| | **Phase 1 total** | | | **~11 d** |

> **Phase 2 — Team-Composition Optimizer (deferred).** Separate optimiser + UI; reuses the dataset and worker scaffolding. Not detailed here.

---

## 2. Core Logic — the optimisation model

This section is referenced by Tasks 5, 6 and 8. Define it once here.

### 2.1 Domain model
A Genshin artifact occupies one of **5 slots**; each contributes one **main stat** and up to **4 sub-stats**.

```ts
type Slot = 'flower' | 'plume' | 'sands' | 'goblet' | 'circlet';
type StatKey =
  | 'hp' | 'hp_pct' | 'atk' | 'atk_pct' | 'def' | 'def_pct'
  | 'em' | 'er_pct' | 'crit_rate' | 'crit_dmg'
  | 'elemental_dmg' | 'physical_dmg' | 'healing';

interface Artifact {
  id: string;
  setKey: string;        // e.g. 'EmblemOfSeveredFate'
  slot: Slot;
  level: number;         // 0..20
  mainStat: StatKey;
  subStats: { key: StatKey; value: number }[]; // <= 4, none === mainStat
}
```

### 2.2 The request
```ts
interface OptimizeRequest {
  characterKey: string;
  weaponKey: string;
  constraints: {
    setRequirement?:                       // any ONE of:
      | { kind: '4pc'; setKey: string }
      | { kind: '2+2'; setKeys: [string, string] }
      | { kind: '2pc'; setKey: string };
    minStats?: Partial<Record<StatKey, number>>;   // e.g. { er_pct: 160 }
    mainStatLocks?: Partial<Record<Slot, StatKey>>; // e.g. { sands: 'atk_pct' }
    critRatioTarget?: number;                       // optional, e.g. 0.5 (= 1:2), used as a soft tiebreak
  };
  objective: StatKey | 'crit_value';    // the single thing to maximise
}
```

### 2.3 Derived stats (objective + constraint evaluation)
Total stats = character base (at level/ascension) + weapon main+passive (stat parts only) + Σ artifact main stats + Σ artifact sub-stats + set-bonus stat effects (the **stat-granting** parts of 2pc/4pc only — non-stat effects are ignored, consistent with "no damage engine").

```
total[stat] = base[stat] + Σ contributions[stat]
crit_value  = crit_rate * 2 + crit_dmg          // standard CV definition
```

`crit_ratioTarget` is **not** a hard constraint — it is applied as a tiebreak penalty so the result doesn't return a lopsided 90/10 crit split. Hard feasibility is governed only by `setRequirement`, `minStats`, and `mainStatLocks`.

### 2.4 The search
Brute-forcing is `|flower| × |plume| × |sands| × |goblet| × |circlet|`, which explodes for large inventories. Use **pruned branch-and-bound** over slots in a fixed order:

```
optimize(req, inventory):
  pools = inventory grouped by slot, pre-filtered by mainStatLocks
  order slots [flower, plume, sands, goblet, circlet]
  best = topK heap (size K)
  recurse(slotIndex, chosen[], runningContribution):
    if slotIndex == 5:
      if satisfies(setRequirement, chosen) and satisfies(minStats, total):
        score = objectiveValue(total) - critRatioPenalty(total)
        best.offer(chosen, score)
      return
    upperBound = objectiveValue(runningContribution + maxRemaining(slotIndex))
    if upperBound <= best.minScore: return        # PRUNE
    for artifact in pools[slot[slotIndex]]:
      recurse(slotIndex+1, chosen+artifact, runningContribution+contribution(artifact))
```

- **`maxRemaining`** = sum of the best possible objective contribution still achievable from the remaining slots' pools (precompute per slot). Gives an admissible upper bound for pruning.
- **Set-requirement pruning:** also prune branches that can no longer reach the required set count given remaining slots.
- Return the **top K** builds (K configurable, default 10).
- **Infeasible** → empty result with reason `NO_FEASIBLE_BUILD`.

### 2.5 Worked example (pruning intuition)
| Inventory size/slot | Naïve combinations | After main-stat locks (sands/goblet/circlet) | With branch-and-bound pruning |
|---|---|---|---|
| 10 each | 100,000 | ~10×10×3×3×4 ≈ 3,600 | hundreds explored |
| 40 each | 102,400,000 | ~40×40×12×12×15 ≈ 3.4 M | thousands explored |

Locks + bounding turn an intractable brute force into something that finishes in well under a second on the main inventory sizes players actually have.

### 2.6 Import mapping
- **GOOD format** (`{ format: "GOOD", artifacts: [...] }`) → map each entry to `Artifact`. GOOD is the de-facto community export (produced by inventory scanners). Mapping is a pure function; version-guard on `version`/`source`.
- **UID import** → fetch showcase JSON for the UID, read equipped artifacts off showcased characters, map to `Artifact`. Only showcased characters are exposed (small set) — surface this in the UI (Product Scope §4.1).

### 2.7 URL build-encoding
```ts
// state -> compact array of indices/keys -> JSON -> deflate -> base64url -> ?b=...
encodeBuild(state): string
decodeBuild(param): BuildState | { error: 'UNREADABLE' }
```
Keep payload small (pack artifact references as `setKey+slot+statHash`, not full objects). Guard `decodeBuild` so a malformed/old param yields a friendly empty state, never a throw.

---

# Phase 1 — Artifact Optimizer

## Task 1 — Project scaffold + tooling + deploy
**File:** `vite.config.ts`, `index.html`, CI config · **Effort:** 0.5 d

### Task 1.1 — Scaffold
Vite + React + TS template; Tailwind; ESLint + Prettier; Vitest. Strict TS (`"strict": true`).

### Task 1.2 — Deploy pipeline
Static deploy to Vercel; a GitHub Actions workflow running typecheck + lint + tests on push (this also feeds the "meaningful commit history / green CI" story for the portfolio).

---

## Task 2 — Static dataset + `GameAdapter`
**File:** `src/data/genshin/*`, `src/game/GameAdapter.ts` · **Effort:** 1.5 d

### Task 2.1 — `GameAdapter` interface  `# NEW`
The extension seam that lets Wuthering Waves slot in later without touching the optimiser.
```ts
// src/game/GameAdapter.ts  # NEW
export interface GameAdapter {
  id: 'genshin' | 'wuwa';
  slots: Slot[];
  characters(): CharacterMeta[];
  weapons(): WeaponMeta[];
  sets(): ArtifactSetMeta[];   // incl. the stat-granting parts of 2pc/4pc effects
  baseStats(characterKey: string, weaponKey: string): Partial<Record<StatKey, number>>;
}
```
⚠️ The optimiser depends only on `GameAdapter`, never on Genshin-specific imports.

### Task 2.2 — Genshin dataset
Bundle a static JSON dataset (characters, weapons, sets, main/sub-stat value tables) derived from a community dataset. **Attribute the source** in the repo (see Implementation Notes). Only the **stat-affecting** portions of set bonuses are modelled.

---

## Task 3 — Inventory store + manual entry
**File:** `src/state/inventory.ts`, `src/components/ArtifactForm.tsx` · **Effort:** 1.5 d

### Task 3.1 — Store
Zustand store: `artifacts: Artifact[]`, plus `add/update/remove/clear`. Persist to `localStorage`.

### Task 3.2 — Manual add/edit form
Form with set/slot/level/main-stat/sub-stats. Validation (exact copy from Product Scope §4.5):
```ts
if (subStats.length > 4) error('An artifact can have at most 4 sub-stats, none matching the main stat.');
if (subStats.some(s => s.key === mainStat)) error('An artifact can have at most 4 sub-stats, none matching the main stat.');
if (level < 0 || level > 20) error('Level must be between 0 and 20.');
```

---

## Task 4 — Import (UID + GOOD)
**File:** `src/import/good.ts`, `src/import/uid.ts`, `src/components/ImportPanel.tsx` · **Effort:** 2 d

### Task 4.1 — GOOD file import
```ts
export function parseGOOD(json: unknown): Artifact[] | { error: 'BAD_FORMAT' }
```
Validate shape (`format === 'GOOD'`), map artifacts (§2.6), reject otherwise with the §4.1 file-error copy.

### Task 4.2 — UID import
Fetch showcase data for the UID; map equipped artifacts. Handle not-found / no-showcase with the §4.1 UID-error copy. ⚠️ Make the "showcased only" limitation explicit in the panel.

### Task 4.3 — Merge into inventory
De-dupe against existing artifacts (stable id by content hash) so re-importing doesn't duplicate; toast `Imported N artifacts.`

---

## Task 5 — Optimiser core + Web Worker
**File:** `src/optimizer/search.ts`, `src/optimizer/score.ts`, `src/workers/optimize.worker.ts` · **Effort:** 2.5 d

### Task 5.1 — Scoring/feasibility (pure)
Implement `totals()`, `objectiveValue()`, `satisfies()`, `critRatioPenalty()` per §2.3. **Unit-test heavily** against fixtures — this is the algorithmic core and the part worth showing off.

### Task 5.2 — Branch-and-bound search (pure)
Implement §2.4 incl. `maxRemaining` bound + set-requirement pruning; return top-K + `NO_FEASIBLE_BUILD`. Unit-test: correctness vs brute force on small inputs, and that pruning never changes the result.

### Task 5.3 — Worker wrapper
Run the search in `optimize.worker.ts`; `postMessage` request → progress + final result. Guard inputs (defence against malformed shared state, Product Scope §4.5). UI shows progress + cancel.
⚠️ Keep all heavy work in the worker — never block the main thread.

---

## Task 6 — Optimisation request UI
**File:** `src/components/OptimizePanel.tsx` · **Effort:** 1.5 d

### Task 6.1 — Character/weapon pickers + constraint builder
Set requirement, min-stat inputs (`er_pct` etc.), per-slot main-stat locks, objective selector. Disable **Optimise** with the §4.5 hints when prerequisites are missing.

### Task 6.2 — Pre-run feasibility hints
Before dispatching to the worker, warn on locks with no matching pieces (`No Sands with ATK% main stat…`).

---

## Task 7 — Results view
**File:** `src/components/Results.tsx` · **Effort:** 1 d

### Task 7.1 — Ranked builds + stat sheets
Render top-K builds with the five pieces + resulting stat sheet. Empty/infeasible state shows `No build satisfies all constraints…`.

### Task 7.2 — Compare / pin + share entry point
Pin builds to compare side-by-side; each build has a **Copy share link** button → Task 8.

---

## Task 8 — Share-link encode/decode
**File:** `src/share/url.ts` + route loader · **Effort:** 0.5 d

### Task 8.1 — Encode/decode
Implement §2.7. On load, if `?b=` present, decode and hydrate; on `UNREADABLE`, show `This shared build couldn't be read — it may be from a newer version.` and fall back to empty.

---

## Implementation Notes

- **No-secrets / no-backend:** the app is 100% client-side. There are no API keys to leak; the only network call is the public UID showcase fetch. Still run a secret scan before first push out of habit (it's free insurance for the portfolio).
- **Dataset licensing/attribution:** ⚠️ the bundled Genshin data comes from a community dataset — check and honour its licence, credit it in the README and a `DATA_LICENSE`/NOTICE file. Don't ship copyrighted game assets you don't have rights to; prefer text/stat data + your own UI.
- **Worker messaging:** structured-clone only — pass plain data, not class instances, across the worker boundary. Keep the request/response types in a shared module.
- **URL size:** browsers cap URLs (~2k safe). The compact packing in §2.7 keeps a full build well under that; if Phase 2 team builds get large, switch to a fragment (`#`) and/or stronger compression.
- **Wuthering Waves seam:** the only Genshin-specific code lives under `src/data/genshin/` and a `genshinAdapter`. Adding WuWa = a new dataset + adapter; the optimiser, UI, and share layer are game-agnostic. ⚠️ Don't leak `Slot`/`StatKey` literals that are Genshin-only into shared code — keep slot/stat vocabularies on the adapter.
- **Presentable default branch:** `main`, clean first-push history (no `wip`/`asdf` commits), green CI badge, README with a screenshot/GIF of an actual optimisation run. MIT `LICENSE` at repo root.
- **Out-of-scope guardrails in code:** no damage formulas, no accounts, no server storage — if a task starts pulling those in, it belongs in a later phase, not Phase 1.
