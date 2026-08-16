debuff và buff cũng có thể gắn tag pháp tắc, quy tắc và axiom.
Sát thương chuẩn là bỏ qua res cùng arm của kẻ địch.
Pháp Tắc/Quy Tắc/Axiom gọi chung là '3 tag ưu tiên'.
nếu 1 char có cùng loại buff nhưng khác tag ưu tiên hoặc 1 cái có 1 trong 3 tag ưu tiên còn 1 cái không có thì cần chia riêng dù tác dụng là chung, ví dụ char A có 2 buff excute (kết liễu kẻ thù dưới hoặc =10% mx hp khi gây dam lên chúng) nhưng 1 buff excute là có tag pháp tắc và 1 buff lại không có và lúc đó char B có pháp tắc cấm kết liễu đồng minh của hắn (tức kẻ thù của char A) lúc này cần áp dụng quy trình phán định xung đột tag (so rank, sao, awaken, tu vi, lực chiến này kia, thứ tự không nhớ rõ) và char A thắng thì hắn vẫn có thể kết liễu đồng minh của char B vì buff excute cấp pháp tắc của hắn thắng, nếu kết liễu thành công thì buff excute sẽ biến mất vì đã được sử dụng còn buff excute còn lại vì không có tag pháp tắc hoặc tag nào khác có ưu tiên cao hơn pháp tắc nên buff này không có tác dụng cho đến khi kit cấm kết liễu của char B hết hiệu lực (char B chết, kỹ năng cooldown, hết ae để duy trì,etc...).
mọi chỉ số: ở đây là đang nhắc đến các chỉ số được scale bởi rank multi, chỉ số không được scale bỏ qua, khi nhắc đến mọi chỉ số mặc định là giải thích này trừ phi mô tả/ngữ cảnh nhắc đến có mô tả đặc biệt thêm hoặc bớt thêm chỉ số nào đó đã có nhưng được hoặc không được scale bởi rank multi.

1) TU LA – ĐỘC CÔ HUYẾT, Class: Chiến Sĩ, thuộc element Huyết
1. ĐÁNH THƯỜNG: Huyết Trảm
Logic: Gây sát thương = 100% (ATK + WIL) lên 1 kẻ địch. Kích hoạt 1 lần stack cho Nội tại Huyết Chiến.
2. NỘI TẠI: Tu La, Tags: [Nội Tại], [Bản Thân], [Tuyệt Đối], [Buff/Debuff Vĩnh Viễn], [Quy Tắc: Cấm Hồi Sinh]. Logic: Cơ chế Scaling: Mỗi lần gây sát thương lên 1 mục tiêu (bất kể nguồn nào): Tăng +1% (ATK + WIL) vĩnh viễn. Giảm -0.5% (RES + ARM) vĩnh viễn. Giới hạn: Kích hoạt tối đa 1 lần/mục tiêu/turn và 9 lần/tổng cộng/turn. Không giới hạn số tầng (No Max Stack).
Cơ chế Tử Vong: Nếu nhân vật Chết và được Hồi sinh (bởi Skill 2 hoặc Quy Tắc): Tổng lượng chỉ số đã cộng từ nội tại này bị Giảm 50%.
Cơ chế Hồi Phục: Khi Giết 1 mục tiêu: Tăng +30% HP Regen (Dựa trên chỉ số hồi phục hiện có). Cộng dồn tối đa 7 tầng.
Quy Tắc Cấm: Nhân vật này KHÔNG THỂ được hồi sinh bởi các kỹ năng thông thường. Chỉ chấp nhận hồi sinh từ: Kỹ năng có tag [Quy Tắc] hoặc Skill 2: Niết Bàn Huyết Tế.
3. KỸ NĂNG 1: Bát Phương Diệt Tuyệt
Tags: [Chủ Động], [AOE: Toàn Sân], [Sát Thương Hỗn Hợp], [Tiêu Hao: HP], [Tiêu Hao: Aether], [Lập Tức]. Logic: Cost: 20 Aether + 5% HP hiện tại (Không giảm Max HP). Tác dụng: Gây sát thương Cố định = 75% (ATK + WIL) lên Toàn bộ kẻ địch.
Hệ quả (Trigger): Ngay sau khi tung chiêu, với mỗi kẻ địch trúng đòn (Max 9), nhân vật lập tức nhận stack Nội tại Huyết Chiến (Tối đa +9% ATK/WIL và -4.5% RES/ARM trong 1 hành động).
4. KỸ NĂNG 2: Niết Bàn Huyết Tế
Tags: [Nội Tại], [Tự Động], [Bản Thân], [Quy Tắc: Tái Sinh], [Debuff Vĩnh Viễn: Không Reset], [Tiêu Hao: Aether], [Tuyệt Đối].
Logic: Điều kiện: Kích hoạt ngay khi HP về 0. Hiệu ứng chết: Xóa toàn bộ Buff/Debuff thường. Reset các bộ đếm nội tại (trừ cái bị giảm 50%). Biến mất khỏi sàn đấu trong 3 Turn. Hiệu ứng Tái Sinh (Sau 3 Turn): Xuất hiện trở lại với 100% HP. Aether = 50% Max Aether. Nộ tích lũy (Rage) = 0.
Cái giá phải trả (Cost):
Tiêu hao 100% Aether hiện có tại thời điểm chết. Nhận Debuff: Vĩnh viễn Giảm 15% (RES + ARM). Debuff này KHÔNG RESET và cộng dồn vô hạn sau mỗi lần hồi sinh. Lưu ý: Skill này không thể bị vô hiệu hóa (Tag Tuyệt Đối).
5. KỸ NĂNG 3: Chiến Ý Bất Diệt
Tags: [Chủ Động], [Nội Tại: Kích hoạt], [Bản Thân], [Buff Vĩnh Viễn], [Tiêu Hao: Aether], [Tạo Khiên].
Logic:
Cost: 15 Aether (Chỉ tốn 1 lần kích hoạt duy nhất).
Cơ chế: Sau khi kích hoạt, trạng thái này tồn tại mãi mãi cho đến khi HP về 0. Cuối mỗi Turn hành động thành công: Tự tạo 1 lớp khiên = 5% Max HP và Hồi +2 Nộ. Lưu ý: Khi nhân vật chết và hồi sinh (qua Skill 2), trạng thái này bị mất và CẦN KÍCH HOẠT LẠI.
6. ULTIMATE: Sát Chiêu – Thiên Địa Chấn Động
Tags: [Tự Động], [Đơn Mục Tiêu], [AOE: Toàn Sân], [Sát Thương Hỗn Hợp], [VFX: Combo].
Logic: Giai đoạn 1 (Đơn mục tiêu): Lao đến mục tiêu -> Hất tung -> Gây sát thương = 100% (ATK + WIL) (Tính là 1 đòn đánh thường).
Giai đoạn 2 (AOE): Đập mục tiêu xuống đất -> Gây chấn động toàn sân.
Mục tiêu chính nhận thêm: 100% (ATK + WIL). (Tổng nhận 200%).
Các kẻ địch khác nhận: 100% (ATK + WIL).
Hất tung chỉ là mô tả/vfx, không phải hiệu ứng hay debuff.
Tương tác: Mỗi kẻ địch trúng đòn đều tính là 1 lần kích hoạt stack cho Nội tại Huyết Chiến.
GHI CHÚ KỸ THUẬT (Dành cho Logic System):
Xung đột Nội tại & Skill 1: Skill 1 là cách nhanh nhất để stack nội tại. Nếu sân có 9 địch, dùng Skill 1 xong là max stack của turn đó (9 stack). Các đòn đánh khác trong turn đó sẽ không cộng thêm stack nữa.
Xung đột Skill 2 & Hồi sinh: Skill 2 có tag [Quy Tắc: Tái Sinh], nó ghi đè lên tag [Quy Tắc: Cấm Hồi Sinh] của Nội tại. Các skill hồi sinh thường (ví dụ của Healer Rank N) không có tag [Quy Tắc] sẽ vô dụng với nhân vật này.
Quản lý chỉ số: Con này về late game RES và ARM sẽ âm vô cực (do nội tại giảm và skill 2 giảm). Nó sẽ cực kỳ giấy nhưng sát thương cực to (Glass Cannon đích thực).

2) [UR] HUYỀN VŨ – CHẤP MINH (Zhi Ming) Class: Tanker
1. ĐÁNH THƯỜNG: Trấn Thủy Kích, Tags: [Đơn Mục Tiêu], [Sát Thương Hỗn Hợp], [Thường].
Logic: Gây sát thương = 100% (ATK + WIL) lên 1 kẻ địch.
2. NỘI TẠI: Bắc Minh Hộ Thể, Tags: [Nội Tại], [Tự Động], [AOE: Hàng Dọc], [Tạo Khiên], [Buff: Hào Quang]. Logic:
   * Hiệu ứng 1 (Sau khi hành động):
     * Điều kiện: Kết thúc 1 Turn hành động thành công.
     * Mục tiêu: Bản thân + Đồng minh cùng hàng dọc (Theo Grid 3x3: 1-4-7, 2-5-8, hoặc 3-6-9).
     * Tác dụng: Tạo lớp khiên = 15% Max HP của Chấp Minh. (Duy trì 1 turn hoặc đến khi vỡ).
   * Hiệu ứng 2 (Hào Quang):
     * Điều kiện: Chấp Minh còn sống.
     * Mục tiêu: Bản thân + Đồng minh cùng hàng dọc.
     * Tác dụng: Giảm 35% mọi sát thương nhận vào từ nguồn [AOE] (Cả AOE Cố định & AOE Ngẫu nhiên).
3. KỸ NĂNG 1: Liên Kết Tứ Tượng
 * Tags: [Chủ Động], [Pháp Tắc: Kiên Định], [AOE: Vùng Chữ Thập], [Buff: Liên Kết], [Cơ Chế: Tích Lũy Sát Thương], [Sát Thương Tự Thân], [Lập Tức].
 * Logic:
   * Cost: 25 Aether.
   * Phạm vi (Targeting): 4 ô xung quanh bản thân (Trên, Dưới, Trái, Phải). Ví dụ đứng ô 5 -> Link ô 2, 4, 6, 8.
   * Hiệu ứng Liên Kết (Vĩnh viễn cho đến khi Chấp Minh chết):
     * Các đồng minh tại ô liên kết được: Giảm 30% mọi sát thương nhận vào.
Logic: Lượng giảm sát thương này BỎ QUA mọi chỉ số Xuyên Giáp (Penetration) hoặc Sát Thương Chuẩn (True Damage) thông thường của địch. Trừ khi địch dùng kỹ năng có tag [Quy Tắc], còn lại mọi sát thương đi qua liên kết này bắt buộc phải bị trừ 30%.
     * Quy tắc cộng dồn: Nếu đồng minh vừa nằm trong vùng Nội tại (Hàng dọc) vừa được Liên kết -> Giảm tổng cộng 65% AOE Dmg (35% + 30%).
   * Cơ chế Phản Phệ (Backlash):
     * Hệ thống sẽ tích lũy lượng sát thương đã được giảm trừ từ 4 đồng minh này. (Ví dụ: Địch đánh 100, Đồng minh chịu 70, Tích lũy 30).
     * Trigger: Khi Tổng Sát Thương Tích Lũy > 70% Max HP của Chấp Minh.
     * Hậu quả: Chấp Minh nhận sát thương = 70% lượng Tích Lũy.
     * Công thức tính dmg nhận: Dmg_Final = (Dmg_Tích_Lũy * 0.7) * (1 - 0.3) * (Hệ số giảm trừ qua ARM/RES).
       (Lưu ý: Đoạn "nhân 1-0.3" là tao giữ nguyên theo ý mày: "sau đó giảm 30% rồi lại giảm nhờ res và arm").
     * Sau khi gây sát thương phản phệ, thanh tích lũy reset về 0.
4. ULTIMATE: Quy Tắc – Bất Động Như Sơn, Tags: [Tự Động], [Hồi Phục], [Buff: Cường Hóa], [AOE: Toàn Sân].
 * Logic:
   * Tác dụng:
     * Lập tức Hồi phục 35% Max HP cho bản thân. Cường hóa bộ giáp: Tăng 50% ARM và RES trong 2 Turn.
     * Gây sát thương chấn động toàn sân = 100% wil/atk + 50% khiên bản thân đang có. (Chuyển hóa thủ thành công).
PHÂN TÍCH CÂN BẰNG (Balance Check):
 * Khả năng chịu đòn:
   * Giả sử Chấp Minh có 10.000 HP. Ngưỡng nổ là 7.000 dmg tích lũy.
   * Khi nổ, hắn chịu: 7000 * 0.7 = 4900 -> Giảm 30% = 3430 -> Giảm tiếp qua Giáp (giả sử 50%) = 1715 Dmg.
   * => Hắn gánh 7000 dmg cho team mà chỉ mất ~1700 HP. Cực kỳ trâu. Đây xứng đáng là Tanker Rank SSR/UR chủ lực.
 * Điểm yếu:
   * Sợ sát thương Đơn Mục Tiêu (Single Target) dồn vào bản thân. Vì Nội tại chỉ giảm AOE, còn Skill 1 giảm dmg cho đệ chứ không giảm cho bản thân (trừ khi nổ dmg phản phệ mới được giảm).
   * Nếu kẻ địch có skill "Bỏ qua Giáp/Xuyên thủ", cú nổ phản phệ sẽ rất đau.


Đại khái là sàn đấu thế này:
    /7/4/1/   \3\6\9\
  /8/5/2/       \2\5\8\
/9/6/3/           \1\4\7\

đánh theo thứ tự 1 đến 9, ô nào không có nhân vật đứng sẽ bỏ qua, nhưng là đánh luân phiên, ô 1 bên trái đánh trước vì phía này là sân của player, bên kia là AI hoặc sân của player khác theo góc nhìn của bản thân player, tức mọi player đều thấy sân của bản thân bên trái và của kẻ thù bên phải, đầu trận sẽ random xem phe nào đánh trước, mỗi phe đều có leader là nhân vật đại diện cho player/AI đứng ở ô 8 nên nếu leader hp về 0 trận đấu sẽ kết thúc ngay lập tức. Ví dụ phe đồng minh có nhân vật đứng ô 4/6/7/8, kẻ thù có nhân vật đứng ô 2/5/8 thì nếu đầu trận random phe kẻ thù đánh trước thì thứ tự đánh là ô 2 kẻ thù >4 đồng minh >5 kẻ thù> 6 đồng minh > 8 kẻ thù > 8 đồng minh > 2 kẻ thù rồi lặp lại nếu trong quá trình này không có thay đổi về quân số như nhân vật 2 bên chết hoặc player hay AI triệu hồi thêm nhân vật vào game. 

3) [N] Ngự Thú Sư Tập Sự – A Mộc
Nội tại: Tăng 10% HP, +5% atk cho Sói Xám triệu hồi ra.
Đánh thường: Quất roi. Gây 80% ATK.
Kỹ năng (20 Aether): Triệu hồi 1 con [Sói Xám] vào ô trống phía trước.
Chỉ số Sói Xám: HP = 30% HP A Mộc, ATK = 30% ATK A Mộc, thừa hưởng 50% res và arm từ A mộc Tự động tấn công kẻ địch gần nhất.
Ult (Auto): Hồi 50% HP cho Sói Xám và tăng cho nó 20% ATK trong 2 turn.

4) [N] Nghệ Nhân Rối – Ban Cơ
Nội tại: Khi Rối Gỗ bị phá hủy, Ban Cơ được hồi 10 Aether.
Đánh thường: Ném gỗ vụn. Gây 80% WIL.
Kỹ năng (25 Aether): Triệu hồi 1 [Rối Gỗ] vào ô trống bất kỳ phe mình.
Chỉ số Rối Gỗ: HP = 50% HP, 120% res/arm của Ban Cơ, ATK/wil = 0 (Chỉ dùng để chặn đòn/làm bao cát).
Ult (Auto): Sửa chữa Rối Gỗ, hồi đầy máu cho nó. Nếu không có Rối Gỗ, triệu hồi ngay lập tức 1 con mới.

5) [N] Quỷ Sai – Tiểu Hắc
Nội tại: Tiểu Quỷ triệu hồi ra khi đánh trúng địch sẽ làm giảm 5 Aether của địch.
Đánh thường: Phóng bùa. Gây 100% WIL + atk.
Kỹ năng (20 Aether): Triệu hồi 1 [Tiểu Quỷ] bay lơ lửng.
Chỉ số Tiểu Quỷ: HP thấp (35% HP chủ), ATK cao (50% WIL + atk chủ). Đánh xa.
Ult (Auto): Hy sinh Tiểu Quỷ (cho nổ tung). Gây sát thương = 150% WIL/atk của bản thân tiểu Hắc + 50% mx hp của tiểu quỷ (17,5% max hp của tiểu Hắc) lên 1 kẻ địch.

6) [N] Đệ Tử Ngoại Môn (Kiếm Sĩ)
Nội tại: Tăng 5% ATK khi đầy máu.
Đánh thường: Chém kiếm cơ bản. Gây 100% ATK + WIL.
Kỹ năng (15 Aether): Trảm Kích. Chém mạnh gây 130% ATK + WIL, tính là đánh thường.
Ult: Liên Hoàn Tam Kiếm. Chém 3 nhát liên tiếp vào 1 mục tiêu, mỗi nhát 95% ATK + WIL.
7) [N] Thiết Giáp Binh (Tanker)
Nội tại: Giảm 5% sát thương vật lý nhận vào.
Đánh thường: Đâm giáo. Gây 100% ATK + wil.
Kỹ năng (15 Aether): Giơ Khiên. Tự tạo khiên cho bản thân = 20% HP tối đa.
Ult: Bức Tường Sắt. Tăng 20% ARM cho bản thân và 1 đồng minh đứng sau lưng trong 2 turn. Tăng cho bản thân thêm 10% arm trong 2 turn.
8) [N] Hỏa Phù Sư (Mage)
Nội tại: Đòn đánh thường có 10% gây Bỏng nhẹ (Mất 2% HP/turn trong 2 turn).
Đánh thường: Ném bùa lửa. Gây 100% WIL + atk.
Kỹ năng 1 (20 Aether): Hỏa Cầu. Bắn cầu lửa gây 140% WIL + atk.
Ult: Bùng Nổ. Gây sát thương = 120% WIL+ atk lên 3 kẻ địch ngẫu nhiên.
9) [N] Thợ Săn Làng (Archer)
Nội tại: Tăng 10% Sát thương lên quái thú (Beast).
Đánh thường: Bắn tên. Gây 100% ATK + wil.
Kỹ năng (15 Aether): Nhắm Bắn. Tăng 20% Chính xác (PER) cho đòn đánh sau, rồi bắn gây 120% ATK + wil.
Ult: Mũi Tên Độc. Bắn gây 150% ATK + wil và gây Độc (Mất 5% HP/turn) trong 2 turn.
10) [N] Tiểu Thư Đồng (Support)
Nội tại: Vào sân tăng 5 Aether cho mỗi đồng minh đứng trên sân, tối đa 20 aether.
Đánh thường: Ném sách. Gây 80% WIL.
Kỹ năng (15 Aether): Cổ Vũ. Tăng 10% ATK + wil cho 1 đồng minh trong 2 turn.
Ult: Tiếp Sức. Hồi 25 Aether cho 1 đồng minh có Aether thấp nhất (trừ bản thân).
11) [N] Đạo Tặc (Assassin)
Nội tại: Tăng 15% Né tránh (AGI) khi máu dưới 50%.
Đánh thường: Đâm dao. Gây 100% ATK + wil.
Kỹ năng (15 Aether): Tay phải tán mặt kẻ địch, tay trái móc túi kẻ địch, Gây 100% ATK + wil và cướp 5 Aether của địch.
Ult: Đâm Lén. Dịch chuyển ra sau lưng địch (nếu trống), gây 200% ATK + wil.
12) [N] Dân Binh Cầm Cuốc (Warrior - Mixed)
Nội tại: vào trận hp max tăng 10%.
Đánh thường: Bổ cuốc. Gây 100% ATK + wil.
Kỹ năng (10 Aether): Đào Đất. Ném đất vào mắt địch, gây 100% ATK + 50% wil và giảm 10% PER của địch.
Ult: Cơn Giận Nông Dân. Tăng 30% ATK + 20% wil trong 2 turn nhưng giảm 20% ARM (Bỏ áo ra đánh).

13) [Prime] Vạn Yêu Chi Tổ – Hỗn Độn (Hundun) Class: Tanker
Nguồn gốc: Sơn Hải Kinh. Hung thú không mặt, sáu chân bốn cánh, đại diện cho sự hỗn loạn sơ khai. Trong Arclune, hắn là kẻ tu luyện Thôn Phệ Đại Đạo đến mức ăn cả không gian để lấp đầy cái bụng không đáy.
Nội tại — [Pháp Tắc] Hư Vô Thôn Phệ:
Hỗn Độn không có khái niệm né tránh (AGI = 0). Hắn nhận mọi đòn đánh vào mình.
Mỗi khi nhận sát thương, hắn hấp thụ 10% lượng sát thương đó và chuyển hóa vĩnh viễn thành Max HP (Không giới hạn). Hỗn Độn cần thời gian để thích ứng, res và arm hoạt động bình thường, vẫn có thanh HP, về 0 vẫn chết, hậu thiên thần, có thể hồi sinh, không có Thần Tính.
Khi tấn công, hắn gây thêm Sát thương chuẩn = 5% Max HP hiện tại của bản thân.
Tag: Nội tại, Pháp Tắc, Tiến hóa vĩnh viễn.
Đánh thường: Dùng cánh đập mạnh. Gây sát thương = 80% ATK + 80% WIL.
Hồi phục 2% HP tối đa cho bản thân.
Tag: Kẻ địch, Đơn mục tiêu, Hồi phục.
Kỹ năng 1 — Hỗn Loạn Trường (30 Aether):
Gầm lên một tiếng, làm méo mó không gian xung quanh. Gây sát thương = 150% ATK + 150% WIL lên toàn bộ kẻ địch.
Kẻ địch trúng đòn bị đảo lộn chỉ số: ATK và WIL của chúng bị tráo đổi cho nhau trong 2 turn. (Khắc chế bọn lệch tủ như thuần Kiếm hoặc thuần Phép). Tag: Kẻ địch, Aoe, Debuff đặc biệt. Tương tác với nội tại.
Ultimate — Quy Tắc: Sự Trở Về Của Hư Không (Auto-cast):
Hỗn Độn mở ra cái miệng (vốn không tồn tại) và nuốt chửng 1 kẻ địch (Ưu tiên kẻ địch có HP hiện tại thấp nhất).
Hiệu quả: Gây sát thương = 200% (ATK + WIL, tương tác với nội tại).
Tiến Hóa: Nếu kẻ địch chết, Hỗn Độn chiếm đoạt vĩnh viễn 20% toàn bộ chỉ số của kẻ đó cộng vào cho mình. Xác kẻ địch biến mất hoàn toàn, không thể hồi sinh.
Tag: Kẻ địch, Đơn mục tiêu, Quy Tắc, Tiến hóa.

14) [UR] Cửu Đỉnh: Tội Kiếm – Sát Sinh Hoàn (Sha Sheng Wan) Class: Kiếm sĩ
Nguồn gốc: Nhánh kiếm thuật bị cấm của Kiếm Thiên – Tu La Kiếm. Lấy cảm hứng từ Ta có một thân bị động kỹ (Kiếm tu điên cuồng). Hắn dùng máu kẻ thù để mài kiếm.
Nội tại — Huyết Hải Tu La:
Mỗi khi có một đơn vị (địch hoặc ta) chết, Sát Sinh Hoàn nhận 1 tầng [Sát Khí].
Mỗi tầng tăng 10% ATK + 5% wil và 10% Hút máu (Lifesteal). Tối đa 10 tầng.
Khi đạt đủ 10 tầng, hắn tiến vào trạng thái [Kiếm Ma]: Đòn đánh thường trở thành AOE (lan sang 2 bên).
Tag: Nội tại, Buff vĩnh viễn.
Đánh thường:
Chém kiếm đỏ lòm. Gây sát thương = 100% ATK + 50% WIL.
Tag: Kẻ địch, Đơn mục tiêu.
Kỹ năng 1 — Huyết Tế: Trảm Hồn (25 Aether):
Tiêu hao 10% HP hiện tại để tung ra nhát chém. Gây sát thương = 180% ATK + 100% WIL. Nếu đòn này giết chết mục tiêu, reset hồi chiêu ngay lập tức và hồi lại 20 Aether. Tag: Kẻ địch, Đơn mục tiêu, Reset CD.
Ultimate — Pháp Tắc: Luyện Ngục Kiếm Trận (Auto-cast):
Cắm kiếm xuống đất, biến sân đấu thành biển máu. Gây sát thương = 250% ATK + 150% WIL lên toàn bộ kẻ địch.
Áp dụng [Pháp Tắc: Cấm Chữa Trị] lên toàn bộ kẻ địch trong 2 turn (Mọi hiệu quả hồi máu lên địch đều bằng 0). Tag: Kẻ địch, Aoe, Pháp Tắc, Debuff.

15) [SSR] Thủy Quái – Tương Liễu (Xiang Liu) Class: Mage
Nguồn gốc: Sơn Hải Kinh. Quái vật rắn chín đầu, nhả ra nước độc hôi thối. Nơi nó đi qua hóa thành đầm lầy.
Nội tại — Đầm Lầy Chết:
Kẻ địch đứng trên sân chịu ảnh hưởng của khí độc. Mỗi đầu lượt của địch, chúng chịu sát thương = 30% WIL + 10% ATK của Tương Liễu.
Tag: Nội tại, Sát thương theo thời gian (Aura).
Đánh thường:
Phun nước độc. Gây sát thương = 80% WIL + 50% ATK. Áp dụng 1 tầng [Độc]. Tag: Kẻ địch, Đơn mục tiêu.
Kỹ năng 1 — Cửu Đầu Cuồng Vũ (30 Aether):
Chín cái đầu cùng tấn công 9 mục tiêu ngẫu nhiên (có thể trùng). Mỗi đòn gây 60% WIL + 30% ATK. Mỗi đòn trúng đích làm giảm 5% Kháng Phép (RES) của mục tiêu (Cộng dồn). Tag: Kẻ địch, Đa mục tiêu, Debuff.
Ultimate — Hồng Thủy Độc Tố (Auto-cast):
Tạo ra cơn đại hồng thủy độc hại. Gây sát thương = 200% WIL + 100% ATK lên toàn sân. Nếu kẻ địch đang bị [Độc], sát thương tăng thêm 50%. Tag: Kẻ địch, Aoe, Combo.
16) [SSR] Cửu Đỉnh: Quỷ Kiếm – Âm Hồn Bất Tán, Class: Assassin
Nguồn gốc: Nhánh Âm Kiếm (Shadow Sword). Kiếm sĩ này đã chết, nhưng chấp niệm quá lớn khiến linh hồn nhập vào thanh kiếm.
Nội tại — Thân Thể Hư Ảo:
Miễn nhiễm với sát thương Vật lý thông thường (Giảm 50% dmg nhận từ ATK). Nhưng nhận thêm 50% dmg từ sát thương Phép (WIL). Tag: Nội tại, Cơ chế phòng thủ.
Đánh thường:
Kiếm chém xuyên qua người. Gây sát thương = 100% ATK + 100% WIL. Đòn đánh bỏ qua 30% Giáp (ARM) của mục tiêu.
Tag: Kẻ địch, Đơn mục tiêu, Xuyên giáp.
Kỹ năng 1 — Đoạt Xá (25 Aether):
Lao vào người 1 kẻ địch, gây sát thương = 150% WIL + 50% ATK.
Kẻ địch bị [Hoảng Sợ] (Fear): Tự động tấn công đồng minh của chúng trong lượt kế tiếp bằng đánh thường. Tag: Kẻ địch, Khống chế.
Ultimate — Vạn Quỷ Phệ Hồn (Auto-cast):
Triệu hồi hàng vạn oan hồn từ thanh kiếm. Gây sát thương = 220% WIL + 100% ATK lên 1 mục tiêu.
Đây là Sát thương Chuẩn (True Damage) nếu mục tiêu có WIL thấp hơn Quỷ Kiếm.
Tag: Kẻ địch, Đơn mục tiêu, Tuyệt đối.

17) [SR] Xà Yêu – Ba Xà (Ba She)
Theme: Sơn Hải Kinh (Rắn nuốt voi). Tiến hóa phiên bản thấp.
Skill:
Đánh thường: Cắn (100% ATK + 100% WIL).
Kỹ năng (Nuốt Chửng - 25 Aether): Nuốt 1 kẻ địch vào bụng trong 1 turn (Khống chế cứng). Trong khi nuốt, Ba Xà không thể tấn công nhưng được tăng 50% DEF. Sau 1 turn nhả ra, gây 150% ATK. (Không nuốt được Boss).
Ult: Hóa thành rắn khổng lồ, đè bẹp hàng trước. Gây 180% ATK + 50% WIL.
18. [SR] Huyết Tu – Huyết Nha (Blood Crow)
Theme: Huyết đạo tu tiên.
Skill:
Đánh thường: Phóng lông vũ máu (100% WIL + 100% ATK). Hồi máu = 20% dmg gây ra.
Kỹ năng (Huyết Chú - 20 Aether): Nguyền rủa 1 kẻ địch. Khi kẻ đó hồi máu, Huyết Nha cũng được hồi ké 50% lượng máu đó.
Ult: Biến thành bầy quạ, tấn công ngẫu nhiên 5 lần. Mỗi lần 60% WIL + 40% ATK.
19) [SR] Ảnh Sát – Dạ Hành Giả
Theme: Hắc ám pháp tắc (nhập môn).
Skill:
Đánh thường: Đâm dao (100% ATK + 100% WIL). Tăng 10% Crit nếu mục tiêu đầy máu.
Kỹ năng (Lẩn Khuất - 15 Aether): Tàng hình (Stealth) trong 1 turn. Đòn đánh kế tiếp chắc chắn chí mạng.
Ult: Xuất hiện sau lưng kẻ địch thấp máu nhất, gây 250% ATK + 50% WIL. Nếu giết được địch, tàng hình tiếp.
20) [SR] Kiếm Nô – Tạp Vụ
Theme: Cửu Đỉnh Kiếm (Đệ tử tạp dịch mang kiếm hộp).
Skill:
Đánh thường: Ném kiếm cùn (100% ATK + wil).
Kỹ năng (Dưỡng Kiếm - Buff - 20 Aether): Lau kiếm cho đồng minh (Buff 20% ATK cho 1 đồng minh Kiếm Sĩ khác).
Ult: Mở hộp kiếm sau lưng, phóng ra 10 thanh kiếm sắt rỉ. Gây 120% ATK + 80% WIL lên 1 kẻ địch.
21) [SR] Mộc Tinh – Cổ Thụ (Support)
Theme: Sơn Hải Kinh (Cây thuốc thành tinh).
Skill:
Đánh thường: Quất rễ (100% ATK + 100% WIL).
Kỹ năng (Quả Sinh Mệnh - 20 Aether): Tạo ra 1 quả ở ô trống. Đồng minh nào đi vào ô đó (hoặc đứng sẵn) được hồi hp 30% HP của mộc tinh.
Ult: Rễ cây mọc khắp nơi. Trói chân (Root - Không thể di chuyển/đổi chỗ) toàn bộ kẻ địch và gây sát thương nhẹ (130% WIL + 140% ATK).

