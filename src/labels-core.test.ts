import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  formatScore,
  formatStat,
  isPctStat,
  objectiveLabel,
  statLabel,
  SLOT_LABELS,
} from './labels-core';

function src(rel: string): string {
  return readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');
}

// `api/explain.ts` bundles `ai/explainShared.ts`. Both of these files sit on
// that path, so an import of the game adapter (or of `../labels`, which imports
// it) from either one drags the 328 KB `data.generated.json` snapshot into the
// serverless function — measured at 315 KB before the labels-core split, 9 KB
// after. A module-graph assertion needs a bundler; a source-text tripwire
// catches the same mistake at the only place it can be made. The pattern
// matches an import specifier, not the bare words — these files are allowed to
// *mention* the adapter in the prose explaining why they must not import it.
const ADAPTER_IMPORT = /from '[^']*genshin\/adapter'/;

describe('serverless bundle boundary', () => {
  it('labels-core does not reach the game adapter', () => {
    expect(src('./labels-core.ts')).not.toMatch(ADAPTER_IMPORT);
  });

  it('explainShared reaches neither the adapter nor adapter-bound labels', () => {
    const text = src('./ai/explainShared.ts');
    expect(text).not.toMatch(ADAPTER_IMPORT);
    expect(text).not.toMatch(/from '\.\.\/labels'/);
  });

  it('artifactValidation (which explainShared imports) stays adapter-free', () => {
    expect(src('./state/artifactValidation.ts')).not.toMatch(ADAPTER_IMPORT);
  });
});

describe('labels-core', () => {
  it('labels a known stat and falls back to the raw key', () => {
    expect(statLabel('crit_rate')).toBe('CRIT Rate');
    expect(statLabel('nonsense' as never)).toBe('nonsense');
  });

  it('labels objectives', () => {
    expect(objectiveLabel('crit_value')).toBe('Crit Value');
    expect(objectiveLabel('em')).toBe('Elemental Mastery');
  });

  it('formats a stat value with the unit its key implies', () => {
    expect(isPctStat('crit_dmg')).toBe(true);
    expect(isPctStat('em')).toBe(false);
    expect(formatStat('crit_dmg', 62.4)).toBe('62.4%');
    expect(formatStat('em', 120.4)).toBe('120');
    expect(formatScore(NaN)).toBe('—');
  });

  it('has a label for every slot', () => {
    expect(Object.keys(SLOT_LABELS)).toHaveLength(5);
  });
});
