import { describe, it, expect, vi } from 'vitest';
import { centerInScroller } from './scroll';

function strip(opts: {
  scrollWidth: number;
  clientWidth: number;
  chipLeft: number;
  chipWidth: number;
}) {
  const container = document.createElement('nav');
  Object.defineProperty(container, 'scrollWidth', { value: opts.scrollWidth });
  Object.defineProperty(container, 'clientWidth', { value: opts.clientWidth });
  const scrollTo = vi.fn();
  container.scrollTo = scrollTo as unknown as typeof container.scrollTo;
  const chip = document.createElement('a');
  Object.defineProperty(chip, 'offsetLeft', { value: opts.chipLeft });
  Object.defineProperty(chip, 'offsetWidth', { value: opts.chipWidth });
  return { container, chip, scrollTo };
}

describe('centerInScroller', () => {
  it('scrolls the strip so the chip sits in the middle', () => {
    // 390 px strip, 700 px of chips; a 100 px chip at x=369 -> left edge 224.
    const { container, chip, scrollTo } = strip({
      scrollWidth: 700,
      clientWidth: 390,
      chipLeft: 369,
      chipWidth: 100,
    });
    centerInScroller(container, chip);
    expect(scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ left: 224 }),
    );
  });

  it('clamps to both ends of the strip', () => {
    const near = strip({
      scrollWidth: 700,
      clientWidth: 390,
      chipLeft: 10,
      chipWidth: 80,
    });
    centerInScroller(near.container, near.chip);
    expect(near.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ left: 0 }),
    );
    const far = strip({
      scrollWidth: 700,
      clientWidth: 390,
      chipLeft: 640,
      chipWidth: 60,
    });
    centerInScroller(far.container, far.chip);
    expect(far.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ left: 310 }),
    );
  });

  it('does nothing when the strip does not overflow', () => {
    const { container, chip, scrollTo } = strip({
      scrollWidth: 390,
      clientWidth: 390,
      chipLeft: 200,
      chipWidth: 80,
    });
    centerInScroller(container, chip);
    expect(scrollTo).not.toHaveBeenCalled();
  });
});
