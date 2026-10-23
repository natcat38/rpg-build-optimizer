/**
 * Subscribe to a CSS media query. Reads the match synchronously on first
 * render, so a layout that branches on it never paints the wrong variant and
 * then jumps. jsdom and any host without `matchMedia` report `false`.
 * @packageDocumentation
 */

import { useSyncExternalStore } from 'react';

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (notify) => {
      const mq = window.matchMedia?.(query);
      mq?.addEventListener('change', notify);
      return () => mq?.removeEventListener('change', notify);
    },
    () => window.matchMedia?.(query).matches ?? false,
    () => false,
  );
}
