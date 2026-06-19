import { useState } from 'react';
import type { Objective, StatVec } from '../game/types';
import type { GapReport } from '../meta/gap';
import { explainBuild } from '../ai/explainClient';

export function ExplainBuild({
  characterKey,
  objective,
  totals,
  report,
}: {
  characterKey: string;
  objective: Objective;
  totals: StatVec;
  report: GapReport;
}) {
  const enabled = import.meta.env.VITE_AI_ENABLED === 'true';
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [error, setError] = useState(false);

  if (!enabled) return null;

  async function run() {
    setLoading(true);
    setError(false);
    try {
      const text = await explainBuild({
        characterKey,
        objective,
        totals,
        gap: {
          feasibility: report.feasibility,
          shortfalls: report.shortfalls,
          action: report.action,
        },
      });
      setExplanation(text);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3">
      {explanation ? (
        <div className="panel space-y-2">
          <p className="field-label">AI explanation</p>
          <p className="text-sm leading-relaxed text-parchment/90">
            {explanation}
          </p>
        </div>
      ) : (
        <button className="btn-ghost" onClick={run} disabled={loading}>
          {loading ? 'Thinking…' : '✨ Explain this build'}
        </button>
      )}
      {error && (
        <p className="mt-2 text-sm text-rose">
          Couldn&apos;t generate an explanation right now. Try again.
        </p>
      )}
    </div>
  );
}
