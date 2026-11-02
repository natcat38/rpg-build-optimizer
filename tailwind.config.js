import plugin from 'tailwindcss/plugin.js';

/*
 * The coloured palette is authored in OKLCH and shipped as sRGB.
 *
 * OKLCH is a perceptual space: L is lightness (0 black to 1 white), C is
 * chroma (colourfulness) and H is hue in degrees. Two colours with the same L
 * look equally light whatever their hue, which hex and rgb() cannot promise.
 *
 * ONE LIGHTNESS FORMULA. Every accent and element colour is
 *
 *     oklch(L_RUNG, chroma, hue)
 *
 * where L_RUNG is one of four named lightness steps, shared by all ten
 * colours. A new hue needs two numbers, not a hex:
 *
 *   1. hue:    pick a degree on the OKLCH wheel (0 red, 90 yellow, 150 green,
 *              210 cyan, 270 blue, 330 magenta).
 *   2. rung:   `base` (0.78) is the default text weight on the graphite
 *              chassis; `mid` (0.825) and `bright` (0.88) for hues that
 *              read dim at base (yellows, pale cyans); `deep` (0.65) for a
 *              fill or border darker than text. A same-family accent step is
 *              the same hue on a different rung ("same hue, walk L").
 *   3. chroma: 0.08 pale to 0.18 vivid. toRgb() throws at config load if the
 *              triple does not fit inside sRGB, so an impossible colour fails
 *              the build instead of silently clipping.
 *
 * As text on surface-900, `base` and lighter measure 8.9:1 or better and
 * `deep` 5.75:1, so any new hue on a rung clears the 4.5:1 AA floor.
 * Tailwind needs a hex-equivalent at build time, so toRgb() converts once and
 * emits the "r g b" triplet that the `<alpha-value>` and `rgb(var(--x) / a)`
 * forms below already consume. The browser never sees oklch(), so there is no
 * browser-support requirement beyond rgb().
 *
 * See docs/adr/0023-palette-as-oklch-triplets.md for the drift and contrast
 * measurements against the previous hand-picked hex values.
 */
const L_RUNG = Object.freeze({
  deep: 0.65,
  base: 0.78,
  mid: 0.825,
  bright: 0.88,
});

/** OKLCH to an sRGB "r g b" triplet (0-255 integers). Throws when out of gamut. */
function toRgb(rung, chroma, hue) {
  const L = L_RUNG[rung];
  if (L === undefined) throw new Error(`Unknown lightness rung "${rung}"`);
  const h = (hue * Math.PI) / 180;
  const a = chroma * Math.cos(h);
  const b = chroma * Math.sin(h);
  // OKLab to LMS (cubed) to linear sRGB (Ottosson's published matrices).
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const linear = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  if (linear.some((v) => v < -0.0005 || v > 1.0005)) {
    throw new Error(`oklch(${L} ${chroma} ${hue}) is outside the sRGB gamut`);
  }
  return linear
    .map((v) => {
      const c = Math.min(1, Math.max(0, v));
      const g = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
      return Math.round(g * 255);
    })
    .join(' ');
}

// The accent is one hue walked along the lightness rungs.
const ACCENT_HUE = 79;
const ACCENT = {
  DEFAULT: toRgb('mid', 0.138, ACCENT_HUE),
  bright: toRgb('bright', 0.111, ACCENT_HUE),
  deep: toRgb('deep', 0.122, ACCENT_HUE),
};

