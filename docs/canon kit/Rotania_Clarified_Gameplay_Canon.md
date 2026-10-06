# Rotania — Clarified Gameplay Canon

## 1. Identity, provenance and precedence

- Character: **Rotania**. Class: **Mage**.
- Raw-kit provenance: root `Ý tưởng nhân vật 4.md`, item **13) Rotania**, identified by the name and the five named abilities below.
- The explicit **ROTANIA DESIGNER LOCKS** supersede older raw wording and the earlier unresolved interpretations of Action identity, clocks, reward retention, charge recast and Shield termination. Later explicit designer corrections take precedence over this Canon; this Canon takes precedence over older raw wording.
- Rank, native Element, base stats, Basic Attack formula and deployment budget are not supplied. No value is inferred from the illustrative Rage values.

## 2. Locked gameplay

### 2.1 Passive — Orbital Recurrence / Quỹ Đạo Hồi Quy

**Rhythm.** Each new Rotania Field Presence starts a fresh alternating cycle:

```text
actually-performed Natural Action #1 → OFF
actually-performed Natural Action #2 → ON
actually-performed Natural Action #3 → OFF
actually-performed Natural Action #4 → ON
...
```

Only Rotania's **actually-performed Natural Actions** advance this phase. CC-lost opportunities and all non-Natural Actions advance nothing. **LEAVE_FIELD resets the cycle**; the first actual Natural Action of a new presence is OFF. Ordinary Deck full-Rage initialization can make that first Action an Ultimate, but entry itself grants no immediate Natural Action.

**Basis.** For each target, let `P_target` be the aggregate committed Actual HP Damage received from Rotania's qualifying direct outcome of the ON Natural Action. Include root Basic/Skill direct Damage and explicitly authored direct child Damage, including Skill 1 called by Ultimate. Exclude this Passive's own follow-up, DoT, Counter, Reaction, unrelated Follow-up, Mark Damage and unrelated Passive Damage. Sharing rootActionId or Damage Attribution is insufficient. Shield absorption and Overkill are excluded.

After direct Damage and its mandatory lifecycle, for each still-lifecycle-valid qualifying recipient with **P_target > 0**:

```text
follow-up requested TRUE Damage = 30% × P_target
```

A recipient already DEATH_CONFIRMED by the primary Damage is not hit again. The follow-up is one layer only; it never feeds its own basis. Example: committed Actual HP Damage100 → requested TRUE Damage30, subject to the ordinary TRUE/Shield pipeline.

**Identity and cap.** The Passive creates a separate non-Natural **FOLLOW_UP Action/settlement** with its own Action/effect provenance and the same root Natural-Action outcome. “One Action with the main attack” means one Natural opportunity, not one shared Action identity. It grants no SSI advance, class Action regeneration or Passive-phase advance.

At most **9 target follow-up activations** are allowed per ON Natural Action. If a profile permits more than nine qualifying targets, selection must use an existing explicitly declared deterministic target-selection policy; no Entity/Slot/list order may be invented. The unsupported greater-than-nine profile is addressed in §4.

**Local sequence.**

```text
qualifying direct Damage
→ mandatory lifecycle
→ Passive follow-up on still-valid qualifying recipients
→ mandatory lifecycle for follow-up results
→ death-reward settlement
→ Ultimate Heal, if this root is Ultimate
→ remaining direct/root settlements
→ ACTION_DIRECT_EFFECTS_COMPLETE
→ ordinary eligible Reactions
```

No ordinary Reaction window is inserted before the declared follow-up, rewards or Ultimate Heal. Mandatory lifecycle remains mandatory.

### 2.2 Skill 1 — Fivefold Singularity / Ngũ Trùng Kỳ Điểm

