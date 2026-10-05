# ARCLUNE — NEPHTHYS — CLARIFIED GAMEPLAY CANON

**Revision:** R0 — raw-kit extraction and current-base composition review; designer clarification pending.
**Status:** CLARIFICATION_IN_PROGRESS / NOT_NORMALIZATION_READY. Proposed answers are not gameplay locks. Architecture Phase documentation only.
**Source:** `Ý tưởng nhân vật 4.md`, entry `11) Nephthys`, identified by its five named abilities, not by the item number alone.
**Verified architecture base:** actual merged `main` commit `9f7eb05252b49f0d247d234cd520dde965cd1c0f`; INDEX-13 / E.11 / F.13 / G.12 / H.1 / I.12. This is the inspected drafting base, not a claim that a working copy is merged canon. No open PR was found at task start.
**Workflow:** current root `AGENTS.md` §§25, 29, 33, 39. The designer requested this Character workflow, `.md` scope only, with no implementation execution or reads of `src/` or `dist/app.js`.

## 1. Authority and scope

Raw prose supplies the formulas and intent below. Existing merged architecture supplies already-locked generic semantics. Incompatible interpretations that change gameplay remain **REQUIRED_DESIGNER_CLARIFICATION**; the suggestions in §3 do not supersede raw prose until the designer answers.

No architecture patch has been approved or derived from an unresolved suggestion. The current task covers Nephthys only. No unrelated raw entry, prior Character lock, indexed filename or implementation file changes.

Rank, Class, native Element, base-stat numbers, Basic profile, deployment Cost Budget and adapters for Modes lacking the required Natural-Action abstraction remain **UNRESOLVED / NOT BLOCKING** for this semantic review. Do not infer Authority from the Character's name or mythology. An executable Character definition still requires its applicable metadata and profiles.

## 2. Gameplay already explicit in the raw kit

### 2.1 Passive — The Dead May Linger / Người Chết Được Phép Nán Lại

While Nephthys is on the Field, the Luân Hồi waiting window is increased by **2**. Her contribution disappears when she leaves the Field. Two present Nephthys, one on each Side, contribute separately: the standard **4** becomes **8** in the absence of other kit intervention. This is waiting by later qualifying deaths, not time, retained corpse capacity or four turns.

Raw departure rule: if the window is greater than4 when this Character leaves, the **2 longest-dead waiting Chân Ngã** enter Reincarnation; the raw also mentions **4** with one Nephthys on each Side. The precise one-leaver/two-leaver condition, threshold re-evaluation and tied-oldest policy are not yet locked; see Q1. Do not replace this rule with synthetic qualifying deaths or arbitrary waiting-progress increments.

Generic meanings remain distinct: LEAVE_FIELD is not automatically Death, Return-to-Deck, Removal or Temporary Absence. Only qualifying DEATH_CONFIRMED advances ordinary later-death progress. Members of one simultaneous Death Cohort do not count one another as later deaths. Ordinary Revive closes its old waiting record and does not increment lifeSerial by default.

### 2.2 Skill 1 — Shroud of the Departed / Liệm Y Của Kẻ Đã Khuất

Active Skill, **Side/shared AE20**. Attack one target with the declared typed components **WILL150% WIL + PHYSICAL150% ATK**. Attack binding defaults for this exact attack owner to **POSITION / LOCK_POSITIONS** under TGT-008; a future explicit owner-scoped exception must be authored locally. Two stat components do not themselves require two hits, two Actions or a second payment.

After the **Natural Action using this Skill completes**, grant Nephthys Shield requested at **25% of this Skill's committed Actual HP Damage**. Shield absorption and Overkill are excluded from the basis; do not reconstruct the basis from nominal150% formulas or later HP differences. Retain Action identity and Effect provenance; sharing rootActionId or Damage Attribution alone cannot qualify unrelated child/Passive Damage.

