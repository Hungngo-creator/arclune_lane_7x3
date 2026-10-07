# ARCLUNE — LAMARCK — CLARIFIED GAMEPLAY CANON

**Revision:** R0.
**Status:** GAMEPLAY_PARTIALLY_CLARIFIED / NEED_DESIGNER_DECISIONS / NOT_NORMALIZED.
**Source:** latest designer-supplied Lamarck kit, matching `41) Lamarck` in root `Ý tưởng nhân vật 4.md`.

This R0 preserves explicit gameplay and isolates unresolved choices. Suggestions in §8 are questions, not approved gameplay. No executable normalization or generic architecture extension is established by this document.

## 1. Identity and presentation

Lamarck is an AI operating replaceable chassis. It has no biological original body and no Chân Ngã. The latest explicit name is **Lamarck**, superseding the raw closing paragraph's older “name not yet determined” wording.

The default presentation is a heavy mechanical chassis. Male and female biosynthetic skins are also chassis operated by the same AI. All presentations retain the mechanical voice signature. Gender/art direction and commercial positioning do not supply Rank, Class, native Element, Authority or numeric stats.

Rank, Class, native Element, deployment budget, base stats and final skin art are **UNRESOLVED / NOT BLOCKING** for gameplay clarification. Rank-dependent formulas can retain a parameter without inventing its value.

## 2. Passive — Inheritance Without a Soul / Di Truyền Không Linh Hồn

- Lamarck does not enter the Luân Hồi waiting window or Reincarnation. The destroyed chassis reaches **DEATH_CONFIRMED**; its special replacement route does not retrieve a Chân Ngã.
- Every external kit's Revive is ineffective on Lamarck. The Prime exception below applies to **Heal**, not external Revive.
- Heal from Lamarck's own kit is permitted. External kit Heal is ineffective except Heal from a Character of **Prime** Rank. The Rank subject for copied/inherited Heal remains Q15.
- This is a Character rule. “AI / not a living being” does not silently add immunity to Damage, Shield, ordinary death observers, Death Prevention, HP Cost or unrelated mechanics. Each retains its own eligibility and effect law.
- A confirmed chassis death remains a real confirmed death for ordinary on-death/on-kill meaning. Luân Hồi eligibility/counting still uses its actual Chân Ngã-based predicates; no soul is fabricated for Lamarck.

## 3. Skill 1 — Postmortem Revision / Hiệu Chỉnh Hậu Tử

### 3.1 Replacement entitlement and payment

On **DEATH_CONFIRMED**, the kit initiates its own delayed replacement process. The raw timing is “after one Natural Action of Lamarck.” A beam descends and the mothership supplies a replacement chassis at the death Position, restored to the fresh-field state associated with the most recent deployment.

The stated limit is **3 activations per battle**. A successful replacement requires **15 Side AE** in turn-based combat. If that amount is unavailable at the first due checkpoint, wait one additional own-Natural checkpoint and attempt again. If still unaffordable, Lamarck disappears from the battle.

Dead-clock ownership, actual due checkpoints, availability/use-count consumption, placement claims, other materialization failure, final removal and restoration details remain Q1–Q4. Do not reinterpret this as ordinary Chân Ngã Revive or a performed attack by a dead Actor.

### 3.2 Chassis-lifetime Damage information

Each chassis lifetime collects incoming **committed Actual HP Damage**, from its field entry/replacement until its DEATH_CONFIRMED. Freeze the completed lifetime's information for the associated replacement decision.

Use committed component results, excluding Shield absorption, nominal/raw Damage and overkill beyond actual HP removed. HP Cost, non-Damage HP Loss and direct Execute removal are not Damage receipts. A dual-component attack contributes each component's actual committed share; do not classify the whole attack solely by its scaling stat or actor.

The raw “total received Damage during the lifetime” includes Damage from DoT and non-Natural Follow-up/Counter/Reaction sources in this **information tally**. The later Natural-only restriction applies to mitigation bonuses, not this tally.

Among TRUE, WILL and PHYSICAL/ATK Damage, the highest share selects the next adaptation. Comparing their positive actual totals gives the same winner as comparing their proportions of the same total. Exact ties and no qualifying Damage remain Q5.

### 3.3 Cumulative inheritance

