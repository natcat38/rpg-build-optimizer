# Research: Spiral Abyss schedule data sources (blessings, disorders, floor 12)

Point-in-time report (2026-08-20). Input for the deferred per-patch endgame-mode
work; the plan doc that scoped it has been removed, so the standing decisions are
[ADR-0018](../adr/0018-mode-aware-team-recommendation.md) (mode-aware team
recommendation) and the manual refresh in
[`docs/runbooks/patch-refresh.md`](../runbooks/patch-refresh.md).

## Key correction to the feature premise

**Floor 12 currently has no Ley Line Disorder.** In the live datamine, every
floor-12 entry points to a `DungeonLevelEntityConfigData` row named
`LevelEntity_Monster_HpUp_Stage12_New2` with `show: false` — baseline HP
scaling, not a player-visible disorder (HoYoverse removed Disorders from
floor 12; floors 9–11 still have them). What actually changes per cycle and
should drive team bias is:

1. the monthly **Blessing / Benediction** (e.g. rows like
   `LevelBuff_TowerBuff_SwirlReactionTriggerImpact_*` with `show: true`), and
2. the **floor-12 enemy lineup** per chamber (element gates, shields, bosses).

## Where the data lives

### Primary: Dimbreath datamine (`AnimeGameData`)

- GitLab primary: https://gitlab.com/Dimbreath/AnimeGameData ; GitHub mirror:
  https://github.com/DimbreathBot/AnimeGameData (mirror observed ~3 months
  stale at fetch time — prefer GitLab, and treat the mirror as fallback).
- Files (verified by fetching and parsing):
  - `ExcelBinOutput/TowerScheduleExcelConfigData.json` — one row per abyss
    cycle: `scheduleId`, `closeTime`, `monthlyLevelConfigId` (→ blessing),
    `buffnameTextMapHash`, `descTextMapHash`, `icon` (`UI_TowerBlessing_NNN`).
  - `ExcelBinOutput/TowerFloorExcelConfigData.json` — `floorIndex` 1–12,
    `floorLevelConfigId` (→ disorder entity), `overrideMonsterLevel`.
  - `ExcelBinOutput/TowerLevelExcelConfigData.json` — chamber rows with
    `dungeonId`, `monsterLevel`, star conditions. **`firstMonsterList`/
    `secondMonsterList` are empty in live data** — chamber lineups are NOT in
    clean JSON; they live in scene/group data keyed by `dungeonId`.
  - `ExcelBinOutput/DungeonLevelEntityConfigData.json` — blessing/disorder
    rows: `descTextMapHash`, `levelConfigName`, `show`.
  - `TextMap/TextMapEN.json` (~22 MB) — resolves `*TextMapHash` ints (hashes
    > 2^31 wrap to negative int32).
- **Pin one commit** and pull Excel + TextMap from it together — a live fetch
  hit unresolvable hashes because the two were out of sync across commits.
- No formal license; community-tolerated datamine. Snapshot at build time and
  vendor the resolved JSON; never fetch at runtime.

### Secondary: Fandom wiki dated pages

`genshin-impact.fandom.com/wiki/Spiral_Abyss/Floors/<YYYY-MM-DD>` — per-cycle
pages exist and **contain the chamber monster lineups** the Excel data lacks.
HTML tables, CC-BY-SA (attribution required). Best stopgap for floor-12
lineups: hand-curate from here into a small TS table each cycle.

### Cooked APIs (all weaker options)

| Source                                                | Verdict                                                                                                                            |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `genshin-db` (npm, already our snapshot source)       | **No tower/abyss folder** — cannot cover this.                                                                                     |
| Project Amber (`ambr.top` → `gi.yatta.moe`)           | Tower page reportedly backed by third-party `api.lunaris.moe`; site 403'd automated fetch. Re-check manually before relying on it. |
| Hakush.in                                             | Has an abyss page; unverified (DNS failure in test env); wrapper docs say beta-data focus.                                         |
| enka.network / genshin.dev / akasha / spiralabyss.org | Player records or no abyss schedule data — not useful.                                                                             |

### Reference parsers (not dependencies)

- `theBowja/GenshinData-scripts` — `extractDomain.js` resolves
  `DungeonLevelEntityConfigData` and comments it as "ley line disorder"; by
  the `genshin-db` maintainer. Reference for the join logic.
- `Rollphes/genshin-manager` — TS types for all three Tower Excel tables.
- `Grasscutter` — clean field semantics but AGPL; read, don't depend.

## Recommended pipeline (build-time, per-cycle)

Extend `scripts/build-dataset.ts` (or add `scripts/build-abyss.ts`):

1. Fetch the 4 Excel files + `TextMapEN.json` from a **pinned**
   `AnimeGameData` GitLab commit.
2. Join schedule → blessing text (via `monthlyLevelConfigId` →
   `DungeonLevelEntityConfigData.descTextMapHash` → TextMap), and floors 9–11
   → disorder text; keep only rows with `show: true`.
3. Emit `src/game/genshin/abyss.generated.json`:
   `{ scheduleId, closes, blessing: string, floors: { 9..11: disorder }, floor12: { chambers: [...] } }`.
4. Floor-12 chamber lineups: hand-curated per cycle from the Fandom dated page
   into the same JSON (a ~20-line edit each cycle — add to the patch-refresh
   runbook).
5. The team recommender consumes a small derived signal, not raw text: e.g.
   `{ favoredElements, favoredArchetypes }` tagged by a human when curating
   (deriving "swirl blessing → favor anemo/EM teams" from text automatically
   is not worth building).
