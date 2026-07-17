import { useState } from 'react';
import { type ChangeEvent } from 'react';
import { parseGOOD } from '../import/good';
import { fetchUidArtifacts } from '../import/uid';
import { mergeNew } from '../import/dedupe';
import { useInventory } from '../state/inventory';
import { useGame } from '../state/game';
import { getGame } from '../game/registry';
import type { Artifact } from '../game/types';

export function ImportPanel() {
  const { artifacts, addMany } = useInventory();
  const game = getGame(useGame((s) => s.gameId));
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [uid, setUid] = useState('');
  const [busy, setBusy] = useState(false);

  function mergeDedupe(incoming: Artifact[]) {
    // Read live state rather than the render-time `artifacts` closure: onFile
    // and onUid are both async, so a second import can otherwise dedupe
    // against a snapshot that predates the first import's commit.
    const fresh = mergeNew(useInventory.getState().artifacts, incoming);
    addMany(fresh);
    setErr(null);
    setMsg(`Imported ${fresh.length} ${game.gearNounPlural.toLowerCase()}.`);
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
      mergeDedupe(out);
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
      setErr(
        "Couldn't find that UID, or no characters are showcased. Check the UID and that Character Showcase is on.",
      );
      return;
    }
    mergeDedupe(out);
  }

  const count = artifacts.length;

  return (
    <div className="panel space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.18em] text-muted">
          Inventory
        </span>
        <span className="chip">
          <span className="font-bold text-accent">{count}</span>
          {count === 1
            ? game.gearNoun.toLowerCase()
            : game.gearNounPlural.toLowerCase()}{' '}
          loaded
        </span>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {/* GOOD file upload */}
        <div className="rounded-xl border border-white/5 bg-surface-900/40 p-4">
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
            aria-label="GOOD file"
            className="block w-full cursor-pointer text-xs text-muted
              file:mr-3 file:cursor-pointer file:rounded-md file:border-0
              file:bg-accent/15 file:px-3 file:py-2 file:font-semibold file:text-accent-bright
              hover:file:bg-accent/25"
          />
        </div>

        {/* UID import */}
        <div className="rounded-xl border border-white/5 bg-surface-900/40 p-4">
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
              inputMode="numeric"
            />
            <button
              className="btn-primary flex-none"
              disabled={busy || !uid}
              onClick={() => void onUid()}
            >
              {busy ? 'Fetching…' : 'Fetch'}
            </button>
          </div>
        </div>
      </div>

      {msg && (
        <p
          role="status"
          className="flex items-center gap-2 rounded-lg border border-jade/25 bg-jade/10 px-3 py-2 text-sm text-jade"
        >
          {msg}
        </p>
      )}
      {err && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-rose/30 bg-rose/10 px-3 py-2 text-sm text-rose"
        >
          {err}
        </p>
      )}
    </div>
  );
}
