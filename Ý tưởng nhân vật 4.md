1) Cố Sự Chi Thần
Cố Sự Chi Thần là một char đặc thù, là bài test cho kernel và hệ thống tag, chưa thể thêm nhân vật này vào game nếu 2 thứ đó chưa hoàn thiện, đọc docs/Cố Sự Chi Thần.md để hiểu rõ về char này hơn nếu có yêu cầu liên quan đến hắn.

2) 

nội tại: mỗi lần dùng skill hay ultimate heal cho đồng minh bằng natural Action bằng kit của bản thân, giáng 1 cột sáng từ trên trời xuống mọi target nhân vật này gây sát thương bằng natural Action lên ở 1 natural Action trước lần heal đó.
mỗi natural Action chỉ kích hoạt nội tại này 1 lần.
sát thương từ cột sáng bằng 100% wil và atk của nhân vật này/cột, không code sát thương cột sáng = sát thương của đánh thường dù chúng có hệ số sát thương giống nhau ở mô tả.
mỗi lần nội tại kích hoạt cap tối đa 7 cột sáng, nếu natural Action trước khi kích hoạt nội tại gây sát thương lên nhiều hơn 7 target, cột sáng random, cột sáng tính là follow up của natural Action kích nội tại, ví dụ: gây aoe toàn sân nhưng trúng 8 target, natural Action tiếp theo heal cho ally vừa gây sát thương từ nội tại lên 7 target cùng lúc.
trên lý luận char này có thể kích hoạt nội tại mỗi natural Action nhưng hắn sẽ chỉ có 1 skill/ult gây sát thương, muốn kích hoạt nội tại ở natural Action tiếp theo cần heal cho ally bởi kit của bản thân nên nội tại không thể kích hoạt mãi.
nội tại chỉ kích hoạt lên những kẻ char này gây Actual HP Damage, nếu có tấn công như không làm đối phương mất hp thực sự bằng natural Action thì target đó chưa hợp lệ với nội tại.





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

5) Đế Hoài An/ Di Huai'an

không thể không ma hoá


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

9) Hà Tích Hương/ Bellatrix/ He Xixiang
何惜香

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

hắn không nhận khiên thuộc nguồn dưới quy tắc, chỉ nhận khiên từ kit có tag quy tắc, khiên từ nguồn ngoài và khiên từ skill 1 tính độc lập với nhau, mỗi loại cap 100% max hp, ưu tiên tiêu hao khiên từ nguồn ngoài bản thân trước.
Nội tại nerf hơi nặng nên char này sẽ có nhiều aoe để cân bằng.

khi ra sân vì chưa bị ai đánh bằng natural Action nên hắn sẽ ultimate như bình thường vì ra sân luôn đầy rage.

nếu hắn nhận sát thương từ đánh thường nhưng kit kẻ thù có skill cường hoá đánh thường thì tính là hắn nhận đánh thường, nếu nhânk sát thương là ultimate cast lại skill hay đánh thường thì tính là hắn nhận sát thương từ ult và hắn có thể ultimate, nhưng nếu hắn không đầy rage thì fallback về kiểu gây sát thương kẻ địch gây lên hắn, tức ultimate cast skill gây Actual HP damage lên hắn > cast ult nếu đủ rage, không đủ thì cast skill, mà không phải kiểu B đánh A thì A phải đánh lại B, char này vẫn tuân ssi và mô tả cách gây sát thương của skill/đánh thường và ult, nếu char này mỗi phe đều có và chúng có thể đánh lẫn nhau thì vẫn không bị nội tại của đối phương ảnh hưởng, vẫn sài skill/ult/đánh thường theo nội tại của bản thân chúng.

ngẫm lại thì char này rất mạnh, nếu aoe nhiều + thêm sát thương chuẩn từ nội tại nữa thì chẳng phải quá mạnh, tự hạn chế là hợp lý.

skill 1: mỗi natural Action tổng 45% nội tại gây sát thương lên enemy sẽ được chuyển thành hp và khiên với tỉ lệ 1:1/50% của 45% đó, dễ hiểu là mỗi natural Action gây sát thương chuẩn từ nội tại lên target bao nhiêu thì 22,5% tổng sát thương đó sẽ được chuyển thành khiên, 22,5% cũng chuyển thành hp, overheal và khiên vượt 100% max hp bị bỏ qua, mỗi natural Action - cost là 10 ae nên cần nhiều hơn 1 support trong team để duy trì skill này, nếu ae không đủ skill sẽ không kích hoạt tiếp, hp hồi và kiên từ skill này sẽ không mất, khiên không cap time tồn tại. skill dạng bị động, tự kích hoạt không cần natural Action.

char này cần được thiết kế để ngốn ae, hắn dps cao nhưng giấy và ngốn tài nguyên, giấy thì cần team bảo vệ, ngốn tài nguyên làm đồng minh khác tần xuất sài skill thấp hơn, cũng khó bảo vệ hắn hơn.
nerf mạnh tay trước mới buff mạnh tay được.

skill 2: gây aoe toàn sân, mỗi kẻ nhận sát thương = 175% wil và 145% atk + 15% tổng khiên hiện có của nhân vật này, cost 30 ae.
skill tương tác với khiên > nội tại nổ > skill 1 tạo khiên > tăng sát thương skill 2.
hơn nữa vì còn có thể nhận khiên từ nguồn ngoài nên sát thương có thể cao hơn nữa.

skill 3: khi death confrim 1 target có chân ngã = natural Action (nội tại không phải natural Action) 50% khiên hiện có từ mọi nguồn sẽ biến mất và chuyển thành max hp với tỉ lệ 1:1, phần max hp tăng thêm sẽ không tự hồi, 1 natural Action death confrim bao nhiêu target cũng không quan trọng vì skill này chỉ chuyển 1 lần/natural Action, kích hoạt tối đa 10 lần/trận, mỗi lần tự kích hoạt không cần natural Action cần -30 ae.

ultimate: cast 1 lần skill 2 với 0 cost, 2 natural Action tiếp theo skill 1 sẽ được cast không tốn cost.

đánh thường: đứng tại chổ niệm chú gây sát thương = 100% wil/atk lên 1 target.

char này tự action vì nội tại mà không cần leader chọn hắn dùng skill/ult hay đánh thường.

15) Sanguinius
Tên rất mạnh vì bản thân nó gợi Latin sanguis = blood, rồi cái tên đó được gắn với hình tượng thiên thần, cánh, hy sinh và bi kịch của nhân vật.

trong dự án này thiết lập hắn như 1 thiên sứ bị huyết tộc cấp cao cắn và thành huyết tộc là hợp lý, thiên sứ làm người ta liên tưởng đến ánh sáng nhưng huyết tộc lại sợ mặt trời, hắn bị trục xuất khỏi Thánh Vực ( thần quốc của các thiên sứ cấp thần), hắn phải lòng một vị huyết tộc xinh đẹp, nàng phản bội hắn vì bất đắc dĩ, nói chung là một cái máu chó cố sự yêu hận tình cừu, nói vậy chứ hắn dù sao cũng là thần, dù chỉ là nhỏ yếu thần, hắn sẽ không sợ mặt trời bình thường, Thái Dương Thần thì sợ.

