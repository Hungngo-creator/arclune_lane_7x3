# Hoá Thân LUÂN HỒI CHI CHỦ
## Prime / Mage — Gameplay theo raw kit hiện hành

> Tài liệu gameplay cho mục 76 trong `ý tưởng nhân vật 3.md`. Mô tả raw và chốt mới của designer có ưu tiên cao hơn khuyến nghị cũ. Identity, Presentation, Combat Definition, Natural Action, Turn Boundary, Authority và Luân Hồi phải được phân biệt; một đề xuất trình bày hoặc clock chưa chốt không tự trở thành luật thực thi.

## I. Hồ sơ & Lục Cực Đồ

**Rank:** Prime. **Class:** Mage. **Element:** chưa cần gắn cố định; Effective Element về sau có thể do build/gear/Công Pháp quyết định. **DMG 3/5, SUR 5/5, CTL 5/5, CMP 5/5, MIC 5/5, VIS 2/5.** Luân Hồi Chi Chủ là Prime không vì damage mà vì authority và interaction với World Axiom. Mage phù hợp hơn Summoner: các đời mới không phải summon thông thường mà là Chân Ngã tái sinh và được tái cấu trúc. **Engine Risk: 5/5. Mechanic Profile:** Reincarnation Manipulation, Identity/Presentation Decoupling, Life-stage Transformation, World-Axiom Interaction, Rule-level Lifecycle Control, Temporary Battlefield Evasion, Max HP Mutation.

## II. Identity architecture

Luân Hồi Chi Chủ tách ba lớp: **Identity** = trueSelfId + lifeSerial; **Presentation Definition** = ngoại hình/skeleton/animation/VFX/voice; **Combat Definition** = Passive/Basic/Skill/Ultimate/Class/Rank và combat logic kế thừa từ đời trước. Ngoại hình A không cấp kit hoặc Rank của A cho Chân Ngã B. Ngoại hình được chọn khi đời mới xuất hiện và **không thay đổi qua bốn giai đoạn**. Ví dụ Chân Ngã Silas phe địch → kén phe Luân Hồi Chi Chủ → đời mới ngoại hình Đạo Mộng Dao, nhưng Rank/Passive/Basic/Ultimate/Class và chỉ số kế thừa vẫn từ Silas.

**Voice đã nêu trong raw:** Basic dùng giọng của ngoại hình A; Ultimate dùng giọng của nguồn kit/Chân Ngã B. Vì vậy ví dụ trên đánh thường có giọng Đạo Mộng Dao, dùng Ultimate có giọng Silas. Không đổi logic Basic sang kit A chỉ vì voice lấy từ A. Raw chưa chốt nguồn voice cho từng Skill khác hoặc cách fallback khi thiếu asset.

**VFX/animation:** raw hướng tới VFX của ngoại hình mà kén sao chép; câu hỏi giữ animation Basic Đạo Mộng Dao khi kit gốc Silas dùng súng vẫn là boundary asset cần chốt. Khuyến nghị: dùng skeleton/animation hợp lệ của ngoại hình A và ánh xạ cue phát đòn sang projectile/VFX tương thích; Damage/target/Mark/Authority vẫn lấy từ kit B. Không buộc model không có súng chạy nguyên animation cần súng của Silas. Fallback theo action type là đề xuất trình bày, không tự thay số hit, target hoặc sát thương của kit.

## III. Nội tại — Kén Luân Hồi

Khi **một Chân Ngã của đồng minh hoặc kẻ thù thực sự tiến vào Luân Hồi**, nội tại tạo một **Kén Luân Hồi** thuộc phe của Luân Hồi Chi Chủ. Chỉ HP_ZERO hoặc DEATH_CONFIRMED chưa đồng nghĩa đã vào Luân Hồi: waiting window và checkpoint vào Luân Hồi là hai trạng thái khác nhau. Kén là combat object/container của reincarnation payload, không phải một Chân Ngã mới hoặc summon mang Chân Ngã riêng. HP của kén khi tạo = **80% Max HP của Luân Hồi Chi Chủ**. Kén giảm **65% sát thương từ mọi nguồn trừ True Damage**; True Damage không chịu phần giảm này nhưng không tự xuyên Shield hay mọi Authority.

