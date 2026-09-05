# Hallmark audit — RPG Build Optimizer UI

Mode: `hallmark audit` (static review only — no code changed).

Scope: `src/components/**`, `src/roster/RosterView.tsx`, `App.tsx`,
`index.html`, `tailwind.config.js`, `src/index.css`, `docs/design-system.md`,
`docs/screenshot.png`.

## Context for the reader of this report

This is not a fresh AI-generated page — it's a mature, hand-documented design
system (`docs/design-system.md`) with a named aesthetic ("instrument panel"),
a locked accent seam, a documented tone record, and inline comments explaining
*why* almost every non-obvious choice was made (see `SlotGlyph.tsx`'s own
comment rejecting Unicode glyphs for exactly the reason this audit flags
elsewhere). Most of the standard anti-slop gates already pass by construction:
no purple gradients, no centred-everything hero, no 3-card feature grid, no
gradient-text headline, no fabricated metrics, one accent used sparingly,
`aria-disabled` discipline, persistent live regions, tabular numerals, real
focus rings with the offset-colour fix applied. The findings below are the
places where the system's own stated discipline slipped, or where a
documented decision (OKLCH-only, one icon system) wasn't carried all the way
through.

No `/* Hallmark · macrostructure: ... */` stamp exists anywhere in the
codebase, so the stamp-vs-page and `design.md`-drift checks don't apply.

---

## Critical (ships as slop)

### 1. Sparkle emoji (✨) as the AI-feature icon

**Where:** `src/components/ExplainBuild.tsx:104`, `:108`

```tsx
<span aria-hidden="true">✨</span> Regenerate
<span aria-hidden="true">✨</span> Explain This Build
```

**Why it's a tell:** `references/anti-patterns.md` names ✨ specifically as
"the cliché of the 2024–2025 era" for AI features — an OS-rendered emoji
standing in for an icon because no icon was picked. Here it's not just any
button, it's the button that triggers the app's actual Claude-powered
explanation feature, so it reads as the app announcing "this is the AI part"
with literally the most recognized AI-shortcut glyph in the current design
lexicon. It also breaks the app's own documented icon discipline — the same
codebase has a comment in `SlotGlyph.tsx` explaining exactly why relying on a
glyph "renders differently depending on the reader's font stack / OS" was
rejected for slot icons, and then does the same thing here with an emoji.

**Fix:** Drop the emoji; the label alone ("Explain This Build" / "Regenerate")
already reads as an action. If the feature wants a visual anchor, draw one
small inline SVG in the same hand-built language as `SlotGlyph` (e.g. a
simple spark/asterisk mark rendered as a path, not a platform glyph) — but the
plain-text button is the safer, cheaper fix and matches the app's restrained
voice everywhere else.

---

## Major (looks AI-generated / breaks the system's own rules)

### 2. Mismatched icon voice — hand-built SVG, Unicode glyphs, and OS emoji on the same page

**Where:**
- `src/roster/RosterView.tsx:75-88` — a real inline SVG chevron (correct)
- `src/roster/RosterView.tsx:156` — `<span aria-hidden="true">▶</span>` (Unicode)
- `src/components/Results.tsx:433` — `<span aria-hidden="true">▶</span>` (Unicode)
- `src/components/BuildCard.tsx:260` — `<span className="text-jade">✓ </span>` (Unicode)
- `src/components/App.tsx:353` — `<span aria-hidden="true">🔒</span>` (emoji)
- `src/components/ExplainBuild.tsx:104,108` — `✨` (emoji, see #1)

**Why it's a tell:** `anti-patterns.md` § "Mismatched icon sets" — "each
library has its own stroke voice; mixing them is the icon-set tell." This
project already solved this once: `SlotGlyph.tsx`'s doc comment explains in
detail why five Unicode slot glyphs were replaced with hand-drawn SVG paths
(inconsistent shape/weight across fonts and OSes). That reasoning applies
identically to `▶`, `✓`, and `🔒` — they render with different weight, size,
and baseline across Space Grotesk/Spline Sans/IBM Plex Mono fallbacks and
across Windows/macOS/mobile, exactly the failure mode `SlotGlyph` was built to
avoid. Right now the app has one rigorous custom icon (slots), one ad hoc
custom icon (the roster chevron), and four bare Unicode/emoji glyphs standing
in elsewhere.

**Fix:** Extend the existing SVG discipline instead of introducing a new
library: reuse the roster chevron SVG for both "Show All" disclosure buttons
(rotate 90° for the expand affordance, matching `Disclosure`'s own twisty),
draw a small checkmark path for the "met" state in `BuildCard`, and draw a
small lock path for the locked step chip. Four small SVGs, zero new
dependencies, and it finishes the job `SlotGlyph.tsx` already started.

### 3. Section index badge sits beside the heading, not stacked above it

**Where:** `src/components/landing.tsx:44-57` (the shared `Section` wrapper
used by every numbered step — Load, Roster, Teams, Plan, Optimise):

```tsx
<div className="mb-3 flex items-center gap-3">
  {n != null && <span className="section-badge">{...}</span>}
  <div>
    <h2 ...>{title}</h2>
    {hint && <p>{hint}</p>}
  </div>
</div>
```

**Why it's a tell:** slop-test gate 54 bans any wrapper that puts an
eyebrow/number/label element next to a heading element in the same row,
regardless of class name — the fix is "heading directly underneath it, in the
same column." This *is* a legitimately-ordinal sequence (steps 01–05 the user
actually walks through in order), which is the one case `anti-patterns.md`
carves out for eyebrows at all — but the carve-out only exempts using a number
in the first place, not the side-by-side layout. The current shape (small
square tick + heading block, both vertically centred in a flex row) is a
narrower, less severe version of the banned pattern than a wide `01 · THE
TOUR` label column, but it's the same underlying shape a reader's eye
pattern-matches.

**Fix:** Stack the badge above the title (`flex-col` instead of `flex-row`,
badge first) or fold the number into the heading text itself (e.g. a small
mono "01" prefix inline with "Load Your Artifacts" as one text run) rather
than a separate flex sibling. Either reads as intentional and keeps the
numbering that's genuinely useful for a five-step flow.

### 4. Palette authored in raw hex/RGB, not OKLCH

**Where:** `tailwind.config.js:32-67` (`surface`, `paper`, `muted`, `rose`,
`jade`) and `src/index.css:12-14` (`--accent`, `--accent-bright`,
`--accent-deep` as `"r g b"` triplets).

**Why it matters:** `references/color.md` — "OKLCH only. `hsl()` and `rgb()`
lie about brightness." The three accent steps (`bright`/`DEFAULT`/`deep`) and
the seven `element.*` hues are each a separately hand-picked hex/RGB value
rather than one hue walked along a perceptual-lightness axis, so there's no
formula a future contributor can reach for to add an eighth element hue or a
fourth accent step that's guaranteed to read as "the same family, one step
darker." This is a real, working system (the design-system.md documents it
carefully and the accent-swap-per-game seam is genuinely clever) — the gap is
maintainability, not a visible defect today.

