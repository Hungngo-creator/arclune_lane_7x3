# ARCLUNE — SAVITAR — CLARIFIED GAMEPLAY CANON

**Revision:** R1 — new raw kit and nine current designer locks.
**Status:** GAMEPLAY_PARTIALLY_CLARIFIED / NORMALIZATION_IN_PROGRESS. Architecture Phase documentation; not executable Character data.
**Source:** current Savitar raw description and SAVITAR — DESIGNER LOCK supplied by the designer; raw entry77 in `Ý tưởng nhân vật 4.md`. Explicit locks supersede contrary raw examples, including Basic itself activating the fixed-AoE Passive.
**Architecture base inspected:** actual merged main `fc46805274a9878c3df796accab037d7cb303261`, INDEX-10 / E.8 / F.10 / G.9 / H.1 / I.9. Proposed extensions do not become current architecture until merged.

## 1. Identity and negative boundaries

**Savitar**, inspired by the namesake from DC's The Flash. Rank/Class/Native Element/base stats remain **UNRESOLVED / NOT BLOCKING**; `BASE_DEPLOYMENT_COST = TBD_BY_COST_BUDGET`. Do not infer Rank, Class, Element, Authority or a numerical speed modifier from inspiration or animations.

Names: Passive **Lôi Ảnh Hoán Vị**; Basic **Tốc Kích Trọng Quyền**; Skill1 **Lôi Trụ Quán Trường**; Skill2 **Dị Tuyến Quy Lai**; Skill3 **Tốc Giới Quá Tải**; Ultimate **Tốc Thần · Thiên Lôi Quán Giới**.

Only Passive's successful relocation changes gameplay Position. Basic rush, Skill1 charging run, Skill2 time travel and Skill3 speed imagery are VFX. The afterimage has no Entity, occupancy, HP, targetability or gameplay Position. There is no default Reflect/counter recursion, Follow-up, extra Natural Action, SSI advance or Natural-class regeneration from its linked non-Natural settlement.

All Damage hits below have PHYSICAL ATK and WILL WIL components of one hit, not separate hits. Ordinary Hit Admission/Authority applies independently of reference binding. Slot targeting does not imply Guaranteed Hit; Entity binding does not by itself grant Guaranteed Hit either. AE is ordinary Side/shared AE under the active Mode. Root Ultimate readiness/Rage payment is not waived by a child's AE override.

## 2. Locked kit

### 2.1 Basic — Tốc Kích Trọng Quyền

Choose one occupied legal enemy Slot → lock its coordinate → resolve one hit **PHYSICAL100% ATK + WILL100% WIL** against the current legal occupant read at the Damage commit checkpoint. Do not follow the original Entity. An empty Slot yields **MISS / no Damage**. A different legal Entity that now occupies that coordinate receives the hit. No selection of another Slot, target reroll or chase is allowed. Source ATK/WIL checkpoint is tracked in §4 until answered; no unstated snapshot is invented.

The Basic's single Slot is not fixed positional AoE. It cannot itself activate Lôi Ảnh Hoán Vị. A defender may move through another explicitly qualifying mechanic; the Basic still reads only its original coordinate.

### 2.2 Passive — Lôi Ảnh Hoán Vị

On new Field Presence, create an owner/current-presence charge **AVAILABLE**. At each Savitar actually completed Natural Action, refresh to AVAILABLE whether used or unused. **CC-lost opportunity does not refresh**. Leave Field clears the window; redeploy/new Presence starts AVAILABLE. This clock is completion-based, not actor-window opportunity reset or global TURN_BOUNDARY.

Only an enemy actually performed Natural Action's direct/explicitly declared outcome Damage with an authored **fixed positional area** may qualify. Its geometry/Slot set must be fixed before resolution, without random-target selection. Full-field fixed AoE qualifies. Exclude single Entity/Slot-target hits, random AoE/multi-target, independent DoT/Mark/Reaction/Counter/Follow-up/unrelated Passive Damage merely sharing lineage. Check current Savitar Slot inside that frozen area while charge AVAILABLE and not Skill2-temporally absent.

