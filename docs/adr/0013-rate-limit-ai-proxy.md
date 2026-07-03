# 0013. Per-IP rate limiting on the AI explain proxy

- Status: Accepted
- Date: 2026-07-03

## Context

[ADR-0010](0010-serverless-proxy-for-ai-explain.md) added `api/explain.ts` as a
serverless proxy so the Anthropic API key stays server-side, and explicitly
rejected IP rate limiting via a KV store at the time: "more robust but adds
infrastructure; out of scope for a portfolio demo (revisit if abuse
appears)." Its cost/abuse guard was strict payload validation + a capped
`max_tokens` + a spend cap set manually in the Anthropic console.

A second-pass audit of the whole repo flagged that this leaves the endpoint's
only cost ceiling as a human noticing a spend spike after the fact — the
`content-length` guard is trivially bypassed (a missing/non-numeric header
reads as `0`), and nothing stops a scripted client from hammering the paid
call at line rate. Unlike the KV-for-rate-limiting call in ADR-0010, this
isn't speculative infrastructure for a hypothetical need — a public POST
endpoint that calls a metered API with no per-caller throttle is a live gap,
not a "revisit if abuse appears" one.

## Decision

Add a per-IP sliding-window rate limit (10 requests / 60s) in front of the
Anthropic call, using [Upstash Redis](https://upstash.com) (REST-based,
serverless-friendly — no persistent connection, fits the existing
one-function-at-a-time proxy model) via `@upstash/ratelimit` +
`@upstash/redis`.

- `api/_ratelimit.ts` — `checkRateLimit(identifier)`, called in
  `api/explain.ts` right after the method/size guards and before the
  `ANTHROPIC_API_KEY`/payload checks (cheapest rejection first).
- Identifier is the first address in `x-forwarded-for` (Vercel-set),
  falling back to `'unknown'` if absent.
- **Graceful no-op when unconfigured**: if `UPSTASH_REDIS_REST_URL` or
  `UPSTASH_REDIS_REST_TOKEN` is unset, `checkRateLimit` always allows the
  request (with a `console.warn`) rather than failing closed — mirrors the
  existing `ANTHROPIC_API_KEY` gate, so `vercel dev`, CI, and this repo's
  test suite need no Upstash account to keep working.
- Over the limit → `429 { error: 'rate limited' }`.

## Consequences

- Two new runtime dependencies (`@upstash/ratelimit`, `@upstash/redis`) —
  the first stateful infrastructure this client-side-only app (ADR-0001)
  depends on, scoped entirely to the existing `api/explain.ts` carve-out.
  ADR-0001's client-side architecture is otherwise unchanged.
- Deploying the rate limit requires provisioning an Upstash Redis database
  and setting its two env vars on Vercel; until then, the endpoint runs
  exactly as it did under ADR-0010 (spend-cap-only).
- The spend cap in the Anthropic console remains the hard backstop — the
  rate limit bounds request _rate_, not worst-case total spend.

## Rejected alternatives

- **In-memory counter** — serverless functions are stateless and
  multi-instance; a per-instance counter doesn't bound aggregate request
  rate across instances.
- **Origin/Referer check only** — cheaper (no new dependency) but trivially
  spoofed by a direct scripted client; doesn't bound cost the way a request
  counter does.
