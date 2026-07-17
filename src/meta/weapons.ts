import type { OwnedWeapon } from '../import/good';

// ponytail: hand-transcribed from the `source` guides below, same freshness
// caveat as src/meta/metaTargets.ts — curated as of patch 6.7, no automated
// drift check; the `source` link is the re-verification path. Ranks are
// curated ordinals reflecting guide consensus, never fed to the solver
// (ADR-0003, ADR-0016).

/** A curated weapon recommendation. `rank` is ordinal only — 1 is best. */
export interface WeaponRec {
  weaponKey: string;
  rank: number;
  note?: string;
}

export const WEAPON_RANKINGS: Record<
  string,
  { recs: WeaponRec[]; source: string }
> = {
  furina: {
    recs: [
      { weaponKey: 'splendor_of_tranquil_waters', rank: 1, note: 'signature' },
      { weaponKey: 'finale_of_the_deep', rank: 2 },
      { weaponKey: 'primordial_jade_cutter', rank: 3 },
      { weaponKey: 'favonius_sword', rank: 4, note: 'F2P energy option' },
    ],
    source: 'https://keqingmains.com/furina/',
  },
  nahida: {
    recs: [
      { weaponKey: 'a_thousand_floating_dreams', rank: 1, note: 'signature' },
      { weaponKey: "kagura's_verity", rank: 2 },
      { weaponKey: 'sacrificial_fragments', rank: 3, note: 'F2P option' },
      { weaponKey: 'wandering_evenstar', rank: 4 },
    ],
    source: 'https://keqingmains.com/nahida/',
  },
  navia: {
    recs: [
      { weaponKey: 'verdict', rank: 1, note: 'signature' },
      { weaponKey: 'serpent_spine', rank: 2 },
      { weaponKey: 'the_unforged', rank: 3 },
      { weaponKey: 'favonius_greatsword', rank: 4, note: 'F2P energy option' },
    ],
    source: 'https://keqingmains.com/navia/',
  },
  neuvillette: {
    recs: [
      { weaponKey: 'tome_of_the_eternal_flow', rank: 1, note: 'signature' },
      { weaponKey: 'sacrificial_jade', rank: 2 },
      { weaponKey: "surf's_up", rank: 3 },
      { weaponKey: 'prototype_amber', rank: 4, note: 'F2P, healing side-value' },
    ],
    source: 'https://keqingmains.com/neuvillette/',
  },
  hu_tao: {
    recs: [
      { weaponKey: 'staff_of_homa', rank: 1, note: 'signature — uncontested BiS' },
      { weaponKey: 'staff_of_the_scarlet_sands', rank: 2 },
      { weaponKey: "dragon's_bane", rank: 3, note: 'F2P, strong vs Hydro/Pyro' },
      { weaponKey: 'white_tassel', rank: 4, note: 'F2P Liyue chest option' },
    ],
    source: 'https://keqingmains.com/hutao/',
  },
  arataki_itto: {
    recs: [
      { weaponKey: 'redhorn_stonethresher', rank: 1, note: 'signature' },
      { weaponKey: 'serpent_spine', rank: 2, note: 'second BiS' },
      { weaponKey: 'skyward_pride', rank: 3 },
      { weaponKey: 'whiteblind', rank: 4, note: 'F2P craftable DEF option' },
    ],
    source: 'https://keqingmains.com/itto/',
  },
  raiden_shogun: {
    recs: [
      { weaponKey: 'engulfing_lightning', rank: 1, note: 'signature' },
      { weaponKey: 'staff_of_homa', rank: 2 },
      { weaponKey: 'primordial_jade_wingedspear', rank: 3 },
      { weaponKey: 'the_catch', rank: 4, note: 'craftable ER, F2P option' },
    ],
    source: 'https://keqingmains.com/raiden/',
  },
  xiao: {
    recs: [
      { weaponKey: 'primordial_jade_wingedspear', rank: 1, note: 'best-in-slot' },
      { weaponKey: 'staff_of_homa', rank: 2 },
      { weaponKey: 'lumidouce_elegy', rank: 3 },
      { weaponKey: 'favonius_lance', rank: 4, note: 'F2P energy option' },
    ],
    source: 'https://keqingmains.com/xiao/',
  },
  klee: {
    recs: [
      { weaponKey: 'dodoco_tales', rank: 1, note: 'signature' },
      { weaponKey: 'the_widsith', rank: 2, note: 'F2P, can rival 5-stars' },
      { weaponKey: 'lost_prayer_to_the_sacred_winds', rank: 3 },
      { weaponKey: 'sacrificial_fragments', rank: 4, note: 'F2P option' },
    ],
    source: 'https://keqingmains.com/klee/',
  },
  tartaglia: {
    recs: [
      { weaponKey: 'polar_star', rank: 1, note: 'signature — BiS when pre-stacked' },
      { weaponKey: 'aqua_simulacra', rank: 2 },
      { weaponKey: "hunter's_path", rank: 3, note: 'strong with EM investment' },
      { weaponKey: 'the_viridescent_hunt', rank: 4, note: 'best F2P 4-star' },
    ],
    source: 'https://keqingmains.com/childe/',
  },
  keqing: {
    recs: [
      { weaponKey: 'mistsplitter_reforged', rank: 1 },
      { weaponKey: 'primordial_jade_cutter', rank: 2 },
      { weaponKey: 'haran_geppaku_futsu', rank: 3 },
      { weaponKey: "lion's_roar", rank: 4, note: 'F2P (Electro-adjacent) option' },
    ],
    source: 'https://keqingmains.com/keqing/',
  },
  kamisato_ayaka: {
    recs: [
      { weaponKey: 'mistsplitter_reforged', rank: 1, note: 'signature' },
      { weaponKey: 'haran_geppaku_futsu', rank: 2 },
      { weaponKey: 'primordial_jade_cutter', rank: 3 },
      { weaponKey: 'finale_of_the_deep', rank: 4, note: 'F2P craftable, best 4-star' },
    ],
    source: 'https://keqingmains.com/ayaka/',
  },
  yoimiya: {
    recs: [
      { weaponKey: 'thundering_pulse', rank: 1, note: 'signature' },
      { weaponKey: 'rust', rank: 2, note: 'best accessible 4-star' },
      { weaponKey: 'slingshot', rank: 3, note: 'F2P, strong with Bennett/Yun Jin' },
      { weaponKey: 'aqua_simulacra', rank: 4 },
    ],
    source: 'https://keqingmains.com/yoimiya/',
  },
  alhaitham: {
    recs: [
      { weaponKey: 'light_of_foliar_incision', rank: 1, note: 'signature — BiS single-target' },
      { weaponKey: 'primordial_jade_cutter', rank: 2, note: 'excels multi-target' },
      { weaponKey: 'mistsplitter_reforged', rank: 3 },
      { weaponKey: 'iron_sting', rank: 4, note: 'F2P EM option' },
    ],
    source: 'https://keqingmains.com/q/alhaitham-quickguide',
  },
  cyno: {
    recs: [
      { weaponKey: 'staff_of_the_scarlet_sands', rank: 1, note: 'signature' },
      { weaponKey: 'primordial_jade_wingedspear', rank: 2 },
      { weaponKey: 'ballad_of_the_fjords', rank: 3, note: 'second-best BP option' },
      { weaponKey: 'white_tassel', rank: 4, note: 'F2P, on par with Deathmatch' },
    ],
    source: 'https://keqingmains.com/q/cyno-quickguide',
  },
  wanderer: {
    recs: [
      { weaponKey: "tulaytullah's_remembrance", rank: 1, note: 'signature' },
      { weaponKey: 'skyward_atlas', rank: 2 },
      { weaponKey: 'lost_prayer_to_the_sacred_winds', rank: 3 },
      { weaponKey: 'the_widsith', rank: 4, note: 'strong 4★ option' },
    ],
    source: 'https://keqingmains.com/wanderer/',
  },
  ganyu: {
    recs: [
      { weaponKey: "amos'_bow", rank: 1, note: 'best-in-slot' },
      { weaponKey: "hunter's_path", rank: 2 },
      { weaponKey: 'the_stringless', rank: 3, note: 'F2P option' },
      { weaponKey: 'favonius_warbow', rank: 4, note: 'F2P energy option' },
    ],
    source: 'https://keqingmains.com/ganyu/',
  },
  arlecchino: {
    recs: [
      { weaponKey: "crimson_moon's_semblance", rank: 1, note: 'signature' },
      { weaponKey: 'primordial_jade_wingedspear', rank: 2 },
      { weaponKey: 'staff_of_the_scarlet_sands', rank: 3, note: 'strong in Vaporize teams' },
      { weaponKey: 'white_tassel', rank: 4, note: 'best F2P option' },
    ],
    source: 'https://keqingmains.com/q/arlecchino-quickguide',
  },
  xingqiu: {
    recs: [
      { weaponKey: 'primordial_jade_cutter', rank: 1 },
      { weaponKey: 'mistsplitter_reforged', rank: 2 },
      { weaponKey: 'haran_geppaku_futsu', rank: 3 },
      { weaponKey: 'favonius_sword', rank: 4, note: 'F2P, team energy battery' },
    ],
    source: 'https://keqingmains.com/xingqiu/',
  },
  yelan: {
    recs: [
      { weaponKey: 'aqua_simulacra', rank: 1, note: 'signature — all-purpose BiS' },
      { weaponKey: 'favonius_warbow', rank: 2, note: 'premier F2P option' },
      { weaponKey: 'elegy_for_the_end', rank: 3, note: 'team-wide reaction support' },
      { weaponKey: 'slingshot', rank: 4, note: 'F2P, low-ER alternative' },
    ],
    source: 'https://keqingmains.com/yelan/',
  },
  xiangling: {
    recs: [
      { weaponKey: 'the_catch', rank: 1, note: 'F2P craftable — top recommendation' },
      { weaponKey: 'staff_of_the_scarlet_sands', rank: 2 },
      { weaponKey: 'staff_of_homa', rank: 3 },
      { weaponKey: "dragon's_bane", rank: 4, note: 'F2P option, strong on-element' },
    ],
    source: 'https://keqingmains.com/xiangling/',
  },
  bennett: {
    recs: [
      { weaponKey: 'aquila_favonia', rank: 1, note: 'signature — best-in-slot support' },
      { weaponKey: 'favonius_sword', rank: 2, note: 'F2P energy option' },
      { weaponKey: 'prototype_rancour', rank: 3, note: 'F2P craftable' },
      { weaponKey: 'iron_sting', rank: 4, note: 'F2P EM option' },
    ],
    source: 'https://keqingmains.com/bennett/',
  },
  kaedehara_kazuha: {
    recs: [
      { weaponKey: 'freedomsworn', rank: 1, note: 'signature' },
      { weaponKey: "xiphos'_moonlight", rank: 2, note: 'best at high refinement' },
      { weaponKey: 'favonius_sword', rank: 3, note: 'F2P energy option' },
      { weaponKey: 'fleuve_cendre_ferryman', rank: 4, note: 'best free sword, low ER' },
    ],
    source: 'https://keqingmains.com/kazuha/',
  },
  zhongli: {
    recs: [
      { weaponKey: 'black_tassel', rank: 1, note: 'F2P — shield-bot BiS' },
      { weaponKey: 'favonius_lance', rank: 2, note: 'F2P energy option' },
      { weaponKey: 'the_catch', rank: 3, note: 'craftable ER option' },
      { weaponKey: 'primordial_jade_wingedspear', rank: 4, note: 'DPS-build alternative' },
    ],
    source: 'https://keqingmains.com/zhongli/',
  },
  kuki_shinobu: {
    recs: [
      { weaponKey: 'freedomsworn', rank: 1, note: 'signature — highest EM secondary' },
      { weaponKey: "xiphos'_moonlight", rank: 2, note: 'F2P, EM + energy support' },
      { weaponKey: 'iron_sting', rank: 3, note: 'F2P craftable EM option' },
      { weaponKey: 'favonius_sword', rank: 4, note: 'F2P energy option' },
    ],
    source: 'https://keqingmains.com/q/shinobu-quickguide/',
  },
  faruzan: {
    recs: [
      { weaponKey: 'favonius_warbow', rank: 1, note: 'BiS in nearly all scenarios — team ER' },
      { weaponKey: 'elegy_for_the_end', rank: 2, note: 'team buff' },
      { weaponKey: 'sacrificial_bow', rank: 3, note: 'F2P option' },
      { weaponKey: "hunter's_path", rank: 4, note: 'C6 personal-damage option' },
    ],
    source: 'https://keqingmains.com/faruzan/',
  },
  sigewinne: {
    recs: [
      { weaponKey: 'silvershower_heartstrings', rank: 1, note: 'signature' },
      { weaponKey: 'elegy_for_the_end', rank: 2, note: 'team buff + ER' },
      { weaponKey: 'recurve_bow', rank: 3, note: 'F2P HP option' },
      { weaponKey: 'favonius_warbow', rank: 4, note: 'F2P energy option' },
    ],
    source: 'https://keqingmains.com/q/sigewinne-quickguide',
  },
  kujou_sara: {
    recs: [
      { weaponKey: 'elegy_for_the_end', rank: 1, note: 'best buffing option' },
      { weaponKey: 'skyward_harp', rank: 2 },
      { weaponKey: 'fading_twilight', rank: 3, note: 'best F2P option' },
      { weaponKey: 'favonius_warbow', rank: 4, note: 'F2P energy option' },
    ],
    source: 'https://keqingmains.com/sara/',
  },
  wriothesley: {
    recs: [
      { weaponKey: 'cashflow_supervision', rank: 1, note: 'signature' },
      { weaponKey: 'the_widsith', rank: 2 },
      { weaponKey: 'prototype_amber', rank: 3, note: 'F2P option' },
      { weaponKey: 'mappa_mare', rank: 4 },
    ],
    source: 'https://keqingmains.com/q/wriothesley-quickguide/',
  },
  clorinde: {
    recs: [
      { weaponKey: 'absolution', rank: 1, note: 'signature' },
      { weaponKey: 'haran_geppaku_futsu', rank: 2 },
      { weaponKey: 'mistsplitter_reforged', rank: 3 },
      { weaponKey: 'finale_of_the_deep', rank: 4, note: 'F2P craftable, strongest free option' },
    ],
    source: 'https://keqingmains.com/q/clorinde-quickguide/',
  },
};

/** Best-ranked weapon the player owns for this character. Prefers an owned
 *  copy that's unequipped or already on this character; otherwise flags
 *  which character it would need to be pulled from. Pure. */
export function bestOwnedWeapon(
  characterKey: string,
  owned: OwnedWeapon[],
): { rec: WeaponRec; ownedAs: OwnedWeapon; conflictWith: string | null } | null {
  const table = WEAPON_RANKINGS[characterKey];
  if (!table) return null;
  const sorted = [...table.recs].sort((a, b) => a.rank - b.rank);
  for (const rec of sorted) {
    const copies = owned.filter((w) => w.key === rec.weaponKey);
    if (copies.length === 0) continue;
    const free =
      copies.find(
        (w) => w.location === null || w.location === characterKey,
      ) ?? copies[0];
    return {
      rec,
      ownedAs: free,
      conflictWith:
        free.location && free.location !== characterKey
          ? free.location
          : null,
    };
  }
  return null;
}
