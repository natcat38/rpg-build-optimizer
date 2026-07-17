import { describe, it, expect, beforeEach } from 'vitest';
import { useWeaponInventory } from './weapons';

describe('weapon inventory store', () => {
  beforeEach(() => useWeaponInventory.getState().clear());

  it('setWeapons replaces wholesale rather than merging', () => {
    useWeaponInventory
      .getState()
      .setWeapons([
        { key: 'the_catch', level: 90, refinement: 1, location: 'raiden_shogun' },
      ]);
    useWeaponInventory
      .getState()
      .setWeapons([
        { key: 'amos_bow', level: 80, refinement: 5, location: null },
      ]);
    expect(useWeaponInventory.getState().weapons).toEqual([
      { key: 'amos_bow', level: 80, refinement: 5, location: null },
    ]);
  });

  it('clear empties the inventory', () => {
    useWeaponInventory
      .getState()
      .setWeapons([
        { key: 'the_catch', level: 90, refinement: 1, location: 'raiden_shogun' },
      ]);
    useWeaponInventory.getState().clear();
    expect(useWeaponInventory.getState().weapons).toEqual([]);
  });
});
