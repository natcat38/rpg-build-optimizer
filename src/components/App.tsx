/**
 * The React presentational layer: import/artifact-entry panels, the
 * optimizer and gap-analysis results views, and the AI-explain
 * panel, wired together by the top-level `App` component.
 * @packageDocumentation
 */

import {
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
import { RosterView } from '../roster/RosterView';
import { TeamsView } from '../teams/TeamsView';
import { PlanView } from '../plan/PlanView';
import { decodeBuild } from '../share/url';
import { useInventory } from '../state/inventory';
import { useRoster } from '../state/roster';
import {
  useOptimizeRequest,
  currentRequest,
  isDefaultSelection,
} from '../state/optimizeRequest';
import { bestBuiltCharacter } from '../roster/buildScore';
import { getGame, type GameDescriptor } from '../game/registry';
import { optimize } from '../workers/optimizeClient';
import { buildHeroExample, type HeroExample } from '../sample/heroExample';
import { genshinAdapter } from '../game/genshin/adapter';
import { scrollToId } from '../ui/scroll';
import { formatScore, objectiveHint } from '../labels';
import { Callout } from './ui/Callout';
import { cn } from './ui/cn';
import type { Artifact, OptimizeRequest, OptimizeResult } from '../game/types';

function Section({
  n,
  id,
  title,
  hint,
  delay,
  children,
}: {
  /** Omitted for Results: it's an output of the sequence, not a step in it. */
  n?: number;
  id?: string;
  title: string;
  hint?: string;
  delay: string;
  children: ReactNode;
}) {
  // A <section> is only a landmark once it has an accessible name; unnamed,
  // five of them collapsed into five identical "region" entries.
  const headingId = useId();
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="animate-fade-up scroll-mt-20"
      style={{ animationDelay: delay }}
    >
      <div className="mb-3 flex items-center gap-3">
        {n != null && (
          <span className="section-badge">{String(n).padStart(2, '0')}</span>
        )}
        <div>
          <h2
            id={headingId}
            className="font-display text-2xl font-bold tracking-tight text-paper"
          >
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
      <h1 className="font-display text-4xl font-bold leading-tight text-paper sm:text-5xl">
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
  return (
    <>
      <h1 className="font-display text-4xl font-bold leading-tight text-paper sm:text-5xl">
        RPG Build Optimizer
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
        Find the mathematically optimal gear build for any character. Exact
        branch-and-bound search over your inventory — computed entirely in your
        browser, no account required.
      </p>
      <div className="mt-6 flex flex-wrap items-end gap-x-8 gap-y-4">
        <div>
          <p className="micro-label">Crit Value · fixed demo inventory</p>
          <p className="font-mono text-5xl font-bold leading-none text-accent-bright">
            {formatScore(hero.build.objectiveValue, 1)}
          </p>
          <p className="mt-1 max-w-xs text-2xs text-muted">
            {objectiveHint('crit_value')}
          </p>
        </div>
        {/* The big number is the *space*, not the work: branch-and-bound never
            visits 100,000 builds, and saying "searched 100,000" claimed
            brute force. Sentence in the body face, numerals in mono. */}
        <p className="max-w-sm text-xs leading-relaxed text-muted">
          Search space:{' '}
          <span className="font-mono tabular-nums text-paper">
            {hero.naive.toLocaleString()}
          </span>{' '}
          combinations · leaves evaluated:{' '}
          <span className="font-mono tabular-nums text-paper">
            {hero.explored.toLocaleString()}
          </span>{' '}
          · subtrees pruned:{' '}
          <span className="font-mono tabular-nums text-paper">
            {hero.pruned.toLocaleString()}
          </span>{' '}
          — optimum proven.
        </p>
      </div>
      <p className="mt-3 text-2xs text-muted">
        Solved on load from a fixed 50-piece demo inventory — not your gear, and
        not a result you asked for.
      </p>
    </>
  );
}

/** Step chips for the sticky nav — ids match the Section ids below. Results
 *  carries no number: it's what the sequence produces, not a step in it. */
const STEPS: { id: string; n?: string; label: string }[] = [
  { id: 'step-load', n: '01', label: 'Load' },
  { id: 'step-roster', n: '02', label: 'Roster' },
  { id: 'step-teams', n: '03', label: 'Teams' },
  { id: 'step-plan', n: '04', label: 'Plan' },
  { id: 'step-optimise', n: '05', label: 'Optimise' },
  { id: 'results-section', label: 'Results' },
];

const LOCKED_HINT = 'Import a roster to unlock this step';

/**
 * Which nav chip the reader is looking at. `aria-current` needs a single
 * answer, so the topmost intersecting section wins. Guarded rather than
 * polyfilled: the highlight is an enhancement, and jsdom has no
 * IntersectionObserver.
 */
function useScrollSpy(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  // The id set changed, so the previous answer describes a nav that no longer
  // exists: clear it and let the observer's first callback decide. Done in the
  // render pass, not an effect — React re-runs this pass before painting, so
  // `aria-current` never lands on a chip that is gone.
  const [spiedIds, setSpiedIds] = useState(ids);
  if (spiedIds !== ids) {
    setSpiedIds(ids);
    setActive(null);
  }
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const order = ids;
    const els = order
      .map((id) => document.getElementById(id))
      .filter((e): e is HTMLElement => e !== null);
    if (els.length === 0) return;
    const seen = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) seen.add(e.target.id);
          else seen.delete(e.target.id);
        }
        const first = order.find((id) => seen.has(id));
        // Deliberately keep the last answer when nothing is intersecting:
        // between two sections (or scrolled past the last one) `first` is
        // undefined, and blanking `aria-current` there makes the highlight
        // flicker off mid-scroll. The reader is still "at" the section they
        // last passed, so it stays lit until another one wins.
        if (first) setActive(first);
      },
      // Top band only: a section counts as "current" once its heading has
      // cleared the sticky nav and before it has left the upper third.
      { rootMargin: '-72px 0px -60% 0px' },
    );
    for (const el of els) io.observe(el);
    return () => io.disconnect();
    // `ids` is a memoised array from the caller: a fresh array every render
    // would tear down and rebuild the observer on every render.
  }, [ids]);
  return active;
}

