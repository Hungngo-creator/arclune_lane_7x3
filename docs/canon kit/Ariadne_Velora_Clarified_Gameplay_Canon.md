# ARIADNE VELORA — CLARIFIED GAMEPLAY CANON
## Gameplay logic before Tag / Primitive / Contract normalization

**Character:** Ariadne Velora  
**Source:** Ariadne  
**Status:** Clarified Gameplay Canon — ready for semantic normalization  
**Primary focus:** Turn-based mode. Chess/Monopoly may reuse grid-relative logic later, but are not normalized here.  
**Important:** This document describes **what the kit does**. It does not yet assign Functional Tags, Primitives, Contract IDs, or Kernel implementation.

---

# 0. PURPOSE

This file resolves the gameplay ambiguities in Ariadne Velora's original prose before architecture mapping.

Required workflow after this file:

```text
Original Kit
→ Clarified Gameplay Canon
→ Terminology mapping
→ Tag audit
→ Ability Schema normalization
→ Primitive composition
→ Contract mapping
→ Kernel dry-run / Stress Test
```

Do not skip directly from raw prose to Tags.

---

# 1. FIELD / PRESENCE BASICS

## 1.1 Battlefield presence

“On the field” means the Combat Entity is **active-present in the relevant Combat Instance**.

This is gameplay presence, not screen visibility.

A Character may be:
- in Deck but not on Battlefield;
- active on Main Battlefield;
- active in Arena;
- temporarily absent;
- dead / waiting;
- in Reincarnation;
- removed;
- returned to Deck by a special mechanic.

These states are not interchangeable.

## 1.2 ENTER_FIELD / LEAVE_FIELD

`ENTER_FIELD` means an entity transitions from not active-present in Combat Instance X to active-present in X.

`LEAVE_FIELD` means an entity transitions from active-present in Combat Instance X to not active-present in X.

`DEATH_CONFIRMED` does **not automatically equal** `LEAVE_FIELD`.

If a special kit causes DEATH_CONFIRMED while the relevant True Self/entity remains active-present on the battlefield, then it has not left that field merely because death was confirmed.

If a DEATH_CONFIRMED mechanic sends the Character back to Deck, that does count as leaving the current field because active presence ends.

The semantic test is always:

> Is the relevant Combat Entity still active-present in this Combat Instance?

---

# 2. DECK DEPLOYMENT / RAGE

## 2.1 Deployment from Deck

Deployment is a specific transition:

```text
DECK
→ successful deployment transaction
→ BATTLEFIELD
```

A roster Character deployed from Deck is not automatically a `SUMMON`.

Deployment Cost uses the Deployment Cost Bar, not AE and not Rage.

## 2.2 Global Deck-deployment Rage rule

When a Character is successfully deployed **from Deck to Battlefield**:

> that Character enters with full Rage.

This rule is specific to Deck deployment.

It does not automatically apply to:
- Revive;
- Return from Arena;
- Return from Temporary Absence;
- Rebirth;
- other field-entry cases.

“Enter with full Rage” and “cast Ultimate” are separate semantics.

Full Rage does not by itself guarantee that an Ultimate can legally resolve.

For Ariadne's intended deployment sequence, if her Ultimate is legal/available when her first Natural Action begins, she uses it in that Natural Action.

---

# 3. GRID ORIENTATION

All relative directions are **side-relative**.

The two sides mirror one another.

For a Character:
- `front` = toward the enemy side;
- `back` = toward its own rear line;
- `left` / `right` = relative to that side's facing orientation.

Do not use one absolute screen-direction convention for both teams.

---

# 4. PASSIVE — POSITION MARK

## 4.1 Mark creation on recognized field entry

Whenever Ariadne enters a Combat Instance through a field-entry event recognized by this passive, she immediately creates one Position Mark on the exact Position she currently occupies.

Recognized cases currently include at minimum:
- Deploy from Deck into Main Battlefield;
- Revive back onto Battlefield;
- Enter Arena;
- Return from Arena into Main Battlefield.

