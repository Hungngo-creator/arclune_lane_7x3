# ARCLUNE — NEROVAR — CLARIFIED GAMEPLAY CANON

**Revision:** R3 — failed-return survival atomicity locked; prior Cost slice retained, remaining Damage/target/clock/result clarification in progress.
**Status:** PARTIALLY_NORMALIZED / CLARIFICATION_IN_PROGRESS. §2.1–2.3 preserve the new answers; §4 lists only decisions still required. This is not execution-ready full-Character data.
**Source:** current repository `ý tưởng nhân vật 3.md`, first #52 Warrior / **Death Pays the Fare**, explicitly named **Nerovar** by the designer. The later duplicate #52 SSR Mage/orb kit is separate content; raw numbering is not a runtime ID.
**Architecture base inspected:** actual merged `main` at `693f0cb` (PR #8; E.4/F.6/G.5/H.1/I.5). Prior Cost extensions are merged capabilities, not gaps to add again. R3 audits the newly locked prevention-completion boundary against this base. Polyhymnia R4's simultaneous groups are not a global AoE default for Nerovar.

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
→ stage survival HP = 1 inside the death-prevention transaction
→ validate/stage RETURN_TO_DECK in that same transaction
→ successful common commit: alive/HP1 + Deck transition + consume Passive use
→ attempt CURRENT_DEPLOYMENT_COST ADD_CURRENT −3
→ terminal Passive settlement
```

Successful prevention returns Nerovar to Deck **alive, Current HP = 1**, retained battle Deck membership, current deployment state Deck/undeployed; ordinary deployment legality/payment governs future DEPLOY_FROM_DECK. The survival assignment is not Heal and creates no Heal-received, Overheal, Lifesteal or Heal-modifier interaction. Do not emit a fake DEATH_CONFIRMED/Revive, or change lifeSerial merely for this return.

Leader Heal is a local attempt, not the return's success prerequisite: full HP may commit actualRestore = 0; invalid/illegal Leader skips/fails locally with no retarget, and the return still proceeds. An already committed Heal is not silently rolled back because the later transition fails. Its final snapshot/recipient profile still needs the remaining bindings in §4. Under HEL-002/003, unconsumed excess is Overheal result data with no implicit stored HP or Shield; this source authors no conversion Effect.

Consume the Passive use **only on successful RETURN_TO_DECK commit**, not on HP_ZERO, Passive start or Heal attempt. Failed return leaves the use unused, grants no −3 and resumes HP_ZERO death evaluation; ordinary DEATH_CONFIRMED may follow. HP1 survival belongs to the same death-prevention transaction as Return-to-Deck. On failed return it does not remain committed: for the unchanged subject retain HP0, leave this completion's presence/deployment/transition cleanup and Passive allowance proposals uncommitted, and resume the original HP_ZERO evaluation. Preserve any independently committed protected-state change rather than restoring a stale HP0 snapshot. No fake DEATH_PREVENTED/DEATH_CONFIRMED is emitted by the failed candidate. Earlier committed Leader Heal remains a separate Effect; no automatic rollback.

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

Current 01 §9.17 gives Damage-generated Heal the default **Actual HP Damage** basis: requested Heal = 0.10 × the qualifying Basic’s committed HP Damage, excluding Shield absorption/Overkill. Qualifying Basic identity/provenance, trigger/payment/use checkpoints, the precise clock and non-Natural Basic eligibility remain §4 questions; a designer may explicitly override the existing default, but missing animation/hit order is not a reason to invent a metric. Its Heal result is distinct from the causing Damage result. No global TURN_BOUNDARY or Natural-only restriction is selected silently.

### 2.5 Skill 3 — Sever the Mortal Measure / Đoạn Mệnh Xích

**25 AE**; enemies at Slots2/5/8 receive **TRUE Damage = 50% Current HP**; then Heal Nerovar for **20% total Damage caused by this Skill**, **DISCARD Overheal**.

Whose Current HP remains unanswered. The ordinary 01 §9.17 Damage-generated-Heal default supplies requested Heal = 0.20 × sum of qualifying Skill3 committed **Actual HP Damage**, excluding Shield/Overkill; final Action/Effect result scope and target checkpoints still need their bindings. TRUE follows ordinary DMG-004/005, including Shield unless separately pierced. Damage → result-dependent Heal already composes; formula/snapshot/batch/recipient parameters are gameplay decisions, not new Tags/Primitives.

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
| Passive remaining bindings | Source-MaxHP formula checkpoint, legal Leader recipient binding and applicable State/Shield return-retention profile. No imported Alcestis defaults. |
| Mixed Damage | Basic/Ultimate coefficients and PHYSICAL/WILL one-hit component grouping; meteor coefficients are source-defined, but its grouping still needs a binding. |
| Skill2 result / scope / clock | Actual Basic casts qualifying and qualifying result scope, trigger/payment/use checkpoints, exact once-per-turn clock, non-Natural qualification and direct-graph versus separate-settlement provenance. |
| Skill3 formula / Heal | Source versus target CurrentHP and snapshot checkpoint; qualifying result scope for the existing default Actual-HP-Damage Heal basis. |
| Target/source/group policy | Select/lock checkpoints and source ATK/WIL/MaxHP fields; impact→explosion and first-hit→AoE dependencies; within-group simultaneous versus explicitly ordered resolution; no-target and invalid-recipient policies without implicit replacement. |

The original third clarification group remains unanswered; the designer has now settled failed-return survival atomicity. Current concrete remaining questions have been resubmitted against the actual source. No elapsed-time default, global simultaneous-AoE default or hidden Slot/entity order resolves it. Native metadata/budget and unsupported-Mode adaptation remain **UNRESOLVED / NOT BLOCKING**; do not translate battle-use/Action clocks into seconds.

## 5. Independent composition and exact gap proof

The first four rows preserve R2’s proof against its then-current E.3/F.5/G.4 base; those deltas are already merged in E.4/F.6/G.5. The prevention row is freshly reconstructed against that current merged base. Gameplay input supplies the intended behavior; it does not by itself establish an architecture gap.

| Locked input / composition tried | Governing Contract and existing owner | Exact insufficiency in merged base | Smallest delta / verdict |
| --- | --- | --- | --- |
| Required AE30 + HP5% MaxHP together | CostSpec + requiredCostRefs → CST-001/003/008 → Cost validation / Transaction Manager; P-036 | None for fixed multi-Cost atomicity. | REUSE. Do not add a transaction system. |
| Strict-below one-use floor1 successful shortfall, later lethal shortfall, equality full payment | CostSpec validation/insufficientPolicy + State counter/Conditions + P-036's lethal-floor input → CST-003/009 → existing Cost/State/Transaction owners | Primitive already handles HP debit/resultingHP; high-level scalar policy/counter cannot bind mutually exclusive dynamic floors, successful shortfall and one-use consumption to the same required-group commit without ambiguous admission-side mutation. | E.4 §10.3A bounded hpPaymentPolicy; CST-014 protects input/case/counter with AE/HP atomic commit; G.5 §29A/58 lowers it through the same owners/P-036. No new Primitive or generic callback. |
| H_postCost used after mandatory prevention/return/death | Existing COST_PAYMENT_REF + P-036 resultingHP → CST-009 → Cost runtime / Result Store | Payment's minimum four fields have no typed post-payment HP; generic Action snapshots or actualPaidAmount cannot distinguish HP0 at payment from later preventionHP1. P-036 already produces the value, so a new snapshot system is unnecessary. | One HP-only immutable payment field CURRENT_HP_AFTER_PAYMENT in §35.3A/CST-009; G.5 §29A stores at commit before lifecycle publication and retains for pending Action/replay. |
| Admitted meteor survives Cost-caused source death/return | ActionSpec + Cost terminal barrier + DEP-007 → Action execution / Lifecycle / existing context | Return itself already does not auto-cancel. Base lacks an explicit Cost-caused HP_ZERO completion checkpoint and a typed continuation guarantee covering confirmed death before direct Effects. Ordinary cancellation/recipient legality cannot be guessed away. | Optional ActionSpec costLifecyclePolicy; CST-015; G.5 §23/29A lifecycle-before-direct checkpoint retaining the same admitted Action. No new scheduler/priority or permission for later dead-actor casts. |
| HP_ZERO prevention, Leader Heal attempt, successful return/use, then −3 | Trigger/Conditions/State + lifecycle/Heal/ReturnToDeck/DeploymentCost specs → DTH-003, DEP-006/007/008, HEL/TRG → existing Trigger/Lifecycle/Deployment/Heal/State/Transaction owners | DTH-003 and DEP-007 protect their separate outcomes; §77 has no typed same-subject Return completion reference joining survival/prevention success, transition and allowance. Sequential floor→Return commits leave HP1 on failure; a success Condition after independently committed Return exposes a half-state. | Add bounded deathPrevention completionTransitionRef/survivalHp/consumeCounterRef; DTH-007 joins existing P-061/Return/Lifecycle/State/Transaction owners at one barrier. Heal and subsequent −3 remain outside this atomic completion. No new Primitive/priority. |
| Mixed/TRUE spatial Damage and committed-result Heal | Target/Area/component/Resolution/result refs → DMG/TGT/SNP/RES/HEL → existing Target/Spatial/Snapshot/Damage/Heal/Result owners | No gap proved; remaining formula/result-scope/lock/group choices are §4 gameplay. | REUSE / defer only unresolved bindings. No hidden AoE order or fabricated new capability. |

Pure MIN/MAX can compute a payable amount, but substituting that amount for the requested Cost erases H_req and its authoritative requestedAmount receipt. A later State Effect cannot make safeguard consumption part of required AE/HP admission commit; a probe-time State mutation violates read-only admission. Splitting the cases into new child casts changes Action/payment identity. Those attempted compositions therefore do not meet the locked transaction semantics.

Prior runtime proof remains CST-014/009/015 through existing Cost/State/Result/Action/Lifecycle owners. R3 adds only Schema deathPrevention completion input → DTH-007 → current P-061/Lifecycle, §10C Return, State and Transaction owners → missing success-dependent common commit → joined prevention/Return transaction. Save/load retains transaction/case/receipt and continuation identity, not a new manager.

## 6. Impact audit across 00–08

| File | Decision / affected section |
| --- | --- |
| 00 | PATCH: current revision navigation and this partial-normalization status; latest merged sources remain authoritative. |
| 01 | NO CHANGE: HP Cost/loss/Damage, HP_ZERO/death, Action/presence/deployment/result meanings already distinct. |
| 02 | NO CHANGE: existing semantic capabilities; payment floor, receipt field and continuation checkpoint are Schema/Contract data, not Tags. |
| 03 | NO CHANGE: P-036 already commits HP Cost and returns resultingHP; lifecycle/deployment/State composition remains available. |
| 04 | R3 PATCH: §14/15 consistent Effect surface, §77.1 typed prevention completion, §51/52 lowering and §92 validation. R2’s Cost/Action/result surfaces are already merged and retained. |
| 05 | R3 PATCH: DTH-003 reference/DTH-007 completion law; §38 Summon Identity ENT-015 migration. CST-003/009/014/015 remain merged and unchanged. |
| 06 | R3 PATCH: §§10C/83 join existing Return/State/Lifecycle transaction and §168 replay persistence. Prior §§23/29A/58 Cost semantics remain unchanged. |
| 07 | NO CHANGE: Side AE/current Slot/SSI owners reused; undeclared other-Mode adaptation remains explicit. |
| 08 | R3 PATCH: M-054/M-055 joined success/failure/replay/rejection obligations; retain prior Cost/Pilot fixtures, no executable game tests. |

## 7. Prior R2 own-draft correction and six-pass scope

Adversarial reconstruction corrected two tempting duplications: read P-036's existing resultingHP through CostPaymentResult instead of adding SnapshotTiming/service; reuse DEP-007's noncanceling return, extending only the missing Cost/death boundary. It also narrowed the old “committed payment outcome uses actualPaidAmount” wording to amount-paid formulas, rejected conflicting legacy/new floor authoring, and guarded runtime continuation with terminal **successful** Cost rather than any terminal result.

The six-pass audit applies to this locked Cost slice: semantic fidelity (strict inequality/equality, consumption, immutable HP0 before prevention), independent composition, layer/namespace/lifetime, determinism/negative space, current source/prompt compliance and mergeability/regression obligations. Full-Character normalization remains pending §4; no audit label makes those missing gameplay answers resolved.

Recorded R2 final audit for its scoped Cost patch (historical; R3 audit is separate):

1. Semantic fidelity: user-locked Cost table, post-payment HP checkpoint, successful return/use/−3 facts retained; §4 unanswered choices remain visible.
2. Independent composition: fixed multi-Cost, P-036 output and DEP-007 reuse; only bounded payment/result/lifecycle gaps extended.
3. Layer/namespace/lifetime: existing State/Cost/Action/Result/Lifecycle owners; distinct battle counters, protected commit and replay lifetime; new CST/M IDs unique. R2 recorded the pre-existing F.5 **ENT-010** collision as nonblocking. R3 audits/resolves it: Puppet death/ordinary Revive keeps ENT-010, while the later Summon Identity block becomes ENT-015. Neither law is deleted; other IDs are unchanged. See §8.
4. Determinism/negative space: exact equality, paid0, failed AE/probe/abort, case permutation/overlap, competing counter writes, invalid recipient and save/replay attacked; rejection and terminal-success laws corrected.
5. Source/prompt: latest root AGENTS and merged base, newest designer answers, Architecture Phase, explicit automatic-merge authorization; no raw/code edit or invented unresolved gameplay.
6. Mergeability: actual six-file diff and documentation checks inspected; prior declarative cases and six prior canons unchanged; 01/02/03/07 unchanged. Verify latest main and expected PR head again at publication; this does not claim full-Character or executable engine validation.

## 8. Current ENT migration and R3 prevention audit

History follows `05_CONTRACTS.md` → `05_CONTRACTS-1.md` → `05_CONTRACTS.md`. Both distinct ENT-010 blocks already coexist at initial tracked commit `8a9876e` (2026-09-11); `1e27315`, `b43fd23` and `8a191b5` retain them. Git history does not prove one obsolete or chronologically newer. The later document block, Summon Identity, moves to next unused ID **ENT-015**; ENT-010 remains inhabited-Puppet death/ordinary Revive. All repository references were searched; the only external mention was this canon’s historical collision audit, now resolved. Bare old ENT-010 cannot alias universally to ENT-015 because it still names the Puppet Contract.

The new locked success/failure matrix is: success atomically exposes alive/HP1 + Deck/undeployed + retained membership + selected cleanup + consumed Passive use, then separately attempts −3; transition/counter/validation failure commits none of those completion deltas, performs no −3 and resumes the same death-evaluation context; for the unchanged source it leaves HP0/use unused. Protected-read conflicts preserve/revalidate the latest authoritative state rather than restoring stale prepare snapshots over other commits. Leader Heal full/invalid/local failure is not the completion gate. Existing immutable H_postCost from Skill1 remains 0 if Cost committed HP0, regardless of successful prevention afterward.

A failed prevention candidate is terminal for its current HP_ZERO evaluation, without consuming its battle allowance; it is not re-enqueued indefinitely while HP remains0. This does not decide unrelated Death Prevention priority or block an eligible later HP_ZERO episode. Remaining recipient/retention/target/group/clock bindings in §4 stay pending designer input. HEL-002/003 supplies no implicit excess storage/conversion; absent an authored consumer, excess is discarded after result use. Skill3 also explicitly locks DISCARD in raw.

R3 clarified Passive normalization fragment:

- Source-owned HP_ZERO eligibility, unused battle-participant allowance checked without consumption; mandatory P-061 lifecycle dispatch before confirmation, not a delayed ordinary Reaction.
- Separate Leader Heal attempt; its binding/profile remains §4 until supplied. Local failure/actualRestore0 does not gate completion.
- One SYSTEM_LIFECYCLE/DEATH_PREVENTION completion plan: survivalHp1, local same-source/current-instance ReturnToDeckSpec and source-owned battle consumeCounterRef. Selected counter must persist through the declared transition retention profile. No eager Trigger use consumption of that same allowance.
- Return operand staged exactly once in the completion transaction; successful common commit supplies the existing P-061 terminal prevention/transition result binding. The same-instance result gates later −3; live Deck/HP or another return cannot substitute for this success. Failed completion adds no survival/use/cleanup/transition delta and is terminal for this evaluation.
- Success-dependent ADD_CURRENT−3 is a later explicit deployment Effect; never part of the survival/return rollback unit. Existing floor/lock and H_postCost immutable result/Skill1 continuation laws remain unchanged.

Own-draft adversarial corrections: the already-used SYSTEM_LIFECYCLE family is listed consistently in §15, deathPrevention is declared in the central EffectSpec, and success-dependent −3 binds the existing P-061 result of this instance rather than unrelated live Deck state. Failure discards **proposals**, it does not restore pre-transaction HP/counter/presence over independent commits. An unchanged lethal source staysHP0/use unused; changed protected state is preserved and the same evaluation revalidated. Other unclarified prevention priorities and Character retention/Heal/target rules remain visible rather than being invented.

Current-default recovery during independent audit: 01 §9.17 supplies Actual HP Damage for Damage-generated Heal (Skill2/3); HEL-002/003 supplies no automatic Overheal storage/Shield without a separately authored consumer. These are current canonical defaults, not inferred new designer decisions. The submitted metric/Overheal questions may receive an explicit override, but default reuse itself is not a remaining blocker. Threshold/Action-source and clock checkpoints still require the exact authored bindings above.

## 9. R3 final six-pass audit — scoped completion and ID repair

1. **Semantic fidelity — PASS for the locked slice:** success joins survival/Return/use, failed completion adds none of those deltas or −3, earlier Heal remains independent, and later Cost lock/floor cannot undo success. Skill1's immutable payment HP and admitted continuation remain unchanged. §4 still blocks dependent full-Character bindings.
2. **Independent composition — ACCEPT WITH CORRECTION:** separate survival and Return nodes fail the common-commit requirement; existing P-061/Return/State/Transaction owners suffice with the bounded completion reference. Reuse P-061's outcome and existing Heal defaults; no new Primitive, Tag, callback or manager.
3. **Layer / namespace / lifetime — PASS:** Schema carries typed inputs, DTH-007 governs completion, Kernel coordinates existing owners. The battle allowance survives the selected retention profile and terminal identity survives dependent work/replay. History/reference audit keeps both ENT laws and moves only Summon Identity to ENT-015.
4. **Determinism / negative space — PASS for authored obligations:** failed Return, missing/exhausted/cleanup-discarded allowance, local zero/invalid Leader Heal, Cost lock/clamp, protected-state conflict, foreign outcome, duplicate lowering, replay and later redeploy are covered by M-054/M-055. No hidden prevention/Slot priority or failed-candidate retry loop is added. Character cleanup/target/batch choices remain explicit questions.
5. **Prompt / source contradiction — PASS:** latest actual main and root AGENTS used; newest atomicity answer supersedes the former open item. Prior Cost/Pilot semantics retained. Phanes is separate named source; no answer is copied across kits. Architecture Phase only, automatic merge already authorized.
6. **Mergeability — PASS for this scoped diff:** actual diff inspected and documentation checks passed: no Contract ID collision, 221 other Contract blocks and 184 prior declarative cases preserved, prior six Character canons and 01/02/03/07 unchanged, Phanes raw mechanics/other kits/EOF preserved exactly. Publication still verifies current base and expected PR head. This is no claim that pending §4 is resolved or that an executable engine was validated.
