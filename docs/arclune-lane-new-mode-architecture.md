# Arclune Lane — Kiến trúc mode Cờ Tỷ Phú (MVP khả thi)

## 1) Kết luận audit nhanh: bản cũ **chưa sẵn sàng implement ngay**

Bản kiến trúc trước đó có nhiều ý tưởng tốt nhưng đang bị **quá rộng scope** so với mục tiêu “thêm mode Cờ Tỷ Phú chơi được”:

- Có nhiều hệ nâng cao (Underworld, Soul/Boss transfer, class synergy, year progression) chưa cần cho MVP.
- Chưa khóa rõ bộ rule theo yêu cầu mới: chỉ đánh thường, không kỹ năng/ultimate/nội tại/nộ.
- Chưa đặc tả rõ vòng đời dữ liệu “gear chỉ tồn tại trong mode này” nên dễ rò sang profile thường.
- Chưa có nhánh xử lý rõ cho bug hiện tại: bấm vào cờ tỷ phú xong lại về main screen (khả năng thiếu state route/session guard).

=> Để khả thi triển khai nhanh và an toàn, tài liệu này chuyển sang chiến lược: **MVP trước, mở rộng sau**.

## 2) Mục tiêu mode (đã chốt theo yêu cầu hiện tại)

Mode Cờ Tỷ Phú là mode độc lập, có các nguyên tắc bắt buộc:

1. Người chơi vào mode bằng nhân vật đang có, nhưng stat khởi tạo bị chuẩn hóa về **Khai Nguyên Lv1**.
2. **Không trang bị mang từ ngoài vào**, **không TP** (không dùng điểm tu vi/tăng tiến từ mode chính).
3. Trang bị nhặt được trong mode chỉ dùng trong mode, không leak ra mode thường.
4. Có tổng cộng **8 người chơi trong trận**: 1 người thật + 7 NPC AI.
5. NPC cũng chạy turn đầy đủ như người chơi.
6. Có thanh HP, chỉ số nền lấy từ profile Khai Nguyên Lv1.
7. Rank của đối thủ có thể random hoặc cố định theo cấu hình trận.
8. Combat chỉ có **đánh thường** (basic attack), không nộ, không ultimate, không kỹ năng, không nội tại.

## 3) Root-cause giả định cho lỗi “bấm cờ tỷ phú bị đá về main screen”

### 3.1 Các khả năng cao
1. **Route key chưa đăng ký đầy đủ**: UI có nút nhưng thiếu mapping tới mode runtime hợp lệ.
2. **Session bootstrap fail**: tạo `mode_session` lỗi (thiếu config mặc định), nên fallback về main.
3. **Guard check sai**: validator đang tái dùng guard của mode cũ (đòi resource không có), fail thì quay về main.
4. **Unhandled exception trong init**: ném lỗi ở bước build 8 entity, nhưng bị catch ở level cao và redirect.

### 3.2 Điều kiện “Done” cho lỗi này

- Click cờ tỷ phú phải vào được state `MONOPOLY_LOBBY` hoặc `MONOPOLY_IN_MATCH` ổn định.
- Nếu init lỗi, phải hiển thị toast/error modal có mã lỗi, **không silent redirect**.
- Log phải có `mode=monopoly`, `init_step`, `error_code` để debug production.

---

## 4) Kiến trúc đề xuất (ưu tiên tái dùng hàm hiện có)
## 4.1 Nguyên tắc
- Tái dùng tối đa: RNG, turn scheduler, combat damage công thức hiện có.
- Không tạo engine combat mới; chỉ bọc adapter để “tắt” các thành phần không dùng (skill/ultimate/passive).
- Tách dữ liệu tiến trình mode khỏi profile chính để tránh ô nhiễm dữ liệu.
## 4.2 Boundary rõ ràng
### A. `ModeEntryAdapter` (mới, mỏng)
Nhiệm vụ:
- Nhận click từ chiến trường cờ tỷ phú.
- Validate config tối thiểu.
- Khởi tạo `MonopolySessionState`.
- Chuyển state sang scene/mode runtime.
### B. `MonopolySessionState` (mới)
Dữ liệu runtime chỉ cho mode này:
- 8 entity snapshot (1 player + 7 AI).
- Board position, lap, HP hiện tại.
- Inventory mode-only.
- Seed RNG.
- Match config (rank policy random/fixed).
### C. `CharacterNormalizer` (mới, pure function)
Input: profile nhân vật thường.
Output: stat set chuẩn hóa Khai Nguyên Lv1:
- HP/ATK/DEF/SPEED theo bảng chuẩn.
- Clear toàn bộ skill/passive/ultimate resources.
- Disable nộ gauge.
### D. `ModeScopedInventory` (mới)
- Kho item riêng cho match.
- Không serialize vào profile chính.
- Xóa khi trận kết thúc (hoặc giữ nếu thiết kế mùa giải, chưa mở trong MVP).
### E. `BasicAttackOnlyCombatAdapter` (mới, bọc combat cũ)
- Cho phép chỉ action `BASIC_ATTACK`.
- Tắt trigger skill/passive/buff từ talent tree ngoài mode.
- Công thức damage vẫn dùng pipeline cũ để tránh lệch cân bằng kỹ thuật.
### F. `NpcTurnPolicy` (mới)
- Rule AI đơn giản cho MVP: roll -> di chuyển -> resolve ô -> nếu combat thì đánh thường.

