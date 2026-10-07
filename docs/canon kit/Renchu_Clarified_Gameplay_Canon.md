# Renchu / Nhận Sơ — Clarified Gameplay Canon

**Revision:** R1

**Status:** GAMEPLAY_CLARIFIED / ARCHITECTURE_NORMALIZED

**Source:** mục `56) Renchu / Nhận Sơ` trong [Ý tưởng nhân vật 4.md](../../Ý%20tưởng%20nhân%20vật%204.md) và **RENCHU / NHẬN SƠ FINAL GAMEPLAY LOCK Q1–Q6** của designer. Các khóa dưới đây thay thế sáu nhóm unresolved và mọi đề xuất cũ xung đột; câu trả lời explicit của designer có precedence cao hơn raw shorthand.

## 1. Identity và phạm vi Authority

**Renchu / Nhận Sơ** là Hoá Thân của **Kiếm Chủ**, tiên thiên thần sinh ra từ khái niệm kiếm. **Rank: Prime. Class: Warrior.**

Prime, Class và lore không tự cấp Authority. Chỉ clause **force WAITING → REINCARNATION của Skill3** được explicit cấp **AXIOM Authority**. Không cấp Axiom cho mọi Damage, Skill1, Skill2, Ultimate hoặc cả kit từ clause đó. Thần Tính là identity/protection với scope riêng ở §4.

Native Element, Base Deployment Cost và numeric budget chưa được cung cấp; không suy ra từ khái niệm kiếm.

## 2. Passive — The Sword Precedes All Law / Kiếm Tiên Ư Vạn Pháp

### 2.1 Qualifying direct Natural-Action outcome

Đối với mỗi **actually-performed Natural Action của Nhận Sơ**, qualifying outcome gồm:

- **A:** direct Damage của chính Natural Action đó;
- **B:** direct Damage của Ability child được **explicitly invoked trong authored direct Effect graph của Natural Action đó**.

Natural Basic, Natural Skill1 và Natural Skill2 đều qualify. Natural Ultimate ở §8 có **hai real Skill child non-Natural**; own-direct Damage của cả hai child qualify qua **explicit authored paths**, không phải vì chúng tự trở thành Natural.

Loại independent Counter, Reaction, DoT, Mark settlement, unrelated triggered Passive Damage, unrelated Follow-up và mọi child không thuộc declared direct Natural-Action graph. **Same rootActionId/ancestry không đủ** chứng minh membership; Damage Attribution cũng không thay Action lineage hoặc Effect provenance.

### 2.2 Base types và PRE_MITIGATION conversion

| Attack owner | Base PHYSICAL component | Base WILL component | Hit count mỗi recipient |
| --- | --- | --- | --- |
| Basic | `100% ATK` | `100% WIL` | **1** |
| Skill1 | `150% ATK` | `135% WIL` | **1** |
| Skill2 | `180% ATK` | `160% WIL` | **1** |

Dùng stat của Nhận Sơ tại snapshot được khóa cho từng attack owner. Khi Passive qualify, **mọi qualifying PHYSICAL/WILL component chuyển thành TRUE ở PRE_MITIGATION**; qualifying component vốn đã TRUE giữ TRUE và vẫn thuộc outcome của Passive.

`base typed component → component-type conversion to TRUE → TRUE Damage pipeline → Shield → Actual HP Damage receipt`.

Conversion thay semantic type của cùng component, **không tạo bản Damage thứ hai**, không tính ARM/RES rồi relabel, không mô phỏng bằng100% Penetration. Khi Passive không qualify, giữ base PHYSICAL/WILL types. TRUE bypass ARM/RES và Final Damage Reduction theo Damage Contract hiện hành, **không tự bypass Shield**, Guaranteed Hit, Execute hoặc ordinary admission/lifecycle.

### 2.3 Damage basis, một Heal và local completion order

Sau khi **ALL qualifying direct Damage groups/children của Natural Action đã terminal** và mandatory lifecycle đã đóng:

`D = sum(committed Actual HP Damage receipts của đúng qualifying Passive-covered direct outcome)`.

Không gồm Shield absorption, Overkill, Counter, Reaction, DoT, Mark, unrelated Passive/Follow-up hoặc same-root Damage ngoài declared graph. Dùng committed DamageResult receipts, không tái dựng D từ nominal coefficients/live HP. Mỗi Effect/receipt chỉ đóng góp theo đúng identity; không double-count packet và component aggregate cùng lúc.

