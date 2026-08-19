import { describe, it, expect } from 'vitest';
import { COMP_ARCHETYPES } from './comps';
import { genshinAdapter } from '../game/genshin/adapter';

describe('COMP_ARCHETYPES', () => {
  const keys = new Set(genshinAdapter.characters().map((c) => c.key));

  it('has at least 25 archetypes with unique ids', () => {
    expect(COMP_ARCHETYPES.length).toBeGreaterThanOrEqual(25);
    const ids = COMP_ARCHETYPES.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('references only real characters, with https sources', () => {
    for (const a of COMP_ARCHETYPES) {
      expect(a.source, a.id).toMatch(/^https:\/\//);
      expect(a.slots, a.id).toHaveLength(4);
      for (const slot of a.slots) {
        expect(slot.options.length, a.id).toBeGreaterThan(0);
        for (const o of slot.options) {
          expect(keys.has(o.characterKey), `${a.id}: ${o.characterKey}`).toBe(
            true,
          );
        }
      }
    }
  });

  it('ranks options by non-increasing weight in (0, 1]', () => {
    for (const a of COMP_ARCHETYPES) {
      for (const slot of a.slots) {
        let prev = Infinity;
        for (const o of slot.options) {
          expect(o.weight, `${a.id}: ${o.characterKey}`).toBeGreaterThan(0);
          expect(o.weight, `${a.id}: ${o.characterKey}`).toBeLessThanOrEqual(1);
          expect(o.weight, `${a.id}: ${o.characterKey}`).toBeLessThanOrEqual(
            prev,
          );
          prev = o.weight;
        }
      }
    }
  });

  it('has four distinct characters in every ideal lineup', () => {
    for (const a of COMP_ARCHETYPES) {
      const ideal = a.slots.flatMap((s) =>
        s.options.filter((o) => o.weight === 1).map((o) => o.characterKey),
      );
      expect(new Set(ideal).size, a.id).toBe(ideal.length);
      expect(ideal.length, `${a.id} needs one ideal per slot`).toBe(4);
    }
  });
});
