import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act, within } from '@testing-library/react';
import { App } from './App';
import { useInventory } from '../state/inventory';
import { useOptimizeRequest } from '../state/optimizeRequest';
import { useRoster } from '../state/roster';
import type { Artifact, BuildResult, OptimizeResult } from '../game/types';
import { SLOTS } from '../game/types';

const { optimize } = vi.hoisted(() => ({ optimize: vi.fn() }));
vi.mock('../workers/optimizeClient', () => ({ optimize }));

describe('App shell', () => {
  beforeEach(() => {
    useInventory.getState().clear();
    useOptimizeRequest.getState().reset();
    window.history.pushState({}, '', '/');
  });

  it('shows the empty-state import choices on first load', () => {
    render(<App />);
    expect(screen.getByText(/Upload GOOD export/i)).toBeInTheDocument();
    expect(screen.getByText(/Import by UID/i)).toBeInTheDocument();
  });

  it('shows a friendly fallback for an unreadable shared link', async () => {
    window.history.pushState({}, '', '/?b=garbage!!');
    render(<App />);
    // The persistent role="alert" region announces the short form; this is
    // the visible Callout's longer one.
    expect(
      await screen.findByText(/it may be from a newer version/i),
    ).toBeInTheDocument();
    window.history.pushState({}, '', '/');
  });
});

describe('App — overlapping optimise runs', () => {
  const SAMPLE_ARTIFACTS: Artifact[] = SLOTS.map((slot) => ({
    id: `sample-${slot}`,
    setKey: 'EmblemOfSeveredFate',
    slot,
    rarity: 5,
    level: 20,
    mainStat: 'hp',
    mainStatValue: 4780,
    subStats: [],
  }));

  function makeResult(tag: number): OptimizeResult {
    const build: BuildResult = {
      artifactIds: Object.fromEntries(
        SLOTS.map((s) => [s, `sample-${s}`]),
      ) as Record<(typeof SLOTS)[number], string>,
      totals: { hp: 4780 },
      objectiveValue: tag,
      score: tag,
      diagnostics: {
        bindingConstraints: [],
        marginalBySlot: {},
        explored: tag,
        pruned: 0,
      },
    };
    return { status: 'ok', builds: [build], explored: tag, pruned: 0 };
  }

  beforeEach(() => {
    optimize.mockReset();
    useInventory.getState().clear();
    useInventory.getState().addMany(SAMPLE_ARTIFACTS);
    useOptimizeRequest.getState().reset();
    window.history.pushState({}, '', '/');
  });

  it('does not let a stale run overwrite a newer one, even when both fire before either commits', async () => {
    // Two deferred, independently-resolvable optimize() calls.
    let resolveA!: (r: OptimizeResult) => void;
    let resolveB!: (r: OptimizeResult) => void;
    const pendingA = new Promise<OptimizeResult>((r) => (resolveA = r));
    const pendingB = new Promise<OptimizeResult>((r) => (resolveB = r));
    optimize.mockReturnValueOnce(pendingA).mockReturnValueOnce(pendingB);

    render(<App />);
    const optimiseBtn = screen.getByRole('button', { name: /^optimise$/i });
    const sampleBtn = screen.getByRole('button', { name: /^furina$/i });

    // Fire both triggers inside a single act() batch, before React commits
    // run A's `running=true` (and therefore before any disabled attribute
    // reaches the DOM) — the same-tick double-trigger a fast click or a
    // future programmatic caller could produce, independent of the
    // disabled-button mitigation.
    act(() => {
      optimiseBtn.click();
      sampleBtn.click();
    });
    expect(optimize).toHaveBeenCalledTimes(2);

    // Run B (started second) resolves first...
    await act(async () => {
      resolveB(makeResult(222));
      await pendingB;
    });
    expect(screen.getByText(/explored/i)).toHaveTextContent('222');

    // ...then run A (started first) resolves late. Its stale result must
    // NOT clobber B's, which is the one the user is now looking at.
    await act(async () => {
      resolveA(makeResult(111));
      await pendingA;
    });
    expect(screen.getByText(/explored/i)).toHaveTextContent('222');
  });
});

describe('App — step nav', () => {
  beforeEach(() => {
    useInventory.getState().clear();
    useRoster.getState().clear();
  });
  afterEach(() => useRoster.getState().clear());

  it('renders a sticky step nav with anchors when a roster exists', () => {
    useRoster.getState().setRoster({ amber: { level: 90 } });
    render(<App />);
    const nav = screen.getByRole('navigation', { name: /steps/i });
    ['Load', 'Roster', 'Teams', 'Plan', 'Optimise'].forEach((label) =>
      expect(
        within(nav).getByRole('link', { name: new RegExp(label, 'i') }),
      ).toBeInTheDocument(),
    );
  });

  it('shows the step nav before an import, with the roster steps locked', () => {
    render(<App />);
    const nav = screen.getByRole('navigation', { name: /steps/i });
    // Load and Optimise exist without a roster, so the nav has somewhere to go.
    expect(
      within(nav).getByRole('link', { name: /load/i }),
    ).toBeInTheDocument();
    expect(
      within(nav).getByRole('link', { name: /optimise/i }),
    ).toBeInTheDocument();
    // Roster/Teams/Plan are ghosted, not links: there is nothing to scroll to.
    const locked = within(nav).getAllByTitle(/unlock this step/i);
    expect(locked).toHaveLength(3);
    for (const chip of locked)
      expect(chip).toHaveAttribute('aria-disabled', 'true');
    expect(within(nav).queryByRole('link', { name: /roster/i })).toBeNull();
  });

  it('leaves Results out of the numbered steps', () => {
    useRoster.getState().setRoster({ amber: { level: 90 } });
    render(<App />);
    const nav = screen.getByRole('navigation', { name: /steps/i });
    expect(
      within(nav).getByRole('link', { name: /optimise/i }),
    ).toHaveTextContent('05');
    // No results yet, so no Results chip at all — and when there is one it
    // carries no number.
    expect(within(nav).queryByText('06')).toBeNull();
  });

  it('marks the section in view with aria-current, topmost first', () => {
    // jsdom has no IntersectionObserver, and a real browser only runs one on
    // a visible page — so drive the callback directly.
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
    useRoster.getState().setRoster({ amber: { level: 90 } });
    render(<App />);
    const nav = screen.getByRole('navigation', { name: /steps/i });
    const fire = (...entries: Partial<IntersectionObserverEntry>[]) =>
      act(() => callbacks[callbacks.length - 1](entries));

    fire({
      isIntersecting: true,
      target: document.getElementById('step-teams')!,
    });
    expect(within(nav).getByRole('link', { name: /teams/i })).toHaveAttribute(
      'aria-current',
      'true',
    );

    // Two sections straddling the band: the earlier one in page order wins,
    // because aria-current needs exactly one answer.
    fire({
      isIntersecting: true,
      target: document.getElementById('step-roster')!,
    });
    expect(within(nav).getByRole('link', { name: /roster/i })).toHaveAttribute(
      'aria-current',
      'true',
    );
    expect(
      within(nav).getByRole('link', { name: /teams/i }),
    ).not.toHaveAttribute('aria-current');

    vi.unstubAllGlobals();
  });
});
