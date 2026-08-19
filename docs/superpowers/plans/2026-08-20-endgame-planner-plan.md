# Endgame Planner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn rpg-build-optimizer into an endgame planner: import a Genshin account → roster assessment → recommended Spiral Abyss teams → per-member optimized builds (damage-ranked where possible) → farming/pull shopping list.

**Architecture:** Three new layers on the existing exact optimizer: (1) a pure-TS KQM damage engine wired in as a new exact-search objective `avg_damage` (with a monotone vector upper bound so pruning stays exact), (2) curated comp archetypes matched against the roster with a disjoint-pair Abyss solver, (3) a Plan page composing teams → builds → shopping list. Spec: `docs/superpowers/specs/2026-08-20-endgame-planner-spec.md`. Research: `docs/research/2026-08-20-*.md`.

**Tech Stack:** Existing only — Vite, React 19, TypeScript strict, Tailwind, Zustand (persist), Web Workers, Vitest + Testing Library, frozen genshin-db snapshot. **No new runtime dependencies.**

## Global Constraints

- 100% client-side logic; reference data stays the frozen bundled snapshot (`npm run build:data`); never vendor raw Dimbreath data (ADR-0001/0002).
- The optimizer stays **exact**: every new objective needs an admissible upper bound; the brute-force oracle test pattern must cover it (ADR-0004).
- All damage figures carry the UI copy: `estimated — for comparing builds, not matching in-game numbers`.
- Character keys in all new curated data are **dataset keys** (snake_case: `neuvillette`, `raiden_shogun`, `kaedehara_kazuha`) — same convention as `src/meta/metaTargets.ts`. GOOD keys are PascalCase and already normalized by `parseGOODRoster` (`src/import/good.ts:118`).
- Curated content files (damage profiles, comp archetypes, obtainability) follow the house pattern of `src/meta/metaTargets.ts`: hand-transcribed, `source` URL per entry, `// ponytail:` freshness caveat at the top, **owner reviews the curation PR** (content accuracy is not code review).
- Verification before every commit: `npm run typecheck && npm run lint && npm test`. Before every PR additionally `npm run build`. On Windows, don't trust whole-repo `format:check` (CRLF false positives) — run `npx prettier --check` on changed files only.
- One PR per phase; branch names `phase-endgame-<n>-<slug>`. Repo has branch protection (PR + CI required).
- Fixture: `genshinData_GOOD_2026_07_15_02_29.json` (repo root) is the owner's real account — 549 artifacts / 150 weapons / 109 characters. Import it in tests via a helper (Task 0.2); never bundle it into the app build.
- ADR numbering starts at 0016. `CONTEXT.md` glossary and `knowledge/` update in the same PR that introduces a term.

---

## Phase 0 — Groundwork (PR 1)

### Task 0.1: Refresh the frozen snapshot to game version 7.0

**Files:**

