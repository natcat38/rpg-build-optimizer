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
import { BuildCard } from '../components/BuildCard';
import { optimize } from '../workers/optimizeClient';
import { composePlan, type Plan, type RunOptimize } from './composePlan';
import type { Artifact, OptimizeRequest } from '../game/types';

function MemberCard({
  characterKey,
  objective,
  result,
  conflicts,
  weaponKey,
  buildLevel,
  artifacts,
}: Plan['builds'][number] & {
  weaponKey: string;
  buildLevel: OptimizeRequest['buildLevel'];
  artifacts: Artifact[];
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
      <h3 className="font-display text-sm font-bold text-paper">{name}</h3>
      {result.status === 'ok' ? (
        <BuildCard
          build={result.builds[0]}
          request={request}
          artifacts={artifacts}
        />
      ) : (
        <p className="panel text-sm text-muted">
          No build could be formed for {name} from what&apos;s left of your
          inventory under their meta recipe.
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
}: {
  /** Injected in tests; the app runs the real worker client. */
  runOptimize?: RunOptimize;
}) {
  const entries = useRoster((s) => s.entries);
  const artifacts = useInventory((s) => s.artifacts);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [progress, setProgress] = useState<[number, number] | null>(null);
  const [failed, setFailed] = useState(false);

  const teams = useMemo(() => {
    const byLocation: Record<string, Artifact[]> = {};
    for (const a of artifacts)
      if (a.location) (byLocation[a.location] ??= []).push(a);
    const scores: Record<string, number> = {};
    for (const [key, entry] of Object.entries(entries))
      scores[key] = computeBuildScore(entry, byLocation[key] ?? []).total;
    return recommendAbyss(scores).teams;
  }, [entries, artifacts]);

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
          disabled={!teams || running}
          onClick={() => void build()}
        >
          {running
            ? `Optimising ${progress[0]}/${progress[1]}…`
            : 'Build my Abyss plan'}
        </button>
      </div>

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
                <h2 className="font-display text-base font-bold text-paper">
                  {i === 0 ? 'First half' : 'Second half'} —{' '}
                  {arch?.name ?? team.archetypeId}
                </h2>
                {plan.builds
                  .filter((b) => members.has(b.characterKey))
                  .map((b) => (
                    <MemberCard
                      key={b.characterKey}
                      {...b}
                      weaponKey={entries[b.characterKey]?.weaponKey ?? ''}
                      buildLevel={entries[b.characterKey]?.buildLevel ?? 90}
                      artifacts={artifacts}
                    />
                  ))}
              </section>
            );
          })}

          {plan.farming.length > 0 && (
            <div className="panel space-y-2">
              <h2 className="font-display text-base font-bold text-paper">
                What to farm
              </h2>
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
