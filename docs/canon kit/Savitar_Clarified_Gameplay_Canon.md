# ARCLUNE — SAVITAR — CLARIFIED GAMEPLAY CANON

**Revision:** R3 — completes R2's tag/facet mapping, projection-credit timing and return-value lifetime against the actual merged architecture; preserves all nine designer locks and later root-order/health answers.
**Status:** GAMEPLAY_CLARIFIED / ARCHITECTURE_NORMALIZED. Architecture Phase documentation; not executable Character data.
**Source:** current Savitar raw description and SAVITAR — DESIGNER LOCK supplied by the designer; raw entry77 in `Ý tưởng nhân vật 4.md`. Explicit locks supersede contrary raw examples, including Basic itself activating the fixed-AoE Passive.
**Architecture base inspected:** actual merged main `2d41b3d4d8a5207d79151bc15883ab64a54a1239`, INDEX-11 / E.9 / F.11 / G.10 / H.1 / I.10. PR #14 already merged the original Savitar architecture. R3 refines existing DMG-035/ACT-034 through E.10 / F.12 / G.11 / I.11; the latest merged indexed 00–08 remain architecture authority. Historical E.8-base gap analysis is provenance, not a set of still-open gaps.

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

Bind the observed own Action to its charge/controller presence instance. A completion from a retired presence cannot refresh a newer presence's charge, even if ordinary Revive preserved lifeSerial or the Event is delivered again. Runtime identity is not gameplay priority.

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

The use flag belongs to the **owning battle × Character participant**, with BATTLE_SCOPED retention, rather than to a fresh life, field-presence State or incidental Combat Instance key. New presence initializes local controllers, not another use. Revive/redeploy and instance transfer within that same owning battle do not reset it; an independently defined new battle has its own initialization. Active Mode defines that battle owner; no new cross-Mode battle policy is inferred.

A multi-group enemy Action may therefore commit group1 → process lifecycle → activate Skill2 → reject Savitar's enemy-Natural Damage admission in group2. A MaxHP-only increase may cross the threshold even when CurrentHP did not change, including recomputation from committed stat/State/position-dependent contributions. Check actual committed health changes, including Cost/Loss/Heal/MaxHP reconciliation under their ordinary laws; do not misclassify them all as Damage or bypass HP_ZERO/death processing. No observer can activate between sibling packets of one simultaneous group.

Successful activation consumes its battle use and enters an owner/current-presence **temporal-admission-protection State**. The label TEMPORAL_ABSENCE is Character state terminology, not the canonical `TEMPORARILY_ABSENT` lifecycle operation. Savitar remains alive and Field Present, with the **same authoritative Slot ownership/reservation**. There is no LEAVE_FIELD, Deck transition, deployment vacancy, DEATH_CONFIRMED, aura/presence removal or moving Entity. Occupancy claims forbid placing another actor there.

**Protection:** reject Savitar as a Damage recipient of **enemy Natural Action outcomes**, including Entity-targeted and Slot/area-targeted Damage. This is scoped Damage-target/effect admission rejection before Damage mutation, not Damage Reduction, Shield consumption, HP immunity or universal invulnerability. Existing independent DoT/Mark/non-targeting State/environmental effects follow their own Contracts. Ally Heal/Buff and non-Damage Effects retain ordinary target rules. Root lineage alone does not turn independent Reaction/Counter/Follow-up into a protected Natural outcome. Ordinary Authority conflicts are handled only if explicit conflicting Authority-bearing clauses exist.

**Counterfactual:** for each qualifying fixed positional enemy-Natural Damage batch containing the reserved coordinate, calculate what Actual HP Damage this same batch would have produced against Savitar **if this temporal admission exclusion alone were removed**. Use actual hostile packets/formula/source snapshots plus authoritative defensive State, mitigation, Shield/layer rules and HP at that batch checkpoint. Multiple packets share one hypothetical recipient Shield/HP budget under the batch's explicitly applicable allocation; do not spend the full same Shield independently per packet. Hypothetical Shield absorption reduces the HP-bound estimate.

