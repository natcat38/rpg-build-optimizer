import { describe, it, expect } from 'vitest';
import { SAMPLE_INVENTORY } from './sampleInventory';
import { SAMPLE_PRESETS } from './presets';
import { SLOTS } from '../game/types';
import { genshinAdapter } from '../game/genshin/adapter';
import { buildContext } from '../optimizer/context';
import { optimize } from '../optimizer/search';
import type { OptimizeRequest } from '../game/types';

describe('SAMPLE_INVENTORY', () => {
  it('is non-empty, sample-prefixed, with a piece in every slot', () => {
    expect(SAMPLE_INVENTORY.length).toBeGreaterThan(40);
    expect(SAMPLE_INVENTORY.every((a) => a.id.startsWith('sample-'))).toBe(
      true,
    );
    for (const slot of SLOTS) {
      expect(SAMPLE_INVENTORY.some((a) => a.slot === slot)).toBe(true);
    }
  });

  it('has unique ids', () => {
    const ids = SAMPLE_INVENTORY.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('yields a feasible build for every preset, honouring its constraint', () => {
    for (const p of SAMPLE_PRESETS) {
      const req: OptimizeRequest = {
        characterKey: p.characterKey,
        weaponKey: p.weaponKey,
        buildLevel: 90,
        constraints: p.constraints,
        objective: p.objective,
        topK: 10,
      };
      const ctx = buildContext(genshinAdapter, req);
      const res = optimize(req, SAMPLE_INVENTORY, ctx);
      expect(res.reason, `${p.label} should be feasible`).not.toBe(
        'NO_FEASIBLE_BUILD',
      );
      expect(res.builds.length, `${p.label} builds`).toBeGreaterThan(0);
      const top = res.builds[0];
      if (p.constraints.minStats?.er_pct != null) {
        expect(top.totals.er_pct ?? 0).toBeGreaterThanOrEqual(
          p.constraints.minStats.er_pct,
        );
      }
      if (p.constraints.minStats?.em != null) {
        expect(top.totals.em ?? 0).toBeGreaterThanOrEqual(
          p.constraints.minStats.em,
        );
      }
    }
  });
});
