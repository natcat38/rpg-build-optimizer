/**
 * Test-only fixtures. The owner's real GOOD export is gitignored personal
 * account data, so it exists on their machine but never in a clean checkout or
 * in CI — tests that need it must skip rather than fail (see `hasOwnerGOOD`).
 * Never import this from app code: it would pull `node:fs` into the bundle.
 * @packageDocumentation
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const OWNER_GOOD = resolve(
  here,
  '../../genshinData_GOOD_2026_07_15_02_29.json',
);

/** Gate for `describe.skipIf` — the export is gitignored, so CI never has it. */
export function hasOwnerGOOD(): boolean {
  return existsSync(OWNER_GOOD);
}

export function loadOwnerGOOD(): unknown {
  return JSON.parse(readFileSync(OWNER_GOOD, 'utf-8'));
}
