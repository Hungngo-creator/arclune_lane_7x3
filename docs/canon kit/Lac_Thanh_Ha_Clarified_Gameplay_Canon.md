# ARCLUNE — LẠC THANH HÀ / QINGHE — CLARIFIED GAMEPLAY CANON

**Revision:** R1 — explicit designer kit and timing/result locks.
**Source:** designer-supplied Lạc Thanh Hà kit in the current task, 2026-10-09. No confidently matching complete repository raw entry was identified; do not replace an unrelated numbered entry.
**Architecture inspection base:** merged main `1c28bbf1cae17aeac91c8844f6788863d2b84167` (B.3/E.20/F.22/G.21/H.3/I.23). Working changes are proposed delta until verified merged.
**Status:** supplied gameplay locked; three additional composition decisions pending in §8. No implementation/build result is asserted.

## 1. Identity and common semantics

SSR · Support. Qinghe refers to Lạc Thanh Hà throughout this document. Basic, native Element, Base Deployment Cost and execution-ready numeric metadata were not supplied; they are UNRESOLVED / NOT BLOCKING for this kit's architecture audit. Do not invent a Basic or infer Water from names.

No clause in this kit bears an Authority tier. Reversed Healing is an ordinary Debuff; Prime + Thần Tính can refuse it through current State Admission. Rank, Class, skill names and state names create no Tag, Primitive or Authority.

An **owner-associated boundary** is the existing global TURN_BOUNDARY whose originating consumed Natural Action opportunity belongs to Qinghe. It is a qualification of boundary provenance, never a new/private boundary or an ACTION_COMPLETED requirement. Child Actions, Reactions, other Actors' opportunities, dead POSTMORTEM_WAIT and SSI pass-contact are not Qinghe's consumed Natural opportunities. A CC-lost opportunity still qualifies.

Heal follows ordinary admission/modifiers. Lifecycle-invalid or HP_ZERO targets cannot be rescued by ordinary Heal; there is no Death Prevention here. Full allied-field recipients include every lifecycle-valid battlefield unit with HP: Qinghe, Characters, Summons and Leader, with the exact authored Prime + Thần Tính exclusion only where stated. Membership is deduplicated under ordinary recipient/provider law. No full-field Heal retargets an invalid branch.

## 2. Passive — Returning Tide of Life / Sinh Triều Hồi Chuyển

Every qualifying owner-associated boundary resolves one simultaneous allied-field Heal:

```text
Qinghe Natural Action opportunity consumed
→ if an Action occurred, close that Action and required blocking settlements
→ its global TURN_BOUNDARY
→ Passive settlement: capture Qinghe WIL/ATK once and eligible recipients
→ simultaneous Heal branches
→ SSI continuation
```

Each recipient requests `0.40 × WIL + 0.40 × ATK` from that same settlement snapshot. Exclude Prime with Thần Tính. A CC-lost opportunity needs no Action/completion Event and still heals. No recipient-to-recipient resnapshot, random selection or retarget.

## 3. Skill 1 — Thread of Returning Breath / Hồi Mệnh Ti

Automatic Reaction; required Cost group = **15 Side AE + 2% Qinghe CurrentMaxHP**. It consumes no Natural opportunity.

Observe each other allied **Character with Chân Ngã** that is lifecycle-valid. A threshold episode exists while `0 < CurrentHP <= 0.12 × CurrentMaxHP`. Equality qualifies. Create an episode when a valid observed subject first satisfies this predicate, including valid initialization. Each subject has its own episode identity and one successful activation allowance.

`CurrentHP > 0.12 × CurrentMaxHP` ends that episode; the next return to the qualifying range may create another. MaxHP changes can change the predicate even without HP Damage. Repeated DoT/small HP changes while still low do not create new episodes. HP_ZERO/death/retired subject cannot retain a rescue activation into a new lifecycle/presence.

At an armed episode's attempt:

```text
revalidate exact ally and threshold episode
→ validate 15 AE and MaxHP payability together
→ atomically commit both required Costs and successful episode consumption
→ snapshot Qinghe WIL, ATK and post-payment CurrentMaxHP
→ Heal that exact ally
```

Requested Heal = `1.00 × WIL + 1.00 × ATK + 0.03 × postCost CurrentMaxHP`.

