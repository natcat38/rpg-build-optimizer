import { PATCH } from './genshin/adapter';

export type GameId = 'genshin' | 'wuwa';

/** Display-only vocabulary + theme lens for a game. Not the optimizer adapter —
 *  Genshin still runs entirely through genshinAdapter; this just centralizes
 *  what the UI shows, so a second game can appear before it can be solved. */
export interface GameDescriptor {
  id: GameId;
  name: string;
  tagline: string;
  patch: string;
  availability: 'live' | 'coming-soon';
  gearNoun: string;
  gearNounPlural: string;
  setNoun: string;
  source: string;
}

export const GAMES: Record<GameId, GameDescriptor> = {
  genshin: {
    id: 'genshin',
    name: 'Genshin Impact',
    tagline: 'Find the mathematically optimal artifact build for any character.',
    patch: PATCH,
    availability: 'live',
    gearNoun: 'Artifact',
    gearNounPlural: 'Artifacts',
    setNoun: 'Set',
    source: 'genshin-db',
  },
  wuwa: {
    id: 'wuwa',
    name: 'Wuthering Waves',
    tagline: 'Find the optimal Echo build for any Resonator.',
    patch: '—',
    availability: 'coming-soon',
    gearNoun: 'Echo',
    gearNounPlural: 'Echoes',
    setNoun: 'Sonata',
    source: 'wuwa-db',
  },
};

export const GAME_LIST: GameDescriptor[] = Object.values(GAMES);
