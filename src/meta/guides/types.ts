import type {
  Objective,
  SetRequirement,
  Slot,
  StatKey,
  StatVec,
  TalentSlot,
} from '../../game/types';

// ponytail: this whole module is hand-transcribed from the `source` guides in
// each character's entry and has no automated check against patch drift or
// guide updates — the `source` link is the re-verification path. Curated as
// of patch 6.7 (see PATCH in game/genshin/adapter.ts); re-check entries after
// a kit rework or major meta shift.

/** A frozen, overridable meta build recipe (ADR-0007). Adapted from KQM
 *  guides. Embedded in a CharacterGuide, so `characterKey`/`source` live on
 *  the guide record itself rather than duplicated here. */
export interface MetaTarget {
  setRequirement: SetRequirement; // 4pc | 2pc | 2+2
  mains: Partial<Record<Slot, StatKey>>; // usually sands + goblet; circlet left free
  erTarget?: number; // er_pct floor (includes the +100 base ER)
  critRatioTarget?: number; // score.ts convention: cr/(cr+cd); 1:2 CR:CD ≈ 0.333
  objective: Objective;
  /** Endgame-ready stat-line floors (e.g. { crit_rate: 70, crit_dmg: 140 }), for
   *  grading a build against — not a hard optimiser constraint. See
   *  metaToConstraints for why these never become minStats. */
  statTargets?: StatVec;
}

/** A curated weapon recommendation. `rank` is ordinal only — 1 is best. Ranks
 *  are curated ordinals reflecting guide consensus, never fed to the solver
 *  (ADR-0003, ADR-0016). */
export interface WeaponRec {
  weaponKey: string;
  rank: number;
  note?: string;
}

export interface TalentTargets {
  /** Ranked most- to least-important to raise. */
  priority: TalentSlot[];
  /** Target level (1..10, in-game display) per slot. */
  levels: Record<TalentSlot, number>;
}

export interface ConstellationNote {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  /** One-line: what it unlocks / why it matters for this build. "Recommended"
   *  breakpoint markers (as on official guide pages) are carried in this text,
   *  not a separate boolean field. */
  note: string;
}

export interface TeamSlot {
  role: string;
  /** characterKeys, ranked best-first. */
  options: string[];
}

export interface TeamComp {
  name: string;
  slots: [TeamSlot, TeamSlot, TeamSlot];
}

/** A curated per-character guide, one record per character — the unit of
 *  curation matches the unit of consumption: one KQM (or equivalent) guide
 *  feeds one record. Every section is optional; the UI renders only the
 *  sections present and gracefully omits the rest (ADR-0016's "gracefully
 *  absent rather than guessed"). */
export interface CharacterGuide {
  /** Canonical guide URL for this character — one per character, used by
   *  every section's "Source" link. */
  source: string;
  /** One-line overview, e.g. "On-field Anemo driver". */
  role?: string;
  build?: MetaTarget;
  substats?: {
    /** Ranked most- to least-important; rendered "A > B > C". */
    priority: StatKey[];
    /** Optional hard-floor annotation for entries the guide states as a
     *  threshold rather than "more is better" (e.g. an ER floor). */
    floors?: Partial<Record<StatKey, number>>;
  };
  weapons?: WeaponRec[];
  talents?: TalentTargets;
  /** Advisory recommended constellation breakpoints. Personalized against the
   *  player's owned constellation level (parsed from GOOD — ADR-0018 amends
   *  ADR-0015's prior exclusion). */
  constellations?: ConstellationNote[];
  /** Ranked best-first; the advisor shows the best-fieldable comp plus the
   *  rest as alternatives. */
  teams?: TeamComp[];
}
