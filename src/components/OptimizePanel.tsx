import { useMemo } from 'react';
import type { BuildLevel, Objective, Slot, StatKey } from '../game/types';
import { BUILD_LEVELS } from '../game/types';
import { genshinAdapter } from '../game/genshin/adapter';
import { useInventory } from '../state/inventory';
import { useOptimizeRequest } from '../state/optimizeRequest';
import { useGame } from '../state/game';
import { GAMES } from '../game/registry';
import {
  formatSetName,
  objectiveLabel,
  SLOT_LABELS,
  statLabel,
} from '../ui/labels';
import { Combobox } from './ui/Combobox';
import {
  META_TARGETS,
  metaToConstraints,
  type MetaTarget,
} from '../meta/metaTargets';

const OBJECTIVES: Objective[] = [
  'crit_value',
  'em',
  'atk_pct',
  'atk',
  'er_pct',
  'elemental_dmg',
];

// Stats whose values are conventionally displayed as a percentage.
const PCT_STATS = new Set<StatKey>([
  'hp_pct',
  'atk_pct',
  'def_pct',
  'er_pct',
  'crit_rate',
  'crit_dmg',
  'elemental_dmg',
  'physical_dmg',
  'healing',
]);

function setRequirementLabel(meta: MetaTarget): string {
  const req = meta.setRequirement;
  if (req.kind === '2+2')
    return req.setKeys.map((k) => `2pc ${formatSetName(k)}`).join(' + ');
  return `${req.kind} ${formatSetName(req.setKey)}`;
}

/** Read-only preview of what "Use meta build" is about to apply — the recipe
 *  itself isn't editable, but every field it fills (constraints, ER floor)
 *  stays editable afterward via the fields above (ADR-0007). */
function MetaTargetSummary({ meta }: { meta: MetaTarget }) {
  const mainsEntries = (Object.keys(meta.mains) as Slot[]).filter(
    (s) => meta.mains[s],
  );
  return (
    <div className="rounded-lg border border-white/5 bg-surface-900/40 p-3 text-xs text-muted">
      <p>
        <span className="font-semibold text-paper">
          {setRequirementLabel(meta)}
        </span>
        {mainsEntries.length > 0 && (
          <>
            {' · '}
            {mainsEntries
              .map((s) => `${SLOT_LABELS[s]}: ${statLabel(meta.mains[s]!)}`)
              .join(' · ')}
          </>
        )}
      </p>
      <p className="mt-1 flex flex-wrap gap-x-3">
        {meta.erTarget != null && <span>ER target {meta.erTarget}%</span>}
        {meta.critRatioTarget != null && (
          <span>
            CR:CD ≈ 1:
            {((1 - meta.critRatioTarget) / meta.critRatioTarget).toFixed(1)}
          </span>
        )}
        {meta.statTargets &&
          (Object.entries(meta.statTargets) as [StatKey, number][]).map(
            ([k, v]) => (
              <span key={k}>
                {statLabel(k)} {v}
                {PCT_STATS.has(k) ? '%' : ''}
              </span>
            ),
          )}
      </p>
      <a
        className="mt-1 inline-block text-accent hover:underline"
        href={meta.source}
        target="_blank"
        rel="noreferrer"
      >
        Source
      </a>
    </div>
  );
}

export function OptimizePanel({
  onRun,
  running,
}: {
  onRun: () => void | Promise<void>;
  running: boolean;
}) {
  const artifacts = useInventory((s) => s.artifacts);
  const game = GAMES[useGame((s) => s.gameId)];
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
    ? `Add or import ${game.gearNounPlural.toLowerCase()} before optimising.`
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

      {meta && <MetaTargetSummary meta={meta} />}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4">
        {hint ? (
          <p className="text-sm text-muted">{hint}</p>
        ) : (
          <p className="text-sm text-muted">
            Searching{' '}
            <span className="font-semibold text-paper">{artifacts.length}</span>{' '}
            {game.gearNounPlural.toLowerCase()} for the exact optimum.
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
                void onRun();
              }}
            >
              Use meta build
            </button>
          )}
          <button
            className={`btn-primary ${running ? 'animate-pulse-glow' : ''}`}
            disabled={!canRun || running}
            onClick={() => void onRun()}
          >
            {running ? 'Searching…' : 'Optimise'}
          </button>
        </div>
      </div>
    </div>
  );
}
