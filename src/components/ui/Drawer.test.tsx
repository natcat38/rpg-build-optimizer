import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppDrawer } from './Drawer';

describe('AppDrawer', () => {
  it('renders children in a dialog when open and closes via the close button', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <AppDrawer open onClose={onClose} title="Ayaka">
        <p>body</p>
      </AppDrawer>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('body')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('renders nothing when closed', () => {
    render(
      <AppDrawer open={false} onClose={() => {}} title="Ayaka">
        <p>body</p>
      </AppDrawer>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  /** Mimics RosterView: a row button opens the drawer via `onOpen`, and the
   *  drawer's `open` prop is driven by the parent's own state (as it is in
   *  the real app), not left permanently `open`. */
  function Harness() {
    const [open, setOpen] = useState(false);
    return (
      <div>
        <button type="button" onClick={() => setOpen(true)}>
          Open Ayaka
        </button>
        <AppDrawer open={open} onClose={() => setOpen(false)} title="Ayaka">
          <p>body</p>
        </AppDrawer>
      </div>
    );
  }

  it('returns focus to the triggering row button after closing via the close control', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const trigger = screen.getByRole('button', { name: /open ayaka/i });
    await user.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /close/i }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger);
    });
  });

  it('returns focus to the triggering row button after closing via Escape', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const trigger = screen.getByRole('button', { name: /open ayaka/i });
    await user.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger);
    });
  });
});
