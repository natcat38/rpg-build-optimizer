import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Results } from './Results';
import type { Artifact, OptimizeResult, OptimizeRequest } from '../game/types';

const req: OptimizeRequest = {
  characterKey: 'c',
  weaponKey: 'w',
  buildLevel: 90,
  constraints: {},
  objective: 'crit_value',
};

describe('Results', () => {
  it('shows the infeasible message when there are no builds', () => {
    const r: OptimizeResult = {
      status: 'infeasible',
      explored: 10,
      pruned: 2,
    };
    render(<Results result={r} request={req} artifactsById={{}} />);
    expect(
      screen.getByText(/No build satisfies all constraints/i),
    ).toBeInTheDocument();
  });

  it('renders one card per build with its objective value and pieces', () => {
    const artifactsById: Record<string, Artifact> = {
      f: {
        id: 'f',
        setKey: 'EmblemOfSeveredFate',
        slot: 'flower',
        rarity: 5,
        level: 20,
        mainStat: 'hp',
        mainStatValue: 4780,
        subStats: [],
      },
      p: {
        id: 'p',
        setKey: 'EmblemOfSeveredFate',
        slot: 'plume',
        rarity: 5,
        level: 20,
        mainStat: 'atk',
        mainStatValue: 311,
        subStats: [],
      },
      s: {
        id: 's',
        setKey: 'EmblemOfSeveredFate',
        slot: 'sands',
        rarity: 5,
        level: 20,
        mainStat: 'atk_pct',
        mainStatValue: 46.6,
        subStats: [],
      },
      g: {
        id: 'g',
        setKey: 'EmblemOfSeveredFate',
        slot: 'goblet',
        rarity: 5,
        level: 20,
        mainStat: 'elemental_dmg',
        mainStatValue: 46.6,
        subStats: [],
      },
      c: {
        id: 'c',
        setKey: 'NoblesseOblige',
        slot: 'circlet',
        rarity: 5,
        level: 20,
        mainStat: 'crit_rate',
        mainStatValue: 31.1,
        subStats: [],
      },
    };
    const r: OptimizeResult = {
      status: 'ok',
      explored: 100,
      pruned: 50,
      builds: [
        {
          artifactIds: {
            flower: 'f',
            plume: 'p',
            sands: 's',
            goblet: 'g',
            circlet: 'c',
          },
          totals: { crit_rate: 60, crit_dmg: 120, atk: 2000 },
          objectiveValue: 240,
          score: 240,
          diagnostics: {
            bindingConstraints: [],
            marginalBySlot: {},
            explored: 100,
            pruned: 50,
          },
        },
      ],
    };
    render(<Results result={r} request={req} artifactsById={artifactsById} />);
    expect(screen.getByText(/240/)).toBeInTheDocument();
    expect(
      screen.getAllByText(/Emblem of Severed Fate/i).length,
    ).toBeGreaterThan(0);
  });

  it('explains the ranking metric once, not once per card', () => {
    const build = {
      artifactIds: {
        flower: 'f',
        plume: 'p',
        sands: 's',
        goblet: 'g',
        circlet: 'c',
      },
      totals: { crit_rate: 60 },
      objectiveValue: 240,
      score: 240,
      diagnostics: {
        bindingConstraints: [],
        marginalBySlot: {},
        explored: 1,
        pruned: 0,
      },
    };
    const r: OptimizeResult = {
      status: 'ok',
      explored: 100,
      pruned: 50,
      builds: [build, { ...build }, { ...build }],
    };
    render(<Results result={r} request={req} artifactsById={{}} />);
    expect(screen.getAllByText(/Crit Value = 2/)).toHaveLength(1);
  });

  it('hides the exact-search panel for a shared build that searched nothing', () => {
    const r: OptimizeResult = {
      status: 'ok',
      explored: 0,
      pruned: 0,
      builds: [
        {
          artifactIds: {
            flower: 'f',
            plume: 'p',
            sands: 's',
            goblet: 'g',
            circlet: 'c',
          },
          totals: {},
          objectiveValue: 12,
          score: 12,
          diagnostics: {
            bindingConstraints: [],
            marginalBySlot: {},
            explored: 0,
            pruned: 0,
          },
        },
      ],
    };
    render(<Results result={r} request={req} artifactsById={{}} />);
    expect(screen.queryByText(/Exact search/i)).toBeNull();
    expect(screen.queryByText(/Explored/i)).toBeNull();
  });

  it('reports the search when one actually ran', () => {
    const r: OptimizeResult = {
      status: 'ok',
      explored: 7,
      pruned: 3,
      builds: [],
    };
    render(<Results result={r} request={req} artifactsById={{}} />);
    expect(screen.getByText(/Exact search/i)).toBeInTheDocument();
  });
});

