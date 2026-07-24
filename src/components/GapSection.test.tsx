import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GapSection } from './GapSection';
import { GUIDES } from '../meta/guides';
import type { OptimizeRequest, OptimizeResult } from '../game/types';

const metaKey = Object.entries(GUIDES).find(([, g]) => g.build)![0];

function makeRequest(characterKey: string): OptimizeRequest {
  return {
    characterKey,
    weaponKey: 'w',
    buildLevel: 90,
    constraints: {},
    objective: 'crit_value',
  };
}

const emptyResult: OptimizeResult = {
  status: 'infeasible',
  explored: 0,
  pruned: 0,
};

describe('GapSection', () => {
  it('renders the gap report for a meta character on a fresh build', () => {
    render(
      <GapSection
        result={emptyResult}
        request={makeRequest(metaKey)}
        artifacts={[]}
        sharedArtifacts={null}
      />,
    );
    expect(screen.getByText('Gap vs meta build')).toBeInTheDocument();
  });

  it('renders nothing for a non-meta character', () => {
    const { container } = render(
      <GapSection
        result={emptyResult}
        request={makeRequest('definitely-not-a-character')}
        artifacts={[]}
        sharedArtifacts={null}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when viewing a shared build', () => {
    const { container } = render(
      <GapSection
        result={emptyResult}
        request={makeRequest(metaKey)}
        artifacts={[]}
        sharedArtifacts={[]}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
