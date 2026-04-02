# Chess Strategy RPG Mode — Gap Analysis (Gameplay-first)

## 1) Kết luận nhanh
Bản hiện tại đã có khung chơi được (seed map, 4v4, lượt theo slot, AE cơ bản, cap turn), nhưng còn thiếu nhiều rule cốt lõi đã khóa trong spec, đặc biệt các phần ảnh hưởng trực tiếp gameplay: **flow turn (move+1 action), attack range theo class, mục tiêu/mission, timer+fallback, shrink, AI personality/fairness, ZOC/path ngắn nhất, summon, tie-break**.

## 2) Đối chiếu spec vs hiện trạng

### 2.1 Đã có (nền tảng tốt)
- 4v4, slot turn, player/enemy luân phiên, có turn cap, có AE gain từ move/basic, anti-hoard decay, skill/ult gate theo resource.
- Seed map và preview map theo realm.
- Import chỉ số cơ bản từ profile/roster để vào trận.

### 2.2 Lệch/thiếu gameplay quan trọng
1. **Flow turn sai với spec “Move rồi 1 Action”**
   - Hiện tại có thể di chuyển nhiều lần trong cùng lượt trước khi dùng action (không khóa sau move).
   - Có thể bấm `Kết thúc lượt` mà không action (có thể chấp nhận) nhưng thiếu enforcement “tối đa 1 move-phase”.

2. **Attack range chưa theo class/piece-spec combat**
   - `basicAttack` chỉ cận chiến Manhattan=1, không có ranger=3, mage/support/summoner=2.
   - Không có mapping class -> range, không kiểm LOS/đường đi.

3. **Thiếu objective system thực chiến**
   - Mới có elimination.
   - Chưa có rescue/boss, chưa có NPC barrier 1-hit, chưa có cảnh báo lethal trước end-turn.

4. **Thiếu timer 8s/char + bank time + timeout fallback**
   - Không có đồng hồ từng char turn.
   - Không có quỹ thời gian phe.
   - Không có auto fallback action khi timeout cho cả player/AI.

5. **Map shrink/sudden death chưa có**
   - Spec yêu cầu bắt đầu từ turn 4 phe player, co vòng ngoài sau mỗi phe turn.
   - Chưa có logic kill do collapse (không bị shield/immortal chặn).

6. **ZOC/pathing chưa đúng spec**
   - Movement đang theo “cờ vua piece random” (rook/bishop/knight) thay vì ô move/path ngắn nhất.
   - Không có C=A+B rule, vào ZOC dừng, rời ZOC tăng cost, ngoại lệ unit.

7. **AI chưa đạt mức tactical/fairness như spec**
   - AI hiện random move + đánh nếu đứng cạnh.
   - Chưa có personality 60/20/20 theo seed, chưa show pre-match personality.
   - Chưa có heuristic fallback “expected damage + safety”.

8. **Rage/Ultimate integration chưa hoàn chỉnh gameplay impact**
   - Ult có manual cast và rage gate, nhưng chưa có effect thực chiến rõ (đa số chỉ consume state).
   - Skill cast cũng chưa thấy pipeline target/effect/validation nên gameplay depth còn nông.

9. **Summon system chưa có**
   - Chưa có summon cap=3, overflow replace HP thấp nhất, và ảnh hưởng endgame scoring.

10. **Tie-break/draw chưa có**
   - Đang win/lose đơn giản theo elimination + turn cap.
   - Chưa xử lý cùng chết, unit points, %HP tie-break.

11. **Lineup lock/reorder cho mode chưa hoàn chỉnh UX rule**
   - Có lấy top 4 từ lineupDeck, nhưng chưa có screen reorder 1-4 chuyên mode và lock hiển thị rõ trong match HUD.

12. **Một số thông tin UI còn lệch spec text**
   - Message hiển thị “hết turn cap 7 lượt Player” trong khi constant cap đang là 9.

