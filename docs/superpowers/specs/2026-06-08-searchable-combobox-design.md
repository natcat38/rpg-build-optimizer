# Searchable Combobox for Character, Weapon, and Artifact Set Inputs

**Date:** 2026-06-08
**Status:** Approved

## Problem

The Character, Weapon, and Artifact Set inputs are native `<select>` elements. The option lists are long (all Genshin characters, all weapons, all artifact sets) and offer no way to type and narrow down choices. Users must scroll through the full list every time.

## Solution

Replace the three long selects with a custom `<Combobox>` component that lets users type to filter options. Short lists (Build Level, Maximise, Slot, Main stat — all ≤13 items) stay as native `<select>` elements unchanged.

## Component API

**File:** `src/components/ui/Combobox.tsx`

```ts
interface ComboboxProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}
```

- `options` — the full unfiltered list
- `value` — currently selected value (controlled)
- `onChange` — called with the new value when user selects an option
- `placeholder` — text shown in the trigger button when no value is selected (optional)

## Behaviour

### Closed state
A `<button>` that looks identical to the existing `select.field` style: dark background, parchment text, gold chevron icon at the right. Displays the label of the currently selected option.

### Open state
Clicking the button opens an absolutely-positioned dropdown directly below the trigger. The trigger area switches to a focused `<input>` (same `.field` style, no chevron) so the user can type immediately without an extra click. Below the input is a scrollable list of filtered options (max-height ~220 px with overflow-y-auto).

### Filtering
Case-insensitive substring match on `option.label`. Runs on every keystroke. If no options match, shows a "No results" message.

### Selection
Clicking an option (or pressing Enter on the keyboard-focused item) selects it, closes the dropdown, and clears the search query.

### Dismissal
- Click outside the component → close, clear query
- Escape key → close, clear query

### Keyboard navigation
- Arrow Down / Arrow Up → move focus through the filtered list
- Enter → select the focused item
- Escape → close without selecting

## Styling

Matches the existing arcane-console Teyvat Forge theme using only existing Tailwind utilities and the project's custom CSS classes:

| Element | Classes |
|---|---|
| Trigger button | `.field` + gold chevron (matches `select.field`) |
| Open input | `.field` |
| Dropdown panel | `absolute bg-abyss-900 border border-white/10 rounded-lg shadow-panel` |
| List item | `text-parchment px-3 py-2 text-sm cursor-pointer hover:bg-white/5` |
| Selected item | `text-mora` (gold) |
| No-results message | `text-muted text-sm px-3 py-2` |

No new CSS classes are introduced.

## Integration Points

### `src/components/OptimizePanel.tsx`
- Replace the `<select>` for **Character** (lines 70–80) with `<Combobox>`
- Replace the `<select>` for **Weapon** (lines 84–95) with `<Combobox>`
- Options built from `chars.map(c => ({ value: c.key, label: c.name }))` and `weapons.map(w => ({ value: w.key, label: w.name }))`

### `src/components/ArtifactForm.tsx`
- Replace the `<select>` for **Artifact Set** (lines 44–54) with `<Combobox>`
- Options built from `genshinAdapter.sets().map(s => ({ value: s.key, label: formatSetName(s.name) }))`

## Out of Scope

- Build Level, Maximise, Slot, Main stat selects — short lists, no change
- Fuzzy/ranked matching — substring is sufficient for these lists
- Virtualisation — the longest list (weapons) is a few hundred items; rendering all filtered rows is fine

## Testing

- Unit tests for the Combobox component: filtering logic, keyboard nav, open/close, selection
- Existing `OptimizePanel` and `ArtifactForm` tests should continue to pass without modification (they interact via value/onChange, not the internal DOM structure)
