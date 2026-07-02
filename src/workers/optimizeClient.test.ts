import { describe, it, expect, vi, afterEach } from 'vitest';
import { optimize } from './optimizeClient';
import { genshinAdapter } from '../game/genshin/adapter';
import type { Artifact, OptimizeRequest } from '../game/types';
import { SLOTS } from '../game/types';

let c = 0;
const inv: Artifact[] = SLOTS.flatMap((slot) =>
  [0, 1].map((i) => ({
    id: `i${c++}`,
    setKey: 'A',
    slot,
    rarity: 5,
    level: 20,
    mainStat: 'crit_rate' as const,
    mainStatValue: i,
    subStats: [],
  })),
);

describe('optimize (deep entry, sync fallback)', () => {
  it('builds context from the adapter and resolves with builds', async () => {
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
    // Worker is undefined in the Vitest/Node environment, so this exercises the
    // synchronous fallback path (buildContext -> searchBuilds) end to end.
    const r = await optimize(req, inv);
    expect(r.builds.length).toBeGreaterThan(0);
  });
});

describe('optimize (real Worker path)', () => {
  afterEach(() => vi.unstubAllGlobals());

  // Stub a Worker global so dispatch takes the real message-passing branch
  // (jsdom has no Worker). `react` drives the fake worker's response.
  function stubWorker(react: (self: FakeWorker) => void) {
    class FakeWorker {
      onmessage: ((e: MessageEvent) => void) | null = null;
      onerror: ((e: { message: string }) => void) | null = null;
      postMessage() {
        queueMicrotask(() => react(this));
      }
      terminate() {}
    }
    vi.stubGlobal('Worker', FakeWorker);
  }
  type FakeWorker = {
    onmessage: ((e: MessageEvent) => void) | null;
    onerror: ((e: { message: string }) => void) | null;
  };

  const req: OptimizeRequest = {
    characterKey: genshinAdapter.characters()[0].key,
    weaponKey: genshinAdapter.weapons()[0].key,
    buildLevel: 90,
    constraints: {},
    objective: 'crit_value',
    topK: 3,
  };

  it("resolves with the worker's result on a done message", async () => {
    const result = { builds: [], explored: 1, pruned: 2 };
    stubWorker((w) =>
      w.onmessage?.({ data: { type: 'done', result } } as MessageEvent),
    );
    await expect(optimize(req, inv)).resolves.toEqual(result);
  });

  it('rejects when the worker posts an error response', async () => {
    stubWorker((w) =>
      w.onmessage?.({
        data: { type: 'error', message: 'boom' },
      } as MessageEvent),
    );
    await expect(optimize(req, inv)).rejects.toThrow('boom');
  });

  it('rejects on a worker onerror event', async () => {
    stubWorker((w) => w.onerror?.({ message: 'crash' }));
    await expect(optimize(req, inv)).rejects.toThrow('crash');
  });
});
