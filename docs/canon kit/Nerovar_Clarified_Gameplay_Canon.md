# ARCLUNE — NEROVAR — CLARIFIED GAMEPLAY CANON

**Revision:** R1 — designer-named raw kit reconstructed; blocking gameplay clarification in progress.
**Status:** CLARIFICATION_IN_PROGRESS. Source-defined facts are separated from §4's unanswered execution semantics; no completed normalization is claimed.
**Source:** current repository `ý tưởng nhân vật 3.md`, the first #52, Warrior with Passive **Death Pays the Fare**. The designer explicitly named this kit **Nerovar** and confirmed that the later duplicate #52 SSR Mage/orb kit is a different Character. Raw numbering is not a runtime ID.
**Architecture base inspected:** latest merged `main` at `ad84f97` (PR #6 merged; E.3/F.5/G.4/H.1/I.4). Polyhymnia R4 and its local simultaneous policy are canonical, not a global AoE default for Nerovar.

## 1. Identity and selection

- Name **Nerovar** and Class **Warrior** are locked.
- Complete named kit: Passive, Basic, three Skills and Ultimate.
- Rank and native Element are not supplied. `BASE_DEPLOYMENT_COST = TBD_BY_COST_BUDGET`. These metadata are UNRESOLVED / NOT BLOCKING for the mechanics/architecture audit, with no invented rank, Element or budget.
- Sword/meteor/jump imagery supplies no extra Position mutation, Penetration, Guaranteed Hit, Shield Piercing or global True-Damage conversion. Explicit mechanics below determine those semantics.
- Fixed enemy Slots are authored spatial recipients. Standard turn-based Leader-at-Slot8 mapping explains the raw Leader example; Slot geometry is not a universal entity/Leader selector or a hidden target priority.

## 2. Source-defined kit

### 2.1 Passive — Death Pays the Fare / Tử Vong Trả Lộ Phí

Raw checkpoint: **Nerovar HP reaches zero**. The raw then states:

```text
Heal ally Leader for 50% Nerovar Max HP
→ Nerovar returns to Deck
→ his deployment cost decreases by 3, compatible with other kit reductions
```

Limit: **once per battle**. This is not a once-per-field-entry use; redeployment must not silently recreate that allowance.

HP_ZERO is not DEATH_CONFIRMED. Raw does not settle whether this transition prevents confirmed death or follows it, what HP/life state is returned to Deck, which effects proceed when Leader/return is invalid, or when the use is consumed. Those choices are blocking (§4). Do not import Alcestis's HP restoration, cleanup, use gates, Cost Bar grant or Action-cancellation policy.

The deployment reduction is an existing `CURRENT_DEPLOYMENT_COST` mutation candidate, not AE, Rage, Side Deployment Cost Bar or Base Cost. Normal ADD_CURRENT obeys current DEP-006 floor/lock law; stacking permission does not implicitly override a battle-remainder lock. Return itself does not include healing, Cost mutation or lifeSerial change.

### 2.2 Basic — Falling Scar / Lạc Ngân

One enemy receives the raw mixed formula **100% WIL/ATK**. Approach/slash imagery adds no separate movement operation. Typed components, target lock and formula snapshot await §4; another Character's mixed-Damage answer is not automatically an answer for Nerovar.

### 2.3 Skill 1 — Starfall Invocation / Dẫn Tinh Trụy Thế

- Cost: **30 AE plus HP equal to 5% source Max HP**.
- First direct group: meteor impacts **enemy Slot8**, with nominal **180% source ATK + 180% source WIL**. Raw's later Slot8 total (`280% WIL + 180% ATK + 10% source Current HP`) disambiguates its earlier shorthand; the coefficients are already source-defined.
- Second direct group: explosion on **enemy Slots5/7/8/9**. Each occupied legal recipient receives **100% source WIL** mitigated by RES plus a Physical/ATK-kind amount equal to **10% source Current HP** mitigated by ARM.
- Raw explicitly orders impact then explosion and describes Slot8 as receiving both portions when occupied/legal. Component/hit grouping, source snapshot timing, within-explosion batch policy and invalid-recipient profile still require explicit bindings.
- Raw emergency payment clause: when using this Skill below 5% MaxHP, keep Nerovar at **1 HP once per battle**; later uses below that threshold can kill him. MaxHP is not reduced, and Shield/ARM/RES do not reduce this HP payment.

The payment candidate is HP Cost, not a self-Damage packet. The one-use floor exception, positive underpayment/zero-payment success, exact-threshold behavior, atomic AE/HP commit and continuation after lethal payment require §4 answers. Do not hide this mechanic by converting it into HP Loss or weakening required Cost validation globally.

### 2.4 Skill 2 — Blood Returned / Huyết Hoàn

- Triggered by a Basic attack; paying **4 AE** enables Heal equal to **10% Damage caused by that Basic**.
- Limit: **once per turn** in raw wording. If AE is insufficient, this optional triggered mechanic does not activate.
- The raw does not add 4 AE to the admission cost of every Basic or cancel the original Basic when this payment fails.

Required clarification: qualifying Basic Action/provenance, Damage metric, trigger/payment checkpoint, what consumes the use, which precise actor/Action clock “turn” means, and whether non-Natural Basic Actions qualify. No global TURN_BOUNDARY or Natural-Action restriction is silently selected. Heal result/provenance must remain distinct from the causing Damage result.

### 2.5 Skill 3 — Sever the Mortal Measure / Đoạn Mệnh Xích

- Cost: **25 AE**.
- Enemy Slots **2/5/8** receive **True Damage = 50% Current HP**.
- Heal Nerovar for **20% total Damage caused** by this Skill; **DISCARD Overheal** is explicit.

The raw does not identify whose Current HP supplies the 50% formula. Source HP and each recipient's HP produce different gameplay; neither is assumed. True Damage follows current DMG-004/005, including ordinary Shield unless Shield Piercing is separately declared. Damage → dependent self-Heal is existing composition; the Damage metric and batch/snapshot semantics await §4.

### 2.6 Ultimate — Descend, Ruin, Reap / Giáng Thế · Phá Diệt · Thu Hoạch

- First direct group: attack the enemy at **Slot5**, raw Damage **150% WIL + ATK**.
- Then a second AoE group covers **Slot5 and the remaining enemy Slots** with the same mixed formula plus **True Damage = 5% Nerovar Max HP** per legal recipient.
- If Slot5 has no enemy, skip its first hit and perform the surrounding AoE. No replacement enemy is selected for that missing first-hit slot.

The second group is the full enemy-side AoE described by the raw; empty positions supply no enemy recipient. Mixed-formula coefficients/types, target locking, source snapshot, per-group simultaneous/sequential semantics and ordinary invalid-target behavior need explicit profiles. Jump/dance imagery does not create child Basic Actions or Position mutation. No readiness/Rage reset, free cast, cooldown, extra Action or Heal is invented.

## 3. Canon self-audit

Source facts retained: once-per-battle HP_ZERO Passive; Leader Heal 50% source MaxHP; return plus −3 deployment cost; Basic 100% mixed raw formula; Skill1 30 AE/5% MaxHP payment with a one-use 1-HP clause and lethal later use, Slot8 impact followed by Slots5/7/8/9 explosion; Skill2 4 AE/10% Basic Damage/once-per-turn; Skill3 25 AE/50% CurrentHP TRUE/20% total Damage Heal/DISCARD; Ultimate Slot5 first hit then AoE with 5% source MaxHP TRUE.

Owner HP versus recipient HP, HP Cost versus Damage/HP Loss, HP_ZERO versus confirmed death, Entity lock versus fixed Slot geometry, mandatory versus optional payment and source snapshot versus committed results are not collapsed. Battle-use counters must survive redeploy; no runtime branch is keyed to the duplicate raw number 52 or Character name.

The reconstruction found actual blocking gameplay questions rather than fabricating a generic gap. Raw selection and naming are complete; execution-ready normalization remains blocked on the relevant answers below.

## 4. Blocking designer clarification

Three clarification groups have been submitted. The bindings below remain explicit until answered; elapsed time is not approval or gameplay intent.

| Branch | Required decision |
| --- | --- |
| Passive life state | Death Prevention before DEATH_CONFIRMED versus confirmed-death transition; HP/life state in Deck and later redeployment eligibility; whether lethal Skill1 payment qualifies. |
| Passive dependency / use | Heal → return → −3 order, success/failure dependency, invalid/full-HP Leader, return failure and precise once-per-battle consumption checkpoint. Source-MaxHP snapshot and an applicable return-retention profile must be supplied; no private default. |
| Skill1 required payment | Same atomic AE/HP Cost transaction; successful first emergency underpayment/zero payment, lethal later payment, exactly-5%-HP behavior, Action continuation after source HP_ZERO/return/death and 10%-CurrentHP formula before/after payment. |
| Mixed Damage | Basic/Ultimate shorthand and PHYSICAL/WILL component/one-hit grouping; meteor coefficients are already disambiguated by the raw Slot8 example. No global armor bypass inferred from lore. |
| Skill2 scope / result / clock | Which actual Basic casts qualify; Actual HP Damage versus another metric; once-per-turn clock/payment/use semantics. Its direct-graph versus independent-settlement provenance must be declared before composition with external result collectors. |
| Skill3 formula / Heal | Source versus target CurrentHP; snapshot per recipient/common checkpoint; total Heal metric and result binding. |
| Target/snapshot/group policy | Lock entity/position context and source fields, impact→explosion and first-hit→AoE dependencies, within-group batch policy, no-target behavior, explicit ordinary invalid-recipient handling without implicit replacement. |
| Overheal | Skill3 DISCARD is locked. Passive/Skill2 policies use ordinary Heal law but need their authored profile completed; no automatic Shield conversion. Ultimate has no raw Heal Effect. |

Native metadata/budget and unsupported-Mode adaptations are UNRESOLVED / NOT BLOCKING for the architecture inventory. They are separate from these concrete gameplay questions. Different Modes must not convert actor Action/use clocks to seconds without a declared Mode profile.

## 5. Composition inventory before any generic extension

| Requirement | Current Schema input → Contract → owner / operation | Audit result |
| --- | --- | --- |
| HP_ZERO observer / possible death prevention | TriggerSpec + bounded Conditions/lifecycle Effects → DTH-001/002/003/005, TRG laws → current Trigger/Lifecycle/Death Evaluation; existing lifecycle operations | Relevant boundary exists. Do not choose prevention versus confirmed death or assert completed support before the locked terminal state is known. |
| Return to Deck + deployment reduction | ReturnToDeckSpec and DeploymentCostModificationSpec ADD_CURRENT −3 → DEP-006/007/008 → existing Deployment/Lifecycle Transaction and battle Current Cost state | Existing operations compose a valid explicit return and separately gated reduction; no copied Alcestis branch, implicit HP restoration, new Deployment Cost pool or private refund. |
| Battle use / emergency floor allowance | StateSpec/counter, Condition/limit, CostSpec/result references → ordinary State/lifetime/Cost laws → current State/Cost/Trigger owners | Battle persistence already exists. Dynamic successful-underpayment/lethal-Cost admission and exact consumption must be audited against the eventual answer; no generic gap is yet proved. |
| Mixed and TRUE spatial Damage | TargetSpec/AreaSpec fixed enemy Position set, component Damage profile, ResolutionSpec groups → DMG/TGT/SNP/RES laws → existing Spatial/Target/Snapshot/Damage/Transaction owners | Geometry and typed components exist. Formula/lock/batch parameters remain gameplay decisions, not new Tags/Primitives. |
| Basic-dependent optional Heal | Trigger/result binding + required settlement AE Cost + HealSpec → TRG-003, CST-001/009, HEL-001/002/003 → current Trigger/Cost/Heal/result owners | Candidate composition exists; insufficient AE skips the optional mechanic, not the Basic. Qualification, metric, provenance and cap clock still need answers. |
| Skill3 result-dependent Heal | DamageResultRef/aggregate → Heal formula → current DMG/HEL/RES Contracts → existing Result Store/Heal/Transaction owners | Use committed results, not nominal formula or Shield totals. Do not select the Damage metric by implementation convenience. |

No Character-specific Kernel, callback/middleware, global priority, new Functional Tag or new Primitive is proposed. For any eventual runtime delta, prove locked input → Contract → current owner → exact insufficiency → smallest extension after trying this inventory independently.

## 6. Impact audit across latest 00–08

This is an inventory and clarification-stage audit. Audit across nine files does not require patching all nine.

| File | Current decision |
| --- | --- |
| 00 | PATCH: this source/selection/status navigation; preserve current architecture revision authority. |
| 01 | NO CHANGE: current life/presence, Cost, actual-result, Action/clock and deployment meanings supply the necessary distinctions. |
| 02 | NO CHANGE: existing DAMAGE/PHYSICAL_DAMAGE/WILL_DAMAGE/TRUE_DAMAGE, SELF_HP_COST, HEAL and deployment/lifecycle capabilities; only derive final tags from clarified semantics. A once-only floor, Slot set or threshold is not a new Tag. |
| 03 | NO CHANGE: current Cost, Damage, Heal, State, deployment/lifecycle and spatial operations are the composition inventory. No failed primitive responsibility has been proved. |
| 04 | NO PATCH PROVEN; affected normalization deferred until §4. Typed Cost/lifecycle/target/result/group shapes must be tried first. |
| 05 | NO PATCH PROVEN; lethal/partial Cost, terminal life-state and checkpoint law audit depends on §4. Do not invent a universal lethal-Cost rule. |
| 06 | NO PATCH PROVEN; current owner/query/transaction services must be tested against the locked profiles. No Character-only manager or unproven generic extension. |
| 07 | NO CHANGE now: fixed Slot adapter/current SSI semantics are reused where applicable; other Mode behavior requires its own explicit profile. |
| 08 | NO CHANGE now: no MUST_PASS fixture may settle the unanswered gameplay. Add regression obligations only for clarified semantics and any proved architecture delta. |

Nerovar naming/raw selection and source reconstruction are complete. Full normalization, final generic-gap verdict and corresponding architecture/coverage patch remain pending the blocking designer decisions. This canon preserves those boundaries so later work starts from current repository facts.
