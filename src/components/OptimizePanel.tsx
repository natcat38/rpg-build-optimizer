import { useMemo, useState } from 'react';
import type { BuildLevel, Objective, OptimizeRequest } from '../game/types';
import { BUILD_LEVELS } from '../game/types';
import { genshinAdapter } from '../game/genshin/adapter';
import { buildContext } from '../optimizer/context';
import { runOptimize } from '../workers/optimizeClient';
import { useInventory } from '../state/inventory';
import type { OptimizeResult } from '../game/types';
import { objectiveLabel } from '../ui/labels';

const OBJECTIVES: Objective[] = [
  'crit_value',
  'em',
  'atk_pct',
  'atk',
  'er_pct',
  'elemental_dmg',
];

export function OptimizePanel({
  onResult,
}: {
  onResult: (r: OptimizeResult, req: OptimizeRequest) => void;
}) {
  const artifacts = useInventory((s) => s.artifacts);
  const chars = useMemo(() => genshinAdapter.characters(), []);
  const weapons = useMemo(() => genshinAdapter.weapons(), []);
  const [characterKey, setCharacterKey] = useState(chars[0]?.key ?? '');
  const [weaponKey, setWeaponKey] = useState(weapons[0]?.key ?? '');
  const [buildLevel, setBuildLevel] = useState<BuildLevel>(90);
  const [objective, setObjective] = useState<Objective>('crit_value');
  const [minER, setMinER] = useState('');
  const [running, setRunning] = useState(false);

  const hasArtifacts = artifacts.length > 0;
  const canRun = hasArtifacts && !!characterKey;
  const hint = !hasArtifacts
    ? 'Add or import artifacts before optimising.'
    : !characterKey
      ? 'Pick a character to start.'
      : null;

  async function run() {
    if (!canRun) return;
    setRunning(true);
    try {
      const constraints: OptimizeRequest['constraints'] = {};
      if (minER) constraints.minStats = { er_pct: Number(minER) };
      const req: OptimizeRequest = {
        characterKey,
        weaponKey,
        buildLevel,
        constraints,
        objective,
        topK: 10,
      };
      const ctx = buildContext(genshinAdapter, req);
      const result = await runOptimize(req, artifacts, ctx);
      onResult(result, req);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="panel space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="field-label">Character</span>
          <select
            className="field"
            value={characterKey}
            onChange={(e) => setCharacterKey(e.target.value)}
          >
            {chars.map((c) => (
              <option key={c.key} value={c.key}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="field-label">Weapon</span>
          <select
            className="field"
            value={weaponKey}
            onChange={(e) => setWeaponKey(e.target.value)}
          >
            {weapons.map((w) => (
              <option key={w.key} value={w.key}>
                {w.name}
              </option>
            ))}
          </select>
        </label>
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
            placeholder="Optional — e.g. 160"
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
        <button
          className={`btn-primary ${running ? 'animate-pulse-glow' : ''}`}
          disabled={!canRun || running}
          onClick={run}
        >
          {running ? 'Searching…' : 'Optimise'}
        </button>
      </div>
    </div>
  );
}
