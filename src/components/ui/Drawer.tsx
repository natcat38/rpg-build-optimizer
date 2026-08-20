/**
 * App-wide detail drawer: slides from the left on desktop, from the bottom on
 * mobile. vaul supplies the focus trap, scroll lock, esc-close and aria-modal.
 * @packageDocumentation
 */
import { useEffect, useState, type ReactNode } from 'react';
import { Drawer as Vaul } from 'vaul';

const DESKTOP = '(min-width: 768px)';

function useIsDesktop() {
  const [desktop, setDesktop] = useState(
    () => window.matchMedia(DESKTOP).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP);
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
              ? 'fixed inset-y-0 left-0 z-50 w-full max-w-md overflow-y-auto border-l-2 border-r border-l-accent/50 border-r-white/10 bg-surface-700/60 p-6 backdrop-blur-md'
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
            <button className="btn-ghost" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>
          {children}
        </Vaul.Content>
      </Vaul.Portal>
    </Vaul.Root>
  );
}
