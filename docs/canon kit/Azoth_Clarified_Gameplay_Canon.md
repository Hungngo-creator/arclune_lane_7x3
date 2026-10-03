# ARCLUNE — AZOTH — CLARIFIED GAMEPLAY CANON

**Revision:** R1 — newest raw #56 replacement and complete designer-locked gameplay normalization.
**Status:** GAMEPLAY_CLARIFIED / ARCHITECTURE_NORMALIZED. Unspecified metadata/adapters are separate; not generated execution-ready Character data.
**Source:** latest designer description replacing only #56 of `ý tưởng nhân vật 3.md`, then the explicit clarifications/corrections below. All other raw kits are untouched. Old180% laser, +10% Ultimate Damage, Heal10%, all-Rank Skill2, same-Authority stacking restriction and self Axiom prohibition are superseded. The final answer locks Skill1 **Basic only**, pre-hit settlement with pre-Cost Basic snapshot.
**Architecture base inspected:** actual merged main `13c11d4`, E.5/F.7/G.6/H.1/I.6. Bounded mitigation override and local CostGroup continuation below are proposed E.6/F.8/G.7/I.7 until merged. Phanes's separately proved direct Execute profile is shared, not duplicated.

## 1. Identity and boundaries

**Azoth** has Passive, Basic, auto-triggered paid Skill1, active Skill2/3 and Ultimate. Rank/Class/native Element unspecified, BASE_DEPLOYMENT_COST = TBD_BY_COST_BUDGET; do not infer Rank/Class/Authority. “Under/equal Rank” is ordinary eligibility, distinct from actual Authority-bearing conflicts. Satellite is VFX, not Entity/Actor/Summon. Grabbing imagery adds no Position mutation, CC or guaranteed selection priority. SSI chooses Natural opportunities; it is not a hidden target Slot/ID selector.

WIL→ATK is **formula/output composition when causing Damage**, not permanent live-stat conversion. Preserve coefficients and count WIL once. Basic ATK8/WIL5 gives pre-mitigation13 PHYSICAL, not ATK13 plus WIL5. Semantic Damage type and mitigation stat are independent dimensions.

## 2. Locked kit

### 2.1 Passive — Willforged Principle / Luyện Ý Thành Lực

Azoth's authored ATK/WIL attack amounts combine into **PHYSICAL output**, without a WILL component. Qualifying **PHYSICAL Damage uses RES instead of ARM** for mitigation. Do not mitigate through both. It remains PHYSICAL for semantic queries, reductions, modifiers and Shield law.

Resolve target authoritative RES after ordinary Buff/Debuff/State contributions → ignore **20% of that resolved RES at packet level** → mitigation uses remaining80%. This is Penetration input, not a target RES Debuff/write: no ally benefit, duration, cleanup or contribution stacking from the Passive. Multiple Penetration inputs require generic applicable composition law; no Character-specific sum/order.

Use a bounded source-owned static mitigation rule scoped to Azoth's resolving Action Actor and own qualifying PHYSICAL Effect graph. Formula WIL contributes once at the authored coefficient; no semantic Damage-type transform to WILL just to obtain RES mitigation. Explicitly TRUE Damage remains TRUE and bypasses ARM/RES; it does not gain Shield Piercing. Passive registration uses TRG-014 once; lifetime is the normal static owner policy, with admitted hit context retained where continuation requires it.

### 2.2 Basic — Coherent Lance / Đồng Pha Quang Thương

One ranged hit on one ordinary legal enemy: **one PHYSICAL packet =100% ATK +100% WIL**. Basic admitted → target Entity locked → snapshot source formula values **before Skill1 Cost** → evaluate/admit optional Skill1 → if admitted, commit its Cost/use and finish mandatory source HP_ZERO lifecycle → resolve the **same** Basic hit/attached request. Snapshot is immutable through source death/Return/cleanup; no post-Cost re-read or double-counted conversion. Hit Admission uses ordinary profile, not Guaranteed Hit.

Locked target invalid before Damage/Execute: DROP_LOCAL / NO_RETARGET. If Skill1 Cost/use already committed, target invalidity creates no refund. Failed Skill1 activation leaves the original Basic Damage branch continuing normally on its legal locked target.

