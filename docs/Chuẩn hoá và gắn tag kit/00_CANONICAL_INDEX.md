# ARCLUNE — CANONICAL INDEX / NEW-CHAT HANDOFF
## Điểm vào duy nhất cho các chat tiếp theo

**Version:** 2026-09-10-INDEX-2
**Status:** CANONICAL HANDOFF INDEX  
**Purpose:** cho model mới biết phải đọc gì, tin gì, bỏ qua gì, workflow nào phải dùng, và những quyết định nền nào đã được khóa trước khi tiếp tục chuẩn hóa hơn 200 kit.

---

# 0. READ THIS FIRST

Đây là **file đầu tiên phải đọc trong chat mới**.

Không được suy diễn toàn bộ Arclune chỉ từ memory/chat summary.

Không được ưu tiên file legacy hơn file vNext/canonical hiện hành.

Không được tự lấp chỗ `UNRESOLVED` chỉ để tạo cảm giác hệ thống đã hoàn chỉnh.

Canonical architecture hiện tại:

```text
TERMINOLOGY
→ TAG
→ AUTHORING ABILITY SCHEMA
→ NORMALIZER / NORMALIZED IR
→ PRIMITIVES
→ CONTRACTS
→ KERNEL RUNTIME
→ MODE PROFILES
→ STRESS TESTS
```

Canonical design sentence:

> **AI khai báo kit bằng semantic + composition; Kernel thực thi bằng Primitive.**

Canonical architecture principle:

> **Character = data/composition. Kernel = behavior/runtime.**

Tag không execute code.

---

# 1. SOURCE PRECEDENCE

Khi có mâu thuẫn, dùng thứ tự ưu tiên:

1. **Newest explicit user correction.**
2. **Newest LOCKED rule trong canonical architecture files.**
3. **Current character kit text supplied by user.**
4. **Older canonical project files.**
5. **Legacy source / recovery material.**
6. **Assistant inference/proposal.**

Không được lấy một proposal cũ ghi đè user correction mới hơn.

---

# 2. CURRENT CANONICAL FILE SET

## `00_CANONICAL_INDEX.md`
**Role:** new-chat handoff / navigation / precedence / workflow.  
**Version:** `2026-09-10-INDEX-2`  
**Read:** always first.

## `00_CANONICAL_RECOVERY_AUDIT.md`
**Role:** Chặng A — recovery/audit provenance.  
**Version:** `2026-09-10-A`  
**Read when:** cần truy nguồn legacy, audit một quyết định, hoặc xem vì sao terminology/tag cũ bị sửa.  
**Do not treat as:** runtime spec.

## `01_TERMINOLOGY_vNext.md`
**Role:** Chặng B — canonical meanings and semantic distinctions.  
**Version:** `2026-09-10-B` plus current manual patches.  
**Read when:** gần như mọi normalization task.  
**Important:** `TURN_BOUNDARY` hiện nghĩa là global SSI boundary giữa hai Natural Actions liên tiếp. Personal “own turn” mechanics dùng Actor Natural Action Window / Natural Action clocks.

## `02_TAG_vNext.md`
**Role:** Chặng C — Canonical Functional Tag Registry.  
**Version:** `2026-09-10-C`  
**Read when:** map semantic capability / audit new Tag candidate.  
**Important:** Ability Type, target selectors, trigger parameters, Authority Tier không phải Functional Tags.

## `03_PRIMITIVE.md`
**Role:** Chặng D — reusable executable operations.  
**Version:** `2026-09-10-D`  
**Read when:** kit có mechanic mới có vẻ không composition được bằng operations hiện hữu.  
**Important:** Tag ↔ Primitive là many-to-many. Không tạo một Primitive cho mỗi Character.

## `04_ABILITY_SCHEMA.md`
**Role:** Chặng E — declarative Character/Ability authoring schema + normalized IR boundary.  
**Version:** `2026-09-10-E` plus current clock patch.  
**Read when:** chuẩn hóa kit.  
**Important architecture:**

```text
Authoring Ability Schema
→ Validator / Normalizer / Compiler
→ Normalized Ability IR
→ Primitive + Contract execution
```

Authored Character data không nên tham chiếu raw engine code.

## `05_CONTRACTS.md`
**Role:** Chặng F — exact timing/order/snapshot/authority/lifecycle rules.  
**Version:** `2026-09-10-F.1` plus current manual patch to stale checklists.  
**Read when:** mechanic phụ thuộc timing, conflict, snapshot, damage, death, revive, reincarnation, authority, child action, materialization.

