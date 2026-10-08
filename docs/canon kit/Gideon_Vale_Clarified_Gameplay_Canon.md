# ARCLUNE — GIDEON VALE — CLARIFIED GAMEPLAY CANON

**Revision:** R1 — replacement raw kit supplied on 2026-10-08.
**Status:** GAMEPLAY_PARTIALLY_CLARIFIED / PARTIAL_NORMALIZATION / INTERNAL_DECISIONS_PENDING. The locked clauses below are durable designer intent; §7 blocks only the dependent executable profiles. This is not a fully normalized or execution-ready Character definition.
**Source:** named entry **79) Gideon Vale** in [ý tưởng nhân vật 3.md](../../ý%20tưởng%20nhân%20vật%203.md), plus the latest explicit replacement. Item number alone is not identity.
**Verified architecture base:** merged `main` at `0538b53d`; B.3 / C / D / E.19 / F.21 / G.20 / H.3 / I.21. Current root [AGENTS.md](../../AGENTS.md) governs the architecture-phase workflow. Unanswered proposals are not designer approval.

## 1. Identity, precedence and scope

**Gideon Vale — SSR, Tanker.** Retain the existing descriptive ratings: DMG2 / SUR5 / CTL3 / CMP2 / MIC2 / VIS5. Class/rarity/lore supply no Authority. Quang Chủ prayer and approaching the enemy are presentation.

The replacement supersedes the older Skill1 Heal70% WIL/ATK with **150% WIL + 120% ATK**, and replaces Skill1/Skill3's global Turn Boundary wording with **owner Natural Action** clocks. Stun explicitly prevents execution of one Natural Action. Skill3 explicitly loses Taunt at the beginning of the second later Natural Action. Do not retain the old example that decremented Taunt/CD at the next global boundary.

This task updates provenance, clarifies gameplay, attempts composition and audits 00–08. It does not rebuild the implementation. No Basic Attack formula or new numeric metadata is invented from Class or Skill2.

## 2. Passive — received whole-action damage and Max HP growth

For one attacking Action, sum **committed Actual HP Damage received by Gideon from all qualifying packets of that exact Action**. Each committed component receipt contributes once: do not sum a packet aggregate and its same component receipts twice. Shield absorption, overkill, requested/raw Damage, HP Cost, HP Loss and non-Damage HP assignment are excluded under DMG-010/011/012/020.

The threshold is **strictly greater than30%**, not greater-or-equal. Evaluate the whole-action result once; crossing the threshold on several visual hits does not grant several increases. With MaxHP10,000 unchanged during the Action, one Action's ActualHPDamage3,100 qualifies and requests:

```text
gain = 0.13 × current MaxHP at this mutation's application
new MaxHP = current MaxHP + gain
10,000 → 11,300
```

Exactly3,000 does not qualify. Two distinct Actions dealing1,600 and1,500 are not one3,100 aggregate. A child Action remains a distinct Action: shared rootActionId, credited source or animation does not automatically join it into the parent's exact-Action receipts. An explicitly declared wider outcome scope would need its own gameplay authority.

This is **MAX_HP_MUTATION**, with separately declared reconciliation, not an implied Heal. The current-MaxHP gain basis is locked; the threshold denominator under mid-Action MaxHP mutation and CurrentHP reconciliation await Q1/Q2. Do not infer the denominator from the gain formula or the simple example.

The earned contribution resets when Gideon leaves the field, enters Luân Hồi, reaches **HP_ZERO**, or returns to Deck. HP_ZERO is an explicit reset cause even if Death Prevention subsequently prevents DEATH_CONFIRMED. These causes stay distinct. Remove this passive's source-traceable earned contribution, preserving unrelated MaxHP contributions; do not assign all MaxHP back to a stored BaseStat. Cleanup is not Damage, Heal, Cleanse or natural expiry. Reset/redeployment must not reapply a stored gain on initialization or Event redelivery.

Per-Action immutable Damage receipts may outlive cleanup for audit; that retention does not itself authorize a new gain for a replacement presence. A hypothetical HP_ZERO→recovery inside the same still-running hostile Action requires an explicit eligibility/result-lifetime profile before a late gain is admitted; do not guess it from ordinary Revive lifeSerial retention.

## 3. Skill1 — prayer, self Heal and defense

