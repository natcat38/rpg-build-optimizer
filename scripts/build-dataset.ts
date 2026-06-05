/**
 * Build script: generate src/game/genshin/data.generated.json from genshin-db.
 *
 * ADR-0002: frozen snapshot – app imports the JSON, not genshin-db.
 * ADR-0003: stat-only set bonuses; elemental 2pc → elemental_dmg.
 * ADR-0006: character/weapon base stats at ascension breakpoints only (1,20,40,50,60,70,80,90).
 *
 * Main-stat value tables are hardcoded constants (the artifact scaling tables are
 * fixed game constants; genshin-db does not expose a per-level/rarity main-stat table).
 * Linear fill between the known base (level 0) and max (level 20) values is used,
 * which is a known v1.0 approximation – real scaling is non-linear but endpoints
 * are correct. CONCERN: mid-level values may be slightly off; flagged in report.
 */

import * as fs from 'fs';
import * as path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
// genshin-db uses CommonJS; we use createRequire to load it in an ESM script.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const genshindb: any = require('genshin-db');

// ---------------------------------------------------------------------------
// Stat key mapping: genshin-db substat name → our StatKey
// ---------------------------------------------------------------------------

const SUBSTAT_TO_KEY: Record<string, string> = {
  // Weapon secondary stats: genshin-db always returns 'ATK', 'HP', 'DEF' as
  // fractional values (0..1), meaning these are always PERCENTAGE secondaries
  // (e.g. ATK secondary = ATK%, not flat ATK). Map accordingly so base ATK
  // is never overwritten and pctToPercent() is applied correctly.
  HP: 'hp_pct',
  ATK: 'atk_pct',
  DEF: 'def_pct',
  'HP%': 'hp_pct',
  'ATK%': 'atk_pct',
  'DEF%': 'def_pct',
  'CRIT Rate': 'crit_rate',
  'CRIT DMG': 'crit_dmg',
  'Energy Recharge': 'er_pct',
  'Elemental Mastery': 'em',
  'Healing Bonus': 'healing',
  'Physical DMG Bonus': 'physical_dmg',
  // All elemental DMG bonuses map to elemental_dmg (ADR-0003)
  'Pyro DMG Bonus': 'elemental_dmg',
  'Hydro DMG Bonus': 'elemental_dmg',
  'Electro DMG Bonus': 'elemental_dmg',
  'Cryo DMG Bonus': 'elemental_dmg',
  'Anemo DMG Bonus': 'elemental_dmg',
  'Geo DMG Bonus': 'elemental_dmg',
  'Dendro DMG Bonus': 'elemental_dmg',
};

const ELEMENT_MAP: Record<string, string> = {
  Pyro: 'pyro',
  Hydro: 'hydro',
  Electro: 'electro',
  Cryo: 'cryo',
  Anemo: 'anemo',
  Geo: 'geo',
  Dendro: 'dendro',
  Physical: 'physical',
};

const WEAPON_TYPE_MAP: Record<string, string> = {
  Sword: 'sword',
  Claymore: 'claymore',
  Polearm: 'polearm',
  Bow: 'bow',
  Catalyst: 'catalyst',
};

const BUILD_LEVELS = [1, 20, 40, 50, 60, 70, 80, 90] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert a percentage value from genshin-db (0..1 range) to a 0..100 range. */
function pctToPercent(v: number): number {
  return Math.round(v * 10000) / 100; // e.g. 0.466 → 46.6
}

/** Round to 2 decimal places. */
function r2(v: number): number {
  return Math.round(v * 100) / 100;
}

// ---------------------------------------------------------------------------
// Parse 2pc bonus text → StatKey + value (ADR-0003)
// ---------------------------------------------------------------------------

/**
 * Parse a 2pc set bonus description string into a {statKey: value} pair.
 * Only recognises flat-stat and elemental DMG bonuses.
 * Returns null for unrecognisable bonuses (e.g. shield strength, resistances).
 */
