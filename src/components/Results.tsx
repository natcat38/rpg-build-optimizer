import { useState } from 'react';
import type {
  Artifact,
  BuildResult,
  OptimizeResult,
  OptimizeRequest,
} from '../game/types';
import { SLOTS } from '../game/types';
import { BuildCard } from './BuildCard';
import { encodeBuild } from '../share/url';
import { Callout } from './ui/Callout';
import { Meter } from './ui/Meter';
import { objectiveHint } from '../labels';

export function Results({
  result,
  request,
  artifactsById,
}: {
  result: OptimizeResult;
  request: OptimizeRequest;
  artifactsById: Record<string, Artifact>;
}) {
  const [copied, setCopied] = useState<number | null>(null);
  // `url` is null when encoding failed and there is no link to hand over.
  const [shareFailed, setShareFailed] = useState<{
    index: number;
    url: string | null;
  } | null>(null);

  // A new run replaces every card, so a confirmation pinned to the old card
  // index would sit under an unrelated build. Reset during render rather than
  // in an effect — React re-runs this pass before painting the stale cue.
  const [shownResult, setShownResult] = useState(result);
  if (result !== shownResult) {
    setShownResult(result);
    setCopied(null);
    setShareFailed(null);
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

  const shareStatus =
    copied != null
      ? 'Share link copied.'
      : shareFailed
        ? shareFailed.url
          ? 'Couldn’t copy automatically — the link is shown below for copying by hand.'
          : 'Couldn’t build a share link in this browser.'
        : '';

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
      {result.builds.map((b, i) => {
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
              rank={i + 1}
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
                  setCopied(null);
                  setShareFailed({ index: i, url: null });
                  return;
                }
                try {
                  await navigator.clipboard.writeText(url);
                  setShareFailed(null);
                  setCopied(i);
                } catch {
                  // The clipboard can reject (permission, insecure context).
                  // The link was never in the address bar, so hand it over to
                  // be copied by hand instead of pointing there.
                  setCopied(null);
                  setShareFailed({ index: i, url });
                }
              }}
            />
            {copied === i && (
              <Callout tone="success" className="mt-2">
                Share link copied.
              </Callout>
            )}
            {shareFailed?.index === i && (
              <Callout tone="error" className="mt-2">
                {shareFailed.url ? (
                  <>
                    <p>Couldn’t copy automatically — copy it from here:</p>
                    <input
                      className="field mt-2"
                      readOnly
                      value={shareFailed.url}
                      aria-label="Share link"
                      onFocus={(e) => e.currentTarget.select()}
                    />
                  </>
                ) : (
                  <p>
                    Couldn’t build a share link in this browser — try a
                    different one.
                  </p>
                )}
              </Callout>
            )}
          </div>
        );
      })}
      {/* One persistent live region for the share outcome. The Callouts above
          are created on demand, and a live region that doesn't exist when its
          text arrives announces nothing — so the announcement lives here and
          they stay purely visual. */}
      <p className="sr-only" role="status">
        {shareStatus}
      </p>
    </div>
  );
}
