# ARCLUNE — NEPHTHYS — CLARIFIED GAMEPLAY CANON

**Revision:** R1 — designer answers for Passive, Skill1/2, Skill3/Ultimate and same-completion Shield refresh supersede the R0 suggestions.
**Status:** GAMEPLAY_CLARIFIED / ARCHITECTURE_NORMALIZED; final document audit and verified delivery recorded in §5.
**Source:** `Ý tưởng nhân vật 4.md`, identified entry `11) Nephthys`; latest designer correction in this task. Raw formulas remain provenance; no unrelated raw entry is replaced.
**Verified architecture base:** actual merged main `9f7eb05252b49f0d247d234cd520dde965cd1c0f`; INDEX-13 / E.11 / F.13 / G.12 / H.1 / I.12. Proposed architecture refinements are working-branch deltas until merged.
**Phase/scope:** Architecture Phase, .md only. Follow current root AGENTS.md; no implementation reads/build/runtime tests.

## 1. Identity, authority and boundaries

Rank, Class, native Element, numeric base stats, Basic profile and deployment Cost Budget remain **UNRESOLVED / NOT BLOCKING** for architecture normalization. Ordinary Skill/Ultimate admission/payment, numeric/cap/overflow, Hit Admission, stat composition and Mode SSI rules remain with their current generic owners. This is not generated executable Character data.

Latest explicit designer locks below supersede the R0 quota2/4 suggestion, Entity-random Skill3 suggestion, opportunity-counting Skill1 duration and any suggestion that Revive is Deck deployment. Nephthys gains no unstated Authority from her name or her interaction with the World Axiom.

## 2. Locked gameplay

### 2.1 Passive — The Dead May Linger / Người Chết Được Phép Nán Lại

The ordinary Reincarnation waiting threshold is **4 later qualifying deaths**. Each **active Nephthys Field Presence** contributes **+2**:

| Active Nephthys contributions | Effective ordinary threshold |
| --- | --- |
| 0 | 4 |
| 1 | 6 |
| 2 | 8 |

Both Sides contribute to the same applicable World Luân Hồi ledger. A contribution is available only while its exact owning Field Presence is active. It is not a permanent +2 per summon, battle-start mutation, passive cast or dead body. Repeated rule/index construction for the same ownership/lifetime cannot add it twice.

At committed Field leave, remove that contribution immediately and re-evaluate **all currently waiting entries** against the resulting threshold. Preserve their accumulated laterDeathCount exactly; do not reset, rescan historical deaths or manufacture additional deaths. Entry closes into Reincarnation if its retained progress reaches the effective threshold. Increasing the threshold affects still-waiting entries; it does not reopen already closed/reincarnated entries.

The raw2/4 description is an approximate consequence of sequential death history, **not a quota**. Same-cohort entries with the same progress receive the same threshold decision. Every qualifying tied entry transitions: no oldest top-N cutoff, RNG, Entity/Slot/list/Event winner.

If two contributions leave in one transaction/checkpoint, apply both removals and re-evaluate once against the final threshold, e.g.8→4. Do not expose a per-leave-event8→6 intermediate decision. Preserve coherent committed Field Presence, waiting progress and lifecycle state before ordinary queued Revive/Reactions can observe the result.

Qualifying Death Cohorts retain REC-002–004: advance entries that existed before the cohort by its qualifying member count; create cohort members at0; members never count one another. LEAVE_FIELD alone is not Death. A source death can also cause Field leave; its qualifying death and contribution availability must use the coherent committed lifecycle/ledger checkpoint, not incidental service/Event order.

### 2.2 Skill 1 — Shroud of the Departed / Liệm Y Của Kẻ Đã Khuất

Active Skill, required **shared/Side AE20**. Attack one legal enemy target using its ordinary single-target profile and this exact attack owner's **POSITION / LOCK_POSITIONS** default. Formula: **PHYSICAL150% ATK + WILL150% WIL**. Ordinary Slot recipient/Hit admission applies; binding does not imply Guaranteed Hit or Entity tracking.

After the Natural Action using Skill1 has completed its direct Effects and mandatory lifecycle, settle the self-Shield request before that root's ACTION_COMPLETED clock processing:

`requestedShield = 0.25 × this Skill1 root's own-direct committed ActualHPDamage`

Consume its immutable committed result projection. Exclude absorbed Shield, Overkill, unrelated Damage and child/Counter/Follow-up/Reaction/DoT/Mark/Passive receipts merely sharing root ancestry or Attribution. No nominal150% reconstruction.

This Skill1 source family comprises the exact runtime source owner and stable origin Skill/Shield-Effect definitions on Nephthys. Its accumulated Shield uses the existing **commit-time source-family cap = CurrentMaxHP**, **CLIP_NEW_ADDITION** under SHP-006. Other sources do not count toward this family cap or refresh. A cap change alone does not silently trim existing contributions; the existing cap limits the new addition.

All Skill1 contributions share **one family duration clock**, not one independent expiry per cast:

- actual committed addition >0: add the contribution and reset the whole family clock to **2 future actually-performed Natural Actions**;
- a partial cap-clipped positive addition still resets;
- actualAdded=0, including a fully capped request, does not refresh/create/mutate duration work;
- the Action whose completion creates/refreshes this Shield is outside the freshly reset future-action clock;
- CC-lost opportunities and non-Natural Actions do not decrement.

At each actually-performed Natural Action of Nephthys, process the shared family clock at **ACTION_COMPLETED**. For a Skill1 grant on that completion, the latest designer lock is:

`Natural Action direct Effects complete → Skill1 Shield addition commits → actualAdded>0 adds/stacks and refreshes the whole family to2 → completion clock processes`

Successful refresh wins expiry at the same checkpoint: even when the old clock was at its last unit, **old Shield contributions remain** and the resulting clock is **2 future Natural Actions**. The creating/refreshing Action consumes no unit of the fresh clock. If actualAdded=0, no refresh occurs; that completion consumes the old clock normally, and a clock reaching0 expires the existing Skill1 family. Never expire old contributions first to manufacture cap headroom for a new grant.

The grant/result decision is finite root-linked blocking work under **ACT-032**, before this root emits ACTION_COMPLETED. Completion clock work must finish under the existing **ACT-033** handoff dependency before the next Natural Action. Do not import CLK-003's CC-opportunity default into this explicit actual-action exception, or wait for ACTION_COMPLETED inside a blocker of that same completion.

Preserve Standard Shield proportional source depletion, independent source provenance and cause-aware removal. Expiry/removal is not Damage absorption. The generic shared clock follows its exact family/State ownership and actual retained contributions; no new priority layer or Character manager. Transition/Revive retention is resolved by the applicable declared lifecycle/restore profile, not an invented source-leave Cleanse.

### 2.3 Skill 2 — When the Shroud Tears / Khi Liệm Y Rách Vỡ

Automatic paid **settlement, not a new Action**. For each **enemy actually-performed root Natural Action**:

1. At hostile Natural Action start, snapshot Nephthys **CurrentMaxHP** once.
2. Resolve all **direct Damage owned by that root Natural Action**, then mandatory lifecycle.
3. Aggregate immutable **actual shieldAbsorbed received by Nephthys across all her Shield sources/layers** from that exact own-direct result set.
4. Evaluate once: `absorbed > 0.35 × startMaxHP`. Exactly35% fails.
5. If qualified, revalidate Nephthys alive/valid; if shared AE>=15, pay **AE15 exactly once**.
6. After payment, snapshot current Nephthys **ATK/WIL once**, resolve one simultaneous Heal batch to the deduplicated recipient union **{SELF, allied Leader}**.

Each valid recipient gets requested **70% ATK + 70% WIL** from the same snapshot. If Nephthys is the Leader, the union contains one Entity and emits one Heal. Invalid/missing Leader omits only that recipient, without retargeting or failing self-Heal. Invalid Nephthys skips the settlement.

Exclude all child/Counter/Follow-up/Reaction/DoT/Mark/unrelated Passive Damage even if ancestry/credit matches. Exclude nominal Damage, arbitrary net Shield differences, expiry/cleanup/manual removal and overkill. Historical absorbed amounts do not change when Shield contributions later expire.

