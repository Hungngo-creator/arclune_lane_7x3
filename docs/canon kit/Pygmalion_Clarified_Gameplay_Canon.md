# ARCLUNE — PYGMALION — CLARIFIED GAMEPLAY CANON

**Revision:** R0.
**Status:** PARTIALLY_CLARIFIED / NORMALIZATION_BLOCKED_BY_GAMEPLAY_DECISIONS.
**Source:** `26) Pygmalion` in root `Ý tưởng nhân vật 4.md`, from Passive through the text before `27) Galatea`. Existing explicit Pygmalion locks in 00§18, ENT-001–010, REV-003, REC-001–007/020 and the G-series obligations supersede older unresolved/example shorthand on those exact points. Suggestions embedded in raw prose are not independently designer locks.

## 1. Character and identity boundaries

Pygmalion creates Puppet bodies awaiting Chân Ngã. A Chân Ngã reaching Reincarnation can inhabit an eligible empty Puppet and receive a constrained random Combat Definition. This is full-kit behavior inheritance under a host policy, rather than Thespis's restricted damage-only Role projection.

Puppet is **entityKind=PUPPET**, distinct from SUMMON. Summon-only targeting, bonuses, lifecycle or cleanup do not apply automatically. Each Puppet is an independent actor with its own identity, stats, resources, presence and lifecycle. One Puppet hosts at most one Chân Ngã; one Chân Ngã cannot simultaneously occupy two hosts. Ownership does not make the Puppet Pygmalion's own body or give it his Chân Ngã.

Pygmalion's Rank/Class/Element/full stat budget/Base Deployment Cost are not specified by this raw entry. Do not infer UR from the note about making simpler UR definitions for the pool. Host Element and empty-Puppet Class remain unspecified profile metadata; inherited Class/Element policy is already locked in §4.

## 2. Passive — A Masterpiece Awaiting a Soul / Kiệt Tác Chờ Một Linh Hồn

### 2.1 Creation quota and independent old bodies

Field entry can create one new Puppet, subject to the kit's creation conditions and legal materialization. Each Pygmalion **Life Cycle has at most one new-Puppet quota**. Receiving a Chân Ngã does not reopen a consumed quota in that same cycle. Pygmalion DEATH_CONFIRMED followed by successful Revive starts another kit creation cycle. Ordinary Revive still preserves trueSelfId/lifeSerial under REV-003: the quota cycle marker is not an implicit lifeSerial increment.

Old Puppets continue independently until their own removal. Multiple Puppets and multiple inhabited Puppets can coexist. There is no authored total live-Puppet cap1 and no singleton `activePuppet`. Pygmalion's confirmed death does not itself kill/despawn either empty or inhabited Puppets.

Raw additionally delays creation after Revive while an old Puppet remains uninhabited, then permits creation when that body receives a Chân Ngã if the current cycle is still eligible. The exact blocker set, dead-empty-body case, unused-cycle carry and materialization-failure law are **UNRESOLVED Q2/Q3**. Preserve that specific gate without turning all existing Puppets into blockers or treating inheritance as a same-cycle quota reset. Entry/redeploy alone does not authorize a second quota in the same cycle.

### 2.2 Host stat and resource basis

Known creation rules:

| Host field | Authored rule |
| --- | --- |
| Rank | Same as Pygmalion |
| Cultivation / tu vi | Same as Pygmalion |
| Rank-multiplied stats | 80% of the declared Pygmalion snapshot |
| Non-rank-multiplied stats | 0, subject to separately explicit resource/metadata fields rather than erasing those fields |
| Initial Rage | 0 |
| Initial Rage maximum | 100 |

The basis is a snapshot, not a live stat link. Later Pygmalion stat changes do not update an existing Puppet. A new Puppet uses its own declared creation snapshot; inheritance does not replace that host basis with the random Character's roster budget. The inherited kit may modify the Puppet's current stats through its own legitimate effects.

The first Puppet's raw battle-start snapshot wording versus later creation-current snapshot, the precise initialization checkpoint and initial CurrentHP are **UNRESOLVED Q2**. Numeric budget and the canonical rank-scaling field registry are separate metadata; do not derive them from old implementation tables.

### 2.3 Empty Puppet definition

An empty Puppet has its own minimal Combat Definition; it does not have “no kit”. It receives SSI Natural Action opportunities and normally uses its own Basic. Raw describes `100% WIL/ATK` of the Puppet; the exact component/hit profile is **UNRESOLVED Q1**, rather than silently converting slash shorthand into a typed formula.

