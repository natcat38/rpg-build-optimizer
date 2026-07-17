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
      { weaponKey: 'freedomsworn', rank: 3 },
      { weaponKey: 'favonius_sword', rank: 4, note: 'F2P energy option' },
    ],
    source: 'https://keqingmains.com/furina/',
  },
  nahida: {
    recs: [
      { weaponKey: 'a_thousand_floating_dreams', rank: 1, note: 'signature' },
      { weaponKey: "tulaytullah's_remembrance", rank: 2 },
      { weaponKey: "kagura's_verity", rank: 3 },
      { weaponKey: 'sacrificial_fragments', rank: 4, note: 'F2P option' },
    ],
    source: 'https://keqingmains.com/nahida/',
  },
  navia: {
    recs: [
      { weaponKey: 'beacon_of_the_reed_sea', rank: 1, note: 'signature' },
      { weaponKey: 'the_unforged', rank: 2 },
      { weaponKey: 'serpent_spine', rank: 3 },
      { weaponKey: 'favonius_greatsword', rank: 4, note: 'F2P energy option' },
    ],
    source: 'https://keqingmains.com/navia/',
  },
  neuvillette: {
    recs: [
      { weaponKey: 'tome_of_the_eternal_flow', rank: 1, note: 'signature' },
      { weaponKey: 'the_widsith', rank: 2 },
      { weaponKey: 'prototype_amber', rank: 3, note: 'F2P, healing side-value' },
      { weaponKey: 'mappa_mare', rank: 4 },
    ],
    source: 'https://keqingmains.com/neuvillette/',
  },
  hu_tao: {
    recs: [
      { weaponKey: 'staff_of_homa', rank: 1, note: 'best-in-slot' },
      { weaponKey: "dragon's_bane", rank: 2, note: 'F2P, strong vs Hydro/Pyro' },
      { weaponKey: 'deathmatch', rank: 3 },
      { weaponKey: 'black_tassel', rank: 4, note: 'F2P HP option' },
    ],
    source: 'https://keqingmains.com/hutao/',
  },
  arataki_itto: {
    recs: [
      { weaponKey: 'redhorn_stonethresher', rank: 1, note: 'signature' },
      { weaponKey: 'serpent_spine', rank: 2 },
      { weaponKey: 'whiteblind', rank: 3, note: 'F2P DEF option' },
      { weaponKey: 'favonius_greatsword', rank: 4, note: 'F2P energy option' },
    ],
    source: 'https://keqingmains.com/itto/',
  },
  raiden_shogun: {
    recs: [
      { weaponKey: 'engulfing_lightning', rank: 1, note: 'signature' },
      { weaponKey: 'primordial_jade_wingedspear', rank: 2 },
      { weaponKey: 'the_catch', rank: 3, note: 'craftable ER option' },
      { weaponKey: 'black_tassel', rank: 4, note: 'F2P option' },
    ],
    source: 'https://keqingmains.com/raiden/',
  },
  xiao: {
    recs: [
      { weaponKey: 'primordial_jade_wingedspear', rank: 1 },
      { weaponKey: 'staff_of_homa', rank: 2 },
      { weaponKey: "dragon's_bane", rank: 3, note: 'F2P option' },
      { weaponKey: 'black_tassel', rank: 4 },
    ],
    source: 'https://keqingmains.com/xiao/',
  },
  klee: {
    recs: [
      { weaponKey: 'lost_prayer_to_the_sacred_winds', rank: 1 },
      { weaponKey: 'dodoco_tales', rank: 2, note: 'signature' },
      { weaponKey: 'the_widsith', rank: 3 },
      { weaponKey: 'sacrificial_fragments', rank: 4, note: 'F2P option' },
    ],
    source: 'https://keqingmains.com/klee/',
  },
  tartaglia: {
    recs: [
      { weaponKey: 'polar_star', rank: 1, note: 'signature' },
      { weaponKey: 'thundering_pulse', rank: 2 },
      { weaponKey: "amos'_bow", rank: 3 },
      { weaponKey: 'the_stringless', rank: 4, note: 'F2P option' },
    ],
    source: 'https://keqingmains.com/childe/',
  },
  keqing: {
    recs: [
      { weaponKey: 'mistsplitter_reforged', rank: 1 },
      { weaponKey: 'primordial_jade_cutter', rank: 2 },
      { weaponKey: "lion's_roar", rank: 3, note: 'F2P (Electro-adjacent) option' },
      { weaponKey: 'favonius_sword', rank: 4, note: 'F2P energy option' },
    ],
    source: 'https://keqingmains.com/keqing/',
  },
  kamisato_ayaka: {
    recs: [
      { weaponKey: 'mistsplitter_reforged', rank: 1 },
      { weaponKey: 'haran_geppaku_futsu', rank: 2, note: 'signature' },
      { weaponKey: 'primordial_jade_cutter', rank: 3 },
      { weaponKey: 'favonius_sword', rank: 4, note: 'F2P energy option' },
    ],
    source: 'https://keqingmains.com/ayaka/',
  },
  yoimiya: {
    recs: [
      { weaponKey: 'thundering_pulse', rank: 1, note: 'signature' },
      { weaponKey: 'polar_star', rank: 2 },
      { weaponKey: "amos'_bow", rank: 3 },
      { weaponKey: 'the_stringless', rank: 4, note: 'F2P option' },
    ],
    source: 'https://keqingmains.com/yoimiya/',
  },
  alhaitham: {
    recs: [
      { weaponKey: 'light_of_foliar_incision', rank: 1, note: 'signature' },
      { weaponKey: 'haran_geppaku_futsu', rank: 2 },
      { weaponKey: 'primordial_jade_cutter', rank: 3 },
      { weaponKey: "xiphos'_moonlight", rank: 4, note: 'F2P EM option' },
    ],
    source: 'https://keqingmains.com/q/alhaitham-quickguide',
  },
  cyno: {
    recs: [
      { weaponKey: 'staff_of_the_scarlet_sands', rank: 1, note: 'signature' },
      { weaponKey: 'primordial_jade_wingedspear', rank: 2 },
      { weaponKey: "dragon's_bane", rank: 3, note: 'F2P option' },
      { weaponKey: 'black_tassel', rank: 4 },
    ],
    source: 'https://keqingmains.com/q/cyno-quickguide',
  },
  wanderer: {
    recs: [
      { weaponKey: 'everlasting_moonglow', rank: 1, note: 'signature' },
      { weaponKey: "tulaytullah's_remembrance", rank: 2 },
      { weaponKey: 'lost_prayer_to_the_sacred_winds', rank: 3 },
      { weaponKey: 'the_widsith', rank: 4 },
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
      { weaponKey: 'staff_of_homa', rank: 2 },
      { weaponKey: "dragon's_bane", rank: 3, note: 'F2P option' },
      { weaponKey: 'black_tassel', rank: 4 },
    ],
    source: 'https://keqingmains.com/q/arlecchino-quickguide',
  },
  xingqiu: {
    recs: [
      { weaponKey: 'sacrificial_sword', rank: 1, note: 'F2P, extra Hydro applications' },
      { weaponKey: 'favonius_sword', rank: 2, note: 'F2P energy option' },
      { weaponKey: 'iron_sting', rank: 3 },
      { weaponKey: 'the_black_sword', rank: 4 },
    ],
    source: 'https://keqingmains.com/xingqiu/',
  },
  yelan: {
    recs: [
      { weaponKey: 'aqua_simulacra', rank: 1, note: 'signature' },
      { weaponKey: 'the_stringless', rank: 2, note: 'F2P option' },
      { weaponKey: 'sacrificial_bow', rank: 3 },
      { weaponKey: 'favonius_warbow', rank: 4, note: 'F2P energy option' },
    ],
    source: 'https://keqingmains.com/yelan/',
  },
  xiangling: {
    recs: [
      { weaponKey: 'staff_of_homa', rank: 1 },
      { weaponKey: "dragon's_bane", rank: 2, note: 'F2P option, strong on-element' },
      { weaponKey: 'favonius_lance', rank: 3, note: 'F2P energy option' },
      { weaponKey: 'the_catch', rank: 4, note: 'craftable ER option' },
    ],
    source: 'https://keqingmains.com/xiangling/',
  },
  bennett: {
    recs: [
      { weaponKey: 'aquila_favonia', rank: 1, note: 'best-in-slot' },
      { weaponKey: 'favonius_sword', rank: 2, note: 'F2P energy option' },
      { weaponKey: 'sacrificial_sword', rank: 3, note: 'F2P option' },
      { weaponKey: 'the_black_sword', rank: 4 },
    ],
    source: 'https://keqingmains.com/bennett/',
  },
  kaedehara_kazuha: {
    recs: [
      { weaponKey: 'freedomsworn', rank: 1, note: 'signature' },
      { weaponKey: 'iron_sting', rank: 2, note: 'F2P EM option' },
      { weaponKey: 'favonius_sword', rank: 3, note: 'F2P energy option' },
      { weaponKey: 'sacrificial_sword', rank: 4, note: 'F2P option' },
    ],
    source: 'https://keqingmains.com/kazuha/',
  },
  zhongli: {
    recs: [
      { weaponKey: 'favonius_lance', rank: 1, note: 'F2P energy option' },
      { weaponKey: 'the_catch', rank: 2, note: 'craftable ER option' },
      { weaponKey: 'black_tassel', rank: 3, note: 'F2P option' },
      { weaponKey: 'primordial_jade_wingedspear', rank: 4 },
    ],
    source: 'https://keqingmains.com/zhongli/',
  },
  kuki_shinobu: {
    recs: [
      { weaponKey: 'iron_sting', rank: 1, note: 'F2P EM option' },
      { weaponKey: 'favonius_sword', rank: 2, note: 'F2P energy option' },
      { weaponKey: 'sacrificial_sword', rank: 3, note: 'F2P option' },
      { weaponKey: "xiphos'_moonlight", rank: 4 },
    ],
    source: 'https://keqingmains.com/q/shinobu-quickguide/',
  },
  faruzan: {
    recs: [
      { weaponKey: "hunter's_path", rank: 1 },
      { weaponKey: 'sacrificial_bow', rank: 2, note: 'F2P option' },
      { weaponKey: 'favonius_warbow', rank: 3, note: 'F2P energy option' },
      { weaponKey: 'end_of_the_line', rank: 4 },
    ],
    source: 'https://keqingmains.com/faruzan/',
  },
  sigewinne: {
    recs: [
      { weaponKey: 'sacrificial_fragments', rank: 1, note: 'F2P option' },
      { weaponKey: 'prototype_amber', rank: 2, note: 'F2P, healing side-value' },
      { weaponKey: 'favonius_codex', rank: 3, note: 'F2P energy option' },
      { weaponKey: 'oathsworn_eye', rank: 4 },
    ],
    source: 'https://keqingmains.com/q/sigewinne-quickguide',
  },
  kujou_sara: {
    recs: [
      { weaponKey: 'hamayumi', rank: 1, note: 'signature' },
      { weaponKey: 'favonius_warbow', rank: 2, note: 'F2P energy option' },
      { weaponKey: 'sacrificial_bow', rank: 3, note: 'F2P option' },
      { weaponKey: 'the_stringless', rank: 4 },
    ],
    source: 'https://keqingmains.com/sara/',
  },
  wriothesley: {
    recs: [
      { weaponKey: 'tome_of_the_eternal_flow', rank: 1, note: 'signature' },
      { weaponKey: 'the_widsith', rank: 2 },
      { weaponKey: 'prototype_amber', rank: 3, note: 'F2P option' },
      { weaponKey: 'mappa_mare', rank: 4 },
    ],
    source: 'https://keqingmains.com/q/wriothesley-quickguide/',
  },
  clorinde: {
    recs: [
      { weaponKey: 'absolution', rank: 1, note: 'signature' },
      { weaponKey: 'primordial_jade_cutter', rank: 2 },
      { weaponKey: 'mistsplitter_reforged', rank: 3 },
      { weaponKey: 'favonius_sword', rank: 4, note: 'F2P energy option' },
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
