# PILOT #3 — STAGE 1 FINAL MERGED PATCH
## Target: `04_ABILITY_SCHEMA.md`

This file is the consolidated patch set after audit.

Use these blocks instead of the original Sol Stage-1 response wherever they differ.
Patches omitted/rejected from the original proposal are intentionally absent.

---

# PATCH 04-P3-00 — VERSION MARKER

**Location:** top of file.

Replace:

```md
**Version:** 2026-09-10-E
```

with:

```md
**Version:** 2026-09-15-E
```

---

# PATCH 04-P3-01 — ABILITY DEFINITION

**Location:** replace the canonical structure in `# 4. ABILITY DEFINITION`.

```md
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

`actionIntentInterpositions` is optional and contains bounded declarative `ActionIntentInterpositionSpec` rules owned by this Ability.

A Passive may therefore own an Action-Intent interposition rule that applies to its owner's future Action Intents without duplicating that rule into every Basic / Skill / Ultimate definition.

None of these fields authorizes custom executable code.
```

---

# PATCH 04-P3-02A — ACTION SPEC SURFACE

**Location:** replace the conceptual form in `# 6. ACTION SPEC`.

```md
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
```
```

---

# PATCH 04-P3-02B — ACTION INTENT INTERPOSITION SPEC

**Location:** insert after `## 6.3A naturalActionFormPolicy` and before `## 6.4 parentChildPolicy`.

```md
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
```

---

# PATCH 04-P3-03A — EXTEND `CostSpec`

**Location:** replace conceptual form in `# 10. COST SPEC`.

```md
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
```

---

# PATCH 04-P3-03B — DYNAMIC PAYER COLLECTION

**Location:** insert after `## 10.1 payer` and before `## 10.2 kind`.

```md
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

Within that per-payer Cost evaluation, the symbolic reference:

```text
PAYER
```

resolves to the current collection member.

This permits authored formulas such as:

```text
10% of PAYER.CurrentMaxHP
```

without converting that payment into Damage from the caster.

### Snapshot requirement

For a distributed Cost participating in a CostGroup with required Costs:

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

Schema only exposes the required semantic anchor.

### Payer collection is not Target ownership

Using TargetSpec query vocabulary here does not mean collection members become the Ability's damage/heal targets.

They are Cost payers.

Targeting and Cost-payer selection remain separate semantic roles.
```

---

# PATCH 04-P3-03C — `CostGroupSpec`

**Location:** replace the entire existing `## 10.4 Multi-cost transaction`.

```md
## 10.4 `CostGroupSpec`

Several CostSpecs may participate in one declared Cost transaction/group.

Conceptual form:

```yaml
costGroup:
  costGroupId:
  requiredCostRefs: []
  optionalDistributedCostRefs: []
  resultBinding:
```

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

A payer in `optionalDistributedCostRefs` still pays its **own** Cost.

Optional means:

> that payer's failed contribution need not fail the whole CostGroup.

It does not mean the caster pays on that entity's behalf.

### Payer-set ordering

For a CostGroup containing both required Costs and optional distributed Costs, authored data must preserve the semantic possibility of:

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
```

---

# PATCH 04-P3-03D — OPTIONAL PAYER FAILURE POLICY

**Location:** insert after `## 10.4 CostGroupSpec` and before `## 10.5 Waived child cost`.

```md
## 10.4A `optionalPayerFailurePolicy`

For a CostSpec referenced through:

```text
optionalDistributedCostRefs
```

the current minimum supported policy is:

```text
CONTRIBUTION_ZERO_CONTINUE
```

Meaning at authoring level:

- the payer's payment attempt may fail;
- that payer contributes zero actual paid amount;
- the failure does not by itself invalidate payments already committed by other optional payers;
- the failure does not by itself fail the whole Ability.

This field does not define transaction timing.

Timing/atomicity belong to Cost Contract.
```

---

# PATCH 04-P3-03E — ADD SCOPED `PAYER` SYMBOLIC REFERENCE

**Location:** in `# 74. OWNER / SOURCE RESOLUTION`, replace the symbolic-reference list with:

```md
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
```

---

# PATCH 04-P3-04A — EXTEND VALUE-REFERENCE FAMILIES

**Location:** in `# 9. VALUE REFERENCES / FORMULAS`, replace the conceptual ValueRef-family list with:

```md
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
```
```

---

# PATCH 04-P3-04B — COST PAYMENT RESULT BINDING

**Location:** insert after `## 10.5 Waived child cost`, before `# 10A. COMMON SPATIAL SELECTOR SPEC`.

```md
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
```

---

# PATCH 04-P3-04C — EXTEND RESULT-BINDING EXAMPLES

**Location:** in `# 35. RESULT BINDINGS`, replace the introductory examples block.

```md
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
```

---

# PATCH 04-P3-04D — COST PAYMENT RESULT TYPES

**Location:** insert after `## 35.3 Spawn result references` and before existing `## 35.4 No arbitrary memory variables`.

```md
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

Downstream consumers requiring committed payment outcome must use `actualPaidAmount`.

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
```

---

# PATCH 04-P3-04E — EXTEND ACTION RESULT OBJECT

**Location:** in `# 69. ACTION RESULT OBJECT`, replace the conceptual object.

```md
Action should produce a typed result summary:

```yaml
actionResult:
  targets:
  costPaymentResults:
  costGroupPaymentResults:
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

`costPaymentResults` records committed Cost-payment outcomes.

`costGroupPaymentResults` records declared typed aggregation/group outcomes.

Neither field replaces the Cost transaction itself.
```

---

# PATCH 04-P3-05 — SCOPED EFFECT-AMOUNT MODIFIER SPEC

**Location:** insert after `# 18. SHIELD EFFECT SPEC` and before `# 19. STATE SPEC`.