Its minimal Ultimate pays Rage and performs an unenhanced Basic, without additional damage amplification. The real-child versus profile-only Basic identity is **UNRESOLVED Q1**. Its Skill availability remains minimal until inheritance; no borrowed Character's Skill exists beforehand.

## 3. Reincarnation routing and definition pool

Entry condition is a Chân Ngã **leaving waiting and entering Reincarnation**, not HP_ZERO, initial Death, ordinary Revive or waiting-entry creation. REC-001/004/020 still governs progress, simultaneous Death Cohorts and closure before ordinary queued Revive. Routing is distinct from that transition, host reservation, definition selection and materialization. It never ordinary-Revives the previous body.

Raw permits Chân Ngã from either Side. With two Pygmalions on the field, it assigns the Chân Ngã to a Puppet of its Side. Luân Hồi Chi Chủ's field incarnation blocks the Puppet route regardless of alliance. Exact route-owner availability, Side assignment/anchor, non-death leave and blocker checkpoint are **UNRESOLVED Q4**; owner death does not by itself remove surviving bodies.

Select a random Combat Definition with **Rank equal to the host Puppet's Rank** from a Definition pool, rather than a battlefield Entity pool. Declared exclusions:

- Characters already in the battle's Decks, on the field or represented by Chân Ngã currently waiting;
- the routed Chân Ngã's previous-life Character definition.

A Character whose life already entered Reincarnation is not excluded merely for having existed earlier, but previous-life exclusion still applies. Exact current-membership versus history semantics, definition identity/FORM scope, pool freeze/update checkpoint and weighting are **UNRESOLVED Q6**.

Every random draw uses deterministic seeded RNG and a fully filtered eligible set under RNG-001/002. No Entity/Slot/list/Event order is an authored winner. Shared-capacity routing of multiple entrants, reservation failure, empty pool, missing host and whether any route waits/retries are **UNRESOLVED Q5**. Do not invent a competing-router priority or a route that succeeds with an unsupported/absent definition.

## 4. Inhabited Puppet and full-kit inheritance

The routed **Chân Ngã remains that Chân Ngã**; the random kit's author identity does not replace it. Reincarnation/new-life transition uses its actual identity policy, distinct from ordinary Revive. Body Rank/cultivation/host stat basis remain host-owned. Do not clone a Character instance or the deceased actor's live temporary state.

Known inheritance dimensions:

- use the random Combat Definition's Basic, Skills, Ultimate, Passive behavior and explicitly authored clauses;
- **Effective Class is inherited** from that definition;
- **Element is not inherited** from that definition; retain the host's own Element profile;
- preserve Puppet body appearance; inherited action motion, effects and voice follow the kit as raw explicitly describes;
- preserve host stat basis; kit-authored subsequent scaling/modifiers remain legitimate;
- rebuild capabilities for the receiving actor's current definition; each attack resolves its own exact-owner target binding under TGT-008.

Pygmalion's Rank, lore or ownership grants no extra Authority. Inherited explicit clauses retain their own declared semantics/Adjudication Owner profile; Damage Attribution is a separate axis. Full behavior inheritance must not be reduced to a damage-only projection or converted into foreign live-Ability invocation.

Rage/HP retention at binding, inherited cooldown/counter/resource initialization, passive registration versus entry-style activation and treatment of existing host States are **UNRESOLVED Q7**. Binding a definition to an already-present Puppet is not an ENTER_FIELD transition; an authored initialization activation would need its own semantics.

## 5. Death and ordinary Revive

**Empty Puppet:** raw explicitly uses DEATH_CONFIRMED; the body disappears. With no Chân Ngã it creates no Luân Hồi waiting entry and cannot ordinary-Revive. A distinct Puppet-death listener may observe that confirmed death, but it is not a Summon death or a qualifying Chân Ngã death merely because the body was created by Pygmalion. Death and non-death removal causes remain distinct.

**Inhabited Puppet:** DEATH_CONFIRMED removes active body presence and creates ordinary waiting for its hosted Chân Ngã. Preserve the Puppet-life host relation and inherited Combat Definition in the death/Revive record. Before the Chân Ngã enters Reincarnation, eligible ordinary Revive can rematerialize **the same Puppet-life, same trueSelfId, same lifeSerial and same inherited definition**. Do not randomize another kit or host on ordinary Revive.

