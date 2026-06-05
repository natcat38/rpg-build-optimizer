import type { Slot, StatKey, StatVec, BuildLevel } from './types';

export interface CharacterMeta {
  key: string;
  name: string;
  element: 'pyro' | 'hydro' | 'electro' | 'cryo' | 'anemo' | 'geo' | 'dendro' | 'physical';
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

export interface GameAdapter {
  id: 'genshin';
  slots: Slot[];
  statKeys: StatKey[];
  characters(): CharacterMeta[];
  weapons(): WeaponMeta[];
  sets(): ArtifactSetMeta[];
  baseStats(characterKey: string, weaponKey: string, level: BuildLevel): StatVec;
  mainStatValue(mainStat: StatKey, rarity: number, level: number): number;
}
