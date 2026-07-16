import type { OptimizeContext, OptimizeRequest } from '../game/types';
import { genshinAdapter } from '../game/genshin/adapter';

export function buildContext(req: OptimizeRequest): OptimizeContext {
  const base = genshinAdapter.baseStats(
    req.characterKey,
    req.weaponKey,
    req.buildLevel,
  );
  const setBonuses: OptimizeContext['setBonuses'] = {};
  for (const s of genshinAdapter.sets()) {
    setBonuses[s.key] = { two: s.twoPiece, four: s.fourPiece };
  }
  return { base, setBonuses };
}
