# HOÁ THÂN KÝ ỨC CHI CHỦ, Memento
## Prime / Mage — Gameplay theo raw kit hiện hành

**Rank:** Prime. **Class:** Mage. **Element:** chưa gắn cố định; Effective Element về sau có thể do build/Công Pháp quyết định. **Axiom:** Thần Tính. **Authority:** nội tại Ngã Tự Bất Vong và Lãng Quên cấp Quy Tắc; Skill 1 và Skill 2 cấp Pháp Tắc. Thần Tính có Axiom riêng, không nâng toàn bộ kit lên Axiom. Raw kit không chốt riêng cấp Authority của Skill 3 hoặc Ultimate.

## Lục Cực Đồ
**DMG 5/5 | SUR 5/5 | CTL 5/5 | CMP 5/5 | MIC 5/5 | VIS 2/5.** DMG 5 vì Ultimate 200% toàn sân, Skill 2 echo 50% Actual HP Damage dưới dạng True Damage, và stat snapshot xuyên death có thể được nâng bởi support trước khi chết. SUR 5 vì tối đa 3 revive và Lãng Quên loại khỏi target selection sau cả ba lần; lần thứ ba còn ẩn nhân vật khỏi tầm nhìn đối thủ. CTL 5 vì Skill 1 quên Active Skill/Ultimate, Skill 3 khóa Skill/Ultimate của 3 enemy, Lãng Quên loại actor khỏi target resolver. CMP/MIC 5 vì chạm Death, Revive, snapshot, Natural Action, Slot Clock, target selection, AOE resolution, Authority và Axiom. VIS 2 vì player phải hiểu life state, snapshot và Forgotten presentation. Các điểm số này là đánh giá thiết kế, không phải cơ chế chiến đấu.

## 1. Identity và Snapshot
**trueSelfId giữ nguyên, lifeSerial tăng khi revive.** Snapshot lấy **Max HP, ATK, WIL, ARM, RES và HP Regen** từ trạng thái lúc tử vong ngay trước. Đây là 100% giá trị sau rank multiplier và sau những thay đổi chỉ số đã thực sự tác động, không scale rank thêm lần nữa. Chỉ sáu giá trị này trở thành nền chiến đấu mới của đời tiếp theo; **Max HP được snapshot, không phải Current HP**. Không copy Buff/Debuff/Mark object, cooldown hoặc duration object; thời hạn buff cũ không đi sang đời mới. Ví dụ Base Max HP 100 → Buff +50% → Max HP lúc chết 150 → Revive 1 Max HP 150, Current HP 45/150; buff +50% cũ không tồn tại nhưng 150 trở thành nền mới. Đây là memory snapshot, không phải tái áp buff. Support có thể “viết lại ký ức về bản thể” bằng buff trước death; enemy có thể làm nền đời sau yếu hơn bằng thay đổi chỉ số đã vượt qua miễn nhiễm/Authority và thực sự tác động trước death.

## 2. Nội tại — Ngã Tự Bất Vong
Khi **DEATH_CONFIRMED**, nhân vật mở cửa sổ tái sinh và revive tối đa 3 lần/trận. Mỗi lần revive lấy 100% Max HP, ATK, WIL, ARM, RES và HP Regen từ trạng thái snapshot lúc tử vong trước; resources, cooldown, Buff/Debuff/Mark object và temporary state không tự động sao chép nếu không có rule riêng. Current HP khi materialize: lần 1 = 30% Max HP snapshot, lần 2 = 45%, lần 3 = 60%; đây là Current HP, không phải Heal. Sau revive lần 3, death tiếp theo không revive lần 4.

Thời gian revive: **2 cơ hội Natural Action được scheduler tính cho ô nơi hắn chết**, bất kể ô đó trống hay có unit khác đứng. Mỗi lần đến cơ hội Natural Action của đúng ô đó, counter tăng 1; tới lần thứ hai thì phục sinh. Đây là clock của ô chết, độc lập với occupancy, không phải 2 hành động của unit đang đứng trong ô, 2 hành động của hắn khi chết hoặc 2 global Turn Boundaries bất kỳ. Gameplay này dùng khái niệm Slot Clock hiện có; Mode phải cung cấp checkpoint tương ứng khi chuẩn hóa dữ liệu thực thi.

