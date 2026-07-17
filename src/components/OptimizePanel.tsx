import { useMemo, type ReactNode } from 'react';
import type { BuildLevel, Objective, Slot, StatKey } from '../game/types';
import { BUILD_LEVELS } from '../game/types';
import { genshinAdapter } from '../game/genshin/adapter';
import { useInventory } from '../state/inventory';
import { useRoster } from '../state/roster';
import { useOptimizeRequest } from '../state/optimizeRequest';
import { useGame } from '../state/game';
import { getGame } from '../game/registry';
import {
  formatSetName,
  isPctStat,
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
import {
  TEAMMATES,
  resolveTeammateName,
  type TeammateRec,
} from '../meta/teammates';

const OBJECTIVES: Objective[] = [
  'crit_value',
  'em',
  'atk_pct',
  'atk',
  'er_pct',
  'elemental_dmg',
];

function setRequirementLabel(meta: MetaTarget): string {
  const req = meta.setRequirement;
  if (req.kind === '2+2')
    return req.setKeys.map((k) => `2pc ${formatSetName(k)}`).join(' + ');
  return `${req.kind} ${formatSetName(req.setKey)}`;
}

/** Shared shell for the two read-only meta-recipe panels below (recipe
 *  summary, teammate recs) — same border/background/text treatment and a
 *  trailing "Source" link out to the guide it was curated from. */
function InfoPanel({ href, children }: { href: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-white/5 bg-surface-900/40 p-3 text-xs text-muted">
      {children}
      <a
        className="mt-1.5 inline-block text-accent hover:underline"
        href={href}
        target="_blank"
        rel="noreferrer"
      >
        Source
      </a>
    </div>
  );
}

/** Read-only preview of what "Use meta build" is about to apply — the recipe
 *  itself isn't editable, but every field it fills (constraints, ER floor)
 *  stays editable afterward via the fields above (ADR-0007). */
function MetaTargetSummary({ meta }: { meta: MetaTarget }) {
  const mainsEntries = (Object.keys(meta.mains) as Slot[]).filter(
    (s) => meta.mains[s],
  );
  return (
    <InfoPanel href={meta.source}>
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
        {meta.critRatioTarget != null && meta.critRatioTarget > 0 && (
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
                {isPctStat(k) ? '%' : ''}
              </span>
            ),
          )}
      </p>
    </InfoPanel>
  );
}

/** Curated "works well with" list (ADR-0007-style: static, sourced). Falls
 *  back to the raw character key rather than crashing if a teammate isn't
 *  in the frozen dataset. */
function TeammatesSummary({
  entry,
  characters,
}: {
  entry: { recs: TeammateRec[]; source: string };
  characters: { key: string; name: string }[];
}) {
  return (
    <InfoPanel href={entry.source}>
      <p className="mb-1.5 font-semibold text-paper">Works well with</p>
      <ul className="space-y-1">
        {entry.recs.map((r) => (
          <li key={r.characterKey}>
            <span className="font-medium text-paper">
              {resolveTeammateName(r.characterKey, characters)}
            </span>{' '}
            <span className="text-muted">({r.role})</span> — {r.why}
          </li>
        ))}
      </ul>
    </InfoPanel>
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
  const rosterEntries = useRoster((s) => s.entries);
  const game = getGame(useGame((s) => s.gameId));
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

  function onCharacterChange(key: string) {
    setCharacterKey(key);
    // Pre-fill from the owned roster; both fields stay manually overridable
    // afterward (same pre-fill-stay-overridable spirit as "Use meta build",
    // ADR-0007 / ADR-0015).
    const entry = rosterEntries[key];
    if (entry?.weaponKey) setWeaponKey(entry.weaponKey);
    if (entry?.buildLevel) setBuildLevel(entry.buildLevel);
  }

  const charOptions = useMemo(() => {
    const owned = (key: string) => key in rosterEntries;
    const opts = chars.map((c) => ({
      value: c.key,
      label: owned(c.key) ? `${c.name} (Owned)` : c.name,
    }));
    // Stable sort: owned first, dataset order preserved within each group.
    return opts.sort((a, b) => Number(owned(b.value)) - Number(owned(a.value)));
  }, [chars, rosterEntries]);

  const hasArtifacts = artifacts.length > 0;
  const canRun = hasArtifacts && !!characterKey;
  const hint = !hasArtifacts
    ? `Add or import ${game.gearNounPlural.toLowerCase()} before optimising.`
    : !characterKey
      ? 'Pick a character to start.'
      : null;
  const meta = META_TARGETS[characterKey];
  const teammates = TEAMMATES[characterKey];
  // A character can't be de-leveled, so a rostered character's build level
  // is a floor, not just a suggestion — levels below it aren't achievable.
  const rosterBuildLevel = rosterEntries[characterKey]?.buildLevel;

  return (
    <div className="panel space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="block">
          <span className="field-label">Character</span>
          <Combobox
            options={charOptions}
            value={characterKey}
            onChange={onCharacterChange}
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
            {BUILD_LEVELS.map((l) => {
              const alreadyAchieved =
                rosterBuildLevel != null && l < rosterBuildLevel;
              return (
                <option key={l} value={l} disabled={alreadyAchieved}>
                  Lv. {l}
                  {alreadyAchieved ? ' (already achieved)' : ''}
                </option>
              );
            })}
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
                {meta?.objective === o ? ' (Recommended)' : ''}
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
      {teammates && <TeammatesSummary entry={teammates} characters={chars} />}

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
