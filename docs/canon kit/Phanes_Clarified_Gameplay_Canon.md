# ARCLUNE — PHANES — CLARIFIED GAMEPLAY CANON

**Revision:** R1 — named designer source reconstructed and self-audited; clarification in progress.
**Status:** CLARIFICATION_IN_PROGRESS / bounded source normalization only. No full execution-ready Character or unproved generic architecture gap is claimed.
**Source:** designer’s current Phanes description and repository `ý tưởng nhân vật 3.md`, the later duplicate #52 SSR Mage after Nerovar. Raw edit adds Character/Ability names only; all mechanic prose remains byte-preserved. The first #52 Warrior is Nerovar, not this kit. Raw numbering is not a runtime ID.
**Architecture inspected:** actual merged main `693f0cb`, E.4/F.6/G.5/H.1/I.5, plus the current separately proved Nerovar prevention-completion proposal. A proposed extension is not merged canon until merged.

## 1. Identity and non-Entity orb model

- **Phanes**, Rank **SSR**, Class **Mage**. Native Element unspecified; `BASE_DEPLOYMENT_COST = TBD_BY_COST_BUDGET`. These are UNRESOLVED / NOT BLOCKING for present architecture work.
- Complete kit: Passive, Basic, three triggered Skills and Ultimate. Skill names are labels, not proof of additional manual Skill Actions or Natural Action opportunities.
- Orbs are **VFX for an owned capped counter/modifier and authored Damage contribution**, not Summons, Combat Objects, extra Actors or entities with independent HP/life/presence/targetability/SSI. No Spawn, Despawn, Summon-only bonuses or orb follow-up Actions are inferred.
- “Cannot receive Damage” follows from no gameplay orb Entity; it is not target immunity granted to Phanes.
- **Phanes cannot perform FOLLOW_UP attacks.** This is an Actor Action-behavior restriction; it does not automatically forbid two separately specified Basic executions inside an Ultimate, Counter/Forced behavior or every child Action. Child mapping remains §4.
- Raw Damage-display requirement is two displayed amounts: main strike and aggregated orb Damage. Display aggregation does not decide hit count, Shield allocation, Hit Admission, committed-result grouping or Action identity.

## 2. Clarified source-defined kit

### 2.1 Passive — Constellation of One / Nhất Thể Tinh Trận

Every Ultimate use creates **one orb**, maximum **10**, and each orb grants **5% existing ATK/WIL** as stated in source. Orb count must be capped without creating gameplay Entities.

The current wording does not prove additive `1 + 0.05 × N` versus repeated current-stat compounding, which stat basis excludes/includes its own modifier, whether creation is before/after Twin Zenith’s Basics, or lifetime across field leave/death/Deck. Those observable choices are §4 questions; do not silently lock +50% at10 or `1.05^10`.

### 2.2 Basic — source unnamed

One ranged main strike on one enemy: raw **100% WIL/ATK**. Every current orb attacks the same target simultaneously for **30% Phanes WIL/ATK per orb**. Aggregating orb numbers is presentation; main and orb numbers remain separate.

Typed coefficients, a shared stat/orb-count snapshot, grouped versus separate-hit receipts and Action target/invalidation policy need §4. Phanes remains source/Actor; orbs provide no autonomous Action/Attribution identity. A count0 control has no positive orb Damage from this mechanic; Skill1 still requires its authored orb qualification.

### 2.3 Skill 1 — Terminal Ray / Chung Mệnh Quang

Only on Basic: orb Damage on a target at **HP <= 5% target MaxHP** requests immediate execute, HP0 and DEATH_CONFIRMED; subsequent Revive/Deck behavior follows that recipient’s explicit mechanics. Activation costs **30 Side AE**, maximum **4 per battle**.

The threshold is inclusive. Exact check before orb Damage versus after whole Basic batch, required committed orb result, death-prevention interaction and use-consumption checkpoint are not fixed by the prose. The parenthetical return possibility matters for Nerovar’s pre-confirmation prevention. Do not add EXECUTE_TARGET Primitive or globally bypass Death Prevention/Authority on an unanswered choice; current 03 §32.1 intentionally defers generic Execute semantics.

Execute is not automatically extra typed Damage. Its contribution/exclusion in Skill2/3 metrics must be settled explicitly, not by reducing HP and labeling that difference as ordinary Damage.

### 2.4 Skill 2 — Radiant Reflux / Hồi Quang Phản Lưu

On Basic Damage **strictly above 40% target MaxHP**, pay **10 Side AE**, Heal Phanes for **40% Damage from that Basic on that enemy**. No per-battle cap is supplied; do not invent a turn cap.

