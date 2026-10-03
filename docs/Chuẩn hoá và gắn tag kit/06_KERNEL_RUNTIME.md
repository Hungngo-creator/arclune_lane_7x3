# ARCLUNE — KERNEL RUNTIME
## Chặng G — Deterministic Runtime Architecture
**Version:** 2026-10-03-G.10
**Status:** Working Canonical Candidate  
**Depends on:** `01_TERMINOLOGY_vNext_PILOT4_MERGED.md`, `02_TAG_vNext.md`, `03_PRIMITIVE.md`, `04_ABILITY_SCHEMA-1.md`, `05_CONTRACTS.md`
**Scope:** runtime architecture, state ownership, schedulers, queues, transaction boundaries, execution pipeline, deterministic ordering, authority adjudication, lifecycle systems, traceability.  
**Non-goal:** implementation code, Unity class layout, networking transport, renderer, editor UI.

**Revision G.1:** incorporates Pilot Normalization #3 runtime support for bounded Action Intent interposition/revalidation, dynamic distributed multi-payer Cost execution, immutable typed Cost-payment results, scoped Effect-amount modifier evaluation, and explicit `AFTER_DIRECT_EFFECTS_COMPLETE` sequential Reaction-boundary execution. No new Functional Tag or Primitive is introduced.

**Revision G.2:** executes the merged Pilot #4 Schema and F.3 Contracts through existing runtime owners: static-Passive initialization, pre-mitigation component-type transforms, battle-scoped Deployment Cost and lock, atomic Return-to-Deck retention cleanup, and metric-selector tie resolution. No Character-specific runtime branch, Functional Tag, Primitive, callback registry, or generic priority system is introduced.

**Revision G.3:** adds checkpoint-scoped committed-result views, Shield addition receipts/source-family caps and explicit Slot tie resolution through existing owners. No Character-specific runtime, Functional Tag, Primitive or generic priority is introduced.
**Revision G.4:** executes typed relation context, corrected Shield owner/zero-result law, durable replay identity, required post-completion settlement and bounded Final Damage amplification through existing owners. No Character-specific runtime, Functional Tag, Primitive or generic priority is introduced.
**Revision G.5:** lowers bounded HP-payment profiles and immutable post-payment HP into existing Cost/State/Result transactions; handles explicit admitted-Action continuation through Cost-caused lifecycle before direct Effects. Existing defaults/distributed barriers are preserved.
**Revision G.6:** joins explicitly transition-completed prevention to existing Return/State/Lifecycle transactions, with staged survival, completion-owned allowance and failure/replay handling. No Character runtime or global priority.
**Revision G.7:** lowers direct Execute, own-excluding stat baselines, pre-Cost capture, shared-recipient allocation, mitigation-stat override and local Cost continuation through existing owners; ordinary defaults/profiles remain unchanged.

**Revision G.9:** executes DMG-034 through existing Damage/Contract/Result/Transaction owners, with packet-kind reduction scope and immutable immediate-source/basis references. No Character service, fourth component pipeline, new Primitive or priority/lifecycle-barrier system.

---

