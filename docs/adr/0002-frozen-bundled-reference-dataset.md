# 0002. Frozen, bundled reference dataset from genshin-db

- Status: Accepted
- Date: 2026-06-06

## Context

The optimiser needs game **reference data** ("the rulebook"): every character's base stats, weapons, artifact sets, and the main-/sub-stat value tables. This is distinct from the player's own inventory (see [0006]). Candidate sources include the raw `GenshinData` dump (comprehensive, legally grey, huge), Enka's store, and `genshin-db` (npm, normalised, permissive licence). Genshin also ships new content roughly every three weeks, so any snapshot ages.

## Decision

Use **`genshin-db`** as the source. A one-time **build script** extracts only what the optimiser needs into a compact, **bundled JSON snapshot** committed to the repo. The snapshot is **frozen** and shown with a visible **"Data: patch X.Y"** label; there is no live refresh in Phase 1. Source is attributed in `DATA_LICENSE`/NOTICE.

`genshin-db` supplies **reference data only** — it contains no build recommendations and never reads a player's account.

## Consequences

- Fits the client-only architecture ([0001]): no live data dependency at runtime.
- Staleness is handled honestly via the patch label; refreshing is a manual re-run of the build script.
- We only extract stats at the **ascension-breakpoint levels** `genshin-db` publishes (see [0006]'s build-level model) — no curve interpolation work.
- A future automated refresh (or live source) is additive and does not affect the optimiser.