Settle **đúng một self-Heal** cho Natural Action đó:

`requestedHeal = 0.50 × D`.

Không Heal theo target/hit, không tạo một Heal riêng cho từng Ultimate child. D0 vẫn theo ordinary zero-amount Heal law; CC-lost opportunity không phải actually-performed Action và không tạo settlement này. Ordinary Heal admission/modifiers/lifecycle vẫn áp dụng; Heal không Revive một owner đã DEATH_CONFIRMED.

Local order đã khóa:

`qualifying direct Damage → mandatory lifecycle → all qualifying groups/children terminal → aggregate D → self-Heal50%D → derive Overheal from that HealResult → eligible Overheal-to-Shield → remaining root direct settlements complete → ACTION_DIRECT_EFFECTS_COMPLETE → ordinary Counter/Reaction`.

Mandatory lifecycle **không phải ordinary Reaction window**. Đây là dependency của đúng root outcome, không phải global Reaction priority. Không commit Heal trước một sibling child Damage, không để ordinary Counter/Reaction interpose trước Heal/conversion.

## 3. Overheal → Standard Shield

Từ **committed HealResult của đúng Passive Heal ở §2.3**, lấy `O = committed Overheal` sau ordinary Heal admission/modifiers/restoration.

- `O <= 0`: **không Shield conversion**.
- `O > 0`: `requestedShield = 0.50 × O`.

Chuyển đổi **liên tục**, không quantize theo chunk1% MaxHP. Câu `1% MaxHP Overheal → 0.5% MaxHP Shield` chỉ định ratio50%. Ordinary project numeric policy xử lý precision; Overheal20 → Shield10 độc lập với MaxHP150. Không tái dựng Overheal bằng requested-minus-restored hoặc live HP, không đổi một HealResult bị denied thành committed Overheal giả.

Mỗi **positive committed conversion** tạo **NEW Standard Shield contribution**, giữ source/provenance và contribution identity riêng. Không replace contribution trước, không refresh shared duration, không merge identity vì cùng Passive source.

**Không Renchu-specific cap, Natural-Action duration hoặc expiry timer.** Generic Shield caps/laws, nếu có, vẫn áp dụng. Contribution tồn tại đến ordinary depletion/break, explicit removal, lifecycle cleanup hoặc actual LEAVE_FIELD cleanup. DEATH_CONFIRMED/LEAVE_FIELD cleanup xóa remaining contribution với đúng terminal cause; không giả thành depletion/natural expiry.

Contribution biến mất **không tạo terminal Heal hoặc Effect khác**. Temporary VFX absence không được tự coi là actual LEAVE_FIELD.

## 4. Thần Tính

Không nhận **external Buff, Debuff hoặc Mark** từ mọi nguồn ngoài có Authority **Quy Tắc hoặc thấp hơn**, bao gồm đồng minh lẫn kẻ thù. Self-authored Passive Heal/conversion không phải external Buff.

Không mở rộng scope thành chặn mọi beneficial/harmful/neutral Effect. Direct Damage, Heal hoặc Shield không tự bị chặn chỉ bởi tên; phân loại Effect thực tế và đúng scope vẫn quyết định admission. Không mặc định miễn Buff/Debuff/Mark cấp Axiom hoặc biến toàn kit thành Axiom Damage.

Thần Tính là **Axiom identity metadata** theo canon chung; scoped protection ở trên **không phải Damage Immunity**, không tự cấp AXIOM Authority cho Ability/clause khác.

## 5. Basic

Tại **Basic Action start**: chọn legal enemy → lock **Slot coordinate hiện tại** của enemy → snapshot ATK/WIL của Nhận Sơ **một lần**. Default không lock Entity.

Cho declared pre-Damage movement/dodge resolve trước recipient checkpoint. Ngay trước Damage commit, đọc **current legal occupant của locked Slot**:

- Slot empty: **MISS**;
- original Entity rời ô, một legal Entity khác vào: **current occupant nhận Basic**;
- không chase Entity cũ, không retarget Slot khác.

Một hit chứa base **PHYSICAL100% ATK + WILL100% WIL**, rồi Passive chuyển qualifying components sang TRUE. Basic ngoài qualifying Natural graph dùng base types. Ordinary Hit/invalid-recipient law tiếp tục áp dụng; Slot lock không bảo đảm trúng.

## 6. Skill1 — Four Directions, One Edge / Tứ Phương Nhất Nhận

