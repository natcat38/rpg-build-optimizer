import { useState } from 'react';
import type { Artifact, Slot, StatKey, SubStat } from '../game/types';
import { SLOTS } from '../game/types';
import { genshinAdapter } from '../game/genshin/adapter';
import { validateArtifactDraft } from '../state/artifactValidation';
import { useInventory } from '../state/inventory';
import { formatSetName, SLOT_LABELS, statLabel } from '../ui/labels';
import { Combobox } from './ui/Combobox';

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
    <div className="panel space-y-4 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="block">
          <span className="field-label">Set</span>
          <Combobox
            options={genshinAdapter
              .sets()
              .map((s) => ({ value: s.key, label: formatSetName(s.name) }))}
            value={setKey}
            onChange={setSetKey}
          />
        </div>
        <label className="block">
          <span className="field-label">Slot</span>
          <select
            className="field"
            value={slot}
            onChange={(e) => setSlot(e.target.value as Slot)}
          >
            {SLOTS.map((s) => (
              <option key={s} value={s}>
                {SLOT_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="field-label">Main stat</span>
          <select
            className="field"
            value={mainStat}
            onChange={(e) => setMainStat(e.target.value as StatKey)}
          >
            {STAT_OPTIONS.map((k) => (
              <option key={k} value={k}>
                {statLabel(k)}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="field-label">Level</span>
          <input
            id="level-input"
            className="field"
            type="number"
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
          />
        </label>
      </div>
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-rose/30 bg-rose/10 px-3 py-2 text-sm text-rose"
        >
          {error}
        </p>
      )}
      <button className="btn-primary" onClick={submit}>
        Add artifact
      </button>
    </div>
  );
}