**Important maintenance note:** nếu bản local vẫn còn §59/§61 cũ, phải dùng corrected checklist hiện hành; các vấn đề sau **đã resolved** và không còn được liệt kê là unresolved:
- True Damage vs Final Damage Reduction;
- Standard multi-source Shield absorption;
- same-tier Authority adjudication;
- ordinary Revive lifeSerial default;
- Death Cohort semantics;
- Revive-vs-Reincarnation race;
- Pygmalion Class inheritance;
- Pygmalion Element non-inheritance;
- Pygmalion secondary-effect default Attribution;
- inhabited Puppet ordinary Revive;
- Puppet entity-kind classification.

## `06_KERNEL_RUNTIME.md`
**Role:** Chặng G — deterministic runtime architecture.  
**Version:** `2026-09-10-G`  
**Read when:** kiểm tra liệu mechanic có cần subsystem/runtime state mới.  
**Important:** no ordinary `switch(characterId)` special-case.

## `07_MODE_PROFILES.md`
**Role:** Chặng H — mode-specific scheduler/spatial/lifecycle/resource profiles.  
**Version:** `2026-09-10-H`  
**Read when:** mechanic khác nhau theo turn-based / Arena / Exploration-Defense.

## `08_STRESS_TESTS.md`
**Role:** Chặng I — reverse architecture validation.  
**Version:** `2026-09-10-I`  
**Read when:** architecture impact, hard kit normalization, pre-freeze validation.  
**Important:** some tests pass by rejecting invalid data or preserving unresolved contracts.

---

# 3. LEGACY / NON-CANONICAL FILE POLICY

The following names may exist in old exports or local folders:

```text
terminology.md
tag.md
tag_v0.2_silas.md
01_TERMINOLOGY.md
00_READ_FIRST_ARCLUNE.md
```

They are **not** the current canonical source when corresponding vNext/index files exist.

Use them only for:
- recovery;
- historical comparison;
- provenance;
- checking that a mechanic was not accidentally lost.

Do not silently restore old Luna-era assumptions from these files.

If a legacy file conflicts with:
- user correction;
- `01_TERMINOLOGY_vNext.md`;
- `02_TAG_vNext.md`;
- `05_CONTRACTS.md` F.1+;

the newer canonical source wins.

---

# 4. CHARACTER FILE POLICY

Character-specific documents are:
- design sources;
- stress-test corpus;
- explicit character contracts where wording is clear.

They are not allowed to redefine global architecture silently.

If one kit conflicts with architecture:

```text
first determine whether:
A. kit wording is ambiguous;
B. character has a legitimate explicit exception;
C. architecture is missing a generic semantic;
D. architecture is actually wrong.
```

Do not immediately add Tag/Primitive.

---

# 5. THE CURRENT ARCHITECTURAL STACK

## Layer 1 — Terminology
Defines what concepts mean.

Examples:
- Natural Action;
- Turn Boundary;
- HP Cost;
- Actual HP Damage;
- DEATH_CONFIRMED;
- trueSelfId;
- lifeSerial;
- Combat Definition;
- Presentation Definition.

## Layer 2 — Functional Tags
Searchable/indexable semantic capabilities.

Examples:
- DAMAGE;
- TRUE_DAMAGE;
- SHIELD;
- REVIVE;
- REINCARNATION;
- TARGET_EXCLUSION.

Tag is not implementation.

## Layer 3 — Authoring Ability Schema
Declarative specification of:
- Ability Type;
- Action Identity/Behavior;
- Trigger;
- Cost;
- Target;
- Snapshot;
- Effect;
- Resolution;
- Authority;
- Attribution;
- Mode.

## Layer 4 — Normalizer / IR
Transforms authored semantic data into canonical execution-ready IR.

This layer protects >200 Character source files from Primitive/runtime refactors.

## Layer 5 — Primitive
Reusable executable operation blocks.

## Layer 6 — Contracts
Defines exact timing/order/conflict/commit semantics.

## Layer 7 — Kernel Runtime
Executes normalized IR deterministically.

## Layer 8 — Mode Profiles
Selects scheduler/spatial/lifecycle/resource behavior per mode.

## Layer 9 — Stress Tests
Attempts to break all previous layers.

---

# 6. CRITICAL TERMINOLOGY DISTINCTIONS

Never collapse:

