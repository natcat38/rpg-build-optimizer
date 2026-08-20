/**
 * Roster assessment: every owned character with a build score, banded and
 * sorted, with the score's components on expand.
 */
import { useMemo, useState } from 'react';
import { useRoster } from '../state/roster';
import { useInventory } from '../state/inventory';
import { genshinAdapter } from '../game/genshin/adapter';
import { computeBuildScore, band, type Band } from './buildScore';
import type { Artifact } from '../game/types';

const BAND_STYLE: Record<Band, string> = {
  built: 'border-jade/40 bg-jade/10 text-jade',
  partial: 'border-flux/40 bg-flux/10 text-flux-bright',
  unbuilt: 'border-muted/40 bg-muted/10 text-muted',
};

function Row({
  characterKey,
  name,
  element,
  weaponName,
  total,
  components,
}: {
  characterKey: string;
  name: string;
  element?: string;
  weaponName?: string;
  total: number;
  components: { label: string; points: number; max: number }[];
}) {
  const [open, setOpen] = useState(false);
  const b = band(total);
  return (
    <li className="rounded-xl border border-white/10 bg-surface-700/40">
      <button
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-sm font-bold text-paper">
            {name}
          </h3>
          <p className="truncate text-xs text-muted">
            {[element, weaponName].filter(Boolean).join(' · ') ||
              'No weapon equipped'}
          </p>
        </div>
        <span className="font-mono text-lg font-bold text-accent-bright">
          {total.toFixed(0)}
        </span>
        <span
          className={`rounded-lg border px-2 py-0.5 text-[0.7rem] font-semibold ${BAND_STYLE[b]}`}
        >
          {b}
        </span>
      </button>
      {open && (
        <dl
          className="grid gap-1 border-t border-white/5 px-4 py-3 text-xs"
          data-testid={`breakdown-${characterKey}`}
        >
          {components.map((c) => (
            <div key={c.label} className="flex justify-between gap-4">
              <dt className="text-muted">{c.label}</dt>
              <dd className="font-mono text-paper">
                {c.points.toFixed(1)} / {c.max}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </li>
  );
}

/** Long rosters scroll past everything below them, so only the best-scored
 *  slice shows until the user asks for the rest. */
const COLLAPSED_COUNT = 12;

export function RosterView() {
  const entries = useRoster((s) => s.entries);
  const artifacts = useInventory((s) => s.artifacts);
  const [showAll, setShowAll] = useState(false);

  const rows = useMemo(() => {
    const byLocation: Record<string, Artifact[]> = {};
    for (const a of artifacts)
      if (a.location) (byLocation[a.location] ??= []).push(a);
    const chars = new Map(genshinAdapter.characters().map((c) => [c.key, c]));
    const weapons = new Map(genshinAdapter.weapons().map((w) => [w.key, w]));
    return Object.entries(entries)
      .map(([key, entry]) => {
        const score = computeBuildScore(entry, byLocation[key] ?? []);
        return {
          characterKey: key,
          name: chars.get(key)?.name ?? key,
          element: chars.get(key)?.element,
          weaponName: entry.weaponKey
            ? weapons.get(entry.weaponKey)?.name
            : undefined,
          total: score.total,
          components: score.components,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [entries, artifacts]);

  if (rows.length === 0) {
    return (
      <div className="panel">
        <p className="text-sm text-muted">
          Import a GOOD file to see your roster.
        </p>
      </div>
    );
  }

  const visible = showAll ? rows : rows.slice(0, COLLAPSED_COUNT);

  return (
    <div className="panel space-y-3">
      <p className="text-sm text-muted">
        <span className="font-semibold text-paper">{rows.length}</span>{' '}
        characters owned. Score weighs level, talents, weapon, and the artifacts
        each has equipped.
      </p>
      <ul className="space-y-2">
        {visible.map((r) => (
          <Row key={r.characterKey} {...r} />
        ))}
      </ul>
      {rows.length > COLLAPSED_COUNT && !showAll && (
        <button
          className="flex min-h-11 w-full items-center justify-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted transition hover:text-paper"
          onClick={() => setShowAll(true)}
        >
          <span aria-hidden="true">▶</span> Show all {rows.length} characters,
          sorted by score
        </button>
      )}
    </div>
  );
}
