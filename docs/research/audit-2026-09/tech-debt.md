# Technical debt audit — 2026-09-06

Scope: whole repo (`src/`, `api/`, `scripts/`, tests, tooling, `.github/`, deps).
No fixes applied — findings only.

## Baseline check results

| Check | Result |
|---|---|
| `npm run lint` | Pass — 0 errors, **2 warnings** (see TD-1) |
| `npm run typecheck` | Pass — 0 errors (`tsc -b` + api + scripts projects) |
| `npm test` | Pass — 58 files, 613 tests, 0 failures, 0 skipped |
| Coverage (`coverage/coverage-summary.json`) | 96.0% lines / 87.8% branches / 94.7% functions overall — no enforced threshold (see TD-6) |
| `npm audit` | 0 vulnerabilities in production deps; 9 in **dev-only** transitive deps (1 low, 2 moderate, 5 high, 1 critical) — see TD-4 |
| `npm outdated` | 19 packages behind `latest`, all patch/minor except `@vercel/node`, `tailwindcss`, `typescript`, `vitest`/`@vitest/coverage-v8` majors — see TD-3 |

This is an unusually clean codebase: no `TODO`/`FIXME`/`HACK`, no `@ts-ignore`/`@ts-expect-error`, no `.skip`/`.only` tests, no stray `console.*` outside error boundaries/dev-only components, CI already gates docs consistency, bundle size, and benchmark drift. The debt found below is genuinely the remainder, not a first pass.

## Prioritized findings

Priority = (Impact + Risk) × (6 − Effort), each scored 1–5 (Effort inverted: 1=trivial, 5=very hard).

