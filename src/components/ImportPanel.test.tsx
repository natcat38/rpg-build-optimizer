import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImportPanel } from './ImportPanel';
import { useInventory } from '../state/inventory';

const goodJson = JSON.stringify({
  format: 'GOOD',
  version: 2,
  artifacts: [
    {
      setKey: 'EmblemOfSeveredFate',
      slotKey: 'sands',
      rarity: 5,
      level: 20,
      mainStatKey: 'atk_',
      substats: [{ key: 'critDMG_', value: 14 }],
    },
  ],
});

const uidShowcase = {
  avatarInfoList: [
    {
      equipList: [
        {
          reliquary: { level: 21 },
          flat: {
            itemType: 'ITEM_RELIQUARY',
            equipType: 'EQUIP_BRACER',
            rankLevel: 5,
            setNameTextMapHash: 'x',
            reliquaryMainstat: { mainPropId: 'FIGHT_PROP_HP', statValue: 4780 },
            reliquarySubstats: [
              { appendPropId: 'FIGHT_PROP_CRITICAL', statValue: 7 },
            ],
          },
        },
      ],
    },
  ],
};

beforeEach(() => useInventory.setState({ artifacts: [] }));
afterEach(() => {
  vi.restoreAllMocks();
  useInventory.setState({ artifacts: [] });
});

describe('ImportPanel', () => {
  it('shows the loaded artifact count (0 initially)', () => {
    render(<ImportPanel />);
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText(/artifacts loaded/i)).toBeInTheDocument();
  });

  it('imports a valid GOOD file and reports the count', async () => {
    const user = userEvent.setup();
    render(<ImportPanel />);
    const file = new File([goodJson], 'good.json', {
      type: 'application/json',
    });
    // jsdom + user-event don't reliably surface File.text(); pin it so the
    // onFile -> parseGOOD path is exercised deterministically.
    Object.defineProperty(file, 'text', { value: async () => goodJson });
    await user.upload(screen.getByLabelText('GOOD file'), file);
    expect(await screen.findByRole('status')).toHaveTextContent(
      /Imported 1 artifacts/i,
    );
  });

  it('shows an error for an unrecognised / invalid-JSON file', async () => {
    const user = userEvent.setup();
    render(<ImportPanel />);
    const file = new File(['not json{{'], 'bad.json', {
      type: 'application/json',
    });
    Object.defineProperty(file, 'text', { value: async () => 'not json{{' });
    await user.upload(screen.getByLabelText('GOOD file'), file);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /recognised inventory export/i,
    );
  });

  it('surfaces a UID fetch error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 404 }),
    );
    const user = userEvent.setup();
    render(<ImportPanel />);
    await user.type(screen.getByLabelText('UID'), '700000000');
    await user.click(screen.getByRole('button', { name: /fetch/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /Couldn't find that UID/i,
    );
  });

  it('imports showcased artifacts from a UID', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => uidShowcase }),
    );
    const user = userEvent.setup();
    render(<ImportPanel />);
    await user.type(screen.getByLabelText('UID'), '700000000');
    await user.click(screen.getByRole('button', { name: /fetch/i }));
    expect(await screen.findByRole('status')).toHaveTextContent(
      /Imported 1 artifacts/i,
    );
  });
});
