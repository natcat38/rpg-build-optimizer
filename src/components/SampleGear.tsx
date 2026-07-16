import { useState } from 'react';
import { useInventory } from '../state/inventory';
import { useOptimizeRequest } from '../state/optimizeRequest';
import { SAMPLE_PRESETS, type SamplePreset } from '../sample/presets';
import { SAMPLE_INVENTORY } from '../sample/sampleInventory';

export function SampleGear({
  onRun,
  running,
}: {
  onRun: () => void | Promise<void>;
  running: boolean;
}) {
  const clear = useInventory((s) => s.clear);
  const addMany = useInventory((s) => s.addMany);
  const applyPreset = useOptimizeRequest((s) => s.applyPreset);
  const [busy, setBusy] = useState<string | null>(null);

  async function load(preset: SamplePreset) {
    setBusy(preset.label);
    clear();
    addMany(SAMPLE_INVENTORY);
    applyPreset(preset);
    try {
      await onRun();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="panel space-y-3">
      <div>
        <h2 className="font-display text-lg font-bold tracking-wide text-parchment">
          No gear handy? Try a sample build
        </h2>
        <p className="text-xs text-muted">
          Loads a realistic sample account and optimises it in one click — each
          preset shows a different kind of constraint.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {SAMPLE_PRESETS.map((p) => (
          <button
            key={p.label}
            className="btn-ghost"
            disabled={busy !== null || running}
            aria-busy={busy === p.label}
            onClick={() => void load(p)}
          >
            {busy === p.label ? 'Optimising…' : p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
