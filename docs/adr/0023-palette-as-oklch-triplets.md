# 0023. Author the accent and element palette as OKLCH on shared lightness rungs

- Status: Accepted
- Date: 2026-11-03

## Context

The Hallmark audit (finding #4, `docs/research/audit-2026-09/hallmark-audit.md`, issue #100) found the accent
(`bright`/`DEFAULT`/`deep`) and the seven `element.*` colours were each a separately hand-picked rgb value. No rule
told a contributor how to add an eighth element or a fourth accent step that reads as the same family. Natalie chose
option 1 in decision D4 of the 2026-11-02 open-items sweep: re-express them as OKLCH with one lightness formula,
check every colour for drift, and keep text contrast at or above AA (4.5:1) wherever it applied.

Browser support was checked first. The build ships `rgb(r g b / <alpha-value>)` and `rgb(var(--accent) / a)`, and
the repo has no `browserslist`. The conversion therefore happens once, at config load, and the browser never sees
`oklch()`. No support requirement beyond `rgb()` is added.

## Decision

In `tailwind.config.js`, every accent and element colour is `oklch(L_RUNG, chroma, hue)`. `L_RUNG` is one of four
named lightness steps shared by all ten colours: `deep` 0.65, `base` 0.78, `mid` 0.825, `bright` 0.88. A new hue is
a hue angle, a rung and a chroma; `toRgb()` converts to sRGB and throws at config load if the triple is outside the
sRGB gamut, so an impossible colour fails the build rather than clipping.

The three accent steps share one hue (79) on the `mid`, `bright` and `deep` rungs. A plugin writes `--accent`,
`--accent-bright` and `--accent-deep` onto `:root` from that formula, so `src/index.css` no longer retypes them. The
`[data-game]` override seam is unchanged. Rung assignment: base = pyro, hydro, electro; mid = accent, anemo,
dendro; bright = accent-bright, cryo, geo; deep = accent-deep.

`src/palette.test.ts` pins the rungs (within 8-bit rounding), the 4.5:1 floor on surface-900, the button text on
each accent step, and the `select.field` chevron hex (a data URI cannot read `--accent`, so it is kept equal by test).

## Drift

The ten old values sat at ten different lightnesses (0.65 to 0.89), so a single continuous formula could not
reproduce them. Collapsing to four rungs moves each colour slightly. Drift is deltaE_OK (100 x distance in OKLab;
about 2 is a just-noticeable difference):

| token         | old     | new     | deltaE |
| ------------- | ------- | ------- | ------ |
| accent        | #f2b64c | #f5ba51 | 1.13   |
| accent-bright | #ffcf76 | #ffcf80 | 1.05   |
| accent-deep   | #b98526 | #b78526 | 0.34   |
| pyro          | #ff9b76 | #fd9a75 | 0.44   |
| hydro         | #5fc8f5 | #5ac6f3 | 0.73   |
| electro       | #cf9bf5 | #d29df9 | 0.85   |
| cryo          | #8fe3f0 | #93e7f5 | 1.25   |
| anemo         | #74dfc0 | #74ddbf | 0.54   |
| geo           | #ffd45e | #ffd25c | 0.47   |
| dendro        | #a8de54 | #a4db4e | 1.04   |

Maximum 1.25, all below the just-noticeable difference. Six tokens are under 1. The four above 1 (accent,
accent-bright, cryo, dendro) moved intentionally to land on a shared rung. `accent-bright` also lost chroma
(0.120 to 0.111) because the old colour sat on the sRGB gamut edge (red channel 255) and the gamut guard refuses
to clip. Computed colours read from the running page with `getComputedStyle` equal the config output for all ten.

The `select.field` chevron moved to the new accent hex. `public/favicon.svg` and `docs/brand/og-card.html` still use
`#f2b64c`, a 1.13 deltaE difference in static brand assets, left unchanged at first. Update 2026-11-09
(owner decision): both now use `#f5ba51` (and `#ffcf80` for the bright step), and `og.png`,
`apple-touch-icon.png`, `icon-192.png` and `icon-512.png` were re-rendered from them.

## Contrast

WCAG 2.x ratios, measured before and after, as static token-on-surface pairs (surface-900/800/700, with the /0.8 and
/0.7 text alphas in use), tinted chips (`accent-bright` on `accent`/`accent-bright` fills at /10, /15, /25),
primary-button text on the three gradient stops, and live composited pairs from Chromium on the landing, roster and
sample-results states at 1440x900 and 390x844.

- No pair that was at or above 4.5:1 fell below it. No pair was below 4.5:1 before.
- Lowest static text ratio after: 5.07 (accent-deep on surface-700, the unused-as-text step). Lowest live text
  ratio after: 7.21 (`text-accent/80` eyebrow on surface-900, was 6.96).
- Element text on the roster card, before to after: hydro 9.08 to 8.87, geo 12.17 to 12.00, dendro 10.86 to
  10.52, cryo 11.82 to 12.30, electro 7.92 to 8.15, pyro 8.37 to 8.25, anemo 10.71 to 10.53.
- Primary-button text (surface-900) on the gradient: 13.03 / 10.81 / 5.75 (was 12.98 / 10.40 / 5.80).
- Focus ring `accent/70` on surface-900: 5.76 (was 5.57; the non-text floor is 3:1).

## Consequences

- Adding a hue is `toRgb(rung, chroma, hue)`. Anything on `base` or lighter clears 4.5:1 as text on
  surface-900 with headroom (8.9:1 and above).
- Colours are no longer free to sit at a bespoke lightness. A colour that needs a different L means adding or moving a
  rung, which moves every colour on it.
- Chroma remains authored per token. The formula governs lightness only, as the audit asked.
