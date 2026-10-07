# ARCLUNE — THESPIS — CLARIFIED GAMEPLAY CANON

**Revision:** R1.
**Status:** GAMEPLAY_CLARIFIED / ARCHITECTURE_NORMALIZED.
**Source:** designer-supplied `RAWKIT / NOT CANON`, preserved as `84) THESPIS` in root `Ý tưởng nhân vật 4.md`; latest explicit **THESPIS FINAL GAMEPLAY LOCK** supersedes all nine R0 unresolved/proposed groups and conflicting raw shorthand.

## 1. Identity and scope

Male; **SSR**, Rank Mult **1.10**; **Summoner**; native Element **Dark**. Role: Attrition Summoner / Replacement Actor / Comeback Utility.

**“Diễn viên có thể chết. Vai diễn thì không.”**

An Understudy is a real independent Summon executing a restricted Role projection. It does not clone a Character or Ability object, inherit the deceased Character's identity/Class/Element/Rank/Authority/Chân Ngã, revive that Character, or retrieve anyone from a Luân Hồi waiting window. Dark is Thespis's native Element, not a substitute for Damage component types.

Role store, active Understudy ownership and cap are scoped to **this Thespis Entity × Combat Instance × Thespis Field Presence**. Every actual **LEAVE_FIELD** clears retained Roles, despawns all owned Understudies by owner-cleanup cause and clears active-cap accounting. Returning/redeploying starts with **0 Roles and 0 Understudies**. Temporary VFX absence without LEAVE_FIELD does not invoke cleanup. DEATH_CONFIRMED alone is not an alias for LEAVE_FIELD: cleanup follows only the actual resulting presence transition.

If cleanup makes an Understudy invalid before its pending source-dependent Action/Effect commits, that branch fails locally: no source substitution or refund of already-paid outer Cost. Already committed Damage/Heal/results remain committed. A stale pending branch cannot bind a later Field Presence.

## 2. Role projection

### 2.1 Authoritative source and whitelist

At each qualifying allied **DEATH_CONFIRMED**, use the Basic **FORM/Combat Definition authoritative for that Character at that death checkpoint**. Do not bake temporary runtime modifiers into the Role.

Preserve only:

- target pattern and explicit target-binding semantics belonging to that **exact Basic attack owner**;
- direct Damage component structure/types;
- direct hit count and sequential/simultaneous grouping;
- projectable direct-Damage formulas.

Exclude Buff, Debuff, Mark, Heal, Shield, CC, Passive triggers, Cost, Rage interactions, class/resource regeneration, Authority, deceased identity, Chân Ngã and child Actions. Exclude Counter/Reaction/Follow-up behavior outside that Basic's direct Damage profile. Guaranteed-Hit behavior is excluded **unless explicitly part of the preserved attack targeting profile**; that exception preserves only its declared targeting meaning, never Authority inheritance.

This is a restricted declarative projection. It is not an invocation of the deceased Basic Action object, an arbitrary callback, or a copy of final Damage receipts/post-mitigation values.

### 2.2 Formula remapping and fallback

Multiply **all projectable numeric coefficients** of preserved direct Damage by **0.70**: `100% ATK → 70% ATK`, `150% ATK → 105% ATK`, `80% WIL → 56% WIL`.

Semantically valid generic source-stat reads of **ATK/WIL/ARM/RES/MaxHP/CurrentHP** read the Understudy's corresponding authoritative stats at the preserved formula's declared evaluation/snapshot checkpoint. They never read the deceased actor's values. Projectable typed target/world-relative reads remain with their declared bindings.

A formula depending on excluded deceased Rage/private Passive stacks/private resources/state identity/Character-specific callbacks/unavailable child results is **unsupported / REQUIRED_EXPLICIT** for executable normalization. Do not translate it into a convenient formula or silently replace a damaging unsupported Basic with Blank.

Fallback applies **only if the source Basic genuinely has NO Direct Damage**. Fallback and Blank are single-target **one-hit** profiles with two components:

- **PHYSICAL = 70% ATK**;
- **WILL = 70% WIL**.

