# ARCLUNE — PYGMALION — CLARIFIED GAMEPLAY CANON

**Revision:** R1.
**Status:** GAMEPLAY_CLARIFIED / ARCHITECTURE_NORMALIZED.
**Source:** `26) Pygmalion` in root `Ý tưởng nhân vật 4.md`; latest explicit **PYGMALION Q1–Q10 FINAL DESIGNER LOCK** replaces all ten R0 questions/proposals and conflicting raw shorthand. Existing non-superseded PUPPET/Revive/attribution locks remain applicable.

## 1. Character, actor and lifetime boundaries

Pygmalion creates Puppet bodies awaiting Chân Ngã. A Chân Ngã entering Reincarnation may inhabit an eligible empty Puppet and receive a constrained random full Combat Definition. Body, Chân Ngã, inherited behavior, actor and attribution remain separate.

Puppet is **entityKind=PUPPET**, distinct from SUMMON. Summon-only targeting, bonuses, death listeners and owner-cleanup do not apply automatically. Each Puppet has independent identity, host basis, current stats/resources, State, presence and lifecycle. One Puppet hosts at most one Chân Ngã; a Chân Ngã cannot occupy two active hosts simultaneously.

Pygmalion Death, Revive or actual non-death **LEAVE_FIELD does not automatically remove already-created Puppets**. They survive until their own lifecycle removes them. Multiple old/inhabited Puppets may coexist; there is no authored live-cap1. Creation quota, live empty-host blocker and existing host ownership are different things.

Pygmalion Rank/Class/native Element/full budget/Base Deployment Cost and empty-host Class/Element remain unspecified metadata. Do not infer UR from the note about making simpler UR definitions for the lottery. Full-kit Class/Element inheritance is nevertheless explicitly settled in §5.

## 2. Passive — A Masterpiece Awaiting a Soul / Kiệt Tác Chờ Một Linh Hồn

### 2.1 One new-Puppet quota per kit Life Cycle

Each Pygmalion kit Life Cycle owns exactly one maximum creation allowance, **UNUSED → CONSUMED only on successful materialization**. Pygmalion DEATH_CONFIRMED followed by successful Revive starts a new kit cycle with UNUSED quota. Ordinary Revive retains trueSelfId/lifeSerial under REV-003; kit cycle serial is a separate quota-generation marker.

Any currently live/materialized **EMPTY** Puppet owned by that Pygmalion blocks new creation. INHABITED bodies do not block. An empty body that died/disappeared does not block. Never use “any Puppet exists” or a singleton as the condition.

If a live empty old body survives owner Revive, defer the current unused quota. When that body becomes inhabited or is actually removed/dies, attempt current-cycle creation if the quota remains UNUSED and ordinary source/materialization legality permits it. Receiving Chân Ngã never reopens CONSUMED quota. Missed earlier cycles supply no stored extra allowances.

Explicit creation checkpoints include current-unused-quota ENTER_FIELD, successful Revive/new kit cycle, and removal/inheritance of an old live empty blocker. Redeploy/entry without a new kit cycle does not reset consumed quota. Duplicate checkpoint delivery cannot create another host.

### 2.2 First basis versus later bases

For the **first Puppet of Pygmalion's first kit Life Cycle**, capture one immutable creator basis at **BATTLE_START**, after authoritative roster/rank/cultivation/static pre-battle initialization and before combat Actions/temporary in-battle effects. The first-cycle Puppet uses that same basis even if actual creation is delayed. Failed first-cycle materialization does not replace it with current combat stats.

For Puppets of **later kit Life Cycles**, snapshot Pygmalion's current authoritative declared basis **immediately before successful materialization**. No live link afterward. Temporary modifiers genuinely present in those later current stats affect that snapshot; unrelated Buff/State objects are not copied.

| Host field | Initialization |
| --- | --- |
| Rank | Same as Pygmalion |
| Cultivation / tu vi | Same as Pygmalion |
| Rank-multiplied stats | 80% of the applicable immutable creator basis |
| Non-rank-multiplied stats | 0; separately explicit resources/metadata retain their own declared initialization |
| CurrentHP | Initialized MaxHP: full HP |
| Current Rage | 0 |
| Max Rage | 100 |

