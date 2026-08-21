/**
 * The serverless AI-explain proxy (`/api/explain`, Vercel functions): rate
 * limiting by client IP plus a global budget cap via Upstash Redis, and the
 * handler that forwards a validated explain payload to Anthropic and returns
 * the explanation.
 * @packageDocumentation
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const MAX_REQUESTS = 10;
const WINDOW = '60 s';

// The per-IP limit bounds one caller's rate; it does nothing about an attacker
// with many IPs. This second window is keyed on a single fixed bucket, so it
// caps worst-case spend for the whole endpoint no matter how the traffic is
// spread across sources.
const GLOBAL_MAX_REQUESTS = 500;
const GLOBAL_WINDOW = '1 h';
const GLOBAL_IDENTIFIER = 'global';

export interface RateLimitResult {
  success: boolean;
  /**
   * Why the request was refused, when the refusal is not "you went over the
   * limit". `'not-configured'` means the limiter itself is missing in
   * production — a server-side misconfiguration, not caller behaviour, so the
   * handler answers 503 rather than 429.
   */
  reason?: 'not-configured';
}

interface Limiters {
  perIp: Ratelimit;
  global: Ratelimit;
}

// Reuse the limiters across invocations on a warm serverless instance rather
// than rebuilding Ratelimit+Redis (and their connection state) on every
// request. Keyed on the env pair so a credential change — or a test swapping
// process.env — rebuilds instead of serving a stale client.
let cached: ({ key: string } & Limiters) | null = null;

function getRatelimits(): Limiters | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const key = `${url}\n${token}`;
  if (cached?.key !== key) {
    const redis = new Redis({ url, token });
    cached = {
      key,
      perIp: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(MAX_REQUESTS, WINDOW),
        prefix: 'explain-ratelimit',
      }),
      global: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(GLOBAL_MAX_REQUESTS, GLOBAL_WINDOW),
        prefix: 'explain-ratelimit-global',
      }),
    };
  }
  return cached;
}

// The unconfigured-limiter message is a startup condition, not a per-request
// one: latch it so a dark limiter is still visible in the logs without
// emitting a line on every single request.
let warnedUnconfigured = false;

/**
 * Rate limit for the paid /api/explain call (ADR-0013): a per-IP window and a
 * global budget cap, both of which must pass. The per-IP window is consumed
 * first and short-circuits, so a rejected caller never spends global budget.
 *
 * When the Upstash env vars are unset this is a graceful no-op mirroring the
 * ANTHROPIC_API_KEY gate, so vercel dev / CI / tests without a KV store still
 * work — except in production, where an unconfigured limiter means the paid
 * endpoint has no cost ceiling at all, so it fails closed instead, reporting
 * `reason: 'not-configured'` so the handler can answer 503 (a server fault)
 * rather than 429 (the caller's fault).
 */
export async function checkRateLimit(
  identifier: string,
): Promise<RateLimitResult> {
  const limiters = getRatelimits();
  if (!limiters) {
    const production = process.env.VERCEL_ENV === 'production';
    if (!warnedUnconfigured) {
      warnedUnconfigured = true;
      const message =
        'api/explain: UPSTASH_REDIS_REST_URL/TOKEN not set — rate limiting is disabled.';
      // Log before returning either way: in production this is the only signal
      // that the endpoint is refusing every request because of a missing env
      // var rather than because of traffic.
      if (production) console.error(`${message} Refusing requests.`);
      else console.warn(message);
    }
    return production
      ? { success: false, reason: 'not-configured' }
      : { success: true };
  }
  // Sequential, not Promise.all: a request already refused by the per-IP window
  // must not consume the shared global budget, or a single hostile IP could
  // drain the endpoint's hourly allowance for everyone else.
  const perIp = await limiters.perIp.limit(identifier);
  if (!perIp.success) return { success: false };
  const global = await limiters.global.limit(GLOBAL_IDENTIFIER);
  return { success: global.success };
}
