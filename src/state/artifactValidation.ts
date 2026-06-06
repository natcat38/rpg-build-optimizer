import type { StatKey, SubStat } from '../game/types';

export interface ArtifactDraft {
  mainStat: StatKey;
  level: number;
  subStats: SubStat[];
}

export function validateArtifactDraft(d: ArtifactDraft): string | null {
  if (d.level < 0 || d.level > 20) return 'Level must be between 0 and 20.';
  if (d.subStats.length > 4 || d.subStats.some((s) => s.key === d.mainStat)) {
    return 'An artifact can have at most 4 sub-stats, none matching the main stat.';
  }
  return null;
}