**Clock nở kén:** chờ **Natural Action tiếp theo của Luân Hồi Chi Chủ mà hắn thực thi thành công**. Một cơ hội bị CC làm mất lượt không làm nở kén; kén tiếp tục chờ tới một Natural Action thành công sau đó. Auto/Reaction/Counter/Follow-up và global Turn Boundary không thay cho Natural Action đó. Việc hoàn tất lượt thành công là điều kiện nở, không phải chỉ tới lượt, nhận quyền hành động hoặc bắt đầu một Action rồi bị hủy. Kén được tạo trong một Natural Action đang chạy chờ Natural Action tiếp theo, không dùng completion của chính lượt đang chạy để giả thành “lượt kế tiếp”. Quy định này thay thế thời hạn cũ một Turn Boundary và ví dụ “một turn sau tự nở”.

Appearance selection: ngoại hình của đời mới là ngoại hình bất kỳ character có trong Collection nhưng **không được chọn ngoại hình của các character đang tham gia/tồn tại trong Deck của trận đấu đó**. Đời mới thuộc phe của Luân Hồi Chi Chủ bất kể Chân Ngã trước khi chết thuộc phe nào. Nếu effective canonical identity có AXIOMATIC_TRAIT **UNIQUENESS**, kiểm tra typed uniqueness key/claim trước materialization; presentation FORM không tự tạo identity/claim mới. Không để random appearance commit illegal duplicate; exact appearance applicability/failure policy vẫn phải author rõ.

**Second reincarnation lock:** mỗi Chân Ngã chỉ được nội tại này thao túng để đầu thai **một lần trong trận**. Đời nở từ kén lại chết và vào Luân Hồi lần thứ hai → không tạo kén mới, không bị nội tại này thao túng và **không đầu thai trở lại trận đấu nữa**. Trạng thái mô tả là `REINCARNATION_EXHAUSTED`, không cấp một route/host khác để lách giới hạn đó. Đây là giới hạn trong trận; không suy diễn thành Chân Ngã bị ERASED khỏi tồn tại trong lore. Lore có thể cho đầu thai vô hạn nhưng kit chiến đấu này không cho lặp vô hạn.

## IV. Các giai đoạn tái sinh

Đời mới có **bốn giai đoạn**, không phải ba. Raw dùng cả Natural Action của đời mới và Turn Boundary; không tự bỏ một clock hoặc rút mỗi giai đoạn còn một Natural Action như khuyến nghị cũ. `TURN_BOUNDARY` vẫn là boundary SSI toàn cục, không có một loại boundary riêng của đời mới.

**Giai đoạn I — Ấu Niên:** kế thừa **30%** chỉ số thuộc typed previous-life profile; default basis là PREVIOUS_LIFE_INHERITANCE_BASIS của Luân Hồi (intrinsic/static Rank-Multiplied + explicitly inheritable battle-persistent growth, loại transient Buff/Debuff/temporary State/Field contributions), không River snapshot; giữ **Rank, Class, Passive, Basic và Ultimate của Chân Ngã B**, không kế thừa chúng từ ngoại hình A. Không thể dùng Skill 1/2/3. **Giai đoạn II — Thành Niên:** kế thừa **50%** mọi chỉ số đời trước, mở Skill 1. **Giai đoạn III — Tráng Niên:** kế thừa **70%** mọi chỉ số đời trước, giữ Skill 1 và mở thêm Skill 2/3. Mỗi lần tăng là **20 điểm phần trăm của chỉ số đời trước**, không nhân 1,2 phần kế thừa hiện có.

**Giai đoạn IV — Lão Niên:** giữ kit đã mở ở giai đoạn III; mỗi lượt cá nhân giảm 20% phần chỉ số kế thừa từ đời trước cho tới khi chết. Tài liệu trước mô tả decay tuyến tính theo inherited baseline, không compound; raw mới không chỉ định công thức khác. Khi **Max HP thực tế về 0, lập tức DEATH_CONFIRMED**, rồi vào Luân Hồi lần thứ hai và áp dụng giới hạn không đầu thai lại. Không đợi một hit sát thương hoặc một Natural Action mới để xác nhận death. Phần chỉ số kế thừa giảm không mặc định xóa modifier độc lập khác; điều kiện kết thúc raw là Max HP thực tế bằng 0.