| # | Item | Category | File(s) | Impact | Risk | Effort | Priority | Recommended action |
|---|---|---|---|---|---|---|---|---|
| TD-1 | `landing.tsx` mixes component exports with constants (`STEPS`, `LOCKED_HINT`) and a hook (`useScrollSpy`), breaking React Fast Refresh (2 ESLint warnings) | Code debt | `src/components/landing.tsx:130,147` | 2 | 1 | 1 | 15 | Split `STEPS`/`LOCKED_HINT`/`useScrollSpy` into a sibling module (e.g. `landing.constants.ts`, `useScrollSpy.ts`); re-export if needed. Mechanical, ~15 min. |
| TD-2 | `CHANGELOG.md` frozen at the `v1.0.0` entry while 14 commits (5 features/fixes, incl. #89 "grade currently-equipped builds", #87/#88 CI/dev-server fixes, #83/#54 dependency bumps) have landed on `main` since | Documentation debt | `CHANGELOG.md` | 3 | 2 | 1 | 20 | Add an `[Unreleased]` section and backfill entries for commits since `22b7080`/v1.0.0, or cut a new tagged version. Cheap, prevents the file going further stale. |
| TD-3 | 19 packages behind `latest` per `npm outdated`; three are majors: `@vercel/node` (10.0.0 → 12.0.1), `tailwindcss` (3.4.19 → 4.x), `typescript` (~6.0.3 → 7.0.2), plus `vitest`/`@vitest/coverage-v8` (4.1.x → 5.0.0) | Dependency debt | `package.json` | 3 | 2 | 3 | 15 | Patch/minor bumps (eslint, postcss, autoprefixer, `@types/*`, tsx, globals, typescript-eslint) are low-risk — batch via Dependabot as usual. Majors (Tailwind 4, TS 7, Vitest 5) need dedicated PRs with manual verification; don't bundle with patch bumps. |
| TD-4 | `npm audit` reports 9 vulnerabilities (incl. 1 critical: node-tar PAX parsing; several high: undici SSRF/DoS/smuggling) — both are **dev-only transitive deps** (`tar` via `@vercel/node → @vercel/nft → @mapbox/node-pre-gyp`; `undici` via `@vercel/node` and `jsdom`), not shipped in the production bundle or `api/` runtime | Dependency debt | `package-lock.json` (transitive) | 2 | 2 | 2 | 16 | Not exploitable in production (dev/CI-only code paths), but still worth `npm audit fix` where non-breaking, and re-check after the `@vercel/node` major bump lands (TD-3) since it may pull in a patched `@vercel/nft`. Low urgency, cheap to verify. |
| TD-5 | Local `node_modules` on this machine has stale installs for `@vercel/node` (5.10.1 installed vs. 10.0.0 pinned in `package.json`/`package-lock.json`) and `jsdom` (29.1.1 vs. 30.0.1 pinned) — i.e. `npm ci`/`npm install` hasn't been re-run locally since those bumps merged | Environment/tooling debt | local `node_modules` (not committed) | 1 | 2 | 1 | 15 | Not a repo defect — CI installs fresh via `npm ci` and is green. Purely a local dev-machine hygiene note: run `npm ci` to pick up the pinned versions before relying on local test/build output matching CI. |
| TD-6 | No coverage floor enforced — `vite.config.ts`'s `test.coverage` block has no `thresholds`, so `npm run test:coverage` (a CI gate) can only ever fail on a crash, never on a coverage regression | Test debt | `vite.config.ts` | 3 | 3 | 2 | 24 | Add `thresholds` (e.g. lines/functions ~90%, branches ~85%, matching current levels minus a small margin) to `test.coverage` in `vite.config.ts` so CI actually gates regressions instead of only reporting them. |
| TD-7 | Below-average branch coverage in a few UI files: `Drawer.tsx` (50.0% branches), `ArtifactForm.tsx` (66.7%), `advise.ts` (63.6%), `ArtifactForm`/`landing.tsx` (~68%) | Test debt | `src/components/ui/Drawer.tsx`, `src/components/ArtifactForm.tsx`, `src/invest/advise.ts`, `src/components/landing.tsx` | 2 | 2 | 3 | 12 | Add targeted tests for the untested branches (likely edge cases: drawer dismiss/keyboard paths, form validation error states, advise.ts boundary conditions) before or alongside TD-6's threshold work, so the new floor doesn't need to be set artificially low. |
| TD-8 | A handful of large, dense modules concentrate logic: `src/teams/comps.ts` (1097 lines, curated comp database), `src/meta/teammates.ts` (751), `src/optimizer/search.ts` (733), `src/damage/profiles.ts` (690), `src/meta/metaTargets.ts` (647) | Code/architecture debt | `src/teams/comps.ts`, `src/meta/teammates.ts`, `src/optimizer/search.ts`, `src/damage/profiles.ts`, `src/meta/metaTargets.ts` | 2 | 1 | 4 | 6 | Mostly curated *data* tables (comps, teammates, meta targets), not tangled logic — size alone isn't urgent debt here. `search.ts` (733 lines, exact branch-and-bound core, ADR-0004) is the one worth a closer look if it ever needs a second contributor; consider splitting bound/pruning logic from the search loop if it grows further. No action needed now beyond awareness. |
| TD-9 | `.github/workflows/coverage-badge.yml` force-pushes to the `badges` branch on every push to `main` (`git push --force origin badges-new:badges`) | Infrastructure debt | `.github/workflows/coverage-badge.yml` | 1 | 2 | 2 | 12 | Low risk since `badges` is a disposable, single-purpose orphan branch with no other consumers, but a force-push in CI is worth a one-line comment noting why it's safe (or switching to `git push -f` only after fetch-and-compare) so a future editor doesn't copy the pattern somewhere riskier. |
| TD-10 | Root-level `AGENTS.md` (133 bytes) exists alongside `CLAUDE.md`/`docs/agents/*` — worth confirming it isn't a second, drifting source of truth for agent instructions | Documentation debt | `AGENTS.md` | 1 | 1 | 1 | 10 | Quick read-through to confirm it just points at `CLAUDE.md`/`docs/agents/` rather than duplicating instructions; consolidate if it has drifted. |

## Non-findings (checked, clean)

- No secrets or stray large binaries tracked in git; `genshinData_GOOD_*.json`, `inventory_kamera/`, `.vercel/`, `.worktrees/`, `.playwright-mcp/` are all correctly gitignored and untracked.
- No disabled/skipped tests, no `.only` focus left in place.
- No `any`/`@ts-ignore`/`@ts-expect-error` escape hatches found in `src/`.
- CI (`ci.yml`) already gates: typecheck, lint, docs consistency (`docs:check`), benchmark drift (`bench:check`), format, coverage run, build, bundle-size drift (`size:check`), and generated-dataset freshness — a notably thorough gate set already in place.
- `npm audit --omit=dev` (production dependency tree only) reports 0 vulnerabilities.

## Suggested phased remediation (alongside feature work)

1. **This sprint (cheap, high leverage):** TD-1 (split `landing.tsx`), TD-2 (backfill CHANGELOG), TD-10 (verify `AGENTS.md`).
2. **Next sprint:** TD-6 (coverage thresholds) paired with TD-7 (fill the specific gaps first so the new floor reflects real coverage, not an artificially low one).
3. **Ongoing/opportunistic:** TD-3 patch/minor dependency bumps via existing Dependabot flow; majors (Tailwind 4, TS 7, Vitest 5, `@vercel/node` 12) as their own reviewed PRs when there's a natural reason to touch that area.
4. **Low priority / awareness only:** TD-4 (dev-only audit findings, re-check after TD-3's `@vercel/node` bump), TD-5 (local-machine note, not a repo action), TD-8 (large curated-data files, no split needed now), TD-9 (document the force-push, don't need to remove it).