```text
Tag ≠ Primitive ≠ Contract ≠ Kernel

Ability Type
≠ Action Identity
≠ Action Behavior
≠ Functional Tag

Natural Action
≠ Follow-up
≠ Counter
≠ Forced Action
≠ Reaction

Multihit
≠ multiple Natural Actions

Target Selection
≠ Area Resolution

Position Mark
≠ Entity Mark

Damage Packet
≠ Shield Absorption
≠ Actual HP Damage
≠ Overkill

True Damage
≠ Shield Piercing

HP Cost
≠ HP Loss
≠ Self Damage
≠ Healing
≠ Max HP Mutation

HP_ZERO
≠ DEATH_CONFIRMED

Death Prevention
≠ Revive
≠ Reincarnation / Rebirth

Removed
≠ Despawned
≠ Fusion Consumed
≠ Erased
≠ Death

definitionId
≠ iid
≠ trueSelfId
≠ lifeSerial

Caster
≠ Owner
≠ Source
≠ Behavior Source
≠ Effect Source
≠ Damage Attribution
≠ Adjudication Owner

Rank
≠ Class
≠ Element
≠ Authority Tier

Axiom identity
≠ every related Ability having Axiom Authority

Presentation
≠ gameplay state

turn-based Slot
≠ Exploration Room
```

---

# 7. SSI CORE

Turn-based scheduler:

```text
Natural Action
→ Turn Boundary
→ Natural Action
→ Turn Boundary
→ ...
```

Sides alternate Natural Action opportunities using independent slot pointers.

Key rules:
- empty/dead/ineligible slots skipped within same Side search;
- CC can consume a Natural Action opportunity without executing Basic/Skill/Ultimate;
- non-natural Follow-up/Counter/Forced/Reaction Action does not advance SSI by default;
- moving into passed slot does not grant second Natural Action;
- eligible summon in unpassed slot may act in same pass;
- summon in passed slot waits next pass.

`TURN_BOUNDARY` is global between consecutive Natural Actions.

Personal caps use:
`ACTOR_NATURAL_ACTION_WINDOW`.

---

# 8. DAMAGE CORE

Canonical meaning:

### Physical
ARM mitigation applies.

### Will
RES mitigation applies.

### True Damage
- bypasses ARM;
- bypasses RES;
- bypasses ordinary/final Damage Reduction;
- does **not** automatically bypass Shield.

### Final Damage Reduction
Applies only to ordinary Physical/Will damage after ARM/RES stage.

Example:

```text
Physical 100
→ ARM: 60
→ Final DR 20%: 48

True 40
→ remains 40

Pre-Shield total = 88
```

### Shield Piercing
Independent semantic.

True Damage without Shield Piercing still hits eligible Shield.

---

# 9. STANDARD SHIELD MODEL

Gameplay may expose one Standard Shield pool.

Runtime preserves a source ledger.

Example:

```text
A contribution = 600
B contribution = 300
C contribution = 600
Total = 1500
```

If 300 damage is absorbed:
- each contribution loses 20%;
- A=480;
- B=240;
- C=480.

No FIFO/LIFO “which shield is hit first”.

Source ledger remains for:
- expiry;
- source-specific removal;
- triggers;
- attribution;
- transfer.

Qualitatively different Shield eligibility can use special Shield Profiles/layers.

---

# 10. ACTUAL HP DAMAGE

Actual HP Damage = HP actually removed after:
- mitigation;
- Shield;
- HP cap.

It excludes:
- Shield absorption;
- Overkill.

Downstream effects such as:
- Lifesteal;
- Ký Ức echo;
must use correct typed result, not raw packet.

---

# 11. HP COST / HP LOSS

### HP Cost
- payment;
- not Damage;
- bypass Shield;
- no ordinary Reflect/Lifesteal/Damage trigger;
- global default cannot kill payer, ≥1 HP.

### HP Loss
- not payment;
- not Damage;
- can be lethal if profile allows;
- can enter HP_ZERO/death pipeline.

Do not interchange them.

---

# 12. DEATH / REVIVE / LIFE

Canonical chain:

```text
ALIVE
→ HP_ZERO
→ DEATH_EVALUATION
→ DEATH_PREVENTED
or
→ DEATH_CONFIRMED
```

Only `DEATH_CONFIRMED` normally:
- grants kill;
- emits canonical death/kill observers;
- updates Luân Hồi;
- creates True Self waiting record.

Ordinary Revive:
- happens post-DEATH_CONFIRMED;
- preserves `trueSelfId`;
- global default preserves `lifeSerial`.

Reincarnation/Rebirth/new life:
- preserves trueSelfId where appropriate;
- increments `lifeSerial`.

Explicit Character exceptions can override.

---

# 13. DEATH COHORT / LUÂN HỒI

Current standard Luân Hồi window:
> **4 later qualifying deaths.**

Simultaneous qualifying deaths in one commit form one **Death Cohort**.

