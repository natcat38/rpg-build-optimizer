# Searchable Combobox Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Character, Weapon, and Artifact Set native `<select>` elements with a custom `<Combobox>` component that lets users type to filter the list.

**Architecture:** A single reusable `Combobox` component lives in `src/components/ui/Combobox.tsx`. It is a controlled component that takes an `options` array and calls `onChange` with the selected value. Three integration sites swap their `<select>` for `<Combobox>` with no changes to surrounding state logic.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Vitest + @testing-library/react

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `src/components/ui/Combobox.tsx` | Reusable filtered-dropdown component |
| Create | `src/components/ui/Combobox.test.tsx` | Unit tests for Combobox |
| Modify | `src/components/OptimizePanel.tsx` | Replace Character and Weapon `<select>` |
| Modify | `src/components/ArtifactForm.tsx` | Replace Artifact Set `<select>` |

---

## Task 1: Build the Combobox component (TDD)

**Files:**
- Create: `src/components/ui/Combobox.test.tsx`
- Create: `src/components/ui/Combobox.tsx`

---

- [ ] **Step 1: Create the test file**

Create `src/components/ui/Combobox.test.tsx` with this full content:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Combobox } from './Combobox';

const OPTIONS = [
  { value: 'hu_tao', label: 'Hu Tao' },
  { value: 'raiden', label: 'Raiden Shogun' },
  { value: 'xiao', label: 'Xiao' },
];

describe('Combobox', () => {
  it('shows the selected label on the trigger button', () => {
    render(<Combobox options={OPTIONS} value="raiden" onChange={() => {}} />);
    expect(screen.getByRole('button')).toHaveTextContent('Raiden Shogun');
  });

  it('opens the dropdown when the trigger is clicked', async () => {
    render(<Combobox options={OPTIONS} value="hu_tao" onChange={() => {}} />);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('filters options case-insensitively as the user types', async () => {
    render(<Combobox options={OPTIONS} value="hu_tao" onChange={() => {}} />);
    await userEvent.click(screen.getByRole('button'));
    await userEvent.type(screen.getByRole('textbox'), 'xia');
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByRole('listitem')).toHaveTextContent('Xiao');
  });

  it('shows "No results" when the query matches nothing', async () => {
    render(<Combobox options={OPTIONS} value="hu_tao" onChange={() => {}} />);
    await userEvent.click(screen.getByRole('button'));
    await userEvent.type(screen.getByRole('textbox'), 'zzz');
    expect(screen.getByText('No results')).toBeInTheDocument();
  });

  it('calls onChange with the selected value and closes the dropdown', async () => {
    const onChange = vi.fn();
    render(<Combobox options={OPTIONS} value="hu_tao" onChange={onChange} />);
    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(screen.getByText('Xiao'));
    expect(onChange).toHaveBeenCalledWith('xiao');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('closes without selecting on Escape', async () => {
    const onChange = vi.fn();
    render(<Combobox options={OPTIONS} value="hu_tao" onChange={onChange} />);
    await userEvent.click(screen.getByRole('button'));
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('navigates the list with arrow keys and selects with Enter', async () => {
    const onChange = vi.fn();
    render(<Combobox options={OPTIONS} value="hu_tao" onChange={onChange} />);
    await userEvent.click(screen.getByRole('button'));
    // activeIndex starts at 0 (Hu Tao); two ArrowDowns reach Xiao at index 2
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenCalledWith('xiao');
  });
});
```

---

- [ ] **Step 2: Run the tests — verify they all fail**

```
npm test -- Combobox
```

Expected: 7 failures with `Cannot find module './Combobox'`

---

- [ ] **Step 3: Create the Combobox component**

Create `src/components/ui/Combobox.tsx` with this full content:

```tsx
import { useState, useRef, useEffect } from 'react';

interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function Combobox({ options, value, onChange, placeholder }: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? placeholder ?? '';

  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onOutsideMouseDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', onOutsideMouseDown);
    return () => document.removeEventListener('mousedown', onOutsideMouseDown);
  }, [open]);

  function handleSelect(opt: ComboboxOption) {
    onChange(opt.value);
    setOpen(false);
    setQuery('');
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[activeIndex]) handleSelect(filtered[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {open ? (
        <input
          ref={inputRef}
          className="field"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search…"
        />
      ) : (
        <button
          type="button"
          className="field flex w-full items-center justify-between text-left"
          onClick={() => setOpen(true)}
        >
          <span>{selectedLabel}</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#e9c46a"
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
          role="list"
          className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-white/10 bg-abyss-900 shadow-lg"
        >
          {filtered.length === 0 ? (
            <li role="listitem" className="px-3 py-2 text-sm text-muted">
              No results
            </li>
          ) : (
            filtered.map((opt, i) => (
              <li
                key={opt.value}
                role="listitem"
                className={[
                  'cursor-pointer px-3 py-2 text-sm',
                  opt.value === value ? 'text-mora' : 'text-parchment',
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
```

---

- [ ] **Step 4: Run the tests — verify they all pass**

```
npm test -- Combobox
```

Expected: 7 tests pass

---

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Combobox.tsx src/components/ui/Combobox.test.tsx
git commit -m "feat(ui): add searchable Combobox component"
```

---

## Task 2: Wire Combobox into OptimizePanel

**Files:**
- Modify: `src/components/OptimizePanel.tsx:68-95`

---

- [ ] **Step 1: Replace the Character and Weapon `<select>` elements**

In `src/components/OptimizePanel.tsx`, add the import at line 1 and replace both `<label>` blocks for Character and Weapon.

Add this import after the existing imports:

```tsx
import { Combobox } from './ui/Combobox';
```

Replace the Character `<label>` block (currently lines 68–81):

```tsx
<div className="block">
  <span className="field-label">Character</span>
  <Combobox
    options={chars.map((c) => ({ value: c.key, label: c.name }))}
    value={characterKey}
    onChange={setCharacterKey}
  />
</div>
```

Replace the Weapon `<label>` block (currently lines 82–95):

```tsx
<div className="block">
  <span className="field-label">Weapon</span>
  <Combobox
    options={weapons.map((w) => ({ value: w.key, label: w.name }))}
    value={weaponKey}
    onChange={setWeaponKey}
  />
</div>
```

---

- [ ] **Step 2: Run the full test suite**

```
npm test
```

Expected: all tests pass (the existing OptimizePanel tests don't interact with these selects directly)

---

- [ ] **Step 3: Commit**

```bash
git add src/components/OptimizePanel.tsx
git commit -m "feat(ui): replace character and weapon selects with Combobox"
```

---

## Task 3: Wire Combobox into ArtifactForm

**Files:**
- Modify: `src/components/ArtifactForm.tsx:42-55`

---

- [ ] **Step 1: Replace the Artifact Set `<select>` element**

In `src/components/ArtifactForm.tsx`, add the import after the existing imports:

```tsx
import { Combobox } from './ui/Combobox';
```

Replace the Set `<label>` block (currently lines 42–55):

```tsx
<div className="block">
  <span className="field-label">Set</span>
  <Combobox
    options={genshinAdapter.sets().map((s) => ({ value: s.key, label: formatSetName(s.name) }))}
    value={setKey}
    onChange={setSetKey}
  />
</div>
```

---

- [ ] **Step 2: Run the full test suite**

```
npm test
```

Expected: all tests pass

---

- [ ] **Step 3: Commit**

```bash
git add src/components/ArtifactForm.tsx
git commit -m "feat(ui): replace artifact set select with Combobox"
```