**Pre-Damage relocation:** before recipient Damage resolution, build all allied Mode-legal **TRULY_EMPTY** destination Slots. Exclude own current coordinate and any active occupant, deployment reservation, death-waiting/pending-Revive reservation, temporary-absence owner, Skill2 reserved occupancy or other lifecycle/presence claim. An apparently invisible/dead renderer is not emptiness. Seeded RANDOM chooses from the legal set. Do not filter destinations by whether the same hostile fixed AoE includes them.

If no destination/assignment exists, or relocation fails: no Position mutation, charge consumption, afterimage or counter Damage. Successful authoritative movement commits **Position + charge consumption + one afterimage obligation** coherently. Freeze source ATK/WIL and the hostile Natural Action's Actor at that successful movement checkpoint. No ordinary Reaction can observe a moved actor whose charge/obligation has not committed.

When several Savitars qualify in the same fixed area, freeze the common truly-empty destination set and candidate/legality facts before assignment. Use deterministic seeded **one-to-one matching**, with at most one moved actor per destination. Insufficient capacity uses seeded selection of admitted actors, never Slot/Entity/list/Event priority. Unassigned actors retain charge and create no afterimage. A different legal-matching topology supplied by a future Mode requires its own explicit applicable policy; technical enumeration cannot decide gameplay.

After successful pre-Damage movement, the attack retains its **locked Slot set** and reads current occupancy. Savitar can move into another included Slot and take that Damage normally. Movement is not immunity, cancellation of the hostile Damage group, ordinary Hit Admission Dodge, or guaranteed evade.

**Afterimage:** once the qualifying fixed-AoE batch commits and mandatory lifecycle/result processing is complete, the already-created linked non-Natural **COUNTER settlement** becomes eligible against the locked hostile Natural-Action Actor. One hit **PHYSICAL100% snapshotted ATK + WILL100% snapshotted WIL**. It is not a Basic. Invalid hostile Actor: **DROP_LOCAL / NO_RETARGET**, no fallback to immediate packet source, owner or credited Entity. The obligation survives Savitar being hit or killed by the triggering AoE after movement; retain frozen formula/target/provenance through cleanup. It does not revive or rematerialize Savitar. Multiple same-checkpoint counters and the attacker Heal/Reaction boundary remain the genuine questions in §4.

### 2.3 Skill1 — Lôi Trụ Quán Trường

Active Skill occupying one Natural Action, required **20 AE**. After successful Cost, snapshot current source column and ATK/WIL once. Own Slots1/4/7 map to enemy1/4/7; 2/5/8 to2/5/8; 3/6/9 to3/6/9 under side-relative Mode geometry. Lock the resulting three coordinates, not the original occupants. VFX does not move Savitar.

Resolve authored pre-Damage relocation/dodge work first, then query current legal occupants of the locked coordinates. Empty Slot contributes no recipient; no reroll/retarget. One **SIMULTANEOUS fixed positional Damage batch** deals **PHYSICAL155% ATK + WILL155% WIL** per current recipient. All use the common source snapshot. Damage calculations share one post-relocation phase state; one recipient's lifecycle/result cannot alter another inside this batch. Enemy Savitar's Passive can qualify because this is fixed area, not random targeting.

### 2.4 Skill2 — Dị Tuyến Quy Lai

Automatic passive Skill settlement; **one successful activation per battle**, required **15 AE**. At a **stable committed HP-mutation/lifecycle checkpoint**, check alive, active Field Presence, CurrentHP **strictly<15% CurrentMaxHP**, unused, and not already temporally absent. Exactly15% does not qualify. Failed AE: no activation/use consumption. A later HP-mutation checkpoint may retry while still below15%; an AE-only change never creates this checkpoint.

Successful activation consumes its battle use and enters an owner/current-presence **temporal-admission-protection State**. The label TEMPORAL_ABSENCE is Character state terminology, not the canonical `TEMPORARILY_ABSENT` lifecycle operation. Savitar remains alive and Field Present, with the **same authoritative Slot ownership/reservation**. There is no LEAVE_FIELD, Deck transition, deployment vacancy, DEATH_CONFIRMED, aura/presence removal or moving Entity. Occupancy claims forbid placing another actor there.