22) [SSR] Thiên Cơ Tử – Shell.ts (The Architect) Class: Summoner
drone chỉ là cơ chế, vfx mà không có chỉ số riêng.
Xuất thân: Nguyên là Đại Trưởng Lão của Thiên Cơ Môn, kẻ đầu tiên nhận ra cơ thể phàm trần bị giới hạn tốc độ tính toán. Hắn đã số hóa linh hồn mình, nạp vào một cỗ máy chủ lượng tử.
Nội tại — Đa Luồng: Ép Xung (Overclocking):
Mỗi khi Shell.ts kết thúc lượt, hắn triệu hồi 1 [Phi Kiếm Drone] (Tối đa 5 con).
Cơ chế [Quá Tải - Overheat]: Mỗi con Drone trên sân khiến Shell.ts chịu trạng thái [Nóng Máy]: Mỗi lượt mất 2% HP tối đa cho mỗi con Drone đang có. (Có 5 con = mất 10% HP/turn).
Nếu HP của Shell.ts xuống dưới 30%, toàn bộ Drone tự hủy, gây sát thương AOE. Tag: Nội tại, Triệu hồi, Tự gây sát thương (Self-Debuff).
Đánh thường: Bắn tia laser từ ngón tay. Gây sát thương = 100% WIL + 100% ATK, mỗi drone trên sân cũng sẽ tấn công cùng gây sát thương = 20% wil và atk của shell.ts, vfx là drone nhưng thực ra sát thương lấy chỉ số từ shell.ts. Tag: Kẻ địch, Đơn mục tiêu.
Kỹ năng 1 — Lệnh Biên Dịch: Tấn Công (25 Aether):
Ra lệnh cho toàn bộ [Phi Kiếm Drone] hiện có đồng loạt tấn công 1 mục tiêu.
Sát thương mỗi Drone = 40% WIL + 60% ATK của Shell.ts.
Sau khi tấn công, Shell.ts bị [Lag] (Giảm 20% SPD) trong 1 turn do tốn RAM xử lý lệnh.
Tag: Kẻ địch, Đơn mục tiêu, Dồn sát thương.
Kỹ năng 2 — Tản Nhiệt Cưỡng Bức (0 Aether):
Tiêu hủy 2 [Phi Kiếm Drone] để hồi phục hp = 25% max HP và xóa bỏ trạng thái [Lag]. Tăng 20% WIL trong 2 turn. Tag: Bản thân, Hồi phục, Buff.
Ultimate — Thiên Cơ: Mạng Lưới Hủy Diệt (Auto-cast): Kích hoạt hệ thống vệ tinh quỹ đạo. Gây sát thương = 150% WIL + 200% ATK lên toàn bộ kẻ địch.
Triệu hồi ngay lập tức 3 [Phi Kiếm Drone].
Gây hiệu ứng [Virus Số] lên toàn bộ kẻ địch trong 2 turn: Khi kẻ địch dùng kỹ năng, chúng chịu sát thương chuẩn = 50% WIL của Shell.ts. Tag: Kẻ địch, Aoe, Debuff, Triệu hồi.

23)[UR] Cửu Đỉnh: Mạc Vô Tình (Mo Wu Qing) Class: Kiếm Sĩ
Nguồn gốc: Nhánh kiếm bị nguyền rủa của Cửu Đỉnh, được tạo ra từ việc đúc kiếm bằng xương người thân. Hắn đại diện cho sự tàn nhẫn của Kiếm Đạo: "Muốn thành thần, phải diệt thân".
Nội tại — [Pháp Tắc] Thiên Địa Bất Nhân:
Hiệu ứng Xuất hiện (On Deploy): Ngay khi Vô Đạo được triệu hồi ra sân, hắn lập tức kích hoạt một vụ nổ kiếm khí. Gây sát thương = 200% (WIL + ATK) lên TOÀN BỘ nhân vật trên sân (Bao gồm cả Địch và Đồng minh, trừ bản thân hắn).
Lợi ích: Với mỗi nhân vật (bất kể địch hay ta) chết do vụ nổ này, người chơi được hồi lại 3 Cost trên thanh Cost Bar.
Tag: Nội tại, Pháp Tắc, Sát thương toàn sân (Friendly Fire).
Đánh thường:
Chém đơn giản. Gây sát thương = 100% (WIL + ATK).
Tag: Kẻ địch, Đơn mục tiêu.
Kỹ năng 1 — Sát Chiêu: Vạn Cốt Khô (25 Aether):
Triệu hồi hư ảnh của những kẻ hắn từng giết để tấn công. Gây sát thương = 150% (WIL + ATK) lên 3 kẻ địch ngẫu nhiên, gây thêm 5% sát thương chuẩn/ mỗi kẻ hắn giết từ nội tại.
Sau khi dùng chiêu, Giảm 5 Cost cho nhân vật kế tiếp mà bạn triệu hồi.
Tag: Kẻ địch, Aoe ngẫu nhiên, Hỗ trợ triệu hồi.
Ultimate — Sát Chiêu: Đoạn Trường Hà (Auto-cast):
Vung kiếm cắt đứt dòng chảy năng lượng. Gây sát thương = 250% (WIL + ATK) lên toàn bộ kẻ địch.
Áp dụng [Pháp Tắc: Tuyệt Linh]: Trong 3 giây thực tế (Real-time), phe địch không thể hồi Cost (hoặc Aether) và không thể triệu hồi thêm lính mới.
Tag: Kẻ địch, Aoe, Pháp Tắc, Khống chế tài nguyên.

24) [SSR] Phù Du Kiếm – Bạch Câu (Bai Ju)
lấy từ ý Bạch Câu Quá Khích - bóng câu qua cửa sổ, chỉ thời gian trôi nhanh hoặc "Phù Du" (sớm nở tối tàn).
Nội tại — Nhật Nguyệt Luân Chuyển:
Khi HP của Bạch Câu giảm xuống dưới 0 (Chết), hắn không chết ngay mà kích hoạt [Luân Hồi]:
Tự động đưa bản thân trở về trạng thái HP/Aether/Vị trí của đầu turn trước đó.
Nội tại này có thời gian hồi (Cooldown) là 40 giây. Tag: Nội tại, Hồi sinh/Quay ngược thời gian.
Đánh thường: Chém kiếm. Gây sát thương = 100% (WIL + ATK). Tag: Kẻ địch, Đơn mục tiêu.
Kỹ năng 1 — Trảm Tích (30 Aether):
Chém vào 1 kẻ địch. Gây sát thương = 150% (WIL + ATK).
Đồng thời [Reset] kẻ địch đó về trạng thái đầu turn (Nếu kẻ đó vừa được buff hay hồi máu trong turn này, mọi thứ sẽ biến mất như chưa từng xảy ra. Máu tụt lại, buff mất đi).
Tag: Kẻ địch, Đơn mục tiêu, Xóa hiệu ứng (Quy Tắc Nhỏ).
Ultimate — Sát Chiêu: Nhất Mộng Nam Kha (Auto-cast):
Tạo ra kết giới thời gian. Gây sát thương = 200% (WIL + ATK) lên toàn bộ kẻ địch.
Giảm thời gian hồi chiêu (Cooldown) của toàn bộ đồng minh đi 1 turn. Tag: Kẻ địch/Đồng minh, Aoe, Hỗ trợ.

25) [SSR] Hỏa Thi – Xích Viêm
Nội tại — Lò Nhiệt Hạn Hán:
Chỉ cần Hạn Bạt còn đứng trên sân, thanh Cost của người chơi sẽ tự động Tăng +1 Cost mỗi 2s (Ngoài tốc độ hồi mặc định).
Tuy nhiên, hắn tỏa ra [Hạn Khí]: Tất cả nhân vật đứng xung quanh hắn (1 ô bán kính, cả địch lẫn ta) chịu sát thương chuẩn = 5% HP tối đa của Hoả Thi mỗi turn.
Tag: Nội tại, Hồi Cost, Sát thương aura (Friendly Fire).
Đánh thường:
Đấm móc. Gây sát thương = 100% (WIL + ATK).
Tag: Kẻ địch, Đơn mục tiêu.
Kỹ năng 1 — Dung Nham Giáp (20 Aether):
Phun thi khí tạo thành lớp giáp. Tăng 40% ARM và RES cho bản thân trong 2 turn.
Trong thời gian này, sát thương phản đòn (Reflect) của hắn tăng lên 50%.
Tag: Bản thân, Buff.
Ultimate — Sát Chiêu: Hoả Ngục Xung Kích (Auto-cast):
Biến thành một cỗ xe bằng xương rực lửa lao càn quét sân đấu.
Hạn Bạt lao thẳng từ vị trí đang đứng đến cuối sân địch, gây sát thương = 200% (WIL + ATK) lên tất cả kẻ địch trên đường đi.
Mỗi kẻ địch bị húc trúng giúp người chơi hồi ngay lập tức 1 Cost.
Tag: Kẻ địch, Aoe hàng dọc, Hồi Cost.

26) [SSR] Khổ Tu Giả – Tàn Huyết (Can Xue)
Nội tại — Huyết Mạch Sôi Sục:
Huyết Cung không có Aether, cũng không hồi Aether. Thanh Aether của hắn luôn đầy (ảo), nhưng mọi kỹ năng đều tiêu tốn HP hiện tại.
Đòn đánh thường và Kỹ năng lẫn Ultimate của hắn gây Sát thương Chuẩn (True Damage) nếu HP của hắn dưới 50%. Tag: Nội tại, Cơ chế đặc biệt.
Đánh thường: Bắn tên máu. Gây sát thương = 100% (WIL + ATK). Tự mất 2% HP. Tag: Kẻ địch, Đơn mục tiêu, Tự tổn thương.
Kỹ năng 1 — Tự Tàn Sát Chiêu (Tiêu tốn 20% HP hiện tại):
Bắn một mũi tên cực lớn xuyên thấu tất cả kẻ địch trên 1 hàng dọc.
Gây sát thương = 200% (WIL + ATK).
Nếu đòn này giết chết ít nhất 1 kẻ địch, Huyết Cung được hồi phục hp = 10% HP tối đa. Tag: Kẻ địch, Aoe hàng ngang, Sát thương chuẩn (nếu thấp máu).
Ultimate — Huyết Vũ Mãn Thiên (Tiêu tốn 30% HP hiện tại - Auto-cast):
Nguyền rủa bầu trời, tạo mưa tên máu rơi xuống toàn sân (cả địch lẫn ta).
Gây sát thương = 250% (WIL + ATK) lên TOÀN BỘ sinh vật trên sân (trừ bản thân).
Kẻ địch trúng đòn bị dính debuff [Huyết Chú]: Nhận thêm 20% sát thương từ mọi nguồn trong 2 turn.
Đồng minh trúng đòn (nếu còn sống) được tăng 20% ATK (Kích thích huyết tính). Tag: Toàn sân, Aoe, Buff/Debuff (Friendly Fire).

27) [SSR] Lực Đạo – Bàn Sơn (Pan Shan) Tanker.
Nội tại — Pháp Tắc: Cự Lực:
Bàn Sơn không có chỉ số Né Tránh (AGI = 0).
Đổi lại, Tăng vĩnh viễn 40% ATK khi vào trận. Mọi đòn đánh của hắn đều có tag [Phá Giáp] (Bỏ qua 30% ARM của địch). Tag: Nội tại, Buff chỉ số.
Đánh thường: Đập mạnh cột đá lên mục tiêu. Gây sát thương = 100% (ATK + WIL). Tag: Kẻ địch, Đơn mục tiêu.
Kỹ năng 1 — Bạt Sơn Hề (30 Aether):
Vung vũ khí quét ngang. Gây sát thương = 200% (ATK + WIL) hàng dọc lên 2 kẻ địch, ví dụ ô 2/5 hoặc 6/9.
Tag: Kẻ địch, Aoe nhỏ, Sát thương cao.
Ultimate — Sát Chiêu: Lực Bạt Sơn Hà (Auto-cast):
Dồn toàn bộ sức mạnh cơ bắp cầm cột đá đập  1 mục tiêu.
Gây sát thương = 300% (ATK + WIL) lên 1 kẻ địch. Tự gây cho bản thân trạng thái [Kiệt Sức] (Giảm 35% ATK và SPD) trong 1 turn sau khi dùng chiêu. Tag: Kẻ địch, Đơn mục tiêu, Sát thương cực đại, Tự Debuff.

28)[SSR] Kim Cang – Bất Hoại (Indestructible) Tanker.
Nguồn gốc: Phật Môn/Tiên Hiệp cổ điển. Luyện da thịt thành vàng ròng.
Nội tại — Pháp Tắc: Phản Chấn:
Giảm 30% mọi sát thương nhận vào.
Mỗi khi nhận sát thương, phản lại kẻ tấn công 100% lượng sát thương thực nhận (Sau khi đã giảm trừ qua Giáp).
Tag: Nội tại, Pháp Tắc, Phản đòn.
Đánh thường: Đấm. Gây sát thương = 100% (ATK + WIL). Tag: Kẻ địch, Đơn mục tiêu.
Kỹ năng 1 — Kim Chung Tráo (20 Aether):
Tạo khiên cho bản thân = 35% HP Tối Đa.
Trong thời gian tồn tại khiên, sát thương phản đòn từ nội tại tăng lên gấp đôi (200%). Tag: Bản thân, Buff.
Ultimate — Sát Chiêu: Phật Nộ Kim Liên (Auto-cast):
Gồng mình phát nổ lớp giáp khí. Gây sát thương = 100% max hp/giáp đang có từ mọi nguồn/RES (Kháng Phép) của bản thân lên toàn bộ kẻ địch. (cả 3 đều 100%).
(Đây là con Tank gây dmg dựa trên độ trâu bò của nó, càng trâu nổ càng đau). Tag: Kẻ địch, Aoe, Scaling theo chỉ số thủ.

29)[SSR] Phần Tinh (Star Burner) mage
Nội tại — Huyết Tế Hỏa:
Mỗi khi dùng kỹ năng hoặc Ult, Phần Tinh tự tiêu hao 15% HP hiện tại. Đổi lại, Tăng 40% Sát thương cuối cùng cho kỹ năng/ult đó. Tag: Nội tại, Buff/Debuff.
Đánh thường: Ném cầu lửa. Gây sát thương = 100% (ATK + WIL). Tag: Kẻ địch, Đơn mục tiêu.
Kỹ năng 1 — Viêm Bạo (25 Aether):
Gây nổ tại vị trí 1 kẻ địch. Sát thương = 200% WIL. Tag: Kẻ địch, Đơn mục tiêu.
Ultimate — Sát Chiêu: Tinh Hỏa Liệu Nguyên (Auto-cast):
Triệu hồi bão lửa thiêu rụi toàn sân.
Gây sát thương = 300% (ATK + WIL) lên toàn bộ kẻ địch.
Nếu kẻ địch có HP dưới 30%, sát thương này chuyển thành Sát thương Chuẩn.
Tag: Kẻ địch, Aoe, Kết liễu.

30) [SSR] Huyết Đạo – Trảm Thủ (Beheader) Assassin.
Nội tại — Khát Máu:
Kẻ địch máu càng thấp, Trảm Thủ đánh càng đau. Tăng 1% Sát thương cho mỗi 2% HP mà kẻ địch đã mất. (Địch còn 10% máu -> Tăng 45% dmg). Tag: Nội tại, Scaling theo kẻ địch.
Đánh thường: Chém dao. Gây sát thương = 100% (ATK + WIL). Tag: Kẻ địch, Đơn mục tiêu.
Kỹ năng 1 — Huyết Ảnh Trảm (20 Aether):
Dịch chuyển ra sau lưng địch. Gây sát thương = 220% (ATK + WIL). Tag: Kẻ địch, Đơn mục tiêu.
Ultimate — Sát Chiêu: Tử Vong Phán Quyết (Auto-cast): Gây sát thương = 300% (ATK + WIL). Nếu đòn này kết liễu được kẻ địch, Trảm Thủ lập tức được Hồi 80% thanh Nộ và có thể dùng Ult tiếp vào turn sau nếu đầy nộ. Tag: Kẻ địch, Đơn mục tiêu.

31) [SSR] Thú Đạo – Cuồng Sư (Lion King) Summoner.
Nội tại — Nhân Thú Hợp Nhất:
Khi con đệ (Sư Tử) có mặt trên sân, Cuồng Sư và Sư Tử chia sẻ chỉ số cho nhau. Cả hai cùng được tăng 30% ATK và HP. Tag: Nội tại, Buff chỉ số.
Đánh thường: Quất roi. Gây 100% (ATK + WIL). Tag: Kẻ địch, Đơn mục tiêu.
Kỹ năng 1 — Triệu Hồi: Huyết Sư (40 Aether):
Gọi ra 1 con Huyết Sư (Rank SSR). Chỉ số Huyết Sư = 150% Chỉ số của Cuồng Sư. (Nó mạnh hơn cả chủ). Nó chỉ biết cắn thường (100% ATK) nhưng cắn rất đau vì stat to. Tag: Triệu hồi.
Ultimate — Sát Chiêu: Sư Tử Hống (Auto-cast): Cuồng Sư và Huyết Sư cùng gầm lên. Gây sát thương âm thanh = 200% WIL (Chủ) + 200% WIL (Đệ) lên toàn bộ kẻ địch. Tổng damage thực tế lên tới 400% nếu cả 2 cùng sống. Tag: Kẻ địch, Aoe, Combo.

32) [SSR] Trụ Đạo – Chiến Cổ (War Drummer) Support.
Nội tại — Tiếng Trống Trận: Toàn bộ đồng minh trên sân được tăng vĩnh viễn 15% ATK và 15% SPD chỉ cần Chiến Cổ còn sống. Tag: Nội tại, Aura Buff.
Đánh thường: Gõ dùi trống vào đầu địch. Gây 100% (ATK + WIL). Tag: Kẻ địch, Đơn mục tiêu.
Kỹ năng 1 — Huyết Chiến (0 Aether - Tốn HP):
Đánh đổi hp = 20% max HP của bản thân để Buff cho 1 đồng minh chủ lực.
Hồi 100% nộ cho 1 đồng minh (Đầy nộ ngay lập tức) Tag: Đồng minh, Hồi năng lượng, Tự tổn thương.
Ultimate — Sát Chiêu: Cương Khí Hộ Thể (Auto-cast): Không gây sát thương.
Tạo một lớp khiên cho Toàn Đội. Giá trị khiên = 250% WIL + atk của Chiến Cổ, cho phép cộng dồn khiên, cap 300% max hp của mục tiêu (tính mỗi khiên từ ult của nhân vật này, khiên từ nguồn không phải ult của nhân vật này sẽ được tính riêng theo kit nguồn của khiên đó), Tag: Đồng minh, Buff Khiên.

33) Hoá Thân của Thời Không Chi Chủ - Không Gian Chi Chủ, Prime. mage, không element tag.
mô tả: Thời Không nhất thể, vì sức mạnh quá lớn nên Hắn phải tách ra làm 2 để giáng lâm Arclune - Ảnh Giới, dù chỉ là 1 sợi ý niệm của hắn bị chia làm 2 nhưng vẫn có bản chất áp đảo.

nội tại: Thần Tính: không nhận buff hay debuff/mark, mọi trạng thái có lợi lẫn hại ngoài bản thân (trừ Thời Gian Chi Chủ), không thể hồi sinh khi hp về 0 trừ hồi sinh = kit của char này hoặc Thời Gian Chi Chủ.
sau mỗi 2 turn tự dung nhập vào không gian, hồi hp = 20% max hp. ( nói chung sau 2 turn tự hồi 20% max hp, dung nhập vào không gian chỉ là vfx). quy tắc.

Kỹ năng 1: Xáo trộn vị trí của 3 kẻ thù ngẫu nhiên trên sân 1 cách ngẫu nhiên không cố định (không target leader địch), trộn vĩnh viễn cho đến khi đối phương chết, về deck hoặc bị xáo trộn lần nữa bởi kỹ năng này hoặc 1 kỹ năng không gian khác. 25 aether. Quy Tắc.
kỹ năng 2: tạo ra 'Hư Không Màn Che' ngay 3 ô giao giới giữa 2 bên sân, (ô 1/2/3 của mỗi phe có 3 ô trống, chỉ là vfx) bất kỳ đòn aoe nào gây sát thương lên đồng minh từ kẻ thù đều giảm 60% sát thương cuối, đổi lại aoe từ đồng minh tấn công lên kẻ thù + 60% sát thương cuối cùng gây ra. tác dụng trong 4 turn, 40 aether. CD 2 turn. quy tắc.
kỹ năng 3: gây sát thương aoe lên 4 kẻ địch ngẫu nhiên = 1 đòn đánh thường/ mỗi kẻ địch, bỏ qua 80% res của chúng, tính là đánh thường, 20 aether.
ultimate: cast 2 lần skill 3 nhưng không trừ ae.

34) Hoá Thân của Thời Không Chi Chủ - Thời Gian Chi Chủ, Prime.
mô tả: 1 nửa ý niệm của Thời Không Chi Chủ giáng lâm thế gian.
nội tại: khi có Hư Không Chi Chủ là đồng minh trên sân + 20% mọi chỉ số cho cả bản thân và Hư Không Chi Chủ.
Thần Tính: không nhận buff hay debuff ngoài bản thân (trừ Không Gian Chi Chủ), không thể hồi sinh.
bất kể nhận bao nhiêu sát thương/1 lần thì hắn sẽ luôn được hồi hp = 10% max hp mỗi lần nhận sát thương, không giới hạn lần kích hoạt/turn. quy tắc.
kỹ năng 1: quy tắc: tạo Thời Gian Màn Che giữa 2 bên sân trong 3 turn. Thời Gian Màn Che: mọi đơn vị cận chiến từ kẻ thù khi tấn công đồng minh đều sẽ giảm 30% sát thương cuối gây ra lên đồng minh, khi kết thúc lượt tấn công cận chiến đó nhận debuff chậm chạp trong 1 turn, mỗi kẻ thù chỉ nhận 1 debuff chậm chạp từ kỹ năng này/1 turn. 25 aether. Khi có 2 Thời Gian Màn Che tồn tại, chúng không ảnh hưởng hay chiếm chỗ của nhau.
kỹ năng 2: hồi hp cho đồng minh = 200% wil + atk của bản thân cho họ, tăng tác dụng thêm 20% đối với Hư Không Chi Chủ. 20 aether.
kỹ năng 3: quy tắc: khiến mọi đồng minh trên sân thực thi 1 turn đánh thường, giảm animation tấn công từ 2,2s xuống 1s khi có đồng minh thực thi tấn công từ kỹ năng này. quy tắc. 30 aether.
ultimate: quy tắc: hồi hp cho mọi đơn vị đồng minh trên sân = 30% max hp của họ, bản thân hắn được + 10% wil và atk trong 3 turn sau khi dùng ultimate, không cộng dồn.

35) Nguyên Lễ
Kiếm sĩ, UR. không element tag.
nội tại: mỗi lần giết 1 mục tiêu thành công nhận miễn nhiễm với 1 debuff ngẫu nhiên từ pool: độc, choáng, ngủ, chảy máu, yếu đuối. Cũng đồng thời tăng vĩnh viễn 5% atk và wil của bản thân ở lúc giết kẻ thù ( tính luôn atk/wil bị ảnh hưởng từ buff/debuff và mọi nguồn khác) đến khi chết.

đánh thường: gây sát thương=100% wil/atk.

skill 1: mỗi khi nhận sát thương vượt 20% max hp, tự hồi hp cho bản thân = 50% wil /atk của bản thân, tự kích hoạt, mỗi lần kích hoạt - 10 aether từ aepool, nếu ae không đủ sẽ không kích hoạt skill này.
skill 2: chém 1 nhát ngang gây sát thương lên hàng 1/2/3 hoặc 4/5/5 hoặc 7/8/9, ưu tiên hàng có nhiều kẻ địch đứng nhất, mỗi kẻ địch nhận sát thương = 150% đánh thường, cost - 7 ae/kẻ địch nhận sát thương ( tối đa - 21 ae).
skill 3: tăng 50% wil và atk trong 2 turn kế tiếp, 20 ae.

ultimate: gây 1 đòn aoe cố định hình chữ T lên ô 1/2/3/5/8 của kẻ địch, mỗi kẻ địch đứng ở vị trí tấn công này nhận sát thương = 2 đòn đánh thường của nhân vật này, (biến động sát thương theo atk và wil của nhân vật).

36) Lý Mộng Cầm
Support, ssr, element tag: water.
nội tại: mỗi lần xoá thành công 1 debuff từ đồng minh và bản thân sẽ tự hồi HP = 5% wil và atk của bản thân, không thể vượt max hp và không thể tạo khiên khi overheal.
skill 1: Mỗi 3 lần đánh thường/ sài skill hoặc ultimate thành công thì lần ultimate tiếp theo sẽ hồi cho mọi đồng minh trên sân nếu có thể (không ảnh hưởng được thần tính) = 25% wil/atk của bản thân cho mọi đồng minh trên sân nếu có thể và bản thân. Luôn kích hoạt kể cả tử vong rồi được hồi sinh, bị động, -10 ae mỗi lần kích hoạt hồi hp.
skill 2: đánh 2 quả cầu nước vào 2 mục tiêu từ xa, gây sát thương aoe ngẫu nhiên lên 2 mục tiêu này, mỗi kẻ nhận 1 đòn đánh thường, tính là đánh thường, 15 ae.
skill 3: khi nhận sát thương vượt 20% max hp sẽ giảm 20% sát thương phải nhận vào, ví dụ sát thương đang đến phải nhận là 100% thì char này chỉ nhận 80 thôi, không ảnh hưởng được pháp tắc hay quy tắc. đây là skill bị động, không cần tốn turn để kích hoạt mà sẽ luôn kích hoạt từ lúc char này ra sân kể cả được hồi sinh, mỗi lần kích hoạt thành công - 20 ae.
ultimate: xoá 2 debuff (không xoá mark)ngẫu nhiên trên người đồng minh và bản thân, không ảnh hưởng được debuff/mark cấp quy/pháp tắc. sau đó +10% wil và atk của bản thân trong 1 turn và trạng thái này không tính là buff.

36)
ssr
nội tại: hồi hp = 3% max hp của bản thân mỗi lần nhận sát thương vượt quá 5% max hp. sau đó tăng 10% res và arm so với hiện tại tính từ lúc nhận sát thương, cộng dồn tối đa 3 lần. ví dụ char này có 100 hp, 5 res cùng arm thì sau khi bị nhận sát thương vượt hoặc = 5% max hp thì hp và res/arm là 98%/100% max hp, 5,5 res/arm, sau lần 2 nhận sát thương vượt 5% mx hp thì hp là 96/100% max hp, 5,5 +10% res cùng arm, lần 3 thì 94/100% max hp + (5,5 +10%) + 10%, đương nhiên sát thương không thể lúc nào cũng bằng 5% max hp của char này được, đương nhiên sẽ có lúc nhận sát thương hơn 5% max hp, tao ví dụ sát thương nhận là 5% cho dễ ví dụ.

37) Lý Thanh Thu
Ur, Warrior. 
nội tại: với mỗi đơn vị đồng minh lẫn enemy chết (không tính đơn vị triệu hồi bởi summoner) nhân vật này được + 10% wil/atk/mỗi đơn vị chết, giới hạn số lần kích hoạt trong 1 turn là 3, stack tối đa 25 lần trong trận (reset bộ đếm khi chết rồi được hồi sinh). khi nhân vật này tử vong, chuyển 50% số atk và wil có được từ nội tại này cho leader (leader đồng minh với char này), khi được hồi sinh, số stack từ nội tại này sẽ về 0. cộng wil/atk tính từ lúc kích hoạt nội tại, chỉ số của char này lúc đó bao nhiêu thì cứ + 10% wil/atk của lúc đó.
hồi hp = 20% max hp (không tăng max hp) mỗi khi đạt 5 stack từ nội tại. skill/Nội tại/ult của char này đều là Pháp tắc.

đánh thường: gây sát thương=100% wil/atk.

skill 1: gây sát thương đơn mục tiêu = 250% đánh thường, tính là đánh thường, 25 ae.
skill 2: thả 1 phi kiếm gây sát thương aoe hàng dọc cố định ở 3 ô 1/4/7, mỗi đơn vị đứng ở 3 ô này nhận 1 đánh thường, (không tính là đánh thường), sau đó phi kiếm sẽ ở lại ô số 7 1 turn, kẻ đứng ô số 7 này (nếu có) sẽ nhận 1 debuff chảy máu trong 1 turn, sau khi 1 turn đợi kết thúc phi kiếm sẽ phi hàng dọc là ô 7/8/9, mỗi kẻ đứng ở ô này nếu có sẽ nhận sát thương = 1 đánh thường và cũng tính là đánh thường luôn, phi kiếm sẽ đợi 1 turn ở ô 9 1 turn và kẻ đứng ở ô 9 nếu có sẽ nhận 1 debuff chảy máu trong 1 turn, sau 1 turn đợi phi kiếm sẽ rời đi, gây sát thương dọc lên hàng 9/6/3, mỗi kẻ đứng trong 3 ô này nếu có sẽ nhận sát thương = 1 đánh thường nhưng không tính là đánh thường, phi kiếm sẽ đợi 1 turn ở ô 3, kẻ đứng ô này nếu có sẽ nhận 1 debuff chảy máu trong 1 turn, sau 1 turn đợi phi kiếm sẽ phi đến ô 2, gây sát thương lên kẻ đứng ô 2 và 3 = 1 đánh thường nhưng không tính là đánh thường , kẻ đứng ô 2 nếu có sẽ nhận 1 debuff chảy máu trong 1 turn, sau 1 turn đợi phi kiếm sẽ phi đến ô 8, quãng đường là 2/5/8, mỗi kẻ đứng ở 3 ô này nếu có sẽ nhận sát thương = 1 đánh thường và cũng tính là đánh thường của nhân vật này, sau khi gây sát thương lên 3 ô này thì phi kiếm sẽ biến mất (vfx trở về với char này). về triển khai thì tao nghĩ nên thiết lập kẻ nào đứng cùng ô với phi kiếm sẽ nhận 1 debuff chảy máu miễn phi kiếm còn ở ô đó, set time phi kiếm ở là 1 turn là xong việc. cost 45 ae, không cd. Về cơ bản là 1 skill aoe cố định gây sát thương theo thời gian, vị trí ô 7/8/9/3/2 sẽ nhận sát thương 2 lần chưa kể sát thương từ debuff chảy máu. Pháp tắc.
skill 3: mỗi khi gây sát thương lên tối thiểu 2 kẻ địch trở lên trong 1 turn sẽ được tăng 20% res và arm của thời điểm phán định skill 3 kích hoạt thành công, tối đa 3 stack, khi vượt 3 stack sẽ reset time của stack cũ nhất, mỗi stack sẽ có bộ time tồn tại riêng là 2 turn kích hoạt tính từ lúc áp hiệu ứng + res và arm từ skill này lên char này, tức lúc kích hoạt và + thành công thì đã tính là 1 turn, không tính là buff, mỗi khi phi kiếm từ skill 2 gây sát thương thành công lên >=2 enemy thì skill này sẽ kích hoạt, đơn giản như vậy, mỗi lần kích hoạt -8 ae. skill này luôn bật (từ lúc vào sân kể cả được hồi sinh, miễn đứng trên sân liền sẽ bật), chỉ cần đủ điều kiện liền kích hoạt, không cần tốn turn để bật skill. pháp tắc.
ultimate: gây sát thương đơn mục tiêu lên leader địch = 200% đánh thường, không tính là đánh thường, nếu sát thương gây ra thành công lên leader địch vượt 20% hp của leader địch nhân vật này tự hồi hp của bản thân = 10% max hp, không tăng max hp. Pháp tắc.

38)
Nội tại: Pháp Tắc Trả Đũa
1) Hiệu ứng cốt lõi
Mỗi khi một đồng minh của Ur (bao gồm cả Ur) nhận sát thương trực tiếp từ hành động của kẻ địch, Ur lập tức thực hiện 1 đòn Đánh Thường vào chính kẻ địch vừa gây sát thương đó.
Đòn này:
được tính là Đánh Thường, mang thuộc tính Pháp Tắc, là đòn phản kích từ nội tại (không phải hành động chủ động trong lượt Ur).

2) Giới hạn theo mục tiêu địch (tầng 1 của hybrid)
Trong cùng một chu kỳ lượt của Ur, mỗi kẻ địch chỉ có thể bị kích hoạt phản kích từ nội tại này tối đa 1 lần.
Nói đơn giản:
Nếu địch A đã bị Ur phản kích bởi nội tại trong chu kỳ hiện tại, thì mọi lần sau địch A tiếp tục gây sát thương lên đồng minh trong cùng chu kỳ đó không kích hoạt thêm từ nội tại này.

