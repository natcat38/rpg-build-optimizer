import type { Objective, StatKey, StatVec } from '../game/types';
import { isStatKey } from '../game/types';

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

function isObjective(x: unknown): x is Objective {
  return x === 'crit_value' || isStatKey(x);
}

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
