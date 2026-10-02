# ARCLUNE — TRỤ ĐẠO / CHIẾN CỔ — CLARIFIED GAMEPLAY CANON

**Revision:** R1 — raw-source reconstruction and composition audit; designer clarification in progress.
**Status:** CLARIFICATION_IN_PROGRESS. The source-defined mechanics below are recorded; §4's blocking gameplay decisions are not normalized into executable profiles.
**Source:** current repository `ý tưởng nhân vật 3.md`, Character #32, lines 1223–1231. No answer supplied for another Character is inherited as Chiến Cổ gameplay.
**Architecture base inspected:** merged `main` at `97b0f77`, E.3/F.5/G.4/H.1/I.3. This is a current-source audit, not a new Tag/Primitive/Kernel proposal.

## 1. Selection and identity

- **Trụ Đạo — Chiến Cổ (War Drummer)**, SSR, Support.
- Complete named kit: Passive, Basic, one Skill and Ultimate. One Skill satisfies the selection requirement; do not invent two more.
- Chosen for pressure on conditional team stat contributions, HP Cost → ally Rage restoration and multi-recipient source-family Shield caps.
- Native Element is not supplied. Do not infer an Element from names, imagery or Damage formula.
- `BASE_DEPLOYMENT_COST = TBD_BY_COST_BUDGET`; no raw mechanic changes deployment cost. Element/budget metadata is UNRESOLVED / NOT BLOCKING for this architecture audit, and must be completed before execution-ready roster data requires it.

## 2. Source-defined gameplay

### 2.1 Passive — Tiếng Trống Trận

Raw: all allies **on Field** receive **+15% ATK and +15% SPD**, described as an Aura Buff, as long as Chiến Cổ is alive.

Recipient field presence is explicit. The source's required presence is not: “còn sống” could mean alive on Field or alive even in Deck/off-field. Do not silently equate alive with field-present. “Vĩnh viễn … chỉ cần … còn sống” supplies a conditional benefit, not an unconditional battle-start permanent baseline increase. The exact condition, ally inclusion, multiple-source combination and stat percentage layer await §4.

Do not lower this into repeated permanent baseline +15% mutations on every Event or rebuild. Raw supplies Buff/stat-modification semantics; it does not supply a new `AURA` Functional Tag, dispel immunity or Character-specific registration service.

### 2.2 Basic

Single enemy receives **100% (ATK + WIL)**. The nominal amount is `1.00 × source ATK + 1.00 × source WIL`.

Typed components, one-hit interpretation, formula snapshot and explicit target/invalidity profile await §4. Polyhymnia's and Phần Tinh's PHYSICAL/WILL clarification does not independently settle this Character's raw formula.

### 2.3 Skill 1 — Huyết Chiến

- **0 Aether**, paying HP equal to **20% source Max HP**.
- One ally receives **full Rage immediately**. “Hồi 100% nộ / Đầy nộ ngay lập tức” means filling its current legal Rage pool, not adding a new stat Buff, inventing a damage bonus, or granting an extra Action.
- Raw explicitly says “Tốn HP / đánh đổi HP”; the current composition candidate is mandatory HP Cost in this Skill's ordinary Cost transaction, not a Damage/self-Damage/HP Loss Effect. The shorthand raw “Tự tổn thương” tag does not override that operation identity.
- Use current CST-001/003/007/009 policy for required payment, numeric normalization, ordinary floor and failure. No private lethal-cost permission, partial-payment success, rollback, target replacement or free-use exception is invented. A designer-defined exception would need explicit clarification.
- Rage belongs to the ally recipient, not Chiến Cổ or the Side AE pool. Full Rage is readiness, not an immediate Ultimate interrupt: CST-013 and the existing Mode/Scheduler own subsequent actual Ultimate selection/admission and costs.

Exact ally choice/inclusion, Current Max HP read and target/snapshot checkpoints await §4. Source wording “chủ lực” supplies no hidden highest-ATK selector or deterministic entity/Slot rank.

### 2.4 Ultimate — Sát Chiêu: Cương Khí Hộ Thể

- Auto-cast; **no Damage**.
- Team Shield requested amount: `2.50 × Chiến Cổ WIL + 1.00 × Chiến Cổ ATK` per legal recipient.
- Shield stacking is allowed. Raw cap: **300% recipient Max HP**, scoped to Shield from this Character's Ultimate; unrelated Shield sources are governed separately.
- Auto-cast is a request/selection behavior, not a private readiness override, free cast, extra Natural Action or new scheduler.
- Do not infer aggregation across casts, runtime-owner scope versus definition scope, CREATE versus ADD_VALUE/refresh, duration, source-leave cleanup, MaxHP-change behavior or simultaneous/sequential recipient resolution. Those are the gameplay alternatives in §4.

## 3. Canon self-audit before normalization

The raw has a name, Passive, Skill and Ultimate and is complete for selection. The numerical formulas are retained exactly: 15% ATK/SPD, 20% MaxHP payment, full Rage, 250% WIL + 100% ATK Shield, 300% recipient MaxHP cap. There is no raw extra Skill, offensive Ultimate, Heal, Overheal conversion, Damage bonus or special Deployment Cost.

Owner, recipient, field presence and alive state are kept distinct. Cost payment and downstream Rage restoration cannot be collapsed into self-Damage. Cap/lifetime/batch ambiguities change observable gameplay, so they are not resolved by copying a prior Pilot or by choosing the simplest implementation.

## 4. Blocking designer clarification

