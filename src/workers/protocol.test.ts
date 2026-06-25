import { describe, it, expect } from 'vitest';
import { runSearchRequest, readSearchResponse } from './protocol';
import type { WorkerRequest, WorkerResponse } from './protocol';
import { genshinAdapter } from '../game/genshin/adapter';
import { buildContext } from '../optimizer/context';
import type { Artifact, OptimizeRequest } from '../game/types';
import { SLOTS } from '../game/types';

let c = 0;
const inv: Artifact[] = SLOTS.flatMap((slot) =>
  [0, 1].map((i) => ({
    id: `p${c++}`,
    setKey: 'A',
    slot,
    rarity: 5 as const,
    level: 20,
    mainStat: 'crit_rate' as const,
    mainStatValue: i,
    subStats: [],
  })),
);

function makeMsg(): WorkerRequest {
  const chars = genshinAdapter.characters();
  const weapons = genshinAdapter.weapons();
  const req: OptimizeRequest = {
    characterKey: chars[0].key,
    weaponKey: weapons[0].key,
    buildLevel: 90,
    constraints: {},
    objective: 'crit_value',
    topK: 3,
  };
  const ctx = buildContext(genshinAdapter, req);
  return { req, inventory: inv, ctx };
}

describe('runSearchRequest', () => {
  it('round-trip: readSearchResponse(runSearchRequest(msg)) returns builds', () => {
    const msg = makeMsg();
    const response = runSearchRequest(msg);
    expect(response.type).toBe('done');
    const result = readSearchResponse(response);
    expect(result.builds.length).toBeGreaterThan(0);
  });

  it('wraps a thrown error into a { type: error } envelope', () => {
    const msg = makeMsg();
    // Force searchBuilds to throw by making ctx.setBonuses a getter that throws.
    const brokenCtx = Object.create(msg.ctx, {
      setBonuses: {
        get() {
          throw new Error('injected failure');
        },
        enumerable: true,
        configurable: true,
      },
    });
    const response = runSearchRequest({ ...msg, ctx: brokenCtx });
    expect(response.type).toBe('error');
    expect((response as { type: 'error'; message: string }).message).toBe(
      'injected failure',
    );
  });
});

describe('readSearchResponse', () => {
  it('returns result on done envelope', () => {
    const msg = makeMsg();
    const result = readSearchResponse(runSearchRequest(msg));
    expect(Array.isArray(result.builds)).toBe(true);
  });

  it('throws on error envelope', () => {
    const envelope: WorkerResponse = { type: 'error', message: 'boom' };
    expect(() => readSearchResponse(envelope)).toThrow('boom');
  });

  it('throws with "Unexpected worker message" on unknown type', () => {
    const envelope = { type: 'weird' } as unknown as WorkerResponse;
    expect(() => readSearchResponse(envelope)).toThrow(
      'Unexpected worker message',
    );
  });
});
