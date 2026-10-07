# ARCLUNE — CONTRACT REGISTRY
## Chặng F — Deterministic Resolution Contracts
**Version:** 2026-10-07-F.17
**Status:** Working Canonical Candidate  
**Depends on:** `01_TERMINOLOGY_vNext_PILOT4_MERGED.md`, `02_TAG_vNext.md`, `03_PRIMITIVE.md`, `04_ABILITY_SCHEMA-1.md`, `00_CANONICAL_RECOVERY_AUDIT-1.md`
**Primary source corpus:** project rules already established in conversation + standardized character files for Hoá Thân Ký Ức Chi Chủ, Luân Hồi Chi Chủ, Cố Sự Chi Thần, SSR Warrior True Damage/Overheal, and current Pygmalion rules.  
**Revision F.1:** incorporates approved Shield pooling, Authority Adjudication, Death Cohorts, Revive/Reincarnation race, global lifeSerial default, and Pygmalion rulings.
**Revision F.2:** incorporates Pilot Normalization #3 approved Contracts for bounded Action Intent interposition/revalidation, dynamic distributed Cost payment, typed committed Cost-payment results, scoped Effect-amount modifiers, and explicit sequential Reaction-boundary profiles. No new Functional Tag or Primitive is introduced.
**Revision F.3:** incorporates Pilot Normalization #4 Contracts for static-Passive battle initialization, scoped incoming Damage-component type transformation before mitigation, battle-scoped Current Character Deployment Cost, explicit Return-to-Deck with transition-owned retention cleanup, and deterministic metric-selector tie policy. No new Functional Tag or Primitive is introduced.
**Purpose:** turn semantic declarations into deterministic resolution rules without turning Character data into code.

**Revision F.4:** adds checkpoint-scoped committed-result observation, Shield addition receipts/source-family caps and local explicit Slot ties. Existing Pilot #4 random-tie behavior and proportional Shield pooling remain unchanged.
**Revision F.5:** corrects typed result observation/zero-addition law; adds ACT-033 required post-completion handoff and DMG-008 bounded final amplification/direct-Action scope. No new Tag/Primitive or global priority.
**Revision F.6:** adds CST-014 bounded singular HP-payment profiles and CST-015 explicit Cost-caused lifecycle continuation; extends CST-009 with immutable resulting HP at payment commit. Existing default/exact/distributed Costs and prior Pilots remain unchanged.
**Revision F.7:** adds DTH-007 transition-completed prevention atomicity; repairs the distinct Summon Identity Contract to ENT-015 while preserving Puppet death/ordinary Revive at ENT-010 and every other ID. Both blocks were already present at initial tracked commit 8a9876e; neither is obsolete. No universal legacy ENT-010 alias is valid: migrated Summon references use ENT-015, Puppet references retain ENT-010.
**Revision F.8:** adds opt-in DTH-008 direct Execute, RES-007 own-family baseline, RES-008 shared-recipient proportional Damage, SNP-006 pre-Cost capture, DMG-009 mitigation-stat override and local CostGroup scope of CST-015 continuation. Ordinary pipelines/profiles remain unchanged.

**Revision F.10:** adds DMG-034 opt-in reflected scalar Damage: committed source-local received basis, ARM/RES bypass then matching Final DR/ordinary Shield, separate reflected receipt/lineage and existing source grouping. DMG-030–033 defaults and ordinary component profiles remain intact.

---

**Revision F.11:** adds TGT-008 Position-binding/default precision, POS-008/009 bounded relocation/deferred-counter/truly-empty law, DMG-035 isolated Damage projection, TRG-016 stable-health mandatory settlement and ACT-034 opportunity-start dependency. All prior IDs/profiles remain intact; no new Tag/Primitive or global priority.

**Revision F.12:** refines ACT-034's captured-value lifetime through authored normal State termination and DMG-035's pre-Damage eligibility/mandatory atomic terminal credit. No new Contract ID, Tag, Primitive or ordering between unrelated settlements.

**Revision F.13:** refines only TGT-008 with per-attack-owner Slot defaults, exact authored Entity/Both exceptions, non-propagation and Entity-tracking presentation. No new Contract ID, Tag or Primitive; previously approved exact-owner locks remain intact.

**Revision F.14:** extends existing REC-001 with a bounded live positive waiting-threshold contribution and coherent presence/death/all-entry checkpoint; REC-004/020 retain cohort and before-ordinary-Revive law. No new Contract ID, Tag, Primitive, generic Reaction priority or default Shield/Revive policy.

**Revision F.15:** extends existing SHP-002/HEL-003/TRG-016/CST-011 with bounded opt-in first-family depletion, per-Heal Shield-conversion denial, stable predicate checkpoints and atomic Rage-limit/current reconciliation. Unprofiled law and all prior IDs remain unchanged; no global priority, Tag or Primitive.

**Revision F.16:** extends existing SHP-002/006 with one opt-in recipient exact-family/complement partition: shared remainder cap, separate matched cap and explicit remainder-first proportional depletion. Existing admission, receipts, source lifetimes and prior profiles remain unchanged; no new Contract ID.

**Revision F.17:** extends existing TRG-001/002 and ACT-040 with complete-cohort local settlement and restricted Basic projection/frozen binding. Existing cohort/world-law, attribution, target binding, State/Spawn/clock/Shield and unprofiled behavior remain unchanged; no new Contract ID or global priority.

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

## ACT-004 — Action Intent Is Not an Admitted Action
**Status:** `LOCKED`

Canonical distinction:

```text
ACTION INTENT / REQUEST
≠
ADMITTED ACTION
```

`ACTION_REQUESTED` may establish an Action Intent describing what the player, autonomy policy, or other legal decision source currently requests.

An Action Intent may preserve at minimum the semantic identity needed to later test the request, such as:

- requesting Actor;
- requested Action Identity;
- requested Ability or authored selector;
- originating Natural Action opportunity where applicable;
- other already-authored request context.

Creating or preserving an Action Intent does **not** by itself mean that the requested Action:

- passed legality checks;
- passed prerequisites;
- has a payable Cost;
- has valid mandatory targets;
- has committed Cost;
- emitted `ACTION_BEGIN`;
- resolved any Effect;
- became an admitted Action.

No Cost or Effect may commit merely because an Intent exists.

### Ordinary path

If no matching `ActionIntentInterpositionSpec` requires a pre-admission interposition:

```text
Action Intent
→ ACT-002 Action Admission
→ applicable Cost Contract
→ admitted Action execution
```

### Pre-admission interposition exception

If authored data declares a matching:

```text
PRE_ADMISSION_PRE_COST
```

interposition:

> ordinary legality / prerequisite / payability probing must not discard the preserved original Intent before that declared interposition receives its opportunity to settle.

The Intent remains a request, not an admitted Action, during that settlement.

After the settlement, admission may be performed or re-performed according to `ACT-005`.

### Natural Action identity

When the Intent belongs to one SSI-granted Natural Action opportunity:

- creation of the Intent does not create another Natural Action;
- an interposition settlement does not create another Natural Action;
- an explicitly authored fallback selected after revalidation remains inside that same granted Natural Action opportunity unless another Contract explicitly says otherwise.

This Contract does not define global Trigger/Reaction priority.

---

## ACT-005 — Bounded Action Intent Interposition and Revalidation
**Status:** `LOCKED`

This Contract resolves normalized `ActionIntentInterpositionSpec`.

It supports exactly the canonical interposition anchors authored by Schema:

```text
PRE_ADMISSION_PRE_COST
POST_COST_PRE_EFFECT
```

It does not authorize arbitrary Action-pipeline hooks.

---

### A. Intent scope, matching multiplicity, and one-time branch selection

Only an interposition whose authored `intentScope` matches the current Action Intent may participate.

Branch selection occurs at the authored canonical timing:

```text
ACTION_INTENT_CREATED
```

Branch conditions are evaluated once against the authoritative state at that point.

For one `ActionIntentInterpositionSpec`:

> current canonical semantics require at most one branch to match one Action Intent.

If more than one branch matches the same Intent:

> authored/normalized data is invalid unless a future explicit branch-selection policy defines that composition.

The Kernel must not resolve branch ambiguity through:

- authored list order;
- Ability list order;
- Event sequence;
- Character ID;
- insertion order;
- incidental iteration order.

Likewise, at one canonical interposition anchor:

> current canonical semantics permit at most one applicable interposition instance for the same Action Intent unless an explicit future composition/dependency policy exists.

If multiple independent interposition instances match the same Intent + anchor without such a policy:

> validation must reject the ambiguity.

This Pilot does not invent priority between interpositions.

After one valid branch is selected:

> later HP, resource, State, Cost, or settlement changes during the same admission sequence do not retroactively select another branch.

The selected branch remains authoritative for that Intent.

---

### B. `PRE_ADMISSION_PRE_COST`

Canonical flow:

```text
Action Intent exists
→ select matching interposition branch
→ preserve original Action Intent
→ settle declared interposition settlement
→ if declared, revalidate preserved original Intent
→ if original Intent passes:
     admit original Intent
     → ordinary Cost / Action pipeline
  else:
     evaluate explicitly authored fallback candidates
```

Before the interposition settlement:

- ordinary prerequisite failure must not discard the preserved Intent;
- ordinary Cost unaffordability must not discard the preserved Intent;
- ordinary mandatory target probing must not finalize rejection of the preserved Intent when that property is part of the later declared revalidation.

The settlement may mutate authoritative state/resources according to its own Ability/Trigger/Cost Contracts.

If the settlement is Passive/Triggered/Automatic:

> its Cost follows `TRG-003` and its explicit settlement timing, not `CST-007` merely because its source Ability may be named a Skill.

The settlement does not consume an additional Natural Action.

---

### C. Revalidation

If:

```text
revalidationPolicy = REVALIDATE_ORIGINAL_INTENT
```

the preserved original Intent is tested against the **current authoritative state after the interposition settlement**.

Revalidation checks the admission dimensions that would normally matter for that requested Action, including as applicable:

- lifecycle/presence eligibility;
- Mode legality;
- Action-form restriction;
- Ability prerequisites;
- required pre-cost target legality;
- Cost payability.

Revalidation is a test of the original request.

It does not itself:

- pay Cost;
- begin the Action;
- resolve Effects;
- choose a different Action.

If revalidation succeeds:

```text
original Intent
→ ACT-002 admission
→ applicable Cost Contract
→ Action execution
```

---

### D. Revalidation failure and fallback

If original Intent revalidation fails:

> only explicitly authored fallback candidates may be evaluated.

Fallback candidate probing follows the read-only semantics of `ACT-003`.

There is no global rule:

```text
failed Skill / Ultimate
→ BASIC_ATTACK
```

A Basic Attack is used only when authored data explicitly supplies Basic Attack as a fallback candidate.

If a fallback is selected:

- it uses the same SSI-granted Natural Action opportunity;
- it enters its ordinary Action Admission / Cost / Target / Resolution pipeline;
- failed original Intent Cost is not paid merely because that Intent was requested.

If no authored fallback is legal:

> use the declared fallback/no-candidate policy.

The Kernel must not invent another fallback.

---

### E. Interposition settlement failure

Current Schema policies are:

```text
CONTINUE
FAIL_INTENT
```

`CONTINUE` means:

> failure of the interposition settlement itself does not automatically cancel the preserved original Intent.

Example:

```text
interposition settlement cannot pay its own Cost
→ settlement produces no successful Effect
→ preserved original Intent continues to the declared revalidation/admission step
```

`FAIL_INTENT` means the enclosing Intent/Action path stops at this interposition boundary according to authored data.

No automatic refund is implied.

---

### F. `POST_COST_PRE_EFFECT`

Canonical flow:

```text
Action Intent
→ ordinary Action Admission
→ complete the entire declared active Cost transaction
→ settle declared interposition settlement
→ original admitted Ability direct Effects may begin
```

The original Action is already admitted at this anchor.

For an ordinary singular/fixed Cost Ability:

```text
complete Cost transaction
=
validate required Cost
→ commit required Cost
```

For a distributed CostGroup under `CST-008`:

```text
complete Cost transaction
=
validate required Costs
→ snapshot optional payer collections
→ commit required Costs
→ attempt every frozen optional payer Cost
→ create all member payment results
→ construct declared CostGroup payment result / aggregates
```

Therefore:

> committing only the required subset does not mean the active Cost stage has finished when distributed optional payer work remains.

Neither the `POST_COST_PRE_EFFECT` settlement nor the original Ability's first direct Effect may begin while that declared active Cost transaction is incomplete.

After the full Cost transaction reaches a terminal result:

```text
complete Cost transaction
→ declared POST_COST_PRE_EFFECT settlement
→ first direct Ability Effect
```

If the original Ability has no active Cost:

```text
ordinary Cost stage completes with no payment
→ declared interposition settlement
→ direct Ability Effects
```

No fake Cost is created.

`REVALIDATE_ORIGINAL_INTENT` is not a rewind mechanism for `POST_COST_PRE_EFFECT`.

This anchor does not reopen ordinary admission merely because the settlement changed state.

Any separate rule that can invalidate an already-admitted Action must use its own explicit Contract.

---

### G. Cost already committed at post-cost anchor

At `POST_COST_PRE_EFFECT`, the declared active Cost transaction is already terminal.

If the interposition settlement then stops the already-admitted Action before its direct Effects:

> committed Cost is not automatically refunded.

Refund follows `CST-005`.

A failed or cancelled post-cost settlement must not retroactively rewrite already-produced:

- singular Cost payment results;
- distributed member payment results;
- CostGroup payment results.

Those committed results remain authoritative transaction history.

---

### H. Boundedness and priority boundary

One interposition instance is bounded to its matching Action Intent and authored branch.

It must not become:

- an arbitrary callback;
- arbitrary stage jumping;
- an unbounded loop;
- repeated self-reentry;
- a second Natural Action;
- a hidden `FORCED_ACTION`.

Fallback caused by this interposition does not recursively re-run the same interposition instance unless a separate bounded authored rule independently matches and is legal.

This Contract establishes only the local dependency:

```text
declared interposition
→ required admission/effect boundary
```

It does not establish global priority among unrelated Reactions/Triggers.

`TRG-005` remains unchanged.

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

## ACT-033 — Required Post-completion Settlement before Natural-Action Handoff
**Status:** `LOCKED`

`trigger.postActionSettlement` declares finite required work in the existing ACT-001 post-action phase. The observed Action has already emitted ACTION_COMPLETED and defaults to an actual Natural Action in the same Combat Instance. Completion dispatch registers the owner/candidate-scoped obligation before scheduler handoff. Eligibility observation and any created settlement resolve to terminal status before TURN_BOUNDARY/next Natural Action opportunity can proceed.

Explicit completionSourcePolicy ALLOW_COMPLETED_NON_NATURAL permits an actually completed non-Natural source in the same Combat Instance. Register its finite observation-scoped work with that instance's existing next-Natural handoff gate, including when a parent Action is still executing or the source completed between Natural opportunities. The source/parent is not retroactively blocked or made Natural; unrelated parent direct work keeps its declared law. Only the next Natural start/handoff must wait for this obligation to become terminal. Keys use this completed observed Action/owner/candidate, never a guessed enclosing Natural Action. No cross-instance observation or future-Action wait. Existing NATURAL_ONLY observers retain their restrictions and timing.

This obligation blocks **handoff**, not the already-completed Action. Existing rootCompletionDependency remains pre-completion and is not reused cyclically. A skipped condition or clean failed activation closes the obligation under existing failure semantics; no automatic refund or retry is inferred. Consume/create mutation and its execution identity use the existing transaction boundary; replay cannot create another settlement after consumption. Once created, apply its declared settlement validity/lifetime, not a second Trigger availability check that reverses creation.

Keys include observed Action, runtime trigger owner, instantiated candidate and local dependencyId. Local edges are limited to this same completion observation (and opportunity for the default Natural source), must form a bounded DAG and cannot await a next Action or boundary being held. Terminal observation/settlement records, including clean nonqualification/failure, survive the supported replay horizon. Original committed Event + observed Action/checkpoint + trigger definition/runtime owner identifies redelivery before a new candidate is allocated; preserve the original candidate identity rather than let a fresh ID bypass idempotence. No order between unrelated observers/Reactions is added; if competing work needs observable ordering, an existing explicit law is still required. Mode support requires the same Natural Action/post-action abstraction or explicit 07 adaptation. Reject malformed/cyclic content before execution; malformed IR fails closed at this boundary without advancing into an unfinished obligation.

---

## ACT-034 — Required Owner-opportunity-start Settlement before Control
**Status:** `LOCKED FOR EXPLICIT OPPORTUNITY-START PROFILES`

After SSI/Mode grants an owner's Natural Action opportunity, register and finish its declared finite opportunityStartSettlement before ordinary CC, selection or Action admission for that same grant. A retained State's first later grant is anchored by owner + Combat Instance + opportunity serial greater than its creation serial; it cannot consume a still-open creation opportunity. Existing grants/actor-window reset bookkeeping are preserved; this profile neither creates a grant nor advances SSI twice.