## 5) State machine MVP
`MAIN_SCREEN -> MONOPOLY_ENTRY -> MONOPOLY_LOBBY -> MONOPOLY_INIT -> MONOPOLY_IN_MATCH -> MONOPOLY_RESULT -> MAIN_SCREEN`
### Guard bắt buộc
- `MONOPOLY_ENTRY` chỉ fail khi thiếu config nghiêm trọng.
- Fail ở `MONOPOLY_INIT` phải về `MONOPOLY_LOBBY` + hiện lỗi, không nhảy thẳng main.
- `MONOPOLY_IN_MATCH` luôn có session id hợp lệ và snapshot 8 entity.

## 6) Data contract MVP

## 6.1 Match config

```json
{
  "mode": "monopoly",
  "seed": 123456,
  "npc_count": 7,
  "rank_policy": "random_or_fixed",
  "base_realm": "KHAI_NGUYEN",
  "base_level": 1,
  "combat_policy": "basic_attack_only",
  "allow_skill": false,
  "allow_ultimate": false,
  "allow_passive": false,
  "allow_rage": false,
  "allow_external_gear": false,
  "allow_tp": false,
  "mode_inventory_scope": "session_only"
}
```

## 6.2 Runtime player snapshot

```json
{
  "player_id": "P1",
  "source_character_id": "C123",
  "normalized_stats": {
    "hp": 100,
    "atk": 12,
    "def": 8,
    "speed": 10
  },
  "hp_current": 100,
  "position": 0,
  "lap": 0,
  "rank": "fixed_or_random",
  "inventory_mode": [],
  "combat_flags": {
    "skill_enabled": false,
    "ultimate_enabled": false,
    "passive_enabled": false,
    "rage_enabled": false
  }
}
```
## 7) Luồng turn tối thiểu khả thi

1. Start turn.
2. Roll xúc xắc (hoặc bước di chuyển theo rule map).
3. Di chuyển theo số bước.
4. Resolve ô (thưởng/phạt/trang bị).
5. Nếu trùng ô có đối tượng đối kháng -> combat basic attack only.
6. End turn, chuyển sang entity kế tiếp.
Không thêm hệ phụ (soul/underworld/year event) trong MVP.

## 8) Checklist tích hợp để không phá hệ hiện có
1. Tạo namespace mode mới, không chèn logic hardcode vào mode cũ.
2. Chỉ dùng adapter để móc vào engine hiện tại.
3. Dùng schema config mới nhưng validation tái dùng bộ validator hiện có.
4. Telemetry bắt buộc:
   - `monopoly_enter_clicked`
   - `monopoly_init_started`
   - `monopoly_init_failed`
   - `monopoly_match_started`
   - `monopoly_match_finished`
5. Error handling chuẩn hóa: có error code + context payload.

## 9) Kế hoạch triển khai theo phase (khả thi trong thực tế)

### Phase A — Sửa lỗi vào mode + khởi tạo trận

- Mục tiêu: hết lỗi đá về main.
- Giao hàng:
  - `ModeEntryAdapter`
  - `MonopolySessionState` init
  - màn lobby/init tối thiểu
- Test:
  - click vào mode 50 lần liên tục không văng
  - init fail hiển thị lỗi đúng

### Phase B — Chuẩn hóa nhân vật + AI 7 NPC

- Mục tiêu: đủ 8 entity chạy turn.
- Giao hàng:
  - `CharacterNormalizer`
  - spawn 7 NPC theo rank policy
  - turn order ổn định
