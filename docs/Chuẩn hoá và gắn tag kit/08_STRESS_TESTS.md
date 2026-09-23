# ARCLUNE — ARCHITECTURE STRESS TESTS
## Chặng I — Reverse Validation of Terminology / Tags / Schema / Primitives / Contracts / Kernel
**Version:** 2026-09-21-I.1  
**Status:** Working Canonical Validation Suite  
**Depends on:** `01_TERMINOLOGY_vNext.md`, `02_TAG_vNext.md`, `03_PRIMITIVE.md`, `04_ABILITY_SCHEMA.md`, `05_CONTRACTS.md` F.2+, `06_KERNEL_RUNTIME.md` G.1+, `07_MODE_PROFILES.md`  
**Revision I.1:** adds Pilot Normalization #3 stress coverage for bounded Action Intent interposition/revalidation, dynamic distributed multi-payer Cost, immutable typed Cost-payment results, scoped Effect-amount modifiers, and the explicit local `AFTER_DIRECT_EFFECTS_COMPLETE` sequential Reaction-boundary profile.  
**Purpose:** thử ngược kiến trúc bằng mechanic thật và edge case nhân tạo trước khi bulk-normalize hơn 200 kit.

---

# 0. WHAT THIS FILE IS

`08_STRESS_TESTS.md` is not a list of unit tests for finished C# code.

It is a **semantic architecture validation suite**.

Each case asks:

> Can the current Arclune architecture represent this mechanic using existing canonical layers, resolve it deterministically, preserve all semantic distinctions, and avoid Character-specific runtime code?

A test can therefore fail before code exists.

Possible failure meanings:

- missing Terminology distinction;
- bad Tag boundary;
- missing Schema field;
- missing Primitive;
- unresolved Contract;
- wrong Kernel subsystem;
- illegal Character-specific special case;
- mode-profile leak.

---

# 1. TEST STATUS TYPES

Every test uses one of four statuses.

## `MUST_PASS`

Current canon is sufficient to determine the expected result.

Architecture must represent and resolve it without inventing new semantics.

## `MUST_REJECT`

The correct behavior is to reject invalid/ambiguous authoring or runtime input.

Passing means:
> Kernel/Normalizer refuses to guess.

## `PROBE_UNRESOLVED`

The test intentionally targets a currently unresolved Contract.

Passing means:
> architecture detects and exposes the unresolved branch rather than silently choosing an outcome.

## `FUTURE_MODE_PROBE`

The structure is valid, but the current mode has not yet defined enough gameplay rules for a final outcome.

---

# 2. STANDARD TEST RECORD

Each stress test contains:

**ID** — stable test identifier.  
**Status** — MUST_PASS / MUST_REJECT / PROBE_UNRESOLVED / FUTURE_MODE_PROBE.  
**Purpose** — what architecture boundary is being attacked.  
**Initial State** — minimum required state.  
**Input** — Action/Event/authoring declaration.  
**Expected Resolution** — canonical result or expected validation blocker.  
**Expected Trace / State** — important observable runtime facts.  
**Forbidden Outcomes** — outcomes that reveal architecture drift.  
**Layers Under Test** — Terminology / Tag / Schema / Primitive / Contract / Kernel / Mode.

---

# 3. PASS CRITERION FOR THE ARCHITECTURE

The architecture is considered healthy when the hard test suite can pass while preserving all of these:

1. no `switch(characterId)` for ordinary kit logic;
2. no new Tag merely because wording differs;
3. no new Primitive where existing composition is sufficient;
4. no Character-specific Contract when a shared domain Contract is sufficient;
5. no arbitrary ordering disguised as gameplay canon;
6. no prose parsing at runtime;
7. no presentation state driving combat result;
8. no silent default where project intentionally remains unresolved.

---

# 4. FAILURE CLASSIFICATION

If a test fails, classify the failure before changing files.

## F-T — Terminology Failure
Two distinct concepts were collapsed or one concept lacks a name.

## F-G — Tag Failure
A semantic capability cannot be indexed cleanly, or duplicate Tags are required.

## F-S — Schema Failure
The mechanic is understood but cannot be declared without prose/code.

## F-P — Primitive Failure
The schema is expressive, but Kernel lacks a reusable executable operation.

## F-C — Contract Failure
Operations exist, but timing/order/outcome is ambiguous.

## F-K — Kernel Failure
Contracts are clear, but runtime state ownership/scheduler/transaction cannot execute them.

## F-M — Mode Failure
Shared semantics leak mode-specific scheduling/spatial assumptions.

## F-X — Character-Specific Escape Hatch
The only proposed solution is bespoke Character runtime code.

`F-X` is a strong architecture warning.

---

# 5. TEST GROUP A — BASIC SEMANTIC COMPOSITION

---

## A-001 — Pure Physical Basic Attack

**ID:** `A-001`  
**Status:** `MUST_PASS`  
**Purpose:** prove the simplest Action does not require Character-specific behavior.  
**Initial State:** A alive; B alive; no Shield; no special state.  
**Input:** A performs Natural Basic Attack dealing `100% ATK Physical Damage` to B.  
**Expected Resolution:** Ability Type/Action Identity = BASIC_ATTACK; Tags = `DAMAGE + PHYSICAL_DAMAGE`; target selected; Damage Packet built; ARM mitigation applied; Final Damage Reduction if present; HP commit; death evaluation if HP_ZERO.  
**Expected Trace / State:** one Natural Action; one Damage Action; Actual HP Damage recorded independently from raw amount; SSI advances after Action completion.  
**Forbidden Outcomes:** Tag `BASIC_ATTACK`; Primitive `BASIC_ATTACK_PRIMITIVE`; using animation hit frame as authoritative damage timing.  
**Layers Under Test:** Tag, Schema, Primitive, Contract, Kernel.

---

## A-002 — Mixed Damage Basic Attack

**ID:** `A-002`  
**Status:** `MUST_PASS`  
**Purpose:** ensure Mixed Damage is composition, not a new special execution path.  
**Initial State:** A has ATK/WIL; B has ARM/RES.  
**Input:** one Basic Attack with Physical component + Will component.  
**Expected Resolution:** one Damage Effect/profile with ≥2 components; Physical reads ARM; Will reads RES; results combine only after their own mitigation stages.  
**Expected Trace / State:** Tags include `DAMAGE`, `PHYSICAL_DAMAGE`, `WILL_DAMAGE`; no required `MIXED_DAMAGE` Tag.  
**Forbidden Outcomes:** converting the whole packet to one averaged defense formula; two Natural Actions; new MixedDamage Primitive.  
**Layers Under Test:** Terminology, Tag, Damage Contract.

---

## A-003 — Skill Copies Basic Attack Damage Profile

**ID:** `A-003`  
**Status:** `MUST_PASS`  
**Purpose:** attack profile must not leak Action Identity.  
**Initial State:** Basic Attack profile exists.  
**Input:** Skill uses `170% of Basic Attack Damage Profile`.  
**Expected Resolution:** Skill remains `ActionIdentity=SKILL`; only damage formula/profile is reused.  
**Expected Trace / State:** Basic-Attack-only triggers do not fire unless the Skill separately creates a Basic Attack child Action.  
**Forbidden Outcomes:** Skill becomes BASIC_ATTACK because profile source is Basic Attack; Cuồng Bạo Basic-only effect incorrectly activates.  
**Layers Under Test:** Terminology, Schema, Contract.

---

## A-004 — Follow-up Basic Attack

**ID:** `A-004`  
**Status:** `MUST_PASS`  
**Purpose:** prove Action Identity, Action Behavior and Natural Action status remain independent.  
**Initial State:** A can schedule one follow-up Basic.  
**Input:** parent Action schedules child Basic.  
**Expected Resolution:** child has `ActionIdentity=BASIC_ATTACK`, `ActionBehavior=FOLLOW_UP`, `naturalActionStatus=NON_NATURAL`.  
**Expected Trace / State:** Basic-only semantic can observe it; Natural-Action-only counter does not. SSI pointer does not advance for child.  
**Forbidden Outcomes:** treating all Basic Attacks as Natural Actions; Functional Tag `FOLLOW_UP`.  
**Layers Under Test:** Terminology, Schema, Kernel.

---

## A-005 — Forced Basic Attack

**ID:** `A-005`  
**Status:** `MUST_PASS`  
**Purpose:** same distinction as A-004 with Forced Action.  
**Initial State:** A is forced to Basic Attack outside its natural slot.  
**Input:** `REQUEST_ACTION` with BASIC_ATTACK + FORCED_ACTION.  
**Expected Resolution:** valid Basic Attack Action; not Natural by default.  
**Expected Trace / State:** no SSI pointer advancement; excluded from mechanics requiring exact Natural Basic sequence.  
**Forbidden Outcomes:** count toward Ký Ức Skill 3 sequence.  
**Layers Under Test:** Action Contract, SSI.

---

# 6. TEST GROUP B — SSI / CLOCKS

---

## B-001 — Alternating Natural Actions

**ID:** `B-001`  
**Status:** `MUST_PASS`  
**Purpose:** validate core SSI.  
**Initial State:** eligible units A1/A2 on Side A and B1/B2 on Side B.  
**Input:** battle progresses normally.  
**Expected Resolution:** `A eligible → Turn Boundary → B eligible → Turn Boundary → A next eligible`.  
**Expected Trace / State:** independent Side pointers; not “Side A finishes all actors”.  
**Forbidden Outcomes:** all A actors act before B; one global pointer.  
**Layers Under Test:** SSI Kernel, Contract.

---

## B-002 — Empty Slot Skip

**ID:** `B-002`  
**Status:** `MUST_PASS`  
**Purpose:** empty slot does not consume cross-side alternation.  
**Initial State:** current Side pointer points to empty slot followed by eligible actor.  
**Input:** scheduler searches next actor.  
**Expected Resolution:** empty slot skipped inside current Side; eligible actor acts; only then Turn Boundary/swap.  
**Forbidden Outcomes:** empty slot causes Side swap.  
**Layers Under Test:** SSI Scheduler.

---

## B-003 — CC Consumes Natural Action Opportunity

**ID:** `B-003`  
**Status:** `MUST_PASS`  
**Purpose:** separate opportunity consumption from Action execution.  
**Initial State:** A's natural slot arrives; A is hard-CC'd.  
**Input:** SSI resolves A opportunity.  
**Expected Resolution:** opportunity consumed; A executes no Basic/Skill/Ultimate; personal Natural Action clocks advance; SSI pointer advances; Turn Boundary occurs.  
**Forbidden Outcomes:** A is simply skipped as if dead/empty; duration does not decrement; next Side never gains control.  
**Layers Under Test:** Terminology, Clock, SSI.

---

## B-004 — Move Into Passed Slot

**ID:** `B-004`  
**Status:** `MUST_PASS`  
**Purpose:** prevent position mutation from creating extra Natural Action.  
**Initial State:** A2 already acted; A3 is moved into A2's passed slot.  
**Input:** same Side pass continues later.  
**Expected Resolution:** moved unit does not gain a second Natural Action from new slot.  
**Forbidden Outcomes:** position exploit creates extra turn.  
**Layers Under Test:** Position + SSI.

---

## B-005 — Summon Into Unpassed Slot

**ID:** `B-005`  
**Status:** `MUST_PASS`  
**Purpose:** validate summon/pointer relationship.  
**Initial State:** Side pointer has not reached slot 7.  
**Input:** Natural Action creates eligible Summon in slot 7.  
**Expected Resolution:** Summon may act when Side pointer later reaches slot 7 in current pass.  
**Forbidden Outcomes:** Summon always waits next round regardless of slot.  
**Layers Under Test:** Entity lifecycle, SSI.

---

## B-006 — Summon Into Passed Slot

**ID:** `B-006`  
**Status:** `MUST_PASS`  
**Purpose:** complementary pointer rule.  
**Initial State:** slot 3 already passed.  
**Input:** eligible Summon appears in slot 3.  
**Expected Resolution:** waits next Side pass.  
**Forbidden Outcomes:** immediate extra Natural Action.  
**Layers Under Test:** SSI.

---

## B-007 — Personal Cap Does Not Reset Every Turn Boundary

**ID:** `B-007`  
**Status:** `MUST_PASS`  
**Purpose:** validate Turn Boundary correction.  
**Initial State:** A passive capped once per own Natural Action window. A triggers it; then B acts.  
**Input:** global Turn Boundary after B's Natural Action.  
**Expected Resolution:** A's personal cap remains consumed until A's next Natural Action opportunity.  
**Forbidden Outcomes:** every global Turn Boundary resets A.  
**Layers Under Test:** Terminology, Clock Contract.

---

## B-008 — Two Natural Actions of Target

**ID:** `B-008`  
**Status:** `MUST_PASS`  
**Purpose:** duration uses actor-specific opportunities.  
**Initial State:** Debuff duration = 2 Natural Actions of target.  
**Input:** target loses first opportunity to CC; later gets second.  
**Expected Resolution:** CC-lost opportunity counts as first; duration expires after second qualifying opportunity.  
**Forbidden Outcomes:** only successful attacks decrement.  
**Layers Under Test:** Duration Contract.

---

# 7. TEST GROUP C — TARGET / AREA / SNAPSHOT

---

## C-001 — Forgotten vs Direct Target

**ID:** `C-001`  
**Status:** `MUST_PASS`  
**Purpose:** canonical Target Exclusion test.  
**Initial State:** Ký Ức actor has Forgotten/Target Exclusion.  
**Input:** enemy random/direct single-target skill builds Candidate Pool.  
**Expected Resolution:** Forgotten actor excluded from eligible direct targets.  
**Forbidden Outcomes:** treated as Damage Immunity; actor removed from Position.  
**Layers Under Test:** Tag, Target Resolver, State Runtime.

---

## C-002 — Forgotten vs Fixed Full-board AoE

**ID:** `C-002`  
**Status:** `MUST_PASS`  
**Purpose:** prove Target Selection ≠ Area Resolution.  
**Initial State:** same as C-001; actor still occupies slot.  
**Input:** fixed full-board AoE.  
**Expected Resolution:** geometry includes actor's occupied Position; actor is hit normally.  
**Forbidden Outcomes:** Target Exclusion makes fixed AoE miss.  
**Layers Under Test:** Target/Area Contract.

---

## C-003 — Cannot Select Forgotten as AoE Center

**ID:** `C-003`  
**Status:** `MUST_PASS`  
**Purpose:** distinguish direct center selection from area occupants.  
**Initial State:** Forgotten actor present among enemies.  
**Input:** skill must directly select one enemy as center, then damages radius around center.  
**Expected Resolution:** Forgotten actor cannot be selected as center if exclusion covers that selection; it may still be hit when another center's area covers it.  
**Forbidden Outcomes:** “untargetable” either blocks all AoE or does nothing to center selection.  
**Layers Under Test:** TargetSpec, AreaSpec.

---

## C-004 — Shared-snapshot Simultaneous AoE

**ID:** `C-004`  
**Status:** `MUST_PASS`  
**Purpose:** prevent target-order contamination.  
**Initial State:** A AoE hits B and C; B's death would buff A if death processed early.  
**Input:** simultaneous AoE.  
**Expected Resolution:** B and C damage calculations use same source/start snapshot; B's death does not buff damage to C inside same batch.  
**Forbidden Outcomes:** iterate target list and let B death buff C damage.  
**Layers Under Test:** Snapshot, Transaction, Damage.

---

## C-005 — Sequential Multihit Re-reads State

**ID:** `C-005`  
**Status:** `MUST_PASS`  
**Purpose:** opposite of C-004.  
**Initial State:** hit 1 applies defense debuff before hit 2.  
**Input:** explicitly sequential multihit.  
**Expected Resolution:** hit 1 commits; hit 2 may observe changed defense if effect graph/Contract orders it so.  
**Forbidden Outcomes:** force shared snapshot because both hits belong to one Action.  
**Layers Under Test:** Resolution Contract.

---

## C-006 — Delayed Target Dies Before Resolution

**ID:** `C-006`  
**Status:** `MUST_PASS`  
**Purpose:** target invalidation policy.  
**Initial State:** target selected and child effect delayed; policy = DROP_INVALID.  
**Input:** target reaches DEATH_CONFIRMED before child resolves.  
**Expected Resolution:** child effect drops target; no reroll.  
**Forbidden Outcomes:** silently choose new enemy.  
**Layers Under Test:** Target Lock/Validation.

---

## C-007 — Random Multi-target No Duplicates

**ID:** `C-007`  
**Status:** `MUST_PASS`  
**Purpose:** test selection policy is schema, not Tag.  
**Initial State:** five valid enemies.  
**Input:** random choose 3, `NO_DUPLICATES`.  
**Expected Resolution:** deterministic seeded draw returns 3 distinct targets.  
**Forbidden Outcomes:** Tag `AOE_RANDOM`; duplicate target without declared replacement.  
**Layers Under Test:** Schema, RNG.

---

## C-008 — Missing Random Duplicate Policy

**ID:** `C-008`  
**Status:** `MUST_REJECT`  
**Purpose:** Normalizer must not guess.  
**Initial State:** mechanic outcome differs depending on repeat targeting.  
**Input:** random 3 targets but duplicate policy omitted.  
**Expected Resolution:** validation blocker.  
**Forbidden Outcomes:** silently assume no duplicates.  
**Layers Under Test:** Schema validation.

---

# 8. TEST GROUP D — DAMAGE / SHIELD / HEAL / HP

---

## D-001 — True Damage Bypasses ARM/RES and Final DR

**ID:** `D-001`  
**Status:** `MUST_PASS`  
**Purpose:** newly locked damage pipeline.  
**Initial State:** target has ARM/RES and Final Damage Reduction.  
**Input:** 100 True Damage.  
**Expected Resolution:** ARM/RES/final DR do not reduce component.  
**Forbidden Outcomes:** Final DR reduces True Damage.  
**Layers Under Test:** Damage Contract.

---

## D-002 — True Damage Does Not Pierce Standard Shield

**ID:** `D-002`  
**Status:** `MUST_PASS`  
**Purpose:** preserve True Damage ≠ Shield Piercing.  
**Initial State:** target has 60 Standard Shield.  
**Input:** 100 True Damage without Shield Piercing.  
**Expected Resolution:** Shield absorbs 60; Actual HP Damage = 40.  
**Forbidden Outcomes:** 100 goes directly to HP.  
**Layers Under Test:** Tag boundary, Shield Contract.

---

## D-003 — Physical + True + Final DR + Shield

**ID:** `D-003`  
**Status:** `MUST_PASS`  
**Purpose:** integrated damage pipeline.  
**Initial State:** Physical 100 becomes 60 after ARM; Final DR 20%; True 40; Shield 50.  
**Input:** mixed packet.  
**Expected Resolution:** Physical `60→48`; True remains 40; pre-Shield total 88; Shield absorbs 50; Actual HP Damage 38.  
**Forbidden Outcomes:** Final DR applies to True; True bypasses Shield; shield absorption counted as Actual HP Damage.  
**Layers Under Test:** Damage, Shield, Result typing.

---

## D-004 — Shield Pool Proportional Depletion

**ID:** `D-004`  
**Status:** `MUST_PASS`  
**Purpose:** validate source-ledger pooled Shield.  
**Initial State:** A=600, B=300, C=600 Standard Shield contributions.  
**Input:** 300 Shield-bound damage.  
**Expected Resolution:** A=480, B=240, C=480; total=1200.  
**Forbidden Outcomes:** newest/oldest source absorbs first; source provenance deleted.  
**Layers Under Test:** Shield Runtime.

---

## D-005 — Shield Contribution Expiry After Shared Damage

**ID:** `D-005`  
**Status:** `MUST_PASS`  
**Purpose:** pooled presentation must preserve independent expiry.  
**Initial State:** post D-004 values; B expires.  
**Input:** B duration ends.  
**Expected Resolution:** remove B's remaining 240 only; pool becomes 960.  
**Forbidden Outcomes:** remove original 300; recompute A/C incorrectly; cannot determine source because shields were merged destructively.  
**Layers Under Test:** Shield ledger.

---

## D-006 — Shield Source-specific Removal

