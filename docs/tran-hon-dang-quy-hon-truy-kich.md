# Bổ sung — Trấn Hồn Đăng và Quy Hồn Truy Kích

> Phần này bổ sung vào `vinh-da-economy-resources-modules-balance.md`.
>
> Đây là cơ chế cứu run một lần, gắn với world map và Truyền Tống Trận.  
> Chốt dùng **kiến trúc Trấn Hồn Đăng**, không dùng phương án rune.

---

## 1. Tên gọi chốt

```text
Kiến trúc: Trấn Hồn Đăng
Cơ chế: Quy Hồn Truy Kích
Trạng thái world map: Vĩnh Dạ Truy Kích
Base sau khi hồi về map cũ: Pha Lê Tàn Ấn
Trận đánh cứu run: Trận Truy Kích
```

Ý nghĩa:

- `Trấn Hồn Đăng` là kiến trúc neo định linh hồn và dấu ấn của base tại map cũ.
- `Quy Hồn Truy Kích` là cơ chế kéo leader/base về map cũ khi thất bại ở map mới.
- `Vĩnh Dạ Truy Kích` là trạng thái world map cho biết phe Vĩnh Dạ từ map mới đang truy kích về map cũ.
- `Pha Lê Tàn Ấn` là trạng thái base sau khi được kéo về map cũ trong tình trạng hư hại.
- `Trận Truy Kích` là trận đánh phát sinh ở map cũ để cứu run.

---

## 2. Trấn Hồn Đăng

### 2.1. Vai trò

Trấn Hồn Đăng là kiến trúc đặc biệt được xây tại map cũ trước khi player rời map đó bằng Truyền Tống Trận.

Nó cho phép player có đúng **1 lần** tránh end run ngay lập tức khi thất bại ở map mới.

Nếu leader chết hoặc base bị phá ở map mới, Trấn Hồn Đăng sẽ kích hoạt, kéo leader và base về map cũ gần nhất có Trấn Hồn Đăng chưa sử dụng.

### 2.2. Chi phí xây dựng

```text
1 Hư Không Thạch cùng tier map
3 Bụi Phong Ấn
1 Nguyện Thạch cùng tier map
8 Dạ Thạch cùng tier map
4 Hắc Cốt
```

Ký hiệu theo hệ thống tài nguyên:

```text
1 HKT cùng tier map
3 BPA
1 NGT cùng tier map
8 DT cùng tier map
4 HC
```

### 2.3. Điều kiện xây dựng

Chỉ có thể xây Trấn Hồn Đăng khi:

```text
Base còn sống
Leader còn sống
Map hiện tại đã tìm thấy, sửa chữa hoặc xây được Truyền Tống Trận
Chưa từng kích hoạt Quy Hồn Truy Kích trong run hiện tại
```

Khuyến nghị:

- Chỉ cho xây ở giai đoạn ban ngày hoặc giai đoạn chuẩn bị rời map.
- Không cho xây trong đêm đang bị tấn công.
- Không cho xây sau khi base đã vào trạng thái Pha Lê Tàn Ấn.
- Không cho tháo để hoàn tài nguyên.
- Không cho chuyển Trấn Hồn Đăng sang map mới.

### 2.4. Giới hạn

```text
Mỗi run chỉ kích hoạt Quy Hồn Truy Kích tối đa 1 lần.
```

Prototype nên dùng luật đơn giản:

```text
Mỗi run chỉ có 1 Trấn Hồn Đăng hợp lệ.
```

Nếu sau này cho phép nhiều map cũ cùng có Trấn Hồn Đăng, code vẫn phải bảo đảm:

```text
Chỉ Trấn Hồn Đăng gần nhất theo tuyến world map được dùng.
Sau khi kích hoạt, toàn bộ Trấn Hồn Đăng khác trong run mất hiệu lực.
```

---

## 3. Khi vào Truyền Tống Trận

Khi player đưa base vào Truyền Tống Trận, bất kể đó là truyền tống trận tự xây hay truyền tống trận cũ đã sửa chữa:

```text
Map hiện tại hoàn thành.
Game kết toán tài nguyên.
Player nhận phần thưởng theo Tỉ Lệ Thu Hoạch hiện tại.
World map mở khóa vùng tier cao hơn.
Base chuyển sang vùng mới.
Toàn bộ kiến trúc, module, mỏ, bẫy, tháp, nhà lính, nhà thờ và tài nguyên chưa kết toán ở map cũ bị bỏ lại.
```

Ngoại lệ:

```text
Trấn Hồn Đăng đã xây ở map cũ vẫn tồn tại như một mốc neo hồn trên world map.
Nó không đi theo base sang map mới.
Nó chỉ dùng để kích hoạt Quy Hồn Truy Kích nếu player thất bại ở map mới.
```

Tài nguyên nhận được khi kết toán:

- Nguyên Tinh đã kết toán.
- Tài nguyên được hệ thống cho phép mang ra ngoài sau khi hoàn thành map.
- Phần thưởng hoàn thành map.
- Vật phẩm tiến trình hợp lệ.

Tài nguyên không được giữ nếu chưa kết toán hoặc bị bỏ lại theo luật map:

- Vật phẩm rơi trên đất chưa thu.
- Tài nguyên trong module chưa khai thác.
- Công trình đã xây.
- Vật liệu đang nằm trong công trình hoặc bẫy.
- Lính/NPC bị bỏ lại nếu luật mode không cho mang theo.

---

## 4. Khi thất bại ở map mới

### 4.1. Điều kiện thất bại

Thất bại ở map mới xảy ra khi:

```text
Leader chết
hoặc Base bị phá
```

### 4.2. Nếu không có Trấn Hồn Đăng hợp lệ

Nếu không có Trấn Hồn Đăng hợp lệ, hoặc Quy Hồn Truy Kích đã từng kích hoạt trong run này:

```text
End run.
Player phải bắt đầu run mới nếu muốn chơi tiếp.
Tài nguyên đã kết toán từ các map thắng trước đó vẫn giữ nguyên.
Tài nguyên chưa kết toán trong map vừa thua bị mất.
```

### 4.3. Nếu có Trấn Hồn Đăng hợp lệ

Nếu có Trấn Hồn Đăng hợp lệ và Quy Hồn Truy Kích chưa từng kích hoạt trong run này:

```text
Không end run ngay.
Kích hoạt Quy Hồn Truy Kích.
Leader và base bị kéo về map cũ gần nhất có Trấn Hồn Đăng.
Map mới vừa thua bị đánh dấu là nguồn Vĩnh Dạ Truy Kích.
World map hiện dấu cảnh báo trên map cũ.
World map vẽ một line nối từ map mới vừa thua sang map cũ.
```

Map mới vừa thua:

```text
Không kết toán tài nguyên.
Tài nguyên chưa gửi vào base bị mất.
Kiến trúc/module đã xây ở map mới coi như thất thủ.
Quái/boss/map state của map mới được dùng để sinh Trận Truy Kích ở map cũ.
```

Rune:

```text
Bộ rune player đã chọn khi vào map mới được ghi nhớ.
Khi Vĩnh Dạ truy kích về map cũ, quái từ map mới vẫn chịu tác động của bộ rune đó.
Tỉ Lệ Thu Hoạch của Trận Truy Kích cũng dùng bộ rune đó.
Vì đã kết toán nên rune map cũ không còn hoạt động khi bị Vĩnh Dạ truy kích đến mà rune player dùng ở map mới sẽ được thay thế bộ rune cũ.

```

---

## 5. Trạng thái Pha Lê (Tàn)

Khi Quy Hồn Truy Kích kích hoạt, base trở về map cũ trong trạng thái:

```text
Pha Lê (Tàn)
```

### 5.1. Chỉ số và cấp base

Base trở về dạng:

```text
Base lv1 tàn
```

Quy tắc:

- Không giữ cấp base cao từ map mới.
- Không giữ buff của base cũ.
- Không tự động phục hồi về cấp base từng có ở map cũ.
- Base có thể được sửa chữa lại theo luật sửa chữa riêng.

### 5.2. Tính năng bị tắt

Pha Lê (Tàn) không có:

```text
Buff lãnh địa
Hồi HP cho leader
Hồi HP cho đồng minh
Khiên ban đêm
Hiệu ứng cứu nguy lv5/lv6
Hiệu ứng nhánh base
Aura hoặc bonus chiến đấu từ base
```

### 5.3. Tính năng còn giữ

Pha Lê (Tàn) vẫn có:

```text
Chức năng chắt lọc tài nguyên
Chức năng chứa năng lượng lỏng
Chức năng kết toán sau khi thắng Trận Truy Kích
Tư cách là mục tiêu cần bảo vệ
```

### 5.4. Thâm hụt chắt lọc tăng 50%

Khi base ở trạng thái Pha Lê (Tàn) , thâm hụt trong quá trình chắt lọc/ngưng tụ tăng 50% so với bình thường.

Nếu bình thường:

```text
Dạ Thạch → HNT lỏng: mất 10%
HNT lỏng → HNT cứng: mất 10%
```

Thì khi Pha Lê (Tàn):

```text
Dạ Thạch → HNT lỏng: mất 15%
HNT lỏng → HNT cứng: mất 15%
```

Ví dụ:

```text
Bình thường:
1 Dạ Thạch tier 1.1
→ 0.9 HNT lỏng
→ 0.81 HNT cứng

Pha Lê Tàn Ấn:
1 Dạ Thạch tier 1.1
→ 0.85 HNT lỏng
→ 0.7225 HNT cứng
```

Nếu code dùng hệ số tổng:

```text
NormalCondenseEfficiency = 0.9 × 0.9 = 0.81
RuinedCondenseEfficiency = 0.85 × 0.85 = 0.7225
```

### 5.5. Sửa chữa Pha Lê Tàn Ấn

Khuyến nghị prototype:

```text
Chỉ cho sửa Pha Lê (Tàn) về Base lv1 thường.
Không cho phục hồi ngay về cấp base cao trước đó.
```

Chi phí sửa đề xuất:

```text
4 Dạ Thạch cùng tier map cũ
4 Hắc Thiết cùng tier map cũ
2 Hắc Cốt
1 Bụi Phong Ấn
```

Sau khi sửa:

```text
Base trở lại Base lv1 thường.
Mở lại buff/hồi phục của Base lv1.
Tỉ lệ thâm hụt chắt lọc trở về bình thường.
```

Nếu không sửa, player vẫn có thể cố thủ bằng kiến trúc/lính/tài nguyên còn lại ở map cũ, nhưng base không hỗ trợ chiến đấu.

---

## 6. Vĩnh Dạ Truy Kích trên world map

### 6.1. Hiển thị

Khi Quy Hồn Truy Kích kích hoạt:

```text
Map cũ hiện dấu cảnh báo: !
Có line nối từ map mới vừa thua về map cũ.
Line thể hiện hướng truy kích của Vĩnh Dạ.
Map mới vừa thua có trạng thái nguồn truy kích.
```

UI tooltip trên map cũ:

```text
Vĩnh Dạ Truy Kích
Kẻ thù từ vùng [Tên map mới] đang lần theo Trấn Hồn Đăng.
Rune đã chọn ở vùng thất thủ không còn hiệu lực.
```

### 6.2. Dữ liệu cần lưu

Khi kích hoạt Quy Hồn Truy Kích, lưu snapshot:

```ts
type VinhDaPursuitState = {
  active: boolean;
  consumedSoulAnchor: boolean;
  sourceMapId: string;
  fallbackMapId: string;
  sourceMapTier: VinhDaTier;
  selectedRuneIds: string[];
  harvestRate: number;
  enemyPoolSnapshot?: string[];
  bossState?: {
    bossId: string;
    hpRatio?: number;
    phase?: string;
  };
};
```