Địch B, C… vẫn có thể kích hoạt bình thường (nếu chưa chạm giới hạn cá nhân của chúng).
3) Giới hạn tổng phản kích của Ur (tầng 2 của hybrid)
Trong mỗi chu kỳ lượt của Ur, nội tại có tối đa 5 lần phản kích. Mỗi lần nội tại kích hoạt thành công sẽ tiêu tốn 1 lượt trong hạn mức 5. Khi đã đạt 5/5, nội tại ngừng kích hoạt cho tới khi reset. Hạn mức này áp dụng cho tổng toàn bộ kẻ địch, không phân biệt nguồn sát thương.
4) Thời điểm reset
Toàn bộ bộ đếm của nội tại được reset khi đến lượt hành động chủ động của Ur.
Cụ thể reset gồm:
Bộ đếm tổng phản kích: về 0/5. Dấu đã-bị-phản-kích của từng kẻ địch: xóa toàn bộ.
Lưu ý:

Các đòn phản kích sinh ra từ nội tại không tính là “Ur bắt đầu lượt mới”, nên không reset nội tại.
Chỉ lượt chủ động thực sự của Ur mới reset.
5) Quy tắc áp dụng cho các tình huống thường gặp
a) Địch dùng AoE đánh trúng nhiều đồng minh cùng lúc
Ur kiểm tra kẻ gây sát thương. Nếu kẻ đó chưa bị phản kích trong chu kỳ này và Ur chưa hết 5 lượt tổng, Ur chỉ phản kích 1 lần vào kẻ đó. Không nhân theo số đồng minh bị trúng bởi cùng một nguồn địch đó (do giới hạn theo địch: 1 lần/chu kỳ).
b) Một địch đánh nhiều hit liên tiếp / follow-up liên tục
Hit đầu tiên đủ điều kiện có thể kích hoạt.Các hit sau từ cùng địch trong cùng chu kỳ không kích hoạt thêm (vì đã chạm giới hạn cá nhân của địch đó, xem d)).
c) Nhiều địch khác nhau lần lượt tấn công đồng minh
Mỗi địch mới (chưa bị đánh dấu) có thể kích hoạt 1 lần, cho tới khi Ur chạm trần 5 lần tổng trong chu kỳ.
d) Phản đòn/follow-up của kẻ thù/cơ chế gây sát thương ngoài lượt của kẻ thù lên đồng minh qua debuff không kích hoạt nội tại này.

39)
nội tại: khi HP về 0, tử vong sau đó xoá sạch mọi debuff lẫn buff từ nguồn khác ngoài bản thân trên người kể cả ảnh hưởng từ pháp tắc, nếu pháp tắc từ nguồn ngoài bản thân là hiệu ứng kéo dài thì char này miễn nhiễm pháp tắc đó trong 1 turn đầu tức turn hồi sinh. Pháp tắc tag.

40)
ssr, tanker, không element tag.
nội tại: mỗi khi HP về 0, không chết, hồi ngay lập tức hp = 20% max hp, ATK và WIL hiện có lúc hp về 0 (bị ảnh hưởng  bởi debuff/buff) được chuyển 100% thành res và arm với tỉ lệ 1 atk = 0,5 arm, 1 wil = 0,5 res, sau đó có thể tấn công nhưng sát thương gây ra là 1 atk và 1 wil, nhận trạng thái taunt vĩnh viễn cho đến khi HP về 0 lần nữa. Khi HP về 0 sau khi kích hoạt nội tại này thì sẽ chết và có thể hồi sinh như bình thường, nội tại này kích hoạt tối đa 2 lần/trận, sau khi kích hoạt nội tại này vẫn có thể nhận heal và hồi hp qua kit/bản thân nếu có. Trạng thái chuyển atk/wil sang res/arm không phải là debuff/buff, có lẽ nên tạo tag chuyển đổi hoặc gì đó tương tự nếu chưa có?. nội tại này không phải pháp/quy tắc, không phải axiom.

skill 1: nhận trạng thái phản sát thương trong 3 turn, turn bật skill này tính là 1 trong 3 turn đó. phản sát thương với tỉ lệ là 50%. 25 aether.
skill 2: giơ cao chiến phủ trong tay chém về kẻ địch (theo SSI trong pve) gây sát thương = 1 đánh thường, sau đó hồi hp = 80% sát thương kỹ năng này gây ra, 25 aether.
skill 3: đập mạnh chiếc khiên trong tay xuống đất, tăng res/arm của bản thân lên 20% trong 3 turn, turn kích hoạt skill này tính là 1 turn, có thể dùng dù có kích hoạt nội tại hay không, 15 ae.
ultimate: cast 1 lần skill (không tốn ae) nhưng sát thương gây ra là 2 lần đánh thường và tỉ lệ hồi hp là 90% thay vì 80%. (có thể code skill 2 như module, lúc code ultimate import skill 2 chỉnh 1 chút là được rồi).

đánh thường: gây sát thương=100% wil/atk.

41) Dương Hạ, Nam element tag: wild.
Ranger, ssr. ( bộ kit không có tag pháp/quy tắc nào, không axiom và có thể bị ảnh hưởng bởi 3 tag đã đề cập trong ngoặc đơn này)
Nội tại: tăng 3% wil/atk/hp mỗi khi có 1 kẻ thù chết khi char này có trên sân, creep từ summoner cũng tính. Reset khi rời sân (chết, về deck hoặc cơ chế khác nếu có, miễn không còn đứng trên sân cứ reset cộng dồn từ nội tại này).

skill 1: mỗi lần đánh thường luôn kèm theo 1 đòn follow up gây sát thương = 50% đòn chính, khin skill này kích hoạt đòn đánh thường chính giảm 10 nộ của kẻ địch khi họ nhận sát thương từ char này khi skill này kích hoạt. Luôn tự kích hoạt miễn đứng trên sân, - 5 ae/turn dù có đánh thường hay không.

skill 2: khi kích hoạt, đánh thường của char này bỏ qua 20% res/arm của mục tiêu, tự kích hoạt như skill 1, cd 1 turn, tức 1 turn đánh thường có hiệu ứng của skill 2, turn tiếp theo k có, turn tiếp có, turn sau lại k có, khi ra sân (sum từ cost bar, hồi sinh,...) thì skill này sẽ bật, turn sau tắt, turn sau nữa lại bật. cost 3 ae.

skill 3: khi kích hoạt tăng 30% will/atk/agi trong 3 turn tính từ lúc kích hoạt, cd 1 turn. skill này cần tốn 1 turn để kích hoạt chứ không phải "tự kích hoạt" hay "kích hoạt ngầm" như skill 1 và 2. 25 ae.

ultimate: đánh thường 3 lần ( bị ảnh hưởng bởi buff/debuff/skill 1/2/3).

đánh thường: gây sát thương = 100% will/atk.

về cơ bản thi đây là 1 char toàn đánh thường trừ skill 3 ra, ultimate chả có hiệu ứng hoạt ảnh gì cả, cứ trừ nộ như auto cast ult bình thường vừa đánh thường như mô tả của ult cùng lúc.

42) Phoebe
ssr, mage element tag:light
nội tại: +3,5% wil/res và 1,5% max hp (không hồi hp) của hiện tại/ mỗi turn hiện diện trên sân. reset về từ đầu khi chết hoặc về deck, rời sân.

skill 1: mỗi khi đánh thường giảm 10% res/arm của kẻ địch trong 1 turn, skill này luôn kích hoạt cho đến khi không đủ aether, 3 aether/turn bất kể đánh thường bao nhiêu lần/turn. Pháp Tắc.

skill 2: mỗi khi dính 1 debuff không có tag axiom/pháp/quy tắc thì tự động xoá 1 stack debuff đó (không thể xoá mark), -8 ae/lần kích hoạt, tối đa kích hoạt 3 lần/turn. skill bị động, đáp ứng đủ điều kiện thì kích hoạt + trừ ae, không cần tốn turn riêng để kích hoạt skill này.

skill 3: gây sát thương aoe ngẫu nhiên lên 2 mục tiêu, mỗi kẻ nhận 1 đòn đánh thường nhưng với hệ số là 200 % wil/atk hiện có của char này, 25 ae.

ultimate: cast 2 lần skill 3 nhưng không tốn cost skill 3. hồi hp cho bản thân = 50% sát thương ultimate này gây ra, nếu over heal sẽ bị bỏ qua phần heal dư mà không tạo khiên.

43)
Assassin, ssr
Nội Tại: khi gây sát thương lên leader không phải leader đồng minh thì sát thương gây ra tăng 10% và bỏ qua 10% res/arm của leader đó, mỗi khi gây sát thương lên leader địch hồi hp = 40% sát thương gây ra.

Skill 1: Bỏ qua taunt (taunt này cần không có tag pháp/quy tắc/axiom), tấn công gây sát thương lên leader địch = 2 đòn đánh thường trong 1 lần tấn công, không tính là đánh thường, 25 ae.

skill 2: cường hoá 3 lần gây sát thương kế tiếp (skill/ult/đánh thường đều tính là 1 lần gây sát thương, follow up attack không tính), sau khi kích hoạt skill này 3 lần gây sát thương tiếp theo tăng 20% sát thương gây ra sau khi đã trừ res/arm/buff/debuff hoặc cơ chế khác nếu có, tức là tính sát thương xong hết rồi mới + 20%, 20 ae.

skill 3: bị động, tự kích hoạt khi đủ điều kiện. Khi hp thấp hơn hoặc = 30%, tự cắn đan dược (vfx thôi), mỗi turn sau khi kích hoạt skill này hồi hp , = 5% hp max trong 3 turn, sau đó cd 1 turn, 25 ae/lần kích hoạt, mỗi trận kích hoạt tối đa 3 lần.

ultimate: cast 2 lần skill 1 nhưng không tốn ae.

44) Cổ Trường Phong
warrior, Ur, element tag: metal
nội tại: mỗi turn tự tạo 3 phi kiếm để thi triển skill, mỗi khi tự giết 1 mục tiêu thành công số phi kiếm nhận mỗi turn sẽ +1, tối đa 5 stack. Quy Tắc.

skill 1: phi 2 phi kiếm tấn công ngẫu nhiên 2 mục tiêu, gây sát thương lên mỗi mục tiêu = 150% đánh thường, không tính là đánh thường. 20 ae và 2 phi kiếm. - 8 rage/mỗi kẻ thù nếu skill 3 kích hoạt. Pháp Tắc.

skill 2: gia tốc 3 thanh phi kiếm, tấn công leader kẻ thù, mỗi thanh phi kiếm gây sát thương = 1 đòn đánh thường, hồi hp 3 lần, mỗi lần 55% = sát thương của 1 phi kiếm gây ra lên leader địch, vì gây sát thương 3 lần riêng biệt nên sát thương gây ra cũng khác nhau và heal nhận cũng khác nhau. 35 ae và 3 phi kiếm. - 24 rage lên leader địch nếu 3 lần gây sát thương đều thành công (nếu skill 3 kích hoạt). Pháp Tắc.

skill 3: luôn kích hoạt cho đến khi bể aether đồng minh không đủ để thanh toán cost skill này, skill bị động không cần tốn turn riêng để bật. Mỗi lần gây sát thương lên kẻ địch sẽ - 8 rage của họ, - cost ae/turn bất kể số lần gây sát thương lên kẻ địch/turn là ae. Ví dụ dễ hiểu là skill 1 và 2 của dương hạ.

ultimate: cast skill 2 miễn còn đủ 3 phi kiếm/lần cho đến khi không đủ phi kiếm thì nếu còn phi kiếm sẽ cast skill 1. skill cast từ ultimate sẽ không tốn ae. Ví dụ char này có 4 phi kiếm thì sau khi dùng ultimate sẽ cast 1 lần skill 2, nếu có 5 phi kiếm thì sau khi dùng ultimate sẽ cast skill 2 sau đó là skill 1 hoặc có thể cast cùng lúc skill 1 và 2 nếu code cho phép, nếu có 6 hoặc 7 phi kiếm thì sẽ cast 2 lần skill 2. nếu có 8 phi kiếm thì cast skill 2 2 lần rồi cast skill 1, thực ra ultimate char này chả có vfx gì, player chỉ thấy char này mất nộ do ultimate rồi cast skill theo mô tả ultimate theo lượng phi kiếm hiện có thôi, kiểu thấy char này đến turn thì mất nộ do bị trừ khi kích hoạt ultimate, kiểu đến turn là cast skill luôn không có khựng gì cả. Đương nhiên nộ vẫn phải trừ, các char khác nếu có ultimate là cast skill cũng thế, mất nộ là cast skill theo mô tả của ultimate luôn.

45)
NỘI TẠI: TÂM ĐỊA KHÔNG MINH
Loại: Bị động (Passive)
Cấp Tag: PHÁP TẮC
Cơ chế kích hoạt: Ngay sau khi Đánh thường chính đánh trúng đích.
Hiệu ứng:
Tự động tung 1 đòn đánh phụ (Follow-up) vào cùng mục tiêu, gây sát thương = 50% Sát thương Đánh thường chính.
Hồi HP cho bản thân = 100% lượng sát thương thực tế mà đòn Follow-up này gây ra.
Quy tắc hệ thống: Đánh thường chính có lượng hồi phục cơ bản = 0. (Vẫn có thể nhận hồi HP từ Buff/Mark bên ngoài).

ĐÁNH THƯỜNG: THỔ PHÁ QUYỀN
Tác động: 1 mục tiêu đơn lẻ.
Sát thương: 100% (WIL + ATK).
Tương tác SSI: Kích hoạt Nội tại Follow-up. Nếu bị Kit của Char khác cấm Follow-up, hệ thống sẽ kích hoạt phán định Tag (Cấp Pháp Tắc).

SKILL 1: LIÊM SƠN TRỤ
Năng lượng tiêu hao: Có hành động \rightarrow Sinh 20 Mana cho bể tổng.
Cấp Tag: PHÁP TẮC
Cơ chế: Đánh thường 1 mục tiêu (Kích hoạt Đánh thường chính + Follow-up Nội tại). Đồng thời triệu hồi 1 Nham Trụ đâm mục tiêu đó.
Sát thương Nham Trụ: Bằng 100% Sát thương Đánh thường chính.
Quy tắc Nham Trụ: Kháng hoàn toàn mọi cơ chế tương tác (Không kích hoạt Follow-up, không hưởng hút máu/Life Steal, không bỏ qua phòng thủ, không bị ảnh hưởng bởi bất kỳ Buff/Debuff/Mark nào trên sân).

SKILL 2: THIÊN ĐỊA CHẤN ĐỘNG
Năng lượng tiêu hao: Có hành động \rightarrow Sinh 35 Mana cho bể tổng.
Cấp Tag: PHÁP TẮC
Cơ chế: Đứng tại chỗ, triệu hồi 4 Nham Trụ đâm ngẫu nhiên vào 4 kẻ địch trên bàn cờ.
Sát thương: Mỗi Nham Trụ gây sát thương cố định = 100% Đánh thường chính.
Quy tắc Nham Trụ: Mang thuộc tính Thần Tính (Kháng hoàn toàn mọi cơ chế tương tác của hệ thống, không kích hoạt Follow-up, không nhận Buff/Debuff/Mark, gây sát thương thuần túy theo chỉ số mô tả).

SKILL 3: KHỔ HẠNH CHUYỂN DIÊN
Loại: Bị động (Passive)
Cấp Tag: QUY TẮC (Cao hơn 2 Skill trên)
Cơ chế tích lũy: Tự động ghi lại 100% lượng sát thương nhận vào trong suốt 3 Turn của trận đấu (Hiển thị số liệu tích lũy phía trên icon Buff/Debuff của HP Bar).
Cơ chế kích hoạt: Sau khi kết thúc Turn thứ 3, hệ thống tự động trừ 20 Mana của bể tổng để kích hoạt chiêu thức.
Hiệu ứng:
Hồi phục HP cho bản thân = 70% Tổng sát thương đã tích lũy.
Nếu lượng hồi phục vượt quá Max HP (Overheal) \rightarrow Chuyển phần thừa thành Khiên (Shield). Cap Khiên tối đa = 100% Max HP của bản thân.
Quy tắc Giới hạn: Tối đa tự kích hoạt 5 lần/trận.
Quy tắc Ưu tiên Khiên: Khiên từ kỹ năng này không bị giới hạn thời gian (chỉ mất khi nhận sát thương). Nếu nhân vật có nhiều nguồn Khiên khác, hệ thống bắt buộc phải trừ Khiên của kỹ năng này trước.

ULTIMATE: ĐỊA TẠNG DIỆT THẾ
Cơ chế: Bay lên cao, lao thẳng xuống tấn công vào Ô số 5 (Vị trí trung tâm bàn cờ) của phe địch.
Sát thương: Gây Sát thương chuẩn (True Damage) = 5% Max HP bản thân + 150% (WIL + ATK).
Hiệu ứng Cường hóa (Permanent Buff):
Mỗi 1 điểm Sát thương gây ra từ chiêu thức này sẽ chuyển hóa thành chỉ số Phòng thủ theo tỷ lệ: 1 \text{ dmg} = 0.3 \text{ RES} và 0.3 \text{ ARM}.
Chỉ số này cộng trực tiếp vào Chỉ số Cơ bản của nhân vật (Không tính là hiệu ứng Buff/Mark, không thể bị xóa bởi kỹ năng xóa buff).
Điều kiện Reset: Chỉ số cộng thêm này sẽ lập tức biến mất (Reset về ban đầu) khi nhân vật rời khỏi sân đấu.

Khi Char dùng Ultimate \rightarrow Tăng mạnh RES/ARM cơ bản \rightarrow Các lượt sau Char sẽ nhận ít sát thương hơn \rightarrow Lượng sát thương tích lũy ở Skill 3 giảm đi \rightarrow Lượng Hồi máu/Khiên từ Skill 3 giảm xuống. Đây là cơ chế tự cân bằng hoàn hảo, tránh việc nhân vật trở nên bất tử lỗi.

47)
Support, ssr, element tag: mộc ( là plant nhỉ)
nội tại: mỗi turn dù có hành động được hay không thì miễn còn sống, đứng trên sân luôn hồi hp = 50% wil/atk của bản thân/turn, tự kích hoạt mỗi turn, kích hoạt 1 lần/turn, không giới hạn lần kích hoạt/trận.

đánh thường: gây sát thương= 100% wil/atk, hồi hp cho bản thân = 35% sát thương đánh thường gây ra.

skill 1: bị động, luôn kích hoạt, không cần tốn turn riêng để bật. Mỗi khi đánh thường cũng hồi hp cho leader đồng minh = 20% sát thương gây ra bởi đánh thường, sau khi hồi cho leader đồng minh = skill này 3 lần bản thân nhân vật này sẽ nhận 1 lớp khiên tồn tại max 3 turn = 25% max hp của nhân vật này. - 3 ae/ turn bất kể có đánh thường hay không. sau khi đạt lần lần heal cho leader = skill này thì ở ngay lần thứ 3 sau khi heal cho leader thì nhận khiên ngay lập tức, nếu đã có khiên đạt cap từ trước thì vẫn tạo thêm khiên = 25% max hp, ví dụ có kit của char khác tạo khiên cho char này nhưng khiên đã đầy cap của kit char đó ví dụ như = 75% max hp của bản thân char này chẳng hạn thì skill 3 này có thể tạo thêm khiên được nữa, nói chung khiên từ skill này không có cap và có thể cộng dồn với khiên từ kit của char khác dù đã đạt cap.

skill 2: hồi hp cho leader đồng minh và 3 đồng minh ngẫu nhiên = 100% wil/atk của nhân vật này. 20 ae.

skill 3: áp dụng debuff phản hồi phục lên leader địch và 3 kẻ thù ngẫu nhiên có mặt trên sân, 20 ae, skill này có tag Pháp Tắc.

ultimate: xoá bỏ 1 debuff/đồng minh cho mọi đồng minh trên sân, cũng đồng thời xoá bỏ 1 buff/mỗi kẻ thù đang có mặt trên sân, pháp tắc.

47) Hư Vô Cực
summoner, ssr, element tag: blood.
NỘI TẠI: ẢNH TỬ VẠN GIỚI
Loại: Bị động (Passive)
Cấp Tag: PHÁP TẮC
Cơ chế: Tự động kích hoạt ở đầu Turn hành động của Hư Vô Cực.
Hiệu ứng:
Triệu hồi 1 [Ảnh Tử] lên ô trống trên sân.
Thuộc tính [Ảnh Tử]: Chỉ số thuộc tính = 50% Chỉ số cố định của Bản thể. Không có bể Mana (Aether) riêng, hành động không sinh Mana cho bể tổng. Chỉ có thể Đánh thường gây sát thương = 100% (WIL + ATK) của Ảnh Tử (tức bằng 50% của bản thể). Tồn tại tối đa 3 Turn.
Quy tắc Đầy Sân: Nếu bàn cờ phe ta không còn ô trống, [Ảnh Tử] mới xuất hiện sẽ ghi đè vào [Ảnh Tử] có HP thấp nhất hiện tại, hồi đầy HP và reset lại thời gian tồn tại thành 3 Turn.

ĐÁNH THƯỜNG: HUYẾT THỰC QUYỀN
Tác động: 1 mục tiêu đơn lẻ.
Sát thương: 100% (WIL + ATK).

SKILL 1: ẢNH VŨ MA TRẬN
Năng lượng tiêu hao: Có hành động \rightarrow Tốn 1 Turn niệm chú (Bản thể đứng yên). Sau khi kết thúc niệm chú, tự động trừ Mana bể tổng dựa trên số lượng Ảnh Tử tấn công.
Cơ chế: Ra lệnh cho toàn bộ [Ảnh Tử] trên sân đồng loạt Đánh thường vào mục tiêu.
Giá trị Mana tiêu hao: Trừ 4 Mana của bể tổng ứng với mỗi [Ảnh Tử] tham gia tấn công.
Hiệu ứng phụ: Hư Vô Cực được hồi HP = 3% Max HP của bản thể ứng với mỗi [Ảnh Tử] tham gia tấn công.
Bù trừ hệ thống (Debuff): Những [Ảnh Tử] đã tham gia tấn công từ chiêu này sẽ bị đóng băng hành động (Bỏ qua Turn) ở lượt đi tuần tự tiếp theo của chúng.

SKILL 2: HUYẾT NHỤC ĐỒNG BÀO
Năng lượng tiêu hao: Tiêu tốn 25 Mana từ bể tổng khi kích hoạt.
Cấp Tag: PHÁP TẮC
Cơ chế: Thiết lập sợi dây liên kết HP giữa Bản thể và tối đa 3 [Ảnh Tử] hiện có trên sân.
Hiệu ứng: Khi Bản thể nhận Sát thương đơn mục tiêu (Single-target Damage), 100% lượng sát thương đó sẽ được chia đều cho các [Ảnh Tử] đang được liên kết gánh chịu thay. (Sát thương diện rộng - AOE dội vào Bản thể sẽ không kích hoạt cơ chế chuyển dịch này).
Thời gian duy trì: Vô hạn, cho đến khi các [Ảnh Tử] được liên kết hết thời gian tồn tại (3 turn) hoặc bị đánh chết.

SKILL 3: HUYẾT TẾ NGHỊCH CHUYỂN
Năng lượng tiêu hao: Tiêu tốn 20 Mana từ bể tổng khi kích hoạt.
Điều kiện kích hoạt: HP của Bản thể rơi xuống dưới 40%.
Cơ chế: Hút máu của tối đa 3 [Ảnh Tử] có HP thấp nhất trên sân (Lựa chọn mục tiêu ngẫu nhiên, có thể chọn trúng các Ảnh Tử đang được liên kết bởi Skill 2).
Hiệu ứng: Bản thể hấp thụ hoàn toàn lượng HP còn lại của các [Ảnh Tử] này để hồi phục cho bản thân. Các [Ảnh Tử] bị hút sạch HP sẽ biến mất ngay lập tức.

ULTIMATE: VÔ CỰC THƯỢNG TÁC
Cấp Tag: PHÁP TẮC
Cơ chế: Bản thể tiếp cận mục tiêu, gây sát thương = 200% (WIL + ATK). Đồng thời, toàn bộ [Ảnh Tử] trên sân lập tức thực hiện 1 đòn Đánh thường phối hợp vào cùng mục tiêu đó.
Quy tắc đặc biệt: Đòn tấn công phối hợp từ Ultimate này không làm [Ảnh Tử] bị mất lượt (Không bị dính debuff bỏ qua 1 turn như Skill 1).
Hiệu ứng phụ: Hồi phục trực tiếp cho Hư Vô Cực = 10% Max HP của hắn.

Snapshot chỉ số cố định của Hư Vô Cực lúc vừa vào trận.
Tiết kiệm hiệu năng máy (Performance): Nếu mỗi turn đẻ 1 Ảnh Tử lại phải chụp lại chỉ số của bản thể, hệ thống sẽ phải liên tục tạo ra các "Object" nhân vật mới với các mảng chỉ số biến động khác nhau. Khi đầy sân, việc so sánh HP và thay thế sẽ rất nặng. Nếu dùng chỉ số cố định, các Ảnh Tử thực chất là cùng 1 loại "Monster/Minion Code", chỉ cần quản lý thanh HP của từng con là xong.
Cơ chế thay thế thông minh: khi đầy sân, Ảnh Tử mới đè lên Ảnh Tử cũ có HP thấp nhất. Bản chất code chỉ cần "Hồi đầy máu và reset lại thời gian tồn tại (3 turn)" của con cũ đó là xong, không cần xóa đi tạo lại object mới.

48) Dạ Hành Giả
ssr, Assassin, element tag: dark

nội tại: với mỗi summon của class summoner kẻ thù hắn giết được hoặc chết khi hắn có mặt trên sân, ngay lập tức +5% wil/atk/hp của hiện tại, giới hạn kích hoạt/trận là 10.

đánh thường: gây sát thương = 100% wil/atk.

skill 1: đứng tại chỗ triệu hồi 3 ngọn giáo hắc ám tấn công 1 kẻ thù, mỗi ngọn giáo gây sát thương = 90% wil/atk, 25 ae.

skill 2: tiếp cận kẻ thù, tấn công đối phương = dao găm gây sát thương = 200% wil/atk, áp 1 debuff chảy máu lên mục tiêu, 20 ae.

skill 3: niệm chú, hắc ám ma lực sẽ quấn lấy mọi summoner phe kẻ thù trên sân, chúng không thể hồi aether cho bể aether qua hành động trong 3 turn, 30 ae.

ultimate: triệu hồi 1 vùng hắc ám dưới chân mục tiêu (vfx), tấn công mục tiêu gây sát thương = 280% wil/atk, đòn đánh này bỏ qua 20% res/arm của mục tiêu, nếu mục tiêu có khiên cũng khiến khiên của họ mất 20% trước mới gây sát thương.

49) Niddhoggr (Hắc Long), ssr, warrior.
nội tại: khi kẻ thù nhận 3 đòn đánh thường của Hắc Long, chúng nhận sát thương chuẩn (bỏ qua res/arm) = 3% max hp của bản thân, Sau khi nhận sát thương từ nội tại này nhận 1 debuff giảm 50% hồi phục hp nhận được từ nguồn không phải của bản thân chúng, tức khi được đồng minh của chúng hồi hp thì lượng hồi nhận được bị giảm 50%, debuff tồn tại = 1 turn của Niddhoggr, nên nếu bị dính debuff mà Niddhoggr không hành động (tấn công, sài skill,..) thì debuff sẽ còn mãi trừ khi Niddhoggr rời sân (về deck, chết, cơ chế đặc biệt nào đó,..). Pháp Tắc. nhận 3 đòn đánh thường của hắn là điều kiện kích hoạt nội tại, không phải mark/debuff nên cũng không thể xoá, không thể bị quy tắc/pháp tắc/axiom ảnh hưởng và khi 3 đòn đánh thường đã đủ thì prime có thần tính vẫn bị mất hp vì nội tại của Niddhoggr. Đương nhiên debuff giảm hồi phục của Niddhoggr thần tính vẫn miễn nhiễm.

đánh thường: phun long tức, gây sát thương aoe ngẫu nhiên 3 mục tiêu, mỗi kẻ nhận 100% wil và atk.

skill 1: thực thi 2 lần đánh thường, tính là 2 lần đánh thường riêng lẻ trong cùng 1 turn đó, tốc độ animation x2 để tránh tốn thời gian, 20 ae.

skill 2: tiếp cận mục tiêu, cắn mục tiêu gây sát thương = 10% max hp (không phải sát thương chuẩn, có thể bị giảm bởi res/arm hoặc cơ chế/pháp tắc (nếu xung đột pháp tắc thì cần phán định)/quy tắc/axiom) của họ sau đó hồi hp cho bản thân = 50% sát thương gây ra = skill này, 30 ae. Pháp Tắc.

skill 3: mỗi khi kích hoạt nội tại thành công, tăng max hp = 2% max hp của hiện tại của Niddhoggr/mỗi kẻ thù nhận sát thương từ nội tại, đơn giản là khi nội tại kích hoạt trên 1 mục tiêu thì hắn tăng max hp = 2% max ho của hiện tại, cost 4 ae/mỗi lần kích hoạt skill/mục tiêu. cứ coi skill này như nội tại nhưng tốn ae là được. Vì đánh thường aoe nên nội tại chắn chắn sẽ kích hoạt trên nhiều mục tiêu cùng lúc, lúc đó skill này tăng max hp sẽ không phân kích hoạt trước sau mà sẽ cộng dồn, ví dụ nội tại kích hoạt trên 2 enemy, - 8 ae từ phe của Niddhoggr, cùng lúc đó tăng max hp = 4% mx hp hiện tại của bản thân Niddhoggr mà không phải chia ra 2 lần tăng max hp riêng lẻ.

ultimate: gào thét, phun long tức lên toàn bộ kẻ địch có mặt trên sân (tức chỉ phun lên ô có kẻ thù, không phun lên ô trống), mỗi kẻ nhận sát thương = 150% will/atk cùng áp 2 lần nội tại lên chúng.
nếu kẻ thù đã có 1 stack nội tại của Niddhoggr từ trước thì khi dính ultimate của hắn thì nội tại sẽ kích hoạt vì đủ 3 stack, kẻ thù sẽ mất hp = 3% max hp của chúng (không giảm max hp) cùng nhận 1 debuff giảm 50% hồi phục nhận được từ nguồn ngoài, vì nội tại kích hoạt nên skill 3 cũng kích hoạt, Niddhoggr tăng max hp và phe của hắn bị trừ ae tương ứng.

50) MẶC PHÀM
Rank: UR
Class: Tanker (Đỡ đòn)
Hệ (Element): Chưa phân loại (Tùy ông chọn: Earth/Blood...)

NỘI TẠI: BẤT DIỆT KIM THÂN
Loại: Bị động (Passive)
Cấp Tag: QUY TẮC
Cơ chế: Mỗi khi nhận sát thương, hệ thống tự động cộng dồn 50% lượng sát thương thực tế nhận vào vào "Bể Tích Lũy".
Điều kiện nổ: Khi "Bể Tích Lũy" đạt mốc \ge 30\% \text{ Max HP} của Mặc Phàm, cơ chế tự động kích hoạt Tức thời (Instant):
Xóa toàn bộ số liệu trong Bể Tích Lũy.
Hồi phục HP cho bản thân = Đúng 30\% \text{ Max HP} (Lượng sát thương thừa vượt quá mốc 30% này trong Bể sẽ bị xóa bỏ hoàn toàn, không bảo lưu).
Tạo cho bản thân 1 lớp [Khiên Bất Diệt] = 10\% \text{ Max HP} của bản thân.
Quy tắc giới hạn: Không giới hạn số lần kích hoạt trong mỗi Turn hoặc mỗi trận.
Quy tắc [Khiên Bất Diệt]: Tồn tại vô hạn Turn, có thể cộng dồn (Stack) vô hạn. Khi Mặc Phàm nhận thêm khiên từ các nguồn khác (loại có giới hạn Turn/có Cap), hệ thống bắt buộc phải trừ các nguồn khiên khác trước, [Khiên Bất Diệt] luôn được trừ cuối cùng.

