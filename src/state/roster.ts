import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { safeStorage } from './safeStorage';
import type { RosterEntry } from '../import/good';

interface RosterState {
  /** characterKey -> roster entry; key presence = the player owns them. */
  entries: Record<string, RosterEntry>;
  /** Replace wholesale: a GOOD export is a full account snapshot, so the
   *  latest import wins (no merge). */
  setRoster: (entries: Record<string, RosterEntry>) => void;
  clear: () => void;
}

export const useRoster = create<RosterState>()(
  persist(
    (set) => ({
      entries: {},
      setRoster: (entries) => set({ entries }),
      clear: () => set({ entries: {} }),
    }),
    {
      name: 'rpg-build-optimizer/roster',
      storage: createJSONStorage(() => safeStorage),
    },
  ),
);
