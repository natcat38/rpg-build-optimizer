import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Artifact } from '../game/types';

interface InventoryState {
  artifacts: Artifact[];
  add: (a: Artifact) => void;
  addMany: (a: Artifact[]) => void;
  clear: () => void;
}

export const useInventory = create<InventoryState>()(
  persist(
    (set) => ({
      artifacts: [],
      add: (a) => set((s) => ({ artifacts: [...s.artifacts, a] })),
      addMany: (items) =>
        set((s) => ({ artifacts: [...s.artifacts, ...items] })),
      clear: () => set({ artifacts: [] }),
    }),
    { name: 'rpg-build-optimizer/inventory' },
  ),
);