**Revision G.10:** executes E.9/F.11 through existing Target/Area/Position/RNG/Transaction, Damage/Shield/Result, Health/Lifecycle/Trigger and SSI/State owners. Explicit scoped phase/checkpoint/obligation data supplies the missing boundaries; no Character runtime, new Primitive, arbitrary callback or generic priority.

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
damageTransformPlan
authorityPlan
attributionPlan
capabilityIndex
primitiveRequests
contractRefs
validationHash
```

`intentInterpositionPlan` is generated from bounded Ability-owned `ActionIntentInterpositionSpec`.

`effectModifierPlan` is generated from bounded `ScopedEffectAmountModifierSpec`.

`damageTransformPlan` is generated from bounded `ScopedDamageComponentTransformSpec` and is distinct from numeric amount modification. `targetPlan` preserves the declared metric tie policy independently from target lock/invalidation. Typed `DEPLOYMENT_COST_MODIFICATION` and `RETURN_TO_DECK` nodes use the existing Effect/deployment execution plan and Contract Resolver, not new Primitive IDs.

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
- invalid Cost-result binding shape;
- unsupported Damage transform operation/phase or incompatible overlapping transforms;
- unresolved required deployment initialization data, ambiguous static initialization order, invalid retention profile, or undeclared observable metric tie behavior.

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
- deployment metadata/runtime references;
- battle-participant-keyed Current Deployment Cost, declared floor, and lock state under §10B;
- static deployment-state battle-initialization completion records under §35A.

The battle participant is the stable roster runtime identity within the owning battle. It is not the mutable Field Presence, destination Slot, or child Combat Instance. These records must not be duplicated as writable Resource Pools or ordinary attached State.

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
→ resolve deploymentPaymentAmount from initialized CURRENT_DEPLOYMENT_COST
→ validate Deployment Cost Bar against that amount
→ validate / reserve destination Position
→ open atomic deployment transaction
→ debit Deployment Cost Bar by that same deploymentPaymentAmount
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

Under `DEP-001`, validation and debit use the same authoritative Current value. Transaction Manager protects that read through commit; a conflicting intervening mutation must not let an attempt validate one amount and pay another. Successful deployment retains battle Deck membership. Deployment consumes initialized battle state and never runs static battle initialization again.

---

# 10B. BATTLE-SCOPED CHARACTER DEPLOYMENT COST

The existing deployment runtime owns this field family in `DeckState` under `DEP-002` / `DEP-006`, keyed by owning battle × stable battle participant:

```text
resolved Base Deployment Cost reference
currentDeploymentCost
floor
locked
lockedValue?
```

Base is resolved Character/deployment metadata, not a writable battle Resource Pool. Current and its lock are authoritative battle state.

Creation follows §35A: resolve executable Base → initialize Current from Base → initialize unlocked state → settle declared static initialization mutations → expose initialized reads. Unresolved required Base/Current data blocks execution-ready initialization; `TBD_BY_COST_BUDGET` is never a numeric fallback. This runtime does not compute the future Cost Budget formula.

A normalized `DeploymentCostModificationSpec` resolves its typed subject and operation at the declared Effect checkpoint:

- `ADD_CURRENT`, while unlocked: evaluate the authored pure value and commit `max(floor, authoritative Current + value)`.
- `LOCK_CURRENT`: capture the exact then-authoritative Current as `lockedValue` and freeze that value for the battle remainder.
- `ADD_CURRENT`, while locked: record no Current-value change; preserve already-committed Effects and the enclosing admitted Action. Unrelated Side Deployment Cost Bar gain remains legal.

The floor is enforced whenever a Current mutation commits; it does not rewrite Base. There is no implicit unlock operation. Undeclared order between conflicting mutations/lock operations is not supplied by runtime iteration.

`BASE_DEPLOYMENT_COST_REF` and `CURRENT_DEPLOYMENT_COST_REF` are pure typed reads from their respective owners. Snapshot Runtime captures the selected authoritative value and state version at the declared checkpoint; later mutation or lock never rewrites an earlier `SnapshotRef`. Deployment payment reads Current, not an earlier formula snapshot or Base.

Ordinary same-battle Return-to-Deck/redeployment reuses Current and its lock. Other lifecycle transitions follow their explicit Contracts; field exit alone never creates another initialization lifetime. Battle end retires the records; a new battle resolves Base and creates fresh unlocked state. Save/load and replay preserve Current, floor, lock/value, participant identity and initialization completion, without reapplying mutations during restoration.

---

# 10C. RETURN-TO-DECK TRANSACTION

The existing deployment runtime coordinates `ReturnToDeckSpec` through Transaction Manager, presence/Position machinery, State Runtime and source-aware Shield Runtime under `DEP-007` / `DEP-008`.

```text
resolve typed subject and current Combat Instance
→ validate declared source/destination deployment states
→ validate current presence, Deck-membership policy and retention profile
→ freeze retention decisions from authoritative pre-transition state
→ stage presence/Position exit, deployment destination and selected cleanup
→ commit one coherent authoritative post-state
→ release post-commit observations with transition/cleanup causes
```

For the current bounded profile, `BATTLEFIELD_ACTIVE → DECK_UNDEPLOYED`, `LEAVE_CURRENT_COMBAT_INSTANCE` and `RETAIN_BATTLE_DECK_MEMBERSHIP` produce: no active presence/occupancy in that instance, returned deployment state, retained battle Deck membership. This is `LEAVE_FIELD` caused by `RETURN_TO_DECK`, not Death, Temporary Absence, Arena transfer or removal/erasure.

No presence exit, destination-state mutation or transition-owned cleanup commits on failed validation. Earlier committed Action Effects remain committed. Downstream nodes requiring successful return must declare dependency/Conditions on the successful transition post-state; runtime never assumes success.

When this Return operand is owned by an opted-in deathPrevention completionTransitionRef, §83 / DTH-007 supplies the enclosing transaction. Reuse these validation/retention/staging operations against that transaction's proposed surviving subject view; do not separately commit Return or release observations before survival/life/allowance completion shares the common barrier. Standalone Return follows the existing path.

### Retention and terminal causes

State/Shield retention metadata is read from §§51/61. Freeze a decision for every relevant attached State/Shield contribution before staging removals. For each item, use the first matching decision in this Contract order:

```text
1. discardStateClassifications
2. discardRetentionScopes
3. retainRetentionScopes
4. unmatchedStatePolicy
```

Classification discard therefore wins over a retained scope. A `BATTLE_SCOPED` Debuff is still removed when `DEBUFF` is explicitly discarded. `unmatchedStatePolicy = RETAIN` preserves unselected items; `REQUIRED_EXPLICIT` must be resolved before executable transition content is accepted. No Character-specific State-ID cleanup list is consulted.

Removal is transition retention, not Cleanse: Authority Tier alone does not exempt selected Buff/Debuff/Mark instances. A real future protection against transition cleanup requires its own explicit conflict Contract.

Stage selected State termination, modifier deregistration, duration/recovery-window retirement and selected Shield-ledger removal inside the same transaction. Retire pending clock/settlement work owned by terminated windows so it cannot execute later as natural expiry or survive redeployment; preserve unrelated work and already-consumed battle use counts. Remove only selected Shield contributions and recompute their pool totals without simulating Damage absorption.

Removed entries record `TRANSITION_CLEANUP` and separately retain the owning `RETURN_TO_DECK` transaction/cause. State/Shield terminal observers see the committed post-state and those immutable causes. Cleanup does not emit break/depletion, natural expiry or Cleanse semantics, and cannot create a break/expiry-only recovery window or natural-expiry Heal. Internal cleanup iteration and `eventSeq` are not gameplay priority.

`currentHpPolicy = RETAIN` preserves Current HP. Deployment Current Cost/lock are outside the attached-State collection and remain available in `DeckState`; ordinary retained battle counters/flags remain in their own stores. No HP reset, lifeSerial mutation, Cost decrement, Cost Bar gain, full Rage or Natural Action is implicit in the transition.

### Commit and Action continuity

No reader/listener may observe absent presence with Battlefield-active deployment, Deck destination with active old presence, or cleanup before its terminal cause exists. Transaction Manager validates the protected read/decision set and publishes only after the common commit barrier.

The already-admitted Action retains its execution/provenance context after successful return. It may finish explicitly authored downstream nodes whose own legality passes, including deployment-system mutation and Side resource gain. Active-presence requirements still apply to nodes that declare them; no new off-field Natural Action is granted. Later legal redeployment uses §10A, full-Rage and SSI rules as before, with a fresh field-presence cycle and no static battle reinitialization.

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

For an explicitly requested target Entity already selected/locked at pre-cost target context, preserve that typed target reference in existing originalRequestedSelector/sourceDecisionContext and carry it into the admitted Action targetContext. CST-007 validates its mandatory pre-cost legality; later target-plan execution reuses the lock and applies TGT-006 invalidity rather than selecting a replacement. This does not perform RNG selection during a candidate payability probe or change timing for Actions without such an authored explicit-input profile.

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

Ordinary and reflected Damage contexts preserve packetKind (ORDINARY by default) and immutable immediate damageSourceRef from the built packet through the existing packet/result/Event provenance view; DMG-034/source-group consumers require that retained axis. They are not substitutes for effectSource or Damage Attribution. Non-Damage contexts leave them absent; causal root equality cannot turn reflected Damage into own-direct outcome membership.

### Direct-effect ownership query

`DIRECT_EFFECT_GRAPH_OF_SCOPED_ACTION` resolves through the existing normalized Effect graph and immutable Effect context. Preserve enough owning Action/node membership to test that the resolving Effect belongs to the declared scoped Action's own direct graph. A separate child Action or standalone triggered Effect fails that test even if its `rootActionId` matches. A Passive modification of the same direct hit preserves that hit's membership.

This typed query is available to transform scope checks and committed Damage-result aggregation. It does not change which child steps block Action completion. Propagate the same provenance through result/Event references so later aggregation cannot reconstruct direct ownership from attribution or temporal coincidence.

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

## 19A. REQUIRED OPPORTUNITY-START SETTLEMENT

04§7.15 → ACT-034 → existing SSI/Mode opportunity grant, State/Trigger/DAG/Transaction and continuation owners. An actual-completion clock cannot return a retained occupant before a CC-lost opportunity; this extension is a finite pre-control grant dependency.

Once the existing scheduler grants the owner opportunity, record its instance-local serial and register applicable State-instance obligations whose creation serial is earlier. Run their authored termination/Heal graph to terminal status before the same grant's CC/selection/admission. Do not materialize a new Entity/Slot or publish ENTER_FIELD when authoritative presence/ownership never changed. Required Heal uses the ordinary Heal/Overheal pipeline. Then resume the original opportunity; CC may consume it without an Action/completion, Passive refresh, duration decrement or class regeneration.

Retain owner/instance/grant/State/dependency and cancellation/terminal cursor in existing scheduler/Trigger records. Death/leave/State retirement cancels as authored; recovery cannot Heal a newer presence or create an extra opportunity. Reject cycles/waits on this held opportunity's future Action, missing Mode abstraction and unsupported competing settlements. Actor-window grant/reset remains CLK-002; this does not change completion-based clocks or invent private Turn Boundaries.

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

For normalized ACT-033 obligations, the existing Scheduler keeps required post-action work keyed by completed Natural Action + runtime trigger owner + instantiated candidate/local dependency. Completion dispatch registers/evaluates these obligations before this handoff. Eligibility false or clean failure closes the obligation; a created settlement must be terminal before TURN_BOUNDARY or the next Natural Action opportunity. This never reopens/delays the completed Action. Existing Mode semantics decide other hooks/order; this barrier creates no relative priority between unrelated work.

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

4A. only if normalized Snapshot timing opts into SNP-006:
      capture declared source fields once for this admitted Action
      before any active Cost debit; no probe-time capture/mutation

5. execute the entire declared active Cost transaction
   according to Cost Contract

6. Cost stage becomes terminal only when:
     all required Cost work is terminal
     AND all frozen optional distributed payer attempts are terminal
     AND all required payment results are stored
     AND declared CostGroup result/aggregates are constructed

6A. only on terminal Cost success, if normalized
    costLifecyclePolicy = CONTINUE_ADMITTED_ACTION:
      finish mandatory Cost-caused HP_ZERO/lifecycle work under CST-015
      resume this same admitted Action; do not cancel merely because its Actor
      returned to Deck or reached DEATH_CONFIRMED during that processing

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
    seal own-direct committed receipt-reference projection under §25A

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
    finalize/expose the typed committed-result view under §25A
    before completion observers are released

21. verify all root completion dependencies are terminal

22. ACTION_COMPLETED

23. publish/queue ACTION_COMPLETED-dependent work under existing Trigger/Reaction Contracts
    ordinary unmarked work remains non-blocking
    register/evaluate declared ACT-033 postActionSettlement obligations
    finish their required finite settlement work before Natural-Action handoff

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

ACT-033 extends only the required post-action stage of this pipeline: after ACTION_COMPLETED publication, register/evaluate declared postActionSettlement obligations and finish their finite work before SSI handoff that leaves this opportunity. Existing Mode hook ordering remains governed by its current Contracts/profile; this marker alone supplies no new relative priority against unrelated hooks/candidates. Ordinary unmarked completion-triggered work retains its existing nonblocking behavior. SNP-006 captures belong only to successfully admitted executions and remain keyed/immutable across CST-015 continuation; failed Cost produces no direct consumer, and replay never re-captures from newer source state. Snapshot/target planning steps do not force every stat capture before target selection: execute declared SnapshotSpec timing/dependencies, including AFTER_TARGET_SELECTION, without changing unrelated Action profiles.

# 24. EFFECT GRAPH RUNTIME

Within one Action, effects form a DAG.

Runtime tracks:
- ready nodes;
- blocked dependencies;
- typed result bindings;
- resolution group;
- transaction scope.

No unbounded loops.

For a normalized local CostGroup continuation under CST-015, Cost Runtime executes the entire group's existing transaction/result barrier inside this DAG. On success finish its declared success-side cap/use dependency before dispatching mandatory source HP_ZERO/lifecycle, retain the same enclosing admitted Action context/snapshots/locked targets and resume the already-admitted dependent hit/request. Failed local Cost closes only the authored branch under its failure policy; do not debit partially, consume use or create a new Action. No source-death cancellation is inferred for the opted-in admitted graph, no refund/re-admission occurs, and normal target/Effect invalidity remains authoritative.

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
ShieldAdditionResultRef
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

## 25A. CHECKPOINT-SCOPED ACTION RESULT VIEW

Existing Action finalization and Result Store execute `TRG-015`; no new result-aggregation manager is required. For a supported Damage/Heal/Shield commit owned by an executing Action, associate its immutable receipt with that existing ActionResult and Effect provenance. Actionless static/System Effects preserve Effect/transaction results without a fabricated Action and never enter an Action-direct view merely by temporal coincidence. At direct-stage finalization, seal the own-direct receipt-reference projection before `ACTION_DIRECT_EFFECTS_COMPLETE`. This is not an early freeze of the whole ActionResult: later blocking work can extend its summary without changing the sealed direct projection. Final aggregation exposes the finalized existing object, including `damageResults`, `healResults` and supported `shieldResults`, before `ACTION_COMPLETED`.

Child Actions retain their own receipt ownership. A parent may reference child results under an explicitly broader existing outcome scope; sharing root lineage never promotes them to the parent's own direct set. §15A supplies the direct-graph membership query.

At the declared checkpoint, Condition evaluation resolves `ACTION_RESULT_ANY` as:

```text
resolve reached Action checkpoint and its sealed/finalized result view
→ enumerate selected kind's committed receipt refs
→ test scoped direct-graph membership
→ test recipient filter against declared read/snapshot context
→ compare compatible immutable metric
→ return one ANY Boolean
```

No entry-order dependence, RNG, live HP/Shield delta reconstruction, payment or mutation is permitted inside this read. Empty collections yield false. Unsupported kind/metric/operation or incomplete Action references fail validation visibly; they are not guessed as nominal amounts or live State.

Receipt lifetime is owned by the existing Action/Result Store: create immutable receipts at commit, seal each checkpoint view before publication, retain while checkpoint observers/declared dependent work hold references, then release through ordinary result lifetime cleanup. Save/load and replay preserve pending refs and immutable provenance/values; rebuilding an index does not replay committed Effects.

Recipient relation/filter queries execute the required normalized readContext: OBSERVATION_STATE through existing state reads, or SNAPSHOT through the retained typed SnapshotRef covering recipient, anchor and all requested facts. Validate coverage and fail visibly rather than substitute live allegiance. Result amount/provenance stays immutable regardless of that context.

Trigger Engine can use this view to update ordinary field-scoped State/counters and consume them before an authored non-Natural settlement via existing Effect DAG/Transaction Manager. It does not create a Character-specific memory service or global ordering between unrelated observers. An ADEC State update may use existing §39A bounded completion dependencies registered before the barrier. A completion-triggered settlement cannot block the completion Event it waits for. Distinct trigger-owner/candidate instances are not collapsed merely because they share an authored dependency ID. For an authored single-observation mechanic, mutually exclusive checkpoint rules prevent counting the same Action twice; no global priority between unrelated candidates is inferred.

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
Damage packet kind?
resolutionPhase
authoritative state version
normalized effectModifierPlan
existing Attribution context
explicit SnapshotRefs?
existing scoped Action/provenance and Action-local result bindings?
```

