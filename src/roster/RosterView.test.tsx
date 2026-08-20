import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RosterView } from './RosterView';
import { useRoster } from '../state/roster';
import { useInventory } from '../state/inventory';
import type { Artifact } from '../game/types';

function equipped(id: string, location: string): Artifact {
  return {
    id,
    setKey: 'EmblemOfSeveredFate',
    slot: 'flower',
    rarity: 5,
    level: 20,
    mainStat: 'hp',
    mainStatValue: 4780,
    subStats: [
      { key: 'crit_rate', value: 10 },
      { key: 'crit_dmg', value: 20 },
    ],
    location,
  };
}

describe('RosterView', () => {
  beforeEach(() => {
    useRoster.getState().clear();
    useInventory.getState().clear();
  });

  it('prompts for an import when the roster is empty', () => {
    render(<RosterView />);
    expect(
      screen.getByText(/Import a GOOD file to see your roster\./i),
    ).toBeInTheDocument();
  });

  it('renders every entry with a band, and the breakdown on expand', async () => {
    const user = userEvent.setup();
    useRoster.getState().setRoster({
      neuvillette: {
        buildLevel: 90,
        level: 90,
        talents: { auto: 9, skill: 9, burst: 9 },
        weaponKey: "amos'_bow",
        weaponLevel: 90,
      },
      amber: {},
    });
    useInventory
      .getState()
      .addMany(
        Array.from({ length: 5 }, (_, i) => equipped(`n${i}`, 'neuvillette')),
      );

    render(<RosterView />);
    expect(screen.getByText('Neuvillette')).toBeInTheDocument();
    expect(screen.getByText('Amber')).toBeInTheDocument();
    expect(screen.getByText('built')).toBeInTheDocument();
    expect(screen.getByText('unbuilt')).toBeInTheDocument();

    // Built characters sort first.
    const names = screen
      .getAllByRole('heading', { level: 3 })
      .map((h) => h.textContent);
    expect(names[0]).toBe('Neuvillette');

    expect(screen.queryByText('Artifact quality')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Neuvillette/ }));
    expect(screen.getByText('Talents')).toBeInTheDocument();
    expect(screen.getByText('Artifact quality')).toBeInTheDocument();
  });

  it('shows only the top 12 characters until "Show all" is clicked', async () => {
    const user = userEvent.setup();
    useRoster
      .getState()
      .setRoster(
        Object.fromEntries(
          Array.from({ length: 15 }, (_, i) => [
            `char_${i}`,
            { level: 90 - i },
          ]),
        ),
      );

    render(<RosterView />);
    expect(screen.getAllByRole('listitem')).toHaveLength(12);
    await user.click(screen.getByRole('button', { name: /show all 15/i }));
    expect(screen.getAllByRole('listitem')).toHaveLength(15);
  });
});
