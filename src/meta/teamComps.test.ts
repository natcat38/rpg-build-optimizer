import { describe, it, expect } from 'vitest';
import {
  TEAM_COMPS,
  bestFieldableComp,
  resolveTeammateName,
  type TeamComp,
} from './teamComps';
import { genshinAdapter } from '../game/genshin/adapter';

const comps: TeamComp[] = [
  {
    name: 'Comp A',
    slots: [
      { role: 'a', options: ['x', 'y'] },
      { role: 'b', options: ['z'] },
      { role: 'c', options: ['w'] },
    ],
  },
  {
    name: 'Comp B',
    slots: [
      { role: 'a', options: ['p'] },
      { role: 'b', options: ['q'] },
      { role: 'c', options: ['r'] },
    ],
  },
];

describe('bestFieldableComp', () => {
  it('returns null when there are no comps', () => {
    expect(bestFieldableComp([], new Set(['x']))).toBeNull();
  });

  it('picks the comp that fills the most slots', () => {
    const result = bestFieldableComp(comps, new Set(['p', 'q', 'r']));
    expect(result?.comp.name).toBe('Comp B');
    expect(result?.filledCount).toBe(3);
  });

  it('resolves each slot to the best-ranked owned option', () => {
    const result = bestFieldableComp(comps, new Set(['y', 'z']));
    expect(result?.comp.name).toBe('Comp A');
    expect(result?.filled).toEqual(['y', 'z', null]);
  });

  it('returns a fully-null fill (not null overall) when nothing is owned', () => {
    const result = bestFieldableComp(comps, new Set());
    expect(result).not.toBeNull();
    expect(result?.filledCount).toBe(0);
    expect(result?.filled).toEqual([null, null, null]);
  });
});

describe('resolveTeammateName', () => {
  it('falls back to the raw key when the character is not in the dataset', () => {
    expect(resolveTeammateName('not_a_real_key', [])).toBe('not_a_real_key');
  });

  it('resolves a known character to its display name', () => {
    expect(
      resolveTeammateName('bennett', [{ key: 'bennett', name: 'Bennett' }]),
    ).toBe('Bennett');
  });
});

describe('TEAM_COMPS data integrity', () => {
  const characterKeys = new Set(genshinAdapter.characters().map((c) => c.key));

  it('every characterKey (both table keys and slot options) resolves against the dataset', () => {
    for (const [key, { comps: charComps }] of Object.entries(TEAM_COMPS)) {
      expect(characterKeys.has(key), `missing character: ${key}`).toBe(true);
      for (const comp of charComps) {
        for (const slot of comp.slots) {
          for (const option of slot.options) {
            expect(
              characterKeys.has(option),
              `${key}/${comp.name}: missing option ${option}`,
            ).toBe(true);
          }
        }
      }
    }
  });
});
