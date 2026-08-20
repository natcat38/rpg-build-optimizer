# Contributing

## Setup

Node >= 20.

```bash
npm install
npm run dev
```

## Scripts

| Script               | What it does                                             |
| -------------------- | -------------------------------------------------------- |
| `npm run dev`        | Vite dev server                                          |
| `npm test`           | Vitest suite (jsdom)                                     |
| `npm run test:watch` | Vitest in watch mode                                     |
| `npm run typecheck`  | `tsc -b` (strict, project references) + the API tsconfig |
| `npm run lint`       | ESLint                                                   |
| `npm run format`     | Prettier write                                           |
| `npm run build`      | Production build → `dist/`                               |
| `npm run build:data` | Regenerate the frozen `genshin-db` snapshot              |
| `npm run bench`      | Regenerate `docs/speed-report.md`                        |
| `npm run docs:check` | ADR numbering, knowledge-bundle freshness, dead links    |
| `npm run file-map`   | Regenerate `FILE-MAP.md`                                 |

CI runs typecheck + lint + test + build; `docs:check` and `file-map:check` guard documentation drift.

## Workflow

Write the failing test first, then the implementation. Every task should leave `npm test`, `npm run lint`, and `npm run typecheck` green before it is committed.

**Windows/CRLF gotcha:** with `core.autocrlf` on, a repo-wide `npm run format:check` fails locally on line endings while CI is green. Format only the files you changed:

```bash
npx prettier --write path/to/changed-file.tsx
```

## Data refresh

Hand-curated tables (`src/meta/metaTargets.ts`, `src/teams/comps.ts`, `src/damage/profiles.ts`, `src/meta/teammates.ts`) are transcribed from KQM guides and go stale each game patch. Follow [`docs/runbooks/patch-refresh.md`](docs/runbooks/patch-refresh.md) when a patch lands.

## Issues

Issues and PRDs are tracked as GitHub issues via the `gh` CLI — conventions in [`docs/agents/issue-tracker.md`](docs/agents/issue-tracker.md), triage vocabulary in [`docs/agents/triage-labels.md`](docs/agents/triage-labels.md).

## AI "Explain this build" — local setup

The button calls `api/explain.ts`, a Vercel serverless function that proxies Claude (`claude-haiku-4-5`) so the Anthropic key never reaches the browser bundle ([ADR-0010](docs/adr/0010-serverless-proxy-for-ai-explain.md)).

- `ANTHROPIC_API_KEY` — server-side Vercel project env var.
- `VITE_AI_ENABLED=true` — build-time flag that renders the button. Keep it off until the key is deployed.
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — from an [Upstash](https://upstash.com) Redis database, enabling per-IP rate limiting (10 requests/60s, [ADR-0013](docs/adr/0013-rate-limit-ai-proxy.md)). Without them the endpoint still works, just unthrottled.
- Set a spend cap in the Anthropic console — it is the feature's hard cost ceiling.

Run `vercel dev` (not `npm run dev`) locally to serve the `/api` function.
