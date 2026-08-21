/**
 * Roster assessment: every owned character with a build score, banded and
 * sorted. A row opens the character's detail drawer.
 */
import { useMemo, useState } from 'react';
import { useRoster } from '../state/roster';
import { useInventory } from '../state/inventory';
import { useOptimizeRequest } from '../state/optimizeRequest';
import { genshinAdapter } from '../game/genshin/adapter';
import { computeBuildScore, band, groupByLocation } from './buildScore';
import { AppDrawer } from '../components/ui/Drawer';
import { CharacterDetail } from './CharacterDetail';
import { scrollToId } from '../ui/scroll';
import { BAND_STYLE, formatScore } from '../labels';

function Row({
  characterKey,
  name,
  element,
  weaponName,
  total,
  onOpen,
}: {
  characterKey: string;
  name: string;
  element?: string;
  weaponName?: string;
  total: number;
  onOpen: (characterKey: string) => void;
}) {
  const b = band(total);
  return (
    <li className="rounded-xl border border-white/10 bg-surface-700/40">
      <button
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
        onClick={() => onOpen(characterKey)}
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
        <div className="flex-none">
          <span className="font-mono text-lg font-bold text-accent-bright">
            {formatScore(total, 0)}
          </span>
          {/* The number is the accessible value; this is the same figure again. */}
          <div
            aria-hidden="true"
            className="mt-0.5 h-0.5 w-12 overflow-hidden rounded-full bg-white/5"
          >
            <div
              className="h-full rounded-full bg-accent/60"
              style={{ width: `${Math.min(Math.max(total, 0), 100)}%` }}
            />
          </div>
        </div>
        <span
          className={`rounded-lg border px-2 py-0.5 text-[0.7rem] font-semibold ${BAND_STYLE[b]}`}
        >
          {b}
        </span>
      </button>
    </li>
  );
}

/** Long rosters scroll past everything below them, so only the best-scored
 *  slice shows until the user asks for the rest. */
const COLLAPSED_COUNT = 12;

/** Long enough to outlast vaul's close animation and its scroll-lock release. */
const DRAWER_EXIT_MS = 400;

export function RosterView() {
  const entries = useRoster((s) => s.entries);
  const artifacts = useInventory((s) => s.artifacts);
  const [showAll, setShowAll] = useState(false);
  const [openKey, setOpenKey] = useState<string | null>(null);

  const byLocation = useMemo(() => groupByLocation(artifacts), [artifacts]);

  const rows = useMemo(
    () =>
      Object.entries(entries)
        .map(([key, entry]) => ({
          characterKey: key,
          name: genshinAdapter.characterName(key),
          element: genshinAdapter.character(key)?.element,
          weaponName: entry.weaponKey
            ? genshinAdapter.weapon(entry.weaponKey)?.name
            : undefined,
          total: computeBuildScore(entry, byLocation[key] ?? []).total,
        }))
        .sort((a, b) => b.total - a.total),
    [entries, byLocation],
  );

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
  const openEntry = openKey ? entries[openKey] : undefined;

  return (
    <div className="panel space-y-3">
      <p className="text-sm text-muted">
        <span className="font-semibold text-paper">{rows.length}</span>{' '}
        characters owned. Score weighs level, talents, weapon, and the artifacts
        each has equipped.
      </p>
      <ul className="space-y-2">
        {visible.map((r) => (
          <Row key={r.characterKey} {...r} onOpen={setOpenKey} />
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

      {openKey && openEntry && (
        <AppDrawer
          open
          onClose={() => setOpenKey(null)}
          title={rows.find((r) => r.characterKey === openKey)?.name ?? openKey}
        >
          <CharacterDetail
            characterKey={openKey}
            entry={openEntry}
            artifacts={byLocation[openKey] ?? []}
          />
          <button
            className="btn-primary mt-4 w-full"
            onClick={() => {
              const s = useOptimizeRequest.getState();
              s.setCharacterKey(openKey);
              const w = openEntry.weaponKey;
              if (w) s.setWeaponKey(w);
              setOpenKey(null);
              // The drawer holds a body scroll lock (overflow:hidden) until it
              // has finished animating out, so scrolling synchronously here is
              // a no-op. ponytail: fixed delay rather than watching for the
              // lock to lift — revisit if vaul's exit timing changes.
              setTimeout(() => scrollToId('step-optimise'), DRAWER_EXIT_MS);
            }}
          >
            Optimise this character
          </button>
        </AppDrawer>
      )}
    </div>
  );
}
