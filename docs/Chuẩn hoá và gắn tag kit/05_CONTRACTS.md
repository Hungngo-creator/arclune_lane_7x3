# ARCLUNE — CONTRACT REGISTRY
## Chặng F — Deterministic Resolution Contracts
**Version:** 2026-09-10-F.1  
**Status:** Working Canonical Candidate  
**Depends on:** `01_TERMINOLOGY_vNext.md`, `02_TAG_vNext.md`, `03_PRIMITIVE.md`, `04_ABILITY_SCHEMA.md`, `00_CANONICAL_RECOVERY_AUDIT.md`  
**Primary source corpus:** project rules already established in conversation + standardized character files for Hoá Thân Ký Ức Chi Chủ, Luân Hồi Chi Chủ, Cố Sự Chi Thần, SSR Warrior True Damage/Overheal, and current Pygmalion rules.  
**Revision F.1:** incorporates approved Shield pooling, Authority Adjudication, Death Cohorts, Revive/Reincarnation race, global lifeSerial default, and Pygmalion rulings.
**Purpose:** turn semantic declarations into deterministic resolution rules without turning Character data into code.

---

# 0. IMPORTANT STATUS MODEL

This file does **not** pretend every unresolved project decision has already been answered.

Every Contract uses one of these statuses:

## `LOCKED`
Directly supported by current user/project rules or by a source explicitly marked as an invariant/decision and not superseded.

## `LOCKED_DEFAULT`
A project default already established, but explicit Character/Ability/Mode Contract may override it.

## `REQUIRED_EXPLICIT`
There is intentionally **no global default**. Authoring/Normalization must supply a policy whenever the distinction matters.

This is still deterministic:
> missing policy = validation blocker, not silent guessing.

## `WORKING_PROPOSAL`
A proposed engine default needed for architectural evaluation but not yet user-confirmed.

It must not silently override later user decisions.

## `UNRESOLVED`
The source corpus does not support a safe decision yet.

Implementation relying on it is not considered fully canonical.

---

# 1. CONTRACT PHILOSOPHY

A Contract answers:

> **“Given already-defined semantics, exactly when and in what order does the Kernel resolve them?”**

Contracts do not create new lore or new Character mechanics.

They define:

- admission;
- ordering;
- snapshots;
- targeting;
- commit;
- event visibility;
- trigger scheduling;
- cost transaction;
- damage;
- heal;
- status;
- death;
- revive;
- reincarnation;
- authority;
- identity;
- attribution;
- isolated Combat Instance;
- Narrative subsystem;
- mode clocks.

The architecture remains:

```text
Character Authoring Data
→ Normalized Ability IR
→ Primitive Requests
→ Contracts
→ Kernel Runtime
→ Authoritative State
```

---

# 2. CONTRACT PRECEDENCE

When multiple rules apply, use this precedence unless a higher-level Axiom Contract states otherwise:

1. newest explicit user correction;
2. explicit Character/Ability Contract;
3. explicit Mode Profile Contract;
4. specific system Contract;
5. canonical global Contract;
6. canonical default;
7. no assumption.

A missing rule at level 1–6 is **not permission to invent behavior**.

---

# 3. CROSS-FILE PATCH NOTICE — TURN BOUNDARY

## Status: `LOCKED — LATEST USER CORRECTION`

The newest user clarification defines:

> **Natural Action** = the turn in which a character uses Basic Attack, Skill, or Ultimate in the turn-based mode.

and:

> **Turn Boundary** = the boundary/interval between two consecutive Natural Actions under SSI.

Canonical sequence:

```text
Natural Action
→ Turn Boundary
→ Natural Action
→ Turn Boundary
→ ...
```

Therefore the older wording that treated `TURN_BOUNDARY` as exclusively:

> “the boundary between two turns of the same actor”

is superseded.

### Required terminology split

From this Contract onward:

## `TURN_BOUNDARY`
Global SSI boundary between consecutive Natural Actions.

## `ACTOR_NATURAL_ACTION_WINDOW`
A per-actor window used for:
- once per own Natural Action cycle;
- until own next Natural Action;
- reset when actor receives/consumes next Natural Action opportunity;
- “2 Natural Actions of target”.

This is **not** renamed Turn Boundary.

## `SLOT_CLOCK`
Independent clock attached to a battlefield slot and advanced by the exact rule declared by a mechanic.

### Upstream files requiring later patch
The following generated files still contain older actor-specific Turn Boundary wording and should be patched before architecture freeze:

- `01_TERMINOLOGY_vNext.md`
- `04_ABILITY_SCHEMA.md`

Do not silently read those older sentences over this Contract.

---

# 4. CONTRACT CATEGORIES

This registry defines:

- `ACT-*` Action / SSI
- `CLK-*` Clock / Duration
- `TRG-*` Trigger / Reaction
- `TGT-*` Target / Area
- `RNG-*` Deterministic randomness
- `SNP-*` Snapshot
- `RES-*` Resolution / commit
- `CST-*` Cost / resources
- `DMG-*` Damage
- `HEL-*` Heal / Overheal
- `SHP-*` Shield
- `STA-*` State / modifier
- `POS-*` Position / presence
- `DTH-*` Death
- `REV-*` Revive
- `REC-*` Reincarnation
- `IDN-*` Identity / definition
- `ATR-*` Attribution
- `AUT-*` Authority
- `ENT-*` Entity / summon / lifecycle
- `INS-*` Combat Instance / Arena
- `CAP-*` Capability query
- `HIS-*` History / regression
- `NAR-*` Narrative
- `MOD-*` Mode Profile
- `HIT-*` Hit Admission
- `DEP-*` Deck Deployment

---

# 5. ACTION LIFECYCLE

## ACT-001 — Canonical Action Phases
**Status:** `LOCKED CORE + some phase boundaries REQUIRED_EXPLICIT`

A resolved Action conceptually passes through:

```text
1. ACTION_REQUESTED
2. ACTION_ADMISSION
3. COST_VALIDATION
4. ACTION_BEGIN
5. SNAPSHOT / TARGET PREPARATION
6. EFFECT RESOLUTION
7. STATE COMMIT(S)
8. DAMAGE / HEAL / STATE RESULT FINALIZATION
9. DEATH EVALUATION as required
10. ACTION_DIRECT_EFFECTS_COMPLETE
11. ACTION_COMPLETED
12. POST_ACTION / queued child-reaction scheduling
13. SSI advancement if Natural Action
14. TURN_BOUNDARY
15. next Natural Action
```

This is a semantic pipeline, not necessarily one C# call stack.

### Locked invariants
- Presentation animation does not define these phases.
- A child Action may have its own lifecycle.
- Damage Action completion can occur before parent composite Action completion.
- HP_ZERO processing cannot be skipped merely because parent Action has remaining visual animation.

### Required explicit / later Kernel detail
Exact ordering between:
- queued Reactions;
- child Action scheduling;
- `ACTION_COMPLETED`;
- SSI advancement;
depends on `TRG-*`, `ACT-004`, and `ACT-005`.

---

## ACT-002 — Action Admission
**Status:** `LOCKED_DEFAULT`

An Action may begin only if:

- Actor exists in an eligible lifecycle/presence state;
- Ability is enabled for the Mode Profile;
- action identity is legal under current restriction;
- mandatory prerequisite conditions pass;
- target requirements that must be checked pre-cost pass;
- Cost validation passes when the Action pays Cost at admission.

Failure before commit:
> no Action effect is partially applied.

A Character-specific rule may intentionally pay a cost before later failure, but that must be explicit.

## ACT-003 — Natural Action Form Restriction and Ordered Fallback
**Status:** `LOCKED`

A Character/System rule may constrain the Action form used by an SSI-granted Natural Action.

This Contract applies only after SSI has already granted the Actor a Natural Action opportunity.

A Natural-Action form restriction:

- does not create another Natural Action;
- does not convert the resulting Action into `FORCED_ACTION`;
- does not itself choose or override the final target;
- is not an AI preference/heuristic;
- may restrict or order allowed `BASIC_ATTACK`, `SKILL`, `ULTIMATE` candidates according to authored data.

Conceptual flow:
SSI grants Natural Action
→ read applicable form restriction/policy
→ probe authored candidate 1
→ if invalid/unpayable, probe candidate 2
→ ...
→ select first legal candidate
→ selected candidate enters ordinary Action Admission / Cost / Target / Resolution pipeline

Candidate probing is read-only
A fallback candidate probe may inspect:
current Action restriction;
Ability availability;
Mode legality;
required prerequisite state;
cooldown;
Rage readiness;
AE/resource affordability;
whether mandatory target prerequisites currently have any valid candidate.
A candidate probe must not:
pay or reserve Cost;
consume/reset Rage;
begin cooldown;
mutate Character/System State;
emit gameplay Events;
create/request the candidate Action;
consume RNG;
lock a random target set;
partially resolve any Effect.
Only the candidate ultimately selected may enter normal Action execution and commit resources/state.
Therefore:
probe ULTIMATE
→ unavailable

probe SKILL
→ payable

select SKILL
→ only now normal Skill Cost/Action pipeline begins
must not become:
try ULTIMATE
→ consume something
→ fail
→ try SKILL
Natural Action identity
The selected candidate remains the Actor's originally granted Natural Action.
Example:
SSI grants Echo Natural Action
→ kit law selects SKILL
→ resulting Skill is still Echo's Natural Action
It is not a Forced Action merely because Character data restricted the choice.
Targeting remains separate
Selecting an Action form does not automatically fix the final target.
After form selection, the selected Ability uses its ordinary:
Target Candidate Pool
→ Target Selection
→ Area Resolution
unless another explicit rule separately overrides targeting.
Fallback must be authored
There is no hidden global rule:
if preferred Action cannot be used
→ always Basic Attack
Fallback order must exist in normalized Character/System data.
If every authored candidate fails:
use the declared noCandidatePolicy.
The Kernel must not invent an undeclared fallback.
Example
A legal policy may express:
remembered ULTIMATE
→ probe Ultimate
→ otherwise probe remembered child SKILL
→ otherwise probe Basic Attack
This ordering is Character/System law.
It is not global AI behavior.

---

# 6. SSI NATURAL ACTION CONTRACT

## ACT-010 — SSI Alternation
**Status:** `LOCKED`

Each Side owns an independent Natural Pointer through its slot sequence.

Turn-based flow:

```text
resolve next eligible slot for current Side
→ that Actor consumes/performs one Natural Action opportunity
→ Action completes according to contract
→ advance current Side's pointer
→ Turn Boundary
→ swap control to opposing Side
→ opposing Side resolves next eligible slot
```

SSI is **not**:
> all Side A actors, then all Side B actors.

---

## ACT-011 — Empty / Ineligible Slot Skip
**Status:** `LOCKED`

When resolving a Side's next Natural Action candidate:

- empty slot is skipped;
- actor already dead/ineligible before its turn is skipped;
- skip occurs inside that Side's pointer search;
- control does not swap merely because an empty slot was skipped.

Control swaps only after a Natural Action opportunity is consumed/resolved.

---

## ACT-012 — CC Lost Natural Action
**Status:** `LOCKED`

If an Actor reaches its Natural Action opportunity but CC prevents it from acting:

- the Natural Action opportunity is still consumed;
- eligible “per Natural Action” durations/counters advance;
- SSI pointer advances;
- Turn Boundary occurs;
- control swaps Side.

The actor did not execute a Basic Attack/Skill/Ultimate Action, but its scheduled Natural Action opportunity was consumed.

This distinction must be traceable.

---

## ACT-013 — Move Into Passed Slot
**Status:** `LOCKED`

Moving an Actor into a slot whose Side pointer has already passed does not grant a second Natural Action in that same Side pass.

---

## ACT-014 — Summon Created Into Slot
**Status:** `LOCKED_DEFAULT`

For turn-based Summons/Combat Units participating in SSI:

- if created into a slot the Side pointer has not yet passed in current Side pass, it may receive a Natural Action when pointer reaches it;
- if created into a passed slot, it waits until the next pass.

This depends on the entity being eligible for Natural Actions.

---

## ACT-015 — Non-Natural Actions
**Status:** `LOCKED_DEFAULT`

By default the following do not advance Natural Pointer and do not consume a Natural Action:

- Follow-up;
- Counter;
- Forced Action;
- Reaction Action;
- Linked Cast;
- interrupting Ultimate/action.

They may still have their own Action lifecycle and events.

Any exception must explicitly set `naturalActionPolicy`.

---

# 7. TURN BOUNDARY & ACTOR WINDOW CONTRACTS

## CLK-001 — Turn Boundary
**Status:** `LOCKED`

`TURN_BOUNDARY` occurs after one Natural Action opportunity has been fully resolved/consumed under SSI and before the next Natural Action begins.

Canonical conceptual sequence:

```text
NATURAL_ACTION_N
→ completion/required post-action phase
→ TURN_BOUNDARY_N
→ NATURAL_ACTION_N+1
```

Turn Boundary is not:
- Round;
- an Action;
- a Side taking all turns;
- inherently tied to the same Actor as previous/next action.

---

## CLK-002 — Actor Natural Action Window
**Status:** `LOCKED CONCEPT / exact reset event LOCKED_DEFAULT`

Per-actor mechanics such as:

- “once per own turn”;
- “max 3 times until own next turn”;
- “lasts for target's next 2 Natural Actions”;

use `ACTOR_NATURAL_ACTION_WINDOW` / `NATURAL_ACTION_OF_ACTOR`, not global Turn Boundary.

### Default reset semantics
A “once per own Natural Action window” cap resets when that Actor reaches the beginning of its next Natural Action opportunity.

If that opportunity is consumed by CC:
- the window still advances.

If Actor is dead and no longer receives Natural Action opportunities:
- its actor-window does not advance merely because global Turn Boundaries occur.

### Note
This replaces the older practice of calling these personal clocks “Turn Boundary”.

---

## CLK-003 — Duration by Natural Action of Target
**Status:** `LOCKED`

A duration defined as:

> “2 Natural Actions of target”

counts the next two Natural Action opportunities consumed by that target.

CC-lost opportunities count unless the specific effect says otherwise.

Non-natural Actions do not decrement it.

---

## CLK-004 — Cooldown by Natural Action of Caster
**Status:** `LOCKED`

A Cooldown such as:

> `CD 2 Natural Actions of caster`

decrements only when the caster consumes qualifying Natural Action opportunities.

Auto Skills, Reactions, Follow-ups, Counters and other non-natural Actions do not reduce it unless explicitly declared.

This directly supports Ký Ức Skill 1/3 behavior.

---

## CLK-005 — Slot Clock
**Status:** `LOCKED CONCEPT / REQUIRED_EXPLICIT API`

A Slot Clock belongs to a Position/slot, not to whichever Actor occupies it.

Legacy Ký Ức revive timing requires:

> a countdown associated with the slot where the actor died, unaffected by whether another unit occupies the slot.

