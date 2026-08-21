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
    'Couldn’t reach Enka — check your connection and try again in a moment.',
  NOT_FOUND: 'Couldn’t find that UID — check the digits and your server.',
  NO_SHOWCASE:
    'No artifacts on showcase — turn on Character Showcase in-game and add characters to it.',
};

export function ImportPanel() {
  const artifacts = useInventory((s) => s.artifacts);
  const addMany = useInventory((s) => s.addMany);
  const [msg, setMsg] = useState<{
    tone: 'success' | 'info';
    text: string;
  } | null>(null);
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
    // Re-importing the same file adds nothing, and a green "Imported 0
    // artifacts." reads as a failure dressed as a success. Three outcomes,
    // three sentences.
    const skipped = incoming.length - fresh.length;
    if (fresh.length === 0) {
      setMsg({
        tone: 'info',
        text: `Already up to date — all ${incoming.length} ${incoming.length === 1 ? 'piece was' : 'pieces were'} already in your inventory.${suffix}`,
      });
      return;
    }
    setMsg({
      tone: 'success',
      text:
        skipped > 0
          ? `Imported ${fresh.length} new artifacts — ${skipped} were already in your inventory.${suffix}`
          : `Imported ${fresh.length} artifacts.${suffix}`,
    });
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
    // The Fetch button is aria-disabled rather than disabled, and Enter in the
    // field submits regardless — so the guard has to live here.
    if (busy || !uidOk) return;
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
        {/* Two explicit element children, not an element plus a bare text
            node: JSX drops the newline between them, so the spacing was left
            to .chip's flex gap and read as "70artifacts loaded". */}
        <span className="chip">
          <span className="font-bold text-accent">{count}</span>
          <span>{count === 1 ? 'artifact' : 'artifacts'} loaded</span>
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
          {/* A real <form>, so Enter in the field submits — the row read as a
              form and behaved like two unrelated controls. */}
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void onUid();
            }}
          >
            <input
              id="uid-input"
              className="field"
              name="uid"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              placeholder="700000000"
              aria-label="UID"
              aria-describedby={uidOk ? undefined : 'uid-hint'}
              inputMode="numeric"
              autoComplete="off"
              spellCheck={false}
            />
            {/* aria-disabled, not disabled: going disabled mid-click moves
                focus to <body> and the user loses their place. `onUid` holds
                the matching early return. */}
            <button
              type="submit"
              className="btn-primary flex-none"
              aria-busy={busy}
              aria-disabled={busy || !uidOk}
            >
              {busy ? 'Fetching…' : 'Fetch'}
            </button>
          </form>
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

      {/* Persistent live regions. A region created in the same commit as its
          text isn't being observed yet, so nothing is announced — these two
          are always mounted and only their text changes. `sr-only` is
          absolutely positioned, so they cost the panel no vertical rhythm and
          the Callouts below stay purely visual. */}
      <p className="sr-only" role="status">
        {msg?.text ?? ''}
      </p>
      <p className="sr-only" role="alert">
        {err ?? ''}
      </p>
      {msg && (
        <Callout tone={msg.tone} className="flex items-center gap-2">
          {msg.text}
        </Callout>
      )}
      {err && (
        <Callout tone="error" className="flex items-center gap-2">
          {err}
        </Callout>
      )}
    </div>
  );
}
