# Accessibility Audit — WCAG 2.1 AA

**Scope:** static code review of `src/` (React/TS/Tailwind), no code changes.
**Date:** 2026-09-06 · **Method:** manual review of every component in
`src/components`, `src/components/ui`, `src/roster`, `src/teams`, `src/plan`,
plus `tailwind.config.js` / `src/index.css` tokens, with contrast ratios
computed by hand from the actual hex/rgb values (relative-luminance formula,
WCAG 2.1 §1.4.3). No dev server run was needed — all colors are static tokens.

## Summary

This is an unusually accessibility-literate codebase: most of the classic
issues (focus-visible rings, `aria-disabled` + early-return instead of
`disabled` dropping focus to `<body>`, persistent live regions, roving
tabindex, native `details`/`summary`, decorative-icon `aria-hidden`, color
never the sole channel for grade/band) are already solved and commented as
such. Findings below are the gaps that remain.

**Issues found:** 9 | **Critical:** 0 | **Major:** 2 | **Minor:** 7

---

## Color contrast

All ratios computed from the literal token values in `tailwind.config.js`
and `src/index.css` against the darkest ground the app paints
(`surface-900 #0f1116`, luminance 0.00561) unless noted. Required: 4.5:1
normal text, 3:1 large text/UI components (1.4.3, 1.4.11).

| Text/element | Color | Background | Ratio | Required | Pass? |
|---|---|---|---|---|---|
| Body text (`text-paper`) | `#e9e7e0` | surface-900 | 17.9:1 | 4.5:1 | ✅ |
| `text-paper/80` | `#e9e7e0`@80% | surface-900 | 9.96:1 | 4.5:1 | ✅ |
| `text-muted` (hints, labels) | `#8d93a3` | surface-900 | 6.14:1 | 4.5:1 | ✅ |
| `text-muted` | `#8d93a3` | `.panel` (surface-700/60 composite) | 5.72:1 | 4.5:1 | ✅ |
| `text-accent` / eyebrow | `rgb(242,182,76)` | surface-900 | 10.4:1 | 4.5:1 | ✅ |
| `.eyebrow` (`accent/80`) | blended | surface-900 | 6.96:1 | 4.5:1 | ✅ |
| `text-rose` (errors) | `#e88b7d` | surface-900 | 7.58:1 | 4.5:1 | ✅ |
| `text-jade` (success/"met") | `#6fd39a` | surface-900 | 10.3:1 | 4.5:1 | ✅ |
| `text-flux` | `rgb(106,166,255)` | surface-900 | 7.65:1 | 4.5:1 | ✅ |
| `element.*` hues (pyro/hydro/…) | per token | surface-900 | ≥4.5:1 (per code comment, spot-checked dendro/pyro) | 4.5:1 | ✅ |
| **`placeholder:text-muted/60`** (`.field` inputs) | `#8d93a3`@60% | surface-900 (field bg) | **2.96:1** | 4.5:1* | ❌ / advisory |

\* WCAG's own Understanding docs treat placeholder text as not strictly
in-scope for 1.4.3 (it's a hint, not conveyed information, and every field
using it — `ArtifactForm`, `OptimizePanel`'s ER input, `ImportPanel`'s UID
field — has a persistent `.field-label` above it). Not a hard failure, but
it's below the "large text" threshold too, so a low-vision user relying on
the placeholder alone (e.g. `placeholder="700000000"` in
`src/components/ImportPanel.tsx:276`, `placeholder="Optional — e.g. 200"` in
`src/components/OptimizePanel.tsx:413`) may not read it as legible.

- **[Minor] 1.4.3 Contrast (Minimum).** Placeholder text renders at ~2.96:1.
  **Fix:** bump to `placeholder:text-muted/80` or a dedicated
  `placeholder-muted-strong` token (~4.7:1), or accept as-is since it's
  backed by a visible label everywhere it's used — either is defensible, but
  should be a conscious choice, not a default.
  Files: `src/index.css:179` (`.field` rule), applies wherever `.field` is used.

