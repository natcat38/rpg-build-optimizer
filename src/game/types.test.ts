import { describe, it, expect } from 'vitest';
import { SLOTS, isStatKey } from './types';

describe('domain types', () => {
  it('defines the five slots in fixed order', () => {
    expect(SLOTS).toEqual(['flower', 'plume', 'sands', 'goblet', 'circlet']);
  });

  it('recognises valid stat keys', () => {
    expect(isStatKey('crit_dmg')).toBe(true);
    expect(isStatKey('nonsense')).toBe(false);
  });
});