**Clock progression đã chốt:** đếm riêng từ lúc bắt đầu **từng giai đoạn**, phải đủ **cả hai điều kiện** rồi chuyển ở **đầu Natural Action cá nhân kế tiếp**. Không đếm lũy kế từ lúc nở và không chuyển chỉ vì một clock đã đủ.

| Chuyển giai đoạn | Natural Action của đời mới trong giai đoạn đang có | Turn Boundary toàn cục kể từ khi giai đoạn bắt đầu |
| --- | ---: | ---: |
| I → II | 1 | 1 |
| II → III | 2 | 3 |
| III → IV | 3 | 4 |

Khi chuyển, hai bộ đếm của giai đoạn mới bắt đầu từ 0; Natural Action sắp thực hiện thuộc giai đoạn mới. Counter duration cá nhân dùng Natural Action clock hiện hành (CLK-003); non-natural child/Follow-up/Counter không tính. Quy tắc **thực thi thành công mới nở** là ngoại lệ riêng của kén, không tự áp sang mọi duration khác. Turn Boundary không trở thành Actor-private boundary chỉ vì counter thuộc một đời mới.

## V. Interaction với Luân Hồi, Death và Identity

DEATH_CONFIRMED của đời tái sinh là death thật và được World Axiom Luân Hồi quan sát. Với death thông thường, Death Prevention xử lý trước xác nhận; **Revive là cơ chế sau DEATH_CONFIRMED**, không đồng nghĩa Death Prevention. Chân Ngã confirmed-dead có waiting window trước khi vào Luân Hồi theo luật hiện hành; không tạo kén ngay từ mọi death event. Điều kiện Max HP = 0 ở Lão Niên có quy định xác nhận ngay riêng tại §IV. Chân Ngã vào Luân Hồi lần hai không được tạo kén hoặc đầu thai trở lại encounter.

## VI. Axiom / Authority

**Luân Hồi:** World Axiom ALWAYS_RESIDENT, không Character owner; access/route được kit khai rõ, không suy từ Prime. **Thần Tính:** explicit AXIOMATIC_TRAIT DIVINE_NATURE; không nhận external BUFF/DEBUFF/MARK NORMAL/PHAP_TAC/QUY_TAC (semantic owner khác recipient self), kể cả ally/có lợi/hại/trung tính. Self-owned State vẫn theo ordinary legality; external AXIOM State dùng AUT conflict. Không mặc định block Damage/Heal/Shield/resources hoặc system bookkeeping. Thần Tính không phải authority mặc định của toàn bộ skill Luân Hồi Chi Chủ. **Quy Tắc:** Nội tại Luân Hồi và Skill 1/Skill 3 Mark dùng authority Quy Tắc theo mô tả tương ứng; authority tier phải được tách khỏi Axiom identity. Skill thường không tự động thành Axiom chỉ vì Luân Hồi Chi Chủ là Prime.

## VII. Skill 1 — Cưỡng Hành Luân Hồi

**Authority Quy Tắc | Cost 25 AE + 5 Rage + chịu giảm tạm 20% Max HP.** Khi cast thành công, tất cả **Chân Ngã kẻ thù đang chờ vào Luân Hồi** lập tức vào Luân Hồi, bỏ qua thời gian chờ. Không chuyển Chân Ngã đồng minh hoặc Chân Ngã đã exhausted thành mục tiêu. Đây là cưỡng hành transition của waiting entry, không gây một death mới hay tự tạo một Chân Ngã khác.

Giảm Max HP tồn tại cho tới khi đủ **cả 2 Turn Boundary toàn cục và 3 Natural Action cá nhân kế tiếp của caster**, đếm **riêng từ mỗi lần cast**. Không rút cửa sổ còn hai boundary hoặc ba action tùy clock nào đến trước. Child/auto cast không tạo thêm tick Natural Action; duration cá nhân theo CLK-003 hiện hành. Cửa sổ kết thúc khi điều kiện còn thiếu cuối cùng đã đủ.

Phần Max HP đã mất do chính lần dùng Skill 1 là một lượng riêng `X`; hết cửa sổ, **trả lại X Max HP rồi Heal = 20% × X**, không Heal toàn bộ X. Ví dụ Max HP 100 → giảm 20 → còn 80; hết cửa sổ trả Max HP về 100 và lượng Heal từ kit là **4 HP**, trước các điều khoản Heal thông thường. Không tự hồi đầy HP. Giảm Max HP không phải Damage hay Current-HP Cost; không tạo Damage/Shield/Lifesteal chỉ vì được đặt trong phần cost của raw.

