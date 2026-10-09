# ARCLUNE — GIDEON VALE — CLARIFIED GAMEPLAY CANON

**Revision:** R2 — FINAL DESIGNER LOCK Q1–Q7, 2026-10-09; supersedes R1's pending alternatives.
**Status:** GAMEPLAY_CLARIFIED / ARCHITECTURE_NORMALIZED. All internal Q1–Q7 gameplay is locked and audited against current composition plus the two proven bounded additions. External numeric/foreign-profile/Mode boundaries below are not generated execution-ready numeric data.
**Source:** named entry **79) Gideon Vale** in [ý tưởng nhân vật 3.md](../../ý%20tưởng%20nhân%20vật%203.md), replacement raw kit of2026-10-08 and explicit final Q1–Q7 answers of2026-10-09. Item number alone is not identity.
**Verified merge base:** `main` at `5f972526e5826e64290cdf6710b445976cf7cff0` (PR40). Root [AGENTS.md](../../AGENTS.md) governs the architecture-phase workflow. R1 was intentionally partial; its questions and synthetic choices are superseded by these concrete answers.

## 1. Identity and precedence

**Gideon Vale — SSR, Tanker.** Retain descriptive ratings DMG2 / SUR5 / CTL3 / CMP2 / MIC2 / VIS5. Rarity/Class/lore supply no Authority. Prayer/approaching the enemy are presentation, not movement or a new Entity.

The replacement supersedes Heal70% WIL/ATK and global Turn Boundary durations with **150% WIL +120% ATK** and the exact owner-opportunity clocks below. Natural Action means an actually performed Action; an owner Natural-Action opportunity can instead be consumed by CC without an Action. Do not collapse those two facts.

## 2. Passive — exact hostile-Action threshold and current-capacity gain

At the beginning of each qualifying hostile Action, retain an immutable Snapshot of Gideon's **CurrentMaxHP**:

```text
M_start = Gideon CurrentMaxHP at that hostile Action's start
```

Bind it to that exact Action, Gideon's original runtime subject/Combat Instance and the supported presence/lifecycle context. It is not the attacker's MaxHP, first-hit MaxHP or an end-of-Action live read. No gain is applied when this Snapshot is captured.

After all qualifying Damage receipts of that **exact Action**, and mandatory lifecycle, are terminal, seal:

```text
D = sum of committed Actual HP Damage received by Gideon from that Action
qualifies iff D > 0.30 × M_start
```

Count each committed component receipt once; a packet aggregate and its referenced components are not two contributions. Exclude Shield absorption, overkill, requested/raw Damage, HP Cost/Loss and non-Damage HP assignment. A child Action is a separate exact Action even if rootActionId/Attribution matches; actionless/foreign Damage cannot enter this collection by temporal coincidence. A Snapshot/receipt missing its original exact-Action/subject binding is invalid, not a live fallback.

One qualifying Action grants once, after that result/lifecycle checkpoint:

```text
gain = 0.13 × Gideon LIVE CurrentMaxHP at mutation application
new CurrentMaxHP = current CurrentMaxHP + gain
CurrentHP = unchanged absolute CurrentHP
```

The threshold and gain bases deliberately differ. With M_start10,000 and D3,100, the threshold qualifies even if CurrentMaxHP became20,000 during the Action; application at20,000 grants2,600 and yields22,600. D3,000 is exactly30% and does not qualify. With an unchanged10,000 basis, the gain is1,300 and MaxHP becomes11,300. Distinct Actions dealing1,600 and1,500 are not a combined3,100 test.

The increase is **MAX_HP_MUTATION**, never Heal:5,000/10,000 becomes5,000/11,300. Subsequent gains use the then-current capacity; no BaseStat rewrite or capacity-derived CurrentHP grant.

### 2.1 Source-local reset

Remove this passive's earned MaxHP contribution on its declared Field leave, Reincarnation entry, **HP_ZERO**, or Return-to-Deck cause. HP_ZERO is a reset even if later Death Prevention prevents DEATH_CONFIRMED. Causes remain distinct; overlapping delivery removes the contribution only once.

Preserve independent contributions. On removal preserve absolute CurrentHP where possible and clamp downward to the resulting CurrentMaxHP if necessary. This is reconciliation, not Damage/HP Loss/Heal/Cleanse/natural expiry; synthesize none of their events.