Required ordinary cost: **20 AE from Gideon's Side pool** in TURN_BASED_MAIN.

Capture Gideon's **WIL and ATK at cast**, from one immutable authoritative source-stat Snapshot. Requested self Heal is:

```text
1.50 × cast WIL + 1.20 × cast ATK
```

Later stat mutation cannot rewrite this Heal basis. Ordinary Heal admission/modifiers/restoration still apply; no Overheal-to-Shield or other conversion is authored by this kit.

The defense contribution grants **ARM×1.10 and RES×1.10** as a percentage modifier of the current stat contribution view, not flat10 or10% of BaseStat baked into permanent stats. Apply one source family once; existing **RES-007 EXCLUDE_THIS_SOURCE_FAMILY** provides a nonrecursive baseline. Example: family-excluded ARM200/RES300 becomes220/330. Recast refreshes the existing two-owner-Natural-Action duration, never multiplies it again to242/363 or adds a second family stack.

The duration's **owner is Gideon**, not another Actor or a global boundary. Start/expiry checkpoint and CC qualification await Q4; the cast Action cannot be retroactively counted as a later opportunity. The no-stack/refresh law does not by itself choose the duration of Skill3.

## 4. Skill2 — shield strike and one lost Natural Action

Required ordinary cost: **25 Side AE**. Select the enemy through the ordinary declared target profile; approaching the target is animation, with **no Position Mutation**, new Field Presence transition or extra SSI opportunity.

Damage formula: **100% ATK + 100% WIL**, represented by the existing ordinary PHYSICAL/Will components with their own ARM/RES mitigation and immutable receipts. No TRUE conversion, guaranteed hit or Shield Piercing is declared. Concurrent components of one mixed hit use existing RES-008, not two independent attempts to spend the same HP/Shield.

The skill has **15% probability of applying Stun** to its target. Stun means that target cannot execute **one Natural Action**: the qualifying SSI opportunity is consumed without a Basic/Skill/Ultimate, then SSI advances under ACT-012. Non-Natural actions are not reclassified into that lost opportunity. Do not implement the duration as one global boundary, one round or a new STUN Functional Tag. Existing CONTROL State/action restriction is the composition surface.

Hit/invalid-target/CC immunity and any external rule relating a status proc to a zero/missed Damage result need their actual governing profile. The raw kit does not grant a status immunity bypass or authorize a second RNG roll on resume.

## 5. Skill3 — paid automatic Taunt and periodic Heal

Automatic eligibility includes **CurrentHP≥70% CurrentMaxHP**, completed own action/waiting for Gideon's next SSI opportunity, and a payable **15 Side AE**. This is not a new Natural Action. Merely being high-HP during entry or while his enclosing action is unfinished does not establish the specified post-action waiting condition. Child Skill2 completion inside an unfinished Ultimate is not Ultimate completion.

Successful activation grants self Taunt for the window ending at **the beginning of the second later owner Natural Action**, and starts **CD1 owner Natural Action**. The next qualifying owner Action/opportunity reduces CD to0. If still≥70% HP after the next own action completes, the skill can activate again; it does not have to wait for the old Taunt window to expire.

While the activated effect exists, each qualifying owner Natural Action restores requested Heal equal to **4% of Gideon's MaxHP** to **Gideon and the allied Leader**. The MaxHP reference belongs to Gideon, not to the Leader. No heal on another Actor's Natural Action or global boundary is implied. Do not create independently accumulated HoT stacks, snapshot all future ticks at activation or choose tick/expiry order without the missing Q3/Q4/Q5 profile.

Existing TRG-003/CST law requires successful ordinary payment before new effects; insufficient AE produces no partial activation. A failed candidate reaches terminal local failure, not an endless retry/polling token. Future legitimate observations remain separately authored; they are not resumed failed payments. The enclosing completed Action is not reopened.

Q5 must select whether the automatic check is completion-only or also observes later health changes while waiting, and must settle recast identity/refresh. Q6 must supply Taunt's actual affected Action/target categories. Q7 must order Skill3 relative to same-Natural Tanker **+5 class AE**: both are post-completion work and ACT-033 alone gives neither priority. No dependency may wait for the completion it blocks.

## 6. Ultimate — sequential free Skill2 then Skill3

The locked local execution sequence is:

```text
Ultimate admitted
→ Skill2 resolves against the selected enemy
→ Damage/Stun outcome and required lifecycle settlement
→ Skill3 resolves
→ Taunt + periodic-Heal effect
→ Ultimate complete
```

Invoke the two stages without their **25-AE and15-AE child costs**. The root Ultimate's ordinary Rage/readiness/cost law remains owned by the current Mode; free children do not grant another Natural Action or class AE regeneration. Waive only these intended costs, not unrelated descendant/foreign costs. Ultimate invokes Skill3 without the automatic≥70% gate; whether it also bypasses CD, how it refreshes an existing effect and what CD it writes are in Q5.

Sequential composition uses existing RequestAction/Effect graphs and parent wait/terminal dependencies. It does not need a simultaneous batch between the two Skills, an arbitrary callback, an Ultimate-specific Kernel branch or permanent rewriting of Skill3's automatic definition. A Skill2 damage proc failure/zero result does not automatically cancel the Skill3 stage; actual source invalidity still follows applicable Action/lifecycle law. Foreign target invalidation/refund/continuation policies require their own explicit profile rather than a hidden alternate enemy or forced Revive.

## 7. UNRESOLVED / NEED USER DECISION

These are pending gameplay questions, not approved defaults. The questions were sent during this task; no answer has been inferred from elapsed time.

| ID | Decision required | Dependent work blocked |
| --- | --- | --- |
| Q1 | Threshold denominator when MaxHP changes during the attacking Action: Action-start MaxHP or current MaxHP at completed-Action evaluation? | Passive threshold Snapshot/live-read profile; DMG-021 explicitly forbids a silent default. |
| Q2 | CurrentHP reconciliation for the13% increase and removal: preserve absolute CurrentHP/clamp, or another stated adjustment? | P-031/P-032 health transaction; STA-002 requires an explicit policy. |
| Q3 | Periodic Heal starts at activation or the next owner Action; at the second start does expiry precede Heal or follow it? Which MaxHP read checkpoint is intended for each tick? | Tick count, Snapshot/live read and expiry dependency. |
| Q4 | Skill1 expires at start or after the second later owner Action? Do CC-lost opportunities decrement duration/CD and execute eligible Heal ticks? | Exact DurationSpec and opportunity/performed-Action qualification. Ordinary CLK-003/004 defaults count lost opportunities, but the requested tick interaction still needs its declared profile. |
| Q5 | Automatic check only after own action completion, or also on health mutations while waiting? Does recast refresh one Taunt/HoT window and CD without stacking; does Ultimate bypass CD as well as HP? | Trigger selection, ordinary State identity/refresh and forced-child activation profile. |
| Q6 | Which enemy Actions are compelled by Taunt? Proposed choices: all legal single-target Damage attacks/Skills, only single-target Basics, or a specifically declared wider scope. | Taunt target/action behavior; core defines the concept but no universal category/overlap law. |
| Q7 | Is same-completed-Natural **+5 Tanker AE** available to fund the15-AE activation, or is Skill3 evaluated/paid first? | Local post-action resource dependency. With AE10 before completion the alternatives produce different outcomes. |

Do not expand unanswered alternatives into new global Contracts. Once answered, incorporate concrete decisions here, reattempt composition, and change only the layers with a demonstrated insufficiency.

**UNRESOLVED / NOT BLOCKING:** native Element, Ki/stat budget/Base Deployment Cost and any missing external Basic profile; unsupported real-time/Exploration adaptation; independent foreign Taunt/Authority conflicts and reaction competition. These remain external content/profile boundaries, not invented Gideon gameplay. Stun admission vs hit/zero Damage, within-Action HP_ZERO/recovery receipt eligibility, and lifecycle retention of Skill1/Skill3/CD require explicit composition before executing those unsupported interactions; they do not prevent preservation and normalization of the locked clauses above.

## 8. Independent composition and architecture impact

