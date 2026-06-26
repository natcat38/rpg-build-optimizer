import { describe, it, expect } from 'vitest';
import { encodeBuild, decodeBuild } from './url';
import type { Artifact, BuildResult, OptimizeRequest } from '../game/types';

const request: OptimizeRequest = {
  characterKey: 'Raiden',
  weaponKey: 'EngulfingLightning',
  buildLevel: 90,
  constraints: { minStats: { er_pct: 200 } },
  objective: 'crit_value',
};
const build: BuildResult = {
  artifactIds: {
    flower: 'f',
    plume: 'p',
    sands: 's',
    goblet: 'g',
    circlet: 'c',
  },
  totals: { crit_rate: 60, crit_dmg: 120 },
  objectiveValue: 240,
  score: 240,
  diagnostics: {
    bindingConstraints: [],
    marginalBySlot: {},
    explored: 0,
    pruned: 0,
  },
};
const artifacts: Artifact[] = [
  {
    id: 'f',
    setKey: 'EmblemOfSeveredFate',
    slot: 'flower',
    rarity: 5,
    level: 20,
    mainStat: 'hp',
    mainStatValue: 4780,
    subStats: [{ key: 'crit_dmg', value: 14 }],
  },
  {
    id: 'p',
    setKey: 'EmblemOfSeveredFate',
    slot: 'plume',
    rarity: 5,
    level: 20,
    mainStat: 'atk',
    mainStatValue: 311,
    subStats: [],
  },
  {
    id: 's',
    setKey: 'EmblemOfSeveredFate',
    slot: 'sands',
    rarity: 5,
    level: 20,
    mainStat: 'er_pct',
    mainStatValue: 51.8,
    subStats: [],
  },
  {
    id: 'g',
    setKey: 'EmblemOfSeveredFate',
    slot: 'goblet',
    rarity: 5,
    level: 20,
    mainStat: 'elemental_dmg',
    mainStatValue: 46.6,
    subStats: [],
  },
  {
    id: 'c',
    setKey: 'NoblesseOblige',
    slot: 'circlet',
    rarity: 5,
    level: 20,
    mainStat: 'crit_rate',
    mainStatValue: 31.1,
    subStats: [{ key: 'crit_dmg', value: 14 }],
  },
];

describe('decodeBuild validation', () => {
  it('round-trips a valid snapshot unchanged', async () => {
    const out = await decodeBuild(
      await encodeBuild({ request, build, artifacts }),
    );
    expect(out).toEqual({ request, build, artifacts });
  });

  it('rejects an unknown objective', async () => {
    const bad = await encodeBuild({
      request: { ...request, objective: 'haste' as never },
      build,
      artifacts,
    });
    expect(await decodeBuild(bad)).toEqual({ error: 'UNREADABLE' });
  });

  it('rejects an out-of-range build level', async () => {
    const bad = await encodeBuild({
      request: { ...request, buildLevel: 999 as never },
      build,
      artifacts,
    });
    expect(await decodeBuild(bad)).toEqual({ error: 'UNREADABLE' });
  });

  it('rejects an unknown stat key in build.totals', async () => {
    const bad = await encodeBuild({
      request,
      build: { ...build, totals: { bogus_stat: 50 } as never },
      artifacts,
    });
    expect(await decodeBuild(bad)).toEqual({ error: 'UNREADABLE' });
  });

  it('rejects an artifact with an unknown slot', async () => {
    const bad = await encodeBuild({
      request,
      build,
      artifacts: [
        { ...artifacts[0], slot: 'ring' as never },
        ...artifacts.slice(1),
      ],
    });
    expect(await decodeBuild(bad)).toEqual({ error: 'UNREADABLE' });
  });

  it('rejects an artifact with a non-stat mainStat', async () => {
    const bad = await encodeBuild({
      request,
      build,
      artifacts: [
        { ...artifacts[0], mainStat: 'luck' as never },
        ...artifacts.slice(1),
      ],
    });
    expect(await decodeBuild(bad)).toEqual({ error: 'UNREADABLE' });
  });

  it('rejects a non-finite numeric (NaN score)', async () => {
    const bad = await encodeBuild({
      request,
      build: { ...build, score: NaN },
      artifacts,
    });
    expect(await decodeBuild(bad)).toEqual({ error: 'UNREADABLE' });
  });

  it('rejects an over-long key (DoS guard)', async () => {
    const bad = await encodeBuild({
      request: { ...request, characterKey: 'x'.repeat(200) },
      build,
      artifacts,
    });
    expect(await decodeBuild(bad)).toEqual({ error: 'UNREADABLE' });
  });

  it('rejects an unknown stat key in constraints.minStats', async () => {
    const bad = await encodeBuild({
      request: { ...request, constraints: { minStats: { bogus: 1 } as never } },
      build,
      artifacts,
    });
    expect(await decodeBuild(bad)).toEqual({ error: 'UNREADABLE' });
  });

  it('rejects when artifactIds reference an artifact not carried in the snapshot', async () => {
    const bad = await encodeBuild({
      request,
      build: {
        ...build,
        artifactIds: { ...build.artifactIds, flower: 'missing' },
      },
      artifacts,
    });
    expect(await decodeBuild(bad)).toEqual({ error: 'UNREADABLE' });
  });
});

describe('share url', () => {
  it('round-trips a self-contained build snapshot (request, build, full artifacts)', async () => {
    const param = await encodeBuild({ request, build, artifacts });
    const out = await decodeBuild(param);
    expect(out).not.toHaveProperty('error');
    if (!('error' in out)) {
      expect(out.request.characterKey).toBe('Raiden');
      expect(out.request.buildLevel).toBe(90);
      expect(out.build.objectiveValue).toBe(240);
      // the five full artifacts survive the round-trip (ADR-0005 self-contained)
      expect(out.artifacts).toHaveLength(5);
      expect(out.artifacts[2].mainStat).toBe('er_pct');
      expect(out.artifacts[0].subStats).toContainEqual({
        key: 'crit_dmg',
        value: 14,
      });
    }
  });

  it('returns UNREADABLE for garbage input instead of throwing', async () => {
    expect(await decodeBuild('not-valid-base64!!')).toEqual({
      error: 'UNREADABLE',
    });
  });

  it('returns UNREADABLE for an empty string', async () => {
    expect(await decodeBuild('')).toEqual({ error: 'UNREADABLE' });
  });

  it('returns UNREADABLE for valid JSON of the wrong shape', async () => {
    const param = await encodeBuild({} as never);
    expect(await decodeBuild(param)).toEqual({ error: 'UNREADABLE' });
  });
});
