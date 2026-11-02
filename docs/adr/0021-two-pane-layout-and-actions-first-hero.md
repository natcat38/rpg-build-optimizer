# 0021. Two-pane layout from `lg` and an actions-first hero

- Status: Accepted
- Date: 2026-10-24

## Context

A UX audit on 2026-10-23 found the app laid out as one 768px column on a 1440px screen. A
first-time visitor scrolled past the inputs to reach the result: a fresh page was 2.5 screens on
desktop and 3.4 on a phone, and a sample run 4.8 screens on desktop. The first build card sat
946px from the top, below the fold of a 1440x900 screen.

The hero led with a large "219.4" damage number. That number is a fixed demo figure, not the
visitor's result, so it read as a claim about their account.

These were owner calls in the 2026-10 UX polish pass: G2 (long pages on desktop) and R4 (the
first screen and hero). Branding (G3) is recorded in [design-system.md](../design-system.md)
under "Brand assets".

## Decision

**Two panes from `lg` (G2 option A).** On wide screens the inputs (Load, the sample button and
Optimise) sit in a sticky left pane, and Results, Roster, Teams and Plan read on the right. A
phone keeps one column, with Teams and Plan folded. The section nav centres the active chip and
follows the last heading passed.

**Actions first, the demo number as a caption (R4 option 1).** The hero is the name, the
one-line claim, then the two actions "Load your gear" and "Try a sample". The 219.4 figure
stays, labelled as a sample, in a caption under them. In Results the best build comes first,
then its proof, the gap card and the runners-up.

## Alternatives considered

- **G2 B, tabs or a stepper:** the shortest pages, but hides the other sections and loses the one
  scrolling story from inputs to plan.
- **G2 C, one column with folded sections:** the smallest change, but the narrow column stays.
- **R4 option 2, keep the big number as a labelled sample:** keeps the visual hook, but still
  puts a number the visitor did not produce above their own actions.
- **R4 option 3, move only the sample panel up on phones:** fixes the phone, not desktop.

## Consequences

- Page length (screens, desktop): fresh 2.49 -> 1.69, sample run 4.83 -> 3.06, roster 3.88 ->
  2.36. Phone: fresh 3.45 -> 3.11, roster 5.77 -> 4.62.
- The first build card shows without scrolling on a 1440x900 screen (946px -> 617px from the
  top).
- The Results jump waits for the page to settle and the hero holds its height, so desktop layout
  shift went from 0.068 to 0.
- Two layouts to keep working: the sticky left pane on desktop and the folded single column on a
  phone.
- Still open with the owner: the Plan row wording ("no build: gear used by earlier members" /
  "no build: recommended loadout not met") and the `public/og.png` card.
