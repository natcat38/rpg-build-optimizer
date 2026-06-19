import type {
  Artifact,
  OptimizeContext,
  OptimizeRequest,
  OptimizeResult,
} from '../game/types';
import type { GameAdapter } from '../game/GameAdapter';
import { genshinAdapter } from '../game/genshin/adapter';
import { buildContext } from '../optimizer/context';
import { searchBuilds } from '../optimizer/search';
import type { WorkerRequest } from './optimize.worker';

/** Dispatch a fully-built request to the worker, with a synchronous fallback
 *  for environments without Worker (tests, SSR). */
function dispatch(
  req: OptimizeRequest,
  inventory: Artifact[],
  ctx: OptimizeContext,
): Promise<OptimizeResult> {
  if (typeof Worker === 'undefined') {
    return Promise.resolve(searchBuilds(req, inventory, ctx));
  }
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./optimize.worker.ts', import.meta.url), {
      type: 'module',
    });
    worker.onmessage = (e: MessageEvent) => {
      if (e.data.type === 'done') {
        resolve(e.data.result as OptimizeResult);
        worker.terminate();
      } else if (e.data.type === 'error') {
        reject(new Error(e.data.message));
        worker.terminate();
      } else {
        reject(new Error(`Unexpected worker message: ${String(e.data?.type)}`));
        worker.terminate();
      }
    };
    worker.onerror = (e) => {
      reject(new Error(e.message));
      worker.terminate();
    };
    const message: WorkerRequest = { req, inventory, ctx };
    worker.postMessage(message);
  });
}

/**
 * The optimiser: build the game context for a request and return the top builds
 * over an inventory. Owns context assembly + worker dispatch + sync fallback, so
 * callers wire nothing. Game-agnostic via the adapter (defaults to Genshin,
 * ADR-0008).
 */
export function optimize(
  request: OptimizeRequest,
  inventory: Artifact[],
  adapter: GameAdapter = genshinAdapter,
): Promise<OptimizeResult> {
  const ctx = buildContext(adapter, request);
  return dispatch(request, inventory, ctx);
}
