# ARCLUNE — ANICCA / VÔ THƯỜNG — CLARIFIED GAMEPLAY CANON

**Revision:** R1 — replacement raw #60 and thirteen explicit designer locks.
**Status:** GAMEPLAY_CLARIFIED / ARCHITECTURE_NORMALIZED. Metadata/external profiles remain separate; not generated execution-ready Character data.
**Source:** latest replacement of #60 in `ý tưởng nhân vật 3.md` and the accompanying ANICCA / VÔ THƯỜNG — DESIGNER LOCK. The designer lock fixes the authored Skill2/recast policy, including wording introduced as “Tao đề xuất”. Older turn clocks, formulas and penalty amounts are superseded.

## 1. Identity and boundaries

**Vô Thường (Anicca), SSR Ranger.** Description: Chúng Sinh Mệnh Tướng. Native Element/base stats remain unspecified; BASE_DEPLOYMENT_COST = TBD_BY_COST_BUDGET. Neither narrative nor rarity supplies Authority. Arrows/charging imagery create no Summon, invulnerability, forced movement or extra SSI opportunity.

Deployment establishes a new Field Presence and initializes the passive cycle ON. Existing full-Rage deployment/readiness and Mode Ultimate priority apply at an actual Natural Action; entry does not itself cast Ultimate or create a bonus Action. Explicit pending Skill2 release constrains the already granted Natural Action before the Mode's ordinary full-Rage choice.

## 2. Locked kit

### 2.1 Passive — Sinh Diệt Nhị Tướng / Two Marks of Arising and Passing

One phase State per runtime owner/current Field Presence, initially **ON** after deployment. ON provides Lifesteal22%; successive **actually completed Natural Actions** alternate ON → OFF → ON. CC-lost opportunities, non-Natural/child Actions and SSI pointer movement do not advance it. Lock the phase applicable to one performed Natural Action so its completion flip cannot retroactively change that Action's Damage-derived settlement. Leaving Field terminates/cleans the cycle; redeployment starts a fresh ON cycle, not another instance on top of the old one. Death without LEAVE_FIELD freezes this State; Revive in the same Presence retains its phase, rather than resetting ON. No clock progresses while the owner is dead.

For an ON Natural Action, after all qualifying Damage in its declared outcome is terminal:

`P = sum(committed Actual HP Damage of the declared qualifying outcome)`

`requested Heal = P × sum(all qualifying Lifesteal coefficients)`

The passive contributes0.22 once. Include direct Basic/Skill Damage, Skill1 child Basics, Ultimate child Skill1/Skill2 and explicitly declared direct/child Effects in that outcome. Exclude independent DoT, Reaction, Counter, Follow-up, Mark and unrelated Passive Damage merely sharing a root/credited source. Shield absorption, Overkill, HP Cost/Loss and Execute removal do not enter P. Action lineage does not by itself prove Effect membership.

Other sources qualify/read at the **Damage-terminal settlement checkpoint** unless that source explicitly declares an earlier Snapshot/read. Anicca's own phase remains the immutable Natural-start binding. Qualifying coefficients add on the **same committed basis**, then produce **one** Heal settlement; do not apply each as an ordering-sensitive per-arrow Heal or multiply percentages. Overheal DISCARD unless another explicit mechanic consumes it. Other sources keep their own eligibility; OFF removes this passive's22%, not foreign Lifesteal.

### 2.2 Basic — Nhất Tiễn Vô Thường / Arrow of Impermanence

One ranged arrow against one ordinary legal enemy. One hit/Effect with two typed components: **PHYSICAL100% ATK + WILL100% WIL**. Not two hits. Ordinary targeting/Hit Admission/mitigation/Shield apply; no Guaranteed Hit, Slot priority or Follow-up is implied. Select+lock target → snapshot ATK/WIL at Basic start → resolve. Locked target later invalid: **DROP_LOCAL / NO_RETARGET / NO_REROLL**.

### 2.3 Skill 1 — Tam Tiễn Lạc Mệnh / Three Arrows of Fallen Fate

Required Side **AE20** before activation. Build ordinary legal enemy pool → seeded deterministic RANDOM selection of **up to3 DISTINCT** Entities → lock selection. Fewer than3 selects all available, never repeats an enemy to manufacture three arrows. Standalone pool may include enemy Leader if ordinary legality permits; parent Ultimate explicitly excludes Leader.

