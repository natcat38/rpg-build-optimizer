import type {
  Artifact,
  OptimizeContext,
  OptimizeRequest,
  OptimizeResult,
} from '../game/types';
import { genshinAdapter } from '../game/genshin/adapter';
import { buildContext } from '../optimizer/context';
import { searchBuilds } from '../optimizer/search';

export function runOptimize(
  req: OptimizeRequest,
  inventory: Artifact[],
  ctx: OptimizeContext,
): Promise<OptimizeResult> {
  // Fallback for environments without Worker (tests, SSR): run synchronously.
  if (typeof Worker === 'undefined') {
    return Promise.resolve(searchBuilds(req, inventory, ctx));
  }
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL('./optimize.worker.ts', import.meta.url),
      { type: 'module' },
    );
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
    worker.postMessage({ req, inventory, ctx });
  });
}

/** Build the context and run the optimiser for a request over an inventory. */
export function optimizeFor(
  req: OptimizeRequest,
  inventory: Artifact[],
): Promise<OptimizeResult> {
  const ctx = buildContext(genshinAdapter, req);
  return runOptimize(req, inventory, ctx);
}
