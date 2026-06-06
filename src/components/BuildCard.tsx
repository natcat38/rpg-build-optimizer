import type { Artifact, BuildResult, OptimizeRequest, StatKey } from '../game/types';
import { SLOTS } from '../game/types';

const SHOW: StatKey[] = ['atk', 'atk_pct', 'crit_rate', 'crit_dmg', 'er_pct', 'em', 'elemental_dmg'];

export function BuildCard({ build, request, artifacts, onShare }: {
  build: BuildResult;
  request: OptimizeRequest;
  artifacts: Artifact[];
  onShare?: () => void | Promise<void>;
}) {
  const bySlot = new Map(artifacts.map((a) => [a.slot, a]));
  return (
    <div className="border rounded p-3 space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-semibold">Score: {build.objectiveValue.toFixed(1)} ({request.objective})</span>
        {onShare && <button className="text-sm text-blue-600 underline" onClick={onShare}>Copy share link</button>}
      </div>
      <ul className="text-sm grid grid-cols-2 gap-x-4">
        {SHOW.map((k) => (
          <li key={k} className="flex justify-between"><span>{k}</span><span>{(build.totals[k] ?? 0).toFixed(1)}</span></li>
        ))}
      </ul>
      <ul className="text-xs text-gray-600 space-y-0.5">
        {SLOTS.map((s) => {
          const a = bySlot.get(s);
          return <li key={s}>{s}: {a ? `${a.setKey} · ${a.mainStat} (+${a.level})` : '—'}</li>;
        })}
      </ul>
    </div>
  );
}