## 3) Ưu tiên triển khai tiếp theo (gameplay-first)

### P0 — Bắt buộc để “đúng game tactical”
1. **Chuẩn hóa turn micro-loop**
   - Mỗi unit: `start -> optional move (1 lần) -> 1 action hoặc skip -> end`.
   - Khóa input sau khi action.
   - Ghi rõ state `hasMoved`, `hasActed`.

2. **Thiết kế Action Resolver chuẩn dữ liệu**
   - Basic/Skill/Ult chung 1 pipeline: validate range/target/cost -> apply damage/heal/buff -> death check -> resource update.
   - Tách side-effect UI khỏi core state reducer để test dễ.

3. **Thêm objective framework v1.1**
   - `elimination`, `rescue`, `boss` với condition hooks `onTurnStart/onAction/onTurnEnd`.

4. **Timer + fallback**
   - Per-unit timer 8s + team bank.
   - Timeout gọi `chooseFallbackAction(state)` dùng heuristic an toàn.

5. **Shrink engine**
   - Lịch co map từ player turn 4, mỗi phe end-turn co 1 ring.
   - Collapse resolution trước/hoặc sau action theo rule cố định (cần lock để replay deterministic).

### P1 — Nâng chiều sâu tactical
6. **Range + class profile** (ít nhất basic range theo spec).
7. **ZOC + path shortest path** (BFS/A* deterministic).
8. **AI profile seeded** (Neutral/Aggressive/Defensive) + scoring function.
9. **Mission alert** (đỏ khi NPC có lethal threat).

### P2 — Hoàn thiện hệ mode
10. Summon subsystem.
11. Tie-break + draw flow.
12. Telemetry hooks (timeout rate, shrink kills, skill usage).

## 4) Đợt “bắt bẻ” kết luận lần 1 (self-critique)

### 4.1 Điểm có nguy cơ đánh giá thiếu chính xác
- Có thể một phần effect skill/ult nằm file khác chưa mở; kết luận “chưa có effect” cần hiểu là **trong cụm chess mode hiện tại chưa thấy resolver effect**.
- “Path ngắn nhất” trong spec có thể áp dụng cho mô hình move ô lưới chuẩn, còn bản triển khai hiện tại cố tình thử “piece move”; vậy đây là **lệch định hướng đã chốt**, không phải bug kỹ thuật.

### 4.2 Tinh chỉnh đề xuất để khả thi hơn
- Nên làm **state engine thuần** trước (không phụ thuộc DOM), rồi match.ts chỉ render/dispatch.
- Dựng bộ test scenario theo “snapshot turn log” để bảo toàn replay khi thêm shrink/ZOC/timer.
- Khi thêm timer/bank cần cơ chế pause-safe (tab hidden) để tránh mất lượt oan do browser throttle.

### 4.3 Rủi ro nếu làm sai thứ tự
- Nếu làm AI trước khi khóa action resolver + range/ZOC -> sẽ phải viết lại AI hai lần.
- Nếu thêm mission trước khi có hook chuẩn turn lifecycle -> rule rescue/boss sẽ chồng chéo khó debug.
- Nếu thêm hiệu ứng UI sớm -> tăng chi phí refactor mà không tăng gameplay depth.

## 5) Roadmap ngắn gọn đề xuất (3 sprint)
- **Sprint 1 (Core correctness):** turn micro-loop + resolver + class range + tests.
- **Sprint 2 (Pressure systems):** timer/bank/fallback + shrink + objective rescue.
- **Sprint 3 (Depth & fairness):** ZOC/path + AI personality seeded + tie-break/summon + telemetry.

## 6) Định nghĩa “xong gameplay v1”
- 4v4 trận hoàn chỉnh với: move-then-action đúng luật, range class đúng, objective (elimination + rescue), timer+bank+fallback, shrink từ turn 4, AI không random thuần, replay deterministic theo seed.
