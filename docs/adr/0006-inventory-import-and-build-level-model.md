# 0006. Inventory import and build-level model

- Status: Accepted
- Date: 2026-06-06

## Context

The player's own gear ("what I own") is separate from reference data ([0002]). It can enter two ways, and the level state at which builds are evaluated must be defined and round-trip through share links ([0005]).

## Decision

**Import (two paths, not equal):**

- **GOOD file = primary.** A community scanner export (GOOD format, version-guarded) carrying the player's **entire** inventory. Pure local parse, no external dependency.
- **UID via Enka.Network = convenience/demo.** Fetches artifacts on **showcased characters only** (~40 artifacts max). Enka is CORS-friendly so it fits [0001]. Kept for its live-API portfolio value and the "watch it pull my characters" moment, with hard "showcased only" expectation-setting and guarding so an outage/empty-showcase can never crash the app.

Re-imports de-dupe against existing artifacts by content hash.

**Build level:** a single **ascension-breakpoint dropdown (1/20/40/50/60/70/80/90, default 90)** that drives **both character and weapon** (a player levels them together). It is **stored in the share URL**. No continuous slider — only breakpoint levels `genshin-db` publishes, so no curve interpolation.

**Artifacts** are evaluated at their **current owned level** in v1.0. A "treat all as +20" projection toggle is deferred to v1.1 (it also enriches gap analysis).

## Consequences

- For real optimisation the player uses a GOOD file; UID is a convenience/demo, complemented by the v1.1 "Try with example gear" sample inventory.
- One level control instead of separate character/weapon controls halves the UI and matches reality.
- The +20 projection, when added, is the stepping stone toward gap analysis's theoretical-ceiling ideas ([0007]).
