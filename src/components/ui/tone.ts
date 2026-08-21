/**
 * The one border/background/text triplet per semantic colour, shared by every
 * tinted surface in the app: Badge, Marker and Callout.
 *
 * Opacities are uniform on purpose — /40 border, /10 fill — so a band chip, a
 * grade marker and an error callout read as the same system rather than three
 * hand-tuned near-misses.
 */
export type Tone = 'accent' | 'jade' | 'flux' | 'muted' | 'rose';

export const TONE: Record<Tone, string> = {
  accent: 'border-accent-bright/40 bg-accent-bright/10 text-accent-bright',
  jade: 'border-jade/40 bg-jade/10 text-jade',
  flux: 'border-flux/40 bg-flux/10 text-flux-bright',
  muted: 'border-muted/40 bg-muted/10 text-muted',
  rose: 'border-rose/40 bg-rose/10 text-rose',
};
