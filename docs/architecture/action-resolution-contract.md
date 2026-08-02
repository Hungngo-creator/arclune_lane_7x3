# Action resolution contract (C1)

`resolveAction` snapshots and resolves every target-local batch without mutation. `commitActionResolution` prevalidates every HP, max-HP, life serial, and shield snapshot before its first write. It then commits all shields and HP, produces `ActionTargetAggregate` values in command target order, collects `HP_ZERO`, and only then emits `ACTION_COMMITTED`.

A stale target aborts before mutation and therefore cannot consume shield or publish a success event. Shared HP remains an allocation inside a target-local batch. Packet identity comes from the enclosing `ActionExecutionContext` and is monotonically increasing across hits, components, and targets.