Exact event that advances Slot Clock must be supplied by its Contract profile.

Do not infer Slot Clock from:
- occupant Natural Actions;
- current slot occupancy.

---

# 8. CHILD / COMPOSITE ACTION CONTRACT

## ACT-020 — Parent and Child Identity
**Status:** `LOCKED`

A child Action is a real Action Instance with its own:

- Action Identity;
- behavior;
- targets;
- effects;
- results;
- source/attribution context;
- possible Authority.

Parent identity does not automatically replace child identity.

---

## ACT-021 — Child Cost Policy
**Status:** `LOCKED SCHEMA CAPABILITY`

A Composite Action must specify or inherit a policy:

- `NORMAL_CHILD_COST`
- `WAIVE_CHILD_COST`
- `EXPLICIT_PER_CHILD`
- another future canonical policy.

Waiving child cost in an Ultimate does not rewrite the child Ability definition.

---

## ACT-022 — Child Authority Policy
**Status:** `LOCKED — MUST SUPPORT BOTH`

At least these policies are required:

### `PRESERVE_CHILD`
Child uses its own Authority.

Required by current Luân Hồi Chi Chủ composite design.

### `INHERIT_OUTER`
Child resolves Authority conflicts using outer Action's Authority.

Required by current SSR Warrior Ultimate design.

No universal “Ultimate authority always wins” rule exists.

---

## ACT-023 — Child Snapshot Policy
**Status:** `REQUIRED_EXPLICIT WHEN DIFFERENCE MATTERS`

A child may:
- capture own snapshot;
- reuse parent snapshot;
- inherit selected snapshot fields.

If state can change between children and the result depends on it:
> policy must be explicit.

---

## ACT-024 — Child Event Visibility
**Status:** `LOCKED_DEFAULT`

Child Actions emit their own semantic Action/Damage/State events unless a specific Composite Contract suppresses/aggregates them.

Reason:
- triggers can care about actual child Action identity;
- damage aggregation can distinguish child vs root Action.

However:
> parent may define an additional aggregate completion event.

Exact event order is specified in `TRG-004`.

---

# 9. ACTION COMPLETION

## ACT-030 — Direct Effects Complete
**Status:** `LOCKED CONCEPT`

`ACTION_DIRECT_EFFECTS_COMPLETE` means all directly declared effects/child steps that belong to the Action's direct execution plan have reached their declared commit point.

This is not necessarily the same as:
- every Reaction caused by the Action has finished;
- every future delayed effect has finished.

---

## ACT-031 — Action Completed
**Status:** `WORKING PROPOSAL`

For deterministic triggering, working model:

An Action becomes `ACTION_COMPLETED` only after:

1. its direct effect groups commit;
2. required immediate HP_ZERO/death evaluations caused by those commits complete;
3. child Actions designated as **blocking children** complete;
4. all declared **root-linked blocking settlements** for this Action reach a terminal settlement state under `ACT-032`;
5. Action-level result aggregation required for final completion is finalized.

Queued ordinary **non-blocking reactions** are not promoted into blocking settlements merely because they were caused by this Action.


### Why this proposal
Ký Ức Skill 2 explicitly waits until an allied **Damage Action completely ends**, and a target already DEATH_CONFIRMED before its echo resolves is invalid.

This model allows:
- death result to be known;
- Action aggregate to be stable;
before the reaction is evaluated.

### Not yet fully user-locked
Whether every possible Reaction waits until Action completion is not asserted.
Effects may subscribe to earlier events such as `DAMAGE_COMMITTED`.

## ACT-032 — Root-Linked Blocking Settlement / Completion Dependency
**Status:** `LOCKED`

A Triggered/Passive settlement may explicitly declare itself a blocking completion dependency of an existing root Action.

This exists for mechanics where the root Action's gameplay outcome is not semantically complete until a bounded set of linked settlements has resolved.

Conceptual form:
root Action direct/linked outcome
→ declared blocking settlement A
→ declared blocking settlement B
→ root ACTION_COMPLETED

Root linkage
Every blocking settlement must identify the exact root Action lineage to which it belongs.
Temporal coincidence is insufficient.
A settlement occurring while an Action happens to be running does not become part of that Action merely because their wall-clock windows overlap.
Local dependency graph
Blocking settlements belonging to the same root Action may declare local dependencies.
Example:
REPEAT_SETTLEMENT
→ DEATH_OUTCOME_STABLE
→ SKILL_3_SETTLEMENT
→ SKILL_1_SETTLEMENT
→ root ACTION_COMPLETED
Such dependency edges define ordering only inside that root Action's declared completion graph.
They do not define global Trigger/Reaction priority.
In particular:
Skill 3 before Skill 1 for one Character
does not imply:
all Skill-3-like Triggers globally outrank all Skill-1-like Triggers
and does not resolve TRG-005.
Terminal settlement states
A blocking dependency is considered settled when it reaches a terminal result such as:
resolved successfully;
conditions no longer qualify;
target becomes invalid under its declared policy;
Cost validation fails and the activation cleanly fails;
it is explicitly cancelled by a valid Contract.
A failed Cost does not leave the root Action permanently blocked.
Example:
settlement qualifies
→ requires 30 AE
→ insufficient AE
→ settlement = FAILED_COST
→ dependency closes
→ root Action may continue toward completion
subject to the Trigger's declared failed-Cost counter/cap policy.
Cost and mutation
Registering a completion dependency does not itself pay Cost or apply Effects.
The settlement still follows:
TRG-003 for triggered Cost;
CST-* for Cost semantics;
its ordinary Effect/Primitive Contracts.
Bounded dependency rule
Completion dependencies must form a finite acyclic graph.
Normalizer/Validator must reject:
cycles;
dependency chains that can recursively recreate themselves without a declared bound;
a dependency whose required qualifying Event can occur only after the same root Action has already emitted ACTION_COMPLETED;
a dependency referencing an unrelated root Action without an explicit cross-root Contract.
Non-blocking Reactions remain non-blocking
An ordinary Reaction is not automatically upgraded into a blocking settlement.
Only explicit normalized completion-dependency data may delay root ACTION_COMPLETED.
This Contract therefore adds a local Action-completion mechanism without changing the unresolved global same-window Reaction priority.

---

# 10. TRIGGER / REACTION EVENT LEVELS

## TRG-001 — Event Granularity
**Status:** `LOCKED CONCEPT`

TriggerSpec must subscribe to a precise event level.

At minimum architecture must distinguish:

- Action requested;
- Action began;
- hit/damage packet resolved;
- damage committed;
- Damage Action completed;
- Heal committed;
- State applied/removed;
- HP_ZERO;
- DEATH_CONFIRMED;
- Natural Action opportunity consumed;
- Action completed;
- Turn Boundary;
- entity materialized;
- Airborne entered.

“when damaged” is insufficient as normalized Contract data.

---

## TRG-002 — Trigger Evaluation Snapshot
**Status:** `LOCKED_DEFAULT`

A Trigger evaluates using authoritative state at its event's committed point unless it explicitly references an earlier SnapshotRef or result object.

It must not read presentation state.

---

## TRG-003 — Trigger Cost
**Status:** `LOCKED`

An auto/reaction Trigger that requires Cost:

1. event qualifies;
2. conditions/target eligibility are evaluated as specified;
3. Cost is validated;
4. if payable, Cost commits according to Cost Contract;
5. effect/action is scheduled/resolved.

A trigger does not get to create partial effects before failed Cost validation unless explicitly defined.

---

## TRG-004 — Reaction Queue
**Status:** `WORKING PROPOSAL`

Working deterministic model:

Events append Trigger Candidates to an ordered queue.

Queue items store:
- originating event sequence;
- trigger owner;
- trigger definition;
- root Action lineage;
- event subject/source;
- Authority context.

Default processing:
- current atomic commit/death evaluation finishes;
- then eligible queued reaction Actions resolve in deterministic priority order;
- each Reaction may generate further events/queue items.

This avoids mid-transaction state tearing.

### Priority remains partly unresolved
Tie-breaking between multiple same-window triggers needs `TRG-005`.

---

## TRG-005 — Trigger Priority
**Status:** `REQUIRED_EXPLICIT / GLOBAL ORDER UNRESOLVED`

No source currently supports a universal rule such as:
- speed order;
- slot order;
- owner order;
- higher Authority first.

Therefore the Kernel must support a canonical deterministic priority key, but its global semantic order is not locked yet.

Until decided, implementation-ready data involving competing same-window triggers must specify:
- trigger priority class;
or use a system Contract that defines it.

Stable insertion order alone may be used for replay determinism internally, but must not be mistaken for gameplay canon.
For multiple Events produced by the same committed transaction:

> deterministic Event sequence / publication trace order is not by itself gameplay Trigger priority.

`eventSeq` may preserve reproducible trace/insertion order, but it must not be used as a semantic winner rule between otherwise unrelated same-window Trigger Candidates unless a specific Contract explicitly gives that ordering gameplay meaning.

Multiple semantic Events derived from one committed transaction may therefore have deterministic trace order while remaining unordered in gameplay priority.

This clarification does not resolve the currently-unresolved global same-window Reaction priority.

---

## TRG-006 — Trigger Cap Consumption
**Status:** `LOCKED CHARACTER-SPECIFIC, GLOBAL REQUIRED_EXPLICIT`

Current corpus proves different failure behavior may matter.

Example Ký Ức Skill 3:
- when third qualifying Action arrives but AE is insufficient:
  - it does not trigger;
  - sequence resets.

Global rule for whether failed payment consumes:
- cap;
- cooldown;
- counter;
is not safe.

TriggerSpec/Contract must expose:
- `capConsumptionOnFailedCost`
- `counterResetOnFailedCost`
- `cooldownStartOnFailedCost`

No silent default for mechanics where this changes outcome.

## TRG-007 — Position Mutation Commit Observation
**Status:** `LOCKED`

A successful authoritative Position Mutation commit exposes:
POSITION_MUTATION_COMMITTED
as one semantic Event for the atomic Position Mutation group that committed.
The authoritative Position Mutation payload is:
entries[]
with at minimum, per entry:
entityRef
oldPositionRef
newPositionRef
plus transaction/batch context required for deterministic trace.
Observation timing
POSITION_MUTATION_COMMITTED is observed only after the authoritative Position commit has completed.
At that observation point:
every newPositionRef in entries[] is already authoritative;
old occupancy removed by the commit is no longer authoritative;
new occupancy established by the commit is observable;
Trigger evaluation may read the post-commit authoritative state;
Trigger logic may also inspect oldPositionRef / newPositionRef from the immutable Event payload.
A listener cannot mutate or interleave with the Position transaction that produced the Event.
The Position transaction is already closed.
This Contract locks:
post-Position-commit observation timing.
It does not lock a universal priority among multiple Trigger Candidates discovered at that observation point.
Their scheduling/priority remains governed by existing Trigger/Reaction Contracts, including unresolved global ordering under TRG-005.
Atomic multi-entity mutation
If one atomic Position Mutation group commits:
A moves
B moves
C moves
COMMIT together
then exactly:
1 POSITION_MUTATION_COMMITTED Event
is exposed.
Its authoritative entries[] contains A, B and C.
It is not automatically expanded into three semantic Events.
A simultaneous swap follows the same principle.
Sequential commits
If one root Action performs:
mutation group 1
→ commit

mutation group 2
→ commit

mutation group 3
→ commit
then three separate POSITION_MUTATION_COMMITTED Events are exposed.
Root Action identity does not merge distinct committed Position Mutation groups.
No successful mutation
If:
movement validation fails;
destination resolution fails;
operation is cancelled before commit;
authoritative Position does not actually change;
then no successful POSITION_MUTATION_COMMITTED Event is emitted for that attempted mutation.
Listener cardinality
A Trigger may inspect whether entries[] contains:
SELF;
any ALLY relative to an explicit anchor;
any ENEMY relative to an explicit anchor;
an entity entering/leaving a queried Position.
Matching multiple entries inside one Event does not multiply the Event.
entries[] is the authoritative semantic payload for Position Mutation results.
If a derived/index field such as subjectRefs exists for lookup efficiency:
subjectRefs := entries[].entityRef
it is only a derived projection.
It must not independently override or contradict entries[].
This Contract defines observer/event granularity and post-commit observation timing only.
It does not create:
a new Position Mutation terminology type;
a Functional Tag;
a Primitive;
a global Reaction priority rule.

---

# 11. RECURSION / LINEAGE

## TRG-010 — Root Action Lineage
**Status:** `LOCKED`

Every Action/Reaction must preserve:
- rootActionId;
- parentActionId;
- originAbilityId;
- triggerCause;
- generation depth.

---

## TRG-011 — Self-Recursion Guard
**Status:** `LOCKED DEFAULT`

A Trigger explicitly declared not to trigger from its own generated effect must compare lineage, not just current Caster.

Ký Ức Skill 2:
> its echo Damage does not retrigger Skill 2.

Reflected damage can similarly block reflect-of-reflect under default.

---

## TRG-012 — No Implicit Recursive Action
**Status:** `LOCKED_DEFAULT`

Same Ability may not recursively request itself within the same lineage unless an explicit recurrence Contract allows it.

## TRG-013 — Action Lineage vs Effect Provenance
**Status:** `LOCKED`

Action lineage and Effect provenance are separate query axes.

Canonical distinction:
Action lineage
≠ Effect provenance
≠ Damage Attribution
Action-lineage query
When a Condition asks about Action Identity, it must explicitly identify the Action relation being queried when ambiguity is possible:
SELF
PARENT
ROOT
Examples:
immediate Action Identity = SKILL
and:
root Action Identity = ULTIMATE
are different Conditions.
The Kernel/Condition evaluator must not silently substitute one for the other.
Shared root does not imply same Effect
Two Damage instances may have:
the same rootActionId;
the same Actor;
the same Damage Attribution;
while still coming from different Effects.
Example:
Echo Skill 2 Damage
→ Damage Attribution = Echo

Echo Passive Repeat Damage
→ Damage Attribution = Echo
→ same root Action
These must remain distinguishable.
Therefore provenance-sensitive execution must preserve/query the generating Effect identity/source, such as:
originAbilityId
originEffectId
effectSource
according to the normalized representation.
Recursion filtering
A no-recursion rule must use the semantic provenance necessary to distinguish the generated Effect from the Effect it is listening for.
It must not rely only on:
current Caster;
Damage Attribution;
same Character;
same rootActionId.
Those values can legitimately be identical for both the original and generated Effect.
Example:
original Echo Damage
→ qualifies for Passive Repeat

Passive Repeat Damage
→ origin Effect identifies it as Repeat-generated
→ does not qualify for Repeat again
Cross-Character recursion
The same principle applies when two Characters own similar listeners.
A generated repeat/reflect/echo Effect may remain inside the original root lineage while still carrying provenance that makes it ineligible for another repeat layer.
This Contract does not create a second Action-lineage subsystem.
It requires declarative Conditions to query the lineage/provenance already preserved by execution.

