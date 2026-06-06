import type { GameAdapter } from '../game/GameAdapter';
import type { OptimizeContext, OptimizeRequest } from '../game/types';

export function buildContext(adapter: GameAdapter, req: OptimizeRequest): OptimizeContext {
  const base = adapter.baseStats(req.characterKey, req.weaponKey, req.buildLevel);
  const setBonuses: OptimizeContext['setBonuses'] = {};
  for (const s of adapter.sets()) {
    setBonuses[s.key] = { two: s.twoPiece, four: s.fourPiece };
  }
  return { base, setBonuses };
}
