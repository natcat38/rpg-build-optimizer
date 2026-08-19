import { describe, it, expect } from 'vitest';
import {
  statLabel,
  objectiveLabel,
  formatSetName,
  formatScore,
  SLOT_LABELS,
} from './labels';

describe('labels', () => {
  it('labels a known stat and falls back to the raw key', () => {
    expect(statLabel('crit_rate')).toBe('CRIT Rate');
    expect(statLabel('nonsense' as never)).toBe('nonsense');
  });

  it('labels the crit_value objective and plain stat objectives', () => {
    expect(objectiveLabel('crit_value')).toBe('Crit Value');
    expect(objectiveLabel('em')).toBe('Elemental Mastery');
  });

  it('spaces a PascalCase set key', () => {
    expect(formatSetName('EmblemOfSeveredFate')).toBe('Emblem Of Severed Fate');
  });

  it('formats finite scores and renders a dash for non-finite ones', () => {
    expect(formatScore(12.34)).toBe('12.3');
    expect(formatScore(70, 0)).toBe('70');
    expect(formatScore(NaN)).toBe('—');
    expect(formatScore(Infinity)).toBe('—');
    expect(formatScore(-Infinity)).toBe('—');
  });

  it('has a label for every slot', () => {
    expect(SLOT_LABELS.flower).toBe('Flower');
    expect(Object.keys(SLOT_LABELS)).toHaveLength(5);
  });
});
