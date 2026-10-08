# Kenoma — Clarified Gameplay Canon

**Revision:** R2

**Status:** GAMEPLAY_CLARIFIED / ARCHITECTURE_NORMALIZED

**Source:** mục `61) Kenoma` trong [Ý tưởng nhân vật 4.md](../../Ý%20tưởng%20nhân%20vật%204.md) và **KENOMA Q1–Q9 FINAL DESIGNER LOCK**, gồm Q1A/Q1B và explicit correction về giữ Chân Ngã qua Deck/redeploy; bổ sung designer lock 2026-10-08 về nhiều Chân Ngã đồng thời tranh một empty Kenoma body. Các khóa dưới đây thay thế mọi unresolved/proposal Q1–Q9 cũ; designer lock có precedence cao hơn raw shorthand.

## 1. Identity và Passive — Life Before the Soul / Sinh Mệnh Có Trước Linh Hồn

**Kenoma — Rank SSR** là sinh vật huyết nhục kết hợp cơ giới. **Initial battle/body không có bound Chân Ngã**, nhưng kit hoạt động bình thường. Không tự gán entity kind SUMMON/PUPPET hoặc miễn Damage/Death từ absence của Chân Ngã.

“Vào sân không Chân Ngã” chỉ initial body, **không xóa Chân Ngã đã nhập khi redeploy**. Class, Native Element, Basic profile, Base Deployment Cost/numeric budget và deployment floor chưa được cung cấp; không suy từ hình tượng, entrant hoặc Rank.

### 1.1 Battle-once deployment cost

Vào trận, **Current Character Deployment Cost trên Deck giảm2 đúng một lần**, không stack qua leave/Return-to-Deck/redeploy. Không sửa Base Deployment Cost, AE, Rage hoặc Side Deployment Cost Bar; không LOCK_CURRENT chống mutation từ kit khác.

Ví dụ Current cost trước khoản giảm17 →15; nếu không có nguồn khác thì redeploy bao lần vẫn15. Đây không phải numeric Base budget của Kenoma. New battle có initialization riêng.

## 2. Active Reincarnation route và True-Self host binding

### 2.1 Entrants và host eligibility

Khi một Chân Ngã trong **cùng Combat Instance** legitimately vượt `REINCARNATION_WAITING_WINDOW → REINCARNATION`, Kenoma là eligible host candidate nếu **alive + Field Present + chưa có bound Chân Ngã**. **Không Side restriction**: entrant từ cả hai phe đều có thể nhập.

Không kéo Chân Ngã còn WAITING trước legitimate entry, không synthetic DEATH_CONFIRMED/entry và không route từ mọi Combat Instance theo mặc định. Kenoma host **tối đa một Chân Ngã**, không overwrite/replacement khi occupied.

### 2.2 Rank-first route contention

Các eligible route claims tranh **cùng entering Chân Ngã** so **Effective Rank của route owner/claimant trước**. Rank cao hơn có first claim; **phải thực sự eligible với entrant và có legal host/route**, presence không đủ.

Với identities hiện được declared: **Prime Luân Hồi Chi Chủ > UR Pygmalion > SSR Kenoma**. Đây là hệ quả của Effective Rank comparison, không Character-name priority. Nếu higher route ineligible/không legal host, next eligible route được compete. Không SSR Kenoma steal entrant từ một legal eligible higher claim.

**Different route semantics/owners cùng Effective Rank** chỉ dùng **existing Authority Conflict Adjudication** sau khi actual gameplay clauses được chứng minh là Authority-bearing claims trực tiếp không tương thích trên cùng semantic và entrant/scope. Shared resource/capacity tự nó không đủ; thiếu proof/law thì yêu cầu explicit compatible composition hoặc reject. Không Event/Slot/Entity/list/iteration/RNG Authority winner, không suy Authority tier từ Rank. Exact **NO_OVERRIDE** không tạo winner; entrant tiếp tục theo other separately legal route/ordinary Reincarnation outcome còn lại.

Nhiều EMPTY Kenoma hosts trong **cùng Kenoma route family** là host-selection multiplicity, không Authority conflict mới. Sau family legitimately thắng contention: seeded deterministic **RANDOM giữa eligible empty Kenoma hosts** → reserve một host → protected binding commit. Không host nhận hai entrants.

Nhiều entrants ở một **complete Reincarnation-entry checkpoint** dùng complete-entry settlement với deterministic protected ordering/reservation; không Event/list prefix priority. Một family selection không cấp priority cho unrelated world systems hoặc cho tranh chấp Authority thật.