- Active Skill; base standalone Cost **30 AE**.
- This exact attack owner uses **POSITION / LOCK_POSITIONS** on enemy Slots **2 / 4 / 5 / 6 / 8**.
- At the recipient checkpoint, query each locked Slot's current legal occupant. Empty Slots have no recipient. If the original occupant moved and another legal Entity occupies the Slot, that current occupant receives the hit.
- No chase, reroll or retarget. The five distinct Slots give each recipient at most one Skill 1 hit; fewer than five occupied Slots do not repeat hits.
- All occupied legal locked Slots resolve as **one SIMULTANEOUS batch**, with one common Rotania ATK/WIL source snapshot at that batch's calculation checkpoint.
- Per recipient: **PHYSICAL = 120% ATK; WILL = 150% WIL**.
- Presentation: five black holes; VFX varies with the actual target count and is absent at empty targetable Slots. It does not alter hit multiplicity.

**Standalone death reward.** For an ordinary paid Skill 1, each unique qualifying **Chân Ngã DEATH_CONFIRMED** caused by this cast's own direct Damage or its qualifying Rotania Passive follow-up reduces **future standalone Skill 1 AE Cost by4**. Each death rewards exactly once. Exclude unrelated Damage, DoT, Counter, Reaction, another Action merely sharing root/attribution, and targets without Chân Ngã. HP zero alone is insufficient.

The accumulated reduction is **BATTLE_SCOPED**, retained through death, Revive, LEAVE_FIELD and redeploy, and reset at battle end unless a later explicit mechanic modifies it.

```text
future standalone Cost = max(0, 30 − accumulated reduction)
30 → 26 → 22 → 18 → ... → minimum0 AE
```

No negative Cost, retroactive refund of the already-paid cast, or AE refund below zero. The reward route follows cast context, not positive payment: a standalone cast at Cost0 still uses the standalone route under ordinary successful zero-Cost semantics.

**Ultimate route.** A Skill 1 called by Ultimate costs **0 AE** and grants the Max Rage reward in §2.5 instead. A qualifying death never grants both reward types.

### 2.3 Skill 2 — Arrested Orbit / Quỹ Đạo Đình Chuyển

- Active Skill; Cost **25 AE**.
- Successful activation uses one actually-performed Natural Action, has a charging animation and deals **no immediate Damage**.
- It creates one pending enhancement for Rotania's **next actually-performed Natural Action**. CC-lost opportunities do not consume it.
- That one enhanced Natural Action's qualifying Basic/Skill/Ultimate Damage coefficients are multiplied by **1.40**, including the explicitly authored Skill 1 child of an enhanced Ultimate.
- Example Skill 1: **150% WIL → 210% WIL; 120% ATK → 168% ATK**. This is coefficient multiplication, not +40 percentage points or a substituted final-Damage multiplier.
- Counter, Reaction, independent Follow-up and non-Natural attacks outside the qualifying Natural root do not gain the enhancement merely because the State exists.
- The Passive's factor remains **30%** of the resulting committed Actual HP Damage; it is not independently multiplied by1.40.

**Recast is allowed.** If the next actual Natural Action is Skill 2 again, it consumes the old enhancement window. That old bonus deals no Damage because Skill 2 deals none. A successful new activation creates one fresh pending enhancement for the following actual Natural Action. No stacking of pending1.40 charges and no recast prohibition.

Pending charge is temporary **current-life/current-presence State**. DEATH_CONFIRMED or LEAVE_FIELD clears it; Revive/redeploy does not restore the old charge. Already bound Action evidence remains distinct from an unconsumed pending charge.

### 2.4 Skill 3 — Event Horizon Aegis / Hộ Thuẫn Chân Trời Sự Kiện

Automatic self-save Skill, with at most **2 successful activations per battle**.

```text
CurrentHP <= 15% CurrentMaxHP
AND Current Rage >= 40
AND successful battle uses < 2
```

Exactly15% HP qualifies. Eligibility is a state predicate, not a Damage-only trigger. Evaluate after stable authoritative changes capable of changing it: CurrentHP, CurrentMaxHP, Current Rage from an external/ordinary gameplay source, and valid Field entry/initialization after authoritative values are established. No continuous polling.

