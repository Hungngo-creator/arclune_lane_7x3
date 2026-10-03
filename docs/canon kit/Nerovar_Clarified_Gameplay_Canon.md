# ARCLUNE — NEROVAR — CLARIFIED GAMEPLAY CANON

**Revision:** R4 — complete locked gameplay normalization, including retention, actor-window, formulas, group checkpoints and pre-Cost source snapshot correction.
**Status:** GAMEPLAY_CLARIFIED / ARCHITECTURE_NORMALIZED. Numeric metadata/unsupported Mode adapters are separate; this document is not generated execution-ready Character data.
**Source:** current `ý tưởng nhân vật 3.md`, first #52 Warrior / Death Pays the Fare, named Nerovar by the designer; all latest explicit designer answers below supersede earlier questions. Later #52 Phanes is a distinct kit; raw numbering is not runtime identity.
**Architecture base inspected:** actual merged main `13c11d4`, INDEX-7/E.5/F.7/G.6/H.1/I.6. Cost and atomic prevention/Return machinery are already merged. This revision proves only a pre-Cost source-capture extension, proposed E.6/F.8/G.7/I.7 until merged.

## 1. Identity and common Action policy

Nerovar is a Warrior with Passive, Basic, three Skills and Ultimate. Rank/native Element are unspecified; BASE_DEPLOYMENT_COST = TBD_BY_COST_BUDGET. These do not block the present architecture normalization. Do not infer Authority, Penetration, Guaranteed Hit, Position mutation or extra Actions from sword/meteor/jump imagery.

All Action formulas snapshot used source ATK/WIL/Current MaxHP once at **Action admitted → source snapshot → Cost commit → mandatory Cost-caused lifecycle → direct Effects**. This capture is distinct from Skill1's dedicated post-payment HP receipt. It stays immutable if source dies, returns to Deck or loses field-scoped effects during Cost lifecycle. Basic selects one ordinary legal enemy and locks Entity; fixed-Slot groups use enemy-side spatial queries, not hidden Entity/list priority. Each locked invalid recipient is DROP_LOCAL / NO_RETARGET. Empty authored Slots skip locally. Every multi-target Damage group is SIMULTANEOUS; sequential groups remain separate commits with mandatory lifecycle between them, using the authored local AFTER_DIRECT_EFFECTS_COMPLETE ordinary-Reaction hold. No universal simultaneous-AoE default is created.

PHYSICAL uses ordinary ARM mitigation; WILL uses RES; TRUE bypasses ARM/RES/ordinary reduction but retains ordinary Shield interaction. Mixed components belong to **one hit/Effect per target per group**, not separate Actions. Hit Admission remains the ordinary profile; lock does not imply Guaranteed Hit. Slot8's Leader illustration uses the turn-based mapping only; Slot geometry is not a universal Leader selector.

## 2. Locked kit

### 2.1 Passive — Death Pays the Fare / Tử Vong Trả Lộ Phí

At a transition from HP>0 to HP0, if its once-per-battle use is unused, this is **HP_ZERO Death Prevention before DEATH_CONFIRMED**, including HP_ZERO caused by HP Cost. HP Cost remains Cost. No fake Death → Revive sequence.

At Passive admission snapshot **50% Nerovar Current MaxHP** as requested Heal. At settlement start resolve and lock the allied Leader Entity of the current Combat Instance. Missing/illegal/lifecycle-invalid Leader skips the Heal branch with no retarget; full HP may commit Effective Heal0. Heal success is not a prerequisite for Return. Unconsumed Overheal is discarded under ordinary Heal law; no implicit Shield conversion.

```text
HP_ZERO → eligibility/use check
→ attempt locked Leader Heal
→ stage survival Current HP1
→ stage RETURN_TO_DECK and Passive use in the SAME prevention transaction
→ successful common commit: alive HP1 + Deck/undeployed + consume Passive use
→ attempt CURRENT_DEPLOYMENT_COST ADD_CURRENT −3
→ terminal settlement
```