Members of same cohort:
> do not count one another as “later deaths”.

But every cohort member counts for a True Self that was already waiting before the cohort.

Example:

```text
A waiting = 0/4

simultaneous cohort = {B,C,D,E}

A: 0 → 4 → enters Reincarnation
B,C,D,E: each starts 0
```

Sequential deaths are separate cohorts.

World Luân Hồi bookkeeping happens immediately after qualifying DEATH_CONFIRMED commit and before ordinary queued reactions.

Therefore:

```text
A waiting 3/4
B dies
→ A 4/4
→ A enters Reincarnation
→ queued ordinary Revive(A) later fails
```

If Revive(A) committed before B death:
- old waiting record closes;
- later death does not advance it.

---

# 14. AUTHORITY CORE

Authority tiers:

```text
Axiom
> Quy Tắc
> Pháp Tắc
> Normal
```

Functional Tags themselves do not “fight”.

Authority adjudication occurs only when exact semantic rules directly conflict.

If special Authority tiers differ:
> higher tier wins conflicting semantic.

If same:
- Axiom vs Axiom;
- Quy Tắc vs Quy Tắc;
- Pháp Tắc vs Pháp Tắc;

use:

```text
Rank
→ Tu vi / Cultivation
→ Character Stars
→ Awaken Count
→ Adjudication CP
```

CP is last and should be based on adjudication/battle-entry profile, not ordinary temporary combat Buffs.

---

# 15. AUTHORITY CONFLICT GRANULARITY

Do not adjudicate whole Skill when only one clause conflicts.

Example:

```text
Skill A:
A1 = no Heal
A2 = -20% ATK

Skill B:
B1 = self Heal permission
```

If B1 wins against A1:
- B's eligible Heal succeeds;
- A2 remains;
- A1 remains against targets outside conflict scope.

Persistent rules may create cached suppression edges.

Instant losing effect:
> fails that interaction only and does not return later.

---

# 16. AUTHORITY EXACT TIE

If same Authority Tier and:

```text
Rank equal
Tu vi equal
Stars equal
Awaken equal
CP equal
```

result:
`NO_OVERRIDE`.

Do not use:
- iid;
- slot;
- RNG;
- cast order;
as fake tie-breaker.

Existing protection vs incoming mutation:
> protection remains.

Two simultaneous opposite mutations:
> conflicting overlap does not commit.

---

# 17. ADJUDICATION OWNER

Authority comparison uses `Adjudication Owner`.

It is distinct from:
- actor;
- Behavior Source;
- Damage Attribution.

This distinction is required for inheritance/summon/Pygmalion mechanics.

---

# 18. PYGMALION LOCKED CORE

Critical correction:

> one **new** Puppet per Pygmalion Life Cycle, not one total Puppet.

Old Puppets persist independently.

Therefore multiple Puppets can coexist.

Current locked direction:
- Puppet = distinct `PUPPET` entity kind;
- not automatically SUMMON;
- one Puppet hosts max one True Self;
- Class inherited from inherited Combat Definition;
- Element is not inherited automatically;
- host stat basis preserved;
- Puppet presentation preserved;
- multiple Puppets can hold different True Selves;
- Pygmalion Ultimate Puppet attack can have Behavior Source from inherited definition while Damage Attribution = Pygmalion;
- inherited secondary effects default to Puppet/immediate effect-source attribution unless explicitly overridden;
- inhabited Puppet can ordinary-Revive same Puppet-life before hosted True Self enters Reincarnation;
- ordinary Puppet Revive preserves lifeSerial by global default;
- once hosted True Self enters Reincarnation, old Puppet-life is no longer ordinary-Revive eligible.

Never reintroduce a singleton `activePuppet`.

---

# 19. MODE CORE

## TURN_BASED_MAIN
Uses:
- SSI;
- slot battlefield;
- Natural Actions;
- Turn Boundaries;
- full Authority;
- True Self;
- Luân Hồi;
- full kit.

Default:
- AE = shared Side/team;
- Rage = individual.

## ARENA_SUBCOMBAT
Child/isolated Combat Instance.

Transfer is not death.

True death inside Arena can still be observed by global Luân Hồi.

Arena-owned objects do not automatically transfer back to parent.

## EXPLORATION_DEFENSE
Current high-level direction:
- no SSI;
- no Luân Hồi;
- continuous/spatial Room gameplay;
- movement speed;
- attack speed;
- weight;
- simplified kit;
- Rage retained;
- AE generation exists but pool ownership unresolved;
- local resources / Base / Energy / structures / settlement.

Do not translate:
`2 Natural Actions → 2 seconds`
without explicit redesign.