A CC-lost opportunity still runs the required start settlement, then follows ACT-012 with no actual Natural Action or completion. Completion-based refresh/durations/class gain remain unchanged. State termination at a retained reserved coordinate is not POS-010/011 materialization when Field Presence/occupancy never left. Heal, if authored, follows ordinary HEL-* rules and is terminal before control continues. Death/leave/State retirement cancels work according to its lifetime, never applying it to a new owner instance.

An authored termination graph may capture declared State values through existing Snapshot semantics before it removes that State. The graph's own expected normal removal does not invalidate its already-registered remaining work or those immutable bindings. Keep the original owner/Combat Instance/life/presence, State instance and grant identity until terminal settlement. Consumers after removal use the captured value, not a live counter on the retired State or a newly created replacement. Death/leave or unrelated retirement before this handoff still cancels as authored; subsequent owner-instance invalidity cannot Heal a replacement presence. A blocked/zero Heal closes the same settlement without restoring the removed State or creating a retry. Other live formula operands/modifiers retain their declared checkpoints.

Keys include owner/instance, observed grant, retained State and dependency. Conditions/clean failure close finite work; no waits on the held grant's future Action, cyclic edges, fake Actions or cross-instance dependencies. Multiple observable competing settlements require explicit composition, not queue priority. Save/resume completes this same grant/settlement once. Other Modes must supply the same opportunity abstraction or explicit 07 adaptation; do not convert it to seconds.

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

### Opt-in complete-cohort local settlement

04§7.17 is one finite Trigger settlement of the **complete original confirmed-death batch**, not one activation per member Event. Existing cohort/batch identity and immutable death results supply membership; REC-004's Luân Hồi-qualified subset/count is unchanged. Pin the registered owning presence and required subject/relation-anchor facts at the original confirmation checkpoint; later registration/Side change/reentry does not retroactively qualify. Retain requested authoritative death-position/Basic-FORM inputs before cleanup/recovery; do not reconstruct from current live entities.

After mandatory cohort lifecycle/presence/world-ledger work is coherent, apply the whole-cohort owner gate. EXCLUDE_OWNER_CONFIRMED_IN_COHORT closes the candidate as clean nonqualification, without entry mutation or enclosing Action failure, if that owner was confirmed in the original cohort; earlier publication cannot process a prefix and later recovery cannot undo the gate. Revalidate the exact owning Field Presence. Entry filters use pinned death facts/explicit relation anchor.

Freeze the complete eligible set and bind one deterministic seeded permutation for that owner-presence/Trigger/cohort. Set enumeration/Slot/Entity/Event order supplies no priority. Run finite entry graphs in that order, with required lifecycle between commits; local failure preserves earlier commits and follows declared continuation, not inferred outer failure/refund. No ordinary Reaction window is introduced between this settlement's dependent steps. Unrelated work gets no priority from this profile; observable conflicts without an explicit law remain REQUIRED_EXPLICIT/rejected.

Required finite checkpoint work closes before dependent Action/SSI continuation. It creates no Natural opportunity/extra Action, changes no prior simultaneous calculation, and does not advance Luân Hồi by its private permutation. Deduplicate individual Event delivery against one candidate and protected per-entry progress. Save/resume reuses membership/permutation/inputs/terminal decisions, never recreates evicted records, respawns failed entries or retries a consumed death. Owner leave cancels only uncommitted work under its actual cause.

## TRG-002 — Trigger Evaluation Snapshot
**Status:** `LOCKED_DEFAULT`

A Trigger evaluates using authoritative state at its event's committed point unless it explicitly references an earlier SnapshotRef or result object.

It must not read presentation state.

For opted-in complete-cohort settlement under TRG-001, distinguish immutable death-checkpoint subject/definition inputs from current post-mandatory owner/placement eligibility. A later live view cannot supply both. Ordinary single-Event snapshots remain unchanged.

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

## TRG-014 — Passive Static Registration and Battle Initialization
**Status:** `LOCKED`

`PASSIVE_STATIC` is not an Event-driven Action and does not create a Natural Action.

It is the declarative activation mode for Passive rules that are continuously registered for their declared lifetime and/or for Passive-owned initialization Effects that must settle at the owning runtime participant's initialization checkpoint.

### Static rule registration

A static rule such as:
- native admission/immunity rule;
- scoped Effect modifier;
- scoped Damage-component transform;
- bounded mitigation-stat override;

is registered from the owning Passive without creating a fake Action.

Registration itself:
- pays no Ability Cost unless another explicit Contract says otherwise;
- consumes no Natural Action;
- does not advance SSI;
- does not emit an Action merely to make the rule exist.

### Battle-scoped initialization Effects

When a `PASSIVE_STATIC` owns a mutation whose declared target state is battle-scoped initialization state, that mutation settles exactly once for that battle participant at battle initialization.

Canonical ordering for Character Current Deployment Cost is:

```text
resolve execution-ready BASE_DEPLOYMENT_COST
→ initialize CURRENT_DEPLOYMENT_COST from Base under DEP-002
→ initialize Deployment-Cost lock state
→ settle qualifying PASSIVE_STATIC battle-initialization mutations
→ expose the resulting battle Current Deployment Cost to later deployment/payment/formula reads
```

This permits a Character to declaratively author:

```text
ADD_CURRENT -5
```

as a once-per-battle static Passive initialization mutation.

It does not create a universal `-5` rule.

### Exactly-once boundary

A battle-scoped static initialization mutation is not rerun merely because the Character:
- deploys from Deck;
- returns to Deck;
- redeploys;
- leaves/re-enters Field Presence;
- Revives;
- returns from Temporary Absence;
- transfers between Combat Instances;

unless an explicit separate Contract says that transition creates a new owning battle participant/lifetime.

For ordinary same-battle Return-to-Deck/redeployment:

> the already-initialized battle state is reused.

### Determinism / multiplicity

Static initialization must not derive gameplay ordering from:
- Ability list order;
- Character file order;
- Event order;
- entity ID;
- incidental iteration order.

If several initialization mutations affect the same semantic state and their operations are order-independent under their typed Contract, they may all participate.

If final outcome would depend on undeclared order:

> normalization must require an explicit dependency/composition rule or reject executable content.

### Failure boundary

Execution-ready battle initialization must not continue with unresolved required initialization data.

A failed required initialization does not silently produce a default numeric gameplay value.

This Contract does not create a scripting/callback startup system.

---

## TRG-015 — Checkpoint-Scoped Committed-Result Observation
**Status:** `LOCKED`

A normalized `ACTION_RESULT_ANY` Condition reads the referenced Action at one declared checkpoint: `ACTION_DIRECT_EFFECTS_COMPLETE` or `ACTION_COMPLETED`. This creates no new Event or Action-result owner. Before ADEC publication, seal the own-direct committed receipt-reference projection. Later blocking settlements can extend the whole Action summary but cannot enter or rewrite that sealed projection. At completion, final aggregation is immutable. Both reads enforce the declared own-direct provenance.

The read is bounded by:

```text
explicit Action reference + reached checkpoint
→ selected result kind / committed metric
→ DIRECT_EFFECT_GRAPH_OF_SCOPED_ACTION membership
→ explicit recipient relation/filter and reference anchor
→ scalar comparison
→ ANY Boolean
```

Only committed result data qualifies. Damage reads `actualHpDamage`, Heal reads `actualRestore`, and supported Shield addition reads `committedAddedAmount` under `SHP-005`. Requested/nominal amount, Overheal, absorbed Shield damage and live remaining Shield are not substitutes for those metrics.

Own-direct membership is proven from Effect provenance and normalized graph ownership under `TRG-013`; matching `rootActionId` or Damage Attribution alone is insufficient. A child Action, standalone Passive-triggered Effect, Follow-up/Counter/Reaction, DoT or independent HoT does not enter the scoped Action's own direct set merely because it shares lineage. Existing root-linked outcome aggregation remains available to mechanics that explicitly request that different scope.

The predicate returns one Boolean per Event regardless of matching-entry count. An empty committed collection returns false; failure/zero of one Effect does not erase successful sibling results or imply failure of the enclosing Action. Several kind-specific predicates can all be true for one scoped Action/checkpoint.

Each selected checkpoint view is sealed before its Event is published and remains immutable while observers/dependent queued work reference it, even if a contribution has since depleted/expired or a recipient later becomes invalid. Recipient relation/filter reads use the required typed `recipientFilter.readContext`: OBSERVATION_STATE under TRG-002, or SNAPSHOT with a retained SnapshotRef covering recipient, anchor and all requested facts. Missing/uncovered snapshot data is an error, never a live-read fallback. Do not inherit live target-selection legality filters for historical receipts: a target killed by the qualifying Damage remains result evidence unless an authored recipient filter says otherwise. The collection is read-only: no RNG, target selection, Cost, Effect emission or mutation occurs inside a predicate.

An observer may compose ordinary State/counter updates and later Effects through its declared Effect DAG/atomic group. At ADEC, such a bounded update may be a declared `ACT-032` dependency registered before the completion barrier; its runtime identity includes root Action, trigger owner and instantiated candidate. A settlement waiting for `ACTION_COMPLETED` cannot be that same root's blocker; an explicitly required post-completion settlement instead uses ACT-033 to block the next Natural-Action handoff. Mutually exclusive authored checkpoint branches must prevent duplicate observation where a mechanic handles one Action at ADEC instead of completion. Idempotence, retention, note consumption, owner validity, failed-Cost behavior and settlement dependencies remain authored semantics; this Contract does not create a universal reward/memory subsystem. Multiple competing state-mutating observers still require their existing dependency/priority law where order matters; neither entry iteration nor eventSeq supplies it.

Executable content with an unavailable Action/checkpoint anchor, mismatched result metric, missing semantic anchor or unsupported operation-result mapping is rejected. A post-completion observer cannot be made a dependency waiting for the completion Event it would itself prevent.

---

## TRG-016 — Mandatory Stable Health-mutation Observation
**Status:** `LOCKED FOR EXPLICIT STABLE-HEALTH PROFILES`

An actual committed CurrentHP or CurrentMaxHP change records a health observation for that transaction/recipient, including effective MaxHP changes from committed stat/State/position-dependent contributions and their ordinary reconciliation. Joined HP/MaxHP changes in one commit produce one observation, not two payments. A simultaneous/mixed group commits completely before observation; never interpose between its packets/recipients or contaminate sibling calculations. Preserve mutation/result identity and semantic kind; no-op/staged/rolled-back writes or AE-only mutations do not qualify. Damage/Heal/HP Cost/HP Loss/MaxHP/lifecycle writes remain distinct operations.

Mandatory lifecycle, joined prevention/Return/Revive commits and required health reconciliation must reach a stable state before evaluation. Do not insert this observation inside their atomic transaction or before HP_ZERO handling. Then evaluate the opted-in finite Conditions/Cost/cap/State settlement before the next direct group or Action/SSI continuation, even while ordinary Reactions are held. This barrier is mandatory work, not an ordinary Reaction window. It can make the next group's recipient admission different without re-querying an Entity lock or altering earlier committed results.

Use the same stable observation for candidate facts; no Slot/Entity/list/Event order selects a shared-resource winner. Unrelated commuting work may retain its existing law; observable competing resource/admission/mutation interactions require explicit composition or fail normalization. No new global priority is supplied. Required settlements close on nonqualification/clean Cost failure. A later actual health mutation may produce another observation; AE gain alone or polling cannot retry a failed one. Resulting health mutations produce their own bounded obligations only after their own stable lifecycle boundary; reject cycles/unbounded cascades rather than scan to a fixpoint.

Observation/candidate identity includes Combat Instance, original commit/recipient, trigger definition/runtime owner and local dependency. Retain terminal nonqualification/failure/success through replay; resume cannot spend/use/create again. State mutations/queued work carry current life/presence/instance validity and cannot revive a retired State. Existing ordinary triggers keep their authored timing.

---

### TRG-016 opt-in stable predicate checkpoints

The existing HEALTH_MUTATION_STABLE / stableHealthSettlement law is unchanged. A separately opted-in 04§7.16 profile observes PREDICATE_CHECKPOINT_STABLE for the exact selected CurrentHP/CurrentMaxHP/CurrentRage fields and/or valid Field initialization. This bounded profile does not observe arbitrary State fields, poll Conditions or relabel Resource mutation as health Damage.

Record actual changed selected fields on their authoritative transaction/subject, with original result/semantic kind and exact finite-settlement origin. One joined commit/subject yields one checkpoint, including joined entry and field changes. Field initialization qualifies only after authoritative presence/values, mandatory lifecycle and reconciliation are stable. No-op/rolled-back/AE-only/unselected writes do not qualify. A Rage-limit reconciliation qualifies only when it actually changes selected Current Rage.

Before the next direct-group/Action/SSI continuation, evaluate the one owner/trigger/checkpoint candidate against that stable view and close its finite Condition/Cost/cap/Effect graph. Failed qualification/payment closes without use or retry; no ordinary Reaction window or continuous fixpoint is needed. Costs and limit/use writes that are explicitly joined retain their protected atomic commit.

EXCLUDE_THIS_TRIGGER_ACTIVATION suppresses observations caused by that exact activation's own finite settlement, including its payments, limit/current reconciliation and grants; retain that origin even through replay. It is not a whole-root/Ability/Actor ban. After this activation is terminal, a later independently caused qualifying commit may activate the same trigger, even in the same Natural root or from a later terminal-Heal settlement of a previously created Shield. A given original checkpoint cannot re-deliver a second activation.

Existing Transaction/Health/Resource/Presence/Lifecycle/Trigger/State/dependency owners retain checkpoint identity, selected-field evidence, origin, stable owner life/presence and terminal candidate outcome through dependent work/save/replay. Never run between sibling writes/packets or restore a retired candidate in a new presence. Cycles, waits on held future work, duplicate competing profiles and observable non-commuting candidates without an explicit composition law fail closed. This adds no global priority or mutable predicate manager.

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

## TGT-007 — Metric Selector Tie Policy
**Status:** `LOCKED`

A metric/ordered Target selector must not derive a gameplay winner from incidental ordering when several eligible candidates share the same best metric value.

For:

```text
tiePolicy = RANDOM_AMONG_TIED
```

canonical selection is:

```text
build final eligible Candidate Pool
→ read the declared selection metric for every candidate at the same selection checkpoint
→ determine the best metric value
→ build the exact tied-best subset
→ consume deterministic seeded gameplay RNG over that tied-best subset
→ select the declared target count
```

For:

```text
selection = LOWEST_HP_PERCENT
tiePolicy = RANDOM_AMONG_TIED
count = 1
```

RNG is used only among candidates tied for the minimum:

```text
CurrentHP / CurrentMaxHP
```

not among the whole Candidate Pool.

### No hidden tie priority

For `RANDOM_AMONG_TIED`, a tied winner must not be selected by:
- authored list order;
- entity ID;
- Slot;
- insertion order;
- Event order;
- incidental collection iteration.

`eventSeq` remains trace order, not Target priority.

### RNG interaction

`RNG-001` and `RNG-002` apply.

The exact tied-best subset is fixed before the random draw.

No RNG draw may change which candidates count as tied.

### Selection-time scope only

`tiePolicy` controls initial selection only.

It does not itself imply:
- `REROLL`;
- `REQUERY`;
- replacement after later target invalidation;
- another RNG draw after target lock.

After selection:

```text
TGT-004
TGT-006
```

remain authoritative for target lock, re-query and invalidation.

Therefore authored data may use:

```text
LOWEST_HP_PERCENT
→ RANDOM_AMONG_TIED
→ LOCK_ENTITY_IDS
→ later DROP_INVALID
```

to mean:

```text
select once
lock the Entity
if later invalid:
  drop/skip that target
  do not re-query
  do not reroll
  do not select a replacement
```

### Explicit Slot ties and top-N metric cutoff

For positive count N, form unique eligible candidates and rank metric groups at the same selection checkpoint. Admit complete better metric groups before the cutoff group. If fewer than N candidates exist, select the eligible remainder. Only the equal-metric group that requires resolution uses its declared tie policy; worse groups cannot win via tie priority.

`EXPLICIT_SLOT_ORDER` reads candidate positions from that selection checkpoint and compares them against the authored `explicitSlotOrder` of PositionRefs. It consumes no RNG. Mode validates position identities; the local authored rule defines their priority. Leader follows its occupied Slot. No entity/list/entry/SSI-cursor priority is inferred. Duplicate or unresolved order positions, uncovered tied candidates, or multiple equal-position candidates without a further explicit law are invalid content.

With `RANDOM_AMONG_TIED`, select the needed distinct members only from the exact cutoff tied group using existing deterministic seeded RNG and `NO_DUPLICATES`; the count-one tied-best law above is preserved. Technical enumeration must not bias membership or imply resolution order between selected Effects. A selected target set does not itself supply sequential Effect execution priority.

