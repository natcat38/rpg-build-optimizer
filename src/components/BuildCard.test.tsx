import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BuildCard } from './BuildCard';
import type { Artifact, BuildResult, OptimizeRequest } from '../game/types';

const artifacts: Artifact[] = [];

const build: BuildResult = {
  artifactIds: { flower: '', plume: '', sands: '', goblet: '', circlet: '' },
  totals: { crit_rate: 70, crit_dmg: 100 },
  objectiveValue: 200,
  score: 200,
  diagnostics: {
    bindingConstraints: [],
    marginalBySlot: {},
    explored: 0,
    pruned: 0,
  },
};

describe('BuildCard grade badge', () => {
  it('shows a grade badge and per-stat breakdown for a character with statTargets', () => {
    const req: OptimizeRequest = {
      characterKey: 'xiao', // statTargets: { crit_rate: 70 }
      weaponKey: 'w',
      buildLevel: 90,
      constraints: {},
      objective: 'crit_value',
    };
    render(<BuildCard build={build} request={req} artifacts={artifacts} />);
    // The bare letter is a code, so the marker carries the whole sentence as
    // its accessible name rather than announcing "S".
    expect(
      screen.getByRole('img', {
        name: /Grade S — how close this build is to endgame stat targets/i,
      }),
    ).toHaveTextContent('S');
    expect(screen.getByText(/CRIT Rate 70%\/70%/)).toBeInTheDocument();
  });

  it('surfaces the weakest stat when the grade is short of S', () => {
    const req: OptimizeRequest = {
      characterKey: 'yelan', // statTargets: { hp: 30000, crit_rate: 70, crit_dmg: 140 }
      weaponKey: 'w',
      buildLevel: 90,
      constraints: {},
      objective: 'crit_value',
    };
    render(<BuildCard build={build} request={req} artifacts={artifacts} />);
    expect(screen.getByText(/Weakest: HP/i)).toBeInTheDocument();
  });

  it('omits the grade badge for a character without statTargets', () => {
    const req: OptimizeRequest = {
      characterKey: 'furina', // no statTargets sourced
      weaponKey: 'w',
      buildLevel: 90,
      constraints: {},
      objective: 'crit_value',
    };
    render(<BuildCard build={build} request={req} artifacts={artifacts} />);
    expect(screen.queryByText(/Weakest:/i)).toBeNull();
  });

  it('omits the grade badge for a character with no meta recipe at all', () => {
    const req: OptimizeRequest = {
      characterKey: 'zzz_not_meta',
      weaponKey: 'w',
      buildLevel: 90,
      constraints: {},
      objective: 'crit_value',
    };
    render(<BuildCard build={build} request={req} artifacts={artifacts} />);
    expect(screen.queryByText(/Weakest:/i)).toBeNull();
  });
});

describe('objective hint', () => {
  const req: OptimizeRequest = {
    characterKey: 'neuvillette',
    weaponKey: 'w',
    buildLevel: 90,
    constraints: {},
    objective: 'avg_damage',
  };

  // The hint belongs to the *ranking*, not to each build, so it now renders
  // once above the results list (Results.test.tsx) instead of on every card.
  it('does not repeat the ranking explanation on the card', () => {
    render(<BuildCard build={build} request={req} artifacts={artifacts} />);
    expect(screen.queryByText(/estimated damage/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Crit Value = 2/)).not.toBeInTheDocument();
  });
});

describe('BuildCard artifact line', () => {
  const req: OptimizeRequest = {
    characterKey: 'zzz_not_meta',
    weaponKey: 'w',
    buildLevel: 90,
    constraints: {},
    objective: 'crit_value',
  };
  const flower: Artifact = {
    id: 'f',
    setKey: 'EmblemOfSeveredFate',
    slot: 'flower',
    rarity: 5,
    level: 20,
    mainStat: 'hp',
    mainStatValue: 4780,
    subStats: [{ key: 'crit_dmg', value: 14.8 }],
  };

  it('prints the main-stat value, not the level, beside the stat name', () => {
    render(<BuildCard build={build} request={req} artifacts={[flower]} />);
    expect(screen.getByText('4780')).toBeInTheDocument();
    // The level is its own chip, so "HP +20" can't be read as a 20-HP piece.
    expect(screen.getByText('Lv 20')).toBeInTheDocument();
  });

  it('carries the percent unit on percent stats', () => {
    render(<BuildCard build={build} request={req} artifacts={[flower]} />);
    // Sub-stat value.
    expect(screen.getByText('+14.8%')).toBeInTheDocument();
    // Totals row: crit_rate 70 is a percentage, not a flat 70.
    expect(screen.getByText('70.0%')).toBeInTheDocument();
  });
});

