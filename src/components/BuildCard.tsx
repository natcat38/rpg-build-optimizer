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
} from '../labels';
import { META_TARGETS } from '../meta/metaTargets';
import { gradeBuild, type Grade } from '../meta/grade';
import { Marker } from './ui/Marker';
import { Meter } from './ui/Meter';
import type { Tone } from './ui/tone';

const GRADE_TONE: Record<Grade, Tone> = {
  S: 'accent',
  A: 'jade',
  B: 'flux',
  C: 'muted',
  D: 'rose',
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
    <div className="panel panel-sm space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {rank != null && (
            <span className="section-badge section-badge-sm">{rank}</span>
          )}
          <div>
            <p className="micro-label">{objectiveLabel(request.objective)}</p>
            <p className="font-mono text-2xl font-bold leading-tight text-accent-bright">
              {formatScore(build.objectiveValue)}
            </p>
            <p className="max-w-xs text-2xs text-muted">
              {objectiveHint(request.objective)}
            </p>
          </div>
          {grade && (
            <Marker
              tone={GRADE_TONE[grade.grade]}
              aria-label={`Grade ${grade.grade} — how close this build is to endgame stat targets`}
              title={`Grade ${grade.grade} — how close this build is to endgame stat targets`}
            >
              {grade.grade}
            </Marker>
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
                  <Meter
                    value={s.pct * 100}
                    tone={met ? 'jade' : 'accent'}
                    className="mt-0.5"
                  />
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
              {/* Flat stats (EM, ATK) are whole numbers in-game — a trailing
                  ".0" on them reads as false precision. */}
              {formatScore(build.totals[k] ?? 0, isPctStat(k) ? 1 : 0)}
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
                <p className="mt-1 pl-9 font-mono text-2xs leading-relaxed text-muted">
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
