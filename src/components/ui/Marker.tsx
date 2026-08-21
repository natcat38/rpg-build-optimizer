import type { HTMLAttributes } from 'react';
import { cn } from './cn';
import { TONE, type Tone } from './tone';

/** Square single-glyph tick — a grade letter, a rank. Sized to match
 *  `.section-badge-sm` so the two read as one family down a card. */
export function Marker({
  tone,
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLSpanElement> & { tone: Tone }) {
  return (
    <span
      className={cn(
        'grid h-8 w-8 flex-none place-items-center rounded-lg border font-display text-sm font-bold',
        TONE[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
