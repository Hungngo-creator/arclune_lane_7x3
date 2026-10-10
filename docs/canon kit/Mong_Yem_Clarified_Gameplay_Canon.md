# ARCLUNE — MỘNG YỂM / MENG YAN — CLARIFIED GAMEPLAY CANON

**Revision:** R1 — designer-locked clarification, 2026-10-10.
**Source:** root `ý tưởng nhân vật 1.md`, A.1 `[SSR] ÁC MỘNG NGỌT NGÀO – MỘNG YỂM (Meng Yan)`, and the explicit designer clarification in this task. The latter supersedes ambiguous raw wording on every point below.
**Status:** GAMEPLAY_CLARIFIED / ARCHITECTURE_NORMALIZED. Internal kit semantics are locked. `CONTENT_TBD / DESIGNER_POOL_DEFINITION_REQUIRED` applies only to the exact finite allied/enemy Dream effect-package pools; full executable Ultimate content is blocked until those entries are authored. Normalization means declarative architecture composition, not implemented runtime behavior or a completed pool.

## 1. Identity and common rules

SSR; Class **Mage**. This Canon defines combat meaning, not numeric roster/base-stat metadata or implementation behavior. Old `src/catalog.ts`, implementation/tests and prototypes supply no gameplay authority.

Unless an explicit mechanic converts it, an ATK contribution is **PHYSICAL** and a WIL contribution is **WILL**. Mixed components of one hit share one Hit Admission and common Damage commit; they do not produce two Passive stacks.

Attack-producing semantic owners use the project default **POSITION / SLOT** binding. Basic and Skill3 lock the selected enemy Slot and resolve its currently legal occupant at the governed Damage checkpoint. No Character-wide Entity exception is authored. An invalid/empty resolved recipient follows ordinary local invalidation, without chasing the originally selected Entity or inventing a replacement draw. Non-attack stack redistribution selects current recipient identities independently.

Active Skill Costs are required upfront Costs, committed before activation. Failed required payment activates no State/Damage/stack/spread and uses ordinary failure law. No implicit refund, cost waiver, extra cooldown or use limit is authored. Ultimate follows the project's global non-Leader full-Rage auto-cast law and ordinary admission/Cost semantics; a sleeping owner performs no Ultimate on a consumed slept opportunity.

Mechanic names, State labels, pool IDs and presentation cues below are not new Functional Tags. Deleted raw `Tags:` metadata is not a Tag authority. Ordinary State/Effect Admission and lifecycle validity apply; cleanse resistance grants no Axiom/Quy Tắc Authority or admission bypass.

## 2. Passive — Mê Ca Dẫn Thụy

Qualifying Damage is Mộng Yểm's **own direct Basic or Skill3 Damage hit**. Skill1 and Ultimate have no Damage. DoT, Counter, Reaction, unrelated Follow-up, unrelated Passive Damage and Effects merely sharing ancestry do not qualify. Prove the actual Action/Effect owner and direct provenance; Damage credit or root lineage alone is insufficient.

One successfully admitted/committed qualifying hit on a recipient grants **+1 Mê Hoặc**, capped at **3** on that recipient. Positive Actual HP Damage is not required: a legal hit wholly absorbed by Shield can grant a stack. MISS, invalid recipient, rejected Damage or an uncommitted transaction grants none. A two-component mixed hit grants once, not per component. State Admission remains applicable to the resulting grant.

Mê Hoặc's ordinary cleanse/dispel policy rejects both stack removal and reduction. This does not protect against lifecycle cleanup or an independently explicit stronger/conflicting semantic, and does not infer Authority. Skill3's explicitly authored stack removal is not ordinary Cleanse.

Only a committed **below3 → 3** transition arms **one** Ngủ Say application attempt. A rejected Sleep leaves the committed count at3 and closes that attempt; later hits while already capped3 do not retry it. A new threshold episode requires falling below3 and later reaching3 again. Transferred stacks use the same cap/transition rule.

### 2.1 Ngủ Say created by this Passive

Hard Sleep lasts for the target's **next one Natural Action opportunity**. At that opportunity:

- consume the opportunity and perform no Basic/Skill/Ultimate;
- create no Action-generated class AE/Rage;
- retain the ordinary ensuing global SSI Turn Boundary;
- expire Sleep after that consumed opportunity.

Being hit never wakes this Sleep early. Non-Natural Actions do not consume its duration. Sleep admission/control and duration are separate from visible Mê Hoặc; stacks may remain visible during Sleep.

On **normal full Sleep expiry**, clear all remaining Mê Hoặc associated with this source's threshold cycle. If an independently legal mechanic removes Sleep early, preserve those stacks unless that mechanic explicitly also affects them; Sleep removal is not ordinary Cleanse of Mê Hoặc. Target death/true lifecycle removal/leave follows ordinary State cleanup. Preserve source/cycle and terminal-cause identity so expiry never clears another source's unrelated stacks or becomes an early-removal payout.

## 3. Basic — Mộng Phệ

One selected enemy Slot; **one hit**, two components:

| Component | Formula |
| --- | --- |
| PHYSICAL | 100% ATK |
| WILL | 100% WIL |

The Passive grants its one stack after qualifying hit settlement. The raw Basic's stack sentence describes that same Passive grant, not a second stack operation.

## 4. Skill1 — Huyễn Ảnh Che Màn

Active Skill; **30 AE**. On successful activation create one self Evasion State, with no Damage.

Duration is the **next3 own Natural Action opportunities after the casting opportunity**. Casting does not decrement the fresh duration. Later CC-lost opportunities count; non-Natural Actions do not. Expire after the third counted opportunity is consumed/completed. Same-source recast **REFRESHES to3 future opportunities** and never adds another ×0.50 modifier. A rejected reapplication does not refresh the existing State.

While active, modify only an incoming hit whose semantic owner is all of:

- `BASIC_ATTACK`;
- single-target;
- ordinary, non-random recipient selection;
- attempting to hit Mộng Yểm.

Multiply that hit's **ordinary Hit Admission probability ×0.50**: ordinary100% becomes50%. This changes neither target binding nor position nor Damage amount. It excludes Skills/Ultimates, AoE or multi-target Basics, random targeting, fixed positional AoE, non-attack Damage, DoT and Counter/Reaction merely using Basic-like VFX. Qualify from the actual attack owner's identity/shape/selection, not VFX, one surviving recipient or shared ancestry.

Guaranteed Hit and special Hit Admission semantics retain their generic Contracts. This is ordinary Evasion, not an Authority-bearing deny rule.

## 5. Skill2 — Thụy Ca Tự Miên

Active Skill; **30 AE once at activation**, requiring one Natural Action. After payment/activation enter **SELF_SLEEP**. The casting Natural Action itself is not a slept opportunity and grants no Skill2 growth.

### 5.1 Consumed opportunities and growth

Each later own Natural Action opportunity while SELF_SLEEP remains active is consumed without an Action, and grants **exactly one** permanent-in-battle growth stack:

```text
+7 percentage points ATK
+7 percentage points WIL
N earned stacks → +7N% ATK and +7N% WIL
```

These are additive stat contributions, never `1.07^N`; no cap. No Action-generated AE/Rage arises from that slept opportunity. Ordinary global SSI boundary follows. Non-Natural Actions do not produce growth or consume the opportunity profile.

Earned growth is **BATTLE_SCOPED**, separate from SELF_SLEEP. Wake preserves it; later re-sleep adds to it. It survives ordinary LEAVE_FIELD, Return-to-Deck/redeployment and death/Revive unless another explicit mechanic removes battle-scoped progression. Reset at battle end. SELF_SLEEP is field/lifecycle scoped: death, true lifecycle removal or LEAVE_FIELD removes the active sleeping State and stops new accumulation.

### 5.2 Explicit all-Damage protection

While SELF_SLEEP is active, **every incoming Damage component/packet otherwise resolving against Mộng Yểm receives ×0.50 before Shield/HP commit**, explicitly including **TRUE Damage**. Ordinary Damage eligibility, Hit Admission, Shield and lifecycle remain applicable. HP Cost/HP Loss are not Damage and gain no implicit protection.

This is an explicit receive multiplier stronger than ordinary Final Damage Reduction wording. Do not lower it to ordinary FDR, or let TRUE's FDR bypass remove this protection. Supported scalar reflected Damage is incoming Damage too; no component label may silently exclude it.

