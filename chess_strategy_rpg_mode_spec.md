# Chess-Strategy RPG Mode (Tactical Board Mode) — Locked Spec Checklist v1

> Mục tiêu tài liệu: khóa toàn bộ rule đã chốt trong thảo luận để có thể dùng trực tiếp cho thiết kế/implement ở chat khác, tránh lệch ý hoặc mất ngữ cảnh.

---

## 1) Product Goal & Scope

### 1.1 Mục tiêu mode
- Tạo mode chiến thuật theo turn, nhấn mạnh **điều khiển tay từng char** và tư duy vị trí.
- Trận ngắn, căng, có áp lực thời gian và áp lực bản đồ.
- Tận dụng hệ thống sẵn có từ campaign (char/kit/buff-debuff/rage/AE), nhưng có chuẩn hóa riêng cho mode này.

### 1.2 Phạm vi v1
- PvE-only.
- Map seed + near-symmetry fairness.
- 4v4 mặc định.
- Win condition chính: diệt sạch hoặc các điều kiện mission đặc biệt (rescue/boss).

### 1.3 Ngoài phạm vi v1 (để sau)
- PvP.
- Mở rộng objective phức tạp.
- Tinh chỉnh terrain chi tiết (module dần về sau).

---

## 2) Team Size, Turn Flow, Time System

### 2.1 Quy mô trận
- Mỗi phe: **4 char**.
- Tổng: 8 char trên sân (không tính summon phụ).

### 2.2 Turn order
- Turn theo phe: Player xong → AI xong → lặp.
- Trong mỗi phe, thứ tự char **cố định theo lineup** (slot 1→4).
- Khi vào lượt 1 phe, game tự chọn char theo thứ tự này.
- Char đã hành động xong thì hết lượt của char đó.

### 2.3 Turn của char
- 1 turn char gồm:
  - **Move** (theo luật di chuyển), rồi
  - **1 Action** (Basic Attack / Skill / Ultimate khi đủ điều kiện).
- Không có chuyện 1 char hành động 2 lần trong cùng lượt char.

### 2.4 Timer & Bank time
- Mỗi char có base thời gian suy nghĩ: **8 giây/char turn**.
- Thời gian dư được cộng vào **quỹ thời gian chung của phe** (bank time).
- Char có thể dùng thời gian từ quỹ chung khi cần.
- Nếu timeout: char đó tự thực hiện fallback action (xem 2.5).

### 2.5 Fallback khi hết giờ
- Auto-action: ưu tiên mục tiêu gây sát thương kỳ vọng tốt, tránh tự đi vào ô chết chắc.
- Không dùng logic đơn giản “HP thấp nhất” nữa.
- Fallback ưu tiên basic attack an toàn nếu không có action tốt hơn.

---

## 3) Match Length, Victory, Defeat, Draw

### 3.1 Turn cap
- Mặc định: **7 turn của phe Player**.
- Hết turn cap mà chưa đạt điều kiện thắng thì Player thua (v1).

### 3.2 Win/Lose chính
- Mặc định: tiêu diệt sạch phe địch để thắng.
- Một số mission sẽ có objective riêng (rescue NPC, boss, event).

### 3.3 Rescue objective
- Mission có NPC cần bảo vệ: **NPC chết = thua ngay**.
- NPC có **barrier mở màn 1 hit** để giảm frustration.
- Cảnh báo đỏ trước end turn nếu NPC có nguy cơ chết ở lượt kế.

### 3.4 Draw / Tie-break
- Nếu tình huống hòa cần xử lý, dùng tie-break theo hệ điểm đơn giản:
  1. Điểm đơn vị sống (char/summon theo trọng số hệ thống).
  2. Nếu bằng: so tổng %HP.
  3. Nếu vẫn bằng: các tiêu chí phụ (nếu cần) rồi mới draw.
- Nếu cả 2 phe chết cùng lúc có thể xử lý draw và cho replay theo flow mode.

---

## 4) Movement, ZOC, Pathing

### 4.1 Pathing
- Click char → hiển thị ô có thể đi.
- Click ô đích → di chuyển theo **đường ngắn nhất** hợp lệ.
- Không cho “đi vòng quẹo lui” để exploit.

### 4.2 ZOC (Zone of Control)
- Rule chốt: **C = A + B**
  - Vào ZOC thì dừng.
  - Rời ZOC tốn thêm movement cost.
