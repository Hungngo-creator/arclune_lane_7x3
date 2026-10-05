# ARCLUNE — NEPHTHYS — CLARIFIED GAMEPLAY CANON

**Revision:** R1 — designer answers for Passive, Skill1/2, Skill3/Ultimate and same-completion Shield refresh supersede the R0 suggestions.
**Status:** GAMEPLAY_CLARIFIED / ARCHITECTURE_NORMALIZED.
**Source:** `Ý tưởng nhân vật 4.md`, identified entry `11) Nephthys`; later explicit designer corrections recorded below. Raw formulas remain provenance; no unrelated raw entry is replaced.

## 1. Identity, authority and boundaries

Rank, Class, native Element, numeric base stats, Basic profile and deployment Cost Budget remain **UNRESOLVED / NOT BLOCKING** for architecture normalization. Ordinary Skill/Ultimate admission/payment, numeric/cap/overflow, Hit Admission, stat composition and Mode SSI rules remain with their current generic owners. This is not generated executable Character data.

Latest explicit designer locks below supersede the R0 quota2/4 suggestion, Entity-random Skill3 suggestion, opportunity-counting Skill1 duration and any suggestion that Revive is Deck deployment. Nephthys gains no unstated Authority from her name or her interaction with the World Axiom.

## 2. Locked gameplay

### 2.1 Passive — The Dead May Linger / Người Chết Được Phép Nán Lại

The ordinary Reincarnation waiting threshold is **4 later qualifying deaths**. Each **active Nephthys Field Presence** contributes **+2**:

| Active Nephthys contributions | Effective ordinary threshold |
| --- | --- |
| 0 | 4 |
| 1 | 6 |
| 2 | 8 |

Both Sides contribute to the same applicable World Luân Hồi ledger. A contribution is available only while its exact owning Field Presence is active. It is not a permanent +2 per summon, battle-start mutation, passive cast or dead body. Repeated rule/index construction for the same ownership/lifetime cannot add it twice.

At committed Field leave, remove that contribution immediately and re-evaluate **all currently waiting entries** against the resulting threshold. Preserve their accumulated laterDeathCount exactly; do not reset, rescan historical deaths or manufacture additional deaths. Entry closes into Reincarnation if its retained progress reaches the effective threshold. Increasing the threshold affects still-waiting entries; it does not reopen already closed/reincarnated entries.

The raw2/4 description is an approximate consequence of sequential death history, **not a quota**. Same-cohort entries with the same progress receive the same threshold decision. Every qualifying tied entry transitions: no oldest top-N cutoff, RNG, Entity/Slot/list/Event winner.

If two contributions leave in one transaction/checkpoint, apply both removals and re-evaluate once against the final threshold, e.g.8→4. Do not expose a per-leave-event8→6 intermediate decision. Preserve coherent committed Field Presence, waiting progress and lifecycle state before ordinary queued Revive/Reactions can observe the result.

Qualifying Death Cohorts retain REC-002–004: advance entries that existed before the cohort by its qualifying member count; create cohort members at0; members never count one another. LEAVE_FIELD alone is not Death. A source death can also cause Field leave; its qualifying death and contribution availability must use the coherent committed lifecycle/ledger checkpoint, not incidental service/Event order.

### 2.2 Skill 1 — Shroud of the Departed / Liệm Y Của Kẻ Đã Khuất

Active Skill, required **shared/Side AE20**. Attack one legal enemy target using its ordinary single-target profile and this exact attack owner's **POSITION / LOCK_POSITIONS** default. Formula: **PHYSICAL150% ATK + WILL150% WIL**. Ordinary Slot recipient/Hit admission applies; binding does not imply Guaranteed Hit or Entity tracking.

After the Natural Action using Skill1 has completed its direct Effects and mandatory lifecycle, settle the self-Shield request before that root's ACTION_COMPLETED clock processing:

`requestedShield = 0.25 × this Skill1 root's own-direct committed ActualHPDamage`

Consume its immutable committed result projection. Exclude absorbed Shield, Overkill, unrelated Damage and child/Counter/Follow-up/Reaction/DoT/Mark/Passive receipts merely sharing root ancestry or Attribution. No nominal150% reconstruction.

This Skill1 source family comprises the exact runtime source owner and stable origin Skill/Shield-Effect definitions on Nephthys. Its accumulated Shield uses the existing **commit-time source-family cap = CurrentMaxHP**, **CLIP_NEW_ADDITION** under SHP-006. Other sources do not count toward this family cap or refresh. A cap change alone does not silently trim existing contributions; the existing cap limits the new addition.

All Skill1 contributions share **one family duration clock**, not one independent expiry per cast:

