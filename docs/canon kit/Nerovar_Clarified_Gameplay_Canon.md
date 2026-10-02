# ARCLUNE — NEROVAR — CLARIFIED GAMEPLAY CANON

**Revision:** R2 — designer-locked HP_ZERO prevention and Skill1 Cost; bounded Cost normalization/gap audit completed, remaining kit clarification in progress.
**Status:** PARTIALLY_NORMALIZED / CLARIFICATION_IN_PROGRESS. §2.1–2.3 preserve the new answers; §4 lists only decisions still required. This is not execution-ready full-Character data.
**Source:** current repository `ý tưởng nhân vật 3.md`, first #52 Warrior / **Death Pays the Fare**, explicitly named **Nerovar** by the designer. The later duplicate #52 SSR Mage/orb kit is separate content; raw numbering is not a runtime ID.
**Architecture base inspected:** actual merged `main` at `52ef661` (PR #7; E.3/F.5/G.4/H.1/I.4). This revision records the scoped E.4/F.6/G.5/I.5 Cost delta below. Polyhymnia R4's simultaneous groups are not a global AoE default for Nerovar.

## 1. Identity and selection

- Name **Nerovar**, Class **Warrior**; complete raw kit with Passive, Basic, three Skills and Ultimate.
- Rank/native Element unspecified; `BASE_DEPLOYMENT_COST = TBD_BY_COST_BUDGET`. These are UNRESOLVED / NOT BLOCKING for the present architecture audit, without invented rank, Element or budget.
- Sword/meteor/jump imagery adds no Position mutation, Penetration, Guaranteed Hit, Shield Piercing or global True-Damage conversion.
- Enemy Slot numbers are authored spatial recipients. The standard turn-based Leader-at-Slot8 mapping explains the raw Leader example; fixed geometry is not a universal Leader/entity selector or hidden target priority.

## 2. Clarified kit and source-defined remainder

### 2.1 Passive — Death Pays the Fare / Tử Vong Trả Lộ Phí

**Locked:** Death Prevention at **HP_ZERO**, before **DEATH_CONFIRMED**, when Nerovar transitions from HP > 0 to 0 and the once-per-battle Passive is unused. HP Cost can cause this transition; it remains Cost, not Damage.

```text
HP_ZERO → eligibility/use check
→ attempt Heal ally Leader for 50% Nerovar Current MaxHP
→ establish Nerovar survival HP = 1
→ RETURN_TO_DECK
→ successful return: consume Passive once-per-battle use
→ attempt CURRENT_DEPLOYMENT_COST ADD_CURRENT −3
→ terminal Passive settlement
```

Successful prevention returns Nerovar to Deck **alive, Current HP = 1**, retained battle Deck membership, current deployment state Deck/undeployed; ordinary deployment legality/payment governs future DEPLOY_FROM_DECK. The survival assignment is not Heal and creates no Heal-received, Overheal, Lifesteal or Heal-modifier interaction. Do not emit a fake DEATH_CONFIRMED/Revive, or change lifeSerial merely for this return.

Leader Heal is a local attempt, not the return's success prerequisite: full HP may commit actualRestore = 0; invalid/illegal Leader skips/fails locally with no retarget, and the return still proceeds. An already committed Heal is not silently rolled back because the later transition fails. Its final snapshot/Overheal/recipient profile still needs the remaining bindings in §4.

Consume the Passive use **only on successful RETURN_TO_DECK commit**, not on HP_ZERO, Passive start or Heal attempt. Failed return leaves the use unused, grants no −3 and resumes HP_ZERO death evaluation; ordinary DEATH_CONFIRMED may follow. How the pre-return survival assignment participates in a failed return is the pending atomicity question in §4; do not decide it by implementation convenience.

The post-success −3 uses existing DEP-006 ADD_CURRENT semantics: compatible reductions compose, existing floor/lock still applies. A clamped/blocked reduction does not roll back return or refund the already consumed Passive use. This is Current Deployment Cost, not Base Cost, AE, Rage or Side Deployment Cost Bar. No Alcestis restoration/cleanup/use gate or cancellation profile is copied into Nerovar.

### 2.2 Basic — Falling Scar / Lạc Ngân

One enemy receives raw mixed formula **100% WIL/ATK**. Approach/slash imagery creates no separate movement. Typed-component/hit grouping, target lock and formula snapshot await §4; another Character's answer is not Nerovar's answer.

### 2.3 Skill 1 — Starfall Invocation / Dẫn Tinh Trụy Thế

**Locked required Cost:** **30 Side AE + 5% Nerovar Current MaxHP**, one required CostGroup/transaction. HP Cost is not HP Loss/self-Damage and bypasses Shield/ARM/RES. Validate required AE and HP together; no debit survives a required transaction failure.

At the Cost checkpoint freeze `H_req = 5% Current MaxHP`, `H_before = Current HP` and Skill1 safeguard availability. These amounts follow the existing numeric policy; this kit defines no new rounding rule.

| Pre-payment condition | Actual HP paid | HP immediately after payment | Outcome / safeguard |
| --- | --- | --- | --- |
| H_before < H_req; safeguard unused | max(0, H_before − 1) | 1 | Success; consume safeguard only with successful entire required transaction and Skill admission. |
| H_before < H_req; safeguard already used | H_before | 0 | Success, intentional lethal shortfall payment; not insufficient-HP Cost failure. |
| H_before >= H_req | H_req | H_before − H_req | Full payment; safeguard does not apply, including equality. |

The Skill1 safeguard is its own **once-per-battle** allowance, distinct from the Passive's once-per-battle use. Failed AE, a read-only admission probe, required-payment failure or aborted transaction consumes neither the Skill1 allowance nor HP. Redeployment does not reset either battle allowance. The first strict-below case explicitly permits successful partial/zero payment; it does not weaken unrelated mandatory full-payment exchanges.

At successful HP-payment commit bind immutable **H_postCost = Nerovar Current HP immediately after that payment**, **before** HP_ZERO/prevention/Heal/return/death side-effects. The explosion's Physical HP-scaling component is **10% H_postCost**. Do not read live post-prevention HP or reconstruct this value from a later net HP difference.

Examples: 1000 − 500 = 500 → HP component 50; first emergency floor1 → component 0.1 under the ordinary numeric policy; lethal payment → H_postCost0 and component0 even if the Passive later establishes HP1.

```text
entire required Cost transaction commits successfully
→ capture immutable payment results, including H_postCost
→ complete mandatory HP_ZERO / prevention / death processing if caused
→ continue this same already-admitted Skill1 direct Effect graph
```

Meteor/explosion still resolve if that processing returns Nerovar to Deck or confirms his death, unless a separately explicit future cancellation Contract applies. No new Action/admission, payment replay, resurrection or retarget occurs. ATK/WIL use their ordinary authored Action source snapshot separately; H_postCost does not freeze those stats or move their checkpoint. Final ATK/WIL/target bindings remain in §4.

**Source-defined direct groups:** meteor impacts enemy Slot8 for **180% source ATK + 180% source WIL**, then explosion on enemy Slots5/7/8/9 for **100% source WIL** (RES) + **Physical 10% H_postCost** (ARM). Raw's Slot8 total explicitly disambiguates the meteor coefficients and confirms both groups may hit Slot8. Component/hit grouping, within-explosion batch policy and locked-recipient invalidation still require §4.

### 2.4 Skill 2 — Blood Returned / Huyết Hoàn

A Basic may trigger an optional mechanic paying **4 AE** to Heal **10% Damage caused by that Basic**, at most **once per turn** in raw wording. Insufficient AE skips this mechanic; it does not add mandatory Cost to or cancel every Basic.

Qualifying Basic identity/provenance, actual Damage metric, trigger/payment/use checkpoints, the precise clock and non-Natural Basic eligibility remain §4 questions. Its Heal result is distinct from the causing Damage result. No global TURN_BOUNDARY or Natural-only restriction is selected silently.

### 2.5 Skill 3 — Sever the Mortal Measure / Đoạn Mệnh Xích

**25 AE**; enemies at Slots2/5/8 receive **TRUE Damage = 50% Current HP**; then Heal Nerovar for **20% total Damage caused by this Skill**, **DISCARD Overheal**.

Whose Current HP and which committed Damage metric remain unanswered. TRUE follows ordinary DMG-004/005, including Shield unless separately pierced. Damage → result-dependent Heal already composes; formula/snapshot/batch/recipient parameters are gameplay decisions, not new Tags/Primitives.

### 2.6 Ultimate — Descend, Ruin, Reap / Giáng Thế · Phá Diệt · Thu Hoạch

First attack enemy Slot5 for raw **150% WIL + ATK**, then full enemy-side AoE (including Slot5) with that mixed formula plus **TRUE Damage = 5% Nerovar MaxHP** per legal recipient. Empty Slot5 skips its first hit; no replacement enemy.

Mixed coefficients/types, source/target snapshots, per-group batch policy and invalid-target behavior await §4. Empty positions supply no enemy. Jump/dance imagery creates no child Basic or Position mutation. No Heal, free cast, extra Action, readiness/Rage reset or cooldown is invented.

## 3. Canon self-audit and bounded normalization

Raw coefficients, fixed Slots, optional Skill2 payment, Skill3 DISCARD and Ultimate's absence of Heal remain intact. New designer answers replace the old Passive life-state and Skill1 Cost questions. HP_ZERO is not confirmed death; survival HP1 is not Heal; Current Deployment Cost is not Cost Bar; HP after payment is not HP paid or live source HP.

**Normalized clarified Skill1 Cost fragment (not full Ability IR):**

- Action identity SKILL; `costLifecyclePolicy = CONTINUE_ADMITTED_ACTION`.
- Required CostGroup references existing singular Side-AE Cost30 and singular source-HP Cost `0.05 × Current MaxHP`.
- Existing source-owned battle State/counter holds one remaining Skill1 safeguard use; separate from the Passive use counter.
- HP Cost opts into `hpPaymentPolicy` cases: BELOW_REQUESTED + counter available → floor1 / CLAMP_SUCCESS / consume one counter unit; BELOW_REQUESTED + exhausted → floor0 / CLAMP_SUCCESS; AT_OR_ABOVE_REQUESTED → floor0 / REQUIRE_FULL. Guard meanings and amounts are frozen once for that transaction, never chosen by case order.
- Successful HP result binding is read as `COST_PAYMENT_REF.field = CURRENT_HP_AFTER_PAYMENT`; explosion HP component consumes that value, not ACTUAL_PAID_AMOUNT. Full target/Damage/snapshot IR stays deferred until §4.
- Existing SELF_HP_COST and declared Damage capabilities suffice; no Character-ID branch, new Functional Tag or Primitive.

Partial payment remains an explicit opted-in exception. Phần Tinh's full-payment exchange/own-direct bonus does not inherit it; Sanguinius distributed Costs retain their existing membership/result barriers. Failed Cost produces no meteor, no committed floor and no allowance consumption.

## 4. UNRESOLVED / NEED USER DECISION

Answers are pending only for dependent branches. Continue the locked Cost architecture; do not turn pending gameplay into REQUIRED defaults merely to finish normalization.

| Branch | Remaining decision |
| --- | --- |
| Passive failure atomicity | Is HP1 committed only with successful return, leaving HP0 when return fails, or separately before return with another explicit failure HP rule? The first two Passive/Skill1 clarification groups are answered; this concrete consequence still needs a choice. |
| Passive remaining bindings | Source-MaxHP formula checkpoint, authored Heal Overheal/recipient binding and applicable State/Shield return-retention profile. No imported Alcestis defaults. |
| Mixed Damage | Basic/Ultimate coefficients and PHYSICAL/WILL one-hit component grouping; meteor coefficients are source-defined, but its grouping still needs a binding. |
| Skill2 result / scope / clock | Actual Basic casts qualifying, Damage metric, trigger/payment/use checkpoints, exact once-per-turn clock, non-Natural qualification and direct-graph versus separate-settlement provenance. |
| Skill3 formula / Heal | Source versus target CurrentHP, snapshot checkpoint and committed total-Damage metric. |
| Target/source/group policy | Select/lock checkpoints and source ATK/WIL/MaxHP fields; impact→explosion and first-hit→AoE dependencies; within-group simultaneous versus explicitly ordered resolution; no-target and invalid-recipient policies without implicit replacement. |
| Overheal | Skill3 DISCARD locked. Passive/Skill2 authored policies remain to be completed; no automatic Shield conversion. Ultimate has no Heal. |

The earlier third clarification group remains unanswered. No elapsed-time default, global simultaneous-AoE default or hidden Slot/entity order resolves it. Native metadata/budget and unsupported-Mode adaptation remain **UNRESOLVED / NOT BLOCKING**; do not translate battle-use/Action clocks into seconds.

## 5. Independent composition and exact gap proof

Each row starts from actual merged E.3/F.5/G.4, before this draft. Gameplay input supplies the intended behavior; it does not by itself establish an architecture gap.

| Locked input / composition tried | Governing Contract and existing owner | Exact insufficiency in merged base | Smallest delta / verdict |
| --- | --- | --- | --- |
| Required AE30 + HP5% MaxHP together | CostSpec + requiredCostRefs → CST-001/003/008 → Cost validation / Transaction Manager; P-036 | None for fixed multi-Cost atomicity. | REUSE. Do not add a transaction system. |
| Strict-below one-use floor1 successful shortfall, later lethal shortfall, equality full payment | CostSpec validation/insufficientPolicy + State counter/Conditions + P-036's lethal-floor input → CST-003/009 → existing Cost/State/Transaction owners | Primitive already handles HP debit/resultingHP; high-level scalar policy/counter cannot bind mutually exclusive dynamic floors, successful shortfall and one-use consumption to the same required-group commit without ambiguous admission-side mutation. | E.4 §10.3A bounded hpPaymentPolicy; CST-014 protects input/case/counter with AE/HP atomic commit; G.5 §29A/58 lowers it through the same owners/P-036. No new Primitive or generic callback. |
| H_postCost used after mandatory prevention/return/death | Existing COST_PAYMENT_REF + P-036 resultingHP → CST-009 → Cost runtime / Result Store | Payment's minimum four fields have no typed post-payment HP; generic Action snapshots or actualPaidAmount cannot distinguish HP0 at payment from later preventionHP1. P-036 already produces the value, so a new snapshot system is unnecessary. | One HP-only immutable payment field CURRENT_HP_AFTER_PAYMENT in §35.3A/CST-009; G.5 §29A stores at commit before lifecycle publication and retains for pending Action/replay. |
| Admitted meteor survives Cost-caused source death/return | ActionSpec + Cost terminal barrier + DEP-007 → Action execution / Lifecycle / existing context | Return itself already does not auto-cancel. Base lacks an explicit Cost-caused HP_ZERO completion checkpoint and a typed continuation guarantee covering confirmed death before direct Effects. Ordinary cancellation/recipient legality cannot be guessed away. | Optional ActionSpec costLifecyclePolicy; CST-015; G.5 §23/29A lifecycle-before-direct checkpoint retaining the same admitted Action. No new scheduler/priority or permission for later dead-actor casts. |
| HP_ZERO prevention, Leader Heal attempt, successful return/use, then −3 | Trigger/Conditions/State + lifecycle/Heal/ReturnToDeck/DeploymentCost specs → DTH-003, DEP-006/007/008, HEL/TRG → existing Trigger/Lifecycle/Deployment/Heal/State/Transaction owners | Basic meanings, return transition, separate result-gated −3, battle persistence and noncanceling return exist. Failed-return survival atomicity is not yet clarified. | REUSE known boundaries; dependent prevention-transition normalization deferred. No new DTH runtime profile claimed from an unanswered choice. |
| Mixed/TRUE spatial Damage and committed-result Heal | Target/Area/component/Resolution/result refs → DMG/TGT/SNP/RES/HEL → existing Target/Spatial/Snapshot/Damage/Heal/Result owners | No gap proved; remaining formula/metric/lock/group choices are §4 gameplay. | REUSE / defer only unresolved bindings. No hidden AoE order or fabricated new capability. |

Pure MIN/MAX can compute a payable amount, but substituting that amount for the requested Cost erases H_req and its authoritative requestedAmount receipt. A later State Effect cannot make safeguard consumption part of required AE/HP admission commit; a probe-time State mutation violates read-only admission. Splitting the cases into new child casts changes Action/payment identity. Those attempted compositions therefore do not meet the locked transaction semantics.

Runtime-extension proof is therefore Schema input → CST-014/009/015 → existing Cost/State/Result/Action/Lifecycle owners → specific missing typed law → the bounded extensions above. Save/load retains transaction/case/receipt and continuation identity, not a new manager.

## 6. Impact audit across 00–08

| File | Decision / affected section |
| --- | --- |
| 00 | PATCH: current revision navigation and this partial-normalization status; latest merged sources remain authoritative. |
| 01 | NO CHANGE: HP Cost/loss/Damage, HP_ZERO/death, Action/presence/deployment/result meanings already distinct. |
| 02 | NO CHANGE: existing semantic capabilities; payment floor, receipt field and continuation checkpoint are Schema/Contract data, not Tags. |
| 03 | NO CHANGE: P-036 already commits HP Cost and returns resultingHP; lifecycle/deployment/State composition remains available. |
| 04 | PATCH: ActionSpec continuation, CostSpec bounded hpPaymentPolicy, HP-only result binding and validator invariants. |
| 05 | PATCH: CST-003 exception reference, CST-009 immutable HP field, CST-014 payment profile, CST-015 lifecycle continuation. |
| 06 | PATCH: §23 Cost-caused lifecycle checkpoint; §29A protected case/counter/commit result and retained Action context; §58 HP Cost delegation; §168 persistence. |
| 07 | NO CHANGE: Side AE/current Slot/SSI owners reused; undeclared other-Mode adaptation remains explicit. |
| 08 | PATCH: M-051–M-053 declarative payment, commit-HP/lifecycle/continuation and rejection obligations; preserve prior fixtures, no executable game tests. |

## 7. Own-draft correction and six-pass scope

Adversarial reconstruction corrected two tempting duplications: read P-036's existing resultingHP through CostPaymentResult instead of adding SnapshotTiming/service; reuse DEP-007's noncanceling return, extending only the missing Cost/death boundary. It also narrowed the old “committed payment outcome uses actualPaidAmount” wording to amount-paid formulas, rejected conflicting legacy/new floor authoring, and guarded runtime continuation with terminal **successful** Cost rather than any terminal result.

The six-pass audit applies to this locked Cost slice: semantic fidelity (strict inequality/equality, consumption, immutable HP0 before prevention), independent composition, layer/namespace/lifetime, determinism/negative space, current source/prompt compliance and mergeability/regression obligations. Full-Character normalization remains pending §4; no audit label makes those missing gameplay answers resolved.

Recorded final audit for this scoped patch:

1. Semantic fidelity: user-locked Cost table, post-payment HP checkpoint, successful return/use/−3 facts retained; §4 unanswered choices remain visible.
2. Independent composition: fixed multi-Cost, P-036 output and DEP-007 reuse; only bounded payment/result/lifecycle gaps extended.
3. Layer/namespace/lifetime: existing State/Cost/Action/Result/Lifecycle owners; distinct battle counters, protected commit and replay lifetime; new CST/M IDs unique. A pre-existing F.5 **ENT-010** collision (“Inhabited Puppet Death and Ordinary Revive” / “Summon Identity”) remains **UNRESOLVED / NOT BLOCKING** for this Cost patch, which references neither ambiguous ID. No unrelated renumbering is included.
4. Determinism/negative space: exact equality, paid0, failed AE/probe/abort, case permutation/overlap, competing counter writes, invalid recipient and save/replay attacked; rejection and terminal-success laws corrected.
5. Source/prompt: latest root AGENTS and merged base, newest designer answers, Architecture Phase, explicit automatic-merge authorization; no raw/code edit or invented unresolved gameplay.
6. Mergeability: actual six-file diff and documentation checks inspected; prior declarative cases and six prior canons unchanged; 01/02/03/07 unchanged. Verify latest main and expected PR head again at publication; this does not claim full-Character or executable engine validation.
