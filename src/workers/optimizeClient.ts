import type {
  Artifact,
  OptimizeContext,
  OptimizeRequest,
  OptimizeResult,
} from '../game/types';
import { buildContext } from '../optimizer/context';
import { runSearchRequest, readSearchResponse } from './protocol';
import type { WorkerRequest } from './protocol';

/** Dispatch a fully-built request to the worker, with a synchronous fallback
 *  for environments without Worker (tests, SSR). */
function dispatch(
  req: OptimizeRequest,
  inventory: Artifact[],
  ctx: OptimizeContext,
): Promise<OptimizeResult> {
  if (typeof Worker === 'undefined') {
    return Promise.resolve(
      readSearchResponse(runSearchRequest({ req, inventory, ctx })),
    );
  }
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL('./optimize.worker.ts', import.meta.url),
      {
        type: 'module',
      },
    );
    worker.onmessage = (e: MessageEvent) => {
      try {
        resolve(readSearchResponse(e.data));
      } catch (err) {
        reject(err);
      } finally {
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
 * callers wire nothing.
 */
export function optimize(
  request: OptimizeRequest,
  inventory: Artifact[],
): Promise<OptimizeResult> {
  const ctx = buildContext(request);
  return dispatch(request, inventory, ctx);
}
