import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the Upstash SDKs before the module under test imports them (same
// vi.hoisted pattern as explain.test.ts's Anthropic SDK mock).
const { limit, RatelimitCtor, slidingWindow } = vi.hoisted(() => ({
  limit: vi.fn(),
  RatelimitCtor: vi.fn(),
  slidingWindow: vi.fn(),
}));
vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: Object.assign(
    function (config: unknown) {
      RatelimitCtor(config);
      return { limit };
    },
    { slidingWindow },
  ),
}));
vi.mock('@upstash/redis', () => ({
  Redis: vi.fn().mockImplementation(function (config: unknown) {
    return { config };
  }),
}));

import { checkRateLimit } from './_ratelimit';

const ORIGINAL_ENV = process.env;
beforeEach(() => {
  limit.mockReset();
  RatelimitCtor.mockReset();
  slidingWindow.mockReset();
});
afterEach(() => {
  process.env = ORIGINAL_ENV;
});

describe('checkRateLimit', () => {
  // Runs first: the warn latch is module-level, so this is the only test that
  // can observe the first (and only) warning.
  it('allows the request when Upstash env vars are unset (graceful no-op) and warns exactly once', async () => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.VERCEL_ENV;
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = await checkRateLimit('1.2.3.4');
    const second = await checkRateLimit('1.2.3.4');

    expect(result).toEqual({ success: true });
    expect(second).toEqual({ success: true });
    expect(RatelimitCtor).not.toHaveBeenCalled();
    // The fail-open no-op must stay observable — outside production this warn
    // is the only signal the limiter went dark — but it's a startup condition,
    // not a per-request one, so it must not fire on every call.
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it('allows the request when only one of the two env vars is set', async () => {
    process.env = {
      ...ORIGINAL_ENV,
      UPSTASH_REDIS_REST_URL: 'https://example.upstash.io',
    };
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.VERCEL_ENV;

    const result = await checkRateLimit('1.2.3.4');

    expect(result).toEqual({ success: true });
    expect(RatelimitCtor).not.toHaveBeenCalled();
  });

  it('fails closed in production when the limiter is unconfigured', async () => {
    process.env = { ...ORIGINAL_ENV, VERCEL_ENV: 'production' };
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    const result = await checkRateLimit('1.2.3.4');

    expect(result).toEqual({ success: false });
    expect(RatelimitCtor).not.toHaveBeenCalled();
  });

  it('allows the request through when the configured limiter reports under the limit', async () => {
    process.env = {
      ...ORIGINAL_ENV,
      UPSTASH_REDIS_REST_URL: 'https://example.upstash.io',
      UPSTASH_REDIS_REST_TOKEN: 'test-token',
    };
    limit.mockResolvedValue({ success: true, remaining: 9 });

    const result = await checkRateLimit('1.2.3.4');

    expect(result).toEqual({ success: true });
    expect(limit).toHaveBeenCalledWith('1.2.3.4');
  });

  it('blocks the request once the configured limiter reports the limit exceeded', async () => {
    process.env = {
      ...ORIGINAL_ENV,
      UPSTASH_REDIS_REST_URL: 'https://example.upstash.io',
      UPSTASH_REDIS_REST_TOKEN: 'test-token',
    };
    limit.mockResolvedValue({ success: false, remaining: 0 });

    const result = await checkRateLimit('1.2.3.4');

    expect(result).toEqual({ success: false });
  });

  it('blocks the request when the global budget cap is exhausted, even under the per-IP limit', async () => {
    process.env = {
      ...ORIGINAL_ENV,
      UPSTASH_REDIS_REST_URL: 'https://example.upstash.io',
      UPSTASH_REDIS_REST_TOKEN: 'test-token',
    };
    limit.mockImplementation(async (id: string) => ({
      success: id !== 'global',
    }));

    const result = await checkRateLimit('1.2.3.4');

    expect(result).toEqual({ success: false });
    expect(limit).toHaveBeenCalledWith('global');
  });

  it('reuses the limiters across calls with the same env (built once, not per request)', async () => {
    // Unique creds so this asserts fresh construction regardless of earlier tests.
    process.env = {
      ...ORIGINAL_ENV,
      UPSTASH_REDIS_REST_URL: 'https://reuse.upstash.io',
      UPSTASH_REDIS_REST_TOKEN: 'reuse-token',
    };
    limit.mockResolvedValue({ success: true, remaining: 9 });

    await checkRateLimit('1.2.3.4');
    await checkRateLimit('5.6.7.8');

    // Two limiters (per-IP + global) built once, then two limit calls each.
    expect(RatelimitCtor).toHaveBeenCalledTimes(2);
    expect(limit).toHaveBeenCalledTimes(4);
    expect(slidingWindow).toHaveBeenCalledWith(10, '60 s');
    expect(slidingWindow).toHaveBeenCalledWith(500, '1 h');
  });
});
