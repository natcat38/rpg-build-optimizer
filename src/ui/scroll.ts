/**
 * Scrolling cues between page sections.
 * @packageDocumentation
 */

/** Scroll a section into view, honouring the OS reduced-motion setting —
 *  an explicit `behavior` beats the CSS `prefers-reduced-motion` override,
 *  so the check has to happen here rather than in the stylesheet. */
export function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({
    behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth',
  });
}

/** Scroll a horizontally scrolling strip (the step nav) so `child` sits in its
 *  middle. Sets the strip's own `scrollLeft`: `scrollIntoView` would also move
 *  the page. Reads `offsetLeft`, so `container` must be the child's offset
 *  parent (positioned). */
export function centerInScroller(container: HTMLElement, child: HTMLElement) {
  const max = container.scrollWidth - container.clientWidth;
  if (max <= 0) return;
  const left =
    child.offsetLeft - (container.clientWidth - child.offsetWidth) / 2;
  container.scrollTo({
    left: Math.min(max, Math.max(0, left)),
    behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth',
  });
}
