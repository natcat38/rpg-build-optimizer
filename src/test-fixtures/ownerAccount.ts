// Test-only helper: reads the owner's real GOOD export from the repo root.
// Never import this from src/ app code — it must not enter the bundle.
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

export function loadOwnerGOOD(): unknown {
  const p = resolve(here, '../../genshinData_GOOD_2026_07_15_02_29.json');
  return JSON.parse(readFileSync(p, 'utf-8'));
}
