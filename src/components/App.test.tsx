import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import { useInventory } from '../state/inventory';
import { useOptimizeRequest } from '../state/optimizeRequest';
import { useRoster } from '../state/roster';
import { useWeaponInventory } from '../state/weapons';
import { useBuildCache } from '../state/buildCache';
import type { Artifact, BuildResult, OptimizeResult } from '../game/types';
import { SLOTS } from '../game/types';

const { optimize } = vi.hoisted(() => ({ optimize: vi.fn() }));
vi.mock('../workers/optimizeClient', () => ({ optimize }));

describe('App shell', () => {
  beforeEach(() => {
    useInventory.getState().clear();
    useOptimizeRequest.getState().reset();
    useRoster.getState().clear();
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

  it('shows the roster dashboard instead of OptimizePanel once a roster is imported', () => {
    useRoster.getState().setRoster({ furina: {} });
    render(<App />);
    expect(screen.getByText(/Your roster/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^optimise$/i })).toBeNull();
  });

  it('shows the classic Optimise flow when the roster is empty', () => {
    render(<App />);
    expect(
      screen.getByRole('button', { name: /^optimise$/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Your roster/i)).toBeNull();
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
    useRoster.getState().clear();
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

describe('App — auto-run on character selection', () => {
  // Not "sample-"-prefixed: keeps sampleMode false so the App shows the
  // roster dashboard instead of also rendering SampleGear's own "Furina"
  // preset button (which would collide with the roster card's text).
  const OWNED_ARTIFACTS: Artifact[] = SLOTS.map((slot) => ({
    id: `owned-${slot}`,
    setKey: 'EmblemOfSeveredFate',
    slot,
    rarity: 5,
    level: 20,
    mainStat: 'hp',
    mainStatValue: 4780,
    subStats: [],
  }));

  function makeResult(): OptimizeResult {
    const build: BuildResult = {
      artifactIds: Object.fromEntries(
        SLOTS.map((s) => [s, `owned-${s}`]),
      ) as Record<(typeof SLOTS)[number], string>,
      totals: { hp: 4780 },
      objectiveValue: 1,
      score: 1,
      diagnostics: {
        bindingConstraints: [],
        marginalBySlot: {},
        explored: 1,
        pruned: 0,
      },
    };
    return { status: 'ok', builds: [build], explored: 1, pruned: 0 };
  }

  beforeEach(() => {
    optimize.mockReset();
    optimize.mockResolvedValue(makeResult());
    useInventory.getState().clear();
    useInventory.getState().addMany(OWNED_ARTIFACTS);
    useOptimizeRequest.getState().reset();
    useRoster.getState().clear();
    useWeaponInventory.getState().clear();
    useBuildCache.getState().clear();
    window.history.pushState({}, '', '/');
  });

  it('auto-runs the optimizer for a curated character with an owned weapon, no click needed', async () => {
    useRoster.getState().setRoster({ furina: { weaponKey: 'favonius_sword' } });
    render(<App />);
    await userEvent.click(screen.getByText('Furina'));
    await act(async () => {
      await Promise.resolve();
    });
    expect(optimize).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/explored/i)).toBeInTheDocument();
  });

  it('writes the auto-run solve into the shared build cache', async () => {
    useRoster.getState().setRoster({ furina: { weaponKey: 'favonius_sword' } });
    render(<App />);
    await userEvent.click(screen.getByText('Furina'));
    await act(async () => {
      await Promise.resolve();
    });
    const cached = useBuildCache.getState().builds.furina;
    expect(cached?.result).toEqual(makeResult());
    expect(cached?.request.characterKey).toBe('furina');
  });

  it('does not auto-run for an uncurated character', async () => {
    useRoster.getState().setRoster({ zzz_not_curated: {} });
    render(<App />);
    await userEvent.click(screen.getByText('zzz_not_curated'));
    await act(async () => {
      await Promise.resolve();
    });
    expect(optimize).not.toHaveBeenCalled();
  });

  it('serves a cached solve instead of calling optimize again', async () => {
    useRoster.getState().setRoster({ furina: { weaponKey: 'favonius_sword' } });
    const artifacts = useInventory.getState().artifacts;
    const ownedWeapons = useWeaponInventory.getState().weapons;
    const rosterEntries = useRoster.getState().entries;
    useBuildCache.getState().setBuild('furina', {
      request: {
        characterKey: 'furina',
        weaponKey: 'favonius_sword',
        buildLevel: 90,
        objective: 'crit_value',
        constraints: {
          setRequirement: { kind: '4pc', setKey: 'GoldenTroupe' },
          mainStatLocks: { sands: 'hp_pct', goblet: 'elemental_dmg' },
          minStats: { er_pct: 130 },
        },
        topK: 10,
      },
      result: makeResult(),
      artifacts,
      ownedWeapons,
      rosterEntries,
    });
    render(<App />);
    await userEvent.click(screen.getByText('Furina'));
    await act(async () => {
      await Promise.resolve();
    });
    expect(optimize).not.toHaveBeenCalled();
    expect(screen.getByText(/explored/i)).toBeInTheDocument();
  });

  it('auto-runs correctly from a hashchange event even when roster/weapons/artifacts were empty at mount', async () => {
    // Mount with nothing loaded (empty roster/weapons/artifacts), then
    // populate them afterward and drive selection via hashchange (the same
    // path a browser back/forward navigation takes) rather than a click —
    // regression test for the hash-route effect's listener closing over
    // stale, mount-time store values instead of reading them fresh.
    useInventory.getState().clear();
    render(<App />);

    act(() => {
      useRoster
        .getState()
        .setRoster({ furina: { weaponKey: 'favonius_sword' } });
      useInventory.getState().addMany(OWNED_ARTIFACTS);
    });

    await act(async () => {
      window.history.pushState({}, '', '#/c/furina');
      window.dispatchEvent(new Event('hashchange'));
      await Promise.resolve();
    });

    expect(optimize).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/explored/i)).toBeInTheDocument();
  });
});