**Protection:** reject Savitar as a Damage recipient of **enemy Natural Action outcomes**, including Entity-targeted and Slot/area-targeted Damage. This is scoped Damage-target/effect admission rejection before Damage mutation, not Damage Reduction, Shield consumption, HP immunity or universal invulnerability. Existing independent DoT/Mark/non-targeting State/environmental effects follow their own Contracts. Ally Heal/Buff and non-Damage Effects retain ordinary target rules. Root lineage alone does not turn independent Reaction/Counter/Follow-up into a protected Natural outcome. Ordinary Authority conflicts are handled only if explicit conflicting Authority-bearing clauses exist.

**Counterfactual:** for each qualifying fixed positional enemy-Natural Damage batch containing the reserved coordinate, calculate what Actual HP Damage this same batch would have produced against Savitar **if this temporal admission exclusion alone were removed**. Use actual hostile packets/formula/source snapshots plus authoritative defensive State, mitigation, Shield/layer rules and HP at that batch checkpoint. Multiple packets share one hypothetical recipient Shield/HP budget under the batch's explicitly applicable allocation; do not spend the full same Shield independently per packet. Hypothetical Shield absorption reduces the HP-bound estimate.

The calculation is read-only: no real HP/Shield mutation, Damage publication, ordinary DamageResult credit, HP_ZERO, Reflect/Lifesteal/listeners or resource payment. Retain a distinct projected result, not a fake committed DamageResult. Each later hostile batch starts from then-current **real** state; no persistent shadow HP/Shield timeline. Accumulate its projected HP-bound estimate once into this State's `avoidedFixedAoeActualHpDamage`. Single-target/random-target attacks add nothing. Duplicate observation cannot add twice; future numerical/Hit Admission profiles not expressible by the ordinary pipeline remain explicit unsupported Mode/content boundaries.

While this State is active, Passive dodge does not trigger and its charge is preserved. The protection does not erase Position/geometry eligibility; the fixed area still contains Savitar's reserved coordinate.

**Return:** at the **start of Savitar's next SSI-granted Natural Action opportunity**, end temporal admission exclusion at the same reserved Slot, then Heal, then ordinary Action/CC handling. This opportunity-based boundary happens even if that opportunity is subsequently lost to CC. Do not require a performed Action, follow a vacated Slot's new occupant, generate another opportunity, or run ordinary materialization into a newly chosen coordinate.

`requested return Heal = 0.25 × CurrentMaxHP at return settlement + 0.30 × accumulated projected avoided fixed-AoE HP Damage`

Overheal **DISCARD**. Ordinary Heal admission/modifiers apply. **DEATH_CONFIRMED / LEAVE_FIELD** before return cancels it, clears the accumulator and grants no return Heal. Battle use stays consumed; ordinary Revive/redeploy does not grant another use in the same battle. Retired presence/State work cannot materialize or Heal a newer instance.

### 2.5 Skill3 — Tốc Giới Quá Tải

Active Skill requiring a Natural Action, required **25 AE**. Its activation Action gets no enhancement. Speed increase is theme/VFX only; no SPD/SSI-order modifier is authored.

Successful cast creates a pending enhancement that starts on the next **actually performed Natural Action**, then lasts through exactly **3 actually completed Natural Actions**. CC-lost opportunity does not start or consume duration; non-Natural Actions do not consume it. While active: Basic **100→130% ATK/WIL**, Skill1 **155→185% ATK/WIL**; these are **+30 coefficient percentage points**, not ×1.30 Final Damage. Skill1 AE **20→15**, floor0 under ordinary Cost composition; Ultimate waiver0 stays0 and gives no refund.

For a qualifying enhanced Basic/Skill1, Heal **10% aggregate committed Actual HP Damage of its qualifying direct Damage outcome**. Skill1 aggregates all current-recipient results. Shield/Overkill/independent Counter/Reaction/DoT/unrelated Damage are excluded. Overheal DISCARD. Enhancement cannot buff its own activation. It does not create a new Action/Basic identity or change source stat ATK/WIL.

No stacking, no cast while ACTIVE. Pending starts before selection of the next actual Natural Action, so that next Action cannot recast an already active Skill3. After the third enhanced completion, terminate enhancement and enter **one future actually completed Natural Action cooldown**; that same completion cannot decrement a freshly created cooldown. CC/non-Natural do not consume it. Death/leave clears pending/active/cooldown; retired clock observations cannot alter a new controller.

### 2.6 Ultimate — Tốc Thần · Thiên Lôi Quán Giới

