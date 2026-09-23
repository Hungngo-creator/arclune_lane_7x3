# ARCLUNE — PILOT #4
# ALCestis — CLARIFIED GAMEPLAY CANON

**Revision:** Pilot #4 Clarification R2 — exact Skill-3 direct-effect checkpoint / child-action exclusion / lifecycle validity / global Turn Boundary clock

> **Purpose:** This file is the authoritative gameplay interpretation for Alcestis Pilot #4.
>
> **Precedence:** This Clarified Gameplay Canon overrides the earlier raw prose/examples wherever wording differs.
>
> **Scope:** gameplay meaning only. It does **not** itself patch `01–08`.
>
> **Architecture rule:** Character = declarative composition; Kernel = generic runtime. Do not hardcode Alcestis by Character ID.

---

# 0. IDENTITY / WORKING NAMES

**Character name:** `Alcestis` — LOCKED.

**Ability working names** — rename-safe; mechanics below are authoritative even if names change later:

- **Passive:** `Ransom of Thanatos` / `Giá Chuộc Thanatos`
- **Skill 1:** `Irrevocable Covenant` / `Khế Ước Bất Hồi`
- **Skill 2:** `Threefold Dirge` / `Tam Khúc Ai Ca`
- **Skill 3:** `Borrowed Breath` / `Hơi Thở Mượn`
- **Ultimate:** `Vicarious Return` / `Thế Mệnh Quy Hoàn`

**Rank:** `UNRESOLVED`  
**Class:** `UNRESOLVED`  
**Native Element:** `UNRESOLVED`

**Base Deployment Cost:** `TBD_BY_COST_BUDGET`.

Design expectation is that the final base Deployment Cost will likely be above 18, but that expectation is **not** a locked numeric gameplay value and must not be promoted into canonical data before Cost Budget work resolves it.

**Basic Attack:** not specified by this Pilot; do not invent it.

---

# 1. TURN-BASED DECK / COST VOCABULARY FOR THIS KIT

For `TURN_BASED_MAIN`, keep these concepts strictly separate:

```text
Character Deployment Cost
≠
Side Deployment Cost Bar
≠
AE
≠
Rage
```

The Side Deployment Cost Bar is the mode resource that naturally gains Cost over time and is spent to deploy Characters from Deck.

Alcestis also has a **battle-scoped current Deployment Cost** used when she is deployed and used by her Ultimate formula.

Let:

```text
C0 = resolved Base Deployment Cost from Cost Budget
C  = Alcestis current battle Deployment Cost
D  = current Ultimate divisor
```

At battle initialization:

```text
C = max(1, C0 - 5)
D = 4
```

The `-5` Passive reduction is applied exactly once for the battle.

Returning to Deck and redeploying does **not** apply another `-5`.

All Character Deployment Cost values have a floor of:

```text
1
```

unless a future explicit higher system rule says otherwise.

---

# 2. PASSIVE — RANSOM OF THANATOS

The Passive has three independent mechanic groups.

---

## 2.1 Assassin Natural-Action Damage Conversion

When Alcestis receives qualifying direct Damage from an enemy whose:

```text
Effective Class = Assassin
```

and that Damage belongs to the enemy's own **Natural Action**:

> 100% of the qualifying Damage components are converted to True Damage **before mitigation**.

Canonical component behavior:

```text
Physical component
→ convert component type to TRUE before ARM processing
→ bypass ARM / ordinary non-True mitigation according to True Damage Contract
→ Shield still applies unless explicit Shield bypass exists

Will component
→ convert component type to TRUE before RES processing
→ bypass RES / ordinary non-True mitigation according to True Damage Contract
→ Shield still applies unless explicit Shield bypass exists

Already-True component
→ remains True
```

This is a **Damage-component semantic conversion**, not merely renaming post-mitigation Damage as True Damage.

### Qualifying source/action scope

The enemy's Class check uses **Effective Class**, not base/native Class.

The source must be the enemy Actor currently performing the qualifying Natural Action.

Qualifying Damage includes direct Damage components authored as part of the selected Basic Attack / Skill / Ultimate resolution of that Natural Action.

A Passive that **modifies or strengthens the direct Basic Attack Damage itself** remains part of that direct hit and qualifies.

Examples:

```text
Assassin Natural Basic
+ Passive says "this Basic gets +X% damage"
→ qualifies

Assassin Natural Basic
+ Passive changes one Basic component
→ qualifies
```

Excluded:

- DoT ticks;
- Mark damage;
- delayed standalone damage;
- a separate Passive-triggered damage packet;
- independent Reaction damage;
- independent Follow-up / Counter damage;
- damage whose only connection is sharing the same Character kit;
- non-Natural Actions.

A separate Passive effect does not become qualifying direct Natural-Action Damage merely because it was triggered by that Natural Action.

Action lineage and Effect provenance must remain distinguishable.

---

## 2.2 Battle-start Deployment Cost reduction

At battle initialization:

```text
C = max(1, C0 - 5)
```

This is battle-scoped.

It is not re-applied on later redeployment.

Example only:

```text
C0 = 21
→ first battle current Cost C = 16
```

The earlier raw example using base Cost 20 / first Cost 15 is not canonical.

---

## 2.3 Deployment Shield

Every successful Alcestis:

```text
DEPLOY_FROM_DECK
→ Battlefield
```

while Skill 1 has **not** permanently disabled this subsystem creates one Alcestis-Passive Shield contribution on Alcestis:

```text
Shield amount = 25% Alcestis Current Max HP
```

using authoritative Current Max HP at Shield creation.

### Shield duration

The Passive Shield lasts for:

```text
3 Alcestis Natural Action opportunities
```

after deployment.

This duration counts Alcestis's SSI-granted Natural Action opportunities.

A CC-lost opportunity **does consume** one of the three duration counts.

Deployment itself does not consume a count.

If Alcestis is deployed into a position that later receives a Natural Action in the current SSI pass, that opportunity may be count #1.

### Recovery trigger cause

The 5% recovery window begins only if this Passive Shield terminates because:

1. its shield amount is fully depleted / broken; or
2. its declared 3-opportunity duration naturally expires.

It does **not** begin because the Shield was removed by:

- Alcestis returning to Deck;
- Skill 1 disabling/removing the Passive Shield;
- unrelated lifecycle cleanup.

External removal by another mechanic is not automatically treated as "broken or natural expiry" unless that mechanic's own Contract explicitly produces an equivalent qualifying terminal cause.

### Recovery window

After a qualifying break/expiry:

```text
next 3 FUTURE actually performed Alcestis Natural Actions
→ after each such Natural Action completes
→ Heal Alcestis for 5% Current Max HP
```

The Natural Action that causes the Shield's duration to expire is **not** Recovery Heal #1.

Recovery Heal #1 belongs to the next actually performed Alcestis Natural Action.

A CC-lost opportunity does **not** produce `NATURAL_ACTION_COMPLETED`, so it does not produce a 5% Heal and does not consume one of these three actual-action Heal settlements.

Each Heal uses Alcestis Current Max HP at that Heal's resolution time.

### Leaving Battlefield / returning Deck

If Alcestis returns to Deck while the Passive Shield or Recovery window is active:

- the Passive Shield is removed;
- the Recovery window is removed;
- no new Recovery window is created from that removal;
- no pending 5% Heal survives in Deck.

A later redeployment creates a fresh Passive Shield cycle if Skill 1 has not disabled the subsystem.

---

# 3. SKILL 1 — IRREVOCABLE COVENANT

**Ability type:** Active Skill  
**Cost:** `20 AE`  
**Usage limit:** `1 successful activation per battle`  
**Consumes:** Alcestis's Natural Action when used normally.

On successful activation, Skill 1 commits three battle-persistent changes.

---

## 3.1 Ultimate divisor

Change:

```text
D = 4
```

to:

```text
D = 2
```

for Alcestis's future Ultimate Heal formulas.

This persists for the rest of the battle.

---

## 3.2 Deployment Cost lock

At successful Skill 1 activation:

```text
lockedDeploymentCost = current C
```

From that point until battle end:

> Alcestis's Deployment Cost is frozen at exactly that value.

Example:

```text
current C = 12
Skill 1 succeeds
→ C remains 12 for the rest of battle
```

Future Ultimate returns still return Alcestis to Deck, but their normal:

```text
C -= 1
```

effect no longer changes her Deployment Cost.

The lock freezes the value itself, not merely its lower bound.

---

## 3.3 Passive Shield / Recovery subsystem sacrifice

On successful Skill 1 activation:

- immediately remove Alcestis's current Passive deployment Shield contribution, if present;
- immediately remove any active Passive 5%-Heal Recovery window;
- this removal does **not** count as Shield break/expiry;
- therefore it does **not** start a Recovery window;
- future Deck deployments no longer create the Passive 25% Max-HP Shield;
- future Passive 5% recovery windows from that Shield subsystem can no longer be created.

This disable persists for the rest of the battle.

Skill 1 does not remove unrelated Shields from other sources.

---

# 4. SKILL 2 — THREEFOLD DIRGE

**Ability type:** Active Skill  
**Cost:** `15 AE`

Select:

```text
up to 3 different enemy targets
```

using random selection without replacement from the ordinary eligible enemy pool.

Enemy Leader is not excluded from the pool merely for being Leader.

If fewer than 3 eligible enemies exist, hit all available eligible enemies up to that count.

Each selected target receives:

```text
Physical Damage = 185% ATK
+
Will Damage     = 185% WIL
```

The three target resolutions belong to one declared multi-target direct Skill resolution.

No duplicate target is selected within the same cast.

---

# 5. SKILL 3 — BORROWED BREATH

**Ability type:** Passive / Automatic reaction-like settlement  
**Cost per successful activation:** `30 AE`  
**Cooldown:** none  
**Battle activation cap:** `2 successful activations`

Skill 3 cannot activate again while its own current defensive window is active.

---

## 5.1 Trigger measurement window

For each enemy **Natural Action**, at the start of that enemy root Natural Action, snapshot Alcestis's:

```text
MaxHP_at_enemy_NA_start
```

During that enemy root Natural Action, aggregate only qualifying **direct Actual HP Damage** Alcestis loses from the **direct effect graph of that same root Natural Action**.

Trigger threshold:

```text
aggregate qualifying direct Actual HP Damage
>=
50% × MaxHP_at_enemy_NA_start
```

Shield-only absorbed Damage is not Actual HP Damage.

Overkill beyond HP actually removed does not add to Actual HP Damage.

HP Cost and HP Loss are not Damage and do not count.

### Root-owned direct-effect scope

Qualifying Damage must belong to the direct effect graph of the enemy root Natural Action itself.

Examples that qualify:

```text
enemy Natural Basic direct hit
enemy Natural Skill direct hit
enemy Natural Ultimate direct hit
Passive modifies/strengthens a direct Basic component without creating a separate Effect/Action
```

Examples that do not qualify:

```text
child Action Damage
DoT
Mark damage
delayed standalone Damage
separate Passive-triggered Damage
Reaction
Follow-up
Counter
Forced Action
non-Natural Action Damage
```

A child Action does **not** qualify merely because it shares the same:

```text
rootActionId
```

with the enemy Natural Action.

The deciding distinction is:

```text
root Natural Action's own direct effect graph
vs
separate child/triggered Action or standalone Effect
```

Action lineage and Effect provenance must remain distinguishable.

---

## 5.2 Trigger checkpoint

Skill 3 threshold evaluation occurs at the enemy root Natural Action's:

```text
ACTION_DIRECT_EFFECTS_COMPLETE
```

checkpoint, after:

```text
root Natural Action direct Effects resolve
→ direct Damage commits
→ mandatory immediate lifecycle processing caused by those direct Effects
→ ACTION_DIRECT_EFFECTS_COMPLETE
```

and before the enemy root Action proceeds through later completion-stage work.

Canonical flow:

```text
ENEMY NATURAL ACTION START
→ snapshot Alcestis Max HP

→ root Action direct Effects resolve
   → only root-owned direct Damage Effects count
   → direct Basic/Skill/Ultimate Damage counts
   → Passive modification attached to the same direct hit counts
   → child Action Damage does NOT count
   → standalone Passive / DoT / Mark / Reaction / Follow-up / Counter does NOT count

→ commit direct Damage
→ mandatory lifecycle processing

→ ACTION_DIRECT_EFFECTS_COMPLETE

→ if Alcestis is still lifecycle-valid and active:
     aggregate qualifying Actual HP Damage
     evaluate Skill 3 threshold

→ enemy root Action continues toward its later completion pipeline
```

The defensive +70% modifier therefore does not retroactively reduce any direct hit from the enemy Natural Action that created the threshold.

Skill 3 does not use:

```text
ACTION_COMPLETED
```

as its threshold checkpoint.

It also does not wait for later unrelated completion Reactions/settlements unless another explicit Contract independently requires that.

---

## 5.3 Lifecycle-validity requirement

At the `ACTION_DIRECT_EFFECTS_COMPLETE` threshold checkpoint:

if Alcestis is:

- alive / lifecycle-valid;
- still an active valid Actor for this settlement;
- not `DEATH_CONFIRMED`;
- not `REMOVED`;
- not otherwise lifecycle-invalid;

then Skill 3 may proceed to its ordinary condition / AE / use-cap checks.

If direct Damage caused HP_ZERO but Death Prevention resolves successfully and Alcestis remains valid:

> Skill 3 may still activate if every other condition passes.

If direct Damage results in:

```text
DEATH_CONFIRMED
```

or another lifecycle-invalid terminal state before the checkpoint evaluation:

> Skill 3 does not activate.

In that case:

- do not pay 30 AE;
- do not consume one of the 2 battle activations;
- do not queue a delayed activation for later.

---

## 5.4 Activation conditions

At the locked checkpoint, Skill 3 can successfully activate only if:

1. qualifying aggregate Damage reached the 50% threshold;
2. Skill 3 is not already active;
3. successful-use count is below 2;
4. Alcestis has at least 30 AE;
5. Alcestis remains lifecycle-valid and active.

If all conditions pass:

```text
pay 30 AE
→ successful activation count +1
→ apply defensive modifier immediately
```

If Alcestis lacks 30 AE:

- Skill 3 does not activate;
- no battle-use count is consumed;
- the qualifying enemy Natural Action does not create a queued/pending activation for later.

If Skill 3 is already active:

- new qualifying thresholds are ignored;
- they do not queue another activation.

---

## 5.5 Defensive modifier

On successful activation:

```text
RES +70%
ARM +70%
```

using the ordinary percentage Stat Modifier semantics.

The modifier becomes active immediately after the Skill 3 settlement succeeds at the enemy root Natural Action's `ACTION_DIRECT_EFFECTS_COMPLETE` checkpoint.

---

## 5.6 Duration clock

Skill 3 is only triggered by an **enemy Natural Action**.

Therefore this Pilot has no case where Skill 3 first activates during:

- Alcestis's own Natural Action;
- an Alcestis Turn Boundary.

After successful activation, duration counting begins from Alcestis's **next** Natural Action opportunity.

Canonical duration:

```text
next Alcestis Natural Action opportunity = count #1
→ next global TURN_BOUNDARY

next Alcestis Natural Action opportunity = count #2
→ immediately following global TURN_BOUNDARY begins
→ remove +70% ARM/RES
→ Heal Alcestis for 10% Current Max HP
→ Skill 3 becomes eligible to activate again
```

A CC-lost Alcestis Natural Action opportunity **does count** as one of the two duration counts.

The terminal boundary is:

```text
the global TURN_BOUNDARY immediately following
Alcestis's second counted Natural Action opportunity
```

It is not an Actor-private "Alcestis Turn Boundary".

The Heal uses Alcestis Current Max HP at that boundary settlement.

Only after this expiry settlement completes can Skill 3 become eligible to activate again.

---

## 5.7 Early removal / Return-to-Deck

If Alcestis returns to Deck before natural expiry:

- remove the Skill 3 defensive modifier;
- terminate its active duration window;
- do **not** perform the 10% expiry Heal later;
- keep the already-consumed battle activation count.

A future redeployment does not restore the interrupted Skill 3 window.


# 6. ULTIMATE — VICARIOUS RETURN

Ultimate has no additional AE Cost specified by this Pilot.

Normal Ultimate/Rage legality remains governed by the existing system.

---

## 6.1 Snapshot current Deployment Cost and divisor

At Ultimate resolution, before any Ultimate-caused Return-to-Deck Deployment-Cost reduction:

```text
C_cast = current Alcestis Deployment Cost
D_cast = current divisor
```

where normally:

```text
D_cast = 4
```

or after Skill 1:

```text
D_cast = 2
```

The current cast always uses `C_cast` from before the return/decrement caused by that same Ultimate.

---

## 6.2 Leader Heal

Nominal Leader Heal:

```text
LeaderHeal =
(100% ATK + 100% WIL)
×
(C_cast / D_cast)
```

