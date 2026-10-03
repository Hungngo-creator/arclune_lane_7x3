# ARCLUNE — ABILITY SCHEMA
## Chặng E — Declarative Character / Ability Composition Schema
**Version:** 2026-10-03-E.9
**Status:** Working Canonical Candidate  
**Depends on:** `01_TERMINOLOGY_vNext_PILOT4_MERGED.md`, `02_TAG_vNext.md`, `03_PRIMITIVE.md`, `00_CANONICAL_RECOVERY_AUDIT-1.md`
**Primary goal:** cho phép AI/Designer khai báo hơn 200 kit bằng semantic + composition mà không biến Character thành code, Tag thành pseudo-code, hoặc Ability Schema thành một scripting language trá hình.

**Revision E.1:** incorporates Pilot Normalization #4 Schema support for scoped incoming Damage-component type transforms, battle-scoped Current Deployment Cost, explicit Return-to-Deck with transition-owned retention data, and deterministic tie policy for metric target selectors. No new Functional Tag or Primitive is introduced.

**Revision E.2:** adds checkpoint-scoped committed-result Conditions, Shield addition receipts/source-family caps and explicitly authored Slot ties through existing owners. Earlier normalized data remains unchanged; unresolved Character fields are not compiled into defaults.
**Revision E.3:** adds required post-completion settlement, typed result relation context, Shield owner/zero-addition clarification and bounded Final Damage amplification/direct-Action scope. Pre-Pilot-5 data remains unchanged; E.2 ACTION_RESULT_ANY content must explicitly bind readContext before normalization to E.3.
**Revision E.4:** adds bounded singular HP-payment profiles, immutable post-payment HP reads and explicit admitted-Action continuation through Cost-caused lifecycle processing. Existing exact-payment/default-floor and distributed Cost profiles remain unchanged; no new Tag/Primitive.
**Revision E.5:** adds a bounded Death Prevention completion profile joining a same-subject Return-to-Deck, survival assignment and selected allowance at one commit. Existing prevention/return/default Cost semantics remain unchanged; no new Tag/Primitive.
**Revision E.6:** adds explicit DIRECT_EXECUTE confirmation, an own-excluding StatModifier baseline, pre-Cost source snapshots, shared-recipient proportional Damage allocation bounded mitigation-stat overrides and local CostGroup continuation through existing owners. Ordinary HP_ZERO/prevention, joined Return and other stat baselines remain unchanged; no new Tag/Primitive.

---

**Revision E.8:** adds one opt-in reflected scalar packet profile under DMG-034, explicit packet-kind reduction scope and retained immediate-Damage-Source result grouping through existing owners. No fourth ordinary component type, Tag, Primitive or new lifecycle barrier.

**Revision E.9:** preserves explicit target locks while making the new-content Slot default concrete; adds bounded pre-Damage positional relocation/deferred-counter batching, distinct read-only fixed-area Damage projection, mandatory stable HP/MaxHP and owner-opportunity-start profiles through existing plans. No new Tag, Primitive or callback/priority system.

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

Character/deployment authoring.

Canonical conceptual form:

```yaml
deployment:
  fromDeck:
    enabled: true

    baseDeploymentCost:
      value: <number | TBD_BY_COST_BUDGET>

    currentDeploymentCostPolicy:
      scope: BATTLE
      initializeFrom: BASE_DEPLOYMENT_COST
      floor: 1
```

Canonical distinction:

```text
BASE_DEPLOYMENT_COST
≠
CURRENT_DEPLOYMENT_COST
≠
DEPLOYMENT_COST_BAR
≠
Ability CostSpec
```

### `baseDeploymentCost`

`BASE_DEPLOYMENT_COST` is the resolved Character deployment value produced by the Cost Budget system.

During Pilot Normalization:

```text
TBD_BY_COST_BUDGET
```

remains an allowed authored placeholder.

The placeholder:
- does not define the Cost Budget formula;
- does not imply current runtime deployability;
- does not invalidate Ability normalization;
- must be resolved before execution-ready deployment needs numeric payment.

### `CURRENT_DEPLOYMENT_COST`

`CURRENT_DEPLOYMENT_COST` is authoritative battle-scoped Character deployment state.

At battle initialization, before Character-specific battle-start mutations:

```text
CURRENT_DEPLOYMENT_COST
=
BASE_DEPLOYMENT_COST
```

subject to the declared deployment-cost policy.

`CURRENT_DEPLOYMENT_COST` may then be changed only by explicit canonical Deployment-Cost mutation semantics.

It:
- is the value used by `DEPLOY_FROM_DECK` payment;
- may be read by Ability formulas through a typed ValueRef;
- may be snapshotted;
- may persist through Return-to-Deck within the same battle;
- resets from Base Deployment Cost when a new battle initializes;
- is not the Side Deployment Cost Bar.

### Floor

`currentDeploymentCostPolicy.floor` defines the lower legal bound for Current Deployment Cost.

Pilot #4 currently requires:

```text
floor = 1
```

This does not define the future Cost Budget formula.

### Lock state

Current Deployment Cost runtime state must be able to represent whether its exact current value is locked against later Deployment-Cost mutations.

The default battle initialization state is conceptually:

```text
locked = false
```

until explicit authored gameplay changes it.

Lock semantics belong to Deployment Contract.

### Existing field migration

Previous Stage-E authored field:

```yaml
deploymentCost:
```

represented what is now explicitly named:

```yaml
baseDeploymentCost:
```

Existing authored numeric / `TBD_BY_COST_BUDGET` data therefore has a mechanical one-way migration:

```text
deploymentCost
→ baseDeploymentCost.value
```

with no intended gameplay-value change.

Deck membership and current deployability remain runtime/system concerns.

They are not inferred from:

```text
deployment.fromDeck.enabled
```

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
  actionIntentInterpositions: []
  prerequisites: []
  costs: []
  costGroups: []
  targeting:
  snapshots: []
  effects: []
  effectAmountModifiers: []
  damageComponentTransforms: []
  damageMitigationOverrides: []
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

`costGroups` is optional and is used only when several CostSpecs require explicit transaction/group semantics beyond the ordinary fixed Cost list.

`effectAmountModifiers` is optional and contains constrained declarative modifier rules defined by `ScopedEffectAmountModifierSpec`.

`damageComponentTransforms` is optional and contains constrained declarative `ScopedDamageComponentTransformSpec` rules.

`actionIntentInterpositions` is optional and contains bounded declarative `ActionIntentInterpositionSpec` rules owned by this Ability.

A Passive may own:
- an Action-Intent interposition;
- a scoped Effect-amount modifier;
- a scoped incoming Damage-component transform;

without duplicating the same rule into every observed Basic / Skill / Ultimate definition.

None of these fields authorizes custom executable code.

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
  naturalActionFormPolicy:
  parentChildPolicy:
  childAuthorityPolicy:
  childCostPolicy:
  childSnapshotPolicy:
  actionCompletionPolicy:
  costLifecyclePolicy:
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

### Optional `costLifecyclePolicy`

Minimum explicit profile: `CONTINUE_ADMITTED_ACTION`. After successful Cost, mandatory Cost-caused HP_ZERO/lifecycle processing finishes before direct Effects; actor death or field leave from that processing does not itself cancel this already-admitted Action. Retain its execution context and bindings. No admission replay, new Action, resurrection, payment waiver, target replacement or bypass of explicit Effect legality/cancellation is implied. `CST-015` governs timing. Absence preserves existing profiles; observable Cost-caused source invalidity requires an applicable explicit continuation/cancellation law, not a guessed default.

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

# 6A. ACTION INTENT INTERPOSITION SPEC

`ActionIntentInterpositionSpec` is a bounded declarative rule owned by an Ability, commonly a Passive, that may settle against another Action Intent before that intent completes ordinary admission/effect execution.

Canonical distinction:

```text
ACTION INTENT / REQUEST
≠
ADMITTED ACTION
```

An Action Intent records what the player/autonomy currently requests.

It does not by itself prove that the requested Ability:
- is legal;
- is payable;
- has valid targets;
- has entered ordinary Action execution;
- has committed Cost;
- has emitted Action Events.

Conceptual form:

```yaml
actionIntentInterposition:
  interpositionId:

  intentScope:
    actorRef:
    naturalActionStatus:
    actionIdentities: []
    abilityRefs: []

  branchSelectionTiming:

  branches:
    - branchId:
      conditions: []
      anchor:
      settlementAbilityRef:
      settlementFailurePolicy:
      revalidationPolicy:

      onRevalidationFailure:
        candidates:
          - candidateId:
            actionIdentity:
            abilityRef:
            abilitySelector:
            conditions: []
```

## Intent scope

`intentScope` declares which Action Intents this rule may observe.

It must be explicit enough that a Passive intended for Natural Actions does not accidentally interpose on:
- Follow-up;
- Counter;
- Reaction;
- Forced Action;
- child Action;
- unrelated actor Action.

Example semantic scope:

```yaml
intentScope:
  actorRef: SELF
  naturalActionStatus: NATURAL
  actionIdentities:
    - BASIC_ATTACK
    - SKILL
    - ULTIMATE
```

`actorRef = SELF` is resolved relative to the owner of the interposition rule.

## Branch selection timing

Current canonical value:

```text
ACTION_INTENT_CREATED
```

Branch conditions are evaluated once for that Action Intent.

After a branch is selected:

> later HP/resource/state changes during the same admission sequence do not retroactively select another branch.

## Allowed anchors

Current allowed anchors are exactly:

```text
PRE_ADMISSION_PRE_COST
POST_COST_PRE_EFFECT
```

No arbitrary authored timing string is permitted.

### `PRE_ADMISSION_PRE_COST`

Semantic flow:

```text
Action Intent exists
→ declared settlement
→ optional authoritative revalidation of the preserved original Intent
→ admit original Intent or evaluate explicit fallback
```

Ordinary pre-interposition legality/payability probing must not discard the original Intent before this declared settlement has had its opportunity to resolve.

### `POST_COST_PRE_EFFECT`

Semantic flow:

```text
Action Intent
→ ordinary admission
→ required active Cost commits
→ declared settlement
→ admitted Ability effects continue
```

If the admitted Action has no active Cost:

```text
ordinary Cost stage completes with no payment
→ declared settlement
→ Ability effects
```

No fake Cost is created.

## Settlement reference

`settlementAbilityRef` references an authored Ability/settlement definition.

Invoking it at this boundary:
- does not create a second Natural Action;
- does not convert it into a child Natural Action;
- does not establish global Reaction priority;
- does not authorize arbitrary callback execution.

## Settlement failure

Current minimum:

```text
CONTINUE
FAIL_INTENT
```

`CONTINUE` means settlement failure itself does not automatically cancel the preserved Action Intent.

## Revalidation

Current minimum:

```text
NONE
REVALIDATE_ORIGINAL_INTENT
```

`REVALIDATE_ORIGINAL_INTENT` re-tests the same preserved request against current authoritative state.

It is not a new Action selection.

## Revalidation fallback

`onRevalidationFailure.candidates` reuses the candidate-entry shape and read-only probing semantics of `naturalActionFormPolicy`.

Fallback candidates are evaluated in authored order.

There is no global rule:

```text
failed Skill / Ultimate
→ BASIC_ATTACK
```

Basic Attack occurs only when explicitly authored as a fallback candidate.

## Relationship to `naturalActionFormPolicy`

`naturalActionFormPolicy` constrains which form an SSI-granted Natural Action may use.

`ActionIntentInterpositionSpec` allows an Ability-owned bounded settlement to occur against an already-created Intent at a canonical admission boundary.

They are not interchangeable.

## Safety boundary

This object must not support:
- arbitrary method calls;
- custom code;
- custom timing strings;
- unbounded repeated interposition;
- arbitrary jumps between pipeline stages;
- Character-ID runtime callbacks.

Recurring future behavior remains State + Trigger.

Late root-completion settlement remains `rootCompletionDependency` / `actionCompletionPolicy`.

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
  postActionSettlement:
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

## 7.13 `postActionSettlement`

Optional bounded declaration for an ACTION_COMPLETED Trigger whose finite settlement is required in the **existing post-action phase**, before the next Natural Action opportunity. It does not delay ACTION_COMPLETED or create a future-Action scheduling token. Its finite Effect graph may explicitly create ordinary persistent State, whose future behavior/lifetime is separately authored.

```yaml
postActionSettlement:
  mode: BEFORE_NEXT_NATURAL_ACTION
  observedActionRef: EVENT_ACTION
  completionSourcePolicy: NATURAL_ONLY # optional; existing default
  dependencyId:
  dependsOn: []
```

The default NATURAL_ONLY requires an actually completed Natural Action in the same Combat Instance. An explicit completionSourcePolicy ALLOW_COMPLETED_NON_NATURAL also permits an actually completed non-Natural Action under ACT-033, using this Combat Instance's existing next-Natural Scheduler handoff gate. The finite observer work does not wait for a future Action or delay its completed source/parent; it merely must be terminal before any next Natural Action starts. Absent this opt-in, non-Natural observations remain rejected. Dependency identity is observed Action + runtime trigger owner + instantiated candidate + local dependencyId. Local dependsOn edges refer only to this opportunity's required post-action obligations. Use the existing required post-action Scheduler/Effect DAG/Transaction owners, not a new queue/priority subsystem.

Completion dispatch registers the authored obligation before SSI handoff; its eligibility check and any created settlement become terminal before that handoff. A false condition/clean failed activation closes it under existing failure law. After consume/create commits, an independently authored settlement's validity/lifetime governs later source leave; Trigger re-eligibility does not undo committed creation. Finite scheduler save state is not a pending token for a later Action.

Normalizer rejects missing Action/owner/Mode anchors, non-completed sources/non-Natural sources without this explicit profile, cross-observation/opportunity edges, cycles, waits for the next Action/TURN_BOUNDARY being blocked, unbounded creation and combining this obligation with a blocker for its own completion. A Mode must expose the same Natural Action/required post-action phase or require an explicit 07 adaptation. No ordering of unrelated observers follows from this marker.

---

## 7.14 Required stable-health settlement

