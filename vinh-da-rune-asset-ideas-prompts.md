# Arclune — Art Bible và Prompt Asset Rune cho mode Vĩnh Dạ

## 1. Hướng mỹ thuật chốt

Rune của Vĩnh Dạ nên là **ấn vật hữu hình** chứ không chỉ là biểu tượng phẳng:

- Lõi là một vật thể ma thuật nhỏ: tinh thể, phù ấn, mặt nạ, bánh răng, khiên, con mắt, đồng hồ…
- Chất liệu chính: đồng cổ, bạc xỉn, đá đen, thủy tinh ma lực, vết nứt phát sáng.
- Phong cách: icon vật phẩm game chiến thuật fantasy 2D vẽ tay, hình khối rõ như *Sword of Convallaria*, thêm chất huyền bí, cổ vật và hình học siêu thực gần *Reverse: 1999*.
- Không dùng chữ thật. Chỉ dùng ký hiệu giả tưởng lớn, rõ.
- Phải đọc được ở kích thước 64×64.
- Một icon chỉ có một ý chính; không dựng cả cảnh chiến đấu.

### Phân biệt hai nhóm bằng ngôn ngữ hình ảnh

**Rune Thử Thách**

- Hình dáng góc cạnh, hơi bất đối xứng.
- Đá đen, sắt cháy, đồng xỉn.
- Ánh sáng đỏ thẫm, tím ô nhiễm hoặc cam cháy.
- Vết nứt hướng ra ngoài, gai hoặc móc nhọn.
- Cảm giác nguy hiểm, ép buộc, mất kiểm soát.

**Rune Hỗ Trợ**

- Hình dáng cân đối, tròn hoặc đa giác đều.
- Bạc, ngà, đồng sáng, thủy tinh xanh.
- Ánh sáng vàng nhạt, xanh lam, xanh ngọc hoặc trắng.
- Đường nét ôm vào lõi, vòng bảo hộ hoặc cánh.
- Cảm giác bảo hộ, kiểm soát và chuẩn bị.

---

## 2. Nên tách khung và lõi Rune

Đừng bắt AI vẽ lại khung cho từng Rune vì 28 lần sinh ảnh sẽ tạo 28 kiểu khung không đồng nhất.

Nên dùng:

```text
2 asset khung dùng chung
+ 28 asset lõi Rune
```

Trong UI:

```html
<div class="rune-icon rune-icon--challenge">
  <img class="rune-core" src="assets/runes/challenge/frenzy.webp">
  <img class="rune-frame" src="assets/runes/frame_challenge.webp">
</div>
```

Cấp Rune, dấu `+`, khóa, đang trang bị và số lượng nên do HTML/CSS vẽ, không nằm trong ảnh.

---

# 3. Prompt tạo hai khung Rune

## 3.1. Khung Rune Thử Thách

```text
Create exactly one empty outer frame for a dark-fantasy game rune icon, square 1:1 composition, transparent background. A front-facing asymmetrical octagonal frame made from blackened iron, cracked obsidian and tarnished bronze, four short thorn-like projections, subtle crimson and polluted violet light leaking through engraved fractures. The center must be fully empty and transparent for another icon to be placed underneath. Hand-painted 2D tactical fantasy RPG item icon, crisp readable silhouette, restrained ornament, high contrast at 64 pixels, antique occult craftsmanship, no central symbol, no text, no letters, no numbers, no scene, no rectangular card, no watermark.
```

## 3.2. Khung Rune Hỗ Trợ

```text
Create exactly one empty outer frame for a fantasy game rune icon, square 1:1 composition, transparent background. A front-facing perfectly symmetrical rounded octagonal frame made from aged silver, ivory stone and warm brass filigree, four small wing-like protective ornaments, subtle pale gold and teal light flowing inward. The center must be fully empty and transparent for another icon to be placed underneath. Hand-painted 2D tactical fantasy RPG item icon, crisp readable silhouette, restrained ornament, high contrast at 64 pixels, sacred antique craftsmanship, no central symbol, no text, no letters, no numbers, no scene, no rectangular card, no watermark.
```