- Test:
  - mọi entity vào trận đều là Khai Nguyên Lv1
  - không entity nào có skill/ultimate/passive/rage

### Phase C — Combat đánh thường + inventory mode-only

- Mục tiêu: combat chạy bằng basic attack, drop đồ dùng trong mode.
- Giao hàng:
  - `BasicAttackOnlyCombatAdapter`
  - `ModeScopedInventory`
- Test:
  - combat log không xuất hiện action khác basic attack
  - item mode không xuất hiện trong profile chính sau khi thoát trận

### Phase D — Cân bằng + hardening

- Mục tiêu: ổn định production.
- Giao hàng:
  - telemetry dashboard
  - tuning reward/phạt
- Test:
  - soak test mô phỏng dài
  - deterministic theo Seed

## 10) Tiêu chí nghiệm thu (Definition of Done)

1. Vào mode từ chiến trường không bị văng về main.
2. Tạo trận đủ 8 entity thành công.
3. Tất cả entity khi vào mode đều bị chuẩn hóa Khai Nguyên Lv1.
4. Không có skill, ultimate, passive, rage trong toàn bộ combat log.
5. Không thể mang gear ngoài mode vào.
6. Gear kiếm trong mode không dùng được ngoài mode.
7. Trận chạy hết vòng turn mà không crash trong soak test.

## 11) Các điểm còn mở cần bạn trả lời để chốt tuyệt đối

1. Điều kiện thắng mode là gì?
   - Hết số vòng cố định, hay ai sống cuối, hay ai nhiều tài nguyên nhất?
   - là khi không còn ai ngoài ngoài 1 nhân vật cuối cùng còn sống, có thể là npc lẫn player, thua khi nhân vật HP về 0, trong 10 turn của bản thân mà không  đến được quỷ vực để đi đầu thai thì sẽ thua hoàn toàn, có thể hồi sinh khi còn sống làm diêm Vương ở quỷ vực hoặc uống canh mạnh bà.
2. Khi thua/thoát trận, có giữ lại tiến trình mode nào không hay reset toàn bộ?
- reset
3. Rank policy “fixed” cụ thể là lấy rank theo đâu (theo account rank, theo character rank, hay theo preset)?
- cứ chọn đại 1 char ssr có trong game là được, các AI cũng thế, là random.
4. Board của mode có bao nhiêu ô ở MVP (20/30/40)? 
-   00000000 
_____0000000000
0_0____________0_0
0_0____________0_0
0_0____________0_0
0_0____________0_0
0_0____________0_0
0_0____________0_0
0_0____________0_0
0_0____________0_0
___0000000000
____00000000
Số 0 là ô, _ là khoảng trắng, tao lười dùng dấu cách, hiểu được hay không? Ở trong bàn cờ sẽ có map nhỏ nữa nhưng tao lười vẽ, có bàn cờ hình vuông 40 ô, 10x4, mỗi bên sẽ có 1 hàng 8 ô đi kèm và được nối bởi 2 ô, tổng khoảng 80 ô.
5. Khi combat xảy ra nhiều hơn 2 người trên cùng ô: free-for-all hay bắt cặp tuần tự?
6. - mặc định 1 đánh tất cả, nếu hơn 2 thì mỗi 1 nhân vật trong ô đó sẽ đánh tất cả nhân vật còn lại.
6. HP tụt về 0 thì xử lý thế nào: out khỏi trận, hồi sinh tại mốc, hay trừ tài nguyên rồi sống tiếp?
- ở hiện tại thì out trận.
7. Trang bị mode-only có rarity không, và có giới hạn số slot trang bị đang đeo không? - không raity, hiện chưa cần thiết, trang bị cũng là lv 1.
8. Có cần matchmaking online thật hay MVP chỉ PvE với 7 bot là đủ?
- đánh với AI là đủ.
9. Tốc độ 1 trận mục tiêu bao nhiêu phút để cân pacing?
15 đến 20 phút nếu có thể.
10. Bạn muốn UI hiển thị rõ nhãn “Mode-only item” ngay từ MVP không? không.

## 12) Chốt khả thi

Với scope đã rút gọn như trên, mode Cờ Tỷ Phú là **khả thi triển khai** theo đường MVP trước, mở rộng sau. Phần quan trọng nhất là khóa boundary dữ liệu mode-only + sửa entry state machine để chấm dứt lỗi bật ra main screen