Optional `trigger.stableHealthSettlement` observes HEALTH_MUTATION_STABLE under TRG-016:

```yaml
event: HEALTH_MUTATION_STABLE
stableHealthSettlement:
  mutationFields: [CURRENT_HP, CURRENT_MAX_HP]
  mode: MANDATORY_BEFORE_NEXT_DIRECT_GROUP
  subjectRef: EVENT_SUBJECT
  dependencyId: <local finite settlement ID>
  dependsOn: []
```

Conditions read stable post-lifecycle health/presence and ordinary owner State; Effects use existing Cost/cap/State/DAG laws. This profile is finite mandatory work before the next direct group, not an ordinary Reaction or a new Action. Actual health mutations may come from Damage, Heal, Cost/Loss, MaxHP/reconciliation or lifecycle; their semantic kinds stay distinct. No-op writes and AE-only changes do not qualify. No polling/failed-payment retry token. Dependencies are limited to this observation, cannot await a future direct group/Action, and do not order competing unrelated candidates. Observable shared-budget or non-commuting interactions require an explicit composition law.

## 7.15 Required owner-opportunity-start settlement

Optional `trigger.opportunityStartSettlement` observes an actual owner Natural Action opportunity grant under ACT-034:

```yaml
event: NATURAL_ACTION_OPPORTUNITY_GRANTED
opportunityStartSettlement:
  mode: BEFORE_CONTROL_AND_ACTION_SELECTION
  ownerRef: <Entity/State owner>
  stateInstanceRef: <retained State instance>
  createdAtOpportunitySerial: <immutable creation binding>
  dependencyId: <local finite settlement ID>
  dependsOn: []
```

The first later owner grant may terminate State and resolve an ordinary Heal before the same opportunity's CC/selection/admission. It creates no Action/opportunity and does not turn a CC-lost opportunity into an actually performed/completed Action. Use the existing scheduler's grant identity and retain cleanup/source-validity policies. Reject foreign/stale owner/State refs, waits on the held opportunity's future Action, cycles or unsupported Mode clocks. Existing actual-action clocks/postActionSettlement remain unchanged.

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
ACTION_RESULT_ANY
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
actorRef
actionIdentity
actionBehavior
naturalActionStatus
originAbilityId
parentActionRef
rootActionRef

`actorRef` identifies the Actor performing that Action.

It must remain distinct from Effect Attribution dimensions such as:

```text
caster
owner
source
damageAttribution
```

when a mechanic explicitly queries the Actor of the Action rather than the credited Damage source.

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
Damage execution/result queries also expose typed packetKind and immutable immediate damageSourceRef under §16.5/DMG-034, separately from effectSource/Damage Attribution. Non-Damage contexts do not invent these fields. Ordinary packets keep their component types; reflected kind is not an Action identity or Tag.
These queries expose existing execution identity/provenance.
They do not create a second Action-lineage subsystem.

---

## 8.4 Checkpoint-scoped committed-result predicates

`ACTION_RESULT_ANY` is a bounded Condition over existing typed Action results. It does not query current HP/Shield totals, execute an arbitrary historical loop, or create another Action-result subsystem.

Conceptual form:

```yaml
actionResultAny:
  actionRef:
    anchor: EVENT_ACTION
    relation: SELF
  resultCheckpoint: ACTION_DIRECT_EFFECTS_COMPLETE | ACTION_COMPLETED
  effectProvenanceScope: DIRECT_EFFECT_GRAPH_OF_SCOPED_ACTION
  resultKind: DAMAGE | HEAL | SHIELD_ADDITION
  recipientFilter:
    relation:
    relationAnchor:
    readContext:
      mode: OBSERVATION_STATE | SNAPSHOT
      snapshotRef: <SnapshotRef; required only for SNAPSHOT>
    filters: []
  metric:
  compare:
    op: GT | GTE | LT | LTE | EQ | NEQ
    value: <pure scalar ValueRef>
```

The Action must have reached the explicitly selected checkpoint. At `ACTION_DIRECT_EFFECTS_COMPLETE`, read a sealed own-direct committed receipt-reference projection; this does not finalize the whole Action result object before later blocking settlements. At `ACTION_COMPLETED`, read the finalized Action result object, filtered to the same declared direct provenance. An ADEC-triggered State update may use existing bounded `rootCompletionDependency`; an observer triggered only by completion cannot block that same completion.

Allowed kind/metric pairs are bounded:

| resultKind | metric | Authoritative committed field |
| --- | --- | --- |
| DAMAGE | ACTUAL_HP_DAMAGE | DamageResult.actualHpDamage |
| HEAL | ACTUAL_RESTORE | HealResult.actualRestore |
| SHIELD_ADDITION | COMMITTED_ADDED_AMOUNT | ShieldAdditionResult.committedAddedAmount |

Filter committed entries belonging to the scoped Action's own direct graph, apply the typed recipient relation/filter using its explicit anchor and existing snapshot/read policy, then compare the selected committed field. The result is one Boolean: `ANY` matching entry, or false for an empty filtered collection. Match count does not multiply Trigger activations. Historical evidence does not inherit target-selection ALIVE/presence/targetability filters: a recipient killed by the committed Damage still provides its result. Apply only the recipient filters actually authored. Separate predicates may independently inspect different result kinds for the same Action.

`TRG-002` governs relation/Condition state reads; result amounts and provenance are immutable commit data, not live reconstructed values. `recipientFilter.readContext` is required: OBSERVATION_STATE uses TRG-002 at observation; SNAPSHOT requires an available immutable SnapshotRef captured under §13 that covers recipient, relationAnchor and every relation/filter fact read. Reject missing/uncovered/stale references; no arbitrary checkpoint string or implicit fallback to live allegiance. This typed context applies to recipient relation/filter facts only, not immutable result amounts/provenance. `TRG-013` / `TRG-015` govern direct provenance and completion observation.

Normalizer rejects an unavailable/not-yet-reached Action/checkpoint anchor, wrong kind/metric pair, nominal/live amount in a committed metric, missing relation anchor, unsupported Shield operation mapping, or a dependency cycle that waits for its own completion Event. Existing logical `ALL`/`ANY`/`NOT` can combine these bounded predicates with State Conditions. No new Functional Tag or Primitive is implied.

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
COST_PAYMENT_REF
COST_GROUP_PAYMENT_REF
BASE_DEPLOYMENT_COST_REF
CURRENT_DEPLOYMENT_COST_REF
DAMAGE_PROJECTION_REF
```

`BASE_DEPLOYMENT_COST_REF` reads resolved Character Base Deployment Cost.

`CURRENT_DEPLOYMENT_COST_REF` reads the authoritative battle-scoped Current Deployment Cost.

Neither reads the Side Deployment Cost Bar.

Both are pure typed reads and may participate in bounded Formula/Snapshot composition.

Example:

```text
C_cast
= SNAPSHOT(CURRENT_DEPLOYMENT_COST_REF(SELF))
```

A later Current Deployment Cost mutation does not rewrite that earlier Snapshot.

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
  payerCollection:
  kind:
  amount:
  validation:
  paymentTiming:
  insufficientPolicy:
  optionalPayerFailurePolicy:
  waiverPolicy:
  refundPolicy:
  resultBinding:
  hpPaymentPolicy:
```

A CostSpec uses either:

```text
payer
```

or:

```text
payerCollection
```

for one payment definition.

Do not silently treat a payer collection as one shared payer.

---

## 10.1 `payer`

Can reference:
- caster;
- owner;
- actor;
- team resource pool;
- explicit entity.

---

## 10.1A `payerCollection`

Optional runtime-selected collection of entities where each selected member is the payer of its own Cost instance.

Conceptual form:

```yaml
payerCollection:
  query:
    targetKind:
    relation:
    relationAnchor:
    candidateSource:
    filters: []
    excludeRefs: []
    selection: ALL

  snapshotTiming: AFTER_REQUIRED_VALIDATION_BEFORE_REQUIRED_COMMIT
```

The query reuses the existing structured candidate/filter vocabulary.

When `relation` requires a reference entity, including:

```text
ALLY
ENEMY
SAME_SIDE
OPPOSING_SIDE
```

`relationAnchor` is mandatory.

The Kernel must not infer “ally/enemy relative to whom”.

For distributed Cost introduced by this Pilot:

```text
selection = ALL
```

is the supported collection-selection semantic.

Each entity in the snapshotted collection becomes the payer of one instance of this CostSpec.

Within that per-payer Cost evaluation:

```text
PAYER
```

resolves to the current collection member.

This permits authored formulas such as:

```text
10% of PAYER.CurrentMaxHP
```

without converting the payment into Damage from the caster.

### Snapshot requirement

For distributed Cost participating in a CostGroup with required Costs:

```text
AFTER_REQUIRED_VALIDATION_BEFORE_REQUIRED_COMMIT
```

means the payer collection is frozen:

```text
after required Cost / mandatory-payer validation
but before any required Cost payment commits
```

Payment of one entity must not silently change which other entities belonged to the already-snapshotted payer collection.

The exact transaction order is Contract-defined.

Schema exposes the semantic anchor.

### Payer collection is not Target ownership

Using structured target/query vocabulary here does not mean collection members become the Ability's damage/heal targets.

They are Cost payers.

Targeting and Cost-payer selection remain separate semantic roles.

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

## 10.3A Optional bounded `hpPaymentPolicy`

For singular `kind = HP` only; current bounded support does not accept `payerCollection`:

```yaml
hpPaymentPolicy:
  cases:
    - hpRange: BELOW_REQUESTED | AT_OR_ABOVE_REQUESTED
      conditions: [] # existing structured Conditions, pre-payment state only
      minimumRemainingHp: <pure nonnegative finite ValueRef>
      shortfallPolicy: REQUIRE_FULL | CLAMP_SUCCESS
      consumeCounterRef: <optional existing COUNTER_REF remaining-use binding>
```

Evaluate normalized requested amount, payer HP, guard Conditions, floor and counter availability once from the transaction's authoritative pre-payment view. `hpRange` compares that HP with that same normalized requested amount. Exactly one case must match; case/list/Event order never chooses a winner. Reject uncovered/overlapping cases, unsupported guards, negative/nonfinite amounts/floors or floors above Current MaxHP. A counter binding names existing owner-keyed State/counter data, not a new allowance manager or arbitrary commit callback.

The selected case explicitly owns this payment's HP payability/floor. Do not co-author the legacy scalar `lethalFloor` with `hpPaymentPolicy`; reject that conflicting source shape rather than select precedence. Other required Cost validation and ordinary failure/refund laws remain authoritative. A consuming case is supported only for a required Cost of the admitted Action, not optional-payer or unrelated settlement-counter mutation.

`REQUIRE_FULL` requires full requested payment while respecting the selected floor. `CLAMP_SUCCESS` explicitly permits a smaller/zero successful payment: `paid = min(requested, max(0, hpBefore - floor))`; `hpAfter = max(floor, hpBefore - paid)`. Its declared floor assignment is not Heal; the receipt's debit is not reconstructed from later/net HP differences. This is opt-in exceptional semantics, not the ordinary required-Cost default. `CST-014` owns the atomic law.

If supplied, `consumeCounterRef` consumes one available remaining-use unit only with successful required-group commit and Action admission; protect its read/write in that transaction. Failed probes, another required Cost failure or an uncommitted/aborted transaction consume nothing. Independent matching Costs may not compete for the same payer HP/counter without an explicit supported allocation law. No hidden payment order or partial required-group commit.

Example composition for a once-only safeguard: BELOW_REQUESTED + allowance available → floor1/CLAMP_SUCCESS/consume allowance; BELOW_REQUESTED + exhausted → floor0/CLAMP_SUCCESS; AT_OR_ABOVE_REQUESTED → floor0/REQUIRE_FULL. Those are authored cases, not Character-ID rules. Existing unprofiled Costs, ordinary full-payment exchanges and distributed optional-payer semantics remain unchanged.

---

## 10.4 `CostGroupSpec`

Several CostSpecs may participate in one declared Cost transaction/group.

Conceptual form:

```yaml
costGroup:
  costGroupId:
  requiredCostRefs: []
  optionalDistributedCostRefs: []
  admittedActionRef:    # optional local-graph group only
  costLifecyclePolicy: # optional CONTINUE_ADMITTED_ACTION under CST-015
  resultBinding:
```

### Optional local Cost-group continuation

A finite pre-hit/local settlement inside an existing admitted Action graph may declare `admittedActionRef` to that same enclosing Action and `costLifecyclePolicy: CONTINUE_ADMITTED_ACTION`. CST-015 then applies its lifecycle-before-continuation barrier to that group's complete successful transaction, without creating an Action. Group required Costs remain required for this **local branch**, not automatically for the enclosing Action; explicit local failure/dependency law determines whether the ordinary hit continues. This is bounded CostGroup/Action execution, not a third Action-Intent interposition anchor or arbitrary hook.

Validate same enclosing Action/current-instance, source-Actor HP payer, target/snapshot/result bindings already established, full local-group terminal barrier and declared continuation DAG. Reject foreign Action continuation, new requests, missing failure policy or conflicting Action/group profiles. It does not extend CST-014's allowance exception to arbitrary optional Costs.

### `requiredCostRefs`

References CostSpecs whose successful validation/payment is required for the Ability to proceed under the applicable Cost Contract.

Ordinary fixed multi-cost requirements such as:

```text
25 AE + 5 Rage
```

remain representable as required Costs.

### `optionalDistributedCostRefs`

References CostSpecs that:

- use `payerCollection`;
- attempt one payment per snapshotted payer;
- do not by themselves fail the entire Ability merely because one optional payer cannot pay.

Every referenced distributed Cost must declare an explicit optional-payer failure policy.

### Required vs optional does not change payer identity

A payer in `optionalDistributedCostRefs` still pays its own Cost.

Optional means:

> that payer's failed contribution need not fail the whole CostGroup.

It does not mean the caster pays on that entity's behalf.

### Payer-set ordering

For a CostGroup containing both required Costs and optional distributed Costs, authored data must preserve:

```text
validate required Costs / mandatory payer legality
→ snapshot optional payer collection
→ commit required Costs
→ attempt optional payer Costs from the frozen collection
```

