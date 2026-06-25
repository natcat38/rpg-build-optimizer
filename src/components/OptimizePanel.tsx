import { useMemo } from 'react';
import type { BuildLevel, Objective } from '../game/types';
import { BUILD_LEVELS } from '../game/types';
import { genshinAdapter } from '../game/genshin/adapter';
import { useInventory } from '../state/inventory';
import { useOptimizeRequest } from '../state/optimizeRequest';
import { objectiveLabel } from '../ui/labels';
import { Combobox } from './ui/Combobox';
import { META_TARGETS, metaToConstraints } from '../meta/metaTargets';

const OBJECTIVES: Objective[] = [
  'crit_value',
  'em',
  'atk_pct',
  'atk',
  'er_pct',
  'elemental_dmg',
];

export function OptimizePanel({
  onRun,
  running,
}: {
  onRun: () => void | Promise<void>;
  running: boolean;
}) {
  const artifacts = useInventory((s) => s.artifacts);
  const chars = useMemo(() => genshinAdapter.characters(), []);
  const weapons = useMemo(() => genshinAdapter.weapons(), []);

  const characterKey = useOptimizeRequest((s) => s.characterKey);
  const weaponKey = useOptimizeRequest((s) => s.weaponKey);
  const buildLevel = useOptimizeRequest((s) => s.buildLevel);
  const objective = useOptimizeRequest((s) => s.objective);
  const erFloor = useOptimizeRequest((s) => s.constraints.minStats?.er_pct);
  const minER = erFloor != null ? String(erFloor) : '';
  const setCharacterKey = useOptimizeRequest((s) => s.setCharacterKey);
  const setWeaponKey = useOptimizeRequest((s) => s.setWeaponKey);
  const setBuildLevel = useOptimizeRequest((s) => s.setBuildLevel);
  const setObjective = useOptimizeRequest((s) => s.setObjective);
  const setMinER = useOptimizeRequest((s) => s.setMinER);
  const applyPreset = useOptimizeRequest((s) => s.applyPreset);

  const hasArtifacts = artifacts.length > 0;
  const canRun = hasArtifacts && !!characterKey;
  const hint = !hasArtifacts
    ? 'Add or import artifacts before optimising.'
    : !characterKey
      ? 'Pick a character to start.'
      : null;
  const meta = META_TARGETS[characterKey];

  return (
    <div className="panel space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="block">
          <span className="field-label">Character</span>
          <Combobox
            options={chars.map((c) => ({ value: c.key, label: c.name }))}
            value={characterKey}
            onChange={setCharacterKey}
          />
        </div>
        <div className="block">
          <span className="field-label">Weapon</span>
          <Combobox
            options={weapons.map((w) => ({ value: w.key, label: w.name }))}
            value={weaponKey}
            onChange={setWeaponKey}
          />
        </div>
        <label className="block">
          <span className="field-label">Build level</span>
          <select
            className="field"
            value={buildLevel}
            onChange={(e) =>
              setBuildLevel(Number(e.target.value) as BuildLevel)
            }
          >
            {BUILD_LEVELS.map((l) => (
              <option key={l} value={l}>
                Lv. {l}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="field-label">Maximise</span>
          <select
            className="field"
            value={objective}
            onChange={(e) => setObjective(e.target.value as Objective)}
          >
            {OBJECTIVES.map((o) => (
              <option key={o} value={o}>
                {objectiveLabel(o)}
              </option>
            ))}
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="field-label">Minimum Energy Recharge %</span>
          <input
            className="field"
            type="number"
            value={minER}
            onChange={(e) => setMinER(e.target.value)}
            placeholder="Optional — e.g. 200"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4">
        {hint ? (
          <p className="text-sm text-muted">{hint}</p>
        ) : (
          <p className="text-sm text-muted">
            Searching{' '}
            <span className="font-semibold text-parchment">
              {artifacts.length}
            </span>{' '}
            artifacts for the exact optimum.
          </p>
        )}
        <div className="flex gap-2">
          {meta && (
            <button
              className="btn-ghost"
              disabled={!canRun || running}
              onClick={() => {
                applyPreset({
                  characterKey,
                  weaponKey,
                  objective: meta.objective,
                  constraints: metaToConstraints(meta),
                });
                onRun();
              }}
            >
              Use meta build
            </button>
          )}
          <button
            className={`btn-primary ${running ? 'animate-pulse-glow' : ''}`}
            disabled={!canRun || running}
            onClick={() => onRun()}
          >
            {running ? 'Searching…' : 'Optimise'}
          </button>
        </div>
      </div>
    </div>
  );
}