After selection, store the TargetSetRef under the declared lock policy. Later invalidation/requery follows `TGT-004` / `TGT-006`, never an implicit tie rerun.

This Contract does not create a global default that every metric selector randomizes ties.

If gameplay-observable tie behavior is not declared:

> it remains `REQUIRED_EXPLICIT`.

---

## TGT-008 — Position-bound Attack and Current Occupant
**Status:** `LOCKED_DEFAULT FOR EVERY ATTACK OWNER; EXACT AUTHORED EXCEPTIONS PRESERVED`

For every Character, resolve binding independently for each attack-producing semantic owner: Action, Effect, child Action, triggered settlement, Counter, Follow-up or other attack owner. An otherwise-unresolved authored binding defaults to POSITION / LOCK_POSITIONS. Entity/Both is exceptional and must be explicitly designer-authored for that exact owner, directly or through an explicit owner-scoped binding-profile reference. Preserve existing approved exceptions only at that scope; do not migrate them or change non-attack Self/Leader/State references.

A Character, Ability root, parent Action, sibling Effect or another Ability cannot implicitly grant its Entity/Both binding to other attack owners. Shared target IDs/TargetSetRef, target center, source Snapshot, Action identity, attribution or root lineage are input/provenance, not exception permission. Explicit reuse is legal only with the consuming owner's independently resolved binding; a generic reuse-parent-targets instruction alone cannot make it Entity-bound. Every executable owner must carry its explicit resolved binding/checkpoint in normalized data. Missing resolved binding in an executable plan or foreign-owner substitution fails validation; malformed IR fails closed before the affected attack. No runtime guessing or Character-wide inheritance.

An explicitly Entity-tracking LOCK_ENTITY_IDS attack follows the same legal locked Entity if it moves before impact; presentation addresses that Entity's current authoritative Position. Movement alone does not replace/invalidate the identity, though ordinary lifecycle/target/Hit/Authority rules still apply. No retarget, Guaranteed Hit or attacker Position mutation is inferred. LOCK_BOTH retains its explicitly authored compatible identity/coordinate constraints and cannot silently become Entity-only or Position-only.

For CURRENT_LEGAL_OCCUPANT / POST_POSITIONAL_INTERPOSITION_PRE_DAMAGE, select/retain coordinates first, finish any applicable POS-008 relocation, then resolve current legal occupants immediately before Damage calculation. Freeze those recipients and the shared state through the group's commit. Empty coordinates yield the authored MISS/OMIT outcome; legal replacement occupants may receive the hit. Do not chase originals, reselect coordinates or re-query occupancy between packet calculations. Resolved invalid recipients follow TGT-006 locally, without replacement. Earlier source snapshots remain immutable.

TGT-010/011 still govern geometry and batch membership. A declared Entity-bound area retains its explicit semantics at its own authored scope; this default does not force all geometry profiles to add a relocation phase. Slot coordinates remain fixed and their occupant is resolved at the authored recipient checkpoint, never by chasing the originally selected Entity. Defaulting binding does not invent selection/geometry/invalidation rules; missing movement-sensitive checkpoint remains a normalization error, not a hidden Kernel default.

---

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

## SNP-006 — Explicit Pre-Cost Source Snapshot
**Status:** `LOCKED EXPLICIT PROFILE`

Snapshot timing AFTER_ADMISSION_BEFORE_COST_COMMIT captures only declared source fields for the actual successfully admitted Action, after ACT-002 read-only validation/payability and before any active Cost debit. Admission probes/rejected fallback candidates neither create a gameplay capture nor mutate/pay/consume anything. The capture is read-only and immutable under SNP-001/002; it introduces no second prerequisite phase, payment, Event or Action.

Cost transaction remains authoritative and may fail revalidation. On failure, no direct Effect may consume this capture to activate the failed cast; discard its unused execution binding under ordinary terminal/replay lifetime law. On successful Cost, explicit CST-015 continuation retains this same SnapshotRef through mandatory source HP_ZERO/death/return/cleanup. Do not re-read dead/deck source stats or recapture per target. Dedicated post-payment HP receipts remain CST-009, not this snapshot.

Existing Action/Snapshot Store owns the binding keyed by admitted Action + snapshot definition, with captured source/fields/state version. Capture once per logical admitted execution; retain through dependent work and replay, release under ordinary terminal-result lifetime. Replay never re-evaluates against newer source state. Other snapshot profiles, including after-Cost captures, are unchanged.

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
**Status:** `LOCKED CORE / reaction boundary REQUIRED_EXPLICIT WHEN RELEVANT`

For sequential resolution:

```text
resolve component 1
→ commit component 1
→ required immediate lifecycle evaluation
→ component 2 may observe new authoritative state
→ ...
```

A later component may therefore observe state committed by an earlier component.

### Mandatory lifecycle processing is not an ordinary Reaction window

After a committed component, any lifecycle processing required to determine whether a later component still has a legal recipient may occur immediately.

This may include, where applicable:

```text
HP_ZERO
→ Death Prevention / required lifecycle handling
→ target validity update
```

This required lifecycle processing does not by itself grant ordinary Counter/Reaction resolution between components.

---

### Explicit reaction boundary profile

`resolution.reactionBoundary` determines whether ordinary Reactions may resolve between sequential components when that distinction matters.

The explicit profile required by Pilot #3 is:

```text
AFTER_DIRECT_EFFECTS_COMPLETE
```

Meaning:

```text
component 1 commit
→ mandatory immediate lifecycle evaluation
→ if later component remains legal:
     component 2 resolve/commit
→ continue declared direct sequential Effects
→ ACTION_DIRECT_EFFECTS_COMPLETE
→ ordinary eligible Reactions may proceed/queue under existing Trigger Contracts
```

Under this profile:

> ordinary Reactions do not resolve between sequential direct components.

Mandatory lifecycle evaluation still occurs between components.

Target invalidation continues to follow `TGT-006`.

---

### No new global default

This Contract does **not** choose a universal intermediate-Reaction rule for all sequential/multihit Actions.

If an Ability can expose a meaningful intermediate ordinary-Reaction distinction and does not declare the required profile:

> authoring remains `REQUIRED_EXPLICIT`.

The HARD UNRESOLVED default intermediate-Reaction question therefore remains unresolved.

A Character-specific use of:

```text
reactionBoundary = AFTER_DIRECT_EFFECTS_COMPLETE
```

must not be generalized into a global Reaction priority rule.

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

## RES-006 — Scoped Effect-Amount Modifier Evaluation
**Status:** `LOCKED`

A normalized `ScopedEffectAmountModifierSpec` may modify only Effects that match its declared bounded scope.

The Contract evaluates a modifier in the following conceptual order:

```text
resolving Effect reaches declared resolution phase
→ evaluate source scope
→ evaluate recipient scope
→ evaluate Effect semantic/component scope
→ evaluate structured conditions
→ execute declared read-only valueQueries
→ calculate typed amount scalar
→ apply typed amount operation at that resolution phase
```

A modifier that fails any declared scope/condition check does not apply to that Effect/component.

---

### Source scope

`sourceScope` is evaluated against the resolving Effect's existing authoritative Attribution context.

The declared `attributionField` must be used exactly.

For example:

```text
damageAttribution = SELF
```

is not interchangeable with:

```text
caster = SELF
```

or:

```text
effectSource = SELF
```

unless authored data explicitly selected that field.

No Attribution dimension is inferred from Character prose.

---

### Recipient scope

`recipientScope` evaluates the already-resolving Effect recipient.

It does not perform target selection and does not create another TargetSet.

A relational filter such as:

```text
ALLY
ENEMY
SAME_SIDE
OPPOSING_SIDE
```

must use its explicit authored `relationAnchor`.

Exclusions such as:

```text
excludeRefs:
  - SELF
```

are applied as recipient-scope conditions.

---

### Effect/component scope

The modifier applies only to the declared Effect semantic.

Current Pilot-supported Effect semantics are:

```text
HEAL
DAMAGE
```

For Damage, component scope is evaluated independently for:

```text
PHYSICAL
WILL
TRUE
```

A modifier scoped to:

```text
PHYSICAL
WILL
```

does not apply to the True component of the same Damage Effect.

---

When effectScope.directActionRef is present, test resolving Effect membership in that existing Action's own direct graph under TRG-013, independently from source Attribution. Action-local Cost/Snapshot bindings must resolve in that Action's namespace; reject foreign/unavailable references. No sealed completed-result collection is needed to test an executing Effect's known graph ownership.

### Structured conditions and `valueQueries`

Modifier conditions reuse existing structured `ConditionSpec`.

`valueQueries` are bounded read-only queries.

At modifier evaluation:

- each query reads the authoritative gameplay state visible at that declared resolution phase;
- candidate/filter semantics reuse existing Target/Condition contracts;
- a relation requiring an anchor must use the authored explicit anchor;
- the query may produce typed read results such as `TARGET_COUNT_REF`.

A `valueQuery` must not:

- mutate State;
- pay Cost;
- emit gameplay Effects;
- create/request Actions;
- consume RNG;
- alter the resolving Effect's target set.

If a modifier requires an earlier authored Snapshot rather than current authoritative state:

> its formula must explicitly reference that Snapshot.

No hidden snapshot is created by the modifier system.

---

### Typed amount operation

The operation at the existing amount phases is:

```text
MULTIPLY
```

The operation consumes a bounded pure ValueRef/Formula and produces a scalar.

The amount formula may not perform iteration or mutation itself.

Collection work belongs to declared `valueQueries`.

---

HEL-005 separately permits coefficient-only ADD at DAMAGE_DERIVED_HEAL_COEFFICIENT; it is not ADD to the resolving HP amount or a custom arithmetic phase. Existing source/recipient/Condition/value-query law still applies.

### Multiple matching modifiers

Every modifier whose declared scope and conditions match the resolving Effect/component is applicable.

Current Pilot semantics do not introduce a winner/priority relationship between matching modifier rules.

For the existing `MULTIPLY` amount phases:

> all applicable multiplier scalars participate in the same declared amount phase.

Authoring order, Event sequence, insertion order, Ability list order, and Character ID do not create gameplay priority between them.

If a future non-commutative amount operation is introduced:

> its ordering semantics require a separate explicit Contract before use.

This Pilot does not invent that ordering.

---

### Resolution phase ownership

A modifier applies only at its authored `resolutionPhase`.

Current Pilot phases are resolved by their owning pipelines:

```text
PRE_OVERHEAL
→ HEL-001

FINAL_DAMAGE_REDUCTION
→ DMG-005

FINAL_DAMAGE_MULTIPLIER
→ DMG-008
```

A modifier may not run at an undeclared or custom string phase.

---

### Authority boundary

Ordinary structured predicates such as:

```text
Rank = Prime
Effective Element = Light
```

are not Authority predicates.

They do not invoke Authority adjudication merely because they appear in a modifier condition/query.

`AUT-*` applies only if a genuine Authority-bearing rule conflict exists independently.

---

## RES-007 — Own-Excluding Stat Modifier Baseline
**Status:** `LOCKED EXPLICIT PROFILE`

A StatModifier may explicitly select baseline mode EXCLUDE_THIS_SOURCE_FAMILY. Family identity is its existing runtime source-owner EntityRef plus stable origin Ability and origin Stat Effect-definition refs; successive instances/stacks match, while different runtime owners/Effect definitions do not. This is a contribution-read predicate, not a Functional Tag, Stat/Ability identity rewrite or new family manager.

Resolve the ordinary authoritative contribution view with this entire family excluded, respecting the other contributions' existing declared layers/stack/Authority/lifetime laws; then apply this family's explicitly declared operation/stack to that input once. Snapshot the resulting stat under existing Snapshot law. Snapshot capture, Event delivery, redeploy or contribution-index reconstruction never applies the family again or mutates BaseStat.

Independent constant multiplicative factors combine by product under ordinary numeric law. A finite declared countN of ×1.05 factors gives1.05^N, not1+0.05×N. The normalized count/stack binding must be bounded/legal and protected consistently with the stat read; no arbitrary loop, recursive final-stat ValueRef, implicit infinite stacking or new POW Primitive. An unchanged counter/other input gives the same resolved stat on repeated reads.

The profile does not settle general stat-layer order, incompatible source composition or recursive relationships among foreign modifiers. Reject unavailable family/contribution input, feedback cycles or unsupported noncommutative composition unless an existing explicit law resolves it. No list/Entity/Event order chooses a result. Use P-030 and the existing State/stat contribution store and Snapshot/Transaction owners; retain source/contribution/count/lifetime identity for replay under normal State law. Unauthored baseline semantics are unchanged.

---

## RES-008 — Explicit Shared-Recipient Proportional Damage Allocation
**Status:** `LOCKED EXPLICIT PROFILE`

A SIMULTANEOUS_BATCH group may select sharedRecipientDamageAllocation PROPORTIONAL for incoming Damage packets sharing a recipient. Under RES-002, freeze membership and required phase state before any sibling delta is visible. Resolve each admitted packet/component's formula, type, mitigation and applicable modifiers independently; keep separate provenance and Damage Results. Invalid locked recipients follow the authored local policy without replacement; failed/zero-demand packets create no competing demand.

For each eligible Shield layer under its existing layer-order/eligibility law, allocate its actual consumed Shield across only the remaining eligible packet/component demands, proportional to those demands. Deduct each share from that demand once. A type-specific layer does not absorb an ineligible component; Shield-piercing demand skips that layer. Within a Standard Shield pool, source contribution depletion still follows SHP-002 independently of the incoming-demand shares. Never independently spend the full same Shield budget on each packet or let main/orb/list order consume first.

After Shield, let R_i be each packet's remaining HP-bound demand, T = sum R_i and H the recipient's available Current HP at this batch's common HP calculation. If T <= H, ActualHP_i = R_i. Otherwise ActualHP_i = H × R_i / T. T=0 allocates zero without division. Overkill is each uncommitted HP-bound remainder; it is not Actual HP Damage. Commit the recipient's net Shield/HP deltas once, then seal each packet's corresponding Shield/ActualHP/Overkill receipt before downstream lifecycle/settlements. A later Execute or recovery cannot rewrite those receipts.

Use the project's applicable numeric policy with bounded, conserved allocations: allocated Shield <= actual Shield consumed; sum ActualHP <= HP actually removed, with exact equality when representable. Preserve packet/result identity. Rounding cannot select a beneficiary by packet/list/Entity/Event order. If the active numeric policy cannot represent an order-independent conserved allocation at the required precision, reject unsupported executable content/require an explicit numeric profile rather than invent a tie-break or silently lose/gain HP. No new global rounding law is supplied here.

Existing Damage/Shield/Transaction/Result owners hold the proposed recipient allocation keyed by batch execution + recipient + participating packet/component refs, together with shared state version and commit identity. It is transient until the common commit; failure publishes no partial allocation/results. Retain committed receipts/dedup identity for dependent work/save/replay under existing result lifetime. Technical permutation yields the same totals and per-provenance shares. No new priority system, Primitive or universal AoE default; undeclared observable shared-recipient allocation is rejected.

---

## RES-009 — Explicit Cross-child Simultaneous Damage Commit
**Status:** `LOCKED EXPLICIT PROFILE`

`PREPARE_CHILD_DAMAGE_THEN_COMMIT` gives one named parent SIMULTANEOUS_BATCH group commit ownership over explicitly enumerated Damage nodes of finite real child-request paths (04§34.2B). ACT-020/023 identity/source-Snapshot law remains authoritative. Inline-copy graphs, serial child commits and a parent result that pretends child Damage is root-direct are not equivalent.

Freeze participant paths, locked recipient refs and supplied source Snapshot refs. Freeze their stable Action/Effect identities from the existing request-path/locked-target bindings before technical preparation; ordinary Hit Admission/RNG uses those preserved identity/domain bindings, not preparation serial order. RNG draw bookkeeping remains with the existing deterministic service and is not a sibling gameplay mutation. Instantiate real children with preserved Action/Effect provenance; prepare selected nodes under one shared phase-state view/read set without exposing sibling mutations. Preparation permits read-only admission/zero-or-waived Costs and pure Damage calculations only. Ordinary observer work cannot mutate that view before common commit. Unsupported mutation-bearing preparation or a foreign required Cost requires an explicit applicable transaction/failure law; no blanket waiver or hidden ordering.

Prepared or authored locally skipped Damage nodes satisfy the barrier; child ACTION_COMPLETED does not. One common transaction commits Shield/HP deltas and seals separate child receipts, then mandatory lifecycle runs for the completed batch. Child completion/declared result consumers can proceed only afterward, once each relevant direct branch is terminal. No ordinary Reaction window appears between participants. Empty/invalid branches follow explicit policy without re-query/retarget; non-target preparation failures need their own explicit policy. Generic transaction abort publishes no partial Damage or committed receipts and grants no implicit upstream Cost refund.

