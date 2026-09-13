# ARCLUNE — PRIMITIVE REGISTRY
## Chặng D — Executable Building Blocks for Kernel Runtime
**Version:** 2026-09-10-D  
**Status:** Working Canonical Candidate  
**Depends on:** `01_TERMINOLOGY_vNext.md`, `02_TAG_vNext.md`, `00_CANONICAL_RECOVERY_AUDIT.md`  
**Primary stress tests:** SSR Warrior True Damage/Overheal/Turn Boundary; Hoá Thân Ký Ức Chi Chủ; Luân Hồi Chi Chủ; Cố Sự Chi Thần; Pygmalion current rules.  
**Scope:** executable operations and resolver operations. This file does **not** finalize Ability Schema, event ordering, SSI timing, same-tier Authority, or full Contract behavior.

---

# 0. EXECUTIVE RULE

Arclune follows:

> **AI khai báo kit bằng semantic + composition; Kernel thực thi bằng Primitive.**

Equivalent architectural rule:

> **Character = data/composition. Kernel = behavior/runtime.**

A Primitive is an executable building block, but:

> **Primitive ≠ Tag.**

and:

> **Primitive ≠ Contract.**

A Tag answers:
> “semantic capability/effect này là gì?”

A Primitive answers:
> “Kernel thực hiện operation nào?”

A Contract answers:
> “operation đó resolve chính xác theo timing/order/invariant nào?”

Therefore:

> **Tag ↔ Primitive is many-to-many.**

No rule in this file may be read as:
> “one Tag must map to one Primitive.”

---

# 1. WHY PRIMITIVE REGISTRY EXISTS

Without a Primitive layer, Arclune risks two bad architectures.

## Failure A — Character-specific code

```text
if character == Pygmalion:
    ...
elif character == MemoryGod:
    ...
elif character == ReincarnationLord:
    ...
```

This does not scale to hundreds of kits and creates hidden semantic duplication.

## Failure B — Tag becomes programming language

```text
TRUE_DAMAGE
TARGET_3_RANDOM
THEN_HEAL_25_PERCENT
AFTER_DEATH_REVIVE
...
```

This turns Tag Registry into pseudo-code and destroys semantic stability.

Primitive Registry exists between semantic declaration and Kernel implementation:

```text
Ability Data
    ↓
Effect / Action Spec
    ↓
Canonical Primitive Requests
    ↓
Contract-governed Kernel Runtime
    ↓
State Delta / Event / Lifecycle Result
```

---

# 2. WHAT A PRIMITIVE IS

A Primitive is a canonical executable operation with:

- a stable ID;
- a narrow responsibility;
- typed inputs;
- typed outputs;
- explicit state-mutation rights;
- explicit atomicity expectation;
- explicit Contract dependencies;
- no Character-specific name;
- no lore-specific implementation unless it is a genuine system gateway;
- deterministic behavior given authoritative state, input and RNG stream.

Primitive is **not** required to be mathematically tiny.

For example:

`RESOLVE_DAMAGE_PACKET`

may call the Damage Contract internally to process:
- damage type;
- mitigation;
- penetration;
- reduction;
- Shield interaction;

without exposing arithmetic micro-primitives such as:

- ADD
- MULTIPLY
- SUBTRACT_ARM
- IF_TRUE_DAMAGE
- IF_SHIELD

Those arithmetic operations belong to formula/runtime implementation, not Primitive Registry.

---

# 3. PRIMITIVE EXPOSURE CLASSES

Every Primitive belongs to one exposure class.

## 3.1 `EFFECT_PRIMITIVE`

May be requested by normalized Ability/Effect data.

Examples:
- `MODIFY_RESOURCE`
- `APPLY_HP_LOSS`
- `MUTATE_POSITION`
- `REQUEST_ACTION`

A designer/AI does not necessarily write the raw Primitive ID manually; Ability Schema/compiler can normalize semantic effect data into it.

---

## 3.2 `RESOLVER_PRIMITIVE`

Kernel-internal operation used to resolve declarative specs.

Examples:
- `BUILD_CANDIDATE_POOL`
- `RESOLVE_DAMAGE_PACKET`
- `VALIDATE_COST`

Normally not authored as an “effect” by a Character.

---

## 3.3 `LIFECYCLE_PRIMITIVE`

Privileged operation modifying life/death/presence/identity states.

Examples:
- `CONFIRM_DEATH`
- `ENTER_REINCARNATION`
- `MATERIALIZE_ENTITY`

Ordinary kit data cannot call these without a semantic effect/system permission that Contract validates.

---

## 3.4 `SYSTEM_GATEWAY_PRIMITIVE`

Boundary operation into a real subsystem whose internal state machine is larger than one generic effect.

Examples:
- Arena Combat Instance.
- Narrative System.
- Reincarnation Routing.
- Quang Ảnh history.

This does not mean “hardcode Character”.
It means:
> the mechanic is legitimately system-level.

---

## 3.5 `QUERY_PRIMITIVE`

Read-only normalized query used by Ability/System logic.

Examples:
- `QUERY_CAPABILITY`
- snapshot reads.

It cannot mutate authoritative state.

---

# 4. STANDARD PRIMITIVE ENTRY FIELDS

Every Primitive entry in this registry uses these fields:

**ID:** stable canonical Primitive ID.  
**Class:** exposure class.  
**Purpose:** one primary responsibility.  
**Inputs:** typed semantic inputs.  
**Outputs:** typed result/reference.  
**State Mutation:** what authoritative state it may mutate.  
**Atomicity:** expected observable/commit boundary.  
**Contract Dependencies:** Contracts required to fully define behavior.  
**Tag Relationship:** examples of Tags that commonly compile/use this Primitive; never a 1:1 mapping rule.  
**Does Not Do:** responsibilities explicitly outside the Primitive.

---

# 5. CANONICAL RUNTIME VALUE / REFERENCE TYPES

These are not Primitive IDs. They are common typed values used between Primitives.

## 5.1 `EntityRef`

Stable reference to a Runtime Entity in a Combat Instance.

Must distinguish:
- current iid;
- entity lifecycle state;
- Combat Instance scope.

---

## 5.2 `ActionRef`

Reference to a runtime Action Instance.

Can expose:
- actionInstanceId;
- parentActionRef;
- actor;
- Ability Type;
- Action Identity;
- Action Behavior.

---

## 5.3 `SnapshotRef`

Immutable reference to a captured state snapshot.

Snapshot scope and fields are declared by SnapshotSpec.

---

## 5.4 `CandidatePoolRef`

Immutable or versioned set of candidate references before final Target Selection.

---

## 5.5 `TargetSetRef`

Resolved target identities/positions for a specific selection point.

A TargetSetRef can be reused for Target Lock semantics.

---

## 5.6 `StateRef`

Reference to a persistent State Instance.

Examples:
- Buff.
- Debuff.
- Mark.
- immunity state.
- Airborne state.
- Position Mark.
- Field state.

---

## 5.7 `DamagePacketRef`

Reference to an unresolved or partially-resolved Damage Packet.

---

## 5.8 `DamageResultRef`

Resolved damage outcome before or after commit, including fields such as:

- target;
- resolved amount;
- shield absorbed amount;
- Actual HP Damage;
- Overkill;
- lethal candidate;
- component identity;
- source/attribution.

Exact fields belong to Damage Contract/Schema.

---

## 5.9 `DamageAggregateRef`

Aggregation result over multiple DamageResultRefs.

Can group by:
- Action;
- target;
- source;
- component;
- attribution.

Used by mechanics such as:
- “50% Actual HP Damage this Action”.
- “heal 20% total Actual HP Damage dealt by Ultimate”.

---

## 5.10 `HealResultRef`

Resolved healing outcome containing at least:
- requested healing;
- actual Current HP restored;
- Overheal;
- target.

---

## 5.11 `CostResultRef`

Validation/payment result for CostSpec.

---

## 5.12 `StateDelta`

Typed proposed or committed authoritative mutation.

Used internally by transaction/commit services.

---

## 5.13 `CombatInstanceRef`

Reference to Main Battle, Arena or another isolated Combat Instance.

---

## 5.14 `StoryRef`

Reference to Narrative Story Instance.

---

## 5.15 `PropertyRef`

Reference to a realized/system property with source, owner, authority and lifecycle metadata.

---

# 6. NON-PRIMITIVE KERNEL SERVICES

The following are required runtime services but are **not Canonical Primitives** in this version.

This boundary prevents Primitive Registry from becoming the entire engine.

## 6.1 Expression / Formula Evaluator

Handles:
- `100% ATK`;
- `50% Actual HP Damage`;
- threshold expressions;
- Rank-based formulas;
- stat references.

Do not create arithmetic Primitives such as `ADD`, `MULTIPLY`, `DIVIDE`.

---

## 6.2 Event Dispatcher

Publishes Events emitted by state/action/lifecycle resolution.

Event names and ordering belong to Contracts/Kernel Runtime.

Primitives may cause Events to be emitted as consequences, but ordinary Character data should not fabricate arbitrary low-level engine Events.

---

## 6.3 Trigger Matcher / Trigger Scheduler

Matches TriggerSpec against Events/state and schedules eligible reactions.

`AUTO_TRIGGER`, `DAMAGE_TRIGGER`, `DEATH_TRIGGER`, etc. are not separate execution Primitives.

---

## 6.4 Action Scheduler

Owns:
- action queue/stack;
- parent/child ordering;
- interrupt windows;
- Follow-up/Counter/Forced Action scheduling;
- SSI pointer interaction.

`REQUEST_ACTION` asks the scheduler to create/schedule an Action; it does not itself redefine SSI.

---

## 6.5 Authority Resolver

Applies Authority Contract:
- Normal < Pháp Tắc < Quy Tắc < Axiom;
- dynamic authority;
- explicit exceptions;
- same-tier rules once canonicalized.

Primitives call the resolver when an effect conflict requires it.

---

## 6.6 Deterministic RNG Service

Provides seeded deterministic random draws.

Target selection, random definition choice, spawn position, etc. use this service through their resolver Primitive.

---

## 6.7 Transaction / Commit Service

Owns proposed StateDelta batching and commit visibility.

Necessary for simultaneous resolution.

`COMMIT_DAMAGE_RESULT` and other mutation Primitives submit/commit typed changes under current transaction scope; they do not define global reaction ordering themselves.

---

## 6.8 Execution Trace Writer

Records:
- action;
- primitive;
- input;
- output;
- state delta;
- RNG;
- authority;
- attribution;
- lifecycle.

All Canonical Primitives must be traceable.

---

# 7. ACTION / EXECUTION PRIMITIVES

## P-001 — REQUEST_ACTION

**ID:** `REQUEST_ACTION`  
**Class:** EFFECT_PRIMITIVE  
**Purpose:** Request creation/scheduling of a new Action Instance for a specified Actor under an explicit Action Identity/Action Behavior relationship.  
**Inputs:** Actor `EntityRef`; Ability/Action reference; `ActionBehavior`; optional parent `ActionRef`; target/snapshot inheritance policy; cost policy; authority policy; attribution override if allowed.  
**Outputs:** Action request result and, if accepted, new `ActionRef`.  
**State Mutation:** Does not directly mutate combat stats/HP; submits an Action to Action Scheduler.  
**Atomicity:** Request acceptance/rejection is atomic; the requested Action resolves later under scheduler rules.  
**Contract Dependencies:** Action Lifecycle Contract; SSI Contract; Composite Action Contract; Cost Contract; Authority Inheritance Contract.  
**Tag Relationship:** Commonly used by effects whose eventual child Action may carry `DAMAGE`, `HEAL`, etc.; Action Behavior such as FOLLOW_UP/COUNTER/FORCED_ACTION is a Schema facet, not a Tag.  
**Does Not Do:** Does not automatically consume Natural Action; does not advance SSI pointer; does not assume child is Basic Attack; does not decide child authority globally.

### Architectural reason
One generic action-request operation replaces separate executable primitives such as:
- `ScheduleFollowUp`;
- `ScheduleCounter`;
- `ForceBasicAttack`;
- `LinkedCast`.

Those distinctions remain in `ActionBehavior` and child Action data.

---

## P-002 — CAPTURE_SNAPSHOT

**ID:** `CAPTURE_SNAPSHOT`  
**Class:** EFFECT_PRIMITIVE / RESOLVER_PRIMITIVE  
**Purpose:** Capture an immutable declared subset of authoritative state at a specified resolution point.  
**Inputs:** Snapshot scope; entity/target/position references; field selector; snapshot timing marker; owner/action lineage.  
**Outputs:** `SnapshotRef`.  
**State Mutation:** None to gameplay state; may append transient snapshot data to Action/runtime storage.  
**Atomicity:** Captures all selected fields from one authoritative state version.  
**Contract Dependencies:** Snapshot Contract; Action Contract; Identity Contract.  
**Tag Relationship:** Not tied to one Tag. Supports `DAMAGE`, `REVIVE`, `COMBAT_DEFINITION_INHERITANCE`, time mechanics, threshold logic and many others.  
**Does Not Do:** Does not automatically restore state; does not copy unspecified Buff/Debuff/Mark objects; does not decide which fields a Character “should remember”.

### Required capabilities
SnapshotSpec must be able to distinguish:
- source snapshot;
- target snapshot;
- stat snapshot;
- entrance snapshot;
- shared Action snapshot;
- full Combat Instance snapshot.

---

## P-003 — RESTORE_SNAPSHOT