Failed validation/payment does not consume the episode or partly debit AE/capacity. A later independent exact Side-AE mutation can reconsider the still-armed same episode; no polling, background retry or HP mutation is required. Once successfully activated, a denied/zero/converted Heal does not restore the allowance. If the target becomes invalid between admission and Heal commit, only that Heal branch fails: no retarget, no refund, episode remains consumed.

MaxHP payment reads Qinghe's **CurrentMaxHP at that payment checkpoint** and commits `-0.02 × M_payment` as a battle-persistent capacity debit. Preserve absolute CurrentHP, clamping only above the new cap. It is Cost, not Damage/HP Loss/Heal; Shield/Reflect/Lifesteal and Damage reactions do not process it. Repeated successful payments compound on their current payment bases. Leaving field, death and Revive do not restore it; battle reset or an explicitly authorized restoration may. Ordinary normalized numeric/payability rules remain authoritative, with no invented capacity floor.

Skill 1 **may Heal a Prime with Thần Tính** when that ally otherwise qualifies. Passive/Ultimate's recipient exclusions do not propagate to it; Thần Tính is not generic Heal immunity.

Episode maintenance observes every relevant stable health commit, including this Skill's Heal. Its own settlement may end an episode by restoring above12%; it must not recursively activate another payment from its own Cost/Heal. Successful-consumed episodes stay consumed if conversion leaves the ally below threshold. Multiple armed subjects require the pending explicit local order in §8, never Slot/list/Event priority.

## 4. Skill 2 — Sutra of Reversed Mercy / Nghịch Từ Chân Kinh

**30 AE.** Build a pool of occupied enemy Slots whose current occupants can ordinarily admit this Debuff; State Admission/immunity eligibility applies. Seeded RNG selects up to three distinct Slots. With one/two legal Slots use all; zero makes the Skill illegal, with no cast/payment/RNG target draw. Read-only admission probes create no State/payment.

Lock the selected Slots, then at each State-application checkpoint read its current occupant. Revalidate occupant presence/lifecycle and ordinary State Admission; invalid/empty/immune branch fails locally with no reroll, retarget or paid-Cost refund. Movement does not turn the locked Slots into Entity tracking. Each admitted recipient gets a distinct State instance.

### 4.1 Reversed Healing / Phản Hồi Phục

For every incoming ordinary Heal, including active Skill, Passive, Lifesteal, pulses, ally/global/self-cast Heal and other ordinary sources, while the recipient owns this active instance:

```text
incoming Heal
→ ordinary Heal admission and applicable modifiers
→ seal final requested Heal before restoration/Overheal
→ cancel restoration (and do not manufacture Overheal)
→ instance-owned TRUE Damage of exactly that sealed amount
→ ordinary TRUE-eligible Shield handling
→ non-lethal HP floor2
→ committed Actual HP Damage receipt
```

The only authored exception is **the recipient's intrinsic/self HP Regen**. A self-cast Heal is still converted. Classification is semantic provenance, never a source-is-recipient heuristic. This fixed converted amount is taken to Shield input, without recalculating a source Damage formula or applying the Heal modifiers twice. TRUE bypasses ordinary ARM/RES/reduction and does not implicitly Pierce Shield.

After Shield, permitted Actual HP Damage is at most `max(0, HP_before - 2)`. Floor2 truncates HP removal; it never raises HP already below2 and never truncates Shield absorption before the Shield phase. At300HP, requested500, no Shield → Actual298, HP2. Shield absorption, the discarded202 and any other truncation are not Actual HP Damage.

### 4.2 Instance threshold and lifetime

On successful application, snapshot `M = target CurrentMaxHP`. Initialize `D=0` for that exact instance; threshold is permanently `0.35 × M`, independent of later MaxHP changes.

After each converted-Damage terminal, fold only its immutable **Actual HP Damage** into D, exactly once. Never count Shield absorption, requested amount, non-lethal truncation/overkill, unrelated Damage/DoT/Skills, another target, another instance or another Qinghe's Debuff. After the fold, `D > 0.35 × M` immediately completes/removes this instance. Equality does not complete it.

