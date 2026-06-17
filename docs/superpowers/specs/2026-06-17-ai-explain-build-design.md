# AI "Explain this build" — design

**Status:** approved (2026-06-17)
**Type:** v1.1 depth feature (item 4b)
**Depends on:** gap analysis (PR #8, `25a64e8`) — consumes the gap report

## Goal

Add an on-demand **"Explain this build"** button beneath the gap report. It sends the
optimiser's best build (stat sheet), the computed gap report, and the character/objective
to a serverless proxy, which calls Claude and returns a 2–3 sentence plain-English
explanation: why this build won, the main tradeoff, and what to farm next.

This serves a dual purpose ("Both"): a genuinely useful in-app feature **and** a
portfolio showcase of safe LLM integration (server-side key, no key leakage, graceful
degradation, no PII).

## Non-goals

- No chat / multi-turn. One request, one short answer.
- No streaming (output is tiny — see Decisions).
- No damage simulation or new game data (ADR-0003 still holds — the AI only narrates
  numbers we already compute).
- No PII to the API (no UID, no inventory, no share data).

## Architecture & data flow

```
GapReport (already computed)  ─┐
result.builds[0].totals       ─┼─►  ExplainBuild.tsx  ──POST /api/explain──►  api/explain.ts
character + objective         ─┘     (button + state)        (no PII)          │
                                                                                ├─ parseExplainPayload  (reject malformed/oversized → 400)
                                                                                ├─ buildExplainPrompt   (pure)
                                                                                └─ Anthropic SDK → claude-haiku-4-5 → { explanation }
```

The serverless function is **thin glue**. All real logic lives in pure, unit-testable
modules, matching the codebase's existing pattern (`gap.ts`, `score.ts`).

## Payload contract (no PII)

```ts
interface ExplainPayload {
  characterKey: string;        // e.g. "furina"
  objective: Objective;        // existing union
  totals: Partial<Record<StatKey, number>>; // subset of the build's stat sheet
  gap: {
    feasibility: string[];     // GapReport.feasibility
    shortfalls: string[];      // GapReport.shortfalls
    action: string | null;     // GapReport.action
  };
}
```

Request: `POST /api/explain` with `ExplainPayload` JSON.
Response (success): `{ explanation: string }`.
Response (bad input): `400 { error: "invalid payload" }`.
Response (server/upstream failure): `500 { error: "unavailable" }` — generic, never leaks
the upstream error or any key material.

## Components

| Unit | Purpose | Tested by |
|---|---|---|
| `src/ai/explainPayload.ts` | `ExplainPayload` type + `parseExplainPayload(unknown): ExplainPayload \| null` — strict validation (see below) | unit |
| `src/ai/explainPrompt.ts` | Pure `buildExplainPrompt(payload) → { system: string; user: string }` | unit |
| `src/ai/explainClient.ts` | `explainBuild(payload): Promise<string>` — `fetch('/api/explain')`, throws on non-200 | mocked in component test |
| `api/explain.ts` | Vercel Node function: read `ANTHROPIC_API_KEY` → `parseExplainPayload` → `buildExplainPrompt` → Anthropic SDK → `{ explanation }`; generic 500 on any error | thin glue (manual smoke) |
| `src/components/ExplainBuild.tsx` | Button + loading + result card + inline error; gated by `VITE_AI_ENABLED` | component |

### `parseExplainPayload` validation rules (the cost/abuse guard)

Reject (return `null` → 400) unless **all** hold:

- `characterKey`: non-empty string, ≤ 64 chars.
- `objective`: one of the known `Objective` union members.
- `totals`: object whose keys are all known `StatKey`s and whose values are finite numbers
  within sane bounds (e.g. `-10_000 ≤ v ≤ 100_000`); at most ~20 entries.
- `gap.feasibility` / `gap.shortfalls`: arrays of ≤ 10 strings, each ≤ 300 chars.
- `gap.action`: `null` or a string ≤ 300 chars.

This keeps the prompt small and bounded regardless of what a scripted caller sends.

### `buildExplainPrompt`

- **System:** a concise Genshin build-coach persona. Hard constraints: ground every claim
  **only** in the supplied numbers; **2–3 sentences**; plain English; **no markdown**;
  cover (1) why this build wins for the objective, (2) the main tradeoff, (3) the single
  most useful next step (defer to `gap.action` when present).
- **User:** a compact, human-readable rendering of the payload (character, objective,
  key totals, the gap lines). No raw JSON dump.

### `api/explain.ts`

- Runtime: Vercel Node (`@vercel/node` types). `export default async function handler(req, res)`.
- Only `POST`; else 405.
- If `ANTHROPIC_API_KEY` missing → 500 `{ error: "unavailable" }` (the client shouldn't
  even render the button in this case, but defend anyway).
- Anthropic SDK (`@anthropic-ai/sdk`): `model: "claude-haiku-4-5"`, `max_tokens: ~200`,
  non-streaming, `messages.create`. (Haiku does not take the `effort`/adaptive-thinking
  params — plain call.)
- Extract the text block, return `{ explanation }`.
- Wrap everything in try/catch → generic 500. Never echo the upstream error.

### `ExplainBuild.tsx`

- Renders only when `import.meta.env.VITE_AI_ENABLED === 'true'`.
- Props: the same inputs the gap report uses (`characterKey`, `objective`, build `totals`,
  and the `GapReport`). Assembles `ExplainPayload`.
- States: idle (button "Explain this build") → loading ("Thinking…", disabled) →
  success (explanation card; button hidden or "Regenerate") → error (inline "Couldn't
  generate an explanation right now." + button re-enabled to retry).
- **Cache:** once generated, the explanation is held in component state. A new optimise
  run produces a new `result`, which remounts/resets this component, so re-clicks on the
  same build don't re-call the API.
- Rendered in `App`'s Results area directly **below** the `GapReport`, gated by the same
  condition the gap report uses (`!sharedArtifacts && META_TARGETS[characterKey]`) so it
  only appears for meta characters on fresh, non-shared builds.

## Cost guard (Lightweight — chosen)

`claude-haiku-4-5` + `max_tokens ~200` + strict `parseExplainPayload` + a documented step
to set a **spend cap in the Anthropic console**. Worst-case scripted abuse stays in
cents/day. No KV / rate-limiting infra (explicitly out of scope).

## Degradation

- **Build-time flag `VITE_AI_ENABLED`**: button only renders when `=== 'true'`. Flip it on
  after the key is deployed. Zero flash, no load-time request.
- **Runtime failure**: inline message + retry; the rest of the app is unaffected.

## `vercel.json` fix (required)

The current SPA rewrite `{ "source": "/(.*)", "destination": "/" }` can swallow
`/api/explain`. Scope it to exclude the API path, e.g.:

```json
{ "rewrites": [{ "source": "/((?!api/).*)", "destination": "/" }] }
```

## New dependencies

- `@anthropic-ai/sdk` (function runtime).
- `@vercel/node` (dev-dependency, handler types).

Local AI testing requires `vercel dev` (plain `npm run dev` / Vite does not serve `/api`).
Documented in README.

## Testing

- **Unit — `parseExplainPayload`**: accepts a valid payload; rejects unknown objective,
  unknown stat key, non-finite / out-of-bounds value, oversized arrays/strings, missing
  fields.
- **Unit — `buildExplainPrompt`**: prompt contains the grounding numbers and the
  2–3-sentence / no-markdown / grounded-only instructions; asserts **no PII** field names
  (no `uid`, no artifact ids) appear.
- **Component — `ExplainBuild`**: does not render when flag off; renders button when flag
  on; loading→success shows the explanation (mocked `fetch`); loading→error shows the
  inline message and re-enables the button.
- `api/explain.ts` stays thin; verified by manual `vercel dev` smoke (documented), not a
  Vitest suite.

## Documentation

- **ADR-0010** — serverless proxy for AI: key server-side only (never `VITE_`-prefixed,
  which Vite inlines into the public bundle); model = `claude-haiku-4-5`; lightweight cost
  guard; no PII; build-time feature flag. Records the rejected `VITE_ANTHROPIC_API_KEY`
  alternative and why.
- **README** — short "AI: Explain this build" section (what it does, the proxy
  architecture, the env vars, `vercel dev` for local testing).

## Decisions made (overridable)

- **Non-streaming** — the output is ~200 tokens; streaming adds event-handling complexity
  for no perceptible gain.
- **Per-result component-state cache** — simplest correct cache; resets naturally on a new
  optimise run. No server cache.
- **Model `claude-haiku-4-5`** — cheapest, fast, more than adequate for a 2–3 sentence
  grounded summary; central to the Lightweight cost guard.
```
