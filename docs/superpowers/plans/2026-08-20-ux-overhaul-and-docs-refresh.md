# UX Overhaul & Docs Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the post-import scroll wall, add a character detail drawer with tabs, explain the app's numbers to users in plain language, and bring the docs (README, knowledge bundle) back in sync with the code.

**Architecture:** All UI work stays inside the existing single-page App.tsx section flow — no router. The drawer is the one new UI primitive (vaul, left on desktop / bottom on mobile). Docs work is pure Markdown plus two tiny copy changes.

**Tech Stack:** Vite + React 19 + Tailwind CSS 3 + zustand. Tests: vitest + @testing-library/react (jsdom). One new dependency: `vaul@^1.1.2` (React 19 peer-dep confirmed).

## Global Constraints

- Node >= 20, React ^19.2.8, Tailwind ^3.4.14 — do NOT upgrade Tailwind to v4, do NOT add shadcn/Base UI/Radix beyond what vaul itself pulls in (`@radix-ui/react-dialog`).
- Client-side only (ADR-0001). No new network calls.
- Windows repo with autocrlf: run `npx prettier --write <changed files only>` — a repo-wide `npm run format:check` fails on CRLF locally while CI is green (known gotcha).
- Verify each task with: `npm test`, `npm run lint`, `npm run typecheck` (typecheck at least once before the final commit of a workstream).
- Commit per task on a branch `feat/ux-overhaul` (Workstreams A+B) and `docs/refresh` (Workstream C). End commit messages with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- Copy style: sentences, not jargon. The app's persona is "instrument panel", UK spelling ("Optimise") — match existing strings.

## Research findings this plan is built on (do not re-derive)

1. **The scroll wall is real and is the top issue.** With a 109-character roster imported, the page is ~9,800px tall (desktop) and "Endgame teams" (step 3) sits at ~8,500px — 9–11 screens down. Cause: `RosterView` renders every character card inline (`src/roster/RosterView.tsx:123-127`).
2. **Input contrast is fine.** A pixel-sampled audit of every main-flow control passed WCAG (9.75:1 game pill, 8.96:1 presets, 7.54:1 GOOD button, weakest 5.07:1 on "Or add one manually"). The "inputs look disabled" complaint traces to the UID **Fetch button being disabled with no hint why** (`ImportPanel.tsx:141-147`), plus tap targets 38–40px tall and 13px radio dots in TeamsView.
3. **"No build could be formed … under their meta recipe"** (`src/plan/PlanView.tsx:55-58`) fires when the greedy plan allocation (`src/plan/composePlan.ts:92-182` — members optimised in priority order, winners' pieces leave the shared pool) leaves nothing that satisfies the character's hard meta constraints (`src/meta/metaTargets.ts`, e.g. Ayaka = 4pc BlizzardStrayer + ATK% sands + Cryo goblet + ER 140). The conflict lines below it already explain who took the pieces, but the headline copy is unreadable.
4. **The changing headline metric is the optimisation objective**: `avg_damage` when a curated damage profile exists (~24 chars, `src/damage/profiles.ts`), else the meta recipe's objective (`hp_pct` for Bennett/Zhongli/Sigewinne, `em` for Kazuha/Kuki), else `crit_value` (`src/plan/composePlan.ts:110-117`). Correct behaviour, zero in-UI explanation.
5. **Set bonuses ARE optimised correctly** (exact branch-and-bound with 2pc/4pc bonuses in scoring and bounds — `src/optimizer/score.ts:36-49`, `src/optimizer/search.ts:83-246`). Mixed-set results are the damage model under-valuing conditional 4pc effects, not a search bug. Fixing that is the deferred damage-engine work, not a UI task.
6. **Theater/Stygian are typed but not wired** (`src/teams/comps.ts` — every archetype `modes: ['abyss']`; no `recommendTheater/Stygian`). All meta data is hand-curated "as of patch 6.7" with no documented refresh process — the per-patch runbook (Task 12) is the prerequisite for any multi-mode work.
7. **Docs drift found**: README says React 18 (`README.md:55`), a never-true benchmark figure ("1 in 89,043", `README.md:92-93`), a dead spec link (`docs/superpowers/specs/2026-06-05-depth-layer-and-portfolio-design.md`, referenced from README:109 + 4 other docs), and the entire `knowledge/` bundle predates v2 (no `avg_damage`, no damage/teams/plan entities).
8. **Drawer research**: use `vaul@1.1.2` directly — native `direction="left"|"bottom"` prop, focus trap/scroll lock/aria-modal built in. shadcn's drawer now needs `@base-ui/react` + CLI scaffolding: too heavy for one component. Tabs: hand-rolled ARIA tablist (~40 lines), no dependency.
9. **Rotation-DPS / IWinToLose research** is in `docs/research/2026-08-20-rotation-dps-and-ranking-tables.md` — input for a future spec, NOT in scope here (see Deferred).
10. **Web Interface Guidelines audit** (vercel web-design-guidelines skill) found one keyboard blocker — the Combobox swaps `<input>`/`<button>` elements on open/close so focus drops to `<body>` after every selection or Escape (`src/components/ui/Combobox.tsx:96-136`), and doesn't close on Tab-away — plus landmark/heading/aria-live gaps and a set of one-line polish items. All folded into Workstream D below.
11. **frontend-design critique**: the "instrument panel" direction is strong and consistently executed — protect the three-font role discipline (display=identity, mono=numbers, sans=prose), the `--accent` CSS-var theming, and the numbered badges (which must ONLY mark real sequence — do not number the drawer tabs). Real bugs found: the `select.field` chevron hardcodes Genshin gold (`index.css:123`) and Combobox hardcodes a third gold (`Combobox.tsx:127`), so neither re-themes for Wuthering Waves. Art direction for the new surfaces is baked into Tasks 1, 2, 7, 8 below.
12. **ui-ux-pro-max review**: biggest beginner gap is that "Crit Value" (the hero's headline number) and the S–D grade badges are never explained anywhere; ArtifactForm validates only on submit with an unlinked error; the 8-solve plan build has no progress bar or live region; three cheap visualization wins (bullet bars for stat-vs-target, roster score bars, reuse of the Results progress bar in PlanView). Folded into Tasks 4 and Workstream D.

---

## Workstream A — flow & copy fixes

### Task 1: Collapse the roster wall

**Files:**

- Modify: `src/roster/RosterView.tsx:116-129`
- Test: `src/roster/RosterView.test.tsx`

**Interfaces:** none new — presentation-only change inside `RosterView`.

- [ ] **Step 1: Write the failing test** (append to `RosterView.test.tsx`, reusing the file's existing render/fixture helpers for entries — read the top of the file and mirror how existing tests seed `useRoster`/`useInventory`):

```tsx
it('shows only the top 12 characters until "Show all" is clicked', async () => {
  seedRosterWithNCharacters(15); // build via the file's existing fixture pattern
  render(<RosterView />);
  expect(screen.getAllByRole('listitem')).toHaveLength(12);
  await userEvent.click(screen.getByRole('button', { name: /show all 15/i }));
  expect(screen.getAllByRole('listitem')).toHaveLength(15);
});
```

- [ ] **Step 2: Run it** — `npm test -- RosterView` — expect FAIL (15 listitems rendered).
- [ ] **Step 3: Implement.** In `RosterView`, above the `return`:

```tsx
const [showAll, setShowAll] = useState(false);
const COLLAPSED_COUNT = 12;
const visible = showAll ? rows : rows.slice(0, COLLAPSED_COUNT);
```

Replace `rows.map` with `visible.map`, and after the `</ul>` add (styled per the frontend-design critique: reuse the app's existing `▶` disclosure idiom from `App.tsx:330-336` and the `.field-label` tracking, not a new "Load more" button style):

```tsx
{
  rows.length > COLLAPSED_COUNT && !showAll && (
    <button
      className="flex min-h-11 w-full items-center justify-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted transition hover:text-paper"
      onClick={() => setShowAll(true)}
    >
      <span aria-hidden="true">▶</span> Show all {rows.length} characters,
      sorted by score
    </button>
  );
}
```

- [ ] **Step 4: Run tests** — `npm test -- RosterView` — expect PASS (all tests in file).
- [ ] **Step 5: Commit** — `feat: collapse roster to top 12 with show-all toggle`

### Task 2: Stable section ids, sticky step nav, scroll-to-roster on import

**Files:**

- Modify: `src/components/App.tsx` (Section component :30-57, section usages :323-383)
- Modify: `src/components/ImportPanel.tsx:56-62`
- Test: `src/components/App.test.tsx`

**Interfaces:**

- Produces: DOM ids `step-load`, `step-roster`, `step-teams`, `step-plan`, `step-optimise` (Task 9's drawer also scrolls to `step-optimise`).

- [ ] **Step 1: Failing test** (append to `App.test.tsx`, mirroring its existing render setup):

```tsx
it('renders a sticky step nav with anchors when a roster exists', () => {
  seedRosterAndInventory(); // reuse the file's existing roster-seeding pattern
  render(<App />);
  const nav = screen.getByRole('navigation', { name: /steps/i });
  ['Load', 'Roster', 'Teams', 'Plan', 'Optimise'].forEach((label) =>
    expect(
      within(nav).getByRole('link', { name: new RegExp(label, 'i') }),
    ).toBeInTheDocument(),
  );
});
```

- [ ] **Step 2: Run** — `npm test -- App.test` — expect FAIL.
- [ ] **Step 3: Implement.**
  1. Add `id?: string` to `Section`'s props and spread onto the `<section id={id} className="scroll-mt-20 animate-fade-up" …>` (the `scroll-mt-20` offsets the sticky bar).
  2. Give each Section its id: `id="step-load"`, `"step-roster"`, `"step-teams"`, `"step-plan"`, `"step-optimise"`.
  3. Insert the nav directly under `<header>` (inside the fragment at App.tsx:297), rendered only `{hasRoster && (…)}`. Styling per the frontend-design critique: this is chrome, not content — full-bleed, no rounded container, `.chip` items with a mini mono number, active-section chip using the `.section-badge` color formula, horizontal-scroll edge fade via mask instead of arrows:

```tsx
<nav
  aria-label="Steps"
  className="sticky top-0 z-20 -mx-5 mb-6 flex gap-1 overflow-x-auto border-b border-white/5 bg-surface-800/80 px-5 py-2 backdrop-blur-md [mask-image:linear-gradient(to_right,transparent,black_12px,black_calc(100%-12px),transparent)]"
>
  {[
    ['step-load', '01', 'Load'],
    ['step-roster', '02', 'Roster'],
    ['step-teams', '03', 'Teams'],
    ['step-plan', '04', 'Plan'],
    ['step-optimise', '05', 'Optimise'],
  ].map(([id, n, label]) => (
    <a
      key={id}
      href={`#${id}`}
      className="chip min-h-11 items-center whitespace-nowrap hover:border-accent/40 hover:text-paper"
    >
      <span className="font-mono text-accent-bright">{n}</span> {label}
    </a>
  ))}
</nav>
```

(Nice-to-have if cheap: track the section nearest the viewport top with an IntersectionObserver and give that chip `border-accent/30 bg-accent/10 text-accent-bright` — the `.section-badge` formula. Skip if it doesn't fit the task budget; the nav is useful without it.) 4. Add a tiny scroll helper (in `App.tsx` or a new `src/ui/scroll.ts`) that respects reduced motion — the audit found `scrollIntoView({ behavior: 'smooth' })` at `App.tsx:255-257` bypasses the CSS `prefers-reduced-motion` override because explicit `behavior` wins over CSS:

```ts
export function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth',
  });
}
```

Use it for the existing results scroll (`App.tsx:251-259`) AND the new import scroll cue in `ImportPanel.onFile` after `setRoster(roster)`:

```tsx
if (rosterCount > 0) setTimeout(() => scrollToId('step-roster'), 150);
```

- [ ] **Step 4: Run** — `npm test -- App.test` and `npm test -- ImportPanel` — expect PASS.
- [ ] **Step 5: Commit** — `feat: sticky step nav + scroll to roster after import`

### Task 3: Rewrite the infeasible-plan message

**Files:**

- Modify: `src/plan/PlanView.tsx:54-59`
- Test: `src/plan/PlanView.test.tsx` (update any assertion on the old string)

- [ ] **Step 1:** Replace the paragraph body with:

```tsx
<p className="panel text-sm text-muted">
  Couldn&apos;t gear {name}: teammates earlier in the plan had first pick of the
  shared inventory, and the artifacts left don&apos;t meet {name}&apos;s
  recommended loadout (required set, main stats and ER). The notes below show
  which pieces went where.
