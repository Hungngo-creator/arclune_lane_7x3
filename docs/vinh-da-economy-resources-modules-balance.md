# Vĩnh Dạ Defense — Tài nguyên, kinh tế, module, kẻ thù và tiền tố sinh vật v0.2

> Tài liệu này bổ sung trực tiếp cho `Vĩnh Dạ Defense Mode — Design Spec 0.1`.
>
> Phần `# Hệ thống Rune và Bệ Đá Cổ — Bản cân bằng đề xuất` ở cuối spec gốc không bị sửa trong tài liệu này.
>
> Mục tiêu: tạo hệ thống tài nguyên chặt, tỉ lệ rơi rõ, chi phí xây/nâng kiến trúc rõ, quy đổi tài nguyên qua base sang Nguyên Tinh rõ, và thêm module/kẻ thù/tiền tố sinh vật để mode Vĩnh Dạ có kinh tế đủ sâu cho prototype.

---

## 1. Nguyên tắc chốt

### 1.1. Không có Prime trong mode Vĩnh Dạ

- Leader và nhân vật phòng thủ có thể lấy từ collection nhưng không dùng Prime.
- Rank cao nhất nên dùng trong mode này là UR.
- Prime có thể tồn tại trong game chính, nhưng Vĩnh Dạ dùng giới hạn riêng để dễ cân bằng.

### 1.2. Giết quái mới có tiền

- Kẻ thù phải thật sự chết trước khi trời sáng thì player mới có quyền nhận vật phẩm rơi.
- Nếu trời sáng mà kẻ thù còn sống, chúng bị ánh sáng thiêu đốt và player không nhận được gì.
- Sát thương ánh sáng buổi sáng bỏ qua hiệu ứng sống lại, phục sinh hoặc kéo dài tử vong.
- Quy tắc này khiến player không thể câu giờ để hệ thống tự dọn quái rồi vẫn nhận tài nguyên.

### 1.3. Tỉ lệ rơi không scale theo tier

- Tỉ lệ rơi giữ nguyên ở mọi tier.
- Số lượng rơi giữ nguyên ở mọi tier, trừ mô tả đặc biệt.
- Thứ tăng theo tier là **tier/chất lượng của vật phẩm rơi**, không phải số lượng.
- Ví dụ: Kẻ Vặn Vẹo tier 1.1 và tier 1.8 đều có cùng tỉ lệ rơi Dạ Thạch, nhưng Dạ Thạch ở tier 1.8 có giá trị quy đổi cao hơn.

### 1.4. Chi phí xây và nâng kiến trúc không scale số lượng theo tier

- Chi phí luôn dùng cùng một lượng vật liệu theo cấp kiến trúc.
- Khi ở map tier cao hơn, yêu cầu vật liệu cùng tier cao hơn.
- Ví dụ: Tháp Canh lv3 luôn tốn `8 Hắc Thiết + 6 Dạ Thạch + 1 Hắc Cốt`.
  - Ở map tier 1.1: dùng Hắc Thiết tier 1.1 và Dạ Thạch tier 1.1.
  - Ở map tier 1.8: dùng Hắc Thiết tier 1.8 và Dạ Thạch tier 1.8.
- Như vậy giá trị thật của kiến trúc tăng theo tier thông qua giá trị vật liệu, nhưng UI không phình số lượng quá lớn.

### 1.5. Tỉ Lệ Thu Hoạch không tác động trực tiếp lên drop quái

Tỉ Lệ Thu Hoạch chỉ nhân:

- Nguyên Tinh kết toán cuối map.
- Năng lượng/tài nguyên đã đưa vào base và có thể quy đổi thành Nguyên Tinh.
- Phần thưởng hoàn thành map.

Tỉ Lệ Thu Hoạch không nhân:

- Số lượng vật phẩm rơi trực tiếp từ từng quái.
- Vật phẩm nhiệm vụ.
- Huyết Nhục Kết Tinh bắt buộc.
- Vật phẩm độc bản.
- Rune.

---

## 2. Tier index và giá trị tài nguyên

### 2.1. Tier index

Để code dễ tính, mỗi tier map quy thành `tierIndex`.

```text
tier 1.1 = 1
tier 1.2 = 2
tier 1.3 = 3
tier 1.4 = 4
tier 1.5 = 5
tier 1.6 = 6
tier 1.7 = 7
tier 1.8 = 8
tier 1.9 = 9

tier 2.1 = 10
tier 2.2 = 11
...
tier 2.9 = 18

tier 3.1 = 19
...
```

Công thức:

```ts
function getTierIndex(tierMajor: number, tierMinor: number): number {
  return (tierMajor - 1) * 9 + tierMinor;
}
```

### 2.2. Cấp phẩm chất theo tier

```text
1.1–1.3: Nhất giai sơ kỳ
1.4–1.6: Nhất giai trung kỳ
1.7–1.9: Nhất giai hậu kỳ

2.1–2.3: Nhị giai sơ kỳ
2.4–2.6: Nhị giai trung kỳ
2.7–2.9: Nhị giai hậu kỳ
```

### 2.3. Tài nguyên có tier và không có tier

Tài nguyên có tier:

- Dạ Thạch
- Hắc Thiết
- Nguyên Tố Thạch
- Huyền Minh Trọng Thủy
- Hư Không Thạch
- Nguyện Thạch
- Oán Thạch
- Long Lân
- Linh Mộc
- Linh Thảo
- Huyết Nhục Kết Tinh

Tài nguyên không có tier:

- Hắc Cốt
- Niệm Thạch
- Cơ Giới Linh Kiện
- Tinh Phách Mờ
- Bụi Phong Ấn

Lý do: tài nguyên không có tier thường là vật liệu phụ, chất xúc tác, phế tích công nghệ hoặc vật liệu chế tạo phức hợp. Chúng dùng để khóa tiến trình, không dùng làm trục scale chính.

---

## 3. Hệ tiền tệ và kho base

### 3.1. Tiền tệ Nguyên Tinh

```text
100 Vụn Nguyên Tinh = 1 Hạ Nguyên Tinh
100 Hạ Nguyên Tinh = 1 Trung Nguyên Tinh
100 Trung Nguyên Tinh = 1 Thượng Nguyên Tinh
```

Thần Tinh không được tạo trực tiếp từ Thượng Nguyên Tinh trong mode Vĩnh Dạ thông thường.

### 3.2. Base không in tiền miễn phí

Base có thể chắt lọc vật liệu thành Nguyên Tinh, nhưng có thất thoát:

```text
Tinh luyện thô:
1 Dạ Thạch tier 1.1 = 0.9 Hạ Nguyên Tinh dạng năng lượng lỏng.

Ngưng tụ thành Nguyên Tinh cứng:
Năng lượng lỏng × 0.9
```

Tức nếu player muốn rút ngay thành tiền cứng:

```text
1 Dạ Thạch tier 1.1
→ 0.9 HNT lỏng
→ 0.81 HNT cứng
```

Nếu để trong base dưới dạng năng lượng lỏng:

- Chưa mất 10% ngưng tụ.
- Có thể dùng để duy trì buff base.
- Có thể tích lũy để ngưng tụ thành cấp Nguyên Tinh cao hơn khi kết toán.
- Có rủi ro mất nếu base bị phá hoặc rút lui thất bại.

### 3.3. Duy trì base

Base tiêu hao:

```text
5 Hạ Nguyên Tinh lỏng / ngày
```

