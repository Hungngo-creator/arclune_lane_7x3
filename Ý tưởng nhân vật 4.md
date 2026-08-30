1) Cố Sự Chi Thần
Cố Sự Chi Thần là một char đặc thù, là bài test cho kernel và hệ thống tag, chưa thể thêm nhân vật này vào game nếu 2 thứ đó chưa hoàn thiện, đọc docs/Cố Sự Chi Thần.md để hiểu rõ về char này hơn nếu có yêu cầu liên quan đến hắn.

2) 

SR,

3)
phân tích kỹ hơn nằm ở docs/Chuẩn hoá và gắn tag kit/warrior_stance_execute_analysis.md

nội tại: ultimate sẽ chuyển đổi trạng thái đánh thường, vào trận với đơn kiếm, đánh thường gây sát thương= 100% wil và 100% atk của bản thân lên 1 mục tiêu, khi ultimate lần đầu mỗi khi ra sân, chuyển sang dạng song kiếm, sát thương đánh thường tăng 50% và bỏ qua 10% res cùng arm của target, ultimate lần nữa sẽ chuyển về dạng đơn kiếm, cứ thế lặp lại cho đến khi rời sân, nếu vào sân lần nữa dạng bắt đầu cũng sẽ là đơn kiếm. dạng song kiếm đánh thường % cũng là 100% như đơn kiếm

skill 1: gây sát thương bằng 165% của đánh thường lên 1 mục tiêu, nếu target DEATH_CONFIRMED bởi natural Action này, nhân vật này nhận buff frenzy (sát thương đánh thường tăng 10%) trong 2 natural Action của bản thân hắn, 20 ae. chỉ dùng được ở dạng song kiếm.

skill 2: gây sát thương = 180% của đánh thường, hồi hp = 25% tổng Actual HP Damage skill này gây ra cho bản thân, 20 ae, chỉ dùng được ở dạng đơn kiếm.

skill 3: mỗi khi DEATH_CONFIRMED target một mục tiêu bằng natural Action 2 lần, nhận 1 buff excute (kết liễu kẻ thù nếu kẻ đó nhận sát thương từ bản thân và còn hp dưới 10% max hp của chúng) trong 2 natural Action, target bị buff excute của skill này kết liễu không tính vào bộ đếm 2 death DEATH_CONFIRMEDcuar skill 2, riêng buff excute của skill này cấp Pháp Tắc nhưng skill này là skill thường, không có tag pháp tắc trở lên, nếu có nhiều hơn 1 buff excute trên bản thân, ưu tiêu kích hoạt buff excute của bản thân trước. Mỗi khi skill này kích hoạt thành công và ngay khi bản thân hắn nhận buff excute từ skill 2, hắn cũng nhận debuff "không thể hồi phục", debuff này cùng cấp tag với cấp của buff excute từ skill 2, lưu ý quan hệ này cần động, không code cứng, tao muốn khi cấp tag buff excute từ skill này bị thay đổi thì debuff không thể hồi phục cũng thay đổi theo, không thể hồi phục: không nhận heal từ mọi nguồn (trừ bản thân)  trừ nguồn cùng cấp tag trở lên (viết thể để tránh phán định, cũng là nerf)

ultimate: tấn công tối đa 3 mục tiêu tùy vị trí đứng, 1/4/7, 2/5/8, 3/6/9, tối đa 3 kẻ đó bị hất tung và gom lại ở ô 7/8/9 tùy vị trí đứng, trong khi bị hất tung hắn gây 1 đánh thường lên mục tiêu (sát thương tùy dạng đơn hay song kiếm), sau đó animation của hắn trở về vị trí lúc ultimate, hiểu đơn giản là ult của yone trong LOL, mỗi kẻ dính ult này chỉ nhận sát thương = 1 đánh thường mà thôi, mỗi char dính ultimate này được tính là nhận 1 đánh thường từ hắn.

mục đích thiết kế là 1 char có sát thương không quá cao mà chỉ ở mức trung bình cao, đổi lại skill có thể dùng liên tục, tức dps vừa nhưng kéo dài

4)

