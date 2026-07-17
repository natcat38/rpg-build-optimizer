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
  const [copyFailed, setCopyFailed] = useState(false);

  if (result.status === 'infeasible') {
    return (
      <div className="panel border-rose/20 text-sm text-rose">
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
          <span className="uppercase tracking-[0.14em] text-muted">
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
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full bg-accent/70"
            style={{ width: `${exploredPct}%` }}
          />
        </div>
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
                try {
                  const param = await encodeBuild({
                    request,
                    build: b,
                    artifacts: arts,
                  });
                  const url = `${location.origin}${location.pathname}?b=${param}`;
                  await navigator.clipboard.writeText(url);
                  setCopyFailed(false);
                  setCopied(i);
                } catch {
                  // encodeBuild (CompressionStream) or clipboard can reject —
                  // both now surface as the copy-failed cue instead of an
                  // unhandled rejection.
                  setCopied(null);
                  setCopyFailed(true);
                }
              }}
            />
          </div>
        );
      })}
      {copied !== null && (
        <p
          role="status"
          className="rounded-lg border border-jade/25 bg-jade/10 px-3 py-2 text-sm text-jade"
        >
          Share link copied.
        </p>
      )}
      {copyFailed && (
        <p
          role="alert"
          className="rounded-lg border border-rose/30 bg-rose/10 px-3 py-2 text-sm text-rose"
        >
          Couldn&apos;t copy automatically — copy the link from your
          browser&apos;s address bar.
        </p>
      )}
    </div>
  );
}
