# ARCLUNE — KERNEL RUNTIME
## Chặng G — Deterministic Runtime Architecture
**Version:** 2026-09-19-G.1  
**Status:** Working Canonical Candidate  
**Depends on:** `01_TERMINOLOGY_vNext.md`, `02_TAG_vNext.md`, `03_PRIMITIVE.md`, `04_ABILITY_SCHEMA.md`, `05_CONTRACTS.md`  
**Scope:** runtime architecture, state ownership, schedulers, queues, transaction boundaries, execution pipeline, deterministic ordering, authority adjudication, lifecycle systems, traceability.  
**Non-goal:** implementation code, Unity class layout, networking transport, renderer, editor UI.

**Revision G.1:** incorporates Pilot Normalization #3 runtime support for bounded Action Intent interposition/revalidation, dynamic distributed multi-payer Cost execution, immutable typed Cost-payment results, scoped Effect-amount modifier evaluation, and explicit `AFTER_DIRECT_EFFECTS_COMPLETE` sequential Reaction-boundary execution. No new Functional Tag or Primitive is introduced.

---

# 0. EXECUTIVE ARCHITECTURE

Arclune Kernel is the authoritative deterministic runtime that executes normalized Character data.

Canonical pipeline:

```text
Character Authoring Data
→ Validator / Normalizer
→ Normalized Ability IR
→ Kernel Action Runtime
→ Primitive Dispatcher
→ Contract Resolver
→ Authoritative State Store
→ Events / Trigger Queue / Lifecycle
→ Execution Trace
```

The Kernel must preserve this architectural split:

```text
Character = data/composition
Kernel = behavior/runtime
Tag = semantic vocabulary
Primitive = executable operation
Contract = exact resolution rule
```

The Kernel must **not** recover Character behavior by reading prose or Character names.

---

# 1. KERNEL DESIGN PRINCIPLES

## K-001 — Deterministic

Same:
- initial authoritative state;
- normalized data;
- Contract versions;
- RNG seeds;
- input decisions;

must produce the same gameplay result.

---

## K-002 — Traceable

Every meaningful state change must be explainable from an ordered trace.

---

## K-003 — Data-driven

Ordinary Character mechanics resolve from normalized Ability data and reusable systems.

Rejected default:

```text
if characterId == "PYGMALION":
    special_case()
```

---

## K-004 — Contract-governed

Primitives do not invent timing.

If exact behavior depends on:
- simultaneous vs sequential;
- child Authority;
- Cost timing;
- target invalidation;
- lifecycle ordering;

the Kernel reads the declared Contract/profile.

---

## K-005 — Atomic where semantics require

Partial state from:
- simultaneous damage;
- multi-resource cost;
- materialization;
- Position swap;
- property transfer;

must not become externally observable.

---

## K-006 — Presentation-independent

Gameplay state does not wait for:
- animation frame;
- VFX completion;
- voice;
- camera.

Presentation observes authoritative runtime events.

---

# 2. MAJOR KERNEL SUBSYSTEMS

The Kernel is composed of reusable runtime services.

```text
Kernel
├── Definition Registry
├── Combat Instance Manager
├── Entity Store
├── Identity / True Self Store
├── Action Scheduler
├── SSI Scheduler
├── Trigger Engine
├── Primitive Dispatcher
├── Contract Resolver
├── Transaction Manager
├── Target Resolver
├── Damage / Heal Runtime
├── State Runtime
├── Resource Runtime
├── Shield Runtime
├── Lifecycle Runtime
├── Reincarnation Ledger
├── Authority Adjudication Engine
├── Capability Index
├── Deterministic RNG
├── Snapshot / History Runtime
├── Narrative Runtime
└── Execution Trace
```

These are conceptual modules, not mandatory C# classes.

---

# 3. DEFINITION REGISTRY

The Definition Registry owns immutable normalized definitions.

Examples:
- Character Definition;
- Ability Definition;
- State Definition;
- Combat Definition;
- Presentation Definition reference;
- Story Definition;
- Contract profile;
- Mode Profile.

Runtime entities reference definitions by stable ID.

Definitions should be immutable during one battle unless the project explicitly supports hot-reload outside authoritative simulation.

---

# 4. NORMALIZED ABILITY IR

Kernel does not directly execute human-authored prose.

Input is Normalized Ability IR containing:

```text
canonicalAbilityId
schemaVersion
actionSpec
triggerGraph
intentInterpositionPlan
costPlan
targetPlan
snapshotPlan
effectGraph
effectModifierPlan
authorityPlan
attributionPlan
capabilityIndex
primitiveRequests
contractRefs
validationHash
```

`intentInterpositionPlan` is generated from bounded Ability-owned `ActionIntentInterpositionSpec`.

`effectModifierPlan` is generated from bounded `ScopedEffectAmountModifierSpec`.

`costPlan` may contain:
- ordinary singular/fixed Cost execution;
- declared `CostGroupSpec`;
- frozen runtime payer-collection plan;
- typed Cost-payment Result Binding plan.

None of these plans creates a new Primitive by itself.

Kernel may reject IR if:
- version mismatch;
- unresolved blocker;
- invalid Contract reference;
- deprecated Tag;
- invalid Primitive request;
- ambiguous interposition multiplicity that should have been rejected by normalization;
- unsupported modifier operation or resolution phase;
- invalid Cost-result binding shape.

---

# 5. AUTHORITATIVE STATE STORE

Authoritative state must be separated into domain stores instead of one giant mutable Character object.

Recommended logical state groups:

```text
CombatInstanceState
DeckState
EntityState
IdentityState
PositionState
StatState
ResourceState
ShieldState
PersistentStateStore
ActionRuntimeState
TriggerRuntimeState
LifecycleState
ReincarnationState
CapabilityContributionState
NarrativeState
HistoryState
```

`DeckState` stores at minimum the runtime data needed to distinguish:

- battle Deck membership;
- current deployment state / deployment availability;
- deployment metadata/runtime references.

These are separate concerns.

Deck membership must not be used as a boolean substitute for:

```text
currently deployable
or:
currently waiting on Deck Bar
and must not be represented by pretending the roster Character is a SUMMON.
```

Physical implementation can later be:
- OOP;
- ECS;
- hybrid;
without changing semantic boundaries.

---

# 6. ENTITY STATE

Each Runtime Entity should expose a stable runtime reference.

Conceptual fields:

```text
iid
entityKind
definitionId
combatInstanceId
sideId
presenceByCombatInstance
positionRef
currentCombatDefinitionRef
presentationDefinitionRef
ownerRef
lifecycleProfile
```

Optional:
- trueSelfId;
- lifeSerial;
- naturalAction eligibility;
- HP;
- stats;
- resources.

Not every entity has all fields.

Authoritative Field Presence must be explicitly keyed by Combat Instance.

Conceptually:
presenceByCombatInstance[combatInstanceId]
  activePresent
or an equivalent typed representation.
The authoritative query is:
isActivePresent(entityRef, combatInstanceId)
not:
entity.presenceState
without instance context.
A singular combatInstanceId, active-context pointer, cached presence flag or convenience projection may exist for implementation purposes, but it must not replace the Combat-Instance-keyed authoritative presence relation.
Presentation visibility must not drive this state.
A Main → Arena transfer may therefore commit:
presence[Main]  = not active-present
presence[Arena] = active-present
while preserving identity data required by the transfer Contract.

---

# 7. ENTITY KIND

Kernel must distinguish at least:

```text
CHARACTER
LEADER
NPC
BOSS
SUMMON
PUPPET
COMBAT_OBJECT
CONTAINER
MODE_OBJECT
```

`PUPPET` is a separate entity kind.

It is not automatically `SUMMON`.

Rules targeting Summons must explicitly include Puppet if intended.

---

# 8. TRUE SELF STORE

True Self state is not stored only on the current body/entity.

Conceptual record:

```text
trueSelfId
currentLifeSerial
lifeState
activeEntityRef?
waitingRecord?
reincarnationState?
hostHistory
lifeHistory
exhaustionFlags
```

This permits:
- body death;
- Revive;
- Reincarnation;
- Puppet hosting;
without losing identity.

---

# 9. lifeSerial

Global default:

```text
ordinary Revive:
  preserve lifeSerial

Reincarnation / Rebirth / new life:
  increment lifeSerial
```

Character-specific override is allowed.

Hoá Thân Ký Ức Chi Chủ:
- preserves trueSelfId;
- increments lifeSerial on each special Revive.

Kernel must read the Revive profile rather than hardcode one behavior.

---

# 10. COMBAT INSTANCE MANAGER

Each active encounter can own one or more Combat Instances.

Conceptual graph:

```text
Encounter
└── Main Battle
    ├── Arena Instance A
    ├── Arena Instance B
    └── other isolated instance if future system requires
```

Each Combat Instance owns:
- participants;
- positions;
- local action queues;
- local states;
- local fields/objects;
- mode profile reference.

World-level systems such as Luân Hồi can observe across instances if their Contract says so.

# 10A. DECK / DEPLOYMENT RUNTIME

Deck deployment is a system transaction separate from ordinary Ability Action admission.

Conceptual runtime flow:
resolve battle Deck membership
→ read current deployment state
→ validate this state permits Deck → Battlefield deployment
→ validate additional deployment eligibility
→ read resolved Deployment Cost
→ validate Deployment Cost Bar
→ validate / reserve destination Position
→ open atomic deployment transaction
→ debit Deployment Cost Bar
→ commit deployment-state transition
→ materialize / activate Character on destination Battlefield
→ SET Current Rage = Max Rage
→ finalize battlefield registration
→ commit transaction
→ expose post-commit deployment/presence Events
→ SSI uses current Side pointer/pass state for future Natural Action eligibility
Deck membership and current deployment state are separate runtime axes.
The deployment pipeline must not infer:
Deck member
→ currently deployable
without checking deployment state/eligibility.
Failure before transaction commit leaves:
Deployment Cost Bar unchanged;
deployment attempt uncommitted;
active Battlefield presence unchanged by that attempt;
deployment full-Rage assignment uncommitted.
Deployment uses existing:
Resource state/mutation;
Position validation;
Materialization/presence machinery;
Transaction Manager.
No dedicated Character-specific deployment Primitive is required.
TBD_BY_COST_BUDGET is authoring metadata only and is not executable as a runtime numeric cost.
Turn-based Deployment Cost Bar gain rate is supplied by Mode Resource Profile.
Exact Cost Bar cap/overflow/pause/time-scale behavior remains outside this Pilot patch.

---

# 11. MAIN BATTLE VS ARENA

Arena is a child Combat Instance, not a second ontology.

Transfer into Arena:
- does not kill actor;
- preserves identity;
- removes actor from active presence in parent instance according to transfer Contract;
- keeps it authoritative in Arena instance.

Objects created inside Arena remain Arena-owned unless explicit transfer exists.

---

# 12. ACTION SCHEDULER

Action Scheduler owns runtime Action Instances.

Each Action should contain:

```text
actionId
rootActionId
parentActionId?
originAbilityId
actorRef
actionIdentity
actionBehavior
naturalActionStatus
authorityContext
attributionContext
targetContext
snapshotContext
effectGraphCursor
generationDepth
completionDependencyState?
status
```

`completionDependencyState` is materialized only when an Action actually owns declared root-linked blocking settlements.

Do not allocate or infer a completion-dependency graph for every Action by default.

---

## 12A. NATURAL ACTION FORM RESOLVER

Action Scheduler owns a generic resolver for an SSI-granted Natural Action whose allowed Action form is constrained by normalized Character/System data.

The resolver consumes:

```text
actorRef
naturalActionOpportunityRef
normalized naturalActionFormPolicy?
Mode Profile default Action-form policy
current authoritative State
```

It does not contain Character-specific branches.

Forbidden implementation:

```text
if characterId == ECHO_REVERIE:
    ...
```

Required direction:

```text
normalized policy data
→ generic resolver
→ selected Action candidate
```

### Resolution precedence

When an Actor receives an actual Natural Action opportunity:

```text
1. resolve an active explicit Character/System naturalActionFormPolicy, if one applies;
2. otherwise use the Mode Profile's default Natural-Action form policy;
3. create the selected ordinary Action Request;
4. preserve naturalActionStatus = NATURAL.
```

An explicit Character/System restriction may therefore override the Mode default.

Example:

```text
Mode default:
Rage-ready legal Ultimate has automatic priority

Character restriction:
current remembered form = SKILL

→ explicit restriction wins
→ resolver does not select Ultimate merely because Rage is full
```

unless that restriction itself declares Ultimate as an eligible candidate.

### Candidate probe

Candidate evaluation uses a read-only Action-admission probe.

Conceptual result:

```text
ProbeActionCandidate(candidate)
→ LEGAL
or
→ REJECTED(reasonCode)
```

The probe may read:

- Action/Ability legality;
- Rage readiness;
- AE/resource affordability;
- cooldown;
- required Mode;
- required prerequisite State;
- whether at least one mandatory target candidate exists.

The probe must not:

- mutate State;
- commit or reserve Cost;
- consume/reset Rage;
- consume RNG;
- select/lock a random target;
- start cooldown;
- emit gameplay Events;
- instantiate the candidate Action.

Target-existence probing must use a deterministic non-RNG eligibility query.

Only after one candidate is selected does the ordinary Action pipeline begin.

### No hidden fallback

If normalized data declares:

```text
ULTIMATE
→ SKILL
→ BASIC_ATTACK
```

the resolver probes in exactly that order.

It must not invent another fallback.

If all candidates fail:
> use normalized `noCandidatePolicy`.

### Trace

Execution Trace should record:

```text
naturalActionFormPolicyRef?
candidateOrder
candidateProbeResults[]
selectedActionIdentity?
selectedAbilityRef?
noCandidateResult?
```

Candidate probe traces are diagnostic reads, not gameplay Events.

---

## 12B. ACTION INTENT RUNTIME

The Action Scheduler owns a bounded runtime record for an Action Intent before that Intent becomes an admitted Action.

This object is required because:

```text
ACTION INTENT / REQUEST
≠
ADMITTED ACTION
```

and the existing Action Instance must not collapse the two semantic states.

Conceptual runtime record:

```text
ActionIntentRuntime
  intentId
  actorRef
  naturalActionOpportunityRef?
  naturalActionStatus
  originalRequestedActionIdentity
  originalRequestedAbilityRef?
  originalRequestedSelector?
  effectiveCandidateRef?
  sourceDecisionContext
  selectedInterpositionBranchesByAnchor
  revalidationResult?
  fallbackSelection?
  status
```

Possible internal status values may include:

```text
CREATED
INTERPOSITION_PENDING
INTERPOSITION_SETTLING
REVALIDATING
READY_FOR_ADMISSION
ADMITTED
FALLBACK_SELECTED
FAILED
CANCELLED
```

