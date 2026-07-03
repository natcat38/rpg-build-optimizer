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
  Redis: vi.fn().mockImplementation((config: unknown) => ({ config })),
}));

import { checkRateLimit } from './_ratelimit';

const ORIGINAL_ENV = process.env;
beforeEach(() => {
  limit.mockReset();
  RatelimitCtor.mockReset();
});
afterEach(() => {
  process.env = ORIGINAL_ENV;
});

describe('checkRateLimit', () => {
  it('allows the request when Upstash env vars are unset (graceful no-op)', async () => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    const result = await checkRateLimit('1.2.3.4');

    expect(result).toEqual({ success: true });
    expect(RatelimitCtor).not.toHaveBeenCalled();
  });

  it('allows the request when only one of the two env vars is set', async () => {
    process.env = {
      ...ORIGINAL_ENV,
      UPSTASH_REDIS_REST_URL: 'https://example.upstash.io',
    };
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    const result = await checkRateLimit('1.2.3.4');

    expect(result).toEqual({ success: true });
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
});