**One activation per qualifying checkpoint.** This activation's own Current Rage−20, Max Rage+20 and Shield grant must not recursively create another Skill 3 activation inside the same settlement/checkpoint. A second activation requires a later independent qualifying authoritative checkpoint after the first settlement is terminal.

On successful activation, atomically:

```text
Current Rage -= 20
Max Rage += 20
successful battle uses += 1
```

Both Rage mutations belong to the same activation transaction. If the required Rage condition/payment fails, no activation or use consumption occurs. Max Rage increase is a limit mutation and the intended readiness nerf, not Max Rage spending. The use cap persists through death/Revive/leave/redeploy; a new presence is not a new battle.

Example without unrelated Rage changes: **40/100 → 20/120**. At HP<=15% with Rage100, one checkpoint gives Rage80 and Max Rage+20; it does not immediately spend the second use even though Rage remains>=40.

**Independent Shields.** Each successful activation creates its own Shield contribution:

```text
requested Shield = 45% CurrentMaxHP at that grant checkpoint
```

The granted amount snapshots that checkpoint's Max HP. A later independent checkpoint can activate Skill 3 while the first Shield remains. The second contribution does not replace the first or refresh its clock. Each has its own duration and terminal-Heal entitlement.

**Depletion priority.** All Rotania Skill 3 contributions share the highest depletion layer, before every other Shield source, including an external Shield requesting its own first consumption. Within this highest layer, coexistence uses ordinary **proportional source-ledger depletion**, with no FIFO/LIFO or contribution-order priority. This is a depletion rule, not an inferred Authority tier.

**Duration.** Each contribution lasts through Rotania's next **3 actually-performed Natural Actions after grant**, expiring at the third qualifying Natural Action completion. The Natural Action already in progress at grant does not retroactively count. CC-lost opportunities and non-Natural Actions decrement nothing. Each contribution has an independent clock.

**Terminal Heal.** One actual contribution removal caused by natural expiry, full Damage depletion/break, or explicit dispel/removal while Rotania remains alive and Field-present triggers that contribution's own Heal:

```text
requested Heal = 25% CurrentMaxHP at that Heal settlement checkpoint
```

The Heal reads current Max HP, not the grant snapshot. Two separate Shields terminating can each produce a Heal. Settle after the removal/Damage group's commit and mandatory lifecycle; do not insert Heal between Shield depletion and the same Damage's HP spillover. A dead/retired original owner cannot be healed, revived or held for a later retry. Ordinary Heal admission/modifiers/Overheal law applies.

Removal due to **DEATH_CONFIRMED, LEAVE_FIELD, battle termination or lifecycle/presence cleanup grants no terminal Heal**. Cleanup is not break, expiry or dispel. A nonexistent/zero-added contribution grants no terminal-Heal entitlement.

### 2.5 Ultimate — Grand Orrery: Black-Star Revolution / Đại Thiên Nghi: Vòng Quay Hắc Tinh

**Root and child.** Root identity **ULTIMATE**. It calls exactly one **SKILL** Skill 1 child, non-Natural, with the Ultimate rootAction and **child AE Cost override0**. The child retains Skill 1's fixed Slots/current-occupant semantics, common source snapshot, simultaneous batch and base Damage profile. An enhanced Natural Ultimate supplies Skill 2's1.40 coefficient multiplier to that child. An ON Natural Ultimate may also activate the Passive.

The AE waiver does not waive unrelated Costs or create another Natural Action.

**Context-specific death reward.** After child direct Damage and the qualifying Passive, with their mandatory lifecycle stable, collect each unique Chân Ngã DEATH_CONFIRMED caused by that child's own direct Damage or that outcome's Rotania Passive follow-up. Each rewards:

```text
Max Rage -= 3
Max Rage floor = 0
after each Max Rage mutation:
  Current Rage = min(Current Rage, new Max Rage)
```

Never also reduce standalone Skill 1 Cost for that death. The reduction is **BATTLE_SCOPED**, retained through death/Revive/leave/redeploy and reset at battle end unless later explicit gameplay modifies it. Reduction is not Rage spending and does not create an Ultimate cast.

