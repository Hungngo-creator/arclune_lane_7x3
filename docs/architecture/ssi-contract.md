# SSI turn-order contract

SSI (`interleaved_by_position`) schedules **natural turns**. A natural turn is the
single opportunity granted by the scheduler to one live combat instance. Counters,
follow-ups and other forced actions belong to the action that created them; they do
not call the natural scheduler and are reported with an explicit `actionKind`.

## Identity and side passes

Every runtime token—leader, unit, summon, creep or clone—must have a unique `iid`
for its lifetime. A unit definition `id` is not combat identity. Reviving the same
instance retains its `iid`; creating a new instance allocates a new one.

Each side owns a **side pass**, a cursor (`lastPos`) and `actedNatural`. SSI alternates
sides while each cursor independently scans increasing slots. `actedNatural` records
combat instances, not slots, so moving an actor cannot grant a second natural turn.
When the tail is exhausted that side wraps to slot 1, clears its pass record and
increments its wrap count. `cycle` is the lower completed-wrap count of both sides.
If one side has no actor, scanning the other side must continue rather than deadlock.

## Spawn, movement and death

* A summon placed in a slot **ahead** of its side cursor may act in the current pass.
* A summon placed behind the cursor, including the slot just vacated by the actor,
  waits for the next side pass.
* A queued summon cannot replace an occupied slot. The occupant is selected and the
  queue remains pending until normal collision handling can resolve it.
* Movement changes the slot scanned, never combat identity or the acted record.
* Dead instances are skipped. A same-`iid` resurrection remains acted in that pass;
  a new-`iid` resurrection follows the normal ahead/behind spawn rule.

## CC skips and forced chains

An SSI actor blocked by crowd control still owns and consumes its natural turn:
`TURN_START` and `TURN_END` each occur once, turn-ticked status duration advances
once, no skill/basic action is cast, and SSI proceeds to the opposite side. This
consumption rule is scoped to SSI; sequential modes retain their existing skip
semantics.

Forced actions, counters and follow-ups are separate action events. They must not
modify `lastPos`, `nextSide`, `wrapCount`, `cycle`, or `actedNatural`, and cannot
create another natural turn. UI rails use `actionKind`, never a missing slot, and
clear when the chain/turn ends.

