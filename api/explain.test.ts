import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Mock the Anthropic SDK before the handler imports it (vi.hoisted keeps the
// spy accessible from the hoisted vi.mock factory).
const { create } = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock('@anthropic-ai/sdk', () => ({
  default: class {
    messages = { create };
  },
}));

// Mock the rate limiter so the handler's own behaviour (429 vs pass-through)
// is tested independent of real Upstash wiring, which _ratelimit.test.ts
// already covers.
const { checkRateLimit } = vi.hoisted(() => ({ checkRateLimit: vi.fn() }));
vi.mock('./_ratelimit', () => ({ checkRateLimit }));

import handler from './explain';

function makeRes() {
  return {
    statusCode: 0 as number,
    payload: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(body: unknown) {
      this.payload = body;
      return this;
    },
  };
}

function validBody() {
  return {
    characterKey: 'furina',
    objective: 'crit_value',
    totals: { crit_rate: 70, crit_dmg: 180 },
    gap: { feasibility: [], shortfalls: [], action: null },
  };
}

function makeReq(
  o: { method?: string; headers?: Record<string, string>; body?: unknown } = {},
): VercelRequest {
  return {
    method: o.method ?? 'POST',
    headers: o.headers ?? {},
    body: 'body' in o ? o.body : validBody(),
  } as unknown as VercelRequest;
}

const ORIGINAL_ENV = process.env;
beforeEach(() => {
  create.mockReset();
  checkRateLimit.mockReset();
  checkRateLimit.mockResolvedValue({ success: true });
  process.env = { ...ORIGINAL_ENV, ANTHROPIC_API_KEY: 'test-key' };
});
afterEach(() => {
  process.env = ORIGINAL_ENV;
});

describe('api/explain handler', () => {
  it('405s on a non-POST method', async () => {
    const res = makeRes();
    await handler(makeReq({ method: 'GET' }), res as unknown as VercelResponse);
    expect(res.statusCode).toBe(405);
    expect(create).not.toHaveBeenCalled();
  });

  it('413s on an oversized body before calling the API', async () => {
    const res = makeRes();
    await handler(
      makeReq({ headers: { 'content-length': '20000' } }),
      res as unknown as VercelResponse,
    );
    expect(res.statusCode).toBe(413);
    expect(create).not.toHaveBeenCalled();
  });

  it('does not 413 at exactly the content-length boundary (16000)', async () => {
    create.mockResolvedValue({ content: [{ type: 'text', text: 'ok' }] });
    const res = makeRes();
    await handler(
      makeReq({ headers: { 'content-length': '16000' } }),
      res as unknown as VercelResponse,
    );
    expect(res.statusCode).not.toBe(413);
    expect(res.statusCode).toBe(200);
  });

  // The content-length guard is a cheap pre-parse fast path, not the real
  // size backstop — a missing or non-numeric header reads as 0 (Number(x) ??
  // 0), so parseExplainPayload's own field-level caps (MAX_KEY_LEN etc.) are
  // what actually bound an oversized/adversarial body in these cases.
  it('rejects an oversized body via parseExplainPayload when content-length is absent', async () => {
    const res = makeRes();
    await handler(
      makeReq({
        headers: {},
        body: { ...validBody(), characterKey: 'x'.repeat(1000) },
      }),
      res as unknown as VercelResponse,
    );
    expect(res.statusCode).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it('rejects an oversized body via parseExplainPayload when content-length is non-numeric', async () => {
    const res = makeRes();
    await handler(
      makeReq({
        headers: { 'content-length': 'abc' },
        body: { ...validBody(), characterKey: 'x'.repeat(1000) },
      }),
      res as unknown as VercelResponse,
    );
    expect(res.statusCode).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it('429s when the rate limiter reports the limit exceeded, before calling the API', async () => {
    checkRateLimit.mockResolvedValue({ success: false });
    const res = makeRes();
    await handler(makeReq(), res as unknown as VercelResponse);
    expect(res.statusCode).toBe(429);
    expect(create).not.toHaveBeenCalled();
  });

  it('checks the rate limit using the first x-forwarded-for address', async () => {
    const res = makeRes();
    await handler(
      makeReq({ headers: { 'x-forwarded-for': '203.0.113.5, 10.0.0.1' } }),
      res as unknown as VercelResponse,
    );
    expect(checkRateLimit).toHaveBeenCalledWith('203.0.113.5');
  });

  it('still checks a rate limit when x-forwarded-for is absent', async () => {
    create.mockResolvedValue({ content: [{ type: 'text', text: 'ok' }] });
    const res = makeRes();
    await handler(makeReq(), res as unknown as VercelResponse);
    expect(checkRateLimit).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(200);
  });

  it('500s (unavailable) when the API key is missing', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const res = makeRes();
    await handler(makeReq(), res as unknown as VercelResponse);
    expect(res.statusCode).toBe(500);
    expect(res.payload).toEqual({ error: 'unavailable' });
    expect(create).not.toHaveBeenCalled();
  });

  it('400s on an invalid payload', async () => {
    const res = makeRes();
    await handler(
      makeReq({ body: { nope: true } }),
      res as unknown as VercelResponse,
    );
    expect(res.statusCode).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it('200s with the concatenated text blocks (thinking blocks ignored)', async () => {
    create.mockResolvedValue({
      content: [
        { type: 'text', text: 'Strong crit build. ' },
        { type: 'thinking', text: 'internal reasoning' },
        { type: 'text', text: 'Farm Golden Troupe.' },
      ],
    });
    const res = makeRes();
    await handler(makeReq(), res as unknown as VercelResponse);
    expect(res.statusCode).toBe(200);
    expect(res.payload).toEqual({
      explanation: 'Strong crit build. Farm Golden Troupe.',
    });
  });

  it('500s without leaking upstream detail when the API throws', async () => {
    create.mockRejectedValue(new Error('leak sk-secret-123'));
    const res = makeRes();
    await handler(makeReq(), res as unknown as VercelResponse);
    expect(res.statusCode).toBe(500);
    expect(res.payload).toEqual({ error: 'unavailable' });
    expect(JSON.stringify(res.payload)).not.toContain('sk-secret');
  });
});
