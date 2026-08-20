# META_TARGETS verification — the 22 comp-ideal picks

**Date:** 2026-08-20 · **Method:** every guide fetched and read, not recalled.

These 22 characters are weight-1.0 "ideal" picks in `src/teams/comps.ts` and had no
`META_TARGETS` recipe, so the plan solved them unconstrained and returned a rainbow
stat-stick. This is the source record for the recipes in `src/meta/metaTargets.ts`;
re-run this verification per the [patch-refresh runbook](../runbooks/patch-refresh.md).

Primary source is KeqingMains throughout. `ororon` and `citlali` came back at only
medium confidence and were re-checked against four non-KQM sources each (Game8,
GameWith, Icy Veins, the Genshin Builds helper-team site); Prydwen and the Fandom wiki
both refuse automated fetches and could not be used.

## Encoding decisions

Guides give ranges and alternatives; `MetaTarget` holds one recipe. The rules applied:

- **`mains` are hard pool filters** (`src/optimizer/search.ts:41`), so sands and goblet
  are locked to the guide's recommendation, and the circlet is locked **only** when the
  guide names a non-crit stat (HP% / DEF% / ATK% / EM / Healing). A generic "CRIT
  circlet" is left free — locking it to `crit_dmg` would drop every CRIT Rate circlet
  in the inventory.
- **`erTarget` is a hard floor** promoted to `minStats.er_pct`. Where a guide gives a
  range, the recorded value is the representative common-team figure, not the
  burst-every-rotation ceiling — a floor set too high makes the recipe infeasible for
  inventories that legitimately need less. It is **omitted entirely** for the three
  characters whose guides say not to build ER at all.
- **`objective`** is `crit_value` when the guide's substat priority leads with CRIT,
  even for HP/DEF-scaling kits: the mains guarantee the scaling stat and the objective
  maximises crit on top, the same shape as the existing `neuvillette` / `hu_tao`
  entries. For pure buffers and healers it is the stat their buff scales off.
- **`critRatioTarget: 0.333`** (the 1:2 CR:CD convention) is a soft tiebreak only, added
  to the crit-objective entries, consistent with the existing crit DPS entries.

## Verified recipes

| Character          | Set                                   | Sands | Goblet      | Circlet | ER  | Objective  | Confidence  |
| ------------------ | ------------------------------------- | ----- | ----------- | ------- | --- | ---------- | ----------- |
| albedo             | 4pc Husk of Opulent Dreams            | DEF%  | DEF%        | free    | 140 | crit_value | high        |
| baizhu             | 4pc Deepwood Memories                 | HP%   | HP%         | HP%     | 150 | hp_pct     | high        |
| charlotte          | 4pc Noblesse Oblige                   | ER%   | ATK%        | Healing | 200 | atk_pct    | high        |
| chasca             | 4pc Obsidian Codex                    | ATK%  | ATK%        | free    | 110 | crit_value | high        |
| chevreuse          | 4pc Noblesse Oblige                   | HP%   | HP%         | HP%     | 100 | hp_pct     | high        |
| citlali            | 4pc Scroll of the Hero of Cinder City | EM    | EM          | free    | 175 | em         | medium→high |
| emilie             | 4pc Unfinished Reverie                | ATK%  | Dendro DMG  | free    | 140 | crit_value | high        |
| escoffier          | 4pc Golden Troupe                     | ATK%  | Cryo DMG    | free    | 150 | crit_value | high        |
| fischl             | 4pc Golden Troupe                     | ATK%  | Electro DMG | free    | 130 | crit_value | high        |
| gorou              | 4pc Scroll of the Hero of Cinder City | ER%   | Geo DMG     | free    | 220 | crit_value | high        |
| kamisato_ayato     | 4pc Heart of Depth                    | ATK%  | Hydro DMG   | free    | 140 | crit_value | high        |
| kinich             | 4pc Obsidian Codex                    | ATK%  | Dendro DMG  | free    | 110 | crit_value | high        |
| mavuika            | 4pc Obsidian Codex                    | ATK%  | Pyro DMG    | free    | —   | crit_value | high        |
| mualani            | 4pc Obsidian Codex                    | HP%   | Hydro DMG   | free    | —   | crit_value | high        |
| nilou              | 2pc Tenacity + 2pc Vourukasha's Glow  | HP%   | HP%         | HP%     | 200 | hp_pct     | high        |
| ororon             | 4pc Scroll of the Hero of Cinder City | ATK%  | Electro DMG | free    | 140 | crit_value | medium→high |
| sangonomiya_kokomi | 4pc Ocean-Hued Clam                   | HP%   | Hydro DMG   | Healing | 220 | hp_pct     | high        |
| shenhe             | 4pc Noblesse Oblige                   | ATK%  | ATK%        | ATK%    | 160 | atk_pct    | high        |
| skirk              | 4pc Marechaussee Hunter               | ATK%  | Cryo DMG    | free    | —   | crit_value | high        |
| xianyun            | 4pc Noblesse Oblige                   | ER%   | ATK%        | ATK%    | 230 | atk_pct    | high        |
| xilonen            | 4pc Scroll of the Hero of Cinder City | DEF%  | DEF%        | DEF%    | 150 | def_pct    | high        |
| yae_miko           | 4pc Disenchantment in Deep Shadow     | ATK%  | ATK%        | free    | —   | crit_value | high        |

