import { describe, it, expect } from 'vitest';
import { hasOwnerGOOD, loadOwnerGOOD } from './ownerAccount';
import { parseGOOD, parseGOODRoster } from '../import/good';

// The export is the owner's real account and is gitignored, so this whole
// block is a local-only sanity check on the importer.
describe.skipIf(!hasOwnerGOOD())('owner account fixture', () => {
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

  it('carries the v2 fields the roster view needs', () => {
    const roster = parseGOODRoster(loadOwnerGOOD());
    const withTalents = Object.values(roster).filter((e) => e.talents);
    expect(withTalents.length).toBeGreaterThan(50);
    const arts = parseGOOD(loadOwnerGOOD()) as { location?: string }[];
    expect(arts.filter((a) => a.location).length).toBeGreaterThan(300);
  });
});
