import { describe, it, expect } from 'vitest';
import { encodeBuild, decodeBuild } from './url';
import type { BuildResult, OptimizeRequest } from '../game/types';

const request: OptimizeRequest = { characterKey: 'Raiden', weaponKey: 'EngulfingLightning', buildLevel: 90, constraints: { minStats: { er_pct: 200 } }, objective: 'crit_value' };
const build: BuildResult = {
  artifactIds: { flower: 'f', plume: 'p', sands: 's', goblet: 'g', circlet: 'c' },
  totals: { crit_rate: 60, crit_dmg: 120 }, objectiveValue: 240, score: 240,
  diagnostics: { bindingConstraints: [], marginalBySlot: {}, explored: 0, pruned: 0 },
};

describe('share url', () => {
  it('round-trips a build snapshot', () => {
    const param = encodeBuild({ request, build });
    const out = decodeBuild(param);
    expect(out).not.toHaveProperty('error');
    if (!('error' in out)) {
      expect(out.request.characterKey).toBe('Raiden');
      expect(out.request.buildLevel).toBe(90);
      expect(out.build.objectiveValue).toBe(240);
    }
  });

  it('returns UNREADABLE for garbage input instead of throwing', () => {
    expect(decodeBuild('not-valid-base64!!')).toEqual({ error: 'UNREADABLE' });
  });

  it('returns UNREADABLE for an empty string', () => {
    expect(decodeBuild('')).toEqual({ error: 'UNREADABLE' });
  });
});
