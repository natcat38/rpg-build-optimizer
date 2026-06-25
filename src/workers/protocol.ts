import { searchBuilds } from '../optimizer/search';
import type {
  Artifact,
  OptimizeContext,
  OptimizeRequest,
  OptimizeResult,
} from '../game/types';

export interface WorkerRequest {
  req: OptimizeRequest;
  inventory: Artifact[];
  ctx: OptimizeContext;
}

export type WorkerResponse =
  | { type: 'done'; result: OptimizeResult }
  | { type: 'error'; message: string };

export function runSearchRequest(msg: WorkerRequest): WorkerResponse {
  try {
    const result = searchBuilds(msg.req, msg.inventory, msg.ctx);
    return { type: 'done', result };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { type: 'error', message };
  }
}

export function readSearchResponse(data: WorkerResponse): OptimizeResult {
  if (data.type === 'done') {
    return data.result;
  }
  if (data.type === 'error') {
    throw new Error(data.message);
  }
  throw new Error(
    `Unexpected worker message: ${String((data as { type?: unknown }).type)}`,
  );
}