Reset does not rewrite already committed receipts or M_start. If the original subject remains lifecycle-valid after mandatory prevention/recovery, later threshold evaluation still uses that Action's original inputs and its gain uses current capacity. A dead/invalid original recipient cannot be restored by this passive or redirected to a replacement presence. Ordinary lifecycle validity remains a separate admission law; do not add a per-hit reward, fabricate Revive or reinterpret ordinary lifeSerial retention as permission to bind a different runtime subject. Replay/reinitialization cannot reapply a terminal gain or resurrect a removed contribution.

## 3. Skill1 — cast-stat self Heal and two-opportunity defense

Ordinary required cost: **20 Side AE** in TURN_BASED_MAIN. Capture **Gideon's WIL and ATK at cast** from one authoritative immutable Snapshot; requested self Heal is:

```text
1.50 × cast WIL + 1.20 × cast ATK
```

Later stat changes cannot rewrite this basis. Ordinary Heal admission/modifiers/restoration apply; no innate Overheal conversion is declared.

One source-family defense contribution applies **ARM×1.10 and RES×1.10** to the current stat contribution view. Use RES-007 **EXCLUDE_THIS_SOURCE_FAMILY** to avoid self-reference or recast compounding. Family-excluded ARM200/RES300 becomes220/330. Recast refreshes the existing window, never produces242/363 or another stack and never bakes the contribution into BaseStats.

The buff covers the **next two owner Natural-Action opportunities after the cast**. The creating Action/opportunity is excluded. It stays active through opportunity1 and opportunity2, then expires **after opportunity2 is consumed/completed**, including its actual Action when one occurs. If that Action recasts Skill1, the new refresh window excludes the creating opportunity; the old clock cannot decrement or expire the refreshed window retroactively.

A CC-lost opportunity still counts and can expire the buff after its second consumption, despite no Basic/Skill/Ultimate completion. Other Actors, global boundaries, children/Reactions and dead-Slot waits do not decrement it.

## 4. Skill2 — shield strike and Stun

Ordinary required cost: **25 Side AE**. Approach is animation: no Position Mutation, Field transition or additional SSI opportunity. Damage to the selected enemy is **100% ATK +100% WIL**, using ordinary PHYSICAL/Will components, their distinct mitigation/receipts and existing common-recipient RES-008 allocation. No TRUE conversion, Shield Piercing or Guaranteed Hit.

A **15% Stun** application attempt uses the existing seeded RNG/State admission law. There is no authored positive-ActualHP condition linking this status to the Damage receipt; do not manufacture one from the visual shield strike. Invalid target/CC protection still follows applicable ordinary admission, without a second draw on resume.

Stun prevents execution of **one Natural Action** by consuming that target's qualifying owner opportunity without Basic/Skill/Ultimate, then SSI advances under ACT-012. It is a CONTROL State/action restriction, not one global boundary or a new STUN Functional Tag. It does not create or reclassify a non-Natural Action.

## 5. Skill3 — one paid source family, waiting observations and one Heal tick

Automatic predicate:

```text
original Gideon is valid and in the eligible waiting interval
AND CurrentHP >= 0.70 × live CurrentMaxHP
AND Skill3 CD is legal
AND Side AE15 is payable
```

The waiting interval exists only **after Gideon completes one of his own Natural Actions**, before his next SSI opportunity. Field entry, a child/non-Natural completion, or a CC-consumed opportunity with no performed Action does not open a fresh interval.

### 5.1 Initial check and continuing observation

The initial completion graph has this explicit local dependency:

```text
Gideon root Natural Action
→ all root-linked blocking settlements terminal
→ ACTION_COMPLETED
→ this Action's class AE regeneration terminal (+5 for Tanker)
→ open/evaluate Gideon's post-completion waiting predicate
→ if legal, pay15 AE and activate/refresh Skill3
→ finite observation graph terminal
→ SSI handoff
```

Side AE10 becomes15 from the just-completed Tanker Action, then pays15 and becomes0. Do not move payment before this grant or let blocking pre-completion work use it. A denied/zero/capped class grant is still a terminal hook; read actual Side AE, not nominal+5. This dependency belongs to Gideon's declared observer, never every post-action trigger.