**ID:** `D-006`  
**Status:** `MUST_PASS`  
**Purpose:** prove pooling does not destroy source semantics.  
**Initial State:** three contributions from three sources.  
**Input:** effect removes Shield created by Source B.  
**Expected Resolution:** B ledger contribution removed; others remain.  
**Forbidden Outcomes:** whole pool removed because UI has one shield bar.  
**Layers Under Test:** Shield, Attribution/provenance.

---

## D-007 — Special Shield Layer Not Blindly Pooled

**ID:** `D-007`  
**Status:** `MUST_PASS`  
**Purpose:** standard pooling must not erase qualitatively distinct eligibility.  
**Initial State:** Standard Shield + special Shield that blocks only Will Damage.  
**Input:** Physical Damage.  
**Expected Resolution:** special Will-only layer is not used for Physical merely because all shields exist on same target.  
**Forbidden Outcomes:** every Shield contribution forced into one indiscriminate pool.  
**Layers Under Test:** Shield profile architecture.

---

## D-008 — Actual HP Damage Excludes Shield

**ID:** `D-008`  
**Status:** `MUST_PASS`  
**Purpose:** protect downstream formulas.  
**Initial State:** Shield=70; HP sufficient.  
**Input:** resolved 100 damage to Shield/HP.  
**Expected Resolution:** shieldAbsorbed=70; Actual HP Damage=30.  
**Forbidden Outcomes:** Actual HP Damage=100.  
**Layers Under Test:** DamageResult.

---

## D-009 — Actual HP Damage Excludes Overkill

**ID:** `D-009`  
**Status:** `MUST_PASS`  
**Purpose:** downstream lifesteal/echo correctness.  
**Initial State:** target HP=20; no Shield.  
**Input:** 100 qualifying damage.  
**Expected Resolution:** Actual HP Damage=20; Overkill=80.  
**Forbidden Outcomes:** Actual HP Damage=100.  
**Layers Under Test:** DamageResult.

---

## D-010 — HP Cost Is Not Damage

**ID:** `D-010`  
**Status:** `MUST_PASS`  
**Purpose:** hard semantic boundary.  
**Initial State:** caster HP=100; Shield=100; has reflect/lifesteal/damage-taken listener.  
**Input:** pay 30 HP Cost.  
**Expected Resolution:** HP=70; Shield unchanged; no reflect; no lifesteal; no ordinary Damage Trigger.  
**Forbidden Outcomes:** create Damage Packet; consume Shield.  
**Layers Under Test:** Cost, HP semantics.

---

## D-011 — HP Cost Default Cannot Kill

**ID:** `D-011`  
**Status:** `MUST_PASS`  
**Purpose:** default lethal floor.  
**Initial State:** caster HP=20.  
**Input:** ordinary HP Cost of 30 with default profile.  
**Expected Resolution:** validation/payment obeys ≥1 HP floor; exact cast acceptance follows cost affordability profile, but caster is never killed by default HP Cost.  
**Forbidden Outcomes:** HP_ZERO/DEATH_CONFIRMED from default HP Cost.  
**Layers Under Test:** Cost Contract.

---

## D-012 — Non-Cost HP Loss Can Be Lethal

**ID:** `D-012`  
**Status:** `MUST_PASS`  
**Purpose:** HP Loss ≠ HP Cost.  
**Initial State:** actor HP low; effect profile permits lethal HP Loss.  
**Input:** post-action 1% HP Loss.  
**Expected Resolution:** direct HP reduction; no Damage Packet; HP_ZERO can open death pipeline.  
**Forbidden Outcomes:** reject because actor “cannot afford” HP Loss.  
**Layers Under Test:** HP Loss, Death.

---

## D-013 — Death Prevention Does Not Reapply Same HP Loss

**ID:** `D-013`  
**Status:** `MUST_PASS`  
**Purpose:** prevent repeated lethal operation.  
**Initial State:** HP Loss drives actor to 0; Death Prevention saves at 1.  
**Input:** one HP Loss instance.  
**Expected Resolution:** loss resolves once; actor survives at prevention result.  
**Forbidden Outcomes:** same loss rechecks and kills actor again immediately.  
**Layers Under Test:** HP Loss, Death Prevention.

---

## D-014 — Heal and Overheal Split

**ID:** `D-014`  
**Status:** `MUST_PASS`  
**Purpose:** expose Overheal as typed result.  
**Initial State:** HP=80/100.  
**Input:** Heal 50.  
**Expected Resolution:** actual restore=20; Overheal=30.  
**Forbidden Outcomes:** HP=130; Overheal represented as Shield automatically.  
**Layers Under Test:** Heal Contract.

---

## D-015 — Independent Overheal Conversions

**ID:** `D-015`  
**Status:** `MUST_PASS`  
**Purpose:** SSR Warrior-style per-Heal conversion.  
**Initial State:** two separate Heals each produce Overheal.  
**Input:** conversion triggers independently per Heal, cap allows both.  
**Expected Resolution:** two separate conversion results; not one re-aggregated fake Heal.  
**Forbidden Outcomes:** combine Overheal and trigger once unless kit says so.  
**Layers Under Test:** Result binding, Trigger cap.

---

## D-016 — Max HP Mutation Is Not Heal

**ID:** `D-016`  
**Status:** `MUST_PASS`  
**Purpose:** capacity mutation must not create fake healing event.  
**Initial State:** HP=80/100.  
**Input:** Max HP increases to 120 with reconciliation preserving absolute HP.  
**Expected Resolution:** HP remains 80; no Heal event.  
**Forbidden Outcomes:** HP becomes 96 by hidden preserve-ratio policy; Heal trigger fires.  
**Layers Under Test:** Max HP Contract.

---

## D-017 — Damage Threshold During Max HP Mutation

**ID:** `D-017`  
**Status:** `PROBE_UNRESOLVED`  
**Purpose:** attack an intentionally unresolved Max-HP reference.  
**Initial State:** Action changes target Max HP mid-resolution; later condition checks “damage ≥30% Max HP”.  
**Input:** threshold reference omitted.  
**Expected Resolution:** Normalizer/Contract resolver flags missing reference policy.  
**Forbidden Outcomes:** silently choose action-start or current Max HP.  
**Layers Under Test:** Schema, Contract validation.

---

# 9. TEST GROUP E — DEATH / REVIVE / LUÂN HỒI

---

## E-001 — HP_ZERO Is Not Confirmed Death

**ID:** `E-001`  
**Status:** `MUST_PASS`  
**Purpose:** life pipeline baseline.  
**Initial State:** target takes lethal damage but has Death Prevention.  
**Input:** HP reaches 0.  
**Expected Resolution:** `HP_ZERO → DEATH_EVALUATING`; no kill/on-death/Luân Hồi yet.  
**Forbidden Outcomes:** kill credit at HP_ZERO.  
**Layers Under Test:** Terminology, Death Runtime.

---

## E-002 — Successful Death Prevention

**ID:** `E-002`  
**Status:** `MUST_PASS`  
**Purpose:** verify pre-death save.  
**Initial State:** valid prevention effect.  
**Input:** lethal result.  
**Expected Resolution:** DEATH_PREVENTED; target remains alive; no DEATH_CONFIRMED event.  
**Forbidden Outcomes:** Revive pipeline used; Luân Hồi waiting entry created.  
**Layers Under Test:** Death Contract.

---

## E-003 — Ordinary Revive Is Post-Death

**ID:** `E-003`  
**Status:** `MUST_PASS`  
**Purpose:** Revive boundary.  
**Initial State:** target DEATH_CONFIRMED; eligible Revive.  
**Input:** Revive.  
**Expected Resolution:** create/use revive entitlement; materialize same life; ordinary global default preserves lifeSerial.  
**Forbidden Outcomes:** classify as Heal; increment lifeSerial by default.  
**Layers Under Test:** Revive, Identity.

---

## E-004 — Rebirth Increments lifeSerial

**ID:** `E-004`  
**Status:** `MUST_PASS`  
**Purpose:** distinguish Revive vs new life.  
**Initial State:** trueSelf X, lifeSerial 7 enters Reincarnation and new life.  
**Input:** Rebirth materialization.  
**Expected Resolution:** trueSelf remains X; lifeSerial becomes 8.  
**Forbidden Outcomes:** preserve lifeSerial as ordinary Revive.  
**Layers Under Test:** Identity, Reincarnation.

---

## E-005 — Ký Ức Special Revive Overrides lifeSerial Default

**ID:** `E-005`  
**Status:** `MUST_PASS`  
**Purpose:** prove Character profile can intentionally override global Revive default.  
**Initial State:** Ký Ức trueSelf X dies.  
**Input:** its special Revive.  
**Expected Resolution:** trueSelf X preserved; lifeSerial increments according to character contract.  
**Forbidden Outcomes:** global preserve rule overrides explicit character contract.  
**Layers Under Test:** Contract precedence.

---

## E-006 — Death Cohort Members Do Not Count One Another

**ID:** `E-006`  
**Status:** `MUST_PASS`  
**Purpose:** simultaneous-death ontology.  
**Initial State:** no prior waiting entries.  
**Input:** simultaneous batch kills B,C,D,E.  
**Expected Resolution:** one Death Cohort `{B,C,D,E}`; each new waiting record starts at 0.  
**Forbidden Outcomes:** B=3, C=2, D=1 based on slot/event ordering.  
**Layers Under Test:** Transaction, Reincarnation Ledger.

---

## E-007 — Older Waiting Entry Advances by Cohort Size

**ID:** `E-007`  
**Status:** `MUST_PASS`  
**Purpose:** preserve “four later deaths”, not “four cohorts”.  
**Initial State:** A waiting=0/4.  
**Input:** later simultaneous cohort `{B,C,D,E}`.  
**Expected Resolution:** A `0→4` and immediately enters Reincarnation; B–E start 0.  
**Forbidden Outcomes:** A advances only +1 because there was one cohort.  
**Layers Under Test:** Luân Hồi Contract.

---

## E-008 — Sequential Deaths Form Separate Cohorts

**ID:** `E-008`  
**Status:** `MUST_PASS`  
**Purpose:** distinguish simultaneous vs sequential inside one Action.  
**Initial State:** sequential multihit kills B then C.  
**Input:** hit1 commit/death; hit2 later commit/death.  
**Expected Resolution:** B waiting begins before C death; C's death advances B by +1.  
**Forbidden Outcomes:** group all deaths from same Natural Action into one cohort.  
**Layers Under Test:** Resolution, Death Cohort.

---

## E-009 — Revive Commits Before Later Death

**ID:** `E-009`  
**Status:** `MUST_PASS`  
**Purpose:** one side of Revive/Reincarnation race.  
**Initial State:** A waiting=3/4.  
**Input:** Revive(A) fully commits; afterward B dies.  
**Expected Resolution:** A's old waiting record closes; B death does not advance it.  
**Forbidden Outcomes:** A enters Reincarnation after already being revived.  
**Layers Under Test:** Lifecycle ordering.

---

## E-010 — Later Death Reaches Threshold Before Queued Revive

**ID:** `E-010`  
**Status:** `MUST_PASS`  
**Purpose:** other side of race.  
**Initial State:** A waiting=3/4; queued ordinary Revive not yet resolved.  
**Input:** B DEATH_CONFIRMED commits first.  
**Expected Resolution:** World Axiom ledger `A 3→4`; A enters Reincarnation; queued ordinary Revive later fails.  
**Forbidden Outcomes:** ordinary Reaction queue runs before Luân Hồi bookkeeping.  
**Layers Under Test:** World-system ordering.

---

## E-011 — Summon Death Does Not Advance Luân Hồi by Default

**ID:** `E-011`  
**Status:** `MUST_PASS`  
**Purpose:** True Self qualification.  
**Initial State:** A waiting; enemy Summon without trueSelfId dies.  
**Input:** Summon termination/death-like event.  
**Expected Resolution:** A's laterDeathCount unchanged unless Summon exceptionally has qualifying True Self profile.  
**Forbidden Outcomes:** every HP bar death increments Luân Hồi.  
**Layers Under Test:** Entity kind, Reincarnation Contract.

---

## E-012 — Despawn Is Not Death

**ID:** `E-012`  
**Status:** `MUST_PASS`  
**Purpose:** non-death termination.  
**Initial State:** timed Summon expires.  
**Input:** DESPAWN.  
**Expected Resolution:** no DEATH_CONFIRMED; no kill; no Luân Hồi.  
**Forbidden Outcomes:** count as death because entity disappears.  
**Layers Under Test:** Lifecycle terminology.

---

# 10. TEST GROUP F — AUTHORITY ADJUDICATION

---

## F-001 — Higher Tier Wins Without Progression Comparison

**ID:** `F-001`  
**Status:** `MUST_PASS`  
**Purpose:** basic Authority hierarchy.  
**Initial State:** A Quy Tắc no-Heal; B Pháp Tắc self-Heal.  
**Input:** B attempts self-Heal.  
**Expected Resolution:** A's conflicting rule wins by tier; do not compare Rank/Tu vi/Stars/Awaken/CP.  
**Forbidden Outcomes:** B wins because higher CP.  
**Layers Under Test:** Authority Contract.

---

## F-002 — Same Tier Rank Decides

**ID:** `F-002`  
**Status:** `MUST_PASS`  
**Purpose:** legacy comparator first criterion.  
**Initial State:** both Quy Tắc; A Prime, B UR; lower progression otherwise irrelevant.  
**Input:** direct semantic conflict.  
**Expected Resolution:** A wins at Rank comparison; stop.  
**Forbidden Outcomes:** continue to CP and reverse result.  
**Layers Under Test:** Adjudication Engine.

---

## F-003 — Same Rank Tu Vi Decides

**ID:** `F-003`  
**Status:** `MUST_PASS`  
**Purpose:** comparator order.  
**Initial State:** both UR Quy Tắc; A cultivation 70, B 72; A CP higher.  
**Input:** direct conflict.  
**Expected Resolution:** B wins at Tu vi; CP never considered.  
**Forbidden Outcomes:** A wins on CP.  
**Layers Under Test:** Authority cache/comparator.

---

## F-004 — Stars Before Awaken/CP

**ID:** `F-004`  
**Status:** `MUST_PASS`  
**Purpose:** progression priority.  
**Initial State:** same Rank/Tu vi; A 5★ Awaken0 CP low, B 4★ CP high.  
**Input:** same-tier conflict.  
**Expected Resolution:** A wins at Stars.  
**Forbidden Outcomes:** B wins because CP.  
**Layers Under Test:** Adjudication comparator.

---

## F-005 — Awaken Before CP

**ID:** `F-005`  
**Status:** `MUST_PASS`  
**Purpose:** progression priority.  
**Initial State:** same Rank/Tu vi/5★; A Awaken1 CP lower, B Awaken0 CP higher.  
**Input:** conflict.  
**Expected Resolution:** A wins at Awaken.  
**Forbidden Outcomes:** CP reverses result.  
**Layers Under Test:** Authority.

---

## F-006 — CP Final Tie-break

**ID:** `F-006`  
**Status:** `MUST_PASS`  
**Purpose:** build differentiation only after progression tie.  
**Initial State:** all Rank/Tu vi/Stars/Awaken equal; A CP 500001, B CP 500000.  
**Input:** same-tier conflict.  
**Expected Resolution:** A wins.  
**Forbidden Outcomes:** random or slot-order tie-break.  
**Layers Under Test:** Adjudication.

---

## F-007 — Exact Total Tie = NO_OVERRIDE

**ID:** `F-007`  
**Status:** `MUST_PASS`  
**Purpose:** deterministic semantic tie without arbitrary winner.  
**Initial State:** every comparison field equal. A incoming “kill”; B existing “cannot die”; both same Quy Tắc.  
**Input:** A lethal rule attempts override.  
**Expected Resolution:** `NO_OVERRIDE`; existing protection remains; incoming conflict fails.  
**Forbidden Outcomes:** actor/slot/RNG/cast-order decides.  
**Layers Under Test:** Authority Contract.

---

## F-008 — Conflict Scope Only

**ID:** `F-008`  
**Status:** `MUST_PASS`  
**Purpose:** winning one conflict must not disable whole enemy Skill.  
**Initial State:** A Skill has `no Heal battlefield-wide` + `-20% enemy ATK`; B has self-Heal rule and wins no-Heal conflict.  
**Input:** B self-Heals.  
**Expected Resolution:** B Heal succeeds; A's ATK reduction remains; A's no-Heal still affects other actors.  
**Forbidden Outcomes:** entire A Skill disabled.  
**Layers Under Test:** RuleInstance, Conflict Scope.

---

## F-009 — Persistent Suppression Edge

**ID:** `F-009`  
**Status:** `MUST_PASS`  
**Purpose:** reuse same persistent adjudication result.  
**Initial State:** persistent A no-Heal vs persistent B self-Heal; B wins.  
**Input:** B heals repeatedly while both rules remain valid.  
**Expected Resolution:** cache/suppression edge reused; no full comparator every heal.  
**Forbidden Outcomes:** B win globally disables A; recompute every frame without revision change.  
**Layers Under Test:** Authority cache.

---

## F-010 — Instant Loser Does Not Reappear Later

**ID:** `F-010`  
**Status:** `MUST_PASS`  
**Purpose:** instant vs persistent loser distinction.  
**Initial State:** A one-shot same-tier kill effect loses to B immortality.  
**Input:** B's immortality later expires.  
**Expected Resolution:** old failed kill does not retroactively execute.  
**Forbidden Outcomes:** “frozen hit” wakes up later and kills B.  
**Layers Under Test:** Authority suppression model.

---

## F-011 — Independent Skill Pair Results

**ID:** `F-011`  
**Status:** `MUST_PASS`  
**Purpose:** pairwise independence.  
**Initial State:** A Skill1 Quy Tắc conflicts with B Skill2 Quy Tắc; A wins. A Skill3 Pháp Tắc conflicts with B Skill1 Pháp Tắc; B wins.  
**Input:** both interactions occur.  
**Expected Resolution:** both pair-specific results coexist.  
**Forbidden Outcomes:** “A beats B” global character result.  
**Layers Under Test:** Conflict graph/cache.

---

## F-012 — No Adjudication Without Direct Conflict

**ID:** `F-012`  
**Status:** `MUST_PASS`  
**Purpose:** avoid waste and overreach.  
**Initial State:** A and B both have Quy Tắc effects but they affect unrelated semantics.  
**Input:** both active.  
**Expected Resolution:** no comparison.  
**Forbidden Outcomes:** precompute one “stronger rules character”.  
**Layers Under Test:** Conflict detector.

---

## F-013 — Same Character Contradiction

**ID:** `F-013`  
**Status:** `MUST_REJECT`  
**Purpose:** do not compare Character against itself.  
**Initial State:** same Character has two same-tier internal rules with contradictory outcome and no explicit ordering/exception.  
**Input:** normalized kit.  
**Expected Resolution:** validation requires internal priority/exception or better semantic spec.  
**Forbidden Outcomes:** run Rank/Tu vi comparison using same owner; rely on effect list order accidentally.  
**Layers Under Test:** Schema/Contract validation.

---

## F-014 — Adjudication Owner ≠ Damage Attribution

**ID:** `F-014`  
**Status:** `MUST_PASS`  
**Purpose:** inherited behavior/Pygmalion distinction.  
**Initial State:** Puppet Action has Damage Attribution=Pygmalion but authority-bearing inherited rule declares another valid Adjudication Owner profile.  
**Input:** same-tier conflict.  
**Expected Resolution:** comparator uses Adjudication Owner, not Damage Attribution.  
**Forbidden Outcomes:** use whoever gets damage credit automatically.  
**Layers Under Test:** Attribution, Authority.

---

## F-015 — Cache Invalidates on Tu Vi Change

**ID:** `F-015`  
**Status:** `MUST_PASS`  
**Purpose:** revision-driven cache.  
**Initial State:** A vs B result cached.  
**Input:** legitimate mechanic changes B's adjudication Tu vi/profile.  
**Expected Resolution:** revision changes; relevant cache invalidates; next conflict recomputes.  
**Forbidden Outcomes:** stale result persists forever.  
**Layers Under Test:** Authority cache.

---

## F-016 — ATK Buff Does Not Invalidate Authority Cache

**ID:** `F-016`  
**Status:** `MUST_PASS`  
**Purpose:** ordinary combat stats should not make comparator unstable.  
**Initial State:** cached conflict result; B receives +50% ATK Buff.  
**Input:** same conflict later.  
**Expected Resolution:** cache remains valid because adjudication profile did not change.  
**Forbidden Outcomes:** derive CP dynamically from buffed combat stats and flip result.  
**Layers Under Test:** CP snapshot.

