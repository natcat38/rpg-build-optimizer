# Web Interface Guidelines Audit — 2026-09-06

Scope: every file under `src/components/`, `src/roster/`, `src/teams/`, `src/plan/`
that renders UI, plus `src/App` entry (`src/main.tsx`), `index.html`,
`tailwind.config.js`, and `src/index.css`. Reviewed against
[vercel-labs/web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines)
(fetched fresh for this pass). Static code review only, no live-browser checks.

**Overall**: this codebase is unusually disciplined about these guidelines
already — most of the standard rules (focus-visible rings, `aria-disabled` +
early-return instead of `disabled` mid-async, persistent live regions,
`prefers-reduced-motion`, `content-visibility` in place of virtualization,
`overscroll-behavior: contain`, safe-area insets, tabular-nums, curly
quotes/ellipses, `scroll-margin-top` under a sticky nav) are implemented
correctly and the reasoning is documented inline. Findings below are the real
gaps found after checking every rule in the guideline against every file; most
files pass cleanly.

## src/components/ImportPanel.tsx

- `src/components/ImportPanel.tsx:255-278` — The UID field has a visible
  `<label htmlFor={uidInputId}>Import by UID</label>` but the `<input>` also
  carries `aria-label="UID"`. `aria-label` wins the accessible-name
  computation, so a screen-reader/voice-control user hears "UID" while the
  visible label reads "Import by UID" — the accessible name doesn't contain
  the visible text. Fails WCAG 2.5.3 Label in Name. **Severity: medium.**
  Fix: drop the `aria-label` (the `<label htmlFor>` already supplies an
  accessible name) or change it to match/contain the visible text.
- `src/components/ImportPanel.tsx:270-282` — UID `<input>` has no `name`
  attribute (only `id`); minor gap in "meaningful name" for form inputs.
  **Severity: low.** Fix: add `name="uid"`.

## src/components/ArtifactForm.tsx

- `src/components/ArtifactForm.tsx:155-171` — Level `<input type="number">`
  has no `name` or `autocomplete` attribute. **Severity: low.** Fix: add
  `name="level"` (autocomplete is moot for a game-data field, but a name
  keeps the control consistent with the rest of the form).

## src/components/OptimizePanel.tsx

- `src/components/OptimizePanel.tsx:408-419` — Minimum ER `<input
  type="number">` has no `name` attribute. **Severity: low.** Fix: add
  `name="minEnergyRecharge"`.
- `src/components/OptimizePanel.tsx:413` and
  `src/components/ImportPanel.tsx:276` — Placeholders showing example values
  (`"Optional — e.g. 200"`, `"700000000"`) don't end in `…` per the
  typography convention for placeholders. **Severity: low (cosmetic).** These
  are example patterns rather than "type here" prompts, so this is a minor
  style nit, not a functional issue — flagging for consistency only.

## src/roster/RosterView.tsx

- `src/roster/RosterView.tsx:43-46` — The row `<button>` (opens the character
  drawer) doesn't carry `.touch-target`/`touch-action: manipulation`, unlike
  essentially every other interactive control in the app (`.btn-primary`,
  `.btn-ghost`, `.field`, `.chip` all bake it in via `index.css`). On touch
  devices this row is subject to the double-tap-zoom delay the rest of the UI
  deliberately avoids. **Severity: low-medium.** Fix: add `touch-target` (or
  `touch-action: manipulation` inline) to the button's className.

## src/labels-core.ts (used throughout Results.tsx, BuildCard.tsx, etc.)

- `src/labels-core.ts:109-123` (`formatScore`, `formatStat`) and
  `src/labels-core.ts:165` (`formatCritRatio`) — all use `Number.toFixed()`
  rather than `Intl.NumberFormat`, so decimal/grouping conventions are
  hardcoded to en-US regardless of the reader's locale. `formatCount`
  (`labels-core.ts:171`) already does this correctly via `toLocaleString()`.
  **Severity: low** — the app is currently English/US-only by design (game
  data, character names, and copy are all English), so this is a latent
  i18n gap rather than an active bug. Fix if/when locale support is ever
  added: swap `toFixed` for `Intl.NumberFormat(locale, { minimumFractionDigits,
  maximumFractionDigits })`.

