import type { Objective, StatKey, StatVec } from '../game/types';
import { isStatKey, isObjective } from '../game/types';
import { objectiveLabel, statLabel } from '../labels';
import type { GapReport } from '../meta/gap';

// ---------------------------------------------------------------------------
// ExplainPayload — the validated request shape sent to the AI proxy
// ---------------------------------------------------------------------------

export interface ExplainPayload {
  characterKey: string;
  objective: Objective;
  totals: StatVec;
  gap: {
    feasibility: string[];
    shortfalls: string[];
    action: string | null;
  };
}

const MAX_KEY_LEN = 64;
const MAX_TOTALS = 20;
const STAT_MIN = -10_000;
const STAT_MAX = 100_000;
const MAX_LINES = 10;
const MAX_LINE_LEN = 300;

function isShortStringArray(x: unknown): x is string[] {
  return (
    Array.isArray(x) &&
    x.length <= MAX_LINES &&
    x.every((s) => typeof s === 'string' && s.length <= MAX_LINE_LEN)
  );
}

function parseTotals(x: unknown): StatVec | null {
  if (typeof x !== 'object' || x === null) return null;
  const entries = Object.entries(x as Record<string, unknown>);
  if (entries.length > MAX_TOTALS) return null;
  const out: StatVec = {};
  for (const [k, v] of entries) {
    if (!isStatKey(k)) return null;
    if (typeof v !== 'number' || !Number.isFinite(v)) return null;
    if (v < STAT_MIN || v > STAT_MAX) return null;
    out[k as StatKey] = v;
  }
  return out;
}

/**
 * Strict structural validation of an untrusted /api/explain request body.
 * Returns the typed payload, or null if anything is malformed/oversized.
 * This is the cost/abuse guard: it bounds the prompt the proxy will ever build.
 */
export function parseExplainPayload(input: unknown): ExplainPayload | null {
  if (typeof input !== 'object' || input === null) return null;
  const o = input as Record<string, unknown>;

  if (
    typeof o.characterKey !== 'string' ||
    o.characterKey.length === 0 ||
    o.characterKey.length > MAX_KEY_LEN
  )
    return null;
  if (!isObjective(o.objective)) return null;

  const totals = parseTotals(o.totals);
  if (totals === null) return null;

  if (typeof o.gap !== 'object' || o.gap === null) return null;
  const g = o.gap as Record<string, unknown>;
  if (!isShortStringArray(g.feasibility)) return null;
  if (!isShortStringArray(g.shortfalls)) return null;
  if (
    !(
      g.action === null ||
      (typeof g.action === 'string' && g.action.length <= MAX_LINE_LEN)
    )
  )
    return null;

  return {
    characterKey: o.characterKey,
    objective: o.objective,
    totals,
    gap: {
      feasibility: g.feasibility,
      shortfalls: g.shortfalls,
      action: g.action as string | null,
    },
  };
}

// ---------------------------------------------------------------------------
// buildExplainPrompt — pure prompt builder, no API calls
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// toExplainPayload — assembly helper
// ---------------------------------------------------------------------------

/**
 * Assemble the AI payload from a build + its gap report. Single source of truth
 * for the shape, so ExplainBuild no longer hand-mirrors GapReport fields
 * (which silently drifts when GapReport gains one).
 *
 * `characterKey` is taken from the explicit arg (the request character), not
 * `report.characterKey`. Caller is responsible for a bounds-valid `totals` —
 * `parseExplainPayload` at the API boundary is the authoritative guard.
 */
export function toExplainPayload(
  characterKey: string,
  objective: Objective,
  totals: StatVec,
  report: GapReport,
): ExplainPayload {
  return {
    characterKey,
    objective,
    totals,
    gap: {
      feasibility: report.feasibility,
      shortfalls: report.shortfalls,
      action: report.action,
    },
  };
}
