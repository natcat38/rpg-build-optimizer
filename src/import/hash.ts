import type { Artifact } from '../game/types';

/** Stable content hash for dedupe. Independent of `id`. */
export function artifactHash(a: Artifact): string {
  const subs = [...a.subStats].sort((x, y) => x.key.localeCompare(y.key)).map((s) => `${s.key}:${s.value}`).join(',');
  return `${a.setKey}|${a.slot}|${a.rarity}|${a.level}|${a.mainStat}|${subs}`;
}