A declared parent Damage-outcome projection is sealed after all its selected Damage branches and mandatory lifecycle are terminal, independently of later non-Damage direct Effects. Existing Damage completion/result-readiness supplies this checkpoint; it must not wait for parent ACTION_DIRECT_EFFECTS_COMPLETE/ACTION_COMPLETED when a later Heal/MaxHP Effect depends on it. Conversely, no omitted later qualifying Damage branch can be silently treated as terminal. The finite dependency graph remains acyclic.

The existing Action execution/DAG and Transaction/Result owners hold batch+commit owner, participant Action/Effect refs, terminal preparation status, shared read/Snapshot refs and receipt/commit identity. Nested participant groups delegate to this one owner, never double-commit. Save/resume preserves targets/draws/identities and preparation/commit state; no second child instantiation/debit/receipt/completion from replay. Membership itself confers no target/Entity/list/Event priority. Reject cycles, ambiguous membership/snapshots, multiple commit owners and waiting for participant completion before its own Damage commit. Ordinary independent child policies and RES-002/008 remain unchanged.

---

# 17. COST CONTRACT

## CST-001 — Validation Before Payment
**Status:** `LOCKED_DEFAULT`

For an ordinary required-only Cost group:

```text
validate all required Costs
→ if all required Costs are payable
→ commit required Cost group atomically
```

No partial required multi-cost payment by default.

This remains the default for ordinary fixed Cost composition.

---

### Explicit distributed-Cost exception

A declared `CostGroupSpec` containing:

```text
optionalDistributedCostRefs
```

does not treat all optional collection members as additional all-or-nothing required Costs.

Instead:

- `requiredCostRefs` remain required;
- their successful commit remains required for Ability continuation;
- distributed optional payers follow `CST-008`;
- optional payer failure does not retroactively convert the required Cost group into a failed atomic transaction.

The required Cost subset is still atomic with respect to itself unless an explicit higher Contract says otherwise.

This exception does not permit partial payment of a failed required Cost.

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

An explicit bounded `hpPaymentPolicy` follows CST-014. Its successful shortfall/floor is a declared payment exception, not Damage/HP Loss or permission to partially commit a failed required group. Default and unrelated exact-payment exchanges remain unchanged.

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

## CST-008 — Dynamic Distributed Multi-Payer Cost
**Status:** `LOCKED`

This Contract applies to a normalized `CostGroupSpec` containing:

```text
requiredCostRefs
+
optionalDistributedCostRefs
```

Each entity in a distributed payer collection pays **its own Cost**.

A distributed HP Cost is therefore:

```text
payer loses HP as Cost
```

not:

```text
caster deals Damage to payer
```

`CST-003` continues to govern each HP Cost attempt.

---

### Canonical transaction order

For a distributed CostGroup:

```text
1. Action admission / declared revalidation confirms the requested Ability may proceed to Cost processing

2. validate all required Costs
   + mandatory payer legality

3. if required Costs are not payable:
     fail before payment
     do not snapshot/attempt optional payment as a committed payment phase
     do not partially pay required Cost

4. snapshot every declared optional payer collection
   from authoritative pre-payment state

5. commit the required Cost subset atomically

6. for each member of each frozen optional payer collection:
     attempt that entity's own Cost

7. create authoritative member payment results

8. construct declared CostGroup payment result
   and aggregates
```

The critical invariant is:

> optional payer collections are snapshotted after required validation but before any required or optional payment commits.

The payer set must not first be discovered after required payment has begun.

---

### Snapshot freezes membership, not payment success

The optional payer snapshot fixes:

> which entities are members of that distributed payer collection for this Cost transaction.

It does not guarantee that every snapshotted member will successfully pay.

At the member's payment attempt:

- use that entity as `PAYER`;
- evaluate the authored Cost for that payer;
- apply that payer's relevant Cost/payment rules;
- produce that payer's own payment result.

A later state change must not silently:

- add a new optional payer to the frozen collection;
- remove an already-snapshotted payer merely because collection eligibility would now differ.

The member's actual payment attempt may still fail under its own applicable Cost rules.

---

### Optional payer failure

For:

```text
optionalPayerFailurePolicy
= CONTRIBUTION_ZERO_CONTINUE
```

a failed optional payer attempt produces:

```text
success = false
actualPaidAmount = 0
```

for that payer.

That failure:

- contributes zero to payment aggregation;
- does not by itself fail the whole Ability;
- does not invalidate successful payments from other optional payers;
- does not refund already-committed required Costs;
- does not convert another entity into the failed payer.

---

### Successful zero payment

A payer-specific Cost Contract may explicitly permit:

```text
success = true
actualPaidAmount = 0
```

Such an outcome is a successful payment outcome with zero committed amount.

It must not be rewritten as optional-payer failure merely because the numeric amount is zero.

---

### Required commit failure

If the required Cost subset cannot commit after validation:

> the distributed optional payment phase does not begin.

No optional payer payment may be used to rescue an uncommitted required Cost unless another explicit Cost Contract says so.

---

### Per-payer ownership

For a distributed HP Cost:

```text
PAYER = current frozen collection member
```

That member's HP changes through Cost semantics.

Therefore the payment does not:

- create Damage Attribution from the caster;
- trigger ordinary Damage triggers;
- use Shield;
- Reflect;
- Lifesteal;

unless an explicit Cost Contract independently overrides those defaults.

---

### Active Cost-stage completion boundary

For an active Ability, the distributed Cost transaction does not finish when the required subset commits.

If the CostGroup contains:

```text
optionalDistributedCostRefs
```

the active Cost stage remains in progress until:

```text
required Costs committed
→ every frozen optional payer attempt reached a terminal payment result
→ all member payment results were recorded
→ declared CostGroup payment result / aggregates were constructed
```

Only after this full sequence is terminal may the Action proceed to:

```text
POST_COST_PRE_EFFECT
```

or to its first direct Ability Effect when no such interposition applies.

Forbidden flow:

```text
required Cost commits
→ POST_COST_PRE_EFFECT settlement or direct Effect
→ optional payer payments happen later
```

because it would split one declared Cost transaction across Ability execution.

Canonical boundary:

```text
complete Cost transaction
→ post-cost interposition if any
→ direct Effects
```

This rule does not make optional payer success required for Ability continuation.

An optional payer may still terminate as:

```text
success = false
actualPaidAmount = 0
```

under `CONTRIBUTION_ZERO_CONTINUE`.

What is required is that the **attempt/result is terminal**, not that every optional payer succeeds.

---

### Cross-payer ordering boundary

This Contract freezes payer membership and per-payer ownership.

It does not create a general gameplay-priority rule among optional payer entities.

Authoring that intentionally makes one optional payer's payment result alter another optional payer's payment legality/amount in an order-dependent way requires an additional explicit Contract/profile.

The Kernel must not use entity ID, Slot, collection insertion order, or incidental iteration order as an undeclared gameplay rule.

---

## CST-009 — Typed Cost-Payment Result Semantics
**Status:** `LOCKED`

Cost formulas and committed payment outcomes are distinct.

Canonical distinction:

```text
requestedAmount
≠
actualPaidAmount
```

when the applicable Cost/payment policy allows them to differ.

Downstream Effects that require the committed payment outcome must consume the authoritative Cost-payment result.

They must not reconstruct that outcome from the nominal/authored Cost formula.

---

### Singular payment result

One singular payer Cost attempt may produce one typed:

```text
COST_PAYMENT_RESULT
```

At minimum it preserves:

```text
requestedAmount
actualPaidAmount
payer
success
```

`requestedAmount` is the evaluated amount requested from that payer by the Cost definition/payment profile.

`actualPaidAmount` is the authoritative amount actually committed from that payer.

`payer` is the entity/resource owner that paid or attempted that singular Cost.

`success` is the payment outcome according to the applicable Cost Contract.

---

### Zero amount is not failure

The following implication is invalid:

```text
actualPaidAmount = 0
→ success = false
```

A legal Cost/payment policy may produce:

```text
success = true
actualPaidAmount = 0
```

For example, an explicitly-authored HP Cost floor may permit the Cost interaction to succeed while no HP can legally be removed beyond that floor.

Conversely, a failed optional payment may produce:

```text
success = false
actualPaidAmount = 0
```

Consumers must inspect the typed fields they semantically require.

They must not infer `success` only from amount.

---

### Distributed payment results remain individual

If one distributed CostSpec produces payment attempts for:

```text
Payer A
Payer B
Payer C
```

the authoritative outcomes remain three distinct member `COST_PAYMENT_RESULT` records.

They must not be collapsed into one ambiguous singular Cost result.

A direct singular `COST_PAYMENT_REF` must resolve to exactly one payment result.

Distributed member outcomes are owned/exposed through their declared CostGroup result.

---

### CostGroup result

A declared `CostGroupSpec` may expose:

```text
COST_GROUP_PAYMENT_RESULT
```

The group result owns the member payment results generated by that declared transaction.

For an aggregate such as:

```text
TOTAL_ACTUAL_PAID
```

the aggregate is computed from authoritative member:

```text
actualPaidAmount
```

not from requested/nominal formulas.

For a heterogeneous CostGroup, the aggregate consumer must identify the Cost kind being aggregated.

Example:

```text
TOTAL_ACTUAL_PAID(kind = HP)
```

sums only HP payment results belonging to that declared CostGroup.

Failed optional payer:

```text
actualPaidAmount = 0
```

contributes zero.

Successful zero payment:

```text
actualPaidAmount = 0
```

also contributes zero while preserving:

```text
success = true
```

in its member result.

---

### Downstream binding rule

If downstream gameplay says:

> amount equals HP actually paid

the consumer must read:

```text
actualPaidAmount
```

or the corresponding typed group aggregate.

It must not use:

- raw percentage formula;
- requested Cost amount;
- payer HP difference reconstructed after unrelated mutations;
- a guessed nominal value.

This ensures Cost-result-dependent Effects remain correct when:

- a Cost floor applies;
- a partial/special payment policy applies;
- optional payers fail;
- a successful zero payment is permitted.

---

### Result lifetime and immutability

Once a payment result is committed:

> its recorded requested amount, actual paid amount, payer and success outcome are immutable result data for that transaction.

Later Heal, Damage, Resource changes, Max HP changes, or other Effects do not retroactively rewrite the payment result.

### HP immediately after payment

A successful singular HP payment's `currentHpAfterPayment` is the resulting authoritative HP from that payment commit, captured before any ensuing HP_ZERO/death-prevention/return/Heal side-effects. `CURRENT_HP_AFTER_PAYMENT` is valid only for that successful HP result, including successful zero debit. No field is fabricated for a failed/uncommitted or non-HP payment. Store the value with the result and retain it through all dependent Action work/replay. It is not HP paid and must not be reconstructed from live HP after lifecycle processing.

---

## CST-014 — Bounded Singular HP-Payment Profile
**Status:** `LOCKED EXPLICIT PROFILE`

An opted-in HP Cost freezes normalized requested amount, pre-payment HP, structured guards, selected floor and referenced allowance state once per logical transaction. Exactly one declared case matches; no list/Entity/Event order supplies a case or payer allocation. Validate ordinary payer/admission legality and every other required Cost before committing anything.

The selected case owns this payment's HP payability/floor; co-authored legacy lethalFloor is rejected, not resolved by hidden precedence. Counter-consuming cases are bounded to required Costs of this admitted Action; optional-payer/unrelated settlement consumption is unsupported. Ordinary failure/refund laws still govern unsuccessful required payment.

For `REQUIRE_FULL`, payment succeeds only if the complete requested debit can leave the selected minimum HP. For `CLAMP_SUCCESS`, the explicit successful-shortfall law is:

```text
actualPaidAmount = min(requestedAmount, max(0, hpBefore - selectedFloor))
currentHpAfterPayment = max(selectedFloor, hpBefore - actualPaidAmount)
success = true
```

Preserve requestedAmount unchanged. The declared exceptional floor assignment is non-Heal and creates no Heal/Overheal/Damage/Lifesteal result; actualPaidAmount records the debit, not a later net HP difference. Floor0 explicitly permits lethal payment. This profile does not waive initial Action/payer legality, other required Costs or an exact-payment consumer's own entitlement test.

Required AE/HP payments, payment receipts and any selected one-unit `consumeCounterRef` update commit atomically with successful admission. A failed other Cost, probe, transaction validation conflict or abort commits none of them. Availability/guard reads are protected; technical retry cannot silently reselect a case inside the same frozen transaction. A fresh gameplay attempt requires a fresh validated transaction under existing admission law.

The counter is existing owner-keyed State with its declared lifetime. Required battle-scoped allowances survive source leave/redeploy and are retired only with that battle. Replay resumes/reuses the same transaction/case/receipts; it cannot debit, assign a floor, consume an allowance or emit HP_ZERO twice. Ambiguous same-payer HP allocation or competing allowance consumption is rejected unless an existing explicit allocation law resolves it. No new manager, scripting or priority.

---

## CST-015 — Cost-caused Lifecycle before Direct Effects
**Status:** `LOCKED EXPLICIT CONTINUATION PROFILE`

Under `ActionSpec.costLifecyclePolicy = CONTINUE_ADMITTED_ACTION`:

```text
entire active Cost transaction succeeds and is terminal
→ immutable payment outcomes already captured at their commits
→ finish mandatory Cost-caused HP_ZERO/death evaluation/prevention
→ resume this same admitted Action's direct Effect graph
```

Successful Return-to-Deck or DEATH_CONFIRMED during that processing does not itself cancel the admitted Action. Retain its Actor/Ability/Action/Combat-Instance context, result bindings and declared snapshots/target locks through completion. Do not re-admit, charge again, grant another Action, resurrect the Actor or refresh a commit-bound HP value from post-prevention HP. Explicit recipient/Effect legality and separately applicable cancellation remain authoritative.

Mandatory lifecycle processing is not an ordinary Reaction interposition. This adds no new global same-window priority and no free opportunity for a dead/off-field Actor to request another Action. Absent this explicit profile, preserve existing laws; reject execution content whose observable Cost-caused source-invalidity outcome lacks an applicable declared policy. Distributed Cost-stage terminal/result barriers remain CST-008/009; neither direct Effects nor post-cost interposition begins while that active transaction is incomplete.


**Opted-in local CostGroup:** a finite local settlement already inside an admitted Action may carry CostGroupSpec.admittedActionRef to that same enclosing Action and costLifecyclePolicy CONTINUE_ADMITTED_ACTION. Complete the group's required/optional terminal-result barrier, then its declared success-side use/cap dependency, then mandatory Cost-caused source lifecycle, then resume only the already-admitted local graph/locked hit/request. No extra Action/admission or new Intent interposition anchor. Source death/Return alone does not cancel those admitted nodes; later target/Effect legality still applies, and no new dead/off-field cast is admitted.

Local-group failure uses its explicit branch failure policy; it does not promote an optional activation into a mandatory enclosing-Action Cost or consume success-side use. Existing upstream hit/snapshot/result identities remain intact. CST-005 governs refunds; source death after successful payment/use creates none. Reject foreign continuation anchors, source-payer mismatch, cyclic dependencies, unavailable pre-Cost formula/target bindings or conflicting group/Action continuation policy. The existing Effect DAG/Cost/Action/Lifecycle owners provide this boundary; no callback or extra scheduler.

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

### CST-011 opt-in limit mutation and Current reconciliation

