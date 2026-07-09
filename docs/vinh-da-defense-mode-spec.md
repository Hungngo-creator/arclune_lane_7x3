Trong mode này không có Prime.
để nhận được tiền nâng cấp kiến trúc cần giết kẻ thù, nếu kẻ thù không chết khi trời sáng, chúng sẽ bị ánh sáng thiêu đốt và nhận sát thương chuẩn = 25% max hp của chúng/s, bỏ qua hiệu quả của rune phục sinh và player không nhận được gì.
Quái nếu có rơi đồ thì mặc định rơi đồ cùng tier với bản thân của quái đó trừ phi mô tả đặc biệt.
tỉ lệ rơi đồ không tăng theo tier nhưng rune có thể, mỗi khi lên 1 tier tỉ lệ rơi đồ vẫn như mô tả trừ khi rune can thiệp, nhưng lên tier sẽ tăng tier của tài nguyên/vật phẩm nhận được.
tỉ lệ thu hoạch: 1 map bất kể tier không dùng rune thì tỉ lệ thu hoạch là x1, tức phần thưởng cuối cùng nhân với 1, nếu dùng rune sẽ tăng độ khó của map lên, nếu win map đó thì sẽ được nhận phần thưởng tăng hoặc giảm theo rune tương ứng.
# Vĩnh Dạ Defense Mode — Design Spec 0.1

> Tài liệu này ghi lại thiết kế mode thủ thành/sinh tồn đã chốt trong cuộc thảo luận. Mục tiêu là để một agent/dev không có ký ức cuộc chat có thể đọc và hiểu đủ nhanh để triển khai prototype. Không chỉnh `dist/app.js`; khi code cần tận dụng tối đa hàm/hệ thống sẵn có, tránh overhead và tránh tạo hàm khác tên nhưng trùng logic.

## 1. Tóm tắt mode

**Vĩnh Dạ Defense** là một mode 2D ngang lấy cảm hứng từ *Kingdom Two Crowns* và *Dungeon of the Endless*:

- Người chơi không phòng thủ bản thân vua, mà phòng thủ một **quả cầu pha lê/base**.
- Base vừa là nhà chính, vừa là công cụ phong ấn, vừa là nguồn buff trong phạm vi lãnh địa.
- Người chơi dựng trại, khám phá hai phía bản đồ, nâng cấp kiến trúc, sống sót qua Vĩnh Dạ, rồi hộ tống pha lê tới điểm phong ấn tiếp theo.
- Nhân vật/gacha/collection là core chung của game, nhưng khi vào mode này sẽ bị giới hạn theo tier/tu vi map để tránh phá cân bằng.
- Mode dùng tài nguyên hiếm để nâng cấp kiến trúc; nâng cấp không dễ, nên kiến trúc được phép mạnh nếu có điều kiện đầu tư.

## 2. Lore nền

**Vĩnh Dạ** là ô nhiễm do tàn khu của phân thân **Hắc Ám Chi Chủ** tạo ra.

- Hắc Ám Chi Chủ không chết hoàn toàn, mà bị chia nhỏ và phong ấn.
- Sau vạn năm, phong ấn suy yếu, rò rỉ ô nhiễm ra môi trường.
- Sinh vật xung quanh bị ô nhiễm sẽ vặn vẹo, bạo ngược, căm ghét mọi sinh vật sống.
- Nhân vật chính được vua của Huyết Quốc phái đi phong ấn các tàn khu huyết nhục của phân thân Hắc Ám Chi Chủ để triệt tiêu ô nhiễm.
- Có thể tồn tại âm mưu phía sau nhiệm vụ này, ví dụ Huyết Quốc muốn biến tàn khu phong ấn thành vũ khí. Phần này để mở cho lore sau.

## 3. Core loop theo phase

Một map/điểm phong ấn vận hành theo 5 phase chính:

1. **Dựng trại**
   - Đặt base pha lê.
   - Xây/nâng tường, tháp canh, tháp nguyên tố, nhà lính, nhà thờ và các kiến trúc khác.
2. **Khám phá hai bên**
   - Cử leader/lính/nhân vật đi trái hoặc phải.
   - Tìm tài nguyên, dân/lính, điểm xây dựng, nguy cơ Vĩnh Dạ, đường tới tàn khu phong ấn.
3. **Vĩnh Dạ tấn công**
   - Quái từ ngoài lãnh địa tràn vào.
   - Có thể xuất hiện ô nhiễm, nội gián, bạo tạc, chỉ huy Sứ Đồ, v.v.
4. **Mở đường chuyển pha lê**
   - Khi đủ điều kiện, mở đường tới tàn khu hoặc điểm phong ấn kế tiếp.
5. **Hộ tống pha lê**
   - Base pha lê rời vị trí cũ.
   - Player hộ tống pha lê tới điểm phong ấn tiếp theo.
   - Khi phong ấn thành công, vùng cũ an toàn hơn và Vĩnh Dạ rút lui khỏi khu đó.

## 4. Thời gian trong game

- Một ngày trong game kéo dài khoảng **5 phút real-time**.
- Thời gian cầu nguyện/xây dựng/sửa chữa dùng đơn vị giờ trong lore, nhưng khi code cần quy đổi sang real-time theo bảng cân bằng riêng.
- Gợi ý quy đổi ban đầu: **1 giờ lore = 10 giây gameplay**, có thể chỉnh sau khi test.

## 5. Tu vi map, tier và scale chỉ số

### 5.1. Cảnh giới và tier

Game có các đại/tiểu cảnh giới như **Khai Nguyên**, **Trúc Cơ**, và nhiều cảnh giới cao hơn tới **Thánh Tôn**.

Để dễ code và cân bằng, mỗi tiểu cảnh giới có thể ánh xạ thành tier số:

- `tier 1.1` = Khai Nguyên 1
- `tier 1.2` = Khai Nguyên 2
- `tier 1.3` = Khai Nguyên 3
- `tier 2.1` = Trúc Cơ 1
- ...

Tên cảnh giới dùng cho UI/lore; tier số dùng cho logic. sau mỗi tier nhỏ chỉ số nhân vật/ sát thương kiến trúc + x1/tier dựa theo tier 1,1 trừ các mô tả buff %, tức tier 1.1 là x1, 1.2 là x2, 1.3 là x3, 1.9 là x9 của tier 1.1 là 900%.

### 5.2. Map tu vi cố định

- Mỗi map có một tu vi/tier cố định.
- Nếu map là Khai Nguyên 3 thì NPC, creep, kẻ thù, lãnh đạo, lính và nhân vật tham chiến đều bị giới hạn/quy đổi theo Khai Nguyên 3.
- Khác biệt sức mạnh trong cùng một map chủ yếu đến từ **rank**, kit, số lượng, kiến trúc, tài nguyên và lựa chọn chiến thuật.
- Nhân vật từ collection khi vào map sẽ bị giới hạn tu vi theo tier map đó.

### 5.3. Quy tắc scale

Mọi mô tả stat trong tài liệu này là chuẩn **Khai Nguyên 1**.

Khi vào map tu vi cao hơn:

- HP tăng theo hệ số tu vi/tier map.
- ATK/WIL tăng theo hệ số tu vi/tier map.
- ARM/RES **không nên tăng phẳng vô hạn theo kiểu +20 ARM/RES chặn sạch damage**, vì sẽ làm kẹt sát thương ở cảnh giới cao.
- Tốc độ di chuyển không tăng theo tu vi map.
- Cooldown không tăng theo tu vi map.
- Tầm bắn không tăng theo tu vi map.
- Các buff dạng phần trăm không tăng theo tu vi map.

### 5.4. ARM/RES chọn cách B: giảm theo phần trăm

Chốt dùng cách B: ARM/RES nên giảm sát thương theo phần trăm hoặc theo công thức chống scale vô hạn, không dùng giảm phẳng 1 ARM = -1 damage cho toàn bộ game dài hạn.

Gợi ý công thức ban đầu:

```text
DamageTaken = RawDamage * 100 / (100 + DefenseValue)
```

Trong đó:

- `DefenseValue` là ARM khi nhận ATK damage.
- `DefenseValue` là RES khi nhận WIL damage.
- Damage hỗn hợp cần tách thành phần ATK/WIL rồi tính từng phần.

Ví dụ:

```text
100 ATK damage đánh vào 20 ARM:
100 * 100 / (100 + 20) = 83.33 damage
```

Như vậy 20 ARM/RES không thể triệt tiêu hoàn toàn sát thương, chỉ giảm khoảng 16.67% theo công thức trên. Công thức này giúp game còn scale được qua Khai Nguyên, Trúc Cơ và các cảnh giới cao hơn.

Nếu sau này muốn armor/res mạnh hơn ở early game, có thể chỉnh hệ số:

```text
DamageTaken = RawDamage * 100 / (100 + DefenseValue * K)
```

với `K` là hệ số cân bằng mode.

## 6. Lãnh đạo lãnh địa

- **Lãnh đạo lãnh địa** là 1 nhân vật được chọn trước khi vào map.
- Chỉ một người nhận buff “lãnh đạo”.
- Nếu lãnh đạo chết thì hết game/run của map đó và người chơi phải chơi lại hoặc rút lui theo hệ thống truyền tống nếu đủ điều kiện.
- Leader là mục tiêu quan trọng nhất sau base pha lê.

## 7. Base pha lê

### 7.1. Vai trò

Base là quả cầu pha lê cần phòng thủ, có thể gọi là:

- Huyết Tinh Phong Ấn
- Pha Lê Huyết Ấn

Base có các vai trò:

- Nhà chính của lãnh địa.
- Nguồn buff trong phạm vi tường lãnh địa.
- Công cụ phong ấn tàn khu huyết nhục của phân thân Hắc Ám Chi Chủ.
- Vật thể cần hộ tống khi chuyển sang điểm phong ấn tiếp theo.

### 7.2. Phạm vi buff base

- Buff của base chỉ có tác dụng trong phạm vi **tường lãnh địa**.
- Ra khỏi lãnh địa thì không nhận buff base.
- Nếu tường bị phá, phạm vi lãnh địa có thể co lại theo kiến trúc phòng thủ còn tồn tại.

### 7.3. Nâng cấp base

Tất cả chỉ số dưới đây là chuẩn Khai Nguyên 1. Khi vào map tier cao hơn thì HP/ATK/WIL/ARM/RES được scale theo tier, còn cooldown/tỉ lệ/tầm ảnh hưởng không scale nếu không nói khác.

Tỉ lệ scale: mỗi khi tăng 1 tier nhỏ, tăng 100% hiệu quả buff và chỉ số của base trừ các buff tỉ lệ phần trăm, ví dụ như 4 gạch đầu dòng của mô tả lv 6 base thì chỉ có dòng hồi hp/s là được scale, 3 dòng còn lại giữ nguyên.
#### Base lv0

- 20 HP.
- ARM/RES: 2.
- Không có buff.
- Đây là trạng thái đầu game.

#### Base lv1

- 30 HP.
- ARM/RES: 3.
- Hồi 1 HP/s cho lãnh đạo trong phạm vi lãnh địa.
- Ghi đè hiệu quả lv0.

#### Base lv2

- 40 HP.
- ARM/RES: 4.
- Hồi 2 HP/s cho lãnh đạo trong phạm vi lãnh địa.
- Ghi đè hiệu quả lv1.

#### Base lv3 — chọn nhánh

Lv3 ghi đè hiệu quả lv2 và yêu cầu chọn 1 trong 2 nhánh.

**Nhánh Phòng thủ:**

- 55 HP.
- ARM/RES: 7.
- Hồi 4 HP/s cho lãnh đạo trong lãnh địa.
- Hồi 1 HP/s cho mọi đồng minh khác trong lãnh địa.

**Nhánh Tấn công:**

- 50 HP.
- ARM/RES: 5.
- Hồi 3 HP/s cho lãnh đạo trong lãnh địa.
- +2 ATK cho mọi đồng minh của lãnh địa trong phạm vi lãnh địa kể cả leader.

#### Base lv4

Lv4 cộng thêm trên cơ sở nhánh đã chọn ở lv3, không ghi đè nhánh lv3.

- +10 HP.
- +2 ARM/RES.
- +1 HP/s cho mọi đồng minh của lãnh địa trong phạm vi lãnh địa kể cả leader.

#### Base lv5

Lv5 cộng thêm trên cơ sở lv4.