If a future presence transition is declared to count as Ariadne entering a field, the same rule applies.

## 4.2 Mark belongs to its Combat Instance

Ariadne's passive Mark belongs to the Combat Instance in which it was created.

When Ariadne leaves that Combat Instance:

> remove that instance's Ariadne Mark immediately.

Example:

```text
Ariadne active in Main
→ Main Mark exists

Ariadne enters Arena:
LEAVE_FIELD(Main)
→ remove Main Mark

ENTER_FIELD(Arena)
→ create new Arena Mark
```

Returning reverses the process:

```text
LEAVE_FIELD(Arena)
→ remove Arena Mark

ENTER_FIELD(Main)
→ create new Main Mark
```

No ghost Mark remains in an instance Ariadne has left.

---

# 5. MARK TIMER

## 5.1 Initial cap

When a new passive Mark is created:

```text
Mark Remaining = 3
```

## 5.2 Clock

The Mark's base timer is measured by **Ariadne's own Natural Actions**.

It is not measured by:
- every Natural Action globally;
- Turn Boundaries;
- arbitrary Actions;
- real time.

The first counted Natural Action is the first Ariadne Natural Action occurring after the Mark was created.

## 5.3 Base decrement

At the **end** of each qualifying Ariadne Natural Action:

```text
Mark Remaining -= 1
```

Example:

```text
new Mark = 3

Ariadne Natural Action #1 ends
3 → 2

Natural Action #2 ends
2 → 1

Natural Action #3 ends
1 → 0
```

When Remaining reaches 0, the old Mark expires and Ariadne immediately creates a new Mark at her current Position.

---

# 6. ALLY ENTERING THE MARK

## 6.1 Immediate extra decrement

When an allied Character other than Ariadne **enters the Position currently carrying Ariadne's Mark**:

```text
Mark Remaining -= 1
```

This occurs immediately on that successful enter event.

The source of the movement does not matter.

Qualifying sources include:
- Ariadne's Ultimate;
- the ally's own kit;
- another ally's kit;
- an enemy's forced movement;
- any other valid Position Mutation.

## 6.2 Standing still does not repeat

If the ally remains standing on the Mark:

> the Mark does not lose another point merely because that ally later takes Natural Actions while still standing there.

A new `-1` requires a new enter event.

Examples:

```text
B enters Mark
→ -1 once

B stays
→ no further -1

B leaves
B later enters again
→ -1 again
```

or:

```text
B enters Mark
→ -1

B leaves
C enters Mark
→ -1
```

---

# 7. MARK REACHING ZERO MID-ACTION

The Mark may reach zero during Ariadne's Action because an ally is moved into it.

Example:

```text
Mark Remaining = 1

Ariadne Ultimate moves ally into Mark
→ ally-enter event
→ 1 → 0
```

Canonical result:

1. old Mark disappears immediately;
2. a new Mark is immediately created at Ariadne's current Position;
3. new Mark starts at `Remaining = 3`;
4. the current Natural Action does **not** apply its end-of-action base decrement to that newly created Mark;
5. passive movement for the new Mark is checked only before Ariadne's next Natural Action.

A newly created Mark never loses time retroactively.

---

# 8. PASSIVE PRE-NATURAL-ACTION MOVEMENT

## 8.1 Eligibility

Immediately before Ariadne's Natural Action begins, check:

```text
active Ariadne Mark exists
AND
Ariadne is currently standing on that exact Mark Position
```

Only then may the passive move Ariadne.

If Ariadne is not standing on the Mark:
> no passive movement occurs.

## 8.2 Movement priority

If eligible, Ariadne attempts exactly one movement using:

```text
1. back
2. left
3. right
4. random empty allied Position
5. stay in place
```

Detailed sequence:

- first try one step `back`;
- if invalid/unavailable, try `left`;
- if left invalid/unavailable, try `right`;
- only if back + left + right all fail, randomly choose one valid empty Position on the allied field;
- if no allied Position is empty, remain in place.

The random fallback happens only after all three local directions fail.

## 8.3 Movement timing

Passive movement happens **before** the Natural Action.