**Khóa nhiều entrants / một empty body:** nếu hơn một Chân Ngã legitimately vào Luân Hồi cùng checkpoint, Kenoma alive + trên sân + chưa bound Chân Ngã và không bị kit khác can thiệp, **ngẫu nhiên đúng một entrant hợp lệ nhập cơ thể Kenoma**. Dùng existing enumeration-invariant **seeded entrant permutation** rồi reserve/bind host; các entrant sau đọc occupied capacity và tiếp tục ordinary legal outcome. Đây là random entrant selection, không Authority tie-break hoặc AUT conflict chỉ vì tranh capacity. Same seed/logical identities/replay giữ nguyên entrant đã chọn; không overwrite/double-bind, và eligibility/actual higher-route intervention vẫn theo luật trên.

### 2.3 Binding giữ nguyên Kenoma

Successful route bind đúng entrant True Self vào Kenoma và close old waiting/reincarnation route phù hợp. Kenoma giữ **Side, body/presentation, stats, Combat Definition/kit** của mình; chỉ các authored has-Chân-Ngã strengthened clauses bật.

**Không inherit** entrant previous kit/stats/Class/Element/body/presentation/Buff/Debuff/Mark/Shield/CD/Rage/resources/previous-life state. **TRUE-SELF HOST BINDING ≠ Pygmalion full-definition inheritance**. Không cấp thêm Soul, tự Heal, reset resources hoặc giả successful Deck deployment chỉ vì binding.

## 3. Chân Ngã retention và Death

### 3.1 Ordinary leave/Deck/redeploy

Bound Chân Ngã giữ qua **ordinary non-death LEAVE_FIELD, Return-to-Deck và redeploy cùng trận**. Kenoma ra sân lại với chính bound Chân Ngã đó và có strengthened clauses, subject to từng Skill's own reset/state law. Soul retention khác Skill2 controller/growth cleanup.

### 3.2 Death có Chân Ngã

DEATH_CONFIRMED khi carrying Chân Ngã: đó là True Self của Kenoma life này, vào ordinary waiting theo death law; Kenoma không còn living host. Ordinary Revive trước Reincarnation entry có thể restore **same Kenoma life/body + same Chân Ngã**. Không tạo second True Self.

Nếu Chân Ngã đã vào Reincarnation trước Revive, old life không còn ordinary Revive entitlement; entrant có thể route nơi khác hợp lệ, gồm another eligible host. Binding/death/Revive/new Reincarnation life không collapse thành một identity transition.

### 3.3 Death không Chân Ngã

Empty body DEATH_CONFIRMED: **không Chân Ngã waiting record, không ordinary True-Self Revive entitlement**, body terminally dead/removed cho trận trừ một explicit non-True-Self mechanic khác.

Empty Kenoma death **không qualifying Chân-Ngã-bearing death để advance waiting progress của Chân Ngã khác**. Collection Character identity không tạo synthetic True Self/cohort member. Ordinary damage/death/lifecycle observers vẫn theo scope của chúng; absence của waiting entitlement không phải invulnerability.

## 4. Cast profile và Damage types

Tại **successful Action admission/Cost-profile selection**, pin `hasBoundTrueSelf` cho **entire Skill cast**. Cùng captured flag quyết định AE, Damage coefficients, Rage reduction, Skill3 bonus availability và các conditional cast clauses; không đổi giữa Cost/hits khi binding thay đổi ở settlement khác.

Sau required Cost transaction terminal, snapshot Kenoma **ATK/WIL một lần cho cast**; mọi hit dùng source snapshot đó trừ explicit later rule. Skill3 snapshot CurrentMaxHP theo §7. Ultimate pin flag tại root admission và truyền cho đúng Skill1 child (§8). Skill2 cycle-end growth dùng **live binding** theo §6.4, không cast flag cũ.

Base types: **ATK contribution → PHYSICAL; WIL contribution → WILL**. Không TRUE conversion cho toàn kit. Ordinary components giữ riêng mitigation/receipt; chỉ explicit Skill3 bonus là TRUE. TRUE theo ordinary law bypass mitigation/FDR, không tự Shield Piercing/Guaranteed Hit/Execute.

## 5. Skill1 — Three Shots Against Wrath / Tam Đạn Trấn Nộ

