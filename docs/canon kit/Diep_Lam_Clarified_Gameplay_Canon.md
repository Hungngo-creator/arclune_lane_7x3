# ARCLUNE — MA TÔN / DIỆP LÂM / YE LIN — CLARIFIED GAMEPLAY CANON

**Revision:** R1 — designer-locked replacement and clarification, 2026-10-10.
**Source:** root `ý tưởng nhân vật 1.md`, A.3 `[UR] MA TÔN – DIỆP LÂM (Ye Lin)`, replaced by the latest designer raw; the explicit designer locks in this task supersede older prose.
**Status:** GAMEPLAY_CLARIFIED / ARCHITECTURE_NORMALIZED. Internal kit decisions are locked. E.23/F.25/G.24 supply one bounded extension to existing component transforms; all other locked graphs compose from existing architecture. `CONTENT_TBD — FEAR/BLEED EFFECT DEFINITIONS` blocks fully executable normal-Ultimate secondary content only. This status describes declarative normalization, not implemented runtime behavior.

## 1. Identity and common rules

UR; **Mage**. Role: Infinite Stacker, True Damage Dealer, Drain Tank. Raw provenance is not architecture, and old implementation/prototype behavior is not gameplay authority. Deleted raw `Tags:` are not promoted to Functional Tags. The adjacent global `GIẢI ĐÁP: HỆ THỐNG ƯU TIÊN (HIERARCHY)` remains legacy provenance outside this replacement; its Rank/Quy Tắc hierarchy does not govern this kit. Latest merged Authority Conflict Adjudication governs real conflicts.

Without an explicit conversion, ATK contribution is **PHYSICAL** and WIL contribution is **WILL**. One mixed hit has one Hit Admission and common Damage settlement, not two stack grants. Attack-producing owners default to **POSITION / SLOT** binding. No Character-wide Entity-follow or Guaranteed-Hit exception is authored. A selected Slot resolves its current legal occupant at the governed hit checkpoint; empty/invalid branches do not silently retarget.

Skills are Active Skills with required upfront AE Costs. A failed required payment activates no unpaid gameplay. Ordinary post-Cost failure law applies; no implicit refund, waiver or extra cooldown is invented. Both Ultimate variants follow global full-Rage/Ability-legal auto-cast law. Variant is pinned from authoritative form **at Ultimate admission**, with one Ultimate root Action identity; later form changes do not switch an admitted execution midway.

## 2. Ma Chủng — source family, Authority and decay

For each **exact Diệp Lâm runtime owner × target life**, retain an independent source-owned Ma Chủng stack family. No stack cap. Skill1, Skill2, Skill3 selection, normal-Ultimate explosion and MA_CHU conversion read/remove only that runtime owner's family. Two Diệp Lâm on one target have independent counts and refresh windows.

Target **DEATH_CONFIRMED** or lifecycle replacement clears the old-life family. Source death/ordinary leave does not automatically erase attached seeds: target-owned decay continues. Lifecycle cleanup is not Cleanse or Authority contest. Retention and Natural-opportunity duration remain separate dimensions.

Ma Chủng State/application clause explicitly carries **Authority Tier = PHÁP TẮC**. Authority is not a Functional Tag; neither UR Rank nor Prime Rank supplies a tier by itself. **Prime AND Thần Tính** is an explicit invalid-recipient restriction for Ma Chủng application. Reject that grant without using Authority to override the kit's own restriction; otherwise legal Damage can still land. Other actual direct conflicts use generic Authority adjudication. Ma Chủng is not globally “uncleanseable”: removal/cleanse uses its real semantics and Authority.

Each successful **+1** application increments the count and refreshes the family to the **next3 target Natural Action opportunities after that application**. The application event itself does not decrement duration. CC-lost target opportunities count; non-Natural Actions do not. After the third counted opportunity, absent a newer successful refresh, remove **all** stacks of this family. This is not minus1 per Action. A rejected application neither increments nor refreshes.

## 3. Basic — Ma Chưởng

One Action, one selected enemy Slot, one hit:

| Component | Formula |
| --- | --- |
| PHYSICAL | 100% ATK |
| WILL | 100% WIL |

After the own direct Basic hit is legally admitted/committed, request **+1 own Ma Chủng** on its resolved Basic recipient under the hit/target Contract. This is the same grant described by Passive and Basic prose, not two grants. Positive Actual HP Damage is unnecessary: Shield absorption can leave zero HP Damage while still qualifying. MISS, invalid/rejected hit or uncommitted Damage grants none. Ordinary State admission, the explicit Prime+Thần Tính restriction and mandatory lifecycle still apply to the grant. This kit does not author a foreign Damage-redirection profile or decide that profile's associated non-Damage routing; its explicit actual-Damage-recipient read in§6 governs conversion.

## 4. Skill1 — Thôn Chủng Dưỡng Thể

**30 AE**; illegal when no own removable enemy Ma Chủng exists, without spending AE.

Capture one stable battle-initialized MaxHP reference **M_base**, before this Skill family's own growth contributions. Do not recalculate or compound it from the grown CurrentMaxHP. For every **actually removed** seed:

```text
growth request = 0.05 × M_base
Heal request   = 0.05 × M_base
own Skill1 growth cap = 1.00 × M_base
```

Own growth can add at most100% of that baseline. Growth clipping never reduces Heal: at already+95%, removing2 seeds adds only the remaining5% capacity, while both seeds still request Heal5% M_base each.

Exact dependency order:

1. Snapshot the authoritative removable own-seed set/count on the enemy side.
2. Commit required AE30.
3. Atomically remove those exact snapshotted stacks; preserve removal Results.
4. Compute actual removed count from committed Results, not nominal query/count.
5. Apply MaxHP growth up to the remaining own-family cap.
6. Execute separate Heal from **all** actually removed stacks.

MaxHP mutation preserves absolute CurrentHP, with ordinary reconciliation/clamp; it does not restore HP. Separate Heal uses ordinary Heal admission/Overheal. Do not Heal twice or infer Heal from a capacity increase. An invalidated or unsuccessfully removed stack contributes neither growth nor Heal; do not requery new stacks into this frozen transaction.

Earned growth is **BATTLE_SCOPED**. Ordinary leave/deploy/death/Revive retains it; battle end resets it. It is not account-permanent progression. Other MaxHP sources neither redefine M_base nor occupy this Skill family's growth cap.

## 5. Skill2 — Ma Chủ Hiển Thân

Admission requires at least one legal enemy with **>=12 own Ma Chủng on that one recipient**, not12 summed across the field. Player/autonomy chooses one qualifying recipient. Required **25 AE** commits, then revalidate that the same selected recipient/family is still legal and qualifies at>=12.

On success, remove **all** own Ma Chủng there and enter **MA_CHU**. Stacks beyond12 do not scale the transformation. Failed post-Cost validation does not invent a replacement target, form or refund. Own form is one active profile, never stacked.

MA_CHU persists through ordinary LEAVE_FIELD, Return-to-Deck and redeploy; terminates on Diệp Lâm **DEATH_CONFIRMED**, not merely HP_ZERO; resets at battle end. Revive does not restore the ended form. After Revive he may again satisfy/pay Skill2 and transform. This form lifetime differs from battle-persistent Skill1 growth.

## 6. MA_CHU — per-hit fraction conversion

Qualifying provenance is this Diệp Lâm's **own direct Basic/Skill/Ultimate Damage**. Skill3 main and splash are direct Skill Damage and qualify for conversion. Exclude DoT, periodic Mark Damage, Counter, Reaction, unrelated Passive Damage and foreign Damage merely sharing root ancestry unless later explicitly authored. Prove actual Action Actor/source and direct Effect ownership, not Damage credit alone.

At **each hit's pre-mitigation component-resolution checkpoint**, after applicable Damage receipt redirection, read the current own family on the **actual Damage recipient**:

```text
N = current own Ma Chủng count on actual recipient
R = min(1.0, N × 0.02)
```

