/**
 * Landing/hero pieces for the top-level `App` shell: the numbered `Section`
 * wrapper, the two hero variants, and the banner shown when a shared build
 * link is opened. The step-nav vocabulary lives in `landingSteps.ts` and the
 * scroll-spy hook in `useScrollSpy.ts` — split out so this file only exports
 * components (react-refresh/only-export-components).
 * @packageDocumentation
 */

import { useId, type ReactNode } from 'react';
import { genshinAdapter } from '../game/genshin/adapter';
import type { HeroExample } from '../sample/heroExample';
import { scrollToId } from '../ui/scroll';
import { formatCount, formatScore, objectiveHint } from '../labels';
import { Callout } from './ui/Callout';
import { cn } from './ui/cn';
import { SearchCounts } from './ui/SearchCounts';
import type { OptimizeRequest } from '../game/types';

export function Section({
  n,
  id,
  title,
  hint,
  delay,
  collapse,
  children,
}: {
  /** Omitted for Results: it's an output of the sequence, not a step in it. */
  n?: number;
  id?: string;
  title: string;
  hint?: string;
  delay: string;
  /** Phone layout: the section folds behind its own heading. Controlled, so
   *  the step nav can open a folded section it jumps to. Omit to render a
   *  plain, always-open section. */
  collapse?: { open: boolean; onOpenChange: (open: boolean) => void };
  children: ReactNode;
}) {
  // A <section> is only a landmark once it has an accessible name; unnamed,
  // five of them collapsed into five identical "region" entries.
  const headingId = useId();
  const heading = (
    <div className={collapse ? 'min-w-0 flex-1' : 'mb-3'}>
      <h2
        id={headingId}
        className="text-pretty font-display text-2xl font-bold tracking-tight text-paper"
      >
        {n != null && (
          <span className="section-badge mr-3 align-middle">
            {String(n).padStart(2, '0')}
          </span>
        )}
        {title}
      </h2>
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="animate-fade-up scroll-mt-20"
      style={{ animationDelay: delay }}
    >
      {collapse ? (
        <details
          className="group"
          open={collapse.open}
          onToggle={(e) => collapse.onOpenChange(e.currentTarget.open)}
        >
          <summary className="focus-ring touch-target mb-3 flex cursor-pointer select-none items-center gap-3 rounded-lg">
            {heading}
            <span
              aria-hidden="true"
              className="inline-block flex-none text-xs text-muted transition group-open:rotate-90"
            >
              ▶
            </span>
          </summary>
          {children}
        </details>
      ) : (
        <>
          {heading}
          {children}
        </>
      )}
    </section>
  );
}

/** The app's name, set as the page's one h1: the existing gold crosshair (the
 *  favicon) as a small mark, then the name in the display face. The mark is
 *  decoration, so it carries no alt text. */
function Wordmark() {
  return (
    <h1 className="flex items-center gap-3 font-display text-4xl font-bold leading-tight text-paper sm:text-5xl">
      <img
        src="/favicon.svg"
        alt=""
        width={40}
        height={40}
        className="h-9 w-9 flex-none rounded-lg sm:h-10 sm:w-10"
      />
      <span className="text-balance">RPG Build Optimizer</span>
    </h1>
  );
}

/** Thesis-only hero: shown once the user has their own gear loaded. */
export function ThesisHero({ tagline }: { tagline: string }) {
  return (
    <>
      <Wordmark />
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
        {tagline} Exact branch-and-bound search over your inventory — computed
        entirely in your browser, no account required.
      </p>
    </>
  );
}

/** The first screen is for the two things a visitor can do — load their gear
 *  or try a sample — so they come straight after the name and the claim. The
 *  real solve this tool does (one genuine build from a seeded synthetic
 *  inventory, see src/sample/heroExample.ts, plus the exact search proof)
 *  follows as supporting evidence, sized as a caption rather than a headline. */
export function SolvedHero({ hero }: { hero: HeroExample | null }) {
  // `null` while the demo is still solving: the block is laid out with
  // stand-in digits but hidden, so the header keeps its final height.
  const solving = hero === null;
  const score = solving ? 219.4 : hero.build.objectiveValue;
  const naive = solving ? 100_000 : hero.naive;
  const explored = solving ? 10 : hero.explored;
  const pruned = solving ? 36 : hero.pruned;
  return (
    <>
      <Wordmark />
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
        Find the mathematically optimal gear build for any character. Exact
        branch-and-bound search over your inventory — computed entirely in your
        browser, no account required.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <a href="#step-load" className="btn-ghost">
          Load your gear
        </a>
        <a href="#sample-gear" className="btn-ghost">
          Try a sample
        </a>
      </div>
      <div
        aria-hidden={solving || undefined}
        className={cn(
          'mt-6 border-t border-white/5 pt-4',
          solving && 'invisible',
        )}
      >
        <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
          <div>
            <p className="micro-label">Crit Value · fixed demo inventory</p>
            <p className="font-mono text-3xl font-bold leading-none text-accent-bright">
              {formatScore(score, 1)}
            </p>
          </div>
          {/* The big number is the *space*, not the work: branch-and-bound never
              visits 100,000 builds, and saying "searched 100,000" claimed
              brute force. Sentence in the body face, numerals in mono. */}
          <p className="max-w-sm text-xs leading-relaxed text-muted">
            Search space:{' '}
            <span className="font-mono tabular-nums text-paper">
              {formatCount(naive)}
            </span>{' '}
            combinations · <SearchCounts explored={explored} pruned={pruned} />{' '}
            — optimum proven.
          </p>
        </div>
        <p className="mt-2 max-w-xs text-2xs text-muted">
          {objectiveHint('crit_value')}
        </p>
        <p className="mt-1 text-2xs text-muted">
          Solved on load from a fixed 50-piece demo inventory — not your gear,
          and not a result you asked for.
        </p>
      </div>
    </>
  );
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