### 2.3 Skill 1 — True-Self Termination / Chân Ngã Đoạn Tuyệt

**Only Basic qualifies**, not Skill3 laser/TRUE hit, Ultimate child Skill3 or arbitrary PHYSICAL Damage. At the pre-hit gate the locked target must have **True Self** and **CurrentHP<=10% CurrentMaxHP**; source battle use cap must be available. Revalidate target before admission/payment. Skill1 is a **local pre-hit settlement/modifier attached to that Basic**, not a separate Action or persistent transferable Buff. Preserve the original hit; Execute does not replace it.

Required local Cost transaction: **Side AE15 + HP5% Azoth Current MaxHP**, resolved at its Cost checkpoint, paid in full. HP Cost is not Damage/HP Loss/MaxHP mutation and bypasses Shield/ARM/RES. **Floor0, no partial-payment/survival safeguard**: exactly5%HP pays to0 successfully; insufficient HP/AE skips Skill1 with no partial debit/use/Execute. Basic remains admitted.

Successful Cost commit → consume one of **2 BATTLE_SCOPED battle uses** → mandatory source HP_ZERO/prevention/death/Return processing → continue the already-admitted Basic/attached Execute execution context. Source death/Return alone does not cancel it, refund Cost/use, re-admit or create a new Action. Cap consumption requires successful payment/admission, not qualification alone. Battle leave/redeploy does not reset cap.

The pre-hit qualifying request is attached only to this locked hit/target. Original Basic Damage commits first, mandatory target lifecycle runs, then the attached Execute branch revalidates ordinary target legality and requests explicit DIRECT_EXECUTE if still legal. No new independent post-hit threshold activation or persistent Execute Buff is created. If target invalidates after payment, branch drops locally with no refund. Execute ultimately denied by actual Authority conflict also grants no automatic refund.

Successful Execute commits HP0+DEATH_CONFIRMED without the ordinary pre-DEATH HP_ZERO Death-Prevention window, preserving post-DEATH_CONFIRMED recovery under the recipient's law. Real Authority anti-death conflicts still adjudicate normally; the label grants no Authority bypass. This differs from the ordinary HP_ZERO caused by Azoth's own HP Cost, which **does** process ordinary source prevention. Execute is not Damage and generates no extra ActualHPDamage metric.

### 2.4 Skill 2 — Resistance Collapse / Kháng Giới Băng Giải

Active required **Side AE35**. At activation/admission checkpoint select current legal fielded enemies **Rank<=Azoth Rank** and snapshot each target's **Current RES**. On successful activation attach a flat Debuff contribution **−30% that captured RES**, immediately effective. It does not live re-evaluate as other RES modifiers change.

Same source/same target recast **replaces** its prior contribution using the new CurrentRES snapshot and **refreshes duration**; no new same-source stack. CurrentRES includes already active contributions under ordinary stat law; no own-family exclusion is authored for this snapshot. Other sources have independent contributions, composition/caps governed by their own generic laws. Another source's25% cap limits that source, not this contribution, unless an actual explicit conflicting rule applies. Ordinary Rank does not decide Authority conflicts.

Duration **2 actual completed Natural Actions of source**, decrement at **ACTION_COMPLETED**: a Natural Action casting Skill2 counts as1; the next actual Natural completion counts as2 and expires it. CC-lost opportunity does not count. Non-Natural/Forced/child cast consumes no count immediately, only future actual Natural completions. Use existing duration clock NATURAL_ACTION_OF_OWNER with explicitly declared source owner/count/completion checkpoint, not ACTOR_NATURAL_ACTION_WINDOW or global Turn Boundary.

Debuff remains target-attached when source leaves Field, until expiry, explicit dispel/cleanse or target lifecycle under ordinary rules. Preserve source identity/clock reference, never source-leave cleanup or real-time expiry. Same-source replacement terminal cause is replacement, not natural expiry. Allies benefit through the target's resolved RES when their own Damage pipeline uses RES; this does not globally reroute every ally's Physical Damage to RES.

### 2.5 Skill 3 — Orbital Dominion / Thiên Quỹ Chế Áp