Canonical evaluation:

```text
Effect reaches declared phase
→ enumerate normalized modifier candidates for that Effect semantic/phase
→ source-scope test
→ recipient-scope test
→ Effect/component-scope test, including optional directActionRef own-graph provenance
→ structured Condition evaluation
→ bounded read-only valueQueries
→ evaluate pure scalar formula
→ collect typed matching operations for this phase
→ existing amount phases: combine MULTIPLY factors and apply once
→ HEL-005 coefficient phase: canonical ADD fold before one requested-Heal calculation
```

For DMG-034 reflected scalar Damage at FINAL_DAMAGE_REDUCTION, pass packetKind REFLECTED_DAMAGE without an ordinary component type. Existing source/recipient/Condition/value-query/multiplicative law remains; a component filter cannot match that scalar and reflected-only incompatible phase data is rejected. Omitted packet-kind filter adds no restriction; existing explicit component scopes stay intact. No synthetic TRUE component or new modifier service.

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

For optional directActionRef, resolve the declared Action using existing Action context, then test own-direct Effect membership under §15A/TRG-013. Same root or Attribution alone does not pass. Resolve Cost/Snapshot/result inputs from that Action's existing Result Store; reject unavailable/foreign bindings. This evaluation needs no sealed Action-result collection or new mutable bonus State.

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

Operation at the existing amount phases:

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

HEL-005 adds only coefficient-phase ADD. §57 owns its sealed basis, single settlement/Heal and trace; §28A reuses its existing scoped candidate/Condition/value-query index to supply that canonical sum. No mixing ADD and MULTIPLY at an uncontracted phase.

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

### Explicit singular HP-payment profile / commit HP binding

For normalized `hpPaymentPolicy`, existing Cost validation / Transaction Manager evaluates CST-014 against one protected pre-payment view: requested amount, payer HP/MaxHP, structured case guards, floor and optional owner-keyed remaining-use counter. Cache one matched case and its proposed debit/result HP; reject no match/overlap, co-authored legacy floor, unsupported consumption context/input or ambiguous shared-payer/counter allocation. Do not choose by case/Cost iteration order. Read-only admission probes perform no debit, counter update, floor assignment or lifecycle publication.

Join the selected counter decrement and HP outcome with all required Cost writes/results at their authoritative atomic commit. If any required validation/admission or protected-read check fails, commit no AE/HP/floor/counter delta. A technical resume reuses frozen input/case identity rather than rerolling/reselecting it; a new logical attempt needs new validation. State Runtime remains the allowance owner; no new service.

At each successful singular HP payment commit, lower P-036's resulting HP to immutable `CostPaymentResult.currentHpAfterPayment` **before releasing resulting HP_ZERO/lifecycle work**. This includes successful zero debit. Store it with requested amount, actual paid amount, payer and success; do not capture it later from live HP. `COST_PAYMENT_REF / CURRENT_HP_AFTER_PAYMENT` resolves this HP-only field through the existing Result Store. Failed/non-HP/missing bindings fail closed, not to live HP or amount paid. Explicit floor assignment is non-Heal.

Existing Action execution records retain pending Cost-caused lifecycle work and `CONTINUE_ADMITTED_ACTION` profile under §23. After the entire active Cost stage reaches terminal success, Lifecycle Runtime resolves that mandatory work; death/return keeps this admitted Action's context/bindings for downstream legal nodes, without a new request/admission or hidden cancellation. Failed required Cost never enters direct continuation. Existing independently declared cancellation and recipient legality still apply. This does not authorize a dead/off-field Actor's next Action.

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
  singularHpPolicySelections[]? # protected input/case/counter refs and proposed HP outcome
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

### Shared-recipient allocation under RES-008

If a normalized simultaneous group opts into sharedRecipientDamageAllocation PROPORTIONAL, the existing Transaction Manager groups incoming packet/component demands by locked recipient, using the same shared phase state. Damage Runtime calculates each independent pre-Shield demand; existing Shield Runtime allocates each eligible layer's consumed budget across eligible demands proportionally and separately depletes source contributions under §52/SHP-002. Remaining HP-bound demand shares one recipient HP budget proportionally under RES-008. No independently proposed packet may spend that budget twice.

Commit one recipient net Shield/HP delta within the batch, retain separate immutable DamageResultRef receipts for all participating packets, then publish mandatory lifecycle/ordinary downstream work at the existing boundaries. Validate numeric conservation and permutation invariance before commit; reject unsupported allocation rather than round by list order. Batch/recipient/packet identities, shared state version and proposed shares belong to this existing transaction; pending save/load preserves them, successful commit seals receipts once, abort discards proposals and replay reuses terminal commit/results.

## 31A. Parent-owned child-Damage batch

For normalized 04§34.2B / RES-009, existing Action execution and Transaction Manager own a named parent batch's finite child-Damage participant plan. Keep participant real Action/Effect refs, delegated commit owner, supplied target/Snapshot bindings, preparation status, shared phase-state read set, transaction/receipt identities and terminal status on those existing records.