Examples:

```text
C_cast = 15, D_cast = 4
→ 375% ATK + 375% WIL

C_cast = 14, D_cast = 4
→ 350% ATK + 350% WIL

C_cast = 13, D_cast = 4
→ 325% ATK + 325% WIL
```

After Skill 1:

```text
same C_cast
but D_cast = 2
```

so the nominal Heal coefficient is doubled relative to divisor 4.

---

## 6.3 Leader Overheal → Shield

Resolve the Leader Heal normally.

Any actual **Overheal generated by that Leader Heal** is converted 100% into Shield on the allied Leader.

The Ultimate's Leader Shield is a source-specific Shield contribution/pool.

Cap:

```text
100% Leader Current Max HP
```

No duration is authored by this Pilot.

Therefore it persists until depleted/removed by ordinary Shield/system rules.

If the Leader Heal produces no Overheal:

```text
new Shield contribution = 0
```

If the Leader Heal is prevented/replaced such that no Heal/Overheal result exists:

> no Leader Overheal Shield is created from that branch.

---

# 7. ULTIMATE SECONDARY ALLY HEAL

Ultimate also resolves one independent secondary Heal branch.

Eligible target pool:

- allied Actor;
- has Chân Ngã / True Self;
- active and legally Healable under ordinary target/lifecycle rules;
- excludes allied Leader;
- excludes Alcestis.

Select the eligible ally with the lowest:

```text
Current HP / Current Max HP
```

percentage.

Example:

```text
Ally A = 100 / 200 = 50%
Ally B = 250 / 750 ≈ 33.33%
→ select Ally B
```

If multiple eligible allies tie for lowest HP%, choose randomly among the tied lowest-HP% candidates.

If no eligible ally exists, skip this secondary branch.

**Target-selection timing relative to the Leader Heal is not separately locked by the designer.**
Normalizer must preserve the lowest-HP% semantic and surface timing only if current architecture requires an explicit choice.

---

## 7.1 Secondary Heal amount

The secondary nominal Heal is:

```text
50% × the nominal Leader Heal amount
```

equivalently:

```text
SecondaryHeal =
(100% ATK + 100% WIL)
×
(C_cast / D_cast)
× 0.50
```

Example:

```text
C_cast = 13
D_cast = 4

Leader coefficient = 325% ATK + 325% WIL
Secondary coefficient = 162.5% ATK + 162.5% WIL
```

The earlier raw prose saying 30% is superseded.

The locked value is:

```text
50%
```

---

## 7.2 Independence from Leader Heal outcome

The secondary Heal is an independent direct Ultimate branch.

Failure, denial, replacement or conversion of the Leader Heal must **not** suppress the secondary Heal merely because the Leader branch did not successfully restore HP.

Example interaction requirement:

```text
Leader cannot receive Heal
or
an external system converts the Leader's incoming Heal into another effect
→ secondary Heal is still attempted normally
```

If an external future battlefield rule converts **all incoming Heal** into True Damage, that future rule may independently affect the secondary Heal too.

That future Heal→True-Damage conversion mechanic is **not defined by Alcestis Pilot #4** and must not be invented or patched solely from this interaction example.

The only Alcestis requirement here is branch independence.

---

## 7.3 Secondary Overheal

If the secondary Heal exceeds the selected ally's missing HP:

> all secondary Overheal is discarded.

It does not convert to Shield.

Only Leader-branch Overheal receives the Ultimate's Overheal→Shield conversion.

---

# 8. ULTIMATE RESOLUTION ORDER

Canonical direct-effect order:

```text
1. snapshot C_cast and D_cast

2. establish Ultimate target context

3. resolve Leader Heal branch

4. derive Leader Overheal
   → convert qualifying Overheal to Leader Shield
   → cap at 100% Leader Current Max HP

5. resolve independent secondary ally Heal branch
   → discard its Overheal

6. finish mandatory direct Heal replacement/admission/result processing

7. successful Ultimate Return-to-Deck transition

8. if Deployment Cost is not locked by Skill 1:
      C = max(1, C - 1)

9. Side Deployment Cost Bar +3
```

The Ultimate does not return Alcestis to Deck between the Leader Heal and secondary Heal.

The same cast uses the pre-return `C_cast`.

The `C -= 1` change affects future deployment / future Ultimate casts only.

