# ARCLUNE — ABILITY SCHEMA
## Chặng E — Declarative Character / Ability Composition Schema
**Version:** 2026-09-10-E  
**Status:** Working Canonical Candidate  
**Depends on:** `01_TERMINOLOGY_vNext.md`, `02_TAG_vNext.md`, `03_PRIMITIVE.md`, `00_CANONICAL_RECOVERY_AUDIT.md`  
**Primary goal:** cho phép AI/Designer khai báo hơn 200 kit bằng semantic + composition mà không biến Character thành code, Tag thành pseudo-code, hoặc Ability Schema thành một scripting language trá hình.

---

# 0. ARCHITECTURE DECISION OF STAGE E

Arclune không dùng một schema duy nhất vừa phục vụ Designer vừa phục vụ Kernel.

Thay vào đó, Stage E chuẩn hóa **hai lớp dữ liệu**:

```text
DESIGNER / AI AUTHORED DATA
        ↓
AUTHORING ABILITY SCHEMA
        ↓
VALIDATOR + NORMALIZER / COMPILER
        ↓
NORMALIZED ABILITY IR
        ↓
KERNEL EXECUTION PLAN
        ↓
PRIMITIVES + CONTRACTS
        ↓
AUTHORITATIVE STATE
```

Đây là một quyết định kiến trúc quan trọng.

## Vì sao cần hai lớp?

Nếu Character data tham chiếu trực tiếp tới Primitive IDs ở mọi nơi:

- Primitive Registry đổi → hàng trăm kit phải migrate.
- Designer/AI phải hiểu implementation quá sâu.
- Schema dễ biến thành “script bằng JSON”.
- semantic intent bị trộn với runtime operation.

Nếu Character data chỉ là prose tự do:

- Kernel không validate được.
- semantic alias tăng.
- AI có thể khai báo cùng logic bằng nhiều cách khác nhau.
- impossible to diff/migrate/query reliably.

Do đó:

> **Authoring Schema mô tả “kit muốn làm gì”.**

> **Normalized IR mô tả “Kernel sẽ thực thi semantic này bằng cấu trúc canonical nào”.**

> **Primitive mô tả “runtime operation nào được gọi”.**

---

# 1. SOURCE-OF-TRUTH RULE

## 1.1 Character source of truth

Canonical authored source của Character là:

- Character metadata;
- mode profile bindings;
- Ability definitions;
- declarative effect specs;
- structured conditions/targeting/cost/state;
- canonical Tags;
- explicit unresolved/exception metadata khi cần.

Không phải:
- generated Primitive sequence;
- runtime Action trace;
- compiled execution plan.

---

## 1.2 Generated data

Normalized Ability IR và execution plan là generated artifacts.

Chúng có thể:
- regenerate từ authored data;
- version cùng compiler;
- invalidate/rebuild khi Primitive Registry hoặc Contracts đổi.

Điều này giảm migration risk cho hơn 200 kits.

---

## 1.3 No raw custom code in Character data

Canonical Character data không được chứa:

- C# callbacks;
- arbitrary scripts;
- embedded loops;
- raw condition code;
- imperative “do X then Y” strings;
- direct engine method names.

Nếu một mechanic không thể biểu diễn:
> trước tiên audit semantic/Primitive/Contract thiếu gì.

---

# 2. SCHEMA LAYERS

## 2.1 Layer A — Character Definition

Mô tả identity/static roster data và danh sách Ability.

## 2.2 Layer B — Ability Definition

Mô tả một Passive / Basic Attack / Skill / Ultimate.

## 2.3 Layer C — Action Specification

Mô tả Action Identity, Action Behavior, parent/child policy, Natural Action relation.

## 2.4 Layer D — Trigger / Condition

Mô tả khi nào Ability/effect được phép resolve.

## 2.5 Layer E — Cost

Mô tả resource/state payment.

## 2.6 Layer F — Target / Area

Mô tả candidate pool, relation, filter, selection, geometry, target lock/re-query.

## 2.7 Layer G — Snapshot

Mô tả dữ liệu nào cần chụp, tại timing point nào và component nào reuse.

## 2.8 Layer H — Effect

Mô tả semantic effect thực sự.

## 2.9 Layer I — State / Duration

Mô tả persistent state identity/lifecycle.

## 2.10 Layer J — Authority / Axiom Interaction

Mô tả authority tier và conflict policy references.

## 2.11 Layer K — Attribution

Mô tả Caster/Owner/Source/Behavior Source/Damage Attribution khi default không đủ.

## 2.12 Layer L — Resolution

Mô tả simultaneous/sequential/grouping/commit semantics.

## 2.13 Layer M — Tags / Capability

Mô tả Canonical Functional Tags.

## 2.14 Layer N — Mode Override

Mô tả Ability variant theo Mode Profile.

---

# 3. CHARACTER DEFINITION SCHEMA

Canonical high-level structure:

```yaml
character:
  characterId:
  displayName:
  rank:
  class:
  nativeElement:
  axiomIdentities: []
  uniquenessIdentity:
  baseStats:
  resources:
  deployment:
  abilities: []
  modeProfiles: {}
  presentation:
  metadata:
```

Exact serialization format chưa bị khóa; YAML ở file này chỉ để minh họa cấu trúc.

---

## 3.1 `characterId`

Stable definition identifier.

Không dùng:
- display name;
- localized name;
- runtime iid.

---

## 3.2 `displayName`

Presentation/localization data.

Không được Kernel dùng làm behavior key.

---

## 3.3 `rank`

Canonical Rank:
- N
- R
- SR
- SSR
- UR
- Prime

Rank không encode Authority.

---

## 3.4 `class`

Canonical Class.

Có thể có:
- base Class;
- Effective Class runtime nếu mechanic inheritance/transformation thay đổi.

---

## 3.5 `nativeElement`

Native Element metadata.

Effective Element được runtime resolve từ:
- native;
- Công Pháp;
- gear;
- modifier;
- transformation;
theo Contract.

---

## 3.6 `axiomIdentities`

List metadata/system identities như:
- Divine Nature;
- Uniqueness;
- character-specific Axiom relation nếu canon có.

Không gắn Axiom Functional Tag vào mọi Ability.

---

## 3.7 `baseStats`

Definition-level base stat profile.

Runtime Current Stat nằm ngoài authored Character definition.

---

## 3.8 `resources`

Resource profile:

```yaml
resources:
  rage:
    enabled: true
    initial:
    max:
  ae:
    ownership: TEAM | ACTOR | MODE_DEFINED
```

Turn-based AE current default có thể là TEAM.

Mode khác được override.

## 3.8A `deployment`

Character/deployment metadata.

Conceptual form:
deployment:
  fromDeck:
    enabled: true
    deploymentCost: <number | TBD_BY_COST_BUDGET>
deploymentCost is not an Ability CostSpec.
It belongs to Deck deployment authoring and is paid from the Deployment Cost Bar according to Deployment Contract.
During Pilot Normalization:
TBD_BY_COST_BUDGET
is an allowed authored placeholder when the Cost Budget system has not produced a numeric value yet.
This placeholder:
does not define a Cost Budget formula;
does not imply current runtime deployability;
does not make Ability normalization invalid;
must be resolved before runtime deployment execution requires payment.
Deck membership and current deployment state remain runtime/system concerns and are not inferred from deployment.fromDeck.enabled.

---

# 4. ABILITY DEFINITION

Canonical structure:

```yaml
ability:
  abilityId:
  abilityType:
  enabledInModes: []
  action:
  triggers: []
  prerequisites: []
  costs: []
  targeting:
  snapshots: []
  effects: []
  resolution:
  authority:
  attribution:
  tags: []
  state:
  presentation:
  metadata:
```

Không phải mọi field đều bắt buộc.

Passive static rule có thể không có Action.
Basic Attack có thể không có Trigger ngoài natural selection.
Auto Skill có thể có Trigger nhưng không player-cast path.

---

# 5. ABILITY IDENTITY

## 5.1 `abilityId`

Stable identifier trong Character Definition.

Ví dụ:

```text
PYGMALION_PASSIVE_01
MEMORY_LORD_SKILL_02
```

ID không quyết định semantic.

---

## 5.2 `abilityType`

Enum:

```text
PASSIVE
BASIC_ATTACK
SKILL
ULTIMATE
```

Canonical rule:

> Ability Type không phải Functional Tag.

---

## 5.3 `enabledInModes`

List hoặc predicate của Mode Profile.

Ví dụ:

```yaml
enabledInModes:
  - TURN_BASED
```

Hoặc Ability có mode variant riêng.

---

# 6. ACTION SPEC

Canonical conceptual form:

```yaml
action:
  actionIdentity:
  behavior:
  naturalActionPolicy:
  parentChildPolicy:
  childAuthorityPolicy:
  childCostPolicy:
  childSnapshotPolicy:
  actionCompletionPolicy:
```

---

## 6.1 `actionIdentity`

Canonical identity của Action thực sự resolve.

Possible values include:

```text
BASIC_ATTACK
SKILL
ULTIMATE
SYSTEM_ACTION
SPECIAL
```

Character-specific Ability ID vẫn giữ exact source.

---

## 6.2 `behavior`

Canonical Action Behavior facets.

Possible values/families:

```text
NORMAL
FOLLOW_UP
COUNTER
FORCED_ACTION
REACTION
LINKED_CAST
INTERRUPTING
```

Không phải Functional Tags.

---

## 6.3 `naturalActionPolicy`

Declares relation với Natural Action.

Conceptual values:

```text
CONSUMES_NATURAL_ACTION
DOES_NOT_CONSUME_NATURAL_ACTION
INHERIT_PARENT_POLICY
MODE_DEFINED
```

Exact SSI ordering thuộc Contracts.

## 6.3A `naturalActionFormPolicy`

Optional declarative policy used when SSI has already granted an Actor a Natural Action but a Character/System rule constrains which Action Identity / Ability form that Natural Action may use.

This policy:

- does not create a new Natural Action;
- does not convert the selected Action into `FORCED_ACTION`;
- does not itself choose the target;
- is not an AI heuristic;
- does not pay Cost while testing fallback candidates.

Conceptual form:
naturalActionFormPolicy:
  appliesWhen:
  candidates:
    - candidateId:
      actionIdentity:
      abilityRef:
      abilitySelector:
      conditions: []
  noCandidatePolicy:
actionIdentity may be:
an authored literal such as BASIC_ATTACK, SKILL, ULTIMATE;
or a typed value resolved from Character/System State.
A candidate may use an exact abilityRef.
If an abilitySelector is used instead, Normalizer must prove that the selector resolves deterministically. A selector that can leave multiple equally valid Abilities without an explicit selection policy is invalid authored data.
Candidates are evaluated in authored order.
Candidate evaluation is a read-only admission/payability probe.
The probe may inspect:
Ability legality;
Action restriction;
Rage readiness;
AE/resource affordability;
cooldown;
required mode;
required target/prerequisite availability;
relevant Character/System State.
The probe must not:
pay or reserve Cost;
consume/reset Rage;
start cooldown;
mutate State;
emit gameplay Events;
request/schedule an Action.
The first candidate whose probe succeeds is selected.
Only the selected candidate then enters the ordinary Action pipeline and may commit Cost/resource changes.
Fallback must be explicit in authored data.
There is no hidden rule:
if nothing else works
→ Basic Attack
unless Basic Attack is an explicitly authored fallback candidate.
After a candidate is selected:
the resulting Action remains the Actor's SSI-granted Natural Action;
normal TargetSpec / Area Resolution of the selected Ability remains authoritative unless an explicit rule overrides targeting separately.
This object exists to represent kit law such as:
remembered ULTIMATE
→ try Ultimate
→ else remembered child form
→ else Basic
without encoding that law as AI preference or FORCED_ACTION.

---

## 6.4 `parentChildPolicy`

Declares whether Action:
- may create child actions;
- waits for child completion;
- shares completion boundary;
- exposes child events independently.

Exact enum deferred to Contracts.

---

## 6.5 `childAuthorityPolicy`

At least must support:

```text
PRESERVE_CHILD
INHERIT_OUTER
EXPLICIT_PER_CHILD
```

Required because existing kits need both behaviors.

---

## 6.6 `childCostPolicy`

Must support semantic cases such as:

```text
NORMAL_CHILD_COST
WAIVE_CHILD_COST
INHERIT_OUTER_COST
EXPLICIT_PER_CHILD
```

Example:
Ultimate casting Skill 1/2 for free.

---

## 6.7 `childSnapshotPolicy`

Must allow:
- own snapshot;
- share parent snapshot;
- inherit selected snapshot group.

Declares Action-completion behavior that cannot be inferred safely from visual sequence or ordinary Reaction scheduling.

The Action completion model must support **declared root-linked blocking settlements**.

Conceptually:
actionCompletionPolicy:
  rootLinkedBlockingSettlements: ALLOW_DECLARED
A root-linked blocking settlement is a Triggered/Passive settlement that:
belongs to a specific existing root Action lineage;
must finish, succeed, or fail cleanly before that root Action may emit ACTION_COMPLETED;
is not automatically a child Natural Action;
is not automatically an ordinary non-blocking Reaction.
The exact settlement is declared by the Trigger/Ability that creates it rather than hardcoded into every root Basic/Skill/Ultimate.
This field does not define global Reaction priority.
Local dependency ordering between settlements belongs to explicit dependency data and Contract validation.
A root-linked blocking dependency must be bounded and must not depend on a future event that can occur only after the root Action has already completed.

---

# 7. TRIGGER SPEC

Canonical conceptual structure:

```yaml
trigger:
  triggerId:
  activation:
  event:
  sourceFilter:
  subjectFilter:
  conditions: []
  counter:
  threshold:
  frequency:
  cap:
  cooldown:
  reset:
  recursionPolicy:
  rootCompletionDependency:
```

---

## 7.1 `activation`

Possible semantic values:

```text
MANUAL
AUTO
REACTION
PASSIVE_STATIC
SYSTEM
```

No `AUTO_TRIGGER` Tag needed.

---

## 7.2 `event`

Canonical Event identity.

Examples conceptually:
ACTION_STARTED
ACTION_COMPLETED
DAMAGE_ACTION_COMPLETED
DAMAGE_COMMITTED
HEAL_COMMITTED
STATE_APPLIED
STATE_REMOVED
HP_ZERO
DEATH_CONFIRMED
NATURAL_ACTION_STARTED
NATURAL_ACTION_COMPLETED
TURN_BOUNDARY
AIRBORNE_ENTERED
ENTITY_MATERIALIZED
ENTER_FIELD
LEAVE_FIELD
DEPLOY_FROM_DECK_COMMITTED
POSITION_MUTATION_COMMITTED
ENTER_FIELD / LEAVE_FIELD are Combat-Instance-local presence-transition events.
DEPLOY_FROM_DECK_COMMITTED preserves deployment cause semantics and is not interchangeable with generic ENTER_FIELD.
POSITION_MUTATION_COMMITTED observes authoritative Position changes only after the relevant Position Mutation commit has completed.
These additions do not freeze the complete Event Catalog.
Exact Event Catalog belongs to Contracts/Kernel Runtime.
`DEPLOY_FROM_DECK_COMMITTED` khác `ENTER_FIELD`, vì một cái giữ **cause semantic**, một cái là generic presence transition.

---

## 7.3 `sourceFilter`

Defines whose Event can trigger.

Examples:
- self;
- ally;
- enemy;
- owner;
- any;
- specific attribution source.

---

## 7.4 `subjectFilter`

Defines which Event subject qualifies.

For an ordinary single-subject Event, existing single-subject filtering remains valid.

For an Event whose authoritative payload contains a collection of semantic entries, the current minimum collection form supports:
ANY
only.
Conceptual example for a Position Mutation commit:
subjectFilter:
  collection: EVENT_ENTRIES
  match: ANY
  filters:
    - relation: ALLY
      relationAnchor: SELF
    - excludeRef: SELF
relationAnchor is required when a relation such as:
ALLY
ENEMY
SAME_SIDE
OPPOSING_SIDE
is evaluated against a collection entry.
The anchor must resolve through an existing symbolic reference, for example:
SELF
CASTER
OWNER
SOURCE
PARENT_CASTER
TRIGGER_SOURCE
TRIGGER_TARGET
SELECTED_TARGET
Do not treat a bare ALLY / ENEMY relation as self-explanatory when the reference entity is ambiguous.
For POSITION_MUTATION_COMMITTED, collection filtering evaluates the authoritative entries[] payload.
A matching collection may contain multiple qualifying entries, but:
match: ANY creates one successful filter result for the Event.
It does not multiply Trigger activations by the number of matching entries.
ALL collection semantics are not introduced by this Pilot patch.

Điểm quan trọng ở đây là **không thêm `ALL`**, và relation kiểu `ALLY` bắt buộc có anchor rõ ràng thay vì để Kernel đoán “ally so với ai”

---

## 7.5 `conditions`

Structured Condition Specs.

No free-form executable text.

---

## 7.6 `counter`

Structured counter state.

Example:

```yaml
counter:
  scope: PER_CASTER
  incrementOn:
  requiredCount: 3
  resetOn:
```

No `ACTION_COUNTER` Tag needed.

---

## 7.7 `threshold`

Numeric/reference threshold expression.

No `THRESHOLD_TRIGGER` Tag needed.

---

## 7.8 `frequency`

Example semantics:

```text
ONCE_PER_ACTION
ONCE_PER_NATURAL_ACTION
ONCE_PER_TURN_BOUNDARY
ONCE_PER_COMBAT
UNLIMITED
```

Exact timing belongs to Contract.

---

## 7.9 `cap`

Defines max successful triggers within a scope.

---

## 7.10 `cooldown`

Must declare:
- count;
- clock;
- decrement event;
- reset behavior.

Do not use vague “2 turn”.

---

## 7.11 `recursionPolicy`

Required for mechanics such as:
- damage echo not triggering itself;
- reflected damage not reflecting again.

Conceptual values:

```text
ALLOW
BLOCK_SELF_LINEAGE
BLOCK_SAME_ABILITY
BLOCK_SAME_TRIGGER
CUSTOM_FILTER
```

Exact final enum belongs to Contract.

## 7.12 `rootCompletionDependency`

Optional declaration that a triggered settlement is a blocking completion dependency of an existing root Action.

Conceptual form:
rootCompletionDependency:
  mode: BLOCK_ROOT_ACTION_COMPLETION
  rootActionRef:
  dependencyId:
  dependsOn: []

rootActionRef must resolve to a valid existing Action lineage.
dependencyId identifies this settlement only inside the relevant completion-dependency graph.
dependsOn expresses local dependency edges between blocking settlements belonging to the same root Action.
Example:
REPEAT_SETTLEMENT
→ SKILL_3_SETTLEMENT
→ SKILL_1_SETTLEMENT
→ root ACTION_COMPLETED
This local DAG:
does not define global Reaction priority;
does not modify TRG-005;
does not imply that unrelated same-window Reactions use the same order.
If the Trigger qualifies but its required Cost cannot be paid, the settlement may resolve as a failed activation according to its Cost/Trigger Contract.
A clean failed activation closes that dependency; it must not leave the root Action permanently blocked.
Normalizer must reject:
cyclic completion dependencies;
dependency references outside the intended root lineage;
dependencies that require an event occurring only after root ACTION_COMPLETED;
unbounded recursive dependency creation.

---

# 8. CONDITION SPEC

Conditions must be declarative expressions, not arbitrary scripts.

Canonical expression grammar conceptually supports:

```text
ALL
ANY
NOT
COMPARE
HAS_STATE
HAS_TAG
HAS_CAPABILITY
IS_ALIVE
IS_PRESENT
IS_TARGETABLE
RELATION
RANK_COMPARE
CLASS_COMPARE
ELEMENT_COMPARE
RESOURCE_COMPARE
LIFE_STATE_IS
AUTHORITY_COMPARE
COUNTER_COMPARE
ACTION_IDENTITY_IS
ACTION_BEHAVIOR_IS
ABILITY_TYPE_IS
DAMAGE_RESULT_COMPARE
POSITION_COMPARE
SYSTEM_STATE_COMPARE
```

