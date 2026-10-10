# ARCLUNE — LẬU KHẮC MA CHỦ — CLARIFIED GAMEPLAY CANON

**Revision:** R1 — latest designer locks including the explicit per-Actor Thuận Lưu Reaction correction, 2026-10-10.
**Source:** root `ý tưởng nhân vật 1.md`, `6) [PRIME] LẬU KHẮC MA CHỦ`, replaced by designer raw. Latest explicit correction wins over legacy raw/notes, old proposals and stale Quang Ảnh wording.
**Status:** GAMEPLAY_CLARIFIED / ARCHITECTURE_NORMALIZED. Declarative architecture only; no executable implementation is asserted. All internal gameplay decisions, including Thuận Lưu's local Reaction boundary, are locked.

## 1. Identity and gameplay boundaries

PRIME; **Mage**. Vũ khí: **Lậu Khắc Ma Sa — Đồng Hồ Cát Đen**. Removed raw Tags, coder/balance notes and `Mage / Controller` grant no canonical capability. Prime Rank never grants Authority; `RIVER_OF_LIGHT_AND_SHADOW` dependency never grants AXIOM Authority to every Skill. Explicit Sa Ấn/Ngưng Thời tier is **QUY_TẮC** (existing technical enum `QUY_TAC`). Real conflicts use current AUT; Prime + Thần Tính is an explicit invalid Sa recipient, never bypassed by adjudication. Sa Ấn is not declared absolutely uncleanseable.

One mixed direct hit contains **PHYSICAL100% ATK + WILL100% WIL** and grants Sa once, not once per Damage component. Successful committed direct hit suffices even if Shield absorbs100%; Actual HP Damage need not exceed0. MISS, rejected hit or invalid recipient grants none. Ordinary Damage/Hit/lifecycle rules remain applicable.

Attacks default to **POSITION / LOCK_POSITIONS** under TGT-008. At impact resolve the selected Slot's current legal occupant. Empty/invalid Slot fails locally; no retarget. Source-stat snapshot, target selection and recipient read are distinct.

## 2. Sa Ấn — ownership, application and threshold

Family key: **exact Lậu Khắc runtime owner × target life** in the owning Combat Instance. Two Lậu Khắc never share, read or consume each other's family. Source death/Field leave does not remove attached enemy marks. Target old-life cleanup removes that life's family; a new life never inherits it.

Qualifying direct hits belong to the executing owner's Basic, Skill1 or Skill3 direct graph. A child sharing a root is not automatically root-owned direct Damage. A real Forced Basic of Lậu Khắc retains Basic identity and can qualify; non-qualifying Counter/Reaction/secondary Damage does not qualify merely by attribution/root lineage.

Grant1, or2 while Skill2 is active. Cap5; no passive expiry. Consume/remove/lifecycle cleanup can terminate the family. Prime + Thần Tính, active TIME_STOP or TIME_IMMUNITY makes the recipient invalid for Sa application, even if Damage itself succeeds.

For one admitted grant, protected family update:

```text
old + grant → clamp5 → if reaches5: one threshold settlement → reset entire own family0 → Ngưng Thời
4 +2 → one trigger →0 (no overflow1)
```

Threshold consumption and the one control attempt use the exact grant/family/result identity. Duplicate delivery cannot trigger twice. AUT governs real control conflicts; a rejected control does not invent overflow or retry the consumed threshold.

## 3. Ngưng Thời and Thời Gian Miễn Nhiễm

**Ngưng Thời / TIME_STOP:** QUY_TẮC hard control consumes exactly the target's next Natural Action opportunity. It performs no Basic/Skill/Ultimate. SSI pointer advances and the global Turn Boundary occurs. No performed Action, Action-generated AE/Rage or History capture is fabricated.

After that controlled opportunity completes, apply **Thời Gian Miễn Nhiễm / TIME_IMMUNITY** for the target's next **two** Natural Action opportunities. The just-consumed stopped opportunity does not count. Sa admission is blocked during TIME_STOP and both subsequent immunity opportunities. CC-lost subsequent opportunities count; non-Natural Actions do not tick these opportunity clocks. Expiry uses normal opportunity-end settlement; foreign Actor/global-boundary clocks cannot shorten it. This kit defines the follow-on immunity for a consumed stopped opportunity, not an invented payout from every early State removal.

## 4. Basic and sequential palms

