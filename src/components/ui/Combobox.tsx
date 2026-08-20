/**
 * Generic, domain-agnostic UI primitives shared across feature components
 * (currently a filterable/typeable Combobox used for character and weapon
 * pickers).
 * @packageDocumentation
 */

import { useId, useState, useRef, useEffect } from 'react';

interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** What this picker selects ("Character", "Weapon", …). Without it the
   *  control's only accessible name is its current value, so a screen-reader
   *  user hears "Raiden Shogun, button" with no idea what it sets. */
  label?: string;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder,
  label,
}: ComboboxProps) {
  const listId = useId(); // three of these render on one page — ids must differ
  const optionId = (i: number) => `${listId}-opt-${i}`;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  // Open/closed swap <input> for <button> at the same position, so React
  // unmounts whichever element had focus and it lands on <body>. Track that
  // the user was in here to hand focus back to the trigger on close.
  const wasOpen = useRef(false);

  const selectedLabel =
    options.find((o) => o.value === value)?.label ?? placeholder ?? '';

  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  function changeQuery(next: string) {
    setQuery(next);
    setActiveIndex(0);
  }

  useEffect(() => {
    if (open) inputRef.current?.focus();
    else if (wasOpen.current) triggerRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onOutsideMouseDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        changeQuery('');
      }
    }
    document.addEventListener('mousedown', onOutsideMouseDown);
    return () => document.removeEventListener('mousedown', onOutsideMouseDown);
  }, [open]);

  function handleSelect(opt: ComboboxOption) {
    onChange(opt.value);
    setOpen(false);
    changeQuery('');
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setOpen(false);
      changeQuery('');
      return;
    }
    if (filtered.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[activeIndex]) handleSelect(filtered[activeIndex]);
    }
  }

  // Tabbing out of the input (or clicking past it) must close the listbox —
  // mousedown-outside alone leaves it open under keyboard navigation.
  function onBlur(e: React.FocusEvent) {
    if (!containerRef.current?.contains(e.relatedTarget as Node | null)) {
      wasOpen.current = false; // focus left deliberately; don't yank it back
      setOpen(false);
      changeQuery('');
    }
  }

  return (
    <div ref={containerRef} className="relative" onBlur={onBlur}>
      {open ? (
        <input
          ref={inputRef}
          className="field"
          role="combobox"
          aria-label={label}
          aria-expanded="true"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-activedescendant={
            filtered[activeIndex] ? optionId(activeIndex) : undefined
          }
          value={query}
          onChange={(e) => changeQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search…"
        />
      ) : (
        <button
          ref={triggerRef}
          type="button"
          role="combobox"
          aria-label={label}
          aria-expanded="false"
          className="field flex w-full items-center justify-between gap-2 text-left"
          onClick={() => setOpen(true)}
        >
          <span className="min-w-0 truncate">{selectedLabel}</span>
          <svg
            className="flex-none text-accent"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      )}
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          // Keep focus in the input while an option is clicked; otherwise the
          // blur-close below fires first and the click lands on nothing.
          onMouseDown={(e) => e.preventDefault()}
          className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-white/10 bg-surface-900 shadow-lg"
        >
          {filtered.length === 0 ? (
            // role=presentation: a listbox may only own option/group children.
            <li role="presentation" className="px-3 py-2 text-sm text-muted">
              No results
            </li>
          ) : (
            filtered.map((opt, i) => (
              <li
                key={opt.value}
                id={optionId(i)}
                role="option"
                aria-selected={opt.value === value}
                className={[
                  'cursor-pointer px-3 py-2 text-sm',
                  opt.value === value ? 'text-accent' : 'text-paper',
                  i === activeIndex ? 'bg-white/5' : 'hover:bg-white/5',
                ].join(' ')}
                onClick={() => handleSelect(opt)}
                onMouseEnter={() => setActiveIndex(i)}
              >
                {opt.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
