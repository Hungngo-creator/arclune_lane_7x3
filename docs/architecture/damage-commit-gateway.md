# Damage commit gateway (Kernel v1 B1)

`resolveDamageBatch(command)` is pure: it receives action/source identities,
ordered packets, target and shield snapshots, explicit special mitigation, and
shared-HP policy. It neither retains nor mutates tokens, statuses, logs, or the
session. Physical and will components remain separate packets and floor once at
each packet output.

`commitDamageBatch(game, resolution, targets)` is the standard-damage mutation
boundary. It consumes exactly the resolved shield allocation before HP. True
damage is shielded unless `pierceShield` is true; law bypass is represented by
that flag. Snapshot/commit disagreement throws rather than absorbing twice.

Shared HP snapshots weights, caps and HP first, resolves every allocation, then
commits every member. Only afterward does the compatibility layer invoke lethal
callbacks in slot/iid order. The gateway emits JSON-compatible
`DAMAGE_BATCH_RESOLVED` data with the action, packets, source attribution,
shield/HP allocations, prevention and zero flags. Phase C will replace the
legacy lethal boundary; B1 deliberately does not implement death confirmation.