04§23.3 / P-033 explicitly mutates a per-unit Rage pool's authoritative limit with a finite delta, declared nonnegative minimum and CLAMP_DOWN. Stage `L' = max(minimum, L + delta)` and `C' = min(C_after_joined_payments, L')`; commit both and the immutable Resource result together. Raising L grants no C. This profile does not alter ordinary Current-resource operations/overflow or implicit Battle/Mode initialization.

Retain the limit and BATTLE_SCOPED mutation identity through death/Revive/leave/redeploy. Explicit restoration/initialization laws must respect the applicable target-owned retained pool state; do not silently discard battle evidence as field State. Battle end retires it under ordinary pool lifetime.

A declared activation transaction may include required Current Rage payment and success-use mutation. Read its admission/threshold/cap and payer on a protected view, validate all required members, then commit payment/result, limit/current and use together. Failure/abort consumes none; do not spend then undo. Other observable competing mutations require explicit order/composition rather than technical retry/list priority.

Limit reconciliation is neither a Cost receipt nor a positive Current grant; it does not trigger CST-016 grant admission, class Action regeneration or a new Action. It supplies ordinary mutation provenance to TRG-016's opted-in predicate observer if Current actually changed. Max Rage0 is legal for this profile; readiness under CST-013 still creates no spontaneous Ultimate/SSI opportunity. Preserve finite numeric conservation and terminal commit identity for save/replay.

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

## CST-016 — Positive Resource-grant Origin and Scoped Admission
**Status:** `LOCKED EXPLICIT PROFILE`

ResourceSpec grantOrigin classifies positive grants as ACTION_GENERATED, EXPLICIT_EXTERNAL or SYSTEM_NON_ACTION (04§23.2), independently of issuer/lineage/Attribution. A Mode-issued Action-class grant is still action-generated; an explicitly authored external grant is not reclassified merely because an Action triggered it. The normalized originating rule fixes this meaning; no runtime caller may relabel an otherwise blocked gain.

If an existing scoped admission rule matches the recipient/pool + Resource kind + positive grant operation + origin/State scope, Resource Runtime routes that proposed grant through STA-014 before P-033 commit. Resolve real semantic conflicts under AUT, not ordinary Rank or incidental rule order. No matching rule keeps ordinary Resource processing. Rejection commits no gain and creates an immutable rejected/zero-committed operation result, never a late debit; legitimate overflow/caps/results stay ordinary for admitted grants. Record origin and declared grantActionRef alongside ordinary Effect/Action provenance in that result.

A Resource admission rule may explicitly capture its scope at the next actually performed Natural Action start (04§23.2). Bind exact ActionRef and validated immutable rule/scope in the existing Action/Snapshot execution context; no probes/CC capture. Resource grants whose ACTION_GENERATED provenance is attributed to that bound Action are denied even when they commit after ACTION_COMPLETED/source-window closure. Another Action's grants are not denied by this capture merely because they occur at the same time. Root ancestry alone is not attribution. The authoritative authored grantActionRef/explicit outcome law must prove the match.

Closing/clearing the pending source window prevents future Action capture; it does not undo the old Action's captured scope. Retain that evidence through all declared Action-linked Resource obligations, save/replay and their terminal dedup horizon; late unsupported delivery outside the retained horizon fails visibly instead of reclassifying the gain. A new post-completion window remains distinct from an older captured Action. Source death/leave can clear pending/future window State without erasing already admitted Action evidence. Costs/drains and unauthored SET/transfer mappings are not implicitly blocked grants. Where origin/provenance/mapping is observable but undefined, reject unsupported executable content. No global Rage formula, extra Resource gate subsystem, Functional Tag or automatic AE suppression is introduced.

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

Physical Damage uses ARM as its primary mitigation stat subject to Penetration/Contract. DMG-009 permits an explicit bounded mitigation-stat override without changing Physical semantics; absent that profile the default is unchanged.

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

Final Damage Reduction is a Damage amount phase for non-True components after the relevant ARM/RES mitigation stage and before Shield resolution.

Canonical component flow:

```text
Physical
→ ARM/Penetration
→ qualifying FINAL_DAMAGE_REDUCTION modifiers
→ explicitly authored FINAL_DAMAGE_MULTIPLIER
→ Shield

Will
→ RES/Penetration
→ qualifying FINAL_DAMAGE_REDUCTION modifiers
→ explicitly authored FINAL_DAMAGE_MULTIPLIER
→ Shield

True
→ bypass ARM/RES
→ bypass FINAL_DAMAGE_REDUCTION
→ explicitly authored FINAL_DAMAGE_MULTIPLIER (DMG-008)
→ Shield
```

The Physical/Will flows above show default defensive lookup; an explicit DMG-009 override substitutes the selected stat/Penetration once while preserving semantic type and these later phases.

Final Damage Reduction does **not** reduce True Damage under the current canonical Damage Contract.

Shield resolution occurs afterward unless a packet has explicit Shield Piercing/bypass.

This preserves:

```text
TRUE_DAMAGE ≠ SHIELD_PIERCING
```

---

### Scoped modifier application

A `ScopedEffectAmountModifierSpec` with:

```text
effectType = DAMAGE
resolutionPhase = FINAL_DAMAGE_REDUCTION
```

is evaluated under `RES-006`.

The modifier is applied independently to each resolving Damage component/recipient that matches its declared:

- source scope;
- recipient scope;
- Damage component scope;
- structured conditions/valueQueries.

A target-local modifier on Target A does not automatically modify Damage received by Target B.

A source-target scoped rule therefore remains local to the qualifying source/recipient interaction.

---

### True component boundary

Under the current Contract, a modifier authored at:

```text
FINAL_DAMAGE_REDUCTION
```

cannot affect a `TRUE` component merely by including it in loose data.

True Damage bypasses this phase.

If normalized authored data attempts to make a normal `FINAL_DAMAGE_REDUCTION` modifier affect True Damage without another explicit higher Contract:

> normalization must reject the contradiction.

---

### Multiple scoped reductions

If several qualifying Stage-E amount modifiers apply at this phase:

> resolve them under `RES-006`.

The Contract does not establish gameplay priority between those modifier sources.

Current `MULTIPLY` modifiers all participate in the phase without deriving priority from authoring/event order.

## DMG-006 — Penetration
**Status:** `LOCKED`

Penetration reduces/ignores relevant defensive stat.

100% Penetration is not automatically True Damage.

---

## DMG-007 — Scoped Damage-Component Type Transform
**Status:** `LOCKED`

A normalized `ScopedDamageComponentTransformSpec` changes the semantic type of a qualifying resolving Damage component at its declared Damage-pipeline phase.

Canonical distinction:

```text
ScopedEffectAmountModifierSpec
= numeric amount modification

ScopedDamageComponentTransformSpec
= Damage-component semantic-type transformation
```

The two systems remain separate.

### `PRE_MITIGATION`

For:

```text
resolutionPhase = PRE_MITIGATION
```

the component's formula/pre-mitigation amount already exists, but the component has not yet entered the mitigation branch selected by its original Physical/Will type.

Canonical flow:

```text
typed resolving component + pre-mitigation amount
→ evaluate matching PRE_MITIGATION component transform
→ determine resulting semantic component type
→ enter the ordinary pipeline of that resulting type
```

Therefore:

```text
Physical
→ SET_COMPONENT_TYPE(TRUE)
→ True-Damage path
→ bypass ARM/RES
→ bypass FINAL_DAMAGE_REDUCTION
→ explicitly authored FINAL_DAMAGE_MULTIPLIER (DMG-008)
→ Shield unless separately pierced/bypassed
```

and:

```text
Will
→ SET_COMPONENT_TYPE(TRUE)
→ True-Damage path
→ bypass ARM/RES
→ bypass FINAL_DAMAGE_REDUCTION
→ explicitly authored FINAL_DAMAGE_MULTIPLIER (DMG-008)
→ Shield unless separately pierced/bypassed
```

Forbidden interpretation:

```text
Physical/Will
→ first resolve ARM/RES
→ then relabel result as True
```

The transform is not Penetration.

### Scoped applicability

Only the normalized typed scope may determine applicability:

- scoped Action reference/lineage relation;
- Natural-Action status;
- Actor performing the scoped Action;
- structured source-Actor filters such as Effective Class;
- recipient scope;
- Effect-provenance/direct-effect scope;
- component-type filter;
- structured Conditions.

The Action Actor must not be silently substituted with:
- Damage Attribution;
- Caster;
- Owner;
- Effect Source.

`TRG-013` remains authoritative:

```text
Action lineage
≠
Effect provenance
≠
Damage Attribution
```

Matching `rootActionId` alone is insufficient when the authored rule requires the scoped root Action's own direct Effect graph.

A separate child Action / Passive-triggered standalone Damage / Reaction / Follow-up / Counter / DoT / Mark Damage does not become root-direct merely by sharing lineage.

### Component-local behavior

Evaluation is per resolving component and recipient.

A match on one recipient does not transform sibling recipients.

A filter for Physical/Will does not rewrite unrelated components.

A target-owned runtime transform does not retroactively rewrite:
- source Ability identity;
- source Ability Functional Tags;
- Effect provenance.

The transformed runtime component nevertheless resolves under the resulting Damage-type Contract.

### Multiple matching transforms

No winner is chosen from:
- authoring order;
- Event order;
- Character ID;
- entity ID;
- Effect-list order;
- incidental runtime iteration.

If all applicable transforms are semantically compatible and produce the same resulting component type, the outcome is order-independent.

If applicable transforms are incompatible and no explicit future composition Contract exists:

> executable content must be rejected.

### Authority boundary

Ordinary Rank/Class/Element/relation predicates do not invoke Authority.

Authority is entered only when a real Authority-bearing semantic conflict exists under `AUT-*`.

---

## DMG-008 — Scoped Final Damage Multiplier
**Status:** `LOCKED`

A normalized amount modifier at FINAL_DAMAGE_MULTIPLIER applies existing MULTIPLY to explicitly selected Damage components after their type-specific mitigation and applicable reduction, before component combination/Shield. PHYSICAL and WILL have passed their normal ARM/RES and qualifying FINAL_DAMAGE_REDUCTION; TRUE bypasses those stages but enters this distinct explicitly authored multiplier phase. True Damage retains ordinary Shield interaction and does not become Shield Piercing.

The bounded phase accepts only finite MULTIPLY factors >= 1; factors below 1 require another explicit higher law and are rejected here, preserving TRUE reduction bypass. Execute under RES-006 using one deterministic combined phase factor, with no per-rule amount rounding or inferred priority. Unsupported noncommutative operations are rejected. This phase is not ordinary generic/final Damage Reduction; reduction rules cannot affect TRUE by being relabeled as this phase. Unauthored phase has identity factor and preserves existing Damage behavior.

An optional effectScope.directActionRef binds own-direct provenance under TRG-013 to the resolved existing Action. Child/standalone Damage sharing lineage or Attribution is excluded. A rule's Action-local CostPaymentResultRef/SnapshotRef must belong to that Action and be available before this phase. Successful payment eligibility/locked factors use immutable declared bindings; no HP re-read, payment, Cost waiver inference or result mutation occurs inside modifier evaluation. An Actionless rule need not fabricate an Action; it cannot resolve a required directActionRef that does not exist.

No new Tag/Primitive or mutable multiplier store. Reject wrong Effect/component/phase, unavailable/foreign references and provenance ambiguity before affected Damage commit. The phase defines amount resolution, not a Character reward, global priority or additional hit.

---

## DMG-009 — Scoped Mitigation-Stat Override
**Status:** `LOCKED EXPLICIT PROFILE`

A normalized ScopedDamageMitigationSpec may SET_MITIGATION_STAT to ARM or RES for scoped PHYSICAL/WILL components at PRE_MITIGATION, **after** DMG-007 has determined semantic type. Test every candidate against the same resulting-type/phase-entry Action, Actor, recipient and Effect-provenance view. TRUE bypasses this path regardless of a rule that matched its original type.

Without a match retain DMG-002/003 defaults. A compatible explicit selection replaces the default lookup; do not apply both defensive stats. Resolve the selected authoritative stat after its ordinary contribution laws, apply that stat's compatible declared Penetration under DMG-006, then use its existing mitigation formula. An override's optional existing penetration input is packet-local, never a target Debuff/stat write. Multiple Penetration inputs require their applicable explicit composition law; this profile supplies no additive/multiplicative stacking default.

Semantic component type remains unchanged. PHYSICAL using RES still answers Physical queries, enters eligible non-TRUE reduction, and retains its ordinary Final Multiplier/Shield/provenance/Hit Admission behavior. No type relabeling, source Tag/capability mutation, Shield Piercing or Authority bypass is inferred.

Matching rules choosing the same stat share one selection; incompatible choices need an applicable explicit canonical conflict law or rejection before Damage commit. Authored list/Effect/Entity/Event order cannot choose a winner. Real Authority-bearing conflicts use AUT contracts; ordinary Rank filters are not Authority. Missing/foreign scopes, unsupported stats/custom formulas and TRUE mitigation are rejected.

Existing Damage Runtime/Contract Resolver owns this read-only selection; static owners register once under TRG-014 and remove/persist per declared lifetime. Reuse existing stat/penetration inputs and phase state; record rule refs/chosen stat/input/state version in trace/receipts needed for replay. No new mutable Character service, Tag or Primitive. Existing unqualified Physical/Will/True pipelines remain unchanged.

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

The Shield recipient and declared runtime owner are distinct roles. FIELD_PRESENCE_SCOPED retention/owner clocks follow the declared owner; source-owned contributions attached to other recipients are removed by that owner's committed field-leave lifecycle cleanup, preserving its removal cause rather than break/natural expiry. BATTLE_SCOPED grants do not acquire source-leave deletion implicitly. No timed expiry alone does not override an explicit field-scoped retention/transition policy. Source identity remains valid provenance after field leave.

This gives one simple gameplay Shield pool while preserving provenance for:
- expiry;
- source-specific removal;
- triggers;
- transfer;
- analytics.

Special Shield Profiles such as “only blocks Will Damage” may form distinct eligible layers instead of being merged blindly into Standard Shield Pool.

Implementation should use deterministic high-precision/fixed-point accounting so proportional depletion does not create source-order gameplay artifacts.

### SHP-002 opt-in exclusive first source family

04§18.2 may declare EXCLUSIVE_FIRST_SOURCE_FAMILY. Derive its exact recipient/source-family key from existing provenance, not a Character ID or list position. At a recipient's Damage calculation view, eligible contributions of that family form one first layer ahead of every other source's ordinary preference. Within the layer, absorbed Damage depletes contributions proportionally to eligible remaining values; independent clocks/source removal/terminal causes are unchanged.

Apply Damage eligibility and Shield Piercing first. Allocate participating simultaneous packet demand through this layer under RES-008, then pass only residual demand to the remaining valid Shield profiles and HP. First-layer priority cannot make an ineligible Shield absorb Damage, bypass Hit/Effect admission, change Authority or hide committed per-packet/source receipts.

Only one exclusive first family is supported at a recipient. Another incompatible exclusive family has no inferred winner; reject its affected addition/transfer before partial commit unless a separate approved conflict profile resolves it. Same-family independent contributions coexist. A zero/rejected addition creates no first-layer membership or terminal entitlement. Source/clock/lifecycle cleanup removes only real contributions with their actual causes; it never fabricates depletion or a terminal Heal.

Unprofiled Standard Shields retain proportional pooling. Ordinary consume-first metadata cannot outrank the opted-in exclusive family and does not itself define how other Shields are ordered. Save/replay retains the profile/family per contribution and applies one authoritative allocation/commit without grant/depletion duplication.

### SHP-002 opt-in recipient ledger partition

04§18.3 registers one recipient-owned exact-family/complement partition. Required source/origin evidence must prove membership; explicitly standalone grants may be remainder, but ambiguous legacy/proposed origins cannot be classified by absence and are rejected before affected registration/mutation. On the authoritative Damage calculation view, classify each admitted contribution once by immutable source-family provenance. Eligible remainder contributions form the first layer; eligible matched-family contributions form the second. Each layer depletes proportionally to its eligible remaining amounts, regardless of source count, grant order or expiry clock. Apply RES-008 packet allocation at each layer and pass only residual demands onward to HP. Piercing/ineligibility still skips the relevant layer.

This is a recipient rule; foreign producers retain their original source/owner/Ability/Effect refs. Cap group, Damage layer and source contribution identity are distinct. A source's expiry/removal retires only its remaining contribution, not a whole partition. Non-Damage conversion/removal follows its own selected set, not this Damage ordering.

Unsupported competing partition/exclusive-family/special-layer orders require an explicit composition law or rejection before the affected mutation, never a Character/Authority/list winner. No rule changes unprofiled Standard pooling or the existing exclusive first-family profile.

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

## SHP-005 — Committed Shield Creation/Addition Result
**Status:** `LOCKED`

Existing Shield creation/addition execution may expose an immutable `ShieldAdditionResultRef` alongside its source-aware ledger mutation. Current supported operations are `CREATE` and `ADD_VALUE`; this output introduces no new Shield Primitive or absorption layer.

At the same authoritative commit as the Shield mutation, preserve:

```text
operation
recipientRef
contributionRef(s)
requestedAmount
committedAddedAmount
committed / failure outcome
Action provenance when Action-owned; Effect/transaction provenance in all cases
stateVersion
```

Apply the independently authored admission, stacking and cap policy first. `CREATE` records the value actually inserted as the declared contribution; `ADD_VALUE` records the positive amount actually credited by that operation. Rejection cannot report a positive committed amount; a successful cap-to-zero addition reports zero without automatically failing the enclosing Action. Its contribution refs are empty: no zero-valued contribution is created, no old contribution is mutated, and no refresh/duration/expiry work is scheduled by that zero operation.

This is an operation-local receipt, not a net recipient/pool delta. Later absorption, removal, expiry or sibling Effects never rewrite it. A contribution's current `remainingAmount` cannot reconstruct how much the original Effect committed.

Pure duration refresh does not add positive Shield amount. `SET_VALUE`, `TRANSFER`, replacement or other manipulations require their own explicit operation-result mapping if a consumer needs an addition metric; no hidden cast to `ADD_VALUE` is allowed. This Contract does not decide a Character's reapplication policy, cap scope or whether its gameplay trigger should count such other operations.

Standard proportional depletion under `SHP-002`, special Shield eligibility and all terminal causes remain unchanged. Actionless static/System Shield execution remains legal; preserve its Effect/transaction receipt without fabricating an Action or inserting it into a Natural Action's direct set. Result retention uses the existing Action/Result Store until completion observers and dependent consumers are terminal; save/replay preserves the receipt and provenance, not a reconstructed later total.

---

## SHP-006 — Source-Family Cap on New Addition
**Status:** `LOCKED`

An optional `shield.sourceFamilyCap` bounds only a new supported creation/addition using the existing source-aware ledger on the recipient. Family identity is the explicit runtime source-owner EntityRef plus stable authored origin Ability and Shield Effect-definition refs. Successive cast instances match that family; different runtime owners do not. Admission and explicitly authored reapplication semantics remain authoritative.

In the same transaction as creation/addition:

```text
resolve validated source family and recipient
→ read active remaining family contributions + declared cap ValueRef at SHIELD_COMMIT
→ headroom = max(0, maximum - sum(active remaining family amount))
→ committed new amount = min(admitted requested addition, headroom)
→ if new amount > 0: commit admitted ledger addition + SHP-005 receipt atomically
→ if new amount = 0: publish successful zero SHP-005 receipt with no affected contribution refs; do not create/mutate a ledger contribution or duration/expiry work
```

Use existing deterministic Shield arithmetic; clamp headroom and the new amount nonnegative. Contribution expiry, removal or proportional depletion changes future headroom, not earlier receipts. A lowered cap/MaxHP does not retroactively trim old contributions under `CLIP_NEW_ADDITION`; it may leave zero headroom. No refresh, merge, old removal, duration change or independent absorption layer follows from this cap.

The cap read set and ledger mutation must be transaction-consistent so two additions cannot both consume the same headroom. If several competing additions share a cap, normalized data must supply an existing explicit sequential allocation/dependency order or reject an allocation-ambiguous batch. Incidental iteration order must not decide which duration/provenance receives limited headroom. This is a local addition law, not generic priority.

Uncapped Shields and `SHP-002` proportional Standard Shield depletion remain unchanged. Reject missing/ambiguous family provenance, unsupported operations, negative/nonfinite or otherwise invalid cap references and stale transaction reads rather than guessing a global or per-cast cap.

---

### SHP-006 opt-in recipient-partition cap

04§18.3 reuses this addition law for two independent recipient-local ledger views: an exact matched source family and its complement. Before a supported CREATE/ADD_VALUE commit, apply ordinary admission, resolve the active rule, classify the proposed grant, and protect the partition membership/remaining sum, maximum and registration revision with the ledger write. Clip the new addition to that partition's nonnegative headroom. Multiple unrelated remainder sources consume one common cap; matched contributions consume only the other cap. An applicable source-family cap additionally bounds the same addition by the minimum supported headroom, without a second grant/receipt.

Preserve each contribution's real provenance, stacking/duration/retention and SHP-005 positive/zero receipts. A zero grant has no contribution, refresh or terminal entitlement. Expiry/depletion/removal releases future headroom; lower caps do not trim existing entries under CLIP_NEW_ADDITION. Registration/removal of the rule changes the derived view, never rewrites prior receipts or silently discards Shield.

Protect both the applicable rule and ledger against stale reads; revalidate on conflict under existing transaction law. Explicitly ordered additions observe prior committed usage; unordered competing additions with observable allocation differences reject absent an approved allocation law. Unsupported positive SET/TRANSFER/replacement cannot bypass the cap and requires a compatible mapping or rejection before affected commit. Prior independently committed work follows its own failure/refund law.

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

## DMG-034 — Opt-in Reflected Scalar Packet and Source-local Basis
**Status:** `LOCKED`

04§16.5 opts into the existing REFLECTED_DAMAGE semantic. Omitted packetKind preserves ordinary component behavior. A reflected packet has one finite nonnegative requested scalar: coefficient × one sealed committed received-ActualHP projection for an explicit receiving reflector and immediate Damage Source. Its retained basis proves the reached outcome checkpoint and exact receipt/Effect membership; explicit declared children may participate, shared root/credit alone may not. DMG-010/011 exclude Shield absorption/Overkill/non-Damage removal. Ordinary and reflected committed receipts retain the built packet's immediate damageSourceRef and packetKind, independently of later live emitter state. P-043 groups `BY_DAMAGE_SOURCE` using that immutable packet Damage Source, separately from Damage Attribution/Effect Source/Action Actor. Different sources remain separate; same-source receipts aggregate without hit/list duplication.

The currently supported **explicit** mitigationProfile is BYPASS_ARM_RES_THEN_FINAL_REDUCTION:

```text
coefficient × committed received ActualHP basis
→ bypass ARM/RES and their Penetration/mitigation lookup
→ existing matching FINAL_DAMAGE_REDUCTION, once on the scalar
→ ordinary eligible Shield
→ HP-bound Actual HP Damage / Overkill
→ commit new reflected Damage result
→ mandatory lifecycle under the authored group boundary
```

This does not make reflection TRUE, PHYSICAL or WILL and introduces no fourth ordinary component. Do not run component-type transforms/mitigation-stat overrides, copy the original packet's mitigation/secondary Effects, infer Shield Piercing/Hit Admission bypass or ordinary final amplification. Reflect remains Damage for existing applicable admission/Authority rules. Actual Authority conflicts follow AUT-*; no tier is inferred from reflection.

Existing RES-006 evaluates matching reduction rules with packetKind available. An explicit ordinary component scope remains component-only. An unqualified applicable DAMAGE reduction can cover the scalar, or author a reflected packet-kind scope without component filters. TRUE still bypasses Final DR. Reflected-only incompatible component/phase scope is rejected; this profile adds no new reduction operation or generic ordering.

The new packet targets the locked immediate Source from its basis. Invalid/non-damageable Source skips under explicit local policy without retargeting to an owner/credited Entity. Source-group membership and simultaneous/sequential policy belong to existing Target/Resolution data; this Contract supplies no hidden source priority, global batch default or order between unrelated Trigger candidates. Freeze source-group Effect/packet identities and any applicable RNG domains from observed outcome + runtime activation/owner + normalized origin Effect + immediate Source before technical enumeration; list/Event order cannot allocate a different gameplay draw. Semantic identity keys are not source priority.

Preserve a distinct Effect/packet/result identity, reflection semantic, generating rule/State activation and causal received-result references. Actionless reflection needs no artificial Action; causal root lineage does not grant BASIC_ATTACK/Natural/Counter identity or direct membership in the triggering outcome. DMG-030–033 retain their ordinary no-reverse-reflect/no-Lifesteal/no-Counter defaults. Default reflection cannot consume an already-reflected basis; a future exception needs an explicit separate governing Contract.

Commit Shield/HP and immutable DamageResult through existing P-040/041/042 and Transaction/Result owners. Retain causal basis/immediate Source/packet kind and reflected receipts while dependent aggregate/terminal work references them. A committed receipt is not lost or recomputed because its Buff/source/recipient later becomes invalid; ordinary target validity controls **new** settlement, not historical evidence. Save/load/replay reuses terminal Effect/transaction identity; no duplicate packet, accumulator credit, terminal Heal or fake Action is permitted. Reject unavailable/unsealed/wrong-source basis, negative/nonfinite coefficient, foreign/ambiguous target binding, ordinary-component co-authoring and unsupported policies before affected mutations. Other reflected profiles remain REQUIRED_EXPLICIT, not a silent global mitigation default.

---

## DMG-035 — Read-only Single-recipient Fixed-area Damage Projection
**Status:** `LOCKED FOR EXPLICIT PROJECTABLE INPUTS`

An active State's opted-in query observes a retained enemy Natural fixed-positional Damage batch whose locked area contains its reserved Position. At POST_POSITIONAL_INTERPOSITION_PRE_DAMAGE, retain the batch's actual authored packet/formula/source/threshold bindings and authoritative defensive State/Shield/HP view. Resolve how much HP this one recipient would lose if only the named State-owned admission clauses were ignored. Other admission/Hit/Authority/mitigation/reduction/Shield/allocation laws stay applicable. No speculative movement, hypothetical downstream lifecycle or damage-listener execution.

Seal query membership against that exact active State at the pre-Damage checkpoint. It is independent from actual recipient admission, so exclusion of every real recipient does not erase a qualifying query. A State created after this batch commits, including by TRG-016, cannot project this earlier batch. Retained inputs are not a license to scan/replay past Damage against a newer State.

Reuse RES-001 calculation/P-040/P-041 with an isolated proposed-delta view. Multiple packet demands share one hypothetical Shield/HP budget under their applicable RES-002/008 policy; no per-packet double spend. Seal a distinct DamageProjectionResultRef(projectedActualHpDamage, batch/recipient/state/rule refs, phase version/input bindings). It is not a committed DamageResult or Actual HP Damage gameplay credit, and cannot enter P-043, Lifesteal, Reflect, HP_ZERO, ordinary listeners or action results.

Calculation consumes no real HP/Shield, emits no Damage, pays no resource and advances no gameplay RNG. Retained applicable draw facts or a declared pure keyed probe may be used; missing/unprojectable inputs require an explicit supported profile, not a guessed average or new ordinary draw. At observed batch terminal, an authored State transaction can credit the estimate once if that same State remains valid; a named-exclusion local no-recipient outcome may still be terminal. Abort/retired-State work receives no credit. A later batch independently reads then-current real state; never carry a shadow HP/Shield timeline forward.

When credit is authored, its credit/no-credit decision is required finite bookkeeping after the complete real batch and mandatory lifecycle/reconciliation, before next direct-group/Action/SSI continuation. Holding ordinary Reactions does not hold this dependency. A still-valid State receives one joined commit of counter delta and terminal credit identity; zero projection closes successfully without inventing positive Damage. Abort/retirement closes without credit. A return/removal graph cannot overtake a pending earlier batch credit. Multiple non-commuting mandatory settlements still need their explicit composition; this law adds no winner or unrelated priority. Reject dependencies that wait on their own held continuation.

Use batch + query/State instance + recipient + phase identity for calculation/credit deduplication. Keep the retained view/result until dependent credit is terminal; retain terminal identity across replay without replaying a committed counter update. Pure calculation and later State credit are separate boundaries. No new Damage type/Tag/Primitive or Character projection branch.

---

# 24. HEAL / OVERHEAL

## HEL-001 — Heal Calculation
**Status:** `LOCKED`

Heal resolves conceptually:

```text
requested Heal amount
→ qualifying PRE_OVERHEAL scoped amount modifiers
→ modified Heal amount
→ actual restorable HP up to Current Max HP
→ Overheal = remaining excess
```

If no qualifying `PRE_OVERHEAL` modifier exists:

> modified Heal amount equals requested Heal amount.

---

### PRE_OVERHEAL semantics

A `ScopedEffectAmountModifierSpec` with:

```text
effectType = HEAL
resolutionPhase = PRE_OVERHEAL
```

is evaluated under `RES-006`.

Its source/recipient/condition/value-query scope is resolved **before** Overheal is calculated.

The resulting modified Heal amount becomes the Heal quantity used to determine:

```text
actual restored HP
+
Overheal
```

Therefore:

> Overheal must be derived from the already-modified Heal amount.

A PRE_OVERHEAL rule must not:

1. calculate Overheal from the unmodified Heal;
2. then modify only the restored-HP portion;
3. leave the old Overheal amount unchanged.

That would violate the declared resolution phase.

---

### Recipient-local behavior

The modifier evaluates against the actual Heal recipient.

A rule scoped to:

```text
ALLY relative to SELF
excluding SELF
```

does not modify self-Heal merely because the Heal was created by the same source.

---

### Value-query timing

Any modifier `valueQueries` used by this phase observe the authoritative state at the PRE_OVERHEAL evaluation point unless the authored formula explicitly references a prior Snapshot.

No hidden Heal-time snapshot is implied.

---

### Authority boundary

Rank/Element predicates used to calculate or qualify a Heal modifier are ordinary structured gameplay conditions.

They do not become Authority merely because a queried entity has:

```text
Rank = Prime
```

or:

```text
Effective Element = Light
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

