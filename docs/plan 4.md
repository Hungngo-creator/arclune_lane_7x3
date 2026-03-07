# Dual-layer Counter System — Prompt Review, Hardening, and Milestone Plan

## 1) Reading Notes From Current Codebase (to maximize reuse first)

1. **Damage pipeline already has a stable center point**: `dealAbilityDamage()` in `src/combat.ts` is where pre-damage modifiers, mitigation, shield, and post-damage hooks are applied. This is the best place to inject dual counter logic without scattering formula code.  
2. **There is already a modifier gateway**: `Statuses.beforeDamage()` in `src/statuses.ts` returns `outMul`, `inMul`, `defPen`, `ignoreAll` and is consumed by `dealAbilityDamage()`. We should extend this flow (or wrap around it), not bypass it.  
3. **Unit/class metadata already exists and is propagated**:
   - Roster/meta has `class` in `src/catalog.ts`, `src/types/config.ts`, `src/meta.ts`.
   - Runtime token already has `class` in `src/types/units.ts`.
4. **UI already shows class-like tags in some places** (lineup roster, collection, campaign boss panel), so adding element/class icon display should hook into existing render points rather than creating separate new UI systems.
5. **VFX has extensibility via optional hit-event payload** (`vfxAddHit(..., opts)`), so “ADVANTAGE/CRITICAL” feedback can be attached via existing hit effects + text layer, not a brand-new animation framework.

---

## 2) Prompt Critique (soi kỹ, bắt bẻ kỹ)

### 2.1 Ambiguities / conflicts

1. **“Before applying defense/reduction” is ambiguous**: does this mean before armor/resistance, but after status outMul/inMul? We need explicit ordering.
2. **Wind+Fire synergy wording is not deterministic**: “+5% Burn chance or +5% Damage” needs a rule:
   - always Burn if Burn-capable attack?
   - selectable config toggle?
   - fallback to +5% damage when Burn is unavailable?
3. **Class list mismatch risk**:
   - Prompt uses `Archer`, while game has `Ranger` in core class base.
   - Need mapping (`Archer -> Ranger`) or schema migration decision.
4. **Element source of truth unclear**:
   - from catalog meta?
   - runtime token?
   - lineup JSON?
   A canonical precedence rule is required.
5. **Scope includes NPC/Boss but does not define legacy fallback**:
   - if old data lacks `element`, should default be `Neutral`/`None`.
6. **Stacking says additive**, but not clamped:
   - Can total bonus exceed sane bound if future systems add more modifiers?
7. **UI requirement “specific color Gold” but no accessibility constraints**:
   - need fallback label/icon for colorblind compatibility.
8. **No acceptance tests specified**, which is risky for a combat formula change.

### 2.2 Hidden technical risks

1. If implemented as many ad-hoc `if` blocks in combat callsites, formula will diverge between basic attack / skill / ult / tags.
2. If adding `element` only in one type file, runtime may silently miss it due to many normalized adapters.
3. Existing tests around damage and PVE runtime may break unless deterministic matrix helpers are pure and unit-tested.

---

## 3) Refined Prompt (production-ready version)

> **Objective**: Implement a deterministic dual-layer counter system (Elemental + Class) for combat damage in the 7x3 lineup architecture, maximizing reuse of existing combat pipeline and metadata services.
>
> ### A. Combat Rules
> 1. **Elemental counters**
>    - Cycle bonus (+10% damage): Fire -> Metal -> Wood -> Earth -> Lightning -> Blood -> Water -> Fire.
>    - Mutual bonus (+10% each direction): Light <-> Dark.
>    - Wind has no offensive counter relation.
> 2. **Lineup synergy**
>    - If a side has at least 1 Wind unit and at least 1 Fire unit alive/in-lineup, Fire attackers on that side gain:
>      - `+5% Burn chance` if the attack can apply Burn,
>      - otherwise `+5% damage`.
> 3. **Class counters (additive with element)**
>    - Assassin: +10% vs Mage, +5% vs Support
>    - Mage: +10% vs Warrior, +5% vs Tanker
>    - Tanker: +10% vs Assassin, +5% vs Summoner
>    - Warrior: +10% vs Tanker, +5% vs Archer/Ranger
>    - Archer/Ranger: +10% vs Mage, +5% vs Support
>    - Summoner: +10% vs Archer/Ranger, +5% vs Warrior
>    - Support: +10% vs Summoner, +5% vs Mage
> 4. **Stacking**
>    - Element bonus + class bonus + synergy bonus are additive into a single `counterBonusPct`.
>
> ### B. Formula Integration Contract
> 1. Add `calculateFinalDamage(attacker, defender, rawDamage, context)` as centralized helper used by `dealAbilityDamage()`.
> 2. Order of operations:
>    - rawDamage
>    - apply `counterBonusPct`
>    - then existing defense/reduction pipeline (armor/res, statuses, shields, etc.)
> 3. Preserve current behavior if element/class missing (default 0% bonus).
>
> ### C. Data Contract
> 1. Every combat entity (player unit, creep, NPC, boss, summon if applicable) must expose:
>    - `class` (existing)
>    - `element` (new)
> 2. Ensure propagation across:
>    - catalog/meta definitions
>    - runtime token creation
>    - lineup/preview/collection relevant DTOs.
>
> ### D. UI/UX
> 1. Show element + class markers on Character Cards and Stage Boss Info.
> 2. On advantageous hit, show explicit feedback (`ADVANTAGE` and/or highlighted damage text with accessible contrast + optional gold accent).
>
> ### E. Constraints
> 1. Reuse existing functions/pipeline first; avoid duplicate damage formulas.
> 2. Do not implement by directly patching `app.js`.
> 3. Add tests for matrix logic, stacking logic, missing-data fallback, and integration in combat flow.

