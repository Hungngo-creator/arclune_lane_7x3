# ARCLUNE — ANATTA / VÔ LƯỢNG — CLARIFIED GAMEPLAY CANON

**Revision:** R1 — replacement of raw #59, nine designer locks and explicit reflected-Damage mitigation/multi-source batch/root-Reaction answers.
**Status:** GAMEPLAY_CLARIFIED / ARCHITECTURE_NORMALIZED. Architecture Phase documentation, not generated executable Character data.
**Source:** newest ANATTA / VÔ LƯỢNG — DESIGNER LOCK and current replacement of #59 in `ý tưởng nhân vật 3.md`. Old Reflect1turn / terminal Heal30% / Pháp Tắc and old Costs/Ultimate are superseded.

## 1. Identity and boundaries

**Vô Lượng (Anatta), SSR Tanker.** Description: **Chúng Sinh Khổ Tướng**. Native Element/base stats remain unspecified; BASE_DEPLOYMENT_COST = TBD_BY_COST_BUDGET. These are **UNRESOLVED / NOT BLOCKING**, not fabricated values. No special Authority is inherited from the superseded raw kit.

Basic/Skill2 melee imagery and Skill3 stomp/wave are presentation. They create no Position mutation, Shield, Damage Reduction or extra Action. Ordinary targeting/Hit Admission still apply. Global Ultimate readiness/payment, Tanker class Resource regeneration and numeric/cap/overflow policies remain with their existing Contract/Mode owners.

## 2. Locked kit

### 2.1 Basic — Vô Ngã Nhất Quyền

Select one legal enemy → lock Entity → snapshot source ATK/WIL → resolve **one hit** containing **PHYSICAL100% ATK + WILL100% WIL**. These are two typed components, not two hits/Actions. If the locked recipient becomes invalid: **DROP_LOCAL / NO_RETARGET**.

### 2.2 Passive — Khổ Tướng Hồi Chấn

One owner-scoped controller with **READY / ACTIVE_REFLECT / COOLDOWN**. A new valid life/Field Presence starts READY. An ACTIVE_REFLECT Buff instance and its result accumulator belong to that controller's current activation, not to a battle-persistent stack.

At each **enemy actually performed Natural Action start**, capture Anatta CurrentMaxHP once. At that Action's declared Damage-outcome terminal checkpoint, after mandatory lifecycle, read the immutable package:

`D = sum(qualifying committed Actual HP Damage received by Anatta)`

`ratio = D / action-start Anatta CurrentMaxHP`

Include the observed Natural Action's direct multihit/explicitly declared child Damage outcome. Exclude independent DoT, Mark, Reaction, Counter, reflected and unrelated Passive Damage merely sharing root/credit. Shield absorption, Overkill, HP Cost/Loss and non-Damage HP removal never enter D. A child source's Damage Attribution is not its immediate Damage Source.

**Activation:** only READY and **ratio>0.25** qualifies; exactly25% does not. The incoming Natural Action **finishes first**, then grant ACTIVE_REFLECT if Anatta remains alive/active. Therefore none of that activating Action is reflected retroactively. ACTIVE_REFLECT threshold events do not stack/refresh/create another instance; COOLDOWN cannot activate.

**While active:** after each qualifying enemy Natural Damage outcome and mandatory lifecycle, group the same received-ActualHP package **by immediate Damage Source**. For each source S:

`requested reflected Damage(S) = 0.35 × committed received ActualHPDamage from S`

Create a separate **REFLECTED_DAMAGE** Effect/result against S. All source-local packets from this one incoming Natural outcome are prepared against one shared phase state and committed as **one SIMULTANEOUS batch**, then mandatory lifecycle. An invalid source drops only its packet. Technical source/list/Slot/Event iteration cannot change another source's mitigation/Shield/HP result; no per-source intermediate lifecycle or ordinary Reaction. Multiple Effects/hits of S aggregate once; different immediate sources remain separate even with identical root/Damage Attribution. An invalid/non-damageable source skips locally, **NO_RETARGET**; do not redirect to its owner/credited Entity. Reflection is a triggered settlement, not another Natural Action or normal attack.

