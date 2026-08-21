import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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
    expect(screen.getByText('S')).toBeInTheDocument();
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
