# Arclune Lane 7x3 — README kỹ thuật (cập nhật 2026-03-26)

Tài liệu này thay thế phần “Phân loại hàm và chức năng” cũ trong `lưu ý.txt`, đồng thời kế thừa các luật gameplay cốt lõi từ `readme.txt` nhưng map lại theo code hiện tại trong `src/`.

## 1) Tổng quan kiến trúc

- App chạy theo kiến trúc **Shell + Screen renderer**:
  - `src/entry.ts`: điều hướng màn hình, mount/unmount view, load module theo mode, fallback coming-soon.
  - `src/app/shell.ts`: state trung tâm của UI (`screen`, `screenParams`, `activeSession`).
- Runtime chiến đấu chính nằm trong `src/modes/pve/*` và dùng các module combat/turn/status/passive ở `src/`.
- Dữ liệu và chuẩn hóa logic tập trung ở `src/data/*`, `src/config/*`, `src/utils/*`.
- Các màn hình độc lập (collection, lineup, monopoly, gacha, main-menu, sect) nằm dưới `src/screens/*`.

## 2) Luật gameplay cốt lõi (đồng bộ với code hiện tại)

### 2.1 Bàn đấu và lượt
- Bàn 7x3, 2 phe trái/phải; leader có slot cố định trong mô hình turn hiện tại.
- Turn engine chạy kiểu **interleaved/sparse cursor**: bỏ qua slot trống, ưu tiên actor hợp lệ, hỗ trợ queue summon.
- File chính:
  - `src/turns.ts`
  - `src/turns/interleaved.ts`
  - `src/modes/pve/session-runtime.ts`

### 2.2 Combat/Damage
- Damage pipeline gồm: chọn mục tiêu → tính damage theo ability/spec → apply damage/shield → status/passive hooks.
- File chính:
  - `src/combat.ts`
  - `src/combat/calculate-final-damage.ts`
  - `src/combat/apply-damage.ts`
  - `src/combat/perform-active-skill.ts`
  - `src/statuses.ts`, `src/passives.ts`

### 2.3 Summon/Revive/Aether/Fury
- Summon và summon-chain có module riêng, không hard-code toàn cục theo class.
- Fury/Aether có lifecycle utility tách riêng, dùng ở turn/combat/session.
- File chính:
  - `src/summon.ts`
  - `src/utils/fury.ts`
  - `src/aether.ts`
  - `src/utils/kit.ts`

## 3) Màn hình Collection (đã có hub Gear & Art)

### 3.1 Entry + state
- `src/screens/collection/index.ts`: normalize params, merge profile/playerState, roster, currencies rồi render view.
- `src/screens/collection/state.ts`: state tối thiểu `activeTab`, `selectedUnitId`.
- `src/screens/collection/types.ts`: contract cho definition/params/view.

### 3.2 View và hub
- `src/screens/collection/view.ts` chứa toàn bộ UI collection:
  - Tab `skills`, `arts`, `skins`, `voice`.
  - Skill overlay + detail panel.
  - **Arts hub** gồm:
    - Gear inventory/filter/grid.
    - Paper-doll equip theo slot (head/shirt/weapon/accessory/pants/ring1-3).
    - Art hub placeholder (đã có khung, chờ dữ liệu phân loại sâu).
  - Wallet/currency sync với shared currency wallet.
  - Persist profile (`collectionUi`, equipment, tpAlloc, cultivation...).

### 3.3 Helpers
- `src/screens/collection/helpers.ts`:
  - clone/filter playable roster.
  - normalize cost theo unit id.
  - resolve currency balance từ nhiều định dạng config.
  - format metadata skill/summon/target/resource.

## 4) Màn hình Monopoly (Cờ tỷ phú)

### 4.1 Runtime màn chính
- `src/screens/monopoly/index.ts`:
  - dựng board isometric, wallet, automation controls.
  - tích hợp hệ tài sản/ô nhà, inventory, forge panel, event copy.

### 4.2 House system (logic lõi)
- `src/screens/monopoly/house-module.ts`:
  - random spawn hidden house slot.
  - roll tier + reveal khi mua.
  - tax/pass/land settlement.
  - treasury/income/mine-years.
  - owner effect spec + visitor penalty + upgrade/reset.

### 4.3 Ready screen
- `src/screens/monopoly/ready.ts`:
  - màn giới thiệu rule sự kiện năm, nút start/back.

## 5) Các màn hình và module còn lại

- Main Menu: `src/screens/main-menu/view/*`
- Lineup: `src/screens/lineup/view/*`, `src/screens/lineup/index.ts`
- Arena hub / Campaign world map / Sect / Tactical AI:
  - `src/screens/arena-hub/index.ts`
  - `src/screens/campaign-world-map/index.ts`
  - `src/screens/sect/index.ts`, `src/screens/sect/tactical-ai.ts`
- Gacha:
  - UI: `src/screens/ui-gacha/*`
  - screen bridge: `src/screens/gacha/view.ts`

## 6) Dữ liệu và cấu hình

- Mode/menu/status: `src/data/modes.ts`
- Skills + tags normalization:
  - `src/data/skills.ts`
  - `src/data/skills.config.ts`
  - `src/data/tags.ts`
- Economy/currency:
  - `src/data/economy.ts`
  - `src/data/economy.config.ts`
  - `src/utils/currency.ts`
- Roster preview/cost:
  - `src/data/roster-preview.ts`
  - `src/data/cost-budget.ts`
- Config loader/schema:
  - `src/data/load-config.ts`
  - `src/config/schema.ts`

## 7) Render engine, art, background, vfx

- Engine/canvas/slot projection: `src/engine.ts`
- Unit art/skin/palette: `src/art.ts`
- Background và environment props: `src/background.ts`
- VFX runtime + anchors: `src/vfx.ts`, `src/data/vfx_anchors/*`

## 8) Toolchain và test

- Build pipeline: `build.mjs`
- Offline/runtime stubs: `tools/*`
- Simulations: `simulations/*`
- Test suite: `test/**/*.test.*`

## 9) Ghi chú bảo trì

- Không chỉnh tay `dist/app.js` khi fix logic; sửa ở `src/*` rồi build lại.
- Khi cần tra trách nhiệm module, ưu tiên tài liệu này + mở trực tiếp file trong `src/`.
- Nếu cập nhật hệ thống mới (ví dụ mở rộng arts taxonomy, monopoly combat-link, gacha economy), cập nhật lại README này cùng lúc.
