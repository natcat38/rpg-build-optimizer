import { useEffect, useMemo, useState } from 'react';
import { genshinAdapter } from '../game/genshin/adapter';
import { useRoster } from '../state/roster';
import { useInventory } from '../state/inventory';
import { useWeaponInventory } from '../state/weapons';
import { GUIDES, buildMetaRequest } from '../meta/guides';
import { gradeBuild, type Grade } from '../meta/grade';
import { optimize } from '../workers/optimizeClient';
import { useBuildCache } from '../state/buildCache';

const GRADE_ORDER: Grade[] = ['S', 'A', 'B', 'C', 'D'];

const GRADE_CLASSES: Record<Grade, string> = {
  S: 'border-accent-bright/40 bg-accent-bright/10 text-accent-bright',
  A: 'border-jade/40 bg-jade/10 text-jade',
  B: 'border-flux-bright/40 bg-flux-bright/10 text-flux-bright',
  C: 'border-white/20 bg-white/5 text-muted',
  D: 'border-rose/30 bg-rose/10 text-rose',
};

/** Progressive, sequential (concurrency=1) grading of every owned+curated
 *  character, so the dashboard fills in card-by-card instead of blocking on
 *  a batch. See ADR-0016 for why this isn't a persistent-worker pool. */
export function RosterDashboard({
  onSelect,
}: {
  onSelect: (characterKey: string) => void;
}) {
  const rosterEntries = useRoster((s) => s.entries);
  const artifacts = useInventory((s) => s.artifacts);
  const ownedWeapons = useWeaponInventory((s) => s.weapons);
  const characters = useMemo(() => genshinAdapter.characters(), []);
  const charByKey = useMemo(
    () => new Map(characters.map((c) => [c.key, c])),
    [characters],
  );
  const weaponByKey = useMemo(
    () => new Map(genshinAdapter.weapons().map((w) => [w.key, w])),
    [],
  );

  const [grades, setGrades] = useState<Record<string, Grade | 'infeasible'>>(
    {},
  );

  const ownedKeys = useMemo(() => Object.keys(rosterEntries), [rosterEntries]);

  useEffect(() => {
    let cancelled = false;
    setGrades({});
    void (async () => {
      for (const key of ownedKeys) {
        const meta = GUIDES[key]?.build;
        if (!meta?.statTargets) continue; // nothing to grade — no compute
        const entry = rosterEntries[key];
        const req = buildMetaRequest(key, meta, entry, ownedWeapons);
        if (!req) continue; // no sane request without a weapon

        // ponytail: sequential fresh-worker dispatch (~10-50ms each); a
        // persistent-worker batch protocol is only worth it if this
        // visibly lags at high curation coverage.
        const result = await optimize(req, artifacts);
        if (cancelled) return;
        useBuildCache.getState().setBuild(key, {
          request: req,
          result,
          artifacts,
          ownedWeapons,
          rosterEntries,
        });
        if (result.status === 'ok' && result.builds[0]) {
          const g = gradeBuild(result.builds[0].totals, meta.statTargets);
          setGrades((prev) => ({ ...prev, [key]: g?.grade ?? 'infeasible' }));
        } else {
          setGrades((prev) => ({ ...prev, [key]: 'infeasible' }));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ownedKeys, rosterEntries, artifacts, ownedWeapons]);

  const sorted = useMemo(() => {
    const rank = (key: string) => {
      const g = grades[key];
      if (g && g !== 'infeasible') return GRADE_ORDER.indexOf(g);
      if (g === 'infeasible') return GRADE_ORDER.length;
      if (GUIDES[key]?.build?.statTargets) return GRADE_ORDER.length + 1; // curated, pending
      return GRADE_ORDER.length + 2; // uncurated
    };
    return [...ownedKeys].sort((a, b) => {
      const r = rank(a) - rank(b);
      if (r !== 0) return r;
      const nameA = charByKey.get(a)?.name ?? a;
      const nameB = charByKey.get(b)?.name ?? b;
      return nameA.localeCompare(nameB);
    });
  }, [ownedKeys, grades, charByKey]);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {sorted.map((key) => {
        const char = charByKey.get(key);
        const entry = rosterEntries[key];
        const grade = grades[key];
        const weaponName = entry?.weaponKey
          ? (weaponByKey.get(entry.weaponKey)?.name ?? entry.weaponKey)
          : null;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            className="panel flex items-center justify-between gap-3 text-left transition hover:border-accent/40"
          >
            <div>
              <p className="font-display text-sm font-bold text-paper">
                {char?.name ?? key}
              </p>
              <p className="text-xs text-muted">
                {char?.element ?? ''}
                {entry?.buildLevel ? ` · Lv. ${entry.buildLevel}` : ''}
              </p>
              {weaponName && (
                <p className="mt-0.5 text-xs text-muted">{weaponName}</p>
              )}
            </div>
            {grade && grade !== 'infeasible' && (
              <span
                className={`rounded-full border px-2 py-1 font-mono text-xs font-bold ${GRADE_CLASSES[grade]}`}
              >
                {grade}
              </span>
            )}
            {grade === 'infeasible' && (
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[0.65rem] text-muted">
                no feasible build
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
