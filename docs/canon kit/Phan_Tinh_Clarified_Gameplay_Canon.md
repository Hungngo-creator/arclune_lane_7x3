# ARCLUNE — PHẦN TINH / STAR BURNER — CLARIFIED GAMEPLAY CANON

**Revision:** R2 — all three designer clarification groups applied.
**Status:** core gameplay clarified and normalized as declarative composition; later Element/Cost Budget metadata and external override policy are separately identified below.
**Source:** repository `ý tưởng nhân vật 3.md`, Character #29, lines 1195–1205, followed by the explicit designer decisions recorded here.

## 1. Identity / complete raw kit

SSR, Mage; complete Passive + Basic + one Skill + Ultimate. Three Skills are not required. Fire names/lore do not declare native Element, Burning/DoT or extra hit topology.

`BASE_DEPLOYMENT_COST = TBD_BY_COST_BUDGET`; no private deployment mechanic. Native Element is not supplied. These metadata are UNRESOLVED / NOT BLOCKING for the mechanics audit, with no invented value. Execution-ready roster data later requires ordinary metadata/budget completion.

## 2. Passive — Huyết Tế Hỏa: mandatory exchange

Every actual Phần Tinh Action whose identity is **SKILL or ULTIMATE** includes mandatory payer-owned HP Cost:

```text
requested HP Cost = normalized legal amount of 15% authoritative Current HP
read at Cost-resolution checkpoint
→ validate all required Costs / ordinary admission
→ commit active required Cost transaction atomically
→ successful full payment binds the Action-local payment result
→ qualifying direct Damage of that Action receives locked ×1.40 at Final Damage stage
```

For Skill1, required **25 Side AE + HP Cost** share ordinary required Cost transaction. Ultimate retains ordinary readiness/Rage semantics and also pays HP Cost. Auto-cast changes request/selection, not payment. No self-Damage/HP Loss Effect, Shield absorption, Reflect, Lifesteal or ordinary Damage trigger is created by payment.

No special Character HP floor or lethal override is added; ordinary CST-003 default still governs. Mathematical 15%-Current-HP intent does not override global legal numeric/floor rules. Success compares `actualPaidAmount` with the **normalized requestedAmount** committed in the typed result, not a reconstructed nominal 15%. If an applicable rule prevents full payment, required Cost fails: original Skill/Ultimate does not activate, no direct Damage, no use-count consumption, no bonus. AE/Rage commit/refund follows existing atomic Cost/admission law, with no private rollback. A legally rounded requested amount of zero can succeed under ordinary policy; a truncated underpayment of a positive required amount cannot grant the bonus.

Applies to Natural, Forced, linked, externally requested and non-Natural actual Skill/Ultimate Actions. A genuine child Skill Action pays its own exchange once unless a legal caller Cost override/waiver explicitly applies. An ordinary Effect node inside the same Action does not pay again. Basic pays no exchange. Keep Action identity distinct from behavior facets.

The ×1.40 applies to all qualifying hits/AoE recipients/typed components in **that Action's own direct Effect graph**, including converted TRUE. It does not automatically cover independent DoT, Mark, Passive Damage or child Actions sharing rootActionId. A behavior facet alone does not exclude a genuine paid Skill cast; excluded Follow-up/Counter/Reaction effects are independent graphs, not an identity rewrite of that Skill. Action lineage ≠ Effect provenance.

## 3. Damage / source snapshots / target locks

| Ability | Supplied cost / target | One hit per target |
| --- | --- | --- |
| Basic | One legal enemy, ordinary Basic admission | 100% source ATK PHYSICAL + 100% source WIL WILL. |
| Skill1 — Viêm Bạo | 25 AE + mandatory HP exchange; one legal enemy | 200% source WIL WILL. Position explosion wording adds no splash. |
| Ultimate — Tinh Hỏa Liệu Nguyên | Auto-cast request under ordinary Mode readiness/Rage; mandatory HP exchange; all legal enemies | 300% source ATK PHYSICAL + 300% source WIL WILL, conditional type below. |

