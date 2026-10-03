# ARCLUNE — SAVITAR — CLARIFIED GAMEPLAY CANON

**Revision:** R2 — nine designer locks plus final root-order, snapshot and mandatory HP/MaxHP-checkpoint answers.
**Status:** GAMEPLAY_CLARIFIED / ARCHITECTURE_NORMALIZED. Architecture Phase documentation; not executable Character data.
**Source:** current Savitar raw description and SAVITAR — DESIGNER LOCK supplied by the designer; raw entry77 in `Ý tưởng nhân vật 4.md`. Explicit locks supersede contrary raw examples, including Basic itself activating the fixed-AoE Passive.
**Architecture base inspected:** actual merged main `fc46805274a9878c3df796accab037d7cb303261`, INDEX-10 / E.8 / F.10 / G.9 / H.1 / I.9. Proposed extensions do not become current architecture until merged.

## 1. Identity and negative boundaries

**Savitar**, inspired by the namesake from DC's The Flash. Rank/Class/Native Element/base stats remain **UNRESOLVED / NOT BLOCKING**; `BASE_DEPLOYMENT_COST = TBD_BY_COST_BUDGET`. Do not infer Rank, Class, Element, Authority or a numerical speed modifier from inspiration or animations.

Names: Passive **Lôi Ảnh Hoán Vị**; Basic **Tốc Kích Trọng Quyền**; Skill1 **Lôi Trụ Quán Trường**; Skill2 **Dị Tuyến Quy Lai**; Skill3 **Tốc Giới Quá Tải**; Ultimate **Tốc Thần · Thiên Lôi Quán Giới**.

Only Passive's successful relocation changes gameplay Position. Basic rush, Skill1 charging run, Skill2 time travel and Skill3 speed imagery are VFX. The afterimage has no Entity, occupancy, HP, targetability or gameplay Position. There is no default Reflect/counter recursion, Follow-up, extra Natural Action, SSI advance or Natural-class regeneration from its linked non-Natural settlement.

All Damage hits below have PHYSICAL ATK and WILL WIL components of one hit, not separate hits. Ordinary Hit Admission/Authority applies independently of reference binding. Slot targeting does not imply Guaranteed Hit; Entity binding does not by itself grant Guaranteed Hit either. AE is ordinary Side/shared AE under the active Mode. Root Ultimate readiness/Rage payment is not waived by a child's AE override.

## 2. Locked kit

### 2.1 Basic — Tốc Kích Trọng Quyền

Choose one occupied legal enemy Slot → lock its coordinate → snapshot ATK/WIL at Basic start → allow any otherwise-declared pre-Damage movement → resolve one hit **PHYSICAL100% ATK + WILL100% WIL** against the current legal occupant at this Damage group's recipient-resolution checkpoint, immediately before calculation/commit. Do not follow the original Entity. An empty Slot yields **MISS / no Damage**. A different legal Entity that now occupies that coordinate receives the hit. No selection of another Slot, target reroll or chase is allowed. Movement after source capture cannot change this hit's formula; resolved occupant/defence state is frozen for the batch without another movement window inside calculation/commit.

The Basic's single Slot is not fixed positional AoE. It cannot itself activate Lôi Ảnh Hoán Vị. A defender may move through another explicitly qualifying mechanic; the Basic still reads only its original coordinate.

### 2.2 Passive — Lôi Ảnh Hoán Vị

On new Field Presence, create an owner/current-presence charge **AVAILABLE**. At each Savitar actually completed Natural Action, refresh to AVAILABLE whether used or unused; use existing NATURAL_ONLY `postActionSettlement`/ACT-033 so this finite reset is terminal before the next Natural handoff. **CC-lost opportunity does not refresh**. Leave Field clears the window; redeploy/new Presence starts AVAILABLE. This clock is completion-based, not actor-window opportunity reset or global TURN_BOUNDARY.

Only an enemy actually performed Natural Action's direct/explicitly declared outcome Damage with an authored **fixed positional area** may qualify. Its geometry/Slot set must be fixed before resolution, without random-target selection. Full-field fixed AoE qualifies. Exclude single Entity/Slot-target hits, random AoE/multi-target, independent DoT/Mark/Reaction/Counter/Follow-up/unrelated Passive Damage merely sharing lineage. Check current Savitar Slot inside that frozen area while charge AVAILABLE and not Skill2-temporally absent.