Bất kỳ điều kiện Cost bắt buộc nào chưa thỏa → không thể dùng Skill 1. Child Skill 1 qua Ultimate chỉ được miễn **AE**, vẫn giữ **5 Rage và phần giảm Max HP/cửa sổ hoàn trả**. Profile xử lý Current HP khi giảm/trả Max HP, stacking nhiều lần dùng và failure composition của child phải được khai báo trước dữ liệu thực thi; không suy diễn hoàn trả Max HP là Heal thứ hai.

## VIII. Skill 2 — Ẩn Nhập Luân Hồi

Cost **15 AE**. Khi cast, Luân Hồi Chi Chủ rời hiện thế dưới trạng thái **Temporary Absence**, không DEATH_CONFIRMED, không vào waiting window và không phát death event. Sau **1 lượt của Leader tính từ khi dùng Skill 2**, thử trở lại tại một ô ngẫu nhiên đang trống của phe mình. Nếu sân đầy, tiếp tục vắng mặt và thử một lần ở mỗi boundary gắn với lượt Leader cho tới khi trở lại thành công. Retry không tạo lượt mới, không trả lại 15 AE rồi thu lại cho mỗi lần thử và không phải một lần cast mới. `TURN_BOUNDARY` là toàn cục; exact Leader checkpoint phải được khai báo, không tạo một loại boundary riêng của Leader. Raw chưa phân biệt lượt Leader bị CC mất có tính cho clock này không.

Khi trở lại thành công: **Heal 20% Max HP hiện tại trước**, sau đó thêm **5% Max HP** dựa trên giá trị lúc **rời sân dùng chính Skill 2**. Đây là anchor được câu cuối raw chỉ định; không đổi thành Max HP tại thời điểm trở lại chỉ vì câu đầu dùng chữ “vào sân”. Phần tăng đã tích lũy **được giữ qua các lần ẩn/trở lại bằng Skill 2**, không xóa bonus cũ rồi chỉ thay bằng một bonus mới. Heal và lần tăng mới chỉ xảy ra khi return thành công, không lặp trong retry thất bại. Không tạo Natural Action hoặc reset SSI cursor.

**Tăng trưởng và lifetime đã chốt:** khi không có biến động Max HP khác, mỗi lần dùng và return thành công cho **Max HP mới = 1,05 × Max HP lúc rời sân**: **100 → 105 → 110,25 → 115,7625…**. Chốt này thay thế câu cũ “bonus mất khi rời sân vì chính Skill 2”. **Giữ toàn bộ phần tăng tích lũy qua các chu kỳ ẩn/trở lại bằng Skill 2; xóa toàn bộ phần tăng đó khi rời sân bằng cơ chế khác hoặc vào waiting window/Luân Hồi.** Đây là retention theo nguyên nhân transition, không phải bonus vĩnh viễn cho mọi lần rời sân hay một lần Cleanse. Chỉ xóa contribution của Skill 2, không xóa phần Max HP từ nguồn khác.

## IX. Skill 3 — Tam Tượng Quy Ấn

**Cost 20 AE.** Đứng tại chỗ, tạo 3 orb và gây **150% sát thương Basic của bản thân lên mỗi mục tiêu trong ba mục tiêu ngẫu nhiên**, đồng thời gắn Mark. Damage của Skill 3 **không phải Basic Attack**; lấy công thức Basic không đổi Action Identity. Khi trực tiếp được chọn làm hành động chính trong SSI, đây là một Natural Action, không phải ba. **Khi cast qua Ultimate, Skill 3 là child không tạo thêm Natural Action**, miễn AE theo §X. Không tự cho orb trùng target; duplicate policy/khi ít hơn ba mục tiêu là dữ liệu còn phải chốt trước executable normalization.

Mỗi target trúng Skill 3 được gắn một **Mark cấp Quy Tắc**, không mang harmful effect và tồn tại vô hạn cho tới khi target rời sân; effect/kit xóa mark dưới cấp Quy Tắc không thể xóa mark này. Khi một marked enemy đạt **DEATH_CONFIRMED** trong lúc Luân Hồi Chi Chủ còn ALIVE và có mặt trên sân, hắn nhận **+100% Current HP Regen** (hiểu là nhân đôi current HP Regen, không phải +100 điểm) cho tới khi chính Luân Hồi Chi Chủ đạt DEATH_CONFIRMED và nhận **+15 Rage**. Nếu Luân Hồi Chi Chủ đang Temporarily Absent/Hidden, điều kiện “có mặt trên sân” không thỏa và không trigger. Mark vẫn giữ trên target nếu target chưa rời sân.

