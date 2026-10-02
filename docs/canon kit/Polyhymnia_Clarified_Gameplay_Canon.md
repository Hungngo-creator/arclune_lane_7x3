# ARCLUNE — POLYHYMNIA — CLARIFIED GAMEPLAY CANON

**Revision:** R2 — raw-kit meanings plus the designer's current clarification.
**Status:** clarified gameplay for architecture normalization; the explicitly unresolved execution details in §7 remain unresolved.
**Source:** repository `Ý tưởng nhân vật 4.md`, Character #63, lines 805–999; later explicit designer answers take precedence on the points recorded below.
**Architecture base inspected:** merged `main` at `ae65b13`; existing merged capabilities were tried first; the additive Pilot #5 changes recorded in §9 are the reviewable branch delta.

This file states Character gameplay. It does not silently add Schema fields, Contracts, Tags, Primitives, or Kernel services. Character remains declarative composition. No Character-ID runtime branch is permitted.

## 1. Identity and board vocabulary

- Name: **Polyhymnia**; Rank: **SSR**; Class: **Support**; native Element: **Wind**; female.
- Complete Raw Kit: Passive, Basic, three Skills and Ultimate; it meets the selection criterion without requiring every Character to have three Skills.
- Base Deployment Cost: `TBD_BY_COST_BUDGET`; no numeric value was supplied.
- The standard Turn-Based Main board uses **Slot 1 through Slot 9** on each Side. Its Leader occupies **Slot 8 within those nine Slots**. This establishes the board mapping, not a new immobility or Position-mutation prohibition; a selector uses actual captured Position. Leader is a combat role/entity, not an additional tenth recipient.
- In this kit, “all ally” includes **Polyhymnia and Leader** when they are otherwise legal recipients.
- A selector ordering allies by lowest HP% compares authoritative `Current HP / Current Max HP`. On an exact equality, the designer's explicit order is **Slot 1 → Slot 2 → … → Slot 9**. This is a declared tie rule, not incidental list/entity/Event ordering. It does not grant a general Slot-priority rule to other kits.
- For top-k selectors, order by HP% first and apply that explicit Slot order within each tied group. Select up to the stated count of distinct eligible entities. Selection timing, lock, and later invalidation are separate unresolved decisions where not already locked below.

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

### 3.2 Exact timing; Ultimate correction is local

For **Polyhymnia's own Ultimate**, evaluate and record its three result groups **after its direct Ultimate Effects settle and before that Natural Action completes**. This is the local direct-Effects-complete checkpoint; it is not three individual per-hit listeners. Its exceptional observer must prove both that the `EVENT_ACTION` Actor equals this Trigger's runtime owner and that the Action's origin Ability identity resolves to that owner's own Ultimate. Reuse current `actorRef` and `originAbilityId` provenance; this canon does not invent an `originAbilityRef` Schema field. These are typed actor/Ability queries, not a Character-ID runtime check.

For **all other qualifying Natural Actions**, retain the raw kit's timing: evaluate and record **after that Natural Action actually completes**. The Ultimate correction does not move every ally's Action listener to pre-completion. In particular, another Polyhymnia owner observing this Ultimate uses the ordinary post-completion observer. A CC-lost opportunity without an actual completed Action records no voices.

When the three flags are present, the current qualifying Natural Action must complete before Chord executes. Then consume the three flags and execute Chord. Recording at the Ultimate's earlier checkpoint does not permit Chord to execute before Ultimate completion.

Represent the completed-Action observer as **one locally ordered Effect DAG**:

```text
conditionally record this completed Action's results
  (skip recording for this owner's own Ultimate, already observed above)
→ inspect all three current flags
→ atomically consume the three flags when all are present
→ execute Chord Heal and Side AE effects
```

Do not use independent record/check/Chord listeners and infer their relative order from registration, list order, Event sequence, or service calls. This local dependency does not order unrelated observers or another owner's Chord.

### 3.3 Chord / Hợp Âm Hoàn Chỉnh

Chord:

- Heals up to **three distinct eligible allies with lowest HP%**, each for `50% WIL + 50% ATK` of Polyhymnia; apply the declared Slot tie order.
- Grants **+8 AE to Polyhymnia's Side/team AE pool**.
- If fewer than three allies qualify, Heal only those remaining; do not concentrate missing target portions onto one recipient.
- Is **not a Natural Action**. Its Heal cannot create Mercy, and it cannot loop itself. The provenance exclusion applies even when a generated Chord Effect shares an Action root with its cause.

These are the kit's Heal and resource effects; ordinary Mode Class AE regeneration remains separate. The kit does not declare a priority between unrelated post-completion candidates.

When Polyhymnia leaves the field, clear all three recorded voices. Do not infer a Shield cleanup rule from this Passive cleanup. Source-leave treatment of an already pending Chord is listed in §7.

## 4. Basic and Skills

| Ability | Cost and recipients | Locked direct effect |
|---|---|---|
| **Basic — Tuning Strike / Định Âm** | One enemy; ordinary Basic cost/admission | One hit: `100% WIL` WILL + `100% ATK` PHYSICAL. No added effect. |
| **Skill 1 — Break the Silence / Phá Tĩnh** | **15 AE**; random up to **two distinct enemies** | One hit per target: `130% WIL` WILL + `110% ATK` PHYSICAL. If only one eligible enemy remains, hit it once. No duplicate target. |
| **Skill 2 — Hymn for the Wounded / Thánh Ca Thương Giả** | **20 AE**; up to **two distinct allies with lowest HP%**, explicit Slot tie order | Each Heal is `100% WIL + 70% ATK`. Discard Overheal; no automatic Shield conversion. One remaining Heal target receives one portion, not two. |
| **Skill 3 — Hold the Last Note / Trì Âm** | **20 AE**; ally Leader plus **one lowest-HP% ally excluding Leader and Polyhymnia**, explicit Slot tie order | Each Shield's requested amount is `8% Polyhymnia Current Max HP + 50% Polyhymnia WIL`. If no eligible secondary ally remains, only Leader is a recipient. |

Source-stat and target-selection checkpoints for these abilities have not been supplied; the Ultimate snapshot below must not be silently copied to them. Missing clocks/CD/use limits are not filled with Character-specific restrictions.

### Skill 3 Shield contributions

Each successful Shield grant creates a **new contribution**. The contributions for the two recipients are independent, and later casts create independent contributions with their own lifetime. They do not refresh or merge the lifetime of an older contribution.

Each new contribution survives until at most **two future Natural Actions of Polyhymnia actually complete**. Its creating Skill-3 Natural Action does not count. A later Skill-3 Action does count for older contributions, even though it does not count for its own newly-created contributions. CC-lost opportunities, incomplete/cancelled Actions, other actors' Actions and non-Natural Actions do not decrement this clock.

Ordinary Shield depletion/removal can terminate a contribution earlier. Expiry removes only that contribution's remaining value. Independent contributions can share the existing Standard Shield pool while preserving separate ledger entries and durations. Do not import Sanguinius's positive-addition **whole-pool refresh** behavior.

## 5. Ultimate — Let Heaven Hear the Chorus / Thiên Thính Vạn Thanh

Ultimate is resolved as **one Natural Action** with ordered direct Effect groups:

```text
Damage group → Heal group → Leader Shield group
→ evaluate/record this Ultimate's qualifying direct results
→ Natural Action completion
→ Chord if all three voices are ready
```

The ordering is a local declarative Effect graph dependency. It is not a global priority system. It does not assert a new simultaneous/atomic transaction across every group or every recipient; intermediate Reaction/batch policies remain as noted in §7.

### 5.1 Source snapshot

At this Ultimate's **ACTION_START**, capture one immutable source snapshot containing Polyhymnia's **WIL, ATK, Current Max HP**. Reuse that snapshot for all three direct groups:

| Group | Recipients and formula |
|---|---|
| Damage | Every eligible enemy: one hit containing `115% snapshotted WIL` WILL + `85% snapshotted ATK` PHYSICAL. Ordinary Hit Admission; not True Damage. |
| Heal | Every eligible ally, including Polyhymnia and Leader: `55% snapshotted WIL + 55% snapshotted ATK`. Discard Overheal. |
| Shield | Ally Leader: requested new Shield `15% snapshotted Polyhymnia Current Max HP`, subject to §5.2. |