The designer's mitigation answer locks this explicitly authored profile:

`35% committed received basis → bypass ARM/RES → qualifying FINAL_DAMAGE_REDUCTION → ordinary Shield → HP-bound Actual HP Damage / Overkill`

It is **not PHYSICAL/WILL/TRUE**, not Penetration, and not Shield Piercing. Component-specific modifiers do not acquire an unstated reflected-packet scope. Ordinary reflected recursion exclusions apply: no Reflect of Reflect, automatic Lifesteal or automatic Counter. A future explicit exception needs its own governing law.

**Accumulator:** sum only committed Actual HP Damage actually dealt by this activation's reflected settlements. Requested reflection, absorbed Shield, Overkill and zero-Actual results add nothing. Keep exact activation/Effect/result provenance, not every Damage attributed to Anatta. A reflected receipt committed before removal remains evidence even if its observer/counter update is delivered later; terminal settlement must finish the finite committed-result bookkeeping before reading its basis, rather than lose that credit by deleting the Buff first.

**Active duration:** Anatta's next **2 actually completed Natural Actions**, decrement at own ACTION_COMPLETED. CC-lost opportunities/non-Natural Actions do not count. After the second completion, remove ACTIVE_REFLECT and settle one terminal Heal:

`requested Heal = 0.20 × activation's accumulated reflected Actual HP Damage`

Overheal **DISCARD**; ordinary Heal admission/modifiers/anti-Heal/conversion apply. Explicit early dispel/removal while alive/present settles the committed accumulator so far, then enters COOLDOWN. Removal due to **DEATH_CONFIRMED / LEAVE_FIELD / lifecycle-presence cleanup** grants **no terminal Heal** and clears the accumulator. Preserve the actual cause; cleanup is not natural expiry/dispel/Shield break.

**Cooldown:** starts only after terminal Heal attempt is terminal, including blocked/converted/EffectiveHeal0. If that attempt causes death/leave, lifecycle cleanup takes precedence; do not recreate a cooldown on a dead/newly revived controller from the retired settlement. It lasts **2 future actually completed Natural Actions** of Anatta. The completion that just ended ACTIVE_REFLECT cannot also decrement a newly created COOLDOWN. CC/non-Natural do not count; second cooldown completion returns READY. Death/leave clears active/accumulator/cooldown; Revive/new Presence initializes READY, never restores leftover duration/credit. Retired activation work cannot mutate a newer controller instance even when ordinary Revive preserves lifeSerial.

### 2.3 Skill 1 — Kim Chung Nạp Khổ

Automatic **triggered settlement, not an Action**. Read the same enemy Natural Action's immutable received-Damage package and action-start MaxHP snapshot as Passive. Strict **ratio>0.18**; exactly18% does not activate.

After incoming Damage outcome terminal → mandatory lifecycle → if Anatta remains lifecycle-valid, validate/pay **own Rage20**. Rage<20: no activation, debit or AE. Successful payment:

`excess percentage points = 100 × ratio − 18`

`requested Side/shared AE gain = 3 × excess percentage points`

25% Damage gives7×3=**21AE**;18.5% gives requested **1.5AE** before ordinary numeric normalization. Do not round excess to whole percentage points first or cap by activation count. Ordinary AE pool/cap/overflow and grant rules apply. No Natural Action/SSI opportunity/class regen is created to pay or grant resources. Golden bell is VFX only.

S1 and READY-Passive independently read one package; S1's Cost/AE does not gate the Passive, and Reflect grant does not gate S1. Their explicit Damage-terminal/completion checkpoints and local dependencies create no global list/Event/Slot priority. One independently invalid branch does not erase the other's immutable evidence.

### 2.4 Skill 2 — Song Trọng Phá Chướng

One active Skill: select+lock one legal enemy; required atomic **Side AE20 + own Rage5**. If either fails, neither is paid and Skill does not activate. After successful Cost, capture source ATK/WIL once before direct Damage.

