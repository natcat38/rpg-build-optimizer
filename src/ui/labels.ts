/**
 * UI-only presentation helpers layered on top of `src/labels.ts`'s
 * domain-neutral labels — currently the per-slot display glyphs used in
 * compact build lists.
 * @packageDocumentation
 */
import type { Slot } from '../game/types';

// Canonical labels live in src/labels.ts (neutral, no domain→ui dependency).
// Components keep importing from here; this re-exports plus the UI-only glyphs.
export * from '../labels';

/** A small glyph per slot for compact, scannable build lists. */
export const SLOT_GLYPH: Record<Slot, string> = {
  flower: '✿',
  plume: '⟁',
  sands: '⧖',
  goblet: '♟',
  circlet: '◆',
};