---

## 4) Milestone Plan (chia chặng hợp lý, ưu tiên tái sử dụng)

## Stage 0 — Contract & Mapping Freeze
- Deliverables:
  - Final enum/value map for `element` + class alias (`Archer` <-> `Ranger`).
  - Formal formula order and fallback behavior.
- Why first:
  - Avoid rework in tests/UI due to naming mismatch.

## Stage 1 — Pure Counter Engine (No UI yet)
- Reuse-first approach:
  - Add a pure utility module (e.g. `src/combat/counter-matrix.ts`) that only computes bonuses.
  - Keep all logic deterministic and stateless.
- Core APIs:
  - `getElementBonus(attackerElement, defenderElement): number`
  - `getClassBonus(attackerClass, defenderClass): number`
  - `getWindFireSynergyBonus(attacker, sideTokens, context): number`
  - `getCounterBonusBreakdown(attacker, defender, context): { elementPct, classPct, synergyPct, totalPct }`
- Tests:
  - full matrix coverage + alias coverage + null/unknown safety.

## Stage 2 — Integrate into Existing Damage Pipeline
- Reuse-first approach:
  - Integrate only at `dealAbilityDamage()` (single source of truth).
  - Keep `Statuses.beforeDamage/afterDamage` intact.
- Deliverables:
  - `calculateFinalDamage(...)` wrapper/helper called from `dealAbilityDamage()`.
  - Preserve existing mitigation/shield/death hooks.
- Tests:
  - integration tests proving additive stacking (e.g. Archer Lightning vs Mage Blood = +20%).

## Stage 3 — Data Propagation (Entity Schema + Runtime)
- Reuse-first approach:
  - Extend existing type interfaces and meta adapters, do not fork parallel DTOs.
- Deliverables:
  - `element` field added where entity definitions are normalized.
  - NPC/Boss/creep fallback strategy documented and applied.
- Tests:
  - runtime spawn/queue/token tests ensuring `element` survives pipeline.

## Stage 4 — UI/UX Feedback
- Reuse-first approach:
  - Extend current roster/card/stage info renderers.
  - Reuse current VFX event and damage text drawing path.
- Deliverables:
  - element/class visual markers on cards + boss info.
  - advantage hit feedback (text/color).
- Tests:
  - UI unit tests or snapshot tests for tags/icons and feedback state.

## Stage 5 — Regression + Balancing Guardrails
- Deliverables:
  - regression suite pass for combat, PVE session, lineup render.
  - optional config constants for counter percentages (future tuning).
- Exit criteria:
  - no damage-path divergence,
  - no missing element/class crashes,
  - deterministic results across runs.

---

## 5) Acceptance Checklist (Definition of Done)

- [ ] Counter matrix returns correct % for all defined element/class pairs.
- [ ] Additive stacking validated with automated tests.
- [ ] Missing element/class safely yields 0% (no crash).
- [ ] `calculateFinalDamage()` is used in core combat flow, not duplicated in callsites.
- [ ] NPC/Boss data includes `element` or valid fallback.
- [ ] Character card + stage boss panel show class+element markers.
- [ ] Advantage feedback visible and accessible.
- [ ] Existing test suite remains green.

---

## 6) Recommended Task Order for Implementation PRs

1. PR-1: Counter matrix (pure + tests)
2. PR-2: Combat integration + integration tests
3. PR-3: Schema/data propagation
4. PR-4: UI markers + advantage feedback + snapshots
5. PR-5: balancing config + docs cleanup

This order minimizes blast radius, keeps each PR reviewable, and enforces “reuse existing logic first” before any new UI surface work.