**ID:** `RESTORE_SNAPSHOT`  
**Class:** SYSTEM_GATEWAY_PRIMITIVE  
**Purpose:** Restore explicitly selected authoritative state fields from a valid historical/transient SnapshotRef.  
**Inputs:** `SnapshotRef`; restore scope; entity mapping policy; field whitelist; identity/lifecycle policy; authority.  
**Outputs:** Restore result + committed/proposed StateDelta set.  
**State Mutation:** May mutate selected current state fields according to restore scope.  
**Atomicity:** Restore set must commit atomically at the declared regression scope unless Contract explicitly allows staged restore.  
**Contract Dependencies:** Regression Contract; Identity Contract; Death/Lifecycle Contract; Snapshot Contract; Authority Contract.  
**Tag Relationship:** No dedicated Functional Tag is required merely because a mechanic restores history. Time/Axiom system metadata may describe the capability.  
**Does Not Do:** Does not automatically rewind Event history, RNG history, Action Scheduler, or every field in Snapshot; does not recreate erased identities unless Contract authorizes it.

---

# 8. TARGET RESOLVER PRIMITIVES

## P-010 — BUILD_CANDIDATE_POOL

**ID:** `BUILD_CANDIDATE_POOL`  
**Class:** RESOLVER_PRIMITIVE  
**Purpose:** Construct the initial Candidate Pool from declared target kind/relation and Combat Instance scope.  
**Inputs:** TargetSpec; reference Actor/Side; Combat Instance; target kind; initial presence/life constraints.  
**Outputs:** `CandidatePoolRef`.  
**State Mutation:** None.  
**Atomicity:** Read-only against one authoritative state version or declared SnapshotRef.  
**Contract Dependencies:** Target Selection Contract; Side/Relation Contract; Lifecycle Presence Contract.  
**Tag Relationship:** Does not need `TARGET_SELF`, `TARGET_ALLY`, `TARGET_ENEMY` Tags; those are TargetSpec facets.  
**Does Not Do:** Does not choose final targets; does not apply custom filters; does not resolve Geometry.

---

## P-011 — FILTER_CANDIDATE_POOL

**ID:** `FILTER_CANDIDATE_POOL`  
**Class:** RESOLVER_PRIMITIVE  
**Purpose:** Apply deterministic eligibility filters to a Candidate Pool.  
**Inputs:** `CandidatePoolRef`; filter predicates; reference Actor; capability requirements; state/identity/Rank/Class/Axiom constraints.  
**Outputs:** filtered `CandidatePoolRef` + exclusion reasons for trace.  
**State Mutation:** None.  
**Atomicity:** Read-only over the declared state/snapshot.  
**Contract Dependencies:** Target Filter Contract; Capability Query Contract; Authority/System eligibility Contracts where relevant.  
**Tag Relationship:** Observes semantics such as `TARGET_EXCLUSION`, but does not require a “TARGET_SELECTION” Tag.  
**Does Not Do:** Does not select among remaining candidates; does not remove filtered entities from battlefield; does not treat Target Exclusion as AoE immunity.

---

## P-012 — SELECT_TARGETS

**ID:** `SELECT_TARGETS`  
**Class:** RESOLVER_PRIMITIVE  
**Purpose:** Select final target identities/positions from an eligible Candidate Pool using declared selection rule.  
**Inputs:** filtered Candidate Pool; selection rule; count; ordering; duplicate policy; deterministic RNG stream if random.  
**Outputs:** `TargetSetRef`.  
**State Mutation:** None.  
**Atomicity:** Selection is resolved against one declared pool/state version.  
**Contract Dependencies:** Target Selection Contract; Deterministic RNG Contract.  
**Tag Relationship:** Replaces need for Tags such as `AOE_RANDOM` or `TARGET_SELECTION`.  
**Does Not Do:** Does not resolve Area Geometry; does not automatically reroll invalid targets later; does not imply Action is AoE.

---

## P-013 — RESOLVE_AREA

**ID:** `RESOLVE_AREA`  
**Class:** RESOLVER_PRIMITIVE  
**Purpose:** Resolve a declared Geometry/area into affected entities/positions.  
**Inputs:** GeometrySpec; origin/reference Position; Combat Instance; optional SnapshotRef; inclusion/exclusion rules.  
**Outputs:** `TargetSetRef` or area result set.  
**State Mutation:** None.  
**Atomicity:** Geometry evaluation uses one declared state/snapshot.  
**Contract Dependencies:** Area Resolution Contract; Position Contract.  
**Tag Relationship:** No `AOE_FIXED` Tag required; Geometry is a Schema facet.  
**Does Not Do:** Does not direct-target each entity; does not apply direct Target Exclusion unless Area Contract explicitly says so; does not cause Damage itself.

### Critical invariant
An Actor excluded from direct Target Selection can still appear in `RESOLVE_AREA` output if its Position lies inside the area.

---

## P-014 — VALIDATE_TARGET_SET

**ID:** `VALIDATE_TARGET_SET`  
**Class:** RESOLVER_PRIMITIVE  
**Purpose:** Validate previously selected/locked target references at a later resolution point under an explicit validity policy.  
**Inputs:** `TargetSetRef`; validity rules; current state or SnapshotRef; invalid-target policy.  
**Outputs:** valid/invalid target results with reasons.  
**State Mutation:** None.  
**Atomicity:** Read-only.  
**Contract Dependencies:** Target Lock/Re-query Contract; Lifecycle Contract.  
**Tag Relationship:** No direct Tag mapping.  
**Does Not Do:** Does not automatically reroll; does not silently replace dead targets; does not re-run selection unless caller/Contract requests a new selection pipeline.

---

# 9. STATE PRIMITIVES

## P-020 — CREATE_STATE_INSTANCE

**ID:** `CREATE_STATE_INSTANCE`  
**Class:** EFFECT_PRIMITIVE  
**Purpose:** Create a persistent or temporary State Instance attached to an allowed semantic owner.  
**Inputs:** State definition/identity; attachment kind; target Entity/Position/Battlefield/Object; source/owner/attribution; duration; Authority; parameters.  
**Outputs:** `StateRef` or rejection result.  
**State Mutation:** Adds a State Instance after admission/authority checks.  
**Atomicity:** State creation is atomic.  
**Contract Dependencies:** State Contract; Status Contract; Duration Contract; Effect Admission Contract; Authority Contract.  
**Tag Relationship:** Can implement semantic states associated with `BUFF`, `DEBUFF`, `MARK`, `IMMUNITY`, `AIRBORNE`, `POSITION_MARK`, `FIELD`, `TARGET_EXCLUSION`.  
**Does Not Do:** Does not infer State type from positive/negative numbers; does not automatically mark every harmful state `DEBUFF`; does not decide presentation.

### Attachment kinds
At minimum the state model must support:
- ENTITY;
- POSITION;
- BATTLEFIELD/COMBAT_INSTANCE;
- COMBAT_OBJECT;
- SYSTEM_INSTANCE where justified.

This allows:
- Actor Mark and Position Mark to share a state engine without sharing semantic identity;
- Field to exist without becoming a Summon.

---

## P-021 — MODIFY_STATE_INSTANCE

**ID:** `MODIFY_STATE_INSTANCE`  
**Class:** EFFECT_PRIMITIVE  
**Purpose:** Modify allowed fields/stacks/duration/parameters of an existing State Instance.  
**Inputs:** `StateRef`; mutation spec; source/authority; expected identity/version.  
**Outputs:** modified StateRef/result.  
**State Mutation:** Updates only fields allowed by State Contract.  
**Atomicity:** One State Instance mutation is atomic.  
**Contract Dependencies:** State Contract; Stack/Duration Contract; Authority Contract.  
**Tag Relationship:** May support `BUFF`, `DEBUFF`, `MARK`, `IMMUNITY`, `FIELD`, etc.  
**Does Not Do:** Does not replace State identity unless transition explicitly allows it; does not bypass Authority merely because same owner created the state.

---

## P-022 — REMOVE_STATE_INSTANCE

**ID:** `REMOVE_STATE_INSTANCE`  
**Class:** EFFECT_PRIMITIVE  
**Purpose:** Remove an eligible existing State Instance.  
**Inputs:** `StateRef` or state filter; removal reason; source; Authority; removal limit/order.  
**Outputs:** removed StateRefs/result.  
**State Mutation:** Removes qualifying State Instances.  
**Atomicity:** Removal set is atomic within declared effect scope.  
**Contract Dependencies:** State Removal Contract; Cleanse Contract; Authority Contract.  
**Tag Relationship:** `DEBUFF_CLEANSE` commonly compiles to state filtering + this Primitive; `MARK`, `BUFF`, `DEBUFF` removal also may use it.  
**Does Not Do:** Does not create immunity; does not remove non-eligible states; does not assume every Mark is a Debuff.

### Architecture example
`DEBUFF_CLEANSE` does not require a custom `CLEANSE_DEBUFF_PRIMITIVE`.

Composition can be:
1. filter state instances where identity/category = eligible Debuff;
2. `REMOVE_STATE_INSTANCE`.

---

# 10. STAT / RESOURCE / COST PRIMITIVES

## P-030 — MODIFY_STAT

**ID:** `MODIFY_STAT`  
**Class:** EFFECT_PRIMITIVE  
**Purpose:** Apply a declared stat modification to a target stat layer.  
**Inputs:** target; stat key; operation/magnitude; layer; duration/owner if persistent; source; Authority.  
**Outputs:** stat modification result / modifier reference if persistent.  
**State Mutation:** Changes stat contribution/current derived state according to Stat Contract.  
**Atomicity:** All stat fields declared in one modifier effect can commit atomically.  
**Contract Dependencies:** Stat Layer Contract; Modifier Contract; Duration Contract; Authority Contract.  
**Tag Relationship:** Typically implements `STAT_MODIFIER`.  
**Does Not Do:** Does not handle Max HP reconciliation when changing HP capacity; use `MUTATE_MAX_HP`. Does not classify result as Buff/Debuff automatically.

---

## P-031 — MUTATE_MAX_HP

**ID:** `MUTATE_MAX_HP`  
**Class:** EFFECT_PRIMITIVE  
**Purpose:** Apply a Max HP capacity mutation with explicit lifecycle and reconciliation semantics.  
**Inputs:** target; mutation formula/value; stacking/baseline policy; duration; source; Authority; reconciliation policy.  
**Outputs:** mutation handle/result; old/new Current Max HP; reconciliation request/result.  
**State Mutation:** Changes Max HP/current Max HP contribution.  
**Atomicity:** Capacity mutation and required Current HP reconciliation belong to the same health transaction unless Contract explicitly splits them.  
**Contract Dependencies:** Max HP Mutation Contract; Health Reconciliation Contract; Stat Contract.  
**Tag Relationship:** Implements `MAX_HP_MUTATION`.  
**Does Not Do:** Does not Heal by default; does not count as Damage; does not silently preserve HP percentage unless Contract says so.

### Required use cases
- SSR Warrior `Current Max HP × 102%`.
- Luân Hồi Chi Chủ temporary `-20% Max HP`.
- Skill 2 temporary `+5% Max HP`.
- inherited-life Max HP decay.

---

## P-032 — RECONCILE_CURRENT_HP

**ID:** `RECONCILE_CURRENT_HP`  
**Class:** RESOLVER_PRIMITIVE  
**Purpose:** Reconcile Current HP after a Max HP capacity change without inventing Heal/Damage semantics.  
**Inputs:** old/new Max HP; Current HP; reconciliation policy; mutation cause.  
**Outputs:** new Current HP + reconciliation metadata.  
**State Mutation:** May adjust Current HP solely as a consequence of capacity rules.  
**Atomicity:** Usually part of the same transaction as `MUTATE_MAX_HP`.  
**Contract Dependencies:** Health Reconciliation Contract.  
**Tag Relationship:** No independent Tag; supports `MAX_HP_MUTATION`.  
**Does Not Do:** Does not emit Heal merely because Current HP rises due to explicit return policy; does not emit Damage when Current HP is clamped unless Contract explicitly classifies it otherwise.

---

## P-033 — MODIFY_RESOURCE

**ID:** `MODIFY_RESOURCE`  
**Class:** EFFECT_PRIMITIVE  
**Purpose:** Increase, decrease, set, transfer or modify a Resource Pool outside Cost payment semantics.  
**Inputs:** Resource Pool; operation; amount/formula; source; cap/overflow policy; attribution.  
**Outputs:** resource delta/result.  
**State Mutation:** Mutates Resource Pool.  
**Atomicity:** Resource mutation is atomic per declared pool set.  
**Contract Dependencies:** Resource Contract; Pool Ownership Contract.  
**Tag Relationship:** Implements `RESOURCE_MODIFIER`.  
**Does Not Do:** Does not validate/pay Action Cost; does not assume AE is always Actor-owned; does not treat HP as ordinary combat Resource unless CostSpec explicitly uses HP.

---

## P-034 — VALIDATE_COST

**ID:** `VALIDATE_COST`  
**Class:** RESOLVER_PRIMITIVE  
**Purpose:** Determine whether a CostSpec can legally be paid before an Action/Trigger/effect commits.  
**Inputs:** payer; Resource Pools; CostSpec; current state/snapshot; waiver/free-cast flags; minimum-HP policy if HP Cost.  
**Outputs:** `CostResultRef` with payable/not-payable reasons and reserved values if reservation exists.  
**State Mutation:** None unless Contract supports explicit reservation; reservation semantics remain unresolved.  
**Atomicity:** Validation observes one state version.  
**Contract Dependencies:** Cost Contract; Resource Contract; HP Cost Contract.  
**Tag Relationship:** `SELF_HP_COST` may require this operation; ordinary Ability AE/Rage cost does not need a Functional Tag.  
**Does Not Do:** Does not consume cost; does not trigger effect just because cost is payable.