nội tại: mỗi khi trên sân có kẻ thù thuộc element light, mỗi kẻ làm hiệu ứng hồi phục của hắn lên đồng minh giảm 10%, (ở mode turn base thì cap là 9), mỗi kẻ cũng làm sát thương hắn gây lên chúng giảm 10%.

khi vào sân mỗi natural Action thành công hắn tự heal hp = 4% max hp của hắn, nếu trên sân kẻ thù có nhiều hơn hoặc = 3 đơn vị có element tag là light thì phần hồi hp này tạm thời vô hiệu hoá, khôi phục khi kẻ thù có 2 kẻ thù thuộc element light trở xuống.

mỗi lần ultimate xong rage max giảm 3.

skill 1: rút hp = 20% max hp của bản thân (không giảm max hp), gây sát thương = 20% đó (chia đều 20% đó ra thành wil và atk) + 180% wil và 140% atk lên 1 target, sau đó phát nổ, gây sát thương lần nữa = 2% max hp của kẻ thù dưới dạng sát thương chuẩn, 25 ae.

skill 2: chỉ có thể kích hoạt khi hp trên hoặc = 40% max hp, rút hp = 10% max hp của bản thân + 10% max hp của mọi đồng minh trừ leader trên sân có hp trên hoặc = 60% max hp của họ, sau đó tổng lượng hp rút được sẽ được chuyển toàn bộ cho leader đồng minh, nếu thừ sẽ được chuyển thành khiên tồn tại tối đa 2 natural Action của nhân vật này, cap time tồn tại của khiên khiên bắt đầu tính khi đến natural Action tiếp theo sau khi dùng skill này, 20 ae. skill này không làm giảm max hp.
khiên từ skill này không thể vượt 100% max hp của leader.

ultimate: rút ra hp = 25% max hp, tạo 1 chi huyết tiễn tấn công leader kẻ thù, gây sát thương = lượng hp rút ra dưới dạng sát thương chuẩn lên leader kẻ thù bất kể vị trí nhân vật này đứng ở đâu, khi huyết tiễn bắt đầu bay hắn cũng cầm quang kiếm lao về phía trước (vfx), chém dọc gây sát thương lên hàng 2/5/8, mỗi kẻ nhận 170% wil và atk của nhân vật này, trong mắt player thấy tự dưng có hắn mất hp, có huyết tiễn bay về leader địch và hắn chém dọc cùng lúc luôn.
nếu ultimate lúc rút hp không đủ 25% thì hắn rút toàn bộ và chỉ chừa lại hp = 2% max hp của mình, toàn bộ hp rút được vẫn gây sát thương tương ứng.

16) Khandira
ranger vì lấy cảm hứng từ Shikhandi trong Mahabharata, lúc đầu tao tính chọn assassin nhưng ranger cũng được.

nội tại: khi bản thân DEATH_CONFIRMED, không vào hàng chờ luân hồi, vẫn tính là bản thân rời sân nhưng vfx của bản thân tại chỗ mờ nhạt, sau 1 natural Action của bản thân, tại chỗ phục sinh với 100% max hp và chỉ số của đời trước, hp đầy = 80%/100% max hp, 50% sát thương gây ra lên kẻ DEATH_CONFIRMED bản thân thành sát thương chuẩn, sau khi nội tại này kích hoạt và hắn DEATH_CONFIRMED lần nữa, vào thẳng luân hồi và bỏ qua cửa sổ chờ luân hồi.
khi kích hoạt nội tại sẽ vào trạng thái "Báo Thù":
đòn đánh thường/skill/ult target kẻ DEATH_CONFIRMED bản thân, nếu DEATH_CONFIRMED kẻ đó thành công thì tuân theo ssi như bình thường.

cái nội tại này làm các kit revive bình thường bất lực vì kit loại này cần revive target trong cửa sổ chờ luân hồi, tức chưa vào luân hồi, dễ hiểu là hồn còn tại thêd chưa đi đầu thai, chứ vào luân hồi thành sinh linh mới rồi sao đầu thai được.
đó là cái giá cho tự revive, target kẻ giết mình và sát thương chuẩn, nội tại không kích hoạt thì char này vẫn chơi được, char này khá hợp để đi đánh boss, đặt nó ở ô 5 cho boss đánh, sau đó nó hồi sinh rồi đặt tanker ô 2 là bảo vệ được.

skill 1: gây sát thương

17) Meleora
Nguồn: Meleager.
Đây là một trong những reference tao thích nhất.
Trong thần thoại Hy Lạp, sinh mạng của Meleager được gắn trực tiếp với một khúc gỗ đang cháy: chừng nào nó chưa cháy hết thì ông còn sống. Mẹ ông lấy khúc gỗ ra khỏi lửa và cất đi.

nội tại: vào sân sẽ có 1 khúc gỗ cũng vào sân, khúc gỗ có hp bar, mỗi natural Action của nhân vật này khúc gỗ mất 10% hp của bản thân nó, sát thương nó nhận vào tối đa là 20% max hp của bản thân khúc gỗ, khúc gỗ không có chân ngã, vfx là nó luôn cháy hừng hực, cap heal lên khúc gỗ mỗi lần nó nhận heal từ natural Action của đồng minh là 30% max hp của khúc gỗ, khúc gỗ không nhận heal ngoài natural Action của đồng minh (nhiều khi kit của kẻ thù cũng có heal nữa nên cần miêu tả rõ). nhân vật này không thể DEATH_CONFIRMED trừ phi khúc gỗ hp về 0, hắn sẽ luôn còn tối thiểu 1 hp, buff execute của kẻ thù vẫn kích hoạt như hắn sẽ fatal, không DEATH_CONFIRMED, khúc gỗ không nhận buff hay debuff, mọi debuff và buff sẽ bỏ qua nó.

18) Vidara
Nguồn: Víðarr.
Một vị thần Bắc Âu cực ít lời nhưng có một mục tiêu duy nhất: trả thù cho Odin. Trong Ragnarök, Fenrir nuốt Odin và Víðarr xuất hiện để giết Fenrir; biểu tượng đặc biệt của ông là chiếc giày được chuẩn bị từ những mảnh da tích lũy qua thời gian.

nội tại: mỗi turn boundary không nhận bất kỳ sát thương từ natural Action của kẻ thù thì rage max giảm 3, tăng hp = 3% max hp của hiện tại, đồng thời heal bằng phần tăng đó, atk và wil cũng tăng = 4% của hiện tại, rage + 5, thật ra điều kiện kích hoạt cũng rất khó nên mỗi lần kích hoạt được nên buff mạnh 1 chút, gặp mấy con aoe coi như phế cái nội tại nên kit của hắn sẽ ưu tiên mage 1 chút.

hắn vẫn sẽ mạnh nhưng tròn 1 trận đấu max rage = 0 và ultimate liên tục là không thể nào.