---

## 8.1 `COMPARE`

Generic scalar comparison:

```yaml
compare:
  left: <ValueRef>
  op: GT | GTE | LT | LTE | EQ | NEQ
  right: <ValueRef>
```

---

## 8.2 No embedded code

Rejected:

```yaml
condition: "target.hp / target.maxHp < .3 && caster.rage > 20"
```

Preferred:

```yaml
condition:
  all:
    - compare:
        left: TARGET.HP_PERCENT
        op: LT
        right: 0.30
    - compare:
        left: CASTER.RAGE
        op: GT
        right: 20
```

## 8.3 Action-lineage and Effect-provenance queries

Action-scoped Conditions must explicitly identify **which Action** is being queried.

Do not silently interpret:
ACTION_IDENTITY_IS = SKILL
as:
immediate Action;
parent Action;
root Action;
without an explicit Action reference.
Conceptual Action reference:
actionRef:
  anchor: EVENT_ACTION | CURRENT_ACTION
  relation: SELF | PARENT | ROOT
Examples:
actionIdentityIs:
  actionRef:
    anchor: EVENT_ACTION
    relation: SELF
  value: SKILL
actionIdentityIs:
  actionRef:
    anchor: EVENT_ACTION
    relation: ROOT
  value: ULTIMATE
Action references may expose typed immutable/queryable fields such as:
actionId
actionIdentity
actionBehavior
naturalActionStatus
originAbilityId
parentActionRef
rootActionRef
Conditions may also compare Action references for equality when a mechanic must prove that an Event/result belongs to a particular root Action.
Effect provenance
Action lineage alone is not sufficient to identify every generated Effect.
Relevant Event/result provenance must be queryable by typed Effect provenance such as:
originAbilityId
originEffectId
effectSource
when that metadata exists for the execution.
This distinction is required when two Damage instances:
have the same root Action;
have the same Damage Attribution;
but were produced by different Effects.
Example:
Echo Skill damage
Damage Attribution = Echo

Echo Passive Repeat damage
Damage Attribution = Echo
same root Action
different origin Effect
The repeat Effect must therefore be distinguishable from the original Damage Effect without relying on prose, Character ID checks, or Damage Attribution.
Canonical distinction:
Action lineage
≠ Effect provenance
≠ Damage Attribution
These queries expose existing execution identity/provenance.
They do not create a second Action-lineage subsystem.

---

# 9. VALUE REFERENCES / FORMULAS

Formula system is declarative.

Conceptual ValueRef families:

```text
CONSTANT
STAT_REF
RESOURCE_REF
HP_REF
MAX_HP_REF
ACTUAL_HP_DAMAGE_REF
OVERHEAL_REF
SNAPSHOT_REF
COUNTER_REF
RANK_REF
STACK_REF
TARGET_COUNT_REF
PROPERTY_REF
```

---

## 9.1 Arithmetic

Formula layer may support bounded expression operators:

```text
ADD
SUBTRACT
MULTIPLY
DIVIDE
MIN
MAX
CLAMP
PERCENT_OF
```

Important:

> Formula expression operators are not Primitives.

They are pure calculations with no side effects.

---

## 9.2 No control-flow in formula

Formula cannot:
- spawn;
- trigger;
- loop over actors;
- mutate state;
- schedule Actions.

Those belong to Schema composition/Kernel.

---

# 10. COST SPEC

Canonical conceptual form:

```yaml
cost:
  costId:
  payer:
  kind:
  amount:
  validation:
  paymentTiming:
  insufficientPolicy:
  waiverPolicy:
  refundPolicy:
```

---

## 10.1 `payer`

Can reference:
- caster;
- owner;
- actor;
- team resource pool;
- explicit entity.

---

## 10.2 `kind`

Examples:

```text
AE
RAGE
HP
CUSTOM_RESOURCE
```

---

## 10.3 HP Cost

If:
`kind = HP`
and payer=self as payment semantic:

Functional Tag:
`SELF_HP_COST`

Compiler path:
`VALIDATE_COST → COMMIT_HP_COST`.

Non-payment HP loss must not use CostSpec.

---

## 10.4 Multi-cost transaction

Ability can require:

```text
25 AE + 5 Rage
```

This is one CostGroup with atomic payment by default.

Exact partial-payment policy belongs to Contract.

---

## 10.5 Waived child cost

Composite Ultimate can call child Skill with:
`childCostPolicy = WAIVE_CHILD_COST`.

This must not mutate child Skill's base definition.

# 10A. COMMON SPATIAL SELECTOR SPEC

`SpatialSelectorSpec` is a reusable common Schema object.

It is not owned by TargetSpec or Position Mutation Spec.

Conceptual form:
spatialSelector:
  origin:
  orientationBasis:
  orientationAnchor:
  directionPriority: []
  step:
Current minimum orientation basis:
SIDE_RELATIVE
For:
orientationBasis = SIDE_RELATIVE
canonical direction values are:
FRONT
BACK
LEFT
RIGHT
orientationAnchor identifies the entity/reference whose Side provides facing orientation.
It should use an existing symbolic reference where applicable, for example:
SELF
CASTER
OWNER
SOURCE
TRIGGER_SOURCE
SELECTED_TARGET
Example:
spatialSelector:
  origin: CASTER_CURRENT_POSITION
  orientationBasis: SIDE_RELATIVE
  orientationAnchor: CASTER
  directionPriority:
    - LEFT
    - RIGHT
    - FRONT
    - BACK
  step: 1
The common Schema object does not encode:
absolute screen direction;
hardcoded mirrored Slot IDs;
hidden nearest-position fallback.
Exact direction-to-Position mapping belongs to Mode Spatial Profile.
Fallback behavior belongs to the owning Target/Position mechanic.

---

# 11. TARGET SPEC

Canonical conceptual structure:

```yaml
targeting:
  targetKind:
  relation:
  candidateSource:
  filters: []
  selection:
  count:
  duplicatePolicy:
  invalidPolicy:
  lockPolicy:
  requeryPolicy:
  area:
  origin:
  spatialSelector:
```
When present:
targeting.spatialSelector
uses the common SpatialSelectorSpec.
TargetSpec references/contains an instance of that reusable object; it does not define a separate Target-only spatial selector language.

---

## 11.1 `targetKind`

Possible:

```text
ENTITY
COMBAT_UNIT
CHARACTER
SUMMON
COMBAT_OBJECT
POSITION
FIELD
STORY
PROPERTY
TRUE_SELF
```

Not all modes support all kinds.

---

## 11.2 `relation`

Examples:

```text
SELF
ALLY
ENEMY
ANY
OWNER
SUMMON_OF_SELF
SAME_SIDE
OPPOSING_SIDE
```

No Functional Tags needed.

---

## 11.3 `candidateSource`

Defines where candidates come from:
- current Combat Instance;
- Main Battle;
- Arena;
- dead/waiting True Self pool;
- Collection definition pool;
- Position set;
- Story participant set.

---

## 11.4 `filters`

Structured predicates.

Examples:
- exclude Leader;
- require ALIVE;
- require present;
- exclude Forgotten;
- Rank equal caster;
- not already in Deck;
- has capability TRUE_DAMAGE.

---

## 11.5 `selection`

Examples:

```text
ALL
RANDOM
LOWEST_HP_PERCENT
HIGHEST_MAX_HP
HIGHEST_SHIELD_RATIO
NEAREST
FARTHEST
FIXED_POSITION_SET
EXPLICIT
```

---

## 11.6 `count`

Parameter.

No Tag `THREE_TARGETS`.

---

## 11.7 `duplicatePolicy`

Required for random multi-target / projectile systems:

```text
NO_DUPLICATES
ALLOW_DUPLICATES
WEIGHTED_WITH_REPLACEMENT
```

No default invented at authoring time if mechanic depends on it.

---

## 11.8 `invalidPolicy`

Possible semantic policies:

```text
DROP_INVALID
FAIL_EFFECT
FAIL_ACTION
REROLL
REQUERY
KEEP_REFERENCE
```

Exact runtime timing belongs to Contract.

---

## 11.9 `lockPolicy`

Defines whether target identity is frozen.

```text
LOCK_ENTITY_IDS
LOCK_POSITIONS
LOCK_BOTH
NO_LOCK
```

---

## 11.10 `requeryPolicy`

Defines whether later components re-run Target Selection.

---

# 12. AREA SPEC

Canonical conceptual structure:

```yaml
area:
  geometry:
  anchor:
  size:
  orientation:
  positionSet:
  occupancyRule:
  inclusionRule:
```

---

## 12.1 Geometry

Examples:
- row;
- column;
- cross;
- radius;
- cone;
- fixed slots;
- full battlefield.

Turn-based and real-time modes can provide different geometry adapters.

---

## 12.2 Critical distinction

Target Selection and Area Resolution remain separate.

Forgotten case:

- actor cannot be selected as direct target;
- actor remains in geometry;
- fixed AoE can still affect it.

---

# 13. SNAPSHOT SPEC

Canonical conceptual form:

```yaml
snapshot:
  snapshotId:
  timing:
  scope:
  subjects:
  fields:
  reuse:
  lifetime:
```

---

## 13.1 `timing`

Examples:

```text
ABILITY_START
ACTION_START
AFTER_TARGET_SELECTION
BEFORE_FIRST_HIT
AFTER_CHILD_ACTION
ON_ENTITY_CREATION
BEFORE_DEATH_CONFIRMED
AFTER_ACTION_COMPLETION
```

Exact legal timing points belong to Contract.

---

## 13.2 `scope`

Examples:
- source only;
- target set;
- selected stat fields;
- full entity;
- Combat Instance.

---

## 13.3 `fields`

Explicit whitelist.

Important for Ký Ức:
stat snapshot can copy final stat values without copying Buff/Debuff/Mark objects.