`Side Deployment Cost Bar +3` is a resource gain to the deployment-system Cost Bar.

It is **not**:

- `C += 3`;
- AE gain;
- Rage gain.

Skill 1's Deployment-Cost lock blocks the Ultimate `C -= 1` mutation, but it does **not** block the separate:

```text
Side Deployment Cost Bar +3
```

gain.

Exact Cost-Bar maximum/overflow behavior remains governed by the active Mode/System policy; this kit does not invent it.

---

# 9. RETURN TO DECK — LOCKED GAMEPLAY MEANING

Ultimate performs an explicit successful **Return-to-Deck** transition after its direct Heal branches finish.

This is not equivalent to generic:

```text
LEAVE_FIELD
```

alone.

Canonical semantic outcome:

```text
Battlefield active presence
→ LEAVE_FIELD for the current Combat Instance
→ Character deployment state becomes Deck / undeployed-returned state
→ Character remains a member of the battle Deck
```

It is not:

- Death;
- `DEATH_CONFIRMED`;
- Revive;
- Summon despawn;
- Arena return;
- ordinary Temporary Absence.

A later legal Deck→Battlefield deployment is a new `DEPLOY_FROM_DECK` transaction and receives the ordinary global deployment behavior, including full Rage if current canonical Mode/Deployment Contract says so.

---

# 10. RETURN-TO-DECK STATE RETENTION / PURGE

On successful Ultimate Return-to-Deck commit:

> purge all currently attached `Buff`, `Debuff`, and `Mark` instances from Alcestis regardless of their Authority Tier.

This is **not** modeled as Alcestis casting Cleanse.

It is a lifecycle/state-retention consequence of the Return-to-Deck transition.

Therefore:

- the removed status does not "win" merely because it has higher Authority;
- Alcestis does not need Axiom Authority to remove it;
- ordinary Cleanse-vs-Debuff Authority competition is not the semantic being used.

The return transition also terminates Alcestis battlefield-scoped transient self states from this kit:

- Passive deployment Shield;
- Passive 5%-Heal Recovery window;
- active Skill 3 +70% RES/ARM modifier;
- Skill 3 active duration clock.

These removals do not trigger:

- Passive Shield break/expiry Recovery;
- Skill 3 10% natural-expiry Heal.

---

## 10.1 Battle-persistent Alcestis state retained through Deck return

The following persist through Return-to-Deck and redeployment:

- Skill 1 successful-use flag;
- Ultimate divisor `D = 2` after Skill 1;
- Skill 1 Deployment-Cost lock state;
- current locked Deployment Cost if locked;
- cumulative Ultimate Return-to-Deck Deployment-Cost reductions already committed before lock;
- Skill 3 successful activation count;
- other explicitly battle-persistent Alcestis counters.

Ordinary Buff/Debuff/Mark state does not persist.

The Return-to-Deck transition does not by itself reset Alcestis HP unless another rule explicitly says so.

A later Deck deployment starts a fresh field-presence cycle.

---

# 11. DEPLOYMENT AFTER RETURN

When Alcestis is later legally redeployed from Deck:

1. pay her then-current Deployment Cost `C` from the Side Deployment Cost Bar;
2. perform ordinary successful `DEPLOY_FROM_DECK`;
3. receive global deployment behavior such as Current Rage = Max Rage if the active canonical Mode/Deployment Contract provides it;
4. if Skill 1 has not disabled the Passive Shield subsystem:
   - create a fresh 25% Current Max HP Passive Shield;
   - start a fresh 3-own-opportunity Shield duration;
5. do not reapply the battle-start `-5` Deployment-Cost reduction.

---

# 12. SKILL 1 / ULTIMATE COST LOOP EXAMPLES

## Example A — no Skill 1

Assume Cost Budget eventually resolves:

```text
C0 = 21
```

Battle start:

```text
C = 16
D = 4
```

First Ultimate:

```text
Leader coefficient uses 16/4 = 4.00
→ 400% ATK + 400% WIL
→ Return to Deck
→ C becomes 15
→ Side Deployment Cost Bar +3
```

Second deployment pays:

```text
15
```

Second Ultimate:

```text
Leader coefficient uses 15/4 = 3.75
→ 375% ATK + 375% WIL
→ Return
→ C becomes 14
→ Side Deployment Cost Bar +3
```

