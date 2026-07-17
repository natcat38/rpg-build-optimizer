# 0017. Genshin-only: remove the multi-game display facade

- Status: Accepted
- Date: 2026-07-17
- Completes: [0012](0012-collapse-gameadapter-seam-to-concrete-adapter.md)

## Context

[0012] removed the `GameAdapter` code seam as YAGNI — one implementation,
no second-game dataset ever built. What remained was a UI-only layer,
`src/game/registry.ts`'s `GAMES`/`GAME_LIST`/`getGame`, rendered through
`GameSwitcher` and an `App.tsx` "coming soon" panel: a `wuwa` entry with a
tagline, noun vocabulary, and a `coming-soon` availability flag, wired
through `useGame` (a persisted store for the selected `gameId`). It was
explicitly documented as "display-only vocabulary + theme lens... so a
second game can appear before it can be solved" — but no second game's data,
adapter, or solver was ever built, and none was planned. The switcher's only
live behavior was showing a permanently-disabled "Wuthering Waves — Soon"
option.

The app's actual direction ([0016]) is the opposite of generic multi-game
scaffolding: a Genshin-specific account advisor whose curated data
(`WEAPON_RANKINGS`, `TALENT_TARGETS`, `TEAM_COMPS`, `META_TARGETS`) is
inherently game-specific prose, not a swappable dataset behind an interface.
Carrying a facade that gestures at a game this data model doesn't serve was
pure cost with no offsetting benefit — the same reasoning [0012] already
applied to the code seam now applies to its remaining UI shadow.

## Decision

Remove the multi-game display layer entirely:

- Deleted `GameSwitcher.tsx` and its test, and the `useGame` store
  (`src/state/game.ts`) and its test.
- `src/game/registry.ts` collapses from a `GameId`/`GameDescriptor` registry
  to a single frozen constant, `GAME` (`{ name, patch, source }`), just
  enough to keep the header chip and footer attribution working without a
  lookup.
- `App.tsx` drops `isLive`/`ComingSoon` branching — the app is always the
  live Genshin flow. `OptimizePanel.tsx` and `ImportPanel.tsx` drop their
  `game.gearNoun`/`gearNounPlural` indirection in favor of the literal word
  "artifacts."

## Consequences

- Fewer files, one less store, one less indirection between UI copy and its
  source — same shape of win [0012] already banked for the code layer.
- The app is now explicitly and only a Genshin Impact tool, matching
  [`CONTEXT.md`](../../CONTEXT.md)'s "what this project is."
- Adding a second game later is a fork-level decision, not a toggle: it
  would mean re-introducing both the [0012]-removed code seam and this UI
  layer, informed by whatever that game's actual data model needs — not
  resurrecting speculative scaffolding built before either existed.

[0012]: 0012-collapse-gameadapter-seam-to-concrete-adapter.md
[0016]: 0016-per-character-advisor-curated-overlays.md
