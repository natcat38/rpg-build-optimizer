# 0011. Elemental DMG modelled as one fungible stat key

- Status: Accepted
- Date: 2026-06-21

## Context

Genshin has seven element-specific DMG% goblet flavours (Pyro, Hydro, Electro, Cryo, Anemo, Geo, Dendro) plus Physical DMG. A character deals damage in a single element, so in-game only the matching goblet is useful.

We could model each element as its own stat key. That would let the optimiser know a Pyro goblet is worthless to a Hydro character — but it multiplies the stat model sevenfold and pushes element-matching logic (which character deals which element, which bonus is relevant) into the core scorer. That is exactly the kind of game-specific detail the `GameAdapter` seam ([0008]) and the stat-only model ([0003]) are meant to keep out of the engine.

## Decision

Collapse all elemental DMG% into a **single fungible `elemental_dmg` stat key at import time**. Both importers do this and discard the original element: the GOOD parser maps `pyro_dmg_` … `dendro_dmg_` → `elemental_dmg` (`src/import/good.ts`), and the UID/Enka parser maps `FIGHT_PROP_*_ADD_HURT` → `elemental_dmg` (`src/import/uid.ts`). Physical DMG stays separate as `physical_dmg`.

Scoring is therefore **element-agnostic**: there is no element-matching filter anywhere in the optimiser or the adapter. `elemental_dmg` set bonuses (e.g. Archaic Petra 2pc) are already pre-resolved to this same key, so no special-casing is needed.

## Consequences

- The tool cannot distinguish an off-element goblet from an on-element one. It can surface a technically useless goblet (e.g. a Pyro DMG goblet for a Hydro character) if its sub-stat rolls are better. This is accepted for v1: a player optimising one character feeds in the goblets relevant to that character, so the case is rare in practice.
- The simplification keeps the stat model small and the optimiser free of per-character element logic, consistent with [0003] and [0008].
- Re-introducing per-element keys later would be a breaking change to the stat model, both importers, the diagnostics/labels, and `CONTEXT.md` — recording the decision now so a future reader understands the off-element behaviour is intentional, not a missing filter.

[0003]: 0003-stat-only-model-no-damage-engine.md
[0008]: 0008-gameadapter-seam-for-multi-game.md