19) Ariadne Velora
Raw kit, bản canon ở docs/canon kit/Ariadne_Velora_Clarified_Gameplay_Canon.md.
bản raw kit này vẫn có giá trị, giá trị ở chênh lệch giữa raw và canon.

nội tại: khi ra sân sẽ đánh dấu vị trí nàng đứng trong 3 natural Action, bộ đếm bắt đầu đếm ở natural Action tiếp sau sau khi đánh dấu, sau 3 natural Action đó đánh dấu vị trí sẽ biến mất và đánh dấu lần nữa ở vị trí nàng đang đứng và bắt đầu di chuyển, trước natural Action tiếp theo sẽ lùi lại 1 bước sau đó mới bắt đầu natural Action, nếu không thể lùi thì sang phải hoặc trái, nếu đều không thể thì dịch chuyển đến vị trí ngẫu nhiên còn trống trên sân đồng minh, nếu đầy sân thì đứng tại chỗ và không đi đâu, nàng chỉ có thể di chuyển khi đã đánh dấu và đứng trên vị trí đã đánh dấu, mode chess/monopoly/turn base đều có ô, hiện tập trung vào turn base.
kỳ vọng là nàng ra sân, đánh dấu ngay, trước natural Action tiếp theo thì di chuyển sau đó thực thi natural Action rồi đứng im đó vì nàng không thể đổi vị trí bằng nội tại được vì nàng không đứng trên ô đánh dấu, khi đánh dấu ở vị trí cũ mất, nàng đánh dấu ngay ở ô hiện tại và lại di chuyển ngay trước natural Action tiếp theo. có lẽ cap time tồn tại đánh dấu 3 natural Action turn là hơi dài, sẽ thay đổi sau test, nếu nàng là leader khi bị đưa vào đấu thú trường thì nàng vẫn có thể đánh dấu và di chuyển.

skill 1: mỗi khi di chuyển vị trí (bằng nội tại hoặc kit khác, có thể là không gian chi chủ của kẻ thù), heal cho leader = 100% wil/atk + 10% max hp của bản thân, overheal nếu có sẽ được chuyển toàn bộ thành khiên cho nàng, mỗi lần tự kích hoạt không tốn natural Action sẽ -15 ae.

skill 2: mỗi khi đồng minh (chỉ đồng minh, ví dụ như ultimate của nàng, bản thân nàg đổi vị trí cũng không tính, ví dụ như nội tại) đổi vị trí (nhờ bản thân nàng hoặc kit của đồng minh lẫn kẻ thù) thì nhân vật này được tăng 5% max hp tính theo lúc kích hoạt, mỗi turn boundary kích hoạt tối đa 5 lần, nếu đồng minh bị đổi vị trí hơn 1 char trong 1 lần thì vẫn chỉ tăng 5% max hp, mỗi lần tự kích hoạt -10 ae.

khá hợp nếu phe địch có không gian chi chủ, hắn dùng skill sẽ thay đổi vị trí đồng minh của nàng và nàng sẽ hưởng lợi từ skill 2, đây cũng coi là khắc chế.

skill 3: gây sát thương aoe ngẫu nhiên lên 3 mục tiêu kẻ thù trên sân, mỗi kẻ nhận 150% wil/atk của nàng, skill này tất trúng, nếu target có kit kiểu đổi vị trí khi dính sát thương thì vẫn trúng, 20 ae.

ultimate: chuyển 1 đồng minh vào vị trí đã đánh dấu bằng nội tại, thứ tự ưu tiên là trái> phải > trước> sau, không thể target leader, nếu chỉ có thể chọn leader thì nàng sẽ không chuyển, chuyển sang gây sát thương lên 2 kẻ địch ngẫu nhiên, mỗi kẻ nhận 195% wil và atk.
nếu nàng ra sân thì quy trình là: đánh dấu > di chuyển > dùng ultimate (vì ra sân sẽ tự đầy rage và dùng ult), quá trình này sẽ rất nhanh, nhân vật này ra sân đầu tiên sẽ phế, đầy sân cũng phế cái nội tại.
ví dụ nàng ra sân ở ô 2, ô 5 không ai, nàng lùi sang ô 5 và ultimate, nàng chuyển vị trí của đồng minh theo thứ tự ultimate đã mô tả, nếu ra sân đầu tiên thì chỉ có nàng và leader đứng sau lưng nàng ở ô 8 nên nàng sẽ gây sát thương theo mô tả của ult, nếu lúc đó ô 4/6 đều có người thì nàng sẽ chuyển char ở ô 4 sang ô đã đánh dấu là ô 2 vì tuân theo mô tả ult.
vấn đề là khi chuyển 1 char đồng minh sang ô đánh dấu thì đánh dấu có mất không? cap 3 natural Action quá dài, tao nghĩ giảm là hợp lý, cap vẫn là 3, nhưng khi có 1 đồng minh không phải nàng đứng trên ô đã đánh dấu (không quan trọng họ đứng đó có phải do nàng hay không) thì cap sẽ giảm 1, thực tế là nàng ultimate xong nếu không ai đứng ô đánh dấu thì đến cuối natural Action tiếp theo của nàng cap time của đánh dấu mới giảm 1, nếu có đồng minh đứng lên đánh dấu thì giảm là 2, vậy đi cho dễ hiểu.

19) Orphea Bellurne
Nguồn: Orpheus.
Không dùng Eurydice.
Signature
Music can alter the dead, but only under a condition.
Character có thể “kéo” một đồng minh đã chết về.

nội tại: khi đồng minh được hồi sinh bằng kit của nhân vật này xuất hiện ở ô trước mặt hắn, hắn và đồng minh đó mỗi natural Action của bản thân đều sẽ mất vĩnh viễn (trong trận) 20% max hp, khi max hp = 0, lập tức vào luân hồi, bỏ qua cửa sổ chờ luân hồi.
trước mặt: hắn đứng ô 1/2/3, an toàn, trước mặt là 3 ô trung lập và 9 ô của kẻ thù.
đứng ô 4/5/6: ô 1/2/3 là trước mặt.
ô 7/8/8 thì ô 1 đến 6 là trước mặt.


20) Tithonus
một sinh vật tham lam tôn thờ tà thần, hắn muốn bất tử và hắn nhận được.
hắn lên kế hoạch hiến tế cả toà thành trì, triệu hồi hắn Chủ.
"ta muốn bất tử thưa Đấng vĩ đại!" hắn cuồng nhiệt nói.
"như ngươi muốn, tín đồ trung thành của ta".

nội tại: mỗi natural Action, max hp giảm 5%, không reset khi hồi sinh, khi max hp về 0, vào luân hồi, bỏ qua hàng chờ.
mỗi natural Action cũng đồng thời hồi hp = 5% max hp, hp max giảm trước hồi sau.