## 3. Lãng Quên
Lãng Quên bắt đầu sau **mỗi lần phục sinh** và tồn tại qua **1 Natural Action cá nhân kế tiếp của chính hắn**, kết thúc sau lượt đó theo duration CLK-003. Trong cả ba lần: không thể chọn hắn làm mục tiêu bởi bất kỳ kit nào, dù gây sát thương hay không; hắn không xuất hiện trong random target pool và AI địch bỏ qua hắn khi chọn mục tiêu. Hắn vẫn có thể hành động, tấn công và chiếm vị trí trên sân. Lãng Quên là trạng thái đặc thù trên bản thân, **không gán Buff/Debuff/Mark lên kẻ thù**; việc enemy có miễn nhiễm debuff không tự chống được trạng thái này.

**Presentation đối với phe địch:** lần 1/2 player và NPC vẫn thấy nhân vật; lần 3 nhân vật biến mất khỏi tầm mắt của cả player và nhân vật địch trong game. Trong cửa sổ Lãng Quên, vị trí, HP bar, Buff/Debuff/Mark và chỉ báo hiệu ứng của hắn không hiển thị cho player địch. Player/AI có thể nhận biết hắn đang tấn công nhưng vẫn không thể chọn hắn làm target. Visibility không quyết định kết quả gameplay.

**Hiệu ứng đang có vẫn tác động bình thường.** Buff/Debuff/Mark/hiệu ứng và các chỉ số của hắn chỉ bị ẩn khỏi đối thủ, không thể dùng để chọn hắn làm target; Lãng Quên không tạm ngừng tác dụng, không xóa object hoặc chỉ số snapshot. Đây là nghĩa đã chốt của câu raw cũ “mất tác dụng”.

**Target Selection ≠ Area Resolution:** Lãng Quên loại hắn khỏi danh sách mục tiêu được chọn nhưng không xóa vị trí chiến đấu. AoE đã xác định vùng tác động vẫn có thể chạm hắn nếu hắn nằm trong vùng; sát thương và hiệu ứng sau đó còn phải qua các admission/miễn nhiễm riêng, bao gồm Thần Tính. Lãng Quên không tự cấp Damage Immunity.

## 4. Thần Tính — Axiom
Thần Tính có **Authority Axiom**, chặn **mọi hiệu ứng ngoài thuộc scope của nó**: Buff, Debuff, Mark và hiệu ứng có lợi/hại/trung tính, **kể cả buff từ đồng minh**. Viên Chúc không vượt được miễn nhiễm này bằng hiệu ứng xấu thông thường; nhận định về bảo vệ này cũng áp dụng cho các Prime có Thần Tính. **Thần Tính không tự động ngăn direct Damage** và không nâng các Skill khác của hắn lên Axiom. Chỉ khi điều khoản hiệu ứng trực tiếp mâu thuẫn với miễn nhiễm mới phán định Authority theo cơ chế hiện hành.

Thần Tính không xóa stat history đã snapshot. Chỉ modifier đã thực sự được áp dụng trước death mới có hậu quả được ghi thành nền đời sau; một modifier bị chặn không đóng góp vào snapshot. Ràng buộc Thần Tính Axiom đối với chuyển overheal thành Shield được ghi tại Ultimate.

Support vẫn có thể “viết lại ký ức về bản thể” **nếu điều khoản buff thắng được Thần Tính Axiom và thực sự áp dụng trước death**; enemy muốn ghi lại nền yếu hơn cũng phải vượt admission/miễn nhiễm tương ứng. Đây không phải ngoại lệ cho mọi buff có lợi. Scope này phù hợp STA-011 hiện hành, không yêu cầu thay đổi Contract chung.

## 5. Skill 1 — Quên Lãng Kỹ Năng
**Cost 25 AE | Authority Pháp Tắc | CD 2 Natural Actions của caster.** Khi kích hoạt, chọn ngẫu nhiên tối đa 3 enemy hợp lệ khác nhau trước. Với từng target chọn ngẫu nhiên 1 **Active Skill hoặc Ultimate** đang tồn tại; không chọn Passive/Basic. Một target chỉ quên một kỹ năng trong một lần cast. Target không có skill hợp lệ không tiêu hao lượt chọn; tìm target hợp lệ khác nếu còn. Target quên skill trong **Natural Action cá nhân kế tiếp của chính target**; trong lượt đó skill bị quên không thể dùng dù hết CD/đầy Rage, sau lượt trạng thái hết. CC làm mất cơ hội Natural Action vẫn tiêu hao duration theo CLK-003 hiện hành. Conflict: chọn target → chọn skill → kiểm tra cơ chế anti-forget → chỉ khi có mâu thuẫn trực tiếp mới phán định Authority; không có cơ chế chống lại thì Quên Lãng chắc chắn thành công. CD bắt đầu sau khi dùng Skill 1 và giảm theo 2 cơ hội Natural Action kế tiếp của caster theo CLK-004; auto Skill 2/3 không giảm CD. Mô tả này thay thế cấp Quy Tắc và câu cũ “chỉ quên ultimate”.

