import { useState } from 'react';
import { type ChangeEvent } from 'react';
import { parseGOOD } from '../import/good';
import { fetchUidArtifacts } from '../import/uid';
import { artifactHash } from '../import/hash';
import { useInventory } from '../state/inventory';
import type { Artifact } from '../game/types';

export function ImportPanel() {
  const { artifacts, addMany } = useInventory();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [uid, setUid] = useState('');
  const [busy, setBusy] = useState(false);

  function mergeDedupe(incoming: Artifact[]) {
    const seen = new Set(artifacts.map(artifactHash));
    const fresh = incoming.filter((a) => !seen.has(artifactHash(a)));
    addMany(fresh);
    setErr(null);
    setMsg(`Imported ${fresh.length} artifacts.`);
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

  return (
    <div className="space-y-4 p-4 border rounded">
      <div>
        <label className="font-semibold block mb-1">
          Upload GOOD export (full inventory)
        </label>
        <input
          type="file"
          accept="application/json,.json"
          onChange={onFile}
          aria-label="GOOD file"
        />
      </div>
      <div>
        <label className="font-semibold block mb-1">
          Import by UID (showcased characters only)
        </label>
        <input
          className="border mr-2"
          value={uid}
          onChange={(e) => setUid(e.target.value)}
          placeholder="700000000"
          aria-label="UID"
        />
        <button
          className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
          disabled={busy || !uid}
          onClick={onUid}
        >
          {busy ? 'Fetching…' : 'Fetch'}
        </button>
        <p className="text-xs text-gray-500 mt-1">
          UID import only exposes artifacts on your showcased characters — not
          your full inventory.
        </p>
      </div>
      {msg && (
        <p role="status" className="text-green-700">
          {msg}
        </p>
      )}
      {err && (
        <p role="alert" className="text-red-600">
          {err}
        </p>
      )}
    </div>
  );
}
