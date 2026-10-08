# ARCLUNE — TINH KHÔNG MA NỮ — CLARIFIED GAMEPLAY CANON

**Revision:** R1 — replacement raw kit and current designer answers.
**Status:** GAMEPLAY_CORE_CLARIFIED / ARCHITECTURE_NORMALIZED; final local settlement order awaiting designer answer. Main core semantics are locked; metadata/external adapters in §8 are not generated execution-ready numeric data.
**Source:** #78 **Tinh Không Ma Nữ**, identified by name and kit in `ý tưởng nhân vật 3.md`; latest replacement and explicit answers supplied on 2026-10-08. The following unnamed #78 Mage is a different entry.

## 1. Identity and source precedence

**Tinh Không Ma Nữ — UR, Summoner.** Native Element, stat budget, Ki metadata and Base Deployment Cost remain separate metadata. Rarity/Class supply no Authority. Orb, beam and stars are VFX rather than independently acting units.

The replacement kit supersedes the old Skill3 Counter entirely: there is no attack-received counter, five-AE payment or one-counter-per-hostile-Action rule in this version. The primary corrected kit supersedes its appended old examples: Skill1 counts **four performed Natural Actions**, not three personal “Turn Boundaries”; Skill3 grants **two 160% Basics**; Ultimate C costs **15 AE**. Chi Tâm's ARM/RES snapshot is at its first healing activation, not at creation.

Explicit designer answers, including all accepted follow-up proposals, lock: Leader Ultimate replaces the chosen arm's Basic; the Leader buff counts both arms together; every star is one mixed hit including its own2% MaxHP TRUE component; C pays Rage and AE immediately; the ally/Cost rules in §§3–4 apply. No older proposal changes those answers.

## 2. Passive — Tàn Thần Tinh Khải

### 2.1 One Leader life, three occupied positions

Ma Nữ's field entry requests replacement of the allied Leader's entire old kit with **Tinh Không Tàn Thần**. The same participant remains the Leader, never a Summon. Main body occupies Slot8 and has no Natural Action. Arms occupy Slot7/9 and each has its own SSI opportunity. All three parts share exactly one Leader HP pool and one Leader Rage pool; incoming hits on a body part grant Rage under the applicable received-Damage rule.

Each arm ordinarily performs only a Basic. An expressly player-selected A/B/C replaces the Basic in the **chosen arm's existing Natural Action**. This is the declared Ultimate exception to “arms only Basic,” not an extra Action from the skipped torso. Full Rage without a player choice preserves Basic selection and Rage; other legal effects may reduce the pool.

If an arm destination is occupied, relocate that occupant to a random legal empty allied Slot outside the required body positions. Two displaced units require two distinct destinations. Insufficient total placement capacity postpones the formation; a single free Slot is insufficient when both arm Slots are occupied. Do not expose a half-formed body. The entire transformation is postponed: the old kit/body remains authoritative until all placement/binding commits together. After successful binding the form lasts until battle end, even if Ma Nữ leaves. Later Ma Nữ entry neither resets HP/Rage nor creates another body/pending request.

New arms follow the real Side pointer/pass: an unpassed Slot may act on its ordinary upcoming visit; a passed Slot waits until the next pass. Creation never inserts immediate extra turns or revisits an already consumed Slot.

### 2.2 Frozen stat basis and arm Basic

Capture100% of the Leader's declared stats **at Leader battle entry**, not Ma Nữ's later entry or successful arm placement. Later native/foreign buffs, debuffs and mutations do not rewrite or silently replace this immutable basis. Preserve the existing HP/Rage pool rather than creating three independent lives; preserve absolute CurrentHP, clamp downward to snapshot MaxHP if necessary, preserve current Rage, Shield and valid status records; old kit behavior stops. This reconciliation is not Heal/Damage. CC States share the Leader provider: a CC on any part can block both arms under that CC’s actual law. Owner personal opportunity clocks observe each real arm opportunity, including CC loss; the explicit Skill1 performed-Action clock still excludes losses. A skipped torso does not prevent an ordinary CC duration from progressing.

The arm's one-target Basic uses the frozen Leader basis. The ordinary two components are **PHYSICAL100% ATK + WILL100% WIL**. If the original Leader's Ki explicitly defines different Basic coefficients, inherit those coefficients only; do not retain the replaced old kit/secondary effects. Target selection follows its declared SSI attack geometry and ordinary owner-scoped Position binding.

