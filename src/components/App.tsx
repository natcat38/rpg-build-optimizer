import { useEffect, useMemo, useState } from 'react';
import { ImportPanel } from './ImportPanel';
import { ArtifactForm } from './ArtifactForm';
import { OptimizePanel } from './OptimizePanel';
import { Results } from './Results';
import { decodeBuild } from '../share/url';
import { PATCH } from '../game/genshin/adapter';
import { useInventory } from '../state/inventory';
import type { Artifact, OptimizeRequest, OptimizeResult } from '../game/types';

export function App() {
  const artifacts = useInventory((s) => s.artifacts);
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

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <header className="flex justify-between items-baseline">
        <h1 className="text-2xl font-bold">RPG Build Optimizer</h1>
        <span className="text-xs text-gray-500">Data: patch {PATCH}</span>
      </header>

      {sharedError && (
        <p role="alert" className="text-amber-700">
          {
            "This shared build couldn't be read — it may be from a newer version."
          }
        </p>
      )}

      <section>
        <h2 className="font-semibold mb-2">1. Load your artifacts</h2>
        <ImportPanel />
        <details className="mt-2">
          <summary className="cursor-pointer text-sm">
            Or add one manually
          </summary>
          <ArtifactForm />
        </details>
      </section>

      <section>
        <h2 className="font-semibold mb-2">2. Optimise</h2>
        <OptimizePanel
          onResult={(r, req) => {
            setSharedArtifacts(null);
            setResult(r);
            setRequest(req);
          }}
        />
      </section>

      {result && request && (
        <section>
          <h2 className="font-semibold mb-2">3. Results</h2>
          <Results
            result={result}
            request={request}
            artifactsById={artifactsById}
          />
        </section>
      )}
    </div>
  );
}