// Elemental hues: [rung, chroma, hue].
const ELEMENT = {
  pyro: toRgb('base', 0.129, 41),
  hydro: toRgb('base', 0.118, 229),
  electro: toRgb('base', 0.138, 310),
  cryo: toRgb('bright', 0.084, 209),
  anemo: toRgb('mid', 0.107, 173),
  geo: toRgb('bright', 0.143, 88),
  dendro: toRgb('mid', 0.178, 128),
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    // Replaces Tailwind's default weight scale rather than extending it: only
    // these four weights are actually fetched in index.html, so `font-black`
    // and friends must not compile to a weight the browser would synthesise.
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['"Spline Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      // The micro-label size. 12px, the floor for text that carries
      // information on a phone (it was 11.2px); it stays a separate step
      // from `text-xs` so the labels can move on their own later. `label` and
      // `eyebrow` are the only two tracking values the display idiom uses.
      fontSize: {
        '2xs': ['0.75rem', { lineHeight: '1rem' }],
      },
      letterSpacing: {
        label: '0.18em',
        eyebrow: '0.4em',
      },
      colors: {
        // Instrument chassis — graphite surfaces, constant across games.
        // Lower number = lighter; 500/400 exist only as scrollbar-thumb greys.
        surface: {
          900: '#0f1116',
          800: '#14161d',
          700: '#1b1e27',
          600: '#242833',
          500: '#2a2f3d',
          400: '#3a4152',
        },
        // The reading signal — swapped per game via CSS vars (see index.css).
        // The three `--accent*` properties are written onto :root by the plugin
        // at the bottom of this file, from ACCENT above.
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          bright: 'rgb(var(--accent-bright) / <alpha-value>)',
          deep: 'rgb(var(--accent-deep) / <alpha-value>)',
        },
        // The constraint/interactive signal — constant across games.
        flux: {
          DEFAULT: '#6aa6ff',
          bright: '#9dc0ff',
        },
        // Elemental hues — constant across the app (not game-swapped like
        // `accent`). Authored as OKLCH in ELEMENT above, emitted as rgb
        // triplets so `/alpha` modifiers work; every one clears 4.5:1 as text
        // on surface-900. Colour is never the only channel: the element name
        // is always written next to it.
        element: Object.fromEntries(
          Object.entries(ELEMENT).map(([name, rgb]) => [
            name,
            `rgb(${rgb} / <alpha-value>)`,
          ]),
        ),
        paper: '#e9e7e0',
        muted: '#8d93a3',
        rose: '#e88b7d',
        jade: '#6fd39a',
        // Warning/caution signal — amber, distinct from `accent` (game-swapped
        // brand gold) and `element.geo` (an elemental hue, not a semantic
        // one). Measured as text on both dark surfaces per WCAG 2.1 relative
        // luminance: 10.15:1 on surface-900 (#0f1116), 8.94:1 on surface-700
        // (#1b1e27) — both clear the 4.5:1 AA floor with headroom.
        amber: '#f0b432',
      },
      boxShadow: {
        'glow-accent':
          '0 8px 30px -8px rgb(var(--accent) / 0.45), inset 0 1px 0 rgba(255,255,255,0.2)',
        panel: '0 24px 70px -30px rgba(0,0,0,0.9)',
        // Shallower than `panel`: a listbox floats a few px above the page,
        // not the whole instrument chassis.
        popover: '0 16px 40px -16px rgba(0,0,0,0.85)',
      },
      backgroundImage: {
        'hairline-accent':
          'linear-gradient(135deg, rgb(var(--accent) / 0.5), rgb(var(--accent) / 0.04) 40%, transparent 70%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Opacity only — animating `boxShadow` forces paint on every frame,
        // where opacity stays on the compositor.
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'pulse-glow': 'pulse-glow 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [
    // The accent seam: a second game overrides these three properties under a
    // [data-game] selector (see docs/design-system.md). The defaults come from
    // the OKLCH formula above rather than being retyped in index.css.
    plugin(({ addBase }) => {
      addBase({
        ':root': {
          '--accent': ACCENT.DEFAULT,
          '--accent-bright': ACCENT.bright,
          '--accent-deep': ACCENT.deep,
        },
      });
    }),
  ],
};

// Exported for src/palette.test.ts; Tailwind only reads the default export.
export { ACCENT, ELEMENT };
