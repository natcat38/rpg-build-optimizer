/**
 * Display copy for the app. The adapter-free half lives in `labels-core.ts`
 * (which `api/explain.ts` bundles — see the note there); this file adds the
 * parts that need the dataset adapter or the UI's own vocabulary, and
 * re-exports the core so callers only ever import `../labels`.
 * @packageDocumentation
 */

import type { Tone } from './components/ui/tone';
import { genshinAdapter } from './game/genshin/adapter';
import type { SetRequirement } from './game/types';
import type { Band } from './roster/buildScore';
import type { Role } from './teams/types';

export * from './labels-core';

/** Display names for team roles — user-visible copy lives here, not next to the
 *  `Role` union it labels. */
export const ROLE_LABELS: Record<Role, string> = {
  'on-field-dps': 'On-field DPS',
  'off-field-dps': 'Off-field DPS',
  buffer: 'Buffer',
  sustain: 'Sustain',
  battery: 'Battery',
  applicator: 'Applicator',
};

/** Band → the shared UI tone — one definition, used by every view that shows
 *  a band. The classes themselves live in `components/ui/tone.ts`. */
export const BAND_TONE: Record<Band, Tone> = {
  built: 'jade',
  partial: 'flux',
  unbuilt: 'muted',
};

/** Band → its user-visible label. The union's members are lowercase keys, not
 *  copy: rendering `b` directly printed "partial" mid-sentence. */
export const BAND_LABELS: Record<Band, string> = {
  built: 'Built',
  partial: 'Partly built',
  unbuilt: 'Unbuilt',
};

export function bandLabel(b: Band): string {
  return BAND_LABELS[b] ?? b;
}

/** The display name for a set key. Prefers the dataset's real name (which
 *  carries apostrophes and lowercase articles the PascalCase key can't), and
 *  falls back to splitting the key into spaced words for keys the frozen
 *  snapshot doesn't know (a GOOD export newer than the snapshot). Coerced
 *  first: inventories persisted before the import guards landed can still
 *  hold a non-string setKey, and this runs during render. */
export function formatSetName(setKey: string): string {
  const key = String(setKey ?? '');
  return (
    genshinAdapter.setName(key) ??
    key
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
      .trim()
  );
}

/** The one rendering of a meta recipe's set requirement. */
export function setRequirementLabel(r: SetRequirement): string {
  if (r.kind === '2+2')
    return `2pc ${formatSetName(r.setKeys[0])} + 2pc ${formatSetName(r.setKeys[1])}`;
  return `${r.kind} ${formatSetName(r.setKey)}`;
}