| Pinned mode | PHYSICAL mỗi bullet | WILL mỗi bullet | Rage reduction | AE |
| --- | --- | --- | --- | --- |
| Không bound Chân Ngã | 135% ATK | 135% WIL | 15 | 30 |
| Có bound Chân Ngã | 150% ATK | 150% WIL | 20 | 25 |

Admission cần **ít nhất một legal enemy actor có authoritative Rage resource**; không có → NOT LEGALLY ACTIVATABLE.

Sau required AE commits: đọc eligible enemies' Current Rage tại một checkpoint → chọn **up to3 highest**, no duplicates. Cutoff tie dùng seeded **RANDOM_AMONG_TIED**, không Entity/Slot/list priority. Fewer than3: chọn all available, đạn dư biến mất, không dồn thêm hit vào target đã có.

Actor selection chỉ xác định **current Slots** rồi lock coordinates; **không Entity lock**. Declared pre-Damage movement → đọc current legal occupant mỗi locked Slot → freeze surviving branches. Empty Slot: MISS/omit; later-invalid branch DROP_LOCAL; không chase/retarget/reroll. Original selected actor rời ô thì legal occupant mới nhận bullet.

Tất cả admitted branches là **một coherent SIMULTANEOUS group**, mỗi recipient **một hit2components + Rage reduction trong cùng branch**. Damage/Rage cùng recipient, không query lại riêng cho drain. Hit admitted/legal nhưng Shield absorb all thì drain vẫn commit; positive ActualHP không required. MISS/no recipient/invalid → neither Damage nor drain.

Occupant mới không có Rage resource: Damage vẫn resolve nếu legal, **drain subeffect local no-op**, không fail cả branch/retarget. Ordinary Resource clamp không cho negative Rage. Target selection order không thành Damage commit priority.

## 6. Skill2 — Flesh Becomes Armor, Armor Becomes Flesh / Huyết Nhục Hóa Giáp, Giáp Hoàn Huyết Nhục

### 6.1 Complete qualifying enemy Natural outcome

Tại enemy Natural Action start snapshot **M = Kenoma CurrentMaxHP**. D là per-Kenoma sum **committed Actual HP Damage** từ:

- **A:** enemy Natural Action's own direct Damage;
- **B:** damaging Passive Follow-up/enhancement **explicitly outcome-attached**, causally produced by Natural Action đó và declared trong trigger scope.

Include TRUE. Exclude DoT, independent Counter/Reaction, Mark settlement, unrelated Passive/child/follow-up, merely same-root Damage, Shield absorption, Overkill, HP Cost/non-Damage HP Loss. Exact outcome/provenance membership không thay bằng shared root ancestry hoặc live HP difference.

Chờ **all qualifying Damage + mandatory lifecycle terminal**, rồi evaluate **đúng một lần `D > 0.35M`**. Exactly35% không trigger. DEATH_CONFIRMED owner không activate; lawful Death Prevention để owner alive thì stable outcome có thể trigger. Skill2 không phải Death Prevention, không skip mandatory lifecycle.

### 6.2 Cost và missingHP exchange

**Cost5 AE/activation**, không per-battle cap. READY mới được activate; validate/pay Cost trước exchange, failed payment không partial Effects/retry token. Existing post-Cost local failure/refund law tiếp tục áp dụng.

Tại **successful post-Cost conversion checkpoint**:

`E = max(0, CurrentMaxHP − CurrentHP)`.

**D chỉ dùng threshold**, không dùng exchange quantity. Successful activation tạo **một paired conversion record**: source-traceable temporary **−E MaxHP contribution + Skill2 Shield contribution E**, preserve absolute CurrentHP. Không Damage/HP reduction lần hai, không lấy foreign Shield vào E.

Không external modifier/cap: `HP80/MaxHP200 → E120 → HP80/MaxHP80 + Shield120`. Exchange/reconciliation cùng owning activation; admission/foreign caps/modifiers giữ law riêng, không ngầm đổi quantity hoặc giả full credited Shield.

Nếu E0 do lawful recovery trước exchange: dùng ordinary zero-delta/zero-Shield policy, không tạo positive Shield contribution; successful controller vẫn dùng ACTIVE3/CD2, không thêm điều kiện E>0 ngoài designer lock.

Restore bằng removal **đúng activation's −E contribution**, recompute current view giữ unrelated MaxHP changes; không rewind full stat snapshot/baseline. Terminal remaining Shield cũng chỉ từ **đúng contribution activation này**, không family total/foreign sources.