Quy tắc:

- Ưu tiên trừ từ năng lượng lỏng trong base.
- Nếu không đủ, trừ từ Hạ Nguyên Tinh cứng mang vào.
- Nếu vẫn không đủ, base rơi vào trạng thái Thiếu Năng Lượng:
  - Tắt hồi phục base.
  - Tắt một phần buff lãnh địa.
  - Không thể tinh luyện tài nguyên mới cho tới khi nạp đủ.

### 3.4. Kết toán map

Khi hoàn thành map:

```text
HNT_cứng_kết_toán =
floorOrRound(
  Năng_lượng_lỏng_còn_lại
  × 0.9
  × Tỉ_Lệ_Thu_Hoạch
)
```

Nếu tài nguyên được quy đổi trực tiếp khi kết toán:

```text
Giá_trị_quy_đổi_cứng =
Giá_trị_lỏng × 0.9 × Tỉ_Lệ_Thu_Hoạch
```

Không nhân Tỉ Lệ Thu Hoạch lên Huyết Nhục Kết Tinh bắt buộc hoặc vật phẩm độc bản.

---

## 4. Bảng quy đổi tài nguyên sang Nguyên Tinh

Giá trị dưới đây là giá trị **năng lượng lỏng** trước khi ngưng tụ. Nếu rút thành tiền cứng, nhân thêm `0.9`.

### 4.1. Tài nguyên thường

| Tài nguyên | Có tier | Giá trị lỏng ở tier 1.1 | Công thức theo tier |
|---|---:|---:|---|
| Dạ Thạch | Có | 0.9 HNT | `0.9 × tierIndex` HNT |
| Hắc Thiết | Có | 0.9 HNT | `0.9 × tierIndex` HNT |
| Oán Thạch | Có | 1.2 HNT | `1.2 × tierIndex` HNT |
| Linh Mộc | Có | 1.6 HNT | `1.6 × tierIndex` HNT |
| Linh Thảo | Có | 1.0 HNT | `1.0 × tierIndex` HNT |
| Hắc Cốt | Không | 4 HNT | cố định |
| Niệm Thạch | Không | 25 HNT | cố định |
| Cơ Giới Linh Kiện | Không | 18 HNT | cố định |
| Tinh Phách Mờ | Không | 12 HNT | cố định |
| Bụi Phong Ấn | Không | 8 HNT | cố định |

### 4.2. Tài nguyên hiếm

| Tài nguyên | Có tier | Giá trị lỏng ở tier 1.1 | Công thức theo tier |
|---|---:|---:|---|
| Nguyên Tố Thạch | Có | 35 HNT | `35 × tierIndex` HNT |
| Nguyện Thạch | Có | 18 HNT | `18 × tierIndex` HNT |
| Huyền Minh Trọng Thủy | Có | 1 TNT | `1 TNT × tierIndex` |
| Hư Không Thạch | Có | 3 TNT | `3 TNT × tierIndex` |
| Long Lân | Có | 4 TNT | `4 TNT × tierIndex` |
| Huyết Nhục Kết Tinh | Có | Không khuyên đổi | vật phẩm tiến trình |
| Tinh Hạch Vĩnh Dạ | Có | 5 TNT | `5 TNT × tierIndex` |
| Huyết Chủ Ấn Phiến | Có | 2 TNT | `2 TNT × tierIndex` |

### 4.3. Quy tắc Huyết Nhục Kết Tinh

- Huyết Nhục Kết Tinh bắt buộc không nên cho đổi tự do.
- Nếu cần hệ thống xử lý đồ dư, chỉ cho đổi **bản dư không bắt buộc**.
- Giá đổi đề xuất cho bản dư:

```text
Huyết Nhục Kết Tinh dư = 10 TNT × tierIndex
```

- Không chịu Tỉ Lệ Thu Hoạch.
- Không được dùng để bypass progression nếu chưa hoàn thành boss tương ứng.

---

## 5. Tài nguyên mới đề xuất

### 5.1. Oán Thạch

Nguồn:

- Oán Niệm Hố.
- Thiết Hán.
- Bạo Tạc Giả cấp cao.
- Kẻ thù có tiền tố Quán Quân hoặc Anh Hùng.
- Module mộ hoang, chiến trường cũ.

Vai trò:

- Xây Ụ Đá.
- Nâng tường nhánh Nguyền Rủa.
- Nâng bẫy, Hắc Động và kiến trúc nguyền.
- Là vật liệu trung gian giữa tài nguyên rơi từ quái và tài nguyên xây dựng.

### 5.2. Linh Mộc

Nguồn:

- Linh Thụ.
- Rừng nguyên tố Mộc/Phong.
- Thương nhân.
- Module rừng bị ô nhiễm.

Vai trò:

- Chuồng Ngựa.
- Nhà Lính.
- Một số bẫy địa hình.
- Sửa chữa tường và tháp cơ bản.

### 5.3. Linh Thảo

Nguồn:

- Linh Thụ.
- Đồng linh thảo.
- Chuồng Ngựa tự trồng chậm theo ngày.
- Thương nhân.

Vai trò:

- Nuôi vật cưỡi.
- Tăng hồi phục thú cưỡi.
- Một số buff chuẩn bị trước đêm.
- Không nên dùng để nâng kiến trúc nặng.

### 5.4. Cơ Giới Linh Kiện

Nguồn:

- Module phế tích Cơ Giới Quốc.
- Thương nhân.
- Một số kẻ thù cơ giới nếu sau này thêm.
- Rương đặc biệt ở map tier 1.7 trở lên.

Vai trò:

- Pháo Phòng Không.
- Trọng Lực Pháo.
- Đao Phủ nâng cấp cao.
- Một số module tự động hóa sau này.

### 5.5. Tinh Phách Mờ

Nguồn:

- Pháp Sư Hắc Ám.
- Sứ Đồ.
- Tín đồ Hắc Ám Chi Chủ.
- Module linh hồn lạc đường.

Vai trò:

- Niệm Thạch.
- Đao Phủ.
- Nhà Thờ.
- Nghi thức tịnh hóa.

Công thức chế tạo:

```text
3 Tinh Phách Mờ + 15 HNT lỏng = 1 Niệm Thạch
```

### 5.6. Bụi Phong Ấn

Nguồn:

- Truyền Tống Trận cũ.
- Bệ phong ấn nhỏ.
- Module tàn tích trận pháp.
- Kết toán sau khi phong ấn thành công.

Vai trò:

- Truyền Tống Trận.
- Nâng base lv5+.
- Giảm chi phí rút lui chiến thuật.
- Không dùng quá nhiều trong early game.

### 5.7. Tinh Hạch Vĩnh Dạ

Nguồn:

- Mini-boss Vĩnh Dạ.
- Boss phụ.
- Đêm cuối hoặc sự kiện đêm đặc biệt.
- Tiền tố Anh Hùng có xác suất rơi rất thấp.

Vai trò:

- Nâng kiến trúc lv6.
- Nâng Trọng Lực Pháo nhánh Diệt Thần.
- Nâng Hắc Động nhánh Vĩnh Trú.
- Vật phẩm cao cấp nhưng không thay Huyết Nhục Kết Tinh.

### 5.8. Huyết Chủ Ấn Phiến

Nguồn:

- Tín Đồ Huyết Chủ.
- Huyết Chủ Tế Đàn.
- Nhà Thờ sau khi hoàn thành nghi thức lớn.
- Thương nhân cực hiếm.

