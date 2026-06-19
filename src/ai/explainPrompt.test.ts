import { describe, it, expect } from 'vitest';
import { buildExplainPrompt } from './explainPrompt';
import type { ExplainPayload } from './explainPayload';

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
