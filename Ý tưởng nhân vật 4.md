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

13) Rotania
mage

nội tại: natural Action tiếp theo của natural Action đầu tiên khi vào sân, tức vào sân > natural Action (nếu từ deck ra thì đầy rage và ult, thường là thế nếu không có kit can thiệp) > natural Action tiếp thì nội tại kích hoạt > natural Action tiếp theo không kích hoạt nội tại > natural Action tiếp theo nữa lại kích hoạt nội tại, cứ thế lặp lại đến khi rời sân.
hiệu ứng nội tại: khi gây Actual HP damage lên target, sát thương từ natural Action đó sau khi xong thì target nhận thêm sát thương chuẩn = 30% Actual z,
a hHP damage target nhận từ nhân vật này, hiệu ứng này tính là follow up attack, dễ hiểu là target nhận Actual HP damage = 100 thì nhận thêm sát thương chuẩn là 30, vì là follow up nên tính là 1 action với đòn chính, hiệu ứng này cap kích hoạt max 9 target/mỗi lần nội tại kích hoạt.

skill 1: triệu hồi 5 lỗ đen (vfx biến động theo lượng target, không hiện ở ô skill có thể target nhưng không có target), trong đó bay ra tia sét gây sát thương = 150% wil và 120% atk của bản thân lên 5 vị trí cố định là 2/4/5/6/8 của kẻ địch, đòn aoe này mỗi khi DEATH_CONFIRMED 1 target có chân ngã thì cost của skill này giảm 4 ae, cost: 30 ae.
Nếu kích hoạt nội tại thì phần giảm cost đương nhiên tính vì sát thương chuẩn của nội tại tính là follow up trong 1 natural Action.

skill 2: sau khi kích hoạt bằng 1 natural Action, không gây sát thương ngay mà tụ lực, đến natural Action tiếp theo sát thương gây ra bằng ultimate/skill hoặc đánh thường hệ số sát thương tăng 40% trong 1 natural Action, 25 ae.
ví dụ dùng skill này, natural Action sau dùng skill 1 thì hệ số sát thương wil và atk của skill 1 tăng 40%, 210% wil và 168% atk lên mỗi target, chưa kể nếu nội tại kích hoạt thì sau đó mỗi target nhận thêm 30% Actual HP Damage của skill 1 dưới dạng sát thương chuẩn và sát thương cao như thế thì DEATH_CONFIRMED không khó, tối đa giảm được 20 ae cost skill 1, điểm cân bằng là kích hoạt skill 2 cần 1 turn, animation sẽ là vận sức, có lẽ nên nerf kiểu sau khi kích hoạt skill 2 xong thì nhận debuff hay tạm mất chỉ số nào đó?.

skill 3: tự kích hoạt khi hp dưới hoặc = 15% max hp và có tối thiểu 40 rage, cost: max rage +20, rage hiện có -20.
nhận 1 lớp khiên = 45% max hp của bản thân trong 3 natural Action, sau khi skill này kích hoạt thì sau 3 natural Action khiên sẽ biến mất, ưu tiên tiêu hao khiên từ skill này, nếu trên người có khiên thuộc nguồn ngoài bản thân và khiên đó có mô tả ưu tiên tiêu hao khiên từ chính nguồn đó thì vẫn sẽ ưu tiên tiêu hao khiên từ skill này, khi khiên mất tự hồi hp = 25% max hp. kích hoạt tối đa 2 lần trong trận đấu.
một skill tự cứu, rage khi kích hoạt được skill này mà không tăng hay giảm từ bị đánh hoặc hành động là: 20/120, tăng rage max là nerf vì cần đầy rage để ult, max rage càng thấp ult càng nhanh.

utl: cast 1 lần skill 1 nhưng không tốn cost, nếu skill 1 cast qua ult DEATH_CONFIRMED (tính luôn nội tại) target có chân ngã thì max rage giảm 3 vì skill 1 cast qua ult đã không tốn cost, sau đó heal bằng 20% tổng Actual HP damage gây ra, overheal từ ultimate này bị bỏ qua và không thể chuyển sang khiên bằng kit của đồng minh hay kẻ thù nếu có hiệu ứng chuyển overheal sang khiên, phần tổng này không tính sát thương chuẩn từ nội tại. ultimate này vẫn có thể kích hoạt nội tại.

14) Echo Reverie

