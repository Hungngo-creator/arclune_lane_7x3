# ARCLUNE — PHANES — CLARIFIED GAMEPLAY CANON

**Revision:** R2 — complete locked gameplay normalization, including per-child snapshots and proportional shared-recipient allocation.
**Status:** GAMEPLAY_CLARIFIED / ARCHITECTURE_NORMALIZED. Numeric metadata/adapters remain separate; not generated execution-ready Character data.
**Source:** current designer description and later #52 SSR Mage of `ý tưởng nhân vật 3.md`, after Nerovar. Raw adds Character/Ability labels only; mechanic prose is preserved. Latest explicit answers below govern gameplay; raw numbering is not runtime identity.
**Architecture base inspected:** actual merged main `13c11d4`, E.5/F.7/G.6/H.1/I.6. Three bounded extensions below are proposed E.6/F.8/G.7/I.7 until merged, not assumed merged capability.

## 1. Identity and presentation boundary

**Phanes**, SSR Mage; native Element unspecified, BASE_DEPLOYMENT_COST = TBD_BY_COST_BUDGET, not blocking this architecture normalization. Passive, Basic, three triggered Skills and Ultimate form a complete kit. Triggered Skill labels do not create extra manual/Natural Skill Actions.

Orbs are VFX for an owned counter/stat modifier and authored Damage contribution: no gameplay Entity/Actor/HP/targetability/Field Presence/SSI, Spawn/Despawn or Summon bonuses. “Cannot receive Damage” describes that non-Entity VFX, not immunity granted to Phanes. **Phanes cannot perform FOLLOW_UP attacks**; the Ultimate's authored BASIC_ATTACK children are non-Natural ordinary children, not Follow-ups. No Rank/Class-derived Authority.

## 2. Locked kit

### 2.1 Passive — Constellation of One / Nhất Thể Tinh Trận

At each **successful Ultimate activation**, create one orb-count unit before Basic1, capped **N=10**. Failed activation creates none; replay/resume never increments twice. Orb counter and its modifier are **BATTLE_SCOPED**, retaining identity/count across ordinary source field leave/Deck/death unless another explicit lifecycle law applies. Battle end releases them; redeploy/re-register does not reset/increment.

ATK and WIL each resolve as their otherwise resolved stat view **excluding this orb source-family**, multiplied by **1.05^N** once. The family's existing runtime source-owner + origin Passive + stat Effect-definition provenance identifies exclusion; exclude all its instances/stacks, not another Phanes/foreign modifier. Do not read own already-multiplied final output recursively, use additive1+0.05N, permanently mutate BaseStat, or reapply on each Snapshot. N bounded constant multipliers compose by product using existing State/stat operations, no POW Primitive.

### 2.2 Basic — source unnamed

Select and lock one legal enemy. At **each Basic start**, snapshot **Phanes ATK/WIL, orb countN, target CurrentMaxHP** once for that Basic. Two distinct packets on that same locked Entity:

- Main packet: PHYSICAL100% ATK + WILL100% WIL, one hit/Effect with typed components.
- Aggregate orb packet: PHYSICAL N×30% ATK + WILL N×30% WIL, one distinct hit/Effect; **N=0 creates no orb packet**.

Both use the same Basic-local snapshot and resolve in one **SIMULTANEOUS batch**, preserving **two committed Damage Results** and two displayed amounts. No ordinary Reaction or main-first/orb-first gameplay priority; imagery creates no autonomous orb attack Action. Each component uses its ordinary mitigation; no Guaranteed Hit/Shield Piercing inferred.

**Shared-recipient allocation:** after independent formula/mitigation/modifier calculation, allocate every eligible Shield layer's consumed budget proportionally to its remaining eligible packet/component demand. Ineligible components do not participate; source-contribution depletion follows SHP-002 separately. After Shield let R_main/R_orb be HP-bound demands and H recipient CurrentHP at the common calculation. If sumR<=H, ActualHP_i=R_i; otherwise ActualHP_i=H×R_i/sumR. Zero total demand allocates0. Overkill remainder is excluded. One net Shield/HP commit seals separate packet receipts before lifecycle. Numeric law preserves consumed Shield/removed HP bounds and uses no packet/list/Entity/Event rounding priority. Later Execute cannot rewrite allocation.

Invalid locked recipient is DROP_LOCAL / NO_RETARGET. The **immutable Basic result package** contains only committed Actual HP Damage of this Basic's direct main+orb, with orb sub-result kept distinct, and its captured target MaxHP denominator. Exclude Execute HP assignment, Shield/Overkill, Reaction/DoT/Mark/standalone Passive/other child Damage even sharing rootActionId.

