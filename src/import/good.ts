import type { Artifact, Slot, StatKey, SubStat } from '../game/types';
import type { GameAdapter } from '../game/GameAdapter';
import { genshinAdapter } from '../game/genshin/adapter';

const SLOT_MAP: Record<string, Slot> = {
  flower: 'flower',
  plume: 'plume',
  sands: 'sands',
  goblet: 'goblet',
  circlet: 'circlet',
};

const STAT_MAP: Record<string, StatKey> = {
  hp: 'hp',
  hp_: 'hp_pct',
  atk: 'atk',
  atk_: 'atk_pct',
  def: 'def',
  def_: 'def_pct',
  eleMas: 'em',
  enerRech_: 'er_pct',
  critRate_: 'crit_rate',
  critDMG_: 'crit_dmg',
  pyro_dmg_: 'elemental_dmg',
  hydro_dmg_: 'elemental_dmg',
  electro_dmg_: 'elemental_dmg',
  cryo_dmg_: 'elemental_dmg',
  anemo_dmg_: 'elemental_dmg',
  geo_dmg_: 'elemental_dmg',
  dendro_dmg_: 'elemental_dmg',
  physical_dmg_: 'physical_dmg',
  heal_: 'healing',
};

interface GoodArtifact {
  setKey: string;
  slotKey: string;
  rarity: number;
  level: number;
  mainStatKey: string;
  substats: { key: string; value: number }[];
}

export function parseGOOD(
  json: unknown,
  adapter: GameAdapter = genshinAdapter,
): Artifact[] | { error: 'BAD_FORMAT' } {
  if (typeof json !== 'object' || json === null) return { error: 'BAD_FORMAT' };
  const obj = json as Record<string, unknown>;
  if (obj.format !== 'GOOD' || !Array.isArray(obj.artifacts))
    return { error: 'BAD_FORMAT' };

  const out: Artifact[] = [];
  for (const raw of obj.artifacts as GoodArtifact[]) {
    if (typeof raw !== 'object' || raw === null) continue; // tolerate malformed array elements
    const slot = SLOT_MAP[raw.slotKey];
    const mainStat = STAT_MAP[raw.mainStatKey];
    if (!slot || !mainStat) continue; // skip unrecognised entries rather than throwing
    const subStats: SubStat[] = (raw.substats ?? [])
      .map((s) => ({ key: STAT_MAP[s.key], value: s.value }))
      .filter((s): s is SubStat => Boolean(s.key));
    out.push({
      id: crypto.randomUUID(),
      setKey: raw.setKey,
      slot,
      rarity: raw.rarity,
      level: raw.level,
      mainStat,
      mainStatValue: adapter.mainStatValue(mainStat, raw.rarity, raw.level),
      subStats,
    });
  }
  return out;
}
