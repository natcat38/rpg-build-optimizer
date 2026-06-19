# AI "Explain this build" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an on-demand "Explain this build" button that sends the best build's stats + the gap report to a Vercel serverless proxy, which calls Claude (`claude-haiku-4-5`) and returns a 2–3 sentence plain-English explanation.

**Architecture:** All logic lives in pure, unit-tested modules (`explainPayload`, `explainPrompt`, `explainClient`); the serverless function `api/explain.ts` is thin glue that holds the API key server-side. The client button is gated by a build-time `VITE_AI_ENABLED` flag and degrades gracefully on failure. No PII is sent.

**Tech Stack:** Vite + React 18 + TypeScript (strict), Vitest + Testing Library, Vercel Node functions, `@anthropic-ai/sdk`.

**Spec:** `docs/superpowers/specs/2026-06-17-ai-explain-build-design.md`

**Pre-flight:** Work on branch `feat/v1.1-ai-explain` (already created off `origin/main` @ `25a64e8`). Run `npm install` once if `node_modules` is stale.

---

### Task 1: ExplainPayload type + strict validator

**Files:**
- Create: `src/ai/explainPayload.ts`
- Test: `src/ai/explainPayload.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/ai/explainPayload.test.ts
import { describe, it, expect } from 'vitest';
import { parseExplainPayload } from './explainPayload';

function valid() {
  return {
    characterKey: 'furina',
    objective: 'crit_value',
    totals: { hp: 30000, crit_rate: 70, crit_dmg: 180, er_pct: 160 },
    gap: {
      feasibility: ['You own 0 Golden Troupe pieces — need 4.'],
      shortfalls: ['Best build reaches ER 150% vs 200% target.'],
      action: 'Farm Golden Troupe.',
    },
  };
}

describe('parseExplainPayload', () => {
  it('accepts a well-formed payload', () => {
    expect(parseExplainPayload(valid())).toEqual(valid());
  });

  it('rejects a non-object', () => {
    expect(parseExplainPayload(null)).toBeNull();
    expect(parseExplainPayload('x')).toBeNull();
  });

  it('rejects an unknown objective', () => {
    expect(parseExplainPayload({ ...valid(), objective: 'haste' })).toBeNull();
  });

  it('rejects an unknown stat key in totals', () => {
    expect(
      parseExplainPayload({ ...valid(), totals: { luck: 5 } }),
    ).toBeNull();
  });

  it('rejects a non-finite or out-of-bounds stat value', () => {
    expect(
      parseExplainPayload({ ...valid(), totals: { hp: Infinity } }),
    ).toBeNull();
    expect(
      parseExplainPayload({ ...valid(), totals: { hp: 1e9 } }),
    ).toBeNull();
  });

  it('rejects oversized gap arrays and strings', () => {
    const longList = Array.from({ length: 11 }, () => 'x');
    expect(
      parseExplainPayload({
        ...valid(),
        gap: { feasibility: longList, shortfalls: [], action: null },
      }),
    ).toBeNull();
    expect(
      parseExplainPayload({
        ...valid(),
        gap: { feasibility: ['a'.repeat(301)], shortfalls: [], action: null },
      }),
    ).toBeNull();
  });

  it('rejects a missing characterKey or over-long one', () => {
    const { characterKey: _omit, ...rest } = valid();
    expect(parseExplainPayload(rest)).toBeNull();
    expect(
      parseExplainPayload({ ...valid(), characterKey: 'x'.repeat(65) }),
    ).toBeNull();
  });

  it('accepts a null action and empty totals (infeasible build)', () => {
    const p = { ...valid(), totals: {}, gap: { feasibility: [], shortfalls: [], action: null } };
    expect(parseExplainPayload(p)).toEqual(p);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/ai/explainPayload.test.ts`
Expected: FAIL — "Failed to resolve import './explainPayload'".

- [ ] **Step 3: Write the implementation**

