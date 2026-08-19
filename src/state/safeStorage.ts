import type { StateStorage } from 'zustand/middleware';

const memory = new Map<string, string>();

/**
 * The `storage` every persisted store uses. `localStorage` throws in Safari
 * private mode and when the quota is exceeded, and zustand only guards the
 * *access* of the storage object, not the get/set calls — a throw during store
 * creation happens at import time, before any error boundary exists to catch
 * it. Falling back to an in-memory map keeps the session working; it just
 * doesn't survive a reload.
 */
export const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name);
    } catch {
      return memory.get(name) ?? null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch {
      memory.set(name, value);
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch {
      memory.delete(name);
    }
  },
};
