# Bản phác bố cục nhân vật Lôi Thiên Ảnh

## 1. Tư thế, tỉ lệ và thứ tự lớp
- **Tư thế tổng**: dáng đứng kiêu hãnh, hướng nhìn chếch 3/4 về bên phải màn hình; chân trái (gần người xem) bước nhẹ lên trước, chân phải trụ sau.
- **Tỉ lệ cơ thể**: chiều cao ~7,25 đầu; đầu chiếm 1/7 tổng chiều cao (cao ~27 px), thân từ cằm tới hông ~80 px, chân ~93 px.
- **Lớp trước–sau (từ gần nhất tới xa nhất)**:
  1. Lớp vũ khí tay trước (thương lôi) và hiệu ứng tia tiên đạo bám mũi thương.
  2. Cánh tay trước + bàn tay, phần áo choàng trước, tua rua trước đùi.
  3. Thân chính, đầu, tóc trước, cổ áo, ngực giáp, dây đeo, đai lưng, tà áo trung.
  4. Chân trước, giày trước, phủ gối.
  5. Chân sau, giày sau, tua rua sau, tà áo sau.
  6. Cánh tay sau và vũ khí sau (đốc thương) + dây đeo phụ.
  7. Phụ kiện lưng (phiến ánh lôi) và tóc sau.
  8. Hậu cảnh hiệu ứng (halo lôi văn, nhiễu nhiệt, cháy đỏ ult).

## 2. Toạ độ pivot (hệ toạ độ 160×200)
| Khớp | X | Y | Ghi chú |
|------|---|---|---------|
| Vai trái (trước) | 54 | 74 | Dùng cho xoay tay cầm thương. |
| Vai phải (sau) | 98 | 76 | Tựa áo choàng sau. |
| Khuỷu tay trái | 66 | 102 | Đặt splines gập về phía trước. |
| Khuỷu tay phải | 112 | 108 | Tay sau hơi cụp. |
| Cổ tay trái | 78 | 128 | Giữ chuôi thương, cần khóa theo vũ khí. |
| Cổ tay phải | 124 | 138 | Tựa cán thương sau. |
| Hông trái | 70 | 126 | Gốc chuyển động tà áo trước. |
| Hông phải | 92 | 130 | Neo giáp hông sau. |
| Gối trái | 72 | 162 | Cần độ cong nhẹ khi bước. |
| Gối phải | 96 | 168 | Trụ chính, ít chuyển động. |
| Cổ chân trái | 74 | 188 | Đặt pivot cho lật bàn chân trước. |
| Cổ chân phải | 98 | 192 | Neo giày sau. |

## 3. Lớp hiệu ứng thường trực
| Nhóm | Vị trí lớp | Trạng thái mặc định | Ghi chú animate |
|------|------------|---------------------|------------------|
| Glow lôi văn | Trước thân nhưng sau vũ khí | Hiện | Lặp fade 2,5s, alpha 55% → 85%; hue shift nhẹ ±6°. |
| Cháy đỏ ult | Trên cùng, phủ soft-light | Ẩn | Chỉ bật khi kích hoạt ult, blend mode add+soft mix, scale 1.15. |
| Nhiễu nhiệt | Sau toàn thân, trước hậu cảnh | Hiện | Shader distortion nhẹ (amplitude 3 px), scroll dọc chậm. |

## 4. Bảng màu & ghi chú chất liệu
- **Nguồn palette**: `loithien` trong `src/art.js` (primary `#8bd1ff`, secondary `#163044`, accent `#c7f1ff`, outline `#1e3e53`).
- **Da**: base gradient từ `#f4fbff` (sáng) → `#cbe7ff` (bóng khuất); thêm emissive nhẹ `#c7f1ff` quanh xăm lôi văn.
- **Kim loại giáp**: primary làm midtone; highlight `#d9f2ff`, shadow pha secondary `#163044`; cạnh sắc add rim `#c7f1ff` ~70% opacity.
- **Vải áo choàng**: secondary làm nền, lót trong dùng blend `#0f1f2c`; mép áo quét accent 40% tạo viền phát sáng.
- **Vũ khí (thương)**: cán dùng gradient `#1e3e53` → `#0b1822`; lưỡi thương chuyển `#8bd1ff` → `#c7f1ff`, thêm core emissive `#a6ecff` dọc sống.
- **Hiệu ứng năng lượng**: sử dụng accent pha thêm `#9df0ff` để glow; vùng cháy ult overlay `#ff8055` → `#ffd4a8` nhưng giới hạn alpha ≤45% để không phá palette.
- **Phụ kiện tóc & dây**: primary nhạt `#a8ddff` cho phần sáng, shadow dùng secondary + 20% black.
- **Giày & găng**: base secondary, nhấn góc bằng `#244a63`, highlight `#8bd1ff` ở mép giáp.
