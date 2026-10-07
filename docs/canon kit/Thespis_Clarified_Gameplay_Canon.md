# ARCLUNE — THESPIS — CLARIFIED GAMEPLAY CANON

**Revision:** R0.
**Status:** PARTIALLY_CLARIFIED / NORMALIZATION_BLOCKED_BY_GAMEPLAY_DECISIONS.
**Source:** designer-supplied `RAWKIT / NOT CANON`, preserved as `84) THESPIS` at the end of root `Ý tưởng nhân vật 4.md`.

This document preserves the supplied gameplay and identifies decisions the source does not settle. It does not promote proposed answers into locks or claim an executable normalized kit. Later explicit designer answers supersede the corresponding source wording.

## 1. Identity and scope

- Male, SSR, Rank Mult **1.10**; Class **Summoner**; native Element **Dark**.
- Role: Attrition Summoner / Replacement Actor / Comeback Utility.
- Signature: **“Diễn viên có thể chết. Vai diễn thì không.”**

An Understudy is a new, real Summon playing a restricted Basic profile. It does not revive or clone the deceased Character, inherit that Character's identity, host its Chân Ngã, or retrieve it from a Luân Hồi waiting window. Native Dark Element does not decide a Damage component's PHYSICAL/WILL/TRUE type. SSR and theme do not grant Authority.

The kit's Natural Action counts belong to its applicable Natural-Action Mode profile. They are not global TURN_BOUNDARY counts or an invented conversion into seconds.

## 2. Passive — No Role Dies With Its Actor / Vai Diễn Không Chết Cùng Diễn Viên

While Thespis is on the field, an allied **Character with Chân Ngã**, excluding **Leader and Summon**, reaching **DEATH_CONFIRMED** creates a Role Record from that Character's Basic Attack. HP_ZERO, Death Prevention, ordinary field leave and despawn do not satisfy this trigger.

A Role Record carries only:

- the Basic's **target pattern**;
- its **Direct Damage Profile**.

It excludes Buff, Debuff, Mark, Heal, Shield, CC, Passive triggers, Cost, Rage interactions, Authority, the deceased person's identity and every child Action. Role correspondence is not ownership of a deceased Chân Ngã or a Revive link.

Thespis retains at most **2 Role Records**. A third replaces the **oldest** retained Role. The source does not define an order among simultaneous qualifying deaths; §8 preserves that decision.

Immediately after Death resolution, if Thespis has fewer than **2 Understudies** and the just-vacated Position is legal for summoning, he automatically summons an Understudy into **that Position**, with **no AE Cost**. Record creation and summon admission are distinct: a legal Role does not prove the death Position has been released by its existing lifecycle owner. Occupancy/reservations follow current Position and materialization law; this kit grants no stated override.

## 3. Understudy — Kẻ Thế Vai

An Understudy is `entityKind=SUMMON`:

- no Chân Ngã and no Luân Hồi participation;
- no Rage, Skill or Ultimate;
- eligible only for Natural Action + Basic Attack;
- cannot Revive;
- at most **2** active Understudies owned by Thespis.

Creation snapshots from Thespis:

| Initialized stat | Fraction of Thespis's corresponding stat |
| --- | --- |
| Max HP | 45% |
| ATK | 55% |
| WIL | 55% |
| ARM | 55% |
| RES | 55% |

The source does not choose current versus baseline stat inputs, starting Current HP, or the remaining Summon-profile stats. Copying a Role does not add inheritance of the deceased Character's Class, Element, Rank, stats or Combat Definition.

The Understudy's Basic uses its Role's direct Damage coefficients at **0.70 times** their original values, evaluated with **the Understudy's own stats**:

- `100% ATK + 100% WIL → 70% ATK + 70% WIL`;
- `150% ATK + 80% WIL → 105% ATK + 56% WIL`.

Keep the Direct Damage Profile's Damage types. Strip every non-Damage Effect and child Action. Scaling coefficients is not copying final Damage receipts, post-mitigation amounts or the dead actor's stats.

