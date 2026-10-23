/**
 * The React presentational layer: import/artifact-entry panels, the
 * optimizer and gap-analysis results views, and the AI-explain
 * panel, wired together by the top-level `App` component.
 * @packageDocumentation
 */

import {
  lazy,
  Suspense,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ImportPanel } from './ImportPanel';
import { ArtifactForm } from './ArtifactForm';
import { OptimizePanel } from './OptimizePanel';
import { Results } from './Results';
import { SampleGear } from './SampleGear';
import { GapSection } from './GapSection';
import { LockGlyph } from './ui/Glyphs';
import { decodeBuild } from '../share/url';
import { useInventory } from '../state/inventory';
import { useRoster } from '../state/roster';
import {
  useOptimizeRequest,
  isDefaultSelection,
} from '../state/optimizeRequest';
import { bestBuiltCharacter } from '../roster/buildScore';
import { PATCH } from '../game/genshin/adapter';
import { useOptimizeRun } from '../hooks/useOptimizeRun';
import { buildHeroExample, type HeroExample } from '../sample/heroExample';
import { centerInScroller, scrollToId } from '../ui/scroll';
import { useMediaQuery } from '../ui/useMediaQuery';
import { Callout } from './ui/Callout';
import { Disclosure } from './ui/Disclosure';
import { cn } from './ui/cn';
import type { Artifact, OptimizeRequest, OptimizeResult } from '../game/types';
import { Section, ThesisHero, SolvedHero, SharedBuildBanner } from './landing';
import { STEPS, LOCKED_HINT } from './landingSteps';
import { useScrollSpy } from './useScrollSpy';

// Not needed for first paint — App renders these only once a roster exists,
// well after the initial view has settled — so each is its own chunk rather
// than bundled into the main one.
const RosterView = lazy(() =>
  import('../roster/RosterView').then((m) => ({ default: m.RosterView })),
);
const TeamsView = lazy(() =>
  import('../teams/TeamsView').then((m) => ({ default: m.TeamsView })),
);
const PlanView = lazy(() =>
  import('../plan/PlanView').then((m) => ({ default: m.PlanView })),
);

/** Minimal fallback for a lazy feature panel — a line of text, not a skeleton,
 *  since these panels only mount well after first paint (behind `hasRoster`). */
function PanelFallback() {
  return <p className="text-sm text-muted">Loading…</p>;
}

// Display-only vocabulary for the one game this app supports. Re-introduce a
// per-game registry only if a second game is actually built (ADR-0012).
const GAME_TAGLINE =
  'Find the mathematically optimal artifact build for any character.';
const GAME_SOURCE = 'genshin-db';

/** Sections that live in the sticky left pane from `lg`. */
const LEFT_PANE = new Set(['step-load', 'step-optimise']);

/** Two-pane only: the right pane would otherwise be an empty half-screen until
 *  the first run. Hidden below `lg`, where there is no right pane. */
function ResultsPlaceholder() {
  return (
    <div className="well hidden px-5 py-8 text-sm text-muted lg:block">
      Results appear here after you run Optimise.
    </div>
  );
}

