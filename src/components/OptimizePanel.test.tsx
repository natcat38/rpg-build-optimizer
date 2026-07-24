import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { OptimizePanel } from './OptimizePanel';
import { useInventory } from '../state/inventory';
import { useRoster } from '../state/roster';
import { useOptimizeRequest } from '../state/optimizeRequest';
import { currentRequest } from '../state/optimizeRequest';

describe('OptimizePanel', () => {
  beforeEach(() => {
    useInventory.getState().clear();
    useOptimizeRequest.getState().reset();
  });

  it('disables Optimise with a hint when no artifacts exist', () => {
    render(<OptimizePanel onRun={() => {}} running={false} />);
    expect(screen.getByRole('button', { name: /Optimise/i })).toBeDisabled();
    expect(
      screen.getByText(/Add or import artifacts before optimising\./i),
    ).toBeInTheDocument();
  });

  it('enables Optimise once a character is chosen and artifacts exist', () => {
    useInventory.getState().add({
      id: 'a',
      setKey: 'A',
      slot: 'flower',
      rarity: 5,
      level: 20,
      mainStat: 'hp',
      mainStatValue: 1,
      subStats: [],
    });
    render(<OptimizePanel onRun={() => {}} running={false} />);
    expect(screen.getByRole('button', { name: /Optimise/i })).toBeEnabled();
  });
});

function addFlower() {
  useInventory.getState().add({
    id: 'a',
    setKey: 'A',
    slot: 'flower',
    rarity: 5,
    level: 20,
    mainStat: 'hp',
    mainStatValue: 1,
    subStats: [],
  });
}

describe('OptimizePanel meta prefill', () => {
  beforeEach(() => {
    useInventory.getState().clear();
    useOptimizeRequest.getState().reset();
  });

  it('shows "Use meta build" for a character with a meta recipe', () => {
    addFlower();
    useOptimizeRequest.getState().setCharacterKey('furina');
    render(<OptimizePanel onRun={() => {}} running={false} />);
    expect(
      screen.getByRole('button', { name: /Use meta build/i }),
    ).toBeInTheDocument();
  });

  it('hides "Use meta build" for a character without a meta recipe', () => {
    useOptimizeRequest.getState().setCharacterKey('zzz_not_meta');
    render(<OptimizePanel onRun={() => {}} running={false} />);
    expect(
      screen.queryByRole('button', { name: /Use meta build/i }),
    ).toBeNull();
  });

  it('clicking "Use meta build" applies the meta constraints and runs', async () => {
    addFlower();
    useOptimizeRequest.getState().setCharacterKey('navia');
    const onRun = vi.fn();
    render(<OptimizePanel onRun={onRun} running={false} />);
    await userEvent.click(
      screen.getByRole('button', { name: /Use meta build/i }),
    );
    const c = currentRequest(useOptimizeRequest.getState()).constraints;
    expect(c.setRequirement).toEqual({
      kind: '4pc',
      setKey: 'NighttimeWhispersInTheEchoingWoods',
    });
    expect(onRun).toHaveBeenCalled();
  });

  it('shows a read-only summary of the meta recipe, including statTargets', () => {
    addFlower();
    useOptimizeRequest.getState().setCharacterKey('xiao');
    render(<OptimizePanel onRun={() => {}} running={false} />);
    expect(screen.getByText(/4pc Vermillion Hereafter/i)).toBeInTheDocument();
    expect(screen.getByText(/ER target 120%/i)).toBeInTheDocument();
    expect(screen.getByText(/CRIT Rate 70%/i)).toBeInTheDocument();
    const sourceLinks = screen.getAllByRole('link', { name: /Source/i });
    expect(
      sourceLinks.some(
        (a) => a.getAttribute('href') === 'https://keqingmains.com/xiao/',
      ),
    ).toBe(true);
  });

  it('omits the summary for a character without a meta recipe', () => {
    useOptimizeRequest.getState().setCharacterKey('zzz_not_meta');
    render(<OptimizePanel onRun={() => {}} running={false} />);
    expect(screen.queryByRole('link', { name: /Source/i })).toBeNull();
  });

  it('marks the character\'s meta objective as "(Recommended)" in the Maximise dropdown', () => {
    // kaedehara_kazuha's meta objective is 'em', not the common 'crit_value'.
    useOptimizeRequest.getState().setCharacterKey('kaedehara_kazuha');
    render(<OptimizePanel onRun={() => {}} running={false} />);
    const select = screen.getByRole('combobox', { name: /Maximise/i });
    const options = within(select).getAllByRole(
      'option',
    ) as HTMLOptionElement[];
    const em = options.find((o) => o.value === 'em')!;
    const critValue = options.find((o) => o.value === 'crit_value')!;
    expect(em.textContent).toMatch(/\(Recommended\)/);
    expect(critValue.textContent).not.toMatch(/Recommended/);
  });

  it('marks no objective as recommended for a character without a meta recipe', () => {
    useOptimizeRequest.getState().setCharacterKey('zzz_not_meta');
    render(<OptimizePanel onRun={() => {}} running={false} />);
    const select = screen.getByRole('combobox', { name: /Maximise/i });
    const options = within(select).getAllByRole(
      'option',
    ) as HTMLOptionElement[];
    expect(options.some((o) => /Recommended/.test(o.textContent ?? ''))).toBe(
      false,
    );
  });
});