These are runtime states, not Functional Tags.

### Intent creation

When an input decision, autonomy decision, or normalized Action-form resolver produces a request:

```text
create ActionIntentRuntime
→ preserve original requested identity/reference
→ resolve matching normalized interposition specs against the ORIGINAL Intent
→ for each applicable interposition spec:
     select at most one matching branch
→ index every selected branch by its authored canonical anchor
→ require at most one selected interposition branch per Intent + anchor
→ freeze the resulting interposition selection for this Intent
```

Branch conditions are evaluated at:

```text
ACTION_INTENT_CREATED
```

as defined by Schema/Contract.

The selected branch belongs to its owning interposition spec first; its authored anchor determines where that already-selected branch may later execute.

Runtime must not reinterpret this as:

```text
choose one branch independently for every anchor
```

because one interposition spec may contain mutually-exclusive branches whose anchors differ.

Later HP/resource/State changes do not reselect another branch for the same Intent.

### Multiplicity invariant

Normalized executable content is expected to satisfy:

```text
at most one matching branch per applicable interposition spec
and
at most one selected interposition instance per Intent + anchor
```

unless a future explicit composition policy exists.

Runtime must not choose a winner using:

- authored list order;
- Event sequence;
- Ability list order;
- Character ID;
- Slot;
- insertion order;
- incidental collection iteration order.

If executable IR violates this invariant:

> fail as normalized-content/runtime invariant error.

Do not invent runtime priority.

### Same Natural Action opportunity

If the Intent originated from one SSI-granted Natural Action opportunity:

- pre-admission settlement remains inside that opportunity;
- revalidation remains inside that opportunity;
- explicit fallback remains inside that opportunity;
- no interposition settlement creates another Natural Action.

The record preserves the original requested candidate for trace even if a fallback later becomes the effective admitted candidate.

### Interposition execution

The Action Scheduler dispatches the selected branch's declared `settlementAbilityRef` through the existing normalized Ability/Trigger settlement path.

The settlement:

- uses its own normalized Cost/Effect data;
- follows `TRG-003` when it is Passive/Triggered/Automatic;
- does not receive a second SSI Natural Action;
- does not become an arbitrary engine callback;
- returns a terminal settlement outcome that can be interpreted by the branch's `settlementFailurePolicy`.

No Character ID branch is permitted.

### Settlement failure policy

The selected branch carries its normalized:

```text
CONTINUE
or
FAIL_INTENT
```

policy.

Runtime must distinguish:

```text
settlement terminal success
```

from:

```text
settlement terminal failure
```

and then apply the authored failure policy.

`CONTINUE` means the failed settlement itself does not cancel the enclosing Intent/Action path.

`FAIL_INTENT` means the enclosing Intent/Action path terminates at that interposition boundary under existing Action failure/termination semantics.

No automatic refund is implied.

---

# 13. ACTION STATES

Recommended runtime states:

```text
REQUESTED
ADMISSION
WAITING_TO_START
RUNNING
WAITING_CHILD
DIRECT_EFFECTS_COMPLETE
COMPLETED
CANCELLED
FAILED
```

These are runtime states, not Functional Tags.

---

# 14. ACTION REQUEST / INTENT ADMISSION

`REQUEST_ACTION` does not immediately mutate combat state and does not immediately imply an admitted Action.

Canonical runtime split:

```text
request decision
→ Action Intent
→ bounded pre-admission interposition if declared
→ admission/revalidation
→ admitted Action Instance
```

### Ordinary path

If no matching `PRE_ADMISSION_PRE_COST` selected branch applies:

```text
Action Intent
→ ordinary read-only admission probe
→ ACT-002 admission
→ accepted Intent becomes Action Instance
```

The ordinary admission probe may read, as applicable:

- actor lifecycle/presence;
- Mode legality;
- Action-form restriction;
- parent policy;
- recursion guard;
- natural-action policy;
- Ability prerequisites;
- required pre-cost target legality;
- Cost payability.

The probe does not commit Cost or Effects.

### `PRE_ADMISSION_PRE_COST` path

If the frozen Intent selection contains a pre-admission branch:

```text
Action Intent
→ do not finalize ordinary admission rejection yet
→ execute declared settlement
→ apply settlementFailurePolicy
→ if the path continues and revalidation is declared:
     revalidate the SAME preserved original Intent
```

Before that settlement has received its opportunity to resolve, the Scheduler must not discard the Intent merely because an ordinary early probe currently reports:

- prerequisite failure;
- Cost unaffordability;
- target illegality that belongs to later declared revalidation.

The settlement may change authoritative state.

### Pre-admission settlement terminal handling

If the settlement reaches terminal success:

> continue to the branch's declared revalidation/admission path.

If the settlement reaches terminal failure and:

```text
settlementFailurePolicy = CONTINUE
```

then:

> preserve the original Intent and continue to the branch's declared revalidation/admission path.

If the settlement reaches terminal failure and:

```text
settlementFailurePolicy = FAIL_INTENT
```

then:

> mark the Intent path terminal under existing failure/termination semantics and do not admit the original candidate merely because it was requested.

No Cost of the unadmitted original candidate is paid.

### Revalidation

For:

```text
REVALIDATE_ORIGINAL_INTENT
```

the Scheduler runs the ordinary read-only admission probe again against current authoritative state.

Revalidation:

- does not pay Cost;
- does not emit `ACTION_BEGIN`;
- does not resolve an Effect;
- does not choose another candidate.

If the original Intent passes:

```text
preserved original Intent
→ ACT-002 admission
→ Action Instance
```

If it fails:

```text
evaluate only explicitly authored fallback candidates
```

Fallback candidate probing reuses the existing read-only candidate-probe machinery from `# 12A`.

No global Basic fallback exists.

### Fallback

When one explicit fallback candidate is selected:

- preserve the original Intent for trace;
- set the selected fallback as the effective candidate;
- reuse the same `naturalActionOpportunityRef`;
- enter the fallback candidate's ordinary ACT-002 admission / Cost / target / effect path;
- do not pay the failed original candidate's Cost.

Fallback selection does **not** create a new Action Intent.

Therefore it does not rerun:

```text
ACTION_INTENT_CREATED
```

interposition matching or branch selection.

The frozen interposition selection remains the selection of the original Intent.

An already-selected/consumed interposition is not recursively re-entered merely because the effective candidate changed.

### Action Instance creation

Only an admitted effective candidate becomes an Action Instance.

At that point runtime creates/attaches the already-canonical Action fields such as:

```text
actionId
rootActionId
parentActionId?
originAbilityId
actorRef
actionIdentity
actionBehavior
naturalActionStatus
authorityContext
attributionContext
...
```

The original Intent remains separately traceable.

---

# 15. ROOT ACTION LINEAGE

Every Action preserves lineage:

```text
rootActionId
parentActionId
generationDepth
triggerCause
originAbilityId
```

Used for:
- recursion guard;
- Ký Ức echo exclusion;
- reflect loop prevention;
- attribution;
- trace.

---

## 15A. EXECUTION PROVENANCE QUERY VIEW

Kernel preserves two separate read-only identity axes:

```text
Action lineage
Effect provenance
```

They must not be collapsed.

### Action lineage

Existing Action runtime remains authoritative for:

```text
actionId
parentActionId?
rootActionId
originAbilityId
actionIdentity
actionBehavior
naturalActionStatus
```

A query may explicitly resolve:

```text
SELF
PARENT
ROOT
```

without creating another ancestry subsystem.

### Effect provenance

Each executing normalized Effect has an immutable execution context sufficient to distinguish its generating Effect from other Effects in the same Action lineage.

Conceptual fields:

```text
effectInstanceId
originEffectId
originAbilityId
actionRef
effectSource
authorityContext
attributionContext
```

`effectInstanceId` identifies this runtime execution instance.

`originEffectId` identifies the normalized generating Effect definition/node.

`effectSource` preserves canonical Effect Source semantics.

### Same root does not mean same Effect

Example:

```text
root Action = Echo Skill 2

Effect A:
Skill 2 direct Damage

Effect B:
Echo passive repeat True Damage
```

Both may share:

```text
rootActionId
Damage Attribution = Echo
```

but must have different Effect provenance.

A recursion filter therefore queries provenance rather than guessing from Character identity or Damage Attribution.

### Condition evaluator

Condition evaluation receives read-only typed views over:

```text
ActionLineageView
EffectProvenanceView
```

according to Schema/Contract.

It must not reconstruct provenance from presentation sequence or prose.

### Event/result propagation

When an Event/result is produced by a specific Effect, it may carry or reference:

```text
effectRef?
originEffectId?
```

where required for downstream declarative queries.

This metadata is immutable provenance.

It is not a Functional Tag and does not change Damage Attribution.

---

# 16. NATURAL ACTION FLAG

Do not infer Natural Action from Ability Type.

A Basic Attack can be:
- Natural Action;
- Forced Action;
- Follow-up.

Therefore runtime stores:

```text
actionIdentity = BASIC_ATTACK
actionBehavior = FOLLOW_UP
naturalActionStatus = NON_NATURAL
```

This is required by multiple kits.

---

# 17. SSI SCHEDULER

Turn-based Mode has an SSI Scheduler per Combat Instance.

State:

```text
activeSide
sidePointer[SideA]
sidePointer[SideB]
passSerial[SideA]
passSerial[SideB]
naturalActionSerial
turnBoundarySerial
```

---

# 18. SSI SLOT SEARCH

For current active Side:

```text
read pointer
→ inspect slot
→ skip empty/ineligible slot
→ continue within same Side
→ resolve next eligible Natural Action opportunity
```

Skipping an empty slot does not swap Side.

---

# 19. NATURAL ACTION OPPORTUNITY

Kernel distinguishes:

```text
Natural Action Opportunity
```

from:

```text
Action actually executed
```

If CC causes loss of action:
- opportunity is consumed;
- no ordinary Basic/Skill/Ultimate Action may execute;
- actor clocks still advance where Contract says;
- pointer advances;
- Turn Boundary occurs.

---

# 20. TURN BOUNDARY

Canonical:

```text
Natural Action opportunity resolves/consumes
→ required post-action/lifecycle processing
→ TURN_BOUNDARY
→ active Side swaps
→ next Natural Action opportunity
```

Turn Boundary is a global SSI boundary between consecutive Natural Actions.

It is not a personal actor clock.

---

# 21. ACTOR NATURAL ACTION WINDOW

Per-actor state:

```text
actorNaturalActionWindowSerial
```

Increment when that actor reaches/consumes its next Natural Action opportunity.

Used for:
- once per own turn;
- max N in own turn;
- until own next turn.

Ordinary global Turn Boundaries do not reset every actor's personal caps.

---

# 22. SLOT CLOCK

Slot-based timers are separate records:

```text
slotClock[combatInstanceId, slotId, clockProfile]
```

They do not follow the current occupant.

This supports mechanics whose timer remains attached to death slot.

---

# 23. ACTION EXECUTION PIPELINE

The Kernel distinguishes the Intent phase from admitted Action execution.

Canonical high-level path:

```text
0. Action Intent created
1. freeze valid Action-Intent interposition branch selection

2. if PRE_ADMISSION_PRE_COST branch applies:
     execute declared settlement
     apply settlementFailurePolicy
     if path terminates:
       stop before admission
     otherwise, if declared:
       revalidate SAME original Intent
     if original Intent fails:
       evaluate explicit fallback
       preserve same Natural Action opportunity

3. run ACT-002 admission for the effective Intent

4. only on successful admission:
     create / enter the admitted Action Instance

5. execute the entire declared active Cost transaction
   according to Cost Contract

6. Cost stage becomes terminal only when:
     all required Cost work is terminal
     AND all frozen optional distributed payer attempts are terminal
     AND all required payment results are stored
     AND declared CostGroup result/aggregates are constructed

7. ACTION_BEGIN

8. if POST_COST_PRE_EFFECT branch applies:
     execute declared settlement
     wait for its terminal outcome
     apply settlementFailurePolicy
     if FAIL_INTENT terminates the already-admitted path:
       do not begin direct Effects
       do not automatically refund committed Cost
       continue through existing Action failure/termination bookkeeping

9. snapshot plan

10. target plan

11. effect graph execution

12. transaction commits

13. mandatory immediate death/lifecycle processing

14. blocking child Actions

15. finalize direct-effect stage

16. ACTION_DIRECT_EFFECTS_COMPLETE

17. if an explicit Reaction-boundary profile opens at
    ACTION_DIRECT_EFFECTS_COMPLETE:
      lift that local hold / make eligible candidates available
      to the existing Trigger/Reaction scheduler
      WITHOUT inventing priority against unrelated eligible work

18. discover / resolve declared root-linked blocking settlements
    according to the root Action's local completion-dependency graph

19. finish mandatory lifecycle/results caused by those settlements

20. finalize Action-level result aggregation required for completion

21. verify all root completion dependencies are terminal

22. ACTION_COMPLETED

23. publish/queue ACTION_COMPLETED-dependent ordinary non-blocking work
    according to existing Trigger/Reaction Contracts

24. if Natural Action:
      execute Mode Profile post-Natural-Action system hooks
      SSI pointer advance
      Turn Boundary
```

### Admission is not duplicated Cost commit

`ACT-002` admission/probing may verify prerequisite and Cost payability.

The later Cost transaction is the authoritative validation/commit path.

Do not add a second independent gameplay prerequisite phase between:

```text
ACT-002 admission
and
Cost transaction
```

unless another explicit Contract requires it.

### Cost-stage terminal boundary

For ordinary singular/fixed active Cost:

```text
required validation
→ required commit
→ typed payment result storage
→ Cost stage terminal
```

For `CostGroupSpec` with distributed optional payers:

```text
required validation
→ freeze optional payer collections
→ required atomic commit
→ every frozen optional payer attempt reaches terminal result
→ store all member results
→ build/store CostGroup result + aggregates
→ Cost stage terminal
```

Therefore:

> `POST_COST_PRE_EFFECT` must never run merely because the required subset has committed while optional distributed payer attempts are still unfinished.

### Post-cost interposition position

Under the existing active-Cost lifecycle:

```text
complete active Cost transaction
→ ACTION_BEGIN
→ POST_COST_PRE_EFFECT settlement if selected
→ snapshot / target / first direct Effect
```

The post-cost settlement may change authoritative state before the original Ability's first direct Effect.

It does not rewind ordinary admission.

### Post-cost settlement failure

If the post-cost settlement fails under:

```text
CONTINUE
```

the already-admitted original Action continues to its direct Effects.

If it fails under:

```text
FAIL_INTENT
```

the already-admitted Action path stops before its direct Effects under existing failure/termination semantics.

Committed Cost-payment results remain immutable.

Committed Cost is not automatically refunded.

Refund remains `CST-005` / explicit-policy driven.

### Relationship to root-completion settlement

