# Genshin Impact Damage Calculator & Data Sourcing — Research Report

_Research date: 2026-08-20 (game version 7.0, released ~Aug 12 2026). Produced by a research subagent; verified links listed at the bottom._

## TL;DR Recommendation

**The laziest credible path:**

- **Data**: `genshin-db` (npm, MIT license) for character/weapon/artifact JSON, sourced from the Dimbreath data pipeline, updated within 1-2 days of each patch. Don't touch AnimeGameData/GenshinData raw JSON yourself — let genshin-db (or hakush.in) absorb that churn.
- **Damage math**: Don't reuse genshin-optimizer's or gcsim's calc _code_ (neither ships a standalone reusable package/library — see below). Instead, hand-implement the ~40-line KQM canonical formula directly in TypeScript using the exact equations below. This is genuinely the low-effort option: the formula is small, stable, and documented to the coefficient.
- **Ranking model**: Single-hit "damage per instance" scoring (à la genshin-optimizer's target functions) is enough for build _ranking/comparison_. Full rotation simulation (gcsim's approach) is a stretch goal, not a v1 requirement.

---

## A. Damage Calculation

### A1. Canonical formula (KQM TCL — library.keqingmains.com/combat-mechanics/damage/damage-formula)

```
DMG = (Σ(BaseDMG × BaseDMGMultiplier) + AdditiveBaseDMGBonus)
      × (1 + DMGBonus − DMGReductionTarget)
      × CRIT
      × EnemyDefMult
      × EnemyResMult
      × AmplifyingReaction
```

**Base damage** (talent multiplier × relevant stat):

- ATK-scaling: `Talent% × ATK`, where `ATK = (BaseATK_char + BaseATK_weapon) × (1 + ATK%_bonus) + FlatATK`
- DEF-scaling: `Talent% × DEF`
- HP-scaling: `Talent% × MaxHP`
- EM-scaling (rare, e.g. some catalyst talents): `Talent% × EM`

**Crit:**

- On-crit: `CRIT = 1 + CritDMG%`
- Expected-value (for ranking, not a single roll): `AvgCrit = 1 + clamp(CritRate%, 0, 100%) × CritDMG%`

**Enemy DEF multiplier:**

```
EnemyDefMult = (CharLevel + 100) / [(CharLevel + 100) + (EnemyLevel + 100) × (1 − DefRed%) × (1 − DefIgnore%)]
```

(DefRed% caps at 90%.)

**Enemy RES multiplier:**

```
RES < 0:        EnemyResMult = 1 − RES/2
0 ≤ RES < 0.75: EnemyResMult = 1 − RES
RES ≥ 0.75:     EnemyResMult = 1 / (4×RES + 1)
```

**Amplifying reactions (vaporize/melt):**

```
AmplifyingReaction = ReactionMult × (1 + 2.78×EM/(1400+EM) + ReactionBonus%)
```

ReactionMult = 2 (hydro-vaporize, pyro-melt) or 1.5 (pyro-vaporize, cryo-melt).

**Transformative reactions** (swirl, electro-charged, overloaded, superconduct, shatter, bloom family):

```
TransformativeDMG = ReactionMult × LevelMult × (1 + 16×EM/(2000+EM) + ReactionBonus%) × EnemyResMult
```

ReactionMult ranges 0.25 (burning) to 3 (burgeon/hyperbloom); LevelMult is a per-enemy-level lookup table (same table used everywhere).

**Additive reactions (spread/aggravate):**

```
AdditiveDMG = ReactionMult × LevelMult × (1 + 5×EM/(1200+EM) + ReactionBonus%)
```

ReactionMult = 1.25 (spread) or 1.15 (aggravate) — this term gets added into base damage of the triggering instance, per the top-level formula's `AdditiveBaseDMGBonus` slot.

