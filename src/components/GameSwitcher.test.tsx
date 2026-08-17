import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GameSwitcher } from './GameSwitcher';
import { useGame } from '../state/game';

describe('GameSwitcher', () => {
  beforeEach(() => useGame.setState({ gameId: 'genshin' }));

  it('shows both games, with Wuwa marked coming soon', () => {
    render(<GameSwitcher />);
    expect(
      screen.getByRole('radio', { name: /genshin impact/i }),
    ).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText(/soon/i)).toBeInTheDocument();
  });

  it('switches the active game on click', async () => {
    const user = userEvent.setup();
    render(<GameSwitcher />);
    await user.click(screen.getByRole('radio', { name: /wuthering waves/i }));
    expect(useGame.getState().gameId).toBe('wuwa');
  });
});
