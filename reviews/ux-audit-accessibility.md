# WCAG 2.2 AA Accessibility Audit — RPG Build Optimizer

**Scope:** `index.html`, `src/index.css`, `tailwind.config.js`, `src/components/App.tsx` and all listed child/UI components.
**Method:** Manual code read against WCAG 2.2 AA success criteria specified in the audit brief. No automated contrast tooling or screen-reader pass was run — contrast findings below are computed by hand from the Tailwind color tokens and should be spot-checked with a contrast checker before closing.

## Executive summary

This codebase is unusually accessibility-conscious for a hand-built SPA — persistent live regions are used correctly throughout (mount-before-content, nonce-keyed re-announcement), focus is never dropped to `<body>` (the `aria-disabled` + early-return pattern is used deliberately and consistently instead of native `disabled` on buttons that can go busy mid-click), a single shared `.focus-ring` utility replaces `outline-none` everywhere it's used, `prefers-reduced-motion` is honored globally, decorative icons are consistently `aria-hidden`, and the `Combobox`/`Segmented` primitives implement real roving-tabindex / listbox keyboard patterns (arrows, Home/End, Escape, `aria-activedescendant` with scroll-into-view).

**Findings: 0 critical, 1 serious, 5 moderate, 6 minor (12 total).** The one serious finding is a landmark-semantics bug (`<header>`/`<footer>` nested inside `<main>`, which strips their implicit `banner`/`contentinfo` roles per the HTML-AAM spec) that affects every page load. The moderate/minor findings are smaller gaps — a couple of accessible-name omissions, one contrast value worth verifying with a tool, and a long-running-search live region that only speaks at the very end.

---

## Serious

### S1. `<header>` and `<footer>` lose their landmark roles by being nested inside `<main>`

- **File:** `src/components/App.tsx:294-538`
- **WCAG:** 1.3.1 Info and Relationships
- **Issue:** The whole page is wrapped in one `<main>` (line 295), and both `<header>` (line 302) and `<footer>` (line 533) are children of it. Per the HTML Accessibility API Mappings, `<header>` only maps to the `banner` landmark role — and `<footer>` only to `contentinfo` — when it is **not** a descendant of `article`, `aside`, `main`, `nav`, or `section`. Nested inside `<main>` as they are here, both elements lose their landmark role entirely and become anonymous `generic` regions. A screen-reader user navigating by landmark (a primary AT navigation method) gets one `main` region and never a `banner` or `contentinfo` — the page header and footer become unreachable via landmark navigation.
- **Remediation:** Move `<header>` and `<footer>` to be siblings of `<main>` (all three as children of `<body>`/the app root), or, if the current single-root layout must be kept, drop `<main>` down to wrap only the `<div id="content">` section instead of the whole page.

---

## Moderate

### M1. Rank badge on `BuildCard` carries no accessible label

- **File:** `src/components/BuildCard.tsx:195-196`
- **WCAG:** 4.1.2 Name, Role, Value / 1.3.1 Info and Relationships
- **Issue:** `<span className="section-badge section-badge-sm">{rank}</span>` renders a bare digit ("1", "2", …) next to the score. A screen reader announces just "1" with no indication it's a build rank — unlike the delta chip a few lines below it (line 212), which does carry `aria-label="Rank gap: …"`. Sighted users get the meaning from position (top-left of the card, beside the score); AT users don't.
- **Remediation:** Add `aria-label={`Rank ${rank}`}` (or wrap the digit in visually-hidden text: "Rank" + the number) on the badge span.

### M2. Long-running search gives screen-reader users no feedback until it finishes

- **File:** `src/components/OptimizePanel.tsx:143-179` (`SearchProgressLine`), `src/components/App.tsx:169-179` (`announce`)
- **WCAG:** 4.1.3 Status Messages
- **Issue:** While a search runs, `explored`/`pruned`/elapsed-time counters update ~5×/second, but only visually — `SearchProgressLine` has no `aria-live` region, and the app's one persistent `role="status"` region (App.tsx:385) is only written to once, when the run finishes (`announce(...)` in `runCurrent`, App.tsx:226-229). A sighted user sees the numbers climbing and the pulsing bar; a screen-reader user who has moved focus away hears nothing at all for the full duration of a potentially multi-second-to-minute exact search, which reads as a hang.
- **Remediation:** Not a request for a 5×/second live region (that would be worse — SC 4.1.3 explicitly warns against interrupting). A coarse, throttled update (e.g., "Still searching — 12,000 leaves evaluated, 8s elapsed" once every 5–10s) into the existing `role="status"` region would close the gap without spamming.

### M3. `eyebrow` text contrast is borderline and should be verified with a tool

