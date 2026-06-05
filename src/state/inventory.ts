import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Artifact } from '../game/types';

interface InventoryState {
  artifacts: Artifact[];
  add: (a: Artifact) => void;
  addMany: (a: Artifact[]) => void;
  update: (id: string, patch: Partial<Artifact>) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useInventory = create<InventoryState>()(
  persist(
    (set) => ({
      artifacts: [],
      add: (a) => set((s) => ({ artifacts: [...s.artifacts, a] })),
      addMany: (items) => set((s) => ({ artifacts: [...s.artifacts, ...items] })),
      update: (id, patch) =>
        set((s) => ({ artifacts: s.artifacts.map((a) => (a.id === id ? { ...a, ...patch } : a)) })),
      remove: (id) => set((s) => ({ artifacts: s.artifacts.filter((a) => a.id !== id) })),
      clear: () => set({ artifacts: [] }),
    }),
    { name: 'rpg-build-optimizer/inventory' },
  ),
);