| Dominant received component | New adaptation on the replacement chassis |
| --- | --- |
| TRUE | Max HP increases by **25%** of the applicable Max HP at the preceding triggering death. |
| WILL | RES increases by **30%** of the applicable RES at that death; inherited eligible-AoE reduction increases by **5 percentage points**. |
| PHYSICAL/ATK | ARM increases by **30%** of the applicable ARM at that death; inherited eligible-single-target reduction increases by **5 percentage points**. |

These gains are inherited by subsequent replacement chassis, including when later deaths select a different branch. They are not lost merely because that later branch differs.

When a relevant death baseline contains only the previously inherited value and no other change:

```text
RES: 100 → 130 → 169 → 219.7 for three WILL adaptations
ARM: 100 → 130 → 169 → 219.7 for three PHYSICAL adaptations
Max HP: H → 1.25H → 1.5625H → 1.953125H for three TRUE adaptations
```

The raw third-life “30% of 130” is an **increase by 39**, yielding 169, not replacement of total RES with39.

Each relevant mitigation branch adds 5 percentage points: three WILL selections produce 15% AoE reduction; three PHYSICAL selections produce 15% single-target reduction. Mixed selections retain their separately accumulated bonuses. The TRUE branch grants no additional 5% reduction in the supplied kit.

The stat baseline's treatment of temporary modifiers and retention through unrelated leave/redeploy remain Q4. Eligibility by attack shape and whether TRUE Damage is reduced remain Q6.

### 3.4 Mitigation and post-replacement Rage restriction

The WILL reduction covers random-target AoE and fixed-cell AoE. The PHYSICAL branch's reduction covers single-target Natural damage, described in the raw as “Natural Action target count =1.” Both mitigation families apply only to Damage from qualifying **Natural Actions**; DoT and Follow-up Damage bypass these bonuses.

The supplied Pygmalion example is consistent with its current kit: coordinated Puppet Basics are non-Natural FOLLOW_UP children. BASIC_ATTACK identity or shared root lineage does not turn such a child into a Natural Action. The same principle applies to Pygmalion's own non-Natural coordinated child Basic. These attacks can still contribute to Lamarck's actual-Damage lifetime information.

After a Skill 1 replacement, Lamarck cannot gain Rage from Actions or receiving Damage for the stated **3 Natural Actions and 2 TURN_BOUNDARY** period. Other explicitly sourced Rage grants are not banned by this wording alone. Exact duration composition is Q7. No AE-gain ban is inferred.

## 4. Skill 2 — Invariant Breach / Xuyên Phá Bất Biến

Cost **20 Side AE**. One target receives the stated **155% WIL/ATK** single-target Damage and, concurrently, **TRUE Damage equal to 1% of that target's Max HP**. The percentage has **no boss-specific reduction**.

The slash formula and exact one-hit/component snapshot arrangement remain Q8. TRUE Damage uses ordinary TRUE/Shield law unless a later explicit gameplay correction supplies an exception; “boss not reduced” does not itself grant Shield bypass or Guaranteed Hit.

## 5. Skill 3 — Closed-Loop Repair / Tự Sửa Chữa Vòng Kín

Self-Heal with **no cooldown**. It can activate during a Natural Action or at TURN_BOUNDARY. Below **35% Current Max HP**, it automatically activates without consuming a Natural Action; at exactly 35%, the stated automatic threshold is not satisfied.

Conversion: **1 AE per 1.5% of Lamarck's Max HP healed**, at most **30 AE per invocation**. Thirty AE is a ceiling, not a mandatory fixed Cost. At the unmodified full conversion and sufficient missing HP, 30 AE corresponds to 45% Max HP restoration.

“Pay according to HP actually healed” must not be rewritten as pay 30 regardless of restoration, nominal Heal or Overheal. Exact requested quantity, affordable partial payment, fractional-unit policy and externally modified/denied Heal interaction remain Q10. Trigger checkpoints, lethal timing, manual use and same-checkpoint repetition remain Q9/Q11.

This Heal does not restore a DEATH_CONFIRMED chassis; only Skill 1's special replacement route does so. Revive HP initialization is distinct from this Heal.

## 6. Ultimate — Mothership Directive: Artificial Selection / Chỉ Lệnh Mẫu Hạm: Chọn Lọc Nhân Tạo

The mothership fires a death ray at the full battlefield's fixed area. Each admitted recipient receives **175% WIL +175% ATK** Damage. It is fixed full-field AoE, not random-target AoE or single-target Damage.

