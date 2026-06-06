import type {
  Artifact,
  BuildResult,
  OptimizeRequest,
  StatKey,
} from '../game/types';
import { SLOTS } from '../game/types';
import {
  formatSetName,
  objectiveLabel,
  SLOT_GLYPH,
  SLOT_LABELS,
  statLabel,
} from '../ui/labels';

const SHOW: StatKey[] = [
  'atk',
  'atk_pct',
  'crit_rate',
  'crit_dmg',
  'er_pct',
  'em',
  'elemental_dmg',
];

export function BuildCard({
  build,
  request,
  artifacts,
  rank,
  onShare,
}: {
  build: BuildResult;
  request: OptimizeRequest;
  artifacts: Artifact[];
  rank?: number;
  onShare?: () => void | Promise<void>;
}) {
  const bySlot = new Map(artifacts.map((a) => [a.slot, a]));
  return (
    <div className="panel space-y-5 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {rank != null && (
            <span className="grid h-8 w-8 flex-none place-items-center rounded-lg border border-mora/30 bg-mora/10 font-mono text-sm font-bold text-mora-bright">
              {rank}
            </span>
          )}
          <div>
            <p className="text-[0.7rem] uppercase tracking-[0.18em] text-muted">
              {objectiveLabel(request.objective)}
            </p>
            <p className="font-mono text-2xl font-bold leading-tight text-mora-bright">
              {build.objectiveValue.toFixed(1)}
            </p>
          </div>
        </div>
        {onShare && (
          <button className="btn-ghost" onClick={onShare}>
            Copy share link
          </button>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-1.5 border-y border-white/5 py-4 text-sm">
        {SHOW.map((k) => (
          <div key={k} className="flex items-baseline justify-between gap-2">
            <dt className="text-muted">{statLabel(k)}</dt>
            <dd className="font-mono tabular-nums text-parchment">
              {(build.totals[k] ?? 0).toFixed(1)}
            </dd>
          </div>
        ))}
      </dl>

      <ul className="space-y-1.5">
        {SLOTS.map((s) => {
          const a = bySlot.get(s);
          return (
            <li
              key={s}
              className="flex items-center gap-3 text-sm text-parchment/90"
            >
              <span className="grid h-6 w-6 flex-none place-items-center rounded-md bg-white/5 text-xs text-mora">
                {SLOT_GLYPH[s]}
              </span>
              <span className="w-16 flex-none text-xs uppercase tracking-wide text-muted">
                {SLOT_LABELS[s]}
              </span>
              {a ? (
                <span className="min-w-0 flex-1 truncate">
                  <span className="font-medium">{formatSetName(a.setKey)}</span>
                  <span className="text-muted">
                    {' '}
                    · {statLabel(a.mainStat)}{' '}
                    <span className="font-mono text-xs">+{a.level}</span>
                  </span>
                </span>
              ) : (
                <span className="text-muted">—</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