## X. Ultimate — Composite Cast

Ultimate cast **Basic Attack và Skill 3 cùng lúc**, sau đó cast **Skill 1**. Player thấy **một chưởng tạo bốn orb**: một orb Basic chọn mục tiêu theo SSI, ba orb Skill 3 chọn ngẫu nhiên. **Cả bốn orb** hoàn tất sát thương trước khi bước sang Skill 1; không chờ chỉ ba orb Skill 3 hoặc để Skill 1 resolve chen giữa các orb.

Hai child Skill 1/3 được miễn **AE** và giữ nguyên effect/cost khác/Authority riêng. Skill 3 không thu 20 AE; Skill 1 không thu 25 AE nhưng vẫn yêu cầu 5 Rage và chịu phần giảm 20% Max HP cùng rule hoàn trả. Authority của Ultimate không nâng các child; phán định đúng clause của Skill 1 hoặc Skill 3, bao gồm Mark Quy Tắc. Basic vẫn có logic Basic riêng; một presentation chưởng không hợp nhất bốn orb thành một Basic hoặc bốn Natural Actions.

Phải giữ rõ ranh giới direct Damage đã hoàn tất, Mark/death và work bắt buộc trước child Skill 1. Việc có bốn orb không tự chốt snapshot/batch allocation hoặc thứ tự Reaction tùy ý. Trường hợp remaining Cost của child Skill 1 không đủ sau nhóm orb cần failure profile riêng; không coi AE waiver là miễn tất cả Cost hoặc tự rollback sát thương đã commit.

## XI. Basic Attack

Chưởng một orb đỏ-đen đan xen lên một enemy target, gây **100% ATK + 100% WIL**. Đây là Basic Attack action thực sự và tương tác với mọi effect yêu cầu Basic Attack theo combat contract.

## XII. Duy Nhất + Luân Hồi Chi Chủ

Duy Nhất là AXIOMATIC_TRAIT UNIQUENESS với AXIOM clause, không World subsystem như Luân Hồi. Khi đời mới chuẩn bị materialize, kiểm tra effective canonical identity/key và active claim trước commit; FORM/presentation không tự là unique identity khác. Claim acquisition/lifetime/atomic same-key continuation dùng ENT-021 hiện hành. Nếu Duy Nhất không cho phép bản thể mới xuất hiện vì current claim khác còn active (kể cả holder ở Deck/Waiting), random appearance không được dùng để phá Axiom. Resolution cụ thể (reroll presentation/definition hoặc từ chối materialization) cần được chuẩn hóa sau.

## XIII. Giác Đấu Trường + Luân Hồi Chi Chủ

Nếu Luân Hồi Chi Chủ xuất hiện trong Giác Đấu Trường, Arena vẫn dùng chính kit/SSI/Identity/Death/Axiom của hắn. Kén tạo trong Arena thuộc **Arena Combat Instance** tạo ra nó. Nếu Arena kết thúc khi kén còn tồn tại, cần rule transfer/cleanup: kén là combat object của instance và không tự động thành object của Main Battle nếu chưa có cơ chế transfer state. Chân Ngã/death event vẫn thuộc World Axiom Luân Hồi; Arena không có death system riêng.

## XIV. Engine invariants

1. **Identity ≠ Presentation ≠ Combat Definition.**
2. **Kén không phải Chân Ngã.**
3. **DEATH_CONFIRMED là death thật; HP_ZERO chưa đủ nếu còn Death Prevention. Revive xử lý sau xác nhận; Max HP = 0 ở Lão Niên có điều kiện xác nhận ngay riêng.**
4. **Stage IV decay tuyến tính theo inherited baseline.**
5. **REINCARNATION_EXHAUSTED ≠ ERASED.**
6. **Mark Quy Tắc có Identity riêng; dispel dưới Quy Tắc không thể tự xóa.**
7. **Temporary Max HP mutation phải xử lý reduction/return đúng Current HP; không “heal giả”.**
8. **Duy Nhất phải được phán định trước materialization.**
9. **Clock life-stage giữ cả Natural Action và Turn Boundary của raw; không tự bỏ một điều kiện. Kén chỉ nở sau Natural Action chủ thể thực thi thành công.**
10. **Ultimate composite không biến Skill 1/3 thành authority của Ultimate.**
11. **Skill 3 trực tiếp là một Natural Action chứa 3 orb; child Skill 3 qua Ultimate không tạo thêm Natural Action.**
12. **World Axiom Luân Hồi vẫn hoạt động trong Arena; Arena chỉ cô lập battlefield, không sở hữu luật sinh tử riêng.**