## 6. Skill 2 — Đau Đớn Hồi Tưởng
**Auto/Reaction | Authority Pháp Tắc | cost 30 AE mỗi trigger | không dùng thủ công | không target enemy Leader.** Sau khi **một Damage Action của đồng minh hoàn toàn kết thúc**, tổng hợp Actual HP Damage từng enemy mất từ chính action đó. Target hợp lệ nếu không phải Leader và mất ≥30% Max HP trong action. Nếu có ít nhất một target hợp lệ và team đủ 30 AE, Skill 2 trigger **đúng một lần cho toàn action**, trả 30 AE một lần; thiếu AE thì không kích hoạt. Multihit 10 hit không tạo 10 trigger; AoE trúng 5 target vẫn chỉ trả 30 AE một lần. Mỗi target hợp lệ nhận echo riêng = **50% Actual HP Damage** mà đồng minh gây lên target, dưới dạng True Damage. Đây là sát thương riêng của Skill 2 lên enemy, không gây gì lên đồng minh.

Actual HP Damage là HP thực sự mất sau ARM/RES và giảm sát thương; không tính phần Shield hấp thụ, overkill hoặc vật thể không có HP hợp lệ. Không sao chép Debuff, Mark, Control, Buff, Lifesteal hoặc hiệu ứng kèm theo đòn đồng minh. Ví dụ Max HP 1.000, đồng minh làm mất thật 400 HP → echo 200 True Damage. Khi các điều kiện sát thương tiếp theo cho phép, đòn gốc mất 30% / 50% / khoảng 66,67% Max HP cho echo danh nghĩa 15% / 25% / khoảng 33,33%; đây không phải công thức bỏ qua mọi rule nhận sát thương.

**DEATH_CONFIRMED trước Skill 2 resolve → target không còn valid target**, nên không nhận echo. Damage của Skill 2 không tự kích hoạt lại Skill 2, không được coi là damage của hành động đồng minh để tạo vòng lặp; quy tắc chung của auto Skill 2/3 nằm tại §7.

## 7. Skill 3 — Tái Diễn Ký Ức
**Auto/Reaction | cost 15 AE | CD 2 Natural Actions của caster | không dùng thủ công.** Chỉ ghi nhận **3 Natural Actions cá nhân liên tiếp trong chuỗi hành động của phe địch**, thuộc **3 enemy khác nhau**, cả ba đều chọn Basic Attack làm hành động chính. Hợp lệ: A Basic → B Basic → C Basic. Không hợp lệ: A → B → A. Hành động phe đồng minh xen giữa không phải một lượt trong chuỗi phe địch. Không tính Follow-up, Counter, Reaction, Linked Cast, đòn phụ, summon đánh thay, Basic ngoài lượt, extra turn hoặc Basic do chính Skill 3 cưỡng chế. Skill, Ultimate, chủ động phòng thủ/bỏ lượt hoặc hành động chính không phải Basic của phe địch làm reset chuỗi.

Tới hành động thứ ba, nếu đủ 15 AE thì Skill 3 kích hoạt một lần; thiếu AE → không kích hoạt và reset chuỗi, không giữ 3/3 để chờ AE. Ba target vừa tạo chuỗi chỉ được chọn Basic Attack trong **2 cơ hội Natural Action cá nhân tiếp theo của từng target**; không dùng Skill/Ultimate dù đầy Rage, không tiêu hao Rage và không khóa nội tại. Theo CLK-003, cơ hội bị CC tiêu hao vẫn tính duration. Mỗi mục tiêu còn sống giữ đủ duration riêng; một mục tiêu chết không rút ngắn khóa trên mục tiêu khác. Nếu cả ba sống và thực hiện được các lượt khóa, mỗi người có một Basic tạo chuỗi rồi hai Basic cưỡng chế.

**Skill 3 vào cooldown ngay khi kích hoạt thành công**, rồi giảm theo 2 cơ hội Natural Action kế tiếp của caster theo CLK-004. CD độc lập với duration của ba target, kể cả khi một target chết; không chờ các target còn sống đánh thường đủ hai lượt mới bắt đầu CD. Trong CD không ghi nhận hoặc lưu chuỗi mới. Basic bị cưỡng chế bởi Skill 3 không tạo chuỗi mới kể cả khi CD đã hết. Quy định này thay thế câu legacy trì hoãn CD khi có target chết.