This snapshot does not freeze Leader's Max HP, target relations, recipients, or Chord formulas. Chord is a separate generated effect with its own unresolved formula checkpoint.

### 5.2 Ultimate-family admission cap and new contributions

A successful grant creates a **new, independent Ultimate Shield contribution**. Cap admitted **new value** against the total remaining active contributions on Leader belonging to **this runtime Polyhymnia owner plus this Ultimate Shield effect family**. The generic family key reuses existing provenance: **`sourceOwnerRef + originAbilityId + originEffectId`**. Ability/Effect IDs identify the authored family across casts, while the owner reference distinguishes runtime owners. Do not add parallel Ability/Effect identity aliases. Other Polyhymnia runtime owners, this owner's Skill-3 Shield and unrelated sources are outside that cap.

At the Shield addition's authoritative admission/commit checkpoint let:

```text
S = sum of remaining active Leader contributions in that owner + Ultimate family
C = 40% of Leader's then-current Current Max HP
Q = admitted requested new Shield amount derived from the source snapshot
A = min(Q, max(0, C - S))
```

Commit the new contribution for the actual positive `A`, preserving owner/effect-family provenance. Its Shelter qualification is `A > 0` after successful commit. A rejected, zero, or fully capped addition does not record Shelter merely because Leader already has Shield.

The cap read, matching-ledger sum and new addition share one coherent authoritative transaction boundary; two concurrent grants cannot each spend the same cap headroom.

The new addition does not refresh or remove older contributions. The addition-only cap operation computes nonnegative headroom; if its input family sum already exceeds the current maximum, that operation admits zero and does not itself rewrite old contributions. Whether a separate reactive rule must reclamp the Character's old Shield when Leader Max HP changes is **UNRESOLVED / NOT BLOCKING** in §7; the absence of such a supplied rule is not locked as a permanent gameplay promise.

Ultimate Shield duration and source-leave retention have not been supplied. Do not inherit Skill 3's two-action duration or another Character's refresh rule.

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
| Action observation | Existing Action result/provenance and Trigger execution context | Immutable committed direct results, with Action/Effect provenance and an explicitly declared relation-read context; one observation per declared checkpoint; repeated delivery/replay must not record or execute the same observation twice. |
| Skill-3 contribution duration | Existing Shield contribution `durationState` keyed by the contribution | Two future actual source Action completions; exclude creating Action; preserve remaining count and creating Action reference; expiry/removal/depletion retain their distinct terminal causes. |
| Ultimate cap membership | Existing Shield ledger; target plus `sourceOwnerRef + originAbilityId + originEffectId` | Query remaining active matching contributions at addition, not nominal original values or total Standard pool; reuse stable Effect identity from `06` §15A, and preserve the provenance across save/load. |

These requirements reuse current owners. The flags' internal representation is a normalization/runtime choice; this canon does not invent a new Buff/Mark classification or a new Functional Tag for a voice.

## 7. UNRESOLVED / NOT BLOCKING for the current architecture extensions

The following do not block defining the generic result, selector and Shield-admission boundaries. They **do** block any executable Character branch that requires the missing answer; the Normalizer must preserve/reject those branches rather than install a hidden default.

