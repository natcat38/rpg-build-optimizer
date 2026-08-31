# UX Audit Validation — adversarial pass

Every finding in `ux-audit-accessibility.md`, `ux-audit-heuristics.md` and
`ux-audit-wig.md`, checked against the cited file/lines and the cited principle.
Default posture: skeptical — a finding is only CONFIRMED when the code does what
it claims *and* the principle is correctly attributed and genuinely violated.

**Totals: 42 findings — 27 CONFIRMED, 11 PARTIALLY CONFIRMED, 4 REFUTED.**

---

## Accessibility audit (12 findings)

| Finding | Cited principle | Verdict | Note |
|---|---|---|---|
| S1 `<header>`/`<footer>` nested in `<main>` lose landmark roles (App.tsx:294-538) | WCAG 1.3.1 | **CONFIRMED** | `<main>` opens at 295, `<header>` at 302, `<footer>` at 533 — both are descendants. HTML-AAM is correctly quoted: `header`/`footer` map to `banner`/`contentinfo` only when not scoped to `article/aside/main/nav/section`. Real landmark-navigation loss. |
| M1 Rank badge has no accessible name (BuildCard.tsx:195-196) | 4.1.2 / 1.3.1 | **CONFIRMED** | Line 196 is exactly `<span className="section-badge section-badge-sm">{rank}</span>`. The contrast with the delta chip's `aria-label` at line 212 is accurate. |
| M2 No SR feedback during a long search (OptimizePanel.tsx:143-179; App.tsx:169-179) | 4.1.3 | **CONFIRMED** | `SearchProgressLine` carries no live region; App's `role="status"` (385) is written only by `announce()` in `runCurrent` (226-229) at completion. Remediation correctly avoids the 5Hz-live-region anti-pattern. |
| M3 `.eyebrow` contrast borderline (index.css:225-227) | 1.4.3 | **PARTIALLY CONFIRMED** | Code cite correct (`text-accent/80`, `text-2xs`, used at App.tsx:306). But recomputing: `rgb(242 182 76)` at 80% over `#0f1116` gives ~**6.9:1**, and the gradient overlay is a 0.1-alpha accent wash that cannot drag that under 4.5:1. This is not a violation — it is a verification request with no defect behind it. Should not be scored moderate. |
| M4 Locked step buttons pair native `disabled` with `aria-describedby` (App.tsx:339-350) | 3.3.2 / 4.1.2 | **CONFIRMED** | Code confirmed exactly (`disabled` + `aria-describedby={lockedHintId}`, hint at 374-376). Principle correctly applied, and the finding is honest that it is a support gap, not a spec violation. **Note: the heuristics report lists this same code as a strength ("a genuine accessibility win") — the two reports contradict each other; the a11y read is the better-supported one.** |
| M5 Hardcoded static ids (ArtifactForm.tsx:156; ImportPanel.tsx:202,228) | 4.1.2 / 1.3.1 | **PARTIALLY CONFIRMED** | All three lines verified verbatim, and the `useId()` inconsistency is real (ArtifactForm.tsx:24). But the finding states it itself: no current duplicate-ID, so no live violation. Latent risk / convention note, not a WCAG failure today. |
| N1 `GradeMarker` native `title` (ui/GradeMarker.tsx:10-22) | 1.4.13 | **CONFIRMED** | `title` and `aria-label` both set to the same sentence, `role="img"` via `Marker`. The finding correctly downgrades itself to informational. |
| N2 Placeholder-only "optional" cue (OptimizePanel.tsx:370; ImportPanel.tsx:233) | 3.3.2 (adjacent) | **CONFIRMED** | Both placeholders verified. ER field at 363-372 has a `<span className="field-label">` but no persistent hint; UID field does have `#uid-hint` (252-261). Comparison is accurate. |
| N3 File input target size (ImportPanel.tsx:201-207) | 2.5.8 | **PARTIALLY CONFIRMED** | Code cite correct. But the class list has `focus-ring` and no `touch-target`, and the report offers no measurement — it is a "please check" item, not a finding. 2.5.8 exempts UA-rendered controls in practice; low confidence either way. |
| N4 Decorative progress bar (OptimizePanel.tsx:169-177) | 1.3.1 (informational) | **CONFIRMED** | Bar is at 173-176 with `aria-hidden="true"`; the report explicitly says this is the correct pattern and not a defect. Accurate. |
| N5 `Combobox` has no `aria-invalid`/error slot (ui/Combobox.tsx:180-289) | 3.3.2 | **CONFIRMED** | Grep confirms no `aria-invalid`/`aria-required` anywhere in the file. Correctly flagged as future-work, not a current bug. |
| N6 Skip link doesn't use `.focus-ring` (App.tsx:296-301) | 2.4.7 (satisfied) | **CONFIRMED** | Verified: `sr-only focus:not-sr-only focus:absolute …` with no `focus-ring`. Correctly scored as a style-consistency note, not a violation. |