Action Intent interposition is an early Action-lifecycle boundary.

`rootCompletionDependency` is a late Action-completion boundary.

Do not merge them.

### Reaction priority boundary

Opening a local Reaction boundary at `ACTION_DIRECT_EFFECTS_COMPLETE` means only:

> the explicit sequential hold no longer blocks those candidates.

It does **not** determine whether an ordinary Reaction resolves before or after an unrelated root-linked blocking settlement or another same-window candidate.

That unresolved scheduling/priority question remains governed by existing Trigger/Reaction Contracts, including `TRG-005`.

`eventSeq` remains trace order, not gameplay priority.

---

# 24. EFFECT GRAPH RUNTIME

Within one Action, effects form a DAG.

Runtime tracks:
- ready nodes;
- blocked dependencies;
- typed result bindings;
- resolution group;
- transaction scope.

No unbounded loops.

Recurring behavior:
- emits/observes Events;
- creates persistent State;
- schedules future Actions.

---

# 25. RESULT BINDINGS

Runtime Result Store supports typed immutable bindings.

Examples:

```text
TargetSetRef
SnapshotRef
DamageResultRef
DamageAggregateRef
HealResultRef
CostPaymentResultRef
CostGroupPaymentResultRef
SpawnedEntityRef
StateRef
StoryRef
PropertyRef
```

A node can consume only a compatible typed result.

Rejected:

> arbitrary mutable local variable shared across effects.

---

## Cost payment result

One singular Cost-payment attempt may store:

```text
CostPaymentResult
  costPaymentResultId
  costRef
  payerRef
  costKind
  requestedAmount
  actualPaidAmount
  success
  costTransactionId
```

`costTransactionId` identifies the owning Cost transaction and is intentionally distinct from any generic state/batch transaction identifier.

Once committed/stored, these fields are immutable transaction history.

A singular:

```text
COST_PAYMENT_REF
```

must resolve to exactly one `CostPaymentResult`.

It must not resolve to a collection of distributed payer outcomes.

### `requestedAmount` vs `actualPaidAmount`

Runtime preserves both values independently.

It must not reconstruct `actualPaidAmount` from:

- nominal formula;
- payer HP/resource difference after later Effects;
- expected percentage;
- requested amount.

The committed Cost execution result is authoritative.

The following are both legal typed states when Contract permits:

```text
success = false
actualPaidAmount = 0
```

and:

```text
success = true
actualPaidAmount = 0
```

---

## Cost group payment result

A declared CostGroup may store:

```text
CostGroupPaymentResult
  costGroupPaymentResultId
  costGroupRef
  costTransactionId
  memberPaymentResultRefs[]
  typedAggregates
```

Distributed payer outcomes remain separate member `CostPaymentResult` objects.

They are not collapsed into one ambiguous synthetic singular payment.

Supported typed aggregate includes:

```text
TOTAL_ACTUAL_PAID(kind)
```

computed only from member:

```text
actualPaidAmount
```

for the requested Cost kind.

Example:

```text
TOTAL_ACTUAL_PAID(HP)
= sum(actualPaidAmount of HP member payment results)
```

Failed optional payments contribute zero.

Successful zero payments also contribute zero while retaining `success = true` in their member record.

### Binding visibility

The Cost transaction must store all required Result Bindings before the Cost stage is marked terminal.

Downstream Effect DAG nodes may consume:

```text
CostPaymentResultRef.actualPaidAmount
```

or:

```text
CostGroupPaymentResultRef.TOTAL_ACTUAL_PAID(kind)
```

according to normalized type compatibility.

### Immutability

Later:

- Heal;
- Damage;
- HP mutation;
- Max HP mutation;
- Resource mutation;
- Shield mutation;
- lifecycle mutation

must not rewrite committed Cost-payment results.

---

# 26. PRIMITIVE DISPATCHER

Primitive Dispatcher:

1. receives normalized Primitive Request;
2. checks Contract reference;
3. checks operation class/privilege;
4. creates trace entry;
5. executes against current transaction/snapshot;
6. returns typed result;
7. records StateDelta or system result.

Character data does not directly invoke arbitrary engine methods.

---

# 27. PRIVILEGED PRIMITIVES

Lifecycle/system primitives require semantic authorization.

Examples:
- `CONFIRM_DEATH`
- `ENTER_REINCARNATION`
- `ERASE_ENTITY`
- `CREATE_COMBAT_INSTANCE`
- `RESTORE_SNAPSHOT`

A malformed ordinary Damage effect cannot request:
`ERASE_ENTITY`.

Normalizer/Kernel validation must block invalid privilege use.

---

# 28. CONTRACT RESOLVER

Given:
- Primitive;
- Action context;
- Effect context;
- Mode Profile;

Contract Resolver produces exact runtime profile.

Example:

```text
DamageEffect
→ DMG_DEFAULT
→ TRUE_DAMAGE profile
→ SHIELD_STANDARD_POOL
→ simultaneous or sequential commit profile
```

Character-specific Contract profile overrides only declared semantics.

---

## 28A. SCOPED EFFECT-AMOUNT MODIFIER EXECUTION

The existing Contract Resolver coordinates normalized `effectModifierPlan` evaluation at a declared Effect amount phase.

No separate modifier subsystem/manager is required.

Conceptual input:

```text
resolving Effect execution context
recipientRef
Damage component type?
resolutionPhase
authoritative state version
normalized effectModifierPlan
existing Attribution context
explicit SnapshotRefs?
```

Canonical evaluation:

```text
Effect reaches declared phase
→ enumerate normalized modifier candidates for that Effect semantic/phase
→ source-scope test
→ recipient-scope test
→ Effect/component-scope test
→ structured Condition evaluation
→ bounded read-only valueQueries
→ evaluate pure scalar formula
→ collect matching MULTIPLY factors
→ combine phase factor
→ apply amount transform once at this phase
```

### Source scope

Source matching reads the exact authored Attribution field from the existing Effect execution context.

For example:

```text
damageAttribution
```

must not be substituted with:

```text
caster
owner
effectSource
```

unless normalized data selected that field.

### Recipient scope

Recipient scope evaluates the already-resolving recipient.

It does not re-target the Ability.

It may use existing Target/Condition relation/filter logic as a read-only predicate.

Explicit relation anchors remain mandatory.

### Structured `valueQueries`

`valueQueries` reuse the existing read-only candidate/filter machinery.

For one modifier-phase evaluation:

```text
read authoritative state at phase entry
→ run bounded query
→ return typed read result
```

unless the normalized formula explicitly references an earlier `SnapshotRef`.

A value query must not:

- mutate State;
- pay Cost;
- emit an Effect;
- request/create an Action;
- consume RNG;
- alter the resolving Ability's TargetSet.

A query result such as target count is exposed only as the typed value expected by the normalized pure formula.

### MULTIPLY combination

Current supported modifier operation:

```text
MULTIPLY
```

All matching multipliers participate in the same phase.

Runtime must not derive winner/priority from:

- modifier authoring order;
- Ability order;
- Event order;
- entity order;
- Character ID;
- insertion order.

To prevent numeric rounding from accidentally turning iteration order into gameplay semantics:

> combine all matching multiplier factors into one canonical phase factor before applying the amount transform, and avoid per-modifier amount rounding that would make factor order observable.

Exact global numeric representation/rounding remains governed by the project's numeric policy.

### Non-commutative future operations

If normalized content requests a future non-commutative amount operation without an explicit Contract:

> reject as unsupported.

Do not invent a modifier-priority subsystem.

### Authority boundary

Rank/Element predicates are ordinary structured reads.

They do not invoke Authority adjudication.

Authority runtime is entered only when the resolving interaction contains a genuine Authority-bearing semantic conflict under `AUT-*`.

### Trace

Modifier evaluation should be traceable by:

```text
modifierRef
resolutionPhase
scopeMatch
queryResultRefs?
scalar
combinedPhaseFactor
```

These are trace/debug data, not gameplay Events.

---

# 29. TRANSACTION MANAGER

Transaction Manager protects atomicity.

A transaction contains:

```text
transactionId
stateVersionStart
readSet
snapshotRefs
proposedDeltas
commitMode
batchId?
```

---

## 29A. COST TRANSACTION RUNTIME

The existing Transaction Manager owns a typed Cost transaction context for normalized Cost execution.

This is not a new top-level subsystem.

Conceptual runtime state:

```text
CostTransactionContext
  costTransactionId
  actionRef?
  settlementRef?
  costGroupRef?
  stateVersionBeforePayment
  requiredCostRefs[]
  requiredValidationResults[]
  optionalPayerSnapshots[]
  requiredCommitResult?
  memberPaymentResultRefs[]
  costGroupPaymentResultRef?
  status
```

One optional payer snapshot may contain:

```text
OptionalPayerSnapshot
  distributedCostRef
  snapshotStateVersion
  payerRefs[]
```

Possible internal status values may include:

```text
CREATED
REQUIRED_VALIDATED
OPTIONAL_PAYERS_SNAPSHOTTED
REQUIRED_COMMITTED
OPTIONAL_ATTEMPTS_RUNNING
RESULTS_FINALIZING
TERMINAL_SUCCESS
TERMINAL_REQUIRED_FAILURE
```

These are runtime transaction states, not Functional Tags.

### Canonical distributed execution order

For a distributed CostGroup:

```text
1. validate required Costs / mandatory payer legality

2. if required validation fails:
     terminate required failure
     commit nothing

3. snapshot every optional payer collection
   from authoritative pre-payment state

4. freeze those payerRefs

5. atomically commit the required Cost subset

6. for every frozen optional payer:
     resolve PAYER = that member
     attempt that member's own Cost
     create one terminal COST_PAYMENT_RESULT

7. wait until every frozen payer attempt is terminal

8. construct COST_GROUP_PAYMENT_RESULT

9. compute declared typed aggregates

10. publish/store result bindings

11. mark Cost stage terminal
```

The required invariant is:

```text
all optional payer membership snapshots
happen before ANY required or optional payment commit
```

### Each payer pays its own Cost

For distributed HP Cost:

```text
payerRef Current HP
→ HP Cost commit
```

Do not route through Damage Runtime.

Do not create:

- caster Damage Attribution;
- Shield absorption;
- Reflect;
- Lifesteal;
- ordinary Damage triggers.

Existing HP-Cost semantics remain authoritative.

### Optional payer failure

For:

```text
CONTRIBUTION_ZERO_CONTINUE
```

a failed optional payer attempt records:

```text
success = false
actualPaidAmount = 0
```

and the CostGroup continues.

The attempt is still terminal and must still have a member result.

### Successful zero payment

If the applicable Cost Contract permits a legal zero payment:

```text
success = true
actualPaidAmount = 0
```

must remain distinguishable from failure.

Runtime must never derive `success` only from the numeric amount.

### No gameplay ordering from iteration

The optional payer collection may require a stable technical iteration order for replay/trace.

That order is implementation-only.

It must not become gameplay priority.

Normalized executable content is expected not to contain an order-dependent cross-payer dependency such as:

```text
payer A's result changes payer B's payment legality/amount
```

without a future explicit profile.

If such unsupported dependency reaches runtime:

> fail as an unsupported normalized-content invariant rather than inventing order from entity ID, Slot, list order, or iteration order.

### Cost-stage terminal

A distributed CostGroup is not terminal when only required Cost commits.

It becomes terminal only after:

```text
all frozen optional attempts terminal
AND all member payment results stored
AND group result/aggregates constructed
```

Only then may `POST_COST_PRE_EFFECT` or the first direct Ability Effect proceed.

---

# 30. STATE VERSION

Authoritative state has monotonically increasing logical state versions.

A SnapshotRef records the state version it captured.

This helps:
- simultaneous correctness;
- target validation;
- replay;
- trace.

---

# 31. SIMULTANEOUS BATCH TRANSACTION

For simultaneous AOE:

```text
start batch transaction
→ capture shared state version
→ resolve all target packets/effects
→ produce proposed deltas
→ no target delta visible to sibling calculations
→ commit full batch
→ generate resulting HP_ZERO/death contexts
```

This prevents calculation contamination.

---

# 32. SEQUENTIAL TRANSACTION

For one sequential direct component:

```text
calculate component
→ commit component
→ stateVersion++
→ mandatory immediate lifecycle processing
→ validate whether later component remains legal
→ next direct component may read new authoritative state
```

Mandatory immediate lifecycle processing is not an ordinary Reaction window.

It may perform required processing such as:

```text
HP_ZERO
→ Death Prevention / lifecycle evaluation
→ target validity update
```

when that processing is necessary before a later direct component can legally resolve.

### Explicit `AFTER_DIRECT_EFFECTS_COMPLETE` profile

If normalized:

```text
resolution.reactionBoundary
= AFTER_DIRECT_EFFECTS_COMPLETE
```

then runtime must hold ordinary eligible Reaction release across the direct sequential chain:

```text
component 1 commit
→ mandatory lifecycle
→ component 2 if legal
→ mandatory lifecycle
→ ...
→ all declared direct components finished
→ ACTION_DIRECT_EFFECTS_COMPLETE
→ ordinary eligible Reactions may proceed/queue
```

Ordinary Reaction candidates may be discovered/traced as appropriate, but they must not resolve between the direct components under this profile.

This does not suppress mandatory lifecycle processing.

### No global default

If the Ability has a meaningful intermediate-Reaction distinction but normalized content does not contain a Contract-supported explicit reaction boundary:

> runtime must not guess.

The unresolved global default remains a validation/content blocker where relevant.

The Kernel must not silently map every sequential Action to `AFTER_DIRECT_EFFECTS_COMPLETE`.

---

# 33. EVENT SYSTEM

Events are immutable runtime records.

Conceptual structure:

```text
eventSeq
eventType
combatInstanceId
rootActionId?
actionId?
effectRef?
originEffectId?
transactionId?
batchId?
sourceRef?
subjectRef?
subjectRefs?
targetRef?
resultRef?
stateVersion
authorityContext?
attributionContext?
```

`effectRef` / `originEffectId` are populated only when the Event semantically originates from a specific Effect and downstream provenance queries require that identity.

They do not replace:

```text
sourceRef
authorityContext
attributionContext
```

because:

```text
Effect provenance
≠ Source identity
≠ Damage Attribution
```

`subjectRefs` may exist as a derived/index projection for listener lookup.

It is not automatically the authoritative semantic payload of a collection Event.

For `POSITION_MUTATION_COMMITTED`, the authoritative payload is the typed Position Mutation commit result referenced by `resultRef`, containing:

entries[]
with authoritative per-entry:
entityRef
oldPositionRef
newPositionRef
Conceptually:
subjectRefs
= projection(resultRef.entries[].entityRef)
may be cached/indexed for listener lookup.
If subjectRefs and authoritative entries[] ever disagree:
entries[] is authoritative for Position Mutation semantics.
subjectRefs must not carry or replace old/new Position meaning.

