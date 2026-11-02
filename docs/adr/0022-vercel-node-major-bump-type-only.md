# 0022. Take `@vercel/node` major bumps on CI alone, because it is a type-only import

- Status: Accepted
- Date: 2026-11-02

## Context

Dependabot #134 proposed `@vercel/node` 12.0.3 to 24.0.3, and after a rebase it became
29.0.0. That is several major versions at once. It was the only major bump open in the
repo during the 2026-11-02 open-items sweep. The minor/patch group (#142, 17 updates)
merged the same day.

The package is a devDependency, and the code uses it in two places only, both type
imports: `import type { VercelRequest, VercelResponse } from '@vercel/node'` in
`api/explain.ts` and `api/explain.test.ts`. The function runtime comes from Vercel's own
platform, not from this package's version.

## Decision

Merge #134 once CI passes on the rebased branch. Here that means typecheck plus unit tests
(`verify`), the OKF `validate` job, and a successful Vercel preview deploy. No manual check
on top.

Future `@vercel/node` majors follow the same rule while the import stays type-only.

## Consequences

- If `api/` ever imports a runtime value from `@vercel/node` (not just types), this rule
  stops holding. Majors would then need a manual check of the `/api/explain` route on a
  preview deploy.
- #134 merged on 2026-11-02 with all five checks green.
