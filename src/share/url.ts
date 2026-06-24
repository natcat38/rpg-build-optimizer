import { deflate, inflate } from 'pako';
import type {
  Artifact,
  BuildResult,
  OptimizeRequest,
  StatVec,
  SubStat,
} from '../game/types';
import { isStatKey, isObjective, BUILD_LEVELS, SLOTS } from '../game/types';

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

// Bound untrusted strings before they reach regex (formatSetName) / the DOM —
// a multi-MB key would cause main-thread jank. Mirrors explainShared's MAX_KEY_LEN.
const MAX_KEY_LEN = 128;
function isShortString(x: unknown): x is string {
  return typeof x === 'string' && x.length > 0 && x.length <= MAX_KEY_LEN;
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
    isShortString(a.id) &&
    isShortString(a.setKey) &&
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
  if (!isShortString(r.characterKey) || !isShortString(r.weaponKey))
    return false;
  if (!(BUILD_LEVELS as number[]).includes(r.buildLevel as number))
    return false;
  if (!isObjective(r.objective)) return false;
  if (typeof r.constraints !== 'object' || r.constraints === null) return false;
  // minStats, if present, reaches the optimizer should a shared request ever be
  // re-run — validate its keys/values now rather than trust the link.
  const minStats = (r.constraints as Record<string, unknown>).minStats;
  if (minStats !== undefined && !isStatVec(minStats)) return false;
  return true;
}

function isBuildResult(x: unknown): x is BuildResult {
  if (typeof x !== 'object' || x === null) return false;
  const b = x as Record<string, unknown>;
  if (
    typeof b.objectiveValue !== 'number' ||
    !Number.isFinite(b.objectiveValue)
  )
    return false;
  if (typeof b.score !== 'number' || !Number.isFinite(b.score)) return false;
  if (!isStatVec(b.totals)) return false;
  if (typeof b.artifactIds !== 'object' || b.artifactIds === null) return false;
  const ids = b.artifactIds as Record<string, unknown>;
  if (!SLOTS.every((s) => typeof ids[s] === 'string')) return false;
  // diagnostics is required to exist but not deep-validated: shared builds never
  // reach gap analysis (GapSection gates on `sharedArtifacts`), the only reader
  // of diagnostics.marginalBySlot. Deep-validate here if that gate is ever lifted.
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
  const { request, build, artifacts } = o;
  if (!isOptimizeRequest(request)) return null;
  if (!isBuildResult(build)) return null;
  if (!Array.isArray(artifacts) || !artifacts.every(isArtifact)) return null;
  // The build's per-slot ids must resolve to a carried artifact, else the link
  // renders a "valid" build with no gear shown. Keep the snapshot self-consistent.
  const ids = new Set((artifacts as Artifact[]).map((a) => a.id));
  if (!SLOTS.every((s) => ids.has(build.artifactIds[s]))) return null;
  return { request, build, artifacts: artifacts as Artifact[] };
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
