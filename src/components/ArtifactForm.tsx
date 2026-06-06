import { useState } from 'react';
import type { Artifact, Slot, StatKey, SubStat } from '../game/types';
import { SLOTS } from '../game/types';
import { genshinAdapter } from '../game/genshin/adapter';
import { validateArtifactDraft } from '../state/artifactValidation';
import { useInventory } from '../state/inventory';

const STAT_OPTIONS: StatKey[] = genshinAdapter.statKeys;

export function ArtifactForm({ onDone }: { onDone?: () => void }) {
  const add = useInventory((s) => s.add);
  const [slot, setSlot] = useState<Slot>('sands');
  const [setKey, setSetKey] = useState(genshinAdapter.sets()[0]?.key ?? '');
  const [mainStat, setMainStat] = useState<StatKey>('atk_pct');
  const [level, setLevel] = useState(20);
  // Sub-stat editing UI is intentionally minimal in v1.0; reserved for future use.
  const subStats: SubStat[] = [];
  const [error, setError] = useState<string | null>(null);

  function submit() {
    const err = validateArtifactDraft({ mainStat, level, subStats });
    setError(err);
    if (err) return;
    const a: Artifact = {
      id: crypto.randomUUID(),
      setKey,
      slot,
      rarity: 5,
      level,
      mainStat,
      mainStatValue: genshinAdapter.mainStatValue(mainStat, 5, level),
      subStats,
    };
    add(a);
    onDone?.();
  }

  return (
    <div className="space-y-2 p-4 border rounded">
      <label className="block">
        Set
        <select
          className="ml-2 border"
          value={setKey}
          onChange={(e) => setSetKey(e.target.value)}
        >
          {genshinAdapter.sets().map((s) => (
            <option key={s.key} value={s.key}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        Slot
        <select
          className="ml-2 border"
          value={slot}
          onChange={(e) => setSlot(e.target.value as Slot)}
        >
          {SLOTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        Main stat
        <select
          className="ml-2 border"
          value={mainStat}
          onChange={(e) => setMainStat(e.target.value as StatKey)}
        >
          {STAT_OPTIONS.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        Level
        <input
          id="level-input"
          className="ml-2 border w-16"
          type="number"
          value={level}
          onChange={(e) => setLevel(Number(e.target.value))}
        />
      </label>
      {error && (
        <p role="alert" className="text-red-600 text-sm">
          {error}
        </p>
      )}
      <button
        className="px-3 py-1 bg-blue-600 text-white rounded"
        onClick={submit}
      >
        Add artifact
      </button>
    </div>
  );
}