**Quy tắc chung của auto Skill 2/3:** không thể kích hoạt thủ công, không tiêu hao/tạo lượt, không tạo AE, không tăng Rage, không giảm CD Skill 1 và không tính là hành động của Ký Ức Chi Chủ. Chúng không kích hoạt “sau khi hành động”, “khi đồng minh dùng skill” hoặc “khi dùng skill”, trừ ngoại lệ được hệ thống/kit ghi rõ. Cost AE của mỗi lần kích hoạt vẫn phải trả đủ.

## 8. Ultimate
AoE cố định **toàn sân = 200% ATK + 200% WIL của bản thân**. Dấu “WIL/ATK” trong raw cũ đã được designer chốt là cộng cả hai thành phần, không chọn một chỉ số thay cho chỉ số còn lại.

Hoàn tất Damage Action rồi tự hồi HP bằng **20% tổng Actual HP Damage do chính Ultimate gây lên các mục tiêu hợp lệ**. Không tính Shield absorption, overkill, damage lên vật thể không hợp lệ, Reflect hoặc damage phụ từ nguồn khác. Ví dụ Ultimate gây tổng Actual HP Damage 1.000 → lượng hồi tính từ damage là 200 HP, rồi áp dụng giới hạn/điều khoản hồi phục tương ứng. Không tính echo Skill 2 hay damage đồng minh vào tổng này.

HP vượt Max HP trở thành overheal và mặc định bị bỏ qua, không tự tạo Shield. Ngoại lệ đã chốt: kit của **nhân vật khác** có hiệu ứng chuyển overheal đồng minh sang Shield chỉ làm được nếu điều khoản tương ứng **thắng Thần Tính cấp Axiom của hắn**. Raw kit yêu cầu một Prime khác có lực chiến cao hơn để khả thi; lực chiến cao hơn riêng lẻ không thay thế kết quả phán định Authority hiện hành. Scope ngoại lệ này không cấp quyền tự động cho các buff đồng minh khác ở §4.

Ý niệm Ultimate: “Ta không hồi phục; đau đớn khiến chúng nghĩ về ta, ký ức về ta càng thêm sâu đậm, càng nghĩ thì càng ám ảnh.”

## 9. Target Selection / Area Resolution contract
Trong Forgotten, actor bị filter khỏi Target Selection nhưng không bị xóa khỏi battlefield geometry. Random AoE chọn ba enemy khác nhau không thể chọn hắn. AoE cố định toàn sân vẫn bao gồm hắn; AoE hàng/cột chỉ bao gồm hắn nếu đứng đúng vùng. AoE lấy unit làm tâm không thể chọn hắn làm tâm, nhưng vùng tạo từ một unit khác vẫn có thể bao gồm hắn. Ví dụ Skill 3/Ultimate của Đạo Mộng Dao dùng vùng cố định: nếu vùng Skill 3 không bao phủ hàng hắn đứng thì hắn không trúng. Việc không target được không tự chặn Damage hoặc bỏ qua Thần Tính khi Effect thật sự resolve vào vùng.

## 10. Duy Nhất
**Không có Axiom Duy Nhất.** Độ phức tạp của kit không phải lý do để cấp Duy Nhất. Duy Nhất chỉ nên xuất hiện nếu lore xác nhận chỉ một bản thể Ký Ức Chi Chủ có thể tồn tại tại một thời điểm. Thần Tính + Quy Tắc Lãng Quên đã đủ tạo identity. Nếu một presentation/combat definition mà nhân vật tạm thời mang có tag Duy Nhất riêng thì Duy Nhất của definition đó vẫn được phán định theo Axiom; điều đó không biến cả character thành Duy Nhất.

## 11. Rank/Class
**Prime / Mage** là phù hợp. Prime vì có Thần Tính, Quy Tắc về Quên Lãng, memory snapshot xuyên death, nhiều revive và interaction sâu với death/identity. Mage vì core fantasy là thao túng ký ức/nhận thức bằng rule-level effects chứ không phải physical combat, ranged weapon, summon hay support healing thuần.

