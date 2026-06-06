// Declared shape of data.generated.json. Importing the JSON directly gives
// TypeScript an over-narrow inferred literal type (per-key `?: undefined`),
// which breaks string indexing and optional-property access. Casting the import
// to this type collapses it to the intended broad shapes.

export interface SnapshotCharacter {
  key: string;
  name: string;
  element: string;
  baseByLevel: Record<string, Record<string, number>>;
}

export interface SnapshotWeapon {
  key: string;
  name: string;
  type: string;
  byLevel: Record<string, Record<string, number>>;
}

export interface SnapshotSet {
  key: string;
  name: string;
  twoPiece?: Record<string, number>;
  fourPiece?: Record<string, number>;
}

export interface Snapshot {
  patch: string;
  characters: SnapshotCharacter[];
  weapons: SnapshotWeapon[];
  sets: SnapshotSet[];
  mainStatValues: Record<string, Record<string, number[]>>;
}
