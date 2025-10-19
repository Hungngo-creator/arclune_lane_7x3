# Hướng dẫn sử dụng SVG Lôi Thiên Ảnh cho animation/VFX

## Vị trí file
- Đường dẫn: `dist/assets/units/loithienanh/default.svg`.
- File được tái sinh tự động mỗi lần chạy `npm run build` (script sẽ gọi `tools/generate-loithienanh-svg.mjs`).

## Quy ước ID nhóm
Mỗi lớp chính nằm trong một thẻ `<g>` với `id` bắt đầu bằng `LA_`. Danh sách hiện tại:

| ID | Vai trò | Ghi chú |
|----|---------|---------|
| `LA_LEG_BACK` | Chân sau | Pivot: `92,130`. |
| `LA_CAPE_BACK` | Áo choàng sau | Pivot: `86,128`. |
| `LA_ARM_BACK` | Tay sau | Pivot: `98,76`. |
| `LA_WEAPON_BACK` | Cán thương phía sau | Pivot: `124,138`. |
| `LA_TORSO` | Thân chính | Pivot: `86,128`. |
| `LA_HEAD` | Đầu | Pivot: `84,54`. |
| `LA_HAIR_FRONT` | Tóc trước | Pivot: `84,54`. |
| `LA_LEG_FRONT` | Chân trước | Pivot: `70,126`. |
| `LA_ARM_FRONT` | Tay trước | Pivot: `54,74`. |
| `LA_WEAPON_FRONT` | Thương phía trước | Pivot: `78,128`. |
| `LA_ACC_FRONT` | Phụ kiện ngực | Pivot: `78,120`. |
| `LA_FX_HEAT` | Lớp nhiễu nhiệt | Pivot: `86,120`, class `fx-heat`. |
| `LA_FX_GLOW` | Halo lôi văn | Pivot: `86,120`, class `fx-glow`. |
| `LA_FX_ULT` | Overlay ult | Pivot: `86,120`, class `fx-ult`, đã đặt `mix-blend-mode: soft-light`. |

Các nhóm FX đều kèm `class` để shader runtime dễ nhận diện.

## `data-pivot`
- Mỗi `<g>` có thuộc tính `data-pivot="x,y"` (đơn vị px trong khung 160×200).
- Tool rig nội bộ chỉ cần đọc `data-pivot` để đặt `transform-origin` tương ứng.
- Khi export sang Spine/After Effects, dùng script chuyển đổi pivot → anchor (chia cho scale khi cần).

## Lưu ý khi hiệu chỉnh
1. **Không đổi tên `id`** nếu không cập nhật lại tool map trong runtime.
2. Nếu thêm lớp mới, giữ tiền tố `LA_` và bổ sung `data-pivot`; đồng thời cập nhật bảng trên.
3. Với FX:
   - `LA_FX_HEAT` mặc định hiển thị, alpha 12%.
   - `LA_FX_GLOW` là radial gradient, nên nhân bản bằng `<use>` nếu cần nhiều bản.
   - `LA_FX_ULT` ẩn/hiện bằng cách đổi `opacity` path thứ nhất (hình chữ nhật viền) và path thứ hai (đám mây).
4. Thương trước/sau cần khóa cùng pivot với tay tương ứng để tránh drift.
5. Khi scale nhân vật, nhớ scale đồng thời giá trị `data-pivot` trong hệ thống timeline (tool có hỗ trợ auto).

## Quy trình cập nhật
1. Chỉnh sửa generator `tools/generate-loithienanh-svg.mjs`.
2. Chạy `npm run build` để dựng lại SVG và bundle.
3. Mở `dist/assets/units/loithienanh/default.svg` bằng viewer hoặc devtools, kiểm tra lại danh sách `<g>` và `data-pivot`.
4. Commit cả thay đổi `.svg` và script liên quan.
