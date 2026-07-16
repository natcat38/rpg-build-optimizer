import { describe, it, expect } from 'vitest';
import { parseGOOD } from './good';

const goodFile = {
  format: 'GOOD',
  version: 2,
  source: 'test',
  artifacts: [
    {
      setKey: 'EmblemOfSeveredFate',
      slotKey: 'sands',
      rarity: 5,
      level: 20,
      mainStatKey: 'atk_',
      substats: [
        { key: 'critDMG_', value: 14 },
        { key: 'critRate_', value: 7 },
      ],
    },
  ],
};

describe('parseGOOD', () => {
  it('rejects non-GOOD input', () => {
    expect(parseGOOD({ foo: 1 })).toEqual({ error: 'BAD_FORMAT' });
  });

  it('skips malformed (null/primitive) array elements, keeping the valid one', () => {
    const out = parseGOOD({
      format: 'GOOD',
      artifacts: [null, 'garbage', goodFile.artifacts[0]],
    });
    const arr = out as import('../game/types').Artifact[];
    expect(Array.isArray(arr)).toBe(true);
    expect(arr.length).toBe(1);
    expect(arr[0].setKey).toBe('EmblemOfSeveredFate'); // the valid element survived
  });

  it('tolerates a non-array substats field instead of throwing', () => {
    const out = parseGOOD({
      format: 'GOOD',
      artifacts: [{ ...goodFile.artifacts[0], substats: 'not-an-array' }],
    });
    const arr = out as import('../game/types').Artifact[];
    expect(arr.length).toBe(1);
    expect(arr[0].subStats).toEqual([]);
  });

  it('maps a GOOD artifact to our Artifact shape', () => {
    const out = parseGOOD(goodFile);
    expect(Array.isArray(out)).toBe(true);
    const arr = out as import('../game/types').Artifact[];
    expect(arr[0].setKey).toBe('EmblemOfSeveredFate');
    expect(arr[0].slot).toBe('sands');
    expect(arr[0].mainStat).toBe('atk_pct');
    expect(arr[0].subStats).toContainEqual({ key: 'crit_dmg', value: 14 });
  });

  it('skips an artifact with a non-numeric rarity', () => {
    const out = parseGOOD({
      format: 'GOOD',
      artifacts: [{ ...goodFile.artifacts[0], rarity: 'five' }],
    });
    const arr = out as import('../game/types').Artifact[];
    expect(arr.length).toBe(0);
  });

  it('skips an artifact with a rarity outside 4|5', () => {
    const out = parseGOOD({
      format: 'GOOD',
      artifacts: [{ ...goodFile.artifacts[0], rarity: 3 }],
    });
    const arr = out as import('../game/types').Artifact[];
    expect(arr.length).toBe(0);
  });

  it('skips an artifact with a non-finite level', () => {
    const out = parseGOOD({
      format: 'GOOD',
      artifacts: [{ ...goodFile.artifacts[0], level: NaN }],
    });
    const arr = out as import('../game/types').Artifact[];
    expect(arr.length).toBe(0);
  });

  it('skips an artifact with a level outside 0..20', () => {
    const out = parseGOOD({
      format: 'GOOD',
      artifacts: [{ ...goodFile.artifacts[0], level: 999 }],
    });
    const arr = out as import('../game/types').Artifact[];
    expect(arr.length).toBe(0);
  });

  it('drops a substat with a non-finite value, keeping the rest of the artifact', () => {
    const out = parseGOOD({
      format: 'GOOD',
      artifacts: [
        {
          ...goodFile.artifacts[0],
          substats: [
            { key: 'critDMG_', value: NaN },
            { key: 'critRate_', value: 7 },
          ],
        },
      ],
    });
    const arr = out as import('../game/types').Artifact[];
    expect(arr.length).toBe(1);
    expect(arr[0].subStats).toEqual([{ key: 'crit_rate', value: 7 }]);
  });

  it('skips an artifact whose sub-stats include the main stat', () => {
    const out = parseGOOD({
      format: 'GOOD',
      artifacts: [
        {
          ...goodFile.artifacts[0], // mainStatKey 'atk_' -> atk_pct
          substats: [{ key: 'atk_', value: 10 }],
        },
      ],
    });
    const arr = out as import('../game/types').Artifact[];
    expect(arr.length).toBe(0);
  });

  it('skips an artifact with more than 4 sub-stats', () => {
    const out = parseGOOD({
      format: 'GOOD',
      artifacts: [
        {
          ...goodFile.artifacts[0],
          substats: [
            { key: 'critDMG_', value: 1 },
            { key: 'critRate_', value: 1 },
            { key: 'hp_', value: 1 },
            { key: 'def_', value: 1 },
            { key: 'eleMas', value: 1 },
          ],
        },
      ],
    });
    const arr = out as import('../game/types').Artifact[];
    expect(arr.length).toBe(0);
  });

  it('tolerates null/primitive substat elements instead of throwing', () => {
    const out = parseGOOD({
      format: 'GOOD',
      artifacts: [
        {
          ...goodFile.artifacts[0],
          substats: [null, 5, { key: 'critRate_', value: 7 }],
        },
      ],
    });
    const arr = out as import('../game/types').Artifact[];
    expect(arr.length).toBe(1);
    expect(arr[0].subStats).toEqual([{ key: 'crit_rate', value: 7 }]);
  });

  it('rejects a GOOD file whose artifacts array is oversized', () => {
    const artifacts = Array.from({ length: 4001 }, () => goodFile.artifacts[0]);
    expect(parseGOOD({ format: 'GOOD', artifacts })).toEqual({
      error: 'BAD_FORMAT',
    });
  });

  it('accepts a GOOD file at exactly the array size cap', () => {
    const artifacts = Array.from({ length: 4000 }, () => goodFile.artifacts[0]);
    const out = parseGOOD({ format: 'GOOD', artifacts });
    const arr = out as import('../game/types').Artifact[];
    expect(arr.length).toBe(4000);
  });

  it('captures the element of an elemental_dmg goblet (ADR-0014)', () => {
    const out = parseGOOD({
      format: 'GOOD',
      artifacts: [
        {
          ...goodFile.artifacts[0],
          slotKey: 'goblet',
          mainStatKey: 'pyro_dmg_',
        },
      ],
    });
    const arr = out as import('../game/types').Artifact[];
    expect(arr[0].mainStat).toBe('elemental_dmg');
    expect(arr[0].element).toBe('pyro');
  });

  it('leaves element unset for a non-elemental-dmg main stat', () => {
    const out = parseGOOD(goodFile); // mainStatKey 'atk_'
    const arr = out as import('../game/types').Artifact[];
    expect(arr[0].element).toBeUndefined();
  });
});