---

# 11. TEST GROUP G — PYGMALION

---

## G-001 — One New Puppet Per Life Cycle, Not One Total

**ID:** `G-001`  
**Status:** `MUST_PASS`  
**Purpose:** core corrected Pygmalion invariant.  
**Initial State:** Life Cycle 1 created P1; P1 survives. Pygmalion enters Life Cycle 2.  
**Input:** Life Cycle 2 creation trigger.  
**Expected Resolution:** new quota scope permits creation of P2; P1 remains.  
**Forbidden Outcomes:** `if any Puppet exists → block`.  
**Layers Under Test:** Lifecycle quota, Entity store.

---

## G-002 — Same Life Cycle Cannot Create Second New Puppet

**ID:** `G-002`  
**Status:** `MUST_PASS`  
**Purpose:** quota atomicity.  
**Initial State:** current Pygmalion Life Cycle already consumed creation quota.  
**Input:** same creation condition somehow attempts again.  
**Expected Resolution:** quota rejects second new Puppet.  
**Forbidden Outcomes:** two new Puppets from same Life Cycle.  
**Layers Under Test:** Lifecycle quota.

---

## G-003 — Multiple Puppets Hold Different True Selves

**ID:** `G-003`  
**Status:** `MUST_PASS`  
**Purpose:** prove independent host state.  
**Initial State:** P1 and P2 empty; X and Y eligible.  
**Input:** route X→P1 and Y→P2.  
**Expected Resolution:** both coexist; each Puppet has its own hosted trueSelfId.  
**Forbidden Outcomes:** global single inhabited Puppet field.  
**Layers Under Test:** Reincarnation Routing, Entity store.

---

## G-004 — One True Self Cannot Double-bind Same Puppet

**ID:** `G-004`  
**Status:** `MUST_PASS`  
**Purpose:** host reservation.  
**Initial State:** P1 empty; X/Y route simultaneously.  
**Input:** both select P1 before commit.  
**Expected Resolution:** atomic reservation allows at most one; other route must use declared alternative/fail policy.  
**Forbidden Outcomes:** P1 stores two True Selves.  
**Layers Under Test:** Reservation, Materialization.

---

## G-005 — Puppet Inherits Class, Not Element

**ID:** `G-005`  
**Status:** `MUST_PASS`  
**Purpose:** validate inheritance dimensions.  
**Initial State:** Puppet host Effective Element = Water; inherited Combat Definition Y = Assassin/Fire.  
**Input:** X inhabits Puppet with Y definition.  
**Expected Resolution:** Effective Class=Assassin; Effective Element remains Water/host profile.  
**Forbidden Outcomes:** Fire overwrites Element merely because Combat Definition came from Fire character.  
**Layers Under Test:** Combat Definition inheritance.

---

## G-006 — Puppet Presentation Remains Puppet

**ID:** `G-006`  
**Status:** `MUST_PASS`  
**Purpose:** Presentation ≠ Combat Definition.  
**Initial State:** Puppet gets Combat Definition Y.  
**Input:** materialization.  
**Expected Resolution:** Puppet visual/presentation remains Puppet unless explicit presentation policy says otherwise.  
**Forbidden Outcomes:** automatically transform appearance into Y.  
**Layers Under Test:** Identity/Presentation.

---

## G-007 — Puppet Stat Basis Remains Host Snapshot

**ID:** `G-007`  
**Status:** `MUST_PASS`  
**Purpose:** prevent blind Character clone.  
**Initial State:** Puppet stats created from Pygmalion snapshot; inherited definition Y has different native stats.  
**Input:** inheritance.  
**Expected Resolution:** host stat basis remains Puppet; inherited kit can later modify stats through its own effects.  
**Forbidden Outcomes:** replace host stats with Y's full roster stats.  
**Layers Under Test:** Inheritance profile.

---

## G-008 — Puppet Is Not SUMMON-only Target

**ID:** `G-008`  
**Status:** `MUST_PASS`  
**Purpose:** entity-kind boundary.  
**Initial State:** enemy effect targets only `entityKind=SUMMON`. Puppet present.  
**Input:** target resolver.  
**Expected Resolution:** Puppet not selected unless effect explicitly includes PUPPET.  
**Forbidden Outcomes:** treat all created auxiliary units as Summons.  
**Layers Under Test:** Entity Kind, Targeting.

---

## G-009 — Pygmalion Ultimate Attribution Split

**ID:** `G-009`  
**Status:** `MUST_PASS`  
**Purpose:** Behavior Source ≠ Damage Attribution.  
**Initial State:** inhabited P1 has inherited Basic with special behavior.  
**Input:** Pygmalion Ultimate schedules P1 follow-up.  
**Expected Resolution:** actor=P1; behavior source=inherited definition; Damage Attribution=Pygmalion.  
**Forbidden Outcomes:** inherited definition owner receives damage credit automatically.  
**Layers Under Test:** Action, Attribution.

---

## G-010 — Puppet Dies Before Scheduled Follow-up

**ID:** `G-010`  
**Status:** `MUST_PASS`  
**Purpose:** invalid child actor.  
**Initial State:** P1 follow-up scheduled; P1 dies before its queue turn.  
**Input:** scheduler reaches P1 child Action.  
**Expected Resolution:** Action dropped; no replacement.  
**Forbidden Outcomes:** another Puppet attacks in its place; dead Puppet attacks.  
**Layers Under Test:** Action validation.

---

## G-011 — Inhabited Puppet Ordinary Revive Before Threshold

**ID:** `G-011`  
**Status:** `MUST_PASS`  
**Purpose:** newly locked Puppet revive semantics.  
**Initial State:** P1 hosts X with inherited Y; P1/X DEATH_CONFIRMED; X waiting below threshold.  
**Input:** eligible ordinary Revive.  
**Expected Resolution:** same Puppet-life rematerializes; X same trueSelfId; same lifeSerial; inherited Y restored.  
**Forbidden Outcomes:** route X into random new Puppet; increment lifeSerial by default.  
**Layers Under Test:** Revive, Identity, Pygmalion.

---

## G-012 — Inhabited Puppet Cannot Ordinary-Revive After Reincarnation

**ID:** `G-012`  
**Status:** `MUST_PASS`  
**Purpose:** Revive window closure.  
**Initial State:** X from dead P1 already entered Reincarnation.  
**Input:** ordinary Revive targeting old Puppet-life.  
**Expected Resolution:** invalid.  
**Forbidden Outcomes:** restore old body while same True Self is in/newly entering another life.  
**Layers Under Test:** Lifecycle.

---

# 12. TEST GROUP H — ARENA / COMBAT INSTANCE

---

## H-001 — Arena Transfer Is Not Death

**ID:** `H-001`  
**Status:** `MUST_PASS`  
**Purpose:** Combat Instance transfer semantics.  
**Initial State:** A/B in Main Battle.  
**Input:** Arena ability transfers both to child instance.  
**Expected Resolution:** identities preserved; no DEATH_CONFIRMED; no Reincarnation waiting.  
**Forbidden Outcomes:** treat disappearance from Main Battle as death/removal kill.  
**Layers Under Test:** Combat Instance.

---

## H-002 — Arena Death Still Feeds Luân Hồi

**ID:** `H-002`  
**Status:** `MUST_PASS`  
**Purpose:** World Axiom observation across child instance.  
**Initial State:** A waiting in world ledger; B with True Self dies truly in Arena.  
**Input:** B DEATH_CONFIRMED.  
**Expected Resolution:** qualifying Arena death advances relevant Luân Hồi waiting.  
**Forbidden Outcomes:** Arena has isolated fake death ontology.  
**Layers Under Test:** Arena, World lifecycle.

---

## H-003 — Arena-owned Object Does Not Auto-transfer

**ID:** `H-003`  
**Status:** `MUST_PASS`  
**Purpose:** instance ownership.  
**Initial State:** Cocoon/object created inside Arena.  
**Input:** Arena closes; no transfer Contract.  
**Expected Resolution:** object remains Arena-owned and is cleaned/handled by Arena close policy; it does not appear in Main Battle automatically.  
**Forbidden Outcomes:** teleport object to parent because creator returns.  
**Layers Under Test:** Combat Instance ownership.

---

## H-004 — Full Parent Battlefield Return

**ID:** `H-004`  
**Status:** `PROBE_UNRESOLVED`  
**Purpose:** expose missing return fallback.  
**Initial State:** Arena survivor must return; all valid parent slots occupied.  
**Input:** Arena closes.  
**Expected Resolution:** Contract resolver reports unresolved/required materialization fallback.  
**Forbidden Outcomes:** silently choose nearest slot or replace an occupant.  
**Layers Under Test:** Arena Return Contract.

---

# 13. TEST GROUP I — NARRATIVE / CAPABILITY

---

## I-001 — Capability Query Uses Tag + Schema Facet

**ID:** `I-001`  
**Status:** `MUST_PASS`  
**Purpose:** prove Story need not force every query into Tag Registry.  
**Initial State:** Story seeks “Ultimate that causes True Damage”.  
**Input:** query roster.  
**Expected Resolution:** condition = `abilityType=ULTIMATE AND functionalTag=TRUE_DAMAGE`.  
**Forbidden Outcomes:** require Tag `ULTIMATE_TRUE_DAMAGE`.  
**Layers Under Test:** Capability Index.

---

## I-002 — Native + Story-sourced True Damage

**ID:** `I-002`  
**Status:** `MUST_PASS`  
**Purpose:** source-specific capability contributions.  
**Initial State:** Bearer has native TRUE_DAMAGE; Realized Sword also grants TRUE_DAMAGE.  
**Input:** Sword Realizes.  
**Expected Resolution:** Capability Index tracks at least two sources.  
**Forbidden Outcomes:** one flat boolean with no provenance.  
**Layers Under Test:** Capability Index, Narrative.

---

## I-003 — Remove Sword Keeps Native Capability

**ID:** `I-003`  
**Status:** `MUST_PASS`  
**Purpose:** contribution removal.  
**Initial State:** from I-002.  
**Input:** Sword property transferred/absorbed away.  
**Expected Resolution:** remove Sword contribution only; native TRUE_DAMAGE remains.  
**Forbidden Outcomes:** remove all TRUE_DAMAGE from Bearer.  
**Layers Under Test:** Narrative Property, Capability Index.

---

## I-004 — Belief and Stability Are Independent

**ID:** `I-004`  
**Status:** `MUST_PASS`  
**Purpose:** Narrative state-axis distinction.  
**Initial State:** Story active; Container takes damage.  
**Input:** damage reduces Stability by Story profile but no Belief rule is defined.  
**Expected Resolution:** Stability changes; Belief unchanged.  
**Forbidden Outcomes:** damage automatically subtracts Belief.  
**Layers Under Test:** Narrative Runtime.

---

## I-005 — Witness Eligibility Excludes Another Combat Instance

**ID:** `I-005`  
**Status:** `MUST_PASS`  
**Purpose:** witness presence.  
**Initial State:** Story in Main Battle; actor is alive but currently in Arena.  
**Input:** WitnessSet refresh.  
**Expected Resolution:** actor not a same-instance Witness for current Story under default design.  
**Forbidden Outcomes:** count every alive True Self globally.  
**Layers Under Test:** Narrative, Combat Instance.

---

## I-006 — Narrative Personal Cadence

**ID:** `I-006`  
**Status:** `PROBE_UNRESOLVED`  
**Purpose:** ensure legacy Turn Boundary ambiguity is not guessed.  
**Initial State:** Story says old wording equivalent to “Turn Boundary of Cố Sự Chi Thần”.  
**Input:** Normalizer tries to bind Belief clock.  
**Expected Resolution:** requires explicit cadence selection, e.g. owner's Natural Action window vs global Turn Boundary.  
**Forbidden Outcomes:** silently use global Turn Boundary.  
**Layers Under Test:** Clock, Narrative Contract.

---

## I-007 — Knowledge Propagation Delay

**ID:** `I-007`  
**Status:** `PROBE_UNRESOLVED`  
**Purpose:** preserve open design.  
**Initial State:** Witness A discovers counter-proof; Witness B does not know yet.  
**Input:** Story requires propagation.  
**Expected Resolution:** runtime can represent `Discovery → Delay → Propagation`, but final delay clock/value must be supplied; missing value blocks final implementation.  
**Forbidden Outcomes:** instant global knowledge.  
**Layers Under Test:** Narrative Contract.

---

# 14. TEST GROUP J — MODE ISOLATION

---

## J-001 — Turn-based Natural Action Clock Invalid in Exploration

**ID:** `J-001`  
**Status:** `MUST_REJECT`  
**Purpose:** no mode semantic leakage.  
**Initial State:** Exploration profile has no SSI.  
**Input:** Ability variant declares duration `2 NATURAL_ACTION_OF_TARGET`.  
**Expected Resolution:** mode validation rejects unless Exploration explicitly defines a translation/profile.  
**Forbidden Outcomes:** convert to 2 seconds automatically.  
**Layers Under Test:** Mode Profile, Schema validation.

---

## J-002 — Reincarnation Disabled in Exploration

**ID:** `J-002`  
**Status:** `MUST_REJECT`  
**Purpose:** lifecycle feature flag.  
**Initial State:** Exploration/Defense profile.  
**Input:** ordinary mode Ability attempts turn-based `REINCARNATION` lifecycle operation without special supported system.  
**Expected Resolution:** mode-incompatible semantic rejected.  
**Forbidden Outcomes:** secretly run turn-based Luân Hồi ledger.  
**Layers Under Test:** Mode Profile.

---

## J-003 — Same TRUE_DAMAGE Tag Across Modes

**ID:** `J-003`  
**Status:** `MUST_PASS`  
**Purpose:** Tag semantics do not fork by mode.  
**Initial State:** Turn-based and Exploration variants both explicitly contain True Damage effect.  
**Input:** capability query in each mode.  
**Expected Resolution:** both use canonical `TRUE_DAMAGE`; scheduler/spatial behavior differs but Tag meaning does not.  
**Forbidden Outcomes:** `TURN_BASED_TRUE_DAMAGE` and `EXPLORATION_TRUE_DAMAGE`.  
**Layers Under Test:** Tag, Mode.

---

## J-004 — Slot Geometry Not Used in Continuous Room

**ID:** `J-004`  
**Status:** `MUST_REJECT`  
**Purpose:** spatial adapter boundary.  
**Initial State:** Exploration continuous-position mode.  
**Input:** Ability uses turn-based fixed slot IDs without an explicit adapter.  
**Expected Resolution:** validation rejects.  
**Forbidden Outcomes:** invent mapping from slot 1/3/5 to arbitrary world coordinates.  
**Layers Under Test:** Mode spatial profile.

---

## J-005 — Exploration AE Ownership

**ID:** `J-005`  
**Status:** `FUTURE_MODE_PROBE`  
**Purpose:** expose unresolved resource ownership.  
**Initial State:** Exploration Ability generates/consumes AE.  
**Input:** no AE pool owner specified.  
**Expected Resolution:** mode profile cannot finalize resource operation until owner model is chosen.  
**Forbidden Outcomes:** inherit turn-based team AE automatically.  
**Layers Under Test:** Mode Resource profile.

---

## J-006 — Exploration “Stun 2 turns” Auto-conversion

**ID:** `J-006`  
**Status:** `MUST_REJECT`  
**Purpose:** semantic preservation across scheduling models.  
**Initial State:** source turn-based kit says 2 target Natural Actions; no Exploration variant.  
**Input:** auto-port request.  
**Expected Resolution:** system requires explicit Exploration redesign.  
**Forbidden Outcomes:** “2 turns = 2 seconds” or “2 attacks”.  
**Layers Under Test:** Authoring workflow, Mode.

## J-007 — Turn-based AE Regen Requires an Actually Completed Natural Action

**ID:** `J-007`  
**Status:** `MUST_PASS`  
**Purpose:** verify `AE_ACTION_REGEN_BY_CLASS` is a Turn-based Mode rule tied to actual Natural Action completion, not SSI opportunity consumption or generic Action execution.

**Initial State:** `TURN_BASED_MAIN`; Side AE pool exists; Actors of each Effective Class can perform legal Natural Actions.

**Input:** parameterized cases:

Support Natural Action completed
Mage Natural Action completed
Summoner Natural Action completed
Warrior Natural Action completed
Tanker Natural Action completed
Ranger Natural Action completed
Assassin Natural Action completed

plus negative cases:
Actor loses SSI opportunity to CC and performs no Action
Follow-up completes
Counter completes
Reaction completes
Forced Action completes
child Action completes
Expected Resolution:
Support   → +10 Side AE
Mage      → +7 Side AE
Summoner  → +7 Side AE
Warrior   → +5 Side AE
Tanker    → +5 Side AE
Ranger    → +5 Side AE
Assassin  → +3 Side AE
Basic / Skill / Ultimate used as the Natural Action all grant the same amount for the Actor's Effective Class.
Every negative case grants:
+0 class AE
The lookup samples EFFECTIVE_CLASS at the Natural Action completion point.
Forbidden Outcomes: CC-consumed opportunity grants AE; child/follow-up/counter/reaction grants AE; native Class is used when Effective Class differs; Basic/Skill/Ultimate use different class-regen amounts; Exploration silently inherits this table.
Layers Under Test: Mode Resource Profile, SSI, Effective Class, Resource Runtime.

---

# 15. TEST GROUP K — VALIDATION / ANTI-SCRIPTING

---

## K-001 — Unknown Tag Synonym

**ID:** `K-001`  
**Status:** `MUST_REJECT`  
**Purpose:** canonical semantic deduplication.  
**Initial State:** `DEBUFF_CLEANSE` already exists.  
**Input:** kit authors Tag `PURIFY_DEBUFF`.  
**Expected Resolution:** reject/deprecate and map proposal to existing semantic; no second canonical Tag.  
**Forbidden Outcomes:** accept because wording is different.  
**Layers Under Test:** Tag Governance.

---

## K-002 — Parameter-as-Tag

**ID:** `K-002`  
**Status:** `MUST_REJECT`  
**Purpose:** protect Tag boundary.  
**Initial State:** ability targets 3 enemies.  
**Input:** Tag `THREE_TARGETS`.  
**Expected Resolution:** validator rejects; target count belongs TargetSpec.  
**Forbidden Outcomes:** parameter vocabulary explosion.  
**Layers Under Test:** Tag.

---

## K-003 — Ability Type as Tag

**ID:** `K-003`  
**Status:** `MUST_REJECT`  
**Purpose:** keep schema/type separate.  
**Input:** Ultimate authored with Functional Tag `ULTIMATE`.  
**Expected Resolution:** reject deprecated legacy Tag; use `abilityType=ULTIMATE`.  
**Forbidden Outcomes:** carry both indefinitely.  
**Layers Under Test:** Tag, Schema.

---

## K-004 — Arbitrary Custom Script

**ID:** `K-004`  
**Status:** `MUST_REJECT`  
**Purpose:** prevent schema becoming scripting language.  
**Input:** Character contains `customScript: "if (...) { ... }"`.  
**Expected Resolution:** reject and classify missing semantic/system if real mechanic cannot compose.  
**Forbidden Outcomes:** runtime executes custom C# callback.  
**Layers Under Test:** Schema architecture.

---

## K-005 — Effect DAG Cycle

**ID:** `K-005`  
**Status:** `MUST_REJECT`  
**Purpose:** bounded Action composition.  
**Initial State:** effect A depends on B, B depends on A.  
**Input:** normalize Ability.  
**Expected Resolution:** cycle error.  
**Forbidden Outcomes:** runtime loop until stack overflow.  
**Layers Under Test:** Schema/Normalizer.

---

## K-006 — Presentation Drives Damage

**ID:** `K-006`  
**Status:** `MUST_REJECT`  
**Purpose:** presentation independence.  
**Input:** authored rule says “deal damage when animation frame 37 occurs” without gameplay timing Contract.  
**Expected Resolution:** require semantic timing event; presentation frame cannot be authoritative.  
**Forbidden Outcomes:** renderer controls combat.  
**Layers Under Test:** Schema, Kernel boundary.

---

## K-007 — Prime Auto-Axiom