The calculation is read-only: no real HP/Shield mutation, Damage publication, ordinary DamageResult credit, HP_ZERO, Reflect/Lifesteal/listeners or resource payment. Retain a distinct projected result, not a fake committed DamageResult. Each later hostile batch starts from then-current **real** state; no persistent shadow HP/Shield timeline. Accumulate its projected HP-bound estimate once into this State's `avoidedFixedAoeActualHpDamage`. Single-target/random-target attacks add nothing. Duplicate observation cannot add twice; future numerical/Hit Admission profiles not expressible by the ordinary pipeline remain explicit unsupported Mode/content boundaries.

Only a temporal State already active at the batch's post-relocation/pre-Damage checkpoint can own that query. Damage that first lowers Savitar below15% and activates Skill2 at the later stable-health checkpoint remains actual Damage and adds **no** retrospective estimate. A later qualifying batch can project normally. Real recipient exclusion, including an entirely empty admitted set, does not erase the locked area or its pre-registered projection.

After the whole observed batch and mandatory lifecycle/reconciliation, finish projection credit as **required finite batch bookkeeping before the next direct group/Action/SSI continuation**. An ordinary Reaction hold cannot defer it until after return. Commit accumulator delta and terminal credit identity together; zero estimate is a terminal zero credit, abort or retired State gives no credit. No new HEALTH_MUTATION_STABLE observation follows this non-health counter change. Projection calculation, actual Damage commit, health settlement and estimate credit remain distinct boundaries; unrelated non-commuting mandatory work requires an explicit composition.

While this State is active, Passive dodge does not trigger and its charge is preserved. The protection does not erase Position/geometry eligibility; the fixed area still contains Savitar's reserved coordinate.

**Return:** at the **start of Savitar's next SSI-granted Natural Action opportunity**, end temporal admission exclusion at the same reserved Slot, then Heal, then ordinary Action/CC handling. This opportunity-based boundary happens even if that opportunity is subsequently lost to CC. Do not require a performed Action, follow a vacated Slot's new occupant, generate another opportunity, or run ordinary materialization into a newly chosen coordinate.

`requested return Heal = 0.25 × CurrentMaxHP at return settlement + 0.30 × accumulated projected avoided fixed-AoE HP Damage`

The return graph is **capture completed accumulator → end temporal admission State → calculate/resolve ordinary Heal → close this grant dependency → ordinary CC/Action handling**. Capture the exact State-owned accumulator with P-002/SNAPSHOT_REF before removal, retain that immutable value through the terminal Heal, and read CurrentMaxHP at return-Heal calculation under the existing formula law. Removing this State as the return graph's own expected step does not cancel its registered Heal or make it read a missing live counter. It does not copy MaxHP/Heal modifiers into the accumulator snapshot. A blocked/zero Heal still closes return with protection ended; it grants no retry or new use. Guard remaining work by the original battle participant, Combat Instance, life/presence, State and grant identities; death/leave cannot Heal a replacement instance.

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

The inspected merged base already contains E.9/F.11/G.10/I.10. Reuse those positional, health, projection and grant profiles; do not recreate their original gaps. R3 only completes the existing projection credit/termination lifetime laws and Character composition under E.10/F.12/G.11/I.11. This is semantic architecture normalization, not execution-ready numeric Character data.