Insufficient AE: skip once, debit nothing, emit no Heal and create **no delayed retry token**. Completion/event redelivery cannot pay or Heal again. This mechanism does not grant SSI/class regeneration or require another Natural Action. “Lập tức” is locked to this **Natural-Action result checkpoint**, not hit-by-hit crossing and not an actor-private TURN_BOUNDARY. Use a finite local direct-result/lifecycle settlement before enclosing root completion, without global Reaction priority.

Heal uses ordinary HEL-* admission/modification/Overheal semantics. Do not add an Overheal-to-Shield conversion or anti-Heal exception from this kit.

### 2.4 Skill 3 — Three Names in Mourning / Tam Danh Ai Điếu

Active Skill, required **shared/Side AE25**.

`current occupied legal enemy Slot pool → seeded RANDOM up to3 DISTINCT Slots → lock coordinates`

If fewer than3 occupied legal Slots exist, lock all available Slots. Selection is of Slots, not3 cached Entity identities. Preserve the exact attack owner's POSITION / LOCK_POSITIONS binding.

At the declared Damage-recipient checkpoint, read each locked Slot's **current legal occupant**:

- original occupant moved away and Slot empty: miss locally;
- another legal Entity occupies the Slot: that new occupant receives the hit;
- no reroll, replacement Slot or chase of the old Entity.

Use **one common ATK/WIL snapshot** for all Skill3 hits. Per occupied locked Slot: **PHYSICAL125% ATK + WILL125% WIL**. Freeze resolved recipients/calculation state at that checkpoint; resolve all hits **SIMULTANEOUS**, then mandatory lifecycle. Do not re-query between sibling calculations. Ordinary Hit Admission remains separate.

### 2.5 Ultimate — Not Yet Beyond the Gate / Chưa Được Qua Cánh Cửa

Ordinary **Revive**, not an attack and not DEPLOY_FROM_DECK. Identity target is one specific allied waiting Chân Ngã.

At legality/resolution:

`allied waiting entries → ordinary Revive-eligible filter → seeded RANDOM exactly1 eligible ally → lock that identity`

**Leader is included**. If the eligible pool is empty, Ultimate is **not legally activatable**; do not cast and manufacture pending retry.

Destination:

1. Prefer that target's death Slot if currently **TRULY_EMPTY and legal**.
2. Otherwise seeded RANDOM choose another **TRULY_EMPTY legal allied Slot**.
3. With no legal empty allied Slot, Ultimate is **not legally activatable**.

TRULY_EMPTY excludes active occupant, reservation, pending Revive, temporary-absence owner and death-waiting/lifecycle claim. Death-Slot preference never overrides those claims. Check actual current occupancy/claims through POS-009, not a visual empty cell. Read-only legality probes neither mutate state nor consume a gameplay target/destination draw; actual resolution binds its seeded choices once under existing Target/RNG/transaction law.

After identity lock, revive-invalid target (e.g. entered Reincarnation): **local Revive failure / NO RETARGET / NO WAIT**. No second allied target is randomly chosen. Materialization revalidates its protected identity, restore plan and selected destination; a failed/stale transaction commits no partial restoration or waiting-record closure. No hidden reselection/retry.

Successful restore, in the same lifecycle/materialization transaction:

- preserve **same trueSelfId** and ordinary Revive lifeSerial;
- restore normal Character stat baseline as a fresh revived life;
- remove old temporary Buff/Debuff/Mark/Shield/field-life temporary states;
- target-owned explicit BATTLE_SCOPED/PERSIST_ACROSS_REVIVE/reset-on-Revive stat or progression rules follow **that target kit's own declared retention/reset law**; Nephthys does not override it or mint these words as new global lifecycle enums;
- stabilize stat restoration and **restored CurrentMaxHP**, then assign **CurrentHP=35% restored CurrentMaxHP** and **Current Rage=5**;
- commit materialization, resource/stat/State restoration and waiting-record closure atomically.

Revive HP assignment is lifecycle initialization, **not Heal/Overheal**. Restoring Rage is initialization under this Revive profile, not an extra Damage-derived gain. Do not emit DEPLOY_FROM_DECK or trigger Deck-only effects, payment or full-Rage deployment initialization. Special target-owned restoration laws are composed explicitly; ordinary lifeSerial preservation is not a reason to keep temporary field-life states.

## 3. Shared-clock composition and latest-source precedence