### 5.3 Automatic wake

At finite authoritative stable health checkpoints, if SELF_SLEEP is active, Mộng Yểm is still lifecycle-valid/alive, and **CurrentHP <=35% CurrentMaxHP**, wake immediately by removing SELF_SLEEP only. Observe relevant committed CurrentHP/CurrentMaxHP changes, including effective capacity/reconciliation changes; use the stable current values. Check the established activation state too, so entering SELF_SLEEP already below threshold does not require a future hit.

Never interpose between **HP_ZERO → mandatory lifecycle** or within an atomic Effect/batch. Skill2 is not Death Prevention. If prevention/recovery leaves the original subject alive at<=35%, its resulting stable checkpoint may wake her; confirmed death's ordinary cleanup takes precedence. Removal preserves earned growth and creates no Heal, Action, Cost or synthetic damage result.

### 5.4 Manual wake

Double-tap/click is presentation input for the semantic operation **MANUAL_WAKE_REQUEST**, not a combat Action. It costs no AE, consumes no Natural Action, grants no Action-generated AE/Rage, and removes only SELF_SLEEP. A no-active-State request is a no-op, never a stored wake for a future re-sleep.

During an enemy Natural Action, queue the request and commit at the **next safe global Turn Boundary after that enemy opportunity is terminal**. Never interrupt an already resolving Damage/Effect transaction or its mandatory lifecycle/result work. At the beginning of Mộng Yểm's own Natural opportunity, a pending/then-accepted request resolves **before SELF_SLEEP can consume that opportunity**, allowing ordinary Action selection if no other control forbids it.

Bind pending work to the existing exact subject and active State instance. State removal/replacement or lifecycle invalidity retires stale work; repeated delivery cannot wake a future State. Resolve only at these finite safe scheduler checkpoints, not through arbitrary mid-Effect callbacks. Wake cannot restore a consumed opportunity or reverse prior Damage/growth.

### 5.5 Reuse

Once awake, Skill2 can later be cast normally for another30 AE. Previously earned growth remains.

## 6. Skill3 — Phá Mộng Tàn Ca

Active Skill; **25 AE**. One selected enemy Slot; one hit with PHYSICAL and WILL components. At action/cast context capture the Slot's governed target State view, **before this hit's Passive grant**:

```text
N_pre = clamp(current Mê Hoặc count, 0, 3)
sleep_pre = currently under this Mê Hoặc-created Ngủ Say
spreadEligible = sleep_pre OR N_pre ==3
```

These immutable pre-hit facts control the whole execution. Preserve the Slot binding for Damage; a later occupant read is not permission to overwrite N_pre/sleep_pre with post-hit facts.

| N_pre | PHYSICAL coefficient | WILL coefficient |
| --- | --- | --- |
| 0 | 180% ATK | 180% WIL |
| 1 | 200% ATK | 200% WIL |
| 2 | 220% ATK | 220% WIL |
| 3 | 240% ATK | 240% WIL |

Formula is **(180 +20×N_pre)%** for each component: additive percentage-point scaling, never repeated ×1.20. If spreadEligible, the Damage packet ignores **30% ARM and30% RES**. This is packet-local ignore/penetration, not a target Debuff. A pre-hit2 becoming3 from this hit never retroactively gains ignore/spread.

### 6.1 Required local order

```text
Skill3 Damage
→ immutable hit/result and mandatory lifecycle settlement
→ Passive +1 on the actual primary recipient if the hit qualified
→ spread using already-frozen spreadEligible
```

Do not use positive Actual HP Damage as the gate. Primary State mutation still requires current ordinary recipient validity; a primary removed by mandatory lifecycle cannot supply a live stack for spread.

If spreadEligible and the primary **currently** has>=1 Mê Hoặc:

1. Remove **exactly1** Mê Hoặc from that primary under this explicit mechanic.
2. Query up to2 **distinct other currently legal enemy recipients**, excluding the primary, and choose with deterministic seeded RANDOM.
3. Grant **+1 to each** chosen recipient, preserving cap3 and ordinary State Admission.

