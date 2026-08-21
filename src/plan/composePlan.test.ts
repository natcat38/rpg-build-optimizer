import { describe, it, expect, vi } from 'vitest';
import { composePlan, type RunOptimize } from './composePlan';
import { searchBuilds } from '../optimizer/search';
import { buildContext } from '../optimizer/context';
import type { TeamInstance } from '../teams/recommend';
import type { RosterEntry } from '../import/good';
import type { Artifact, OptimizeResult, Slot, StatKey } from '../game/types';
import { SLOTS } from '../game/types';

const run: RunOptimize = (req, inv) =>
  Promise.resolve(searchBuilds(req, inv, buildContext(req)));

let n = 0;
function art(
  slot: Slot,
  setKey: string,
  main: StatKey,
  value: number,
): Artifact {
  return {
    id: `a${n++}`,
    setKey,
    slot,
    rarity: 5,
    level: 20,
    mainStat: main,
    mainStatValue: value,
    subStats: [
      { key: 'crit_rate', value: 8 },
      { key: 'crit_dmg', value: 16 },
      { key: 'er_pct', value: 20 },
    ],
  };
}

/** Enough gear that eight builds can be formed without running dry. */
function inventory(perSlot: number): Artifact[] {
  const out: Artifact[] = [];
  for (const slot of SLOTS)
    for (let i = 0; i < perSlot; i++)
      out.push(
        art(
          slot,
          i % 2 === 0 ? 'EmblemOfSeveredFate' : 'MarechausseeHunter',
          slot === 'sands'
            ? 'atk_pct'
            : slot === 'goblet'
              ? 'elemental_dmg'
              : 'hp',
          40 + i,
        ),
      );
  return out;
}

const member = (
  characterKey: string,
  role: TeamInstance['members'][0]['role'],
) => ({
  characterKey,
  role,
  buildScore: 90,
});

const teams: [TeamInstance, TeamInstance] = [
  {
    archetypeId: 'hu-tao-vape',
    score: 90,
    members: [
      member('xingqiu', 'applicator'),
      member('hu_tao', 'on-field-dps'),
      member('yelan', 'off-field-dps'),
      member('zhongli', 'sustain'),
    ],
  },
  {
    archetypeId: 'raiden-national',
    score: 80,
    members: [
      member('bennett', 'buffer'),
      member('raiden_shogun', 'on-field-dps'),
      member('xiangling', 'off-field-dps'),
      member('kaedehara_kazuha', 'buffer'),
    ],
  },
];

const roster: Record<string, RosterEntry> = Object.fromEntries(
  [
    'hu_tao',
    'xingqiu',
    'yelan',
    'zhongli',
    'raiden_shogun',
    'bennett',
    'xiangling',
    'kaedehara_kazuha',
  ].map((k) => [k, { buildLevel: 90 as const, weaponKey: 'the_catch' }]),
);

describe('composePlan', () => {
  it('optimises all eight members, DPS first within each team', async () => {
    const onProgress = vi.fn();
    const plan = await composePlan(
      teams,
      roster,
      inventory(6),
      run,
      onProgress,
    );
    expect(plan.builds).toHaveLength(8);
    expect(plan.builds.map((b) => b.characterKey)).toEqual([
      'hu_tao',
      'yelan',
      'xingqiu',
      'zhongli',
      'raiden_shogun',
      'xiangling',
      'bennett',
      'kaedehara_kazuha',
    ]);
    expect(onProgress).toHaveBeenCalledTimes(8);
    expect(onProgress).toHaveBeenLastCalledWith(8, 8);
  });

  it('allocates each artifact to at most one member', async () => {
    const plan = await composePlan(teams, roster, inventory(8), run);
    const used: string[] = [];
    for (const b of plan.builds) {
      const r = b.result;
      if (r.status !== 'ok') continue;
      used.push(...SLOTS.map((s) => r.builds[0].artifactIds[s]));
    }
    expect(new Set(used).size).toBe(used.length);
  });

  it('uses avg_damage where a profile exists and the meta objective otherwise', async () => {
    const plan = await composePlan(teams, roster, inventory(6), run);
    const by = Object.fromEntries(
      plan.builds.map((b) => [b.characterKey, b.objective]),
    );
    expect(by['hu_tao']).toBe('avg_damage'); // profiled
    expect(by['zhongli']).not.toBe('avg_damage'); // no profile
    expect(by['kaedehara_kazuha']).not.toBe('avg_damage');
  });

  it('reports a weaponless member as infeasible with a farming line, not a throw', async () => {
    const noWeapon = { ...roster, zhongli: { buildLevel: 90 as const } };
    const plan = await composePlan(teams, noWeapon, inventory(6), run);
    const z = plan.builds.find((b) => b.characterKey === 'zhongli')!;
    expect(z.result.status).toBe('infeasible');
    expect(
      plan.farming.some((l) => /Zhongli/.test(l) && /weapon/i.test(l)),
    ).toBe(true);
  });

  it('dedupes farming lines and prefixes them with the character name', async () => {
    const plan = await composePlan(teams, roster, inventory(6), run);
    expect(new Set(plan.farming).size).toBe(plan.farming.length);
    for (const line of plan.farming) expect(line).toMatch(/^[A-Z][^:]*: /);
  });

  it("notes when a higher-priority member took a piece from a later one's set", async () => {
    // Exactly one Emblem set, main stats matching Yelan's recipe. Yelan runs
    // before Xingqiu and both want 4pc Emblem, so Xingqiu finds it gone.
    const emblemMains: Record<Slot, StatKey> = {
      flower: 'hp',
      plume: 'atk',
      sands: 'hp_pct',
      goblet: 'elemental_dmg',
      circlet: 'crit_rate',
    };
    const scarce: Artifact[] = SLOTS.map((s) =>
      art(s, 'EmblemOfSeveredFate', emblemMains[s], 50),
    );
    const plan = await composePlan(teams, roster, scarce, run);
    const yelan = plan.builds.find((b) => b.characterKey === 'yelan')!;
    expect(yelan.result.status).toBe('ok');
    const xingqiu = plan.builds.find((b) => b.characterKey === 'xingqiu')!;
    expect(xingqiu.conflicts.length).toBeGreaterThan(0);
    expect(xingqiu.conflicts[0]).toMatch(/EmblemOfSeveredFate/);
  });

  it('surfaces an empty inventory as infeasible builds, not an exception', async () => {
    const plan = await composePlan(teams, roster, [], run);
    expect(plan.builds).toHaveLength(8);
    expect(
      plan.builds.every(
        (b: { result: OptimizeResult }) => b.result.status === 'infeasible',
      ),
    ).toBe(true);
  });
});