skill 1: khi hp dưới hoặc = 15% max hp, chuyển đổi thành Huyết tộc, nội tại giảm max hp biến mất, sát thương gây ra từ đánh thường và skill tăng 10%, cũng hồi hp = 35% tổng sát thương mỗi natural Action skill và đánh thường gây ra, 35 ae, kích hoạt mỗi trận 1 lần, skill này chỉ có thể kích hoạt khi đáp ứng điều kiện hp và Tithonus cần tồn tại trên sân tối thiểu 3 turn boundary của hắn, skill cần tốn 1 natural Action để kích hoạt. sau khi chuyển đổi tăng max hp = (max hp hiện có + hp hiện có)/2.
natural Action > +1 turn boundary> natural Action > + 1 turn boundary, lặp lại cho đến khi đạt 3 turn boundary và hp hắn cần dưới hoặc = 15% max hp.

"hắn lừa ta, đã vậy thì tín ngưỡng 1 cái khác thần chính là, không có vấn đề" Tithonus một mặt âm trầm nói.

ultimate:

21) Kairos

nội tại: khi leader địch có hp dưới hoặc = 50% của hắn, Kairos chuyển target đánh thường/skill/ult sang leader địch, nếu leader địch có hp hơn hoặc = 51% thì Kairos vẫn theo ssi như bình thường.


22) Lethe

Tên của một con sông và khái niệm lãng quên trong Hades.

là hoá hình của dòng sông ký ức, có quan hệ không rõ với ký ức chi chủ, có lẽ Lethe liền là ký ức chi chủ?

Lethe là một phân thân, nước cờ của ký ức chi chủ, trong lore thì không ai biết cả.

23) Neria

hàng chờ luân hồi là nơi chuẩn bị đầu thai, các chân ngã sẽ được cho uống nước của Lethe nhằm gội rửa ký ức, Neria đã té vào sông, nàng lại không uống ngụm nào, bằng cách nào đó nàng vẫn tỉnh táo và trở lại hiện thế.

24) Nerissa

skill 1: nàng cast 1 skill gây damage của đồng minh, nàng lấy mô tả skill của đồng minh để gây sát thương nhưng nguồn sát thương là nàng, các skill kiểu gây sát thương có 50% là chuẩn, kèm debuff này kia thì phần sát thương chuẩn nàng hưởng nhưng debuff/buff/mark, heal cho ally/bản thân hay leader đều không hưởng, cost biến động theo mô tả của kit lấy được, cost cũng giữ nguyên, pool là động, chỉ cast skill đủ điều kiện để cast.

25) Vermillion

nội tại: mỗi turn boundary mất hp = 3% max hp, nhận 1 stack "hoả tước", khi dùng skill và ultimate hoả tước bị tiêu hao, mỗi stack bị tiêu hao skill/ult gây ra sát thương có 10% là sát thương chuẩn, mỗi stack tiêu hao cũng tăng vĩnh viễn (trong trận, không reset khi được revive) 3% wil và 3% atk bản thân hiện có ở lúc tiêu hao stack, không giới hạn chỉ số nhận được từ nội tại, nếu hp dưới hoặc = 15% trong turn boundary thì không nhận stack hoả tước.
ví dụ nếu có 2 stack > sài skill 1 > gây sát thương = 120% wil/atk và 30% wil/atk là sát thương chuẩn.

skill 1: chưởng ra 3 hoả cầu gây sát thương lên 3 target ngẫu nhiên, mỗi target nhận sát thương = 150% wil và 150% atk, 20 ae.

skill 2: nếu Vermillion có hp hơn hoặc = 80% max hp, lượng stack nhận ở turn boundary từ nội tại tăng gấp đôi, tự kích hoạt khi đạt điều kiện, mỗi turn boundary tiêu hao 7 ae.

skill 3: đứng tại chỗ triệu hồi 1 chu tước hư ảnh sau lưng (vfx), Vermillion phun lửa gây sát thương ô 1/4/7, 2/5/8 hoặc 3/6/9 tuy vị trí đứng, theo ssi, kẻ đầu tiên nhận sát thương = 160% wil/atk của Vermillion, nhận debuff "thiêu đốt" trong 2 natural Action của kẻ đó, kẻ sau lưng kẻ nhận sát thương đầu tiên nhận sát thương = 125% wil/atk của Vermillion và nhận 1 debuff thiêu đốt, kẻ cuối cùng nhận sát thương = 50% wil/atk của Vermillion, không nhận debuff thiêu đốt.
nếu gây sát thương được 3 ô mà chỉ có 2 kẻ trúng thì kẻ đầu nhận 160%, kẻ sau nhận 125%, không có kẻ thứ 3, dễ hiểu thôi, với mỗi kẻ nhận sát thương từ skill này cost -12 ae.
tình huống có 1 hoặc 2 kẻ thù là lời cost nhất, stack nội tại là buff cả skill trong 1 natural Action chứ không phải buff đơn lẻ trên mỗi lần gây sát thương, nên kẻ nhận sát thương đầu tiên, thứ 2 lẫn 3 đều sẽ nhận sát thương chuẩn tương ứng stack "hoả tước" tiêu hao, skill 1 cũng thế.
debuff thiêu đốt của Vermillion: cấp pháp tắc, mỗi natural Action của kẻ dính debuff này nhận sát thương chuẩn = 3% max hp của chúng, hiệu ứng xoá debuff dưới cấp pháp tắc không thể xoá debuff này, hiệu ứng xoá cấp pháp tắc cần phán định.
kỳ thực tao muốn game chỉ có 1 vài tag dot, độc/cháy máu/cháy hay thiêu đốt bản chất đều là dot, chỉ khác ở mặt hiển thị thôi.

ultimate: cast skill 3 không tốn cost, lần này chu tước hư ảnh cũng phun lửa, sát thương của skill 3 cast bởi ultimate này hiệu ứng chuyển sát thương chuẩn của hoả tước từ nội tại tăng từ 10% lên 20%/stack, hệ số sát thương tăng từ 160%/125%/50% lên 200%/145%/60%, vậy nếu có 3 kẻ địch đều trúng, chúng nhận 200% atk/wil cùng 20% sát thương chuẩn mỗi stack hoả tước tiêu hao, tạm bỏ qua phần kẻ trúng thứ 2 và 3 cho dễ ví dụ, hệ số gây sát thương vẫn là 200% nha, không phải nhận sát thương là 200% wil và 200% atk của nhân vật này rồi nhận thêm 1 đợt sát thương chuẩn mà là mix sát thương wil/atk lẫn sát thương chuẩn, nếu tiêu hao 1 stack hoả tước khi dùng ult cast skill 3 thì kẻ đầu tiên dính nhận 160% wil + 160% atk (không sát thương chuẩn) + 40% wil và 40% atk của Vermillion dưới dạng sát thương chuẩn
vậy hệ số sát thương là 200% nhưng 20% của 200% đó là 40% wil và atk bỏ qua res và arm thôi vì là sát thương chuẩn.

26) Pygmalion