### 6.3 ACTIVE3 → COOLDOWN2 → READY

At most **một ACTIVE controller**. ACTIVE hoặc COOLDOWN: không activation mới/refresh/stack/second controller.

ACTIVE qua **next3 consumed own Natural-Action opportunities**. CC-lost counts; non-Natural không count; enemy Action gây trigger không phải một trong ba. Không own opportunity thì global boundaries không tick controller.

Shield break trước end: controller và −E còn ACTIVE, clock tiếp tục. **Không early MaxHP restore/Heal/CD**. Source-specific Shield removal không tự thành successful natural controller end; không lấy foreign remainder để bù.

Ở **third qualifying opportunity completion**, đúng một terminal sequence:

1. Capture **R = remaining Shield của activation này**.
2. Remove remaining own Shield contribution.
3. Remove paired −E MaxHP contribution.
4. Recompute restored CurrentMaxHP giữ foreign changes, preserve absolute CurrentHP.
5. Nếu R>0, **ordinary self-Heal requested=R**.
6. Resolve eligible §6.4 growth.
7. Enter **fresh COOLDOWN2**, không decrement ở chính opportunity vừa hết ACTIVE.

CD đếm **next2 consumed owner opportunities**, CC-lost counts/non-Natural không; sau second → READY. Shield của nguồn khác còn hợp lệ không bị removal/terminal Heal của Skill2.

### 6.4 Live True-Self growth5%

Chỉ **normal successful ACTIVE completion** kiểm tra **live bound Chân Ngã**. Nhập Soul giữa ACTIVE → cycle được growth nếu vẫn bound tại completion; no bound → no growth.

Sau restore paired capacity **và terminal Heal**, trước new growth:

`G_base = current restored CurrentMaxHP; G = 0.05 × G_base`.

Thêm **new source-traceable +G MaxHP contribution** mỗi successful eligible cycle; cumulative/compounding. Không foreign sources: `200 →210 →220.5`. Preserve absolute CurrentHP; MaxHP growth **không Heal, không +5% CurrentHP**.

All accumulated Kenoma growth thuộc **cùng Field Presence**. Actual LEAVE_FIELD, gồm Return-to-Deck, remove own accumulated growth; không tự trở lại khi redeploy. Death-caused leave cùng reset. **Bound Chân Ngã vẫn giữ theo §3**, không mất theo growth record.

### 6.5 Death/actual leave cleanup

Actual DEATH_CONFIRMED hoặc actual LEAVE_FIELD cancel ACTIVE/CD, remove remaining own Shield/paired −E; **no terminal Heal, no cycle-end growth, no expiry callback**. Later reentry bắt đầu **Skill2 READY**. Growth cleanup theo §6.4; foreign Shields/records theo own retention law.

Giữ distinct terminal causes: break/depletion, natural controller completion, explicit removal, death/transition cleanup. Cleanup không reward như natural expiry; old activation/opportunity callbacks không tác động body/presence mới. Numeric-negative MaxHP mutation không tự BUFF/DEBUFF/Authority từ nhận xét “tốt hay xấu”.

## 7. Skill3 — Core-Piercing Round / Đạn Xuyên Sinh Lõi

**Fixed enemy Slot8**, không Leader identity. Admission cần legal enemy occupant ở Slot8; không có → NOT LEGALLY ACTIVATABLE. Cost **25 AE**, hoặc **20 AE** theo pinned has-Chân-Ngã cast profile.

Sau required Cost commits, capture **ATK/WIL/CurrentMaxHP** của Kenoma; flag đã pinned ở admission. Lock Slot8 → declared pre-Damage movement → main recipient checkpoint đọc **current legal occupant Slot8**. Empty → MISS/no main/no bonus/no retarget/refund; later invalid DROP_LOCAL. Slot attack không chase selected Entity/Leader.

Main **một hit, hai components**: **PHYSICAL160% ATK + WILL160% WIL**.

Nếu pinned flag true **và đúng main hit committed ActualHP >0**, sau mandatory lifecycle tạo **đúng một additional direct TRUE hit =5% cast-snapshotted Kenoma CurrentMaxHP**.

Bonus là **explicit local Entity-bound continuation** tới **same recipient identity của qualifying main DamageResult**. Không query Slot8 lần hai, không chọn occupant mới, không retarget/repeat/recursive bonus. Recipient DEATH_CONFIRMED/lifecycle-invalid → skip bonus locally; live/legal recipient có movement vẫn theo exact Entity continuation, không đổi main attack owner sang Entity targeting.

