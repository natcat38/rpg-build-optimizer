import { optimize } from '../optimizer/search';
import type { Artifact, OptimizeContext, OptimizeRequest } from '../game/types';

export interface WorkerRequest {
  req: OptimizeRequest;
  inventory: Artifact[];
  ctx: OptimizeContext;
}

(self as unknown as Worker).onmessage = (e: MessageEvent<WorkerRequest>) => {
  try {
    const { req, inventory, ctx } = e.data;
    const result = optimize(req, inventory, ctx);
    (self as unknown as Worker).postMessage({ type: 'done', result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    (self as unknown as Worker).postMessage({ type: 'error', message });
  }
};