The designer explicitly excludes movement reactions triggered by this incoming AoE/single-target attack: relocation does not avoid this fixed full-field ray, and the unnecessary movement trigger is not activated. This does not establish general immunity to unrelated movement or ordinary miss/evasion. Exact recipient Side, hit/batch snapshot and ordinary Hit Admission remain Q12.

Eligible targets whose **Rank ≤ Lamarck's Rank** receive an additional **Ultimate Follow-up** dealing **TRUE Damage equal to10% of Lamarck's Max HP at Ultimate use**. That Max HP reference belongs to the Ultimate, not a later live read after a stat change/replacement. Follow-up membership, Rank checkpoint, attack binding, invalidation and retained-source policy remain Q13.

No additional AE Cost, Guaranteed Hit, universal damage immunity bypass or Authority tier is supplied. Ordinary Ultimate readiness/Cost rules remain separate; missing full numeric roster data is not a reason to invent them.

## 7. Basic — Calibration Shot / Xạ Kích Hiệu Chuẩn

Single-target laser Basic: **100% WIL +100% ATK**. Each Basic has **20% probability** of increasing its coefficients by 20%, giving **120% WIL +120% ATK** on the enhanced outcome.

The random outcome changes the coefficients, not Critical Hit meaning. Current-hit versus persistent growth and the exact shared-roll policy remain Q14. Seeded gameplay randomness and the current per-attack Position-binding default apply unless the designer explicitly supplies another binding; no Entity tracking is inferred from presentation.

## 8. UNRESOLVED / NEED USER DECISION

All suggestions below are **PROPOSED ANSWERS / NOT APPROVED**. They provide concrete choices for one designer response. They must not be compiled or promoted to locked gameplay by silence.