## XV. Lỗ hổng cần chốt trước implementation

Đã chốt: kế thừa **30% → 50% → 70%**; mỗi stage/cast có bộ đếm riêng, phải đủ **cả Natural Action và Turn Boundary**; stage đổi ở đầu Natural Action kế tiếp; Skill 1 hết penalty khi đủ cả 3 Natural Action và 2 Turn Boundary. Skill 2 tăng nhân **1,05** mỗi lần và **giữ phần tăng qua chính Skill 2; xóa khi rời sân bằng cơ chế khác hoặc vào waiting window/Luân Hồi** (§VIII).

Các boundary chưa đủ dữ liệu thực thi:

1. Exact Leader checkpoint/CC-lost opportunity cho lần trở lại đầu và retry Skill 2; không có Actor-private Turn Boundary.
2. Exact finite stat fields của inheritance profile vẫn cần resolve; source/contribution default nay khóa bởi PREVIOUS_LIFE_INHERITANCE_BASIS tại qualifying death, seal khi ENTERED (candidate retire nếu ordinary Revive trước entry). Không tự copy Current HP/Rage/AE/cooldown/temporary State hoặc cho ngoại hình A cấp kit; transient inheritance muốn khác default cần explicit exception. Scope khóa Skill ở từng stage đối với auto/child cast của Passive/Ultimate đời trước phải được khai báo, không ngầm bỏ Ultimate hoặc tự mở đủ ba Skill ở Ấu Niên.
3. Profile Current HP khi giảm/trả/tăng Max HP; stacking Skill 1 và failure của child Skill 1; không tự Heal phần hoàn Max HP.
4. Eligibility/placement khi sân đầy hoặc Collection không còn ngoại hình hợp lệ, kén bị phá, owner chết/rời sân, và route contention với các kit khác. Các route hiện hành chỉ xét claimant thực sự eligible/có legal host; presence riêng lẻ không đủ.
5. Skill 3 duplicate/ít-target policy, Mark refresh và multiple-marked-death batch/reward ordering; đọc Mark trước cleanup death để không làm mất quyền reward đã đủ điều kiện.
6. Exact simultaneous Damage/snapshot/completion và settlement trước Skill 1 trong Ultimate; không lấy iteration/animation order làm gameplay priority.
7. Kén Arena transfer/cleanup; Duy Nhất phải kiểm tra applicability thực tế trước materialization, không tự cấp Axiom từ ngoại hình.
8. Voice ngoài Basic/Ultimate, VFX/animation và fallback asset của đời mới (§II); Basic/Ultimate voice trong ví dụ đã rõ, không còn câu hỏi chung “lấy toàn bộ giọng A hay B”.

Những boundary này được ghi **UNRESOLVED / NOT BLOCKING** đối với đồng bộ raw/gameplay hiện tại; chúng chặn phần executable normalization thực sự phụ thuộc chúng. Tài liệu không khẳng định hoàn tất normalization mới của toàn bộ kit hay chứng minh cần mở rộng Kernel.

## XVI. Identity thiết kế

Luân Hồi Chi Chủ không phải Summoner thông thường. Bản sắc của hắn là:

> **Tạo một đời sống mới từ một Chân Ngã đã chết, cho đời đó mang hình thức của một character khác nhưng vẫn giữ lineage/identity của đời trước.**

Player có thể thấy:

> **“Ngoại hình A, Basic giọng A, Ultimate giọng B, kit B.”**

Engine phải hiểu:

> **Một Chân Ngã duy nhất → lifeSerial mới → Presentation Definition mới → Combat Definition kế thừa từ đời trước.**

Đây là character stress-test lớn cho Kernel về Identity, Death, Luân Hồi, Duy Nhất và Authority.
