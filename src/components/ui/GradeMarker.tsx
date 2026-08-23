import { GRADE_TONE } from '../../labels';
import type { Grade } from '../../meta/grade';
import { Marker } from './Marker';

/** A build's grade letter as a marker. A bare letter in a role-less span is
 *  not a name a screen reader can make anything of, and `title` alone is
 *  neither the name nor reachable without a mouse — so role="img" +
 *  aria-label carry the whole sentence, `title` stays the sighted reader's
 *  tooltip, and every view that shows a grade says the same thing. */
export function GradeMarker({ grade }: { grade: Grade }) {
  const label = `Grade ${grade} — how close this build is to endgame stat targets`;
  return (
    <Marker
      tone={GRADE_TONE[grade]}
      role="img"
      aria-label={label}
      title={label}
    >
      {grade}
    </Marker>
  );
}
