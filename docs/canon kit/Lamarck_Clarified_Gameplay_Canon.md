# ARCLUNE — LAMARCK — CLARIFIED GAMEPLAY CANON

**Revision:** R1.
**Status:** Q1_Q15_LOCKED / NEED_INTEGRATION_DECISIONS / NOT_NORMALIZED.
**Source:** latest explicit Lamarck Q1–Q15 FINAL DESIGNER LOCK and cross-mechanic locks; these supersede conflicting shorthand in `41) Lamarck`, root `Ý tưởng nhân vật 4.md`.

## 1. Identity, presentation and Passive

Lamarck is an AI operating replaceable chassis, with no original biological body and **no Chân Ngã**. Default: heavy mechanical chassis. Male and female biosynthetic skins are chassis of the same AI. All retain the mechanical voice signature. The current name is **Lamarck**; older closing raw prose about an undecided name is superseded.

**Passive — Inheritance Without a Soul / Di Truyền Không Linh Hồn.** Chassis destruction reaches **DEATH_CONFIRMED**. Lamarck never enters the Luân Hồi waiting window or Reincarnation. Every foreign kit's Revive is ineffective; no Chân Ngã creation, foreign chassis replacement or same-battle revival/redeployment of a finally removed Lamarck is permitted.

Lamarck's own Skill3 Heal is permitted. For every external Heal, evaluate the **executing healer Actor's current Effective Rank at Heal admission**: only **Prime** passes this exception. The original author of copied/inherited behavior is irrelevant. A lower-Rank Puppet using a Prime's Heal fails; a Prime Actor using a copied lower-Rank Heal meets the Rank condition. Other Heal legality/modifiers still apply. This is only a Heal exception, never an external Revive entitlement.

No additional Damage/Shield/HP Cost/Death Prevention immunity or Authority tier follows from “AI / not living.” Ordinary eligibility and actual confirmed-death observers retain their own laws; no Chân Ngã death/waiting record is fabricated.

## 2. Chassis information and persistent adaptation

### 2.1 Lifetime information and dominant branch

Each chassis lifetime accumulates incoming positive **committed Actual HP Damage**, by **TRUE / WILL / PHYSICAL** component, from its field entry/replacement through its DEATH_CONFIRMED. Include qualifying DoT, Follow-up and other Damage in this information; the Natural-only restriction below belongs to mitigation, not information collection.

Use committed component shares, excluding Shield absorption, raw/nominal Damage, overkill beyond HP actually removed, HP Cost, non-Damage HP Loss and direct Execute removal without a Damage receipt. A mixed hit contributes each actual component share, not one whole-hit category inferred from its scaling stat.

At DEATH_CONFIRMED, freeze the completed lifetime totals. A unique positive maximum selects that branch. Exact positive ties select **exactly one** tied highest branch by deterministic seeded RANDOM, without fixed type priority. All-zero information selects **no new branch** and preserves previous adaptations. Redelivery does not choose again.

### 2.2 Persistent death baseline and inheritance

At that death checkpoint use the **persistent chassis stat baseline**, excluding temporary contributions that do not survive chassis replacement. An explicitly battle-persistent contribution whose own retention law survives replacement legitimately participates. Temporary State objects are never copied merely because they influenced a displayed stat.

| Selected branch | New adaptation for the next successful replacement |
| --- | --- |
| TRUE | Increase persistent Max HP by **25%** of the qualifying persistent death baseline. |
| WILL | Increase persistent RES by **30%** of that baseline and add **5 percentage points** of eligible-AoE reduction. |
| PHYSICAL | Increase persistent ARM by **30%** of that baseline and add **5 percentage points** of eligible-single-target reduction. |

Example: persistent RES100 plus temporary50 yields next persistent RES130, **not195**. Repeated WILL selection: `100 → 130 → 169 → 219.7`. ARM follows the same1.30 compounding. Repeated TRUE selection: `H → 1.25H → 1.5625H → 1.953125H`.

All earned branches are **BATTLE_SCOPED**. Later branch changes preserve earlier gains. They survive chassis death/replacement, ordinary LEAVE_FIELD, Return-to-Deck and same-battle redeployment; reset at battle end. Three WILL selections give15% eligible-AoE reduction; three PHYSICAL selections give15% eligible-single-target reduction. Mixed selections preserve the separate accumulated reductions. TRUE grants no5% mitigation increment.