For each eligible non-TRUE component, convert fractionR to TRUE and retain fraction(1−R) as original type. Already-TRUE components remain TRUE and are not split twice. This conserves the original request; no duplicated Damage, post-mitigation relabeling or Penetration emulation. Each resulting type follows its ordinary mitigation and Shield semantics: ARM/RES does not mitigate TRUE; ordinary Shield still applies afterward.

Example: Physical100 + Will100, N10 → Physical80 + Will80 + True40. N50 or higher →100% eligible TRUE. N0 → original types unchanged. One hit reads one stable recipient-family value for its eligible components; sequential hits may read different values if the earlier hit granted/removed seeds before the later checkpoint. Basic conversion therefore reads pre-hitN before its own later+1 grant.

## 7. Skill3 — Nhiếp Chủng Song Chưởng

**25 AE**. At selection checkpoint, if legal enemies have own seeds, find the **maximum own stack count**, form the exact tied-maximum pool, and select by deterministic seeded **RANDOM_AMONG_TIED**. If no legal enemy has own seeds, seeded RANDOM selects among all legal enemies. No legal enemy → illegal Skill. No nearest-target, list/Slot/entity-order winner.

Bind the selected enemy's **current Slot** as locked center. Two palms resolve sequentially with no ordinary Reaction window between them; mandatory lifecycle remains required.

For **each** palm, read current occupants of center and orthogonally adjacent enemy Slots:

| Branch | Components | Ma Chủng |
| --- | --- | --- |
| Main, legal current center occupant | PHYSICAL100% ATK + WILL100% WIL | +1 own seed after landed hit settlement |
| Up/down/left/right occupied legal enemy Slots, at most4 distinct | PHYSICAL70% ATK + WILL70% WIL each | None |

Main and splash retain **SKILL Damage identity**. Equal-to-Basic formula does not reclassify main as BASIC_ATTACK. Main+all splash recipients within a palm use one explicit **simultaneous Damage group**, with per-recipient conversion reads from that group's stable pre-mitigation view. After its mandatory lifecycle and valid main grant, resolve palm2. Two valid main hits produce+2 total, subject to State admission; splash never grants seeds.

If center empties before palm2, skip its main branch; splash may still use current legal adjacent occupants around the same locked center. No retarget/Entity-follow. MA_CHU conversion on palm2 may use the seed added by palm1; source snapshot and recipient-family live reads are different bindings.

## 8. Normal Ultimate — Ma Chủng Phán Quyết

At resolution start, snapshot only enemy recipients with **>=1 own Ma Chủng**. Freeze each recipient branch's Slot/life identity required by the transaction and **N_i**, plus one common source **ATK/WIL/M_cast = CurrentMaxHP** snapshot. Do not later add entrants or replace invalid branches. Resolve all recipient Damage as one explicit **simultaneous batch**.

Per recipient:

```text
PHYSICAL = 100% ATK + 0.025 × M_cast × N_i
WILL     = 100% WIL + 0.025 × M_cast × N_i
```

The MaxHP-derived5% total splits evenly into ordinary PHYSICAL/WILL; it is not TRUE merely because it scales from MaxHP. Each recipient uses its own frozenN_i and the same source snapshot.

After the batch and mandatory lifecycle, each snapshotted branch requests **floor(N_i/2) FEAR stacks** and the same number of **BLEED stacks**, with the intended lifetime of **one next target Natural Action opportunity**. Then consume the exploded own Ma Chủng family. This is not gated on positive Actual HP Damage. If lifecycle invalidates a branch, ordinary State admission applies to Fear/Bleed; consumed old-life seeds never get recreated. Another Diệp Lâm's seeds remain outside consumption.

### 8.1 CONTENT_TBD — FEAR/BLEED EFFECT DEFINITIONS

**Fear / Sợ Hãi** and **Bleed / Chảy Máu** each lack a complete gameplay definition. Do not invent Fear behavior, Bleed Damage formula, stack caps, reapplication law, Authority or cleanse semantics. Only the requested stack counts and one-target-opportunity lifetime intent are locked. Until both typed Effect definitions are authored, the normal-Ultimate secondary graph is not fully executable. This is a content blocker, **not a generic architecture gap**; no guessed runtime behavior or functional capability is inferred from the names.