| Mechanic | Schema / composition | Contracts / operations | Exact runtime path |
|---|---|---|---|
| Basic | TargetSpec POSITION/LOCK_POSITIONS, current-occupant checkpoint, MISS, local invalid drop; Basic-start ATK/WIL Snapshot; one Damage Effect/two components | TGT-004/008, HIT-001–003, SNP-001–003, P-013/014/040–042 | Target/Lock/Area40–42B → Hit42A → Damage45/Transaction31; no Entity chase or Passive-AoE qualification |
| Charged fixed-area relocation | Passive State/actual-completion reset under postActionSettlement; explicit incoming ROOT Natural declared outcome; positionalDamageInterposition/PositionMutationSpec RANDOM_REPOSITION/TRULY_EMPTY; success State/counter/Snapshot operands | ACT-033, POS-001–009, TRG-007/013, RNG-001–003, RES-005, P-020/021/050 | Indexed rules + PositionState/claim readers/RNG/Transaction at42B; atomic group move + allowance + frozen obligation; ordinary movement failure means no move and continue original Damage |
| Afterimage | Snapshot-bound independent COUNTER Effect, locked hostile Natural Actor; RETAIN_CREATED_SETTLEMENT; observed-root ADEC common counter profile; simultaneous proportional result allocation | POS-008, RES-002/008, TRG-011/013, P-040–043 | Existing Trigger/Reaction/Effect records → root direct gate →31 shared counter transaction; not Basic, fake Action, hostile direct outcome or Character branch |
| Skill1 | Required AE20; after-Cost common column/ATK/WIL; locked side-relative column coordinates/current occupants; one simultaneous batch | CST-001/007, TGT-008/010/011, POS-004/008, SNP-003, RES-002/003, P-034/035/040–042 | Existing Cost/Spatial/42B/31; declared root AFTER_DIRECT_EFFECTS_COMPLETE holds ordinary counters until owned Heal/direct work terminal |
| Skill2 activation | stableHealthSettlement on both CurrentHP/CurrentMaxHP, strict ratio/validity/unused Conditions; AE15 and cap; own scoped admission State | TRG-003/006/016, CST-001, STA-014, RES-005, P-020/021/034/035 | Health writers/Lifecycle →35B mandatory finite settlement before next group; failed AE terminal, no poll/AE-only retry |
| Skill2 protection | SYSTEM_STATE with explicit DAMAGE/enemy Natural direct-or-declared-outcome admission scope, retained present occupancy | STA-014/POS-005; existing IMMUNITY classification | State61/Admission64A; no POS-010, no lifecycle type, no renderer-based vacancy, no universal invulnerability |
| Skill2 estimate | state.damageProjectionQueries, pre-Damage active-State membership, reserved coordinate, exact excluded own rule refs, pinned batch/defence inputs; DAMAGE_PROJECTION_REF and creditStateCounterRef | DMG-035, RES-001/002/008, P-040/041 then joined P-021/terminal identity |45D/Shield pure proposals/Result Store → required terminal State credit before continuation; no retrospective query, P-042/P-043 actual credit or shadow timeline |
| Skill2 return | opportunityStartSettlement, creation/grant/State anchors; accumulator capture → terminate protection → ordinary self Heal/DISCARD | ACT-012/034, CLK-002, SNP-001–003, HEL-*; P-002/022/044/045 |19A finite grant graph retains Snapshot/owner validity after its own removal → terminal Heal → same grant's CC/control; no live retired-counter read, extra Action/materialization/SSI |
| Skill3 | finite pending→active3→cooldown1 State Conditions/actual-start-completion Duration; AE25; explicit coefficient/Cost branches; exact result-derived Heal10% | CLK-003/004, TRG-006/013, ACT-040, HEL-005, existing Cost/State/Result primitives | Existing State/DAG/Action/Cost/Result owners; no SPD, timer/callback/priority system or new modifier service |
| Ultimate | one real RequestAction Skill1 child; AE override0; common after-root-Cost Snapshot reuse; coefficient+15; exact child ActualHP aggregate/additive Heal | ACT-020/021/023, CST-006, RES-002/003, HEL-005, P-001/043/044/045 | Existing child/Cost/Snapshot/Result/Heal owners;170/170 or200/200; Heal10% or20% before ordinary counter batch |

### 3.1 Exact Functional Tags and non-Tag facets

