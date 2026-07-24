import { useMemo } from 'react';
import { genshinAdapter } from '../game/genshin/adapter';
import { useRoster } from '../state/roster';
import { useWeaponInventory } from '../state/weapons';
import {
  GUIDES,
  bestFieldableComp,
  bestOwnedWeapon,
  formatSubstatPriority,
  resolveTeammateName,
  type TeamComp,
} from '../meta/guides';
import { InfoPanel, OptimizePanel, setRequirementLabel } from './OptimizePanel';
import { GapSection } from './GapSection';
import { Results } from './Results';
import { isPctStat, statLabel } from '../ui/labels';
import type {
  Artifact,
  OptimizeRequest,
  OptimizeResult,
  StatKey,
} from '../game/types';

const TALENT_SLOT_LABELS: Record<'auto' | 'skill' | 'burst', string> = {
  auto: 'Normal Attack',
  skill: 'Elemental Skill',
  burst: 'Elemental Burst',
};

function StatTargetsCard({ characterKey }: { characterKey: string }) {
  const guide = GUIDES[characterKey];
  if (!guide || (!guide.build?.statTargets && !guide.substats)) return null;

  const statTargets = guide.build?.statTargets;

  return (
    <InfoPanel href={guide.source}>
      <p className="mb-1.5 font-semibold text-paper">Recommended Stats</p>
      {statTargets && (
        <ul className="space-y-1">
          {(Object.entries(statTargets) as [StatKey, number][]).map(
            ([k, v]) => (
              <li key={k}>
                {statLabel(k)}: ≥{v}
                {isPctStat(k) ? '%' : ''}
              </li>
            ),
          )}
        </ul>
      )}
      {guide.substats && (
        <p className={statTargets ? 'mt-1.5' : ''}>
          Substats: {formatSubstatPriority(guide.substats)}
        </p>
      )}
    </InfoPanel>
  );
}

function WeaponRecCard({ characterKey }: { characterKey: string }) {
  const guide = GUIDES[characterKey];
  const ownedWeapons = useWeaponInventory((s) => s.weapons);
  const rosterEntries = useRoster((s) => s.entries);
  const chars = useMemo(() => genshinAdapter.characters(), []);
  const weapons = useMemo(() => genshinAdapter.weapons(), []);
  const weaponByKey = useMemo(
    () => new Map(weapons.map((w) => [w.key, w])),
    [weapons],
  );

  if (!guide?.weapons) return null;

  const equippedKey = rosterEntries[characterKey]?.weaponKey;
  const equippedName = equippedKey
    ? (weaponByKey.get(equippedKey)?.name ?? equippedKey)
    : null;
  const best = bestOwnedWeapon(characterKey, ownedWeapons);
  const sorted = [...guide.weapons].sort((a, b) => a.rank - b.rank);

  return (
    <InfoPanel href={guide.source}>
      <p className="mb-1.5 font-semibold text-paper">Weapon</p>
      {equippedName && <p>Currently equipped: {equippedName}</p>}
      {!best && (
        <p>You don&apos;t own any ranked weapon for this character yet.</p>
      )}
      {best && best.rec.weaponKey === equippedKey && (
        <p className="text-jade">Best owned weapon is already equipped.</p>
      )}
      {best && best.rec.weaponKey !== equippedKey && (
        <>
          <p>
            Switch to:{' '}
            <span className="font-medium text-paper">
              {weaponByKey.get(best.rec.weaponKey)?.name ?? best.rec.weaponKey}
            </span>{' '}
            (R{best.ownedAs.refinement})
            {best.rec.note ? ` — ${best.rec.note}` : ''}
          </p>
          {best.conflictWith && (
            <p className="mt-1 text-amber-400">
              Currently equipped on{' '}
              {resolveTeammateName(best.conflictWith, chars)}.
            </p>
          )}
        </>
      )}
      <ul className="mt-2 space-y-0.5 text-[0.7rem] text-muted/80">
        {sorted.map((rec) => (
          <li key={rec.weaponKey}>
            {rec.rank}. {weaponByKey.get(rec.weaponKey)?.name ?? rec.weaponKey}
            {rec.note ? ` — ${rec.note}` : ''}
          </li>
        ))}
      </ul>
    </InfoPanel>
  );
}

function TalentAdviceCard({ characterKey }: { characterKey: string }) {
  const guide = GUIDES[characterKey];
  const owned = useRoster((s) => s.entries[characterKey]?.talent);
  if (!guide?.talents) return null;

  const target = guide.talents;
  const out: {
    slot: 'auto' | 'skill' | 'burst';
    have: number | null;
    want: number;
  }[] = [];
  for (const slot of target.priority) {
    const want = target.levels[slot];
    const have = owned?.[slot] ?? null;
    if (have === null || have < want) out.push({ slot, have, want });
  }

  return (
    <InfoPanel href={guide.source}>
      <p className="mb-1.5 font-semibold text-paper">Talents</p>
      {out.length === 0 && <p className="text-jade">Talents at target ✓</p>}
      {out.length > 0 && (
        <ul className="space-y-1">
          {out.map((g) => (
            <li key={g.slot}>
              {TALENT_SLOT_LABELS[g.slot]}: {g.have ?? '?'} → {g.want}
            </li>
          ))}
        </ul>
      )}
    </InfoPanel>
  );
}