## 9. MA_CHU Ultimate — Thiên Ma Độc Tôn

Root Ultimate intends the **enemy Leader**. Before Slot binding, legal Taunt/target-redirection may change that intended recipient under generic Contracts. Bind the resulting recipient's current Slot by the project default; this is neither unconditional Entity-follow nor Guaranteed Hit.

One hit: **PHYSICAL230% ATK + WILL230% WIL**. Later legal Damage-redirection may change actual receipt under its own Contract; it does not manufacture Entity-follow. At conversion checkpoint, use the actual recipient's current own-seed count under§6. N50 produces100% eligible TRUE before mitigation. This Ultimate **does not consume seeds**.

## 10. Canon self-audit

All internal gameplay above is **GAMEPLAY LOCKED**. The only pending content is the exact Fear and Bleed Effect definitions in§8.1. Raw Passive/Basic describe one grant; Skill3 main independently authors its grant without Basic reclassification. Source-owned count, target life and target-duration clock are distinct. Skill1 battle growth and form-until-confirmed-death have distinct retention. Hit admission, seed admission, actual removal and HP Damage are distinct Results. Every frozen value, live read, Cost boundary, simultaneous group, sequential dependency and seeded tie policy has an explicit anchor. No obsolete entry SPD, nearest/two-recipient splash,300%/Boss Ultimate, Rank-derived Authority, invented Fear/Bleed or implementation authority remains.

## 11. Architecture composition and stress mapping

The independent composition baseline is merged main `fb85d1a086455deef2f7ba4ef3e500b0941f3432`: B.4/C/D/E.22/F.24/G.23/H.3/I.25. No unmerged PR, old catalog or prototype supplies capability evidence. Root AGENTS was checked for stale/overconstraining assumptions: architecture-phase scope, composition burden and standing audited PR delivery apply; no conflict requires gameplay changes or more designer questions.