**Thời Sa Kích:** one mixed hit PHYSICAL100% ATK + WILL100% WIL, then qualifying Sa settlement.

**Hắc Sa Song Chưởng / Skill1:** required upfront25 Side AE; two sequential palms.

**Tam Luân Tán Chưởng / Skill3:** required upfront35 Side AE; three sequential palms.

Both Skills:

```text
successful Cost → one common ATK/WIL source snapshot
→ palm1 → mandatory lifecycle + Sa settlement
→ palm2 → mandatory lifecycle + Sa settlement → ... → root completion
```

Each palm independently selects a seeded random legal enemy **WITH REPLACEMENT**, using current legal selection facts at that palm's selection checkpoint. Same target may be selected twice/three times if still legal. Each palm locks its Slot and has one mixed hit with the common source snapshot; later source stat changes cannot alter remaining palm formulas. No ordinary Reaction window between internal palms (`AFTER_DIRECT_EFFECTS_COMPLETE`); mandatory lifecycle still closes. Failed Cost starts no palm; post-Cost local failures do not refund paid AE or replace targets.

## 5. Trùng Ấn Lậu Khắc / Skill2

Required upfront25 Side AE and one Natural Action activation. Nonstacking source-owned State upgrades qualifying Basic/Skill1/Skill3 hits to2 Sa.

Active through the next **three own Natural Action opportunities** after activation. Activation Action excluded; CC-lost counted; other Actors and non-Natural Actions do not decrement. Recast refreshes remaining duration to3, excludes its new activation opportunity and creates no stacked multiplier. Ordinary State admission/retention law applies; no unprovided death/redeployment retention exception is invented.

## 6. Ultimate RNG and History dependency

**Thiên Mệnh Lậu Khắc Ma Kinh** is one Ultimate root under the existing Natural Ultimate admission/resource law. After success, exactly one seeded50/50 branch draw: **Nghịch Lưu** or **Thuận Lưu**. Preserve branch with exact admitted Action/cast identity through save/replay; no branch redraw, refunded Ultimate Rage or History-based reroll.

Lậu Khắc's normalized definition declares **RIVER_OF_LIGHT_AND_SHADOW** dependency and allied Side History access. A Lậu Khắc in Deck imports it during Combat Instance setup before gameplay. Quang Ảnh Chi Hà is a reusable **World-Axiom History provider**, `CONDITIONAL_IMPORT`, owned by Combat Instance; it is not owned by Lậu Khắc. No dependency means no resident River. Dynamic capability imports at its checkpoint with a new immutable BASELINE and no fabricated earlier history. Import persists until instance end after a time Character dies/leaves. Import VFX/event may be presented independently of Kernel timing.

At import create immutable **BASELINE**. Current access profile captures one Side Mốc after each **actually performed allied Natural root** has completed all blocking child/outcome/settlement and reached ACTION_COMPLETED, before SSI continues. CC-only loss, Forced/Follow-up/Counter/Reaction/non-Natural, each hit/tick and each child produce no own checkpoint. Blocking work belongs to the root's resulting state.

## 7. Nghịch Lưu — selection and restore scope

Select **latest committed allied Side Mốc strictly before the current Ultimate Natural Action starts**; fallback to that instance's retained BASELINE if no earlier allied Natural snapshot exists. Freeze SnapshotRef when the branch resolves; the current Ultimate cannot capture a new marker over the one it reads. Its completed result may subsequently produce the ordinary profile capture for future Actions.

`SIDE_SCOPED_HISTORY_RESTORE`, using the generic History Restore profile, restores eligible allied battle state: Field/Deck membership, Position/occupancy, CurrentHP/CurrentMaxHP, typed stat contributions/effective-stat reconstruction, Shield including contribution ledger, Buff/Debuff/Mark, counters/stacks/durations, cooldown/form and same-life Character battle state. Preserve exact source/provenance. Recorded fields are never blanket restore permission; other resources require explicitly supported restore scope.

**HISTORY_RECORD_SCOPE ≠ HISTORY_RESTORE_SCOPE.** Observation may include Side AE, actor Rage and other resources. For this restore, AE/Rage are **OBSERVABLE_ONLY / NON_RESTORABLE**. Hard exclusions also cover RNG state/cursor, Reincarnation ledger/progress/death order, True-Self/new-life identity and direct Side Deployment Cost Bar restoration.

