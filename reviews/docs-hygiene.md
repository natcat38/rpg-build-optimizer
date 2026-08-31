# Docs & Hygiene Audit — 2026-08-28

Scope: README/docs accuracy, repo hygiene & security, recruiter 90-second skim.
Verdict: repo is in unusually good shape — `docs:check` passes clean (20 ADRs,
contiguous, links resolve), no secrets/tracked `.env`, api/ validation and rate
limiting are solid. Findings below are all polish, ranked by impact.

## 1. `package.json` missing portfolio metadata (Medium)

No `description`, `repository`, `keywords`, `author`, or `homepage` fields —
only `name`/`version`/`private`. A recruiter or `npm`/GitHub preview card has
nothing to show. **Action:** add `description`, `repository` (github URL),
`homepage` (the Vercel demo URL), and a few `keywords` (genshin, optimizer,
branch-and-bound, react, typescript).

## 2. No demo GIF/video, README is static-screenshot-only (Medium-High for recruiters)

The README leads with one static screenshot; there's no short GIF/video
showing the actual interaction (import → constraints → solved build → share
link). For a 90-second skim this is the single biggest missed opportunity —
a 10-second GIF communicates the product far faster than prose. **Action:**
record a short GIF of the core flow and embed it near the top, above or
alongside the current screenshot.

## 3. No "what I learned" / engineering-highlights section (Medium)

For a portfolio piece, the README documents _what_ the project does well but
never surfaces the specific engineering wins a hiring manager scans for
(exact branch-and-bound with oracle-tested optimality, CI drift gates for
generated data and generated docs, prompt-injection-hardened proxy). These
are all real and already true of the code — they're just buried in ADRs a
recruiter won't click into. **Action:** add a short "Engineering highlights"
or "What I learned" section near the bottom of the README (3-5 bullets,
linking into the ADRs for depth).

## 4. No test coverage badge/number surfaced (Low-Medium)

`npm run test:coverage` exists and CI runs the full test suite, but no
coverage percentage or badge appears anywhere a recruiter would see it. Low
cost to add given the tooling is already there. **Action:** add a coverage
badge (Codecov, or a static shields.io badge updated by CI) next to the
existing CI/License badges.

## 5. No architecture diagram (Low)

`CONTEXT.md` and `docs/adr/` explain the architecture well in prose but
there's no single diagram (e.g. data flow: GOOD import → Zustand state →
Web Worker branch-and-bound → share-link encode) that a skimmer could parse
in 10 seconds. Optional given the ADRs are thorough, but a quick visual would
raise the ceiling on the recruiter skim. **Action:** consider a simple
Mermaid diagram in README or CONTEXT.md.

## 6. `FILE-MAP.md` source-file counts drifted for `src/` root (Low)

FILE-MAP.md lists `src` as having 5 source files; actual count is 7
(`labels-core.ts`, `labels-core.test.ts`, `labels.ts`, `labels.test.ts`,
`main.tsx`, `test-setup.ts`, `vite-env.d.ts`). All other directory counts
checked (`src/components`: 24, `src/components/ui`: 19) match exactly, and
`docs:check` doesn't gate on this — the doc itself says it's "a rough
orientation aid rather than a checked invariant," so this is a minor,
self-acknowledged drift, not a broken promise. **Action:** bump the `src`
row to 7 next time that file is touched; not urgent.

## 7. No committed branch-protection documentation (Low, informational)

CLAUDE.md references a `protect-repo` skill for applying branch protection,
but there's no `docs/` file describing what protection is actually applied
to `main` (required PR, linear history, no force-push, required CI checks).
Not a defect — the skill is the source of truth — but a one-line note in
CONTRIBUTING.md or a repo-standards doc would let a reader verify it without
GitHub admin access. **Action:** optional; low priority.

---

## Checks performed, all clean

- **Referenced files exist:** `docs/screenshot.png` (1280×900 PNG), `docs/speed-report.md`,
  `docs/design-system.md`, `FILE-MAP.md`, `CONTRIBUTING.md`, `docs/adr/` (20 ADRs),
  `docs/runbooks/patch-refresh.md`, `DATA_LICENSE` — all present.
- **`npm run docs:check`**: passes — "20 ADRs, contiguous, indexed, links resolve."
- **CONTRIBUTING.md vs `package.json` scripts**: every script table entry matches
  an actual `package.json` script; CI step order in CONTRIBUTING.md matches
  `.github/workflows/ci.yml` exactly.
- **Data-patch consistency**: `data.generated.json` patch `6.7` matches the
  patch noted in `docs/speed-report.md`.
- **Secrets scan**: no tracked `.env*` files (`.gitignore` excludes them, only
  `.env.example` is tracked with empty values); no API-key-shaped strings
  (`sk-ant-`, AWS keys, private key blocks, Slack tokens) found via `git grep`
  across tracked files.
- **`api/` validation & rate limiting**: `api/explain.ts` + `api/_ratelimit.ts`
  are well-built — origin allowlist, body-size cap enforced on parsed body (not
  just header), strict `parseExplainPayload` with per-field length/charset/range
  caps, prompt-injection-resistant `<build_data>` delimiter with angle-bracket
  stripping, sequential per-IP-then-global Upstash sliding-window rate limits
  that fail closed in production when unconfigured, and generic error responses
  that never leak upstream details.
- **LICENSE / DATA_LICENSE coherence**: code is MIT (`LICENSE`); game reference
  data is separately scoped as numeric-only/no-assets under `DATA_LICENSE`,
  consistent with the README's "Data & license" section.
- **`package.json` version `0.0.0`**: expected/normal for a `private: true`,
  unpublished app — not a defect, just noting it was checked.
- **Dependabot**: configured for both `npm` (weekly, minor/patch grouped) and
  `github-actions` (weekly) ecosystems.