Shield from this Skill can accumulate, and its total cannot exceed **Nephthys Max HP**. Raw lifetime is **2 Natural Actions of Nephthys**; creating more Shield resets the counter for the accumulated Skill1 Shield. Source-family cap and shared refresh are different declarations: a cap alone never refreshes existing contributions. Exact positive-addition/zero-addition refresh and cap reference behavior need Q2 plus any remaining cap decision.

Without a later designer exception, CLK-003's generic duration wording counts the **next two consumed owner Natural Action opportunities, including CC-lost opportunities**, and excludes non-Natural Actions. The Skill1 Action that completed before the Shield was created is not one of those future opportunities. If the designer instead specifies actual performed/completed Actions, record that explicit exception rather than silently changing CLK-003.

Only the Skill1 source family participates in this cap/refresh; other Shield sources keep their own provenance and clocks. Standard Shield contributions continue proportional depletion under SHP-002. Expiry/cleanup is not Damage absorption and cannot impersonate Skill2's incoming-Damage condition.

### 2.3 Skill 2 — When the Shroud Tears / Khi Liệm Y Rách Vỡ

Automatic paid Skill effect, **no Natural Action required**. Raw condition: in each TURN_BOUNDARY, Damage from one enemy Natural Action against **any Shield on Nephthys** exceeds **35% of Nephthys Max HP**. The comparison is strict: exactly35% does not qualify. It is Shield absorption, not Actual HP Damage and not the difference between arbitrary before/after total-Shield samples.

When eligible and Side/shared AE is at least **15**, pay **AE15 per activation** and Heal **Nephthys and her allied leader**, each requested at **70% WIL + 70% ATK of Nephthys**. Receiving Heal does not Revive a dead recipient. Cost must succeed before Heal; failed required Cost cannot produce partial restoration.

The raw TURN_BOUNDARY is not an invented actor-private boundary. Whole-Action versus immediate crossing, maximum activation count, Action-child qualification, MaxHP reference, Cost-failure finality and recipient-batch snapshot are still pending Q2. Do not turn the proposed choices into global defaults.

### 2.4 Skill 3 — Three Names in Mourning / Tam Danh Ai Điếu

Active Skill, **Side/shared AE25**. Randomly attack **3 enemies**, each with **WILL125% WIL + PHYSICAL125% ATK**. Each attack owner defaults independently to **POSITION / LOCK_POSITIONS**, without Entity binding inherited from another Ability.

The executable Target profile must declare a seeded RNG stream, final legal Candidate Pool, duplicate/shortfall policy, binding/occupant checkpoint and invalidation behavior. Distinct selection, fewer-than-three and simultaneous Damage are proposed in Q3, not yet locked. Do not infer guaranteed hit or random reselection from the name.

### 2.5 Ultimate — Not Yet Beyond the Gate / Chưa Được Qua Cánh Cửa

Ordinary Revive of **1 random ally from the Luân Hồi waiting window**, with materialization HP **35% of that ally's Max HP** and **Rage5**. Its ordinary Ultimate readiness/payment remains owned by current Action/Resource/Mode rules; no extra AE price is present in the raw kit.

Raw stat basis: **100% of the stats used when summoned from Deck**. Stat scaling from the target's own kit follows that kit's explicit reset/retention rule. This is not a death-stat snapshot, Heal, Rebirth or new-life transition by implication. Ordinary Revive preserves trueSelfId and, by current default, lifeSerial.

Target eligibility excludes a waiting record already closed by Revive or transitioned beyond ordinary Revive into Reincarnation. REC-020 bookkeeping precedes ordinary queued Revive after a qualifying death commit. Position, selection/failure/retry, leader inclusion and exact restore/read checkpoint need Q3. Failed materialization must not partially restore stats/resources or close a live waiting record.

## 3. Blocking designer questions and unapproved suggestions

These questions were sent for this task. A response must be resolved into concrete Character-local semantics here before affected normalization/architecture work proceeds.

### Q1 — Passive threshold and departure

Required decisions:

- With two Nephthys present at threshold8, does one leaving give threshold6 and force exactly2 waiting Chân Ngã, while both leaving together give threshold4 and force4?
- Does the new threshold apply immediately to already waiting entries while preserving their accumulated laterDeathCount, or only to new entries?
- If equal-age members of a Death Cohort straddle the oldest cutoff, does the whole tied group transition or is a seeded subset chosen for the exact count?

The suggested8→6/2 and8→4/4 interpretation is **UNAPPROVED**. The current architecture cannot decide the designer's intended rule. Derive threshold-change/departure ordering, same-cohort source death and missing-candidate behavior from the answer, asking any still-essential question rather than guessing.

### Q2 — Skill1 refresh and Skill2 outcome

Unapproved suggestion:

1. Only **positive actually added** Skill1 Shield resets the common2-opportunity clock; cap-to-zero never resets it.
2. Skill2 observes **one whole enemy Natural Action's own direct Damage**, once at its declared direct-Damage terminal checkpoint. Sum committed shieldAbsorbed to Nephthys, compare **>35% Action-start Nephthys MaxHP**; exclude child/Counter/Follow-up Actions.
3. Pay AE15 once if payable; insufficient AE closes that observation without retry. Heal self+allied leader simultaneously using one current Nephthys WIL/ATK snapshot.

Designer may instead require immediate per-hit crossing. Do not claim the suggestion is compelled by “lập tức”. Clarify any remaining lifecycle-validity, cap-change or same-window dependency that becomes necessary after the answer. Generic Heal modifiers/Overheal/conversion remain with HEL-001–004 unless explicitly overridden.

### Q3 — Random selection and Revive materialization

Unapproved suggestion:

- Skill3 chooses up to3 **different** legal enemies; fewer candidates means all available; simultaneous Damage.
- Ultimate chooses among still eligible allied waiting Chân Ngã, restores the declared Deck-summon stat basis and target-kit scaling policy, discards temporary old status, then initializes HP35% of restored MaxHP and Rage5.

Required further decisions: leader eligibility; revive Position; occupied Position or no-candidate behavior; failure versus reselect/retry; restore source and checkpoint where the Deck stat basis can change. No silent nearest-empty or retry rule.

## 4. Composition against the verified current architecture

The following is a **partial composition review**, not an execution-ready normalized plan or an approved-gap ledger.

| Mechanic | Existing capability and exact owner | Current conclusion |
| --- | --- | --- |
| Mixed Skill1/Skill3 Damage | 04 DamageSpec; P-040 BUILD_DAMAGE_PACKET / P-041 RESOLVE_DAMAGE_PACKET / P-042 COMMIT_DAMAGE_RESULT; DMG-001–003; source snapshots and own-owner TGT-008 binding | Existing composition; unresolved Target/hit structure still requires explicit authored profile. |
| Skill1 committed-Damage-derived Shield | 04 §35.1 Shield/ActualHP metrics; P-043 AGGREGATE_DAMAGE_RESULTS → P-046 CREATE_SHIELD_INSTANCE or P-047 MODIFY_SHIELD_INSTANCE; ACT-033 completion settlement, SHP-005/006 | No new metric, Tag or Primitive needed. Positive-family addition cap is already supported. Refresh must be separately authored. |
| Common Skill1 lifetime | 04 Shield stacking/duration; State/Shield/Clock owners; P-021 MODIFY_STATE_INSTANCE and P-047/P-048; CLK-003 | Attempt generic shared duration/controller composition after Q2; do not create a Shield priority/layer from common provenance. |
| Skill2 absorbed-Shield threshold | 04 §35.1 already allows Shield absorbed; P-043 explicitly aggregates Shield Damage; DMG-020/021, TRG-013; existing Action Result Store and Snapshot Service | Existing metric and immutable aggregation; finalized provenance/checkpoint awaits Q2. A specialized result-predicate enum is not the only composition route. |
| Paid automatic self+leader Heal | P-034 VALIDATE_COST / P-035 COMMIT_RESOURCE_COST → P-044 RESOLVE_HEAL / P-045 COMMIT_HEAL_RESULT; TRG-003, CST-010, HEL-001–004, RES-002 | Existing composition; no fake Natural Action/class regeneration. Pay-once identity and batch/lifetime depend on Q2. |
| Random enemies / waiting ally | P-010 BUILD_CANDIDATE_POOL / P-011 FILTER_CANDIDATE_POOL / P-012 SELECT_TARGETS; TGT-001/005/006/007, RNG-001–004 | Existing seeded selection machinery; candidate/duplicates/invalidation not inferred. |
| Ordinary Revive/stat and Rage restore | 04 ReviveSpec statRestore/stateRestore/resourceRestore/position; P-063 CREATE_REVIVE_PENDING, P-085 VALIDATE_MATERIALIZATION_CONSTRAINTS, P-069 MATERIALIZE_ENTITY; REV-001–006, REC-020 | Existing profile-based machinery; required position/restore policy still blocks executable plan. |
| Window+2 and oldest departure transition | 04 ReincarnationSpec.waitingWindow and FORCE_ENTER; P-064 ENTER_REINCARNATION_WAITING / P-065 ADVANCE_REINCARNATION_WAITING / P-066 ENTER_REINCARNATION; 06 world ledger §§88–92 | Candidate pressure only. Current fields/operations do not independently prove a live source-contribution/re-evaluation/order law. Await Q1 before proving any bounded generic gap. |