## 12. Engine invariants
1. trueSelfId giữ nguyên, lifeSerial tăng sau special Revive; Death Prevention xử lý trước DEATH_CONFIRMED.
2. Snapshot đúng sáu giá trị chỉ số của lần death ngay trước; không copy object hiệu ứng/duration và không rank-scale hai lần. Current HP phục sinh là 30% / 45% / 60% Max HP snapshot, không phải Heal.
3. Clock chờ revive thuộc ô chết, không phụ thuộc unit đang chiếm ô.
4. Lãng Quên tồn tại sau cả ba revive, chỉ lần thứ ba ẩn nhân vật; không phải debuff trên enemy và không xóa occupancy.
5. Target Selection và Area Resolution độc lập; fixed AoE không được bỏ hắn chỉ vì không target được.
6. Skill 1 cấp Pháp Tắc, quên một Active Skill/Ultimate trên mỗi target riêng biệt; CD của caster tách khỏi duration của target.
7. Skill 2 một trigger/Cost mỗi Damage Action đồng minh, không target Leader, không echo target đã DEATH_CONFIRMED; chỉ lấy committed Actual HP Damage và không recursion.
8. Skill 3 đòi ba Basic Natural Actions chính liên tiếp của ba enemy khác nhau; khóa riêng từng target và vào CD caster ngay khi kích hoạt. Thiếu AE ở đòn thứ ba thì reset chuỗi.
9. Auto Skill 2/3 không tạo/tốn Natural Action, AE gain hoặc Rage, không giảm CD Skill 1 và không phát sinh action/skill-use trigger ngoài ngoại lệ tường minh.
10. Ultimate heal chỉ dùng own Actual HP Damage, không tính Shield absorption/overkill/damage khác; chuyển overheal thành Shield phải thắng scope Axiom tương ứng.
11. Thần Tính chặn mọi hiệu ứng ngoài có lợi/hại/trung tính trong scope, kể cả buff đồng minh; không tự chặn direct Damage hoặc xóa stat history. Chỉ modifier đã thực sự áp dụng mới được snapshot.
12. Không có Axiom Duy Nhất cho toàn nhân vật. Lục Cực Đồ và Engine Risk là hai hệ đánh giá riêng.

## 13. Các điểm chưa chốt và boundary normalization
Các điểm đã chốt không còn là câu hỏi: chờ revive theo ô chết và không phụ thuộc occupancy; Lãng Quên sau cả ba revive/lần thứ ba mới ẩn nhân vật; duration cá nhân theo CLK-003; Skill 3 CD bắt đầu ngay và độc lập với khóa; target đã DEATH_CONFIRMED trước echo không nhận echo; heal Ultimate dùng own Actual HP Damage và loại overkill.

Các diễn giải đã được designer chốt: hiệu ứng trong Lãng Quên chỉ ẩn khỏi đối thủ, vẫn có tác dụng; Thần Tính chặn cả buff đồng minh và hiệu ứng ngoài có lợi/hại/trung tính; Ultimate cộng 200% ATK + 200% WIL. Không còn câu hỏi trên ba điểm này.

Các boundary chưa cung cấp dữ liệu thực thi: checkpoint Slot Clock tương ứng trong từng Mode, trình bày UI cho phe đồng minh, cấp Authority riêng của Skill 3/Ultimate và profile sát thương của hai thành phần Ultimate. Không tự cấp Authority từ Rank/Class. Chúng không chặn việc đồng bộ mô tả kit; tài liệu này không khẳng định đã hoàn tất một normalization mới của toàn bộ 00–08.

## 14. Identity thiết kế
Hoá Thân Ký Ức Chi Chủ nhớ lại chính mình từ state cuối cùng trước death. Support có thể “viết” một bản thể mạnh hơn bằng buff đã tác động trước death; enemy có thể “viết” bản thể yếu hơn bằng thay đổi chỉ số đã vượt qua miễn nhiễm/Authority. Max HP và các stat snapshot trở thành nền đời sau, Current HP được tính lại theo 30% / 45% / 60%, còn object Buff/Debuff/Mark và duration cũ không đi theo. **Sau cả ba lần revive, đối thủ không thể chọn hắn làm target; lần thứ ba còn xóa hắn khỏi tầm nhìn đối thủ.** Vùng AoE đã xác định vẫn có thể chạm hắn. Core fantasy: **“Ta không hồi sinh. Ta chỉ nhớ lại hình dạng mình từng có.”**

## 15. Thoại
1. “Ta không hồi sinh. Ta chỉ nhớ lại hình dạng mình từng có.”
2. “Người sống nhớ người chết. Còn ta, người chết tự nhớ lấy chính mình.”
3. “Khi tất cả đều quên, ký ức của ta sẽ trở thành sự thật duy nhất.”
4. Revive lần 3: “Lần này, ngay cả cái nhìn của ngươi cũng không còn nhớ nổi ta.”
5. Ultimate: “Ta quyết định điều gì đã từng xảy ra.”
6. Skill 1: “Ngươi không bị cấm sử dụng nó. Ngươi chỉ không còn nhớ mình từng biết nó.” / “Ngươi từng biết cách dùng nó sao?”
7. Skill 2: “Đau đớn là thứ ký ức trung thực nhất.”
8. Skill 3: “Ba lần như một. Hãy tiếp tục đi.”
