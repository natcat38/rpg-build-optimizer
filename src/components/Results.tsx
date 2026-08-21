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
      <div className="panel panel-md border-rose/20 text-sm text-rose">
        <p className="font-semibold">No build satisfies all constraints.</p>
        <p className="mt-1 text-rose/80">
          Try relaxing the set requirement or the Energy Recharge minimum.
        </p>
      </div>
    );
  }

  const artifactsFor = (build: BuildResult): Artifact[] =>
    SLOTS.map((s) => artifactsById[build.artifactIds[s]]).filter(
      (a): a is Artifact => Boolean(a),
    );

  const total = result.explored + result.pruned;
  const exploredPct = total > 0 ? (result.explored / total) * 100 : 100;

  return (
    <div className="space-y-4">
      <div className="panel space-y-2 px-4 py-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 font-mono text-xs">
          <span className="uppercase tracking-label text-muted">
            Exact search
          </span>
          <span>
            Explored{' '}
            <span className="text-paper">
              {result.explored.toLocaleString()}
            </span>{' '}
            · pruned{' '}
            <span className="text-paper">{result.pruned.toLocaleString()}</span>{' '}
            subtrees before the optimum was proven.
          </span>
        </div>
        <Meter value={exploredPct} size="sm" className="w-full" />
      </div>
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
              <Callout tone="success" role="status" className="mt-2">
                Share link copied.
              </Callout>
            )}
            {shareFailed?.index === i && (
              <Callout tone="error" role="alert" className="mt-2">
                {shareFailed.url ? (
                  <>
                    <p>Couldn&apos;t copy automatically — copy it from here:</p>
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
                    Couldn&apos;t build a share link in this browser — try a
                    different one.
                  </p>
                )}
              </Callout>
            )}
          </div>
        );
      })}
    </div>
  );
}