Vai trò:

- Nhà Thờ.
- Base nhánh phòng thủ/huyết ấn.
- Một số buff tín ngưỡng.
- Dùng để làm rõ lore: Huyết Chủ không đại diện chính nghĩa, chỉ là một phe quyền lực.

---

## 6. Tỉ lệ rơi kẻ thù

### 6.1. Quy tắc loot pool

- Mỗi enemy có thể có nhiều loot pool độc lập.
- Các pool độc lập có thể cùng rơi.
- Tỉ lệ trong cùng một pool cộng lại tối đa 100%.
- Phần còn lại là không rơi gì.
- Nếu không ghi tier, vật phẩm không có tier.
- Nếu có tier, mặc định là tier của kẻ thù.

### 6.2. Kẻ thù hiện có — chuẩn hóa drop

#### Kẻ Vặn Vẹo

Pool Dạ Thạch:

```text
40%: 1 Dạ Thạch
20%: 2 Dạ Thạch
40%: không rơi
```

Pool Hắc Cốt:

```text
10%: 1 Hắc Cốt
5%: 2 Hắc Cốt
85%: không rơi
```

Threat Cost đề xuất: `1.0`

#### Người Bò Sát

Pool Dạ Thạch:

```text
30%: 1 Dạ Thạch
15%: 2 Dạ Thạch
3%: 3 Dạ Thạch
52%: không rơi
```

Threat Cost đề xuất: `1.15`

#### Sứ Đồ

Pool Dạ Thạch:

```text
100%: 2 Dạ Thạch
20%: +1 Dạ Thạch thêm
```

Pool đặc biệt:

```text
15%: Áo Choàng Sứ Đồ
85%: không rơi
```

Pool Tinh Phách mới:

```text
25%: 1 Tinh Phách Mờ
75%: không rơi
```

Threat Cost đề xuất: `3.0`

#### Chó Điên

Pool Dạ Thạch:

```text
20%: 1 Dạ Thạch
5%: 2 Dạ Thạch
75%: không rơi
```

Threat Cost đề xuất: `0.65`

#### Bạo Tạc Giả

Pool Dạ Thạch:

```text
10%: 1 Dạ Thạch
90%: không rơi
```

Pool Oán Thạch:

```text
20%: 1 Oán Thạch
80%: không rơi
```

Threat Cost đề xuất: `1.35`

#### Chim Biến Dị

Pool Dạ Thạch:

```text
10%: 1 Dạ Thạch
90%: không rơi
```

Pool Hắc Cốt:

```text
5%: 1 Hắc Cốt
95%: không rơi
```

Threat Cost đề xuất: `0.8`

#### Pháp Sư Hắc Ám

Pool Dạ Thạch:

```text
40%: 2 Dạ Thạch
20%: 3 Dạ Thạch
10%: 4 Dạ Thạch
5%: 5 Dạ Thạch
25%: không rơi
```

Pool pháp khí:

```text
60%: 1 Trượng Pháp Sư
10%: 1 Hắc Cốt
30%: không rơi
```

Pool Tinh Phách:

```text
35%: 1 Tinh Phách Mờ
10%: 2 Tinh Phách Mờ
55%: không rơi
```

Threat Cost đề xuất: `3.4`

#### Thiết Hán

Pool cố định:

```text
100%: 2 Dạ Thạch + 2 Hắc Thiết + 2 Hắc Cốt
```

Pool may mắn:

```text
10%: gấp đôi toàn bộ phần rơi cố định
90%: không thêm
```

Pool Oán Thạch:

```text
25%: 1 Oán Thạch
75%: không rơi
```

Threat Cost đề xuất: `4.0`

#### Oán Long

Pool cố định:

```text
100%: 10 Dạ Thạch + 5 Hắc Cốt + 1 Huyết Nhục Kết Tinh + 5 Long Lân
```

Pool thêm:

```text
5%: +2 Dạ Thạch + 1 Huyết Nhục Kết Tinh dư
95%: không thêm
```

Pool boss mới:

```text
100%: 1 Tinh Hạch Vĩnh Dạ
25%: +1 Tinh Hạch Vĩnh Dạ
```

Threat Cost: không dùng threatCost thường, dùng Boss Slot riêng.

---

## 7. Kẻ thù mới đề xuất

### 7.1. Tín Đồ Huyết Chủ

Lore:

- Không thuộc chính nghĩa.
- Là người thờ Huyết Chủ, tin rằng hiến máu và chiến tranh là con đường duy trì trật tự.
- Có thể đánh player nếu player cản nghi thức hoặc tranh tài nguyên.
- Cũng đánh Vĩnh Dạ nếu Vĩnh Dạ xâm phạm tế đàn.

Rank mặc định: R/SR  
Trọng lượng: 1  
Threat Cost: 1.8

Chỉ số chuẩn tier 1.1:

```text
HP: 4
ATK/WIL: 1.5
ARM/RES: 1
Speed: 0.55/s
```

Đánh thường:

```text
Chém tế đao.
Gây 100% ATK/WIL.
CD 2s.
```

Skill — Huyết Thệ:

```text
Khi HP dưới 40%, tăng 20% ATK/WIL trong 6s.
Mỗi trận kích hoạt 1 lần.
```

Drop:

```text
Pool Nguyện:
35%: 1 Nguyện Thạch
10%: 1 Huyết Chủ Ấn Phiến
55%: không rơi

Pool thường:
40%: 1 Dạ Thạch
20%: 1 Hắc Cốt
40%: không rơi
```

### 7.2. Tế Tư Huyết Chủ

Rank mặc định: SR/SSR  
Trọng lượng: 1  
Threat Cost: 3.6

Chỉ số chuẩn tier 1.1:

```text
HP: 5
ATK: 1
WIL: 3
ARM: 1
RES: 3
Speed: 0.45/s
Projectile speed: 2/s
```

Đánh thường:

```text
Bắn huyết chú vào 1 mục tiêu.
Gây 100% WIL/ATK.
CD 3s.
```

Aura:

```text
Đồng minh Huyết Chủ trong 12m nhận +8% WIL.
Không stack; lấy nguồn mạnh nhất.
```

Skill — Lễ Máu:

```text
Mỗi 10s, hồi 8% max HP cho một đồng minh Huyết Chủ thấp máu nhất.
Nếu không có đồng minh, tự hồi 4% max HP.
```

Drop:

```text
100%: 1 Nguyện Thạch
25%: 1 Huyết Chủ Ấn Phiến
20%: 1 Tinh Phách Mờ
```

### 7.3. Kẻ Nghe Tiếng Gọi

Lore:

- Không phải tín đồ tự nguyện.
- Bị phân thân Hắc Ám Chi Chủ ảnh hưởng vô thức.
- Nhìn ngoài vẫn như dân thường hoặc lính lạc đường, nhưng hành vi ngày càng lệch.

Rank mặc định: N/R  
Trọng lượng: 1  
Threat Cost: 1.2

Chỉ số chuẩn tier 1.1:

```text
HP: 3
ATK/WIL: 1
ARM/RES: 0.5
Speed: 0.5/s
```

Đánh thường:

```text
Đánh loạn bằng vũ khí thô sơ.
Gây 100% ATK/WIL.
CD 2.2s.
```

Nội tại — Tiếng Gọi:

```text
Mỗi 12s có 40% tự nhận 1 stack Ô Nhiễm.
Khi đạt 3 stack, bỏ chạy về phía rìa map.
Khi đạt 5 stack, chuyển hóa thành Sứ Đồ sau wave.
```