- +15 HP.
- +2 ARM/RES.
- Hồi 1% HP/s cho lãnh đạo trong lãnh địa. (dòng này và 2 dòng trên có scale khi lên tier map)
- Khi Vĩnh Dạ giáng lâm, base tạo khiên cho lãnh đạo có giá trị bằng 20% max HP của lãnh đạo. (dòng này và 3 dòng dưới không scale khi lên tier map)
- Khiên chỉ tạo 1 lần mỗi đêm.
- Khiên không cộng dồn nếu đêm kéo dài.
- Nếu khiên bị phá, khiên không hồi lại trong cùng đêm.

#### Base lv6

Lv6 cộng thêm trên cơ sở lv5.

- Khi lãnh đạo HP dưới 12%, base lập tức hồi cho lãnh đạo 20% max HP của lãnh đạo.
- Khi kích hoạt, base mất HP bằng 10% max HP của base.
- Cooldown: 2 đêm; dùng xong đến đêm thứ 3 kể từ lúc dùng mới có thể kích hoạt lại.
- Mọi đồng minh trong lãnh địa +3 HP/s.

## 8. Tường lãnh địa

Tường là kiến trúc phòng thủ định nghĩa biên giới lãnh địa.

- Buff base chỉ áp dụng bên trong phạm vi tường.
- Tường chặn/giảm tốc địch và bảo vệ công trình phía trong.
- Nếu tường bị phá, kẻ địch có thể xâm nhập sâu hơn, và vùng nhận buff base có thể bị thu hẹp.
- Tường cần có nhiều cấp nâng cấp riêng, nhưng chỉ số cụ thể chưa chốt trong spec này.

### 8.1 nâng cấp tường (chuẩn Khai nguyên 1)

lv1: 15 hp, 1 res/arm, hồi 1 hp/s.
lv2: 25 hp, 2 res/arm, hồi 2 hp/s, ghi đè lv1.
lv3 có 3 lựa chọn nâng cấp.
Gai Nhọn: trên cơ sở lv 2, + 10 hp, 4 res/arm, hồi 2 hp/s, mọc gai nhọn, kẻ thù cận chiến đánh trúng gây sát thương chuẩn (bỏ qua res/arm, trực tiếp trừ hp) = 1 lên kẻ tấn công, tăng theo tier.
Trơn Tuột: trên cơ sở lv 2, + 5 hp, 3 res/arm, hồi 2 hp/s, khi nhận sát thương có 30% tỉ lệ giảm 80% sát thương nhận vào, kích hoạt 3s/lần/kẻ tấn công. Mỗi kẻ tấn công có cd riêng.
Phản Chấn: trên cơ sở lv 2, + 12 hp, 3 res/arm, hồi 2 hp/s, kẻ tấn công bị phản chấn, đánh vào sẽ lùi lại 2 mét, mỗi kẻ tấn công chỉ có thể bị phản chấn 3s/lần/mỗi kẻ. Mỗi kẻ có cd riêng.
lv 4: trên cơ sở lv 3, + 15 hp, hồi 5 hp/s, + 3 res/arm.
lv 5 có 3 lựa chọn nâng cấp.
Sinh Hoá: trên cơ sở lv 4, tăng thêm: 20 hp, + 5hp/s + 4 arm/res, mỗi 5s dùng xúc tu kéo lấy 3 mục tiêu ngẫu nhiên vào miệng, hồi hp = 100% hp còn lại của mục tiêu kéo lấy, over heal bị bỏ qua.
Nguyền Rủa: trên cơ sở lv 4, tăng thêm : 20 hp, + 3hp/s, + 3 res/arm, kẻ thù đánh vào tường này sẽ bị nguyền rủa, giảm 3% max hp của chúng/lần đánh, kích hoạt 3s/lần/ mỗi kẻ đánh trúng, mỗi kẻ đánh trúng có cd riêng.
Liên Kết: trên cở sở đã có ở lv 4, + 10 hp/s, liên kết với tường gần nhất nằm ngoài cùng lãnh địa, chia sẻ 50% hp regen cho tường được liên kết, cũng tăng hp cho tường được liên kết = 20% mx hp của bản thân.
lv 6: giữ vững hiệu ứng từ lv 5, có thể xây 1 kiến trúc trên tường.

## 9. Tháp canh

### 9.1. Quy tắc chung

- Tầm bắn: 150 mét.
- Tầm bắn không tăng theo tu vi map.
- Sát thương chia đều ATK và WIL: 50% ATK, 50% WIL.
- Dùng để xử lý nhiều mục tiêu ổn định, là tháp vật lý/pháp hỗn hợp cơ bản.
- Tốc độ tên bay: 8.0.

### 9.2. Cấp tháp canh

#### Lv1

- Tấn công 1 kẻ địch.
- Gây 2 sát thương.
- CD 1s.

#### Lv2

- Tấn công 1 kẻ địch.
- Gây 3 sát thương.
- CD 1s.

#### Lv3

- Tấn công 2 kẻ địch.
- Gây 3 sát thương/kẻ.
- CD 1s.

#### Lv4

- Tấn công 3 kẻ địch.
- Gây 4 sát thương/kẻ.
- CD 1s.

#### Lv5

- Tấn công 4 kẻ địch.
- Gây 5 sát thương/kẻ.
- CD 5s.

## 10. Tháp nguyên tố

### 10.1. Quy tắc chung

- Tầm bắn: 100 mét.
- Tầm bắn không tăng theo tu vi map.
- Sát thương gây ra là 80% WIL và 20% ATK.
- Khi xây cần chọn đúng 1 nguyên tố.
- Một tháp nguyên tố chỉ có 1 element, không đổi element trong combat trừ khi sau này có cơ chế riêng.
- Hai tháp nguyên tố không được xây quá gần nhau; mode theo tinh thần *Kingdom Two Crowns*, không phải spam tháp dày như *Dungeon Warfare*.
- Buff/tỉ lệ phần trăm của tháp nguyên tố không tăng theo tu vi map.
- Tốc độ đạn năng lượng: 6.0.
- Một kẻ địch chỉ nhận tối đa 1 lần sát thương nổ từ cùng một volley.

### 10.2. Element được phép chọn

Dùng các element:

- Hỏa
- Mộc
- Thủy
- Thổ
- Kim
- Lôi
- Huyết
- Ánh Sáng
- Phong

Không dùng:

- Bóng Tối, vì Vĩnh Dạ thuộc phe bóng tối/Hắc Ám Chi Chủ.
- Vô hệ, vì vô hệ không phải element xây tháp trong mode này.

### 10.3. Hiệu ứng element

#### Hỏa

- Thiêu đốt kẻ địch bằng 20% sát thương gây ra sau khi trúng đòn.

#### Mộc

- Hồi HP cho mọi đơn vị đồng minh trong tầm bằng 5% sát thương gây ra.

#### Thủy

- Đồng minh trong tầm nhận +12% hiệu quả hồi phục.

#### Thổ

- Đồng minh trong tầm nhận +7% ARM/RES.

#### Kim

- Đồng minh trong tầm nhận +5% ATK/WIL.

#### Lôi

- Mục tiêu bị tháp nguyên tố Lôi đánh trúng bị Tê Liệt 0.75s.
- Cùng một mục tiêu chỉ có thể bị Tê Liệt bởi hiệu ứng này mỗi 4s.

#### Huyết

- Tăng HP tối đa cho đồng minh trong tầm dựa theo 3% sát thương tháp Huyết gây ra.
- mỗi đơn vị nhận cap tăng mx hp từ tháp huyết = 50% max hp của bản thân đơn vị đó, hiệu ứng tăng max hp này sẽ biến mất nếu nhân vật/leader rời map, chuyển đến map khác cần stack lại.

#### Ánh Sáng

- Tăng 10% sát thương tháp nguyên tố Ánh Sáng gây ra.
- Có thể dùng làm counter mềm với Vĩnh Dạ/Ô nhiễm ở các bản sau.

#### Phong

- Đòn đánh của tháp Phong gây **Gió Cắt** lên mục tiêu trong 2s.
- Gió Cắt giảm 10% tốc độ di chuyển của mục tiêu.
- Nếu mục tiêu đã bị làm chậm, tháp Phong ưu tiên đẩy lùi nhẹ thay vì cộng slow vô hạn.
- Cùng một mục tiêu chỉ bị đẩy lùi bởi tháp Phong mỗi 3s.

Phong đóng vai trò kiểm soát vị trí nhẹ, khác với Lôi là khống chế cứng ngắn.

### 10.4. Cấp tháp nguyên tố

#### Lv1

- Gây 2 sát thương lên 1 mục tiêu.
- CD 2s.

#### Lv2

- Gây 4 sát thương lên 1 mục tiêu.
- CD 1.8s.

#### Lv3

- Gây 4 sát thương lên 2 mục tiêu.
- CD 1.6s.

#### Lv4

- Gây 5 sát thương lên 2 mục tiêu.
- Sau đó mỗi mục tiêu trúng đạn phát nổ, gây sát thương lên tối đa 3 kẻ địch gần nhất đứng gần mục tiêu đó.
- Mỗi kẻ bị nổ đánh trúng nhận 1 sát thương.
- Trên lý thuyết, nếu không trùng mục tiêu, có thể gây sát thương lên tối đa 8 kẻ địch.
- CD 1.5s.
- Một kẻ địch chỉ nhận tối đa 1 lần sát thương nổ từ cùng volley.

#### Lv5

- Gây 7 sát thương lên 3 mục tiêu.
- Phần phát nổ như lv4 nhưng tăng phạm vi nổ.
- Mỗi mục tiêu trúng đạn có thể nổ trúng tối đa 5 kẻ địch gần đó.
- Mỗi kẻ bị nổ nhận 2.5 sát thương.
- Trên lý thuyết, nếu không trùng mục tiêu, có thể gây sát thương lên tối đa 18 kẻ địch.
- CD 3s.
- Một kẻ địch chỉ nhận tối đa 1 lần sát thương nổ từ cùng volley.

## 11. Nhà lính

### 11.1. Vai trò

Nhà lính là nơi chiêu mộ binh chủng/nhân vật phòng thủ.

- Tu vi đơn vị được giới hạn theo tu vi map.
- Rank có thể nâng cấp.
- Trong mode này, thanh rage bị ẩn; khi rage đầy thì đơn vị tự dùng ultimate nếu được phép.

### 11.2. Cấp nhà lính

#### Lv1

- Chiêu mộ 2 lính gác rank N.
- Dùng kit từ ý tưởng nhân vật v1 mục 14.
- Có thể dùng skill.
- Không có thanh rage và không thể ultimate.

#### Lv2

- Chiêu mộ 2 lính gác rank R.
- Vẫn dùng kit lính gác từ ý tưởng nhân vật v1 mục 14.
- Không thể ultimate.

#### Lv3

- Chiêu mộ 3 lính gác rank SR.
- Vẫn dùng kit lính gác từ ý tưởng nhân vật v1 mục 14.
- Có thể ultimate nếu rage đầy.

#### Lv4

- Chiêu mộ 3 nhân vật rank SSR bất kỳ mà player có trong collection.
- Nhân vật bị giới hạn/quy đổi tu vi theo tier map.
- Có thể dùng skill và ultimate.

#### Lv5

- Như lv4 nhưng dùng rank UR.
- 3 nhân vật.
- Nhân vật bị giới hạn/quy đổi tu vi theo tier map.

#### Lv6

- Như lv5 nhưng 4 nhân vật thay vì 3.

## 12. Nhà thờ

### 12.1. Vai trò

Nhà thờ là kiến trúc đặc biệt:

- Bày tỏ sự thánh kính với Huyết Chủ.
- Buff cho tín đồ trung thành.
- Tịnh hóa Ô nhiễm/Vĩnh Dạ.
- Buff từ nhà thờ có thể stack với mọi kiến trúc khác.
- Buff nhà thờ không biến mất khi nhân vật rời lãnh địa, nhưng chỉ áp dụng cho nhóm còn ở map/lãnh địa đó theo logic hiện tại.

Khi base dời sang map mới, nhà thờ cũ không còn buff cho nhóm đã rời đi. Những lính/NPC ở lại lãnh địa cũ vẫn giữ/nhận hiệu quả theo nhà thờ cũ.

### 12.2. Cấp nhà thờ

#### Lv1

- Tốn 3 tiếng cầu nguyện.
- +5% HP/RES/ARM.

#### Lv2