Chi Tâm's explicitly authored ARM/RES contribution in §3.3 is a separate declared capability; it does not mutate the frozen basis or authorize arbitrary later stat contributions.

### 2.3 Damage-derived healing from Ma Nữ's Ultimate

For one successful **Tinh Quang Đại Xạ** cast, bind the exact Basic Action invoked by that cast and its direct Damage receipts for at most three recipients. After qualifying Damage/lifecycle is terminal, one Leader Heal requests:

`0.10 × sum(committed Actual HP Damage of that exact Basic outcome)`.

Exclude Shield absorption, overkill, independent Counter/Reaction/DoT/passive Damage and unrelated Actions sharing its root. Leader A Damage is not Ma Nữ Ultimate Damage. Deliver one Heal to the shared Leader life, never one per physical part; ordinary recipient validity and Heal modifiers still apply. No nominal-damage reconstruction or implicit Revive.

## 3. Replacement Leader Ultimates

### 3.1 A — Quần Tinh Vẫn Lạc

Every eligible enemy on the field receives a seeded random1–3 stars. Each star is **one hit with three components**, not three hits:

- PHYSICAL =0.80 × Leader ATK;
- WILL =0.80 × Leader WIL;
- TRUE =0.02 × recipient MaxHP at that star's impact checkpoint.

ARM/RES mitigation applies to the corresponding ordinary components; TRUE uses the current TRUE pipeline. Keep per-star hit/result provenance. Observer frequency/caps remain the observing effect's own law; do not automatically emit a Basic Action or three on-hit activations for three components. Freeze each selected enemy life’s1–3 draw once; execute waves1→2→3 sequentially. In each wave, all still-eligible recipient hits resolve simultaneously and read recipient MaxHP at that wave’s pre-hit checkpoint. An already-invalid recipient is dropped without replacement/redraw. AoE covering several Tàn Thần parts supplies one hit for that life per wave, never three; separate waves remain separate hits.

If recipient MaxHP is constant, one/two/three stars total80/160/240% ATK,80/160/240% WIL and2/4/6% MaxHP TRUE, before ordinary mitigation. Changing MaxHP requires the authored per-hit read; do not multiply one old MaxHP snapshot by the star count.

### 3.2 B — Tinh thần chi lực

The Leader pays **HP Cost5% of its current HP**. Bind the committed payment receipt; every eligible ally requests Heal:

`1.00 × Leader ATK + 1.00 × Leader WIL + actualPaidHP of this cast`.

The paid HP term is replicated to each ally, not divided among them and not multiplied by another0.05. This payment is not Damage or incidental HP Loss. Ordinary Cost admission, modifiers and Heal validity remain separate. A/B require full Rage and pay the entire current Rage pool when the selected Ultimate is admitted; B’s HP and Rage are required joined Costs. C follows ordinary full-Rage Ultimate readiness as well; its additional AE/payment/pending profile does not create a low-Rage free-cast exception.

### 3.3 C — Tinh Thần Chi Tâm

At accepted selection, atomically pay **100% of current Leader Rage + Side AE15** and create one pending creation request bound to this Leader. Failure to pay either commits neither. At most one active Chi Tâm and one pending C are permitted; an active/pending instance excludes a second C request.

If no legal allied empty Slot exists, retain the prepaid request until one becomes available. Do not debit again on release. During waiting A/B/other Ultimates cannot replace C; arms remain able to use their ordinary Naturals and the shared pool can receive new Rage. That new Rage remains outside the earlier payment. Select the seeded random legal Slot at actual materialization, not by guessing a future Slot while full. Leader death/battle end cancels this pending request without refund. A later Revive/reentry cannot reactivate that old request. While capacity is insufficient the accepted arm Action completes with pending status, so future SSI opportunities remain available; eventual creation is System settlement, not another arm Natural.

Chi Tâm has a Slot, CurrentHP/MaxHP =0.65 × Leader MaxHP, no Rank and no other combat stats. It cannot attack or receive a Natural Action; a gameplay Combat Object does not become a Summon/Character merely because Summoner created it. No Chân Ngã, Class reward or scheduled Action is implied.