Thus `100% ATK + 100% WIL → 70% ATK + 70% WIL`, and `150% ATK + 80% WIL → 105% ATK + 56% WIL`, using the Understudy's own stats and preserved component types. Two components do not create two hits.

### 2.3 Creation identity, retained cap and frozen binding

**Every qualifying death creates a NEW Role Record**, including the same trueSelfId dying again after valid Revive. Role identity is **record creation identity**, not the deceased identity or equality of target/Damage profile. Two identical projections may be two distinct retained Roles.

Retain at most **2** Roles. Each new Role enters the store; creating a third evicts the **oldest** retained Role.

At successful Understudy creation, bind/freeze its Role projection permanently. An automatic Understudy binds the Role created by **that exact death**. Evicting a Role from the store does not change an existing Understudy's Basic or switch it to a newer Role. Immutable Role data held by a live Understudy survives store eviction until that Understudy dies/despawns.

**Retained Role store ≠ live Understudy Role ownership.** An evicted-but-played Role does not count against retained-cap2. Exact retained Role identity, rather than profile equality, determines whether it is represented by a live Understudy.

## 3. Passive — No Role Dies With Its Actor / Vai Diễn Không Chết Cùng Diễn Viên

Qualifying subject: allied **Character with Chân Ngã**, excluding **Leader and Summon**, reaching **DEATH_CONFIRMED** while Thespis is on the field. HP_ZERO, prevention, ordinary field leave and despawn do not qualify.

### 3.1 Whole-cohort decision and local order

If Thespis himself reaches DEATH_CONFIRMED in that **same Death Cohort**, create **NO Role and NO automatic Understudy** from any member of that cohort. Do not partially process earlier death Events. Existing cleanup still follows §1's actual LEAVE_FIELD rule.

If Thespis survives, use **one deterministic seeded-random permutation local to this Thespis cohort settlement** over qualifying deaths. It determines Role creation order, oldest/newest order among same-cohort Roles, cap2 eviction and scarce automatic Understudy capacity. Entity ID, Slot, list/Event order and incidental iteration are not priority. This explicit local ordering does not establish global Reaction/death priority.

For each death in that permutation:

1. Create its NEW Role.
2. Insert into retained store and evict oldest if needed.
3. Attempt automatic summon of **that new Role** into **that death Position**.

A successful earlier Understudy keeps its frozen Role even if later members evict that Role in the same cohort.

### 3.2 One-shot exact-Position automatic summon

After qualifying death/lifecycle resolution and Role creation, attempt exactly the deceased Character's death Position, with **no AE Cost**. Success requires below active-cap2 and a Mode-legal, currently materializable **truly empty** Position. It cannot be claimed by Revive, death-waiting/Luân Hồi lifecycle ownership, temporary absence or another deployment/materialization transaction. Renderer-empty is insufficient.

If unavailable/illegal/full-cap: **local summon failure**, retain the Role normally, **NO alternate Slot, NO wait, NO pending retry**. This is a one-shot attempt for that death. Record creation is not rolled back by placement failure; normal later Role eviction still applies.

## 4. Understudy — Kẻ Thế Vai

`entityKind=SUMMON`; no Chân Ngã, Luân Hồi participation, Rage, Skill or Ultimate; cannot Revive. It has Natural Action + Basic Attack. At most **2 currently live/materialized owned Understudies**; dead/despawned entities release capacity at ordinary terminal removal, not merely at projected HP_ZERO.

### 4.1 Successful materialization initialization

Snapshot Thespis's authoritative **CurrentMaxHP/ATK/WIL/ARM/RES** immediately before materialization at the initialization checkpoint. For Skill2/Ultimate, required spawning Ability Cost transaction must first be terminal; Passive has no AE payment.

| Initialized stat | Formula |
| --- | --- |
| MaxHP | 45% Thespis CurrentMaxHP |
| ATK | 55% Thespis ATK |
| WIL | 55% Thespis WIL |
| ARM | 55% Thespis ARM |
| RES | 55% Thespis RES |

Start **CurrentHP = initialized MaxHP**, at full HP. Genuine current temporary stat modifiers on Thespis affect this creation snapshot; later Thespis changes do not live-update existing Understudies. This does not freeze the Understudy's own ordinary stat/State mechanics. Other stats/resources use the generic Summon profile when defined; no invented Character-specific defaults.

