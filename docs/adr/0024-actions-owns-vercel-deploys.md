# 0024. GitHub Actions owns Vercel deploys; Vercel's git integration is off

- Status: Accepted
- Date: 2026-11-09

## Context

Vercel's git integration built every pushed branch on its own, and nothing reported
the result. Since 2026-09-07 there were 14 failed Vercel deployments. All of them were
Preview builds of the `badges` branch, which `coverage-badge.yml` force-pushes on every
push to `main`. That branch is an orphan holding one `coverage.json` and no
`package.json`, so every build died with `vite: command not found`. Production builds
were fine, but a failed production build would have gone unnoticed the same way: the
deploy was not part of CI, so no check turned red.

## Decision

- The `deploy` job in `ci.yml` runs after `verify` passes. It uses the pinned Vercel
  CLI (`pull`, `build`, `deploy --prebuilt`): production on push to `main`, preview on
  same-repo pull requests. Dependabot and fork PRs are skipped because they cannot read
  repo secrets.
- The job fails loudly if `VERCEL_TOKEN`, `VERCEL_ORG_ID` or `VERCEL_PROJECT_ID` is
  missing, so a broken deploy shows as a red check.
- `vercel.json` sets `git.deploymentEnabled: false`, so Vercel no longer builds pushes
  itself.
- Vercel reads `vercel.json` from the pushed commit, so `coverage-badge.yml` also
  writes `{"git":{"deploymentEnabled":false}}` into the `badges` branch.

## Consequences

- A deploy failure is now a failed GitHub check on the commit or PR, with the deploy
  URL in the job summary.
- Deploys need three repo secrets. Until they exist, the `deploy` job fails on every run.
- `deploy` is not a required check in the branch ruleset. Only `verify` gates merges,
  so a Vercel outage does not block merging.
- `lighthouse.yml` runs on push to `main` against production and can still race the
  deploy. Moving it after `deploy` is a possible follow-up.