nội tại: khi ra sân tạo 1 con rối, nó có rank bằng rank của nhân vật này, rage max là 100, rage = 0, mọi chỉ số được rank multi scale sẽ = 80% của nhân vật này, mọi chỉ số không được rank multi scale sẽ = 0, tu vi của con rối cũng = nhân vật này, con rối sẽ hành động theo ssi và chỉ đánh thường, ultimate cũng sẽ tiêu hao rage nhưng nó chỉ đánh thường mà không tăng bất kỳ sát thương nào.
đánh thường của con rối: gây sát thương= 100% wil/atk của bản thân tức = 80% của Pygmalion.

khi một chân ngã rời hàng chờ và vào luân hồi, chân ngã đó đầu thai vào con rối của Pygmalion, chân ngã không phân phe địch ta, con rối sẽ có kit của một nhân vật ngẫu nhiên có rank = rank của con rối trong roster, lúc đó nó hoàn toàn có kit của nhân vật đó, không thể đầu thai thành nhân vật đã có trong trận đấu (deck lẫn trên sân và chân ngã đang ở hàng chờ luân hồi), nhưng có thể đầu thai thành 1 nhân vật đã vào luân hồi trong sân nhưng không thể đầu thai thành đời trước của bản thân, tóm lại chỉ là thay đổi kit khi có chân ngã đầu thai vào, không có tăng chỉ số, ngoại hình con rối giữ nguyên, hành động khi dùng skill/ult/đánh thường/nội tại tuân theo hành động mà nhân vật nó có kit sẽ làm khi dùng skill/đánh thường/ultimate/kích hoạt nội tại nếu có, hiệu ứng và giọng nói cũng thế, chỉ có không đổi ngoại hình thôi.
đầu thai vào con rối > ra kit random (pool có hạn chế) > thừa hưởng toàn bộ kit/voice/animation, hiệu ứng khi action, chỉ là ngoại hình không thay đổi và chỉ số theo Pygmalion, hơn nữa chỉ số của con rối đầu tiên snapshot theo Pygmalion lúc đầu trận, nêú chỉ số của Pygmalion biến động thì chỉ số của con rối cũng sẽ không thay đổi theo, con rối không bị ảnh hưởng bởi DEATH_CONFIRMED của Pygmalion bất kể con rối có được chân ngã đầu thai vào hay không.
nếu con rối DEATH_CONFIRMED mà không có chân ngã: biến mất, Pygmalion không thể tạo con rối khác trừ phi bước vào chu kỳ sống mới qua revive, nếu con rối đã có chân ngã thì con rối biến mất, chân ngã vào hàng chờ luân hồi như bình thường và có thể đầu thai vào con rối lần nữa nếu không bị luân hồi chi chủ ảnh hưởng, Pygmalion vẫn cần bắt đầu 1 chu kỳ sống khác để tạo con rối.
con rối nếu đã có chân ngã thì được revive nêú chân ngã của con rối đó đang ở hàng chờ.
kit của con rối có chân ngã có thể tự revive bản thân vì con rối đã thừa hưởng toàn bộ kit nhưng con rối vẫn giữ chỉ số của con rối tức lúc snapshot lúc Pygmalion tạo ra con rối đó trừ phi kit của con rối có scale hay mô tả chỉ số sẽ không bị reset sau revive.u

nếu Pygmalion chết và được revive thì hắn có thể tạo con rối lần nữa chỉ khi con rối cũ đã có chân ngã đầu thai vào, nếu hắn revive và con rối chưa được chân ngã đầu thai vào thì hắn không tạo con rối mới, sau đó nếu có chân ngã đầu thai vào con rối thì hắn sẽ tạo 1 con rối mới với mô tả như nội tại như snapshot chỉ số hiện tại của Pygmalion lúc tạo con rối.
nếu trên sân có 2 Pygmalion thì quá trình đầu thai chân ngã thuộc phe nào sẽ đầu thai vào con rối của phe đó.
chân ngã không thể đầu thai vào con rối khi hoá thân của luân hồi chi chủ có mặt trên sân bất kể Pygmalion và hoá thân luân hồi chi chủ có là đồng minh hay không, chỉ khi luân hồi DEATH_CONFIRMED thì chân ngã mới có thể đầu thai vào con rối của Pygmalion.

Puppet trước khi có Chân Ngã vẫn có Character Definition tối thiểu riêng của Puppet.
Nó không nên được xem là “không có kit”.

hắn chỉ có thể tạo 1 con rối mỗi 1 chu kỳ sống, tức hắn vào sân > tạo rối > rối có chân ngã đầu thai vào > hắn không thể tạo con rối mới cho đến khi DEATH_CONFIRMED và được revive > hắn được revive > có thể tạo 1 con rối mới > hắn tạo rối > rối chưa có chân ngã nhưng hắn DEATH_CONFIRMED > hắn chết và revive > không thể tạo rối mới vì rối cũ chưa có ai đầu thai vào > tạo 1 con rối mới khi rối cũ đã có chân ngã vào > hắn không thể tạo rối mới trừ phi hắn chết và được revive lần nữa.
skill 1: cửa sổ chờ luân hồi giảm 1, cost là --hp = 50% max hp và 25 ae, cửa sổ chờ luân hồi luôn phải hơn hoặc = 1, nếu cửa sổ chờ luân hồi là 1 thì không thể dùng skill này.
một chân ngã vào luân hồi mà không có kit can thiệp như char này hay luân hồi chi chủ hay kit liên quan đến đầu thai thì chân ngã đó đã biến mất khỏi trận đấu.

Phải:
check waitingWindow > 1
→ check cost
→ pay
→ waitingWindow -1
Không:
pay HP/AE
→ phát hiện window =1
→ không cast
→ mất tài nguyên.

cost làm Pygmalion chết nhanh hơn, mỗi lần chết làm con rối hắn có thể chế tạo tăng, skill này là con dao 2 lưỡi, hàng chờ giảm xuống làm hắn có thể vào luân hồi luôn mà không kịp được revive, lúc này hắn có thể bị nội tại của Pygmalion kẻ địch bắt đầu thai vào con rối của kẻ địch.

ultimate: Pygmalion và mọi con rối của mình cùng nhau thực thi 1 đánh thường (tuân theo mô tả đánh thường của con rối, thường miêu tả đều là 100% wil và 100% atk của bản thân chúng tức bằng 80% của Pygmalion dù có kế thừa kit do chân ngã đầu thai vào nên cũng không quá quan trọng, nhưng nếu đánh thường thuộc kit có hiệu ứng gì thì cũng sẽ được giữ nguyên). các con rối đánh thường không tính là 1 natural Action, sát thương là con rối gây ra nhưng nguồn damage tính là Pygmalion, sát thương từ các con rối tính là follow up đánh thường của Pygmalion nên con rối không mất natural Action.

