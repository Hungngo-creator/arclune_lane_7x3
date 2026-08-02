# Combat identity (Kernel v1 B1)

Identity is action-owned and battle-scoped. A **definition id** selects catalog
data; it is not a runtime identity. `iid` identifies one combat object.
`trueSelfId` identifies an HP-bearing, non-summon person across lives, while
`lifeSerial` identifies the current revived life. Summons have an `iid` but no
independent true self; attribution names their owner/controller and the owner's
true self.

Every natural action allocates an `actionId` and new `chainId` from the session's
`CombatSequenceState`. A linked action gets its own `actionId`, retains the
originating `chainId`, and records the direct `parentActionId`. Components share
those ids. `packetId` is action-local and `packetSerial` is stable. Canonical
events use a monotonically increasing session `eventSerial`, never wall-clock
time. New battles initialize all three counters to zero.

The module-global `legacy-*` id generator remains confined to the explicitly
named legacy adapter. Production `dealAbilityDamage` never calls it.