```ts
// src/ai/explainPayload.ts
import type { Objective, StatKey, StatVec } from '../game/types';
import { isStatKey } from '../game/types';

export interface ExplainPayload {
  characterKey: string;
  objective: Objective;
  totals: StatVec;
  gap: {
    feasibility: string[];
    shortfalls: string[];
    action: string | null;
  };
}

const MAX_KEY_LEN = 64;
const MAX_TOTALS = 20;
const STAT_MIN = -10_000;
const STAT_MAX = 100_000;
const MAX_LINES = 10;
const MAX_LINE_LEN = 300;

function isObjective(x: unknown): x is Objective {
  return x === 'crit_value' || isStatKey(x);
}

function isShortStringArray(x: unknown): x is string[] {
  return (
    Array.isArray(x) &&
    x.length <= MAX_LINES &&
    x.every((s) => typeof s === 'string' && s.length <= MAX_LINE_LEN)
  );
}

function parseTotals(x: unknown): StatVec | null {
  if (typeof x !== 'object' || x === null) return null;
  const entries = Object.entries(x as Record<string, unknown>);
  if (entries.length > MAX_TOTALS) return null;
  const out: StatVec = {};
  for (const [k, v] of entries) {
    if (!isStatKey(k)) return null;
    if (typeof v !== 'number' || !Number.isFinite(v)) return null;
    if (v < STAT_MIN || v > STAT_MAX) return null;
    out[k] = v;
  }
  return out;
}

/**
 * Strict structural validation of an untrusted /api/explain request body.
 * Returns the typed payload, or null if anything is malformed/oversized.
 * This is the cost/abuse guard: it bounds the prompt the proxy will ever build.
 */
export function parseExplainPayload(input: unknown): ExplainPayload | null {
  if (typeof input !== 'object' || input === null) return null;
  const o = input as Record<string, unknown>;

  if (
    typeof o.characterKey !== 'string' ||
    o.characterKey.length === 0 ||
    o.characterKey.length > MAX_KEY_LEN
  )
    return null;
  if (!isObjective(o.objective)) return null;

  const totals = parseTotals(o.totals);
  if (totals === null) return null;

  if (typeof o.gap !== 'object' || o.gap === null) return null;
  const g = o.gap as Record<string, unknown>;
  if (!isShortStringArray(g.feasibility)) return null;
  if (!isShortStringArray(g.shortfalls)) return null;
  if (
    !(
      g.action === null ||
      (typeof g.action === 'string' && g.action.length <= MAX_LINE_LEN)
    )
  )
    return null;

  return {
    characterKey: o.characterKey,
    objective: o.objective,
    totals,
    gap: {
      feasibility: g.feasibility,
      shortfalls: g.shortfalls,
      action: g.action as string | null,
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/ai/explainPayload.test.ts`
Expected: PASS (all cases).

- [ ] **Step 5: Format + commit**

```bash
npx prettier --write src/ai/explainPayload.ts src/ai/explainPayload.test.ts
git add src/ai/explainPayload.ts src/ai/explainPayload.test.ts
git commit -m "feat(ai): ExplainPayload type + strict validator"
```

---

### Task 2: buildExplainPrompt (pure)

