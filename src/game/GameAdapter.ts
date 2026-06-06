import type { Slot, StatKey, StatVec, BuildLevel } from './types';

export interface CharacterMeta {
  key: string;
  name: string;
  element:
    | 'pyro'
    | 'hydro'
    | 'electro'
    | 'cryo'
    | 'anemo'
    | 'geo'
    | 'dendro'
    | 'physical';
}

export interface WeaponMeta {
  key: string;
  name: string;
  type: string;
}

export interface ArtifactSetMeta {
  key: string;
  name: string;
  twoPiece?: StatVec;
  fourPiece?: StatVec;
}

/**
 * The extension seam (ADR-0008). The optimiser depends only on this interface,
 * never on genshin/* imports, so a second game can slot in by providing another
 * adapter. `id` is `string` (not a literal) so other adapters can implement it.
 */
export interface GameAdapter {
  id: string;
  slots: Slot[];
  statKeys: StatKey[];
  characters(): CharacterMeta[];
  weapons(): WeaponMeta[];
  sets(): ArtifactSetMeta[];
  baseStats(
    characterKey: string,
    weaponKey: string,
    level: BuildLevel,
  ): StatVec;
  mainStatValue(mainStat: StatKey, rarity: number, level: number): number;
}
