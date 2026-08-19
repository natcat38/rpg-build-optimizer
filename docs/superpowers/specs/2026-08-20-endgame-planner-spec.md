# Endgame Planner — Master Spec & Execution Roadmap

> **For the orchestrating agent (Opus):** This is the MASTER SPEC (the why/what). The task-level implementation plan already exists: **`docs/superpowers/plans/2026-08-20-endgame-planner-plan.md`** — execute it with `superpowers:subagent-driven-development` using Sonnet subagents, one PR per phase. Do not start a phase until the previous phase's PR is merged and CI is green. Return here only when a plan task needs the rationale behind a decision.

**Goal:** Evolve rpg-build-optimizer from a single-character artifact optimizer into a one-stop Genshin Impact **endgame planner**: import your account → get recommended teams for endgame content (Spiral Abyss first) with per-member optimized builds from what you own → get a farming/pull shopping list for what you're missing.

**Architecture:** Keep the existing client-side core (ADR-0001) and exact branch-and-bound optimizer (ADR-0004). Add three new layers on top: (1) a pure-TS damage engine (KQM formula) that becomes an alternative optimizer objective, (2) a curated team-comp database with role-based substitution matched against the user's roster, (3) a "plan" output page that composes teams → per-member builds → investment gaps. The stat-only model (ADR-0003) is superseded, not deleted — it remains the fallback objective for characters without a damage profile.

**Tech Stack:** Existing stack unchanged — Vite, React 19, TypeScript strict, Tailwind, Zustand, Web Workers, Vitest, genshin-db (frozen snapshot), Vercel static + serverless `api/`.

## Global Constraints

- 100% client-side for all optimization/recommendation logic (ADR-0001 stands). Serverless functions only for the existing AI-explain proxy and (later, opt-in) HoYoLAB import.
- Reference data stays a frozen, bundled `genshin-db` snapshot regenerated via `npm run build:data` (ADR-0002 stands). Never fetch game data at runtime. Never vendor raw Dimbreath/AnimeGameData dumps into this repo (DMCA history — see `docs/research/2026-08-20-damage-calc-and-game-data.md` §B2).
- The optimizer stays **exact** (branch-and-bound with admissible bounds, ADR-0004). Any new objective must supply a valid upper-bound function or the search degrades to brute force — never to a heuristic.
- Damage numbers are **estimates for ranking**, never claimed as in-game-exact. Every damage figure in the UI carries the caveat label "estimate" (exact copy: `estimated — for comparing builds, not matching in-game numbers`).
- No new runtime dependencies without an ADR. The damage engine is hand-rolled pure TS (research verdict: no reusable npm calc engine exists).
- All new domain terms go into `CONTEXT.md`; all architecture decisions get an ADR in `docs/adr/` (next free number: 0016).
- Existing test discipline holds: optimizer changes keep the brute-force oracle tests passing; new pure logic gets unit tests; `npm run typecheck && npm run lint && npm test && npm run build` green before every PR.
- Windows dev machine: `format:check` may fail on CRLF locally while CI is green — check only changed files (known gotcha).
- Test fixture: `genshinData_GOOD_2026_07_15_02_29.json` at the repo root is the owner's real account (549 artifacts, 150 weapons, 109 characters). Use it (or a committed subset under `src/**/fixtures/`) as the integration fixture for roster/team features. Do not delete it.

---

## Research inputs (read these first)

All four reports live in `docs/research/`:

1. `2026-08-20-account-data-ingestion.md` — Enka vs HoYoLAB vs GOOD/scanners; recommendation: GOOD primary, Enka fast path, HoYoLAB cookie import deferred/opt-in.
2. `2026-08-20-prior-art-and-gap-analysis.md` — genshin-optimizer, gcsim, Akasha, Seelie, WuWa guide model; the confirmed gap: nobody does inventory → recommended teams → per-member builds → shopping list.
3. `2026-08-20-damage-calc-and-game-data.md` — full KQM damage formula (implement verbatim), target-function ranking, genshin-db as data source.
4. `2026-08-20-endgame-meta-and-team-recs.md` — Abyss/Theater/Stygian requirements, KQM role taxonomy, curated-comps architecture, comp-database maintenance is the real cost.

Key facts the plan is built on:

