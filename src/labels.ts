import type { Objective, Slot, StatKey } from './game/types';

/** Human-friendly display names for stat keys. */
export const STAT_LABELS: Record<StatKey, string> = {
  hp: 'HP',
  hp_pct: 'HP%',
  atk: 'ATK',
  atk_pct: 'ATK%',
  def: 'DEF',
  def_pct: 'DEF%',
  em: 'Elemental Mastery',
  er_pct: 'Energy Recharge',
  crit_rate: 'CRIT Rate',
  crit_dmg: 'CRIT DMG',
  elemental_dmg: 'Elemental DMG',
  physical_dmg: 'Physical DMG',
  healing: 'Healing Bonus',
};

/** Display names for optimization objectives (stat keys plus the derived ones). */
export const OBJECTIVE_LABELS: Record<Objective, string> = {
  crit_value: 'Crit Value',
  avg_damage: 'Average damage (est.)',
  ...STAT_LABELS,
};

export const SLOT_LABELS: Record<Slot, string> = {
  flower: 'Flower',
  plume: 'Plume',
  sands: 'Sands',
  goblet: 'Goblet',
  circlet: 'Circlet',
};

export function statLabel(key: StatKey): string {
  return STAT_LABELS[key] ?? key;
}

// Stats whose values are conventionally displayed as a percentage.
const PCT_STATS = new Set<StatKey>([
  'hp_pct',
  'atk_pct',
  'def_pct',
  'er_pct',
  'crit_rate',
  'crit_dmg',
  'elemental_dmg',
  'physical_dmg',
  'healing',
]);

export function isPctStat(key: StatKey): boolean {
  return PCT_STATS.has(key);
}

export function objectiveLabel(obj: Objective): string {
  return OBJECTIVE_LABELS[obj] ?? obj;
}

/** One-sentence explanation of why a build is ranked by this metric — shown
 *  under the headline number so the metric changing per character reads as
 *  intentional, not a bug. */
export function objectiveHint(o: Objective): string {
  switch (o) {
    case 'avg_damage':
      return 'Estimated damage from this character’s curated rotation — for comparing builds, not matching in-game numbers.';
    case 'crit_value':
      return 'Crit Value = 2×Crit Rate + Crit DMG — a gear-quality proxy for crit-scaling damage dealers.';
    case 'hp_pct':
      return 'This character’s kit scales off HP, so builds are ranked by it instead of damage.';
    case 'em':
      return 'This character’s kit scales off Elemental Mastery, so builds are ranked by it instead of damage.';
    default:
      return `Builds are ranked by ${objectiveLabel(o)} — the stat this character’s role values most.`;
  }
}

/** Turn a PascalCase set key (e.g. "EmblemOfSeveredFate") into spaced words.
 *  Coerced first: inventories persisted before the import guards landed can
 *  still hold a non-string setKey, and this runs during render. */
export function formatSetName(setKey: string): string {
  return String(setKey ?? '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .trim();
}

/**
 * Every number the results UI shows goes through here. The damage formula is
 * pure arithmetic over user-supplied stats, so a pathological build can hand
 * the UI a NaN or an Infinity — guarding at the display seam keeps the maths
 * honest and still never renders the literal word "NaN".
 */
export function formatScore(n: number, digits = 1): string {
  return Number.isFinite(n) ? n.toFixed(digits) : '—';
}
