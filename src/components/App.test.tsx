import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from './App';
import { useInventory } from '../state/inventory';

describe('App shell', () => {
  beforeEach(() => {
    useInventory.getState().clear();
    window.history.pushState({}, '', '/');
  });

  it('shows the empty-state import choices on first load', () => {
    render(<App />);
    expect(screen.getByText(/Upload GOOD export/i)).toBeInTheDocument();
    expect(screen.getByText(/Import by UID/i)).toBeInTheDocument();
  });

  it('shows a friendly fallback for an unreadable shared link', () => {
    window.history.pushState({}, '', '/?b=garbage!!');
    render(<App />);
    expect(
      screen.getByText(/This shared build couldn't be read/i),
    ).toBeInTheDocument();
    window.history.pushState({}, '', '/');
  });
});