---

## P-035 — COMMIT_RESOURCE_COST

**ID:** `COMMIT_RESOURCE_COST`  
**Class:** RESOLVER_PRIMITIVE  
**Purpose:** Atomically pay non-HP Resource Costs after successful validation.  
**Inputs:** `CostResultRef`; payer/pools; waiver/override policy.  
**Outputs:** committed cost result.  
**State Mutation:** Deducts/consumes specified resource.  
**Atomicity:** Multi-resource cost should be all-or-nothing unless Cost Contract explicitly permits partial payment.  
**Contract Dependencies:** Cost Contract; Resource Contract.  
**Tag Relationship:** No Tag required merely because Ability costs AE/Rage.  
**Does Not Do:** Does not pay HP Cost; does not apply arbitrary resource drain effect (`MODIFY_RESOURCE` handles non-cost drain).

---

## P-036 — COMMIT_HP_COST

**ID:** `COMMIT_HP_COST`  
**Class:** EFFECT_PRIMITIVE / RESOLVER_PRIMITIVE  
**Purpose:** Pay Current HP under explicit Cost semantics without creating a Damage Packet.  
**Inputs:** validated HP Cost; payer; amount/formula; lethal-floor policy; source/ability context.  
**Outputs:** cost payment result; resulting Current HP.  
**State Mutation:** Reduces Current HP as Cost.  
**Atomicity:** HP payment is atomic with Cost transaction.  
**Contract Dependencies:** HP Cost Contract; Death/Lethality Contract; Cost Contract.  
**Tag Relationship:** Implements `SELF_HP_COST` when payer is the Caster/Owner itself.  
**Does Not Do:** Does not create Damage; does not interact with Shield by default; does not Reflect/Lifesteal; does not trigger ordinary Damage Trigger; does not automatically kill payer under current default.

---

## P-037 — APPLY_HP_LOSS

**ID:** `APPLY_HP_LOSS`  
**Class:** EFFECT_PRIMITIVE  
**Purpose:** Apply non-Damage Current HP loss that is not Cost payment.  
**Inputs:** target; amount/formula; lethal policy; source/cause; Authority if relevant.  
**Outputs:** HP-loss result; HP_ZERO candidate if applicable.  
**State Mutation:** Reduces Current HP without Damage Packet semantics.  
**Atomicity:** HP loss is atomic.  
**Contract Dependencies:** HP Loss Contract; Death Contract.  
**Tag Relationship:** Implements `HP_LOSS`.  
**Does Not Do:** Does not validate affordability; does not imply payment; does not interact with Shield/Reflect/Lifesteal by default; does not become `SELF_HP_COST` merely because target=source.

### Critical distinction
SSR Warrior's post-action 1% HP loss remains mapped here **unless** the character's canonical spec later explicitly declares it a payment Cost.

---

# 11. DAMAGE PRIMITIVES

## P-040 — BUILD_DAMAGE_PACKET

**ID:** `BUILD_DAMAGE_PACKET`  
**Class:** EFFECT_PRIMITIVE / RESOLVER_PRIMITIVE  
**Purpose:** Construct a typed Damage Packet from Damage Profile, formula context, source/attribution and target.  
**Inputs:** source; Damage Attribution; target; Damage Profile; source SnapshotRef; target SnapshotRef/current state policy; Authority; Shield policy; parent Action/hit.  
**Outputs:** `DamagePacketRef`.  
**State Mutation:** None.  
**Atomicity:** Packet creation is read-only.  
**Contract Dependencies:** Damage Formula Contract; Attribution Contract; Snapshot Contract.  
**Tag Relationship:** `DAMAGE` plus component Tags such as `PHYSICAL_DAMAGE`, `WILL_DAMAGE`, `TRUE_DAMAGE`, `PENETRATION`, `SHIELD_PIERCING`.  
**Does Not Do:** Does not reduce HP/Shield; does not decide death; does not turn 100% Penetration into True Damage.

---

## P-041 — RESOLVE_DAMAGE_PACKET

**ID:** `RESOLVE_DAMAGE_PACKET`  
**Class:** RESOLVER_PRIMITIVE  
**Purpose:** Resolve a Damage Packet into a deterministic Damage Result without committing target state yet.  
**Inputs:** `DamagePacketRef`; target defensive state/snapshot; Damage Contract; Shield layers; relevant modifiers.  
**Outputs:** `DamageResultRef`.  
**State Mutation:** None in calculation phase.  
**Atomicity:** Pure calculation against the declared state/snapshot.  
**Contract Dependencies:** Damage Contract; Shield Interaction Contract; Reduction/Penetration Contract; True Damage Contract.  
**Tag Relationship:** One resolver supports many damage Tags; no separate Physical/Will/True primitives required.  
**Does Not Do:** Does not commit HP/Shield changes; does not emit DEATH_CONFIRMED; does not process reaction queue.

### Required result distinction
DamageResult must preserve enough information to distinguish:
- resolved pre-Shield amount;
- Shield absorbed amount;
- Actual HP Damage;
- Overkill;
- lethal candidate.

---

## P-042 — COMMIT_DAMAGE_RESULT

**ID:** `COMMIT_DAMAGE_RESULT`  
**Class:** RESOLVER_PRIMITIVE  
**Purpose:** Commit one or a batch of previously calculated Damage Results to Shield/Current HP under current transaction scope.  
**Inputs:** one or more `DamageResultRef`; commit mode; transaction/batch context.  
**Outputs:** committed DamageResultRefs + StateDeltas + HP_ZERO candidates.  
**State Mutation:** Mutates Shield and Current HP exactly according to resolved result.  
**Atomicity:** Can commit individually for sequential mode or as one batch for simultaneous mode.  
**Contract Dependencies:** Damage Commit Contract; Simultaneous/Sequential Contract; Shield Contract; Death Pipeline Contract.  
**Tag Relationship:** Supports `DAMAGE` and all damage component Tags.  
**Does Not Do:** Does not itself confirm death; does not recalculate packet from changed state when committing a pre-resolved simultaneous batch.

---

## P-043 — AGGREGATE_DAMAGE_RESULTS

**ID:** `AGGREGATE_DAMAGE_RESULTS`  
**Class:** QUERY_PRIMITIVE  
**Purpose:** Aggregate committed/resolved Damage Results by declared scope without re-running Damage.  
**Inputs:** result collection; grouping/filter criteria; metric such as Actual HP Damage, Shield damage, raw/resolved amount.  
**Outputs:** `DamageAggregateRef`.  
**State Mutation:** None.  
**Atomicity:** Read-only over immutable result records.  
**Contract Dependencies:** Damage Result Contract; Attribution Contract.  
**Tag Relationship:** No dedicated Tag. Used by effects carrying `HEAL`, `TRUE_DAMAGE`, etc.  
**Does Not Do:** Does not copy secondary effects; does not include Overkill in Actual HP Damage unless metric explicitly requests Overkill.

### Stress-test coverage
- Ký Ức Skill 2: aggregate each enemy's Actual HP Damage from one ally Damage Action.
- Ký Ức Ultimate: total Actual HP Damage to calculate Heal.
- SSR Warrior Skill 1: total qualifying actual damage to calculate self Heal.

---

# 12. HEAL PRIMITIVES

## P-044 — RESOLVE_HEAL

**ID:** `RESOLVE_HEAL`  
**Class:** RESOLVER_PRIMITIVE  
**Purpose:** Calculate Current HP restoration and Overheal without committing yet.  
**Inputs:** target; requested heal formula/amount; Current HP; Current Max HP; source/attribution; relevant modifiers.  
**Outputs:** `HealResultRef` containing requested, actual restored and Overheal values.  
**State Mutation:** None.  
**Atomicity:** Pure calculation against one state/snapshot.  
**Contract Dependencies:** Healing Contract; Snapshot Contract.  
**Tag Relationship:** Used by `HEAL`.  
**Does Not Do:** Does not Revive; does not create Shield; does not convert Overheal into stat automatically.

---

## P-045 — COMMIT_HEAL_RESULT

**ID:** `COMMIT_HEAL_RESULT`  
**Class:** EFFECT_PRIMITIVE / RESOLVER_PRIMITIVE  
**Purpose:** Commit a resolved Heal Result to Current HP.  
**Inputs:** `HealResultRef`; transaction context.  
**Outputs:** committed result + StateDelta.  
**State Mutation:** Increases Current HP by actual restorable amount.  
**Atomicity:** Atomic per declared heal batch.  
**Contract Dependencies:** Healing Commit Contract; State Commit Contract.  
**Tag Relationship:** Implements `HEAL`.  
**Does Not Do:** Does not add Overheal to HP beyond Max HP; does not convert Overheal unless another effect uses the result.

---

# 13. SHIELD PRIMITIVES

## P-046 — CREATE_SHIELD_INSTANCE

**ID:** `CREATE_SHIELD_INSTANCE`  
**Class:** EFFECT_PRIMITIVE  
**Purpose:** Create a Shield defensive-layer instance with owner/source/value/lifecycle metadata.  
**Inputs:** target; Shield definition; value/formula; stacking/priority policy; duration; source; Authority.  
**Outputs:** Shield StateRef/result.  
**State Mutation:** Adds a Shield instance/layer.  
**Atomicity:** Shield creation is atomic.  
**Contract Dependencies:** Shield Contract; State Contract; Stacking Contract.  
**Tag Relationship:** Implements `SHIELD`.  
**Does Not Do:** Does not Heal; does not act as Damage Reduction unless Shield Contract explicitly defines special behavior.

---

## P-047 — MODIFY_SHIELD_INSTANCE

**ID:** `MODIFY_SHIELD_INSTANCE`  
**Class:** EFFECT_PRIMITIVE / RESOLVER_PRIMITIVE  
**Purpose:** Change the value or allowed properties of an existing Shield instance outside ordinary damage absorption commit.  
**Inputs:** Shield reference; delta/set operation; source; Authority.  
**Outputs:** modified Shield result.  
**State Mutation:** Changes Shield state/value.  
**Atomicity:** Atomic per Shield instance/set.  
**Contract Dependencies:** Shield Contract; Authority Contract.  
**Tag Relationship:** `SHIELD`.  
**Does Not Do:** Does not count as Damage merely because Shield value decreases; ordinary Damage absorption is committed by `COMMIT_DAMAGE_RESULT`.

---

## P-048 — REMOVE_SHIELD_INSTANCE

**ID:** `REMOVE_SHIELD_INSTANCE`  
**Class:** EFFECT_PRIMITIVE  
**Purpose:** Remove an eligible Shield instance without pretending it was depleted by Damage.  
**Inputs:** Shield reference/filter; removal reason; source; Authority.  
**Outputs:** removal result.  
**State Mutation:** Removes Shield state.  
**Atomicity:** Atomic within declared removal scope.  
**Contract Dependencies:** Shield Removal Contract; Authority Contract.  
**Tag Relationship:** `SHIELD` because effect directly manipulates Shield state.  
**Does Not Do:** Does not imply Shield Piercing; does not generate Actual HP Damage; does not trigger “Shield broke by damage” unless Contract explicitly maps removal reason to that event.

---

# 14. POSITION / ENTITY PRESENCE PRIMITIVES

## P-050 — MUTATE_POSITION

**ID:** `MUTATE_POSITION`  
**Class:** EFFECT_PRIMITIVE  
**Purpose:** Change authoritative Position of an Entity inside the relevant spatial/slot system.  
**Inputs:** entity; destination/resolver; movement mode; source; Authority; collision/occupancy policy.  
**Outputs:** old/new Position + mutation result.  
**State Mutation:** Changes Position.  
**Atomicity:** Single entity move is atomic; multi-entity swap/group movement must commit atomically if Contract requires.  
**Contract Dependencies:** Position Contract; Occupancy Contract; Displacement Contract; Authority Contract.  
**Tag Relationship:** Implements `POSITION_MUTATION`. Airborne may additionally use `CREATE_STATE_INSTANCE` if Airborne state identity exists.  
**Does Not Do:** Does not transfer entity between Combat Instances; does not create Temporary Absence; does not infer Airborne from visual movement.

---

## P-051 — SPAWN_ENTITY

**ID:** `SPAWN_ENTITY`  
**Class:** EFFECT_PRIMITIVE / LIFECYCLE_PRIMITIVE  
**Purpose:** Create a new Runtime Entity of a declared entity kind and lifecycle profile.  
**Inputs:** entity definition/profile; entity kind; Side/Owner; Position/materialization target; stat initialization; lifecycle profile; identity policy; source.  
**Outputs:** new `EntityRef`.  
**State Mutation:** Adds a new Runtime Entity to Combat Instance state.  
**Atomicity:** Entity identity allocation + initial state + valid placement commit atomically.  
**Contract Dependencies:** Entity Lifecycle Contract; Spawn/Materialization Contract; Occupancy Contract; Identity Contract; Uniqueness Contract if applicable.  
**Tag Relationship:** May implement `SUMMON` when `entityKind/lifecycle = SUMMON`; may create Combat Object without `SUMMON`.  
**Does Not Do:** Does not automatically create a Chân Ngã; does not classify every created object as Summon; does not implement Reincarnation by itself.

### Important object classification
The same Primitive can spawn:
- Summon Combat Unit;
- Combat Object;
- special Container object;
without erasing their semantic differences.

---

## P-052 — REMOVE_ENTITY

