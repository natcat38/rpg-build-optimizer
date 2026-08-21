import { describe, it, expect } from 'vitest';
import { TEAMMATES } from './teammates';
import { genshinAdapter } from '../game/genshin/adapter';

describe('TEAMMATES', () => {
  const charKeys = new Set(genshinAdapter.characters().map((c) => c.key));

  it('every entry has a source and 3-5 recs with non-empty role/why', () => {
    for (const [key, entry] of Object.entries(TEAMMATES)) {
      expect(entry.source, `${key} source`).toMatch(/^https?:\/\//);
      expect(entry.recs.length, `${key} recs count`).toBeGreaterThanOrEqual(3);
      expect(entry.recs.length, `${key} recs count`).toBeLessThanOrEqual(5);
      for (const rec of entry.recs) {
        expect(
          rec.role.length,
          `${key} -> ${rec.characterKey} role`,
        ).toBeGreaterThan(0);
        expect(
          rec.why.length,
          `${key} -> ${rec.characterKey} why`,
        ).toBeGreaterThan(0);
      }
    }
  });

  it('degrades gracefully for any teammate key not in the dataset (never crashes)', () => {
    for (const entry of Object.values(TEAMMATES)) {
      for (const rec of entry.recs) {
        expect(genshinAdapter.characterName(rec.characterKey)).toBeTruthy();
      }
    }
    // Sanity: at least warn (via this assertion) if we ever cite a teammate
    // key that plain doesn't exist in the dataset — not a hard failure, since
    // graceful degradation is the point, but worth seeing in a failure diff.
    const unresolved = Object.values(TEAMMATES)
      .flatMap((e) => e.recs)
      .map((r) => r.characterKey)
      .filter((k) => !charKeys.has(k));
    expect(unresolved).toEqual([]);
  });
});