| Locked semantic | Existing composition / result |
| --- | --- |
| Own infinite seed families, eligibility, real PHÁP TẮC conflicts | 04§8/9/19/74, P-020/021/022 and 06§61 source/owner/attachment/stack/parameter records. Key the source/origin seed family on target life; STACK_REF/filters use exact runtime source. STA-010 validates Prime+Thần Tính exclusion before AUT-001–007. Unbounded stack data is not a new Tag or counter subsystem. **NO GAP.** |
| Successful+1 refresh;3 later target opportunities/all-stack expiry | 04§19/20 with one family State count and duration, CLK-003 and State/Duration transactions. Atomically increment/refresh only on admitted grant; keep activation/refresh revision so an old expiry cannot remove refreshed State. Owner/attachment=target for its clock/retention; source provenance remains Diệp Lâm. Source leave is not target leave. Explicit target death/replacement cleanup does not become Cleanse. **NO GAP.** |
| Basic and Skill3 main landed-hit seed grant | DMG/HIT receipts, TRG-013 direct provenance, F.24 hit identity and P-020/021 after mandatory lifecycle. Shield-only qualifies, MISS does not; one grant per original mixed hit. Finite direct dependency for Skill3 main, without changing SKILL identity. **NO GAP.** |
| Stable M_base, actual consumption, capped growth and separate Heal | TRG-014 initializes one retained battle Snapshot; P-002 freezes removable exact State refs/counts/versions before active Cost. P-022 atomically removes eligible frozen families and returns actual removed refs; join those refs with protected count evidence for those exact removed versions, never live retired-State/nominal reconstruction. Pure MIN/MAX arithmetic clips only growth to remaining own-family cap. P-031/032 preserve absoluteHP; P-044/045 Heal0.05M_base per actual removed seed independently. Existing State parameters/MaxHP contribution ledger retains earned amount BATTLE_SCOPED across leave/death/Revive. **NO GAP.** |
| >=12 on one target; consume and form lifetime/profile replacement | Structured prerequisites/target filters/Cost/post-Cost validation, P-022 then one State/form profile. 04§6/19/20/34 and Action/definition plans pin Ultimate variant at admission. BATTLE_SCOPED retention plus explicit confirmed-death termination preserves leave and prevents Revive restoration; Skill1 progression is a separate record. **NO GAP.** |
| Per-hit non-TRUE fraction→TRUE after actual receipt routing | Original DMG-007/04§18B/06§45A performs only whole-component SET_COMPONENT_TYPE. One **proven bounded gap**, detailed below; E.23/F.25/G.24 extends that existing owner/plan. |
| Highest own-seed metric, tied seeded RNG, zero-seed fallback | STACK_REF metric over one legal Candidate Pool, TGT-007 maximum/tied-best semantics, RANDOM_AMONG_TIED; explicit zero-seeded branch uses P-010–014/Target plan RANDOM. No need for a Character selector enum/manager. TGT-008 binds selected current Slot independently from the ranking read. **NO GAP.** |
| Two Slot palms, orthogonal70% splash and no retarget | Common 04§10A spatial/12 area + Mode position geometry selects the set of four one-step cardinal neighbors; all are an unordered simultaneous set, not direction-priority winners. Opposing-side orientation permutes the same four neighbors. TGT-010/011 drops off-grid/unoccupied/illegal members; no wrap/diagonal/nearest fallback. 04§16.3 copies the numeric Basic profile at main1.00/splash.70 without Action identity or seed effects. Two explicit simultaneous groups and post-main State edges use §34/RES-002/003, AFTER_DIRECT_EFFECTS_COMPLETE; mandatory lifecycle precedes palm2/current-occupant reads. Empty center does not erase area origin. **NO GAP.** |
| Normal-Ultimate common source/per-recipient snapshot and consumption | P-002/SNP-001–004 freeze eligible branches/lives/N_i and common ATK/WIL/M_cast. Native PHYSICAL/WILL formulas include each0.025M_castN_i; one SIMULTANEOUS_BATCH/RES-008 allocation, followed by State requests and own-family P-022 consumption. Old-life invalidity closes State branches without resurrecting consumed families; ActualHP0 is not a consumption gate. **NO GAP.** |
| Leader intent/target redirect/Slot binding/Damage redirect | TGT-001 State-owned legal selectable-recipient constraints and TGT-008 attack-owner binding compose before ordinary Hit. The transform already receives the resolving recipient. Any separately legal foreign Damage-redirection profile must supply its own compatible receipt-routing Contract; this kit neither authors one nor claims universal redirection support. Conversion reads that actual recipient rather than the earlier intended Leader. No Entity-follow/Guaranteed Hit is inferred; **NO INTERNAL GAP** in these recipient/target inputs. |
| Fear and Bleed secondary entries | Existing typed Effects/States can execute authored packages; these definitions are **CONTENT_TBD**, not missing architecture. Preserve request counts/lifetime intent but emit no invented executable Fear/Bleed behavior. Other complete graphs remain normalizable. |

### 11.1 Exact gap proof — bounded component fraction conversion

**Locked semantic:** MA_CHU converts fractionR of **each resolved eligible component** at its per-hit PRE_MITIGATION actual-recipient checkpoint, conserving original demand and preserving one hit.

**Current capability:** §18B/DMG-007/§45A changes an entire component type; §9 formulas, §16 native mixed profiles, §18A amount modifiers and P-040/041/042 do not supply fractional semantic transformation of that resolved component.

**Attempts and observable failures:** whole SET_COMPONENT_TYPE produces either full ordinary or fullTRUE, failing N10's80/20. Penetration leaves ordinary type/FDR behavior. Reweighting copied source-stat formulas into native PHYSICAL/WILL/TRUE components reproduces isolated100/100 numbers but assembles different component identities/types before the authored conversion checkpoint, rather than transforming its already-resolved component amount. It can silently choose an order relative to matching runtime transforms: an original PHYSICAL component matched by both a partial-toTRUE rule and a whole-type rule must undergo explicit overlap adjudication/rejection, whereas early native splitting hides part of the original component from that match. Separate TRUE Effects/hits also change Hit/grant/commit boundaries; post-mitigation relabeling incorrectly applies ARM/RES to the converted portion. No existing typed operation combines exact resolved amount, partial semantic type and conserved original-component receipts.