**ID:** `K-007`  
**Status:** `MUST_REJECT`  
**Purpose:** Rank ≠ Authority.  
**Input:** Normalizer assigns every Prime Ability Axiom Authority automatically.  
**Expected Resolution:** validator rejects this inference unless explicit Authority says so.  
**Forbidden Outcomes:** rank becomes authority shorthand.  
**Layers Under Test:** Terminology, Authority.

---

## K-008 — True Damage from 100% Penetration

**ID:** `K-008`  
**Status:** `MUST_REJECT`  
**Purpose:** Penetration ≠ True Damage.  
**Input:** effect has Physical component + 100% ARM Penetration but Tag `TRUE_DAMAGE` inferred automatically.  
**Expected Resolution:** reject inference; remains Physical with Penetration.  
**Forbidden Outcomes:** semantic conversion.  
**Layers Under Test:** Tag, Damage Schema.

## K-009 — Ambiguous Action-lineage Query

**ID:** `K-009`  
**Status:** `MUST_REJECT`  
**Purpose:** prevent immediate/parent/root Action identity from being silently conflated.

**Initial State:** root Action is `ULTIMATE`; child Action is `SKILL`; child Effect produces the observed Event.

**Input:** authored Condition says only:

ACTION_IDENTITY_IS = SKILL
while the mechanic can semantically refer to either the immediate child or root Action and provides no explicit ACTION_REF.
Expected Resolution: Normalizer rejects the ambiguous Condition and requires an explicit Action relation such as SELF, PARENT, or ROOT.
Forbidden Outcomes: silently interpret as immediate Action; silently interpret as root Action; choose whichever interpretation makes the kit work.
Layers Under Test: Schema validation, Action lineage, Condition evaluator.

## K-010 — Invalid Root Completion Dependency Graph
ID: K-010
Status: MUST_REJECT
Purpose: prevent completion deadlock and impossible dependency graphs.
Initial State: normalized Ability data declares root-linked blocking settlements.
Input: test invalid cases:
A dependsOn B
B dependsOn A
and:
A cannot settle until the same root ACTION_COMPLETED Event occurs
while A itself blocks that ACTION_COMPLETED
Expected Resolution: validation rejects both graphs before battle execution.
Forbidden Outcomes: accept cyclic graph; root Action waits forever at runtime; silently drop one dependency edge; use eventSeq/list order to break the cycle.
Layers Under Test: Ability Schema, ACT-032, Normalizer, Completion Dependency DAG.

## K-011 — Ambiguous Natural-Action Form Selector
ID: K-011
Status: MUST_REJECT
Purpose: ensure ordered Action-form policies remain deterministic and data-driven.
Initial State: one naturalActionFormPolicy candidate selects SKILL through a selector rather than exact Ability reference.
Input: selector matches two equally valid damaging Skills and declares no deterministic selection rule.
Expected Resolution: Normalizer rejects the policy as ambiguous.
Forbidden Outcomes: select first list item; select by dictionary iteration; use RNG without an authored RNG policy; silently prefer lower/higher Cost.
Layers Under Test: Ability Schema, Natural Action Form Resolver, Determinism.

## K-012 — Unscoped Non-State Effect Admission Rule
ID: K-012
Status: MUST_REJECT
Purpose: prevent scoped Effect Admission from becoming accidental all-effect immunity.
Initial State: Character owns an admission/protection rule.
Input: rule says only:
reject external Effects below QUY_TẮC
but does not declare which Effect semantic(s) it governs.
Expected Resolution: Normalizer rejects the rule until explicit scope is supplied, such as SHIELD.
Forbidden Outcomes: infer Shield because current Character happens to use Shield; turn the rule into global Damage/Heal/State immunity; use presentation/lore wording as the missing scope.
Layers Under Test: Effect Admission, Schema validation, Authority boundary.

---

## K-013 — Ambiguous Action-Intent Interposition Multiplicity

**ID:** `K-013`  
**Status:** `MUST_REJECT`  
**Purpose:** prove Action-Intent interposition never acquires hidden list/Event/entity-order priority.

**Initial State:** normalized Character data contains Action-Intent interposition rules matching the same Natural Action Intent.

**Input:** validate both invalid cases:

### Case A — one interposition spec, multiple matching branches

One `ActionIntentInterpositionSpec` has two branches whose conditions are simultaneously true for the same `ACTION_INTENT_CREATED`.

### Case B — multiple interposition instances at one anchor

Two distinct applicable interposition specs each select a branch for the same Intent and the same canonical anchor, with no explicit future composition policy.

**Expected Resolution:**

Normalizer rejects executable content before battle runtime.

Runtime must never need to choose a winner through:

- authored list order;
- Event order;
- Ability order;
- Character ID;
- Slot;
- entity ID;
- incidental iteration order.

**Expected Trace / State:** no admitted Action; no settlement executes; validation reports ambiguous interposition multiplicity.

**Forbidden Outcomes:** first branch wins; first Ability wins; lowest Character/Ability ID wins; lower `eventSeq` wins; RNG chooses; both settlements execute in an undeclared order.

**Layers Under Test:** Ability Schema, Normalizer, ACT-004, ACT-005, Action Scheduler determinism.

---

## K-014 — Legacy Reaction Boundary Is Not Silently Aliased

**ID:** `K-014`  
**Status:** `MUST_REJECT`  
**Purpose:** prevent legacy runtime labels from silently changing canonical sequential timing.

**Initial State:** current canonical runtime supports explicit:

```text
AFTER_DIRECT_EFFECTS_COMPLETE
```

while old/generated content contains:

```text
QUEUE_UNTIL_ACTION_COMPLETE
```

and provides no explicit proven migration mapping.

**Input:** load/normalize the legacy reaction-boundary value as executable content.

**Expected Resolution:** reject for regeneration or require an explicit migration whose semantic equivalence is separately proven.

**Expected Trace / State:** no silent normalization to `AFTER_DIRECT_EFFECTS_COMPLETE`.

**Forbidden Outcomes:**

```text
QUEUE_UNTIL_ACTION_COMPLETE
→ silently reinterpret as
AFTER_DIRECT_EFFECTS_COMPLETE
```

because:

```text
ACTION_COMPLETED
≠
ACTION_DIRECT_EFFECTS_COMPLETE
```

Also forbidden: accepting the legacy label merely because both appear to “delay reactions”.

**Layers Under Test:** Schema/IR compatibility, RES-003, Kernel sequential runtime, migration validation.

---

# 16. TEST GROUP L — UNRESOLVED CONTRACT PROBES

These tests are valuable precisely because the correct output is:
> “project has not decided this yet.”

---

## L-001 — Same-window Unrelated Reaction Priority

**ID:** `L-001`  
**Status:** `PROBE_UNRESOLVED`  
**Purpose:** expose global Trigger priority gap.  
**Initial State:** one event creates two unrelated Reaction Actions from different characters; both outcomes depend on which resolves first; no explicit priority profile.  
**Input:** event commit.  
**Expected Resolution:** architecture marks missing gameplay priority; deterministic insertion order may exist internally but cannot be promoted to canon.  
**Forbidden Outcomes:** use Speed/slot/iid without a rule.  
**Layers Under Test:** Trigger Contract.

---

## L-002 — Sequential Multihit Default Reaction Boundary

**ID:** `L-002`  
**Status:** `PROBE_UNRESOLVED`  
**Purpose:** preserve the unresolved global/default intermediate-Reaction question after adding one explicit local profile.

**Initial State:** one sequential three-component Action has a Reaction that could alter a later component; authored resolution data omits an explicit canonical Reaction-boundary profile.

**Input:** resolve/validate the Action.

**Expected Resolution:** architecture reports that an explicit Contract-supported profile is required where the distinction is gameplay-relevant.

The existence of:

```text
AFTER_DIRECT_EFFECTS_COMPLETE
```

does not make it the global default.

Legacy names such as:

```text
REACTIONS_BETWEEN_COMPONENTS
QUEUE_UNTIL_ACTION_COMPLETE
```

must not be silently chosen or treated as canonical fallback values.

**Expected Trace / State:** no implementation/list/Event-order decision is promoted into gameplay canon.

**Forbidden Outcomes:** silently use `AFTER_DIRECT_EFFECTS_COMPLETE`; silently use a legacy label; use first implementation behavior encountered; claim Pilot #3 resolved the global default.

**Layers Under Test:** Resolution Contract, Normalizer, Sequential Runtime, unresolved-policy preservation.

---

## L-003 — Battle-terminal Queue Cutoff

**ID:** `L-003`  
**Status:** `PROBE_UNRESOLVED`  
**Purpose:** Leader-death cleanup.  
**Initial State:** Leader reaches DEATH_CONFIRMED while ordinary queued reactions remain.  
**Input:** terminal event.  
**Expected Resolution:** atomic death/world bookkeeping works, but exact ordinary queue cutoff policy is explicitly unresolved until finalized.  
**Forbidden Outcomes:** undocumented reactions continue/cancel based on implementation accident.  
**Layers Under Test:** Battle-end Contract.

---

## L-004 — Full-slot Ordinary Revive

**ID:** `L-004`  
**Status:** `PROBE_UNRESOLVED`  
**Purpose:** materialization fallback.  
**Initial State:** dead actor is eligible to revive; intended return slot and all fallback slots occupied.  
**Input:** Revive.  
**Expected Resolution:** require explicit materialization policy.  
**Forbidden Outcomes:** overwrite occupant or silently select arbitrary slot.  
**Layers Under Test:** Materialization Contract.

---

## L-005 — Invalid Duy Nhất Random Definition

**ID:** `L-005`  
**Status:** `PROBE_UNRESOLVED`  
**Purpose:** uniqueness fallback.  
**Initial State:** random definition process can produce definition blocked by Duy Nhất at final materialization.  
**Input:** blocked candidate occurs.  
**Expected Resolution:** architecture can reject/reroll according to profile, but missing global policy remains visible.  
**Forbidden Outcomes:** materialize illegal duplicate.  
**Layers Under Test:** Uniqueness, RNG, Materialization.

---

## L-006 — Dynamic Authority Changes Mid-resolution

**ID:** `L-006`  
**Status:** `PROBE_UNRESOLVED`  
**Purpose:** confirm sampling boundary edge case.  
**Initial State:** one atomic effect could itself increase authority from Pháp Tắc to Quy Tắc while resolving a conflict.  
**Input:** effect begins at lower tier.  
**Expected Resolution:** current working default samples tier at start of atomic conflict, but test remains review item until final confirmation for self-upgrading edge cases.  
**Forbidden Outcomes:** silently resample differently per target in same simultaneous group.  
**Layers Under Test:** Authority Contract.

---

## L-007 — Local Sequential Reaction Gate Does Not Define Global Priority

**ID:** `L-007`  
**Status:** `PROBE_UNRESOLVED`  
**Purpose:** prove `AFTER_DIRECT_EFFECTS_COMPLETE` opens only a local sequential Reaction hold and does not order unrelated eligible work.

**Initial State:** one root Action declares:

```text
reactionBoundary = AFTER_DIRECT_EFFECTS_COMPLETE
```

At `ACTION_DIRECT_EFFECTS_COMPLETE`:

- an ordinary Reaction candidate becomes locally unheld;
- one unrelated root-linked blocking settlement is also eligible;
- another unrelated same-window Reaction candidate may also exist;
- no explicit global scheduling/priority Contract orders them.

**Input:** reach `ACTION_DIRECT_EFFECTS_COMPLETE`.

**Expected Resolution:**

```text
local sequential hold opens
```

but the architecture does not declare which unrelated eligible item resolves first.

If final gameplay outcome depends on that unresolved order:

> expose the existing global priority blocker rather than choosing through trace order.

**Expected Trace / State:** the local gate transition is traceable independently from any later scheduler choice.

**Forbidden Outcomes:** ordinary Reaction automatically outranks root-linked blocking settlement; blocking settlement automatically outranks ordinary Reaction merely because of this profile; lower `eventSeq` wins; list order wins; profile silently resolves `TRG-005`.

**Layers Under Test:** RES-003, Action pipeline, Reaction Queue, root-completion dependency, TRG-005.

---

# 17. TEST GROUP M — CHARACTER-DERIVED INTEGRATION TESTS

These are not isolated primitives. They deliberately span multiple layers.

---

## M-001 — SSR Warrior Skill 1

**ID:** `M-001`  
**Status:** `MUST_PASS`  
**Purpose:** profile-copy + fixed targets + Actual HP Damage heal.  
**Initial State:** three enemy positions 1/3/5; team has 20 AE.  
**Input:** Skill 1.  
**Expected Resolution:** pay team AE; fixed target/area semantics; each target receives Basic Attack Damage Profile as Skill damage; aggregate Actual HP Damage; self Heal = configured percentage of aggregate.  
**Forbidden Outcomes:** Skill becomes Basic Attack Identity; Heal uses Shield damage/Overkill.  
**Layers Under Test:** Schema, Damage, Result bindings, Cost.

---

## M-002 — SSR Warrior Post-Natural-Action HP Loss

**ID:** `M-002`  
**Status:** `MUST_PASS`  
**Purpose:** verify corrected Turn Boundary ordering.  
**Initial State:** Warrior completes Natural Action.  
**Input:** post-action passive.  
**Expected Resolution:** direct Action effects finish → 1% HP Loss → +4 Rage → death evaluation → Natural Action closes → Turn Boundary.  
**Forbidden Outcomes:** global Turn Boundary occurs before HP Loss; HP Loss represented as Damage.  
**Layers Under Test:** Clock, HP Loss, SSI.

---

## M-003 — SSR Warrior True-Damage Passive Personal Cap

**ID:** `M-003`  
**Status:** `MUST_PASS`  
**Purpose:** actor-window cap.  
**Initial State:** cap=1 per own Natural Action window.  
**Input:** qualifying True Damage happens twice before Warrior's next Natural Action.  
**Expected Resolution:** first activation succeeds; second blocked by personal cap; unrelated global Turn Boundaries do not reset it.  
**Forbidden Outcomes:** cap resets when enemy acts.  
**Layers Under Test:** Trigger cap, Actor window.

---

## M-004 — Ký Ức Skill 2 AoE Echo

**ID:** `M-004`  
**Status:** `MUST_PASS`  
**Purpose:** hardest action-level damage aggregation case.  
**Initial State:** allied simultaneous Damage Action hits T1/T2/T3; T1 takes 40% MaxHP actual, T2 20%, T3 50% and dies; Ký Ức has 30 AE.  
**Input:** Damage Action completes.  
**Expected Resolution:** trigger once for Action; pay 30 AE once; T1 qualifies and alive; T2 below threshold; T3 invalid because DEATH_CONFIRMED; T1 takes separate True Damage echo = 50% exact Actual HP Damage.  
**Forbidden Outcomes:** pay per target; echo T3; copy Debuffs; echo retriggers itself.  
**Layers Under Test:** Trigger, Damage aggregate, Lifecycle, recursion guard.

---

## M-005 — Ký Ức Skill 3 Natural Basic Sequence

**ID:** `M-005`  
**Status:** `MUST_PASS`  
**Purpose:** Natural Action/Action Identity precision.  
**Initial State:** Skill off cooldown; enough AE.  
**Input:** three different enemies consecutively use Natural Basic Actions.  
**Expected Resolution:** sequence reaches 3 and triggers Skill 3.  
**Forbidden Outcomes:** Follow-up/Forced Basic substitutes for a Natural Basic.  
**Layers Under Test:** Trigger, Action Identity, SSI.

---

## M-006 — Ký Ức Skill 3 Sequence Break

**ID:** `M-006`  
**Status:** `MUST_PASS`  
**Purpose:** sequence reset.  
**Initial State:** two valid Natural Basics recorded.  
**Input:** next enemy Natural Action is Skill instead of Basic.  
**Expected Resolution:** sequence resets/breaks according to character contract.  
**Forbidden Outcomes:** continue count through nonqualifying Action.  
**Layers Under Test:** Trigger counter.

---

## M-007 — Ký Ức Skill 3 Insufficient AE at Third Action

**ID:** `M-007`  
**Status:** `MUST_PASS`  
**Purpose:** character-specific failed-cost counter behavior.  
**Initial State:** two valid actions recorded; AE below 15 when third valid action arrives.  
**Input:** third qualifying Natural Basic.  
**Expected Resolution:** no trigger; sequence resets.  
**Forbidden Outcomes:** hold 3/3 waiting for future AE; partially trigger.  
**Layers Under Test:** Trigger cost/counter Contract.

---

## M-008 — Ký Ức Death Stat Snapshot

**ID:** `M-008`  
**Status:** `MUST_PASS`  
**Purpose:** value snapshot ≠ State-object copy.  
**Initial State:** external Buff contributes to final ATK before death.  
**Input:** canonical death stat snapshot then special Revive.  
**Expected Resolution:** snapshot can retain final ATK value per declared fields; external Buff object itself is not restored/copied.  
**Forbidden Outcomes:** cloned Buff duration/owner travels into new life.  
**Layers Under Test:** Snapshot, Revive.

---

## M-009 — Luân Hồi Chi Chủ Temporary Absence

**ID:** `M-009`  
**Status:** `MUST_PASS`  
**Purpose:** Temporary Absence ≠ Reincarnation.  
**Initial State:** character alive.  
**Input:** Skill temporarily leaves battlefield then returns.  
**Expected Resolution:** no DEATH_CONFIRMED; no Luân Hồi waiting; no `REINCARNATION` semantic solely from lore name.  
**Forbidden Outcomes:** treat absence as death/rebirth.  
**Layers Under Test:** Lifecycle, Tag.

---

## M-010 — Luân Hồi Chi Chủ Composite Ultimate Preserves Child Authority

**ID:** `M-010`  
**Status:** `MUST_PASS`  
**Purpose:** child authority profile.  
**Initial State:** outer Ultimate has own Authority; child Skills have their own tiers.  
**Input:** Ultimate invokes children with `PRESERVE_CHILD`; child costs waived.  
**Expected Resolution:** child conflicts use child Authority; base child Ability definitions unchanged.  
**Forbidden Outcomes:** outer tier overwrites every child.  
**Layers Under Test:** Composite Action, Authority, Cost.

---

## M-011 — SSR Warrior Composite Ultimate Inherits Outer Authority

**ID:** `M-011`  
**Status:** `MUST_PASS`  
**Purpose:** prove opposite child policy is also supported generically.  
**Initial State:** Warrior Ultimate profile = `INHERIT_OUTER`.  
**Input:** child Skill 1/2.  
**Expected Resolution:** this execution uses outer Authority for conflicts; direct standalone casts retain own base Authority.  
**Forbidden Outcomes:** globally rewrite child Ability definition.  
**Layers Under Test:** Composite Action.

---

## M-012 — Cố Sự Sword Capability Realization

**ID:** `M-012`  
**Status:** `MUST_PASS`  
**Purpose:** Story property becomes real source without Tag explosion.  
**Initial State:** valid Story/Bearer/Witness state reaches Realization.  
**Input:** Sword property Realizes and grants True Damage.  
**Expected Resolution:** Realized Property contributes canonical `TRUE_DAMAGE`; source provenance is Story property; no new lore-specific Tag required.  
**Forbidden Outcomes:** `STORY_SWORD_TRUE_DAMAGE` Tag.  
**Layers Under Test:** Narrative, Capability.

## M-013 — Combat-Instance-keyed Field Presence

**ID:** `M-013`  
**Status:** `MUST_PASS`  
**Purpose:** prove Field Presence is keyed by Combat Instance and distinct from Death / host binding.  
**Initial State:** Ariadne is active-present in Main with a Main-owned Position Mark; Arena child Combat Instance exists; a separate Puppet is already active-present in Main.  
**Input:** transfer Ariadne Main → Arena; then bind a True Self/Combat Definition to the already-present Puppet.  
**Expected Resolution:** authoritative presence becomes not-present for Ariadne in Main and active-present for Ariadne in Arena; committed transfer exposes `LEAVE_FIELD(Main)` and `ENTER_FIELD(Arena)`; Main Mark can clean up and Arena entry can create a fresh Arena-local Mark; no `DEATH_CONFIRMED`; Puppet binding emits no `ENTER_FIELD` because Puppet presence in its Combat Instance did not change.  
**Forbidden Outcomes:** one global presence boolean loses instance distinction; Arena transfer treated as Death; host binding treated as field entry; presentation visibility drives presence.  
**Layers Under Test:** Terminology, POS Presence Contracts, Combat Instance, Event System, Kernel.