ĐÁNH THƯỜNG: MINH VƯƠNG ẤN
Tác động: 1 mục tiêu đơn lẻ.
Sát thương: 100% (WIL + ATK).

SKILL 1: MA PHÁP PHẢN VỆ
Loại: Bị động (Passive)
Cấp Tag: PHÁP TẮC
Cơ chế: Tự động kiểm tra trạng thái ở đầu mỗi Turn tuần tự của Mặc Phàm. Nếu trên người hắn đang có bất kỳ loại Khiên nào (kể cả Khiên Bất Diệt hay khiên từ char khác).
Hiệu ứng:
Tiêu tốn 3 Mana của bể tổng.
Nhận buff [Phản Sát Thương] 100% trong 1 Turn.
Điều kiện tắt: Nếu Khiên trên người Mặc Phàm bị đánh vỡ hoàn toàn trước khi hết Turn, buff [Phản Sát Thương] lập tức biến mất ngay tại thời điểm đó.

SKILL 2: THỰC HUYẾT TRẬN PHÁP
Loại: Bị động (Passive) - Tự kích hoạt khi đủ điều kiện bên ngoài lượt hành động.
Cấp Tag: PHÁP TẮC
Cơ chế kích hoạt: Khi kẻ địch phải chịu sát thương (từ Phản sát thương, Sát thương duy trì - DOT, Bleed, Venom, v.v...) không phải do Mặc Phàm trực tiếp đánh trong lượt của hắn.
Điều kiện kích hoạt bắt buộc (Check-gate):
Mục tiêu phải thực sự bị trừ vào HP (Nếu đòn đánh dội vào Khiên của địch hoặc địch Né được \rightarrow Bỏ qua không kích hoạt).
Lượng sát thương mục tiêu phải nhận từ đòn đó tối thiểu phải \ge 2\% \text{ Max HP} của chính mục tiêu đó (Nếu địch có thủ/kháng quá cao khiến damage nhận vào < 2\% \text{ Max HP} \rightarrow Bỏ qua không kích hoạt).
Hiệu ứng:
Trừ 1 Mana từ bể tổng của phe ta.
Hồi phục HP cho Mặc Phàm = 1% Max HP hiện tại của hắn/lần kích hoạt.
Quy tắc giới hạn: Không giới hạn số lần kích hoạt trong một Turn.

SKILL 3: KHỔ NHỤC MA CÔNG
Năng lượng tiêu hao: Có hành động \rightarrow Kích hoạt chủ động (Tốn Turn).
Giá trị đánh đổi: Trực tiếp trừ thẳng 25% HP hiện tại của bản thân (Lưu ý: Không giảm chỉ số Max HP).
Hiệu ứng: Từ Turn tiếp theo (sau Turn kích hoạt chiêu này) và kéo dài trong 3 Turn, Mặc Phàm nhận trạng thái [Cường Hóa Ngoại Lực]:
Tăng gấp đôi (x2) lượng Hồi phục HP và lượng Khiên nhận được từ nguồn bên ngoài (từ kỹ năng/buff của đồng đội, không áp dụng cho Nội tại tự hồi/tự tạo khiên của bản thân hắn).
Quy tắc hệ thống: Lượng Overheal (Hồi máu vượt ngưỡng) nhận từ kỹ năng này sẽ bị hủy bỏ (Không chuyển thành khiên). Các nguồn Khiên nhận được nhân đôi từ kỹ năng này vẫn phải tuân thủ nghiêm ngặt mô tả thời gian tồn tại và Cap giới hạn của chính nguồn cấp khiên đó.

ULTIMATE: HOÀNG THIÊN ĐẠI PHÁ
Cơ chế: Tấn công 1 mục tiêu đơn lẻ.
Sát thương: Gây 180% (WIL + ATK) + 20% HP hiện có của Mặc Phàm.
Hiệu ứng Chuyển Hóa (Instant): Sau khi gây sát thương, hệ thống quét toàn bộ lượng Khiên hiện có trên người Mặc Phàm và thực hiện chuyển đổi:
Tăng chỉ số: Mỗi 1 điểm Khiên tiêu hao = Tăng thêm 0.5 điểm vào Max HP vĩnh viễn trong trận.
Hồi phục: Đồng thời hồi phục ngay lập tức một lượng HP bằng đúng lượng Max HP vừa được tăng thêm.
(Ví dụ minh họa: HP hiện tại 150/400, Khiên hiện tại là 200. Sau khi nổ Ult: Tiêu hao 200 Khiên \rightarrow Tăng thêm 100 Max HP và Hồi 100 HP. Chỉ số mới: HP 250 / Max HP 500, Khiên về 0).

52)
warrior, Ur.
mô tả: một ma kiếm sĩ vì thanh kiếm đặc biệt của mình có thể bỏ qua phòng ngự khi gây sát thương.

nội tại: Khi Hp về 0, hồi hp cho leader = 50% max hp của bản thân, hắn trở lại deck lần nữa nhưng cost giảm 3 (có thể cộng dồn với cơ chế từ kit khác), nội tại kích hoạt 1 lần/trận, Quy Tắc.

đánh thường: tiếp cận mục tiêu, chém xéo gây sát thương = 100% wil/atk.

skill 1: cắm kiếm xuống đất, triệu hồi 1 thiên thạch va chạm vào ô 8 của kẻ thù gây sát thương = 180% atk+wil của bản thân, 0,8s sau đó thiên thạch phát nổ, gây aoe lần nữa lên ô 5/7/8/9 của kẻ thù, mỗi kẻ nhận sát thương = 100% wil (có thể giảm bằng res) của char này cùng nhận sát thương atk = 10% hp hiện có của char này (có thể giảm = arm). cost 30 ae và hp = 5% hp max (giữ hp còn 1 khi dùng skill này lúc hp dưới 5% max hp 1 lần/trận, lần sau dùng skill này khi hp dưới 5% max hp sẽ chết, không giảm mx hp, khiên/res/arm không có tác dụng giảm sát thương trong trường hợp này). Vậy leader địch nhận sát thương tổng cộng từ skill này là 280% wil + 180% atk + sát thương atk = 10% hp hiện có của char này.

skill 2: mỗi khi đánh thường - 2 ae để được hồi phục = 10% sát thương đánh thường gây ra, kích hoạt 1 lần/turn. khi không đủ ae sẽ không kích hoạt.

skill 3: chém dọc ô 2/5/8 gây sát thương chuẩn = 50% hp hiện tại lên mỗi kẻ địch, hồi hp = 20% tổng sát thương gây ra, overheal bị bỏ qua, 25 ae.

ultimate: nhảy lên cao, rơi vào ô 5 của kẻ thù và chém gây sát thương = 150% wil + atk lên kẻ đứng ở ô số 5, sau đó múa kiếm, ô 5 cùng các ô còn lại nhận sát thương = 150% wil + atk cùng sát thương chuẩn = 5% max hp của nhân vật này (nếu ô 5 không có kẻ thù đứng thì bỏ qua phần gây sát thương lên ô 5 và chỉ gây aoe xung quanh).

52)
ssr, mage
nội tại: mỗi lần dùng ultimate đều tạo 1 orb laze bay sau lưng, tối đa 10 orb, tăng 5% atk/wil hiện có/mỗi orb laze, orb laze không có thanh hp, không thể nhận sát thương, pháp tắc. nhận vật này không thể follow up attack, riêng phần không thể follow up attack mang tag axiom.

skill 1: khi đánh thường nếu orb gây sát thương lên mục tiêu có hp dưới hoặc = 5% max hp của chúng thì lập tức tàn sát chúng, kết liễu, đưa hp của chúng về 0 (vẫn có thể hồi sinh hoặc về deck tùy cơ chế của chúng), chỉ kích hoạt khi đánh thường, -30 ae/lần kích hoạt, kích hoạt tối đa 4 lần/trận.

skill 2: khi đánh thường gây sát thương vượt 40% max hp của đối phương sẽ hồi hp cho bản thân = 40% sát thương do đòn đánh đó gây ra lên kẻ thù, -10 ae/lần kích hoạt, không cap/trận. Pháp Tắc.

skill 3: khi gây sát thương vượt 15% max hp của kẻ thù (đánh thường, debuff gây sát thương theo thời gian,..) thì mỗi 1% vượt nhận 3 rage, không giới hạn lần kích hoạt/trận/turn, rage thừa sẽ bị bỏ qua. -5 ae mỗi lần kích hoạt bất kể lượng rage nhận được là bao nhiêu. vậy nếu gây sát thương= 25% max hp của mục tiêu hắn sẽ nhận 30 rage và phe đó mất 5 ae.
gây sát thương đúng 15% max hp của mục tiêu skill này sẽ không kích hoạt.

ult: cast 2 lần đánh thường, nếu 2 lần đánh thường kích hoạt skill 1/2/3 thì tiêu hao ae sẽ bị bỏ qua, không tốn ae nhưng skill vẫn kích hoạt.

đánh thường: chưởng 1 chưởng, tấn công 1 mục tiêu từ xa gây sát thương = 100% wil/atk lên chúng, mỗi orb đang có cũng sẽ tấn công cùng lúc gây sát thương = 30% wil/atk của hắn/orb lên mục tiêu (vì tấn công cùng lúc nên sát thương orb gây ra có thể gộp chung khi hiện số, sát thương orb và đánh thường gây ra cần hiện số riêng tức hiện số sát thương 2 lần)

53)
support, ssr
nội tại: khi hắn hiện diện trên sân, phe đồng minh tiêu hao AE khi dùng skill bị giảm đi 20%, char nào cast skill do dùng ultimate không tính. nội tại không áp dụng với bản thân. Pháp Tắc.

skill 1: hồi hp cho đồng minh ngẫu nhiên (trừ Prime có thần tính) = 30% max hp của họ, họ nhận debuff phản hồi phục (heal nhận được từ mọi nguồn chuyển thành sát thương và bỏ qua khiên/res/arm) trong 1 turn, 20 ae.

skill 2: 

54)

skill 1: gán debuff phản hồi phục cho toàn bộ kẻ thù có mặt trên sân (trừ Prime có thần tính) sau đó heal cho chúng = 200% wil/atk của bản thân. pháp tắc, debuff này có thể xoá hoặc miễn nhiễm nếu thắng phán định xung đột tag với char này, 25 ae. debuff tồn tại 2 turn.

skill 2: 

skill 3:

55) 

nội tại: khi hp dưới hoặc =11% max hp (từ 1 đến 11), hồi và khoá hp ở 11% mx hp, không thể tăng hay giảm trong 1 turn dù nhận sát thương kể cả sát thương chuẩn, debuff gây sát thương, pháp tắc, kích hoạt 3 lần/trận, nếu nhận sát thương vượt 11% mx hp và lượng sát thương đó đủ để hp về 0 nội tại sẽ không kích 3, nếu dính debuff tàn sát (hoặc buff tàn sát của kẻ gây sát thương) không có tag pháp/quy tắc/axiom thì nội tại này có thể kích hoạt. nếu debuff/buff xung đột với nội tại này có tag pháp tắc sẽ phán định xung đột tag, nếu có tag axiom/quy tắc nội tại này sẽ không kích hoạt.




56)
mô tả: một char chuyển wil thành atk, thuần atk.
nội tại: mọi đòn đánh gây sát thương lên mục tiêu đều bỏ qua 20% res của chúng.
chuyển 100% wil sang atk khi gây sát thương, ví dụ hắn có 5 wil và 8 atk thì sát thương đầu ra là 13 atk và không có wil. sát thương của char này vẫn có thể giảm bằng res và đa số cơ chế khác.

đánh thường: bắn 1 phát laze từ xa gây sát thương = 100% wil/atk tức gây sát thương = 100% wil+atk nhưng nguồn ra là atk mà không có wil.

skill 1: trước khi gây sát thương atk lên 1 mục tiêu có hp dưới hoặc = 10% mx hp của chúng, nhận 1 buff excute (kết liễu), - hp = 5% max hp của bản thân (không giảm mx hp) và 15 ae của team đồng minh mỗi lần kích hoạt, tự kích hoạt, bị động, dạng nội tại nhưng tốn cost.

skill 2: kích hoạt, giảm 30% res hiện tại của mọi mục tiêu trên sân trong 2 turn, có hiệu lực ngay lập tức khi kích hoạt, turn kích hoạt của char này tính là 1 turn trong bộ đếm 2 turn đó. debuff giảm res này các char đồng minh cũng được hưởng, 35 ae, stack với nội tại cùng các debuff, cơ chế giảm res đồng cấp từ nguồn khác, đồng cấp là cấp bậc tag pháp tắc/quy tắc và axiom, nếu char khác có cơ chế giảm res như char này thì cả 2 hoặc nhiều hơn 2 cơ chế có thể stack với nhau nếu kit của đối phương không mô tả là cấm stack, dù vậy nếu kit của họ giới hạn giảm res tối đa của mục tiêu ví dụ là 25% đi thì họ vẫn giảm 25% res của kẻ thù, kit của char này vẫn giảm res bình thường nếu không bị hệ thống tag ưu tiên chặn.

skill 3: triệu hồi vệ tinh bắn 1 chùm lazer toàn sân kẻ thù (vfx), gây sát thương = 180% atk + wil (nguồn ra là atk không có wil vì wil được chuyển 1:1 sang atk) của bản thân, sau đó hắn tóm lấy 1 kẻ địch (tuân theo SSI), gây sát thương chuẩn = 10% mx hp của bản thân hắn lên mục tiêu, 35 ae.

ultimate: dùng skill 3 nhưng không tốn ae, +10% sát thương và hồi hp = 10% sát thương gây ra bằng dùng skill 3 bởi ultimate. Axiom: hồi phục từ ultimate này không thể tạo khiên, overheal bị bỏ qua.


57)

mô tả:

đánh thường:

nội tại: sau khi dùng ultimate, snapshot mọi chỉ số hiện tại và trở về deck (xoá sạch mọi trạng thái tốt lẫn xấu, debuff/buff bất kể chúng có trong 3 tag ưu tiên hay không, nói chung như mới triệu hồi lần đầu từ deck ra sân), cost giảm 1, khi ra sân nhận vĩnh viễn 50% mọi chỉ số đã snapshot, kích hoạt tối đa 5 lần, khi hp về 0 lần đầu trong trận, không chết, hồi hp = 1% mx hp, xoá mọi debuff/mark trên người kể cả từ đồng minh lẫn kẻ thù nếu chúng dưới cấp Quy Tắc, kích hoạt 1 lần/trận. Pháp Tắc.

skill 1:

skill 2:

skill 3:

ultimate:


58)

tanker, ur

nội tại: hồi hp = 50% sát thương bản thân gây ra sau khi dùng ultimate và neo định chỉ số còn tồn tại. Quy Tắc.

skill 1: nhận 1 turn taunt hoặc 1 turn reflect với tỉ lệ 50/50, - 20 ae và 5 rage. sau đó cũng hồi lập tức 5% hp đã mất.

skill 2: khi 1 đồng minh bị tấn công và lượng sát thương sắp đến vượt ngưỡng máu tử, tức nếu nhận sát thương đó đồng minh ấy sẽ chết thì hắn sẽ đổi chỗ với đối phương nếu không bị stun, sleep và nhận sát thương sắp đến đó, chỉ có thể tự kích 3 khi không neo định, cap tối đa 3 lần/trận và mục tiêu phải là rank ssr trở lên và không phải summon của summoner thuộc đồng minh hay kẻ thù nhét summon qua sân đồng minh, cost: 30 ae, -10% hp hiện có cùng 30 rage. Đây là skill dạng nội tại tự kích hoạt khi đủ điều kiện, không thể tốn 1 turn để kích hoạt chủ động. Pháp Tắc.

skill 3: hồi hp = 30% hp đã mất của hiện tại trong 2 turn, ví dụ: hắn dùng skill 3 lúc hp còn 30/100 thì ngay khi dùng skill này hắn được hồi 30% của hp đã mất là 70= 21 hp, turn sau hắn được hồi 30% của 49 hp đã mất là 14,7 làm tròn 14, hp hắn có sau 2 turn là 65/100, vậy cụm từ '30% hp đã mất của hiện tại' có biến động nhé. cost 20 ae và 10 rage, có thể dùng khi neo định chỉ số. Đương nhiên ví dụ này dựa trên điều kiện tiên quyết là trong 2 turn đó hắn không nhận bất kỳ sát thương nào, trong trận đấu lượng 30% hp đã mất của hiện tại sẽ thay đổi và không giống ví dụ này. vậy nếu hắn neo định chỉ số qua ultimate sau đó bị dính debuff phản hồi phục và player không quan sát lỡ dùng skill 3 thì ví dụ là: hp còn 40/100, hồi 30% hp đã mất là 30% của 60 = 18 nhưng vì debuff phản hồi phục nên hắn nhận 18 sát thương chuẩn, hp còn lại là 22/100, đến turn hắn hành động thì skill 2 kích hoạt lần nữa, heal nhận 30% của 78 là 23,4 làm tròn 23 nhưng vì hắn còn 22 hp nên hắn sẽ chết vì hp về 0 nếu không có cơ chế nào từ nhân vật khác hoặc leader cứu hắn.
nếu có nhân vật nào có kit cứu hắn như ngăn đồng minh chết, hồi hp cho đồng minh (hắn trong ngữ cảnh này) nhưng có nhân vật đối phương dạng kiểu kết liễu kẻ địch dưới x% hp ví dụ 5% đi thì hắn sẽ được ngăn tử vong, hồi hp do kit của đồng minh, sau đó nếu kit của đồng minh hồi hp dưới 5% max hp của bản thân hắn thì hắn sẽ chết do bị kit của kẻ thù kết liễu. nếu kit của đồng minh cứu hắn và kit của kẻ thù muốn hắn chết thì sẽ áp dụng cơ chế phán định xung đột tag đã có để cho ra kết quả cuối cùng. Pháp Tắc.

ultimate: neo định mọi chỉ số của bản thân lúc ultimate, không thể bị giảm hoặc tăng bất kỳ chỉ số nào trong 2 turn bởi kẻ thù lẫn đồng minh kể cả hồi hp (giảm chỉ số, giảm rage, ae hắn cung cấp cho bể ae chung khi hành động) (trừ bản thân hắn), Quy Tắc, debuff và buff/mark của kẻ thù lẫn đồng minh vẫn áp dụng lên bản thân nhưng nếu có thay đổi bất kỳ chỉ số nào thì đều cần phán định xung đột tag kể cả đó là đồng minh. Lúc ultimate xong sẽ neo định ngay lập tức nên lúc đó đã tính là 1 trong bộ đếm 2 turn neo định. Nếu neo định mà bị tấn công bởi kẻ có buff excute (kết liễu) thì vẫn sẽ chết nếu đạt điều kiện kết liễu.

Đây chẳng phải là tanker tối thượng sao? debuff phản hồi phục là cách khắc chế hắn vì debuff vẫn áp lên người hắn, nếu hắn tự heal và vì nguồn heal không phải của người khác nên vẫn có thể heal và hắn sẽ nhận sát thương, vì sát thương từ debuff này bỏ qua res cùng arm nên chẳng khác nào sát thương chuẩn.

59) Vô Lượng (Anatta), SSR, Tanker.
mô tả: Chúng Sinh Khổ Tướng, 

nội tại: khi nhận sát thương vượt 25% mx hp nhận buff reflect 35% trong 1 turn, sau đó hồi hp = 30% sát thương phản được trong lúc nhận buff phản sát thương, Pháp Tắc. ví dụ hắn có 100 hp, bị đánh còn 75 hp, lập tức nhận 1 buff phản 35% sát thương cấp Pháp Tắc trong 1 turn, lúc nhận sát thương đến lúc hắn hành động tức 1 turn bộ bộ đếm nội tại này, trong 1 turn đó sát thương bị phản bởi buff cấp pháp tắc này sau 1 turn kết thúc sẽ hồi hp cho hắn với tỉ lệ 30%. nếu hắn nhận 15 sát thương trong 1 turn đó hắn được hồi 4,5 hp sau khi 1 turn kết thúc, nội tại kích hoạt 1 lần/turn hành động của hắn. vậy về cơ bản hắn có thể kích hoạt nội tại liên tục nếu nhận sát thương hơn 25% mx hp và được hồi hp mãi nhờ nguồn ngoài.

skill 1: -25 rage mỗi khi kích hoạt, tự động kích hoạt khi bị đánh vượt 18% mx hp, nhận 4 ae với mỗi 1% vượt. Pháp Tắc.

skill 2: gây sát thương = 2 đánh thường lên 1 mục tiêu, 20 ae và 3 rage. không tính đánh thường.

skill 3: dậm chân mạnh xuống đất gây 1 đợt sóng đất(vfx), gây sát thương dọc vào 3 ô trước mặt, mỗi kẻ đứng trong 3 ô này nhận sát thương = 1 đánh thường và bị - 10 rage, 30 ae, không tính đánh thường.

đánh thường: đấm mục tiêu gây sát thương=100% wil +atk.

ultimate: cast 2 lần skill 3 mà không tốn rage cùng ae, sau khi cast xong tăng 20% res cùng arm của bản thân trong 1 turn đồng thời nhận 10 rage.

60) Vô Thường (Anicca), Ranger, SSR.
Mô tả: Chúng Sinh Mệnh Tướng,

nội tại: vào trận nhận 1 buff hút máu, hồi hp = 22% sát thương gây ra trong turn đó, sau đó buff sẽ tự mất trong 1 turn, sau 1 turn đó lại nhận buff hút máu lần nữa, turn sau nữa buff hút máu lại mất, turn có turn không lặp lại đến khi chết.

đánh thường: bắn 1 mũi tên vào mục tiêu gây sát thương = 100% wil + atk.

skill 1: bắn 3 mũi tên lên trời (vfx), rơi ngẫu nhiên lên 3 kẻ địch, mỗi kẻ nhận 1 đánh thường, tính là đánh thường nhưng không follow up attack, 20 ae.

skill 2: vận sức trong 1 turn, 1 turn đó vẫn nhận sát thương, sau 1 turn bắn 1 mũi tên vào leader địch gây sát thương= 320% đánh thường, 40 ae.

skill 3: tăng 30% atk và 10% wil trong 2 turn, hiệu lực turn sau lúc kích hoạt kỹ năng, kích hoạt xong cũng nhận 1 khiên = 10% mx hp, tức là sài skill này lập tức nhận khiên =10% mx hp, turn sau đến lượt char này char nay sẽ được+30% atk, 10% wil trong 2 turn. cost 25 ae 10 rage và hp = 4% mx hp.

ultimate: cast skill 1 và skill 2 cùng lúc, skill 2 sẽ không cần vận sức, cả 2 skill đều cast không tốn cost, sau khi dùng ult xong không thể tăng rage qua hành động trong 1 turn và bị giảm 2,5% max hp (reset nếu chết rồi hồi sinh). tức ultimate là bắn 4 mũi tên, trong đó 3 mũi random vào 3 kẻ địch ngẫu nhiên (không thể là leader) gây sát thương = 1 đánh thường, 1 mũi tên bắn leader địch gây sát thương= 320% đánh thường, nếu đang có nội tại thì sẽ được hồi hp = (tổng sát thương của sát thương gây ra lên 3 kẻ địch (1 đánh thường/kẻ) và 320% sát thương đánh thường gây lên leader địch) * 22% hút máu từ nội tại, và buff này có thể + dồn.

61) Vô Niệm (Asankha) Mage, Ur.
mô tả: Chúng Sinh Ý Tướng

nội tại: Đạo hữu, ngươi rất lo nghĩ a: khi gây sát thương, gán 1 mark 'lo nghĩ' lên mục tiêu. Lo nghĩ: khi đạt 3 mark, bản thân lâm vào suy nghĩ, chỉ có thể đánh thường trong 1 turn, atk cùng wil cũng bị giảm 25% trong 1 turn đó. tức kẻ thù dính 3 mark lo nghĩ khi hành động sẽ bị giảm 25% wil cùng atk và chỉ có thể đánh thường khi đạt 3 mark. mark biến mất khi đạt 3 trên 1 mục tiêu hoặc mark trên 1 mục tiêu tối đa 2 turn hành động của mục tiêu mà mục tiêu không nhận mark mới. Quy Tắc.
với mỗi kẻ thù kích hoạt 'lo nghĩ' thành công, hắn được + 5% hp/wil dựa trên hp mx và wil hiện có lúc kích hoạt lo nghĩ trên kẻ thù. reset khi chết và được hồi sinh hoặc về deck.

skill 1: khi hp về 0, vẫn chết, sau 2 turn sẽ tự động hồi sinh, khi hồi sinh bằng skill này sẽ có 50% hp cùng 100% mọi chỉ số khác của lúc còn sống, ae và rage = 0, kích hoạt tự động khi chết lần đầu trong trận đấu, kích hoạt 1 lần/trận khi kích hoạt không thể được hồi sinh từ mọi kỹ năng khác từ nguồn không phải bản thân. Quy tắc.

skill 2: gây aoe toàn sân = 1 đánh thường/mục tiêu, giảm 5 rage của mỗi mục tiêu trúng kỹ năng này, 30 ae.

skill 3: sau kích hoạt, lần dùng kỹ năng tiếp theo sẽ được x2 mark thay vì 1 mark lên kẻ thù, 25 ae.

ultimate: gây aoe cố định lên hàng 2/5/8, mỗi kẻ nhận sát thương = 2,5 đòn đánh thường, không áp mark từ sát thương của ultimate này lên kẻ thù nhưng nếu kẻ đứng trên đường gây sát thương của ultimate đang có 1 hoặc hơn 1 mark 'lo nghĩ' thì lập tức đạt 3 mark và kích hoạt hiệu ứng của mark này lên mục tiêu. Tức kẻ đứng ở ô 2/5/8 nhận 1 lần sát thương = 250% đánh thường của char này, nếu bản thân họ có 1 hoặc hơn 1 mark lo nghĩ trên bản thân thì lập tức kích hoạt hiệu ứng của mark này đồng thời xoá mark vì mark đã được kích hoạt, dù vậy ultimate không áp mark lo nghĩ lên mục tiêu theo nội tại nên nếu có kẻ dính ultimate mà không có mark lo nghĩ trên bản thân sẽ không bị dính hiệu ứng cấp quy tắc là giảm 25% atk/wil và chỉ có thể đánh thường trong 1 turn.

62) Vô Tướng Chi Chủ, Prime, không class cố định.
nội tại: một char đặc thù, chỉ có thể xuất hiện ở collection khi player sở hữu Anicca, Asankha và Anatta, khi không sỡ hữu 3 char này icon và thông tin về hắn sẽ không hiện trong collection, khi vào trận có đủ 3 char đã nhắc trên sân thì trên deck sẽ xuất hiện icon của hắn, cost của hắn là trung bình cộng của cost của Anicca, Asankha và Anatta, hắn khi được triệu hồi từ deck ra sân thì cả 3 char sẽ biến mất, chết hoàn toàn không thể hồi sinh trong trận đấu kể cả Vô Tướng Chi Chủ chết trận cũng không thể hồi sinh Anicca, Asankha và Anatta, khi ra sân hắn hưởng 30% chỉ số của Anicca và Anatta cùng 40% của Asankha, thừa hưởng chỉ số là toàn bộ, dẫu vậy chỉ số của hắn sẽ được tính theo rank multi trước rồi mới được + chỉ số từ thừa hưởng.
khi vào trận hắn được nhận random 1 class, tức trận này là warrior, trận sau có thể là ranger hoặc support, class của hắn là random 7 class, tỉ lệ random ra 7 class là đều nhau, 100%/7 = 14,285.
hắn trong collection không thể mặc trang bị, awaken cùng nâng sao, học công pháp.
mỗi lần đánh thường + 1% chỉ số ngẫu nhiên trừ ae và rage của hiện tại (nếu random ra class ranger và dùng skill 1 thì tỉ lệ + từ nội tại vẫn là 1% chỉ số vì skill này là đánh thường).

skill 1: chưởng ngẫu nhiên từ 2 đến 5 chưởng, tổng kẻ thù luôn nhận tổng sát thương là 500% đánh thường của hắn, tức nếu random 2 chưởng thì mỗi kẻ nhận 250% đánh thường của hắn, chưởng ra 5 chưởng thì mỗi kẻ nhận sát thương= 100% đánh thường của hắn, sát thương từ kỹ năng này không phải đánh thường, không thể follow up. cost 30 ae.
nếu hắn là ranger, skill này là đánh thường (tính đánh thường lên mỗi kẻ nhận sát thương từ skill này, và đánh thường có thể follow up Attack), là mage skill này tăng tỉ lệ sát thương từ 500% wil/atk lên 600% wil và 500% atk, là warrior thì tăng tỉ lệ sát thương từ 500 lên 600% atk và 500% wil, tức nếu random ra 3 và hắn là warrior thì mỗi kẻ nhận 200% ATK và 500%/3 wil của hắn. nếu hắn là support l, skill này -5 ae cost. nếu hắn là assassin, hồi hp= 10% sát thương gây ra của kỹ năng này.

skill 2: khi hp dưới hoặc = 15%, hồi lập tức 65% max hp, đổi lại bị mất 20% mx hp, tức hắn có hp dưới hoặc = 15%, player sẽ thấy hắn đầy cây hp nhưng max hp của hắn ở mặt hiển thị đã mỏng đi vì mất 20% max hp. Nếu hắn là summoner thì có thể kích hoạt skill này lần 2 nhưng lần 2 sẽ mất 40% mx hp (tính từ max hp kích hoạt lần 1, tức 80% của lần 1 tức 100% của lần 2 sau đó bị trừ thêm 40%) thay vì lần 1, cap kích hoạt là 1/trận, nếu random ra class summoner thì là 2, tự trừ 15 ae/lần kích hoạt, nếu không đủ ae sẽ không thể tự kích hoạt, đây là skill bị động tự kích hoạt khi đủ điều kiện.
Ban đầu: 100% Max HP.
Sau kích hoạt 1: Thanh Max HP mỏng đi, chỉ còn dài bằng 80% ban đầu (nhưng được hồi đầy cái thanh 80% đó nếu kích hoạt ở mức 15% mx hp).
Sau kích hoạt 2: Thanh Max HP tiếp tục mỏng đi, chỉ còn dài bằng 48% so với ban đầu (so với lúc chưa kích hoạt skill này và được hồi đầy cái thanh 48% đó nếu kích hoạt lúc còn 15% mx hp của lần kích hoạt đầu tiên).

skill 3: gây aoe toàn sân, mỗi kẻ trúng nhận sát thương= 200% atk và 200% wil của hắn, cost 40 ae. nếu random ra class support cost giảm 50%.

nội tại đánh thường (skill 1 tính đánh thường nhưng không tính nội tại này):
nếu random ra class summoner và đánh thường giết mục tiêu thì lập tức triệu hồi 1 creep có 50% chỉ số của kẻ đã chết bởi đòn đánh thường này, rank của creep cũng = kẻ đã chết.
nếu random ra class support, đánh thường + 2 ae và rage cho bản thân, ae cho ae pool chung của đồng minh.

ultimate: niệm chú, lập tức tăng 1 class lên bản thân, class nhận không thể trùng (chỉ số cơ bản vẫn tính là 1 class (random đầu trận), nhưng bonus từ kit sẽ được tăng theo class tương ứng)
khi class hiện có là 7 thì dùng ultimate sẽ không tăng class nữa mà đổi sang dùng skill 1 1 lần nhưng không tốn ae.

62) Mai Vô Niệm (梅无念) warrior, ur.
Nội tại – Nghịch Cảnh: Mỗi khi Né tránh, Chặn hoặc Phản đòn thành công nhờ chỉ số AGI, nhân vật sẽ nhận tự động đánh thường lên kẻ tấn công mình, attack animation của kẻ tấn công sẽ + 1s để hắn có time phản đòn, đòn đánh từ nội tại không tính là 1 turn của hắn.

