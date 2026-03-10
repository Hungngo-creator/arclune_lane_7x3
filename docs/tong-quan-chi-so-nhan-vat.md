# Tổng quan hệ chỉ số nhân vật (ArcLune Lane 7x3)

> Tài liệu này tổng hợp từ mã nguồn hiện tại để bạn có thể đưa cho AI khác phân tích/cân bằng tiếp.

## 1) Bộ chỉ số đang dùng

### 1.1 Chỉ số runtime trên UnitToken
Hệ thống unit runtime hỗ trợ các nhóm chỉ số chính:

- Sinh tồn: `hpMax`, `hp`, `hpRegen`
- Tấn công/phòng thủ: `atk`, `wil`, `arm`, `res`
- Nhịp/độ chính xác: `agi`, `per`, `spd`
- Tài nguyên kỹ năng: `aeMax`, `ae`, `aeRegen`
- Tài nguyên nộ/ult: `fury`, `furyMax`, `rage`

(Định nghĩa kiểu nằm ở `StatBlock`/`UnitToken`).

---

## 2) Công thức tính chỉ số đầy đủ (pipeline)

## 2.1 Nền class (base stat)
Mỗi class có base cố định trong `CLASS_BASE`:

- Mage: HP 720, ATK 28, WIL 30, ARM 0.08, RES 0.12, AGI 10, PER 12, SPD 1.00, AEmax 110, AEregen 8.0, HPregen 14
- Tanker: HP 1000, ATK 22, WIL 20, ARM 0.18, RES 0.14, AGI 9, PER 10, SPD 0.95, AEmax 60, AEregen 4.0, HPregen 22
- Ranger: HP 720, ATK 35, WIL 16, ARM 0.08, RES 0.08, AGI 12, PER 14, SPD 1.20, AEmax 75, AEregen 7.0, HPregen 12
- Warrior: HP 800, ATK 30, WIL 18, ARM 0.14, RES 0.08, AGI 11, PER 11, SPD 1.10, AEmax 70, AEregen 6.0, HPregen 16
- Summoner: HP 660, ATK 22, WIL 26, ARM 0.08, RES 0.14, AGI 10, PER 10, SPD 1.05, AEmax 90, AEregen 8.5, HPregen 18
- Support: HP 760, ATK 24, WIL 24, ARM 0.10, RES 0.13, AGI 10, PER 11, SPD 1.00, AEmax 100, AEregen 7.5, HPregen 20
- Assassin: HP 640, ATK 36, WIL 16, ARM 0.06, RES 0.08, AGI 14, PER 16, SPD 1.25, AEmax 65, AEregen 6.0, HPregen 10

---

## 2.2 TP (Talent Point) + delta theo từng stat
Từ `TP_DELTA`, mỗi 1 TP cộng trực tiếp vào stat pre-rank như sau:

- HP: +20
- ATK: +1
- WIL: +1
- ARM: +0.01
- RES: +0.01
- AGI: +1
- PER: +1
- AEmax: +10
- AEregen: +0.5
- HPregen: +2

Công thức:

- `preRank[stat] = base[stat] + TP_DELTA[stat] * tpAlloc[stat]` (nếu stat có trong TP_DELTA)
- Stat không có delta TP thì giữ nguyên.

---

## 2.3 Rank multiplier (nhân bậc)
Bảng rank multiplier hiện dùng trong `catalog.ts`/`roster-preview.ts`:

- N: 0.80
- R: 0.85
- SR: 0.95
- SSR: 1.10
- UR: 1.30
- Prime: 1.55

Công thức rank:

- Nếu stat khác SPD: `final[stat] = round(preRank[stat] * rankMultiplier)`
- Nếu stat là SPD: **không nhân rank**, chỉ làm tròn theo precision.

Lưu ý: trong `meta.makeInstanceStats`, có cộng thêm sao:

- `rankMultWithStars = RANK_MULT[rank] + stars * 0.05`
- Áp dụng cho HP/ATK/WIL/ARM/RES (SPD không nhân)

---

## 2.4 Level growth (meta runtime)
Trong `makeInstanceStats`, trước khi nhân rank có step tăng theo level:

- `currentBase = classBase + (level - 1) * CLASS_GROWTH[class]` cho các stat: HP, ATK, WIL, ARM, RES.

`CLASS_GROWTH` theo class:

- Tanker: HP +25, ATK +0.5, WIL +0.5, ARM +0.01, RES +0.005 mỗi level
- Warrior: HP +20, ATK +1.2, WIL +0.8, ARM +0.008, RES +0.008
- Mage: HP +15, ATK +0.5, WIL +1.5, ARM +0.005, RES +0.01
- Support: HP +15, ATK +0.5, WIL +1.2, ARM +0.005, RES +0.01
- Ranger: HP +15, ATK +1.5, WIL +0.5, ARM +0.005, RES +0.005
- Assassin: HP +12, ATK +1.8, WIL +0.5, ARM +0.004, RES +0.004
- Summoner: HP +18, ATK +0.8, WIL +1.2, ARM +0.006, RES +0.008

---

## 2.5 Công thức tổng hợp khuyến nghị để AI khác dùng

Nếu muốn mô phỏng gần runtime hiện tại:

1. Lấy base class.
2. Tăng theo level cho HP/ATK/WIL/ARM/RES bằng CLASS_GROWTH.
3. Cộng TP vào các stat có TP_DELTA.
4. Áp rank multiplier (và stars nếu mô phỏng đúng `makeInstanceStats`).
5. Với SPD: không nhân rank/stars.
6. Cuối cùng áp buff/debuff/passive/cultivation (nếu bật hệ đó).

---

## 3) Chỉ số “+” của 7 class (đọc nhanh)

### 3.1 Điểm mạnh nền theo CLASS_BASE
- Tanker: HP/ARM/RES cao nhất, SPD thấp (0.95), AEregen thấp.
- Assassin: ATK/PER/AGI/SPD cao, máu và giáp thấp.
- Mage: WIL cao + AEmax/AEregen cao.
- Ranger: ATK + SPD tốt, tầm bắn/nhịp cao.
- Warrior: cân bằng công-thủ, SPD 1.10.
- Support: HPregen/AEregen tốt, chỉ số khá cân bằng.
- Summoner: WIL + AE tốt, HP/giáp trung bình thấp.

### 3.2 Tương khắc class (class bonus trong combat)
`CLASS_BONUS_MAP` hiện tại:

- Assassin > Mage (+10%), phụ Support (+5%)
- Mage > Warrior (+10%), phụ Tanker (+5%)
- Tanker > Assassin (+10%), phụ Summoner (+5%)
- Warrior > Tanker (+10%), phụ Ranger (+5%)
- Ranger > Mage (+10%), phụ Support (+5%)
- Summoner > Ranger (+10%), phụ Warrior (+5%)
- Support > Summoner (+10%), phụ Mage (+5%)

---

## 4) Công thức damage tổng (sau khi đã có rawDamage)

Trong `calculateFinalDamage`:

1. `counterMultiplier = max(0, 1 + classBonus + elementBonus + synergyBonus)`
2. `total = floor(rawDamage)`
3. `total = floor(total * counterMultiplier)`
4. Nếu `ignoreAll=true` thì total = 0
5. `total = floor(total * defenseMultiplier)`
6. `total = floor(total * reductionMultiplier)`
7. Clamp không âm.

=> tức là bonus class/nguyên tố/synergy đi vào một lớp nhân trước các lớp mitigation khác.

---

## 5) TP (Talent Point) — cách hiểu vận hành

- TP thực chất là “đơn vị phân bổ” vào stat, không phải rank riêng.
- `totalTP` = tổng toàn bộ TP đã phân cho unit (sau sanitize/round).
- Từ `mods` có thể suy ngược TP bằng:
  - `tp[stat] = (base[stat] * modValue) / TP_DELTA[stat]`

Điều này giúp chuyển đổi qua lại giữa hệ `% mod` và hệ `TP tuyệt đối`.

---

## 6) Aether / Fury / Rage và tài nguyên kỹ năng

### 6.1 Aether regen theo class khi hành động
`AE_ACTION_REGEN_BY_CLASS`:

- Support 10
- Mage 7
- Summoner 7
- Warrior 5
- Tanker 5
- Ranger 5
- Assassin 3

Khi unit đã hành động hợp lệ, team pool được cộng lượng này.

### 6.2 Turn regen tại chỗ
Mỗi lượt unit có thể tự hồi:

- `hp = clamp(hp + hpRegen, 0..hpMax)`
- `ae = clamp(ae + aeRegen, 0..aeMax)`

### 6.3 Rage khởi tạo
- Unit từ deck thường có `onSpawn.rage` (nhiều kit đang để 100, trừ leader theo cờ `exceptLeader`).
- Leader thường bắt đầu 0, trừ khi kit/logic riêng ghi đè.

---

## 7) Hệ Tu Vi (Cultivation) — “vài thứ khác” rất quan trọng

`applyCultivationBonus` nhân theo tỉ lệ tổng từ realm/subrealm:

- `scaledStat = rawStat * (1 + totalBonus[stat])`

Các stat được tăng: `hpMax`, `hp`, `atk`, `wil`, `arm`, `res`, `aeMax`, `aeRegen`.

Ví dụ Realm 1 mỗi subrealm cho:

- hpMax +2%
- atk +1.5%
- wil +1.5%
- arm +1%
- res +1%
- aeMax +0.8%
- aeRegen +0.3%

(Realm cao có hệ số lớn hơn; realm 5/6/8/9 tăng khá mạnh).

---

## 8) Lưu ý quan trọng về độ nhất quán tài liệu

- Bộ “đang chạy cho catalog/preview/meta”: N 0.8, R 0.85, SR 0.95, SSR 1.1, UR 1.3, Prime 1.55.

---

## 9) Checklist prompt mẫu cho AI balance (gợi ý)

Bạn có thể copy prompt này để hỏi AI khác:

- Mục tiêu cân bằng: PvP nhịp 90–150s, không snowball sớm.
- Giữ nguyên framework:
  - TP delta hiện tại
  - SPD không nhân rank
  - 7 class + class counter map
  - Damage pipeline hiện tại
- Việc cần AI làm:
  1) Đề xuất lại rank multiplier theo mục tiêu TTK.
  2) Đề xuất rebalance CLASS_BASE + CLASS_GROWTH từng class.
  3) Đề xuất giới hạn trần TP theo cấp account.
  4) Đề xuất tuning AE_ACTION_REGEN_BY_CLASS để tránh class spam skill quá nhanh.
  5) Phân tích impact của cultivation realm 5+ lên power creep.