---

## Heuristics audit (21 findings — see count discrepancy below)

| Finding | Cited principle | Verdict | Note |
|---|---|---|---|
| [minor] No next-step CTA under hero (landing.tsx:116-119) | Recognition over recall | **CONFIRMED** | Lines 116-119 are the "not your gear" caveat; nothing in `SolvedHero` links to `#step-load`. |
| [moderate] Hand-added-piece caveat buried (ArtifactForm.tsx:183-190) | Progressive disclosure | **REFUTED** | The caveat is at 187-190 and the **submit button is at 205** — only the (conditional) error Callout and sr-only status sit between them. The caveat is already "directly above the Add Artifact button", which is the finding's own proposed fix. Behaviour misread. |
| [minor] No minimum-duration guard on progress UI (OptimizePanel.tsx:169-176) | Doherty Threshold | **CONFIRMED** | `{running && <SearchProgressLine …>}` at 426 with no debounce; a sub-200ms run does flash. |
| [serious] Generic optimize-failure Callout (App.tsx:404-408) | Nielsen #9 | **CONFIRMED** | Verified verbatim: "Optimisation failed — please try again." with no action; detail only in `console.error` at 241. |
| [moderate] Relax action only offered for ER (Results.tsx:240-257) | Error recovery | **CONFIRMED** | Line 243: `cause?.relax?.key === 'er_pct' ? … : null`. `unreachableMinStats` already returns the full `StatCeiling` (172-189), so the claim that the data exists is correct. Arguably under-scored — this is the strongest finding in the report. |
| [moderate] Shared-link decode failure has no recovery action (App.tsx:398-402) | Error recovery | **CONFIRMED** | Callout is text-only; `SharedBuildBanner` (landing.tsx:207-213) does offer a "Run It Yourself" button, so the inconsistency cited is real. |
| [serious] GOOD import mutates inventory with no preview/confirm (ImportPanel.tsx:59-72) | Nielsen #5 | **PARTIALLY CONFIRMED** | Silent, un-undoable mutation: confirmed. But "replaces the current inventory" overstates: `mergeDedupe` drops **only** `sample-` artifacts (67) and `mergeNew` is additive — real gear is never removed or overwritten. The finding's own alternative fix ("when the incoming file would remove/replace existing non-sample artifacts") describes a case that cannot occur. Severity should drop to moderate. |
| [moderate] `confirmingClear` has no timeout/cancel (ImportPanel.tsx:103-120) | Reversibility | **PARTIALLY CONFIRMED** | Confirmed and in fact **worse than described**: the report says the only cancel path is "clicking elsewhere", but nothing resets `confirmingClear` except executing the clear — there is no cancel path at all. Styling claim also holds (`btn-ghost`, label swap only, 185-187). |
| [moderate] `<select>` vs `Combobox` split (OptimizePanel.tsx:327-372 vs ArtifactForm.tsx:96-181) | Jakob's Law | **CONFIRMED** | Verified: Character/Weapon/Set are `Combobox`; Build level, Maximise, Slot, Main stat, Element are native `<select>`. No documented threshold exists in either file. |
| [minor] `btn-ghost` used for three action classes (BuildCard.tsx:224-228 vs Results.tsx:425) | Jakob's Law | **CONFIRMED** | Share (BuildCard 225), Show All (Results 425), Clear Inventory (ImportPanel 185) all use `btn-ghost`. |
| [moderate] All 7 stats always rendered (BuildCard.tsx:283-297, SHOW) | Miller's Law | **CONFIRMED** | `SHOW` at 30-38; `dl` at 283-297 maps all seven unconditionally, `compact` only changes column count (286). |
| [minor] Flat 2-col grid, no chunking (OptimizePanel.tsx:290-373) | Miller's Law | **CONFIRMED** | `grid gap-4 sm:grid-cols-2` at 292 holds all five decisions with no subheads. |
| [serious] Unglossed jargon: CV, ER, EM, 4pc/2pc, topK, "core" | Plain language | **PARTIALLY CONFIRMED — downgrade** | Three of the six cited terms are **not** used as abbreviations in the UI: `labels-core.ts` renders `em` → "Elemental Mastery", `er_pct` → "Energy Recharge", `crit_value` → "Crit Value". The cited proof lines say so themselves — landing.tsx:95 reads "Crit Value", OptimizePanel.tsx:364 reads "Minimum Energy Recharge %". `topK` is a request prop, never rendered. Only **"2pc/4pc"** (labels-core.ts:158) and **"core"** (Results.tsx:313-315) are genuinely unglossed user-facing jargon. The glossary recommendation survives but the severity does not — moderate at most. |
| [minor] "same core" unexplained (Results.tsx:282-286) | Plain language | **PARTIALLY CONFIRMED** | The claim is right but the lines are wrong: 282-286 is the code comment; the user-facing string is at **313-315**. |
| [moderate] Manual-entry path has no fidelity cue (App.tsx:424-433) | Hick's Law | **CONFIRMED** | `Disclosure label="Or Add One Manually"` at 424-429 with no badge; the caveat only appears once opened (ArtifactForm.tsx:187-190). The finding concedes it is a fine trade-off — over-scored at moderate. |
| [moderate] "Use Meta Build" undiscoverable pre-selection (OptimizePanel.tsx:392-410) | Discoverability | **CONFIRMED** | Button is gated on `meta && …` (392); `charOptions` (244-252) annotates only "(Owned)", nothing about meta coverage. |
| [minor] Locked chips are permanent dead weight for non-roster users (App.tsx:322-378) | Hick's Law | **CONFIRMED** | `unlocked` map (270-277) ties Roster/Teams/Plan to `hasRoster`, which only a GOOD file sets (ImportPanel.tsx:132-139). UID and manual paths never unlock them. |
| [minor] `PanelFallback` is a text line, not a skeleton (App.tsx:70-72) | Loading affordance | **CONFIRMED** | Verified verbatim, including the rationale comment at 68-69 the finding acknowledges. |
| [serious] Step-nav chips packed at `gap-1` (App.tsx:338-350, 354-368) | Fitts's Law | **CONFIRMED** | `gap-1` on the `<nav>` at 325; chips carry `touch-target` (min-h-11) so height is fine, but 4px horizontal separation between adjacent disabled and enabled chips in an `overflow-x-auto` strip is real. Serious is defensible but generous — the targets themselves meet 2.5.8. |
| [moderate] "Copy Share Link" lacks a touch target (BuildCard.tsx:224-228) | Fitts's Law | **REFUTED** | `.btn-ghost` **already includes `touch-target`** (index.css:211: `@apply focus-ring touch-target inline-flex …`). The proposed fix — "apply the same `touch-target` utility used elsewhere (e.g. Drawer.tsx:75)" — is already in effect via the recipe. Behaviour misread; Drawer.tsx:75 spells it out only because it is *not* using `.btn-ghost`. |
| [minor] Single column between `sm` and `lg` (Results.tsx:321) | Responsive layout | **CONFIRMED** | `grid gap-4 lg:grid-cols-2` at 321 with rank 1 at `lg:col-span-2` (330). The description of the tablet band is accurate. |