/** A build whose only interesting property is its score and its circlet. */
function scored(objectiveValue: number, circlet: string) {
  return {
    artifactIds: {
      flower: 'f',
      plume: 'p',
      sands: 's',
      goblet: 'g',
      circlet,
    },
    totals: { crit_rate: 60 },
    objectiveValue,
    score: objectiveValue,
    diagnostics: {
      bindingConstraints: [],
      marginalBySlot: {},
      explored: 1,
      pruned: 0,
    },
  };
}

const circletsById: Record<string, Artifact> = {
  c1: {
    id: 'c1',
    setKey: 'NoblesseOblige',
    slot: 'circlet',
    rarity: 5,
    level: 20,
    mainStat: 'crit_rate',
    mainStatValue: 31.1,
    subStats: [],
  },
  c2: {
    id: 'c2',
    setKey: 'GladiatorsFinale',
    slot: 'circlet',
    rarity: 5,
    level: 20,
    mainStat: 'crit_rate',
    mainStatValue: 31.1,
    subStats: [],
  },
};

describe('Results ties and deltas', () => {
  it('collapses exactly-tied builds into one card that names what differs', () => {
    const r: OptimizeResult = {
      status: 'ok',
      explored: 100,
      pruned: 50,
      builds: [scored(240, 'c1'), scored(240, 'c2'), scored(230, 'c1')],
    };
    render(<Results result={r} request={req} artifactsById={circletsById} />);
    // Two cards, not three: the tie is one answer, shown once.
    expect(screen.getAllByText(/240\.0/)).toHaveLength(1);
    expect(
      screen.getByText(/×2 equivalent variants.*circlet set differs/i),
    ).toBeInTheDocument();
  });

  it('shows a delta against rank 1 on runners-up only', () => {
    const r: OptimizeResult = {
      status: 'ok',
      explored: 100,
      pruned: 50,
      builds: [scored(240, 'c1'), scored(236.6, 'c2')],
    };
    render(<Results result={r} request={req} artifactsById={circletsById} />);
    expect(screen.getByText('−3.4')).toBeInTheDocument();
    expect(screen.queryByText('−0.0')).toBeNull();
  });

  it('holds ranks 4+ behind a reveal', async () => {
    const user = userEvent.setup();
    const builds = [250, 240, 230, 220, 210].map((v, i) =>
      scored(v, i % 2 === 0 ? 'c1' : 'c2'),
    );
    const r: OptimizeResult = {
      status: 'ok',
      explored: 100,
      pruned: 50,
      builds,
    };
    render(<Results result={r} request={req} artifactsById={circletsById} />);
    expect(screen.queryByText(/220\.0/)).toBeNull();

    await user.click(
      screen.getByRole('button', { name: /Show all 5 builds/i }),
    );
    expect(screen.getByText(/220\.0/)).toBeInTheDocument();
    expect(screen.getByText(/210\.0/)).toBeInTheDocument();
  });

  it('explains a short list rather than letting it read as a bug', () => {
    const r: OptimizeResult = {
      status: 'ok',
      explored: 100,
      pruned: 50,
      builds: [scored(240, 'c1'), scored(230, 'c2')],
    };
    render(<Results result={r} request={req} artifactsById={circletsById} />);
    expect(
      screen.getByText(/2 builds shown — near-duplicates/i),
    ).toBeInTheDocument();
  });

  it('says nothing about list length for a shared build that never searched', () => {
    const r: OptimizeResult = {
      status: 'ok',
      explored: 0,
      pruned: 0,
      builds: [scored(240, 'c1')],
    };
    render(<Results result={r} request={req} artifactsById={circletsById} />);
    expect(screen.queryByText(/builds shown/i)).toBeNull();
  });
});
