import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GapReport } from './GapReport';

describe('GapReport', () => {
  it('renders feasibility, shortfall, and the action', () => {
    render(
      <GapReport
        report={{
          characterKey: 'x',
          feasibility: ['You own no HP% Sands'],
          shortfalls: ['ER short by 8%'],
          action: 'Farm Golden Troupe',
        }}
      />,
    );
    expect(screen.getByText(/no HP% Sands/)).toBeInTheDocument();
    expect(screen.getByText(/ER short by 8%/)).toBeInTheDocument();
    expect(screen.getByText(/Farm Golden Troupe/)).toBeInTheDocument();
  });

  it('shows the all-met state when there are no gaps or shortfalls', () => {
    render(
      <GapReport
        report={{
          characterKey: 'x',
          feasibility: [],
          shortfalls: [],
          action: null,
        }}
      />,
    );
    expect(screen.getByText(/already build the meta/i)).toBeInTheDocument();
  });
});
