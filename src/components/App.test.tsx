import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { App } from './App';
import { useInventory } from '../state/inventory';
import { useOptimizeRequest } from '../state/optimizeRequest';
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
    expect(
      await screen.findByText(/This shared build couldn't be read/i),
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
