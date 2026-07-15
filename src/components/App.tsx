import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ImportPanel } from './ImportPanel';
import { ArtifactForm } from './ArtifactForm';
import { OptimizePanel } from './OptimizePanel';
import { Results } from './Results';
import { SampleGear } from './SampleGear';
import { GapSection } from './GapSection';
import { GameSwitcher } from './GameSwitcher';
import { decodeBuild } from '../share/url';
import { useInventory } from '../state/inventory';
import { useOptimizeRequest, currentRequest } from '../state/optimizeRequest';
import { useGame } from '../state/game';
import { GAMES, type GameDescriptor } from '../game/registry';
import { optimize } from '../workers/optimizeClient';
import { buildHeroExample, type HeroExample } from '../sample/heroExample';
import type { Artifact, OptimizeRequest, OptimizeResult } from '../game/types';

function Section({
  n,
  title,
  hint,
  delay,
  children,
}: {
  n: number;
  title: string;
  hint?: string;
  delay: string;
  children: ReactNode;
}) {
  return (
    <section className="animate-fade-up" style={{ animationDelay: delay }}>
      <div className="mb-3 flex items-center gap-3">
        <span className="section-badge">{String(n).padStart(2, '0')}</span>
        <div>
          <h2 className="font-display text-lg font-bold tracking-wide text-paper">
            {title}
          </h2>
          {hint && <p className="text-xs text-muted">{hint}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

/** Thesis-only hero: shown while the solved demo is computing, once the user
 *  has their own gear loaded, or for a coming-soon game with nothing to solve yet. */
function ThesisHero({ game }: { game: GameDescriptor }) {
  return (
    <>
      <h1 className="font-display text-4xl font-black leading-tight text-paper sm:text-5xl">
        RPG Build Optimizer
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
        {game.tagline} Exact branch-and-bound search over your inventory —
        computed entirely in your browser, no account required.
      </p>
    </>
  );
}

/** The hero leads with a real solve, not an empty form: one genuine build from
 *  a seeded synthetic inventory (see src/sample/heroExample.ts), plus the exact
 *  search proof — the thing this tool actually does. */
function SolvedHero({ hero }: { hero: HeroExample }) {
  const reduction = hero.naive / Math.max(hero.explored, 1);
  const reductionLabel =
    reduction < 10
      ? `${reduction.toFixed(1)}×`
      : `${Math.round(reduction).toLocaleString()}×`;
  return (
    <>
      <h1 className="font-display text-4xl font-black leading-tight text-paper sm:text-5xl">
        RPG Build Optimizer
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
        Find the mathematically optimal gear build for any character. Exact
        branch-and-bound search over your inventory — computed entirely in your
        browser, no account required.
      </p>
      <div className="mt-6 flex flex-wrap items-end gap-x-8 gap-y-4">
        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.18em] text-muted">
            Crit Value, one real solve
          </p>
          <p className="font-mono text-5xl font-bold leading-none text-accent-bright">
            {hero.build.objectiveValue.toFixed(1)}
          </p>
        </div>
        <p className="max-w-sm font-mono text-xs leading-relaxed text-muted">
          Searched{' '}
          <span className="text-paper">{hero.naive.toLocaleString()}</span>{' '}
          possible builds · evaluated{' '}
          <span className="text-paper">{hero.explored.toLocaleString()}</span> ·
          pruned{' '}
          <span className="text-paper">{hero.pruned.toLocaleString()}</span> ·
          proven optimal in {reductionLabel} fewer evaluations.
        </p>
      </div>
    </>
  );
}

function ComingSoon({ game }: { game: GameDescriptor }) {
  return (
    <div className="panel animate-fade-up space-y-2 text-center">
      <p className="eyebrow">{game.name}</p>
      <h2 className="font-display text-xl font-bold text-paper">
        Support is in the works
      </h2>
      <p className="mx-auto max-w-md text-sm text-muted">
        The {game.gearNounPlural.toLowerCase()} and {game.setNoun.toLowerCase()}{' '}
        model for {game.name} isn&apos;t wired up to the solver yet. Switch back
        to Genshin Impact to run a real optimisation today.
      </p>
    </div>
  );
}

export function App() {
  const gameId = useGame((s) => s.gameId);
  const game = GAMES[gameId];

  const artifacts = useInventory((s) => s.artifacts);
  const sampleMode =
    artifacts.length === 0 ||
    artifacts.every((a) => a.id.startsWith('sample-'));
  const [result, setResult] = useState<OptimizeResult | null>(null);
  const [request, setRequest] = useState<OptimizeRequest | null>(null);
  const [sharedArtifacts, setSharedArtifacts] = useState<Artifact[] | null>(
    null,
  );
  const [sharedError, setSharedError] = useState(false);
  const [optimizeError, setOptimizeError] = useState(false);

  // The hero's demo solve is independent of the user's own inventory/state and
  // reasonably cheap (~tens of ms — see heroExample.ts), so it's computed in an
  // effect (after first paint) rather than blocking initial render.
  const [hero, setHero] = useState<HeroExample | null>(null);
  useEffect(() => {
    if (game.availability !== 'live' || !sampleMode) return;
    setHero(buildHeroExample());
    // sampleMode intentionally excluded: once computed, keep showing it even
    // if the user's inventory state changes shape afterward.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.availability]);

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('b');
    if (!param) return;
    let cancelled = false;
    // decodeBuild never rejects (its own try/catch resolves { error } instead),
    // so this fire-and-forget is by design, not a missed rejection handler.
    void decodeBuild(param).then((out) => {
      if (cancelled) return;
      if ('error' in out) {
        setSharedError(true);
        return;
      }
      setRequest(out.request);
      setResult({ status: 'ok', builds: [out.build], explored: 0, pruned: 0 });
      setSharedArtifacts(out.artifacts);
      // Hydrate the Optimise panel's own store too, not just the read-only
      // Results view — otherwise it keeps showing its default character/weapon
      // (decoupled from the shared build) even though Results correctly shows
      // the shared one.
      const optReq = useOptimizeRequest.getState();
      optReq.applyPreset({
        characterKey: out.request.characterKey,
        weaponKey: out.request.weaponKey,
        objective: out.request.objective,
        constraints: out.request.constraints,
      });
      optReq.setBuildLevel(out.request.buildLevel);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Resolve artifacts for Results: a shared build carries its own five artifacts;
  // a freshly-optimised build resolves ids against the current inventory.
  const artifactsById = useMemo(() => {
    const src = sharedArtifacts ?? artifacts;
    const m: Record<string, Artifact> = {};
    for (const a of src) m[a.id] = a;
    return m;
  }, [sharedArtifacts, artifacts]);

  const [running, setRunning] = useState(false);

  // Guards against a stale run's result clobbering a newer one: OptimizePanel
  // and SampleGear share `running` (below) so their controls disable
  // together, but a same-tick double-trigger can still start two runs before
  // either's disable reaches the DOM — this token makes only the most
  // recently started run allowed to commit its outcome or clear `running`.
  const runToken = useRef(0);

  async function runCurrent() {
    const req = currentRequest(useOptimizeRequest.getState());
    const inv = useInventory.getState().artifacts;
    if (inv.length === 0 || !req.characterKey) return;
    const token = ++runToken.current;
    setRunning(true);
    setOptimizeError(false);
    try {
      const r = await optimize(req, inv);
      if (runToken.current !== token) return; // superseded by a newer run
      setSharedArtifacts(null);
      setResult(r);
      setRequest(req);
    } catch (err) {
      if (runToken.current !== token) return;
      // A worker/protocol rejection (or bad game data) must not vanish
      // silently — surface it instead of dropping back to idle with no cue.
      console.error('Optimize failed', err);
      setOptimizeError(true);
    } finally {
      if (runToken.current === token) setRunning(false);
    }
  }

  const lastScrolled = useRef<OptimizeResult | null>(null);
  useEffect(() => {
    if (result && result !== lastScrolled.current) {
      lastScrolled.current = result;
      document
        .getElementById('results-section')
        ?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [result]);

  const showSolvedHero = game.availability === 'live' && sampleMode && hero;

  return (
    <div className="relative z-10 mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <header className="mb-10 animate-fade-up">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="eyebrow">RPG Build Optimizer</p>
          <div className="flex flex-wrap items-center gap-3">
            {game.availability === 'live' && (
              <span className="chip">
                <span className="h-1.5 w-1.5 rounded-full bg-jade" />
                {game.source} · patch {game.patch}
              </span>
            )}
            <GameSwitcher />
          </div>
        </div>
        {showSolvedHero ? (
          <SolvedHero hero={hero} />
        ) : (
          <ThesisHero game={game} />
        )}
      </header>

      {game.availability === 'coming-soon' ? (
        <ComingSoon game={game} />
      ) : (
        <>
          {sharedError && (
            <div
              role="alert"
              className="mb-8 animate-fade-up rounded-xl border border-rose/30 bg-rose/10 px-4 py-3 text-sm text-rose"
            >
              This shared build couldn&apos;t be read — it may be from a newer
              version.
            </div>
          )}

          {optimizeError && (
            <div
              role="alert"
              className="mb-8 animate-fade-up rounded-xl border border-rose/30 bg-rose/10 px-4 py-3 text-sm text-rose"
            >
              Optimisation failed — please try again.
            </div>
          )}

          <div className="space-y-10">
            {sampleMode && (
              <div className="animate-fade-up">
                <SampleGear onRun={runCurrent} running={running} />
              </div>
            )}
            <Section
              n={1}
              title={`Load your ${game.gearNounPlural.toLowerCase()}`}
              hint="Import a full inventory, fetch from a UID, or add pieces by hand."
              delay="0.05s"
            >
              <ImportPanel />
              <details className="group mt-3">
                <summary className="inline-flex cursor-pointer select-none items-center gap-2 text-sm font-medium text-flux-bright transition hover:text-flux">
                  <span className="text-xs transition group-open:rotate-90">
                    ▶
                  </span>
                  Or add one manually
                </summary>
                <div className="mt-3">
                  <ArtifactForm />
                </div>
              </details>
            </Section>

            <Section
              n={2}
              title="Optimise"
              hint="Choose a character, weapon, and what to maximise."
              delay="0.1s"
            >
              <OptimizePanel onRun={runCurrent} running={running} />
            </Section>

            {result && request && (
              <div id="results-section">
                <Section n={3} title="Results" delay="0s">
                  <GapSection
                    result={result}
                    request={request}
                    artifacts={artifacts}
                    sharedArtifacts={sharedArtifacts}
                  />
                  <Results
                    result={result}
                    request={request}
                    artifactsById={artifactsById}
                  />
                </Section>
              </div>
            )}
          </div>
        </>
      )}

      <footer className="mt-16 border-t border-white/5 pt-6 text-center text-xs text-muted/70">
        Built with branch-and-bound optimization in a Web Worker
        {game.availability === 'live' && (
          <>
            {' '}
            · Data from {game.source} (patch {game.patch})
          </>
        )}{' '}
        · Not affiliated with the game&apos;s publisher.
      </footer>
    </div>
  );
}