skill 1: 


ultimate: Nhất Kiếm Cách Thế: gây sát thương chuẩn = 170% wil/atk lên 1 mục tiêu, giảm max hp của đối phương= 30% hp đã mất của chúng sau khi dính ultimate này, quy tắc. ví dụ kẻ thù có 100 hp, hắn bị đánh còn 90/100 hp, dính ultimate này còn 40/100 hp, hp đã mất là 60, giảm hp mx = 30% của 60 là 18 hp, vậy hp còn lại của hắn là 40/82.
quy tắc giảm mx hp từ ultimate này bị giảm 50% khi đánh boss.


63)
Ur, Tanker.
nội tại: Vào trận luôn nhận buff phản sát thương với tỉ lệ 50%, hp regen +1000% trong trận, +1 ae vào pool khi hành động. hp regen và buff phản sát thương không thể xoá, sao chép, nội tại cấp quy tắc. nếu bị xóa bỏ do thắng phán định xung đột tag thì hiệu ứng từ nội tại sẽ chỉ biến mất trong 1 turn, turn sau đến lúc hắn hành động lại sẽ nhận hiệu ứng từ nội tại.

skill 1: + 1% mọi chỉ số (dựa theo chỉ số lúc kích hoạt) mỗi khi đánh thường, - 2 ae/lần kích hoạt, kích hoạt 1 lần/turn, không cap/trận.

skill 2: bay lên không, chưởng 1 chưởng cực to, toàn bộ kẻ địch trên sân nhận sát thương = 5 đánh thường của hắn/kẻ, cost: - hp = 60% mx hp cùng 20 ae, không thể tăng rage từ kỹ năng này. không thể dùng khi hp dưới 61%.

skill 3: khi hp dưới hoặc =15%, giảm 20% mx hp sau đó hồi đầy cây hp, tự kích hoạt, bị động, -15 ae mỗi lần kích hoạt, kích hoạt max 2 lần/trận.

ultimate: nếu hp dưới 25%:
tăng hp = 20% hp mx lúc ultimate sau đó hồi hp = 8% mx hp.
nếu hp trên 25% mx hp:
cast 1 lần skill 2 nhưng cost giảm 60% tức giảm hp từ 60 xuống 24%, ae từ 10 còn 8, lưu ý skill 2 và ult đều không giảm mx hp.

đánh thường: chưởng 1 chưởng ấn, chưởng ấn bay đến mục tiêu, gây sát thương= 100% wil/atk, hồi hp = 20% sát thương đánh thường gây ra.

64)

ultimate: tăng mx hp = 50% hp đã mất sau đó hồi hp = 10% mx hp, ví dụ: hắn có 50/100 hp, dùng ultimate thì 62,5/125 hp.

65)

nội tại: Bất Diệt Bá Thể
không vào luân hồi, không thể phục sinh, chết là hết (riêng phần này thuộc tag axiom).

mỗi khi ultimate sẽ nâng cấp nội tại, cấp độ của nội tại là: thức tỉnh, tiểu thành, đại thành, viên mãn.
thức tỉnh: vào trận nhận 12% res/arm/atk/wil, hp regen +400% dựa vào chỉ số lúc được triệu hồi hoặc trong collection ( không bị bất cứ kit từ bất kỳ nhân vật, leader nào ảnh hưởng). Pháp Tắc (chỉ hiệu lực với mô tả của cấp thức tỉnh, bị xoá bỏ sau khi ult nâng cấp nội tại)
tiểu thành: tăng 50% hiệu ứng + từ thức tỉnh, sát thương nhận vào giảm 20% trừ sát thương chuẩn.
đại thành: giữ hiệu ứng + của tiểu thành, khi nhận sát thương vượt 15% mx hp sẽ lập tức hồi hp = 8% mx hp, không giới hạn lần kích hoạt/turn hay /trận, phần giảm 20% sát thương nhận của tiểu thành giữ nguyên. Quy Tắc (chỉ hiệu lực với mô tả của cấp đại thành, bị xoá bỏ sau khi ult nâng cấp nội tại)
viên mãn: tăng 120% hiệu ứng + từ thức tỉnh (phần + chỉ số này không + dồn với tiểu thành và đại thành), giảm sát thương nhận vào trừ sát thương chuẩn từ 20% đến 30%. khi nhận sát thương vượt 18% mx hp sẽ lập tức hồi hp = 10% mx hp, không giới hạn lần kích hoạt/turn hay /trận, phần giảm 20% sát thương nhận của tiểu thành giữ nguyên (không cộng dồn với hiệu ứng của đại thành, đây là bản nâng cấp). khi hp về 0 sẽ tại chỗ phục sinh nhưng giảm 20% mx hp, sau đó hồi hp = 12% mx hp của hiện tại, 0 rage, vẫn giữ cấp độ của nội tại lúc chết, Axiom (chỉ hiệu lực với mô tả của cấp viên mãn, các tag mô tả của cấp nội tại thấp hơn cấp này sẽ bị xoá bỏ sau khi nâng nội tại lên cấp này).
tức nhân vật này có tag ưu tiên nâng cấp theo cấp độ của nội tại.


66)

nội tại: Bách Độc Bá Thể
không vào luân hồi, không thể phục sinh, chết là hết (riêng phần này thuộc tag axiom).

kẻ tấn công hắn bằng đòn đánh cận chiến sẽ bị dính 1 debuff độc, gây sát thương chuẩn = 1% mx hp của chúng/turn hành động của chúng/3 turn của chúng. không cap lần kích hoạt/turn hay/trận.
hắn tăng mx hp = 50% sát thương kẻ thù nhận từ debuff độc thuộc nội tại của bản thân, cũng đồng thời hồi hp = lượng hp đã tăng đó, lượng hp hắn nhận được tính vào hp regen.
cả nội tại vào trận thuộc tag pháp tắc, sau lần ultimate 1, cả nội tại lên tag quy tắc, sau lần ultimate 2, cả nội tại lên tag axiom (trừ phần không vào luân hồi, không thể phục sinh vì nó tag axiom sẵn khi vào trận). debuff độc của riêng hắn cũng thuộc cấp tag khác nhau theo số lần ultimate.


67)

ultimate: Tạo 1 lớp khiên cho toàn đồng minh có mặt trên sân, mỗi đồng minh nhận khiên = 20% mx hp + 60% wil/atk của hắn, khi lớp khiên bể, nhận 1 buff giảm 50% sát thương, lượng sát thương bị giảm là có cap, cap = khiên đồng minh nhận được từ ultimate của hắn. ví dụ nhận khiên = 50(khiên)/60/100 (hp), khiên bị đánh bể, đồng minh nhận sát thương sẽ bị giảm 50%, ví dụ nhận 20 sát thương giảm còn 10, sau đó trừ vào cap khiên đã bể là 50-10=40, vậy cap tồn tại của buff giảm sát thương= 100% lượng sát thương nhận vào (đã giảm 50%) - lượng khiên đồng minh đó nhận từ ultimate này, đương nhiên khiên đã bể và buff này chỉ xuất hiện khi khiên từ hắn bể, khiên từ ultimate này có thể + dồn với khiên từ nguồn khác, không cap khiên, buff giảm 50% sát thương của ultimate này bị giới hạn tồn tại tối đa 3 turn. vậy khiên 50 bể, cap buff giảm 50% sát thương= 100% khiên nhận từ ultimate cũng tức 50, nhưng sát thương đến là 120 đi, bị giảm 50% là 60 nhưng cap buff là 50 vậy đồng minh đó nhận 70 sát thương.
mô tả gọn: Tạo khiên cho toàn đội bằng 20% Max HP + 60% WIL/ATK. Khi khiên bị phá hủy, đồng minh nhận buff giảm 50% sát thương nhận vào trong tối đa 3 turn. Tổng lượng sát thương được giảm từ buff này không vượt quá lượng khiên ban đầu nhận được.

68)

nội tại: khi thanh nộ đạt 70%, tăng 50% rage nhận được.

ult: cắn 1 mục tiêu, thôn phệ 10% max hp của đối phương cho bản thân, lượng hp thôn phệ được sẽ tăng max hp và hồi hp tương ứng.

69)

nội tại: rage nhận được từ mọi nguồn kể cả ngoài bản thân đều + 60%.

ultimate: 2 tay nện đầu mục tiêu, gây sát thương= 200% wil + atk, gây debuff chảy máu, mất 3% max hp/turn trong 3 turn.

70)

nội tại: mỗi lần bị tấn công cận chiến, kẻ tấn công bị thiêu đốt, nhận sát thương = 3% max hp + 10% wil/atk của hắn/turn trong 2 turn, trong 2 turn này lượng hồi phục hp nhận được từ nguồn không phải của bản thân kẻ tấn công cũng bị giảm 30%.

71) Viên Chúc
Summoner, Ur.

nội tại: mỗi lần đánh giết 1 kẻ thù (không tính summon), rút 50% bản nguyên linh hồn của chúng, tạo ra Trành Quỷ. Kẻ bị Viên Chúc giết vẫn có thể hồi sinh (nếu không bị kit của bản thân kẻ đó hoặc kit từ nguồn khác ảnh hưởng), nhưng sau khi hồi sinh kẻ đó chỉ được hưởng 50% mọi chỉ số (trừ rage) vì 50% còn lại do bị viên chúc đánh cắp bản nguyên linh hồn tạo ra Trành Quỷ, nếu trành quỷ chết vì bất kỳ lý do gì, lượng bản nguyên linh hồn sẽ trả về cho kẻ bị đánh cắp, hồi phục chỉ số, nếu A có 100 hp 10 mọi chỉ số thì sau khi bị giết bởi viên chúc, viên chúc cướp 50% bản nguyên linh hồn tạo trành quỷ, A được hồi sinh với 50 hp cùng 5 mọi chỉ số khác, sau đó trành quỷ tương ứng của A bị giết, lúc đó A có 30/50 hp cùng 4 atk, 3 wil (2 chỉ số này giảm do debuff hoặc bị giảm vĩnh viễn,.. từ kit khác) cùng 5 mọi chỉ số khác thì sẽ hồi phục thành 80/100 hp, 9 atk, 8 wil cùng 10 mọi chỉ số khác, lúc này chỉ số wil/atk bị ảnh hưởng có thể sẽ hồi phục hoặc giữ nguyên hoặc tệ hơn từ kit ảnh hưởng 2 chỉ số này của A, kit của viên chúc không can thiệp.
Trành Quỷ: thừa hưởng 50% chỉ số của kẻ Viên Chúc giết, tồn tại tối đa 5 turn. cap tối đa 4 trành quỷ tồn tại cùng lúc, nếu trong mode auto đầy ô trên sân, trành quỷ có hp thấp nhất sẽ tự động tử vong (trả chỉ số) và trành quỷ mới sẽ thay thế chỗ đó.
cả nội tại thuộc tag quy tắc.

skill 1: class ae tạo khi hành động và rage nhận tăng gấp đôi trong 3 turn, trong 3 turn đó cũng nhận sát thương chuẩn = 5% max hp của bản thân, cd 1 turn của bản thân, 25 ae. Quy Tắc.

skill 2: hắn cùng trành quỷ tồn tại trên sân 

ult: đấm mục tiêu, gây sát thương chuẩn = 3% max hp của kẻ địch + 200% wil/atk (phần wil/atk này không có sát thương chuẩn, chỉ phần 3% max hp của kẻ địch là st chuẩn) của Viên Chúc, sau đó sau lưng kẻ bị đấm xuất hiện âm ảnh (vfx) lao về các mục tiêu sau lưng của kẻ bị đấm (nếu có, nếu không có ai sau lưng kẻ bị đấm vì mục tiêu đứng hàng 7/8/9 thì sẽ không xuất hiện âm ảnh gây sát thương), mỗi kẻ trên đường đi thẳng của âm ảnh nhận sát thương = 100% wil/atk của Viên Chúc.

72) Đạo Mộng Dao

Mage, Ur.
nội tại: Tam Khí Quy Lai: khi vào trận, chia bản thể làm 3, cả 3 đều hưởng chỉ số = nhau, tuân theo logic lượt đánh của từng mode, trong vĩnh dạ sẽ tự hành động theo AI và player có thể hoán đổi bất kỳ 1 trong 3 bản thể đó, khi không điều khiển AI sẽ điều khiển. Khi 1 bản thể chết, 120% mọi chỉ số scale bởi rank multi của bản thể đó chia đều cho 2 bản thể còn lại, mỗi kẻ nhận 60% chỉ số từ bản thể đã chết, khi có thêm 1 bản thể nữa chết đi, bản thể còn sống duy nhất sẽ nhận 120% mọi chỉ số được scale rank multi của kẻ đã chết.
vậy, 100% chỉ số (mặc định các chỉ số được scale bởi rank mult) của char này ở collection khi vào trận sẽ được chia 3, tạo ra 3 kẻ giống nhau như đúc, để dễ ví dụ, gọi tên chúng là A, B và C, C chết, A và B nhận 60% mọi chỉ số của C, sau đó A hoặc B chết thì kẻ còn sống nhận 120% mọi chỉ số kẻ chết có kể cả nhận được từ C. Trường hợp này chỉ phân biệt kẻ chết đầu tiên và thứ 2 trong 3 kẻ 
để dễ gọi, gọi kẻ lúc chia làm 3 là Sơ Đại, 3 kẻ khi được chia ra gọi là Nhất Đại.

khi nhất đại đầu tiên trong cả 3 hành động, nhất đại đó tạo ae nhưng 2 nhất đại còn lại sẽ không tạo ae, đến turn của nhất đại đầu tiên lần nữa lại tạo ae và nhâtd đại còn lại sẽ không tạo, nếu nhất đại đầu tiên bị cc cứng không hành động được thì 2 nhất đại còn lại vẫn sẽ không tạo ae.
nếu nhất đại đầu tiên hành động chết, nhất đại còn lại ai hành động trước sẽ tạo ae, kẻ còn lại không tạo ae, cứ thế lặp lại, giới hạn này để tránh nhân vật này tạo ae quá mức.

Lúc Nhất Đại chết, 2 nhất đại còn lại hưởng chỉ số hiện có lúc Nhất đại chết đang có nên bất kỳ debuff/buff/mark hay hiệu ứng nào ảnh hưởng chỉ số đều có thể ảnh hưởng đến nội tại này.
Riêng nội tại này cấp Quy Tắc (phần chia 3 lần 1/2/3, hưởng chỉ số và hợp nhất lần 1/2 cùng không thể hồi sinh sau khi chia 3 lần 3).
Khi hợp nhất thành Sơ đại nhưng sơ đại bị đánh hoàn toàn tử vong, và nếu có thể hồi sinh thình lại kích hoạt nội tại này lần nữa và Sơ đại lúc chia 3 lần thứ 2 cũng sẽ hưởng chỉ số từ lần hợp nhất đầu tiên nên 3 Nhất đại ở lần chia 3 thứ 2 sẽ mạnh hơn lần đầu, sau đó hợp nhất sẽ càng mạnh hơn nữa, khi Sơ đại hợp nhất lần 2 hoàn toàn tử vong, nếu được hồi sinh, cả 3 lại chia 3 và đương nhiên mạnh hơn lần chia 3 thứ 2 nhưng cả 3 không thể hợp nhất và chia chỉ số nữa, khi 1 trong 3 sơ đại ở lần chia thứ 3 chết, họ sẽ chết thật và vĩnh viễn không thêt hồi sinh trong trận đấu đó.
Vì chia 3 nên lực chiến sẽ yếu; sao, tu vi, awaken giữ nguyên nhưng lực chiến sẽ bị chia 3, vì vậy nội tại của nhân vật cấp quy tắc này khi chia 3 rất dễ bị phán định thua trong xung đột tag, vậy nên Viên Chúc là khắc tinh của nhân vật này, khi bị đánh cắp linh hồn bản nguyên bởi Viên Chúc thì chỉ số của Nhất Đại đã chết sẽ bị chia 2, tức 100% chỉ số của nhất đại chia 2, 50% còn lại thì 2 Nhất đại còn lại mỗi kẻ hưởng 60% của 50% chỉ số còn lại của nhất đại đã chết. Đến khi Nhất đại thứ 2 chết và bị đánh cắp linh hồn bản nguyên bởi Viên chúc thì nhất đại còn lại hưởng 120% chỉ số của 50% còn lại đó, nói chung càng chia càng yếu cũng không sai, trường hợp này gần như 100% đúng vì lực chiến bị chia 3 nên 1 con nhất đại phán định xung đột tag với Viên Chúc là không thể thắng, mà hình như không có xung đột tag nữa, vì nội tại này không có kiểu "linh hồn không thể bị ảnh hưởng " hoặc "chỉ số sau khi nhất đại chết không thể bị giảm" hoặc quy tắc nào đó tương tự, nhưng tao sẽ không thêm, nên trừ phi có 1 char khác có kit bảo vệ linh hồn/chỉ số đồng minh không bị ảnh hưởng sau khi chết và kit của char đó thắng phán định xung đột tag với viên chúc còn không thì chỉ số của nhất đại bị giảm bởi Viên Chúc gần 100%.

thứ tự xử lý code khi gặp viên chúc hoặc case cướp chỉ số/linh hồn bản nguyên tương tự:
1. Nhất Đại bị Viên Chúc giết.
2. Nội tại Viên Chúc kích hoạt trước, cướp 50% bản nguyên linh hồn.
3. Trành Quỷ được tạo từ 50% chỉ số của Nhất Đại đã chết.
4. Nội tại Đạo Mộng Dao đọc phần chỉ số còn lại của Nhất Đại đã chết.
5. Hai Nhất Đại còn lại nhận 60% của phần còn lại đó.
vậy nên nếu bị viên chúc giết thì khi đã hợp nhất thành sơ Đại, chỉ số bị cướp tạo trành quỷ vẫn không được trả về và sẽ biến mất.
Do nội tại chụp chỉ số hiện có lúc chết, buff tạm được chuyển hóa thành lợi ích lâu dài cho Nhất Đại sống sót. Đặc biệt, buff đặt lên Nhất Đại chết thứ hai có giá trị cao hơn vì nó còn nhân cả phần chỉ số đã nhận từ cái chết đầu tiên.
Khi code, HP trong snapshot nên được hiểu là Max HP, không phải HP hiện tại, vì Nhất Đại ở thời điểm chết có current HP bằng 0.

trong mode chess hay turn base, các nhất đại được tính là 1 đơn vị độc lập và có turn riêng, tuân theo logic turn của mode, vậy nên trong 2 mode này các nhất đại chia 3 nên có thể 1 kẻ dùng 1 skill, đánh thường hoặc ultimate cũng có thể, skill và ult các nhâtd đại đều có thể dùng, khác biệt nằm ở chúng không có nội tại của sơ đại là Đạo Mộng Dao, skill khi 1 nhất đại dùng nếu có CD thì 2 nhất đại còn lại không thể dùng cho đến khi hết Cd của skill đó.

skill 1: cần chủ động kích hoạt và tốn 1 turn, Nhất Đại dùng skill này nhận khiêu khích trong 2 turn, trong 2 turn đó mọi buff/hiệu ứng/mark có lợi như tăng chỉ số sẽ được giữ trên nhất đại nhận "khiêu khích", debuff/mark/hiệu ứng có hại trên người nhất đại có khiêu khích từ skill này sẽ được chuyển ngẫu nhiên sang 2 nhất đại còn lại (mỗi nhất đại chỉ nhận 1 loại debuff/mark/hiệu ứng xấu), đồng thời mỗi turn chuyển hp = 5% max hp (không giảm max hp/kẻ cho 2 nhất đại không nhận khiêu khích từ skill này, 25 aether. Sau khi hết Khiêu Khích, skill này cd 1 turn, turn thứ 2 sau khi hết Khiêu khích mới có thể dùng lại. Quy Tắc.

Khiêu Khích tồn tại trong 2 vòng của phe Đạo Mộng Dao, 2 turn của nhất đại kích hoạt skill 1.

Việc chuyển HP không thể khiến Nhất Đại cho HP xuống dưới 1 HP.
Không được tính là sát thương.
Không kích hoạt khiên, phản sát thương, hút máu hoặc hiệu ứng khi nhận damage.
Không bị ARM/RES giảm.
Không chịu healing modifier.
là current HP.

Skill 2 trừ 5 AE tại đầu mỗi vòng của phe Đạo Mộng Dao.

Tổng chi phí duy trì tối đa:
5 AE × 2 vòng = 10 AE.

Không chuyển trạng thái độc bản như mark Sa Ấn, không chuyển mark/hiệu ứng không giảm chỉ số, mỗi lần chuyển nếu có xung đột tag cần phán định xung đột với nguồn của hiệu ứng/mark cần chuyển.
Không chuyển Quy Tắc/Axiom nếu không thắng xung đột.
Không chuyển hiệu ứng gắn với nguồn hoặc mục tiêu cụ thể.
Chỉ chuyển buff/debuff chỉ số thua phán định xung đột tag.

skill 2: tự kích hoạt khi một nhất đại dùng skill 1 thành công và có khiêu khích, chuyển 10% mọi chỉ số của 2 nhất đại còn lại cho nhất đại có khiêu khích từ skill 1, tự không kích hoạt khi không có nhất đại nào có khiêu khích từ skill 1, khiêu khích từ nguồn ngoài skill 1 không kích hoạt skill này, mỗi turn kích hoạt trừ 5 ae, khi ngắt kích hoạt sau khi chuyển chỉ số, hoàn lại chỉ số được chuyển, trong time chuyển chỉ số 2 nhất đại được nhận lớp khiên = 20% max hp của chúng, nếu có khiên từ nguồn khác và nguồn đó có cap thì khiên từ skill này không dính cap, tức khiên nguồn khác có cap thì vẫn đạt cap như bình thường, khiên từ skill này vẫn được cộng thêm mà không dính cap, Trong time kích hoạt khi 1 hoặc 2 nhất đại nhận sát thương hẳn phải tử vong khi skill 1 kích hoạt, chuyển 100% sát thương đó sang nhất đại nhận "khiêu khích" từ skill 1. Pháp Tắc.

skill 3: mọi nhất đại hoặc sơ đại đang có mặt trên sân nếu không bị cc cứng không thể hành động đều sẽ chưởng 1 chương gây sát thương aoe cột dọc = 230% wil/atk của chúng, cột dọc có thể trùng mục tiêu, pháp tắc. 30 ae. Vậy nếu có 3 nhất đại thì 1 nhất đại dùng skill này 2 nhất đại còn lại cũng sẽ dùng skill này nhưng không tốn turn hay ae của 2 nhất đại còn lại, chỉ số của chúng khác nhau nên sát thương gây ra cũng sẽ khác nhau, sau khi dùng skill này 2 nhất đại còn lại vẫn còn turn như logic lượt bình thường.
cd 2 turn của nhất đại đầu tiên dùng skill này.

ultimate: gây aoe toàn sân = 200% wil/atk, kẻ nào nhận sát thương từ ult và mất hp tối thiểu = 20% max hp của chúng (budget tính chung với cả 3 nhất đại) nhận thêm sát thương chuẩn = 15% max hp của chúng.
nếu có 1 nhất đại đầy rage và dùng ultimate, 2 nhất đại còn lại trừ phi bị cc cứng không thể hành động nếu không cũng cast ult và không bị bỏ qua lượt nên nếu 1 nhất đại cast ult xong và 2 nhất đại khác cũng cast ult thì lượt của nhất đại đầu tiên đã kết thúc nhưng lượt của tối đa 2 nhất đại còn lại vẫn còn (như skill 3).

1. Ghi tổng lượng HP thật sự từng mục tiêu đã mất
   từ tất cả các cast thuộc cùng Ensemble Ultimate.

2. Không tính damage bị khiên hấp thụ.

3. Nếu tổng HP mất >= 20% Max HP của mục tiêu:
   gây thêm đúng 1 lần sát thương chuẩn bằng 15% Max HP.

4. Mỗi mục tiêu chỉ kích hoạt bonus một lần
   trong một Ensemble Ultimate.

khi 1 nhất đại đầy rage cast ult, tối đa 2 nhất đại còn lại cũng cast ult, sau cast ult trừ nhất đại đầu cast ult và rage về 0, 2 nhất đại còn lại không mất turn nhưng rage cũng về 0.
Nếu một Nhất Đại bị hard CC:
Nó không cast.
Rage của nó vẫn về 0 để tránh giữ ult dùng ngay vòng sau.

Đây là phần quan trọng nhất để code không ra kết quả khác thiết kế.
Khi Nhất Đại có Khiêu Khích chết trong lúc Skill 2 hoạt động, thứ tự nên là:
1. Xác nhận sát thương chí tử và nguồn giết.

2. Giải quyết hiệu ứng của kẻ giết kích hoạt trước nội tại Đạo Mộng Dao.
   Ví dụ Viên Chúc cướp 50% bản nguyên.

3. Chụp snapshot chỉ số còn lại của Nhất Đại đã chết:
   Max HP, ATK, WIL, ARM, RES, HP Regen.

4. Tam Khí Quy Lai dùng snapshot đó để truyền chỉ số.

5. Skill 1 và Skill 2 kết thúc trên Nhất Đại đã chết.

6. Chỉ số tạm thời Skill 2 đã mượn được hoàn trả cho
   những Nhất Đại cho mượn còn sống.

7. Loại Nhất Đại chết khỏi sân.
Phải snapshot trước khi Skill 2 hoàn trả chỉ số. Nếu hoàn trả trước, lượng 10% được dồn vào Tế Thân sẽ không được nội tại ghi nhận, khiến Skill 2 mất phần lớn ý nghĩa.

Khi gặp Viên Chúc:
1. Viên Chúc giết Tế Thân.
2. Viên Chúc cướp 50% chỉ số hiện có, bao gồm phần buff và chỉ số tạm đang được dồn.
3. Trành Quỷ được tạo.
4. Đạo Mộng Dao snapshot 50% còn lại.
5. Truyền 60% hoặc 120% phần còn lại.
6. Skill 2 hoàn trả lượng chỉ số đã mượn cho Nhất Đại còn sống.
Cả ba chết đồng thời
Nên xử lý:
Không còn Nhất Đại sống để nhận chỉ số.
Không hợp nhất.
Sơ Đại được tính là hoàn toàn tử vong.
Đây là counter AoE tự nhiên của nhân vật.
Hai thân chết đồng thời, một thân sống
Không nên cho thân chết thứ hai nhận chỉ số từ thân chết thứ nhất rồi mới truyền tiếp, vì nó đã bị đánh dấu tử vong trong cùng damage batch.
Nên:
Chụp snapshot của cả hai thân từ trạng thái ngay trước damage batch.
Chọn thứ tự chết ổn định bằng action resolution order hoặc instanceId.
Thân sống nhận:
- 60% snapshot của kẻ chết thứ nhất.
- 120% snapshot của kẻ chết thứ hai.

Kẻ đã bị đánh dấu tử vong không nhận chỉ số trung gian.
Điều này tránh kết quả phụ thuộc animation hoặc thứ tự duyệt array.
Max HP thừa hưởng tăng current HP cùng lượng.
Khi nhận thêm X Max HP từ Tam Khí Quy Lai:
- Max HP tăng X.
- Current HP cũng tăng X.
Ví Dụ:
A đang 20/40 HP.
Nhận thêm 30 Max HP.

Sau khi nhận:
50/70 HP.

73) Hoá Thân Ký Ức Chi Chủ

Nội tại, Ngã Tự Bất Vong: Khi Hp về 0, 2 turn sau (mỗi khi đến turn của ô hắn chết tính 1 turn bất kể ô đó có ai đứng hay không) phục sinh với hp = 30% max hp/100% max hp có lúc tử vong ở lần trước (+15%/lần phục sinh) và 100% mọi chỉ số được rank mul scale của lần tử vong trước, phục sinh tối đa 3 lần trong trận, trong 1 turn của hắn sau phục sinh, bị mọi đơn vị kẻ thù lãng quên trong 1 turn đó, không phải và không gán mark/buff/hiệu ứng xấu lên kẻ thù, đây là hiệu ứng đặc thù áp dụng lên bản thân hắn, ở 2 lần phục sinh đầu player/npc kẻ thù vẫn có thể thấy hắn, ở lần phục sinh thứ 3 hắn biết mất khỏi tầm mắt của nhân vật trong game lẫn player đang chơi game trong thời gian lãng quên tác dụng, trong quãng thời gian lãng quên kích hoạt, hắn vẫn có thể tấn công nhưng vị trí hắn đứng, debuff/buff/hiệu ứng/mark/hp bar của hắn đều mất tác dụng và không hiển thị cho player kẻ thù thấy, nếu pve thì AI địch cũng sẽ bỏ qua hắn khỏi suy nghĩ, đương nhiên vì tấn công nên player chơi game biết hắn đang ở trạng thái lãng quên, AI cũng biết nhưng chính là không thể target mục tiêu bởi bất kỳ kit nào dù có gây sát thương hay không khi hắn ở trạng thái Lãng Quên.
Vì chỉ số lấy từ lần phục sinh trước nên nếu bị ảnh hưởng chỉ số thì sức mạnh của hắn sẽ biến động theo.
Nhân vật này có Thần Tính.
toàn bộ nội tại mang tag Quy Tắc, riêng thần tính mang tag Axiom.
Thần tính miễn nhiễm mọi kit gây hiệu ứng xấu nên không sợ Viên Chúc, mọi Prime có thần tính đều không sợ hắn.

skill 1, : khi kích hoạt khiến 3 kẻ thù ngẫu nhiên quên mất 1 kỹ năng của chúng trong 1 turn, tức trong 1 turn đó không thể dùng kỹ năng bị quên, 25 ae. 1 turn đó tính từ turn hành động của chúng, nên khi bị dính skill này khi đến turn của kẻ bị dính chúng không thể dùng skill bị lãng quên, đến turn sau mới có thể dùng, quy tắc.
khi dùng skill này xong, lâm vào cd 2 turn, mỗi khi hắn hành động cd -1 turn. Quy Tắc.
chỉ khiến mục tiêu quên lãng ultimate, target trước, nếu mục tiêu có mội tại chống quên lãng skill thì phán định xung đột tag theo quy trình, nếu không có xung đột tag thì chắc chắn khiến mục tiêu quên lãng 1 skill, không chọn target trùng tức skill này không thể khiến 1 target quên 2 skill trong 1 lần cast skill này.

skill 2, Đau Đớn Hồi Tưởng: tự kích hoạt khi 1 đồng minh gây sát thương lên 1 hoặc nhiều mục tiêu và khiến chúng mất tối thiểu 30% max hp của bản thân chúng, khiến những kẻ đó nhận thêm 1 lần sát thương (sát thương chuẩn) nữa nhưng = 50% sát thương đồng minh khiến chúng mất hp tối thiểu = 30% max hp, mỗi lần kích hoạt bất kể ảnh hưởng 1 hay nhiều mục tiêu đều tốn 30 ae, không target leader địch. Ví dụ, đồng minh gây aoe đánh 2 kẻ thù gây ra sát thương = 30% max hp của kẻ thù, skill này tự kích hoạt, trừ ae, kẻ thù đó lập tức nhận thêm 50% sát thương đồng minh gây ra lên chúng dưới dạng sát thương chuẩn. Đồng minh gây sát thương> skill này gây thêm sát thương, không ảnh hưởng đến đồng minh. Skill này chỉ tái hiện sát thương đồng minh gây ra dưới dạng sát thương chuẩn, đồng minh gây sát thương có debuff/mark hoặc bất kỳ hiệu ứng nào skill này đều sẽ không tái hiện, đây là 1 skill thuần sát thương, Pháp Tắc. Không tự kích hoạt khi thiếu ae, skill này và skill 3 không thể kích hoạt thủ công.