**ID:** `REMOVE_ENTITY`  
**Class:** LIFECYCLE_PRIMITIVE  
**Purpose:** Remove an Entity from active battlefield/Combat Instance presence under non-death generic removal semantics.  
**Inputs:** EntityRef; removal reason; destination/return policy if any; source/authority.  
**Outputs:** removal result.  
**State Mutation:** Changes presence/lifecycle state to REMOVED or equivalent non-death state.  
**Atomicity:** Presence removal is atomic.  
**Contract Dependencies:** Removal Contract; Lifecycle Contract; Combat Instance Contract.  
**Tag Relationship:** No Functional Tag currently canonicalized for generic removal.  
**Does Not Do:** Does not emit DEATH_CONFIRMED; does not imply Despawn, Fusion Consumption or Erasure.

---

## P-053 — DESPAWN_ENTITY

**ID:** `DESPAWN_ENTITY`  
**Class:** LIFECYCLE_PRIMITIVE  
**Purpose:** Terminate a summon/entity through Despawn lifecycle semantics.  
**Inputs:** EntityRef; despawn cause; Owner/source.  
**Outputs:** despawn result.  
**State Mutation:** Moves entity to DESPAWNED/terminated summon state and cleans eligible presence.  
**Atomicity:** Lifecycle transition is atomic.  
**Contract Dependencies:** Summon Lifecycle Contract; Cleanup Contract.  
**Tag Relationship:** Commonly associated with entities created under `SUMMON`; the despawn operation itself does not need a separate Tag.  
**Does Not Do:** Does not count as death by default; does not route Chân Ngã unless the entity exceptionally has one and Contract says so.

---

## P-054 — FUSION_CONSUME_ENTITY

**ID:** `FUSION_CONSUME_ENTITY`  
**Class:** LIFECYCLE_PRIMITIVE  
**Purpose:** Consume an Entity as fusion/input material under FUSION_CONSUMED semantics.  
**Inputs:** EntityRef; fusion transaction; consumer/result owner.  
**Outputs:** consumed-entity result.  
**State Mutation:** Transitions entity out of active existence/presence as fusion-consumed.  
**Atomicity:** Must be atomic with fusion transaction where required.  
**Contract Dependencies:** Fusion Contract; Lifecycle Contract.  
**Tag Relationship:** No current Functional Tag.  
**Does Not Do:** Does not emit ordinary confirmed death; does not use Despawn merely because entity disappears.

---

## P-055 — ERASE_ENTITY

**ID:** `ERASE_ENTITY`  
**Class:** LIFECYCLE_PRIMITIVE  
**Purpose:** Apply existence-erasure semantics when a mechanic explicitly deletes an Entity/identity presence beyond normal death/removal.  
**Inputs:** EntityRef; erasure scope; authority/axiom interaction; source.  
**Outputs:** erasure result.  
**State Mutation:** Transitions selected runtime/identity layers to ERASED according to Contract.  
**Atomicity:** Erasure scope commits atomically.  
**Contract Dependencies:** Erasure Contract; Identity Contract; Axiom/Authority Contract.  
**Tag Relationship:** No `ERASURE` Functional Tag yet; candidate only when real kit requires capability query.  
**Does Not Do:** Does not automatically emit DEATH_CONFIRMED; does not automatically erase trueSelfId, history, or all snapshots unless Contract explicitly includes them.

---

# 15. DEATH / LIFE-CYCLE PRIMITIVES

## P-060 — BEGIN_DEATH_EVALUATION

**ID:** `BEGIN_DEATH_EVALUATION`  
**Class:** LIFECYCLE_PRIMITIVE / RESOLVER_PRIMITIVE  
**Purpose:** Open death-evaluation pipeline for an eligible entity that reached HP_ZERO or another explicit lethal condition.  
**Inputs:** EntityRef; lethal cause; parent Action/effect; attribution context.  
**Outputs:** death-evaluation context.  
**State Mutation:** May set transient HP_ZERO/death-evaluating state; no DEATH_CONFIRMED yet.  
**Atomicity:** Pipeline opening is atomic.  
**Contract Dependencies:** Death Lifecycle Contract.  
**Tag Relationship:** No Tag required for HP_ZERO itself.  
**Does Not Do:** Does not confirm death; does not grant kill credit; does not enter Luân Hồi.

---

## P-061 — RESOLVE_DEATH_PREVENTION

**ID:** `RESOLVE_DEATH_PREVENTION`  
**Class:** LIFECYCLE_PRIMITIVE / RESOLVER_PRIMITIVE  
**Purpose:** Resolve all eligible Death Prevention candidates for an open death-evaluation context.  
**Inputs:** death-evaluation context; target states/abilities; source cause; Authority context.  
**Outputs:** prevented/not-prevented result + resulting state changes.  
**State Mutation:** May apply DEATH_PREVENTED outcome and prevention-specific state changes.  
**Atomicity:** Prevention resolution follows Death Prevention Contract and must produce one canonical outcome.  
**Contract Dependencies:** Death Prevention Contract; Trigger Ordering Contract; Authority Contract.  
**Tag Relationship:** Consumes effects carrying `DEATH_PREVENTION`.  
**Does Not Do:** Does not perform ordinary Revive; does not fire confirmed-death observers if death is prevented.

---

## P-062 — CONFIRM_DEATH

**ID:** `CONFIRM_DEATH`  
**Class:** LIFECYCLE_PRIMITIVE  
**Purpose:** Commit canonical DEATH_CONFIRMED after prevention resolution fails or no prevention applies.  
**Inputs:** death-evaluation context; final cause; Damage/Effect/Kill Attribution.  
**Outputs:** DEATH_CONFIRMED result/event data; dead-state reference.  
**State Mutation:** Transitions entity into confirmed-dead lifecycle state and updates presence/eligibility according to Contract.  
**Atomicity:** Confirmed-death transition is atomic.  
**Contract Dependencies:** Death Contract; Attribution Contract; Cleanup Contract; World Axiom observer Contract.  
**Tag Relationship:** Not itself a `DEATH_TRIGGER` Tag. Effects listening to this use TriggerSpec.  
**Does Not Do:** Does not Revive; does not enter Reincarnation immediately unless later lifecycle operation/Contract does so; does not treat HP_ZERO as equivalent.

### Canonical observer boundary
This is the checkpoint at which:
- on-death;
- on-kill;
- kill credit;
- Luân Hồi observation;
become eligible under their Contracts.

---

## P-063 — CREATE_REVIVE_PENDING

**ID:** `CREATE_REVIVE_PENDING`  
**Class:** LIFECYCLE_PRIMITIVE  
**Purpose:** Create post-DEATH_CONFIRMED revive entitlement/pending state for an eligible dead entity.  
**Inputs:** dead EntityRef/True Self; revive spec; delay clock; restore policy; source/owner; limits.  
**Outputs:** Revive Pending state/reference.  
**State Mutation:** Adds revive-pending lifecycle state.  
**Atomicity:** Pending entitlement creation is atomic.  
**Contract Dependencies:** Revive Contract; Duration/Clock Contract; Identity Contract.  
**Tag Relationship:** Used by effects carrying `REVIVE`.  
**Does Not Do:** Does not materialize actor immediately unless Revive Contract says zero-delay and calls materialization; does not increment lifeSerial by universal rule.

---

## P-064 — ENTER_REINCARNATION_WAITING

**ID:** `ENTER_REINCARNATION_WAITING`  
**Class:** LIFECYCLE_PRIMITIVE  
**Purpose:** Place a confirmed-dead Chân Ngã into the waiting state before Reincarnation.  
**Inputs:** trueSelfId; death context; waiting-window spec; mode/world Axiom context.  
**Outputs:** waiting-state reference.  
**State Mutation:** Adds/updates Chân Ngã waiting lifecycle state.  
**Atomicity:** Transition is atomic.  
**Contract Dependencies:** Luân Hồi Contract; Waiting Window Contract.  
**Tag Relationship:** World-system internal; a Character effect manipulating this lifecycle may carry `REINCARNATION`.  
**Does Not Do:** Does not choose reincarnation destination; does not use wall-clock time by assumption.

---

## P-065 — ADVANCE_REINCARNATION_WAITING

**ID:** `ADVANCE_REINCARNATION_WAITING`  
**Class:** LIFECYCLE_PRIMITIVE / RESOLVER_PRIMITIVE  
**Purpose:** Advance/reduce a Chân Ngã's Reincarnation waiting state according to an explicitly supplied clock/event operation.  
**Inputs:** waiting-state reference; delta/advance reason; source; authority if forced manipulation.  
**Outputs:** new waiting value/state; threshold-crossed result.  
**State Mutation:** Mutates waiting progress.  
**Atomicity:** One advancement is atomic.  
**Contract Dependencies:** Waiting Window Contract; Mode Clock Contract; Authority Contract for forced acceleration.  
**Tag Relationship:** Character effects directly shortening/forcing Luân Hồi waiting may carry `REINCARNATION`.  
**Does Not Do:** Does not define what the canonical “4” counts; does not automatically enter Reincarnation until Contract invokes transition.

---

## P-066 — ENTER_REINCARNATION

**ID:** `ENTER_REINCARNATION`  
**Class:** LIFECYCLE_PRIMITIVE / SYSTEM_GATEWAY_PRIMITIVE  
**Purpose:** Transition an eligible Chân Ngã from waiting/dead state into Reincarnation under World Axiom Luân Hồi.  
**Inputs:** trueSelfId; waiting/death state; source/cause; authority; route eligibility context.  
**Outputs:** reincarnation-state reference and routing eligibility.  
**State Mutation:** Ends ordinary revive eligibility by default and transitions Chân Ngã into Reincarnation state.  
**Atomicity:** Life-state transition is atomic.  
**Contract Dependencies:** World Axiom Luân Hồi Contract; Revive/Reincarnation Conflict Contract; Authority Contract.  
**Tag Relationship:** Direct Character/system manipulation uses `REINCARNATION`.  
**Does Not Do:** Does not materialize a new life; does not select host/appearance; does not erase Chân Ngã.

---

## P-067 — ROUTE_REINCARNATION

**ID:** `ROUTE_REINCARNATION`  
**Class:** SYSTEM_GATEWAY_PRIMITIVE  
**Purpose:** Resolve a Reincarnation Candidate into an eligible route/destination/host/form without materializing it yet.  
**Inputs:** trueSelfId; candidate routes; Side rules; host eligibility; Rank/Class/definition filters; block rules; deterministic RNG if required.  
**Outputs:** selected route payload or blocked/no-route result.  
**State Mutation:** May reserve route/host according to Contract; otherwise selection only.  
**Atomicity:** Route selection is atomic against one candidate-set state version.  
**Contract Dependencies:** Reincarnation Routing Contract; Pygmalion/Luân Hồi-specific route Contracts; Deterministic RNG; Authority/Axiom Contract.  
**Tag Relationship:** Implements system behavior behind `REINCARNATION`; may feed `COMBAT_DEFINITION_INHERITANCE`.  
**Does Not Do:** Does not ordinary Revive; does not materialize; does not assume original Side is preserved.

---

## P-068 — SET_REINCARNATION_EXHAUSTED

**ID:** `SET_REINCARNATION_EXHAUSTED`  
**Class:** LIFECYCLE_PRIMITIVE  
**Purpose:** Mark a Chân Ngã as no longer eligible for declared reincarnation route/scope during encounter.  
**Inputs:** trueSelfId; exhaustion scope; source/cause.  
**Outputs:** updated lifecycle state.  
**State Mutation:** Sets exhaustion state.  
**Atomicity:** Atomic.  
**Contract Dependencies:** Reincarnation Contract.  
**Tag Relationship:** No separate Tag; direct manipulation may still belong to `REINCARNATION`.  
**Does Not Do:** Does not erase Chân Ngã; does not imply no ordinary state can ever affect it outside declared scope.

---

## P-069 — MATERIALIZE_ENTITY

**ID:** `MATERIALIZE_ENTITY`  
**Class:** LIFECYCLE_PRIMITIVE  
**Purpose:** Bring a pending/absent/reviving/reincarnating entity or new life into active Combat Instance presence.  
**Inputs:** materialization payload; identity; definitions; Side; Position selection; initial HP/resource/state; lifecycle transition kind.  
**Outputs:** active `EntityRef` / materialization result.  
**State Mutation:** Creates or restores active presence and binds declared life/definition layers.  
**Atomicity:** Identity + valid placement + initial state must commit atomically.  
**Contract Dependencies:** Materialization Contract; Revive Contract or Rebirth/Reincarnation Contract; Occupancy Contract; Uniqueness Contract; Identity Contract.  
**Tag Relationship:** Used by `REVIVE`, `REINCARNATION`, `TEMPORARY_ABSENCE` return, and other presence systems.  
**Does Not Do:** Does not assume all materializations are Revive; does not silently choose a random Position if spec does not say so.

---

# 16. TEMPORARY ABSENCE PRIMITIVES

## P-070 — ENTER_TEMPORARY_ABSENCE

**ID:** `ENTER_TEMPORARY_ABSENCE`  
**Class:** EFFECT_PRIMITIVE / LIFECYCLE_PRIMITIVE  
**Purpose:** Transition a living entity out of active battlefield presence while preserving a return-capable non-death lifecycle.  
**Inputs:** EntityRef; absence state/profile; duration/return clock; source; stored return context.  
**Outputs:** absence-state reference.  
**State Mutation:** Removes active battlefield presence and sets TEMPORARILY_ABSENT state without confirmed death.  
**Atomicity:** Presence removal + absence state creation is atomic.  
**Contract Dependencies:** Temporary Absence Contract; SSI/Mode Clock Contract; Presence Contract.  
**Tag Relationship:** Implements `TEMPORARY_ABSENCE`.  
**Does Not Do:** Does not emit DEATH_CONFIRMED; does not enter Reincarnation; does not create Arena Combat Instance.