**Pre-Damage relocation:** before recipient Damage resolution, build all allied Mode-legal **TRULY_EMPTY** destination Slots. Exclude own current coordinate and any active occupant, deployment reservation, death-waiting/pending-Revive reservation, temporary-absence owner, Skill2 reserved occupancy or other lifecycle/presence claim. An apparently invisible/dead renderer is not emptiness. Seeded RANDOM chooses from the legal set. Do not filter destinations by whether the same hostile fixed AoE includes them.

If no destination/assignment exists, or relocation fails: no Position mutation, charge consumption, afterimage or counter Damage. Successful authoritative movement commits **Position + charge consumption + one afterimage obligation** coherently. Freeze source ATK/WIL and the hostile Natural Action's Actor at that successful movement checkpoint. No ordinary Reaction can observe a moved actor whose charge/obligation has not committed.

When several Savitars qualify in the same fixed area, freeze the common truly-empty destination set and candidate/legality facts before assignment. Use deterministic seeded **one-to-one matching**, with at most one moved actor per destination. Insufficient capacity uses seeded selection of admitted actors, never Slot/Entity/list/Event priority. Unassigned actors retain charge and create no afterimage. A different legal-matching topology supplied by a future Mode requires its own explicit applicable policy; technical enumeration cannot decide gameplay.

After successful pre-Damage movement, the attack retains its **locked Slot set** and reads current occupancy. Savitar can move into another included Slot and take that Damage normally. Movement is not immunity, cancellation of the hostile Damage group, ordinary Hit Admission Dodge, or guaranteed evade.

**Afterimage:** retain the already-created linked non-Natural **COUNTER settlement** through the fixed-AoE commit and mandatory lifecycle. Release it only after the hostile root's attacker-owned Heal and remaining direct Effects are terminal, at that root's **ACTION_DIRECT_EFFECTS_COMPLETE**, under its authored hold. One hit **PHYSICAL100% snapshotted ATK + WILL100% snapshotted WIL** against the locked hostile Natural-Action Actor. It is not a Basic. Invalid hostile Actor: **DROP_LOCAL / NO_RETARGET**, no fallback to immediate packet source, owner or credited Entity. The obligation survives Savitar being hit or killed by the triggering AoE after movement; retain frozen formula/target/provenance through cleanup. It does not revive or rematerialize Savitar. All eligible afterimage counters in the same declared checkpoint/profile form **one SIMULTANEOUS counter Damage batch**, using **PROPORTIONAL shared-recipient Shield/HP allocation** and separate committed results. They do not gain priority over unrelated ordinary Reactions.

### 2.3 Skill1 — Lôi Trụ Quán Trường

Active Skill occupying one Natural Action, required **20 AE**. After successful Cost, snapshot current source column and ATK/WIL once. Own Slots1/4/7 map to enemy1/4/7; 2/5/8 to2/5/8; 3/6/9 to3/6/9 under side-relative Mode geometry. Lock the resulting three coordinates, not the original occupants. VFX does not move Savitar.

Resolve authored pre-Damage relocation/dodge work first, then query current legal occupants of the locked coordinates. Empty Slot contributes no recipient; no reroll/retarget. One **SIMULTANEOUS fixed positional Damage batch** deals **PHYSICAL155% ATK + WILL155% WIL** per current recipient. All use the common source snapshot. Damage calculations share one post-relocation phase state; one recipient's lifecycle/result cannot alter another inside this batch. Enemy Savitar's Passive can qualify because this is fixed area, not random targeting.

### 2.4 Skill2 — Dị Tuyến Quy Lai

