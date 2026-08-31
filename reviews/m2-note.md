# M2 (Phase D): dedupe `data.generated.json` out of the optimize worker bundle

## Root cause (traced, not assumed)

`optimize.worker.ts` -> `protocol.ts` -> `optimizer/search.ts` -> `optimizer/diagnostics.ts`
imported `setRequirementLabel` from `../labels` (the adapter-*having* half of
the label module) just to render one binding-constraint string ("Set
requirement: 4pc ..."). `labels.ts` imports `genshinAdapter`, which statically
imports `data.generated.json` (~321 KB) — so that one import dragged the whole
dataset into the worker bundle, duplicating what the main bundle already
carries via `optimizer/context.ts` -> `genshinAdapter`.

This is the exact failure mode `labels-core.ts` already has a docblock and a
tripwire test for (`src/labels-core.test.ts`), previously fixed for
`api/explain.ts`'s serverless bundle the same way. Neither `optimizeClient.ts`
nor `context.ts` (the real, heavy adapter users — `baseStats`, `weapon`,
`sets()`) are imported by the worker at all: `buildContext()` already runs on
the main thread, and only its plain, structured-clone-safe `OptimizeContext`
result crosses into the worker. So the "postMessage the parsed data at
startup" fix from the plan wasn't needed — the worker was never entangled
with the adapter's data loading, only with this one label helper.

## Fix applied (the "preferred fix" outcome, via the narrower real cause)

- `src/labels-core.ts`: added adapter-free `formatSetNameFrom(setKey, names)`
  and `setRequirementLabelFrom(r, names)`, taking a `setKey -> displayName`
  lookup table instead of calling the adapter directly.
- `src/labels.ts`: `formatSetName`/`setRequirementLabel` are now thin wrappers
  over the new core functions, backed by a `SET_NAMES` map built once from
  `genshinAdapter.sets()`. No behavior change for existing (UI) callers.
- `src/game/types.ts`: `OptimizeContext` gained an optional `setNames?:
  Record<string, string>` field — populated once on the main thread.
- `src/optimizer/context.ts`: `buildContext()` now fills `setNames` in the
  same loop that already builds `setBonuses` from `genshinAdapter.sets()`.
- `src/optimizer/diagnostics.ts`: now imports from `../labels-core` (not
  `../labels`) and calls `setRequirementLabelFrom(req.constraints.setRequirement,
  ctx.setNames)`. This is the line that removes the worker's transitive path
  to the adapter.

Net effect: the worker still renders real set display names (via `ctx.setNames`,
structured-cloned in with the rest of the context it already receives), but
never statically imports `genshinAdapter` or `data.generated.json` itself.

## Tests

- `src/labels-core.test.ts`: added an `optimize worker bundle boundary`
  describe block, mirroring the existing serverless-bundle tripwire — asserts
  `diagnostics.ts`, `search.ts`, and `workers/protocol.ts` contain no
  `from '../../genshin/adapter'`-style import and no `from '../labels'`
  import.
- `src/optimizer/diagnostics.test.ts`: updated the set-requirement-formatting
  test to pass `setNames` on its hand-built `ctx` (previously relied on the
  live adapter via `../labels`); added a case for the no-match fallback
  (spaced-out raw key).
- `src/optimizer/context.test.ts`: asserts `buildContext()` actually
  populates `setNames` from the adapter.

## Verification

- `npm run typecheck` — passes.
- Targeted vitest (`--no-file-parallelism`; the default pool was timing out
  in this sandbox unrelated to this change): `labels-core.test.ts`,
  `labels.test.ts`, `optimizer/*.test.ts`, `workers/*.test.ts`,
  `game/genshin/adapter.test.ts`, `ai/*` — 122+ tests, all passing.
- Did not run `npm run build` (excluded from this task) — relied on a
  hand-written import-graph trace confirming `adapter.ts`/`data.generated.json`
  are no longer reachable from `optimize.worker.ts` once `import type`-only
  edges are excluded, plus the new tripwire test that encodes the same check
  the plan for M3 could otherwise catch retroactively at the checked-in size
  baseline.

No Vite `manualChunks` change and no ADR were needed — the fallback paths in
the plan weren't reached.
