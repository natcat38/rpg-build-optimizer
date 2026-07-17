import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameId } from '../game/registry';

interface GameState {
  gameId: GameId;
  setGameId: (id: GameId) => void;
}

export const useGame = create<GameState>()(
  persist(
    (set) => ({
      gameId: 'genshin',
      setGameId: (gameId) => set({ gameId }),
    }),
    { name: 'rpg-build-optimizer/game' },
  ),
);

// Keep [data-game] on <html> in sync so CSS can theme per game (see index.css).
useGame.subscribe((s) => {
  document.documentElement.dataset.game = s.gameId;
});
document.documentElement.dataset.game = useGame.getState().gameId;
