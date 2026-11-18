# 0026. Explain model: Haiku 5.5, an env override, and a weekly newer-model check

- Status: Accepted
- Date: 2026-11-18
- Amends: [ADR-0010](0010-serverless-proxy-for-ai-explain.md) (its model and `max_tokens` lines)

## Context

[ADR-0010](0010-serverless-proxy-for-ai-explain.md) pinned `api/explain.ts` to
`claude-haiku-4-5` with `max_tokens: 200`. A prompt audit (2026-11-15, finding #9) flagged
three problems:

- The model ID was hard-coded in the handler, two generations behind the current Haiku.
- Nothing checked `stop_reason`. A reply cut off at the 200-token cap went out as a 200 with
  half a sentence.
- A plain ID swap to `claude-haiku-5-5` would break quietly. Haiku 5.5 thinks by default, and
  thinking counts toward `max_tokens`, so 200 tokens could all go to thinking and leave an
  empty explanation, again returned as a 200.

Anthropic publishes no "latest Haiku" alias. Resolving the newest model at runtime was
rejected (below), so staying current needs a person in the loop.

## Decision

- **Model:** `claude-haiku-5-5`, held in one exported constant, `DEFAULT_EXPLAIN_MODEL`.
- **Override:** the `EXPLAIN_MODEL` env var, when set, replaces the constant. A swap is a
  Vercel env change plus a read of 5 to 10 sample outputs, with no deploy.
- **Thinking budget:** `max_tokens: 1024` with `output_config: { effort: 'low' }`. Low effort
  keeps thinking short; the prompt still asks for 2 to 3 sentences, so cost per call stays
  around the old figure (Haiku 5.5 lists at $0.10 / $0.50 per million tokens against $1 / $5).
- **Failure check:** a reply that stops at `max_tokens`, a `refusal`, or a reply with no text
  returns `502 { error: 'unavailable' }`. The client already shows its retry message for any
  non-2xx status.
- **Newer-model check:** `.github/workflows/haiku-check.yml` runs every Monday. It lists
  models through the Anthropic Models API, compares the newest `claude-haiku-*` ID with
  `DEFAULT_EXPLAIN_MODEL`, and opens one GitHub issue when a newer one exists. It never
  changes the model. It needs an `ANTHROPIC_API_KEY` repository secret and skips with a
  notice until one is set.

## Consequences

- An `EXPLAIN_MODEL` pointing at Haiku 4.5 or older fails: those models reject
  `output_config.effort`. The override is for moving forward, not back.
- Haiku 5.5 safety classifiers can refuse a request. There is no server-side fallback for
  this model; the handler reports a refusal as `502`.
- A future Haiku may change thinking or parameter rules again. The issue the workflow opens
  points at the model's migration notes before any swap.

## Rejected alternatives

- **Resolve the newest Haiku at runtime** from the Models API. Fully automatic, but the
  4.5 to 5.5 move proved a new Haiku can break the call or change the output overnight, and
  the first person to notice would be a user.
- **Keep Haiku 4.5 and only add the `stop_reason` check.** Fixes the live fault but leaves the
  pin to go stale with no reminder.