Root **ULTIMATE** calls exactly one real Skill1 child with **SKILL identity, non-Natural**, AE override0. Root readiness/Rage payment remains ordinary. No inline-copy of Skill1, extra Natural Action, SSI advance or child Natural-class regeneration. Explicitly authored child Damage belongs to the root's declared Natural outcome when the root is Natural; child status remains non-Natural.

Supply **+15 coefficient points**: base155+15=**170% ATK/WIL**; activeSkill3 gives155+30+15=**200% ATK/WIL**. No multiplicative reinterpretation. One common Ultimate ATK/WIL snapshot serves every child recipient; Skill1 uses the same fixed-column/pre-Damage-movement/post-movement occupancy/SIMULTANEOUS policy. Snapshot checkpoint and local Reaction boundary await §4's answer.

After the whole Skill1 child Damage batch/result projection is terminal, one damage-derived Heal consumes that exact child's committed qualifying Actual HP Damage. Base coefficient **0.10**; Skill3 adds **0.10** when its authored enhancement qualifies →**0.20** on the same result basis. Other independently qualifying Lifesteal sources follow their own Contract/read checkpoint. Use HEL-005 additive composition, never two ordering-sensitive per-target Heals or duplicated child Damage credit. Overheal DISCARD. Modifier −5 AE cannot make waived child Cost negative or refund AE.

## 3. Independent composition audit

| Boundary | Current capability attempted | Exact result |
|---|---|---|
| Slot-target Basic / fixed columns | TargetSpec POSITION, LOCK_POSITIONS; TGT-004/010/011; P-013/014; Kernel40–42 | Position reference exists, but the occupant-at-commit binding/default and pre-movement recipient checkpoint need bounded explicit law, not Entity follow/chase. |
| Pre-Damage dodge | P-050, POS-001/002/003, seeded RNG and existing simultaneous transaction | Movement can commit; ordinary post-commit Trigger scheduling cannot run it before the incoming Damage calculation. Need a bounded positional interposition, preserving the locked area and charging only committed movement. |
| Multiple movers / claimed empty cells | Generic occupancy/materialization reservation and atomic group movement | Existing occupancy owners retain claims, but truly-empty union and seeded one-to-one assignment before the shared commit are not fully specified. No new Primitive/Tag required. |
| Temporal protection while present | State BUFF/SYSTEM_STATE + explicit DAMAGE-scoped STA-014; existing presence/occupancy | Composition suffices for protection and retained occupancy. POS-010 would remove active presence and is wrong; no new lifecycle type is needed. |
| Avoided HP estimate | P-040/041 read-only calculation, RES-001/002/008, ordinary Shield/HP proposal | Existing proposed Damage can calculate, but no typed read-only single-recipient projection bypassing only a declared admission clause/result domain exists. Do not commit fake Damage or spend real Shield. |
| HP threshold activation | TRG-001/002/003/006; existing HP/Cost/Heal/lifecycle owners | Need a stable committed-health observation after mandatory lifecycle for all qualifying HP mutations; AE changes must not fabricate one. |
| Next opportunity return before CC | Actor Natural Action Window/opportunity scheduler, State expiry/finite settlement | Existing opportunity semantics distinguish CC, but need an explicit pre-control opportunity settlement boundary. Actual-completion duration is insufficient. |
| Skill3 delayed 3+1 clocks | existing State/Duration/Action start/completion + local phase controller | Composition; activation excluded, CC/non-Natural ignored, new cooldown cannot consume the same completion. No new timer subsystem. |
| Coefficient/Cost changes + exact child | ordinary typed formulas/Condition branches, Cost override, ACT-020/021/023, P-001 | Compose Character data profiles; not a new global coefficient priority or Character runtime. |
| Additive outcome Heal | HEL-005, committed direct-child Result/DAG/aggregate | Existing composition; no new Lifesteal service. |

## 4. Genuine designer questions

1. Multiple afterimage counters against one hostile Actor: one simultaneous proportional-allocation batch, or an explicitly authored sequential order?
2. Global default Slot binding migration: preserve already explicit designer Entity locks, or re-author the older kits too?
3. Skill1/Ultimate local Reaction boundary: attacker Heal/root direct completion before ordinary enemy counter, or counter before Heal? Basic source snapshot after Slot lock at start, and Ultimate snapshot after root Cost before child/pre-Damage dodge, also require confirmation.
4. Skill2 stable-checkpoint activation: mandatory immediate settlement before later direct Damage groups despite an ordinary Reaction hold, or ordinary queued timing? Does its health-mutation checkpoint include CurrentMaxHP-only changes, or only CurrentHP changes? Current wording does not independently establish these observable choices.

