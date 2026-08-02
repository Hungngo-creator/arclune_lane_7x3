Axiom là một mệnh đề nền tảng mà hệ thống bắt buộc phải duy trì. Nó không nhất thiết tác động lên mọi đơn vị, nhưng phần nằm trong phạm vi của nó không thể bị Pháp Tắc hoặc Quy Tắc sửa đổi.
World Axiom hoặc Thiên Điều là Axiom được Arclune triển khai trên toàn chiến trường. Nó ghi nhận hoặc chi phối mọi đối tượng đủ điều kiện; các nhân vật thông thường chỉ chịu tác động, còn UR và Prime mới có quyền truy cập, khai thác hoặc ra lệnh cho một phần cơ chế của nó.
Phân loại:
Axiom cá thể
Thần Tính thuộc nhóm này.
Nó là một mệnh đề gắn với bản thân Prime, đại khái:
Bản thể này không tiếp nhận buff, debuff và mark từ ngoại nguồn.
Nó không phải luật toàn chiến trường. Toàn bộ đơn vị vẫn tồn tại bình thường dù không có Thần Tính.
Các thứ như:
Bất Diệt Bá Thể không vào Luân Hồi.
Vị Tri: đáp án chưa từng được sinh ra.
Không thể follow-up.
Một cái chết là kết thúc tuyệt đối.
cũng có thể là Axiom cá thể nếu được thiết kế ở cấp đó.
Axiom thế giới hoặc Thiên Điều
tự động tồn tại trong mọi trận và theo dõi tất cả đối tượng hợp lệ.
Hiện có thể tính:
Luân Hồi — quản lý thời hạn phục sinh, Chân Ngã và trạng thái bước vào vòng đầu thai.
Thiên Lôi Vô Tư — mệnh đề Lôi Kiếp không thiên vị phe nào. Phần kiểm tra điều kiện và gây sát thương vẫn do Quy Tắc triển khai, không phải toàn bộ cú sét đều mang Axiom.
Quang Ảnh Chi Hà — quản lý lịch sử trạng thái và quyền hồi quy.
Tên chính thức:
Quang Ảnh Chi Hà

Tên gọi thông thường:
Thời Gian Trường Hà

Đơn vị dữ liệu:
Quang Ảnh