Snapshot danh sách Puppet hợp lệ ngay khi Ultimate bắt đầu.
Sau đó:
tất cả Puppet snapshot được yêu cầu thực hiện Follow-up.
Nếu A chết trước khi đến lượt resolve:
A không đánh.
Không chuyển slot/attack cho Puppet khác.
Puppet inherited Basic Attack
Đây là chỗ rất nguy hiểm.
Mày nói:
“nếu đánh thường thuộc kit có hiệu ứng gì thì cũng sẽ được giữ nguyên.”
Ví dụ Character B có:
Basic Attack → Bleed.
Puppet inherit B:
Basic Attack → Bleed.
Khi Pygmalion Ultimate:
Puppet → Basic Attack Follow-up.
Vậy:
có áp Bleed không?
Tao nghĩ có, vì mày nói giữ nguyên behavior của Character Definition.
Nhưng:
Effect đó được attribution cho Puppet hay Pygmalion?
Tao đề xuất:
Behavior Source
Puppet inherited kit
Damage Attribution
Pygmalion
Effect Source
Pygmalion Ultimate → Puppet Follow-up
Đây là một hệ attribution ba tầng cực kỳ hữu ích.

Nếu behavior thực sự là modify countdown:
REINCARNATION + RESOURCE_MODIFIER hoặc một state/counter primitive.
Không cần Tag mới kiểu:
WAITING_WINDOW_REDUCTION.
Đó là parameter của Reincarnation lifecycle.

nếu có nhiều con rối thì cũng mạnh đó, có char có đánh thường là aoe nữa, nếu đầu game thì rất là phế luôn. Một char cực độ phức tạp.

đây là kit phức tạp nhất tính đến 21h30p ngày 6 tháng 9 2026.

“Một Puppet mỗi chu kỳ sống”
State:
PuppetQuotaAvailable
Khi Pygmalion vào sân:
nếu đủ điều kiện → create Puppet.
Sau đó:
quota consumed.
Puppet được Chân Ngã nhập:
quota được mở?
không trong cùng life cycle.
Chỉ khi:
Pygmalion DEATH_CONFIRMED → Revive
mới có một lifecycle mới.
Nhưng có ngoại lệ mày đã chốt:
nếu Puppet cũ chưa có Chân Ngã → dù Pygmalion revive cũng không spawn Puppet mới.
Sau khi Puppet cũ nhận Chân Ngã:
tạo Puppet mới nếu Pygmalion đang trong một life cycle mới đủ điều kiện.
Nhưng cần một state rõ ràng
Đừng dùng:
hasPuppet
một boolean.
Cần ít nhất:
PuppetLifecycleState:
- NONE
- ACTIVE_EMPTY
- ACTIVE_INHABITED
- DEAD_EMPTY
- DEAD_INHABITED
và:
LifeCyclePuppetQuota:
- UNUSED
- CONSUMED
Nếu không, Codex rất dễ làm lỗi những chuỗi như:
Pygmalion dies
→ revive
→ puppet empty
→ no new puppet

puppet inhabited
→ new lifecycle allowed
Mỗi Life Cycle của Pygmalion tạo ra đúng 1 Puppet mới. Puppet của các Life Cycle trước tiếp tục tồn tại độc lập cho tới khi bị loại khỏi chiến trường.
mỗi rối có chân ngã đều là 1 actor độc lập.

đây là 1 char khiến tao phải tạo vô số Ur đơn giản để pool của con rối đỡ ra các char có kit phức tạp trong trận.

27) Galatea
Nguồn: tên thường dùng cho pho tượng của Pygmalion trong truyền thống hậu kỳ.
Từ khóa:
được tạo ra · không có quá khứ · thức tỉnh · người sáng tạo · quyền được sống · identity

một kit khi hắn tử vong sẽ không vào hàng chờ, không vào luân hồi mà chân ngã tại chổ đoạt xá summon của đồng minh là ổn, hắn sẽ tương tác với Pygmalion.
hắn có thể đoạt xá mọi summon dưới rank prime.

29) Cairn
Từ cairn: một đống đá dùng làm dấu mốc, mộ hoặc chỉ đường.
Từ khóa:
dấu đường · người đã chết · mộ · ký ức · đường về · những viên đá được xếp lại

nội tại: mỗi 3 natural Action đan xen 2 turn boundary, đặt 1 "hòn đá" ngẫu nhiên trên sân đồng minh, hòn đá là 1 mark, khi có đồng minh có chân ngã đứng trên hòn đá đó, họ nhận mark "hòn đá" của Cairn, nói dễ hiểu là họ nhặt đá.
summon không có chân ngã không thể nhặt đá, con rối của Pygmalion nếu có chân ngã thì nhặt được.
ví dụ: Cairn ra sân đặt đá trước và ultimate vì đầy rage (1 natural Action) > hắn vào turn boundary, đợi natural Action (1 turn boundary) > thực thi natural Action > vào turn boundary > đến đầu natural Action tiếp theo của hắn thì hắn sẽ đặt đá trước rồi mới thực thi natural Action (nếu không bị cc, 1 natural Action), đấy là 1 chu kỳ, sau đó hắn cần vào turn boundary và đến natural Action tiếp theo nữa mới bước vào chu kỳ đặt đá, hắn cứ đặt đá như thế mãi cho đến khi rời sân.

tác dụng: đồng minh nhặt đá time tối thiểu 1 turn boundary + 1 natural Action của Cairn DEATH_CONFIRMED và vào hàng chờ luân hồi (là 4 nếu không bị can thiệp), Cairn thực thi 1 natural Action xong và vào turn boundary sau khi đồng minh đó DEATH_CONFIRMED > đồng minh hồi sinh với chỉ số và class, kit như trước khi DEATH_CONFIRMED, rage là 0, hp là 50%/100% max hp của họ.
nếu đồng minh cầm đá nhưng DEATH_CONFIRMED trước khi đạt time tối thiểu, họ sẽ không được hồi sinh bởi nội tại của Cairn, mark hòn đá sẽ biến mất, nhưng họ vẫn có thể hồi sinh bởi kit khác nếu có, có những char khi DEATH_CONFIRMED vào thẳng luân hồi mà không vào hàng chờ luôn, nếu họ nhặt đá thì DEATH_CONFIRMED họ không được revive vì nội tại này chỉ revive những kẻ trong hàng chờ, kẻ đã vào luân hồi không thể revive.

30) Hotaru

nội tại: khi vào trận cost của nàng trên deck giảm 5.

31) Phenex

nội tại: khi DEATH_CONFIRMED, không vào hàng chờ luân hồi hay luân hồi, tại chổ phục sinh với 100% chỉ số lúc vào sân, nếu có kit từ nguồn ngoài làm tăng hay giảm chỉ số của nàng thì đều không ảnh hưởng, kích hoạt 1 lần/trận đấu.

32) Pasithea
Nguồn: Hy Lạp, một trong các Charites; tên thường gắn với thư thái/thư giãn và giấc ngủ.
Từ khóa:
ngủ · mộng · thư giãn · trạng thái tinh thần · đẹp nhưng xa cách · thời gian ngừng lại.

33) Stheno
Nguồn: một trong ba Gorgon.
Từ khóa:
Gorgon · bất tử · chị cả · giận dữ · bảo vệ gia đình · quái vật bị con người nhìn nhận sai
Điểm hay: rất nhiều người chỉ biết Medusa, nên nhân vật này có khoảng trống lớn để reinterpret