These questions are pending, not approved gameplay. Continue independent composition/Schema/runtime auditing; do not execute or merge an invented answer. Metadata and future external Mode/Hit/numeric/affiliation/Authority profiles that this task does not depend on remain **UNRESOLVED / NOT BLOCKING**, not missing internal kit defaults.

## 5. Architecture impact and final audit

The current working diff contains only raw entry77 and this Canon. The impact map below is a prospective owner map, not a claim that `00–08` has already changed or that unanswered gameplay is approved.

| File | Current impact conclusion | Evidence / boundary |
|---|---|---|
| 00 | PATCH after final normalization | Version/navigation/impact bookkeeping only; do not invent a new current architecture version while the delta is unmerged. |
| 01 | Bounded target-reference clarification may be required | §§7.1/7.8/7.9 already distinguish positions/identities and Hit Admission; make the Slot/occupant versus Entity/follow distinction explicit only as a semantic clarification. Default execution/migration law belongs05, pending §4. |
| 02 | NO CHANGE | Existing POSITION_MUTATION, AREA, DAMAGE, PHYSICAL_DAMAGE, WILL_DAMAGE, HEAL, LIFESTEAL and explicitly scoped IMMUNITY suffice. COUNTER/Skill/Ultimate are behavior/identity, not new Functional Tags. TARGET_EXCLUSION alone does not protect fixed area; TEMPORARY_ABSENCE is wrong for Skill2. |
| 03 | NO NEW PRIMITIVE | P-050 can commit group relocation; P-040/P-041 already calculate without HP/Shield commit; P-020/021/022 hold bounded state; P-034/035 pay AE; P-044/045 Heal; ordinary Action/result services handle children. A distinct typed projected-result wrapper is not a new executable atomic operation. |
| 04 | PATCH for proved typed input gaps | Positional recipient binding; bounded pre-Damage relocation/assignment; read-only projection context/result; stable health and pre-control opportunity observation. Formula/Condition/Cost/State/child/Lifesteal composition stays generic. |
| 05 | PATCH for exact laws | Preserve all prior IDs and explicit profiles. Add only the bounded binding/interposition/projection/checkpoint laws proved below. Global Slot migration and local counter/boundary law await §4. |
| 06 | PATCH existing owners | Target/Area/PositionState/RNG/Transaction, Damage/Shield/Results, Trigger/HP-Lifecycle, and Scheduler/State/Completion owners. No Character service, arbitrary hook registry, new generic priority or private Turn Boundary. |
| 07 | NO CHANGE unless inspection proves a Mode-owned delta | Main already owns nine Slots/SSI/opportunity versus actual completion. Generic checkpoint execution can use that grant; other Modes remain REQUIRED_EXPLICIT until they provide the abstraction. Do not translate Natural Actions into seconds. |
| 08 | PATCH after policy locks | Declarative semantic coverage for Slot replacement/miss, pre-Damage occupancy, in-area dodge, claims/matching/failure, deferred-counter source death, projected Shield/HP/receipt isolation, stable HP retry, opportunity return before CC, 3+1 clocks and exact child/coefficient/Heal composition. No executable tests/builds. |

### 5.1 Exact runtime extension proofs against the merged base

**Position binding:** merged04 TargetSpec `POSITION` / `LOCK_POSITIONS` / AreaSpec → TGT-004/010/011 and SNP-* → Kernel Target40/Area41/Lock42/Hit42A/Damage45. The current surface can retain coordinates but does not state a complete occupant-at-Damage-commit recipient binding/default/migration law, so a plausible implementation could freeze the original Entity and follow it. Smallest extension: typed coordinate binding plus a declared occupancy-read checkpoint; freeze final recipient identities only after that checkpoint, retain Slot identity separately, and preserve explicit Entity bindings under the approved migration scope. No new selector, entity-chase callback or Guaranteed-Hit implication.