- Modify: `package.json` (devDependency `genshin-db` version bump)
- Modify: `src/game/genshin/data.generated.json` (regenerated)
- Possibly modify: `scripts/build-dataset.ts` (only if genshin-db's API changed shape)

**Interfaces:** unchanged — `genshinAdapter` keeps its exact API (`src/game/genshin/adapter.ts:41`).

- [ ] **Step 1:** `npm install -D genshin-db@latest` (research says data lands 1-2 days post-patch; 7.0 released 2026-08-12, so it's available).
- [ ] **Step 2:** `npm run build:data`. If the script throws, fix `scripts/build-dataset.ts` mapping minimally — the output schema (`src/game/genshin/snapshot.ts`) must not change.
- [ ] **Step 3:** `npm test` — the full suite must stay green. Failures here mean a snapshot regression (renamed key, missing curve), not a test to update. Exception: tests that assert the literal patch string.
- [ ] **Step 4:** Verify the snapshot's `patch` field reports a 7.x version:

```bash
node -e "console.log(require('./src/game/genshin/data.generated.json').patch)"
```

- [ ] **Step 5:** Commit: `chore: refresh frozen genshin-db snapshot to 7.0`

### Task 0.2: Fixture helper + roster-import integration test

**Files:**

- Create: `src/test-fixtures/ownerAccount.ts`
- Create: `src/test-fixtures/ownerAccount.test.ts`

**Interfaces:**

- Produces: `loadOwnerGOOD(): unknown` — the parsed root GOOD JSON, for use in any later test (`import { loadOwnerGOOD } from '../test-fixtures/ownerAccount'`).

- [ ] **Step 1: Write the failing test**

```ts
// src/test-fixtures/ownerAccount.test.ts
import { describe, it, expect } from 'vitest';
import { loadOwnerGOOD } from './ownerAccount';
import { parseGOOD, parseGOODRoster } from '../import/good';

describe('owner account fixture', () => {
  it('imports the full artifact inventory', () => {
    const arts = parseGOOD(loadOwnerGOOD());
    expect(Array.isArray(arts)).toBe(true);
    // 549 in the file; a handful may be skipped as unrecognised — assert a floor.
    expect((arts as unknown[]).length).toBeGreaterThan(500);
  });
  it('imports the roster without throwing on 7.0-era characters', () => {
    const roster = parseGOODRoster(loadOwnerGOOD());
    // 109 in the file; Traveler variants + any unmapped keys are skipped.
    expect(Object.keys(roster).length).toBeGreaterThan(95);
    expect(roster['neuvillette']).toBeDefined();
    expect(roster['kaedehara_kazuha']).toBeDefined();
  });
});
```

- [ ] **Step 2:** Run: `npx vitest run src/test-fixtures` — FAIL (module not found).
- [ ] **Step 3: Implement**

```ts
// src/test-fixtures/ownerAccount.ts
// Test-only helper: reads the owner's real GOOD export from the repo root.
// Never import this from src/ app code — it must not enter the bundle.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function loadOwnerGOOD(): unknown {
  const p = resolve(__dirname, '../../genshinData_GOOD_2026_07_15_02_29.json');
  return JSON.parse(readFileSync(p, 'utf-8'));
}
```

- [ ] **Step 4:** Run: `npx vitest run src/test-fixtures` — PASS. If the roster count assertion fails, list which GOOD keys didn't resolve (`console.log` diff of GOOD characters vs resolved) and lower the floor only for genuinely-absent-from-snapshot characters (e.g. Traveler variants) — record the skip list in the test as a comment.
- [ ] **Step 5:** Commit: `test: owner-account GOOD fixture helper + import integration test`

### Task 0.3: CONTEXT.md + README vision update

**Files:**

- Modify: `CONTEXT.md` (new "v2 domain" section), `README.md` (roadmap), `knowledge/index.md` (link the spec)

- [ ] **Step 1:** Add to `CONTEXT.md` under a new `### v2 domain (endgame planner)` heading, one line each (use these exact terms): **Damage profile** (weighted single-hit stand-in for a rotation; talent-lv9 multipliers), **Target function** (Σ weight × hit damage; the `avg_damage` objective), **Enemy config** (level/RES assumptions, default level 100 / 10% RES), **Build score** (0–100 roster readiness composite), **Comp archetype** (curated 4-slot team recipe; roles with ranked substitutes), **Role** (`on-field-dps | off-field-dps | buffer | sustain | battery | applicator`), **Team recommendation** (archetype instantiated from the roster), **Endgame mode** (`abyss | theater | stygian`; Abyss first), **Plan** (teams → per-member builds → shopping list), **Shopping list** (aggregated farming + investment advice).
- [ ] **Step 2:** README: replace the "Roadmap" section's closing line with a short "v2: Endgame Planner" paragraph linking `docs/superpowers/specs/2026-08-20-endgame-planner-spec.md`.
- [ ] **Step 3:** `npm run docs:check` (repo has a docs checker) — PASS.
- [ ] **Step 4:** Commit: `docs: v2 endgame-planner glossary + roadmap`. Open PR 1.

---

## Phase 1 — Damage engine (PR 2)

### Task 1.1: KQM formula module

**Files:**

- Create: `src/damage/types.ts`, `src/damage/formula.ts`
- Test: `src/damage/formula.test.ts`

**Interfaces:**

- Produces (consumed by Tasks 1.2–1.4):

```ts
// src/damage/types.ts
import type { StatVec } from '../game/types';

export type Reaction =
  | 'none'
  | 'vaporize-2x'
  | 'vaporize-1.5x'
  | 'melt-2x'
  | 'melt-1.5x'
  | 'aggravate'
  | 'spread';

export interface DamageHit {
  name: string; // "Charged Attack (per tick)"
  scaling: 'atk' | 'hp' | 'def' | 'em';
  multiplier: number; // % of scaling stat at talent lv9 (e.g. 200 = 200%)
  bonus: 'elemental' | 'physical'; // which DMG% bucket applies
  reaction: Reaction;
  weight: number; // contribution weight in the target function
}

export interface DamageProfile {
  characterKey: string; // dataset key (snake_case)
  hits: DamageHit[];
  erRequirement?: number; // default er_pct floor when optimizing with this profile
  source: string; // guide URL the numbers were transcribed from
}

export interface EnemyConfig {
  level: number;
  res: number;
} // res as fraction, 0.10 = 10%
export const DEFAULT_ENEMY: EnemyConfig = { level: 100, res: 0.1 };

export interface DamageContext {
  profile: DamageProfile;
  enemy: EnemyConfig;
  charLevel: number; // = OptimizeRequest.buildLevel
}
```

```ts
// src/damage/formula.ts — all pure, no imports beyond types
export function effectiveStat(
  base: StatVec,
  t: StatVec,
  stat: 'atk' | 'hp' | 'def',
): number;
export function evCritMult(t: StatVec): number; // 1 + clamp(cr,0,100)/100 * cd/100
export function defMult(charLevel: number, enemyLevel: number): number;
export function resMult(res: number): number; // three-piece piecewise
export function ampMult(reaction: Reaction, em: number): number; // 1 for non-amplifying
export function additiveBase(
  reaction: Reaction,
  em: number,
  charLevel: number,
): number; // 0 for non-additive
export function computeHitDamage(
  base: StatVec,
  t: StatVec,
  hit: DamageHit,
  dmg: DamageContext,
): number;
export function targetFunctionScore(
  base: StatVec,
  t: StatVec,
  dmg: DamageContext,
): number; // Σ weight × computeHitDamage
```

Semantics (formula source: `docs/research/2026-08-20-damage-calc-and-game-data.md` §A1 — implement verbatim):

- `effectiveStat`: `base[stat]` is the char+weapon base (from `ctx.base`); `t[stat] - base[stat]` is the flat bonus from artifacts. Result = `base*(1 + t[stat_pct]/100) + flat`. For `'em'` scaling use `t.em` directly (no pct split).
- `computeHitDamage` = `(multiplier/100 × effectiveStat + additiveBase(...)) × (1 + bonus%/100) × evCritMult × defMult × resMult × ampMult` where `bonus%` = `t.elemental_dmg` or `t.physical_dmg` per `hit.bonus`.
- `defMult = (cl+100) / ((cl+100) + (el+100))` (no shred/ignore knobs in v1 — YAGNI, note in ADR).
- `resMult`: `res<0 → 1−res/2`; `0≤res<0.75 → 1−res`; `res≥0.75 → 1/(4·res+1)`.
- `ampMult` for vaporize/melt = `k × (1 + 2.78·em/(1400+em))`, k = 2 or 1.5. Reaction DMG-bonus% from sets is NOT modelled in v1 (note in ADR).
- `additiveBase` for aggravate/spread = `k × levelMult(charLevel) × (1 + 5·em/(1200+em))`, k = 1.15 (aggravate) / 1.25 (spread). `levelMult` is a lookup table keyed by the 8 `BUILD_LEVELS` only — **transcribe the character-level reaction multiplier column from the KQM TCL table** (https://library.keqingmains.com/combat-mechanics/damage/damage-formula, "Level Multiplier"); checksum: level 90 = **1446.85**. Cite the URL in a comment.
- Transformative reactions are deliberately absent (don't scale with the build's crit — ADR-0016 records this).

- [ ] **Step 1: Write the failing tests** (hand-computed expectations — keep these exact numbers):

```ts
// src/damage/formula.test.ts
import { describe, it, expect } from 'vitest';
import {
  effectiveStat,
  evCritMult,
  defMult,
  resMult,
  ampMult,
  computeHitDamage,
} from './formula';
import { DEFAULT_ENEMY, type DamageContext, type DamageHit } from './types';

const base = { atk: 800 };
const t = {
  atk: 1111,
  atk_pct: 46.6,
  crit_rate: 50,
  crit_dmg: 100,
  elemental_dmg: 46.6,
};
const hit: DamageHit = {
  name: 'test',
  scaling: 'atk',
  multiplier: 200,
  bonus: 'elemental',
  reaction: 'none',
  weight: 1,
};
const dmg: DamageContext = {
  profile: { characterKey: 'x', hits: [hit], source: 'test' },
  enemy: DEFAULT_ENEMY,
  charLevel: 90,
};

describe('formula pieces', () => {
  it('effectiveStat splits base-scaled pct from flat', () => {
    // 800*1.466 + (1111-800) = 1172.8 + 311 = 1483.8
    expect(effectiveStat(base, t, 'atk')).toBeCloseTo(1483.8, 5);
  });
  it('EV crit clamps crit rate at 100', () => {
    expect(evCritMult({ crit_rate: 50, crit_dmg: 100 })).toBeCloseTo(1.5, 10);
    expect(evCritMult({ crit_rate: 120, crit_dmg: 100 })).toBeCloseTo(2.0, 10);
    expect(evCritMult({})).toBeCloseTo(1, 10);
  });
  it('def multiplier at 90 vs 100', () => {
    expect(defMult(90, 100)).toBeCloseTo(190 / 390, 10);
  });
  it('res multiplier piecewise', () => {
    expect(resMult(-0.2)).toBeCloseTo(1.1, 10);
    expect(resMult(0.1)).toBeCloseTo(0.9, 10);
    expect(resMult(0.8)).toBeCloseTo(1 / 4.2, 10);
  });
  it('amplifying vaporize 2x with 100 EM', () => {
    expect(ampMult('vaporize-2x', 100)).toBeCloseTo(
      2 * (1 + (2.78 * 100) / 1500),
      10,
    );
    expect(ampMult('none', 100)).toBe(1);
    expect(ampMult('aggravate', 100)).toBe(1); // additive, not amplifying
  });
});

describe('computeHitDamage end-to-end', () => {
  it('no-reaction ATK scaler', () => {
    // 2967.6 * 1.466 * 1.5 * (190/390) * 0.9 = 2861.29…
    expect(computeHitDamage(base, t, hit, dmg)).toBeCloseTo(2861.29, 1);
  });
  it('vaporize-2x multiplies the same hit by the amp factor', () => {
    const v = { ...hit, reaction: 'vaporize-2x' as const };
    const em100 = { ...t, em: 100 };
    const plain = computeHitDamage(base, em100, hit, dmg);
    expect(computeHitDamage(base, em100, v, dmg)).toBeCloseTo(
      plain * 2 * (1 + 278 / 1500),
      3,
    );
  });
  it('aggravate adds level-scaled base damage before multipliers', () => {
    const a = { ...hit, reaction: 'aggravate' as const };
    // additiveBase(aggravate, em 0, lv90) = 1.15 * 1446.85 = 1663.8775
    const expected =
      ((2967.6 + 1663.8775) / 2967.6) * computeHitDamage(base, t, hit, dmg);
    expect(computeHitDamage(base, t, a, dmg)).toBeCloseTo(expected, 1);
  });
  it('is monotone in every damage-relevant stat (bound admissibility)', () => {
    const keys = [
      'atk',
      'atk_pct',
      'crit_rate',
      'crit_dmg',
      'elemental_dmg',
      'em',
    ] as const;
    for (const k of keys) {
      const more = {
        ...t,
        em: 50,
        [k]: ((t as Record<string, number>)[k] ?? 50) + 10,
      };
      const v = { ...hit, reaction: 'vaporize-2x' as const };
      expect(computeHitDamage(base, more, v, dmg)).toBeGreaterThanOrEqual(
        computeHitDamage(base, { ...t, em: 50 }, v, dmg),
      );
    }
  });
});
```

- [ ] **Step 2:** Run: `npx vitest run src/damage` — FAIL (module not found).
- [ ] **Step 3:** Implement `types.ts` and `formula.ts` exactly per the semantics above (~80 lines total).
- [ ] **Step 4:** Run: `npx vitest run src/damage` — PASS.
- [ ] **Step 5:** Commit: `feat: KQM damage formula module (pure TS)`

### Task 1.2: `avg_damage` objective through score/context/types

**Files:**

- Modify: `src/game/types.ts` (Objective union, OptimizeContext, isObjective)
- Modify: `src/optimizer/score.ts` (new `evaluateObjective`)
- Modify: `src/optimizer/context.ts` (attach DamageContext)
- Modify: `src/optimizer/diagnostics.ts` (route through `evaluateObjective` — grep for `objectiveValue(` callers and switch every build-scoring call)
- Test: `src/optimizer/score.test.ts` (extend)

**Interfaces:**

- Produces: `type Objective = StatKey | 'crit_value' | 'avg_damage'`; `OptimizeContext.damage?: DamageContext`; `evaluateObjective(ctx: OptimizeContext, objective: Objective, t: StatVec): number` — **the single evaluator every scorer must call** (search, diagnostics, gap grading).
- Consumes: `targetFunctionScore` from Task 1.1.

- [ ] **Step 1: Failing test** (in `score.test.ts`):

```ts
it('evaluateObjective routes avg_damage through the target function', () => {
  const ctx: OptimizeContext = {
    base: { atk: 800 },
    setBonuses: {},
    damage: {
      profile: {
        characterKey: 'x',
        source: 't',
        hits: [
          {
            name: 'h',
            scaling: 'atk',
            multiplier: 100,
            bonus: 'elemental',
            reaction: 'none',
            weight: 1,
          },
        ],
      },
      enemy: { level: 100, res: 0.1 },
      charLevel: 90,
    },
  };
  const t = { atk: 800, crit_rate: 0, crit_dmg: 0 };
  // 800 * 1 * 1 * (190/390) * 0.9
  expect(evaluateObjective(ctx, 'avg_damage', t)).toBeCloseTo(
    800 * (190 / 390) * 0.9,
    3,
  );
  expect(() =>
    evaluateObjective({ base: {}, setBonuses: {} }, 'avg_damage', t),
  ).toThrow();
  expect(
    evaluateObjective(ctx, 'crit_value', { crit_rate: 10, crit_dmg: 20 }),
  ).toBe(40);
});
```

- [ ] **Step 2:** Run: `npx vitest run src/optimizer/score.test.ts` — FAIL.
- [ ] **Step 3:** Implement: extend the `Objective` type + `isObjective`; add optional `damage?: DamageContext` to `OptimizeContext` (`src/game/types.ts:101` — plain data, stays structured-clone-safe so `src/workers/protocol.ts` needs no change); in `score.ts`:

```ts
export function evaluateObjective(
  ctx: OptimizeContext,
  objective: Objective,
  t: StatVec,
): number {
  if (objective === 'avg_damage') {
    if (!ctx.damage)
      throw new Error('avg_damage objective requires ctx.damage');
    return targetFunctionScore(ctx.base, t, ctx.damage);
  }
  return objectiveValue(t, objective);
}
```

In `context.ts`, `buildContext(req)` gains: when `req.objective === 'avg_damage'`, look up the profile (Task 1.4 registry) and set `ctx.damage = { profile, enemy: DEFAULT_ENEMY, charLevel: req.buildLevel }`; throw `Unknown damage profile: <key>` if absent (fail-loud, matching `adapter.baseStats`). Switch `diagnostics.ts` scoring calls to `evaluateObjective`.

- [ ] **Step 4:** `npx vitest run src/optimizer` — PASS (existing tests confirm no regression).
- [ ] **Step 5:** Commit: `feat: avg_damage objective + single evaluateObjective seam`

### Task 1.3: Exact search support (vector-mode admissible bound)

**Files:**

- Modify: `src/optimizer/search.ts`
- Test: `src/optimizer/search.test.ts` (extend the oracle)

**Interfaces:** none new — `searchBuilds`/`bruteForce` signatures unchanged.

Design (the heart of the phase): the current bound is scalar-additive (`runningObjective + suffixMax + setBonusCeilingAt`, `search.ts:255-259`), which is wrong for the multiplicative damage function. For `avg_damage` run the same recursion in **vector mode**:

1. Precompute per-slot statwise-max contribution vectors and their suffix sums: `suffixMaxVec[i][k] = Σ_{j≥i} max_{a∈pool[j]} contribution(a)[k]`.
2. Precompute once at the root a statwise set-bonus ceiling `setCeilVec[k] = max(bestSingle.two[k]+bestSingle.four[k], top1.two[k]+top2.two[k])` over all sets (same shape as `setBonusCeilingAt` but per stat key and computed once). `// ponytail: root-constant set ceiling — per-node reachability tightening like the scalar path if damage searches prove slow`.
3. Maintain `runningVec: StatVec` incrementally on push/pop (reuse `addInto`; write a `subFrom` twin).
4. Node bound: `upper = evaluateObjective(ctx, 'avg_damage', vecSum(ctx.base, runningVec, suffixMaxVec[slotIndex], setCeilVec))`. Admissible because Task 1.1's monotonicity test holds per stat and every real completion's totals are ≤ the optimistic vector statwise.
5. `makeBuildResult` switches `objectiveValue(t, req.objective)` → `evaluateObjective(ctx, req.objective, t)` (`search.ts:145`) — this alone makes `bruteForce` damage-correct.
6. Pool-ordering heuristic for damage: sort each pool by `evaluateObjective(ctx,'avg_damage', vecSum(ctx.base, contribution(a))) − evaluateObjective(ctx,'avg_damage', ctx.base)` (once per artifact; ordering affects speed only — the oracle proves the optimum is unchanged).
7. The scalar path stays byte-for-byte identical for all existing objectives.

- [ ] **Step 1: Failing oracle test** (extend the existing randomized-oracle pattern in `search.test.ts` — reuse its inventory generator):

```ts
it('avg_damage: branch-and-bound matches brute force on randomized inventories', () => {
  const profile: DamageProfile = {
    characterKey: 'test',
    source: 't',
    hits: [
      {
        name: 'skill',
        scaling: 'atk',
        multiplier: 250,
        bonus: 'elemental',
        reaction: 'vaporize-2x',
        weight: 1,
      },
      {
        name: 'burst',
        scaling: 'atk',
        multiplier: 400,
        bonus: 'elemental',
        reaction: 'none',
        weight: 0.5,
      },
    ],
  };
  for (let seed = 0; seed < 20; seed++) {
    const inventory = randomInventory(seed, 8); // existing helper, 8 artifacts/slot
    const ctx: OptimizeContext = {
      base: { atk: 900, crit_rate: 5, crit_dmg: 50, er_pct: 100 },
      setBonuses: {
        SetA: { two: { atk_pct: 18 } },
        SetB: { two: { elemental_dmg: 15 } },
      },
      damage: { profile, enemy: { level: 100, res: 0.1 }, charLevel: 90 },
    };
    const req: OptimizeRequest = {
      characterKey: 'x',
      weaponKey: 'w',
      buildLevel: 90,
      constraints: {},
      objective: 'avg_damage',
      topK: 1,
    };
    const fast = searchBuilds(req, inventory, ctx);
    const slow = bruteForce(req, inventory, ctx);
    expect(fast.status).toBe('ok');
    if (fast.status === 'ok' && slow.status === 'ok') {
      expect(fast.builds[0].score).toBeCloseTo(slow.builds[0].score, 6);
    }
  }
});
it('avg_damage honours constraints (ER floor + 4pc) exactly', () => {
  // same pattern with constraints: { minStats: { er_pct: 160 }, setRequirement: { kind: '4pc', setKey: 'SetA' } }
  // assert fast === slow, and that every returned build satisfies the constraint.
});
```

- [ ] **Step 2:** Run: `npx vitest run src/optimizer/search.test.ts` — FAIL (searchBuilds prunes wrongly or throws).
- [ ] **Step 3:** Implement vector mode per the design above (branch on `req.objective === 'avg_damage'` for bound/ordering; keep one recursion function).
- [ ] **Step 4:** `npx vitest run src/optimizer` — ALL PASS, including the pre-existing scalar oracle (proves no regression).
- [ ] **Step 5:** `npm run bench` — confirm the committed speed report is unchanged (scalar path untouched); do NOT commit a changed report unless numbers actually moved.
- [ ] **Step 6:** Commit: `feat: exact avg_damage search via monotone vector bound + oracle proof`

### Task 1.4: Damage profile registry (curated content)

**Files:**

- Create: `src/damage/profiles.ts`
- Test: `src/damage/profiles.test.ts`

**Interfaces:**

- Produces: `DAMAGE_PROFILES: Record<string, DamageProfile>` and `getDamageProfile(characterKey: string): DamageProfile | undefined` (consumed by `buildContext` in Task 1.2 and the UI in Task 1.5).

- [ ] **Step 1: Failing test:**

```ts
import { DAMAGE_PROFILES } from './profiles';
import { genshinAdapter } from '../game/genshin/adapter';

it('every profile references a real character and has sane hits', () => {
  const keys = new Set(genshinAdapter.characters().map((c) => c.key));
  for (const [key, p] of Object.entries(DAMAGE_PROFILES)) {
    expect(keys.has(key), `unknown character: ${key}`).toBe(true);
    expect(p.characterKey).toBe(key);
    expect(p.hits.length).toBeGreaterThan(0);
    expect(p.source).toMatch(/^https:\/\//);
    for (const h of p.hits) {
      expect(h.multiplier).toBeGreaterThan(0);
      expect(h.weight).toBeGreaterThan(0);
    }
  }
  expect(Object.keys(DAMAGE_PROFILES).length).toBeGreaterThanOrEqual(15);
});
```

- [ ] **Step 2:** Run — FAIL.
- [ ] **Step 3:** Curate profiles for at least these dataset keys (all owned by the fixture account and covered by `META_TARGETS`/Phase-3 comps): `neuvillette`, `alhaitham`, `nahida`, `furina`, `raiden_shogun`, `yelan`, `xingqiu`, `xiangling`, `navia`, `xiao`, `wanderer`, `clorinde`, `hu_tao`, `keqing`, `ganyu`, `tartaglia`, `wriothesley`, `kamisato_ayaka`. Multipliers: talent lv9 values transcribed from each character's KQM guide (the `source` URL) or the genshin-db talent tables; 2–4 weighted hits approximating the character's damage pattern (e.g. Neuvillette ≈ charged-attack ticks weighted heavily + burst; Raiden ≈ burst initial + burst stance hits; Xingqiu/Yelan ≈ burst waves with `vaporize` on none — they're the trigger, keep `none` and let the on-fielder carry the reaction). Header comment: `// ponytail: hand-transcribed at talent lv9 — constant scale factor per character, fine for ranking that character's own artifacts; revisit for cross-character comparisons.` Example entry shape:

```ts
neuvillette: {
  characterKey: 'neuvillette',
  source: 'https://keqingmains.com/neuvillette/',
  erRequirement: 110,
  hits: [
    { name: 'Charged Attack tick', scaling: 'hp', multiplier: /* lv9, from source */, bonus: 'elemental', reaction: 'none', weight: 3 },
    { name: 'Burst', scaling: 'hp', multiplier: /* lv9, from source */, bonus: 'elemental', reaction: 'none', weight: 0.5 },
  ],
},
```

(The literal multiplier numbers are content, transcribed at implementation time from the cited source — the same discipline as `META_TARGETS`. The test above enforces shape; the **owner reviews values in the PR**.)

- [ ] **Step 4:** Run — PASS.
- [ ] **Step 5:** Commit: `feat: curated damage profiles (talent lv9, KQM-sourced)` — **flag this commit for owner content review in the PR description.**

### Task 1.5: UI wiring + ADR + glossary

**Files:**

- Modify: the objective picker component (find it: `grep -r "crit_value" src/components src/state` — it's driven by `src/state/optimizeRequest.ts`) and the results display in `src/components/`
- Create: `docs/adr/0016-damage-engine-objective.md`
- Modify: `docs/adr/0003-stat-only-model-no-damage-engine.md` (status banner), `CONTEXT.md` (already has terms from 0.3 — verify)
- Test: extend the picker component's existing test file

- [ ] **Step 1: Failing test:** objective picker offers "Average damage" **only** for characters with a profile; selecting it shows the caveat string.

```ts
it('offers avg_damage only when a profile exists and shows the estimate caveat', () => {
  // render picker with character 'neuvillette' -> option present
  // render with a profileless character -> option absent
  // with avg_damage selected, results panel contains:
  //   'estimated — for comparing builds, not matching in-game numbers'
});
```

(Adapt to the component's existing test idioms — read its current test file first.)

- [ ] **Step 2:** Run — FAIL. **Step 3:** Implement: option gated on `getDamageProfile(characterKey)`; label `Average damage (est.)`; caveat rendered wherever `objectiveValue` is displayed for `avg_damage`; when selected, pre-fill `minStats.er_pct` from `profile.erRequirement` if the user hasn't set one. **Step 4:** Run — PASS.
- [ ] **Step 5:** Write ADR-0016 (decision: damage engine as objective; stat-only remains fallback; transformative reactions + DEF-shred knobs + reaction-bonus% excluded and why; supersedes ADR-0003). Add banner to ADR-0003: `- Status: Superseded by [0016](0016-damage-engine-objective.md) (stat-only model remains the fallback objective)`. Update `knowledge/index.md` ADR list.
- [ ] **Step 6:** Full gate: `npm run typecheck && npm run lint && npm test && npm run build`. Commit: `feat: avg_damage objective UI + ADR-0016`. Open PR 2.

---

## Phase 2 — Roster assessment (PR 3)

### Task 2.1: Richer roster + artifact location import

**Files:**

- Modify: `src/import/good.ts` (RosterEntry fields; parseGOOD captures `location`), `src/game/types.ts` (Artifact.location)
- Test: `src/import/good.test.ts` (extend)

**Interfaces:**

- Produces:

```ts
export interface RosterEntry {
  buildLevel?: BuildLevel;
  level?: number; // current character level from GOOD
  constellation?: number;
  talents?: { auto: number; skill: number; burst: number };
  weaponKey?: string;
  weaponLevel?: number;
  weaponRefinement?: number;
}
// Artifact gains: location?: string  // dataset character key currently wearing it
```

- [ ] **Step 1: Failing tests:** (a) a GOOD character `{ key: 'Neuvillette', level: 90, constellation: 0, ascension: 6, talent: { auto: 9, skill: 9, burst: 9 } }` parses to the full entry; (b) a GOOD weapon `{ key: 'SplendorOfTranquilWaters', level: 90, refinement: 1, location: 'Neuvillette' }` fills `weaponLevel`/`weaponRefinement`; (c) a GOOD artifact with `location: 'Neuvillette'` yields `artifact.location === 'neuvillette'`; empty location → `undefined`; (d) malformed values (string level, talent 99) are dropped field-wise, entry still created — extend the existing malformed-input cases.
- [ ] **Step 2:** Run `npx vitest run src/import` — FAIL.
- [ ] **Step 3:** Implement: same skip-don't-throw + range-guard style as the surrounding code (`level` 1–90 int, `constellation` 0–6, `talent` fields 1–15); resolve artifact/weapon `location` through the existing `charByNorm` map (hoist it so `parseGOOD` can use it too).
- [ ] **Step 4:** Run — PASS, including the Task 0.2 fixture test (roster entries now carry talents from Inventory Kamera's export).
- [ ] **Step 5:** Commit: `feat: import talents, levels, refinement, and artifact locations from GOOD`

### Task 2.2: Build score

**Files:**

- Create: `src/roster/buildScore.ts`
- Test: `src/roster/buildScore.test.ts`

**Interfaces:**

- Produces (consumed by Phase 3 matching and RosterView):

```ts
export interface BuildScoreComponent {
  label: string;
  points: number;
  max: number;
}
export interface BuildScore {
  total: number;
  components: BuildScoreComponent[];
} // total 0–100
export function computeBuildScore(
  entry: RosterEntry,
  equipped: Artifact[],
): BuildScore;
export type Band = 'built' | 'partial' | 'unbuilt';
export function band(total: number): Band; // >=70 built, >=40 partial, else unbuilt
```

Exact composite (monotone; missing field ⇒ 0 points for that component):

- Character level: `(buildLevel ?? 0)/90 × 25`
- Talents: `min(1, (auto+skill+burst)/27) × 20` (9/9/9 = full marks)
- Weapon: `(weaponLevel ?? 0)/90 × 15`
- Artifact count: `equipped.length/5 × 10`
- Artifact quality: `min(1, equippedCV/180) × 30` where `equippedCV = Σ critValue(piece crit_rate contribution, piece crit_dmg contribution)` over equipped pieces (reuse `critValue` from `src/optimizer/score.ts`)

- [ ] **Step 1: Failing tests:** (a) fully built L90/9-9-9/W90/5-piece-180CV → 100; (b) empty entry, no artifacts → 0; (c) each component's points match the formula on a mid case (L80, talents 8/8/8, W90, 4 pieces, 120 CV → 22.22 + 17.78 + 15 + 8 + 20 = 83.0 total, `band` = 'built'); (d) monotonicity spot-check: raising any single input never lowers `total`.
- [ ] **Step 2:** FAIL. **Step 3:** Implement (~40 lines). **Step 4:** PASS.
- [ ] **Step 5:** Commit: `feat: roster build score (0-100, explainable components)`

### Task 2.3: Roster view

**Files:**

- Create: `src/roster/RosterView.tsx`
- Test: `src/roster/RosterView.test.tsx`
- Modify: `src/components/App.tsx` (add a "Roster" nav destination alongside the existing panels — match the app's existing navigation pattern; read App.tsx first)

- [ ] **Step 1: Failing test** (Testing Library, existing idioms):

```ts
it('renders every roster entry with name, band, and score breakdown on expand', () => {
  // seed useRoster + useInventory stores with 2 entries (one built L90, one bare),
  // render <RosterView/>, assert both names, 'built' and 'unbuilt' badges,
  // click the built row -> component labels ('Talents', 'Artifact quality') visible.
});
```

- [ ] **Step 2:** FAIL. **Step 3:** Implement: read `useRoster.entries` + `useInventory.artifacts` (group by `location`), compute scores, sort descending, render rows with element, weapon name (via `genshinAdapter`), score, band badge (Tailwind, follow existing component styling), expandable breakdown. Empty state: "Import a GOOD file to see your roster."
- [ ] **Step 4:** PASS. **Step 5:** Full gate; commit `feat: roster assessment view`; PR 3. Include a screenshot in the PR (run `npm run dev`, import the fixture).

---

## Phase 3 — Comp database + Abyss recommender (PR 4)

### Task 3.1: Comp archetype schema + curated database

**Files:**

- Create: `src/teams/types.ts`, `src/teams/comps.ts`
- Test: `src/teams/comps.test.ts`

**Interfaces:**

```ts
// src/teams/types.ts
export type EndgameMode = 'abyss' | 'theater' | 'stygian';
export type Role =
  | 'on-field-dps'
  | 'off-field-dps'
  | 'buffer'
  | 'sustain'
  | 'battery'
  | 'applicator';
export interface CompSlot {
  role: Role;
  options: Array<{ characterKey: string; weight: number }>; // ranked, weight ∈ (0,1], first = ideal
}
export interface CompArchetype {
  id: string; // 'neuvillette-hypercarry'
  name: string; // 'Neuvillette Hypercarry'
  modes: EndgameMode[];
  tier: 1 | 2 | 3;
  slots: [CompSlot, CompSlot, CompSlot, CompSlot];
  source: string;
  notes: string; // one line: why/when this comp
}
// src/teams/comps.ts
export const COMP_ARCHETYPES: CompArchetype[];
```

- [ ] **Step 1: Failing test:** every archetype: unique `id`; every `characterKey` across all options exists in `genshinAdapter.characters()`; slot options non-empty, weights in (0,1], strictly non-increasing; `source` is https; at least **25** archetypes; no archetype lists the same character in two slots' option lists at weight 1 (an ideal lineup must be 4 distinct characters).
- [ ] **Step 2:** FAIL.
- [ ] **Step 3:** Curate 25–40 Abyss-tagged archetypes. Seeds: expand every `TEAMMATES` entry in `src/meta/teammates.ts` (each is already an ideal-lineup + roles skeleton with a KQM source) into an archetype with 2–4 ranked substitutes per slot; add current 7.0 meta comps from spiralabyss.org floor-12 usage (see research report §2) — Neuvillette hypercarry, Nahida quickbloom/hyperbloom, Raiden national, Furina teams, Mualani vape, Kinich burn, Xiao Xiaorina, Arlecchino vape, Navia geo, freeze Ayaka, etc. House-content style header comment (ponytail + freshness caveat). Substitution weights: 1.0 ideal, 0.85 strong sub, 0.7 workable, 0.5 stopgap.
- [ ] **Step 4:** PASS.
- [ ] **Step 5:** Commit: `feat: curated Abyss comp archetypes` — **flag for owner content review.**

### Task 3.2: Matching + disjoint-pair recommendation

**Files:**

- Create: `src/teams/recommend.ts`
- Test: `src/teams/recommend.test.ts`

**Interfaces:**

- Produces (consumed by TeamsView and Phase 4):

```ts
export interface TeamInstance {
  archetypeId: string;
  members: {
    characterKey: string;
    role: Role;
    optionWeight: number;
    buildScore: number;
  }[]; // length 4, distinct
  score: number;
}
export interface ArchetypeGap {
  archetypeId: string;
  missingRole: Role;
  candidates: string[]; // the slot's option keys the roster lacks
  bestPossibleScore: number; // score if the gap were filled at weight×100
}
export function instantiate(
  arch: CompArchetype,
  scores: Record<string, number>, // characterKey -> buildScore total (owned = present)
  exclude: ReadonlySet<string>,
): TeamInstance | { missing: ArchetypeGap } | null; // null = >1 slot unfillable
export function recommendAbyss(scores: Record<string, number>): {
  teams: [TeamInstance, TeamInstance] | null;
  singles: TeamInstance[];
  gaps: ArchetypeGap[];
};
```

Semantics: `instantiate` fills each slot with the owned, non-excluded option maximizing `optionWeight × buildScore`, never reusing a character across slots (process slots in listed order; `// ponytail: greedy slot fill, exact 4-slot assignment if curation ever makes greedy visibly wrong`). `score = TIER_WEIGHT[tier] × mean(optionWeight × buildScore)` with `TIER_WEIGHT = {1: 1.0, 2: 0.85, 3: 0.7}`. `recommendAbyss`: instantiate all archetypes (`singles`, sorted); for the pair, try every ordered archetype pair (a,b) — instantiate a with `exclude=∅`, then b with `exclude=a.members`; keep the pair maximizing `min(scoreA, scoreB)`; collect one-slot-short results into `gaps`.

- [ ] **Step 1: Failing tests:** (a) instantiate picks the higher `weight×score` sub when the ideal is missing; (b) no character reuse within a team; (c) exclusion works across the pair — construct a 5-character roster where the naive best archetype twice would need overlap, assert the pair is disjoint; (d) one-missing-slot archetype lands in `gaps` with the right role and candidates; (e) empty roster → `teams: null`, empty singles; (f) integration: fixture roster (Task 0.2 + real build scores) → `teams` non-null, both scores > 0, 8 distinct members — snapshot the two archetype ids so meta drift is a visible diff.
- [ ] **Step 2:** FAIL. **Step 3:** Implement (~120 lines, pure). **Step 4:** PASS.
- [ ] **Step 5:** Commit: `feat: roster→archetype matching + exact disjoint Abyss pair`

### Task 3.3: Teams view + ADRs

**Files:**

- Create: `src/teams/TeamsView.tsx`; Test: `src/teams/TeamsView.test.tsx`
- Modify: `src/components/App.tsx` (nav)
- Create: `docs/adr/0017-curated-comp-database.md`, `docs/adr/0018-mode-aware-team-recommendation.md`
- Modify: `CONTEXT.md` (verify terms), `knowledge/index.md`

- [ ] **Step 1: Failing test:** renders "First half" / "Second half" cards with 4 members each (name, role, band badge); mode selector shows Abyss active, Theater/Stygian disabled with "coming soon"; a gaps section lists near-miss archetypes ("one character short: …").
- [ ] **Step 2:** FAIL. **Step 3:** Implement on top of `recommendAbyss`. **Step 4:** PASS.
- [ ] **Step 5:** ADR-0017 (curated DB over rules/simulation; curation workflow: agent-drafts from cited sources → owner review → refresh per patch alongside `META_TARGETS`; supersedes the informal `teammates.ts` — note that `TEAMMATES` stays for the existing per-character panel until Phase 4 absorbs it). ADR-0018 (mode-aware recommendation; Abyss = max-min disjoint pair; Theater/Stygian additive later).
- [ ] **Step 6:** Full gate; commit `feat: Abyss team recommendations view + ADR-0017/0018`; PR 4.

---

## Phase 4 — The Plan page (PR 5)

### Task 4.1: composePlan orchestration

**Files:**

- Create: `src/plan/composePlan.ts`
- Test: `src/plan/composePlan.test.ts`

**Interfaces:**

```ts
export interface PlanMemberBuild {
  characterKey: string;
  objective: Objective; // 'avg_damage' when profiled, else meta objective / 'crit_value'
  result: OptimizeResult;
  gap: GapReport | null; // null when no META_TARGETS entry
  conflicts: string[]; // artifact ids this member wanted but a higher-priority member took
}
export interface Plan {
  teams: [TeamInstance, TeamInstance];
  builds: PlanMemberBuild[]; // 8 entries, team order then slot order
  farming: string[]; // deduped, ordered feasibility+shortfall lines
}
export type RunOptimize = (
  req: OptimizeRequest,
  inventory: Artifact[],
  ctx: OptimizeContext,
) => Promise<OptimizeResult>;
export async function composePlan(
  teams: [TeamInstance, TeamInstance],
  roster: Record<string, RosterEntry>,
  inventory: Artifact[],
  runOptimize: RunOptimize, // injected: worker client in the app, direct searchBuilds in tests
  onProgress?: (done: number, total: number) => void,
): Promise<Plan>;
```

Semantics: process members in team order (higher-scoring team first), within a team `on-field-dps` first, then `off-field-dps`, then the rest in slot order. Per member: constraints from `metaToConstraints(META_TARGETS[key])` when present (else `{}`); objective `avg_damage` when `getDamageProfile(key)` exists (ER floor from the profile merged into `minStats` if the meta didn't set one), else the meta objective, else `crit_value`; `weaponKey` from roster (skip the member with an explanatory `conflicts`-style note if the roster has no weapon — record as `result: { status: 'infeasible', … }` plus a farming line); `buildLevel` from roster (default 90). After each member's result, remove the winning build's 5 artifact ids from the working inventory (greedy allocation, `// ponytail:` comment). Record removed-but-wanted ids for later members as `conflicts` by re-checking whether the taken ids appear in the later member's meta set requirement pool. Farming list = ordered dedupe of every member's `gap.feasibility + gap.shortfalls` (prefix each with the character's display name).

- [ ] **Step 1: Failing tests** (inject `runOptimize = async (req, inv, ctx) => searchBuilds(req, inv, ctx)` — no worker in tests): (a) 8 results in the specified order, progress called (1..8, 8); (b) greedy exclusivity: two members whose best pieces overlap — the second's build shares **no** artifact id with the first's; (c) a member without a damage profile falls back to the meta objective; (d) farming lines deduped and name-prefixed; (e) weaponless member → infeasible entry + farming line, no throw.
- [ ] **Step 2:** FAIL. **Step 3:** Implement (~150 lines; reuse `buildContext` — note it reads the adapter, so `composePlan` builds ctx itself per member and passes it through `runOptimize`). **Step 4:** PASS.
- [ ] **Step 5:** Commit: `feat: composePlan — 8 sequential exact optimizations with greedy allocation`

### Task 4.2: Plan view + landing flow + ADR

**Files:**

- Create: `src/plan/PlanView.tsx`; Test: `src/plan/PlanView.test.tsx`
- Modify: `src/components/App.tsx` (Plan becomes the primary nav destination when a roster exists)
- Create: `docs/adr/0019-plan-output.md`

- [ ] **Step 1: Failing test:** with stores seeded (roster + inventory) and a stubbed `RunOptimize`, clicking "Build my Abyss plan" shows a progress indicator, then: two team cards; per member a build card reusing the existing `BuildCard` component (grep `src/components/` for it) with the estimate caveat on damage objectives; a single "What to farm" list; conflict notes rendered when present.
- [ ] **Step 2:** FAIL. **Step 3:** Implement: wire `recommendAbyss` → `composePlan` with the real worker client (`src/workers/optimizeClient.ts`) as `RunOptimize`; run on explicit button press (8 worker runs are not free — never auto-run on mount); persist nothing new (plan derives from stores). **Step 4:** PASS.
- [ ] **Step 3b (perf check, manual):** `npm run dev`, import the fixture, build the plan; total wall time must be ≤ ~30 s. If not, note the slowest member and file it in the PR — do not optimize speculatively.
- [ ] **Step 5:** ADR-0019 (Plan page composition; greedy allocation with named upgrade path; absorbs ADR-0007's gap analysis as a per-member component; extends, does not replace, the single-character flow). Full gate; commit `feat: the Plan page`; PR 5.

---

## Phase 5 — Investment advisor (PR 6)

### Task 5.1: Obtainability dataset + advice engine

**Files:**

- Create: `src/invest/obtainability.ts`, `src/invest/advise.ts`
- Test: `src/invest/advise.test.ts`

**Interfaces:**

```ts
// obtainability.ts
export type Obtainability =
  'craftable' | 'battle-pass' | 'standard-banner' | 'limited-banner' | 'event';
export const WEAPON_OBTAINABILITY: Record<
  string,
  { tier: Obtainability; source: string }
>;
// advise.ts
export interface Advice {
  kind: 'character' | 'weapon';
  subjectKey: string;
  headline: string; // "Owning Fischl unlocks Nahida Quickbloom (+12 team score)"
  detail: string;
  provenance: string; // archetypeId or characterKey the gap came from
}
export function adviseInvestments(
  gaps: ArchetypeGap[],
  roster: Record<string, RosterEntry>,
  scores: Record<string, number>,
): Advice[]; // ranked by bestPossibleScore delta, max 10
```

- [ ] **Step 1: Failing tests:** (a) a gap whose candidates include an unowned character yields character advice with the score delta in the headline; (b) a roster member wearing a weapon two+ tiers below any `WEAPON_OBTAINABILITY` craftable listed for their archetype role yields weapon advice mentioning "craftable"; (c) owned candidates are never advised; (d) output capped at 10, sorted by delta; (e) obtainability test mirroring Task 3.1: every weapon key exists in `genshinAdapter.weapons()`, every entry has an https source.
- [ ] **Step 2:** FAIL. **Step 3:** Curate `WEAPON_OBTAINABILITY` for exactly the weapons appearing in `META_TARGETS`-adjacent guides + comp archetype signature weapons (~60 entries; sources: the weapon's wiki page). Implement `adviseInvestments` (~80 lines). No banner-schedule data — the `detail` for limited-banner items ends with the fixed copy: `Availability rotates — check a banner tracker before pulling.` **Step 4:** PASS.
- [ ] **Step 5:** Commit: `feat: investment advice from roster gaps` — **flag obtainability data for owner review.**

### Task 5.2: Plan page section + wrap-up

**Files:**

- Modify: `src/plan/PlanView.tsx` (+ its test), `README.md` (feature list), `CONTEXT.md` (verify glossary complete)

- [ ] **Step 1: Failing test:** plan render includes a "Worth investing in" section listing advice headlines with provenance; empty-advice state renders nothing (no empty header).
- [ ] **Step 2:** FAIL. **Step 3:** Implement (advice computed from `recommendAbyss().gaps`). **Step 4:** PASS.
- [ ] **Step 5:** README: update Features with the planner flow; verify all v2 glossary terms exist in CONTEXT.md; `npm run docs:check`. Full gate; commit `feat: investment advice on the Plan page`; PR 6.

---

## Self-review notes (already applied)

- Type names verified against the codebase: `StatVec`, `Objective`, `OptimizeContext`, `OptimizeResult`, `BuildResult`, `RosterEntry`, `critValue`, `metaToConstraints`, `useRoster`, `useInventory`, `buildContext`, `searchBuilds`, `bruteForce` all exist as referenced.
- The worker protocol (`src/workers/protocol.ts`) already ships `ctx` whole — adding `ctx.damage` (plain data) needs no protocol change.
- Curated-content tasks (1.4, 3.1, 5.1) deliberately ship transcription _procedure + shape tests + owner review_, not literal game numbers — inventing multipliers in this plan would bake in wrong constants. Everything else contains its actual code/values.
- Spec coverage: spec Phases 0–5 all map to tasks above; spec Phase 6+ is backlog by design. The spec's "damage bound" note is realized as Task 1.3's vector mode; the spec's `avg_damage` naming is consistent throughout.
