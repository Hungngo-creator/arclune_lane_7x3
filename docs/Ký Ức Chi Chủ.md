# HOÁ THÂN KÝ ỨC CHI CHỦ
## Prime / Mage — Chuẩn hóa Legacy Kit

**Rank:** Prime. **Class:** Mage. **Element:** chưa gắn cố định; Effective Element về sau có thể do build/Công Pháp quyết định. **Axiom:** Thần Tính. **Authority chính:** Quy Tắc.

"
"## Lục Cực Đồ
**DMG 5/5 | SUR 5/5 | CTL 5/5 | CMP 5/5 | MIC 5/5 | VIS 2/5.** DMG 5 vì Ultimate 200% toàn sân, Skill 2 echo 50% Actual HP Damage dưới dạng True Damage, và stat snapshot xuyên death có thể được nâng bởi support trước khi chết. SUR 5 vì tối đa 3 revive và lần revive thứ ba có Lãng Quên loại khỏi target selection. CTL 5 vì Skill 1 quên Active Skill/Ultimate, Skill 3 khóa Skill/Ultimate của 3 enemy, Lãng Quên loại actor khỏi target resolver. CMP/MIC 5 vì chạm Death, Revive, snapshot, Turn Boundary, Natural Action, target selection, AOE resolution, Authority và Axiom. VIS 2 vì player phải hiểu life state, snapshot và Forgotten presentation.

"
"## 1. Identity và Snapshot
**trueSelfId giữ nguyên, lifeSerial tăng khi revive.** Snapshot stat lấy từ state cuối cùng ngay trước death; không copy Buff/Debuff/Mark object, cooldown hoặc duration object. Chỉ giá trị stat cuối cùng sau modifier được ghi thành nền của life tiếp theo. Ví dụ Base Max HP 100 → Buff +50% → Max HP lúc chết 150 → Revive 1 Max HP 150, Current HP 45/150; buff +50% cũ không tồn tại nhưng 150 trở thành nền mới. Đây là memory snapshot, không phải tái áp buff. Cơ chế này tạo interaction hai chiều: support buff trước death có giá trị thật ở đời sau; enemy debuff trước death có thể làm đời sau yếu hơn.

"
"## 2. Nội tại — Ngã Tự Bất Vong
Khi **DEATH_CONFIRMED**, nhân vật mở cửa sổ tái sinh và revive tối đa 3 lần/trận. Mỗi lần revive lấy 100% Max HP, ATK, WIL, ARM, RES và HP Regen từ trạng thái snapshot lúc tử vong trước; resources, cooldown, Buff/Debuff/Mark object và temporary state không tự động sao chép nếu không có rule riêng. Current HP khi materialize: lần 1 = 30% Max HP snapshot, lần 2 = 45%, lần 3 = 60%; đây là Current HP, không phải Heal. Sau revive lần 3, death tiếp theo không revive lần 4.

"
"Thời gian revive legacy: **2 lượt tính theo slot/turn của ô nơi hắn chết**, bất kể ô đó có unit đứng hay không. Đây cần được formalize trong SSI thành một counter độc lập với occupancy; không để unit đứng ở slot làm đổi thời gian.

"
"## 3. Lãng Quên
Sau mỗi revive, trong 1 Natural Action của chính hắn có state Lãng Quên; lần 1/2 player và NPC enemy vẫn thấy hắn, lần 3 hắn biến mất khỏi tầm mắt/player enemy trong cửa sổ này. Lãng Quên **không phải external Buff/Debuff/Mark**. Trong Forgotten: không thể được target; không vào random target pool; AI địch bỏ qua; enemy UI không hiển thị vị trí/HP bar/effect; hắn vẫn có thể action và gây damage; slot occupancy vẫn tồn tại. **Target Selection ≠ Area Resolution:** random/single-target không chọn hắn; fixed AoE, full-board AoE, column/row AoE hoặc radius đã tạo từ unit khác vẫn có thể trúng nếu vị trí hắn nằm trong vùng. Không được để gameplay kernel phụ thuộc visibility/UI. Lần 3 chỉ ẩn presentation và loại khỏi target resolver, không phải damage immunity.

"
"## 4. Thần Tính — Axiom
Thần Tính ngăn external **status/effect**: Buff, Debuff, Mark và các external effect có lợi/hại/trung tính thuộc scope của Thần Tính, kể cả từ đồng minh. **Thần Tính không tự động ngăn direct Damage.** Damage vẫn resolve theo Damage Contract. Thần Tính cũng không xóa stat history đã snapshot; nếu external modifier đã thay đổi stat trước death thì state cuối cùng có thể được ghi nhớ và trở thành stat nền của life sau. Thần Tính không khiến toàn bộ skill của character thành Axiom.

