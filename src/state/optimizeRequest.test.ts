import { describe, it, expect, beforeEach } from 'vitest';
import { useOptimizeRequest, currentRequest } from './optimizeRequest';

describe('optimizeRequest store', () => {
  beforeEach(() => useOptimizeRequest.getState().reset());

  it('setMinER stores er_pct in constraints and currentRequest reflects it', () => {
    useOptimizeRequest.getState().setMinER('160');
    const req = currentRequest(useOptimizeRequest.getState());
    expect(req.constraints.minStats?.er_pct).toBe(160);
    expect(req.topK).toBe(10);
    expect(req.buildLevel).toBe(90);
  });

  it('setMinER with empty string removes er_pct and empty minStats', () => {
    useOptimizeRequest.getState().setMinER('160');
    useOptimizeRequest.getState().setMinER('');
    const req = currentRequest(useOptimizeRequest.getState());
    expect(req.constraints.minStats).toBeUndefined();
  });

  it('setMinER with empty string keeps other minStats fields intact', () => {
    // Set a constraint with both er_pct and em, then clear only er_pct.
    useOptimizeRequest.getState().applyPreset({
      characterKey: 'furina',
      weaponKey: 'aquila_favonia',
      objective: 'crit_value',
      constraints: { minStats: { er_pct: 200, em: 80 } },
    });
    useOptimizeRequest.getState().setMinER('');
    const req = currentRequest(useOptimizeRequest.getState());
    expect(req.constraints.minStats?.er_pct).toBeUndefined();
    expect(req.constraints.minStats?.em).toBe(80);
  });

  it('applyPreset stores constraints directly and currentRequest returns them', () => {
    useOptimizeRequest.getState().applyPreset({
      characterKey: 'furina',
      weaponKey: 'aquila_favonia',
      objective: 'crit_value',
      constraints: { minStats: { er_pct: 200 } },
    });
    const s = useOptimizeRequest.getState();
    expect(s.characterKey).toBe('furina');
    expect(currentRequest(s).constraints.minStats?.er_pct).toBe(200);
  });

  it('applyPreset with minStats containing er_pct AND another stat preserves both (regression)', () => {
    useOptimizeRequest.getState().applyPreset({
      characterKey: 'furina',
      weaponKey: 'aquila_favonia',
      objective: 'crit_value',
      constraints: { minStats: { er_pct: 200, em: 80 } },
    });
    const req = currentRequest(useOptimizeRequest.getState());
    expect(req.constraints.minStats?.er_pct).toBe(200);
    expect(req.constraints.minStats?.em).toBe(80);
  });

  it('applyPreset keeps a setRequirement constraint', () => {
    useOptimizeRequest.getState().applyPreset({
      characterKey: 'navia',
      weaponKey: 'beacon_of_the_reed_sea',
      objective: 'crit_value',
      constraints: {
        setRequirement: { kind: '4pc', setKey: 'GladiatorsFinale' },
      },
    });
    const s = useOptimizeRequest.getState();
    expect(currentRequest(s).constraints.setRequirement).toEqual({
      kind: '4pc',
      setKey: 'GladiatorsFinale',
    });
    // No ER floor in constraints.
    expect(currentRequest(s).constraints.minStats?.er_pct).toBeUndefined();
  });
});
