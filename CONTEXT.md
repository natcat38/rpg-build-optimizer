# CONTEXT — RPG Build Optimizer

Single-context project. This file is the canonical glossary; use these exact terms in code, issues, tests, and docs. Decisions live in `docs/adr/`.

## What this project is

A client-side web app for Genshin Impact. Given a GOOD account export, it recommends, for every character a player owns: the best 5-piece artifact build from what they own, the best weapon they own, which talents to level, an endgame team their roster can field, and what to farm to close the remaining gap to a meta target. No backend, no accounts; sharing is via self-contained links. See [ADR-0001](docs/adr/0001-client-side-only-architecture.md) and [ADR-0016](docs/adr/0016-per-character-advisor-curated-overlays.md).

## Glossary

### Game domain

- **Artifact** — a gear piece. Occupies one **slot**, has one **main stat** and up to **4 sub-stats**.
- **Slot** — one of `flower`, `plume`, `sands`, `goblet`, `circlet`. A build is exactly one artifact per slot.
- **Main stat** — the artifact's primary stat. Flower/plume are fixed (HP/ATK); sands/goblet/circlet vary.
- **Sub-stat** — a secondary stat on an artifact (≤4, none equal to the main stat).
- **Artifact set** — a family of artifacts granting **set bonuses** at 2 and 4 pieces.
- **Set bonus** — the effect from wearing 2 (**2pc**) or 4 (**4pc**) of a set. Only the **flat-stat** portion of 2pc (and rare flat-stat 4pc) is **scored**; conditional/non-stat 4pc effects are honoured as a **constraint** but not scored. See [ADR-0003](docs/adr/0003-stat-only-model-no-damage-engine.md).
- **2+2** — a build satisfying two different 2-piece set bonuses simultaneously.
- **Stat keys** — `hp, hp_pct, atk, atk_pct, def, def_pct, em, er_pct, crit_rate, crit_dmg, elemental_dmg, physical_dmg, healing`.
- **Elemental DMG** — `elemental_dmg`; a **single fungible stat** combining all element-specific DMG% bonuses (Pyro/Hydro/…/Dendro). A goblet's element is tracked (`Artifact.element`) and an off-element goblet's main stat is zeroed before scoring. Physical DMG (`physical_dmg`) is separate. See [ADR-0011](docs/adr/0011-elemental-dmg-as-single-fungible-stat.md) and [ADR-0014](docs/adr/0014-element-aware-goblet-scoring.md).
- **Energy Recharge (ER)** — `er_pct`; commonly a minimum constraint (e.g. ≥160%). Every character starts from a **universal 100% base ER**; this game-wide baseline is supplied by the `genshinAdapter`, not the reference snapshot. See [ADR-0009](docs/adr/0009-adapter-owns-universal-game-baselines.md).
- **Elemental Mastery (EM)** — `em`.
- **Crit Value (CV)** — `crit_rate * 2 + crit_dmg`. A common **objective**.
- **Crit ratio** — the balance of crit rate to crit DMG (healthy ≈ 1:2). Used as a **soft tiebreak**, never a hard constraint.
- **Build level** — the single ascension-breakpoint level (default 90) at which **both** character and weapon are evaluated. See [ADR-0006](docs/adr/0006-inventory-import-and-build-level-model.md).

### Tool domain

- **Inventory** — the set of artifacts a player owns, loaded into the app.
- **Import** — populating the inventory: **GOOD file** (primary; full inventory) or **UID** (convenience; showcased characters only, via Enka.Network). See [ADR-0006](docs/adr/0006-inventory-import-and-build-level-model.md).
- **GOOD** — the community inventory-export JSON format produced by scanners.
- **Reference data** — the game "rulebook" (characters, weapons, sets, stat tables) from a frozen `genshin-db` snapshot. Never reads a player's account. See [ADR-0002](docs/adr/0002-frozen-bundled-reference-dataset.md).
- **Constraint** — a hard requirement a build must satisfy (set requirement, minimum stats, per-slot main-stat lock). Infeasible constraints → `NO_FEASIBLE_BUILD`.
- **Main-stat lock** — a constraint fixing a slot's main stat (e.g. sands = `atk_pct`).
- **Objective** — the single stat to maximise (a stat key or `crit_value`).
- **Optimiser** — the exact branch-and-bound search returning the **top-K** valid builds by objective score. Always exact, never approximate. See [ADR-0004](docs/adr/0004-exact-branch-and-bound-optimisation.md).
- **Diagnostics** — per-build data the optimiser emits: binding constraints, per-slot marginal contribution, explored/pruned counts.
- **Anti-clone cap** — the v1.0 results rule preventing near-identical builds from filling the top-K.
- **Build snapshot** — the self-contained state encoded in a **share link** (character, weapon, build level, five full artifacts, constraints, objective, meta target). See [ADR-0005](docs/adr/0005-self-contained-share-links.md).
- **genshinAdapter** — the concrete object owning all game-specific data (characters, weapons, sets, base stats, main-stat values) and the universal game baselines. The optimiser, import, and share layers import it directly. (Originally a `GameAdapter` interface for multi-game extensibility, [ADR-0008](docs/adr/0008-gameadapter-seam-for-multi-game.md); collapsed to a concrete adapter — YAGNI, single game — in [ADR-0012](docs/adr/0012-collapse-gameadapter-seam-to-concrete-adapter.md). The display-only multi-game switcher that survived ADR-0012 was later removed too — the app is explicitly Genshin-only. See [ADR-0017](docs/adr/0017-genshin-only-remove-multi-game-facade.md).)