If the source Basic has **no Direct Damage**, its Role uses fallback **70% ATK + 70% WIL**, single target. **Blank Role** uses the same numeric single-target profile. Component types for these fallback/Blank formulas remain undecided; absence of direct Damage is not permission to discard an unusual but damaging Basic into fallback.

An Understudy lasts at most **3 actually-performed Natural Actions of that Understudy**, then **despawns**. The exact decrement/completion/expiry checkpoint is not yet locked. Skill1 Follow-up consumes no unit. Despawn is not DEATH_CONFIRMED and does not trigger a Summon-death listener.

Reviving the source Character does **not** remove an existing Understudy. The Understudy was never that Character.

When Thespis leaves the field, **all his Understudies despawn and his Role Records are erased**. Cause-specific retention, cross-instance ownership and in-flight child validity must not be guessed beyond this stated cleanup (§8).

## 4. Basic — House Lights Down / Hạ Đăng

Attack **one legal enemy** for **100% WIL + 100% ATK**, with no secondary Effect. The source does not specify the component types; Dark native Element does not resolve them.

Attack-owner target binding follows current **TGT-008**: an otherwise undeclared attack owner defaults independently to Position binding with locked coordinates and current-occupant resolution. Reusing another Basic's target/profile data does not inherit an Entity-tracking exception or Guaranteed Hit. Any conflicting explicit source pattern needs resolution before lowering that Role.

## 5. Skills

### 5.1 Take Your Cue / Đến Lượt Ngươi

**AE15**. Legal only when Thespis has at least one Understudy.

Select the Understudy with **lowest remaining lifetime**; if tied, choose **lowest HP%**. A tie remaining after both comparisons is unresolved.

The selected Understudy immediately performs **one real Basic Attack as a Follow-up**, using its current Role:

- Basic identity belongs to this Understudy's Action; Thespis's outer Action remains Skill1;
- no Understudy Natural Action opportunity is consumed;
- no decrement of its three-Natural-Action lifetime;
- no class AE from this Follow-up;
- no Summon Rage.

This is not a child Action copied from the dead Character. The dead Character's triggers, passive, identity and resource laws remain excluded. Child validity, Cost settlement and local-failure policies await §8.

### 5.2 Understudy, Take the Stage / Kẻ Thế Vai, Lên Sân

**AE20**. Requires a legal empty allied Position and fewer than **2** Understudies.

Prefer the **newest retained Role not currently being played by an Understudy**. If every retained Role is already being played, or no ally has died to supply a Role, create an Understudy with **Blank Role**.

Use **normal Summon placement** in the applicable Mode. This Skill adds no special placement rule. Normal placement does not mean renderer-empty occupancy, Deck deployment, an extra Natural Action, or bypass of reservations.

The source does not yet lock fixed versus live Role binding, the handling of an evicted-but-still-played Role or after-payment placement failure.

### 5.3 Exit to Applause / Rời Sân Trong Tiếng Vỗ Tay

**AE15**. Select the Understudy with **lowest remaining lifetime**; any tie rule is unresolved.

It **despawns**, without DEATH_CONFIRMED or a Summon-death trigger. **Then** Heal allied Leader and **one allied Character with lowest HP% outside Leader**. If no second legal Character exists, Heal only Leader.

Each recipient's requested Heal is:

`0.60 × Thespis.WIL + 0.15 × departingUnderstudy.CurrentHP`

Overheal is **DISCARD**. The basis is remaining Current HP, not Max HP, Shield, nominal Damage or overkill. The despawn must not erase a required HP input before it is captured at the eventually declared checkpoint.

Whether Thespis is included in the second-recipient pool, equal-HP tie policy, recipient selection timing, simultaneous versus sequential Heal, source snapshots and failure if no valid Understudy remains are unresolved.

## 6. Ultimate — The Curtain Rises on the Missing / Màn Nhung Mở Cho Kẻ Vắng Mặt

