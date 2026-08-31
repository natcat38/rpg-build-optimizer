# Code Verification Report

Generated 2026-08-29 via `npm run build`, `npm run test:coverage`, and source inspection. No source files were modified.

## A. Single ~561 KB main chunk, no code-splitting

**Verdict: CONFIRMED**

Fresh `npm run build` output:

```
dist/assets/optimize.worker-DWZgB7PQ.js  145.58 kB
dist/assets/index-DSSY3f-d.css            32.57 kB │ gzip:   6.82 kB
dist/assets/index-BQ4tG8Jz.js            573.46 kB │ gzip: 159.87 kB
```

Exact byte sizes (`stat`): `index-BQ4tG8Jz.js` = 573,465 bytes (≈ 560 KiB, matches the "~561 KB" claim when measured in KiB rather than KB), gzip 159.87 kB. Vite itself warns: "Some chunks are larger than 500 kB after minification... Consider Using dynamic import()".

`src/components/App.tsx:16-42` statically imports all the named panels:

- `ImportPanel` (`./ImportPanel`)
- `RosterView` (`../roster/RosterView`, which itself statically imports `CharacterDetail`)
- `TeamsView` (`../teams/TeamsView`)
- `PlanView` (`../plan/PlanView`)
- `GapSection` (`./GapSection`, which statically imports `ExplainBuild`)

`grep -rn "React.lazy\|import(" src --include=*.tsx --include=*.ts` (excluding `*.test.*`) returned **zero matches** — no `React.lazy` and no dynamic `import()` anywhere in `src/`.

## B. data.generated.json (~328 KB) duplicated into both the main bundle and the worker bundle

**Verdict: CONFIRMED**

- `src/game/genshin/data.generated.json` is 321 KB raw (`ls -la`: 321K), imported directly in `src/game/genshin/adapter.ts:18` (`import rawData from './data.generated.json'`).
- Import chain into the main bundle: `App.tsx:42` → `genshinAdapter` (direct import).
- Import chain into the worker bundle: `src/workers/optimize.worker.ts` → `protocol.ts` → `src/optimizer/search.ts` → `src/optimizer/context.ts:60` (`genshinAdapter.weapon(...)`) → `data.generated.json`.
- Verified duplication with distinctive strings unique to this JSON file, each present exactly once in **both** compiled chunks:
  - `"939.14"` (a specific character base-stat value) — 1 match in `index-BQ4tG8Jz.js`, 1 match in `optimize.worker-DWZgB7PQ.js`.
  - `"baseByLevel"` — 1 match in each bundle.
  - `"weaponType"` — 116 occurrences in the source JSON; 136 occurrences in the main bundle, 119 in the worker bundle (both roughly matching the full per-character dataset size, i.e. the whole dataset is present in both, not a partial subset).

So the ~321 KB dataset is compiled into both `index-BQ4tG8Jz.js` (573 KB) and `optimize.worker-DWZgB7PQ.js` (145 KB after minification/compaction), i.e. real duplication, though after minification the compiled representation is smaller than the raw 321 KB JSON on disk (worker chunk is only 145 KB total, meaning the dataset compacts significantly under minification — the "~328 KB" figure in the claim should be understood as source size, not compiled size).

## C. `formatReduction()` unused in `src/`, App.tsx claim is inaccurate

**Verdict: CONFIRMED**

`src/optimizer/benchmark.ts:14-21`:

```ts
/** Shared "N× fewer evaluations" formatting — used by both the doc-generating
 *  benchmark script (scripts/benchmark.ts) and the browser hero demo
 *  (src/components/App.tsx) so the same concept reads consistently everywhere. */
export function formatReduction(r: number): string {
  if (r < 1) return `${r.toFixed(2)}×`;
  if (r < 10) return `${r.toFixed(1)}×`;
  return `${Math.round(r).toLocaleString('en-US')}×`;
}
```

`grep -rn "formatReduction" src scripts` shows only two hits: its own definition in `src/optimizer/benchmark.ts:17`, and its actual use in `scripts/benchmark.ts:4,30`. There is **no reference to `formatReduction` anywhere else in `src/`**, and specifically not in `src/components/App.tsx` — the TSDoc's claim that `App.tsx` uses it is false.

Checked `App.tsx` for its own duplicated "N× fewer" / reduction-formatting logic (`grep -n "toFixed.*×\|toLocaleString\|reductionFactor\|fewer\|evaluations"`): **no matches**. App.tsx does not display a reduction stat at all and has no duplicated formatting logic — the TSDoc claim is simply stale/wrong rather than App.tsx having drifted into its own copy.

## D. App.tsx ~710 lines mixing landing components with app shell

**Verdict: CONFIRMED**

`wc -l src/components/App.tsx` → **710 lines**.

Components/functions defined in the file (`grep -n "^function \|^export function"`):

- `Section` — line 51
- `ThesisHero` (`{ game }: { game: GameDescriptor }`) — line 98
- `SolvedHero` (`{ hero }: { hero: HeroExample }`) — line 115
- `useScrollSpy` (`(ids: string[]): string | null`) — line 176
- `SharedBuildBanner` (`{ request }: { request: OptimizeRequest }`) — line 224
- `App` (the exported app-shell component) — line 250

All five landing/marketing-page helpers (`Section`, `ThesisHero`, `SolvedHero`, `useScrollSpy`, `SharedBuildBanner`) plus the app shell (`App`) live in the same 710-line file, confirming the mixed-concerns claim.

## E. Coverage % and absence of size-limit/bundlewatch config

**Verdict: CONFIRMED**

`npm run test:coverage` (`vitest run --coverage`) summary:

```
Statements   : 94.95% ( 2465/2596 )
Branches     : 88.12% ( 1715/1946 )
Functions    : 95.94% ( 591/616 )
Lines        : 96.3% ( 2135/2217 )
```

So the accurate badge figures are **Lines 96.3%**, **Statements 94.95%** (branches 88.12%, functions 95.94%).

Size-limit / bundlewatch config check:

- `grep -n "size-limit\|bundlewatch\|bundlesize" package.json` → no matches.
- `package.json` `"scripts"` block (lines 9-24) contains no size-check script — only `dev`, `build`, `preview`, `test`, `test:watch`, `test:coverage`, `lint`, `format`, `format:check`, `typecheck`, `build:data`, `bench`, `docs:check`, `bench:check`.
- No `size-limit` or `bundlewatch` config files found anywhere outside `node_modules`.
- `.github/` contains only `dependabot.yml`, `workflows/ci.yml`, `workflows/okf.yml` — `grep -n "size-limit\|bundlewatch\|bundlesize\|chunkSizeWarningLimit"` across `package.json` and both workflow files returned no matches.

Confirmed: there is no bundle-size gate (size-limit, bundlewatch, or a custom `chunkSizeWarningLimit` override) anywhere in the repo's config or CI.

## Summary Table

| Claim                                                                                       | Verdict   |
| ------------------------------------------------------------------------------------------- | --------- |
| A. 573 KB (≈561 KiB) single main chunk, no code-splitting                                   | CONFIRMED |
| B. data.generated.json duplicated into main + worker bundles                                | CONFIRMED |
| C. formatReduction unused in src/, App.tsx TSDoc claim false, no duplicate logic in App.tsx | CONFIRMED |
| D. App.tsx is 710 lines mixing landing + app-shell components                               | CONFIRMED |
| E. Coverage 96.3% lines / 94.95% statements; no size-limit/bundlewatch config               | CONFIRMED |