---

## 13.4 `reuse`

Examples:
- same snapshot for all targets;
- own snapshot per hit;
- parent snapshot reused by child;
- child captures own snapshot.

---

# 14. EFFECT SPEC — CENTRAL AUTHORING LAYER

This is the central semantic composition object.

Canonical conceptual structure:

```yaml
effect:
  effectId:
  effectType:
  tags: []
  targetRef:
  value:
  state:
  damage:
  heal:
  shield:
  stat:
  resource:
  position:
  lifecycle:
  system:
  authority:
  attribution:
  conditions: []
  resolutionGroup:
  metadata:
```

`effectType` is not automatically a Functional Tag, although many effect types imply required Tags.

---

# 15. EFFECT TYPE ENUM FAMILY

Current semantic effect families needed by corpus:

```text
DAMAGE
HEAL
SHIELD
CREATE_STATE
MODIFY_STATE
REMOVE_STATE
STAT_MODIFICATION
RESOURCE_MODIFICATION
HP_LOSS
HP_COST
MAX_HP_MUTATION
POSITION_MUTATION
SPAWN_ENTITY
REMOVE_ENTITY
TEMPORARY_ABSENCE
REVIVE
REINCARNATION
COMBAT_DEFINITION_INHERITANCE
REQUEST_ACTION
ARENA_INTERACTION
NARRATIVE_INTERACTION
SNAPSHOT_OPERATION
```

This enum is not a one-to-one mirror of Primitive IDs.

Normalizer maps EffectSpec to one or multiple Primitive requests.

---

# 16. DAMAGE EFFECT SPEC

Conceptual form:

```yaml
damage:
  profile:
    components:
      - type:
        formula:
        penetration:
        shieldPolicy:
  aggregationId:
  resultBinding:
```

---

## 16.1 Component type

Canonical:
- PHYSICAL
- WILL
- TRUE

Mixed Damage is multiple components.

No required Functional Tag:
`MIXED_DAMAGE`.

Derived capability:
if profile contains multiple types, tooling may label presentation as Mixed.

---

## 16.2 Tags

Compiler/validator requires:

Physical component:
- `DAMAGE`
- `PHYSICAL_DAMAGE`

True component:
- `DAMAGE`
- `TRUE_DAMAGE`

Shield bypass:
- add `SHIELD_PIERCING`

---

## 16.3 Damage Profile reference

Skill may reference Basic Attack Damage Profile:

```yaml
profile:
  source: ABILITY_PROFILE
  abilityRef: BASIC_ATTACK
  scale: 1.70
```

This does not copy:
- Action Identity;
- Basic Attack-only states;
- Natural Action identity;
unless explicitly declared elsewhere.

---

## 16.4 Damage result binding

Ability may bind result for later effects:

```yaml
resultBinding: SKILL1_DAMAGE_RESULT
```

Later Heal can reference:
`ACTUAL_HP_DAMAGE(SKILL1_DAMAGE_RESULT)`.

This avoids custom code.

---

# 17. HEAL EFFECT SPEC

Conceptual form:

```yaml
heal:
  formula:
  sourceResult:
  overhealPolicy:
  resultBinding:
```

Example:
> heal 20% total Actual HP Damage of Ultimate.

```yaml
formula:
  multiply:
    - actualHpDamageRef: ULTIMATE_DAMAGE_AGGREGATE
    - 0.20
```

Normalizer:
`RESOLVE_HEAL → COMMIT_HEAL_RESULT`.

---

# 18. SHIELD EFFECT SPEC

Conceptual families:

```text
CREATE
ADD_VALUE
SET_VALUE
TRANSFER
REMOVE
```

Shield effect can have:
- value formula;
- duration;
- stacking;
- priority;
- source;
- owner.

No need to encode Shield as HP.

---

# 19. STATE SPEC

Canonical conceptual structure:

```yaml
state:
  stateId:
  stateIdentity:
  classification:
  attachment:
  duration:
  stacks:
  parameters:
  dispel:
  immunity:
  authority:
  lifecycle:
```

---

## 19.1 `classification`

Possible:
- BUFF
- DEBUFF
- MARK
- NEUTRAL
- SYSTEM_STATE
- CONTROL

Classification does not automatically imply every effect property.

---

## 19.2 `attachment`

Possible:
- ENTITY
- POSITION
- BATTLEFIELD
- COMBAT_OBJECT
- STORY
- SYSTEM_INSTANCE

---

## 19.3 Position Mark

State:

```yaml
classification: MARK
attachment: POSITION
```

Functional Tag:
`POSITION_MARK`

Actor Mark:

```yaml
classification: MARK
attachment: ENTITY
```

Functional Tag:
`MARK`

---

## 19.4 Forgotten

Can be normalized as a system/neutral state containing:
- Target Exclusion capability;
- observer-specific presentation visibility changes.

It should not be mislabeled Debuff just because enemies dislike it.

---

# 20. DURATION SPEC

Every persistent effect must declare its clock explicitly.

Conceptual form:

```yaml
duration:
  amount:
  clock:
  decrement:
  start:
  expire:
  pausePolicy:
```

---

## 20.1 Clock families

Potential:

```text
NATURAL_ACTION_OF_OWNER
NATURAL_ACTION_OF_TARGET
ACTOR_NATURAL_ACTION_WINDOW_OF_OWNER
ACTOR_NATURAL_ACTION_WINDOW_OF_TARGET
TURN_BOUNDARY
SLOT_CLOCK
ACTION_COUNT
COMBAT_INSTANCE_EVENT
REAL_TIME
MODE_DEFINED
PERMANENT
UNTIL_CONDITION
```

Turn-based should not use `REAL_TIME` for ordinary turn mechanics.

`TURN_BOUNDARY` means the SSI boundary between consecutive Natural Actions.  
Personal mechanics such as “until my next turn” or “once per own turn” must use `NATURAL_ACTION_OF_*` or `ACTOR_NATURAL_ACTION_WINDOW_OF_*`, not an actor-specific Turn Boundary.

---

## 20.2 No vague “Turn”

Rejected canonical data:

```yaml
duration: 2_turns
```

Required:

```yaml
duration:
  amount: 2
  clock: NATURAL_ACTION_OF_TARGET
```

or other exact clock.

---

# 21. STAT MODIFICATION SPEC

Conceptual form:

```yaml
stat:
  statKey:
  operation:
  value:
  layer:
  stacking:
  baseline:
  duration:
```

Operations may include:
- additive flat;
- additive percent;
- multiplicative;
- set;
- cap;
- floor.

Exact stat stack order belongs to Stat Contract.

---

# 22. MAX HP MUTATION SPEC

Must not be encoded as generic stat modifier only.

Conceptual form:

```yaml
maxHpMutation:
  value:
  basis:
  operation:
  duration:
  stacking:
  reconciliation:
  expiryReconciliation:
```

---

## 22.1 Required reconciliation field

Examples:
- clamp Current HP;
- preserve absolute Current HP;
- preserve ratio;
- return explicit lost capacity as Current HP;
- no automatic HP gain.

No default silently chosen for unusual kit.

---

# 23. RESOURCE MODIFICATION SPEC

Conceptual form:

```yaml
resource:
  resourceKind:
  pool:
  operation:
  value:
  overflow:
  resultBinding:
```

---

## 23.1 Pool

Can be:
- caster;
- target;
- team;
- owner;
- mode subsystem.

No hardcoded “AE belongs to actor”.

---

# 24. HP LOSS EFFECT SPEC

Conceptual form:

```yaml
hpLoss:
  formula:
  lethalPolicy:
  cause:
```

Functional Tag:
`HP_LOSS`

No CostSpec.

---

# 25. HP COST EFFECT / COST SPEC

If HP reduction is payment:

```yaml
cost:
  kind: HP
  payer: CASTER
  amount:
  lethalFloor:
```

Functional Tag:
`SELF_HP_COST` when payer is self.

This prevents semantic collapse.

---

# 26. POSITION MUTATION SPEC

Conceptual form:

```yaml
position:
  operation:
  destination:
  selector:
  collision:
  occupancy:
  failurePolicy:
```

Possible operations:
- MOVE
- SWAP
- PUSH
- PULL
- TELEPORT
- RETURN
- RANDOM_REPOSITION

Airborne remains a State semantic; not every displacement is Airborne.

When `position.selector` is spatial, it may use the common `SpatialSelectorSpec`.

Example:
position:
  operation: MOVE
  selector:
    origin: SELF_CURRENT_POSITION
    orientationBasis: SIDE_RELATIVE
    orientationAnchor: SELF
    directionPriority:
      - BACK
      - LEFT
      - RIGHT
    step: 1
  collision:
  occupancy:
  failurePolicy:
If no candidate produced by the directional selector is valid:
explicit priority/failure/fallback composition determines the next behavior.
No hidden spatial fallback is implied by SpatialSelectorSpec.

Mục đích của 04-D là tránh việc Targeting sở hữu riêng spatial language; Target và Position Mutation cùng reuse một common object.

---

# 27. SPAWN ENTITY SPEC

Conceptual form:

```yaml
spawn:
  entityKind:
  definition:
  owner:
  side:
  identityPolicy:
  statInitialization:
  resourceInitialization:
  position:
  lifecycle:
  quota:
```

---

## 27.1 `entityKind`

Examples:
- SUMMON
- COMBAT_OBJECT
- PUPPET
- CONTAINER
- MODE_OBJECT

Puppet classification as Summon remains unresolved.

---

## 27.2 Lifecycle quota

Pygmalion should express:

```yaml
quota:
  scope: CURRENT_LIFE_CYCLE
  key: CREATE_PUPPET
  max: 1
```

This does not check whether previous Puppets still exist.

---

# 28. REQUEST ACTION EFFECT SPEC

Used for:
- Follow-up;
- Counter;
- Forced Action;
- child Skill;
- linked cast.

Conceptual form:

```yaml
requestAction:
  actor:
  actionRef:
  actionIdentity:
  behavior:
  targetPolicy:
  costPolicy:
  authorityPolicy:
  snapshotPolicy:
  attribution:
```