Expand only validated bounded request paths, instantiate each real child once and prepare selected Damage proposals without committing. Assign/preserve participant Action/Effect identities before preparation from their validated path/target bindings; seeded Hit Admission draws use that stable domain and retained draw receipts. Permuting technical preparation cannot reassign RNG streams to other targets or redraw on resume. Shared snapshots override child resnapshot only where ACT-023 explicitly says so. Admission/zero-or-waived Cost preparation must satisfy RES-009's read-only restriction; unsupported mutations/foreign Cost mappings fail closed, never silently vanish. Ordinary child observers may be recorded/queued but cannot mutate sibling calculation state before the barrier. Nested groups delegate their selected nodes to this batch, not another commit. No participant needs ACTION_COMPLETED to mark its proposals prepared or locally skipped.

Once all selected nodes are prepared/terminal under explicit local policy, use ordinary simultaneous Damage/Shield allocation and §29 transaction commit, seal receipts on each owning child's result, and run mandatory batch lifecycle. Then close child direct/completion dependencies and the declared parent outcome projection; ordinary eligible Reactions follow the local boundary. Technical preparation/completion order cannot change the already sealed batch. Invalid locks drop only their branch under authored policy; no new targets/draws. Abort publishes no partial Damage results. Preserve the participant/commit terminal identities across save/resume so replay cannot instantiate/commit/complete children twice. Other child execution profiles remain unchanged; no new batch service or Character branch.

The parent may seal its explicitly selected Damage-outcome projection after participant commit/lifecycle, before later non-Damage direct nodes. Existing Damage-completion/result-readiness then releases a damage-derived Heal and subsequent dependent nodes. Do not make an outcome consumer wait for the same root ADEC/completion it blocks, or close it before later declared qualifying Damage. This is existing Result/DAG work, not a new Event/aggregation service.

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

HEALTH_MUTATION_STABLE is one opted-in post-lifecycle observation per changed transaction/recipient under §35B/TRG-016. Its typed read view retains original commit/result/changed-field refs and stable subject health/life/presence context; it is not DAMAGE_COMMITTED for a non-Damage write. NATURAL_ACTION_OPPORTUNITY_GRANTED under §19A/ACT-034 retains scheduler grant/owner/Combat Instance/opportunity serial before ordinary control handling. These precise observations do not freeze a universal Event catalog or turn eventSeq into priority.

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

## 35A. STATIC PASSIVE REGISTRATION / BATTLE INITIALIZATION

Under `TRG-014`, the existing Trigger Engine / Contract Resolver registers normalized `PASSIVE_STATIC` rules with their owning Ability/System, runtime participant and declared lifetime. Repeated index construction for the same owner, normalized rule and lifetime reuses that registration rather than multiplying candidates. Registration supplies indexed admission/modifier/transform/mitigation-override candidates; it is not Event-driven Action execution and pays no Ability Cost, consumes no Natural Action and advances no SSI by itself.

Battle-scoped initialization Effects use the owning battle participant's initialization checkpoint, including participants initially undeployed in Deck. For deployment-state initialization, the deployment runtime owns completion records in `DeckState`, keyed by battle × participant × owning normalized Ability/System and initialization Effect identity. Other static initialization Effects remain with their existing state owners; they do not become deployment state merely because they use this checkpoint. Transaction Manager commits required initialization deltas and their completion records together before deployment/payment/formula readers can access initialized state:

```text
resolve execution-ready BASE_DEPLOYMENT_COST
→ initialize CURRENT_DEPLOYMENT_COST from Base
→ initialize its lock as unlocked
→ settle qualifying PASSIVE_STATIC initialization Effects exactly once
→ record initialization complete
→ expose final initialized state
```

A failed required initialization must not expose a partially initialized participant or guess unresolved numeric values. Retry resumes only uncommitted work and never reseeds already-created Current/lock state or repeats a mutation whose completion record committed. Reads remain gated until the required participant initialization is complete. Restoring a save restores records/state and rebuilds rule indexes without replaying initialization mutations or duplicating static registration.

Deployment, return/redeployment, presence re-entry, Revive, Temporary Absence return and Combat-Instance transfer do not by themselves create another owning battle-participant lifetime or rerun battle mutations. Rule availability continues to follow its declared lifetime/scope; registration/index maintenance is distinct from initialization Effect settlement. Expired registrations are retired by the owning lifetime; a new battle creates fresh completion records.

Order-independent typed initialization operations may compose. If mutation/lock ordering changes the result, require normalized explicit dependency/composition supported by Contract or reject executable content; Ability list, entity ID, Event order and iteration never supply it. This is bounded normalized initialization, not a startup callback registry.

---

## 35B. REQUIRED STABLE-HEALTH SETTLEMENT

04§7.14 → TRG-016 → existing health writers/Transaction, Lifecycle, Trigger/DAG/State/Cost and Action continuation owners. Ordinary Damage listeners omit Cost/Loss/Heal/MaxHP and may be held too late; the extension is one bounded mandatory health checkpoint, not a global Reaction priority.

Health writers record actual changed CurrentHP/CurrentMaxHP fields on the committed transaction/recipient, including ordinary recomputation/reconciliation from committed stat/State/position-dependent contributions. Compare authoritative phase views; do not create another writable MaxHP copy. Coalesce both fields within that commit; ignore unchanged/rolled-back writes and unrelated AE mutations. Retain the originating result/commit and semantic kind. Complete the whole simultaneous/mixed group, existing HP_ZERO, joined prevention/Return/Revive and reconciliation before publishing the stable read view; never expose projected survival/health, interpose inside an atomic lifecycle transaction or activate between sibling packet calculations.

Before the direct-group/Action/SSI continuation cursor proceeds, register/evaluate the opted-in finite mandatory settlement graph. It reads post-lifecycle health/presence and scoped owner State, then ordinary Cost/cap/State transactions. This may change the next Damage group's admission while ordinary Reactions remain held. Mark conditions/failure/success terminal by original commit/recipient/definition/owner/dependency before redelivery can create another candidate. Failed payment creates no retry token; only another actual health mutation qualifies. Nested committed health work is processed at its own stable boundary; reject cyclic/unbounded dependencies and observable shared-budget conflicts without an explicit law. No arbitrary middleware, continuous poll or Character check.

Save/resume retains dirty/stable observation refs, finite obligations, original candidate/terminal identity and continuation cursor. Owner life/presence/State-instance guards prevent retired work from mutating a new instance. Existing Damage/Heal/Cost meanings and ordinary Trigger timing remain intact.

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
- postActionSettlement?
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
    triggerOwnerRef
    candidateInstanceRef
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

The runtime graph comes from normalized declarative dependency data. Runtime dependency identity includes the root Action, authored dependency ID, trigger owner and instantiated candidate; two runtime owners using the same authored ID remain distinct. ADEC observers read the already-sealed own-direct projection under §25A, not a prematurely final whole ActionResult.

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

## 39B. REQUIRED POST-COMPLETION SETTLEMENT

Default NATURAL_ONLY keeps the existing completed-Natural path below. Under explicit ALLOW_COMPLETED_NON_NATURAL / ACT-033, reuse the same Trigger/DAG/Transaction records keyed by the actual completed observed non-Natural Action, runtime owner/candidate/dependency and Combat Instance. Register its finite work against this instance's existing next-Natural handoff gate before that start can pass; do not manufacture a parent Natural observation or block the source's already emitted completion. A still-running parent's unrelated direct work keeps its local profile; no global Reaction order follows. Terminal failure closes the obligation. Reject uncompleted/foreign-instance observations, cross-observation edges or waits for held handoff/future Action; replay uses the same terminal identity. No new queue/service or extra SSI opportunity.

Existing Trigger Engine / Scheduler / Transaction Manager interpret `postActionSettlement` under ACT-033. At completion dispatch, register the finite opportunity-local obligation before releasing SSI handoff; evaluate its conditions and ordered Effect DAG. Reuse existing candidate/dependency storage, with keys (Combat Instance, observed Natural Action, runtime trigger owner, instantiated candidate, local dependencyId). Distinct runtime owners never share one mutable obligation.

Pending evaluation → in-progress created settlement → terminal success/clean failure/cancellation under explicit policy. Conditions false close without effects. Atomic consume/create commits its settlement identity with State mutation, so replay cannot consume twice or produce a duplicate Effect graph. Before creating a candidate on redelivery, look up the stable original observation key (Combat Instance, observed Action, checkpoint, trigger definition, runtime owner, original committed Event identity) and reuse its stored candidate identity/outcome; allocating a new candidate ID must not bypass deduplication. Terminal no-qualification/clean-failure observations also retain their identity so later source re-entry cannot make an old Event newly eligible. Retain terminal identity through the replay horizon even if flags/receipt refs are gone. This state is finite work for the current opportunity, not gameplay state awaiting a future Action. Once created, the settlement's declared validity/source-lifetime policy governs source leave; do not silently rerun Trigger availability to cancel it.