"
"## 5. Skill 1 — Quên Lãng Kỹ Năng
**Cost 25 AE | Authority Quy Tắc | CD 2 Natural Actions của caster.** Các auto Skill 2/3 không giảm CD. Khi kích hoạt, chọn ngẫu nhiên tối đa 3 enemy khác nhau. Với từng target chọn ngẫu nhiên 1 **Active Skill hoặc Ultimate** đang tồn tại; không chọn Passive/Basic. Nếu target không có skill hợp lệ thì không tiêu hao target slot và tìm target hợp lệ khác nếu còn. Target quên skill trong **Natural Action kế tiếp của chính target**; trong action đó skill bị quên không thể dùng dù hết CD/đầy Rage, sau action trạng thái hết. CC làm mất lượt vẫn tiêu hao natural turn theo SSI; Forget không kéo dài vô hạn. Conflict: chọn target → chọn skill → kiểm tra anti-forget → chỉ khi có direct conflict mới phán định Authority/Tag; nếu không có conflict, Quy Tắc chắc chắn thành công. Các auto Skill 2/3 không tính là hành động giảm CD.

"
"## 6. Skill 2 — Đau Đớn Hồi Tưởng
**Auto/Reaction | Authority Pháp Tắc | cost 30 AE mỗi trigger | không dùng thủ công | không target enemy Leader.** Sau khi **một Damage Action của đồng minh hoàn toàn kết thúc**, tổng hợp Actual HP Damage từng enemy mất từ chính action đó. Target hợp lệ nếu không phải Leader và mất ≥30% Max HP trong action. Nếu có ít nhất một target hợp lệ và đủ 30 AE, Skill 2 trigger **đúng một lần cho toàn action**. Multihit 10 hit không tạo 10 trigger; AoE trúng 5 target vẫn chỉ trả 30 AE một lần. Mỗi target hợp lệ nhận echo riêng = **50% Actual HP Damage** mà đồng minh gây lên target, dưới dạng True Damage. Không sao chép Debuff, Mark, Control, Buff, Lifesteal, Follow-up identity hay secondary effects. Không tính Shield damage hoặc overkill. **DEATH_CONFIRMED trước Skill 2 resolve → target không còn valid target**, nên không nhận echo. Damage của Skill 2 không tự kích hoạt lại Skill 2, không tạo AE, không tạo turn, không giảm CD Skill 1 và không phải damage “do đồng minh”.

"
"## 7. Skill 3 — Tái Diễn Ký Ức
**Auto/Reaction | cost 15 AE | CD 2 Natural Actions của caster | không dùng thủ công.** Chỉ ghi nhận chuỗi gồm **3 Natural Actions liên tiếp của phe địch**, thuộc **3 enemy khác nhau**, và cả ba Natural Actions đều là Basic Attack chính. Hợp lệ: A Basic → B Basic → C Basic. Không hợp lệ: A → B → A. Không tính Follow-up, Counter, Reaction, Summon attack, Forced Basic, Extra Hit, Linked Cast, Basic ngoài natural turn. Một action khác phá chuỗi. Tới action thứ ba, nếu đủ 15 AE thì trigger; thiếu AE → không trigger và reset chuỗi. Sau trigger, ba target chỉ được dùng Basic Attack trong **2 Natural Actions tiếp theo của từng target**; Skill/Ultimate bị khóa, Rage không thể dùng để vượt khóa. Duration độc lập theo từng target; target chết không cần hoàn thành duration, target còn sống vẫn giữ lock đủ 2 Natural Actions. Trong CD, Skill 3 không ghi nhận chuỗi mới. Auto Skill 2/3 không tạo Natural Action, không tạo AE, không tăng Rage và không giảm CD Skill 1.

"
"## 8. Ultimate
AOE toàn sân = **200% ATK + 200% WIL**. Hoàn tất Damage Action rồi hồi **20% tổng Actual HP Damage** mà chính Ultimate gây lên enemy. Không tính Shield damage, overkill, Reflect hay damage từ source khác. Nếu heal vượt Max HP, overheal bị bỏ qua. Thần Tính không chuyển overheal thành immunity và cũng không tự tạo Shield; chỉ external kit phù hợp mới có thể chuyển overheal nếu thắng được authority/axiom contract tương ứng.

"
"## 9. Target Selection / Area Resolution contract
Trong Forgotten, actor bị filter khỏi Target Selection nhưng không bị xóa khỏi battlefield geometry. Vì vậy: random target không chọn; single target không chọn; full-board AoE vẫn trúng; fixed column/row AoE vẫn trúng nếu đúng vùng; radius AoE không thể lấy Forgotten làm tâm nhưng có thể trúng nếu tâm là actor khác và Forgotten nằm trong vùng. Đây là **target exclusion + presentation hiding**, không phải immunity.

"
"## 10. Duy Nhất
**Không có Axiom Duy Nhất.** Độ phức tạp của kit không phải lý do để cấp Duy Nhất. Duy Nhất chỉ nên xuất hiện nếu lore xác nhận chỉ một bản thể Ký Ức Chi Chủ có thể tồn tại tại một thời điểm. Thần Tính + Quy Tắc Lãng Quên đã đủ tạo identity. Nếu một presentation/combat definition mà nhân vật tạm thời mang có tag Duy Nhất riêng thì Duy Nhất của definition đó vẫn được phán định theo Axiom; điều đó không biến cả character thành Duy Nhất.

