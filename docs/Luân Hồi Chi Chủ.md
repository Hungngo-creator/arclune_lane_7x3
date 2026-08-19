# Hoá Thân LUÂN HỒI CHI CHỦ
## Prime / Mage — Chuẩn hóa Legacy Kit

> Mục tiêu: chuẩn hóa Luân Hồi Chi Chủ theo combat contract hiện tại, giữ fantasy gốc nhưng tách rõ Identity/Presentation/Combat Definition, Life State, Turn Boundary, Natural Action, Authority, Axiom, Luân Hồi và Duy Nhất. Các điểm dưới đây là những đề xuất/đồng thuận từ phân tích trước; phần chưa đủ dữ kiện được đánh dấu cần chốt.

## I. Hồ sơ & Lục Cực Đồ

**Rank:** Prime. **Class:** Mage. **Element:** chưa cần gắn cố định; Effective Element về sau có thể do build/gear/Công Pháp quyết định. **DMG 3/5, SUR 5/5, CTL 5/5, CMP 5/5, MIC 5/5, VIS 2/5.** Luân Hồi Chi Chủ là Prime không vì damage mà vì authority và interaction với World Axiom. Mage phù hợp hơn Summoner: các đời mới không phải summon thông thường mà là Chân Ngã tái sinh và được tái cấu trúc. **Engine Risk: 5/5. Mechanic Profile:** Reincarnation Manipulation, Identity/Presentation Decoupling, Life-stage Transformation, World-Axiom Interaction, Rule-level Lifecycle Control, Temporary Battlefield Evasion, Max HP Mutation.

## II. Identity architecture

Luân Hồi Chi Chủ phải tách ít nhất ba lớp: **Identity** = trueSelfId + lifeSerial; **Presentation Definition** = ngoại hình/skeleton/animation/VFX/voice fallback; **Combat Definition** = Passive/Basic/Skill/Ultimate/Class/Rank và combat logic của đời hiện tại. Một đời tái sinh có thể có ngoại hình của character A nhưng Combat Definition/kế thừa từ Chân Ngã B. Ví dụ Silas chết → Chân Ngã Silas vào Luân Hồi → kén nở ra đời mới có ngoại hình Đạo Mộng Dao nhưng vẫn mang Chân Ngã Silas, kế thừa lineage/kit/stat của Silas theo giai đoạn. Đây không phải clone definition của Đạo Mộng Dao. VFX/animation không nên ép dùng toàn bộ VFX của source kit; ưu tiên animation hợp lệ của Presentation Definition, còn logic damage/effect lấy từ Combat Definition. Nếu presentation không có animation phù hợp, dùng fallback theo action type. Voice có thể lấy theo nguồn Combat Definition nếu muốn giữ bản sắc đời trước.

## III. Nội tại — Kén Luân Hồi

Khi **một ALIVE actor có Chân Ngã thuộc bất kỳ phe nào đạt DEATH_CONFIRMED và tiến vào Luân Hồi**, Luân Hồi Chi Chủ tạo một **Kén Luân Hồi** thuộc phe đồng minh của hắn. Kén là một combat object/container chứa reincarnation payload, không phải một bản sao trực tiếp của nhân vật chết và không tự được coi là Chân Ngã mới. Kén tồn tại **1 Turn Boundary của Luân Hồi Chi Chủ**. Max HP của kén = **80% Max HP của Luân Hồi Chi Chủ**. Kén nhận **65% generic Damage Reduction**, ngoại lệ True Damage theo Damage Contract hiện tại; True Damage vẫn bị Shield chặn nếu có và không tự động xuyên mọi Authority. Sau khi hết 1 Boundary, kén hatch thành một đời mới.

Appearance selection: ngoại hình của đời mới là ngoại hình bất kỳ character có trong Collection nhưng **không được chọn ngoại hình của các character đang tham gia/tồn tại trong Deck của trận đấu đó**. Đời mới thuộc phe của Luân Hồi Chi Chủ bất kể Chân Ngã trước khi chết thuộc phe nào. Nếu definition có tag **Duy Nhất**, phải kiểm tra Duy Nhất trước khi materialize; không được để random appearance phá Axiom Duy Nhất.