**Cost15 AE.** Sau required Cost transaction commits, lock fixed enemy Slots **8/2/4/6** và snapshot ATK/WIL của Nhận Sơ **một lần**.

Declared pre-Damage movement/admission resolve → đọc current legal occupant mỗi locked Slot → freeze recipients cho **một simultaneous Damage batch**.

Empty Slot: **OMIT_LOCAL**. Recipient invalid sau freeze: **DROP_LOCAL**. Không retarget/reroll; thứ tự8/2/4/6 không tạo priority. Mỗi legal recipient nhận **một hit**, base **PHYSICAL150% ATK + WILL135% WIL**, rồi qualifying Passive conversion sang TRUE.

Nhận Sơ đứng tại chỗ loạn trảm bốn đạo kiếm khí; VFX không di chuyển actor.

## 7. Skill2 — Sever Heaven / Đoạn Thiên

**Cost25 AE.** Sau required Cost transaction commits, lock fixed enemy Slots **2/5/8**, **bất kể Nhận Sơ đứng đâu**, và snapshot ATK/WIL **một lần**.

Cùng recipient law của Skill1: pre-Damage movement/admission resolve → current legal occupants của locked Slots → freeze recipients → **một simultaneous Damage batch**; empty **OMIT_LOCAL**, invalid sau freeze **DROP_LOCAL**, không retarget/reroll.

Mỗi legal recipient nhận **một hit**, base **PHYSICAL180% ATK + WILL160% WIL**, rồi qualifying Passive conversion sang TRUE. Chém dọc tạo kiếm khí khổng lồ là presentation, không thay actor Position và không đổi sang cột đối diện actor.

## 8. Ultimate — One Sword Defines Heaven and Earth / Nhất Kiếm Định Thiên Địa

### 8.1 Real child identity và AE waiver

Một root **ULTIMATE Natural Action** request đúng **một real Skill1 child + một real Skill2 child**. Cả hai giữ **Action Identity=SKILL**, cùng root Ultimate, **non-Natural**, explicit direct children của authored graph.

Waive đúng child AE Costs: **Skill1 AE0, Skill2 AE0**. Không erase Skill identity thành inline anonymous Damage, không cấp hai Natural Actions/SSI advancement/class Natural-Action regen mới. Root Ultimate readiness/Cost áp dụng bình thường; miễn child AE không miễn root Rage/Cost hoặc ordinary otherwise-applicable child readiness.

### 8.2 Common snapshot và recipient checkpoint

Sau root Ultimate readiness/Cost transaction commits: snapshot ATK/WIL của Nhận Sơ **một lần chung cho cả hai children**, rồi lock riêng hai fixed Slot sets **8/2/4/6** và **2/5/8**. Child executions dùng đúng common snapshot thay việc chụp lại stat độc lập ở child start.

Resolve declared pre-Damage movement/admission → **một common recipient-read checkpoint**. Mỗi child đọc current legal occupants theo **Slot set riêng**, freeze recipients cho combined batch. Empty Slot bỏ nhánh; recipient invalid sau freeze **DROP_LOCAL cho packet đó**, không retarget. Cả hai thấy cùng authoritative occupancy tại checkpoint này.

### 8.3 Một common direct-Damage batch, separate results

Hai child direct-Damage groups thuộc **một common simultaneous root-owned direct batch/window**. “Root-owned batch” không biến child Effect provenance thành root-owned Effects: giữ **separate child Action, Effect, packet/component và DamageResult identities**.

Mỗi overlap Slot **2/8** có thể nhận **hai hit distinct**: một Skill1 hit và một Skill2 hit, không merge formula/hit. Mọi qualifying components chuyển TRUE qua §2.2 dù children non-Natural, vì exact authored direct graph membership.

Không Skill1-before-Skill2 hoặc ngược lại; không Slot/list/Entity/Event priority. Khi packets/components chia sẻ recipient Shield/HP hữu hạn, dùng **ordinary proportional shared-recipient allocation** trong một simultaneous commit, không cho mỗi packet tự tiêu toàn bộ cùng budget.

Sau combined batch và mandatory lifecycle terminal, seal child results/outcomes, aggregate D từ direct Damage receipts của **cả hai child đúng một lần** rồi **một Passive Heal/conversion** theo §2.3. Không ordinary Counter/Reaction chen giữa sibling calculations hoặc trước root-dependent Heal/conversion.

## 9. Skill3 — No Interval Between Death and Rebirth / Sinh Tử Vô Gian

### 9.1 Admission và Authority

