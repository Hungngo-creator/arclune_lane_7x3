1) Kiến trúc & file

index.html – loader & thứ tự <script type="module">.

config.ts – CFG, CAM (preset camera nghiêng).

engine.js – grid, phép chiếu oblique; slotIndex/slotToCell, cellReserved, drawGridOblique, …

ui.js – HUD: cost bar 0→30, timer, deck-3; auto-select theo cost.

catalog.js – RANK_MULT, CLASS_BASE, ROSTER, applyRankAndMods/getMetaById/isSummoner.

units.js – 8 unit cho deck (id/name/cost) — không chứa chỉ số.

meta.js – Meta (dựa trên catalog.js), makeInstanceStats(), initialRageFor().

combat.js – basicAttack/pickTarget/applyDamage/dealAbilityDamage (đủ test turn).

main.js – Game{…}, sparse-cursor turn loop, queue chờ lượt, immediate summon, vẽ token & HP bar chuẩn.


2) Agreed Logic (đã chốt)

Bàn & slot

Bàn 7×3; đồng minh trái – địch phải; camera nghiêng (không top-down).

Mỗi phe có slot 1→9; leader mặc định slot 8; slot tăng trái→phải, trên→dưới.


Con trỏ lượt — Sparse Cursor

Lượt theo phe: ally → enemy → ally → …

Trong mỗi phe, con trỏ chỉ chạy những slot đang có actor hợp lệ, theo thứ tự 1→9, bỏ qua ô trống.

Đầu trận chỉ có leader (khi player chưa sum char từ deck lên sân)⇒ con trỏ chỉ chạy slot 8 của mỗi phe.


Đặt thẻ & “Chờ lượt”

Đặt thẻ ⇒ trừ cost, unit đứng mờ ở slot, không thu hồi, không nhận buff/debuff/dmg (chỉ đồng minh thấy).

Ghi vào chu kỳ hiện tại; khi con trỏ phe mình chạm slot đó ⇒ thoát chờ vào sân.

Nếu slot ≤ last (con trỏ đã đi qua trong chu kỳ này) ⇒ đợi sang chu kỳ kế (fairness).

Vào sân từ deck: Rage = 100 cho mọi unit trừ leader. Unit được hồi sinh có rage(nộ)/hp/aether tùy theo kĩ năng của kẻ hồi sinh unit đó.


Leader & nộ

Leader vào trận 0 nộ; tăng nộ khi tấn công/bị tấn công, khi đủ 100 nộ, player chọn 1 trong 3 ult.

Có thể có skill đốt/giảm nộ về sau. Revive: hp/nộ/aether theo skill (không áp 100 nộ mặc định).

Aether (mana) là để nhân vật dùng kĩ năng thay đòn đánh thường trong lượt của bản thân, kĩ năng không phải ult.

Ultimate & Summon

Chỉ class Summoner có Immediate Summon: creep sinh ra và hành động ngay trong lượt hiện tại, theo slot tăng dần.

Creep mặc định: không nộ, basic-only, không chain-summon. Mọi thừa hưởng/limit/replace… định nghĩa trong ult meta của nhân vật (không có mặc định toàn cục).

Ult khác (không phải class summoner) ⇒ không immediate.

Unit khi được hồi sinh không tính là creep.

Death & chiếm ô

hp ≤ 0 ⇒ loại khỏi logic ngay (không nhận dmg, không giữ lượt, không chặn slot).

Hiển thị dead-vanish ~0.9s rồi biến mất (placeholder hiện tại).

Unit (trừ leader và creep) có hp về 0 sẽ chết và có thể được hồi sinh.

Ưu tiên đặc biệt
Ví dụ:
Summoner là unit Trần Quát vừa vào sân (100 nộ) và ult sinh 2 creep kề: creep ở slot nhỏ hơn đánh trước; Summoner không đánh thường trong lượt đó.

Nếu đang là lượt slot 3, bạn đặt thêm unit ở slot 5,6: sau slot 3 ⇒ slot 5 vào sân, rồi slot 6 … theo sparse-cursor.


