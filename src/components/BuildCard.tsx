import { useMemo } from 'react';
import type {
  Artifact,
  BuildResult,
  OptimizeRequest,
  StatKey,
} from '../game/types';
import { SLOTS } from '../game/types';
import {
  formatScore,
  formatSetName,
  isPctStat,
  objectiveLabel,
  SLOT_GLYPH,
  SLOT_LABELS,
  statLabel,
  objectiveHint,
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
  const grade = useMemo(
    () => (statTargets ? gradeBuild(build.totals, statTargets) : null),
    [build.totals, statTargets],
  );
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
              {formatScore(build.objectiveValue)}
            </p>
            <p className="max-w-xs text-[0.7rem] text-muted">
              {objectiveHint(request.objective)}
            </p>
          </div>
          {grade && (
            <span
              className={`grid h-8 w-8 flex-none place-items-center rounded-lg border font-display text-sm font-bold ${GRADE_STYLE[grade.grade]}`}
              aria-label={`Grade ${grade.grade} — how close this build is to endgame stat targets`}
              title={`Grade ${grade.grade} — how close this build is to endgame stat targets`}
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
        <div className="well px-3 py-2 text-xs text-muted">
          <div className="grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
            {grade.perStat.map((s) => {
              const unit = isPctStat(s.key) ? '%' : '';
              const met = s.pct >= 1;
              return (
                <div key={s.key}>
                  <p>
                    {/* Glyph, not hue alone: the bar below is decorative, so
                        "met" has to survive a colour-blind read of the text. */}
                    {met && <span className="text-jade">✓ </span>}
                    {statLabel(s.key)} {formatScore(s.have, 0)}
                    {unit}/{formatScore(s.target, 0)}
                    {unit}{' '}
                    <span className={met ? 'text-jade' : 'text-paper/80'}>
                      ({formatScore(s.pct * 100, 0)}%)
                    </span>
                  </p>
                  <div
                    aria-hidden="true"
                    className="mt-0.5 h-0.5 overflow-hidden rounded-full bg-white/5"
                  >
                    <div
                      className={`h-full rounded-full ${met ? 'bg-jade/70' : 'bg-accent/60'}`}
                      style={{
                        width: `${Math.min(Math.max(s.pct, 0), 1) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
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
              {formatScore(build.totals[k] ?? 0)}
            </dd>
          </div>
        ))}
      </dl>

      <ul className="space-y-1.5">
        {SLOTS.map((s) => {
          const a = bySlot.get(s);
          return (
            <li key={s} className="well px-3 py-2">
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