"
"## 11. Rank/Class
**Prime / Mage** là phù hợp. Prime vì có Thần Tính, Quy Tắc về Quên Lãng, memory snapshot xuyên death, nhiều revive và interaction sâu với death/identity. Mage vì core fantasy là thao túng ký ức/nhận thức bằng rule-level effects chứ không phải physical combat, ranged weapon, summon hay support healing thuần.

"
"## 12. Engine invariants
1) trueSelfId giữ nguyên, lifeSerial tăng khi revive. 2) Death Prevention xử lý trước DEATH_CONFIRMED. 3) DEATH_CONFIRMED trước Skill 2 → target không còn valid. 4) Snapshot stat là state cuối đời, không copy Buff/Debuff/Mark object. 5) Forgotten không phải external debuff trên enemy. 6) Forgotten actor vẫn occupancy slot. 7) Area Resolution không bị target exclusion hồi tố. 8) Skill 2 một trigger mỗi Damage Action. 9) Echo chỉ tái hiện damage quantity. 10) Echo không recursion vào Skill 2. 11) Skill 3 cần 3 enemy Basic Natural Actions liên tiếp của 3 unit khác nhau. 12) Skill 3 lock tính theo Natural Actions của từng target. 13) Skill 1 CD chỉ giảm bằng Natural Actions của caster. 14) Auto Skill 2/3 không tạo Natural Action. 15) Thần Tính chặn external status/effect, không mặc định chặn direct Damage. 16) Thần Tính không xóa stat history. 17) Character không có Duy Nhất. 18) Lục Cực Đồ và Engine Risk là hai hệ đánh giá riêng.

"
"## 13. Câu hỏi còn mở trước implementation
- “2 turn theo slot chết” được biểu diễn bằng counter SSI nào để không phụ thuộc occupancy?
- Revive lần 1/2 có Forgotten presentation state hay chỉ lần 3? Logic hiện tại: lần 3 mới ẩn hoàn toàn.
- Nếu target bị Forget rồi bị CC mất Natural Action, Forget kết thúc ở natural turn đó đúng không? Khuyến nghị có.
- Nếu target chưa DEATH_CONFIRMED khi Skill 2 tạo target list nhưng chết trong cùng resolution trước echo, death commit order phải được kernel chốt; canon đã đồng ý trường hợp **DEATH_CONFIRMED trước Skill 2 → không còn valid target**.
- Skill 3 khi một target chết: CD giữ đúng legacy “đếm sau khi target còn sống hoàn tất 2 Natural Actions” hay chuyển sang một clock cố định của caster? Bản hiện tại ưu tiên legacy.
- UI Forgotten: player cùng phe có thấy HP/vị trí không, hay chỉ enemy presentation bị ẩn? Gameplay state không phụ thuộc UI.
- Ultimate simultaneous damage phải lấy Actual HP Damage theo commit của action; overkill không tính vào heal.
- Nếu một external Prime có Thần Tính chịu Skill 2 True Damage trực tiếp, Thần Tính không chặn damage chỉ vì damage có nguồn ngoài; chỉ status/effect nằm trong scope Thần Tính bị chặn.

## 14. Identity thiết kế
Hoá Thân Ký Ức Chi Chủ không phải “character có 3 mạng”. Bản sắc là: **hắn không hồi sinh về cùng state; hắn nhớ lại chính mình từ state cuối cùng trước death.** Support có thể “viết” một bản thể mạnh hơn bằng buff trước death; enemy có thể “viết” bản thể yếu hơn bằng debuff/stat reduction trước death. Max HP/current HP và các stat đời sau là hậu quả được ký ức giữ lại, trong khi object Buff/Debuff/Mark và duration cũ biến mất. Lần revive thứ ba mở Lãng Quên: chính nhận thức của đối thủ không còn có thể target hắn, nhưng vùng damage đã tồn tại vẫn có thể chạm hắn. Core fantasy: **“Ta không hồi sinh. Ta chỉ nhớ lại hình dạng mình từng có.”**

## 15. Thoại
1. “Ta không hồi sinh. Ta chỉ nhớ lại hình dạng mình từng có.”
2. “Người sống nhớ người chết. Còn ta, người chết tự nhớ lấy chính mình.”
3. “Khi tất cả đều quên, ký ức của ta sẽ trở thành sự thật duy nhất.”
4. Revive lần 3: “Lần này, ngay cả cái nhìn của ngươi cũng không còn nhớ nổi ta.”
5. Ultimate: “Ta quyết định điều gì đã từng xảy ra.”
6. Skill 1: “Ngươi không bị cấm sử dụng nó. Ngươi chỉ không còn nhớ mình từng biết nó.” / “Ngươi từng biết cách dùng nó sao?”
7. Skill 2: “Đau đớn là thứ ký ức trung thực nhất.”
8. Skill 3: “Ba lần như một. Hãy tiếp tục đi.”
