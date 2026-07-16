import { describe, it, expect, beforeEach } from 'vitest';
import { useInventory } from './inventory';
import type { Artifact } from '../game/types';

const sample = (over: Partial<Artifact> = {}): Artifact => ({
  id: 'a1',
  setKey: 'EmblemOfSeveredFate',
  slot: 'sands',
  rarity: 5,
  level: 20,
  mainStat: 'atk_pct',
  mainStatValue: 46.6,
  subStats: [{ key: 'crit_dmg', value: 14 }],
  ...over,
});

describe('inventory store', () => {
  beforeEach(() => useInventory.getState().clear());

  it('adds an artifact', () => {
    useInventory.getState().add(sample());
    expect(useInventory.getState().artifacts).toHaveLength(1);
  });
});