This normalizes to:
`REQUEST_ACTION`.

---

# 29. REVIVE SPEC

Conceptual form:

```yaml
revive:
  eligibility:
  delay:
  lifeSerialPolicy:
  stateRestore:
  statRestore:
  resourceRestore:
  position:
  materialization:
  limit:
```

---

## 29.1 Required distinction

Revive starts after:
`DEATH_CONFIRMED`.

A mechanic saving before confirmed death belongs to Death Prevention.

---

## 29.2 `lifeSerialPolicy`

Must be explicit if character differs from global Contract.

Example Ký Ức:

```text
INCREMENT
```

Global default remains unresolved until Contracts.

---

# 30. REINCARNATION SPEC

Conceptual form:

```yaml
reincarnation:
  operation:
  trueSelfScope:
  waitingWindow:
  route:
  destination:
  identityPolicy:
  presentationPolicy:
  combatDefinitionPolicy:
  materialization:
  exhaustion:
```

Possible operation family:
- ENTER_WAITING
- ADVANCE_WAITING
- FORCE_ENTER
- ROUTE
- MATERIALIZE_NEW_LIFE
- BLOCK_ROUTE
- SET_EXHAUSTED

Exact execution compiles into multiple lifecycle Primitives.

---

# 31. COMBAT DEFINITION INHERITANCE SPEC

Conceptual form:

```yaml
inheritance:
  host:
  sourceDefinition:
  behavior:
  classPolicy:
  elementPolicy:
  statPolicy:
  presentationPolicy:
  identityPolicy:
  resourcePolicy:
  attributionPolicy:
  capabilityIndexPolicy:
```

---

## 31.1 No blind cloning

Every inheritance dimension must be explicit or inherit from a named profile.

Pygmalion cannot be implemented as:

```text
host = sourceCharacter.clone()
```

because:
- host Presentation may remain Puppet;
- host stat basis may remain Puppet;
- True Self is separate;
- Damage Attribution can differ.

---

# 32. AUTHORITY SPEC

Canonical conceptual form:

```yaml
authority:
  tier:
  dynamic:
  conflictScope:
  explicitExceptions: []
  childPolicy:
```

---

## 32.1 Tier

Current:
- NORMAL
- PHAP_TAC
- QUY_TAC
- AXIOM

---

## 32.2 Dynamic authority

Can reference:
- state;
- counter;
- number of Ultimate uses;
- lifecycle stage;
provided expression remains declarative.

Example:
after 3 Ultimate uses:
Pháp Tắc → Quy Tắc.

---

## 32.3 Axiom Identity is not Authority field

Character can have:
`axiomIdentity = DIVINE_NATURE`

while Ability:
`authority.tier = QUY_TAC`.

---

# 33. ATTRIBUTION SPEC

Canonical conceptual form:

```yaml
attribution:
  caster:
  owner:
  source:
  behaviorSource:
  effectSource:
  damageAttribution:
  killAttribution:
  inheritFromParent:
```

Most ordinary Ability can use defaults.

Complex mechanics must override only needed fields.

---

## 33.1 Default lineage

Potential normal default:

```text
caster = actor
owner = actor
source = actor
behaviorSource = actor current Combat Definition
effectSource = current Ability/Action
damageAttribution = actor
killAttribution = damageAttribution
```

Exact default belongs to Attribution Contract.

---

## 33.2 Pygmalion example

Puppet follow-up may have:

```text
actor = Puppet
behaviorSource = inherited Combat Definition
damageAttribution = Pygmalion
```

Do not infer equality.

---

# 34. RESOLUTION SPEC

Canonical conceptual structure:

```yaml
resolution:
  mode:
  groups: []
  snapshotPolicy:
  commitPolicy:
  hitAdmission:
  reactionBoundary:
  deathBoundary:
  childActionBoundary:
```

---

## 34.1 `mode`

At least:
- SEQUENTIAL
- SIMULTANEOUS_BATCH
- COMPOSITE

---

## 34.2 Resolution groups

Complex Ability can define named groups:

```yaml
groups:
  - id: HIT_GROUP_A
    mode: SIMULTANEOUS_BATCH
    effects: [...]
  - id: AFTER_A
    mode: SEQUENTIAL
    effects: [...]
```

This is declarative ordering, not arbitrary control flow.

---

## 34.3 No general loops

A repeated effect must use bounded declarative constructs:

```yaml
repeat:
  count: 3
  targetPolicy:
```

if needed.

But schema must not support:
- while;
- goto;
- recursive arbitrary loop.

Unbounded recurring behavior belongs to Trigger + State.

## 34.4 `hitAdmission`

Declares Hit Admission policy independently from Target Lock.

Conceptual form:
hitAdmission:
  policy: MODE_DEFAULT | GUARANTEED
MODE_DEFAULT:
delegates ordinary hit admission to the active system/mode profile;
does not define Accuracy/Evasion math in this Schema.
GUARANTEED:
bypasses ordinary Miss/Dodge/Evasion;
does not bypass target invalidation/lifecycle legality;
does not create Target Lock;
does not override Authority adjudication;
does not automatically defeat Authority-based special deny/avoidance rules;
does not override unrelated protection/immunity semantics.
Example:
targeting:
  lockPolicy: LOCK_ENTITY_IDS

resolution:
  hitAdmission:
    policy: GUARANTEED
These two fields are deliberately independent.
If a composite Ability contains resolution groups with different Hit Admission policies, a named Resolution group may explicitly override the parent policy for that group.
No Accuracy/Evasion formula is introduced here.

---

# 35. RESULT BINDINGS

Result Binding is essential to composition without custom scripts.

An Effect can expose a typed result handle.

Examples:

```text
DAMAGE_RESULT_A
HEAL_RESULT_B
TARGET_SET_X
SNAPSHOT_Y
SPAWNED_ENTITY_Z
STORY_PROPERTY_P
```

Later effects can reference only legal typed outputs.

---

## 35.1 Damage result references

Allowed metrics:
- Actual HP Damage;
- Shield absorbed;
- Overkill;
- total resolved damage;
- per-target result.

---

## 35.2 Target result references

A later effect can use:
- same target set;
- survivors from target set;
- original selected IDs;
depending on declared policy.

---

## 35.3 Spawn result references

A later effect can reference:
- newly spawned Summon/Object;
- new Puppet;
- Container.

---

## 35.4 No arbitrary memory variables

Result bindings are typed and scoped.

They are not general mutable variables.

This is a key protection against Schema becoming scripting.

---

# 36. EFFECT DEPENDENCY GRAPH

Ability effects form a constrained **Directed Acyclic Graph (DAG)** inside one bounded Action resolution.

Why DAG?

Because complex kits need:
- damage result → heal;
- target selection → mark → later damage;
- child Action → later child Action;
- spawn result → bind state.

But arbitrary cycles inside one Action would create programming-language behavior.

Canonical rule:

> **Within one Action resolution, authored Effect dependency graph must be acyclic.**

Recurring behavior uses:
- Trigger;
- persistent State;
- future Action;
not same-resolution cycles.

---

# 37. EFFECT GROUP EXAMPLE — SSR WARRIOR SKILL 1

Semantic:

- Skill.
- target fixed positions 1/3/5.
- each target receives Basic Attack Damage Profile.
- after Damage, Heal self for 25% total Actual HP Damage.
- cost 20 AE.

Conceptual schema:

```yaml
abilityType: SKILL

costs:
  - kind: AE
    payer: TEAM
    amount: 20

targeting:
  targetKind: COMBAT_UNIT
  relation: ENEMY
  selection: FIXED_POSITION_SET
  positions: [1,3,5]

effects:
  - effectId: DAMAGE_A
    effectType: DAMAGE
    tags: [DAMAGE, PHYSICAL_DAMAGE, WILL_DAMAGE]
    damage:
      profile:
        source: BASIC_ATTACK_PROFILE
        scale: 1.0
      resultBinding: DAMAGE_A_RESULT

  - effectId: HEAL_SELF
    effectType: HEAL
    tags: [HEAL]
    targetRef: SELF
    value:
      multiply:
        - actualHpDamageRef: DAMAGE_A_RESULT
        - 0.25

resolution:
  mode: SEQUENTIAL
```

No Tag:
- SKILL;
- TARGET_ENEMY;
- AOE_FIXED;
- BASIC_ATTACK.

---

# 38. SSR WARRIOR SKILL 2

Semantic:
- fixed slots 7/8/9;
- 170% Basic Attack Damage Profile;
- 20% component converted/declared True Damage;
- +10% ARM/RES for 2 own turns.

Schema must be able to express profile transformation without changing Action Identity.

Conceptual:

```yaml
damage:
  profile:
    source: BASIC_ATTACK_PROFILE
    scale: 1.70
    transform:
      trueDamagePortion: 0.20
```

Exact meaning of “20% trong tổng 170%” must be defined by Damage Profile Contract.

State:
- Stat Modifier ARM/RES +10%.
- Duration clock explicitly personal.

---

# 39. SSR WARRIOR ULTIMATE — CHILD AUTHORITY OVERRIDE

Conceptual:

```yaml
abilityType: ULTIMATE

action:
  childAuthorityPolicy: INHERIT_OUTER
  childCostPolicy: WAIVE_CHILD_COST

authority:
  tier: PHAP_TAC

effects:
  - requestAction: SKILL_1
  - requestAction: SKILL_2

resolution:
  mode: SEQUENTIAL
```

No permanent mutation of Skill 1/2 definitions.

---

# 40. KÝ ỨC CHI CHỦ — FORGOTTEN

Forgotten is modeled as state, not VFX.

Conceptual:

```yaml
state:
  stateIdentity: FORGOTTEN
  classification: SYSTEM_STATE
  attachment: ENTITY
  duration:
    amount: 1
    clock: NATURAL_ACTION_OF_TARGET
```

Gameplay capability:
- `TARGET_EXCLUSION`.

Presentation:
- observer-specific hide only for intended revive stage.

