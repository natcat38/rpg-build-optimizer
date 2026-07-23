import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CharacterDetail } from './CharacterDetail';
import { useRoster } from '../state/roster';
import { useInventory } from '../state/inventory';
import { useWeaponInventory } from '../state/weapons';
import { useOptimizeRequest } from '../state/optimizeRequest';

function renderDetail(characterKey: string) {
  return render(
    <CharacterDetail
      characterKey={characterKey}
      onBack={() => {}}
      onRun={() => {}}
      running={false}
      result={null}
      request={null}
      artifacts={[]}
      artifactsById={{}}
      sharedArtifacts={null}
    />,
  );
}

describe('CharacterDetail', () => {
  beforeEach(() => {
    useRoster.getState().clear();
    useInventory.getState().clear();
    useWeaponInventory.getState().clear();
    useOptimizeRequest.getState().reset();
  });

  it('shows a weapon switch suggestion when a better owned weapon exists', () => {
    useRoster.getState().setRoster({ furina: { weaponKey: 'favonius_sword' } });
    useWeaponInventory.getState().setWeapons([
      { key: 'favonius_sword', level: 90, refinement: 1, location: 'furina' },
      {
        key: 'primordial_jade_cutter',
        level: 90,
        refinement: 1,
        location: null,
      },
    ]);
    renderDetail('furina');
    // "Switch to:" and the weapon name sit in separate text nodes around a
    // <span>, so match against the paragraph's combined textContent.
    expect(
      screen.getByText(
        (_, el) =>
          el?.tagName === 'P' &&
          /Switch to:\s*Primordial Jade Cutter/i.test(el.textContent ?? ''),
      ),
    ).toBeInTheDocument();
  });

  it('flags a conflict when the recommended weapon is equipped elsewhere', () => {
    useRoster.getState().setRoster({
      furina: { weaponKey: 'favonius_sword' },
      kamisato_ayaka: {},
    });
    useWeaponInventory.getState().setWeapons([
      {
        key: 'splendor_of_tranquil_waters',
        level: 90,
        refinement: 1,
        location: 'kamisato_ayaka',
      },
    ]);
    renderDetail('furina');
    expect(
      screen.getByText(/Currently equipped on Kamisato Ayaka/i),
    ).toBeInTheDocument();
  });

  it('shows the best-owned-already-equipped message when equipped is top ranked', () => {
    useRoster.getState().setRoster({
      furina: { weaponKey: 'splendor_of_tranquil_waters' },
    });
    useWeaponInventory.getState().setWeapons([
      {
        key: 'splendor_of_tranquil_waters',
        level: 90,
        refinement: 1,
        location: 'furina',
      },
    ]);
    renderDetail('furina');
    expect(
      screen.getByText(/Best owned weapon is already equipped/i),
    ).toBeInTheDocument();
  });

  it('omits the weapon card for an uncurated character', () => {
    useRoster.getState().setRoster({ zzz_not_curated: {} });
    renderDetail('zzz_not_curated');
    expect(screen.queryByText(/Switch to:/i)).toBeNull();
    expect(screen.queryByText(/already equipped/i)).toBeNull();
  });

  it('shows talent shortfalls in priority order', () => {
    useRoster.getState().setRoster({
      furina: { talent: { burst: 1, skill: 1, auto: 1 } },
    });
    renderDetail('furina');
    expect(screen.getByText(/Elemental Burst: 1 → 9/i)).toBeInTheDocument();
  });

  it('shows "Talents at target" when nothing is below target', () => {
    useRoster.getState().setRoster({
      furina: { talent: { burst: 9, skill: 9, auto: 9 } },
    });
    renderDetail('furina');
    expect(screen.getByText(/Talents at target/i)).toBeInTheDocument();
  });

  it('shows unknown-level talents (?) when GOOD talent data is absent', () => {
    useRoster.getState().setRoster({ furina: {} });
    renderDetail('furina');
    expect(screen.getByText(/Elemental Burst: \? → 9/i)).toBeInTheDocument();
  });

  it('shows a fully-fieldable team comp using owned members', () => {
    useRoster.getState().setRoster({
      furina: { weaponKey: 'finale_of_the_deep' }, // matches the only owned weapon, avoids a stray "don't own" from the weapon card
      neuvillette: {},
      kaedehara_kazuha: {},
      bennett: {},
    });
    useWeaponInventory.getState().setWeapons([
      {
        key: 'finale_of_the_deep',
        level: 90,
        refinement: 1,
        location: 'furina',
      },
    ]);
    renderDetail('furina');
    expect(screen.getByText('Neuvillette')).toBeInTheDocument();
    expect(screen.getByText('Kaedehara Kazuha')).toBeInTheDocument();
    expect(screen.getByText('Bennett')).toBeInTheDocument();
    expect(screen.queryByText(/don't own/i)).toBeNull();
  });

  it("shows a don't-own note for unfilled team comp slots", () => {
    useRoster.getState().setRoster({ furina: {} });
    renderDetail('furina');
    expect(screen.getAllByText(/don't own/i).length).toBeGreaterThan(0);
  });

  it('still renders the OptimizePanel and header for the selected character', () => {
    useRoster.getState().setRoster({ furina: {} });
    renderDetail('furina');
    expect(screen.getByText('Furina')).toBeInTheDocument();
    expect(
      screen.getByText(
        (_, el) => el?.tagName === 'P' && /^hydro/i.test(el.textContent ?? ''),
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /your roster/i }),
    ).toBeInTheDocument();
  });

  it('shows recommended stat thresholds for a character with statTargets', () => {
    useRoster.getState().setRoster({ nahida: {} });
    renderDetail('nahida');
    expect(screen.getByText('Recommended Stats')).toBeInTheDocument();
    expect(screen.getByText(/Elemental Mastery: ≥900/i)).toBeInTheDocument();
  });

  it('omits the stat-targets card for a character with neither statTargets nor substats', () => {
    useRoster.getState().setRoster({ keqing: {} });
    renderDetail('keqing');
    expect(screen.queryByText('Recommended Stats')).toBeNull();
  });

  it('omits the constellation card when no constellation guidance is curated', () => {
    useRoster.getState().setRoster({ keqing: {} });
    renderDetail('keqing');
    expect(screen.queryByText('Constellations')).toBeNull();
  });

  it('shows curated constellation guidance, checked against the owned level', () => {
    useRoster.getState().setRoster({ furina: { constellation: 2 } });
    renderDetail('furina');
    expect(screen.getByText('Constellations')).toBeInTheDocument();
    expect(screen.getByText(/C2:/)).toBeInTheDocument();
    expect(screen.getByText(/C6:/)).toBeInTheDocument();
  });

  it("shows a teammate's recommended gear inline in the team comp card", () => {
    useRoster.getState().setRoster({
      furina: { weaponKey: 'finale_of_the_deep' },
      neuvillette: {},
      kaedehara_kazuha: {},
      bennett: {},
    });
    useWeaponInventory.getState().setWeapons([
      {
        key: 'finale_of_the_deep',
        level: 90,
        refinement: 1,
        location: 'furina',
      },
    ]);
    renderDetail('furina');
    // Neuvillette's top-ranked weapon and set requirement, shown under his slot.
    expect(screen.getByText(/Tome of the Eternal Flow/i)).toBeInTheDocument();
  });
});