Order: `main hit → mandatory lifecycle → positive ActualHP gate → legal TRUE bonus → mandatory lifecycle → direct effects complete → ordinary Counter/Reaction`. Không ordinary Reaction giữa main và bonus; TRUE không tự bypass Shield.

## 8. Ultimate — Reclamation Salvo / Loạt Đạn Thu Hồi

Một **Natural ULTIMATE root** request **đúng một real Skill1 child**: identity **SKILL**, **NON-NATURAL**, rootAction=Ultimate, child AE override **0**. Không inline anonymous Damage/extra Natural Action/SSI/class regen; root readiness/Cost giữ ordinary law.

Root Ultimate admission capture hasBoundTrueSelf rồi pass đúng profile vào child. Child dùng 135/135 + drain15 hoặc150/150 + drain20 tương ứng, không switch theo Soul route giữa execution. Source ATK/WIL capture sau applicable required Cost terminal; target/group policies đúng §5.

Sau complete child direct bullet/drain outcome + mandatory lifecycle terminal:

`D = sum(committed Actual HP Damage của THIS Skill1 child's own-direct bullets)`.

Exclude Shield/Overkill/Counter/Reaction/DoT/independent Passive/unrelated same-root Damage; Rage reduction không phải Damage. Exactly **một self-Heal requested=0.50D**, không per recipient/hit, không nominal reconstruction.

Order: `Ultimate admitted → exact Skill1 child AE waived → target selection/simultaneous Damage+Rage → mandatory lifecycle → child direct outcome terminal → aggregate D → one self-Heal → remaining root direct settlements → ACTION_DIRECT_EFFECTS_COMPLETE → ordinary Counter/Reaction`.

Không wait future root completion trước Heal hoặc mở Reaction window giữa child và dependent Heal. Ordinary Heal/Overheal admission/modifiers áp dụng; **không native Overheal→Shield conversion**.

## 9. Các ví dụ/negative space đã khóa

- HP160/200 nhận qualifying D80 → HP80/200: exchange **E120**, không D80, thành HP80/80 + own Shield120.
- HP100/200 đổi E100 → HP100/100 + own Shield100; natural end còn own R30 → restore capacity200, Heal30 → HP130/200; R0 → HP100/200 nếu không nguồn/modifier khác. Growth eligible sau đó tăng MaxHP210, CurrentHP không tự tăng.
- Third ACTIVE opportunity ends → new CD2 giữ2; hai owner consumed opportunities tiếp theo →1 rồi READY. CC-lost count, non-Natural không count.
- Non-death Deck return: Chân Ngã giữ, deployment discount giữ, Skill2 READY/growth reset; redeploy vẫn strengthened, không empty lại.
- Skill1 replacement occupant không Rage: legal Damage vẫn được, drain local no-op. Shield-only hit với Rage-bearing recipient vẫn drain.
- Skill3 main killed recipient: positive receipt không cho bonus vào corpse/occupant mới. Bonus receipt không mở lại main-result gate.
- Ultimate D100 chỉ gồm exact child ActualHP → one requested Heal50; independent same-root result không thêm credit.

## 10. UNRESOLVED / NOT BLOCKING

**Không còn unresolved internal gameplay trong Q1–Q9/Q1A/Q1B.** Rank SSR đã explicit; Class/Element/Basic/numeric Base Deployment Cost/floor/budget và future Mode adapters chưa cung cấp, không chặn semantic normalization này. Không execute numeric metadata chưa resolved hoặc tự chọn Basic fallback.

Future external capacity/Shield caps, explicit removals, unusual restore profiles hoặc route families dùng actual compatible governing law khi gặp; không generic hidden priority, forged lifecycle/result, full-definition inheritance hoặc reopened designer locks.

## 11. Normalization / architecture binding

Character-specific constants/conditions below are declarative kit data. Không Character dispatch, new Functional Tag/Primitive/manager hoặc inferred Authority.