Area Resolution continues using Position.

---

# 41. KÝ ỨC SKILL 2 — ACTION-LEVEL ECHO

Trigger:

```yaml
activation: REACTION
event: DAMAGE_ACTION_COMPLETED
sourceFilter: ALLY
```

Condition per target:
- not Leader;
- Actual HP Damage from exact source Action >= 30% relevant Max HP.

Cost:
- 30 AE per trigger, once for whole Action.

Effects:
- for each qualified target, Damage = 50% exact Actual HP Damage.
- type True Damage.
- no secondary effect copy.

Recursion policy:
- echo lineage excluded from retriggering same Skill.

This schema requires typed Damage Result references, not arbitrary script.

---

# 42. KÝ ỨC REVIVE SNAPSHOT

Before DEATH_CONFIRMED or at canonical death snapshot point:

```yaml
snapshot:
  fields:
    - MAX_HP
    - ATK
    - WIL
    - ARM
    - RES
    - HP_REGEN
```

Explicitly not:
- Buff objects;
- Debuff objects;
- Mark objects;
- cooldown;
- duration state.

Revive:

```yaml
lifeSerialPolicy: INCREMENT
stateRestore:
  copyStatusObjects: false
statRestore:
  source: DEATH_STAT_SNAPSHOT
```

This is Character-specific override, not global Revive behavior.

---

# 43. LUÂN HỒI CHI CHỦ — TEMPORARY ABSENCE

Skill 2 semantic:

```yaml
effects:
  - effectType: TEMPORARY_ABSENCE
    tags: [TEMPORARY_ABSENCE]

  - after return:
      effectType: HEAL
      tags: [HEAL]

  - effectType: MAX_HP_MUTATION
    tags: [MAX_HP_MUTATION]
```

No `REINCARNATION` Tag solely because Skill name/lore references Luân Hồi.

---

# 44. LUÂN HỒI CHI CHỦ — COMPOSITE ULTIMATE

Current character design requires:
- Basic Attack + Skill 3;
- then Skill 1;
- child skills preserve own Authority;
- child AE cost waived.

Conceptual:

```yaml
action:
  childAuthorityPolicy: PRESERVE_CHILD
  childCostPolicy: WAIVE_CHILD_COST

resolution:
  mode: SEQUENTIAL
  groups:
    - children: [BASIC_ATTACK, SKILL_3]
      # exact mutual resolution semantics must be Contract-defined
    - children: [SKILL_1]
```

Outer Ultimate presentation can show four orbs, but animation does not redefine child logic.

---

# 45. PYGmalion — MULTIPLE PUPPETS

Life Cycle creation:

```yaml
spawn:
  entityKind: PUPPET
  quota:
    scope: CURRENT_LIFE_CYCLE
    key: PYGMALION_CREATE_PUPPET
    max: 1
```

No condition:
> no Puppet currently exists.

Therefore old Puppets persist.

---

# 46. PYGmalion — REINCARNATION INTO PUPPET

Conceptual system composition:

```yaml
reincarnation:
  operation: ROUTE
  destinationKind: PUPPET
  target:
    requireEligibleEmptyPuppet: true

inheritance:
  host: ROUTED_PUPPET
  sourceDefinition: RANDOM_SAME_RANK_DEFINITION
  presentationPolicy: PRESERVE_HOST
  statPolicy: PRESERVE_HOST_BASIS
  classPolicy: UNRESOLVED
  elementPolicy: UNRESOLVED
```

True Self routing and definition selection remain separate.

---

# 47. PYGmalion ULTIMATE — ATTRIBUTION SPLIT

For Puppet child Action:

```yaml
requestAction:
  actor: PUPPET
  actionRef: PUPPET_CURRENT_BASIC_ATTACK
  behavior: FOLLOW_UP
  costPolicy: WAIVE_CHILD_COST
  attribution:
    behaviorSource: PUPPET_CURRENT_COMBAT_DEFINITION
    damageAttribution: PYGMALION
```

This proves why AttributionSpec is mandatory.

---

# 48. CỐ SỰ CHI THẦN — STORY PREPARATION

Preparation data should not be arbitrary custom effect authoring.

Player selects from pre-authored Story definitions.

Conceptual:

```yaml
storyChoice:
  containerDefinition:
  storyDefinition:
```

Ultimate reads armed Story.

---

# 49. CỐ SỰ CHI THẦN — CAPABILITY REQUIREMENT

Example Sword Story:

```yaml
requiredCapabilities:
  all:
    - functionalTag: TRUE_DAMAGE
```

If Story requires Ultimate True Damage:

```yaml
requiredCapabilities:
  all:
    - abilityType: ULTIMATE
    - functionalTag: TRUE_DAMAGE
```

No new `ULTIMATE_TRUE_DAMAGE` Tag.

---

# 50. CỐ SỰ CHI THẦN — STORY LIFECYCLE

Narrative interaction EffectSpec can request system operation families:

```text
CREATE_STORY
BIND_PARTICIPANT
UPDATE_BELIEF
RECORD_PROOF
RECORD_COUNTER_PROOF
MODIFY_STABILITY
REALIZE_PROPERTY
TRANSFER_PROPERTY
PROPAGATE_KNOWLEDGE
```

Authoring Schema should use Narrative-specific structured object, not raw Primitive IDs.

---

# 51. NORMALIZED ABILITY IR

The Authoring Schema is normalized before Kernel execution.

Conceptual normalized IR:

```yaml
normalizedAbility:
  canonicalAbilityId:
  schemaVersion:
  actionSpec:
  triggerGraph:
  costPlan:
  targetPlan:
  snapshotPlan:
  effectGraph:
  authorityPlan:
  attributionPlan:
  capabilityIndex:
  primitiveRequests:
  contractRefs:
  validationHash:
```

---

## 51.1 Why IR exists

IR isolates Character content from:
- Primitive refactor;
- Kernel implementation;
- serializer change;
- optimization;
- tracing changes.

If `REMOVE_STATE_INSTANCE` later splits internally:
> authored Character data need not change unless semantic changes.

---

## 51.2 `primitiveRequests`

Generated by Normalizer.

Not authored manually for ordinary content.

Possible generated operations:
- BUILD_DAMAGE_PACKET;
- RESOLVE_DAMAGE_PACKET;
- COMMIT_DAMAGE_RESULT;
etc.

---

## 51.3 `contractRefs`

Generated/selected Contract profiles.

Examples conceptually:
- DAMAGE_DEFAULT_V1;
- SIMULTANEOUS_BATCH_V1;
- REVIVE_PROFILE_X;
- PYGMALION_INHERITANCE_PROFILE.

Exact naming/versioning belongs Chặng F.

---

# 52. NORMALIZER RESPONSIBILITIES

Normalizer/compiler must:

1. Validate schema shape.
2. Resolve defaults.
3. Validate Canonical Tags.
4. Reject legacy/deprecated Tags.
5. Derive Capability Index.
6. Expand Damage Profile references.
7. Validate Result Binding types.
8. Validate dependency DAG.
9. Validate target/reference scope.
10. Validate Cost semantics.
11. Validate HP Cost vs HP Loss distinction.
12. Validate Authority policy.
13. Validate Attribution policy.
14. Validate mode compatibility.
15. Map EffectSpec to Primitive request plan.
16. Attach Contract references.
17. Generate deterministic normalized representation.
18. Produce diagnostics without modifying designer intent silently.

---

# 53. NORMALIZER MUST NOT

Normalizer must not:

- invent a missing target count;
- choose random duplicate policy;
- choose Turn clock from vague “2 turns”;
- convert HP Loss into HP Cost;
- convert 100% Penetration into True Damage;
- convert invisibility into Target Exclusion;
- convert Prime rank into Axiom Authority;
- convert Skill profile copy into Basic Attack Identity;
- decide Pygmalion Class/Element inheritance;
- silently attach Tags based on lore name where semantic is ambiguous.

If required information is absent:
> validation error or unresolved warning.

---

# 54. VALIDATION LEVELS

## 54.1 ERROR

Cannot safely compile.

Examples:
- undefined Tag;
- cycle in Effect DAG;
- target reference missing;
- HP Cost with no payer;
- random selection with mechanic-dependent duplicate policy unspecified;
- result binding type mismatch;
- conflicting Action Identity definitions.

---

## 54.2 WARNING

Compiles under explicit default but designer should review.

Example:
- Ability has no presentation reference.
- effect relies on global Contract default.

Warnings must not change semantics.

---

## 54.3 UNRESOLVED BLOCKER

Project-level ambiguity known to exist.

Example:
- Pygmalion `classPolicy = UNRESOLVED`.

Such Character data cannot be declared “implementation ready”.

---

# 55. SCHEMA VERSIONING

Every authored data object should carry:

```text
schemaVersion
```

Migration rule:

> semantic-preserving schema changes can be automated.

> semantic-changing migrations require review.

---

# 56. TAG VERSIONING RELATION

Authoring data references only Canonical Tag IDs.

If Tag is deprecated:
- migration tool replaces/removes;
- legacy alias does not remain forever in runtime.

---

# 57. PRIMITIVE VERSIONING RELATION

Authored data should **not** normally pin Primitive version.

Normalized IR/compiler output may pin:
- Primitive Registry version;
- Contract version;
- Kernel compatibility version.

This protects 200+ kit source data.

---

# 58. CONTRACT VERSIONING RELATION

Character can opt into a special Contract profile only when semantic really differs.

Do not create one Contract profile per Character unless necessary.

Example:
Ký Ức Revive may need a character-specific restore profile.

But generic:
- Damage;
- Targeting;
- Action Completion;
should remain shared.

---

# 59. MODE PROFILE OVERRIDES

Character may define alternate Ability profile by mode.

Conceptual:

```yaml
modeProfiles:
  TURN_BASED:
    abilities: [...]
  EXPLORATION_DEFENSE:
    abilities: [...]
```

Or delta overrides if stable.

---

## 59.1 Current new-mode boundary