It does not consume the Natural Action.

After movement resolves, Ariadne proceeds into her Natural Action normally if otherwise eligible.

---

# 9. EXPECTED PASSIVE CYCLE

Ordinary expected loop:

```text
Ariadne enters Position 2
→ Mark Position 2, Remaining 3

Before first Ariadne Natural Action:
Ariadne stands on Mark
→ move back 2 → 5 if valid

Natural Action #1 resolves
→ Ariadne now at 5
→ Mark remains at 2
→ Mark timer decrements at end

Before Natural Action #2:
Ariadne is not standing on Mark
→ no passive movement

...

Old Mark reaches 0
→ remove old Mark
→ create new Mark at Ariadne's current Position
→ Remaining 3

Before Ariadne's next Natural Action:
Ariadne again stands on her new Mark
→ passive movement can happen again
```

Therefore Ariadne ordinarily moves once per Mark cycle rather than moving every Natural Action.

---

# 10. INTENDED WEAKNESS — FULL FIELD

If Ariadne is standing on her Mark and:
- back is occupied/invalid;
- left is occupied/invalid;
- right is occupied/invalid;
- no allied Position is empty;

then passive movement fails and Ariadne stays in place.

A failed move:
- does not trigger Skill 1;
- may leave Ariadne occupying the Mark;
- may make Ultimate's movement destination unavailable, causing Ultimate to use its damage fallback.

This is intended behavior.

---

# 11. SKILL 1 — MOVEMENT-TRIGGERED LEADER HEAL

## 11.1 Trigger

Skill 1 triggers whenever Ariadne herself completes a **successful Position Mutation commit**.

The source of that movement does not matter.

Qualifying examples:
- passive movement;
- ally moves Ariadne;
- enemy moves Ariadne;
- teleport/displacement changes Ariadne's Position;
- another valid spatial/control effect moves her.

A failed movement attempt does not trigger Skill 1.

## 11.2 Granularity

Each separate successful Ariadne Position Mutation commit can trigger Skill 1 separately.

Example:

```text
A → B
commit

B → C
commit
```

These are two movement commits and can create two Skill 1 trigger attempts.

If one atomic movement directly commits:

```text
A → C
```

then it is one movement event and one trigger attempt.

## 11.3 AE Cost

Each successful Skill 1 auto-activation costs:

```text
15 AE
```

AE is shared Side/team AE in turn-based mode.

Skill 1 does not consume a Natural Action.

If 15 AE cannot be paid:
> the activation does not occur.

## 11.4 Leader target

Skill 1 heals Ariadne's allied Leader.

Heal formula:

```text
Heal Amount
= 100% Ariadne ATK
+ 100% Ariadne WIL
+ 10% Ariadne Current Max HP
```

The shorthand `100% WIL/ATK` means:

```text
100% ATK + 100% WIL
```

This is one Heal amount, not Physical/Will healing components.

If no valid allied Leader exists:
> Skill 1 does not successfully activate and does not pay AE.

---

# 12. SKILL 1 — OVERHEAL → SHIELD

If Skill 1 Heal produces positive Overheal:

> 100% of that Overheal becomes Shield for Ariadne.

This Shield is a source-specific Standard Shield contribution belonging to Skill 1.

## 12.1 Replacement rule

Skill 1 keeps at most one active Shield contribution from itself.

If a later Skill 1 activation creates `Overheal > 0`:

> the new Skill 1 Shield replaces the remaining old Skill 1 Shield.

Shield from other sources is untouched.

Example:

```text
Other Shield = 500
Old Skill 1 Shield = 300
New Skill 1 Overheal = 200

Result:
Other Shield remains 500
Skill 1 Shield becomes 200
```

## 12.2 Zero Overheal

If a later Skill 1 activation produces:

```text
Overheal = 0
```

then it does **not** erase Ariadne's existing Skill 1 Shield.

Replacement occurs only when a new positive Overheal Shield is actually created.

## 12.3 Duration

Skill 1 Shield has no timer.

