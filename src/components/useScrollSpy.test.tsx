import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { useScrollSpy } from './useScrollSpy';

function Harness({ ids }: { ids: string[] }) {
  const active = useScrollSpy(ids);
  return <p data-testid="active">{active ?? 'none'}</p>;
}

function section(id: string, top: number) {
  const el = document.createElement('section');
  el.id = id;
  el.getBoundingClientRect = () => ({ top }) as DOMRect;
  document.body.appendChild(el);
  return el;
}

const scrolled = () =>
  act(async () => {
    window.dispatchEvent(new Event('scroll'));
    await new Promise((r) => requestAnimationFrame(() => r(null)));
  });

describe('useScrollSpy', () => {
  it('picks the lowest section whose top is above the line, wherever it sits in the id list', async () => {
    // Two panes: DOM order is not the id order, so "last in the list" would
    // be wrong. Only the section tops decide.
    const a = section('sec-a', -400);
    const b = section('sec-b', 120);
    const c = section('sec-c', 900);
    try {
      render(<Harness ids={['sec-a', 'sec-c', 'sec-b']} />);
      expect(screen.getByTestId('active')).toHaveTextContent('sec-b');

      c.getBoundingClientRect = () => ({ top: 200 }) as DOMRect;
      b.getBoundingClientRect = () => ({ top: -300 }) as DOMRect;
      await scrolled();
      expect(screen.getByTestId('active')).toHaveTextContent('sec-c');
    } finally {
      for (const el of [a, b, c]) document.body.removeChild(el);
    }
  });

  it('has no answer while every section is still below the line', () => {
    const a = section('sec-a', 800);
    try {
      render(<Harness ids={['sec-a']} />);
      expect(screen.getByTestId('active')).toHaveTextContent('none');
    } finally {
      document.body.removeChild(a);
    }
  });

  it('does nothing when no ids resolve to an element in the DOM', () => {
    render(<Harness ids={['does-not-exist']} />);
    expect(screen.getByTestId('active')).toHaveTextContent('none');
  });
});
