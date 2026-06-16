import type {
  Objective,
  OptimizeConstraints,
  SetRequirement,
  Slot,
  StatKey,
} from '../game/types';

/** A frozen, overridable meta build recipe (ADR-0007). Adapted from KQM guides. */
export interface MetaTarget {
  characterKey: string;
  setRequirement: SetRequirement; // 4pc | 2pc | 2+2
  mains: Partial<Record<Slot, StatKey>>; // usually sands + goblet; circlet left free
  erTarget?: number; // er_pct floor (includes the +100 base ER)
  critRatioTarget?: number; // score.ts convention: cr/(cr+cd); 1:2 CR:CD ≈ 0.333
  objective: Objective;
  source: string; // KQM guide URL
}

export const META_TARGETS: Record<string, MetaTarget> = {
  furina: {
    characterKey: 'furina',
    setRequirement: { kind: '4pc', setKey: 'GoldenTroupe' },
    mains: { sands: 'hp_pct', goblet: 'elemental_dmg' },
    erTarget: 130,
    objective: 'crit_value',
    source: 'https://keqingmains.com/furina/',
  },
  nahida: {
    characterKey: 'nahida',
    setRequirement: { kind: '4pc', setKey: 'GildedDreams' },
    mains: { sands: 'em', goblet: 'em' },
    objective: 'crit_value',
    source: 'https://keqingmains.com/nahida/',
  },
  navia: {
    characterKey: 'navia',
    setRequirement: {
      kind: '4pc',
      setKey: 'NighttimeWhispersInTheEchoingWoods',
    },
    mains: { sands: 'atk_pct', goblet: 'elemental_dmg' },
    erTarget: 140,
    critRatioTarget: 0.333,
    objective: 'crit_value',
    source: 'https://keqingmains.com/navia/',
  },
  neuvillette: {
    characterKey: 'neuvillette',
    setRequirement: { kind: '4pc', setKey: 'MarechausseeHunter' },
    mains: { sands: 'hp_pct', goblet: 'elemental_dmg' },
    critRatioTarget: 0.333,
    objective: 'crit_value',
    source: 'https://keqingmains.com/neuvillette/',
  },
};

/** Translate a meta recipe into the optimiser's constraint shape. */
export function metaToConstraints(meta: MetaTarget): OptimizeConstraints {
  const c: OptimizeConstraints = {
    setRequirement: meta.setRequirement,
    mainStatLocks: meta.mains,
  };
  if (meta.erTarget != null) c.minStats = { er_pct: meta.erTarget };
  if (meta.critRatioTarget != null) c.critRatioTarget = meta.critRatioTarget;
  return c;
}