Each Action snapshots only its used source stats **once after successful admission/Cost and before direct Damage**: Basic ATK/WIL, Skill1 WIL, Ultimate ATK/WIL. No per-target resnapshot or formula change if current source stats mutate during the group.

Basic selects one legal enemy and locks Entity identity. Skill1 selects/locks its explicit requested enemy at pre-cost target context, then completes successful Skill admission/Cost; preserve that same entity through later target-plan execution. Existing EXPLICIT selection, Action Intent requested-selector/context and CST-007 pre-cost target conditions compose this profile; read-only candidate probes are not random selection or payment. Caller target choice remains ordinary content/input policy, not hidden Slot/entity order.

After lock, lifecycle-invalid Basic/Skill1 recipient → skip only that Damage branch under ordinary DROP_INVALID semantics; no replacement/reselection. An already-used Natural Action is not converted into another target cycle. Paid Skill Cost is not refunded merely because the locked recipient later becomes invalid; no private refund rule.

## 4. Ultimate common snapshot / simultaneous group

At Ultimate target-context establishment, before any Ultimate Damage commits:

```text
build all currently legal enemy targets
→ lock their Entity IDs
→ one common snapshot of each locked target's Current HP / Current Max HP
→ derive target-local below30 = HP / MaxHP < 0.30
→ lock that Boolean for the whole hit
→ establish amounts from one common source ATK/WIL snapshot
→ choose both component types from that target's below30
→ resolve one simultaneous full-field enemy Damage group
```

Below30 true: PHYSICAL and WILL amounts both become TRUE **before mitigation**. False (including exactly 30%): retain PHYSICAL/WILL. Never let the first component lower HP and convert only the second. No Penetration emulation, post-mitigation relabel or second hit/Action. TRUE still uses normal Shield semantics; no Shield bypass is granted.

Per-target branch: A at 29% → TRUE+TRUE; B at 31% → PHYSICAL+WILL. No target's resolution changes another's eligibility, threshold, formula or Damage type. Same successful Action HP payment grants ×1.40 to every direct component, including TRUE.

Target set is not requeried during the group. A lifecycle-invalid locked recipient before commit is dropped/skipped locally, no replacement; valid recipients retain snapshotted threshold even if current HP changed. Use ordinary simultaneous transaction revalidation with explicit DROP_INVALID/no-requery; do not freshen threshold/source snapshot as an incidental retry. Entity/list/Slot/eventSeq iteration is trace mechanics, never gameplay priority.

## 5. Payment-bound multiplier lifetime

Bind the multiplier to this executing Ability/Action instance. Successful Cost/result and factor are immutable for its lifetime. Own-direct membership uses Effect provenance, not Attribution/root equality. Do not grant the bonus to a waived/failed payment by inventing “counts as paid”; a future explicit Cost override must define its exchange entitlement.

Apply the ×1.40 after type-specific mitigation/applicable reduction and before Shield, including TRUE components. It is not pre-mitigation raw-formula scaling or Final Damage Reduction. Do not re-filter already-locked target relations when applying this Action-local bonus.

## 8. UNRESOLVED / NOT BLOCKING

- Native Element and Cost Budget remain separate roster metadata, no inferred Fire assignment.
- External Cost waivers/overrides must declare their payment/bonus entitlement if different from this full-payment exchange. Current own kit has no such mechanic; do not invent one.
- Caller target-choice policy for a single legal enemy remains ordinary content/input policy. This kit does not give a lowest-HP/random/Slot priority mechanic.
- Other Modes must support the declared Action/Cost/target/transaction abstraction through current 07 or supply an explicit adaptation; no automatic real-time conversion.
- Global numeric precision/rounding remains canonical numeric policy; success consumes normalized requested payment, not nominal reconstruction.

None reopens the locked HP exchange, typing, strict threshold, simultaneous group, common snapshots or local invalid-target behavior.

## 9. Normalization status

**Status:** GAMEPLAY_CLARIFIED / ARCHITECTURE_NORMALIZED.
Generic architecture delta: bounded FINAL_DAMAGE_MULTIPLIER with own-direct Action scope through existing modifier/Damage owners.