**Second reincarnation lock:** mỗi Chân Ngã chỉ được Luân Hồi Chi Chủ thao túng để tái sinh **một lần trong một trận đấu**. Nếu đời tái sinh sau đó lại DEATH_CONFIRMED và tiến vào Luân Hồi lần thứ hai, Chân Ngã chuyển sang trạng thái kiểu **REINCARNATION_EXHAUSTED**: Luân Hồi Chi Chủ không được tạo kén lần nữa và Chân Ngã không được đầu thai lần nữa trong cùng encounter. Không gọi trạng thái này là ERASED trừ khi lore/kernel xác nhận Chân Ngã thực sự bị xóa khỏi tồn tại.

## IV. Các giai đoạn tái sinh

Khuyến nghị dùng **Natural Action count của chính đời mới làm progression clock chính**, Turn Boundary là commit/timing point. Không nên có hai clock cạnh tranh mô tả cùng progression.

**Giai đoạn I — Ấu Niên:** kế thừa 30% các stat hợp lệ của đời trước, cùng Passive, Basic Attack, Ultimate và Class của đời trước; không có Skill 1/2/3; không thể sử dụng skill. **Giai đoạn II — Thành Niên:** trên nền Giai đoạn I, inherited contribution tăng thêm 20% theo hệ thống stat inheritance đã chốt; mở Skill 1 của đời trước. **Giai đoạn III — Tráng Niên:** tiếp tục tăng inherited contribution thêm 20%; mở Skill 2 và Skill 3. **Giai đoạn IV — Lão Niên:** trên nền Giai đoạn III, mỗi Natural Action của chính đời này làm giảm **20% inherited contribution** theo kiểu linear từ inherited baseline, không compound: 100% → 80% → 60% → 40% → 20% → 0%. Khi inherited Max HP contribution đạt 0 và Max HP do lineage giảm về 0, kích hoạt ngay **DEATH_CONFIRMED**; đây là life-expiry condition nhưng vẫn đi qua death lifecycle.

Mốc chuyển giai đoạn: hatch → Stage I; sau Natural Action đầu tiên, tại Boundary kế tiếp → Stage II; sau action tiếp theo → Stage III; sau action tiếp theo → Stage IV. Không dùng các mô tả “1 turn/2 turn/3 turn” mơ hồ nếu chúng chỉ mô tả cùng progression.

## V. Interaction với Luân Hồi, Death và Identity

DEATH_CONFIRMED của nhân vật trong đời tái sinh là death thật và được World Axiom Luân Hồi quan sát. Death Prevention/Revive thông thường có thể xử lý trước khi DEATH_CONFIRMED; chỉ khi death được confirm mới tiến vào Luân Hồi. Một đời đã vào Luân Hồi lần thứ hai sau khi REINCARNATION_EXHAUSTED không thể bị Luân Hồi Chi Chủ tạo kén lần nữa trong encounter.

## VI. Axiom / Authority

**Luân Hồi:** World Axiom. Luân Hồi Chi Chủ là character có quyền thao túng Chân Ngã/đời tái sinh theo cơ chế kit. **Thần Tính:** Axiom cá thể; không nhận mọi hiệu ứng/buff/debuff/mark có lợi, có hại hoặc trung tính từ nguồn ngoài bản thân, kể cả đồng minh. Thần Tính không phải authority mặc định của toàn bộ skill Luân Hồi Chi Chủ. **Quy Tắc:** Nội tại Luân Hồi và Skill 1/Skill 3 Mark dùng authority Quy Tắc theo mô tả tương ứng; authority tier phải được tách khỏi Axiom identity. Skill thường không tự động thành Axiom chỉ vì Luân Hồi Chi Chủ là Prime.

## VII. Skill 1 — Cưỡng Hành Luân Hồi

**Authority:** Quy Tắc. Khi cast thành công, tất cả **enemy trueSelfId đang ở waiting window của Luân Hồi** lập tức chuyển sang Luân Hồi, bỏ qua waiting window. Không tác động đến Chân Ngã đã `REINCARNATION_EXHAUSTED`. Cost phải thỏa đầy đủ trước khi skill được dùng: **25 AE và 5 Rage**; đồng thời Luân Hồi Chi Chủ chịu **temporary Max HP reduction 20%** trong **2 Turn Boundary + 3 Natural Actions** theo legacy; cần chọn một clock chính trước implementation nếu không muốn hai timer cạnh tranh. Khuyến nghị coi Max HP reduction là temporary Max HP mutation, không phải Damage/HP Cost. Khi cửa sổ hết, Max HP bị giảm được trả lại và hồi đúng lượng HP tương ứng với phần Max HP đã mất do effect này; không tự động đầy HP nếu Current HP trước đó thấp. Mọi cost không đủ → Skill 1 không cast.