- Tốn 4 tiếng cầu nguyện.
- +50% hiệu quả từ lv1.

#### Lv3

- Tốn 6 tiếng cầu nguyện.
- Trên cơ sở buff từ lv2, thêm +5% ATK/WIL.

#### Lv4

- Tốn 10 tiếng cầu nguyện.
- Tăng gấp đôi hiệu quả lv3.

#### Lv5

- Tốn 18 tiếng cầu nguyện.
- Trên cơ sở lv4, thêm hồi 2% HP/s.
- Khi code/balance cần nhớ healing từ kiến trúc bị giới hạn bởi healing cap ở mục 15.

### 12.3. Xóa Ô nhiễm

- Ô nhiễm cần nhà thờ để xóa.
- Cầu nguyện xóa Ô nhiễm tốn 2 tiếng.
- Đây là counter chính của Chó Điên, Sứ Đồ Nội Gián và Vĩnh Dạ.

## 13. Truyền tống trận và rút lui chiến thuật

### 13.1. Lý do cần truyền tống trận

Sau khi phong ấn thành công một phần huyết nhục của phân thân Hắc Ám Chi Chủ:

- Base sẽ dời tới vùng/map mới có tu vi cao hơn.
- Nhà lính, nhà thờ và phần lớn công trình cũ bị bỏ lại.
- Main/leader chỉ dẫn theo một số lính nhất định.
- Các nhân vật từ collection được triển khai tại lãnh địa cũ có thể ở lại lãnh địa cũ.
- Vĩnh Dạ tại vùng cũ rút lui vì tàn khu đã bị phong ấn, vùng đó trở nên an toàn hơn.

Để tránh kẹt progression ở map mới, cần có **truyền tống trận**.

### 13.2. Chức năng truyền tống trận

- Cho phép player quay về vùng đã phong ấn huyết nhục.
- Nếu map mới quá khó, player có thể về map cũ để phát triển, farm tài nguyên, nâng cấp, chuẩn bị lại.
- Có thể quay lại map mới sau khi đã chuẩn bị.

### 13.3. Rút lui khẩn cấp

Khi nguy cấp ở map mới, player có thể kích hoạt truyền tống trận để đưa leader và base về map cũ đã phong ấn thành công.

Đổi lại:

- Sau 3 ngày, Vĩnh Dạ sẽ giáng lâm vào map cũ.
- Lý do lore: ở map mới, bọn Vĩnh Dạ hấp thu lính/tài nguyên mà leader bỏ lại, sau đó truy kích qua dấu vết truyền tống.
- Kẻ địch Vĩnh Dạ từ map mới kéo qua **giữ tier/tu vi của map mới**, không bị hạ xuống tier map cũ.
- Điều này giúp cân bằng: nếu giới hạn chúng theo tier map cũ thì leader đã thắng map cũ một lần sẽ quá dễ phòng thủ.
- Kiến trúc map cũ vẫn là tier/cấp của map cũ, nên rút lui là phương án sống còn nhưng có rủi ro cao.

## 14. Kẻ thù và Ô nhiễm

### 14.1. Rank/tier kẻ thù

Kẻ thù cũng có rank như N/R/SR/SSR/UR hoặc hệ rank tương đương.

- Có thể dùng rank multiplier chung của game nếu đã có sẵn.
- Rank ảnh hưởng stat và có thể ảnh hưởng kit.
- Ví dụ Sứ Đồ SR và Sứ Đồ SSR không chỉ khác số máu/sát thương, mà hiệu ứng kit cũng có thể chênh lệch.
- Tu vi của kẻ thù bị giới hạn theo tier map, nhưng rank làm chúng mạnh/yếu khác nhau trong cùng tier.

### 14.2. Kẻ vặn vẹo

Mô tả:

- Bị lực lượng hắc ám ăn mòn.
- Tay chân lở loét.
- Thỉnh thoảng nói mớ, gào thét.
- Trọng lượng: 1.
- khi tử vong có 40%/20% tỉ lệ rơi 1/2 Dạ Thạch cùng tier, 40% còn lại không rơi gì.
- 10%/5% tỉ lệ rơi 1/2 Hắc Cốt, 85% còn lại không rơi gì.
- bộ tỉ lệ Hắc Cốt và Dạ Thạch tính riêng, không gộp, tức nếu vận khi tốt thì có thể rơi cả 2 thứ cùng lúc, nếu không chỉ rơi 1 thứ hoặc không rơi gì.

Chỉ số chuẩn Khai Nguyên 1:

- HP: 3.
- RES/ARM/ATK/WIL: 1.
- Không ultimate.
- Không skill.
- Tốc độ di chuyển: 0.4/s.

Đánh thường:

- Cào 1 mục tiêu.
- Gây 100% ATK/WIL.
- CD 2.5s.

### 14.3. Người bò sát

Mô tả:

- Giai đoạn ăn mòn nặng hơn.
- Từ bỏ hình người.
- Chân biến dạng, tay có móng nhọn.
- Bò bằng 4 chi với tốc độ cao.
- Trọng lượng 0,9.
- khi tử vong có 30%/15%/3% tỉ lệ rơi 1/2/3 dạ thạch cùng tier với bản thân, 52% còn lại không rơi gì.

Chỉ số chuẩn Khai Nguyên 1:

- HP: 3.
- RES/ARM: 0.
- ATK/WIL: 1.
- Không ultimate.
- Không skill.
- Tốc độ di chuyển: 1/s.

Đánh thường:

- Cào 1 mục tiêu.
- Gây 100% ATK/WIL.
- CD 2s.
- Kèm debuff Chảy Máu.

Chảy Máu:

- Mất HP bằng 3% max HP/s trong 3s.
- Tối đa 5 stack/mục tiêu.
- Mỗi stack có cooldown/duration riêng.
- Stack mới không làm mới thời gian tồn tại của stack cũ.

### 14.4. Sứ Đồ

Mô tả:

- Kẻ cam chịu đọa lạc.
- Bề ngoài giống kẻ vặn vẹo nhưng thông minh và xảo trá hơn.
- Thích ẩn núp chỉ huy.
- Trọng lượng: 1.
- Khi tử vong 100% rơi 2 dạ thạch cùng tier bản thân, sau đó có 20% tỉ lệ rơi thêm 1 dạ thạch cùng tier với bản thân. Có 15% rơi vật phẩm "Áo choàng của Sứ Đồ": là vật phẩm cần thiết để nâng cấp Nhà thờ.
- Bộ tỉ lệ Dạ Thạch và Áo choàng là tính riêng.

Chỉ số chuẩn Khai Nguyên 1:

- HP: 5.
- RES/ARM/ATK/WIL: 2.
- Tốc độ di chuyển: 0.55/s.
- tốc độ đạn: 1.5/s

Aura chỉ huy:

- Đồng minh của Sứ Đồ trong phạm vi 15 mét nhận +5% ATK/WIL.
- Aura Sứ Đồ không stack với nhiều Sứ Đồ; chỉ lấy aura mạnh nhất hoặc nguồn ưu tiên cao nhất.

Đánh thường:

- Phun dịch thối rữa từ xa.
- Projectile speed: 1 m/s.
- Gây 100% ATK/WIL lên 1 mục tiêu.
- CD 3s.

### 14.5. Chó Điên

Mô tả:

- Chó sói bị ăn mòn.
- Sống theo bầy.
- Tốc độ di chuyển: 1.3/s
- Cắn xé gây Ô nhiễm.
- Có thể khiến kẻ thù chuyển hóa thành đồng minh của Vĩnh Dạ.
- Trọng lượng: 0,3.
- 20%/5% tỉ lệ rơi 1/2 dạ thạch, 75% còn lại không rơi gì.

Chỉ số chuẩn Khai Nguyên 1:

- HP: 1.5.
- ATK/WIL: 1.
- RES/ARM: 0.

Đánh thường:

- Lao về trước cắn mục tiêu.
- Gây 100% ATK/WIL lên 1 mục tiêu.
- CD 4s.
- Gây 1 stack Ô nhiễm lên mục tiêu.

Giới hạn Ô nhiễm:

- Cùng một mục tiêu chỉ nhận 1 stack Ô nhiễm từ nguồn cùng loại trong một khoảng thời gian X giây.
- X cần cân bằng khi test; gợi ý ban đầu 6–8s.

### 14.6. Ô nhiễm

Ô nhiễm là ăn mòn từ lực lượng thần bí thuộc Hắc Ám Chi Chủ/Vĩnh Dạ.

Quy tắc:

- Không thể xóa bằng cách bình thường.
- Tồn tại đến hết wave và kéo sang giai đoạn hậu wave nếu chưa tịnh hóa.
- Cần đến nhà thờ cầu nguyện 2 tiếng để xóa.
- Khi đạt 5 stack, mục tiêu sẽ chuyển hóa thành 1 Sứ Đồ sau wave nếu không được tịnh hóa kịp.
- Sứ Đồ chuyển hóa sẽ dựa theo ký ức cũ để tấn công base.
- Stack Ô nhiễm không phân biệt nguồn gây ra.
- Cách xóa chính là nhà thờ.
- Ô nhiễm không hiện stack cho player thấy.
- Hành vi kẻ bị ô nhiễm ban đầu vẫn có vẻ bình thường.
- Cách nhận biết chính là quan sát hành vi.
- Nếu chưa đủ 5 stack và còn là người, họ sẽ đến nhà thờ.
- Nếu đã chuyển hóa thành Sứ Đồ, họ sẽ không đến nhà thờ; hết wave sẽ ẩn nấp và đánh lén base lúc lính phe player ngủ.

### 14.7. Bạo Tạc Giả

Mô tả:

- Mất lý trí.
- Muốn hủy diệt mọi thứ.
- Ngoại hình lở loét, dòi bọ khắp người, hơi thở hôi thối.
- Trọng lượng: 1,5.
- tốc độ: 0.45.
- 10% tỉ lệ rơi 1 dạ thạch, 90% không rơi gì.

Chỉ số chuẩn Khai Nguyên 1:

- HP: 2.
- RES/ATK/ARM/WIL: 2.

Hiệu ứng chết:

- Khi chết, Bạo Tạc gây 200% WIL/ATK trong bán kính 5 mét.
- Sát thương bạo tạc không tăng theo tu vi map.
- Bạo tạc gây damage cả hai phe.
- Đánh thường: cào, gây sát thương = 100% wil/atk, gây 1 stack ô nhiễm, cap như chó điên, cd 3s.
## 15. Healing cap

Để tránh base + nhà thờ + mộc + thủy + các kiến trúc khác làm đơn vị bất tử:

- Healing từ kiến trúc bị giới hạn tối đa 8% max HP/s mỗi đơn vị.
- Healing cap chỉ áp dụng cho hồi phục từ kiến trúc.
- Không tính kỹ năng chủ động của nhân vật vào giới hạn này, trừ khi sau này cần nerf.

## 16. Xây dựng và tài nguyên

Chi phí chưa chốt cụ thể, nhưng nguyên tắc đã chốt:

- Nâng kiến trúc không dễ.
- Sẽ có nhiều vật liệu hiếm để nâng cấp kiến trúc.
- Vì chi phí cao, kiến trúc được phép có hiệu ứng mạnh.
- Mode cần buộc player chọn giữa nâng base, tường, tháp, nhà lính, nhà thờ, truyền tống trận và chuẩn bị hộ tống pha lê.

Gợi ý nhóm tài nguyên ban đầu:

- Vật liệu thường: xây tường/tháp cơ bản.
- Huyết Tinh/Linh Hạch: nâng base, tháp nguyên tố, nhà thờ, truyền tống trận.
- Nhân lực: xây, sửa, cầu nguyện, vận hành công trình.
- Vật liệu hiếm theo map: nâng cấp cao và mở đường phong ấn.

## 17. Nguyên tắc triển khai code

- Không chỉnh `dist/app.js`.
- Tận dụng tối đa hàm, data model và hệ thống mode sẵn có.
- Tránh overhead không cần thiết.
- Tránh tạo hàm khác tên nhưng trùng logic với helper có sẵn.
- Nên tách mode thành module/screen riêng, nhưng dùng chung core collection, rank, element, stat normalization nếu đã có.
- Logic simulation nên tách khỏi render để sau này có thể đổi từ text/simplified view sang 2D canvas/asset mà ít đụng core.
- Các công thức scale tier, rank multiplier, element normalization và damage calculation nên nằm ở helper dùng chung để các mode khác cũng tái sử dụng được.

