import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';
import {
  parseExplainPayload,
  buildExplainPrompt,
} from '../src/ai/explainShared';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
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
      max_tokens: 200,
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
