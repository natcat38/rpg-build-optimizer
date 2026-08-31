# UX Heuristics Audit — RPG Build Optimizer

Scope: `src/components/App.tsx`, `landing.tsx`, `ImportPanel.tsx`, `OptimizePanel.tsx`, `Results.tsx`, `BuildCard.tsx`, `GapReport.tsx`, `GapSection.tsx`, `ExplainBuild.tsx`, `ArtifactForm.tsx`, `SampleGear.tsx`, `ui/*.tsx`, `searchProgress.ts`.

## Summary (counts by severity)

| Severity | Count |
|---|---|
| Critical | 0 |
| Serious | 4 |
| Moderate | 9 |
| Minor | 6 |
| **Total** | **19** |

## Strengths

- **Persistent live regions everywhere** (`App.tsx:385-396`, `ImportPanel.tsx:270-275`, `Results.tsx:433-437`, `ExplainBuild.tsx:57-70`, `ArtifactForm.tsx:201`) — regions are mounted up front and only text changes, avoiding the classic "region created same commit as its content" bug. Nonce-keying re-announces identical repeats (e.g. copying the same share link twice).
- **Locked-step navigation with real disabled `<button>`s and `aria-describedby`** (`App.tsx:338-350`) rather than styled spans with unreachable `title` tooltips — a genuine accessibility win over the common anti-pattern.
- **Cancelable, non-blocking long-running search** with a live counter (explored/pruned) and elapsed clock decoupled into its own store so the whole page doesn't re-render 5x/second (`searchProgress.ts`, `OptimizePanel.tsx:143-179`).
- **Dimming + `aria-busy` pattern during re-runs** (`App.tsx:500-506`) keeps stale results visible (avoiding a jarring blank state) while marking them stale.
- **Error copy is specific, not generic** — `ImportPanel.tsx:14-20` distinguishes network/not-found/no-showcase UID failures; `Results.tsx:156-190` computes a specific infeasibility cause (set gap, empty slot, unreachable stat ceiling) with a one-click relax action.
- **Two-step destructive confirmation without a modal** (`ImportPanel.tsx:103-120`, "Clear Inventory" → "Confirm Clear") — reversible-feeling despite being irreversible, avoids modal-dialog overhead for a low-frequency action.
- **Sample/demo mode with a live solved example** (`landing.tsx:79-122`, `SampleGear.tsx`) gives first-time visitors a genuine "aha" before they've imported anything — addresses the empty-state problem directly.
- **Focus-preserving disabled patterns** (`aria-disabled` + early-return guards instead of `disabled`) consistently applied across Fetch/Optimise/Explain buttons to avoid focus jumping to `<body>` mid-interaction.

## Findings by dimension

### 1. Onboarding / empty states

- **[minor] `landing.tsx:116-119` — Recognition over recall.** The sample hero explicitly says "not your gear, and not a result you asked for," which is good, but nothing on first paint tells a brand-new visitor *what to do next* (the three import options aren't previewed above the fold; they're one scroll away in `ImportPanel`). Fix: add a one-line CTA under the hero ("Import your gear below to get your own optimum") linking/scrolling to `#step-load`.
- **[moderate] `ArtifactForm.tsx:183-190` — Recognition over recall / progressive disclosure.** The caveat that hand-added pieces carry no sub-stats (and therefore rank far below imported gear) is buried as body text below the form fields, easy to miss since users fill top-to-bottom and submit before reading down. Fix: move this caveat directly above/beside the "Add Artifact" submit button, or into the `Disclosure` label itself ("Or Add One Manually — no sub-stats, fills gaps only").

### 2. Feedback during long optimizer runs (Doherty threshold, cancelability)

- **[minor] `OptimizePanel.tsx:169-176` — Doherty Threshold.** The progress bar is an indeterminate animated pulse rather than tied to any actual signal, which is a reasonable choice given branch-and-bound has no known total — but there's no minimum-duration guard: a sub-200ms run will flash the "Searching…" state and progress line on/off, which reads as flicker rather than feedback. Fix: hold the progress UI visible for a minimum ~300-400ms once shown (debounce the transition off) so fast runs don't strobe.
- Good: Cancel is always available exactly when there's something to cancel (`SearchProgressLine` only renders while `running`), and elapsed time/counts update at 5Hz without re-rendering the whole tree — meets Doherty's threshold well for perceived responsiveness.

