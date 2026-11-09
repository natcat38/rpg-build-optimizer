# 0025. Static app plus one optional serverless function

- Status: Accepted
- Date: 2026-11-09
- Supersedes: [ADR-0001](0001-client-side-only-architecture.md)

## Context

[ADR-0001](0001-client-side-only-architecture.md) said the app is "100% client-side" with
"no backend". That stopped being true when [ADR-0010](0010-serverless-proxy-for-ai-explain.md)
added `api/explain.ts`, a Vercel serverless function that proxies the optional "Explain this
build" feature to Anthropic, and [ADR-0013](0013-rate-limit-ai-proxy.md) added an Upstash
Redis rate limiter in front of it. The README, `package.json` and the knowledge bundle still
claimed "Zero backend" and "100% client-side". A public-repo audit (2026-10) flagged the
contradiction.

## Decision

The product is a static single-page app plus exactly one optional serverless function.

- The optimiser, GOOD and UID imports, roster scoring, gap analysis, planning and share links
  all run in the browser. The search runs in a Web Worker. There is no database, no accounts,
  and nothing is stored server-side.
- The one exception is `api/explain.ts`. It exists only because an Anthropic API key must
  never reach the browser (ADR-0010). It validates the payload, then applies the Upstash rate
  limit (ADR-0013), then calls the model. It sends no personal data: no UID, inventory or
  share data.
- The feature is off on the public demo (`VITE_AI_ENABLED` is not set there), because it runs
  against a personal Anthropic account. The app works in full without it.
- Adding any further server component still needs a new ADR.

## Consequences

- The README, `package.json`, `CONTEXT.md` and the knowledge bundle say "static app plus one
  optional serverless function", not "zero backend".
- Everything in ADR-0001 about the rest of the app still holds: link-based sharing
  ([ADR-0005](0005-self-contained-share-links.md)), bundled reference and meta snapshots
  ([ADR-0002](0002-frozen-bundled-reference-dataset.md),
  [ADR-0007](0007-gap-analysis-with-frozen-meta-snapshot.md)), and browser-callable third-party
  APIs only.
- The deployed function has secrets (`ANTHROPIC_API_KEY`, Upstash credentials) and a cost
  surface, so it needs its own checks: `npm run api:check` loads `api/` under Node ESM in CI.
- Order of checks in the handler: method, origin, body size, payload validation, rate limit,
  API key, model call. Validation runs before the limiter so malformed requests do not spend
  rate-limit budget (this amends the ordering described in ADR-0013).
- A "live meta" or "build gallery" feature would still need a real backend and its own ADR.
