import type { StatKey } from '../game/types';
import { objectiveLabel, statLabel } from '../ui/labels';
import type { ExplainPayload } from './explainPayload';

/**
 * Build the system + user prompt for the explanation call. Pure and
 * unit-tested so the wording/grounding is verifiable without hitting the API.
 */
export function buildExplainPrompt(p: ExplainPayload): {
  system: string;
  user: string;
} {
  const system = [
    'You are a concise Genshin Impact artifact build coach.',
    "You are given the numbers for a player's best build and a gap report comparing it to a meta target.",
    'Ground every statement ONLY in the numbers provided — never invent stats, sets, or game mechanics.',
    'Reply in 2-3 sentences of plain English. No markdown, no bullet points, no headings.',
    'Cover: (1) why this build is strong for the stated objective, (2) the main tradeoff, and (3) the single most useful next step (defer to the provided "Next action" when present).',
  ].join(' ');

  const stats = (Object.entries(p.totals) as [StatKey, number][])
    .map(([k, v]) => `${statLabel(k)} ${Math.round(v)}`)
    .join(', ');

  const lines: string[] = [
    `Character: ${p.characterKey}`,
    `Objective: maximise ${objectiveLabel(p.objective)}`,
    `Best build stats: ${stats || '(no feasible build found)'}`,
  ];
  if (p.gap.feasibility.length)
    lines.push(`What's missing: ${p.gap.feasibility.join('; ')}`);
  if (p.gap.shortfalls.length)
    lines.push(`Shortfalls: ${p.gap.shortfalls.join('; ')}`);
  if (p.gap.action) lines.push(`Next action: ${p.gap.action}`);

  return { system, user: lines.join('\n') };
}