The existing Scheduler refuses TURN_BOUNDARY/next Natural Action opportunity until these required obligations are terminal. It does not add edges between unrelated candidates or change ordinary Reaction eligibility. Reject cycles/cross-opportunity dependencies and waits on held boundaries; clean failures must terminate rather than hang the opportunity. Existing generic Snapshot/Result/Effect services execute settlement work; no Character branch, token manager or global priority is introduced.

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
→ declared selection / metric tie resolution
→ TargetSetRef
```

### Metric tie resolution

`targetPlan.tiePolicy` is executed here under `TGT-007`, with §§43/44 RNG and §§42 / `TGT-004` / `TGT-006` lock/invalidation behavior remaining separate.

For `RANDOM_AMONG_TIED`, freeze the final eligible Candidate Pool and read all metric values from the same authoritative selection checkpoint. Determine the best value and the exact tied-best subset before a draw. For `LOWEST_HP_PERCENT`, compare `CurrentHP / CurrentMaxHP` using authoritative arithmetic, never rounded UI percentages; positive-denominator ratios can be compared by exact cross-products to avoid false ties.

The current count-one profile selects the sole best candidate directly, or uses deterministic seeded `TARGET_SELECTION` RNG only over the tied-best subset when several candidates tie. An empty pool follows declared no-target handling without a draw. Stable technical enumeration for replay must preserve the same set-to-draw mapping across incidental collection permutations and give each tied candidate equal eligibility; entity/list/Slot order cannot supply a preferred winner.

For metric top-N, freeze unique candidates' metrics and positions at one selection checkpoint. Fill complete better metric groups first. A cutoff tied group uses only its declared policy: seeded random distinct selection for `RANDOM_AMONG_TIED`, or captured positions against authored PositionRefs for `EXPLICIT_SLOT_ORDER`. Slot priority never overrides unequal metrics and consumes no RNG. Fewer eligible candidates returns the eligible remainder; the selected set does not imply Effect execution order.

For explicit Slot ties, validate position coverage and uniqueness via the existing Mode Spatial Adapter. Reject unresolved/duplicate order positions, unmapped tied entities or multiple tied entities sharing a position without a declared law. Leader is resolved through its actual position. Do not read the SSI cursor as target priority. This local authored order does not modify the scheduler or global Reaction priority.

Store the selected Entity/Entity set in `TargetSetRef` at the declared target-context checkpoint. `LOCK_ENTITY_IDS` with later `DROP_INVALID` consumes that reference once: no metric re-query, tie reroll or replacement after intervening Effects. An invalid locked target follows its declared branch failure policy. A tie policy does not supply invalidation semantics or a global random-tie default; undeclared observable tie behavior remains `REQUIRED_EXPLICIT`.

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

## 42B. POSITIONAL DAMAGE CHECKPOINT / PRE-DAMAGE RELOCATION

04§11.11/26.1 → TGT-008/POS-008/009 → existing Target/Area/Lock, PositionState, indexed Trigger rules, RNG and Transaction owners. Current coordinate lookup already composes through P-013/014; the extension supplies the bounded pre-calculation relocation and explicit read checkpoint, not a new Slot resolver.

Keep the locked geometry/coordinate refs separately from resolved recipients. At the fixed-area boundary, the Trigger index finds only normalized positionalDamageInterposition rules with matching incoming Action/outcome/geometry and available owner State. Freeze candidate facts and the authoritative union of occupancy/reservation claims via existing owners. RNG POSITION_SELECTION uses a stable domain keyed by incoming batch/profile to select/assign the common legal set under POS-008. Candidate identities preserve seed mapping across enumeration permutations, never grant Slot/ID priority.

Stage assigned P-050 moves, success-only allowance/State changes, post-move source snapshots/hostile Actor refs and deferred-counter records in the existing Transaction Manager. Commit coherently; no assignment/abort leaves any success payload. Emit the existing one POSITION_MUTATION_COMMITTED result under §33A/TRG-007, preserving required prior Position Mark bookkeeping and ordinary listener eligibility. Old source Slots do not become frozen assignment destinations. No fixpoint re-evaluation of already processed movers.

Finish any required lifecycle/stable-health work caused by the committed movement/contribution reconciliation, then resolve current legal occupants of the retained coordinates and freeze the shared Damage phase version. No observer mutation interleaves sibling calculations/commit. Apply the profile's empty/invalid branch law, without chasing or reroll. Entity-lock profiles skip this occupant rebinding. Source snapshots are not recaptured. Unsupported matching/competing interpositions fail closed before affected Damage; no callback registry or Character branch.

Deferred counters remain existing Effect/Trigger/settlement records keyed by movement commit/rule/owner/State/observed root/profile, with frozen source/target/provenance and explicit source-validity policy. At observed-root ADEC, §37 seals that profile's eligible obligation set; existing §31/RES-008 commits its pure Counter Damage simultaneously with separate receipts and shared-recipient budgets. Root Heal/direct work already completed. Target-invalid obligations close locally; source cleanup cannot revoke an explicitly retained created obligation. Ordinary unrelated Reactions remain scheduled by existing Contracts. Retire payloads only at terminal status; serialize phase/assignment/transaction/obligation/result identities for resume without duplicate moves, charge consumption, counter creation or Damage.

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
→ component formula / pre-mitigation amount
→ §45A PRE_MITIGATION component-type transform
→ §45B explicit mitigation-stat selection, otherwise default from resulting type
→ selected-stat Penetration and mitigation
→ scoped FINAL_DAMAGE_REDUCTION phase for eligible non-True components
→ explicitly authored FINAL_DAMAGE_MULTIPLIER for selected components, including True
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

At FINAL_DAMAGE_MULTIPLIER, existing Damage Runtime calls §28A under DMG-008 with component/recipient, scoped Action/Effect provenance and available Action-local Cost/Snapshot bindings. Validate finite factors >= 1, then evaluate matching MULTIPLY factors once at this phase and apply one combined factor after mitigation/applicable reduction and before Shield. TRUE reaches this phase without entering reduction. Missing rules yield factor 1. Payment-gated factors use immutable successful Cost results/locked values, not payer HP re-query or child-root inheritance. No Character-specific bonus service, callback or new hit is created.

## 45A. SCOPED DAMAGE-COMPONENT TYPE TRANSFORM

At `PRE_MITIGATION`, Damage Runtime calls Contract Resolver with normalized `damageTransformPlan`, the resolving recipient/component and pre-mitigation amount, the authoritative phase-entry state (the shared transaction view for simultaneous groups under §31), and existing Action/provenance views (§15A). This executes `DMG-007`, separately from §28A amount modifiers.

```text
freeze incoming component type and phase-entry context
→ enumerate registered transform candidates for this phase
→ resolve declared source Action reference / lineage relation
→ test its Natural-Action status, Actor relation and structured Actor filters
→ test recipient scope, direct-Effect provenance, fromTypes and Conditions
→ collect applicable typed SET_COMPONENT_TYPE results
→ determine one compatible resulting type
→ dispatch that type's ordinary Damage pipeline
```

Actor filters read the Actor performing the scoped Action, including authoritative Effective Class; they do not substitute Damage Attribution, Caster, Owner or Effect Source. Direct-graph scope uses §15A membership, never shared `rootActionId` alone. Matching is recipient/component-local and read-only; it does not retarget or produce a new Action/packet.

All candidates are evaluated against the same incoming component/context, not the preceding transform's output. Compatible matching operations with the same resulting type are applied as one result. Incompatible overlapping transforms without an explicit composition Contract are rejected; unsupported content that escaped normalization fails visibly before affected Damage commits. No list/Effect/entity/Event order chooses a transform winner and no hidden transform chain is created.

Without a match, preserve the incoming type. A Physical/Will component transformed to `TRUE` keeps its pre-mitigation amount and enters §48 before any ARM/RES or Final Damage Reduction. Already-True components excluded by `fromTypes` remain True. Shield eligibility/piercing, attribution and Effect provenance remain independent; source Ability identity, authored Functional Tags and capability contributions are not rewritten.

Ordinary source Class/relation predicates invoke no Authority. Genuine Authority-bearing semantic conflicts use existing `AUT-*` adjudication. Trace records the scoped Action/Actor, Effect membership, matching transform refs, original/resulting component types, phase and state version without turning this evaluation into a gameplay Event.

---

## 45B. SCOPED MITIGATION-STAT OVERRIDE

After §45A, existing Damage Runtime invokes Contract Resolver with normalized damageMitigationPlan, resulting semantic component type and the same authoritative Action/Actor/recipient/provenance/phase view under DMG-009. TRUE bypasses selection and ARM/RES penetration entirely. For PHYSICAL/WILL, collect compatible bounded SET_MITIGATION_STAT candidates, resolve one legal ARM/RES selection or retain the default, then pass that stat's resolved contribution value and compatible declared Penetration inputs into the existing mitigation calculation.

Keep semantic type and source capability/provenance unchanged. One selected stat is used once; conflicting overrides or unsupported Penetration composition fail before affected Damage commit, not by iteration priority. Optional penetration on a matching rule is scoped packet input, not a target-stat write. Existing STATIC registration/retention ownership (§35A/TRG-014) and rule-origin refs apply; no new manager, middleware or Character name branch. Trace selection and phase version for replay; normal reduction/Final Multiplier/Shield stages continue unchanged.

## 45C. OPT-IN REFLECTED SCALAR DAMAGE

Existing Damage Runtime executes DMG-034 when normalized packetKind is REFLECTED_DAMAGE; ordinary component execution is unchanged. Resolve the retained sealed DamageAggregateRef through existing Result Store/P-043, enforcing exact received recipient/outcome/Effect membership and one immutable immediate Damage Source. Multiply its committed ActualHP basis by the pure coefficient. Do not reconstruct it from current HP/Shield or group by attribution.

For BYPASS_ARM_RES_THEN_FINAL_REDUCTION, skip ordinary component assembly, §45A/45B transforms, ARM/RES/Penetration and ordinary component amplification. Call §28A at FINAL_DAMAGE_REDUCTION with this scalar/packet kind, its own source/recipient/Effect context and authoritative group phase state. Then use existing Shield/HP/Overkill calculation and P-042 commit/lifecycle under the declared Resolution policy. Scalar reflection is neither TRUE nor an attack/Action request; its default Shield policy is ordinary eligible absorption, not inherited piercing.

Keep a new Effect/packet/receipt identity and causal incoming basis references. Existing Trigger/Condition provenance exposes packetKind and immutable Damage Source for DMG-030–033 recursion/qualification and source grouping; an Actionless reflected Effect remains outside the original Action's direct graph. Causal root linkage cannot add it to an explicitly declared Natural outcome. Source target revalidation uses its supplied lock/skip policy; no owner/Attribution fallback or source/list priority. Reflection batch policy remains authored data, not a global default. Bind source-group Effect/packet/RNG identity to observed outcome + activation/owner + normalized origin + immediate Source before technical iteration under DMG-034; identity lookup does not create gameplay source priority.

Existing Effect cursor/Transaction/Result lifetimes retain the basis and committed reflected receipt through dependent accumulator/terminal reads. Receipt credit is keyed by activation/Effect/result identity and is not discarded because live Buff lookup later fails. Re-delivery/replay returns the existing terminal result rather than creating another Damage or credit. Unsupported kind/profile/component/phase/basis data fails normalization (malformed IR fails closed), without partial HP/Shield/counter mutation. No Character branch or reflection manager.

## 45D. READ-ONLY FIXED-AREA DAMAGE PROJECTION

04§16.6 → DMG-035/RES-001/002/008/STA-014 → existing Damage/Shield calculation, scoped admission, Result and State/Transaction owners. P-040/P-041 already calculate without commit; the extension supplies named admission context, one recipient's isolated budget and a distinct projection result domain.

At the retained area's post-relocation/pre-Damage checkpoint, index active State projection queries by reserved Position/incoming outcome scope. Pin actual Damage definitions/source/threshold bindings and authoritative defence/Shield/HP phase version before real batch effects/lifecycle change them. In a read-only context, omit only the named State-owned recipient-admission clauses, apply all other ordinary pipeline rules and share hypothetical Shield/HP budget across packets under the original allocation profile. Existing source/target-dependent formulas need their declared bindings; absent data is an error, not a live fallback.

Never dispatch P-042, ordinary Damage/Event/result aggregation, damage listeners, HP_ZERO or real RNG advancement. Use retained draw facts or a supported pure keyed probe; fail closed on non-projectable inputs. Seal DamageProjectionResultRef with projectedActualHpDamage and query/batch/recipient/State/phase inputs, separately from DamageResultRef. Committed-result readers/P-043 reject this type.

After the real observed batch is terminal, the same still-valid State may add the estimate once through an ordinary State transaction; aborted batch/retired owner closes without credit. A valid local no-recipient terminal outcome caused by the exclusion does not discard a projection. Every later batch reads real current defence/Shield/HP anew; no persistent shadow store. Retain pinned inputs/results until credit terminal and dedup identities through replay. Save/resume cannot recalculate against a newer view or double-add an estimate. No new Primitive, Damage pipeline/type or projection manager.

---

# 46. PHYSICAL DAMAGE

For a component whose resulting type after §45A is Physical, the default path is below. An explicit §45B/DMG-009 override substitutes the selected stat and its Penetration/mitigation once, preserving Physical semantics and later stages:

```text
raw Physical
→ apply ARM Penetration
→ ARM mitigation
→ Final Damage Reduction
→ explicitly authored Final Damage Multiplier (DMG-008 / §28A)
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

