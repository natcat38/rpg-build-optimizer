/**
 * `useScrollSpy` — which nav chip is current. Lives apart from `landing.tsx`,
 * which exports components (react-refresh/only-export-components).
 * @packageDocumentation
 */

import { useEffect, useState } from 'react';

/** How far down the screen (as a fraction) a heading must have climbed before
 *  its section counts as current: the upper half is "where the reader is". */
const LINE = 0.4;

/**
 * Which nav chip the reader is looking at. `aria-current` needs a single
 * answer: the section whose top edge is lowest while still above the line,
 * i.e. the last one the reader has scrolled past. That is order-independent,
 * so it also works when the page is two panes and DOM order is not reading
 * order. Reads on scroll rather than through an IntersectionObserver: a
 * strip- or band-shaped observer says nothing in the gaps between sections
 * or while a short, folded section slides through it, and it lagged a whole
 * section behind ("03 Teams" lit with "04 Plan" on screen).
 */
export function useScrollSpy(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  // The id set changed, so the previous answer describes a nav that no longer
  // exists: clear it and let the effect below decide. Done in the render pass,
  // not an effect — React re-runs this pass before painting, so
  // `aria-current` never lands on a chip that is gone.
  const [spiedIds, setSpiedIds] = useState(ids);
  if (spiedIds !== ids) {
    setSpiedIds(ids);
    setActive(null);
  }
  useEffect(() => {
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((e): e is HTMLElement => e !== null);
    if (els.length === 0) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const root = document.documentElement;
      const line = window.innerHeight * LINE;
      // At the very bottom the last section may be too short to ever reach
      // the line; whichever is lowest on screen is then the current one.
      const atBottom =
        root.scrollHeight > window.innerHeight &&
        window.innerHeight + window.scrollY >= root.scrollHeight - 2;
      let best: HTMLElement | null = null;
      let bestTop = -Infinity;
      for (const el of els) {
        const top = el.getBoundingClientRect().top;
        if ((atBottom || top <= line) && top > bestTop) {
          best = el;
          bestTop = top;
        }
      }
      setActive(best ? best.id : null);
    };
    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame !== 0) cancelAnimationFrame(frame);
    };
    // `ids` is a memoised array from the caller: a fresh array every render
    // would tear down and re-subscribe on every render.
  }, [ids]);
  return active;
}
