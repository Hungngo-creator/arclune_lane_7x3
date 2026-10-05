# ARCLUNE — POLYHYMNIA — CLARIFIED GAMEPLAY CANON

**Revision:** R4 — final designer-authored Ultimate Damage/Heal simultaneous batch policies locked; R3 completion-only note collection remains authoritative.
**Status:** GAMEPLAY_CLARIFIED / ARCHITECTURE_NORMALIZED. §7 records future external-content/profile boundaries, not unresolved internal kit mechanics.
**Source:** repository `Ý tưởng nhân vật 4.md`, Character #63, lines 805–999; later explicit designer answers take precedence on the points recorded below.

This file states Character gameplay. It does not silently add Schema fields, Contracts, Tags, Primitives, or Kernel services. Character remains declarative composition. No Character-ID runtime branch is permitted.

## 1. Identity and board vocabulary

- Name: **Polyhymnia**; Rank: **SSR**; Class: **Support**; native Element: **Wind**; female.
- Complete Raw Kit: Passive, Basic, three Skills and Ultimate; it meets the selection criterion without requiring every Character to have three Skills.
- `BASE_DEPLOYMENT_COST = TBD_BY_COST_BUDGET`. No private Deployment Cost mechanic. The later budget value is not unresolved kit gameplay and does not block canon, normalization design or architecture audit; execution-ready deployment still requires the budget to be resolved.
- The standard Turn-Based Main board uses **Slot 1 through Slot 9** on each Side. Its Leader occupies **Slot 8 within those nine Slots**. This establishes the board mapping, not a new immobility or Position-mutation prohibition; a selector uses actual captured Position. Leader is a combat role/entity, not an additional tenth recipient.
- In this kit, “all ally” includes **Polyhymnia and Leader** when they are otherwise legal recipients.
- A selector ordering allies by lowest HP% compares authoritative `Current HP / Current Max HP`. On an exact equality, the designer's explicit order is **Slot 1 → Slot 2 → … → Slot 9**. This is a declared tie rule, not incidental list/entity/Event ordering. It does not grant a general Slot-priority rule to other kits.
- For top-k selectors, order by HP% first and apply that explicit Slot order within each tied group. Select up to the stated count of distinct eligible entities. Evaluate relation/eligibility at the declared selection checkpoint, then lock selected entities. Ordinary explicit invalid-target semantics apply after lock; no implicit retarget. Full-HP allies remain legal Heal targets unless another Effect/Contract forbids receiving Heal. All-full-HP pools are still selected; actualRestore is zero, creates no Mercy, and does not cause a reroll.

## 2. Shared Damage interpretation

The designer locked the meaning of mixed Damage formulas:

```text
coefficient × WIL = WILL Damage component
coefficient × ATK = PHYSICAL Damage component
both components belong to one logical Damage hit per target
```

Resolve the components through the existing mixed-Damage mitigation/Shield/HP pipeline. Do not turn the components into two hits, replace them with True Damage, or make them Guaranteed Hit. Ultimate explicitly follows ordinary Mode/System Hit Admission. Other actions acquire no new Hit Admission exception from this clarification.

## 3. Passive — When Three Voices Agree / Tam Thanh Đồng Điệu

### 3.1 Khuông Nhạc

While Polyhymnia is on the field, her Passive maintains three independent recorded flags:

| Voice | Qualifying committed result from the qualifying Natural Action |
|---|---|
| Harm / Sát | At least one enemy receives **Actual HP Damage > 0**. |
| Mercy / Dưỡng | At least one ally receives **Effective Heal > 0**: HP actually restored. |
| Shelter / Hộ | At least one ally receives a successfully committed **positive Shield addition**. |

A qualifying Action is an actual Natural Action performed by Polyhymnia or an ally, including Leader, whose queried Effects belong to **that Action's own authored direct Effect graph**. Query both Action relation/status and generating Effect provenance. Sharing `rootActionId`, Actor, caster, or Damage Attribution is insufficient.

Exclude DoT, independent HoT, Follow-up, Counter, Reaction, Mark Damage, separate Passive-generated Effects and automatic Effects outside that direct Natural-Action graph. Ordinary modifiers strengthening a direct hit do not create a separate Effect merely by modifying it.

