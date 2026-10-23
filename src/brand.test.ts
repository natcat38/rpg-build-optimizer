import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(__dirname, '..');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const pub = (name: string) => resolve(root, 'public', name.replace(/^\//, ''));

/** PNG width and height from the IHDR chunk (bytes 16-23). */
function pngSize(file: string) {
  const b = readFileSync(file);
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
}

describe('brand assets', () => {
  it('points the Open Graph and Twitter image at a 1200x630 file that ships', () => {
    const og = /property="og:image"\s+content="([^"]+)"/.exec(html)?.[1];
    const tw = /name="twitter:image"\s+content="([^"]+)"/.exec(html)?.[1];
    expect(og).toBe(tw);
    // Scrapers do not resolve relative URLs.
    expect(og).toMatch(/^https:\/\//);
    const file = pub(new URL(og!).pathname);
    expect(existsSync(file)).toBe(true);
    expect(pngSize(file)).toEqual({ width: 1200, height: 630 });
    expect(html).toContain('content="summary_large_image"');
  });

  it('links an apple-touch-icon and a manifest whose icons all exist', () => {
    expect(html).toContain(
      'rel="apple-touch-icon" href="/apple-touch-icon.png"',
    );
    expect(pngSize(pub('apple-touch-icon.png'))).toEqual({
      width: 180,
      height: 180,
    });
    expect(html).toContain('rel="manifest" href="/site.webmanifest"');
    const manifest = JSON.parse(
      readFileSync(pub('site.webmanifest'), 'utf8'),
    ) as { name: string; icons: { src: string; sizes: string }[] };
    expect(manifest.name).toBe('RPG Build Optimizer');
    for (const icon of manifest.icons) {
      expect(existsSync(pub(icon.src))).toBe(true);
      if (icon.src.endsWith('.png')) {
        const [w, h] = icon.sizes.split('x').map(Number);
        expect(pngSize(pub(icon.src))).toEqual({ width: w, height: h });
      }
    }
  });
});