Use the exact active registry in `02_TAG_vNext.md`, attached to the smallest semantic owner. Ability/Character search capabilities may derive upward from these owners; they do not copy tags down to sibling Effects.

| Smallest semantic owner | Functional Tags | Separate Schema facets / composition |
|---|---|---|
| Basic Damage Effect | DAMAGE, PHYSICAL_DAMAGE, WILL_DAMAGE | BASIC_ATTACK identity; one hit/two components; enemy Slot lock/current occupant |
| Passive's real successful move | POSITION_MUTATION | fixed-area Trigger; RANDOM_REPOSITION; TRULY_EMPTY; charge and seeded matching |
| Passive's frozen afterimage Damage Effect | DAMAGE, PHYSICAL_DAMAGE, WILL_DAMAGE | COUNTER behavior/provenance; retained settlement; hostile Actor lock; simultaneous proportional batch |
| Skill1 Damage Effect, including its exact Ultimate child | DAMAGE, PHYSICAL_DAMAGE, WILL_DAMAGE | SKILL identity; fixed COLUMN AreaSpec; retained coordinates/post-move occupants; source Snapshot |
| Skill2 temporal admission State | IMMUNITY | DAMAGE only, enemy Natural direct/declared outcome; State61/Admission64A; unchanged present occupancy |
| Skill2 return Heal Effect | HEAL | retained accumulator Snapshot; CurrentMaxHP formula; opportunity-start dependency; Overheal DISCARD |
| Skill3's conditional result-derived Heal Effect | HEAL | exact Basic/Skill1 committed basis and coefficient0.10; finite controller/Cost/formula branches |
| Ultimate's one owned result-derived Heal Effect | HEAL | exact real child result; HEL-005 coefficient0.10 + qualifying Skill3 coefficient0.10 |

**Correction to R2:** AREA is not a registered Functional Tag; area geometry/selection belongs TargetSpec/AreaSpec. LIFESTEAL is still **DEFERRED** in 02§13.4 and is expressed here as committed Damage aggregation + HEAL/HEL-005. Neither label is inserted into `tags[]`. COUNTER/Ability identity, TRULY_EMPTY, phase/checkpoint/profile values, projected-result type and State/controller names remain facets or typed data.

Skill2 grants neither TEMPORARY_ABSENCE nor TARGET_EXCLUSION: it retains geometry/selection eligibility and rejects scoped Damage admission. Projection alone has no DAMAGE/HEAL capability or actual result credit. Skill3's coefficient choices do not mutate ATK/WIL/SPD, and an AE Cost/discount is not RESOURCE_MODIFIER. Beneficial prose does not assign BUFF identity/Authority; future external classification/dispel interactions need the applicable declared Status profile. VFX creates no gameplay tag. Existing Primitive operations suffice; P-041's pure calculation is wrapped in the distinct projection domain, never relabeled committed.

For delayed Skill3, read-only payability of the authored Natural Skill1 form may choose its15AE branch while the enhancement is pending for that very next actual Action; it does not start/consume the State during a probe or CC-lost opportunity. Skill3's own eligibility requires its controller READY: a pending enhancement would already be active for the prospective next actual Action, so another Skill3 candidate is rejected without changing State. Actual Action start promotes pending to active before qualifying formula resolution; rejected candidate probes leave it pending. The explicitly authored Ultimate child override is0 and never receives a negative debit/refund. Non-Natural work alone does not start pending enhancement or consume actual-action units. These are bounded Condition/Cost/profile branches, not raw code or a generic modifier-priority system.

### 3.2 Finite controller composition

