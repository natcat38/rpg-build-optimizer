import { useState, type ChangeEvent } from 'react';
import { parseGOOD, parseGOODRoster } from '../import/good';
import { fetchUidArtifacts, type UidError } from '../import/uid';
import { mergeNew } from '../import/dedupe';
import { useInventory } from '../state/inventory';
import { useRoster } from '../state/roster';
import { scrollToId } from '../ui/scroll';
import { Callout } from './ui/Callout';
import type { Artifact } from '../game/types';

// WCAG 3.3.1: describe what actually went wrong. fetchUidArtifacts already
// distinguishes the three cases; collapsing them into one message left the
// user guessing which of three unrelated fixes to try.
const UID_ERRORS: Record<UidError['error'], string> = {
  NETWORK:
    "Couldn't reach Enka — check your connection and try again in a moment.",
  NOT_FOUND: "Couldn't find that UID — check the digits and your server.",
  NO_SHOWCASE:
    'No artifacts on showcase — turn on Character Showcase in-game and add characters to it.',
};

export function ImportPanel() {
  const artifacts = useInventory((s) => s.artifacts);
  const addMany = useInventory((s) => s.addMany);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [uid, setUid] = useState('');
  const [busy, setBusy] = useState(false);

  function mergeDedupe(incoming: Artifact[], suffix = '') {
    // Read live state rather than the render-time `artifacts` closure: onFile
    // and onUid are both async, so a second import can otherwise dedupe
    // against a snapshot that predates the first import's commit.
    const fresh = mergeNew(useInventory.getState().artifacts, incoming);
    addMany(fresh);
    setErr(null);
    setMsg(`Imported ${fresh.length} artifacts.${suffix}`);
  }

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const json = JSON.parse(await file.text()) as unknown;
      const out = parseGOOD(json);
      if ('error' in out) {
        setMsg(null);
        setErr(
          "That file isn't a recognised inventory export. Expected a GOOD-format .json.",
        );
        return;
      }
      const roster = parseGOODRoster(json);
      const rosterCount = Object.keys(roster).length;
      if (rosterCount > 0) {
        useRoster.getState().setRoster(roster);
        // The roster section renders below the fold; without a nudge the user
        // sees an unchanged import panel and assumes nothing happened.
        setTimeout(() => scrollToId('step-roster'), 150);
      }
      mergeDedupe(
        out,
        rosterCount > 0 ? ` Roster: ${rosterCount} characters.` : '',
      );
    } catch {
      setMsg(null);
      setErr(
        "That file isn't a recognised inventory export. Expected a GOOD-format .json.",
      );
    }
  }

  async function onUid() {
    setBusy(true);
    setMsg(null);
    setErr(null);
    const out = await fetchUidArtifacts(uid.trim());
    setBusy(false);
    if ('error' in out) {
      setErr(UID_ERRORS[out.error]);
      return;
    }
    mergeDedupe(out);
  }

  const count = artifacts.length;
  // Enka UIDs are 9 digits (10 on some servers); anything else is a typo, not
  // a lookup worth a round-trip.
  const uidOk = /^\d{9,10}$/.test(uid.trim());

  return (
    <div className="panel panel-md space-y-5">
      <div className="flex items-center justify-between">
        <span className="micro-label">Inventory</span>
        <span className="chip">
          <span className="font-bold text-accent">{count}</span>
          {count === 1 ? 'artifact' : 'artifacts'} loaded
        </span>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {/* GOOD file upload */}
        <div className="well rounded-xl p-4">
          <label className="field-label" htmlFor="good-file">
            Upload GOOD export
          </label>
          <p className="mb-3 text-xs text-muted">
            Your full inventory, from Genshin Optimizer or similar.
          </p>
          <input
            id="good-file"
            type="file"
            accept="application/json,.json"
            onChange={(e) => void onFile(e)}
            className="focus-ring block w-full cursor-pointer rounded-md text-xs text-muted file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-accent/15 file:px-3 file:py-2 file:font-semibold file:text-accent-bright hover:file:bg-accent/25"
          />
        </div>

        {/* UID import */}
        <div className="well rounded-xl p-4">
          <label className="field-label" htmlFor="uid-input">
            Import by UID
          </label>
          <p className="mb-3 text-xs text-muted">
            Showcased characters only — not your full inventory.
          </p>
          <div className="flex gap-2">
            <input
              id="uid-input"
              className="field"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              placeholder="700000000"
              aria-label="UID"
              aria-describedby={uidOk ? undefined : 'uid-hint'}
              inputMode="numeric"
            />
            <button
              className="btn-primary flex-none"
              aria-busy={busy}
              disabled={busy || !uidOk}
              onClick={() => void onUid()}
            >
              {busy ? 'Fetching…' : 'Fetch'}
            </button>
          </div>
          {!uid && (
            <p id="uid-hint" className="mt-2 text-xs text-muted">
              Enter your UID to enable Fetch.
            </p>
          )}
          {uid && !uidOk && (
            <p id="uid-hint" className="mt-2 text-xs text-rose">
              A UID is 9–10 digits.
            </p>
          )}
        </div>
      </div>

      {msg && (
        <Callout
          tone="success"
          role="status"
          className="flex items-center gap-2"
        >
          {msg}
        </Callout>
      )}
      {err && (
        <Callout tone="error" role="alert" className="flex items-center gap-2">
          {err}
        </Callout>
      )}
    </div>
  );
}