---

# 12. TARGET SELECTION CONTRACT

## TGT-001 — Candidate Pool
**Status:** `LOCKED`

Direct Target Selection follows:

```text
Candidate Source
→ relation/kind eligibility
→ lifecycle/presence eligibility
→ Target Filters
→ Target Exclusion
→ final Candidate Pool
→ selection rule
```

---

## TGT-002 — Target Exclusion vs Geometry
**Status:** `LOCKED`

`TARGET_EXCLUSION` removes an entity from relevant **direct Target Selection Candidate Pools**.

It does not:
- remove Position;
- remove battlefield occupancy;
- grant Damage Immunity;
- automatically exclude from `RESOLVE_AREA`.

Ký Ức Forgotten is the canonical proof.

---

## TGT-003 — Direct vs Area-Centered Targeting
**Status:** `LOCKED`

An entity excluded from direct Target Selection:

- cannot be selected as single/random direct target under applicable scope;
- cannot be chosen as center/anchor if choosing that center requires direct selection;
- may still be hit by a fixed/full-board/radius area centered elsewhere if its Position lies inside resolved Geometry.

---

## TGT-004 — Target Snapshot Timing
**Status:** `REQUIRED_EXPLICIT WHEN MOVEMENT/INVALIDATION MATTERS`

If an Action has:
- displacement;
- multiple sequential effects;
- target locking;
- delayed child Action;
then it must specify whether later steps use:

- original target Entity IDs;
- original Positions;
- both;
- re-query.

---

## TGT-005 — Random Multi-target
**Status:** `LOCKED SCHEMA REQUIREMENT`

Random selection must declare:
- Candidate Pool;
- count;
- duplicate policy;
- seeded RNG stream;
- invalidation policy.

Do not assume random AOE semantics.

---

## TGT-006 — Invalid Target After Selection
**Status:** `REQUIRED_EXPLICIT DEFAULT PROFILE`

The project does not currently support one universal reroll behavior.

Allowed policies include:
- DROP_INVALID;
- FAIL_EFFECT;
- FAIL_ACTION;
- REROLL;
- REQUERY;
- KEEP_REFERENCE if lifecycle permits.

If a mechanic can encounter invalidation between selection and resolution, its policy must be known.

### Known character-specific rule
Pygmalion Puppet scheduled for follow-up:
> if Puppet dies before its follow-up, it does not act and is not replaced.

That profile is:
`DROP_INVALID / NO_REPLACEMENT`.

### Known Ký Ức rule
If target reaches DEATH_CONFIRMED before Skill 2 echo resolves:
> target is invalid and receives no echo.

# 12A. HIT ADMISSION CONTRACT

## HIT-001 — Target Lock Is Not Hit Admission
**Status:** `LOCKED`

Target Lock and Hit Admission are separate resolution axes.

Target Lock determines which previously selected:
- Entity;
- Position;
- or both

remain referenced.

Hit Admission determines whether a currently valid referenced target is admitted through ordinary hit resolution.

Therefore:
LOCK_ENTITY_IDS
does not by itself mean:
GUARANTEED
and:
GUARANTEED
does not by itself lock target identity.
## HIT-002 — Hit Admission Interface
Status: LOCKED INTERFACE
For an effect that uses Hit Admission, the conceptual order is:
Target Selection / Target Lock
→ declared current-target validity / invalidation handling
→ Hit Admission
→ admitted effect resolution
Current minimum policy interface supports:
MODE_DEFAULT
GUARANTEED
MODE_DEFAULT delegates ordinary hit admission to the active Mode/System hit policy.
This Contract does not define:
Accuracy formula;
Evasion formula;
Dodge stat formula;
Miss probability;
RNG formula for ordinary hit checks.
Those systems remain outside this Pilot patch.
## HIT-003 — Guaranteed Hit
Status: LOCKED
If:
hitAdmission.policy = GUARANTEED
and the selected/locked target remains a legal recipient at the Hit Admission point:
ordinary Miss/Dodge/Evasion cannot reject that hit.
A Position change alone does not make a locked Entity ID miss when:
target identity is locked;
target remains otherwise valid.
Guaranteed Hit does not override:
target invalidation under declared invalidPolicy;
lifecycle removal that makes target no longer a legal recipient;
battle termination;
Authority adjudication;
protections/immunities whose semantic is not ordinary Miss/Dodge/Evasion.
Authority-based special deny / avoidance
A rule-level effect such as:
“this hit cannot connect”;
“this Character avoids the hit under Rule X”;
special Dodge/Denial granted by Pháp Tắc / Quy Tắc / Axiom;
is not ordinary Miss/Dodge/Evasion merely because its presentation resembles a dodge.
If such a rule directly conflicts with Guaranteed Hit over the same semantic scope:
resolve that conflict through the existing Authority Contract.
GUARANTEED does not automatically bypass or outrank the special rule.
This Contract introduces no Accuracy/Evasion formula.

Phần này giữ `GUARANTEED` ở đúng mức **ordinary hit policy**, không biến nó thành mini-Axiom.

---

# 13. AREA RESOLUTION

## TGT-010 — Fixed Geometry
**Status:** `LOCKED`

Fixed geometry resolves positions/space first, then affected occupants.

It does not perform direct target selection for each occupant unless Ability says so.

---

## TGT-011 — Simultaneous Area Target Set
**Status:** `LOCKED_DEFAULT`

For a simultaneous AOE:
- affected target identities are snapshotted at the declared area-resolution point;
- calculations use the shared declared snapshot;
- no target's death changes another target's calculation inside the same batch.

---

# 14. DETERMINISTIC RNG

## RNG-001 — Seeded Randomness
**Status:** `LOCKED`

All gameplay randomness must use deterministic seeded RNG.

Includes:
- first Side if random;
- random targets;
- random Combat Definition;
- random valid Position;
- rerolls.

---

## RNG-002 — Candidate Set Before Draw
**Status:** `LOCKED`

The exact eligible Candidate Set must be built before a random draw.

Invalid candidates should be filtered before RNG when eligibility is knowable at selection time.

---

## RNG-003 — Reroll
**Status:** `LOCKED`

A reroll is a new RNG draw.

It occurs only if:
- selection policy explicitly says REROLL;
- or a system-specific Contract requires it.

No hidden reroll.

---

## RNG-004 — RNG Stream Stability
**Status:** `WORKING_PROPOSAL`

Use independent named RNG streams or deterministic draw domains for conceptually separate systems where practical, so adding a cosmetic-independent random operation in one subsystem does not reshuffle unrelated random outcomes.

Examples:
- TARGET_SELECTION
- DEFINITION_SELECTION
- SPAWN_POSITION
- FIRST_SIDE

Exact stream topology belongs Kernel Runtime.

---

# 15. SNAPSHOT CONTRACT

## SNP-001 — Snapshot Immutability
**Status:** `LOCKED`

A SnapshotRef is immutable after capture.

---

## SNP-002 — Explicit Field Whitelist
**Status:** `LOCKED`

Snapshot copies only declared fields.

Ký Ức stat snapshot:
- Max HP;
- ATK;
- WIL;
- ARM;
- RES;
- HP Regen;

does not automatically copy:
- Buff object;
- Debuff object;
- Mark object;
- cooldown;
- temporary state;
- resource.

---

## SNP-003 — Shared Snapshot
**Status:** `LOCKED`

A simultaneous group can require all calculations to use the same state version.

---

## SNP-004 — Sequential Re-read
**Status:** `LOCKED_DEFAULT`

Sequential components read current committed state at their own resolution point unless explicitly bound to an earlier SnapshotRef.

---

## SNP-005 — Snapshot Does Not Equal Ownership Transfer
**Status:** `LOCKED`

A value recorded in a Snapshot does not retain the source Buff/Effect object merely because that object contributed to the final stat value.

This supports Ký Ức:
external modifier may influence final death stat snapshot, but the external Buff itself is not copied to next life.

---

# 16. RESOLUTION / COMMIT CONTRACT

## RES-001 — Calculate vs Commit
**Status:** `LOCKED`

Where simultaneous semantics matter, calculation must be separable from commit.

---

## RES-002 — Simultaneous Batch
**Status:** `LOCKED`

For a simultaneous batch:

```text
snapshot required state
→ build all packet/effect calculations
→ resolve all calculations against same start state
→ commit batch
→ process resulting HP_ZERO/death/effects
→ expose downstream reaction events
```

No earlier target death in the batch buffs/changes later target calculation unless Ability is explicitly sequential.

---

## RES-003 — Sequential Group
**Status:** `LOCKED`

For sequential resolution:

```text
resolve component 1
→ commit
→ required immediate lifecycle resolution
→ component 2 may observe new state
→ ...
```

Whether Reactions interrupt between components is a separate Contract field.

---

## RES-004 — Effect DAG
**Status:** `LOCKED`

Within one bounded Action, effect dependency graph is acyclic.

Recurring cycles use:
- Trigger;
- future Action;
- persistent State.

---

## RES-005 — Atomic State Group
**Status:** `LOCKED_DEFAULT`

Mutations that semantically constitute one operation must not expose partial intermediate state.

Examples:
- multi-resource atomic cost payment;
- swap positions;
- materialization identity + placement;
- property transfer remove-from-source + attach-to-destination.

---

# 17. COST CONTRACT

## CST-001 — Validation Before Payment
**Status:** `LOCKED_DEFAULT`

Cost payment follows:

```text
validate all required costs
→ if all payable
→ commit cost group atomically
```

No partial multi-cost payment by default.

---

## CST-002 — Cost Is Not Effect Drain
**Status:** `LOCKED`

A Cost differs from a Resource Modification effect.

- `20 AE to cast` = Cost.
- `remove 20 AE from enemy` = Resource Modification.

---

## CST-003 — HP Cost
**Status:** `LOCKED_DEFAULT`

HP Cost:
- is not Damage;
- bypasses Shield;
- does not Reflect;
- does not Lifesteal;
- does not trigger ordinary Damage Trigger;
- by default cannot kill payer and leaves at least 1 HP.

A Character may explicitly override lethal policy.

---

## CST-004 — HP Loss
**Status:** `LOCKED`

Non-Cost HP Loss:
- is not Damage;
- is not payment;
- does not require affordability;
- does not use Shield/Reflect/Lifesteal by default.

Its lethal policy must be explicit or inherit an HP Loss profile.

---

## CST-005 — Refund
**Status:** `REQUIRED_EXPLICIT`

There is no global automatic refund after Cost commits and later Action fails.

If an Ability can fail after payment and should refund:
> it must declare refund policy.

---

## CST-006 — Child Free Cast
**Status:** `LOCKED`

A parent Action may waive child Cost.

This affects only that child execution instance, not base child Ability definition.

## CST-007 — Active Skill Cost Before Activation
**Status:** `LOCKED DEFAULT`

Unless an Ability/Contract explicitly overrides Cost timing, an active `SKILL` with Cost follows:
validate Action legality/prerequisites
→ validate mandatory pre-cost target/resource conditions
→ validate full Cost
→ commit/pay Cost atomically
→ ACTION_BEGIN / Skill activation
→ resolve Skill
If required Cost is not payable:
Skill does not activate
and:
no Skill Effect partially resolves;
no Action-side Skill result is committed;
no Cost is partially paid.
This is the default active-Skill rule.
Ordered fallback interaction
Candidate probing under ACT-003 does not pay Cost.
For:
ULTIMATE
→ else SKILL
→ else BASIC
the Kernel may read whether Skill Cost is currently affordable during candidate probing, but it does not commit that Cost.
Only after that Skill candidate is selected does CST-007 perform actual validation/payment.
Triggered/passive settlement exception
Do not automatically apply this active-Skill activation sequence to a Passive/Triggered settlement merely because its source Ability is named Skill.
Auto/Reaction/Passive settlements follow:
TRG-003
and their explicit settlement timing.
Child Cost override
CST-006 may explicitly waive/override the Cost of one child execution instance.
Example:
root Ultimate
→ child Skill
→ child Cost override = 0
does not modify the base Skill Cost definition.
Later failure
If Cost has committed and a later phase fails for a reason that occurs after payment:
no automatic refund exists.
Any refund must follow CST-005.

---

# 18. RESOURCE CONTRACT

## CST-010 — AE Ownership
**Status:** `LOCKED_DEFAULT FOR TURN-BASED`

Turn-based AE is a shared Side/team resource by default.

Mode Profile may override.

Exploration/Defense AE ownership remains `UNRESOLVED`.

---

## CST-011 — Rage Ownership
**Status:** `LOCKED_DEFAULT`

Rage is per Combat Unit by default.

---

## CST-012 — Non-Natural Action Resource Gain
**Status:** `LOCKED_DEFAULT`

Follow-up/Counter/Reaction/auto Action does not automatically gain:
- AE;
- Rage;
merely because a Natural Action would.

Gain must be explicitly tied to that Action/effect.

Ký Ức auto Skill 2/3 explicitly generate no Natural Action, AE or Rage.

## CST-013 — Rage Readiness Is Not Ultimate Autocast
**Status:** `LOCKED`

For a Character with Rage:
Current Rage >= Max Rage
satisfies the generic Rage readiness condition for Ultimate use.
This does not by itself guarantee that Ultimate is currently legal.
Other admission conditions/restrictions may still block it.
Reaching full Rage does not by itself:
create an Action;
create a Reaction;
create an interrupt;
cast Ultimate;
consume a Natural Action;
consume/reset Rage.
Canonical distinction:
FULL_RAGE ≠ AUTO_CAST_ULTIMATE.
Exact Rage consumption/reset after an Ultimate is a separate global Rage Contract and is not defined here.

---

# 19. DAMAGE PIPELINE

## DMG-001 — Typed Components
**Status:** `LOCKED`

Damage Profile can contain independent components:

- PHYSICAL;
- WILL;
- TRUE.

Mixed Damage keeps components separate through relevant mitigation.

---

## DMG-002 — Physical Component
**Status:** `LOCKED`

Physical Damage uses ARM as its primary mitigation stat subject to Penetration/Contract.

---

## DMG-003 — Will Component
**Status:** `LOCKED`

Will Damage uses RES as its primary mitigation stat subject to Penetration/Contract.

---

## DMG-004 — True Damage
**Status:** `LOCKED_DEFAULT`

True Damage:
- bypasses ARM;
- bypasses RES;
- bypasses ordinary generic Damage Reduction;
- does **not** automatically bypass Shield.

---

## DMG-005 — True Damage vs Final Damage Reduction
**Status:** `LOCKED`

Final Damage Reduction applies only to non-True damage after the relevant ARM/RES mitigation stage.

Canonical component flow:

```text
Physical → ARM/Penetration → Final Damage Reduction
Will     → RES/Penetration → Final Damage Reduction
True     → bypass ARM/RES → bypass Final Damage Reduction
```

Final Damage Reduction does **not** reduce True Damage.