## VIII. Skill 2 — Ẩn Nhập Luân Hồi

Cost **15 AE**. Khi cast, Luân Hồi Chi Chủ rời hiện thế dưới trạng thái **Temporarily Absent / Hidden in Reincarnation**, không phải DEATH_CONFIRMED, không vào waiting window và không phát death event. Sau thời gian được chỉ định theo **một clock của Leader** (cần chốt là 1 Natural Action hay 1 Turn Boundary; khuyến nghị Turn Boundary để đồng bộ thuật ngữ), hắn thử materialize trở lại tại một slot ngẫu nhiên còn trống của phe mình. Nếu sân đầy, mỗi Turn Boundary của Leader thử materialize lại một lần cho đến khi thành công; retry không tạo natural turn.

Khi materialize thành công: hồi **20% Max HP** và nhận **temporary Max HP bonus 5%** dựa trên Max HP tại thời điểm rời sân dùng skill. Bonus 5% này mất khi kết thúc trạng thái rời sân/return cycle, khi vào waiting window của Luân Hồi, hoặc khi bị loại khỏi hiện thế theo lifecycle tương ứng. Nếu Skill 2 dùng nhiều lần, bonus có thể tạo compound growth vì mỗi lần tính theo Max HP lúc rời sân; đây là intentional scaling nhưng phải là temporary mutation, không permanent mutation. Không tạo natural turn, không reset SSI cursor.

## IX. Skill 3 — Tam Tượng Quy Ấn

Đứng tại chỗ, tạo 3 orb và gây **150% Basic Attack damage** lên 3 target ngẫu nhiên; orb có thể trùng target nếu target resolution cho phép. Damage của Skill 3 **không phải Basic Attack**. Đây là **một Natural Action** dù có 3 orb/multihit, nên mọi effect kiểu “1 lần/Natural Action” chỉ trigger một lần theo rule chung.

Mỗi target trúng Skill 3 được gắn một **Mark cấp Quy Tắc**, không mang harmful effect và tồn tại vô hạn cho tới khi target rời sân; effect/kit xóa mark dưới cấp Quy Tắc không thể xóa mark này. Khi một marked enemy đạt **DEATH_CONFIRMED** trong lúc Luân Hồi Chi Chủ còn ALIVE và có mặt trên sân, hắn nhận **+100% Current HP Regen** (hiểu là nhân đôi current HP Regen, không phải +100 điểm) cho tới khi chính Luân Hồi Chi Chủ đạt DEATH_CONFIRMED và nhận **+15 Rage**. Nếu Luân Hồi Chi Chủ đang Temporarily Absent/Hidden, điều kiện “có mặt trên sân” không thỏa và không trigger. Mark vẫn giữ trên target nếu target chưa rời sân.

## X. Ultimate — Composite Cast

Ultimate thực hiện **Basic Attack + Skill 3**, sau đó **Skill 1**; các skill cast qua Ultimate **không tốn AE** nhưng giữ nguyên effect và authority của chính skill đó. Khi conflict, phán định theo Tag/Authority của **Skill 1 hoặc Skill 3**, không dùng authority của Ultimate để nâng cấp chúng. Trình tự đề xuất: Ultimate mở → Basic Attack và Skill 3 resolve → 3 orb hoàn tất → commit damage/marks/deaths/reactions → Skill 1 resolve. Về VFX, player chỉ cần thấy một chưởng tạo **4 orb**: 1 orb đại diện cho Basic Attack, 3 orb cho Skill 3; sau khi 4 orb hoàn tất, Skill 1 được resolve. Visual composition không thay đổi source logic.

## XI. Basic Attack

Chưởng một orb đỏ-đen đan xen lên một enemy target, gây **100% ATK + 100% WIL**. Đây là Basic Attack action thực sự và tương tác với mọi effect yêu cầu Basic Attack theo combat contract.

## XII. Duy Nhất + Luân Hồi Chi Chủ

