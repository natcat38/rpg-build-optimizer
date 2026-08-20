import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
});
