# 0012. Collapse the GameAdapter seam to a concrete adapter

- Status: Accepted
- Date: 2026-06-26
- Supersedes: [ADR-0008](0008-gameadapter-seam-for-multi-game.md)

## Context

[ADR-0008](0008-gameadapter-seam-for-multi-game.md) introduced a `GameAdapter`
interface so a second game (Wuthering Waves was the candidate) could slot in
without touching the optimiser, UI, or share layer. The interface was threaded
as a parameter through `optimize`, `buildContext`, `parseGOOD`, and
`fetchUidArtifacts`.

In practice the seam never earned its keep:

- There is exactly one implementation, `genshinAdapter`. No second-game dataset
  or adapter was ever built.
- Production code always used the default; no caller passed a non-default adapter.
- The interface's `id` field was unused, and `slots` was read only by a test.
- The "proven in tests" second-game stub was only a spread of `genshinAdapter`
  overriding one method — it demonstrated parameter passing, not portability.

The interface was speculative flexibility (YAGNI). It added an indirection that
every reader had to follow to reach the one concrete object.

## Decision

Remove the `GameAdapter` interface. `genshinAdapter` is now a plain concrete
object that owns the Genshin data (characters, weapons, sets, base stats, main-stat
values) and the universal game baselines from [ADR-0009](0009-adapter-owns-universal-game-baselines.md).
The optimiser, import, and share modules import `genshinAdapter` directly; the
threaded `adapter` parameters are gone. The `CharacterMeta` / `WeaponMeta` /
`ArtifactSetMeta` shape types live with the concrete adapter.

## Consequences

- Less code, one fewer indirection; readers reach the data directly.
- ADR-0009 still holds: the concrete adapter owns the 100% base ER, not the
  reference snapshot. Only the _interface_ is gone, not that ownership.
- Adding a second game later is no longer a drop-in: it would mean
  re-introducing an abstraction over `genshinAdapter`. That is an explicit,
  deferred cost — paid only if a second game is actually built, not before.