**Pre-Damage relocation:** merged04 PositionMutationSpec and TriggerSpec, P-050 → POS-001/002/003, TGT-010/011, RNG-001/002, RES-002/005 → existing PositionState/Spatial resolution, Trigger/Contract resolver and Transaction Manager. Post-commit Reaction processing cannot move a defender before the triggering area's Damage calculations. Smallest extension: one bounded phase **locked geometry → qualifying positional relocation group → current occupants → Damage calculation/commit**. Freeze actor/rule/destination candidates, use the authored seeded one-to-one policy, stage successful Position/charge/deferred-obligation mutations together, then expose only the coherent movement result. Source/rule instances are replay keys, never priority. Reject competing observable interpositions without an explicit composition law; no arbitrary callback checkpoint or repeated fixpoint scan.

**Truly-empty destinations:** merged04 occupancy/Position selector inputs → POS-001/003 plus materialization/deployment reservation Contracts → existing PositionState with Lifecycle/Materialization/Deployment claims. A renderer-based active-occupant check is insufficient because waiting/absent/reserved Slots remain claimed. Smallest extension: read the union of current occupancy and valid claims in the same authoritative view; expose that as an explicit emptiness predicate, not a new State/Tag. Seeded matching freezes legal edges before draws; no old source Slot becomes a candidate merely because another move is planned. One destination has at most one assignee. Failed group commit publishes no movement, charge use or deferred counter; no hidden reroll/nearest fallback.

**Read-only avoided Damage projection:** merged04 DamageSpec/Resolution/Result bindings → RES-001/002/008, STA-014, DMG-001–012 and Shield Contracts → P-040/P-041 through existing Damage/Shield/Transaction calculation and Result storage. Pure proposed Damage already exists, but committed-result queries cannot safely consume it as actual gameplay credit; the bypassed admission clause/context and batch-local shared HP/Shield budget must be explicit. Smallest extension: typed single-recipient projection from a retained incoming batch, excluding only the named temporal admission clause; run ordinary pure pipeline/proposals against the shared checkpoint; seal a distinct estimated-HP result; accumulate once only after the observed batch is terminal under the authored success/skip policy. Never invoke P-042/HP_ZERO/ordinary Damage observers or advance real RNG for diagnostic work. Reuse retained draw facts or the ordinary profile's pure keyed probe; unsupported non-probeable numeric/Hit profiles fail closed, not an invented expected-value formula. Repeated batches read real state independently, and shared-recipient allocation must already be explicit.

**Stable HP observation:** merged04 Trigger conditions, committed Cost/Heal/Damage results and State cap → TRG-001/002/003/006/015 plus Cost/Heal/Lifecycle law → existing Transaction/HP writer, Lifecycle and Trigger Engine. Damage-only listeners omit HP Cost/Loss/Heal/reconciliation; raw transaction publication can be earlier than mandatory lifecycle. Smallest extension: a precise stable health-mutation observation with original committed mutation/result identity and post-lifecycle recipient facts. Filter by declared health-mutation scope; AE-only changes cannot fabricate it. Qualify/pay/consume/create follows the existing finite triggered settlement and transaction law. Redelivery retains the original observation outcome; failed payment waits for a later genuine qualifying checkpoint, not a persistent auto-retry token.

**Opportunity return before control:** merged04 Actor-window clock/State expiry and finite Trigger settlement → ACT-011/012, Actor-window law and ACT-032/033 → existing SSI Scheduler, State/Trigger/Completion owners. Completion-based clocks miss a CC-lost return; ordinary absent-entity materialization removes presence or changes reserved placement. Smallest extension: an explicitly declared finite **owner opportunity granted → required opportunity-start settlement → ordinary CC/Action handling** dependency. It terminates the admission State at its retained coordinate and resolves the ordinary Heal before that same opportunity proceeds. No fake Action, extra opportunity or child class regeneration; actor/presence/State instance and opportunity serial prevent old return/cleanup from changing a new life/presence. Unsupported non-SSI adapters remain explicit, not real-time substitution.

### 5.2 Current self-audit and remaining completion gate

Canon audit against the supplied locks confirms strict15% threshold, successful-move-only charge/counter, completion versus opportunity clocks, reserved present occupancy, non-mutating per-batch projection, additive coefficient points and exact child/Lifesteal provenance. Raw examples that imply Basic triggers Passive are superseded by designer §7. Source death does not revoke an already-created counter; temporal protection does not become universal immunity.