The final designer reply locks grant/positive refresh before completion-clock expiry. It supersedes the earlier shorthand “after the Natural Action completes” wherever that shorthand would delay the grant until after expiry. No gameplay question remains pending for the mechanics in §2.

Bind the shared clock to one existing source-owned StateRef for the Skill1 Shield family, keyed by runtime owner, stable origin Skill/Shield-Effect definitions and the applicable retained family lifetime. Contributions retain their own immutable addition/result provenance but reference that family clock. Maintain its remaining actual-completion count and positive-refresh originating ActionRef/version; these are ordinary State/clock composition, not new reference namespaces or global runtime fields.

At Skill1 root ADEC, seal the own-direct ActualHP projection, then commit P-047's cap-clipped addition and its typed ShieldAdditionResultRef. Only a positive committed amount updates the family clock and refresh-origin evidence. Register this finite ACT-032 dependency before root completion; the last-unit old Shield is still present during cap evaluation. At ACTION_COMPLETED, the same root's successful refresh preserves the fresh2 instead of decrementing it; other actually-performed Natural completions decrement the existing count once and reaching0 removes only that family. CC, non-Natural Actions, zero-addition receipts and duplicate deliveries cannot create a refresh or double tick.

State/counter updates, Shield removal, result conditions and local dependency edges use existing P-020/021/022, P-047/048, Clock/State/Shield/Transaction ownership. Preserve replay identity and the applicable lifecycle/retention law; terminal/expired/replaced StateRef delivery cannot mutate another family or new life. M-034 / Sanguinius already demonstrates positive shared refresh, actual-action counting, CC exclusion and zero-addition expiry. The new Nephthys M-105 fixture proves the now-authorized last-completion ordering; no generic Shield extension is required.

## 4. Independent current-base composition review

| Mechanic | Exact existing input → Contract → runtime owner | Conclusion |
| --- | --- | --- |
| Direct mixed Damage | 04 DamageSpec + source Snapshot + exact attack-owner TargetSpec → DMG-001–003/TGT-008/RES-002 → P-040–042, Target/Damage/Transaction owners | Existing composition. Skill3 explicitly binds selected Slots and current occupants. |
| Damage-derived Skill1 Shield | 04§35.1 own-direct ActualHP aggregate → ACT-032/SHP-005/006 → Result/P-043, P-046/P-047, Shield/Transaction | Existing25% basis, shared-family cap and positive addition receipt; pre-completion grant is a finite declared blocker, not a new metric/Primitive. |
| Shared Skill1 clock | source-owned State/duration/stacking + positive ShieldAdditionResultRef condition → existing Clock/State/ACT-032/033/SHP laws → P-020/021/022, P-047/048, State/Shield/Clock owners | One StateRef clock and source-family removal filter; positive refresh wins last-unit expiry and excludes its own Action, with required completion work before handoff. M-034 plus M-105 cover this existing composition. |
| Skill2 root-direct absorbed metric | hostile-start Snapshot + sealed root own-direct DamageResultRef projection → DMG-020/021/TRG-013/ACT-032 → Snapshot/Result/P-043/completion graph | shieldAbsorbed is already allowed by04§35.1 and P-043. Child exclusion is Effect provenance, not an ancestry shortcut. |
| Paid deduplicated Heal batch | required AE15 + explicit SELF/Leader Entity union/filter + one post-Cost Snapshot → TRG-003/CST-010/RES-002/HEL-* → P-034/035/044/045, Target/Cost/Heal/Transaction | Existing finite settlement; local recipient invalidity, paid-once identity and batch are Character data. |
| Revive selection/destination/restore | ReviveSpec eligibility/position/statRestore/stateRestore/resourceRestore + POS-009 → TGT/RNG/REV-001–007/ENT-020 → P-010/011/012/085/069 and Lifecycle/Restore/Transaction | Existing profile-based composition. No attack Slot default on Chân Ngã selection, no new Deck/Heal semantics. |
| Live waiting threshold | Passive-static owner/Field Presence + world waitingWindow declaration → REC-001/004/020 → existing static registration, Field Presence, Reincarnation ledger/Transaction | Current per-record threshold and per-record advance/force operations do not specify live contribution/all-entry re-evaluation/atomic source-leave law. This is the only presently proved generic extension. |