1. **Q1 — Dead clock and return timing.** How does a dead Lamarck consume the stated own-Natural waiting checkpoints? Suggested: preserve its death Slot as a pending-replacement claim in SSI; each pointer visit consumes one wait opportunity with no attack/class AE/Rage, checks payment at its end, and a successful replacement first acts at the next normal visit. Is that the intended clock?
2. **Q2 — Position, final removal and battle end.** Is the death Slot reserved throughout waiting? If materialization is denied despite payable AE, should it retry, fail permanently or follow another policy? Suggested: the 3-use cap counts successful replacements only; the fourth death or second unaffordable checkpoint removes this participant without same-battle redeployment. If only a pending Lamarck remains, should combat wait for these checkpoints rather than declare defeat?
3. **Q3 — Fresh-field restoration.** Does replacement restore 100% **new** Max HP, full Rage as at ordinary deployment, fresh baseline stats/cooldowns, and clear Buff/Debuff/Mark/Shield while retaining the 3-use battle count and inherited adaptations? Or does “most recent fresh-field state” mean a literal stored entry snapshot, including entry-only states/resources? Should replacement replay on-entry/deployment effects?
4. **Q4 — Stat baseline and retention.** Does each percentage use actual final stats at death, including temporary modifiers? Example: permanent RES 100 + temporary 50 gives next RES 195 if the full 150 is inherited, or 130 if temporary 50 is excluded. Do adaptations persist through Return-to-Deck/redeploy and other same-battle field transitions? Suggested retention: all inherited adaptations last to battle end; external temporary objects are not themselves copied.
5. **Q5 — Dominance tie/zero.** Suggested: seeded random choice among the tied highest **positive** totals; zero qualifying Damage gives no new adaptation but preserves earlier gains. Or should ties grant every tied branch/use a fixed declared priority?
6. **Q6 — Reduction eligibility.** Is single-target defined by authored attack shape, or does an AoE with only one actual recipient qualify? Suggested: shape-based; AoE remains AoE with one recipient, and both families exclude independent DoT/Follow-up/Counter/Reaction outcomes. Does the 5% reduction also affect TRUE components, as “every single-target Damage” could imply, or only PHYSICAL/WILL under ordinary Final Damage Reduction law? Clarify full-field AoE coverage as well.
7. **Q7 — Rage duration.** Choose the exact expiry: **A**, concurrent counters requiring both 3 own Natural opportunities and 2 global boundaries; **B**, 3 own opportunities followed by 2 more global boundaries; or **C**, expire at the boundary immediately after the third own opportunity. Own CC-lost opportunities count under current ordinary duration law unless explicitly overridden; an already-running opportunity should count only if specified.
8. **Q8 — Skill 2 formula.** Is 155% WIL/ATK **155% WIL +155% ATK**, or a selected scaling stat? Suggested packet: one hit with concurrent WILL/PHYSICAL/TRUE components using one source/target calculation snapshot; TRUE uses that snapshot's target Max HP. No TRUE branch after a missed/invalid original hit and no target replacement. Confirm or specify a different packet/conditional law.
9. **Q9 — Repair checkpoint/manual use.** Does “immediate” mean after every committed HP/MaxHP change, or only own Natural-start and global boundary checks? Should an HP-zero lethal transaction finish death handling before repair can qualify? Suggested: stable post-health-change plus own-Natural-start/boundary checks, alive HP strictly below 35%, never interpose repair between HP_ZERO and death handling; repair can qualify if lawful prevention leaves a living actor. Automatic-only use is proposed. If manual use exists, state its threshold and Action consumption.
10. **Q10 — Repair quantity/payment.** Does each invocation restore as much as possible under missing HP, available AE and 30 AE, or only up to 35%/another chosen HP target? Are fractional AE allowed? Suggested unmodified quantity: `H = min(missingHP, 0.015 × MaxHP × min(availableAE, 30))`, actual restored HP determines AE spent. If Heal modifiers alter/deny/convert restoration, does the same actual-HP price apply, and is the 30 AE ceiling still enforced on the final result?
11. **Q11 — Repair repetition.** If one repair ends below 35%, does it trigger again at that same checkpoint, or at most once until another qualifying checkpoint? Suggested: once per checkpoint, no recursive self-Heal loop or AE-only polling retry; a new independent health change/Natural-start/boundary may trigger again.
12. **Q12 — Main Ultimate.** Is the area the enemy battlefield only, including ordinary legal Leaders/Summons? Suggested: one simultaneous main-Damage batch, common source/recipient calculation snapshot, ordinary Hit Admission (not GUARANTEED), and the stated incoming-attack movement triggers are suppressed. Confirm recipient scope, guaranteed-hit intent and snapshot checkpoint if different.
13. **Q13 — Ultimate Follow-up.** Must a target have been admitted by the main ray, remain valid, and pass the Rank comparison frozen at main-batch selection? Suggested: one non-Natural ULTIMATE/FOLLOW_UP child over those locked target identities, simultaneous TRUE batch, no reroll/requery; a target invalidated before child resolution is dropped. Should an already-created child survive Lamarck's later death/leave, or cancel with invalid source?
14. **Q14 — Basic proc.** Suggested: one seeded 20% roll per actually executed Basic, including non-Natural Basics, raises both coefficients for **that Basic only**, and never permanently stacks across attacks. Is that intended, or is the coefficient increase persistent?
15. **Q15 — Prime Heal subject.** For a Puppet/copy/inherited kit, does the exception compare the **executing healer's current Rank** or the **original Character whose Heal definition was copied**? Suggested: executing healer Rank at Heal admission; Lamarck's own actual kit remains the separate self-Heal exception. A Prime Heal exception never enables external Revive.

## 9. Current architectural boundaries

These are existing laws relevant to clarification, not a completed gap proof:

- ACT-011/CLK-002 currently skip dead Actors and do not advance their own window merely because global boundaries occur. Q1 must define the intended replacement clock before deciding whether existing scheduler composition is sufficient.
- REV-004/006 require explicit restoration/placement. Skill 1 has no Chân Ngã and must preserve its declared special route rather than borrow ordinary waiting-window retrieval.
- DMG-010/SHP-004 distinguish Actual HP Damage from Shield absorption/nominal amounts. DMG-005 excludes TRUE from ordinary Final Damage Reduction; Q6 must lock any intended exception before architecture analysis.
- HEL-001/REV-005 distinguish committed Heal restoration, Overheal and lifecycle HP initialization. Q9–Q11 determine the required repair observation/payment law.
- Natural status, Basic/Ultimate identity, Action lineage, Effect provenance and Attribution remain separate. Pygmalion's inherited/source identity does not turn its coordinated child Basics into Natural Actions.

No new Tag, Primitive, Contract ID, runtime subsystem or global priority is declared. Normalization and any architecture patch depend only on the gameplay decisions that affect them. Numeric metadata and future unsupported Mode adaptations remain nonblocking for this clarification document.