This is small, closed-form, and stable across patches (the EM coefficients haven't changed in years). It's directly implementable as a pure function with no external dependency. Source: [KQM TCL Damage Formula](https://library.keqingmains.com/combat-mechanics/damage/damage-formula), mirrored at [github.com/KQM-git/TCL](https://github.com/KQM-git/TCL/blob/master/docs/combat-mechanics/damage/damage-formula.md).

### A2. Existing open-source engines — reusability assessment

| Project                         | Language                | License         | Reusable as a library?                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------------- | ----------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **frzyc/genshin-optimizer**     | TypeScript, Nx monorepo | **MIT**         | No published standalone npm package. Its calc engine is called **Pando** (`libs/pando/engine`), with per-game formula layers (`gi-formula`, `sr-formula`, `zzz-formula`) — but these are internal monorepo libs, not published to the public npm registry (confirmed no `@genshin-optimizer/*` packages on npmjs.com). GI's implementation reportedly still runs on an older "Waverider" node system in places. Reuse = vendoring source out of a large Nx monorepo — high effort. |
| **genshinsim/gcsim**            | **Go** (core), TS (UI)  | **MIT**         | Not exposed as a JS-consumable library (no WASM/npm build called out in the repo). Monte Carlo _rotation simulator_ (action-sequence, config-driven) — fundamentally heavier than build-ranking needs. Could run as CLI/subprocess or WASM port, but big integration surface for a v1.                                                                                                                                                                                             |
| **lathieuhuan/gidmgcalculator** | Web app                 | License unclear | Single-scenario web calculator, not packaged as a reusable engine; treat as a UX reference only.                                                                                                                                                                                                                                                                                                                                                                                   |

**Conclusion**: nothing is a drop-in "npm install genshin-damage-calc". Given the formula (A1) is short and well-specified, **hand-rolling it in TS is less total effort than extracting/porting either engine**, and keeps the dependency surface small.

### A3. Ranking complexity — how much rigor is actually needed

- **genshin-optimizer's approach**: build ranking uses **"target functions"** — effectively single-hit (or a small weighted combination of hits) damage-per-instance calculations, not full rotations. Multi-optimization weights several talent instances (NA, skill, burst) to approximate a rotation without simulating time/energy/cooldowns.
- **gcsim's approach**: full Monte Carlo simulation of an explicit action list, including energy regen, cooldowns, buff uptime, team interactions — outputs a DPS distribution. Right tool for _absolute_ accuracy, not needed for _relative_ ranking.
- **For a build/team recommender that ranks options relative to each other**, a single-hit or weighted-multi-hit target-function model is sufficient and standard practice — it's what genshin-optimizer ships as its core ranking mechanism. Full rotation simulation is a future enhancement, not a blocker.

---

## B. Game Data Sources

### B1. Source comparison

| Source                                        | Type                         | License                                    | Update cadence                                    | Notes                                                                                                                                                                                                                                   |
| --------------------------------------------- | ---------------------------- | ------------------------------------------ | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **genshin-db** (`theBowja/genshin-db`, npm)   | npm package, pre-parsed JSON | **MIT** (maintainer explicitly permissive) | Active; usually updated 1-2 days after each patch | Easiest integration path. Computes character/weapon level-scaling stats. Sourced from GenshinData. Missing: some enemy stat functions and event data.                                                                                   |
| **Dimbreath AnimeGameData/GenshinData** (raw) | Raw JSON datamine repo       | No formal license (fan datamine)           | Per patch                                         | The upstream root everyone draws from. **DMCA'd in Oct 2022** (Cognosphere/miHoYo); lives on in mirrors/forks. Legally precarious — **don't consume directly or re-host**; use a maintained wrapper (genshin-db) that absorbs the risk. |
| **hakush.in**                                 | Website + informal JSON API  | Not stated                                 | Very fast, incl. beta data                        | Good for beta/upcoming-patch data. No official JS/TS client; undocumented endpoints = integration risk.                                                                                                                                 |
| **Project Amber (gi.yatta.moe / ambr.top)**   | Website + API                | Not verified (403 to automated fetch)      | Historically well-maintained                      | Secondary/fallback source; verify manually before depending on it. Python wrapper `ambr-py` actively maintained.                                                                                                                        |
| **genshin-optimizer's data pipeline**         | Internal to GO monorepo      | MIT (whole repo)                           | GO release cadence                                | Not published as a separate consumable package — same vendoring problem as its calc engine. Skip.                                                                                                                                       |

### B2. Recommendation and legal posture

- **Primary data source: `genshin-db`.** MIT, npm-installable, actively maintained, ~1-2 days post-patch freshness, and one layer removed from the raw-datamine legal exposure. (Already this repo's source — ADR-0002.)
- **Do not host or redistribute raw Dimbreath dumps.** The 2022 DMCA precedent and the HoYoverse lawsuit against the HomDGCat wiki operator make re-hosting the raw datamine the risky posture. Consuming processed community packages is a mitigation, not a guarantee.
- **Patch cadence**: 6-week/42-day cycles confirmed as of 7.0 (Aug 12 2026). Plan a data-refresh job on that cadence with 1-2 days lag.

---

## Bottom-line build plan

1. **Data**: keep `genshin-db`, with a thin adapter layer mapping its JSON into internal types (this repo already does this — `genshinAdapter`).
2. **Damage math**: implement the KQM formula (A1) as pure TS functions — base damage → crit → dmg bonus → enemy mitigation → reaction multiplier. No external calc dependency.
3. **Ranking**: genshin-optimizer-style single-hit / weighted-multi-hit "target function" scoring. Skip full rotation simulation for v1.
4. **Future/stretch**: if absolute accuracy becomes a requirement, revisit gcsim — likely via its Go CLI rather than a TS port.

**Sources:**

- [KQM TCL — Damage Formula](https://library.keqingmains.com/combat-mechanics/damage/damage-formula) / [GitHub mirror](https://github.com/KQM-git/TCL/blob/master/docs/combat-mechanics/damage/damage-formula.md)
- [frzyc/genshin-optimizer](https://github.com/frzyc/genshin-optimizer) (MIT)
- [genshinsim/gcsim](https://github.com/genshinsim/gcsim) (MIT) / [gcsim.app](https://gcsim.app/) / [docs.gcsim.app](https://docs.gcsim.app/)
- [theBowja/genshin-db](https://github.com/theBowja/genshin-db) (MIT)
- [DimbreathBot/AnimeGameData](https://github.com/DimbreathBot/AnimeGameData)
- [GamerBraves — GenshinData DMCA takedown](https://www.gamerbraves.com/genshin-impact-repository-genshindata-gets-dmca-takedown-despite-not-hosting-leak-content/)
- [PC Gamer — Cognosphere legal action against datamining wikis](https://www.pcgamer.com/games/rpg/genshin-impact-fan-wiki-operator-may-be-having-second-thoughts-about-datamining-after-cognosphere-unleashes-the-lawyers-says-it-will-only-update-live-game-data-in-the-future/)
- [hakush.in](https://hakush.in/) / [hakushin-py](https://pypi.org/project/hakushin-py)
- [Project Amber](https://gi.yatta.moe/) / [ambr-py wrapper](https://github.com/seriaati/ambr)
- [KQM — Multi-Optimization Guide](https://keqingmains.com/misc/multi-optimization/)
- [lathieuhuan/gidmgcalculator](https://github.com/lathieuhuan/gidmgcalculator)
