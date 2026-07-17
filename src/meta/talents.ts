import type { TalentSlot } from '../import/good';

// ponytail: hand-transcribed from the `source` guides below, same freshness
// caveat as src/meta/metaTargets.ts — curated as of patch 6.7, no automated
// drift check; the `source` link is the re-verification path. Talent advice
// is a curated-target comparison, not damage math — ADR-0003 stands
// (see ADR-0016).

export interface TalentTargets {
  /** Ranked most- to least-important to raise. */
  priority: TalentSlot[];
  /** Target level (1..10, in-game display) per slot. */
  levels: Record<TalentSlot, number>;
}

export const TALENT_TARGETS: Record<
  string,
  { target: TalentTargets; source: string }
> = {
  furina: {
    target: { priority: ['burst', 'skill', 'auto'], levels: { burst: 9, skill: 1, auto: 1 } },
    source: 'https://keqingmains.com/furina/',
  },
  nahida: {
    target: { priority: ['burst', 'skill', 'auto'], levels: { burst: 9, skill: 9, auto: 1 } },
    source: 'https://keqingmains.com/nahida/',
  },
  navia: {
    target: { priority: ['burst', 'auto', 'skill'], levels: { burst: 9, auto: 9, skill: 6 } },
    source: 'https://keqingmains.com/navia/',
  },
  neuvillette: {
    target: { priority: ['auto', 'skill', 'burst'], levels: { auto: 9, skill: 6, burst: 6 } },
    source: 'https://keqingmains.com/neuvillette/',
  },
  hu_tao: {
    target: { priority: ['auto', 'skill', 'burst'], levels: { auto: 9, skill: 9, burst: 6 } },
    source: 'https://keqingmains.com/hutao/',
  },
  arataki_itto: {
    target: { priority: ['auto', 'skill', 'burst'], levels: { auto: 9, skill: 9, burst: 6 } },
    source: 'https://keqingmains.com/itto/',
  },
  raiden_shogun: {
    target: { priority: ['burst', 'skill', 'auto'], levels: { burst: 9, skill: 9, auto: 6 } },
    source: 'https://keqingmains.com/raiden/',
  },
  xiao: {
    target: { priority: ['auto', 'skill', 'burst'], levels: { auto: 9, skill: 9, burst: 1 } },
    source: 'https://keqingmains.com/xiao/',
  },
  klee: {
    target: { priority: ['skill', 'burst', 'auto'], levels: { skill: 9, burst: 9, auto: 6 } },
    source: 'https://keqingmains.com/klee/',
  },
  tartaglia: {
    target: { priority: ['auto', 'skill', 'burst'], levels: { auto: 9, skill: 9, burst: 6 } },
    source: 'https://keqingmains.com/childe/',
  },
  keqing: {
    target: { priority: ['auto', 'burst', 'skill'], levels: { auto: 9, burst: 9, skill: 6 } },
    source: 'https://keqingmains.com/keqing/',
  },
  kamisato_ayaka: {
    target: { priority: ['auto', 'burst', 'skill'], levels: { auto: 9, burst: 9, skill: 6 } },
    source: 'https://keqingmains.com/ayaka/',
  },
  yoimiya: {
    target: { priority: ['auto', 'skill', 'burst'], levels: { auto: 9, skill: 6, burst: 6 } },
    source: 'https://keqingmains.com/yoimiya/',
  },
  alhaitham: {
    target: { priority: ['auto', 'skill', 'burst'], levels: { auto: 9, skill: 9, burst: 1 } },
    source: 'https://keqingmains.com/q/alhaitham-quickguide',
  },
  cyno: {
    target: { priority: ['burst', 'skill', 'auto'], levels: { burst: 9, skill: 9, auto: 6 } },
    source: 'https://keqingmains.com/q/cyno-quickguide',
  },
  wanderer: {
    target: { priority: ['auto', 'skill', 'burst'], levels: { auto: 9, skill: 9, burst: 1 } },
    source: 'https://keqingmains.com/wanderer/',
  },
  ganyu: {
    target: { priority: ['auto', 'burst', 'skill'], levels: { auto: 9, burst: 9, skill: 6 } },
    source: 'https://keqingmains.com/ganyu/',
  },
  arlecchino: {
    target: { priority: ['auto', 'skill', 'burst'], levels: { auto: 9, skill: 9, burst: 1 } },
    source: 'https://keqingmains.com/q/arlecchino-quickguide',
  },
  xingqiu: {
    target: { priority: ['skill', 'burst', 'auto'], levels: { skill: 9, burst: 9, auto: 1 } },
    source: 'https://keqingmains.com/xingqiu/',
  },
  yelan: {
    target: { priority: ['auto', 'burst', 'skill'], levels: { auto: 9, burst: 9, skill: 1 } },
    source: 'https://keqingmains.com/yelan/',
  },
  xiangling: {
    target: { priority: ['skill', 'burst', 'auto'], levels: { skill: 9, burst: 9, auto: 1 } },
    source: 'https://keqingmains.com/xiangling/',
  },
  bennett: {
    target: { priority: ['burst', 'skill', 'auto'], levels: { burst: 9, skill: 6, auto: 1 } },
    source: 'https://keqingmains.com/bennett/',
  },
  kaedehara_kazuha: {
    target: { priority: ['skill', 'burst', 'auto'], levels: { skill: 9, burst: 6, auto: 1 } },
    source: 'https://keqingmains.com/kazuha/',
  },
  zhongli: {
    target: { priority: ['skill', 'burst', 'auto'], levels: { skill: 6, burst: 1, auto: 1 } },
    source: 'https://keqingmains.com/zhongli/',
  },
  kuki_shinobu: {
    target: { priority: ['burst', 'skill', 'auto'], levels: { burst: 9, skill: 6, auto: 1 } },
    source: 'https://keqingmains.com/q/shinobu-quickguide/',
  },
  faruzan: {
    target: { priority: ['skill', 'burst', 'auto'], levels: { skill: 9, burst: 1, auto: 1 } },
    source: 'https://keqingmains.com/faruzan/',
  },
  sigewinne: {
    target: { priority: ['burst', 'skill', 'auto'], levels: { burst: 9, skill: 1, auto: 1 } },
    source: 'https://keqingmains.com/q/sigewinne-quickguide',
  },
  kujou_sara: {
    target: { priority: ['skill', 'burst', 'auto'], levels: { skill: 9, burst: 1, auto: 1 } },
    source: 'https://keqingmains.com/sara/',
  },
  wriothesley: {
    target: { priority: ['auto', 'skill', 'burst'], levels: { auto: 9, skill: 9, burst: 1 } },
    source: 'https://keqingmains.com/q/wriothesley-quickguide/',
  },
  clorinde: {
    target: { priority: ['auto', 'skill', 'burst'], levels: { auto: 9, skill: 9, burst: 6 } },
    source: 'https://keqingmains.com/q/clorinde-quickguide/',
  },
};

/** Shortfalls vs target, in priority order. `owned` undefined (no GOOD talent
 *  data) reports every slot with `have: null` rather than assuming maxed. */
export function talentGaps(
  target: TalentTargets,
  owned: Partial<Record<TalentSlot, number>> | undefined,
): { slot: TalentSlot; have: number | null; want: number }[] {
  const out: { slot: TalentSlot; have: number | null; want: number }[] = [];
  for (const slot of target.priority) {
    const want = target.levels[slot];
    const have = owned?.[slot] ?? null;
    if (have === null || have < want) out.push({ slot, have, want });
  }
  return out;
}