Duy Nhất là Axiom độc lập, đồng cấp với Luân Hồi. Khi đời mới chuẩn bị materialize, phải kiểm tra Effective Identity/definition có tag Duy Nhất hay không trước commit. Nếu Duy Nhất không cho phép bản thể mới xuất hiện vì một bản thể hợp lệ khác đang tồn tại, random appearance không được dùng để phá Axiom. Resolution cụ thể (reroll presentation/definition hoặc từ chối materialization) cần được chuẩn hóa sau.

## XIII. Giác Đấu Trường + Luân Hồi Chi Chủ

Nếu Luân Hồi Chi Chủ xuất hiện trong Giác Đấu Trường, Arena vẫn dùng chính kit/SSI/Identity/Death/Axiom của hắn. Kén tạo trong Arena thuộc **Arena Combat Instance** tạo ra nó. Nếu Arena kết thúc khi kén còn tồn tại, cần rule transfer/cleanup: kén là combat object của instance và không tự động thành object của Main Battle nếu chưa có cơ chế transfer state. Chân Ngã/death event vẫn thuộc World Axiom Luân Hồi; Arena không có death system riêng.

## XIV. Engine invariants

1. **Identity ≠ Presentation ≠ Combat Definition.**
2. **Kén không phải Chân Ngã.**
3. **DEATH_CONFIRMED là death thật; HP_ZERO chưa đủ nếu còn Death Prevention/Revive.**
4. **Stage IV decay tuyến tính theo inherited baseline.**
5. **REINCARNATION_EXHAUSTED ≠ ERASED.**
6. **Mark Quy Tắc có Identity riêng; dispel dưới Quy Tắc không thể tự xóa.**
7. **Temporary Max HP mutation phải xử lý reduction/return đúng Current HP; không “heal giả”.**
8. **Duy Nhất phải được phán định trước materialization.**
9. **Natural Action count là clock chính cho life-stage progression; Turn Boundary là timing/commit point.**
10. **Ultimate composite không biến Skill 1/3 thành authority của Ultimate.**
11. **Skill 3 là một Natural Action dù chứa 3 orb.**
12. **World Axiom Luân Hồi vẫn hoạt động trong Arena; Arena chỉ cô lập battlefield, không sở hữu luật sinh tử riêng.**

## XV. Lỗ hổng cần chốt trước implementation

1. Skill 1 duration hiện mô tả đồng thời “2 Turn Boundary + 3 Natural Actions”; cần chọn một clock chính hoặc quy định rõ hai điều kiện.
2. Skill 2 “1 turn của Leader” cần chốt là Natural Action hay Turn Boundary.
3. Skill 2 temporary +5% Max HP là additive hay compound; legacy hiện cho phép compound vì tính theo Max HP lúc rời sân.
4. Giai đoạn kế thừa “tăng 20% trên cơ sở giai đoạn trước” cần thống nhất công thức inherited stat; nên lưu inherited baseline và tăng contribution theo baseline để tránh compound ngoài ý muốn.
5. Nếu mark target chết trong cùng composite Ultimate, Skill 3 death reward nên resolve trước Skill 1.
6. Skill 1 nếu force-enter nhiều Chân Ngã vào Luân Hồi nên batch-resolve và không tạo kén trung gian giữa từng target làm thay đổi target pool của cùng action.
7. Interaction Arena ↔ Kén cần rule transfer/cleanup.
8. Duy Nhất ↔ random appearance cần resolution cụ thể.
9. Cần quyết định nguồn voice của đời mới: Presentation Definition hay Combat Definition.
10. Cần quyết định exact fields nào của đời trước được kế thừa ở từng stage; Max HP/ATK/WIL/ARM/RES có thể kế thừa nhưng Rage/Max Rage/AE/cooldown/temporary state/resources không nên tự động coi là “mọi chỉ số”.

## XVI. Identity thiết kế

Luân Hồi Chi Chủ không phải Summoner thông thường. Bản sắc của hắn là:

> **Tạo một đời sống mới từ một Chân Ngã đã chết, cho đời đó mang hình thức của một character khác nhưng vẫn giữ lineage/identity của đời trước.**

Player có thể thấy:

> **“Ngoại hình A, giọng B, kit C.”**

Engine phải hiểu:

> **Một Chân Ngã duy nhất → lifeSerial mới → Presentation Definition mới → Combat Definition kế thừa từ đời trước.**

Đây là character stress-test lớn cho Kernel về Identity, Death, Luân Hồi, Duy Nhất và Authority.
