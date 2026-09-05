# Ponytail audit — whole-repo, 2026-09-06

Scope: `src/`, `api/`, `scripts/`, root config files, `package.json`
dependencies. Findings only — no fixes applied. Ranked biggest cut first.

## Summary

This repo is unusually lean for its size. It already carries evidence of prior
ponytail passes: ADR-0012 documents killing a `GameAdapter` interface for
being YAGNI, `scripts/check-size.ts` has an inline `// ponytail:` comment
noting a scoring heuristic instead of over-building a simulator, and most
modules carry comments explaining *why* the simpler option was rejected
(`safeStorage.ts`, `_ratelimit.ts`, `Drawer.tsx`). Almost every file read
during this audit was tight, single-purpose, and already used the smallest
mechanism that solves the stated problem (hand-rolled `cn()` instead of
`clsx`, native `matchMedia`/`scrollIntoView` instead of a library, native
`fetch` for Enka imports). Only one clear finding survived scrutiny.

## Findings

1. `yagni:` `src/game/registry.ts` — a `GameId` union with exactly one member
   (`'genshin'`), a `GAMES: Record<GameId, GameDescriptor>` with exactly one
   entry, and a `getGame(id)` function called from exactly one call site
   (`src/components/App.tsx:75`, always as the literal `getGame('genshin')`).
   This is the same shape of speculative multi-game flexibility that
   ADR-0012 already removed once (the `GameAdapter` interface, killed for
   having "exactly one implementation" and an unused `id` field) — it has
   just re-grown at the display-copy layer instead of the adapter layer.
   Replacement: delete `registry.ts`; inline the six `GameDescriptor` fields
   (`name`, `tagline`, `patch`, `gearNoun`, `gearNounPlural`, `setNoun`,
   `source`) as local constants in `App.tsx` and `landing.tsx` (which already
   imports the type only to describe its own prop). If/when a second game is
   actually built, ADR-0012's own "Consequences" section already accepts
   paying this cost then, not before.
   Confidence: medium — the file is explicitly documented as a deliberate
   seam for a second game (comment cites ADR-0008/ADR-0012), so this is a
   judgment call on whether that documented intent still justifies the
   indirection given ADR-0012's own precedent of removing an equivalent seam.
   Estimated LOC saved: ~35 (registry.ts is 39 lines; net after inlining
   ~2-3 lines at the two call sites is roughly -35).
   [src/game/registry.ts, src/components/App.tsx:75, src/components/landing.tsx:10,65]

## Also checked, no finding

- `src/components/ui/*` (Badge, Callout, Marker, Meter, Segmented, Combobox,
  Drawer, cn.ts, tone.ts, elementTone.ts) — each is small, single-purpose,
  and the shared `TONE`/`ELEMENT_TONE` tables are already the dedup point
  Badge/Marker/Callout share. `cn()` is 3 lines and already smaller than
  importing `clsx`. `Combobox` is verbose (289 lines) but every non-trivial
  line carries a comment justifying real accessibility/perf behavior
  (`contentVisibility`, keyboard-vs-pointer nav tracking) that a native
  `<select>`/`<datalist>` can't reproduce (search-as-you-type + hint text) —
  not a finding.
- `vaul` dependency (`src/components/ui/Drawer.tsx`) — single consumer, but
  it buys focus trap, scroll lock, esc-close and swipe-to-dismiss gestures;
  reimplementing that natively is a real cost, not padding.
- `@anthropic-ai/sdk` (`api/explain.ts`) — used for exactly one
  `messages.create` call. A raw `fetch` to the Messages API would drop a
  dependency, but the SDK also gives typed response blocks and is the
  officially supported client for a paid, security-sensitive endpoint,
  so this reads as a defensible trade rather than bloat.
- `src/labels.ts` / `src/labels-core.ts` split — looks like a duplicate-file
  smell at first glance, but the split is load-bearing: `labels-core.ts` is
  the adapter-free half that `api/explain.ts`'s bundle must not statically
  pull the dataset adapter into (comment explains this explicitly), and
  `labels.ts` re-exports the core so app callers only ever import one path.
  Not a finding.
- `src/state/safeStorage.ts` — the try/catch-with-latch pattern looks like
  hand-rolled resilience, but it's solving a real Safari-private-mode /
  quota-exceeded failure mode that `localStorage` itself doesn't guard
  against; no smaller stdlib equivalent exists.
- `api/_ratelimit.ts` — two `Ratelimit` instances (per-IP + global budget)
  could look like one-too-many, but the comment states the actual threat
  model (single-IP window doesn't bound a distributed attacker) and the
  global window is a distinct, load-bearing check. Not a finding.
- Four `tsconfig.*.json` files (app/node/api/scripts) — a standard
  project-references split for a Vite app that also type-checks a Node
  `api/` and `scripts/` tree with different `lib`/`globals`. Consolidating
  would blur the browser/Node boundary `noUncheckedSideEffectImports` and
  `types: ["node"]` currently enforce; not flagged.
- `scripts/build-dataset.ts`, `check-docs.ts`, `check-bench.ts`,
  `check-size.ts` — each is a single-purpose CI gate with an inline comment
  stating what drift it catches that existing CI doesn't; no simpler stdlib
  or off-the-shelf tool covers ADR-numbering contiguity, bench regression,
  or gzip-budget drift for this repo's specific artifacts.
- `dist/`, `coverage/`, `.vercel/`, `.playwright-mcp/`, `inventory_kamera/`,
  `genshinData_GOOD_*.json` — all present on disk but confirmed via
  `git ls-files` to be untracked (covered by `.gitignore`). Local clutter,
  not repo bloat; out of scope for a repo audit.
- `package.json` dependencies — `genshin-db` is correctly a devDependency
  (build-time only, per ADR-0002's frozen-snapshot decision); no
  stdlib-replaceable or unused runtime dependency found among
  `@upstash/ratelimit`, `@upstash/redis`, `react`, `react-dom`, `vaul`,
  `zustand`, `@anthropic-ai/sdk`.
- `src/game/types.ts`, `src/optimizer/diagnostics.ts`, `src/invest/*`,
  `src/teams/comps.ts`, `src/meta/grade.ts` — plain data/function modules,
  no factories, no single-implementation interfaces beyond the one flagged
  above.

## Net

net: -35 lines, -0 deps possible.

Everything else scanned reads as intentionally minimal, with the reasoning
for each non-obvious choice left in a comment at the point of decision. This
is close to "Lean already. Ship." with one small exception.