Shield resolution occurs afterward unless a packet has explicit Shield Piercing/bypass.

This preserves:
`TRUE_DAMAGE ≠ SHIELD_PIERCING`.

## DMG-006 — Penetration
**Status:** `LOCKED`

Penetration reduces/ignores relevant defensive stat.

100% Penetration is not automatically True Damage.

---

# 20. SHIELD DAMAGE ORDER

## SHP-001 — Shield Before HP
**Status:** `LOCKED_DEFAULT`

Qualifying Damage resolves into Shield before Current HP unless packet has explicit Shield Piercing/bypass.

This includes True Damage by default.

---

## SHP-002 — Standard Shield Pool + Source Ledger
**Status:** `LOCKED`

Standard Shields on one target are presented/resolved as one aggregated Shield Pool for ordinary damage absorption.

Runtime must still preserve a source ledger containing each contribution's:
- source/effect identity;
- owner;
- remaining contribution;
- duration/expiry;
- Authority/metadata when relevant.

Damage does not choose “oldest Shield first” or “newest Shield first”.

For Standard Shield contributions, absorbed damage depletes all active contributions **proportionally to their current contribution**.

Example:

```text
A = 600
B = 300
C = 600
Total Shield = 1500

300 Shield damage = 20% of pool

A → 480
B → 240
C → 480
```

If B later expires:
> remove only B's remaining 240 contribution.

This gives one simple gameplay Shield pool while preserving provenance for:
- expiry;
- source-specific removal;
- triggers;
- transfer;
- analytics.

Special Shield Profiles such as “only blocks Will Damage” may form distinct eligible layers instead of being merged blindly into Standard Shield Pool.

Implementation should use deterministic high-precision/fixed-point accounting so proportional depletion does not create source-order gameplay artifacts.

## SHP-003 — Shield Piercing
**Status:** `LOCKED`

Shield Piercing is independent of damage type.

A packet may be:
- True but not Shield Piercing;
- Physical and Shield Piercing;
- Will and Shield Piercing.

---

## SHP-004 — Shield Damage Is Not Actual HP Damage
**Status:** `LOCKED`

Damage absorbed by Shield is not Actual HP Damage.

---

# 21. ACTUAL HP DAMAGE / OVERKILL

## DMG-010 — Actual HP Damage
**Status:** `LOCKED`

Actual HP Damage:

```text
min(qualifying post-shield HP-bound damage, target Current HP before commit)
```

Conceptually capped by Current HP removed.

---

## DMG-011 — Overkill
**Status:** `LOCKED`

Damage beyond target remaining Current HP is Overkill.

It does not count as Actual HP Damage.

---

## DMG-012 — Action-level Aggregation
**Status:** `LOCKED`

Mechanics can aggregate Actual HP Damage over a full Damage Action.

Multihit does not create multiple trigger payments when the Trigger is defined once per Damage Action.

Ký Ức Skill 2:
- one allied Damage Action;
- aggregate per target;
- pay 30 AE once for whole trigger;
- echo each qualifying target independently.

---

# 22. DAMAGE THRESHOLD

## DMG-020 — Whole-Action Default
**Status:** `LOCKED_DEFAULT`

A condition phrased like:

> “when receiving Damage greater than 15% Max HP”

defaults to total qualifying HP Damage caused by the entire Action, not visual hit frames.

An Ability explicitly saying per-hit uses per-hit evaluation.

---

## DMG-021 — Threshold Max HP Reference
**Status:** `REQUIRED_EXPLICIT WHEN MAX HP CAN MUTATE DURING ACTION`

If Max HP can change between:
- Action start;
- hit;
- commit;
- trigger evaluation;

the threshold must reference:
- Action-start Max HP;
- target snapshot Max HP;
- current Max HP at event;
or a named profile.

No universal silent choice for mutation-heavy interactions.

---

# 23. REFLECT CONTRACT

## DMG-030 — Reflected Damage Is a New Damage Instance
**Status:** `LOCKED_DEFAULT`

Reflect creates separate Damage lineage/result.

It is not the original packet reversed in-place.

---

## DMG-031 — Reverse Reflect
**Status:** `LOCKED_DEFAULT`

Reflected Damage does not trigger another ordinary reflect back by default.

---

## DMG-032 — Lifesteal on Reflect
**Status:** `LOCKED_DEFAULT`

Reflected Damage does not grant ordinary Lifesteal by default.

---

## DMG-033 — Counter on Reflect
**Status:** `LOCKED_DEFAULT`

Reflected Damage does not automatically qualify as a normal attack/action for Counter triggers unless TriggerSpec explicitly accepts reflected damage lineage.

---

# 24. HEAL / OVERHEAL

## HEL-001 — Heal Calculation
**Status:** `LOCKED`

Heal resolves:

```text
requested Heal
→ actual restorable HP up to Current Max HP
→ Overheal = remaining excess
```

---

## HEL-002 — Overheal
**Status:** `LOCKED`

Overheal is result data, not automatically stored HP and not Shield.

---

## HEL-003 — Overheal Conversion
**Status:** `LOCKED`

A Character can create a separate Effect based on Overheal result.

SSR Warrior:
- each Heal instance computes its own Overheal;
- each conversion is independent;
- no re-aggregation of all Overheal into one fake Heal result.

---

## HEL-004 — Heal Does Not Revive
**Status:** `LOCKED`

Heal cannot materialize a DEATH_CONFIRMED entity unless a special Ability explicitly has Revive semantics.

---

# 25. MAX HP MUTATION

## STA-001 — Max HP Mutation Is Not Heal/Damage
**Status:** `LOCKED`

Changing Current Max HP does not automatically emit:
- Heal;
- Damage.

---

## STA-002 — Current HP Reconciliation
**Status:** `REQUIRED_EXPLICIT PROFILE`

Every Max HP Mutation must use a Health Reconciliation policy.

Possible policies:
- preserve absolute Current HP then clamp if above new max;
- preserve percentage;
- explicitly adjust HP by a stated amount;
- other named canonical profile.

No hidden “heal back lost max HP” behavior.

---

## STA-003 — SSR Warrior Growth
**Status:** `LOCKED CHARACTER-SPECIFIC`

When qualifying True Damage triggers the Warrior passive:

```text
Current Max HP := Current Max HP × 1.02
```

This is mutation, not ordinary stat Buff.

Its per-own-action-window cap is handled by `CLK-002`, not global Turn Boundary.

---

# 26. STATE / EFFECT ADMISSION / IMMUNITY / AUTHORITY

## STA-010 — State Admission
**Status:** `LOCKED_DEFAULT`

Before a State is applied:

1. validate target presence/eligibility;
2. determine State classification/identity;
3. check immunity/exclusion rules;
4. if direct conflict exists, resolve Authority;
5. only then commit State instance.

---

## STA-011 — Thần Tính
**Status:** `LOCKED CHARACTER/SYSTEM RULE`

Current Ký Ức Thần Tính blocks external:

- Buff;
- Debuff;
- Mark;
- external beneficial/harmful/neutral effects within its scope;

including effects from allies.

It does not automatically block direct Damage.

Thần Tính does not make every Skill Axiom Authority.

---

## STA-012 — Debuff Identity
**Status:** `LOCKED`

“same Debuff type” mechanics use `Debuff Identity`, not broad category.

SSR Warrior Skill 3 adaptation therefore compares exact Debuff Identity.

---

## STA-013 — Cleanse vs Immunity
**Status:** `LOCKED`

- Cleanse removes existing Debuff.
- Immunity prevents qualifying application/resolution.

They are not interchangeable.

## STA-014 — Scoped Effect Admission
**Status:** `LOCKED DEFAULT`

State Admission is a specialized case of a broader scoped Effect Admission boundary.

A non-State Effect such as Shield may require admission before commit when the recipient currently owns a rule that explicitly governs admission of that Effect semantic.

This Contract does **not** mean every Effect in the game passes through one universal Immunity gate.

### Admission applicability

Before applying a non-State Effect:

1. validate target presence/lifecycle eligibility;
2. identify the incoming Effect semantic and relevant source/relation;
3. query whether the target/system owns any admission/protection rule whose declared scope matches that Effect;
4. if no matching admission rule exists, continue through the Effect's ordinary pipeline;
5. if a matching admission rule exists, evaluate that rule;
6. only an admitted Effect may proceed to its mutation/commit operation.

### Scope must be explicit

An admission rule must declare what it governs.

Possible scope dimensions include:

- Effect semantic, such as `SHIELD`;
- source relation, such as external/ally/enemy/self;
- Authority requirement;
- Effect Source / provenance;
- Character/System state;
- other structured Schema criteria.

A rule protecting against Shield must not silently become:
- Damage immunity;
- Heal immunity;
- all-effect immunity.

### Authority threshold is not automatically adjudication

A target-local admission rule may directly contain a threshold such as:
admit external SHIELD only if incoming Authority >= QUY TẮC

Evaluation then gives:
NORMAL   → reject
PHÁP TẮC → reject
QUY TẮC  → admit
AXIOM     → admit
This threshold evaluation is an admission predicate.
It is not by itself an AUT-004 same-tier Authority adjudication and therefore does not invoke Rank/Tu vi/Stars/Awaken/CP comparison.
When Authority adjudication actually occurs
Invoke AUT-* only if two rule/effect clauses directly conflict.
Example:
target admission rule:
external Shield below/at some scope is denied

incoming Effect rule:
this Shield explicitly bypasses/overrides that protection
If those clauses directly conflict:
resolve the conflict through the normal Authority Contract.
Authority is not invoked merely because the incoming Effect has an Authority field.
Rejected Effect
If Effect Admission rejects an Effect:
the Effect does not commit;
no partial Shield/Heal/State/property mutation is created by that Effect;
rejection itself does not become Damage or Resource loss;
Cost/refund behavior remains governed by the originating Ability's own Contract.
Damage warning
Direct Damage is not automatically gated by generic Effect Admission.
A protection must explicitly include Damage in its scope before this boundary can deny Damage.
Therefore this Contract does not turn Thần Tính or ordinary scoped Immunity into global Damage immunity.

---

# 27. POSITION

## POS-001 — Authoritative Position
**Status:** `LOCKED`

Only gameplay Position state determines:
- occupancy;
- geometry;
- target area;
- movement legality.

Animation is presentation.

---

## POS-002 — Multi-Entity Swap
**Status:** `LOCKED_DEFAULT`

Swap/multi-entity relocation commits atomically so no transient invalid occupancy becomes externally observable.

---

## POS-003 — Failed Position Mutation
**Status:** `REQUIRED_EXPLICIT`

If destination is invalid/occupied and Ability has no obvious unique outcome, it must define:
- fail;
- alternate position;
- swap;
- displace occupant;
- nearest valid;
- other deterministic policy.

No hidden nearest-cell search.

## POS-004 — Side-relative Direction Resolution
**Status:** `LOCKED FOR MODES THAT SUPPORT SIDE-RELATIVE SPATIAL MAPPING`

When an authored `SpatialSelectorSpec` uses:
FRONT
BACK
LEFT
RIGHT
with:
orientationBasis = SIDE_RELATIVE
the active Spatial Profile resolves those directions relative to the Side obtained from the selector's declared orientation anchor.
Canonical meaning:
FRONT = toward opposing Side
BACK  = toward own rear
LEFT  = left relative to reference Side facing
RIGHT = right relative to reference Side facing
Opposing Sides may therefore map the same semantic direction to mirrored physical Slots/coordinates.
Direction resolution is gameplay geometry.
It must not depend on:
camera orientation;
current screen rotation;
presentation-facing animation.
If a requested directional destination does not exist or is invalid:
the direction resolver returns no valid destination for that candidate.
The caller then follows its explicit:
next priority candidate;
occupancy policy;
failure policy;
fallback composition.
No hidden nearest-position behavior is introduced.

## POS-005 — Combat-Instance-keyed Field Presence
**Status:** `LOCKED`

Field Presence is authoritative per:
Runtime Entity
× Combat Instance
The Kernel must be able to answer independently:
isActivePresent(entityRef, combatInstanceId)
for the relevant Combat Instance.
Presence must not be inferred solely from:
one global/singular presentation visibility flag;
renderer state;
camera state;
animation;
current screen;
lore identity.
An entity leaving Main Battlefield presence while becoming active-present in an Arena child Combat Instance is represented as two instance-local presence states/transitions, not one ambiguous global boolean.
## POS-006 — ENTER_FIELD / LEAVE_FIELD Emission

Status: LOCKED
After authoritative presence state commits:
not active-present in X
→ active-present in X
emit:
ENTER_FIELD
for Combat Instance X.
After:
active-present in X
→ not active-present in X
emit:
LEAVE_FIELD
for Combat Instance X.
A repeated write that does not change the presence truth value does not emit another presence-transition Event.
Presence Events must preserve:
Combat Instance ID;
entity reference;
transaction/cause context needed by downstream listeners.
Listeners observe the committed presence state.

## POS-007 — Presence Cause Separation
Status: LOCKED
ENTER_FIELD / LEAVE_FIELD describe presence transition.
They do not erase semantic cause.
Cause-specific events and lifecycle contracts remain distinct.
Deck deployment
A successful Deck deployment can produce:
DEPLOY_FROM_DECK_COMMITTED
ENTER_FIELD
because the first identifies cause while the second identifies the resulting presence transition.
The deterministic publication/event sequence between these Events may be preserved for trace purposes.
That sequence does not by itself establish gameplay Reaction priority between unrelated listeners.
Revive
A legitimate Revive returning a non-present Character to active battlefield presence may produce:
ENTER_FIELD
but remains Revive, not Deck Deployment.
Arena transfer
Main → Arena participant transfer may produce:
LEAVE_FIELD(Main)
ENTER_FIELD(Arena)
without DEATH_CONFIRMED.
Arena → Main return follows the same instance-local presence principle.
Host / Combat Definition binding
Changing:
True Self binding;
Combat Definition;
Behavior Source;
on an entity that was already active-present and remains active-present does not emit ENTER_FIELD or LEAVE_FIELD solely because of that binding/change.
Death
DEATH_CONFIRMED alone does not imply LEAVE_FIELD.
Only an actual active-presence transition emits LEAVE_FIELD.
Return to Deck
Leaving the field does not automatically mean returning to Deck.
A future explicit Return-to-Deck mechanic remains a separate transition.

---

# 28. DEATH CONTRACT

## DTH-001 — Canonical Pipeline
**Status:** `LOCKED`

```text
ALIVE
→ HP_ZERO
→ death evaluation
→ DEATH_PREVENTION
→ DEATH_PREVENTED
   OR
→ DEATH_CONFIRMED
```

---

## DTH-002 — HP_ZERO
**Status:** `LOCKED`

HP_ZERO is not death.

It cannot:
- grant kill;
- emit canonical on-death/on-kill;
- enter Luân Hồi by itself.

---

## DTH-003 — Death Prevention
**Status:** `LOCKED`

