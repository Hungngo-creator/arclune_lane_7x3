# Combat Kernel Phase B backlog

Phase A intentionally stops at the compatibility boundary. The following exact
bypasses remain:

1. **Status DoT and lethal:** `src/statuses.ts` — `applyMitigatedHit`,
   `applyStatusDamage`, `Statuses.absorbShield`, `Statuses.afterDamage`, and lethal
   branches in status ticking still calculate/commit directly. Add status source
   iid capture, packet policy, and death gateway.
2. **Tag-dispatch direct damage:** `src/combat/tag-dispatch.ts` —
   `applyDamageLikeEffect` calls `applyDamage` for nonstandard damage-like effects.
   Classify each as true damage versus typed non-damage HP mutation.
3. **Passive direct HP/alive mutation:** `src/passives.ts` — `compileHealLowest`,
   `compileDamageAfter`, `compileRegen`, and `compileUndying` mutate HP/alive without
   typed mutations, heal policy, or death dedupe.
4. **Reflect mini-pipeline:** `src/combat.ts` — `applyResolvedReflectDamage` and
   `resolveReflectDamage`; `src/statuses.ts` — `applyMitigatedHit` and
   `Statuses.afterDamage`. Replace local ping-pong guards with reflected packets
   and the trigger ledger.
5. **Active HP cost/heal:** `src/combat/perform-active-skill.ts` —
   `applyHpCostWithState`, Blood Avatar healing/cost branches, and generic HP-cost
   assignment need `HpMutation` transactions and the canonical heal gateway.
6. **Environment damage:** `src/modes/pve/session-runtime-impl.ts` —
   `applyEnvironmentalDamage` remains a direct low-level commit.
7. **Lethal/death paths:** `src/combat.ts` — `dealAbilityDamage` lethal hooks;
   `src/statuses.ts` — status lethal branches; `src/combat/chap-minh-runtime.ts` —
   `applyLinkedDamage`; `src/modes/pve/session-runtime-impl.ts` —
   `applyEnvironmentalDamage` and direct creep/leader death assignments. Unify
   HP_ZERO, prevention, confirmation, attribution, kill credit, revive, removal,
   and battle-end ordering.

Also migrate legacy compatibility action ids to scheduler-owned identities,
attach source iid when statuses are created, route passive/tag/DoT/counter procs
through the ledger, add resource transactions, and batch AoE. Full replay,
Luân Hồi, progression, equipment, and kit-wide rewrites remain separate work.