### 4.2 Lifetime and terminal causes

Start **remainingNaturalActions=3**. Decrement once at **that Understudy's ACTION_COMPLETED**, only for an actually-performed Natural Action. CC-lost opportunity, Follow-up, Counter, Reaction and non-Natural child Actions do not decrement.

Its third actual Natural Action fully completes; remaining becomes0, **then DESPAWN**. Expiry emits no DEATH_CONFIRMED and no Summon-death trigger. Skill3 dismissal and Thespis owner LEAVE_FIELD cleanup are also non-death despawn causes.

Ordinary lethal HP/lifecycle can instead produce **DEATH_CONFIRMED for the Summon**, enabling explicit Summon-death listeners, followed by ordinary Summon removal. It still has no Chân Ngã/Luân Hồi/Revive. Never alias these death and non-death causes.

Reviving the original Character does not remove an Understudy. Its frozen Role and separate actor identity remain intact.

## 5. Basic — House Lights Down / Hạ Đăng

One legal enemy; **one hit**, components **PHYSICAL100% ATK + WILL100% WIL**, no secondary Effect. It uses ordinary otherwise-undeclared **POSITION/SLOT** binding.

Each projected Role Basic independently preserves the source Basic's explicitly scoped target pattern/binding; otherwise it resolves to POSITION/SLOT under **TGT-008**. An Entity-tracking Role grants no such exception to another Role, sibling Action, Thespis Basic, Blank/fallback or parent Skill. Parent Thespis target binding does not propagate to the Understudy child. Every executable attack owner resolves its own binding and movement-sensitive recipient checkpoint.

## 6. Skills

### 6.1 Take Your Cue / Đến Lượt Ngươi

**AE15**; admission requires at least one valid live owned Understudy. Select **lowest remaining lifetime → lowest current HP% → deterministic seeded RANDOM among exact residual ties**. Freeze that Understudy's identity for the cast.

After Cost commit, it performs **one real BASIC_ATTACK Follow-up Action** using its permanently bound Role. The child is **non-Natural**, consumes no Natural opportunity/lifetime, grants no class Action AE and has no Summon Rage. The outer Thespis Action remains Skill1. The dead Character's Basic Action/triggers/resource laws are never invoked.

Selected Understudy invalid before execution: **local child failure, NO reselection/other Understudy, NO refund** of committed Thespis AE. Ordinary enemy targeting still belongs to that child's own resolved Role profile.

### 6.2 Understudy, Take the Stage / Kẻ Thế Vai, Lên Sân

**AE20**. Admission requires **fewer than2 live Understudies** and at least one legal ordinary Summon Position. Player/Mode selects placement by normal Summon law; no special geometry.

Choose the **NEWEST retained Role with NO live Understudy bound to that exact record identity**. If none exists because every retained Role is represented, or the store is empty, use Blank. An Understudy playing an evicted Role does not represent any currently retained Role by profile equality.

Freeze the selected Role and intended placement through ordinary admission/transaction semantics. If Cost commits but Slot/cap/placement becomes stale before materialization: **local spawn failure, NO retry, alternate Slot, alternate Role or refund**. A selected Role's store eviction is not a live-binding switch.

### 6.3 Exit to Applause / Rời Sân Trong Tiếng Vỗ Tay

**AE15**; admission requires at least one valid live owned Understudy. Select **lowest remaining lifetime → deterministic seeded RANDOM on ties**. Do not insert HP% as a tie criterion. Freeze selected Understudy.

Immediately before despawn settlement, capture immutable **departing Understudy CurrentHP + Thespis current WIL**, and establish/lock the Heal recipients at that checkpoint. Then **successful despawn → Heal**. Invalid selected Understudy before despawn commit means **local effect failure, NO reselection, NO Heal, NO refund**.

Recipients:

- **A:** allied Leader if currently legal.
- **B:** one living allied **Character outside Leader**, lowest HP%; includes Thespis if he is not Leader and is legal; excludes Summons, dead/waiting entities and Leader. Exact lowest-HP% ties use deterministic seeded RANDOM.