34) Asteropae
Nguồn gợi từ các Pleiades/stellar mythology.
Từ khóa:
ngôi sao · bầu trời · định hướng · chị em · trốn chạy · hóa thành sao
Tên hơi exotic, phù hợp một nhân vật celestial.




36) Savitri, nữ.

ultimate: mất hp = 25% max hp, revive 1 đồng minh, nếu ultimate khi còn dưới 25% mx hp, fatal còn 1hp.

37) Damayanti
Nguồn Mahabharata.
Từ khóa:
nữ hoàng · lựa chọn người yêu · lưu lạc · tách khỏi người mình yêu · nhận dạng · đoàn tụ
Không ép kit, lore-space rất rộng.



38) Khonsu
Thần mặt trăng trong Ai Cập cổ.
Từ khóa:
mặt trăng · đêm · thời gian · lang thang · chữa bệnh · chu kỳ
Tên có cảm giác rất “boss/support deity”.


39) Obatala
Tên mang nghĩa gần “king of white cloth”, gắn với việc tạo ra đất và con người trong truyền thống Yoruba.
Behind the Name
Từ khóa:
tạo người · đất · vải trắng · sự hoàn hảo · sáng tạo · người phán xét
Tên này rất hợp một nhân vật creator, nhưng không đụng trực tiếp concept Galatea/Pygmalion nếu mày đi hướng “creator of society” thay vì “maker of a person”.


40) Taotie




41) 

nội tại: char này không có chân ngã, hắn chỉ là một robot do AI điều khiển, hắn không vào luân hồi, không vào hàng chờ luân hồi, trạng thái cuối cùng của hắn là DEATH_CONFIRMED.
hắn không thể revive từ mọi kit ngoài bản thân vì revive là kéo đồng minh từ hàng chờ luân hồi về hiện thế.
Quy tắc: mọi kit heal ngoài bản thân kit của hắn đều không có tác dụng lên hắn trừ kit heal của char thuộc rank Prime, hắn không phải là sinh mệnh.

skill 1: tự kích hoạt khi DEATH_CONFIRMED, sau 1 natural Action của hắn, một cột sáng từ trên trời giáng xuống, tàu mẹ gửi cho hắn cơ thể mới, hắn revive tại chỗ với trạng thái mới ra sân ở lần ra sân gần nhất, kích hoạt 3 lần/trận, sau khi revive bởi skill này, trong 3 natural Action và 2 turn boundary tiếp theo hắn không thể nhận rage từ action hay từ nhận sát thương, cost 15 ae.
nếu không đủ cost, hắn sẽ đợi thêm 1 natural Action của bản thân nữa rồi revive nếu cost đủ, nếu vẫn không đủ, hắn biến mất khỏi trận đấu.

mỗi vòng đời của hắn từ ra sân đến DEATH_CONFIRMED hắn đều sẽ thu thập thông tin chiến trường, gửi về tàu mẹ.
tổng sát thương nhận trong vòng đời: sát thương chuẩn chiếm tỉ lệ Actual HP damage lên bản thân cao nhất: cơ thể tiếp theo từ skill 1 tăng 25% max hp trên cơ sở max hp đã có của lần tử vong kích hoạt skill 1 gần nhất.

sát thương wil chiếm tỉ lệ Actual HP damage lên bản thân cao nhất: cơ thể tiếp theo từ skill 1 tăng 30% res trên cơ sở res đã có của lần tử vong kích hoạt skill 1 gần nhất.
ví dụ: đời 1 có 100 res > chết, đời 2 có 130 res > chết, đời 3 có 30% của 130 res, cứ thế mà tăng, tăng arm cũng logic tương tự, ở đời 2 là kích hoạt skill 1 lần đầu.

ở lần kích hoạt đầu tiên thì bonus này cũng tăng 5% giảm aoe chọn target ngẫu nhiên lẫn aoe gây damage lên ô cố định, đời tiếp theo + thêm 5%, tiếp theo +5%, skill 1 kích hoạt 3 lần nên tổng 15% nếu 3 lần kích hoạt đều dính dòng này.

sát thương atk chiếm tỉ lệ Actual HP damage lên bản thân cao nhất: cơ thể tiếp theo từ skill 1 tăng 30% arm trên cơ sở arm đã có của lần tử vong kích hoạt skill 1 gần nhất.
logic như dòng wil nhưng giảm là 5% mọi sát thương đơn, tức natural Action có target = 1.
giảm aoe từ dòng atk và wil đều chỉ tính sát thương từ natural Action, không tính dot, không tính follow up luôn nên con rối của Pygmalion và hắn có thể bỏ qua bonus vì ult của Pygmalion là khiến con rối đánh thường nhưng nguồn sát thương của con rối tính là follow up của Pygmalion.

tao muốn loại scale này cơ thể tiếp theo sẽ kế thừa.

skill 2: gây sát thương đơn = 155% wil/atk lên 1 target, đồng thời cũng gây sát thương chuẩn = 1% max hp của target, tác dụng với boss không giảm, 20 ae.

skill 3: tự sửa chữa, khi kích hoạt tự hồi hp cho bản thân ngay lập tức khi đủ điều kiện, skill này không cd, có thể kích hoạt khi ở natural Action lẫn turn boundary, 1 ae/1,5% max hp heal, tối đa tiêu hao 30 ae mỗi lần dùng skill này, hồi bao nhiêu hp thì trừ bấy nhiêu ae, 30 ae không phải lsf cost cứng, skill tự kích hoạt không tốn natural Action khi hp dưới 35% max hp.
đây là một skill khá đốt ae nếu hắn cứ hp thấp mãi.

ultimate: liên lạc với tàu mẹ, một tia death ray bắn từ trên trời xuống gây sát thương = 175% wil và atk của char này lên mỗi target trúng đòn, đây là aoe nhưng không tính là aoe ngẫu nhiên nên kit kiểu di chuyển vị trí khi dính sát thương aoe sẽ không có tác dụng, kit kiểu dính sát thương đơn di chuyển vị trí cũng không kích hoạt khi dính skill này vì đây là aoe cố định toàn sân, chạy đi đâi cũng dính nên không kích hoạt luôn để đỡ tốn tài nguyên, mọi target có rank dưới hoặc = rank nhân vật này nhận thêm follow up ult, sát thương = 10% max hp của char này lúc ultimate dưới dạng sát thương chuẩn.

đánh thường: bắn tia laze gây sát thương = 100% wil và atk của bản thân lên 1 target, mỗi lần đánh thường đều có 20% tỉ lệ tăng tỉ lệ sát thương lên 20%, tức từ 100% lên 120% wil và 120% atk.