Normal duration ends at Qinghe's next owner-associated boundary following a Natural opportunity **after activation**. The immediate boundary after the casting opportunity does not expire the new instance. CC consumption of the next opportunity still ends the window. Other Actors' boundaries and non-Natural Actions do not count. Each activation/window retains its own creation/opportunity identity; stale expiry cannot remove a replacement instance.

### 4.3 Completion settlement versus removal

Only **owner-window natural expiry** or **strict-threshold early completion** seals an eligible settlement, requesting Qinghe Heal `0.30 × that instance's D`.

If multiple instances complete at the same checkpoint, sum their requested Heals into **one Qinghe settlement batch** before ordinary Heal admission/modifiers/restoration. No instance order influences the request; each sealed result is consumed once. Do not first heal per instance and then sum Effective Heal. Retain the sealed D/completion refs after normal State retirement until this finite settlement is terminal; later consumers cannot read a retired live counter.

Cleanse/purge, target death or target field leave before qualifying completion are removal, not completion, and pay no30% Heal. No cleanup Event masquerades as expiry. Concurrent/different instances need an actual conversion-claim law if more than one matches the same incoming Heal; do not multiply the request or select by State insertion order. Same-source reapplication and source-loss policy await §8.

## 5. Skill 3 — Twin Petals of Quietus / Song Hoa Đoạt Mệnh

**25 AE.** Seeded random selection of up to two distinct occupied enemy Slots. Use all when fewer than two; zero makes the Skill illegal. Lock Slots; at Damage checkpoint resolve current occupants, skipping invalid/empty branches without reroll or retarget.

Each valid recipient gets one mixed hit: **PHYSICAL100% ATK + WILL100% WIL**. The two recipients resolve in one simultaneous Damage batch under ordinary source-stat/recipient/mitigation/result law.

At **Skill 3 Action start**, capture `M_cast = Qinghe CurrentMaxHP` once. After direct-Damage branches and mandatory lifecycle are terminal, count unique target lives whose DEATH_CONFIRMED was caused by this Action's own **direct Skill3 Damage**. Sharing rootActionId or crediting Qinghe is insufficient. Later DoT, Reaction, Follow-up, child/unrelated Damage and overkill create no additional entitlement.

Each qualifying confirmed death grants battle-persistent `+0.02 × M_cast` MaxHP. Two grant `+0.04 × M_cast`, never `×1.02²`. Commit the summed grant once with preserve-absolute-CurrentHP reconciliation; growth does not Heal. Immediate prevention without DEATH_CONFIRMED grants nothing; subsequent Revive does not erase an already confirmed qualifying death/result. Later leave/death/Revive does not erase this battle-persistent earned growth.

## 6. Ultimate — Ten Thousand Lives Return / Vạn Sinh Quy Triều

Retain ordinary Mode Ultimate readiness/Rage/Cost. **After Ultimate Cost commit**, snapshot Qinghe ATK, WIL, CurrentMaxHP and eligible full allied-field recipients once.

Each requests `1.80 × WIL + 1.80 × ATK + 0.10 × Qinghe CurrentMaxHP` from that shared snapshot. Include Qinghe/Character/Summon/Leader; exclude Prime with Thần Tính. Resolve simultaneously; invalid snapshotted recipient fails only its branch, with no retarget/requery/resnapshot.

Overheal policy = **DISCARD**. This Ultimate creates no Shield. DISCARD alone does not author §17.2 Shield-conversion DENY: an independent foreign generic Overheal consumer can act only under its own actually applicable Contract/origin semantics. Do not grant that foreign interference merely from a name, or forbid it by fabricating a kit-specific immunity.

## 7. Composition proof and architecture ownership