Exploration/Defense currently:
- no SSI;
- no Luân Hồi;
- simplified kit;
- Normal Attack;
- passive skill;
- damaging/active skill;
- Ultimate;
- Rage;
- AE gain from action;
- movement speed;
- attack speed;
- weight.

Do not force turn-based lifecycle primitives into this mode if Mode Profile disables them.

---

# 60. SCHEMA MUST NOT BECOME AN ECS REPLACEMENT

Ability Schema describes Character behavior/content.

It does not define:
- renderer;
- physics engine;
- transform storage;
- Unity GameObjects;
- ECS archetypes;
- networking packets.

Those are implementation choices below/alongside Kernel.

---

# 61. SCHEMA MUST NOT BECOME A GENERAL PROGRAMMING LANGUAGE

Forbidden features:

- arbitrary mutable local variables;
- unbounded while loops;
- goto;
- recursion;
- custom source code;
- reflection on engine internals;
- dynamic field creation;
- arbitrary method invocation;
- unrestricted event emission.

Allowed declarative power:

- bounded lists/groups;
- conditions;
- target selection;
- result references;
- DAG dependencies;
- persistent triggers;
- state machines through declared system states;
- formula expressions.

---

# 62. WHY DAG + TRIGGER IS ENOUGH FOR MOST KIT COMPLEXITY

Within one Action:
> use Effect DAG.

Across time:
> use State + Trigger + Counter + Duration.

Across lives:
> use Lifecycle + True Self + Reincarnation/Revive.

Across isolated combat:
> use Combat Instance subsystem.

Across narrative:
> use Narrative subsystem.

This prevents need for arbitrary scripting while retaining high expressive power.

---

# 63. ESCAPE-HATCH POLICY

A project this complex may eventually find a mechanic not expressible by current schema.

The correct process is:

1. Write semantic requirement.
2. Attempt composition from existing fields/effects/primitives.
3. Identify exact missing operation or missing system state.
4. Decide whether it belongs to:
   - Schema;
   - Primitive;
   - Contract;
   - system gateway.
5. Add canonical capability generically.
6. Add stress test.
7. Migrate affected content.

Forbidden default:
> add `customScript` to Character.

---

# 64. CONTENT AUTHORING WORKFLOW

Recommended workflow for each new kit:

## Step 1 — Semantic parse
Extract:
- Ability Type;
- trigger;
- condition;
- cost;
- target;
- effect;
- duration;
- authority;
- attribution;
- lifecycle;
- ambiguity.

## Step 2 — Terminology normalization
Replace synonyms with canonical concepts.

## Step 3 — Tag mapping
Map actual semantic capabilities to existing Tags.

Do not create Tag yet if missing; flag candidate.

## Step 4 — Schema composition
Build Authoring Ability Schema.

## Step 5 — Validation
Detect:
- ambiguity;
- duplicate semantics;
- missing clock;
- target policy gaps;
- lifecycle conflicts.

## Step 6 — Normalize to IR
Compiler generates execution plan.

## Step 7 — Stress trace
Simulate/inspect expected primitive + contract flow.

---

# 65. BULK 200+ KIT MIGRATION STRATEGY

Do **not** normalize 200 kits at once.

Recommended batching:

### Batch 0
5–10 simple kits.

Purpose:
- prove normal damage/heal/buff/target.

### Batch 1
10–20 medium kits.

Purpose:
- trigger, counters, follow-ups, resource, position.

### Batch 2
hard stress-test kits:
- SSR Warrior;
- Ký Ức Chi Chủ;
- Luân Hồi Chi Chủ;
- Pygmalion;
- Cố Sự Chi Thần;
- Arena characters;
- time/snapshot characters.

### Gate
Only after these compile without Character-specific code:
> migrate bulk roster.

---

# 66. SCHEMA COMPLEXITY METRICS

Tooling should measure per Ability:

- number of Effects;
- dependency depth;
- Trigger count;
- nested child Action depth;
- TargetSpec complexity;
- lifecycle interactions;
- Authority interactions;
- system gateway count.

If complexity grows unexpectedly:
> inspect whether schema is compensating for missing Primitive/System semantic.

---

# 67. MAXIMUM NESTING POLICY

To avoid hidden recursion:

Recommended initial guard:

- child Action nesting depth should be bounded;
- same Ability cannot recursively request itself without explicit recurrence policy;
- recursive Action lineage should be blocked by default.

Exact numeric depth belongs to Kernel Contract.

---

# 68. REACTION / CHILD ACTION LINEAGE

Every Action should carry lineage metadata:

```text
rootActionId
parentActionId
originAbilityId
behavior
generationDepth
triggerCause
```

Needed for:
- recursion guard;
- attribution;
- Skill 2 echo not retriggering;
- reflect loop prevention;
- debug trace.

---

# 69. ACTION RESULT OBJECT

Action should produce a typed result summary:

```yaml
actionResult:
  targets:
  damageResults:
  healResults:
  stateChanges:
  resourceChanges:
  spawnedEntities:
  deaths:
  lifecycleTransitions:
  childActions:
```

This is runtime result, not authored Character data.

Later child/effect references may access allowed portions via typed bindings.

---

# 70. BATCH / ACTION AGGREGATION

Damage aggregation must support:

```text
BY_ACTION
BY_TARGET
BY_DAMAGE_ATTRIBUTION
BY_COMPONENT
BY_EFFECT
BY_CHILD_ACTION
```

Required for:
- Ký Ức Skill 2;
- Ultimate self-heal;
- threshold logic;
- damage statistics.

---

# 71. TARGET FILTER AND CAPABILITY QUERY

Target filters may use Capability Requirement.

Example:

> pick same-rank Character Definition not already in Deck.

Conceptual:

```yaml
filters:
  - compare:
      left: CANDIDATE.RANK
      op: EQ
      right: SOURCE.RANK
  - not:
      collectionMembership: CURRENT_BATTLE_DECK
```

Random selection then uses deterministic RNG.

---

# 72. COLLECTION / DEFINITION POOL QUERY

Some kits query roster/Collection definitions instead of battlefield entities.

Targeting must distinguish:

```text
RUNTIME_ENTITY_POOL
CHARACTER_DEFINITION_POOL
TRUE_SELF_POOL
POSITION_POOL
```

Pygmalion random inherited Combat Definition uses Definition Pool.

This cannot be faked as selecting battlefield targets.

---

# 73. IDENTITY REFERENCE TYPES

Schema must distinguish:

```text
ENTITY_REF
DEFINITION_REF
TRUE_SELF_REF
LIFE_REF
POSITION_REF
COMBAT_INSTANCE_REF
STATE_REF
PROPERTY_REF
STORY_REF
ACTION_REF
EFFECT_REF
```

`ACTION_REF` is used for typed Action-lineage queries such as immediate/parent/root Action identity.

`EFFECT_REF` is used for typed Effect provenance where a mechanic must distinguish the exact generating Effect from Action lineage or Damage Attribution.

These references are query identities, not Functional Tags.

Do not use one generic `targetId` for all.

---

# 74. OWNER / SOURCE RESOLUTION

Schema can use symbolic references:

```text
SELF
CASTER
OWNER
SOURCE
PARENT_CASTER
PARENT_DAMAGE_ATTRIBUTION
TRIGGER_SOURCE
TRIGGER_TARGET
SELECTED_TARGET
SPAWN_RESULT
INHERITED_DEFINITION
```

Normalizer resolves them to typed references.

---

# 75. EXPLICIT ABSENCE OF EFFECT

Do not encode negative Tags.

Example:

“Skill 2 echo does not copy Debuff/Mark/Control.”

Correct schema:
- effect only constructs new Damage Effect from numeric result.

No need:
- `NO_DEBUFF_COPY`
- `NO_MARK_COPY`.

---

# 76. EXPLICIT EXCEPTION

When rule truly overrides a global semantic:

```yaml
explicitException:
  interaction:
  scope:
  authority:
  reason:
```

Do not convert exception into broad immunity.

---

# 77. DEATH PREVENTION SCHEMA

Death Prevention should be a state/triggered effect observing death-evaluation eligibility, not Revive.

Conceptual:

```yaml
trigger:
  event: HP_ZERO
  activation: REACTION

effect:
  effectType: CREATE_STATE / SYSTEM_LIFECYCLE
  tags: [DEATH_PREVENTION]
```

Exact lifecycle operation belongs to Contract/Normalizer.

---

# 78. MATERIALIZATION SCHEMA

Materialization policy can be referenced by:
- Revive;
- Reincarnation;
- Temporary Absence;
- Spawn.

Conceptual:

```yaml
materialization:
  combatInstance:
  side:
  positionSelection:
  occupancyPolicy:
  uniquenessPolicy:
  retryPolicy:
```

---

# 79. UNIQUENESS

Uniqueness belongs to Axiom/System metadata.

Materialization validation can query:

```text
candidateDefinition.axiomIdentities contains UNIQUENESS
```

No Functional Tag required.

---

# 80. DIVINE NATURE

Thần Tính belongs to Axiom metadata/state.

Effect admission can query it.

An Ability that directly bypasses Thần Tính may later need:
- SystemInteraction field;
- explicit exception;
not necessarily new Tag.

---

# 81. STORY PROPERTY AND CAPABILITY INDEX

When Realized Property grants an existing semantic:

Example:
Sword grants True Damage.

Property generated capability:
`TRUE_DAMAGE`.

When Property is transferred/removed:
Capability Index updates source-specific contribution.

Independent native capability remains.

---

# 82. PER-SOURCE CAPABILITY CONTRIBUTIONS

Capability Index cannot be a flat boolean only.

For some semantics it must track source contribution.

Conceptual:

```text
TRUE_DAMAGE:
  sources:
    - native ability X
    - realized Sword property
```

Removing one source does not remove others.

This is important for Cố Sự Chi Thần.

---

# 83. TAG AGGREGATION RULE

Tags live on smallest semantic owner.

Capability Index may derive upward.

Example:
Damage Effect has `TRUE_DAMAGE`.

Ability has derived capability:
`TRUE_DAMAGE`.

Character has derived capability:
“has at least one Ability with TRUE_DAMAGE”.