Current **02/03 conclusion: NO NEW TAG / NO NEW PRIMITIVE** from the known formulas. Existing smallest-owner Functional Tags: Damage Effect `DAMAGE`, each component `PHYSICAL_DAMAGE` or `WILL_DAMAGE`; Skill1 Shield Effect `SHIELD`; Skill2 Heal Effect `HEAL`; Ultimate lifecycle Effect `REVIVE`; Passive's actual waiting/forced-Reincarnation interaction `REINCARNATION`. Costs, automatic activation, threshold, random selection, Action type, source-family cap and clocks are Schema/Contract facets, not invented Tags. Ordinary Ultimate Revive receives neither HEAL nor REINCARNATION merely because it targets the waiting window. Exact Tag ownership for any stat/resource restore is checked after Q3 resolves whether initialization or a separate modifier Effect is intended.

All00–08 impact is reviewed, not presumed to require nine modifications: 00 needs navigation only when a Character entry is delivered; 01 already distinguishes Field Presence, waiting, Death Cohort, Shield/ActualHP and Revive; 02/03 already supply capabilities/operations; 04/05/06 may need only a proven bounded waiting-policy addition; 07 retains generic Mode/SSI/Arena ownership unless an actual Mode-specific rule is established; 08 adds only justified declarative regression obligations after locks. No draft architecture addition is current merged canon.

## 5. Nonblocking boundaries and remaining validation

Explicit existing laws remain authoritative: Standard Shield proportional source ledger; actual committed result metrics; death-before-ordinary-Reaction bookkeeping; ordinary Revive lifeSerial; owner-scoped Slot defaults; no list/Entity/Slot/Event order as a hidden winner; no Field-leave cleanup masquerading as expiry or Damage. Anatta's received-Action/MaxHP example shows reusable aggregation, but its explicit Character choices do not answer Q2 for Nephthys.

If other kits conflict on waiting thresholds, temporary status retention, anti-Heal, Shield amount admission or materialization, first inspect their applicable current canon. Do not invent a global priority/Authority resolution merely to finish this Character. Unsupported future Mode/external profiles remain NOT BLOCKING only while the immediate task does not need them.

This draft has been checked for raw formulas, authority separation, existing Tag/Primitive namespaces and unresolved-answer preservation. It **has not completed the final six-pass audit** and is **not merge-ready**. Required next work: incorporate designer answers → rederive requirements independently → finalize composition/gap proof → apply only justified `.md` deltas → inspect actual diff/reference consistency → run all six passes → review/verify PR and resulting main. Do not run executable app/build/runtime tests in Architecture Phase.
