import { useRef, useState } from 'react';
import type {
  Artifact,
  BuildResult,
  OptimizeResult,
  OptimizeRequest,
  Slot,
} from '../game/types';
import { SLOTS } from '../game/types';
import { BuildCard } from './BuildCard';
import { encodeBuild } from '../share/url';
import { Callout } from './ui/Callout';
import { Meter } from './ui/Meter';
import { objectiveHint, SLOT_LABELS } from '../labels';

/** One card's worth of result: the build shown, plus any further builds that
 *  scored exactly the same. */
interface BuildGroup {
  build: BuildResult;
  /** 1-based position of `build` in the unfiltered result list. */
  rank: number;
  ties: BuildResult[];
}

/**
 * Collapse runs of exactly-equal results into one entry each.
 *
 * Equal on both the ranking score and the displayed objective: a tie the reader
 * can't see in either number is a tie, and printing it as N more cards made a
 * correct search look like a rendering bug. The list arrives score-descending,
 * so equal runs are always adjacent.
 */
function groupTies(builds: BuildResult[]): BuildGroup[] {
  const groups: BuildGroup[] = [];
  const same = (a: BuildResult, b: BuildResult) =>
    a.score === b.score && a.objectiveValue === b.objectiveValue;
  for (let i = 0; i < builds.length; i++) {
    const head = groups[groups.length - 1];
    if (head && same(head.build, builds[i])) head.ties.push(builds[i]);
    else groups.push({ build: builds[i], rank: i + 1, ties: [] });
  }
  return groups;
}

/**
 * What separates the tied builds in a group, in the reader's terms: which slots
 * hold a different piece, and whether that piece is from a different set (the
 * only difference visible on the card) or merely a different copy of the same
 * one.
 */
/** "a", "a and b", "a, b and c". Hand-rolled rather than `Intl.ListFormat`,
 *  which the project's TS lib target predates; there are at most five items and
 *  the copy around it is English-only anyway. */
function andList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/** "goblet and circlet sets differ" — one verb for the whole list, rather than
 *  repeating "… differs" per slot. */
function clause(slots: Slot[], noun: 'set' | 'piece'): string | null {
  if (slots.length === 0) return null;
  const names = andList(slots.map((s) => SLOT_LABELS[s].toLowerCase()));
  return slots.length > 1
    ? `${names} ${noun}s differ`
    : `${names} ${noun} differs`;
}

function describeTies(
  group: BuildGroup,
  artifactsById: Record<string, Artifact>,
): string {
  const all = [group.build, ...group.ties];
  const setSlots: Slot[] = [];
  const pieceSlots: Slot[] = [];
  for (const slot of SLOTS) {
    const ids = new Set(all.map((b) => b.artifactIds[slot]));
    if (ids.size <= 1) continue;
    const sets = new Set(
      [...ids].map((id) => artifactsById[id]?.setKey).filter(Boolean),
    );
    // A different set is visible on the card; a different copy of the same set
    // is not, and saying "set differs" there would send the reader hunting for
    // a difference that isn't printed.
    (sets.size > 1 ? setSlots : pieceSlots).push(slot);
  }
  const parts = [clause(setSlots, 'set'), clause(pieceSlots, 'piece')].filter(
    (p): p is string => p !== null,
  );
  // Falls back rather than returning '': a group only exists because the builds
  // are distinct, so "nothing differs" would mean the ids didn't resolve.
  return parts.length > 0 ? parts.join(', ') : 'different pieces';
}

/** Cards shown before the reveal. Three is the podium — past it a reader is
 *  browsing, not comparing, and 10 full cards buried everything below them. */
const COLLAPSED_GROUPS = 3;

/**
 * The outcome of the last share attempt, pinned to the card that produced it.
 *
 * One value rather than a `copied` flag beside a `shareFailed` object: the
 * three outcomes are mutually exclusive, and two independent pieces of state
 * meant every call site had to remember to clear the other one.
 *
 * `nonce` exists only so the live region below re-announces an identical
 * repeat — copying the same link twice used to be silent, because a live
 * region only speaks when its content actually changes.
 */
type Share = { nonce: number; index: number } & (
  | { status: 'copied' }
  /** The clipboard refused; the link exists and is handed over to copy by hand. */
  | { status: 'manual'; url: string }
  /** Encoding failed — there is no link to offer at all. */
  | { status: 'failed' }
);

const SHARE_STATUS: Record<Share['status'], string> = {
  copied: 'Share link copied.',
  manual:
    'Couldn’t copy automatically — the link is shown below for copying by hand.',
  failed: 'Couldn’t build a share link in this browser.',
};