It persists until:
- broken/depleted;
- replaced by a later positive Skill 1 Shield;
- battle ends;
- another valid mechanic removes it.

---

# 13. SKILL 2 — ALLY MOVEMENT → MAX HP GROWTH

## 13.1 Who counts

Skill 2 observes allied Characters **other than Ariadne**.

Ariadne's own movement never qualifies for Skill 2.

## 13.2 Movement source

An ally movement qualifies regardless of who caused it:
- Ariadne;
- that ally;
- another ally;
- an enemy;
- forced displacement;
- enemy spatial-control mechanics.

This intentionally allows enemy position-control kits to feed Ariadne Skill 2.

---

# 14. SKILL 2 — MOVEMENT BATCH GRANULARITY

Skill 2 triggers once per **successful allied Position Mutation batch**.

If one atomic batch simultaneously moves several allies:

```text
A moves
B moves
C moves
COMMIT together
```

then Skill 2 attempts to activate **once**, not three times.

This implements the rule:

> if more than one ally changes Position “in one time”, Ariadne still gains only one +5% Max HP activation.

## 14.1 Sequential batches

If one Action performs several distinct movement batches:

```text
Batch 1:
move A
→ commit

Batch 2:
move B
→ commit

Batch 3:
move C
→ commit
```

then Ariadne can attempt Skill 2 three times, limited by AE and the Turn Boundary cap.

## 14.2 Swap

A simultaneous swap:

```text
A ↔ B
```

is one atomic Position Mutation batch.

Although two allies changed Position:
> Skill 2 attempts once.

---

# 15. SKILL 2 — AE COST

Each successful Skill 2 activation costs:

```text
10 AE
```

It does not consume a Natural Action.

If 10 AE cannot be paid:
- no Max HP increase occurs;
- that failed attempt does **not** consume one of the five activation-cap uses.

---

# 16. SKILL 2 — MAX HP GROWTH

Each successful activation increases Ariadne's Max HP by:

```text
5% of Ariadne's Current Max HP
at the moment of activation
```

This compounds.

Example:

```text
Current Max HP = 1000
Proc 1: +50 → 1050
Proc 2: +52.5 → 1102.5
```

Exact numeric rounding belongs to later runtime normalization.

## 16.1 Current HP reconciliation

When Skill 2 increases Max HP:

> Ariadne's Current HP remains unchanged in absolute value.

Example:

```text
Current HP = 700
Current Max HP = 1000

Skill 2:
Max HP → 1050
Current HP remains 700
```

This is not Heal.

## 16.2 Duration

Skill 2 Max HP growth persists while Ariadne remains active-present in the current Battlefield/Combat Instance.

When Ariadne `LEAVE_FIELD`:

> all Skill 2 Max HP growth tied to that field presence is removed.

Thus moving Main → Arena removes Main-field Skill 2 growth; Arena can build its own; returning Main removes Arena growth.

---

# 17. SKILL 2 — TURN BOUNDARY CAP

Skill 2 can successfully activate at most:

```text
5 times per TURN_BOUNDARY window
```

Here `TURN_BOUNDARY` is the canonical **global SSI boundary between consecutive Natural Actions**.

A window is:

```text
after one Turn Boundary
→ until the next Turn Boundary
```

At the next Turn Boundary:
> the successful-activation counter resets.

Before the first Turn Boundary of battle:
> there is an initial window with cap 5.

Only successfully paid activations consume cap.

---

# 18. SKILL 3 — RANDOM MULTI-TARGET DAMAGE

Skill 3 should not be normalized as geometric AoE solely because the raw prose used “AoE”.

Its actual clarified targeting is random multi-target selection.

## 18.1 Cost

```text
20 AE
```

## 18.2 Targets

Select up to 3 **distinct** eligible enemies currently on the field.

Rules:
- if 3+ eligible enemies exist → select exactly 3 distinct targets;
- if fewer than 3 exist → hit every remaining eligible enemy once;
- no duplicate target;
- selection uses deterministic seeded RNG at runtime.

## 18.3 Guaranteed hit

