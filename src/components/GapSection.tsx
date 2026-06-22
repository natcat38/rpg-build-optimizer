import type { Artifact, OptimizeRequest, OptimizeResult } from '../game/types';
import { META_TARGETS } from '../meta/metaTargets';
import { computeGapReport } from '../meta/gap';
import { GapReport } from './GapReport';
import { ExplainBuild } from './ExplainBuild';

/**
 * The gap-analysis section shown beneath fresh, non-shared results for a meta
 * character: a GapReport plus the optional AI "Explain this build" panel. Owns
 * its own visibility gate so App renders it unconditionally.
 */
export function GapSection({
  result,
  request,
  artifacts,
  sharedArtifacts,
}: {
  result: OptimizeResult;
  request: OptimizeRequest;
  artifacts: Artifact[];
  sharedArtifacts: Artifact[] | null;
}) {
  const meta = META_TARGETS[request.characterKey];
  // Only for meta characters on freshly-optimised (non-shared) builds.
  if (sharedArtifacts || !meta) return null;

  const report = computeGapReport(meta, artifacts, result.builds[0] ?? null);

  return (
    <div className="mb-4">
      <GapReport report={report} />
      <ExplainBuild
        characterKey={request.characterKey}
        objective={request.objective}
        totals={result.builds[0]?.totals ?? {}}
        report={report}
      />
    </div>
  );
}
