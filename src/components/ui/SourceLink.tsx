import type { ReactNode } from 'react';

/** An outbound citation. Bakes in the new-tab attributes and the screen-reader
 *  warning that goes with them, so no caller can ship a link that opens a tab
 *  without saying so. */
export function SourceLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a className={className} href={href} target="_blank" rel="noreferrer">
      {children}
      <span className="sr-only"> (opens in new tab)</span>
    </a>
  );
}