Use all available when fewer than2; with none, only primary removal occurs. Recipient selection is a non-attack State settlement, not a copied primary Slot attack. No later substitution/reroll for a rejected grant. One source stack intentionally produces up to two recipient grants; it is not a conserved one-to-one move.

A recipient's2→3 grant creates its normal one Sleep attempt. Reducing stacks on an already sleeping primary never wakes that hard Sleep. Sleep/threshold cycles and terminal causes stay independently bound; no post-hit resnapshot or inherited attack Hit check.

## 7. Ultimate — Thế Giới Thứ Hai

**0 Damage.** Full-Rage auto-cast remains governed by global non-Leader law. Pink fog/world transformation is presentation only.

Create one source-owned **DREAM_WORLD** field/window. It lasts **3 later GLOBAL TURN_BOUNDARY events**. The immediate boundary closing the casting Natural opportunity does not decrement it; count the next3 global boundaries, including ordinarily valid global boundary origins. Source death or LEAVE_FIELD does not remove/pause it. It owns its independent lifetime through those boundaries; battle/instance termination remains ordinary cleanup.

### 7.1 Exactly one roll per Field Presence

At creation, every currently Field-Present gameplay unit gets **exactly one** seeded random draw from its side-relative finite effect-package pool. Mộng Yểm herself is allied while present.

Each **new Field Presence** entering while this exact instance remains active gets exactly one draw from it. Key processing by **field instance × exact Field Presence**, not merely Entity or Slot. Already processed presence receives no retry because an effect failed/expired/nothing changed. Never reroll per boundary or poll continuously. Actual leave followed by a genuinely new Presence can draw once again while the same field survives. Presence transitions/roll eligibility use coherent committed membership, not provisional placement.

For the source's Side:

- allies draw from **ALLY_DREAM_EFFECT_POOL**;
- enemies draw from **ENEMY_DREAM_EFFECT_POOL**.

Retain the field's source/Side relation anchor after source death/leave. Ordinary Side/recipient, package execution and admission semantics apply; no Authority bypass.

### 7.2 Sole unresolved content

**CONTENT_TBD / DESIGNER_POOL_DEFINITION_REQUIRED — exact finite pool entries/numbers.** Raw examples (allied ATK increase/Heal/Shield; enemy DEF reduction/Stun/Poison) are illustrative. They do not lock entries, coefficients, durations, weights, Authority or stack rules. Do not invent or execute defaults for them.

The structural operation is selection of **one typed effect package from a declared finite pool**, then ordinary execution. A future entry may compose a State, Heal, Shield or another already-supported bounded Effect package when explicitly authored. “Buff pool” does not require every entry to be a Buff State; Heal does not become a BUFF Tag. No Tag/Primitive is created in anticipation of a future entry.

Pool content blocks full executable Ultimate content only. Passive, Basic, all three Skills and field/window/once-per-Presence/random-package orchestration remain clarified and normalizable.

### 7.3 Effect lifetime and replacement

If a future package creates a persistent Buff/Debuff/State and declares no shorter duration, bind it to this field instance's **remaining lifetime** and remove it when the field ends. A shorter declared duration remains shorter. Immediate Heal/Shield/etc commit under their own semantics; do not retroactively undo a Heal or turn a Shield ledger entry into a Buff solely to bind it to field expiry.

Same-source Ultimate recast while active **REPLACES/REFRESHES** the source-family field:

- retire the old instance's field-bound persistent States with **replacement cause**, not natural expiry;
- create a fresh3-later-boundary instance;
- give each currently present unit one fresh roll from the new instance.

Never keep two simultaneous DREAM_WORLD instances from the same runtime Mộng Yểm. Different runtime sources remain distinct under current generic Field composition; same Character definition/name is not source equality. Failed required admission/replacement commits no partial retirement/new field/roll. Old processed-presence/expiry work never mutates the replacement instance.

## 8. Declarative normalization and semantic ownership

Canonical architecture navigation is [00_CANONICAL_INDEX.md](../Chuẩn%20hoá%20và%20gắn%20tag%20kit/00_CANONICAL_INDEX.md). Use current 04/05/06 profiles; Character data declares the values above and never names a Character-specific runtime service.

