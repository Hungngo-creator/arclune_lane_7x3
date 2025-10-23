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
- **Nguồn palette**: `loithien` trong `src/art.ts` (primary `#8bd1ff`, secondary `#163044`, accent `#c7f1ff`, outline `#1e3e53`).
- **Da**: base gradient từ `#f4fbff` (sáng) → `#cbe7ff` (bóng khuất); thêm emissive nhẹ `#c7f1ff` quanh xăm lôi văn.
- **Kim loại giáp**: primary làm midtone; highlight `#d9f2ff`, shadow pha secondary `#163044`; cạnh sắc add rim `#c7f1ff` ~70% opacity.
- **Vải áo choàng**: secondary làm nền, lót trong dùng blend `#0f1f2c`; mép áo quét accent 40% tạo viền phát sáng.
- **Vũ khí (thương)**: cán dùng gradient `#1e3e53` → `#0b1822`; lưỡi thương chuyển `#8bd1ff` → `#c7f1ff`, thêm core emissive `#a6ecff` dọc sống.
- **Hiệu ứng năng lượng**: sử dụng accent pha thêm `#9df0ff` để glow; vùng cháy ult overlay `#ff8055` → `#ffd4a8` nhưng giới hạn alpha ≤45% để không phá palette.
- **Phụ kiện tóc & dây**: primary nhạt `#a8ddff` cho phần sáng, shadow dùng secondary + 20% black.
- **Giày & găng**: base secondary, nhấn góc bằng `#244a63`, highlight `#8bd1ff` ở mép giáp.

Mọi thông tin tiếp theo từ câu nói này chỉ mang tính THAM KHẢO, không cần áp dụng 100%:

5) Quy ước đặt tên & ID lớp (machine-readable)

Tiền tố nhân vật: LA_ (Lôi Thiên Ảnh).

Layer IDs (trùng khớp tên node trong SVG):

LA_WEAPON_FRONT, LA_ARM_FRONT, LA_TORSO, LA_HEAD, LA_HAIR_FRONT, LA_ARM_BACK, LA_LEG_FRONT, LA_LEG_BACK, LA_CAPE_FRONT, LA_CAPE_BACK, LA_WEAPON_BACK, LA_ACC_BACK, LA_FX_GLOW, LA_FX_HEAT, LA_FX_ULT.


Class CSS cho shader/animation:

.fx-glow (glow lôi văn), .fx-heat (nhiễu nhiệt), .fx-ult (overlay cháy đỏ).


Quy ước anchor/pivot trong SVG: set transform-origin theo bảng pivot (x,y) đã ghi; thêm data-pivot="x,y" vào từng <g> để tool đọc.


6) Trạng thái animation & thời lượng (60 FPS chuẩn)

State	Frames	Thời lượng	Ghi chú

idle	60	1.0s	Thở nhẹ, tóc/áo choàng sway nhỏ. .fx-glow fade 55→85%/2.5s loop.
attack_a (đấm điện)	14	0.23s	Khóa cổ tay theo thương; add 1 follow-through 6f. Trigger VFX ở f7.
attack_b (đâm thương)	18	0.30s	Camera shake nhẹ 2px ở f15–16.
block	10	0.17s	Nâng gauntlet; rimlight tăng 20% trong 6f đầu.
hit_react	8	0.13s	Lệch thân 3–5px, tắt glow 1 nhịp.
charge (tăng lực)	24	0.40s	Lôi văn sáng dần; âm “crackle” nhỏ ở f12.
ultimate	48	0.80s	Bật .fx-ult từ f10→f40 (alpha 0→45%→0). Vệt nứt điện dưới chân scale 0.9→1.15.
entry	16	0.27s	Bước vào 1/3 thân, cape catch-up 4f.
death	24	0.40s	Collapse gối; tắt mọi FX trong 6f cuối.


> Chuẩn hoá easing: idle/charge = easeInOutSine, attack = cubic-bezier(0.2,0,0.1,1), block/hit = easeOutCubic.



7) Ràng buộc rig (constraints)

IK tay cầm thương: LA_WEAPON_FRONT là driver, ràng LA_WRIST_FRONT và LA_ELBOW_FRONT theo góc cán thương (giới hạn xoay cổ tay ±22°).

Hinge gối & cổ chân: LA_KNEE_* chỉ xoay y, clamp ±18°, LA_ANKLE_* roll ±12°.

Cape: 3 xương: cape_root (hông), cape_mid, cape_tip với spring 0.12, damping 0.18.

Head look: yaw ±10°, pitch ±6° (không cắt tóc sau).


8) Timeline sự kiện VFX/SFX (theo state)

attack_a: f7 → emit fx_spark_small tại LA_WEAPON_FRONT.tip; âm elec_crackle_s volume 0.35.

attack_b: f12 → fx_trail_lance (line gradient #8bd1ff→#c7f1ff, life 180ms).

charge: f8→f24 tăng glow_intensity 0.6→1.0; loop hum nền -16dB.

ultimate: f10 bật .fx-ult, f18 spawn fx_floor_crack (mask dưới chân), f40 tắt .fx-ult, phát thunder_hit -10dB.

hit_react: f1 play hit_body -12dB; tạm tắt .fx-glow trong 6f.


9) Xuất file & cấu trúc thư mục

/art/characters/LA/
  ├─ svg/
  │   ├─ LA_base.svg                # layer & ID chuẩn
  │   ├─ LA_fx_sheet.svg            # defs symbol cho fx: spark, trail, crack, halo
  │   └─ LA_palette.json            # map màu & tokens
  ├─ anim/
  │   ├─ LA_idle.anim.json
  │   ├─ LA_attack_a.anim.json
  │   ├─ LA_attack_b.anim.json
  │   ├─ LA_block.anim.json
  │   ├─ LA_hit_react.anim.json
  │   ├─ LA_charge.anim.json
  │   ├─ LA_ultimate.anim.json
  │   ├─ LA_entry.anim.json
  │   └─ LA_death.anim.json
  ├─ vfx/
  │   ├─ fx_spark_small.json
  │   ├─ fx_trail_lance.json
  │   └─ fx_floor_crack.json
  └─ meta/
      └─ LA_runtime_meta.json       # xem mục 10

Preset xuất PNG (nếu cần sprite): 4x scale (640×800), background alpha, quantize 256 màu cho mobile.

LOD: LA_base_lite.svg bỏ .fx-heat & giảm path points ~30% cho low-end.


10) LA_runtime_meta.json (mẫu)

{
  "id": "LA",
  "hitbox": { "x": 58, "y": 70, "w": 40, "h": 110 },
  "feet": { "x": 86, "y": 196 }, 
  "attach_points": {
    "weapon_tip": [132, 120],
    "floor_crack": [86, 196]
  },
  "audio": {
    "voice_print": "baritone_bright",
    "sfx": { "crackle": "elec_crackle_s", "thunder": "thunder_hit" }
  },
  "states": ["idle","attack_a","attack_b","block","hit_react","charge","ultimate","entry","death"]
}

11) Checklist QA nhanh (trước khi đưa vào game)

Không layer nào trùng ID; mọi <g> đều có data-pivot.

Kiểm tra overdraw của .fx-ult (alpha ≤ 0.45, không “cháy” palette).

Tóc/áo không xuyên vũ khí ở attack_b.

Hitbox bao phủ thân trung tâm, không theo cape.

Export thử idle 10 vòng → không drift vị trí chân.