Death Prevention runs before DEATH_CONFIRMED.

If successful:
- entity returns/remains in a non-dead life state;
- no confirmed-death observers fire.

---

## DTH-004 — Single Loss Does Not Re-kill
**Status:** `LOCKED CHARACTER EXAMPLE / DEFAULT SANITY`

A single already-resolved HP-loss operation is not re-applied merely because Death Prevention leaves target at 1 HP.

SSR Warrior:
> 1% HP Loss resolves once; Death Prevention saving to 1 HP ends that loss resolution. A later HP Loss may kill.

---

## DTH-005 — DEATH_CONFIRMED
**Status:** `LOCKED`

Only after DEATH_CONFIRMED may canonical death observers execute:

- kill attribution;
- on-death;
- on-kill;
- Luân Hồi observation;
- True Self death record.

---

## DTH-006 — Simultaneous Multiple Deaths
**Status:** `WORKING_PROPOSAL / ordering identifier required`

If one simultaneous batch causes multiple entities to reach DEATH_CONFIRMED:

- all relevant lethal results derive from same batch;
- each death receives a deterministic `deathSequenceIndex` for systems that require ordering;
- the index must **not** retroactively affect calculations inside the completed simultaneous batch.

How ties map to Reincarnation death-order semantics must be deterministic.

Working proposal:
> order by canonical stable battlefield resolution order only for post-batch indexing, not for damage calculation.

Exact tie-break should be confirmed before freeze because Luân Hồi waiting depends on death order.

---

# 29. REVIVE CONTRACT

## REV-001 — Revive Is Post-Death
**Status:** `LOCKED`

Ordinary Revive requires prior DEATH_CONFIRMED.

Saving before DEATH_CONFIRMED is Death Prevention.

---

## REV-002 — Revive Eligibility
**Status:** `LOCKED_DEFAULT`

Revive requires:
- eligible Chân Ngã/entity;
- revive entitlement/Ability;
- not already beyond ordinary revive eligibility;
- no higher rule blocking materialization.

---

## REV-003 — lifeSerial
**Status:** `LOCKED_DEFAULT`

Global default:

> **Ordinary Revive preserves the current `lifeSerial`.**

Semantic:
- `trueSelfId` = persistent True Self;
- `lifeSerial` = current life;
- ordinary Revive returns to the same life;
- Reincarnation/Rebirth/new life increments `lifeSerial`.

### Character-specific exception
Hoá Thân Ký Ức Chi Chủ explicitly preserves `trueSelfId` but increments `lifeSerial` on each of its special Revives.

## REV-004 — Revive State Restoration
**Status:** `LOCKED PRINCIPLE / profile-specific`

Revive does not automatically restore:
- resource;
- cooldown;
- Buff;
- Debuff;
- Mark;
- temporary state.

Restore policy must be explicit/profile-based.

Ký Ức:
- restores specified death stat snapshot;
- does not copy status objects/resources/cooldowns unless rule says so.

---

## REV-005 — Revive HP Is Not Heal
**Status:** `LOCKED`

Current HP assigned at materialization is lifecycle initialization, not Heal.

Ký Ức revive:
- 30%;
- 45%;
- 60%;
of snapshot Max HP by revive number.

These do not generate Heal/Overheal events merely because HP becomes nonzero.

---

## REV-006 — Materialization Position
**Status:** `REQUIRED_EXPLICIT`

Revive must specify:
- original slot;
- death slot;
- reserved slot;
- nearest valid;
- fail/retry;
- another rule.

Do not silently move revived actors.

---

# 30. LUÂN HỒI / REINCARNATION CONTRACT

## REC-001 — Death-Order Waiting Window
**Status:** `LOCKED FROM CURRENT PROJECT RULE`

Luân Hồi waiting is based on **death order**, not wall-clock time.

A confirmed-dead Chân Ngã remains ordinarily revive-eligible until the required number of later qualifying deaths occur.

Current standard threshold:

> **4 later qualifying deaths.**

Conceptual example:

```text
A = first qualifying DEATH_CONFIRMED
then B dies → A progress 1
C dies → A progress 2
D dies → A progress 3
E dies → A progress 4
A reaches Reincarnation transition threshold
```

Deaths from both Sides can count.

---

## REC-002 — What Counts as a Qualifying Death
**Status:** `LOCKED DEFAULT FROM PROJECT RULE`

Count:
- collection Characters/Chân Ngã-bearing combatants;
- NPCs that participate as relevant real combat lives under the system.

Do not count by default:
- Summons without Chân Ngã;
- Despawn;
- Fusion Consumption;
- Removal;
- Erasure unless it separately causes DEATH_CONFIRMED;
- HP_ZERO without DEATH_CONFIRMED.

Boss handling can be moot when boss death immediately ends PvE encounter, but NPC/collection-character cases may still count where battle continues.

---

## REC-003 — Own Death Does Not Advance Own Waiting
**Status:** `LOCKED BY DEATH-ORDER MEANING`

The initial DEATH_CONFIRMED creates the waiting entry at progress 0.

Only subsequent qualifying DEATH_CONFIRMED events advance it.

---

## REC-004 — Simultaneous Death Cohort
**Status:** `LOCKED`

All qualifying `DEATH_CONFIRMED` outcomes committed in the same simultaneous batch form one **Death Cohort**.

Members of the same Death Cohort do not count as “later deaths” for one another.

Every member of the cohort **does** count as a later qualifying death for Chân Ngã that were already waiting before the cohort.

Example:

```text
A is already waiting at 0/4.
One simultaneous AoE confirms B,C,D,E.

Death Cohort = {B,C,D,E}
A: 0 → 4 → enters Reincarnation

B,C,D,E each enter waiting at 0.
They do not increment one another.
```

Canonical processing:

```text
1. collect qualifying deaths in the simultaneous commit batch;
2. cohortSize = number of qualifying Chân Ngã deaths;
3. advance waiting entries that existed before the cohort by cohortSize;
4. immediately move entries reaching threshold into Reincarnation;
5. create new waiting entries at 0 for cohort members.
```

Sequential deaths form separate cohorts because they truly occur after one another.

One Natural Action may produce:
- one cohort with multiple deaths for simultaneous effects;
- multiple cohorts for sequential lethal effects.

## REC-005 — Enter Reincarnation
**Status:** `LOCKED`

When waiting threshold is reached:
- Chân Ngã enters Reincarnation;
- ordinary Revive can no longer retrieve it by default.

Special Rebirth/Routing systems may act.

---

## REC-006 — Reincarnation Routing
**Status:** `LOCKED PRINCIPLE`

Routing is separate from:
- entering Reincarnation;
- materialization;
- Combat Definition inheritance.

A route may:
- select host;
- select new definition;
- select Side;
- select presentation;
subject to its own rules.

---

## REC-007 — Pygmalion Route
**Status:** `LOCKED CURRENT CHARACTER DIRECTION`

An eligible Chân Ngã entering Reincarnation may route into an eligible empty Pygmalion Puppet when the route is not blocked by Luân Hồi Chi Chủ and other eligibility rules.

The Puppet route does not ordinary-Revive the prior body.

---

## REC-008 — Reincarnation Exhausted
**Status:** `LOCKED CONCEPT / scope REQUIRED_EXPLICIT`

`REINCARNATION_EXHAUSTED` is not Erasure.

Exhaustion scope must specify:
- route;
- source system;
- encounter;
or broader scope.

---

# 31. PYGMALION LIFECYCLE CONTRACT

## ENT-001 — One New Puppet Per Pygmalion Life Cycle
**Status:** `LOCKED`

Each Pygmalion Life Cycle can create exactly one **new** Puppet.

This is a quota:

```text
quotaScope = PYGMALION_CURRENT_LIFE_CYCLE
quotaKey = CREATE_PUPPET
max = 1
```

---

## ENT-002 — Old Puppets Persist
**Status:** `LOCKED`

Puppets from previous Pygmalion Life Cycles persist independently until they themselves are removed.

Therefore:
- multiple Puppets may coexist;
- multiple Puppets may be inhabited by different Chân Ngã.

Never implement:
> “Pygmalion already has any Puppet → cannot create new one.”

---

## ENT-003 — Puppet Creation Stats
**Status:** `LOCKED CURRENT CHARACTER DIRECTION`

At creation, current known rules include:
- Puppet rank = Pygmalion rank;
- Rage max = 100;
- Rage starts at 0;
- rank-multiplied stats use 80% of Pygmalion creation snapshot;
- non-rank-multiplied stats currently 0;
- cultivation same as Pygmalion.

These are Character data, not global Summon rules.

---

## ENT-004 — Puppet Combat Definition Inheritance
**Status:** `LOCKED PRINCIPLE`

When inhabited:
- Puppet can use inherited Combat Definition behavior;
- host Puppet stat basis remains its own unless inheritance policy says otherwise;
- Presentation can remain Puppet;
- inherited kit may modify current stats through its own effects.

---

## ENT-005 — Puppet Class / Element
**Status:** `LOCKED CHARACTER RULE`

When an inhabited Puppet inherits a Combat Definition:

- **Class is inherited** from the inherited Combat Definition.
- **Element is not inherited** from that Combat Definition.
- host Puppet's own Effective Element source/profile is preserved.

If host Puppet has no explicit Element yet, this only means:
> inherited Combat Definition does not overwrite Element automatically.

## ENT-006 — Puppet Follow-up Invalidated by Death
**Status:** `LOCKED CHARACTER RULE`

If a Puppet scheduled to perform Pygmalion Ultimate follow-up dies before its follow-up:
- no Action occurs;
- no replacement Puppet is selected.

---

## ENT-007 — Puppet Attribution
**Status:** `LOCKED CHARACTER RULE`

For Pygmalion Ultimate Puppet follow-up:

- Actor = Puppet.
- Behavior Source = Puppet's current inherited Combat Definition.
- **Damage Attribution = Pygmalion.**
- inherited secondary effects do **not** automatically inherit Pygmalion Damage Attribution.

Default for inherited secondary effects:
> keep Puppet / immediate effect-source attribution unless explicitly overridden.

---

## ENT-008 — Puppet Entity Kind
**Status:** `LOCKED CHARACTER RULE`

Puppet is a distinct `PUPPET` entity kind.

It is **not automatically a SUMMON** for:
- bonus damage to Summons;
- Summon-only targeting;
- Summon-only lifecycle.

A mechanic may explicitly include PUPPET in its scope.

---

## ENT-009 — One True Self Per Puppet
**Status:** `LOCKED CHARACTER RULE`

A Puppet can host at most one Chân Ngã at a time.

Reincarnation Routing must reserve/validate an empty eligible Puppet before binding.

---

## ENT-010 — Inhabited Puppet Death and Ordinary Revive
**Status:** `LOCKED CHARACTER RULE`

When an inhabited Puppet reaches DEATH_CONFIRMED:

- active Puppet battlefield presence disappears;
- hosted Chân Ngã enters ordinary Luân Hồi waiting;
- death record preserves Puppet-life host relation and inherited Combat Definition for eligible ordinary Revive.

If ordinary Revive succeeds before that Chân Ngã enters Reincarnation:

- the same Puppet-life materializes again;
- same Chân Ngã returns;
- same inherited Combat Definition returns;
- ordinary Revive preserves `lifeSerial`.

If the Chân Ngã has entered Reincarnation:
> the old Puppet-life cannot be restored by ordinary Revive.

The Chân Ngã may later route into another eligible Puppet/new life through Reincarnation.

# 32. ATTRIBUTION CONTRACT

## ATR-001 — Separate Attribution Axes
**Status:** `LOCKED`

Runtime must separately represent:

- Caster;
- Owner;
- Source;
- Behavior Source;
- Effect Source;
- Damage Attribution;
- Kill Attribution;
- Trigger Cause.

---

## ATR-002 — Ordinary Default
**Status:** `WORKING_PROPOSAL`

For ordinary self-authored Action:

```text
Caster = acting Entity
Owner = acting Entity
Source = acting Entity / current effect
Behavior Source = actor's current Combat Definition
Effect Source = current Ability/Effect
Damage Attribution = acting Entity
Kill Attribution = Damage Attribution
```

Any special mechanic may override.

---

## ATR-003 — Child Action Inheritance
**Status:** `LOCKED DEFAULT`

A child Action inherits parent attribution context only for fields whose policy says `INHERIT_PARENT`.

Actor/Behavior Source may differ.

---

## ATR-004 — Kill Attribution
**Status:** `LOCKED`

Kill credit is assigned at DEATH_CONFIRMED using authoritative attribution lineage.

Not by:
- visual last hit;
- animation owner;
- presentation object.

---

# 33. AUTHORITY CONTRACT

## AUT-001 — Tier Order
**Status:** `LOCKED`

```text
NORMAL
< PHÁP TẮC
< QUY TẮC
< AXIOM
```

---

## AUT-002 — Authority Only on Direct Conflict
**Status:** `LOCKED CHARACTER-SUPPORTED DEFAULT`

Do not invoke Authority merely because an Ability has a high tier.

Authority resolves when two semantic rules directly conflict.

Ký Ức Skill 1 example:
- select target;
- select skill to Forget;
- check anti-Forget;
- only if direct conflict exists does Authority decide.

Without a conflicting rule, a valid Quy Tắc effect succeeds normally.

---

## AUT-003 — Higher Tier
**Status:** `LOCKED_DEFAULT`

When two directly conflicting rules have different Authority tiers and no special Axiom relation says otherwise:
> higher tier wins the conflicting semantic.

This does not cancel unrelated parts of either Ability.

---

## AUT-004 — Same-Tier Authority Adjudication
**Status:** `LOCKED`

This is **Authority conflict adjudication**, not conflict between Functional Tags themselves.

Adjudication runs only when:
1. two or more rule/effect clauses from **different Characters** directly conflict over the same semantic scope; and
2. the conflicting clauses have the same special Authority Tier:
   - Axiom vs Axiom;
   - Quy Tắc vs Quy Tắc;
   - Pháp Tắc vs Pháp Tắc.

If Authority Tier differs:
> the higher tier wins the conflicting semantic directly; no Rank/Tu vi/Star/Awaken/CP comparison is needed.

Canonical comparison order for same-tier conflict:

```text
Rank
→ Cultivation / Tu vi
→ Character Stars
→ Awaken Count
→ Adjudication CP
```

Rank order uses the project Rank order:
`Prime > UR > SSR > SR > R > N`.

### CP rule
Adjudication CP is the Character's battle-entry / adjudication snapshot CP, not a value continuously rewritten by ordinary in-combat Buffs.

CP is last because:
- Class baselines may naturally yield different CP;
- gear/build affects CP;
- Rank/Tu vi/Stars/Awaken must not be casually overridden by equipment advantage.

### Conflict granularity
Adjudication applies to the **smallest conflicting rule/effect clause**, not to the entire Skill/Ultimate/Passive.

