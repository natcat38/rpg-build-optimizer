import { describe, it, expect } from 'vitest';
import { parseExplainPayload } from './explainPayload';

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
