# Kế hoạch theo chặng + rà soát prompt cho hệ Counter 2 lớp (Element + Class)

## 1) Khảo sát code hiện tại (ưu tiên tái sử dụng)

### 1.1 Điểm neo combat nên tận dụng trước
- `dealAbilityDamage(Game, attacker, target, opts)` trong `src/combat.ts` đang là tuyến xử lý sát thương trung tâm cho cả skill/basic, đã có pipeline theo thứ tự: `beforeDamage` -> xuyên giáp/kháng -> luật tuyệt đối -> hấp thụ khiên -> trừ máu -> `afterDamage` -> Fury. Đây là vị trí phù hợp nhất để cắm Counter 2 lớp, thay vì tạo pipeline mới song song.
- `basicAttack` đã gọi lại `dealAbilityDamage`, nên nếu cắm ở `dealAbilityDamage` thì basic/skill cùng hưởng mà không duplicate logic.
- `Statuses.beforeDamage/afterDamage` đã là điểm mở rộng có sẵn cho hiệu ứng chiến đấu; không cần tự viết “hook hệ mới” từ đầu nếu chỉ cần bơm multiplier và metadata combat.

### 1.2 Dữ liệu class hiện có
- `UnitToken` đã có `class?: string`, nhưng chưa có `element` trong type gốc. Prompt yêu cầu mọi thực thể (kể cả NPC/Boss) đều phải có `class` + `element`, nên cần mở rộng type và dữ liệu spawn/roster.
- Catalog/meta đã chuẩn hóa `class` qua `getMetaById`, `Meta.classOf` và các adapter; đây là trục dữ liệu class nên tái dùng để fallback khi token runtime thiếu `class`.

### 1.3 UI/UX hiện có và khoảng trống
- UI deck (`src/ui.ts`) mới render cost/card id, chưa có render icon nguyên tố/lớp.
- VFX có hệ event màu (`src/vfx.ts`) nhưng chưa có chuẩn “ADVANTAGE/CRITICAL” riêng theo counter.
- Event bus (`src/events.ts`) có ACTION_START/END và TURN events, có thể mở rộng payload để truyền `damageContext` (element/class bonus) cho HUD mà không hardcode trực tiếp vào logic combat.

## 2) Soi prompt hiện tại: điểm mạnh, điểm thiếu, điểm mơ hồ

### 2.1 Điểm mạnh
- Có objective rõ (counter 2 lớp), có matrix cụ thể cho element/class.
- Có quy tắc cộng dồn (additive), có ví dụ expected (`Archer Lightning` đánh `Mage Blood` = +20%).
- Có yêu cầu kỹ thuật trọng tâm (hàm global tính damage) + yêu cầu UX.

### 2.2 Điểm thiếu/mơ hồ cần “chốt” trước khi code
1. **Tên class không đồng bộ với codebase hiện tại**:
   - Prompt dùng `Archer`, code hiện dùng `Ranger` (trong `CLASS_BASE`).
   - Nếu không định nghĩa mapping `Archer -> Ranger`, sẽ vỡ ma trận class.
2. **Mức ưu tiên nguồn dữ liệu class/element**:
   - Lấy từ token runtime hay meta catalog khi lệch nhau? Cần quy tắc fallback rõ.
3. **Element taxonomy chưa chốt format**:
   - Prompt dùng tên Việt (`Hoa/Kim/...`) và Anh (`Fire/Metal/...`) lẫn nhau; cần enum canonical và alias mapping.
4. **Wind+Fire synergy chưa chốt trigger scope**:
   - Áp khi nào (đầu trận, realtime khi lineup đổi)?
   - Áp lên mọi đòn Fire hay chỉ skill có tag burn?
   - “5% Burn chance hoặc 5% Damage”: là chọn 1 trong 2 theo config, hay cộng cả 2?
5. **Vị trí áp dụng trong pipeline damage**:
   - Prompt nói “before defense/reduction” nhưng chưa chốt có nằm trước/ sau `Statuses.beforeDamage`.
6. **Hiển thị ADVANTAGE/CRITICAL**:
   - Chỉ hiển thị khi có bonus > 0 hay phân biệt class advantage vs element advantage bằng màu khác?
7. **Tương thích ngược dữ liệu cũ**:
   - Entity cũ chưa có `element` xử lý thế nào? (neutral mặc định hay fail-fast?)
8. **Đối tượng áp dụng**:
   - Có áp cho DoT/reflect/fixed damage không, hay chỉ direct hit từ `dealAbilityDamage`?

## 3) Prompt hoàn thiện đề xuất (đã bắt bẻ + chốt ràng buộc)