Current 01 §9.17 supplies the Damage-generated-Heal default **Actual HP Damage**, excluding Shield/Overkill; DMG-020 supplies whole-qualifying-Action threshold aggregation rather than display frames. These defaults do not decide the Action/Effect source scope, main/orb grouping, denominator checkpoint, failed AE or result timing in §4. HEL-002/003 authors no implicit Overheal storage/Shield; absent a separate consumer this source’s excess is discarded after result use. This is a triggered Heal branch, not mandatory Cost on every Basic.

### 2.5 Skill 3 — Threshold Ascension / Việt Giới Thăng Hoa

On Damage caused by a **Natural Action**, **strictly above 15% target MaxHP**, gain **3 Rage per 1 percentage point above15**, no battle/turn activation cap. Pay **5 Side AE per activation regardless of credited Rage**, and discard Rage overflow. Exactly15% does not activate.

Source example:25% Damage means10 percentage points above15, requested Rage30 and AE5. Rage-full overflow does not by itself remove this AE charge; conditions still govern whether activation qualifies. There is no new Rage pool.

DMG-020 supplies whole-qualifying-Action HP-Damage aggregation as the current threshold default. The denominator snapshot, fractional percent treatment, qualifying Action/provenance scope and Basic children of a Natural Ultimate remain §4. Do not mark non-Natural children as SSI Natural Actions to make the rule qualify.

### 2.6 Ultimate — Twin Zenith / Song Cực Thiên Quang

Execute **two Basics**. If those Basics activate Skill1/2/3, their **AE activation Costs are waived** while the mechanics still activate. This is a local authored waiver, not a global free cast, extra Rage readiness rule or automatic cap bypass.

The waiver says AE only; no source instruction removes Skill1’s four-use limit or threshold predicates. How two Basics map to child Actions/direct profiles, share/select targets and snapshots, and expose Skill3’s Natural root qualification remains §4. No Follow-up behavior is inferred from repeating a Basic.

## 3. Canon self-audit and current bounded normalization

Source facts retained: SSR Mage; one orb per Ultimate capped10; 5% ATK/WIL per orb with unspecified stacking basis; no gameplay orb entity; no Follow-up; main100% mixed and orb30% mixed; two displayed groups; Skill1 inclusive5% execute/AE30/cap4; Skill2 strict40% Heal40%/AE10/no battle cap; Skill3 strict15%, three Rage per excess percentage point, AE5 even overflow/no use cap; Ultimate two Basics with local AE waiver.

Current architecture composition inventory:

| Mechanic | Schema / Contract / existing owner | Current verdict |
| --- | --- | --- |
| Capped orb counter + stat bonus | StateSpec/COUNTER_REF/StatModifier → State/Stat/Snapshot laws → existing State/Stat owners, MODIFY_STATE/MODIFY_STAT | Count/modifier composition exists; stacking/basis/lifetime checkpoint still gameplay. No orb Entity/manager needed. |
| Actor cannot Follow-up | Action restrictions/behavior admission → ACT-002/015 → existing Action Scheduler/admission | Reuse behavior restriction; do not create FOLLOW_UP Functional Tag or classify orb Damage as child attacks. |
| Main/orb simultaneous Damage | TargetSpec, Damage typed components, Resolution groups and ResultRefs → DMG/RES/SNP → existing Target/Snapshot/Damage/Transaction/Result owners | Geometry/current primitives suffice; grouping and immutable inputs need designer bindings. Two UI numbers do not prove two hits. |
| Basic-triggered Heal / Rage | Trigger+bounded Conditions+Cost/Heal/Resource+result refs → TRG/CST/HEL/resource laws → existing Trigger/Cost/Heal/Resource/result owners | Candidate composition exists. No gap accepted while qualifying result scope/checkpoint/order are unresolved. |
| Threshold execute | Lifecycle Effect/death context/P-060/061/062 versus Damage composition → DTH/Authority/recipient laws → current Lifecycle owners | Exact law cannot be selected from lore. Deferred Execute candidate remains deferred; ask before any bypass or new Primitive/Tag. |
| Ultimate two Basic executions and AE waiver | ActionSpec parentChildPolicy/childCostPolicy/childSnapshotPolicy, bounded repeat and Cost waiver → ACT-020/021/023, CST → existing Action/Cost/DAG owners | Try current child/settlement composition first. Natural lineage, targets and waiver propagation must be explicit; no generic callback/priority invented. |

This inventory is not a claim that arbitrary Execute semantics or all descendant-Cost overrides are already supported. Prove locked input → current Contract/owner → actual composition failure → smallest typed delta only after §4 answers. No new Functional Tag, Primitive, mode fork or Character-specific runtime is proposed.

## 4. UNRESOLVED / NEED USER DECISION