Mỗi điểm lưu:
Mốc Quang Ảnh
Mệnh đề Axiom:
Axiom — Quang Ảnh Chi Hà: Mọi hành động đã hoàn tất đều để lại một Quang Ảnh không thể bị xóa khỏi dòng thời gian. Quang Ảnh ghi nhận trạng thái của chiến trường tại thời điểm ấy, nhưng chỉ những quyền năng được dòng sông thừa nhận mới có thể gọi trạng thái cũ trở lại.
Điểm quan trọng:
Axiom chỉ ghi nhận lịch sử. Kit mới quyết định được quay lại đâu, quay lại cái gì và phải trả giá thế nào.
Như vậy Axiom không tự động hồi máu, phục sinh hoặc tua ngược trận đấu. Nó chỉ cung cấp cơ sở dữ liệu tuyệt đối cho các kit thời gian.
Một Mốc Quang Ảnh nên ghi:
Vị trí và đối tượng đang chiếm từng ô.
Nhân vật đang trên sân, trong deck, đã chết hoặc đã rời trận.
Current HP và Max HP.
Rage cá nhân.
AE cá nhân nếu có.
AE pool chung.
Cost pool.
Chỉ số hiện tại.
Buff, debuff và mark.
Stack, thời hạn, tag và nguồn của mỗi trạng thái.
Cooldown.
Trạng thái niệm chú, vận sức, biến hình.
Tuổi thọ và chủ sở hữu summon.
Class hiện tại.
Các bộ đếm nội tại.
Trạng thái leader.
Bộ đếm tử vong và Luân Hồi.
Thứ tự hành động đang chờ.
Không ghi:
Animation.
VFX.
Cài đặt thiết bị.
Trạng thái collection ngoài trận.
Nâng sao, awaken hoặc trang bị vĩnh viễn.
Thời điểm tạo snapshot:
Một nhân vật bắt đầu hành động.
→ mọi hit, follow-up bắt buộc, phản ứng và hiệu ứng phát sinh được resolve.
→ toàn bộ chuỗi kết thúc.
→ ACTION_COMMIT.
→ Quang Ảnh Chi Hà tạo một Mốc Quang Ảnh.
Bao gồm hành động của:
Nhân vật collection.
Leader.
Summon.
NPC.
Boss.
Kiếp Thân.
Creep có lượt hành động riêng.
Không tạo mốc riêng cho:
Từng hit của multihit.
Từng lần phản damage.
Mỗi stack được áp.
Drone chỉ là VFX.
Một vật thể không thực hiện hành động độc lập.
Phải có hai loại quay ngược
Nếu không tách, game sẽ đầy nghịch lý và exploit.
1. Hồi Quy Cá Thể
Chỉ đưa một mục tiêu về trạng thái cá nhân trong Mốc Quang Ảnh:
HP.
Rage.
Chỉ số.
Buff/debuff/mark.
Cooldown.
Hình thái.
Nó không mặc định:
Hoàn lại Cost.
Đưa đơn vị khác về deck.
Hủy damage mục tiêu từng gây.
Phục hồi toàn bộ chiến trường.
Trả AE pool chung.
Vị trí cũ chỉ được phục hồi nếu ô ấy đang trống. Nếu ô bị chiếm, có thể:
Giữ nguyên vị trí hiện tại.
Đưa mục tiêu đến ô hợp lệ gần nhất.
Đưa vào một ô Dòng Thời Gian tạm thời.
Không nên đẩy A về deck và hoàn Cost trong một hồi quy cá thể, vì sẽ có exploit:
Triệu hồi A.
A gây damage và dùng skill.
Quay B về ô cũ.
A về deck và được hoàn Cost.
Damage A đã gây vẫn còn.
Như vậy player được dùng A miễn phí.
2. Hồi Quy Chiến Trường
Khôi phục toàn bộ global checkpoint.
ví dụ: A về deck.
Cost triệu hồi A được hoàn lại.
B sống lại tại ô 7.
Damage, buff, cái chết và mọi thay đổi sau mốc đều bị hoàn tác.
AE, Rage, Cost và vị trí đều trở lại đúng mốc đó.
Cost hoàn lại vẫn bị clamp:
Cost sau hồi quy = min(Cost tại snapshot, 30)
Nếu thời điểm snapshot có 28 Cost thì trở lại 28, không phải “cộng lại Cost đã tiêu” rồi vượt cap.
Loại Hồi Quy Chiến Trường nên cực hiếm, thường chỉ dành cho:
Prime.
Ultimate UR rất đắt.
Một cơ chế chỉ kích hoạt một lần mỗi trận.
Hoặc phải phá hủy một Mốc Quang Ảnh sau khi dùng.
Quan hệ với Luân Hồi:
Đã chết nhưng chưa vào Luân Hồi:
Có thể hồi quy về trước cái chết.

Đã vào Luân Hồi:
Quang Ảnh vẫn tồn tại như một bản ghi,
nhưng không thể gọi Chân Ngã trở lại đời cũ.
Tức là:
DEATH_CONFIRMED
→ vẫn còn cửa sổ phục sinh/hồi quy
→ đủ bốn cái chết hợp lệ xảy ra sau đó
→ ENTERED_REINCARNATION
→ snapshot cũ mất quyền tái hiện Chân Ngã.
Điều này giữ cho Luân Hồi có giá trị. Nếu Thời Gian có thể tùy tiện kéo người đã vào Luân Hồi trở lại, toàn bộ luật “chết quá lâu không thể phục sinh” sẽ mất ý nghĩa.
Quay về trước cái chết không được tính là phục sinh:
Phục sinh:
Cái chết đã xảy ra, sau đó người chết trở lại.

