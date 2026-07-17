import { PATCH } from './genshin/adapter';

/** Display-only vocabulary — Genshin Impact only (ADR-0017). */
export const GAME = {
  name: 'Genshin Impact',
  patch: PATCH,
  source: 'genshin-db',
} as const;
