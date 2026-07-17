/**
 * Advisory coverage reporter for the curated advisor tables (ADR-0016).
 * Read-only: prints which characters are missing META_TARGETS /
 * WEAPON_RANKINGS / TALENT_TARGETS / TEAM_COMPS coverage, grouped for
 * prioritisation. Never exits non-zero — partial coverage is the accepted
 * starting state, not a CI failure.
 *
 * Usage:
 *   npm run meta:coverage                    # element x weapon-type buckets
 *   npm run meta:coverage -- path/to.json    # + a "your roster" bucket first
 */
import { readFileSync } from 'node:fs';
import { genshinAdapter } from '../src/game/genshin/adapter';
import { META_TARGETS } from '../src/meta/metaTargets';
import { WEAPON_RANKINGS } from '../src/meta/weapons';
import { TALENT_TARGETS } from '../src/meta/talents';
import { TEAM_COMPS } from '../src/meta/teamComps';
import { parseGOODRoster } from '../src/import/good';

const characters = genshinAdapter.characters();

function coverageCount(key: string): number {
  return [META_TARGETS, WEAPON_RANKINGS, TALENT_TARGETS, TEAM_COMPS].filter(
    (table) => key in table,
  ).length;
}

const missing = characters.filter((c) => coverageCount(c.key) < 4);

const goodPath = process.argv[2];
let rosterKeys = new Set<string>();
if (goodPath) {
  const json = JSON.parse(readFileSync(goodPath, 'utf-8')) as unknown;
  rosterKeys = new Set(Object.keys(parseGOODRoster(json)));
}

function printGroup(title: string, keys: string[]): void {
  if (keys.length === 0) return;
  console.log(`\n${title} (${keys.length})`);
  for (const key of keys) {
    const c = characters.find((x) => x.key === key)!;
    const have = [
      key in META_TARGETS && 'meta',
      key in WEAPON_RANKINGS && 'weapon',
      key in TALENT_TARGETS && 'talent',
      key in TEAM_COMPS && 'team',
    ].filter(Boolean);
    console.log(
      `  - ${c.name} (${key}) — has: ${have.join(', ') || 'none'}`,
    );
  }
}

if (rosterKeys.size > 0) {
  const ownedMissing = missing.filter((c) => rosterKeys.has(c.key));
  printGroup('Your roster — missing coverage', ownedMissing.map((c) => c.key));
  const rest = missing.filter((c) => !rosterKeys.has(c.key));
  const byBucket = new Map<string, string[]>();
  for (const c of rest) {
    const bucket = c.element;
    byBucket.set(bucket, [...(byBucket.get(bucket) ?? []), c.key]);
  }
  for (const [bucket, keys] of [...byBucket.entries()].sort()) {
    printGroup(`Element: ${bucket}`, keys);
  }
} else {
  const byElement = new Map<string, string[]>();
  for (const c of missing) {
    byElement.set(c.element, [...(byElement.get(c.element) ?? []), c.key]);
  }
  for (const [element, keys] of [...byElement.entries()].sort()) {
    printGroup(`Element: ${element}`, keys);
  }
}

console.log(
  `\n${characters.length - missing.length}/${characters.length} characters have full advisor coverage (meta + weapon + talent + team).`,
);