Tối thiểu cần lưu:

```text
sourceMapId
fallbackMapId
sourceMapTier
selectedRuneIds
harvestRate
consumedSoulAnchor = true
```

Boss state có thể làm đơn giản ở prototype:

```text
Không giữ HP boss từ map mới.
Trận Truy Kích sinh boss/wave theo template riêng của map mới.
```

---

## 7. Trận Truy Kích

### 7.1. Nơi diễn ra

Trận Truy Kích diễn ra tại map cũ.

Nhưng:

```text
Quái, boss, escort budget và tier lấy từ map mới vừa thua.
Không hạ tier quái xuống tier map cũ.
Không scale quái theo kiến trúc map cũ.
```

### 7.2. Rune

```text
Toàn bộ rune player đã chọn khi vào map mới tiếp tục áp dụng.
Rune Thử Thách vẫn làm quái mạnh hơn.
Rune Hỗ Trợ vẫn giảm Tỉ Lệ Thu Hoạch nếu đã được chọn.
Tỉ Lệ Thu Hoạch của Trận Truy Kích dùng giá trị đã tính từ map mới.
```

### 7.3. Kiến trúc và tài nguyên của map cũ

Player được dùng:

```text
Kiến trúc còn lại ở map cũ
Tài nguyên đã tích ở map cũ nếu còn trong kho mode
Lính/NPC ở lại map cũ
Base Pha Lê (Tàn) hoặc Base lv1 nếu đã sửa
```

Không được dùng:

```text
Kiến trúc đã xây ở map mới
Tài nguyên chưa kết toán ở map mới
Module chưa khai thác ở map mới
Lính đã mất hoặc bị bỏ lại ở map mới, Khi kích hoạt Trấn Hồn Đăng, thứ xuất hiện ở map cũ xây kiến trúc này là leader và base cùng năng lượng trong base, mọi tài nguyên, lính, npc ở map mới không thể đem theo.

```

### 7.4. Nếu thắng Trận Truy Kích

Khi thắng:

```text
Player sống sót.
Kết toán tài nguyên lần nữa.
Nhận tài nguyên từ quái/boss của map mới vì chúng đã bị giết ở map cũ.
Tỉ Lệ Thu Hoạch áp dụng theo rune đã chọn ở map mới.
World map xóa dấu !
Line truy kích biến mất.
Trấn Hồn Đăng bị tiêu hao vĩnh viễn trong run này.
Quy Hồn Truy Kích không thể kích hoạt lần nữa trong cùng run.
Player có thể tiếp tục progression theo world map.
Đến map mới (nơi thất thủ) là lựa chọn duy nhất của player, nơi đó 
```

### 7.5. Nếu thua Trận Truy Kích

Nếu leader chết hoặc base bị phá trong Trận Truy Kích:

```text
End run.
Không có hồi sinh lần hai.
Tài nguyên đã kết toán ở các map thắng trước vẫn giữ.
Tài nguyên chưa kết toán trong Trận Truy Kích bị mất.
```

---

## 8. Quy tắc code đề xuất

### 8.1. Trạng thái run

Thêm vào run state:

```ts
type VinhDaRunState = {
  soulAnchorBuilt: boolean;
  soulAnchorMapId?: string;
  soulAnchorConsumed: boolean;
  pursuitState?: VinhDaPursuitState;
};
```

### 8.2. Điều kiện build

```ts
function canBuildSoulAnchor(state: VinhDaRunState, map: VinhDaMapState): boolean {
  return (
    !state.soulAnchorConsumed &&
    !state.soulAnchorBuilt &&
    map.baseAlive &&
    map.leaderAlive &&
    map.teleportGateAvailable
  );
}
```

### 8.3. Kích hoạt khi thua