---

## M-014 — Deck Membership, Deployability and Full Rage

**ID:** `M-014`  
**Status:** `MUST_PASS`  
**Purpose:** separate Deck membership, current deployment state, Deployment Cost, full Rage and SSI scheduling.  
**Initial State:** Character is a member of the battle Deck; first case deployment state = NOT_DEPLOYABLE; second case deployment state = DEPLOYABLE; Deployment Cost Bar = 15; Deployment Cost = 8; Max Rage = 100; Current Rage < 100; valid destination Slot has not been passed by Side pointer.  
**Input:** attempt Deploy in both states.  
**Expected Resolution:** Deck membership alone does not permit the first Deploy and no Cost/Rage/presence mutation commits; second Deploy succeeds, Deployment Cost Bar 15 → 7, active presence commits, Current Rage becomes 100, then post-commit `DEPLOY_FROM_DECK_COMMITTED` and `ENTER_FIELD` are exposed; no Ultimate auto-casts; Natural Action occurs only when SSI reaches eligible Slot. Ordinary Revive/Arena Return does not receive full Rage from this rule.  
**Forbidden Outcomes:** Deck membership treated as deployability; AE pays Deployment Cost; Character becomes SUMMON; full Rage auto-casts Ultimate; failed Deploy spends Cost; Revive/Arena Return inherits full-Rage rule.  
**Layers Under Test:** DeckState, DEP Contracts, Resource, Presence, SSI.

---

## M-015 — Position Mutation Post-commit Observation Granularity

**ID:** `M-015`  
**Status:** `MUST_PASS`  
**Purpose:** prove atomic group granularity, post-commit observation timing, authoritative `entries[]`, and collection `ANY` behavior.  
**Initial State:** Ariadne Skill 2 observes Position Mutation commits with subject collection condition: `ANY` moved entity is ALLY relative to `SELF`, excluding `SELF`; enough AE/cap remains.  
**Input:** one atomic Position Mutation group moves allies A/B/C together; later the same root Action commits group D and then group E.  
**Expected Resolution:** A/B/C authoritative Positions commit first; one `POSITION_MUTATION_COMMITTED` Event is then exposed with authoritative `entries[] = [A,B,C]`; listener evaluates post-commit state and qualifies once; derived `subjectRefs`, if present, projects A/B/C but is not source of old/new Position truth. D and E produce separate later commit Events/attempts. Failed/no-op mutation emits no successful commit Event.  
**Forbidden Outcomes:** listener sees half-committed occupancy; A/B/C create three Events merely because three entities moved; all root-Action commits merge into one Event; `subjectRefs` overrides contradictory `entries[]`; bare ALLY relation has no explicit anchor.  
**Layers Under Test:** Schema subjectFilter, Position Contract, Transaction, Event payload, Trigger Engine.

---

## M-016 — Same-transaction Event Sequence Is Trace Order Only

**ID:** `M-016`  
**Status:** `MUST_PASS`  
**Purpose:** ensure deterministic trace ordering does not silently resolve global Reaction priority.  
**Initial State:** one committed transaction exposes two semantically distinct Events; unrelated Trigger A listens to first Event and unrelated Trigger B listens to second; no explicit gameplay priority Contract exists between A and B.  
**Input:** Event records receive deterministic `eventSeq = N` and `N+1`.  
**Expected Resolution:** replay/trace order is deterministic; the architecture does not declare Trigger A gameplay-superior solely because its Event has lower `eventSeq`; implementation-ready competing same-window reactions remain subject to `TRG-005` explicit/system priority requirements.  
**Forbidden Outcomes:** lower eventSeq automatically wins; insertion/publication order becomes hidden universal Reaction priority; test invents global priority to become green.  
**Layers Under Test:** Event Sequence, Trigger Queue, TRG-005, determinism.

---

## M-017 — Side-relative Direction Mirror

**ID:** `M-017`  
**Status:** `MUST_PASS`  
**Purpose:** prove common SpatialSelectorSpec resolves FRONT/BACK/LEFT/RIGHT relative to declared Side orientation.  
**Initial State:** two actors from opposing Sides occupy mirrored equivalent Slots.  
**Input:** resolve common `SpatialSelectorSpec` using `orientationBasis = SIDE_RELATIVE`, `orientationAnchor = SELF`, first BACK then LEFT for each actor.  
**Expected Resolution:** both actors resolve from their own Side facing; physical results are mirrored; same common Schema object can be used from TargetSpec or Position Mutation Spec.  
**Forbidden Outcomes:** one global screen-left/back mapping; separate Character-specific slot code; TargetSpec defines an incompatible private spatial selector language.  
**Layers Under Test:** Terminology, Common Schema, POS-004, Mode Spatial Profile.

---

## M-018 — Target Lock vs Guaranteed Hit

**ID:** `M-018`  
**Status:** `MUST_PASS`  
**Purpose:** prove Target Lock and ordinary Hit Admission are independent.  
**Initial State:** enemy Entity is selected and locked by Entity ID; ordinary hit policy would permit Miss/Dodge/Evasion; target remains a legal recipient.  
**Input:** after lock, target changes Position; Ariadne Skill 3 resolves with `hitAdmission.policy = GUARANTEED`.  
**Expected Resolution:** Position change does not replace/drop locked Entity; ordinary Miss/Dodge/Evasion cannot reject the hit; same valid Entity proceeds to damage resolution.  
**Forbidden Outcomes:** Target Lock alone interpreted as Guaranteed Hit; Position movement automatically causes miss; Guaranteed Hit performs target re-query.  
**Layers Under Test:** Target Lock, Hit Admission, Position, Damage.

---

## M-019 — Guaranteed Hit Does Not Bypass Lifecycle or Authority-based Special Denial

**ID:** `M-019`  
**Status:** `MUST_PASS`  
**Purpose:** bound Guaranteed Hit to ordinary Hit Admission only.  
**Initial State:** Case A: locked target becomes lifecycle-invalid before hit commit. Case B: target remains valid but an Authority-bearing opposing rule directly declares a special hit denial/avoidance over the same semantic scope.  
**Input:** resolve an effect with `hitAdmission.policy = GUARANTEED`.  
**Expected Resolution:** Case A follows target invalidation/lifecycle policy; Guaranteed Hit does not restore target. Case B does not classify the Authority rule as ordinary Evasion; direct conflict routes through existing Authority adjudication. `GUARANTEED` does not automatically win.  
**Forbidden Outcomes:** Guaranteed Hit rematerializes invalid target; ignores lifecycle illegality; automatically bypasses Axiom/Quy Tắc/Pháp Tắc special denial merely because presentation says “dodge”; skips Authority adjudication.  
**Layers Under Test:** Hit Admission, Target invalidation, Lifecycle, Authority.

---

## M-020 — Ariadne Mid-action Position Mark Replacement

**ID:** `M-020`  
**Status:** `MUST_PASS`  
**Purpose:** prove Ariadne Mark timer/reset still composes from existing State/Clock semantics and post-Position-commit observation without a new Tag/Primitive.  
**Initial State:** Ariadne is inside a Natural Action; old Position Mark Remaining = 1; Ultimate movement branch can move an ally into old Mark.  
**Input:** Ultimate commits ally Position Mutation into Mark.  
**Expected Resolution:** Position commit completes; Ariadne's declared post-commit Mark listener recognizes the ally entered Mark; old Mark Remaining 1 → 0; old Mark expires; fresh Mark is created at Ariadne's current Position with Remaining = 3; current Natural Action does not retroactively decrement new Mark; passive movement for new Mark waits until before Ariadne's next Natural Action.  
**Forbidden Outcomes:** listener observes pre-commit/half-commit Position; new Mark immediately becomes 2 from same Natural Action; old Mark remains; Ariadne performs another passive movement in current Natural Action merely because new Mark appeared; this test is interpreted as defining global priority against unrelated same-window Reactions.  
**Layers Under Test:** Position observation, Position Mark, State identity, Natural Action clock, existing primitives.

## M-021 — Echo Root Ultimate / Child Skill Action Memory

**ID:** `M-021`  
**Status:** `MUST_PASS`  
**Purpose:** prove Echo can query immediate and root Action Identity independently.

**Initial State:** enemy performs root `ULTIMATE`; Ultimate invokes child `SKILL`; child Skill causes qualifying Actual HP Damage to Echo.

**Input:** Echo Action-form memory observes the damaging Event.

**Expected Resolution:**
immediate Action Identity = SKILL
root Action Identity      = ULTIMATE

Echo memory:
primary  = ULTIMATE
fallback = SKILL
The Event remains attributable to the correct Action lineage without changing the child Skill's own identity.
Forbidden Outcomes: record only SKILL and lose root identity; rewrite child Skill as ULTIMATE; store both identities in one ambiguous field; infer ancestry from animation/presentation.
Layers Under Test: Action lineage, Condition query, parent/child Action system, Echo memory.

## M-022 — Same-root Effect Provenance Prevents Echo Repeat Recursion
ID: M-022
Status: MUST_PASS
Purpose: prove Action lineage alone is insufficient and Effect provenance prevents one-layer repeat from recursively repeating itself.
Initial State: Echo uses a damaging Action on enemy T; no Shield interferes; original Damage causes exactly 200 Actual HP Damage. Echo's repeat ratio = 50%.
Input: outgoing repeat passive resolves.
Expected Resolution:
original Damage:
Actual HP Damage = 200
rootActionId = R
Damage Attribution = Echo
originEffectId = ORIGINAL_DAMAGE

repeat Damage:
True Damage = 100
rootActionId = R
Damage Attribution = Echo
originEffectId = ECHO_REPEAT
The repeat Damage does not generate another repeat.
If it causes 100 Actual HP Damage, Skill 1 aggregation may identify that 100 as repeat-origin Damage while excluding the original 200.
Forbidden Outcomes: repeat creates 50 → 25 → 12.5... chain; recursion guard relies only on rootActionId; recursion guard relies only on Damage Attribution; Skill 1 aggregates original Damage as if it were repeat Damage.
Layers Under Test: Effect provenance, Action lineage, Actual HP Damage, recursion guard, result aggregation.

## M-023 — Two Echoes Do Not Create Repeat Feedback Loop
ID: M-023
Status: MUST_PASS
Purpose: prove provenance-based recursion protection remains correct across two different owners with the same kit.
Initial State: Echo A attacks Echo B; both have sufficient HP; no Shield; direct hit causes B exactly 100 Actual HP Damage.
Input: resolve both Characters' qualifying passive listeners.
Expected Resolution:
From the original direct Damage:
Echo A outgoing repeat
→ 50 True Damage to Echo B

Echo B incoming self-repeat
→ 50 True Damage to Echo B
Both repeat Effects are passive-generated and terminate after that layer.
They do not trigger:
another outgoing repeat from A;
another incoming repeat from B;
each other's repeat listener.
Forbidden Outcomes: infinite A↔B repeat chain; repeat packet from A is treated as fresh qualifying enemy direct Damage for B; B self-repeat generates another repeat because Damage Attribution = B.
Layers Under Test: Effect provenance, cross-Character Trigger filtering, recursion guard, Damage Attribution.

## M-024 — Echo Natural-Action Form Restriction Uses Read-only Ordered Fallback
ID: M-024
Status: MUST_PASS
Purpose: verify explicit Character law overrides Mode default without turning the Action into Forced Action or mutating rejected candidates.
Initial State: Echo has an SSI-granted Natural Action.
Case A
Memory:
primary  = ULTIMATE
fallback = SKILL
then     = BASIC_ATTACK
Current Rage is below Max Rage.
Skill costs 30 AE.
Side AE = 20.
Input: resolve Echo's Natural Action form.
Expected Resolution:
probe ULTIMATE
→ rejected: not Rage-ready

probe SKILL
→ rejected: unpayable

probe BASIC_ATTACK
→ legal
→ select BASIC_ATTACK
During both rejected probes:
Rage unchanged;
AE remains 20;
cooldowns unchanged;
RNG stream unchanged;
no target is locked;
no gameplay Event is emitted.
The selected Basic is still:
naturalActionStatus = NATURAL
Case B
Memory restricts Echo to:
SKILL
→ BASIC_ATTACK
Echo is at full Rage and Skill is payable/legal.
Expected Resolution: Skill is selected. Mode default full-Rage Ultimate priority does not bypass the explicit Character restriction.
Forbidden Outcomes: rejected Skill spends AE; rejected Ultimate consumes/resets Rage; random target selection occurs while probing; Action becomes FORCED_ACTION; full Rage ignores Echo restriction.
Layers Under Test: ACT-003, Cost, Rage, Mode Action-form priority, Determinism.

## M-025 — Echo Scoped Shield Admission by Authority
ID: M-025
Status: MUST_PASS
Purpose: prove non-State Effect Admission is scoped and that an Authority threshold is not automatically same-tier progression adjudication.
Initial State: Echo owns a rule:
external SHIELD admitted only if incoming Authority >= QUY_TẮC
No separate direct-Damage admission rule exists.
Input: four external Shield Effects arrive independently:
NORMAL
PHÁP TẮC
QUY TẮC
AXIOM
then an ordinary direct Damage Effect arrives.
Expected Resolution:
NORMAL Shield      → REJECT
PHÁP TẮC Shield    → REJECT
QUY TẮC Shield     → ADMIT
AXIOM Shield       → ADMIT
The simple threshold check does not invoke Rank → Tu vi → Stars → Awaken → CP comparison.
The ordinary direct Damage proceeds through the normal Damage pipeline because Echo's admission rule scopes only SHIELD.
Forbidden Outcomes: Pháp Tắc Shield admitted; threshold comparison invokes same-tier progression adjudication without direct conflict; Shield rule blocks Damage; every incoming Effect is globally routed as immunity.
Layers Under Test: Scoped Effect Admission, Shield Runtime, Authority threshold, Damage boundary.

## M-026 — Echo Blocking Settlements Cannot Self-fund from Same Natural Action AE Regen
ID: M-026
Status: MUST_PASS
Purpose: verify local root-completion dependencies settle before ACTION_COMPLETED and before class AE regeneration.
Initial State: Echo Mage performs a Natural Action. Side AE = 35. The Action:
produces qualifying outgoing repeat Damage P > 0;
causes at least one qualifying True-Self DEATH_CONFIRMED;
leaves Echo with Shield available for Skill 3;
therefore makes both Skill 3 and Skill 1 eligible.
Costs:
Skill 3 = 30 AE
Skill 1 = 10 AE
Mage completion regen = +7 AE
Local dependency:
Skill 3
→ Skill 1
→ root ACTION_COMPLETED
Input: resolve the Natural Action to completion.
Expected Resolution:
AE 35
→ Skill 3 pays 30
→ AE 5
→ Skill 3 resolves

→ Skill 1 becomes ready
→ cannot pay 10
→ Skill 1 = FAILED_COST
→ Skill 1 dependency becomes terminal

→ all blocking dependencies terminal
→ root ACTION_COMPLETED

→ Mage Mode hook grants +7 AE
→ AE 12
Skill 1 does not reactivate retroactively after AE becomes 12.
Forbidden Outcomes: +7 Mage AE occurs before Skill 1 Cost check; Skill 1 self-funds from current Natural Action's regen; failed Skill 1 leaves root Action blocked forever; root Action completes before Skill 3/Skill 1 dependencies settle.
Layers Under Test: ACT-032, Completion Tracker, triggered Cost, Mode AE regen, Natural Action completion.

## M-027 — Echo Local Skill 3 → Skill 1 Ordering
ID: M-027
Status: MUST_PASS
Purpose: verify Echo-specific local dependency order without defining global Reaction priority.
Initial State: Echo Natural Action makes both Skill 3 and Skill 1 eligible; Side AE is sufficient for both; Echo currently has Shield; Skill 1 will create new Shield from P.
Input: resolve the root completion graph.
Expected Resolution:
existing Shield snapshot
→ Skill 3 converts 50% current total Shield to Max HP
→ Current HP remains unchanged
→ Skill 3 terminal

→ Skill 1 settles
→ Heal
→ new Skill 1 Shield is created

→ root ACTION_COMPLETED
→ class AE regen
The Shield newly created by Skill 1 is not retroactively consumed by Skill 3 from the same Action.
This ordering exists only because normalized Echo dependency data declares it.
Forbidden Outcomes: Skill 1 Shield is created first and immediately converted by Skill 3; eventSeq alone chooses order; this test is generalized into a global Skill-3-before-Skill-1 priority; root completes between the two settlements.
Layers Under Test: local completion DAG, Shield, Max HP Mutation, Trigger ordering.

## M-028 — Echo CC-lost Opportunity Preserves Actual-action Windows
ID: M-028
Status: MUST_PASS
Purpose: distinguish SSI opportunity consumption from an actually performed Natural Action across memory, free-cost duration and class AE regeneration.
Initial State: Echo has:
Action-form memory = SKILL
Skill-1 free-cost window = 2 actually performed Natural Actions remaining
Input: Echo's next SSI opportunity is lost to CC and no Action is performed; later Echo receives another opportunity and actually performs a legal Skill Natural Action.
Expected Resolution after CC-lost opportunity:
memory remains SKILL
free-cost window remains 2
class AE gain = 0
After the later actually performed Natural Action completes:
memory used by that Action is cleared
free-cost window 2 → 1
Mage class AE +7 occurs after root-linked settlements and ACTION_COMPLETED
Forbidden Outcomes: CC clears memory; CC decrements free-cost window; CC grants +7 AE; global Turn Boundary substitutes for actual-action completion.
Layers Under Test: SSI, actor-specific Natural Action window, duration State, Action-form memory, Mode AE regen.

## M-029 — Echo Skill 3 Uses Root-outcome Attribution, Not Temporal Coincidence
ID: M-029
Status: MUST_PASS
Purpose: prove DEATH_CONFIRMED qualification follows root Action lineage/provenance and once-per-Natural-Action semantics.
Initial State: during one Echo Natural Action:
enemy A with True Self is damaged by Echo;
Echo's repeat Effect linked to the same root Action causes A's DEATH_CONFIRMED;
unrelated enemy B with True Self dies during the same broad time window from another source;
optionally enemy C also receives a qualifying DEATH_CONFIRMED from another Echo-linked repeat in the same root Action.
Input: evaluate Echo Skill 3 trigger.
Expected Resolution:
A qualifies
B does not qualify
C qualifies if present
Because at least one qualifying death belongs to Echo's root Natural Action:
Skill 3 activation attempts exactly once
regardless of whether A alone or A+C qualify.
Forbidden Outcomes: B qualifies merely because death happened before Echo Action completed; linked repeat kill A is excluded because immediate Effect is passive; one activation per dead target; attribution determined only from Damage Attribution without root/effect provenance.
Layers Under Test: DEATH_CONFIRMED, Action lineage, Effect provenance, Trigger cap/frequency, root-outcome attribution.

---

## M-030 — Sanguinius Skill 2 Distributed Cost Transaction

**ID:** `M-030`  
**Status:** `MUST_PASS`  
**Purpose:** prove dynamic distributed multi-payer Cost, optional failure, actual-paid aggregation, frozen high-zone branch selection, and the complete Cost-stage terminal boundary before `POST_COST_PRE_EFFECT`.

**Initial State:**

Turn-based battle.

Sanguinius:
- Current Max HP = 1000;
- Current HP = 400;
- Side AE = 40;
- Skill 2 is requested and otherwise legal;
- at `ACTION_INTENT_CREATED`, HP = 40% Max HP, so the high-zone `POST_COST_PRE_EFFECT` branch is selected and frozen.

Skill 2 required Costs:
- 20 AE;
- Sanguinius HP Cost = 100.

Optional payer candidates at the authoritative pre-payment snapshot:
- ally A: non-Leader, active, 700/1000 HP, ordinary HP Cost allowed;
- ally B: non-Leader, active, 700/1000 HP, but a special Cost rule rejects this HP payment;
- ally C: non-Leader, active, 590/1000 HP, therefore below the 60% candidate threshold.

No active enemy satisfies the Prime + Effective-Light Heal-pressure predicate in this test.