một char có khả năng sống tốt, chỉ số tăng theo tình huống chiến trường, khả năng hồi phục mạnh, sát thương ổn và có aoe, đồng dạng hạn chế cũng không ít vì bản chất của bản thân, chưa xác định tên và giới tính, có thể hắn sẽ không có giới tính, bề ngoài là nam hay nữ có da sinh học hoặc 1 robot sắt thép là điều cần thảo luận, nó liên quan đến doanh thu, bề ngoài sắt thép mạnh mẽ sẽ được lòng bộ phận player nam, bề ngoài gợi cảm như cặp sinh đôi như atomic heart hay lucy trong reverse 1999 cũng đồng dạng được lòng player nam, nhưng player nữ có xu hướng đốt tiền cho husbando, skin có bề ngoài của 3 loại sẽ tốt hơn, ví dụ mặc định ở bề ngoài sắt thép như lockdown trong transformer, 1 skin nam có da sinh học, trông mạnh mẽ phong trần cho player nữ, 1 skin có da sinh học và vòng 1 lẫn 3 to dành cho player nam.
quan trọng là giọng, giọng của hắn bất kể skin nào đều sẽ là máy móc, da sinh học đẹp nhưng giọng máy móc sẽ là signature của hắn, chênh lệch nghe nhìn có lẽ sẽ là cách marketing tốt.

42) 

nội tại: mỗi natural Action, tự heal 8% max hp đổi lại mọi heal cấp quy tắc trở xuống hắn nhận được từ đồng minh class support sẽ giảm 65%, heal cấp quy tắc không bị ảnh hưởng, 

43) 

Nội tại: sát thương nhận từ natural Action của kẻ thù class assassin 100% là sát thương chuẩn (không tính dot, mark hay sát thương từ nội tại của kit assassin nhưng nếu kit là nội tại cường hoá đánh thường thì vẫn tính,..), đổi lại vào trận (vào trận khác vào sân) cost trong deck giảm 5 (nếu về deck hơn 1 lần thì cost vẫn sẽ giảm 5 so với cost gốc, không cộng dồn), mỗi lần ra sân nhận khiên bằng 25% max hp tồn tại trong 3 natural Action của bản thân, khi khiên mất vì vỡ hay đến giới hạn tồn tại, heal = 5% max hp mỗi natural Action trong 3 natural Action.

mỗi lần về deck bằng ultimate cost ở deck bar giảm 1.

skill 1: giảm tỉ lệ chia từ ultimate từ 4 còn 2, tức cost của bản thân/4 thành /2, đổi lại cost sẽ không thể giảm được nữa và khiên khi ra sân từ nội tại cũng sẽ biến mất, vì thế nên phần heal 5% max hp cũng mất luôn, 20 ae, kích hoạt 1 lần/trận, cần natural Action để kích hoạt.

skill 2: gây aoe random lên 3 target, mỗi kẻ nhận sát thương = 185% wil và atk của nàng, 15 ae.

skill 3: khi hp giảm trên hoặc = 50% max hp của bản thân trong 1 natural Action gây damage lên bản thân nàng của kẻ địch, res và wil của bản thân tăng 70% trong 2 natural Action + 1 turn boundary, khi time đó kết thúc thì tự heal 10% max hp ngay ở đầu turn boundary. ví dụ: kích hoạt skill trong turn boundary hoặc natural Action của bản thân > lập tức tăng res/arm > natural Action, tính là 1 natural Action trong bộ đếm (nếu kích hoạt khi đang ở turn boundary thì khá hời vì vào natural Action mới tính vào bộ đếm) > turn boundary > natural Action > turn boundary (hết tăng res/arm ngay lúc vào, đồng thời heal 10% max hp).
khi bộ đếm này kết thúc thì mới có thể kích hoạt skill 3 lần nữa, không cd, cost 30 ae mỗi lần tự kích hoạt, tối đa kích hoạt 2 lần/trận.

ultimate: heal cho leader bằng 100% wil/atk của bản thân * (cost của bản thân/4), sau đó về lại deck ngay khi heal xong, cost từ cost bar +3. ví dụ cost của nàng khi vào trận lần đầu là 15 (đã giảm 5 từ nội tại) thì (100% wil và 100% atk)* 15/4 = 375% wil và atk của bản thân cho leader đồng minh, lần 2 thì 100% wil/atk * 14/4 =, 350%.
over heal được chuyển toàn bộ thành khiên, cap 100% max hp của leader.
về deck rồi ra sân lại là xoá mọi debuff/buff/mark trên người bất kể chúng thuộc cấp độ nào luôn.
đồng thời cũng heal cho một đồng minh có chân ngã có hp thấp nhất = 30% tỉ lệ % heal mà leader nhận được, ví dụ ở lần ra sân thứ 3 và cost đã giảm 5 của nàng là 15 thì 13/4 = 325% wil/atk sẽ heal cho leader, đồng minh kia nhận heal = 325/2 % wil và atk nhưng overheal sẽ bị bỏ qua mà không phải chuyển thành khiên, nếu leader không thể nhận heal hoặc heal bị chuyển thành sát thương thì đồng minh kia vẫn nhận heal.
sẽ có char có debuff phản hồi phục toàn sân, mọi heal nhận vào chuyển thành sát thương chuẩn.
char này cost không thể nào là 20 nên vào trận cost chắc chắn dưới 15.

44) 

Nội tại: 


ultimate: lao đến 1 target, đấm vào bụng họ (vfx) và hất tung (là hiệu ứng có thể tương tác) target đó lên không, họ nhận sát thương = 120% wil và atk của nhân vật này và nhận debuff chảy máu trong 2 turn boundary+ 1 natural Action của họ, mỗi khi bộ đếm +1, mất hp = 3% max hp dưới dạng sát thương chuẩn, mọi thứ chỉ diễn ra chớp mắt ngay khi target trên không, vừa lúc target bị hất tung char này cũng nhảy lên sau lưng target, 2 nấm đấm gộp lại và nện xuống lưng target, gây sát thương lần 2 bằng 125% wil và atk của bản thân lên họ, sau đó họ chạm đất, gây sát thương lần 3 = 105% wil và atk của bản thân cho họ.
tức sau khi lần nhận sát thương thứ 3 kết thúc, target vào turn boundary, chảy máu và mất hp = 3% max hp > vào natural Action tiếp theo cũng thế > vào turn boundary cũng thế, đến natural Action tiếp theo thì hết chảy máu, tổng chảy máu là 9% max hp, chảy máu là sát thương chuẩn, tổng sát thương ultimate gây ra là 350% wil/atk của bản thân và 9% max hp của target.
3 lần gây sát thương chỉ tính là 1 natural Action, dễ hiểu là target chỉ nhận sát thương 1 lần từ ultimate (cho dễ code) nhưng mặt hiển thị chia 3 giai đoạn hoặc đơn giản hơn là target trong 3 đoạn này không hiện thanh hp, sau khi animation ult này kết thúc thì hiện thanh hp, sau đó mới nhận sát thương từ chảy máu.
vậy nên mô tả ultimate có thể rút gọn là gây sát thương = 350% wil và atk của bản thân lên 1 target, 3 giai đoạn đó chỉ là animation mà thôi.

45) 




46) 