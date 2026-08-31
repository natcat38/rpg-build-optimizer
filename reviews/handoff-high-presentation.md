# Handoff: High-impact presentation improvements

Source: repo review 2026-08-28 (see `reviews/docs-hygiene.md`, `reviews/research-compare.md`).
Goal: make the repo read near-perfect to a recruiter skimming for 90 seconds. All four items are
presentation-only — no app behavior changes. Confirm README tone changes with the user before rewriting prose.

## 1. Demo GIF in README (biggest win)

The README leads with one static screenshot (`docs/screenshot.png`). Record a ~10-second GIF of the
core flow — import GOOD file (or "Try a sample build") → set constraints → solved build appears →
copy share link — and embed it near the top, above or alongside the screenshot.

- The app runs locally with `npm run dev`; "Try a sample build" gives a one-click demo state with no data needed.
- Keep the file small (<5 MB); put it at `docs/demo.gif` and reference like the existing screenshot.
- Needs a screen recorder — if unavailable in the session, script the flow with the browser tools and
  capture frames, or leave precise recording instructions for the user.

## 2. "Engineering highlights" section in README

Add a short section (3–5 bullets) near the bottom of README.md surfacing wins currently buried in ADRs:

- Exact branch-and-bound search, provably optimal, verified against a brute-force oracle test.
- CI drift gates: generated data snapshot, generated docs (`docs:check`), benchmark report (`bench:check`).
- Prompt-injection-hardened serverless AI proxy: origin allowlist, strict payload validation,
  fail-closed Upstash rate limiting (see `api/explain.ts`, `api/_ratelimit.ts`, ADR-0010).

Link each bullet into the relevant ADR in `docs/adr/`. Match the README's existing voice.

## 3. Social preview / OG image

- Repo: GitHub Settings → Social preview needs a custom image — cannot be set via `gh` CLI; generate a
  1280×640 image (can derive from `docs/screenshot.png` + title text) and leave it for the user to upload,
  with instructions.
- Site: add `<meta property="og:image" ...>` (+ `og:title`, `og:description`, `twitter:card`) to
  `index.html`, hosting the image in `public/`. This part is fully automatable.

## 4. package.json metadata

Add to `package.json` (currently only name/version/private/type/engines):

- `"description"` — reuse the GitHub repo description.
- `"repository": { "type": "git", "url": "https://github.com/natcat38/rpg-build-optimizer" }`
- `"homepage": "https://rpg-build-optimizer.vercel.app"`
- `"keywords"`: genshin-impact, artifact-optimizer, branch-and-bound, combinatorial-optimization, react, typescript.

## Verification gate

`npm run lint && npm run typecheck && npm run docs:check` after edits; README link check is covered by
`docs:check`. One commit per item or one batch commit — small scope, PR to `main` per repo convention.