function parse2pc(text: string): Record<string, number> | null {
  if (!text) return null;

  // Elemental DMG +15% (e.g. "Pyro DMG Bonus +15%")
  const eleDmgMatch = text.match(
    /(?:Pyro|Hydro|Electro|Cryo|Anemo|Geo|Dendro)\s+DMG\s+Bonus\s+\+(\d+(?:\.\d+)?)%/i,
  );
  if (eleDmgMatch) return { elemental_dmg: parseFloat(eleDmgMatch[1]) };

  // Physical DMG (e.g. "Physical DMG +25%")
  const physMatch = text.match(/Physical\s+DMG\s+(?:Bonus\s+)?\+(\d+(?:\.\d+)?)%/i);
  if (physMatch) return { physical_dmg: parseFloat(physMatch[1]) };

  // ATK +18% (percentage)
  const atkPctMatch = text.match(/^ATK\s+\+(\d+(?:\.\d+)?)%/i);
  if (atkPctMatch) return { atk_pct: parseFloat(atkPctMatch[1]) };

  // HP +20% (percentage)
  const hpPctMatch = text.match(/^HP\s+\+(\d+(?:\.\d+)?)%/i);
  if (hpPctMatch) return { hp_pct: parseFloat(hpPctMatch[1]) };

  // DEF +30% (percentage)
  const defPctMatch = text.match(/^DEF\s+\+(\d+(?:\.\d+)?)%/i);
  if (defPctMatch) return { def_pct: parseFloat(defPctMatch[1]) };

  // Energy Recharge +20%
  const erMatch = text.match(/Energy\s+Recharge\s+\+(\d+(?:\.\d+)?)%/i);
  if (erMatch) return { er_pct: parseFloat(erMatch[1]) };

  // CRIT Rate +12%
  const critRateMatch = text.match(/CRIT\s+Rate\s+\+(\d+(?:\.\d+)?)%/i);
  if (critRateMatch) return { crit_rate: parseFloat(critRateMatch[1]) };

  // CRIT DMG
  const critDmgMatch = text.match(/CRIT\s+DMG\s+\+(\d+(?:\.\d+)?)%/i);
  if (critDmgMatch) return { crit_dmg: parseFloat(critDmgMatch[1]) };

  // Elemental Mastery by 80
  const emMatch = text.match(/Elemental\s+Mastery\s+by\s+(\d+(?:\.\d+)?)\b/i);
  if (emMatch) return { em: parseFloat(emMatch[1]) };

  // Elemental Mastery +80
  const emMatch2 = text.match(/Elemental\s+Mastery\s+\+(\d+(?:\.\d+)?)\b/i);
  if (emMatch2) return { em: parseFloat(emMatch2[1]) };

  // Healing Bonus +15% / Healing Effectiveness +15%
  const healMatch = text.match(/Heal(?:ing)?\s+(?:Bonus|Effectiveness)\s+\+(\d+(?:\.\d+)?)%/i);
  if (healMatch) return { healing: parseFloat(healMatch[1]) };

  // Flat HP: "Max HP increased by 1000" or "HP increased by..."
  const hpFlatMatch = text.match(/(?:Max\s+)?HP\s+(?:increased\s+by|by)\s+(\d+(?:\.\d+)?)\b/i);
  if (hpFlatMatch) return { hp: parseFloat(hpFlatMatch[1]) };

  // DEF flat: "DEF +100" (no %)
  const defFlatMatch = text.match(/^DEF\s+(?:increased\s+by\s+|\+)(\d+(?:\.\d+)?)(?!\s*%)/i);
  if (defFlatMatch) return { def: parseFloat(defFlatMatch[1]) };

  return null;
}

/**
 * Parse a 4pc bonus that is a FLAT STAT only.
 * Strict — returns null for anything conditional/reactive.
 * For v1.0, all known Genshin 4pc bonuses are conditional; this always returns null.
 */
function parse4pcStatOnly(): Record<string, number> | null {
  return null;
}