Skill 3 is guaranteed to hit its locked valid targets.

It bypasses ordinary:
- Miss;
- Dodge;
- Evasion.

If a locked target reacts by changing Position:
> movement alone does not make the already locked hit miss.

Guaranteed hit does not override lifecycle invalidation if the target ceases to be a valid damage recipient before commit under a higher-order mechanic.

## 18.4 Damage formula

Each selected target receives one Damage Effect with two components:

```text
Physical component = 150% Ariadne ATK
Will component     = 150% Ariadne WIL
```

So shorthand:

```text
150% WIL/ATK
= 150% ATK + 150% WIL
```

The two components remain distinct because Physical uses ARM and Will uses RES.

No new `MIXED_DAMAGE` type is needed.

## 18.5 Simultaneous resolution

All selected targets resolve simultaneously:

```text
lock target set
→ snapshot required state
→ calculate all target damage
→ commit one simultaneous batch
→ process resulting lifecycle/death
```

One target dying does not alter another target's damage calculation in the same Skill 3 cast.

If multiple targets reach DEATH_CONFIRMED in this same batch, they belong to the same Death Cohort for Luân Hồi.

---

# 19. ULTIMATE — MOVEMENT BRANCH

Ariadne's Ultimate first attempts to move one ally into her current passive Mark.

Leader cannot be selected.

## 19.1 Candidate priority

Candidate allies are evaluated around **Ariadne's current Position**, not around the Mark.

Priority:

```text
1. left
2. right
3. front
4. back
```

Directions are side-relative.

Leader is excluded before priority evaluation.

Ariadne herself is not the ally moved by this branch.

## 19.2 Destination

Destination is Ariadne's active passive Position Mark.

The movement branch is legal only if:

1. an active Mark exists in the current Combat Instance;
2. that Mark Position is a valid destination;
3. the Mark Position is empty / can legally receive the selected ally;
4. at least one non-Leader ally is eligible according to left > right > front > back.

If all four are satisfied:
> move exactly one ally to the Mark.

---

# 20. ULTIMATE MOVEMENT EXAMPLE

Example:

```text
Ariadne deploys at Position 2
Mark = Position 2

before first Natural Action:
passive movement 2 → 5

Ariadne current Position = 5
Mark remains Position 2
```

Suppose:

```text
ally at Position 4
ally at Position 6
```

Relative to Ariadne:
- Position 4 = left;
- Position 6 = right.

Ultimate selects Position 4 because:

```text
left > right
```

Then:

```text
ally 4 → Mark Position 2
```

Consequences:
- ally entering Mark immediately reduces Mark Remaining by 1;
- ally movement can trigger Skill 2;
- Ariadne herself did not move, so this movement does not trigger Skill 1.

---

# 21. ULTIMATE — DAMAGE FALLBACK

If the movement branch cannot legally resolve, Ultimate switches to damage fallback.

Examples causing fallback:
- no active Mark;
- Mark destination invalid;
- Mark already occupied and cannot receive the selected ally;
- Ariadne herself still occupies the Mark;
- no eligible non-Leader ally exists;
- only Leader would otherwise be selectable.

No partial movement occurs before fallback.

## 21.1 Fallback targets

Randomly select up to 2 **distinct** eligible enemies on the field.

Rules:
- if 2+ exist → select exactly 2 distinct targets;
- if only 1 exists → hit that target once;
- no duplicates;
- deterministic seeded RNG.

## 21.2 Fallback damage

Each selected enemy receives:

```text
Physical component = 195% Ariadne ATK
Will component     = 195% Ariadne WIL
```

Shorthand:

```text
195% WIL/ATK
= 195% ATK + 195% WIL
```

## 21.3 Fallback resolution

Both selected targets resolve simultaneously.

One target's death cannot alter the other's damage calculation in the same Ultimate damage batch.

---

# 22. ULTIMATE BRANCH EXCLUSIVITY

Ultimate is branch-exclusive:

```text
if movement branch succeeds:
    move one ally
    do not deal fallback damage
else:
    do fallback damage
    do not move an ally
```