## 18. Các điểm đã chốt quan trọng

- Base là pha lê, không phải vua.
- Leader được chọn trước map; leader chết là thua.
- Khiên base lv5 chỉ tạo 1 lần mỗi đêm, không cộng dồn, bị phá thì không hồi trong cùng đêm.
- Base lv6 hồi leader 20% max HP, base mất 10% max HP base, CD 2 đêm.
- Tháp canh lv5 CD 5s.
- Tháp nguyên tố chỉ chọn 1 element khi xây.
- Không xây 2 tháp nguyên tố quá gần nhau.
- Có Phong; không dùng Bóng Tối và Vô Hệ cho tháp nguyên tố.
- Lôi gây Tê Liệt 0.75s, cùng mục tiêu chỉ bị mỗi 4s.
- Một kẻ địch chỉ nhận tối đa 1 lần sát thương nổ từ cùng volley.
- Nhân vật collection vào map bị giới hạn theo tier/tu vi map.
- Nhà thờ cũ không buff cho nhóm đã dời sang map mới; chỉ còn tác dụng với người ở lại lãnh địa cũ.
- Có truyền tống trận để rút lui/quay lại vùng đã phong ấn.
- Nếu rút lui khẩn cấp từ map mới về map cũ, sau 3 ngày Vĩnh Dạ từ map mới có thể đánh sang với tier map mới.
- Một ngày trong game khoảng 5 phút.
- Kẻ thù có thể có rank; nên dùng rank multiplier chung nếu phù hợp.
- Sứ Đồ aura không stack và phạm vi aura là 15 mét.
- Cùng một mục tiêu chỉ nhận 1 stack Ô nhiễm mỗi X giây.
- Đạt 5 stack Ô nhiễm thì chuyển hóa sau wave nếu không tịnh hóa.
- Bạo Tạc Giả gây damage cả hai phe.
- Healing từ kiến trúc tối đa 8% max HP/s mỗi đơn vị.

## 19. Bổ sung từ người dùng. (đều chuẩn khai nguyên 1)

### kẻ thù: Chim Biến Dị
mô tả, một tập hợp xác thịt không rõ của các loại chim, một chimera vặn vẹo, huyết nhục nhiễu sóng.
chỉ số chuẩn Khai Nguyên 1: Hp 1,3, 0 res/arm, 1 atk/wil, di chuyển: 1.5/s l, phạm vi tấn công: 12.
sau khi thấy mục tiêu, gia tốc, tiếp cận mục tiêu gây sát thương = 2.5 wil/atk sau đó tử vong. tùy theo phạm vi tấn công mà sát thương gây ra sẽ thay đổi, nếu mục tiêu cách chim biến dị chỉ dưới hoặc bằng 6 thì chỉ nhận 1,2 sát thương, nếu dưới hoặc = 9 thì nhận 2 sát thương, 12 thì 2,5, dưới 3 sẽ không gia tốc, chim biến dị sẽ bay lùi lại, giữ khoảng cách 12 và bắt đầu gia tốc. Miễn kích hoạt gia tốc chì chim biến dị sau khi gây sát thương sẽ tử vong. Trọng lượng: 0,1.
bất kể khoảng cách gia tốc thì tốc độ bay khi gia tốc là 3.5
10% tỉ lệ rơi 1 dạ thạch, 5% rơi 1 Hắc Cốt, 85% không rơi gì. Bộ tỉ lệ Dạ thạch và hắc cốt tính riêng, hên thì rơi 1 hoặc 2 thứ, xui thì không rơi gì.


### pháp sư hắc ám:
không bị ô nhiễm, là người bình thường, một tín đồ của Hắc Ám Chi Chủ, dùng aether Hắc Ám nồng hậu bao phủ cơ thể, sẽ không bị binh chủng hắc ám khác tấn công.
HP: 3, atk/res/arm 1, 3,5 wil
đánh thường: ngưng tụ ma lực thành 1 quả cầu hắc ám sau lưng mỗi 2s, sau khi đạt 3 quả cầu, tấn công mục tiêu gây sát thương = 100% wil/atk/ mỗi quả cầu lên mục tiêu, sau tấn công cd 2s. Tốc độ đạn: 2
trọng lượng: 1. Tốc độ di chuyển: 0.5

40%/20%/10%/5% tỉ lệ rơi 2/3/4 dạ thạch, 25% còn lại không rơi gì.
mỗi pháp sư hắc ám có 60% tỉ lệ rơi 1 "Trượng Pháp Sư": là vật liệu cần thiết để nâng cấp Nguyên Tố Tháp. 10% tỉ lệ rơi 1 Hắc Cốt, 30% còn lại không rơi gì.
bộ tỉ lệ của (trượng pháp sư + Hắc Cốt) và dạ thạch là tính riêng.

### pháo phòng không:
một kiến trúc chuyên dụng tấn công kẻ thù trên không, tốc độ tấn công và đường đạn nhanh là đặc điểm ưu tú của nó, giá cả cũng đồng dạng ưu tú hơn kiến trúc khác.

Tầm bắn phẳng: Tăng tiến theo cấp độ: 10.0 (Lv1) ➔ 15.0 (Lv2) ➔ 20.0/21.0 (Lv3) ➔ 23.0 (Lv4) ➔ 26.0 (Lv5). Tầm bắn giữ nguyên không đổi ở Lv6. 

lv 1: gây 0,7 sát thương lên 1 mục tiêu, tốc độ đạn bay: 12, cd 1s/phát bắn, sau 5 phát bắn cần cd 15s mới có thể bắn lần nữa (phần cd 20s không biến động theo tier).

lv 2: gây 1,1 sát thương lên 1 mục tiêu, tốc độ đạn bay: 12, cd 1,2s/phát, sau 6 phát cần cd 18s mới có thể bắn lần nữa (cd dài không biến động theo tier).

lv 3: có 2 lựa chọn nâng cấp.
Chất: gây 2,2 sát thương lên 1 mục tiêu, tốc độ đạn: 12, cd 1,6s/phát, sau 7 phát cần cd 24s mới có thể bắn lần nữa (cd dài không biến động theo tier).

Lượng: gây 1,5 sát thương lên 1 mục tiêu, tốc độ đạn: 12, cd 1,3s/phát, sau 5 phát cần cd 20s mới có thể bắn lần nữa (cd dài không biến động theo tier).

lv 4: trên cơ sở đã có ở lv 3, tăng 0, 3 sát thương, cd - 0,3s, thời gian đợi cd dài giảm 5s. (cd dài không biến động theo tier).

lv 5 có 2 lựa chọn nâng cấp:
Liên Thanh: trên cơ sở lv 4, +1 sát thương, cd - 1s, cd dài - 5s.

Đồ Long: trên cơ sở lv 4, + 3 sát thương, cd -0,3s, cd dài -2s.

lv 6: + 3 sát thương, cd -0,5, cd dài -5. Ở lv này pháo phòng không có thể bắn mục tiêu dưới mặt đất.

### Trọng lực pháo:
sản phẩm điên rồ từ Cơ Giới Quốc, khống chế mục tiêu mặt đất cực tốt. Đối mục tiêu trên không không có hiệu quả.

Bán kính hút: Quy đổi chuẩn từ mét sang hệ số: 0.5 (Lv1) ➔ 0.7 (Lv2) ➔ 0.9 (Lv3) ➔ 1.2 (Diệt Thần Lv4) / 2.0 (Thanh Tràng Lv4).
chỉ hất tung kẻ địch trong 1s bất kể lv pháo trọng lực.

lv 1: mỗi 15s, hút mọi mục tiêu trong bán kính 0.5, gây sát thương = 25% max hp của chúng, sau 3s, phóng chúng đi xa với tốc độ 10 mét/s, mục tiêu có trọng lượng là 1 15 tiếp đất, trọng lượng là 2 5 tiếp đất, trọng lượng là 3 không thể hút. Sau tiếp đất căn cứ trọng lượng gây sát thương, mỗi kẻ nhận 1 sát thương/1 trọng lượng, trọng lượng càng cao sát thương càng thấp.

lv 2: mỗi 10s, hút mọi mục tiêu trong bán kính 0.7 bất kể địch ta, gây sát thương = 30% max hp của chúng, sau 4s, phóng chúng đi xa với tốc độ 15 mét/s, mục tiêu có trọng lượng là 1 15 tiếp đất, trọng lượng là 2 7.5 tiếp đất, trọng lượng là 3 không thể hút. Sau tiếp đất căn cứ trọng lượng gây sát thương, mỗi kẻ nhận 1,5 sát thương/1 trọng lượng, trọng lượng càng cao sát thương càng thấp.

lv 3: mỗi 10s, hút mọi mục tiêu trong bán kính 0.9 bất kể địch ta, gây sát thương = 35% max hp của chúng, sau 5s, phóng chúng đi xa với tốc độ 20 mét/s, mục tiêu có trọng lượng là 1 15 tiếp đất, trọng lượng là 2 7,5 tiếp đất, trọng lượng là 3 3,5 tiếp đất, trọng lượng 4 không thể hút. Sau tiếp đất căn cứ trọng lượng gây sát thương, mỗi kẻ nhận 2 sát thương/1 trọng lượng, trọng lượng càng cao sát thương càng thấp.

lv 4 có 2 lựa chọn nâng cấp:
Diệt Thần: chỉ kích hoạt đối với kẻ có trọng lượng là 4 đến 5 trong bán kính 0.5, khi kích hoạt hút mọi kẻ có trọng lượng từ 4 đến 5 trong bán kính 1.2 về bản thân trong 5s, trong 5s đó cũng gây sát thương = 40% mx hp của chúng sau đó bắn đi với tốc độ 15/s, văng 100 mét sau đó vào cd 35s, theo mày tốc độ bay vầy có đúng chưa, tao thấy không cân bằng.

Thanh Tràng: khi xuất hiện kẻ có trọng lượng 1 trong bán kính 0.3, nạp năng lượng trong 10s, sau đó hút mọi kẻ có trọng lượng từ 1 đến 3 trong bán kính 2 về bản thân, mỗi kẻ nhận sát thương = 35% mx hp của chúng, bắn chúng đi với tốc độ 15/s, cd 25s.

lv 5: trên cơ sở lv 4, tăng sát thương gây ra lên kẻ địch thêm 10% max hp, cd - 5s.

lv 6: player có thể tắt/kích hoạt trọng lực pháo.

một khẩu súng không tệ, có điều coi chừng bắn xa quá trời sáng không có tiền đâu nha, bắn boss đi luôn thì húp cháo, nếu ngươi đủ giàu, nâng cái lv 6, đánh boss còn nửa mạng thì bật pháo liền xong chuyện, đương nhiên chi phí cũng không rẻ.

### Đao Phủ

từ khí aether tinh khiết ngưng tụ mà thành vô hệ lưỡi đao, lưỡi đao to lớn, ngưng tụ dài nhưng sát thương đồng dạng to lớn.

lv 1: nhưng tụ 1 lưỡi đao có trọng lượng 0.1, ngang 2 mét rộng 0,5 mét hình bán nguyệt, bay về phía mục tiêu với tốc độ bay: 1/s, gây 3 sát thương, bỏ qua res/arm dưới 1 của mục tiêu (sát thương chuẩn lên mục tiêu có res/arm = 1, nếu mục tiêu có 1 res 2 arm thì nhận 2 sát thương chuẩn)
cd 6s. Mỗi lưỡi đao chỉ chém trúng tối đa 5 mục tiêu, nếu tiếp xúc trên 5 mục tiêu thì gây sát thương lên 5 kẻ đứng gần đao nhất sau đó lưỡi đao năng lượng này sẽ biến mất.

lv 2: trên cơ sở lv 1, + 1/s tốc độ bay, + 2 sát thương, cd + 0,5s.

lv 3 có 2 lựa chọn:
Nguyên Tố Hoá: khi chọn nâng cấp này sẽ tiêu hao 1 loại Nguyên Tố Thạch cùng tier với kiến trúc này 1 cách ngẫu nhiên

#### sau đây là nhóm kiến trúc đặt dưới đất:
địa lôi: phát nổ sau 2s đạp trúng, không phân địch ta, gây sát thương chuẩn = 2.