Automatic **mandatory** passive Skill settlement; **one successful activation per battle**, required **15 AE**. After every committed **CurrentHP or CurrentMaxHP mutation** that can change the HP ratio, mandatory lifecycle reaches a stable health checkpoint; before any next direct Damage group, check alive, active Field Presence, CurrentHP **strictly<15% CurrentMaxHP**, unused, and not already temporally absent. Exactly15% does not qualify. This finite mandatory settlement executes even when ordinary Reactions are held; it does not open an ordinary Reaction window. Failed AE: no activation/use consumption. A later genuine HP/MaxHP-mutation checkpoint may retry while still below15%; an AE-only change never creates this checkpoint. No continuous polling or stored failed-payment retry token.

A multi-group enemy Action may therefore commit group1 → process lifecycle → activate Skill2 → reject Savitar's enemy-Natural Damage admission in group2. A MaxHP-only increase may cross the threshold even when CurrentHP did not change, including recomputation from committed stat/State/position-dependent contributions. Check actual committed health changes, including Cost/Loss/Heal/MaxHP reconciliation under their ordinary laws; do not misclassify them all as Damage or bypass HP_ZERO/death processing. No observer can activate between sibling packets of one simultaneous group.

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

No stacking, no cast while ACTIVE. A pending enhancement would be active for the next actual Natural Action, so read-only candidate eligibility rejects another Skill3 for that Action; a rejected probe itself does not promote pending State. Successful actual Action start promotes it before qualifying formulas. After the third enhanced completion, terminate enhancement and enter **one future actually completed Natural Action cooldown**; that same completion cannot decrement a freshly created cooldown. CC/non-Natural do not consume it. Death/leave clears pending/active/cooldown; retired clock observations cannot alter a new controller.

### 2.6 Ultimate — Tốc Thần · Thiên Lôi Quán Giới

Root **ULTIMATE** calls exactly one real Skill1 child with **SKILL identity, non-Natural**, AE override0. Root readiness/Rage payment remains ordinary. No inline-copy of Skill1, extra Natural Action, SSI advance or child Natural-class regeneration. Explicitly authored child Damage belongs to the root's declared Natural outcome when the root is Natural; child status remains non-Natural.

Supply **+15 coefficient points**: base155+15=**170% ATK/WIL**; activeSkill3 gives155+30+15=**200% ATK/WIL**. No multiplicative reinterpretation. Root Ultimate Cost commits → capture one common ATK/WIL snapshot → child Skill1/pre-Damage positional dodge → simultaneous Damage. Every child recipient consumes that snapshot; movement afterwards cannot change formula. Skill1 uses the same fixed-column/post-movement occupancy policy.

After the whole Skill1 child Damage batch/result projection is terminal, one damage-derived Heal consumes that exact child's committed qualifying Actual HP Damage. Base coefficient **0.10**; Skill3 adds **0.10** when its authored enhancement qualifies →**0.20** on the same result basis. Other independently qualifying Lifesteal sources follow their own Contract/read checkpoint. Use HEL-005 additive composition, never two ordering-sensitive per-target Heals or duplicated child Damage credit. Overheal DISCARD. Modifier −5 AE cannot make waived child Cost negative or refund AE.

**Local root order for Skill1/Ultimate:** fixed-AoE Damage batch → mandatory lifecycle/result processing, including required stable health settlements → attacker-owned Heal if applicable → remaining root direct Effects → ACTION_DIRECT_EFFECTS_COMPLETE → enemy afterimage counter batch/ordinary Reactions. No ordinary Counter interposes between Damage and Heal. Mandatory lifecycle/health work is not an ordinary Reaction. This explicit local profile is not a global default for all Abilities.

## 3. Normalization against the verified architecture

The inspected merged base is E.8/F.10/G.9 at the commit above. This reviewable delta normalizes Savitar with E.9/F.11/G.10/I.10; those additions become current architecture only when this patch merges. This is a full semantic normalization, not execution-ready numeric Character data.

