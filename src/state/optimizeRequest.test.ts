import { describe, it, expect, beforeEach } from 'vitest';
import { useOptimizeRequest, currentRequest } from './optimizeRequest';

describe('optimizeRequest store', () => {
  beforeEach(() => useOptimizeRequest.getState().reset());

  it('builds a request from the minER field', () => {
    useOptimizeRequest.getState().setMinER('160');
    const req = currentRequest(useOptimizeRequest.getState());
    expect(req.constraints.minStats?.er_pct).toBe(160);
    expect(req.topK).toBe(10);
    expect(req.buildLevel).toBe(90);
  });

  it('applyPreset surfaces an ER floor into minER and keeps other constraints', () => {
    useOptimizeRequest.getState().applyPreset({
      characterKey: 'furina',
      weaponKey: 'aquila_favonia',
      objective: 'crit_value',
      constraints: { minStats: { er_pct: 200 } },
    });
    const s = useOptimizeRequest.getState();
    expect(s.characterKey).toBe('furina');
    expect(s.minER).toBe('200');
    expect(currentRequest(s).constraints.minStats?.er_pct).toBe(200);
  });

  it('applyPreset keeps a setRequirement and leaves minER empty', () => {
    useOptimizeRequest.getState().applyPreset({
      characterKey: 'navia',
      weaponKey: 'beacon_of_the_reed_sea',
      objective: 'crit_value',
      constraints: {
        setRequirement: { kind: '4pc', setKey: 'GladiatorsFinale' },
      },
    });
    const s = useOptimizeRequest.getState();
    expect(s.minER).toBe('');
    expect(currentRequest(s).constraints.setRequirement).toEqual({
      kind: '4pc',
      setKey: 'GladiatorsFinale',
    });
  });
});