| Item | Missing designer decision; do not choose silently |
|---|---|
| Full-HP eligibility | Whether Skill-2 and Chord candidate pools exclude full-HP allies before top-k selection; “need Heal” does not supply a complete admission/failure rule. |
| Chord Overheal | Chord's Overheal policy; Skill2/Ultimate explicitly discard theirs, but Chord has no such declaration. |
| Other formula checkpoints | Basic/Skills source reads, Skill3 source MaxHP/WIL read, and Chord source WIL/ATK read. Ultimate's ACTION_START snapshot is locked only for Ultimate. |
| Target context and invalidation | Initial target-selection timing, target locks/requery, relation reads, invalid locked targets and branch failure/no-target behavior not stated by the kit. Tie order does not settle them. |
| Leader MaxHP changes / existing cap pool | Whether and how existing Ultimate contributions react when Leader Current Max HP lowers their aggregate cap (trim/reconcile versus preserve until later addition/depletion). The current generic extension governs new addition only; it does not decide a separate reactive gameplay rule. |
| Ultimate Shield lifetime | Duration/expiry and source-leave retention of new Ultimate contributions; no inferred Skill3 lifetime or permanent lifetime. |
| Skill3 source leave | How its source-owned actual-action clock pauses/ends/rebinds after source leave and later re-entry/Revive; raw only locks voices clearing. |
| Pending Chord source leave | Whether an already-qualified/scheduled Chord cancels or can execute after source leaves, and validity of its source formula read. No generic cancellation/retry inferred. |
| Other Shield operations | How transfer, SET_VALUE or replacement maps to Shield addition evidence where its meaning differs from CREATE/ADD_VALUE; do not coerce those operations. Supported positive CREATE/ADD_VALUE receipts qualify, while pure duration refresh adds no positive value. |
| Intermediate Reaction / relation changes | Reaction scheduling between Ultimate groups and recipients, simultaneous versus sequential group transactions, and whether allegiance/relation changes use result-time or query-time relation. The locked Damage→Heal→Shield order alone supplies none of these. |
| Other Modes | Natural-Action-free Mode adaptation and AE ownership; do not inherit turn-based semantics where Mode support remains unresolved. |

## 8. Current composition attempted before any extension

The following already compose and should not create another Tag, Primitive or subsystem:

1. Mixed Damage: current `DAMAGE`, `WILL_DAMAGE`, `PHYSICAL_DAMAGE`; `BUILD_DAMAGE_PACKET → RESOLVE_DAMAGE_PACKET → COMMIT_DAMAGE_RESULT` under `DMG-*` / `SHP-*`, one hit per target.
2. Heal and discarded Overheal: `04` §17 → existing P-044/P-045; `HEL-001`/`HEL-002`; `06` §57 committed `actualRestore`.
3. Random distinct Skill1 targets: `04` §11 random/duplicate/count fields; `TGT-005`, `RNG-*`; existing Target Resolver/RNG.
4. Source snapshot and group order: `04` §13 and §§34/36; `SNP-001`/`SNP-003` and Action completion laws; existing Snapshot/Effect Graph/Transaction owners.
5. Skill3 independent Shield contributions and actual completed-source-Action clock: `04` §§18–20; `SHP-002` and existing actual-action-duration support; `06` §§51/54. Current `08` M-034 proves the distinction from CC opportunities, but its Sanguinius refresh profile must not be copied.
6. Recorded binary voices: existing bounded `counter`/Condition/result/event composition (`04` §§7.6/8, §§19–20); existing Trigger/State owners. A count of three categories is not three arbitrary events.
7. Chord Heal/+8 Side AE and no recurrence: existing Heal/resource operations, non-Natural trigger resolution and `TRG-010`–`TRG-013` provenance. No extra Natural Action or custom callback.

## 9. Bounded generic gap proof and 00–08 impact

The names below are the bounded additions in this Pilot #5 reviewable change, not capabilities claimed to exist in the inspected pre-change merged base. They remain declarative architecture, not implemented runtime APIs. §7 prevents calling the whole Character execution-ready.

### 9.1 Exact gaps