Snapshot only the declared host basis. Later creator changes and random inherited roster budgets do not update/replace it. The Puppet's own legitimate kit modifiers can affect current stats afterward. The rank-scaling field registry/numeric budget is separate metadata.

### 2.3 Placement, failure and quota commit

Use **ordinary Mode Puppet placement**, without Character-specific Slot geometry. Protect source/current-cycle eligibility, absence of live empty blockers, intended placement, initialized behavior/basis and quota through ordinary materialization.

No legal Slot, stale placement or failed materialization means **no Puppet and quota stays UNUSED**. Success atomically materializes a complete body and consumes its one quota; no half-body or consumed allowance on failure.

No pending wait-for-Slot or background retry token. Simply freeing a Slot is not a creation event. Only a later explicit creation checkpoint may attempt the still-unused current quota. Technical replay cannot convert one failed attempt into an unrequested later success.

## 3. Empty Puppet Combat Definition

An empty body has a minimal own definition, SSI Natural Action + Basic, no inherited Skills yet, and its own MaxRage100 pool.

Its Basic is one attack/one hit with two components:

- **PHYSICAL =100% ATK**;
- **WILL =100% WIL**.

One enemy, default **POSITION/SLOT** binding under TGT-008; no secondary Effect. Two components are not two hits.

Its legal Ultimate follows ordinary Rage Cost/readiness: root identity **ULTIMATE**, then exactly one real **BASIC_ATTACK** child, **non-Natural**, using its current Basic without coefficient increase/amplification. Root and child identities remain distinct. Generic non-Natural resource-gain law applies; no invented Rage autocast or SSI opportunity.

## 4. Pygmalion Reincarnation route

### 4.1 Checkpoint, owner availability and Side

Routing occurs when a Chân Ngã leaves waiting and **enters Reincarnation**. It is not initial Death, ordinary Revive, waiting creation or revival of the previous body. Existing World waiting/Death Cohort/Revive race remains REC-001/004/020.

A router requires its owning Pygmalion **ALIVE AND Field Present in the routing Combat Instance**. A surviving empty Puppet with absent/dead owner cannot newly receive Chân Ngã through that router.

A Puppet keeps the creator's Side at its creation. Incoming Chân Ngã does not flip it.

Build eligible Pygmalion owners under that availability rule. If owners are present on **both opposing Sides**, use only hosts of an owner whose Side matches the entrant's **death-record Side**. If eligible owners exist on **only one Side**, its router can accept entrants from either Side. Host scarcity does not silently redefine the two-Side owner rule; then select among currently eligible hosts within its allowed owner/Side scope.

### 4.2 Luân Hồi Chi Chủ blocker

A Luân Hồi Chi Chủ incarnation **ALIVE AND Field Present in that Combat Instance** blocks this routing regardless of alliance. Confirmed death or true field leave removes the blocker; a legitimate later field reentry restores it. VFX absence/non-targetability is not LEAVE_FIELD. Ordinary presence/lifecycle provides the authoritative view.

### 4.3 Complete entrant set and local permutation

If multiple Chân Ngã reach this routing checkpoint together, form the **complete eligible entrant set** and bind **one deterministic seeded permutation local to this checkpoint**. Process entries in that frozen order. Entity/Slot/Event/list order supplies no gameplay priority. This is not a global Reincarnation/Reaction priority or Thespis's death-entry order.

For each entrant:

1. Query current eligible EMPTY Puppets under §§4.1–4.2.
2. Seeded RANDOM select one eligible host.
3. Reserve that host.
4. Build/freeze its exact Definition pool under §4.4.
5. Make one seeded uniform definition draw and freeze the selection.
6. Validate and commit identity/definition binding and any required materialization.

Later entrants read the world after earlier route commits. Reservations prohibit double-binding a host or True Self; body/identity/definition/capability changes share a coherent protected commit. A host already on the field does not acquire a synthetic field-entry transition.

