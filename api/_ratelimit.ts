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

// The unconfigured-limiter warning is a startup condition, not a per-request
// one: latch it so a dark limiter is still visible in the logs without
// emitting a line on every single request.
let warnedUnconfigured = false;

/**
 * Rate limit for the paid /api/explain call (ADR-0013): a per-IP window and a
 * global budget cap, both of which must pass.
 *
 * When the Upstash env vars are unset this is a graceful no-op mirroring the
 * ANTHROPIC_API_KEY gate, so vercel dev / CI / tests without a KV store still
 * work — except in production, where an unconfigured limiter means the paid
 * endpoint has no cost ceiling at all, so it fails closed instead.
 */
export async function checkRateLimit(
  identifier: string,
): Promise<RateLimitResult> {
  const limiters = getRatelimits();
  if (!limiters) {
    if (process.env.VERCEL_ENV === 'production') return { success: false };
    if (!warnedUnconfigured) {
      warnedUnconfigured = true;
      console.warn(
        'api/explain: UPSTASH_REDIS_REST_URL/TOKEN not set — rate limiting is disabled.',
      );
    }
    return { success: true };
  }
  const [perIp, global] = await Promise.all([
    limiters.perIp.limit(identifier),
    limiters.global.limit(GLOBAL_IDENTIFIER),
  ]);
  return { success: perIp.success && global.success };
}
