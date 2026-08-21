/**
 * The app's one "pick one of N views" control.
 *
 * Roving tabindex, and the arrow keys move DOM focus *with* the selection —
 * changing `aria-selected` while focus stays put strands a keyboard user on a
 * tab that is no longer the selected one. Horizontal only: Up/Down are left
 * alone so they still scroll the drawer this usually lives in.
 */
import { useRef, type KeyboardEvent } from 'react';
import { cn } from './cn';

interface SegmentedProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  /** Accessible name for the group itself. */
  label: string;
  role?: 'tablist' | 'radiogroup';
  /** Tablist only: gives each item a stable id so the panel can point back at
   *  the selected one with `aria-labelledby`. */
  itemId?: (value: T) => string;
  /** Tablist only: the id of the single panel every tab swaps the content of. */
  controls?: string;
  className?: string;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  role = 'tablist',
  itemId,
  controls,
  className,
}: SegmentedProps<T>) {
  const items = useRef<(HTMLButtonElement | null)[]>([]);
  const tabs = role === 'tablist';

  function onKeyDown(e: KeyboardEvent) {
    const i = options.indexOf(value);
    const last = options.length - 1;
    let next: number;
    if (e.key === 'ArrowRight') next = i === last ? 0 : i + 1;
    else if (e.key === 'ArrowLeft') next = i === 0 ? last : i - 1;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = last;
    else return;
    e.preventDefault();
    onChange(options[next]);
    items.current[next]?.focus();
  }

  return (
    <div
      role={role}
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn(
        'flex gap-1 rounded-lg border border-white/10 bg-surface-900/60 p-1',
        className,
      )}
    >
      {options.map((opt, i) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            type="button"
            ref={(el) => {
              items.current[i] = el;
            }}
            role={tabs ? 'tab' : 'radio'}
            id={tabs ? itemId?.(opt) : undefined}
            aria-controls={tabs ? controls : undefined}
            {...(tabs
              ? { 'aria-selected': active }
              : { 'aria-checked': active })}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(opt)}
            className={cn(
              // transition-colors, not `transition`: a focus ring that fades
              // in over 150ms reads as lag, so box-shadow stays instant.
              'focus-ring touch-target flex-1 rounded-md px-3 text-sm font-semibold transition-colors',
              active
                ? 'bg-accent/15 text-accent-bright'
                : 'text-muted hover:text-paper',
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
