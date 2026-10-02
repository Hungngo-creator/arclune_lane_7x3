# ARCLUNE — POLYHYMNIA — CLARIFIED GAMEPLAY CANON

**Revision:** R4 — final designer-authored Ultimate Damage/Heal simultaneous batch policies locked; R3 completion-only note collection remains authoritative.
**Status:** internal kit gameplay clarified for architecture normalization. §7 records future external-content/profile boundaries, not unresolved internal kit mechanics.
**Source:** repository `Ý tưởng nhân vật 4.md`, Character #63, lines 805–999; later explicit designer answers take precedence on the points recorded below.
**Architecture base inspected:** latest merged `main` at `97b0f77` (PR #5 merged; E.3/F.5/G.4/H.1/I.3). Reuse those merged surfaces; the R4 batch clarification requires no additional Schema, Contract or Kernel extension.

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

For each Damage/Heal group, existing RES-002 and `06` §31 capture that group's shared calculation-state version, build every target-local result without exposing sibling deltas, then commit the whole group before mandatory lifecycle/result processing. This transaction view is distinct from the common Ultimate source-formula snapshot and the earlier target/relation lock. Heal uses its own group-start calculation state after the Damage group and required processing; it does not freeze every ally's missing HP at Ultimate start.

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
| Ultimate cap membership | Existing Shield ledger; target plus `sourceOwnerRef + originAbilityId + originEffectId` | Query remaining active matching contributions at addition, not nominal original values or total Standard pool; reuse stable Effect identity from `06` §15A, and preserve the provenance across save/load. |

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

## 8. Current composition attempted before any extension

The following already compose and should not create another Tag, Primitive or subsystem:

1. Mixed Damage: current `DAMAGE`, `WILL_DAMAGE`, `PHYSICAL_DAMAGE`; `BUILD_DAMAGE_PACKET → RESOLVE_DAMAGE_PACKET → COMMIT_DAMAGE_RESULT` under `DMG-*` / `SHP-*`, one hit per target.
2. Heal and discarded Overheal: `04` §17 → existing P-044/P-045; `HEL-001`/`HEL-002`; `06` §57 committed `actualRestore`.
3. Random distinct Skill1 targets: `04` §11 random/duplicate/count fields; `TGT-005`, `RNG-*`; existing Target Resolver/RNG.
4. Source snapshot, ordered groups and simultaneous recipients: `04` §13 and §§34/36 COMPOSITE + SIMULTANEOUS_BATCH; `SNP-001`/`SNP-003`, RES-001/002/003 and local AFTER_DIRECT_EFFECTS_COMPLETE; `06` §§30–32 shared-version Transaction Manager plus existing Snapshot/Effect Graph owners. Each group starts its own calculation view; no new middleware, global AoE policy or priority.
5. Skill3 independent Shield contributions and actual completed-source-Action clock: `04` §§18–20; `SHP-002` and existing actual-action-duration support; `06` §§51/54. Current `08` M-034 proves the distinction from CC opportunities, but its Sanguinius refresh profile must not be copied.
6. Recorded binary voices: existing bounded `counter`/Condition/result/event composition (`04` §§7.6/8, §§19–20); existing Trigger/State owners. A count of three categories is not three arbitrary events.
7. Chord Heal/+8 Side AE and no recurrence: existing Heal/resource operations, non-Natural trigger resolution and `TRG-010`–`TRG-013` provenance. No extra Natural Action or custom callback.

## 9. Current support, prior gap proof and 00–08 impact

### 9.1 Current support and previously merged gap corrections

Current main already supports ACTION_RESULT_ANY, ShieldAdditionResultRef, EXPLICIT_SLOT_ORDER/top-N, sourceFamilyCap, typed result relation reads, zero-addition receipts, durable replay identity, source-owned Shield cleanup and ACT-033 post-action obligations. PR #4 and PR #5 merged the previously identified corrections. The table retains the R3 proof as **historical rationale for merged support**, not new insufficiencies or proposed deltas:

| Locked input | Existing merged input / Contract / runtime owner | Earlier insufficiency → correction now merged |
| --- | --- | --- |
| Locked relation context for completion receipt reads | 04 §8.4 ACTION_RESULT_ANY; TRG-015; 06 §25A Result Store/Condition evaluator | Earlier prose lacked a typed snapshot binding → merged required recipientFilter.readContext OBSERVATION_STATE or covered SNAPSHOT SnapshotRef; no live fallback. |
| Cap-to-zero creates no Shield entry | sourceFamilyCap + ShieldAdditionResultRef; SHP-005/006; 06 §51 ledger/Transaction Manager | Earlier cap flow unconditionally committed a contribution → merged successful zero receipt with empty refs, no ledger/clock mutation. |
| Replay after notes consumed/receipts freed | result view + owner-keyed candidates; TRG-015; 06 §25A/168 existing Trigger/Transaction records | Earlier payload retention lost terminal deduplication after cleanup → merged replay-horizon observation/consume-create/settlement identity independent of payload; reject retired-horizon input. |
| Skill3 source leave removes entries on other recipients | Existing shield.owner, FIELD_PRESENCE_SCOPED, source ledger; SHP-002; 06 §51/Lifecycle owner indexes | Earlier owner/recipient and cross-recipient cleanup wording was insufficient → merged separate owner reference, owner presence-cycle lowering and matching contribution cleanup with lifecycle cause. No new field/manager. |
| Completion-created Chord must finish before next SSI Action | Existing required post-action phase ACT-001 / 06 §20; rootCompletionDependency ACT-032; ordinary completion queue | Earlier root blocker cycled, while ordinary nonblocking queue allowed late work → merged trigger.postActionSettlement BEFORE_NEXT_NATURAL_ACTION, ACT-033 and current Scheduler/Trigger/Transaction owners. No global priority or new queue. |

Those corrections are already present in 04 §§7.13/8.4/18/validators, 05 ACT-033/TRG-015/SHP-002/005/006 and 06 §§20/23/25A/36/39B/51/168/202. For the new R4 requirement, the proof is: designer-authored per-group simultaneous recipients → merged ResolutionSpec §§34/36 → RES-002/003 → current `06` §§30–32 Transaction Manager. Shared calculation state and whole-group commit already prevent sibling contamination while explicit group dependencies preserve Damage → Heal → Shield. **Exact current insufficiency: none; runtime extension: none.** Update Canon and its declarative coverage without duplicating these capabilities.

### 9.2 All-files impact; audit does not mean modify all files

| Canonical file | Decision | Exact reason / anchor |
|---|---|---|
| `00_CANONICAL_INDEX.md` | **PATCH** | Navigate Polyhymnia R4 and its locked local batch policy. |
| `01_TERMINOLOGY_vNext_PILOT4_MERGED.md` | **NO CHANGE** | Existing Action/opportunity, actual result, Shield, presence and Snapshot distinctions suffice. |
| `02_TAG_vNext.md` | **NO CHANGE** | Existing Damage/Heal/Shield capabilities; flags, checkpoints, tie policies and provenance anchors are data. |
| `03_PRIMITIVE.md` | **NO CHANGE** | Existing Damage/Heal/Shield/State/resource operations; corrections concern law/query/scheduling. |
| `04_ABILITY_SCHEMA-1.md` | **NO CHANGE** | Existing COMPOSITE/SIMULTANEOUS_BATCH, SnapshotSpec, graph dependencies and local Reaction boundary express the final policy. |
| `05_CONTRACTS.md` | **NO CHANGE** | RES-002/003, TGT-006 and current completion/result laws already govern it. |
| `06_KERNEL_RUNTIME.md` | **NO CHANGE** | §§30–32 already implement shared-state batch calculation, whole commit and sequential group boundaries; reuse current services. |
| `07_MODE_PROFILES.md` | **NO CHANGE** | Standard nine-Slot/Leader8 mapping is already merged. Natural-action-free Mode adaptation remains REQUIRED_EXPLICIT; Class AE hook remains separate. |
| `08_STRESS_TESTS.md` | **PATCH** | Update M-040 from a synthetic simultaneous choice to the locked Character policy; add recipient-permutation, sibling-contamination and explicit invalid-recipient variants. Other cases remain unchanged; no executable tests/build. |

### 9.3 Regression obligations for 08

`MUST_PASS` / `MUST_REJECT` as appropriate:

- One mixed hit contains two component results but records only one Harm; fully Shield-absorbed damage and overkill do not create false positive Harm.
- One Action records several voices; repeated same voice is idempotent; exact owner/direct-graph filtering excludes same-root child Actions and independent Passive effects.
- All note collectors, including own Ultimate and other runtime owners, record only at actual completion. Record→check→consume/create is atomic/ordered; Chord settles before next SSI Natural Action without blocking its already-published completion. Source leave before creation prevents Chord; leave after creation does not cancel it. CC-lost opportunities record/decrement nothing.
- Discarded Overheal does not count as Mercy or create Shelter; existing unrelated Shield and zero/rejected/capped additions do not count as Shelter.
- Slot tie order applies only within exact equal HP% groups, including top-k cutoff; varying list/entity/Event order yields the same targets. Preserve Alcestis `RANDOM_AMONG_TIED` behavior.
- Skill1 selects two distinct targets or one target once; all-ally Ultimate includes self and Slot8 Leader once, never an extra tenth Leader.
- Ult source WIL/ATK/MaxHP mutation between groups does not change snapshotted formulas; current Leader MaxHP at Shield addition controls cap.
- Damage/Heal commit as separate simultaneous batches under ordered group dependencies. Permuting entity/Slot/list/Event/technical iteration cannot affect sibling calculations; mandatory lifecycle follows the completed group, not each recipient. A lifecycle-invalid locked recipient follows the fixture's explicitly authored ordinary policy without replacement or changing other recipients. This local policy is not a default for unrelated AoE.
- Two new Skill3 casts have independent contributions: creating Action excluded only for its own contribution; older contributions still decrement; no whole-pool refresh and expiry leaves other sources untouched.
- Ultimate family cap uses remaining matching contributions; unrelated owner/Skill3 contributions are excluded; two grants cannot overspend shared headroom; an explicit addition-only fixture does not mutate old contributions. Lower Leader MaxHP preserves old contributions and permits zero future additions; higher MaxHP grants future headroom only. Zero additions create no ledger contribution. Ultimate contributions persist across source leave without a duration clock.
- Chord consumes voices once, adds +8 Side AE once, remains non-Natural and cannot feed any direct-Natural-Action voice collector with its generated Heal.
- Save/load restores consumed Action checkpoints, flags and contribution provenance/durations without replaying completed additions or Chord.

Future §7 external-content/profile branches require their own declared policies; a fixture must not turn an absent external policy into a kit or global default. The Ultimate batch policy itself is locked and covered by MUST_PASS, not PROBE_UNRESOLVED.

## 10. Canon self-audit and drafting correction

R4 preserves all R3 completion-only collectors, fresh Chord snapshots/DISCARD/full-HP eligibility, source-scoped Skill3 cleanup, persistent Ultimate provenance and future-addition-only cap behavior. It locks separate simultaneous Damage/Heal batches, exact target-lock-before-source-snapshot order and ordinary Reaction hold through all three direct groups. Reconstructing the latest requirements corrected the earlier draft's obsolete test-only batch caveat and its stale claim that PR #5 architecture corrections were still unmerged. The shared formula snapshot, locked target context and separate per-group transaction views are explicitly distinct.

Canon audit preserves raw numerical formulas, distinct source/recipient identities, direct Effect provenance, actual completion versus opportunity clocks, result positivity, explicit Slot ties, source snapshot scope, contribution lifetime and genuine unresolved gameplay. The architecture draft received an independent adversarial review and corrections for checkpoint scope, actionless static Effects, historical evidence and family provenance. Actual diff inspection, cross-file consistency and the six-pass self-audit were performed on the corrected draft against current merged main; no implementation build/test is implied.