- **File:** `src/index.css:225-227` (`.eyebrow` → `text-accent/80`), used at `App.tsx:306` ("Exact search · proven optimal")
- **WCAG:** 1.4.3 Contrast (Minimum)
- **Issue:** `.eyebrow` sets `font-mono text-2xs` (11.2px, "small text" threshold — needs 4.5:1) at `text-accent/80` — the accent color (`rgb(242 182 76)`) alpha-blended to 80% over the `surface-900` background. Manual sRGB-luminance calculation puts this comfortably above 4.5:1 against the _flat_ `surface-900` (~#0f1116) background, but `.eyebrow` is used inside `<header>` where the actual painted background is the page's radial-gradient + grid overlay (`index.css:39-56`), not flat `surface-900` — the effective contrast in the browser will be slightly different from the flat-color estimate and should be spot-checked with a real contrast tool against the rendered pixels, not just the token value.
- **Remediation:** Verify with a browser contrast checker at the actual render; if it dips under 4.5:1 in the gradient's brighter/lighter areas, drop the `/80` opacity modifier or raise it.

### M4. Locked step buttons pair `disabled` with `aria-describedby`, which most screen readers won't read

- **File:** `src/components/App.tsx:339-350`
- **WCAG:** 3.3.2 Labels or Instructions / 4.1.2 Name, Role, Value
- **Issue:** The locked nav chip is a native `disabled` button carrying `aria-describedby={lockedHintId}` to surface "Import a roster to unlock this step" (`LOCKED_HINT`, `landing.tsx:136`). Native `disabled` elements are removed from the tab sequence, and in practice several major screen-reader/browser combinations (NVDA+Firefox, VoiceOver+Safari in some versions) either skip disabled buttons on virtual-cursor sweep or don't reliably read `aria-describedby` on them — so the explanatory hint the code clearly intends to expose (per its own comment, "a real disabled control … the hint lived in `title`" being the thing it was fixing) may still not reach every AT user, even though it is now technically wired up correctly for the ones that do support it.
- **Remediation:** Consider `aria-disabled="true"` (keeping it focusable, matching the pattern already used everywhere else in this codebase for exactly this reason) instead of native `disabled`, so the description is reliably reachable by Tab + read by AT.

### M5. Hand-written static `id`s are a latent duplicate-ID risk

- **File:** `src/components/ArtifactForm.tsx:156` (`id="level-input"`), `src/components/ImportPanel.tsx:202,228` (`id="good-file"`, `id="uid-input"`)
- **WCAG:** 4.1.2 Name, Role, Value / 1.3.1 Info and Relationships
- **Issue:** These three ids are hardcoded strings rather than derived from `useId()` — unlike every other labeled field in the same files (`ArtifactForm` uses `useId()` for the Set combobox at line 24; `OptimizePanel` uses it throughout). All three components currently render exactly once each, so there's no live bug today, but a duplicate `id` silently breaks every `htmlFor`/`aria-describedby`/`aria-labelledby` relationship pointing at it (the browser resolves to the _first_ matching element), which is exactly the class of bug 1.3.1/4.1.2 exist to prevent, and this is one refactor (e.g., rendering `ArtifactForm` twice for bulk-add, or a future test harness mounting two instances) away from happening silently.
- **Remediation:** Swap the three hardcoded ids for `useId()`-derived ones, consistent with the rest of the codebase's own convention.

---

## Minor

### N1. `GradeMarker`'s native `title` tooltip doesn't meet 1.4.13 (informational only — the `aria-label` already covers AT users)

- **File:** `src/components/ui/GradeMarker.tsx:10-22`
- **WCAG:** 1.4.13 Content on Hover or Focus
- **Issue:** `title` is a native browser tooltip: not dismissible with Escape in most browsers, not reliably hoverable, and (in most browsers) not shown on keyboard focus at all — so it fails the letter of 1.4.13 for mouse users, though since the same sentence is already exposed via `aria-label` (`role="img"`) the _content_ is not actually hidden from AT. Low real-world impact.
- **Remediation:** No action required if the `title` is only ever meant as a sighted-mouse-user nicety; if closing the gap is wanted, replace it with a custom dismissible/hoverable tooltip component, but this is low priority given the aria-label already carries full meaning to AT.

### N2. Placeholder-only text doesn't need to meet 1.4.3, but several placeholders are the _only_ visible instruction in the field's resting state

- **Files:** `src/components/OptimizePanel.tsx:370` ("Optional — e.g. 200" on Minimum ER), `src/components/ImportPanel.tsx:233` ("700000000" on UID)
- **WCAG:** 3.3.2 Labels or Instructions (adjacent), 1.4.3 (not directly applicable to placeholders, flagged for completeness)
- **Issue:** Both fields do have a real `<label>`/`aria-label`, so 3.3.2 is technically satisfied — but the ER field's only indication that it's optional is placeholder text at reduced contrast (`placeholder:text-muted/60`, `index.css:179`), which disappears the instant the user types and isn't announced by most screen readers as reliably as a persistent hint (compare to the UID field two lines below it, which does have a persistent `<p id="uid-hint">`).
- **Remediation:** Give the ER field the same persistent hint pattern already used for UID and Level (`ArtifactForm.tsx:177-180`), e.g. "Optional — leave blank for no floor," rather than relying on placeholder text alone.

### N3. `<input type="file">`'s native control has no enforced minimum target size

- **File:** `src/components/ImportPanel.tsx:201-207`
- **WCAG:** 2.5.8 Target Size (Minimum)
- **Issue:** The file input is styled via `file:px-3 file:py-2 file:text-xs` pseudo-element classes. Combined padding/line-height puts the clickable "choose file" button in the ~30–34px height range depending on browser/OS chrome rendering (this is UA-rendered, not fully controllable via CSS) — likely compliant but worth a manual click-target check across browsers since file-input styling is one of the least consistent CSS surfaces.
- **Remediation:** Spot-check rendered height in Chrome/Firefox/Safari; if any renders under 24px, wrap the input in a custom-styled label/button of guaranteed size (a common pattern: visually-hidden native input + a `.btn-ghost`-styled `<label htmlFor>`).

### N4. `SearchProgressLine`'s decorative progress bar has no textual fallback of its own

- **File:** `src/components/OptimizePanel.tsx:169-177`
- **WCAG:** 1.3.1 Info and Relationships (informational, not a violation)
- **Issue:** The `aria-hidden` pulsing bar is correctly decorative-only per the component's own comment (there's no real percentage to report), and the real numbers are in the text above it — this is the _correct_ pattern, called out here only because it's adjacent to M2 above and worth confirming stays this way if the bar is ever changed to look like a determinate progress indicator.
- **Remediation:** None — noted for completeness, not a defect.

