/**
 * The Plan page: recommended Abyss teams → an optimised build for each of the
 * eight members → one farming list.
 *
 * Eight exact solves are not free, so the plan only runs on an explicit click —
 * never on mount.
 */
import { useMemo, useState } from 'react';
import { useRoster } from '../state/roster';
import { useInventory } from '../state/inventory';
import { genshinAdapter } from '../game/genshin/adapter';
import { computeBuildScore } from '../roster/buildScore';
import { recommendAbyss } from '../teams/recommend';
import { COMP_ARCHETYPES } from '../teams/comps';
import { META_TARGETS } from '../meta/metaTargets';
import { BuildCard } from '../components/BuildCard';
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
  const name = genshinAdapter.character(characterKey)?.name ?? characterKey;
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
      {!META_TARGETS[characterKey] && (
        <p className="text-xs text-muted">
          No curated recipe for {name} yet — this is the highest raw Crit Value
          from the remaining pieces, ignoring set bonuses. Treat it as a
          stat-stick draft, not a real build.
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
        <p className="panel text-sm text-muted">
          Couldn&apos;t gear {name}: teammates earlier in the plan had first
          pick of the shared inventory, and the artifacts left don&apos;t meet{' '}
          {name}&apos;s recommended loadout (required set, main stats and ER).
          The notes below show which pieces went where.
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

  // Resolves each member's chosen artifact ids back to Artifact objects for
  // BuildCard — mirrors Results.tsx's artifactsFor.
  const artifactsById = useMemo(() => {
    const m: Record<string, Artifact> = {};
    for (const a of artifacts) m[a.id] = a;
    return m;
  }, [artifacts]);

  const { teams, advice } = useMemo(() => {
    const byLocation: Record<string, Artifact[]> = {};
    for (const a of artifacts)
      if (a.location) (byLocation[a.location] ??= []).push(a);
    const scores: Record<string, number> = {};
    for (const [key, entry] of Object.entries(entries))
      scores[key] = computeBuildScore(entry, byLocation[key] ?? []).total;
    const rec = recommendAbyss(scores);
    return {
      teams: rec.teams,
      advice: advise(rec.gaps, entries, scores) as Advice[],
    };
  }, [entries, artifacts, advise]);

  async function build() {
    if (!teams) return;
    setFailed(false);
    setProgress([0, 8]);
    try {
      const p = await composePlan(
        teams,
        entries,
        artifacts,
        runOptimize,
        (d, t) => setProgress([d, t]),
      );
      setPlan(p);
    } catch (err) {
      console.error('Plan failed', err);
      setFailed(true);
    } finally {
      setProgress(null);
    }
  }

  const running = progress !== null;

  return (
    <div className="space-y-4">
      <div className="panel flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {teams
            ? 'Optimises all eight members over your inventory, giving the carries first pick.'
            : 'Import a GOOD file — the plan needs a roster to pick teams from.'}
        </p>
        <button
          className={`btn-primary ${running ? 'animate-pulse-glow' : ''}`}
          aria-busy={running}
          disabled={!teams || running}
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
        <div
          role="alert"
          className="rounded-xl border border-rose/30 bg-rose/10 px-4 py-3 text-sm text-rose"
        >
          Building the plan failed — please try again.
        </div>
      )}

      {plan && (
        <>
          {plan.teams.map((team, i) => {
            const arch = COMP_ARCHETYPES.find((a) => a.id === team.archetypeId);
            const members = new Set(team.members.map((m) => m.characterKey));
            return (
              <section key={team.archetypeId} className="space-y-3">
                <h3 className="font-display text-base font-bold text-paper">
                  {i === 0 ? 'First half' : 'Second half'} —{' '}
                  {arch?.name ?? team.archetypeId}
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
            <div className="panel space-y-2">
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
            <div className="panel space-y-2">
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
        </>
      )}
    </div>
  );
}