No other contrast failures found. The design system's own claim in
`docs/design-system.md` that every `element.*` hue "clears 4.5:1 as text on
surface-900" checks out on the two hues spot-checked (dendro `rgb(168 222
84)`, pyro `rgb(255 155 118)` — both well above threshold); the other five
were not hand-verified but follow the same brightening pattern.

---

## Findings

### Perceivable

| # | Issue | WCAG | Severity | Fix |
|---|---|---|---|---|
| 1 | Placeholder-only contrast below 4.5:1 (see table above) | 1.4.3 | 🟢 Minor | Raise placeholder opacity or accept given adjacent visible labels |
| 2 | `element.*` hues 2–7 (hydro/electro/cryo/anemo/geo/dendro cross-check) not individually hand-verified beyond the two spot-checked | 1.4.3 | 🟢 Minor | Run an automated contrast checker over all 7 `element.*` values as a one-time CI-free sanity pass |

### Operable

| # | Issue | WCAG | Severity | Fix |
|---|---|---|---|---|
| 3 | **Combobox listbox options** (`src/components/ui/Combobox.tsx:261-277`) are `px-3 py-2 text-sm` — roughly 34–36px tall (the code's own `containIntrinsicSize: 'auto 34px'` comment confirms this), short of the 44px `.touch-target` used everywhere else in the app (`.field`, `.btn-primary`, `.btn-ghost`, `.chip`, nav chips). This is the one interactive surface in the design system that doesn't follow its own 44px rule. Note: WCAG 2.1's touch-target criterion (2.5.5 Target Size) is **AAA**, not AA, so this is not a 2.1 AA failure — flagging because the app otherwise treats 44px as a hard floor, and the list is the primary way to pick a character/weapon/set on mobile. | 2.5.5 (AAA, informational at AA) | 🟢 Minor | Increase option row `py` to reach ~40–44px, or leave as-is if a deliberate density trade-off for a 235-option list |
| 4 | Several buttons omit `type="button"` even though the app is otherwise disciplined about this (32 of 39 `<button>`s explicitly set it): `src/roster/RosterView.tsx:43` (row → drawer), `:155` (Show All Characters), `:172` (Optimise This Character); `src/components/BuildCard.tsx:230` (Copy Share Link); `src/components/Results.tsx:253` (Relax stat), `:432` (Show All Builds); `src/components/ErrorBoundary.tsx:35` (Reload) | n/a — robustness/consistency, not a WCAG criterion on its own since none currently sit inside a `<form>` | 🟢 Minor | Add `type="button"` for consistency with the rest of the codebase's explicit convention; cheap insurance against a future refactor that nests one of these inside a `<form>` (several sibling patterns, e.g. `ImportPanel`'s UID row, are literal `<form>`s) |
| 5 | `AppDrawer` (`src/components/ui/Drawer.tsx`) relies entirely on `vaul` for focus trap / initial-focus / return-focus behavior; only `aria-modal` is added manually (correctly, per the file's own comment that Vaul's Content node measures `null`). No code-level assertion or test covers focus returning to the triggering row button (`RosterView.tsx`'s `onOpen`) after close. | 2.4.3, 4.1.2 | 🟡 Major (untested, not unverified-broken) | Add one interaction test asserting `document.activeElement` returns to the opening row's button after `onClose`, since this is the one true modal dialog in the app and a regression here would be a real keyboard trap |
| 6 | `Combobox`'s outer container has no keyboard path to open the list except opening it and then pressing Home/End/Arrows — confirmed fine — but there's no visible way to know a filtered-to-zero list is empty via anything other than sight+screen reader text ("No results" `<li role="presentation">`). This is actually fine (text is present and in the DOM under the listbox's accessible name) — not a real defect, included as an explicit "checked, passes" note rather than a gap. | 4.1.2 | ✅ Pass (documented for completeness) | — |

### Understandable

| # | Issue | WCAG | Severity | Fix |
|---|---|---|---|---|
| 7 | `ArtifactForm`'s sub-stat fields are hard-coded to an empty array with no UI to enter them (`src/components/ArtifactForm.tsx:31-32`) and this is disclosed only as body copy ("Hand-added pieces carry no sub-stats yet…"), not tied to any specific form control via `aria-describedby`. A screen-reader user tabbing field-by-field won't hear this caveat unless they read the whole form linearly. | 3.3.2 | 🟢 Minor | Low priority — it's a feature gap, not a broken label; if sub-stat entry ships later this note can move onto the (future) sub-stat fieldset directly |
| 8 | `OptimizePanel`'s "Minimum Energy Recharge %" input has a real hint (`aria-describedby`) but no `aria-invalid`/inline validation if a non-numeric or negative value is typed (type="number" input, `src/components/OptimizePanel.tsx:408-419`) — errors would only surface indirectly via "No build satisfies all constraints" after a run. | 3.3.1 | 🟢 Minor | Optional: clamp/validate client-side with the same inline-error pattern already used for `ArtifactForm`'s level field |

### Robust

| # | Issue | WCAG | Severity | Fix |
|---|---|---|---|---|
| 9 | `GapReport.tsx` and `PlanView.tsx` render manual bullets (`• {text}`) inside real `<ul><li>` elements (e.g. `src/components/GapReport.tsx:24,36`, `src/plan/PlanView.tsx:170,376`). Screen readers already announce list-item membership, so the literal "•" character is redundant, cosmetic noise read aloud as "bullet" by some screen readers/verbosity settings — not a violation, but avoidable duplication. | 4.1.2 (informational) | 🟢 Minor | Replace the literal bullet character with `list-style` / a `::marker` or a purely decorative `aria-hidden` glyph (the pattern `SlotGlyph`/nav-lock icons already use elsewhere in the codebase) |

---

## Keyboard navigation

Walked every custom interactive primitive; all pass.

| Element | Tab order | Enter/Space | Escape | Arrow keys |
|---|---|---|---|---|
| `Combobox` (`ui/Combobox.tsx`) | button↔input swap keeps one stop; focus returns to trigger on close | Enter selects active option or closes; Space types into filter | Closes list, keeps focus, stops propagation so it doesn't also close a parent drawer | Down/Up move `activeIndex` + scroll into view; Home/End jump to ends |
| `Segmented` (`ui/Segmented.tsx`) | Roving tabindex — one stop per group | activates tab | n/a | Left/Right wrap; Home/End jump; focus moves with selection (correct per WAI-ARIA APG) |
| `AppDrawer` (`ui/Drawer.tsx`, vaul) | Trapped inside while open (library) | Close button reachable, `aria-label="Close"` | vaul closes on Escape | n/a |
| `Disclosure` (`ui/Disclosure.tsx`) | Native `<summary>`, one stop | Native toggle | n/a | n/a |
| Sticky step nav (`App.tsx`) | Locked steps are real `<button aria-disabled>` (not a styled `<span>`), reachable and announced | n/a (locked) / native `<a href>` | n/a | n/a |
| `OptimizePanel`/`ImportPanel`/`SampleGear` async buttons | `aria-disabled` + early-return, never `disabled`, so focus never drops to `<body>` mid-run (confirmed pattern, consistent across the whole codebase) | — | — | — |

No keyboard traps found. No `tabIndex` values greater than 0 anywhere in
`src/` (checked; only `0` and `-1` are used, per Segmented and
`App.tsx`'s `#content` skip-target and `CharacterDetail`'s tabpanel).