### HEL-003 explicit Shield-conversion denial

An opted-in 04§17.2 Heal may deny Overheal-to-Shield conversion for its exact immutable result. Keep ordinary requested/modified Heal, actualRestore and numeric Overheal unchanged; DISCARD without the new denial retains existing external-conversion behavior.

A conversion binds its originating HealResultRef(s) through supported typed Overheal/Snapshot/delayed derivations. Before any conversion Shield mutation, consult those retained result policies. A denied origin closes that conversion locally with no grant/addition/refresh/cap mutation, regardless of converter allegiance/owner. The already-committed Heal is not rolled back, reduced or failed.

Copying a number, changing issuer/Action lineage, removing the Heal source or delaying the converter cannot erase a declared conversion's causal origin. Missing/unavailable origins and nominal/live reconstruction are invalid conversion inputs. Retain immutable origin/policy refs while a declared conversion depends on them, including save/replay. Independently sourced Shields and supported conversions of another Heal remain governed by their own law; numeric equality/root identity alone proves no denial.

This is typed result eligibility for Shield conversion, not a new Immunity State, Authority tier, global Overheal ban or general numeric taint/foreign-hook registry. A future explicit override requires its own approved law; ordinary converter capability cannot override DENY.

## HEL-004 — Heal Does Not Revive
**Status:** `LOCKED`

Heal cannot materialize a DEATH_CONFIRMED entity unless a special Ability explicitly has Revive semantics.

---

## HEL-005 — Damage-derived Additive Heal Coefficients
**Status:** `LOCKED EXPLICIT PROFILE`

An opted-in Heal identifies one sealed committed Actual-HP-Damage projection and local settlementId (04§17.1). Exact provenance/declared child paths determine the projection; never sum every same-root Effect. DMG-010/011/012 exclude Shield/Overkill/non-Damage removal. Existing Result/Trigger/completion-DAG owners instantiate the one settlement by observed Action + recipient + local settlementId, independent of technical Trigger re-delivery.

Before ordinary requested-Heal resolution, the existing scoped modifier resolver evaluates matching `DAMAGE_DERIVED_HEAL_COEFFICIENT` ADD rules over one authoritative checkpoint view. Sum their finite nonnegative coefficients with the explicit base coefficient in an order-independent numeric operation. Conditions/values default to that phase's state; explicit prior Snapshot/result bindings retain their meaning. Do not coalesce different basis projections, recipients, settlement checkpoints or independent Heal Effects; equal numeric totals/shared lineage prove no equivalence. Multiple independently authored producers claiming the same settlement require a single explicit owner/composition plan, otherwise reject rather than pick by list/Trigger order.

`C = baseCoefficient + sum(qualifying additions)`; `requestedHeal = C × committedDamageBasis`. C0 emits no damage-derived Heal. Positive C with basis0 uses ordinary zero-Heal law. Produce at most one Heal for this opted-in settlement, then apply unchanged HEL-001 PRE_OVERHEAL/admission/restoration and HEL-002/003 explicit Overheal handling. Do not multiply coefficients, emit one Heal per contributor/packet, recalculate Damage or retroactively rewrite the projection after later lifecycle/recovery.

Coefficient evaluation is not an arbitrary amount ADD/phase, a Stat pool, new Lifesteal Tag/Primitive or a priority service. Retain the fold's participating modifier refs/read or Snapshot bindings and sealed basis identity with the existing Heal execution/result for trace/replay; positive contribution does not guarantee Effective Heal. Independent SSR Warrior Heal/Overheal conversions and existing MULTIPLY phases retain their semantics.

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

## POS-008 — Bounded Pre-Damage Relocation and Deferred Counter
**Status:** `LOCKED FOR EXPLICIT FIXED-POSITIONAL PROFILES`

The bounded phase is locked geometry → qualifying relocation group → current occupants → Damage calculation/commit. Only explicit fixed/non-random positional Damage and declared incoming Action/outcome scope may open it. Single-target, random selection, independent periodic/reaction/counter Effects do not qualify through shared lineage. Check charged State/owner position against the fixed area at phase entry; retain that area after movement. Destination inside the same area is legal if the authored predicate permits it and may still receive the original Damage. Relocation is not Hit-Admission immunity or guaranteed evade.

For SEEDED_ONE_TO_ONE_COMMON_DESTINATIONS, freeze eligible actor/rule instances and the common POS-009 destination set in one phase view. Seeded selection chooses actors if capacity is insufficient and seeded distinct assignment maps selected actors to unique destinations, with equal eligible participation and permutation-invariant set-to-draw mapping. Never use Slot/Entity/list/Event order as a winner. Planned source departures do not add destinations to this frozen set. Unequal destination-legality graphs or competing rules for one actor require an explicit supported composition; no greedy/list fallback.

Validate and commit assigned moves with success-only own-State/counter updates, declared post-move source snapshots/hostile Actor bindings and deferred obligation creation as one coherent transaction. No assignment/failure publishes any success mutation or counter; unassigned actors retain allowances. Ordinary relocation failure then follows its explicit PositionMutationSpec failurePolicy, such as no movement and continue original Damage; unsupported content is a separate fail-closed error. Never expose a moved actor with unconsumed allowance or missing obligation. Publish the existing single POSITION_MUTATION_COMMITTED collection after commit under TRG-007. Preserve prior Position Mark observer eligibility and already-required immediate State bookkeeping; that Event creates no global Reaction priority.