```text
AE_before_restore == AE_after_restore
Rage_before_restore(actor) == Rage_after_restore(actor) for every Actor, including caster
```

The barrier's current values, already reflecting Ultimate payment, remain exact. Never copy historical AE/Rage, compute delta, refund spent resources, undo gains, replay resource mutations, clamp them indirectly through restored capacity, initialize/fill a restored Actor's Rage or reset them on history Field entry. Enemy AE/Rage also remain current.

Enemy HP/State/Sa/Position/resources remain unchanged. Allied historical field writes emit no ordinary Damage/Heal/Overheal/HP Loss/Cleanse/Buff apply/Debuff apply/Revive/Return-to-Deck/deploy cause or corresponding trigger. History metadata/explicit HISTORY_RESTORE observation can describe the transaction; changed historical HP is not a Heal or Damage receipt. No RNG rewind, deleted trace or un-emitted old Event.

## 8. Same-life recovery, occupancy and creation reconciliation

Same allied life with DEATH_CONFIRMED, still Reincarnation Waiting and **not ENTERED_REINCARNATION**, may restore to its earlier alive/on-Field snapshot. This is HISTORY_RESTORE, not ordinary Revive; no ON_REVIVE. Preserve ledger/history/progress while reconciling current active waiting eligibility to the now-alive same life; do not restore a historical waiting counter or create a new True Self/life.

Once old life ENTERED_REINCARNATION, that branch fails locally. Never pull its True Self out, undo progress, erase/displace new life or restore old identity. Other valid allied branches continue.

Derive desired snapshot layout first. Stage out post-snapshot rewindable occupants before committing snapshot occupants. Commit allied occupancy atomically, independent of internal iteration order. An old-life destination occupied by a non-rewindable Reincarnation result blocks that old-life branch locally; no displacement or fallback Slot. Reject any otherwise ambiguous incompatible layout rather than invent a priority.

An eligible allied runtime entity absent in snapshot and created afterward, excluding protected non-rewindable Reincarnation results, is removed as **HISTORY_RESTORE reconciliation**, without DEATH_CONFIRMED or summon-death triggers. It receives no refund unless it is the paid roster deployment covered below. No resurrection/new-life identity is fabricated for an unsupported historical entity.

## 9. Paid deployment rollback and partial refund

A roster Character in Deck at selected snapshot, now on Field through **DEPLOY_FROM_DECK after that snapshot**, whose exact current paid Presence is undone, returns to Deck under HISTORY_RESTORE. The same bounded transaction derives one authored refund from that deployment's immutable **actual committed payment receipt**:

```text
refundRequested = floor(actualCommittedDeploymentCost ×0.50)
15→7; 14→7; 9→4; 7→3; 1→0
```

Add to current Side Deployment Cost Bar under the active cap; overflow is lost. Read neither Base/Current/nominal Deployment Cost nor snapshot Bar. Restore never sets the Bar, so there is no snapshot-plus-refund double restoration. Exact rollback/receipt identity prevents duplicate payout from replay or a previously undone Presence; a later real redeployment has its own receipt. Zero refund is valid. History return emits no ordinary RETURN_TO_DECK trigger unless a mechanic explicitly observes HISTORY_RESTORE.

## 10. Thuận Lưu — finite Forced Basic cohort

At branch execution freeze eligible allied battlefield-valid runtime Actors with a genuinely executable Basic Attack; Character/Leader/Summon can all qualify. Freeze actor identities/cohort, not an invented common Damage stat snapshot or target. One seeded enumeration-invariant permutation determines the local order; Slot/entityId/list/Event order supplies no gameplay priority.

Each cohort member gets exactly one real **BASIC_ATTACK + FORCED_ACTION + NON_NATURAL** (`DOES_NOT_CONSUME_NATURAL_ACTION`). Each uses its own valid Basic definition/target/source snapshot and resolves fully, including mandatory lifecycle and required blocking settlement, before the next. Invalid actor before its turn is skipped without replacement; later entrants are not added. Latest explicit designer correction selects **after each Actor**, using AFTER_EACH_MEMBER_ACTION_REACTIONS_TERMINAL:

```text
Forced Basic actor_i → mandatory lifecycle → blocking settlements → Action completion
→ ordinary Counter/Reaction belonging to that Action resolves to terminal
→ revalidate actor_i+1 → next Forced Basic
```