No B: only A. Invalid/missing Leader skips A; already-selected valid B may still Heal. B invalid after lock skips B with **NO retarget**. The two branches are independent.

One **SIMULTANEOUS Heal batch**; every valid recipient gets the same requested amount:

`0.60 × snapshotted Thespis.WIL + 0.15 × snapshotted departingUnderstudy.CurrentHP`

Overheal **DISCARD**. Retain captured HP after despawn; do not reconstruct from MaxHP/Shield/damage or re-read a removed entity. Ordinary recipient Heal admission/modifiers apply.

## 7. Ultimate — The Curtain Rises on the Missing / Màn Nhung Mở Cho Kẻ Vắng Mặt

Ordinary root Ultimate Cost/readiness applies. Child summon operations have **no AE Cost**. Ultimate does not cause Damage, Revive, Chân Ngã transfer or waiting-window retrieval.

### 7.1 Admission and cast context

Activatable only if at least one holds at admission:

- a live owned Understudy exists to reset/Shield;
- a missing retained Role can presently materialize with legal Slot/cap;
- Role store and live Understudy set are both empty, and one Blank can legally materialize.

Otherwise **not legally activatable**. A stored Role alone does not authorize a no-op Ultimate. Read-only legality probing does not spawn or spend RNG/Cost.

A Role is missing only if no live Understudy is bound to its **exact record identity**. Establish current retained Roles and empty-store/empty-Understudy facts in the cast context. Process missing Roles **NEWEST first**, using §3's declared order for same-cohort recency. Freeze each intended Role/placement through ordinary transaction semantics. Use normal Mode placement, with no alternative Role/Slot after invalidation.

### 7.2 Spawn attempts and local failure

For each processed missing Role, attempt materialization only with legal Slot and remaining cap2. Permanently bind each new Understudy to that Role. Stop new spawning when capacity/placement prevents another summon; **NO pending retry** for skipped Roles.

If both store and live Understudy set were empty at cast-context establishment, attempt **exactly one Blank**, subject to normal placement/cap. No Blank because a nonempty Role store's spawn failed.

After admitted root Cost/readiness commits, a planned branch's stale Role/Slot/cap/placement fails **locally**, with **NO retry, alternate Role/Slot or refund**. Other valid branches continue. A failed spawn does not prevent reset/Shield on surviving existing Understudies.

### 7.3 Final live-set reset and Shield

After **all spawn attempts are terminal**, take the **final live Understudy set owned by this Thespis**, including new materializations. For each:

- **remainingNaturalActions := 3**, assignment rather than +3;
- add **one NEW Standard Shield contribution =20% that Understudy's CurrentMaxHP**, read at this Shield-grant checkpoint.

Each Ultimate contribution keeps its own identity. It does not replace/refresh/merge with an old Ultimate contribution. Multiple contributions coexist under the ordinary Standard Shield ledger; **no Thespis-specific cap**, with existing generic laws still applicable.

Shield has **no additional Natural-Action duration**. It ends on depletion/break, ordinary Shield removal, or recipient Understudy death/despawn/other loss of Shield ownership. Lifecycle cleanup preserves the real terminal cause; it is not fabricated depletion. Reset of lifetime does not refresh old Shield identities.

## 8. Presentation

A mask appears at the vacated Position; a black-clad Understudy steps through an unseen curtain. Props/gestures evoke a restricted Role without transforming into the deceased person. No soul transfers. The Understudy is a new actor, not the old actor returned.

## 9. UNRESOLVED / NOT BLOCKING

Base Deployment Cost, full numeric Character budget, remaining generic Summon stats/resources and future Mode adaptations remain unspecified. Thespis's known SSR/Summoner/Dark metadata does not supply deceased or Summon metadata.

A future external Basic dependent on excluded deceased-only semantics remains **unsupported / REQUIRED_EXPLICIT** when encountered. Do not invent translation or Blank-fallback a damaging Basic. This boundary does not reopen the internal locks above or claim all future Basics are executable.

## 10. Declarative semantic bindings

