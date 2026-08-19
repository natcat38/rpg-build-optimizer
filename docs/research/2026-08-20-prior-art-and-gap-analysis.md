# Prior Art: Existing Genshin Build/Team Tools — Landscape & Gap Analysis

_Research date: 2026-08-20. Produced by a research subagent; the WuWa guide page was rendered in a real browser. Verified links at the bottom._

## 1. frzyc/genshin-optimizer

The dominant open-source Genshin artifact optimizer (frzyc.github.io/genshin-optimizer). Nx monorepo also hosting nascent ZZZ/Star Rail optimizers sharing a calc engine ("Pando").

**Features:** full-inventory import (GOOD format); per-character constrained artifact search ranked by a stat/damage target in a Web Worker; **Theorycraft (TC) mode** (test builds with artifacts you don't own, optimal substat solver); **Teams + Loadouts** (~Q2 2024) — configure 4-character teams with per-character builds; multi-target optimization; artifact upgrade-probability calculator; OCR scanning via tesseract.js.

**Algorithm:** constrained combinatorial search (slot grouping + constraint pruning) in a Web Worker; all client-side, IndexedDB persistence. No formal algorithm write-up published.

**Tech:** React, MUI, TypeScript, Nx, Vite; legacy "Waverider" calc engine being replaced by "Pando".

**License/activity:** **MIT**; very active (1,011 stars, pushed 2026-08-19).

**Reuse potential:** high as a reference (GOOD parsing libs `gi-good`, extracted game data `gi-stats`, scoring logic) — but it optimizes one character at a time against a fixed target; **no team recommendation, no rotation simulation**.

## 2. gcsim (genshinsim/gcsim)

Monte Carlo **team-level combat simulator** (Go; CLI, desktop, gcsim.app web). Users write a config: characters, gear, targets, and an explicit **action list (rotation)**; it runs thousands of iterations and reports mean DPS + distribution, with frame-by-frame playback. Community config database at simpact.app (crowdsourced known-good team rotations).

**License/activity:** **MIT**; active (pushed 2026-08-19), volunteer-driven, persistent backlog for new characters. No confirmed standalone WASM artifact — verify against `genshinsim/gcsim.app` before planning a client-side integration.

**Reuse potential:** closest thing to team-DPS ground truth; integration means shelling out to the Go CLI or self-hosting the engine. It does not recommend comps or rotations — a human/outer layer authors the action list.

## 3. Akasha.cv

Community leaderboard: player profiles fetched via **Enka.Network** showcase API, damage-ranked with percentile standing. Per-character _currently equipped_ snapshot — not full inventory, not a planner. No official/stable API (`akasha-py` wrapper notes it changes frequently without notice). Useful as a percentile-ranking UX reference only.

## 4. Other tools surveyed

- **GOOD format** — de facto open JSON schema for full account export (characters, weapons, artifacts, materials), defined in genshin-optimizer's `gi-good` lib; produced by Inventory Kamera (Windows OCR) and `genshin-inventory-scanner-android`; consumed by GO, SEELIE.me, and others. Real, reusable ingestion standard.
- **Seelie (seelie.me)** — resource/ascension planner + build rating; reads GOOD.
- **paimon.moe** — resource planner, wish tracker; not an optimizer.
- **damage.paimon.app**, Genshin Center, Aspirine's calc, etc. — manual "type your stats" damage calculators; no inventory import, no team simulation.
- **genshin.gg / genshinlab / prydwen.gg / Game8** — static tier lists and build guides; not personalized.
- **"Aza's Damage Calculator"** — could not be identified; may be niche/renamed/defunct.
- **No credible 2025–2026 newcomer** combines full-inventory optimization AND team recommendation. The landscape remains split: optimizer camp (GO, Seelie) vs simulator camp (gcsim) vs static content (guides, tier lists, leaderboards).
- **Miliastra Wonderland** — clarified: it is **not** a build-testing tool. It's the Genshin 7.0-era **in-game UGC sandbox/minigame system** (custom minigames, "Manekin" avatars, PC-only editor). Unrelated to build optimization; not a data source or precedent for this project.

## 5. The Wuthering Waves official guide model (rendered live)

`wuwaguide.kurogames.com` is Kuro Games' official, community-authored, officially hosted per-character build-guide hub. Page structure (observed live): Overview → Recommended Stats at reference level (e.g. "Crit Rate ≥ 70%, Crit DMG ≥ 215%, Energy Regen ≥ 120%") → Recommended Echoes (main + alternatives with substat spreads) → Skill upgrade priority (explicit ordered list) → Sequence nodes with breakpoint notes → Recommended Weapons (with "why" paragraphs) → **Recommended Teammates, each shown with their own recommended weapon and echo set** (team recs as fully-specified per-member builds) → long-form rotation prose.

It is **generic, not personalized** — it doesn't know what the player owns. It's the polished "theoretically ideal build + team" reference layer: exactly the presentation template this project's _personalized_ results page should emulate.

## 6. Gap analysis

| Capability                                            | genshin-optimizer                         | gcsim              | Seelie                  | Akasha.cv                  | WuWa guide               | This project's target           |
| ----------------------------------------------------- | ----------------------------------------- | ------------------ | ----------------------- | -------------------------- | ------------------------ | ------------------------------- |
| Imports your full account inventory                   | Yes (GOOD)                                | No (manual config) | Yes (GOOD)              | No (single build via Enka) | No                       | Yes                             |
| Per-character artifact optimization from owned items  | Yes                                       | No                 | Yes (rating)            | No                         | No (generic)             | Yes                             |
| Real team-rotation DPS simulation                     | No                                        | Yes                | No                      | No                         | No                       | (simplified model; gcsim later) |
| Recommends _which teams_ to build from your roster    | No                                        | No                 | No                      | No                         | No (generic suggestions) | **Yes — this is the gap**       |
| Tells you what to invest in next (farm/pull priority) | Partial (TC mode evaluates hypotheticals) | No                 | Partial (to-do planner) | No                         | No                       | Yes                             |
| Single "here's your plan" output                      | No                                        | No                 | No                      | No                         | Yes, but generic         | Yes                             |

**The gap is real and specific:** nothing closes the loop from "here's everything on my account" → "here are your best 2–3 team comps for Abyss/Theater with per-member builds already optimized from what you own" → "here's the next artifact domain / weapon / character worth your resin or pulls."

**Practically reusable building blocks:**

- **GOOD format** as the inventory standard (this repo already imports it).
- **frzyc/genshin-optimizer** (MIT) — architecture/algorithm reference for the artifact-scoring layer.
- **gcsim** (MIT) — future team-DPS verification.
- **WuWa's per-teammate-build-under-a-team-recommendation UI pattern** as the output-page content model.

Sources:

- [frzyc/genshin-optimizer](https://github.com/frzyc/genshin-optimizer) / [live site](https://frzyc.github.io/genshin-optimizer)
- [genshinsim/gcsim](https://github.com/genshinsim/gcsim) / [gcsim.app](https://gcsim.app/) / [docs.gcsim.app](https://docs.gcsim.app/) / [simpact.app](https://simpact.app/)
- [Akasha System](https://akasha.cv/) / [seriaati/akasha-py](https://github.com/seriaati/akasha-py)
- [wuwaguide.kurogames.com](https://wuwaguide.kurogames.com/en/)
- [Inventory Kamera](https://github.com/Andrewthe13th/Inventory_Kamera)
- [genshin-inventory-scanner-android](https://github.com/steve1316/genshin-inventory-scanner-android)
- [SEELIE.me](https://seelie.inmagi.com/) / [Paimon.moe](https://paimon.moe/)
- [KQM Multi-Optimization Guide](https://keqingmains.com/misc/multi-optimization/)
- [Miliastra Wonderland | Fandom wiki](https://genshin-impact.fandom.com/wiki/Miliastra_Wonderland)