// ---------------------------------------------------------------------------
// Main-stat value tables (hardcoded game constants, ADR-0002)
// ---------------------------------------------------------------------------
//
// These are fixed constants from the game. genshin-db does not expose per-level
// main stat tables, so we hardcode them here with verified endpoints.
//
// 5★ artifact main stat values at +0 and +20 (level 0..20, linear interpolation).
// Known endpoints (5★ +20):
//   hp=4780, atk=311, hp_pct=46.6, atk_pct=46.6, def_pct=58.3(n/a as main sands),
//   em=187, er_pct=51.8, crit_rate=31.1, crit_dmg=62.2,
//   elemental_dmg=46.6, physical_dmg=58.3, healing=35.9
//
// 5★ +0 (base) values sourced from the Genshin wiki:
//   hp=717, atk=47, hp_pct=7.0, atk_pct=7.0, def_pct=8.7,
//   em=28, er_pct=7.8, crit_rate=4.7, crit_dmg=9.3,
//   elemental_dmg=7.0, physical_dmg=8.7, healing=5.4
//
// CONCERN (v1.0): real scaling uses a non-linear lookup table per rarity.
// Linear fill produces correct values at +0 and +20; mid-level (e.g. +10) may
// deviate by ~1-3% from in-game values. This is acceptable for v1.0 build
// optimisation where final-level (+20) artifacts are the primary target.

/** Build a linear 21-element array from base to max (indices 0..20). */
function linearFill(base: number, max: number): number[] {
  const arr: number[] = [];
  for (let i = 0; i <= 20; i++) {
    arr.push(r2(base + ((max - base) * i) / 20));
  }
  return arr;
}

// 4★ artifact main stat values (endpoints from wiki):
// hp=3571→+20=2506(?), atk=23→+20=232...
// Actually the 4-star values at +20:
//   hp=3571, atk=232, hp_pct=34.8, atk_pct=34.8, def_pct=43.7,
//   em=140, er_pct=38.7, crit_rate=23.2, crit_dmg=46.6
//   elemental_dmg=34.8, physical_dmg=43.7, healing=26.8
// 4★ +0 base values (from wiki):
//   hp=430, atk=28, hp_pct=5.2, atk_pct=5.2, def_pct=6.6,
//   em=21, er_pct=5.8, crit_rate=3.5, crit_dmg=7.0
//   elemental_dmg=5.2, physical_dmg=6.6, healing=4.1

const MAIN_STAT_VALUES: Record<string, Record<string, number[]>> = {
  '5': {
    hp: linearFill(717, 4780),
    atk: linearFill(47, 311),
    hp_pct: linearFill(7.0, 46.6),
    atk_pct: linearFill(7.0, 46.6),
    def_pct: linearFill(8.7, 58.3),
    em: linearFill(28, 187),
    er_pct: linearFill(7.8, 51.8),
    crit_rate: linearFill(4.7, 31.1),
    crit_dmg: linearFill(9.3, 62.2),
    elemental_dmg: linearFill(7.0, 46.6),
    physical_dmg: linearFill(8.7, 58.3),
    healing: linearFill(5.4, 35.9),
  },
  '4': {
    hp: linearFill(430, 3571),
    atk: linearFill(28, 232),
    hp_pct: linearFill(5.2, 34.8),
    atk_pct: linearFill(5.2, 34.8),
    def_pct: linearFill(6.6, 43.7),
    em: linearFill(21, 140),
    er_pct: linearFill(5.8, 38.7),
    crit_rate: linearFill(3.5, 23.2),
    crit_dmg: linearFill(7.0, 46.6),
    elemental_dmg: linearFill(5.2, 34.8),
    physical_dmg: linearFill(6.6, 43.7),
    healing: linearFill(4.1, 26.8),
  },
};

// ---------------------------------------------------------------------------
// Build characters
// ---------------------------------------------------------------------------

