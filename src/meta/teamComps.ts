// ponytail: hand-transcribed from the `source` guides below, same freshness
// caveat as src/meta/metaTargets.ts — curated as of patch 6.7, no automated
// drift check; the `source` link is the re-verification path. One comp per
// character in this first batch; additional alt comps are coverage-scaling
// work (ADR-0016, Phase 7).

export interface TeamSlot {
  role: string;
  /** characterKeys, ranked best-first. */
  options: string[];
}

export interface TeamComp {
  name: string;
  slots: [TeamSlot, TeamSlot, TeamSlot];
}

export const TEAM_COMPS: Record<
  string,
  { comps: TeamComp[]; source: string }
> = {
  furina: {
    comps: [
      {
        name: 'Furina Vaporize',
        slots: [
          { role: 'mono-hydro on-field DPS', options: ['neuvillette'] },
          { role: 'Anemo grouping/buffer', options: ['kaedehara_kazuha'] },
          { role: 'ATK buffer + healer', options: ['bennett'] },
        ],
      },
    ],
    source: 'https://keqingmains.com/furina/',
  },
  nahida: {
    comps: [
      {
        name: 'Nahida Quicken',
        slots: [
          { role: 'on-field Dendro DPS', options: ['alhaitham'] },
          { role: 'Electro applicator (Aggravate)', options: ['fischl'] },
          { role: 'off-field Electro + healer', options: ['kuki_shinobu'] },
        ],
      },
    ],
    source: 'https://keqingmains.com/nahida/',
  },
  navia: {
    comps: [
      {
        name: 'Navia Geo',
        slots: [
          { role: 'Geo buffer/RES shredder', options: ['xilonen'] },
          { role: 'ATK buffer + Pyro application', options: ['bennett'] },
          { role: 'Hydro buffer', options: ['furina'] },
        ],
      },
    ],
    source: 'https://keqingmains.com/navia/',
  },
  neuvillette: {
    comps: [
      {
        name: 'Neuvillette Hydro Resonance',
        slots: [
          { role: 'Hydro Resonance buffer/DPS', options: ['furina'] },
          { role: 'Anemo grouping/RES shred', options: ['kaedehara_kazuha'] },
          { role: 'shield/universal RES shred', options: ['zhongli'] },
        ],
      },
    ],
    source: 'https://keqingmains.com/neuvillette/',
  },
  hu_tao: {
    comps: [
      {
        name: 'Hu Tao Vaporize',
        slots: [
          { role: 'shielder/universal RES shred', options: ['zhongli'] },
          { role: 'Anemo grouper/buffer', options: ['kaedehara_kazuha'] },
          { role: 'off-field Hydro application', options: ['xingqiu'] },
        ],
      },
    ],
    source: 'https://keqingmains.com/hutao/',
  },
  arataki_itto: {
    comps: [
      {
        name: 'Itto Mono-Geo',
        slots: [
          { role: 'Geo battery/buffer', options: ['gorou'] },
          { role: 'off-field Geo DPS', options: ['albedo'] },
          { role: 'shielder/RES shred', options: ['zhongli', 'diona'] },
        ],
      },
    ],
    source: 'https://keqingmains.com/itto/',
  },
  raiden_shogun: {
    comps: [
      {
        name: 'Raiden Hypercarry',
        slots: [
          { role: 'ATK buffer + healer', options: ['bennett'] },
          { role: 'Electro buffer', options: ['kujou_sara'] },
          { role: 'Anemo buffer/grouper', options: ['kaedehara_kazuha'] },
        ],
      },
    ],
    source: 'https://keqingmains.com/raiden/',
  },
  xiao: {
    comps: [
      {
        name: 'Xiao Burst DPS',
        slots: [
          { role: 'Anemo battery/buffer', options: ['faruzan'] },
          { role: 'shielder/RES shred', options: ['zhongli'] },
          { role: 'healer/ATK buffer', options: ['bennett'] },
        ],
      },
    ],
    source: 'https://keqingmains.com/xiao/',
  },
  klee: {
    comps: [
      {
        name: 'Klee Burst',
        slots: [
          { role: 'ATK buffer + healer + battery', options: ['bennett'] },
          { role: 'Anemo grouper/buffer', options: ['kaedehara_kazuha'] },
          { role: 'Hydro buffer', options: ['furina'] },
        ],
      },
    ],
    source: 'https://keqingmains.com/klee/',
  },
  tartaglia: {
    comps: [
      {
        name: 'Childe Melee Vaporize',
        slots: [
          { role: 'ATK buffer + Pyro application', options: ['bennett'] },
          { role: 'off-field Pyro (Reverse Vape)', options: ['xiangling'] },
          { role: 'Anemo grouper/buffer', options: ['kaedehara_kazuha'] },
        ],
      },
    ],
    source: 'https://keqingmains.com/childe/',
  },
  keqing: {
    comps: [
      {
        name: 'Keqing Aggravate',
        slots: [
          { role: 'off-field Electro applicator (Aggravate)', options: ['fischl'] },
          { role: 'Dendro applicator / EM buffer', options: ['nahida'] },
          { role: 'Anemo grouper/buffer', options: ['kaedehara_kazuha'] },
        ],
      },
    ],
    source: 'https://keqingmains.com/keqing/',
  },
  kamisato_ayaka: {
    comps: [
      {
        name: 'Ayaka Freeze',
        slots: [
          { role: 'Anemo grouper/buffer', options: ['kaedehara_kazuha'] },
          { role: 'off-field Hydro applicator/healer', options: ['sangonomiya_kokomi'] },
          { role: 'Cryo buffer/debuffer', options: ['shenhe'] },
        ],
      },
    ],
    source: 'https://keqingmains.com/ayaka/',
  },
  yoimiya: {
    comps: [
      {
        name: 'Yoimiya Vaporize',
        slots: [
          { role: 'ATK buffer / healer', options: ['bennett'] },
          { role: 'off-field Hydro DPS/enabler', options: ['yelan'] },
          { role: 'off-field Hydro / defensive support', options: ['xingqiu'] },
        ],
      },
    ],
    source: 'https://keqingmains.com/yoimiya/',
  },
  alhaitham: {
    comps: [
      {
        name: 'Alhaitham Quickbloom',
        slots: [
          { role: 'Dendro battery/EM buffer', options: ['nahida'] },
          { role: 'Hydro applicator (Bloom)', options: ['furina'] },
          { role: 'shielder/RES shredder', options: ['zhongli'] },
        ],
      },
    ],
    source: 'https://keqingmains.com/q/alhaitham-quickguide',
  },
  cyno: {
    comps: [
      {
        name: 'Cyno Quickbloom',
        slots: [
          { role: 'Dendro applicator/EM buffer', options: ['nahida'] },
          { role: 'off-field Hydro DPS', options: ['yelan'] },
          { role: 'shielder', options: ['zhongli'] },
        ],
      },
    ],
    source: 'https://keqingmains.com/q/cyno-quickguide',
  },
  wanderer: {
    comps: [
      {
        name: 'Wanderer Anemo DPS',
        slots: [
          { role: 'Anemo RES shred / buffer', options: ['faruzan'] },
          { role: 'ATK buffer / healer', options: ['bennett'] },
          { role: 'shielder / RES shredder', options: ['zhongli'] },
        ],
      },
    ],
    source: 'https://keqingmains.com/wanderer/',
  },
  ganyu: {
    comps: [
      {
        name: 'Ganyu Melt',
        slots: [
          { role: 'Anemo grouper / battery', options: ['venti'] },
          { role: 'ATK buffer / Pyro applicator', options: ['bennett'] },
          { role: 'off-field Pyro DPS (Melt)', options: ['xiangling'] },
        ],
      },
    ],
    source: 'https://keqingmains.com/ganyu/',
  },
  arlecchino: {
    comps: [
      {
        name: 'Arlecchino Mono/Vape',
        slots: [
          { role: 'ATK buffer', options: ['bennett'] },
          { role: 'Anemo grouper/buffer', options: ['kaedehara_kazuha'] },
          { role: 'shielder / RES shredder', options: ['zhongli'] },
        ],
      },
    ],
    source: 'https://keqingmains.com/q/arlecchino-quickguide',
  },
  xingqiu: {
    comps: [
      {
        name: 'Xingqiu Vaporize Support',
        slots: [
          { role: 'on-field Vaporize DPS', options: ['hu_tao'] },
          { role: 'ATK buffer', options: ['bennett'] },
          { role: 'Anemo buffer', options: ['kaedehara_kazuha'] },
        ],
      },
    ],
    source: 'https://keqingmains.com/xingqiu/',
  },
  yelan: {
    comps: [
      {
        name: 'Yelan Double Hydro',
        slots: [
          { role: 'off-field Hydro application', options: ['xingqiu'] },
          { role: 'Anemo grouper/buffer', options: ['kaedehara_kazuha'] },
          { role: 'shielder / RES shredder', options: ['zhongli'] },
        ],
      },
    ],
    source: 'https://keqingmains.com/yelan/',
  },
  xiangling: {
    comps: [
      {
        name: 'Xiangling Vaporize',
        slots: [
          { role: 'battery + ATK buff', options: ['bennett'] },
          { role: 'off-field Hydro application (Vaporize)', options: ['xingqiu'] },
          { role: 'Anemo VV shred + grouping', options: ['kaedehara_kazuha'] },
        ],
      },
    ],
    source: 'https://keqingmains.com/xiangling/',
  },
  bennett: {
    comps: [
      {
        name: 'Bennett Pyro Support',
        slots: [
          { role: 'main Pyro sub-DPS', options: ['xiangling'] },
          { role: 'off-field Hydro application', options: ['xingqiu'] },
          { role: 'Anemo VV shred + grouping', options: ['kaedehara_kazuha'] },
        ],
      },
    ],
    source: 'https://keqingmains.com/bennett/',
  },
  kaedehara_kazuha: {
    comps: [
      {
        name: 'Kazuha Swirl Support',
        slots: [
          { role: 'off-field Hydro application', options: ['xingqiu'] },
          { role: 'ATK buff + Pyro self-aura', options: ['bennett'] },
          { role: 'off-field Electro application', options: ['fischl'] },
        ],
      },
    ],
    source: 'https://keqingmains.com/kazuha/',
  },
  zhongli: {
    comps: [
      {
        name: 'Zhongli Shield Support',
        slots: [
          { role: 'off-field Hydro DPS + damage reduction', options: ['xingqiu'] },
          { role: 'off-field Electro DPS', options: ['fischl'] },
          { role: 'off-field Geo DPS', options: ['albedo'] },
        ],
      },
    ],
    source: 'https://keqingmains.com/zhongli/',
  },
  kuki_shinobu: {
    comps: [
      {
        name: 'Shinobu Hyperbloom',
        slots: [
          { role: 'main Electro DPS (Hyperbloom)', options: ['cyno'] },
          { role: 'off-field Electro DPS (Hyperbloom)', options: ['fischl'] },
          { role: 'Anemo VV shred + grouping', options: ['kaedehara_kazuha'] },
        ],
      },
    ],
    source: 'https://keqingmains.com/q/shinobu-quickguide/',
  },
  faruzan: {
    comps: [
      {
        name: 'Faruzan Anemo DPS Support',
        slots: [
          { role: 'main Anemo on-field DPS', options: ['wanderer', 'xiao'] },
          { role: 'shielder', options: ['zhongli'] },
          { role: 'off-field Electro DPS (Thundering Fury)', options: ['fischl'] },
        ],
      },
    ],
    source: 'https://keqingmains.com/faruzan/',
  },
  sigewinne: {
    comps: [
      {
        name: 'Sigewinne Healer Support',
        slots: [
          { role: 'main Hydro DPS', options: ['furina'] },
          { role: 'off-field Electro DPS (Hyperbloom)', options: ['fischl'] },
          { role: 'off-field Electro DPS (Electro-Charged)', options: ['yae_miko'] },
        ],
      },
    ],
    source: 'https://keqingmains.com/q/sigewinne-quickguide',
  },
  kujou_sara: {
    comps: [
      {
        name: 'Sara Electro Buffer',
        slots: [
          { role: 'main Electro DPS', options: ['raiden_shogun'] },
          { role: 'off-field Electro DPS', options: ['fischl'] },
          { role: 'Anemo VV shred + grouping', options: ['kaedehara_kazuha'] },
        ],
      },
    ],
    source: 'https://keqingmains.com/sara/',
  },
  wriothesley: {
    comps: [
      {
        name: 'Wriothesley Reverse Melt',
        slots: [
          { role: 'shielder', options: ['zhongli'] },
          { role: 'ATK buff + healer', options: ['bennett'] },
          { role: 'Cryo buffer', options: ['shenhe'] },
        ],
      },
    ],
    source: 'https://keqingmains.com/q/wriothesley-quickguide/',
  },
  clorinde: {
    comps: [
      {
        name: 'Clorinde Overload',
        slots: [
          { role: 'Overload enabler', options: ['chevreuse'] },
          { role: 'off-field Electro DPS', options: ['fischl'] },
          { role: 'Anemo VV shred + grouping', options: ['kaedehara_kazuha'] },
        ],
      },
    ],
    source: 'https://keqingmains.com/q/clorinde-quickguide/',
  },
};

/** Rank comps by how many slots the owned roster can fill; resolve each slot
 *  to its best-ranked owned option. `null` in `filled` = "you don't own
 *  anyone for this role" — the UI shows the top-ranked option as a pull/farm
 *  target. Returns `null` only when there's no comp data at all. */
export function bestFieldableComp(
  comps: TeamComp[],
  ownedKeys: Set<string>,
): { comp: TeamComp; filled: (string | null)[]; filledCount: number } | null {
  if (comps.length === 0) return null;
  let best: { comp: TeamComp; filled: (string | null)[]; filledCount: number } | null =
    null;
  for (const comp of comps) {
    const filled = comp.slots.map(
      (slot) => slot.options.find((k) => ownedKeys.has(k)) ?? null,
    );
    const filledCount = filled.filter((k) => k !== null).length;
    if (!best || filledCount > best.filledCount) {
      best = { comp, filled, filledCount };
    }
  }
  return best;
}

/** Resolve a character's display name, falling back to the raw key rather
 *  than crashing when the dataset doesn't have them (e.g. a very new
 *  character). */
export function resolveTeammateName(
  characterKey: string,
  characters: { key: string; name: string }[],
): string {
  return characters.find((c) => c.key === characterKey)?.name ?? characterKey;
}