An opted-in frozen-Damage deferred counter releases at its observed root's ADEC, after that root's declared attacker Heal/remaining direct work and mandatory lifecycle. Source death after creation cannot revoke RETAIN_CREATED_SETTLEMENT; invalid locked hostile Actor drops locally without another target. Seal all eligible obligations of the explicit batchProfileRef/observed root/checkpoint into one finite SIMULTANEOUS counter batch, PROPORTIONAL under RES-008 when recipient demands overlap. Freeze recipient defence/calculation state at counter-batch entry. Keep separate source/Effect/receipt provenance; these counters are not the hostile root's direct outcome or Natural Actions. Do not run ordinary Counter between the source Damage and its authored Heal. Other Reactions obtain no priority from this local group.

Keys are incoming group/root/checkpoint + rule/owner/State instance + movement commit + batch profile. Movement redelivery/resume cannot spend again or create another obligation; counter redelivery cannot recommit Damage. Keep frozen bindings through source cleanup until settlement terminal, then retire payloads under existing replay horizons. Observed-root cancellation before release or battle termination still requires its existing explicit terminal/queue policy; this profile does not resolve the global ordinary queue cutoff. Normalizer rejects arbitrary callbacks, recursion/fixpoint movement, mutation-bearing counter preparation, missing allowance/failure/lifetime/allocation law or incompatible observable interpositions. Malformed IR fails before affected Damage, never by quietly skipping the declared phase.

## POS-009 — Truly-empty Position Predicate
**Status:** `LOCKED FOR EXPLICIT TRULY_EMPTY READS`

A Mode-legal destination is TRULY_EMPTY only when one authoritative view has no active occupant and no valid deployment reservation, death-waiting/pending-Revive reservation, absent/present owner, temporary reserved occupancy or other lifecycle/presence claim. A renderer disappearing, 0 HP or a temporarily damage-ineligible occupant does not release a claim. Read existing Position/Lifecycle/Deployment/Materialization owners; create no duplicate occupancy store. A Mark alone is not a claim. Own current coordinate is excluded where the relocation author excludes it. Claim creation/removal follows its existing owner transaction, not this predicate.

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

This is the ordinary lethal Damage/Cost/HP-loss path. An explicitly authored DIRECT_EXECUTE profile follows DTH-008 instead; the Execute label alone never selects that exception.

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

An explicitly transition-completed profile follows DTH-007; survival/prevention success cannot commit independently before its required Return completes.

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

## DTH-007 — Transition-completed Death Prevention
**Status:** `LOCKED EXPLICIT PROFILE`

An opted-in deathPrevention Effect with completionTransitionRef owns one local completion transaction. Current bounded completion is an authored same-subject RETURN_TO_DECK in the current Combat Instance; the existing Return profile remains authoritative. The open HP_ZERO evaluation is held before DEATH_CONFIRMED while this candidate settles, not treated as a new ordinary Reaction window.

Freeze the legal survivalHp/allowance and Return retention decisions in the protected candidate transaction. Validate Return against the proposed surviving post-state; do not publish HP1/alive early just to make deployment validation pass. Stage survival/life state, presence/Position exit, Deck/deployment state, selected State/Shield cleanup and any one-unit consumeCounterRef. Counter owner/lifetime must be explicit and its committed exhausted state must survive that transition.

```text
all completion validation succeeds
→ one common commit of survival + prevention success + Return + selected allowance
→ observers see the coherent alive/Deck/survival-HP post-state
```

On transition/allowance/protected validation failure: no survival assignment, DEATH_PREVENTED, use consumption, transition or transition-cleanup delta from this completion remains committed. For the unchanged HP_ZERO subject keep HP0; mark this candidate attempt terminal and resume the **same** death evaluation under existing lifecycle/other-candidate laws. A protected-state conflict preserves the latest authoritative state and revalidates that context; never restore stale HP/allowance/presence or undo another commit. Ordinary DEATH_CONFIRMED may follow when evaluation remains lethal. This attempt does not consume the battle allowance, which stays unused for a later qualifying episode in the unchanged fixture, but does not requeue this failed attempt endlessly at the unchanged HP0.

Earlier independently committed Effects are not rolled back; local failed/zero Leader Heal does not become a Return prerequisite. Subsequent Current Deployment Cost modification must require successful completion and follows DEP-006 separately. A later blocked/clamped mutation does not roll back prevention/Return or restore use. No fake confirmed death/Revive, repeated lethal debit, extra Action or lifeSerial change.

The existing P-061 terminal result identifies this candidate/completion instance. Success-dependent downstream work reads that outcome, not live Deck/HP state or another return's success. Retain it until dependent work is terminal; replay uses the same outcome and Effect cursor, not a second successful mutation.

Reuse P-061, the existing Return/Lifecycle/State owners and Transaction Manager. Persist death-evaluation/candidate/transaction/outcome identity for replay; restore cannot expose a partial completion or consume/emit/clean up twice. No generic callback, global prevention priority or automatic cleanup profile is created. Unprofiled prevention and standalone Return semantics remain unchanged.

---

## DTH-008 — Explicit Direct Execute Confirmation
**Status:** `LOCKED EXPLICIT PROFILE`

An admitted lifecycle request with confirmationPolicy DIRECT_EXECUTE is an explicit lethal condition under P-060, not Damage/HP Loss/HP Cost. Authored threshold, qualifying result, target lock/revalidation, Cost/use and local settlement dependencies remain separate inputs. Neither the name Execute nor a display animation supplies those fields or selects a global default. Opening its context keeps target HP/lifecycle proposals private until the protected confirmation barrier; it does not publish an ordinary HP_ZERO or partially admitted death state.

Resolve existing Effect admission and real Authority-bearing anti-death conflicts for the locked current-instance subject. No Authority bypass, Rank/Class/lore winner, Shield removal or Penetration is inferred. A rejected/invalid request commits no Execute HP/lifecycle/confirmation delta; prior independent payment/use follows its explicit upstream Contract and no automatic refund is invented.

For a successful request, the existing lifecycle transaction commits:

```text
subject Current HP = 0 + DEATH_CONFIRMED
→ existing confirmation attribution / canonical death and kill observers
→ ordinary mandatory post-confirmation lifecycle processing
```

It does **not** offer the ordinary pre-DEATH_CONFIRMED HP_ZERO / Death-Prevention window. Do not publish an intermediate lethal-HP Event that dispatches that ordinary window, invoke P-061 merely because HP becomes0, or expose HP0/alive to ordinary observers between the joined writes. P-060 records the explicit confirmation policy; P-062 records canonical death exactly once using current death-evaluation/commit identity. Already-confirmed/invalid recipients cannot be confirmed again by replay or a stale request.

This operation supplies no Actual HP Damage receipt. Earlier immutable Damage results remain unchanged; nominal Execute HP removal does not augment Heal/Rage/threshold metrics bound to those results. Post-death recovery never changes whether confirmation occurred.

Revive and genuinely **post-DEATH_CONFIRMED** Return/recovery mechanics remain eligible under their own laws. A pre-confirmation prevention such as Nerovar's HP_ZERO Passive cannot intercept this profile. Recovery does not refund already committed activation Cost/use merely because the recipient is alive again. Do not manufacture recovery, fold it into Execute's commit or choose unrelated observers' priority.

Reuse P-060/P-062, existing Lifecycle/Authority/Transaction/Result owners and idempotence records. Persist policy, subject/cause/attribution, death-evaluation/commit and terminal-request identity through pending observers/replay. Ordinary lethal Damage/Cost/loss continues through DTH-001/003; other content called Execute remains REQUIRED_EXPLICIT until its own profile is authored. No new Functional Tag/Primitive or generic priority system.

Request identity comes from the original stable Effect-execution/candidate plus subject/current-instance, not a newly allocated death context. Check terminal identity before opening another context. A later Revive, including ordinary Revive retaining lifeSerial, does not make replay of this old successful/failed request new work. Preserve terminal identity for the replay horizon independently of released result/observer payloads; reject delivery older than the retained horizon rather than confirm anew.

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

## REV-007 — Revive-Joined MaxHP Contribution Removal
**Status:** `LOCKED EXPLICIT PROFILE`

Existing source-aware MaxHP mutation records may opt into reviveRemoval BEFORE_HP_RESTORE. For an entitled post-DEATH_CONFIRMED Revive, stage removal of only matching recipient contribution refs inside the existing Revive/materialization transaction. Recompute projected CurrentMaxHP with all other contributions preserved, applying declared expiry reconciliation. A Revive formula reading CurrentMaxHP sees this projected value before HP assignment; a formula explicitly reading an immutable death/source Snapshot continues to read that Snapshot. Missing/contradictory restoration composition remains REQUIRED_EXPLICIT.

Validate final eligibility/materialization/restore plan and atomically commit record removal + restored MaxHP + revived CurrentHP with ordinary materialization/lifecycle deltas. Failure/stale protected input commits no reset, no HP, no materialization or duplicate entitlement/use. No separate pre-Revive removal can survive a failed Revive. Successful reset is not Heal; Revive HP remains REV-005 initialization. Preserve ordinary lifeSerial, death waiting/race/position and special explicit restoration law.

Record/transaction/result provenance and protected contribution read set provide idempotent save/replay. Default unmarked mutations and ordinary Revives are unchanged. This is a bounded reset of authored MaxHP contributions, not a Character cleanup branch, callback or universal temporary-State restore/reset policy.

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

### Opt-in live threshold contributions

04§30.1 declares an immutable positive-integer ADD contribution owned by one normalized static rule and its exact active Entity × Combat Instance Field Presence lifetime in the existing World Luân Hồi ledger. The ordinary live policy is:

```text
effectiveThreshold = baseWaitingThreshold + sum(active admitted contributions)
baseWaitingThreshold = 4 for the ordinary policy
eligible(record) = record.state is WAITING
                   and record.laterDeathCount >= effectiveThreshold
```

Different declared source rules/lifetimes contribute independently; rebuilding the same registration does not add it twice. Field leave removes availability, not accumulated death progress. Apply a changed threshold immediately to every current waiting record without resetting laterDeathCount, re-counting historical deaths or creating synthetic deaths. Increased threshold cannot reopen a closed/Revived/Reincarnated record.

One owning committed transaction/checkpoint supplies the coherent final active-contribution view and waiting progress. Apply all its additions/removals/instance transfers before one all-entry threshold decision. Two removals causing8→4 do not publish irreversible8→6 decisions first; a coherent transfer with unchanged final contribution sum causes no transient shrink. A separate sequential transaction is a genuinely later checkpoint, not coalesced by convenience.

If the same checkpoint also commits a qualifying Death Cohort, preserve REC-004's pre-cohort membership: advance old waiting entries once by the qualifying cohort size, evaluate them against the coherent resulting contribution threshold, and create new cohort entries at0. Coherent presence changes caused by confirmed source deaths are part of this world-law read view. New cohort members never advance one another or become old waiting entries merely due to service/list order. Mandatory presence/lifecycle and threshold bookkeeping closes before ordinary queued Revive/Reactions or later Action work sees eligibility; after a non-death leave, a pending Revive cannot bypass the required threshold update.

This is a threshold predicate over all waiting entries, not an oldest2/4 quota. Every same-progress entry satisfying it transitions, including all tied qualifying cohort members. No RNG/Entity/Slot/list/Event order may split equal threshold outcomes. Each transition retains existing REC-005 routing separation and normal waiting-record closure.

Protect the presence/registration revision, ledger/progress read set, threshold decision and transition identity through the existing transaction/required world checkpoint. Do not expose final presence with stale revive-eligibility or a partial waiting-pool decision to ordinary observers. Resume/redelivery reuses terminal checkpoint/record identities, never re-removes a contribution or advances a cohort twice. Retire a contribution's index at the owning presence end and terminal work at the existing replay horizon; retain immutable origin/checkpoint evidence.

With no active contributions, the ordinary effective threshold remains4. Ordinary waiting entries from Characters without their own modifier still use the current World-ledger contributions. This profile does not silently override a separate explicit waiting-window/Authority/retention rule: compose only under its actual compatible law, otherwise reject executable ambiguity. No new Authority tier, Primitive, runtime subsystem, callback or global Reaction priority is inferred.

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

### Restricted declarative Basic projection and frozen ownership

04§16.3A selects fixed BASIC_DIRECT_DAMAGE projection, not unrestricted Ability/Combat Definition inheritance. Preserve only dependency-closed direct Damage/hit grouping and declared exact-Basic-owner targeting inputs. Drop excluded effects/listeners/resources/identity/Authority/child behavior; reject retained formulas/target dependencies requiring excluded semantics. Temporary runtime modifiers are not source-definition coefficients.

Scale typed numeric coefficients once, bind generic source-stat/HP reads to the receiving actor at declared retained checkpoints, and preserve supported target/world reads. Do not multiply resolved Damage or retain deceased values. Unsupported damaging profiles remain REQUIRED_EXPLICIT; only genuinely no-Direct-Damage Basics use explicit final fallback, without another scaling pass.

Projection data supplies no Action identity/behavior. A receiving actor declaring BASIC_ATTACK/FOLLOW_UP performs a real non-Natural Basic; an outer Skill merely using the fragment remains a Skill. Exact-owner explicit projection may preserve that Basic's Entity/Both exception or targeting-profile Guaranteed Hit, but grants none to siblings/parent/other attacks and retains no Authority. Ordinary Hit/lifecycle admission and TGT-008 still govern.

Record creation identity is distinct from profile equality/source trueSelfId/lifeSerial. Repeated qualifying deaths, even of the same ordinary-Revived life identity, may create distinct records; redelivery of the **same** death/candidate cannot. Freeze payload at declared actor creation. Store eviction removes membership only; dependent actor bindings retain immutable profile and original creation identity. Snapshot retention follows all declared State/actor/pending consumers, then ordinary cleanup/replay lifetime. No mutable link to the deceased actor or retained-store choice.

Materialization atomically commits actor initialization, placement and Basic binding through existing P-051/definition/Transaction owners. Invalid source checkpoint/profile/owner/placement creates no half-bound actor or record mutation for that failed operation. A prior independent successful record creation is not rolled back by local Spawn failure. Full-inheritance and ordinary profile-copy Contracts remain unchanged.

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

## ENT-015 — Summon Identity
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

1. Character has valid long-lived membership in the relevant battle Deck;
2. Character's current deployment state permits Deck → Battlefield deployment;
3. additional deployment eligibility conditions pass;
4. `CURRENT_DEPLOYMENT_COST` is resolved and numerically executable;
5. Deployment Cost Bar can pay that Current Deployment Cost;
6. requested Battlefield placement is valid;
7. destination can be reserved for the transaction.

Canonical distinction:

```text
DECK_MEMBERSHIP
≠
CURRENT_DEPLOYMENT_STATE
≠
CURRENT_DEPLOYMENT_COST
≠
DEPLOYMENT_COST_BAR
```

A Deck member may currently be:
- deployed;
- dead/waiting;
- unavailable;
- otherwise not deployable.

### Transaction payment value

The transaction resolves one authoritative:

```text
deploymentPaymentAmount
=
CURRENT_DEPLOYMENT_COST
```

from pre-commit authoritative state.

Validation and debit for that transaction must use the same resolved value.

Do not:
- validate against Base Deployment Cost and pay Current Deployment Cost;
- validate one Current value then silently re-read a different Current value inside the same atomic commit;
- treat Current Deployment Cost as the Side Deployment Cost Bar.

### Successful commit

If validation succeeds, one atomic deployment transaction commits the required deployment state, including:

```text
Deployment Cost Bar debit by deploymentPaymentAmount
current deployment-state transition to Battlefield-active/deployed
valid destination Position / active Field Presence
Current Rage = Max Rage
required battlefield registration
```

Successful deployment changes current deployment state.

It does not remove the Character's long-lived battle Deck membership.

Only after commit are post-commit deployment/presence observations exposed.

The `ENTER_FIELD` observer therefore sees already-committed deployment state, including full Rage.

Trace/event sequence does not create gameplay priority among unrelated listeners.

### Failed deployment

If validation fails before commit:

- Deployment Cost Bar is unchanged;
- deployment state does not transition through that attempt;
- active Field Presence is unchanged by that attempt;
- full-Rage deployment assignment does not commit;
- no successful deployment observation is published.

A roster Character deployed this way is not automatically `SUMMON`.

Successful deployment does not itself grant an extra Natural Action; `DEP-005` remains authoritative.

---

## DEP-002 — Base and Current Character Deployment Cost
**Status:** `LOCKED`

When the distinction is gameplay-observable:

```text
BASE_DEPLOYMENT_COST
≠
CURRENT_DEPLOYMENT_COST
≠
DEPLOYMENT_COST_BAR
```

### Base Deployment Cost

`BASE_DEPLOYMENT_COST` is the resolved Character baseline produced by Character metadata / Cost Budget architecture.