The exact authoritative transaction Contract belongs to Stage F.

Schema must not encode a payer collection whose membership is first determined after required payment has already started.

### `resultBinding`

A CostGroup may expose a typed committed group-payment result.

Exact fields and legal consumers are defined under Result Bindings.

No CostGroup creates a new Primitive.

---

## 10.4A `optionalPayerFailurePolicy`

For a CostSpec referenced through:

```text
optionalDistributedCostRefs
```

the current minimum supported policy is:

```text
CONTRIBUTION_ZERO_CONTINUE
```

Meaning:

- the payer's payment attempt may fail;
- that payer contributes zero actual paid amount;
- failure does not by itself invalidate payments committed by other optional payers;
- failure does not by itself fail the whole Ability.

This field does not define transaction timing.

Timing/atomicity belong to Cost Contract.

---

## 10.5 Waived child cost

Composite Ultimate can call child Skill with:
`childCostPolicy = WAIVE_CHILD_COST`.

This must not mutate child Skill's base definition.

## 10.6 Cost payment result binding

A singular-payer CostSpec may expose the authoritative result of its committed payment attempt:

```yaml
cost:
  costId: ULTIMATE_HP_COST
  payer: SELF
  ...
  resultBinding: ULTIMATE_HP_PAYMENT_RESULT
```

This binding denotes one typed:

```text
COST_PAYMENT_RESULT
```

It refers to committed payment outcome, not the nominal Cost formula.

If a CostSpec uses:

```text
payerCollection
```

it produces multiple per-payer payment outcomes at runtime.

Such a distributed CostSpec must not expose those multiple outcomes through one ambiguous singular `COST_PAYMENT_RESULT` binding.

Distributed member results are exposed through the containing declared `CostGroup` / `COST_GROUP_PAYMENT_RESULT`.

A CostGroup may expose:

```yaml
costGroup:
  ...
  resultBinding: SKILL2_COST_GROUP_PAYMENT_RESULT
```

This distinction is required whenever:

```text
requested Cost
≠
actual amount successfully paid
```

---

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
  relationAnchor:
  candidateSource:
  filters: []
  selection:
  tiePolicy:
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

```text
targeting.spatialSelector
```

uses the common `SpatialSelectorSpec`.

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

## 11.5A `tiePolicy`

`tiePolicy` resolves equality after a metric/ordered selector has identified the best metric value.

It is separate from:
- initial candidate filtering;
- random multi-target selection;
- duplicate policy;
- target invalidation;
- reroll/requery after selection.

Current bounded tie policies:

```text
RANDOM_AMONG_TIED
EXPLICIT_SLOT_ORDER
```

Pilot #4 keeps its count-one random-tie semantics. Pilot #5 adds an explicitly authored local Slot tie order, not global target or Reaction priority.

---

### `RANDOM_AMONG_TIED`

Canonical authoring meaning:

```text
1. evaluate the selector metric for every eligible candidate;
2. identify the best metric value;
3. build the exact tied-best candidate set;
4. choose one candidate from that tied set using existing deterministic seeded RNG.
```

Example:

```yaml
targeting:
  relation: ALLY
  filters:
    - exclude Leader
    - exclude SELF
    - require True Self
    - require legal Heal recipient

  selection: LOWEST_HP_PERCENT
  tiePolicy: RANDOM_AMONG_TIED
  count: 1
  lockPolicy: LOCK_ENTITY_IDS
  invalidPolicy: DROP_INVALID
```

This means:

```text
lowest CurrentHP / CurrentMaxHP
→ random only among exact tied minima
```

not random among the whole candidate pool.

---

### Tie policy is selection-time only

`RANDOM_AMONG_TIED` does not imply:
- `REROLL`;
- `REQUERY`;
- retarget after lifecycle invalidation;
- another RNG draw after the initial locked target is selected.

Later invalid-target behavior remains governed by:

```text
invalidPolicy
lockPolicy
requeryPolicy / explicit later target plan
```

---

### Alcestis secondary-target authoring consequence

Pilot #4 latest locked Character data uses:

```text
Ultimate target-context establishment
→ evaluate secondary target at step 2
→ LOWEST_HP_PERCENT
→ RANDOM_AMONG_TIED
→ LOCK_ENTITY_IDS
```

The selected Entity is then reused by the later secondary Heal branch.

No later target-selection/requery node is authored for that branch.

If the locked target becomes lifecycle-invalid before secondary Heal:

```text
DROP_INVALID / local branch skip
```

applies.

The tie policy is not rerun and no replacement ally is selected.

---

### Determinism

All random tie resolution uses the existing deterministic RNG service.

A tied metric selector must not use:
- collection iteration order;
- entity ID;
- Slot order;
- Event sequence;

unless a future explicitly-authored tie policy defines one of those semantics.

### `EXPLICIT_SLOT_ORDER` and metric top-N cutoff

```yaml
targeting:
  selection: LOWEST_HP_PERCENT
  count: <positive integer>
  tiePolicy: EXPLICIT_SLOT_ORDER
  explicitSlotOrder: [<PositionRef>, <PositionRef>, ...]
```

Rank unique eligible candidates by the declared metric at one selection checkpoint. Fill complete better-ranked groups first; where a tied metric group must be ordered or crosses the count cutoff, use only the explicitly declared policy. `EXPLICIT_SLOT_ORDER` compares the candidates' positions captured at that checkpoint against the authored ordered PositionRefs. Mode provides valid position identities; Character data supplies this local order. Leader is an ordinary occupant of its actual Slot, not an appended entity or hidden first priority.

The order must uniquely cover candidates requiring tie resolution. Reject duplicate/unresolved PositionRefs, unmapped tied candidates or multiple tied occupants without a further declared law; do not fall back to entity/list order. HP% uses authoritative unrounded ratios. This policy consumes no RNG. `RANDOM_AMONG_TIED` may select the needed distinct members of a cutoff tied group using existing seeded RNG with `NO_DUPLICATES`; it still cannot randomize among worse metric groups. Top-N returns at most the available eligible count.

Explicit Slot ordering applies only to metric equality at initial selection. Lock, invalidation and later requery remain independent. Additional tie policies require explicit future Schema/Contract review.

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

## 11.11 Position-bound attacks and occupant reads

For new attack content without an explicitly approved binding, the designer's project default is Position/Slot binding under TGT-008. Normalize it into an explicit POSITION / LOCK_POSITIONS profile; executable IR never guesses a missing binding. Existing explicit Entity/Both profiles and previously approved Character locks remain unchanged. Non-attack Entity, Self, Leader, State and other references are not migrated by this default.

An opted-in Position attack can declare:

```yaml
positionRecipientRead:
  mode: CURRENT_LEGAL_OCCUPANT
  checkpoint: POST_POSITIONAL_INTERPOSITION_PRE_DAMAGE
  emptyPolicy: MISS | OMIT_RECIPIENT
requeryPolicy: DO_NOT_RESELECT_POSITIONS
```

At this checkpoint, read current legal occupants of the retained coordinates, then freeze recipient identities and the shared calculation state through commit. This occupancy read is not another Slot selection or retarget: an original Entity moving away is not chased; a legal replacement at that coordinate may receive the hit. Apply the authored invalidPolicy to an invalid resolved recipient, without another coordinate/occupant query inside the same batch. Source Snapshot bindings remain independent. Entity binding does not itself grant Guaranteed Hit; HIT-* still applies. This profile requires retained Position routing; a simultaneous Entity/Both lock needs an explicit compatible Contract, never silently ignored identity fields.

The same policy composes with AreaSpec positionSet/occupancyRule. Explicit Entity-bound areas retain their declared checkpoint. Do not silently convert every prior AoE to a post-movement query or use renderer state for occupancy.

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
AFTER_ADMISSION_BEFORE_COST_COMMIT
BEFORE_FIRST_HIT
AFTER_CHILD_ACTION
ON_ENTITY_CREATION
BEFORE_DEATH_CONFIRMED
AFTER_ACTION_COMPLETION
```

Exact legal timing points belong to Contract.

`AFTER_ADMISSION_BEFORE_COST_COMMIT` opts into SNP-006: capture declared source fields once for the successfully admitted Action before any active Cost debit, after read-only admission/payability checks. It is not a probe-time capture or an Effect/Counter/payment phase. Failed active Cost cannot activate snapshot-dependent direct Effects; retain a successful capture for the same admitted Action through explicit Cost-caused lifecycle continuation. Other snapshot timings remain unchanged.

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
  deploymentCost:
  position:
  lifecycle:
  deathPrevention:
  returnToDeck:
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
DEPLOYMENT_COST_MODIFICATION
HP_LOSS
HP_COST
MAX_HP_MUTATION
POSITION_MUTATION
SPAWN_ENTITY
REMOVE_ENTITY
TEMPORARY_ABSENCE
RETURN_TO_DECK
REVIVE
REINCARNATION
SYSTEM_LIFECYCLE
COMBAT_DEFINITION_INHERITANCE
REQUEST_ACTION
ARENA_INTERACTION
NARRATIVE_INTERACTION
SNAPSHOT_OPERATION
```

This enum is not a one-to-one mirror of Primitive IDs.

SYSTEM_LIFECYCLE is the already-used §77 Death Prevention family; only its explicitly defined canonical profiles normalize. It is not an arbitrary lifecycle operation/callback escape hatch.

§77.2 also defines the bounded DIRECT_EXECUTE confirmation profile for this family; a lifecycle label alone does not select it.

Normalizer maps EffectSpec to one or multiple Primitive/system-operation requests.

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

Canonical ordinary component types:
- PHYSICAL
- WILL
- TRUE

Mixed Damage is multiple components. The opt-in reflected scalar packet in §16.5 is a separate packet semantic, not a fourth ordinary component or mixed profile.

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

## 16.5 Opt-in reflected scalar packet

```yaml
damage:
  packetKind: REFLECTED_DAMAGE
  reflected:
    basisResultRef: <sealed committed received-ActualHP projection for one recipient/one immediate Damage Source>
    coefficient: <pure finite nonnegative scalar>
    mitigationProfile: BYPASS_ARM_RES_THEN_FINAL_REDUCTION
  resultBinding: <ordinary typed DamageResult binding>
```

Under DMG-034, this form replaces ordinary `profile.components`/profile-copy/aggregation amount authoring. Omitted packetKind keeps the ordinary component path. Never co-author a reflected scalar packet with PHYSICAL/WILL/TRUE components, Penetration, component transform/mitigation-stat override or an incompatible profile. The only currently supported reflected mitigation profile bypasses ARM/RES, applies qualifying existing FINAL_DAMAGE_REDUCTION once to the scalar, then ordinary Shield/HP/Overkill. No component Tags, TRUE relabel, Shield bypass or final amplification is inferred.

The retained DamageAggregateRef proves an explicit reached Damage-outcome checkpoint, exact committed receipt/Effect membership, receiving reflector and **one immediate Damage Source**. Pure coefficient multiplication is the amount; requested/Shield/Overkill/live-HP reconstruction are not substitutes. Existing target bindings identify that exact Source; invalid source follows the authored local skip/no-retarget policy, not an owner/Attribution fallback. Damage Source and attribution stay separate. A trigger may create one packet per declared source group; its target/batch/failure policy remains explicit Resolution data, not a global reflection priority.

Create a new reflected Effect/packet/result with its own provenance and causal basis references. It may be Actionless; no synthetic Basic/Counter/Reaction/Natural Action is required. DMG-030–033 guard recursive reflect, ordinary Lifesteal and Counter by packet semantic/provenance. Merely inheriting root lineage cannot admit this standalone Effect into the triggering Action's direct/declared outcome. Default ordinary recursion exclusion rejects a reflected basis unless another explicit Contract permits it.

Use DAMAGE only; REFLECTED_DAMAGE is existing semantic metadata, not a newly registered Tag. Normalizer lowers to P-040/041/042 plus existing P-043 result grouping and Contract inputs, with stable Effect/candidate/State-instance/basis refs. Unavailable/unsealed/wrong-source results, nonfinite/negative coefficient, unsupported reflected policy or fake component/profile mapping are rejected rather than guessed.

---

## 16.6 Read-only incoming fixed-area Damage projection

An active State may declare bounded `state.damageProjectionQueries[]` under DMG-035. This is a query over an incoming batch, not a Damage Effect or a committed-result predicate:

```yaml
damageProjectionQueries:
  - inputBatchRef: OBSERVED_FIXED_POSITIONAL_DAMAGE_BATCH
    subjectRef: STATE_OWNER
    reservedPositionRef: <retained owner Position>
    incomingActionScope: <enemy Natural direct/declared outcome>
    checkpoint: POST_POSITIONAL_INTERPOSITION_PRE_DAMAGE
    ignoredAdmissionRuleRefs: <exact rule instances owned by this State>
    resultBinding: <DamageProjectionResultRef>
    creditStateCounterRef: <existing owner counter>
```

Only a locked area containing this reserved coordinate qualifies; random/direct targeting does not. Retain original Damage definitions, formula/source/threshold Snapshot bindings and this checkpoint's authoritative defensive/Shield/HP view. Bypass only the named scoped recipient-admission clauses; refs must resolve to DAMAGE-admission clauses of that same active State/subject/Combat Instance. They cannot disable lifecycle or arbitrary foreign rules. Other admission/Hit/mitigation laws still apply. Multiple packets share one hypothetical recipient budget under the original explicit allocation policy. No persistent hypothetical timeline exists between batches.

`DAMAGE_PROJECTION_REF` reads only this typed result's `projectedActualHpDamage`; it cannot satisfy ACTUAL_HP_DAMAGE_REF, P-043 committed Damage queries or ordinary Damage listeners. The existing State counter can receive this estimate once when that observed batch is terminal (including a local no-admitted-recipient outcome caused by the named exclusion), not if the batch aborts or the owning State has retired. Counter update is an ordinary State transaction; calculation itself makes no mutation/Event/Cost or gameplay RNG advance. Unsupported missing recipient/formula/snapshot/Hit/numeric/projection inputs fail closed. Reuse retained draw facts or an explicitly supported pure keyed probe; never invent expected Damage for a non-projectable random profile.

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