An **SSI Pass Contact** is one real visit by the owning Side's pointer to the anchored Slot while the object is present. It is an observation within skip/search, not a consumed Natural opportunity, actor duration, postmortem wait, personal TURN_BOUNDARY, Side swap or class AE/Rage grant. Creation in a passed Slot waits for the next actual visit; global boundaries/round timers do not substitute for contacts.

Each contact selects up to **two distinct** random eligible allied lives; each requests Heal0.20 × Leader MaxHP. A recipient can be selected again at another contact. Fewer than two eligible lives means at most the available number, never duplicate selection to fill the count.

At the **first healing activation**, capture the Leader's then-applicable ARM/RES and create one nonstacking contribution of10% each. Retain that immutable amount through contacts2/3; no recapture or compounding. End the contribution when that Chi Tâm disappears. Resolve the third contact's Heal before natural disappearance. At contact1, snapshot before this object’s bonus is applied and grant it even when there are no valid Heal recipients or Heal is denied/zero. Destruction removes the object and its contribution immediately with destruction cleanup, not a fabricated third contact. There is no missing-Rank inference, independent natural turn, ordinary Revive or REC eligibility for this object.

### 3.4 Allied Heal membership

“Allies” includes Ma Nữ, the cast owner and Leader when alive, present and otherwise eligible. For B and Chi Tâm random selection, three Tàn Thần parts represent **one Heal candidate/pool**, not three recipients or three lottery weights. Chi Tâm is excluded from this Heal pool. This does not decide hostile multi-part attack multiplicity; see §8.1.

## 4. Ma Nữ Skill1 — action-generated Rage

Pay Side AE20, then arm independent buffs for Ma Nữ and Leader. Each starts with that recipient's **next actually performed Natural Action** after activation and lasts for **four performed Naturals** including that first qualifying Action. For Leader, either arm's performed Natural counts toward one shared four-Action budget; the torso counts none. Ma Nữ owns a separate budget.

CC-consumed opportunities without an Action do not start/decrement these explicit performed-Action clocks. Non-Natural child Actions, Counters, Reactions and pointer skips do not consume the budget. This kit-specific clock does not alter CLK-002/003's ordinary opportunity defaults.

Increase qualifying **action-generated Rage by40%**. A received-Damage Rage cause is not automatically action-generated Rage from the receiving actor. Recast refreshes the same source's duration/start binding rather than stacking another40%; compatible other-source increase effects can add under their declared law. Preserve the bound Action's qualifying resource scope through late grant settlement instead of dropping its fourth Action's bonus at completion.

## 5. Ma Nữ Skill2 — automatic Leader rescue

At an independently caused committed HP/AE mutation checkpoint, admit automatic rescue only if the allied Leader is alive/present with **CurrentHP ≤0.15 × MaxHP**, Ma Nữ is eligible and can pay both:

- HP Cost0.30 × **Ma Nữ MaxHP**, with exact **nonlethal payment**, leaving at least1 HP under CST-003;
- Side AE20.

After admission/payability, snapshot Ma Nữ ATK/WIL before Cost; atomically pay the two required Costs, then immediately request Leader Heal:

`0.25 × Leader MaxHP + 0.35 × Ma Nữ ATK + 0.35 × Ma Nữ WIL`.

Complete one activation’s Cost→Heal before later independent checks. Exclude that activation’s own Cost/Heal mutations: they cannot cause self-repetition. The accepted designer policy includes **AE-only** changes while Leader remains low; do not quietly substitute a health-only trigger. No explicit once-per-battle cap/cooldown was added. A later qualifying checkpoint may activate again while both predicate and Costs hold. Payment does not use Shield or trigger ordinary Damage reactions. Failed payability debits nothing and grants no Heal.

This is an auto activation, not a Ma Nữ Natural Action or death prevention after confirmed Leader death. Competing shared-budget activations require their applicable explicit composition law rather than hidden listener order.

## 6. Ma Nữ Skill3 and Basic

### 6.1 Skill3 — two charges

Pay Side AE10 and consume one Ma Nữ Natural Action to activate. Supply two enhanced Basic uses: each target receives **PHYSICAL160% ATK + WILL160% WIL** instead of100/100. One actually performed qualifying Basic consumes one charge for the whole attack, independent of its target/hit count. An opportunity lost to CC does not consume a charge. No Basic execution means no charge debit. Successful recast sets the same remaining-charge counter to2, without adding charges. A performed Basic consumes one charge even if legal Hit Admission/misses leave Damage zero; the condition is real Basic execution, not positive Damage.