Hồi quy:
Dòng trạng thái trở về thời điểm trước khi cái chết được xác nhận.
Tuy nhiên, nếu một Axiom cá thể ghi:
Sau khi DEATH_CONFIRMED, tồn tại này không thể trở lại bằng bất kỳ con đường nào.
thì Quang Ảnh Chi Hà cũng không được tự động kéo nó về; đây là xung đột Axiom trực tiếp.
Summon không có Chân Ngã vẫn có thể được khôi phục bằng hồi quy, vì nó không bước vào Luân Hồi. Nó chỉ là trạng thái chiến trường được dựng lại.
Quan hệ với Thần Tính
Nên tách ghi nhận với can thiệp.
Ghi nhận
Quang Ảnh Chi Hà snapshot tất cả đối tượng hợp lệ, kể cả Prime có Thần Tính.
Việc được ghi lại không phải:
Buff.
Debuff.
Mark.
Hiệu ứng có lợi hoặc có hại.
Nên Thần Tính không chặn việc snapshot.
Gọi lại trạng thái
Khi một kit muốn hồi quy Prime:
Nếu hồi quy chỉ mang Quy Tắc, Thần Tính có thể ngăn phần can thiệp từ ngoại nguồn.
Nếu kit mang Axiom, tiến hành phán định Axiom trực tiếp.
Nếu là Hồi Quy Chiến Trường do chính Thiên Điều thực hiện, phải ghi rõ Thần Tính có được miễn hay không.
Tao nghiêng về:
Thần Tính không miễn nhiễm Hồi Quy Chiến Trường toàn cục, vì đó không phải trạng thái được áp lên Prime mà là toàn bộ chiến trường trở về một Mốc Quang Ảnh.
Nhưng Hồi Quy Cá Thể từ kẻ khác vẫn có thể bị Thần Tính ngăn.
không khôi phục RNG mặc định.
Quang Ảnh khôi phục:
Trạng thái.
Vị trí.
Tài nguyên.
Sinh tử.
Nhưng không bắt tương lai phải diễn lại giống hệt.
Câu lore:
Dòng sông có thể đưa vạn vật trở về bờ cũ, nhưng không bắt chúng bước lại đúng dấu chân xưa.
Sau khi hồi quy:
Skill random có thể chọn mục tiêu khác.
Crit có thể khác.
Class random có thể khác nếu được roll lại sau mốc.
Hai phe có thể hành động khác.
Nếu snapshot cả RNG seed, player có thể biết chắc một đòn sẽ crit hoặc random ra mục tiêu nào rồi tua lại để khai thác. Chỉ một kit đặc biệt liên quan đến định mệnh tái diễn mới nên buộc kết quả lặp lại.
Vấn đề hiệu năng
Lore có thể nói dòng sông lưu mọi Quang Ảnh, nhưng engine không cần sao chép toàn bộ trận đấu sau mỗi hành động.
Dùng:
Một snapshot nền.
+
delta sau từng hành động.
Ví dụ sau hành động chỉ lưu:
A mất 200 HP.
B nhận 1 mark.
C từ ô 4 sang ô 5.
Cost giảm từ 18 xuống 10.
Summon D được tạo.
Khi rewind, engine áp ngược các delta.
Nên có một cửa sổ truy cập:
Giữ tối đa 12–20 Mốc Quang Ảnh gần nhất
hoặc
toàn bộ một vòng hành động.
Axiom về lore vẫn ghi nhận toàn bộ lịch sử. Nhưng kit chiến đấu chỉ được quyền truy cập những mốc còn nằm trong Tầm Hồi Quang. Những mốc đặc biệt có thể được một Prime chủ động đóng neo để giữ lâu hơn.