| Mechanic | Schema / composition | Contracts / operations | Exact runtime path |
|---|---|---|---|
| Basic | TargetSpec POSITION/LOCK_POSITIONS, current-occupant checkpoint, MISS, local invalid drop; Basic-start ATK/WIL Snapshot; one Damage Effect/two components | TGT-004/008, HIT-001–003, SNP-001–003, P-013/014/040–042 | Target/Lock/Area40–42B → Hit42A → Damage45/Transaction31; no Entity chase or Passive-AoE qualification |
| Charged fixed-area relocation | Passive State/actual-completion reset under postActionSettlement; explicit incoming ROOT Natural declared outcome; positionalDamageInterposition/PositionMutationSpec RANDOM_REPOSITION/TRULY_EMPTY; success State/counter/Snapshot operands | ACT-033, POS-001–009, TRG-007/013, RNG-001–003, RES-005, P-020/021/050 | Indexed rules + PositionState/claim readers/RNG/Transaction at42B; atomic group move + allowance + frozen obligation; ordinary movement failure means no move and continue original Damage |
| Afterimage | Snapshot-bound independent COUNTER Effect, locked hostile Natural Actor; RETAIN_CREATED_SETTLEMENT; observed-root ADEC common counter profile; simultaneous proportional result allocation | POS-008, RES-002/008, TRG-011/013, P-040–043 | Existing Trigger/Reaction/Effect records → root direct gate →31 shared counter transaction; not Basic, fake Action, hostile direct outcome or Character branch |
| Skill1 | Required AE20; after-Cost common column/ATK/WIL; locked side-relative column coordinates/current occupants; one simultaneous batch | CST-001/007, TGT-008/010/011, POS-004/008, SNP-003, RES-002/003, P-034/035/040–042 | Existing Cost/Spatial/42B/31; declared root AFTER_DIRECT_EFFECTS_COMPLETE holds ordinary counters until owned Heal/direct work terminal |
| Skill2 activation | stableHealthSettlement on both CurrentHP/CurrentMaxHP, strict ratio/validity/unused Conditions; AE15 and cap; own scoped admission State | TRG-003/006/016, CST-001, STA-014, RES-005, P-020/021/034/035 | Health writers/Lifecycle →35B mandatory finite settlement before next group; failed AE terminal, no poll/AE-only retry |
| Skill2 protection | SYSTEM_STATE with explicit DAMAGE/enemy Natural direct-or-declared-outcome admission scope, retained present occupancy | STA-014/POS-005; existing IMMUNITY classification | State61/Admission64A; no POS-010, no lifecycle type, no renderer-based vacancy, no universal invulnerability |
| Skill2 estimate | state.damageProjectionQueries, reserved coordinate, exact excluded own rule refs, pinned incoming batch/defence inputs; DAMAGE_PROJECTION_REF credit | DMG-035, RES-001/002/008, P-040/041 then ordinary P-021 credit |45D/Shield pure proposals/Result Store → once-only State credit; no P-042/P-043 actual credit, Damage event or shadow timeline |
| Skill2 return | opportunityStartSettlement, creation/grant serial/State-instance anchors; terminate protection → ordinary self Heal and DISCARD | ACT-012/034, CLK-002, HEL-*; P-022/044/045 |19A grant dependency → existing State/Heal/Transaction → same opportunity's CC/control; no extra Action/materialization/SSI |
| Skill3 | finite pending→active3→cooldown1 State Conditions/actual-start-completion Duration; AE25; explicit coefficient/Cost branches; exact result-derived Heal10% | CLK-003/004, TRG-006/013, ACT-040, HEL-005, existing Cost/State/Result primitives | Existing State/DAG/Action/Cost/Result owners; no SPD, timer/callback/priority system or new modifier service |
| Ultimate | one real RequestAction Skill1 child; AE override0; common after-root-Cost Snapshot reuse; coefficient+15; exact child ActualHP aggregate/additive Heal | ACT-020/021/023, CST-006, RES-002/003, HEL-005, P-001/043/044/045 | Existing child/Cost/Snapshot/Result/Heal owners;170/170 or200/200; Heal10% or20% before ordinary counter batch |

Functional Tags are existing DAMAGE, PHYSICAL_DAMAGE, WILL_DAMAGE, AREA, POSITION_MUTATION, HEAL, LIFESTEAL and explicitly DAMAGE-scoped IMMUNITY where appropriate. Counter/Ability identity, TRULY_EMPTY, checkpoint/profile values, projected-result type and State names are **not new Tags**. Existing Primitive operations suffice; P-041 remains pure calculation and its proposed output is wrapped in the distinct projection domain, never relabeled committed.