### 6.2 Basic geometry

The stationary orb beam attacks one enemy column, up to three occupied legal positions from1/4/7,2/5/8 or3/6/9 according to the kit's position/target rule. Each hit has two ordinary Damage components, PHYSICAL100% ATK and WILL100% WIL, or160/160 under Skill3. Beam/orb has no separate entity/SSI identity. Apply Position binding independently to this Basic; no implicit Entity tracking or Guaranteed Hit.

## 7. Ma Nữ Ultimate — Tinh Quang Đại Xạ

The cast is a real **ULTIMATE** invoking exactly one real **BASIC_ATTACK** Action with the same column geometry and components **PHYSICAL280% ATK + WILL280% WIL**. The invoked Basic is non-Natural and does not consume another SSI opportunity. Its Basic identity is visible to future Basic-trigger effects; the parent retains its own Ultimate identity/provenance.

Skill3 never changes280/280 and this Basic explicitly **does not consume Skill3 charges**, despite being a Basic Action. After that Basic, invoke Skill1 with **all Skill1 Costs waived**; retain its40% modifier, next-Natural start and four performed-Action duration. Ma Nữ Ultimate requires full Rage and pays all current Rage; Skill1’s waiver does not waive that root Cost. Passive Heal in §2.3 consumes only this accepted Basic's direct committed Damage results.

## 8. External content, metadata and Mode boundaries

One final local-order question is pending: proposed Chi Tâm capture→simultaneous Heal→first-contact bonus/third-contact cleanup, and proposed Ma Nữ Ultimate Basic→Leader Heal→free Skill1. These proposed dependency edges are not locked until the designer answers. Existing locked mechanics and architecture composition remain independent; executable lowering must reject an unspecified observable order. Main attack owners retain Position binding and use the current Mode/Leader Ki primary selection and beam-column adapters; this Canon fixes allowed column sets and per-target formulas without inventing another nearest-target/tie rule. Numeric Element/budget/Ki/deployment fields remain to be supplied before execution-ready data compilation.

Future foreign content that moves/splits parts, transfers a whole body to another instance, changes provider/retention law, contends for the same empty Slot, or supplies incompatible Rage modifiers needs an explicitly compatible profile/composition law. This is **UNRESOLVED / NOT BLOCKING** for the current Main normalization, not permission to guess status/target/resource ordering. Ordinary Authority and target admission remain authoritative; no cosmetic part creates another independent life.

Alternate non-SSI Mode profiles need real scheduler/spatial/contact/resource adapters. They cannot substitute round/time counters for SSI Pass Contact or claim this Main kit is executable everywhere.

## 9. Corrected illustrative arithmetic

Examples illustrate the locked formulas only; they do not override clocks, target binding, ordering or Cost rules.

| Example | Correct result |
| --- | --- |
| A with fixed target MaxHP10,000 and3 stars | Ordinary240% ATK +240% WIL before mitigation, plus TRUE600 across three mixed hits. |
| B with pre-Cost HP10,000, ATK600, WIL400 and actual payment500 | Each eligible ally requests Heal1,500; not1,025 and not a divided share. |
| C with Leader MaxHP10,000 | Chi Tâm HP/MaxHP6,500; each selected ally requests Heal2,000 per contact. |
| First C healing activation at ARM200/RES300 | Fixed contribution+20 ARM/+30 RES until that object's end, regardless of later reads. |
| Skill1 with an otherwise unmodified action grant10 | Requested qualifying Rage14 before the ordinary pool cap. Four combined arm Actions spend the Leader's four counts. |
| Skill2 at Leader HP1,500/10,000; Ma Nữ HP1,501/5,000, ATK400/WIL600, AE20 | Pay Ma Nữ HP1,500 and AE20, request Leader Heal2,850. At Ma Nữ HP1,500 payment would reach0, so no activation. |
| Three Naturals on one continuing target, no initial Skill3 charges | Three ordinary Basics =300/300; Skill3 activation + two enhanced Basics =320/320, +20 coefficient points ≈6.67% before mitigation. |
| Ma Nữ Ultimate's actual recipient HP losses1,000/2,000/3,000 | One Leader Heal600; unchanged Skill3 charges. |

Gameplay definitions belong here. Composition/gap proof, draft architecture and delivery/audit evidence belong to the architecture review/PR, not hidden gameplay locks in this Canon.