# 19A. PILOT NORMALIZATION #1 — GENERIC ARCHITECTURE ADDITIONS

Pilot #1 used Ariadne Velora as the first real-kit architecture validation case.

The Pilot did not justify any new Functional Tag or Primitive.

It exposed five generic architecture families that are now part of the current canonical foundation.

## Field Presence

Field Presence is authoritative per:
Runtime Entity × Combat Instance

Canonical transitions:
ENTER_FIELD
LEAVE_FIELD
These describe presence transition, not lifecycle cause.
Therefore:
DEATH_CONFIRMED ≠ LEAVE_FIELD
DEPLOY_FROM_DECK ≠ ENTER_FIELD
REVIVE ≠ ENTER_FIELD
A cause-specific mechanic can produce an Enter/Leave Field transition without becoming semantically identical to that transition.
Arena transfer is instance-local presence movement, not Death.
Binding a True Self or Combat Definition to an entity already active-present does not itself create ENTER_FIELD.
Deck Deployment
Deck membership and current deployment state are separate.
Canonical distinction:
DECK_MEMBERSHIP ≠ CURRENT_DEPLOYMENT_STATE
Deployment Cost Bar is distinct from:
AE;
Rage;
Ability CostSpec.
Successful Deck deployment in the current Turn-based profile applies:
Current Rage = Max Rage
but:
FULL_RAGE ≠ AUTO_CAST_ULTIMATE
Revive and Arena Return do not inherit the Deck-deployment full-Rage rule merely because they may produce ENTER_FIELD.
Position Mutation Observation
A successful committed atomic Position Mutation group exposes one:
POSITION_MUTATION_COMMITTED
Event after the authoritative Position commit.
Its authoritative movement payload is:
entries[]
with old/new Position data.
subjectRefs, if present, is only a derived/index projection.
One atomic group moving multiple entities remains one semantic commit Event.
Multiple sequential Position commits remain multiple Events.
Post-commit observation timing does not resolve global same-window Reaction priority.
Event Trace Ordering
Deterministic eventSeq / publication order exists for replay and trace.
It is not automatically gameplay priority.
Global same-window priority among unrelated Reactions remains unresolved unless a specific Contract provides priority.
Side-relative Spatial Direction
Common spatial authoring may use:
FRONT
BACK
LEFT
RIGHT
relative to an explicit Side/orientation anchor.
Opposing Sides may mirror the same authored rule.
Spatial direction must not depend on camera or screen orientation.
SpatialSelectorSpec is a reusable common Schema object, not a Target-only private language.
Hit Admission / Guaranteed Hit
Canonical distinction:
TARGET_LOCK ≠ HIT_ADMISSION ≠ GUARANTEED_HIT
Guaranteed Hit bypasses ordinary:
Miss;
Dodge;
Evasion.
It does not automatically bypass:
target lifecycle invalidation;
target illegality;
protection/immunity outside ordinary hit admission;
Authority conflict.
Authority-bearing special hit denial/avoidance remains subject to normal Authority adjudication.
Pilot #1 therefore changed Schema / Contract / Kernel / Mode / Stress-Test coverage without introducing a new Functional Tag or Primitive.

---

# 20. CURRENT MAJOR UNRESOLVED AREAS

Do not silently resolve these.

## Combat / Trigger
- global same-window priority among unrelated Reactions;
- default intermediate Reaction boundary for sequential multihit;
- exact ordinary queue cutoff after battle-terminal Leader death.

## Damage / Materialization
- default Max-HP reference for a damage threshold when Max HP mutates within same Action;
- full-slot materialization fallback;
- invalid Duy Nhất materialization fallback.

## Authority
- final edge-case confirmation for Dynamic Authority sampling when one atomic resolution upgrades its own Authority.

## Narrative
- personal Story/Belief cadence after Turn Boundary terminology correction;
- final Belief formula;
- Knowledge Propagation delay;
- Story-specific Counter-Proof severity defaults;
- Realized Property default Authority.

## Exploration/Defense
- AE ownership;
- real-time Action cadence;
- manual vs AI roster control;
- cooldown/attack-speed model;
- death/failure model;
- Base movement/failure;
- resource/structure/rune details.

---

# 21. NEW KIT WORKFLOW — DEFAULT

When user sends a new kit, do **not** regenerate all architecture files.

Default procedure:

```text
1. Read this INDEX.
2. Read latest kit text.
3. Read only architecture files relevant to this kit.
4. Semantic parse.
5. List ambiguities.
6. Map to existing Terminology.
7. Map to existing Tags.
8. Express with Ability Schema.
9. Derive existing Primitive composition.
10. Apply relevant Contracts.
11. Dry-run Kernel trace.
12. Compare with Stress Tests.
13. Identify architecture impact.
14. Return manual patch list.
```