After that Chân Ngã enters Reincarnation, ordinary Revive of the old Puppet-life is invalid. A later legitimate route can inhabit another eligible host as a new life. The inherited kit may author self-Revive under these same identity/lifecycle gates.

Revive retains/restores the host stat basis, with subsequent current-stat retention governed by the inherited kit's actual restoration/scaling rules. It does not re-snapshot the current creator or replace the basis with the inherited Character's budget. Generic Revive position/HP/State/resource restoration and target-kit rules apply; this Canon does not invent a universal revive percentage or full resource reset.

## 6. Pygmalion Actions

### 6.1 Own Basic

The entry does not author a standalone Pygmalion Basic formula/profile. Its Ultimate requests his Basic, making **Q1 an internal gameplay decision** rather than just missing numeric roster metadata.

### 6.2 Skill1 — Chisel Away the Afterlife / Đục Mòn Cõi Luân Hồi

Required Cost: **25 Side AE + HP Cost requested50% Pygmalion MaxHP**. Check the affected waiting-window value **>1 before payment**; validate all required Costs before their atomic commit, then apply the declared **window−1**, with floor1. Window1 makes this Skill inadmissible: no payment-first failure.

The HP debit is Cost, not Damage/HP Loss: no Shield absorption, Reflect, Lifesteal or ordinary Damage trigger. No lethal override is explicit in raw. Consequently current CST-001/003's required-payment and nonlethal minimum1HP defaults govern; do not silently make lethal payment or successful shortfall merely because the design says payment makes him die sooner. If full requested HP/AE cannot be paid under that law, the required group fails without either debit or the window effect.

Window owner/scope, base versus effective value, duration/stacking across casts/owners and interaction with live Nephthys contributions are **UNRESOLVED Q8**. Do not approximate threshold reduction by adding per-record death progress or force-entering selected entries; those are different observable mechanics.

### 6.3 Skill2 — Carve the Imperfect / Khắc Gọt Kẻ Bất Toàn

Required Cost: **20 Side AE**, paid before damage. Target: one enemy. Authored damage coefficients: **130% WIL +150% ATK**; typed components/hit profile are **UNRESOLVED Q1**.

At paid activation, self defense increases by the authored **15% ARM and7% RES**, before the attack resolves. The benefit lasts through the end of Pygmalion's **next Natural Action**, excluding the granting Natural Action as demonstrated in raw, and ends before the following global TURN_BOUNDARY. It is not a global-turn duration; non-Natural actions do not decrement it. Ordinary CLK-003 counts a CC-consumed opportunity unless explicitly overridden.

Relative versus percentage-point change and reapplication/stack/refresh behavior are **UNRESOLVED Q9**. Do not select stat semantics from old implementation representation or allow repeated application to create undeclared permanent growth.

### 6.4 Ultimate — At My Gesture, Every Form Moves / Theo Một Cử Chỉ, Vạn Hình Chuyển Động

Pygmalion and his valid Puppets perform one current Basic each. Snapshot the eligible Puppet identities **when Ultimate begins**. New Puppets created later do not enter that list. A listed Puppet invalid/dead before its execution does not attack and is not replaced; no transferring its request to another Puppet/Slot.

Each Puppet request uses its own **current Basic as a real BASIC_ATTACK Follow-up**, non-Natural, consuming no SSI opportunity. The generic non-Natural default grants no class Action AE/Rage merely for acting; explicitly kit-authored effects/resource operations keep their own semantics. Existing 04§47 specifies waived child Cost for these Puppet requests; this does not rewrite the inherited Basic's base cost.

For those Puppet Follow-ups:

| Axis | Meaning |
| --- | --- |
| Actor | That Puppet |
| Behavior Source | Its current Combat Definition, inherited when inhabited |
| Direct attack Damage Attribution | Pygmalion |
| Inherited secondary Effect source/attribution | Puppet/immediate Effect source unless explicitly overridden |
| Authority adjudication | Exact clause's declared Adjudication Owner, independently of damage credit |

Keep the current Basic's secondary behavior. A Bleed/Heal/other secondary node is not stripped because its parent was requested by Ultimate; its provenance is not automatically reassigned to Pygmalion. Child Actions and later secondary outcomes are not made root-owned direct effects merely by sharing rootActionId.

The own-Basic child's identity, simultaneous versus ordered execution, actor/target/definition snapshot checkpoints, enemy-target policy and parent-invalidity continuation are **UNRESOLVED Q10**. “Together” is presentation intent, not enough to choose a commit batch/order. Raw's scheduled-child invalidation does not itself select a global Reaction priority.