Skill 3 — Tái Diễn Ký Ức: tự kích hoạt khi có 3 kẻ thù đánh thường liên tiếp, tức có 1 kẻ thù đánh thường, đến lượt tiếp theo của phe kẻ thù lại có thêm 1 kẻ đánh thường nữa và đến turn tiếp của kẻ thù lại có thêm 1 kẻ đánh thường nữa thì skill này sẽ tự kích hoạt. Khiến 3 kẻ đó không thể dùng skill/ultimate bất kể đầy rage mà chỉ có thể đánh thường trong 2 turn tiếp theo của cá nhân chúng, -15 ae/lần kích hoạt, không kích hoạt khi thiếu ae. Nếu trong 3 kẻ đó có kẻ chết thì cd bắt đầu đếm khi những kẻ còn sống bị ảnh hưởng bởi skill này thực thi xong 2 turn đánh thường.
Skill 3 vào cooldown ngay sau khi kích hoạt.
CD 2 lượt hành động của Ký Ức Chi Chủ.
Trong thời gian CD, skill không thể ghi nhận chuỗi mới.

Hiệu ứng khóa trên ba mục tiêu vẫn tồn tại độc lập
cho đủ hai lượt cá nhân của từng mục tiêu.
Nếu không đủ AE ở thời điểm đòn thứ ba xảy ra:
skill không kích hoạt và chuỗi reset.
vậy nếu cả 3 còn sống thì khi kích hoạt skill này + điều kiện kích hoạt thì 3 kẻ đó sẽ đánh thường mỗi kẻ 3 lần liên tiếp.

ultimate: gây aoe toàn sân = 200% wil/atk của bản thân, tự hồi hp cho bản thân = 20% tổng sát thương ult này gây ra.
ta không hồi phục, đau đớn khiến chúng nghĩ về ta, ký ức về ta càng thêm sâu đậm, càng nghĩ thì càng ám ảnh.

Mỗi lần phục sinh lấy:
100% Max HP
100% ATK
100% WIL
100% ARM
100% RES
100% HP Regen
từ trạng thái lúc tử vong trước.
Nên hiểu rõ:
Max HP được snapshot, không phải current HP.
Current HP khi phục sinh được tính bằng 30% / 45% / 60% của Max HP đã snapshot.
Buff/debuff/mark không được sao chép như một object.
Chỉ giá trị chỉ số sau khi chúng tác động được snapshot.
Thời hạn buff cũ không được mang sang.
Giá trị đã snapshot trở thành bộ chỉ số nền chiến đấu mới của lần phục sinh kế tiếp
Ví dụ:
Max HP gốc: 100
Được buff +50% Max HP trước khi chết
Max HP lúc chết: 150

Phục sinh lần 1:
Max HP mới: 150
Current HP: 45/150
Đây là bản sắc rất mạnh: support đồng đội có thể “viết lại ký ức về bản thể” của hắn trước mỗi lần chết.
ở trạng thái lãng quên không thể target hắn nhưng aoe cố định vị trí có thể đánh trúng hắn.
lưu ý aoe cố định vị trí khác aoe target ngẫu nhiên, như skill 3 và ult của Đạo Mộng Dao là aoe cố định, nhưng skill 3 hắn đứng ngay hàng không có nhất đại nào cast skill 3 thì đương nhiên không dính.
Thoại:
1. Ta không hồi sinh. Ta chỉ nhớ lại hình dạng mình từng có.
2. Người sống nhớ người chết. Còn ta, người chết tự nhớ lấy chính mình.
3. Khi tất cả đều quên, ký ức của ta sẽ trở thành sự thật duy nhất.
4. Câu thoại khi phục sinh lần ba:
Lần này, ngay cả cái nhìn của ngươi cũng không còn nhớ nổi ta.
5. Câu khi dùng ultimate:
Ta quyết định điều gì đã từng xảy ra.
6. Thoại khi dùng skill 1:
Ngươi không bị cấm sử dụng nó. Ngươi chỉ không còn nhớ mình từng biết nó.
và: Ngươi từng biết cách dùng nó sao?
8. Thoại khi dùng skill 2:
Đau đớn là thứ ký ức trung thực nhất.
9. thoại khi dùng skill 3:
Ba lần như một. Hãy tiếp tục đi.

Buff/debuff không được mang sang dưới dạng hiệu ứng,
nhưng hậu quả chúng gây lên chỉ số được ký ức ghi nhận
và trở thành chỉ số nền của lần phục sinh sau.
Nó khiến support buff hắn trước lúc chết có giá trị thật sự. Kẻ địch cũng có thể cố giảm chỉ số hắn trước khi kết liễu để “ghi lại một phiên bản yếu hơn”.
Đây là tương tác hai chiều rất tốt.
Không thể được chọn làm target.
Không xuất hiện trong danh sách target ngẫu nhiên.
AI địch bỏ qua hắn.
AoE đã xác định vùng tác động vẫn có thể đánh trúng nếu hắn đứng trong vùng.
Nên code tách thành hai giai đoạn:
Target Selection:
Lãng Quên bị loại khỏi danh sách mục tiêu.

Area Resolution:
Nếu vùng AoE đã được tạo và vị trí của hắn nằm trong vùng,
hắn vẫn nhận sát thương/hiệu ứng.
Ví dụ:
Skill chọn ba mục tiêu ngẫu nhiên: không thể chọn hắn.
AoE toàn sân: vẫn đánh trúng.
AoE cột dọc: chỉ đánh trúng nếu hắn đứng đúng cột.
AoE lấy một unit làm tâm: không thể lấy hắn làm tâm, nhưng nếu lấy unit khác làm tâm và hắn nằm trong bán kính thì vẫn trúng.
Cách này vừa đúng “bị quên”, vừa không biến thành miễn nhiễm tuyệt đối.
skill 1:
Chọn ngẫu nhiên 3 kẻ thù khác nhau trước.
Sau đó mỗi mục tiêu quên ngẫu nhiên 1 kỹ năng chủ động hoặc ultimate.
Không chọn nội tại và đánh thường.
Nên viết kỹ thuật như sau:
Khi kích hoạt, chọn ngẫu nhiên tối đa 3 kẻ thù khác nhau.

Với mỗi mục tiêu, chọn ngẫu nhiên 1 kỹ năng chủ động hoặc ultimate
đang tồn tại trong kit của mục tiêu. Mục tiêu quên kỹ năng đó
trong lượt hành động cá nhân kế tiếp.

Trong lượt này, kỹ năng bị quên không thể được sử dụng,
kể cả khi đã hết cooldown hoặc ultimate đã đầy rage.

Sau khi mục tiêu hoàn thành lượt hành động đó,
trạng thái Quên Lãng Kỹ Năng biến mất.
Nếu một mục tiêu không có kỹ năng hợp lệ:
Không tiêu hao lượt chọn vào mục tiêu đó;
hệ thống tìm mục tiêu khác nếu còn mục tiêu hợp lệ.
Xung đột tag
Nên xử lý:
1. Chọn ba mục tiêu hợp lệ.
2. Chọn kỹ năng sẽ bị quên của từng mục tiêu.
3. Kiểm tra mục tiêu có cơ chế chống quên lãng kỹ năng hay không.
4. Chỉ khi có mâu thuẫn trực tiếp mới phán định tag.
5. Nếu không có cơ chế chống lại, Quên Lãng chắc chắn thành công.
Các skill tự kích hoạt 2 và 3 không được tính là hành động giảm cooldown Skill 1.
skill 2
Để tránh multi-hit kích hoạt nhiều lần, nên chốt:
Sau khi một hành động gây sát thương của đồng minh hoàn toàn kết thúc,
tổng hợp lượng HP thật sự từng mục tiêu đã mất từ hành động đó.

Mỗi mục tiêu không phải leader địch, nếu mất tối thiểu 30% Max HP,
sẽ trở thành mục tiêu hợp lệ của Skill 2.

Nếu có ít nhất một mục tiêu hợp lệ và team có đủ 30 AE,
Skill 2 tự kích hoạt đúng một lần cho toàn bộ hành động đó.
Như vậy:
Một skill 10 hit không kích hoạt 10 lần.
Một AoE trúng năm người chỉ tốn 30 AE một lần.
Mỗi mục tiêu nhận echo riêng theo damage thực tế nó đã chịu.
Damage dùng để tái hiện
Nên là:
Actual HP damage
Tức:
Tính sau ARM/RES và giảm sát thương.
Không tính phần bị khiên hấp thụ.
Không tính overkill.
Không tính damage lên vật thể không có HP thông thường nếu không được phép.
Không sao chép debuff, mark, control, hút máu hoặc hiệu ứng kèm theo.
Ví dụ:
Mục tiêu Max HP 1.000.
Đồng minh làm mất thật 400 HP.
Skill 2 gây thêm 200 sát thương chuẩn.
ví dụ:
Đòn đầu làm mất 30% HP
→ echo 15% Max HP
→ tổng cộng mất 45%.

Đòn đầu làm mất 50% HP
→ echo thêm 25%
→ tổng cộng mất 75%.

Đòn đầu làm mất 66,67% HP
→ echo thêm 33,33%
→ về lý thuyết đủ giết mục tiêu.
Sát thương từ Skill 2 không thể kích hoạt lại Skill 2.
Không kích hoạt passive “khi đồng minh dùng skill”.
Không tạo AE.
Không tạo lượt.
Không tính là hành động của Ký Ức Chi Chủ.
skill 3:
Ba lượt hành động cá nhân liên tiếp của phe địch.
Ba unit khác nhau.
Cả ba đều chọn đánh thường làm hành động chính.
Ví dụ:
A đánh thường
B đánh thường
C đánh thường
→ kích hoạt.
A đánh thường
B đánh thường
A đánh thường
→ không kích hoạt vì chỉ có hai unit khác nhau.
Không nên tính:
Phản công.
Đòn đánh phụ.
Follow-up.
Linked cast.
Summon đánh thay.
Đánh thường do bị cưỡng chế bởi chính Skill 3.
Đánh thường ngoài lượt.
Một unit có extra turn đánh nhiều lần.
Chỉ tính:
Hành động chính trong lượt cá nhân hợp lệ.
Chuỗi reset nếu:
Kẻ địch dùng skill.
Kẻ địch dùng ultimate.
Kẻ địch bỏ lượt do chủ động phòng thủ nếu mode có.
Một hành động không phải đánh thường xảy ra.
Khi kích hoạt:
Ba unit vừa tạo chuỗi chỉ có thể chọn đánh thường
trong hai lượt hành động cá nhân tiếp theo của từng unit.

Không thể dùng skill.
Không thể dùng ultimate.
Không tiêu hao rage.
Không khóa nội tại.
Sau khi mỗi unit đã trải qua hai lượt cá nhân, khóa trên unit đó hết.
Skill 2 và Skill 3:
Không tiêu hao lượt.
Không tạo AE.
Không giảm cooldown của Skill 1.
Không tăng rage.
Không kích hoạt hiệu ứng “sau khi hành động”.
Không kích hoạt hiệu ứng “khi dùng skill” nếu hệ thống không ghi rõ.
Ultimate:
AoE toàn sân = 200% WIL/ATK.
Hồi HP bằng tổng 20% sát thương ultimate gây ra.
Nên tính hồi dựa trên:
Tổng actual HP damage gây lên mọi mục tiêu.
Không tính:
Damage bị khiên hấp thụ.
Overkill.
Damage lên vật thể không hợp lệ.
Sát thương phản lại.
Damage phụ từ nguồn khác.
lượng hồi phục thừa, vượt max hp của hắn sẽ bị bỏ qua và không thể chuyển sang khiên trừ phi có kit của char khác có hiệu ứng chuyển overheal của đồng minh sang khiên và kit đó thắng được nội tại Thần Tính cấp Axiom của hắn, để khả thi đó cần là 1 prime khác có lực chiến cao hơn hắn.

74) 

Silas Blackspur — Xạ Thủ Hoàng Hôn

Class: Ranger
Rank: SSR
Nội tại — Thiện Xạ
Mỗi khi một hoặc nhiều kẻ địch bước vào trạng thái Hất Tung, nếu Silas còn trên sân, không chịu CC cứng và vẫn được phép đánh thường, hắn lập tức kích hoạt Thiện Xạ.

Thiện Xạ:
Bắn một phát vào từng mục tiêu vừa bị hất tung.
Mỗi phát sử dụng toàn bộ công thức của đòn đánh thường.
Đây là Follow-up Thiện Xạ, không phải Basic Attack action.
Không có cooldown.
Không tiêu hao AE, Rage hoặc tài nguyên khác.
Không tạo thêm lượt tự nhiên.
Không kích hoạt hiệu ứng yêu cầu Silas “sử dụng đánh thường”, trừ những kỹ năng trong chính kit ghi rõ ngoại lệ.

Giới hạn kích hoạt
Silas có một cửa sổ Thiện Xạ giữa hai lượt tự nhiên của bản thân:
Khi vào sân, cap bắt đầu từ 0.
Sau mỗi lượt tự nhiên của Silas kết thúc, cap Thiện Xạ trở về 0.
Trong mỗi cửa sổ, Thiện Xạ được kích hoạt tối đa 5 lần.

Một lượt bị mất do CC vẫn là lượt tự nhiên đã tiêu hao và vẫn reset cửa sổ.
Nếu nhiều kẻ địch bị hất tung trong cùng một event:
Chỉ tính là một lần kích hoạt Thiện Xạ.
Cap chỉ tăng 1.
Silas bắn đồng thời vào toàn bộ mục tiêu hợp lệ.
Tất cả phát bắn dùng chung một snapshot chỉ số.
Kết quả trên mục tiêu trước không làm thay đổi damage của mục tiêu sau trong cùng đợt.

Hiệu chỉnh đường ngắm
Mỗi lần Thiện Xạ kích hoạt, trước khi bắn:
Tăng tạm thời 3% ATK hiện có của Silas.
Hiệu ứng cộng dồn theo chỉ số hiện có.
Tối đa 5 tầng thông thường trong mỗi cửa sổ Thiện Xạ.
Toàn bộ tầng tạm thời biến mất khi cap Thiện Xạ reset.


Một event hất tung đồng thời chỉ cấp một tầng 3%, bất kể số mục tiêu.

Điều kiện khóa
Thiện Xạ không kích hoạt nếu tại thời điểm Hất Tung được commit, Silas:
Đã chết hoặc rời sân.
Đang chịu CC cứng.
Đang bị cấm đánh thường hoặc bị tước vũ khí.
Không thể chọn mục tiêu đó làm mục tiêu hợp lệ.
Trigger bị bỏ lỡ không được lưu lại để bắn sau.
Một AIRBORNE event chỉ được Thiện Xạ quan sát một lần. Refresh trạng thái khi mục tiêu vẫn đang trên không không tạo trigger mới.

Skill 1 — Tọa Độ Truy Nã
Cost: 5 AE
Cooldown: Không có.
Silas chọn một ô bất kỳ trên sân địch để đặt Tọa Độ Truy Nã, ngoại trừ ô số 8 của Leader địch.
Có thể đánh dấu ô trống hoặc ô đang có kẻ địch.
Tối đa tồn tại đồng thời 3 Tọa Độ Truy Nã.
Không thể đặt dấu thứ tư khi đã đủ 3.
Dấu không có giới hạn thời gian.
Toàn bộ dấu biến mất ngay khi Silas rời sân.

Bộ đếm của ô

Khi một kẻ địch đứng trên ô được đánh dấu và hoàn tất thành công hai lượt tự nhiên liên tiếp của chính nó:
Ngay sau action thứ hai được commit hoàn chỉnh, mục tiêu bị Hất Tung.
Hất Tung kéo dài 1 giây theo animation và reaction chain.
Sau khi chuỗi phản ứng hoàn tất, mục tiêu trở lại chính ô đó.
Tọa Độ Truy Nã bị tiêu hao.


Chỉ lượt tự nhiên SSI được tính:
Follow-up không tính.
Counter không tính.
Forced action không tính.
Ultimate chen hàng không tính.
Linked cast không tính.
Nếu mục tiêu mất lượt bởi CC, chuỗi “hai lượt liên tiếp” bị phá và bộ đếm trở về 0.

Tiến độ được gắn với iid của occupant:
Rời khỏi ô: tiến độ của unit đó mất.
Unit khác bước vào: bắt đầu từ 0.
Mục tiêu chết hoặc rời ô trong chính action thứ hai: dấu không hất tung, tiếp tục tồn tại trên ô.
Đối với Tanker

Nếu mục tiêu là Tanker có rank cao hơn Silas:
Hất Tung bị vô hiệu.
Thiện Xạ không kích hoạt từ lần đó.
Silas không nhận bonus ATK từ phát bắn đặc biệt.
Tọa Độ Truy Nã vẫn bị tiêu hao.

Phát bắn truy nã
Nếu Tọa Độ Truy Nã hất tung thành công mục tiêu và Silas đủ điều kiện kích hoạt Thiện Xạ:
Phát Thiện Xạ vào mục tiêu đó không tính vào cap 5 lần.
Tầng tăng 3% ATK từ đợt này không tính vào cap 5 tầng tạm thời.
Sau khi phát bắn thực sự được thực hiện, Silas tăng thêm 2% ATK hiện có.
Bonus 2% ATK tồn tại đến khi Silas rời sân.
Bonus này không có giới hạn tổng số tầng trong trận.

Nếu cùng một AIRBORNE event còn chứa mục tiêu bị hất tung từ nguồn khác:
Phần Thiện Xạ thông thường vẫn làm cap tăng 1.
Các phát vào mục tiêu do Tọa Độ Truy Nã hất tung không làm cap tăng thêm.
Toàn bộ đợt vẫn chỉ có một lần tăng 3% ATK trước snapshot.
Tầng đó được tính vào cap thông thường nếu trong đợt có ít nhất một mục tiêu hất tung từ nguồn khác.

Skill 2 — Khách Lạ Vào Trấn
Loại: Skill bị động tự kích hoạt
Cost mỗi lần: 5% Max HP dưới dạng HP Cost
Giới hạn: Tối đa 2 lần trong mỗi cửa sổ giữa hai lượt tự nhiên của Silas.
Khi một enemy summon vừa được triệu hồi hoàn chỉnh vào một ô đang có Tọa Độ Truy Nã, Silas kiểm tra điều kiện.

Summon đủ điều kiện nếu ít nhất một trong ba chỉ số sau đạt từ 60% chỉ số tương ứng của Silas trở lên:
Max HP.
ATK.
WIL.
Điều kiện chỉ cần đạt một chỉ số.
Các chỉ số của Silas dùng snapshot khi vào sân, không dùng ATK/WIL đã snowball trong trận.
Nếu summon đủ điều kiện và Silas đang có ít nhất 50% Max HP:
Silas trả HP Cost bằng 5% Max HP.
Thời gian kích hoạt của Tọa Độ Truy Nã trên ô đó giảm từ hai lượt tự nhiên thành một lượt tự nhiên thành công của occupant.
Hiệu ứng chỉ áp dụng cho một ô trong mỗi lần kích hoạt.
Không hất tung summon ngay khi nó vừa xuất hiện.

HP Cost:
Không qua khiên.
Không reflect.
Không lifesteal.
Không kích hoạt hiệu ứng “khi nhận damage”.
Không được khiến Silas chết.
Điều kiện HP được kiểm tra lại trước từng lần trả cost.

Nếu summon không đạt điều kiện 60%, Skill 2 không kích hoạt và không tiêu hao HP.
Những summon không có Chân Ngã vẫn được tính, miễn là có stat và là combat unit thực sự.

---

Skill 3 — Một Phát Thành Danh

Loại: Skill bị động có cost
Cost: 3 AE cho mỗi mục tiêu kích hoạt
Giới hạn: Tối đa 5 lần trong mỗi cửa sổ giữa hai lượt tự nhiên của Silas.
Mỗi khi Silas gây damage hợp lệ lên một mục tiêu bằng:
Đòn đánh thường.
Phát Thiện Xạ.
Nếu Actual HP Damage của đòn đó đạt ít nhất 25% Max HP của mục tiêu tại đầu action:
Tiêu hao 3 AE của phe.
Tăng 2,5% ATK hiện có của Silas.
Tăng 2,5% WIL hiện có của Silas.
Bonus tồn tại đến khi Silas rời sân.

Mỗi mục tiêu hợp lệ tạo một lần kích hoạt riêng.

Không tính:
Damage vào shield.
Overkill.
DoT.
Reflected damage.
Ultimate.
Các follow-up khác.

Thiện Xạ là ngoại lệ duy nhất trong nhóm follow-up được phép kích hoạt Skill 3.

Nếu một đợt Thiện Xạ đồng thời đánh nhiều mục tiêu và nhiều mục tiêu cùng đạt ngưỡng:

1. Damage lên toàn bộ mục tiêu được tính từ snapshot ban đầu.
2. Sau khi damage được commit, Skill 3 mới xử lý từng trigger.
3. Mỗi trigger tiêu hao 3 AE và cộng một tầng.
4. Xử lý theo thứ tự slot từ nhỏ đến lớn.
5. Không đủ AE thì trigger tương ứng bị bỏ qua.

Skill 3 không có giới hạn tổng tầng trong trận; chỉ có cap 5 lần mỗi cửa sổ.

---

Ultimate — Ba Tiếng Súng Hoàng Hôn
Silas liên tiếp bắn ba viên đạn vào phe địch.
Mỗi viên gây Mixed Damage gồm:
Physical Damage bằng 110% ATK.
Will Damage bằng 90% WIL.
Hai component được phòng thủ riêng:
Phần ATK chịu ARM.
Phần WIL chịu RES.
Quy tắc chọn mục tiêu
Một trong ba viên được xác định trước là Viên Đạn Định Mệnh và chắc chắn nhắm vào Leader địch.
Hai viên còn lại chọn ngẫu nhiên trong số kẻ địch hợp lệ còn sống.
Hai viên ngẫu nhiên có thể trùng mục tiêu với nhau.
Hai viên ngẫu nhiên cũng có thể tiếp tục trúng Leader.

Ultimate resolve tuần tự theo từng viên.
Nếu mục tiêu của viên chưa bắn chết trước khi viên đó được resolve, hệ thống chọn lại một mục tiêu hợp lệ theo seeded RNG.

Nếu Leader nhận DEATH_CONFIRMED và trận kết thúc, các viên chưa bắn bị hủy.

Ultimate:
Không tính là đánh thường.
Không kích hoạt Thiện Xạ.
Không kích hoạt Một Phát Thành Danh.
Không được hưởng các hiệu ứng chỉ áp dụng khi “sử dụng Basic Attack action”, trừ khi nguồn khác ghi rõ.

Nhịp vận hành

Đặt Tọa Độ Truy Nã
→ ép đối phương phải cân nhắc có tiếp tục đứng trên ô đó hay không
→ mục tiêu hoàn tất đủ lượt và bị hất tung
→ Thiện Xạ bắn miễn cap
→ Silas nhận ATK tạm thời và ATK dài hạn
→ phát bắn đủ mạnh kích hoạt Một Phát Thành Danh
→ ATK/WIL tiếp tục snowball
→ Ba Tiếng Súng Hoàng Hôn dùng lượng chỉ số đã tích để uy hiếp Leader.

Bộ kit này không cần buff thêm. Với tăng chỉ số theo chỉ số hiện có, Silas đã là UR tăng trưởng rất mạnh trong trận kéo dài; điểm yếu hợp lý của hắn là cần thời gian, cần AE và phụ thuộc vào việc giữ được quyền đánh thường.

75) 

ultimate: triệu hồi 3 trụ đá ngẫu nhiên (không thể trùng, nếu không đủ 3 kẻ thù chỉ triệu hồi 2 hoặc 1 trụ đá theo trường hợp) tấn công mục tiêu từ dưới chân chúng, gây sát thương bằng 1 đánh thường của bản thân/mỗi kẻ bị trụ đá tấn công, khiến chúng bị hất tung trong 1s, sau 1s, chúng rơi xuống vị trí cũ, nhận sát thương chuẩn = 3% max hp của bản thân chúng, ultimate này đối class tanker cao hơn bản thân không thể hất tung, phần sát thương 1 đánh thường tanker địch vẫn nhận nhưng hất tung và sát thương chuẩn sẽ không nhận (nếu tanker rank cao hơn bản thân), ultimate chọn target cũng ưu tiên mục tiêu không phải class tanker.

76) Luân Hồi Chi Chủ
Prime, Mage
nội tại: khi 1 đồng minh hoặc kẻ thù vào luân hồi, tạo 1 kén, kén đó tồn tại trong 1 turn, có hp = 80% max hp của hắn, kén giảm 65% mọi sát thương nhận vào từ mọi nguồn trừ sát thương chuẩn, sau 1 turn kén sẽ nở, nở ra 1 nhân vật mới có ngoại hình bất kỳ nhân vật nào có trong collection trừ ngoại hình của những nhân vật tham gia/tồn tại ở deck trong trận đấu đó, nhân vật mới đó sẽ thuộc về phe đồng minh của luân hồi chi chủ (kén từ nội tại này cũng tồn tại trên sân thuộc phe của hắn) bất kể chân ngã của kén đó trước khi chết thuộc về phe nào, nhân vật mới sẽ có 3 giai đoạn, ngoại hình của nhân vật mới đó sẽ không thay đổi theo giai đoạn.
Giai đoạn I, Ấu Niên: thừa hưởng 30% mọi chỉ số, nội tại, rank, đánh thường và ultimate và class thuộc chân ngã của bản thân từ đời trước trừ 3 skill.
Giai đoạn II, Thành Niên: trên cở sở đã có ở giai đoạn 1, tăng chỉ số thừa hưởng lên 20%, có thể dùng skill 1 của đời trước.
Giai đoạn III, Tráng Niên: trên cơ sở đã có ở giai đoạn 2, tăng chỉ số thừa hưởng lên 20%, có thể dùng skill 2 và 3 của đời trước.
Giai đoạn IV, Lão Niên: trên cơ sở giai đoạn 3, mỗi turn giảm 20% chỉ số thừa hưởng từ đời trước cho đến khi chết, hp max = 0 cũng sẽ chết.
khi kén nở, lập tức bước vào giai đoạn 1, nhân vật nở từ kén sẽ thuộc giai đoạn 1 trong 1 turn của bản thân, sau 1 turn đó đến turn tiếp theo bước vào Thành Niên, sau 2 turn của bản thân lại vào Tráng Niên, sau 3 turn của bản thân vào Lão Niên.
nội tại này khiến 1 char có ngoại hình của char A nhưng lại có kit của char B, ví dụ: Silas Blackspur phe địch chết và vào luân hồi, hắn bị nội tại này ảnh hưởng, trong sân thuốc phe của nội tại này xuất hiện kén trong 1 turn, 1 turn sau kén nở ra 1 char mới với ngoại hình và hành vi của Ur Đạo Mộng Dao nhưng có rank/nội tại/đánh thường/ultimate và 30% chỉ số của đời trước là Silas, lúc dùng ultimate thì giọng silas nhưng đánh thường lại là giọng của Đạo Mộng Dao.
còn về vấn đề vfx thì dùng của char kén đã sao chép đi, như silas cầm súng kén nở ra đạo mộng dao không có súng phải làm sao? hay là giữ animation đánh thường Đạo Mộng Dao?
nội tại cấp quy tắc, riêng thần tính là axiom.
Thần tính: không nhận mọi hiệu ứng/buff/debuff/mark có lợi/hại hoặc không lợi hay hại từ nguồn ngoài bản thân kể cả đồng minh.

skill 1: tất cả chân ngã của kẻ thù đang đợi vào luân hồi sẽ lập tức vào luân hồi, cost: bản thân luân hồi chi chủ bị giảm 20% max hp trong 2 turn của bản thân hắn sau khi dùng skill này, sau khi 2 turn đó hết, trả lại và hồi hp = 20% max hp đã mất, sau khi kích hoạt cũng - 25 ae và 5 nộ, bất kể điều kiện cost nào chưa thoả mãn đều không thể dùng skill 1. quy tắc.

skill 2: lẩn trốn vào luân hồi, rời khỏi hiện thế, biến mất khỏi trận đấu (không tính DEATH_CONFIRMED, không vào cửa sổ chờ luân hồi) sau 1 turn của leader khi kích hoạt skill này, trở lại hiện thế, vào sân ở 1 ô ngẫu nhiên còn trống trong sân phe đồng minh, nếu đầy sân, mỗi 1 turn của leader hắn sẽ thử trở lại 1 lần cho đến khi thành công trở lại sân, khi trở lại sân, hồi hp = 20% max hp của bản thân sau đó tăng 5% max hp dựa trên max hp có lúc vào sân khi dùng skill này, phần tăng 5% max hp này sẽ mất khi rời sân (vì skill này hoặc vào cửa sổ chờ luân hồi hoặc đã vào luân hồi), đương nhiên tăng max hp dựa theo max hp có lúc rời sân khi dùng skill này nên có thể dùng skill này để tăng max hp mãi, cost: 15 ae.

skill 3: đứng tại chổ chưởng 1 chưởng bay ra 3 orb như đánh thường, gây sát thương ngẫu nhiên lên 3 mục tiêu, mỗi kẻ nhận 150% sát thương đánh thường của luân hồi chi chủ, đồng thời đánh dấu những kẻ đó, mark này không có hại lên kẻ thù, khi những kẻ bị đánh dấu chết mà bản thân luân hồi chi chủ có mặt trên sân, hắn được + 100% hp regen hiện có, 15 rage, cost: 20 ae.

ultimate: đánh thường và cast skill 3 cùng lúc sau đó cast skill 1, cả 2 skill cast qua ultimate này sẽ không tốn ae và vẫn giữ nguyên hiệu ứng đã có của 2 skill này, khi phán định cũng là phán định tag của 2 skill này mà không phải của ultimate.

trong mắt player thì hắn chưởng 1 chưởng bay ra 4 orb, 1 orb tuân theo ssi, 3 orb ngẫu nhiên mục tiêu, khi 4 orb đã gây sát thương xong hắn cũng sẽ cast skill 1.

đánh thường: chưởng 1 chưởng, bắn ra 1 orb màu đỏ và đen đan xen, gâu sát thương lên 1 kẻ địch = 100% wil/atk của bản thân.

nếu ultimate thì cast đánh thường và skill 3 cùng lúc nhưng vfx chỉ là 1 chưởng nhưng bay ra 4 orb.

77)
warrior, ssr.
nội tại: khi nhận sát thương chuẩn, tăng 2% max hp hiện có của bản thân, kích hoạt 1 lần/turn của bản thân, tức hắn hành động xong > nhận sát thương chuẩn > tăng 2% max hp > nhận sát thương chuẩn lần nữa > không tăng > đến turn của bản thân hắn hành động > nhận sát thương chuẩn > tăng 2% max hp, dạng như ranger silas.
mỗi turn hành động xong nhận sát thương chuẩn = 1% max hp đổi lại rage + 4.
vậy mỗi turn nếu không bị đánh hắn cũng tự mất 1% hp nhưng tăng 2% max hp và +4 rage.
nếu hắn có hp dưới hoặc = 1% hoặc mới vừa được hiệu ứng miễn tử ( khi hp về 0, không chết mà hồi 1 hp, tên gọi chính xác tao quên) thì hắn sẽ vì nội tại này mà chết.

khi nhận heal từ mọi nguồn vượt max hp sẽ chuyển phần overheal sang atk và wil, tỉ lệ overheal 1% max hp:0,5% atk và wil, hiệu ứng chuyển đổi này tồn tại tối đa 1 turn của bản thân hắn và mỗi turn của bản thân hắn chỉ kích hoạt tối đa 3 lần chuyển đổi và chỉ kích hoạt khi đã thực thi xong hành động và đợi turn tiếp theo.
ví dụ: hắn có 50 hp, 5 atk và wil, hắn hành động xong còn 50 hp nhưng đến turn kẻ thù đánh thì hắn bị đánh còn 40/50 hp, sau đó đến sp đồng minh heal 25 hp cho hắn, hắn có 50 hp và 15 hp over heal vậy hắn có 12,5 atk và wil, sau đó đến turn của hắn, hắn hành động với 50 hp, 12,5 atk và wil xong thì hiệu ứng chuyển đổi này biến mất, nếu hắn được over heal nữa thì lại kích hoạt chuyển đổi.