</p>
```

- [ ] **Step 2 (rainbow-build coverage gap):** Plan members with NO `META_TARGETS` entry (e.g. Kamisato Ayato — in `comps.ts` but not `metaTargets.ts`) get an unconstrained `crit_value` solve: no set requirement, no main-stat locks, and since set bonuses add ~no crit, the "optimal" result is five mismatched sets and often an off-stat goblet. Users read this as a bug. Two fixes, both in this task:
  1. **Label it.** In `MemberCard` (`PlanView.tsx:22-69`), when `META_TARGETS[characterKey]` is undefined, render above the BuildCard:

```tsx
<p className="text-xs text-muted">
  No curated recipe for {name} yet — this is the highest raw Crit Value from the
  remaining pieces, ignoring set bonuses. Treat it as a stat-stick draft, not a
  real build.
</p>
```

2. **Audit the gap.** Cross-check every `characterKey` appearing in `COMP_ARCHETYPES` slot options against `META_TARGETS` keys (a 10-line script or test). Add a vitest guard in `src/teams/comps.test.ts` that reports the uncovered list, and add curated recipes (from each character's KQM guide, same format as existing entries) for any character who is a weight-1.0 "ideal" pick in any archetype — those are the ones the plan will actually select. Lower-weight substitutes may stay uncovered but now carry the label from (1).

- [ ] **Step 3:** `npm test -- PlanView` — fix any test asserting the old copy (search for "could be formed"), expect PASS.
- [ ] **Step 4: Commit** — `fix: explain infeasible + un-recipe'd plan builds; cover comp picks in META_TARGETS`

### Task 4: Explain the headline metric (objectiveHint)

**Files:**

