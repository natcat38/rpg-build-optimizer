import type { OptimizeContext, OptimizeRequest } from '../game/types';
import { genshinAdapter } from '../game/genshin/adapter';
import { getDamageProfile } from '../damage/profiles';
import { DEFAULT_ENEMY } from '../damage/types';

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
  const ctx: OptimizeContext = { base, setBonuses };
  if (req.objective === 'avg_damage') {
    const profile = getDamageProfile(req.characterKey);
    // Fail loud, like adapter.baseStats does for an unknown character — a
    // silently stat-only "damage" ranking would be worse than an error.
    if (!profile)
      throw new Error(`Unknown damage profile: ${req.characterKey}`);
    ctx.damage = {
      profile,
      enemy: DEFAULT_ENEMY,
      charLevel: req.buildLevel,
    };
  }
  return ctx;
}
