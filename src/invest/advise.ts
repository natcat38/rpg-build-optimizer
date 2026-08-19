/**
 * Investment advice: what to pull for and what to craft, derived from the
 * near-miss archetypes the Abyss recommender reports.
 */
import { genshinAdapter } from '../game/genshin/adapter';
import { COMP_ARCHETYPES } from '../teams/comps';
import { ROLE_LABELS } from '../teams/types';
import type { ArchetypeGap } from '../teams/recommend';
import type { RosterEntry } from '../import/good';
import { WEAPON_OBTAINABILITY, type Obtainability } from './obtainability';

export interface Advice {
  kind: 'character' | 'weapon';
  subjectKey: string;
  headline: string;
  detail: string;
  /** The archetype id or character key the advice came from. */
  provenance: string;
  /** Team-score points unlocked; the ranking key. */
  upside: number;
}

const MAX_ADVICE = 10;

/** No banner-schedule data ships with the app — say so rather than guess. */
const ROTATES = 'Availability rotates — check a banner tracker before pulling.';

const TIER_COPY: Record<Obtainability, string> = {
  craftable: 'craftable — no wishes needed.',
  'battle-pass': 'a Battle Pass weapon.',
  'standard-banner': 'in the permanent wish pool, so it never leaves.',
  'limited-banner': `a character-banner weapon. ${ROTATES}`,
  event: 'an event reward — it may not be obtainable right now.',
};

const charName = (key: string) => genshinAdapter.character(key)?.name ?? key;
const weaponName = (key: string) =>
  genshinAdapter.weapons().find((w) => w.key === key)?.name ?? key;
const archName = (id: string) =>
  COMP_ARCHETYPES.find((a) => a.id === id)?.name ?? id;

/** The best craftable weapon in the curated table for a given weapon type. */
function craftableFor(weaponType: string): string | undefined {
  const byKey = new Map(genshinAdapter.weapons().map((w) => [w.key, w]));
  for (const [key, entry] of Object.entries(WEAPON_OBTAINABILITY)) {
    if (entry.tier !== 'craftable') continue;
    if (byKey.get(key)?.type === weaponType) return key;
  }
  return undefined;
}

export function adviseInvestments(
  gaps: ArchetypeGap[],
  roster: Record<string, RosterEntry>,
  scores: Record<string, number>,
): Advice[] {
  const out: Advice[] = [];
  const seen = new Set<string>();

  for (const gap of gaps) {
    for (const candidate of gap.candidates) {
      // Owned means the slot wasn't really missing them — it means the greedy
      // fill already used them elsewhere, which pulling won't fix.
      if (candidate in roster || candidate in scores) continue;
      const dedupe = `character:${candidate}:${gap.archetypeId}`;
      if (seen.has(dedupe)) continue;
      seen.add(dedupe);
      out.push({
        kind: 'character',
        subjectKey: candidate,
        headline: `Owning ${charName(candidate)} unlocks ${archName(
          gap.archetypeId,
        )} (+${gap.bestPossibleScore.toFixed(0)} team score)`,
        detail: `They fill the ${ROLE_LABELS[gap.missingRole].toLowerCase()} slot that team is short. ${ROTATES}`,
        provenance: gap.archetypeId,
        upside: gap.bestPossibleScore,
      });
    }
  }

  // Weapon advice: a character the plan leans on holding something that isn't
  // even a recommended weapon, when a craftable option exists for their type.
  const byKey = new Map(genshinAdapter.weapons().map((w) => [w.key, w]));
  const relevant = new Set(gaps.flatMap((g) => g.candidates));
  for (const key of relevant) {
    const equipped = roster[key]?.weaponKey;
    if (!equipped || equipped in WEAPON_OBTAINABILITY) continue;
    const type = byKey.get(equipped)?.type;
    if (!type) continue;
    const craft = craftableFor(type);
    if (!craft) continue;
    const dedupe = `weapon:${key}`;
    if (seen.has(dedupe)) continue;
    seen.add(dedupe);
    out.push({
      kind: 'weapon',
      subjectKey: craft,
      headline: `${charName(key)} is holding ${weaponName(equipped)} — ${weaponName(craft)} is a free upgrade path`,
      detail: `${weaponName(craft)} is ${TIER_COPY.craftable}`,
      provenance: key,
      upside: scores[key] ?? 0,
    });
  }

  return out.sort((a, b) => b.upside - a.upside).slice(0, MAX_ADVICE);
}
