# Web Interface Guidelines Audit

Source: https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
Scope: index.html, src/index.css, tailwind.config.js, src/main.tsx, src/components/*.tsx, src/components/ui/*.tsx (excluding *.test.tsx)

Overall: this codebase is unusually disciplined about accessibility (focus-visible rings everywhere via `.focus-ring`, aria-live regions built persistent-first, aria-disabled instead of disabled to preserve focus, touch-target 44px baked into shared recipes, two-step destructive confirmation, keyboard-complete Combobox/Segmented). Findings below are the residue after that — mostly moderate/minor.

## src/index.css

src/index.css:200 - `.btn-primary` transitions `[transform,filter]` and uses `hover:brightness-110` — `filter` is not compositor-friendly (animation rule: animate transform/opacity only). Moderate.

## tailwind.config.js

tailwind.config.js:87-90 - `pulse-glow` keyframes animate `boxShadow`, not transform/opacity — not compositor-friendly. Used live on the primary Optimise button for the whole duration of a search (`OptimizePanel.tsx:413`), so this is the one animation in the app that runs continuously and isn't GPU-composited. Moderate.

## index.html

index.html:13-18 - preconnect is set for the font hosts but no `<link rel="preload" as="font" ...>` for the critical display face (Space Grotesk, used in the h1 above the fold). `font-display=swap` is present via the Google Fonts URL, so FOIT is avoided, but first paint of the hero heading still waits on a font fetch that isn't preloaded. Minor.

## src/components/ImportPanel.tsx

src\components\ImportPanel.tsx:30 - `BAD_FILE` uses a straight apostrophe ("isn't") while every other user-facing string in this file and its siblings uses curly quotes (e.g. `ImportPanel.tsx:16 "Couldn't reach Enka"` is actually curly ’ — confirm against `BAD_FILE`). Typography rule: curly quotes not straight. Minor.

## src/components/landing.tsx

src\components\landing.tsx:68 - `<h1>` (ThesisHero) has no `text-wrap: balance` / `text-pretty` — at the sm/5xl breakpoint this two-line heading can widow. Minor.
src\components\landing.tsx:85 - `<h1>` (SolvedHero) same issue. Minor.
src\components\landing.tsx:49 - `<h2>` (Section title) same issue, lower impact since usually short. Minor.

## src/components/GapReport.tsx

src\components\GapReport.tsx:9 - `<h3>` lacks `text-wrap: balance`/`text-pretty`. Minor.

## src/components/SampleGear.tsx

src\components\SampleGear.tsx:37 - `<h2>` lacks `text-wrap: balance`/`text-pretty`. Minor.

## Files reviewed with no findings

- src/main.tsx — ✓ pass
- src/components/App.tsx — ✓ pass (skip link, persistent live regions, real disabled+aria-describedby locked-step buttons, scroll-margin-top, aria-current nav)
- src/components/ErrorBoundary.tsx — ✓ pass
- src/components/ArtifactForm.tsx — ✓ pass (labels, inline error + focus-first-error, live region)
- src/components/BuildCard.tsx — ✓ pass (tabular-nums, tie-break copy, decorative glyphs aria-hidden)
- src/components/ExplainBuild.tsx — ✓ pass (aria-busy/aria-disabled pattern, skeleton loading state, "…" on loading verbs)
- src/components/GapSection.tsx — ✓ pass
- src/components/OptimizePanel.tsx — ✓ pass aside from the pulse-glow animation noted above
- src/components/Results.tsx — ✓ pass (em-dash/minus sign handling, share fallback states, non-positive gap by construction)
- src/components/SlotGlyph.tsx — ✓ pass (documented rationale for aria-hidden decorative SVG)
- src/components/ui/Badge.tsx, Callout.tsx, Combobox.tsx, Drawer.tsx, Marker.tsx, Meter.tsx, Segmented.tsx, CharacterLine.tsx, Disclosure.tsx, ElementName.tsx, GradeMarker.tsx, SearchCounts.tsx, SourceLink.tsx — ✓ pass. Notably: Combobox.tsx renders up to 235 `<li>` options without a virtualization library but explicitly substitutes `content-visibility: auto` (an allowed alternative per the performance rule) — documented in a comment at Combobox.tsx:10-19.

## No anti-patterns found

No `user-scalable=no`/`maximum-scale=1`, no `onPaste`+`preventDefault`, no `transition: all`, no unguarded `outline-none`, no `<div>`/`<span onClick>` used as a button, no images missing dimensions (the app uses no raster `<img>` tags at all — SVG only), no literal `...` in place of `…`, no `autoFocus`.

## Counts

- Critical: 0
- Serious: 0
- Moderate: 2
- Minor: 7