**Smallest reusable extension:** add SPLIT_COMPONENT_FRACTION with TRUE destination and finite pure fraction in[0,1] to the existing transform operation at PRE_MITIGATION, only for PHYSICAL/WILL inputs. Reuse current source/Action/direct-provenance/recipient/component scopes, Formula/State reads, damageTransformPlan, Contract Resolver/Damage Runtime and existing Results/Transactions. Each rule freezes one R per hit/actual recipient; simultaneous groups use one view, sequential hits reread. Derived original/converted segments conserve amount and retain original hit/component provenance. Incompatible overlap fails closed; no arbitrary new destination/phase or priority.

**Affected layers:** 04§18B/Normalizer validation (typed operation), 05 DMG-007 (phase/conservation/conflict/receipt law), 06§45A (existing prepared component execution/replay), 08 M-195–M-197 (new boundary regression). 00 updates navigation/versions only. No new term, Functional Tag, Primitive, Contract ID, Mode rule or mutable subsystem. Whole-type transforms and earlier pilots retain their existing semantics.

Example bounded form rule, conceptual bindings rather than implementation syntax:

```yaml
damageComponentTransform:
  owner: exact_runtime_Diep_Lam
  sourceActionScope: own_CURRENT_ACTION_BASIC_or_SKILL_or_ULTIMATE
  excludedActionBehaviors: [COUNTER, REACTION]
  effectProvenanceScope: DIRECT_EFFECT_GRAPH_OF_SCOPED_ACTION
  conditions: [owner_MA_CHU_active]
  recipientScope: actual_Damage_recipient_at_PRE_MITIGATION
  componentScope:
    fromTypes: [PHYSICAL, WILL]
  transformOperation:
    type: SPLIT_COMPONENT_FRACTION
    toType: TRUE
    fraction: MIN(1, MULTIPLY(0.02, STACK_REF(own_seed_family_on_actual_recipient_life)))
  resolutionPhase: PRE_MITIGATION
```

The family's absent-count identity is explicitly0. Typed actor/source equality and direct Effect membership exclude foreign/Counter/Reaction/periodic/standalone Damage. This uses no Character-name runtime branch.

### 11.2 Capability mapping and unchanged layers

Use only the exact existing02 registry at the smallest applicable owner: Basic/main/splash/Ultimate Damage→DAMAGE/PHYSICAL_DAMAGE/WILL_DAMAGE; seed application/query/removal→MARK; Skill1 capacity mutation→MAX_HP_MUTATION, separate restoration→HEAL. The authored bounded conversion is a typed capability facet whose resolved segments use TRUE semantics; recipient runtime conversion never rewrites another Ability's authored native Tags. Form/lifetime, source-family identity, Authority, maximum-stack metric, two palms/orthogonal geometry and content names are schema facets/parameters/composition, not new Tags. Fear/Bleed's complete Functional Tag mapping waits for their definitions. Do not label the form a cleanseable BUFF simply because transformation is beneficial.

01 terminology is sufficient;02 accepts no deleted metadata;03's existing snapshots/queries/State/MaxHP/Heal/Damage operations suffice;07's global Ultimate/SSI/spatial/transition law is reused. These files and root AGENTS remain unchanged. No executable implementation/prototype is changed or used as authority.

## 12. Declarative validation fixtures and reused stress coverage

These are architecture-phase audits of this normalized composition, **not executable test results**. New08 cases cover only the fraction boundary; earlier case bodies remain unchanged. Each Character fixture below instantiates existing Contracts/cases and states the required observable result.

