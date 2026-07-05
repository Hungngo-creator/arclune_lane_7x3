Phần 1: Thư viện Math Đường Đi (Tái sử dụng 100%)
Dùng khái niệm nội suy tuyến tính (Lerp). Vị trí đạn tại thời điểm t (chạy từ 0 đến 1) được tính như sau:
Loại 1: Bay thẳng (Straight Line)
posX = startingX + (targetX - startingX) * t
posY = startingY + (targetY - startingY) * t
Ứng dụng: Súng, cung tên nhanh, phép la-ze.
Loại 2: Bay theo hình cung (Arc/Parabola - Parabol 2D đơn giản)
Trục X vẫn Lerp như trên.
Trục Y: Lerp như trên, nhưng cộng thêm một giá trị offset (độ cao cung) dựa trên hàm sin(t * \pi) hoặc hàm bậc hai -(t-0.5)^2 * 4 + 1.
posY_offset = (độ_cao_cung_max) * sin(t * \pi)
posY = (Lerp Y gốc) - posY_offset
Ứng dụng: Ném lựu đạn, phép ném đá, phù thủy bắn phép.
Phần 2: VFX Manager & Lắp ghép (Phần bạn muốn thay đổi theo Char)
Đây là nơi bạn "gắn vfx". Trong bản prototype Canvas, chúng ta giả lập VFX bằng các hình vẽ đơn giản.
Dữ liệu đầu vào: { origin: {x,y}, target: {x,y}, pathType: 'arc', vfxID: 'fireball', duration: 1000ms }
VFXManager:
Nếu vfxID == 'fireball': Vẽ một vòng tròn đỏ lớn, có chút hiệu ứng khói.
Nếu vfxID == 'arrow': Vẽ một hình tam giác nhọn màu nâu, xoay theo hướng bay.
Nếu vfxID == 'spell_orb': Vẽ một vòng tròn xanh tím lấp lánh.
