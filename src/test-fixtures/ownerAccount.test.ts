import { describe, it, expect } from 'vitest';
import { loadOwnerGOOD } from './ownerAccount';
import { parseGOOD, parseGOODRoster } from '../import/good';

describe('owner account fixture', () => {
  it('imports the full artifact inventory', () => {
    const arts = parseGOOD(loadOwnerGOOD());
    expect(Array.isArray(arts)).toBe(true);
    // 549 in the file; a handful may be skipped as unrecognised — assert a floor.
    expect((arts as unknown[]).length).toBeGreaterThan(500);
  });

  it('imports the roster without throwing on 7.0-era characters', () => {
    const roster = parseGOODRoster(loadOwnerGOOD());
    // 109 in the file; Traveler variants + any unmapped keys are skipped.
    expect(Object.keys(roster).length).toBeGreaterThan(95);
    expect(roster['neuvillette']).toBeDefined();
    expect(roster['kaedehara_kazuha']).toBeDefined();
  });
});