SurvivalHP1 is not a Heal Effect: no Heal-received/Overheal/Lifesteal/Heal modifiers. Battle Deck membership is retained; ordinary deployment legality/payment permits later redeploy. Return alone does not increment lifeSerial. Use consumes only on successful Return commit, never merely on HP_ZERO/start/Heal attempt.

**Failure atomicity:** failed Return commits no proposed HP1, presence/deployment transition, cleanup or Passive use; no −3. For the unchanged subject resume the original HP_ZERO lifecycle at HP0; ordinary death may follow. Preserve independent authoritative changes rather than restoring a stale HP snapshot. Earlier committed Leader Heal is outside this transaction and is not rolled back. No false DEATH_PREVENTED result and no automatic same-candidate retry.

**Retention:** do not import Alcestis purge. Return retains battle-scoped State/counters, Current Deployment Cost and HP1; discard only FIELD_PRESENCE_SCOPED State/Shield/effects unless another explicit retention law governs them. Existing ReturnToDeckSpec: discardStateClassifications [], discardRetentionScopes [FIELD_PRESENCE_SCOPED], retainRetentionScopes [BATTLE_SCOPED], unmatchedStatePolicy RETAIN, currentHpPolicy RETAIN. Actual removal records transition/source-leave cause, not Cleanse, natural expiry or Shield break.

Only after successful Return attempt Current Deployment Cost −3. Ordinary DEP-006 floor/lock/composition applies; a blocked/clamped reduction does not roll back Return or consumed use. Base Deployment Cost/Side Deployment Cost Bar/AE/Rage are unchanged. Direct Execute without ordinary prevention is a different lethal profile; this Passive cannot intercept it.

### 2.2 Basic — Falling Scar / Lạc Ngân

One legal locked enemy receives one hit: **PHYSICAL100% ATK + WILL100% WIL**, using the common pre-Cost source snapshot. Basic result package contains its own committed direct Damage results only; imagery adds no movement.

### 2.3 Skill 1 — Starfall Invocation / Dẫn Tinh Trụy Thế

Required atomic CostGroup: **Side AE30 + HP5% Nerovar Current MaxHP**. HP Cost bypasses Shield/ARM/RES and is not HP Loss/Damage. Freeze requested H_req and authoritative H_before at the Cost checkpoint; source formula ATK/WIL/MaxHP capture remains the earlier admitted-Action snapshot.

| Cost condition | Actual HP paid | Immediate post-payment HP | Outcome |
| --- | --- | --- | --- |
| H_before < H_req, safeguard unused | max(0,H_before−1) | 1 | Explicit successful partial-payment exception; consume safeguard only with whole required Cost transaction success/Skill admission. |
| H_before < H_req, safeguard consumed | H_before | 0 | Successful intentional suicidal payment, not insufficient-HP failure. |
| H_before >= H_req, including equality | H_req | H_before−H_req | Full payment; safeguard does not qualify. |

Safeguard and Passive allowance are distinct source-owned **BATTLE_SCOPED** once-per-battle counters. Failed AE/required transaction or read-only probes consume neither HP nor safeguard; redeploy resets neither. Numeric normalization follows project policy, with no Character rounding exception. First partial payment may be zero and still succeed.

At successful HP debit commit bind immutable **H_postCost = Current HP immediately after that payment, before all HP_ZERO/prevention/Heal/Return/death side-effects**, via CURRENT_HP_AFTER_PAYMENT. It is not paidAmount or live HP after prevention. Examples: post-payment500 → HP-scaled Damage50; floor1 →0.1; lethal0 →0 even if prevention later establishes HP1.

Successful required Cost → mandatory HP_ZERO processing → **same already-admitted Skill1 continues** whether source returns to Deck or reaches DEATH_CONFIRMED, unless a separately explicit cancellation law applies. No new Action, repeated admission/payment or resurrection. Failed required Cost creates no meteor/explosion.

Direct groups:

1. At meteor group start query current enemy occupant **Slot8**, lock Entity, resolve one hit **PHYSICAL180% captured ATK + WILL180% captured WIL**; mandatory lifecycle.
2. At explosion group start **re-query current occupants Slots5/7/8/9**, lock those Entities, then one simultaneous batch. Per target one hit **WILL100% captured WIL + PHYSICAL10% H_postCost**. Slot8 may legally receive both groups; old dead/changed occupants are not inherited by this later query.

Invalid after lock is DROP_LOCAL / NO_RETARGET. Source snapshots remain shared across groups; recipient sets deliberately re-query at each group checkpoint.

### 2.4 Skill 2 — Blood Returned / Huyết Hoàn

Qualifying actual Basic Damage completion → mandatory lifecycle → immutable aggregate **D = committed Actual HP Damage of the whole Basic's own direct Effects**, excluding Shield absorption/Overkill/foreign triggers → check cap → if AE>=4, pay Side AE4 → consume cap → Heal Nerovar for **10%D**, Overheal DISCARD. Missing AE means no activation/no cap consume; it never cancels the Basic. Paid activation consumes cap even when Effective Heal0 at full HP.

Cap is **once per Nerovar ACTOR_NATURAL_ACTION_WINDOW**, reset at start of his next Natural Action opportunity under CLK-002. Non-Natural/Forced/child Basics may qualify but share this same allowance; they do not reset it or advance SSI. CC-consumed opportunity still starts a new window; unrelated global boundaries/other actors do not. Preserve owner/window key across field leave; no redeploy or free child reset.

### 2.5 Skill 3 — Sever the Mortal Measure / Đoạn Mệnh Xích

Required **AE25**. At the Damage group's common pre-group checkpoint query enemy occupants **Slots2/5/8**, lock legal Entities and snapshot **each target's own Current HP**. Resolve simultaneously one TRUE hit per recipient equal to **50% that recipient's captured Current HP**. No live HP read between recipients, source-HP substitution or target iteration priority.

After committed group and mandatory lifecycle, Heal Nerovar for **20% sum of this Skill3's own committed Actual HP Damage**, excluding Shield/Overkill/foreign triggered or unrelated child Damage, Overheal DISCARD. TRUE is not Shield Piercing. The result-dependent Heal targets source Entity under ordinary Heal legality; no implicit replacement if invalid.

### 2.6 Ultimate — Descend, Ruin, Reap / Giáng Thế · Phá Diệt · Thu Hoạch

Use ordinary Ultimate readiness/Cost rules; no free cast/extra Heal/cooldown invented. Capture source ATK/WIL/Current MaxHP once before Cost, as above.

1. At group1 start query current enemy **Slot5** occupant → lock → one hit **PHYSICAL150% ATK + WILL150% WIL** → mandatory lifecycle. Empty Slot5 skips without replacement.
2. Then **re-query all current legal enemy recipients**, lock their Entities, resolve one simultaneous full-side AoE batch. Per recipient one hit **PHYSICAL150% ATK + WILL150% WIL + TRUE5% captured Nerovar Current MaxHP**. A still-legal Slot5 occupant may be hit again; changed/dead occupants follow the fresh query, not an inherited list.

Locked invalid targets drop locally with no retarget. Group2 eligibility cannot be changed by its siblings' commits.

## 3. Normalized composition and proof against the current base