# 33A. PILOT-LOCKED GENERIC EVENTS

The following generic Events are required by normalized gameplay semantics:

```text
ENTER_FIELD
LEAVE_FIELD
DEPLOY_FROM_DECK_COMMITTED
POSITION_MUTATION_COMMITTED
```

Presence Events
ENTER_FIELD and LEAVE_FIELD are emitted only after authoritative Combat-Instance-keyed presence transition commit under POS-*.
They preserve:
entity;
Combat Instance;
cause/transaction trace.
Deck Deployment Event
DEPLOY_FROM_DECK_COMMITTED is cause-specific.
It is not replaced by generic ENTER_FIELD.
A successful Deck deployment may expose both because they answer different semantic questions.
Position Mutation Commit Event
POSITION_MUTATION_COMMITTED represents one committed atomic Position Mutation group.
Its resultRef points to an authoritative typed result:
PositionMutationCommitResult
  transactionId
  batchId?
  entries[]
    entityRef
    oldPositionRef
    newPositionRef
The Event's top-level sourceRef carries Event source identity.
Do not duplicate a second independent sourceRef inside PositionMutationCommitResult.
Optional/index projection:
subjectRefs
may be derived from:
entries[].entityRef
but is not authoritative for Position Mutation meaning.
One atomic multi-entity swap/group relocation:
one Event with multiple authoritative entries.
Separate sequential Position commits:
separate Events.
Failed/no-op Position mutation:
no successful Position Mutation commit Event.
The Event is exposed only after the authoritative Position commit has completed.

---

# 34. EVENT SEQUENCE

`eventSeq` monotonically increases inside encounter/world runtime.

Deterministic sequencing is necessary even when multiple events represent simultaneous semantics.

Important:
> event sequence is an implementation ordering key, not automatically gameplay temporal priority.

For simultaneous Death Cohort, multiple death records can have distinct trace IDs while sharing one semantic cohort.

Additional invariant:

For Event records produced by the same transaction:

> `eventSeq` provides deterministic trace/publication order only.

It does not automatically define:

- Reaction priority;
- Trigger winner;
- Authority winner;
- gameplay precedence between otherwise-unrelated listeners.

A specific Contract may define a semantic dependency/order between Events, but absent such a Contract:

```text
lower eventSeq
≠ higher gameplay priority
Reaction/Trigger ordering remains governed by Trigger/Reaction Contracts.
This preserves deterministic replay without silently resolving the global same-window priority problem.
```

---

# 35. TRIGGER ENGINE

Trigger Engine maintains indexed listeners by:
- event type;
- subject relation;
- state;
- Character;
- system;
- Combat Instance.

It does not scan every Ability in the game for every Event.

For a collection-payload Event such as `POSITION_MUTATION_COMMITTED`:

- listener lookup occurs once for that Event;
- authoritative collection semantics are evaluated from the typed commit result's `entries[]` referenced by Event `resultRef`;
- `subjectRefs`, if materialized, are derived/index projections only;
- current collection matching supports `ANY`;
- a relation-based filter must specify its anchor explicitly;
- the anchor resolves through an existing symbolic reference such as `SELF`, `CASTER`, `OWNER`, `SOURCE`, `TRIGGER_SOURCE`, or another legal reference from Schema.

Example semantic:
ANY entry where:
  entry.entityRef is ALLY relative to SELF
  and entry.entityRef != SELF
Matching multiple entries inside one Event does not clone the Event or automatically multiply Trigger Candidates.
Trigger count follows Event granularity defined by Contract.
After a Position Mutation commit:
commit authoritative Position state
→ publish POSITION_MUTATION_COMMITTED
→ evaluate listeners against post-commit state + immutable resultRef.entries[]
→ create eligible Trigger Candidates
This post-commit discovery point does not define global priority among the created candidates.
Priority/scheduling remains governed by existing Trigger/Reaction Contracts.

---

# 36. TRIGGER CANDIDATE

When an Event is published:

```text
lookup candidate listeners
→ evaluate source/subject filters
→ evaluate conditions
→ create Trigger Candidate
```

Trigger Candidate stores:
- originating event;
- trigger definition;
- owner;
- lineage;
- Cost state;
- priority class.
- rootCompletionDependency?
- effectProvenanceContext?

If a candidate declares a root completion dependency:

1. resolve and validate its root Action reference;
2. register/instantiate the corresponding Completion Tracker node;
3. preserve the candidate's Action-lineage and Effect-provenance query context;
4. schedule settlement only when its declared local dependencies permit it.

Registration of a blocking dependency must occur before the root Action can cross its completion barrier.

This does not give the candidate global Reaction priority.

---

# 37. REACTION QUEUE

Reaction Queue is separate from currently open atomic transaction.

A reaction caused by a commit cannot mutate state in the middle of a sibling simultaneous calculation.

Default:

```text
finish atomic commit
→ finish mandatory immediate lifecycle
→ enqueue reactions
→ scheduler resolves eligible queue
```

---

# 38. BLOCKING VS NON-BLOCKING CHILD ACTION

Parent Action can specify child behavior.

## Blocking child
Parent cannot become Action Completed until child finishes.

## Non-blocking child
Parent may complete and child remains scheduled separately.

This distinction is explicit.

---

# 39. DAMAGE ACTION COMPLETION

Damage Action runtime aggregates relevant Damage Results.

Before `DAMAGE_ACTION_COMPLETED`:

- all direct Damage components belonging to that Damage Action have committed;
- mandatory death evaluation from those commits has resolved;
- aggregation is final.

This allows Ký Ức Skill 2 to evaluate stable Actual HP Damage and target survival.

---

# 39A. ROOT ACTION COMPLETION TRACKER

Root-linked blocking settlements are tracked as local state owned by the relevant Action Instance.

This is not a separate global scheduler.

Conceptual runtime state:

```text
CompletionDependencyState
  rootActionId
  nodes[]
    dependencyId
    triggerRef
    status
    dependsOn[]
    terminalReason?
```

Possible runtime status:

```text
PENDING
READY
RESOLVING
RESOLVED
FAILED_COST
FAILED_CONDITION
CANCELLED
```

All statuses except:

```text
PENDING
READY
RESOLVING
```

are terminal for completion purposes.

### Registration

When Trigger Engine discovers an eligible Trigger whose normalized definition declares:

```text
rootCompletionDependency:
  mode = BLOCK_ROOT_ACTION_COMPLETION
```

it must register/instantiate the corresponding dependency node on the referenced root Action **before** that root Action is allowed to pass the completion barrier.

The runtime graph comes from normalized declarative dependency data.

The Kernel must not invent dependency edges from Ability names or Event publication order.

### Dependency readiness

A node becomes `READY` only when all declared `dependsOn` nodes are terminal in a way permitted by its normalized policy.

A node cannot execute merely because its Event has a lower `eventSeq`.

### Failed activation closes the node

Example:

```text
Skill 3 settlement qualifies
→ Cost requires 30 AE
→ AE insufficient
→ status = FAILED_COST
→ dependency is terminal
```

The root Action is not left permanently blocked.

Whether a failed activation consumes a Trigger cap/counter remains governed by its Trigger/Cost Contract.

### Completion barrier

A root Action may emit `ACTION_COMPLETED` only when:

```text
direct effects are complete
AND mandatory immediate lifecycle is complete
AND blocking child Actions are complete
AND all declared root-linked blocking dependencies are terminal
AND required Action-level aggregation is final
```

### Local ordering only

If normalized data declares:

```text
SKILL_3_SETTLEMENT
→ SKILL_1_SETTLEMENT
```

that ordering exists only inside this root Action's completion graph.

It does not:

- alter global Reaction Queue priority;
- solve same-window unrelated Trigger priority;
- establish a global Ability-category priority;
- use `eventSeq` as gameplay priority.

### Boundedness

The Completion Tracker must fail-fast if runtime data violates normalized guarantees, including:

- unknown dependency node;
- cycle;
- dependency linked to the wrong root Action;
- dependency requiring the same root Action to already be completed;
- recursive unbounded dependency instantiation.

Such failures are content/runtime invariant violations, not Character-specific fallback cases.

---

# 40. TARGET RESOLVER

Target Resolver is a pure/read-only subsystem until an effect mutates state later.

Pipeline:

```text
candidate source
→ relation/kind filter
→ lifecycle/presence filter
→ semantic target filters
→ TARGET_EXCLUSION
→ candidate pool
→ deterministic selection
→ TargetSetRef
```

---

# 41. AREA RESOLVER

Area Resolver works from geometry/positions.

It is separate from direct Target Resolver.

Example:
Forgotten actor:
- excluded from direct random pool;
- remains in full-board geometry;
- can still be hit.

---

# 42. TARGET LOCK

TargetSetRef can lock:
- entity IDs;
- positions;
- both.

Later validation reads declared invalidation policy.

No silent reroll.

# 42A. HIT ADMISSION RESOLVER

Target Lock and Hit Admission are separate runtime stages.

Conceptual flow for effects using Hit Admission:
resolve / reuse TargetSetRef
→ apply declared target invalidation/current-recipient validation
→ resolve Hit Admission policy
→ if admitted, continue effect/damage resolution
Minimum policy interface:
MODE_DEFAULT
GUARANTEED
MODE_DEFAULT delegates to the active Mode/System ordinary hit policy.
GUARANTEED bypasses ordinary:
Miss;
Dodge;
Evasion.
It does not:
recreate an invalid target;
bypass lifecycle illegality;
bypass Authority;
imply Target Lock;
define Accuracy/Evasion math.
If a locked Entity changes Position but remains a legal recipient:
Target Lock preserves Entity reference;
Guaranteed Hit independently bypasses ordinary hit rejection.
Authority-based special deny / avoidance
If an Authority-bearing special rule attempts to:
deny the hit;
force special avoidance;
create a rule-level dodge/untouchable outcome;
the runtime must not classify that rule as ordinary Evasion merely to let GUARANTEED bypass it.
If a direct semantic conflict exists:
dispatch existing Authority adjudication for the conflicting clauses.
No new Hit Primitive is dispatched solely for Guaranteed Hit.

---

# 43. DETERMINISTIC RNG

Kernel RNG service must use deterministic seeds.

Recommended logical key:

```text
encounterSeed
combatInstanceId
rngDomain
actionId/systemId
drawIndex
```

This makes random results reproducible.

---

# 44. RNG DOMAINS

Recommended domains:

```text
FIRST_SIDE
TARGET_SELECTION
DEFINITION_SELECTION
POSITION_SELECTION
NARRATIVE_SELECTION
SYSTEM_MISC
```

Reason:
unrelated new random use should not reshuffle every future random result if avoidable.

Exact implementation can use deterministic substreams/hash-based draws.

---

# 45. DAMAGE RUNTIME

Damage Runtime receives a normalized Damage packet/effect context.

It does not inspect Character names.

Each recipient/component resolves through the component-specific pipeline.

Canonical core stages:

```text
Damage Profile
→ component formula
→ component-specific mitigation
→ scoped FINAL_DAMAGE_REDUCTION phase for eligible non-True components
→ combine eligible post-mitigation components
→ Shield interaction
→ Current HP-bound result
→ Actual HP Damage
→ Overkill
```

At:

```text
FINAL_DAMAGE_REDUCTION
```

Damage Runtime calls the bounded modifier execution defined in `§28A`.

The call receives:

```text
effect semantic = DAMAGE
recipientRef
component type
existing Attribution context
resolutionPhase = FINAL_DAMAGE_REDUCTION
authoritative phase state
```

Only normalized matching modifiers participate.

A target-local modifier on one recipient does not alter another recipient's packet.

No Character-specific Prime/Light logic is embedded in Damage Runtime.

---

# 46. PHYSICAL DAMAGE

For Physical component:

```text
raw Physical
→ apply ARM Penetration
→ ARM mitigation
→ Final Damage Reduction
→ Shield
→ HP
```

Exact ARM formula belongs tuning/math data, not architecture.

At the Final Damage Reduction stage:

```text
post-ARM Physical amount
→ §28A scoped FINAL_DAMAGE_REDUCTION multiplier evaluation
→ final Physical amount for Shield interaction
```

The modifier query runs after ARM/Penetration mitigation and before Shield.

---

# 47. WILL DAMAGE

For Will component:

```text
raw Will
→ apply RES Penetration
→ RES mitigation
→ Final Damage Reduction
→ Shield
→ HP
```

At the Final Damage Reduction stage:

```text
post-RES Will amount
→ §28A scoped FINAL_DAMAGE_REDUCTION multiplier evaluation
→ final Will amount for Shield interaction
```

The modifier query runs after RES/Penetration mitigation and before Shield.

---

# 48. TRUE DAMAGE

For True component:

```text
raw True
→ bypass ARM
→ bypass RES
→ bypass generic/final Damage Reduction
→ Standard Shield unless Shield Piercing
→ HP
```

True Damage does not automatically gain Axiom authority.

True Damage does not enter the normal:

```text
FINAL_DAMAGE_REDUCTION
```

modifier phase.

Therefore the ordinary scoped modifier evaluator is not invoked for True components at that phase.

True Damage still proceeds to eligible Shield unless explicit Shield Piercing/bypass exists.

---

# 49. DAMAGE PROFILE COPY

A Skill may reuse another Ability's Damage Profile.

Kernel copies/reads:
- damage formula/profile;

not:
- Action Identity;
- Action Behavior;
- Basic-Attack-only semantics.

---

# 50. STANDARD SHIELD POOL

Each entity can expose:

```text
standardShieldTotal
shieldContributionLedger[]
specialShieldLayers[]
```

---

# 51. SHIELD CONTRIBUTION LEDGER

Contribution record:

```text
shieldContributionId
sourceEffectRef
ownerRef
originalAmount
remainingAmount
durationState
authorityMetadata
specialFlags
```

UI may show one total Standard Shield bar.

Runtime preserves source provenance.

---

# 52. PROPORTIONAL SHIELD DEPLETION

If Standard Shield total is `T` and absorbed damage is `D`:

for each contribution `i`:

```text
remaining_i_new
= remaining_i_old × (T - D) / T
```

when `D < T`.

If `D >= T`:
- all eligible Standard Shield contributions become zero;
- spillover proceeds to HP.

Use deterministic fixed-point/high-precision arithmetic.

UI rounding must not alter authoritative values.

---

# 53. SPECIAL SHIELD LAYERS

A Shield with qualitatively different eligibility can use a special profile.

Examples:
- only Will Damage;
- only Physical Damage;
- specific source;
- Axiom-protected layer.

Such a layer is not forcibly pooled with incompatible Standard Shields.

Do not create special layers merely because sources differ.

---

# 54. SHIELD EXPIRY

When one source contribution expires:

```text
remove only that source's remaining contribution
recalculate total
```

