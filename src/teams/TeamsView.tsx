/**
 * Team recommendations for endgame content. Abyss is the only mode wired up;
 * Theater and Stygian are shown as coming soon so the shape of the feature is
 * visible without pretending they work.
 */
import { useMemo } from 'react';
import { useRoster } from '../state/roster';
import { useInventory } from '../state/inventory';
import { genshinAdapter } from '../game/genshin/adapter';
import { computeBuildScore, band, BAND_STYLE } from '../roster/buildScore';
import { COMP_ARCHETYPES } from './comps';
import {
  recommendAbyss,
  type TeamInstance,
  type ArchetypeGap,
} from './recommend';
import type { Artifact } from '../game/types';
import { ROLE_LABELS } from './types';
import type { EndgameMode } from './types';

const MODES: { id: EndgameMode; label: string; live: boolean }[] = [
  { id: 'abyss', label: 'Spiral Abyss', live: true },
  { id: 'theater', label: 'Imaginarium Theater', live: false },
  { id: 'stygian', label: 'Stygian Onslaught', live: false },
];

function useCharacterNames() {
  return useMemo(
    () => new Map(genshinAdapter.characters().map((c) => [c.key, c.name])),
    [],
  );
}

function TeamCard({
  title,
  team,
  names,
}: {
  title: string;
  team: TeamInstance;
  names: Map<string, string>;
}) {
  const arch = COMP_ARCHETYPES.find((a) => a.id === team.archetypeId);
  return (
    <div
      data-testid="team-card"
      className="rounded-xl border border-white/10 bg-surface-700/40 p-4"
    >
      <p className="text-[0.7rem] uppercase tracking-[0.18em] text-muted">
        {title}
      </p>
      <h3 className="font-display text-base font-bold text-paper">
        {arch?.name ?? team.archetypeId}
      </h3>
      {arch && <p className="mt-1 text-xs text-muted">{arch.notes}</p>}
      <ul className="mt-3 space-y-2">
        {team.members.map((m) => {
          const b = band(m.buildScore);
          return (
            <li
              key={m.characterKey}
              data-testid="team-member"
              className="flex items-center gap-3 text-sm"
            >
              <span className="min-w-0 flex-1 truncate font-semibold text-paper">
                {names.get(m.characterKey) ?? m.characterKey}
              </span>
              <span className="text-xs text-muted">{ROLE_LABELS[m.role]}</span>
              <span className="font-mono text-xs text-muted">
                {m.buildScore.toFixed(0)}
              </span>
              <span
                className={`rounded-lg border px-2 py-0.5 text-[0.7rem] font-semibold ${BAND_STYLE[b]}`}
              >
                {b}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function GapList({
  gaps,
  names,
}: {
  gaps: ArchetypeGap[];
  names: Map<string, string>;
}) {
  if (gaps.length === 0) return null;
  return (
    <div className="border-t border-white/5 pt-4">
      <p className="text-[0.7rem] uppercase tracking-[0.18em] text-muted">
        One character short
      </p>
      <ul className="mt-2 space-y-1 text-sm">
        {gaps.slice(0, 5).map((g) => {
          const arch = COMP_ARCHETYPES.find((a) => a.id === g.archetypeId);
          return (
            <li key={g.archetypeId} className="text-muted">
              <span className="font-semibold text-paper">
                {arch?.name ?? g.archetypeId}
              </span>{' '}
              is missing its {ROLE_LABELS[g.missingRole].toLowerCase()} —{' '}
              {g.candidates
                .map((c) => names.get(c) ?? c)
                .slice(0, 3)
                .join(', ')}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function TeamsView() {
  const entries = useRoster((s) => s.entries);
  const artifacts = useInventory((s) => s.artifacts);
  const names = useCharacterNames();

  const rec = useMemo(() => {
    const byLocation: Record<string, Artifact[]> = {};
    for (const a of artifacts)
      if (a.location) (byLocation[a.location] ??= []).push(a);
    const scores: Record<string, number> = {};
    for (const [key, entry] of Object.entries(entries))
      scores[key] = computeBuildScore(entry, byLocation[key] ?? []).total;
    return recommendAbyss(scores);
  }, [entries, artifacts]);

  return (
    <div className="panel space-y-4">
      <fieldset className="flex flex-wrap gap-4">
        <legend className="field-label">Endgame mode</legend>
        {MODES.map((m) => (
          <label
            key={m.id}
            className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm transition
              ${
                m.live
                  ? 'border-white/15 text-paper has-[:checked]:border-accent/60 has-[:checked]:bg-accent/10 has-[:checked]:text-accent-bright'
                  : 'cursor-not-allowed border-white/5 text-muted'
              }`}
          >
            <input
              type="radio"
              name="endgame-mode"
              value={m.id}
              defaultChecked={m.live}
              disabled={!m.live}
              className="sr-only"
              aria-label={m.label}
            />
            {m.label}
            {!m.live && ' (coming soon)'}
          </label>
        ))}
      </fieldset>

      {rec.teams ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <TeamCard title="First half" team={rec.teams[0]} names={names} />
          <TeamCard title="Second half" team={rec.teams[1]} names={names} />
        </div>
      ) : (
        <p className="text-sm text-muted">
          {Object.keys(entries).length === 0
            ? 'Import a GOOD file to see recommended teams.'
            : "Your roster can't field two disjoint teams from the curated archetypes yet."}
        </p>
      )}

      <GapList gaps={rec.gaps} names={names} />
    </div>
  );
}