function ConstellationCard({ characterKey }: { characterKey: string }) {
  const guide = GUIDES[characterKey];
  const owned = useRoster((s) => s.entries[characterKey]?.constellation);
  if (!guide?.constellations) return null;

  return (
    <InfoPanel href={guide.source}>
      <p className="mb-1.5 font-semibold text-paper">Constellations</p>
      <ul className="space-y-1">
        {guide.constellations.map((c) => {
          const have = owned != null && owned >= c.level;
          return (
            <li key={c.level} className={have ? 'text-jade' : undefined}>
              {have ? '✓' : '·'} C{c.level}: {c.note}
            </li>
          );
        })}
      </ul>
      {owned == null && (
        <p className="mt-1.5 text-muted/70">
          Import a GOOD file with constellation data to see what you own.
        </p>
      )}
    </InfoPanel>
  );
}

function teammateGear(
  characterKey: string,
  ownedWeapons: ReturnType<typeof useWeaponInventory.getState>['weapons'],
  weaponByKey: Map<string, { name: string }>,
): string | null {
  const guide = GUIDES[characterKey];
  const parts: string[] = [];
  const owned = bestOwnedWeapon(characterKey, ownedWeapons);
  const ranked = guide?.weapons
    ? [...guide.weapons].sort((a, b) => a.rank - b.rank)
    : null;
  const weaponKey = owned?.rec.weaponKey ?? ranked?.[0]?.weaponKey;
  if (weaponKey) parts.push(weaponByKey.get(weaponKey)?.name ?? weaponKey);
  if (guide?.build) parts.push(setRequirementLabel(guide.build));
  return parts.length ? parts.join(' · ') : null;
}

function TeamCompCard({ characterKey }: { characterKey: string }) {
  const guide = GUIDES[characterKey];
  const rosterEntries = useRoster((s) => s.entries);
  const ownedWeapons = useWeaponInventory((s) => s.weapons);
  const chars = useMemo(() => genshinAdapter.characters(), []);
  const weapons = useMemo(() => genshinAdapter.weapons(), []);
  const weaponByKey = useMemo(
    () => new Map(weapons.map((w) => [w.key, w])),
    [weapons],
  );
  const ownedKeys = useMemo(
    () => new Set(Object.keys(rosterEntries)),
    [rosterEntries],
  );
  if (!guide?.teams) return null;

  const best = bestFieldableComp(guide.teams, ownedKeys);
  if (!best) return null;

  const alternatives = guide.teams.filter((c) => c !== best.comp);

  function renderComp(comp: TeamComp, filled: (string | null)[]) {
    return (
      <ul className="space-y-1">
        {comp.slots.map((slot, i) => {
          const key = filled[i];
          const displayKey = key ?? slot.options[0];
          const gear = teammateGear(displayKey, ownedWeapons, weaponByKey);
          return (
            <li key={slot.role}>
              <span className="text-muted">({slot.role})</span>{' '}
              {key ? (
                <span className="font-medium text-paper">
                  {resolveTeammateName(key, chars)}
                </span>
              ) : (
                <span>
                  you don&apos;t own {resolveTeammateName(displayKey, chars)}
                </span>
              )}
              {gear && (
                <span className="block pl-3 text-[0.7rem] text-muted/70">
                  {gear}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <InfoPanel href={guide.source}>
      <p className="mb-1.5 font-semibold text-paper">{best.comp.name}</p>
      {renderComp(best.comp, best.filled)}
      {alternatives.length > 0 && (
        <div className="mt-3 border-t border-white/5 pt-2">
          <p className="text-[0.65rem] uppercase tracking-wide text-muted">
            Alternatives
          </p>
          {alternatives.map((alt) => {
            const altResult = bestFieldableComp([alt], ownedKeys)!;
            return (
              <div key={alt.name} className="mt-2">
                <p className="text-paper">{alt.name}</p>
                {renderComp(alt, altResult.filled)}
              </div>
            );
          })}
        </div>
      )}
    </InfoPanel>
  );
}

export function CharacterDetail({
  characterKey,
  onBack,
  onRun,
  running,
  result,
  request,
  artifacts,
  artifactsById,
  sharedArtifacts,
}: {
  characterKey: string;
  onBack: () => void;
  onRun: () => void | Promise<void>;
  running: boolean;
  result: OptimizeResult | null;
  request: OptimizeRequest | null;
  artifacts: Artifact[];
  artifactsById: Record<string, Artifact>;
  sharedArtifacts: Artifact[] | null;
}) {
  const char = genshinAdapter.character(characterKey);
  const guide = GUIDES[characterKey];

  return (
    <div className="space-y-5 animate-fade-up">
      <button type="button" className="btn-ghost" onClick={onBack}>
        ← Your roster
      </button>

      <div>
        <h2 className="font-display text-xl font-bold text-paper">
          {char?.name ?? characterKey}
        </h2>
        <p className="text-xs text-muted">
          {char?.element ?? ''}
          {guide?.role ? ` · ${guide.role}` : ''}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <StatTargetsCard characterKey={characterKey} />
        <WeaponRecCard characterKey={characterKey} />
        <TalentAdviceCard characterKey={characterKey} />
        <ConstellationCard characterKey={characterKey} />
      </div>
      <TeamCompCard characterKey={characterKey} />

      <OptimizePanel onRun={onRun} running={running} />

      {result && request && (
        <div id="results-section">
          <GapSection
            result={result}
            request={request}
            artifacts={artifacts}
            sharedArtifacts={sharedArtifacts}
          />
          <Results
            result={result}
            request={request}
            artifactsById={artifactsById}
          />
        </div>
      )}
    </div>
  );
}