Create one real **BASIC_ATTACK child Action per selected Entity**, each non-Natural, retaining Basic identity/Effect provenance, without Follow-up classification, SSI advancement or automatic Natural-class Resource generation. Each child's hit is PHYSICAL100% ATK + WILL100% WIL. After AE20 commit → seeded select/lock → capture ATK/WIL **once for all arrows** → prepare real children → one simultaneous commit. Ultimate instead supplies its own common capture and preselected locks. Every locked invalid recipient drops locally with NO_RETARGET / NO_REROLL; surviving arrows keep their membership. No per-child source resnapshot or serial child commit.

### 2.4 Skill 2 — Nhất Niệm Định Mệnh / Fate in a Single Thought

Standalone two-phase Skill: **Natural Action A** pays AE40, charges and creates field-scoped pending release; Anicca stays targetable/damageable. It consumes A without direct arrow Damage. The **next actually performed Natural Action** is occupied exclusively by the automatic release; no alternative Action selection and no second AE40 payment. It remains that ordinary SSI-granted Natural Action, not a FORCED/non-Natural replacement.

CC-lost opportunity leaves pending intact and does not release. Death or Field leave cancels pending. At release start capture current source ATK/WIL, not charge-time stats; lock enemy Leader and fire one hit: **PHYSICAL300% ATK + WILL300% WIL**. Missing/invalid Leader fails/skips locally, no replacement; the attempted release terminates pending. Do not leave pending stuck because the release has no legal Damage recipient. Consume pending once with release admission, retaining its admitted context for local failure handling under the explicit profile.

Ultimate requests a real Skill2 child with an explicit **immediate-release** branch, zero child Cost, no charge or pending State. This child is non-Natural and uses the parent Ultimate capture/Leader lock.

### 2.5 Skill 3 — Thịnh Suy Chuyển Tướng / Wax and Wane

Activation requires **Natural Action** and **CurrentHP>=15% CurrentMaxHP**. Atomic required Cost: **Side AE25 + own Rage10 + HP4% CurrentMaxHP**. Full payment of all three; no special floor/partial-payment exception. HP Cost is not Damage/HP Loss and does not reduce MaxHP. At the legal threshold this authored HP Cost leaves HP positive, absent another explicit Cost rule.

After successful payment create a new Shield contribution **10% CurrentMaxHP**, immediately. Each recast creates another ledger contribution without refreshing old ones. Shield is **FIELD_PRESENCE_SCOPED**, no Natural duration: depleted/explicitly removed/owner Field leave ends it, preserving the relevant removal cause.

Stat bonus is absent from the activation Action. At the next **actually performed Natural Action**, begin **+30% ATK/+10% WIL** for exactly two actually performed Natural Actions; decrement at their completions. CC-lost opportunities neither start it nor consume a unit. Same-source recast replaces/refreshes pending-or-active bonus with a fresh2-action duration, no percentage stack. The fresh replacement cannot benefit its own activation Action; foreign stat contributions remain governed by their own laws. When active, these are live multiplicative contributions: resolved ATK baseline excluding this same source Skill3 family ×1.30; WIL baseline excluding that family ×1.10. Other stat changes re-evaluate the baseline; never recursively multiply the already modified stat. **DEATH_CONFIRMED or LEAVE_FIELD** terminates pending/active bonus and removes this Skill3's Shield contributions. Revive restores neither remaining duration nor old Shield; leave/death cleanup is not damage break/natural expiry.

### 2.6 Ultimate — Tứ Tướng Vô Thường · Sinh Trụ Dị Diệt / Arising, Abiding, Changing, Ceasing

Root identity **ULTIMATE** requests exactly one real Skill1 child and one real Skill2 child. Each retains SKILL identity; Skill1 requests its real Basic children. All children non-Natural, no SSI/Natural-class regeneration/extra opportunities. Waive only the authored child Costs, not foreign Costs or conditions. Skill2 bypasses charge immediately; Skill1 uses explicit EXCLUDE enemy Leader override.