> Mục tiêu: triển khai Counter 2 lớp (Element + Class) theo hướng **không phá vỡ logic combat hiện có**, ưu tiên tái sử dụng `dealAbilityDamage`, `Meta`, `Statuses`, và pipeline event/VFX hiện hữu.
>
> ### A. Chuẩn dữ liệu
> 1) Mọi `UnitToken` có trường `element?: ElementName` và `class?: ClassNameLike`.
> 2) Canonical `ElementName` dùng English uppercase: `FIRE, METAL, WOOD, EARTH, LIGHTNING, BLOOD, WATER, LIGHT, DARK, WIND`.
> 3) Alias parser cho input Việt/Anh (`Hoa/Fire`, `Kim/Metal`, ...), normalize về canonical.
> 4) Class mapping: `Archer` trong thiết kế tương đương `Ranger` runtime. Ma trận class phải hỗ trợ alias 2 chiều.
>
> ### B. Luật Counter
> 1) Element cycle +10% theo vòng: `FIRE -> METAL -> WOOD -> EARTH -> LIGHTNING -> BLOOD -> WATER -> FIRE`.
> 2) Mutual +10%: `LIGHT <-> DARK`.
> 3) `WIND` không counter ai; synergy lineup: nếu cùng side có ít nhất 1 `WIND` và 1 `FIRE`, mọi đòn của attacker `FIRE` nhận thêm `+5% damage` (MVP1). Biến thể +burnChance để phase sau.
> 4) Class matrix:
>    - Assassin: +10% vs Mage, +5% vs Support
>    - Mage: +10% vs Warrior, +5% vs Tanker
>    - Tanker: +10% vs Assassin, +5% vs Summoner
>    - Warrior: +10% vs Tanker, +5% vs Ranger(Archer)
>    - Ranger(Archer): +10% vs Mage, +5% vs Support
>    - Summoner: +10% vs Ranger(Archer), +5% vs Warrior
>    - Support: +10% vs Summoner, +5% vs Mage
> 5) Cộng dồn tuyến tính: `finalBonus = classBonus + elementBonus + synergyBonus`.
>
> ### C. Pipeline tính damage
> 1) Tạo helper toàn cục `calculateFinalDamage(attacker, defender, rawDamage, context)` trong module combat helper (không tạo engine mới).
> 2) Trong `dealAbilityDamage`, áp bonus counter **sau khi có `pre.base` từ `Statuses.beforeDamage` và trước lớp phòng thủ/kháng**.
> 3) Bonus chỉ áp cho direct damage path qua `dealAbilityDamage` (không tự động áp DoT/reflect ở MVP1).
> 4) Nếu thiếu/invalid element/class -> bonus phần đó = 0 (an toàn tương thích ngược).
>
> ### D. UI/UX & Telemetry
> 1) Bổ sung metadata result: `{ classBonusPct, elementBonusPct, synergyBonusPct, totalCounterBonusPct }`.
> 2) Khi `totalCounterBonusPct > 0`: hiển thị text `ADVANTAGE` + màu damage vàng; nếu crit đồng thời thì ưu tiên label `CRITICAL` và thêm badge advantage nhỏ.
> 3) Character Card và Stage/Boss Info hiển thị icon class + element.
>
> ### E. Test/AC
> - Unit test matrix element/class (bao gồm alias Archer/Ranger).
> - Unit test stacking (+20% với ví dụ Lightning Ranger vs Blood Mage).
> - Unit test compatibility (unit thiếu element không crash).
> - UI test render icon class/element ở card + boss panel.

## 4) Kế hoạch triển khai theo chặng (milestone)

### Chặng 0 — Khoanh vùng + thiết kế không phá cũ
- Đầu ra:
  - Tài liệu mapping canonical/alias cho class-element.
  - Quyết định “MVP1 synergy = +5% damage cho Fire khi có Wind đồng minh”.
- Check:
  - Review call graph từ `basicAttack` -> `dealAbilityDamage` để xác nhận điểm cắm duy nhất.

### Chặng 1 — Data model & normalize layer
- Việc làm:
  1) Mở rộng type `UnitToken` và type config liên quan để có `element`.
  2) Tạo module normalize nhỏ (element/class alias parser) dùng chung combat + UI.
  3) Không sửa `dist/app.js`; chỉ sửa source TS.
- Ưu tiên tái dụng:
  - Tận dụng `Meta.classOf/getMetaById` để fallback class.

### Chặng 2 — Counter core trong combat
- Việc làm:
  1) Thêm matrix hằng số cho element/class (data-driven object).
  2) Tạo `calculateFinalDamage(...)` (hoặc helper cùng nghĩa) để tính bonus additive.
  3) Cắm vào `dealAbilityDamage` trước mitigation.
  4) Trả thêm metadata bonus để UI/VFX dùng.
- Kiểm soát rủi ro:
  - Guard khi thiếu field để không ảnh hưởng unit legacy.

### Chặng 3 — UI/UX hiển thị advantage + icon
- Việc làm:
  1) Mở rộng render card/stage panel để có icon class + element.
  2) Hiển thị màu damage/label advantage khi counter dương.
  3) Không hardcode trong nhiều nơi: đọc từ metadata damage result.
- Tận dụng:
  - Dùng event bus hiện tại để chuyển context thay vì phụ thuộc chéo combat->UI.

### Chặng 4 — Test + hiệu chỉnh
- Việc làm:
  1) Bổ sung test unit cho matrix, stacking, alias, compatibility.
  2) Bổ sung test integration cho combat result metadata.
  3) Nếu có UI test harness, thêm snapshot/DOM assertions cho icon.
- Exit criteria:
  - Không regression các test combat hiện có.
  - Case mẫu `Lightning Ranger` đánh `Blood Mage` ra +20% trước mitigation.

## 5) Danh sách quyết định bắt buộc trước khi dev (Definition of Ready)
1. Chốt alias `Archer == Ranger`.
2. Chốt canonical enum cho element + class.
3. Chốt synergy Wind+Fire ở MVP1 là +5% damage (chưa +burnChance).
4. Chốt phạm vi áp dụng: direct damage path only.
5. Chốt chuẩn UX khi vừa Crit vừa Advantage.

## 6) Checklist đánh giá prompt “đủ chín”
- [x] Không mơ hồ về tên lớp (Archer/Ranger).
- [x] Không mơ hồ về enum nguyên tố + alias.
- [x] Không mơ hồ về vị trí cộng bonus trong pipeline.
- [x] Không mơ hồ về scope áp dụng (direct hit vs DoT).
- [x] Không mơ hồ về UI state khi đồng thời crit/advantage.
- [x] Có AC test được, có ví dụ số học kiểm chứng.
