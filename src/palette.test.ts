import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * The palette is authored as OKLCH in tailwind.config.js and emitted as sRGB
 * triplets (ADR-0023). These tests pin the two promises that make that safe:
 * every colour really sits on its lightness rung, and nothing falls below the
 * 4.5:1 text floor on the graphite chassis.
 */
const root = resolve(__dirname, '..');
const configUrl = pathToFileURL(resolve(root, 'tailwind.config.js')).href;
// A dynamic import keeps the plain-JS config out of the TypeScript program.
const mod = (await import(/* @vite-ignore */ configUrl)) as {
  ACCENT: Record<string, string>;
  ELEMENT: Record<string, string>;
  default: { theme: { extend: { colors: Record<string, unknown> } } };
};

const RUNGS = { deep: 0.65, base: 0.78, mid: 0.825, bright: 0.88 };
const EXPECTED_RUNG: Record<string, keyof typeof RUNGS> = {
  'accent.DEFAULT': 'mid',
  'accent.bright': 'bright',
  'accent.deep': 'deep',
  'element.pyro': 'base',
  'element.hydro': 'base',
  'element.electro': 'base',
  'element.cryo': 'bright',
  'element.anemo': 'mid',
  'element.geo': 'bright',
  'element.dendro': 'mid',
};

const tokens: Record<string, number[]> = {};
for (const [k, v] of Object.entries(mod.ACCENT))
  tokens[`accent.${k}`] = v.split(' ').map(Number);
for (const [k, v] of Object.entries(mod.ELEMENT))
  tokens[`element.${k}`] = v.split(' ').map(Number);

const toLinear = (c: number) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};
const luminance = ([r, g, b]: number[]) =>
  0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
const contrast = (a: number[], b: number[]) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
/** OKLab lightness of an sRGB triplet. */
function oklabL([r, g, b]: number[]) {
  const [R, G, B] = [r, g, b].map(toLinear);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
}
const SURFACE_900 = [0x0f, 0x11, 0x16];

describe('OKLCH palette', () => {
  it('defines exactly the ten expected colours', () => {
    expect(Object.keys(tokens).sort()).toEqual(
      Object.keys(EXPECTED_RUNG).sort(),
    );
  });

  it.each(Object.entries(EXPECTED_RUNG))(
    '%s sits on its %s lightness rung (within 8-bit rounding)',
    (name, rung) => {
      expect(oklabL(tokens[name])).toBeCloseTo(RUNGS[rung], 2);
      expect(Math.abs(oklabL(tokens[name]) - RUNGS[rung])).toBeLessThan(0.004);
    },
  );

  it.each(Object.keys(EXPECTED_RUNG))(
    '%s is a valid sRGB triplet with at least 4.5:1 as text on surface-900',
    (name) => {
      for (const c of tokens[name]) {
        expect(Number.isInteger(c)).toBe(true);
        expect(c).toBeGreaterThanOrEqual(0);
        expect(c).toBeLessThanOrEqual(255);
      }
      expect(contrast(tokens[name], SURFACE_900)).toBeGreaterThanOrEqual(4.5);
    },
  );

  it('keeps dark text legible on every accent step (the primary button)', () => {
    for (const name of ['accent.DEFAULT', 'accent.bright', 'accent.deep']) {
      expect(contrast(SURFACE_900, tokens[name])).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('wires the element tokens into the Tailwind theme with alpha support', () => {
    const element = mod.default.theme.extend.colors.element as Record<
      string,
      string
    >;
    for (const [k, rgb] of Object.entries(mod.ELEMENT)) {
      expect(element[k]).toBe(`rgb(${rgb} / <alpha-value>)`);
    }
  });

  it('keeps the select chevron stroke equal to the accent (a data URI cannot read --accent)', () => {
    const css = readFileSync(resolve(root, 'src/index.css'), 'utf8');
    const stroke = /stroke='%23([0-9a-f]{6})'/.exec(css)?.[1];
    const hex = tokens['accent.DEFAULT']
      .map((c) => c.toString(16).padStart(2, '0'))
      .join('');
    expect(stroke).toBe(hex);
  });

  it('no longer hand-types the accent triplets in index.css', () => {
    const css = readFileSync(resolve(root, 'src/index.css'), 'utf8');
    expect(css).not.toMatch(/--accent(-bright|-deep)?:\s*\d/);
  });
});