For a component whose resulting type after §45A is Will, the default path is below. An explicit §45B/DMG-009 override substitutes the selected stat and its Penetration/mitigation once, preserving Will semantics and later stages:

```text
raw Will
→ apply RES Penetration
→ RES mitigation
→ Final Damage Reduction
→ explicitly authored Final Damage Multiplier (DMG-008 / §28A)
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

For a component whose resulting type after §45A is True:

```text
raw True
→ bypass ARM
→ bypass RES
→ bypass generic/final Damage Reduction
→ explicitly authored Final Damage Multiplier (DMG-008 / §28A)
→ Standard Shield unless Shield Piercing
→ HP
```

True Damage does not automatically gain Axiom authority.

True Damage does not enter the normal:

```text
FINAL_DAMAGE_REDUCTION
```

modifier phase.

Therefore the scoped modifier evaluator is not invoked for True components at FINAL_DAMAGE_REDUCTION. It may be invoked at the distinct explicitly authored FINAL_DAMAGE_MULTIPLIER phase; no reduction semantics are imported.

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
originAbilityId?
originEffectId?
sourceOwnerRef?
ownerRef
originalAmount
remainingAmount
durationState
retentionScope
authorityMetadata
specialFlags
```

UI may show one total Standard Shield bar.

Runtime preserves source provenance. The ledger origin IDs reuse the existing stable `originAbilityId` / `originEffectId` from Effect context; `sourceOwnerRef` resolves the authored runtime source owner independently from the recipient and authored Shield owner. These fields are required for matching a source-family cap; uncapped standalone/System grants need not fabricate an Ability origin. `retentionScope` is lowered from the Shield lifecycle metadata; field-scoped contributions identify the explicitly declared Shield owner/Combat-Instance presence cycle, independently from the recipient. Lower existing shield.owner into ownerRef and index that owner's contributions across recipients; source-owned grants use the source owner cycle. Committed field-leave cleanup removes only selected field-scoped entries with that owner/cycle and preserves source-leave/transition cause, not break/expiry. Surviving entries retain source identity across source leave; no-timed-expiry and lifecycle retention are orthogonal and explicit transition policy remains authoritative. It is independent of duration and Authority. §10C uses it without creating Character-specific Shield layers.

### Shield addition commit receipt

Existing Shield Runtime emits the typed `ShieldAdditionResultRef` under `SHP-005` at the same transaction commit as a supported `CREATE`/`ADD_VALUE` ledger mutation. It stores recipient, operation, affected contribution refs, requested and actual credited/created amount, outcome, state version and immutable Effect/transaction provenance, plus Action provenance when Action-owned.

For Action-owned execution, register the receipt in the owning Action result object; otherwise retain the standalone Effect/transaction result without fabricating an Action. Do not derive it from the later total or remaining Shield. Admission rejection and cap-discarded amount cannot become positive addition evidence. Duration-only refresh and unsupported manipulation kinds do not silently become additive receipts. The authored stacking/cap law stays authoritative; the receipt does not select it.

Later damage/expiry/removal changes ledger state and terminal causes, not the earlier receipt. Preserve pooled proportional depletion and transition-cleanup behavior unchanged.

---

### Source-family cap at Shield commit