### N5. `Combobox` listbox has no `aria-required`/error-state wiring if a caller ever needs one

- **File:** `src/components/ui/Combobox.tsx:180-289`
- **WCAG:** 3.3.2 Labels or Instructions
- **Issue:** Not a current bug — every present-day caller (`ArtifactForm`'s Set picker, `OptimizePanel`'s Character/Weapon pickers) has a sensible default value, so there's no "required but empty" state to communicate today. Flagged only because the component has no `aria-invalid`/error-message slot, so a future required-Combobox use case would need one added rather than reused.
- **Remediation:** None required now; note for future component work.

### N6. Skip link relies on default browser focus outline rather than the app's `.focus-ring` treatment

- **File:** `src/components/App.tsx:296-301`
- **WCAG:** 2.4.7 Focus Visible (satisfied — style-consistency note only)
- **Issue:** The skip-to-content link doesn't use the shared `.focus-ring` utility class the rest of the app uses; it's visible on focus (`focus:not-sr-only`) and gets the browser's default focus outline, which does satisfy 2.4.7, but is visually inconsistent with every other focus indicator in the app (accent-colored ring with offset).
- **Remediation:** Add `focus-ring` alongside the existing `focus:not-sr-only focus:absolute …` classes for visual consistency (functionally optional).

---

## What's already solid (no findings)

- **Live regions (4.1.3):** Persistent `role="status"`/`role="alert"` nodes mounted ahead of their content, nonce-keyed to re-announce identical repeats — used correctly in `App.tsx`, `ImportPanel.tsx`, `ArtifactForm.tsx`, `ExplainBuild.tsx`, `Results.tsx`.
- **Focus management (2.4.7, 2.1.1, 2.1.2):** No `outline-none` without a `.focus-ring` replacement anywhere in the audited files. `aria-disabled` + early-return is used deliberately instead of native `disabled` on every button that can go busy mid-interaction, specifically to avoid dropping focus to `<body>`.
- **Keyboard operability (2.1.1):** `Combobox` implements a full combobox pattern (Escape, Arrow Up/Down, Home/End, Enter, `aria-activedescendant` with scroll-into-view, outside-click and blur close). `Segmented` implements roving tabindex with Left/Right/Home/End, deliberately leaving Up/Down alone for the drawer it lives in.
- **Icon accessibility (1.1.1/4.1.2):** Every icon component (`SlotGlyph`, chevrons, checkmarks) is `aria-hidden` with the equivalent text always adjacent; `GradeMarker` correctly promotes to `role="img"` + `aria-label` since its glyph _is_ the information.
- **Heading hierarchy (1.3.1):** Clean h1 → h2 (per `Section`) → h3 (`GapReport`) with no skipped levels found.
- **Reduced motion (2.3.3-adjacent):** Global `prefers-reduced-motion: reduce` handling in `index.css` zeroes animation/transition durations app-wide.
- **Target size (2.5.8):** The shared `.touch-target` utility (`min-h-11` = 44px) is applied consistently to every real interactive control audited.
- **Form labels (3.3.2):** Every input/select in `ArtifactForm`, `ImportPanel`, `OptimizePanel` has an associated `<label>` or `aria-label`, generally with adjacent instructional text.
