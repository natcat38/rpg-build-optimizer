# 0007. Gap analysis with a frozen, overridable meta snapshot

- Status: Accepted
- Date: 2026-06-06

## Context

Beyond "best build from what I own," the owner wants "what am I missing, and what should I farm." This **gap analysis** is the v1.1 centerpiece. It needs a target to measure against. A target could be (a) the user's own stated constraints, or (b) a "meta" build recipe — but there is no clean, licensed, live, machine-readable meta API, and live data would break [0001].

## Decision

**Gap analysis is the v1.1 centerpiece** (it supersedes the standalone "explain this result" panel, which becomes part of it). It compares the best **owned** build against a **target**.

The target is a **meta build recipe** (recommended set(s), main stat per slot, ER target, crit-ratio target), supplied as a **frozen, bundled snapshot** extracted from a public authoritative source — **KQM primary** — labeled **"Meta data: patch X.Y"**, attributed in `DATA_LICENSE`. The meta recipe is a **one-click default that pre-fills the constraint/target builder**; every field is **user-overridable**. It is the _build recipe_, not a tier ranking.

Depth is **Levels 1 + 2 + light 3**:

1. **Feasibility gaps** — e.g. "you own no ATK% Sands," "only 2 Emblem pieces."
2. **Numeric shortfall** — e.g. "best build hits ER 152% vs. 160% target."
3. **One grounded action** — e.g. "your Goblet contributes least; replacing it helps most" — based on provable facts, **not** random substat-roll simulation.

**Level 4** (simulated "perfect" build ceiling) and roll simulation are explicitly **excluded** to avoid false precision.

## Consequences

- Stays 100% client-side ([0001]); dodges CORS/ToS/uptime; maintenance is a bounded periodic data refresh, not a live integration.
- Stays character-agnostic and honest — the meta is an optional overlay, never an opaque "trust me" foundation.
- Depends on the optimiser emitting per-build diagnostics from day one ([0004]); gap analysis is then mostly a presentation layer.
- A "live meta" via a serverless proxy to a source like Akasha.cv is a far-future, additive idea only.
