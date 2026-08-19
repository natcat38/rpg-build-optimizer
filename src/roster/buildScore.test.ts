import { describe, it, expect } from 'vitest';
import { computeBuildScore, band } from './buildScore';
import type { RosterEntry } from '../import/good';
import type { Artifact, StatKey } from '../game/types';

let n = 0;
/** A piece contributing exactly `cr` crit rate and `cd` crit DMG. */
function piece(cr: number, cd: number): Artifact {
  const subStats = (
    [
      ['crit_rate', cr],
      ['crit_dmg', cd],
    ] as [StatKey, number][]
  )
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({ key, value }));
  return {
    id: `p${n++}`,
    setKey: 'A',
    slot: 'flower',
    rarity: 5,
    level: 20,
    mainStat: 'hp',
    mainStatValue: 4780,
    subStats,
  };
}

const maxed: RosterEntry = {
  buildLevel: 90,
  talents: { auto: 9, skill: 9, burst: 9 },
  weaponLevel: 90,
};

describe('computeBuildScore', () => {
  it('scores a fully built character at 100', () => {
    // 5 pieces, 180 CV total => 36 CV each (e.g. 8 crit rate + 20 crit DMG).
    const equipped = Array.from({ length: 5 }, () => piece(8, 20));
    expect(computeBuildScore(maxed, equipped).total).toBeCloseTo(100, 6);
  });

  it('scores an empty entry with no artifacts at 0', () => {
    const s = computeBuildScore({}, []);
    expect(s.total).toBe(0);
    expect(s.components.every((c) => c.points === 0)).toBe(true);
  });

  it('matches the formula component by component on a mid case', () => {
    // L80, talents 8/8/8, W90, 4 pieces, 120 CV
    const equipped = Array.from({ length: 4 }, () => piece(10, 10));
    const s = computeBuildScore(
      {
        buildLevel: 80,
        talents: { auto: 8, skill: 8, burst: 8 },
        weaponLevel: 90,
      },
      equipped,
    );
    const points = Object.fromEntries(
      s.components.map((c) => [c.label, c.points]),
    );
    expect(points['Character level']).toBeCloseTo(22.22, 2);
    expect(points['Talents']).toBeCloseTo(17.78, 2);
    expect(points['Weapon']).toBeCloseTo(15, 6);
    expect(points['Artifact count']).toBeCloseTo(8, 6);
    expect(points['Artifact quality']).toBeCloseTo(20, 6);
    expect(s.total).toBeCloseTo(83.0, 1);
    expect(band(s.total)).toBe('built');
  });

  it('caps each component rather than overflowing past 100', () => {
    const equipped = Array.from({ length: 5 }, () => piece(20, 40));
    const s = computeBuildScore(
      { ...maxed, talents: { auto: 15, skill: 15, burst: 15 } },
      equipped,
    );
    expect(s.total).toBeCloseTo(100, 6);
  });

  it('never lowers the total when a single input rises', () => {
    const base: RosterEntry = {
      buildLevel: 70,
      talents: { auto: 6, skill: 6, burst: 6 },
      weaponLevel: 70,
    };
    const equipped = [piece(5, 10), piece(5, 10)];
    const start = computeBuildScore(base, equipped).total;
    expect(
      computeBuildScore({ ...base, buildLevel: 80 }, equipped).total,
    ).toBeGreaterThanOrEqual(start);
    expect(
      computeBuildScore(
        { ...base, talents: { auto: 7, skill: 6, burst: 6 } },
        equipped,
      ).total,
    ).toBeGreaterThanOrEqual(start);
    expect(
      computeBuildScore({ ...base, weaponLevel: 90 }, equipped).total,
    ).toBeGreaterThanOrEqual(start);
    expect(
      computeBuildScore(base, [...equipped, piece(5, 10)]).total,
    ).toBeGreaterThanOrEqual(start);
  });
});

describe('band', () => {
  it('splits at 70 and 40', () => {
    expect(band(70)).toBe('built');
    expect(band(69.9)).toBe('partial');
    expect(band(40)).toBe('partial');
    expect(band(39.9)).toBe('unbuilt');
  });
});
