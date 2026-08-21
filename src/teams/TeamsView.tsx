/**
 * Team recommendations for endgame content. Abyss is the only mode wired up;
 * Theater and Stygian are shown as coming soon so the shape of the feature is
 * visible without pretending they work.
 */
import { useMemo } from 'react';
import { useRoster } from '../state/roster';
import { useInventory } from '../state/inventory';
import { genshinAdapter, PATCH } from '../game/genshin/adapter';
import { band, rosterBuildScores } from '../roster/buildScore';
import { getArchetype, archetypeName } from './comps';
import {
  recommendAbyss,
  type TeamInstance,
  type ArchetypeGap,
} from './recommend';
import { BAND_STYLE, formatScore, ROLE_LABELS } from '../labels';
import type { EndgameMode } from './types';

const MODES: { id: EndgameMode; label: string; live: boolean }[] = [
  { id: 'abyss', label: 'Spiral Abyss', live: true },
  { id: 'theater', label: 'Imaginarium Theater', live: false },
  { id: 'stygian', label: 'Stygian Onslaught', live: false },
];

function TeamCard({ title, team }: { title: string; team: TeamInstance }) {
  const arch = getArchetype(team.archetypeId);
  return (
    <div
      data-testid="team-card"
      className="rounded-xl border border-white/10 bg-surface-700/40 p-4"
    >
      <p className="text-[0.7rem] uppercase tracking-[0.18em] text-muted">
        {title}
      </p>
      <h3 className="font-display text-base font-bold text-paper">
        {archetypeName(team.archetypeId)}
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
                {genshinAdapter.characterName(m.characterKey)}
              </span>
              <span className="text-xs text-muted">{ROLE_LABELS[m.role]}</span>
              <span className="font-mono text-xs text-muted">
                {formatScore(m.buildScore, 0)}
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

function GapList({ gaps }: { gaps: ArchetypeGap[] }) {
  if (gaps.length === 0) return null;
  return (
    <div className="border-t border-white/5 pt-4">
      <p className="text-[0.7rem] uppercase tracking-[0.18em] text-muted">
        One character short
      </p>
      <ul className="mt-2 space-y-1 text-sm">
        {gaps.slice(0, 5).map((g) => (
          <li key={g.archetypeId} className="text-muted">
            <span className="font-semibold text-paper">
              {archetypeName(g.archetypeId)}
            </span>{' '}
            is missing its {ROLE_LABELS[g.missingRole].toLowerCase()} —{' '}
            {g.candidates
              .slice(0, 3)
              .map((c) => genshinAdapter.characterName(c))
              .join(', ')}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TeamsView() {
  const entries = useRoster((s) => s.entries);
  const artifacts = useInventory((s) => s.artifacts);

  const rec = useMemo(
    () => recommendAbyss(rosterBuildScores(entries, artifacts)),
    [entries, artifacts],
  );

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
                  ? 'border-white/15 text-paper has-[:checked]:border-accent/60 has-[:checked]:bg-accent/10 has-[:checked]:text-accent-bright has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent/50'
                  : 'cursor-not-allowed border-white/5 text-muted has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-white/30'
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

      <p className="text-xs text-muted">
        Curated from KQM guides for patch {PATCH} — Abyss blessings change each
        patch, so treat these as archetypes, not answers.
      </p>

      {rec.teams ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <TeamCard title="First half" team={rec.teams[0]} />
          <TeamCard title="Second half" team={rec.teams[1]} />
        </div>
      ) : (
        <p className="text-sm text-muted">
          {Object.keys(entries).length === 0
            ? 'Import a GOOD file to see recommended teams.'
            : "Your roster can't field two disjoint teams from the curated archetypes yet."}
        </p>
      )}

      <GapList gaps={rec.gaps} />
    </div>
  );
}