One qualifying Natural Action can record several voices. Each flag is binary: recording an already-recorded voice does nothing. Component count, hit count, number of positive recipients, and duplicate result delivery do not multiply a voice.

Actual HP Damage excludes Shield absorption and overkill. Effective Heal excludes discarded Overheal, HP Cost refunds, Revive HP assignment, and Max-HP reconciliation unless an independent Heal was actually committed. Shield qualification reads the committed addition, not the requested formula, total existing Shield, or the presence of a Shield State.

### 3.2 One completion checkpoint; no pending Chord token

**Every qualifying Natural Action, including this owner's own Ultimate, uses ACTION_COMPLETED.** The latest designer decision supersedes R2's own-Ultimate ADEC exception. Generic ADEC result views remain available to other explicitly authored mechanics, but do not move this Passive earlier.

One owner-keyed, ordered Effect DAG handles the completion checkpoint:

```text
verify Passive still active / source field-present
→ inspect this completed Action's committed own-direct results
→ update Sát / Dưỡng / Hộ
→ inspect resulting flags
→ if all three: atomically consume all three and create exactly one Chord settlement
→ resolve the created settlement before the next SSI Natural Action
```

Partial flags may persist during the field lifetime. There is **no stored/persistent pending-Chord gameplay token**: a full set is consumed immediately at this checkpoint, not rechecked on a future Action. Preserve processed observation and consume/create identity through duplicate delivery/replay even after flags are consumed.

If Polyhymnia leaves Field before this checkpoint, Passive is inactive, notes clear and no Chord is created. Once consume/create commits, Chord is an already-created settlement: later source leave does not cancel it, restore notes, or carry it to another Action. Finite in-progress scheduler/transaction state may be saved for recovery; it is not a gameplay pending token.

Chord cannot block the completion Event that creates it. Its declared required post-action obligation prevents SSI handoff until settlement is terminal. Do not infer relative priority between unrelated observers/Chords. CC-lost opportunities without actual completed Actions record nothing.

Do not split record/check/consume/create into independent unordered listeners or infer their order from list, Event sequence or service-call order.

### 3.3 Chord / Hợp Âm Hoàn Chỉnh

Chord:

- At Chord settlement start, snapshot current Polyhymnia WIL/ATK once, then build the eligible ally pool, evaluate LOWEST_HP_PERCENT with declared Slot ties, and lock up to **three distinct allies**. Heal each for `50% snapshotted WIL + 50% snapshotted ATK`; **DISCARD Overheal**, never convert it to Shield. Use this new settlement snapshot, not the causing Natural Action snapshot. Locked invalid targets follow ordinary explicit invalid-target semantics without automatic replacement.
- Grants **+8 AE to Polyhymnia's Side/team AE pool**.
- If fewer than three allies qualify, Heal only those remaining; do not concentrate missing target portions onto one recipient.
- Is **not a Natural Action**. Its Heal cannot create Mercy, and it cannot loop itself. The provenance exclusion applies even when a generated Chord Effect shares an Action root with its cause.

These are the kit's Heal and resource effects; ordinary Mode Class AE regeneration remains separate. The kit does not declare a priority between unrelated post-completion candidates.

When Polyhymnia leaves Field, clear all three voices. Shield retention is independently specified below. An already-created Chord follows §3.2 rather than becoming a future-Action token.

## 4. Basic and Skills

| Ability | Cost and recipients | Locked direct effect |
|---|---|---|
| **Basic — Tuning Strike / Định Âm** | One enemy; ordinary Basic cost/admission | One hit: `100% WIL` WILL + `100% ATK` PHYSICAL. No added effect. |
| **Skill 1 — Break the Silence / Phá Tĩnh** | **15 AE**; random up to **two distinct enemies** | One hit per target: `130% WIL` WILL + `110% ATK` PHYSICAL. If only one eligible enemy remains, hit it once. No duplicate target. |
| **Skill 2 — Hymn for the Wounded / Thánh Ca Thương Giả** | **20 AE**; up to **two distinct allies with lowest HP%**, explicit Slot tie order | Each Heal is `100% WIL + 70% ATK`. Discard Overheal; no automatic Shield conversion. One remaining Heal target receives one portion, not two. |
| **Skill 3 — Hold the Last Note / Trì Âm** | **20 AE**; ally Leader plus **one lowest-HP% ally excluding Leader and Polyhymnia**, explicit Slot tie order | Each Shield's requested amount is `8% Polyhymnia Current Max HP + 50% Polyhymnia WIL`. If no eligible secondary ally remains, only Leader is a recipient. |