### 4.1 Proven bounded waiting-policy gap

**Locked requirement:** +2 per active source presence, preserve laterDeathCount, evaluate every waiting entry immediately when availability changes, one final view for simultaneous removals and no quota/tie winner.

**Composition attempted:** fixed waitingWindow at entry; P-065 waiting-progress advance/reduce; P-066 force-enter over oldest2/4; ordinary ENTER_FIELD/LEAVE_FIELD Reaction-triggered updates; static State/rule registration plus existing ledger.

**Exact failure:** fixed entry threshold leaves old records stale; subtracting progress changes the meaning/history and mishandles fresh entries; force-top-N splits tied cohorts and imposes a rejected quota; queued per-source leave listeners expose intermediate thresholds and can lose the Revive race. Registration can own the rule but lacks the typed waiting-threshold law consumed by the existing ledger. Missing semantics affect observable eligibility, not merely convenient authoring.

**Smallest extension:** a bounded positive-integer **live threshold contribution** in existing Reincarnation/waitingWindow authoring, owned by a static rule and existing Field Presence lifetime; extend **REC-001** and the existing world-ledger checkpoint. Derive one effective threshold from base plus currently active declared contributions, retain death progress, and atomically seal all-entry threshold decisions before ordinary observers. No new Tag/Primitive/Contract ID, callback, global priority or runtime manager.

Reusable for any source-presence rule extending a death-order waiting window, independent of Character ID. Preserve ordinary base4; without active contributions effective threshold is4. Ordinary entries without their own modifier still read active World-ledger contributions. Special restoration/routing behavior is unchanged. Reject unproven interactions with incompatible external threshold policies; a future policy needs its own explicit composition law.

### 4.2 Smallest-owner Tag mapping

- Passive waiting policy: **REINCARNATION** on the real world-system interaction.
- Skill1/Skill3 Damage: **DAMAGE**, with **PHYSICAL_DAMAGE/WILL_DAMAGE** on their components.
- Skill1 Shield: **SHIELD**.
- Skill2 Heal: **HEAL**.
- Ultimate materialization/restore: **REVIVE**; HP/Rage/stat initialization does not become an independent Heal, Reincarnation, RESOURCE_MODIFIER or STAT_MODIFIER Effect merely by using restore fields.

AE prices, random selection, threshold, Slot binding, automatic settlement, clocks, caps, retention and Action identity are Schema/Contract facets. No new Functional Tag or Primitive is justified.

### 4.3 Nephthys binding of the bounded waiting profile

The Passive's PASSIVE_STATIC registration binds the existing REINCARNATION Effect family to this §30.1 data:

```yaml
reincarnation:
  operation: WAITING_THRESHOLD_CONTRIBUTION
  waitingWindow:
    thresholdContribution:
      sourceOwnerRef: <Nephthys runtime ENTITY_REF>
      presenceCombatInstanceRef: <owning Field Presence COMBAT_INSTANCE_REF>
      scope: WORLD_LEDGER
      amount: 2
      composition: ADD
      availability: ACTIVE_FIELD_PRESENCE
      reevaluation: LIVE_ALL_WAITING_AT_COMMIT
```

These placeholders must resolve to existing typed refs; stable origin definitions and the presence lifetime remain required normalization inputs under §30.1. The amount2 is Character data, while base4, additive composition, coherent all-entry predicate and required world checkpoint are REC-001 law. The resulting optional waitingThresholdContributionPlan is static Effect/System registration, never a per-record P-065/P-066 loop or a Nephthys runtime branch. The remaining Skills/Ultimate bind the existing input/result/dependency/restore composition in §4 without another architecture extension.

## 5. Architecture impact and validation status

Deliverable versions: **INDEX-14 / E.12 / F.14 / G.13 / H.1 / I.13**. These are branch proposals until verified merge; the header's verified base records the independently inspected architecture used for composition, not a claim that an unmerged proposal was already canon.

