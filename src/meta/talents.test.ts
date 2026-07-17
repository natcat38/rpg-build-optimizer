import { describe, it, expect } from 'vitest';
import { TALENT_TARGETS, talentGaps, type TalentTargets } from './talents';
import { genshinAdapter } from '../game/genshin/adapter';

const target: TalentTargets = {
  priority: ['burst', 'skill', 'auto'],
  levels: { burst: 9, skill: 9, auto: 6 },
};

describe('talentGaps', () => {
  it('reports every slot with have:null when owned is undefined', () => {
    expect(talentGaps(target, undefined)).toEqual([
      { slot: 'burst', have: null, want: 9 },
      { slot: 'skill', have: null, want: 9 },
      { slot: 'auto', have: null, want: 6 },
    ]);
  });

  it('omits slots already at or above target', () => {
    const gaps = talentGaps(target, { burst: 9, skill: 5, auto: 6 });
    expect(gaps).toEqual([{ slot: 'skill', have: 5, want: 9 }]);
  });

  it('returns [] when every slot meets its target', () => {
    expect(talentGaps(target, { burst: 10, skill: 9, auto: 10 })).toEqual([]);
  });

  it('preserves priority order in the output', () => {
    const gaps = talentGaps(target, { burst: 1, skill: 1, auto: 1 });
    expect(gaps.map((g) => g.slot)).toEqual(['burst', 'skill', 'auto']);
  });
});

describe('TALENT_TARGETS data integrity', () => {
  const characterKeys = new Set(genshinAdapter.characters().map((c) => c.key));

  it('every characterKey resolves against the dataset', () => {
    for (const key of Object.keys(TALENT_TARGETS)) {
      expect(characterKeys.has(key), `missing character: ${key}`).toBe(true);
    }
  });

  it('every entry has levels defined for every slot in its priority', () => {
    for (const [key, { target }] of Object.entries(TALENT_TARGETS)) {
      for (const slot of target.priority) {
        expect(
          target.levels[slot],
          `${key}: missing level for ${slot}`,
        ).toBeGreaterThan(0);
      }
    }
  });
});