| Branch | Blocking authored decision |
| --- | --- |
| Passive stat/creation/lifetime | Additive count-based bonus versus compounding existing stats; own-bonus exclusion/basis; before/after two Basic checkpoint; counter/modifier retained or reset on death/return/field leave. |
| Damage/target/snapshot | Mixed types/coefficients and hit/result grouping; common source stats/orb-count checkpoint; target selection/lock and invalidity; two Basics same locked target versus independent selection, sequential execution and Reaction boundary. |
| Natural lineage | Does Skill3 qualify the two Basic children when their root Ultimate is Natural, without granting them Natural Actions/SSI movement? Non-Natural Ultimate must not inherit a guessed Natural status. |
| Skill1 gate/lifecycle/use | Inclusive threshold checkpoint, positive orb result requirement, prevention/Authority bypass or ordinary HP_ZERO evaluation, recipient legality and consume-on-payment versus successful execute. |
| Skill2/3 scope/checkpoint | Existing whole-Action qualifying HP-Damage/Heal defaults apply absent explicit override; main/orb Action/result scope, execute exclusion/inclusion, target MaxHP denominator snapshot, fractional excess percentage behavior and local failed AE still need bindings. |
| Same-Basic competing settlements | When Skill1/2/3 qualify together, explicit local order/dependency and activation/count behavior under limited AE. Numbered labels do not grant runtime priority. |

Current defaults are reused where applicable, including 01 §9.17/DMG-020 and HEL-002/003. They do not pick a missing Action/provenance/snapshot anchor. No assumption about hidden order, list/Slot/Entity priority, missing snapshot or parent-root provenance makes these executable. The asked AE-waiver/cap and Rage-overflow boundaries are already source-defined above; they do not require inventing new permissions. Native Element/budget and unsupported Mode adapters remain UNRESOLVED / NOT BLOCKING.

## 5. Impact audit across 00–08

| File | Current decision |
| --- | --- |
| 00 | PATCH: named Phanes source and clarification status navigation. |
| 01 | NO CHANGE: current Action/lineage/Effect/source/HP/Damage/Heal/Resource/presentation distinctions apply. |
| 02 | NO CHANGE: existing Damage/StatModifier/Heal capabilities; orb count, thresholds and Action behavior are data, not new Tags. Execute capability verdict deferred until law is clarified. |
| 03 | NO CHANGE: State/Stat/Damage/Heal/Resource/Action/lifecycle composition first; do not promote deferred EXECUTE_TARGET merely from the label. |
| 04 | NO PHANES PATCH PROVEN: current typed input shapes tried above; affected bindings remain §4 choices. Nerovar’s independent deathPrevention completion patch is separate. |
| 05 | NO PHANES PATCH PROVEN: current Contracts reused where sufficient, remaining Execute/order/waiver law needs clarified input. ENT-010→ENT-015 maintenance and Nerovar completion are independently authorized work. |
| 06 | NO PHANES PATCH PROVEN: existing owner/transaction/result services first; no new orb Actor or Character runtime. |
| 07 | NO CHANGE: current Side AE/Rage/SSI ownership, with explicit profile needed for another Mode. |
| 08 | NO PHANES PATCH PROVEN: no MUST_PASS fixture may settle unanswered grouping/lifecycle/result scope/order. Add obligations only after clarification/proved delta. |

Naming/source reconstruction and Canon self-audit are complete. Full normalization is blocked only on §4’s genuine gameplay decisions, not on metadata, presumed code support or a requirement to edit every layer.

## 6. Six-pass audit — source clarification scope

1. **Semantic fidelity — PASS for source facts:** all named abilities, coefficients/thresholds, use caps, AE charges/waiver, orb cap/VFX nature and two displayed amounts retained. §4 deliberately leaves observable stacking, lifecycle, grouping and provenance choices unanswered.
2. **Independent composition — PASS for inventory:** try existing counter/stat/Damage/Trigger/Cost/result/Action owners first; no Phanes generic gap accepted without clarified input. Deferred Execute is not promoted from a name.
3. **Layer / namespace / lifetime — PASS for scope:** raw receives labels only; Canon records source and decisions. Orb VFX receives no Entity/Actor identity. Required counter/modifier lifetime remains a designer question, not an inferred field-leave default.
4. **Determinism / negative space — PASS for preservation of uncertainty:** zero orbs, equality at5/15/40, full Rage, insufficient AE, child versus root Action, simultaneous presentation, competing triggers and recipient death prevention were checked. Missing order/checkpoints cannot become implicit defaults or executable MUST_PASS fixtures.
5. **Prompt / source contradiction — PASS:** later #52 Mage is Phanes, first #52 Warrior remains Nerovar. Current designer wording and current main supersede older unnamed copies. Only requested names change the raw file.
6. **Mergeability — PASS for names/Canon/navigation:** actual names-only raw diff and whole-file inverse comparison verified; all other raw kits unchanged. 00–08 impact assessed without forcing changes into unaffected layers. No full normalized Ability IR, executable validation or answered §4 is claimed.