Nguồn: Echo trong thần thoại Narcissus.
Trong phiên bản Ovid, Echo bị tước khả năng chủ động trong lời nói và chỉ có thể lặp lại những từ cuối mà người khác nói.
Signature:
repeat the last action / last word / last effect.

nội tại: khi kẻ thù gây sát thương lên bản thân và bản thân gây sát thương lên kẻ thù, lặp lại 50% sát thương đó dưới dạng sát thương chuẩn, chỉ mỗi sát thương chuẩn mà không có hiệu ứng kèm theo, sát thương từ nội tại này được tính là của nhân vật này, không tính là 1 natural Action, ví dụ: hắn là A bị dính aoe của kẻ thù là B, nhận 10 sát thương và dot mỗi natural Action của A là 2% max hp trong 3 turn boundary của A thì A sẽ nhận thêm sát thương chuẩn là 5 nhưng không kèm theo hiệu ứng hay stack gì của B, coi như A tự đánh A, sát thương chuẩn này không tính dot, vì tính của A nên B không nhận lợi ích gì từ sát thương chuẩn này, khi A đánh B thì B cũng nhận sát thương chuẩn từ nội tại này.
khi nhận Actual HP damage là đánh thường thì hắn chỉ được đánh thường trong 1 natural Action tiếp theo, nếu trong 1 turn boundary của hắn: nhận quá nhiều đánh thường/skill/ult Actual HP damage thì ở lần nhận sát thương mới nhất trong turn boundary đó là loại nào thì khi hết turn boundary và đến natural Action hắn chỉ được dùng cách thức gây sát thương đó, ví dụ trong turn boundary hắn nhận đánh thường > ult > skill > nội tại gây sát thương từ kẻ thù và đến natural Action của hắn thì hắn chỉ dược dùng skill (nội tại bỏ qua, dot các kiểu cũng bỏ qua), vẫn tuân theo ssi mà không phải chắc chắn target kẻ đánh mình, tóm lại dùng skill hay đánh thường hoặc ultimate đều có hạn chế, nếu hắn đầy nộ mà trong turn boundary ở lần nhận sát thương cuối không phải ultimate thì natural Action tiếp theo hắn vẫn không thể ult. các char khác trừ phi bị kit giới hạn không thì đến natural Action của mình mà rage vẫn đầy không bị giảm thì sẽ auto cast ult nhưng char này thì khác, kit của hắn là giới hạn.

Nội tại nerf hơi nặng nên char này sẽ có nhiều aoe để cân bằng.

nếu hắn nhận sát thương từ đánh thường nhưng kit kẻ thù có skill cường hoá đánh thường thì tính là hắn nhận đánh thường, nếu nhânk sát thương là ultimate cast lại skill hay đánh thường thì tính là hắn nhận sát thương từ ult và hắn có thể ultimate, nhưng nếu hắn không đầy rage thì fallback về kiểu gây sát thương kẻ địch gây lên hắn, tức ultimate cast skill gây Actual HP damage lên hắn > cast ult nếu đủ rage, không đủ thì cast skill, mà không phải kiểu B đánh A thì A phải đánh lại B, char này vẫn tuân ssi và mô tả cách gây sát thương của skill/đánh thường và ult, nếu char này mỗi phe đều có và chúng có thể đánh lẫn nhau thì vẫn không bị nội tại của đối phương ảnh hưởng, vẫn sài skill/ult/đánh thường theo nội tại của bản thân chúng.

ngẫm lại thì char này rất mạnh, nếu aoe nhiều + thêm sát thương chuẩn từ nội tại nữa thì chẳng phải quá mạnh, tự hạn chế là hợp lý.

skill 1: mỗi natural Action tổng 35% nội tại gây sát thương lên enemy sẽ được chuyển thành hp và khiên với tỉ lệ 1:1/35% đó, dễ hiểu là mỗi natural Action gây sát thương chuẩn từ nội tại lên target bao nhiêu thì 17,5% tổng sát thương đó sẽ được chuyển thành khiên, 17,5% cũng chuyển thành hp, overheal và khiên vượt 100% max hp bị bỏ qua, mỗi natural Action - cost là 10 ae.
char này cần được thiết kế để ngốn ae, hắn dps cao nhưng giấy và ngốn tài nguyên, giấy thì cần team bảo vệ, ngốn tài nguyên làm đồng minh khác tần xuất sài skill thấp hơn, cũng khó bảo vệ hắn hơn.