/** A shared ?b= link opens on someone else's build. Say whose, and offer the
 *  one action the page can't infer — re-running it over the reader's own bag
 *  (the request is already hydrated into the Optimise panel). */
function SharedBuildBanner({ request }: { request: OptimizeRequest }) {
  const character = genshinAdapter.characterName(request.characterKey);
  const weapon =
    genshinAdapter.weapon(request.weaponKey)?.name ?? request.weaponKey;
  return (
    <Callout
      tone="info"
      className="mb-4 flex flex-wrap items-center justify-between gap-3"
    >
      <span>
        Shared build ·{' '}
        <span className="font-semibold text-paper">{character}</span> · {weapon}{' '}
        · Lv {request.buildLevel}. It carries its own five pieces — no search
        ran in your browser.
      </span>
      <button
        type="button"
        className="btn-ghost flex-none"
        onClick={() => scrollToId('step-optimise')}
      >
        Run it yourself
      </button>
    </Callout>
  );
}

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

  // Once a roster exists the app's curated opening pair is no longer the most
  // useful one — the reader's own best-built character is. Only while the
  // selection is untouched: a pick the reader (or a shared ?b= link) made must
  // never be overwritten, which is what `isDefaultSelection` guards. Weapon
  // legality is left to OptimizePanel, the one place that owns that rule.
  useEffect(() => {
    const s = useOptimizeRequest.getState();
    if (!isDefaultSelection(s)) return;
    const best = bestBuiltCharacter(rosterEntries, artifacts);
    if (!best) return;
    s.setCharacterKey(best.characterKey);
    if (best.weaponKey) s.setWeaponKey(best.weaponKey);
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

  const [running, setRunning] = useState(false);

  // One persistent announcement for the whole page. Written by the run itself
  // rather than by an effect on `result`, so a shared ?b= hydration (which is
  // not an optimisation) never claims one finished.
  const [announcement, setAnnouncement] = useState<{
    nonce: number;
    text: string;
  } | null>(null);
  // A live region only speaks when its content *changes*, so two runs that
  // finish with the same sentence used to announce once. The nonce keys the
  // text below, making every announcement a distinct node.
  const announceNonce = useRef(0);
  function announce(text: string) {
    setAnnouncement(text ? { nonce: ++announceNonce.current, text } : null);
  }

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
      announce(
        r.status === 'ok'
          ? `Optimisation complete — ${r.builds.length} ${r.builds.length === 1 ? 'build' : 'builds'}.`
          : 'Optimisation complete — no build satisfies all constraints.',
      );
    } catch (err) {
      if (runToken.current !== token) return;
      // A worker/protocol rejection (or bad game data) must not vanish
      // silently — surface it instead of dropping back to idle with no cue.
      console.error('Optimize failed', err);
      // The failure is announced by the assertive region below, not here.
      setOptimizeError(true);
      announce('');
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
  const activeId = useScrollSpy(liveIds);
  const lockedHintId = useId();

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
          {/* Not the h1 again a line above the h1 — the eyebrow's job is to
              say what kind of thing this is. */}
          <p className="eyebrow">Exact search · proven optimal</p>
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

      {/* Shown from the first visit, not gated on a roster: a visitor who
          never imports still has two sections to move between, and the locked
          chips are how the page explains what importing unlocks. */}
      {liveIds.length >= 2 && (
        <nav
          aria-label="Steps"
          className="sticky top-0 z-20 -mx-5 mb-6 flex snap-x scroll-px-5 gap-1 overflow-x-auto border-b border-white/5 bg-surface-800/80 px-5 py-2 backdrop-blur-md [mask-image:linear-gradient(to_right,transparent,black_12px,black_calc(100%-12px),transparent)]"
        >
          {STEPS.map((s) => {
            if (!unlocked[s.id]) {
              // Only the numbered steps ghost: they're what an import
              // unlocks. Results isn't a step you can reach, so it simply
              // isn't there until a run produces one.
              if (!s.n) return null;
              // A real disabled control, not a styled span: `aria-disabled` on
              // a <span> announces nothing useful, and the hint lived in
              // `title` — unreachable by keyboard and invisible to a screen
              // reader. Solid muted text rather than opacity-40, which took
              // the label below 4.5:1 against the nav.
              return (
                <button
                  key={s.id}
                  type="button"
                  disabled
                  aria-describedby={lockedHintId}
                  className="chip touch-target flex-none cursor-not-allowed snap-start items-center whitespace-nowrap border-white/5 text-muted"
                >
                  <span aria-hidden="true">🔒</span>
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
                className={cn(
                  'chip touch-target flex-none snap-start items-center whitespace-nowrap transition-colors hover:border-accent/40 hover:text-paper',
                  current && 'border-accent/60 bg-accent/10 text-paper',
                )}
              >
                {s.n && (
                  <span className="font-mono text-accent-bright">{s.n}</span>
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
          <Callout tone="error" className="mb-8 animate-fade-up">
            This shared build couldn’t be read — it may be from a newer version.
          </Callout>
        )}

        {optimizeError && (
          <Callout tone="error" className="mb-8 animate-fade-up">
            Optimisation failed — please try again.
          </Callout>
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
              <summary className="focus-ring inline-flex min-h-11 cursor-pointer select-none items-center gap-2 rounded-md py-2 text-sm font-medium text-flux-bright transition hover:text-flux">
                {/* Decorative twisty — it sits right beside the label it
                    describes. Matches RosterView's disclosure. */}
                <span
                  aria-hidden="true"
                  className="text-xs transition group-open:rotate-90"
                >
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
            n={5}
            id="step-optimise"
            title="Optimise"
            hint="Choose a character, weapon, and what to maximise."
            delay="0.1s"
          >
            <OptimizePanel onRun={runCurrent} running={running} />
          </Section>

          {result && request && (
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
                </div>
              </Section>
            </div>
          )}
        </div>
      </div>

      <footer className="mt-16 border-t border-white/5 pt-6 text-center text-xs text-muted">
        Built with branch-and-bound optimization in a Web Worker · Data from{' '}
        {game.source} (patch {game.patch}) · Not affiliated with the game’s
        publisher.
      </footer>
    </main>
  );
}
