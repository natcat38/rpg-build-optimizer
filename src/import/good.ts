import type { Artifact, Element, Slot, StatKey, SubStat } from '../game/types';
import { ELEMENTS, SLOTS } from '../game/types';
import { genshinAdapter } from '../game/genshin/adapter';
import { validateArtifactDraft } from '../state/artifactValidation';

// A full-collection GOOD export is large (a maxed account's artifact inventory
// runs into the low thousands) but not unbounded; cap generously so a
// corrupt/malicious file can't wedge the main thread parsing/rendering an
// arbitrarily huge array, while still admitting a real full export.
const MAX_ARTIFACTS = 4000;

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

// GOOD's mainStatKey already carries the element for elemental_dmg goblets
// (e.g. 'pyro_dmg_') — capture it instead of discarding it (ADR-0014).
// Derived from ELEMENTS so this can't drift out of sync with the canonical list.
const ELEMENT_KEYS: Record<string, Element> = Object.fromEntries(
  ELEMENTS.map((el) => [`${el}_dmg_`, el]),
) as Record<string, Element>;

interface GoodArtifact {
  setKey: string;
  slotKey: string;
  rarity: number;
  level: number;
  mainStatKey: string;
  substats: { key: string; value: number }[];
}

export function parseGOOD(json: unknown): Artifact[] | { error: 'BAD_FORMAT' } {
  if (typeof json !== 'object' || json === null) return { error: 'BAD_FORMAT' };
  const obj = json as Record<string, unknown>;
  if (
    obj.format !== 'GOOD' ||
    !Array.isArray(obj.artifacts) ||
    obj.artifacts.length > MAX_ARTIFACTS
  )
    return { error: 'BAD_FORMAT' };

  const out: Artifact[] = [];
  for (const raw of obj.artifacts as GoodArtifact[]) {
    if (typeof raw !== 'object' || raw === null) continue; // tolerate malformed array elements
    const slot = (SLOTS as string[]).includes(raw.slotKey)
      ? (raw.slotKey as Slot)
      : undefined;
    const mainStat = STAT_MAP[raw.mainStatKey];
    if (!slot || !mainStat) continue; // skip unrecognised entries rather than throwing
    if (raw.rarity !== 4 && raw.rarity !== 5) continue; // reject corrupt rarity
    if (!Number.isFinite(raw.level)) continue; // validateArtifactDraft's range check misses NaN
    // Guard the array shape too, not just undefined — a non-array `substats`
    // (malformed export) would otherwise throw on `.map`, breaking the
    // "skip malformed rather than throw" contract above.
    const rawSubs = Array.isArray(raw.substats) ? raw.substats : [];
    const subStats: SubStat[] = rawSubs
      // Guard each element's shape too, not just the outer array — a null or
      // primitive entry ([null], [5]) would otherwise throw on `s.key`,
      // breaking the "skip malformed rather than throw" contract above.
      .filter((s) => typeof s === 'object' && s !== null)
      .map((s) => ({ key: STAT_MAP[s.key], value: s.value }))
      .filter((s): s is SubStat => Boolean(s.key) && Number.isFinite(s.value));
    // Same invariant the manual ArtifactForm entry path enforces (<=4
    // sub-stats, none equal to the main stat) — a GOOD export can carry the
    // same corruption a hand-typed draft can.
    if (validateArtifactDraft({ mainStat, level: raw.level, subStats }))
      continue;
    out.push({
      id: crypto.randomUUID(),
      setKey: raw.setKey,
      slot,
      rarity: raw.rarity,
      level: raw.level,
      mainStat,
      mainStatValue: genshinAdapter.mainStatValue(
        mainStat,
        raw.rarity,
        raw.level,
      ),
      subStats,
      element: slot === 'goblet' ? ELEMENT_KEYS[raw.mainStatKey] : undefined,
    });
  }
  return out;
}