- Có ngoại lệ cho unit phù hợp (đã chốt “Có” cho xử lý ngoại lệ cần thiết).

### 4.3 Assassin mobility special
- Assassin có cơ chế: giết mục tiêu → +1 move.
- Có giới hạn chống chain/exploit theo rule đã chốt.

---

## 5) Class, Piece System, Range

### 5.1 Terminology
- 7 class cũ giữ nguyên vai trò combat nền.
- Piece là layer chiến thuật bổ sung, **không thay class gốc**.

### 5.2 Piece selection
- Dùng **Piece Preset** do player chọn trước trận (tốn tài nguyên lúc vào trận).
- Piece đặc biệt:
  - **Queen**: thiên boss mạnh/sự kiện.
  - **King**: mission bảo vệ NPC/story.
  - **Pawn**: thiên control/debuff theo turn.
- Piece đặc biệt xuất hiện theo map/event, không phải roster thường xuyên v1.

### 5.3 Attack range cơ bản theo class (v1)
- Melee nhóm tanker/warrior/assassin: 1 ô.
- Mage/support/summoner: 2 ô.
- Ranger: 3 ô.
- Skill/Ultimate range chi tiết từng char bổ sung dần theo data.

---

## 6) Resource Economy (AE + Rage)

### 6.1 Tài nguyên
- **AE**: bể chung toàn phe.
- **Rage**: riêng từng char.

### 6.2 AE gain/spend
- Move: +1 AE mỗi ô, **cap +3 AE từ move mỗi lượt char**.
- Basic Attack: +2 AE.
- Skill: tiêu AE theo cost skill đã chuẩn hóa (có số lẻ như 3.5 / 4.0).
- Ultimate: dùng khi đầy Rage (manual cast).

### 6.3 Anti-hoard rule
- Nếu **2 lượt phe liên tiếp** không dùng skill → trừ cố định **-3 AE**.
- Chỉ cần 1 char trong phe dùng skill là reset decay counter.

### 6.4 UI cho AE
- Hiển thị AE và cost có chữ số thập phân rõ ràng.
- Nút skill khóa/mở realtime theo AE hiện có.
- Không bắt buộc preview confirm riêng cho AE sau hành động.

---

## 7) Skills, Ultimate, Kit Policy

### 7.1 Kit scope
- SS1 giữ **full kit + nội tại** theo định hướng hiện tại.
- Có **soft-ban** cho skill phá mode nếu cần (đã chốt có).

### 7.2 Ultimate behavior
- Ultimate trong mode này là **manual cast** (không auto-cast như campaign).
- Chỉ dùng được khi char đầy Rage và đến lượt char đó.

### 7.3 Buff/Debuff reuse
- Buff/debuff từ campaign có thể tận dụng.
- Cần kiểm thử để loại bỏ trường hợp khó đọc hoặc phá nhịp tactical.

---

## 8) Summon Rules

### 8.1 Vai trò summon
- Summon là đơn vị phụ nhưng có ảnh hưởng kết quả trận.

### 8.2 Summon cap
- Tối đa **3 summon mỗi phe**.

### 8.3 Overflow behavior
- Nếu vượt cap summon: thay summon có **HP thấp nhất** (ưu tiên rule này hơn “cũ nhất”).

### 8.4 Endgame interaction
- Summon có tham gia logic quyết định thắng/thua/tie-break theo rule hệ điểm đã chốt.

---

## 9) AI Design

### 9.1 Information fairness
- AI chỉ biết thông tin hợp lệ như player có thể biết (không đọc gian thông tin nội bộ đối phương).

### 9.2 Decision profile
- Ưu tiên tổng quát: sống sót hợp lệ + tấn công hiệu quả, tránh tự sát vị trí.
- Có personality:
  - 60% Neutral
  - 20% Aggressive
  - 20% Defensive
- Personality random theo seed, và hiển thị trước trận.

### 9.3 Timeout behavior
- AI dùng cùng logic timeout/fallback để đảm bảo fairness với player.

---

## 10) Map Generation, Seed, Terrain, Shrink

### 10.1 Seed format
- Khuyến nghị v1: **8 ký tự base36**.
- Nên có seed versioning (vd `v1-XXXXXXXX`) để bảo toàn replay khi đổi thuật toán.

