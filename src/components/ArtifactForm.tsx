import { useState } from 'react';
import type { Artifact, Element, Slot, StatKey, SubStat } from '../game/types';
import { ELEMENTS, SLOTS } from '../game/types';
import { genshinAdapter } from '../game/genshin/adapter';
import { validateArtifactDraft } from '../state/artifactValidation';
import { useInventory } from '../state/inventory';
import { formatSetName, SLOT_LABELS, statLabel } from '../labels';
import { Callout } from './ui/Callout';
import { Combobox } from './ui/Combobox';

const STAT_OPTIONS: StatKey[] = genshinAdapter.statKeys;

// The set list is frozen for the app's lifetime (ADR-0002), so its options are
// built once rather than on every render.
const SET_OPTIONS = genshinAdapter
  .sets()
  .map((s) => ({ value: s.key, label: formatSetName(s.name) }));

export function ArtifactForm() {
  const add = useInventory((s) => s.add);
  const [slot, setSlot] = useState<Slot>('sands');
  const [setKey, setSetKey] = useState(SET_OPTIONS[0]?.value ?? '');
  const [mainStat, setMainStat] = useState<StatKey>('atk_pct');
  const [element, setElement] = useState<Element | ''>('');
  const [level, setLevel] = useState(20);
  // Sub-stat editing UI is intentionally minimal in v1.0; reserved for future use.
  const subStats: SubStat[] = [];
  const [error, setError] = useState<string | null>(null);
  // ponytail: only the level field gets inline validation — it's the one users
  // actually fumble. Everything else keeps the submit-time banner; extend if
  // evidence says otherwise.
  const [levelError, setLevelError] = useState<string | null>(null);

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
      element:
        slot === 'goblet' && mainStat === 'elemental_dmg' && element
          ? element
          : undefined,
    };
    add(a);
  }

  return (
    <div className="panel panel-sm space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="block">
          <span className="field-label">Set</span>
          <Combobox
            options={SET_OPTIONS}
            value={setKey}
            onChange={setSetKey}
            label="Set"
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
        {slot === 'goblet' && mainStat === 'elemental_dmg' && (
          <label className="block">
            <span className="field-label">Element</span>
            <select
              className="field"
              value={element}
              onChange={(e) => setElement(e.target.value as Element | '')}
            >
              <option value="">Any (unknown)</option>
              {ELEMENTS.map((el) => (
                <option key={el} value={el}>
                  {el[0].toUpperCase() + el.slice(1)}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="block">
          <span className="field-label">Level</span>
          <input
            id="level-input"
            className="field"
            type="number"
            min={0}
            max={20}
            value={level}
            aria-describedby={levelError ? 'level-error' : 'level-hint'}
            aria-invalid={levelError ? true : undefined}
            onChange={(e) => setLevel(Number(e.target.value))}
            onBlur={() =>
              setLevelError(
                validateArtifactDraft({ mainStat, level, subStats: [] }),
              )
            }
          />
          {levelError ? (
            <p id="level-error" role="alert" className="mt-1 text-xs text-rose">
              {levelError}
            </p>
          ) : (
            <p id="level-hint" className="mt-1 text-xs text-muted">
              0 to 20.
            </p>
          )}
        </label>
      </div>
      {/* The level field states its own error inline; don't say it twice. */}
      {error && error !== levelError && (
        <Callout tone="error" role="alert">
          {error}
        </Callout>
      )}
      <button className="btn-primary" onClick={submit}>
        Add artifact
      </button>
    </div>
  );
}