Drop:

```text
25%: 1 Dạ Thạch
15%: 1 Tinh Phách Mờ
60%: không rơi
```

### 7.4. Oán Tượng

Lore:

- Tượng đá/thi thể tín ngưỡng bị Oán Thạch hóa.
- Không thuộc phe thiện ác, chỉ nghiền nát sinh vật yếu hơn.

Rank mặc định: SR/SSR  
Trọng lượng: 3.2  
Threat Cost: 5.5

Chỉ số chuẩn tier 1.1:

```text
HP: 9
ATK/WIL: 3
ARM: 5
RES: 2
Speed: 0.25/s
```

Đánh thường:

```text
Đập xuống trước mặt.
Gây 130% ATK/WIL trong bán kính 2m.
CD 3s.
```

Nội tại — Thân Oán Thạch:

```text
Miễn bị kéo bởi hiệu ứng chỉ tác động trọng lượng dưới 3.
Nhận -20% sát thương từ bẫy nhỏ.
```

Drop:

```text
100%: 2 Oán Thạch
35%: 1 Hắc Thiết
15%: 1 Hư Không Thạch nếu xuất hiện trong vùng trọng lực cao
```

### 7.5. Hắc Ám Chủ Tế

Mini-boss, không phải boss cuối.

Rank mặc định: UR  
Trọng lượng: 1.2  
Threat Cost: 10

Chỉ số chuẩn tier 1.1:

```text
HP: 12
ATK: 2
WIL: 5
ARM: 2
RES: 5
Speed: 0.45/s
Projectile speed: 2/s
```

Nội tại — Âm Ảnh Mẫu Nghi:

```text
Mỗi 8s triệu hồi 1 Kẻ Nghe Tiếng Gọi nếu còn slot summon.
Tối đa 3 đơn vị triệu hồi sống cùng lúc.
```

Skill — Dấu Ấn Vô Thức:

```text
Gây 1 stack Ô Nhiễm lên 2 mục tiêu ngẫu nhiên trong tầm 15m.
CD 12s.
Tuân thủ cooldown nhận Ô Nhiễm từ cùng loại nguồn.
```

Ultimate — Hắc Triều:

```text
Khi HP dưới 35%, tăng 20% WIL cho mọi phe Hắc Ám trong 20m trong 8s.
Một trận kích hoạt 1 lần.
```

Drop:

```text
100%: 1 Tinh Hạch Vĩnh Dạ
100%: 2 Tinh Phách Mờ
35%: 1 Hư Không Thạch
20%: 1 Huyết Nhục Kết Tinh dư
```

### 7.6. Tàn Khu Huyết Nhục

Boss phong ấn dạng bất động hoặc bán-bất-động.

Rank: Boss  
Trọng lượng: 5  
Boss Slot riêng.

Chỉ số chuẩn tier 1.1:

```text
HP: 35
ATK/WIL: 0
ARM/RES: 6
Speed: 0
```

Cơ chế:

```text
Không tự đi.
Mỗi 15s sinh ra 1 đợt 3–5 quái Vĩnh Dạ dựa theo tier map.
Mỗi 20% HP mất đi, sinh ra 1 mini-wave.
Nếu không bị phong ấn sau khi HP về 0 trong 30s, hồi lại 20% max HP.
```

Điều kiện kết liễu:

```text
Base phải ở trong phạm vi phong ấn.
Leader phải sống.
Cần tiêu hao 1 Bụi Phong Ấn hoặc hoàn thành nghi thức 30s.
```

Drop:

```text
100%: 1 Huyết Nhục Kết Tinh bắt buộc
100%: 2 Tinh Hạch Vĩnh Dạ
100%: 5 Dạ Thạch
50%: 1 Hư Không Thạch
```

Huyết Nhục Kết Tinh bắt buộc không chịu Tỉ Lệ Thu Hoạch.

---

## 8. Tiền tố sinh vật

### 8.1. Mục đích

Tiền tố làm cho cùng một loại kẻ thù có biến thể mạnh yếu khác nhau, tạo bất ngờ trong wave mà không cần viết quá nhiều enemy type mới.

### 8.2. Công thức stat với tiền tố

```text
RankedStat = BaseStat × TierScale × RankMult

FinalStat =
RankedStat
+ PrefixFlatBonus
+ RankedStat × PrefixPercentBonus
+ OtherPostRankBonuses
```

Tiền tố:

- Cộng sau rank multiplier.
- Không bị rank multiplier nhân lại.
- Có thể cộng % trên `RankedStat`, nhưng phần % đó là phần hậu kỳ, không phải một rank multiplier thứ hai.
- Không áp dụng lên vật phẩm rơi bằng cách nhân trực tiếp, trừ khi mô tả tiền tố ghi rõ.

Ví dụ:

```text
Base HP sau tier = 10
RankMult SSR = 1.1
Ranked HP = 11

Tinh Anh +35% HP:
Final HP = 11 + 11 × 0.35 = 14.85
```

### 8.3. Giới hạn tiền tố

- Quái thường: tối đa 1 tiền tố.
- Mini-boss: tối đa 1 tiền tố đặc biệt.
- Boss: không dùng tiền tố thường, dùng boss modifier riêng.
- Không cộng tiền tố nếu làm enemy vượt vai trò thiết kế.
- Tiền tố không thay đổi loot bắt buộc, chỉ thêm loot phụ nếu có.

### 8.4. Bảng tiền tố

#### Tinh Anh

```text
HP +35%
ATK/WIL +20%
ARM/RES +10%
Speed +8%
Control resist +10%
Threat Cost ×1.8
```

Drop thêm:

```text
100%: +1 Dạ Thạch
20%: +1 vật liệu chính của enemy
```

Spawn:

```text
Tối đa 8% tổng đơn vị thường trong đêm.
Không xuất hiện trước đêm 2 nếu không có rune/biến cố.
```

#### Quán Quân

```text
HP +70%
ATK/WIL +35%
ARM/RES +15%
Speed +12%
Cooldown đánh thường -10%
Control resist +20%
Threat Cost ×3
```

Drop thêm:

```text
100%: +2 Dạ Thạch
35%: +1 Oán Thạch hoặc Nguyện Thạch tùy phe
10%: +1 Tinh Phách Mờ
```

Spawn:

```text
Tối đa 1–2 con/đêm ở tier 1.x.
Không xuất hiện trước đêm 4 nếu không có rune/biến cố.
```

#### Anh Hùng

```text
HP +120%
ATK/WIL +60%
ARM/RES +25%
Speed +15%
Cooldown đánh thường -15%
Control resist +35%
Threat Cost ×5
```

Quyền đặc biệt:

```text
Nhận 1 minor trait dựa theo phe:
- Vĩnh Dạ: áp Ô Nhiễm chậm hoặc aura nhỏ.
- Huyết Chủ: tự hồi hoặc buff đồng minh.
- Hắc Ám: triệu hồi nhỏ hoặc tăng WIL.
```

Drop thêm:

```text
100%: +3 Dạ Thạch
100%: +1 vật liệu chính của enemy
35%: +1 Tinh Hạch Vĩnh Dạ hoặc Huyết Chủ Ấn Phiến tùy phe
```

Spawn:

```text
Tối đa 1 con/map thường.
Có thể dùng như mini-event.
Không spawn trong đêm đầu.
```

