import type { Artifact, Slot, StatKey, SubStat } from '../game/types';
import type { GameAdapter } from '../game/GameAdapter';
import { genshinAdapter } from '../game/genshin/adapter';

export type UidError = { error: 'NOT_FOUND' | 'NO_SHOWCASE' | 'NETWORK' };

const EQUIP_SLOT: Record<string, Slot> = {
  EQUIP_BRACER: 'flower',
  EQUIP_NECKLACE: 'plume',
  EQUIP_SHOES: 'sands',
  EQUIP_RING: 'goblet',
  EQUIP_DRESS: 'circlet',
};

const PROP_STAT: Record<string, StatKey> = {
  FIGHT_PROP_HP: 'hp',
  FIGHT_PROP_HP_PERCENT: 'hp_pct',
  FIGHT_PROP_ATTACK: 'atk',
  FIGHT_PROP_ATTACK_PERCENT: 'atk_pct',
  FIGHT_PROP_DEFENSE: 'def',
  FIGHT_PROP_DEFENSE_PERCENT: 'def_pct',
  FIGHT_PROP_ELEMENT_MASTERY: 'em',
  FIGHT_PROP_CHARGE_EFFICIENCY: 'er_pct',
  FIGHT_PROP_CRITICAL: 'crit_rate',
  FIGHT_PROP_CRITICAL_HURT: 'crit_dmg',
  FIGHT_PROP_HEAL_ADD: 'healing',
  FIGHT_PROP_PHYSICAL_ADD_HURT: 'physical_dmg',
  FIGHT_PROP_FIRE_ADD_HURT: 'elemental_dmg',
  FIGHT_PROP_WATER_ADD_HURT: 'elemental_dmg',
  FIGHT_PROP_ELEC_ADD_HURT: 'elemental_dmg',
  FIGHT_PROP_ICE_ADD_HURT: 'elemental_dmg',
  FIGHT_PROP_WIND_ADD_HURT: 'elemental_dmg',
  FIGHT_PROP_ROCK_ADD_HURT: 'elemental_dmg',
  FIGHT_PROP_GRASS_ADD_HURT: 'elemental_dmg',
};

export async function fetchUidArtifacts(
  uid: string,
  adapter: GameAdapter = genshinAdapter,
): Promise<Artifact[] | UidError> {
  let res: Response;
  try {
    res = await fetch(
      `https://enka.network/api/uid/${encodeURIComponent(uid)}`,
    );
  } catch {
    return { error: 'NETWORK' };
  }
  if (!res.ok) return { error: 'NOT_FOUND' };
  const data = (await res.json()) as Record<string, unknown>;
  const avatars = data?.avatarInfoList;
  if (!Array.isArray(avatars) || avatars.length === 0)
    return { error: 'NO_SHOWCASE' };

  const out: Artifact[] = [];
  for (const av of avatars as Array<{
    equipList?: Array<{
      reliquary?: { level?: number };
      flat?: Record<string, unknown>;
    }>;
  }>) {
    for (const equip of av.equipList ?? []) {
      const flat = equip.flat as Record<string, unknown> | undefined;
      if (!flat || flat.itemType !== 'ITEM_RELIQUARY') continue;
      const slot = EQUIP_SLOT[flat.equipType as string];
      const reliquaryMainstat = flat.reliquaryMainstat as
        | { mainPropId?: string; statValue?: number }
        | undefined;
      const mainStat = PROP_STAT[reliquaryMainstat?.mainPropId ?? ''];
      if (!slot || !mainStat) continue;
      const rawSubs = flat.reliquarySubstats as
        | Array<{ appendPropId: string; statValue: number }>
        | undefined;
      const subStats: SubStat[] = (rawSubs ?? [])
        .map((s) => ({ key: PROP_STAT[s.appendPropId], value: s.statValue }))
        .filter((s): s is SubStat => Boolean(s.key));
      const level = Math.max(0, (equip.reliquary?.level ?? 1) - 1); // Enka level is 1-based
      const rarity = (flat.rankLevel as number | undefined) ?? 5;
      out.push({
        id: crypto.randomUUID(),
        // NOTE: setNameTextMapHash is a NAME HASH, not a GOOD-format set key.
        // UID-imported artifacts will NOT match set-requirement constraints or set
        // bonuses reliably (their setKey is a numeric hash string). This is a known
        // v1.0 limitation — GOOD file import is the reliable path. Do NOT build a
        // hash→key mapping here; that is deferred to v1.1.
        setKey: String(flat.setNameTextMapHash),
        slot,
        rarity,
        level,
        mainStat,
        mainStatValue: adapter.mainStatValue(mainStat, rarity, level),
        subStats,
      });
    }
  }
  return out;
}
