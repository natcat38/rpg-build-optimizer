import type { Artifact, OptimizeRequest, OptimizeResult } from '../game/types';
import { GUIDES } from '../meta/guides';
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
  const meta = GUIDES[request.characterKey]?.build;
  // Only for meta characters on freshly-optimised (non-shared) builds.
  if (sharedArtifacts || !meta) return null;

  const build = result.status === 'ok' ? (result.builds[0] ?? null) : null;
  const report = computeGapReport(request.characterKey, meta, artifacts, build);

  return (
    <div className="mb-4">
      <GapReport report={report} />
      <ExplainBuild
        characterKey={request.characterKey}
        objective={request.objective}
        totals={build?.totals ?? {}}
        report={report}
      />
    </div>
  );
}