A successful movement branch never also deals fallback damage.

---

# 23. DEPLOYMENT ENTRY SEQUENCE

For Ariadne deployed from Deck:

```text
1. validate deployment
2. pay Deployment Cost
3. Ariadne enters Battlefield
4. global Deck-deployment rule fills Ariadne Rage
5. Ariadne passive creates Mark under her
6. Mark Remaining = 3
7. wait until Ariadne's first Natural Action opportunity
8. immediately before that Natural Action:
      if Ariadne still stands on Mark
      → passive movement resolves
9. if movement succeeded:
      Skill 1 may auto-trigger, paying 15 AE if possible
10. Ariadne begins first Natural Action
11. if Ultimate is legal/available:
      Ariadne uses Ultimate as intended
12. Ultimate movement branch or damage fallback resolves
13. Skill 2 / Mark-enter effects may trigger from movement branch
14. Ariadne Natural Action completes
15. the Mark that existed before this Natural Action loses its base 1,
    unless it already reached 0 during the Action and was replaced
```

The intended Ultimate use happens **inside the first Natural Action**, after Ariadne's pre-action passive movement.

It is not a separate non-natural auto-Ult immediately upon materialization.

---

# 24. DEPLOYED FIRST — INTENDED WEAK CASE

If Ariadne is the first normal Character deployed and only Leader is available nearby:
- Leader cannot be selected by Ultimate movement branch;
- no eligible ally exists;
- Ultimate uses its damage fallback.

This is an intended weakness of deploying Ariadne too early.

---

# 25. ARENA ENTRY / RETURN

If Ariadne is transferred from Main to Arena:

```text
LEAVE_FIELD(Main)
→ remove Main Mark
→ remove Main-field Skill 2 Max HP growth

ENTER_FIELD(Arena)
→ create Arena Mark under Ariadne
→ Remaining = 3
```

If she returns:

```text
LEAVE_FIELD(Arena)
→ remove Arena Mark
→ remove Arena Skill 2 Max HP growth

ENTER_FIELD(Main)
→ create fresh Main Mark under Ariadne
→ Remaining = 3
```

Arena entry and return are not Deck deployment.

Therefore they do not automatically trigger the Deck-deployment full-Rage rule.

---

# 26. REVIVE

If Ariadne is legitimately Revived from a non-active dead/waiting state back onto Battlefield:

> this counts as Ariadne entering the field for passive Mark creation.

Therefore:
- create new Mark under Ariadne;
- Remaining = 3.

Ordinary Revive is not Deck deployment.

Therefore:
> do not automatically fill Rage from the Deck-deployment rule unless a separate Revive mechanic explicitly says so.

---

# 27. REINCARNATION / REBIRTH

If Ariadne's True Self enters Reincarnation and later starts a new life:
- the True Self may persist;
- the old Ariadne Combat Definition may not.

If the new life no longer uses Ariadne's Combat Definition:
> Ariadne's passive does not follow merely because the same True Self continues.

The new body's own kit governs its field-entry behavior.

---

# 28. PUPPET HOSTING

If a True Self is routed/reborn into a Puppet that was already active-present on the battlefield:

> the Puppet itself did not ENTER_FIELD.

Binding a True Self to an existing Puppet is not field entry for that Puppet.

Therefore an already-present Puppet's field-entry triggers do not fire solely because a True Self binds into it unless an explicit host-binding rule says so.

---

# 29. INTERACTION SUMMARY

## Ariadne moves
Qualifies:
- Skill 1.

Does not qualify:
- Skill 2.

## Another ally moves
Qualifies:
- Skill 2.

If that ally enters Ariadne Mark:
- Mark Remaining also decreases by 1 immediately.

Does not qualify:
- Skill 1.

## One atomic batch moves multiple allies
Skill 2:
- one activation attempt.

## One Action performs multiple sequential ally-movement batches
Skill 2:
- one activation attempt per batch.

## Enemy moves Ariadne
Skill 1:
- can trigger.

## Enemy moves Ariadne's ally
Skill 2:
- can trigger.