## 7. Declarative bindings for the already-determined core

These are bounded Character-owned bindings, not a claim of a fully normalized executable kit. Questions in §8 prevent final Action/routing plans.

| Component | Existing composition |
| --- | --- |
| New host/quota | SpawnEntitySpec/P-051 + lifecycle quota/P-084 + materialization validation/P-085, governing ENT-001–003/020. A cycle marker and independent host refs replace a singleton; quota is State, not a Tag. Join successful protected writes under existing transaction law. Q2/Q3 supplies remaining eligibility/failure values. |
| Host basis | Snapshot/P-002, explicit whitelist/initialization, SNP-001/002/005. Host basis, current modifiers and resources remain separate. |
| Route/definition | Separate typed TRUE_SELF_POOL, PUPPET Entity pool and CHARACTER_DEFINITION_POOL. REC-005–007, P-067/P-080/P-082/083 and reservation/materialization owners provide identity/behavior/capability binding. Actual routing and inheritance nodes carry REINCARNATION and COMBAT_DEFINITION_INHERITANCE respectively. No SUMMON capability is inferred. |
| Inheritance | 04§31 dimensions: preserve host basis/body/Element, inherit Class and full declared behavior. ENT-004/005/009/010 and TGT-008 resolve the receiving actor's policies; no Character clone or broad target exception. |
| Death/Revive | Ordinary Death/lifecycle/Revive and record retention, REV-003/REC-020/ENT-010. Actual Revive operation may carry REVIVE; receiving a Chân Ngã through routing does not. |
| Skill1 | CostSpec validates known HP/AE law before activation. The window operation carries REINCARNATION; its exact owner/value/lifetime waits for Q8. Cost alone does not grant RESOURCE_MODIFIER. |
| Skill2 | Cost→defense State/STAT_MODIFIER→Damage graph. DAMAGE applies to direct Damage nodes; exact component capabilities and State policy await Q1/Q9. |
| Ultimate | Existing RequestAction/P-001, actor-set Snapshot, independent Basic/FOLLOW_UP identities, waived Puppet child Cost and AttributionSpec/ENT-006/007. Whole-kit secondary capabilities belong to their semantic owners. Q10 supplies local grouping/target/read/continuation values. |

## 8. UNRESOLVED — internal gameplay decisions

No proposed answer below is a lock. These groups identify exact missing gameplay; they do not claim generic architecture gaps.

| ID | Designer decision required |
| --- | --- |
| Q1 | Own Basic; empty Puppet's slash-formula types/hit/targeting; Skill2 types/hit count; minimal Puppet Ultimate's real-Basic identity. |
| Q2 | First-versus-later creator snapshot checkpoint, full/partial starting HP, placement, unsuccessful spawn/quota and retry law. |
| Q3 | Which live/dead empty old hosts delay creation; deferred unused current cycle; whether missed cycles accumulate quotas. |
| Q4 | Puppet survival on non-death owner leave, router owner availability, Side anchor/ownership and the Luân Hồi Chi Chủ blocker on non-death leave. |
| Q5 | Entrants competing for hosts, local ordering/selection, absent host/definition/invalid reservation and terminal retry/exit behavior. |
| Q6 | Exact roster definition pool, current exclusion identities/FORM/history and previous-life scope, pool read checkpoint/weighting. |
| Q7 | HP/Rage/resource/State/cooldown/counter initialization or retention on inheritance; initial Passive activation versus registered ongoing behavior. |
| Q8 | Skill1's affected waiting-window owner/base/effective value, persistence/repeated reduction, live-contribution composition and all-waiting re-evaluation. |
| Q9 | Skill2 ARM/RES arithmetic and temporary State reapplication/stacking/refresh/retention. |
| Q10 | Own real Basic child, grouping/order, per-child definition/source/recipient checkpoints, common versus independent enemy targets and pending children after parent invalidation. |

Rank/Class/native Element, full numeric budget/Base Deployment Cost, host metadata/stat-scaling registry and future Mode adaptations remain **UNRESOLVED / NOT BLOCKING for clarification**. A future external inherited kit requiring unsupported explicit actor/identity/resource/Authority semantics must be handled when encountered; do not pre-approve callbacks or invent translation. These boundaries do not erase the ten internal groups blocking complete normalization.