| Mechanic / attempted input | Existing Contract / runtime owner | Finding |
| --- | --- | --- |
| Exact-Action committed received-Damage aggregate + strict30% predicate | DamageResult/ActionResult refs, P-043; DMG-010/011/012/020/021, TRG-013; existing Result/Trigger owners | REUSE for locked membership/arithmetic. Q1/Q2 block a complete mutation profile; no evidence for a new Damage accumulator subsystem. |
| Source-traceable MaxHP gain and cause-specific reset | MaxHpMutationSpec/State lifetime, P-031/032/022; STA-001/002, existing Lifecycle/Presence/Stat/Transaction owners | REUSE contribution cleanup; never global-stat reset or Cleanse. Validate actual retention/HP_ZERO profile before execution. |
| Cast-stat Heal and no-stack ARM/RES percentage | SnapshotSpec/P-002, Heal P-044/045, StatModifier P-030, State P-020/021; SNP/HEL/RES-007/CLK | REUSE. Q4 blocks only the precise clock. |
|15% Stun suppressing one scheduled Natural | RNG + CONTROL State/action restriction; ACT-012 and current Scheduler/State owners | REUSE; no new tag taxonomy or movement primitive needed. |
| Paid post-action self ability, owner CD, early expiry and HoT | Trigger/Cost/Duration/State/Heal + ACT-033/034/CLK-003/004; existing Trigger/DAG/Cost/Scheduler/State owners | Finite local composition candidate. Q3–Q7 must be locked before claiming an exact fully normalized graph. |
| Continuous waiting-health variant, only if approved | Existing State predicate + stablePredicateSettlement/health fields under TRG-016 | Candidate reuse, not approved gameplay or proof of a gap. Exact wait-state lifetime and trigger exclusion must be authored. |
| Sequential free Skill2/Skill3 | RequestAction/explicit child costs and local Effect dependencies; ACT-020/021/024, RES-003, CST, existing Action/DAG owners | REUSE for locked sequence/waivers. Q5/Q6 block final activation/target behavior. |

Functional capability indexing uses existing **DAMAGE / PHYSICAL_DAMAGE / WILL_DAMAGE / HEAL / STAT_MODIFIER / MAX_HP_MUTATION** as applicable. Stun/Taunt are State/control semantics, not newly accepted Functional Tag IDs; timings, percentages, cooldown and SSR/Tanker are parameters/metadata.

| Canonical layer | Decision for this R1 |
| --- | --- |
| 00 | Navigation/status/version bookkeeping only. |
| 01 / 02 / 03 | NO CHANGE. Existing meanings/operations suffice for locked mechanics; no new tag or primitive is proven. |
| 04 / 05 / 06 | NO CHANGE at this stage. Existing bounded composition is available; unresolved gameplay is not an architecture extension. Taunt's exact foreign-target behavior must be re-audited after Q6. |
| 07 | NO CHANGE. Existing SSI, Side AE, ordinary Rage and Tanker+5 AE; no automatic conversion to seconds. |
| 08 | Add only exact-Action threshold/reset/fail-closed interaction obligations M-165–M-167; reuse B-003/B-008, D-016/D-017, M-026 and existing Snapshot/child/replay cases. They are declarative specifications, not executable test results. |

## 9. Six-pass self-audit and delivery boundary

1. **Semantic fidelity:** preserve strict>30%, current13% gain basis,150% WIL+120% ATK,20/25/15 AE,15% Stun,≥70%,2-owner-action Taunt,1-owner-action CD and4%-Gideon-MaxHP recipients. Every missing checkpoint remains explicit in §7.
2. **Independent composition:** reconstruct from current merged canon; use typed results, source-aware contributions, State/Duration, local DAG and ordinary costs first. No generic gap is accepted from unanswered prose.
3. **Layer/namespace/lifetime:** no new Functional Tag/Primitive ID, Character Kernel branch, BaseStat overwrite or private Turn Boundary. Distinguish learned contribution from historical Damage receipts and mutable effect windows.
4. **Determinism/negative space:** inspect exact30%, split Actions, same-root children, Shield/overkill, HP_ZERO prevention, Deck/reset/reinitialize, failed AE, CC loss, recast, early expiry, post-completion AE ordering and replay. Unsupported choices reject dependent normalization.
5. **Source/prompt contradiction:** latest replacement overrides old Heal/boundary wording; unanswered proposals remain proposals. Scope stays documentation/architecture phase.
6. **Mergeability:** inspect actual diff, references, stable IDs and lightweight checks. Deliver only the independently completed rawkit/locked-canon/validation work; full Skill3/passive execution profiles remain pending designer decisions. No implementation build or game test is claimed.