#### Cổ Lão

```text
HP +90%
ATK/WIL +15%
ARM/RES +30%
HP Regen +1% max HP/5s
Speed -10%
Threat Cost ×2.8
```

Drop thêm:

```text
30%: +1 Hư Không Thạch nếu ở vùng trọng lực/không gian
30%: +1 Nguyện Thạch nếu là phe tín ngưỡng
```

Vai trò: biến enemy thành cục thịt lâu chết, không burst mạnh.

#### Cuồng Tín

```text
HP +20%
ATK/WIL +45%
ARM/RES -10%
Speed +10%
Mỗi 5s tự mất 2% max HP
Threat Cost ×2
```

Drop thêm:

```text
25%: +1 Huyết Chủ Ấn Phiến nếu thuộc phe Huyết Chủ
25%: +1 Tinh Phách Mờ nếu thuộc phe Hắc Ám
```

Vai trò: glass cannon, tạo áp lực nhanh nhưng tự hao.

#### Vật Chủ

```text
HP +50%
WIL +50%
ATK +10%
RES +20%
Speed -5%
Threat Cost ×3.5
```

Cơ chế:

```text
Mỗi 10s có 50% áp 1 stack Ô Nhiễm lên mục tiêu trong 8m.
Tuân thủ giới hạn nhận stack từ cùng loại nguồn.
```

Drop thêm:

```text
50%: +1 Tinh Phách Mờ
15%: +1 Tinh Hạch Vĩnh Dạ
```

---

## 9. Module map

### 9.1. Quy tắc module

Module là địa hình/điểm tương tác player không tự xây được.

Mỗi module có:

```ts
type MapModule = {
  id: string;
  tags: string[];
  spawnRules: ModuleSpawnRules;
  interactions: ModuleInteraction[];
  resourcePools: ResourcePool[];
  dangerLevel: number;
}
```

### 9.2. Module hiện có — chuẩn hóa

#### Mỏ Khoáng Sản

Mỗi map tối thiểu 3 mỏ Hắc Thiết.

Tỉ lệ đào:

```text
35%: 6 Hắc Thiết
25%: 10 Hắc Thiết
20%: 14 Hắc Thiết
15%: 20 Hắc Thiết
5%: 28 Hắc Thiết
```

Ghi chú: spec gốc có dòng `28/24`; bản này chuẩn hóa thành `20/28` để progression mượt hơn.

#### Quặng Nguyên Tinh

Số quặng:

```text
Tối thiểu 1
50% có quặng thứ 2
Nếu có quặng thứ 2, 25% có quặng thứ 3
Nếu có quặng thứ 3, 5% có quặng thứ 4
Không có quặng thứ 5
```

Loại quặng:

```text
35%: Quặng Hạ/Vụn
25%: Quặng Trung
15%: Quặng Thượng
25%: Quặng lẫn tạp chất / không ổn định
```

Sản lượng cơ sở:

```text
tier 1.1: 10 đơn vị khai thác
```

Sản lượng theo loại:

```text
Quặng Hạ/Vụn: +50% sản lượng mỗi tierIndex.
Quặng Trung: +20% sản lượng mỗi tierIndex.
Quặng Thượng: không tăng sản lượng theo tier.
```

Phân bổ:

```text
Quặng Hạ/Vụn:
70% HNT
30% VNT

Quặng Trung:
50% TNT
20% HNT
30% VNT

Quặng Thượng:
35% ThNT
25% TNT
10% HNT
30% VNT
```

#### Linh Thụ

Xuất hiện trong vùng nguyên tố dày đặc tương ứng.

Hồng Lôi Thụ:

```text
tier 1.7: 20%
tier 1.8: 30%
tier 1.9: 50%
tier 2.1: 100% nếu các tier trước chưa gặp và có vùng Lôi dày đặc
```

Xích Viêm Thụ:

```text
tier 1.4: 20%
tier 1.5: 30%
tier 1.6: 50%
tier 1.7: 100% nếu chưa ăn lần nào và có vùng Hỏa dày đặc
```

Phong Linh Thụ:

```text
Tỉ lệ như Xích Viêm Thụ nhưng yêu cầu vùng Phong dày đặc.
```

#### Vùng Nguyên Tố

Element:

```text
Hỏa, Mộc, Thủy, Thổ, Kim, Lôi, Huyết, Ánh Sáng, Phong, Hắc Ám
```

Quy tắc:

- Hắc Ám: 100%, xuất hiện ở một hoặc hai rìa map.
- Các element khác: mỗi lần roll có 11% cho từng element.
- Mỗi map có tối đa 4 vùng nguyên tố không tính Hắc Ám.
- Từ tier 2.1: cap vùng không-Hắc-Ám tăng lên 5.
- Từ tier 3.1: cap tăng lên 6.
- Vùng nguyên tố có thể trùng element nhiều lần.
- 1% còn lại là vùng cằn cỗi.

#### Truyền Tống Trận

Spawn:

```text
Random trái hoặc phải base.
Khoảng cách tối đa: 150 đơn vị từ base ở tier 1.1.
Mỗi tierIndex tăng khoảng cách cap thêm 5%.
```

Khi đưa base vào Truyền Tống Trận:

- Hoàn thành map.
- Trở về world map Vĩnh Dạ.
- Kết toán Nguyên Tinh theo base.
- Tài nguyên không chuyển đổi được giữ trong kho mode nếu luật cho phép, hoặc bỏ lại theo từng loại.

### 9.3. Module mới đề xuất

#### Oán Niệm Hố

Tags:

```text
oán, hắc ám, nguy hiểm, tài nguyên
```

Spawn:

```text
20% mỗi map từ tier 1.3 trở lên.
+3% mỗi tierIndex.
Ưu tiên gần vùng Hắc Ám hoặc chiến trường cũ.
```

Tương tác:

- Cử 1 nhân lực khai thác 2 giờ.
- Có thể nhận Oán Thạch.
- Có xác suất spawn Bạo Tạc Giả hoặc Oán Tượng.

Reward:

```text
50%: 2 Oán Thạch
25%: 3 Oán Thạch
10%: 1 Hư Không Thạch
15%: không có tài nguyên, spawn 1 Bạo Tạc Giả
```

#### Huyết Chủ Tế Đàn

Tags:

```text
huyết chủ, tín ngưỡng, trung lập, nguy hiểm
```

Spawn:

```text
15% mỗi map.
+5% nếu map có làng/cựu doanh trại.
Không spawn trong đêm đầu quá gần base.
```

Tương tác:

- Cầu nguyện 2 giờ: nhận Nguyện Thạch, nhưng tăng nguy cơ Tín Đồ Huyết Chủ xuất hiện.
- Phá hủy: nhận ít tài nguyên hơn, nhưng giảm spawn phe Huyết Chủ.

Reward khi cầu nguyện:

```text
60%: 1 Nguyện Thạch
20%: 1 Huyết Chủ Ấn Phiến
20%: spawn 1 Tế Tư Huyết Chủ
```

Reward khi phá:

```text
100%: 1 Oán Thạch
20%: 1 Huyết Chủ Ấn Phiến
```

#### Phế Tích Cơ Giới Quốc

Tags:

```text
cơ giới, công nghệ, hiếm, kiến trúc
```

Spawn:

```text
10% từ tier 1.4 trở lên.
+2% mỗi tierIndex.
Thương nhân có thể bán bản đồ dẫn tới module này.
```

Reward:

```text
40%: 1 Cơ Giới Linh Kiện
25%: 2 Cơ Giới Linh Kiện
20%: 1 Niệm Thạch
10%: 1 Huyền Minh Trọng Thủy
5%: spawn sự cố cơ giới
```

Dùng cho:

- Pháo Phòng Không.
- Trọng Lực Pháo.
- Đao Phủ cao cấp.

#### Dị Vực Trọng Lực

Tags:

```text
trọng lực, thủy, thổ, không gian, hiếm
```

Spawn:

```text
8% mỗi map.
+2% mỗi tierIndex.
Tăng mạnh nếu map có vùng Thủy và Thổ gần nhau.
```

Hiệu ứng địa hình:

```text
Sinh vật trọng lượng dưới 2 đi ngang bị giảm 50% tốc độ.
```

Reward:

```text
15% + 5% mỗi tierIndex trong cùng giai đoạn: 1 Huyền Minh Trọng Thủy
1% ban đầu: 1 Hư Không Thạch
+1% mỗi 10 đơn vị sinh vật đi ngang qua vùng
```

#### Trận Văn Đứt Gãy

Tags:

```text
trận pháp, phong ấn, không gian
```

Spawn:

```text
12% mỗi map.
Ưu tiên gần Truyền Tống Trận hoặc tàn tích.
```

Reward:

```text
50%: 1 Bụi Phong Ấn
20%: 2 Bụi Phong Ấn
10%: 1 Hư Không Thạch
20%: kích hoạt bẫy dịch chuyển nhỏ
```

#### Rừng Linh Mộc Bị Ô Nhiễm

Tags:

```text
mộc, hắc ám, linh mộc, nguy hiểm
```

Spawn:

```text
20% nếu map có vùng Mộc.
+10% nếu vùng Mộc chồng gần vùng Hắc Ám.
```

Reward:

```text
50%: 4 Linh Mộc
25%: 6 Linh Mộc
15%: 3 Linh Thảo
10%: spawn Người Bò Sát hoặc Chim Biến Dị
```

---

## 10. Chi phí xây và nâng kiến trúc

### 10.1. Ký hiệu

```text
DT = Dạ Thạch cùng tier map
HT = Hắc Thiết cùng tier map
HC = Hắc Cốt
OS = Oán Thạch cùng tier map
LM = Linh Mộc cùng tier map
LT = Linh Thảo cùng tier map
NTS = Nguyên Tố Thạch cùng tier map
NGT = Nguyện Thạch cùng tier map
HMTT = Huyền Minh Trọng Thủy cùng tier map
HKT = Hư Không Thạch cùng tier map
HNKT = Huyết Nhục Kết Tinh
LL = Long Lân cùng tier map
NT = Niệm Thạch
CGLK = Cơ Giới Linh Kiện
TPM = Tinh Phách Mờ
BPA = Bụi Phong Ấn
THVD = Tinh Hạch Vĩnh Dạ
HCAP = Huyết Chủ Ấn Phiến
```

### 10.2. Quy tắc chi phí

- Lượng vật liệu không scale theo tier.
- Vật liệu tier phải bằng tier map hoặc cao hơn.
- Có thể cho phép dùng vật liệu cao hơn tier thay thế vật liệu thấp hơn.
- Không cho dùng vật liệu thấp hơn tier để xây kiến trúc tier cao, trừ mô tả đặc biệt.
- Hắc Cốt, Niệm Thạch, Cơ Giới Linh Kiện không có tier nên dùng chung mọi tier.
- Huyết Nhục Kết Tinh thấp hơn map 1 tier nhỏ có thể dùng cho một số nâng cấp đặc biệt, như Hắc Động nhánh Vĩnh Trú.

### 10.3. Base Pha Lê

| Cấp | Chi phí đề xuất |
|---|---|
| Lv0 | miễn phí khi vào map, nhưng cưỡng chế mang 10 HNT đầu game |
| Lv1 | 4 DT + 4 HT |
| Lv2 | 8 DT + 6 HT + 1 HC |
| Lv3 Phòng thủ | 12 DT + 8 HT + 3 HC + 1 NGT |
| Lv3 Tấn công | 12 DT + 8 HT + 3 HC + 1 OS |
| Lv4 | 16 DT + 12 HT + 4 HC + 1 BPA |
| Lv5 | 24 DT + 16 HT + 6 HC + 1 HNKT |
| Lv6 | 30 DT + 20 HT + 8 HC + 2 HNKT + 1 THVD |

Ghi chú:

- Lv5 bắt đầu yêu cầu Huyết Nhục Kết Tinh để buộc player phải tham gia phong ấn/boss.
- Lv6 là cấp cuối mạnh, yêu cầu Tinh Hạch Vĩnh Dạ.

### 10.4. Tường Lãnh Địa

| Cấp | Chi phí đề xuất |
|---|---|
| Xây Lv1 | 4 HT + 2 DT |
| Lv2 | 6 HT + 3 DT |
| Lv3 Gai Nhọn | 8 HT + 4 DT + 2 HC |
| Lv3 Trơn Tuột | 6 HT + 4 DT + 1 HMTT |
| Lv3 Phản Chấn | 8 HT + 4 DT + 1 OS |
| Lv4 | 10 HT + 6 DT + 3 HC |
| Lv5 Sinh Hóa | 12 HT + 8 DT + 4 HC + 2 LM + 1 HNKT |
| Lv5 Nguyền Rủa | 10 HT + 8 DT + 4 HC + 4 OS |
| Lv5 Liên Kết | 10 HT + 8 DT + 3 HC + 1 HKT + 1 BPA |
| Lv6 | 16 HT + 10 DT + 5 HC + 1 THVD |

### 10.5. Tháp Canh

| Cấp | Chi phí đề xuất |
|---|---|
| Xây Lv1 | 6 HT + 3 DT |
| Lv2 | 5 HT + 3 DT |
| Lv3 | 8 HT + 5 DT + 1 HC |
| Lv4 | 10 HT + 6 DT + 2 HC |
| Lv5 | 12 HT + 8 DT + 3 HC + 1 NT |

### 10.6. Tháp Nguyên Tố

| Cấp | Chi phí đề xuất |
|---|---|
| Xây Lv1 | 5 HT + 3 DT + 1 NTS |
| Lv2 | 5 HT + 4 DT + 1 NTS |
| Lv3 | 8 HT + 5 DT + 2 NTS + 1 HC |
| Lv4 | 10 HT + 7 DT + 2 NTS + 2 HC + 1 Trượng Pháp Sư |
| Lv5 | 12 HT + 9 DT + 3 NTS + 3 HC + 2 Trượng Pháp Sư + 1 NT |

Ghi chú:

- Trượng Pháp Sư lấy từ Pháp Sư Hắc Ám.
- Nguyên Tố Thạch cùng element với tháp nếu hệ thống đã phân element; nếu chưa, dùng Nguyên Tố Thạch đa sắc.

### 10.7. Nhà Lính

| Cấp | Chi phí đề xuất |
|---|---|
| Xây Lv1 | 8 HT + 4 LM + 2 DT |
| Lv2 | 8 HT + 4 LM + 2 HC |
| Lv3 | 12 HT + 6 LM + 4 HC |
| Lv4 | 16 HT + 8 LM + 6 HC + 1 NT |
| Lv5 | 20 HT + 10 LM + 8 HC + 2 NT + 1 HNKT |
| Lv6 | 24 HT + 12 LM + 10 HC + 2 NT + 1 THVD |