## 17.1 Optional damage-derived coefficient profile

```yaml
heal:
  damageDerived:
    basisResultRef: <sealed committed Actual-HP-Damage projection>
    baseCoefficient: <pure nonnegative scalar>
    settlementId: <authored local dependency ID>
```

This opt-in HEL-005 profile replaces this Heal's ordinary `formula`/`sourceResult` amount calculation, not its target/admission/Overheal policy. The basis declares exact Action/Effect membership and terminal checkpoint, including only explicitly selected children. Same root is insufficient. Instantiate once per observed Action + recipient + authored settlementId, through existing Trigger/completion-DAG/Result owners. Independent Heal instances are not merged by equal amounts or incidental shared roots.

At the declared settlement checkpoint, §18A may add qualifying coefficients at `DAMAGE_DERIVED_HEAL_COEFFICIENT`; sum the base and additions, then multiply this one immutable Damage basis once. Conditions/values normally read settlement-phase state; an explicitly bound Snapshot preserves an earlier source decision. With total coefficient0, no damage-derived Heal is emitted; with a positive coefficient and Damage basis0, normal zero-amount Heal semantics apply. No new mutable Lifesteal pool/Tag/Primitive is implied.

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

Shield recipient is the Effect target; existing `owner` is a separately declared runtime EntityRef. For source-presence retention/owner clocks, author owner = source (for example SELF), not the recipient by implication. FIELD_PRESENCE_SCOPED follows that declared owner's relevant presence cycle even when its contribution is attached to another recipient. BATTLE_SCOPED retention does not acquire source-leave deletion implicitly; preserve source provenance. PERMANENT only removes timed expiry and does not override a separately declared field-scoped retention/transition policy.

Shield effect can have:
- value formula;
- duration;
- stacking;
- priority;
- source;
- owner;
- lifecycle retention scope.

Conceptual extension:

```yaml
shield:
  operation:
  value:
  duration:
  stacking:
  sourceFamilyCap:
  priority:
  source:
  owner:
  lifecycle:
    retentionScope:
  resultBinding:
```

`resultBinding` may expose the bounded creation/addition receipt in §35.3C. It does not replace the mutable Shield StateRef/ledger.

`lifecycle.retentionScope` uses the same generic lifecycle-retention vocabulary defined for persistent State:

```text
FIELD_PRESENCE_SCOPED
BATTLE_SCOPED
```

This field is orthogonal to:
- source ledger identity;
- Shield duration;
- Shield break/depletion;
- ordinary Shield removal reason.

A transition-owned cleanup can therefore remove a:

```text
FIELD_PRESENCE_SCOPED
```

Shield contribution without pretending that contribution:
- broke from Damage;
- naturally expired.

No need to encode Shield as HP.

---

## 18.1 Source-family cap on new Shield addition

```yaml
shield:
  operation: CREATE | ADD_VALUE
  sourceFamilyCap:
    family:
      sourceOwnerRef: <runtime EntityRef>
      originAbilityId: <stable authored Ability definition ref>
      originEffectId: <stable authored Shield Effect definition ref>
    maximum: <pure scalar ValueRef>
    readTiming: SHIELD_COMMIT
    capPolicy: CLIP_NEW_ADDITION
```

This optional cap sums active remaining matching ledger contributions on this recipient from exactly the declared source family. The origin IDs reuse existing Effect provenance fields; they are not parallel provenance aliases. The runtime source owner separates different instances of the same Character; authored origin refs group successive casts without merging their contributions. A cast-specific Action/Effect instance ID is not the family key. Source/owner/origin provenance must agree with the grant; missing or ambiguous family matching is rejected.

At addition commit, atomically read the family sum and nonnegative finite cap ValueRef, then bound the new admitted amount to `max(0, maximum - familyRemaining)`. Do not clamp, refresh, merge or remove older contributions implicitly. New-contribution reapplication and independent duration remain authored `stacking`/duration semantics. No separate mutable cap pool or absorption priority is created. Multiple new grants competing for the same cap require an explicit existing sequential allocation order, or are rejected when allocation affects gameplay. `SHP-006` owns the transaction law.

---

# 18A. SCOPED EFFECT-AMOUNT MODIFIER SPEC

`ScopedEffectAmountModifierSpec` is a constrained declarative rule that modifies the numeric amount of qualifying Effects.

It exists for passive/system rules whose semantic is:

> Effects satisfying a structured source + recipient + Effect-semantic scope receive a typed numeric amount transform at a declared resolution phase.

It is not:
- arbitrary scripting;
- a new Functional Tag;
- a Primitive;
- a general callback;
- an unrestricted formula hook.

Conceptual form:

```yaml
effectAmountModifier:
  modifierId:
  tags: []

  sourceScope:
    attributionField:
    equalsRef:

  recipientScope:
    relation:
    relationAnchor:
    filters: []
    excludeRefs: []

  valueQueries: []

  effectScope:
    effectType:
    damageComponents: []
    directActionRef: <optional existing ActionRef anchor/relation>

  conditions: []

  amountOperation:
    type:
    value:

  resolutionPhase:
```

## Source scope

`sourceScope.attributionField` must reference an existing AttributionSpec field.

Compatible fields may include:

```text
caster
owner
source
behaviorSource
effectSource
damageAttribution
```

`equalsRef` resolves through an existing symbolic reference.

Example:

```yaml
sourceScope:
  attributionField: damageAttribution
  equalsRef: SELF
```

means:

> only Damage whose `damageAttribution` resolves to this modifier owner's SELF can qualify.

No source dimension may be inferred from prose when the distinction matters.

## Recipient scope

`recipientScope` reuses existing structured relation/filter vocabulary.

Example:

```yaml
recipientScope:
  relation: ALLY
  relationAnchor: SELF
  excludeRefs:
    - SELF
```

or:

```yaml
recipientScope:
  relation: ENEMY
  relationAnchor: SELF
  filters:
    - <structured Rank condition>
    - <structured Effective Element condition>
```

A relation requiring a reference entity must supply an explicit `relationAnchor`.

Recipient filtering does not perform target selection.

It only determines whether an already-resolving Effect recipient falls inside the modifier's scope.

## Read-only value queries

A modifier may require a bounded read-only collection query to calculate a scalar used by its amount formula.

Conceptual form:

```yaml
valueQueries:
  - queryId:
    targetKind:
    relation:
    relationAnchor:
    candidateSource:
    filters: []
    selection: ALL
```

The query reuses existing structured target/candidate/filter vocabulary.

It:
- performs no Effect;
- performs no target selection for the resolving Ability;
- mutates no State;
- consumes no RNG;
- creates no Action.

Its result may be referenced through an existing typed scalar such as:

```text
TARGET_COUNT_REF(queryId)
```

Example semantic use:

```text
query active enemy Prime + Effective-Light units
→ TARGET_COUNT_REF = N
→ modifier factor = CLAMP(1 - 0.10 × N, 0, 1)
```

A relation requiring an anchor must declare `relationAnchor`.

This facility exists to feed bounded pure formulas.

It is not arbitrary authored iteration.

## Effect semantic/component scope

Current minimum supported Effect scopes:

```text
HEAL
DAMAGE
```

For Damage:

```text
PHYSICAL
WILL
TRUE
```

may be selected explicitly.

Example:

```yaml
effectScope:
  effectType: DAMAGE
  damageComponents:
    - PHYSICAL
    - WILL
```

means True Damage lies outside this modifier's scope.

No negative pseudo-tag such as:

```text
NON_TRUE_DAMAGE
```

is required.

`effectScope.directActionRef`, when authored, resolves an existing Action and requires the resolving Effect to belong to that Action's own direct graph under TRG-013. For an Action-instance-owned rule use `{anchor: CURRENT_ACTION, relation: SELF}`. Shared rootActionId or Attribution alone does not qualify a child/standalone Effect. Referenced Cost/Snapshot/results resolve in that same declared Action's existing binding namespace; reject unavailable/foreign bindings. This scope is a read-only predicate at resolution, not an ACTION_RESULT_ANY read of an unfinished Action.

A DAMAGE scope may additionally select `damagePacketKinds` with values ORDINARY and/or REFLECTED_DAMAGE. This is semantic/query scope, not a Tag or component enum. Omission adds no packet-kind restriction; all existing explicitly authored component constraints retain their meaning. A reflected-only scope has no `damageComponents`: it selects the scalar packet at FINAL_DAMAGE_REDUCTION. PHYSICAL/WILL component-scoped reductions do not silently expand to reflection; an otherwise unqualified DAMAGE reduction may match it under its existing source/recipient/Condition law. A component filter cannot match a scalar reflected packet. Reject a reflected-only scope combined with ordinary components or an unsupported amount phase; no default TRUE reduction or reflected final multiplier is added.

## Structured conditions

`conditions` uses existing `ConditionSpec`.

No executable condition string is permitted.

## Modifier Tags

A modifier may carry existing Functional Tags when the modifier itself owns that canonical semantic.

Example:

```yaml
tags:
  - FINAL_DAMAGE_REDUCTION
```

for a modifier whose declared Damage resolution phase is `FINAL_DAMAGE_REDUCTION`.

This does not create a new Tag.

Tag compatibility remains subject to the canonical Tag Registry and Normalizer validation.

## Typed amount operation

Current amount-phase operation (the coefficient-only ADD profile below is separate):

```text
MULTIPLY
```

Conceptual:

```yaml
amountOperation:
  type: MULTIPLY
  value: <ValueRef or bounded Formula>
```

`value` uses the existing pure Formula system.

Examples:

```text
× 0.90
```

or:

```text
CLAMP(1 - 0.10 × TARGET_COUNT_REF(queryId), 0, 1)
```

The formula may calculate a scalar.

It may not:
- iterate entities itself;
- mutate State;
- emit Events;
- invoke Abilities;
- call engine code.

A new amount-operation type requires explicit Schema review.

## Resolution phase

Current minimum phases introduced here:

```text
PRE_OVERHEAL
FINAL_DAMAGE_REDUCTION
FINAL_DAMAGE_MULTIPLIER
DAMAGE_DERIVED_HEAL_COEFFICIENT
```

Phase compatibility is typed.

### `PRE_OVERHEAL`

Valid for HEAL amount modifiers.

Modifier applies to Heal amount before Overheal is derived.

It must not modify Overheal after the fact while leaving underlying Heal unchanged.

### `FINAL_DAMAGE_REDUCTION`

Valid for DAMAGE amount modifiers.

It identifies canonical Final Damage Reduction stage.

Exact Damage-pipeline ordering belongs to Damage Contract.

For a modifier scoped to:

```text
PHYSICAL
WILL
```

True Damage is unaffected because it lies outside `damageComponents`.

### `FINAL_DAMAGE_MULTIPLIER`

Valid only for DAMAGE. Existing MULTIPLY with a finite factor >= 1 applies to explicitly selected PHYSICAL/WILL/TRUE components at DMG-008's Final Damage checkpoint before Shield. A factor below 1 is rejected at this bounded amplification phase rather than disguising reduction against TRUE. It is distinct from FINAL_DAMAGE_REDUCTION; TRUE bypasses reduction but may receive an explicitly authored final multiplier. Do not lower this phase to a raw-formula coefficient or a reduction Tag. Payment-gated rules consume their declared Action-local committed Cost result and immutable factor/Snapshot, never current payer HP or later nominal reconstruction.

### `DAMAGE_DERIVED_HEAL_COEFFICIENT`

Valid only for HEAL with §17.1 `damageDerived`, no Damage component scope. The only operation here is bounded **ADD** of a finite nonnegative dimensionless coefficient, not ADD to HP or arbitrary Effect amount. Existing source/recipient/Condition/value-query scopes qualify each contribution. A rule needing a particular outcome projection must bind that exact basis/observed Action, not just root ancestry. HEL-005 sums matching contributions once before requested Heal and the existing PRE_OVERHEAL phase; MULTIPLY remains the operation at the three amount phases above. No custom phase or general operation-order system is introduced.

## Multiple rules

Each modifier is one bounded declarative rule.

Complex Character behavior should compose several modifier specs rather than embed procedural branching into one spec.

Ordering/conflict between multiple modifiers at the same resolution phase belongs to Contracts.

Schema does not invent global modifier priority here.

## Static Passive ownership

A static Passive may own one or more:

```text
effectAmountModifiers
```

without creating a fake Action.

The rule remains source-traceable to that authored Ability.

This preserves:

```text
Character = data/composition
Kernel = resolver/runtime
```

---

# 18B. SCOPED DAMAGE-COMPONENT TRANSFORM SPEC

`ScopedDamageComponentTransformSpec` is a constrained declarative rule that changes the semantic type of qualifying Damage components at an explicit Damage-pipeline phase.

It exists for mechanics whose meaning is:

> an already-resolving Damage component satisfies a bounded source/action/provenance/recipient scope, so its component type is transformed before later Damage stages.

It is intentionally separate from:

```text
ScopedEffectAmountModifierSpec
```

because:

```text
numeric amount transform
≠
Damage component semantic-type transform
```

It is not:
- arbitrary Damage scripting;
- an amount modifier;
- a new Functional Tag;
- a Primitive;
- post-mitigation relabeling;
- implicit Penetration;
- a general callback.

Conceptual form:

```yaml
damageComponentTransform:
  transformId:

  sourceActionScope:
    actionRef:
    naturalActionStatus:
    actorRelationToRecipient:
    actorFilters: []

  recipientScope:
    relation:
    relationAnchor:
    filters: []
    excludeRefs: []

  effectProvenanceScope:
    mode:

  componentScope:
    fromTypes: []

  conditions: []

  transformOperation:
    type:
    toType:

  resolutionPhase:
```

---

## Source Action scope

`sourceActionScope` resolves against the Action context that owns/contains the qualifying incoming Damage execution.

It reuses existing typed Action-reference and structured Condition/filter semantics.

`actionRef` uses the existing Action-lineage reference shape.

Example:

```yaml
sourceActionScope:
  actionRef:
    anchor: CURRENT_ACTION
    relation: ROOT
  naturalActionStatus: NATURAL
  actorRelationToRecipient: ENEMY
  actorFilters:
    - <structured Effective-Class = ASSASSIN condition>
```

`actorFilters` apply to the Actor of the declared scoped Action.

The Action Actor is not automatically interchangeable with:
- Damage Attribution;
- Caster;
- Owner;
- Effect Source.

When the distinction matters, the scoped Action Actor is authoritative for this field.

`naturalActionStatus = NATURAL` refers to canonical Natural-Action status, not Ability Type alone.

---

## Recipient scope

`recipientScope` reuses existing structured relation/filter vocabulary.

Example:

```yaml
recipientScope:
  relation: SELF
```

for a target-owned Passive that transforms incoming Damage only when the Passive owner is the recipient.

Recipient scope:
- does not retarget the Damage;
- does not create another TargetSet;
- does not imply immunity.

---

## Effect-provenance scope

`effectProvenanceScope` constrains which Effects belonging around the scoped Action are eligible.

Current minimum mode required by Pilot #4:

```text
DIRECT_EFFECT_GRAPH_OF_SCOPED_ACTION
```

Meaning:

> the resolving Damage Effect must belong to the scoped Action's own authored direct effect graph.

This mode includes an ordinary Passive/stat rule that modifies or strengthens the same direct hit without creating a separate Effect/Action.

It excludes Damage whose gameplay identity is a separate:
- child Action;
- Passive-triggered standalone Damage Effect;
- Reaction;
- Follow-up;
- Counter;
- delayed standalone Effect;
- DoT;
- Mark Damage;

even when that Damage shares the same `rootActionId`.

Canonical distinction remains:

```text
Action lineage
≠
Effect provenance
≠
Damage Attribution
```

This field consumes existing execution provenance.

It does not create another Action-lineage subsystem.

---

## Component scope

Current canonical Damage component types remain:

```text
PHYSICAL
WILL
TRUE
```

`componentScope.fromTypes` declares which pre-transform component types are eligible.

Example:

```yaml
componentScope:
  fromTypes:
    - PHYSICAL
    - WILL
```

An already-True component lies outside that example filter and remains True normally.

---

## Typed transform operation

Current minimum operation required by Pilot #4:

```text
SET_COMPONENT_TYPE
```

Conceptual form:

```yaml
transformOperation:
  type: SET_COMPONENT_TYPE
  toType: TRUE
```

The target type must be one canonical Damage component type.

The operation changes semantic Damage-component type.

It does not merely change presentation/label text.

It does not imply Shield Piercing.

A transformed component subsequently follows the Contract of its resulting component type.

---

## Resolution phase

Current Pilot #4 phase:

```text
PRE_MITIGATION
```

Meaning at Schema level:

> the component-type transform occurs before the ordinary mitigation branch selected by the original Physical/Will component type.

Exact Damage-pipeline ordering belongs to the Damage Contract.

The Schema must not compile:

```text
SET_COMPONENT_TYPE(TRUE) @ PRE_MITIGATION
```

as:
- 100% ARM/RES Penetration;
- Final Damage Reduction;
- post-mitigation relabeling.

---

## Multiple overlapping transforms

This Schema does not create transform priority.

If several component transforms can match the same component and their resulting semantics are incompatible:

> Normalizer must reject the overlap unless an explicit canonical Contract/composition policy exists.

Authoring order, Event order, Character ID, Effect list order and runtime iteration order do not choose a winner.

---

## Functional Tag boundary

A target-owned incoming transform does not retroactively rewrite the source Ability's authored Functional Tags or source capability index.

For example:

```text
source Ability authored Physical Damage
→ recipient-owned rule transforms that runtime component to True
```

does not mean the source Ability definition itself permanently acquires native `TRUE_DAMAGE` capability.

The authoritative runtime Damage component after transform nevertheless resolves under True-Damage semantics.

---

## Static Passive ownership

A static Passive may own:

```text
damageComponentTransforms
```

without creating a fake Action.

The rule remains source-traceable to the Passive that owns it.

No Character ID check is permitted.

---

# 18C. SCOPED DAMAGE MITIGATION-STAT OVERRIDE

`damageMitigationOverrides` optionally contains bounded `ScopedDamageMitigationSpec` rules, owned by an Ability/System rule including PASSIVE_STATIC. This selects the defensive stat used by a qualifying non-TRUE component; it does not transform Damage type or modify the target's stat.

```yaml
damageMitigationOverride:
  overrideId:
  sourceActionScope:   # same typed Action/Actor scope as §18B
  recipientScope:      # same typed relation/filters as §18B
  effectProvenanceScope: # same direct-graph/lineage distinction as §18B
  componentScope:
    fromTypes: []      # PHYSICAL and/or WILL, tested after type transformation
  conditions: []
  operation:
    type: SET_MITIGATION_STAT
    stat: ARM | RES
  penetration:        # optional existing DamageSpec penetration input, for that stat
  resolutionPhase: PRE_MITIGATION
```

Under DMG-009, match against the resulting semantic component type after §18B; TRUE never enters this override/penetration path. Read the selected authoritative resolved ARM/RES under existing stat law, apply compatible explicitly declared Penetration, then its existing mitigation formula. Keep semantic type, source Functional Tags, Effect provenance, Hit Admission, reduction eligibility, Final Multiplier and Shield law unchanged. RES-based PHYSICAL remains PHYSICAL for semantic queries.

Unmatched components use the ordinary PHYSICAL→ARM / WILL→RES mapping. Compatible matching overrides selecting the same stat may share one selection; conflicting stat selections require an explicit canonical conflict/composition law or rejection, never rule/list order. Optional Penetration retains DMG-006 law; multiple inputs whose composition is not defined remain REQUIRED_EXPLICIT, not an invented additive rule. No arbitrary stat key, custom mitigation formula, TRUE mitigation, Authority bypass or target-stat mutation.

Normalizer lowers these rules to `damageMitigationPlan` and existing Damage/Contract Resolver inputs, with stable owner/origin scope and static registration under TRG-014. Reuse the same authoritative phase view as Damage transformation; no callback, new subsystem, Tag or Primitive. Rule persistence/removal follows its explicitly authored owner/lifetime, not a guessed Character policy.

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
    retentionScope:
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

## 19.5 `lifecycle.retentionScope`

Persistent State may declare its generic lifecycle/transition retention scope.

Current minimum scopes required by Pilot #4:

```text
FIELD_PRESENCE_SCOPED
BATTLE_SCOPED
```

### `FIELD_PRESENCE_SCOPED`

The State exists only while its owner remains inside the relevant active field-presence cycle unless another explicit transition profile says otherwise.

Typical examples may include:
- field-only defensive window;
- field-only recovery window;
- field-only self modifier.

### `BATTLE_SCOPED`

The State is intended to remain available across ordinary field-presence/deployment transitions within the same battle unless an explicit transition profile discards its classification/scope.

Examples may include:
- battle use counters;
- battle-persistent form/state flags;
- battle-persistent Deployment-Cost lock state.

### Important distinction

`retentionScope` is not:
- a duration clock;
- Buff/Debuff/Mark classification;
- Authority Tier;
- a Functional Tag.

Therefore:

```text
classification = DEBUFF
```

and:

```text
retentionScope = BATTLE_SCOPED
```

are separate authored dimensions.

A transition may still explicitly discard all Debuffs regardless their retention scope.

### No Character-state-name cleanup

Transition retention should normally operate on:
- generic state classification;
- generic retention scope;
- explicit core-state policy;

not a list of Character-specific State IDs.

Pilot #4 does not introduce a normal-path field such as:

```text
removeStateIds:
  - ALC_ESTIS_PASSIVE_SHIELD
  - ALC_ESTIS_RECOVERY
  - ALC_ESTIS_SKILL3_WINDOW
```

because that would turn lifecycle transition data into Character scripting.

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

Optional bounded baseline profile:

```yaml
baseline:
  mode: EXCLUDE_THIS_SOURCE_FAMILY
```

Under RES-007, read the authoritative stat contribution view with this runtime source-owner + origin Ability + origin Stat Effect-definition family excluded, then apply this family's declared modifier exactly once. Successive instances/stacks of this family share that exclusion key; another runtime owner or Effect definition does not. Use existing provenance/contribution refs, not a new family registry.

This is a pure baseline-read policy, not permanent BaseStat mutation or a second current-stat snapshot. Its declared multiplicative stack may use independent constant factors; bounded ×1.05 stacks yield1.05^N without adding a POW operator/Primitive. Normalize a finite declared stack/count binding with existing Formula/State data, preserving ordinary numeric law and cap/lifetime. Do not read the already family-modified final stat recursively, add a flat percentage instead, or reapply the family when a Snapshot is taken.

Other modifier layers/contributions resolve under their existing explicit law; this profile neither orders incompatible sources nor defines a universal stat-stack order. Reject missing/ambiguous source-family provenance, dependency cycles or an incompatible baseline/stacking combination rather than choose source/list/Event order. Existing unauthored baselines remain unchanged.

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

## 22.2 Optional Revive-joined removal

A contribution may declare `maxHpMutation.reviveRemoval: BEFORE_HP_RESTORE` under REV-007. Store it on that existing source-traceable mutation record; absence adds no Revive reset. It selects this contribution for staged removal inside a legal post-DEATH_CONFIRMED Revive, before a Revive formula's **CurrentMaxHP** read. Duration/owner Field-leave removal remains separately explicit.

Revive validates/derives a projected contribution view, applies the record's explicit expiry reconciliation there, and atomically joins removal/restored MaxHP/Revive HP/materialization. Failed Revive leaves the records and MaxHP unchanged. No successful-Revive event may be used to undo penalties after the HP formula, and no free-standing pre-Revive cleanup Effect is generated. Explicit snapshot-MaxHP formulas/restoration profiles preserve their existing meanings; require an applicable composition law if another restoration conflicts.

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
  grantOrigin: # optional unless origin is observable
  grantActionRef: # existing typed ActionRef when Action provenance is observable
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

## 23.2 Typed gain provenance for scoped admission

For a positive Resource grant whose origin is observable, declare `grantOrigin: ACTION_GENERATED | EXPLICIT_EXTERNAL | SYSTEM_NON_ACTION`. These classify the **grant's semantic cause**, independently from issuer, immediate/root Action, Effect Attribution or whether a System service executes it. An Action-class regen/outcome grant is ACTION_GENERATED even if a Mode hook issues it; an explicitly authored external grant remains EXPLICIT_EXTERNAL even if triggered during another Action. A grant genuinely independent of Actions is SYSTEM_NON_ACTION. Classification comes from validated authoring/Mode data, never a caller-selected escape from a matching prohibition. If an Action-sensitive rule applies, grantActionRef identifies the exact performed Action outcome generating/receiving the authored attribution of this gain. A child may attribute to a Natural parent only under explicit outcome law; shared root is insufficient. Preserve it in the Resource receipt. Ungrounded/foreign Action bindings are rejected, not inferred from coincident timing.

Existing State-owned scoped Effect Admission under STA-014 can select `RESOURCE_MODIFICATION`, positive grant operation, `resourceKind`, exact recipient/pool and `grantOrigin`. CST-016 requires Resource Runtime/P-033 to consult that gateway before commit when such a matching rule exists. No global Resource immunity/default gate is added. Costs/drains/transfers/sets do not silently become positive grants; a transfer credit or SET increase needs an explicit compatible grant mapping if this distinction is observable. Missing/contradictory origin or unsupported operation is rejected where matching admission depends on it; legacy ungated Resource operations remain unchanged.

The bounded scope is carried by the existing State `immunity` declaration, for example:

```yaml
immunity:
  scope:
    effectType: RESOURCE_MODIFICATION
    resourceKind: RAGE
    operation: POSITIVE_GRANT
    grantOrigin: ACTION_GENERATED
    recipientRef: <own Actor>
    grantActionRef: <exact bound Natural Action>
  actionBinding: CAPTURE_AT_NATURAL_ACTION_START
  outcome: REJECT
```

This optional Resource-only actionBinding captures the matching restriction on the next **actually performed** Natural Action at start, before grant-bearing Effect/Mode work; probes/CC do not capture/consume it. Existing Action/Snapshot storage retains the normalized rule/scope and bound ActionRef until its explicitly tracked Action-linked Resource obligations are terminal. Closing the source window at ACTION_COMPLETED prevents binding another Action, but cannot erase this captured restriction from late grants of the same Action. Another Action's grant does not match merely by occurring during the window. A pending-window lifecycle removal does not undo already captured execution evidence. No new callback/protection registry or Functional Tag is needed.

---

# 23A. DEPLOYMENT COST MODIFICATION SPEC

Character Current Deployment Cost is deployment-system state, not a Resource Pool.

Therefore an Ability that changes it uses a dedicated declarative semantic object rather than `ResourceSpec`.

Conceptual form:

```yaml
deploymentCost:
  subject:
  operation:
  value:
```

Current minimum operations required by Pilot #4:

```text
ADD_CURRENT
LOCK_CURRENT
```

---

## `subject`

Typed Character/Entity reference whose Current Deployment Cost is affected.

Example:

```text
SELF
```

---

## `ADD_CURRENT`

Adds the authored pure numeric/Formula value to:

```text
CURRENT_DEPLOYMENT_COST
```

Example semantic intent:

```text
ADD_CURRENT -5
```

or:

```text
ADD_CURRENT -1
```

The Character's declared Current Deployment Cost floor is enforced by Deployment Contract/runtime.

This operation does not change:

```text
BASE_DEPLOYMENT_COST
```

and does not add/subtract:

```text
DEPLOYMENT_COST_BAR
```

---

## `LOCK_CURRENT`

Locks the exact currently-authoritative:

```text
CURRENT_DEPLOYMENT_COST
```

against later ordinary Deployment-Cost mutations for the remainder of the declared lock scope.

Pilot #4 lock scope is battle remainder.

Conceptually:

```text
lockedDeploymentCost
=
CURRENT_DEPLOYMENT_COST at successful lock commit
```

followed by:

```text
CURRENT_DEPLOYMENT_COST remains that exact value
```

