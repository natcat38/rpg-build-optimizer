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
    if (r.status !== 'ok') throw new Error('expected a feasible result');
    expect(r.builds.length).toBeGreaterThan(0);
  });

  it('zeroes an off-element goblet main stat before it reaches the solver (ADR-0014)', async () => {
    const chars = genshinAdapter.characters();
    const character = chars[0];
    const offElement = (
      ['pyro', 'hydro', 'electro', 'cryo', 'anemo', 'geo', 'dendro'] as const
    ).find((e) => e !== character.element)!;
    const goblet: Artifact = {
      id: 'goblet-off',
      setKey: 'A',
      slot: 'goblet',
      rarity: 5,
      level: 20,
      mainStat: 'elemental_dmg',
      mainStatValue: 1000, // would dominate the objective if not zeroed
      subStats: [],
      element: offElement,
    };
    const req: OptimizeRequest = {
      characterKey: character.key,
      weaponKey: genshinAdapter.weapons()[0].key,
      buildLevel: 90,
      constraints: {},
      objective: 'elemental_dmg',
      topK: 1,
    };
    const withGoblet = [
      ...inv.filter((a) => a.slot !== 'goblet'),
      goblet,
      { ...goblet, id: 'goblet-off-2' },
    ];
    const r = await optimize(req, withGoblet);
    if (r.status !== 'ok') throw new Error('expected a feasible result');
    // The off-element goblet's 1000 main-stat value must not appear in totals.
    expect(r.builds[0].totals.elemental_dmg ?? 0).toBe(0);
  });

  it('leaves an on-element goblet main stat untouched', async () => {
    const chars = genshinAdapter.characters();
    const character = chars[0];
    const goblet: Artifact = {
      id: 'goblet-on',
      setKey: 'A',
      slot: 'goblet',
      rarity: 5,
      level: 20,
      mainStat: 'elemental_dmg',
      mainStatValue: 46.6,
      subStats: [],
      element: character.element as Artifact['element'],
    };
    if (goblet.element === undefined) return; // character.element === 'physical': not testable here
    const req: OptimizeRequest = {
      characterKey: character.key,
      weaponKey: genshinAdapter.weapons()[0].key,
      buildLevel: 90,
      constraints: {},
      objective: 'elemental_dmg',
      topK: 1,
    };
    const withGoblet = [
      ...inv.filter((a) => a.slot !== 'goblet'),
      goblet,
      { ...goblet, id: 'goblet-on-2', mainStatValue: 0 },
    ];
    const r = await optimize(req, withGoblet);
    if (r.status !== 'ok') throw new Error('expected a feasible result');
    expect(r.builds[0].totals.elemental_dmg ?? 0).toBe(46.6);
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
      onmessageerror: ((e: MessageEvent) => void) | null = null;
      terminated = false;
      postMessage() {
        queueMicrotask(() => react(this));
      }
      terminate() {
        this.terminated = true;
      }
    }
    vi.stubGlobal('Worker', FakeWorker);
  }
  type FakeWorker = {
    onmessage: ((e: MessageEvent) => void) | null;
    onerror: ((e: { message: string }) => void) | null;
    onmessageerror: ((e: MessageEvent) => void) | null;
    terminated: boolean;
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
    const result = {
      status: 'ok' as const,
      builds: [],
      explored: 1,
      pruned: 2,
    };
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

  it('rejects and terminates on a worker onmessageerror event (structured-clone failure)', async () => {
    let worker!: FakeWorker;
    stubWorker((w) => {
      worker = w;
      w.onmessageerror?.({} as MessageEvent);
    });
    await expect(optimize(req, inv)).rejects.toThrow();
    expect(worker.terminated).toBe(true);
  });
});