---

# 22. NEW KIT SEMANTIC PARSE CHECKLIST

Extract at minimum:

```text
Ability Type
Action Identity
Action Behavior
Trigger
Condition
Cost
Target Candidate Pool
Target Selection
Area Resolution
Snapshot
Damage/Heal/Shield/State
Duration clock
Resource behavior
Position behavior
Authority Tier
Adjudication Owner if needed
Attribution
Lifecycle
Mode
RNG
Caps/counters/cooldowns
Child Action policy
Ambiguities
```

---

# 23. ARCHITECTURE IMPACT RULE

A new kit **does not get to modify architecture by default**.

It must first prove the existing architecture cannot represent its mechanic without semantic distortion.

Use this order:

### If missing meaning
Patch `01_TERMINOLOGY_vNext.md`.

### If genuinely new searchable semantic capability
Audit candidate for `02_TAG_vNext.md`.

### If authored data cannot express mechanic
Patch `04_ABILITY_SCHEMA.md`.

### If execution needs genuinely new reusable operation
Audit candidate for `03_PRIMITIVE.md`.

### If timing/order/conflict is missing
Patch `05_CONTRACTS.md`.

### If runtime state/subsystem is missing
Patch `06_KERNEL_RUNTIME.md`.

### If difference is mode-only
Patch `07_MODE_PROFILES.md`.

### If mechanic exposes a new dangerous interaction class
Add test to `08_STRESS_TESTS.md`.

Do not add everything everywhere.

---

# 24. TAG ACCEPTANCE RULE

Before adding Tag, ask:

1. Is it truly a semantic capability?
2. Is it queryable/useful across multiple mechanics?
3. Is it just Ability Type?
4. Is it just target selector?
5. Is it just a parameter?
6. Is it just Trigger timing?
7. Is it presentation?
8. Does an existing Tag already cover it?
9. Can the distinction live better in Schema/System metadata?

If not clearly justified:
> do not add Tag.

---

# 25. PRIMITIVE ACCEPTANCE RULE

Before adding Primitive, ask:

1. Can current primitives compose this behavior?
2. Is missing thing actually a Contract?
3. Is it a pure formula/query?
4. Is it a system gateway rather than effect primitive?
5. Would the new operation be reusable outside one Character?
6. Does it own an atomic state transition?

Never create:
`SPECIAL_<CHARACTER_NAME>_PRIMITIVE`
as ordinary solution.

---

# 26. CONTRACT ACCEPTANCE RULE

A Contract is needed when semantic operations already exist but outcome depends on:

- timing;
- ordering;
- target lock/re-query;
- snapshot;
- commit;
- event window;
- conflict;
- lifecycle sequence;
- resource transaction;
- child Action behavior.

Do not solve Contract ambiguity by inventing a new Tag.

---

# 27. MANUAL PATCH OUTPUT FORMAT

User maintains canonical files manually to reduce unnecessary file regeneration and usage.

Future responses should prefer:

```text
ARCHITECTURE IMPACT

01_TERMINOLOGY_vNext.md
- NO CHANGE

02_TAG_vNext.md
- NO CHANGE

03_PRIMITIVE.md
- NO CHANGE

04_ABILITY_SCHEMA.md
- PATCH REQUIRED
- Insert after §X:
  [exact markdown block]

05_CONTRACTS.md
- PATCH REQUIRED
- Add Contract ABC-123:
  [exact markdown block]

06_KERNEL_RUNTIME.md
- NO CHANGE

07_MODE_PROFILES.md
- NO CHANGE

08_STRESS_TESTS.md
- Add test NEW-001 because ...
```

Do not regenerate full files unless user explicitly requests.

---

# 28. UNRESOLVED OUTPUT FORMAT

Every kit analysis that contains unresolved semantics should explicitly include:

```text
UNRESOLVED / NEED USER DECISION

1. ...
2. ...
```

Do not hide ambiguity by selecting a “reasonable RPG default”.

Arclune intentionally contains unusual mechanics.

---

# 29. PILOT NORMALIZATION PHASE

Current next project phase after Chặng I:

> **Architecture Validation / Pilot Normalization**

Do not bulk-normalize >200 kits immediately.

Recommended:
- 10–20 representative real kits;
- include simple, medium, hard and system-breaking candidates;
- reuse `08_STRESS_TESTS.md`;
- add tests only for genuinely new interaction classes.