skill 1: gây sát thương cố định vào ô 1/3/5 của kẻ địch, mỗi kẻ địch đứng trong 3 ô này nhận sát thương = 1 đánh thường của nhân vật này, nhân vật này hồi hp = 25% tổng sát thương skill này gây ra. cost: 20 ae.

skill 2: gây sát thương cố định vào ô 7/8/9 của kẻ thù, mỗi kẻ nhận 170% đánh thường của nhân vật này, 20% của 170% đó sẽ được gây ra dưới dạng sát thương chuẩn, sau khi gây sát thương xong nhân vật này tăng 10% res/arm của bản thân trong 2 turn của hắn, 25 ae.

skill 3: mỗi khi nhận 1 debuff có cấp độ dưới hoặc bằng Pháp Tắc, trong vòng 3 turn tiếp theo của bản thân sẽ không nhận debuff cùng loại đó nữa, tự kích hoạt mỗi khi nhận debuff dưới hoặc bằng cấp Pháp Tắc, mỗi lần kích hoạt - 3% hp và 10 ae. Skill này không kích hoạt khi gặp debuff cấp Quy tắc hay axiom. skill cấp Quy Tắc.

ultimate: cast cùng lúc skill 1 và 2, không tốn ae và giữ nguyên hiệu ứng của 2 skill này, khi cast ultimate mà có xung đột tag với skill 1 và 2 thì sẽ dùng cấp tag của ultimate để phán định, Pháp Tắc.
tức skill 1 và 2 cast không thông qua ult để cast thì sẽ không có tag tức dưới cấp Pháp tắc, nếu cast skill 1 và 2 qua ultimate mà có xung đột thì sẽ dùng cấp tag của ult để phán định.

đánh thường: chém 1 kiếm gây sát thương = 100% wil/atk của bản thân lên 1 mục tiêu, mỗi lần đánh thường đều sẽ áp dụng buff cuồng bạo (tăng 10% sát thương gây ra thì phải, không nhớ rõ) lên đánh thường.

78) Tinh Không Ma Nữ
UR, summoner.

nội tại, Tàn Thần Tinh Khải: khi vào sân sẽ biến đổi leader thành Tinh Không Tàn Thần. Toàn bộ kit của leader sẽ bị thay đổi, hắn vẫn là leader như kit sẽ khác.
Tinh Không Tàn Thần: 
vị trí 7 và 9 cần trống, khi ra sân sẽ chiếm 2 vị trí này, mọc ra thêm 2 cánh tay, có lượt riêng tuân theo Ssi, nếu ô 7 và 9 có nhân vật đứng khi hắn ra sân, chuyển đơn vị đó sang 1 ô trống ngẫu nhiên khác, nếu sân đầy, Tinh Không Tàn Thần không ra sân cho đến khi có ô trống, mỗi cánh tay của hắn chỉ có thể đánh thường, mỗi đánh thường có chỉ số bằng đánh thường của leader (100% wil/atk).
Ultimate, Quần Tinh Vẫn Lạc: Triệu hồi quần tinh, các ngôi sao nhỏ tấn công mỗi mục tiêu trên sân, mỗi kẻ bị ngẫu nhiên 1 đến 3 ngôi sao tấn công, mỗi ngôi sao gây sát thương = 80% wil/atk của leader + sát thương chuẩn = 2% max hp lúc bị tấn công của kẻ thù.
ultimate B: tập hợp tinh thần chi lực, mất 5% hp hiện tại, hồi phục cho mọi đồng minh trên sân = 100% wil + atk và phần hp tương ứng với 5% hp đã mất từ skill này cho mỗi đồng minh có mặt trên sân.
ultimate C: Tiêu hao 100% rage hiện có + 5 ae, Ngưng tụ và tạo ra đơn vị Tinh Thần Chi Tâm, thứ này có hp = 65% hp max của leader, không rank, trừ hp ra không có chỉ số gì khác, không thể tấn công, ssi bỏ qua nó, mỗi turn bị ssi bỏ qua nó hồi hp cho 2 đồng minh ngẫu nhiên = 20% max hp của leader, leader cũng nhận 10% res/arm của bản thân lúc kích hoạt hồi hp cho đồng minh, hiệu ứng tăng res/arm không thể stack, chỉ kích hoạt 1 lần cho đến khi Tinh Thần Chi Tâm tan biến sau khi bị ssi bỏ qua 3 lần cũng sẽ biến mất theo.

Đánh thường của Tàn Thần: mỗi khi đến turn của bản thân thì cánh tay sẽ tát đối phương gây sát thương = 100% wil/atk của bản thân leader, leader tức thân của tàn thần đứng ô 8 sẽ không thể tấn công và bị ssi bỏ qua nhưng 2 cánh tay ở ô 7 và 9 thì có thể tấn công và tuân theo ssi, cánh tay và thân đều tăng rage khi bị đánh, thanh rage và hp của leader chỉ có 1.
chỉ số của leader Tàn Thần = 100% chỉ số của leader lúc vào trận, tức không bị tăng hay giảm từ kit ngoài leader hoặc bản thân leader.
mỗi khi nhân vật này cast ultimate thành công, hồi hp cho tàn thần = 10% tổng sát thương ultimate nhân vật này gây ra lên tối đa 3 mục tiêu.
phần trên là kit của leader sau khi biến đổi cũng là nội tại của char này.

Skill 1: kích hoạt sau đó turn tiếp theo kể từ turn kích hoạt skill này bản thân và leader rage nhận được từ hành động tăng 40% trong 3 turn của bản thân leader và nhân vật này, 20 ae. Hiệu ứng tăng rage từ skill 1 không stack, kích hoạt skill này khi hiệu ứng tăng rage cũ vẫn còn chỉ làm mới thời gian tồn tại của hiệu ứng, không stack với bản thân nhưng có thể cộng dồn với hiệu ứng tăng rage khác.

skill 2: tự kích hoạt khi hp của leader dưới 15%, lập tức hồi hp = 25% max hp + 35% wil/atk của bản thân cho leader, tự kích hoạt khi đủ điều kiện, cost: - hp = 30% mx hp, -20 ae, chỉ tự kích hoạt khi cost và hp leader đồng minh dưới hoặc = 15% đều thoả mãn.
cost HP của Ma Nữ là HP Cost, không phải Damage.

skill 3: khi bị tấn công, khi đòn tấn công đó đã kết thúc, đánh thường lên hàng của kẻ tấn công, skill này không được tính là đánh thường, cách hoạt động như nội tại thiện xạ của Silas, không tính là 1 turn. -5 ae.

đánh thường: đứng tại chỗ, orb trên đầu nàng bắn ra tia sáng mạnh mẽ gây sát thương aoe lên tối đa 3 mục tiêu (tuân theo ssi), 1/4/7, 2/5/8 hoặc 3/6/9 tùy theo vị trí đứng của bản thân và đơn vị mục tiêu.
mỗi kẻ bị tia sáng quét trúng nhận sát thương = 100% wil/atk của nàng.

Một hostile action lên Ma Nữ = tối đa một lần Skill 3.
Nếu một action có 7 hit:
vẫn chỉ một counter.
Nếu cùng một action đánh Ma Nữ và tạo nhiều attacker/linked effects thì xử lý theo danh sách attacker hợp lệ, nhưng cần tránh “mỗi packet = một phản kích”.

ultimate, Tinh Quang Đại Xạ: cast 1 lần đánh thường nhưng tỉ lệ sát thương từ 100% lên 280% wil/atk, sau đó kích hoạt skill 1 mà không tốn cost.

Basic Attack action được cường hóa.
Như vậy nếu sau này nàng có effect:
“khi thực hiện Basic Attack...”
thì Ultimate vẫn có thể tương tác đúng theo fantasy.

Khi Tinh Không Ma Nữ vào sân:
Leader biến thành Tinh Không Tàn Thần.
Bộ kit cũ của Leader bị thay thế.
Leader vẫn là Leader, không phải summon.
Thân thể chính ở slot 8.
Hai cánh tay chiếm slot 7 và 9.
Hai cánh tay là các actor có lượt SSI riêng.
Thân ở slot 8 không có lượt tự nhiên và bị SSI bỏ qua.
HP và Rage của thân + hai tay dùng chung một pool.
Chỉ số của Tàn Thần được snapshot bằng 100% chỉ số Leader tại thời điểm vào trận.
Các mutation/buff/debuff của Leader về sau không tự thay đổi snapshot này, theo đúng mô tả của mày.
Điểm này rất quan trọng: Tàn Thần có ba vị trí vật lý nhưng chỉ là một sinh mệnh.
Tức Leader đổi:
1 actor → 2 actor chiến đấu
Đây là buff lớn hơn rất nhiều so với +stat.
Nhưng vì hai tay chỉ Basic Attack.
Nếu actor mới xuất hiện ở slot chưa được quét → có thể tham gia side pass hiện tại.
Nếu slot đã đi qua → chờ pass sau.
Điều này tránh tình trạng:
Ma Nữ vào sân → Leader biến đổi → hai tay lập tức được chen vào → rồi SSI lại quét chúng lần nữa.
ultimate A
Một ngôi sao có phải một hit riêng.
Nếu đúng:
Enemy A: 3 stars
Enemy B: 1 star
Enemy C: 2 stars
thì A/B/C có số lần chịu damage khác nhau.
Điều đó cũng có nghĩa các effect:
“khi nhận damage”
counter
shield
lifesteal
threshold
on-hit
có thể bị kích hoạt nhiều lần.
ultimate BMỗi đồng minh nhận:
100% ATK + 100% WIL + 5% HP đã mất của leader.
ultimate C
Hiện tại chưa có khái niệm:
“một actor có slot nhưng không phải actor SSI, và mỗi lần cursor đi qua nó lại nhận một trigger.”
Tao nghĩ nên định nghĩa cho riêng loại này một khái niệm:
SSI Pass Contact
Không cần biến nó thành actor.
Mỗi khi con trỏ SSI của phe nó đi qua slot mà Tinh Thần Chi Tâm đang neo vào, nó nhận một “lần bị bỏ qua”.
Sau 3 lần:
FUSION/energy structure tan biến.
Như vậy nó thực sự gắn với SSI thay vì dùng timer giả.
bonus Tinh Thần Chi Tâm:
+10% ARM và +10% RES của Leader tại thời điểm Tinh Thần Chi Tâm được tạo.
Snapshot một lần.
Không stack.
skill 1 của ma nữ
3 Turn Boundary của từng người
chứ không phải 3 round.
Và reset duration khi cast lại nhưng không stack.

78) 
mage, ssr
một char bình thường, là tiêu chuẩn, là mặt bằng chung của độ phức tạp kit nhân vật.

nội tại: sau khi dùng skill bất kỳ, đánh thường tiếp theo tăng 10% wil/atk, Hiệu ứng mất sau khi Basic Attack đó được thực hiện, không stack.

skill 1: đứng tại chỗ tạo 3 lôi orb Tấn công 3 mục tiêu ngẫu nhiên, gây sát thương = 130% atk/wil của bản thân lên mỗi mục tiêu, orb có thể trùng, sau đó tạo khiên cho bản thân = 25% tổng sát thương gây ra lên 3 mục tiêu đó, 25 ae.

skill 2: tự buff cho bản thân, tăng 70% wil hiện có của bản thân trong 3 turn, khi kích hoạt skill này đến turn tiếp theo của bản thân tính là 1 turn trong bộ đếm 3 turn đó, sau đó lại cd 1 turn của bản thân, 25 ae.

skill 3: cường hoá 3 đòn đánh thường kế tiếp của bản thân, mỗi lần đánh thường sát thương gây ra + 15%, đòn cường hoá sau khi gây sát thương xong cũng hồi hp cho bản thân = 10% tổng sát thương đòn cường hoá đó gây ra, over heal bị bỏ qua.

ultimate, Mây Đen Áp Đỉnh: niệm chú, triệu hồi 1 đám mây đen (vfx), mây đen tấn công 5 mục tiêu ngẫu nhiên, mỗi kẻ nhận sát thương = 140% wil/atk hiện có của bản thân nhân vật này.

đánh thường: đứng tại chỗ, chưởng 1 lôi orb tấn công 1 mục tiêu hoàn toàn ngẫu nhiên, gây sát thương = 100% wil và atk của bản thân lên mục tiêu.

79) Gideon Vale
ssr, tanker
DMG 2 | SUR 5 | CTL 3 | CMP 2 | MIC 2 | VIS 5

nội tại: mỗi khi nhận sát thương vượt 30% max hp của bản thân trong 1 lần hành động của kẻ tấn công, tăng max hp = 13% max hp hiện có, reset khi rời sân ( vào luân hồi, hp về 0, về deck).

Max HP 10.000
→ nhận 3.100 damage trong cùng action
→ Max HP = 11.300.
“Trong 1 lần hành động của kẻ tấn công” nên tính:
Tổng actual HP damage từ toàn bộ damage packet của một action lên hắn.
Không phải từng hit.

skill 1: cầu nguyện Quang Chủ che chở, hồi hp = 70% wil và atk của bản thân cho bản thân và cường hoá khả năng phòng thủ, tăng 10% res và arm của bản thân trong 2 Turn Boundary, hiệu ứng tăng res/arm này không stack, kích hoạt chỉ làm mới thời gian tồn tại hiệu ứng cũ, 20 ae.

Heal nên tính theo stat snapshot khi cast.
ARM/RES buff là percentage modifier của chỉ số hiện tại.
Recast chỉ refresh duration, không stack.

skill 2: tiếp cận kẻ địch, tán mạnh khiên vào đầu kẻ địch, gây sát thương = 100% wil và atk lên kẻ địch đó, có 15% tỉ lệ gây choáng mục tiêu trong 1 turn, 25 ae.
di chuyển tới mục tiêu chỉ là animation.

skill 3: khi hp trên hoặc bằng 70% max hp, tự kích hoạt và nhận taunt trong 2 Turn Boundary, khi đạt điều kiện sẽ kích hoạt ngay lập tức khi nhân vật đã thực thi hành động xong và đang đợi đến lượt ssi tiếp theo của bản thân, cd 1 Turn Boundary, cost: 15 ae. Trong thời gian kích hoạt mỗi Turn Boundary hồi 4% max hp của bản thân cho bản thân và leader đồng minh.
Ví dụ:
A action
→ Skill 3 trigger
→ Taunt 2T
→ cooldown = 1T
thì Boundary tiếp theo:
cooldown giảm về 0,
nhưng Taunt vẫn còn 1 Boundary.
Nếu HP vẫn ≥70% khi A action tiếp theo kết thúc:
Skill 3 có thể lập tức trigger lại.

ultimate: Cast skill 2 sau đó cast skill 3 mà không tốn cost, tức khi dùng ult char này sẽ đánh mục tiêu và nhận taunt bất kể có đủ điều kiện kích hoạt skill 3 hay không.
sequential nội bộ:
Ultimate
→ Skill 2 resolve
→ damage/stun
→ Skill 3 resolve
→ Taunt + heal-over-time effect
→ Ultimate complete
Không cần simultaneous.

80) Roth Vargan

warrior, ssr.
DMG 4/5 SUR 5/5 CTL 1/5 CMP 4/5 MIC 3/5 VIS 4/5
nội tại, Tàn Huyết: khi hp dưới hoặc = 50% max hp, nhận 1 rage trên mỗi 2% max hp đã mất, nếu % max hp đã mất không phải số chẵn, ví dụ như hp đã mất là 63% thì hắn nhận 31 rage mà không phải 31,5 rage. cd 3 turn Boundary.

“Nhận 1 Rage trên mỗi 2% Max HP đã mất"
engine hiểu theo:
floor(percentMaxHpLost / 2)
Ví dụ:
HP mất 63%
→ floor(63 / 2)
→ 31 Rage
Không nên lưu phần 0,5 để lần sau cộng dồn.
Tức 63% rồi hồi lên 50%, sau đó mất lại 3% không được biến thành:
31 + 0,5 + 1,5...
Mỗi lần passive trigger phải tính từ HP loss hiện tại.
Current HP / Max HP tại thời điểm passive kiểm tra.
Ví dụ:
Current HP = 3.700
→ HP đã mất = 63%
→ 31 Rage
Nếu Max HP của hắn đã tăng qua các mechanic khác thì tỷ lệ phải tính lại.
Điều này rất quan trọng với char này vì Skill 3 và các buff khác không trực tiếp mutate Max HP, nhưng các effect bên ngoài vẫn có thể.
Không có chuyện:
HP xuống ≤50 → trigger
hồi lên >50 → passive bị “hủy” hay cooldown reset.
chỉ nhìn HP thực tế đã mất, bất kể nguồn:
Damage. HP Loss. HP Cost. Sacrifice.
HP mutation Max HP giảm không làm “HP đã mất” tăng. Chỉ tính:
Max HP - Current HP
sau khi Max HP đã ổn định.
Nếu Max HP giảm từ 10.000 → 8.000 mà Current HP 8.000:
không được coi như vừa mất 20% HP để kiếm Rage.
skill 1: chém 1 mục tiêu, gây sát thương = 180% wil/atk và áp debuff chảy máu lên mục tiêu (mất 2% hp dưới dạng sát thương chuẩn trong 2 turn hành động của mục tiêu, tức hành động xong sẽ mất hp là 1 lần), hồi hp = 25% sát thương skill này gây ra (không tính phần bị chảy máu), 20 ae. Không tính đánh thường.

Hit Skill 1
→ gây 180% Mixed Damage
→ áp Bleed
→ mục tiêu thực hiện natural action lần 1
→ sau action mất 2% Max HP True Damage
→ mục tiêu thực hiện natural action lần 2
→ sau action mất 2% Max HP True Damage
→ Bleed hết.
vì đây là True Damage, nó sẽ:
bị Shield chặn nếu không có xuyên khiên;
không qua ARM/RES;
actual HP damage mới được tính cho các effect liên quan.
180% damage
→ tính heal

Bleed 2% + 2%
→ không tính heal.

skill 2: khi hp dưới hoặc =22%, 3 đòn đánh thường tiếp theo của hắn mỗi đòn đánh xong hắn được hồi hp = 20% sát thương đánh thường/mỗi đòn đánh lên mục tiêu, bất kỳ debuff/mark nào trên người hắn gây DoT lên mục tiêu qua đánh thường đều sẽ không tính vào phần hồi hp từ skill này, 15 ae. Tự kích hoạt khi đủ điều kiện.

Chỉ damage trực tiếp của Basic Attack do Roth gây ra được dùng làm cơ sở hồi HP.
Tức:
Basic Attack
= 500 actual damage
Bleed triggered = 100
Mark triggered = 50

Heal = 500 × 20%
Không phải:
(500 + 100 + 50) × 20%

Actor đang ở Turn Boundary
→ HP hiện tại ≤22%
→ Skill 2 tự kích hoạt
→ trả 15 AE
→ tạo trạng thái “3 Basic Attacks”
→ chưa heal ngay.
Sau đó ba Basic Attack kế tiếp mới lần lượt hồi.
Không nên kích hoạt giữa một action đang diễn ra.
Nếu HP xuống 22% giữa một action?
Không trigger ngay.
Chờ tới sau khi action đó hoàn tất, rồi kiểm tra điều kiện theo cơ chế self-trigger.
Điều này rất hợp Turn Boundary/action completion.
“3 đòn đánh thường tiếp theo”
Phải là:
3 Basic Attack action thực sự của chính Roth.
Không tính:
Skill 1.
Ultimate.
Follow-up không phải Basic Attack.
Counter.
Damage phản.
Các projectile từ passive.
Heal
20% dựa trên actual HP damage của Basic Attack, không tính: Bleed.
DoT từ Debuff. Mark gây damage. Reflect. Overkill. Shield damage.

skill 3: gây sát thương lên mục tiêu bằng đánh thường hoặc ult vượt hoặc =30% max hp của mục tiêu sẽ lập tức tăng 10% wil và atk của bản thân lúc kích hoạt skill trong 3 turn Boundary, trong 3 turn Boundary này cost dùng skill 2 và 1 giảm 10 ae, khi 3 turn Boundary này kết thúc thì mới có thể tự kích hoạt skill 3 lần nữa, 5 ae.

Một đòn Basic Attack hoặc Ultimate
→ actual HP damage từ action đó ≥30% Max HP snapshot của mục tiêu
→ Skill 3 trigger
→ +10% ATK/WIL hiện có
→ trạng thái 3 Turn Boundary
→ Skill 1 cost -10 AE
→ Skill 2 cost -10 AE
→ hết 3 Boundary
→ Skill 3 mới có thể kích hoạt lại.
Ví dụ Basic Attack đánh nhiều target:
Target A = 35%
Target B = 32%
Target C = 20%
Skill 3 chỉ:
+1 activation
không phải +2.
Một action hợp lệ chỉ tạo tối đa một lần Skill 3, dù bao nhiêu mục tiêu đạt ngưỡng.
Damage dùng để kiểm threshold
Phải là:
Actual HP Damage của action lên một target / Max HP của target tại đầu action.
Không tính:
shield damage;
overkill;
damage phát sinh sau action;
Bleed tick;
DoT;
phản damage.

ultimate: chém 1 mục tiêu, gây sát thương = 265% wil và atk, nếu mục tiêu hp về 0, rage nhận được trong 2 turn chủ động (dùng skill, đánh thường và cả ultimate, skill 2 và 3 đều là bị động nên cũng không ảnh hưởng gì vì đều là tự buff, nếu skill hoặc nội tại của hắn có kiểu tự phản kích, tấn công khi đạt điều kiện như Thiện Xạ silas thì "rage nhận được trong 2 turn chủ động" sẽ không tác dụng với nội tại thiện xạ của silas) tiếp theo tăng 30%.

Ultimate gây 265% ATK + 265% WIL Mixed Damage lên 1 target.
Nếu target DEATH_CONFIRMED vì chính Ultimate:
Trong 2 Turn chủ động tiếp theo của Roth, Rage nhận được từ các action chủ động của hắn tăng 30%.
Chỉ tính action tự nhiên của Roth khi hắn chủ động thực hiện:
Basic Attack.
Skill.
Ultimate.
Nhưng với Skill 2 và Skill 3 của kit này chúng là passive tự kích hoạt nên bản thân chúng không tạo Rage trực tiếp.
Nếu sau này có:
follow-up;
counter;
Thiện Xạ-like passive;
linked attack;
thì không hưởng +30% Rage, trừ khi effect riêng ghi rõ.
Kill phải là:
DEATH_CONFIRMED
Không phải:
HP_ZERO;
death prevention;
summon despawn;
remove.
“2 Turn chủ động” nên đóng theo Turn Boundary
Ví dụ:
Ultimate kill
→ Active Rage Boost bắt đầu
Turn tự nhiên 1 của Roth
→ action → Rage +30%
Turn tự nhiên 2
→ action → Rage +30%
→ hết
Không tính action chain chen ngang.

Nếu target có:
100.000 Max HP
thì 30% = 30.000 damage.
Nếu Roth có damage không đủ, Skill 3 gần như không tồn tại.
Ngược lại, target có:
1.000 Max HP
thì chỉ cần 300 actual damage.
Skill 3 có thể bật cực dễ.
Điều này không phải bug.
Nó là một cách để threshold tự scale với target.
Nhưng encounter design phải chú ý: character này sẽ có hiệu suất rất khác giữa:
mob nhỏ; elite; Tanker; boss.
Nếu Ultimate không giết ngay nhưng:
Ultimate
→ mục tiêu còn 2%
→ Bleed tick sau
→ target chết
Không được kích hoạt Rage Boost từ Ultimate.
Vì kill không xảy ra bởi chính Ultimate.
Nếu mục tiêu bị:
Ultimate → HP_ZERO
→ Death Prevention
→ sau đó sống lại
cũng không tính là kill.
Nếu target chết thật do chính component damage của Ultimate:
kích hoạt.
Đây là distinction rất quan trọng.

81) 
DMG 4/5 SUR 5/5 CTL 3/5 CMP 5/5 MIC 5/5 VIS 3/5
summoner, ssr

nội tại, Tái Hấp Thu: Khi một Tử thể đạt DEATH_CONFIRMED, Mẫu thể tăng 35% Max HP hiện tại của Tử thể đã chết.
Vì:
Tử thể Max HP = 40% Max HP snapshot của Mẫu thể lúc triệu hồi.
nên:
Mỗi Tử thể DEATH_CONFIRMED → Mẫu thể +14% Max HP hiện tại.
Với Tử thể Max HP = 40% Max HP Mẫu thể:
0,4 × 0,35 = 14% Max HP Mẫu thể / Tử thể chết.
Nếu 3 Tử thể chết:
+42% Max HP.
Nếu 6 chết trong một chuỗi death wave:
+84%.

+1 rage/ mỗi tử thể hp lớn hơn 0, có mặt trên sân/ mỗi turn boundary của mẫu thể, vậy mỗi turn boundary mẫu thể được + tối đa 6 rage. Tức là:
Mỗi Tử thể có HP > 0 tại thời điểm Turn Boundary của Mẫu thể được tính 1 Rage.
Không phải:
Tử thể phải là ALIVE xuyên suốt toàn bộ khoảng thời gian.
Ví dụ:
Boundary của Mẫu thể
→ có 5 Tử thể sống → +5 Rage

Sau đó một Tử thể chết
→ không hoàn tác +5 đã nhận.

Tử thể mới tạo giữa hai Boundary
Đây là một điểm nhỏ nhưng đáng chốt.
Ví dụ:
Mẫu thể vừa hành động
→ đang chờ Boundary tiếp theo
→ Ultimate tạo 3 Tử thể
→ trước đó chỉ có 2 Tử thể
→ giờ có 5
Tại Boundary tiếp theo:
nhận +5 Rage.
Không được nhận ngay lúc spawn.

skill 1: Mẫu thể + tất cả Tử thể hiện diện cùng thực hiện forced attack.
Skill 1 không phải Basic Attack.
Forced attacks sử dụng damage profile của Basic Attack nếu đó là công thức mày muốn giữ.
Sau toàn bộ skill: +10% ATK/WIL, không stack.
Duration 3 Turn Boundary.
Recast chỉ refresh duration.
Cost 20 AE.

skill 2: Khi HP ≤20% Max HP.
Liên kết các Tử thể hiện diện tại thời điểm trigger.
Link tồn tại 2 Turn Boundary của Mẫu thể.
Khi Mẫu thể nhận damage:
35% Mẫu thể chịu.
60% chia đều cho linked Tử thể dưới dạng True Damage.
5% bị triệt tiêu.
Link là snapshot; Tử thể mới sinh ra sau trigger không tự động nhập link.
Cost = 5 AE + 5 Rage / mỗi linked Tử thể.

skill 3: không hp về 0 nếu có tối thiểu 3 tử thể có mặt trên sân, các tử thể lập tức DEATH_CONFIRMED, mẫu thể hồi sinh ngẫu nhiên trên sân với max hp/hp = current hp của tổng các mẫu thể bị DEATH_CONFIRMED bởi skill 3, cost 20 ae, kích hoạt 1 lần/trận đấu. sau khi phục sinh bằng skill 3 hiệu ứng có lợi lẫn hại từ ngoài bản thân và bản thân (từ nội tại) đều sẽ bị xoá bỏ, khi hp về 0 sẽ tự kích hoạt skill này.

đánh thường: đứng tại chỗ, độc nhãn bắn ra tia laze cực mạnh lên 1 mục tiêu, gây sát thương = 100% wil +atk, hồi hp = 15% sát thương đánh thường gây ra lên mục tiêu.

ultimate: tạo ra 3 Tử thể, mỗi tử thể không có chân ngã, vào sân với 70% hp của bản thân tử thể và 30% mọi chỉ số của mẫu thể trừ max hp/40% max hp của mẫu thể, các Tử Thể chỉ có thể đánh thường, mỗi tử thể đánh thường = 100% wil/atk chúng có tức = 30% của mẫu thể. chúng là đơn vị độc lập, tuân theo ssi, không có rage/class, hành động cũng không tăng ae. mỗi tử thể rank = mẫu thể. tử thể vfx tấn công là cận chiến.
Tử thể tồn tại tối đa 4 turn chủ động của bản thân chúng, cap là 6, nếu dùng ult và đã có tử thể, 3 tử thể có hp thấp nhất (không phải chỉ số khác ngoài hp/max hp thấp nhất) sẽ được thay thế bởi 3 tử thể mới từ ultimate.
tử thể bị thay thế bởi ultimate không tính là DEATH_CONFIRMED và không kích hoạt Tái Hấp Thu.

Max HP Tử thể = 40% Max HP Mẫu thể.
HP lúc triệu hồi = 70% Max HP Tử thể.
Mẫu thể 10.000 HP:
Tử thể Max HP = 4.000
Tử thể spawn HP = 2.800

82)
support, ssr
SSR / Support

DMG 3/5 SUR 5/5 CTL 5/5 CMP 4/5 MIC 5/5 VIS 3/5
nội tại: mỗi turn boundary của bản thân hồi hp = 40% wil và atk của bản thân cho mọi đơn vị đồng minh có thanh hp trên sân kể cả leader, không tác dụng lên prime có Thần Tính.

skill 1: khi có 1 đồng minh có chân ngã (ngoài bản thân) có hp dưới hoặc = 12% max hp của họ, lập tức hồi cho họ 100% wil và atk + 3% max hp của bản thân, cost: -2% max hp và 15 ae, tự kích hoạt khi đủ điều kiện.
Mỗi lần một đồng minh thỏa điều kiện lần đầu, tạo một reaction; mỗi reaction chỉ có thể dùng một lần cho chính đồng minh đó cho tới khi nó thoát khỏi ngưỡng 12%.
Nếu không, chỉ riêng hiệu ứng HP giảm nhẹ/DoT có thể liên tục gọi Skill 1.

skill 2: áp debuff phản hồi phục lên 3 kẻ thù ngẫu nhiên, debuff tồn tại trên kẻ thù = 1 turn boundary của nhân vật này, trong cửa sổ đó tổng sát thương kẻ thù nhận từ debuff phản hồi phục từ skill 2 của nhân vật này thì 30% sẽ được chuyển thành hp của nhân vật này sao khi cửa sổ turn boundary kết thúc, nếu lượng sát thương từ debuff phản hồi phục của nhân vật này vượt quá 35% max hp của kẻ đó thì sau khi nhận sát thương từ phản hồi phục debuff này sẽ biến mất ngay lập tức mà không cần cửa sổ turn boundary của nhân vật này kết thúc.
Phản hồi phục: mọi hiệu ứng hồi phục nhận được từ nguồn ngoài hp regen của bản thân sẽ được chuyển thành sát thương chuẩn, debuff này không thể giết mục tiêu, nếu vượt max hp mục tiêu thì sẽ giữ mục tiêu còn 2 hp.
skill này không có tag pháp tắc trở lên nên debuff này chỉ là hiệu ứng thường, skill này không thể target Prime có thần tính, nếu trên sân có dưới hoặc = 3 kẻ có thần tính thì chỉ target kẻ không có thần tính. Cost: 30 ae.
Đúng nhất là:
Heal trực tiếp từ skill.
Heal từ passive.
Lifesteal.
Healing pulse.
Đồng minh heal.
Global heal.
đều bị chuyển.
Còn:
HP Regen của chính mục tiêu được miễn.
Trong cửa sổ:
Cộng dồn toàn bộ Actual HP Damage do chính debuff này gây ra.
Kết thúc cửa sổ:
Support hồi 30% tổng damage đó.
Ví dụ:
Heal 500 → 500 True Damage
Heal 300 → 300 True Damage
Heal 700 → 700 True Damage

Total = 1.500
Threshold 35%.
Support cuối cửa sổ hồi = 450.
Max HP snapshot lúc debuff được áp, vì nếu Max HP thay đổi trong cửa sổ thì luật sẽ ổn định hơn.
5.000 damage threshold nên là cumulative damage của chính debuff, không phải tổng damage mà mục tiêu nhận từ mọi nguồn.
Nếu ally khác đánh 20.000 damage:
không ảnh hưởng threshold.
câu: “nếu trên sân có ≤3 kẻ có Thần Tính thì chỉ target kẻ không có Thần Tính”
nên hiểu đơn giản hơn:
Target pool = tất cả enemy không có Thần Tính.
Nếu không còn mục tiêu hợp lệ:
Skill 2 không có mục tiêu và không cast.

