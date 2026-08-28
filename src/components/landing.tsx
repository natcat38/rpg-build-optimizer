/**
 * Landing/hero pieces for the top-level `App` shell: the numbered `Section`
 * wrapper, the two hero variants, the sticky-nav scroll spy, and the banner
 * shown when a shared build link is opened.
 * @packageDocumentation
 */

import { useEffect, useId, useState, type ReactNode } from 'react';
import { genshinAdapter } from '../game/genshin/adapter';
import type { GameDescriptor } from '../game/registry';
import type { HeroExample } from '../sample/heroExample';
import { scrollToId } from '../ui/scroll';
import { formatCount, formatScore, objectiveHint } from '../labels';
import { Callout } from './ui/Callout';
import { SearchCounts } from './ui/SearchCounts';
import type { OptimizeRequest } from '../game/types';

export function Section({
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
export function ThesisHero({ game }: { game: GameDescriptor }) {
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
export function SolvedHero({ hero }: { hero: HeroExample }) {
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
            {formatCount(hero.naive)}
          </span>{' '}
          combinations ·{' '}
          <SearchCounts explored={hero.explored} pruned={hero.pruned} /> —
          optimum proven.
        </p>
      </div>
      <p className="mt-3 text-2xs text-muted">
        Solved on load from a fixed 50-piece demo inventory — not your gear, and
        not a result you asked for.
      </p>
    </>
  );
}

/** Step chips for the sticky nav — ids match the Section ids in App.tsx.
 *  Results carries no number: it's what the sequence produces, not a step in
 *  it. */
export const STEPS: { id: string; n?: string; label: string }[] = [
  { id: 'step-load', n: '01', label: 'Load' },
  { id: 'step-roster', n: '02', label: 'Roster' },
  { id: 'step-teams', n: '03', label: 'Teams' },
  { id: 'step-plan', n: '04', label: 'Plan' },
  { id: 'step-optimise', n: '05', label: 'Optimise' },
  { id: 'results-section', label: 'Results' },
];

export const LOCKED_HINT = 'Import a roster to unlock this step';

/**
 * Which nav chip the reader is looking at. `aria-current` needs a single
 * answer, so the topmost intersecting section wins. Guarded rather than
 * polyfilled: the highlight is an enhancement, and jsdom has no
 * IntersectionObserver.
 */
export function useScrollSpy(ids: string[]): string | null {
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
export function SharedBuildBanner({ request }: { request: OptimizeRequest }) {
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
        Run It Yourself
      </button>
    </Callout>
  );
}