Leader is missing enough HP that the Skill-2 Heal result is observable.

**Input:** activate Skill 2.

**Expected Resolution:**

```text
ACTION_INTENT_CREATED at 40% HP
→ freeze high-zone POST_COST_PRE_EFFECT branch

→ validate required AE + mandatory Sanguinius HP Cost
→ snapshot optional payer collection = {A, B}
→ commit required Costs
     Side AE 40 → 20
     Sanguinius HP 400 → 300

→ branch remains high-zone even though Current HP is now 30%
→ do not reopen admission / do not switch to PRE_ADMISSION_PRE_COST

→ attempt every frozen optional payer's own Cost
   in any stable technical order
→ record one terminal payment result per frozen payer
→ construct COST_GROUP_PAYMENT_RESULT
→ TOTAL_ACTUAL_PAID(HP)
→ Cost stage terminal

→ only now POST_COST_PRE_EFFECT Skill 3 may settle
     Skill 3 pays 10 AE
     Skill 3 Heals Sanguinius +80
→ only after that may Skill-2 direct Heal/Shield effects begin
```

Expected member outcomes:

```text
Sanguinius actualPaidAmount = 100
A actualPaidAmount = 100, success = true
B actualPaidAmount = 0, success = false
C has no payment attempt because C was not in the frozen payer set
```

Therefore:

```text
T = TOTAL_ACTUAL_PAID(HP) = 200
```

Skill-2 Leader Heal nominal base reads `T = 200`.

B's failed optional payment does not fail Skill 2.

Every frozen optional payer attempt reaches a terminal result before the CostGroup becomes terminal.

The technical order in which A/B attempts are iterated is not gameplay priority.

**Expected Trace / State:** trace shows high-zone branch frozen at Intent creation; payer snapshot before the first Cost commit; all member `COST_PAYMENT_RESULT`s exist before the group result; group result exists before post-cost interposition begins; no revalidation occurs merely because required Cost lowered Sanguinius to 30% HP.

**Forbidden Outcomes:** branch switches to low-zone after self HP Cost; Skill 2 is revalidated/rejected after already-admitted Cost processing; B failure cancels Skill 2; C is added after payment begins; group total uses nominal amounts; optional payer outcomes collapse into one singular binding; Skill 3 begins while optional attempts or group aggregation remain unfinished; A/B technical iteration order changes gameplay; ally HP Cost is emitted as Damage from Sanguinius.

**Layers Under Test:** Action Intent branch freeze, CostGroupSpec, payerCollection, CST-008, CST-009, Transaction Manager, Result Binding Store, ACT-005 `POST_COST_PRE_EFFECT`.

---

## M-031 — Sanguinius Ultimate Uses Committed HP Cost Result

**ID:** `M-031`  
**Status:** `MUST_PASS`  
**Purpose:** prove HP-floor payment results, successful zero payment, blood-arrow use of committed `actualPaidAmount`, simultaneous arrow/slash resolution, presentation-only dash, and non-blocking failed low-zone Skill-3 settlement.

**Initial State:**

Sanguinius Current Max HP = 1000.

For both cases:
- Side AE = 0, so Skill 3 cannot pay its 10 AE Cost;
- the selected low-zone Skill-3 settlement uses its canonical continue-on-failed-payment behavior;
- Ultimate is otherwise legal and Rage-ready;
- enemy Leader occupies turn-based position 2 and is a legal target;
- the test does not add a Prime-Light Damage modifier or Shield edge that would obscure the Cost-result assertion.

Run two deterministic cases.

### Case A — floor truncates nominal payment

Sanguinius Current HP = 100.

At `ACTION_INTENT_CREATED`, the low-zone branch is selected.

Skill 3 attempts first, cannot pay 10 AE, produces no Heal, and does not cancel the preserved Ultimate Intent.

Nominal Ultimate HP Cost is 25% Max HP, but the 2% floor permits only:

```text
actualPaidAmount = 80
```

leaving Current HP = 20.

### Case B — zero-payable legal Ultimate

Sanguinius Current HP = 20, exactly 2% Max HP.

Again, Skill 3 attempts first and fails for insufficient AE without cancelling the Ultimate Intent.

Applicable Ultimate Cost policy permits:

```text
success = true
actualPaidAmount = 0
```

**Input:** cast Ultimate in each case.

**Expected Resolution:**

Case A:

```text
failed Skill-3 settlement under continue policy
→ revalidate/admit Ultimate
→ committed Ultimate HP payment = 80
→ blood-arrow True Damage formula reads 80
```

Case B:

```text
failed Skill-3 settlement under continue policy
→ revalidate/admit Ultimate
→ successful Ultimate HP payment = 0
→ blood-arrow True Damage formula reads 0
```

The downstream arrow consumes the committed `CostPaymentResult.actualPaidAmount`.

It does not reconstruct raw nominal 25% Max HP.

In both cases, if the Ultimate remains otherwise legal:

- the fixed-position slash still resolves;
- arrow and slash belong to one simultaneous damage batch;
- because Leader occupies position 2, Leader may receive both arrow and slash Effects before lifecycle processing;
- Sanguinius' visual forward dash creates no gameplay `POSITION_MUTATION`.

**Expected Trace / State:** one low-zone Action Intent; one failed Skill-3 settlement with no Heal; one singular immutable Ultimate HP `COST_PAYMENT_RESULT`; blood-arrow formula references that result; one simultaneous batch contains independently-targeted arrow/slash Effects; no Position Mutation Event exists for the VFX dash.

**Forbidden Outcomes:** failed Skill 3 cancels Ultimate despite continue policy; Skill 3 somehow succeeds with Side AE 0; `actualPaidAmount=0` is treated as automatic Ultimate Cost failure; arrow deals nominal 250; later HP changes rewrite the Cost result; lifecycle is processed between arrow and slash inside the simultaneous batch; slash is removed because Leader already received arrow; VFX changes authoritative Slot/Position.

**Layers Under Test:** Action Intent interposition, settlement failure continuation, HP Cost, CST-009, CostPaymentResultRef, RES-002 simultaneous batch, Position/presentation separation.

---

## M-032 — Sanguinius Low-zone Intent Revalidation Uses Same Natural Action

**ID:** `M-032`  
**Status:** `MUST_PASS`  
**Purpose:** prove low-zone Action Intent survives pre-admission interposition, branch selection is frozen, failed revalidation uses authored Basic fallback, and fallback does not create a second Intent cycle.

**Initial State:**

Sanguinius:
- Current Max HP = 1000;
- Current HP = 290;
- enough Side AE for Skill 3;
- player requests Skill 2;
- Skill 2 prerequisite requires HP >= 400;
- authored revalidation fallback = `BASIC_ATTACK`.

At `ACTION_INTENT_CREATED`:

```text
HP = 29% Max HP
```

therefore the low-zone branch is selected.

**Input:** process the Natural Action.

**Expected Resolution:**

```text
one SSI Natural Action opportunity
→ ACTION_INTENT_CREATED for requested Skill 2
→ low-zone PRE_ADMISSION_PRE_COST branch frozen
→ Skill 3 pays 10 AE
→ Skill 3 Heals +80
→ Current HP becomes 370
→ branch remains low-zone even though HP crossed above 30%
→ revalidate SAME original Skill 2 Intent
→ Skill 2 still fails >=40% prerequisite
→ evaluate explicitly-authored fallback
→ BASIC_ATTACK selected
→ Basic enters ordinary admission/execution
```

Fallback:

- uses the same `naturalActionOpportunityRef`;
- does not create a second `ACTION_INTENT_CREATED`;
- does not rerun interposition matching;
- does not rerun the already-selected Skill 3 interposition;
- does not pay failed Skill 2 Cost.

**Expected Trace / State:** one Action Intent ID, one frozen interposition selection, one Natural Action opportunity, one Skill 3 settlement, one fallback Basic admitted as effective candidate.

**Forbidden Outcomes:** Skill 2 request is rejected before Skill 3 can settle; branch switches to high-zone after Heal; Basic fallback creates a new Intent; Skill 3 runs twice; fallback grants a second Natural Action; failed Skill 2 spends AE/HP Cost; global Basic fallback is inferred without authored data.

**Layers Under Test:** ActionIntentInterpositionSpec, ACT-004, ACT-005, Action Scheduler, revalidation, explicit fallback, SSI.

---

## M-033 — Sanguinius Actual-action Hooks, CC Loss and Insufficient Skill 3 AE

**ID:** `M-033`  
**Status:** `MUST_PASS`  
**Purpose:** preserve actual-Natural-Action-only self Heal, CC-lost distinction, Skill-3 insufficient-AE behavior, and Warrior +5 AE timing.

**Initial State:**

Sanguinius:
- Current Max HP = 1000;
- Current HP = 500;
- Side AE = 5;
- enemy field initially has 0–2 Effective-Light units;
- no other effect changes AE during the test.

**Input / Case A — CC-lost opportunity:**

Sanguinius reaches an SSI Natural Action opportunity but CC prevents any Basic/Skill/Ultimate Action from being performed.

**Expected Resolution / Case A:**

- opportunity is consumed under SSI;
- no Skill-3 settlement caused by an Action Intent;
- no 4% post-Natural-Action self Heal;
- no Warrior +5 AE;
- any Sanguinius duration explicitly based on actually performed Natural Actions does not decrement merely because this opportunity was lost.

**Input / Case B — actual Basic with only 5 AE:**

At the next opportunity Sanguinius actually performs Basic Attack.

**Expected Resolution / Case B:**

Basic has no active Skill Cost, so Skill 3 attempts before the Basic direct effect.

Skill 3 attempts its 10 AE Cost and fails:

```text
success = false
→ no Skill-3 8% Heal
```

Basic still resolves.

After the Natural Action reaches `ACTION_COMPLETED`:

- the 4% self-Heal may settle because only 0–2 enemy Light units exist;
- Warrior class hook grants +5 Side AE;
- no relative priority between unrelated same-window post-completion work is inferred beyond existing Contracts;
- the later +5 AE does not retroactively fund the failed Skill-3 settlement.

**Input / Case C — 3+ Light suppression:**

Repeat an actually performed Natural Action with 3+ active enemy `Effective Element = Light` units.

**Expected Resolution / Case C:**

The 4% self-Heal is suppressed for that completion.

Warrior +5 AE remains governed by the Mode Profile and is not suppressed merely by the Light count.

**Forbidden Outcomes:** CC-lost opportunity heals 4%; CC grants +5 AE; +5 AE retroactively makes Skill 3 succeed; failed Skill 3 blocks Basic; Prime rank is incorrectly required for the 3+ Light suppression; global Turn Boundary substitutes for actual-action completion; the test invents a global priority between the 4% Heal and class AE hook.

**Layers Under Test:** SSI, actual Natural Action completion, Trigger timing, Skill-3 Cost, Heal, Effective Element query, Mode AE hook.

---

## M-034 — Sanguinius Skill 2 Shield Cap / Refresh / Actual-action Duration

**ID:** `M-034`  
**Status:** `MUST_PASS`  
**Purpose:** preserve the source-specific Skill-2 Shield pool semantics, especially the distinction between refresh and the existing actual-action duration clock.

**Initial State:**

Leader Current Max HP = 1000.

Existing Sanguinius Skill-2 Shield contribution:
- remaining Shield = 800;
- duration = 1 future actually performed Sanguinius Natural Action.

All Skill-2 casts used below are otherwise legal and affordable.

**Input:**

1. Sanguinius performs Skill 2 and produces positive post-modifier Overheal that converts to 500 new Shield.
2. Sanguinius later completes one different actual Natural Action.
3. Next SSI opportunity is lost to CC with no Action.
4. Sanguinius later performs Skill 2 again, but this cast produces zero new Shield.

**Expected Resolution:**

Step 1:

```text
Shield 800 + 500
→ cap at 1000
→ positive new Shield occurred
→ whole Skill-2 Shield duration refreshes to 2 future actual Natural Actions
→ the Skill-2 cast that performed this refresh does not immediately decrement the refreshed duration
```

Step 2:

```text
one future actually performed Sanguinius Natural Action
→ duration 2 → 1
```

Step 3:

```text
CC-lost opportunity
→ duration remains 1
```

Step 4:

```text
zero new Shield
→ no refresh occurs
→ the pre-existing pool still sees this Skill-2 cast as a future actually performed Natural Action
→ duration 1 → 0 at the qualifying completion point
→ remaining Sanguinius Skill-2 Shield contribution expires
```

Other Shield sources are unaffected.

**Expected Trace / State:** positive addition and refresh are distinguishable from the duration decrement clock; the zero-Shield cast emits no refresh and therefore cannot protect the old duration from that Action's qualifying decrement.

**Forbidden Outcomes:** cap exceeds 100% Leader Current Max HP; the positive-refresh cast immediately decrements its newly refreshed duration; CC-lost opportunity decrements duration; zero new Shield refreshes duration; zero-Shield Skill-2 cast leaves the old duration unchanged merely because it was a Skill-2 cast; expiry removes unrelated Shield contributions.

**Layers Under Test:** Shield source ledger, cap, Overheal conversion, DurationSpec, actual-Natural-Action clock.

---

## M-035 — Sanguinius PRE_OVERHEAL Modifier Excludes Self-Heal

**ID:** `M-035`  
**Status:** `MUST_PASS`  
**Purpose:** prove the scoped ally-Heal modifier executes before Overheal and does not leak onto Sanguinius self-Heal.

**Initial State:**

Two active enemy units satisfy:

```text
Rank = Prime
AND
Effective Element = Light
```

so the Sanguinius ally-Heal multiplier is:

```text
0.80
```

Leader:
- Current HP = 900;
- Current Max HP = 1000.

A Sanguinius-created ally Heal has requested amount:

```text
1000
```

A separate Sanguinius self-Heal has requested amount:

```text
80
```

**Input:** resolve both Heal instances.

**Expected Resolution:**

Leader Heal:

```text
requestedHeal = 1000
→ PRE_OVERHEAL ×0.80
→ modifiedHeal = 800
→ missingHP = 100
→ actualRestore = 100
→ Overheal = 700
```

Only the post-modifier `Overheal = 700` is available to downstream Overheal conversion.

Self-Heal:

```text
requestedHeal = 80
→ recipient scope excludes SELF from the Prime-Light ally-Heal rule
→ modifiedHeal = 80
```

The Prime/Light query is an ordinary structured gameplay predicate.

No Authority adjudication occurs merely because Rank is Prime or Element is Light.

**Expected Trace / State:** modifier trace records `PRE_OVERHEAL`, qualifying enemy count 2, multiplier 0.80 for Leader, and scope miss for SELF.

**Forbidden Outcomes:** Overheal is calculated as 900 before reduction; modifier reduces only actual restored HP while preserving old Overheal; self-Heal becomes 64; Prime/Light invokes Authority; modifier retargets the Heal.

**Layers Under Test:** ScopedEffectAmountModifierSpec, valueQueries, RES-006, HEL-001, Heal Result Binding.

---

## M-036 — Sanguinius Prime-Light Damage Reduction Is Target-local Final DR

**ID:** `M-036`  
**Status:** `MUST_PASS`  
**Purpose:** prove source-target scoped Final Damage Reduction phase, target locality, Physical/Will ordering, True-Damage bypass, and the single downstream Shield boundary of the Damage Runtime.

**Initial State:**

Sanguinius produces equivalent test Damage against two enemy recipients with equal defensive stats.

Target A:
- Rank = Prime;
- Effective Element = Light.

Target B:
- does not satisfy the full Prime+Light predicate.

For both targets, before Final Damage Reduction:
- Physical component after ARM/Penetration = 80;
- Will component after RES/Penetration = 80.

Target A also receives a True component = 100 from a Sanguinius Effect.

Both targets have enough Shield to make post-FDR-before-Shield ordering observable.

**Input:** resolve Damage.

**Expected Resolution:**

Target A component amounts before Shield:

```text
Physical:
80 post-ARM
→ FINAL_DAMAGE_REDUCTION ×0.90
→ 72

Will:
80 post-RES
→ FINAL_DAMAGE_REDUCTION ×0.90
→ 72

True:
100
→ bypass FINAL_DAMAGE_REDUCTION
→ 100
```

After eligible component amounts are finalized:

```text
Physical 72
+ Will 72
+ True 100
→ proceed through the canonical Damage packet/profile Shield interaction
```

Target B component amounts before Shield:

```text
Physical 80
→ no Sanguinius Prime-Light modifier
→ 80

Will 80
→ no Sanguinius Prime-Light modifier
→ 80

→ then proceed through the canonical Shield interaction
```

The modifier is target-local.

The number of other Prime-Light enemies does not multiply Target A's own -10% rule.

**Expected Trace / State:** modifier applies only to A's Physical/Will components at `FINAL_DAMAGE_REDUCTION`; True component bypasses that phase; Shield handling occurs only after the eligible post-mitigation/post-FDR component amounts are established.

**Forbidden Outcomes:** reduction is applied before ARM/RES mitigation; reduction occurs after Shield; Shield is independently consumed once per component merely because this test lists components separately; True is reduced to 90; B is reduced because A qualifies; A receives -20% merely because two Prime-Light enemies exist; Authority adjudication is entered from Prime/Light predicates alone.

**Layers Under Test:** Scoped Effect-Amount Modifier, RES-006, DMG-005, Damage Runtime component combination, Shield boundary, Authority boundary.

---

## M-037 — Sanguinius Skill 1 Explicit Sequential Reaction Boundary

**ID:** `M-037`  
**Status:** `MUST_PASS`  
**Purpose:** prove `AFTER_DIRECT_EFFECTS_COMPLETE` defers ordinary Reactions but does not suppress mandatory lifecycle processing between Skill-1 direct components.

**Initial State:** Sanguinius Skill 1 is normalized as a sequential direct-effect group:

```text
phase 1 Physical + Will
→ mandatory lifecycle evaluation
→ if target remains legal:
     2% target Current Max HP True-Damage explosion
```

with:

```text
reactionBoundary = AFTER_DIRECT_EFFECTS_COMPLETE
```

An ordinary Reaction candidate is eligible because of phase 1.

Run two deterministic cases.

### Case A — target remains legal

Phase 1 commits and target survives required lifecycle processing.

**Expected Resolution / Case A:**

```text
phase 1 commit
→ mandatory immediate lifecycle processing
→ target still legal
→ explosion resolves/commits
→ direct Skill effects finish
→ ACTION_DIRECT_EFFECTS_COMPLETE
→ local sequential Reaction hold opens
→ ordinary Reaction becomes eligible for existing Trigger/Reaction scheduling
```

The ordinary Reaction does not resolve between phase 1 and explosion.

The test does not assert priority between that now-unheld Reaction and unrelated eligible blocking/same-window work.

### Case B — target becomes lifecycle-invalid

Phase 1 commits and mandatory lifecycle processing makes the target no longer a legal Damage recipient.

**Expected Resolution / Case B:**

```text
phase 1 commit
→ mandatory immediate lifecycle processing
→ target invalid
→ explosion skipped by target-invalid policy
→ ACTION_DIRECT_EFFECTS_COMPLETE
→ local sequential Reaction hold opens
```

Reaction deferral does not suppress or postpone the mandatory lifecycle evaluation needed to decide explosion legality.

**Expected Trace / State:** lifecycle milestones occur between direct components; ordinary Reaction does not resolve before the explicit local gate opens; post-gate priority remains governed by existing Trigger/Reaction Contracts.

**Forbidden Outcomes:** ordinary Reaction resolves between phase 1 and explosion; explosion resolves against a lifecycle-invalid target; mandatory `HP_ZERO`/death-prevention/lifecycle processing is deferred until after explosion; local gate opening is treated as a priority win over unrelated eligible work; this profile is written back as the global default for unrelated sequential Actions.

**Layers Under Test:** RES-003, Sequential Transaction, Lifecycle Runtime, TGT-006, Reaction Queue.

---

# 18. TEST GROUP N — SYNTHETIC CROSS-SYSTEM TORTURE TESTS

---

## N-001 — True Damage + Pooled Shield + Death Prevention