Active Skill, **Cost30 AE**, **consumes một Natural Action**. Admission requires **ít nhất một enemy Chân Ngã hiện eligible trong REINCARNATION_WAITING_WINDOW**. Pool empty → **NOT LEGALLY ACTIVATABLE**, không cast no-op để mất30 AE.

Chỉ clause **force WAITING → REINCARNATION** mang **AXIOM Authority**. Nếu actual direct Authority-bearing conflict tồn tại, dùng existing Authority adjudication; không “Prime wins”, không tự cấp Axiom cho Damage hoặc Ability khác.

### 9.2 Frozen pool và coherent batch

Tại **successful post-Cost settlement checkpoint**, snapshot **ALL enemy-side Chân Ngã records vẫn WAITING và là legal candidates cho Effect này**. Exclude allies, closed, Revived, already-Reincarnated records. Freeze complete candidate set cho transaction; không thay nó bằng pool tại admission hoặc tiếp tục live-query sau từng entry.

Evaluate Axiom force transition **độc lập từng frozen candidate**. Candidate bị valid Authority conflict chặn → **FAIL_LOCAL**, các candidate legal khác tiếp tục. Không fail cả Skill chỉ vì một target fail, không retarget/replacement/retry; complete pool đã được capture. Post-admission invalidation dùng ordinary local failure law, không dựng lại pool hoặc hoàn lại Cost đã commit chỉ vì Effect không còn target.

**ALL admitted transitions commit trong một coherent batch**, không ordinary observer/Reaction interpose giữa members. List, Entity, death, Slot hoặc Event order không tạo priority. Tất cả waiting→entry decisions dùng đúng protected read/commit semantics; không publish partial revive-eligibility view hoặc cho downstream route của entry đầu sửa eligibility entry sau trong cùng batch.

### 9.3 Lifecycle result

Nhận Sơ rút kiếm/thu kiếm, chém khoảng cách giữa hàng chờ Luân Hồi và Luân Hồi của enemy Chân Ngã. Không gây Damage/Execute, không tạo synthetic DEATH_CONFIRMED/Revive, host, Character definition, Side mới hoặc materialization.

Successful WAITING→REINCARNATION entry đóng ordinary Revive eligibility theo luật chung. **Entry ≠ Routing ≠ Rebirth/materialization ≠ Erasure**. Sau coherent entry batch, ordinary downstream Routing/Rebirth có thể chạy theo rule riêng; Skill3 không chọn destination hoặc đời mới.

## 10. Các ví dụ đã khóa

### 10.1 Một Natural Basic, một Heal

Committed qualifying Actual HP Damage100 → D100 → requested Heal50. Nếu chỉ thiếu20 HP và không modifier khác: Actual Heal20 → Overheal30 → Shield15. Không Heal theo hai components hoặc một packet có Shield absorption.

### 10.2 Ví dụ raw đã sửa

Ở **CurrentHP100 / CurrentMaxHP150**, không modifier khác:

| D | Requested Heal | Actual Heal | CurrentHP sau Heal | Overheal | Shield |
| --- | --- | --- | --- | --- | --- |
| 70 | 35 | 35 | 135 | 0 | 0 |
| 140 | 70 | 50 | 150 | 20 | 10 |

Giữ hệ số Heal **50%**, không đổi thành100% để cứu ví dụ cũ. Ratio Shield50% không cần chunk1% MaxHP.

### 10.3 Ultimate overlap và excluded Counter

Enemy Slot2 nhận Skill1 base150% ATK +135% WIL và Skill2 base180% ATK +160% WIL; hai hit distinct chuyển TRUE trong cùng simultaneous batch. D chỉ cộng committed Actual HP Damage của hai packets sau proportional Shield/HP allocation; rồi **một Heal50%D**.

Independent Counter ngoài explicit direct graph dù chia sẻ root lineage vẫn dùng ordinary base types, không qualify conversion hoặc D. Causal ancestry không biến nó thành direct Natural Damage.

## 11. UNRESOLVED / NOT BLOCKING

**Không còn unresolved internal gameplay trong Q1–Q6.** Native Element, Base Deployment Cost, full numeric budget và các future Mode adapter chưa được cung cấp; chúng không chặn các semantic locks hiện tại và không được tự suy từ Prime/lore.

Một future external-content/profile conflict dùng đúng authored scope và existing governing law khi gặp; không cấp global priority, blanket immunity, child identity inheritance hoặc unsupported Force/Revive default. Các boundary tương lai này không mở lại Q1–Q6.