- actual committed addition >0: add the contribution and reset the whole family clock to **2 future actually-performed Natural Actions**;
- a partial cap-clipped positive addition still resets;
- actualAdded=0, including a fully capped request, does not refresh/create/mutate duration work;
- the Action whose completion creates/refreshes this Shield is outside the freshly reset future-action clock;
- CC-lost opportunities and non-Natural Actions do not decrement.

At each actually-performed Natural Action of Nephthys, process the shared family clock at **ACTION_COMPLETED**. For a Skill1 grant on that completion, the latest designer lock is:

`Natural Action direct Effects complete → Skill1 Shield addition commits → actualAdded>0 adds/stacks and refreshes the whole family to2 → completion clock processes`

Successful refresh wins expiry at the same checkpoint: even when the old clock was at its last unit, **old Shield contributions remain** and the resulting clock is **2 future Natural Actions**. The creating/refreshing Action consumes no unit of the fresh clock. If actualAdded=0, no refresh occurs; that completion consumes the old clock normally, and a clock reaching0 expires the existing Skill1 family. Never expire old contributions first to manufacture cap headroom for a new grant.

The grant/result decision is finite root-linked blocking work under **ACT-032**, before this root emits ACTION_COMPLETED. Completion clock work must finish under the existing **ACT-033** handoff dependency before the next Natural Action. Do not import CLK-003's CC-opportunity default into this explicit actual-action exception, or wait for ACTION_COMPLETED inside a blocker of that same completion.

Preserve Standard Shield proportional source depletion, independent source provenance and cause-aware removal. Expiry/removal is not Damage absorption. The generic shared clock follows its exact family/State ownership and actual retained contributions; no new priority layer or Character manager. Transition/Revive retention is resolved by the applicable declared lifecycle/restore profile, not an invented source-leave Cleanse.

### 2.3 Skill 2 — When the Shroud Tears / Khi Liệm Y Rách Vỡ

Automatic paid **settlement, not a new Action**. For each **enemy actually-performed root Natural Action**:

1. At hostile Natural Action start, snapshot Nephthys **CurrentMaxHP** once.
2. Resolve all **direct Damage owned by that root Natural Action**, then mandatory lifecycle.
3. Aggregate immutable **actual shieldAbsorbed received by Nephthys across all her Shield sources/layers** from that exact own-direct result set.
4. Evaluate once: `absorbed > 0.35 × startMaxHP`. Exactly35% fails.
5. If qualified, revalidate Nephthys alive/valid; if shared AE>=15, pay **AE15 exactly once**.
6. After payment, snapshot current Nephthys **ATK/WIL once**, resolve one simultaneous Heal batch to the deduplicated recipient union **{SELF, allied Leader}**.

Each valid recipient gets requested **70% ATK + 70% WIL** from the same snapshot. If Nephthys is the Leader, the union contains one Entity and emits one Heal. Invalid/missing Leader omits only that recipient, without retargeting or failing self-Heal. Invalid Nephthys skips the settlement.

Exclude all child/Counter/Follow-up/Reaction/DoT/Mark/unrelated Passive Damage even if ancestry/credit matches. Exclude nominal Damage, arbitrary net Shield differences, expiry/cleanup/manual removal and overkill. Historical absorbed amounts do not change when Shield contributions later expire.

Insufficient AE: skip once, debit nothing, emit no Heal and create **no delayed retry token**. Completion/event redelivery cannot pay or Heal again. This mechanism does not grant SSI/class regeneration or require another Natural Action. “Lập tức” is locked to this **Natural-Action result checkpoint**, not hit-by-hit crossing and not an actor-private TURN_BOUNDARY. Use a finite local direct-result/lifecycle settlement before enclosing root completion, without global Reaction priority.

Heal uses ordinary HEL-* admission/modification/Overheal semantics. Do not add an Overheal-to-Shield conversion or anti-Heal exception from this kit.

### 2.4 Skill 3 — Three Names in Mourning / Tam Danh Ai Điếu

Active Skill, required **shared/Side AE25**.

`current occupied legal enemy Slot pool → seeded RANDOM up to3 DISTINCT Slots → lock coordinates`

If fewer than3 occupied legal Slots exist, lock all available Slots. Selection is of Slots, not3 cached Entity identities. Preserve the exact attack owner's POSITION / LOCK_POSITIONS binding.

At the declared Damage-recipient checkpoint, read each locked Slot's **current legal occupant**:

- original occupant moved away and Slot empty: miss locally;
- another legal Entity occupies the Slot: that new occupant receives the hit;
- no reroll, replacement Slot or chase of the old Entity.