### 3. Error messages and recovery

- **[serious] `App.tsx:404-408` — Error recovery (Nielsen #9).** The generic optimize-failure Callout ("Optimisation failed — please try again") gives no actionable detail and no differentiation from a worker crash vs. bad game data vs. a genuinely unsupported request; `console.error` captures detail but it's dev-only. A real user who hits this repeatedly (e.g. a corrupted shared-link-derived request) has no path forward besides blindly retrying. Fix: at minimum, offer a "Reset to defaults" action alongside the retry message, since the failure may be tied to current selections (character/constraints) that the user can't otherwise identify as the cause.
- **[moderate] `Results.tsx:240-257` — Error prevention/recovery.** When infeasible, only an ER floor relax is offered (`cause?.relax?.key === 'er_pct'`); when the blocking cause is a set-requirement gap or an unreachable non-ER stat ceiling, the callout falls back to generic text ("Try relaxing the set requirement or the Energy Recharge minimum") with no actionable control, even though `infeasibleCause` already computed exactly which constraint is unreachable. Fix: since `unreachableMinStats` already returns the specific `StatCeiling`, extend `onRelax` to accept any minStat key, not just ER, so the one-click fix generalizes.
- **[moderate] `App.tsx:398-402` — Error recovery.** "This shared build couldn't be read — it may be from a newer version" gives no recovery action (no link back to import/optimize normally); the reader is left staring at an error with no next step besides manually editing the URL. Fix: add a button/link that clears the `?b=` param and scrolls to `#step-load`, mirroring the pattern already used for `SharedBuildBanner`'s "Run It Yourself" button.

### 4. Undo / reversibility

- **[serious] `ImportPanel.tsx:59-72` — Error prevention (Nielsen #5), reversibility.** A GOOD-file import silently *replaces* the current inventory's sample artifacts and merges/dedupes against real ones with zero preview or confirmation step — a user who imports the wrong file (or re-imports a stale export) gets no "this will change N pieces, proceed?" gate, unlike Clear Inventory which does get a two-step confirm. Fix: at minimum, surface the diff (X added, Y already present) *before* committing rather than only in the post-hoc notice — or reuse the same confirm pattern used for Clear when the incoming file would remove/replace existing non-sample artifacts.
- **[moderate] `ImportPanel.tsx:103-120` — Reversibility.** Clear Inventory's confirmation state (`confirmingClear`) has no timeout or cancel path other than clicking elsewhere — if the user's mouse slips, a second stray click anywhere on the same button executes the irreversible action with no visible warning countdown. Fix: auto-revert `confirmingClear` after ~5s of inactivity, and/or restyle the confirm state distinctly (e.g. red) rather than same-styled ghost button text swap alone.
- Good: Optimize's own destructive-ish action (relaxing ER, `App.tsx:517-524`) is framed as an offer with an explicit button rather than an automatic mutation.

### 5. Consistency (Jakob's Law)

- **[moderate] `OptimizePanel.tsx:327-372` vs `ArtifactForm.tsx:96-181` — Consistency.** Some fields use the custom `Combobox` (Character, Weapon, Set) while structurally similar fields (Build level, Maximise, Slot, Main stat, Element) use plain native `<select>`. This split isn't purely about list size — Slot (5 options) and Element (7) are native selects while Set (dozens) is a Combobox for good reason, but "Main stat" and "Maximise" sit in between with no stated criterion visible to the user, producing inconsistent interaction affordances (search-to-filter vs. scroll) across what looks like one form. Fix: document (or better, encode) the threshold at which a field graduates from `<select>` to `Combobox` so future fields are placed consistently, and consider Combobox for "Main stat" (9+ options) for interaction parity with Set/Character/Weapon.
- **[minor] `BuildCard.tsx:224-228` vs `Results.tsx:425` — Consistency.** "Copy Share Link" uses `btn-ghost` styling identical to "Show All N Builds" and "Clear Inventory," giving three semantically different action classes (share/export, disclose-more, destructive) the same visual weight app-wide. This is a minor Jakob's-Law nit since users can't tell action severity from styling alone. Fix: reserve `btn-ghost` for non-destructive secondary actions and consider a distinct treatment for actions with consequence (Clear Inventory, in particular, given finding #4).

### 6. Information density (Miller's Law)

- **[moderate] `BuildCard.tsx:283-297` (SHOW array) — Miller's Law.** Each build card always renders all 7 stats in `SHOW` (atk, atk%, crit rate, crit dmg, ER, EM, elemental dmg) regardless of whether the character's build cares about all of them (e.g. EM is irrelevant to most on-field DPS characters, elemental_dmg is 0 for non-elemental-scaling kits) — for a compact rank>1 card this is a lot of near-zero rows competing for attention with the ones that matter. Fix: suppress rows that are exactly 0 in compact/non-rank-1 cards, or reorder so the objective's own stat and any binding-constraint stats sort first.
- **[minor] `OptimizePanel.tsx:290-373` — Miller's Law / chunking.** The Optimize panel presents Character, Weapon, Build level, Maximise, and ER floor as one flat 2-column grid with no grouping headers — five independent decisions with no visual chunking beyond the grid wrap. This is within Miller's 7±2 but a first-time user still has to parse which fields are required (Character) vs optional (ER floor) by reading each hint individually. Fix: a subtle grouping (e.g. "Who" / "What to optimise for" subheads) would reduce scan time, though this is a small win given the panel is already short.
- Good: `Results.tsx:112-113` (COLLAPSED_GROUPS = 3) and the "Show All N Builds" progressive-disclosure pattern is a solid, explicit application of chunking — podium-first, opt-in expansion.

### 7. Jargon vs. plain language

- **[serious] Across `OptimizePanel.tsx`, `Results.tsx`, `BuildCard.tsx`, `GapReport.tsx` — Recognition over recall / plain language.** Terms central to the flow — CV/Crit Value (`landing.tsx:95`), ER (`OptimizePanel.tsx:364`), EM (`BuildCard.tsx:36`), "meta target"/"4pc"/"2pc" (`OptimizePanel.tsx:78-79` via `setRequirementLabel`), "topK"/"near-duplicates sharing the same core" (`Results.tsx:311-316`), "anti-clone cap" (mentioned in project context, surfaces as the "short list" copy) are used with zero inline definition or tooltip anywhere in the reviewed files. The project context confirms this is a deliberate audience choice (serious players who already know the vocabulary), which is defensible for the target audience, but it does mean the app has no on-ramp for an adjacent-but-newer player (e.g. someone who plays but has never touched a GOOD-format optimizer) — a real gap if organic/search discovery is a goal. Fix: not necessarily "explain everything," but a single optional glossary disclosure (reusing the existing `Disclosure` component, e.g. under the hero or in a footer link) would cost little and catch this segment without diluting the page for the intended expert audience.
- **[minor] `Results.tsx:282-286` — Plain language.** "near-duplicates sharing the same core are filtered" assumes the reader knows what "core" means in this context (a shared 4-piece artifact combination) — it's explained in code comments but not to the user. Fix: expand slightly, e.g. "results sharing the same 4 pieces are filtered to one."

### 8. Discoverability of features (Hick's Law)

- **[moderate] `App.tsx:424-433` — Discoverability.** Manual artifact entry (`ArtifactForm`) is nested inside a `Disclosure` labeled "Or Add One Manually" placed *after* the two primary import methods, which is reasonable progressive disclosure — but there's no visual cue (badge/count) showing it's a fully separate, lower-fidelity data path (see finding #1) until opened and read. This is a fine trade-off, not a serious problem, since Hick's Law is well-served by hiding a third, less-used path behind a click.
- **[moderate] `OptimizePanel.tsx:392-410` — Discoverability.** "Use Meta Build" only appears when `meta` exists for the selected character (`META_TARGETS[characterKey]`), and there's no indication *before* picking a character whether it has a curated recipe — a user browsing the roster dropdown has no signal (e.g. a marker in `charOptions`) of which characters get this shortcut, only discovering it after selection. Fix: annotate meta-covered characters in the Combobox list (a small dot/hint similar to "(Owned)") so users can find fast-path characters without trial selection.
- **[minor] `App.tsx:322-378` — Hick's Law.** The sticky step nav shows locked chips for Roster/Teams/Plan permanently until a roster import happens; for a session that never imports a GOOD file (UID-only or manual-only users), these three chips are permanently unreachable dead weight in the choice set. This is by design (explains what unlocks), but for manual-entry-only users who will never get a roster from that path, the locked chips add irreducible visual noise for the entire session. Not scored higher because the locked-hint affordance is well done.

### 9. Loading/progress affordances

- **[minor] `App.tsx:70-72` (`PanelFallback`) — Loading affordance.** Roster/Teams/Plan lazy panels fall back to a plain "Loading…" text line rather than a skeleton matching final layout, causing a layout jump once the real content mounts. Acceptable given the comment explains this is intentionally minimal (below the fold, one-time), but on a slow connection/device the jump is still visible. Fix: low priority — a fixed-height placeholder would remove the reflow if it's ever reported as jarring.
- Good: `ExplainBuild.tsx:76-82` skeleton lines sized to the eventual content are a nice touch, better than the generic panel fallback.

### 10. Mobile/responsive concerns (Fitts's Law)

- **[serious] `App.tsx:338-350`, `354-368` — Fitts's Law / touch target size.** The sticky step-nav chips use `touch-target` class (good) but are packed in a horizontally-scrolling row (`overflow-x-auto`) with `gap-1` — on mobile, six adjacent small chips in a scrollable strip are prone to mis-taps, especially the locked/disabled ones sitting directly beside enabled ones with only 4px gap. Fix: increase `gap-1` to `gap-2` (8px) at minimum on narrow viewports, and consider a slightly larger tap-safe zone around disabled chips so an accidental tap doesn't feel broken.
- **[moderate] `BuildCard.tsx:224-228` — Fitts's Law.** "Copy Share Link" sits top-right of each card as a `btn-ghost` with no explicit minimum touch-target sizing class (unlike `Drawer.tsx:75`'s close button, which explicitly uses `touch-target`) — on a card grid where multiple cards render on one mobile screen, this small top-corner target is easy to miss/mis-tap compared to the primary content below it. Fix: apply the same `touch-target` utility used elsewhere (e.g. `Drawer.tsx:75`) to ensure a consistent ≥44px hit area.
- **[minor] `Results.tsx:321` — Responsive layout.** `grid-cols-2` at `lg` with rank-1 spanning `lg:col-span-2` means between `sm` and `lg` (tablet-ish widths, a common landscape-phone/tablet range) all cards stack to one column regardless of available width — not wrong, but the breakpoint choice means a landscape tablet gets a single-column layout that has visible room for two. Not a bug, just a narrow miss on layout efficiency at one viewport band.

## Top priority fixes (top 5, ranked)

1. **[serious] Generalize the infeasible-build relax action beyond ER** (`Results.tsx:240-257`) — the diagnostic data already identifies the specific unreachable stat; wiring `onRelax` to any minStat key turns the most common dead-end into a one-click recovery for every constraint type, not just ER.
2. **[serious] Add a confirmation/preview step before a GOOD-file import replaces inventory** (`ImportPanel.tsx:59-72`) — currently the one truly silent, hard-to-reverse data mutation in the app; a "this will change N pieces" preview closes the gap with the far safer Clear Inventory flow.
3. **[serious] Enlarge/space touch targets in the sticky step nav on mobile** (`App.tsx:338-368`) — a persistent, always-visible control with real mis-tap risk between adjacent locked/enabled chips deserves priority over one-off panel issues.
4. **[serious] Add at least an optional glossary/definitions disclosure for core jargon** (CV, ER, EM, 4pc/2pc, topK) — currently a hard wall for any user outside the core expert audience; low-cost given the existing `Disclosure` component already does this pattern elsewhere.
5. **[moderate] Give shared-link decode failures a concrete recovery action** (`App.tsx:398-402`) — a one-line "start fresh" link/button turns a dead-end error into a normal onboarding path, consistent with how `SharedBuildBanner` already offers a next action for the *successful* shared-link case.