- Modify: `src/labels.ts` (canonical labels; `src/ui/labels.ts` re-exports it)
- Modify: `src/components/BuildCard.tsx:70-81`
- Test: `src/labels.test.ts`, `src/components/BuildCard.test.tsx`

**Interfaces:**

- Produces: `objectiveHint(o: Objective): string` exported from `src/labels.ts` (and via `src/ui/labels.ts`). Note `Objective = StatKey | 'crit_value' | 'avg_damage'` (`src/game/types.ts:89`), so this is a function with a fallback, not a Record.

- [ ] **Step 1: Failing test** (append to `labels.test.ts`):

```ts
it('objectiveHint explains every objective in one sentence', () => {
  expect(objectiveHint('avg_damage')).toMatch(/estimated damage/i);
  expect(objectiveHint('crit_value')).toMatch(/crit value/i);
  expect(objectiveHint('hp_pct')).toMatch(/HP/);
  expect(objectiveHint('em')).toMatch(/Elemental Mastery/i);
});
```

- [ ] **Step 2: Run** — `npm test -- labels` — FAIL (`objectiveHint` not exported).
- [ ] **Step 3: Implement** in `src/labels.ts`, next to `objectiveLabel`:

```ts
/** One-sentence explanation of why a build is ranked by this metric —
 *  shown under the headline number so the metric changing per character
 *  reads as intentional, not a bug. */
export function objectiveHint(o: Objective): string {
  switch (o) {
    case 'avg_damage':
      return 'Estimated damage from this character’s curated rotation — for comparing builds, not matching in-game numbers.';
    case 'crit_value':
      return 'Crit Value = 2×Crit Rate + Crit DMG — a gear-quality proxy for crit-scaling damage dealers.';
    case 'hp_pct':
      return 'This character’s kit scales off HP, so builds are ranked by it instead of damage.';
    case 'em':
      return 'This character’s kit scales off Elemental Mastery, so builds are ranked by it instead of damage.';
    default:
      return `Builds are ranked by ${objectiveLabel(o)} — the stat this character’s role values most.`;
  }
}
```

(Import `Objective` if not already imported in the file; match the file's existing quote style.)

- [ ] **Step 4:** In `BuildCard.tsx`, replace the `avg_damage`-only note (lines 76-80) with the general hint:

```tsx
<p className="max-w-xs text-[0.7rem] text-muted">
  {objectiveHint(request.objective)}
</p>
```

and add `objectiveHint` to the import from `'../ui/labels'`.

- [ ] **Step 5 (ui-ux-pro-max H1):** Extend the same treatment to the two other unexplained numbers a beginner meets first:
  - Hero (`App.tsx:94-96`): under "Crit Value, one real solve", add `<p className="text-[0.7rem] text-muted">{objectiveHint('crit_value')}</p>`.
  - Grade badge (`BuildCard.tsx:82-88`): add `aria-label={`Grade ${grade.grade} — how close this build is to endgame stat targets`}` and `title` with the same text to the badge `<span>`.
- [ ] **Step 6: Run** — `npm test -- labels`, `npm test -- BuildCard`, `npm test -- App.test` (update the old "estimated —" assertion if one exists) — PASS.
- [ ] **Step 7: Commit** — `feat: explain ranking metric, hero Crit Value, and grade badges`

### Task 5: UID Fetch hint

**Files:**

- Modify: `src/components/ImportPanel.tsx:131-148`
- Test: `src/components/ImportPanel.test.tsx`

- [ ] **Step 1:** After the `<div className="flex gap-2">…</div>` input row, add:

```tsx
{
  !uid && (
    <p id="uid-hint" className="mt-2 text-xs text-muted">
      Enter your UID to enable Fetch.
    </p>
  );
}
```

and on the UID `<input>` add `aria-describedby="uid-hint"`.

- [ ] **Step 2: Test** (append):

```tsx
it('explains why Fetch is disabled until a UID is entered', async () => {
  render(<ImportPanel />);
  expect(
    screen.getByText(/enter your uid to enable fetch/i),
  ).toBeInTheDocument();
  await userEvent.type(screen.getByLabelText('UID'), '700000001');
  expect(screen.queryByText(/enter your uid/i)).not.toBeInTheDocument();
});
```

- [ ] **Step 3: Run** — `npm test -- ImportPanel` — PASS. **Commit** — `fix: hint why Fetch is disabled without a UID`

### Task 6: 44px tap targets + endgame-mode pills

**Files:**

- Modify: `src/index.css:113-151` (`.field`, `.btn-primary`, `.btn-ghost`)
- Modify: `src/teams/TeamsView.tsx:139-157`
- Test: `src/teams/TeamsView.test.tsx` (radios must stay findable by role)

- [ ] **Step 1:** In `index.css` add to `.btn-primary`, `.btn-ghost`, and `.field` (plain CSS lines inside each rule, after the `@apply`): `min-height: 2.75rem;` (44px) and `touch-action: manipulation;` (audit item: avoids mobile double-tap-zoom/tap-delay on controls).
- [ ] **Step 2:** In `TeamsView`, restyle the mode radios as pills — keep real radio inputs for semantics, visually hide them, style the label by checked state:

```tsx
{
  MODES.map((m) => (
    <label
      key={m.id}
      className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm transition
      ${m.live ? 'border-white/15 text-paper has-[:checked]:border-accent/60 has-[:checked]:bg-accent/10 has-[:checked]:text-accent-bright' : 'cursor-not-allowed border-white/5 text-muted'}`}
    >
      <input
        type="radio"
        name="endgame-mode"
        value={m.id}
        defaultChecked={m.live}
        disabled={!m.live}
        className="sr-only"
        aria-label={m.label}
      />
      {m.label}
      {!m.live && ' (coming soon)'}
    </label>
  ));
}
```

(`has-[:checked]` works on Tailwind 3.4. Delete the old inner `<span>`.)

- [ ] **Step 3: Run** — `npm test -- TeamsView` — PASS (radios still `getByRole('radio')`-able). Visually verify via `npm run dev` at 375px width: no control under 44px in the main flow.
- [ ] **Step 4: Commit** — `fix: 44px tap targets and pill-styled endgame mode selector`

---

## Workstream B — character detail drawer

### Task 7: Drawer primitive (vaul)

**Files:**

- Create: `src/components/ui/Drawer.tsx`
- Modify: `package.json` (add dep)
- Test: `src/components/ui/Drawer.test.tsx`

**Interfaces:**

- Produces: `<AppDrawer open onClose title>{children}</AppDrawer>` — left panel ≥768px, bottom sheet below. Consumed by Task 8/9.

- [ ] **Step 1:** `npm install vaul@^1.1.2`
- [ ] **Step 2: Failing test:**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppDrawer } from './Drawer';

it('renders children in a dialog when open and closes via the close button', async () => {
  const onClose = vi.fn();
  render(
    <AppDrawer open onClose={onClose} title="Ayaka">
      <p>body</p>
    </AppDrawer>,
  );
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByText('body')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: /close/i }));
  expect(onClose).toHaveBeenCalled();
});
```