At root target-context establishment lock enemy Leader, build current legal non-Leader enemy pool and seeded-select up to3 distinct Entities. Capture **ATK/WIL once** for the whole Ultimate. Three selected Basic-equivalent arrows use100% each typed component; Leader arrow uses300% each. One **SIMULTANEOUS Ultimate Damage batch** spans the nested real children. No Slot/Entity/list/Event/technical iteration priority. Fewer legal non-Leaders means fewer arrows; locked recipient invalid before commit DROP_LOCAL / NO_RETARGET, no re-query/replacement of other recipients.

After common commit and mandatory lifecycle, seal P from exactly these committed arrows and perform one qualifying Lifesteal settlement. Anicca contributes22% only for a **Natural root Ultimate whose start phase was ON**; non-Natural root/children do not inherit it or advance phase. Other sources follow their explicitly qualifying scope/read law. No independently ordered per-arrow Heal; child membership comes from explicit outcome paths, not all same-root Damage. **Damage terminal → Lifesteal attempt terminal → MaxHP penalty/reconciliation → Action completion.** Heal/Overheal uses pre-penalty CurrentMaxHP. Heal-block/conversion/EffectiveHeal0 never prevents the subsequent penalty.

After successful direct settlement, create a source-owned **CurrentMaxHP×0.96** penalty contribution. Repeated Ultimates compound100% →96% →92.16%, without changing BaseStat permanently or erasing foreign MaxHP contributions. This mutation is not Damage. Reset all this Ultimate family's penalties when owner leaves Field **or dies and subsequently Revives**; redeployment/revival has no old penalties. Mutation and removal use **PRESERVE_ABSOLUTE_THEN_CLAMP**, no automatic Heal when MaxHP returns. Ordinary Field-leave commit removes these penalties immediately. Death alone retains them until a successful legal Revive: admit Revive → stage only these marked contributions' removal → derive restored projected CurrentMaxHP → Revive HP formula reads that projected CurrentMaxHP → validate materialization → atomically commit removal/MaxHP/revivedHP with ordinary Revive deltas. **Failed Revive rolls back the staged reset**, leaving penalties exactly unchanged. An explicit Snapshot-based foreign Revive formula retains its Snapshot input; this kit defines no new Revive entitlement or formula.

**After Ultimate completes**, arm suppression for the owner's **next actually performed Natural Action**. At that Action's start, capture the one-Action prohibition in its existing execution context (designer label RAGE_GAIN_SUPPRESSED is an Action property/binding, **not a Functional Tag**). Reject ACTION_GENERATED Rage grants explicitly generated by/attributed to that Action, **including late post-ACTION_COMPLETED grants**. Do not match unrelated Action grants merely because they arrive at the same time or share incidental lineage. Explicit external/non-Action System grants remain governed by their own ordinary laws.

ACTION_COMPLETED closes the source window, so it cannot mark another Action; the already captured Action binding remains until all Action-linked Rage obligations/settlements are terminal. Originating Ultimate/CC/non-Natural children cannot consume the newly armed window. Closing an old capture cannot erase a new post-completion window. DEATH_CONFIRMED/LEAVE_FIELD clears pending/active future-window State, with no restoration after Revive; it does not erase admitted old-Action evidence needed to reject its delayed grant. Costs/drains/sets are not gains; no zero Rage cap or add-then-subtract implementation.

## 3. Execution and replay boundaries