Retain an ordinary source-owned waiting State through the interval, even if the initial predicate/payment fails. During that interval re-evaluate after relevant **independent authoritative commits** changing Gideon CurrentHP, CurrentMaxHP or its exact Side Current AE. Existing stablePredicateSettlement with those three fields, `includeFieldInitialization: false` and explicit Side pool binding provides finite observations, not polling or a pending failed-payment retry. Joined fields yield one commit/subscriber checkpoint. No-op, rolled-back or wrong-Side changes do not qualify.

Close the waiting State at the **next owner opportunity start before its Heal/CC/selection** so that the start Heal or CD decrement cannot accidentally auto-activate Skill3 during that opportunity. If CC consumes that opportunity, no Natural completion or+5 class AE occurs and no fresh waiting interval is opened. A later actually completed owner Natural may open the next one.

Completion and mutation entry points invoke one shared finite automatic activation graph. Existing in-progress State/candidate guards prevent a nested candidate from its own payment; stable observers use exact activation-origin exclusion. Clear in-progress state on terminal success/clean failure. A later independent commit after terminal settlement remains eligible; excluding every future event from the same Ability/root is incorrect. Normal payment failure creates no partial refresh/CD/Heal, infinite loop or automatic refund.

### 5.2 Refresh, clock and periodic Heal

Successful activation creates or **refreshes one source-family Taunt/periodic-Heal effect**, anchored to the new activation and owner opportunity serial. It never adds a second Taunt/HoT stack. It resets that family's duration and writes a fresh **CD1 owner opportunity**. The next later consumed owner opportunity, including CC loss, decrements CD to0; creating Action/child/Reaction/global boundary cannot do so.

Activation produces **no immediate Heal**. At the first later owner opportunity start, while the effect is still active:

```text
H = 0.04 × Gideon's LIVE CurrentMaxHP at this start checkpoint
request Heal H for Gideon
request Heal H for the allied Leader
```

Retain that checkpoint's common amount for both requests; this local tick capture is not a Snapshot of future ticks at activation. Each recipient retains its own ordinary Heal validity/admission/result; zero/denied Heal does not resurrect the window or cancel an otherwise valid sibling request.

At the **beginning of the second later owner opportunity**, remove/expire the old effect **before its periodic-Heal eligibility checkpoint**. That activation consequently emits no second Heal. An uninterrupted activation naturally has **one tick**. A legitimate refresh before expiry anchors a new window; old scheduled cursors cannot decrement, expire or duplicate its new tick. Preserve already committed results and exact State/window/grant identity for replay.

These start settlements run even when CC subsequently prevents the Action: the first tick still occurs, CD still decreases, and opportunity counts still advance. A dead/absent owner with no ordinary grant receives no fake tick from global boundaries or POSTMORTEM_WAIT.

### 5.3 Taunt — selectable single recipient only

An active Taunt compels an enemy Action only when it is **damaging, single-target, has an ordinary selectable recipient, and Gideon is legal for that selection**. Basic/Skill/Ultimate names confer neither inclusion nor exclusion; semantic targeting decides.

Exclude AoE/multi-target Damage, fixed-Slot/fixed-position attacks, random multi-target attacks without one ordinary recipient decision, Heal, Buff, Debuff-only/non-Damage, self-target and any action for which Gideon is not legal. A chosen AoE center remains AoE and does not qualify. Do not rewrite an authored Slot into Gideon's Slot or convert an existing Position lock into an Entity lock.

Apply compulsion at the legal recipient-selection decision, before that decision is committed/locked. Preserve Target Exclusion, target admission, ordinary binding/invalidation, Hit/Authority and Damage rules. It is not Guaranteed Hit or protection bypass; it does not retroactively retarget an already locked attack. Multiple eligible sources requiring different recipients need their explicit applicable generic composition/profile, otherwise reject the ambiguous choice; list/Event/entity order is not priority.

## 6. Ultimate — sequential free Skill2 then forced Skill3

```text
Ultimate admitted under ordinary root cost/readiness
→ real non-Natural Skill2 child resolves
→ Damage/Stun and mandatory lifecycle terminal
→ real non-Natural Skill3 child resolves
→ Taunt/periodic-Heal family refreshed, fresh CD1
→ Ultimate complete
```

Waive exactly the intended **Skill2 AE25 and Skill3 AE15** child costs. Skill3's explicit Ultimate invocation bypasses **automatic HP>=70%, CD and waiting-interval gates**, including when an old effect is present; it uses the same non-stack refresh law and emits no immediate Heal. Root Rage/readiness and unrelated foreign/descendant Costs remain governed by their own rules. Children consume no additional SSI opportunity or class AE regeneration.

