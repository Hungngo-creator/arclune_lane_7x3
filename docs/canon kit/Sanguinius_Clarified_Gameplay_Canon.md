# SANGUINIUS — CLARIFIED GAMEPLAY CANON

**Character:** Sanguinius  
**Rank:** UR  
**Class:** Warrior  
**Native Element:** Blood  
**Status:** Clarified Gameplay Canon — ready for Pilot Normalization #3.  
**Scope:** Turn-based mode first.

## 0. Design intent
Sanguinius is an angelic divine being turned vampiric by a high-ranking vampire. He retains angelic/light imagery but is associated with Blood, sacrifice and tragedy. Ordinary sunlight is not automatically harmful; stronger solar/divine rules may be separate mechanics.

## 1. Global assumptions
- Runtime Light checks use `EFFECTIVE_ELEMENT = LIGHT`, not a Functional Tag.
- Warrior Natural Action completion grants Side/team `+5 AE` under the Turn-based Mode Profile.
- Active Skill default: validate legality/prerequisites/resources → commit/pay Cost → activate/resolve.
- “Rút HP” in this kit is `HP Cost`, not Damage, HP Loss or Max HP reduction.
- “Natural Action” means an actually performed Natural Action; CC-lost opportunity with no Action does not count.

## 2. Passive — Prime-Light pressure
Let `N` be the number of active enemy units satisfying:
`Rank = Prime AND Effective Element = Light`.

### 2.1 Ally-Heal reduction
Each qualifying enemy reduces Sanguinius-created Heal on allies other than himself by 10 percentage points.
Self-Heal from his own 4% Natural-Action passive and Skill 3 is not reduced by this rule.
Resulting Heal cannot be negative.

### 2.2 Target-local damage reduction
Each qualifying Prime-Light enemy independently receives 10% less **non-True Damage** from Sanguinius.
This does not stack globally by the total number of Prime-Light enemies.
True Damage is unaffected.

## 3. Passive — Natural-Action self-Heal
After Sanguinius actually completes one of his Natural Actions:
- if enemy active field has 0–2 `Effective Element = Light` units: Heal self = 4% Current Max HP;
- if enemy active field has 3+ Light units: this Heal is disabled.
Prime rank is not required for this rule.
CC-lost opportunity does not trigger it.

## 4. Passive — Max Rage reduction
After a successfully completed Ultimate:
`Max Rage -= 3`, minimum `1`.
Battle-scoped.
If Current Rage exceeds new Max Rage, clamp Current Rage to new Max Rage.

## 5. Skill 1
Active Skill.
- AE Cost = 25.
- HP Cost = 20% Sanguinius Current Max HP.
- Does not reduce Max HP.

First damage phase on one target:
- Physical = `140% ATK + 10% Current Max HP`
- Will = `180% WIL + 10% Current Max HP`

Then sequential explosion:
- True Damage = `2% target Current Max HP`.

If phase one makes the target lifecycle-invalid for further damage, the explosion does not resolve.

## 6. Skill 2 — distributed HP Cost
Active Skill.
- Cast prerequisite: Sanguinius Current HP >= 40% Current Max HP.
- AE Cost = 20.

Mandatory payer:
- Sanguinius pays 10% of his Current Max HP.

Optional allied payers:
- every allied non-Leader active on field with Current HP >= 60% of own Current Max HP;
- each pays 10% of own Current Max HP.

Each affected ally is payer of their own HP Cost.
Payer set is snapshotted before payment.
If an optional ally cannot pay because of a special rule, that ally contributes 0 and does not by itself fail the whole Skill.

Let `T = total actual HP successfully paid`.
Leader Heal nominal base = `T`.

Apply Prime-Light ally-Heal modifier before determining Overheal.
Only post-modifier Overheal becomes Shield.

## 7. Skill 2 Shield
One source-specific Shield pool on allied Leader.
- cap = 100% Leader Current Max HP;
- positive new Shield adds to the pool up to cap;
- positive new Shield refreshes entire pool duration;
- zero new Shield does not refresh.

Duration:
- 2 future actually performed Sanguinius Natural Actions;
- current cast Action does not decrement it;
- CC-lost opportunity does not decrement it;
- after two qualifying Natural Actions, remaining pool expires.

## 8. Skill 3
Passive/automatic.
- Cost = 10 AE.
- Heal self = 8% Current Max HP.
- no Natural Action consumed.
- if 10 AE cannot be paid at its settlement point: no Heal.

