import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ImportPanel } from './ImportPanel';
import { ArtifactForm } from './ArtifactForm';
import { OptimizePanel } from './OptimizePanel';
import { Results } from './Results';
import { SampleGear } from './SampleGear';
import { GapReport } from './GapReport';
import { ExplainBuild } from './ExplainBuild';
import { META_TARGETS } from '../meta/metaTargets';
import { computeGapReport } from '../meta/gap';
import { decodeBuild } from '../share/url';
import { PATCH } from '../game/genshin/adapter';
import { useInventory } from '../state/inventory';
import { useOptimizeRequest, currentRequest } from '../state/optimizeRequest';
import { optimizeFor } from '../workers/optimizeClient';
import type { Artifact, OptimizeRequest, OptimizeResult } from '../game/types';

function Section({
  n,
  title,
  hint,
  delay,
  children,
}: {
  n: number;
  title: string;
  hint?: string;
  delay: string;
  children: ReactNode;
}) {
  return (
    <section className="animate-fade-up" style={{ animationDelay: delay }}>
      <div className="mb-3 flex items-center gap-3">
        <span className="section-badge">
          <span>{n}</span>
        </span>
        <div>
          <h2 className="font-display text-lg font-bold tracking-wide text-parchment">
            {title}
          </h2>
          {hint && <p className="text-xs text-muted">{hint}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export function App() {
  const artifacts = useInventory((s) => s.artifacts);
  const sampleMode =
    artifacts.length === 0 ||
    artifacts.every((a) => a.id.startsWith('sample-'));
  const [result, setResult] = useState<OptimizeResult | null>(null);
  const [request, setRequest] = useState<OptimizeRequest | null>(null);
  const [sharedArtifacts, setSharedArtifacts] = useState<Artifact[] | null>(
    null,
  );
  const [sharedError, setSharedError] = useState(false);

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('b');
    if (!param) return;
    const out = decodeBuild(param);
    if ('error' in out) {
      setSharedError(true);
      return;
    }
    setRequest(out.request);
    setResult({ builds: [out.build], explored: 0, pruned: 0 });
    setSharedArtifacts(out.artifacts);
  }, []);

  // Resolve artifacts for Results: a shared build carries its own five artifacts;
  // a freshly-optimised build resolves ids against the current inventory.
  const artifactsById = useMemo(() => {
    const src = sharedArtifacts ?? artifacts;
    const m: Record<string, Artifact> = {};
    for (const a of src) m[a.id] = a;
    return m;
  }, [sharedArtifacts, artifacts]);

  const [running, setRunning] = useState(false);

  async function runCurrent() {
    const req = currentRequest(useOptimizeRequest.getState());
    const inv = useInventory.getState().artifacts;
    if (inv.length === 0 || !req.characterKey) return;
    setRunning(true);
    try {
      const r = await optimizeFor(req, inv);
      setSharedArtifacts(null);
      setResult(r);
      setRequest(req);
    } finally {
      setRunning(false);
    }
  }

  const lastScrolled = useRef<OptimizeResult | null>(null);
  useEffect(() => {
    if (result && result !== lastScrolled.current) {
      lastScrolled.current = result;
      document
        .getElementById('results-section')
        ?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [result]);

  return (
    <div className="relative z-10 mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <header className="mb-12 animate-fade-up">
        <div className="mb-3 flex items-center justify-between gap-4">
          <p className="eyebrow">Teyvat Artifact Forge</p>
          <span className="chip">
            <span className="h-1.5 w-1.5 rounded-full bg-jade" />
            genshin-db · patch {PATCH}
          </span>
        </div>
        <h1 className="font-display text-4xl font-black leading-tight sm:text-5xl">
          <span className="bg-gradient-to-br from-mora-bright via-mora to-mora-deep bg-clip-text text-transparent">
            RPG Build Optimizer
          </span>
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          Find the mathematically optimal artifact build for any character.
          Exact branch-and-bound search over your inventory — computed entirely
          in your browser, no account required.
        </p>
      </header>

      {sharedError && (
        <div
          role="alert"
          className="mb-8 animate-fade-up rounded-xl border border-rose/30 bg-rose/10 px-4 py-3 text-sm text-rose"
        >
          This shared build couldn&apos;t be read — it may be from a newer
          version.
        </div>
      )}

      <div className="space-y-10">
        {sampleMode && (
          <div className="animate-fade-up">
            <SampleGear onRun={runCurrent} />
          </div>
        )}
        <Section
          n={1}
          title="Load your artifacts"
          hint="Import a full inventory, fetch from a UID, or add pieces by hand."
          delay="0.05s"
        >
          <ImportPanel />
          <details className="group mt-3">
            <summary className="inline-flex cursor-pointer select-none items-center gap-2 text-sm font-medium text-teal-bright transition hover:text-teal">
              <span className="text-xs transition group-open:rotate-90">▶</span>
              Or add one manually
            </summary>
            <div className="mt-3">
              <ArtifactForm />
            </div>
          </details>
        </Section>

        <Section
          n={2}
          title="Optimise"
          hint="Choose a character, weapon, and what to maximise."
          delay="0.1s"
        >
          <OptimizePanel onRun={runCurrent} running={running} />
        </Section>

        {result && request && (
          <div id="results-section">
            <Section n={3} title="Results" delay="0s">
              {!sharedArtifacts &&
                META_TARGETS[request.characterKey] &&
                (() => {
                  const report = computeGapReport(
                    META_TARGETS[request.characterKey],
                    artifacts,
                    result.builds[0] ?? null,
                  );
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
                })()}
              <Results
                result={result}
                request={request}
                artifactsById={artifactsById}
              />
            </Section>
          </div>
        )}
      </div>

      <footer className="mt-16 border-t border-white/5 pt-6 text-center text-xs text-muted/70">
        Built with branch-and-bound optimization in a Web Worker · Data from
        genshin-db (patch {PATCH}) · Not affiliated with HoYoverse.
      </footer>
    </div>
  );
}