- **The gap is real**: genshin-optimizer optimizes builds for a team YOU pick; gcsim simulates a team YOU specify; no tool recommends teams from a roster. That end-to-end pipeline is this product.
- **Damage ranking needs only single-hit / weighted-multi-hit "target functions"** (what genshin-optimizer ships), not rotation simulation. The KQM formula is ~40 lines of closed-form math, stable for years.
- **No machine-readable team-comp dataset exists anywhere.** The comp database must be curated (agent-drafted from KQM/usage-stat sources, human-reviewed) and refreshed ~per patch. This is the product's ongoing content cost — budget for it.
- **Endgame modes stress different axes**: Abyss = 2 disjoint teams of 4; Imaginarium Theater = element-locked roster depth (8–28 built characters by difficulty); Stygian Onslaught = 3 disjoint boss-counter teams. MVP targets Abyss; the comp schema carries mode tags from day one so Theater/Stygian are additive.
- **"Miliastra Wonderland" is NOT a build tester** — it's the 7.0 UGC minigame sandbox. Do not reference it as a validation path.

## What exists today (reuse, don't rebuild)

- `src/import/` — GOOD-file parser incl. roster (characters/weapons, ADR-0015), Enka UID import, dedupe.
- `src/optimizer/` — exact branch-and-bound top-K search with constraints, diagnostics, brute-force oracle tests.
- `src/game/` — frozen genshin-db snapshot + `genshinAdapter` (base stats, weapons, sets, curves).
- `src/meta/` — KQM-sourced meta build recipes + gap analysis (ADR-0007).
- `src/workers/` — optimizer Web Worker + client.
- `api/explain.ts` — Claude proxy with rate limiting (ADRs 0010/0013).
- `src/share/` — self-contained build share links.

## New domain model (add to CONTEXT.md in Phase 0)

```ts
// src/damage/types.ts
type Reaction =
  | 'none'
  | 'vaporize-2x'
  | 'vaporize-1.5x'
  | 'melt-2x'
  | 'melt-1.5x'
  | 'aggravate'
  | 'spread';

interface DamageHit {
  name: string; // "Skill (per hit)", "Burst initial"
  scalingStat: 'atk' | 'hp' | 'def' | 'em';
  multiplier: number; // talent multiplier at reference talent level 9
  element: Element | 'physical';
  reaction: Reaction; // the reaction this hit is assumed to trigger
  weight: number; // contribution weight in the target function
}

// A character's "damage profile": the weighted hits that stand in for a rotation.
// ponytail: multipliers frozen at talent lv9 — constant scale factor, doesn't
// change artifact RANKING for one character; revisit if cross-character damage
// comparison needs talent-level fidelity.
interface DamageProfile {
  characterKey: string; // GOOD key, e.g. "Neuvillette"
  hits: DamageHit[];
  erRequirement: number; // % — becomes the default ER constraint
  notes: string; // one-line rationale + source link (KQM guide)
}

// src/roster/types.ts
interface RosterEntry {
  characterKey: string;
  level: number;
  ascension: number;
  constellation: number;
  talents: { auto: number; skill: number; burst: number };
  weaponKey: string | null;
  weaponLevel: number;
  weaponRefinement: number;
  buildScore: number; // 0–100 readiness, see Phase 2
}

// src/teams/types.ts
type EndgameMode = 'abyss' | 'theater' | 'stygian';
type Role =
  | 'on-field-dps'
  | 'off-field-dps'
  | 'buffer'
  | 'sustain'
  | 'battery'
  | 'applicator';

interface CompSlot {
  role: Role;
  options: Array<{ characterKey: string; weight: number }>; // ranked substitutes, weight ∈ (0,1]
}

interface CompArchetype {
  id: string; // "neuvillette-hypercarry"
  name: string;
  modes: EndgameMode[];
  tier: 1 | 2 | 3; // 1 = top meta
  slots: [CompSlot, CompSlot, CompSlot, CompSlot];
  source: string; // URL of the guide/usage-stat page it was curated from
  notes: string;
}

interface TeamRecommendation {
  archetypeId: string;
  members: string[]; // 4 characterKeys, resolved from roster
  score: number; // archetype tier × slot weights × avg buildScore
  gaps: string[]; // human-readable: "no dedicated battery; ER constraint raised"
}
```

## ADRs to write (each in its phase)

