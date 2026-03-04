# QA Tactical AI + Skill Runtime Test Plan

## 1) Mục tiêu
- Khóa chất lượng cho tactical AI runtime, skill runtime, tag dispatch và HUD status icon.
- Phát hiện sớm regression về tiêu hao tài nguyên (Fury/Aether), ưu tiên gambit, vòng đời status và loop/spike trong trận dài.

## 2) Scenario matrix

| ID | Nhóm | Scenario | Loại test | Kỳ vọng chính | Trạng thái pass |
|---|---|---|---|---|---|
| TAI-RES-01 | Resource split | `ult` chỉ tiêu Fury, **không** tiêu Aether | Jest unit (`test/resource-split-ult-vs-skill-aether.test.ts`) | `spendFury` được gọi, `globalAetherPool.consume` không gọi | Pass khi assert đúng |
| TAI-RES-02 | Resource split | `skill1..3` tiêu Aether theo cost metadata, không drain Fury | Jest unit (`test/resource-split-ult-vs-skill-aether.test.ts`) | `consume(side, cost)` được gọi, `spendFury` không gọi | Pass khi assert đúng |
| TAI-GMB-01 | Gambit priority | Rule đầu tiên hợp lệ phải được chọn trước | Jest unit (`test/gambit-action-priority-fallback-runtime.test.ts`) | `evaluateGambitLogic` trả slot đầu và action đúng | Pass khi action/slot đúng |
| TAI-GMB-02 | Gambit fallback | Skill thiếu tài nguyên fallback về basic | Jest unit (`test/gambit-action-priority-fallback-runtime.test.ts`) | Sau khi fail consume Aether, hệ thống đánh basic | Pass khi `doBasicWithFollowups` chạy |
| TAG-E2E-01 | Tag e2e | Tag damage/heal/status/summon cập nhật state đúng theo luồng runtime | Jest unit (`test/tag-effect-e2e.test.ts`) | HP đổi đúng chiều, status thêm/xóa đúng, summon callback chạy | Pass khi assert đúng |
| AUTO-ULT-01 | Auto-ult summon | Unit non-leader spawn từ deck auto full-fury và auto ult | Jest unit (`test/auto-ult-full-fury-non-leader.test.ts`) | `performUlt` gọi đúng 1 lần cho non-leader | Pass khi assert đúng |
| HUD-STS-01 | Status icon | Icon xuất hiện khi status có duration > 0 | Jest unit (`test/status-icon-duration-visibility.test.ts`) | Preview trả icon có id tương ứng | Pass khi assert đúng |
| HUD-STS-02 | Status icon | Icon biến mất sau khi hết duration | Jest unit (`test/status-icon-duration-visibility.test.ts`) | Sau `Statuses.onTurnEnd`, preview rỗng | Pass khi assert đúng |
| SMK-LONG-01 | Smoke simulation | Mô phỏng trận dài để bắt loop/stall/spike | Script (`simulations/long-battle-smoke.mjs`) | Không loop guard hit, không stall quá ngưỡng, p95 step-time dưới ngưỡng | Pass khi script exit code 0 |

## 3) Tiêu chí pass/fail

### Pass
- Toàn bộ test mới (matrix trên) **xanh**.
- Toàn bộ test hiện hữu của repo **xanh**.
- Smoke simulation dài chạy đủ số step, không phát hiện loop/stall, không vượt ngưỡng hiệu năng.

### Fail
- Bất kỳ test nào đỏ.
- Smoke simulation báo `loopGuardTriggered`, `stalledCycles` vượt ngưỡng, hoặc step-time vượt ngưỡng tối thiểu.
- Có regression hành vi: sai tài nguyên, sai action fallback, status icon không đúng vòng đời.

## 4) Ngưỡng hiệu năng tối thiểu (long battle smoke)
- `TOTAL_STEPS >= 1200`.
- `p95(step_ms) <= 8ms`.
- `max(step_ms) <= 20ms`.
- `stalledCycles == 0` (không cho phép cycle đứng yên liên tục vượt guard).
- `loopGuardTriggered == false`.

> Ghi chú: đây là ngưỡng CI-safe cho môi trường node chạy unit logic. Khi CI thay đổi cấu hình máy, có thể nới ngưỡng theo baseline mới nhưng phải cập nhật tài liệu + commit rõ lý do.

## 5) Release gate
- Chỉ merge khi toàn bộ test mới + test hiện hữu đều xanh.
- Lệnh gate chuẩn:

```bash
npm run release:gate
```

Gate này chạy:
1. `npm test`
2. `npm run smoke:long-battle`

Nếu bất kỳ bước nào fail => block merge.