**ID:** `N-001`  
**Status:** `MUST_PASS`  
**Purpose:** combine three sensitive systems.  
**Initial State:** target HP=30; Standard Shield contributions A=20/B=20; Death Prevention active.  
**Input:** 100 True Damage, no Shield Piercing.  
**Expected Resolution:** 40 Shield absorbed proportionally; 60 reaches HP; Actual HP Damage capped at 30; HP_ZERO; Death Prevention resolves; no DEATH_CONFIRMED if prevention succeeds.  
**Forbidden Outcomes:** True bypasses Shield; waiting entry created before prevention.  
**Layers Under Test:** Damage, Shield, Death.

---

## N-002 — Simultaneous Four Deaths + Waiting 3/4 + Queued Revive

**ID:** `N-002`  
**Status:** `MUST_PASS`  
**Purpose:** maximum pressure on Death Cohort and race ordering.  
**Initial State:** A waiting=3/4; ordinary Revive(A) is queued but not committed.  
**Input:** simultaneous batch kills B,C,D,E.  
**Expected Resolution:** cohort size=4; A reaches/exceeds threshold and enters Reincarnation during world bookkeeping; queued Revive fails. B–E start 0.  
**Forbidden Outcomes:** Revive wins because it was enqueued earlier; cohort increments A only +1.  
**Layers Under Test:** Transaction, Luân Hồi, Reaction Queue.

---

## N-003 — Authority no-Heal + Self-Heal + Third-party Heal

**ID:** `N-003`  
**Status:** `MUST_PASS`  
**Purpose:** conflict scope with another actor.  
**Initial State:** A Quy Tắc no-Heal all; B Quy Tắc self-Heal permission wins same-tier adjudication vs A; C has normal Heal targeting B and D.  
**Input:** C attempts Heal B and D.  
**Expected Resolution:** exact semantics depend on B's normalized winning-rule scope. If B grants “B may receive Heal”, the conflict exemption can apply to C→B; if B says only “B's own self-Heal may occur”, C→B remains blocked. The authored rule must distinguish these semantics before runtime.  
**Forbidden Outcomes:** treat “self may Heal” and “may receive Heal from anyone” as identical.  
**Layers Under Test:** Terminology precision, Conflict scope.

### Architectural requirement
This test passes when the architecture can represent both variants without a new Primitive or Character-specific code.

---

## N-004 — Position Lock vs Push + AoE Snapshot

**ID:** `N-004`  
**Status:** `MUST_PASS`  
**Purpose:** Authority conflict must not corrupt area snapshot.  
**Initial State:** B has same-tier position protection; A's push conflicts and loses. A's simultaneous AoE also damages original area.  
**Input:** composite action resolves push rule + damage group.  
**Expected Resolution:** failed push does not mutate B Position; AoE uses declared snapshot/geometry and damages accordingly.  
**Forbidden Outcomes:** transient failed movement changes AoE target list.  
**Layers Under Test:** Authority, Position, Snapshot.

---

## N-005 — Pygmalion Puppet + Authority + Attribution

**ID:** `N-005`  
**Status:** `MUST_PASS`  
**Purpose:** three-source identity separation.  
**Initial State:** Puppet P hosts X, inherited Combat Definition Y with a Quy Tắc child effect; Pygmalion Ultimate schedules it; Damage Attribution=Pygmalion.  
**Input:** inherited rule conflicts with enemy same-tier rule.  
**Expected Resolution:** Authority comparator uses explicitly declared Adjudication Owner; behavior uses Y; damage credit uses Pygmalion.  
**Forbidden Outcomes:** one generic `source` field used for all three.  
**Layers Under Test:** Identity, Authority, Attribution.

---

## N-006 — Forgotten + Position Mark + Forced Movement

**ID:** `N-006`  
**Status:** `MUST_PASS`  
**Purpose:** entity state vs position state.  
**Initial State:** Forgotten actor stands on Position Mark.  
**Input:** valid forced movement moves actor to new slot.  
**Expected Resolution:** Forgotten state follows entity; Position Mark stays on original slot; actor remains excluded from direct target pool according to state.  
**Forbidden Outcomes:** Position Mark moves with actor; Forgotten remains attached to old slot.  
**Layers Under Test:** State attachment, Position.

---

## N-007 — Exact Authority Tie in Simultaneous Opposite Movement

**ID:** `N-007`  
**Status:** `MUST_PASS`  
**Purpose:** NO_OVERRIDE without status quo owner.  
**Initial State:** two simultaneous same-tier rules of exactly equal adjudication profile force B left vs right.  
**Input:** same conflict window.  
**Expected Resolution:** overlapping contradictory Position mutation does not commit; B retains current position.  
**Forbidden Outcomes:** eventSeq or caster slot chooses direction.  
**Layers Under Test:** Authority, Transaction.

---

## N-008 — Distributed Cost Snapshot Is Before Any Payment Commit

**ID:** `N-008`  
**Status:** `MUST_PASS`  
**Purpose:** attack the exact Cost transaction boundary where required payment could otherwise mutate optional payer membership.

**Initial State:**

A normalized generic CostGroup has:

- one required HP Cost paid by entity A;
- one optional distributed HP Cost whose payer collection is:
  `all allied eligible entities with Current HP >= 60% Current Max HP`;
- A and B both qualify at the pre-payment state.

A:
- Current HP = 65% Max HP;
- required HP Cost = 10% Max HP.

B:
- Current HP = 70% Max HP.

Optional per-payer HP Cost = 10% own Max HP.

No cross-payer order-dependent rule exists.

**Input:** execute the CostGroup.

**Expected Resolution:**

Before any payment commit:

```text
validate required Cost
→ snapshot optional payer set = {A, B}
```

Then:

```text
commit A required HP Cost
→ A falls from 65% to 55%
```

This state change does not remove A from the already-frozen optional payer set.

Both frozen members still receive one optional payment attempt.

Every frozen attempt produces one terminal member `COST_PAYMENT_RESULT`.

The CostGroup result is built only after both terminal outcomes exist.

### Metamorphic replay

Execute the same frozen payer set using two different stable technical iteration orders:

```text
A then B
```

and:

```text
B then A
```

With no authored cross-payer dependency:

> member outcomes, `TOTAL_ACTUAL_PAID(HP)`, final gameplay state and Ability continuation are identical.

Technical iteration order may differ in trace formatting only.

**Expected Trace / State:** `optionalPayerSnapshot` state version precedes the first payment commit; frozen membership is stable; no entity/Slot/list order appears as gameplay priority.

**Forbidden Outcomes:** snapshot after A required payment; A disappears from optional set after falling below 60%; payer B result changes merely because A was iterated first; entity ID/Slot order becomes gameplay semantics.

**Layers Under Test:** CostGroupSpec, CST-008, Transaction Manager, Snapshot boundary, deterministic trace, Cost Result aggregation.

---

## N-009 — Interposition Settlement Failure Policies Are Explicit

**ID:** `N-009`  
**Status:** `MUST_PASS`  
**Purpose:** prove `CONTINUE` and `FAIL_INTENT` are real runtime semantics at both Action-Intent interposition anchors, and that post-cost failure does not invent a refund.

Run four deterministic cases using otherwise-valid generic normalized data.

### Case A — PRE_ADMISSION_PRE_COST + CONTINUE

**Initial State:** original Action Intent is preservable; declared pre-admission settlement reaches terminal failure; original Action would pass revalidation after that failure.

**Expected Resolution:**

```text
Action Intent
→ PRE_ADMISSION_PRE_COST settlement
→ terminal settlement failure
→ settlementFailurePolicy = CONTINUE
→ preserve original Intent
→ run declared revalidation
→ original Intent may be admitted normally
```

The failed settlement produces no successful settlement Effect.

The original unadmitted Action pays no Cost until/if it is later admitted and reaches its own Cost stage.

### Case B — PRE_ADMISSION_PRE_COST + FAIL_INTENT

**Expected Resolution:**

```text
Action Intent
→ pre-admission settlement terminal failure
→ settlementFailurePolicy = FAIL_INTENT
→ enclosing Intent path terminates
```

The original Action is not admitted.

Its Cost is not paid merely because it was requested.

No hidden fallback is invented.

### Case C — POST_COST_PRE_EFFECT + CONTINUE

**Initial State:** original Action is admitted; its complete active Cost transaction commits and all Cost Result Bindings are stored; declared post-cost settlement then reaches terminal failure.

**Expected Resolution:**

```text
complete active Cost transaction
→ ACTION_BEGIN
→ POST_COST_PRE_EFFECT settlement failure
→ settlementFailurePolicy = CONTINUE
→ original direct Effects proceed
```

Committed Cost-payment results remain immutable.

### Case D — POST_COST_PRE_EFFECT + FAIL_INTENT

**Expected Resolution:**

```text
complete active Cost transaction
→ ACTION_BEGIN
→ POST_COST_PRE_EFFECT settlement failure
→ settlementFailurePolicy = FAIL_INTENT
→ original direct Effects do not begin
→ existing Action failure/termination bookkeeping continues
```

Already-committed Cost is **not automatically refunded**.

Committed singular/group Cost-payment results remain immutable transaction history.

Any refund requires its own explicit refund Contract/policy.

**Expected Trace / State:** terminal settlement outcome and failure policy are separately traceable; pre-admission failure can stop before Action admission; post-cost failure can stop direct Effects without rewriting/refunding committed Cost by implication.

**Forbidden Outcomes:** all settlement failures always cancel; all settlement failures always continue; PRE `FAIL_INTENT` still admits original Action; PRE failure pays original Action Cost before admission; POST `CONTINUE` suppresses direct Effects; POST `FAIL_INTENT` automatically refunds Cost; post-cost failure rewrites `actualPaidAmount`; implementation/list order chooses failure behavior.

**Layers Under Test:** ACT-005, ActionIntentRuntime, Action execution pipeline, settlementFailurePolicy, CST-005 refund boundary, Cost Result immutability.

---

# 19. ARCHITECTURE META-TESTS

---

## META-001 — No Character-specific Runtime Branch

**Status:** `MUST_PASS`

For all current character-derived tests, implementation design must not require:

```text
if characterId == ...
```

Character-specific data/profile references are allowed.

Character-specific runtime source-code branches are not.

---

## META-002 — No New Tag Needed for Current Suite

**Status:** `MUST_PASS`

The current suite should be representable with existing Tag Registry plus Schema/System metadata.

If a test appears to require a new Tag:
1. inspect whether it is a Schema facet;
2. inspect whether an existing Tag already covers semantic;
3. only then propose Tag.

---

## META-003 — No New Primitive Needed for Current Suite

**Status:** `MUST_PASS EXPECTATION`

The suite intentionally uses the current Primitive Registry.

If one test truly cannot compose:
> classify exact missing operation and run Primitive Acceptance Test.

Do not automatically add a Character-named Primitive.

---

## META-004 — Unresolved Must Stay Unresolved

**Status:** `MUST_PASS`

Tests marked `PROBE_UNRESOLVED` pass only if:
- validation/runtime exposes the missing Contract;
- no hidden fallback decides gameplay.

---

## META-005 — Mode Isolation

**Status:** `MUST_PASS`

Turn-based stress tests must not force:
- SSI;
- Luân Hồi;
into Exploration profile.

Exploration gaps do not invalidate the turn-based architecture.

---

# 20. GOLDEN TRACE REQUIREMENTS

When executable Kernel tests exist, at minimum create Golden Traces for:

1. `C-004` shared-snapshot AoE.
2. `D-003` True + Physical + Final DR + Shield.
3. `D-004` pooled Shield proportional depletion.
4. `E-007` older waiting entry + simultaneous cohort.
5. `E-010` Revive/Reincarnation race.
6. `F-008` conflict-scope-only Authority.
7. `F-009` persistent Authority cache reuse.
8. `G-001` Pygmalion multiple Puppets.
9. `G-011` inhabited Puppet ordinary Revive.
10. `M-004` Ký Ức Skill 2 echo.
11. `M-010` preserve-child Authority composite.
12. `M-011` inherit-outer Authority composite.
13. `M-012` Story property capability source.
14. `N-005` Puppet Behavior/Adjudication/Damage source split.
15. `M-021` root Ultimate / child Skill Action-lineage memory.
16. `M-022` same-root Effect provenance + one-layer repeat recursion guard.
17. `M-024` read-only Natural-Action form fallback.
18. `M-026` root-linked blocking settlement + failed Cost + post-completion class AE regen.
19. `M-030` high-zone branch freeze + distributed Skill-2 Cost transaction: payer snapshot → required commit crossing HP to 30% → every optional terminal result → CostGroup aggregate → post-cost Skill-3 settlement without branch switch/revalidation.
20. `M-031` failed low-zone Skill-3 settlement → Ultimate HP-floor Cost result → actual-paid blood arrow + simultaneous slash, including the successful-zero-payment case.
21. `M-032` one preserved low-zone Action Intent → Skill-3 settlement → same-Intent revalidation → explicit Basic fallback without a second `ACTION_INTENT_CREATED`.
22. `M-037` sequential phase-1 commit → mandatory lifecycle → explosion/skip → `ACTION_DIRECT_EFFECTS_COMPLETE` local Reaction-gate opening.
23. `N-008` distributed payer-set freeze before any payment commit and gameplay-equivalent replay under permuted technical payer iteration.
24. `N-009` explicit interposition settlement-failure traces for PRE/POST `CONTINUE` and `FAIL_INTENT`, including post-cost no-auto-refund behavior.

---

# 21. GOLDEN TRACE SHAPE

A Golden Trace should verify semantic milestones rather than every implementation-internal line.

Example for Death Cohort:

```text
ACTION_BEGIN
SIMULTANEOUS_BATCH_BEGIN
DAMAGE_COMMIT(B,C,D,E)
HP_ZERO(B,C,D,E)
DEATH_CONFIRMED(B,C,D,E)
DEATH_COHORT_CREATED(size=4)
REINCARNATION_WAITING_ADVANCE(A,+4)
ENTER_REINCARNATION(A)
WAITING_CREATED(B,0)
WAITING_CREATED(C,0)
WAITING_CREATED(D,0)
WAITING_CREATED(E,0)
REACTION_QUEUE_RELEASE
ACTION_COMPLETED
```

Internal storage operations may evolve without breaking Golden Trace if semantic milestones remain equivalent.

---

# 22. PROPERTY-BASED INVARIANTS

Future automated test harness should generate many states and assert:

## Damage / Shield
- `actualHpDamage >= 0`
- `actualHpDamage <= targetHPBeforeCommit`
- `shieldAbsorbed >= 0`
- Shield absorption is never included in Actual HP Damage
- Overkill is never included in Actual HP Damage
- Standard Shield total equals authoritative contribution ledger sum within fixed-point precision
- no Standard Shield contribution becomes negative

## Identity / Lifecycle
- an active True Self cannot simultaneously be ordinary waiting for same life
- Reincarnation state invalidates ordinary Revive of old life
- ordinary Revive preserves lifeSerial unless explicit override
- new life increments lifeSerial
- same Death Cohort members never advance one another

## Pygmalion
- one Puppet hosts at most one True Self
- one True Self cannot be active in two Puppets simultaneously
- old Puppets do not consume new Life Cycle creation quota
- Puppet does not match SUMMON-only filter by default

## Authority
- different tiers never enter progression comparator
- exact same-tier comparator follows Rank→Tu vi→Stars→Awaken→CP
- exact total tie never invokes RNG
- conflict suppression never extends outside overlap scope
- unrelated rules are never adjudicated

## SSI
- non-natural child actions do not advance Side pointer by default
- global Turn Boundary does not reset all actor personal windows
- CC-consumed opportunity advances appropriate personal clocks

## Action lineage / Effect provenance
- an Effect's provenance is immutable for that execution instance
- two Effects sharing one `rootActionId` are not required to share `originEffectId`
- Damage Attribution equality never implies Effect-provenance equality
- a provenance-excluded repeat/reflect/echo Effect never recursively requalifies solely because Actor/root/Damage Attribution are unchanged

## Natural Action form resolution
- probing an unselected Action-form candidate never changes authoritative State
- candidate probing never commits Cost, consumes Rage, starts cooldown, emits gameplay Events, locks RNG-selected targets, or advances RNG
- exactly one selected candidate enters ordinary Action execution
- explicit Character/System Action-form restriction overrides Mode default priority where their scopes overlap
- selected form restriction never changes `naturalActionStatus = NATURAL` into `FORCED_ACTION`

## Root completion dependencies
- a normalized completion-dependency graph is acyclic
- root `ACTION_COMPLETED` never emits while a declared blocking dependency is nonterminal
- `FAILED_COST`, `FAILED_CONDITION`, valid cancellation and successful resolution all close a dependency according to Contract
- a failed blocking settlement cannot deadlock its root Action
- local dependency order does not imply global unrelated Reaction priority

## Scoped Effect Admission
- an Effect Admission rule never applies outside its declared semantic scope
- absence of a matching admission rule yields ordinary pass-through behavior
- a Shield-only admission rule never blocks direct Damage
- an Authority threshold predicate does not enter progression adjudication unless a direct rule conflict actually exists

## Mode resource hooks
- Class AE regeneration occurs only after an actually performed Natural Action reaches `ACTION_COMPLETED`
- non-Natural Actions never receive `AE_ACTION_REGEN_BY_CLASS`
- CC-consumed opportunity without Action grants zero class AE
- AE generated by a Natural Action cannot fund a blocking settlement that must resolve before that same Action completes
## Distributed Cost / Cost-payment results
- every optional payer collection snapshot used by one Cost transaction precedes every payment commit in that transaction
- required Cost mutation never changes membership of an already-frozen optional payer collection
- every frozen optional payer produces exactly one terminal member payment result
- `CONTRIBUTION_ZERO_CONTINUE` optional failure never fails the whole Ability by itself
- `actualPaidAmount = 0` does not determine `success`; both successful-zero and failed-zero outcomes remain representable
- `COST_PAYMENT_REF` resolves to exactly one singular payment result
- distributed member results are never collapsed into one ambiguous singular binding
- `TOTAL_ACTUAL_PAID(kind)` equals the sum of authoritative member `actualPaidAmount` for that kind
- later HP/Heal/Damage/MaxHP/resource mutations never rewrite committed Cost-payment results
- permuting a purely technical optional-payer iteration order does not change member outcomes, aggregates, final gameplay state or Ability continuation when no authored order-dependent rule exists

## Action Intent interposition
- Action Intent creation alone never commits Cost or Effects
- branch selection is frozen from `ACTION_INTENT_CREATED` and does not change after settlement mutation
- pre-admission interposition may settle before ordinary rejection when declared
- revalidation tests the same preserved original Intent
- explicit fallback remains inside the same `naturalActionOpportunityRef`
- fallback never creates a second `ACTION_INTENT_CREATED` cycle
- fallback never reruns already-frozen interposition selection merely because the effective candidate changed
- ambiguous matching branches/interposition instances are rejected rather than ordered by list/Event/entity/Character ID
- `POST_COST_PRE_EFFECT` never begins until the entire active Cost transaction, including distributed optional attempts and declared CostGroup results, is terminal

## Interposition settlement failure policy
- a terminal interposition settlement failure is not self-interpreting; runtime must apply the authored `CONTINUE` or `FAIL_INTENT` policy
- PRE `CONTINUE` preserves the original Intent and proceeds to declared revalidation/admission logic
- PRE `FAIL_INTENT` terminates before original Action admission and cannot spend that unadmitted Action's Cost
- POST `CONTINUE` allows the already-admitted original Action to proceed to direct Effects
- POST `FAIL_INTENT` prevents original direct Effects from beginning after the settlement failure
- POST `FAIL_INTENT` never implies automatic refund of already-committed Cost
- no interposition failure may retroactively rewrite committed singular/group Cost-payment results

## Scoped Effect-amount modifiers
- a modifier never applies outside its declared source, recipient, Effect, component and resolution-phase scope
- modifier `valueQueries` are read-only: they never mutate State, pay Cost, emit Effects, request Actions, alter TargetSets or consume RNG
- unless an explicit earlier Snapshot is referenced, a valueQuery observes authoritative state at its declared resolution phase
- permuting authoring/list order of matching `MULTIPLY` modifiers does not change the combined phase factor or gameplay result
- `PRE_OVERHEAL` modifies Heal before actual restoration and Overheal derivation
- an ally-only Heal modifier with `exclude SELF` never modifies self-Heal
- `FINAL_DAMAGE_REDUCTION` is target-local
- Physical Final Damage Reduction occurs after ARM/Penetration and before the shared downstream Shield boundary
- Will Final Damage Reduction occurs after RES/Penetration and before the shared downstream Shield boundary
- True Damage never enters ordinary `FINAL_DAMAGE_REDUCTION`
- Rank/Element predicates alone never invoke Authority adjudication

