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

  it('labels a damage figure as an estimate', () => {
    render(<BuildCard build={build} request={req} artifacts={artifacts} />);
    expect(screen.getByText(/estimated damage/i)).toBeInTheDocument();
  });

  it('explains a stat objective instead of the damage caveat', () => {
    render(
      <BuildCard
        build={build}
        request={{ ...req, objective: 'crit_value' }}
        artifacts={artifacts}
      />,
    );
    expect(screen.queryByText(/estimated damage/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Crit Value = 2/)).toBeInTheDocument();
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
