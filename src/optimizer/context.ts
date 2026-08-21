import type { OptimizeContext, OptimizeRequest, StatVec } from '../game/types';
import { genshinAdapter } from '../game/genshin/adapter';
import { getDamageProfile } from '../damage/profiles';
import { fourPieceVector } from '../damage/setBonuses';
import { DEFAULT_ENEMY } from '../damage/types';
import type { DamageContext } from '../damage/types';

export function buildContext(req: OptimizeRequest): OptimizeContext {
  const base = genshinAdapter.baseStats(
    req.characterKey,
    req.weaponKey,
    req.buildLevel,
  );

  let damage: DamageContext | undefined;
  if (req.objective === 'avg_damage') {
    const profile = getDamageProfile(req.characterKey);
    // Fail loud, like adapter.baseStats does for an unknown character — a
    // silently stat-only "damage" ranking would be worse than an error.
    if (!profile)
      throw new Error(`Unknown damage profile: ${req.characterKey}`);
    damage = { profile, enemy: DEFAULT_ENEMY, charLevel: req.buildLevel };
  }

  // 4pc bonuses come from the curated table, not the snapshot (ADR-0020): the
  // frozen dataset carries no `fourPiece` at all, because a 4pc effect is prose
  // until someone commits to an uptime assumption. Resolved once, here, so the
  // pruning bound and the leaf score read the identical vector (ADR-0004).
  const setBonuses: OptimizeContext['setBonuses'] = {};
  const weaponType = genshinAdapter.weapon(req.weaponKey)?.type;
  for (const s of genshinAdapter.sets()) {
    const four: StatVec | undefined =
      fourPieceVector(s.key, { weaponType, damage, base }) ?? s.fourPiece;
    setBonuses[s.key] = { two: s.twoPiece, four };
  }

  const ctx: OptimizeContext = { base, setBonuses };
  if (damage) ctx.damage = damage;
  return ctx;
}