| Controller / state | Authored transition | Terminal/read boundary |
|---|---|---|
| Dodge AVAILABLE / SPENT | new valid presence → AVAILABLE; successful coherent move → SPENT; same-presence own actual completion → AVAILABLE | ACT-033 terminal reset before Natural handoff; CC/non-Natural/old-presence completion changes nothing |
| Battle Skill2 use UNUSED / USED | one successful AE15/activation transaction → USED | BATTLE_SCOPED participant flag; failed AE uses nothing; local controller cleanup cannot reset it |
| Temporal State ACTIVE / RETURNING / CLOSED | successful activation → ACTIVE; qualifying already-active queries credit before batch continuation; first later own grant captures accumulator and ends protection → finite RETURNING work | one terminal ordinary Heal → CLOSED; death/leave before return cancels; normal own State removal preserves captured Heal work, not active admission |
| Skill3 READY / PENDING / ACTIVE(3→2→1) / COOLDOWN(1) | AE25 cast → PENDING, excluding origin Action; next actual own start → ACTIVE3; third enhanced completion → fresh COOLDOWN1; one future own actual completion → READY | same third completion cannot consume fresh cooldown; no cast during pending/active/cooldown; CC/probes/non-Natural do not consume; death/leave retires this controller |

RETURNING describes an existing retained finite settlement cursor, not a new targetable State, Entity or subsystem. Keep declaration IDs separate from runtime owner/State/presence/grant identities. All clocks/queries/terminal readers use the instance that created them; a preserved lifeSerial is insufficient to authorize stale work against a newer State.

## 4. Unresolved external boundaries — not blocking this kit

No internal Savitar gameplay question remains from the four original answer groups. Counter batching/root hold, source snapshots, mandatory Skill2 timing and both health fields are locked.

**UNRESOLVED / NOT BLOCKING:** whether to re-author earlier Characters' explicitly approved Entity locks into Slot locks. This patch preserves those Canons and normalized explicit profiles. The separate designer instruction establishes Slot as the project default for new otherwise-undeclared attack binding; it does not supply replacement checkpoints for old explicit locks. Savitar's own Slot profiles are explicit and independent of that migration.

Rank/Class/Native Element/base stats and Cost Budget remain metadata, not invented DC-derived gameplay. Future Mode/Hit/numeric/affiliation/Authority profiles, unequal-destination matching graphs, observable competing mandatory shared-AE settlements, unrelated Reaction priority, observed-root cancellation and battle-terminal ordinary queue cutoff remain **REQUIRED_EXPLICIT / NOT BLOCKING** until that content needs them. No resource winner, average Damage estimate or global Counter precedence is invented. These external composition limits are not internal kit defaults.

## 5. Independent composition / smallest correction proof

Start from the verified **merged E.9/F.11/G.10**, not R2's older E.8 draft baseline. Current TGT-008/POS-008/009, TRG-016, DMG-035 and ACT-034 already exist. Original Slot lookup, matching, afterimage batch, projected-result type, health and opportunity laws are **REUSE**, not seven new gaps to accept again. PR #14 and repository history retain that original proof.

| Locked semantic / current Schema input → governing Contract | Existing runtime owner / composition attempt → exact failure | Smallest E.10/F.12/G.11 correction / rejection consequence |
|---|---|---|
| An already-active temporal State accumulates each qualifying batch once before a later return; state.damageProjectionQueries + DAMAGE_PROJECTION_REF + creditStateCounterRef → DMG-035/RES-002/005 | Damage/Result/State/Transaction45D can calculate and credit. F.11 says credit at terminal but does not classify its continuation dependency: ordinary held Reaction delivery can postpone credit until return removes State, losing an otherwise-valid estimate. Allocating query membership at that late point could also retroactively count the very Damage that activated Skill2. | Extend existing query lowering/DMG-035/45D with sealed pre-Damage active-State membership and finite credit/no-credit dependency after complete batch/lifecycle, before continuation. Counter delta and terminal identity join one State transaction. No new field family/ID/queue; reject retrospective queries, held credit or cyclic/unsupported mandatory conflicts. |
| Return ends temporal protection, then Heals from the completed accumulator; opportunityStartSettlement + State removal + COUNTER_REF/Heal → ACT-034/SNP-001–003/HEL-* | SSI19A/State/Snapshot/Heal/Effect cursor already compose capture → removal → Heal with P-002/022/044/045. F.11's generic retirement cancellation and an unretained live counter could cancel that very graph or erase its formula basis after its own expected removal. | Use existing typed SnapshotRef before removal; refine ACT-034/19A to retain this registered graph's captured values through normal own termination while preserving original owner-instance guards. No new lifecycle/manager/state retention exemption; reject live retired-counter reads, stale owner continuation or missing capture lifetime. |