**Count discrepancy:** the report's summary table says 19 findings (4/9/6). The
body actually contains **21** (4 serious, 9 moderate, **8** minor). The minor
count is understated by two.

---

## Web Interface Guidelines audit (9 findings)

| Finding | Cited principle | Verdict | Note |
|---|---|---|---|
| `.btn-primary` transitions `filter` (index.css:200) | WIG: animate transform/opacity only | **CONFIRMED** | `transition-[transform,filter] … hover:brightness-110` verified at 200. `filter` is genuinely not compositor-friendly. Hover-only, so impact is small — moderate is generous. |
| `pulse-glow` animates `boxShadow` (tailwind.config.js:87-90) | Same | **CONFIRMED** | Keyframes verified at 87-90; applied at OptimizePanel.tsx:413 via `running && 'animate-pulse-glow'`, so it does run continuously for the search's duration. Correctly the strongest of the two animation findings. |
| No font preload for the display face (index.html:13-18) | WIG: preload critical fonts | **CONFIRMED** | Preconnects at 13-14, stylesheet at 15-18 with `display=swap`; no `<link rel="preload" as="font">`. Description exact, including the FOIT caveat. |
| `BAD_FILE` uses a straight apostrophe (ImportPanel.tsx:30) | WIG: curly quotes | **CONFIRMED** | Line 30 uses `isn't` (U+0027); ImportPanel.tsx:16 uses `Couldn’t` (U+2019). Genuinely the only inconsistent string in the file. |
| `<h1>` ThesisHero lacks `text-pretty`/balance (landing.tsx:68) | WIG: balance headings | **CONFIRMED** | Verified; no wrap utility on the class list. |
| `<h1>` SolvedHero same (landing.tsx:85) | Same | **CONFIRMED** | Verified. |
| `<h2>` Section title same (landing.tsx:49) | Same | **CONFIRMED** | Verified. |
| `<h3>` GapReport same (GapReport.tsx:9) | Same | **CONFIRMED** | Verified. |
| `<h2>` SampleGear same (SampleGear.tsx:37) | Same | **CONFIRMED** | Verified. |

**Clean-bill claims spot-checked and upheld:** no `autoFocus`, no
`transition: all`/`transition-all`, no `user-scalable=no`/`maximum-scale`, no
`onPaste`+`preventDefault`, no raster `<img>` anywhere, and the only
`outline-none` in the codebase is inside `.focus-ring` (index.css:99), paired
with `focus-visible:ring-2`. The `content-visibility: auto` substitution for
virtualization is real (Combobox.tsx:12-19). This report's line citations were
the most accurate of the three.

---

## Cross-report contradictions

1. **Locked step buttons.** Accessibility M4 flags `disabled` +
   `aria-describedby` (App.tsx:339-350) as a moderate defect; the heuristics
   report lists the identical code as a strength. Both cannot stand. The a11y
   read is better supported — the codebase itself uses `aria-disabled` +
   early-return everywhere else for exactly this reason (index.css:200-211,
   OptimizePanel.tsx:388-390, ImportPanel.tsx:240-247), so the locked chips are
   the one inconsistency, not the exemplar.
2. **Search progress.** Heuristics scores the search feedback as a strength;
   accessibility M2 scores the same code as a moderate 4.1.3 gap. These are
   compatible — the visual affordance is good and the SR affordance is missing —
   but neither report acknowledges the other half.