00 updates navigation/version references and actual semantic deltas. 01/02/03/07: **NO CHANGE**; meanings/capabilities/operations/Mode ownership already exist. 04§30.1/51/52, 05 REC-001/required checks and 06§4/88/90 add only the proved waiting-policy authoring/law/existing-owner execution extension. 08 adds declarative **M-103–M-109**: live/tied thresholds; cohort and transfer atomicity; last-completion positive/zero Shield grants; root-direct all-source absorption and paid/deduplicated Heal; Slot binding/shared simultaneous snapshot; identity Revive/restoration; malformed-profile rejection. These are specification fixtures, never executable game-test results.

Raw kit remains provenance and is not rewritten as a replacement request. Previously merged Pilots, explicit owner-scoped Entity/Both exceptions and special Revive profiles are preserved.

No new broad global default answers future incompatible threshold rules, unsupported Mode adapters or external retention conflicts. Such future-content/profile questions remain **UNRESOLVED / NOT BLOCKING** unless the immediate task depends on them. Metadata/Basic selector profiles still prevent a claim of fully numeric executable Character data.

The six-pass audit and actual PR/head/current-main checks below must close before merging under AGENTS.md§39.4. No app code, src/, dist/app.js, builds or runtime tests are part of this Architecture Phase delivery.

### 5.1 Six-pass document self-audit

| Pass | Result and evidence |
| --- | --- |
| 1 — Semantic fidelity | PASS. Designer locks in §2 cover live4+2N/no quota/cohort ties, positive-added-only last-completion Shield refresh, hostile-start35% strict own-direct absorption, AE15 once/Heal70%+70%/Entity dedup, distinct current-occupant Slot hits125%+125%, and identity Revive/empty destination/HP35%/Rage5/target-owned restore. Latest completion sequence is explicit in §2.2/3. |
| 2 — Independent composition | PASS. Existing SHP-005/006, 04§35.1/P-043, M-034, ACT-032/033, TGT-008 and REV-001–007 express Shield/result/clock/Slot/restore requirements. §4.1 independently rejects fixed-entry thresholds, progress offsets, quota forcing and queued per-leave approximations. Only the bounded REC-001 live contribution law is extended. |
| 3 — Layer / namespace / lifetime | PASS. Schema owns the typed profile/optional plan; REC-001 owns predicate/order; existing presence/static registration/world ledger/Transaction own execution. Existing ENTITY/COMBAT_INSTANCE/definition/State/Action refs remain distinct. Exact source/origin/presence lifetime, retirement, protected revisions and terminal replay identities prevent duplicate contribution/clock work. No new Tag/Primitive/Contract ID/manager or Character branch. |
| 4 — Determinism / negative space | PASS as document review. M-103–109 specify all tied qualifiers, final simultaneous removals/cohorts/transfer, positive partial versus zero capped addition, CC exclusion, direct provenance/start snapshot/strict cutoff, insufficient AE/no retry, dedup/missing Leader, empty/replaced Slot and invalid locked Revive/claimed destination/atomic failure. Required dependencies are finite and acyclic; unrelated competing observers retain their own explicit law. |
| 5 — Prompt / source contradiction | PASS. Latest designer replies supersede the R0 suggestions and raw shorthand, including the final grant-before-clock sequence. Raw entry11 and unrelated entries remain provenance; work is .md only with no implementation reads or execution. Ordinary Revive preserves lifeSerial and target-kit exceptions; no metadata or future external-policy answer is guessed. |
| 6 — Mergeability | PASS for the reviewed document delta against actual main9f7eb05. Exactly six .md paths: this Canon plus00/04/05/06/08. All228 prior stress-case bodies are identical; M-103–109 add7. All240 Contract IDs remain, and only REC-001's body changes. Version links/fences, source-family/typed-ref scope and whitespace diff were checked; 01/02/03/07/AGENTS/raw/prior Character Canons remain untouched. Delivery still requires the actual PR/head/target checks in §5.2. |

### 5.2 Verified-delivery boundary

Delivery uses [PR #22](https://github.com/Hungngo-creator/arclune_lane_7x3/pull/22) on `codex/nephthys-gameplay-canon`. Before merge, inspect GitHub's actual six-file diff, verify its exact head and recheck main; reconcile any movement. After merge, verify merged status and the resulting main content. The PR/merged commit records the delivered ref; this Canon's reviewed base and proposed-version history do not substitute for that verification. No executable gameplay/build result is claimed.
