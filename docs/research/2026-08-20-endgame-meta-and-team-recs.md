# Endgame Meta & Team-Recommendation Architecture — Research Report

_Research date: 2026-08-20 (patch 7.0 era). Produced by a research subagent; verified links at the bottom._

## 1. Endgame Modes (as of Patch 7.0, August 2026)

### Spiral Abyss

- **Structure**: 12 floors — Abyss Corridor (1–8, easy) and Abyssal Moon Spire (9–12, the real challenge). Floors 9–12: 3 chambers each, each chamber split into two halves requiring **2 separate 4-character teams with no character overlap**. 36 stars total (9 per floor × floors 9–12).
- **Two-team requirement**: a competitive roster effectively needs **8 well-built characters** to full-clear.
- **Blessing of the Abyssal Moon**: a global buff rotating monthly that pushes specific playstyles (e.g. the current 7.0 cycle buffs Charged Attack DMG +75% on one half and Lunar Reaction DMG +75% on the other). This is the main lever that invalidates "last month's meta team."
- **Time pressure**: star-clearing is timer-based (floor 12: 180/300/420s windows), so DPS/rotation speed matters, not just survival.
- **Clearing (36 stars) demands**: 2 independent built teams with elemental diversity to exploit the blessing and handle floor-specific resistances/shields.

### Imaginarium Theater

- **Element restriction**: each ~monthly season restricts the roster to 2-3 elements (e.g. Season 26, Aug 2026 = Hydro/Cryo/Electro), except "Special Guest Stars."
- **Roster size (Alternate Cast) per difficulty** — the most actionable number for an inventory tool:

| Difficulty  | Acts        | Min. built characters needed |
| ----------- | ----------- | ---------------------------- |
| Easy        | 3           | 8                            |
| Normal      | 6           | 12                           |
| Hard        | 8           | 16                           |
| Visionary   | 10          | 22                           |
| Lunar (top) | 10 + Arcana | 28                           |

- **Vigor system**: each character usable ~2 times per run, forcing roster depth over one god-team.
- **Full clear demands**: broad, element-locked roster depth (up to 28 characters) — a fundamentally different optimization target from Abyss.

### Stygian Onslaught (new mode, 2025-2026)

- Boss-rush; the newest permanent endgame mode. **3 teams of 4, no character overlap**, against progressively harder bosses across difficulty tiers (Normal → Menacing → Fearless → Dire).
- Strict ~2-minute DPS-check timer per boss at high difficulty; rotates monthly.
- **Demands**: 3 built teams (12 characters) with boss-specific counters (interrupt resistance, burst windows).

**Implication**: the three modes stress _different_ roster axes — Abyss = 2-team DPS-under-timer + monthly blessing; Theater = wide element-locked depth; Stygian = 3-team boss counters. The recommendation engine needs mode-aware logic, not one universal "best team" function.

## 2. Meta / Usage Data Sources

