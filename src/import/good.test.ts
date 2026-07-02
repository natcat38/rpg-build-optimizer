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
});