---

## P-071 — RETURN_FROM_TEMPORARY_ABSENCE

**ID:** `RETURN_FROM_TEMPORARY_ABSENCE`  
**Class:** LIFECYCLE_PRIMITIVE  
**Purpose:** Attempt return/materialization of a TEMPORARILY_ABSENT entity.  
**Inputs:** absent entity/state; return-position rule; retry rule; current Combat Instance state.  
**Outputs:** returned EntityRef or deferred/retry result.  
**State Mutation:** Ends absence state and restores active presence on success.  
**Atomicity:** Successful return is atomic; failed placement attempt does not partially materialize.  
**Contract Dependencies:** Temporary Absence Contract; Materialization Contract; Occupancy Contract; retry clock Contract.  
**Tag Relationship:** Paired with `TEMPORARY_ABSENCE`.  
**Does Not Do:** Does not Revive; does not reset SSI cursor; does not grant Natural Action unless scheduling Contract explicitly says so.

---

# 17. IDENTITY / DEFINITION PRIMITIVES

## P-080 — APPLY_LIFE_IDENTITY_TRANSITION

**ID:** `APPLY_LIFE_IDENTITY_TRANSITION`  
**Class:** LIFECYCLE_PRIMITIVE  
**Purpose:** Apply explicit trueSelfId/lifeSerial policy when a lifecycle transition creates/restores a life.  
**Inputs:** trueSelfId; current lifeSerial; transition kind; lifeSerial policy; identity-preservation policy.  
**Outputs:** resulting identity tuple.  
**State Mutation:** Updates life identity metadata only as authorized.  
**Atomicity:** Identity tuple update is atomic with associated materialization/life transition.  
**Contract Dependencies:** Identity Contract; Revive/Reincarnation Contract.  
**Tag Relationship:** No direct Tag. Supports `REVIVE`, `REINCARNATION`.  
**Does Not Do:** Does not impose one global lifeSerial rule; does not change Presentation/Combat Definition.

---

## P-081 — BIND_PRESENTATION_DEFINITION

**ID:** `BIND_PRESENTATION_DEFINITION`  
**Class:** LIFECYCLE_PRIMITIVE / SYSTEM_GATEWAY_PRIMITIVE  
**Purpose:** Bind or replace Presentation Definition independently of Combat Definition and True Self identity.  
**Inputs:** EntityRef/materialization payload; Presentation Definition ref; fallback policy.  
**Outputs:** updated presentation binding.  
**State Mutation:** Changes presentation-definition reference.  
**Atomicity:** Binding is atomic with relevant form/materialization transition if required.  
**Contract Dependencies:** Presentation Contract; Identity Contract.  
**Tag Relationship:** No Functional Tag.  
**Does Not Do:** Does not change combat behavior, Class, Element, stats or Damage Attribution by implication.

---

## P-082 — BIND_COMBAT_DEFINITION

**ID:** `BIND_COMBAT_DEFINITION`  
**Class:** LIFECYCLE_PRIMITIVE / SYSTEM_GATEWAY_PRIMITIVE  
**Purpose:** Bind the Combat Definition used as current behavior source for an Entity.  
**Inputs:** EntityRef/materialization payload; Combat Definition ref; inheritance/override metadata.  
**Outputs:** updated combat-definition binding.  
**State Mutation:** Changes behavior-definition reference.  
**Atomicity:** Binding is atomic at declared lifecycle transition.  
**Contract Dependencies:** Combat Definition Contract; Identity Contract; Capability Index Rebuild Contract.  
**Tag Relationship:** May be used by `COMBAT_DEFINITION_INHERITANCE`.  
**Does Not Do:** Does not automatically replace Presentation Definition, trueSelfId, stat basis, Element or Damage Attribution.

---

## P-083 — APPLY_COMBAT_DEFINITION_INHERITANCE

**ID:** `APPLY_COMBAT_DEFINITION_INHERITANCE`  
**Class:** SYSTEM_GATEWAY_PRIMITIVE  
**Purpose:** Apply selective Combat Definition inheritance while explicitly preserving/overriding host layers according to an inheritance profile.  
**Inputs:** host EntityRef; source Combat Definition; inheritance profile; host stat basis; identity policy; presentation policy; Class/Element policy; attribution policy.  
**Outputs:** inherited behavior binding/result + capability-index update.  
**State Mutation:** Updates selected Combat Definition/behavior lineage and allowed inherited fields.  
**Atomicity:** Inheritance binding and required normalized capability rebuild commit atomically.  
**Contract Dependencies:** Combat Definition Inheritance Contract; Identity Contract; Stat Inheritance Contract; Attribution Contract; Capability Index Contract.  
**Tag Relationship:** Implements `COMBAT_DEFINITION_INHERITANCE`.  
**Does Not Do:** Does not blindly clone every source field; does not assume Class or Element inheritance; does not change Damage Attribution merely because Behavior Source changes.

### Pygmalion invariant
This Primitive must support:

> Host Puppet keeps its own host/stat/presentation layers while using inherited combat behavior under the kit's declared policy.

---

## P-084 — CONSUME_LIFECYCLE_QUOTA

**ID:** `CONSUME_LIFECYCLE_QUOTA`  
**Class:** LIFECYCLE_PRIMITIVE  
**Purpose:** Atomically consume a named allowance scoped to Life Cycle/entity/encounter/system.  
**Inputs:** quota owner/scope; quota key; amount; expected current count; cause.  
**Outputs:** success/failure + updated quota state.  
**State Mutation:** Updates lifecycle quota counter.  
**Atomicity:** Check-and-consume must be atomic to avoid duplicate activation.  
**Contract Dependencies:** Lifecycle Quota Contract.  
**Tag Relationship:** No Tag; quota is state/parameter.  
**Does Not Do:** Does not limit active entity count unless quota definition explicitly does so.

### Pygmalion invariant
`one new Puppet per Life Cycle` should use lifecycle quota semantics.

It must **not** be implemented as:
`if existingPuppet != null: block`.

Because multiple old Puppets may coexist.

---

## P-085 — VALIDATE_MATERIALIZATION_CONSTRAINTS

**ID:** `VALIDATE_MATERIALIZATION_CONSTRAINTS`  
**Class:** RESOLVER_PRIMITIVE  
**Purpose:** Validate whether a pending entity/life/form can materialize under Position, Uniqueness, Side and system constraints.  
**Inputs:** materialization payload; candidate Position; identity/definition; Combat Instance; Axiom metadata.  
**Outputs:** valid/invalid reasons; alternative-policy request if Contract allows reroll/retry.  
**State Mutation:** None.  
**Atomicity:** Read-only against one authoritative state version.  
**Contract Dependencies:** Materialization Contract; Uniqueness Contract; Occupancy Contract; Axiom Contract.  
**Tag Relationship:** Uniqueness is system metadata, not Functional Tag.  
**Does Not Do:** Does not reroll automatically; does not bypass Duy Nhất because appearance was randomly chosen.

---

# 18. COMBAT INSTANCE / ARENA PRIMITIVES

## P-090 — CREATE_COMBAT_INSTANCE

**ID:** `CREATE_COMBAT_INSTANCE`  
**Class:** SYSTEM_GATEWAY_PRIMITIVE  
**Purpose:** Create an isolated Combat Instance with declared ruleset, parent relation and participant policy.  
**Inputs:** instance type/profile; parent Combat Instance; participants; mode/SSI/resource/isolation policy; owner/source.  
**Outputs:** new `CombatInstanceRef`.  
**State Mutation:** Adds child Combat Instance system state.  
**Atomicity:** Instance creation and initial participant reservation are atomic.  
**Contract Dependencies:** Combat Instance Contract; Arena Contract when instance type=ARENA.  
**Tag Relationship:** Abilities directly creating Arena carry `ARENA`.  
**Does Not Do:** Does not automatically transfer participants; does not create a separate World Axiom universe unless Contract says so.

---

## P-091 — TRANSFER_ENTITY_TO_INSTANCE

**ID:** `TRANSFER_ENTITY_TO_INSTANCE`  
**Class:** SYSTEM_GATEWAY_PRIMITIVE  
**Purpose:** Transfer an Entity from one Combat Instance presence to another without treating the transfer as death.  
**Inputs:** EntityRef; source instance; destination instance; state/resource transfer profile; Position policy.  
**Outputs:** transferred EntityRef/context.  
**State Mutation:** Changes Combat Instance membership/presence.  
**Atomicity:** Entity cannot be simultaneously authoritative in both instances unless Contract explicitly supports mirrored presence.  
**Contract Dependencies:** Combat Instance Transfer Contract; Arena Contract; Identity Contract.  
**Tag Relationship:** Commonly used by `ARENA`.  
**Does Not Do:** Does not emit DEATH_CONFIRMED; does not imply Temporary Absence if entity remains active in destination instance.

---

## P-092 — RETURN_ENTITY_FROM_INSTANCE

**ID:** `RETURN_ENTITY_FROM_INSTANCE`  
**Class:** SYSTEM_GATEWAY_PRIMITIVE  
**Purpose:** Return an Entity from isolated Combat Instance to parent/destination instance under return policy.  
**Inputs:** EntityRef; child/parent instances; return Position policy; transferred state/resources; lifecycle outcome.  
**Outputs:** returned EntityRef or failure/cleanup result.  
**State Mutation:** Restores membership/presence in destination instance.  
**Atomicity:** Return placement/state transfer is atomic.  
**Contract Dependencies:** Arena Return Contract; Occupancy Contract; Combat Instance Contract.  
**Tag Relationship:** `ARENA`.  
**Does Not Do:** Does not Revive a participant that died in Arena; does not ignore full destination battlefield without fallback policy.

---

## P-093 — CLOSE_COMBAT_INSTANCE

**ID:** `CLOSE_COMBAT_INSTANCE`  
**Class:** SYSTEM_GATEWAY_PRIMITIVE  
**Purpose:** Terminate a child/isolate Combat Instance and resolve remaining objects/participants according to cleanup policy.  
**Inputs:** CombatInstanceRef; close reason; participant outcomes; object transfer/cleanup rules.  
**Outputs:** closed-instance result.  
**State Mutation:** Removes/archives child instance and resolves owned system state.  
**Atomicity:** Finalization follows instance-close transaction.  
**Contract Dependencies:** Combat Instance Cleanup Contract; Arena Contract.  
**Tag Relationship:** No extra Tag; Arena ability/system may invoke as lifecycle consequence.  
**Does Not Do:** Does not automatically transfer Kén/Field/Container to Main Battle; each object ownership rule must be explicit.

---

# 19. CAPABILITY QUERY PRIMITIVE

## P-100 — QUERY_CAPABILITY

**ID:** `QUERY_CAPABILITY`  
**Class:** QUERY_PRIMITIVE  
**Purpose:** Evaluate a normalized Capability Requirement against Character/Ability/Effect/System data without assuming every capability is a Tag.  
**Inputs:** subject/ref; Capability Requirement expression; query scope; current mode/profile; optional current state.  
**Outputs:** match result + matched semantic evidence.  
**State Mutation:** None.  
**Atomicity:** Read-only.  
**Contract Dependencies:** Capability Index Contract; Tag Registry; Ability Schema; System Metadata Contract.  
**Tag Relationship:** Can query Functional Tags, but also Schema facets and Axiom/System metadata.  
**Does Not Do:** Does not create new Tags; does not hardcode Character IDs; does not infer capability from VFX/lore names.

### Example
Requirement:
```text
abilityType = ULTIMATE
AND functionalTag = TRUE_DAMAGE
AND targetRelation = ENEMY
```

No need for Tags:
- ULTIMATE
- TARGET_ENEMY.

---

# 20. NARRATIVE SYSTEM GATEWAY PRIMITIVES

Narrative System is retained because Cố Sự Chi Thần proves Arclune must support persistent system mechanics beyond ordinary status effects.

These Primitives are system gateways.

They do **not** canonicalize exact Belief formula, Witness weights, knowledge delay or property Authority.

---

## P-110 — CREATE_STORY_INSTANCE

**ID:** `CREATE_STORY_INSTANCE`  
**Class:** SYSTEM_GATEWAY_PRIMITIVE  
**Purpose:** Create a Story Instance from Story definition and declared Narrative Container mode.  
**Inputs:** Story definition; owner/caster; Container profile; Narrative Claim; required capabilities; initial Authority/state.  
**Outputs:** `StoryRef`.  
**State Mutation:** Adds Story subsystem state.  
**Atomicity:** Story identity + initial state creation atomic.  
**Contract Dependencies:** Narrative Story Lifecycle Contract.  
**Tag Relationship:** Narrative state does not automatically become Functional Tag.  
**Does Not Do:** Does not Realize property; does not select Bearer automatically unless Story Contract requests later query.

---

## P-111 — BIND_STORY_PARTICIPANT

**ID:** `BIND_STORY_PARTICIPANT`  
**Class:** SYSTEM_GATEWAY_PRIMITIVE  
**Purpose:** Bind Container, Bearer, Proof Subject or other typed participant role to a Story Instance.  
**Inputs:** StoryRef; participant role; Entity/Object/Container ref; binding/lock/return policy.  
**Outputs:** updated Story participant binding.  
**State Mutation:** Updates Story subsystem references and possible bound-state metadata.  
**Atomicity:** Binding is atomic.  
**Contract Dependencies:** Narrative Container/Bearer Contract; Capability Requirement Contract.  
**Tag Relationship:** May rely on `QUERY_CAPABILITY` results such as `TRUE_DAMAGE`, `IMMUNITY`, `HEAL`.  
**Does Not Do:** Does not imply participant is Summon; does not transfer property yet.

