import { describe, it, expect, beforeEach } from 'vitest';
import { useRoster } from './roster';

describe('roster store', () => {
  beforeEach(() => useRoster.getState().clear());

  it('setRoster replaces wholesale rather than merging', () => {
    useRoster.getState().setRoster({ raiden_shogun: { buildLevel: 90 } });
    useRoster
      .getState()
      .setRoster({ the_catch_owner: { weaponKey: 'the_catch' } });
    expect(useRoster.getState().entries).toEqual({
      the_catch_owner: { weaponKey: 'the_catch' },
    });
  });

  it('clear empties the roster', () => {
    useRoster.getState().setRoster({ raiden_shogun: { buildLevel: 90 } });
    useRoster.getState().clear();
    expect(useRoster.getState().entries).toEqual({});
  });
});