For delayed Skill3, read-only payability of the authored Natural Skill1 form may choose its15AE branch while the enhancement is pending for that very next actual Action; it does not start/consume the State during a probe or CC-lost opportunity. Skill3's own eligibility requires its controller READY: a pending enhancement would already be active for the prospective next actual Action, so another Skill3 candidate is rejected without changing State. Actual Action start promotes pending to active before qualifying formula resolution; rejected candidate probes leave it pending. The explicitly authored Ultimate child override is0 and never receives a negative debit/refund. Non-Natural work alone does not start pending enhancement or consume actual-action units. These are bounded Condition/Cost/profile branches, not raw code or a generic modifier-priority system.

## 4. Unresolved external boundaries — not blocking this kit

No internal Savitar gameplay question remains from the four original answer groups. Counter batching/root hold, source snapshots, mandatory Skill2 timing and both health fields are locked.

**UNRESOLVED / NOT BLOCKING:** whether to re-author earlier Characters' explicitly approved Entity locks into Slot locks. This patch preserves those Canons and normalized explicit profiles. The separate designer instruction establishes Slot as the project default for new otherwise-undeclared attack binding; it does not supply replacement checkpoints for old explicit locks. Savitar's own Slot profiles are explicit and independent of that migration.

Rank/Class/Native Element/base stats and Cost Budget remain metadata, not invented DC-derived gameplay. Future Mode/Hit/numeric/affiliation/Authority profiles, unequal-destination matching graphs, observable competing mandatory shared-AE settlements, unrelated Reaction priority, observed-root cancellation and battle-terminal ordinary queue cutoff remain **REQUIRED_EXPLICIT / NOT BLOCKING** until that content needs them. No resource winner, average Damage estimate or global Counter precedence is invented. These external composition limits are not internal kit defaults.

## 5. Independent composition / smallest extension proof

Each proof starts from the verified merged E.8/F.10/G.9 capability rather than treating this draft as pre-existing architecture.

| Merged Schema input → governing Contract | Current runtime owner → exact insufficiency | Smallest E.9/F.11/G.10 extension |
|---|---|---|
| TargetSpec POSITION/LOCK_POSITIONS + AreaSpec occupancy → TGT-004/010/011/SNP-* | Target40/Area41/Lock42 already compose retained-coordinate/current-occupant lookup. No new resolver gap. The authoring default and a named post-relocation occupant-read checkpoint were not explicit. |04§11.11/TGT-008 precise binding/default law;42B retains coordinates separately from final recipients. Explicit Entity/Both profiles stay unchanged. |
| PositionMutationSpec/TriggerSpec → POS-001/002/003, RNG-001/002, RES-002/005 | PositionState/Trigger/RNG/Transaction can move atomically, but ordinary post-commit Reaction scheduling cannot move defenders before this area's Damage calculations or create success-only frozen counter work coherently. |04§26.1/POS-008 bounded locked-area→relocation→occupants→Damage phase, atomic allowance/Snapshot/obligation;42B and existing31/37. No new P-050, arbitrary phase hook or iterative fixpoint. |
| Destination/occupancy selectors → POS-001/003/005, DEP-001, ENT-020 | Existing claim owners have reservations; an active-renderer-only destination query loses waiting/absent/deployment ownership. Multi-move commit alone does not define seeded scarce-destination assignment. | POS-009 explicit TRULY_EMPTY union/read plus POS-008 common-set seeded one-to-one law using existing owners/RNG. No duplicate occupancy store or new Mode algorithm; unequal legality graphs remain explicit. |
| Resolution/Trigger/frozen Damage operands → RES-002/008, TRG-004/013 | Existing31 allocates simultaneous packets; an arbitrary sequential Reaction queue would make several created counter receipts/order depend on first dispatch. | POS-008/profile-owned finite obligation membership at one observed-root ADEC;42B routes pure counter proposals to existing31. No generic Reaction batch/default/priority or fake root-direct Damage. |
| DamageSpec + State/scoped admission + Result binding → RES-001/002/008, STA-014, DMG-* | P-040/041 through Damage/Shield already calculate read-only; committed-result queries cannot safely consume a counterfactual, and named admission bypass/pinned batch/shared hypothetical budget were not typed. |04§16.6/DMG-035, distinct projection result and once-only ordinary State credit;45D reuses calculation without P-042/Damage listeners/RNG advance/shadow state. No new Damage type or Primitive. |
| Trigger Conditions/Cost/State and committed health results → TRG-001/002/003/006/015, Cost/Heal/Lifecycle law | Existing health writers/Lifecycle/Trigger observe their operations, but ordinary held Damage listeners miss MaxHP/Cost/Loss/Heal or run too late for next-group admission. |04§7.14/TRG-016, stable actual HP/MaxHP observation after **whole group** and mandatory lifecycle;35B finite mandatory continuation gate. No callback/poll/global priority or change to previous ordinary triggers. |
| State/Duration actor-window inputs → ACT-011/012, CLK-002, ACT-032/033 | SSI19/State/Trigger/Completion distinguish opportunities from actual Actions but have no explicit finite owner-grant settlement before CC. Completion clocks cannot return on a CC-lost opportunity. |04§7.15/ACT-034 and19A finite pre-control grant dependency; retained-coordinate State termination/ordinary Heal. No extra opportunity/materialization/clock subsystem or seconds conversion. |

