# Arclune Combat Kernel v1 — Phase A

Phase A establishes serializable contracts and a pure packet resolver. It does
not replace death, resources, AoE batching, status ticks, passives, or replay.

## Canonical vocabulary and calculation

Damage types are `physical`, `will`, `true`, and `reflected`. `arcane` is accepted
only as a read-time alias for `will`. There is no `mixed` packet: a mixed action
emits one physical and one will component packet.

HP mutations are explicitly one of `damage`, `healing`, `hp-cost`, `self-damage`,
`sacrifice`, or `max-hp-mutation`. A falling HP number does not identify its kind.

ARM and RES are ratings. Physical uses ARM and will uses RES. For rating `d`:

```text
d >= 0: multiplier = 100 / (100 + d)
d <  0: multiplier = 2 - 100 / (100 - d)
```

Flat defense, percent defense modification, flat penetration, percent
penetration, and generic damage reduction are separate inputs. Effective defense
is `(rating + flatDefense) * (1 + percentDefense) * (1 - percentPen) - flatPen`.
Ratings are not clamped to `0..1`, and negative defense increases damage.

The resolver retains full precision and floors exactly once at the packet output
boundary. It imposes no minimum damage. The compatibility path therefore can
differ from the old `calculateFinalDamage`, which floored after counter, defense,
and reduction multipliers. The packet golden named `multiple modifiers round
once` records the intentional result.

## Shield and special types

The compatibility shield contract snapshots `shieldBefore` and resolves
`shieldDamage` and `shieldAfter` without mutation. True damage ignores ARM, RES,
generic reduction, and normal incoming modifiers, but shields absorb it unless
`pierceShield` is set. Reflected damage ignores ARM/RES, can use its dedicated
reduction, and is shielded. A reflected packet is metadata-only in Phase A and
does not itself create reflect, lifesteal, or counter reactions.

`hpDamage` is capped by snapshot current HP. Damage beyond it is
`overkillDamage`; later lifesteal and thresholds must consume `hpDamage`, never
declared damage or overkill.

## Identity, attribution, and proc ledger

`ActionIdentity` supplies action/chain/parent ids, kind, and serial.
`SourceAttribution` independently records the immediate combat iid, controller
iid, credit true-self definition id, owner iid, and environment id. For a summon,
the summon is immediate source while its summoner is controller/owner and supplies
the credited true self. Legacy statuses may still expose `sourceUnitId`; the
compatibility helper warns in development when `sourceIid` is absent.

The serializable per-chain trigger ledger stores tuple keys
`(actionId, procKey, sourceIid, targetIid)`. A tuple may be marked once. Reaction
depth 12 is allowed by default; greater depth returns
`max-reaction-depth-exceeded`. Phase A does not yet route legacy passive hooks into
the ledger.

## Contract example

```json
{
  "packetId": "p-1", "actionId": "a-1", "chainId": "c-1",
  "source": {"immediateSourceIid": 9, "controllerIid": 4,
    "creditTrueSelfId": "summoner", "ownerIid": 4,
    "environmentSourceId": null},
  "targetIid": 12, "damageType": "will", "declaredDamage": 500,
  "tags": ["skill"], "isDot": false, "isReflect": false,
  "isFollowup": false, "isCounter": false, "reactionDepth": 0,
  "pierceShield": false
}
```

All kernel contracts contain only JSON-compatible scalar values, arrays, and
plain records. They never contain callbacks, `Map`, `WeakMap`, `Date`, or mutable
`UnitToken` references. Development invariants validate finite/non-negative
damage, ids, reaction depth, shield allocation, HP/overkill allocation, and scalar
source attribution; production assertions are no-ops.

## Phase A adapter boundary

`dealAbilityDamage` builds canonical component packet(s), calls the pure resolver,
then enters the existing Chap Minh/shield/shared-HP/death/reaction commit path.
Basic attacks, the four standard active-skill call sites, and the standard damage
tag branch share this gateway. `applyDamage` is a deprecated low-level legacy
primitive; its current callers are frozen by a static test pending Phase B.