Cân bằng stat

Rank Mult (áp lên mọi stat trừ SPD): N 0.8, R 0.9, SR 1.05, SSR 1.25, UR 1.5, Prime 1.8..

7 class: Mage/Pháp Sư, Tanker, Ranger/Cung Thủ, Warrior/Chiến Binh, Summoner, Support/Hỗ Trợ, Assassin/Sát Thủ.
Trong thảo luận có thể dùng en/vn đan xen.

SPD không nhân theo rank; class base đã cân bằng trong catalog.js.


3) Dữ liệu nhân vật (tóm tắt)

8 nhân vật trong catalog.js/ROSTER (trùng id với units.js).

kit.onSpawn.rage = 100, exceptLeader:true cho mọi unit vào sân từ deck.

Ví dụ Summoner (Kỳ Diêu): ult.type='summon', pattern:'verticalNeighbors', inherit:{HP:0.5, ATK:0.5}, limit:2, replace:'oldest'.

Phệ (Mage) có ult drain (không summon).


4) Turn engine (tóm lược dev)

Tick → xác định phe → tìm slot kế tiếp có actor hoặc queued đến hạn → spawn (nếu queued) → act → xử lý actionChain (immediate summon) theo slot tăng dần → cập nhật last.

Nếu không còn slot/queued trong phe hiện tại ⇒ đổi phe; nếu enemy→ally thì cycle++.


5) QA nhanh

Đặt slot 2 rồi đặt slot 5 liền tay ⇒ slot 2 ra, tick sau slot 5 ra (không cần đặt thêm).

Đặt ngược dòng (slot ≤ last) ⇒ đợi chu kỳ kế.

Đang enemy phase đặt slot 7 ⇒ đợi sang ally phase, con trỏ tới 7 thì vào sân.

Summoner ult sinh 2 creep: vào ngay và đánh theo slot tăng dần.

6)
Con trỏ lượt vì chỉ có leader đứng trên sân ở đầu trận nên con trỏ sẽ chạy ở vị trí số 8 của leader luôn thay vì chạy từ số 1, sau đó vì chỉ có 1 đồng minh trên sân là leader và leader đã xong turn nên đến turn của kẻ địch, lặp đi lặp lại cho đến khi 2 bên bắt đầu đủ cost để sum char trong deck/cost bar ra sân. Nếu có nhân vật đứng ở số 3, 5, 8 (leader), 9 thì con trỏ sẽ chạy trực tiếp 3>5>8>9 thay vì chạy từ 1 đến 9 vì vị trí 1 2 4 6 7 không có bất kỳ nhân vật nào đang đứng, logic này áp dụng ở cả 2 bên và creeps được summon. Nếu trên sân kẻ địch có 2 summon đứng ở vị trí 4 và 6 + leader luôn ở vị trí số 8 thì con trỏ chạy 4>6>8 luôn sau đó kẻ địch hết turn và đến đồng minh, con trỏ chỉ chạy 1 đến 9 khi địa bàn có đủ 9 đơn vị đang đứng (8 char và leader) chứ chỗ không có bất kỳ đơn vị nào đứng/chiếm thì tại sao phải chạy con trỏ ở vị trí trống đó? Bỏ qua luôn chứ chạy như vậy ngoài làm mất thời gian/giảm nhịp trận đấu thì chả có tác dụng gì. Ví dụ khác: trong sân đang có 1 char ở số 3 và 1 char ở số 5 và leader ở số 8, số 3 đã thực hiện turn và tao đặt 1 char đã thanh toán cost vào ô 1 thì sẽ nằm hàng chờ vì số 3 đã thực thi xong turn, đến lượt của số 5 và 8 (con trỏ lượt chạy 3>5>8) rồi đến lượt của kẻ địch sau đó char được đặt ở số 1 mới thoát hàng chờ và dùng ult vì ra sân có 100 nộ (con trỏ lượt chạy 1>3>5>8), nếu trong lượt đồng minh này tao không sum thêm 1 char nào vào sân thì kết quả sẽ là như vậy, nếu số 1 và 3 đã thực hiện turn nhưng tao lại sum 1 char mới vào số 2 thì char đó cần đợi đến turn đồng minh tiếp theo, nếu số 1 đang thực hiện turn và tao nhanh tay sum char vào số 2 thì số 2 sẽ ra sân sau turn của số 1 ( rất nhanh)(con trỏ lượt là 1>2>3>5>8 nếu tao chỉ sum 1 char trong turn đó), nếu đang ở lượt của kẻ thù và tao sum char vào số 7 thì char đó sẽ đợi hàng chờ khi nào kẻ thù hết turn và đến turn của số 7 thì char đó ra sân, việc số 1 đang thực hiện turn và tao sum char mới ở vị trí khác ngoài 1 và 8 thì char được sum đó sẽ ra sân ngay lập tức nếu trước char đó không có char khác ngoài char ở ô số 1 và số 1 đã thực hiện xong turn, nếu số 3 đang thực hiện turn và tao đặt 1 char ở số 5 và 1 ở số 6 thì hết turn của số 3 số 5 sẽ ra sân (số 3 chưa xong turn thì số 5 ở hàng chờ), hết turn số 5 số 6 sẽ ra sân ( số 5 chưa xong turn thì số 6 ở hàng chờ), sum char khi đang là turn của kẻ địch cũng vậy, nằm hàng chờ, tới turn thì ra sân.

