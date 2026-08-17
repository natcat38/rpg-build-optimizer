/**
 * Runs the branch-and-bound optimiser off the main thread: the Web Worker
 * entry point, its request/response protocol, and the main-thread client
 * that dispatches to it (falling back to a synchronous call where no worker
 * is available).
 * @packageDocumentation
 */

import { runSearchRequest } from './protocol';
import type { WorkerRequest } from './protocol';

(self as unknown as Worker).onmessage = (e: MessageEvent<WorkerRequest>) => {
  (self as unknown as Worker).postMessage(runSearchRequest(e.data));
};