---

## P-112 — REGISTER_WITNESS

**ID:** `REGISTER_WITNESS`  
**Class:** SYSTEM_GATEWAY_PRIMITIVE / RESOLVER_PRIMITIVE  
**Purpose:** Add/remove/update an eligible Witness relation between Actor and Story Instance.  
**Inputs:** StoryRef; Actor; eligibility result; knowledge state; presence/Combat Instance state.  
**Outputs:** Witness record/update.  
**State Mutation:** Mutates Narrative witness membership/knowledge record.  
**Atomicity:** Witness-record update atomic.  
**Contract Dependencies:** Witness Eligibility Contract; Perception Contract; Combat Instance Presence Contract.  
**Tag Relationship:** No Functional Tag.  
**Does Not Do:** Does not assume all ALIVE actors are Witness; does not count Summons without Chân Ngã if Story Contract excludes them.

---

## P-113 — UPDATE_CAUSAL_BELIEF

**ID:** `UPDATE_CAUSAL_BELIEF`  
**Class:** SYSTEM_GATEWAY_PRIMITIVE  
**Purpose:** Apply a declared Belief delta to Story/Witness belief state.  
**Inputs:** StoryRef; Witness or aggregate scope; delta/formula result; cause; caps/floors.  
**Outputs:** updated belief state; threshold-crossed result.  
**State Mutation:** Mutates Causal Belief.  
**Atomicity:** Belief update atomic per declared scope.  
**Contract Dependencies:** Causal Belief Contract; Witness Contract.  
**Tag Relationship:** No Functional Tag.  
**Does Not Do:** Does not decide formula such as BaseRate×WitnessCount in this registry; does not automatically Realize Story unless lifecycle Contract schedules it.

---

## P-114 — RECORD_STORY_EVIDENCE

**ID:** `RECORD_STORY_EVIDENCE`  
**Class:** SYSTEM_GATEWAY_PRIMITIVE  
**Purpose:** Record a Proof Event or Counter-Proof against a Story Claim.  
**Inputs:** StoryRef; evidence type; source Event; Witness visibility/knowledge; magnitude/classification.  
**Outputs:** evidence record + resulting narrative-resolution requests.  
**State Mutation:** Adds Story evidence/history and may change Story state through Contract-scheduled operations.  
**Atomicity:** Evidence record is atomic.  
**Contract Dependencies:** Proof/Counter-Proof Contract; Knowledge Contract.  
**Tag Relationship:** No Functional Tag.  
**Does Not Do:** Does not equate “Container took damage” with lost Belief unless Story Contract says so; does not automatically fail every Story on one Counter-Proof.

---

## P-115 — MODIFY_STORY_STABILITY

**ID:** `MODIFY_STORY_STABILITY`  
**Class:** SYSTEM_GATEWAY_PRIMITIVE  
**Purpose:** Modify Story/Container Stability independently of Causal Belief.  
**Inputs:** StoryRef; delta/set operation; cause; bounds.  
**Outputs:** updated Stability.  
**State Mutation:** Mutates Story Stability state.  
**Atomicity:** Atomic.  
**Contract Dependencies:** Narrative Stability Contract.  
**Tag Relationship:** No Functional Tag.  
**Does Not Do:** Does not directly change Causal Belief unless Contract schedules a separate operation.

---

## P-116 — REALIZE_STORY_PROPERTY

**ID:** `REALIZE_STORY_PROPERTY`  
**Class:** SYSTEM_GATEWAY_PRIMITIVE  
**Purpose:** Transition a qualifying Story to REALIZED and instantiate its declared gameplay-real Property.  
**Inputs:** StoryRef; threshold/proof state; property definition; target/bearer/container; Authority.  
**Outputs:** realized `PropertyRef`; Story state transition.  
**State Mutation:** Creates realized property and updates Story lifecycle.  
**Atomicity:** Story REALIZED transition + property creation atomic.  
**Contract Dependencies:** Narrative Realization Contract; Authority Contract; Property Contract.  
**Tag Relationship:** Realized Property may expose existing Functional Tags if its actual capability matches them, but narrative name alone does not create a Tag.  
**Does Not Do:** Does not automatically absorb property into caster; does not invent a new Functional Tag for every property title.

---

## P-117 — TRANSFER_STORY_PROPERTY

**ID:** `TRANSFER_STORY_PROPERTY`  
**Class:** SYSTEM_GATEWAY_PRIMITIVE  
**Purpose:** Transfer ownership/attachment of an already Realized Property between valid Narrative participants.  
**Inputs:** PropertyRef; source holder; destination holder; transfer/return reason; Authority.  
**Outputs:** updated property ownership/attachment.  
**State Mutation:** Changes property holder/owner references and any derived capability binding.  
**Atomicity:** Remove-from-source + add-to-destination is atomic.  
**Contract Dependencies:** Property Transfer Contract; Narrative Absorption/Return Contract; Capability Index Contract.  
**Tag Relationship:** Existing Tags may follow the Property if semantic ownership moves according to normalized property definition.  
**Does Not Do:** Does not copy an independent native capability that was never sourced from the Property.

### Sword stress-test
If Sword Realized Property grants True Damage:
- removing/absorbing Sword removes only the Sword-sourced True Damage;
- Bearer's independent native True Damage remains.

---

## P-118 — PROPAGATE_KNOWLEDGE

**ID:** `PROPAGATE_KNOWLEDGE`  
**Class:** SYSTEM_GATEWAY_PRIMITIVE  
**Purpose:** Propagate Story knowledge/counter-knowledge from one Witness set to another under declared delay/network policy.  
**Inputs:** StoryRef; source Witness; destination candidates; knowledge state; propagation event/context.  
**Outputs:** knowledge-state updates.  
**State Mutation:** Mutates Narrative Knowledge State.  
**Atomicity:** One propagation batch atomic at its scheduled point.  
**Contract Dependencies:** Knowledge Propagation Contract; Witness/Perception Contract.  
**Tag Relationship:** No Functional Tag.  
**Does Not Do:** Does not simulate arbitrary dialogue; does not define delay value in Primitive Registry.

---

# 21. WORLD HISTORY / QUANG ẢNH PRIMITIVE

## P-120 — RECORD_HISTORY_SNAPSHOT

**ID:** `RECORD_HISTORY_SNAPSHOT`  
**Class:** SYSTEM_GATEWAY_PRIMITIVE  
**Purpose:** Persist a canonical historical snapshot for systems such as Quang Ảnh Chi Hà after a qualifying Action completion point.  
**Inputs:** Combat Instance; history profile; ActionRef; field whitelist/full-state spec; sequence number.  
**Outputs:** persistent `SnapshotRef` in history timeline.  
**State Mutation:** Appends immutable history snapshot metadata/storage; does not alter current combat state.  
**Atomicity:** Snapshot corresponds to exactly one authoritative committed state version.  
**Contract Dependencies:** Quang Ảnh Chi Hà Contract; Action Completion Contract; Snapshot Contract.  
**Tag Relationship:** No Functional Tag required.  
**Does Not Do:** Does not decide when “complete Action” occurs; does not regress state. Regression uses `RESTORE_SNAPSHOT`.

---

# 22. PRIMITIVE COMPOSITION PATTERNS

This section demonstrates how complex mechanics emerge from composition.

It is **not Ability Schema syntax**.

---

## 22.1 Physical Basic Attack

Semantic:

```text
AbilityType = BASIC_ATTACK
ActionIdentity = BASIC_ATTACK
TargetSpec = one enemy
EffectTags = DAMAGE + PHYSICAL_DAMAGE
```

Execution shape:

```text
BUILD_CANDIDATE_POOL
→ FILTER_CANDIDATE_POOL
→ SELECT_TARGETS
→ CAPTURE_SNAPSHOT
→ BUILD_DAMAGE_PACKET
→ RESOLVE_DAMAGE_PACKET
→ COMMIT_DAMAGE_RESULT
→ death pipeline if HP_ZERO
```

No Primitive named:
`BASIC_ATTACK_PRIMITIVE`.

---

## 22.2 Mixed Damage Skill using Basic Attack profile

Semantic:

```text
AbilityType = SKILL
ActionIdentity = SKILL
DamageProfileSource = BASIC_ATTACK_PROFILE
Tags = DAMAGE + PHYSICAL_DAMAGE + WILL_DAMAGE
```

Execution uses same damage primitives.

Because:
> copying Damage Profile does not copy Action Identity.

---

## 22.3 Simultaneous full-field AoE

Execution concept:

```text
RESOLVE_AREA
→ CAPTURE shared source/target state
→ BUILD_DAMAGE_PACKET for all targets
→ RESOLVE_DAMAGE_PACKET for all targets from same snapshot
→ COMMIT_DAMAGE_RESULT as one batch
→ then death/reaction processing according to Contract
```

This preserves:
> target A dying does not change target B calculation inside same simultaneous Action.

---

## 22.4 Sequential multihit

```text
for each declared hit through Schema/Kernel orchestration:
    BUILD_DAMAGE_PACKET
    RESOLVE_DAMAGE_PACKET
    COMMIT_DAMAGE_RESULT
    process allowed intermediate consequences per Contract
```

There is no generic `LOOP` Primitive.

Hit sequence is data + Kernel execution plan.

---

## 22.5 Ký Ức Skill 2 damage echo

After ally Damage Action completes:

```text
AGGREGATE_DAMAGE_RESULTS
(metric = Actual HP Damage, group = target)
→ TriggerSpec filters target whose damage >= 30% Max HP
→ BUILD_DAMAGE_PACKET
(amount = 50% referenced Actual HP Damage)
(type = True Damage)
→ RESOLVE_DAMAGE_PACKET
→ COMMIT_DAMAGE_RESULT
```

No copy of:
- Debuff;
- Mark;
- Control;
- Lifesteal;
- Follow-up identity;
because only numeric damage result is referenced.

---

## 22.6 Ultimate heal from Actual HP Damage

```text
Damage Action resolves
→ AGGREGATE_DAMAGE_RESULTS(metric=Actual HP Damage)
→ RESOLVE_HEAL(amount = 20% aggregate)
→ COMMIT_HEAL_RESULT
```

Overkill and Shield absorption are excluded if metric is Actual HP Damage.

---

## 22.7 Forgotten

```text
CREATE_STATE_INSTANCE(
    semantic = TARGET_EXCLUSION,
    attachment = ENTITY
)

presentation layer independently hides actor for allowed observer
```

Targeting:

```text
BUILD_CANDIDATE_POOL
→ FILTER_CANDIDATE_POOL sees TARGET_EXCLUSION
→ actor absent from direct pool
```

Fixed Area:

```text
RESOLVE_AREA
→ actor still included because Position remains occupied
```

No immunity Primitive is involved.

---

## 22.8 Debuff Cleanse

```text
find StateRefs matching Debuff eligibility
→ REMOVE_STATE_INSTANCE
```

Tag:
`DEBUFF_CLEANSE`

No need for duplicate executable primitive:
`PURIFY`, `CLEANSE`, `REMOVE_DEBUFF`.

---

## 22.9 SSR Warrior post-action HP loss

If canonicalized as consequence, not Cost:

```text
APPLY_HP_LOSS(1% Max HP)
→ MODIFY_RESOURCE(+4 Rage)
→ if HP_ZERO:
   BEGIN_DEATH_EVALUATION
```

No Damage Packet.

If future user correction says:
> it is payment Cost,

then normalized primitive changes to:
`COMMIT_HP_COST`.

This is why HP Loss and Self HP Cost cannot be collapsed.

---

## 22.10 Temporary Max HP reduction

```text
MUTATE_MAX_HP(-20%)
→ RECONCILE_CURRENT_HP
```

When expires:

```text
MUTATE_MAX_HP(remove mutation contribution)
→ RECONCILE_CURRENT_HP(return policy)
```

No fake Heal unless Contract explicitly creates a Heal effect.

---

## 22.11 Revive

Canonical high-level flow:

```text
DEATH_CONFIRMED already happened
→ CREATE_REVIVE_PENDING
→ wait according to Revive Contract
→ VALIDATE_MATERIALIZATION_CONSTRAINTS
→ APPLY_LIFE_IDENTITY_TRANSITION
→ MATERIALIZE_ENTITY
```

`lifeSerial` policy is supplied by character/global Revive Contract.

No use of Death Prevention.

---

## 22.12 Reincarnation

```text
DEATH_CONFIRMED
→ ENTER_REINCARNATION_WAITING
→ ADVANCE_REINCARNATION_WAITING
→ ENTER_REINCARNATION
→ ROUTE_REINCARNATION
→ VALIDATE_MATERIALIZATION_CONSTRAINTS
→ APPLY_LIFE_IDENTITY_TRANSITION
→ MATERIALIZE_ENTITY
```

Special host systems may add:
`APPLY_COMBAT_DEFINITION_INHERITANCE`.

---

## 22.13 Pygmalion new Life Cycle creates one new Puppet

Correct structural pattern:

```text
CONSUME_LIFECYCLE_QUOTA(
    scope = current Pygmalion Life Cycle,
    key = CREATE_NEW_PUPPET,
    max = 1
)
→ SPAWN_ENTITY(new Puppet)
```

Incorrect pattern:

```text
if any Puppet exists:
    cannot create Puppet
```

Because old Puppets persist independently.

---

## 22.14 Pygmalion inhabited Puppet

Possible normalized flow:

```text
ROUTE_REINCARNATION
(destination = eligible Puppet)
→ APPLY_LIFE_IDENTITY_TRANSITION
→ APPLY_COMBAT_DEFINITION_INHERITANCE
→ MATERIALIZE/activate inhabited state as Contract requires
```

Important:
- Behavior Source may become inherited definition.
- Damage Attribution may remain Pygmalion for specific Ultimate follow-up.
- host Puppet stat basis may remain unchanged.
- Class/Element inheritance remains unresolved.

---

## 22.15 Composite Ultimate with preserved child Authority

Luân Hồi Chi Chủ pattern:

```text
REQUEST_ACTION(child Basic/Skill3, authorityPolicy=PRESERVE_CHILD)
→ after child resolution boundary
→ REQUEST_ACTION(child Skill1, authorityPolicy=PRESERVE_CHILD)
```

Outer Ultimate does not upgrade child Authority.

---

## 22.16 Composite Ultimate with inherited outer Authority

SSR Warrior legacy pattern:

```text
REQUEST_ACTION(child Skill1, authorityPolicy=INHERIT_OUTER)
→ REQUEST_ACTION(child Skill2, authorityPolicy=INHERIT_OUTER)
```

Both patterns use same `REQUEST_ACTION`.

Therefore:
> no separate Primitive per authority inheritance style.

---

## 22.17 Arena

```text
CREATE_COMBAT_INSTANCE(type=ARENA)
→ TRANSFER_ENTITY_TO_INSTANCE(participant A)
→ TRANSFER_ENTITY_TO_INSTANCE(participant B)
→ Arena combat resolves
→ RETURN_ENTITY_FROM_INSTANCE(survivors/eligible)
→ CLOSE_COMBAT_INSTANCE
```

World Axiom/death semantics are governed by Contracts, not duplicated in an “Arena death system”.

---

## 22.18 Cố Sự Chi Thần

```text
CREATE_STORY_INSTANCE
→ QUERY_CAPABILITY
→ BIND_STORY_PARTICIPANT
→ REGISTER_WITNESS
→ UPDATE_CAUSAL_BELIEF
→ RECORD_STORY_EVIDENCE
→ MODIFY_STORY_STABILITY
→ REALIZE_STORY_PROPERTY
→ optionally TRANSFER_STORY_PROPERTY
```

No `DO_STORY` Primitive.

---

# 23. TAG → PRIMITIVE RELATIONSHIP MATRIX

This is illustrative, not exhaustive.

| Functional Tag | Common Primitive composition |
|---|---|
| `DAMAGE` | BUILD_DAMAGE_PACKET → RESOLVE_DAMAGE_PACKET → COMMIT_DAMAGE_RESULT |
| `PHYSICAL_DAMAGE` | BUILD_DAMAGE_PACKET(component=PHYSICAL) → shared damage resolver |
| `WILL_DAMAGE` | BUILD_DAMAGE_PACKET(component=WILL) → shared damage resolver |
| `TRUE_DAMAGE` | BUILD_DAMAGE_PACKET(component=TRUE) → shared damage resolver |
| `PENETRATION` | DamagePacket parameter/profile + RESOLVE_DAMAGE_PACKET |
| `DAMAGE_REDUCTION` | State/Stat setup + RESOLVE_DAMAGE_PACKET reads reduction layer |
| `SHIELD_PIERCING` | DamagePacket Shield policy + RESOLVE_DAMAGE_PACKET |
| `HEAL` | RESOLVE_HEAL → COMMIT_HEAL_RESULT |
| `SHIELD` | CREATE/MODIFY/REMOVE_SHIELD_INSTANCE |
| `BUFF` | CREATE/MODIFY/REMOVE_STATE_INSTANCE |
| `DEBUFF` | CREATE/MODIFY/REMOVE_STATE_INSTANCE |
| `MARK` | CREATE/MODIFY/REMOVE_STATE_INSTANCE attachment=ENTITY |
| `DEBUFF_CLEANSE` | filter Debuff StateRefs → REMOVE_STATE_INSTANCE |
| `STAT_MODIFIER` | MODIFY_STAT or state-owned modifier application |
| `RESOURCE_MODIFIER` | MODIFY_RESOURCE |
| `POSITION_MUTATION` | MUTATE_POSITION |
| `FIELD` | CREATE_STATE_INSTANCE attachment=BATTLEFIELD/geometry |
| `HP_LOSS` | APPLY_HP_LOSS |
| `SELF_HP_COST` | VALIDATE_COST → COMMIT_HP_COST |
| `MAX_HP_MUTATION` | MUTATE_MAX_HP → RECONCILE_CURRENT_HP |
| `IMMUNITY` | CREATE_STATE_INSTANCE; Effect Admission reads immunity state |
| `TARGET_EXCLUSION` | CREATE_STATE_INSTANCE; FILTER_CANDIDATE_POOL observes it |
| `AIRBORNE` | CREATE_STATE_INSTANCE and optionally MUTATE_POSITION |
| `POSITION_MARK` | CREATE_STATE_INSTANCE attachment=POSITION |
| `DEATH_PREVENTION` | CREATE_STATE/ability listener + RESOLVE_DEATH_PREVENTION |
| `REVIVE` | CREATE_REVIVE_PENDING → life/materialization primitives |
| `REINCARNATION` | waiting/enter/routing/materialization primitives |
| `TEMPORARY_ABSENCE` | ENTER_TEMPORARY_ABSENCE → RETURN_FROM_TEMPORARY_ABSENCE |
| `SUMMON` | SPAWN_ENTITY(entityKind=SUMMON) |
| `ARENA` | Combat Instance gateway primitives |
| `COMBAT_DEFINITION_INHERITANCE` | APPLY_COMBAT_DEFINITION_INHERITANCE |

---

# 24. PRIMITIVE → MULTIPLE TAG EXAMPLES

## CREATE_STATE_INSTANCE

May support:
- BUFF
- DEBUFF
- MARK
- IMMUNITY
- TARGET_EXCLUSION
- AIRBORNE
- POSITION_MARK
- FIELD

Therefore:
> Primitive cannot be named after one of those Tags.

---

## BUILD_DAMAGE_PACKET / RESOLVE_DAMAGE_PACKET

May support:
- DAMAGE
- PHYSICAL_DAMAGE
- WILL_DAMAGE
- TRUE_DAMAGE
- PENETRATION
- SHIELD_PIERCING

One damage runtime pipeline handles multiple semantic profiles.

---

## MATERIALIZE_ENTITY

May be used by:
- REVIVE
- REINCARNATION
- TEMPORARY_ABSENCE return
- generic delayed spawn

Therefore:
> materialization is lifecycle operation, not synonym for Revive.

---

# 25. FORBIDDEN PRIMITIVE PATTERNS

The following should be rejected from canonical Primitive Registry unless architecture is explicitly redesigned.

## 25.1 Character-named Primitive

Rejected:
- `PYGMALION_REBIRTH`
- `MEMORY_GOD_ECHO`
- `LUAN_HOI_CHU_COCOON`
- `SILAS_AIRBORNE_SHOT`

Reason:
> Character is data/composition.

A real subsystem name is allowed only if system truly exists independently.

---

## 25.2 Tag-mirror Primitive

Rejected as default:
- `TRUE_DAMAGE_PRIMITIVE`
- `BUFF_PRIMITIVE`
- `REACTION_PRIMITIVE`

Reason:
> Tag semantics and executable state operations are different layers.

---

## 25.3 Arithmetic micro-language

Rejected:
- ADD
- MULTIPLY
- DIVIDE
- IF
- ELSE
- LOOP
- JUMP

Reason:
> Ability Schema would become a programming language.

Use formula expressions, declarative conditions and Kernel orchestration.

---

## 25.4 Presentation Primitive used as gameplay

Rejected:
- `PLAY_ANIMATION_THEN_DAMAGE`
as authoritative combat behavior.

Presentation can subscribe to Action/Event state.

Damage timing must be Contract-driven.

---

## 25.5 Generic arbitrary script escape hatch

Rejected:
- `RUN_CUSTOM_SCRIPT`
- `EXECUTE_CSHARP`
- `CALL_CHARACTER_CALLBACK`

as ordinary Character data path.

If an exceptional mechanic truly cannot fit:
> first determine whether a missing system-level Primitive/Contract exists.

---

## 25.6 One giant system Primitive

Rejected:
- `DO_REINCARNATION`
- `DO_NARRATIVE`
- `DO_ARENA`

Reason:
> hidden behavior becomes impossible to inspect/compose/debug.

System gateways may exist, but must expose meaningful transitions.

---

# 26. ATOMICITY RULES FOR PRIMITIVE DESIGN

## 26.1 Primitive atomicity is not Action atomicity

A Primitive can be atomic while an Action contains many Primitives.

Example:
- each `COMMIT_DAMAGE_RESULT` can be atomic;
- simultaneous Action can batch multiple results in one transaction.

---

## 26.2 Simultaneous batch

For shared-snapshot AoE:

1. all calculation Primitives read the same snapshot;
2. no target commit becomes visible to another calculation in same batch;
3. commit occurs as one batch;
4. downstream observers run according to Contract.

---

## 26.3 Sequential action

For sequential hit/action:

1. resolve component;
2. commit;
3. allowed observers/reactions/death process according to Contract;
4. next component can read changed state.

Primitive Registry does not hardcode which mode every Ability uses.

---

# 27. ATTRIBUTION RULES FOR PRIMITIVES

Every effect-producing Primitive that can matter for credit should accept or inherit an attribution context.

At minimum runtime must distinguish:

- Caster;
- Owner;
- Source;
- Behavior Source;
- Effect Source;
- Damage Attribution;
- Kill Attribution;
- Trigger Cause.

## 27.1 No implicit collapse

Do not assume:

```text
Caster = Source = Owner = Damage Attribution
```

They may often be equal, but equality must be data/default, not architecture.

---

## 27.2 Pygmalion proof

Puppet may:

- use inherited Combat Definition as Behavior Source;
- be immediate Source of attack animation/entity;
- while Damage Attribution is Pygmalion for a specific Ultimate.

Primitive interfaces must allow this.

---

# 28. AUTHORITY RULES FOR PRIMITIVES

Primitive does not own lore Authority.

Authority is supplied from normalized effect/action/system context.

A Primitive:

1. requests Effect Admission / conflict resolution when needed;
2. receives allowed/blocked/modified outcome;
3. applies mutation only within permitted authority.

## 28.1 No “Prime = Axiom” shortcut

`Rank=Prime` does not automatically set every Primitive call:
`authority=Axiom`.

## 28.2 Child action policy

`REQUEST_ACTION` must carry explicit child authority policy.

Existing stress tests require both:
- preserve child authority;
- inherit outer authority.

---

# 29. EVENT RULES FOR PRIMITIVES

Events are generated from canonical state/action transitions.

Examples:

- damage result committed;
- Heal committed;
- state added/removed;
- Position mutated;
- HP_ZERO;
- DEATH_CONFIRMED;
- entity materialized;
- Action completed.

Primitive Registry does not finalize exact event names/order.

## 29.1 No fake event semantics

A non-Damage HP Cost cannot emit ordinary:
`DAMAGE_TAKEN`
just because HP decreased.

A direct Target Exclusion state cannot emit:
`IMMUNE_TO_AOE`
because that semantic does not exist.

---

# 30. TRACE REQUIREMENT PER PRIMITIVE

Each Primitive execution should produce trace metadata sufficient to answer:

1. Which Primitive ran?
2. Which Action/system requested it?
3. Which source/owner/caster?
4. Which target/state/object?
5. Which SnapshotRef?
6. Which parameters?
7. Which Authority?
8. Which RNG draw?
9. What StateDelta was proposed?
10. What StateDelta committed?
11. Which result values?
12. Which downstream lifecycle/event was produced?
13. Why was it blocked/skipped?

This is essential for debugging complex kits.

---

# 31. PRIMITIVE STATUS: CANONICAL VS CONTRACT-INCOMPLETE

All Primitive IDs in this file are **working canonical candidates at the semantic-operation level**.

However many remain **Contract-incomplete**.

That means:

> the operation boundary is stable enough to design around, but exact behavior must not be invented until `05_CONTRACTS.md`.

Examples:

- `MUTATE_MAX_HP` exists, but reconciliation variants need Contract.
- `ADVANCE_REINCARNATION_WAITING` exists, but what the global waiting “4” counts remains unresolved.
- `REQUEST_ACTION` exists, but exact reaction/interrupt ordering remains Contract-level.
- `RESOLVE_DAMAGE_PACKET` exists, but Final Damage Reduction vs True Damage still needs Contract.
- `MATERIALIZE_ENTITY` exists, but Position retry and Uniqueness resolution need Contract.

---

# 32. DEFERRED PRIMITIVE CANDIDATES

These are intentionally not added as canonical Primitives yet.

## 32.1 EXECUTE_TARGET

Deferred because Execute semantic itself is unresolved.

Questions:
- Damage or lifecycle?
- bypass HP?
- goes through HP_ZERO?
- Death Prevention?
- Authority?
- threshold timing?

Do not add until Character corpus forces answer.

---

## 32.2 REFLECT_DAMAGE

Deferred because current behavior can be composition:

```text
TriggerSpec on qualifying damage
→ BUILD_DAMAGE_PACKET with reflected formula/source
→ RESOLVE_DAMAGE_PACKET
→ COMMIT_DAMAGE_RESULT
```

Recursion guard belongs Contract.

Add only if repeated reflection semantics justify a specialized operation.

---

## 32.3 LIFESTEAL

Deferred as Primitive because:

```text
AGGREGATE_DAMAGE_RESULTS
→ RESOLVE_HEAL
→ COMMIT_HEAL_RESULT
```