No host, empty definition pool, stale reservation, invalid selected host or invalid selected definition means **local route failure**. Release uncommitted reservation; **no reroll, replacement host or retry token**. The entrant continues ordinary Reincarnation exit unless another separately legal kit/system intercepts it. Do not hold it in limbo. This kit-local rule grants no priority over independent routers without their actual governing law.

### 4.4 Uniform base-roster lottery and exact exclusions

Use canonical roster/base **Character Definition identity**, with candidate **Rank = selected Puppet Rank**, and **UNIFORM** weighting among every eligible candidate. FORM is not another lottery entry; only an independently registered roster Character Definition is independent.

At that route's pool checkpoint, exclude definitions currently represented anywhere in either Side's:

- Deck;
- active Field;
- current ordinary waiting entries;
- inhabited Puppet/current inherited kit.

Also exclude the entrant's **IMMEDIATELY PREVIOUS LIFE Character Definition**. Older lives are not permanently banned. A completed-Reincarnation life with no current Deck/Field/waiting/inhabited representation may be eligible again; mere archived history does not create membership.

Build/filter full pool → freeze candidate set → uniform seeded draw → freeze chosen definition → protected route commit. No hidden reroll after invalidation. Later routes rebuild after earlier commits: a newly inhabited definition can exclude that same candidate from the next route.

## 5. Full-kit binding without body/state cloning

The routed Chân Ngã remains that Chân Ngã, distinct from the lottery definition's original author identity. Reincarnation/new life follows its identity transition; ordinary Revive does not masquerade as that transition.

Preserve Puppet body/appearance, host MaxHP/stat basis, **CurrentHP**, **Current Rage**, **Max Rage100** and legitimate existing host States under their own retention rules. Receiving a kit is **not Heal, Revive, ENTER_FIELD, DEPLOY_FROM_DECK or BATTLE_START**.

Use inherited Basic/Skills/Ultimate/Passive/explicit clauses. **Effective Class is inherited; Element is not**: keep the host Element profile. Inherited action motion/effects/voice follow raw; appearance remains Puppet. Subsequent kit-authored stat/Rage-limit/resource modifications may operate normally; preserving initialization does not prevent those effects.

New actor-owned definition state—counters, cooldowns, charges, private resources, battle-use allowances and other required fields—starts at ordinary fresh/default values for **this Puppet**. Import no historical live values from the previous corpse, roster author or another instance. Shared world/team state is read currently and is not reset.

Register inherited Passive behavior immediately. Always-on/current-condition rules can function from that point. Do not replay entry/deployment/battle-start triggers unless that kit explicitly supports definition-acquisition/Reincarnation activation; emit no synthetic event.

Binding and capability rebuild belong to the receiving actor. Each attack independently preserves its own authored pattern/binding/checkpoints. Full kit does not turn into Character cloning or Thespis's restricted Basic projection. Rank/lore/creator ownership grants no extra Authority; exact inherited clauses retain their declared Adjudication Owner profiles.

## 6. Puppet Death and ordinary Revive

**Empty Puppet:** raw-authored DEATH_CONFIRMED removes the body, without Chân Ngã waiting/counting or ordinary Revive entitlement. It may satisfy a Puppet-death listener; it is not Summon death merely because the actor was created. Removing an empty blocker exposes only a currently unused owner quota under §2.

**Inhabited Puppet:** DEATH_CONFIRMED removes active body presence and creates ordinary waiting for its hosted Chân Ngã. Preserve host relation, basis and inherited definition in the death/Revive record. Before Reincarnation, eligible ordinary Revive restores **same Puppet-life, same trueSelfId, same lifeSerial, same inherited definition**. No random rerouting/new kit/new creator snapshot.

After that Chân Ngã enters Reincarnation, old Puppet-life ordinary Revive is invalid. A later legitimate route may inhabit another host/new life. Inherited self-Revive follows its actual eligibility/restore law. Current-stat retention and resources/HP/position restoration follow the target kit and generic Revive policy, not an invented universal percentage/reset.

Owner death/leave remains independent of these Puppet terminal causes.

## 7. Pygmalion Actions

### 7.1 Own Basic

