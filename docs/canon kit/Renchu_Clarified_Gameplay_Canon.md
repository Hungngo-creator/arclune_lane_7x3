# Renchu / Nhận Sơ — Clarified Gameplay Canon

**Revision:** R0

**Status:** GAMEPLAY_PARTIALLY_CLARIFIED / NORMALIZATION_BLOCKED_BY_INTERNAL_GAMEPLAY

**Source:** mục `56) Renchu / Nhận Sơ` trong [Ý tưởng nhân vật 4.md](../../Ý%20tưởng%20nhân%20vật%204.md), cùng mô tả mới nhất của designer. Mô tả mới nhất xác nhận True Damage của Basic/Skill1/Skill2 là **từ nội tại**; không tự coi chúng là ba nguồn True Damage độc lập, vô điều kiện. Chỉ các phần đã rõ dưới đây được khóa. Các đề xuất ở §7 chưa phải gameplay được duyệt.

## 1. Identity

**Renchu / Nhận Sơ** là Hoá Thân của **Kiếm Chủ**, tiên thiên thần sinh ra từ khái niệm kiếm. **Rank: Prime. Class: Warrior.**

Lore và Rank không tự cấp Authority cho mọi Ability. Native Element, Base Deployment Cost và ngân sách chỉ số chưa được cung cấp; không suy ra từ khái niệm kiếm.

## 2. Passive — The Sword Precedes All Law / Kiếm Tiên Ư Vạn Pháp

Mọi Damage thuộc phạm vi Natural Action của Nhận Sơ theo nội tại được chuyển thành **TRUE Damage**. Phạm vi direct Effect/child Action/triggered Damage cần chốt ở §7; cùng rootActionId không đủ chứng minh một Effect thuộc phạm vi đó.

Nhận Sơ tự Heal bằng **50%** lượng True Damage hợp lệ do Natural Action gây ra **từ chính nội tại này**. Đây là Heal vào bản thân, không phải hồi cho đồng minh. Cơ sở Damage và checkpoint tổng hợp/Heal còn cần chốt; không tự lấy nominal formula thay committed result hoặc mặc định nhiều Heal theo từng target.

Overheal từ Heal của nội tại được đổi sang Shield cho Nhận Sơ: **1% MaxHP tương ứng Overheal → 0,5% MaxHP tương ứng Shield**. Trên cùng cơ sở MaxHP dương, tỉ lệ số học là `Shield = 0.50 × Overheal`. Đây là chuyển đổi từ kết quả Heal riêng, không lấy `requestedHeal - actualRestore` bằng live HP để tái dựng kết quả. Quy tắc lượng tử/làm tròn, contribution/cap/lifetime còn ở §7.

**Mâu thuẫn trong ví dụ raw:** ở `HP100/MaxHP150`, Damage70 với hệ số Heal50% chỉ yêu cầu Heal35, lên HP135 và Overheal0. Muốn Heal70, Overheal20 và Shield10 thì Damage hợp lệ phải là140, nếu không có modifier khác. Giữ nguyên ví dụ raw làm provenance; không dùng nó để đổi hệ số đã viết50% thành100%.

TRUE Damage dùng đúng Damage Contract hiện hành: bypass ARM/RES và Final Damage Reduction; **không tự bypass Shield**, không mặc định Guaranteed Hit, Execute hay miễn mọi admission/lifecycle rule.

## 3. Thần Tính

Không nhận **Buff, Debuff hoặc Mark từ mọi nguồn bên ngoài** có Authority **Quy Tắc hoặc thấp hơn**. Scope bao gồm nguồn ngoài từ cả đồng minh lẫn kẻ thù; quan hệ phe không biến một Buff ngoài thành self-authored Effect.