7) Những luật đã chốt

Leader: vào trận nộ=0, tích nộ dần, khi đầy nộ người chơi cần chọn 1 trong 3 ult; leader không auto-ult.

Auto-ult khi đầy nộ áp cho mọi unit trừ leader (summon thì tùy kĩ năng của summoner) (nền tảng).

Immediate Summon chỉ dành cho class Summoner.
Base của Summoner: AE cao, WIL khá, HP/ARM vừa, và “sức mạnh tính cả quân gọi” (giải thích vì sao thường cost nhỉnh hơn).

Hồi sinh: đơn vị được hồi sinh không nhận “100 nộ khi vào sân”; HP và aether theo skill của người hồi sinh (ví dụ Kỳ Diêu: nộ=0 và khóa kỹ năng 1 lượt).

Creep thừa hưởng và pattern là theo từng ult, không mặc định (ví dụ Trần Quát: 2 creep cùng hàng, HP/ATK = 50% chủ).

Rank multiplier áp cho tất cả core stat trừ SPD (SPD không đổi thứ tự ô).

“Chỉ số riêng” (mods) – đề xuất theo “ngân sách bằng nhau”

Để dễ cân bằng, tạo một ngân sách mod bằng nhau cho mọi nhân vật (ví dụ +20% tổng), phân bổ lên tối đa 3 chỉ số (SPD không mod), ví dụ:

nhân vật A: +10% WIL, +10% AEregen

nhân vật B: +12% ATK, +8% PER

nhân vật C: +10% RES, +10% WIL
Tổng % mỗi tướng bằng nhau, chênh lệch sức mạnh đến từ CLASS_BASE × RANK_MULT (chuỗi mới giúp giảm chênh lệch giữa các bậc nhưng vẫn giữ cảm giác lên hạng).
Nhưng tính theo % hay chỉ số cụ thể sẽ ok hơn vì tương lai sẽ có hệ thống lv cho nhân vật và leader?

1. Không có “pattern mặc định” cho Summoner,  ta ghi rõ pattern và số lượng creep trong kit.ult từng tướng.


2. Tỉ lệ thừa hưởng creep: không mặc định; ta đi theo mô tả ult. Trần Quát hiện là 50% làm mẫu.


3. Random vị trí: cần hỗ trợ thêm pattern: 'randomN' (ví dụ random2 trong 3 cột phe ta) để mở đường cho tướng tương lai mà vẫn tuân Sparse Cursor (spawn xong thì chain xử lý theo thứ tự slot tăng dần).