| Requirement | Current composition / exact boundary |
| --- | --- |
| Seeded distinct Slot selection, empty legality, occupant revalidation | Existing TargetSpec/POSITION lock, TGT-001/006/008, RNG, State Admission and local failure. No Entity exception. |
| Common source/recipient snapshots and simultaneous Heals/mixed hits | Existing SnapshotSpec, SNP-*, RES-002/008, Heal/Damage/Transaction owners. |
| Per-ally threshold episode | Existing owner/subject-keyed internal State + episode generation/one-success cap, stable HP/MaxHP/exact Side-AE observations under TRG-016. Required Cost/admission joins success consumption; reset bookkeeping does not need a new Tag/Primitive/episode manager. Multi-subject local order still needs §8. |
| Qualified boundary after consumed owner opportunity | Global CLK-001 and §7.19 already settle at boundaries; current Schema lacks an explicit originating consumed-owner-opportunity filter and later-than-activation duration qualification. Replacing it with ACTION_COMPLETED or opportunity-start expiry loses the supplied timing/CC behavior. Extend existing boundary/Duration/Trigger records. |
| MaxHP Cost | Existing CostGroup validation/commit plus P-031/032 capacity/reconciliation can execute the writes, but HP Cost/P-036 consumes CurrentHP and generic post-payment mutation cannot make AE+capacity payability atomic. Add bounded MAX_HP kind/profile in CostSpec; keep the same Cost/Stat/Transaction owners. |
| Heal→TRUE before restoration | PRE_OVERHEAL numeric MULTIPLY cannot redirect operation; post-Heal Damage uses missing/Effective Heal and leaves restoration/Overheal observable. Extend State's incoming-Heal transform at HEL-001's pre-restoration boundary, exact instance→Damage result binding and bounded post-Shield floor. |
| D threshold and completion payout | Existing State counters/Snapshot/result refs/finite termination DAG and batch reduction; conversion must publish exact instance-owned terminal receipts, fold before dependent threshold/removal and retain cause/sealed values. No nominal reconstruction or new accumulator service. |
| Two-death growth | Existing own-direct provenance, confirmed-death result/cohort, common Action-start Snapshot and summed MaxHpMutationSpec. No global death Trigger or new Primitive. |

Functional capability mapping uses existing **HEAL**, **DEBUFF**, **DAMAGE**, **TRUE_DAMAGE**, **PHYSICAL_DAMAGE**, **WILL_DAMAGE** and **MAX_HP_MUTATION** on the appropriate Effect/Cost owner. MAX_HP capacity debit is not SELF_HP_COST, whose registry meaning is CurrentHP payment. Automatic/Reaction/threshold/Slot/instance/completion cause are facets/data, not Tags. No Authority is inferred.

| File | Impact |
| --- | --- |
| 00 | Navigation/version recovery for this Canon and proved delta only. |
| 01 | Clarify qualification of the existing global boundary versus private boundary/personal-window clocks. |
| 02 | NO CHANGE; existing capability meanings suffice. |
| 03 | NO CHANGE; P-034 validation, P-035 AE, P-031/032 capacity, P-044/045 Heal and existing Damage/State/Snapshot/Result operations compose under Contracts. |
| 04 | Bounded boundary provenance/duration, MaxHP Cost and State incoming-Heal transform profiles; pending local cohort order only after designer answer. |
| 05 | Governing CLK/CST/HEL/DMG/State/Trigger transaction/cause law; no new Contract-ID family. |
| 06 | Retain exact refs/lifetimes/terminals in existing Scheduler/Cost/State/Heal/Damage/Transaction owners; no Character branches. |
| 07 | NO CHANGE if existing SSI scheduler can expose declared opportunity/boundary provenance; unsupported foreign Modes require an explicit adapter, never guessed timing. |
| 08 | Declarative regression obligations for newly proved boundaries/interactions; no executable game tests in Architecture Phase. |

## 8. Outstanding decisions

Three internally observable decisions were sent to the designer and remain pending:

1. Multiple armed Skill1 allies at one checkpoint: local order determines shared AE winners and sequential CurrentMaxHP/Heal scaling. No list/Slot/Event winner is assumed.
2. Skill2 reapplication by the same Qinghe to a still-active recipient: replacement versus multiple independent instances, with an explicit incoming-Heal claimant law if overlapping.
3. Skill2 source death/field leave: source-scoped removal versus retained instance/paused owner clock, with explicit source Heal validity.

No dependent executable normalization or merge-ready claim is made until these decisions are locked. Independent supplied gameplay/architecture work continues.

Non-blocking boundaries: missing roster metadata/Basic, ordinary numeric normalization, unsupported Mode adapters, future conflicting foreign conversion/settlement profiles and unrelated global Reaction priority. They do not reopen any supplied threshold, Cost, exclusion, formula, snapshot, floor, Slot or completion-cause lock.