The battle-start `-5` is not applied again.

---

## Example B — Skill 1 locks the current Cost

Assume current:

```text
C = 13
D = 4
```

Skill 1 succeeds:

```text
D = 2
lockedDeploymentCost = 13
C = 13 permanently for the battle
Passive Shield / Recovery subsystem disabled
```

Future Ultimate:

```text
Leader coefficient uses 13/2 = 6.5
→ 650% ATK + 650% WIL
→ Return to Deck
→ Ultimate's normal -1 Deployment-Cost mutation is blocked by lock
→ C remains 13
→ Side Deployment Cost Bar still gains +3
```

---

# 13. EXPLICIT NON-EQUIVALENCES

```text
Deployment Cost
≠ Deployment Cost Bar

Return to Deck
≠ generic LEAVE_FIELD only

Return to Deck purge
≠ Cleanse

Damage component conversion to True
≠ Final Damage Reduction
≠ 100% Penetration
≠ post-mitigation relabeling

Natural Action direct Damage
≠ every effect produced by the same Character

Passive Shield natural expiry/break
≠ lifecycle cleanup removal

Skill 3 threshold
≠ raw damage
≠ Shield damage
≠ HP Cost
≠ HP Loss

Leader Heal branch
≠ secondary ally Heal branch

Leader Overheal
≠ secondary Overheal
```

---

# 14. PILOT #4 ARCHITECTURE-PROVING PRESSURE POINTS

These are **questions for normalization**, not pre-approved architecture patches.

The normalizer must first attempt composition from current canonical architecture.

High-risk pressure points:

1. **Target-scoped incoming Damage-component conversion**
   - Effective-Class Assassin;
   - enemy Natural Action;
   - direct-effect provenance;
   - conversion to True before mitigation;
   - standalone Passive/DoT/Mark exclusion.

2. **Battle-scoped mutable Character Deployment Cost**
   - base Cost metadata;
   - battle-start `-5`;
   - per-successful-Ultimate-return `-1`;
   - floor 1;
   - Ultimate formula reads current Cost;
   - Skill 1 freezes current Cost exactly.

3. **Explicit Return-to-Deck transition**
   - distinct from LEAVE_FIELD;
   - Deck membership retained;
   - current deployment state changes;
   - later redeployment is a fresh `DEPLOY_FROM_DECK`.

4. **Return-to-Deck state-retention profile**
   - Buff/Debuff/Mark discarded regardless Authority as lifecycle retention;
   - battle-persistent counters retained;
   - selected Alcestis field-transient states cleared;
   - no false Shield-break Recovery;
   - no false Skill-3 natural-expiry Heal.

5. **Different personal clocks inside one kit**
   - Passive Shield: own Natural Action opportunities; CC-lost counts;
   - Passive Recovery: actually performed own Natural Actions; CC-lost does not settle/consume;
   - Skill 3: own Natural Action opportunities; CC-lost counts; terminal Heal at following Turn Boundary.

6. **Enemy Natural-Action direct Actual-HP-Damage aggregation**
   - per root enemy Natural Action;
   - threshold against Max-HP snapshot at enemy-NA start;
   - only direct qualifying Damage;
   - trigger after direct Damage resolution.

7. **Ultimate independent result branches**
   - Leader Heal + Leader Overheal→Shield;
   - secondary Heal independent of primary outcome;
   - secondary Overheal discarded;
   - Return-to-Deck only after both direct Heal branches finish.

8. **Deployment Cost Bar +3**
   - modifies the Side's Deployment Cost Bar;
   - must not be confused with Character Deployment Cost.

Do not assume any of the above requires a new Tag, Primitive or subsystem until current composition fails.

---

# 15. CURRENT UNRESOLVED ITEMS

These items are intentionally not invented:

1. Alcestis Rank.
2. Alcestis Class.
3. Alcestis Native Element.
4. Final Base Deployment Cost from Cost Budget.
5. Exact target-selection snapshot timing of the Ultimate secondary lowest-HP% ally relative to the Leader Heal, if current architecture makes that timing gameplay-observable.
6. Any future system that converts incoming Heal into True Damage. Alcestis only locks branch independence against such an external rule; the external conversion mechanic itself belongs to the future character/system that proves it.

Everything else in this file is locked gameplay interpretation for Pilot #4.