for the battle remainder unless a future explicit higher system rule defines another interaction.

`LOCK_CURRENT` does not:
- change Base Deployment Cost;
- refund Deployment Cost Bar;
- change AE;
- change Rage.

Exact mutation-vs-lock admission and commit semantics belong to Deployment Contract.

---

## No arbitrary Deployment-Cost script

This object does not permit:
- arbitrary callbacks;
- arbitrary named variables;
- loops;
- custom mutation code;
- Cost Budget evaluation at runtime.

Additional operation kinds require explicit future Schema review.

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

## 26.1 Bounded fixed-area pre-Damage relocation

Optional `trigger.positionalDamageInterposition` is a typed phase profile, not a general hook. It observes only an explicitly fixed, non-random positional Damage area at its retained geometry boundary, before recipient Damage calculation. Declare incoming Action reference/Natural-status and direct-or-declared-outcome scope, owner-position/State Conditions, PositionMutationSpec reference, and these bounded operands:

```yaml
positionalDamageInterposition:
  incomingActionRef: <explicit Action/ROOT reference>
  outcomeScope: DIRECT_AND_DECLARED_CHILD_DAMAGE
  areaClass: FIXED_POSITIONAL_NON_RANDOM
  positionMutationRef: <RANDOM_REPOSITION definition>
  assignmentPolicy: SEEDED_ONE_TO_ONE_COMMON_DESTINATIONS
  successStateEffectRefs: <finite own-State/counter updates>
  successSnapshotRefs: <source fields and hostile Actor binding>
  deferredCounter:
    effectRefs: <finite snapshot-bound Damage nodes>
    release: OBSERVED_ROOT_DIRECT_EFFECTS_COMPLETE
    batchProfileRef: <explicit common counter-batch profile>
    mode: SIMULTANEOUS_BATCH
    sharedRecipientDamageAllocation: PROPORTIONAL
    sourceValidity: RETAIN_CREATED_SETTLEMENT
    invalidPolicy: DROP_INVALID
```

The referenced destination predicate may be `TRULY_EMPTY`: no occupant or valid deployment/lifecycle/Revive/absence/presence claim and Mode-legal occupancy under POS-009. Marks alone do not claim occupancy. Freeze candidates and common destinations before seeded assignment. Different destination-legality graphs require an explicit supported matching policy; do not silently run a greedy resolver.

POS-008 limits successStateEffectRefs to finite owner State/counter mutations and creation of the declared deferred counter obligation. No arbitrary Damage/Cost/Action/recursive interposition runs inside relocation. Position, success-only allowance, source Snapshot/hostile Actor bindings and obligation creation have one coherent commit. Source/rule/State instances are identity keys, never priority. No assignment or failed mutation means no success changes/counter; no automatic reroll.

The deferred counter is an independently sourced COUNTER settlement, not another Natural Action or the observed root's direct Damage. Its already-created data survives source invalidity only when this explicit sourceValidity profile says so. Retain it until its target-invalid/local-failure or Damage settlement is terminal; neither a live Passive lookup nor field-scoped cleanup can revoke its committed creation. At the named root checkpoint, POS-008 seals this profile's finite obligation set into one ordinary eligible counter batch. Existing Resolution/RES-008 machinery supplies shared-recipient allocation; unrelated Reactions remain outside that set and obtain no priority from it. Costs/other mutation-bearing counter preparation require another explicit law and are not supported by this pure frozen-Damage profile.

Normalizer rejects non-fixed/random scopes, absent geometry/Actor/result anchors, unbounded success graphs, incompatible duplicate interpositions, hidden matching/fallback, missing counter snapshot/invalid/batch/allocation law, or a dependency waiting for its own held release. No new Tag or Primitive.

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

# 30A. RETURN-TO-DECK SPEC

`RETURN_TO_DECK` is an explicit deployment/lifecycle transition.

It is not equivalent to:

```text
LEAVE_FIELD
```

alone.

It is also not:
- Death;
- `DEATH_CONFIRMED`;
- Revive;
- Reincarnation;
- Summon despawn;
- Arena return;
- ordinary Temporary Absence.

Conceptual form:

```yaml
returnToDeck:
  subject:

  sourceDeploymentState:
  destinationDeploymentState:

  combatInstance:
  presencePolicy:
  deckMembershipPolicy:

  retentionProfile:
    discardStateClassifications: []
    discardRetentionScopes: []
    retainRetentionScopes: []
    unmatchedStatePolicy:
    currentHpPolicy:
    removalCause:
```

---

## Subject

`subject` is the Character/runtime Entity undergoing the transition.

---

## Deployment-state transition

Current minimum semantic destination required by Pilot #4:

```text
sourceDeploymentState = BATTLEFIELD_ACTIVE
destinationDeploymentState = DECK_UNDEPLOYED
```

Exact runtime state naming belongs to Contract/runtime implementation.

The semantic requirement is:

```text
currently active/deployed on Battlefield
→ returned to a Deck-deployable undeployed state
```

without changing long-lived battle Deck membership.

---

## Presence policy

Current Pilot #4 requirement:

```text
LEAVE_CURRENT_COMBAT_INSTANCE
```

Meaning the transition includes the corresponding authoritative active-presence exit from the current Combat Instance.

Presence transition remains cause-distinct:

```text
LEAVE_FIELD
```

describes the presence result.

```text
RETURN_TO_DECK
```

describes the deployment/lifecycle cause and destination.

Do not collapse them.

---

## Deck membership policy

Current Pilot #4 value:

```text
RETAIN_BATTLE_DECK_MEMBERSHIP
```

Returning to Deck changes current deployment state.

It does not remove the Character definition/True Self from the battle Deck roster.

A later legal deployment can therefore use ordinary:

```text
DEPLOY_FROM_DECK
```

again.

---

## Transition-owned retention profile

`retentionProfile` belongs to the Return-to-Deck transition.

It is not authored as a Cleanse Ability.

It defines what attached/transient state survives the transition.

### `discardStateClassifications`

Uses existing State classifications.

Pilot #4 may author:

```text
BUFF
DEBUFF
MARK
```

to discard every attached State of those classifications on the subject.

This is lifecycle retention behavior.

It does not mean:
- cast `DEBUFF_CLEANSE`;
- compare Cleanse Authority against every removed State;
- grant Axiom Authority to the returning Character.

### `discardRetentionScopes`

Generic state/Shield retention scopes that do not survive the transition.

Pilot #4 may author:

```text
FIELD_PRESENCE_SCOPED
```

so field-transient:
- Shield contributions;
- Recovery windows;
- defensive windows;
- similar generic field-scoped state

can be removed without knowing Ability/Character-specific State IDs.

### `retainRetentionScopes`

Generic scopes explicitly preserved.

Pilot #4 requires battle-persistent Character state such as use counters and Deployment-Cost lock data to survive Return-to-Deck.

It may therefore declare:

```text
BATTLE_SCOPED
```

as retained.

### `unmatchedStatePolicy`

Current bounded policy values:

```text
RETAIN
REQUIRED_EXPLICIT
```

This prevents a transition implementation from silently deleting every unspecified SYSTEM_STATE.

For Alcestis, the least-destructive profile is:

```text
RETAIN
```

after the explicit Buff/Debuff/Mark and Field-Presence-scoped discards are applied.

### `currentHpPolicy`

Current bounded value required by Pilot #4:

```text
RETAIN
```

The Return-to-Deck transition therefore does not reset self Current HP merely because deployment state changes.

This field does not define Revive/respawn HP rules.

### `removalCause`

Transition-owned cleanup supplies an explicit lifecycle removal cause.

Current semantic value:

```text
TRANSITION_CLEANUP
```

The active transition identity remains separately traceable as:

```text
RETURN_TO_DECK
```

Therefore cleanup must not be silently reclassified as:
- Shield depletion/break;
- natural Shield expiry;
- natural duration expiry;
- Cleanse.

Exact Event/result semantics belong to Contract.

---

## No Character-specific cleanup list

Normal-path `ReturnToDeckSpec` deliberately does not provide:

```text
stateIdsToRemove
abilityStateNamesToRemove
```

for Character-specific cleanup.

State/Shield objects must be authored with correct generic classification/retention scope so the transition can operate generically.

A future mechanic that genuinely requires identity-specific lifecycle retention must prove that need separately.

---

## No HP reset / Death semantic

`RETURN_TO_DECK` does not imply:
- HP restoration;
- HP reset;
- Death;
- Revive;
- lifeSerial mutation.

Those require separate explicit mechanics.

---

## Primitive boundary

`RETURN_TO_DECK` is a semantic transition Effect family.

This Schema does not require a new atomic Primitive.

Normalizer/Contract/Kernel may compose the transition from existing authoritative:
- deployment-state mutation;
- Field Presence;
- State removal;
- Shield removal;
- transaction/commit machinery.

Exact execution is Stage F/G work.

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
  sharedRecipientDamageAllocation:
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

## 34.2A Shared-recipient simultaneous Damage allocation

A named SIMULTANEOUS_BATCH group with several Damage packets sharing one recipient may explicitly set `sharedRecipientDamageAllocation: PROPORTIONAL` under RES-008. Each packet retains its own component resolution/provenance and immutable Damage Result, but shares the recipient's single Shield/HP budgets at the common commit. Allocation is between incoming eligible demands; SHP-002's proportional depletion between Shield source contributions remains a separate axis.

No global multi-target/AoE default is introduced. Reject shared-recipient batches with observable per-packet results if no applicable explicit allocation law exists. Ordinary different-recipient simultaneous groups need no such field. Reject this field on non-simultaneous groups, unavailable membership/results or undeclared observable numeric allocation.

## 34.2B Explicit child-Damage participation in one batch

```yaml
resolution:
  groups:
    - id: <local batch ID>
      mode: SIMULTANEOUS_BATCH
      childActionBoundary: PREPARE_CHILD_DAMAGE_THEN_COMMIT
      childDamageParticipants:
        - requestPath: <finite declared child-request path, possibly nested>
          damageEffectRefs: <exact direct Damage definitions on that path>
      snapshotPolicy: <explicit shared Snapshot bindings>
```

RES-009 extends the existing group/Action/Transaction plan: a parent owns one batch, prepares these **real** child Actions to their named Damage proposal boundary, then commits all proposals together. Paths are bounded expansions of authored RequestAction/repeat/locked-target refs, not arbitrary descendant queries or all same-root Actions. Each child's own Resolution group delegates these selected Damage nodes to that batch; it must not independently commit them. Own Damage receipts/events/Action identities remain on each child; explicit parent outcome projection references them without relabeling root-direct membership.

The preparation subset is restricted to read-only admission, zero or explicitly waived authored Costs, immutable supplied target/source bindings and pure Damage preparation. Ordinary child-triggered Reactions wait for common commit/lifecycle; mutation-bearing interposition/Cost/preparation requires another applicable explicit transaction law or is rejected, never silently skipped. No arbitrary child graph can be paused at a callback. Locked invalid recipients follow their declared local skip policy; other admission/preparation failures need an applicable explicit failure profile. Missing/empty local branches become terminal, not a wait for nonexistent children. Later result-dependent work uses ordinary DAG edges after commit.

Neither parent nor child waits for child ACTION_COMPLETED to release this pre-commit barrier. Only prepared/skipped participant Damage nodes release it; child completion follows common commit/results/lifecycle. Reject multiple commit owners, membership/snapshot ambiguity, cycles, participant completion prerequisites and hidden sequential commits. Other child/group policies remain unchanged.

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

An Effect or Cost transaction can expose a typed result handle.

Examples:

```text
DAMAGE_RESULT_A
HEAL_RESULT_B
TARGET_SET_X
SNAPSHOT_Y
SPAWNED_ENTITY_Z
STORY_PROPERTY_P
COST_PAYMENT_Q
COST_GROUP_PAYMENT_R
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

Ordinary and reflected Damage bindings used by source-group consumers retain immutable immediate damageSourceRef and packetKind (ORDINARY by default); DMG-034 additionally retains exact causal basis refs with ordinary ActualHP/Shield/Overkill metrics. A grouped basis/receipt remains immutable through dependent terminal readers; later source death/removal does not rewrite its committed evidence. Source validity is checked for the new reflected recipient, not retroactively for historical incoming results.

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

## 35.3A Cost payment result references

A committed singular Cost payment may expose:

```text
COST_PAYMENT_RESULT
```

At minimum:

```text
requestedAmount
actualPaidAmount
payer
success
```

A successful singular HP payment may additionally expose immutable `currentHpAfterPayment`, read through `COST_PAYMENT_REF.field = CURRENT_HP_AFTER_PAYMENT`. Capture the resulting payer HP in the actual payment commit before HP_ZERO/lifecycle side-effects; P-036 already returns this resulting HP. It is an HP-only commit result, not `actualPaidAmount`, a live HP read or the Action's ATK/WIL Snapshot. Reject reads from failed/non-HP/unavailable payments; zero paid with success may still provide this HP field. Retain it for dependent Action work/replay under CST-009.

Conceptual ValueRef:

```yaml
costPaymentRef:
  binding: ULTIMATE_HP_PAYMENT_RESULT
  field: ACTUAL_PAID_AMOUNT
```

`requestedAmount` is the evaluated requested payment amount.

`actualPaidAmount` is the authoritative amount actually committed.

They are not interchangeable.

Important:

```text
actualPaidAmount = 0
```

does **not** by itself imply:

```text
success = false
```

A Cost Contract may explicitly allow a successful zero payment.

Example:

```text
Ultimate HP Cost with a floor
→ payer already at the permitted floor
→ requested/derived payable amount = 0
→ payment may succeed
→ success = true
→ actualPaidAmount = 0
```

A failed optional payment instead produces:

```text
success = false
actualPaidAmount = 0
```

unless an explicit Cost Contract defines another result.

Downstream consumers whose formula requires the amount actually paid must use `actualPaidAmount`; a post-payment-HP formula instead uses the typed HP result field above.

They must not reconstruct it from the nominal Cost expression.

A direct `COST_PAYMENT_REF` must resolve to one singular payment result.

---

## 35.3B Cost group payment result references

A declared CostGroup may expose:

```text
COST_GROUP_PAYMENT_RESULT
```

The group result owns the typed member payment results generated by that declared transaction, including per-payer outcomes produced by distributed CostSpecs.

It must support an aggregate equivalent to:

```text
TOTAL_ACTUAL_PAID
```

For heterogeneous resource groups, aggregate consumers must specify the relevant Cost kind.

Conceptual ValueRef:

```yaml
costGroupPaymentRef:
  binding: SKILL2_COST_GROUP_PAYMENT_RESULT
  field: TOTAL_ACTUAL_PAID
  kind: HP