For optional `sourceFamilyCap`, existing Shield Runtime / Transaction Manager execute `SHP-006`. Resolve the runtime source owner and stable authored origin Ability/Effect-definition family on this recipient. Read active remaining matching contributions and the declared cap ValueRef at `SHIELD_COMMIT`; include both in the protected transaction read set. Clip only the admitted new amount to nonnegative headroom. A positive amount atomically commits the addition and receipt; zero publishes a successful receipt with empty contribution refs, no new/old ledger mutation and no duration/expiry/refresh work. Zero is not automatic Action failure. An independently declared new contribution keeps its own provenance/duration; no merge/refresh is inferred.

Ledger provenance provides the query; no mutable family-pool subsystem is introduced. Source-owner identity separates identical Characters, while stable definition refs group their successive casts. Existing Effect-instance provenance remains available for each contribution. Old contributions are not clamped when a cap changes; depletion/expiry/removal only affects future reads. Competing additions need an explicit existing sequential allocation/dependency law, otherwise reject; stale reads must revalidate through existing transaction handling, never overcommit the cap. Preserve §52 proportional absorption unchanged.

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

Transition-owned removal under §10C uses the same ledger but follows `DEP-008`, not ordinary Cleanse/Authority admission. Terminal records preserve removal cause and owning transition; removing a contribution this way never impersonates §52 damage depletion or §54 natural expiry.

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

Every ordinary or reflected Damage receipt consumed by BY_DAMAGE_SOURCE retains the built packet's immutable immediate damageSourceRef and packetKind (ORDINARY by default); never reconstruct either from Attribution/Actor/live emitter state. For DMG-034 additionally retain exact causal sealed basis/Effect/State-activation refs beside the ordinary amount metrics. Existing Result Store/P-043 performs BY_DAMAGE_SOURCE grouping of the explicit projection; it cannot substitute Damage Attribution or Actor/root identity. A reflected result keeps its own Shield/ActualHP/Overkill breakdown and lineage. Hold results while existing dependent aggregate/terminal observers retain refs, including committed evidence from a subsequently removed State; index rebuild/replay does not credit it twice or recalculate it from live totals.

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

### Damage-derived coefficient fold

For 04§17.1 / HEL-005, existing Heal execution first resolves the terminal basis projection and the one observed-Action/recipient/local-settlement identity through §25A/completion dependencies. Reject unavailable/foreign/unsealed membership or independently competing producers; root equality alone is insufficient. Through §28A's existing candidate index, evaluate the bounded HEAL coefficient phase over one checkpoint view, using declared earlier Snapshot bindings where required. Deduplicate re-delivery of the same rule contribution; distinct genuinely active provider instances remain distinct under their authored lifetime/stack law.

Compute one canonical sum of the explicit base coefficient and all matching ADD coefficients, then requestedHeal = sum × sealedActualHPDamage once. Do not round a series of contributor Heals or derive priority from enumeration. C0 closes without emitting Heal; positive C/basis0 follows ordinary zero-Heal law. Continue unchanged PRE_OVERHEAL/admission/restoration/Overheal processing and record one Heal result plus basis/contributor/coefficient evidence. Replay resumes this existing execution/commit identity, not a second Heal; basis receipts stay retained until dependent settlement terminal. No separate Lifesteal pool/manager/Tag is created.

Register the finite settlement dependency before its completion barrier; its Damage basis readiness comes from the explicitly selected terminal Damage graph, not an ADEC/completion Event that a later dependent direct Effect is still blocking. A dependent MaxHP mutation waits for this Heal attempt's terminal outcome, including rejection/EffectiveHeal0, rather than positive Heal success. Existing local DAG edges express this order without ordering unrelated Reactions.

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

Explicit normalized `hpPaymentPolicy` is evaluated through §29A / CST-014; selected floor0 and permitted successful shortfall do not change that default for other Costs. The existing P-036 payment output supplies immutable post-payment HP before Cost-caused lifecycle; do not route through Damage/Heal Runtime. Under the declared continuation profile, §23 / CST-015 complete mandatory lifecycle before this admitted Action's direct Effects.

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
retentionScope
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

`retentionScope` is lowered from `StateSpec.lifecycle.retentionScope`, independently of classification, duration clock and Authority. `FIELD_PRESENCE_SCOPED` identifies its owning entity/Combat-Instance presence cycle; `BATTLE_SCOPED` identifies its owning battle participant. Transition profiles decide retention under §10C; they do not classify every battle-scoped object as immune to explicit classification discard. Termination retires that instance's modifier/clock/window work while preserving immutable terminal cause and transition references for observers/replay.

For a State/stat contribution selecting baseline EXCLUDE_THIS_SOURCE_FAMILY, derive its family from existing source-owner/origin Ability/origin Stat Effect refs and evaluate RES-007 through the existing P-030/stat contribution path. Read the ordinary contribution view with all matching family instances/stacks excluded, resolve other contributions under their declared law, then apply this family's bounded declared operation/stack once. Use the same authoritative State/count/version view; reject ambiguous provenance, feedback cycles or unsupported composition before producing a stat result. Constant multiplicative factors use an order-independent product under ordinary numeric law; no final-stat self read or BaseStat rewrite.

Snapshot Runtime consumes that already resolved stat; index reconstruction, save/resume or repeated reads cannot add another factor or reset the retained count. Existing State/modifier refs and lifetime/replay records suffice; no orb Entity, stat-family manager or universal modifier priority. Unauthored baselines retain their previous path.

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

### Resource-grant integration

Existing Resource Runtime/P-033 supplies validated positive-grant kind/origin/grantActionRef/recipient/pool with ordinary Effect provenance to this gateway under CST-016. Match current scoped rules and, for an explicitly captured Action rule, retained admission bindings on that exact Action's existing execution/Snapshot context. Bind the rule/scope once at performed Natural start before grant-bearing work, not on a probe/CC; no Character flag/branch or new storage service. Provenance, not issuer/root/coincident grant time, proves an attributed Action-generated grant.

The source window may close at completion/death/leave, while already captured Action scope remains available until its Action-linked Resource obligations and dedup horizon are terminal. Late own-Action grants still reject; a different Action's grant does not inherit the captured scope. Save/resume preserves rule/scope/Action refs and terminal grant receipts. Do not erase this evidence on window cleanup/re-registration; delivery beyond the retained horizon rejects rather than guessing an exemption. A newly armed window binds a future Action separately.

Commit admission plus Resource delta/result consistently, never add then subtract a forbidden gain. Rejection records zero committed grant/reason and provenance without changing the pool; admitted overflow/caps remain ordinary. Rage-only scope leaves AE and required Costs/drains untouched. Missing observable origin/Action/transfer/SET mapping or conflicting rules without applicable law fail closed. Existing State/Duration/Snapshot/Action owners suffice; no extra Resource gate service.

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

This is the ordinary HP_ZERO path. §84's explicit DIRECT_EXECUTE confirmation does not dispatch this ordinary prevention window merely because its atomic post-state has HP0.

---

# 83. DEATH PREVENTION

Death Prevention candidates resolve before DEATH_CONFIRMED.

If prevention succeeds:
- entity remains/returns alive;
- current loss/damage event does not repeat;
- no confirmed death observers.

### Explicit transition-completed candidate

For normalized deathPrevention completionTransitionRef, existing Lifecycle Runtime holds the matching death-evaluation context and coordinates P-061 with §10C Return Runtime, State Runtime and Transaction Manager under DTH-007. Key the work by death-evaluation identity + runtime prevention owner/Ability candidate + joined transaction; no Character switch or separate manager.

Resolve/protect `survivalHp`, the available `consumeCounterRef` and authoritative Return inputs/retention decisions. Validate the same-subject/current-instance Return against the proposed alive/survival state. Stage the life/HP outcome, Return deltas/results and selected counter decrement; the referenced operand executes once inside this join, not again as an ordinary independent Effect node. Reject unsupported references, cycles or an allowance discarded by the same retention decisions.

Only common commit success records prevention success and releases coherent post-state observations. Transition/counter/validation failure discards all completion proposals, preserves the latest authoritative HP/use/presence/deployment/cleanup, stores a terminal failed candidate and resumes/revalidates the original evaluation. An unchanged lethal subject remains HP0/use unused; never restore frozen input values over another committed mutation. Do not emit DEATH_PREVENTED, synthesize confirmed death, retry the same candidate at unchanged HP0 or repeat the causing Damage/HP Cost. Earlier committed Leader Heal remains separate. Other candidates/ordinary death follow existing laws, without a newly invented same-window priority.