| Mechanic | Declarative composition / governing architecture |
| --- | --- |
| Basic / Skill3 mixed hit and Slot binding | 04§11.11/§16/§34.2A; TGT-008, HIT-002, DMG-002/003, RES-008; P-010–014/P-040–043. Resolve each attack owner's binding independently. |
| Qualifying landed-hit Passive | Direct Action/Effect ownership under TRG-013; shared hit/packet commit evidence, local Damage→State dependency. Positive ACTUAL_HP_DAMAGE is not its gate; components are not separate hit grants. |
| Capped, ordinary-cleanse-resistant stacks | Existing State stacks/dispel/parameters, protected before/after Snapshot/result and P-020/021/022 under STA-010/013; source/cycle/recipient retained for threshold and cleanup. |
| Below3→3 Sleep / hard one-opportunity CC | Existing threshold/Condition/finite graph plus CONTROL State, ACT-012/CLK-003. One transition attempt; no hit-wake clause. Normal-expiry-only linked cleanup, separate early/lifecycle causes. |
| Skill1 protection / refresh | 04§19.8 ordinary Hit probability modifier, factor0.50; HIT-002/003; one source-family State with REFRESH, later-own-opportunity duration3, CC-counted consumption. |
| Skill2 active SELF_SLEEP / growth | Separate field-scoped CONTROL State and battle-participant BATTLE_SCOPED count/contributions. ACT-012/CLK-003, 04§19/§21, P-021/P-030; once per later consumed slept grant, ADD_PERCENT ATK/WIL=0.07×earnedCount. Wake removes only control. |
| Skill2 all-Damage protection | 04§18A EXPLICIT_DAMAGE_RECEIVE_MULTIPLIER, ALL_DAMAGE, recipient SELF, factor0.50, active only with SELF_SLEEP; DMG-008/RES-006 final Shield-input phase. No FDR Tag or TRUE bypass. |
| Skill2 automatic wake | Existing stableHealthSettlement under 04§7.14/TRG-016 plus established activation check; current alive HP<=0.35×MaxHP, finite P-022 removal after mandatory lifecycle. |
| Skill2 manual wake | 04§19.9 exact-State removal input with requestKey MANUAL_WAKE_REQUEST; ACT-034/CLK-001 safe start/boundary, stale DISCARD and EXTERNAL_REQUEST cause. No combat Action. |
| Skill3 snapshot / ignore / spread | P-002/SnapshotSpec captures N_pre/sleep_pre once at cast; DamageSpec packet-local ARM/RES ignore0.30 under DMG-006; named local groups Damage→mandatory result/lifecycle→Passive→conditional remove1→seeded DISTINCT recipient grants. Spread has its own non-attack TargetSet, not primary Slot inheritance. |
| DREAM_WORLD lifetime / replacement | Existing field State owner distinct from source, later-global-boundary duration3 and instance-bound terminal graphs. Same-source family excludes cast/source-presence ID; atomic REPLACE retires old field-linked States and creates fresh duration/grants. |
| DREAM_WORLD package grants | 04§19.10/§72.1 finite typed pool, retained source Side, field instance×presence-cycle processing, seeded selected EffectPackageRef and ordinary finite Effect execution under POS-006/STA-010/014. CONTENT_TBD refs remain non-executable until pools are authored. |

Functional capabilities attach to their smallest actual owner: Damage components use existing DAMAGE/PHYSICAL_DAMAGE/WILL_DAMAGE; Skill3's qualifying packet owns PENETRATION; actual stack/control States use their declared classification/identity and existing DEBUFF capability where applicable; growth owns STAT_MODIFIER; the gameplay field owns FIELD. State classification/control, cleansability, cap, clocks, target selection, probability/receive phases, manual input and pool IDs are typed data/facets, not new Tags. No future pool HEAL/SHIELD/DAMAGE capability is inferred before an entry exists.

Architecture-level coverage is M-184–M-194 in 08, reusing prior mixed-hit/provenance, Slot, CC-clock, Shield, health/lifecycle, State-family/termination and battle-retention cases. These are regression specifications; no implementation/build test result is claimed. The only internal content still requiring designer authorship is §7.2's finite Dream pools.
