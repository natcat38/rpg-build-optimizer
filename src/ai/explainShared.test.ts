import { describe, it, expect } from 'vitest';
import {
  parseExplainPayload,
  buildExplainPrompt,
  toExplainPayload,
} from './explainShared';
import type { ExplainPayload } from './explainShared';
import type { GapReport } from '../meta/gap';

// ---------------------------------------------------------------------------
// parseExplainPayload (ported from explainPayload.test.ts)
// ---------------------------------------------------------------------------

function valid() {
  return {
    characterKey: 'furina',
    objective: 'crit_value',
    totals: { hp: 30000, crit_rate: 70, crit_dmg: 180, er_pct: 160 },
    gap: {
      feasibility: ['You own 0 Golden Troupe pieces — need 4.'],
      shortfalls: ['Best build reaches ER 150% vs 200% target.'],
      action: 'Farm Golden Troupe.',
    },
  };
}

describe('parseExplainPayload', () => {
  it('accepts a well-formed payload', () => {
    expect(parseExplainPayload(valid())).toEqual(valid());
  });

  it('rejects a non-object', () => {
    expect(parseExplainPayload(null)).toBeNull();
    expect(parseExplainPayload('x')).toBeNull();
  });

  it('rejects an unknown objective', () => {
    expect(parseExplainPayload({ ...valid(), objective: 'haste' })).toBeNull();
  });

  it('rejects an unknown stat key in totals', () => {
    expect(parseExplainPayload({ ...valid(), totals: { luck: 5 } })).toBeNull();
  });

  it('rejects a non-finite or out-of-bounds stat value', () => {
    expect(
      parseExplainPayload({ ...valid(), totals: { hp: Infinity } }),
    ).toBeNull();
    expect(parseExplainPayload({ ...valid(), totals: { hp: 1e9 } })).toBeNull();
  });

  it('rejects oversized gap arrays and strings', () => {
    const longList = Array.from({ length: 11 }, () => 'x');
    expect(
      parseExplainPayload({
        ...valid(),
        gap: { feasibility: longList, shortfalls: [], action: null },
      }),
    ).toBeNull();
    expect(
      parseExplainPayload({
        ...valid(),
        gap: { feasibility: ['a'.repeat(301)], shortfalls: [], action: null },
      }),
    ).toBeNull();
  });

  it('rejects a missing characterKey or over-long one', () => {
    const { characterKey: _omit, ...rest } = valid(); // eslint-disable-line @typescript-eslint/no-unused-vars
    expect(parseExplainPayload(rest)).toBeNull();
    expect(
      parseExplainPayload({ ...valid(), characterKey: 'x'.repeat(65) }),
    ).toBeNull();
  });

  it('accepts a null action and empty totals (infeasible build)', () => {
    const p = {
      ...valid(),
      totals: {},
      gap: { feasibility: [], shortfalls: [], action: null },
    };
    expect(parseExplainPayload(p)).toEqual(p);
  });
});

// ---------------------------------------------------------------------------
// buildExplainPrompt (ported from explainPrompt.test.ts)
// ---------------------------------------------------------------------------

const payload: ExplainPayload = {
  characterKey: 'furina',
  objective: 'crit_value',
  totals: { hp: 30000, crit_rate: 70, crit_dmg: 180, er_pct: 160 },
  gap: {
    feasibility: [],
    shortfalls: ['Best build reaches ER 160% vs 200% target.'],
    action: 'Upgrade your Sands.',
  },
};

describe('buildExplainPrompt', () => {
  it('system prompt states the hard constraints', () => {
    const { system } = buildExplainPrompt(payload);
    expect(system).toMatch(/2-3 sentences/i);
    expect(system).toMatch(/only/i); // grounded only in provided numbers
    expect(system).toMatch(/no markdown/i);
  });

  it('user prompt includes the grounding numbers and gap lines', () => {
    const { user } = buildExplainPrompt(payload);
    expect(user).toContain('furina');
    expect(user).toContain('Crit Value'); // objective label
    expect(user).toContain('180'); // a stat value
    expect(user).toContain('vs 200% target');
    expect(user).toContain('Upgrade your Sands.');
  });

  it('handles an infeasible build (empty totals)', () => {
    const { user } = buildExplainPrompt({
      ...payload,
      totals: {},
      gap: { feasibility: ['no Golden Troupe'], shortfalls: [], action: null },
    });
    expect(user).toMatch(/no feasible build/i);
    expect(user).toContain('no Golden Troupe');
  });

  it('contains no PII field markers', () => {
    const { user, system } = buildExplainPrompt(payload);
    expect(`${system}\n${user}`.toLowerCase()).not.toContain('uid');
  });
});

// ---------------------------------------------------------------------------
// toExplainPayload (new)
// ---------------------------------------------------------------------------

describe('toExplainPayload', () => {
  it('assembles a valid payload from a GapReport (round-trips through parseExplainPayload)', () => {
    const report: GapReport = {
      characterKey: 'furina',
      feasibility: ['You own 0 Golden Troupe pieces — need 4.'],
      shortfalls: ['Best build reaches ER 150% vs 200% target.'],
      action: 'Farm Golden Troupe.',
    };
    const payload = toExplainPayload(
      'furina',
      'crit_value',
      { crit_rate: 70, crit_dmg: 180 },
      report,
    );
    expect(payload.gap).toEqual({
      feasibility: report.feasibility,
      shortfalls: report.shortfalls,
      action: report.action,
    });
    expect(parseExplainPayload(payload)).toEqual(payload);
  });

  it('uses the explicit characterKey arg, not report.characterKey', () => {
    const report: GapReport = {
      characterKey: 'someone-else',
      feasibility: [],
      shortfalls: [],
      action: null,
    };
    const payload = toExplainPayload('furina', 'crit_value', {}, report);
    expect(payload.characterKey).toBe('furina');
  });
});
