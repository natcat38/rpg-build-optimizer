import { describe, it, expect, vi, afterEach } from 'vitest';
import { safeStorage } from './safeStorage';
import { useInventory } from './inventory';

function breakLocalStorage() {
  const boom = () => {
    throw new DOMException('QuotaExceededError');
  };
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(boom);
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(boom);
  vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(boom);
}

describe('safeStorage', () => {
  afterEach(() => vi.restoreAllMocks());

  it('reads and writes through to localStorage when it works', () => {
    safeStorage.setItem('k', 'v');
    expect(safeStorage.getItem('k')).toBe('v');
    safeStorage.removeItem('k');
    expect(safeStorage.getItem('k')).toBeNull();
  });

  it('falls back to memory when localStorage throws', () => {
    breakLocalStorage();
    expect(() => safeStorage.setItem('boom', 'v')).not.toThrow();
    expect(safeStorage.getItem('boom')).toBe('v');
    expect(() => safeStorage.removeItem('boom')).not.toThrow();
    expect(safeStorage.getItem('boom')).toBeNull();
  });

  it('keeps the persisted stores usable when localStorage throws', () => {
    breakLocalStorage();
    expect(() => useInventory.getState().clear()).not.toThrow();
    expect(useInventory.getState().artifacts).toEqual([]);
  });
});