At cast, inspect at most **2 retained Roles**. For each with no corresponding Understudy on the field, summon its Understudy **if a legal Slot and capacity below2 remain**.

If **both** the Role store and Understudy set are empty, create **one Blank Understudy**, subject to legal placement/cap. The source does not request a Blank simply because a nonempty Role store cannot produce a missing Role.

**After summoning**, all existing Understudies:

- reset lifetime to **3 Natural Actions**;
- receive Shield of **20% their own Max HP**.

The Shield lasts at most until that Summon despawns or the Shield is broken. There is no stated additional Natural-Action expiry. Contribution stacking/replacement, MaxHP sampling, no-slot ordering and cast legality remain unresolved.

Ultimate causes **no Damage, Revive, Chân Ngã transfer or waiting-window retrieval**. Ordinary Ultimate admission/resource laws apply; no AE Cost or Rage exception is inferred from omission in this source.

## 7. Presentation

A mask appears at the vacated Position and a black-clad Understudy enters through an unseen curtain. Props and gestures evoke the restricted Role. No soul transfer occurs. The Understudy remains a distinct actor instead of transforming into the deceased Character.

## 8. UNRESOLVED / NEED USER DECISION

These choices block their dependent normalization. Proposed answers in a task/question/PR are not locks until explicitly accepted.

1. **Profile extraction:** base/native versus current Combat Definition, temporary-modifier exclusion, preserved direct-hit count/order/batching, unsupported deceased-resource/passive dependencies, scaling of nonstandard terms and PHYSICAL/WILL types for Thespis Basic/Blank/fallback.
2. **Role correspondence:** which Role automatic spawn binds, immutable versus live binding, survival of a playing Role after store eviction, and whether repeated qualifying deaths of the same revived Character create distinct records.
3. **Death cohort:** ordering for newest/oldest and scarce cap, and whether Thespis dying in that same cohort prevents recording/spawning. Event/entity/Slot/list order supplies no default.
4. **Placement:** exact post-lifecycle spawn checkpoint, failed auto-spawn/no-retarget/no-retry, ordinary placement completion/failure, and priority among missing Ultimate Roles when capacity is insufficient. A death-waiting reservation is not already a vacated legal Slot.
5. **Initialization and lifetime:** current/baseline stat snapshot and timing, starting HP, completed versus merely started actual Natural Actions, and the expiry boundary after Action3. Follow-up is already explicitly excluded.
6. **Selector completion:** residual Skill1 ties, Skill3 lifetime ties, second Heal recipient membership (including Thespis), equal HP% and recipient selection checkpoint.
7. **Dismiss/child settlement:** HP/WIL capture, Heal batching, no-Understudy admission, invalid locked summon/recipient, no retarget, no retry/refund and in-flight work when source ownership ends.
8. **Ultimate:** newest/oldest missing-Role processing, new-summon inclusion, lifetime reset checkpoint, add/replace/refresh Shield, sampled MaxHP, and behavior/admission with no Slot/cap.
9. **Ownership/termination:** Field-Presence/Combat-Instance scope, all-cause LEAVE_FIELD cleanup/reentry, ordinary Understudy death versus non-death despawn, cap release and after-Cost invalidation.

## 9. UNRESOLVED / NOT BLOCKING FOR CLARIFICATION

- Base Deployment Cost, numeric Character baseline and remaining Understudy stat/resource/Class/Element profile. Known SSR/Summoner/Dark metadata is retained for Thespis; it does not fill Summon metadata.
- Future external Basic profiles whose direct Damage cannot be detached from excluded source-only mechanics. Such content needs explicit semantics and validation before it can be accepted as an executable Role; fallback currently applies only to no-Direct-Damage Basics.
- Exploration/Defense real-time redesign, unsupported Mode adapters and global priority among unrelated Reactions. No kit-local decision supplies a global default.

The second item can become blocking if a supported Role source in the current normalization depends on it. “Not blocking” is not a blanket claim that every Basic is projectable.
