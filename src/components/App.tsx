import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ImportPanel } from './ImportPanel';
import { ArtifactForm } from './ArtifactForm';
import { OptimizePanel } from './OptimizePanel';
import { Results } from './Results';
import { SampleGear } from './SampleGear';
import { GapSection } from './GapSection';
import { RosterDashboard } from './RosterDashboard';
import { CharacterDetail } from './CharacterDetail';
import { decodeBuild } from '../share/url';
import { useInventory } from '../state/inventory';
import { useRoster } from '../state/roster';
import { useWeaponInventory } from '../state/weapons';
import { useOptimizeRequest, currentRequest } from '../state/optimizeRequest';
import { useBuildCache, isFreshBuild } from '../state/buildCache';
import { GUIDES, buildMetaRequest } from '../meta/guides';
import { GAME } from '../game/registry';
import { optimize } from '../workers/optimizeClient';
import { buildHeroExample, type HeroExample } from '../sample/heroExample';
import { formatReduction } from '../optimizer/benchmark';
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

/** Thesis-only hero: shown while the solved demo is computing, or once the
 *  user has their own gear loaded. */
function ThesisHero() {
  return (
    <>
      <h1 className="font-display text-4xl font-black leading-tight text-paper sm:text-5xl">
        RPG Build Optimizer
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
        Find the mathematically optimal artifact build for any character. Exact
        branch-and-bound search over your inventory — computed entirely in your
        browser, no account required.
      </p>
    </>
  );
}

/** The hero leads with a real solve, not an empty form: one genuine build from
 *  a seeded synthetic inventory (see src/sample/heroExample.ts), plus the exact
 *  search proof — the thing this tool actually does. */