### 10.8. Nhà Thờ

| Cấp | Chi phí đề xuất |
|---|---|
| Xây Lv1 | 4 HT + 4 DT + 1 NGT |
| Lv2 | 6 HT + 5 DT + 1 NGT + 1 HC |
| Lv3 | 8 HT + 6 DT + 2 NGT + 1 Áo Choàng Sứ Đồ |
| Lv4 | 10 HT + 8 DT + 3 NGT + 2 Áo Choàng Sứ Đồ + 1 HCAP |
| Lv5 | 12 HT + 10 DT + 4 NGT + 3 Áo Choàng Sứ Đồ + 2 HCAP + 1 HNKT |

### 10.9. Pháo Phòng Không

| Cấp | Chi phí đề xuất |
|---|---|
| Xây Lv1 | 8 HT + 4 DT + 1 CGLK |
| Lv2 | 8 HT + 5 DT + 1 CGLK |
| Lv3 Chất | 12 HT + 6 DT + 2 CGLK + 1 NT |
| Lv3 Lượng | 10 HT + 6 DT + 2 CGLK |
| Lv4 | 12 HT + 8 DT + 2 CGLK + 2 HC |
| Lv5 Liên Thanh | 16 HT + 10 DT + 3 CGLK + 2 NT |
| Lv5 Đồ Long | 18 HT + 10 DT + 4 CGLK + 1 LL |
| Lv6 | 24 HT + 12 DT + 5 CGLK + 2 LL + 1 THVD |

### 10.10. Trọng Lực Pháo

| Cấp | Chi phí đề xuất |
|---|---|
| Xây Lv1 | 8 HT + 4 DT + 1 HMTT + 1 CGLK |
| Lv2 | 10 HT + 6 DT + 1 HMTT + 1 CGLK |
| Lv3 | 12 HT + 8 DT + 2 HMTT + 2 CGLK |
| Lv4 Diệt Thần | 16 HT + 10 DT + 3 HMTT + 2 HKT + 1 LL |
| Lv4 Thanh Tràng | 14 HT + 10 DT + 2 HMTT + 1 HKT + 2 CGLK |
| Lv5 | 18 HT + 12 DT + 3 HMTT + 2 HKT + 1 THVD |
| Lv6 | 20 HT + 12 DT + 4 HMTT + 3 HKT + 2 THVD |

Cân bằng bổ sung cho Trọng Lực Pháo:

```text
Diệt Thần lv4:
- Không bắn boss bay 100m ngay lập tức.
- Boss/Oán Long chỉ bị kéo 25m tối đa và nhận 40% hiệu quả.
- Kẻ trọng lượng 4–5 bị bắn đi tối đa 35m, không phải 100m.
- Tốc độ bắn đi 15/s giữ được, nhưng clamp khoảng cách để không mất reward do bị bắn quá xa.
```

Lý do: nếu bắn boss quá xa, có thể phá encounter hoặc khiến trời sáng không nhận thưởng.

### 10.11. Đao Phủ

| Cấp | Chi phí đề xuất |
|---|---|
| Xây Lv1 | 6 HT + 4 DT + 1 NT |
| Lv2 | 8 HT + 5 DT + 1 NT |
| Lv3 Nguyên Tố Hóa | 10 HT + 6 DT + 1 NT + 1 NTS ngẫu nhiên |
| Lv3 Trảm Hồn | 10 HT + 6 DT + 2 NT + 2 TPM |
| Lv4 | 12 HT + 8 DT + 2 NT + 2 HC |
| Lv5 | 16 HT + 10 DT + 3 NT + 1 HKT |
| Lv6 | 20 HT + 12 DT + 4 NT + 1 THVD |

### 10.12. Bẫy dưới đất

| Bẫy | Chi phí xây | Chi phí nạp lại |
|---|---|---|
| Địa Lôi | 2 HT + 1 DT | 1 DT |
| Đầm Lầy | 2 LM + 1 HMTT | không cần, tồn tại theo thời gian |
| Địa Thứ | 3 HT + 1 OS | 1 HT |
| Hắc Động Lv1 | 3 HKT + 8 DT + 1 NT | 2 DT |
| Hắc Động Lv2 | 4 HKT + 10 DT + 2 NT | 3 DT |
| Hắc Động Lv3 Vĩnh Trú | 5 HKT + 10 DT + 1 HNKT thấp hơn map 1 tier nhỏ | 5 DT mỗi ngày |

### 10.13. Chuồng Ngựa

| Cấp | Chi phí đề xuất |
|---|---|
| Xây Lv1 | 6 LM + 3 LT + 2 HC |
| Lv2 | 8 LM + 4 LT + 3 HC |
| Lv3 | 10 LM + 6 LT + 4 HC + 1 NGT |
| Lv4 | 12 LM + 8 LT + 5 HC + 1 HMTT |
| Lv5 | 16 LM + 10 LT + 6 HC + 1 HNKT |
| Lv6 | 20 LM + 12 LT + 8 HC + 1 THVD |

### 10.14. Ụ Đá

| Cấp | Chi phí đề xuất |
|---|---|
| Xây Ụ Đá | 10 OS + 15 HT |
| Gia cố Ụ Đá | 5 OS + 10 HT + 2 HC |
| Chuyển thành module xây trên tường | 5 OS + 5 HT + 1 HKT |

Quy tắc:

- Ụ Đá tier nào chỉ xây được kiến trúc tier đó hoặc thấp hơn.
- Không cho xây kiến trúc tier cao hơn ụ đá.
- Ụ Đá không nên quá rẻ vì nó mở khả năng xây cụm công trình.

### 10.15. Truyền Tống Trận

| Cấp | Chi phí đề xuất |
|---|---|
| Mẫu trận tạm | 2 HKT + 4 BPA + 10 DT |
| Tử trận ở điểm đến | 3 HKT + 6 BPA + 15 DT + 1 NT |
| Trận hoàn chỉnh | 5 HKT + 10 BPA + 20 DT + 1 HNKT |
| Nâng ổn định | 3 HKT + 5 BPA + 1 THVD |

Quy tắc:

- Tier 2.x mới nên xây chủ động.
- Tier 1.x chủ yếu tìm Truyền Tống Trận có sẵn.
- Nếu rút lui khẩn cấp, tiêu hao thêm `1 HKT + 2 BPA` nếu có, nếu không thì tạo hậu quả Vĩnh Dạ truy kích.

---

## 11. Mục tiêu kinh tế theo giai đoạn

### 11.1. Map tier 1.1 đầu tiên

Mục tiêu:

- Player có thể xây base, 1 đoạn tường, 1 tháp cơ bản.
- Không thể nâng tất cả lên cấp cao.
- Nếu chơi tốt, cuối map có thể có:
  - Base lv2 hoặc lv3.
  - 1 tường lv3.
  - 1 tháp canh lv2–3 hoặc 1 tháp nguyên tố lv1–2.
  - Nhà thờ lv1 nếu có Nguyện Thạch.
  - Một ít tài nguyên dư để kết toán.

### 11.2. Tài nguyên đêm đầu

Với budget đêm 1 khoảng 10:

- Nên rơi khoảng 4–8 Dạ Thạch nếu player giết phần lớn quái.
- Có xác suất nhỏ nhận Hắc Cốt.
- Không nên rơi đủ để nâng base và tháp nhiều cấp ngay.
- Module ban ngày phải bổ sung phần thiếu.