export function App() {
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

  // The hero's demo solve is independent of the user's own inventory/state and
  // reasonably cheap (~tens of ms — see heroExample.ts), so it's computed in an
  // effect (after first paint) rather than blocking initial render.
  const [hero, setHero] = useState<HeroExample | null>(null);
  // `buildHeroExample` can come back null, so "no hero" does not mean "still
  // solving": this is what tells the two apart.
  const [heroTried, setHeroTried] = useState(false);
  useEffect(() => {
    // Guarded by `heroTried` (not just omitted from deps): once computed,
    // keep showing it even if the user's inventory state changes shape
    // afterward, but still compute it the first time sampleMode turns true
    // (e.g. a returning user who starts with real gear already loaded).
    if (heroTried || !sampleMode) return;
    const id = setTimeout(() => {
      setHero(buildHeroExample());
      setHeroTried(true);
    }, 0);
    return () => clearTimeout(id);
  }, [sampleMode, heroTried]);

  // Once a roster exists the app's curated opening pair is no longer the most
  // useful one — the reader's own best-built character is. Only while the
  // selection is untouched: a pick the reader (or a shared ?b= link) made must
  // never be overwritten, which is what `isDefaultSelection` guards. The
  // weapon is not set here: `setCharacterKey` already prefers this
  // character's roster-equipped weapon, and does it through `legalWeapon`, so
  // a weapon key the frozen snapshot doesn't carry never reaches the store.
  useEffect(() => {
    const s = useOptimizeRequest.getState();
    if (!isDefaultSelection(s)) return;
    const best = bestBuiltCharacter(rosterEntries, artifacts);
    if (!best) return;
    s.setCharacterKey(best.characterKey);
  }, [rosterEntries, artifacts]);

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

  // Progress counters and the elapsed clock live in `searchProgressStore`,
  // not in this component's state: they change several times a second, and
  // held here every tick re-rendered the whole page instead of one line.
  const {
    running,
    optimizeError,
    optimizeErrorDetail,
    announcement,
    runCurrent,
    cancelCurrent,
  } = useOptimizeRun({
    // A fresh run replaces whatever Results was showing, so the banner about
    // the shared build that couldn't be read no longer describes anything.
    onRunStart: () => setSharedError(false),
    onSuccess: (r, req) => {
      setSharedArtifacts(null);
      setResult(r);
      setRequest(req);
    },
  });

  // While the demo solves, the solved hero is laid out with its numbers
  // hidden, so it keeps its height instead of growing ~270 px when they land.
  const showSolvedHero = sampleMode && (hero !== null || !heroTried);

  // Jump to Results only once the page has stopped growing. The demo hero
  // mounts a moment after first paint and adds ~270 px above everything; a
  // smooth scroll started before that is aimed at a position that no longer
  // exists, so it landed with the heading under the nav (or 270 px short on a
  // shared link). Wait for the hero, then two frames so layout has settled.
  const heroPending = sampleMode && !heroTried;
  const lastScrolled = useRef<OptimizeResult | null>(null);
  useEffect(() => {
    if (!result || result === lastScrolled.current || heroPending) return;
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => {
        lastScrolled.current = result;
        scrollToId('results-section');
      });
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [result, heroPending]);

  // The roster sections only exist once a GOOD import has produced one. Their
  // numbers are fixed anyway: a step that renumbers itself as the page grows
  // is unciteable, so 05 is always Optimise and the nav shows 02–04 locked.
  const hasRoster = Object.keys(rosterEntries).length > 0;
  const hasResults = Boolean(result && request);

  const unlocked: Record<string, boolean> = {
    'step-load': true,
    'step-roster': hasRoster,
    'step-teams': hasRoster,
    'step-plan': hasRoster,
    'step-optimise': true,
    'results-section': hasResults,
  };
  // Memoised because it is a scroll-spy effect dependency: only these two
  // booleans can change which steps exist, so a new array identity on every
  // unrelated render would rebuild the IntersectionObserver each time.
  const liveIds = useMemo(
    () =>
      STEPS.filter(
        (s) =>
          s.id === 'step-load' ||
          s.id === 'step-optimise' ||
          (s.id === 'results-section' ? hasResults : hasRoster),
      ).map((s) => s.id),
    [hasRoster, hasResults],
  );
  // From `lg` the page is two panes: Load, the sample shortcut and Optimise
  // stay in a sticky left column, so only the right pane scrolls past the
  // reader. Spying on the left pane's sections would pin the highlight there.
  const twoPane = useMediaQuery('(min-width: 1024px)');
  const spyIds = useMemo(
    () => (twoPane ? liveIds.filter((id) => !LEFT_PANE.has(id)) : liveIds),
    [twoPane, liveIds],
  );
  const activeId = useScrollSpy(spyIds);
  const lockedHintId = useId();

  // Phone only: Teams and Plan fold behind their headings (Roster starts
  // open, since it is what an import just produced). Two panes show all of it.
  const [folds, setFolds] = useState({
    'step-roster': true,
    'step-teams': false,
    'step-plan': false,
  });
  type FoldId = keyof typeof folds;
  const collapse = (id: FoldId) =>
    twoPane
      ? undefined
      : {
          open: folds[id],
          onOpenChange: (open: boolean) =>
            setFolds((f) => (f[id] === open ? f : { ...f, [id]: open })),
        };

  // A tap on a locked chip used to do nothing and say nothing; the reason
  // lived in screen-reader text only. Show it, briefly.
  const [lockedHintShown, setLockedHintShown] = useState(false);
  useEffect(() => {
    if (!lockedHintShown) return;
    const id = setTimeout(() => setLockedHintShown(false), 4000);
    return () => clearTimeout(id);
  }, [lockedHintShown]);

  // The strip scrolls sideways on a phone; keep the active chip in view.
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const nav = navRef.current;
    const chip = nav?.querySelector<HTMLElement>('[aria-current="true"]');
    if (nav && chip) centerInScroller(nav, chip);
  }, [activeId, liveIds]);

  const sampleNode = sampleMode && (
    <div id="sample-gear" className="animate-fade-up scroll-mt-20">
      <SampleGear onRun={runCurrent} running={running} />
    </div>
  );
  const loadNode = (
    <Section
      n={1}
      id="step-load"
      title="Load Your Artifacts"
      hint="Import a full inventory, fetch from a UID, or add pieces by hand."
      delay="0.05s"
    >
      <ImportPanel />
      <Disclosure
        className="mt-3"
        size="md"
        tone="flux"
        label="Or Add One Manually"
      >
        <div className="mt-3">
          <ArtifactForm />
        </div>
      </Disclosure>
    </Section>
  );
  const rosterNode = hasRoster && (
    <Section
      n={2}
      id="step-roster"
      title="Your Roster"
      hint="How built each owned character is, best first."
      delay="0.08s"
      collapse={collapse('step-roster')}
    >
      <Suspense fallback={<PanelFallback />}>
        <RosterView />
      </Suspense>
    </Section>
  );
  const teamsNode = hasRoster && (
    <Section
      n={3}
      id="step-teams"
      title="Endgame Teams"
      hint="Two Abyss halves that share no character, matched from your roster."
      delay="0.09s"
      collapse={collapse('step-teams')}
    >
      <Suspense fallback={<PanelFallback />}>
        <TeamsView />
      </Suspense>
    </Section>
  );
  const planNode = hasRoster && (
    <Section
      n={4}
      id="step-plan"
      title="Your Plan"
      hint="An optimised build for all eight members, plus one farming list."
      delay="0.1s"
      collapse={collapse('step-plan')}
    >
      <Suspense fallback={<PanelFallback />}>
        <PlanView />
      </Suspense>
    </Section>
  );
  const optimiseNode = (
    <Section
      n={5}
      id="step-optimise"
      title="Optimise"
      hint="Choose a character, weapon, and what to maximise."
      delay="0.1s"
    >
      <OptimizePanel
        onRun={runCurrent}
        running={running}
        onCancel={cancelCurrent}
      />
    </Section>
  );
  const resultsNode: ReactNode =
    result && request ? (
      <div id="results-section" className="scroll-mt-20">
        {/* Unnumbered on purpose: Results is what step 05 produces. */}
        <Section title="Results" delay="0s">
          {sharedArtifacts && <SharedBuildBanner request={request} />}
          {/* A run in flight leaves the previous numbers on screen;
            dim them and mark the region busy so they aren't read as
            the new ones. */}
          <div
            aria-busy={running}
            className={cn(
              'transition-opacity',
              running && 'pointer-events-none opacity-40',
            )}
          >
            <Results
              result={result}
              request={request}
              artifactsById={artifactsById}
              afterBest={
                <GapSection
                  result={result}
                  request={request}
                  artifacts={artifacts}
                  sharedArtifacts={sharedArtifacts}
                />
              }
              onRelax={(key, value) => {
                // "No build meets a stat floor of N" is only actionable
                // if the page can lower it, so the offer to relax is
                // wired to the store *and* to a fresh run — the reader
                // shouldn't have to press Optimise again.
                useOptimizeRequest.getState().relaxMinStat(key, value);
                void runCurrent();
              }}
            />
          </div>
        </Section>
      </div>
    ) : null;

  return (
    <div className="relative z-10 mx-auto max-w-3xl px-5 py-12 sm:py-16 lg:max-w-7xl">
      <a
        href="#content"
        className="focus-ring sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface-700 focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to Content
      </a>
      <header className="mb-6 animate-fade-up sm:mb-10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {/* Not the h1 again a line above the h1 — the eyebrow's job is to
              say what kind of thing this is. */}
          <p className="eyebrow">Exact search · proven optimal</p>
          <span className="chip">
            <span className="h-1.5 w-1.5 rounded-full bg-jade" />
            {GAME_SOURCE} · patch {PATCH}
          </span>
        </div>
        {showSolvedHero ? (
          <SolvedHero hero={hero} />
        ) : (
          <ThesisHero tagline={GAME_TAGLINE} />
        )}
      </header>

      <main>
        {/* Shown from the first visit, not gated on a roster: a visitor who
          never imports still has two sections to move between, and the locked
          chips are how the page explains what importing unlocks. */}
        {liveIds.length >= 2 && (
          <div className="sticky top-0 z-20 -mx-5 mb-6">
            <nav
              ref={navRef}
              aria-label="Steps"
              className="relative flex snap-x scroll-px-5 gap-2 overflow-x-auto border-b border-white/5 bg-surface-800/80 px-5 py-2 backdrop-blur-md [mask-image:linear-gradient(to_right,transparent,black_12px,black_calc(100%-12px),transparent)]"
            >
              {STEPS.map((s) => {
                if (!unlocked[s.id]) {
                  // Only the numbered steps ghost: they're what an import
                  // unlocks. Results isn't a step you can reach, so it simply
                  // isn't there until a run produces one.
                  if (!s.n) return null;
                  // A real button, not a styled span: `aria-disabled` on a <span>
                  // announces nothing useful, and the hint lived in `title` —
                  // unreachable by keyboard and invisible to a screen reader.
                  // `aria-disabled` + an early return rather than `disabled`: a
                  // button that goes disabled while it is the active element
                  // hands focus to <body>. Solid muted text rather than
                  // opacity-40, which took the label below 4.5:1 against the nav.
                  return (
                    <button
                      key={s.id}
                      type="button"
                      aria-disabled="true"
                      aria-describedby={lockedHintId}
                      onClick={(e) => {
                        e.preventDefault();
                        setLockedHintShown(true);
                      }}
                      className="chip touch-target hidden flex-none cursor-not-allowed snap-start items-center whitespace-nowrap border-white/5 text-muted sm:inline-flex"
                    >
                      <LockGlyph />
                      <span className="font-mono">{s.n}</span>
                      {s.label}
                    </button>
                  );
                }
                const current = activeId === s.id;
                return (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    aria-current={current ? 'true' : undefined}
                    onClick={() => {
                      // A folded section would otherwise be a jump to a heading
                      // with nothing under it.
                      if (s.id in folds) {
                        setFolds((f) => ({ ...f, [s.id as FoldId]: true }));
                      }
                    }}
                    className={cn(
                      'chip touch-target flex-none snap-start items-center whitespace-nowrap transition-colors hover:border-accent/40 hover:text-paper',
                      current && 'border-accent/60 bg-accent/10 text-paper',
                    )}
                  >
                    {s.n && (
                      <span className="font-mono text-accent-bright">
                        {s.n}
                      </span>
                    )}
                    {s.label}
                  </a>
                );
              })}
              {/* The right-edge mask fades the last chip; this spacer is what it
              fades, so chip 6 doesn't look cut off at the scroll end. */}
              <span aria-hidden="true" className="w-3 flex-none snap-end" />
              {/* One hint, referenced by every locked chip. */}
              <span id={lockedHintId} className="sr-only">
                {LOCKED_HINT}
              </span>
            </nav>
            {lockedHintShown && (
              <p
                aria-hidden="true"
                className="absolute left-5 top-full mt-2 rounded-lg border border-white/10 bg-surface-700 px-3 py-2 text-xs text-paper shadow-panel"
              >
                {LOCKED_HINT}
              </p>
            )}
          </div>
        )}

        <div id="content" tabIndex={-1}>
          {/* One persistent live region for the whole page. A region mounted in
            the same commit as its text is not yet observed, so nothing is
            announced — hence this, and hence the Callouts below carry no
            role of their own. */}
          <p className="sr-only" role="status">
            {announcement && (
              <span key={announcement.nonce}>{announcement.text}</span>
            )}
          </p>
          <p className="sr-only" role="alert">
            {sharedError
              ? 'This shared build couldn’t be read.'
              : optimizeError
                ? 'Optimisation failed.'
                : ''}
          </p>

          {sharedError && (
            <Callout
              tone="error"
              className="mb-8 flex animate-fade-up flex-wrap items-center justify-between gap-3"
            >
              <span>
                This shared build couldn’t be read — it may be from a newer
                version.
              </span>
              <button
                type="button"
                className="btn-ghost flex-none"
                onClick={() => {
                  setSharedError(false);
                  window.history.pushState({}, '', '/');
                }}
              >
                Start Fresh
              </button>
            </Callout>
          )}

          {optimizeError && (
            <Callout
              tone="error"
              className="mb-8 flex animate-fade-up flex-wrap items-center justify-between gap-3"
            >
              <span>
                Optimisation failed
                {optimizeErrorDetail ? ` — ${optimizeErrorDetail}` : ''}.
              </span>
              <button
                type="button"
                className="btn-ghost flex-none"
                onClick={() => void runCurrent()}
              >
                Retry
              </button>
            </Callout>
          )}

          <div
            className={cn(
              'space-y-10',
              'lg:grid lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] lg:items-start lg:gap-x-8 lg:space-y-0',
            )}
          >
            {twoPane ? (
              <>
                {/* Sticky, and scrolls on its own when it is taller than the
                    screen (Load plus Optimise is). The -m-1/p-1 pair keeps
                    focus rings from being clipped by that scroll box. */}
                <div className="sticky top-[4.5rem] -m-1 max-h-[calc(100dvh-5.5rem)] space-y-10 overflow-y-auto p-1">
                  {sampleNode}
                  {loadNode}
                  {optimiseNode}
                </div>
                <div className="min-w-0 space-y-10">
                  {resultsNode ?? (!hasRoster && <ResultsPlaceholder />)}
                  {rosterNode}
                  {teamsNode}
                  {planNode}
                </div>
              </>
            ) : (
              <>
                {sampleNode}
                {loadNode}
                {rosterNode}
                {teamsNode}
                {planNode}
                {optimiseNode}
                {resultsNode}
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-16 border-t border-white/5 pt-6 text-center text-xs text-muted">
        Built with branch-and-bound optimization in a Web Worker · Data from{' '}
        {GAME_SOURCE} (patch {PATCH}) · Not affiliated with the game’s
        publisher.
      </footer>
    </div>
  );
}