export function Results({
  result,
  request,
  artifactsById,
}: {
  result: OptimizeResult;
  request: OptimizeRequest;
  artifactsById: Record<string, Artifact>;
}) {
  const [share, setShare] = useState<Share | null>(null);
  const shareNonce = useRef(0);
  const [showAll, setShowAll] = useState(false);

  // A new run replaces every card, so a confirmation pinned to the old card
  // index would sit under an unrelated build. Reset during render rather than
  // in an effect — React re-runs this pass before painting the stale cue.
  const [shownResult, setShownResult] = useState(result);
  if (result !== shownResult) {
    setShownResult(result);
    setShare(null);
    setShowAll(false);
  }

  if (result.status === 'infeasible') {
    return (
      <Callout tone="error" role="status">
        <p className="font-semibold">No build satisfies all constraints.</p>
        <p className="mt-1 opacity-80">
          Try relaxing the set requirement or the Energy Recharge minimum.
        </p>
      </Callout>
    );
  }

  const artifactsFor = (build: BuildResult): Artifact[] =>
    SLOTS.map((s) => artifactsById[build.artifactIds[s]]).filter(
      (a): a is Artifact => Boolean(a),
    );

  const total = result.explored + result.pruned;
  // A shared ?b= build carries the build, not the search that found it, so it
  // hydrates as 0/0. Reporting "explored 0 · pruned 0" beside a full bar
  // claimed a proof that never ran here — say nothing instead.
  const searched = total > 0;

  const groups = groupTies(result.builds);
  const visible = showAll ? groups : groups.slice(0, COLLAPSED_GROUPS);
  // The gap is measured in `score`, the number the list is ordered by — not in
  // `objectiveValue`, the number the card prints. With a target-style
  // objective (a crit-ratio target, say) the printed objective can be higher
  // at rank 2 than at rank 1, so an objective-based gap put a "−" chip on a
  // bigger number. Ranked by score, the gap is non-positive by construction.
  const topScore = result.builds[0]?.score;
  // The search filters near-duplicates (clones sharing a 4-piece core), so a
  // short list is a feature. Unlabelled it reads as a bug — "why only 4?" — so
  // say so, but only where a search actually ran and returned something: a
  // shared ?b= link carries exactly one build and never searched.
  // Counted in cards, not raw results: exact ties collapse into one card, so
  // counting results promised more cards than the list can show.
  const requestedK = request.topK ?? 10;
  const shortList = searched && groups.length > 0 && groups.length < requestedK;

  return (
    <div className="space-y-4">
      {searched && (
        <div className="panel space-y-2 px-4 py-3">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-xs">
            <span className="micro-label font-mono">Exact search</span>
            {/* Sentence in the body face, numerals in mono: a full sentence set
                in mono reads as output, not prose. */}
            <span className="text-muted">
              Explored{' '}
              <span className="font-mono tabular-nums text-paper">
                {result.explored.toLocaleString()}
              </span>{' '}
              · pruned{' '}
              <span className="font-mono tabular-nums text-paper">
                {result.pruned.toLocaleString()}
              </span>{' '}
              subtrees before the optimum was proven.
            </span>
          </div>
          <Meter
            value={(result.explored / total) * 100}
            size="sm"
            className="w-full"
          />
        </div>
      )}
      {/* Once above the list, not once per card: a 10-result page printed the
          same sentence 11 times. */}
      <p className="text-xs text-muted">{objectiveHint(request.objective)}</p>
      {shortList && (
        <p className="text-xs text-muted">
          {groups.length} builds shown — near-duplicates sharing the same core
          are filtered.
        </p>
      )}
      {visible.map((g, i) => {
        const b = g.build;
        const arts = artifactsFor(b);
        return (
          <div
            key={i}
            className="animate-fade-up"
            style={{ animationDelay: `${i * 0.04}s` }}
          >
            <BuildCard
              build={b}
              request={request}
              artifacts={arts}
              rank={g.rank}
              delta={
                g.rank > 1 && topScore != null ? b.score - topScore : undefined
              }
              variants={
                g.ties.length > 0
                  ? {
                      count: g.ties.length,
                      differs: describeTies(g, artifactsById),
                    }
                  : undefined
              }
              onShare={async () => {
                let url: string;
                try {
                  const param = await encodeBuild({
                    request,
                    build: b,
                    artifacts: arts,
                  });
                  url = `${location.origin}${location.pathname}?b=${param}`;
                } catch {
                  // encodeBuild (CompressionStream) rejected — there is no link
                  // to offer, so say that rather than showing an empty field.
                  setShare({
                    nonce: ++shareNonce.current,
                    index: i,
                    status: 'failed',
                  });
                  return;
                }
                try {
                  await navigator.clipboard.writeText(url);
                  setShare({
                    nonce: ++shareNonce.current,
                    index: i,
                    status: 'copied',
                  });
                } catch {
                  // The clipboard can reject (permission, insecure context).
                  // The link was never in the address bar, so hand it over to
                  // be copied by hand instead of pointing there.
                  setShare({
                    nonce: ++shareNonce.current,
                    index: i,
                    status: 'manual',
                    url,
                  });
                }
              }}
            />
            {share?.index === i && share.status === 'copied' && (
              <Callout tone="success" className="mt-2">
                Share link copied.
              </Callout>
            )}
            {share?.index === i && share.status === 'manual' && (
              <Callout tone="error" className="mt-2">
                <p>Couldn’t copy automatically — copy it from here:</p>
                <input
                  className="field mt-2"
                  readOnly
                  value={share.url}
                  aria-label="Share link"
                  onFocus={(e) => e.currentTarget.select()}
                />
              </Callout>
            )}
            {share?.index === i && share.status === 'failed' && (
              <Callout tone="error" className="mt-2">
                <p>
                  Couldn’t build a share link in this browser — try a different
                  one.
                </p>
              </Callout>
            )}
          </div>
        );
      })}
      {/* Same reveal as the roster list: the podium is what the reader came
          for, and ten full cards pushed everything below the fold. */}
      {groups.length > COLLAPSED_GROUPS && !showAll && (
        <button className="btn-ghost w-full" onClick={() => setShowAll(true)}>
          <span aria-hidden="true">▶</span> Show all {groups.length} builds
        </button>
      )}
      {/* One persistent live region for the share outcome. The Callouts above
          are created on demand, and a live region that doesn't exist when its
          text arrives announces nothing — so the announcement lives here and
          they stay purely visual. */}
      <p className="sr-only" role="status">
        {/* Keyed on the nonce so an identical repeat — copying the same link
            twice — still counts as a change and is announced again. */}
        {share && <span key={share.nonce}>{SHARE_STATUS[share.status]}</span>}
      </p>
    </div>
  );
}
