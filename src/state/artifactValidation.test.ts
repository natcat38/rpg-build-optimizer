import { describe, it, expect } from 'vitest';
import { validateArtifactDraft } from './artifactValidation';

describe('validateArtifactDraft', () => {
  it('rejects >4 sub-stats', () => {
    const err = validateArtifactDraft({
      mainStat: 'atk_pct',
      level: 20,
      subStats: [
        { key: 'crit_rate', value: 1 },
        { key: 'crit_dmg', value: 1 },
        { key: 'em', value: 1 },
        { key: 'hp', value: 1 },
        { key: 'def', value: 1 },
      ],
    });
    expect(err).toBe(
      'An artifact can have at most 4 sub-stats, none matching the main stat.',
    );
  });

  it('rejects a sub-stat equal to the main stat', () => {
    const err = validateArtifactDraft({
      mainStat: 'atk_pct',
      level: 20,
      subStats: [{ key: 'atk_pct', value: 5 }],
    });
    expect(err).toBe(
      'An artifact can have at most 4 sub-stats, none matching the main stat.',
    );
  });

  it('rejects a repeated sub-stat key', () => {
    // Duplicates are rendered keyed by stat (BuildCard), so they collide as
    // React keys as well as being an impossible roll.
    const err = validateArtifactDraft({
      mainStat: 'atk_pct',
      level: 20,
      subStats: [
        { key: 'crit_rate', value: 3 },
        { key: 'crit_rate', value: 4 },
      ],
    });
    expect(err).toBe('Each sub-stat can appear only once.');
  });

  it('rejects level out of range', () => {
    const err = validateArtifactDraft({
      mainStat: 'atk_pct',
      level: 21,
      subStats: [],
    });
    expect(err).toBe('Level must be between 0 and 20.');
  });

  it('accepts a valid draft', () => {
    const err = validateArtifactDraft({
      mainStat: 'atk_pct',
      level: 20,
      subStats: [{ key: 'crit_dmg', value: 14 }],
    });
    expect(err).toBeNull();
  });
});
