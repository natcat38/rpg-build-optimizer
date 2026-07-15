import type { GapReport as GapReportData } from '../meta/gap';

export function GapReport({ report }: { report: GapReportData }) {
  const allMet =
    report.feasibility.length === 0 && report.shortfalls.length === 0;
  return (
    <div className="panel space-y-3">
      <h2 className="font-display text-lg font-bold tracking-wide text-paper">
        Gap vs meta build
      </h2>

      {allMet ? (
        <p className="text-sm text-jade">
          Your gear can already build the meta — nice.
          {report.action ? ` To push further: ${report.action}` : ''}
        </p>
      ) : (
        <>
          {report.feasibility.length > 0 && (
            <div>
              <p className="field-label">What&apos;s missing</p>
              <ul className="space-y-1 text-sm text-paper/90">
                {report.feasibility.map((f, i) => (
                  <li key={i}>• {f}</li>
                ))}
              </ul>
            </div>
          )}

          {report.shortfalls.length > 0 && (
            <div>
              <p className="field-label">Shortfall</p>
              <ul className="space-y-1 text-sm text-paper/90">
                {report.shortfalls.map((s, i) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
            </div>
          )}

          {report.action && (
            <div className="rounded-lg border border-accent/25 bg-accent/10 px-3 py-2 text-sm text-accent-bright">
              <span className="font-semibold">Next:</span> {report.action}
            </div>
          )}
        </>
      )}
    </div>
  );
}