One enemy, one attack/one hit: **PHYSICAL100% ATK + WILL100% WIL**, no secondary Effect. Ordinary TGT-008 POSITION/SLOT default.

### 7.2 Skill1 — Chisel Away the Afterlife / Đục Mòn Cõi Luân Hồi

Required **25 Side AE + requested HP Cost50% Pygmalion MaxHP**. Existing required-payment/nonlethal CST-001/003 defaults remain: HP Cost leaves minimum1HP and is not Damage/HP Loss/Shield absorption/Reflect/Lifesteal. No lethal override or successful-shortfall policy is inferred.

Affected value is **BATTLE-GLOBAL BASE Reincarnation waiting threshold**, initially4 unless another explicit global rule changes it. Each successful reduction subtracts1 with **floor1**, persists until battle end and stacks across casts/owners/both Sides.

Admission requires **current base >1 BEFORE payment**, then validate required AE/HP → atomically pay → reduce base. Base1 rejects activation without debit. Generic Cost/failure/Effect admission remains authoritative; no automatic post-payment refund.

Compose with valid live contributions/modifiers **after** the base:

`effectiveThreshold = currentBaseThreshold + validLiveContributions/modifiers`

Example: base4 + Nephthys2 =6; Skill1 gives base3 +2 =5. Do not subtract an already-computed effective value or make a Side-local window.

Base change immediately re-evaluates **ALL current waiting entries** against the coherent effective threshold, preserving death progress/history. Every newly qualified entry proceeds through ordinary Reincarnation/routing; no fake deaths/progress reset/quota/tie winner. Existing complete Death Cohort semantics and mandatory-before-ordinary-Revive boundary remain applicable.

### 7.3 Skill2 — Carve the Imperfect / Khắc Gọt Kẻ Bất Toàn

Required **20 Side AE** before activation. One enemy, **one hit**: **PHYSICAL150% ATK + WILL130% WIL**.

Successful Cost immediately grants one self defense Buff **before Damage**:

- live ARM multiplier **1.15**;
- live RES multiplier **1.07**.

Exclude the same source-family contribution from its own stat baseline; no recursive stat growth or flat percentage-point interpretation.

One Skill2 defense family per actor. Recast **REPLACE/REFRESH**, no self stacking. Successful refresh wins same-checkpoint old expiry without a transient remove/recreate gap.

The granting Natural Action does not consume new duration. Expire at the end/consumption of the actor's **NEXT Natural Action opportunity**, before following TURN_BOUNDARY. CLK-003 **CC-lost opportunity counts**; non-Natural Actions do not. **DEATH_CONFIRMED or LEAVE_FIELD clears it**; later Revive/redeploy does not restore that old Buff.

### 7.4 Ultimate — At My Gesture, Every Form Moves / Theo Một Cử Chỉ, Vạn Hình Chuyển Động

Ordinary root Ultimate Cost/readiness applies. At Ultimate start freeze eligible owned Puppet **identities**, and schedule one real Basic child for **Pygmalion + every listed Puppet**. New hosts do not join.

Use **one local deterministic seeded permutation across all scheduled actors INCLUDING Pygmalion**. He has no always-first priority. Freeze this order; never replace an invalid/dead scheduled actor.

Execute sequentially as **one local Ultimate direct-action window**:

`validate actor → pin its CURRENT Basic at child start → resolve child and required root-linked/local settlements → mandatory lifecycle → next scheduled child`

Ordinary unrelated Reactions remain held until the entire coordinated direct sequence and every scheduled child are terminal. Mandatory lifecycle is never held. This is a local profile, not a universal multiple-child rule; presentation may animate together.

Each child is **real BASIC_ATTACK, non-Natural**; Puppet children use FOLLOW_UP. Pin the Basic at that child's own start: a legitimate earlier definition change may supply its new Basic, while mutation after pin cannot rewrite the started child.

Each Basic uses **its own authored stat read/snapshot policy at child start** and independently resolves its own selection/pattern/binding/geometry. Ordinary Slot Basic, explicit Entity-tracking, AoE and seeded random Basic retain those meanings. **No common target, Pygmalion target anchor, shared creator stat snapshot or inherited parent binding**.

