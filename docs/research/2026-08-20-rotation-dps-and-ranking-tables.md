# Research: rotation-based DPS and IWinToLose-style ranking tables

Point-in-time report (2026-08-20). Input for the future "damage engine v3" spec.
Complements `2026-08-20-damage-calc-and-game-data.md` (which covered the base
formula we shipped in ADR-0016); this one covers what it takes to produce
theorycrafter-grade ranking tables: weapons, artifact sets (incl. 2pc+2pc),
main stats, and constellations, ranked per character the way IWinToLose Gaming
publishes them.

## What the target output looks like (IWinToLose table shape)

From his Odette guide (youtube.com/watch?v=f8FMC1xfntA):

- **Weapon table**: one row per weapon/refinement, columns = personal DMG,
  personal ratio % vs a baseline weapon pinned at 100%, team DPS, team ratio %,
  a star rating, free-text notes ("Burst tends to be team DPS neutral").
- **Main-stat table**: sands/goblet/circlet main-stat combos as % of the
  recommended combo (ATK%/ATK%/CR% = 100%, EM sands = 96.5%, Cryo goblet =
  86.7%, ...), holding the set and substats fixed.
- **Artifact-set table**: personal ratio AND team ratio per set — the two can
  diverge (e.g. one set is 108% personal but 92% team DPS because it hurts a
  teammate's buff), which is the whole reason both columns exist.
- **Constellation table**: team DPS and incremental team gain per constellation
  (C0 100% → C1 +12.5% → C2 +28.3% ...), with star ratings for pull value.

Key insight: every number is a **ratio against an explicit baseline row**
(an R5 four-star weapon, the standard 4pc set, C0), computed twice — once for
personal damage (fixed solo rotation, buffs assumed up) and once for **team DPS
over a defined team rotation** where buff uptime windows are real.

## 1. The canonical damage formula (KQM TCL — implementable)

Source: library.keqingmains.com/combat-mechanics/damage/damage-formula

```
DMG = (Σ(BaseDMG_i) + AdditiveBaseDMGBonus)
      × (1 + ΣDMG% − ΣDMGReduction)      // one additive bucket, never multiplicative
      × CRIT                              // avg: 1 + clamp(CR,0,1)×CD
      × EnemyDefMult × EnemyResMult
      × AmplifyingMult                    // 1.0 if no vape/melt

BaseDMG per hit = TalentMult% × ScalingStat
  ATK-scaling: (ATKchar + ATKweapon)×(1+ATK%) + flatATK   (same shape for HP/DEF/EM)

EnemyDefMult = (Lc+100) / ((Lc+100) + (Le+100)×(1−DefRed%)×(1−DefIgnore%))
  DefRed% capped at 90% total.

EnemyResMult, EffRes = BaseRes − ResShred (can go negative):
  EffRes < 0:      1 − EffRes/2
  0 ≤ EffRes < .75: 1 − EffRes
  EffRes ≥ .75:    1 / (4×EffRes + 1)
  Baseline enemy: Lv100, 10% base RES all elements (KQM convention; matches our
  DEFAULT_ENEMY in src/damage/types.ts).

Amplifying (vape/melt): Mult = k × (1 + 2.78×EM/(1400+EM) + ReactionBonus%)
  k = 2.0 (hydro-vape, pyro-melt) or 1.5 (pyro-vape, cryo-melt)

Additive (aggravate/spread) — flows into AdditiveBaseDMGBonus, so it DOES get
DMG%/crit/def/res:
  Bonus = k × LevelMult(Lc) × (1 + 5×EM/(1200+EM) + ReactionBonus%)
  k: Spread 1.25, Aggravate 1.15. LevelMult @90 ≈ 1446.85 (table from KQM).

Transformative (overload/swirl/EC/bloom family/superconduct/burning) — NOT
affected by DMG%/crit/DEF, only RES:
  DMG = k × LevelMult(Lc) × (1 + 16×EM/(2000+EM) + ReactionBonus%) × EnemyResMult
  k: Burgeon/Hyperbloom/Shatter 3.0, Overload 2.75, EC 2.0/tick, Bloom 2.0,
  Superconduct 1.5, Swirl 0.6, Burning 0.25
```

Gaps in our current `src/damage/formula.ts` vs the full model (per ADR-0016,
deliberate v2 cuts): no transformative reactions, no DEF shred/ignore, no
reaction-DMG-bonus%, no team buffs, fixed enemy, talent multipliers frozen at
level 9, only ~24 characters have profiles.

## 2. Rotation-based team DPS

```
TeamDPS = Σ(avg damage of every hit in the rotation, each hit evaluated with
            the buffs/reactions actually active at its timestamp)
          / rotation length in seconds
```

A rotation is a fixed timed action sequence covering one burst cycle (~12–20s).
Buffs are windows on the rotation clock (Bennett burst covers 0–12s of a 16s
rotation → hits after 12s don't get it). This — buff uptime plus counting
off-field damage — is exactly what makes "team ratio" diverge from "personal
ratio" in IWinToLose's tables.

**gcsim** (github.com/genshinsim/gcsim, MIT, Go): frame-accurate Monte Carlo —
samples crit per hit, models ICD/particles/energy, runs many iterations,
reports mean DPS + distribution. It ships its own WASM build (`cmd/wasm/`,
run in a Web Worker on gcsim.app). Embedding is technically feasible but means
adopting a large, fast-moving Go codebase and its config DSL. **Verdict:
overkill for ranking tables; a deterministic rotation calculator reproduces the
table shape at a fraction of the cost.**

## 3. Reproducing the IWinToLose method — requirements

No formal public spec exists (he works from a personal spreadsheet + the
iwintolose.com/calculator tool). To reproduce the tables we need:

1. A **fixed personal rotation** per character (hit list — we already have a
   crude one in `src/damage/profiles.ts`).
2. A **fixed team rotation** per reference comp (we already curate comps in
   `src/teams/comps.ts`; would add a timed action list + buff windows).
3. **Weapon passives as data**: each passive expressed as stat/DMG%/conditional
   records evaluated against the rotation (biggest new dataset; genshin-db has
   the numbers per refinement, conditionals need hand-structuring).
4. **Artifact set effects as data**: same treatment for every 2pc/4pc,
   including conditional 4pc effects (uptime assumption per set).
5. **A pinned baseline** per table (weapon at R1/R5, standard set, C0) so every
   cell is a ratio.
6. **Constellation deltas**: re-run the same rotation with each con enabled.

## 4. Prior art worth borrowing (frzyc/genshin-optimizer, MIT)

- Formula engine ("Pando", `libs/gi/formula/`): talents/passives/cons as a
  dependency graph of formula nodes, not per-character code — recompute is
  cheap when artifacts swap.
- Set effects and weapon passives are **data records** (`libs/gi/sheets/`),
  not code — new content is additive. Adopt this pattern.
- Constrained multi-set search (keep 4pc vs let a piece complete another set)
  is a known hard area even for them (issue #1186) — plan modest scope there.

## 5. Data sources

| Dataset                                    | Source                                      | Status                                                         |
| ------------------------------------------ | ------------------------------------------- | -------------------------------------------------------------- |
| Talent multipliers per level               | `genshin-db` `talents` (combatN.parameters) | available; we currently freeze at lvl 9                        |
| Char base stats/curves                     | `genshin-db`                                | already in data.generated.json                                 |
| Weapon base/substat/passive per refinement | `genshin-db`                                | numbers available; conditional semantics need hand-structuring |
| Artifact set effects                       | `genshin-db`                                | text + params; needs structuring into stat/conditional records |
| Enemy stats/RES                            | `genshin-db` + KQM Lv100/10% convention     | fine                                                           |
| Reaction level multipliers                 | KQM TCL table                               | small constant table                                           |
| Frame/animation data                       | only gcsim/community docs                   | NOT needed for deterministic rotations with assumed durations  |

## Recommendation

Build a **deterministic rotation calculator** on top of the existing
`src/damage/formula.ts`, phased:

1. **Formula completion**: DEF shred, reaction-bonus%, additive reactions done
   properly, talent levels from the roster import instead of frozen level 9.
2. **Weapon ranking table** (personal only): iterate all equippable weapons ×
   the character's damage profile, pin a baseline, render the ratio table.
3. **Set / main-stat ranking tables** (personal only): same loop over curated
   set options incl. 2pc+2pc, and over main-stat combos with fixed median
   substats.
4. **Team DPS mode** (later, own spec): timed rotations + buff windows on the
   curated comps; unlocks the second ratio column and constellation tables.

Phases 1–3 need no new data pipeline beyond structuring weapon passives and
set effects as records. Phase 4 is where the real curation cost lives.