If the ally enters Mark:
- Mark also loses 1.

---

# 30. RESOURCE SUMMARY

Ariadne interacts with three separate resource systems.

## Deployment Cost
Used for Deck → Battlefield deployment.

## AE
Shared Side/team resource in turn-based mode.

Ariadne costs:
- Skill 1 auto-trigger: 15 AE per successful activation;
- Skill 2 auto-trigger: 10 AE per successful activation;
- Skill 3: 20 AE;
- Ultimate: no AE Cost stated in this clarified source.

## Rage
Individual Character resource.

Deck deployment:
> Ariadne enters with full Rage because of the global Deck-deployment rule.

Ultimate use remains a separate legality/action decision.

Do not merge Deployment Cost, AE and Rage.

---

# 31. DAMAGE SUMMARY

## Skill 3

Up to 3 distinct enemy targets.

Per target:

```text
Physical = 150% ATK
Will     = 150% WIL
```

Guaranteed hit.

All selected targets resolve simultaneously.

## Ultimate fallback

Up to 2 distinct enemy targets.

Per target:

```text
Physical = 195% ATK
Will     = 195% WIL
```

All selected targets resolve simultaneously.

No fallback damage if movement branch succeeds.

---

# 32. HEAL / SHIELD SUMMARY

Skill 1 successful activation:

```text
Heal Leader
= 100% ATK
+ 100% WIL
+ 10% Ariadne Current Max HP
```

If Overheal > 0:

```text
Skill 1 Shield
= 100% of that Overheal
```

A positive new Skill 1 Shield replaces only the previous Skill 1 Shield contribution.

If Overheal = 0:
> the old Skill 1 Shield remains.

No duration; persists until broken/replaced/battle end/valid removal.

---

# 33. MAX HP SUMMARY

Skill 2:

```text
+5% of Current Max HP at activation
```

Compound.

Current HP:
> preserve absolute value.

Duration:
> until Ariadne leaves the current field/Combat Instance.

Cap:
> 5 successful activations per global Turn Boundary window.

Failed trigger from insufficient AE:
> no Max HP gain and no cap consumption.

---

# 34. POSITION MARK SUMMARY

```text
On recognized Ariadne field entry:
create Mark under Ariadne
Remaining = 3
```

Base timer:
- `-1` at end of each qualifying Ariadne Natural Action after Mark creation.

Acceleration:
- another ally enters Mark → `-1` immediately once per enter event.

Standing still:
- no repeated decrement.

At Remaining = 0:
- old Mark disappears immediately;
- new Mark appears under Ariadne;
- new Mark Remaining = 3.

If replacement occurs mid-Natural-Action:
- new Mark is not decremented by that same Natural Action.

Leaving Combat Instance:
- remove that instance's Mark immediately.

---

# 35. PRE-NATURAL-ACTION MOVEMENT SUMMARY

Ariadne can passive-move only when currently standing on her own active Mark.

Priority:

```text
back
→ left
→ right
→ random empty allied Position
→ stay
```

Movement occurs before the Natural Action.

Successful movement can trigger Skill 1.

---

# 36. ULTIMATE SUMMARY

Attempt movement branch first.

Requirements:
- active valid Mark;
- Mark destination available;
- eligible non-Leader ally.

Ally priority relative to Ariadne:

```text
left
→ right
→ front
→ back
```

If movement succeeds:
- move exactly one ally to Mark;
- no fallback damage.

If movement cannot resolve:
- random up to 2 distinct enemies;
- each receives simultaneous 195% ATK Physical + 195% WIL Will damage.

---

# 37. INTENDED CHARACTER PATTERN

Ariadne is a Position-manipulation / reactive utility Character whose value rises when allied Positions change frequently.

She benefits from:
- her own passive movement through Skill 1;
- allies being moved through Skill 2;
- enemy forced movement against her team through Skill 2;
- using Mark as a tactical destination for Ultimate.

Enemy spatial-control kits can unintentionally feed Ariadne Skill 2, creating a counter relationship.