---

# 4. Prompt gốc cho lõi Rune

Mỗi lần tạo ảnh, sao chép **Prompt gốc** tương ứng rồi nối thêm phần **Chủ thể riêng** của Rune.

## 4.1. Prompt gốc — Rune Thử Thách

```text
Create exactly one isolated core artwork for an Arclune Vĩnh Dạ Challenge Rune, square 1:1, transparent background. Do not draw an outer icon frame. Front-facing centered magical relic, hand-painted 2D tactical dark-fantasy RPG item icon, strong simple silhouette readable at 64×64, blackened metal, cracked obsidian, tarnished bronze, deep crimson and polluted violet glow, controlled painterly shading, subtle occult geometry, premium mobile game asset, the object occupies about 78% of the canvas. No text, no readable letters, no numbers, no character portrait, no full environment, no rectangular card, no UI, no watermark, no excessive bloom, no tiny decorative clutter.
SUBJECT:
```

## 4.2. Prompt gốc — Rune Hỗ Trợ

```text
Create exactly one isolated core artwork for an Arclune Vĩnh Dạ Support Rune, square 1:1, transparent background. Do not draw an outer icon frame. Front-facing centered magical relic, hand-painted 2D tactical fantasy RPG item icon, strong simple silhouette readable at 64×64, aged silver, pale stone, warm brass, opaline glass, pale gold, blue and teal glow, controlled painterly shading, subtle sacred geometry, premium mobile game asset, the object occupies about 78% of the canvas. No text, no readable letters, no numbers, no character portrait, no full environment, no rectangular card, no UI, no watermark, no excessive bloom, no tiny decorative clutter.
SUBJECT:
```

---

# 5. Rune Thử Thách — Ý tưởng và SUBJECT prompt

## 5.1. Điên Cuồng

```text
A split feral beast mask with three burning red eyes, two snapped chains flying outward and a jagged heartbeat-shaped fracture through its forehead, raw rage forced into a single cursed relic.
```

`challenge_frenzy.webp`

## 5.2. Hút Máu

```text
A black fanged mouth biting through a large suspended blood droplet, with thin streams of blood unnaturally flowing backward into a hollow crimson core, predatory and parasitic rather than gore-heavy.
```

`challenge_lifesteal_enemy.webp`

## 5.3. Phòng Thủ

```text
A dense black tower shield made from overlapping armored scales, reinforced by three heavy bronze bands, with a sealed closed eye embedded in the center, conveying an enemy that refuses to be damaged.
```

`challenge_defense.webp`

## 5.4. Suy Yếu Đồng Minh

```text
Five small pale allied silhouettes beneath a descending cracked black sigil, their light being drained downward into one dark fracture, a clear symbol of the player's whole formation becoming weaker.
```

`challenge_weaken_allies.webp`

## 5.5. Nhanh Nhẹn

```text
A sharp clawed beast foot stepping forward with three curved crimson wind trails and a broken ground shard left behind, communicating dangerous movement speed rather than attack speed.
```

`challenge_swiftness_move.webp`

## 5.6. Phục Sinh

```text
A skeletal hand rising through a shattered burial seal, surrounded by a dim crimson halo rotating backward, with fragments of the death sigil floating upward as if death has been rejected once.
```

`challenge_resurrection.webp`

## 5.7. Nặng Nề

```text
A massive black stone anvil wrapped in thick bronze chains, compressing a small cracked floor plate beneath it, with gravity lines bending inward toward the object.
```

`challenge_heavy.webp`

## 5.8. Bạo Tạc

```text
A swollen black crystalline seed with a molten red center rupturing outward into six sharp fragments, an instant violent death explosion with a clean radial silhouette.
```

`challenge_death_burst.webp`

## 5.9. Nhanh Nhẹn II

```text
Two crossing claw slashes spinning around a damaged clockwork gear, with the gear teeth stretched into motion trails, clearly representing faster repeated attacks rather than movement.
```

`challenge_swiftness_attack.webp`

## 5.10. Phục Thù