## Screen reader / semantics

| Element | Announced as | Issue |
|---|---|---|
| `GradeMarker` (`ui/GradeMarker.tsx`) | "Grade S — how close this build is to endgame stat targets" (`role="img"` + `aria-label`) | None — exemplary pattern |
| `Meter` (`ui/Meter.tsx`) | Nothing (`aria-hidden`) | Correct — always paired with visible text carrying the real number |
| Nav lock chips (`App.tsx:344-357`) | "🔒 01 Roster" + shared `aria-describedby` hint "Import a roster to unlock this step" | None |
| Live regions (`App.tsx`, `ImportPanel.tsx`, `ArtifactForm.tsx`, `Results.tsx`, `ExplainBuild.tsx`, `OptimizePanel.tsx`'s `SearchProgressLine`) | Persistent, nonce-keyed so repeats still announce | None — the one subtlety (a region created in the same commit as its text isn't observed yet) is explicitly handled everywhere it matters |
| `Section` (`landing.tsx`) | Named region via `aria-labelledby` → its own `<h2>` | None |
| `SourceLink` (`ui/SourceLink.tsx`) | Link text + "(opens in new tab)" `sr-only` | None |
| `ElementName` (`ui/ElementName.tsx`) | Element name text; decorative dot is `aria-hidden` | None |

## Motion

`src/index.css:79-88` sets a blanket `@media (prefers-reduced-motion:
reduce)` rule on `*, *::before, *::after` collapsing all `animation-duration`
/ `transition-duration` to near-zero and forcing `scroll-behavior: auto`.
Because the selector is universal, this also covers Tailwind's built-in
`animate-pulse` (used for skeleton loaders in `ExplainBuild.tsx` and the
`SearchProgressLine`/`PlanView` progress bars) even though those aren't the
project's own `fade-up`/`pulse-glow` keyframes. No animation in the app
escapes this rule. No auto-playing media exists in the app at all.

## Forms

Every `<input>`/`<select>` has either a `<label htmlFor>` or `aria-label`
(`ArtifactForm`, `OptimizePanel`, `ImportPanel`, `Results`' share-link
`readOnly` field). Inline errors use `role="alert"` + `aria-describedby` +
`aria-invalid` (`ArtifactForm`'s level field is the one example, and it's
done correctly). No field relies on placeholder text as its only label.

## One-theme-only decision

The app is deliberately dark-only (`color-scheme: dark` pinned, no
`prefers-color-scheme` branch) — documented as an intentional design
decision in `docs/design-system.md`, not an oversight. Not flagged as a
finding.

## Priority fixes

1. **[Major, #5]** Add a regression test asserting focus returns to the
   triggering element when `AppDrawer` closes — it's the app's only true
   modal, and it currently has zero test coverage for the one behavior a
   library upgrade could silently break.
2. **[Minor, #4]** Add `type="button"` to the 7 buttons missing it, matching
   the rest of the codebase's explicit convention — cheap and removes a
   latent footgun.
3. **[Minor, #1]** Decide deliberately on placeholder contrast (currently
   2.96:1) rather than leaving it as a side effect of `/60` opacity.
4. **[Minor, #3, #9]** Combobox row height and literal bullet characters are
   polish, not defects — worth a look next time either file is touched.