ultimate: gây aoe toàn sân (max 9 target), mỗi kẻ nhận sát thương = 185% wil và 185% atk của bản thân nhân vật này, sau khi gây sát thương xong nếu trong target có summon không có chân ngã nhưng có hp bar và hp của chúng dưới hoặc= 10% max hp của bản thân chúng, lập tức DEATH_CONFIRMED, hiệu ứng này chỉ target summon có rank bằng hoặc thấp hơn nhân vật này.
(tránh kill vật chứa của cố sự chi thần hoặc case tương tự), tỉ lệ sát thương này cũng không phải thấp đối với summon, nhiều khi không cần kết liễu là đã chết rồi, nếu kích hoạt kết liễu summon thì 2 bên player chỉ thấy summon nhận ultimate này rồi summon DEATH_CONFIRMED, tức quá trình nhận sát thương nếu đủ điều kiện kết liễu thì kết liễu trong natural Action của nhân vật này luôn, tao muốn không có delay về mặt hiển thị.

5) Đế Hoài An

không thể không ma hoá

6

nội tại: mỗi natural Action gồm skill/đánh thường/ultimate đều sẽ gắn 1 mark Đóng Băng lên mục tiêu, khi đạt đủ 3 mark trên target, lập tức đóng băng target, họ không thể thực thi natural Action trong 1 turn của bản thân họ, ngay khi vfx đóng băng kích hoạt, tức vừa xoá 3 mark đóng băng để kích hoạt đóng băng, 5 thanh băng kiếm từ góc nghiêng 60 độ trước mặt mục tiêu sẽ xuất hiện, đâm về phía mục tiêu, gây sát thương = 150% đánh thường của nhân vật này, số lượng băng kiếm không quan trọng, chỉ là hiển thị thôi, quan trọng là nội tại này lấy chỉ số từ đánh thường, nếu sát thương đánh thường tăng thì nội tại sẽ tăng sát thương, mark đóng băng và hiệu ứng đóng băng khi kích hoạt mark thuộc cấp pháp tắc, đâg đơn giản là một loại stun thôi. mỗi mark có time tồn tại riêng = 2 turn boundary của nhân vật này.

nếu target tu vi cao hơn bản thân 5 tiểu cảnh giới hoặc 1 đại cảnh giới, sát thương từ mark giảm 50%, nếu target hơn bản thân 2 đại cảnh giới, sát thương từ mark thành 1 sát thương chuẩn, căn bản vô hiệu. giới hạn này chỉ áp dụng lên target có rank hơn hoặc = bản thân nhân vật này. ví dụ, tao sẽ dùng 2 đại cảnh giới đầu game là Khai nguyên, trúc cơ đến Kết Đan, mỗi đại cảnh giới này đều có 9 tiểu cảnh giới, khai nguyên 4 gặp KN9 > giảm 50% sát thương từ mark, KN9 gặp Trúc Cơ 1 cũng thế, KN9 gặp Kết Đan 1 trở lên mark vẫn tích nếu không bị kit khác ảnh hưởng, tích xong kích nổ nhưng chỉ gây 1 sát thương chuẩn.

mặc dù free natural Action rất khó chịu nhưng bản thân mark này chỉ là cấp pháp tắc, gặp thần tính thì vô dụng, hơn nữa hạn chế không ít.

đánh thường: tấn công 1 target, gây 150% wil và 150% atk.

skill 1: 

7)

ultimate: cưỡng chế rút hp = 3% max hp của mỗi kẻ địch trên sân, gây sát thương = 100% hp rút được + 150% wil và 150% atk của bản thân lên 1 mục tiêu, cái rút hp này cùng sát thương chuẩn không sai biệt lắm, cũng là bỏ qua phòng ngự, mày có thể gắn tag sát thương chuẩn cũng được, và cái rút hp này có thể DEATH_CONFIRMED kẻ bị rút, vfx thì là khi char này ult, hp của kẻ địch sẽ chảy từ đỉnh đầu của chúng hội tụ thành một thanh kiếm sau đó tấn công 1 target (theo ssi)
ý tưởng là một ma tu huyết đạo.

8

nội tại: mỗi khi DEATH_CONFIRMED, vào luân hồi ngay và bỏ qua cửa sổ chờ luân hồi, không vào cửa sổ chờ nên không ảnh hưởng các chân ngã trong đó,

9) Hà Tích Hương
Nữ, warrior

Nội tại, Tinh Vẫn Thần Quyền: mỗi đánh thường và skill gắn 1 mark 'Tinh Vẫn' lên target, khi đạt 3 mark trên target, tinh không xuất hiện sao băng (animation) tấn công target, gây sát thương = 150% will và atk của mark owner lên target, if target hp < 10% max hp, execute now, sau khi kích hoạt mark sẽ biến mất.
mark cấp Pháp Tắc, kit xoá mark dưới cấp này không thể xoá mark này, nếu kit xoá lv pháp tắc thì phán định xung đột tag.