Không mở rộng scope thành chặn mọi beneficial/harmful/neutral Effect chỉ vì một Character khác có Thần Tính rộng hơn. Direct Damage, Heal và Shield không tự bị chặn vì tên của chúng; effect classification và phạm vi cụ thể vẫn phải được xét. Cơ chế tự Heal/tạo Shield đã nêu của Nhận Sơ không bị loại vì là Buff ngoài.

Thần Tính là Axiom identity/protection theo canon chung; không làm Basic/Skill/Ultimate tự mang Axiom Authority, cũng không chứng minh miễn dịch với Buff/Debuff/Mark cấp Axiom.

## 4. Basic và Damage Skills

| Ability | Target pattern | Damage theo raw | AE |
| --- | --- | --- | --- |
| Basic | Một mục tiêu địch | `100% WIL + 100% ATK`, True Damage từ nội tại khi hợp lệ | Theo Cost Basic chung; không tự thêm Cost riêng |
| Skill1 — Four Directions, One Edge / Tứ Phương Nhất Nhận | Enemy Slots **8/2/4/6** | Mỗi kẻ: `135% WIL + 150% ATK`, True Damage từ nội tại | **15** |
| Skill2 — Sever Heaven / Đoạn Thiên | Enemy Slots **2/5/8**, bất kể Nhận Sơ ở đâu | Mỗi kẻ: `160% WIL + 180% ATK`, True Damage từ nội tại | **25** |

Mọi stat trong bảng là stat của Nhận Sơ. “160% WIL và 180% ATK” là hai phần của công thức; không tự bỏ một phần hoặc nhân hai phần với nhau.

Skill1 đứng tại chỗ; Skill2 chém dọc tạo kiếm khí khổng lồ. Không thêm movement cho actor từ mô tả kiếm khí/VFX. Target patterns được giữ đúng các tọa độ đã chỉ định, không chuyển Skill2 sang cột đối diện theo vị trí actor.

Attack binding chưa có exception riêng: áp dụng default **POSITION/SLOT** hiện hành của TGT-008 ở đúng attack owner. Không đuổi theo Entity rời ô, không suy Guaranteed Hit từ fixed AoE. Default Slot binding không tự cung cấp occupant-read checkpoint, empty/invalid policy hoặc source snapshot; các quyết định này cùng hit-count/grouping còn cần chốt ở §7. Thứ tự liệt kê ô không tạo gameplay priority.

## 5. Skill3 — No Interval Between Death and Rebirth / Sinh Tử Vô Gian

**Một Natural Action; AE30.** Nhận Sơ rút kiếm rồi thu kiếm, chém khoảng cách giữa hàng chờ Luân Hồi và Luân Hồi của Chân Ngã **phe kẻ thù**.

Tất cả enemy Chân Ngã còn trong **Reincarnation Waiting Window** lập tức vào **Reincarnation**. Allied waiting Chân Ngã không bị tác dụng này ảnh hưởng. Không chọn người đang sống, không tự mở lại record đã Revive/Reincarnated/closed. Không có giới hạn số lượng enemy waiting trong mô tả.

**Enter Reincarnation ≠ Erasure ≠ Revive ≠ Routing ≠ materialization.** Sau successful entry, ordinary Revive không còn truy hồi được Chân Ngã đó theo REC-005. Skill không khai báo Damage/Execute, không thêm DEATH_CONFIRMED, không chọn host/definition/phe mới và không tự materialize một đời mới. Luật Routing/Rebirth riêng vẫn áp dụng nếu đủ điều kiện.

Authority, target-pool checkpoint, batch/observer boundary và hành vi khi pool rỗng còn ở §7. Không suy Authority từ Prime, lore thần hoặc Thần Tính.

## 6. Ultimate — One Sword Defines Heaven and Earth / Nhất Kiếm Định Thiên Địa

Cast **Skill1 và Skill2 cùng lúc**, **không tốn AE** theo mô tả. Phải giữ cả hai target patterns và coefficients; không thay bằng một Skill damage mới làm mất hai phần gốc.

