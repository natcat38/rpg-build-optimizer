/**
 * Advisory coverage reporter for the curated character guides (ADR-0016,
 * ADR-0018). Read-only: prints which characters are missing which guide
 * sections, grouped for prioritisation. Never exits non-zero — partial
 * coverage is the accepted starting state, not a CI failure.
 *
 * Usage:
 *   npm run meta:coverage                    # element buckets
 *   npm run meta:coverage -- path/to.json    # + a "your roster" bucket first
 */
import { readFileSync } from 'node:fs';
import { genshinAdapter } from '../src/game/genshin/adapter';
import { GUIDES } from '../src/meta/guides';
import { parseGOODRoster } from '../src/import/good';

const characters = genshinAdapter.characters();

const SECTIONS = [
  'build',
  'weapons',
  'talents',
  'teams',
  'substats',
  'constellations',
] as const;

function coverageCount(key: string): number {
  const guide = GUIDES[key];
  if (!guide) return 0;
  return SECTIONS.filter((s) => guide[s] != null).length;
}

const missing = characters.filter(
  (c) => coverageCount(c.key) < SECTIONS.length,
);

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
    const guide = GUIDES[key];
    const have = SECTIONS.filter((s) => guide?.[s] != null);
    console.log(`  - ${c.name} (${key}) — has: ${have.join(', ') || 'none'}`);
  }
}

if (rosterKeys.size > 0) {
  const ownedMissing = missing.filter((c) => rosterKeys.has(c.key));
  printGroup(
    'Your roster — missing coverage',
    ownedMissing.map((c) => c.key),
  );
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
  `\n${characters.length - missing.length}/${characters.length} characters have full guide coverage (${SECTIONS.join(' + ')}).`,
);