Other contributions remain.

---

# 55. SHIELD REMOVAL

Source-specific removal can target ledger entries.

Generic:
> “remove all Shield”
can clear all eligible Standard contributions according to Authority.

This preserves simple gameplay plus source-aware mechanics.

---

# 56. ACTUAL HP DAMAGE

Damage Result stores separately:

```text
rawDamage
postMitigationDamage
shieldAbsorbed
actualHpDamage
overkill
```

Do not reconstruct these afterward from HP difference only.

---

# 57. HEAL RUNTIME

Heal Runtime resolves one Heal instance as:

```text
requestedHeal
→ qualifying scoped PRE_OVERHEAL modifier evaluation
→ modifiedHeal
→ missingHP
→ actualRestore = min(modifiedHeal, missingHP)
→ overheal = modifiedHeal - actualRestore
→ commit actualRestore
```

If no qualifying `PRE_OVERHEAL` modifier exists:

```text
modifiedHeal = requestedHeal
```

### PRE_OVERHEAL modifier call

Before computing actual restoration or Overheal, Heal Runtime calls `§28A` with:

```text
effect semantic = HEAL
recipientRef
existing Attribution context
resolutionPhase = PRE_OVERHEAL
authoritative phase state
```

The resolver evaluates:

- source scope;
- recipient scope;
- structured conditions;
- bounded `valueQueries`;
- all matching `MULTIPLY` factors.

The resulting phase factor modifies the Heal amount first.

Only then may Heal Runtime compute:

```text
actualRestore
overheal
```

Forbidden ordering:

```text
requestedHeal
→ calculate Overheal
→ reduce only restored HP
```

because Overheal must derive from the already-modified Heal amount.

### Recipient-local scope

A modifier scoped to:

```text
ALLY relative to SELF
excluding SELF
```

must not modify self-Heal.

### Result data

Heal Result should preserve enough typed information for trace/debug such as:

```text
requestedHeal
modifiedHeal
actualRestore
overheal
```

Overheal remains typed result data.

It is not automatically Shield.

---

# 58. HP COST

HP Cost path:

```text
validate payable
→ commit HP payment
→ no Damage Packet
→ no Shield
→ no ordinary Damage trigger
```

Global default:
leaves at least 1 HP.

---

# 59. NON-COST HP LOSS

HP Loss path:

```text
calculate amount
→ reduce Current HP directly
→ no Damage Packet
→ if HP becomes 0:
   death evaluation
```

It can be lethal if its effect profile allows.

---

# 60. MAX HP MUTATION

Max HP mutations must create an explicit mutation record.

Conceptual:

```text
mutationId
source
baseline
operation
value
duration
reconciliationProfile
```

Removing the mutation recalculates Current Max HP and applies expiry reconciliation.

No hidden Heal.

---

# 61. STATE RUNTIME

Persistent states are normalized State Instances.

Conceptual fields:

```text
stateInstanceId
stateDefinitionId
stateIdentity
classification
attachmentKind
attachmentRef
source
owner
authority
startStateVersion
durationProfile
stackData
parameters
```

---

# 62. STATE ATTACHMENT

Kernel supports:

```text
ENTITY
POSITION
BATTLEFIELD
COMBAT_OBJECT
STORY
SYSTEM_INSTANCE
```

This allows one generic state runtime without collapsing semantics.

---

# 63. MARK VS POSITION MARK

Entity Mark:
```text
attachment = ENTITY
```

Position Mark:
```text
attachment = POSITION
```

Movement does not carry Position Mark to the Actor.

---

# 64. IMMUNITY / STATE ADMISSION

Before applying State:

```text
check target eligibility
→ check immunity/system restrictions
→ detect direct semantic conflicts
→ Authority resolution if required
→ commit or reject
```

---

# 64A. SCOPED EFFECT ADMISSION GATEWAY

Kernel provides a generic scoped Effect Admission boundary for non-State Effects whose target currently owns a matching admission/protection rule.

This gateway is not automatically invoked as an all-effect immunity check for every Effect.

Conceptual flow:

```text
incoming Effect
→ validate target/lifecycle eligibility
→ query matching admission rules by Effect semantic/scope
→ no matching rule:
     PASS_THROUGH
→ matching rule exists:
     evaluate admission predicate
     → ADMIT
     or
     → REJECT
→ if admitted:
     continue ordinary Effect runtime/commit
```

### Indexed rule lookup

Admission rules should be queryable/indexed by structured scope such as:

```text
effect semantic
recipient
source relation
Effect Source/provenance
Authority threshold
Mode/System state
```

Kernel must not scan arbitrary Character prose.

### Authority threshold

A simple threshold rule such as:

```text
external SHIELD admitted only if
incoming Authority >= QUY_TAC
```

is evaluated directly as an admission predicate.

It does not automatically invoke same-tier Rank/Tu vi/Stars/Awaken/CP adjudication.

### Direct conflict

Authority Adjudication Engine is invoked only when admission exposes an actual direct rule/effect conflict that requires Authority adjudication.

Therefore:

```text
incoming Authority field exists
```

alone is insufficient reason to start adjudication.

### Shield integration

Before Shield Runtime commits an incoming Shield Effect:

```text
if recipient has matching Shield-admission rule
→ Effect Admission Gateway
→ ADMIT / REJECT
```

If no matching rule exists:
> ordinary Shield processing continues unchanged.

### Damage integration

Direct Damage is not sent through a universal Effect-immunity gate.

Damage is subject to Effect Admission only if an explicit matching protection rule declares Damage inside its scope.

This preserves:

```text
scoped Effect Admission
≠ generic invulnerability
```

### State Admission

Existing State Admission remains canonical for State application.

State Runtime may share query/infrastructure with Effect Admission, but their semantic contracts remain distinct.

### Result

Gateway returns a typed result such as:

```text
ADMIT
REJECT
PASS_THROUGH
```

with machine-readable reason/trace data.

Rejected Effects never reach their mutation/commit Primitive.

---

# 65. AUTHORITY MODEL

Authority tiers:

```text
AXIOM
QUY_TAC
PHAP_TAC
NORMAL
```

Functional Tags such as `HEAL` or `REVIVE` are not Authority tiers.

---

# 66. AUTHORITY CONFLICT DETECTION

Authority Adjudication starts only when rules **directly contradict** within overlapping semantic scope.

Example:

```text
Rule A:
QUY_TAC — no Heal battlefield-wide

Rule B:
QUY_TAC — B may self-Heal
```

Conflict exists only where:
- target = B;
- B's Heal attempts to occur.

No need to adjudicate when no conflicting Heal occurs.

---

# 67. AUTHORITY DIFFERENT TIER

If direct conflict:

```text
Axiom > Quy Tắc > Pháp Tắc
```

Higher special tier wins the conflicting semantic immediately.

Do not compare Rank/tu vi/stars/awaken/CP when tiers differ.

---

# 68. NORMAL RULES

Ordinary Skill/Ultimate/Passive effects without:
- Axiom;
- Quy Tắc;
- Pháp Tắc;

remain `NORMAL`.

The legacy progression-based same-tier adjudication is defined for the special equal Authority tiers.

Ordinary NORMAL interactions use ordinary semantic/Contract ordering unless a future rule explicitly extends adjudication to NORMAL.

This avoids silently changing legacy intent.

---

# 69. AUTHORITY RULE INSTANCE

Every authority-bearing effect clause that can conflict has its own Rule Instance.

Conceptual:

```text
ruleInstanceId
originAbilityId
originEffectId
authorityTier
semanticOperation
scope
adjudicationOwnerRef
activeStateRef?
revision
```

Adjudication never needs to disable an entire Skill if only one clause conflicts.

---

# 70. CONFLICT SCOPE INTERSECTION

For two rules:

```text
scopeA ∩ scopeB = conflictScope
```

Only this intersection can be suppressed/rejected.

Example:
B's self-Heal rule beats global no-Heal rule.

Result:
- B can Heal self;
- global no-Heal still affects C/D/etc.

---

# 71. ADJUDICATION OWNER

Every special Authority Rule has:

```text
adjudicationOwnerRef
```

Ordinary default:
> Character that owns the kit.

Do not derive from:
- Damage Attribution;
- current visual actor;
- owner of animation.

Pygmalion/inherited behavior may explicitly choose owner.

---

# 72. ADJUDICATION PROFILE SNAPSHOT

At battle entry or when Adjudication Owner is materialized, Kernel records:

```text
rank
cultivation
characterStars
awakenCount
adjudicationCP
```

Ordinary combat Buffs do not continuously modify this profile.

---

# 73. SAME-TIER COMPARATOR

For:
- Axiom vs Axiom;
- Quy Tắc vs Quy Tắc;
- Pháp Tắc vs Pháp Tắc;

compare:

```text
1. Rank
2. Cultivation / Tu vi
3. Character Stars
4. Awaken Count
5. Adjudication CP
```

Stop at first difference.

---

# 74. ADJUDICATION CACHE

Cache key concept:

```text
ruleInstanceA
ruleInstanceB
revisionA
revisionB
scopeSignature
```

Result:

```text
A_WINS
B_WINS
NO_OVERRIDE
```

Cache is symmetric in identity but stores directional result.

---

# 75. ADJUDICATION REVISION

Revision changes only if relevant inputs change:

- Authority Tier;
- Rank;
- Tu vi;
- stars;
- Awaken;
- Adjudication CP profile;
- Adjudication Owner;
- rule semantic/scope version.

Ordinary:
- +ATK Buff;
- -RES Debuff;
does not invalidate authority cache.

---

# 76. EXACT TIE

If every comparator field is equal:

```text
NO_OVERRIDE
```

For existing protection vs incoming mutation:
- protection remains;
- incoming conflicting mutation fails in overlap.

For simultaneous contradictory mutations:
- overlapping contradiction does not commit.

Do not use:
- iid;
- slot;
- RNG;
- cast order;
to fake a gameplay winner.

---

# 77. PERSISTENT RULE SUPPRESSION

If both conflicting rules persist and one wins:

Kernel may create:

```text
SuppressionEdge
winnerRule
loserRule
scope
revisionSignature
```

Loser remains active outside the conflict scope.

If winner expires/dies/loses maintenance:
- suppression edge disappears;
- loser can resume wherever still otherwise valid.

---

# 78. INSTANT RULE FAILURE

If losing effect is one-shot:
- reject only this attempted interaction;
- do not store a future “frozen hit”.

It does not activate retroactively later.

---

# 79. MULTI-RULE CONFLICT GRAPH

For 3+ active rules:

```text
Rule nodes
Conflict edges only where semantic contradiction exists
```

Resolve each edge.

No transitive assumption:

```text
A beats B
B beats C
```

does not mean:
`A conflicts with C`.

---

# 80. SAME-CHARACTER CONTRADICTION

Two contradictory rules owned by same Character do not compare that Character against itself.

Kernel expects:
- explicit internal priority;
- exception;
- normalized ordering;
or validator error.

---

# 81. DEATH RUNTIME

Canonical life transition:

```text
ALIVE
→ HP_ZERO
→ DEATH_EVALUATING
→ DEATH_PREVENTED
or
→ DEATH_CONFIRMED
```

---

# 82. HP_ZERO

HP_ZERO creates a death-evaluation context.

No kill credit yet.

No Reincarnation waiting yet.

---

# 83. DEATH PREVENTION

Death Prevention candidates resolve before DEATH_CONFIRMED.

If prevention succeeds:
- entity remains/returns alive;
- current loss/damage event does not repeat;
- no confirmed death observers.

---

# 84. DEATH CONFIRMATION

`CONFIRM_DEATH` atomically records:

```text
entity lifecycle = dead
deathCause
damage/effect attribution
killAttribution
trueSelfId if any
lifeSerial
combatInstanceId
deathCommitBatchId
```

Then mandatory world/system observers run.

---

# 85. DEATH COHORT

A **Death Cohort** contains all qualifying Chân Ngã-bearing deaths confirmed in one simultaneous commit batch.

Conceptual record:

```text
deathCohortId
commitBatchId
qualifyingTrueSelfIds[]
cohortSize
```

Members are simultaneous relative to one another for Luân Hồi.

---

# 86. DEATH COHORT EXAMPLE

Existing waiting:
```text
A = 0/4
```

Simultaneous batch kills:
```text
B,C,D,E
```

Kernel:

```text
cohortSize = 4

advance pre-existing waiting:
A: 0 → 4 → Reincarnation

then create:
B = 0/4
C = 0/4
D = 0/4
E = 0/4
```

B/C/D/E do not count one another.

---

# 87. SEQUENTIAL DEATHS

If one Natural Action contains sequential lethal hits:

```text
hit1 → B confirmed dead
hit2 → C confirmed dead
hit3 → D confirmed dead
```

these are separate Death Cohorts.

Therefore later deaths truly advance earlier waiting entries.

---

# 88. REINCARNATION LEDGER

World-level ledger concept:

```text
waitingRecords:
  trueSelfId
  lifeSerial
  deathCohortId
  laterDeathCount
  threshold
  state
```

Current standard threshold:
`4`.

---

# 89. QUALIFYING LUÂN HỒI DEATH

Default qualifying:
- Chân Ngã-bearing Character;
- relevant NPC/real life entity as defined by mode/system.

Default excluded:
- Summon without Chân Ngã;
- Despawn;
- Fusion Consumption;
- Removal;
- HP_ZERO only.

---

# 90. LUÂN HỒI BOOKKEEPING ORDER

On Death Cohort commit:

```text
1. build cohort
2. identify waiting entries existing before cohort
3. add cohortSize to each eligible existing waiting count
4. move records reaching threshold to REINCARNATION
5. create new waiting records at 0 for cohort members
6. then release ordinary reaction queue
```

This is mandatory world-law bookkeeping, not an ordinary delayed Reaction.

---

# 91. REVIVE VS REINCARNATION

If a qualifying death pushes A from `3/4 → 4/4`:

```text
A enters Reincarnation
before ordinary queued Revive resolves
```

Queued ordinary Revive fails.

If Revive committed earlier:
- waiting record closes;
- later death does not affect that old record.

---

# 92. ORDINARY REVIVE

Ordinary Revive:

```text
requires DEATH_CONFIRMED
→ validates revive eligibility
→ closes/cancels active waiting record for that death
→ materializes same life
→ preserves lifeSerial
```

Character-specific override may increment lifeSerial.

---

# 93. REVIVE HP ASSIGNMENT

HP assigned on Revive is lifecycle initialization.

It is not:
- Heal;
- Overheal.

No Heal trigger by default.

---

# 94. REINCARNATION / REBIRTH

When entering new life:

```text
trueSelfId remains
lifeSerial increments
new host/body/form may be selected
new Combat Definition may be bound
new Presentation Definition may be bound
new Side may be assigned if route permits
```

All these are separate policy fields.

---

