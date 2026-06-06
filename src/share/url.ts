import { deflate, inflate } from 'pako';
import type { Artifact, BuildResult, OptimizeRequest } from '../game/types';

export interface BuildSnapshot {
  request: OptimizeRequest;
  build: BuildResult;
  /** The five full artifacts of the build, so the link is self-contained and a
   *  recipient (who lacks the sender's inventory) can render the exact pieces (ADR-0005). */
  artifacts: Artifact[];
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4); // restore padding for strict atob
  const bin = atob(padded);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function encodeBuild(snapshot: BuildSnapshot): string {
  const json = JSON.stringify(snapshot);
  return toBase64Url(deflate(json));
}

export function decodeBuild(
  param: string,
): BuildSnapshot | { error: 'UNREADABLE' } {
  try {
    if (!param) return { error: 'UNREADABLE' };
    const json = inflate(fromBase64Url(param), { to: 'string' });
    const parsed = JSON.parse(json) as BuildSnapshot;
    if (!parsed.request || !parsed.build || !Array.isArray(parsed.artifacts))
      return { error: 'UNREADABLE' };
    return parsed;
  } catch {
    return { error: 'UNREADABLE' };
  }
}