| Mechanic | Typed composition / current owner |
| --- | --- |
| Initial empty body, max-one True Self, host-only route | REINCARNATION ROUTE / 04§30.3–4 / REC-006; current alive/present/empty eligibility, both-Side entry pool, host reservation and P-080 identity binding. Retain body/Side/definition/stats; no P-082/083 inheritance. Shared Rank-first profile: only identical Kenoma-route semantics use family host multiplicity and seeded legal-host choice after family wins. |
| Bound Soul retention/death | Existing identity/life/True-Self ledger + deployment/REC-002/005/020; battle/life retention survives Deck, independent from Field Presence kit cleanup. Empty death has no True Self record/progress; bound death/ordinary Revive reuses that life until Reincarnation entry. |
| Deployment−2 | Static once-per-battle initialization, TRG-014 / DEP-002/006; ADD_CURRENT, immutable base, no repeated redeploy registration. |
| Pinned hasBoundTrueSelf, post-Cost stats | Existing typed Action/Snapshot bindings and conditional Cost profile; child receives exact root capture, not a live Soul query. Successful Skill2 cycle-end growth alone uses its expressly live state. |
| Skill1 ranked shots + drain | 04§11 metric topN/tie support, TGT-007/008; selected actor→Slot, pre-movement→occupant freeze; P-040/042 + P-033 in coherent RES-002 simultaneous branches with local missing Rage no-op. One hit/two components per admitted branch. |
| Skill2 trigger outcome | Natural-start recipient MaxHP Snapshot + exact own-direct DamageResult refs and explicitly scope-attached Passive settlement refs; P-043 received ActualHP aggregation. Existing ACT-032/04§7.12 finite local dependencies close those declared settlements/lifecycle before threshold evaluation; an explicitly completion-triggered attached settlement instead uses ACT-033's finite post-action phase. Failed/zero branch closes; no all-root scan, dependency waiting for its own held completion, polling or unrelated Reaction inclusion. |
| Skill2 exchange | Typed MAX/SUBTRACT Formula after AE5 Cost; source-keyed P-031/032 MaxHP contribution −E and own P-046 Shield contribution E; paired activation record stores exact MaxHP mutation/Shield refs, preserving absolute HP and unrelated contributions. |
| ACTIVE3 → terminal → CD2 | Existing State/controller/Duration/CLK opportunity semantics, clock consumed owner opportunities including CC; bound finite terminal graph captures own Shield remainder, removes own records, reconciles capacity, P-044/045 Heal, optional growth, fresh CD. Break does not terminate controller; new CD ignores the opportunity that created it. |
| Cycle growth / leave cleanup | Existing source-traceable MaxHP ADD contribution with live post-restoration basis, field-presence lifetime and cause-specific finite cleanup. Actual death/leave retires ACTIVE/CD/growth/own paired contributions without terminal Heal/growth; reentry READY while bound Soul persists. |
| Skill3 bonus | Main Slot8 P-040/042 result→mandatory lifecycle→positive ActualHP gate→one direct P-041 TRUE hit. Exact-owner local Entity binding is the designer-approved dependency on the main recipient identity; no Slot re-query/recursion/ordinary Reaction interposition. |
| Ultimate | One real P-001 SKILL child / ACT-020/023 / CST-006 waived AE; inherited pinned cast flag, ordinary child target law. Exact child-own direct receipts/lifecycle terminal→P-043 sum→one HEL-001/P-044/045 Heal50%; local DAG before root direct completion, no native Overheal Shield. |

**Exact architecture delta:** family-local complete-entry settlement alone supplies no Rank-first law across competing route families. 04§30.4 adds one bounded opt-in contention profile to the existing route plan; REC-006 and the existing Kernel owners execute it. Rank-first does not alter Authority tiers/comparator, global Reaction priority, entry membership or host-only binding. Same-Rank actual semantic conflicts remain AUT-governed; host multiplicity is separately declared. All other kit mechanics use existing composition, with explicit result/dependency/lifetime inputs as above.

Functional Tags theo smallest semantic owner trong current02: mỗi mixed Damage Effect có DAMAGE + PHYSICAL_DAMAGE/WILL_DAMAGE; bonus riêng có DAMAGE + TRUE_DAMAGE; Rage-drain Effect có RESOURCE_MODIFIER; actual terminal/Ultimate Heal có HEAL; own Shield contribution có SHIELD; capacity exchange/growth contribution có MAX_HP_MUTATION; True-Self route có REINCARNATION. AE Cost/discount, deployment-cost mutation, target geometry/ties, captured flag, clocks/controller, result gates và host multiplicity là facet/composition, không Functional Tag mới. Không gắn HEAL lên bullet, TRUE_DAMAGE lên main Skill3, COMBAT_DEFINITION_INHERITANCE lên host-only binding hoặc BUFF/DEBUFF từ dấu của capacity mutation; Capability Index derive upward từ owners thực sự.