- **Passive:** one phase State and Natural-start Snapshot binding; a declared terminal Damage-outcome projection feeds `heal.damageDerived`, baseCoefficient =0.22×lockedPhase for a performed Natural root. A non-Natural execution uses explicit base0 without reading an unavailable Natural-start binding. Other opted-in sources contribute coefficient-only ADD under their own read/lifetime law. A single local settlement owner prevents duplicate provider-created Heals. Coefficient0 closes without a Heal; positive coefficient/basis0 follows ordinary zero-Heal semantics.
- **Basic:** locked one-target hit, start ATK/WIL snapshot, two components/one hit, ordinary Hit Admission.
- **Standalone Skill1:** AE20 → distinct seeded locked set → common ATK/WIL capture → real Basic request per selected Entity; exact child Basic Damage nodes participate in Skill1's named simultaneous Damage group. Empty pool means no arrows, terminal empty result; no substitute/refund is inferred.
- **Standalone Skill2:** charge branch pays40 and stores pending; explicit State-constrained Natural form selects the release branch before Mode default. Release target planning permits missing Leader as a local terminal skip, not an illegal candidate causing persistent deadlock. Release is a new ordinary root SKILL Action for the next granted Natural opportunity, not a child still blocking the completed charge; pending may retain immutable charge provenance for trace. Release admission consumes pending once; source death/leave cancels it before a later admission. Ultimate immediate branch creates no pending state.
- **Skill3:** Natural-only prerequisite, full atomic25AE/10Rage/4%MaxHP; Shield10%MaxHP immediate. Fresh stat State waits for a distinct next actually performed Natural Action, then lasts its two completions. Recast retires/refreshes pending-or-active stat family and creates another independent Shield ledger record. Source death/leave cleans only these authored contributions/state, no global Buff/Debuff/Shield purge.
- **Ultimate:** parent target/source bindings → real Skill1 + immediate Skill2 requests; nested Basic paths and Leader Damage node delegate to **one** root batch. Children consume no additional Natural opportunity. Exact terminal child Damage outcome → one Lifesteal settlement → own MaxHP contribution×0.96/reconciliation → root completion. Use existing Damage-completion/result readiness before the later non-Damage nodes; waiting for root ADEC/completion to produce this basis would create a cycle. Parent local AFTER_DIRECT_EFFECTS_COMPLETE holds ordinary Reaction settlement across this chain; mandatory lifecycle is preserved.
- **Post-Ultimate:** required finite post-completion settlement for either Natural or non-Natural root form creates a next-actual-Natural suppression State after origin Ultimate completion, before SSI handoff. At the next performed Natural start capture the exact Action prohibition. Matching positive ACTION_GENERATED Rage grants attributed to it are denied even after completion/source-window closure; unrelated Action grants at the same time are not covered. Explicit external/System-non-Action grants remain admitted under their own law. Retain admitted binding through terminal Action-linked obligations; no root-only inference. Closing an old bound window cannot erase a newly armed post-completion window. CC/non-Natural children do not start/consume it; Mode Ranger AE regeneration remains unaffected.
- **Penalty lifecycle:** distinct source-aware mutation refs each contribute×0.96; duration owner/current Presence removes them at LEAVE_FIELD. Before HP restoration, stage only these marked recipient records with PRESERVE_ABSOLUTE_THEN_CLAMP. CurrentMaxHP-based Revive reads projected restored capacity; failed materialization keeps all old contributions/HP. No Revive event restores Skill3/suppression or initializes passive ON without a new deployment Presence.

Functional mapping uses existing DAMAGE/PHYSICAL_DAMAGE/WILL_DAMAGE, HEAL, SHIELD, BUFF/STAT_MODIFIER where authored, SELF_HP_COST and MAX_HP_MUTATION semantics. Ability identity, Natural/child status, random selector, duration checkpoints and Resource admission scope are data, not new Functional Tags. Internal phase/pending/window state does not imply a new Tag or arbitrary script. Unsupported foreign mutative child preparation/other Costs require an applicable explicit profile; this kit's waiver cannot erase them.

New presence initialization does not rerun battle initialization. Same-source replacement retires old clock work; activation completion or old instance callbacks cannot decrement fresh pending State. Child Damage preparation is read-only with zero/waived child Costs; freeze participant/RNG identities before technical iteration and do not wait for child completion before its Damage commit.

## 4. Remaining items

**No genuine internal designer question remains.** All follow-up choices were answered, including failed-Revive atomicity and late Action-linked Rage rejection. Native Element/base stats/Cost Budget and unsupported Mode adapters remain **UNRESOLVED / NOT BLOCKING**. Global Ultimate Rage consumption/reset, numeric policy and external conflict profiles stay with their existing owners; do not invent them here or turn Natural Action clocks into seconds.

Future external content may introduce cleansing/Authority overrides, overlapping Natural-form restrictions, mutative child preparation or nonmatching coefficient bases. These require their own explicit law, not a new current-kit gameplay ambiguity or permission to pick a default. Source/recipient lifecycle invalidity follows the referenced ordinary profile: no retarget, arbitrary restoration or revival-by-Heal is inferred.

## 5. Normalization status

Generic architecture deltas: finite cross-child Damage preparation/common commit, additive Damage-derived Heal coefficients, Resource grant origin/scoped admission, Revive-joined MaxHP contribution removal and explicit completed-non-Natural settlement scope. Existing owners execute these bounded profiles.
