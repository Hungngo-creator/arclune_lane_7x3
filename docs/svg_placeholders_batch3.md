# Ghi chú SVG – Đợt nhân vật mới (Diệp Minh → Thiên Lưu)

| Nhân vật | Asset chính | Yêu cầu/Hướng dẫn đặc biệt |
| --- | --- | --- |
| Diệp Minh | `assets/u_diep_minh.svg` | Aura thực vật bao quanh kiếm và áo choàng bằng sương lá chuyển động; thêm layer haze nhẹ quanh mặt. Khiên lá nên có opacity tách biệt để animate được. |
| Nguyệt San | `assets/u_nguyet_san.svg` | Giữ mái tóc trắng và váy bóng đêm dạng nhiều lớp; mặt bị che bởi haze trăng động. Cần frame chuyển động teleport (tách layer bóng để UI có thể fade). |
| Trùng Lâm | `assets/u_trung_lam.svg` | Hình thái dị thú bốn chân rõ khớp. Bổ sung companion riêng `assets/summon_lam_ho_ve.svg` (dạng thú hộ vệ) với cấu trúc tay/chân độc lập để summon sử dụng. |
| Huyết Tịch | `assets/u_huyet_tich.svg` | Vầng huyết cầu động quanh đầu và haze đỏ trắng bao phủ mặt. Nên tách lớp huyết cầu thành ≥3 layer để quay vòng. |
| Khai Nguyên Tử | `assets/u_khai_nguyen_tu.svg` | Thêm phù văn bạc chạy quanh áo choàng và hiệu ứng cổng không gian phía sau (loop 2-3 frame). Nền cổng nên tách layer để shader có thể xoay. |
| Thiên Lưu | `assets/u_thien_luu.svg` | Áo choàng bán trong suốt với tia sét nhỏ chạy dọc. Đội mũ ánh sáng kèm dải cực quang phía sau (nên tách layer aurora để animate). |

## Ghi chú bổ sung
- Các asset trên là placeholder, tạm thời dùng khung 512×512 giống batch trước; final SVG tối thiểu 150 KB để giữ chi tiết.
- Nếu cần thêm biểu tượng trong UI, sử dụng tiền tố `assets/icon_` (ví dụ `assets/icon_weather_aurora.svg`) và giữ palette đồng bộ với Thiên Lưu.
- Companion `Lâm Hộ Vệ` bắt buộc có bốn chi chia khớp và phần sừng lớn để phù hợp kỹ năng phản đòn.