Waive **only the requested Basic child's own Cost**. Do not waive independent triggered/local-settlement/nested costs unless their exact governing policy says so. Generic non-Natural law grants no class Action AE/Rage merely for executing; explicit kit effects remain legitimate.

After the admitted Ultimate creates the schedule, later Pygmalion invalidity does not cancel already-scheduled valid Puppet children. Skip his own child if he is invalid before it begins. Each remaining Puppet/source branch obeys its own validity; already committed results stay committed.

For Puppet children:

| Axis | Value |
| --- | --- |
| Actor | That Puppet |
| Behavior Source | Its pinned current inherited definition, or own minimal definition when empty |
| Direct attack Damage Attribution | Pygmalion |
| Inherited secondary source/attribution | Immediate Puppet/Effect source unless explicitly overridden |
| Authority adjudication | Exact inherited clause's declared owner/profile |

Retain full Basic secondary behavior; rootActionId does not turn secondary/child results into root-owned direct Effects. Damage credit does not transfer Passive identity or Authority.

## 8. Declarative normalization bindings

| Semantic owner | Tags / resolved facets / existing composition |
| --- | --- |
| Own Basic / Skill2 hit | DAMAGE on that hit, PHYSICAL_DAMAGE/WILL_DAMAGE on matching components; one hit, independent TGT-008 Slot default |
| Empty definition | Own BASIC_ATTACK and Rage-paid ULTIMATE root → one real non-Natural Basic child; root identity is not a Functional Tag |
| First creation basis | TRG-014 static participant initialization → P-002 immutable BATTLE_START basis; no field-entry recapture |
| Creation / quota | P-051 + P-084 joined success under RES-005; independent kit-cycle State marker, current EMPTY blocker, ordinary Mode placement |
| Current host / owner / Side query | Existing typed Target/Presence/relation/identity filters and current death-record Side; no lore-derived Authority |
| Reincarnation base reduction | REINCARNATION owner, 04§30.2 → existing world-ledger Effect/System plan/P-021 authorized base-field write/P-066 entry, REC-001/004/020; protected Cost guard, battle lifetime, all-entry re-evaluation |
| Complete entrant routing | REINCARNATION route owner, 04§30.3 / REC-006/007; checkpoint-local seeded permutation, per-entry current host reservation/definition pool/commit |
| Full-kit binding | COMBAT_DEFINITION_INHERITANCE, P-082/083 and 04§31 dimension policies; preserve host, fresh new actor state, no synthetic lifecycle events |
| Skill2 defense State | BUFF on self State, STAT_MODIFIER on ARM/RES contributions, MULTIPLY ARM/RES, RES-007 EXCLUDE_THIS_SOURCE_FAMILY; single-family REPLACE/REFRESH and CLK-003 next consumed opportunity, death/leave cleanup |
| Coordinated Ultimate | Finite RequestAction expansion over frozen seeded actor list; own child identity/cost/target/snapshot/attribution/Authority; root SEQUENTIAL + AFTER_DIRECT_EFFECTS_COMPLETE under RES-003 |
| Puppet lifecycle | PUPPET distinct from SUMMON, ENT-008/010, REV-003 and ordinary identity/Revive retention; owner absence does not remove body |

The Ultimate's root-owned window waits for its scheduled child work and required local settlements; child-local completion is not root-window completion. Its independent source validity lets scheduled valid Puppets continue after creator invalidity. Definition, stat-read and target policies bind at each child's own start, rather than at the actor-list snapshot. These are explicit Character declarations on existing Action/Resolution policy fields.

## 9. UNRESOLVED / NOT BLOCKING

Rank/Class/native Element, full numeric budget/Base Deployment Cost, empty-host metadata/rank-scaling registry and future Mode adaptations remain unspecified. They do not reopen Q1–Q10.

A future external inherited definition requiring unsupported explicit actor/identity/resource/Authority semantics needs its actual later binding/profile; do not pre-approve callbacks, guess translation or reset shared state. Current locked gameplay is complete; numeric roster execution still requires its ordinary metadata.