### 11.3. Vai trò của module

- Quái cung cấp dòng tiền chiến đấu.
- Module cung cấp vật liệu chuyên dụng.
- Boss cung cấp vật liệu mở khóa cấp cao.
- Thương nhân là van xả Nguyên Tinh, giúp player đổi tiền lấy vật liệu thiếu nhưng không thay thế hoàn toàn khám phá.

### 11.4. Nút thắt tài nguyên

| Giai đoạn | Nút thắt chính |
|---|---|
| Early 1.1–1.3 | Hắc Thiết, Dạ Thạch, Hắc Cốt |
| Mid 1.4–1.6 | Nguyên Tố Thạch, Nguyện Thạch, Niệm Thạch |
| Late 1.7–1.9 | Hư Không Thạch, HMTT, Huyết Nhục Kết Tinh |
| Tier 2.x | Tinh Hạch Vĩnh Dạ, Long Lân, Cơ Giới Linh Kiện |
| Tier 3.x | Thần Tinh mảnh hoặc vật phẩm lore cực hiếm |

---

## 12. Thương nhân

### 12.1. Xuất hiện

```text
Mỗi 3 ngày có 1 lần roll.
70% xuất hiện nếu player đang ở phase ban ngày.
Không xuất hiện trong đêm trừ sự kiện đặc biệt.
```

Khi mở hub mua bán:

```text
Time scale = 50%
```

### 12.2. Tiền tệ nhận

Thương nhân chỉ nhận Nguyên Tinh cứng:

- HNT
- TNT
- ThNT

Không nhận Dạ Thạch thô nếu chưa tinh luyện.

### 12.3. Bảng hàng đề xuất

| Hàng | Giá đề xuất |
|---|---:|
| 5 Hắc Thiết cùng tier | 8 HNT × tierIndex |
| 3 Dạ Thạch cùng tier | 4 HNT × tierIndex |
| 1 Hắc Cốt | 10 HNT |
| 1 Nguyên Tố Thạch ngẫu nhiên | 45 HNT × tierIndex |
| 1 Nguyện Thạch | 25 HNT × tierIndex |
| 1 Niệm Thạch | 40 HNT |
| 1 Cơ Giới Linh Kiện | 30 HNT |
| 1 HMTT | 1.5 TNT × tierIndex |
| 1 Hư Không Thạch | 4 TNT × tierIndex |
| 1 Bụi Phong Ấn | 20 HNT |
| 1 Linh Thảo | 2 HNT × tierIndex |
| 1 Linh Mộc | 3 HNT × tierIndex |

Quy tắc:

- Giá thương nhân cao hơn giá quy đổi để tránh arbitrage.
- Thương nhân bán số lượng giới hạn.
- Hàng hiếm có thể không xuất hiện mỗi lần.
- Không bán Huyết Nhục Kết Tinh bắt buộc.
- Có thể bán Huyết Nhục Kết Tinh dư ở event đặc biệt nhưng rất hiếm.

---

## 13. Lore phe phái

### 13.1. Không chính nghĩa, không tà ác tuyệt đối

Mode này không chia phe theo thiện ác.

Các lực lượng chính:

```text
Huyết Quốc / Huyết Chủ:
- Có trật tự, có tín ngưỡng, có lợi ích chính trị.
- Có thể bảo vệ người sống nhưng cũng có thể biến phong ấn thành vũ khí.
- Tín đồ có thể giúp hoặc đánh player tùy tình huống.

Hắc Ám Chi Chủ / Vĩnh Dạ:
- Không đơn giản là ác.
- Là tồn tại mạnh bị phong ấn, tàn khu ảnh hưởng vô thức lên sinh vật.
- Nhiều kẻ không tự nguyện phục vụ, chỉ bị kéo vào bản năng thôn phệ.

Sinh vật trung lập / module:
- Đối địch hoặc trung lập dựa trên sinh tồn.
- Mạnh được yếu thua.
```

### 13.2. Tài nguyên phản ánh lore

- Nguyện Thạch không phải “thánh thiện”, mà là tín ngưỡng kết tinh.
- Dạ Thạch không phải “tà ác”, mà là aether Hắc Ám ngưng kết.
- Huyết Chủ Ấn Phiến không phải vật phẩm chính nghĩa, mà là dấu quyền lực.
- Hắc Cốt không phải xương ác, mà là vật chất bị aether Hắc Ám cải tạo.

---

## 14. Gợi ý triển khai code

### 14.1. Module tài nguyên

Tạo file mới nếu cần:

```text
src/vinh-da/economy/resources.ts
```

Nội dung:

```ts
export type VinhDaResourceId =
  | 'darkStone'
  | 'blackIron'
  | 'blackBone'
  | 'resentmentStone'
  | 'elementStone'
  | 'wishStone'
  | 'voidStone'
  | 'heavyWater'
  | 'mindStone'
  | 'machinePart'
  | 'sealDust'
  | 'nightCore'
  | 'fleshCrystal'
  | 'dragonScale'
  | 'spiritWood'
  | 'spiritHerb'
  | 'hazySoul'
  | 'bloodLordSigil';

export type TieredAmount = {
  resourceId: VinhDaResourceId;
  amount: number;
  tier?: string;
};
```

### 14.2. Module quy đổi

```text
src/vinh-da/economy/conversion.ts
```

Hàm chính:

```ts
getTierIndex(tier: VinhDaTier): number
getLiquidHntValue(resource: TieredAmount): number
getCondensedHntValue(resource: TieredAmount): number
settleBaseEssence(liquidHnt: number, harvestRate: number): CurrencyAmount
```

### 14.3. Module drop

```text
src/vinh-da/economy/dropTables.ts
```

Hàm:

```ts
rollIndependentPools(enemyId, tier, rng): TieredAmount[]
applyPrefixBonusDrops(enemy, drops, rng): TieredAmount[]
```

### 14.4. Module kiến trúc

```text
src/vinh-da/buildings/buildingCosts.ts
```

Dữ liệu:

```ts
buildingId
level
branch?
cost[]
requires?
```

### 14.5. Module tiền tố

```text
src/vinh-da/combat/prefixes.ts
```

Hàm:

```ts
applyCreaturePrefixPostRank(stats, prefix)
getPrefixThreatCostMultiplier(prefix)
rollCreaturePrefix(context, rng)
```

Không trộn tiền tố vào rank multiplier.

---

## 15. Checklist cân bằng cần test

- Đêm đầu có đủ tài nguyên để player xây 1–2 thứ, nhưng không snowball quá nhanh.
- Kẻ thù còn sống tới sáng không tạo reward.
- Một map tier cao cho ít đồ hơn về số lượng nhưng đồ giá trị cao hơn.
- Chi phí kiến trúc không phình số lượng theo tier.
- Dạ Thạch không trở thành tài nguyên duy nhất quyết định mọi thứ.
- Hắc Cốt không quá thiếu khiến mọi nâng cấp kẹt.
- Hư Không Thạch không xuất hiện quá sớm làm Truyền Tống Trận mất giá trị.
- Pháo Trọng Lực không bắn boss ra khỏi encounter.
- Tiền tố Anh Hùng không xuất hiện dày như quái thường.
- Thương nhân không tạo vòng mua rẻ bán đắt.
- Tỉ Lệ Thu Hoạch không nhân vật phẩm bắt buộc.
- Huyết Nhục Kết Tinh không bị farm vô hạn bằng rune.