```text
Four broken beast masks on the lower edge sending thin crimson threads upward into one intact mask, whose eye burns brighter as its fallen kin empower it.
```

`challenge_vengeance.webp`

## 5.11. Càn Quét

```text
A broad cursed crescent blade sweeping horizontally, its main slash splitting into three smaller red arc waves behind it, a clear visual of one attack striking nearby secondary targets.
```

`challenge_cleave.webp`

## 5.12. Vận Rủi

```text
A cracked golden fortune coin eclipsed by a black disk, with one dark raven feather piercing through it and the lucky light leaking away into violet smoke.
```

`challenge_misfortune.webp`

## 5.13. Cuồng Triều

```text
A towering tidal wave formed entirely from layered shadow-creature silhouettes, surging through a small broken gate, showing a larger enemy wave rather than stronger individual enemies.
```

`challenge_horde_surge.webp`

## 5.14. Tinh Anh Hóa

```text
A plain dark soldier helmet being pierced and transformed by a large red crystal crown, with two horn-like crystal growths and a concentrated elite aura.
```

`challenge_elite.webp`

## 5.15. Hợp Quần

```text
Five stylized wolf jaws arranged in a tight circular pack around one shared crimson core, each connected by a dark energy ring, communicating power gained from nearby allies.
```

`challenge_pack.webp`

## 5.16. Ô Nhiễm Sâu

```text
A pale crystal being invaded from below by branching black roots and violet veins, with a single polluted eye opening inside the crystal as the corruption reaches its center.
```

`challenge_deep_corruption.webp`

---

# 6. Rune Hỗ Trợ — Ý tưởng và SUBJECT prompt

## 6.1. Hút Máu Đồng Minh

```text
A silver ritual cup catching three red droplets that transform into warm teal life-light before reaching the cup, with the restored light flowing back upward around a small allied emblem.
```

`support_lifesteal_allies.webp`

## 6.2. Suy Yếu Kẻ Thù

```text
A dark enemy silhouette compressed between two pale silver chains and a descending luminous seal, its horns and claws visibly shrinking under controlled magical pressure.
```

`support_weaken_enemies.webp`

## 6.3. Sĩ Khí

```text
Three upright allied blades forming a protective triangle around a bright golden heartbeat flame, the blades steady and unbroken, expressing shared courage while the formation remains healthy.
```

`support_morale.webp`

## 6.4. Leader+

```text
A crowned commander silhouette standing at the center of six balanced rays, each ray ending in a small gem for health, attack, will, armor, resistance and regeneration, bold and readable rather than overly detailed.
```

`support_leader_plus.webp`

## 6.5. Áp Đảo

```text
A bright central commander seal emitting a circular pressure wave, with three small dark enemy silhouettes bending or kneeling around the outer edge, showing localized suppression around the leader.
```

`support_overwhelm.webp`

## 6.6. Trọng Sinh

```text
A shattered base crystal enclosed by a reversed clock spiral, its fragments visibly flying backward and reconnecting around a pale blue core, symbolizing the entire night being rewound.
```

`support_rewind.webp`

## 6.7. Hắc Khoa Kỹ

```text
A compact arcane watchtower fused with dark brass gears, a small blue crystal reactor and one precise mechanical firing slit, advanced forbidden engineering but still medieval fantasy.
```

`support_black_technology.webp`

## 6.8. Âu Hoàng

```text
A golden celestial fortune wheel with three perfectly aligned stars, an opened lucky coin at its center and small rays converging toward rare treasure, elegant rather than comedic.
```

`support_lucky_emperor.webp`

## 6.9. Dự Cảnh

```text
An ancient silver lantern containing a clear blue all-seeing eye, projecting two narrow light paths that reveal three distant enemy silhouettes before they arrive.
```

`support_forewarning.webp`

## 6.10. Kiên Thành

```text
Three interlocking pale stone wall blocks protected by a broad silver shield, with thin golden roots binding the structure together into one stable fortress emblem.
```

`support_fortress.webp`

## 6.11. Tịnh Quang

