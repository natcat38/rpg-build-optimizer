/**
 * The adapter-free half of the label/format vocabulary.
 *
 * IMPORTANT: this module must not import `game/genshin/adapter` (nor anything
 * that reaches it, directly or transitively). `api/explain.ts` bundles
 * `ai/explainShared.ts`, which imports this file — pulling the adapter in here
 * dragged the whole 328 KB `data.generated.json` snapshot into the serverless
 * function (measured: 6.6 KB → 321 KB). `src/labels-core.test.ts` is the
 * tripwire that keeps it that way.
 *
 * `src/labels.ts` re-exports everything here, so UI code keeps importing
 * `../labels` and never needs to know this split exists.
 * @packageDocumentation
 */

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

// The per-slot mark used by compact build lists is not here: it is drawn, not
// written. See src/components/SlotGlyph.tsx for why five Unicode characters
// could not carry it.

/** Elements are lowercase dataset keys ("hydro"), never display copy. Colour is
 *  deliberately not part of this — the app has no element-hue system. */
export function elementLabel(el: string): string {
  return el ? el[0].toUpperCase() + el.slice(1) : '';
}

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

/**
 * Every number the results UI shows goes through here. The damage formula is
 * pure arithmetic over user-supplied stats, so a pathological build can hand
 * the UI a NaN or an Infinity — guarding at the display seam keeps the maths
 * honest and still never renders the literal word "NaN".
 */
export function formatScore(n: number, digits = 1): string {
  return Number.isFinite(n) ? n.toFixed(digits) : '—';
}

/**
 * One stat *value* with its unit. Percent stats are stored as plain numbers
 * (46.6 means 46.6%), so every site that printed a bare `formatScore` dropped
 * the "%" and made a CRIT DMG roll look like a flat stat. Flat stats (EM, ATK,
 * HP) are whole numbers in-game, so a trailing ".0" on them reads as false
 * precision — hence the digit count follows the stat, not the caller.
 */
export function formatStat(key: StatKey, value: number): string {
  const pct = isPctStat(key);
  return `${formatScore(value, pct ? 1 : 0)}${pct ? '%' : ''}`;
}

/** Crit-ratio targets are stored as CRIT Rate's share of CR+CD; players read
 *  them as "1:N". Callers must exclude a zero target — 1:∞ is theirs to word. */
export function formatCritRatio(target: number): string {
  return ((1 - target) / target).toFixed(1);
}

/** A count of things the search touched, grouped for reading. One helper so
 *  every counter in the UI is grouped the same way. */
export function formatCount(n: number): string {
  return n.toLocaleString();
}