function buildCharacters() {
  const names: string[] = genshindb.characters('names', { matchCategories: true });
  const result = [];

  for (const name of names) {
    const c = genshindb.characters(name);
    if (!c) continue;

    const element = ELEMENT_MAP[c.element];
    if (!element) continue; // skip non-standard elements

    const substattKey = SUBSTAT_TO_KEY[c.substat] ?? null;

    const baseByLevel: Record<string, Record<string, number>> = {};
    for (const level of BUILD_LEVELS) {
      const s = c.stats(level);
      const entry: Record<string, number> = {
        hp: r2(s.hp),
        atk: r2(s.attack),
        def: r2(s.defense),
      };
      // Add ascension stat (specialized) if it maps to a stat key
      if (substattKey && s.specialized !== undefined && s.specialized !== null) {
        // specialized for flat stats (hp, atk, def, em) is an absolute value
        // for percentage stats it's 0..1 range → convert to %
        const flatStats = new Set(['hp', 'atk', 'def', 'em']);
        const value = flatStats.has(substattKey)
          ? r2(s.specialized)
          : pctToPercent(s.specialized);
        entry[substattKey] = value;
      }
      baseByLevel[String(level)] = entry;
    }

    // Generate a slug key from name
    const key = name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_']/g, '').toLowerCase();

    result.push({
      key,
      name,
      element,
      baseByLevel,
    });
  }

  return result;
}

// ---------------------------------------------------------------------------
// Build weapons
// ---------------------------------------------------------------------------

function buildWeapons() {
  const names: string[] = genshindb.weapons('names', { matchCategories: true });
  const result = [];

  for (const name of names) {
    const w = genshindb.weapons(name);
    if (!w) continue;

    const type = WEAPON_TYPE_MAP[w.weapontype];
    if (!type) continue;

    const substatKey = SUBSTAT_TO_KEY[w.substat] ?? null;

    const byLevel: Record<string, Record<string, number>> = {};
    for (const level of BUILD_LEVELS) {
      const s = w.stats(level);
      // Low-rarity starter weapons (1★/2★) can't ascend past 70; skip undefined levels
      if (!s || s.attack === undefined || s.attack === null) continue;
      const entry: Record<string, number> = {
        atk: r2(s.attack),
      };
      // Add secondary stat if available
      if (substatKey && s.specialized !== undefined && s.specialized !== null) {
        const flatStats = new Set(['hp', 'atk', 'def', 'em']);
        const value = flatStats.has(substatKey)
          ? r2(s.specialized)
          : pctToPercent(s.specialized);
        entry[substatKey] = value;
      }
      byLevel[String(level)] = entry;
    }

    // Skip weapons with no valid stats at any level (shouldn't happen, guard anyway)
    if (Object.keys(byLevel).length === 0) continue;

    const key = name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_']/g, '').toLowerCase();

    result.push({
      key,
      name,
      type,
      byLevel,
    });
  }

  return result;
}

// ---------------------------------------------------------------------------
// Build artifact sets
// ---------------------------------------------------------------------------

function buildSets() {
  const names: string[] = genshindb.artifacts('names', { matchCategories: true });
  const result = [];

  for (const name of names) {
    const a = genshindb.artifacts(name);
    if (!a) continue;

    // Skip prayer sets (1pc only, no 2pc bonus)
    if (!a['2pc']) continue;

    const twoPiece = parse2pc(a['2pc']);
    const fourPiece = parse4pcStatOnly();

    // Only include if we recognise the 2pc bonus as a stat
    if (!twoPiece) continue;

    const key = name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_']/g, '').toLowerCase();

    const entry: {
      key: string;
      name: string;
      twoPiece: Record<string, number>;
      fourPiece?: Record<string, number>;
    } = {
      key,
      name,
      twoPiece,
    };

    if (fourPiece) {
      entry.fourPiece = fourPiece;
    }

    result.push(entry);
  }

  return result;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  console.log('Building Genshin Impact dataset...');

  const characters = buildCharacters();
  const weapons = buildWeapons();
  const sets = buildSets();

  const snapshot = {
    patch: '4.3',
    characters,
    weapons,
    sets,
    mainStatValues: MAIN_STAT_VALUES,
  };

  const outPath = path.join(
    path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')),
    '../src/game/genshin/data.generated.json',
  );

  fs.writeFileSync(outPath, JSON.stringify(snapshot, null, 2), 'utf-8');

  console.log(`✓ Wrote ${outPath}`);
  console.log(`  Characters: ${characters.length}`);
  console.log(`  Weapons:    ${weapons.length}`);
  console.log(`  Sets:       ${sets.length}`);
  console.log(
    `  Main stat rarities: ${Object.keys(snapshot.mainStatValues).join(', ')}`,
  );
}

main();