### 10.2 Layout fairness
- Near-symmetry bắt buộc.
- Spawn theo mirror zone.
- Validation đảm bảo không bị block cứng ngay turn 1.

### 10.3 Terrain
- Mục tiêu: khoảng 10 loại terrain (ô đơn hoặc cụm ô).
- Tổng coverage terrain ban đầu theo mức thấp-vừa (mốc 12% đã thảo luận trước đó; tinh chỉnh sau test).
- Terrain rollout theo module, bổ sung dần.

### 10.4 Shrink / Sudden death
- Map tối thiểu kích thước 10x10.
- Bắt đầu shrink từ **turn 4 phe Player**.
- Sau mỗi turn của 1 phe (player hoặc AI), mất 1 vòng ngoài cùng.
- Đứng trên ô bị sập/ô đã sập khi resolve thì chết.
- Shield/immortal không can thiệp chết do map collapse theo rule đã chốt.

---

## 11) Progression, Power Normalization, Lineup

### 11.1 Lineup integration
- Dùng lineup tích hợp, có thứ tự rõ cho mode này.
- Có UI reorder thứ tự 1–4.
- Lock lineup trong trận.

### 11.2 Import/sync
- Sync theo hướng thủ công/kiểm soát được để tránh UX rối.
- Piece preset tiêu tài nguyên tại thời điểm vào trận (confirm).

### 11.3 Power normalization
- Có normalize theo map tier (tu vi map).
- Char vượt ngưỡng map bị hạ xuống; char thấp được nâng theo rule mode.
- Trang bị hợp lệ theo ngưỡng tu vi mode để hạn chế lệch sức mạnh quá mức.

---

## 12) UX/HUD Requirements (v1 tối thiểu)

- Hiển thị rõ: turn phe, lượt char hiện tại, thứ tự lineup còn lại.
- Đồng hồ 8s/char + quỹ thời gian chung phe.
- AE tổng (decimal), Rage từng char, trạng thái skill lock/unlock.
- Cảnh báo đỏ trước end turn nếu NPC có lethal threat.
- Hiển thị AI personality trước trận.
- Hiển thị vùng di chuyển hợp lệ + path ngắn nhất.

---

## 13) Balancing & Telemetry Checklist

### 13.1 KPI test nội bộ
- Thời lượng trận trung vị.
- Tỷ lệ thắng theo mission type.
- Tỷ lệ dùng skill/turn và trigger decay -3 AE.
- Tần suất timeout player/AI.
- Tần suất trigger map shrink kill.
- Tác động summon trong endgame.

### 13.2 Red flags cần theo dõi
- Stall quá mạnh do phòng thủ.
- Summon spam ảnh hưởng kết quả không hợp lý.
- ZOC gây kẹt cứng quá nhiều.
- Một vài class hoặc piece preset thống trị.

---

## 14) Open Items (chưa khóa hoàn toàn, cần tuning qua playtest)

- Công thức mapping cost skill chi tiết từ campaign -> tactical cho toàn bộ roster.
- Bộ terrain cụ thể (10 loại), hiệu ứng từng loại, trần xuất hiện mỗi loại.
- Trọng số tie-break cuối cùng cho char vs summon trong hệ điểm.
- Cân bằng boss buff (đã chốt 2 lượt phe, cần tuning cường độ).
- Tinh chỉnh anti-exploit cho assassin reset move trong mọi edge case.

---

## 15) Implementation Order (gợi ý để code an toàn)

1. Core turn loop + timer/bank + fallback.
2. Grid movement + pathing + ZOC.
3. AE/Rage economy + skill lock/unlock.
4. Win/lose/draw + turn cap + rescue fail.
5. Map seed + symmetry + spawn validation + shrink.
6. AI baseline (neutral) rồi personality layers.
7. Summon cap/replace/tie-break logic.
8. UI polish + telemetry hooks.
9. Balancing passes.

---

## 16) One-line Summary for Future Chat Context

Mode này là tactical PvE 4v4 theo turn với thứ tự lineup cố định, mỗi char move+1 action trong 8s có bank time phe, dùng AE bể chung (decimal, anti-hoard decay), Rage riêng để manual ultimate, map seed near-symmetry có shrink từ turn 4, turn cap player 7, có rescue/boss event, summon cap 3 và AI công bằng theo personality random có hiển thị trước trận.