Freeze the selected branch and derived next persistent adaptation baseline **at death**, before starting replacement wait. Successful replacement builds the chassis from that derived adaptation and legitimately retained battle state; it does not reread lifetime Damage or choose a branch after materialization. Retained contributions are represented once, not baked into a new baseline and then added a second time.

### 2.3 Reduction eligibility

Use the **authored attack/effect shape**, not actual recipient count. AoE with one recipient remains AoE; fixed full-field, fixed positional and random-target AoE all qualify as AoE. Authored single-target remains single-target even with multiple direct components/hits on that target.

WILL-earned reduction applies to qualifying **enemy Natural Action own-direct AoE Damage**. PHYSICAL-earned reduction applies to qualifying **enemy Natural Action own-direct single-target Damage**.

Exclude independent DoT, Follow-up, Counter, Reaction, Mark/passive secondary Damage and other non-Natural outcomes. Shared root lineage is insufficient: a child qualifies only if architecture actually classifies its Damage as the root Natural Action's own direct component. Pygmalion's coordinated Puppet Basics remain non-Natural Follow-ups and bypass these reductions.

These are ordinary **Final Damage Reduction** modifiers. **TRUE bypasses both**, while still contributing to lifetime information. No Character-specific TRUE reduction is created.

## 3. Skill1 — Postmortem Revision / Hiệu Chỉnh Hậu Tử

### 3.1 Death decision and pending Slot

At DEATH_CONFIRMED, in order:

1. freeze completed chassis-lifetime Damage information;
2. select its dominant branch/zero outcome;
3. derive the next persistent adaptation baseline;
4. if fewer than3 successful Skill1 replacements have occurred and a legal replacement entitlement remains, create **POSTMORTEM_WAIT**.

With3 successful replacements already consumed, create no wait: Lamarck is finally removed from this battle.

While pending, the death Position remains **RESERVED** by this replacement process, and its SSI Slot remains a special POSTMORTEM_WAIT checkpoint. It is not an ordinary empty deployment Slot; another Actor/deployment cannot claim it. Lamarck remains dead and performs no Action.

### 3.2 Two bounded attempts

On SSI's next visit to that Slot, consume one **wait opportunity**. It is cadence-equivalent to Lamarck's own SSI opportunity but is **not an actually performed Natural Action or an ordinary Actor Natural opportunity**:

- no Basic/Skill/Ultimate;
- no class AE or Action Rage;
- no ordinary Actor-duration progression;
- advance the SSI pointer/control and produce the ordinary following global TURN_BOUNDARY.

At the **END** of the first wait checkpoint, validate replacement admission/materialization and availability of **15 Side AE** before payment. Success commits payment, chassis materialization and one successful-use increment together. Lamarck does not act immediately; the next ordinary SSI visit is its next playable Natural Action.

Failure of **any** required condition commits no payment/use and waits exactly one more own POSTMORTEM_WAIT checkpoint. At the second checkpoint's end, make the same attempt. Success uses the same atomic law. Failure terminates entitlement and permanently removes Lamarck from the battle. **No third wait, background retry, alternate Position or same-battle redeploy.**

The cap3 counts successful materializations only. Payable AE with blocked materialization is still a no-payment attempt failure.

### 3.3 Battle-end participation

A valid pending POSTMORTEM_WAIT entitlement makes Lamarck a **recoverable participant** for battle-end evaluation. If it is its Side's only remaining member, do not declare defeat while its remaining wait checkpoint(s) are pending. Ordinary defeat evaluation may proceed after terminal failure/final removal. This does not turn the dead Actor into a playable or Damage-eligible living participant.

### 3.4 Fresh chassis materialization

Successful **CHASSIS_REPLACEMENT** applies inherited adaptations and legitimately retained battle-persistent state, then initializes:

```text
CurrentHP = 100% NEW CurrentMaxHP
CurrentRage = CurrentMaxRage
```

Reset old-chassis life/presence-scoped cooldowns, temporary counters/charges, Buff, Debuff, Mark, Shield and other temporary states. Preserve successful Skill1 use count, earned adaptations, battle counters/state and any explicitly BATTLE_SCOPED state whose own retention law survives replacement. The old body's precise HP/Rage and temporary objects are not replayed.