**Files:**
- Create: `src/ai/explainPrompt.ts`
- Test: `src/ai/explainPrompt.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/ai/explainPrompt.test.ts
import { describe, it, expect } from 'vitest';
import { buildExplainPrompt } from './explainPrompt';
import type { ExplainPayload } from './explainPayload';

const payload: ExplainPayload = {
  characterKey: 'furina',
  objective: 'crit_value',
  totals: { hp: 30000, crit_rate: 70, crit_dmg: 180, er_pct: 160 },
  gap: {
    feasibility: [],
    shortfalls: ['Best build reaches ER 160% vs 200% target.'],
    action: 'Upgrade your Sands.',
  },
};

describe('buildExplainPrompt', () => {
  it('system prompt states the hard constraints', () => {
    const { system } = buildExplainPrompt(payload);
    expect(system).toMatch(/2-3 sentences/i);
    expect(system).toMatch(/only/i); // grounded only in provided numbers
    expect(system).toMatch(/no markdown/i);
  });

  it('user prompt includes the grounding numbers and gap lines', () => {
    const { user } = buildExplainPrompt(payload);
    expect(user).toContain('furina');
    expect(user).toContain('Crit Value'); // objective label
    expect(user).toContain('180'); // a stat value
    expect(user).toContain('vs 200% target');
    expect(user).toContain('Upgrade your Sands.');
  });

  it('handles an infeasible build (empty totals)', () => {
    const { user } = buildExplainPrompt({
      ...payload,
      totals: {},
      gap: { feasibility: ['no Golden Troupe'], shortfalls: [], action: null },
    });
    expect(user).toMatch(/no feasible build/i);
    expect(user).toContain('no Golden Troupe');
  });

  it('contains no PII field markers', () => {
    const { user, system } = buildExplainPrompt(payload);
    expect(`${system}\n${user}`.toLowerCase()).not.toContain('uid');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/ai/explainPrompt.test.ts`
Expected: FAIL — cannot resolve `./explainPrompt`.

- [ ] **Step 3: Write the implementation**

```ts
// src/ai/explainPrompt.ts
import type { StatKey } from '../game/types';
import { objectiveLabel, statLabel } from '../ui/labels';
import type { ExplainPayload } from './explainPayload';

/**
 * Build the system + user prompt for the explanation call. Pure and
 * unit-tested so the wording/grounding is verifiable without hitting the API.
 */
export function buildExplainPrompt(p: ExplainPayload): {
  system: string;
  user: string;
} {
  const system = [
    'You are a concise Genshin Impact artifact build coach.',
    "You are given the numbers for a player's best build and a gap report comparing it to a meta target.",
    'Ground every statement ONLY in the numbers provided — never invent stats, sets, or game mechanics.',
    'Reply in 2-3 sentences of plain English. No markdown, no bullet points, no headings.',
    'Cover: (1) why this build is strong for the stated objective, (2) the main tradeoff, and (3) the single most useful next step (defer to the provided "Next action" when present).',
  ].join(' ');

  const stats = (Object.entries(p.totals) as [StatKey, number][])
    .map(([k, v]) => `${statLabel(k)} ${Math.round(v)}`)
    .join(', ');

  const lines: string[] = [
    `Character: ${p.characterKey}`,
    `Objective: maximise ${objectiveLabel(p.objective)}`,
    `Best build stats: ${stats || '(no feasible build found)'}`,
  ];
  if (p.gap.feasibility.length)
    lines.push(`What's missing: ${p.gap.feasibility.join('; ')}`);
  if (p.gap.shortfalls.length)
    lines.push(`Shortfalls: ${p.gap.shortfalls.join('; ')}`);
  if (p.gap.action) lines.push(`Next action: ${p.gap.action}`);

  return { system, user: lines.join('\n') };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/ai/explainPrompt.test.ts`
Expected: PASS.

- [ ] **Step 5: Format + commit**

```bash
npx prettier --write src/ai/explainPrompt.ts src/ai/explainPrompt.test.ts
git add src/ai/explainPrompt.ts src/ai/explainPrompt.test.ts
git commit -m "feat(ai): pure buildExplainPrompt"
```

---

### Task 3: explainClient (browser fetch wrapper)

**Files:**
- Create: `src/ai/explainClient.ts`
- Test: `src/ai/explainClient.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/ai/explainClient.test.ts
import { describe, it, expect, vi, afterEach } from 'vitest';
import { explainBuild } from './explainClient';
import type { ExplainPayload } from './explainPayload';

const payload: ExplainPayload = {
  characterKey: 'furina',
  objective: 'crit_value',
  totals: { hp: 30000 },
  gap: { feasibility: [], shortfalls: [], action: null },
};

afterEach(() => vi.unstubAllGlobals());

