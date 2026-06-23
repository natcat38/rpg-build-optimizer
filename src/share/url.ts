import { deflate, inflate } from 'pako';
import type {
  Artifact,
  BuildResult,
  Objective,
  OptimizeRequest,
  StatVec,
  SubStat,
} from '../game/types';
import { isStatKey, BUILD_LEVELS, SLOTS } from '../game/types';

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

function isObjective(x: unknown): x is Objective {
  return x === 'crit_value' || isStatKey(x);
}

function isStatVec(x: unknown): x is StatVec {
  if (typeof x !== 'object' || x === null) return false;
  return Object.entries(x).every(
    ([k, v]) => isStatKey(k) && typeof v === 'number' && Number.isFinite(v),
  );
}

function isSubStat(x: unknown): x is SubStat {
  if (typeof x !== 'object' || x === null) return false;
  const s = x as Record<string, unknown>;
  return (
    isStatKey(s.key) && typeof s.value === 'number' && Number.isFinite(s.value)
  );
}

function isArtifact(x: unknown): x is Artifact {
  if (typeof x !== 'object' || x === null) return false;
  const a = x as Record<string, unknown>;
  return (
    typeof a.id === 'string' &&
    typeof a.setKey === 'string' &&
    (SLOTS as string[]).includes(a.slot as string) &&
    typeof a.rarity === 'number' &&
    typeof a.level === 'number' &&
    isStatKey(a.mainStat) &&
    typeof a.mainStatValue === 'number' &&
    Number.isFinite(a.mainStatValue) &&
    Array.isArray(a.subStats) &&
    a.subStats.every(isSubStat)
  );
}

function isOptimizeRequest(x: unknown): x is OptimizeRequest {
  if (typeof x !== 'object' || x === null) return false;
  const r = x as Record<string, unknown>;
  return (
    typeof r.characterKey === 'string' &&
    typeof r.weaponKey === 'string' &&
    (BUILD_LEVELS as number[]).includes(r.buildLevel as number) &&
    isObjective(r.objective) &&
    typeof r.constraints === 'object' &&
    r.constraints !== null
  );
}

function isBuildResult(x: unknown): x is BuildResult {
  if (typeof x !== 'object' || x === null) return false;
  const b = x as Record<string, unknown>;
  if (
    typeof b.objectiveValue !== 'number' ||
    !Number.isFinite(b.objectiveValue)
  )
    return false;
  if (typeof b.score !== 'number') return false;
  if (!isStatVec(b.totals)) return false;
  if (typeof b.artifactIds !== 'object' || b.artifactIds === null) return false;
  const ids = b.artifactIds as Record<string, unknown>;
  if (!SLOTS.every((s) => typeof ids[s] === 'string')) return false;
  if (typeof b.diagnostics !== 'object' || b.diagnostics === null) return false;
  return true;
}

/**
 * Structurally validate an untrusted decoded share snapshot. Returns the typed
 * snapshot, or null if any field the render path reads is malformed. This is the
 * trust-boundary guard for the ?b= link (parity with parseExplainPayload).
 */
export function parseBuildSnapshot(input: unknown): BuildSnapshot | null {
  if (typeof input !== 'object' || input === null) return null;
  const o = input as Record<string, unknown>;
  if (!isOptimizeRequest(o.request)) return null;
  if (!isBuildResult(o.build)) return null;
  if (!Array.isArray(o.artifacts) || !o.artifacts.every(isArtifact))
    return null;
  return {
    request: o.request,
    build: o.build,
    artifacts: o.artifacts,
  };
}

export function decodeBuild(
  param: string,
): BuildSnapshot | { error: 'UNREADABLE' } {
  try {
    if (!param) return { error: 'UNREADABLE' };
    const json = inflate(fromBase64Url(param), { to: 'string' });
    const snapshot = parseBuildSnapshot(JSON.parse(json));
    if (!snapshot) return { error: 'UNREADABLE' };
    return snapshot;
  } catch {
    return { error: 'UNREADABLE' };
  }
}