For Basic / Skill 1 / Skill 2 / Skill 3: **Action target-context establishment → select and lock targets → snapshot Polyhymnia stats used by this Action once → resolve Effects**. SnapshotSpec AFTER_TARGET_SELECTION and explicit graph dependencies preserve this order; no global pipeline reorder is imposed. Relation/eligibility is read at selection; after lock use ordinary explicit invalid-target semantics and no automatic retarget. Missing CD/use limits are not filled with private restrictions.

### Skill 3 Shield contributions

Each successful Skill-3 grant uses **CREATE a new contribution**, never ADD_VALUE/SET_VALUE into an older contribution or refresh it. The contributions for the two recipients are independent, and later casts create independent contributions with their own lifetime. They do not refresh or merge the lifetime of an older contribution.

Each new contribution survives until at most **two future Natural Actions of Polyhymnia actually complete**. Its creating Skill-3 Natural Action does not count. A later Skill-3 Action does count for older contributions, even though it does not count for its own newly-created contributions. CC-lost opportunities, incomplete/cancelled Actions, other actors' Actions and non-Natural Actions do not decrement this clock.

Ordinary Shield depletion/removal can terminate a contribution earlier. Expiry removes only that contribution's remaining value. Independent contributions can share the existing Standard Shield pool while preserving separate ledger entries and durations. Do not import Sanguinius's positive-addition **whole-pool refresh** behavior. If source Polyhymnia leaves Field, remove all her remaining Skill-3 contributions, including those attached to other recipients, with the applicable source-leave/lifecycle cause. Declare existing Shield `owner = SELF` (Polyhymnia), with recipient separately supplied by Effect target, and FIELD_PRESENCE_SCOPED retention bound to her source presence lifetime; removal is neither Shield break nor natural expiry. Later re-entry does not resurrect them.

## 5. Ultimate — Let Heaven Hear the Chorus / Thiên Thính Vạn Thanh

Ultimate is resolved as **one Natural Action** with ordered direct Effect groups. Damage and Heal each use a separate **SIMULTANEOUS_BATCH**; the three groups do not share one commit:

```text
ACTION_START / target-context establishment
→ lock enemy set → lock ally set → lock Leader
→ snapshot Polyhymnia WIL / ATK / Current Max HP
→ simultaneous Damage batch → commit whole group → mandatory lifecycle/result processing
→ simultaneous Heal batch → commit whole group → mandatory lifecycle/result processing
→ Leader Shield group → commit
→ ACTION_DIRECT_EFFECTS_COMPLETE
→ remaining required completion work under existing architecture
→ ACTION_COMPLETED
→ Passive record/check/consume/create
→ created Chord settles before next SSI Natural Action
```

The ordering and within-group batch policies are Character-local declarative composition: existing COMPOSITE ResolutionSpec with sequential dependencies between groups and SIMULTANEOUS_BATCH for Damage/Heal. They create no global AoE default or priority system. Declare existing `reactionBoundary = AFTER_DIRECT_EFFECTS_COMPLETE`: no ordinary Reaction window between recipients inside a batch or between the three direct groups. Mandatory lifecycle processing after each completed group is not ordinary Reaction. Ordinary Reaction eligibility after direct Effects follows existing architecture; note collection still waits for ACTION_COMPLETED.

### 5.1 Source snapshot

At Ultimate start / target-context establishment, **lock enemy set → lock ally set → lock Leader → capture one immutable source snapshot** containing Polyhymnia's **WIL, ATK, Current Max HP**. Existing SnapshotSpec AFTER_TARGET_SELECTION and graph dependencies express this local order. Reuse the source snapshot for all three groups. Locked relations/sets are not requeried because an earlier group changed HP or allegiance; ordinary explicit invalid-target semantics still apply to invalid locked entities:

| Group | Recipients and formula |
|---|---|
| Damage — SIMULTANEOUS_BATCH | Every locked legal enemy: one hit containing `115% snapshotted WIL` WILL + `85% snapshotted ATK` PHYSICAL. Ordinary Hit Admission; not True Damage. |
| Heal — SIMULTANEOUS_BATCH | Every locked legal ally, including Polyhymnia and Leader: `55% snapshotted WIL + 55% snapshotted ATK`. Discard Overheal. Full-HP recipients remain legal and may restore zero. |
| Shield | Ally Leader: requested new Shield `15% snapshotted Polyhymnia Current Max HP`, subject to §5.2. |

The source-stat snapshot does not freeze Leader's later cap MaxHP read or recipient HP/Shield. Target sets/relations have their separate lock. Chord uses its own fresh settlement-start snapshot (§3.3).

### 5.1A Recipient-local calculations and group commit

For each Damage/Heal group, the RES-002 simultaneous-batch law captures that group's shared calculation-state version, builds every target-local result without exposing sibling deltas, then commits the whole group before mandatory lifecycle/result processing. This transaction view is distinct from the common Ultimate source-formula snapshot and the earlier target/relation lock. Heal uses its own group-start calculation state after the Damage group and required processing; it does not freeze every ally's missing HP at Ultimate start.

No enemy is considered to resolve before another enemy for gameplay purposes. Entity ID, Slot, authored list order, Event order and runtime iteration order cannot make one enemy's result change another's eligibility, formula, relation, Damage type, Hit Admission, mitigation or Shield interaction within this batch. Ordinary target-local mitigation, Shield and HP calculation remain independent per target. Likewise, one ally's Heal cannot change another ally's eligibility, formula, target order or locked relation within the Heal batch. Technical iteration/trace order confers no gameplay priority.

If a locked recipient becomes lifecycle-invalid before its group commits, apply that recipient's explicit applicable TGT-006 policy without requery, retarget, replacement, or changing membership of other recipients. This does not choose a new private DROP_INVALID/FAIL_EFFECT/FAIL_ACTION default. A skipped/failed local recipient contributes no fabricated positive result. The single locked Leader Shield resolves normally after Heal, with §5.2's current-at-addition cap reads; it requires no multi-recipient batch policy.

### 5.2 Ultimate-family admission cap and new contributions

A positive successful grant uses **CREATE a new, independent Ultimate Shield contribution**. Cap admitted **new value** against the total remaining active contributions on Leader belonging to **this runtime Polyhymnia owner plus this Ultimate Shield effect family**. The generic family key reuses existing provenance: **`sourceOwnerRef + originAbilityId + originEffectId`**. Ability/Effect IDs identify the authored family across casts, while the owner reference distinguishes runtime owners. Do not add parallel Ability/Effect identity aliases. Other Polyhymnia runtime owners, this owner's Skill-3 Shield and unrelated sources are outside that cap.

At the Shield addition's authoritative admission/commit checkpoint let:

```text
S = sum of remaining active Leader contributions in that owner + Ultimate family
C = 40% of Leader's then-current Current Max HP
Q = admitted requested new Shield amount derived from the source snapshot
A = min(Q, max(0, C - S))
```

Commit the new contribution for the actual positive `A`, preserving owner/effect-family provenance. Its Shelter qualification is `A > 0` after successful commit. A rejected, zero, or fully capped addition does not record Shelter merely because Leader already has Shield. When A = 0, publish a successful zero addition receipt but create **no contribution**, duration/expiry work, or old-contribution mutation; zero does not itself fail the Action.

The cap read, matching-ledger sum and new addition share one coherent authoritative transaction boundary; two concurrent grants cannot each spend the same cap headroom.

The new addition never refreshes/removes old contributions. Re-evaluate `40% Leader Current Max HP` at each new addition; MaxHP changes **do not retroactively mutate existing Shield**. Existing 400 with old cap 400 stays 400 after the cap drops to 300; next addition is zero. A higher MaxHP grants future headroom only, not automatic Shield.

Ultimate Shield has **no duration clock** (existing PERMANENT clock family), survives until depleted or explicitly removed, and **is not removed merely because source Polyhymnia leaves Field**. PERMANENT here means no timed expiry, not immunity to removal. Preserve source identity/provenance after source leave so family membership remains recognizable. Do not inherit Skill3's duration or another Character's refresh rule.