### v1.1 domain

- **Gap analysis** — the v1.1 centerpiece: compares the best **owned** build against a **meta target** and reports feasibility gaps, numeric shortfalls, and one grounded action. No random-roll simulation. See [ADR-0007](docs/adr/0007-gap-analysis-with-frozen-meta-snapshot.md).
- **Meta target / meta recipe** — recommended set(s), main stats per slot, ER target, crit-ratio target, from a frozen KQM-sourced snapshot. Pre-fills the constraint builder; fully **overridable**. It is a build _recipe_, not a tier ranking.
- **Sample inventory** — the bundled, deterministic "Try with example gear" dataset (artifacts keyed `sample-…`) for instant, import-free demo (v1.1).
- **Sample preset** (a.k.a. **Sample build**) — one curated "Try with example gear" entry: a character plus a representative **constraint**, that loads the **sample inventory** and auto-runs the **optimiser**. Each preset demonstrates a different constraint mechanism (min stats, set requirement, main-stat lock).
- **Sample mode** — the app state where "Try with example gear" presets are offered: an empty inventory, or one containing only `sample-` artifacts. Importing real gear leaves sample mode, so a preset click can never overwrite owned artifacts.
- **Speed report** — the committed, reproducible benchmark (`docs/speed-report.md`, regenerated via `npm run bench`) showing how small a fraction of the brute-force build space the **optimiser** explores while still returning the exact optimum. See [ADR-0004](docs/adr/0004-exact-branch-and-bound-optimisation.md).

### Advisor domain

- **Roster** — the owned characters extracted from a GOOD import (`useRoster`): ownership, equipped weapon, build level, and talent levels. See [ADR-0015](docs/adr/0015-good-roster-import.md) and [ADR-0016](docs/adr/0016-per-character-advisor-curated-overlays.md).
- **Weapon inventory** — every weapon a player owns, equipped or not, with level and refinement (`useWeaponInventory`). Distinct from a roster entry's single equipped `weaponKey`. See [ADR-0016](docs/adr/0016-per-character-advisor-curated-overlays.md).
- **Roster dashboard** — the per-account view shown once a roster is imported: every owned character as a card with a build grade where curated data exists. Entry point into a **character detail**. See [ADR-0016](docs/adr/0016-per-character-advisor-curated-overlays.md).
- **Character detail** — the per-character advisor view: weapon-switch recommendation, talent-level advice, team comp, plus the unmodified **optimiser** and **gap analysis** flow. See [ADR-0016](docs/adr/0016-per-character-advisor-curated-overlays.md).
- **Weapon ranking** — a curated ordinal weapon list per character (`WEAPON_RANKINGS`). A recommendation is the best-ranked weapon the player *owns* — never computed or scored by the optimiser. See [ADR-0016](docs/adr/0016-per-character-advisor-curated-overlays.md).
- **Talent target** — a curated priority order and target level per talent slot (`TALENT_TARGETS`). Advice is a plain shortfall vs. the player's GOOD-imported talent levels — a curated-target comparison, not damage modelling ([ADR-0003](docs/adr/0003-stat-only-model-no-damage-engine.md) is unaffected). See [ADR-0016](docs/adr/0016-per-character-advisor-curated-overlays.md).
- **Team comp** — a curated 3-slot team recipe (role + ranked options) per character (`TEAM_COMPS`). The advisor shows the best comp the player's roster can field, with "you don't own X" for unfilled roles. Supersedes the earlier static `TEAMMATES` list. See [ADR-0016](docs/adr/0016-per-character-advisor-curated-overlays.md).