---

# 30. BULK NORMALIZATION GO GATE

Begin bulk roster normalization only if:

1. current MUST_PASS tests remain representable without Character-specific runtime code;
2. MUST_REJECT cases are actually rejectable by schema/validator;
3. PROBE_UNRESOLVED cases stay unresolved visibly;
4. pilot kits do not cause uncontrolled Tag/Primitive growth;
5. repeated mechanics normalize into same canonical patterns;
6. traces remain explainable.

If not:
> repair architecture first.

---

# 31. HARD STRESS-TEST CHARACTERS / SYSTEMS

Use these as architecture breakers rather than ordinary roster content:

- Pygmalion;
- Hoá Thân Ký Ức Chi Chủ;
- Luân Hồi Chi Chủ;
- Cố Sự Chi Thần;
- SSR Warrior True Damage / Overheal / personal action-window mechanics;
- Arena interactions;
- Quang Ảnh Chi Hà;
- Silas Airborne / Position Mark / SELF_HP_COST if revisited.

Do not invent missing kit details.

---

# 32. CHARACTER-SPECIFIC SOURCE PRIORITY

If a character file says something clearly and newer user correction does not supersede it:
> retain it as Character-specific canon.

If the character file itself labels something:
- suggestion;
- recommended;
- simple model;
- unresolved;

do not promote it to global LOCKED canon.

---

# 33. STRESS TEST PHILOSOPHY

`08_STRESS_TESTS.md` checks:

- expressibility;
- determinism;
- layer correctness;
- regression safety.

A stress test can pass by:
- producing exact expected state;
- rejecting invalid data;
- exposing an unresolved Contract.

Never make a test “green” by inventing hidden defaults.

---

# 34. CODE / ENGINE BOUNDARY

Current target runtime:
- Unity + C# planned official implementation.

But architecture files do not force:
- GameObject architecture;
- ECS;
- MonoBehaviour layout;
- networking model.

Turn-based and Exploration may use different simulation adapters under same semantic Kernel.

Character remains declarative.

---

# 35. PROTECT AGAINST LUNA/LEGACY DRIFT

Future model must not:

- normalize strange mechanics into conventional RPG mechanics;
- delete distinctions because they seem over-engineered;
- infer Tag from Ability name;
- infer Authority from Prime rank;
- infer Summon from “created auxiliary unit”;
- infer Reincarnation from lore word only;
- infer Target Immunity from invisibility;
- infer True Damage from 100% Penetration;
- infer Shield Piercing from True Damage;
- convert HP Cost into Self Damage;
- treat HP_ZERO as death;
- treat ordinary Revive as new life;
- collapse Pygmalion to one active Puppet;
- resolve same-tier Authority using CP before progression;
- resolve simultaneous deaths by arbitrary slot/event order;
- use global Turn Boundary as every actor's personal turn reset.

---

# 36. NEW CHAT START PROCEDURE

Preferred user workflow:

### First upload / provide
`00_CANONICAL_INDEX.md`

Then provide the kit to analyze.

If needed, the model requests only relevant canonical files.

For a typical turn-based kit, usually enough:

```text
01_TERMINOLOGY_vNext.md
02_TAG_vNext.md
04_ABILITY_SCHEMA.md
05_CONTRACTS.md
kit file
```

Add:

`03_PRIMITIVE.md`
when a new executable operation may be required.

`06_KERNEL_RUNTIME.md`
when runtime state/scheduler/subsystem architecture may be affected.

`07_MODE_PROFILES.md`
when mode behavior matters.

`08_STRESS_TESTS.md`
for hard/new interaction class or architecture validation.

`00_CANONICAL_RECOVERY_AUDIT.md`
only for legacy/provenance disputes.

---

# 37. CHAT MODEL INSTRUCTION

When starting a new chat, user can say:

> Đọc `00_CANONICAL_INDEX.md` trước. Đây là điểm vào canonical của Arclune. Không dùng memory hoặc legacy file để ghi đè file hiện hành. Hãy xử lý kit mới theo `NEW KIT WORKFLOW`, chỉ đề xuất patch khi kiến trúc hiện tại thực sự thiếu semantic/schema/primitive/contract/runtime. Những chỗ chưa đủ dữ liệu phải để UNRESOLVED và hỏi tao, không tự chọn default.

This is sufficient as the starting instruction when the index file is supplied.

---

# 38. FILE MAINTENANCE POLICY

User manually maintains master files.

Therefore:

- assistant should output exact patch blocks;
- user copies them into local master;
- newly edited local master becomes newest canonical source;
- next chat should use user's newest uploaded version;
- assistant should not assume an old generated sandbox file remains newest.

