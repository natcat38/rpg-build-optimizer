import { describe, it, expect, beforeEach } from 'vitest';
import { useGame } from './game';

describe('game store', () => {
  beforeEach(() => useGame.setState({ gameId: 'genshin' }));

  it('defaults to genshin', () => {
    expect(useGame.getState().gameId).toBe('genshin');
  });

  it('switches game and syncs the data-game attribute', () => {
    useGame.getState().setGameId('wuwa');
    expect(useGame.getState().gameId).toBe('wuwa');
    expect(document.documentElement.dataset.game).toBe('wuwa');
  });
});