**Fix:** Not a rewrite. Re-express the existing three accent values and the
seven element hues as OKLCH triplets that reproduce the same visual colour,
and keep them flowing through the same `rgb(var(--accent) / <alpha-value>)`
mechanism (convert OKLCH → sRGB once, store the converted `r g b` numbers, as
today — browsers' OKLCH support isn't the blocker here, the *authoring*
formula is). That turns "add a new accent tint" from freehand hex-picking
into "same hue, walk L".

---

## Minor (small taste issues)

### 5. No named easing tokens — motion relies on Tailwind's bare defaults

**Where:** `.field`, `.card`, `Row` hover, etc. use `transition-colors` /
`transition-transform` with Tailwind's default timing function; only the
`fade-up`/`pulse-glow` keyframe animations in `tailwind.config.js:94-97`
specify an explicit cubic-bezier, and it's inlined rather than named.

**Why it's a tell:** `references/motion.md`'s discipline is three *named*
easings (`--ease-out`/`--ease-in`/`--ease-in-out`) referenced everywhere,
specifically so a project doesn't drift into inconsistent per-element timing
over time. Low stakes today (every transition is short and reads fine), but
there's no token to reach for the next time someone adds a hover effect.

**Fix:** Either add `transitionTimingFunction` tokens to `tailwind.config.js`
(`ease-out: 'cubic-bezier(0.22, 1, 0.36, 1)'`, matching the existing fade-up
curve) and apply them to the handful of hover/focus transitions, or add one
line to `docs/design-system.md` stating that Tailwind's default easing is the
deliberate house choice — either closes the gap between "no policy" and
"policy."

### 6. Coloured glow shadow on the primary CTA

**Where:** `tailwind.config.js:71-72` (`boxShadow['glow-accent']`), applied
via `.btn-primary` in `src/index.css:200`.

**Why it's worth naming:** `anti-patterns.md` § "Shadow-glow on dark" flags a
coloured halo shadow as a tell — but the pattern there is about *cards*
picking up an accidental glow. Here it's deliberately scoped to the one
primary call-to-action, which is a much more restrained, defensible use (a
lit instrument-panel button glowing is on-theme). Flagging only so a future
PR doesn't copy `shadow-glow-accent` onto panels or chips and let a single
considered choice spread into the ambient-glow tell.

**Fix:** No change needed; keep `shadow-glow-accent` exclusive to
`.btn-primary`.

### 7. Dead design token: `boxShadow.glow`

**Where:** `tailwind.config.js:70` defines `glow:
'0 0 0 1px rgb(var(--accent) / 0.15), 0 18px 50px -20px rgba(0,0,0,0.8)'`, but
no class in `src/` uses bare `shadow-glow` (only `shadow-glow-accent` and
`shadow-panel` are actually applied — confirmed by grep).

**Fix:** Either delete the unused `glow` shadow or find its intended caller
(possibly `.panel`, which currently uses `shadow-panel` instead) — as written
it's dead weight that `docs/design-system.md`'s "shadows: `panel`, `popover`,
`glow*`" line implies is in active use.

---

## Summary

**1 critical · 3 major · 3 minor**

**Verdict — close, fix the minors** (and the one critical). The structural
bones are sound and mostly *not* AI-generated-looking: this audit found no
purple gradients, no centred hero, no 3-card feature grid, no card-in-card, no
fabricated metrics, no `z-index: 9999`, no pure black/white, and a real,
documented accent-and-tone system. The findings above are narrow and
concrete: one emoji to delete, four glyphs to swap for SVGs the app already
knows how to draw, one layout tweak to a shared component, and a palette
authoring-format gap that's a maintainability note more than a visible bug.