These are reusable boundaries for any credit-bearing read-only query and finite State-termination/terminal-effect graph. They are semantic timing/lifetime failures, not authoring convenience. Pure projection still mutates nothing; its credit remains an ordinary **State transaction** with mandatory dependency timing, not an ordinary Reaction. Captured return values do not preserve active admission, resurrect a State or snapshot unrelated formula inputs.

Exact Functional Tag mapping, battle-participant use, presence-instance clocks, retained occupancy, Skill3 finite3+1 controller, coefficient+30/+15 branches, AE overrides, exact real child and HEL-005 additive Heal all use existing composition. No new Tag, Primitive, Contract ID, top-level runtime owner, arbitrary hook or global priority is justified. `01`, `02`, `03` and `07` require no semantic change. Unsupported external matching/ordering/Mode profiles remain explicit.

## 6. Mutable state ownership / failure / replay

| Data / key | Creation and mutation | Terminal/cleanup and serialization |
|---|---|---|
| Dodge charge: Combat Instance/Entity/current Field Presence/controller instance | New presence AVAILABLE; successful joined move consumes; same-presence own actual Natural completion refreshes | Leave clears; CC/non-Natural does not reset. Ordinary inactive/dead owner cannot initiate movement. Preserve original Action/presence binding and processed move/completion identity; an old completion cannot refresh a new controller. |
| Afterimage obligation: move commit/rule/owner/observed root/profile | Joined success freezes ATK/WIL/hostile Actor and independent Counter provenance | Survives later source death/leave only as this created settlement; target-invalid/counter terminal closes. Retain through source cleanup/replay until result/terminal identity consumers finish. External cancellation/battle terminal still uses explicit applicable law. |
| Skill2 use: owning battle/Character participant, BATTLE_SCOPED | AE15 successful activation consumes once under authored cap/State transaction | Owning battle end retires; death/redeploy/Revive or same-battle instance transfer does not restore use. Failed AE consumes nothing; initializing a local controller cannot recreate this flag. |
| Temporal State: owner/current life/presence/State instance | Activation keeps Position/Presence; scoped admission; already-active batch queries credit estimate before continuation | First later own grant captures accumulator and terminates admission; death/leave before return cancels/no Heal. Retain creation serial/query-credit identity; no retroactive query or mutation of a newer State. |
| Projection/result: batch/query/State/recipient/phase version | Pure pinned calculation; required terminal credit joins State delta and dedup identity | Abort/retirement grants no credit; zero valid result closes; payloads freed after consumers, identity retained. Later batch reads independent real state; continuation cannot overtake pending credit. |
| Return settlement/Snapshot: original temporal State + owner life/presence + observed grant/dependency | Before normal removal capture completed accumulator; hold immutable basis through ordinary Heal | Own expected State removal preserves only this registered graph's terminal work, not protection. Death/leave/invalid original owner cancels; blocked/zero Heal closes without retry. Save capture/removal/Heal cursor and terminal identity, then release payloads. |
| Skill3 controller: owner/current life/presence/instance | Cost creates pending; actual start active3; actual completions decrement, then fresh cooldown1 | Same third completion cannot consume fresh cooldown; fourth completes it. Death/leave clears all phases. Serialize phase/start/completion identity; no old expiry mutates refreshed/new state. |
| Mandatory observations / grant work: existing Trigger/Scheduler records | Health commit/recipient or owner/grant/State + local dependency; finite DAG/continuation | Terminal nonqualification/Cost failure/success dedup; no failed-AE poll token. Serialize pinned observation/grant/cursor before resume; no double payment/Heal/SSI advance. |

