# Rotania — Clarified Gameplay Canon

## 1. Identity, provenance and precedence

- Character: **Rotania**. Class: **Mage**.
- Raw-kit source: root `Ý tưởng nhân vật 4.md`, item **13) Rotania**, identified by the Character name and the five named abilities below.
- The designer's explicitly supplied Rotania kit confirms that entry. Later explicit designer corrections take precedence over this Canon; this Canon takes precedence over older raw wording on clarified gameplay points.
- Rank, native Element, base stats, deployment metadata and Basic Attack formula are not supplied. They remain unresolved metadata; no value is inferred from the example Rage values.
- This document records gameplay meaning. An unresolved execution decision below is not an approved default or an architecture gap.

## 2. Locked gameplay

### 2.1 Passive — Orbital Recurrence / Quỹ Đạo Hồi Quy

Rotania's Natural Actions alternate within one Field presence:

```text
ENTER_FIELD
→ first Natural Action: no Passive activation
→ second Natural Action: Passive activation
→ third Natural Action: no Passive activation
→ fourth Natural Action: Passive activation
→ continue alternating until LEAVE_FIELD
```

Deployment's ordinary full-Rage rule can make the first Natural Action an Ultimate when no other kit intervenes; the example does not grant an immediate Action on entry or require the first Action to be an Ultimate.

On an activating Natural Action, after that Action's Damage is finished, each qualifying target receives additional **TRUE Damage = 30% of the Actual HP Damage that target received from Rotania in the qualifying damage scope**. The additional attack is a **Follow-up**. The designer describes it as counting together with the main attack as **one Action**; the observable scope of that statement and the exact qualifying receipt membership remain unresolved in §4.1.

- Per activation, at most **9 targets** receive the Passive follow-up.
- The basis is committed Actual HP Damage, not requested Damage, Shield absorption or Overkill. The designer's example is **100 Actual HP Damage → 30 requested TRUE Damage**.
- The follow-up itself must not recursively enter its own 30% basis.
- Ultimate can activate the Passive. Skill 2's charging Action deals no immediate Damage and therefore supplies no immediate Damage basis.
- Confirmed deaths caused by the Passive belong to the explicitly stated Skill 1/Ultimate reward scope described below.
- A missed opportunity's effect on the alternating counter is unresolved; non-Natural Actions do not become extra Natural Actions merely because they belong to the same attack sequence.

### 2.2 Skill 1 — Fivefold Singularity / Ngũ Trùng Kỳ Điểm

- Base Cost: **30 AE**.
- Attack area: the enemy Side's fixed Positions **2 / 4 / 5 / 6 / 8**.
- Each occupied qualifying target receives one hit with **150% Rotania WIL + 120% Rotania ATK**.
- If fewer than five targets are present, each target is hit only once. Empty Positions do not redirect their hits or create repeat hits on another target.
- Presentation: five black holes; VFX varies with actual targets and is absent at targetable empty Positions. Presentation does not change target selection or Damage multiplicity.
- Each target with **True Self** reaching **DEATH_CONFIRMED** from this Skill's stated attack scope reduces Skill 1's AE Cost by **4 AE**.
- If Orbital Recurrence activates, deaths from its follow-up also qualify for this Skill 1 reward. Merely reaching HP zero without DEATH_CONFIRMED is insufficient.
- When Skill 1 is called by Ultimate, the explicitly different reward in §2.5 applies. Cost-reduction accumulation, floor, retention and exact attribution boundaries remain unresolved in §4.2.

### 2.3 Skill 2 — Arrested Orbit / Quỹ Đạo Đình Chuyển

- Cost: **25 AE**.
- Activation uses **one Natural Action**, with a charging animation and **no immediate Damage**.
- It prepares the **next Natural Action**: Damage coefficients of that Action's Ultimate, Skill or Basic Attack increase by **40%**, for that one Natural Action.
- This multiplies the affected coefficients by **1.40**. It is not a replacement with a final-Damage amplification rule.
- Locked example: Skill 1 becomes **210% WIL + 168% ATK** per target.
- If the Passive activates on that Skill 1, it still requests **30% of Skill 1's qualifying Actual HP Damage** as TRUE Damage. Its 30% factor does not become 42%; its amount can grow because the primary attack's committed Damage grows.
- The example's five qualifying Skill 1 deaths reduce that Skill's Cost by **20 AE**; this does not define an unstated Cost floor or cumulative lifetime.
- Charge consumption, reapplication, CC and lifecycle decisions remain unresolved in §4.3.

### 2.4 Skill 3 — Event Horizon Aegis / Hộ Thuẫn Chân Trời Sự Kiện

Automatic eligibility requires both:

```text
Current HP <= 15% Current Max HP
Current Rage >= 40
```

On activation:

- **Current Rage decreases by 20**.
- **Max Rage increases by 20**. This is a resource-limit change, not payment of 20 Max Rage.
- Rotania receives a self Shield worth **45% of her Max HP**.
- The Shield lasts **3 Natural Actions** and disappears after those three.
- Damage consumes this Skill 3 Shield before other Shields, including an external Shield whose own description requests first consumption. This explicit ordering must be preserved; no Authority tier is invented from it.
- When this Shield disappears, Rotania heals **25% of her Max HP**. Which terminal causes qualify for this Heal remains unresolved in §4.4.
- Skill 3 can activate at most **2 times per battle**. Leaving/re-entering Field is not a new battle and does not reset that cap.