# 95. PYGmalion PUPPET STORE

Pygmalion runtime should track:

```text
pygmalionRef
currentLifeCycleSerial
puppetCreationQuotaUsed
puppetRefs[]
```

Do not track only one `activePuppetRef`.

---

# 96. PUPPET CREATION

Each Pygmalion Life Cycle:

```text
quota max = 1 new Puppet
```

Creating new Life Cycle initializes a new quota scope.

Old Puppet refs persist.

---

# 97. PUPPET HOST STATE

Each Puppet:

```text
puppetRef
hostStatBasis
presentationDefinition
effectiveElementProfile
hostedTrueSelfId?
inheritedCombatDefinition?
classFromInheritedDefinition?
presenceState
```

---

# 98. PUPPET CLASS

When inhabited:
> inherit Class from inherited Combat Definition.

Class-sensitive mechanics read this Effective Class.

---

# 99. PUPPET ELEMENT

Inherited Combat Definition does not overwrite Puppet Effective Element.

Element remains host/profile-derived.

---

# 100. ONE TRUE SELF PER PUPPET

Routing uses atomic reservation.

Flow:

```text
query empty eligible Puppets
→ select/reserve one
→ bind True Self
→ bind inherited definition
→ materialize/activate
```

Two simultaneous routes cannot bind one Puppet.

---

# 101. PUPPET IS NOT SUMMON

`entityKind = PUPPET`.

Summon-only filters do not match automatically.

If an effect says:
> Summon or Puppet
then TargetSpec includes both kinds.

---

# 102. INHABITED PUPPET DEATH

On confirmed death:

```text
active Puppet body disappears
→ death record preserves host relation
→ hosted True Self enters ordinary waiting
→ inherited Combat Definition retained in revive record
```

---

# 103. PUPPET ORDINARY REVIVE

Before hosted True Self reaches Reincarnation:

```text
same Puppet-life rematerializes
same trueSelfId
same lifeSerial
same inherited Combat Definition
```

After True Self enters Reincarnation:
> old Puppet-life ordinary Revive is invalid.

---

# 104. PYGmalion ULTIMATE FOLLOW-UP

For each eligible own Puppet:

```text
REQUEST_ACTION
actor = Puppet
behavior = FOLLOW_UP
actionIdentity = Puppet current Basic Attack identity
naturalActionStatus = NON_NATURAL
```

If Puppet dies before execution:
- drop child;
- no replacement.

---

# 105. PYGmalion ATTRIBUTION

For Ultimate Puppet follow-up:

```text
Behavior Source = inherited Puppet Combat Definition
Damage Attribution = Pygmalion
```

Inherited secondary effects default:
- Puppet/effect-source attribution;
- not automatically Pygmalion.

Specific secondary effects may override.

---

# 106. CAPABILITY INDEX

Capability Index is a normalized search/runtime query view.

Sources:

```text
Functional Tags
Schema Facets
Axiom/System Metadata
source-specific realized properties
```

---

# 107. CAPABILITY CONTRIBUTION

Do not store every capability as one boolean.

Conceptually:

```text
capabilityId
sourceContributions[]
```

Example:

```text
TRUE_DAMAGE:
  - native Skill 2
  - Realized Sword
```

Removing Sword removes only Sword contribution.

---

# 108. NARRATIVE RUNTIME

Narrative subsystem stores:

```text
StoryInstance
Container
Bearer
WitnessSet
CausalBelief
Stability
Evidence
KnowledgeState
RealizedProperty
```

It is separate from ordinary Buff/State runtime where necessary.

---

# 109. STORY INSTANCE

Conceptual:

```text
storyId
owner
state
claim
containerRef
bearerRef?
proofSubjectRef?
witnessRecords[]
belief
stability
evidence[]
realizedPropertyRefs[]
```

---

# 110. WITNESS SET

Witness membership updates when:
- actor enters/leaves Combat Instance;
- actor dies/revives;
- perception/knowledge eligibility changes.

No static witness count assumption.

---

# 111. BELIEF VS STABILITY

Runtime stores them separately.

Damage to Container can change Stability without automatically changing Belief.

Proof/Counter-Proof can affect one or both according to Story Contract.

---

# 112. NARRATIVE CLOCK

Legacy Story personal “Turn Boundary” wording is not used directly.

Story cadence must bind to an explicit clock profile such as:
- owner's Natural Action window;
- global Turn Boundary;
- another system clock.

Until Story cadence is user-confirmed:
> implementation remains unresolved for that exact timer.

---

# 113. REALIZED PROPERTY

Realized Property becomes a runtime property source.

It can contribute existing semantic capabilities.

It does not invent a new Tag merely because lore name is unique.

---

# 114. PROPERTY TRANSFER

Transfer is atomic:

```text
detach contribution from source holder
→ attach property to destination
→ rebuild affected capability contribution indexes
```

No temporary double ownership.

---

# 115. HISTORY RUNTIME

Quang Ảnh Chi Hà maintains ordered snapshots after complete Actions.

Conceptual:

```text
historySequence
rootActionId
actionId
combatStateVersion
snapshotRef
```

---

# 116. ACTION-COMPLETE HISTORY TIMING

History snapshot records only committed state after the Action reaches its canonical completion point.

It does not record animation frame state.

---

# 117. REGRESSION

Regression runtime:

```text
load SnapshotRef
→ validate regression scope
→ build restore transaction
→ resolve identity/lifecycle restrictions
→ commit selected fields
```

It does not automatically:
- rewind RNG;
- delete trace;
- un-send prior Events;
unless future time Contract says so.

---

# 118. EXECUTION TRACE

Trace is a first-class subsystem.

Recommended event record fields:

```text
traceSeq
eventSeq?
combatInstanceId
stateVersion
rootActionId?
actionId?
parentActionId?
effectRef?
originEffectId?
actorRef?
primitiveId?
contractId?
sourceRef?
ownerRef?
behaviorSource?
damageAttribution?
adjudicationOwner?
targetRefs?
snapshotRefs?
rngDomain?
rngDraw?
costResult?
damageResult?
healResult?
stateDelta?
authorityResult?
deathCohortId?
trueSelfId?
lifeSerial?
waitingCount?
storyId?
reasonCode?
actionFormProbeResult?
completionDependencyId?
completionDependencyStatus?
effectAdmissionResult?
```

Trace must be able to distinguish:

```text
same root Action
+ same Damage Attribution
+ different generating Effect
```

without inspecting presentation sequence.

Trace should also show why:

- an Action-form fallback candidate was rejected;
- an Effect was rejected by scoped Effect Admission;
- a blocking settlement ended in `FAILED_COST`;
- a root Action remained waiting for completion dependencies.

Pilot #3 runtime may additionally trace:

```text
actionIntentId?
originalRequestedActionIdentity?
effectiveActionIdentity?
interpositionId?
interpositionBranchId?
interpositionAnchor?
interpositionSettlementResult?
interpositionFailurePolicy?
interpositionTerminalStatus?
actionIntentRevalidationResult?
fallbackCandidateRef?
costTransactionId?
costTransactionStatus?
costPaymentResultRefs?
costGroupPaymentResultRef?
optionalPayerSnapshotRef?
effectModifierRefs?
effectModifierPhase?
modifierQueryResultRefs?
combinedModifierFactor?
reactionBoundaryProfile?
```

Trace must make it possible to distinguish:

```text
original Action Intent
≠ effective fallback candidate
≠ admitted Action
```

and:

```text
requested Cost amount
≠ actual committed Cost amount
```

without reconstructing either distinction from later state.

For distributed Cost, trace may use a stable technical payer iteration order for replay readability.

That trace order does not create gameplay priority or payment precedence.

For multiple scoped `MULTIPLY` modifiers, trace may list the participating modifier refs in a stable technical order while gameplay uses the combined phase factor rather than list-order precedence.

---

# 119. REASON CODES

Blocked/skipped operations should produce machine-readable reasons.

Examples:

```text
TARGET_EXCLUDED
TARGET_DEAD
COST_INSUFFICIENT
AUTHORITY_LOST
NO_OVERRIDE
REINCARNATION_ALREADY_ENTERED
UNIQUENESS_CONFLICT
SLOT_OCCUPIED
PUPPET_ALREADY_INHABITED
REACTION_RECURSION_BLOCKED
MODE_DISABLED
ACTION_FORM_CANDIDATE_ILLEGAL
ACTION_FORM_CANDIDATE_UNPAYABLE
ACTION_FORM_NO_VALID_CANDIDATE
EFFECT_ADMISSION_REJECTED
COMPLETION_DEPENDENCY_FAILED_COST
COMPLETION_DEPENDENCY_INVALID
PROVENANCE_RECURSION_BLOCKED
```

Pilot #3 runtime may additionally use machine-readable reasons such as:

```text
ACTION_INTENT_REVALIDATION_FAILED
ACTION_INTENT_NO_AUTHORED_FALLBACK
INTERPOSITION_SETTLEMENT_FAILED
INTERPOSITION_FAIL_INTENT
INTERPOSITION_MULTIPLICITY_INVALID
COST_REQUIRED_VALIDATION_FAILED
COST_REQUIRED_COMMIT_FAILED
COST_OPTIONAL_PAYER_FAILED
COST_GROUP_NOT_TERMINAL
COST_RESULT_BINDING_INVALID
COST_DISTRIBUTED_ORDER_DEPENDENCY_UNSUPPORTED
EFFECT_MODIFIER_OPERATION_UNSUPPORTED
EFFECT_MODIFIER_PHASE_INVALID
EFFECT_MODIFIER_QUERY_INVALID
SEQUENTIAL_REACTION_BOUNDARY_REQUIRED
```

`COST_OPTIONAL_PAYER_FAILED` is diagnostic.

Under:

```text
CONTRIBUTION_ZERO_CONTINUE
```

it does not mean the enclosing Ability failed.

---

# 120. DEBUGGING PRINCIPLE

For any interaction, trace should answer:

> Why did target receive/not receive this effect?

Example:

```text
Heal attempted on B
→ global no-Heal Rule A detected
→ B self-Heal Rule B directly conflicts
→ both Quy Tắc
→ Adjudication Owner A vs B
→ Rank equal
→ Tu vi B higher
→ B wins
→ conflict scope = B self-Heal only
→ Heal allowed
```

No hidden logic.

---

# 121. BATTLE TERMINATION

Leader confirmed death can mark Combat Instance terminal.

Working terminal behavior:

```text
finish atomic death + mandatory world-law bookkeeping
→ mark terminal
→ cancel ordinary future actions that cannot alter already-confirmed termination
→ cleanup
```

Battle-end prevention must intervene before terminal confirmed death.

Exact terminal queue cleanup remains Kernel policy to be finalized with stress tests.

---

# 122. NORMALIZED CONFLICT EDGE

Authority engine can represent:

```text
ConflictEdge:
  ruleA
  ruleB
  semanticConflictType
  overlapScope
  tierComparison
  adjudicationResult
  suppressionMode
  cacheSignature
```

This is better than:
`skillA beats skillB`.

---

# 123. AUTHORITY PERFORMANCE

Authority adjudication is cheap because:

- runs only on direct semantic conflict;
- same-tier special Authority only;
- cached by exact Rule pair + revisions;
- progression comparator is small;
- most Effects never conflict.

Do not precompute every pair of Abilities in the roster.

---

# 124. RULE CONFLICT DETECTOR

The Kernel needs a semantic conflict detector or normalized conflict declarations.

Possible normalized conflict categories:

```text
ALLOW vs DENY
MUTATE vs IMMUNE
HEAL vs HEAL_BLOCK
MOVE vs POSITION_LOCK
DEATH vs DEATH_PREVENT
REVIVE vs REVIVE_BLOCK
STATE_APPLY vs IMMUNITY
REMOVE_STATE vs UNREMOVABLE
```

Do not infer conflict by comparing Tag names alone.

---

# 125. CONFLICT SEMANTIC KEY

Each rule that can oppose another should expose a normalized semantic key.

Conceptual examples:

```text
HEAL_PERMISSION
POSITION_MUTABILITY
DEATH_PERMISSION
REVIVE_PERMISSION
STATE_REMOVABILITY
TARGETABILITY
```

Authority conflict exists when opposing operations address the same key and overlapping scope.

Exact conflict taxonomy should evolve through stress tests.

---

# 126. ORDINARY NORMAL EFFECT CONFLICT

NORMAL effects do not automatically use progression adjudication.

They follow ordinary Contracts:
- state stacking;
- last/first permitted application if defined;
- target restrictions;
- effect order;
- explicit immunity;
- system rules.

This preserves the legacy special status of Axiom/Quy Tắc/Pháp Tắc conflicts.

---

# 127. DYNAMIC AUTHORITY

A rule may change tier during battle.

Example:
after 3 Ultimate uses:
Pháp Tắc → Quy Tắc.

When tier changes:
- increment Rule adjudication revision;
- invalidate relevant cache entries.

Within one atomic effect resolution:
- sampled Authority remains stable by default.

---

# 128. CP SNAPSHOT

Adjudication CP should not fluctuate with ordinary temporary combat stat changes.

Recommended runtime:

```text
adjudicationProfile.cp
```

captured from battle-entry/build state.

If a mechanic explicitly changes adjudication CP:
- update profile;
- increment revision.

---

# 129. CULTIVATION / STAR / AWAKEN

Adjudication profile exposes normalized comparable values:

```text
rankOrdinal
cultivationOrdinal
starCount
awakenCount
cpValue
```

No UI-localized string comparison.

---

# 130. EXACT TIE PERFORMANCE

`NO_OVERRIDE` is a canonical result, not an error.

Kernel does not keep comparing unrelated fields after CP.

---

# 131. SHIELD PERFORMANCE

Standard pooled Shield avoids:
- N-layer hit iteration by source order;
- arbitrary FIFO/LIFO semantics.

Runtime can maintain:
- total;
- ledger;
- proportional scaling factor.

Implementation optimization can store normalized contribution weights and reconcile lazily, as long as authoritative visible values remain exact/deterministic.

---

# 132. SHIELD SOURCE EVENTS

Because provenance is preserved, future mechanics can observe:

```text
SHIELD_CONTRIBUTION_CREATED
SHIELD_CONTRIBUTION_EXPIRED
SHIELD_CONTRIBUTION_REMOVED
SHIELD_POOL_DEPLETED
```

Exact Event Catalog is not frozen here.

---

# 133. MODE PROFILE ADAPTER

Kernel core does not assume SSI globally.

Each Combat Instance has a Mode Profile adapter:

```text
SchedulingProfile
ResourceProfile
LifecycleProfile
TargetingProfile
SpatialProfile
AbilityProfile
```

Turn-based adapter enables SSI.

Exploration/Defense adapter can use real-time/spatial scheduling.

# 133A. SIDE-RELATIVE SPATIAL RESOLUTION