describe('explainBuild', () => {
  it('POSTs the payload and returns the explanation', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ explanation: 'Strong build.' }),
    }));
    vi.stubGlobal('fetch', fetchMock);

    const text = await explainBuild(payload);
    expect(text).toBe('Strong build.');
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/explain',
      expect.objectContaining({ method: 'POST' }),
    );
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.characterKey).toBe('furina');
  });

  it('throws on a non-OK response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 500, json: async () => ({}) })),
    );
    await expect(explainBuild(payload)).rejects.toThrow();
  });

  it('throws on a malformed body', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, json: async () => ({ nope: 1 }) })),
    );
    await expect(explainBuild(payload)).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/ai/explainClient.test.ts`
Expected: FAIL — cannot resolve `./explainClient`.

- [ ] **Step 3: Write the implementation**

```ts
// src/ai/explainClient.ts
import type { ExplainPayload } from './explainPayload';

/** Calls the serverless proxy. Throws on transport or shape errors. */
export async function explainBuild(payload: ExplainPayload): Promise<string> {
  const res = await fetch('/api/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`explain failed: ${res.status}`);
  const data = (await res.json()) as { explanation?: unknown };
  if (typeof data.explanation !== 'string')
    throw new Error('explain: malformed response');
  return data.explanation;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/ai/explainClient.test.ts`
Expected: PASS.

- [ ] **Step 5: Format + commit**

```bash
npx prettier --write src/ai/explainClient.ts src/ai/explainClient.test.ts
git add src/ai/explainClient.ts src/ai/explainClient.test.ts
git commit -m "feat(ai): explainBuild client wrapper"
```

---

### Task 4: Serverless function + server toolchain

**Files:**
- Create: `api/explain.ts`
- Create: `tsconfig.api.json`
- Modify: `package.json` (deps + `typecheck` script)
- Modify: `eslint.config.js` (node globals for `api/**`)
- Modify: `vercel.json` (exclude `/api` from SPA rewrite)

No Vitest here — the handler is thin glue. Verified by typecheck + lint + build (all run in CI), and by `vercel dev` smoke (documented in Task 7's README).

- [ ] **Step 1: Install dependencies**

```bash
npm install @anthropic-ai/sdk
npm install -D @vercel/node
```

Expected: both added to `package.json`; `package-lock.json` updated.

- [ ] **Step 2: Fix the SPA rewrite so `/api` is not swallowed**

Replace the entire contents of `vercel.json` with:

```json
{ "rewrites": [{ "source": "/((?!api/).*)", "destination": "/" }] }
```

- [ ] **Step 3: Add a Node tsconfig for the function**

Create `tsconfig.api.json`:

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.api.tsbuildinfo",
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "skipLibCheck": true,
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["node"]
  },
  "include": ["api"]
}
```

- [ ] **Step 4: Extend the `typecheck` script**

In `package.json`, change the `typecheck` script from:

```json
"typecheck": "tsc -b",
```

to:

```json
"typecheck": "tsc -b && tsc --noEmit -p tsconfig.api.json",
```

- [ ] **Step 5: Give `api/**` Node globals in eslint**

In `eslint.config.js`, add a new config object as the LAST argument to `tseslint.config(...)` (after the existing main config object, before the closing `)`):

```js
  {
    files: ['api/**/*.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },
```

(`globals` is already imported at the top of the file.)

- [ ] **Step 6: Write the serverless function**

Create `api/explain.ts`:

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';
import { parseExplainPayload } from '../src/ai/explainPayload';
import { buildExplainPrompt } from '../src/ai/explainPrompt';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'unavailable' });
    return;
  }

  const payload = parseExplainPayload(req.body);
  if (!payload) {
    res.status(400).json({ error: 'invalid payload' });
    return;
  }

  try {
    const { system, user } = buildExplainPrompt(payload);
    const client = new Anthropic({ apiKey });
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 200,
      system,
      messages: [{ role: 'user', content: user }],
    });
    const explanation = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .trim();
    res.status(200).json({ explanation });
  } catch {
    // Never leak upstream error details or key material.
    res.status(500).json({ error: 'unavailable' });
  }
}
```

- [ ] **Step 7: Verify typecheck, lint, build all pass**

Run: `npm run typecheck`
Expected: PASS (both `tsc -b` and the api project).

Run: `npm run lint`
Expected: PASS (no `no-undef` on `process`).

Run: `npm run build`
Expected: PASS (Vite build unaffected).

- [ ] **Step 8: Format + commit**

```bash
npx prettier --write api/explain.ts tsconfig.api.json vercel.json eslint.config.js package.json
git add api/explain.ts tsconfig.api.json vercel.json eslint.config.js package.json package-lock.json
git commit -m "feat(ai): serverless /api/explain proxy + toolchain"
```

---

### Task 5: ExplainBuild component

**Files:**
- Create: `src/components/ExplainBuild.tsx`
- Test: `src/components/ExplainBuild.test.tsx`
- Modify: `src/vite-env.d.ts` (type the flag)

- [ ] **Step 1: Type the env flag**

Replace the contents of `src/vite-env.d.ts` with:

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AI_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

- [ ] **Step 2: Write the failing test**

```tsx
// src/components/ExplainBuild.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExplainBuild } from './ExplainBuild';
import type { GapReport } from '../meta/gap';

vi.mock('../ai/explainClient', () => ({ explainBuild: vi.fn() }));
import { explainBuild } from '../ai/explainClient';

const report: GapReport = {
  characterKey: 'furina',
  feasibility: [],
  shortfalls: [],
  action: 'Upgrade your Sands.',
};

function renderIt() {
  return render(
    <ExplainBuild
      characterKey="furina"
      objective="crit_value"
      totals={{ hp: 30000 }}
      report={report}
    />,
  );
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe('ExplainBuild', () => {
  it('renders nothing when the flag is off', () => {
    vi.stubEnv('VITE_AI_ENABLED', '');
    const { container } = renderIt();
    expect(container).toBeEmptyDOMElement();
  });

  describe('with flag on', () => {
    beforeEach(() => vi.stubEnv('VITE_AI_ENABLED', 'true'));

    it('shows the button', () => {
      renderIt();
      expect(
        screen.getByRole('button', { name: /Explain this build/i }),
      ).toBeInTheDocument();
    });

    it('shows the explanation after a successful call', async () => {
      vi.mocked(explainBuild).mockResolvedValue('This build maximises crit.');
      renderIt();
      await userEvent.click(
        screen.getByRole('button', { name: /Explain this build/i }),
      );
      await waitFor(() =>
        expect(
          screen.getByText('This build maximises crit.'),
        ).toBeInTheDocument(),
      );
    });

    it('shows an inline error and keeps the button on failure', async () => {
      vi.mocked(explainBuild).mockRejectedValue(new Error('boom'));
      renderIt();
      await userEvent.click(
        screen.getByRole('button', { name: /Explain this build/i }),
      );
      await waitFor(() =>
        expect(screen.getByText(/Couldn't generate/i)).toBeInTheDocument(),
      );
      expect(
        screen.getByRole('button', { name: /Explain this build/i }),
      ).toBeEnabled();
    });
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/components/ExplainBuild.test.tsx`
Expected: FAIL — cannot resolve `./ExplainBuild`.

- [ ] **Step 4: Write the implementation**

```tsx
// src/components/ExplainBuild.tsx
import { useState } from 'react';
import type { Objective, StatVec } from '../game/types';
import type { GapReport } from '../meta/gap';
import { explainBuild } from '../ai/explainClient';

export function ExplainBuild({
  characterKey,
  objective,
  totals,
  report,
}: {
  characterKey: string;
  objective: Objective;
  totals: StatVec;
  report: GapReport;
}) {
  const enabled = import.meta.env.VITE_AI_ENABLED === 'true';
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [error, setError] = useState(false);

  if (!enabled) return null;

  async function run() {
    setLoading(true);
    setError(false);
    try {
      const text = await explainBuild({
        characterKey,
        objective,
        totals,
        gap: {
          feasibility: report.feasibility,
          shortfalls: report.shortfalls,
          action: report.action,
        },
      });
      setExplanation(text);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3">
      {explanation ? (
        <div className="panel space-y-2">
          <p className="field-label">AI explanation</p>
          <p className="text-sm leading-relaxed text-parchment/90">
            {explanation}
          </p>
        </div>
      ) : (
        <button className="btn-ghost" onClick={run} disabled={loading}>
          {loading ? 'Thinking…' : '✨ Explain this build'}
        </button>
      )}
      {error && (
        <p className="mt-2 text-sm text-rose">
          Couldn&apos;t generate an explanation right now. Try again.
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/components/ExplainBuild.test.tsx`
Expected: PASS (all cases).

- [ ] **Step 6: Format + commit**

```bash
npx prettier --write src/components/ExplainBuild.tsx src/components/ExplainBuild.test.tsx src/vite-env.d.ts
git add src/components/ExplainBuild.tsx src/components/ExplainBuild.test.tsx src/vite-env.d.ts
git commit -m "feat(ai): ExplainBuild button + graceful degradation"
```

---

### Task 6: Wire ExplainBuild into the Results gap-report block

**Files:**
- Modify: `src/components/App.tsx`

The gap report renders inside `{!sharedArtifacts && META_TARGETS[request.characterKey] && (...)}`. We compute the report once, render `GapReport` with it, then render `ExplainBuild` directly below it with the same report.

- [ ] **Step 1: Add the import**

In `src/components/App.tsx`, add after the `import { GapReport } ...` line:

```ts
import { ExplainBuild } from './ExplainBuild';
```

- [ ] **Step 2: Replace the gap-report block**

Find this block in the Results section:

```tsx
              {!sharedArtifacts && META_TARGETS[request.characterKey] && (
                <div className="mb-4">
                  <GapReport
                    report={computeGapReport(
                      META_TARGETS[request.characterKey],
                      artifacts,
                      result.builds[0] ?? null,
                    )}
                  />
                </div>
              )}
```

Replace it with (computes the report once, passes it to both):

```tsx
              {!sharedArtifacts &&
                META_TARGETS[request.characterKey] &&
                (() => {
                  const report = computeGapReport(
                    META_TARGETS[request.characterKey],
                    artifacts,
                    result.builds[0] ?? null,
                  );
                  return (
                    <div className="mb-4">
                      <GapReport report={report} />
                      <ExplainBuild
                        characterKey={request.characterKey}
                        objective={request.objective}
                        totals={result.builds[0]?.totals ?? {}}
                        report={report}
                      />
                    </div>
                  );
                })()}
```

- [ ] **Step 3: Verify the full suite + typecheck**

Run: `npm run typecheck`
Expected: PASS.

Run: `npx vitest run src/components/App.test.tsx`
Expected: PASS (App test is flag-off by default, so ExplainBuild renders nothing — existing assertions unaffected).

- [ ] **Step 4: Format + commit**

```bash
npx prettier --write src/components/App.tsx
git add src/components/App.tsx
git commit -m "feat(ai): render ExplainBuild below the gap report"
```

---

### Task 7: ADR-0010 + README documentation

**Files:**
- Create: `docs/adr/0010-serverless-proxy-for-ai-explain.md`
- Modify: `README.md`

- [ ] **Step 1: Write ADR-0010**

Create `docs/adr/0010-serverless-proxy-for-ai-explain.md` (match the heading style of `docs/adr/0009-*.md` — open it first to mirror the format):

```markdown
# ADR-0010: Serverless proxy for the AI "Explain this build" feature

## Status
Accepted (2026-06-17)

## Context
The "Explain this build" feature calls the Anthropic API to turn the optimiser's
output + gap report into a short natural-language explanation. The app is a
static, client-side SPA (ADR-0001) deployed on Vercel. An API key must never
ship to the browser: any `VITE_`-prefixed variable is inlined into the public
bundle by Vite, which would leak the key to every visitor.

## Decision
- Add a single Vercel serverless function, `api/explain.ts`, that reads
  `ANTHROPIC_API_KEY` from server-side env and proxies the call. The key never
  reaches the client.
- Keep the function thin; all logic (validation, prompt building) lives in pure,
  unit-tested modules under `src/ai/` shared with the client contract.
- Model: `claude-haiku-4-5` — cheapest and fast, sufficient for a 2–3 sentence
  grounded summary.
- Cost/abuse guard ("Lightweight"): strict `parseExplainPayload` validation +
  `max_tokens: 200` + a spend cap set manually in the Anthropic console. No KV /
  rate-limiting infrastructure.
- No PII is sent: only character key, objective, the build's stat totals, and the
  gap-report strings. No UID, inventory, or share data.
- Graceful degradation: a build-time `VITE_AI_ENABLED` flag gates the button so
  nothing AI-related renders until the key is deployed; runtime failures show an
  inline retry message.

## Consequences
- Local AI testing requires `vercel dev` (plain Vite does not serve `/api`).
- The hard cost ceiling depends on the manually-set console spend cap.
- `vercel.json` excludes `/api` from the SPA rewrite so the function is reachable.

## Rejected alternatives
- **`VITE_ANTHROPIC_API_KEY` in the client** — leaks the key in the public
  bundle. Non-starter.
- **IP rate limiting via Vercel KV** — more robust but adds infrastructure;
  out of scope for a portfolio demo (revisit if abuse appears).
```

- [ ] **Step 2: Add a README section**

In `README.md`, add a section (place it near the existing feature descriptions; match surrounding style):

```markdown
## AI: Explain this build

For supported meta characters, an optional **"Explain this build"** button sits
below the gap report. It sends the best build's stats and the gap report to a
Vercel serverless function (`api/explain.ts`), which calls Claude
(`claude-haiku-4-5`) and returns a 2–3 sentence plain-English explanation. No
personal data is sent (no UID, no inventory).

**Why a serverless proxy?** The Anthropic API key stays server-side. A
`VITE_`-prefixed key would be inlined into the public bundle and leak — see
[ADR-0010](docs/adr/0010-serverless-proxy-for-ai-explain.md).

### Setup / local testing
- Set `ANTHROPIC_API_KEY` as a Vercel project environment variable (server-side).
- Set `VITE_AI_ENABLED=true` to render the button (build-time flag — keep it off
  until the key is deployed).
- Set a spend cap in the Anthropic console (the feature's hard cost ceiling).
- Locally, run `vercel dev` (not `npm run dev`) to serve the `/api` function.
```

- [ ] **Step 3: Verify format + full suite**

Run: `npm run format:check`
Expected: PASS (or run `npm run format` first).

Run: `npm test`
Expected: PASS (full suite).

- [ ] **Step 4: Commit**

```bash
npx prettier --write docs/adr/0010-serverless-proxy-for-ai-explain.md README.md
git add docs/adr/0010-serverless-proxy-for-ai-explain.md README.md
git commit -m "docs: ADR-0010 + README for AI explain feature"
```

---

## Final verification (run before finishing the branch)

- [ ] `npm run typecheck` — PASS (app + api projects)
- [ ] `npm run lint` — PASS
- [ ] `npm run format:check` — PASS
- [ ] `npm test` — PASS (new: explainPayload, explainPrompt, explainClient, ExplainBuild; existing suite unchanged)
- [ ] `npm run build` — PASS
- [ ] Manual smoke (optional, needs a key): `vercel dev`, set `VITE_AI_ENABLED=true` + `ANTHROPIC_API_KEY`, optimise Furina with sample gear, click "Explain this build", confirm a 2–3 sentence response renders.

Then use **superpowers:finishing-a-development-branch** to push + open the PR.
```