### 2.3 Skill 1 — Terminal Ray / Chung Mệnh Quang

After the **entire Basic batch commit → mandatory lifecycle**, qualify only if **orb Actual HP Damage>0**, target is still active/lifecycle-valid, and its **current** HP<=5% **current** MaxHP. Shield absorption is not orb HP Damage. N=0 cannot qualify from a phantom orb result.

Revalidate locked target → pay **Side AE30** (or the exact Ultimate AE waiver) → consume one of **4 BATTLE_SCOPED uses** → send explicit DIRECT_EXECUTE request. Invalid target/missing AE/used cap produces no payment/use/Execute; clean failure closes locally and later Skills proceed. A waived AE charge does not waive conditions/cap/use.

Successful Execute commits HP0+DEATH_CONFIRMED **without the ordinary pre-DEATH HP_ZERO/Death-Prevention window**. Nerovar's ordinary HP_ZERO prevention cannot intercept it. Real Authority-bearing anti-death conflicts still undergo ordinary AUT adjudication; Execute grants no Authority bypass. Post-DEATH_CONFIRMED Revive/death-triggered Return may occur under their own law. Paid Cost/consumed use is not refunded after recovery or later denial; no fabricated Actual HP Damage receipt from Execute. This is a lifecycle settlement, not a new Natural Action.

### 2.4 Skill 2 — Radiant Reflux / Hồi Quang Phản Lưu

Let D=immutable Basic main+orb ActualHPDamage and M=that Basic-start target CurrentMaxHP. If **D/M>40%**, pay **Side AE10** and Heal Phanes **40%D**. Exactly40% does not qualify. No battle/turn cap. Failed AE closes locally, does not block Skill3. Full-HP Effective Heal0 does not change the causing package; Overheal DISCARD unless another explicit external mechanic consumes it under its law.

### 2.5 Skill 3 — Threshold Ascension / Việt Giới Thăng Hoa

Use the same immutable D/M, qualify **strictly>15%**, pay **Side AE5 per activation**, then request Rage **3×max(0,100D/M−15)** with **continuous linear fractional excess**.25%→30 Rage;25.5%→31.5; exactly15% no activation/charge. No battle/turn cap. Rage overflow is discarded; full Rage still pays AE5 for an otherwise qualifying activation, even if credited Rage0.

Qualifying provenance is direct main+orb Damage of **a Natural Basic** OR the two explicitly authored Basic children of **a Natural root Ultimate**. Those children remain non-Natural; this local outcome attribution grants no child SSI advance/Natural-action resource hooks. Do not include Reaction/DoT/Mark/passive/other-child Damage merely from shared ancestry/Attribution. Action lineage and Effect provenance remain distinct.

### 2.6 Ultimate — Twin Zenith / Song Cực Thiên Quang

Successful activation adds capped orb before child1. Lock **one enemy Entity for both sequential BASIC_ATTACK children**. Each is a distinct real non-Natural Basic with its **own child-start ATK/WIL/N/target-MaxHP snapshot**, so Basic2 may observe legitimately changed stats/MaxHP. Do not reuse one Ultimate snapshot for both children.

Each child resolves batch → mandatory lifecycle → local settlements **Skill1 → Skill2 → Skill3**, finishing its declared work before Basic2. Failed AE on any one settlement closes that dependency and permits later ones. There is no ordinary Reaction between main/orb, settlements or Basic1/Basic2 under the local AFTER_DIRECT_EFFECTS_COMPLETE hold; mandatory lifecycle always runs. Invalid locked target before Basic2: DROP_LOCAL / NO_RETARGET, no substitute enemy.

Waive **only the authored AE30/10/5 of these children's S1/S2/S3 activations**. Conditions, caps/use, readiness, foreign Costs and unrelated descendant Costs remain in force. Existing exact child/root/provenance guards and CostSpec.waiverPolicy express this, not a blanket root-wide free cast. Parent waits for exactly two children/linked work; neither is a Follow-up or a new Natural Action. No new Ultimate readiness/Rage policy is invented.

## 3. Independent composition and exact gap proof

