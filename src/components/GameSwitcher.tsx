import { useGame } from '../state/game';
import { GAME_LIST } from '../game/registry';

/** Segmented control for the active game. Live games are selectable normally;
 *  coming-soon games are still selectable (they render their own panel) but
 *  carry a small marker so the state is honest, not hidden. */
export function GameSwitcher() {
  const gameId = useGame((s) => s.gameId);
  const setGameId = useGame((s) => s.setGameId);

  return (
    <div
      role="radiogroup"
      aria-label="Game"
      className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-surface-900/60 p-1"
    >
      {GAME_LIST.map((g) => {
        const active = g.id === gameId;
        return (
          <button
            key={g.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setGameId(g.id)}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition ${
              active
                ? 'bg-accent/15 text-accent-bright'
                : 'text-muted hover:text-paper'
            }`}
          >
            {g.name}
            {g.availability === 'coming-soon' && (
              <span className="rounded-full border border-flux/30 px-1.5 py-0.5 font-mono text-[0.6rem] font-normal uppercase tracking-wide text-flux-bright">
                Soon
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
