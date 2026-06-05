import { describe, it, expect } from 'vitest';
import { parseGOOD } from './good';

const goodFile = {
  format: 'GOOD', version: 2, source: 'test',
  artifacts: [
    { setKey: 'EmblemOfSeveredFate', slotKey: 'sands', rarity: 5, level: 20, mainStatKey: 'atk_', substats: [
      { key: 'critDMG_', value: 14 }, { key: 'critRate_', value: 7 },
    ] },
  ],
};

describe('parseGOOD', () => {
  it('rejects non-GOOD input', () => {
    expect(parseGOOD({ foo: 1 })).toEqual({ error: 'BAD_FORMAT' });
  });

  it('skips malformed (null) array elements without throwing', () => {
    const out = parseGOOD({ format: 'GOOD', artifacts: [null, goodFile.artifacts[0]] });
    expect(Array.isArray(out)).toBe(true);
    expect((out as unknown[]).length).toBe(1);
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