But source-level ownership remains traceable.

---

# 84. STATIC PASSIVE

Static Passive may not create Action.

Example:
permanent self rule or native immunity.

Schema:

```yaml
abilityType: PASSIVE
trigger:
  activation: PASSIVE_STATIC
effects:
  ...
```

or persistent initialization state, depending final Contract.

No fake Natural Action.

---

# 85. EVENT-DRIVEN PASSIVE

Passive can register Trigger.

No Tag PASSIVE.

---

# 86. BASIC ATTACK PROFILE VS ACTION

Character can expose reusable:

```text
basicAttackDamageProfile
```

Other Skills may reference it.

This profile is pure damage composition, not Action.

Thus:
- Cuồng Bạo Basic-only effect observes Action Identity;
- Skill copying profile does not qualify.

---

# 87. MODE-SPECIFIC BASIC ATTACK

Turn-based Basic Attack and Exploration/Defense Normal Attack may share:
- presentation;
- stat formula;
or may differ.

Mode Profile can bind different Ability Definition.

Do not force one Action Contract across both modes.

---

# 88. AI AUTHORING CONSTRAINTS

When AI creates/normalizes kit:

It must not:
- invent missing resolution policy;
- hide ambiguity by choosing defaults;
- create custom Tag synonyms;
- create new Primitive unless requested by architecture audit;
- output implementation code as source-of-truth.

It should output:
- schema;
- unresolved list;
- candidate Tag/Primitive/Contract only when necessary.

---

# 89. HUMAN-READABLE PROSE PRESERVATION

Structured Ability data should retain a canonical prose description for designers.

Conceptual:

```yaml
designText:
  original:
  normalized:
```

`original` preserves user's intent wording.
`normalized` summarizes canonical semantic.

Kernel does not execute prose.

This prevents semantic normalization from erasing unusual fantasy/mechanics.

---

# 90. PROVENANCE

Each normalized Ability can carry:

```yaml
provenance:
  sourceDocument:
  sourceSection:
  normalizationVersion:
  unresolvedDecisions:
```

Useful when hundreds of kits are migrated over months.

---

# 91. CHANGE IMPACT ANALYSIS

Tooling should be able to answer:

- Which Abilities use Tag X?
- Which Abilities use Contract Y?
- Which Abilities create Revive?
- Which Abilities use Max HP Mutation?
- Which Abilities rely on `TURN_BOUNDARY_OF_TARGET`?
- Which Abilities depend on Target Exclusion?
- Which Abilities use childAuthorityPolicy=INHERIT_OUTER?

This is a major reason structured schema is preferable to bespoke code.

---

# 92. SCHEMA VALIDATION INVARIANTS

At minimum validator must enforce:

1. AbilityType is valid.
2. Deprecated legacy Functional Tags rejected.
3. Functional Tags match semantic EffectSpec.
4. Damage Effect has `DAMAGE`.
5. Damage component Tags correspond to component types.
6. True Damage does not imply Shield Piercing.
7. HP Cost has CostSpec/payment semantics.
8. HP Loss does not use CostSpec unless explicitly converted.
9. Max HP Mutation supplies reconciliation policy/profile.
10. Revive source target has post-DEATH_CONFIRMED lifecycle.
11. Death Prevention does not compile as Revive.
12. Target Exclusion does not remove geometry occupancy.
13. random target with duplicate-sensitive mechanic supplies duplicate policy.
14. persistent duration supplies clock.
15. child Action supplies parent/authority/cost policy when non-default behavior matters.
16. Result Binding types match consumer.
17. Effect DAG is acyclic.
18. Entity/Definition/TrueSelf refs are not mixed.
19. Presentation fields cannot drive gameplay.
20. Prime rank cannot auto-assign Axiom Authority.
21. Axiom Identity cannot be represented as ordinary Tag unless registry defines a true system-interaction Tag.
22. Pygmalion lifecycle quota does not enforce singleton.
23. Combat Definition inheritance does not default to clone all layers.
24. attribution overrides are explicit and traceable.
25. mode-incompatible systems rejected.

---

# 93. SCHEMA NON-GOALS

This file does not define:

- exact JSON Schema syntax;
- C# classes;
- Unity ScriptableObjects;
- database storage;
- network serialization;
- editor UI;
- localization pipeline;
- ECS layout;
- damage arithmetic order;
- same-tier Authority;
- exact event queue;
- SSI cursor implementation.

Those are later implementation/runtime decisions.

---

# 94. WHY THIS SCHEMA IS NOT A PROGRAMMING LANGUAGE

It allows:
- declarative condition tree;
- bounded effect DAG;
- typed result references;
- target selection;
- child action request;
- persistent trigger/state;
- subsystem gateway specs.

It forbids:
- arbitrary code;
- mutable local variable logic;
- unbounded loops;
- recursion by default;
- unrestricted event emission;
- engine reflection.

Therefore expressive power comes from:
> canonical systems + composition,
not arbitrary scripting.

---

# 95. ARCHITECTURAL FAILURE SIGNALS DURING FUTURE KIT MIGRATION

If many new kits require:

### Signal A
new Tag for every Character wording

Then:
> Tag semantic boundaries are wrong.

### Signal B
new Primitive for every kit

Then:
> Primitive abstraction is wrong.

### Signal C
very deep Effect DAGs or repeated awkward chains

Then:
> missing domain-level Primitive/System operation may exist.

### Signal D
many character-specific Contract profiles

Then:
> global Contract model may be too weak or over-specific.

### Signal E
frequent custom attribution hacks

Then:
> source/ownership model incomplete.

### Signal F
schema needs loops/custom variables

Then:
> either missing system abstraction or schema becoming programming language.

---

# 96. MIGRATION SAFETY RULE FOR 200+ KITS

Before bulk migration, freeze only:

1. terminology boundaries;
2. Tag semantics;
3. authored schema field meanings;
4. result-reference typing;
5. Primitive operation boundaries;
6. Contract versioning mechanism.

Do **not** freeze:
- every Primitive implementation;
- every default tuning;
- serialization layout;
- editor UI.

This makes late internal refactor cheaper.

---

# 97. MINIMUM PROOF SET BEFORE BULK MIGRATION

Architecture should not be considered “safe enough” until schema can represent at least:

1. simple Physical Basic Attack;
2. Mixed Basic Attack;
3. Heal;
4. Shield;
5. Buff/Debuff;
6. Debuff Cleanse;
7. Follow-up;
8. Counter;
9. Forced Action;
10. simultaneous AoE;
11. sequential multihit;
12. target lock after displacement;
13. HP Cost;
14. non-Cost HP Loss;
15. Max HP Mutation;
16. Overheal conversion;
17. Death Prevention;
18. post-confirmation Revive;
19. Reincarnation waiting/routing;
20. Pygmalion multiple persistent Puppets;
21. Combat Definition inheritance;
22. Behavior Source ≠ Damage Attribution;
23. Temporary Absence;
24. Arena;
25. Quang Ảnh snapshot/regression;
26. Cố Sự narrative capability/Proof/Realization;
27. dynamic Authority;
28. child Authority preserve vs inherit.

---

# 98. STAGE E ACCEPTANCE TEST

This schema passes Stage E only if all are true:

- [x] AI can author semantic data without raw Primitive sequences.
- [x] Kernel can receive normalized IR that maps to Primitives.
- [x] Primitive refactor does not automatically require editing all Character source files.
- [x] Ability Type is separate from Tags.
- [x] Action Identity is separate from Damage Profile.
- [x] Action Behavior is separate from Functional Tags.
- [x] TargetSpec replaces target-scope Tags.
- [x] TriggerSpec replaces trigger Tags.
- [x] Authority is separate from Axiom Identity.
- [x] Attribution is explicit.
- [x] Result Binding supports damage→heal/echo composition.
- [x] Effect DAG supports bounded complex actions.
- [x] Persistent recurrence uses State+Trigger, not loops.
- [x] Lifecycle systems use dedicated Effect specs.
- [x] Pygmalion multi-Puppet rule can be declared without singleton assumption.
- [x] Narrative System can query capabilities without turning all facets into Tags.
- [x] Mode profiles can swap combat behavior without duplicating core identity.
- [x] No arbitrary scripting escape hatch is required for current hard corpus.

---

# 99. OPEN QUESTIONS LEFT FOR CONTRACTS

Stage E intentionally leaves these unresolved:

1. Exact Action Completion event boundary.
2. Exact Turn Boundary event timing.
3. Slot Clock API.
4. Reaction priority ordering.
5. Child Action event visibility.
6. Simultaneous Damage commit vs death evaluation timing.
7. sequential hit intermediate reaction windows.
8. True Damage vs Final Damage Reduction.
9. Shield ordering when multiple Shield instances exist.
10. Cost reservation/refund policy.
11. failed auto-trigger cost and Trigger Cap interaction.
12. Revive global lifeSerial default.
13. Reincarnation waiting “4” clock.
14. same-tier Authority resolution.
15. dynamic Authority sampling point.
16. random target invalidation/reroll defaults.
17. materialization retry defaults.
18. Arena close/return object policy.
19. Narrative Belief formula.
20. Knowledge propagation delay.
21. Pygmalion Class inheritance.
22. Pygmalion Element inheritance.
23. Pygmalion inherited secondary-effect attribution.
24. Puppet exact `entityKind` / Summon classification.
25. exploration-mode AE ownership.

These belong mainly to Chặng F — Contracts.

---

# 100. NEXT STAGE

After review/acceptance:

> **Chặng F — `05_CONTRACTS.md`**

Chặng F should not add new semantics casually.

Its job is to make existing semantics deterministic by locking:

- order;
- timing;
- snapshot;
- commit;
- event;
- target invalidation;
- cost transaction;
- damage pipeline;
- death pipeline;
- Revive;
- Reincarnation;
- Authority conflict;
- parent/child Action;
- Combat Instance;
- Narrative;
- mode clocks.

Only after Contract stress tests pass should `06_KERNEL_RUNTIME.md` be finalized.