| Locked gameplay input | Current capability / composition attempted | Exact insufficiency and smallest reusable extension | Governing owner and affected files |
|---|---|---|---|
| Observe Damage, Heal and committed Shield additions **once over one Natural Action's own direct Effect graph**, at the declared completion checkpoint | `04` §8.3 provenance queries, §35 bindings, §69 Action result, §70 Damage aggregation; `05` `TRG-013`/`DMG-012`; `06` §§15/25/35/39A | Provenance and Damage aggregation exist; the current typed Condition surface does not define a bounded Action-result `ANY` query across committed Damage/Heal/Shield addition collections. Reuse provenance and add only typed result-family/metric/predicate querying, `ACTION_RESULT_ANY`. Preserve Ultimate direct-complete versus other Action-complete anchors. | `04` §8.4/§69; `05` `TRG-015` constrained by existing `TRG-013`/`ACT-032`; `06` §25A/§39A under existing Result Store/Trigger/Action finalization; `08` result/provenance regressions. No general iteration VM. |
| Shelter requires successfully committed **new Shield amount > 0**, including a cap-truncated zero result | `03` P-046 already creates atomic Shield and exposes Shield StateRef/result; `04` §18/§35; `05` `SHP-002`; `06` §§25/51 | Existing Shield State/remaining total cannot prove the amount newly committed by this grant. Refine its existing result family with immutable addition outcome, `ShieldAdditionResultRef`, including requested versus committed amount, target/source/owner/provenance and failure outcome. | `04` §18/§35.3C/§69; `05` `SHP-005`; `06` §25/§51 Shield commit/Result Store; `08`. Existing P-046 remains the atomic operation; no new Primitive needed. |
| Lowest-HP% count1/2/3 with designer-declared **Slot1→9** equality rule | `04` §11.5A, `05` `TGT-007`, `06` §40 currently define only the minimum count-one `RANDOM_AMONG_TIED` profile | Current profile cannot encode deliberate nonrandom Slot equality order or count-k cutoff semantics without pretending list order is priority. Extend existing `tiePolicy` with bounded authored position order, `EXPLICIT_SLOT_ORDER`, and exact top-k metric selection. Keep existing RNG policy unchanged. | `04` TargetSpec/Normalizer; `05` `TGT-007`; `06` Target Resolver; `08`. `07` supplies mode Slot mapping, not global priority. |
| A **new** Ultimate contribution uses aggregate remaining headroom for owner+effect-family+Leader, with no implicit old mutation from that new addition | `04` §18 source/owner/stacking; `05` `SHP-002`; `06` §§15A/29/51/52. Existing ledger already preserves contribution provenance | Ledger identity alone does not declare cap admission scope or atomically consume matching headroom. Small typed Shield admission cap, `sourceFamilyCap`, keyed by recipient plus explicit runtime `sourceOwnerRef` and existing `originAbilityId + originEffectId` and bounded remaining-ledger aggregation. `originEffectId` already supplies stable definition identity; no new identity namespace, separate Shield pool or Character manager. | `04` §18.1; `05` `SHP-006` constrained by `SHP-002`; `06` §29/§51 Transaction Manager/ledger; `08`. Preserve Sanguinius refresh and unrelated contribution semantics. |

### 9.2 All-files impact; audit does not mean modify all files

| Canonical file | Decision | Exact reason / anchor |
|---|---|---|
| `00_CANONICAL_INDEX.md` | **PATCH — navigation/source workflow** | §§0–2/21/27/36–38/41: correct current filenames/revisions, link this canon, and replace stale upload/manual-copy instructions with the authorized repository workflow/root AGENTS workflow instructions. No gameplay rule changes. |
| `01_TERMINOLOGY_vNext_PILOT4_MERGED.md` | **NO CHANGE** | §§4.5/7.8/8.6/9.11–9.14/10.4–10.5/12 already distinguish Natural Action, Slot, Shield, Actual HP Damage, Heal and Snapshot. New typed result handles/query forms belong in Schema/Contract, not a new gameplay noun. |
| `02_TAG_vNext.md` | **NO CHANGE** | Damage component, Heal and Shield capabilities exist. Harm/Mercy/Shelter flags, completion checkpoint, selector tie policy and cap grouping are data/parameters, not queryable new Functional capabilities. |
| `03_PRIMITIVE.md` | **NO CHANGE** | P-040–P-046 already calculate/commit Damage/Heal and create Shield with result; existing State/resource/trigger composition executes the rest. Refine the Shield result law without adding a Character-shaped atomic operation. Recheck this conclusion against the accepted typed result format. |
| `04_ABILITY_SCHEMA-1.md` | **PATCH** | §§8.4/11.5A/18/18.1/35.3C/52/69: result ANY, Shield addition handle, explicit Slot tie/top-k, bounded cap authoring and lowering. Reject missing observable policies rather than infer them. |
| `05_CONTRACTS.md` | **PATCH** | Action/result query boundaries with `ACT-030`/`ACT-031`/`TRG-013`, `TGT-007`, `SHP-002`: committed results, checkpoint scope, explicit equality order, Shield cap admission and atomicity. No global trigger priority and no change to prior Pilot profiles. |
| `06_KERNEL_RUNTIME.md` | **PATCH** | §§23/25/25A/39A/40/51/168/202: extend the existing result/query/Target Resolver/Shield ledger paths and serialization/invariants. Keep field lifetime and per-contribution duration separate. |
| `07_MODE_PROFILES.md` | **PATCH only for confirmed board clarification** | §§8–9 currently allow misreading nine normal positions plus another Leader. State the confirmed turn-based nine-Slot mapping with Leader at Slot8. No Mode fork for Chord, result query or Shield cap; §12.1 Class AE stays separate. |
| `08_STRESS_TESTS.md` | **PATCH** | Add declarative architecture cases listed below; executable tests/build remain outside this task. Preserve B-008, C-007, D-004–D-006, M-034/M-035 and prior Pilot regressions. |

