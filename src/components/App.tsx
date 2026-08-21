/**
 * The React presentational layer: import/artifact-entry panels, the
 * optimizer and gap-analysis results views, and the AI-explain
 * panel, wired together by the top-level `App` component.
 * @packageDocumentation
 */

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ImportPanel } from './ImportPanel';
import { ArtifactForm } from './ArtifactForm';
import { OptimizePanel } from './OptimizePanel';
import { Results } from './Results';
import { SampleGear } from './SampleGear';
import { GapSection } from './GapSection';
import { RosterView } from '../roster/RosterView';
import { TeamsView } from '../teams/TeamsView';
import { PlanView } from '../plan/PlanView';
import { decodeBuild } from '../share/url';
import { useInventory } from '../state/inventory';
import { useRoster } from '../state/roster';
import { useOptimizeRequest, currentRequest } from '../state/optimizeRequest';
import { getGame, type GameDescriptor } from '../game/registry';
import { optimize } from '../workers/optimizeClient';
import { buildHeroExample, type HeroExample } from '../sample/heroExample';
import { formatReduction } from '../optimizer/benchmark';
import { scrollToId } from '../ui/scroll';
import { formatScore, objectiveHint } from '../labels';
import type { Artifact, OptimizeRequest, OptimizeResult } from '../game/types';

function Section({
  n,
  id,
  title,
  hint,
  delay,
  children,
}: {
  n: number;
  id?: string;
  title: string;
  hint?: string;
  delay: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-20 animate-fade-up"
      style={{ animationDelay: delay }}
    >
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

/** Thesis-only hero: shown while the solved demo is computing, or once the user
 *  has their own gear loaded. */
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
  const reductionLabel = formatReduction(
    hero.explored > 0 ? hero.naive / hero.explored : 0,
  );
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
            {formatScore(hero.build.objectiveValue, 1)}
          </p>
          <p className="mt-1 max-w-xs text-[0.7rem] text-muted">
            {objectiveHint('crit_value')}
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

/** Step chips for the sticky nav — ids match the Section ids below. */
const STEPS: [id: string, n: string, label: string][] = [
  ['step-load', '01', 'Load'],
  ['step-roster', '02', 'Roster'],
  ['step-teams', '03', 'Teams'],
  ['step-plan', '04', 'Plan'],
  ['step-optimise', '05', 'Optimise'],
];

export function App() {
  const game = getGame('genshin');

  const artifacts = useInventory((s) => s.artifacts);
  const rosterEntries = useRoster((s) => s.entries);
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
    // Guarded by `hero` itself (not just omitted from deps): once computed,
    // keep showing it even if the user's inventory state changes shape
    // afterward, but still compute it the first time sampleMode turns true
    // (e.g. a returning user who starts with real gear already loaded).
    if (hero || !sampleMode) return;
    const id = setTimeout(() => setHero(buildHeroExample()), 0);
    return () => clearTimeout(id);
  }, [sampleMode, hero]);

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
    // A fresh run replaces whatever Results was showing, so the banner about
    // the shared build that couldn't be read no longer describes anything.
    setSharedError(false);
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
      scrollToId('results-section');
    }
  }, [result]);

  const showSolvedHero = sampleMode && hero;

  // The roster section only exists once a GOOD import has produced one, so the
  // later sections' numbers shift with it.
  const hasRoster = Object.keys(rosterEntries).length > 0;
  const optimiseN = hasRoster ? 5 : 2;

  return (
    <main className="relative z-10 mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface-700 focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>
      <header className="mb-10 animate-fade-up">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="eyebrow">RPG Build Optimizer</p>
          <span className="chip">
            <span className="h-1.5 w-1.5 rounded-full bg-jade" />
            {game.source} · patch {game.patch}
          </span>
        </div>
        {showSolvedHero ? (
          <SolvedHero hero={hero} />
        ) : (
          <ThesisHero game={game} />
        )}
      </header>

      {hasRoster && (
        <nav
          aria-label="Steps"
          className="sticky top-0 z-20 -mx-5 mb-6 flex gap-1 overflow-x-auto border-b border-white/5 bg-surface-800/80 px-5 py-2 backdrop-blur-md [mask-image:linear-gradient(to_right,transparent,black_12px,black_calc(100%-12px),transparent)]"
        >
          {STEPS.map(([id, n, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className="chip min-h-11 items-center whitespace-nowrap hover:border-accent/40 hover:text-paper"
            >
              <span className="font-mono text-accent-bright">{n}</span> {label}
            </a>
          ))}
        </nav>
      )}

      <div id="content" tabIndex={-1}>
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
            id="step-load"
            title="Load your artifacts"
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

          {hasRoster && (
            <Section
              n={2}
              id="step-roster"
              title="Your roster"
              hint="How built each owned character is, best first."
              delay="0.08s"
            >
              <RosterView />
            </Section>
          )}

          {hasRoster && (
            <Section
              n={3}
              id="step-teams"
              title="Endgame teams"
              hint="Two Abyss halves that share no character, matched from your roster."
              delay="0.09s"
            >
              <TeamsView />
            </Section>
          )}

          {hasRoster && (
            <Section
              n={4}
              id="step-plan"
              title="Your plan"
              hint="An optimised build for all eight members, plus one farming list."
              delay="0.1s"
            >
              <PlanView />
            </Section>
          )}

          <Section
            n={optimiseN}
            id="step-optimise"
            title="Optimise"
            hint="Choose a character, weapon, and what to maximise."
            delay="0.1s"
          >
            <OptimizePanel onRun={runCurrent} running={running} />
          </Section>

          {result && request && (
            <div id="results-section">
              <Section n={optimiseN + 1} title="Results" delay="0s">
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
      </div>

      <footer className="mt-16 border-t border-white/5 pt-6 text-center text-xs text-muted/70">
        Built with branch-and-bound optimization in a Web Worker · Data from{' '}
        {game.source} (patch {game.patch}) · Not affiliated with the game&apos;s
        publisher.
      </footer>
    </main>
  );
}