One hit: **PHYSICAL200% ATK + WILL200% WIL**. “Two Basic worth” supplies coefficients only: **not two Basic Actions and not BASIC_ATTACK identity**. Invalid after lock: **DROP_LOCAL / NO_RETARGET**. Successful committed Costs are not refunded merely because the target later becomes invalid.

### 2.5 Skill 3 — Tam Giới Địa Chấn

Active Skill, required **Side AE30**. At target-context establishment snapshot current source column/file in side-relative Mode geometry:

| Anatta's source Slot | Corresponding enemy Slot line |
| --- | --- |
| 1 / 4 / 7 | 1 / 4 / 7 |
| 2 / 5 / 8 | 2 / 5 / 8 |
| 3 / 6 / 9 | 3 / 6 / 9 |

Query current occupants of those enemy Positions → lock Entities; empty Slots provide no recipient. This is declared geometric membership, **not target priority**. Movement after capture does not re-query/replace recipients. Area legality remains separate from direct Target Exclusion; no new hidden selector is implied. Invalid locked recipient drops locally, no retarget.

Use one common source ATK/WIL snapshot for the group after successful active Cost and before direct Damage. Each recipient gets **one PHYSICAL100% ATK + WILL100% WIL hit**, Basic-equivalent coefficient but **SKILL identity**. All Damage recipients resolve **SIMULTANEOUS**.

The same locked legal recipients also receive **Rage−10**, clamped at ordinary0 floor. Damage and drain belong to **one direct target group**:

`locked recipient set → simultaneous Damage resolution → Rage drain to the same recipients → mandatory lifecycle`

Lower both to the **existing outer simultaneous transaction**: P-042 submits the Damage-batch deltas/results and HP_ZERO candidates; P-033 submits the fixed target-Rage deltas; commit the complete group, then process lifecycle. Do not finish an independent Damage-only group and let Death/Revive run before its drain. No intermediate ordinary Reaction or target replacement; a lethal recipient's Damage does not erase its admitted same-group Rage delta. Shield/no ActualHP Damage does not suppress a locked legal recipient's drain. Ordinary Effect admission remains explicit; drain is an Effect, not Cost or a second hit.

### 2.6 Ultimate — Vô Lượng Kim Cương · Chấn Khổ Tam Giới

Root **ULTIMATE**, calls **exactly one real Skill3 child Action**, retaining SKILL identity/own provenance, non-Natural and no SSI advancement. Explicit child **AE override0**, no additional child Rage Cost; root Ultimate readiness/Rage consumption is unchanged.

That exact request selects the enhanced Skill3 Damage Profile: **one PHYSICAL200% ATK + WILL200% WIL hit per target**. Same column lock, simultaneous group and same Rage−10 remain. Do not commit normal100/100% and then add another hit, duplicate Skill3's graph inline or broaden the coefficient override to unrelated casts.

After child direct settlement/lifecycle is terminal, grant **own Rage+10**, subject to ordinary explicit Rage-gain restrictions, and attach live **ARM×1.20 / RES×1.20**. Root `resolution.reactionBoundary = AFTER_DIRECT_EFFECTS_COMPLETE`: hold ordinary Reactions from this child/direct plan until parent has committed Rage+10 and the ARM/RES buff, then root ADEC opens its local hold. Mandatory lifecycle still runs after the complete child Damage/drain group; this is not a global Reaction priority or child-event suppression. Exclude this source-owner/Ultimate/stat-effect family's own contribution from each current baseline; no recursion/frozen flat bonus. Different contributions retain their existing composition law.

Buff active immediately after Ultimate, persists through Anatta's **next1 actually completed Natural Action**, then expires at that ACTION_COMPLETED. Origin Ultimate, CC-lost opportunities and non-Natural/child Actions do not consume it. Same-source recast replaces/refreshes to fresh1 without stacking percentages. Finite post-completion origin exclusion/recast instance guards prevent the origin Action's later completion or stale clock work decrementing the fresh duration. Ordinary lifecycle retention applies; there is no battle-persistent retention exception.

## 3. Settlement, lifetime and replay boundaries