Each member is an independent Action. Do not hold ordinary Counter/Reaction until cohort end. The currently due exact member-causal chain uses existing Action/Event evidence and scoped gates; rootActionId equality alone cannot release siblings/unrelated work. Cohort/permutation stay frozen; Reaction never reorders/adds/replaces it. A later Actor killed/invalidated by Reaction skips at its turn. This is a local cohort policy, not the global default for every multi-Action mechanic; unrelated global priorities remain outside this choice.

Forced Basics create no SSI Natural opportunity/advancement, Natural class AE/Rage, Natural duration tick or own History checkpoint. Basic-only mechanics may observe them; separately authored non-Natural effects retain their law. Do not flatten them to copied Damage profiles or substitute Extra Natural Actions. Replay retains cohort/order/member cursor/terminal results, never re-requests committed Basics.

## 11. Architecture composition and remaining boundaries

Reuse existing generic Snapshot/History Runtime, HistoryState, HIS-001–004, P-002 CAPTURE_SNAPSHOT, P-120 RECORD_HISTORY_SNAPSHOT and P-003 RESTORE_SNAPSHOT. E.24/F.26/G.25/H.4 expose bounded dependency/capture/record-vs-restore/selection/transaction/refund/cohort data through existing owners. Sa/control/Skill2/palms use existing P-020/021/022 State operations, Snapshot/Result/Trigger DAG, ACT-012/015/041, SNP, RES-003, TGT/HIT and AUT. Forced Basics use P-001 REQUEST_ACTION; partial Bar refund uses existing resource mutation within the History transaction. No new Functional Tag, Primitive or Character-specific History subsystem.

Declarative composition (smallest semantic owners; no raw Tag promotion):

| Kit graph | Schema/IR composition and existing operations | Functional Tag ownership |
| --- | --- | --- |
| Passive Sa | exact Basic/Skill1/Skill3 direct committed-hit Result predicate → recipient/Prime+Thần Tính/State exclusion → own-family P-020/021 → protected cap/threshold P-022/reset → control attempt | Sa State: MARK; tier/threshold/clock are facets |
| Time Stop → immunity | CONTROL State + ACT-012 consumed-next-opportunity clock → exact terminal-cause dependency → two-later-opportunity admission block | immunity State: IMMUNITY; no TIME/AXIOM/HISTORY Tag |
| Basic / Skill1 / Skill3 | DAMAGE graph with PHYSICAL/WILL component Effects; Cost25/35 for Skills; shared post-Cost P-002 source snapshot; per-palm RANDOM/ALLOW_DUPLICATES Slot TargetSpec; RES-003 sequential settlement | mixed hit: DAMAGE; respective components: PHYSICAL_DAMAGE/WILL_DAMAGE; no Basic identity on Skill palms |
| Skill2 | active Natural admission/Cost25 → nonstacking self State REFRESH → own opportunity duration3 excluding activation → qualifying grant amount2 | self enhancement State: BUFF; grant count/duration are facets |
| Ultimate branch | existing seeded RNG service + finite two-branch Effect graph (weights50/50), selected once after successful root; Action-owned immutable result binding | ULTIMATE is Ability/Action identity, not Tag |
| Nghịch Lưu | dependency/capture metadata → typed SnapshotRef selector → existing P-003 bounded Side transaction → exact deployment receipt and P-033 Bar refund | History metadata/profile; no HEAL/REVIVE/DEBUFF_CLEANSE Tag inferred from historical changes |
| Thuận Lưu | frozen Target cohort + local seeded order → P-001 real member Basics + blocking member terminal dependencies; explicit per-member ordinary Reaction terminal release | child Basic carries its actual native capabilities; FORCED_ACTION/NON_NATURAL are facets |

No internal gameplay ambiguity remains. The latest designer answer fixes Thuận Lưu after-each-Actor Reaction release; no pending alternative remains canonical. Missing numeric roster metadata (base stats, native Element, Deployment Cost budget and any unrelated cooldown data), future Mode adapters and the external Deployment Cost Bar numeric cap remain **UNRESOLVED / NOT BLOCKING** for this architecture-phase normalization. Refund consumes a resolved active cap/profile; synthetic stress cap values do not define the global cap. Thiên Lôi, Thần Tính, Duy Nhất and Luân Hồi foundations are not redesigned.