Aura, Shield and targeting/snapshot clarification groups were submitted to the designer. The table expands the exact bindings those answers must establish. Record answers here before completing the affected normalization; elapsed time is not an answer. An unaddressed binding remains explicit rather than silently becoming a default.

| Decision | Gameplay alternatives / affected branch |
| --- | --- |
| Aura source validity | Alive anywhere versus alive and Field-present; controls activation, cleanup and redeployment. |
| Ally inclusion and selection | Self/Leader inclusion; explicit Skill ally input versus another authored selector; complete Ultimate recipient pool. No incidental Slot/list/entity winner. |
| Multiple aura sources / stat operation | Two valid runtime Chiến Cổ owners: combine or exclude; additive percentage contributions versus another explicitly declared stat operation/layer. Do not infer stacking mathematics. |
| Ultimate Shield cap family | Aggregate active remaining same-source Ultimate Shield versus cap per new contribution; runtime-owner versus cross-owner definition scope. |
| Shield recast and lifetime | CREATE independent contribution versus ADD_VALUE/merge; duration/refresh, depletion/removal and source leaves Field/dies. |
| Recipient MaxHP cap timing | Current MaxHP at addition versus another checkpoint; future additions only versus retroactive old-Shield adjustment. |
| Basic Damage / checkpoints | Component types and same-hit topology; target lock, source snapshot and post-lock invalidity. |
| Ultimate batch / snapshots | Simultaneous locked recipients versus declared sequential order; shared source snapshot versus another explicit read policy. No global AoE default or hidden technical order. |

These decisions block execution-ready normalization of their branches. They do **not** block independent Polyhymnia R4 work or the current architecture inventory below. Metadata budgeting and unsupported-Mode adaptation are separate future boundaries, not substitutes for these answers.

## 5. Existing composition attempted; no proven generic gap yet

| Source requirement | Current input → Contract → owner / operations | Current result |
| --- | --- | --- |
| Conditional ally ATK/SPD benefit | EffectSpec.stat + StateSpec/Conditions and Passive registration → Stat/State/Trigger/Authority laws → current Contract Resolver, Trigger/State owners; P-030 MODIFY_STAT | Stat operation exists. Do not declare the complete live-aura composition sufficient or insufficient until source eligibility, lifetime and source-combination policy are locked. No baseline mutation workaround. |
| Required HP payment | CostSpec HP payer SELF, formula based on source MaxHP → CST-001/003/007/009 → Cost Transaction / Action admission; P-034/036 | Existing ordinary required Cost transaction is the candidate. Exact read/override policy must be bound before execution; no new cost Primitive or private rollback. |
| Fill recipient Rage | ResourceSpec RAGE, pool TARGET, ordinary SET to legal Max Rage / cap policy → CST-011/013 → existing resource pool operation and Scheduler; P-033 MODIFY_RESOURCE | Reuse resource setting; readiness does not request an immediate independent Ultimate. No Character-specific Rage service. |
| Team Shield / source-family cap | ShieldSpec owner, stacking, duration and optional sourceFamilyCap → SHP-002/003/005/006 → Shield ledger / Transaction Manager; existing Shield operations | Existing surfaces cover independent contributions and aggregate new-addition clipping if the designer chooses those semantics. A different answer must be audited independently, not coerced into that profile. |
| Target and formula checkpoints | TargetSpec / SnapshotSpec / ResolutionSpec → TGT-004/006, SNP-001/003/004, RES-002/003 → Target/Snapshot/Transaction owners | Available composition choices are inventoried; none is selected as gameplay by this audit. |

No Character-specific branch, `ChienCoRuntime`, arbitrary callback/middleware, new Functional Tag, new Primitive or generic priority system is proposed. A generic gap requires a locked input, current governing Contract/owner, exact failure of existing composition and the smallest justified extension. That proof has not yet been established for this kit.

## 6. Impact audit across current 00–08

Audit is not a requirement to edit all nine files. At this clarification stage:

| File | Decision / evidence |
| --- | --- |
| 00 | PATCH: navigate this selected complete raw kit with CLARIFICATION_IN_PROGRESS status, without claiming completed normalization. |
| 01 | NO CHANGE: existing alive/presence, Cost/Damage, Action/readiness and Shield distinctions describe the source. |
| 02 | NO CHANGE: current BUFF/STAT_MODIFIER, SELF_HP_COST, RESOURCE_MODIFIER and SHIELD capabilities are available; Basic Damage tags await its typed profile. Aura/lifetime/cap parameters alone do not justify a new Tag. |
| 03 | NO CHANGE: existing stat, Cost, resource and Shield operations are the composition inventory; no failed operation has been proved. |
| 04 | NO PATCH PROVEN; affected normalization deferred: existing declarative surfaces must be tried with the eventual locked profiles. |
| 05 | NO PATCH PROVEN; affected law audit deferred: source lifetime, aura combination and Shield policy need answers before any law extension. |
| 06 | NO PATCH PROVEN; affected owner audit deferred: reuse existing owners first, and prove any registration/query/cleanup deficiency only after gameplay is locked. |
| 07 | NO CHANGE: ordinary turn-based SSI/readiness/field mapping applies where defined; no Action clock is converted to seconds for another Mode. |
| 08 | NO CHANGE for Chiến Cổ yet: no MUST_PASS example may settle §4 by fiat. Add only actual new regression obligations after clarification/composition. Polyhymnia R4's separate M-040 update is independent. |

Final Chiến Cổ normalization, generic-gap verdict and corresponding declarative coverage remain pending §4. This file is a reviewable source reconstruction and clarification record, not an execution-ready Character or a claim that all relevant runtime semantics have been proved.