## Navigation & State (cross-cutting, informational)

- `src/roster/CharacterDetail.tsx:44,70-77` (Segmented tab state),
  `src/roster/RosterView.tsx:105,154-158` (`showAll`), and the plan's
  per-member `<details>` expand state (`src/plan/PlanView.tsx:68-113`) are
  plain `useState`/native `<details>`, not reflected in the URL. Guideline
  calls for deep-linking stateful UI (filters/tabs/expanded panels).
  **Severity: low** — this looks like a deliberate scope decision rather than
  an oversight: the app already has a purpose-built, explicit share
  mechanism for the one thing worth deep-linking (`?b=` via
  `src/share/url.ts`, wired up in `src/components/App.tsx:120-151`), and
  syncing every disclosure/tab to the URL would add noise to a
  single-session compute tool. Flagging only so it's a conscious choice, not
  something to silently fix.

## Everything else — pass

- `src/components/App.tsx` — skip link (`:299-304`), single persistent
  `role="status"`/`role="alert"` regions, `aria-disabled` + early-return
  pattern for the locked-step buttons, `scroll-mt-20`, reduced-motion-safe
  `animate-fade-up`. No violations found.
- `src/components/ErrorBoundary.tsx`, `GapReport.tsx`, `GapSection.tsx`,
  `SampleGear.tsx`, `SlotGlyph.tsx`, `searchProgress.ts` — clean.
- `src/components/landing.tsx` — `Section` correctly names each landmark via
  `aria-labelledby`/`useId`; headings use `text-balance`/`text-pretty`;
  `SourceLink`-style new-tab warnings not needed here. Clean.
- `src/components/Results.tsx`, `BuildCard.tsx`, `ExplainBuild.tsx` — live
  regions correctly separated from on-demand visual Callouts, ellipses/curly
  quotes used correctly throughout, tabular-nums on all numeric columns,
  `min-w-0`/`truncate` on flex text children, clipboard-failure fallback
  offers a manual copy field. Clean.
- `src/components/ui/*` (`Badge`, `Callout`, `CharacterLine`, `Combobox`,
  `Disclosure`, `Drawer`, `ElementName`, `GradeMarker`, `Marker`, `Meter`,
  `SearchCounts`, `SourceLink`, `Segmented`) — `Combobox` in particular
  correctly implements full listbox keyboard semantics, `aria-activedescendant`
  scroll-into-view, and mitigates its 235-option list with
  `content-visibility: auto` (the guideline's own suggested alternative to
  virtualization) rather than a virtualizer. `Drawer` sets `overscroll-behavior:
  contain` and safe-area padding; `SourceLink` bakes in the new-tab
  screen-reader warning at every call site. Clean.
- `src/plan/PlanView.tsx`, `src/roster/CharacterDetail.tsx` (aside from the
  note above), `src/teams/TeamsView.tsx` — clean.
- `index.html` — no `user-scalable=no`/`maximum-scale`, correct
  `preconnect`/`preload` for the critical font, `display=swap` on the
  stylesheet URL, `theme-color` matches the CSS background exactly. Clean.
- `src/index.css` — global `prefers-reduced-motion` override, `focus-ring`
  built on `:focus-visible`, `select.field option` explicit
  background/color for Windows dark-mode `<select>`, `color-scheme: dark`
  on `:root`. No `transition: all` found anywhere in the codebase (checked
  via project-wide grep). Clean.
- `tailwind.config.js` — animations are opacity/transform only. Clean.

No instances found anywhere in `src/` of: blocked paste, `outline-none`
without a focus-visible replacement, `<div>`/`<span>` with click handlers,
images without dimensions (the app uses no raster `<img>` tags — all icons
are inline SVG), unjustified `autoFocus`, or gesture-only interactions
without a keyboard/tap alternative.