| Source                                                                                                                     | What it offers                                                                                               | Machine-readable?                                                                          |
| -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| [spiralabyss.org](https://spiralabyss.org/floor-12-usage-rate)                                                             | Floor 12 usage %, most-common-teammate pairings, regional splits (survey-based, ~10k players)                | No public API — scrape only                                                                |
| [genshinlab.com](https://genshinlab.com/team/)                                                                             | Per-character team-guide pages with named comps and roles                                                    | No — static pages                                                                          |
| [aza.gg genshin](https://genshin.aza.gg/spiral-abyss?l=en)                                                                 | Usage rate, pick rate, own rate, best comps                                                                  | Not confirmed as API                                                                       |
| HoYoLAB community articles                                                                                                 | Usage-rate writeups per Abyss cycle                                                                          | No — narrative                                                                             |
| [akasha.cv](https://akasha.cv/)                                                                                            | Open source; real-player damage leaderboards from Abyss-verified builds, normalized to comparable investment | Sort of — undocumented, unstable API (`akasha-py` wrapper warns it changes without notice) |
| [KQM Compendium](https://compendium.keqingmains.com/) + [Team Building Guide](https://keqingmains.com/misc/team-building/) | Theorycrafted rotations, damage standards, and a genuinely useful **role/rules taxonomy** (§3)               | No — but the _logic_ is extractable and codeable                                           |
| Tier lists (Prydwen, Game8, genshinbuilds)                                                                                 | Character rankings, per-character team suggestions                                                           | Scrape only                                                                                |

**No source provides a clean, versioned, machine-readable "known-good team comps" dataset.** Comp data is locked in prose guides → needs manual curation (or agent-assisted curation with human review).

## 3. Team Recommendation Approaches — precedent

- **[Gear61/Software-Project-Ideas — Genshin Team Builder](https://github.com/Gear61/Software-Project-Ideas/blob/main/Genshin%20Impact%20Team%20Builder.md)**: spec proposing exactly the curated-comps + roster-matching approach; flags that **sourcing/maintaining the team database is the main cost**, not the matching algorithm.
- **[doctordubba/genshin-team-builder-v3](https://github.com/doctordubba/genshin-team-builder-v3)**: "local-first team builder with N⁴ combinatorial artifact optimizer, multi-team roster finder, optional Claude AI advisor" — reference implementation for multi-team splits (README 404'd during research; verify availability).
- **[man90es/genshin-party-builder](https://github.com/man90es/genshin-party-builder)**: rule-based synergy approach (elements, weapon types, reactions, roles, community scores).
- **gcsim**: the "real" way to validate comp DPS, but needs hand-written per-team rotation scripts — a power-user verification tool, not a live recommender.
- **genshin-optimizer**: doesn't recommend teams; optimizes builds within a team you pick.

**Practical assessment**: curated-comps + role-based substitution is what the community independently converged on. Pure rule-based synergy is a fallback/tiebreaker layer; generic synergy rules alone won't match curated comps (reaction tuning, rotation alignment, ER sufficiency are hard to encode). Full simulation is out of MVP scope.

### KQM's extractable role taxonomy (the substitution/synergy layer)

Roles: **Damage** (needs field time), **Battery** (energy for ER-starved DPS), **Aura/Application** (keeps an element applied off-field), **Survivability** (healer/shielder), **Buffer** (stat buffs / RES shred). Rules:

1. Rotation/cooldown alignment (don't stack multiple 9s+ field-time characters).
2. Reaction consistency — one consistent trigger character; 1.5x reactions (Vape-by-Pyro, Melt-by-Cryo) are more reliable than 2x.
3. Energy sufficiency — compute ER need, backfill with same-element batteries.
4. ≥1 survivability source per team (or 2 minor ones).
5. Enemy adaptation — grouping vs single-target, RES shred vs high-RES targets.

Encode each curated-comp slot as a _role_ with ranked substitutes rather than a fixed character; match the user's roster against role-compatible alternates.

## 4. Investment Recommendation Data

- **Banner schedule**: no official API. [Prydwen banners page](https://www.prydwen.gg/genshin-impact/banners) is the most cited tracker; all scrape-only, leak-based entries unreliable. Treat as best-effort, manually verified — not a source of truth.
- **Weapon obtainability** (craftable / battle pass / standard / limited / event): no consolidated machine-readable source. Small enumeration (~5-8 new weapons per patch) → **manually curate a static dataset**.
- **Raw game data**: well served by genshin-db / Project Amber / Enka (see the data-sourcing and ingestion reports).

## Recommended Architecture (MVP)

**Curated-comps + role-based substitution, mode-aware.**

1. **Static comp database** (own curated JSON, seeded from KQM/genshinlab/spiralabyss.org, updated ~monthly): `{archetype_name, mode_tags, slots: [{role, primary_char, valid_substitutes[], reaction_type}], min_investment_notes}`.
2. **Reference data**: genshin-db (already in place).
3. **Roster ingestion**: GOOD file (full inventory) primary; Enka UID (showcase) fast path; HoYoLAB cookie import as opt-in later (trust-sensitive).
4. **Matching engine, mode-aware**: Abyss = 2 non-overlapping teams; Theater = seasonal-element filter + roster-depth count; Stygian = 3 non-overlapping teams. Score roster against archetypes; KQM role rules as tiebreaker/gap-filler.
5. **Investment recommendation**: derived from _gaps_ in matching — "one role short of a high-scoring archetype" → surface substitutes → cross-reference obtainability tier (craft vs pull vs battle pass).
6. **Post-MVP**: gcsim "simulate this comp" verification button.

The real cost center is sourcing/maintaining the comp database and obtainability data, not the algorithm.

---

Sources: see inline links above, plus:

- [Genshin Impact 7.0 Spiral Abyss Guide (Aug 2026)](https://bittopup.com/article/genshin-impact-7-0-spiral-abyss-guide-august-2026)
- [Spiral Abyss | Fandom wiki](https://genshin-impact.fandom.com/wiki/Spiral_Abyss)
- [Imaginarium Theater guide (Game8, v6.7)](https://game8.co/games/Genshin-Impact/archives/401979)
- [Principal and Alternate Cast (hutaobot.moe)](https://hutaobot.moe/guides/imaginarium-theater/principal-and-alternate-cast)
- [Stygian Onslaught guide (Game8)](https://game8.co/games/Genshin-Impact/archives/527266)
- [GamesRadar+ on Stygian Onslaught difficulty](https://www.gamesradar.com/games/open-world/genshin-impact-has-an-actual-new-endgame-mode-after-5-years-and-it-is-kicking-the-crap-out-of-everyone-even-whales-whove-spent-thousands-of-dollars/)
- [seriaati/akasha-py](https://github.com/seriaati/akasha-py)
- [Enka.Network API docs](https://github.com/EnkaNetwork/API-docs/blob/master/api.md)