already expresses current semantic.

---

## 32.4 CLEANSE_DEBUFF

Not added because:
> filter eligible Debuff states + REMOVE_STATE_INSTANCE.

---

## 32.5 APPLY_AIRBORNE

Not added because:
> CREATE_STATE_INSTANCE(AIRBORNE)
plus optional Position Mutation.

If Airborne later has universal physics pipeline requiring unique atomic operation:
> review.

---

## 32.6 CREATE_POSITION_MARK

Not added because:
> CREATE_STATE_INSTANCE attachment=POSITION.

---

## 32.7 CREATE_FIELD

Not added because:
> CREATE_STATE_INSTANCE attachment=BATTLEFIELD/geometry
is sufficient at current abstraction.

If Field later requires independent entity-like simulation:
> review.

---

## 32.8 CHECK_UNIQUENESS

Not a standalone public Primitive.

Uniqueness validation is currently part of:
`VALIDATE_MATERIALIZATION_CONSTRAINTS`
and Authority/Axiom resolver.

If Duy Nhất gains broader mutation APIs:
> review system gateway.

---

# 33. STRESS-TEST COVERAGE MATRIX

Legend:
- `✓` directly supported.
- `C` needs Contract detail.
- `S` system gateway required.
- `U` unresolved character semantics, not missing Primitive.

| Mechanic | Coverage |
|---|---|
| Basic Attack vs profile copy | ✓ REQUEST_ACTION + damage primitives + Action Identity |
| Follow-up | ✓ REQUEST_ACTION; C scheduler ordering |
| Counter | ✓ REQUEST_ACTION; C Trigger/Scheduler |
| Forced Action | ✓ REQUEST_ACTION; C SSI interaction |
| Multihit | ✓ damage primitives; C sequential/simultaneous |
| Simultaneous AoE | ✓ snapshot + area + damage batch; C commit order |
| Sequential hit | ✓ damage pipeline; C intermediate observer order |
| Target lock | ✓ TargetSetRef + VALIDATE_TARGET_SET |
| Target re-query | ✓ rerun target resolver pipeline |
| Forgotten direct exclusion | ✓ state + target filter |
| Forgotten fixed AoE still hit | ✓ separate RESOLVE_AREA |
| True Damage | ✓ shared damage resolver |
| True Damage vs Shield | ✓ packet Shield policy; C Damage Contract |
| Shield Piercing | ✓ packet policy |
| Actual HP Damage | ✓ DamageResult |
| Overkill | ✓ DamageResult |
| Action-level damage aggregation | ✓ AGGREGATE_DAMAGE_RESULTS |
| Echo 50% actual damage | ✓ aggregate + new packet |
| Overheal | ✓ RESOLVE_HEAL |
| HP Cost | ✓ VALIDATE_COST + COMMIT_HP_COST |
| non-Cost HP Loss | ✓ APPLY_HP_LOSS |
| Max HP mutation | ✓ MUTATE_MAX_HP + reconcile |
| Death Prevention | ✓ lifecycle pipeline |
| DEATH_CONFIRMED | ✓ CONFIRM_DEATH |
| Revive | ✓ pending + identity + materialization; C lifeSerial |
| Reincarnation waiting | ✓; C clock |
| Force entry Reincarnation | ✓; C batching/authority |
| Reincarnation route | ✓; S |
| Reincarnation exhausted | ✓ |
| Presentation ≠ Combat Definition | ✓ separate bind primitives |
| Pygmalion definition inheritance | ✓ S |
| Pygmalion multiple Puppets | ✓ lifecycle quota + spawn |
| Pygmalion attribution split | ✓ attribution context; C exact child effects |
| Temporary absence | ✓ |
| Arena isolated instance | ✓ S |
| Arena object cleanup | ✓ close-instance; C transfer policy |
| Duy Nhất materialization check | ✓ validation; C conflict result |
| Narrative Story | ✓ S |
| Witness/Belief/Proof | ✓ S; C formula |
| Capability query | ✓ |
| Realized property transfer | ✓ S |
| Quang Ảnh snapshots | ✓ S |
| Regression | ✓ S; C lifecycle/event history |
| Execute | U — semantic not yet canonical |
| SSR Warrior post-action 1% HP classification | U — HP_LOSS vs SELF_HP_COST |
| Pygmalion Class inheritance | U |
| Pygmalion Element inheritance | U |

---

# 34. PRIMITIVE ACCEPTANCE TEST

A new Primitive proposal must pass all questions:

## Q1 — Is it executable?
If it only describes meaning:
> Tag/Terminology, not Primitive.

## Q2 — Does Kernel need this operation in more than one concrete mechanic or as a genuine subsystem boundary?
If no:
> probably Character-specific special case; inspect composition first.

## Q3 — Can existing Primitives compose it without losing an important atomicity/lifecycle invariant?
If yes:
> do not add.

## Q4 — Is it merely a parameter?
If yes:
> Schema/Parameter.

## Q5 — Is it merely ordering/timing?
If yes:
> Contract.

## Q6 — Is it merely a query facet?
If yes:
> Schema/Capability Index.

## Q7 — Would adding it turn Primitive Registry into a programming language?
If yes:
> reject.

## Q8 — Can it be traced deterministically?
If no:
> reject/redesign.

## Q9 — Does it collapse distinct semantic layers?
Examples:
- Source vs Attribution;
- HP_ZERO vs Death;
- Presentation vs Combat Definition.
If yes:
> reject/redesign.

---

# 35. PRIMITIVE REGISTRY INDEX

## Action / Snapshot
- P-001 `REQUEST_ACTION`
- P-002 `CAPTURE_SNAPSHOT`
- P-003 `RESTORE_SNAPSHOT`

## Target
- P-010 `BUILD_CANDIDATE_POOL`
- P-011 `FILTER_CANDIDATE_POOL`
- P-012 `SELECT_TARGETS`
- P-013 `RESOLVE_AREA`
- P-014 `VALIDATE_TARGET_SET`

## State
- P-020 `CREATE_STATE_INSTANCE`
- P-021 `MODIFY_STATE_INSTANCE`
- P-022 `REMOVE_STATE_INSTANCE`

## Stat / Resource / Cost
- P-030 `MODIFY_STAT`
- P-031 `MUTATE_MAX_HP`
- P-032 `RECONCILE_CURRENT_HP`
- P-033 `MODIFY_RESOURCE`
- P-034 `VALIDATE_COST`
- P-035 `COMMIT_RESOURCE_COST`
- P-036 `COMMIT_HP_COST`
- P-037 `APPLY_HP_LOSS`

## Damage
- P-040 `BUILD_DAMAGE_PACKET`
- P-041 `RESOLVE_DAMAGE_PACKET`
- P-042 `COMMIT_DAMAGE_RESULT`
- P-043 `AGGREGATE_DAMAGE_RESULTS`

## Heal
- P-044 `RESOLVE_HEAL`
- P-045 `COMMIT_HEAL_RESULT`

## Shield
- P-046 `CREATE_SHIELD_INSTANCE`
- P-047 `MODIFY_SHIELD_INSTANCE`
- P-048 `REMOVE_SHIELD_INSTANCE`

## Position / Entity
- P-050 `MUTATE_POSITION`
- P-051 `SPAWN_ENTITY`
- P-052 `REMOVE_ENTITY`
- P-053 `DESPAWN_ENTITY`
- P-054 `FUSION_CONSUME_ENTITY`
- P-055 `ERASE_ENTITY`

## Death / Reincarnation
- P-060 `BEGIN_DEATH_EVALUATION`
- P-061 `RESOLVE_DEATH_PREVENTION`
- P-062 `CONFIRM_DEATH`
- P-063 `CREATE_REVIVE_PENDING`
- P-064 `ENTER_REINCARNATION_WAITING`
- P-065 `ADVANCE_REINCARNATION_WAITING`
- P-066 `ENTER_REINCARNATION`
- P-067 `ROUTE_REINCARNATION`
- P-068 `SET_REINCARNATION_EXHAUSTED`
- P-069 `MATERIALIZE_ENTITY`

## Temporary Presence
- P-070 `ENTER_TEMPORARY_ABSENCE`
- P-071 `RETURN_FROM_TEMPORARY_ABSENCE`

## Identity / Definition
- P-080 `APPLY_LIFE_IDENTITY_TRANSITION`
- P-081 `BIND_PRESENTATION_DEFINITION`
- P-082 `BIND_COMBAT_DEFINITION`
- P-083 `APPLY_COMBAT_DEFINITION_INHERITANCE`
- P-084 `CONSUME_LIFECYCLE_QUOTA`
- P-085 `VALIDATE_MATERIALIZATION_CONSTRAINTS`

## Combat Instance
- P-090 `CREATE_COMBAT_INSTANCE`
- P-091 `TRANSFER_ENTITY_TO_INSTANCE`
- P-092 `RETURN_ENTITY_FROM_INSTANCE`
- P-093 `CLOSE_COMBAT_INSTANCE`

## Capability
- P-100 `QUERY_CAPABILITY`

## Narrative
- P-110 `CREATE_STORY_INSTANCE`
- P-111 `BIND_STORY_PARTICIPANT`
- P-112 `REGISTER_WITNESS`
- P-113 `UPDATE_CAUSAL_BELIEF`
- P-114 `RECORD_STORY_EVIDENCE`
- P-115 `MODIFY_STORY_STABILITY`
- P-116 `REALIZE_STORY_PROPERTY`
- P-117 `TRANSFER_STORY_PROPERTY`
- P-118 `PROPAGATE_KNOWLEDGE`

## World History
- P-120 `RECORD_HISTORY_SNAPSHOT`

### Total
**65 Canonical Primitive IDs** in this working candidate.

Important:
> total count is not a design goal.

If two Primitives later prove to have the same operation boundary, merge them.
If a stress test exposes a missing atomic/system operation, add one only after Primitive Acceptance Test.

---

# 36. WHAT IS STILL NOT CANONICAL AFTER STAGE D

This file intentionally leaves the following to later stages.

## Ability Schema
Still not canonical:
- exact JSON/YAML/data structure;
- child action syntax;
- EffectSpec format;
- TargetSpec format;
- TriggerSpec format;
- AttributionSpec format;
- AuthoritySpec format.

That is Chặng E.

---

## Contracts
Still not canonical:
- SSI event ordering;
- exact Turn Boundary timing;
- reaction priority;
- simultaneous commit/death ordering;
- True Damage vs Final Damage Reduction;
- Shield priority;
- Cost reservation/refund;
- Revive lifeSerial default;
- Reincarnation waiting clock;
- same-tier Authority;
- Arena return fallback;
- Narrative formula/delay.

That is Chặng F.

---

## Kernel Runtime
Still not canonical:
- queue data structures;
- event bus internals;
- transaction implementation;
- trace format;
- deterministic RNG stream topology;
- frame/update implementation.

That is Chặng G.

---

# 37. STAGE D FINAL INVARIANTS

1. **Primitive is executable behavior; Tag is semantic vocabulary.**
2. **Tag ↔ Primitive is many-to-many.**
3. Character mechanics normally compose existing Primitives.
4. No Character-named Primitive for ordinary kit logic.
5. No arithmetic IF/LOOP pseudo-language in Primitive Registry.
6. No Ability Type or Action Behavior Primitive merely to mirror Schema.
7. Target Selection and Area Resolution use separate resolver operations.
8. Calculation and commit are separated where simultaneous semantics need it.
9. Damage Packet resolution is shared across Physical/Will/True components.
10. True Damage and Shield Piercing remain separate parameters/Tags through one damage pipeline.
11. Actual HP Damage and Overkill are outputs, not guessed later from HP bars.
12. Heal calculation exposes Overheal as result data.
13. HP Cost and HP Loss use different Primitives.
14. Max HP mutation has explicit reconciliation operation.
15. HP_ZERO opens death evaluation; it does not directly equal confirmed death.
16. Death Prevention and Revive use different lifecycle stages.
17. Revive and Reincarnation share some materialization infrastructure but remain distinct semantics.
18. Materialization is generic lifecycle operation, not synonym for Revive.
19. Removal, Despawn, Fusion Consumption and Erasure remain distinct lifecycle operations.
20. Presentation Definition and Combat Definition bind independently.
21. Combat Definition inheritance must preserve declared host layers instead of blindly cloning definition.
22. Lifecycle quota is separate from active-entity singleton logic.
23. Pygmalion supports multiple persistent Puppets across Life Cycles.
24. Behavior Source can differ from Damage Attribution.
25. Arena is isolated Combat Instance, not Field/teleport.
26. Narrative System is decomposed into meaningful gateway operations, not one monolithic primitive.
27. Capability query reads Tags + Schema facets + system metadata.
28. Quang Ảnh history snapshot is a system operation distinct from ordinary transient Action snapshot.
29. Primitive execution must be deterministic and traceable.
30. Exact ordering belongs to Contract, not silently inside arbitrary Primitive implementation.

---

# 38. NEXT STAGE

After review/acceptance of this file:

> **Chặng E — `04_ABILITY_SCHEMA.md`**

The Schema must be designed to declare compositions that compile into the Primitives above while preserving:

- Ability Type;
- Action Identity;
- Action Behavior;
- Trigger;
- Target;
- Snapshot;
- Cost;
- Effect;
- Primitive request;
- State;
- Duration;
- Authority;
- Attribution;
- mode profile;
- Tags;
- parent/child action relationships.

The key acceptance test for Chặng E will be:

> Can the existing hard characters be represented as declarative data without inventing character-specific runtime code or turning the Schema into a programming language?
