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
import { META_TARGETS } from '../meta/metaTargets';
import { gradeBuild, type Grade } from '../meta/grade';

const GRADE_STYLE: Record<Grade, string> = {
  S: 'border-accent-bright/40 bg-accent-bright/10 text-accent-bright',
  A: 'border-jade/40 bg-jade/10 text-jade',
  B: 'border-flux/40 bg-flux/10 text-flux-bright',
  C: 'border-muted/40 bg-muted/10 text-muted',
  D: 'border-rose/40 bg-rose/10 text-rose',
};

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
  const statTargets = META_TARGETS[request.characterKey]?.statTargets;
  const grade = statTargets ? gradeBuild(build.totals, statTargets) : null;
  const weakest = grade?.perStat.reduce((a, s) => (s.pct < a.pct ? s : a));

  return (
    <div className="panel space-y-5 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {rank != null && (
            <span className="grid h-8 w-8 flex-none place-items-center rounded-lg border border-accent/30 bg-accent/10 font-mono text-sm font-bold text-accent-bright">
              {rank}
            </span>
          )}
          <div>
            <p className="text-[0.7rem] uppercase tracking-[0.18em] text-muted">
              {objectiveLabel(request.objective)}
            </p>
            <p className="font-mono text-2xl font-bold leading-tight text-accent-bright">
              {build.objectiveValue.toFixed(1)}
            </p>
          </div>
          {grade && (
            <span
              className={`grid h-8 w-8 flex-none place-items-center rounded-lg border font-display text-sm font-bold ${GRADE_STYLE[grade.grade]}`}
            >
              {grade.grade}
            </span>
          )}
        </div>
        {onShare && (
          <button className="btn-ghost" onClick={() => void onShare()}>
            Copy share link
          </button>
        )}
      </div>

      {grade && (
        <div className="rounded-lg border border-white/5 bg-surface-900/30 px-3 py-2 text-xs text-muted">
          <p className="flex flex-wrap gap-x-3">
            {grade.perStat.map((s) => (
              <span key={s.key}>
                {statLabel(s.key)} {s.have.toFixed(0)}/{s.target.toFixed(0)}{' '}
                <span className={s.pct >= 1 ? 'text-jade' : 'text-paper/80'}>
                  ({(s.pct * 100).toFixed(0)}%)
                </span>
              </span>
            ))}
          </p>
          {weakest && weakest.pct < 1 && (
            <p className="mt-1 text-paper/80">
              Weakest: {statLabel(weakest.key)} — upgrading it helps your grade
              most.
            </p>
          )}
        </div>
      )}

      <dl className="grid grid-cols-2 gap-x-6 gap-y-1.5 border-y border-white/5 py-4 text-sm">
        {SHOW.map((k) => (
          <div key={k} className="flex items-baseline justify-between gap-2">
            <dt className="text-muted">{statLabel(k)}</dt>
            <dd className="font-mono tabular-nums text-paper">
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
              className="rounded-lg border border-white/5 bg-surface-900/30 px-3 py-2"
            >
              <div className="flex items-center gap-3 text-sm text-paper/90">
                <span className="grid h-6 w-6 flex-none place-items-center rounded-md bg-white/5 text-xs text-accent">
                  {SLOT_GLYPH[s]}
                </span>
                <span className="w-16 flex-none text-xs uppercase tracking-wide text-muted">
                  {SLOT_LABELS[s]}
                </span>
                {a ? (
                  <span className="min-w-0 flex-1 truncate">
                    <span className="font-medium">
                      {formatSetName(a.setKey)}
                    </span>
                    <span className="text-muted">
                      {' '}
                      · {statLabel(a.mainStat)}{' '}
                      <span className="font-mono text-xs">+{a.level}</span>
                    </span>
                  </span>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </div>
              {a && a.subStats.length > 0 && (
                <p className="mt-1 pl-9 font-mono text-[0.7rem] leading-relaxed text-muted">
                  {a.subStats.map((sub, i) => (
                    <span key={sub.key}>
                      {i > 0 && <span className="text-muted/40"> · </span>}
                      {statLabel(sub.key)}{' '}
                      <span className="text-paper/80">+{sub.value}</span>
                    </span>
                  ))}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