## Explicit sequential Reaction boundary
- under `AFTER_DIRECT_EFFECTS_COMPLETE`, ordinary Reactions never resolve between declared direct sequential components
- mandatory immediate lifecycle processing still occurs between sequential direct components when required
- lifecycle invalidation can skip a later component even while ordinary Reactions remain locally held
- opening the local gate at `ACTION_DIRECT_EFFECTS_COMPLETE` does not define priority against unrelated root-linked blocking settlements or same-window Reactions
- an omitted reactionBoundary never silently inherits `AFTER_DIRECT_EFFECTS_COMPLETE`
- legacy `QUEUE_UNTIL_ACTION_COMPLETE` is never silently aliased to `AFTER_DIRECT_EFFECTS_COMPLETE`

---

# 23. FUZZING TARGETS

Randomized stress generation should emphasize interaction combinations:

```text
Damage
× Shield
× HP Cost/HP Loss
× Death Prevention
× Revive
× Reincarnation
× Position
× Target Exclusion
× Authority
× Follow-up/Counter
× State duration
× Action lineage
× Effect provenance
× Action-form fallback
× scoped Effect Admission
× root completion dependency
× post-Natural-Action AE regeneration
× Action Intent interposition
× interposition settlement failure policy
× distributed CostGroup
× typed Cost-payment Result Binding
× scoped Effect-amount modifiers
× explicit sequential Reaction boundary
```

Look for:

- infinite trigger loops;
- duplicated deaths;
- duplicate kill credit;
- negative HP/Shield;
- Revive after already Reincarnated;
- two True Selves in one Puppet;
- one True Self in two bodies;
- target reroll without policy;
- non-natural Action advancing SSI;
- cache result surviving adjudication revision;
- source provenance disappearing;
- same-root Effect provenance collapsing into one identity;
- repeat/reflect/echo recursion caused by checking only Actor/root/Damage Attribution;
- rejected Action-form candidates spending Cost or consuming Rage;
- candidate probing advancing RNG or locking targets;
- explicit Character restriction being bypassed by Mode auto-Ultimate priority;
- completion dependency cycle/deadlock;
- failed-cost blocking settlement never reaching terminal state;
- root `ACTION_COMPLETED` emitted before declared blocking settlements;
- same-action class AE regen self-funding a pre-completion settlement;
- Effect Admission leaking outside declared semantic scope;
- Authority threshold incorrectly invoking progression comparator without direct conflict;
- optional payer collection being sampled after any payment commit;
- frozen payer membership changing because required Cost mutated authoritative state;
- optional payer failure incorrectly failing the whole Ability;
- successful zero payment being rewritten as failure;
- distributed member payment results collapsing into one singular result;
- downstream Effect reconstructing nominal Cost instead of using committed `actualPaidAmount`;
- CostGroup becoming terminal before all frozen optional payer attempts and aggregates are terminal;
- `POST_COST_PRE_EFFECT` running after only the required Cost subset;
- low-zone Action Intent being discarded before its declared interposition settlement;
- fallback creating a second Action Intent or rerunning frozen interposition selection;
- ambiguous interposition multiplicity resolved by list/Event/entity/Character-ID order;
- PRE settlement failure ignoring `CONTINUE`/`FAIL_INTENT`;
- PRE `FAIL_INTENT` admitting or charging the original unadmitted Action;
- POST `CONTINUE` incorrectly suppressing direct Effects;
- POST `FAIL_INTENT` incorrectly allowing direct Effects or automatically refunding committed Cost;
- post-cost settlement failure rewriting committed Cost-payment results;
- scoped modifier `valueQuery` mutating state or consuming RNG;
- modifier ordering changing output when only `MULTIPLY` operations are legal;
- PRE_OVERHEAL modifier being applied after Overheal derivation;
- target-local Final Damage Reduction leaking onto unrelated targets;
- per-component test bookkeeping accidentally causing multiple Shield passes where the Damage Runtime defines one downstream Shield boundary;
- True Damage entering ordinary Final Damage Reduction;
- ordinary Reaction resolving between sequential components under `AFTER_DIRECT_EFFECTS_COMPLETE`;
- mandatory lifecycle processing being accidentally held together with ordinary Reactions;
- local Reaction-gate opening being interpreted as global scheduler priority;
- legacy `QUEUE_UNTIL_ACTION_COMPLETE` being silently aliased to `AFTER_DIRECT_EFFECTS_COMPLETE`.

---

# 24. TEST EXECUTION ORDER BEFORE 200+ KIT MIGRATION

Recommended architecture-validation order:

## Pre-Gate — Validation / Normalization

Run:
- K group.

If invalid authored/normalized data is accepted:
> stop before runtime integration testing.

In particular, ambiguous Action-lineage queries, cyclic completion dependencies, nondeterministic Action-form selectors and unscoped Effect Admission must be rejected before battle execution.

## Gate 1 — Core
Run:
- A group;
- B group;
- C group;
- D group.

If these fail:
> do not normalize hard characters yet.

## Gate 2 — Lifecycle
Run:
- E group;
- H group.

If death/identity fails:
> stop before Pygmalion.

## Gate 3 — Authority
Run:
- F group.

Authority subsystem must pass before normalizing many Pháp Tắc/Quy Tắc/Axiom kits.

## Gate 4 — Pygmalion
Run:
- G group.

If Pygmalion requires bespoke runtime:
> architecture not ready.

## Gate 5 — Narrative
Run:
- I group and M-012.

Unresolved narrative timing tests may remain intentionally blocked.

## Gate 6 — Integration
Run:
- J group according to each test's declared status;
- M group;
- N group.

`FUTURE_MODE_PROBE` remains a probe and is not converted into a hidden default merely to make Gate 6 green.

Only after integration passes:
> begin bulk roster normalization.

---

# 25. WHAT COUNTS AS A BAD ARCHITECTURE SIGNAL

Do not judge architecture only by whether a test can be made to pass somehow.

Strong warning signals:

## Signal 1 — New Tags grow with every test
Likely Tag Registry is being used as pseudo-code.

## Signal 2 — Primitive count grows nearly one-for-one with characters
Likely missing reusable domain abstraction.

## Signal 3 — Many tests require Character-specific Contracts
Likely shared Contract boundaries are poor.

## Signal 4 — Many tests need arbitrary effect ordering fields
Likely state transition model lacks a proper subsystem.

## Signal 5 — Result changes when list/Dictionary iteration order changes
Kernel is not semantically deterministic.

## Signal 6 — Trace cannot explain a result without reading Character code
Data-driven boundary failed.

## Signal 7 — Mode-specific exceptions appear inside shared Damage/Death code
Mode Profile boundary failed.

---

# 26. WHAT COUNTS AS A HEALTHY EVOLUTION

Adding a new primitive/tag/contract later is **not automatically failure**.

Healthy evolution means:

- a new mechanic exposes a genuinely new semantic;
- existing layers cannot represent it without distortion;
- the new abstraction is reusable beyond one character;
- old tests remain valid;
- migration impact is narrow and explicit.

The goal is not “never change architecture”.

The goal is:

> **make every architecture change evidence-driven.**

---

# 27. NEW KIT STRESS-TEST WORKFLOW

When a new kit is submitted after this stage:

```text
1. normalize prose into canonical semantic clauses
2. identify unresolved wording
3. map to existing Tags
4. map to Ability Schema
5. derive Primitive composition
6. identify applicable Contracts
7. dry-run expected Kernel trace
8. compare against relevant tests in this file
9. add a new stress test only if kit exposes a genuinely new interaction class
10. produce manual patch list for user
```

Do not add one test for every ordinary Skill.

Add tests for new **interaction classes**.

---

# 28. MANUAL PATCH OUTPUT FOR FUTURE CHATS

Because the user maintains canonical files manually, future analysis should prefer compact patch output.

Example:

```text
ARCHITECTURE IMPACT

01_TERMINOLOGY_vNext.md
- No change.

02_TAG_vNext.md
- No change.

03_PRIMITIVE.md
- No change.

04_ABILITY_SCHEMA.md
- Section X: add field ...

05_CONTRACTS.md
- Add Contract ABC-123 ...

06_KERNEL_RUNTIME.md
- No change.

08_STRESS_TESTS.md
- Add Test NEW-001 because this kit introduces ...
```

The user decides when to copy changes into master files.

---

# 29. TEST SUITE COVERAGE SUMMARY

Current suite defines:

- 5 basic semantic tests;
- 8 SSI/clock tests;
- 8 target/snapshot tests;
- 17 damage/shield/heal/HP tests;
- 12 death/revive/reincarnation tests;
- 16 Authority tests;
- 12 Pygmalion tests;
- 4 Arena tests;
- 7 Narrative/capability tests;
- 7 Mode tests;
- 14 anti-scripting/validation tests;
- 7 unresolved Contract probes;
- 37 character-derived integration tests;
- 9 cross-system torture tests;
- 5 meta-tests.

Total named test cases:

168 tests / probes / meta-tests

The count is not a design target.

Coverage quality matters more than count.

---

# 30. CURRENT EXPECTED RESULT

At architecture level, the expected result is:

## Should pass with current canon
- core Damage/Heal/Shield;
- SSI distinctions;
- Target Exclusion vs AoE;
- simultaneous snapshot;
- HP Cost/HP Loss;
- Death Prevention/Revive/Reincarnation distinctions;
- Death Cohort;
- same-tier Authority adjudication;
- Pygmalion multiple-Puppet/inheritance/revive;
- Arena identity/world-death integration;
- capability provenance.
- Combat-Instance-keyed Field Presence and cause-neutral Enter/Leave Field semantics;
- Deck membership vs current deployability;
- atomic Deck Deployment Cost/full-Rage transaction without Ultimate autocast;
- post-commit Position Mutation observation with one Event per committed atomic group;
- deterministic `eventSeq` without treating trace order as gameplay priority;
- reusable side-relative spatial direction resolution;
- Target Lock vs Hit Admission separation;
- Guaranteed Hit bypassing ordinary Miss/Dodge/Evasion without bypassing lifecycle or Authority.
- explicit immediate/parent/root Action-lineage queries without collapsing child identity into root identity;
- immutable Effect provenance sufficient to distinguish same-root original Damage from generated repeat/echo Damage;
- provenance-based one-layer repeat filtering without Character-specific runtime branches;
- declarative Natural-Action form restriction and ordered read-only fallback;
- Character Action-form restrictions overriding Turn-based default full-Rage Ultimate priority when applicable;
- scoped non-State Effect Admission such as Authority-gated Shield admission without creating global Damage immunity;
- root-linked blocking settlements delaying `ACTION_COMPLETED` through a bounded local dependency DAG;
- failed-cost blocking settlements becoming terminal without deadlocking the root Action;
- Echo-local Skill 3 → Skill 1 ordering without resolving global unrelated Reaction priority;
- Turn-based `AE_ACTION_REGEN_BY_CLASS` only after actual Natural Action completion;
- CC-lost opportunities granting no class AE and not advancing actual-action-only Echo windows.

- bounded Action Intent / Request remains distinct from admitted Action and supports canonical `PRE_ADMISSION_PRE_COST` / `POST_COST_PRE_EFFECT` interposition without arbitrary callbacks;
- low-zone preserved Intent may settle, revalidate the same request, and select only explicitly-authored fallback inside the same SSI Natural Action opportunity;
- fallback does not create a second `ACTION_INTENT_CREATED` cycle or rerun frozen interposition selection;
- ambiguous multiple interposition matches are rejected instead of receiving hidden list/Event/entity-order priority;
- interposition settlement failure obeys explicit `CONTINUE` / `FAIL_INTENT`; PRE failure cannot spend an unadmitted original Action's Cost, and POST `FAIL_INTENT` does not imply automatic refund of already-committed Cost;
- dynamic optional payer collections are frozen after required validation and before any payment commit;
- required Cost mutation cannot retroactively change frozen payer membership;
- optional distributed payer failure can contribute zero while the Ability continues;
- successful zero payment remains distinct from failed zero payment;
- singular and CostGroup payment results preserve committed `actualPaidAmount`, and downstream Effects can consume that immutable result;
- distributed CostGroup remains nonterminal until every frozen optional payer attempt and declared aggregate is terminal;
- scoped Effect-amount modifiers remain bounded by source/recipient/effect/component/query/phase and current `MULTIPLY` semantics are order-independent;
- PRE_OVERHEAL modifiers execute before Overheal derivation and can exclude self by recipient scope;
- target-local FINAL_DAMAGE_REDUCTION applies to Physical/Will after ARM/RES mitigation and before the downstream Shield boundary while True Damage bypasses the phase;
- explicit `AFTER_DIRECT_EFFECTS_COMPLETE` can defer ordinary Reactions across one sequential direct-effect chain without suppressing mandatory lifecycle processing;
- opening that local Reaction gate does not establish global priority against unrelated Reactions or root-linked blocking settlements;
- legacy `QUEUE_UNTIL_ACTION_COMPLETE` is not silently equivalent to `AFTER_DIRECT_EFFECTS_COMPLETE`;
- Sanguinius distributed Skill-2 Cost, two-zone Skill-3 ordering/revalidation/fallback, Skill-2 Shield clock, Prime-Light scoped modifiers, Skill-1 sequential profile and Ultimate actual-paid result all compose without Character-specific runtime branches.

## Should intentionally remain blocked
- global unrelated Reaction priority;
- default sequential-hit Reaction boundary;
- battle terminal ordinary queue cutoff;
- MaxHP threshold reference under mid-Action MaxHP mutation when omitted;
- full-slot materialization fallback;
- invalid Duy Nhất fallback;
- final Narrative cadence/formula/delay details;
- Exploration AE ownership and real-time scheduler.

A future model must not “fix” the second group by guessing.

---

# 31. BULK ROSTER GO / NO-GO RULE

Do not normalize all 200+ kits merely because this Markdown exists.

`GO` requires:

1. current `MUST_PASS` architecture tests can be represented without new Character-specific code;
2. all `MUST_REJECT` cases are rejected by validation design;
3. `PROBE_UNRESOLVED` cases remain explicitly blocked;
4. the first 10–20 real hard kits do not cause uncontrolled Tag/Primitive growth;
5. semantic trace remains inspectable.

If one of these fails significantly:

> **NO-GO — repair the architecture before bulk migration.**

---

# 32. FINAL STRESS-TEST CHECKSUM

A future model understands Chặng I only if it knows:

1. Stress tests validate architecture, not just finished code.
2. Passing does not mean “produce any result”.
3. Some tests pass by rejecting ambiguous data.
4. Some tests pass by preserving an unresolved Contract.
5. Character-derived tests and synthetic torture tests both matter.
6. Existing composition should be tried before adding Tags/Primitives.
7. Simultaneous and sequential mechanics must produce different traces where semantics differ.
8. Authority compares exact conflicting Rule clauses, not whole Characters/Skills.
9. Shield is one Standard pool for absorption but retains source ledger.
10. Death Cohort groups simultaneous deaths without making them count one another.
11. Older waiting entries advance by number of qualifying deaths in a later cohort.
12. ordinary Revive preserves lifeSerial by default.
13. Pygmalion remains a major architecture gate.
14. Narrative capability source provenance must survive transfer/removal.
15. Mode validation must reject automatic turn-to-real-time translation.
16. No hidden fallback is allowed merely to make a test green.
17. Bulk roster work starts only after integration stress tests stop exposing foundational flaws.
18. Field Presence is Combat-Instance-keyed; `DEATH_CONFIRMED` does not automatically mean `LEAVE_FIELD`.
19. Deck membership does not automatically mean currently deployable.
20. Successful Deck deployment can fill Rage without auto-casting Ultimate.
21. One committed atomic Position Mutation group exposes one post-commit semantic Event; multiple sequential commits remain separate.
22. Deterministic Event sequence is trace order, not hidden global Reaction priority.
23. Target Lock and Guaranteed Hit are independent; Guaranteed Hit bypasses only ordinary Miss/Dodge/Evasion and does not bypass lifecycle or Authority.
24. Side-relative directions resolve through the active Spatial Profile, not screen/camera orientation.
25. Action lineage and Effect provenance are independent query axes; same root Action does not imply same generating Effect.
26. Repeat/echo/reflect recursion guards must use sufficient provenance and must not rely only on Character identity, Damage Attribution, or `rootActionId`.
27. An SSI-granted Natural Action may be constrained by declarative Action-form law without becoming a Forced Action.
28. Ordered fallback candidate probing is read-only; rejected candidates cannot spend Cost, consume Rage, mutate State, consume RNG, or emit gameplay Events.
29. Turn-based full-Rage Ultimate priority is a Mode default at the actual Natural Action, not an immediate cast event and not an override over explicit Character Action-form restrictions.
30. Scoped Effect Admission applies only when a matching admission/protection rule exists; a Shield-only rule is not global Damage immunity.
31. A simple incoming-Authority threshold is an admission predicate, not automatically same-tier progression adjudication.
32. Root-linked blocking settlements may delay one root Action's `ACTION_COMPLETED`, but their local dependency DAG does not define global unrelated Reaction priority.
33. A failed blocking settlement must reach a terminal state and cannot deadlock its root Action.
34. `AE_ACTION_REGEN_BY_CLASS` belongs to the Turn-based Mode Profile and occurs only after an actually performed Natural Action reaches `ACTION_COMPLETED`.
35. AE generated by a Natural Action cannot retroactively fund blocking settlements that had to resolve before that same Action completed.
36. Actor-specific windows based on actually performed Natural Actions do not advance merely because SSI consumed a CC-lost opportunity.
37. Action Intent / Request is testably distinct from an admitted Action; a declared pre-admission interposition may settle before the original request is revalidated.
38. Interposition branch selection is frozen for one Intent, and ambiguous multiplicity must be rejected rather than resolved by incidental ordering.
39. Explicit fallback after failed revalidation stays inside the same SSI Natural Action opportunity and does not create a second `ACTION_INTENT_CREATED` cycle.
40. Optional distributed payer collections are frozen before any payment commit; later required Cost mutation cannot change their membership.
41. Every frozen distributed payer receives one terminal payment result, and optional failure under `CONTRIBUTION_ZERO_CONTINUE` does not fail the whole Ability.
42. `actualPaidAmount = 0` does not imply payment failure; successful-zero and failed-zero outcomes are semantically distinct.
43. Downstream Effects that depend on Cost payment use immutable committed payment results or typed CostGroup aggregates, never reconstructed nominal Cost.
44. `POST_COST_PRE_EFFECT` waits for the complete distributed Cost transaction, including all optional terminal results and CostGroup aggregate construction.
45. Scoped Effect-amount modifiers are bounded read-only rules; current `MULTIPLY` factors do not acquire priority from authoring/Event/entity iteration order.
46. PRE_OVERHEAL modifies Heal before actual restoration/Overheal, while FINAL_DAMAGE_REDUCTION modifies qualifying Physical/Will after mitigation and before the downstream Shield boundary; True bypasses that phase.
47. `AFTER_DIRECT_EFFECTS_COMPLETE` holds ordinary Reactions across the local direct sequential chain but never suppresses mandatory immediate lifecycle processing.
48. A local Reaction-gate opening is not a global priority rule, and legacy `QUEUE_UNTIL_ACTION_COMPLETE` must not be silently aliased to `AFTER_DIRECT_EFFECTS_COMPLETE`.
49. Interposition settlement failure is resolved only by explicit `CONTINUE` / `FAIL_INTENT`; PRE `FAIL_INTENT` stops before admission, while POST `FAIL_INTENT` stops direct Effects without automatically refunding or rewriting committed Cost.

---

# 33. NEXT PROJECT STEP AFTER CHẶNG I

There is no need to create another architecture layer immediately.

The next productive phase is:

> **Architecture Validation / Pilot Normalization**

Recommended:
- choose 10–20 representative real kits;
- normalize them using current files;
- add only genuinely new interaction-class tests;
- repair architecture if repeated failure patterns appear.

Only after this pilot should the project declare a practical **v1 architecture freeze** and begin bulk-normalizing the remaining roster.
