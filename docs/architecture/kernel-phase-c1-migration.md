# Kernel Phase C1 migration

## B2 scaffold closed in C1

The earlier kernel had target-local pure damage resolution, action stacks, healing/HP mutation types, and identity helpers, but `dealAbilityDamage` still minted actions and local packet indexes. Production basic and active/Ultimate boundaries now open action execution contexts; ability packets consume their context serial. Follow-up basics use linked identities.

C1 adds action-wide prevalidation/commit, canonical life states, HP-zero candidates, deterministic death waves, serializable death records, true-self kill records, and policy-explicit immediate revive. HP mutation no longer calls the legacy damage primitive.

## Compatibility and numerical behavior

Mitigation, ARM/RES, shield allocation, and shared-HP arithmetic are unchanged. The legacy detached adapter remains for runtime hooks/tag paths that are not yet action-hosted; it is explicit and named rather than silently minting identity inside `dealAbilityDamage`.

## Phase C2 backlog

C2 must migrate remaining DoT, reflect, tag, Chap Minh and environment call sites to action commands; route all old lethal/onDeath hooks through the coordinator; integrate batched leader battle end and SSI reaction draining; finish spawn-kind metadata auditing; add the serializable delayed-revive queue/scheduler; and remove the detached compatibility adapter. Delayed revive, Reincarnation, Quang Anh Chi Ha, and concrete Axiom behavior are deliberately excluded.

