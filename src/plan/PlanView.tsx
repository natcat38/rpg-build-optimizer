/**
 * The Plan page: recommended Abyss teams → an optimised build for each of the
 * eight members → one farming list.
 *
 * Eight exact solves are not free, so the plan only runs on an explicit click —
 * never on mount.
 */
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useRoster } from '../state/roster';
import { useInventory } from '../state/inventory';
import { genshinAdapter } from '../game/genshin/adapter';
import { rosterBuildScores } from '../roster/buildScore';
import { recommendAbyss } from '../teams/recommend';
import { archetypeName } from '../teams/comps';
import { META_TARGETS } from '../meta/metaTargets';
import { objectiveHint, objectiveLabel } from '../labels';
import { BuildCard } from '../components/BuildCard';
import { Callout } from '../components/ui/Callout';
import { cn } from '../components/ui/cn';
import { optimize } from '../workers/optimizeClient';
import { composePlan, type Plan, type RunOptimize } from './composePlan';
import { adviseInvestments, type Advice } from '../invest/advise';
import type { Artifact, OptimizeRequest } from '../game/types';
import { SLOTS } from '../game/types';

function MemberCard({
  characterKey,
  objective,
  result,
  conflicts,
  weaponKey,
  buildLevel,
  artifactsById,
}: Plan['builds'][number] & {
  weaponKey: string;
  buildLevel: OptimizeRequest['buildLevel'];
  artifactsById: Record<string, Artifact>;
}) {
  const name = genshinAdapter.characterName(characterKey);
  const request: OptimizeRequest = {
    characterKey,
    weaponKey,
    buildLevel,
    constraints: {},
    objective,
  };
  return (
    <div data-testid="plan-member" className="space-y-2">
      <h4 className="font-display text-sm font-bold text-paper">{name}</h4>
      {/* Per member, not per card: Results hoists this above its list because
          ten cards share one objective, but eight plan members do not. */}
      <p className="text-xs text-muted">{objectiveHint(objective)}</p>
      {!META_TARGETS[characterKey] && (
        <p className="text-xs text-muted">
          No curated recipe for {name} yet — this is the highest raw{' '}
          {objectiveLabel(objective)} from the remaining pieces, ignoring set
          bonuses. Treat it as a stat-stick draft, not a real build.
        </p>
      )}
      {result.status === 'ok' ? (
        <BuildCard
          build={result.builds[0]}
          request={request}
          artifacts={SLOTS.map(
            (s) => artifactsById[result.builds[0].artifactIds[s]],
          ).filter((a): a is Artifact => Boolean(a))}
        />
      ) : (
        <p className="panel panel-md text-sm text-muted">
          Couldn’t gear {name}: teammates earlier in the plan had first pick of
          the shared inventory, and the artifacts left don’t meet {name}’s
          recommended loadout (required set, main stats and ER). The notes below
          show which pieces went where.
        </p>
      )}
      {conflicts.length > 0 && (
        <ul className="space-y-1 text-xs text-muted">
          {conflicts.slice(0, 3).map((c, i) => (
            <li key={i}>• {c}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function PlanView({
  runOptimize = optimize,
  advise = adviseInvestments,
}: {
  /** Injected in tests; the app runs the real worker client. */
  runOptimize?: RunOptimize;
  advise?: typeof adviseInvestments;
}) {
  const entries = useRoster((s) => s.entries);
  const artifacts = useInventory((s) => s.artifacts);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [progress, setProgress] = useState<[number, number] | null>(null);
  const [failed, setFailed] = useState(false);
  // A plan is eight awaited solves. If its inputs are replaced mid-flight the
  // run in progress describes gear the user no longer has, so only the most
  // recently started run may commit progress, a plan, or a failure.
  const planToken = useRef(0);

  // Resolves each member's chosen artifact ids back to Artifact objects for
  // BuildCard — mirrors Results.tsx's artifactsFor.
  const artifactsById = useMemo(() => {
    const m: Record<string, Artifact> = {};
    for (const a of artifacts) m[a.id] = a;
    return m;
  }, [artifacts]);

  const { teams, advice } = useMemo(() => {
    const scores = rosterBuildScores(entries, artifacts);
    const rec = recommendAbyss(scores);
    return {
      teams: rec.teams,
      advice: advise(rec.gaps, entries, scores) as Advice[],
    };
  }, [entries, artifacts, advise]);

  // A plan is a solve over one specific roster + inventory. Re-importing
  // replaces both, so the eight cards on screen describe gear the user no
  // longer has. Reset during render, the way Results.tsx resets its share
  // cues — React re-runs this pass before painting the stale plan.
  const [planInputs, setPlanInputs] = useState({ entries, artifacts });
  if (planInputs.entries !== entries || planInputs.artifacts !== artifacts) {
    setPlanInputs({ entries, artifacts });
    setPlan(null);
    setFailed(false);
    setProgress(null);
  }
  // Layout, not passive: layout effects run inside the commit, so the token
  // is already bumped by the time an awaited solve's continuation — a
  // microtask, which cannot run until the stack empties — gets to check it.
  useLayoutEffect(() => {
    planToken.current++;
  }, [planInputs]);

  async function build() {
    // The button is aria-disabled rather than disabled so it keeps focus
    // across the run; the guard has to be here.
    if (!teams || running) return;
    const token = ++planToken.current;
    setFailed(false);
    setProgress([0, 8]);
    try {
      const p = await composePlan(
        teams,
        entries,
        artifacts,
        runOptimize,
        (d, t) => {
          if (planToken.current === token) setProgress([d, t]);
        },
      );
      if (planToken.current !== token) return; // superseded
      setPlan(p);
    } catch (err) {
      if (planToken.current !== token) return;
      console.error('Plan failed', err);
      setFailed(true);
    } finally {
      if (planToken.current === token) setProgress(null);
    }
  }

  const running = progress !== null;

  return (
    <div className="space-y-4">
      <div className="panel panel-md flex flex-wrap items-center justify-between gap-3">
        {/* The Section hint above already says "an optimised build for all
            eight members, plus one farming list"; this line only adds the
            part it doesn't — who gets first pick of the shared bag. */}
        <p className="text-sm text-muted">
          {teams
            ? 'The carries get first pick of the shared inventory.'
            : 'Import a GOOD file — the plan needs a roster to pick teams from.'}
        </p>
        <button
          type="button"
          className={cn('btn-primary', running && 'animate-pulse-glow')}
          aria-busy={running}
          aria-disabled={!teams || running}
          onClick={() => void build()}
        >
          {running
            ? `Optimising ${progress[0]}/${progress[1]}…`
            : 'Build my Abyss plan'}
        </button>
      </div>

      {running && (
        <div role="status" aria-live="polite" className="space-y-1">
          <p className="text-xs text-muted">
            Optimising member {progress[0]} of {progress[1]}…
          </p>
          <div
            aria-hidden="true"
            className="h-1.5 overflow-hidden rounded-full bg-white/5"
          >
            <div
              className="h-full rounded-full bg-accent/70 transition-[width]"
              style={{ width: `${(progress[0] / progress[1]) * 100}%` }}
            />
          </div>
        </div>
      )}

      {failed && (
        <Callout tone="error" role="alert">
          Building the plan failed — please try again.
        </Callout>
      )}

      {plan && (
        // While the next plan is solving, the eight cards on screen are the
        // previous one. Dim them and mark the region busy so the old numbers
        // aren't read as the new ones.
        <div
          aria-busy={running}
          className={cn(
            'space-y-4 transition-opacity',
            running && 'opacity-40',
          )}
        >
          {plan.teams.map((team, i) => {
            const members = new Set(team.members.map((m) => m.characterKey));
            return (
              <section key={team.archetypeId} className="space-y-3">
                <h3 className="font-display text-base font-bold text-paper">
                  {i === 0 ? 'First half' : 'Second half'} —{' '}
                  {archetypeName(team.archetypeId)}
                </h3>
                {plan.builds
                  .filter((b) => members.has(b.characterKey))
                  .map((b) => (
                    <MemberCard
                      key={b.characterKey}
                      {...b}
                      weaponKey={entries[b.characterKey]?.weaponKey ?? ''}
                      buildLevel={entries[b.characterKey]?.buildLevel ?? 90}
                      artifactsById={artifactsById}
                    />
                  ))}
              </section>
            );
          })}

          {advice.length > 0 && (
            <div className="panel panel-md space-y-2">
              <h3 className="font-display text-base font-bold text-paper">
                Worth investing in
              </h3>
              <ul className="space-y-2 text-sm">
                {advice.map((a) => (
                  <li
                    key={`${a.kind}:${a.subjectKey}:${a.provenance}`}
                    data-testid="advice"
                  >
                    <p className="text-paper">{a.headline}</p>
                    <p className="text-xs text-muted">{a.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {plan.farming.length > 0 && (
            <div className="panel panel-md space-y-2">
              <h3 className="font-display text-base font-bold text-paper">
                What to farm
              </h3>
              <ul className="space-y-1 text-sm text-paper/90">
                {plan.farming.map((line, i) => (
                  <li key={i}>• {line}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