`SpatialProfile` must resolve common `SpatialSelectorSpec` side-relative directions without Character-specific slot code.

Conceptual interface:
ResolveSideRelativeDirection(
  orientationAnchorRef,
  originPosition,
  direction = FRONT | BACK | LEFT | RIGHT,
  step
)
→ PositionRef? / invalid
Runtime resolves:
orientationAnchorRef
→ reference Side
→ active Mode Spatial Profile orientation
→ destination Position
The resolver:
uses gameplay Spatial Profile orientation;
mirrors opposing Sides where Mode defines mirrored facing;
does not read camera/screen orientation.
A failed directional lookup returns invalid.
Fallback behavior remains authored/Contract-driven and is not hidden inside this resolver.

---

# 134. TURN-BASED KERNEL

Turn-based instance owns:
- slot grid;
- Side pointers;
- Natural Action scheduler;
- Turn Boundaries;
- True Self/Luân Hồi integration;
- full kit profile.

---

# 135. EXPLORATION/DEFENSE KERNEL

Current direction:
- no SSI;
- no Luân Hồi;
- simplified Ability profile;
- movement speed;
- attack speed;
- weight;
- Rage;
- AE generation.

Do not implement by forcing continuous time into SSI.

---

# 136. ROOM IS NOT SLOT

Exploration Room:
- spatial region/world unit.

Turn-based Slot:
- discrete combat position.

Shared semantic can be Position/Entity, but scheduler/spatial behavior differ.

---

# 137. COMPILER / KERNEL BOUNDARY

Compiler may:
- derive primitive request plan;
- build capability indexes;
- validate effect DAG;
- normalize defaults;
- generate conflict semantic keys.

Kernel may:
- execute;
- resolve current state;
- run Authority;
- mutate state;
- schedule.

Compiler must not predict runtime outcomes requiring current battle state.

---

# 138. NO RUNTIME PROSE PARSING

Kernel never interprets:

> “Quy Tắc: Đánh là chết”

as natural language.

Normalizer must already encode:
- effect semantic;
- target;
- Authority;
- conflict semantic key;
- lifecycle action.

---

# 139. KERNEL STATE OWNERSHIP

One subsystem should own each authoritative field family.

Example:

```text
HP/MaxHP → Health runtime
Shield → Shield runtime
Position → Position runtime
trueSelfId/lifeSerial → Identity/Lifecycle runtime
waiting count → Reincarnation ledger
Story Belief → Narrative runtime
```

Avoid duplicate writable copies.

---

# 140. READ MODELS

Other subsystems may expose read models/caches.

Example:
Capability Index can cache:
> Character has TRUE_DAMAGE.

But source-of-truth remains Ability/Property contributions.

---

# 141. INVALIDATION

Caches must invalidate by revision/version, not hidden heuristics.

Examples:
- capability contribution change;
- Authority adjudication profile change;
- Rule scope change;
- inherited Combat Definition change.

---

# 142. COMBAT DEFINITION CHANGE

When Combat Definition changes:

```text
bind definition
→ update Behavior Source
→ rebuild relevant Capability Index
→ update Effective Class if inheritance profile says so
→ do not change Presentation/Element/stat basis unless profile says so
```

---

# 143. PYGmalion INHERITANCE CHANGE

When Puppet receives inherited Combat Definition:

```text
Combat Definition = inherited source
Class = inherited source Class
Element = preserve host Effective Element
stat basis = preserve Puppet basis
Presentation = preserve Puppet
trueSelfId = routed True Self
```

---

# 144. DAMAGE ATTRIBUTION VS RULE OWNER

Do not use Damage Attribution to answer:
> whose Rank is compared in Authority?

That uses Adjudication Owner.

Do not use Adjudication Owner to answer:
> who gets damage credit?

That uses Damage Attribution.

---

# 145. WORLD SYSTEM ORDER

Mandatory world-law observers can execute before ordinary Reaction Queue when Contract requires.

Luân Hồi is such a case:

```text
DEATH_CONFIRMED
→ Death Cohort
→ waiting ledger
→ Reincarnation threshold transition
→ ordinary queued reactions
```

---

# 146. WORLD AXIOM IS NOT ORDINARY LISTENER

Do not implement World Axiom Luân Hồi as a low-priority Character Trigger that can accidentally lose queue priority.

It is a privileged lifecycle observer.

---

# 147. UNIQUENESS

Materialization Validator checks Duy Nhất before commit.

Random candidate selection pipeline:

```text
build eligible definitions
→ apply Uniqueness eligibility if known before draw
→ random select
```

If uniqueness conflict only becomes knowable at final materialization:
- use explicit failure/reroll policy.

No illegal materialization then rollback unless Contract specifically uses transactional retry.

---

# 148. MATERIALIZATION

Atomic materialization binds:

```text
identity
lifeSerial
entity runtime ref
Combat Definition
Presentation Definition
Side
Position
initial HP/resource/state
```

Then Entity becomes visible as active.

---

# 149. REVIVE ENTITY REFERENCE

Semantic same life does not require user-visible creation of a new Character identity.

Implementation may preserve a stable logical EntityRef while internally allocating a new storage generation if needed.

Kernel must guarantee:
- references are not confused across stale/dead generations;
- lifeSerial semantics remain correct.

Exact iid reuse policy is implementation-level unless a mechanic queries iid persistence.

---

# 150. STALE REFERENCE SAFETY

Typed EntityRef should include generation/version or otherwise validate lifecycle generation.

A delayed effect targeting old entity state must not accidentally hit a new unrelated object reusing storage.

---

# 151. TARGETING TRUE SELF VS ENTITY

TargetSpec can query:
- active Entity;
- dead True Self waiting pool.

Do not use active EntityRef to represent a Chân Ngã that no longer has a body.

---

# 152. REINCARNATION ROUTE RESERVATION

Routing into Puppet:

```text
query eligible empty Puppets
→ deterministic select
→ reserve Puppet
→ validate still empty
→ bind True Self
```

Reservation prevents two simultaneous route operations from taking same Puppet.

---

# 153. CHILD ACTION TARGET INHERITANCE

A child can:
- reuse parent target IDs;
- select new target;
- inherit target center;
- use child-specific TargetSpec.

No implicit behavior from visual sequence.

---

# 154. CHILD COST

Parent Ultimate can waive child AE.

Runtime stores:
- base Ability Cost unchanged;
- child execution Cost policy = waived.

Trace should show:
> cost waived by parent Action.

---

# 155. CHILD AUTHORITY

Runtime child Authority context records:

```text
sourceTier
effectiveTier
policy
outerActionRef?
```

This makes preserved vs inherited Authority inspectable.

---

# 156. ACTION COMPLETION TRACE

An Action should have explicit trace markers:

```text
ACTION_BEGIN
DIRECT_EFFECTS_COMPLETE
ACTION_COMPLETED
```

Do not infer completion from last VFX hit.

---

# 157. INTERMEDIATE REACTION WINDOWS

Sequential Actions use an explicit normalized Reaction-boundary profile whenever intermediate ordinary-Reaction timing is gameplay-relevant.

Pilot #3 requires canonical runtime support for:

```text
AFTER_DIRECT_EFFECTS_COMPLETE
```

Runtime semantics:

```text
direct sequential component
→ commit
→ mandatory immediate lifecycle evaluation
→ next legal direct component
→ ...
→ ACTION_DIRECT_EFFECTS_COMPLETE
→ local sequential Reaction hold opens
→ eligible ordinary Reaction candidates return to
   existing Trigger/Reaction scheduling
```

Mandatory lifecycle processing between components is not an ordinary Reaction window.

This profile is local to the Action that declares it.

It does not:

- establish global Reaction priority;
- resolve `TRG-005`;
- make Event order into gameplay priority;
- force an eligible ordinary Reaction to resolve before an unrelated blocking settlement;
- become the default for all sequential/multihit Actions.

The project-wide default intermediate-Reaction policy remains unresolved / `REQUIRED_EXPLICIT` where the distinction matters.

### Legacy runtime labels

Earlier Kernel text mentioned:

```text
REACTIONS_BETWEEN_COMPONENTS
QUEUE_UNTIL_ACTION_COMPLETE
```

Those names are not silently promoted into canonical Stage-3 authoring values by this patch.

If existing generated content/replay data uses one of those legacy labels:

> migration must either prove an explicit semantic mapping to a currently Contract-supported profile or reject the legacy value for regeneration.

Do not silently alias:

```text
QUEUE_UNTIL_ACTION_COMPLETE
```

to:

```text
AFTER_DIRECT_EFFECTS_COMPLETE
```

because `ACTION_COMPLETED` and `ACTION_DIRECT_EFFECTS_COMPLETE` are distinct canonical boundaries.

Any additional Reaction-boundary profile requires its own explicit canonical Contract before executable runtime accepts it.

---

# 158. DEATH DURING COMPOSITE ACTION

If a child/target dies during sequential composite:
- later child target validity is checked by its policy;
- dead child actor may cause later requested child Action to drop;
- parent may continue if its Contract permits.

No blanket “parent cancels when any child target dies”.

---

# 159. BATCH DEATH AND TRIGGER EVENTS

For simultaneous cohort:
- each dead entity still receives an individual DEATH_CONFIRMED event/result;
- all share `deathCohortId`.

This preserves:
- per-character death triggers;
- cohort-level Luân Hồi semantics.

---

# 160. DEATH COHORT COUNT

Luân Hồi ledger increments by **number of qualifying deaths in cohort**, not number of cohorts.

This means an older waiting True Self can advance by 4 from one simultaneous AoE killing four other qualifying Chân Ngã.

Cohort members themselves start at 0.

---

# 161. EMPTY PUPPET DEATH

Current Pygmalion rule:

Empty Puppet dies:
> disappears.

If it has no Chân Ngã:
- no Luân Hồi waiting entry.

Lifecycle profile decides whether destruction is DEATH_CONFIRMED-like object death or Puppet-specific termination for other triggers.

Pygmalion Character Contract should specify exact event category if future effects observe Puppet death.

---

# 162. INHABITED PUPPET DEATH

Inhabited Puppet is Chân Ngã-hosting combat life.

Its confirmed death can create Chân Ngã waiting entry.

The host body disappears but death record preserves revive information.

---

# 163. PUPPET MULTIPLICITY

Pygmalion can own:

```text
Puppet P1
Puppet P2
Puppet P3
...
```

simultaneously.

Each has independent:
- iid;
- host stat basis;
- hosted True Self;
- inherited Combat Definition;
- states;
- lifecycle.

---

# 164. PYGMALION LIFE CYCLE QUOTA

Life Cycle quota record:

```text
ownerTrueSelf/life
quotaKey
used
max
```

Starting a new Pygmalion Life Cycle creates new quota scope.

Old Puppet count is irrelevant.

---

# 165. PERFORMANCE STRATEGY

Arclune complexity comes from interaction count, not raw primitive count.

Optimize by:
- indexed listeners;
- cached capability queries;
- Authority cache;
- pooled Shield;
- immutable definitions;
- typed result references;
- sparse persistent states;
- event domains;
- targeted invalidation.

Do not prematurely remove semantic distinctions for micro-performance.

---

# 166. DETERMINISM VS FLOATING POINT

For authoritative arithmetic, prefer deterministic numeric representation.

Candidates:
- fixed-point integers;
- carefully standardized decimal/fixed scaling.

Avoid platform-dependent floating-point divergence if multiplayer/replay later depends on exact outcomes.

This is an implementation recommendation, not a gameplay rule.

---

# 167. REPLAY

With:
- normalized definitions;
- deterministic inputs;
- RNG;
- Contracts;
- Action choices;

Kernel should be able to replay battle deterministically.

History snapshots can accelerate seeking/debugging.

---

# 168. SAVE / LOAD MID-BATTLE

A complete save needs:
- authoritative stores;
- scheduler queues;
- Action states;
- trigger queue;
- RNG domain states;
- trueSelf/lifecycle;
- Authority cache or enough inputs to rebuild;
- Shield ledger;
- Story state;
- history snapshot refs if needed.

Do not serialize presentation-only transient animation as authoritative.

---

# 169. NETWORK FUTURE-PROOFING

Even if initial game is not lockstep multiplayer, deterministic Kernel helps:
- replay validation;
- PvP anti-desync;
- simulation tests;
- AI battle verification.

Networking architecture is not fixed here.

---

# 170. TEST HARNESS

Kernel must support headless simulation.

Input:
- definitions;
- seed;
- initial state;
- chosen Actions.

Output:
- terminal state;
- Execution Trace;
- assertions.

This is essential before importing 200+ kits.

---

# 171. GOLDEN TRACE TEST

For each hard mechanic, store expected trace signature.

Examples:
- simultaneous AoE;
- Ký Ức echo;
- Authority Heal conflict;
- Reincarnation Death Cohort;
- Pygmalion multi-Puppet;
- Shield proportional depletion.

If Kernel change alters golden trace:
> inspect semantic impact.

---

# 172. PROPERTY-BASED TESTS

Useful invariant tests:

- Actual HP Damage never exceeds target HP removed.
- Shield absorbed damage never counted as Actual HP Damage.
- same-cohort deaths never increment one another.
- ordinary Revive preserves lifeSerial.
- Rebirth increments lifeSerial.
- one Puppet hosts max one True Self.
- Pygmalion can own >1 Puppet across Life Cycles.
- Target Exclusion does not remove geometry occupancy.
- exact Authority tie never uses RNG.
- child Action does not advance SSI unless explicitly natural.

---

# 173. FUZZ TESTING

Generate random combinations of:
- states;
- damage;
- shield;
- death prevention;
- revive;
- Authority;
- displacement;
- triggers.

Goal:
find:
- infinite reaction loops;
- invalid state;
- duplicate ownership;
- negative Shield;
- double Revive;
- two True Selves in one Puppet;
- inconsistent death cohorts.

---

# 174. INVARIANT VALIDATOR

Debug builds should validate after commits:

```text
Current HP <= Current Max HP
Standard Shield total == ledger sum
one active position occupant per slot unless mode says otherwise
one Puppet hosts <=1 True Self
active True Self not simultaneously waiting
reincarnated True Self not ordinary-revive-eligible
entity CombatInstance membership is coherent
child lineage has no cycle
```

---

# 175. FAIL-FAST

If normalized data hits an unresolved Contract branch required for outcome:
- fail validation before battle where possible;
- do not choose hidden fallback.

Examples:
- same mechanic depends on unspecified materialization policy;
- Story timer still uses ambiguous old terminology.

---

# 176. AUTHORING DIAGNOSTIC

For unsupported kit:

```text
UNSUPPORTED_SEMANTIC
Missing:
  conflict semantic key / Contract / Primitive / schema field

Do not generate custom Character code automatically.
```

---

# 177. KERNEL API CONCEPT

Conceptual high-level entry points:

```text
CreateEncounter
CreateCombatInstance
SubmitPlayerActionIntent
AdvanceSimulation
ResolveUntilInputNeeded
GetAuthoritativeState
GetTrace
```

Exact C# API deferred.

---

# 178. INPUT MODEL

Kernel receives semantic input:

```text
Actor chooses Ability X
with target intent Y
```

Kernel performs:
- eligibility;
- cost;
- target validation;
- resolution.

UI does not directly mutate HP/resource/state.

---

# 179. AI CONTROL

AI opponent/planner reads authorized state/query API and submits same Action Intent type as player.

AI does not bypass Kernel rules.

---

# 180. PRESENTATION EVENT FEED

Presentation receives immutable high-level events:

```text
ActionStarted
ProjectilePresentationRequested
DamageCommitted
StateApplied
DeathConfirmed
EntityMaterialized
```

Presentation can animate after authoritative resolution if desired.

Gameplay does not wait on it unless a specific presentation synchronization mode is intentionally built.

---

# 181. CONTENT HOT RELOAD

Development tooling may hot-reload definitions between battles.

Mid-battle hot-reload should be disabled by default because:
- cached Rule revisions;
- normalized IR;
- Contract references;
can become inconsistent.

---

# 182. VERSION COMPATIBILITY

Battle/replay metadata should record:

```text
schemaVersion
tagRegistryVersion
primitiveRegistryVersion
contractRegistryVersion
kernelVersion
contentVersion
```

This is critical for debugging old traces.

---

# 183. MIGRATION BOUNDARY

If internal Primitive implementation changes but semantic/Contract does not:
> Character source should not need migration.

If Contract semantic changes:
> affected Character/test traces may need review.

If Tag boundary changes:
> capability mapping and content need migration.

---

# 184. KERNEL ANTI-PATTERNS

Reject:

### A
`switch(characterId)`

### B
Tag-triggered raw code:
`if tag TRUE_DAMAGE then ignore all defenses`

### C
Using animation end as Action completion

### D
One generic `statusList` with no typed attachment/identity

### E
One generic `source` field replacing ownership/attribution

### F
One global “turn” integer for all clocks

### G
One Puppet variable on Pygmalion

### H
Shield stack resolved newest-first merely because list order

### I
Same-tier Authority broken by action order

### J
Simultaneous deaths arbitrarily sequenced for Luân Hồi

---

# 185. KERNEL STRESS TEST — STANDARD SHIELD

Initial:

```text
Shield A = 600
Shield B = 300
Shield C = 600
Total = 1500
```

Incoming eligible damage to Shield:
`300`

Commit:

```text
factor = 1200 / 1500 = 0.8
A = 480
B = 240
C = 480
Total = 1200
```

Then B expires:

```text
remove 240
Total = 960
A = 480
C = 480
```

No source-order choice occurred.

---

# 186. KERNEL STRESS TEST — TRUE + FINAL DR + SHIELD

Attack:
- Physical 100
- True 40

ARM reduces Physical:
`100 → 60`

Final Damage Reduction 20%:
`60 → 48`

True:
`40 → 40`

Pre-Shield total:
`88`

Shield = 50.

Result:
- Shield absorbs 50 proportionally from Shield pool.
- Actual HP Damage = 38.
- True component did not bypass Shield merely because it was True.

---

# 187. KERNEL STRESS TEST — AUTHORITY SELF-HEAL

A:
`QUY_TAC: no Heal battlefield-wide`

B:
`QUY_TAC: self Heal allowed`

B attempts Heal.

Conflict:
- same tier;
- direct overlap on B.

Comparator:
- Rank;
- Tu vi;
- Stars;
- Awaken;
- CP.

B wins.

Kernel stores suppression edge:

```text
winner = B self-Heal Rule
loser = A no-Heal Rule
scope = Heal targeting B
```

Heal on C remains blocked by A.

---

# 188. KERNEL STRESS TEST — AUTHORITY DIFFERENT TIER

A:
`QUY_TAC no Heal`

B:
`PHAP_TAC self Heal`

No progression adjudication.

A wins due higher Authority.

B's conflicting Heal is blocked.

---

# 189. KERNEL STRESS TEST — EXACT TIE

A:
`QUY_TAC kill target`

B:
`QUY_TAC cannot die`

All adjudication fields exactly equal.

Result:
`NO_OVERRIDE`.

Existing immortality protection remains.
Incoming lethal override fails in overlapping conflict.

No RNG.

---

# 190. KERNEL STRESS TEST — DEATH COHORT

A already at `0/4`.

One simultaneous Action kills:
B,C,D,E.

Kernel:

```text
DeathCohort #7 = {B,C,D,E}
cohortSize = 4

A → 4/4 → REINCARNATION
B,C,D,E → new waiting 0/4
```

Same-cohort members do not advance each other.

---

# 191. KERNEL STRESS TEST — REVIVE RACE

A at `3/4`.

B dies.

Kernel:

```text
DEATH_CONFIRMED(B)
→ cohort ledger
→ A 3→4
→ ENTER_REINCARNATION(A)
→ ordinary Reaction Queue
→ Revive(A) candidate checks
→ fails: A already in Reincarnation
```

---

# 192. KERNEL STRESS TEST — PYGMALION MULTIPLE PUPPETS

Pygmalion Life 1:
- creates P1.

Pygmalion dies/revives/new Life Cycle.

P1 survives.

Life 2:
- quota resets;
- creates P2.

State:
```text
P1 active
P2 active
```

No singleton restriction.

---

# 193. KERNEL STRESS TEST — PUPPET INHERITANCE

P2 host:
- Puppet presentation;
- Element host profile;
- Puppet stat basis.

True Self X routes in.

Inherited definition Y:
- Class = Assassin;
- Element = Fire.

Result:

```text
trueSelf = X
Presentation = Puppet
Combat Definition = Y
Effective Class = Assassin
Effective Element = Puppet host element, not automatically Fire
stat basis = Puppet
```

---

# 194. KERNEL STRESS TEST — PUPPET ULTIMATE FOLLOW-UP

Pygmalion Ultimate schedules P1/P2 Basics.

P1 dies before own follow-up.

P2 survives.

Result:
- P1 child Action dropped;
- no replacement;
- P2 Action executes;
- P2 behavior from inherited definition;
- P2 Damage Attribution = Pygmalion.

---

# 195. KERNEL STRESS TEST — FORGOTTEN

Ký Ức target is Forgotten.

Enemy random single-target:
- target filter excludes it.

Enemy full-field fixed AoE:
- area resolver sees occupied Position;
- includes it;
- Damage resolves.

---

# 196. KERNEL STRESS TEST — KÝ ỨC ECHO

Allied simultaneous AoE:
- T1 actual HP damage 40%;
- T2 actual HP damage 20%;
- T3 actual HP damage 50% and dies.

After Damage Action completion:
- T1 qualifies;
- T2 does not;
- T3 invalid because DEATH_CONFIRMED.

30 AE paid once.

Echo:
- only T1 receives 50% of its exact Actual HP Damage as new True Damage.

Echo lineage blocked from retriggering same Skill.

---

# 197. KERNEL STRESS TEST — HP LOSS

SSR Warrior completes Natural Action.

Kernel:

```text
Action direct effects complete
→ post-action HP_LOSS 1% Max HP
→ +4 Rage
→ HP_ZERO check
→ Death Prevention if needed
→ Natural Action fully closes
→ SSI pointer
→ Turn Boundary
```

No Damage event from HP Loss.

---

# 198. KERNEL STRESS TEST — SAME RULE CACHE

Rule A vs Rule B adjudicated once.

Cache result used on later attempts.

If B gains +30% ATK:
- cache stays valid.

If B's Tu vi changes through a legitimate mechanic:
- Adjudication profile revision increments;
- cache invalidates;
- compare again.

---

# 199. KERNEL STRESS TEST — STORY PROPERTY

Bearer has:
- native TRUE_DAMAGE source N.

Story Sword Realizes:
- adds TRUE_DAMAGE contribution source S.

Capability Index:
```text
TRUE_DAMAGE = {N, S}
```

Sword absorbed:
```text
remove S
TRUE_DAMAGE = {N}
```

Bearer retains native capability.

---

# 200. ARCHITECTURE FREEZE GATE

`06_KERNEL_RUNTIME.md` should not be considered fully frozen until:

1. remaining high-risk Contract blockers are resolved or explicitly scoped away;
2. upstream Terminology/Schema clock wording is synchronized;
3. 10–20 stress-test kits normalize cleanly;
4. headless simulation passes golden traces;
5. no Character-specific runtime switch is needed;
6. Authority conflict graph works with multi-effect kits;
7. Reincarnation Death Cohort tests pass;
8. Shield ledger/proportional depletion tests pass;
9. Pygmalion multi-Puppet/revive/inheritance tests pass;
10. Story capability contribution provenance works.

---

# 201. REMAINING IMPORTANT OPEN AREAS

Even after latest decisions, do not pretend these are finished:

- exact same-window Trigger priority across unrelated reactions;
- sequential multihit intermediate Reaction policy defaults;
- battle terminal queue cutoff;
- default damage-threshold Max HP reference when Max HP mutates mid-Action;
- default full-slot materialization fallback;
- invalid Duy Nhất materialization policy;
- Narrative personal cadence;
- Belief formula final;
- Knowledge propagation delay;
- Realized Property default Authority;
- Exploration/Defense AE ownership and real-time scheduling;
- exact event taxonomy names;
- exact C# storage model;
- exact numeric fixed-point scale.

These do not invalidate the architecture.
They remain Contracts/implementation choices that must stay visible.

---

# 202. FINAL KERNEL CHECKSUM

A correct Arclune Kernel must support all of these without contradiction:

1. Character source remains declarative data.
2. Runtime executes Normalized IR, not prose.
3. Tag does not execute code.
4. Primitive is not one-to-one with Tag.
5. Contract controls timing.
6. Natural Action is distinct from Action Identity.
7. Turn Boundary is between consecutive SSI Natural Actions.
8. Personal “own turn” mechanics use actor Natural Action windows.
9. CC can consume a Natural Action opportunity without executing an Action.
10. Target Selection is separate from Area Resolution.
11. Forgotten can be untargetable but still hit by fixed AoE.
12. simultaneous effects calculate from shared state and batch commit.
13. sequential effects can observe prior commits.
14. True Damage bypasses ARM/RES/final DR but not Standard Shield.
15. Standard Shields pool for absorption while preserving source ledger.
16. Standard Shield damage depletes contributions proportionally.
17. HP Cost ≠ HP Loss ≠ Damage.
18. Actual HP Damage excludes Shield and Overkill.
19. HP_ZERO is not DEATH_CONFIRMED.
20. Death Prevention precedes DEATH_CONFIRMED.
21. ordinary Revive is post-death and preserves lifeSerial.
22. Reincarnation/Rebirth/new life increments lifeSerial.
23. same Death Cohort members do not count one another.
24. an older waiting True Self advances by every qualifying member of a later cohort.
25. Luân Hồi bookkeeping precedes ordinary queued Revive.
26. Identity ≠ Presentation ≠ Combat Definition.
27. Behavior Source ≠ Damage Attribution ≠ Adjudication Owner.
28. different Authority tiers resolve without progression comparator.
29. same special Authority tier uses Rank → Tu vi → Stars → Awaken → CP.
30. Authority adjudication applies only to direct semantic conflict scope.
31. exact total tie returns NO_OVERRIDE.
32. persistent losing rule is suppressed only in overlap.
33. instant losing effect fails only that interaction.
34. Authority result caches by Rule pair + revisions.
35. Pygmalion can own many Puppets across Life Cycles.
36. Puppet is not automatically Summon.
37. one Puppet hosts at most one Chân Ngã.
38. inhabited Puppet ordinary Revive can restore same Puppet-life before Reincarnation.
39. Puppet inherits Combat Definition Class but not Element.
40. Pygmalion Ultimate Puppet Damage Attribution can differ from behavior source.
41. Arena is an isolated Combat Instance, not a Field.
42. World Axiom Luân Hồi can observe Arena deaths.
43. Narrative Belief ≠ Stability.
44. Capability Index preserves source contributions.
45. Quang Ảnh history is based on authoritative Action completion.
46. Kernel determinism never justifies inventing missing gameplay semantics.
47. unresolved Contract branches fail visibly rather than guessing.
48. no ordinary mechanic requires Character-specific engine code.

49. Action Intent / Request remains distinct from an admitted Action at runtime.
50. A normalized `PRE_ADMISSION_PRE_COST` interposition may settle before ordinary rejection and then revalidate the same preserved original Intent.
51. Interposition fallback is explicit Character/System data and remains inside the same SSI-granted Natural Action opportunity unless another Contract says otherwise.
52. `POST_COST_PRE_EFFECT` runs only after the complete active Cost transaction is terminal, including all frozen optional distributed payer attempts and group-result construction.
53. Dynamic distributed payer membership is frozen before any payment commit; every member pays its own Cost.
54. Distributed HP Cost is not caster Damage.
55. `requestedAmount` and `actualPaidAmount` are distinct immutable runtime result fields, and zero actual payment does not itself imply failure.
56. Distributed payment member results remain individually addressable through the CostGroup result and do not collapse into one ambiguous singular binding.
57. Scoped Effect-amount modifiers are resolved only through bounded normalized source/recipient/effect/component/query/phase data.
58. Current scoped amount operation `MULTIPLY` does not create modifier priority; all matching factors participate in one phase.
59. `PRE_OVERHEAL` modifies Heal before actual restoration and Overheal derivation.
60. `FINAL_DAMAGE_REDUCTION` applies after Physical/Will mitigation and before Shield; True Damage bypasses that phase.
61. `AFTER_DIRECT_EFFECTS_COMPLETE` defers ordinary Reactions across declared direct sequential components while still permitting mandatory immediate lifecycle processing.
62. Fallback inside one preserved Action Intent does not create a second `ACTION_INTENT_CREATED` cycle or rerun interposition branch selection.
63. `CONTINUE` and `FAIL_INTENT` are explicit runtime outcomes of interposition settlement failure; post-cost `FAIL_INTENT` does not automatically refund already-committed Cost.
64. Opening a local Reaction boundary does not establish priority against unrelated blocking settlements or same-window Reaction candidates.
65. Pilot #3 requires no Character-specific runtime branch, new Functional Tag, or new Primitive.

---

# 203. NEXT STAGE

After review and targeted cleanup:

> **Chặng H — `07_MODE_PROFILES.md`**

However, before treating the architecture as freeze-ready, it is sensible to do one of two things:

```text
A. resolve the remaining highest-risk Contract questions;
or
B. create 08_STRESS_TESTS.md immediately after Mode Profiles and use those tests to force the remaining answers.
```

The Kernel architecture itself is now sufficiently defined to support either path.