Existing lifecycle/transaction records retain candidate refs, captured survival/retention/counter inputs, transaction status and terminal outcome through pending observers/replay. Save/resume before commit exposes no staged survival; after success/failure reuses the outcome without repeating use/cleanup/Events. Already-admitted Skill continuation and immutable payment HP stay governed by CST-015/009; the survival assignment cannot rewrite that earlier HP0 receipt.

Publish/store the existing P-061 terminal outcome with this completion's candidate/transaction identity through the existing typed Result/DAG bindings. Only that success releases its authored success-dependent nodes; live Deck/HP state or a different return is insufficient. Retain the outcome and downstream cursor until their work is terminal and preserve terminal identity for the replay horizon, so later Cost mutation cannot be replayed twice.

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

### Explicit DIRECT_EXECUTE request

For normalized lifecycle confirmationPolicy DIRECT_EXECUTE, existing Lifecycle Runtime resolves the authored locked subject/current-instance and upstream dependency/result context under DTH-008. Reuse existing Effect admission and Authority Resolver for actual anti-death conflicts; no Character branch, rank-derived priority or implied Authority exception. Failed/invalid requests close locally without an Execute HP/confirmation delta.

P-060 opens its existing explicit-lethal-condition context carrying this policy, with target HP/lifecycle proposals private rather than an early authoritative HP_ZERO/death-evaluating mutation. Under one protected Transaction Manager barrier, stage HP0 and P-062's confirmed-dead outcome/attribution/ordinary confirmation deltas. Commit together and then publish canonical confirmation to existing mandatory observers. Do not route through §82/83's ordinary HP_ZERO/prevention dispatch or release an intermediate HP0/alive observation. This exception is selected only by explicit normalized policy; other lethal Damage/Cost/loss remains on the ordinary path.

Retain the existing request/candidate, subject/current-instance, policy, lethal cause, death-evaluation/commit identity and terminal outcome through observer/replay work. Revalidate protected subject state at commit; a stale/already-confirmed recipient or replay cannot create a second death or undo another authoritative commit. Existing post-confirmation recovery runs under its own Contracts; it cannot rewrite the prior confirmation, payment/use or immutable Damage receipts. No DamageResult is created from Execute HP assignment and no automatic retarget/refund is introduced.

Before opening P-060 work, check existing terminal identity keyed by the original stable Effect execution/candidate and subject/current-instance. Do not allocate a new candidate/context to bypass it. Preserve that terminal record through the supported replay horizon even after confirmation payloads/observers are released or the target Revives with the same lifeSerial. Too-old delivery is rejected under §168; it is not a fresh lethal request.

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

### Opt-in MaxHP reset inside Revive

Before a Revive HP formula reads CurrentMaxHP, existing Lifecycle/MaxHP/Transaction owners handle REV-007-marked mutation records on the recipient: validate admitted post-death Revive → freeze matching record refs/read set → stage removals/recompute projected MaxHP and expiry reconciliation → evaluate HP against the projected view → validate final restore/materialization → atomically commit removal/MaxHP/HP with ordinary Revive deltas. Failed/stale Revive preserves the exact old penalties/MaxHP and does not publish a reset. Immutable Snapshot-MaxHP formulas keep their own inputs; incompatible restoration needs explicit law.

Keep staged contribution refs/projected view/restore plan/commit identity on the existing Revive transaction. Resume cannot remove contributions, assign HP or materialize twice. Duration/Field-leave removal still uses its own owner/cause; a post-Revive cleanup Trigger is too late for this profile. Unmarked records, ordinary Revive lifeSerial, death waiting/cohort/race/position and special restoration behavior remain unchanged. No generic lifecycle callback or automatic reset of all temporary States.

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
Current Deployment Cost/lock and static deployment-init completion → deployment runtime / DeckState
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
- history snapshot refs if needed;
- battle deployment Current/floor/lock and static initialization completion records;
- declared static rule ownership/lifetimes (or inputs to rebuild indexes without resettling initialization);
- State/Shield retention metadata, terminal causes/transition refs and surviving scheduled work;
- sealed checkpoint result views/immutable Shield addition receipts still referenced by pending observers or dependent work, and stable source-family provenance on surviving contributions;
- processed observation / consume-create / terminal settlement identities keyed by observed Action + checkpoint + runtime trigger owner + instantiated candidate/dependency, even after receipts are freed and flags consumed, for the supported replay horizon;
- ACT-033 required post-action obligation state and its held scheduler handoff, so recovery finishes the same finite settlement before advancing to the next Natural Action.
- singular HP-policy input/case identity and protected counter updates, immutable post-payment HP receipts, pending Cost-caused lifecycle work and the admitted Action continuation cursor; restore must not debit, consume, process HP_ZERO or replay completed direct Effects twice.
- transition-completed prevention death-evaluation/candidate/joined-transaction refs, protected survival/Return-retention/allowance inputs and terminal completion identity; restore must never expose or retain staged HP1 after failure, or replay prevention/Return/use/cleanup twice.
- direct-confirmation lifecycle request policy/subject/cause/attribution, death-evaluation/commit and terminal-request identity through pending observers; restore cannot open an ordinary prevention window, confirm twice or replay committed upstream payment/use.
- pre-Cost source SnapshotRefs/capture identity, local CostGroup continuation/success-use/lifecycle cursor, and pending shared-recipient allocation membership/phase version/proposed budgets/commit identity; restore completes the same transaction without recapture, duplicate spend or packet-priority allocation.

E.9/F.11 saves additionally retain locked geometry/pre-Damage phase and common assignment view, coherent move/allowance/Snapshot/deferred-counter identity, counter batch membership/terminal results, distinct projection pinned inputs/credit records, stable-health observations/continuation cursors and ACT-034 grant-start obligations. Restore finishes the same finite phase/transaction without reselecting, spending, counting, countering or returning twice. No new writable HP/Shield/Position copy is created.

Reuse existing Trigger candidate / Transaction Manager idempotence records, not a new manager. Observation identity includes the trigger definition and original committed Event identity; stored candidate/dependency IDs remain stable on redelivery. Check terminal observation identity before allocating another candidate, including previously nonqualifying observations. Rebuilding indexes does not reset processed identities. Release receipt payloads once their consumers finish, independently from deduplication identity retention. After a terminal record's replay horizon is retired, reject delivery from before the retained horizon rather than accept it as a fresh observation. Restore cannot recreate notes, additions, consumed sets or already-terminal settlements.

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
committed Current Deployment Cost mutations respect the declared floor
locked deployment Current == lockedValue
RETURN_TO_DECK commit has coherent presence/occupancy/deployment and retained Deck membership
terminated duration/recovery windows own no pending natural-expiry/recovery settlement
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
66. Static rule registration creates no fake Action; battle initialization mutations settle exactly once per owning participant lifetime.
67. Current Deployment Cost/floor/lock live in deployment-owned battle state and typed reads/snapshots never alias the Side Cost Bar.
68. Pre-mitigation component transforms use scoped Action Actor and direct-Effect provenance, then dispatch the resulting Damage type without rewriting source Tags.
69. Return-to-Deck commits presence, deployment state and transition-selected State/Shield cleanup atomically while retaining Deck membership and the admitted Action context.
70. Transition cleanup preserves its terminal cause and cannot trigger break/expiry-only settlements.
71. `RANDOM_AMONG_TIED` uses the exact tied-best set and deterministic RNG before target lock; later invalidation follows explicit policy without implicit requery/reroll.
72. Pilot #4 reuses existing owners and requires no Character-specific runtime type, Functional Tag, Primitive or generic priority system.
73. Checkpoint result predicates read sealed own-direct projections or finalized Action results with immutable committed metrics, never live HP/Shield reconstruction.
74. Shield creation/addition receipts preserve operation-local credited amounts after authored admission/stacking/caps without choosing Character reapplication gameplay.
75. Checkpoint observers reuse State/Effect DAG composition with per-owner dependency identity; completion-only work cannot block its own completion.
76. Source-family addition caps use protected commit-time ledger reads, clip new amounts only and preserve independent provenance/duration and proportional pooling.
77. Explicit Slot ties rank metric equality only; top-N, position coverage, target lock and invalidation remain separate.
78. ACT-033 obligations hold only required post-completion handoff and cannot cycle back into source completion; ordinary unmarked work stays nonblocking.
79. Processed observation/consume-create/terminal identities survive receipt cleanup through the supported replay horizon; old retired-horizon input is rejected.
80. Cap-to-zero emits an immutable success receipt with no ledger entry/mutation or duration/expiry work.
81. FINAL_DAMAGE_MULTIPLIER visits explicitly scoped TRUE as well as Physical/Will, uses finite factors >= 1 and existing own-direct Action/Cost bindings, and does not weaken reduction bypass.

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