skill 3: đứng tại chỗ niệm chú, gây sát thương = 100% wil và atk lên 2 mục tiêu ngẫu nhiên, nếu kẻ thù DEATH_CONFIRMED bởi skill này tăng 2% max hp/mỗi kẻ, 25 ae.

Nếu Skill 3 giết một target bằng overkill:
chỉ tính actual HP damage để determine death; không lấy overkill làm gì thêm.
Nếu 2 target cùng chết trong một action:
+4% Max HP.
Nếu target chết vì DoT sau đó:
không tính cho Skill 3.

ultimate: tại chỗ niệm chú, heal cho mọi đơn vị đồng minh có hp trên sân trừ prime có thần tính = 180% wil và atk + 10% max hp của bản thân cho mỗi kẻ nhận heal, phần overheal bị bỏ qua.

Nếu Support bị CC và mất lượt:
lượt tự nhiên vẫn được tiêu hao;
Boundary vẫn tiến triển theo lượt của nó;
chỉ là nó không thực hiện action.
Do đó CC không phải là:
“kéo duration Boundary ra vô hạn.”
Nó chủ yếu khiến:
Support không được tự mình hành động, trong khi các effect gắn với Boundary vẫn có thể tiếp tục theo luật duration/cap.
Với nội tại heal, điều này có nghĩa:
Turn Boundary của actor vẫn tiến triển khi actor bị CC làm mất lượt theo SSI; việc mất lượt không làm trì hoãn Boundary.
Hiệu ứng gắn trực tiếp với Turn Boundary vẫn resolve theo luật của nó, trừ khi effect có điều kiện yêu cầu actor phải hoàn tất natural action hoặc phải còn khả năng hành động.

83)
ranger, ssr
DMG 4 / SUR 4 / CTL 2 / CMP 3 / MIC 3 / VIS 4.

nội tại: mỗi đòn đánh thường đều heal cho bản thân = 10% sát thương gây ra, không tính follow up, dot.

Actual HP Damage do chính Basic Attack gây ra
Không tính:
Shield damage.
Overkill.
Bleed.
DoT.
Reflect.
Follow-up.
Ví dụ:
Basic Attack gây 500 actual HP damage
→ heal 50.
Nếu đánh vào shield 500 mà HP damage = 0:
Heal = 0.
Đúng với lifesteal contract của Arclune.

skill 1: đánh thường áp debuff chảy máu lên mục tiêu, follow up không áp thêm debuff này (mất 2% hp dưới dạng sát thương chuẩn trong 2 turn hành động của mục tiêu, tức hành động xong sẽ mất hp là 1 lần, như roth), cost -1 ae/rage và -1% hp/100% max hp. debuff này đối với prime có thần tính vô hiệu.
Basic Attack action có thêm effect Bleed.
Ví dụ:
Skill 1
→ Basic Attack 500 damage
→ heal 50
→ apply Bleed
Bleed 2% Max HP trong 2 natural actions của mục tiêu, giống Roth.
Follow-up không áp Bleed lại.
Nếu Follow-up phát sinh từ chính Skill 1 hoặc từ effect khác:
Follow-up không refresh/stack Bleed.

skill 2: khi nhận sát thương chí tử, vượt current hp, chỉ nhận 50% lượng sát thương đó, nếu sau đó còn sống, lập tức đổi vị trí sang ô trống ngẫu nhiên trên sân đồng minh, -20 ae/mỗi lần tự kích hoạt. không kích hoạt khi nhận sát thương chuẩn. Kích hoạt max 2 lần/trận.
Ví dụ:
Current HP = 100
Incoming = 150
→ nhận 75
→ còn 25
→ skill kích hoạt
→ random reposition
Nhưng:
Current HP = 100
Incoming = 500
→ nhận 250
→ vẫn chết.
Sau toàn bộ mitigation/shield, lấy actual incoming HP damage rồi giảm còn 50%
Skill 2 chỉ kiểm tra lethal action có ít nhất một non-True damage component gây actual HP damage.
Nếu chuyển sang slot chưa quét:
không được tự nhiên đi lần nữa.
Nếu đã quét:
vẫn chờ pass sau.

skill 3: sau mỗi turn chủ động, 20% tổng sát thương vừa gây ra sẽ được chuyển thành khiên cho nhân vật này, không tính dot và follow up, - 5 ae/mỗi lần kích hoạt, mỗi turn boundary chỉ kích hoạt 1 lần, khi khiên từ skill này bể, hồi hp = 50% tổng lượng khiên đó, ví dụ vừa gây 100 sát thương> vào turn boundary> nhận khiên = 20% là 20 > khiên bị đánh bể, lập tức hồi hp = 10.
Actual HP Damage của các action chủ động mà nhân vật thực hiện trong Turn đó.
Không tính:
shield damage;
overkill;
DoT;
Follow-up;
Reflect.
Nếu trong cùng Turn sử dụng:
→ Ultimate
thì shield lấy tổng actual damage của cả hai, nếu hệ thống cho nhiều action chủ động trong cùng Turn.
Nếu character mỗi natural turn chỉ được một action bình thường, thì chỉ có một nguồn.
Damage = 100
→ Shield = 20
→ shield bị phá hoàn toàn
→ heal 10.
chỉ heal khi khiên bị phá hoàn toàn.
nếu khiên cũ còn và nhận khiên mới, lớp khiên cũ sẽ biến mất và nhận được lượng heal nên nhận từ khiên vừa biến mất.

ultimate: đánh thường 1 lần nhưng tỉ lệ sát thương từ 100% lên 300% wil và atk lên 1 mục tiêu.

84)
Assassin, ssr
nội tại: ultimate/skill/đánh thường sẽ luôn target mục tiêu có target có % hp thấp nhất, nếu kẻ thù có taunt thì tuân theo taunt, khi hết bị taunt lại target kẻ có % hp thấp nhất.
nhân vật này không target kẻ không có chân ngã trừ phi vô chân ngã giả có taunt.

khi target hp dưới hoặc = 70%/50%/25% nhận sát thương gây ra lên kẻ địch tăng 10%/sát thương gây ra có 20% là sát thương chuẩn/hồi hp = 20% sát thương gây ra lên mục tiêu (không tính follow up/dot/chỉ tính sát thương gây ra sau khi phá khiên), 3 hiệu ứng này đều có tác dụng lên mục tiêu, nếu target có hp dưới hoặc = 25% max hp của chúng, hắn gây sát thương lên target đó tăng 10% sau đó 20% (đã tăng 10) sẽ là sát thương chuẩn, cuối cùng 20% sát thương thực sự gây ra sau khi bỏ qua khiên sẽ được hồi hp cho hắn.

skill 1: mỗi khi DEATH_CONFIRMED 1 mục tiêu (dot/overkill cũng tính), hp max/atk/wil + = 5% max hp/atk/wil kẻ hắn đã giết, - 5 ae và 3% res và arm của hắn mỗi lần kích hoạt, kích hoạt xong cũng tự hồi hp = 5% max hp của bản thân (đã tăng max hp).

skill 2: khi hp dưới hoặc = 60%, 3 đòn đánh thường tiếp theo kèm theo debuff chảy máu, cd 4 turn boundary, cost: 5 ae mỗi lần kích hoạt.

skill 3: tiếp cận mục tiêu, gây sát thương = 300% wil và atk của bản thân, cost: 25 ae và 5 rage.

ultimate: cast skill 3 mà không tốn cost, nếu skill 1 kích hoạt sau khi skill 3 từ ultimate trong 1 turn boundary thì cost = 0.

85) Cổ Nhạc — Bất Động Tôn
DMG 2/5 SUR 5/5 CTL 3/5 CMP 1/5 MIC 2/5 VIS 5/5
tanker, ssr.
nội tại: khi vào trận hp/res/arm/hp regen tăng 75% so với chỉ số snapshot lúc vào sân, vào luân hồi sẽ xoá hiệu quả từ nội tại này, 
nhân vật này chỉ có 1 skill duy nhất, sát thương nhận vào tối thiểu 1% max hp.

Một modifier dựa trên Entry Snapshot, không phải ×1,75 lên stat hiện tại mỗi lúc kiểm tra.
Nếu không, bất kỳ Max HP mutation/buff nào khác có thể gây câu hỏi:
“75% tính từ đâu?”
Mỗi Damage Action hoàn chỉnh lên Tanker phải gây ít nhất 1% Max HP actual HP damage, nếu action đó có gây damage HP.
Ví dụ:
→ nâng lên 1%.

Damage Action có 7 hit:
0,1 + 0,1 + 0,1 + 0,1 + 0,1 + 0,1 + 0,1
= 0,7%
→ total action commit = 1%.
Như vậy đây là floor của action, không phải floor từng hit.
Điều này cực kỳ quan trọng với SSI/Simultaneous.
Không áp dụng cho
HP Cost.
HP Loss.
Sacrifice.
Remove.
Reflect damage nhận lại.
các sự kiện không phải Damage.
Còn True Damage thì tao nghiêng về có áp dụng, vì đây vẫn là Damage.
Shield
Cũng cần chốt:
Nếu Damage Action bị Shield hấp thụ hết không được ép 1% HP damage xuyên Shield
Tức: Damage còn lại sau Shield/mitigation mới được kiểm tra floor.
Nếu không, cái passive “minimum 1%” sẽ biến thành shield bypass.

skill: khi hp trên 30% max hp, nhận hiệu ứng taunt, cost: - 5 ae/ turn boundary. khi bị xóa hiệu ứng này nếu đủ điều kiện kích hoạt thì skill sẽ kích ngay lập tức.
phải tránh vòng lặp
Nếu một effect xóa Taunt → Skill tự trigger → effect lại xóa Taunt → trigger…
thì có thể thành infinite reaction chain.
Rule cần thêm:
Một lần xóa hiệu ứng chỉ được kích hoạt một lần tái áp dụng; reaction mới không tự coi lần xóa vừa xảy ra là một event mới.
Nói đơn giản hơn: cùng một resolution chain không thể tạo vô hạn Taunt refresh.

ultimate: nhận buff phản 100% sát thương trong 2 turn chủ động, tức sài ultimate sau đó char này hành động 2 turn thì buff phản sát thương sẽ biến mất, sau khi biến mất tăng vĩnh viễn 5% max hp (snapshot lúc vào trận, như nội tại)

Ví dụ:
Ultimate
↓
Tank hành động
↓
vẫn phản
↓
kẻ khác hành động
↓
Tank hành động lần 2
↓
hết buff
Reflected damage
Theo contract hiện tại:
là damage phản riêng;
không mặc định kích phản ngược;
không lifesteal;
không counter.
Đây cực kỳ quan trọng.
Không nên để:
→ Tank reflect
→ Enemy reflect
→ Tank reflect
→ ...
Một vòng như vậy phải bị chặn ở layer damage type.
+5% × số lần Ultimate hoàn tất
chứ không phải compound 5% trên Max HP hiện tại.
kiểu additive theo Entry Snapshot, bởi mày đã nói rõ:
“5% max hp (snapshot lúc vào trận)”
Như vậy không tạo tăng trưởng lũy thừa.
Ví dụ:
→ Ultimate hết: 10.500
→ lần 2: 11.000
→ lần 3: 11.500
Cực dễ kiểm soát.

đánh thường: gây sát thương = 100% wil và atk.

Tanker có:
+75% HP từ nội tại.
Sau đó Ultimate tăng:
+5% entry snapshot mỗi lần.
Vậy:
Entry snapshot = 10.000
Passive = +75% → 17.500

Ultimate #1 → +500 → 18.000
Ultimate #2 → +500 → 18.500
Điều này nghĩa là nội tại +75% là nền cố định, còn Ultimate là sự trưởng thành của riêng trận đó.

86) Verdict
warrior, ssr.
DMG 4 / SUR 3 / CTL 1 / CMP 2 / MIC 2 / VIS 5
nội tại: đánh thường và ultimate luân phiên 2 trạng thái:
Chém Ngang: sát thương tăng 20% atk, hồi hp = 10% sát thương gây ra lên lẻ kẻ thù (gây lên khiên không tính, dot không tính).
Trảm Dọc: sát thương tăng 20% wil, 10% sát thương gây ra là sát thương chuẩn.
2 trạng thái này luân phiên liên tục.

đánh thường: gây sát thương = 100% wil và atk lên 1 mục tiêu

skill: khi gây sát thương lên mục tiêu bằng hoặc hơn 30% max hp của chúng, +3 rage, tăng vĩnh viễn 2% res/arm/hp, reset khi rời sân, tối đa 20 stack trong trận, -5 ae mỗi lần kích hoạt.

ultimate: cường hoá đánh thường, chỉ số % sát thương cơ bản từ 100% lên 200%, nếu vì đánh thường của ult mà kích hoạt skill của nhân vật này thì hiệu quả skill gấp đôi, cost không giảm.
Bình thường:
+3 Rage
+2% HP/ARM/RES
-5 AE
Qua Ultimate:
+6 Rage
+4% HP/ARM/RES
-5 AE
Chỉ đổi trạng thái sau khi một Basic Attack action hoặc Ultimate action thực sự của bản thân hoàn tất.
Không đổi sau mọi lần gây damage.
Lý do rất đơn giản:
Nếu đổi sau mỗi lần gây damage, thì những thứ sau sẽ thành vấn đề:
multihit;
skill gây nhiều packet;
DoT;
follow-up;
counter;
phản damage;
Ultimate có nhiều phase.
Một Warrior “Chém Ngang → Trảm Dọc” sẽ khó đoán vì trạng thái đổi giữa chính một action.
Trong khi nếu dùng rule:
Basic Attack
→ resolve toàn bộ action
→ đổi state

Ultimate
→ resolve toàn bộ action
→ đổi state
thì cực kỳ sạch.
Chém Ngang là trạng thái đầu trận.
Lý do là Chém Ngang có heal 10%, nên trạng thái mở đầu thân thiện hơn và dễ hiểu hơn.
Sau đó:
Vào sân
→ Chém Ngang
Basic
→ Trảm Dọc
Basic
→ Chém Ngang
Ultimate trong Trảm Dọc
→ resolve theo Trảm Dọc
→ sau action đổi sang Chém Ngang
Ultimate được coi là:
Enhanced Basic Attack
thì nó vừa:
áp trạng thái hiện tại;
gây damage 200%;
sau đó đổi trạng thái.
Tao thích cách này.
Ví dụ đang:
Chém Ngang
Ultimate:
200% theo Chém Ngang → heal → đổi sang Trảm Dọc.
Rất trực quan.
“+2% HP” là gì?
Dùng Entry Snapshot
Nếu snapshot:
HP = 10.000
ARM = 500
RES = 500
mỗi stack:
+200 Max HP
+10 ARM
+10 RES
20 stack:
+4.000 HP
+200 ARM
+200 RES
Như vậy:
20 stack = +40% entry Max HP/ARM/RES
rất dễ cân bằng.
Actual HP Damage của một action lên mục tiêu ≥30% Max HP snapshot của mục tiêu.
Không tính: Shield damage. Overkill. DoT. Reflect.
Và quan trọng:
Một action chỉ tạo tối đa một Skill trigger, kể cả có nhiều mục tiêu.
Nếu không, một AoE Basic/Ultimate về sau sẽ có thể tạo nhiều stack.
Có thể Ultimate tự trigger Skill rồi tạo chain?
Ví dụ:
Ultimate
→ 200% Basic
→ đạt 30%
→ Skill x2
→ +4% HP/ARM/RES
→ +6 Rage
Sau đó: Skill trigger có làm state đổi thêm một lần không? Không.
State đã được xác định bởi Ultimate/Basic Attack action.
Skill passive chỉ là reaction/stat mutation.
Nếu không khóa, có thể xảy ra:
Ultimate → Skill → state đổi → engine hiểu skill cũng là action → state đổi lần nữa.
Không nên.
20 stack có nên bị ảnh hưởng bởi mục tiêu?
Đây là một câu hỏi nhỏ.
Ví dụ:
đánh cùng một Tanker 20 lần
→ 20 stack. Nên, Không cần buộc phải giết nhiều mục tiêu.

87) Cố Thanh Huyền
SSR — Mage
DMG: 4/5 SUR: 4/5 CTL: 3/5 CMP: 4/5 MIC: 4/5 VIS: 3/5
Element = Wood

nội tại: mỗi khi ultimate chuyển đổi giữa 2 dạng mộc và kim, đồng thời hồi hp = 4% max hp khi chuyển dạng qua ultimate, phần hồi hp này không cd, dù sao cũng không thể ultimate liên tục mãi được.

skill 1: mộc: mỗi turn tự hồi hp cho bản thân và 1 đồng minh ngẫu nhiên = 70% wil và atk của bản thân, overheal bị bỏ qua, khi vào dạng mộc sẽ tự kích hoạt, tồn tại trong 3 turn boundary, mỗi turn boundary heal tối đa cho bản thân và đồng minh ngẫu nhiên 1 lần, -15 ae mỗi lần kích hoạt skill, tức 3 turn boundary tốn 15 ae.
kim: gây sát thương = 210% wil và atk lên 1 mục tiêu, 10% sát thương Actual HP Damage được gây ra dưới dạng sát thương chuẩn, 20 ae.
skill 2: mộc: niệm chú, rễ cây đâm 1 mục tiêu có % hp thấp nhất trên sân, gây sát thương = 155% wil và atk của bản thân lên mục tiêu đó, hồi hp cho leader = 10% Actual HP Damage, 20 ae.
kim: khi hp dưới hoặc = 15% max hp, tự kích hoạt skill 1 dạng mộc mà không tốn cost, sau đó +10% wil và atk trong 1 turn boundary (giải thích như khiên của dạng kim), cost: 10 ae, cd 2 turn boundary.

ultimate: mộc: xoá 2 debuff cho bản thân sau đó aoe heal cho mọi đơn vị có chân ngã và thanh hp trên sân = 23% max hp của họ + 40% wil và atk của bản thân
kim: luôn cầm kiếm chém dọc lên hàng 2/5/8 của kẻ địch, gây sát thương aoe = 160% wil và atk lên mỗi mục tiêu, nếu mục tiêu DEATH_CONFIRMED vì ult này, lập tức nhận khiên = 10% max hp của bản thân, khiên từ ult này tồn tại trong 1 turn boundary, tức gây sát thương xong là hết 1 turn chủ động > kẻ địch DEATH_CONFIRMED > nhận khiên > đến turn chủ động tiếp thì mất khiên. khiên cũng sẽ không tự mất vì chuyển dạng từ nội tại.

Vào trận mặc định Mộc hay Kim → tao chọn Mộc.
Skill 1 Mộc cost 15 AE là trả một lần cho toàn bộ 3 Boundary, không phải 15 mỗi Boundary.
Khi rời Mộc rồi quay lại Mộc, có thay instance cũ hay không → tao chọn thay, không stack hai vòng heal.
Skill 2 Kim cast Skill 1 Mộc mà không đổi form.
10% True Damage của Skill 1 Kim là một phần của 210%, không phải +10%.
Ultimate Mộc chỉ heal đồng minh.
Ultimate Kim shield không stack theo số kill, mỗi Ultimate chỉ tạo một Shield instance.
Slot 2/5/8 nên ghi rõ là slot, tránh chữ “hàng”.
Chốt rõ mọi trạng thái/skill đang chạy của Mộc có tồn tại qua lần chuyển Kim hay bị xóa; tao nghiêng về chỉ effect có duration tiếp tục tồn tại nếu không có rule nói bị hủy, nhưng Skill 1 Mộc nên có cơ chế thay instance để tránh hai vòng heal chồng.
Ultimate bị gián đoạn/cancel/không resolve thì không chuyển trạng thái.
Chỉ sau khi Ultimate action thực sự commit thành công mới chuyển state và hồi HP.
Nếu không, có thể abuse những lần cast Ultimate không hoàn tất.

88)
Assassin, SSR, Neutral
DMG 4/5 SUR 3/5 CTL 2/5 CMP 4/5 MIC 4/5 VIS 4/5.
nội tại: Hiếp Yếu: khi tấn công một mục tiêu có element tag hoặc class yếu thế hơn thì 25% sát thương gây ra lên kẻ đó là sát thương chuẩn. Rage nhận được từ target thoả mãn hiếp yếu + 20%.
luôn target mục tiêu thoả mãn Hiếp Yếu kể cả target hơn rank nếu không bị taunt ảnh hưởng.
Sợ Mạnh: khi không có target nào thoả mãn hiếp yếu trên sân, sát thương gây ra giảm 20 %.

skill 1: tấn công 1 mục tiêu, gây sát thương = 200% wil + 200% atk của bản thân, cost: 15 ae và 5 rage. chỉ kích hoạt khi thoả mãn cost.

skill 2: khi DEATH_CONFIRMED thành công bởi sát thương từ bản thân (dot/overkill không tính) lập tức tăng max hp = 10% current hp, nếu đánh trúng mục tiêu không thoả mãn Hiếp Yếu thì bonus từ skill này sẽ reset, tối đa kích hoạt 5 lần/trận bất kể có bị reset hay không, cost: -5 ae và 10 rage, chỉ kích hoạt khi thoả mãn cost.
Skill 2 chỉ kích hoạt nếu DEATH_CONFIRMED được sinh ra trực tiếp từ một Damage Action do Assassin thực hiện; DoT và death delayed by external effect không được tính.
Như vậy khỏi tranh luận “overkill”.
nếu đánh trúng mục tiêu không thoả mãn Hiếp Yếu thì bonus từ skill này sẽ reset.
Tức là:
Toàn bộ Max HP mutation cộng dồn của Skill 2 bị reset về 0.
ultimate: cast 1 lần skill 1 mà không tốn cost, nếu target không thoả mãn Hiếp Yếu thì bonus từ skill 2 sẽ không reset.

target có element tag hoặc class yếu thế hơn cần hiểu là:
Assassin > Mage
hoặc
Assassin Element > Target Element
Chỉ cần một trong hai đúng → Hiếp Yếu.
Đây là cách tao khuyên dùng.
Không cần cả hai cùng đúng.
Ví dụ:
Assassin / Wood
đánh Mage / Fire
Class:
Assassin > Mage = +10%.
Element:
Water > Fire, nhưng Assassin là Wood → không.
→ vẫn Hiếp Yếu.
Nếu:
Assassin / Wood
đánh Warrior / Earth
Class không có lợi.
Element:
Wood > Earth = +10%.
→ vẫn Hiếp Yếu.
Nếu cả hai cùng có lợi:
Assassin / Wood → Mage / Earth
→ Hiếp Yếu vẫn chỉ là một trạng thái, không kích hoạt hai lần.
Không nên:
+25% True Damage + thêm 25% True Damage.
Luôn ưu tiên mục tiêu thỏa Hiếp Yếu, kể cả mục tiêu có rank cao hơn.
Điều này làm Assassin có một luật target riêng, khác Warrior.
Nhưng còn thiếu tie-break.
Ví dụ có:
Mage A = 40% HP
Mage B = 20% HP
Warrior C = 10% HP
Nếu A/B đều Hiếp Yếu nhưng C không:
chọn B hay A?.
1. Có Hiếp Yếu hay không
2. %HP thấp nhất
3. nếu bằng nhau → deterministic tie-break theo SSI slot
Không dùng rank làm tie-break, vì mày đã chủ động nói:
ưu tiên Hiếp Yếu kể cả target rank cao hơn.
Khi không có target nào thoả mãn Hiếp Yếu trên sân, damage -20%.
Tao nghĩ nên phân biệt:
Target pool
Có ít nhất một kẻ thù Hiếp Yếu.
Actual target
Có thể bị Taunt ép sang một kẻ không Hiếp Yếu.
Ví dụ:
Mage A: Hiếp Yếu
Tanker B: Taunt
Assassin bị bắt đánh Tanker B.
Sợ Mạnh không kích hoạt, vì trên sân vẫn tồn tại mục tiêu Hiếp Yếu.
Hiếp Yếu không được áp dụng cho B, nhưng Sợ Mạnh cũng không.
Taunt chỉ thắng target selection, không thay đổi trạng thái chiến trường.

đánh trúng” ≠ “gây damage thực tế”
Nếu đánh vào Shield = 0 HP damage thì không reset bonus.
Chỉ reset bonus khi Assassin thực sự gây Damage Action lên target không thoả mãn hiếp yếu.
Nếu target né/immune/đòn hoàn toàn không gây damage:
không reset.
Ultimate không kích hoạt Skill 2 reset protection cho mọi thứ trong Turn, chỉ bảo vệ Skill 2 mutation hiện tại khỏi lần Skill 1 được cast qua Ultimate đó.
Nếu không, sau Ultimate Assassin đánh Basic vào mục tiêu mạnh thì lại không reset? Cần tránh hiểu quá rộng. giới hạn:
Chỉ lần tấn công của Skill 1 được cast trực tiếp bởi Ultimate được miễn reset.

89) 
warrior, không element tag
DMG 4/5 SUR 4/5 CTL 2/5 CMP 3/5 MIC 3/5 VIS 5/5
nội tại: nhân vật này không thể follow up attack, mỗi khi DEATH_CONFIRMED 1 đơn vị có chân ngã tăng và hồi 20% max hp trong 2 turn boundary, tức giết mục tiêu > xong turn > vào turn boundary > tăng hp > đến turn chủ động > vào boundary> đến turn chủ động lần nữa thì khi vừa đến turn chủ động đó, khi vừa mới bắt đầu, chưa kịp gây sát thương thì phần tăng mx hp sẽ mất, tức giảm 20% max hp, max hp bị giảm nên nếu hp đầy cũng bị giảm 20%, nếu có khiên thì bỏ qua khiên, nếu khiên có cap mà max hp giảm làm khiên vượt cap thì khiên sẽ bị giảm tương ứng để phù hợp với kit tạo ra khiên đó (nếu có cap).

Tăng Max HP 20% một lần + hồi một lần, hiệu ứng kéo dài 2 Boundary.
Ví dụ:
Base Max HP = 10.000
→ giết 1 mục tiêu
→ Max HP = 12.000
Nếu HP lúc đó là: 10.000 / 12.000
thì lúc buff hết: Max HP 12.000 → 10.000.
HP phải trở thành: 10.000 / 10.000
chứ không giữ: 10.000 / 10.000
rồi “heal lại”.
Nếu có Shield có cap phụ thuộc Max HP:
giảm shield về cap hợp lệ mới nếu cần.
Nhưng chỉ shield nào có cap phụ thuộc Max HP mới chịu quy tắc này; không áp một shield-cap chung cho toàn engine.
Nếu có:
Shield cap = 30% Max HP = 3.600
sau khi buff mất: Shield cap = 3.000
Nếu shield đang là 3.600:
phải giảm xuống 3.000. Nhưng chỉ nếu loại shield đó có cap phụ thuộc Max HP. Không tự ý áp một cap chung cho tất cả shield.
Điểm này cần ghi trong engine contract chứ không chỉ trong character.
Mỗi DEATH_CONFIRMED tạo một Max HP mutation instance riêng, nhưng các instance cùng loại không được chồng stat; kill mới chỉ refresh/thay thế duration hiện tại.
Tức:
→ giết thêm
→ vẫn +20%
→ duration reset thành 2 Boundary.

đánh thường: đứng tại chỗ chém ra kiếm khí gây sát thương lên ô 1/2/3, nếu 3 ô này không có ai đứng thì gây sát thương lên ô 4/5/6, nếu 3 ô này không có ai lại gây sát thương lên ô 7/8/9, mỗi kẻ trúng đánh thường này nhận sát thương = 100% wil + 100% atk của nhân vật này, trong đó 50% wil và 50% atk sẽ được gây dam dưới dạng sát thương chuẩn.

Nếu 1/2/3 có 1 unit
Ví dụ:
slot 2 = empty
slot 3 = empty
thì đòn đánh:
chỉ đánh slot 1.
Đúng.
Nếu có 3 unit:
cả 3 nhận damage.
Nếu không có unit ở 1/2/3:
kiểm tra 4/5/6.
Đây là một AOE theo tầng ưu tiên, không phải random target.

skill: hp dưới hoặc = 40% res và arm của bản thân tăng 30%, hp trên hoặc = 60% + 20% atk và 20% wil, cost: - 5 ae và hp = 1% max hp/ mỗi turn hành động thành công, tức ultimate/đánh thường. khoảng giữa 41% đến 59% sẽ không có gì. skill bị động không tốn action để kích hoạt mà sẽ tự kích hoạt khi đủ điều kiện.

Sau mỗi successful Basic Attack hoặc Ultimate:
-5 AE.
HP Loss = 1% Max HP.
Đây là HP Loss / Self HP Cost, không phải damage.
mặc định HP Cost/HP Loss không thể khiến nhân vật chết; ít nhất 1 HP.

ultimate: cường hoá đánh thường, tỉ lệ sát thương chuẩn từ 50% wil và 50% atk tăng lên 80% wil và atk dưới dạng sát thương chuẩn sau đó đánh thường 1 lần.

100% WIL + 100% ATK, trong đó 50% WIL + 50% ATK là True.
hiểu chính xác là:
Normal component
50% ATK Physical
50% WIL Will
True component
50% ATK
50% WIL
Tổng: 100% ATK + 100% WIL
trong đó 50% tổng damage profile là True Damage.
ultimate:
10% ATK Physical
10% WIL Will
40% ATK True
40% WIL True
Tổng vẫn:
100% ATK + 100% WIL
Điểm khác biệt hoàn toàn nằm ở:
Tỷ lệ damage chuyển sang True Damage tăng từ 50% → 80%.
Ultimate là một Basic Attack action được cường hóa.
Khi đó sau action:
-5 AE;
-1% Max HP;
state HP kiểm tra;
rồi state/turn xử lý.
Sau mỗi Basic Attack action hoặc Ultimate action thực sự hoàn tất:
-5 AE
HP Loss = 1% Max HP
Hai cái này là cost của hành động đã thành công, không phải cost của state passive.
Và vì Ultimate được định nghĩa là:
Enhanced Basic Attack
nên Ultimate cũng chịu đúng cost này.
Đúng logic:
Ultimate
→ enhanced Basic Attack resolve
→ damage
→ death/reactions
→ -5 AE
→ HP Loss 1%
→ reevaluate HP state
→ action complete
Tao chỉ muốn engine chốt đúng thứ tự này: damage/death/reaction trước, cost HP sau, vì nếu HP Loss đi trước thì nó có thể làm đổi state HP trước khi chính Ultimate hoàn tất.
Khi Ultimate giết được mục tiêu
Timeline sẽ là:
Ultimate Basic Attack
→ target DEATH_CONFIRMED
→ nội tại +20% Max HP + heal
→ Ultimate action kết thúc
→ -5 AE
→ HP Loss 1%
→ kiểm tra lại HP state
Nếu HP mutation từ nội tại vừa tăng Max HP rồi HP Loss mới tính 1%:
tao thấy hợp lý.
Ví dụ:
kill → 12.000
HP Loss = 1% Max HP hiện tại = 120
không phải 100.
Điều này cần giữ nhất quán với canon:
“1% Max HP” luôn lấy Max HP tại thời điểm HP Loss được resolve.
buff ultimate, Ultimate = Enhanced Basic Attack, tổng hệ số damage từ 100% → 150%.
Và giữ nguyên tỷ lệ True Damage: 80% của damage profile là True Damage.
Vậy: Basic
→ 50% normal
→ 50% True
Ultimate
→ 30% normal
→ 120% True
Tức: 30% Physical/Will, 120% True
Tổng = 150% ATK + 150% WIL.
Không nên hiểu:
“150%” = 150% damage sau mitigation.
Nó vẫn là:
damage profile 150% ATK/WIL được tạo ở đầu action, sau đó mới qua mitigation.
Như vậy:
150%
→ 30% normal
→ 120% true
→ mitigation trên 30%
→ true giữ nguyên.
Sau Ultimate vẫn:
-5 AE
HP Loss = 1% Max HP.