---

# 39. VERSIONING POLICY

Each architecture file should retain:
- semantic version/date marker;
- patch revision if meaning changes.

Small wording clarification with no semantic change:
> minor patch/revision.

Semantic change affecting normalized data:
> explicit version bump and migration note.

Do not rely only on file modified timestamp.

---

# 40. CURRENT PRACTICAL STATUS

Architecture is no longer at “brainstorming from zero”.

It currently has:

- recovered canonical baseline;
- reconstructed terminology;
- audited Tag taxonomy;
- Primitive registry;
- Authoring Ability Schema;
- Normalized IR boundary;
- Contract registry;
- deterministic Kernel architecture;
- Mode Profile architecture;
- 100+ semantic stress tests.

But it is **not yet v1 frozen**.

Current task:
> pilot-normalize real kits and use failures as evidence.

Pilot Normalization has started.

Pilot #1 — Ariadne Velora:
- gameplay ambiguity clarification completed;
- architecture-impact audit completed;
- five generic architecture gap families accepted;
- no new Functional Tag required;
- no new Primitive required;
- canonical patch cycle added Field Presence, Deck Deployment, Position Mutation commit observation, side-relative spatial direction and Hit Admission / Guaranteed Hit boundaries;
- regression coverage added through `M-013` → `M-020`.

This does not constitute v1 architecture freeze.

Current task remains:

> continue Pilot Normalization with representative kits and use repeated failures/successful reuse as evidence before bulk roster normalization.

---

# 41. FINAL HANDOFF CHECKSUM

A future model is ready to continue Arclune only if it can answer “yes” to all:

1. Do I know which files are canonical?
2. Do I know legacy files cannot override vNext?
3. Do I know Character=data and Kernel=behavior?
4. Do I know Tag does not execute?
5. Do I know Ability Type/Action Identity/Action Behavior/Tag are distinct?
6. Do I know Turn Boundary is global between SSI Natural Actions?
7. Do I know personal turn caps use Actor Natural Action Window?
8. Do I know True Damage does not bypass Standard Shield?
9. Do I know Final DR does not reduce True Damage?
10. Do I know Standard Shields pool but retain source ledger?
11. Do I know HP Cost ≠ HP Loss ≠ Damage?
12. Do I know HP_ZERO ≠ DEATH_CONFIRMED?
13. Do I know ordinary Revive preserves lifeSerial by default?
14. Do I know Reincarnation/new life increments lifeSerial?
15. Do I know Death Cohort members do not count one another?
16. Do I know an older waiting entry advances by every qualifying death in later cohort?
17. Do I know Luân Hồi bookkeeping precedes ordinary queued Revive?
18. Do I know Authority adjudication is for directly conflicting rule clauses?
19. Do I know same-tier comparator is Rank→Tu vi→Stars→Awaken→CP?
20. Do I know exact tie is NO_OVERRIDE?
21. Do I know Adjudication Owner ≠ Damage Attribution?
22. Do I know Pygmalion can own multiple Puppets?
23. Do I know one Puppet hosts max one True Self?
24. Do I know Puppet is not automatically SUMMON?
25. Do I know Puppet inherits Class but not Element from inherited Combat Definition?
26. Do I know Arena is a child Combat Instance?
27. Do I know Exploration has no SSI and no Luân Hồi?
28. Do I know unresolved mechanics must remain unresolved?
29. Do I know a new kit must first try composition before changing architecture?
30. Do I know user wants manual patch output rather than repeated full-file regeneration?
31. Do I know Field Presence is keyed by Runtime Entity × Combat Instance?
32. Do I know `DEATH_CONFIRMED` does not automatically mean `LEAVE_FIELD`?
33. Do I know Deck membership does not automatically mean currently deployable?
34. Do I know Deployment Cost Bar ≠ AE ≠ Rage?
35. Do I know successful Deck deployment fills Rage but does not auto-cast Ultimate?
36. Do I know one atomic Position Mutation commit group exposes one post-commit observation Event?
37. Do I know `entries[]` is authoritative for Position Mutation old/new Position data?
38. Do I know deterministic `eventSeq` is trace order, not automatic gameplay priority?
39. Do I know side-relative direction is resolved by Spatial Profile rather than screen orientation?
40. Do I know Target Lock ≠ Hit Admission ≠ Guaranteed Hit?
41. Do I know Guaranteed Hit bypasses ordinary Miss/Dodge/Evasion but not lifecycle invalidation or Authority by default?

If any answer is “no”:
> read the relevant canonical file before making architecture changes.
