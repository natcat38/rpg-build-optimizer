import { describe, it, expect } from 'vitest';
import { buildDiagnostics } from './diagnostics';
import type {
  Artifact,
  OptimizeContext,
  OptimizeRequest,
  BuildResult,
  Slot,
} from '../game/types';
import { SLOTS } from '../game/types';

const ctx: OptimizeContext = {
  base: { crit_rate: 5, crit_dmg: 50 },
  setBonuses: {},
};

let counter = 0;
function mkArtifact(slot: Slot, cr = 0, cd = 0): Artifact {
  return {
    id: `diag-id${counter++}`,
    setKey: 'A',
    slot,
    rarity: 5,
    level: 20,
    mainStat: 'crit_rate',
    mainStatValue: cr,
    subStats: cd ? [{ key: 'crit_dmg', value: cd }] : [],
  };
}

function makeChosenAndBuild(
  crPerSlot: number,
  cdPerSlot: number,
): { chosen: Artifact[]; b: BuildResult } {
  const chosen = SLOTS.map((s) => mkArtifact(s, crPerSlot, cdPerSlot));
  // totals: crit_rate = base(5) + 5 * crPerSlot, crit_dmg = base(50) + 5 * cdPerSlot
  const crit_rate = 5 + SLOTS.length * crPerSlot;
  const crit_dmg = 50 + SLOTS.length * cdPerSlot;
  const t = { crit_rate, crit_dmg };
  const objectiveVal = crit_rate * 2 + crit_dmg; // crit_value formula
  const artifactIds = {} as Record<Slot, string>;
  for (const a of chosen) artifactIds[a.slot] = a.id;
  const b: BuildResult = {
    artifactIds,
    totals: t,
    objectiveValue: objectiveVal,
    score: objectiveVal,
    diagnostics: {
      bindingConstraints: [],
      marginalBySlot: {},
      explored: 0,
      pruned: 0,
    },
  };
  return { chosen, b };
}

describe('buildDiagnostics', () => {
  it('marginalBySlot has a finite non-negative entry for each slot', () => {
    const { chosen, b } = makeChosenAndBuild(2, 4);
    const req: OptimizeRequest = {
      characterKey: 'c',
      weaponKey: 'w',
      buildLevel: 90,
      constraints: {},
      objective: 'crit_value',
    };
    const diag = buildDiagnostics(ctx, req, b, chosen, 10, 2);

    expect(Object.keys(diag.marginalBySlot)).toHaveLength(SLOTS.length);
    for (const slot of SLOTS) {
      const v = diag.marginalBySlot[slot];
      expect(typeof v).toBe('number');
      expect(isFinite(v!)).toBe(true);
      expect(v!).toBeGreaterThanOrEqual(0);
    }
  });

  it('passes through explored and pruned counts unchanged', () => {
    const { chosen, b } = makeChosenAndBuild(1, 2);
    const req: OptimizeRequest = {
      characterKey: 'c',
      weaponKey: 'w',
      buildLevel: 90,
      constraints: {},
      objective: 'crit_value',
    };
    const diag = buildDiagnostics(ctx, req, b, chosen, 42, 7);
    expect(diag.explored).toBe(42);
    expect(diag.pruned).toBe(7);
  });

  it('emits a binding constraint string when a minStats floor is cleared by < 5%', () => {
    // Build has crit_dmg = 50 + 5*2 = 60. Set floor at 58 so margin = 2/58 ≈ 3.4% < 5%.
    const { chosen, b } = makeChosenAndBuild(0, 2);
    const need = 58;
    const req: OptimizeRequest = {
      characterKey: 'c',
      weaponKey: 'w',
      buildLevel: 90,
      constraints: { minStats: { crit_dmg: need } },
      objective: 'crit_value',
    };
    const diag = buildDiagnostics(ctx, req, b, chosen, 5, 1);

    expect(diag.bindingConstraints.length).toBeGreaterThan(0);
    const msg = diag.bindingConstraints[0];
    // Must contain the stat label, the ≥ wording, and the "build has" wording
    expect(msg).toContain('≥');
    expect(msg).toContain('build has');
    // Stat label for crit_dmg
    expect(msg).toContain('CRIT DMG');
  });

  it('does NOT emit a binding constraint when the floor is comfortably cleared (> 5%)', () => {
    // Build has crit_dmg = 60. Set floor at 50 → margin = 10/50 = 20% > 5%.
    const { chosen, b } = makeChosenAndBuild(0, 2);
    const req: OptimizeRequest = {
      characterKey: 'c',
      weaponKey: 'w',
      buildLevel: 90,
      constraints: { minStats: { crit_dmg: 50 } },
      objective: 'crit_value',
    };
    const diag = buildDiagnostics(ctx, req, b, chosen, 5, 1);
    expect(diag.bindingConstraints).toHaveLength(0);
  });

  it('bindingConstraints is empty when no minStats are set', () => {
    const { chosen, b } = makeChosenAndBuild(2, 4);
    const req: OptimizeRequest = {
      characterKey: 'c',
      weaponKey: 'w',
      buildLevel: 90,
      constraints: {},
      objective: 'crit_value',
    };
    const diag = buildDiagnostics(ctx, req, b, chosen, 0, 0);
    expect(diag.bindingConstraints).toHaveLength(0);
  });
});