CHASSIS_REPLACEMENT is its own special materialization cause: **not DEPLOY_FROM_DECK, ordinary Revive or ordinary deployment entry**. It does not replay generic/kit “when deployed,” “when entering Field” or “at battle start” effects. Only effects explicitly authored for the replacement event may run. Initialization HP is lifecycle restoration, not Heal/Overheal.

### 3.5 Concurrent post-replacement Rage suppression

Successful materialization arms two concurrent clocks:

- next **3 own Natural Action opportunities**;
- next **2 global TURN_BOUNDARY events**.

Suppression expires only after **both** complete, at the later endpoint. CC-lost own opportunities count; non-Natural Actions do not. A POSTMORTEM_WAIT opportunity is not an ordinary Actor-duration tick.

While prohibited, deny **Lamarck Action-generated Rage** and **Rage generated from Damage received by Lamarck**. Explicit unrelated external/system grants remain eligible. A gain causally attributable to an Action/Damage event occurring during prohibition remains denied even if payment/grant settlement occurs after suppression expiry. Capture cause-time scope rather than using incidental Event/delivery order. Initial full-Rage assignment remains the replacement initialization, not an Action/Damage grant.

## 4. Skill2 — Invariant Breach / Xuyên Phá Bất Biến

Required active Cost **20 Side AE** commits before Damage. Ordinary **POSITION/SLOT** binding, with no retarget.

At Damage calculation read one coherent source/current-recipient snapshot. One hit contains concurrent components:

```text
PHYSICAL = 155% Lamarck ATK
WILL     = 155% Lamarck WIL
TRUE     = 1% recipient CurrentMaxHP
```

The1% denominator is the actual current recipient's Max HP in that same snapshot; no boss-specific reduction. All three share the same Hit Admission: miss, rejection or no legal current recipient resolves **none**. TRUE is not an independent fallback hit. Ordinary TRUE/Shield law applies.

## 5. Skill3 — Closed-Loop Repair / Tự Sửa Chữa Vòng Kín

### 5.1 Automatic checkpoints and lifecycle

**AUTOMATIC ONLY**, no selected Action, no Natural Action consumption and no cooldown. Predicate: living/lifecycle-valid Lamarck with **CurrentHP <35% CurrentMaxHP**. Exactly35% fails.

Evaluate at:

- authoritative stable checkpoints following actual committed CurrentHP or CurrentMaxHP mutation;
- start of Lamarck's own Natural Action opportunity;
- each global TURN_BOUNDARY.

No continuous polling or AE-only retry. Never interpose repair between HP_ZERO and mandatory death/prevention adjudication. DEATH_CONFIRMED cannot repair; lawful prevention leaving a living Actor below35% may qualify at the resulting stable post-lifecycle checkpoint. This Heal is not Death Prevention or chassis replacement.

### 5.2 Budget and result-linked AE settlement

Per invocation snapshot `M = CurrentMaxHP` and missing HP. Validate/reserve usable **Side AE budget B = min(current available AE,30)**, excluding other valid reservations. Nonpositive missing HP/budget produces no repair settlement.

```text
R_base = min(missingHP, 0.015 × M × B)
```

Repair as much as possible; do not stop at35%. Ten AE budget gives up to15% Max HP base repair;30 gives45%. Fractional requested AE is permitted before ordinary project numeric normalization; do not round into whole1-AE chunks first.

Run the repair through ordinary Heal admission/modifier/conversion law. Bind **H_actual = committed Actual HP restoration of this exact repair**:

```text
AE_spent = min(B, H_actual / (0.015 × M))
```

Then apply ordinary numeric normalization. Never reconstruct nominal Heal after commit. Heal reduction lowers proportional payment. Blocked Heal or Heal wholly converted into Damage restores0 and spends0. Amplification may make the reserved budget more efficient, but payment never exceeds B or30 AE. Release unused reservation. Reservation/validation prevents a concurrent resource mutation from producing restoration without affordable final payment.

### 5.3 Non-recursion

At most **one activation per qualifying checkpoint**. Health/Heal/Damage/resource mutations produced by that invocation cannot recursively create another Skill3 activation at that same checkpoint. Still below35% after repair creates no self-loop. Another independent HP/MaxHP mutation, own Natural-start or later TURN_BOUNDARY is a new eligible checkpoint. No cooldown does not imply unbounded recursive activation.