```ts
function handleVinhDaDefeat(state: VinhDaRunState, defeatedMap: VinhDaMapState): DefeatResult {
  if (state.soulAnchorBuilt && !state.soulAnchorConsumed && state.soulAnchorMapId) {
    return activateSoulReturnPursuit(state, defeatedMap);
  }

  return {
    type: 'END_RUN',
    keepSettledRewards: true,
    loseUnsettledResources: true,
  };
}
```

### 8.4. Kích hoạt Quy Hồn Truy Kích

```ts
function activateSoulReturnPursuit(
  state: VinhDaRunState,
  defeatedMap: VinhDaMapState,
): DefeatResult {
  state.soulAnchorConsumed = true;

  state.pursuitState = {
    active: true,
    consumedSoulAnchor: true,
    sourceMapId: defeatedMap.id,
    fallbackMapId: state.soulAnchorMapId!,
    sourceMapTier: defeatedMap.tier,
    selectedRuneIds: defeatedMap.selectedRuneIds,
    harvestRate: defeatedMap.harvestRate,
  };

  return {
    type: 'SOUL_RETURN_PURSUIT',
    fallbackMapId: state.soulAnchorMapId!,
    sourceMapId: defeatedMap.id,
    baseState: 'RUINED_SEAL_CRYSTAL',
    keepSettledRewards: true,
    loseUnsettledResources: true,
  };
}
```

### 8.5. Hệ số chắt lọc

```ts
const NORMAL_LIQUID_EXTRACTION_EFFICIENCY = 0.9;
const NORMAL_CONDENSE_EFFICIENCY = 0.9;

const RUINED_LIQUID_EXTRACTION_EFFICIENCY = 0.85;
const RUINED_CONDENSE_EFFICIENCY = 0.85;
```

Hàm:

```ts
function getBaseExtractionEfficiency(baseState: BaseState) {
  if (baseState === 'RUINED_SEAL_CRYSTAL') {
    return {
      liquid: RUINED_LIQUID_EXTRACTION_EFFICIENCY,
      condense: RUINED_CONDENSE_EFFICIENCY,
    };
  }

  return {
    liquid: NORMAL_LIQUID_EXTRACTION_EFFICIENCY,
    condense: NORMAL_CONDENSE_EFFICIENCY,
  };
}
```

---

## 9. Acceptance criteria

Codex/Dev hoàn thành khi:

- [ ] Có định nghĩa kiến trúc `Trấn Hồn Đăng`.
- [ ] Có chi phí đúng: `1 HKT + 3 BPA + 1 NGT + 8 DT + 4 HC`.
- [ ] Trấn Hồn Đăng không phải rune.
- [ ] Trấn Hồn Đăng chỉ kích hoạt tối đa 1 lần/run.
- [ ] Vào Truyền Tống Trận luôn kết toán map và mở vùng tier cao hơn.
- [ ] Khi vào map mới, kiến trúc/module map cũ bị bỏ lại.
- [ ] Nếu thua map mới và có Trấn Hồn Đăng, không end run ngay.
- [ ] Leader/base quay về map cũ có Trấn Hồn Đăng.
- [ ] World map hiển thị dấu `!` ở map cũ.
- [ ] World map có line nối từ map mới vừa thua sang map cũ.
- [ ] Quái/boss truy kích dùng tier của map mới, không dùng tier map cũ.
- [ ] Rune đã chọn khi vào map mới vẫn áp dụng cho Trận Truy Kích.
- [ ] Tỉ Lệ Thu Hoạch của Trận Truy Kích dùng bộ rune map mới.
- [ ] Base hồi về là `Pha Lê Tàn Ấn`.
- [ ] Pha Lê Tàn Ấn không có buff, chỉ còn chắt lọc.
- [ ] Pha Lê Tàn Ấn tăng thâm hụt chuyển đổi tài nguyên thêm 50%.
- [ ] Thắng Trận Truy Kích thì kết toán lần nữa và xóa trạng thái truy kích.
- [ ] Thua Trận Truy Kích thì end run.
- [ ] Tài nguyên đã kết toán trước đó vẫn giữ khi end run.