```md
# 18A. SCOPED EFFECT-AMOUNT MODIFIER SPEC

`ScopedEffectAmountModifierSpec` is a constrained declarative rule that modifies the numeric amount of qualifying Effects.

It exists for passive/system rules whose semantic is:

> Effects satisfying a structured source + recipient + semantic scope receive a typed numeric amount transform at a declared resolution phase.

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

  conditions: []

  amountOperation:
    type:
    value:

  resolutionPhase:
```

## Source scope

`sourceScope.attributionField` must reference an existing AttributionSpec field.

Current compatible fields include:

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

`recipientScope` reuses existing TargetSpec relation/filter vocabulary.

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

Recipient filtering does not perform target selection and does not create a new TargetSet by itself.

It only decides whether an already-resolving Effect recipient is inside the modifier's scope.

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

For Damage, `damageComponents` may further restrict the modifier to:

```text
PHYSICAL
WILL
TRUE
```

Example:

```yaml
effectScope:
  effectType: DAMAGE
  damageComponents:
    - PHYSICAL
    - WILL
```

means True Damage is outside this modifier's scope.

No negative pseudo-tag such as:

```text
NON_TRUE_DAMAGE
```

is required.

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

## Structured conditions

`conditions` uses existing `ConditionSpec`.

It may reference existing typed queries and ValueRefs such as:
- Rank;
- Effective Element;
- current field presence;
- TargetSet count;
- resource/stat values.

No executable condition string is permitted.

## Typed amount operation

Current minimum supported amount operation:

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

Example semantics:

```text
× 0.90
```

or a bounded factor derived from a structured `TARGET_COUNT_REF`.

The formula may calculate a scalar.

It may not:
- iterate entities;
- mutate state;
- emit Events;
- invoke Abilities;
- call engine code.

A new amount-operation type requires explicit Schema review rather than an arbitrary operation string.

## Resolution phase

Current minimum phase values introduced by this Pilot are:

```text
PRE_OVERHEAL
FINAL_DAMAGE_REDUCTION
```

Phase compatibility is typed.

### `PRE_OVERHEAL`

Valid for HEAL amount modifiers.

It means the modifier applies to the Heal amount before Overheal is derived.

It must not modify Overheal after the fact while leaving the underlying Heal unchanged.

### `FINAL_DAMAGE_REDUCTION`

Valid for DAMAGE amount modifiers.

It identifies the canonical Final Damage Reduction stage.

Exact Damage-pipeline ordering belongs to Damage Contract.

For Character data such as a modifier scoped only to:

```text
PHYSICAL
WILL
```

True Damage is unaffected because it is outside `damageComponents`, not because the modifier contains custom code saying “if True then skip”.

## Multiple rules

Each modifier is one bounded declarative rule.

Complex Character behavior should compose several modifier specs rather than embed procedural branching into one spec.

Ordering/conflict between multiple modifiers at the same resolution phase belongs to Contracts.

Schema does not invent a global modifier priority here.

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
```

---

# PATCH 04-P3-06A — NORMALIZED IR SURFACE

**Location:** in `# 51. NORMALIZED ABILITY IR`, replace the conceptual block.

```md
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

`costPlan` may carry explicit CostGroup, distributed payer-collection, and typed Cost-result binding plans.

None of these plans implies a new Primitive by itself.
```

---

# PATCH 04-P3-06B — NORMALIZER RESPONSIBILITIES

**Location:** append to the numbered list in `# 52. NORMALIZER RESPONSIBILITIES`.

```md
19. Validate `ScopedEffectAmountModifierSpec` source, recipient, Effect/component, Tag and resolution-phase compatibility.
20. Validate modifier `valueQueries`, relation anchors, query scope and every `TARGET_COUNT_REF`/query-result reference.
21. Validate CostGroup references, distributed payer-collection shape, relation anchor, snapshot anchor and optional-payer failure policy.
22. Validate singular `COST_PAYMENT_RESULT` vs aggregate `COST_GROUP_PAYMENT_RESULT` binding shape and consumer compatibility.
23. Validate Action Intent interposition ownership, intent scope, canonical anchor, settlement reference, branch selection, revalidation policy and explicit fallback candidates.
24. Reject arbitrary modifier operations, arbitrary interposition timing strings, hidden Character-specific runtime callbacks and unresolved ambiguous query anchors.
```

---

# PATCH 04-P3-06C — SCHEMA VALIDATION INVARIANTS

**Location:** append after the current existing item `25. mode-incompatible systems rejected.` in `# 92. SCHEMA VALIDATION INVARIANTS`.

```md
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
```

---

# END OF STAGE 1

After merging these patches:

- do **not** modify `01_TERMINOLOGY_vNext.md`;
- do **not** modify `02_TAG_vNext.md`;
- do **not** modify `03_PRIMITIVE.md`;
- do **not** modify `07_MODE_PROFILES.md`.

Pilot #2 machinery remains intact:
- `naturalActionFormPolicy`;
- `rootCompletionDependency`;
- Action-lineage / Effect-provenance query;
- `SpatialSelectorSpec`;
- `hitAdmission`.

Next stage is:

```text
STAGE 2 — 05_CONTRACTS.md only
```

The Stage-2 author must use this corrected Stage-1 Schema as authoritative input, especially:
- Passive-owned `ActionIntentInterpositionSpec`;
- explicit `intentScope`;
- `relationAnchor`;
- singular vs group Cost-result semantics;
- successful zero Cost payment;
- modifier `valueQueries`;
- current invariants numbered through 45.