Retained occupancy/protection, Skill3 finite3+1 phase State, coefficient+30/+15 formula branches, AE overrides, exact real child and HEL-005 additive outcome Heal already compose. No architecture extension is accepted merely to make their authoring shorter.

## 6. Mutable state ownership / failure / replay

| Data / key | Creation and mutation | Terminal/cleanup and serialization |
|---|---|---|
| Dodge charge: Combat Instance/Entity/current Field Presence | New presence AVAILABLE; successful joined move consumes; own actual Natural completion refreshes | Leave clears; CC/non-Natural does not reset. Ordinary inactive/dead owner cannot initiate movement. Preserve presence instance/processed movement and completion identity; no blanket battle-counter reset. |
| Afterimage obligation: move commit/rule/owner/observed root/profile | Joined success freezes ATK/WIL/hostile Actor and independent Counter provenance | Survives later source death/leave only as this created settlement; target-invalid/counter terminal closes. Retain through source cleanup/replay until result/terminal identity consumers finish. External cancellation/battle terminal still uses explicit applicable law. |
| Skill2 use: Combat Instance/Character battle counter | AE15 successful activation consumes once under authored cap/State transaction | Battle end retires; death/redeploy/Revive does not restore use. Failed AE consumes nothing. |
| Temporal State: owner/current life/presence/State instance | Activation keeps Position/Presence; scoped admission; current batch projections add exact estimate once | First later own grant terminates then Heal; death/leave cancels/no Heal. Retain creation serial/accumulator/projection credit IDs; old work cannot alter a new State/life/presence. |
| Projection/result: batch/query/State/recipient/phase version | Pure pinned calculation; terminal actual batch permits once-only counter credit | Abort/State retirement grants no credit; payloads freed after consumers, dedup identity retained. Every later batch reads real current state independently. |
| Skill3 controller: owner/current life/presence/instance | Cost creates pending; actual start active3; actual completions decrement, then fresh cooldown1 | Same third completion cannot consume fresh cooldown; fourth completes it. Death/leave clears all phases. Serialize phase/start/completion identity; no old expiry mutates refreshed/new state. |
| Mandatory observations / grant work: existing Trigger/Scheduler records | Health commit/recipient or owner/grant/State + local dependency; finite DAG/continuation | Terminal nonqualification/Cost failure/success dedup; no failed-AE poll token. Serialize pinned observation/grant/cursor before resume; no double payment/Heal/SSI advance. |

Ordinary relocation failure has no success mutations and original Damage continues under the authored no-move policy. Unsupported content/IR is a separate normalization/fail-closed error. Empty/invalid coordinate branches have no replacement; committed Costs are not automatically refunded. No actual health observer runs between sibling packets of a simultaneous or mixed group, inside joined survival/Return/Revive staging, or before mandatory HP_ZERO. Projection records never enter actual Damage outcome metrics.