```text
A concentrated white-gold sunbeam passing through a clear crystal and breaking two black corrupted chains, with violet contamination evaporating into harmless pale mist.
```

`support_purifying_light.webp`

## 6.12. Hậu Cần

```text
A neatly arranged builder's hammer, rolled blueprint, small brass gear and half-empty hourglass forming one compact symmetrical emblem, representing faster construction, repair and prayer preparation.
```

`support_logistics.webp`

---

# 7. Negative prompt dùng chung

```text
text, readable letters, alphabet, numbers, logo, watermark, signature, character portrait, human face, full environment, landscape, rectangular card, UI panel, multiple separate icons, duplicate object, cropped object, photorealistic product photography, modern plastic, neon cyberpunk, flat vector logo, pixel art, excessive particles, excessive bloom, muddy silhouette, tiny unreadable detail
```

---

# 8. Asset bổ sung cho Bệ Đá Cổ

## 8.1. Bệ Đá Cổ đóng

```text
Create one isolated ancient rune pedestal for a dark-fantasy tactical RPG, transparent background, front three-quarter view. A weathered black stone altar with three empty triangular sockets, tarnished bronze bands, dormant violet veins and roots growing around the base. Hand-painted 2D game asset, Sword of Convallaria-like fantasy readability with occult relic detail, clear silhouette, no text, no character, no environment, no UI, no watermark.
```

## 8.2. Bệ Đá Cổ đã kích hoạt

```text
Create one isolated activated ancient rune pedestal for a dark-fantasy tactical RPG, transparent background, front three-quarter view. The same weathered black stone altar now opened, with three different floating rune cores above its three sockets, pale gold choice-light in the center and controlled violet corruption around the edges. Hand-painted 2D game asset, clear readable silhouette, no text, no character, no environment, no UI, no watermark.
```

---

# 9. Kích thước và định dạng

## Tệp gốc

```text
PNG RGBA
1024×1024
nền trong suốt
```

## Tệp dùng trong game

```text
WebP có alpha
256×256
lossless hoặc quality 88–92
```

Không nhúng ảnh bằng base64 vào TypeScript hoặc `app.js`. Để ảnh thành tệp riêng trong:

```text
public/assets/runes/
```

---

# 10. Chuyển ảnh trên Termux

```bash
pkg install imagemagick
```

```bash
magick input.png \
  -trim +repage \
  -resize 224x224 \
  -background none \
  -gravity center \
  -extent 256x256 \
  -strip \
  -define webp:lossless=true \
  output.webp
```

Chuyển hàng loạt:

```bash
mkdir -p webp

for f in *.png; do
  name="${f%.png}"
  magick "$f" \
    -trim +repage \
    -resize 224x224 \
    -background none \
    -gravity center \
    -extent 256x256 \
    -strip \
    -define webp:lossless=true \
    "webp/${name}.webp"
done
```

---

# 11. Cấu trúc thư mục đề xuất

```text
public/
└── assets/
    └── runes/
        ├── frames/
        │   ├── frame_challenge.webp
        │   └── frame_support.webp
        ├── challenge/
        │   ├── frenzy.webp
        │   ├── lifesteal_enemy.webp
        │   ├── defense.webp
        │   └── ...
        └── support/
            ├── lifesteal_allies.webp
            ├── weaken_enemies.webp
            ├── morale.webp
            └── ...
```

---

# 12. Checklist trước khi giữ một ảnh

- Thu nhỏ xuống 64×64 vẫn nhận ra ý chính.
- Không có chữ giả hoặc ký tự rác nổi bật.
- Không có nền đen dính vào vật thể.
- Không có khung riêng nếu đang dùng khung chung.
- Silhouette của Rune không trùng Rune khác.
- Thử Thách nhìn nguy hiểm hơn Hỗ Trợ ngay cả khi chưa đọc tên.
- Màu đỏ/tím không che mất vùng tối.
- Ánh sáng vàng/xanh không cháy trắng.
- Không dùng chi tiết mỏng dưới khoảng 4 px ở bản 256×256.
