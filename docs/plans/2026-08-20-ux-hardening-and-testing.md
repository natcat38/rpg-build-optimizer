# UX hardening & full-path testing plan

Executor: Opus. Scope: make every good/bad path either work or show a clear, accessible error — never a white screen, hang, or `NaN` on screen. Audit date 2026-08-20, branch `phase-endgame-1-damage-engine`.

## What's already fine (don't touch)

- Worker errors fully handled: `protocol.ts` catches search errors, `optimizeClient.ts` handles `onerror`/`onmessageerror`/clone failures, `App.tsx:222-244` surfaces `optimizeError` as a `role="alert"` banner.
- GOOD import, UID fetch, share-link decode, clipboard copy, AI explain: all try/caught with rendered alerts.
- Empty inventory / infeasible search: button-disable + friendly "no build satisfies constraints" message.
- Unit coverage is ~1:1 (43 test files / 49 source files, Vitest + RTL). No E2E exists.
- Stale-run race is guarded by `runToken` (`App.tsx:215-243`).

## Phase 1 — fixes (each with a Vitest test, TDD)

1. **React error boundary (biggest gap).** No boundary exists anywhere; any render-time throw = white screen. Add ONE class component `ErrorBoundary` in `src/components/ErrorBoundary.tsx` wrapping `<App/>` in `src/main.tsx`. Fallback: a `role="alert"` message + "Reload" button. No library, no per-section boundaries. Test: child that throws → fallback renders.

2. **localStorage persist crash.** `state/inventory.ts`, `state/roster.ts`, `state/game.ts` use Zustand `persist` with raw `localStorage` — throws in Safari private mode / quota exceeded, and no boundary catches store init. Wrap once: a shared safe-storage adapter (try/catch around getItem/setItem, fall back to in-memory no-op) passed as `storage` to all three stores. Test: storage that throws → store still works, no exception.

3. **NaN/Infinity rendering.** `damage/formula.ts` has no NaN guards; pathological stats render literal "NaN"/"Infinity" in `BuildCard`/`Results`. Fix at the display seam, not the math: one `formatScore(n)` helper (`Number.isFinite(n) ? … : '—'`) used by `Results.tsx`/`BuildCard.tsx`. Also clamp `crit_dmg` to `>= 0` in `evCritMult` (`formula.ts:50-53`) to match the existing `crit_rate` clamp. Test: non-finite score renders "—"; negative crit_dmg clamps.

4. **UID import error messages.** `import/uid.ts` already distinguishes `NETWORK` / `NOT_FOUND` / `NO_SHOWCASE` but `ImportPanel.tsx:66-70` collapses them into one generic alert. Map each code to a specific message ("Couldn't reach Enka — check your connection", "UID not found", "No artifacts on showcase — set characters public in-game"). WCAG 3.3.1: errors must be described, not generic. Test: each error code → its message.

Skipped deliberately (YAGNI, note in commit): cancel button for in-flight runs (searches are fast; `runToken` already discards stale results — add only if a real search ever exceeds ~2s), minER input validation (bad values already resolve to handled infeasible result), Playwright E2E suite (Vitest+RTL covers the same seams; add only if regressions start slipping past unit tests).

## Phase 2 — full-path verification in the browser (no code, checklist)

Run `preview_start` with the `launch.json` dev server (port 5173), then walk every path using the Browser pane tools. After EACH step: `read_console_messages` (onlyErrors) — zero uncaught errors is the pass condition.

Good paths:

- Sample gear preset → optimize → results render, share link copies.
- Manual artifact entry (ArtifactForm) → optimize.
- GOOD file import (make a small valid fixture JSON, upload) → optimize.
- Meta build button → optimize. Switch objective to avg_damage where a profile exists.
- Share link round-trip: copy `?b=` URL → open in new navigation → build hydrates.
- Game switcher → ComingSoon renders for non-live game.

Bad paths:

- Upload a non-JSON file and a valid-JSON-wrong-schema file → specific alert, no console error.
- UID fetch: bogus UID → "not found" message (from Phase 1 fix). Block network (devtools offline not available — use an unroutable state or skip) → NETWORK message.
- Malformed share link (`?b=garbage`) → "couldn't be read" banner.
- Empty inventory → Optimise disabled with hint.
- Constraints that can't be met (extreme minER) → infeasible message suggesting relaxation.
- Force a render throw temporarily (dev-only) → error boundary fallback appears, reload recovers. Revert the throw.

Accessibility pass (via `read_page` accessibility tree + keyboard):

- Every input in OptimizePanel/ArtifactForm/ImportPanel has a programmatic label (name in a11y tree).
- All error messages appear in the tree as alerts (they use `role="alert"` — verify each new one from Phase 1 does too).
- Keyboard-only: tab through import → form → optimize → results; Optimise reachable and activatable via Enter/Space; visible focus ring (screenshot check).
- 200% zoom / mobile preset (`resize_window`): no horizontal overflow, results readable.

## Phase 3 — wrap up

- `npm run test`, `typecheck`, `lint` all green. Note: local `format:check` fails on CRLF while CI is green — check only changed files.
- Screenshot proof of: error boundary fallback, one bad-path alert, results page.
- Commit per fix; do not amend.
