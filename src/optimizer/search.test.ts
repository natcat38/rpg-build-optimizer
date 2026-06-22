import { describe, it, expect } from 'vitest';
import { searchBuilds, bruteForce } from './search';
import type {
  Artifact,
  OptimizeContext,
  OptimizeRequest,
  Slot,
} from '../game/types';
import { SLOTS } from '../game/types';

const ctx: OptimizeContext = {
  base: { crit_rate: 5, crit_dmg: 50 },
  setBonuses: {},
};

let counter = 0;
function mk(slot: Slot, cr = 0, cd = 0, setKey = 'A'): Artifact {
  return {
    id: `id${counter++}`,
    setKey,
    slot,
    rarity: 5,
    level: 20,
    mainStat: 'crit_rate',
    mainStatValue: cr,
    subStats: cd ? [{ key: 'crit_dmg', value: cd }] : [],
  };
}

function inventory(perSlot: number): Artifact[] {
  const arr: Artifact[] = [];
  for (const slot of SLOTS)
    for (let i = 0; i < perSlot; i++) arr.push(mk(slot, i, i * 2));
  return arr;
}

const req: OptimizeRequest = {
  characterKey: 'c',
  weaponKey: 'w',
  buildLevel: 90,
  constraints: {},
  objective: 'crit_value',
  topK: 5,
};

describe('searchBuilds', () => {
  it('returns NO_FEASIBLE_BUILD when a slot pool is empty', () => {
    const inv = inventory(2).filter((a) => a.slot !== 'circlet');
    const r = searchBuilds(req, inv, ctx);
    expect(r.reason).toBe('NO_FEASIBLE_BUILD');
    expect(r.builds).toHaveLength(0);
  });

  it('finds the maximum crit_value build', () => {
    counter = 0;
    const inv = inventory(3);
    const r = searchBuilds(req, inv, ctx);
    expect(r.builds.length).toBeGreaterThan(0);
    // best picks the highest cr/cd in every slot: cr main=2 each (5 slots), cd sub=4 each
    // totals: crit_rate = 5 + 5*2 = 15 ; crit_dmg = 50 + 5*4 = 70 ; cv = 15*2 + 70 = 100
    expect(r.builds[0].objectiveValue).toBe((5 + 5 * 2) * 2 + (50 + 5 * 4));
  });

  it('honours a minStats constraint (infeasible)', () => {
    counter = 0;
    const inv = inventory(3);
    const r = searchBuilds(
      { ...req, constraints: { minStats: { crit_dmg: 1000 } } },
      inv,
      ctx,
    );
    expect(r.reason).toBe('NO_FEASIBLE_BUILD');
  });

  it('branch-and-bound matches brute force on small inventories (correctness)', () => {
    for (let seed = 0; seed < 20; seed++) {
      counter = seed * 1000;
      const inv = inventory(3);
      const bnb = searchBuilds(req, inv, ctx);
      const bf = bruteForce(req, inv, ctx);
      expect(bnb.builds[0]?.objectiveValue).toBe(bf.builds[0]?.objectiveValue);
    }
  });

  it('matches brute force with set bonuses active (2+2 ceiling admissibility)', () => {
    // Two sets each grant +20 er_pct at 2pc. For an er_pct objective a 2+2 build
    // activates BOTH (+40), which exceeds any single set's bonus. The pruning
    // ceiling must account for this or it could prune the true optimum.
    const ctxSets: OptimizeContext = {
      base: { er_pct: 100 },
      setBonuses: { A: { two: { er_pct: 20 } }, B: { two: { er_pct: 20 } } },
    };
    const reqEr: OptimizeRequest = {
      characterKey: 'c',
      weaponKey: 'w',
      buildLevel: 90,
      constraints: {},
      objective: 'er_pct',
      topK: 5,
    };
    let n = 0;
    const rnd = () => {
      n = (n * 1103515245 + 12345) & 0x7fffffff;
      return n;
    };
    for (let seed = 0; seed < 30; seed++) {
      n = seed * 7919 + 1;
      let id = 0;
      const inv: Artifact[] = [];
      for (const slot of SLOTS) {
        for (let i = 0; i < 3; i++) {
          const setKey = rnd() % 2 === 0 ? 'A' : 'B';
          const er = rnd() % 15; // er_pct sub 0..14
          inv.push({
            id: `e${id++}`,
            setKey,
            slot,
            rarity: 5,
            level: 20,
            mainStat: 'er_pct',
            mainStatValue: er,
            subStats: [],
          });
        }
      }
      const bnb = searchBuilds(reqEr, inv, ctxSets);
      const bf = bruteForce(reqEr, inv, ctxSets);
      expect(bnb.builds[0]?.objectiveValue).toBe(bf.builds[0]?.objectiveValue);
    }
  });

  it('applies an anti-clone cap so top results are not all identical cores', () => {
    counter = 0;
    const inv = inventory(4);
    const r = searchBuilds({ ...req, topK: 5 }, inv, ctx);
    const cores = r.builds.map((b) =>
      SLOTS.slice(0, 4)
        .map((s) => b.artifactIds[s])
        .join(','),
    );
    expect(new Set(cores).size).toBeGreaterThan(1);
  });

  it('emits explored/pruned counts and per-build diagnostics', () => {
    counter = 0;
    const inv = inventory(3);
    const r = searchBuilds(req, inv, ctx);
    expect(r.explored).toBeGreaterThan(0);
    expect(r.builds[0].diagnostics.marginalBySlot).toBeTruthy();
    expect(typeof r.builds[0].diagnostics.explored).toBe('number');
  });
});
