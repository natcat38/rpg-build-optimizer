import { useMemo } from 'react';
import type {
  Artifact,
  BuildResult,
  OptimizeRequest,
  Slot,
  StatKey,
} from '../game/types';
import { SLOTS } from '../game/types';
import {
  formatScore,
  formatSetName,
  formatStat,
  isPctStat,
  objectiveLabel,
  SLOT_LABELS,
  statLabel,
} from '../labels';
import { META_TARGETS } from '../meta/metaTargets';
import { gradeBuild, type Grade } from '../meta/grade';
import { SlotGlyph } from './SlotGlyph';
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

/** The five slot marks on one line, filled where this build actually has a
 *  piece. A build's shape at a glance, next to its score — decorative, because
 *  the piece list below states every one of these slots in words. */
function Fingerprint({ filled }: { filled: (s: Slot) => boolean }) {
  return (
    <span aria-hidden="true" className="flex items-center gap-1 text-[13px]">
      {SLOTS.map((s) => (
        <SlotGlyph
          key={s}
          slot={s}
          className={filled(s) ? 'text-accent' : 'text-paper/15'}
        />
      ))}
    </span>
  );
}

export function BuildCard({
  build,
  request,
  artifacts,
  rank,
  delta,
  variants,
  onShare,
}: {
  build: BuildResult;
  request: OptimizeRequest;
  artifacts: Artifact[];
  rank?: number;
  /** Gap to rank 1 in the *ranking score* — the number the list is actually
   *  ordered by — already signed, and therefore never positive. Omitted on
   *  rank 1, where "0" would be noise. Deliberately not the objective
   *  difference: with a target-style objective (a crit ratio, say) the
   *  displayed objective can be *higher* at rank 2, and a "−" chip on a
   *  bigger number reads as a rendering bug. */
  delta?: number;
  /** How many further builds scored exactly this, and what separates them.
   *  Collapsed into this card rather than repeated as identical siblings. */
  variants?: { count: number; differs: string };
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
            <div className="flex items-baseline gap-2">
              <p className="font-mono text-2xl font-bold leading-tight text-accent-bright">
                {formatScore(build.objectiveValue)}
              </p>
              {delta != null && (
                // The gap to rank 1 in the ranking score, which is the only
                // reason to read a runner-up's number at all. U+2212, not a
                // hyphen: at mono weights a hyphen next to digits reads as a
                // separator. The sign comes from the value rather than being
                // written in, so a zero gap can't print as "−0.0".
                <span
                  className="chip flex-none px-1.5 py-0 font-mono text-2xs tabular-nums text-muted"
                  aria-label={`Rank gap: ${formatScore(delta)} against rank 1`}
                  title="Gap to rank 1 in the ranking score"
                >
                  {delta < 0 && '−'}
                  {formatScore(Math.abs(delta))}
                </span>
              )}
            </div>
            <Fingerprint filled={(s) => bySlot.has(s)} />
          </div>
          {grade && (
            // A bare letter in a role-less span is not a name a screen reader
            // can make anything of, and `title` alone is neither the name nor
            // reachable without a mouse. role="img" + aria-label makes the
            // whole sentence the accessible name; `title` stays as the
            // sighted reader's tooltip.
            <Marker
              tone={GRADE_TONE[grade.grade]}
              role="img"
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

      {variants && variants.count > 0 && (
        // Equal score means equal answer, so the alternatives are one line here
        // rather than N more cards printing the same number.
        <p className="text-xs text-muted">
          {`×${variants.count + 1} equivalent variants — same score, ${variants.differs}.`}
        </p>
      )}

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

      {/* One column below sm: two columns of "label … value" overflowed a
          375px viewport by ~42px. */}
      <dl className="grid grid-cols-1 gap-x-6 gap-y-1.5 border-y border-white/5 py-4 text-sm sm:grid-cols-2">
        {SHOW.map((k) => (
          <div key={k} className="flex items-baseline justify-between gap-2">
            <dt className="text-muted">{statLabel(k)}</dt>
            <dd className="font-mono tabular-nums text-paper">
              {formatStat(k, build.totals[k] ?? 0)}
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
                {/* Decorative: the slot name sits right beside it. The grey
                    box this used to sit in was scaffolding for an unreliable
                    text glyph — the mark carries itself now. */}
                <SlotGlyph slot={s} className="h-[17px] w-[17px] text-accent" />
                <span className="w-16 flex-none text-xs uppercase tracking-wide text-muted">
                  {SLOT_LABELS[s]}
                </span>
                {a ? (
                  <>
                    {/* Wraps below sm; truncation only once there's room for
                        a single line to be the honest reading. */}
                    <span className="min-w-0 flex-1 sm:truncate">
                      <span className="font-medium">
                        {formatSetName(a.setKey)}
                      </span>
                      <span className="text-muted">
                        {' '}
                        · {statLabel(a.mainStat)}{' '}
                        {/* The main-stat VALUE, not the level — a +20 flower
                            printing "HP +20" read as a 20-HP piece. */}
                        <span className="font-mono text-xs text-paper/80">
                          {formatStat(a.mainStat, a.mainStatValue)}
                        </span>
                      </span>
                    </span>
                    <span className="chip flex-none px-2 py-0.5">
                      Lv {a.level}
                    </span>
                  </>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </div>
              {a && a.subStats.length > 0 && (
                <p className="mt-1 pl-[29px] font-mono text-2xs leading-relaxed text-muted">
                  {a.subStats.map((sub, i) => (
                    <span key={sub.key}>
                      {i > 0 && <span className="text-muted/40"> · </span>}
                      {statLabel(sub.key)}{' '}
                      <span className="text-paper/80">
                        +{formatStat(sub.key, sub.value)}
                      </span>
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