- **ADR-0016** — Damage engine as an optimizer objective; supersedes ADR-0003's "no damage engine" (stat-only remains the fallback objective). _(Phase 1)_
- **ADR-0017** — Curated comp database with role-based substitution; curation workflow (agent-drafted, human-reviewed, per-patch refresh); why not rule-based synergy or simulation. _(Phase 3)_
- **ADR-0018** — Mode-aware team recommendation; Abyss-first scope; disjoint-team selection method. _(Phase 3)_
- **ADR-0019** — Plan output composition (teams → builds → shopping list) as the new product centerpiece; extends ADR-0007's gap analysis from per-build to per-account. _(Phase 4)_

---

## Phases

Each phase = one PR, independently shippable, app fully working after each. Estimated relative size in brackets.

### Phase 0: Groundwork [S]

**Files:** Modify `CONTEXT.md`, `README.md` (roadmap section), `scripts/build-dataset.ts` output; create `docs/adr/` stubs only if decided here.

- [ ] Refresh the frozen genshin-db snapshot to game version 7.0 (`npm run build:data`), verify optimizer tests still pass (new characters/sets appear; nothing existing breaks).
- [ ] Add the new-domain glossary terms to `CONTEXT.md`: **Damage profile**, **Target function**, **Roster entry / Build score**, **Comp archetype / Role / Slot**, **Team recommendation**, **Endgame mode**, **Plan** (the composed output), **Shopping list**.
- [ ] Update README roadmap: v2 vision paragraph (one-stop endgame planner), link this spec.
- [ ] Verify the user's GOOD fixture imports cleanly post-refresh (109 characters incl. 7.0-era keys like `Columbina`, `Flins`, `Durin` — if any key is missing from the snapshot, the import must degrade gracefully, not throw).

**Exit criteria:** CI green; import of the root GOOD file shows 109 roster entries.

### Phase 1: Damage engine [M]

**Files:** Create `src/damage/formula.ts`, `src/damage/formula.test.ts`, `src/damage/profiles/` (one JSON or TS module per character), `src/damage/targetFunction.ts`; modify `src/optimizer/` to accept an `avg_damage` objective; create `docs/adr/0016-damage-engine-objective.md`.

**Interfaces:**

- Produces: `computeHitDamage(stats: StatVec, hit: DamageHit, enemy: EnemyConfig): number` (pure, expected-value crit), `targetFunctionScore(stats: StatVec, profile: DamageProfile, enemy: EnemyConfig): number` (Σ weighted hits), and `'avg_damage'` added to the `Objective` union in `src/game/types.ts`.
- Consumes: existing `StatVec`, `Objective`, `OptimizeResult` from `src/game/types.ts`; `genshinAdapter` base stats.

Content:

