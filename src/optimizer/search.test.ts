import { describe, it, expect } from 'vitest';
import { searchBuilds, bruteForce } from './search';
import type {
  Artifact,
  OptimizeContext,
  OptimizeRequest,
  OptimizeResult,
  Slot,
} from '../game/types';
import { SLOTS } from '../game/types';

/** Narrow a search result to its feasible variant; fails the test (with a
 *  clear message) instead of a TS error if the search was unexpectedly
 *  infeasible. Every test in this file that inspects `.builds` expects one. */
function expectOk(
  r: OptimizeResult,
): Extract<OptimizeResult, { status: 'ok' }> {
  if (r.status !== 'ok') {
    throw new Error(
      `expected a feasible result, got infeasible (explored=${r.explored}, pruned=${r.pruned})`,
    );
  }
  return r;
}

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
    expect(r.status).toBe('infeasible');
  });

  it('finds the maximum crit_value build', () => {
    counter = 0;
    const inv = inventory(3);
    const r = expectOk(searchBuilds(req, inv, ctx));
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
    expect(r.status).toBe('infeasible');
  });

  it('branch-and-bound matches brute force on small inventories (correctness)', () => {
    for (let seed = 0; seed < 20; seed++) {
      counter = seed * 1000;
      const inv = inventory(3);
      const bnb = expectOk(searchBuilds(req, inv, ctx));
      const bf = expectOk(bruteForce(req, inv, ctx));
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
      const bnb = expectOk(searchBuilds(reqEr, inv, ctxSets));
      const bf = expectOk(bruteForce(reqEr, inv, ctxSets));
      expect(bnb.builds[0]?.objectiveValue).toBe(bf.builds[0]?.objectiveValue);
    }
  });

  // The oracle above only ever runs with empty constraints. mainStatLocks,
  // setRequirement, and critRatioTarget are each unit-tested in isolation
  // (score.test.ts) but never through the brute-force oracle — which is the
  // admissibility guarantee ADR-0004 actually leans on. These three extend
  // it to cover those dimensions, asserting .score (not just
  // .objectiveValue) so the penalty-omitted pruning bound is verified too.

  it('branch-and-bound matches brute force with a mainStatLocks constraint (score)', () => {
    let n = 0;
    const rnd = () => {
      n = (n * 1103515245 + 12345) & 0x7fffffff;
      return n;
    };
    for (let seed = 0; seed < 20; seed++) {
      n = seed * 7919 + 1;
      let id = 0;
      const altStats: Artifact['mainStat'][] = ['atk_pct', 'hp_pct', 'em'];
      const inv: Artifact[] = [];
      for (const slot of SLOTS) {
        for (let i = 0; i < 4; i++) {
          // Force at least one crit_rate candidate per slot (index 0) so the
          // sands lock below is always satisfiable; randomize the rest so the
          // lock genuinely narrows some pools before the bound is computed.
          const locked = i === 0 || rnd() % 2 === 0;
          inv.push({
            id: `ms${id++}`,
            setKey: 'A',
            slot,
            rarity: 5,
            level: 20,
            mainStat: locked ? 'crit_rate' : altStats[rnd() % altStats.length],
            mainStatValue: rnd() % 50,
            subStats: rnd() % 3 ? [{ key: 'crit_dmg', value: rnd() % 20 }] : [],
          });
        }
      }
      const reqLocked: OptimizeRequest = {
        ...req,
        constraints: { mainStatLocks: { sands: 'crit_rate' } },
      };
      const bnb = expectOk(searchBuilds(reqLocked, inv, ctx));
      const bf = expectOk(bruteForce(reqLocked, inv, ctx));
      expect(bnb.builds[0]?.score).toBe(bf.builds[0]?.score);
    }
  });

  it('branch-and-bound matches brute force with a 4pc setRequirement constraint (score)', () => {
    let n = 0;
    const rnd = () => {
      n = (n * 1103515245 + 12345) & 0x7fffffff;
      return n;
    };
    for (let seed = 0; seed < 20; seed++) {
      n = seed * 7919 + 1;
      let id = 0;
      const inv: Artifact[] = [];
      for (const slot of SLOTS) {
        for (let i = 0; i < 4; i++) {
          // Guarantee a Target piece in every slot (index 0) so the 4pc
          // requirement is always reachable; the rest are split across two
          // other sets, so satisfies() genuinely rejects many leaves.
          const setKey =
            i === 0 ? 'Target' : rnd() % 2 === 0 ? 'Other1' : 'Other2';
          inv.push({
            id: `sr${id++}`,
            setKey,
            slot,
            rarity: 5,
            level: 20,
            mainStat: 'crit_rate',
            mainStatValue: rnd() % 50,
            subStats: rnd() % 3 ? [{ key: 'crit_dmg', value: rnd() % 20 }] : [],
          });
        }
      }
      const reqSet: OptimizeRequest = {
        ...req,
        constraints: { setRequirement: { kind: '4pc', setKey: 'Target' } },
      };
      const bnb = expectOk(searchBuilds(reqSet, inv, ctx));
      const bf = expectOk(bruteForce(reqSet, inv, ctx));
      expect(bnb.builds[0]?.score).toBe(bf.builds[0]?.score);
    }
    // 2pc / 2+2 share meetsSetRequirement's count-based check (score.ts) with
    // 4pc — same code path, so this case is representative rather than
    // needing its own dedicated oracle run.
  });

  it('prunes a sparse 4pc setRequirement without exploring the full pool (regression)', () => {
    // Regression for a real-account perf cliff: a setRequirement used to be
    // checked only at the leaf (satisfies()), so on an inventory spanning many
    // sets almost every branch was explored to full depth just to be
    // rejected. 15 artifacts/slot = 15^5 = 759,375 raw combinations; only 2
    // per slot match the required set, so a leaf-only check would explore a
    // large fraction of that. The feasibility bound (suffixSetPotential) must
    // keep explored+pruned far below the raw pool size.
    let n = 0;
    const rnd = () => {
      n = (n * 1103515245 + 12345) & 0x7fffffff;
      return n;
    };
    let id = 0;
    const inv: Artifact[] = [];
    for (const slot of SLOTS) {
      for (let i = 0; i < 15; i++) {
        const setKey = i < 2 ? 'Target' : `Other${i % 5}`;
        inv.push({
          id: `sparse${id++}`,
          setKey,
          slot,
          rarity: 5,
          level: 20,
          mainStat: 'crit_rate',
          mainStatValue: rnd() % 50,
          subStats: rnd() % 3 ? [{ key: 'crit_dmg', value: rnd() % 20 }] : [],
        });
      }
    }
    const reqSet: OptimizeRequest = {
      ...req,
      constraints: { setRequirement: { kind: '4pc', setKey: 'Target' } },
    };
    const r = expectOk(searchBuilds(reqSet, inv, ctx));
    expect(r.explored + r.pruned).toBeLessThan(50_000); // << 15^5 = 759,375
  });

  it('prunes an unconstrained search despite a scorable 2pc set bonus (regression)', () => {
    // Regression for a real-account perf cliff: the set-bonus ceiling used to
    // be one flat constant computed once up front, added to every branch's
    // bound regardless of whether that branch could still reach the bonus's
    // 2pc/4pc threshold. On an inventory where the bonus-granting set is rare,
    // that slack alone kept nearly every branch "unprunable" until the leaf.
    // No setRequirement here — this is the default "Optimise" click.
    const ctxWithBonus: OptimizeContext = {
      base: { crit_rate: 5, crit_dmg: 50 },
      setBonuses: { Bonus: { two: { crit_rate: 12 } } },
    };
    let n = 0;
    const rnd = () => {
      n = (n * 1103515245 + 12345) & 0x7fffffff;
      return n;
    };
    let id = 0;
    const inv: Artifact[] = [];
    for (const slot of SLOTS) {
      for (let i = 0; i < 15; i++) {
        const setKey = i < 2 ? 'Bonus' : `Other${i % 5}`;
        inv.push({
          id: `bonus${id++}`,
          setKey,
          slot,
          rarity: 5,
          level: 20,
          mainStat: 'crit_rate',
          mainStatValue: rnd() % 50,
          subStats: rnd() % 3 ? [{ key: 'crit_dmg', value: rnd() % 20 }] : [],
        });
      }
    }
    const r = expectOk(searchBuilds(req, inv, ctxWithBonus));
    expect(r.explored + r.pruned).toBeLessThan(50_000); // << 15^5 = 759,375
  });

  it('branch-and-bound matches brute force with a critRatioTarget tiebreak (score)', () => {
    for (let seed = 0; seed < 20; seed++) {
      counter = seed * 1000;
      const inv = inventory(3);
      const reqRatio: OptimizeRequest = {
        ...req,
        constraints: { critRatioTarget: 1 / 3 }, // conventional 1:2 CR:CD
      };
      const bnb = expectOk(searchBuilds(reqRatio, inv, ctx));
      const bf = expectOk(bruteForce(reqRatio, inv, ctx));
      expect(bnb.builds[0]?.score).toBe(bf.builds[0]?.score);
    }
  });

  it('applies an anti-clone cap so top results are not all identical cores', () => {
    counter = 0;
    const inv = inventory(4);
    const r = expectOk(searchBuilds({ ...req, topK: 5 }, inv, ctx));
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
    const r = expectOk(searchBuilds(req, inv, ctx));
    expect(r.explored).toBeGreaterThan(0);
    expect(r.builds[0].diagnostics.marginalBySlot).toBeTruthy();
    expect(typeof r.builds[0].diagnostics.explored).toBe('number');
  });

  it('returns NO_FEASIBLE_BUILD for a fully empty inventory', () => {
    const r = searchBuilds(req, [], ctx);
    expect(r.status).toBe('infeasible');
  });

  it('defaults topK to 10 when the request omits it', () => {
    counter = 0;
    const { topK: _omit, ...noK } = req; // eslint-disable-line @typescript-eslint/no-unused-vars
    const r = expectOk(searchBuilds(noK as OptimizeRequest, inventory(3), ctx));
    expect(r.builds.length).toBeGreaterThan(0);
    expect(r.builds.length).toBeLessThanOrEqual(10);
  });

  it('stays exact when the kept list overflows the k*6 truncation cap (topK=1)', () => {
    counter = 0;
    const inv = inventory(3); // 3^5 = 243 feasible leaves >> k*6 = 6, forcing truncation
    const bnb = expectOk(searchBuilds({ ...req, topK: 1 }, inv, ctx));
    const bf = expectOk(bruteForce({ ...req, topK: 1 }, inv, ctx));
    expect(bnb.builds[0].objectiveValue).toBe(bf.builds[0]?.objectiveValue);
  });

  it('drops exact-duplicate builds via the seenExact guard', () => {
    // Two artifacts sharing an id in one slot make two recursion paths produce
    // the identical 5-slot id tuple; seenExact must keep only the first.
    const mkId = (slot: Slot, id: string): Artifact => ({
      id,
      setKey: 'A',
      slot,
      rarity: 5,
      level: 20,
      mainStat: 'crit_rate',
      mainStatValue: 1,
      subStats: [],
    });
    const inv: Artifact[] = SLOTS.map((s) => mkId(s, `${s}-0`));
    inv.push(mkId('flower', 'flower-0')); // duplicate id in the flower slot
    const r = expectOk(searchBuilds({ ...req, topK: 5 }, inv, ctx));
    const tuples = r.builds.map((b) =>
      SLOTS.map((s) => b.artifactIds[s]).join(','),
    );
    expect(new Set(tuples).size).toBe(tuples.length); // no exact duplicates returned
    expect(r.builds).toHaveLength(1); // the two identical-id paths collapse to one
  });
});
