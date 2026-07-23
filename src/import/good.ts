import type {
  Artifact,
  BuildLevel,
  Element,
  Slot,
  StatKey,
  SubStat,
  TalentSlot,
} from '../game/types';
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

export interface RosterEntry {
  buildLevel?: BuildLevel;
  weaponKey?: string;
  talent?: Partial<Record<TalentSlot, number>>;
  /** Owned constellation level, 0-6. Personalizes the advisor's
   *  constellation guidance card (ADR-0018). */
  constellation?: number;
}

// Ascension 0..6 → max level cap. A character can't be de-leveled, so the cap
// is the level the player is heading to — evaluate builds there (ADR-0015).
const ASCENSION_CAP: BuildLevel[] = [20, 40, 50, 60, 70, 80, 90];

// Same wedge-guard rationale as MAX_ARTIFACTS; real accounts are ~100/150.
const MAX_ROSTER = 1000;

const normalizeKey = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

/** Owned-roster extraction from a GOOD export: which characters the player
 *  owns, what weapon each has equipped, and the build level implied by their
 *  ascension. GOOD keys ("RaidenShogun") and dataset keys ("raiden_shogun",
 *  "amos'_bow") are matched by normalizing both to alphanumeric lowercase.
 *  Unresolvable keys (e.g. "TravelerAnemo" — Traveler isn't in the frozen
 *  dataset) are skipped, mirroring parseGOOD's skip-don't-throw contract. */
export function parseGOODRoster(json: unknown): Record<string, RosterEntry> {
  if (typeof json !== 'object' || json === null) return {};
  const obj = json as Record<string, unknown>;
  if (obj.format !== 'GOOD') return {};
  const rawChars = Array.isArray(obj.characters)
    ? obj.characters.slice(0, MAX_ROSTER)
    : [];
  const rawWeapons = Array.isArray(obj.weapons)
    ? obj.weapons.slice(0, MAX_ROSTER)
    : [];
  if (rawChars.length === 0 && rawWeapons.length === 0) return {};

  const charByNorm = new Map(
    genshinAdapter.characters().map((c) => [normalizeKey(c.key), c.key]),
  );
  const weaponByNorm = new Map(
    genshinAdapter.weapons().map((w) => [normalizeKey(w.key), w.key]),
  );

  const TALENT_SLOTS: TalentSlot[] = ['auto', 'skill', 'burst'];

  const entries: Record<string, RosterEntry> = {};
  for (const raw of rawChars) {
    if (typeof raw !== 'object' || raw === null) continue;
    const { key, ascension, talent, constellation } = raw as {
      key?: unknown;
      ascension?: unknown;
      talent?: unknown;
      constellation?: unknown;
    };
    if (typeof key !== 'string') continue;
    const ours = charByNorm.get(normalizeKey(key));
    if (!ours) continue;
    const entry: RosterEntry = {};
    if (
      typeof ascension === 'number' &&
      Number.isInteger(ascension) &&
      ascension >= 0 &&
      ascension <= 6
    ) {
      entry.buildLevel = ASCENSION_CAP[ascension];
    }
    if (
      typeof constellation === 'number' &&
      Number.isInteger(constellation) &&
      constellation >= 0 &&
      constellation <= 6
    ) {
      entry.constellation = constellation;
    }
    if (typeof talent === 'object' && talent !== null) {
      const t = talent as Record<string, unknown>;
      const parsed: Partial<Record<TalentSlot, number>> = {};
      for (const slot of TALENT_SLOTS) {
        const v = t[slot];
        if (typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 10) {
          parsed[slot] = v;
        }
      }
      if (Object.keys(parsed).length > 0) entry.talent = parsed;
    }
    entries[ours] = entry;
  }
  for (const raw of rawWeapons) {
    if (typeof raw !== 'object' || raw === null) continue;
    const { key, location } = raw as { key?: unknown; location?: unknown };
    if (typeof key !== 'string' || typeof location !== 'string') continue;
    if (location === '') continue; // unequipped
    const ourChar = charByNorm.get(normalizeKey(location));
    const ourWeapon = weaponByNorm.get(normalizeKey(key));
    if (!ourChar || !ourWeapon) continue;
    // A weapon equipped on a character missing from characters[] still
    // implies ownership — create the entry.
    (entries[ourChar] ??= {}).weaponKey = ourWeapon;
  }
  return entries;
}

export interface OwnedWeapon {
  key: string;
  level: number;
  refinement: number;
  location: string | null;
}

/** Full weapon inventory (equipped + unequipped), unlike parseGOODRoster's
 *  weapon handling which only records the one weapon equipped per character.
 *  Same skip-unresolvable-key contract as parseGOODRoster. */
export function parseGOODWeapons(json: unknown): OwnedWeapon[] {
  if (typeof json !== 'object' || json === null) return [];
  const obj = json as Record<string, unknown>;
  if (obj.format !== 'GOOD') return [];
  const rawWeapons = Array.isArray(obj.weapons)
    ? obj.weapons.slice(0, MAX_ROSTER)
    : [];
  if (rawWeapons.length === 0) return [];

  const charByNorm = new Map(
    genshinAdapter.characters().map((c) => [normalizeKey(c.key), c.key]),
  );
  const weaponByNorm = new Map(
    genshinAdapter.weapons().map((w) => [normalizeKey(w.key), w.key]),
  );

  const out: OwnedWeapon[] = [];
  for (const raw of rawWeapons) {
    if (typeof raw !== 'object' || raw === null) continue;
    const { key, level, refinement, location } = raw as {
      key?: unknown;
      level?: unknown;
      refinement?: unknown;
      location?: unknown;
    };
    if (typeof key !== 'string') continue;
    const ourWeapon = weaponByNorm.get(normalizeKey(key));
    if (!ourWeapon) continue;
    const ourLocation =
      typeof location === 'string' && location !== ''
        ? (charByNorm.get(normalizeKey(location)) ?? null)
        : null;
    out.push({
      key: ourWeapon,
      level: typeof level === 'number' && Number.isFinite(level) ? level : 1,
      refinement:
        typeof refinement === 'number' &&
        Number.isInteger(refinement) &&
        refinement >= 1 &&
        refinement <= 5
          ? refinement
          : 1,
      location: ourLocation,
    });
  }
  return out;
}