## 7. Applied impact and audit status

| Canonical file | Result / changed sections |
|---|---|
|00|PATCH: version/navigation only; Savitar Canon and E.9/F.11/G.10/I.10 summary. Recovery audit unchanged. |
|01|NO CHANGE: existing Target/Position/Lock/Hit and fixed-area/presence meanings suffice. |
|02|NO CHANGE: no new semantic capability Tag. |
|03|NO CHANGE: no new atomic operation; existing pure calculation/group movement suffice. |
|04|PATCH: revision, Trigger§7.14/15, projected ValueRef§9, positional read§11.11, query§16.6, relocation§26.1, lowering§51 and validation§92. |
|05|PATCH: revision; ACT-034, TRG-016, TGT-008, DMG-035, POS-008/009; no prior ID/block renumbering. |
|06|PATCH: revision; opportunity19A, required events33A, stable health35B, positional/deferred-counter42B, projection45D and save168. All use existing owners. |
|07|NO CHANGE: H.1 already supplies Main Slot/SSI grant/CC distinction. Generic finite execution belongs Kernel; other Modes require explicit adapters. |
|08|PATCH: revision/dependency versions and M-082–M-093; twelve declarative obligations, including one external-boundary probe. No executable game tests. |

Only raw entry77 is changed in `Ý tưởng nhân vật 4.md`; unrelated entries and original EOF form are preserved. The requested Vesper predecessor is absent from verified main; existing placeholder77 after76 was used without inventing/moving another kit.

Drafts were independently challenged: existing Slot lookup withdrew a proposed new-resolver gap; projection was separated from actual receipts and given shared hypothetical budgets; original raw EOF restored; fresh cooldown same-completion decrement forbidden; temporal State retained active presence; final health barrier explicitly follows complete simultaneous/mixed groups and joined lifecycle, including effective MaxHP contribution recomputation; ordinary move failure separated from malformed content; pending enhancement uses read-only prospective eligibility/Cost rather than starting on a rejected probe. Charge reset uses existing ACT-033, not another scheduler extension. Prior Character Canons/Contracts/stress bodies remain unchanged.

| Final self-audit pass | Result / evidence |
|---|---|
|1 — Semantic fidelity|PASS: final designer root Heal→ADEC→counter batch, common snapshots, strict15%, both health fields, present reserved State, once-battle Cost/use, pure per-batch projection and completion-versus-opportunity3+1 clocks matched against raw/locks. |
|2 — Independent composition|PASS: P-013/014/040/041/050, existing State/Cost/child/Result/HEL-005/ACT-033 reused. Accepted only the bounded checkpoint/assignment/context laws proved in§5; rejected a new Slot resolver/Tag/Primitive. |
|3 — Layer/namespace/lifetime|PASS:240 unique Contract IDs, all234 prior blocks unchanged; six new IDs resolve across04–08/Canon. Owner/key/creation/terminal/cleanup/replay mapped in§6;01/02/03/07 and all prior Canons are byte-identical to base. |
|4 — Determinism/negative space|PASS: M-082–M-093 specify seed/permutation, claims/scarcity, failure, source death/invalid target, shared budgets, zero/blocked Heal, HP_ZERO/staging, CC/probe/clock, replay and unsupported external composition. Documented arithmetic checked; no executable matching/game-test result claimed. |
|5 — Prompt/source contradiction|PASS: latest explicit answers supersede pending questions/raw Basic-dodge example; source is actual GitHub main plus this authorized delta. Old explicit Entity locks are preserved; metadata/migration/external boundaries remain explicit, not invented gameplay. Architecture Phase/no implementation honored. |
|6 — Mergeability|PASS: actual seven-file diff inspected, git diff --check/UTF-8/fences/references/version/count checks completed. Raw bytes outside77/EOF preserved; all212 prior named stress bodies (207 A–N plus5 META) retained,12 new cases give224 total. Main/base/PR head must be rechecked immediately before delivery; no unrelated change is included. |

Changed sections are listed above and in the reviewable PR. The required adversarial re-audit corrections are included in the same canonical diff. No implementation build/game tests were run or reported;08 is declarative architecture coverage.
