import type {
  Artifact,
  OptimizeContext,
  OptimizeRequest,
  OptimizeResult,
} from '../game/types';
import { buildContext } from '../optimizer/context';
import { genshinAdapter } from '../game/genshin/adapter';
import { runSearchRequest, readSearchResponse } from './protocol';
import type { WorkerRequest } from './protocol';

// A goblet's element (ADR-0014) is only meaningful relative to the character
// being optimised for. Off-element goblets are still legal gear (their
// sub-stats count) but their elemental_dmg main stat is dead weight in-game,
// so zero it out before the solver ever sees it — no solver changes needed.
function zeroOffElementGoblets(
  inventory: Artifact[],
  characterKey: string,
): Artifact[] {
  const character = genshinAdapter.character(characterKey);
  if (!character) return inventory;
  return inventory.map((a) =>
    a.element && a.element !== character.element
      ? { ...a, mainStatValue: 0 }
      : a,
  );
}

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
    // Fires if the posted response fails structured-clone deserialization on
    // receipt — without this, neither onmessage nor onerror ever runs and
    // the promise hangs forever (UI stuck on "Searching…").
    worker.onmessageerror = () => {
      reject(new Error('worker message could not be deserialized'));
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
  const adjusted = zeroOffElementGoblets(inventory, request.characterKey);
  return dispatch(request, adjusted, ctx);
}