Locked illustration, with no other Rage changes: **40/100 → 20/120**. Higher Max Rage delays ordinary full-Rage Ultimate readiness; the example is not a lock of Rotania's base Max Rage.

Activation checkpoints, overlapping activations, the exact three-action clock, Max HP read checkpoints and terminal/lifecycle behavior remain unresolved in §4.4.

### 2.5 Ultimate — Grand Orrery: Black-Star Revolution / Đại Thiên Nghi: Vòng Quay Hắc Tinh

- Cast **Skill 1 exactly once**, with that cast's **AE Cost waived**. This does not waive unrelated Costs or create an additional Natural Action.
- For each qualifying target with **True Self** reaching **DEATH_CONFIRMED** from this Ultimate's Skill 1 attack, **including Orbital Recurrence**, **Max Rage decreases by 3**. The designer gives this different reward because the Ultimate's Skill 1 already costs no AE; exact coexistence with the ordinary Skill 1 reduction, retention and floor remain unresolved in §4.2.
- After the attack, Rotania heals **20% of total qualifying Actual HP Damage caused by Ultimate's Skill 1**.
- That Heal basis **excludes the Passive's TRUE Damage**. It does not include Shield absorption, nominal requested Damage or Overkill.
- **Overheal from this Ultimate is discarded. It cannot be converted to Shield by an allied or enemy kit**, even if that kit ordinarily converts Overheal to Shield.
- Ultimate can activate Orbital Recurrence; its Skill 1 reward's death membership includes the Passive, while its 20% Heal basis excludes the Passive. These are intentionally different scopes.

The exact completion/settlement ordering relative to the Passive and other reactions remains unresolved in §4.1. Ordinary Ultimate admission and Rage consumption are separate from the explicitly declared AE waiver and Max Rage reward.

## 3. Character-specific negative space

- A follow-up is not another Natural Action opportunity. Sharing an attack sequence does not by itself make every child/reaction/DoT receipt part of the original attack's Damage basis.
- Skill 1 does not seek five Entity targets elsewhere when its declared fixed Positions are empty.
- Skill 2's primary-Damage coefficient increase does not multiply Orbital Recurrence's 30% factor.
- No Skill 1 Cost refund, successful activation on failed payment, or reward for a target lacking True Self is implied.
- Skill 3 is not an anti-death or Revive rule. A Heal does not restore a DEATH_CONFIRMED Rotania to Field.
- Shield depletion, natural expiry, Cleanse and transition cleanup are different terminal causes. Their eligibility for the Skill 3 Heal must not be silently equated.
- Ultimate's Overheal exclusion is scoped to this Ultimate's Heal; it is not a global ban on Overheal conversion or an inferred restriction on Skill 3's Heal.
- No native Element, Rank or Authority level is inferred from the Character name, Class or VFX.

## 4. Unresolved gameplay

### 4.1 Passive Action scope and completion

**BLOCKING:** clarify what “one Action with the main attack” exposes to gameplay observers: one Natural Action containing a distinct non-Natural follow-up, or one shared Action identity. Lock which direct/child Damage receipts feed the per-target 30% basis, the activation counter's CC behavior, and the settlement order relative to Skill 1/Ultimate death rewards and Ultimate Heal.

### 4.2 Skill 1 / Ultimate death rewards

**BLOCKING:** lock ordinary Skill 1's Cost-reduction lifetime, cumulative floor and application to later casts; whether Ultimate replaces or also grants that reduction; Max Rage reduction's lifetime/floor and Current Rage reconciliation; and whether only this attack/its Passive's confirmed deaths qualify, with one reward per qualifying confirmed-death instance.

### 4.3 Skill 2 charge consumption and cleanup

**BLOCKING:** lock whether a CC-lost opportunity consumes the charge, what occurs if the next Natural Action is another Skill 2 or otherwise nondamaging, whether repeated charges stack/replace/are forbidden, and death/leave/redeploy retention. Define whether the coefficient increase covers the Ultimate's called Skill 1 and excludes independent non-Natural attacks.

### 4.4 Skill 3 activation, Shield lifetime and terminal Heal

**BLOCKING:** lock automatic reevaluation checkpoints (including entry/Rage gain/Max HP change), retrigger eligibility while a prior Shield is active, repeated-Shield stacking, which three Natural Actions are counted (including CC/origin Action), Max HP read checkpoints for Shield and Heal, qualifying Shield terminal causes, and death/leave cleanup. The per-battle two-use cap and precedence over external Shields are already locked.

### 4.5 Metadata and external boundaries

**UNRESOLVED / NOT BLOCKING clarification:** Rank, native Element, base stats, Basic Attack formula and deployment budget. Executable content must resolve metadata it actually uses before runtime admission; this Canon does not guess values. Conflicts with unspecified future kits do not authorize inventing additional Rotania rules.

## 5. Normalization status

**Status: GAMEPLAY_PARTIALLY_CLARIFIED / ARCHITECTURE_NORMALIZATION_BLOCKED_ON_§4.1–§4.4.**

The locked gameplay remains authoritative while those decisions are unresolved. No architecture extension is asserted by this status.