- **Incoming package:** bind the immutable Snapshot/results to Combat Instance + observed enemy Natural Action + receiving Anatta + controller/activation identity. Capture receiving MaxHP at ACTION_STARTED with explicit enemy/Natural filters, not at the last hit/trigger. Filter exact declared Damage-outcome membership and recipient, then sum ActualHP; source grouping uses immediate Damage Source, never Damage Attribution.
- **S1:** the declared Natural Damage-outcome must be terminal before required Rage debit and Side AE gain. A finite local dependency can close this authored settlement before incoming root completion; failed Cost closes only this branch. Resource work requests no new Action.
- **Reflect activation:** grant after the activating ACTION_COMPLETED and before the next Natural handoff. Do not block the completion this settlement observes. Root/children keep their own identities; no per-child duplicate activation.
- **Active Reflect:** eligibility belongs to the exact State instance at package observation. Reflected packets target the locked immediate Source refs in one SIMULTANEOUS batch per incoming outcome, then mandatory lifecycle. Registration alone creates no Action/Effect. Fold same-source receipts once; retain exact reflected activation membership through terminal readers/replay. Reflected lineage cannot requalify the original Natural outcome.
- **Active expiry / early removal:** cause-aware removal and retained result/counter bindings drive one local Heal20% terminal settlement, then cooldown. Guard terminal work by retired activation identity and cause; lifecycle removal wins over a stale ordinary-expiry callback. Finish already committed result accounting before Heal, without waiting for another Action. Natural-expiry decrement/removal/Heal/cooldown must finish before next handoff; early removal inside an Action uses finite dependencies. Actionless external removal uses its explicit System-step settlement boundary, never a fake Action or a wait for a future Natural Action.
- **Clocks / reset:** count actually completed owner-Natural Actions, not global TURN_BOUNDARY or opportunity-default clocks. Controller/Active/Cooldown are current-life/current-Presence State; exact instance guards distinguish Revive/redeploy from old work without inventing a lifeSerial increment. Cleanup retires only authored work; it is not an Alcestis-wide Buff/Mark/Shield purge.
- **Skill3:** common Snapshot and one simultaneous direct group contain Damage and Resource drain. The fixed drain needs no intermediate live read or cross-target priority. Mandatory lifecycle follows this complete group, preserving ordinary death cohorts/prevention and admission.
- **Ultimate:** one real child with the declared waived Cost and explicit enhanced profile for that request. After child terminal, root Resource/State effects remain under its AFTER_DIRECT_EFFECTS_COMPLETE hold. The next-actual-Natural stat clock reads the live baseline excluding its own family. Observable Resource gain origin is ACTION_GENERATED by this Ultimate, not an exemption from matching prevention.

REFLECTED_DAMAGE remains distinct from ordinary PHYSICAL/WILL/TRUE components; it is not a newly registered Functional Tag. No old Authority is attached. Invalid source refs skip locally without retargeting. Freeze semantic source-group Effect/RNG identities before technical enumeration; retained immediate Source, packet kind and committed basis cannot drift when receipts or State are removed.

## 4. Remaining items

**No genuine internal designer question remains.** Reflected mitigation and multi-source batch policy were answered: bypass ARM/RES, retain Final DR then Shield; all source-local reflected packets from one incoming outcome commit SIMULTANEOUS. The designer also locked ordinary Reactions after the root's complete direct plan, including post-child Rage/stat effects. Native Element/base stats/Cost Budget and Modes without the same actual-Natural/Slot abstractions remain **UNRESOLVED / NOT BLOCKING / REQUIRED_EXPLICIT_BY_MODE_PROFILE**. Do not convert these clocks into seconds or invent missing Mode geometry.

Future external content may add Authority/admission conflicts, special reflected mitigation/modifier phases, retention overrides or observable ordering against unrelated work. Those boundaries require their own explicit law; they do not justify a hidden priority or a current kit rewrite.

## 5. Normalization status

Generic architecture delta: an opt-in reflected scalar packet/reduction scope and retained immediate Damage Source receipts through existing Damage/modifier/result owners. Damage and Rage drain remain one existing simultaneous direct group.