| Locked input → composition attempted | Contract → current runtime owner | Exact verdict / smallest extension |
| --- | --- | --- |
| Capped battle orb counter, multiplicative ATK/WIL product excluding own input | State/StatModifier/COUNTER_REF → P-030, State/stat contribution/Snapshot owners | Counter/product REUSE. Merged baseline placeholder lacks whole-own-family exclusion law; final-stat self-read recurses, BaseStat rewrites lose foreign dynamic modifiers. Add §21 EXCLUDE_THIS_SOURCE_FAMILY / RES-007 through current contribution view and §61; no new stat manager/operator. |
| Same-recipient simultaneous main/orb, separate ActualHP receipts | ResolutionSpec/typed Damage/ResultRefs → RES-002, SHP-002/DMG-010 → Damage/Shield/Transaction/Result owners | RES-002 isolates calculations but does not allocate shared Shield/HP; SHP-002 allocates **Shield contributions**, a different axis. Independent commits double-spend or prioritize a packet. Add opt-in group sharedRecipientDamageAllocation PROPORTIONAL / RES-008, §31 existing transaction. No universal AoE default. |
| Direct Execute with no ordinary prevention but real AUT/recovery | SYSTEM_LIFECYCLE → P-060/P-062, DTH/AUT → Lifecycle/Authority/Transaction/Result owners | Ordinary lethal Damage/HP Loss opens prevention and supplies wrong Damage receipts. §77 lacks the direct-confirmation policy. Add §77.2 confirmationPolicy DIRECT_EXECUTE / DTH-008 and existing §84 routing; no new Primitive/Tag/Execute manager. |
| Immutable Basic package, local S1→2→3, actor behavior ban, linear Rage and AE-only waiver | Conditions/Trigger/Cost/Heal/Resource/ResultRefs/Action restrictions → TRG-013, ACT/CST/HEL/DMG-020/021 → current owners | REUSE typed package/provenance/denominator refs, terminal local DAG, finite arithmetic and exact waived Cost definitions. Failed dependency is terminal, not suppression of later Skills. |
| Same-target sequential child Basics with independent snapshots | TargetRef/ActionSpec childCostPolicy/childSnapshotPolicy/Resolution → ACT-020/021/023/032 + SNP/RES → Action/Target/Snapshot/Cost/DAG owners | REUSE. Do not turn shared root into root-owned direct Effect, grant Natural status or blanket cost freedom. |

Each new plan preserves owner/origin, lifetime/transaction key, commit barrier and replay identity. Deferred EXECUTE Tag/EXECUTE_TARGET Primitive candidates remain deferred; no independent new capability query/atomic operation was proved. No Character-specific runtime, generic priority or callbacks.

## 4. Remaining items

**No unresolved internal gameplay choice.** Native Element/Cost Budget and unsupported Mode adapters are **UNRESOLVED / NOT BLOCKING** for this work. Foreign Authority protections, numeric precision profiles and unrelated same-window candidates need their applicable explicit law; Phanes does not define a global default or ordering for them. Missing numeric support rejects unsupported executable allocation rather than inventing packet priority.

## 5. Impact audit across 00–08

| File | Phanes decision |
| --- | --- |
| 00 | PATCH source/normalization navigation and versions. |
| 01 / 02 / 03 | NO CHANGE: existing meanings/Damage/Stat/Heal/Resource/lifecycle operations; no orb Entity, new Tag or Primitive. |
| 04 | PATCH bounded own-family baseline, lifecycle confirmation and opt-in shared-recipient allocation/lowering/validation. |
| 05 | PATCH RES-007/008, DTH-008 and ordinary death-path qualification. Existing other profiles preserved. |
| 06 | PATCH through current §31/61/84 owners and pending/receipt persistence, no new manager. |
| 07 | NO CHANGE: existing SSI/Side AE/Rage ownership; no automatic other-Mode conversion. |
| 08 | PATCH M-057–M-060 and M-062/M-065 for allocation, per-child snapshots, receipts, thresholds, waivers, replay/Authority and rejection. |

## 6. Final six-pass and adversarial audit

Six passes: (1) all formulas/gates/caps/lifetimes/snapshot/target/result bindings match latest answers; (2) retry existing composition and retain only the three bounded gaps; (3) correct Schema/Contract/runtime namespace/owner/lifetime, no collisions; (4) attack N0/N10, HP/Shield exhaustion, type-specific layers, packet permutation, thresholds5/15/40, full Rage, missing AE, death/recovery, child2 invalidity, same-root foreign Damage, repeated activation/replay; (5) latest direct-Execute/per-child/proportional answers override older pending tables; (6) actual diff/base/refs/declarative coverage checked, no build/game tests.

Same-author second audit corrected two plausible errors: proportional Shield **source depletion** does not prove incoming-packet allocation, and a target shared by two children does not imply a shared stat/MaxHP snapshot. Execute terminal dedup uses stable original request identity before opening another death context, including post-Revive with unchanged lifeSerial; releasing a receipt cannot permit re-execution. No executable validation result is claimed.