The auto eligibility gate is on the automatic Trigger, not a shared mandatory Effect prerequisite: invoking the shared finite effect graph directly expresses the Ultimate exception without permanently rewriting Skill3's ordinary definition. Parent waits for both children and their declared required work. Skill2 zero Damage/failed status does not by itself cancel the Skill3 stage; actual owner invalidity remains ordinary lifecycle law, not forced Revive or a substitute target.

The successful Skill3 child writes freshCD1 before root Ultimate completion. That root's later class-AE/automatic check therefore cannot immediately charge another15 merely because HP is high; a child is not an owner opportunity decrementing this fresh CD.

## 7. Q1–Q7 FINAL DESIGNER LOCK — resolved

| ID | Concrete locked decision |
| --- | --- |
| Q1 | Threshold uses exact hostile-Action-start CurrentMaxHP Snapshot; gain separately uses live CurrentMaxHP at application. Strict>30%. |
| Q2 | Increase preserves absolute CurrentHP and does not Heal. Source removal preserves/clamps CurrentHP without Damage/HP-Loss/Heal events. |
| Q3 | No activation Heal. First later opportunity start heals both recipients4% live owner MaxHP; second start expires first and emits no old tick. |
| Q4 | Skill1 covers both next opportunities and expires after second consumption/completion. CC loss counts for Skill1, Skill3 duration/CD and eligible start Heal. |
| Q5 | Eligible interval follows actual own Natural completion; observe independent HP/MaxHP/exact Side-AE commits during it. Recast refreshes one family/CD1. Ultimate bypasses automatic HP/CD/wait gates and refreshes that same family. |
| Q6 | Compel legal, ordinarily selectable, single-recipient damaging Basic/Skill/Ultimate only. Exclusions and explicit conflicting-source composition apply; no Slot rewrite/Guaranteed Hit. |
| Q7 | Exact same-completion class-AE hook precedes Gideon's automatic check/payment, so Tanker+5 can fund15. This is a local declared edge. |

**No unresolved internal Q1–Q7 gameplay choice.** Numeric metadata/native Element/Ki/Base Deployment Cost and an external Basic definition remain **UNRESOLVED / NOT BLOCKING** for architecture normalization. Future Mode adapters, incompatible foreign Taunt/Authority/retention compositions and battle-terminal continuation require their applicable existing explicit profile; no new Gideon default is invented for them. Ordinary valid-subject, Hit/State/Heal and transition law remains authoritative.

## 8. Independent composition and minimum gap proof

| Locked input → current capability / attempted composition | Exact observable failure | Smallest reusable extension / owner |
| --- | --- | --- |
| Q1/Q2 exact-Action M_start and D; current13% mutation/source cleanup | None: SnapshotSpec/P-002, P-043, P-031/032, DMG-010–021, STA-001/002 and existing Result/State/Transaction owners preserve both bases/reconciliation. | REUSE. No new accumulator, MaxHP operation or Damage/Heal event. |
| Skill1 snapshot/no-stack/opportunity2 end; Skill2 mixed Damage/Stun; Q3/Q4 one owner-start tick/early expiry/CD | None: existing Snapshot/RES-007, State/Duration/RNG/Heal, ACT-012/034, CLK-003/004 and typed finite graphs express the exact start/end clocks. | REUSE. Distinct window revisions/counters and expiry→tick dependencies are declarative State data, not a scheduler for Gideon. |
| Q5 waiting State + independent HP/MaxHP/Side-AE observation; Ultimate forced refresh | None: existing State guards, §7.16/TRG-016, exact Side-AE subscription, Trigger Costs and RequestAction/shared Effect graph. | REUSE. No continuous polling, callback, new watched-field family or Condition-bypass Primitive. |
| Q7 §7.13 postActionSettlement local dependsOn + existing Mode class regeneration | E.19 restricts dependency refs to required completion obligations; class hook is not such a node. G.20 pipeline finishes step23 obligations before step24 class hooks, so AE10 fails instead of funding15. A pre-completion blocker cycles; an AE listener alone misses initial checks when the hook commits zero. | Extend existing postActionSettlement with only `afterModeHook: AE_ACTION_REGEN_BY_CLASS`; ACT-033 and existing Scheduler/Trigger/DAG records bind it to the same actual completed Natural Action. Gate only opted observer evaluation; no general hook registry/priority. |
| Q6 CONTROL State + foreign Action TargetSpec/filters/Target Exclusion | Current TargetSpec describes the attack owner's selection; it has no source-State capability compelling a legal recipient. Target Exclusion removes candidates but cannot positively force Gideon only on selectable single-target Damage without rewriting every foreign kit or incorrectly affecting AoE/fixed Slots. | Add bounded State `targetSelectionConstraint` selecting `SELECTABLE_SINGLE_RECIPIENT_DAMAGE` / `FORCE_RECIPIENT_IF_LEGAL`, under existing TGT-001. Existing State/query contribution registration and Target Resolver narrow only that qualified legal selection; no new Primitive/Functional Tag/manager. |

