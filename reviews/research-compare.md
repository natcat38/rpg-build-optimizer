# Competitive & practices research — ranked ideas

Compared against frzyc/genshin-optimizer (dominant tool, React+MUI monorepo, Waverider/Pando
calc engines), Akasha.cv (build showcase/leaderboards), genshin.aspirine.su (lightweight
calculator), and general TS portfolio-repo practice. Excludes things already present:
GOOD import, Enka fetch, share links, exact optimizer, roster/team/plan/investment features,
GitHub topics, CI (typecheck/lint/test/build/bench-check/docs-check), Vercel deploy,
AI-explain proxy, ADRs/CONTEXT.md.

## High value, worth adopting

1. **Social preview / OG image for the repo and site** — `homepageUrl` and topics are set but
   there's no custom social-preview image (repo Settings → social preview) or `<meta
og:image>` on the deployed site; first impression for recruiters/link shares. _Low effort._
2. **CHANGELOG.md / GitHub Releases** — genshin-optimizer and most mature TS repos tag
   releases with notes; this repo has none, making "what changed recently" invisible to a
   visitor skimming history. _Low effort_ (can generate from conventional commits or just
   hand-write on tags).
3. **Bundle-size CI check** — no budget/regression guard on the Vite bundle exists; a
   `size-limit` or `bundlewatch` step in CI is a common signal of engineering discipline in
   standout TS repos and catches accidental dependency bloat (e.g. from future data growth).
   _Low-medium effort_ (one CI step + baseline).
4. **Lighthouse CI on the deployed preview** — no automated perf/accessibility score gate;
   cheap to add via `lighthouse-ci-action` against the Vercel preview URL and surfaces
   regressions (this is a client-heavy app where a11y/perf matters). _Medium effort._
5. **Per-PR deploy preview called out in PR template/CI** — Vercel likely already generates
   preview URLs automatically, but nothing surfaces/links it in the PR checks explicitly;
   worth confirming it's enabled and linking it from CONTRIBUTING.md if not obvious.
   _Low effort._

## Medium value

6. **Formula-verified damage engine parity note** — genshin-optimizer's older Waverider engine
   computed full rotational damage; this repo's `src/damage` (ADR-0016) already does
   curated avg-damage profiles for select characters, which is the right scoped choice for a
   portfolio project — but the README/docs could state explicitly _why_ full rotation
   simulation is out of scope (ADR-style) to preempt "why not compute real DPS" questions.
   _Low effort (doc-only)._
7. **Build/leaderboard sharing akin to Akasha's showcase** — Akasha aggregates real players'
   Abyss-verified builds into public leaderboards; this repo's share links are single-build,
   ephemeral URLs with no aggregation/leaderboard. A public leaderboard is a large scope
   expansion (needs a backend, moderation, verification) — explicitly **out of scope** for a
   client-side, no-backend portfolio project; worth a one-line ADR/README note saying so
   rather than silently lacking it.
8. **Storybook / component demo page** — `src/components/ui` (19 primitives, documented in
   docs/design-system.md) has no interactive demo; a small Storybook or a single
   `/design-system` route showcasing Badge/Meter/Combobox/etc. would let recruiters see the
   UI kit without running the full app. _Medium effort._
9. **Multi-language / i18n** — genshin-optimizer supports many locales; this repo is
   English-only. For a focused portfolio project this is reasonably **out of scope** (adds
   translation-maintenance burden with no architecture payoff) — note as an explicit
   non-goal rather than a gap.

## Low value / explicitly out of scope

10. **Full rotation/combo damage simulator, multi-game support (HSR/ZZZ), desktop artifact
    scanner, Discord bot** — all present in genshin-optimizer as a large team-maintained
    monorepo. Each is a multi-week feature addition disproportionate to a solo portfolio
    project whose thesis is the branch-and-bound optimizer itself; call these out as
    deliberate non-goals in README rather than gaps to close.
11. **Account/auth-backed leaderboards or cloud save** — conflicts with the repo's core
    "100% client-side, no server-side state" design decision (ADR-0001/0005); do not adopt.

## Not found / no action needed

Aspirine offers no notable capability this repo lacks (it is explicitly the lighter-weight
tool of the two competitors compared). No other widely-used third-party optimizer surfaced
in search beyond genshin-optimizer, Akasha, and Aspirine.