If Skill A contains:
- Rule A1: no Heal;
- Rule A2: -20% ATK;

and Skill B's self-Heal beats A1:
> only the Heal-conflict intersection is exempt. A2 remains active.

### Conflict scope
A winning self-only protection suppresses the losing rule only against that protected Character.

### Persistent vs instant loser
If both sides are persistent rules:
> cache a suppression relation for the exact conflict scope while both remain valid.

If the losing effect is instantaneous:
> it simply fails for that interaction; it does not remain frozen and later “come back”.

### Independent rule pairs
A Character can win one pair and lose another.
Each conflicting clause pair is adjudicated independently.

### Cache
Cache key identifies the exact rule instances and their adjudication revisions, not merely Character pair or Skill pair.

Re-evaluate only when a relevant adjudication input changes:
- Authority Tier;
- Rank;
- Tu vi;
- Character Stars;
- Awaken Count;
- Adjudication CP snapshot/profile;
- Adjudication Owner.

Ordinary combat Buffs that do not change these inputs do not invalidate cache.

### Adjudication Owner
Every authority-bearing rule has an `Adjudication Owner`:
> the Character whose progression profile is used for same-tier comparison.

Ordinary rule:
`Adjudication Owner = Character owning the kit`.

Inherited/summoned/hosted behavior may override explicitly.
Do not infer Adjudication Owner from Damage Attribution.

### Multiple rules
For 3+ rules, build conflict edges only between clauses that actually contradict one another.
A result on edge A↔B does not affect C unless a direct conflict edge exists with C.

### Same Character
Contradictory rules belonging to the same Character do not adjudicate Rank against themselves.
Resolve through explicit exception, internal kit ordering, or Schema validation.

### Exact total tie
If Rank, Tu vi, Stars, Awaken and Adjudication CP are exactly equal:

`NO_OVERRIDE`

For existing protection/status quo against incoming mutation:
> incoming rule cannot override the existing protection.

For simultaneous opposite mutations with no prior state:
> the directly conflicting mutation intersection does not commit.

Do not use iid, slot, RNG, cast order or animation order as arbitrary tie-breakers.

## AUT-005 — Axiom Identity vs Authority
**Status:** `LOCKED`

Being related to an Axiom does not automatically assign AXIOM tier to every Ability.

---

## AUT-006 — Explicit Exception
**Status:** `LOCKED`

An explicit exception overrides only the declared interaction/scope.

It does not grant global immunity.

---

## AUT-007 — Dynamic Authority Sampling
**Status:** `WORKING_PROPOSAL`

Working default:
- sample dynamic Authority at the start of the effect/conflict resolution that uses it;
- keep that sampled tier stable for that atomic effect unless the Ability explicitly says authority changes mid-resolution.

Reason:
prevents one effect from changing its own Authority halfway through a simultaneous commit.

Needs confirmation before freeze for edge cases.

---

# 34. BASIC ATTACK IDENTITY CONTRACT

## ACT-040 — Basic Attack Profile vs Basic Attack Action
**Status:** `LOCKED`

Using Basic Attack Damage Profile does not make an Action a Basic Attack.

Only an Action whose `ActionIdentity = BASIC_ATTACK` qualifies for Basic-Attack-only mechanics.

SSR Warrior Skill 1 therefore:
- copies Basic Attack damage profile;
- does not receive Cuồng Bạo Basic-only effect merely because of formula source.

---

## ACT-041 — Forced Basic
**Status:** `LOCKED`

A Forced Action may have:
- ActionIdentity = BASIC_ATTACK;
- ActionBehavior = FORCED_ACTION.

It is a Basic Attack Action but not a Natural Action by default.

This allows conditions to separately query:
- Basic Attack identity;
- Natural Action status.

Ký Ức Skill 3 explicitly excludes Forced Basic from its 3-Natural-Basic sequence.

---

# 35. KÝ ỨC SPECIAL CONTRACTS

## MEM-001 — Skill 2 Trigger Scope
**Status:** `LOCKED CHARACTER CONTRACT`

After one allied Damage Action completely ends:

1. aggregate Actual HP Damage per enemy caused by exactly that Damage Action;
2. exclude enemy Leader;
3. require damage ≥30% relevant Max HP;
4. if at least one qualifying target and 30 AE is payable:
   - pay 30 AE once;
   - trigger Skill 2 once for whole Action;
5. each still-valid target receives separate True Damage echo = 50% of its Actual HP Damage from that Action.

Not copied:
- Debuff;
- Mark;
- Control;
- Buff;
- Lifesteal;
- Follow-up identity;
- secondary effects.

If target DEATH_CONFIRMED before echo resolves:
> no echo to that target.

Echo itself:
- cannot retrigger Skill 2;
- creates no Natural Action;
- creates no AE;
- does not reduce Skill 1 cooldown;
- is not “damage by ally” for this trigger lineage.

---

## MEM-002 — Skill 3 Natural Basic Sequence
**Status:** `LOCKED CHARACTER CONTRACT`

Sequence requires exactly 3 consecutive enemy **Natural Actions**:

- three different enemies;
- each Action Identity = BASIC_ATTACK;
- each is the Actor's actual Natural Action.

Excluded:
- Follow-up;
- Counter;
- Reaction;
- Summon attack;
- Forced Basic;
- Extra Hit;
- Linked Cast;
- Basic outside natural turn.

A nonqualifying Action breaks sequence.

At third qualifying Action:
- if 15 AE available → trigger;
- if insufficient AE → no trigger and sequence resets.

During cooldown:
> do not record new sequence.

---

## MEM-003 — Forget Duration
**Status:** `LOCKED CHARACTER CONTRACT`

A forgotten Skill remains unavailable for target's next Natural Action opportunity.

If CC consumes that opportunity:
> Forget duration is consumed anyway.

---

# 36. COMBAT INSTANCE / ARENA

## INS-001 — Arena Is a Combat Instance
**Status:** `LOCKED`

Arena is not:
- Field;
- teleport visual;
- independent universe.

It is an isolated Combat Instance with parent relation.

---

## INS-002 — Participant Transfer
**Status:** `LOCKED`

Transferred participants remain their same relevant identities unless Arena mechanic explicitly creates copies.

Transfer itself is not death.

---

## INS-003 — World Axiom Observation
**Status:** `LOCKED CHARACTER-SUPPORTED`

Luân Hồi still observes true death in Arena.

Arena does not invent its own separate death ontology.

---

## INS-004 — Arena-Owned Objects
**Status:** `LOCKED`

Objects created inside Arena belong to that Arena Combat Instance by default.

They do not automatically become objects of Main Battle when Arena closes.

---

## INS-005 — Arena Return / Object Cleanup
**Status:** `REQUIRED_EXPLICIT / partially unresolved`

Arena Contract must define:
- surviving participant return Position;
- full destination fallback;
- object transfer vs cleanup;
- pending lifecycle states.

Known:
Luân Hồi Chi Chủ's Cocoon created in Arena does not automatically transfer to Main Battle without an explicit transfer mechanism.

---

# 37. TEMPORARY ABSENCE

## POS-010 — Absence Is Not Death
**Status:** `LOCKED`

Entering `TEMPORARILY_ABSENT`:
- removes active battlefield presence;
- does not emit DEATH_CONFIRMED;
- does not enter Luân Hồi waiting.

---

## POS-011 — Return
**Status:** `LOCKED PRINCIPLE`

Return attempts to materialize according to explicit Position/occupancy policy.

Return does not grant a bonus Natural Action merely because entity reappeared.

---

# 38. SUMMON / NON-DEATH TERMINATION

## ENT-010 — Summon Identity
**Status:** `LOCKED_DEFAULT`

Summons:
- have iid;
- do not automatically have independent trueSelfId.

---

## ENT-011 — Despawn
**Status:** `LOCKED`

Summon expiry/dismissal:
> DESPAWNED

not DEATH_CONFIRMED by default.

---

## ENT-012 — Fusion Consumed
**Status:** `LOCKED`

Fusion consumption is:
> FUSION_CONSUMED

not ordinary death.

---

## ENT-013 — Remove
**Status:** `LOCKED`

Leaving battle without death:
> REMOVED

---

## ENT-014 — Erase
**Status:** `LOCKED CONCEPT`

Erasure:
> ERASED

does not automatically emit ordinary death semantics unless explicit rule does both.

---

# 39. MATERIALIZATION

## ENT-020 — Materialization Atomicity
**Status:** `LOCKED_DEFAULT`

Identity/life binding + Combat Definition + Presentation Definition + Side + valid Position + initial HP/resources required for one materialization should become visible atomically.

No half-materialized actor.

---

## ENT-021 — Uniqueness Validation Before Commit
**Status:** `LOCKED CHARACTER-SUPPORTED`

If a selected definition/form has Duy Nhất/Uniqueness constraint:
> validate it before materialization commit.

Random selection cannot bypass Axiom by simply choosing an illegal unique definition and committing anyway.

---

## ENT-022 — Invalid Unique Candidate
**Status:** `UNRESOLVED DEFAULT`

Possible policies:
- reroll candidate;
- reject materialization;
- choose another presentation/definition;
depending system.

No global choice yet.

# 39A. DECK DEPLOYMENT CONTRACT

## DEP-001 — Deck Deployment Transaction
**Status:** `LOCKED`

`DEPLOY_FROM_DECK` is a deployment-system transaction, not an Ability Action Cost.

Before commit, validate at minimum:
1. Character has valid membership in the relevant battle Deck
2. Character's current deployment state permits a Deck → Battlefield deployment
3. any additional deployment eligibility conditions pass
4. Deployment Cost is resolved for runtime use
5. Deployment Cost Bar has sufficient value
6. requested Battlefield placement is valid
7. destination can be reserved for the transaction
Important:
Deck membership alone does not prove step 2.
A Deck member may currently be:
already deployed;
dead/waiting;
unavailable;
otherwise deployment-ineligible;
depending on runtime/system state.
This Contract does not define whether a successful deployment changes long-lived Deck membership.
If validation succeeds, one successful deployment transaction commits the required deployment state atomically, including:
Deployment Cost Bar debit
Character deployment-state transition
valid destination Position / active Field Presence
Current Rage = Max Rage
required battlefield registration
Only after successful transaction commit are post-commit Events exposed, including:
DEPLOY_FROM_DECK_COMMITTED
ENTER_FIELD
The ENTER_FIELD observer therefore sees the already-committed deployment state, including full Rage.
The deterministic event trace may assign the two Event records distinct eventSeq values.
That trace order does not by itself define gameplay priority between unrelated listeners responding to those Events.
If deployment fails before commit:
Deployment Cost Bar is not spent;
Character does not become active-present through that attempted deployment;
deployment full-Rage assignment does not commit;
no successful deployment Event is published.
A roster Character deployed this way is not automatically SUMMON.
No new Primitive is required.

## DEP-002 — Deployment Cost Metadata
Status: LOCKED
Deployment Cost is read from Character deployment metadata:
character.deployment.fromDeck.deploymentCost
It is not an Ability CostSpec.
During authoring/Pilot Normalization:
TBD_BY_COST_BUDGET
is permitted as unresolved Cost Budget output.
Runtime deployment requiring actual payment must reject execution-ready content whose Deployment Cost is still unresolved.
This Contract does not define the future Cost Budget formula.

## DEP-003 — Full Rage on Successful Deck Deployment
Status: LOCKED
Only a successful:
Deck-deployment transaction
→ Battlefield active presence
automatically applies:
Current Rage = Max Rage
through the global Deck-deployment rule.
The following do not receive this rule merely because they may also produce ENTER_FIELD:
ordinary Revive;
Return from Arena;
Return from Temporary Absence;
Rebirth;
other non-Deck field-entry transitions.
Full Rage does not auto-cast Ultimate.

## DEP-004 — Deployment Cost Bar Gain Profile
Status: LOCKED INTERFACE / MODE-PROVIDED RATE
Deployment Cost Bar gain behavior is supplied by the active Mode Profile.
The Contract layer does not define one universal gain rate for all modes.
For a mode that supports timed Deployment Cost gain, the active Mode Profile must define the relevant rate and time source.
The current TURN_BASED_MAIN exact rate is defined in 07_MODE_PROFILES.md, not duplicated here.
This Contract does not define:
Cost Bar maximum;
overflow behavior;
pause behavior;
time-scale interaction;
background/offline accumulation.
Those must not be inferred unless a Mode/System Contract explicitly defines them.
## DEP-005 — SSI Eligibility After Deployment

Status: LOCKED
Successful deployment does not itself grant an immediate Natural Action.
After the Character becomes active-present:
if deployed into a Slot the Side's current Natural Pointer has not yet passed in the current Side Pass, it may receive its Natural Action when SSI reaches that Slot;
if deployed into a Slot already passed in that Side Pass, it waits until the next Side Pass;
deployment never grants a second Natural Action merely by changing battlefield occupancy.
This rule applies to roster Character deployment and does not redefine ACT-014 Summon semantics.

---

# 40. IDENTITY / DEFINITION CONTRACT

## IDN-001 — True Self Persistence
**Status:** `LOCKED`

trueSelfId represents persistent Chân Ngã across eligible life transitions.

---

## IDN-002 — Definition Is Not Identity
**Status:** `LOCKED`

Changing Combat Definition does not automatically change trueSelfId.

---

## IDN-003 — Presentation Is Independent
**Status:** `LOCKED`

Changing Presentation Definition does not automatically change:
- Combat Definition;
- trueSelfId;
- stats;
- attribution.

---

## IDN-004 — Inheritance Profile
**Status:** `LOCKED REQUIREMENT`

Combat Definition inheritance must specify/pick a named profile for:

- behavior;
- Class;
- Element;
- stat basis;
- Presentation;
- resources;
- identity;
- attribution.

No blind clone.

---

# 41. QUANG ẢNH CHI HÀ / HISTORY

## HIS-001 — History Snapshot Timing
**Status:** `LOCKED`

Quang Ảnh Chi Hà records a battlefield snapshot after every **complete Action** under its world law.

It records committed gameplay state, not animation frame.

---

## HIS-002 — Snapshot Scope
**Status:** `LOCKED CURRENT DIRECTION`

History snapshot may include:
- Position;
- HP/Max HP;
- Rage;
- AE;
- stats;
- statuses;
- cooldown;
- deck/field/dead state;
- Summons;
- life/death state.

Exact serialization may evolve.

---

## HIS-003 — Full vs Entity Regression
**Status:** `LOCKED`

Full Combat Instance regression and single-entity regression are distinct operations.

---

## HIS-004 — Event History
**Status:** `UNRESOLVED`

Restoring state does not automatically mean:
- un-emitting old Events;
- rewinding RNG streams;
- deleting all trace history.

The project must explicitly define temporal causality semantics before time kits relying on this are implementation-final.

---

# 42. NARRATIVE SYSTEM

## NAR-001 — Story Lifecycle
**Status:** `LOCKED CURRENT CHARACTER DESIGN`