## 6. Ultimate — Mothership Directive: Artificial Selection / Chỉ Lệnh Mẫu Hạm: Chọn Lọc Nhân Tạo

### 6.1 Main death ray

Fixed **full-enemy-field AoE**, never allies. Lock the full enemy Position set, then resolve legal current occupants at the recipient checkpoint, including enemy Leader, Characters, Summons/Puppets and other legal Damage recipients.

One common Lamarck ATK/WIL source snapshot and one **simultaneous** main-Damage batch. Per legal recipient: **175% ATK PHYSICAL +175% WIL**.

Hit Admission is **MODE_DEFAULT**, not inherently GUARANTEED. Suppress this incoming ray's special movement reactions triggered by “move/dodge because this is AoE” or “move because this is single-target.” The full-field ray explicitly does not activate those movement triggers. Do not generalize to ordinary Hit Admission, Authority, unrelated admission denial, temporary absence or other defensive semantics.

### 6.2 Rank-gated Entity follow-up

At the main recipient snapshot freeze each target identity/Effective Rank, Lamarck Effective Rank and Lamarck CurrentMaxHP for the follow-up. Only **successfully HIT-ADMITTED** main recipients participate; positive Actual HP Damage is unnecessary, so Shield-absorbed hits can qualify.

Require comparable Effective Rank and `target Rank <= Lamarck Rank`. A recipient without comparable Rank does not qualify.

Local order:

```text
main simultaneous Damage
→ mandatory lifecycle
→ construct/freeze surviving legal Rank-qualified Follow-up recipients
→ simultaneous Follow-up TRUE batch
→ mandatory lifecycle
→ remaining Ultimate direct effects terminal
→ ACTION_DIRECT_EFFECTS_COMPLETE
→ ordinary Reactions
```

The child is non-Natural **ULTIMATE/FOLLOW_UP** and explicitly **ENTITY-BOUND** to those main-hit identities. This exception does not propagate to Basic, Skill2 or the main ray. Each receives **TRUE Damage =10% snapshotted Lamarck CurrentMaxHP**. Movement alone does not change the locked identity; later invalidity/death/removal drops it, with no replacement/reroll/requery. Main-batch deaths are excluded before child creation.

No ordinary Reaction window opens between main ray and this child. Once its obligation has been created/frozen from a completed main batch, later Lamarck death/LEAVE_FIELD does not cancel it; immutable snapshot/target obligations finish. Source invalidity before creation synthesizes no future follow-up from incomplete main resolution.

## 7. Basic — Calibration Shot / Xạ Kích Hiệu Chuẩn

Single-target **POSITION/SLOT** laser. Every actually executed Lamarck Basic performs exactly **one deterministic seeded20% roll**, including Natural and non-Natural/Forced/Follow-up Basics that really execute this definition. The one roll governs both concurrent components:

| Outcome | PHYSICAL | WILL |
| --- | --- | --- |
| Failure | 100% ATK | 100% WIL |
| Success | 120% ATK | 120% WIL |

Only that execution is enhanced. No permanent growth, retained Buff, stack or cumulative proc; later Basics roll independently. It is not Critical Hit meaning.

## 8. UNRESOLVED / NOT BLOCKING

Rank, Class, native Element, deployment/base-stat budget and final skin art remain unspecified. Use Rank parameters where required; lack of a target's comparable Rank explicitly excludes the follow-up. The locked SSI/Side-AE mechanics target the turn-based profile. Future Modes require explicit compatible adapters and cannot invent own SSI checkpoints where their scheduler has none. Unsupported external conflict profiles remain fail-closed rather than supplying hidden gameplay priority. No internal Q1–Q15 gameplay question remains open.

## 9. UNRESOLVED / NEED DESIGNER DECISION — current integration boundaries

All Q1–Q15 locks above remain authoritative. These are additional observable cross-rule choices, not a reopening of their answered mechanics.