## Corrections to the first-pass recipes

The first pass was written from memory. Ten of the twenty-two were materially wrong:

- **escoffier** — had 4pc Finale of the Deep Galleries. That set **appears nowhere in the
  KQM guide**; it was invented. Correct set is 4pc Golden Troupe.
- **gorou** — had DEF% circlet, `def_pct` objective, 4pc Noblesse Oblige. His multipliers
  are DEF-scaling but the guide is explicit that his artifacts go to ER then CRIT Rate
  ("his damage output is low, artifact investment should go to teammates"). Now 4pc
  Scroll, ER% sands, crit objective.
- **charlotte** — had 4pc Song of Days Past with HP% mains and an HP objective. She is an
  ATK-scaling healer: 4pc Noblesse Oblige, ER% sands, ATK% goblet, Healing circlet.
- **yae_miko** — had 4pc Emblem of Severed Fate with an Electro DMG goblet. Current
  Stellar-Conduct build is 4pc Disenchantment in Deep Shadow with an **ATK%** goblet and
  no ER (the archetype skips her Burst).
- **skirk** — had 4pc Finale of the Deep Galleries; that is the runner-up. Primary is
  4pc Marechaussee Hunter, and she needs no ER (Serpent's Subtlety, not Energy).
- **xianyun** — had 4pc Song of Days Past and ATK% sands. Guide gives three co-equal sets;
  Noblesse Oblige chosen as the default because it is the only one that is never inert
  in an unknown team. Sands is ER%, and the real ER target is ~230, not 180.
- **emilie** — had 4pc Deepwood Memories, now the runner-up; current guide prefers 4pc
  Unfinished Reverie (Deepwood is better worn by a teammate for the RES shred).
- **kamisato_ayato** — had 4pc Echoes of an Offering, a conditional proc-dependent
  alternative. Baseline is 4pc Heart of Depth.
- **nilou** — had 4pc Vourukasha's Glow, the C6/high-investment ceiling. Recommendation
  for most accounts is 2pc Tenacity + 2pc Vourukasha's Glow. The invented
  `statTargets.hp: 60000` is now `30000`, the actual A4 passive threshold.
- **sangonomiya_kokomi** — had an HP% goblet and no circlet lock. Guide ranks Hydro DMG >
  HP%, and her kit's −100% CRIT Rate makes the Healing circlet mandatory, not optional.

Smaller fixes: **mualani** and **citlali** goblets (HP%→Hydro DMG, Cryo DMG→EM),
**albedo** goblet (Elemental DMG→DEF%), **chasca** goblet (Elemental DMG→ATK%), and ER
figures for baizhu, chevreuse, chasca, ororon, shenhe, xilonen, citlali. **mavuika** lost
her `erTarget: 100` outright — the guide says she should not build ER at all.

Only **fischl** and **kinich** survived the first pass unchanged.

## Known range-dependence

Several ER figures are team- and constellation-dependent rather than fixed. The recorded
ranges, for whoever re-verifies next patch:

- albedo 100–150 (C0 two-Geo ≈ 120–140) · baizhu 120–200 (solo vs double Dendro)
- charlotte 180–230+ (by team Cryo count) · chasca 100–110, or 165–195 bursting every rotation
- chevreuse 100 (Burst skippable) up to 175–205 · citlali 145–195 (low end only in heavy-Natlan comps)
- emilie 100–255 · escoffier 120–195 at C0, 100–150 at C4 · fischl 100–140
- gorou 140–250 (220 with Favonius Warbow) · kamisato_ayato 100–160 · kinich 100–120, or 175–245
- nilou ~100–210 · ororon 100–195 · kokomi 195–245 on-field, 260–315 off-field support
- shenhe 145–200 (Favonius Lance lowers it) · xianyun 190–300 solo Anemo, 100–130 in Xiao/C6-Faruzan
- xilonen 100–105 double-Geo up to 170–190 solo-Geo

## Open items

- **ororon C4** — the claim that C4 cuts his ER requirement 30–40% appears in the KQM
  quick guide but in none of the four second sources. Unverified, not contradicted.
- **ororon sands** — several second sources treat ER% as co-equal with ATK%. ATK% kept
  as the majority pick.
- **citlali / ororon** — Prydwen and the Fandom wiki block automated fetches, so a third
  independent opinion is still missing for both.
- The KQM guides for ororon and escoffier are quick-guides only; their long-form pages
  are unwritten or empty.