Each new normalized use must retain existing owner/source/State/Action/selection checkpoint/Mode/lifetime references. Reject arbitrary hook names, future/foreign Actions, cycles, unsupported target shapes/operations, unavailable recipients and conflicting compulsion without a law. Unauthored data keeps prior behavior; opting in requires current Schema/Contract/Kernel compatibility versions and a fresh validation hash. Existing precise Position binding still applies per attack owner.

Functional indexing continues using existing **DAMAGE / PHYSICAL_DAMAGE / WILL_DAMAGE / HEAL / STAT_MODIFIER / MAX_HP_MUTATION** as applicable. Taunt/Stun remain State/control semantics; timing, class, rarity and constraint enum values are not new Functional Tags.

| Layer | Final audited impact |
| --- | --- |
| 00 | R2 navigation and E.20/F.22/G.21/I.23 version bookkeeping. |
| 01 /02 /03 | NO CHANGE: existing meanings, vocabulary and atomic operations; no new term, Tag or Primitive. |
| 04 | Only §7.13 bounded same-Action class-hook edge; §19.6 target constraint and associated lowering/validation. |
| 05 | Extend ACT-033 and TGT-001 only; preserve unopted ordering, legal candidate pipeline, locks/Hit and unrelated priority. |
| 06 | Existing post-action pipeline/§39B and Target Resolver/State owner execute the two typed additions; no new service or Character branch. |
| 07 | NO CHANGE: class AE table/SSI/resources already exist. No seconds conversion or new Mode-wide post-action priority. |
| 08 | Correct M-165–M-167 to R2; add only opportunity-window/refresh, waiting/class-hook and compulsion/rejection boundary coverage. Prior tests retained except the explicitly superseded R1 fixtures. |

## 9. Complete trace and six-pass self-audit

```text
A completes → class+5 → initial check/pay15 → one ACTIVE family, CD1; no Heal
B grant → close old waiting interval → active first tick at live MaxHP → CD1→0
  B lost to CC: clocks count; no performed Action/class AE/new waiting interval
  B performed: completion → class+5 → check may refresh one family/window/CD1
Without refresh, C grant → old effect expires → no old periodic Heal
Skill1 across B/C: active during both → expire after C consumption/completion
```

Six passes verify: (1) every final formula/clock/checkpoint/recipient and ordinary/Ultimate gate; (2) independent reuse before the two narrowly proved gaps; (3) correct Schema/Contract/Kernel ownership and namespaces, source-family/window lifetime, no Tag/Primitive collision; (4) exact30%, mid-Action capacity, split/child receipts, HP_ZERO/prevention, source cleanup/redeploy, AE10 funding/denial, CC loss, refresh/expired cursors, no entry auto, closed waiting interval, same-Side-only changes, target legality/exclusions/conflicts and replay; (5) final designer locks supersede all R1 questions/alternatives; (6) actual diff/latest merge base, canonical references/versions and declarative regression coverage.

Architecture Phase validation completed: actual diff/scope and git diff --check; Markdown links and canonical Contract/Primitive references; version/typed-profile consistency;302 unique stress IDs; every earlier case body preserved except the explicitly superseded M-165–M-167. No implementation build or executable game/runtime test result is claimed.

The independent second audit corrected a plausible failure-policy error: a dynamically conflicting Taunt selection does not undo a previously committed ordinary Cost; CST governs it. It also made the same-Action hook cursor creation/terminal/cleanup and Ultimate fresh-CD protection explicit. No new gameplay question was discovered; Q1–Q7 are not reopened.
