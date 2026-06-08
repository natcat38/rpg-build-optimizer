import type { Objective, Slot, StatKey } from '../game/types';

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

/** Display names for optimization objectives (stat keys plus crit value). */
export const OBJECTIVE_LABELS: Record<Objective, string> = {
  crit_value: 'Crit Value',
  ...STAT_LABELS,
};

export const SLOT_LABELS: Record<Slot, string> = {
  flower: 'Flower',
  plume: 'Plume',
  sands: 'Sands',
  goblet: 'Goblet',
  circlet: 'Circlet',
};

/** A small glyph per slot for compact, scannable build lists. */
export const SLOT_GLYPH: Record<Slot, string> = {
  flower: '✿',
  plume: '⟁',
  sands: '⧖',
  goblet: '♟',
  circlet: '◆',
};

export function statLabel(key: StatKey): string {
  return STAT_LABELS[key] ?? key;
}

export function objectiveLabel(obj: Objective): string {
  return OBJECTIVE_LABELS[obj] ?? obj;
}

/** Turn a PascalCase set key (e.g. "EmblemOfSeveredFate") into spaced words. */
export function formatSetName(setKey: string): string {
  return setKey
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .trim();
}