describe('BuildCard non-finite scores', () => {
  it('renders a dash instead of NaN for a non-finite objective and totals', () => {
    const req: OptimizeRequest = {
      characterKey: 'unknown-character',
      weaponKey: 'w',
      buildLevel: 90,
      constraints: {},
      objective: 'crit_value',
    };
    render(
      <BuildCard
        build={{
          ...build,
          objectiveValue: NaN,
          totals: { crit_rate: Infinity, crit_dmg: 100 },
        }}
        request={req}
        artifacts={artifacts}
      />,
    );
    expect(screen.queryByText(/NaN|Infinity/)).not.toBeInTheDocument();
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });
});

const markReq: OptimizeRequest = {
  characterKey: 'c',
  weaponKey: 'w',
  buildLevel: 90,
  constraints: {},
  objective: 'crit_value',
};

describe('BuildCard slot marks', () => {
  it('draws every mark, all decorative, with no stray accessible name', () => {
    const { container } = render(
      <BuildCard build={build} request={markReq} artifacts={artifacts} />,
    );
    const svgs = container.querySelectorAll('svg');
    // Five in the piece list plus five in the fingerprint row beside the score.
    expect(svgs.length).toBeGreaterThanOrEqual(10);
    for (const svg of svgs)
      expect(svg.getAttribute('aria-hidden')).toBe('true');
    // The slot names are still spelled out — the marks add to the text, never
    // replace it.
    expect(screen.getByText('Flower')).toBeInTheDocument();
    expect(screen.getByText('Goblet')).toBeInTheDocument();
  });

  it('renders a delta chip only when given one', () => {
    const { rerender } = render(
      <BuildCard
        build={build}
        request={markReq}
        artifacts={artifacts}
        rank={1}
      />,
    );
    expect(screen.queryByText(/^−/)).toBeNull();
    rerender(
      <BuildCard
        build={build}
        request={markReq}
        artifacts={artifacts}
        rank={2}
        delta={-12.5}
      />,
    );
    expect(screen.getByText('−12.5')).toBeInTheDocument();
  });
});

describe('BuildCard — what drives the build', () => {
  const req: OptimizeRequest = {
    characterKey: 'furina', // no statTargets, so nothing else competes for the eye
    weaponKey: 'w',
    buildLevel: 90,
    constraints: {},
    objective: 'crit_value',
  };
  const explained: BuildResult = {
    ...build,
    diagnostics: {
      bindingConstraints: ['Set requirement: 4pc Emblem of Severed Fate'],
      marginalBySlot: { flower: 12.5, circlet: 40 },
      explored: 1,
      pruned: 0,
    },
  };

  it('keeps the notes collapsed until the reader opens them', async () => {
    const user = userEvent.setup();
    render(<BuildCard build={explained} request={req} artifacts={[]} />);
    const summary = screen.getByText(/What’s driving this build/i);
    expect(screen.getByText(/4pc Emblem of Severed Fate/)).not.toBeVisible();

    await user.click(summary);
    expect(screen.getByText(/4pc Emblem of Severed Fate/)).toBeVisible();
    expect(screen.getByText(/Where the score comes from/i)).toBeVisible();
    // One line per slot the diagnostics actually measured — not all five.
    expect(screen.getByText('40.0')).toBeInTheDocument();
    expect(screen.getByText('12.5')).toBeInTheDocument();
  });

  it('shows the notes on rank 1 only', () => {
    const { rerender } = render(
      <BuildCard build={explained} request={req} artifacts={[]} rank={1} />,
    );
    expect(screen.getByText(/What’s driving this build/i)).toBeInTheDocument();
    rerender(
      <BuildCard build={explained} request={req} artifacts={[]} rank={2} />,
    );
    expect(screen.queryByText(/What’s driving this build/i)).toBeNull();
  });

  it('renders nothing when there are no diagnostics to show', () => {
    render(<BuildCard build={build} request={req} artifacts={[]} />);
    expect(screen.queryByText(/What’s driving this build/i)).toBeNull();
  });

  it('states what an activated 4pc assumes', async () => {
    const user = userEvent.setup();
    const piece = (id: string, slot: Artifact['slot']): Artifact => ({
      id,
      setKey: 'BlizzardStrayer',
      slot,
      rarity: 5,
      level: 20,
      mainStat: 'hp',
      mainStatValue: 4780,
      subStats: [],
    });
    const four: Artifact[] = [
      piece('a1', 'flower'),
      piece('a2', 'plume'),
      piece('a3', 'sands'),
      piece('a4', 'goblet'),
    ];
    render(<BuildCard build={explained} request={req} artifacts={four} />);
    await user.click(screen.getByText(/What’s driving this build/i));
    expect(
      screen.getByText(/Blizzard Strayer 4pc: Assumes the target is Frozen/),
    ).toBeVisible();
  });

  it('says nothing about sets when no 4pc is activated', () => {
    render(<BuildCard build={explained} request={req} artifacts={[]} />);
    expect(screen.queryByText(/4pc: Assumes/)).toBeNull();
  });
});