describe('OptimizePanel roster prefill (ADR-0015)', () => {
  beforeEach(() => {
    useInventory.getState().clear();
    useOptimizeRequest.getState().reset();
    useRoster.getState().clear();
  });

  it('selecting a rostered character auto-fills its equipped weapon and build level', async () => {
    useRoster.getState().setRoster({
      raiden_shogun: { weaponKey: 'the_catch', buildLevel: 90 },
    });
    const user = userEvent.setup();
    render(<OptimizePanel onRun={() => {}} running={false} />);

    // Default character trigger shows the first adapter entry ("Aino").
    await user.click(screen.getByRole('button', { name: /Aino/i }));
    await user.type(screen.getByRole('textbox'), 'Raiden Shogun');
    await user.click(screen.getByText(/Raiden Shogun/i));

    expect(useOptimizeRequest.getState().characterKey).toBe('raiden_shogun');
    expect(useOptimizeRequest.getState().weaponKey).toBe('the_catch');
    expect(useOptimizeRequest.getState().buildLevel).toBe(90);
    expect(
      screen.getByRole('button', { name: /The Catch/i }),
    ).toBeInTheDocument();
  });

  it('a manual weapon override after roster auto-fill is not clobbered by a re-render', async () => {
    useRoster.getState().setRoster({
      raiden_shogun: { weaponKey: 'the_catch', buildLevel: 90 },
    });
    const user = userEvent.setup();
    const { rerender } = render(
      <OptimizePanel onRun={() => {}} running={false} />,
    );

    await user.click(screen.getByRole('button', { name: /Aino/i }));
    await user.type(screen.getByRole('textbox'), 'Raiden Shogun');
    await user.click(screen.getByText(/Raiden Shogun/i));
    expect(useOptimizeRequest.getState().weaponKey).toBe('the_catch');

    // Manually override the auto-filled weapon.
    await user.click(screen.getByRole('button', { name: /The Catch/i }));
    await user.type(screen.getByRole('textbox'), 'Engulfing Lightning');
    await user.click(screen.getByText(/Engulfing Lightning/i));
    expect(useOptimizeRequest.getState().weaponKey).toBe('engulfing_lightning');

    // An unrelated re-render must not revert the manual override.
    rerender(<OptimizePanel onRun={() => {}} running={false} />);
    expect(useOptimizeRequest.getState().weaponKey).toBe('engulfing_lightning');
    expect(
      screen.getByRole('button', { name: /Engulfing Lightning/i }),
    ).toBeInTheDocument();
  });

  it('sorts owned characters first with an "Owned" marker', async () => {
    useRoster.getState().setRoster({ raiden_shogun: { buildLevel: 90 } });
    const user = userEvent.setup();
    render(<OptimizePanel onRun={() => {}} running={false} />);

    await user.click(screen.getByRole('button', { name: /Aino/i }));
    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveTextContent(/Raiden Shogun.*Owned/i);
  });

  it('leaves the character list unchanged when the roster is empty', async () => {
    const user = userEvent.setup();
    render(<OptimizePanel onRun={() => {}} running={false} />);

    await user.click(screen.getByRole('button', { name: /Aino/i }));
    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('Aino');
    expect(items[0]).not.toHaveTextContent('Owned');
  });

  it("disables build levels below a rostered character's achieved level", () => {
    useRoster.getState().setRoster({ raiden_shogun: { buildLevel: 90 } });
    useOptimizeRequest.getState().setCharacterKey('raiden_shogun');
    render(<OptimizePanel onRun={() => {}} running={false} />);

    const select = screen.getByRole('combobox', { name: /Build level/i });
    const options = within(select).getAllByRole(
      'option',
    ) as HTMLOptionElement[];
    const lv20 = options.find((o) => o.value === '20')!;
    const lv90 = options.find((o) => o.value === '90')!;
    expect(lv20.disabled).toBe(true);
    expect(lv20.textContent).toMatch(/already achieved/i);
    expect(lv90.disabled).toBe(false);
    expect(lv90.textContent).not.toMatch(/already achieved/i);
  });

  it('does not disable any build level for an unrostered character', () => {
    render(<OptimizePanel onRun={() => {}} running={false} />);
    const select = screen.getByRole('combobox', { name: /Build level/i });
    const options = within(select).getAllByRole(
      'option',
    ) as HTMLOptionElement[];
    expect(options.every((o) => !o.disabled)).toBe(true);
  });
});