The first draft was deliberately challenged again. Corrections: restored the original raw EOF byte, separated projected from committed Damage evidence, made shared hypothetical Shield/HP budget explicit, prevented a fresh cooldown from decrementing on its creation completion, and retained the actual-present Skill2 state instead of importing POS-010. A further source audit found Skill2's immediate-versus-queued timing and health-field observation scope must be locked as well. Current source comparisons leave the four §4 answer groups genuinely unresolved; no answer is implied by this audit.

Final six-pass architecture audit and changed-section report are **not yet complete** because the canonical extension draft depends on those answers. No architecture patch is declared merge-ready, no build/game tests were run, and no prior Character Canon or existing `00–08` body has been modified by this working draft.

### 5.3 Regression obligations prepared independently of pending answers

- Basic locks Slot5 occupied by X. X moves away: empty yields no Damage; Y legally enters Slot5 before commit: Y receives the hit. Neither Slot7 nor X is chased; source snapshot uses the eventual approved checkpoint.
- Fixed column includes5/8. Successful dodge5→8 consumes charge and creates one frozen counter, but Savitar still receives the original AoE at8. Full-field fixed geometry also permits a successful move without evading Damage. No destination yields no charge/counter; CC does not refresh charge.
- Renderer-empty Slots with deployment/death-waiting/Revive/temporary-owner/temporal-State claims are excluded. Two eligible movers and one truly-empty destination give one seeded assignee, one move/charge/obligation, and one actor retaining charge. Permuting Entity/Slot/list/Event iteration cannot change the seed-to-assignment mapping. Source Slots are not freed candidates inside the same frozen assignment.
- Counter uses the movement-commit ATK/WIL/hostile Actor snapshot after the source's AoE-caused death. A dead/invalid hostile Actor drops locally. Counter output cannot join the hostile Natural direct result solely through lineage. Shared-recipient counter ordering/allocation uses the eventual §4 lock, not an invented default.
- Temporal-State admission denies actual enemy-Natural Damage while retaining presence/Slot/claims and leaving unrelated DoT/Mark/non-Damage eligibility unchanged. Fixed area still observes the reserved coordinate; no Passive dodge while protected; random/single attacks add no projection credit.
- Projection fixture: CurrentHP100, CurrentMaxHP1000, eligible Shield50, incoming post-mitigation fixed-AoE amount80. Each independently observed batch projects Shield50/HP30 while real HP/Shield remain100/50. Two such batches give avoided60 and return requested Heal250+18=268. If a real eligible non-protected effect consumes20 Shield between batches, the next projection reads real Shield30 and projectsHP50; cumulative80 yields Heal274. Do not advance a persistent shadow Shield/HP timeline.
- A projection is not admitted by committed DamageResult queries, ordinary P-043 credit, Reflect, Lifesteal, HP_ZERO or damage-trigger listeners. Re-delivery cannot double-accumulate. Multiple packets must share one hypothetical recipient budget under explicit allocation; unsupported Hit/numeric/protection/projection feedback fails closed.
- Exactly15% HP does not activate Skill2. Failed AE does not consume use and AE-only gain does not create a checkpoint. Later qualifying health mutation can retry. Immediate/queued activation and CurrentMaxHP-only qualification use the eventual §4 lock.
- Next owner SSI opportunity ends the temporal State and settles Heal before subsequent CC handling. A CC-lost opportunity still returns, but does not refresh Passive charge or start/consume Skill3. Death/leave cancels return and credit; battle use remains spent through redeploy/ordinary Revive.
- Skill3 activation gets no enhancement; next three actual Natural completions do. Coefficients155+30=185 and100+30=130; Skill1 Cost20−5=15. Third completion creates cooldown without consuming it; the next actual Natural completion ends cooldown. Source death/leave retires pending/active/cooldown work.
- Ultimate creates exactly one real Skill1 child, Cost0, no negative debit/refund. Coefficients155+15=170 or155+30+15=200, not201.5/232.075 or an extra hit. Exact child ActualHP basis receives10% or20% additive Heal once after the full batch; Shield/overkill/counter/unrelated root-linked Damage are excluded. Local counter/Heal boundary and common snapshot use §4's eventual lock.