1. **Successful replacement with an already-dead Main Leader.** §3.3 is locked: do not end the battle while the valid wait remains, including when Lamarck is the Side's only remaining member. TURN_BASED_MAIN otherwise ends on true Leader DEATH_CONFIRMED (07§9 / ACT-050). If replacement succeeds after the Leader has already died, does combat resume with the dead Leader, or is that deferred Leader-death terminal condition then evaluated? This post-success interaction is not specified; pending-period deferral and terminal-failure removal are not reopened.
2. **Concurrent component Actual-HP shares.** One simultaneous mixed hit can have several admitted components competing for finite shared Shield/HP, and §2's adaptation observes the per-type committed shares. RES-008 provides an explicitly selected PROPORTIONAL policy but no universal default. Must these components use proportional allocation of each eligible Shield budget and remaining HP demand, or another declared law? A simple no-Shield example: HP100 with concurrent PHYSICAL100/WILL100/TRUE100 has total ActualHP100; proportional shares are100/3 each, while an undeclared component order could grant100 to only one type and change the dominant branch. Choose the policy for Lamarck's mixed attacks and the component shares consumed by its lifetime information; do not change total Damage or Hit Admission.

Execution-ready Main normalization remains blocked only where these choices are required. The enabled profile/result view must reject unresolved binding instead of assuming an outcome.

## 10. Declarative semantic bindings

| Authored mechanic | Exact composition/boundary |
| --- | --- |
| External Heal/Revive restrictions | Existing scoped Effect admission/STA-014, executing-Actor Effective Rank predicate at Heal admission, exact own-Skill3 exception and foreign return denial. HEAL capability belongs to Heal nodes; Rank is not Authority. |
| Chassis information | DAMAGE_COMMITTED/04§7.18/TRG-015 mandatory positive ordinary-component actualHpDamage fold into original State counters, before death snapshots. Capture/reset record generation per chassis; use committed shares with an explicitly governed allocation law. |
| Dominance/adaptation | Existing Conditions, one seeded tie choice, State/P-021, Snapshot/P-002 with04§13.5/SNP-002 retained-stat projection, P-030 Stat/P-031 MaxHP contribution and BATTLE_SCOPED retention. Zero branch does not create a new gain; no Character-specific manager. |
| Natural reductions | Existing DAMAGE_REDUCTION/FINAL_DAMAGE_REDUCTION, own-direct provenance + hostile actual-Natural Action + authored SINGLE_TARGET/AOE facet under04§18A/34.5. Select PHYSICAL/WILL only. |
| Replacement | SYSTEM_LIFECYCLE/04§29.3 typed CHASSIS_REPLACEMENT; existing pending State, reserved Position, P-034/035 Cost, P-069 materialization and successful-use counter joined under ACT-011/REV-004/006. Cause/clock values are not Tags or ordinary Revive routing. Main defeat binding remains §9. |
| Rage restriction | Two existing counters/clock observations and ALL condition, origin-aware Resource admission/CST-016 with exact cause-time Action/Damage scope; expired State cannot erase late-grant evidence. No composite-duration subsystem. |
| Skill2/Basic | Existing ordinary mixed Damage profile/Hit Admission, per-owner Slot binding, one coherent calculation snapshot; Skill2 one shared hit and Basic one execution-owned seeded roll. Actual component allocation remains §9. |
| Repair | Stable predicate observation/TRG-016 with EXCLUDE_THIS_TRIGGER_ACTIVATION plus04§7.19 owner-start/boundary finite settlements; existing exact own-Skill3 Effect/activation-origin recursion filter across those checkpoint entry definitions.04§17.3/CST-009 reserved actual-Heal-linked AE payment. Existing HEAL and Cost receipts, no Action or free recursion. |
| Main ray | Fixed enemy Position set/current legal occupants, shared source and simultaneous recipients, MODE_DEFAULT; bounded04§34.5/POS-008 attack-triggered movement eligibility suppression. |
| Rank follow-up | Existing admitted-hit result/Rank Snapshot, required main→lifecycle→child local DAG and AFTER_DIRECT_EFFECTS_COMPLETE hold; explicit Entity-bound non-Natural ULTIMATE/FOLLOW_UP with immutable source payload/retained-created-obligation validity. Shield absorption does not imply miss. |

These are declarative Character bindings, not implementation code or a claim that unresolved Mode/result choices compile. Shared materialization operations do not imply ordinary Revive cause or foreign revival entitlement; no chassis-specific Functional Tag is created.