Use **one common ATK/WIL snapshot** for all Skill3 hits. Per occupied locked Slot: **PHYSICAL125% ATK + WILL125% WIL**. Freeze resolved recipients/calculation state at that checkpoint; resolve all hits **SIMULTANEOUS**, then mandatory lifecycle. Do not re-query between sibling calculations. Ordinary Hit Admission remains separate.

### 2.5 Ultimate — Not Yet Beyond the Gate / Chưa Được Qua Cánh Cửa

Ordinary **Revive**, not an attack and not DEPLOY_FROM_DECK. Identity target is one specific allied waiting Chân Ngã.

At legality/resolution:

`allied waiting entries → ordinary Revive-eligible filter → seeded RANDOM exactly1 eligible ally → lock that identity`

**Leader is included**. If the eligible pool is empty, Ultimate is **not legally activatable**; do not cast and manufacture pending retry.

Destination:

1. Prefer that target's death Slot if currently **TRULY_EMPTY and legal**.
2. Otherwise seeded RANDOM choose another **TRULY_EMPTY legal allied Slot**.
3. With no legal empty allied Slot, Ultimate is **not legally activatable**.

TRULY_EMPTY excludes active occupant, reservation, pending Revive, temporary-absence owner and death-waiting/lifecycle claim. Death-Slot preference never overrides those claims. Check actual current occupancy/claims through POS-009, not a visual empty cell. Read-only legality probes neither mutate state nor consume a gameplay target/destination draw; actual resolution binds its seeded choices once under existing Target/RNG/transaction law.

After identity lock, revive-invalid target (e.g. entered Reincarnation): **local Revive failure / NO RETARGET / NO WAIT**. No second allied target is randomly chosen. Materialization revalidates its protected identity, restore plan and selected destination; a failed/stale transaction commits no partial restoration or waiting-record closure. No hidden reselection/retry.

Successful restore, in the same lifecycle/materialization transaction:

- preserve **same trueSelfId** and ordinary Revive lifeSerial;
- restore normal Character stat baseline as a fresh revived life;
- remove old temporary Buff/Debuff/Mark/Shield/field-life temporary states;
- target-owned explicit BATTLE_SCOPED/PERSIST_ACROSS_REVIVE/reset-on-Revive stat or progression rules follow **that target kit's own declared retention/reset law**; Nephthys does not override it or mint these words as new global lifecycle enums;
- stabilize stat restoration and **restored CurrentMaxHP**, then assign **CurrentHP=35% restored CurrentMaxHP** and **Current Rage=5**;
- commit materialization, resource/stat/State restoration and waiting-record closure atomically.

Revive HP assignment is lifecycle initialization, **not Heal/Overheal**. Restoring Rage is initialization under this Revive profile, not an extra Damage-derived gain. Do not emit DEPLOY_FROM_DECK or trigger Deck-only effects, payment or full-Rage deployment initialization. Special target-owned restoration laws are composed explicitly; ordinary lifeSerial preservation is not a reason to keep temporary field-life states.

## 3. Shared-clock lifetime and designer precedence

The final designer reply locks grant/positive refresh before completion-clock expiry. It supersedes the earlier shorthand “after the Natural Action completes” wherever that shorthand would delay the grant until after expiry. No gameplay question remains pending for the mechanics in §2.

The Skill1 family has one source-owned clock keyed by runtime owner, stable origin Skill/Shield-Effect definitions and the applicable retained family lifetime. Contributions keep their immutable addition/result provenance. Retain the remaining actual-completion count and positive-refresh originating Action reference/version; the same completion cannot decrement its own fresh clock.

Duplicate deliveries cannot add, refresh or tick twice. Preserve the applicable lifecycle/retention law and exact family identity; terminal/expired/replaced clock work cannot mutate another family or new life. The last-unit old Shield remains present during cap evaluation, and denied/zero addition closes the Shield decision without refresh. Complete this root's Shield decision before its completion clock, and complete clock work before the next Natural Action.

Ultimate HP/Rage/stat initialization does not become an independent Heal, Reincarnation, RESOURCE_MODIFIER or STAT_MODIFIER Effect merely by using restoration fields.

## 4. Unresolved / not blocking

Rank, Class, native Element, numeric base stats, Basic selector/profile and deployment Cost Budget remain unresolved metadata/profile inputs; they do not weaken §2's locks or establish fully numeric executable Character data.

Future incompatible threshold rules, unsupported Mode adapters or external retention conflicts require their own explicit compatible law. These remain **UNRESOLVED / NOT BLOCKING** unless the immediate task depends on them; Nephthys supplies no broad global default for them.

## 5. Normalization status

Generic architecture delta: a bounded static live waiting-threshold contribution under the existing Reincarnation law, Field Presence and World-ledger owners. Shield clocks, result settlement, Slot targeting and Revive restoration use existing composition.
