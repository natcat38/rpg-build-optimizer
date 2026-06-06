import { useState } from 'react';
import type { Artifact, BuildResult, OptimizeResult, OptimizeRequest } from '../game/types';
import { SLOTS } from '../game/types';
import { BuildCard } from './BuildCard';
import { encodeBuild } from '../share/url';

export function Results({ result, request, artifactsById }: {
  result: OptimizeResult;
  request: OptimizeRequest;
  artifactsById: Record<string, Artifact>;
}) {
  const [copied, setCopied] = useState<number | null>(null);
  const [copyFailed, setCopyFailed] = useState(false);

  if (result.reason === 'NO_FEASIBLE_BUILD' || result.builds.length === 0) {
    return (
      <p className="p-4 text-amber-700">
        No build satisfies all constraints. Try relaxing the set requirement or the Energy Recharge minimum.
      </p>
    );
  }

  const artifactsFor = (build: BuildResult): Artifact[] =>
    SLOTS.map((s) => artifactsById[build.artifactIds[s]]).filter((a): a is Artifact => Boolean(a));

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">Explored {result.explored} combinations, pruned {result.pruned}.</p>
      {result.builds.map((b, i) => {
        const arts = artifactsFor(b);
        return (
          <BuildCard
            key={i}
            build={b}
            request={request}
            artifacts={arts}
            onShare={async () => {
              const url = `${location.origin}${location.pathname}?b=${encodeBuild({ request, build: b, artifacts: arts })}`;
              try {
                await navigator.clipboard.writeText(url);
                setCopyFailed(false);
                setCopied(i);
              } catch {
                setCopied(null);
                setCopyFailed(true);
              }
            }}
          />
        );
      })}
      {copied !== null && <p role="status" className="text-green-700 text-sm">Share link copied.</p>}
      {copyFailed && <p role="alert" className="text-red-600 text-sm">Couldn’t copy automatically — copy the link from your browser’s address bar.</p>}
    </div>
  );
}
