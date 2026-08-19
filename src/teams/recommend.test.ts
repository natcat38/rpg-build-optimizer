import { describe, it, expect } from 'vitest';
import { instantiate, recommendAbyss } from './recommend';
import { COMP_ARCHETYPES } from './comps';
import { loadOwnerGOOD } from '../test-fixtures/ownerAccount';
import { parseGOOD, parseGOODRoster } from '../import/good';
import { computeBuildScore } from '../roster/buildScore';
import type { Artifact } from '../game/types';
import type { CompArchetype } from './types';

const arch = (id: string) => COMP_ARCHETYPES.find((a) => a.id === id)!;

const toy: CompArchetype = {
  id: 'toy',
  name: 'Toy',
  modes: ['abyss'],
  tier: 1,
  source: 'https://example.test/',
  notes: 'test',
  slots: [
    {
      role: 'on-field-dps',
      options: [
        { characterKey: 'hu_tao', weight: 1 },
        { characterKey: 'yoimiya', weight: 0.85 },
      ],
    },
    {
      role: 'applicator',
      options: [
        { characterKey: 'xingqiu', weight: 1 },
        { characterKey: 'yelan', weight: 0.85 },
      ],
    },
    {
      role: 'buffer',
      options: [
        { characterKey: 'bennett', weight: 1 },
        { characterKey: 'xiangling', weight: 0.7 },
      ],
    },
    {
      role: 'sustain',
      options: [
        { characterKey: 'zhongli', weight: 1 },
        { characterKey: 'layla', weight: 0.7 },
      ],
    },
  ],
};

describe('instantiate', () => {
  it('picks the highest weight × build score among owned options', () => {
    // Ideal Hu Tao is barely built; the sub Yoimiya is maxed.
    const scores = {
      hu_tao: 20,
      yoimiya: 100,
      xingqiu: 80,
      bennett: 80,
      zhongli: 80,
    };
    const out = instantiate(toy, scores, new Set());
    expect(out).not.toBeNull();
    expect('missing' in out!).toBe(false);
    const team = out as Exclude<typeof out, { missing: unknown } | null>;
    expect(team.members[0].characterKey).toBe('yoimiya');
    expect(team.members[0].optionWeight).toBe(0.85);
  });

  it('never reuses a character across slots', () => {
    const scores = { hu_tao: 90, yelan: 90, xiangling: 90, layla: 90 };
    const out = instantiate(toy, scores, new Set());
    const team = out as { members: { characterKey: string }[] };
    const keys = team.members.map((m) => m.characterKey);
    expect(new Set(keys).size).toBe(4);
  });

  it('reports a one-slot gap with the role and the candidates', () => {
    const scores = { hu_tao: 90, xingqiu: 90, bennett: 90 }; // no sustain owned
    const out = instantiate(toy, scores, new Set());
    expect(out).not.toBeNull();
    expect('missing' in out!).toBe(true);
    const gap = (
      out as { missing: { missingRole: string; candidates: string[] } }
    ).missing;
    expect(gap.missingRole).toBe('sustain');
    expect(gap.candidates).toEqual(['zhongli', 'layla']);
  });

  it('returns null when more than one slot is unfillable', () => {
    expect(instantiate(toy, { hu_tao: 90, xingqiu: 90 }, new Set())).toBeNull();
  });

  it('honours the exclusion set', () => {
    const scores = {
      hu_tao: 90,
      xingqiu: 90,
      bennett: 90,
      zhongli: 90,
      layla: 90,
    };
    const out = instantiate(toy, scores, new Set(['zhongli'])) as {
      members: { characterKey: string }[];
    };
    expect(out.members.map((m) => m.characterKey)).toContain('layla');
    expect(out.members.map((m) => m.characterKey)).not.toContain('zhongli');
  });
});

describe('recommendAbyss', () => {
  it('returns nothing for an empty roster', () => {
    const out = recommendAbyss({});
    expect(out.teams).toBeNull();
    expect(out.singles).toEqual([]);
  });

  it('picks two fully disjoint halves', () => {
    // A roster that can field two teams only if the pair search avoids overlap.
    const scores: Record<string, number> = {};
    for (const key of [
      'neuvillette',
      'furina',
      'kaedehara_kazuha',
      'charlotte',
      'raiden_shogun',
      'xiangling',
      'xingqiu',
      'bennett',
    ])
      scores[key] = 90;
    const out = recommendAbyss(scores);
    expect(out.teams).not.toBeNull();
    const [a, b] = out.teams!;
    const keys = [...a.members, ...b.members].map((m) => m.characterKey);
    expect(new Set(keys).size).toBe(8);
    expect(a.score).toBeGreaterThan(0);
    expect(b.score).toBeGreaterThan(0);
  });

  it('collects near-miss archetypes as gaps', () => {
    const scores = { hu_tao: 90, xingqiu: 90, yelan: 90 }; // hu-tao-vape lacks a sustain
    const out = recommendAbyss(scores);
    const gap = out.gaps.find((g) => g.archetypeId === 'hu-tao-vape');
    expect(gap?.missingRole).toBe('sustain');
    expect(gap?.candidates).toContain('zhongli');
    expect(gap?.bestPossibleScore).toBeGreaterThan(0);
  });

  it('sorts singles by score, best first', () => {
    const scores = {
      neuvillette: 90,
      furina: 90,
      kaedehara_kazuha: 90,
      charlotte: 90,
    };
    const out = recommendAbyss(scores);
    const sorted = [...out.singles].sort((x, y) => y.score - x.score);
    expect(out.singles.map((s) => s.archetypeId)).toEqual(
      sorted.map((s) => s.archetypeId),
    );
  });

  it('rates the ideal lineup above the same team built on substitutes', () => {
    const ideal = recommendAbyss({
      hu_tao: 90,
      xingqiu: 90,
      yelan: 90,
      zhongli: 90,
    }).singles.find((s) => s.archetypeId === 'hu-tao-vape')!;
    const subs = recommendAbyss({
      hu_tao: 90,
      yelan: 90,
      xingqiu: 90,
      layla: 90,
    }).singles.find((s) => s.archetypeId === 'hu-tao-vape')!;
    expect(ideal.score).toBeGreaterThan(subs.score);
    expect(arch('hu-tao-vape').tier).toBe(1);
  });
});

describe('recommendAbyss on the owner account fixture', () => {
  it('fields two disjoint teams from a real roster', () => {
    const roster = parseGOODRoster(loadOwnerGOOD());
    const artifacts = parseGOOD(loadOwnerGOOD()) as Artifact[];
    const byLocation: Record<string, Artifact[]> = {};
    for (const a of artifacts)
      if (a.location) (byLocation[a.location] ??= []).push(a);
    const scores: Record<string, number> = {};
    for (const [key, entry] of Object.entries(roster))
      scores[key] = computeBuildScore(entry, byLocation[key] ?? []).total;

    const out = recommendAbyss(scores);
    expect(out.teams).not.toBeNull();
    const [first, second] = out.teams!;
    expect(first.score).toBeGreaterThan(0);
    expect(second.score).toBeGreaterThan(0);
    const keys = [...first.members, ...second.members].map(
      (m) => m.characterKey,
    );
    expect(new Set(keys).size).toBe(8);
    // Snapshot the chosen archetypes so meta/curation drift shows as a diff.
    expect([first.archetypeId, second.archetypeId]).toMatchInlineSnapshot(`
      [
        "hu-tao-vape",
        "ayaka-freeze",
      ]
    `);
  });
});
