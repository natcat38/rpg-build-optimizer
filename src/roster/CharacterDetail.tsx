/**
 * Drawer body for one character: what they have, what the meta wants, and
 * which curated teams they slot into. Tabs are hand-rolled ARIA — the app has
 * no primitives library and this doesn't justify one.
 * @packageDocumentation
 */
import { useMemo, useState, type KeyboardEvent } from 'react';
import { genshinAdapter } from '../game/genshin/adapter';
import { computeBuildScore } from './buildScore';
import { META_TARGETS } from '../meta/metaTargets';
import { COMP_ARCHETYPES } from '../teams/comps';
import { ROLE_LABELS } from '../teams/types';
import { getDamageProfile } from '../damage/profiles';
import {
  formatSetName,
  statLabel,
  objectiveHint,
  objectiveLabel,
  SLOT_LABELS,
} from '../ui/labels';
import type { RosterEntry } from '../import/good';
import type { Artifact, SetRequirement, Slot, StatKey } from '../game/types';
import { SLOTS } from '../game/types';

const TABS = ['Overview', 'Gear', 'Recommended', 'Teams'] as const;
type Tab = (typeof TABS)[number];

function setReqLabel(r: SetRequirement): string {
  if (r.kind === '4pc') return `4pc ${formatSetName(r.setKey)}`;
  if (r.kind === '2pc') return `2pc ${formatSetName(r.setKey)}`;
  return `2pc ${formatSetName(r.setKeys[0])} + 2pc ${formatSetName(r.setKeys[1])}`;
}

export function CharacterDetail({
  characterKey,
  entry,
  artifacts,
}: {
  characterKey: string;
  entry: RosterEntry;
  /** The pieces this character currently has equipped. */
  artifacts: Artifact[];
}) {
  const [tab, setTab] = useState<Tab>('Overview');
  const char = genshinAdapter.character(characterKey);
  const names = useMemo(
    () => new Map(genshinAdapter.characters().map((c) => [c.key, c.name])),
    [],
  );
  const weaponName = useMemo(() => {
    if (!entry.weaponKey) return undefined;
    return genshinAdapter.weapons().find((w) => w.key === entry.weaponKey)
      ?.name;
  }, [entry.weaponKey]);
  const score = useMemo(
    () => computeBuildScore(entry, artifacts),
    [entry, artifacts],
  );
  const meta = META_TARGETS[characterKey];
  const comps = useMemo(
    () =>
      COMP_ARCHETYPES.filter((a) =>
        a.slots.some((s) =>
          s.options.some((o) => o.characterKey === characterKey),
        ),
      ),
    [characterKey],
  );

  function onKeys(e: KeyboardEvent) {
    const i = TABS.indexOf(tab);
    if (e.key === 'ArrowRight') setTab(TABS[(i + 1) % TABS.length]);
    if (e.key === 'ArrowLeft')
      setTab(TABS[(i + TABS.length - 1) % TABS.length]);
  }

  return (
    <div className="space-y-4">
      {/* Segmented control — the app's one sanctioned "pick one of N views"
          idiom. Deliberately unnumbered: numbered badges mark real sequences
          (the page steps), and this is a menu. */}
      <div
        role="tablist"
        aria-label="Character detail"
        className="flex gap-1 rounded-lg border border-white/10 bg-surface-900/60 p-1"
        onKeyDown={onKeys}
      >
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            tabIndex={tab === t ? 0 : -1}
            onClick={() => setTab(t)}
            className={`min-h-11 flex-1 rounded-md px-3 text-sm font-semibold transition ${
              tab === t
                ? 'bg-accent/15 text-accent-bright'
                : 'text-muted hover:text-paper'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="space-y-3 text-sm">
        {tab === 'Overview' && (
          <>
            <p className="text-muted">
              {[char?.element, weaponName ?? 'No weapon equipped']
                .filter(Boolean)
                .join(' · ')}
              {entry.level != null && ` · Lv ${entry.level}`}
              {entry.constellation != null && ` · C${entry.constellation}`}
            </p>
            <p className="font-mono text-3xl font-bold text-accent-bright">
              {score.total.toFixed(0)}
              <span className="text-base text-muted"> / 100</span>
            </p>
            <dl className="grid gap-1 text-xs">
              {score.components.map((c) => (
                <div key={c.label} className="flex justify-between gap-4">
                  <dt className="text-muted">{c.label}</dt>
                  <dd className="font-mono text-paper">
                    {c.points.toFixed(1)} / {c.max}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="text-xs text-muted">
              {objectiveHint(meta?.objective ?? 'crit_value')}
            </p>
          </>
        )}

        {tab === 'Gear' && (
          <ul className="space-y-1.5">
            {SLOTS.map((s) => {
              const a = artifacts.find((x) => x.slot === s);
              return (
                <li key={s} className="well px-3 py-2">
                  <span className="mr-2 text-xs uppercase text-muted">
                    {SLOT_LABELS[s]}
                  </span>
                  {a ? (
                    <span>
                      {formatSetName(a.setKey)} · {statLabel(a.mainStat)}{' '}
                      <span className="font-mono text-xs">+{a.level}</span>
                    </span>
                  ) : (
                    <span className="text-muted">empty</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {tab === 'Recommended' &&
          (meta ? (
            <>
              <p>
                <span className="text-muted">Set:</span>{' '}
                {setReqLabel(meta.setRequirement)}
              </p>
              {Object.entries(meta.mains).map(([slot, stat]) => (
                <p key={slot}>
                  <span className="text-muted">
                    {SLOT_LABELS[slot as Slot]}:
                  </span>{' '}
                  {statLabel(stat)}
                </p>
              ))}
              {meta.erTarget && (
                <p>
                  <span className="text-muted">ER floor:</span> {meta.erTarget}%
                </p>
              )}
              {meta.statTargets && (
                <p className="text-xs text-muted">
                  Endgame targets:{' '}
                  {Object.entries(meta.statTargets)
                    .map(([k, v]) => `${statLabel(k as StatKey)} ${v}`)
                    .join(', ')}
                </p>
              )}
              <a
                className="text-xs text-flux-bright underline"
                href={meta.source}
                target="_blank"
                rel="noreferrer"
              >
                Source guide (KQM)
                <span className="sr-only"> (opens in new tab)</span>
              </a>
              {!getDamageProfile(characterKey) && (
                <p className="text-xs text-muted">
                  No curated damage profile yet — builds for this character are
                  ranked by {objectiveLabel(meta.objective)} instead of
                  estimated damage.
                </p>
              )}
            </>
          ) : (
            <p className="text-muted">
              No curated recipe for this character yet.
            </p>
          ))}

        {tab === 'Teams' &&
          (comps.length ? (
            <ul className="space-y-2">
              {comps.map((a) => (
                <li key={a.id} className="well px-3 py-2">
                  <p className="font-semibold text-paper">{a.name}</p>
                  <p className="text-xs text-muted">{a.notes}</p>
                  <p className="mt-1 text-xs text-muted">
                    {a.slots
                      .map((s) => {
                        const k = s.options[0]?.characterKey;
                        return `${ROLE_LABELS[s.role]}: ${k ? (names.get(k) ?? k) : '—'}`;
                      })
                      .join(' · ')}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">Not in any curated team archetype yet.</p>
          ))}
      </div>
    </div>
  );
}
