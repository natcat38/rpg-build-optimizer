import { PATCH } from './genshin/adapter';

export type GameId = 'genshin';

/** Display-only vocabulary + theme lens for a game. Not the optimizer adapter —
 *  Genshin runs entirely through genshinAdapter; this centralizes what the UI
 *  says *about* a game, and is the documented seam for a second one: add its
 *  entry here (ADR-0008/ADR-0012), widen `GameId`, and layer a [data-game]
 *  accent override in index.css. Only one game ships, so UI copy that reads
 *  naturally in a sentence ("your artifacts") is written literally at the call
 *  site; the nouns below are what a second game would have to supply. */
export interface GameDescriptor {
  id: GameId;
  name: string;
  tagline: string;
  patch: string;
  gearNoun: string;
  gearNounPlural: string;
  setNoun: string;
  source: string;
}

export const GAMES: Record<GameId, GameDescriptor> = {
  genshin: {
    id: 'genshin',
    name: 'Genshin Impact',
    tagline:
      'Find the mathematically optimal artifact build for any character.',
    patch: PATCH,
    gearNoun: 'Artifact',
    gearNounPlural: 'Artifacts',
    setNoun: 'Set',
    source: 'genshin-db',
  },
};

export function getGame(id: GameId): GameDescriptor {
  return GAMES[id];
}
