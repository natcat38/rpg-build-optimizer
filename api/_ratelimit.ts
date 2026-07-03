import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const MAX_REQUESTS = 10;
const WINDOW = '60 s';

export interface RateLimitResult {
  success: boolean;
}

/**
 * Per-IP rate limit for the paid /api/explain call (ADR-0013). Allows the
 * request when Upstash env vars are unset — a graceful no-op mirroring the
 * ANTHROPIC_API_KEY gate, so vercel dev / CI / tests without a KV store
 * still work.
 */
export async function checkRateLimit(
  identifier: string,
): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    console.warn(
      'api/explain: UPSTASH_REDIS_REST_URL/TOKEN not set — rate limiting is disabled.',
    );
    return { success: true };
  }
  const ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(MAX_REQUESTS, WINDOW),
    prefix: 'explain-ratelimit',
  });
  const { success } = await ratelimit.limit(identifier);
  return { success };
}