function SolvedHero({ hero }: { hero: HeroExample }) {
  const reductionLabel = formatReduction(
    hero.naive / Math.max(hero.explored, 1),
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

export function App() {
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

  const rosterEntries = useRoster((s) => s.entries);
  const hasRoster = Object.keys(rosterEntries).length > 0;
  const [selectedCharacterKey, setSelectedCharacterKey] = useState<
    string | null
  >(null);

  // Dedup guard: writing window.location.hash below re-enters via the
  // hashchange listener with the same key — this ref lets that re-entrant
  // call short-circuit instead of re-running the auto-solve.
  const lastAppliedKey = useRef<string | null>(null);

  function selectCharacter(key: string) {
    if (lastAppliedKey.current === key) return;
    lastAppliedKey.current = key;

    // Read every store fresh via .getState() rather than closing over this
    // render's hook-subscribed values: the hash-route effect below registers
    // this function once (via syncFromHash) with an empty deps array, so a
    // later popstate/hashchange invocation would otherwise run against
    // whatever roster/weapons/artifacts existed at mount time.
    const optReq = useOptimizeRequest.getState();
    const currentRosterEntries = useRoster.getState().entries;
    const currentOwnedWeapons = useWeaponInventory.getState().weapons;
    const currentArtifacts = useInventory.getState().artifacts;
    const entry = currentRosterEntries[key];
    const meta = GUIDES[key]?.build;
    const metaReq = meta
      ? buildMetaRequest(key, meta, entry, currentOwnedWeapons)
      : null;

    setSelectedCharacterKey(key);
    window.location.hash = `#/c/${key}`;

    if (metaReq) {
      // Same "Use meta build" pipeline the manual button applies — the
      // artifact build just runs automatically instead of waiting for a click.
      optReq.applyPreset({
        characterKey: key,
        weaponKey: metaReq.weaponKey,
        objective: metaReq.objective,
        constraints: metaReq.constraints,
      });
      optReq.setBuildLevel(metaReq.buildLevel);

      const cached = useBuildCache.getState().builds[key];
      if (
        isFreshBuild(
          cached,
          metaReq,
          currentArtifacts,
          currentOwnedWeapons,
          currentRosterEntries,
        )
      ) {
        setResult(cached.result);
        setRequest(cached.request);
      } else {
        setResult(null);
        setRequest(null);
        void runCurrent(key);
      }
      return;
    }

    // No meta guide (or no owned/equipped weapon to run with) — pre-fill only,
    // same spirit as OptimizePanel's own onCharacterChange pre-fill (ADR-0015).
    optReq.setCharacterKey(key);
    if (entry?.weaponKey) optReq.setWeaponKey(entry.weaponKey);
    if (entry?.buildLevel) optReq.setBuildLevel(entry.buildLevel);
    setResult(null);
    setRequest(null);
  }

  function goBack() {
    lastAppliedKey.current = null;
    setSelectedCharacterKey(null);
    if (window.location.hash) window.location.hash = '';
  }

  // Hash route: restore the selected character on load/back-forward, so a
  // refresh or shared link keeps the guide page open (no router dependency).
  useEffect(() => {
    function syncFromHash() {
      const match = /^#\/c\/(.+)$/.exec(window.location.hash);
      if (match) selectCharacter(decodeURIComponent(match[1]));
      else if (lastAppliedKey.current !== null) goBack();
    }
    syncFromHash();
    window.addEventListener('popstate', syncFromHash);
    window.addEventListener('hashchange', syncFromHash);
    return () => {
      window.removeEventListener('popstate', syncFromHash);
      window.removeEventListener('hashchange', syncFromHash);
    };
    // Only wire the listeners once; syncFromHash/selectCharacter read fresh
    // store state themselves, so they don't need to be reactive dependencies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    setHero(buildHeroExample());
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

  /** `cacheKey` is passed only by the curated-character auto-run path
   *  (`selectCharacter`) — manual "Optimise"/"Use meta build" clicks call
   *  this with no argument and never write the shared build cache. */
  async function runCurrent(cacheKey?: string) {
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
      if (cacheKey) {
        useBuildCache.getState().setBuild(cacheKey, {
          request: req,
          result: r,
          artifacts: inv,
          ownedWeapons: useWeaponInventory.getState().weapons,
          rosterEntries: useRoster.getState().entries,
        });
      }
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

  const showSolvedHero = sampleMode && hero;

  return (
    <div className="relative z-10 mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <header className="mb-10 animate-fade-up">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="eyebrow">RPG Build Optimizer</p>
          <span className="chip">
            <span className="h-1.5 w-1.5 rounded-full bg-jade" />
            {GAME.source} · patch {GAME.patch}
          </span>
        </div>
        {showSolvedHero ? <SolvedHero hero={hero} /> : <ThesisHero />}
      </header>

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
          title="Load your artifacts"
          hint="Import a full inventory, fetch from a UID, or add pieces by hand."
          delay="0.05s"
        >
          <ImportPanel />
          <details className="group mt-3">
            <summary className="inline-flex cursor-pointer select-none items-center gap-2 text-sm font-medium text-flux-bright transition hover:text-flux">
              <span className="text-xs transition group-open:rotate-90">▶</span>
              Or add one manually
            </summary>
            <div className="mt-3">
              <ArtifactForm />
            </div>
          </details>
        </Section>

        {hasRoster && !sharedArtifacts ? (
          selectedCharacterKey ? (
            <Section n={2} title="Character" delay="0.1s">
              <CharacterDetail
                characterKey={selectedCharacterKey}
                onBack={goBack}
                onRun={runCurrent}
                running={running}
                result={result}
                request={request}
                artifacts={artifacts}
                artifactsById={artifactsById}
                sharedArtifacts={sharedArtifacts}
              />
            </Section>
          ) : (
            <Section
              n={2}
              title="Your roster"
              hint="Pick a character to see build, weapon, talent, and team advice."
              delay="0.1s"
            >
              <RosterDashboard onSelect={selectCharacter} />
            </Section>
          )
        ) : (
          <>
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
          </>
        )}
      </div>

      <footer className="mt-16 border-t border-white/5 pt-6 text-center text-xs text-muted/70">
        Built with branch-and-bound optimization in a Web Worker · Data from{' '}
        {GAME.source} (patch {GAME.patch}) · Not affiliated with the game&apos;s
        publisher.
      </footer>
    </div>
  );
}