| Locked input → existing composition tried | Contract → current runtime owner | Verdict / smallest extension |
| --- | --- | --- |
| HP_ZERO Leader Heal → survival+Return+use → later−3 | deathPrevention/ReturnToDeck/State/DeploymentCost → DTH-007, DEP-006/007/008, HEL → Lifecycle/Deployment/State/Transaction/Heal | REUSE merged joined P-061/Return barrier and terminal result gating. Independent Heal/later−3 remain outside. Scope retention is data, no new cleanup service. |
| AE30+HP5%; strict-below safeguarded/consumed cases; post-payment HP; admitted meteor continuation | requiredCostRefs/hpPaymentPolicy/COST_PAYMENT_REF + costLifecyclePolicy CONTINUE_ADMITTED_ACTION → CST-008/009/014/015 → Cost/State/Result/Action/Lifecycle, P-036 | REUSE all merged capabilities. Pure MIN/MAX substitution loses requestedAmount; probe/effect-side counter consumption violates atomicity. Do not duplicate the existing solution. |
| Admitted source ATK/WIL/MaxHP captured **before active Cost**, retained through source death/Return | SnapshotSpec → SNP-001/002/003 + CST-015 → Action/Snapshot Store | Exact gap: merged §23 reaches ordinary snapshots only after active Cost/lifecycle; generic timing placeholder has no contracted pre-Cost capture. ACTION_START would capture too late. Smallest extension: AFTER_ADMISSION_BEFORE_COST_COMMIT / SNP-006, §23 step4A using existing store. Read-only capture, not new prerequisite/payment/Trigger. |
| Typed groups, Slot-local requery/Entity lock, per-target HP snapshot, committed result Heal | Target/Area/Snapshot/Resolution/ResultRefs → TGT/SNP/RES-002/003/DMG/HEL → existing Target/Spatial/Damage/Transaction/Result/Heal | REUSE. Per-group timing/recipients/components/DAG are declarative data; no hidden order. |
| Optional Basic Heal, paid-use and actor-window cap | Trigger/Conditions/Cost/State + own-direct result projection → TRG-013, CLK-002/CST/HEL → Trigger/Cost/State/Result | REUSE. Window opportunity differs from actual-Natural completion and global Turn Boundary. |

No new Functional Tag, Primitive, Character runtime, callback or priority system. Formula/snapshot/Counter refs are owned and typed; Action lineage does not replace Effect provenance. Native metadata is not an architecture gap.

## 4. Remaining items

**No unresolved internal gameplay choice.** Rank/native Element/Cost Budget and unsupported Mode adaptation remain **UNRESOLVED / NOT BLOCKING** for this architecture work. Fixed Slots/actor windows/battle clocks require explicit Mode profiles where absent; do not convert them to seconds. Foreign cancellation/retention/Authority or competing unrelated settlements must supply their own applicable law; this kit defines no global priority.

## 5. Impact audit across 00–08

| File | Nerovar decision |
| --- | --- |
| 00 | PATCH normalization/navigation and versions. |
| 01 / 02 / 03 | NO CHANGE: existing meanings/capabilities/atomic operations; no duplicated Tag/Primitive. |
| 04 | PATCH only explicit pre-Cost source Snapshot timing/lowering/validation. Other kit fields reuse existing Schema. |
| 05 | PATCH SNP-006; merged Cost/Return/retention/window contracts remain unchanged. |
| 06 | PATCH admitted-Action pre-Cost capture through existing owner; no new source snapshot manager. |
| 07 | NO CHANGE: current Slot/SSI/resource ownership. Unsupported modes require explicit adaptation. |
| 08 | PATCH M-056/M-061 and M-065 negative timing/lifetime obligations; preserve M-051–M-055 Cost/atomic Return regressions. |

## 6. Final self-audit and adversarial correction

All six AGENTS passes completed: (1) coefficients/strict-versus-inclusive Cost gates, recipients/group requery/pre-Cost versus H_postCost checked; (2) independently retry current Cost/Return/clock/target/result composition, retain only SNP-006 gap; (3) correct Schema/Contract/runtime owners, battle counters and actor-window key, no ID collisions; (4) attack equality, successful zero payment, AE failure, Return failure, source death, changed Slot occupants, invalid locks, CC/child/window/reset/replay; (5) newest retention/clock/pre-Cost answers supersede older questions, no Alcestis cleanup; (6) actual main base/diff/reference/coverage audit, Architecture Phase only.

Same-author second audit corrected the tempting after-Cost source capture and whole-Action target lock: source values are pre-Cost, while Skill1/Ultimate later groups deliberately re-query recipients. HP1 and prevention use remain joined to Return; no duplicate runtime extension for these already merged laws. This Canon does not claim executable build/game-test results.