Prime-Light ally-Heal reduction does not reduce this self-Heal.

### 8.1 Two-zone ordering
Legacy 75% logic is removed.

If Sanguinius begins the Natural-Action decision sequence at `<=30% Max HP`:
1. Skill 3 attempts first.
2. Then selected active Ability is revalidated.
3. If legal/payable, its Cost commits and it proceeds.
4. Otherwise use declared fallback.

If Sanguinius begins at `>30% Max HP`:
1. selected active Ability Cost commits first;
2. Skill 3 then attempts to pay 10 AE and Heal;
3. active Ability proceeds.

Branch is selected from pre-active-Cost HP and does not retroactively change in that Action.

Basic has no active Skill Cost, so Skill 3 attempts before Basic effect.
Ultimate follows the same two-zone ordering.

Derived consequence:
Skill 2 requires >=40% HP. A <=30% Sanguinius healed by 8% still cannot reach 40%, so low-HP requested Skill 2 remains illegal after revalidation and must use fallback.

## 9. Ultimate
Ultimate HP Cost nominally = 25% Current Max HP, but must leave at least 2% Current Max HP.

`payableHP = min(25% MaxHP, max(0, CurrentHP - 2% MaxHP))`

Ultimate is still legal with `payableHP = 0` if other legality conditions pass.

### 9.1 Blood arrow
Target = enemy Leader regardless of Sanguinius position.
True Damage = actual HP successfully paid by Ultimate.

### 9.2 Fixed-column slash
In `TURN_BASED_MAIN`, target eligible enemy occupants of positions `2/5/8`.
Per target:
- Physical = 170% ATK
- Will = 170% WIL

### 9.3 Simultaneous batch
Blood arrow and slash resolve in one simultaneous damage batch.
If enemy Leader occupies 2/5/8, Leader may receive both arrow True Damage and slash Physical/Will Damage before lifecycle processing.

## 10. Basic Attack
One enemy:
- Physical = 100% ATK
- Will = 100% WIL

## 11. Important distinctions
- Native Element ≠ Effective Element ≠ Functional Tag.
- Rank Prime ≠ Authority Tier.
- HP Cost ≠ Damage ≠ HP Loss ≠ Max HP Mutation.
- nominal HP Cost ≠ actual HP successfully paid.
- Sanguinius-created ally-Heal reduction ≠ self-Heal reduction.
- Prime-Light ally-Heal pressure ≠ 3+ Light self-Heal suppression.
- target-local -10% non-True Damage ≠ global stacking by Prime-Light count.
- global TURN_BOUNDARY ≠ Sanguinius Natural-Action duration clock.
- CC-consumed opportunity ≠ actually performed Natural Action.
- VFX simultaneity ≠ gameplay simultaneity, except Ultimate batch explicitly locked here.

## 12. Locked parameters
- UR / Warrior / Blood.
- Prime-Light ally-Heal penalty: 10% per qualifying enemy.
- Prime-Light target-local non-True damage penalty: 10%.
- Self-Heal after Natural Action: 4% Max HP; disabled at 3+ enemy Light.
- Max Rage -3 per completed Ultimate; floor 1.
- Skill 1: 25 AE, 20% MaxHP HP Cost, 140% ATK +10% MaxHP Physical, 180% WIL +10% MaxHP Will, then 2% target MaxHP True.
- Skill 2: >=40% HP prerequisite, 20 AE, 10% MaxHP self HP Cost, qualifying allies pay 10% own MaxHP, Shield cap 100% Leader MaxHP, duration 2 future actual Sanguinius Natural Actions.
- Skill 3: 10 AE, Heal 8% MaxHP, low-HP threshold <=30%.
- Ultimate: 25% MaxHP nominal HP Cost, floor 2%, arrow True = actual HP paid, slash 170% ATK Physical +170% WIL Will on 2/5/8.
- Basic: 100% ATK Physical +100% WIL Will.

## 13. Ready for Pilot Normalization #3
The next model should compare raw legacy kit against this Clarified Gameplay Canon, normalize terminology, map mechanics into existing architecture, classify each mechanic as `EXISTING`, `SCHEMA/PARAMETER ONLY`, `GENERIC ARCHITECTURE GAP`, or `CHARACTER-SPECIFIC COMPOSITION`, and produce an Architecture Impact Matrix 01–08.

Do not create new Tag/Primitive/Contract IDs merely because Sanguinius is complex.