Canonical states:

```text
ARMED
→ CREATED
→ IN_PROGRESS
→ REALIZED
   OR
→ FAILED
```

---

## NAR-002 — Container Is Polymorphic
**Status:** `LOCKED`

Narrative Container can be:
- Deployed;
- Wielded;
- Equipped/Bound;
- Event/Phenomenon.

Do not force one Summon/Object schema.

---

## NAR-003 — Witness Eligibility
**Status:** `LOCKED CURRENT DESIGN`

Default valid Witness:
- has Chân Ngã;
- has HP bar;
- ALIVE;
- present in same Combat Instance;
- meets perception requirement.

Excluded by current design:
- summon/creep without Chân Ngã;
- dead actor;
- Chân Ngã in waiting window;
- actor isolated in another duel/Arena instance;
- object without Chân Ngã/HP bar.

---

## NAR-004 — Witness Count Is Dynamic
**Status:** `LOCKED CURRENT DESIGN`

Witness membership can change as actors:
- die;
- enter/leave Combat Instance;
- change knowledge/perception eligibility.

---

## NAR-005 — Belief Gain Formula
**Status:** `LEGACY WORKING MODEL, NOT USER-LOCKED`

The character document proposes:

```text
Belief Gain = Story Base Rate × Witness Count
```

This is a useful first deterministic model, but source wording presents it as a simple model/recommendation rather than a firm final rule.

Therefore:
> retain as `WORKING_PROPOSAL`, not a universal canonical law.

---

## NAR-006 — Belief Clock
**Status:** `UNRESOLVED / UPSTREAM TURN-BOUNDARY PATCH REQUIRED`

Legacy file says:
> each Turn Boundary of Cố Sự Chi Thần can increase Belief.

But latest global clarification changes Turn Boundary meaning to the boundary between consecutive Natural Actions.

Therefore the intended **personal cadence** must be rewritten as an actor-specific clock, probably:
`NATURAL_ACTION_WINDOW_OF_STORY_OWNER`
or another explicit Story cadence.

Do not use global Turn Boundary until user confirms Narrative cadence.

---

## NAR-007 — Belief vs Stability
**Status:** `LOCKED CURRENT DESIGN`

Belief and Stability are distinct.

Damage to Container does not automatically subtract Belief.

Container damage may reduce Stability.

---

## NAR-008 — Proof / Counter-Proof
**Status:** `LOCKED CONCEPT / story-specific severity`

Proof Event:
> reinforces Story claim/belief.

Counter-Proof:
> contradicts causal claim and can reduce belief/stability or fail Story according to Story profile.

Not every Counter-Proof universally instant-fails every Story.

---

## NAR-009 — Realization
**Status:** `LOCKED CURRENT DESIGN`

A Story can Realize when:
- Belief reaches threshold;
- Story has not FAILED;
- any story-specific proof requirements pass.

Realization converts declared Narrative Property into a real gameplay Property.

---

## NAR-010 — Realization Is Not Auto-Absorb
**Status:** `LOCKED`

Realized Container/property may remain on Bearer/ally.

Absorption is a separate tactical action/transition.

---

## NAR-011 — Property Source Preservation
**Status:** `LOCKED`

If Realized Sword grants True Damage and is later removed/absorbed:
- remove only Sword-sourced True Damage contribution;
- do not remove Bearer's independent native True Damage.

Capability contributions require source tracking.

---

## NAR-012 — Bearer Death After Realization
**Status:** `LOCKED CURRENT CHARACTER DESIGN`

If Realized Container has `ReturnOnBearerDeath`:
- Container/property does not DEATH_CONFIRMED merely because Bearer dies;
- it returns according to Narrative Return policy.

---

## NAR-013 — Bearer Death Before Realization
**Status:** `REQUIRED_EXPLICIT`

If Bearer is mandatory Proof Subject and dies before Realization:
- Story may FAIL;
- or another story-specific transition may apply.

No global default beyond Story profile.

---

## NAR-014 — Knowledge Propagation
**Status:** `LOCKED MODEL SHAPE / delay UNRESOLVED`

Model:

```text
Discovery
→ Delay
→ Propagation
```

Discovery does not instantly make all Witnesses know.

Delay should be deterministic.

Exact delay:
- X Natural Actions;
- actor windows;
- another clock;
remains unchosen.

---

# 43. CAPABILITY QUERY

## CAP-001 — Capability Sources
**Status:** `LOCKED`

Capability query can inspect:

- Functional Tags;
- Ability Schema facets;
- System/Axiom metadata.

`HAS_CAPABILITY` ≠ `HAS_TAG`.

---

## CAP-002 — Source-Specific Contributions
**Status:** `LOCKED`

Capability index must preserve contribution provenance when removal/transfer matters.

Example:
native True Damage + Sword-sourced True Damage are distinct contributions.

---

## CAP-003 — No Lore Inference
**Status:** `LOCKED`

Capability cannot be inferred from:
- Ability name;
- VFX;
- character title;
unless normalized semantic data explicitly says so.

---

# 44. MODE PROFILE CONTRACT

## MOD-001 — Turn-Based Profile
**Status:** `LOCKED CURRENT DIRECTION`

Uses:
- SSI;
- Natural Actions;
- Turn Boundaries;
- full death/Chân Ngã/Luân Hồi systems;
- complex Trigger/Authority interactions.

---

## MOD-002 — Exploration/Defense Profile
**Status:** `LOCKED CURRENT DIRECTION`

Does not use:
- SSI;
- Luân Hồi;
- full turn-based passive complexity.

Uses mode-specific:
- real-time/spatial movement;
- attack speed;
- movement speed;
- weight;
- Rage;
- AE gain from action;
- simplified Character kit.

---

## MOD-003 — Shared Semantics
**Status:** `LOCKED PRINCIPLE`

Shared concepts can still include:
- Damage;
- Heal;
- Shield;
- Resource;
- Position;
- State;
- Character Definition;
- Capability;
where Mode Profile supports them.

A mode does not need to fork terminology just because scheduling differs.

---

# 45. EXPLORATION-MODE UNRESOLVED CONTRACTS

These remain intentionally outside current turn-based freeze:

1. AE ownership;
2. exact action cadence;
3. attack-speed event model;
4. room simulation cadence;
5. local resource persistence;
6. Base movement;
7. Base failure;
8. room respawn timer;
9. Energy conversion loss formula;
10. Rune settlement multiplier rules.

Do not use turn-based Contracts to guess them.

---

# 46. DAMAGE / ACTION EXAMPLE — SIMULTANEOUS AOE

Canonical flow:

```text
Action begins
→ resolve area
→ lock target set
→ capture shared source/target state
→ build all Damage Packets
→ resolve all packets from same state
→ commit batch
→ open HP_ZERO contexts
→ resolve Death Prevention
→ commit DEATH_CONFIRMED outcomes
→ finalize Damage Action aggregate
→ emit Damage Action completion
→ eligible reactions queue
```

This satisfies:
- no target death buffs later target within same AOE;
- Ký Ức can aggregate Action-level Actual HP Damage after deaths are known.

---

# 47. DAMAGE / ACTION EXAMPLE — SEQUENTIAL MULTIHIT

Conceptual:

```text
Hit 1 calculate
→ commit
→ required HP_ZERO/death processing
→ allowed intermediate event/reaction boundary
→ Hit 2 reads current state
→ ...
```

The Ability must specify whether intermediate Reactions:
- resolve immediately between hits;
- queue until full Action completion.

This remains a Resolution profile, not a new Primitive.

---

# 48. SSR WARRIOR POST-ACTION ORDER

## Status: `LOCKED CHARACTER CONTRACT`

Current file explicitly specifies:

```text
Actor completes action
→ HP Loss 1% Max HP
→ +4 Rage
→ check HP_ZERO
→ Death Prevention if any
→ if still alive, continue SSI
```

### Contract patch
Because newest Turn Boundary definition is global boundary between Natural Actions:

the post-action sequence must complete **before** the Turn Boundary that hands control to next Natural Action.

Conceptually:

```text
Natural Action direct completion
→ Warrior post-action HP Loss
→ +4 Rage
→ death evaluation
→ Natural Action fully closes
→ Turn Boundary
→ next Natural Action
```

This preserves the user's stated order without misusing personal Turn Boundary.

---

# 49. SSR WARRIOR TRUE-DAMAGE PASSIVE WINDOW

## Status: `LOCKED SEMANTIC / terminology name patched`

“1 time per own turn” is represented as:

```text
capScope = ACTOR_NATURAL_ACTION_WINDOW
max = 1
```

not:
`once per global TURN_BOUNDARY`.

The cap resets at the actor's next Natural Action opportunity according to `CLK-002`.

---

# 50. SSR WARRIOR OVERHEAL WINDOW

## Status: `LOCKED SEMANTIC / terminology name patched`

Current design:
- max 3 conversion activations per own action window;
- each Heal's Overheal calculated independently;
- conversion exists until next own Natural Action cycle according to its specific duration profile.

Do not aggregate all Overheal across the window and convert once.

---

# 51. AUTHORITY EXAMPLE — SSR WARRIOR ULTIMATE

Outer Ultimate:
- Authority = Pháp Tắc;
- child Skill 1 then Skill 2;
- child Cost waived;
- child conflict uses outer Pháp Tắc for this execution.

Profile:
`childAuthorityPolicy = INHERIT_OUTER`.

Direct casts of Skill 1/2 retain their own original Authority.

---

# 52. AUTHORITY EXAMPLE — LUÂN HỒI CHI CHỦ ULTIMATE

Outer Ultimate:
- invokes child actions;
- child Skills preserve their own Authority;
- child AE cost waived.

Profile:
`childAuthorityPolicy = PRESERVE_CHILD`.

This pair of examples proves Contract policy must be per composite action.

---

# 53. DEATH ORDER & LUÂN HỒI EXAMPLE

Assume waiting threshold = 4.

```text
Death #10: A DEATH_CONFIRMED → A waiting=0
Death #11: B DEATH_CONFIRMED → A=1
Death #12: C DEATH_CONFIRMED → A=2
Death #13: D DEATH_CONFIRMED → A=3
Death #14: E DEATH_CONFIRMED → A=4 → A enters Reincarnation
```

If A revives before threshold:
> its old waiting entry is consumed/cancelled according to Revive/Luân Hồi integration.

If A later dies again:
> create a new death/waiting record for that life.

Exact old-record archival is Kernel detail.

---

# 54. REVIVE VS REINCARNATION RACE

## REC-020 — Revive vs Reincarnation Threshold Race
**Status:** `LOCKED`

World Axiom Luân Hồi bookkeeping caused by committed `DEATH_CONFIRMED` resolves before ordinary queued Reactions.

Canonical order:

```text
qualifying DEATH_CONFIRMED commits
→ update existing waiting ledger / Death Cohort
→ entries reaching threshold enter Reincarnation immediately
→ ordinary queued Revive/Reactions are evaluated afterward
```

If A is at `3/4` and B's qualifying death commits:

```text
A: 3/4 → 4/4
→ A enters Reincarnation
→ later queued ordinary Revive(A) fails
```

If Revive(A) committed before B's qualifying death:
- A returned to life;
- old waiting record closed;
- B's later death does not advance that closed record.

# 55. BATTLE END VS PENDING REACTIONS

## ACT-050 — Leader Death
**Status:** `LOCKED CORE / exact queue cutoff WORKING_PROPOSAL`

True Leader DEATH_CONFIRMED ends battle under turn-based win/loss rule.

Working proposal:
- finish the atomic death commit and mandatory same-commit World Axiom bookkeeping;
- mark Combat Instance terminal;
- cancel ordinary future queued Actions/Reactions that cannot alter already-confirmed battle termination.

Axiom/explicit battle-end prevention mechanics would need earlier intervention before Leader DEATH_CONFIRMED.

Exact terminal cleanup belongs Kernel Runtime.

---

# 56. COMBAT OBJECT DEATH

## DTH-020 — Combat Object HP_ZERO
**Status:** `REQUIRED_EXPLICIT BY OBJECT LIFECYCLE`

Not every Combat Object with HP participates in Character death ontology.

An object's lifecycle profile must state:

- can it DEATH_CONFIRMED?
- does destruction emit OBJECT_BROKEN instead?
- does Luân Hồi observe it?
- does kill attribution exist?
- does it have Chân Ngã?

Narrative Shield Container can use:
`BROKEN → STORY_FAILED`
without pretending it is a dead Character.

---

# 57. PERCEPTION / PRESENTATION

## STA-020 — Presentation Cannot Gate Kernel by Itself
**Status:** `LOCKED`

UI invisibility does not automatically:
- remove candidate eligibility;
- remove geometry;
- create immunity.

Gameplay effects must declare actual:
- Target Exclusion;
- perception filter;
- state.

---

# 58. CONTRACT VERSIONING

Each canonical Contract/profile should eventually have:

```text
contractId
contractVersion
```

Example:

```text
DMG_DEFAULT_V1
SIMULTANEOUS_BATCH_V1
REVIVE_MEMORY_LORD_V1
PYGMALION_INHERITANCE_V1
```

Character source should reference special Contract profiles only when semantics truly differ.

Do not create one unique Contract per Character for ordinary Damage/Targeting.

---

# 59. REQUIRED NORMALIZER CHECKS FROM CONTRACTS

Normalizer must block or warn when:

1. Turn-based duration says only “2 turns” without an explicit clock.
2. old actor-specific `TURN_BOUNDARY` wording is used for a personal cap/window.
3. random target selection lacks duplicate policy where duplicates can change outcome.
4. delayed target resolution lacks an invalid-target policy.
5. child Action Authority inheritance is ambiguous.
6. HP Cost lacks a lethal-floor/payment profile.
7. HP Loss is incorrectly authored as Cost.
8. Max HP Mutation lacks a reconciliation profile.
9. Materialization can encounter full-slot/Uniqueness conflict without a declared policy.
10. sequential Action can expose mid-component Reactions but reaction boundary is unspecified.
11. a damage-threshold outcome depends on Max HP while Max HP can mutate during the same Action, but the threshold reference snapshot is unspecified.
12. Narrative cadence still uses legacy personal “Turn Boundary” wording.
13. same-window unrelated Reactions require gameplay priority but no Trigger priority profile exists.
14. an Axiom/Quy Tắc/Pháp Tắc same-tier conflict lacks a valid Adjudication Owner.
15. a PUPPET is accidentally matched by a SUMMON-only TargetSpec without explicit inclusion.
16. ordinary Revive is authored to increment `lifeSerial` without an explicit Character-specific override.
17. a `naturalActionFormPolicy` has an ambiguous candidate selector or attempts to mutate state/pay Cost/consume RNG during candidate probing.
18. an Action-identity Condition can mean immediate/parent/root Action but does not declare which Action reference is being queried.
19. a provenance-sensitive recursion/echo/reflect rule relies only on Caster, Damage Attribution, or `rootActionId` even though original and generated Effects can share those values.
20. a root-linked blocking settlement graph contains a cycle, depends on an event available only after the same root `ACTION_COMPLETED`, or can recreate an unbounded blocking dependency.
21. an active Skill with ordinary Cost resolves/activates effects before Cost commit without an explicit Cost-timing override.
22. a non-State Effect protection/admission rule has no explicit semantic scope and would therefore behave as accidental all-effect immunity.
23. an Authority threshold used as a simple Effect-admission predicate is incorrectly routed through same-tier Rank/Tu vi/Stars/Awaken/CP adjudication without a direct rule conflict.

