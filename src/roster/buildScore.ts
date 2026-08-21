/**
 * Roster assessment: how built each owned character is. Turns an imported
 * roster entry plus the artifacts equipped on it into an explainable 0-100
 * build score, and renders the roster ranked by it.
 * @packageDocumentation
 */

/**
 * Build score: how built a roster character is, 0–100, with the components
 * spelled out so the number is explainable rather than an oracle.
 *
 * Every component is monotone in its input and clamped to its own maximum, so
 * a higher level / better talents / more artifacts can never lower the total.
 * A missing field scores 0 for that component (an unimported talent triple is
 * indistinguishable from an unlevelled one — both mean "no evidence of work").
 */
import type { Artifact } from '../game/types';
import type { RosterEntry } from '../import/good';
import { artifactContribution, objectiveValue } from '../optimizer/score';

export interface BuildScoreComponent {
  label: string;
  points: number;
  max: number;
}

export interface BuildScore {
  total: number;
  components: BuildScoreComponent[];
}

export type Band = 'built' | 'partial' | 'unbuilt';

/** Crit value a piece contributes on its own — main stat plus sub-stats. The
 *  optimiser's own fold, so a roster score and a search score can't diverge. */
function pieceCritValue(a: Artifact): number {
  return objectiveValue(artifactContribution(a), 'crit_value');
}

/** 180 CV across five pieces is roughly a finished set — good enough as the
 *  "fully invested" mark, and the same order of magnitude the grade badge uses. */
const FULL_CV = 180;

function component(
  label: string,
  fraction: number,
  max: number,
): BuildScoreComponent {
  return { label, points: Math.min(Math.max(fraction, 0), 1) * max, max };
}

export function computeBuildScore(
  entry: RosterEntry,
  equipped: Artifact[],
): BuildScore {
  const t = entry.talents;
  const equippedCV = equipped.reduce((sum, a) => sum + pieceCritValue(a), 0);
  const components = [
    component('Character level', (entry.buildLevel ?? 0) / 90, 25),
    component('Talents', t ? (t.auto + t.skill + t.burst) / 27 : 0, 20),
    component('Weapon', (entry.weaponLevel ?? 0) / 90, 15),
    component('Artifact count', equipped.length / 5, 10),
    component('Artifact quality', equippedCV / FULL_CV, 30),
  ];
  return {
    total: components.reduce((sum, c) => sum + c.points, 0),
    components,
  };
}

export function band(total: number): Band {
  if (total >= 70) return 'built';
  if (total >= 40) return 'partial';
  return 'unbuilt';
}

/** An inventory bucketed by the character each piece is equipped on. Loose
 *  pieces (no `location`) belong to nobody and are dropped. */
export function groupByLocation(
  artifacts: Artifact[],
): Record<string, Artifact[]> {
  const byLocation: Record<string, Artifact[]> = {};
  for (const a of artifacts)
    if (a.location) (byLocation[a.location] ??= []).push(a);
  return byLocation;
}

/** Build-score totals for a whole roster — the shape `recommendAbyss` and the
 *  investment advice both take. */
export function rosterBuildScores(
  entries: Record<string, RosterEntry>,
  artifacts: Artifact[],
): Record<string, number> {
  const byLocation = groupByLocation(artifacts);
  const scores: Record<string, number> = {};
  for (const [key, entry] of Object.entries(entries))
    scores[key] = computeBuildScore(entry, byLocation[key] ?? []).total;
  return scores;
}