```

Meaning:

> sum `actualPaidAmount` of all relevant HP payment results belonging to this declared CostGroup.

Failed optional payers therefore contribute zero.

Successful zero payments also contribute zero without being reclassified as failed.

This is typed result composition.

It is not a mutable variable and does not authorize arbitrary authored iteration.

---

## 35.3C Shield addition result references

A Shield `CREATE` or `ADD_VALUE` Effect may bind an immutable `ShieldAdditionResultRef` through `shield.resultBinding`. It preserves requested amount separately from `committedAddedAmount`, recipient, operation, contribution reference(s), Action/Effect provenance, state version and commit/failure outcome under `SHP-005`. Action provenance is present only for Action-owned execution; standalone static/System Effects do not acquire a fabricated Action.

For `CREATE`, the metric is the value actually inserted as the declared new contribution after its authored admission/stacking/cap policy. For `ADD_VALUE`, it is the positive amount actually credited by that operation after the same policy. It is not the target's net total Shield delta across replacement/removal/other Effects, nor its remaining Shield at a later checkpoint.

A pure duration refresh supplies no positive addition. A denied or fully cap-discarded request cannot supply a positive committed value. Zero amount does not itself imply Effect/Action failure.

`SET_VALUE`, `TRANSFER` and other replacement/removal semantics have no implicit mapping to this bounded creation/addition metric. Where gameplay requires such a mapping, require an explicit operation-result Contract or reject the unsupported binding; do not choose how a Character's reapplication stacks or which Shield operations qualify for its Passive.

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
  intentInterpositionPlan:
  costPlan:
  targetPlan:
  snapshotPlan:
  effectGraph:
  effectModifierPlan:
  damageTransformPlan:
  damageMitigationPlan:
  authorityPlan:
  attributionPlan:
  capabilityIndex:
  primitiveRequests:
  contractRefs:
  validationHash:
```

`intentInterpositionPlan` is generated from bounded authored `actionIntentInterpositions`.

It preserves the owning Ability and normalized Action-Intent scope.

It is not part of another Ability's `actionSpec` merely because that other Ability's Intent is being observed.

`effectModifierPlan` is generated from constrained `effectAmountModifiers`.

`damageTransformPlan` is generated from constrained `damageComponentTransforms`.

`damageMitigationPlan` is generated from bounded `damageMitigationOverrides` (§18C/DMG-009); it selects mitigation inputs without transforming component type. Resolution groups preserve RES-008 allocation policy and packet/result membership. Snapshot plans preserve SNP-006 pre-Cost timing. All route through existing owners.

The two plans are distinct:

```text
effectModifierPlan
= typed numeric amount/coefficient modification

damageTransformPlan
= Damage component semantic-type transformation
```

`costPlan` may carry explicit CostGroup, distributed payer-collection, and typed Cost-result binding plans.

It also preserves bounded singular HP cases, protected counter consumption and the typed commit-HP result binding under CST-014/009. The existing `actionSpec` carries active costLifecyclePolicy under CST-015; an opted-in local CostGroup carries its same enclosing admittedActionRef/continuation and explicit branch-failure/success-use/lifecycle dependencies in `costPlan`/`effectGraph`. Do not lower either as a new Trigger/Action, Intent interposition anchor or generic callback. P-036 remains the HP-payment operation.

An opted-in deathPrevention completion profile lowers to one joined lifecycle/Return transaction under DTH-007, using P-061 and existing deployment/State/Transaction owners. Its referenced Return operand is not also executed as a standalone Effect node.

An explicitly authored lifecycle DIRECT_EXECUTE profile lowers under DTH-008 to the existing P-060 explicit-lethal-condition context and P-062 confirmation transaction. It does not synthesize Damage, HP Loss or an ordinary HP_ZERO prevention candidate.

Target tie policy is normalized into `targetPlan`.

`DEPLOYMENT_COST_MODIFICATION` and `RETURN_TO_DECK` remain typed Effect semantics in the normalized Effect/deployment execution plan; they do not imply new Primitive IDs.

None of these plans implies a new Primitive by itself.

---

The existing plans also preserve RES-009 parent-owned finite child-Damage participation, HEL-005 exact Damage basis/local coefficient settlement and typed ADD phase, CST-016 positive-grant origin/scoped State admission, and REV-007 marked MaxHP removal joined to Revive. Lower them through the existing Action/Effect/modifier/State/Transaction/result plans; postActionSettlement preserves its explicit completed-source policy under ACT-033; no new Primitive or top-level runtime subsystem. Preserve explicit family/Action/Effect/participant/contribution refs, failure policy, acyclic dependency and terminal commit identity.

The existing effectGraph/primitiveRequests also preserve the opt-in reflected scalar profile, exact sealed source-group basis, packet-kind reduction applicability and distinct Effect/result identity under DMG-034. Existing target/resolution plans preserve its authored lock/invalid/batch policy. No reflected Action or new runtime plan/Primitive is synthesized.

Existing targetPlan/triggerGraph/effectGraph/snapshot/result plans also retain TGT-008 explicit coordinate/occupant timing, POS-008/009 bounded phase/assignment/success/deferred-counter refs, DMG-035 isolated projection result/query bindings, TRG-016 mandatory health observations and ACT-034 finite grant-start dependencies. Keep their typed query/State/Action/commit/phase identities; do not synthesize a Character runtime, new top-level subsystem or general hook. Prior explicit locks/profiles remain unchanged.

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
19. Validate `ScopedEffectAmountModifierSpec` source, recipient, Effect/component, Tag and resolution-phase compatibility.
20. Validate modifier `valueQueries`, relation anchors, query scope and every `TARGET_COUNT_REF`/query-result reference.
21. Validate CostGroup references, distributed payer-collection shape, relation anchor, snapshot anchor and optional-payer failure policy.
22. Validate singular `COST_PAYMENT_RESULT` vs aggregate `COST_GROUP_PAYMENT_RESULT` binding shape and consumer compatibility.
23. Validate Action Intent interposition ownership, intent scope, canonical anchor, settlement reference, branch selection, revalidation policy and explicit fallback candidates.
24. Reject arbitrary modifier operations, arbitrary interposition timing strings, hidden Character-specific runtime callbacks and unresolved ambiguous query anchors.


25. Validate `ScopedDamageComponentTransformSpec` source Action scope, recipient scope, direct-Effect provenance scope, component filter, typed transform operation and Damage-pipeline phase compatibility.
26. Reject overlapping incompatible Damage-component transforms when no explicit canonical composition Contract exists.
27. Preserve the distinction `BASE_DEPLOYMENT_COST ≠ CURRENT_DEPLOYMENT_COST ≠ DEPLOYMENT_COST_BAR` and normalize Deployment-Cost mutation/lock Effects to deployment-system semantics rather than ResourceSpec.
28. Validate Return-to-Deck source/destination deployment state, presence policy, Deck-membership policy and transition-owned retention profile.
29. Validate State/Shield lifecycle-retention scopes referenced by a transition profile without converting transition cleanup into Cleanse/Authority behavior.
30. Validate metric-selector `tiePolicy` compatibility and route `RANDOM_AMONG_TIED` only through deterministic RNG over the exact tied-best set.
31. Reject any normalization in which a metric tie is silently resolved by entity/list/Slot/Event order.
32. Preserve target lock and invalid-target behavior independently from initial metric tie resolution; `tiePolicy` must not silently create later reroll/requery.
33. Validate `ACTION_RESULT_ANY` Action/checkpoint anchor, direct-graph scope, recipient anchor/read policy, kind/metric compatibility and immutable committed result binding.
34. Preserve Shield requested versus committed creation/addition amounts and reject unsupported operation-result mappings without inventing stacking/cap semantics.
35. Validate source-family cap owner/origin provenance, commit-time read set and explicit competing-grant order.
36. Validate metric top-N cutoff and explicit Slot coverage without introducing entity/list priority or later reroll.
37. Validate required ACTION_RESULT_ANY readContext and SnapshotRef coverage of recipient/anchor/filter facts; reject missing data rather than use live fallback.
38. Validate postActionSettlement completed-Natural-Action/Mode/owner anchors, bounded same-opportunity DAG and terminal-before-handoff requirement; reject completion cycles and waits on held boundaries.
39. Preserve declared Shield owner independently from recipient when lowering retention/owner clocks; reject an unresolved required owner reference.
40. Validate FINAL_DAMAGE_MULTIPLIER Damage/component/operation compatibility, directActionRef own-graph membership and same-Action Cost/Snapshot/result binding visibility; reject implicit root/Attribution scope or raw/FDR phase substitution.
41. Validate bounded HP case/floor/required-counter compatibility and typed resulting-HP reads; preserve explicit Cost-caused lifecycle continuation in the same admitted Action under CST-014/009/015, including opted-in local CostGroups without a new Action.
42. Validate deathPrevention survival/subject/completion/counter references and their common transaction under DTH-007; reject duplicate standalone execution, unavailable/cleanup-discarded counter, foreign transition or completion cycle.
43. Validate DIRECT_EXECUTE subject/current-instance/confirmation/result references and explicit Condition/Cost/dependency bindings; reject an implicit profile, ordinary HP_ZERO/prevention routing, damage-receipt fabrication or Authority bypass.
44. Validate EXCLUDE_THIS_SOURCE_FAMILY StatModifier provenance/contribution/count/lifetime and pure baseline view under RES-007; reject recursive final-stat reads, ambiguous family keys, unsupported stack composition or snapshot-time reapplication.
45. Validate RES-008 simultaneous group/recipient/packet/component/result membership, eligible Shield and HP budget conservation and explicit numeric allocation; reject hidden packet/list ordering or ambiguous shared-recipient allocation.
46. Validate DMG-009 scopes, resulting non-TRUE component type, ARM/RES selection, Penetration compatibility, owner/lifetime and conflict law; reject target-stat mutation, type relabeling, duplicate mitigation or inferred override priority.
47. Validate SNP-006 successfully admitted Action/source/fields/pre-Cost capture and result lifetime; reject probe/fallback capture, early gameplay mutation or snapshot consumers after failed Cost.

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

- compile target-owned incoming Damage-component conversion as 100% Penetration, Final Damage Reduction or post-mitigation relabeling;
- merge `ScopedDamageComponentTransformSpec` into `ScopedEffectAmountModifierSpec`;
- treat `CURRENT_DEPLOYMENT_COST` as the Side Deployment Cost Bar;
- pay `DEPLOY_FROM_DECK` from Base Deployment Cost after Current Deployment Cost has been initialized/mutated for battle;
- model Return-to-Deck as generic `LEAVE_FIELD` only;
- model Return-to-Deck retention cleanup as `DEBUFF_CLEANSE`;
- hardcode Character-specific State IDs into the normal Return-to-Deck retention path;
- treat lifecycle transition cleanup as Shield break/natural expiry merely because a Shield/State disappears;
- invent a metric-selector tie winner from list/Entity/Slot/Event order;
- reroll/requery Alcestis secondary target merely because its previously locked target later becomes invalid.

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
  costPaymentResults:
  costGroupPaymentResults:
  damageResults:
  healResults:
  shieldResults:
  stateChanges:
  resourceChanges:
  spawnedEntities:
  deaths:
  lifecycleTransitions:
  childActions:
```

This is runtime result, not authored Character data.

Later child/effect references may access allowed portions via typed bindings. `shieldResults` contains the supported typed Shield creation/addition receipts; other Shield manipulations must not masquerade as positive additions. Checkpoint-scoped predicates read a sealed projection or finalized form of this existing result object with explicit provenance scope; Action lineage does not merge child receipts into root-direct membership.

`costPaymentResults` records committed Cost-payment outcomes.

`costGroupPaymentResults` records declared typed aggregation/group outcomes.

Neither field replaces the Cost transaction itself.

---

# 70. BATCH / ACTION AGGREGATION

Damage aggregation must support:

```text
BY_ACTION
BY_TARGET
BY_DAMAGE_ATTRIBUTION
BY_DAMAGE_SOURCE
BY_COMPONENT
BY_EFFECT
BY_CHILD_ACTION
```

Required for:
- Ký Ức Skill 2;
- Ultimate self-heal;
- threshold logic;
- damage statistics.

`BY_DAMAGE_SOURCE` groups the immutable immediate Damage Source on the committed packet/result, not credited Damage Attribution, Effect Source, Actor or root. P-043 already accepts declared grouping/filter criteria; this makes the existing canonical Source axis explicit for DMG-034. Combine only the declared result collection/outcome/recipient filters. Equal credited sources cannot collapse distinct immediate sources, and repeated Effects from one immediate source do not create extra source groups. Source grouping grants no target ordering or storage subsystem.

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
PAYER
PARENT_CASTER
PARENT_DAMAGE_ATTRIBUTION
TRIGGER_SOURCE
TRIGGER_TARGET
SELECTED_TARGET
SPAWN_RESULT
INHERITED_DEFINITION
```

Normalizer resolves them to typed references.

`PAYER` is valid only inside a Cost/payment context.

For an ordinary singular CostSpec:

> `PAYER` resolves to the CostSpec payer.

For a distributed payer collection:

> `PAYER` resolves to the current snapshotted collection member whose Cost instance is being evaluated.

`PAYER` must not escape its Cost/payment scope and become a general mutable local variable.

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

## 77.1 Optional transition-completed Death Prevention

An HP_ZERO prevention Effect may declare this bounded profile:

```yaml
deathPrevention:
  survivalHp: <pure finite positive ValueRef>
  completionTransitionRef: <local authored ReturnToDeckSpec reference>
  consumeCounterRef: <optional existing owner-keyed remaining-use COUNTER_REF>
  resultBinding: <optional existing typed P-061 terminal-result binding>
```

Current supported completion is RETURN_TO_DECK of the **same death-evaluating subject** and current Combat Instance. Resolve the reference within this authored prevention settlement; lower its Return operand once into the prevention completion transaction, rather than executing an independent Return node and checking success afterward. No arbitrary completion predicate, callback, foreign Action or cross-settlement transition.

Capture survivalHp from the declared prevention checkpoint under ordinary numeric law; it must be legal positive HP <= subject Current MaxHP at commit. Stage alive/survival HP, the explicit Return profile's presence/deployment/Deck/retention deltas, and one available selected allowance unit at the same protected commit barrier. Return's currentHpPolicy RETAIN applies to this proposed survival value; Return itself still supplies no restoration or survival default.

Under DTH-007, successful completion commits all those deltas and prevention success together. A failed transition/protected validation/counter requirement commits none of those completion deltas, adds no survival/use delta and resumes the same death evaluation. With the unchanged HP_ZERO subject this means HP0 and unused allowance; a protected-state conflict never restores stale HP/counter/presence over another authoritative commit. Earlier committed Effects such as a separate Leader Heal are not part of this join; later result-gated Effects remain separate. Do not emit DEATH_PREVENTED before completion or rerun the same failed candidate indefinitely.

The selected counter must have a declared owner/lifetime and remain represented in the post-transition state; do not silently discard/reset it through retention cleanup. No new allowance manager or global prevention priority is introduced. Other prevention profiles and standalone Return authoring are unchanged.

This is mandatory P-061 death-evaluation work, not a delayed ordinary Reaction. When this counter owns consume-on-completion semantics, do not also consume that same allowance via Trigger admission/activation; reject contradictory eager consumption. Existing Trigger Conditions can check availability without changing it.

Reuse P-061's prevented/not-prevented terminal outcome in existing typed result/DAG bindings. A success-dependent later Effect binds to **this completion instance's** terminal success, not merely to live Deck/HP state that another transition could produce. Keep that outcome available through dependent work/replay; do not reconstruct success from post-state or replay successful downstream Effects twice.

## 77.2 Explicit direct Execute confirmation

```yaml
effectType: SYSTEM_LIFECYCLE
targetRef: <locked legal recipient in the current Combat Instance>
lifecycle:
  operation: CONFIRM_DEATH
  confirmationPolicy: DIRECT_EXECUTE
  resultBinding: <optional existing P-062 terminal result binding>
```

This bounded profile selects DTH-008. Its subject is the existing EffectSpec.targetRef; no second conflicting target selector is introduced. Threshold, qualifying Damage/result scope, target revalidation, Cost and use consumption are separately authored with existing Target/Condition/Trigger/Cost/State/Resolution data; the profile invents none of them. It is not a universal meaning for all content named Execute.

On an admitted successful request, one existing lifecycle transaction commits subject HP0 and DEATH_CONFIRMED together, without the ordinary pre-confirmation HP_ZERO/Death-Prevention window. P-060 opens its existing explicit-lethal-condition context with this policy; P-062 supplies confirmation, attribution and observers. No synthetic Damage/HP-Loss/HP-Cost receipt or implicit Shield/Penetration operation is produced.

Ordinary explicit Effect-admission and actual Authority-bearing anti-death conflicts remain authoritative. DIRECT_EXECUTE is not an Authority exception, immunity bypass, automatic rank-based winner or extra kill credit. Lifecycle-invalid/already-confirmed recipients do not receive a duplicate death. Post-confirmation Revive/death-triggered Return and other existing mandatory lifecycle work remain legal; committed upstream payment/use is not reversed merely because recovery occurs.

Normalizer requires an explicit supported profile and available locked subject/current instance, validates provenance/result and existing local DAG scope, and rejects foreign/ambiguous references, hidden retarget, callback confirmation, fabricated Damage or a contradictory request to dispatch ordinary prevention before this confirmation. Ordinary lethal Damage/Cost/loss and other prevention profiles keep their current law.

The request uses existing stable Effect-execution/candidate identity plus subject/current-instance binding. Check its terminal replay identity before allocating a fresh death-evaluation context; a later Revive with unchanged lifeSerial cannot make redelivery of the old request a new Execute. Retain terminal identity for the supported replay horizon under `06_KERNEL_RUNTIME` §168; payloads may be freed independently.

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
26. A CostSpec must not author both singular `payer` and `payerCollection` for the same payment definition.
27. A distributed payer collection must use supported structured query semantics, explicit relation anchor when required, and a declared snapshot timing.
28. A CostSpec referenced as an optional distributed Cost must declare an explicit optional-payer failure policy.
29. CostGroup references must resolve to existing CostSpecs in the same legal Ability scope.
30. A singular `COST_PAYMENT_REF` must resolve to exactly one payment result; distributed payer results must not collapse into one ambiguous singular binding.
31. `COST_PAYMENT_REF` and `COST_GROUP_PAYMENT_REF` consumers must reference compatible typed payment results.
32. A consumer requiring committed payment outcome must not silently substitute the nominal Cost formula.
33. `actualPaidAmount = 0` must not be used by Schema validation as an implicit synonym for payment failure.
34. `ScopedEffectAmountModifierSpec` must use an allowed source field, structured recipient scope, supported Effect/component scope, typed amount operation and compatible resolution phase.
35. Every modifier value-query relation requiring an anchor must declare that anchor, and every query-derived ValueRef must resolve to a declared compatible query binding.
36. Modifier Functional Tags must be compatible with the modifier's declared Effect scope and resolution phase.
37. `PRE_OVERHEAL` is invalid for non-Heal Effect scope.
38. `FINAL_DAMAGE_REDUCTION` is invalid for non-Damage Effect scope.
39. Action Intent interposition must be owned by an authored Ability and must declare an explicit compatible `intentScope`.
40. Action Intent interposition must use one of the canonical bounded interposition anchors.
41. A `PRE_ADMISSION_PRE_COST` branch requiring post-settlement admission testing must explicitly declare `REVALIDATE_ORIGINAL_INTENT`.
42. Revalidation failure must not silently fall back to Basic Attack or another form; fallback candidates must be authored explicitly.
43. A referenced interposition settlement must not consume an additional Natural Action unless a separate explicit mechanic says so.
44. Action Intent interposition must not be normalized as `FORCED_ACTION` merely because Character law constrains admission timing.
45. A Passive-owned interposition rule must not be duplicated into every observed Ability merely to obtain runtime scope.


46. `ScopedDamageComponentTransformSpec` must be owned by an authored Ability/System rule and use structured source Action, recipient, provenance and component scope.
47. Pilot #4 `SET_COMPONENT_TYPE` transforms must declare a canonical target Damage component type and a compatible explicit Damage resolution phase.
48. `PRE_MITIGATION` Damage-component transformation must not normalize as Penetration, Final Damage Reduction or post-mitigation type relabeling.
49. A transform requiring direct root/Natural-Action Damage must use Effect-provenance scope; matching `rootActionId` alone is insufficient when child/standalone Effects are excluded.
50. Overlapping incompatible Damage-component transforms must be rejected unless a separate canonical Contract explicitly resolves their composition.
51. Authored source Ability Functional Tags must not be silently rewritten merely because a recipient-owned runtime transform changes an incoming component type.
52. Character deployment authoring must distinguish `baseDeploymentCost` from battle-scoped `CURRENT_DEPLOYMENT_COST`.
53. `CURRENT_DEPLOYMENT_COST` must not be represented as `DEPLOYMENT_COST_BAR` or ordinary Ability `CostSpec`.
54. `DEPLOYMENT_COST_MODIFICATION` must target Current Deployment Cost and must not mutate Base Deployment Cost unless a future explicit operation says otherwise.
55. `LOCK_CURRENT` freezes the exact Current Deployment Cost under Deployment Contract; it is not a floor-only modifier.
56. `RETURN_TO_DECK` must declare enough transition data to distinguish destination deployment state from generic Field Presence exit.
57. `RETURN_TO_DECK` must not normalize as Death, Revive, Temporary Absence, Arena return, Summon despawn or generic `LEAVE_FIELD` alone.
58. Transition-owned retention cleanup must not normalize as ordinary Cleanse/DEBUFF_CLEANSE merely because Buff/Debuff/Mark State is discarded.
59. Normal-path Return-to-Deck retention data must operate on generic State classification/retention scope rather than Character-specific State-ID removal lists.
60. State/Shield removed by `TRANSITION_CLEANUP` must remain distinguishable from natural expiry and damage depletion/break.
61. A metric selector using `RANDOM_AMONG_TIED` must build the exact tied-best set before consuming deterministic RNG.
62. `tiePolicy` applies to initial metric selection only and must not silently imply target requery/reroll after selection.
63. A locked target that later becomes invalid follows its declared invalid-target policy; the initial tie policy must not select a replacement unless an explicit requery/reroll policy exists.
64. ACTION_RESULT_ANY recipient readContext must be explicit and its SnapshotRef cover every requested fact.
65. postActionSettlement must be finite, completed-Action anchored and source-policy/Combat-Instance-handoff local (NATURAL_ONLY by default); it cannot block its own source completion or wait for held handoff/boundary.
66. FINAL_DAMAGE_MULTIPLIER is Damage-only with finite MULTIPLY factors >= 1; directActionRef and all scoped result bindings must resolve without implicit child-root inheritance.
67. `hpPaymentPolicy` requires singular HP Cost, supported pure pre-payment guards/floors and exactly one matching case; reject uncovered/overlapping cases, nonfinite/negative values, floors above payer Current MaxHP, co-authored legacy lethalFloor, incompatible payerCollection or unsupported shared-payer/counter allocation.
68. A selected `consumeCounterRef` must resolve to an available owner-keyed remaining-use counter with declared lifetime for a required Cost of this admitted Action, and join its required Cost/admission commit. Optional/unrelated consumption, probes or aborted/failed transactions cannot consume it or assign the floor.
69. `CURRENT_HP_AFTER_PAYMENT` must bind to the successful singular HP payment commit; failed, unavailable, distributed-aggregate or non-HP bindings cannot substitute live HP, nominal Cost or actualPaidAmount.
70. `CONTINUE_ADMITTED_ACTION` preserves only the existing admitted Action after mandatory Cost-caused lifecycle. It grants no new Action, payment waiver, resurrection, target replacement or bypass of explicit Effect/cancellation legality; observable source-invalidity outcomes require an applicable explicit policy.
71. Transition-completed deathPrevention requires an open matching HP_ZERO context, legal survivalHp and same-subject/current-instance local Return operand. Reject foreign/unavailable/independently executing references, duplicate lowering or a completion/dependency cycle.
72. A prevention consumeCounterRef must resolve with explicit owner/lifetime, be available and retained after completion, and join survival/Return/prevention success at one barrier; reject contradictory eager consumption of that allowance. Failed completion commits no floor/use/cleanup/transition and cannot silently retry the same failed candidate.
73. DIRECT_EXECUTE must be explicitly authored, current-instance subject-bound and lowered to DTH-008; reject a guessed Execute law, ordinary prevention interposition, foreign confirmation/result, fake Damage result or inferred Authority bypass. Preserve its upstream committed Cost/use and ordinary post-confirmation recovery semantics.
74. EXCLUDE_THIS_SOURCE_FAMILY requires an unambiguous runtime source-owner/origin Ability/origin Stat Effect family and an acyclic declared contribution view. Preserve constant multiplicative stack composition without adding POW/Tag/Primitive; snapshots consume the resolved stat, never reapply the modifier.
75. Shared-recipient PROPORTIONAL allocation is opt-in SIMULTANEOUS_BATCH law: commit recipient budgets once, preserve each packet receipt, eligible-layer proportions and bounded conserved numeric totals without packet/list priority.
76. SET_MITIGATION_STAT changes only a qualifying non-TRUE component's mitigation lookup after type transformation. No semantic type/capability rewrite, target ARM/RES mutation, double mitigation, implicit penetration stacking or Authority bypass.
77. AFTER_ADMISSION_BEFORE_COST_COMMIT captures once after successful admission and before active Cost debit; no failed probe/Cost may activate direct Effects, and explicit continuation retains the admitted Action's immutable source capture.

78. PREPARE_CHILD_DAMAGE_THEN_COMMIT requires finite explicit child-Damage membership, one commit owner, read-only zero/waived-Cost preparation, explicit target/failure/shared Snapshot policy and no wait for participant completion before commit.
79. A damageDerived Heal requires a sealed exact committed basis and unique local settlement owner; ADD is legal only at DAMAGE_DERIVED_HEAL_COEFFICIENT with finite nonnegative coefficients and no automatic merging of independent Heals.
80. A matching positive-grant admission scope requires validated grantOrigin/grantActionRef where observable and compatible operation mapping; it cannot be bypassed by System issuer/shared-root inference or late Resource subtraction.
81. BEFORE_HP_RESTORE MaxHP removal must join the post-death Revive transaction/projected HP read, preserving foreign contributions/Snapshot inputs and all old state on failed Revive.

82. REFLECTED_DAMAGE requires DMG-034 scalar authoring, a reached sealed committed received-ActualHP/source-group basis and a supported explicit mitigation profile; it cannot impersonate ordinary component Damage, inherit the triggering outcome membership or infer target/Authority/Shield bypass.
83. Reflected-only amount scope selects packet kind without ordinary component filters and only a supported reflected phase. Preserve ordinary component-scoped reduction semantics; unsupported reflected transform/amplification/profile mappings are rejected.

---

Additional E.9 invariants: explicit movement-sensitive Position/Entity binding; no renderer-based emptiness or hidden coordinate re-selection; bounded fixed-area interposition and supported matching; atomic success-only allowance/obligation; declared counter release/batch/retention/allocation; projection result cannot satisfy committed-result queries; complete isolated input/budget/credit identity; stable-health fields and finite pre-continuation dependency; owner/grant/State-instance anchor before control. Reject cycles, unavailable snapshots/Mode adapters and undeclared observable competing interactions.

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
