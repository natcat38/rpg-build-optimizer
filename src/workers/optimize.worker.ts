import { runSearchRequest } from './protocol';
import type { WorkerRequest } from './protocol';

(self as unknown as Worker).onmessage = (e: MessageEvent<WorkerRequest>) => {
  (self as unknown as Worker).postMessage(runSearchRequest(e.data));
};
