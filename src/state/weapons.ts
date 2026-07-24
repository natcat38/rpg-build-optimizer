import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OwnedWeapon } from '../import/good';

interface WeaponInventoryState {
  /** Full owned weapon inventory (equipped + unequipped). */
  weapons: OwnedWeapon[];
  /** Replace wholesale: a GOOD export is a full account snapshot, so the
   *  latest import wins (no merge). */
  setWeapons: (weapons: OwnedWeapon[]) => void;
  clear: () => void;
}

export const useWeaponInventory = create<WeaponInventoryState>()(
  persist(
    (set) => ({
      weapons: [],
      setWeapons: (weapons) => set({ weapons }),
      clear: () => set({ weapons: [] }),
    }),
    { name: 'rpg-build-optimizer/weapons' },
  ),
);
