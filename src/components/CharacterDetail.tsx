import { useMemo } from 'react';
import { genshinAdapter } from '../game/genshin/adapter';
import { useRoster } from '../state/roster';
import { useWeaponInventory } from '../state/weapons';
import { WEAPON_RANKINGS, bestOwnedWeapon } from '../meta/weapons';
import { TALENT_TARGETS, talentGaps } from '../meta/talents';
import { TEAM_COMPS, bestFieldableComp, resolveTeammateName } from '../meta/teamComps';
import { InfoPanel, OptimizePanel } from './OptimizePanel';
import { GapSection } from './GapSection';
import { Results } from './Results';
import type { Artifact, OptimizeRequest, OptimizeResult } from '../game/types';

const TALENT_SLOT_LABELS: Record<'auto' | 'skill' | 'burst', string> = {
  auto: 'Normal Attack',
  skill: 'Elemental Skill',
  burst: 'Elemental Burst',
};

function WeaponRecCard({ characterKey }: { characterKey: string }) {
  const table = WEAPON_RANKINGS[characterKey];
  const ownedWeapons = useWeaponInventory((s) => s.weapons);
  const rosterEntries = useRoster((s) => s.entries);
  const chars = useMemo(() => genshinAdapter.characters(), []);
  const weapons = useMemo(() => genshinAdapter.weapons(), []);
  const weaponByKey = useMemo(
    () => new Map(weapons.map((w) => [w.key, w])),
    [weapons],
  );

  if (!table) return null;

  const equippedKey = rosterEntries[characterKey]?.weaponKey;
  const equippedName = equippedKey
    ? (weaponByKey.get(equippedKey)?.name ?? equippedKey)
    : null;
  const best = bestOwnedWeapon(characterKey, ownedWeapons);

  return (
    <InfoPanel href={table.source}>
      <p className="mb-1.5 font-semibold text-paper">Weapon</p>
      {equippedName && <p>Currently equipped: {equippedName}</p>}
      {!best && <p>You don&apos;t own any ranked weapon for this character yet.</p>}
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
    </InfoPanel>
  );
}

function TalentAdviceCard({ characterKey }: { characterKey: string }) {
  const entry = TALENT_TARGETS[characterKey];
  const owned = useRoster((s) => s.entries[characterKey]?.talent);
  if (!entry) return null;

  const gaps = talentGaps(entry.target, owned);

  return (
    <InfoPanel href={entry.source}>
      <p className="mb-1.5 font-semibold text-paper">Talents</p>
      {gaps.length === 0 && (
        <p className="text-jade">Talents at target ✓</p>
      )}
      {gaps.length > 0 && (
        <ul className="space-y-1">
          {gaps.map((g) => (
            <li key={g.slot}>
              {TALENT_SLOT_LABELS[g.slot]}: {g.have ?? '?'} → {g.want}
            </li>
          ))}
        </ul>
      )}
    </InfoPanel>
  );
}

function TeamCompCard({ characterKey }: { characterKey: string }) {
  const entry = TEAM_COMPS[characterKey];
  const rosterEntries = useRoster((s) => s.entries);
  const chars = useMemo(() => genshinAdapter.characters(), []);
  const ownedKeys = useMemo(
    () => new Set(Object.keys(rosterEntries)),
    [rosterEntries],
  );
  if (!entry) return null;

  const result = bestFieldableComp(entry.comps, ownedKeys);
  if (!result) return null;

  return (
    <InfoPanel href={entry.source}>
      <p className="mb-1.5 font-semibold text-paper">{result.comp.name}</p>
      <ul className="space-y-1">
        {result.comp.slots.map((slot, i) => {
          const filled = result.filled[i];
          return (
            <li key={slot.role}>
              <span className="text-muted">({slot.role})</span>{' '}
              {filled ? (
                <span className="font-medium text-paper">
                  {resolveTeammateName(filled, chars)}
                </span>
              ) : (
                <span>
                  you don&apos;t own{' '}
                  {resolveTeammateName(slot.options[0], chars)}
                </span>
              )}
            </li>
          );
        })}
      </ul>
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

  return (
    <div className="space-y-5 animate-fade-up">
      <button type="button" className="btn-ghost" onClick={onBack}>
        ← Your roster
      </button>

      <div>
        <h2 className="font-display text-xl font-bold text-paper">
          {char?.name ?? characterKey}
        </h2>
        {char && <p className="text-xs text-muted">{char.element}</p>}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <WeaponRecCard characterKey={characterKey} />
        <TalentAdviceCard characterKey={characterKey} />
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
          <Results result={result} request={request} artifactsById={artifactsById} />
        </div>
      )}
    </div>
  );
}