### 5.3 Chord remains result-dependent

This Ultimate can record all three voices, but does not guarantee it:

- All enemy damage absorbed by Shield → no new Harm.
- All allies at full HP, or Heal produces no actual restoration → no new Mercy.
- Shield admission rejected or cap headroom zero → no new Shelter.

Pre-existing voices remain available until consumed or cleared by source leave. “This Ultimate produces no new Harm” does not erase an older Harm flag.

## 6. State, lifetime and replay boundary

Use existing generic owners:

| State/result | Owner/key | Creation, terminal state and replay obligation |
|---|---|---|
| Three voice flags | Passive runtime owner in its field-presence lifetime | Created empty; qualified result sets a flag; Chord consumes all three; source leave clears; preserve flag state and consumed checkpoints across save/load. No Character-only manager. |
| Action observation | Existing Action result/provenance and Trigger execution context | Immutable committed direct results, with Action/Effect provenance and an explicitly declared relation-read context; one observation at ACTION_COMPLETED; preserve terminal processed identity through the replay horizon even after receipt cleanup and note consumption. An explicit typed relation readContext selects observation-state facts or a retained SnapshotRef; locked own-Action relations use their target-context snapshot. |
| Skill-3 contribution duration | Existing Shield contribution `durationState` keyed by the contribution | Two future actual source Action completions; exclude creating Action; source leave removes remaining Skill3 contributions with its lifecycle cause; expiry/removal/depletion stay distinct. |
| Ultimate cap membership | Existing Shield ledger; target plus `sourceOwnerRef + originAbilityId + originEffectId` | Query remaining active matching contributions at addition, not nominal original values or total Standard pool; use stable Effect identity and preserve the provenance across save/load. |

Already-created Chord belongs to existing Scheduler/Transaction Manager required post-action work, keyed by observed Action + trigger runtime owner + instantiated candidate/dependency. Its terminal execution identity outlives freed receipts through the supported replay horizon. Source identity remains an authoritative stat reference for the fresh Chord snapshot even after field leave; field presence is not an implicit source-stat-read condition. It does not wait for a future Action. These requirements reuse current owners. The flags' internal representation is a normalization/runtime choice; this canon does not invent a new Buff/Mark classification or a new Functional Tag for a voice.

## 7. Future external-content and Mode boundaries

The final within-group Ultimate batch question is resolved in §5 and removed from the unresolved list. No substantial internal Polyhymnia gameplay question remains. The following are future external-content/profile obligations, not holes in this kit; they do not block this canon or its architecture audit. An execution branch still requires its applicable explicit policies and fails closed if they are absent.

| Item | Boundary |
| --- | --- |
| Foreign Shield operations | Positive CREATE/ADD_VALUE receipts qualify; SET_VALUE, TRANSFER or replacement needs its own explicit addition-result mapping. Do not coerce operations. |
| Foreign Action affiliation mutation | Own Polyhymnia targets/relations are locked. An external Action changing affiliation must supply its own applicable relation-read context; do not infer a historical snapshot for external content. |
| Post-lock invalid-target/failure policy | Use the ordinary explicit applicable TGT-006 profile. No private DROP_INVALID versus FAIL_ACTION default is invented; a content profile lacking that policy requires completion before execution. No implicit retarget. |
| Different Modes | Turn-based/SSI Natural Action form is authoritative. A Mode without the same abstraction is `REQUIRED_EXPLICIT_BY_MODE_PROFILE` until 07 defines generic adaptation. Never convert two Actions to seconds or rewrite this Character into a real-time timer. |
| Unrelated post-action ordering | Existing explicit dependency/priority law governs order where observable. The before-next-Natural-Action obligation does not order independent Chords/ordinary Reactions. |

`TBD_BY_COST_BUDGET` is a later budgeting input, not unresolved gameplay.

## 8. Normalization status

Generic architecture deltas: bounded completion-result observation, Shield addition receipts/source-family caps, explicit Slot ties and required post-completion settlement. The locked local simultaneous batches within sequential groups use existing composition.