Ordinary relocation failure has no success mutations and original Damage continues under the authored no-move policy. Unsupported content/IR is a separate normalization/fail-closed error. Empty/invalid coordinate branches have no replacement; committed Costs are not automatically refunded. No actual health observer runs between sibling packets of a simultaneous or mixed group, inside joined survival/Return/Revive staging, or before mandatory HP_ZERO. Projection records never enter actual Damage outcome metrics.

## 7. R3 impact across 00–08 and validation obligations

| Canonical file | R3 decision / exact scope |
|---|---|
|00|PATCH: INDEX-12, Savitar R3 navigation and E.10/F.12/G.11/I.11 summary. Recovery audit unchanged. |
|01|NO CHANGE: existing Target/Position/Hit, Actual HP Damage, Snapshot and State-retention meanings suffice. |
|02|NO CHANGE: correct this Character's tag use against the exact existing registry; AREA is a facet, LIFESTEAL remains deferred. |
|03|NO CHANGE: P-002/021/022/040/041/044/045 and existing transaction/movement composition suffice. |
|04|PATCH: E.10, §7.15 capture-through-termination composition, §16.6 pre-Damage eligibility/mandatory atomic credit, §51 lowering and §92 validation. No new Schema field family. |
|05|PATCH: F.12, extend only existing ACT-034 and DMG-035; no Contract ID additions/renumbering or unrelated block change. |
|06|PATCH: G.11, §19A retained return bindings, §45D sealed query/required credit continuation and §168 serialization through existing owners. |
|07|NO CHANGE: H.1 supplies Main Slot/SSI grant/CC and owning Mode context; no new mode rule or seconds conversion. |
|08|PATCH: I.11/dependency versions; M-094–M-099 for tags, required credit, no retrospective projection, captured return lifetime, battle/presence guards and rejection. Prior cases remain unchanged. |

Raw Savitar entry77 and all unrelated raw entries/Character Canons remain unchanged in R3. Root `readme.md` is deleted under the current explicit maintenance request; `AGENTS.md` and indexed canonical files retain their entry-point role. No executable implementation file, build or game/runtime test is part of this Architecture Phase change.

The final six-pass audit must check the actual R3 diff against the pinned base and latest target before delivery:

| Pass | Required evidence / regression anchors |
|---|---|
|1 — Semantic fidelity|Preserve R2 thresholds/formulas, enemy-root Heal before counters, present reserved occupancy and completion-versus-opportunity clocks. M-082–M-093 stay byte-identical; M-095–M-098 make previously incomplete credit/lifetime bindings explicit. |
|2 — Independent composition|Use existing P-002 snapshots and State/Effect/Result/Transaction continuation. §5 proves only two bounded refinements; exact tag correction and battle/presence ownership do not grow architecture. |
|3 — Layer / namespace / lifetime|Existing Contract ID set unchanged; only ACT-034/DMG-035 bodies refined. §6 maps capture/creation/mutation/terminal/replay. Validate every Functional Tag against active 02, not historical candidates. |
|4 — Determinism / negative space|Attack held Reactions, exclusion-only/zero/abort/retired batch, same-batch activation, remove-before-Heal/resume, blocked Heal, unchanged lifeSerial/new presence and same-battle use. No unrelated resource winner/priority is added. |
|5 — Prompt / source contradiction|Use actual merged main, current raw77 and R2 gameplay locks; separate old drafting proof from current capability. Preserve metadata/external boundaries without invented classification/Authority/numerics. Only proven files change; requested README removal is included. |
|6 — Mergeability|Inspect actual diff; run git diff --check, UTF-8/fence, exact ID/tag/reference/version and prior-body checks. Verify 230 named cases/probes/meta-tests (225 A–N +5 META), including six additions. Recheck PR head/target and merged content. These checks do not assert executable gameplay results. |