(jsdom lacks `window.matchMedia` — add the standard stub in the test file or reuse the repo's test setup if it already has one; check `vite.config.ts` test.setupFiles.)

- [ ] **Step 3: Implement `src/components/ui/Drawer.tsx`:**

```tsx
/** App-wide detail drawer: slides from the left on desktop, from the bottom on
 *  mobile. vaul supplies focus trap, scroll lock, esc-close and aria-modal. */
import { useEffect, useState, type ReactNode } from 'react';
import { Drawer as Vaul } from 'vaul';

function useIsDesktop() {
  const [desktop, setDesktop] = useState(
    () => window.matchMedia('(min-width: 768px)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const on = (e: MediaQueryListEvent) => setDesktop(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return desktop;
}

export function AppDrawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const desktop = useIsDesktop();
  return (
    <Vaul.Root
      open={open}
      onOpenChange={(o) => !o && onClose()}
      direction={desktop ? 'left' : 'bottom'}
    >
      <Vaul.Portal>
        <Vaul.Overlay className="fixed inset-0 z-40 bg-surface-900/60 backdrop-blur-sm" />
        <Vaul.Content
          className={
            desktop
              ? 'fixed inset-y-0 left-0 z-50 w-full max-w-md overflow-y-auto border-r border-white/10 border-l-2 border-l-accent/50 bg-surface-700/60 p-6 backdrop-blur-md'
              : 'fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-white/10 bg-surface-700/60 p-5 pb-[env(safe-area-inset-bottom)] backdrop-blur-md'
          }
        >
          {!desktop && (
            <div
              aria-hidden="true"
              className="mx-auto mb-3 h-1 w-9 rounded-full bg-white/15"
            />
          )}
          <div className="mb-4 flex items-center justify-between gap-3">
            <Vaul.Title className="font-display text-lg font-bold text-paper">
              {title}
            </Vaul.Title>
            <button
              className="btn-ghost min-h-11"
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          {children}
        </Vaul.Content>
      </Vaul.Portal>
    </Vaul.Root>
  );
}
```

Art-direction constraints (from the frontend-design critique — follow, don't improvise): do NOT give the drawer `.panel`'s `::before` accent-gradient hairline (that's the signature of primary content panels; the drawer's signature is the solid `border-l-2 border-l-accent/50` edge on desktop and the drag handle on mobile). If adding an enter animation beyond vaul's default, use the existing `cubic-bezier(0.22, 1, 0.36, 1)` easing from `tailwind.config.js` at ~200–240ms; plain CSS transitions inherit the global `prefers-reduced-motion` kill-switch automatically.

- [ ] **Step 4: Run** — `npm test -- Drawer` — PASS. **Commit** — `feat: AppDrawer primitive (vaul, left/bottom by viewport)`

### Task 8: CharacterDetail content with tabs

**Files:**

- Create: `src/roster/CharacterDetail.tsx`
- Test: `src/roster/CharacterDetail.test.tsx`

**Interfaces:**

- Consumes: `computeBuildScore(entry, artifacts)` (`src/roster/buildScore.ts`), `META_TARGETS` + `MetaTarget` (`src/meta/metaTargets.ts:16-28` — fields `setRequirement: SetRequirement`, `mains: Partial<Record<Slot, StatKey>>`, `erTarget?`, `objective`, `source`, `statTargets?`), `SetRequirement` (`src/game/types.ts:77-80` — `{kind:'4pc',setKey}` | `{kind:'2+2',setKeys:[a,b]}` | `{kind:'2pc',setKey}`), `COMP_ARCHETYPES` (`src/teams/comps.ts` — `{id,name,tier,notes,slots:[{role,options:[{characterKey,weight}]}]}`), `RosterEntry` (`src/import/good.ts:124-134`), `formatSetName`/`statLabel`/`objectiveHint` from `'../ui/labels'`, `genshinAdapter`.
- Produces: `<CharacterDetail characterKey entry artifacts />` — consumed by Task 9.

- [ ] **Step 1: Failing test:** render with a fixture entry + artifacts (mirror `RosterView.test.tsx` fixtures) and assert the four tabs exist and switch:

```tsx
it('shows Overview by default and switches tabs with clicks', async () => {
  render(
    <CharacterDetail
      characterKey="ayaka"
      entry={fixtureEntry}
      artifacts={[]}
    />,
  );
  expect(screen.getByRole('tab', { name: /overview/i })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await userEvent.click(screen.getByRole('tab', { name: /recommended/i }));
  expect(screen.getByRole('tabpanel')).toHaveTextContent(/blizzard/i);
});
```

- [ ] **Step 2: Implement.** Hand-rolled ARIA tabs + four panels, all from existing data:

```tsx
/** Drawer body for one character: what they have, what the meta wants, and
 *  which curated teams they slot into. Tabs are hand-rolled ARIA — the app
 *  has no primitives library and this doesn't justify one. */
import { useMemo, useState } from 'react';
import { genshinAdapter } from '../game/genshin/adapter';
import { computeBuildScore } from './buildScore';
import { META_TARGETS } from '../meta/metaTargets';
import { COMP_ARCHETYPES } from '../teams/comps';
import { ROLE_LABELS } from '../teams/types';
import { getDamageProfile } from '../damage/profiles';
import {
  formatSetName,
  statLabel,
  objectiveHint,
  SLOT_LABELS,
} from '../ui/labels';
import type { RosterEntry } from '../import/good';
import type { Artifact, SetRequirement } from '../game/types';
import { SLOTS } from '../game/types';

const TABS = ['Overview', 'Gear', 'Recommended', 'Teams'] as const;
type Tab = (typeof TABS)[number];

function setReqLabel(r: SetRequirement): string {
  if (r.kind === '4pc') return `4pc ${formatSetName(r.setKey)}`;
  if (r.kind === '2pc') return `2pc ${formatSetName(r.setKey)}`;
  return `2pc ${formatSetName(r.setKeys[0])} + 2pc ${formatSetName(r.setKeys[1])}`;
}

export function CharacterDetail({
  characterKey,
  entry,
  artifacts,
}: {
  characterKey: string;
  entry: RosterEntry;
  artifacts: Artifact[]; // pieces equipped on this character
}) {
  const [tab, setTab] = useState<Tab>('Overview');
  const char = genshinAdapter.character(characterKey);
  const weapon = entry.weaponKey
    ? genshinAdapter.weapon?.(entry.weaponKey)
    : undefined;
  const score = useMemo(
    () => computeBuildScore(entry, artifacts),
    [entry, artifacts],
  );
  const meta = META_TARGETS[characterKey];
  const comps = useMemo(
    () =>
      COMP_ARCHETYPES.filter((a) =>
        a.slots.some((s) =>
          s.options.some((o) => o.characterKey === characterKey),
        ),
      ),
    [characterKey],
  );

  function onKeys(e: React.KeyboardEvent) {
    const i = TABS.indexOf(tab);
    if (e.key === 'ArrowRight') setTab(TABS[(i + 1) % TABS.length]);
    if (e.key === 'ArrowLeft')
      setTab(TABS[(i + TABS.length - 1) % TABS.length]);
  }

  return (
    <div className="space-y-4">
      {/* Tab styling mirrors GameSwitcher's segmented control (src/components/GameSwitcher.tsx:11-42)
          — the app's one sanctioned "pick one of N views" idiom. Do NOT number these tabs:
          numbered badges are reserved for real sequences (the page steps), and this is a menu. */}
      <div
        role="tablist"
        aria-label="Character detail"
        className="flex gap-1 rounded-lg border border-white/10 bg-surface-900/60 p-1"
        onKeyDown={onKeys}
      >
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            tabIndex={tab === t ? 0 : -1}
            onClick={() => setTab(t)}
            className={`min-h-11 flex-1 rounded-md px-3 text-sm font-semibold transition ${
              tab === t
                ? 'bg-accent/15 text-accent-bright'
                : 'text-muted hover:text-paper'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="space-y-3 text-sm">
        {tab === 'Overview' && (
          <>
            <p className="text-muted">
              {[char?.element, weapon?.name ?? 'No weapon equipped']
                .filter(Boolean)
                .join(' · ')}
              {entry.level != null && ` · Lv ${entry.level}`}
              {entry.constellation != null && ` · C${entry.constellation}`}
            </p>
            <p className="font-mono text-3xl font-bold text-accent-bright">
              {score.total.toFixed(0)}
              <span className="text-base text-muted"> / 100</span>
            </p>
            <dl className="grid gap-1 text-xs">
              {score.components.map((c) => (
                <div key={c.label} className="flex justify-between gap-4">
                  <dt className="text-muted">{c.label}</dt>
                  <dd className="font-mono text-paper">
                    {c.points.toFixed(1)} / {c.max}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="text-xs text-muted">
              {objectiveHint(meta?.objective ?? 'crit_value')}
            </p>
          </>
        )}

        {tab === 'Gear' && (
          <ul className="space-y-1.5">
            {SLOTS.map((s) => {
              const a = artifacts.find((x) => x.slot === s);
              return (
                <li
                  key={s}
                  className="rounded-lg border border-white/5 bg-surface-900/30 px-3 py-2"
                >
                  <span className="mr-2 text-xs uppercase text-muted">
                    {SLOT_LABELS[s]}
                  </span>
                  {a ? (
                    <span>
                      {formatSetName(a.setKey)} · {statLabel(a.mainStat)}{' '}
                      <span className="font-mono text-xs">+{a.level}</span>
                    </span>
                  ) : (
                    <span className="text-muted">empty</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {tab === 'Recommended' &&
          (meta ? (
            <>
              <p>
                <span className="text-muted">Set:</span>{' '}
                {setReqLabel(meta.setRequirement)}
              </p>
              {Object.entries(meta.mains).map(([slot, stat]) => (
                <p key={slot}>
                  <span className="text-muted">
                    {SLOT_LABELS[slot as keyof typeof SLOT_LABELS]}:
                  </span>{' '}
                  {statLabel(stat)}
                </p>
              ))}
              {meta.erTarget && (
                <p>
                  <span className="text-muted">ER floor:</span> {meta.erTarget}%
                </p>
              )}
              {meta.statTargets && (
                <p className="text-xs text-muted">
                  Endgame targets:{' '}
                  {Object.entries(meta.statTargets)
                    .map(([k, v]) => `${statLabel(k as never)} ${v}`)
                    .join(', ')}
                </p>
              )}
              <a
                className="text-xs text-flux-bright underline"
                href={meta.source}
                target="_blank"
                rel="noreferrer"
              >
                Source guide (KQM)
              </a>
              {!getDamageProfile(characterKey) && (
                <p className="text-xs text-muted">
                  No curated damage profile yet — builds for this character are
                  ranked by {statLabel(meta.objective as never) || 'Crit Value'}{' '}
                  instead of estimated damage.
                </p>
              )}
            </>
          ) : (
            <p className="text-muted">
              No curated recipe for this character yet.
            </p>
          ))}

        {tab === 'Teams' &&
          (comps.length ? (
            <ul className="space-y-2">
              {comps.map((a) => (
                <li
                  key={a.id}
                  className="rounded-lg border border-white/5 bg-surface-900/30 px-3 py-2"
                >
                  <p className="font-semibold text-paper">{a.name}</p>
                  <p className="text-xs text-muted">{a.notes}</p>
                  <p className="mt-1 text-xs text-muted">
                    {a.slots
                      .map(
                        (s) =>
                          `${ROLE_LABELS[s.role]}: ${s.options[0]?.characterKey ?? '—'}`,
                      )
                      .join(' · ')}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">Not in any curated team archetype yet.</p>
          ))}
      </div>
    </div>
  );
}
```

Implementation notes for this task (verify while coding, adjust only these):

- `genshinAdapter.weapon(key)` — confirm the adapter's singular-lookup name in `src/game/genshin/adapter.ts` (characters/weapons list methods exist; a `character(key)` lookup is used in `PlanView.tsx:35`). If there is no `weapon(key)`, build a `Map` from `genshinAdapter.weapons()` like `RosterView.tsx:88`.
- `getDamageProfile` import path/name — as used in `composePlan.ts:110-117`.
- Show real character names in Teams tab via the `useCharacterNames()` pattern from `TeamsView.tsx:33-38` rather than raw keys.
- [ ] **Step 3: Run** — `npm test -- CharacterDetail` — PASS. **Commit** — `feat: character detail tabs (overview/gear/recommended/teams)`

### Task 9: Wire the drawer into the roster (and prefill Optimise)

**Files:**

- Modify: `src/roster/RosterView.tsx` (Row :18-77 and list :116-129)
- Test: `src/roster/RosterView.test.tsx`

**Interfaces:**

- Consumes: `AppDrawer` (Task 7), `CharacterDetail` (Task 8), `useOptimizeRequest.setCharacterKey/setWeaponKey` (`src/state/optimizeRequest.ts:44-45`), id `step-optimise` (Task 2).

- [ ] **Step 1: Failing test:**

```tsx
it('opens the character drawer on row click', async () => {
  seedRosterWithNCharacters(2);
  render(<RosterView />);
  await userEvent.click(screen.getAllByRole('button')[0]);
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument();
});
```

- [ ] **Step 2: Implement.**
  1. In `RosterView`, add `const [openKey, setOpenKey] = useState<string | null>(null);` and compute `byLocation` once (hoist the existing memo logic — it already builds `byLocation` inside `rows`).
  2. `Row`'s button now calls `onOpen(characterKey)` instead of toggling local state; delete the inline `<dl>` accordion and `open` state (the breakdown lives in the drawer's Overview tab now).
  3. After the `</ul>`, render:

```tsx
{
  openKey && entries[openKey] && (
    <AppDrawer
      open
      onClose={() => setOpenKey(null)}
      title={rows.find((r) => r.characterKey === openKey)?.name ?? openKey}
    >
      <CharacterDetail
        characterKey={openKey}
        entry={entries[openKey]}
        artifacts={byLocation[openKey] ?? []}
      />
      <button
        className="btn-primary mt-4 w-full"
        onClick={() => {
          const s = useOptimizeRequest.getState();
          s.setCharacterKey(openKey);
          const w = entries[openKey]?.weaponKey;
          if (w) s.setWeaponKey(w);
          setOpenKey(null);
          document
            .getElementById('step-optimise')
            ?.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        Optimise this character
      </button>
    </AppDrawer>
  );
}
```

4. Update `RosterView.test.tsx`: the old `breakdown-…` testid assertions move to drawer-based assertions.

- [ ] **Step 3: Run** — `npm test -- RosterView` — PASS. Then `npm run dev`: click a roster row on desktop (left panel) and at 375px (bottom sheet); click "Optimise this character" and confirm the Optimise panel shows that character.
- [ ] **Step 4: Run full gates** — `npm test && npm run lint && npm run typecheck` — all PASS.
- [ ] **Step 5: Commit** — `feat: roster rows open the character drawer; prefill optimise`

---

## Workstream C — docs refresh

### Task 10: README slim-down + CONTRIBUTING.md + stale fixes

**Files:**

- Modify: `README.md`
- Create: `CONTRIBUTING.md`
- Modify: `docs/superpowers/specs/2026-06-09-speed-report-design.md`, `2026-06-11-example-gear-design.md`, `2026-06-12-gap-analysis-design.md`, `docs/superpowers/plans/2026-06-06-v1.0-artifact-optimizer.md` (dead-link fix only)

- [ ] **Step 1:** Rewrite `README.md` to ~550 words with exactly these sections, in order:
  1. Title + badges + live-demo link + `docs/screenshot.png` (keep as-is).
  2. The existing one-paragraph problem hook (keep verbatim).
  3. **Features** — current bullets, each trimmed to one line; add one line for investment advice ("tells you which characters are worth investing in, from your roster's gaps").
  4. **Quick start** — only:

```bash
npm install
npm run dev
```

plus one sentence: "See [CONTRIBUTING.md](CONTRIBUTING.md) for the full dev workflow, and [FILE-MAP.md](FILE-MAP.md) (auto-generated) for the code layout." 5. **How it works** — two sentences: exact branch-and-bound in a Web Worker; decisions live in `docs/adr/`. Delete the per-ADR rationale bullets, the hand-copied project-structure tree, the Performance numbers (replace with "see [docs/speed-report.md](docs/speed-report.md), regenerated by `npm run bench`"), and the Roadmap section entirely. 6. **AI explain** — one line ("optional, serverless proxy; setup in CONTRIBUTING.md"). 7. **Data & license** — keep, one line each, linking `DATA_LICENSE`/`LICENSE`.
While editing: fix "React 18" → "React 19"; delete the "1 in 89,043" claim; remove the link to the nonexistent `2026-06-05-depth-layer-and-portfolio-design.md`.

- [ ] **Step 2:** Create `CONTRIBUTING.md` containing (moved, not rewritten): the full npm-script table, the AI-proxy local setup (env vars `ANTHROPIC_API_KEY`, `VITE_AI_ENABLED`, `UPSTASH_REDIS_REST_URL/TOKEN`, `vercel dev` note — lift the section removed from README), test/lint/typecheck workflow, the CRLF/prettier note, and a pointer to `docs/agents/issue-tracker.md` for issue conventions.
- [ ] **Step 3:** In the four docs listed above, replace the dead `2026-06-05-depth-layer-and-portfolio-design.md` link with plain text "(design doc was never written)" — do not delete surrounding prose.
- [ ] **Step 4:** `npm run docs:check && npm run file-map:check` — both PASS. **Commit** — `docs: slim README, add CONTRIBUTING, fix stale claims and dead links`

### Task 11: knowledge/ bundle catch-up

**Files:**

- Modify: `knowledge/domain/objective.md`, `knowledge/index.md`

- [ ] **Step 1:** Update `objective.md`: add `avg_damage` as an objective (one paragraph: curated damage profile → estimated rotation damage, ADR-0016; falls back to meta-recipe stat, then crit_value), alongside the existing Crit Value/EM text.
- [ ] **Step 2:** In `knowledge/index.md`, replace the "In progress" section with a "v2 (shipped)" note listing Damage profile, Comp archetype, Team recommendation, Plan, Shopping list — each as a one-line pointer to its `CONTEXT.md` glossary entry rather than new entity cards (CONTEXT.md is the canonical glossary; don't duplicate it).
- [ ] **Step 3:** `npm run docs:check` — PASS. **Commit** — `docs: bring knowledge bundle up to v2`

### Task 12: Per-patch data-refresh runbook + patch visibility

**Files:**

- Create: `docs/runbooks/patch-refresh.md`
- Modify: `src/teams/TeamsView.tsx` (one hint line), `CLAUDE.md` (one pointer line)

- [ ] **Step 1:** Write `docs/runbooks/patch-refresh.md` — a checklist to run every game patch:
  1. `npm run build:data` (refresh `data.generated.json` from the updated `genshin-db`; bump the dep first if needed).
  2. Bump `PATCH` in `src/game/genshin/adapter.ts`.
  3. Re-verify each hand-curated table against its `source` URL and the patch notes: `src/meta/metaTargets.ts`, `src/teams/comps.ts` (new Abyss blessings can change which archetypes are top-tier — re-rank `tier`s), `src/damage/profiles.ts`, `src/meta/teammates.ts`.
  4. Add recipes/profiles/comps for new characters.
  5. `npm test && npm run bench` (commit the regenerated `docs/speed-report.md` if it changed).
     Include the explicit note: **team recommendations are per-patch by design** — Abyss blessings, Theater element restrictions and Stygian bosses change every patch, so this runbook (not code) is what keeps them honest, until per-mode modifiers are modelled (see Deferred D2).
- [ ] **Step 2:** In `TeamsView`, make staleness visible — add under the mode fieldset:

```tsx
<p className="text-xs text-muted">
  Curated from KQM guides for patch {getGame(useGame.getState().gameId).patch} —
  Abyss blessings change each patch, so treat these as archetypes, not answers.
</p>
```

(Import `useGame`/`getGame` as `App.tsx` does; simpler: pass nothing and read `genshinAdapter`'s `PATCH` if exported — use whichever the file already has access to with fewer imports.)

- [ ] **Step 3:** Add one line to `CLAUDE.md` under Domain docs: "Per-patch data refresh: `docs/runbooks/patch-refresh.md`."
- [ ] **Step 4:** `npm test -- TeamsView` PASS. **Commit** — `docs: per-patch refresh runbook; surface curation patch in Teams UI`

---

## Workstream D — audit fixes (from the web-design-guidelines / frontend-design / ui-ux-pro-max passes)

Run this workstream AFTER Workstream A (Tasks 6's CSS edits and Task 4's labels are prerequisites for some items). Same branch `feat/ux-overhaul`.

### Task 13: Combobox keyboard fixes (BLOCKER first)

**Files:**

- Modify: `src/components/ui/Combobox.tsx`
- Test: `src/components/ui/Combobox.test.tsx`

The audit's one blocker: the component conditionally renders `<input>` (open) vs `<button>` (closed) at the same position (`Combobox.tsx:96-136`), so React swaps elements and **focus drops to `<body>` after every selection or Escape**. Also: no blur-close, missing `aria-autocomplete`, hardcoded third-gold chevron, label overflow.

- [ ] **Step 1: Failing tests** (append):

```tsx
it('returns focus to the trigger after selecting an option', async () => {
  render(<Combobox … />); // reuse the file's existing fixture props
  await userEvent.click(screen.getByRole('combobox'));
  await userEvent.click(screen.getAllByRole('option')[0]);
  expect(screen.getByRole('combobox')).toHaveFocus();
});
it('closes the listbox when focus leaves the component', async () => {
  render(<><Combobox … /><button>after</button></>);
  await userEvent.click(screen.getByRole('combobox'));
  await userEvent.tab(); // to an option/away
  await userEvent.click(screen.getByRole('button', { name: 'after' }));
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Implement** (smallest fix that passes — do NOT rewrite the component to a single persistent input unless the focus test can't pass otherwise):
  1. Add a `triggerRef` on the closed-state `<button>`; in a `useEffect` keyed on `open` flipping to `false`, call `triggerRef.current?.focus()`.
  2. Add `onBlur` on the container: close when `e.relatedTarget` is outside `containerRef.current` (`!containerRef.current?.contains(e.relatedTarget as Node)`).
  3. Add `aria-autocomplete="list"` to the open-state `<input>`.
  4. Chevron (line ~127): replace `stroke="#e9c46a"` with `stroke="currentColor"` and add `className="text-accent"` + `aria-hidden="true"` to the `<svg>`.
  5. Add `min-w-0 truncate` to the trigger's label `<span>` (line ~121).
- [ ] **Step 3:** `npm test -- Combobox` — PASS. **Commit** — `fix: combobox focus return, blur close, themed chevron`

### Task 14: Landmarks, headings, radiogroup semantics

**Files:**

- Modify: `src/components/App.tsx:269`, `src/components/GapReport.tsx:8`, `src/plan/PlanView.tsx:165-168,186,205`, `src/components/GameSwitcher.tsx:12-42`
- Test: `src/components/App.test.tsx`, existing component tests

- [ ] **Step 1:** `App.tsx`: change the page wrapper `<div className="relative z-10 …">` to `<main>` (same classes), and add as the first child of the page a skip link:

```tsx
<a
  href="#step-load"
  className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface-700 focus:px-4 focus:py-2 focus:text-paper"
>
  Skip to content
</a>
```

- [ ] **Step 2:** Demote nested headings: `GapReport.tsx:8` `<h2>`→`<h3>`; PlanView's three `<h2>`s ("First half —…", "Worth investing in", "What to farm") → `<h3>` (they nest inside the Section's `<h2>`).
- [ ] **Step 3:** `GameSwitcher`: roving tabindex — checked button gets `tabIndex={0}`, others `-1`; `onKeyDown` for ArrowLeft/ArrowRight moves selection (mirror the `onKeys` pattern from Task 8's tablist).
- [ ] **Step 4:** `npm test` for the touched components — PASS (update any heading-role queries). **Commit** — `fix: main landmark, skip link, heading levels, radiogroup arrows`

### Task 15: Async status feedback (aria-busy, live regions, plan progress bar)

**Files:**

- Modify: `src/components/ImportPanel.tsx:141-147`, `src/components/OptimizePanel.tsx:329-336`, `src/plan/PlanView.tsx:132-147`, `src/components/ExplainBuild.tsx:45-56`
- Test: `src/plan/PlanView.test.tsx`

- [ ] **Step 1:** Add `aria-busy={busy}` to ImportPanel's Fetch button and `aria-busy={running}` to OptimizePanel's Optimise button and PlanView's plan button (SampleGear already does this — this closes the inconsistency).
- [ ] **Step 2:** PlanView: wrap the progress in a live region AND give the 8-solve run a visible bar (reuse the track style of `Results.tsx:62-67`). Below the button row:

```tsx
{
  running && (
    <div role="status" aria-live="polite" className="space-y-1">
      <p className="text-xs text-muted">
        Optimising member {progress[0]} of {progress[1]}…
      </p>
      <div
        aria-hidden="true"
        className="h-1.5 overflow-hidden rounded-full bg-white/5"
      >
        <div
          className="h-full rounded-full bg-accent/70 transition-[width]"
          style={{ width: `${(progress[0] / progress[1]) * 100}%` }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 3:** ExplainBuild: wrap the explanation output panel in `aria-live="polite"` (persistent container so the announcement fires when content arrives), wrap the `✨` as `<span aria-hidden="true">✨</span>`.
- [ ] **Step 4:** Also from the audit's nice-to-haves, same commit: `aria-hidden="true"` on Results' decorative explored/pruned bar (`Results.tsx:62-67`); drop the redundant `aria-label="GOOD file"` on the labelled file input (`ImportPanel.tsx:115`); add a visually-hidden `<span className="sr-only"> (opens in new tab)</span>` inside OptimizePanel's external `Source` links (`OptimizePanel.tsx:53-60`).
- [ ] **Step 5:** `npm test -- PlanView` etc. — PASS. **Commit** — `fix: busy states, live regions, plan progress bar`

### Task 16: Theming + consistency polish (all one-liners, one commit)

**Files:**

- Modify: `src/index.css`, `src/components/Results.tsx:49`, `src/roster/buildScore.ts`, `src/roster/RosterView.tsx:12-16`, `src/teams/TeamsView.tsx:27-31`, `src/components/BuildCard.tsx:98,140`, `src/components/OptimizePanel.tsx:51`, `src/components/ImportPanel.tsx:103,124`

- [ ] **Step 1: Per-game select chevron** — replace the single `select.field` `background-image` (`index.css:123`) with two `[data-game]`-scoped rules (gold `%23f2b64c` for genshin, teal `%234cd6c0` for wuwa — same SVG data-URI, different `stroke`). This fixes the theming break where WuWa mode shows a gold arrow.
- [ ] **Step 2: One recessed-well class** — add `.well { @apply rounded-lg border border-white/5 bg-surface-900/40; }` to `index.css` and swap the drifting `bg-surface-900/30|40` wells in BuildCard (98, 140), OptimizePanel (51), ImportPanel (103, 124) onto it. (Also use `.well` in Task 8's Gear/Teams list items.)
- [ ] **Step 3: De-duplicate `BAND_STYLE`** — export it from `src/roster/buildScore.ts` (next to `band`), delete the identical local copies in `RosterView.tsx:12-16` and `TeamsView.tsx:27-31`.
- [ ] **Step 4: Tracking normalisation** — `Results.tsx:49` `tracking-[0.14em]` → `tracking-[0.18em]` (`.eyebrow`'s `0.4em` stays — it's the intentionally wider page-level variant).
- [ ] **Step 5: Focus + transition hygiene** — in `index.css`: `.field`'s `focus:` ring/border variants → `focus-visible:`; narrow `@apply transition` to what each rule actually animates (`transition-colors` on `.field`/`.btn-ghost`; `transition-[transform,filter]` on `.btn-primary` which animates translate + brightness).
- [ ] **Step 6:** `npm test && npm run lint` — PASS. Visual spot-check both games' accents via the GameSwitcher in `npm run dev`. **Commit** — `fix: per-game chevrons, well class, band-style dedupe, focus-visible`

### Task 17: Form validation (ArtifactForm + UID)

**Files:**

- Modify: `src/components/ArtifactForm.tsx:23-26,103-121`, `src/components/ImportPanel.tsx:131-149`
- Test: `src/components/ArtifactForm.test.tsx`, `src/components/ImportPanel.test.tsx`

- [ ] **Step 1: Failing test** (ArtifactForm): blur the level field with `25` typed → an error message appears, and the input's `aria-describedby` points at it.
- [ ] **Step 2: Implement:**
  1. Level input (`ArtifactForm.tsx:103-112`): add `min={0} max={20}` (verify the real bounds against `src/state/artifactValidation.ts` — use whatever `validateArtifactDraft` enforces) and helper text under the label stating the range.
  2. On blur of the level input, run the existing `validateArtifactDraft` and, if the failure concerns level, render the message in a `<p id="level-error" role="alert">` adjacent to the field with `aria-describedby="level-error"` on the input. Keep the existing submit-time banner for everything else — do not build a full per-field validation framework (ponytail: one field gets inline treatment because it's the one users actually fumble; extend if evidence says otherwise).
  3. UID (`ImportPanel.tsx`): gate Fetch on format, not just presence — `const uidOk = /^\d{9,10}$/.test(uid.trim());`, `disabled={busy || !uidOk}`, and when `uid && !uidOk` show `<p className="text-xs text-rose">A UID is 9–10 digits.</p>` (Task 5's empty-state hint stays for the empty case).
- [ ] **Step 3:** `npm test -- ArtifactForm ImportPanel` — PASS. **Commit** — `fix: inline level/UID validation with linked errors`

### Task 18: Score visualisation (bullet bars + roster bars)

**Files:**

- Modify: `src/components/BuildCard.tsx:97-121`, `src/roster/RosterView.tsx:36-59`, `src/teams/TeamsView.tsx:63-82`
- Test: `src/components/BuildCard.test.tsx`, `src/roster/RosterView.test.tsx`

- [ ] **Step 1:** BuildCard grade panel: keep each stat's text line (`ATK 700/900 (78%)` stays — text is primary), add under each a 2px bullet track:

```tsx
<div
  aria-hidden="true"
  className="mt-0.5 h-0.5 overflow-hidden rounded-full bg-white/5"
>
  <div
    className={`h-full rounded-full ${s.pct >= 1 ? 'bg-jade/70' : 'bg-accent/60'}`}
    style={{ width: `${Math.min(s.pct, 1) * 100}%` }}
  />
</div>
```

(Change the wrapping `<p className="flex flex-wrap gap-x-3">` of `grade.perStat` into a small grid so each stat owns a block with its bar.) Also per the frontend-design note: prefix met targets with a text glyph (`✓`) so "met" isn't hue-only when the bar is glanced without the numbers.

- [ ] **Step 2:** RosterView rows: behind/beside the score number, a thin proportional bar (`score.total / 100`), same track style, `aria-hidden="true"` (the number is the accessible value).
- [ ] **Step 3:** TeamsView member rows: add the numeric score next to the band chip (`<span className="font-mono text-xs text-muted">{m.buildScore.toFixed(0)}</span>`) so the same score reads the same in both sections.
- [ ] **Step 4:** `npm test -- BuildCard RosterView TeamsView` — PASS. Full gates: `npm test && npm run lint && npm run typecheck`. **Commit** — `feat: bullet bars for stat targets, roster score bars`

---

## Deferred — needs its own brainstorm → spec → plan (do NOT start here)

**D1. Damage engine v3 — ranking tables (weapons / sets incl. 2pc+2pc / main stats / constellations).** The IWinToLose-style tables. Research and recommended phasing are in `docs/research/2026-08-20-rotation-dps-and-ranking-tables.md`: (1) complete the KQM formula (DEF shred, reaction bonus %, additive reactions, real talent levels from the roster import), (2) personal weapon-ranking table, (3) set/main-stat tables, (4) team-DPS rotations. Phases 2–3 would populate a fifth drawer tab ("Rankings"). This also addresses the mixed-set complaint at its root: once conditional 4pc effects are modelled as data records (Genshin Optimizer's sheet pattern), full sets stop losing to stat-stick mixes they shouldn't lose to.

**D2. Per-cycle Abyss data + Imaginarium Theater + Stygian Onslaught modes.** Decisions already made by the owner (2026-08-20): the Abyss planner targets **floor 12 only** — plan/recommend for the floor-12 clear, not floors 9–11. Data research is done: `docs/research/2026-08-20-abyss-schedule-data-sources.md`. Key facts for the spec: **floor 12 has no Ley Line Disorder in current game versions** (datamine shows only a hidden HP-scaling entity; disorders live on floors 9–11) — the per-cycle signals that should bias floor-12 team choice are the monthly **Blessing** and the **chamber enemy lineups** (element gates/shields/bosses). Pipeline per the research doc: a build-time script snapshots `TowerScheduleExcelConfigData` + `DungeonLevelEntityConfigData` + TextMap from a pinned Dimbreath `AnimeGameData` GitLab commit for schedule + blessing text (genshin-db has no tower data, so the existing snapshot can't cover this); floor-12 chamber lineups are hand-curated per cycle from the Fandom dated wiki page (they're not in clean JSON anywhere); the recommender consumes a small human-tagged signal (`favoredElements`/`favoredArchetypes` per cycle), not parsed buff text. Scope for the spec: emit `abyss.generated.json`, add the per-cycle curation step to the patch-refresh runbook (Task 12), bias `recommendAbyss` scoring by the cycle signal, and label the Plan section with the cycle it was computed for. Theater/Stygian follow the same shape (per-patch modifiers as curated data + a mode recommender) once Abyss proves the loop. The spec must still decide how much monthly curation the maintainer will sustain — that constraint sizes everything.

**D3. User-facing help/FAQ page** ("what is a GOOD file", "what do these scores mean") — cheap once Tasks 3–4 land; fold into D1's UI work or do standalone.

## Self-review notes

- Spec coverage: scroll wall (T1, T2), input visibility (T5, T6), error message (T3), changing metric (T4 incl. hero + grades), drawer + wuwa-style tabs + mobile (T7–T9), docs/README (T10–T11), per-patch teams (T12 + D2), damage-calc research (research doc + D1). Set-bonus complaint: answered by research finding 5 (not a bug) + D1 (the real fix).
- Audit coverage (Workstream D): every blocker/should-fix from the web-design-guidelines pass is in T13–T15 (Combobox focus, blur-close, landmarks, headings, radiogroup arrows, live regions, aria-busy) with the reduced-motion scroll fix folded into T2 and touch-action into T6; frontend-design's exact-edit list is T16 (chevrons, `.well`, BAND_STYLE, tracking) plus art direction inlined into T1/T2/T7/T8; ui-ux-pro-max's top-5 map to T4-step-5 (jargon), T17 (form validation), T15 (plan progress), T18 (bullet/roster bars). Audit nice-to-haves NOT taken: `:focus-visible`/transition narrowing are in T16 but IntersectionObserver active-chip tracking (T2) is optional, and the Combobox single-persistent-input rewrite is explicitly avoided in favour of the minimal focus fix.
- Types cross-checked against source: `MetaTarget.mains` (not `mainStatLocks` — that's the constraints shape), `SetRequirement` union, `RosterEntry` fields, `Objective` being an open union (hence `objectiveHint` is a function, not a Record).
- Known verify-points are marked inline in Task 8 (adapter weapon lookup, damage-profile import) rather than left as silent assumptions.