Hai patterns giao tại **Slots2 và8**. Mô tả chưa chốt inline root Effects hay hai real Skill child Actions, cách xử lý hai hit trên cùng recipient và quyền hưởng Natural-Action Passive. Không tự coi child là Natural hoặc dùng same-root để cấp nội tại.

Không suy rằng miễn AE đồng nghĩa miễn mọi resource, cooldown/readiness hoặc Rage Cost của root Ultimate. Các quy tắc chung đó được giữ ở owner tương ứng khi không có exception được designer xác nhận.

## 7. UNRESOLVED — quyết định nội bộ cần designer chốt

Các nhóm dưới đây ảnh hưởng trực tiếp tới kết quả kit. Chúng chặn **executable normalization của phần phụ thuộc**, không chặn lưu raw kit/phần đã khóa. Đề xuất là câu hỏi, **chưa được chấp thuận**.

1. **Damage basis và Heal timing.** Đề xuất `D = tổng committed Actual HP Damage` của toàn bộ Damage hợp lệ trong một Natural Action, bỏ Shield absorption/overkill; một Heal `0.50D` sau Damage + mandatory lifecycle và trước ordinary Counter/Reaction. Cần xác nhận ví dụ đúng là Damage140 → Heal70 → Overheal20 → Shield10 ở HP100/150.
2. **Ultimate identity/completion.** Đề xuất hai nhóm Damage là own-direct Effects của cùng một Natural Ultimate, chung snapshot và simultaneous commit; Slots2/8 nhận hai hit, cùng basis của một Heal nội tại. Alternative hai real Skill children cần explicit child/outcome/Passive scope, không mặc định từ lineage.
3. **Natural-Action provenance và non-Natural Damage.** Đề xuất chỉ own-direct Damage của Nhận Sơ trong Natural Action, loại Follow-up/Counter/Reaction/DoT và unrelated triggered Effects dù cùng root. Ngoài phạm vi đó, đề xuất Damage gốc là PHYSICAL từ ATK + WILL từ WIL; designer chưa khóa type gốc này.
4. **Shield profile.** Đề xuất chuyển đổi liên tục50%, không floor theo đơn vị1% MaxHP; mỗi positive conversion thêm một Standard Shield contribution mới, không replace khiên cũ, không cap riêng/clock riêng, kết thúc do depletion/removal/actual leave cleanup với đúng terminal cause. Chưa được tự gán profile này.
5. **Skill3 Authority và settlement.** Cấp Authority chưa có. Đề xuất sau Cost commit snapshot toàn bộ enemy record còn WAITING, force-enter cùng một batch trước observer/Revive, không synthetic death/route mới; pool rỗng vẫn hoàn tất Action và trả30 AE. Phải chốt rule xung đột theo Authority hiện hành khi external clause thực sự conflict.
6. **Damage snapshot/hits/grouping/recipient.** Đề xuất Basic/Skill1/Skill2 snapshot ATK/WIL sau Cost, mỗi target nhận một hit gồm tổng hai hệ số; mỗi Skill AoE resolve một simultaneous batch. Sau declared pre-Damage movement/dodge, đọc current legal occupants của các Slot đã khóa, freeze qua batch commit; Basic ô rỗng MISS, AoE ô rỗng OMIT, invalid recipient DROP_LOCAL, không retarget. Không lấy thứ tự ô làm thứ tự hit/commit. Các profile này cần được xác nhận ở đúng attack owner; Ultimate dùng cùng recipient checkpoint cho cả hai nhóm nếu proposal §7.2 được chốt.

## 8. UNRESOLVED / NOT BLOCKING

Native Element, Base Deployment Cost, numeric budget và các adapter cho Mode chưa mô tả không chặn các khóa gameplay ở trên. Không suy Rank multiplier/Element/Damage type/cooldown riêng từ lore. Một external-content conflict mới phải được kiểm tra khi gặp, không biến thành miễn dịch hoặc global priority mặc định.