Actual SKILL Action, required **AE35**. After admission and successful required payment, snapshot **ATK/WIL/Current MaxHP once**, before first direct Effect; use the same capture for the whole Skill3. This is **after Cost**, unlike Basic before optional Skill1 Cost. Parent Ultimate explicitly waives the child AE35 but retains this checkpoint after the waiver.

1. Build and lock all current legal enemy Field Entities. One **SIMULTANEOUS laser batch**, each target receiving **one PHYSICAL packet =150% captured ATK +130% captured WIL**, RES override/20% packet Penetration above. Commit whole group → mandatory lifecycle. No enemy priority from Slot/Entity/list/Event order.
2. **After** laser/lifecycle, build the **current** legal enemy pool → ordinary single-target selection under current SSI/player/autonomy context → lock one Entity → **TRUE hit=10% captured Azoth Current MaxHP** → mandatory lifecycle/results. No legal enemy skips this group. Do not lock this target before laser or invent Slot/ID tie-break. Invalid after lock: DROP_LOCAL / NO_RETARGET.

Laser then TRUE are sequential separate groups. Local AFTER_DIRECT_EFFECTS_COMPLETE holds ordinary Reactions across the chain, without suppressing mandatory lifecycle. Satellite/grab VFX does not create extra Actor/Action.

### 2.6 Ultimate — Closed Circuit: Apotheosis / Hồi Lộ · Thăng Hoa

Root ULTIMATE calls **exactly one real SKILL3 child Action**, preserving SKILL identity/Effect provenance and Ultimate ancestry; no inline-copy graph. Explicit child override waives **only its AE35**. No +10% Damage modifier. Normal child snapshot/target/group semantics above remain in force; no extra Natural child opportunity or foreign Cost waiver.

After that exact child's Damage aggregate is terminal, root Heal requested = **20% aggregate committed Actual HP Damage of that child's own laser + TRUE hit**. Exclude Shield absorption, Overkill, Execute HP removal, external triggered Damage/Reaction/unrelated child/passive Damage even sharing root identity. Result-dependent Heal targets Azoth under ordinary legality. Overheal DISCARD and no self-authored Shield conversion; **external kits may affect Heal/Overheal/Shield under their explicit laws**. Do not restore old Heal10%, +10% Damage or Axiom no-foreign-conversion wording.

Child laser batch → mandatory lifecycle → select/lock current single target → TRUE hit → mandatory lifecycle/result processing → seal child aggregate → root Heal → direct Effects complete → ordinary eligible Reactions. No ordinary window between laser/TRUE/Heal; this is local authored order, not universal sequential-Ability policy.

## 3. Independent composition and exact gap proof

| Locked input → existing composition tried | Governing Contract → current owner | Verdict / smallest extension |
| --- | --- | --- |
| ATK/WIL coefficients, one PHYSICAL packet, packet Penetration | DamageSpec components/Formula/penetration → DMG-001/006 → Damage/Snapshot/stat owners | REUSE arithmetic and Penetration; WIL is formula input only. No live conversion Stat mutation or new Tag. |
| PHYSICAL semantic type but RES defensive lookup | Scoped type-transform or Penetration attempted → DMG-002/003/007 → Damage/Contract Resolver | Exact gap: PHYSICAL default selects ARM. Relabeling WILL loses Physical semantics; Penetration alone cannot replace ARM with RES, using both violates kit. Smallest bounded ScopedDamageMitigationSpec SET_MITIGATION_STAT ARM/RES, §18C/DMG-009/§45B after type transform, using existing mitigation inputs. Optional existing Penetration input scopes the20% to qualifying packets. |
| Basic-only pre-hit paid activation, target True Self/<=10%, cap2, full HP+AE | Conditions/CostGroup/State/lifecycle + admitted Basic local DAG → CST/identity-property/TRG/DTH → Cost/State/Action/Result/Lifecycle | REUSE gate/transaction/floor0/cap/locked target and shared DTH-008 Execute profile. Latest answers supersede old post-hit qualification/new-child-Action proposal. |
| Local optional Cost kills source but same admitted Basic/Execute continues after mandatory lifecycle | CostGroup + local DAG, ActionSpec active-Cost continuation attempted → CST-015, §23/24 → Cost/Action/Lifecycle owners | Exact gap: merged CST-015/§23 only guarantees continuation after **active whole-Action Cost**, not this optional in-graph pre-hit CostGroup. Making S1 Basic's required active Cost would cancel the Basic on failure; separate Action changes identity. Smallest extension: same CONTINUE_ADMITTED_ACTION profile on CostGroup with same enclosing admittedActionRef, terminal local success/use/lifecycle barrier in §24. No new hook/Action/priority. |
| Snapshot RES delta, same-source replace/refresh, independent contributions and completion clock | Target/StatModifier/State/Duration → State/stat/clock contracts → current Target/State/stat contribution/duration owners | REUSE. NATURAL_ACTION_OF_OWNER + ACTION_COMPLETED counts cast if Natural, excludes CC/non-Natural; source leave is not removal. Rank filter is data. |
| Simultaneous laser then current-pool single TRUE hit, one post-Cost source snapshot | Area/Target/Snapshot/Resolution/ResultRefs → RES-002/003/SNP/DMG → current owners | REUSE independent group target planning/commit/lifecycle; SSI no hidden recipient order. |
| Exact one child Skill3 AE waiver, child-direct aggregate Heal20% | ActionSpec/CostSpec waiver/result projection/HealSpec → ACT-020/021/023, CST-006, TRG-013/DMG-012/HEL → Action/Cost/Result/Heal/DAG | REUSE child identity and exact Effect graph aggregation. No root-wide ownership/Cost override or old amplification. |

