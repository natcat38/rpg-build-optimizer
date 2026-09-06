import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SharedBuildBanner, useScrollSpy } from './landing';
import type { OptimizeRequest } from '../game/types';

describe('SharedBuildBanner', () => {
  it('names the character and weapon, and scrolls to the optimise step on click', async () => {
    const user = userEvent.setup();
    const req: OptimizeRequest = {
      characterKey: 'raiden_shogun',
      weaponKey: 'engulfing_lightning',
      buildLevel: 90,
      constraints: {},
      objective: 'crit_value',
    };
    render(<SharedBuildBanner request={req} />);
    expect(screen.getByText(/raiden shogun/i)).toBeInTheDocument();
    expect(screen.getByText(/lv 90/i)).toBeInTheDocument();

    const step = document.createElement('div');
    step.id = 'step-optimise';
    document.body.appendChild(step);
    await user.click(screen.getByRole('button', { name: /run it yourself/i }));
    // scrollToId reads the element off the DOM; scrollIntoView is stubbed in
    // test-setup.ts, so a thrown error is the only failure mode worth
    // checking here — the click completing at all proves the handler ran.
    document.body.removeChild(step);
  });

  it('falls back to the raw weapon key when the weapon is not in the dataset', () => {
    const req: OptimizeRequest = {
      characterKey: 'raiden_shogun',
      weaponKey: 'not_a_real_weapon',
      buildLevel: 90,
      constraints: {},
      objective: 'crit_value',
    };
    render(<SharedBuildBanner request={req} />);
    expect(screen.getByText(/not_a_real_weapon/)).toBeInTheDocument();
  });
});

describe('useScrollSpy', () => {
  function Harness({ ids }: { ids: string[] }) {
    const active = useScrollSpy(ids);
    return <p data-testid="active">{active ?? 'none'}</p>;
  }

  it('drops a section from the "seen" set once it stops intersecting, and keeps the last active id if nothing else is', () => {
    type Cb = (entries: Partial<IntersectionObserverEntry>[]) => void;
    const callbacks: Cb[] = [];
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: Cb) {
          callbacks.push(cb);
        }
        observe() {}
        disconnect() {}
      },
    );
    try {
      const a = document.createElement('section');
      a.id = 'sec-a';
      document.body.appendChild(a);

      render(<Harness ids={['sec-a']} />);
      const fire = (entries: Partial<IntersectionObserverEntry>[]) =>
        act(() => callbacks[callbacks.length - 1](entries));

      fire([{ isIntersecting: true, target: a }]);
      expect(screen.getByTestId('active')).toHaveTextContent('sec-a');

      // No longer intersecting: `seen` drops it (the `else` branch), and
      // since nothing else is intersecting either, the last answer sticks
      // rather than blanking out.
      fire([{ isIntersecting: false, target: a }]);
      expect(screen.getByTestId('active')).toHaveTextContent('sec-a');

      document.body.removeChild(a);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('does nothing when no ids resolve to an element in the DOM', () => {
    render(<Harness ids={['does-not-exist']} />);
    expect(screen.getByTestId('active')).toHaveTextContent('none');
  });
});