- [ ] Implement the KQM formula verbatim from `docs/research/2026-08-20-damage-calc-and-game-data.md` §A1: base damage, EV crit (`1 + clamp(CR) × CD`), DMG bonus, enemy DEF multiplier (level 90 vs level 100 enemy default), RES multiplier (three-piece piecewise), amplifying reaction with EM term, additive (aggravate/spread) with EM term and the level-multiplier lookup table. Transformative reactions are OUT of scope for the target function (they don't scale with artifacts' crit — note this in the ADR).
- [ ] Test against hand-computed known values (at least: one ATK-scaler no reaction, one HP-scaler, one vaporize 2x with EM, one aggravate case; RES piecewise boundaries at 0, 0.75, negative).
- [ ] **Critical for exactness:** the branch-and-bound needs an admissible upper bound for `avg_damage`. Damage is monotone in every contributing stat, so the bound = damage evaluated at the per-remaining-slot max of each stat (same style as the existing per-stat bounds). Prove with the existing brute-force-oracle test pattern extended to the damage objective.
- [ ] Seed damage profiles for ~15–20 meta characters (enough to cover Phase 3's comp database): from the owner's roster prioritize Neuvillette, Nahida, Furina, Kazuha, Bennett, Xingqiu, Yelan, Raiden, Alhaitham, Xilonen, Mualani, Kinich, Skirk, Escoffier, Arlecchino-tier 7.0 DPS if owned, etc. Multipliers at talent lv9 from the frozen snapshot's talent tables where available, else from KQM guides (record source per profile).
- [ ] UI: objective picker gains "Average damage (per rotation-weighted hit)" for characters WITH a profile; characters without one silently keep the existing stat objectives. Damage results display with the mandatory "estimate" caveat copy.

**Exit criteria:** optimizing Neuvillette on the owner's fixture with `avg_damage` returns a build that beats the CV-objective build's computed damage; oracle test proves exactness.

### Phase 2: Roster assessment [M]

**Files:** Create `src/roster/buildScore.ts` + tests, `src/roster/RosterView.tsx`; modify Zustand store to hold `RosterEntry[]` (roster import already lands characters/weapons — ADR-0015).

**Interfaces:**

- Produces: `computeBuildScore(entry, equippedArtifacts, adapter): number` (0–100) and a roster screen listing all imported characters sorted by build score.
- Consumes: GOOD roster import (existing), `genshinAdapter`.

Content:

- [ ] Build score = weighted composite: character level/ascension (is it 80/90?), talent levels, weapon level/refinement, equipped-artifact quality (reuse existing CV scoring on currently equipped pieces — GOOD's `location` field says who wears what). Exact weights decided in the phase plan; must be monotone and explainable ("why 62/100" breakdown in UI).
- [ ] Roster view: table/grid of all characters with element, weapon, build score, "built / partially built / unbuilt" bands (thresholds decided in phase plan, e.g. ≥70 / 40–69 / <40).
- [ ] Verify on the owner's fixture: the L90 crew (Kazuha, Furina, Neuvillette, Bennett, Xingqiu…) lands in "built"; L70 benchwarmers land lower.

**Exit criteria:** importing the fixture renders a full roster screen; scores are explainable and stable (snapshot test).

### Phase 3: Comp database + Abyss team recommender [L]

**Files:** Create `src/teams/comps.ts` (the curated database), `src/teams/recommend.ts` + tests, `src/teams/TeamsView.tsx`; create `docs/adr/0017-curated-comp-database.md`, `docs/adr/0018-mode-aware-team-recommendation.md`.

**Interfaces:**

- Produces: `recommendTeams(roster: RosterEntry[], mode: EndgameMode, count: number): TeamRecommendation[]` — for Abyss, `count = 2` DISJOINT teams (no shared character), maximizing the minimum team score (both halves must clear).
- Consumes: `CompArchetype[]`, build scores from Phase 2.

Content:

- [ ] Curate 25–40 `CompArchetype` entries covering current Abyss meta: agent-drafts from KQM team guides + spiralabyss.org floor-12 usage → human review by the owner before merge (curation PR checklist in ADR-0017). Every entry cites its `source`.
- [ ] Matching: instantiate each archetype against the roster (best available option per slot, no reuse within a team); team score = `tierWeight(tier) × Π slotWeight × avg(buildScore)/100`. Missing slot with no substitute ⇒ archetype infeasible, recorded as a gap (feeds Phase 5).
- [ ] Disjoint pair selection: archetype count ≤ 40 ⇒ exact search over instantiated-team pairs is trivial (≤ ~1600 pairs); maximize `min(scoreA, scoreB)`. `// ponytail: exact pairwise scan; revisit only if archetype count grows 10x`.
- [ ] Teams UI: two recommended Abyss halves, each member showing character, weapon, build score, role; per-team gaps listed. Mode selector present but Theater/Stygian marked "coming soon" (schema already carries their tags).

**Exit criteria:** the owner's fixture yields two sensible disjoint Abyss teams (sanity: Neuvillette-hypercarry and a Nahida/Furina-adjacent second half are plausible outputs); unit tests cover disjointness, infeasible archetypes, and empty-roster edge.

### Phase 4: The Plan page (centerpiece) [L]

**Files:** Create `src/plan/PlanView.tsx`, `src/plan/composePlan.ts` + tests; modify navigation/App; create `docs/adr/0019-plan-output.md`.

**Interfaces:**

- Produces: `composePlan(roster, inventory, mode): Plan` where `Plan = { teams: TeamRecommendation[]; builds: Map<characterKey, OptimizeResult>; farmingList: FarmingItem[] }`.
- Consumes: Phase 3 recommendations; existing optimizer (per member, `avg_damage` objective when profiled, else CV) run in the existing worker; existing gap analysis (`src/meta/`) per member.

Content:

- [ ] For each recommended team member, auto-run the optimizer over the FULL artifact inventory with the member's meta constraints (existing meta recipes pre-fill) and render the best owned build — the WuWa-guide presentation pattern (team → per-member fully specified builds), but personalized.
- [ ] Aggregate per-member gap analyses into one farming list: artifact domains to farm (dedup by domain), main-stat pieces missing, ER shortfalls. Sequential worker runs with a progress indicator (8 optimizer runs; existing worker already handles one at a time).
- [ ] Artifact conflict handling: two members wanting the same physical artifact — allocate greedily by team-score order and record the conflict in the UI. `// ponytail: greedy allocation; optimal assignment (Hungarian) only if users complain`.
- [ ] This page becomes the app's landing experience after import ("Your Abyss plan"); existing single-character optimizer remains as the "detail" drill-down.

**Exit criteria:** fixture → one click → full Abyss plan (2 teams, 8 optimized builds, one farming list) renders in reasonable time (target: under ~30s total on the 549-artifact fixture; measure, don't guess).

### Phase 5: Investment advisor [M]

**Files:** Create `src/invest/obtainability.ts` (curated weapon-source dataset), `src/invest/advise.ts` + tests, UI section on the Plan page.

Content:

- [ ] Curate weapon obtainability dataset (craftable / battle-pass / standard banner / limited banner / event) for weapons appearing in comp archetypes and meta recipes only (~60–80 entries, not all 150+ weapons).
- [ ] Advice = ranked list derived from Phase 3/4 gaps: (a) "archetype X is one role short — owning any of [substitute list] unlocks it, expected team-score gain +N"; (b) "member Y's weapon is the weak link — craftable upgrade Z exists". Characters: recommend by unlock value; no banner-schedule prediction (research verdict: leak-based, unreliable) — link out to a tracker instead, with a caveat.
- [ ] Every recommendation shows its provenance (which gap produced it).

**Exit criteria:** fixture produces a non-empty, sensible shopping list with provenance; no recommendation references data without a source.

### Phase 6+ (backlog, not planned in detail — do NOT build speculatively)

- Imaginarium Theater mode (element filter + roster-depth check — schema ready).
- Stygian Onslaught mode (3 disjoint teams).
- HoYoLAB cookie import (full roster without a scanner; opt-in, trust-sensitive, likely needs a serverless proxy; see ingestion research for the security posture).
- gcsim "verify this team" export/integration.
- Akasha-style percentile context; share links for whole plans; AI-explain extended to plans.

---

## Execution protocol (for the Opus orchestrator)

1. Work phase-by-phase; each phase on its own branch → PR → merge (repo has branch protection: PRs required, CI gate).
2. Per phase: follow `docs/superpowers/plans/2026-08-20-endgame-planner-plan.md` task-by-task via `superpowers:subagent-driven-development` (Sonnet subagents per task) → `superpowers:requesting-code-review` before the PR.
3. The comp database and damage profiles are CONTENT tasks: draft with subagents from cited sources, but flag the curation PRs for the owner's human review — accuracy there is a domain-knowledge judgment, not a code review.
4. Keep ADR discipline: no phase merges without its ADR; supersede, don't rewrite, old ADRs (ADR-0003 gets a "superseded by ADR-0016" banner, its fallback role noted).
5. `CONTEXT.md` glossary and `knowledge/` map are updated in the same PR as the code that introduces a term.
6. If a research fact turns out stale at execution time (e.g. Enka payload change, genshin-db lag), re-verify against the primary source linked in `docs/research/` before coding around it.

## Open questions resolved by default (change only if the owner objects)

| Question                       | Default chosen                                                         | Why                                                                                                            |
| ------------------------------ | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Damage engine vs stat-only     | Both: damage objective where a profile exists, stat fallback elsewhere | Zero-maintenance coverage for all 109 characters, depth for the ~20 that matter                                |
| Rotation simulation            | No — weighted-hit target functions                                     | Research: standard practice (genshin-optimizer), sufficient for ranking                                        |
| Team recs approach             | Curated archetypes + ranked substitutes                                | No machine-readable comp source exists; rules-only synergy underperforms curation                              |
| First endgame mode             | Spiral Abyss                                                           | Clearest structure (2×4 disjoint), best usage data, the classic "kill endgame boss" ask                        |
| HoYoLAB cookie import          | Deferred to backlog                                                    | Full inventory already available via GOOD (owner has Inventory Kamera); cookies are a trust/security liability |
| Enemy defaults for damage calc | Level 100, 10% RES, no shred                                           | Common community baseline; configurable later                                                                  |
| Old gap-analysis feature       | Absorbed into the Plan page (per-member)                               | It was the v1.1 centerpiece; it becomes a component of the v2 centerpiece                                      |