Each extension is bounded and reusable for an explicitly authored alternate mitigator or a local Cost-funded hit continuation. Existing owner/ref/state-version/commit/result lifetimes supply persistence; no new mutable Character registry, Functional Tag, Primitive or generic priority. Rejected missing scope/conflicting override/unsupported Penetration law is not silently made a winner.

## 4. Remaining items

**No unresolved internal gameplay choice after the Basic-only scope answer.** Rank/Class/native Element/Cost Budget and unsupported Mode adapters remain **UNRESOLVED / NOT BLOCKING** for this architecture work. External noncommutative Penetration/RES composition, numeric profiles and Authority protections require their applicable law. SSI/player/autonomy uses the current Mode's ordinary selector; the kit adds no default target priority or Rank-derived Authority.

## 5. Impact audit across 00–08

| File | Azoth decision |
| --- | --- |
| 00 | PATCH new source/Canon navigation and versions. |
| 01 / 02 / 03 | NO CHANGE: existing meanings retain default Physical/Will mapping subject to Contract; parameters/mitigation selection are not Tags or new atomic operations. |
| 04 | PATCH bounded mitigation override, local CostGroup continuation/lowering/validation. Existing targets/formulas/Duration/State/child/result refs reused. |
| 05 | PATCH DMG-009 and opt-in local scope of CST-015; reuse shared DTH-008, preserve defaults/Authority. |
| 06 | PATCH existing §24 local Cost barrier and §45B mitigation selection; no Azoth branch/service. |
| 07 | NO CHANGE: existing Mode target/SSI/AE ownership, no new adaptation. |
| 08 | PATCH M-063–M-065 for routing/stat snapshot, pre-hit Cost continuation, child result Heal20%, failure/invalidation and reject cases. |

## 6. Six-pass and adversarial audit

Six passes completed: (1) newest coefficients/Heal20%/no amplification/Basic-only pre-hit Cost/snapshots/clock checked; (2) retry exact composition, prove only alternate mitigation lookup and local continuation; (3) correct layer/namespace/owner, target contribution versus source clock, source battle cap; (4) attack equality10/5, no True Self, insufficient HP/AE, source HP_ZERO/Return/death, invalid lock, blocked Execute, Rank filter, same-source recast, CC/non-Natural count, source leave, empty post-laser pool, foreign child receipts; (5) later corrections beat older raw/answers, no Axiom prohibition or post-hit activation; (6) actual source/diff/base/cross-file/declarative stress review, no build/game tests.

Same-author second audit rejected relabeling Damage to WILL merely to obtain RES, replacing the optional local Cost with required Basic active Cost, copying Skill3 inline and restoring old10% Heal/+10% Damage. Pre-hit qualification/payment attaches Execute to the existing hit while preserving original Damage-first resolution and later ordinary target legality; no persistent buff or extra Action.