đánh thường: gây sát thương = 100% wil và atk lên 1 target, nếu target không đứng hàng 7/8/9 và sau lưng có đơn vị khác, target đó bị đánh văng và đụng trúng target khác sau lưng họ, cả hai nhận thêm sát thương = 30% wil và 30% atk của nhân vật này, 2 kẻ thù đụng nhau chỉ là cơ chế, animation và không ảnh hưởng vị trí chúng đứng trên sân, target đầu bị đánh sẽ bị gắn 1 mark, nếu kích hoạt đụng nhau thì cả 2 target đó sẽ không nhận thêm mark.

10)
Boss, unavailable với player.

nội tại: mỗi 10% hp lost/100% max hp, + 5% atk/wil/res/arm, tính trên base, stack nhưng stack sau không tính trên chỉ số cộng từ stack trước.

đánh thường: gây sát thương = 150% wil và atk của bản thân lên 1 target.

ultimate: gây aoe toàn sân = 300% wil và ATK của bản thân lên toàn bộ kẻ địch, nếu kẻ địch có hp = hoặc dưới 10%, kích hoạt execute, kết liễu và tiễn vào cửa sổ chờ luân hồi.

11)
nội tại: khi vào sân cửa sổ chờ luân hồi +2, khi rời sân hiệu ứng này biến mất, nếu có 2 đơn vị này trên sân (mỗi phe 1 char) thì nội tại này sẽ kích hoạt 2 lần tức cửa sổ là 8 nếu không có kit khác can thiệp.

nếu cửa sổ đang hơn 4 mà char này rời sân, 2 chân ngã chết lâu nhất sẽ vào luân hồi, nếu mỗi phe 1 char thì 4 chân ngã chết lâu nhất vào luân hồi.

skill 1: tấn công 1 target, gây sát thương = 150% wil và 150% atk, sau khi natural Action từ skill này kết thúc, nhận khiên = 25% Actual hp damage skill này gây ra, 20 ae, khiên từ skill này không thể vượt max hp của nhân vật này, khiên tồn tại tối đa 2 natural Action của nhân vật này, lượng khiên từ skill có thể cộng dồn.

skill 2: trong mỗi turn boundary, sát thương nhận từ 1 natural Action của kẻ thù lên khiên của bản thân vượt 35% max hp của bản thân (miễn khiên trên bản thân là tính), lập tức hồi hp = 70% wil và atk của bản thân cho mình và leader đồng minh, tức cả 2 nhận heal = 70% wil và 70% atk của nhân vật này khi lượng khiên của hắn mất quá nhanh, tự kích hoạt khi đạt điều kiện và ae pool có tối thiểu 20 ae, cost 20 ae/mỗi lần kích hoạt.

ultimate: revive random 1 ally từ cửa sổ chờ luân hồi, ally revive với hp = 35% max hp của họ, 5 rage, chỉ số 100% như lúc summon từ deck, nếu target có chỉ số được scale từ kit của bản thân trước khi vào cửa sổ luân hồi, chỉ số đó được reset hoặc giữ tùy mô tả kit của họ.

12)

ranger

nội tại: mỗi turn boundary của bản thân khi đồng minh ngoài bản thân bị 1 natural Action của enemy deal Actual HP damage, đánh thường lên enemy đó trong chính natural Action của họ sau khi animation deal damage lên ally thành công, kích hoạt tối đa 3 lần/turn boundary của bản thân, kỳ vọng là khi ally bị đánh, mất hp thì char này sẽ tấn công lại target đó, hoạt động tương tự như cao bồi silas
kích hoạt các hiệu ứng liên quan đến đánh thường.
gọi char này là 2 vì chưa có tên
A2: char 2 bên phe tao, B2; char 2 phe AI, B3; một char thuộc phe AI, A3: một char ngẫu nhiên khác thuộc phe tao.
A2 đánh B3 bằng natural Action, A2 bị B2 đánh lại bằng nội tại này.
B3 đánh A3, nội tại A2 kích hoạt và đánh B3, sau đó nội tại của B2 cũng kích hoạt và đánh A2, đó là cách nội tại này hoạt động nếu có 2 char số 2 trên sân.
mà nghĩ lại nội tại này chỉ trigger khi ally nhận sát thương từ natural Action nên ví dụ thứ 2 là sai vì nội tại char này không phải natural Action 