đầm lầy: tạo 1 bãi đầm lầy, kẻ thù có trọng lượng là 1 đạp vào giảm 50% tốc độ di chuyển, là 2 đạp vào giảm 25% tốc độ di chuyển, trọng lượng 3 trở lên không có hiệu quả.

địa thứ: đạp bị cột sắt dưới đất đâm mạnh vào chân, giảm 50% tốc độ di chuyển trong 3s đồng thời gây chảy máu, gây sát thương = 3% max hp/s trong 3s đó, kích hoạt đối với kẻ có trọng lượng từ 1 đến 1,9, 2 trở lên và 0,9 trở xuống không kích hoạt.

Hắc Động: một trọng lực nguyên, vật vô hình, không có hp, không thể bị phá hủy theo cách thông thường.
khi đạp vào, trì hoãn trong 3s, sau 3s đó bắt đầu thôn phệ mọi thứ trong đường kính 3 đơn vị khoảng cách quanh bản thân, diệt sát mọi mục tiêu có hp dưới 5% (+1%/lv) max hp, bỏ qua hiệu quả rune Phục Sinh, nếu mục tiêu có hp trên 5% (+1%/lv) max hp của chúng, mỗi giây thôn phệ gây sát thương = 5% (+1%/lv) max hp của chúng, bất kể đồng minh/kẻ thù/nhân vật trung lập nào miễn có hp đứng trong 1 đơn vị khoảng cách ngoài đường kính 3 đơn vị khoảng cách của Hắc Động cũng bị giảm 30% (+10%/lv) tốc độ di chuyển (chỉ hoạt động khi kích hoạt thôn phệ). Đối mục tiêu phi hành miễn trong đường kính hiệu quả vẫn có tác dụng. Thời Gian thôn phệ:3s (+1s/lv), sau khi hết time thôn phệ lâm vào cd 5s.
lv 1: Chỉ dối mục tiêu có trọng lượng 1 trở xuống có hiệu quả.
lv 2: đối mục tiêu có trọng lượng 2 trở xuống có hiệu quả.
lv 3 có 2 nhánh lựa chọn:
Vĩnh Trú: Hắc động luôn kích hoạt thôn phệ, cd về 0, khi số lượng đơn vị bị hút đạt 40, bắn chúng về vị trí trước mặt chúng, nếu là vật thể đang bay, bắn chúng trên không, sau đó lâm vào cd 2s rồi lại kích hoạt hắc động.
yêu cầu nâng cấp: 5 Hư Không Thạch và 10 Dạ Thạch đồng tier với map, 1 Huyết Nhục Kết Tinh thấp hơn map 1 tier nhỏ (tức là nếu Huyết Nhục Kết Tinh từ map trước có dư có thể đem vào map sau để nâng cấp kiến trúc này).

### Chuồng Ngựa

từ Linh Mộc, Hắc Cốt tạo thành kiến trúc, nơi thú cưỡi của leader ở lại, thuận tiện đổi thú cưỡi, đồng thời hồi phục hp cũng như bảo vệ thú cưỡi và trồng trọt linh thảo làm thức ăn cho chúng.

### kẻ thù:
#### Thiết Hán:
biến dị nặng nề, một thợ mỏ bị bỏ lại lúc xập mỏ, xương cốt cứng rắn, bề ngoài bao phủ bởi kim loại không rõ, từ mỏ khoáng sản kết hợp với oán niệm mà thành mạnh mẽ sản phẩm.
chỉ số chuẩn Khai Nguyên 1:
Hp: 5,5, 3 res, 4 arm, atk/wil:2, tốc độ 0.3, trọng lượng: 2,8.
nội tại: mỗi 5s hồi 1 hp (x 2 ở Khai nguyên 2 là 5s hồi 2 hp, cứ thế mà suy ra khai nguyên 3 là x3, 5s hồi 3hp)
Đánh thường: gây sát thương= 100% wil/atk, cd 1,5s.

100% tỉ lệ rơi 2 Dạ thạch và 2 Hắc Thiết + 2 Hắc Cốt.
10% tỉ lệ nhận gấp đôi.

#### Oán Long:
một con rồng bị ô nhiễm, lý trí không còn, chỉ còn bản năng thôn phệ, sát lục hết thảy

chỉ số Tier 1.1: hp 15: 7 res/arm 6 atk, 8 wil, tốc độ 2.5/s lúc bay, 0.8/s lúc đi.
nội tại: hồi 3% max hp/2s, hp dưới 30% tăng 10% wil/atk. 
Phá Hủy: Sau khi đánh thường nếu trước mặt 3 mét có kiến trúc không phải tường, tấn công kiến trúc đó, sau số lv tương ứng bị oán long đánh thì kiến trúc đó sẽ hư hại không thể sửa nhưng có thể xây kiến trúc khác, cd 10s. ví dụ kiến trúc lv 5 thì sau 5 cái bị đánh kiến trúc đó sẽ hư.
đánh thường: phun long tức, gây sát thương= 100% wil/atk, long tức tấn công aoe bất kể địch ta trong 5 mét bán nguyệt trước mặt Oán Long. cd 5s


ultimate: gầm thét, gây sát thương và hiệu ứng như đánh thường nhưng sát thương gấp đôi, sát thương từ ultimate này áp dụng nội tại Phá Hủy.

trọng lượng: 4.

100% rơi 10 Dạ Thạch + 5 Hắc Cốt và 1 Huyết Nhục Kết Tinh + 5 Long Lân.

Có 5% tỉ lệ rơi thêm 2 Dạ Thạch + 1 Huyết Nhục Kết Tinh.

Long Lân: Tài nguyên nâng cấp kiến trúc, biến động theo tier của vật chủ.

### tài nguyên:
Vụn Nguyên Tinh, Hạ Nguyên Tinh, 1 hnt = 100 vnt. Trung Nguyên Tinh, Thượng Nguyên Tinh, 1 tnt = 100 hnt, 1 ThNT = 100 TNT, còn Thần Tinh nữa nhưng theo lore chắc khó xuất hiện, trừ phi phong ấn được lượng huyết nhục nhất định.
#### Niệm Thạch:
Từ ý thức, tinh hồn ngưng luyện mà thành, chi phí chế tạo không thấp, khó xuất hiện trong tự nhiên.
Nguyên liệu cần thiết để chế tạo kiến trúc Đao Phủ, không có tier cố định.

#### Dạ Thạch:
Từ khí aether hệ hắc ám ngưng kết mà thành, đa số kẻ thù đều rơi ra thứ này, base là thứ có thể chắt lọc mọi thứ thành Nguyên Tinh, các loại nguyên tinh cũng là tiền tệ chính trong game, mỗi đêm sau khi giết xong kẻ thù thì cần thu nhặt Dạ Thạch rơi trên đất, đem về base để chắt lọc năng lượng. tier vật liệu biến đổi theo tier map.
1 Dạ Thạch = 0,9 Hạ Nguyên Tinh do qua trình chắt lọc base cần năng lượng nên lấy phần 0,1 còn lại.
Sau đó từ dạng lỏng, ngưng tụ Nguyên Tinh thành dạng đặc lại tốn 10% của 0.9 đó mới ngưng tụ ra Hạ Nguyên Tinh, nếu để trong base không ngưng tụ thì có thể nhưng tụ ra hạng Nguyên Tinh cao cấp hơn trừ Thần Tinh. Nếu base được dời đi, phần năng lượng chưa rút ra sẽ được giữ nguyên trong base, base mỗi ngày tiêu hao 5 HNT để duy trì buff.

#### Hắc Cốt:
Từ ô nhiễm khí aether hệ Hắc Ám mà thành đặc thù tài nguyên, dùng để chế tạo và nâng cấp kiến trúc, không có tier cố định.

#### Nguyên Tố Thạch:
một viên đá nhiều màu, màu sắc luôn thay đổi, là ngưng kết của nguyên tố, tùy theo khí hậu/địa hình mà Nguyên Tố Thạch có nguyên tố khác nhau. tỉ lệ 1:35 HNT (x2/tier, tức nguyên tố thạch tier 1.2 1 viên:70 HNT), có thể dùng để tạo Tháp Nguyên Tố. Không có tier cố định, tùy theo nồng độ khí aether mà có giai khác nhau.

#### Hồng Lôi Quả:
nhất giai thượng phẩm linh quả.
một loại quả chỉ xuất hiện trong môi trường dày đặc khí aether hệ lôi, ăn nó sẽ tăng vĩnh viễn (chỉ trong mode này) 10% max hp và tạm tăng 5% atk/wil/res trong 3 đêm (chỉ mode này). Tỉ lệ chuyển đổi: 1:55 HNT. nhất giai trung kỳ linh quả, tương đương tier 1.4 đến 1.6.

#### Hắc Thiết:
không gì ngoài cứng rắn, phàm nhân không thể khai thác vì quá cứng, Vật liệu Nhất Giai sơ kỳ, tương đương tier 1.1 đến 1.3, dùng để tạo Tháp canh cùng Nhà Lính cùng Nhà Thờ và Tường, tối đa tier 1.3. tỉ lệ chuyển đổi: 1:1 dạ thạch.

#### Nguyện Thạch:
từ tín ngưỡng của tín đồ ngưng tụ mà thành tín ngưỡng kết tinh, biến động theo giai vị của tín đồ, nguyên liệu bắt buộc để tạo nhà thờ, Nguyện Thạch tier nào tạo ra nhà thờ Tier đó.

Base có thể tạo vật liệu nhờ khả năng chuyển đổi của nó, dù vậy vì duy trì bản thân nên sẽ luôn có thất thoát. Nhưng trong game nó chỉ là hàng nhái, dù có thể trưởng thành theo số lần tinh luyện thì nó vẫn là hàng nhái, nói chính xác là hàng phục chế. Nghĩ vậy thì đơn giản là Vua của Huyết Quốc muốn dùng cái hàng phục chế này hấp thu huyết nhục của phân thân Hắc Ám Chi Chủ sau đó lấy bản gốc hấp thu bản sao, còn main cod bị hấp thu luôn hay không thì khó nói. Dù base gốc cungc không phải vạn năng, nó không thể tạo vật phức tạp, không thể tạo thứ hỗn hợp cao trong 1 lần được, như con người, hẳn base gốc tiến thêm 1 bước sau dung hợp bản sao làm được.


#### Huyền Minh Trọng Thủy:
một loại linh dịch nặng nề, ở vùng giao giới giữa Thủy và Thổ có 15% tỉ lệ xuất hiện, tăng thêm 5%/tier (về cơ bản sẽ càng thấp vì vùng giao nhau giữ thủy và thổ rất khó xuất hiện vì mỗi map xuất hiện vùng nguyên tố là có hạn), sinh ra ở vùng trọng lực cao, có thể dùng để chế tạo Pháo Trọng Lực, tier biến đổi theo tier map. 1 đơn vị HMTT tier 1.1 (+0.1/0.1 tier): 1 TNT. Bất kỳ sinh vật trọng lượng dưới 2 nào đi hoặc bay ngang tốc độ đều sẽ giảm 50%.

#### Hư Không Thạch
có thể dẫn dắt, thao tác với hư không, sinh ra trong vùng có không gian vặn vẹo, vật liệu cần thiết để chế tạo truyền tống trận và 1 số kiến trúc. Xuất hiện ngẫu nhiên Ở Vùng Trọng Lực Cao, tỉ lệ xuất hiện lúc đầu ở vùng trọng lực cao là 1%, +1%/10 đơn vị sinh vật đi ngang.
1 Đơn vị sinh vật: bất kỳ đơn vị nào có Hp và có thể di chuyển đều là 1 đơn vị sinh vật, (Quái thuộc phe Vĩnh Dạ, lính/leader phe player hoặc npc trung lập, Thú hoang,..)

Truyền Tống Trận:
kiến trúc tu sĩ trúc cơ mới có thể tạo ra, dùng để di chuyển khoảng cách xa, cần bày trận giữa A và B. Nên theo game leader cần lên trúc cơ, phái lính đi thám thính, bày Tử trận ở chổ cần đến rồi bày mẫu trận mới tele qua được, hoặc là truyền tống trận có sẵn, sao cũng được.

## Vật Cưỡi:
là phương tiện di chuyển của leader, có thể là vật sống hoặc cơ giới.