During authoring/Pilot Normalization:

```text
TBD_BY_COST_BUDGET
```

is allowed.

Execution-ready battle/deployment content that needs numeric payment must not execute with unresolved required Base/Current Deployment Cost.

This Contract does not define the future Cost Budget formula.

### Current Deployment Cost

`CURRENT_DEPLOYMENT_COST` is authoritative battle-scoped Character deployment state.

Battle initialization order:

```text
resolve BASE_DEPLOYMENT_COST
→ CURRENT_DEPLOYMENT_COST := BASE_DEPLOYMENT_COST
→ initialize Current-Deployment-Cost lock state as unlocked
→ settle qualifying PASSIVE_STATIC battle-initialization mutations under TRG-014
→ expose final initialized Current value to later deployment/formula reads
```

For Alcestis, Character data may therefore compose:

```text
PASSIVE_STATIC initialization
→ ADD_CURRENT -5
```

and the mutation occurs exactly once per battle rather than once per redeployment.

Current Deployment Cost:
- is used by `DEPLOY_FROM_DECK`;
- may be read by typed ValueRef;
- may be snapshotted;
- persists through ordinary Return-to-Deck within the same battle unless a separate explicit transition says otherwise;
- resets from Base at a new battle initialization;
- is not a Resource Pool.

### Floor

The Character's declared Current Deployment Cost floor is enforced by `DEP-006` whenever a Current-value mutation commits.

Pilot #4 currently uses:

```text
floor = 1
```

The floor does not rewrite Base Deployment Cost.

### Lifetime

Current Deployment Cost and its lock are battle-scoped deployment-system state.

They do not reset merely because Field Presence ends or the Character returns to Deck.

This Contract does not claim that every unrelated lifecycle transition preserves them; those transitions use their own explicit semantics.

---

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

## DEP-006 — Current Deployment Cost Mutation and Lock
**Status:** `LOCKED`

`DeploymentCostModificationSpec` operates on:

```text
CURRENT_DEPLOYMENT_COST
```

only.

It does not mutate:
- `BASE_DEPLOYMENT_COST`;
- `DEPLOYMENT_COST_BAR`;
- AE;
- Rage.

### `ADD_CURRENT`

When Current Deployment Cost is unlocked:

```text
candidateValue
=
CURRENT_DEPLOYMENT_COST + authoredValue
```

then commit:

```text
CURRENT_DEPLOYMENT_COST
=
max(declaredFloor, candidateValue)
```

The mutation reads the authoritative Current value at its declared resolution point.

### `LOCK_CURRENT`

For the current Pilot #4 operation set, `LOCK_CURRENT` freezes the exact then-authoritative Current Deployment Cost for the remainder of that battle.

```text
lockedValue
=
CURRENT_DEPLOYMENT_COST at lock commit
```

After successful lock:

```text
CURRENT_DEPLOYMENT_COST
=
lockedValue
```

for the battle remainder against ordinary `ADD_CURRENT` mutations.

A new battle initialization clears that battle lock and initializes new Current state under `DEP-002`.

There is no implicit unlock operation in the current Schema.

### Mutation while locked

An ordinary `ADD_CURRENT` that reaches this Contract while Current Deployment Cost is locked commits no Current-value change.

The lock itself does not:
- retroactively invalidate the enclosing already-admitted Action;
- roll back already-committed Effects;
- block unrelated Side Deployment Cost Bar gain.

Character data may conditionally omit/skip a mutation when lock state is already known.

No Character-ID branch is permitted.

### Snapshot/read ordering

A previously committed Snapshot remains immutable.

Therefore:

```text
C_cast
=
snapshot CURRENT_DEPLOYMENT_COST
```

may be followed later by:

```text
ADD_CURRENT -1
```

without changing `C_cast`.

Locking or later mutation never rewrites an earlier Snapshot.

---

## DEP-007 — Return-to-Deck Transaction
**Status:** `LOCKED`

`RETURN_TO_DECK` is an explicit deployment/lifecycle transition.

It is not an alias for:
- generic `LEAVE_FIELD`;
- Death / `DEATH_CONFIRMED`;
- `REMOVED`;
- Summon despawn;
- ordinary Temporary Absence;
- Revive;
- Reincarnation;
- Arena transfer/return.

### Required successful post-state

For a valid Battlefield-active roster Character:

```text
active-present in current Combat Instance
→ not active-present in that Combat Instance

current deployment state
→ Deck / undeployed-returned state

battle Deck membership
→ retained
```

The presence result is:

```text
LEAVE_FIELD
```

The cause/destination semantic is:

```text
RETURN_TO_DECK
```

The two are not interchangeable.

### Validation

Before commit, validate at minimum:
- subject/source deployment state matches the declared transition source;
- required current Combat-Instance presence relation;
- destination deployment state is legal;
- declared Deck-membership policy is satisfiable;
- retention profile is valid for the transition.

If validation fails:

```text
no Return-to-Deck state transition commits
no transition-owned cleanup commits
no partial presence/deployment destination commits
```

Already-committed earlier Effects in the enclosing Action are not automatically rolled back.

Later Effects whose gameplay requires successful Return-to-Deck must be explicitly gated/dependent on the successful post-transition state.

No hidden “assume success” fallback is created.

### Atomic transition commit

A successful Return-to-Deck commits one coherent authoritative post-state.

The transition must not expose accidental half-states such as:

```text
old Field Presence ended
but current deployment state still Battlefield-active
```

or:

```text
deployment state says Deck
while old Combat-Instance active presence remains true
```

Transition-owned cleanup under `DEP-008` belongs to this same authoritative transition state.

Internal service-call order is implementation detail, not gameplay priority.

### Post-commit observability

Observers released after the commit see the coherent post-transition state.

Trace/event sequence does not by itself order unrelated Reactions/listeners.

This Contract does not resolve global `TRG-005`.

### Already-admitted Action continuity

A successful `RETURN_TO_DECK` does not by itself cancel the already-admitted Action that caused it.

That Action may continue through explicitly-authored downstream Effect nodes whose own Conditions/targets remain legal.

This does not permit a new off-field Natural Action.

It only preserves the existing admitted Action execution context.

A later Effect whose semantics require active Field Presence must still pass its own legality/Condition rules.

### No implicit extra effects

`RETURN_TO_DECK` itself does not automatically:
- Heal/reset Current HP;
- mutate `lifeSerial`;
- decrement Current Deployment Cost;
- gain Deployment Cost Bar;
- grant Rage/full Rage;
- grant a Natural Action.

Those are separate explicit mechanics.

For Alcestis:

```text
successful RETURN_TO_DECK
→ later explicit Current Deployment Cost -1 if unlocked
→ later explicit Side Deployment Cost Bar +3
```

is authored composition, not built into Return-to-Deck globally.

### Redeployment

After successful Return-to-Deck, a later legal entry is a fresh:

```text
DEPLOY_FROM_DECK
```

transaction under `DEP-001`, `DEP-003`, and `DEP-005`.

---

## DEP-008 — Return-to-Deck Retention and Transition Cleanup
**Status:** `LOCKED`

`ReturnToDeckSpec.retentionProfile` is transition-owned lifecycle/deployment semantics.

It is not an authored Cleanse Ability.

### Cleanup decision snapshot

The retention decision set is derived from authoritative pre-transition state before cleanup commit.

For every relevant attached State/Shield contribution, evaluate the bounded profile without letting cleanup iteration mutate the classification basis for later entries.

Current profile decision precedence is:

```text
1. discardStateClassifications
2. discardRetentionScopes
3. retainRetentionScopes
4. unmatchedStatePolicy
```

The first matching explicit decision is authoritative.

This guarantees that an authored rule:

```text
discard all DEBUFF
```

still discards a Debuff even if that Debuff also has:

```text
retentionScope = BATTLE_SCOPED
```

### Authority boundary

Transition-owned retention removal is not:

```text
Cleanse Effect
vs
State Authority
```

competition.

Ordinary Cleanse-vs-State Authority adjudication is therefore not invoked merely because a removed Buff/Debuff/Mark has an Authority-bearing source.

If a future mechanic explicitly protects a State from lifecycle/deployment transition cleanup, that future semantic must define the actual conflict.

Do not infer such protection from Authority Tier alone.

### Retention-scope behavior

Pilot #4 currently relies on:

```text
FIELD_PRESENCE_SCOPED
BATTLE_SCOPED
```

A profile may discard:

```text
FIELD_PRESENCE_SCOPED
```

State/Shield contributions and retain:

```text
BATTLE_SCOPED
```

State.

Normal transition cleanup must not require Character-specific State-ID lists when classification/retention metadata already expresses the intended lifetime.

### Unmatched State

`unmatchedStatePolicy` applies only after no earlier classification/scope rule decides the item.

For:

```text
unmatchedStatePolicy = RETAIN
```

unspecified State is retained.

This avoids silently deleting unrelated State that the transition profile never selected.

### Current HP

For:

```text
currentHpPolicy = RETAIN
```

Return-to-Deck does not Heal, reset, or otherwise reconcile Current HP merely because deployment state changes.

### Terminal cause

A State/Shield contribution removed by this profile terminates under:

```text
TRANSITION_CLEANUP
```

while the owning transition remains identifiable as:

```text
RETURN_TO_DECK
```

It must not be silently reclassified as:
- Shield damage depletion/break;
- natural Shield expiry;
- natural State duration expiry;
- Cleanse.

Therefore observers requiring one of those other causes do not qualify from `TRANSITION_CLEANUP` alone.

### Shield ledger

When transition cleanup removes a Shield contribution:

- remove only the selected contribution(s) through the source-aware Shield ledger;
- do not fake Damage absorption;
- do not fake natural expiry;
- preserve the transition-cleanup cause.

Unselected Shield contributions remain.

### No false terminal settlement

A mechanic whose trigger requires:

```text
Shield broken/depleted
OR natural Shield expiry
```

does not trigger from transition cleanup.

Likewise a State with a natural-expiry terminal Heal does not receive that Heal merely because Return-to-Deck removed the State early.

### Battle-scoped deployment-system state

`CURRENT_DEPLOYMENT_COST` and its lock belong to deployment-system battle state rather than the ordinary attached-State cleanup collection.

Return-to-Deck preserves them unless an explicit separate deployment rule changes them.

Already-committed Current Deployment Cost reductions remain committed.

### Commit / determinism boundary

All retention decisions belong to the Return-to-Deck transition's authoritative commit.

Cleanup order among selected State/Shield entries must not create gameplay priority.

If several terminal observations are emitted for traceability, their `eventSeq` values remain trace order unless another explicit Contract says otherwise.

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
24. a `ScopedEffectAmountModifierSpec` uses an undeclared/custom resolution phase, arbitrary executable logic, or an Effect/component scope incompatible with that phase.
25. a modifier `valueQuery` mutates state, consumes RNG, performs Effect/Action work, or uses a relation without its required explicit anchor.
26. a `FINAL_DAMAGE_REDUCTION` scoped modifier attempts to modify True Damage without another explicit higher Contract allowing that semantic.
27. a distributed optional payer collection is first snapshotted after required Cost payment has already begun.
28. a distributed payer Cost is normalized as caster Damage/HP Loss rather than that payer's own Cost.
29. an optional distributed payer under `CONTRIBUTION_ZERO_CONTINUE` is allowed to fail the entire Ability merely because that payer cannot pay.
30. multiple distributed payer outcomes are collapsed into one ambiguous singular `COST_PAYMENT_RESULT`.
31. downstream gameplay requiring actual committed payment reads/reconstructs the nominal Cost formula instead of the typed committed Cost-payment result.
32. `actualPaidAmount = 0` is treated as proof that `success = false`.
33. a `PRE_ADMISSION_PRE_COST` interposition discards the original Action Intent through ordinary legality/payability probing before the declared settlement/revalidation occurs.
34. Action-Intent revalidation failure silently falls back to Basic Attack or another Action form not explicitly authored in the fallback candidate data.
35. a `POST_COST_PRE_EFFECT` interposition permits the original Ability's direct Effects to begin before the declared interposition settlement has completed/failed according to policy.
36. an Action-Intent interposition is normalized as an additional Natural Action, arbitrary callback, arbitrary timing hook, or global Reaction priority mechanism.
37. a sequential Action authored with `reactionBoundary = AFTER_DIRECT_EFFECTS_COMPLETE` exposes an ordinary Reaction window between its direct sequential components.
38. more than one branch of one `ActionIntentInterpositionSpec` matches the same Action Intent at `ACTION_INTENT_CREATED` without an explicit canonical branch-selection policy.
39. more than one independent Action-Intent interposition instance matches the same Action Intent + canonical anchor without an explicit composition/dependency policy; authoring order, Event order, Character ID, or incidental iteration order must not become hidden priority.
40. a `POST_COST_PRE_EFFECT` execution plan or direct Ability Effect begins before the entire declared active Cost transaction is terminal, including all frozen optional distributed payer attempts and required CostGroup-result construction.
41. a committed-result predicate reads an unavailable checkpoint, incompatible metric/operation or implicit target-legality filter, or a completion-only observer blocks its own completion.
42. a Shield source-family cap lacks consistent owner/origin matching, atomic commit reads or explicit competing-grant allocation.
43. metric top-N Slot ties lack unique ordered position coverage or silently use entity/list/SSI priority.

44. cross-child simultaneous Damage lacks finite participant paths/one commit owner, permits mutative preparation without explicit law, or deadlocks on participant completion.
45. a damage-derived coefficient settlement merges unrelated Heals/bases, uses multiplicative coefficient composition, lacks a terminal basis/owner, or depends on completion it blocks.
46. origin/Action-sensitive Resource admission infers provenance from issuer/root/time, erases captured scope before late Action-linked grants, commits then subtracts, or lacks a compatible positive-grant mapping.
47. Revive-dependent MaxHP reset commits independently, runs after the HP formula, changes explicit Snapshot input or survives failed materialization.

48. a non-Natural postActionSettlement lacks the explicit source profile, observes an uncompleted/foreign-instance Action, guesses a parent Natural key or waits for the handoff it holds.

49. For an opted-in live waiting rule, validate REC-001/04§30.1's exact source/instance/presence lifetime and ledger scope, immutable positive-integer ADD, coherent all-entry threshold decision and cohort/Revive boundary. Reject quota, progress-offset, queued per-leave, duplicate-registration or incompatible-policy approximations.

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

# 61. HARD UNRESOLVED LIST BEFORE FREEZE

These are the important remaining blockers after revision F.2. They must not be hidden.

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

## Pilot #3 composition boundaries
15. priority/composition of multiple independent Action-Intent interpositions that match the same Action Intent + canonical anchor without an explicit composition/dependency policy.
16. order-dependent interactions among optional distributed payers without a dedicated explicit Contract/profile.

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
24. Same-tier special Authority conflict follows `AUT-004`: adjudicate by Rank → Cultivation/Tu vi → Character Stars → Awaken Count → Adjudication CP; exact total tie resolves as `NO_OVERRIDE`.
25. One Pygmalion Puppet per Life Cycle does not limit total existing Puppets to one.
26. Arena objects remain owned by Arena instance unless transferred.
27. Story Belief and Stability are separate.
28. Realized property removal removes only its own capability contribution.
29. Determinism does not justify inventing gameplay semantics.
30. Unknown contract decisions stay visible as unresolved instead of being silently filled.
31. Action Intent / Request is not an admitted Action; a declared PRE_ADMISSION_PRE_COST interposition may preserve the original Intent until settlement and authoritative revalidation.
32. Dynamic distributed optional payer collections are snapshotted from authoritative pre-payment state after required validation but before any payment commit; every payer pays its own Cost.
33. Requested Cost amount and actual committed payment amount are distinct result semantics; `actualPaidAmount = 0` does not by itself mean payment failure.
34. Scoped Effect-amount modifiers are bounded by source, recipient, Effect/component, structured query/condition, typed amount operation and explicit resolution phase; they do not create arbitrary modifier scripting or implicit global priority.
35. PRE_OVERHEAL modifies Heal before Overheal derivation; FINAL_DAMAGE_REDUCTION occurs after Physical/Will mitigation and before Shield while True Damage bypasses that phase.
36. An explicit sequential Reaction-boundary profile may defer ordinary Reactions until direct Effects complete while still allowing mandatory intermediate lifecycle evaluation; this does not define the unresolved global sequential-Reaction default.
37. Multiple matching Action-Intent branches or interposition instances do not gain gameplay priority from authored order, Event sequence, Character ID, or incidental iteration; unresolved multiplicity is a validation error until an explicit composition policy exists.
38. `POST_COST_PRE_EFFECT` occurs only after the entire declared active Cost transaction is terminal; committing only the required subset of a distributed CostGroup is not sufficient.
39. Distributed optional payer failure may contribute zero without failing the Ability, but every frozen payer attempt must reach a terminal result before the CostGroup transaction is considered complete.

If a future model violates one of these:
> it should not be allowed to freeze Kernel behavior for Arclune.