| Fixture / required negative space | Coverage reused or added |
| --- | --- |
| Y/Y2 seed families on one target: refresh onlyY before its third target opportunity;Y2 expires independently. Application does not tick; later CC opportunity counts; non-Natural does not. With no refresh, third removes all. Source leave/death retains attachments; target confirmed death/replacement removes old-life families. | CLK-003/STA-010/P-020–022/State duration and lifecycle; B-003/B-008/M-020/M-056/M-098; integrated current-family reads in **M-196**. No global uncleanseability is inferred. |
| Basic Shield-only landed hit grants once; MISS/invalid/rejected grants none. Prime+Thần Tính takes otherwise legal Damage but no seed or duration refresh. Rank alone creates no Authority; real PHÁP TẮC cleanse conflict uses AUT. | M-184, D-008, STA-010/011 and F-001–F-016; **M-196** actual-recipient restriction control. |
| Skill1: M_base1000, own growth950,2 actually removed seeds → growth50 to cap1000, Heal request100. A frozen seed invalidated/not removed contributes0. At cap,2 later removals still request Heal100/growth0. MaxHP addition preserves absoluteHP; separate Heal may be denied or overheal. No seeds→illegal/noAE. | SNP-001/006, P-022 result/version membership, CST active payment, STA-001/002, HEL/Overheal; D-016/M-038–039/M-051–056/M-165. Existing actual-result/cap composition, without a new growth manager. |
| Skill1 growth survives leave/death/Revive and resets at battle end. Form survives leave/Deck/redeploy, ends on confirmed death and stays ended after Revive. Two enemies with6 own seeds each fail Skill2 admission; one with12 qualifies, consumes all then enters one form. Failed post-Cost validation yields no form/requery/refund. | 04§19.5/20/34, DEP-008/DTH/REV and P-022; M-056/M-098/M-189 battle-vs-active retention; M-154 admitted-profile pinning. |
| In form, Basic at N10 converts20%, then grants+1 once. PHYSICAL100/WILL100 yields80/80/TRUE40 before mitigation. Already-TRUE stays unchanged; N>=50 gives full conversion; Shield applies and amount is conserved. Foreign/periodic/Counter/Reaction provenance is excluded. | **M-195–M-197**, D-001–003/M-145/M-184; TRG-013 and DMG-007. |
| Skill3 selects seeded RANDOM_AMONG_TIED from the exact own-count maximum, never other-source counts/nearest/iteration. Main and splash stay SKILL. Palm1 at N10 grants the11th; palm2 uses N11/R22%. Splash adds no seed. Empty center before palm2 skips main, preserves same-center orthogonal splash; no Entity-follow/retarget or ordinary Reaction between palms. | TGT-007/008/010/011, ACT-040, SNP-004/RES-002/003; C-005/M-017/M-061/M-082 plus **M-196**. |
| Normal Ult: ATK/WIL100, M_cast1000; N_i2→PHYSICAL150/WILL150, N_j4→200/200, using a common source snapshot despite later State changes. MaxHP adds no TRUE. After batch/lifecycle, request floor(N_i/2) Fear/Bleed and consume own seeds even on Shield-only Damage; never recreate an invalid old life. | SNP-001–004/DMG-001/RES-002/008/P-022; C-004/M-040/M-049/M-163/M-184. Only request count/lifetime intent is checked; no Fear/Bleed behavior/formula/cap is asserted. |
| MA_CHU Ult230/230: intended Leader→legal Taunt redirect before Slot binding→legal receipt-routing input with actual recipient N50→TRUE460 before ARM/RES; own seeds remain. Later movement never creates Entity-follow. Variant is pinned at admission with one root Ultimate; global full Rage still requires a legal actual Natural Action. | TGT-001/008/DMG-007/CST-013/07 Mode priority; M-154/M-170 plus **M-196–M-197**. No Boss/highestHP/300%/Guaranteed Hit override. |

The final six-pass audit checks semantic fidelity, independent composition, layers/source keys/lifetimes, determinism/negative space, prompt/provenance contradictions and mergeability. Exact Fear and Bleed definitions are the only intentional content blockers; no new internal gameplay decision is requested.