**Heal.** Let `U` be the sealed aggregate committed Actual HP Damage from the Ultimate-called Skill 1's **own direct Damage only**. Exclude the Passive TRUE follow-up, Shield absorption, Overkill, DoT, Counter, Reaction and unrelated Damage.

```text
requested self Heal = 20% × U
```

Settle after child Damage, Passive, their mandatory lifecycle and unique death rewards are stable. Overheal from this exact Ultimate Heal is **DISCARD and cannot be converted into Shield** by Rotania, an ally, an enemy or generic Overheal→Shield conversion. This explicit denial does not prohibit conversion of a different Heal's Overheal.

**Ultimate sequence.**

```text
Ultimate root admitted
→ exactly one Skill 1 child with AE Cost waived
→ child simultaneous direct Damage
→ mandatory lifecycle
→ ON-phase qualifying Passive follow-up
→ mandatory lifecycle
→ unique qualifying death rewards (Max Rage−3 each; clamp)
→ Heal20% of Skill 1-direct Actual HP Damage only
→ remaining root direct settlements complete
→ ACTION_DIRECT_EFFECTS_COMPLETE
→ ordinary eligible Reactions
```

Event/list/Entity order does not decide death rewards or Heal. Mandatory lifecycle is not an ordinary Reaction window.

## 3. Cross-mechanic examples and negative space

- Standalone Skill 1, OFF, kills two Chân Ngã: future Skill 1 Cost−8.
- Standalone Skill 1, ON, leaves a target alive then the Passive kills it: future Skill 1 Cost−4.
- Ultimate, ON, child kills one Chân Ngã and Passive kills another: Max Rage−6, standalone Skill 1 Cost unchanged, Heal basis includes only child direct Actual HP Damage.
- Skill 2 → next actual Natural Ultimate: child coefficients1.40; Passive may activate according to phase and uses the enhanced committed Damage basis.
- A later independent qualifying HP/MaxHP/Rage checkpoint can spend the remaining Skill 3 use even while the first Shield exists; Skill 3's own settlement cannot recursively spend it.
- Failed admission/payment grants no successful activation; mere probing is not an actually-performed Natural Action.
- TRUE Damage is not automatically Shield Piercing; committed HP Damage excludes Shield and Overkill.
- Field entry/deployment, full Rage and Max Rage0 do not independently create a Natural Action or Ultimate.
- Skill 3 is not an anti-death/Revive rule; terminal Heal cannot materialize a DEATH_CONFIRMED Rotania.
- Class, Rank, lore and VFX imply no Authority tier.
- No shared Action identity, recursive Passive, double reward route, negative Cost/Max Rage, CC duration decrement, arbitrary non-Natural enhancement, FIFO/LIFO Shield priority or cleanup Heal is permitted.

## 4. Unresolved / not-blocking boundaries

- **Metadata:** Rank, native Element, base stats, Basic Attack formula and deployment budget. Resolve only when authoring/runtime actually needs them; do not invent values.
- **Greater-than-nine target profile:** the current fixed-Slot Skill 1/Ultimate cannot exceed five recipients, and the current opposing nine-Slot board bounds that roster. A future Mode/attack admitting more than nine qualifying recipients must supply its deterministic cap-selection policy. An undeclared policy is rejected; the cap does not grant a hidden first-nine order.
- **External content / Modes:** foreign rules and Modes need their own explicit compatible admission, conflict, numeric and spatial profiles. They do not weaken these locked Rotania semantics or silently change prior Character rules.

## 5. Normalization status

**Status: GAMEPLAY_CLARIFIED / ARCHITECTURE_NORMALIZED.**

Generic normalization deltas: first-depletion Shield source-family layer; exact-Heal Overheal-to-Shield denial; stable predicate checkpoints with own-activation exclusion; bounded Rage-limit/current reconciliation. Other locked mechanics use existing generic composition.
