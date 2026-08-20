import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CharacterDetail } from './CharacterDetail';
import type { Artifact } from '../game/types';
import type { RosterEntry } from '../import/good';

const entry: RosterEntry = {
  buildLevel: 90,
  level: 90,
  constellation: 0,
  talents: { auto: 9, skill: 9, burst: 9 },
  weaponKey: 'mistsplitter_reforged',
  weaponLevel: 90,
};

const flower: Artifact = {
  id: 'a1',
  setKey: 'BlizzardStrayer',
  slot: 'flower',
  rarity: 5,
  level: 20,
  mainStat: 'hp',
  mainStatValue: 4780,
  subStats: [{ key: 'crit_rate', value: 10 }],
  location: 'kamisato_ayaka',
};

describe('CharacterDetail', () => {
  it('shows Overview by default and switches tabs with clicks', async () => {
    const user = userEvent.setup();
    render(
      <CharacterDetail
        characterKey="kamisato_ayaka"
        entry={entry}
        artifacts={[flower]}
      />,
    );
    expect(screen.getByRole('tab', { name: /overview/i })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await user.click(screen.getByRole('tab', { name: /recommended/i }));
    expect(screen.getByRole('tabpanel')).toHaveTextContent(/blizzard/i);
  });

  it('lists every slot on the Gear tab, marking empty ones', async () => {
    const user = userEvent.setup();
    render(
      <CharacterDetail
        characterKey="kamisato_ayaka"
        entry={entry}
        artifacts={[flower]}
      />,
    );
    await user.click(screen.getByRole('tab', { name: /gear/i }));
    const panel = screen.getByRole('tabpanel');
    expect(panel).toHaveTextContent(/Blizzard Strayer/);
    expect(screen.getAllByText('empty')).toHaveLength(4);
  });

  it('says so when a character has no curated recipe', async () => {
    const user = userEvent.setup();
    render(<CharacterDetail characterKey="amber" entry={{}} artifacts={[]} />);
    await user.click(screen.getByRole('tab', { name: /recommended/i }));
    expect(
      screen.getByText(/No curated recipe for this character yet/i),
    ).toBeInTheDocument();
  });

  it('moves between tabs with arrow keys', async () => {
    const user = userEvent.setup();
    render(
      <CharacterDetail
        characterKey="kamisato_ayaka"
        entry={entry}
        artifacts={[]}
      />,
    );
    screen.getByRole('tab', { name: /overview/i }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: /gear/i })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });
});