#### Linh Mã:
ngựa nhất giai sơ kỳ, theo ăn linh thảo mà tăng tiến tu vi, tối đa tier 1.3
hp:5, 2 res/arm, + 0,5 3 chỉ số khi lên tier.
Thân pháp khởi điểm là 2.3 (+1 mỗi Tier), đạt tối đa 4.3 ở Tier 1.3, sau khi chạy nhanh hết tốc lực ở tier của nó trong 5s (+1/tier) thì sẽ lâm vào suy yếu, cần chạy chậm (giảm 50% tốc độ chạy) trong 7s (-1/tier) mới có thể chạy nhanh lần nữa.

#### Huyết Mã:
nhất giai Trung Kỳ, theo ăn linh thảo mà tu vi tăng từ tier 1.4 đến 1.6.
Hp: 10, 2 res/arm, +1 chỉ số khi lên tier.
Thân pháp khởi điểm là 4.7 (+1.2 mỗi Tier), đạt tối đa 7.1 ở Tier 1.6 sau khi chạy nhanh hết tốc lực ở tier của nó trong 7s (+1/tier) thì sẽ lâm vào suy yếu, cần chạy chậm (giảm 50% tốc độ chạy) trong 7s (-1/tier) mới có thể chạy nhanh lần nữa.

#### Quang Ảnh:
nhị giai sơ kỳ, tốc độ lấy xưng.
Thân pháp siêu tốc 11 mỗi khi tăng 1 Tier + 1.6 đến tier 2.4 ~ 2.6 tăng 1,8/tier, từ 2.7 đến 2.9 + 2 tốc độ /tier, đến tier 3.1 + 2,7 sau đó không thể tăng tier được nữa.
Tư chất: Tam Giai, tức có thể theo player đến Tam Giai, tier 3, dẫu vậy lượng linh thảo nó cần về chất và lượng đều không thấp.

kiến trúc mới:
### Ụ đá:
nói kiến trúc cũng không chính xác, nó như cái module trống, nơi có thể xây kiến trúc mới lên đó, nhờ nó mà xây nhiều kiến trúc gần nhau trở nên khả thi.
yêu cầu: 10 oán thạch và 15 hắc thiết, ụ đá tier nào thì có thể xây kiến trúc tier đó lên, ụ đá tier thấp không thể xây kiến trúc tier cao hơn tier của ụ đá lên được.

leader cần chọn đầu trận, từ 1 nhân vật bất kỳ từ collection trừ prime, trong game có các chỉ số là: hp/res/arm/atk/wil/hp regen, còn các chỉ số khác hiện chưa cần thêm vào game.

### thêm nhân vật mới: thương nhân
một gã bí ẩn, trùm kín mít, hắn luôn có thể xuất hiện trước mặt ngươi, khoảng 3 ngày sẽ xuất hiện 1 lần, khi mua sắm sẽ hiện hub hiện những gì hắn có và hắn chỉ nhận Nguyên Tinh, lúc này time sẽ bị làm chậm đi 50% để player có time mua đồ.

### thêm module:
module là địa hình, kiến trúc player không thể xây được, cung cấp tài nguyên, sự kiện, module spam ngẫu nhiên.
1. mỏ khoáng sản: cần tốn người để đào, cung cấp hắc thiết, 35%/25%/20%/15%/5% tỉ lệ đào được 6/10/14/28/24 đơn vị hắc thiết, mỗi map xuất hiện tối thiểu 3 quặng hắc thiết.
2. quặng Nguyên Tinh, mỗi map xuất hiện tối thiểu 1 quặng nguyên tinh, 50% tỉ lệ xuất hiện quặng thứ 2, nếu có quặng thứ 2 lại có 25% xuất hiện quặng thứ 3, nếu có quặng thứ 3 có 5% xuất hiện quặng thứ 4, không xuất hiện quặng thứ 5, với mỗi quặng xuất hiện, random lần nữa, 35% ra quặng hạ nguyên tinh (trong đó 70% là hnt, 30% còn lại là vnt), 25% ra quặng TNT (trong đó 50% là tnt, 20% là hnt, còn lại 30% là vnt), 15% ra quặng ThNT,(trong đó 35% là thượng nguyên tinh, 25% là tnt, 10% là hnt, còn lại là vnt), từ tier 1.1 tỉ lệ thu thập là 10, tức 10 viên, vậy nếu random ra 1 quặng tnt thì player khi đào sẽ được 5 viên tnt, 2 viên hnt và 3 viên vnt, tỉ lệ thu hoạch tăng 50%/tier. Nếu random ra quặng hnt thì tỉ lệ thu hoặch tăng 50%/tier, tức ở map tier 1 random ra quặng hnt thì player có tỉ lệ thu hoạch là 15 (70% hnt và 30% còn lại là vnt) Nếu random ra quặng tnt thì tỉ lệ thu hoạch tăng 20%/tier, quặng ThNT không có tỉ lệ thu hoạch tăng thêm.
3. Linh thụ: có hình thù ngẫu nhiên, xuất hiện ở vùng có nguyên tố hợp với loại tinh thụ đó, ví dụ: ở vùng có nguyên tố lôi nhiều sẽ xuất hiện Hồng Lôi Thụ có Hồng Lôi Quả, map tier 1.7 trở lên mới có khả năng xuất hiện, 20% tỉ lệ xuất hiện ở map tier 1.7, 30% ở 1.8 và 50% ở 1.9, nếu cả 3 tier map đều không gặp thì lên tier 2.1 tỉ lệ gặp là 100% nếu có vùng nguyên tố lôi dày đặc, trên thực tế tỉ lệ xuất hiện vùng nguyên tố lôi dày đặc cũng không phải là 100% vì còn nhiều nguyên tốt khác nên tỉ lệ trên chỉ tham khảo nếu 4 map tier đề cặp đến đều xuất hiện vùng nguyên tố lôi nhiều.
- Xích Viêm Quả: linh quả nhất giai trung kỳ, tăng vĩnh viễn 2% wil/atk. Trong Vùng Hoả nguyên tố dày đặc có thể xuất hiện, 20% tỉ lệ xuất hiện ở tier 1.4, 30% ở 1.5 và 50% ở 1.6, 100% nếu chưa ăn lần nào ở 1.7, nhưng vì vùng nguyên tố random nên chưa chắc ăn được.

thật ra linh quả hiệu quả đều không quá mạnh vì chỉ tác dụng trong mode này và sẽ mất tác dụng khi leader chết. Linh quả xuất hiện đương nhiên nằm trên linh thụ tương ứng

- Phong Linh Quả: + vĩnh viễn 4% atk, tỉ lệ xuất hiện như Xích viêm quả nhưng là vùng phong nguyên tố nồng đậm.

4. Vùng Nguyên Tố:
- mỗi map đều có tỉ lệ xuất hiện vùng nguyên tố vì có 10 nguyên tố là Hỏa, Mộc, Thủy, Thổ, Kim, Lôi, Huyết, Ánh Sáng, Phong và Hắc Ám. Tăng 5% diện tích map/1 tier.
- Trong đó Hắc Ám tỉ lệ là 100% vì Vĩnh Dạ, vùng hắc ám sẽ xuất hiện ở 1 hoặc 2 bên cuối map, còn lại mỗi nguyên tố sẽ random xuất hiện với tỉ lệ 11%, mỗi map có thể tồn tại tối đa 4 (+1 ở tier 2.1 trở đi, vẫn cap 5 cho đến khi đạt tier 3.1 +1 là 6) vùng nguyên tố chưa tính đến hắc ám, tức mỗi vùng đều có 11% xuất hiện vùng nguyên tố nồng đậm, đều random 4 vùng và vùng nguyên tố đã xuất hiện rồi có thể xuất hiện lần nữa, còn 1% còn lại là vùng nguyên tố cằn cỗi.
- Trong mỗi vùng nguyên tố xuất hiện thì tối thiểu sẽ xuất hiện 1 bãi quái tương ứng với vùng nguyên tố đó, chúng đối địch với player cũng đối địch với vĩnh dạ.

5. Truyền Tống Trận:
- Xuất hiện random bên trái hoặc phải base, spawn ngẫu nhiên trên map, khoảng cách xa nhất có thể spawn là cách base 150 đơn vị khoảng cách, +5% khoảng cách/mỗi tier, tier càng cao cap khoảng cách càng xa.
- Khi bê base vào truyền tống trận, sẽ hoàn thành map đó, trở về world map của mode vĩnh dạ và nhận phần thưởng là số Nguyên Tinh lấy được trong map đó, (Vụn/Hạ/Trung/Thượng Nguyên Tinh và có thể là Thần Tinh ở tier cao) khi vào trận đấu thì sẽ bị cưỡng chế đem theo 10 HNT, coi như tiền đầu game, trừ trực tiếp từ budget, tức là nguyên tinh hiện có, thứ dùng gacha trong game, nâng lv nhân vật,... khi vào mode này sẽ bị đem đi 1 phần, nếu không win được map đó thì số Nguyên Tinh đem theo sẽ mất vĩnh viễn, nếu win map thì mọi tài nguyên base sẽ được chuyển thành Trung Nguyên Tinh theo tỉ lệ tương ứng. Player có thể dùng rune để tăng độ khó, độ khó càng cao hệ số nhân phần thưởng càng cao (tỉ lệ thu hoạch), bình thường không rune là x1, dùng rune để tăng độ khó thì kết toán có thể nhận x3, x10 phần thưởng tiêu chuẩn.

## Hệ thống Rune và Bệ Đá Cổ — Bản cân bằng đề xuất

1. Phân loại Rune

Rune được chia thành hai nhóm:

Rune Thử Thách

- Làm map khó hơn.
- Tăng Tỉ Lệ Thu Hoạch.
- Có thể trang bị độc lập.
- Hiệu ứng mặc định áp dụng lên toàn bộ phe Vĩnh Dạ, trừ khi mô tả ghi rõ không tác dụng hoặc giảm hiệu quả với boss.

Rune Hỗ Trợ

- Làm map dễ hơn hoặc cung cấp lợi thế chiến thuật.
- Giảm Tỉ Lệ Thu Hoạch.
- Không thể trang bị nếu chưa có ít nhất 1 Rune Thử Thách.
- Chỉ được trang bị nếu sau khi trừ chi phí của rune, Tỉ Lệ Thu Hoạch cuối cùng vẫn từ x1 trở lên.

---

2. Quy tắc trang bị Rune

- Mỗi map có tối đa 5 ô Rune.
- Tối đa 2 Rune Hỗ Trợ.
- Không thể trang bị hai Rune cùng tên.
- Rune Hỗ Trợ phải được “trả giá” bằng phần Tỉ Lệ Thu Hoạch đã nhận từ Rune Thử Thách.
- Nếu tháo Rune Thử Thách làm Tỉ Lệ Thu Hoạch tụt xuống dưới x1, Rune Hỗ Trợ gây ra tình trạng đó sẽ tự động bị tháo.
- Rune có thể mang sang map khác, nhưng cấp hiệu lực tối đa của Rune bị giới hạn theo cấp Rune mà tier map đó có thể sinh ra.
- Ví dụ: map tier 1.1–1.3 chỉ cho Rune phát huy tối đa hiệu lực lv1, dù Rune thật sự đang ở lv5.

---

3. Công thức Tỉ Lệ Thu Hoạch

Tỉ lệ cơ sở của mọi map là:

Tỉ Lệ Thu Hoạch cơ sở = x1

Công thức kết toán:

Tỉ Lệ Thu Hoạch cuối =
clamp(
    x1,
    Giới hạn của loại map,
    x1
    + tổng thưởng từ Rune Thử Thách
    - tổng chi phí từ Rune Hỗ Trợ
)

Ví dụ:

Điên Cuồng lv1: +0,35
Nhanh Nhẹn II lv1: +0,30
Leader+ lv1: -0,25

Tỉ Lệ Thu Hoạch cuối:
x1 + 0,35 + 0,30 - 0,25 = x1,40

Giới hạn Tỉ Lệ Thu Hoạch

- Map thường: tối đa x3.
- Map có boss cuối: tối đa x4.
- Map sự kiện hoặc Thử Thách đặc biệt: tối đa x5.
- Không dùng mức x10 trong map farm thông thường.

Phạm vi áp dụng

Tỉ lệ thu hoạch chỉ nhân:

- Nguyên Tinh kết toán cuối map.
- Tài nguyên có thể chuyển đổi thành Nguyên Tinh trong base.
- Phần thưởng hoàn thành map.

Tỉ lệ thu hoạch không nhân:

- Vật phẩm nhiệm vụ.
- Vật phẩm bắt buộc để mở tiến trình.
- Huyết Nhục Kết Tinh bắt buộc.
- Rune.
- Vật phẩm độc bản.
- Số lượng vật phẩm rơi trực tiếp từ từng quái.

Tỉ lệ rơi đồ và Tỉ Lệ Thu Hoạch là hai hệ thống riêng.

---

4. Ký hiệu cân bằng Rune

Trong các công thức dưới đây:

L = cấp Rune, từ 1 đến 9
N = L - 1

Ví dụ:

20% + 5% × N

Ở lv1 là 20%.

Ở lv2 là 25%.

Ở lv9 là 60%.

---

5. Rune Thử Thách

5.1. Điên Cuồng

Hiệu ứng:

Kẻ thù tăng:
- Max HP: 20% + 5% × N
- ATK/WIL: 15% + 4% × N

- Boss chỉ nhận 60% phần chỉ số tăng thêm từ Rune này.
- Không tăng tốc độ, ARM, RES hoặc cooldown.

Tỉ Lệ Thu Hoạch:

+0,35 + 0,05 × N

---

5.2. Hút Máu

Hiệu ứng:

Kẻ thù hồi HP bằng:
15% + 2,5% × N
sát thương thực tế đã gây ra.

Quy tắc:

- Chỉ tính sát thương HP thực nhận sau ARM/RES và giảm sát thương.
- Không tính overkill.
- Sát thương diện rộng chỉ tạo 40% lượng hồi phục.
- Boss chỉ nhận 50% hiệu quả.
- Kẻ thường bị giới hạn hồi tối đa 4% max HP/s.
- Boss bị giới hạn hồi tối đa 2% max HP/s.

Tỉ Lệ Thu Hoạch:

+0,30 + 0,05 × N

---

5.3. Phòng Thủ

Hiệu ứng:

Kẻ thù tăng:
- Max HP: 15% + 4% × N
- Giảm sát thương nhận vào: 8% + 1% × N

- Giảm sát thương nhận vào của Rune này tối đa 16%.
- Boss chỉ nhận 60% hiệu quả.

Tỉ Lệ Thu Hoạch:

+0,30 + 0,04 × N

---

5.4. Suy Yếu Đồng Minh

Hiệu ứng:

Mọi đơn vị phe player giảm:
8% + 2% × N
các chỉ số HP, ATK, WIL, ARM và RES.

- Không giảm tốc độ di chuyển.
- Không tăng cooldown.
- Không ảnh hưởng lượng tài nguyên.
- Kiến trúc không bị giảm chỉ số bởi Rune này.

Tỉ Lệ Thu Hoạch:

+0,35 + 0,05 × N

---

5.5. Nhanh Nhẹn

Hiệu ứng:

Kẻ thù tăng tốc độ di chuyển:
15% + 3% × N

- Tối đa 39%.
- Boss chỉ nhận 50% hiệu quả.
- Không tăng tốc độ đạn.

Tỉ Lệ Thu Hoạch:

+0,25 + 0,04 × N

---

5.6. Phục Sinh

Hiệu ứng:

Khi một kẻ thù lần đầu tiên về 0 HP:

- Không tử vong.
- Hồi ngay: 15% + 1,5% × N max HP.
- Sau đó hồi 1% max HP/s trong:
  4 + floor(N / 3) giây.

Quy tắc:

- Mỗi kẻ chỉ kích hoạt 1 lần trong cả đêm.
- Boss chỉ nhận 50% lượng hồi phục.
- Không kích hoạt khi bị tiêu diệt bởi hiệu ứng xóa sổ đặc biệt.
- Không làm rơi đồ ở lần HP về 0 đầu tiên.

Tỉ Lệ Thu Hoạch:

+0,40 + 0,05 × N

---

5.7. Nặng Nề

Hiệu ứng:

Kẻ thù tăng:
- Trọng lượng vật lý: 0,4 + 0,15 × N
- Kháng hất tung, kéo, đẩy lùi và choáng:
  12% + 2% × N

Quy tắc:

- Boss chỉ nhận 50% phần trọng lượng tăng thêm.
- Trọng lượng từ Rune này không làm thay đổi Threat Cost.
- Trọng lượng dùng cho vật lý và tương tác kiến trúc, không dùng để tính budget sinh quái.

Tỉ Lệ Thu Hoạch:

+0,20 + 0,03 × N

---

5.8. Bạo Tạc

Để Rune này đúng nghĩa Rune Thử Thách, vụ nổ không gây sát thương lên phe Vĩnh Dạ.

Hiệu ứng:

Khi một kẻ thù thật sự tử vong:

Gây sát thương hỗn hợp bằng:
12% + 2% × N
max HP của kẻ vừa chết.

Quy tắc:

- Gây sát thương lên đơn vị phe player, leader, kiến trúc và sinh vật trung lập.
- Không gây sát thương lên phe Vĩnh Dạ.
- Sát thương lên kiến trúc chỉ còn 50%.
- Bán kính cơ sở 3 mét.
- Mỗi 3 cấp Rune tăng thêm 0,25 mét bán kính.
- Vụ nổ không kích hoạt vụ nổ của kẻ khác.
- Boss không phát nổ.

Tỉ Lệ Thu Hoạch:

+0,35 + 0,04 × N

---

5.9. Nhanh Nhẹn II

Hiệu ứng:

Giảm cooldown đánh thường của kẻ thù:
15% + 2% × N

- Tối đa 31%.
- Boss chỉ nhận 50% hiệu quả.
- Không giảm cooldown skill hoặc ultimate.

Tỉ Lệ Thu Hoạch:

+0,30 + 0,04 × N

---

5.10. Phục Thù

Hiệu ứng:

Khi đủ số kẻ thù cùng loại thật sự tử vong:

Ngưỡng kích hoạt:
5 - floor(N / 4)

Mọi kẻ cùng loại còn sống hồi:
8% + 1% × N
max HP.

Quy tắc:

- Ngưỡng tối thiểu là 3.
- Cooldown 12 giây cho từng loại quái.
- Mỗi loại quái kích hoạt tối đa 3 lần mỗi đêm.
- Không tác dụng với boss.

Tỉ Lệ Thu Hoạch:

+0,30 + 0,04 × N

---

5.11. Càn Quét

Hiệu ứng:

Đòn đánh thường đơn mục tiêu của kẻ thù gây thêm sát thương lan:

Sát thương lan:
25% + 2% × N
sát thương của đòn chính.

Số mục tiêu phụ:

Lv1–4: 2 mục tiêu
Lv5–8: 3 mục tiêu
Lv9: 4 mục tiêu

Quy tắc:

- Không kích hoạt từ đòn vốn đã là AoE.
- Không kích hoạt từ DoT, phản sát thương, vụ nổ hoặc triệu hồi.
- Cùng một mục tiêu chỉ nhận 1 lần sát thương lan từ một đòn.
- Đòn của boss chỉ nhận 50% hiệu quả Rune.

Tỉ Lệ Thu Hoạch:

+0,35 + 0,05 × N

---

5.12. Vận Rủi

Hiệu ứng:

Mỗi tỉ lệ rơi đồ ngẫu nhiên bị giảm:
2% + 0,5% × N
điểm phần trăm.

Ví dụ:

Tỉ lệ gốc 5%
Vận Rủi lv1: còn 3%
Vận Rủi lv2: còn 2,5%

Quy tắc:

- Đây là trừ điểm phần trăm tuyệt đối, không phải giảm theo phần trăm tương đối.
- Mỗi dòng tỉ lệ thành công trong cùng một pool bị trừ riêng.
- Phần bị trừ được cộng vào tỉ lệ không rơi gì.
- Tỉ lệ không thể thấp hơn 0%.
- Không tác dụng lên vật phẩm nhiệm vụ.
- Không tác dụng lên vật phẩm bắt buộc để hoàn thành map.
- Không tác dụng lên các dòng rơi cố định 100%.
- Không tác dụng lên Huyết Nhục Kết Tinh bắt buộc từ boss.

Tỉ Lệ Thu Hoạch:

+0,25 + 0,05 × N

---

6. Rune Hỗ Trợ

6.1. Hút Máu Đồng Minh

Hiệu ứng:

Đơn vị sống phe player hồi HP bằng:
12% + 2% × N
sát thương thực tế đã gây ra.

Quy tắc:

- Leader chỉ nhận 75% hiệu quả.
- Sát thương AoE chỉ tạo 40% lượng hồi phục.
- Không tính overkill.
- Không áp dụng lên base, tường, tháp hoặc kiến trúc.
- Hồi phục từ Rune này bị giới hạn tối đa 3% max HP/s.
- Không tính vào healing cap của kiến trúc vì nguồn này đến từ đơn vị.

Chi phí Tỉ Lệ Thu Hoạch:

-0,25 - 0,04 × N

---

6.2. Suy Yếu Kẻ Thù

Hiệu ứng:

Kẻ thù giảm:
8% + 1,5% × N
các chỉ số HP, ATK, WIL, ARM và RES.

- Boss chỉ nhận 50% hiệu quả.
- Không giảm tốc độ, cooldown hoặc trọng lượng.

Chi phí Tỉ Lệ Thu Hoạch:

-0,30 - 0,04 × N

---

6.3. Sĩ Khí

Điều kiện:

Không có đơn vị phe player nào dưới 60% HP.

Khi điều kiện được thỏa mãn:

Mọi đơn vị sống phe player tăng:
5% + 1% × N
Max HP, ATK và WIL.

Quy tắc:

- Hiệu ứng mất sau 1 giây nếu có đồng minh tụt dưới 60% HP.
- Hiệu ứng trở lại sau 3 giây liên tục thỏa điều kiện.
- Không áp dụng lên kiến trúc.

Chi phí Tỉ Lệ Thu Hoạch:

-0,15 - 0,025 × N

---

6.4. Leader+

Hiệu ứng trong thời gian ban đêm:

Leader tăng:
8% + 1,5% × N
HP, ATK, WIL, ARM, RES và HP Regen.

Quy tắc:

- Chỉ có hiệu lực ban đêm.
- Tính lại theo chỉ số hiện tại của leader khi đêm bắt đầu.
- Có thể vượt giới hạn chỉ số thông thường nếu hệ thống cho phép.
- Không tăng tốc độ di chuyển hoặc giảm cooldown.

Chi phí Tỉ Lệ Thu Hoạch:

-0,25 - 0,04 × N

---

6.5. Áp Đảo

Hiệu ứng:

Kẻ thù đứng trong bán kính 5 mét quanh leader bị giảm:

8% + 1% × N
HP, ATK, WIL, ARM và RES.

Quy tắc:

- Boss chỉ nhận 50% hiệu quả.
- Nhiều nguồn Áp Đảo không cộng dồn.
- Khi rời phạm vi, hiệu ứng biến mất sau 1 giây.

Chi phí Tỉ Lệ Thu Hoạch:

-0,20 - 0,03 × N

---

6.6. Trọng Sinh

Hiệu ứng:

Khi base bị phá hoặc leader thật sự tử vong:

- Trận phòng thủ quay lại đúng thời điểm đầu đêm.
- Trạng thái ban đầu của đêm được khôi phục.
- Tài nguyên đã tiêu trong đêm được hoàn lại theo snapshot đầu đêm.
- Vật phẩm đã rơi trong đêm bị xóa.
- RNG của đêm được tạo lại để tránh lặp hoàn toàn cùng một diễn biến.

Số lần kích hoạt:

Lv1–4: 1 lần/map
Lv5–8: 2 lần/map
Lv9: 3 lần/map

Chi phí Tỉ Lệ Thu Hoạch:

Lv1–4: -0,60
Lv5–8: -0,75
Lv9: -0,90

---

6.7. Hắc Khoa Kỹ

Hiệu ứng:

Bắt đầu map với 1 Tháp Canh tạm thời đặt gần base.

Cấp tháp:

Lv1–3: Tháp Canh lv3
Lv4–6: Tháp Canh lv4
Lv7–9: Tháp Canh lv5

Quy tắc:

- Không thể nâng cấp.
- Không thể tháo để hoàn tài nguyên.
- Biến mất khi rời map.
- Cấp tháp không thể vượt giới hạn kiến trúc của tier map.
- Nếu không có vị trí hợp lệ, game tạo một ụ đá tạm chỉ dành cho tháp này.

Chi phí Tỉ Lệ Thu Hoạch:

Lv1–3: -0,40
Lv4–6: -0,50
Lv7–9: -0,60

---

6.8. Âu Hoàng

Hiệu ứng:

Mỗi tỉ lệ rơi đồ ngẫu nhiên được tăng:
2% + 0,5% × N
điểm phần trăm.

Ví dụ:

Tỉ lệ gốc 5%
Âu Hoàng lv1: 7%
Âu Hoàng lv2: 7,5%

Quy tắc:

- Đây là cộng điểm phần trăm tuyệt đối.
- Không phải cộng phần trăm dựa trên tỉ lệ gốc.
- Mỗi dòng tỉ lệ thành công trong cùng một pool được cộng riêng.
- Tổng phần được cộng sẽ trừ vào tỉ lệ không rơi gì.
- Nếu tỉ lệ không rơi gì không đủ để trừ, các dòng thành công đạt trần theo thứ tự từ tỉ lệ thấp nhất đến cao nhất.
- Mỗi tỉ lệ tối đa 100%.
- Các pool độc lập tiếp tục được tính độc lập.
- Không tác dụng lên vật phẩm nhiệm vụ hoặc vật phẩm rơi cố định 100%.

Chi phí Tỉ Lệ Thu Hoạch:

-0,30 - 0,05 × N

---

7. Rune mới đề xuất

7.1. Rune Thử Thách — Cuồng Triều

Hiệu ứng:

Threat Budget mỗi đêm tăng:
20% + 5% × N

Quy tắc:

- Không tăng chỉ số trực tiếp của quái.
- Boss không tính trong phần budget tăng thêm.
- Budget lính hộ tống boss chỉ nhận 50% hiệu quả.

Tỉ Lệ Thu Hoạch:

+0,35 + 0,05 × N

---

7.2. Rune Thử Thách — Tinh Anh Hóa

Hiệu ứng:

5% + 1% × N
quái thường sinh ra được nâng thành Tinh Anh.

Tinh Anh nhận:

+50% max HP
+25% ATK/WIL
+10% tốc độ di chuyển

Quy tắc:

- Không biến boss thành Tinh Anh.
- Không áp dụng lên quái vốn đã là Tinh Anh.
- Tinh Anh dùng Threat Cost cao hơn quái gốc.

Tỉ Lệ Thu Hoạch:

+0,40 + 0,05 × N

---

7.3. Rune Thử Thách — Hợp Quần

Hiệu ứng:

Mỗi kẻ thù nhận 1 stack Hợp Quần cho mỗi đồng minh Vĩnh Dạ trong bán kính 5 mét.

Mỗi stack:

+2% + 0,25% × N ATK/WIL
+2% + 0,25% × N giảm sát thương nhận vào

Quy tắc:

- Tối đa 5 stack.
- Boss tối đa 2 stack.
- Stack mất sau 2 giây khi không còn đủ đồng minh gần đó.

Tỉ Lệ Thu Hoạch:

+0,30 + 0,04 × N

---

7.4. Rune Thử Thách — Ô Nhiễm Sâu

Hiệu ứng:

Cooldown áp Ô Nhiễm từ cùng một loại nguồn giảm:
15% + 2% × N

Thời gian cầu nguyện xóa Ô Nhiễm tăng:
10% + 2% × N

Quy tắc:

- Không giảm cooldown thấp hơn 3 giây.
- Không làm thay đổi ngưỡng 5 stack chuyển hóa.
- Boss không nhận lợi ích riêng từ Rune này nếu không có khả năng gây Ô Nhiễm.

Tỉ Lệ Thu Hoạch:

+0,25 + 0,04 × N

---

7.5. Rune Hỗ Trợ — Dự Cảnh

Hiệu ứng:

Trước khi đêm bắt đầu, hiển thị:

- Threat Budget chính xác của đêm đó.
- Hướng xuất hiện chính.
- Ba loại quái có Threat Cost cao nhất có thể xuất hiện.
- Có hay không có quái bay.
- Có hay không có đơn vị gây Ô Nhiễm.

Chi phí Tỉ Lệ Thu Hoạch:

-0,10 - 0,01 × N

---

7.6. Rune Hỗ Trợ — Kiên Thành

Hiệu ứng:

Base và kiến trúc phe player tăng:
- Max HP: 15% + 3% × N
- Giảm sát thương nhận vào: 5% + 1% × N

- Giảm sát thương nhận vào tối đa 13%.
- Không tăng hồi phục.
- Không tăng sát thương kiến trúc.

Chi phí Tỉ Lệ Thu Hoạch:

-0,25 - 0,04 × N

---

7.7. Rune Hỗ Trợ — Tịnh Quang

Hiệu ứng:

- Hiển thị số stack Ô Nhiễm trên đơn vị phe player.
- Thời gian cầu nguyện xóa Ô Nhiễm giảm:

20% + 3% × N

Quy tắc:

- Không giảm tốc độ nhận stack.
- Không tự động tịnh hóa.
- Thời gian cầu nguyện tối thiểu còn 30% thời gian gốc.

Chi phí Tỉ Lệ Thu Hoạch:

-0,20 - 0,03 × N

---

7.8. Rune Hỗ Trợ — Hậu Cần

Hiệu ứng:

Thời gian xây dựng, sửa chữa và cầu nguyện giảm:
15% + 2% × N

Quy tắc:

- Không giảm chi phí tài nguyên.
- Không tăng số nhân lực.
- Không giảm cooldown chiến đấu.
- Thời gian thực hiện tối thiểu còn 40% thời gian gốc.

Chi phí Tỉ Lệ Thu Hoạch:

-0,20 - 0,03 × N

---

8. Bệ Đá Cổ

8.1. Tỉ lệ xuất hiện

Tỉ lệ cơ sở:

Tier 1.1: 20%
Mỗi tier nhỏ tiếp theo: +3 điểm phần trăm

Hệ thống pity:

Mỗi map hoàn thành mà không nhận được Rune từ Bệ Đá Cổ:
+10 điểm phần trăm cho map kế tiếp.

Quy tắc:

- Tỉ lệ tối đa 100%.
- Pity chỉ tăng khi hoàn thành map.
- Thua hoặc rút lui không tăng pity.
- Khi nhận Rune từ Bệ Đá Cổ, pity trở về 0.
- Nếu map có Bệ nhưng player không tìm thấy hoặc không nhận Rune, pity vẫn tăng sau khi hoàn thành map.
- Mỗi map có tối đa 1 Bệ Đá Cổ.

Công thức:

Tỉ lệ xuất hiện =
min(
    100%,
    tỉ lệ theo tier + pity hiện tại
)

---

8.2. Chọn Rune

Khi kích hoạt Bệ Đá Cổ:

- Hiển thị 3 Rune khác nhau.
- Luôn có 2 Rune Thử Thách.
- Luôn có 1 Rune Hỗ Trợ.
- Player chọn đúng 1 Rune.
- Hai Rune không chọn biến mất.
- Không xuất hiện ba Rune cùng tên.
- Nếu player đã sở hữu Rune đạt lv9, Rune đó không xuất hiện tiếp.

---

8.3. Cấp Rune do Bệ tạo ra

Tier 1.1–1.3: Rune lv1
Tier 1.4–1.6: Rune lv2
Tier 1.7–1.9: Rune lv3

Tier 2.1–2.3: Rune lv4
Tier 2.4–2.6: Rune lv5
Tier 2.7–2.9: Rune lv6

Tier 3.1–3.3: Rune lv7
Tier 3.4–3.6: Rune lv8
Tier 3.7–3.9: Rune lv9

---

8.4. Dung hợp Rune

3 Rune cùng tên và cùng cấp
→ 1 Rune cùng tên cao hơn 1 cấp.

Quy tắc:

- Rune lv9 không thể dung hợp tiếp ở phiên bản hiện tại.
- Rune đang trang bị không thể dùng làm nguyên liệu.
- Hệ thống phải có cảnh báo xác nhận trước khi dung hợp.

Đề xuất bổ sung để giảm grind:

- Rune không cần có thể phân rã thành Bụi Rune.
- 5 Bụi Rune có thể thay thế 1 trong 3 bản Rune cần cho một lần dung hợp.
- Mỗi lần dung hợp chỉ được dùng tối đa 1 phần thay thế bằng Bụi Rune.

---

9. Threat Budget và trọng lượng quái

Không dùng cùng một chỉ số cho hai mục đích.

Mỗi quái cần có:

physicsWeight

Dùng cho:

- Hất tung.
- Kéo.
- Đẩy lùi.
- Trọng Lực Pháo.
- Tương tác vật lý.

Và:

threatCost

Dùng cho:

- Budget mỗi đêm.
- Tính số lượng quái sinh ra.
- Phân phối quái thường, đặc biệt và Tinh Anh.

Rune Nặng Nề chỉ thay đổi "physicsWeight", không thay đổi "threatCost".

---

10. Nhịp tăng Threat Budget

Nếu đêm đầu có budget 10:

Budget đêm N = 10 × 1,5^(N - 1)

Bảng tham khảo:

Đêm 1: 10
Đêm 2: 15
Đêm 3: 22,5
Đêm 4: 33,75
Đêm 5: 50,63
Đêm 6: 75,94
Đêm 7: 113,91

Tăng 50% mỗi đêm chỉ nên dùng khi một map có khoảng 6 đêm thường và 1 đêm boss.

Nếu map kéo dài hơn 7 đêm, nên đổi sang:

Đêm 1–4: +50% mỗi đêm
Đêm 5 trở đi: +30% mỗi đêm

để tránh budget tăng theo cấp số nhân quá nhanh.

---

11. Đêm cuối và Oán Long

Dùng cấu trúc kết thúc lai giữa chủ động tiến công và boss tự kéo đến.

11.1. Mở quyền đánh boss

- Từ ngày 5, player có thể tìm được sào huyệt hoặc lãnh địa của Oán Long.
- Sau khi tìm thấy, player có thể chủ động dẫn leader và quân tiến công.
- Khi chủ động tiến công, player không được hưởng toàn bộ lợi thế của tường và kiến trúc phòng thủ tại base.

11.2. Boss tự xuất hiện

- Nếu player chưa chủ động đánh boss, đêm 7 Oán Long tự dẫn quân tấn công.
- Player được dùng toàn bộ phòng tuyến.
- Đổi lại, Oán Long có quân hộ tống và trực tiếp gây áp lực lên kiến trúc.

11.3. Boss Slot

Oán Long không dùng "physicsWeight = 4" làm Threat Cost.

Oán Long dùng một Boss Slot riêng:

Boss Slot: Oán Long
Escort Budget: budget lính hộ tống riêng

- Oán Long không trừ trực tiếp 4 điểm khỏi budget.
- Budget đêm 7 không được dùng toàn bộ rồi cộng thêm boss mà không điều chỉnh.
- Gợi ý escort budget cơ sở bằng 50–70% budget đêm 7.
- Rune Cuồng Triều chỉ tác động 50% lên escort budget.
- Rune tăng chỉ số vẫn tác động lên Oán Long theo hệ số boss được ghi trong từng Rune.

11.4. Phần thưởng boss

- Huyết Nhục Kết Tinh bắt buộc có tỉ lệ rơi 100%.
- Âu Hoàng và Vận Rủi không tác động lên Huyết Nhục Kết Tinh bắt buộc.
- Các vật phẩm thưởng thêm của boss vẫn có thể bị Âu Hoàng và Vận Rủi tác động.
- Tỉ Lệ Thu Hoạch có thể nhân phần Nguyên Tinh kết toán từ trận boss.
- Tỉ Lệ Thu Hoạch không nhân số lượng Huyết Nhục Kết Tinh bắt buộc.

---

12. Điểm cần test trong prototype

Các giá trị cần theo dõi khi test:

- Tỉ lệ thắng theo từng tổ hợp Rune.
- Thời gian trung bình để hoàn thành một đêm.
- Số tài nguyên kiếm được mỗi giờ chơi.
- Tỉ lệ Rune Hỗ Trợ được sử dụng.
- Tổ hợp Rune nào luôn đạt cap x3 hoặc x4.
- Rune nào gần như không ai chọn.
- Rune nào khiến Oán Long trở nên bất tử.
- Tần suất Bệ Đá Cổ xuất hiện thực tế sau pity.
- Số map trung bình cần để dung hợp một Rune lên cấp tiếp theo.
- Mức chênh lệch giữa chủ động đánh Oán Long và chờ Oán Long tấn công.