# 60. WHAT IS ACTUALLY LOCKED ENOUGH NOW

The following foundational behavior is sufficiently stable for Kernel planning:

- SSI alternates Natural Actions by independent Side pointers.
- Non-natural Actions do not advance SSI by default.
- Turn Boundary is between consecutive Natural Actions.
- personal caps/durations use actor Natural Action windows/clocks.
- Target Selection is separate from Area Resolution.
- direct Target Exclusion does not block fixed Area hit.
- deterministic RNG with explicit Candidate Set.
- simultaneous batch uses shared snapshot and delayed batch commit.
- sequential resolution can observe prior committed state.
- HP Cost ≠ HP Loss ≠ Damage.
- Physical / Will / True components remain distinct.
- True Damage does not automatically pierce Shield.
- Actual HP Damage excludes Shield and Overkill.
- Death Prevention precedes DEATH_CONFIRMED.
- Revive is post-DEATH_CONFIRMED.
- Luân Hồi waiting is death-order based and standard threshold is 4 later qualifying deaths.
- Reincarnation is distinct from Revive.
- Materialization is separate from life semantics.
- Identity / Presentation / Combat Definition are separate.
- Behavior Source / Damage Attribution are separate.
- child Authority supports preserve vs inherit outer.
- Pygmalion uses lifecycle quota, not singleton Puppet.
- Arena is a separate Combat Instance.
- Story/Belief/Stability/Proof/Realization are separate Narrative state axes.
- Capability query uses Tags + Schema facets + system metadata.
- an SSI-granted Natural Action may use a declarative Action-form restriction/fallback policy without becoming a Forced Action.
- ordered Action-form candidate probing is read-only; only the selected candidate may pay Cost or enter execution.
- active Skill Cost commits before Skill activation by default unless an explicit Contract overrides timing.
- Action lineage and Effect provenance are separate query axes; shared root Action does not imply same generating Effect.
- scoped non-State Effect Admission may gate effects such as Shield without creating universal all-effect immunity.
- root-linked blocking settlements may delay one root Action's `ACTION_COMPLETED` through a bounded local dependency DAG without defining global Reaction priority.

---

# 

These are the important remaining blockers. They must not be hidden.

## Combat/ordering
1. global same-window Trigger priority.
2. exact intermediate Reaction boundary for sequential multihit.
3. exact battle-terminal queued Reaction cancellation.

## Damage
4. True Damage vs Final Damage Reduction.
5. multiple Shield instance priority.
6. default Max-HP reference for damage threshold when Max HP mutates mid-action.

## Authority
7. same-tier Authority conflict.
8. final Dynamic Authority sampling rule confirmation.

## Revive/materialization
9. global Revive lifeSerial default.
10. default full-slot materialization policy.
11. default invalid Duy Nhất materialization policy.

## Luân Hồi
12. simultaneous deaths and “4 later deaths” ordering confirmation.
13. exact Revive-vs-threshold race confirmation.

## Pygmalion
14. inherit Class.
15. inherit Element.
16. inherited secondary-effect Attribution.
17. exact inhabited Puppet Revive semantics.
18. exact Puppet object classification (`SUMMON` or special Combat Unit).

## Narrative
19. Belief cadence after Turn Boundary terminology correction.
20. Belief formula finality.
21. Knowledge Propagation delay.
22. Story-specific Counter-Proof severity defaults.
23. Realized Property Authority default.

## Exploration mode
24. AE ownership.
25. real-time Action cadence and remaining economy contracts.

# 61. HARD UNRESOLVED LIST BEFORE FREEZE

These are the important remaining blockers after revision F.1. They must not be hidden.

## Combat / ordering
1. global same-window Trigger priority across unrelated Reactions.
2. default intermediate Reaction boundary for sequential multihit.
3. exact battle-terminal queued Reaction cancellation.

## Damage / materialization
4. default Max-HP reference for damage thresholds when Max HP mutates mid-Action.
5. default full-slot materialization fallback.
6. default invalid Duy Nhất materialization policy.

## Authority
7. final confirmation of dynamic Authority sampling policy for edge cases that intentionally change tier during one atomic resolution.

## Narrative
8. personal Narrative cadence after Turn Boundary terminology correction.
9. final Belief formula.
10. Knowledge Propagation delay.
11. Story-specific Counter-Proof severity defaults.
12. Realized Property default Authority.

## Exploration mode
13. AE ownership.
14. real-time Action cadence and remaining economy/lifecycle contracts.

### Resolved since the older blocker list

The following are no longer unresolved:

- True Damage vs Final Damage Reduction.
- Standard multi-source Shield absorption.
- same-tier special Authority adjudication.
- global ordinary-Revive `lifeSerial` default.
- simultaneous Death Cohort semantics.
- Revive-vs-Reincarnation threshold race.
- Pygmalion Class inheritance.
- Pygmalion Element non-inheritance.
- Pygmalion secondary-effect default Attribution.
- inhabited Puppet ordinary Revive.
- Puppet entity-kind classification.

# 62. STAGE F STRESS TEST — SIMPLE DAMAGE

Input:

```text
Natural Basic Attack
1 enemy
100% ATK Physical
```

Contract path:

```text
ACT-010 Natural Action
→ CST-001 Cost (none)
→ TGT-001 candidate pool
→ TGT selection
→ SNP snapshot
→ DMG-001/002
→ SHP-001
→ DMG-010/011
→ RES commit
→ DTH pipeline if HP_ZERO
→ Action completed
→ SSI pointer advance
→ CLK-001 Turn Boundary
```

No Character-specific code needed.

---

# 63. STAGE F STRESS TEST — FORGOTTEN FIXED AOE

Input:
- Forgotten actor cannot be direct-targeted.
- enemy full-board AoE.

Contract:

```text
direct targeting:
TGT-002 removes Forgotten from Candidate Pool

full-board area:
TGT-010 resolves geometry
→ Forgotten position is occupied
→ actor included in area
→ damage resolves normally
```

No immunity contradiction.

---

# 64. STAGE F STRESS TEST — PYGMALION MULTIPLE PUPPETS

Pygmalion dies/revives/enters next Life Cycle while old Puppet survives.

Contract:

```text
new Life Cycle initializes new quota scope
→ ENT-001 quota allows one CREATE_PUPPET in this new Life Cycle
→ old Puppets are not queried by quota
→ new Puppet can be spawned
```

Correct state:
> old Puppet(s) + new Puppet can coexist.

---

# 65. STAGE F STRESS TEST — MEMORY ECHO

One allied AoE hits five targets.

Contract:
- all damage calculated simultaneously if AoE profile says so;
- batch commits;
- target deaths are confirmed;
- Damage Action aggregate finalizes;
- Ký Ức Trigger evaluates once for root Damage Action;
- cost paid once;
- dead targets already DEATH_CONFIRMED are invalid;
- each surviving qualifying target gets independent echo amount from its own Actual HP Damage.

This is representable without bespoke Memory-God damage loop.

---

# 66. STAGE F STRESS TEST — COMPOSITE AUTHORITY

Two Ultimates use the same child Skill machinery.

Character A:
`childAuthorityPolicy = PRESERVE_CHILD`.

Character B:
`childAuthorityPolicy = INHERIT_OUTER`.

Both resolve through same Action/Authority infrastructure.

Therefore no Character-specific runtime branch is required.

---

# 67. STAGE F STRESS TEST — STORY SWORD

Before Realization:
- Bearer already has native True Damage.
- Sword Story claims Sword causes it.

Witness eligibility and prior knowledge determine Belief contribution.

After Realization:
- Sword becomes a true property source.

If Sword later absorbed:
- source-specific capability contribution removed;
- native True Damage remains.

No global “remove TRUE_DAMAGE tag from Bearer” operation is allowed.

---

# 68. CONTRACT ANTI-PATTERNS

Reject these designs:

## Anti-pattern A
“After animation finishes, do damage.”

Reason:
presentation drives gameplay.

## Anti-pattern B
“On any HP decrease, trigger Damage Taken.”

Reason:
HP Cost/HP Loss incorrectly become Damage.

## Anti-pattern C
“True Damage always ignores everything.”

Reason:
True Damage ≠ Shield Piercing and Authority remains separate.

## Anti-pattern D
“Untargetable = invulnerable.”

Reason:
Target Selection ≠ Area Resolution.

## Anti-pattern E
“Revive catches HP_ZERO.”

Reason:
Death Prevention ≠ Revive.

## Anti-pattern F
“One Puppet per life means one Puppet exists.”

Reason:
Lifecycle quota ≠ active singleton.

## Anti-pattern G
“Outer Ultimate authority applies to all children.”

Reason:
existing characters require both policies.

## Anti-pattern H
“Every reaction executes instantly inside current calculation.”

Reason:
can break atomicity/shared-snapshot semantics.

## Anti-pattern I
“Same-tier Authority uses execution order because it is deterministic.”

Reason:
determinism is not semantic justification.

---

# 69. CONTRACT TRACE REQUIREMENTS

Every important resolution should be explainable from trace:

```text
eventSeq
combatInstanceId
rootActionId
actionId
parentActionId
actor
actionIdentity
actionBehavior
naturalActionStatus
turnBoundarySeq
snapshotRefs
candidatePool
targetSet
rngDraw
costValidation
costCommit
primitiveId
authoritySample
authorityConflict
stateDelta
damagePacket
shieldAbsorbed
actualHpDamage
overkill
hpZero
deathPrevention
deathConfirmed
deathSequenceIndex
trueSelfId
lifeSerial
reincarnationWaitingProgress
triggerCandidate
reactionOrder
materialization
attribution
```

A user/debugger should be able to answer:
> “Why did this happen?”

without reading animation code.

---

# 70. CONTRACT FREEZE POLICY

Do not freeze `05_CONTRACTS.md` as final until:

1. hard unresolved list is reduced enough that common kits do not hit ambiguous branches;
2. 10–20 hard kits are normalized against it;
3. same semantic is not solved differently by Character-specific hacks;
4. event trace reproduces exact expected interactions;
5. the latest Turn Boundary correction is patched into upstream files.

---

# 71. UPSTREAM PATCH LEDGER

Before `06_KERNEL_RUNTIME.md` is treated as freeze candidate, patch:

## `01_TERMINOLOGY_vNext.md`
Replace actor-exclusive Turn Boundary definition with:
- `TURN_BOUNDARY` = boundary between consecutive SSI Natural Actions;
- add/rename personal actor clock concept.

## `04_ABILITY_SCHEMA.md`
Duration examples using:
- `TURN_BOUNDARY_OF_OWNER`
- `TURN_BOUNDARY_OF_TARGET`

should migrate to:
- `NATURAL_ACTION_OF_OWNER/TARGET`
- `ACTOR_NATURAL_ACTION_WINDOW`
where the mechanic is personal.

Global `TURN_BOUNDARY` remains available for truly boundary-wide mechanics.

## `Arclune_SSR_Warrior...`
Legacy text can remain source history, but normalized canonical representation must map “own Turn Boundary” semantics to actor Natural Action Window.

## `Co_Su_Chi_Than...`
Legacy “Turn Boundary of Cố Sự Chi Thần” cadence must be reviewed and renamed to an explicit personal clock if that was the intended meaning.

---

# 72. STAGE F VERDICT

The Contract layer now proves that the current architecture can express the hardest known classes of behavior without collapsing:

- semantic meaning;
- execution operation;
- timing;
- identity;
- source;
- authority;
- lifecycle;
- targetability;
- presentation.

It also exposes where the project genuinely lacks a decision rather than concealing the gaps.

That is intentional.

A Contract Registry with visible unresolved branches is safer than a “complete” file containing model-invented defaults.

---

# 73. NEXT STAGE GATE

Do **not** finalize `06_KERNEL_RUNTIME.md` as if every rule above were fully frozen.

The correct next sequence is:

```text
Stage F
→ patch upstream Turn Boundary terminology/schema
→ optionally resolve highest-risk unresolved contracts
→ Stage G: 06_KERNEL_RUNTIME.md
```

Kernel Runtime should then implement:
- Action Scheduler;
- Event/Reaction Queue;
- Transaction/Commit;
- SSI adapter;
- Damage/Death pipeline;
- identity/lifecycle stores;
- Combat Instance manager;
- deterministic RNG;
- Snapshot history;
- Execution Trace;

without embedding Character-specific behavior.

---

# 74. FINAL CONTRACT CHECKSUM

A model understands this file only if it can preserve all of these simultaneously:

1. Turn Boundary is between consecutive Natural Actions globally under SSI.
2. “Once per own turn” uses actor Natural Action window, not every global Turn Boundary.
3. CC can consume a Natural Action opportunity without executing an Action.
4. Follow-up can be a Basic Attack Action while still not being a Natural Action.
5. Target Exclusion does not block fixed AOE.
6. Shared-snapshot AOE calculates all before batch commit.
7. Sequential hits may read changed state.
8. HP Cost is not Damage.
9. Non-Cost HP Loss is not HP Cost.
10. True Damage does not automatically pierce Shield.
11. Actual HP Damage excludes Shield and Overkill.
12. HP_ZERO does not grant kill.
13. Death Prevention occurs before DEATH_CONFIRMED.
14. Revive happens only after DEATH_CONFIRMED.
15. Revive HP assignment is not Heal.
16. Luân Hồi waiting advances by later qualifying DEATH_CONFIRMED events, not wall time.
17. Standard waiting threshold is four later qualifying deaths.
18. Summons without Chân Ngã do not count by default toward that death order.
19. Reincarnation and Revive are distinct.
20. Presentation and Combat Definition are independent.
21. Behavior Source and Damage Attribution can differ.
22. Outer Authority may or may not pass to child Action based on policy.
23. Higher Authority matters only on semantic conflict, not as a generic power multiplier.
24. Same-tier Authority is still unresolved and must not be guessed.
25. One Pygmalion Puppet per Life Cycle does not limit total existing Puppets to one.
26. Arena objects remain owned by Arena instance unless transferred.
27. Story Belief and Stability are separate.
28. Realized property removal removes only its own capability contribution.
29. Determinism does not justify inventing gameplay semantics.
30. Unknown contract decisions stay visible as unresolved instead of being silently filled.

If a future model violates one of these:
> it should not be allowed to freeze Kernel behavior for Arclune.