### 9.3 Regression obligations for 08

`MUST_PASS` / `MUST_REJECT` as appropriate:

- One mixed hit contains two component results but records only one Harm; fully Shield-absorbed damage and overkill do not create false positive Harm.
- One Action records several voices; repeated same voice is idempotent; exact owner/direct-graph filtering excludes same-root child Actions and independent Passive effects.
- Ultimate records after Damage→Heal→Shield direct groups but Chord waits for completion; other Natural Actions record after completion; another Polyhymnia observes this Ultimate only at completion. Own-Ultimate actor/Ability guards prevent both an early foreign-Ultimate observation and a duplicate completion recording. The completed observer's record→check→consume→Chord dependency does not rely on listener order. CC-lost opportunity records/decrements nothing.
- Discarded Overheal does not count as Mercy or create Shelter; existing unrelated Shield and zero/rejected/capped additions do not count as Shelter.
- Slot tie order applies only within exact equal HP% groups, including top-k cutoff; varying list/entity/Event order yields the same targets. Preserve Alcestis `RANDOM_AMONG_TIED` behavior.
- Skill1 selects two distinct targets or one target once; all-ally Ultimate includes self and Slot8 Leader once, never an extra tenth Leader.
- Ult source WIL/ATK/MaxHP mutation between groups does not change snapshotted formulas; current Leader MaxHP at Shield addition controls cap.
- Two new Skill3 casts have independent contributions: creating Action excluded only for its own contribution; older contributions still decrement; no whole-pool refresh and expiry leaves other sources untouched.
- Ultimate family cap uses remaining matching contributions; unrelated owner/Skill3 contributions are excluded; two grants cannot overspend shared headroom; an explicit addition-only fixture does not mutate old contributions. The Character's reaction to Leader MaxHP changes stays unresolved.
- Chord consumes voices once, adds +8 Side AE once, remains non-Natural and cannot feed any direct-Natural-Action voice collector with its generated Heal.
- Save/load restores consumed Action checkpoints, flags and contribution provenance/durations without replaying completed additions or Chord.

`PROBE_UNRESOLVED` / fail-closed execution obligations cover §7; no `MUST_PASS` case may resolve those gameplay choices by example.

## 10. Canon self-audit and drafting correction

This R2 deliberately corrects these tempting first-draft mistakes: moving every collector to direct-effects-complete, copying Ultimate's ACTION_START snapshot into other formulas, treating Leader as a tenth ally, applying cap to each contribution independently, copying Sanguinius refresh, and silently choosing a reactive cap rule when Leader MaxHP falls.

Canon audit preserves raw numerical formulas, distinct source/recipient identities, direct Effect provenance, actual completion versus opportunity clocks, result positivity, explicit Slot ties, source snapshot scope, contribution lifetime and genuine unresolved gameplay. The architecture draft received an independent adversarial review and corrections for checkpoint scope, actionless static Effects, historical evidence and family provenance. The actual diff/cross-file/six-pass audit remains required before this branch is called final; no implementation build/test is implied.