Ariadne is intentionally weaker when:
- deployed before useful allies exist;
- allied field is completely full;
- movement destinations are blocked;
- team AE cannot support repeated auto-trigger costs.

---

# 38. BALANCE PARAMETER

Passive Mark cap currently remains:

```text
3 Ariadne Natural Actions
```

This is explicitly a balance/testing parameter and may change after playtesting.

It must be authored as data, not hardcoded runtime behavior.

---

# 39. CLARIFIED / LOCKED QUESTIONS

The following are considered resolved for the current Ariadne design:

1. Mark timer uses Ariadne's own Natural Actions.
2. Base Mark decrement happens at the end of Ariadne's Natural Action.
3. Ally-enter acceleration happens immediately on a new enter event.
4. Standing on Mark does not repeatedly reduce it.
5. Mid-action Mark expiry immediately creates a new Mark under Ariadne.
6. A new Mark created mid-action is not decremented again by that same Natural Action.
7. Passive movement priority is back → left → right → random empty ally Position → stay.
8. Directions are side-relative.
9. Skill 1 triggers per successful Ariadne Position Mutation commit.
10. Skill 2 triggers once per successful allied Position Mutation batch.
11. One simultaneous batch moving multiple allies creates one Skill 2 trigger attempt.
12. Multiple sequential movement batches can create multiple Skill 2 trigger attempts.
13. Skill 1 costs 15 AE per activation.
14. Skill 2 costs 10 AE per activation.
15. Insufficient AE prevents the corresponding auto-trigger.
16. Failed Skill 2 activation from insufficient AE does not consume its cap.
17. Skill 1 Shield replaces only its own previous positive Shield contribution.
18. Zero Overheal does not erase old Skill 1 Shield.
19. Skill 1 Shield has no timer.
20. Skill 2 Max HP increase compounds from Current Max HP at activation.
21. Skill 2 preserves Current HP absolute value.
22. Skill 2 Max HP growth ends on Ariadne leaving the current field.
23. Skill 2 cap is five successful activations per global Turn Boundary window.
24. Skill 3 is random distinct multi-target selection, not geometric AoE.
25. Skill 3 damage is 150% ATK Physical + 150% WIL Will per target.
26. Skill 3 is guaranteed hit against ordinary Miss/Dodge/Evasion and movement does not break locked targeting.
27. Skill 3 selected targets resolve simultaneously.
28. Ultimate ally priority is left → right → front → back.
29. Leader is not a valid Ultimate movement target.
30. Ultimate Mark destination must be valid and available.
31. Failed movement branch uses damage fallback.
32. Movement and fallback damage branches are mutually exclusive.
33. Ultimate fallback damage is 195% ATK Physical + 195% WIL Will per target.
34. Ultimate fallback targets are distinct and resolve simultaneously.
35. Deck deployment fills Rage globally.
36. Full Rage on Deck deployment is separate from generic field-entry semantics.
37. Ariadne's intended first Ultimate occurs in her first Natural Action after pre-action movement, if legal/available.
38. Revive counts as Ariadne field entry for Mark creation but not as Deck deployment for full Rage.
39. Enter Arena creates a fresh Arena Mark.
40. Leaving Main for Arena removes Main Mark.
41. Returning Main creates a fresh Main Mark.
42. Skill 2 growth is removed on each leave-field transition.
43. A True Self binding into a Puppet already on field is not Puppet field entry.
44. DEATH_CONFIRMED by itself does not define leave-field; actual presence transition does.

---

# 40. READY FOR SEMANTIC NORMALIZATION

This clarified kit is ready for:

```text
A. Terminology mapping
B. Functional Tag audit
C. Ability Schema normalization
D. Primitive composition
E. Contract impact analysis
F. Kernel dry-run
G. Stress-test comparison
```

The next model should compare the raw kit against this clarified file and should **not reopen resolved gameplay questions** unless it discovers a genuine contradiction with newer user canon or the canonical architecture.

If the current architecture cannot represent one of these clarified mechanics, that is an architecture-impact finding — not permission to reinterpret Ariadne's gameplay.
