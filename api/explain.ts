import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';
import {
  parseExplainPayload,
  buildExplainPrompt,
} from '../src/ai/explainShared';
import { checkRateLimit } from './_ratelimit';

function clientIp(req: VercelRequest): string {
  // Prefer x-real-ip: Vercel's edge sets it to the true connecting IP, which a
  // client can't forge. The leftmost x-forwarded-for entry is client-supplied
  // and trivially spoofed to rotate rate-limit buckets, so it's only a
  // last-resort fallback (non-Vercel/local, where the limiter is a no-op anyway).
  const real = req.headers['x-real-ip'];
  if (typeof real === 'string' && real.trim()) return real.trim();
  const xff = req.headers['x-forwarded-for'];
  const first = Array.isArray(xff) ? xff[0] : xff;
  return first?.split(',')[0]?.trim() || 'unknown';
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  // Fail fast on oversized bodies before parsing / calling the paid API. The
  // valid payload is tiny (bounded by parseExplainPayload); 16 KB is generous
  // headroom. Vercel's 4.5 MB platform default is the only cap otherwise.
  if (Number(req.headers['content-length'] ?? 0) > 16_000) {
    res.status(413).json({ error: 'payload too large' });
    return;
  }

  // Per-IP cost/abuse guard ahead of the parse/key checks (ADR-0013) —
  // cheapest rejection first.
  const { success } = await checkRateLimit(clientIp(req));
  if (!success) {
    res.status(429).json({ error: 'rate limited' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'unavailable' });
    return;
  }

  const payload = parseExplainPayload(req.body);
  if (!payload) {
    res.status(400).json({ error: 'invalid payload' });
    return;
  }

  try {
    const { system, user } = buildExplainPrompt(payload);
    const client = new Anthropic({ apiKey });
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 200, // caps cost/output at the ~2-3 sentences buildExplainPrompt asks for
      system,
      messages: [{ role: 'user', content: user }],
    });
    const explanation = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .trim();
    res.status(200).json({ explanation });
  } catch {
    // Never leak upstream error details or key material.
    res.status(500).json({ error: 'unavailable' });
  }
}