These are Character-owned data/composition bindings, not executable numeric roster data. Exact formulas/checkpoints/failure laws in §§1–7 remain authoritative.

| Authored component | Binding and semantic capability |
| --- | --- |
| Role data | 04§16.3A `BASIC_DIRECT_DAMAGE`, scale0.70, death-checkpoint Basic FORM input, executing-Understudy stat reads, exact-owner targeting, explicit final Blank/fallback. Payload uses immutable SnapshotRef; record creation uses distinct StateRef, with neutral owner/presence-scoped membership and separately frozen actor binding. No Functional Tag for record/projection/recency. |
| Role retention | Existing owner-scoped State/counter records supply explicit creation recency; atomic insert/oldest-eviction under RES-005 keeps retained-cap2. Query exact record creation identity for representation; never dereference an evicted live State to obtain an actor's frozen profile. |
| Passive | 04§7.17 complete-cohort settlement, allied Character/Chân Ngã/non-Leader/non-Summon death-entry filters anchored to SELF, whole-owner-death gate, one seeded permutation and create→retain/evict→exact-Position Spawn entry graph. Only actual Spawn nodes carry **SUMMON**. |
| Understudy materialization | SpawnEntitySpec/P-051, declared Summon definition with Basic-only projection override, current pre-materialization stat Snapshot, no trueSelfId/Rage/Revive, source-owned live-cap2 guarded at materialization. Derived live-cap query uses authoritative ownership/lifecycle, not another mutable occupancy ledger. |
| Thespis Basic / Blank | **DAMAGE + PHYSICAL_DAMAGE + WILL_DAMAGE** on their one-hit Damage nodes. BASIC_ATTACK identity, target binding and hit count are facets. |
| Projected Understudy Basic | **DAMAGE** plus only preserved component capabilities from the exact 02 registry (e.g. PHYSICAL_DAMAGE/WILL_DAMAGE/TRUE_DAMAGE when present). Damage/Target/Resolution plans belong to each receiving Basic owner; no COMBAT_DEFINITION_INHERITANCE or Guaranteed Hit is inferred from projection alone. |
| Skill1 | Existing RequestAction/P-001: locked Understudy actor, real BASIC_ATTACK/FOLLOW_UP, non-Natural, no child class AE/Rage/lifetime tick, child validity/no-refund policy. Outer Skill does not inherit child Damage identity or targeting permission. |
| Lifetime / removal | Existing State/counter + `postActionSettlement` under ACT-033: owner actually-performed Natural ACTION_COMPLETED decrements once; zero→P-053 after completed Action, before Natural handoff. Explicit clock overrides CLK-003's CC-opportunity default. Death/expiry/dismissal/owner-cleanup causes remain distinct. |
| Skill2 | Existing admission/Cost/Target/Spawn graph, exact newest-unrepresented record and normal Mode placement; **SUMMON** only on successful materialization branch. Frozen Role/placement and local no-retry/no-refund law. |
| Skill3 | Existing ordered metric selection, Snapshot/P-053 success dependency, one RES-002 Heal batch/P-044/045; **HEAL** only on Heal nodes. Departing HP and WIL SnapshotRefs survive despawn through their consumers. |
| Ultimate | Existing admission/Cost + newest-first finite Spawn graph, terminal-spawn dependency→final live query→P-021 assignment3 + separate P-046 Shield creation. **SUMMON** on Spawn, **SHIELD** on Shield grants; each ledger contribution is independent. No Damage/Revive/Chân Ngã operation. |
| Owner leave | FIELD_PRESENCE_SCOPED State/owned-entity cleanup under exact Entity×instance×presence lifetime; P-022/P-053 retire membership/actors and uncommitted source-dependent work, preserving committed results and replay identities. |

Skill1's ordered selector keys are `[remainingNaturalActions ASC, currentHP/currentMaxHP ASC]`; Skill3's are `[remainingNaturalActions ASC]`. Existing P-012 ordered selection/TGT-007 applies seeded RANDOM only to exact residual ties in one selection view. Heal B independently uses lowest HP%/random ties at its declared settlement checkpoint. These are structured State/HP reads, not new Tags, Character callbacks or implicit Slot/ID ordering.
