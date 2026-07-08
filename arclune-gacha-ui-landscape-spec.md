# Arclune — Gacha UI Redesign Spec

## 0. Mục tiêu tài liệu

Tài liệu này là đặc tả triển khai trực tiếp cho Codex.

Mục tiêu là thiết kế lại toàn bộ UI gacha theo hướng:

- Landscape-first cho điện thoại xoay ngang.
- Không phụ thuộc asset để nhìn đẹp.
- Gọn, rõ, tối giản, chất lượng cao.
- Không dùng aura hoặc hiệu ứng ánh sáng lòe loẹt.
- Không để thông tin pity, tỉ lệ và quy tắc nằm rải rác.
- Không để màn hình phải cuộn dọc trong trạng thái sử dụng bình thường.
- Giữ tương thích với dữ liệu và logic gacha hiện có.
- Chuẩn bị sẵn chỗ để bổ sung asset banner, asset tiền tệ và icon nhân vật sau này.

Không chỉnh trực tiếp file bundle đầu ra như `dist/app.js` hoặc file tương đương.  
Phải chỉnh source TypeScript/CSS/HTML hiện có rồi build bằng `node build.mjs`.

---

# 1. Bối cảnh hiện tại

UI gacha hiện có các vấn đề:

- Hai vạch trắng ở góc trên trái không có giá trị sử dụng.
- Khu điều hướng banner bên trái còn thô và chiếm chỗ chưa hợp lý.
- Thông tin tỉ lệ, bảo hiểm, xác nhận triệu hồi bị rơi xuống góc trái dưới.
- Khu tiền tệ có quá nhiều chữ viết tắt và viền.
- Nút cost và nút triệu hồi đang tách thành nhiều hàng.
- Phần lịch sử kết quả luôn hiển thị, làm tốn chiều cao.
- Bố cục giống UI desktop thu nhỏ hơn là UI mobile landscape được thiết kế riêng.
- Khoảng trống lớn nhưng phân cấp thông tin chưa tốt.
- Nhiều thông tin quan trọng không nằm gần thao tác chính.

UI mới phải giải quyết các vấn đề trên mà không thay đổi logic gacha hiện có.

---

# 2. Quy tắc nền tảng

## 2.1. Landscape-first

UI được thiết kế trước tiên cho điện thoại xoay ngang.

Kích thước tham chiếu:

```text
Chiều rộng: 740–1000 px CSS
Chiều cao: 360–500 px CSS
Tỉ lệ phổ biến: 16:9, 18:9, 19.5:9, 20:9
```

Không thiết kế theo màn hình dọc rồi kéo ngang.

## 2.2. Không cuộn dọc trong màn hình chính

Trong trạng thái bình thường:

- Header nhìn thấy.
- Banner nhìn thấy.
- Rate-up nhìn thấy.
- Pity nhìn thấy.
- Nút triệu hồi nhìn thấy.
- Không cần scroll toàn trang.

Nếu chiều cao quá thấp, ưu tiên:

1. Giảm padding.
2. Ẩn subtitle phụ.
3. Thu nhỏ chiều cao banner.
4. Ẩn lịch sử khỏi màn hình chính.
5. Không tạo scroll dọc trừ trường hợp bắt buộc.

## 2.3. Không phụ thuộc asset

Không có asset vẫn phải đẹp nhờ:

- Layout.
- Typography.
- Spacing.
- Màu nền.
- Card nhẹ.
- Trạng thái active rõ.
- Nút triệu hồi tốt.
- Drawer thông tin hợp lý.

Asset chỉ là lớp nâng cấp sau.

## 2.4. Không thay đổi logic gacha

Không được tự ý thay đổi:

- Rate.
- Pity.
- Cost.
- Currency source.
- Featured unit.
- Kết quả quay.
- Logic confirm.
- Dữ liệu banner.

Chỉ thay UI và cách hiển thị.

---

# 3. Bố cục tổng thể

## 3.1. Landscape layout

Bố cục chính gồm 3 khu:

```text
┌───────────────┬───────────────────────────────────────┬─────────────┐
│ Banner Rail   │ Main Content                          │ Right Area  │
│               │                                       │             │
│ Chung         │ Header + Banner + Rate-up + Pity      │ Currency    │
│ UR            │                                       │ mini hub    │
│ Prime         │ Summon buttons                        │             │
└───────────────┴───────────────────────────────────────┴─────────────┘
```

Tỉ lệ tham chiếu:

```text
Banner rail: 15–18%
Main content: 62–68%
Right area: 17–20%
```

Trên màn hình hẹp, khu tiền tệ có thể chuyển vào topbar của main content.

## 3.2. Không dùng cột phải cố định khi thiếu không gian

Nếu chiều rộng không đủ:

- Banner rail vẫn giữ.
- Main content mở rộng.
- Currency mini hub chuyển lên góc trên phải của header.
- Drawer thông tin phủ từ cạnh phải lên main content.

---

# 4. Cấu trúc giao diện

## 4.1. Root layout

Đề xuất cấu trúc DOM:

```html
<section class="gacha-screen">
  <aside class="gacha-rail">
    <!-- banner tabs -->
  </aside>

  <main class="gacha-main">
    <header class="gacha-topbar">
      <!-- title, duration, actions, currency -->
    </header>

    <section class="gacha-banner-panel">
      <!-- banner art / placeholder -->
    </section>

    <section class="gacha-featured-section">
      <!-- featured chips -->
    </section>

    <section class="gacha-pity-section">
      <!-- pity chips -->
    </section>

    <section class="gacha-actions">
      <!-- summon x1/x10 -->
    </section>
  </main>

  <aside class="gacha-side-area">
    <!-- currency mini hub on wide layouts -->
  </aside>

  <div class="gacha-backdrop" hidden></div>

  <aside class="gacha-drawer" hidden>
    <!-- info or history drawer -->
  </aside>
</section>
```

Không bắt buộc đúng class name nếu code hiện tại đã có convention khác.  
Quan trọng là giữ component boundaries tương đương.

---

# 5. Banner rail bên trái

## 5.1. Mục đích

Hiển thị danh sách banner:

- Triệu Hồi Chung.
- Giới Hạn UR.
- Giới Hạn Prime.
- Các banner tương lai.

## 5.2. Bỏ hoàn toàn

- Hai vạch trắng góc trên trái.
- Placeholder không có chức năng.
- Header rỗng trong rail.

## 5.3. Item layout

Mỗi item có:

```text
Tên banner
Thời hạn hoặc trạng thái
```

Ví dụ:

```text
Triệu Hồi Chung
Vĩnh viễn
```

```text
Giới Hạn UR
Còn 7 ngày 12 giờ
```

## 5.4. Trạng thái active

Active item:

- Nền sáng hơn nhẹ.
- Có accent bar hoặc điểm sáng nhỏ bên trái.
- Không dùng glow mạnh.
- Chữ title sáng hơn.
- Subtitle có màu accent nhẹ.

Inactive item:

- Nền mờ.
- Chữ khoảng 65–70% opacity.
- Hover/press tăng sáng nhẹ.

## 5.5. Kích thước

```text
Rail width: clamp(128px, 16vw, 176px)
Item min-height: 42–48px
Gap: 6–8px
Padding: 8–10px
Border radius: 10–12px
```

## 5.6. Scroll rail

Nếu có quá nhiều banner:

- Cho rail scroll dọc riêng.
- Ẩn scrollbar hoặc làm scrollbar rất mảnh.
- Không scroll cả màn hình.

---

# 6. Topbar và header

## 6.1. Nội dung

Main header gồm:

- Tên banner.
- Trạng thái/thời hạn.
- Nút `?`.
- Nút lịch sử.
- Currency mini hub ở layout hẹp.

Ví dụ:

```text
TRIỆU HỒI CHUNG
Vĩnh viễn
```

Bên phải:

```text
[history] [?]
```

## 6.2. Không dùng nút “Quy tắc” dạng chữ lớn

Thay bằng icon `?`.

Icon cần:

- Kích thước 28–34px.
- Hit area tối thiểu 40px.
- Có aria-label.
- Không dùng border cứng.
- Nền mờ nhẹ.
- Hover/press state rõ.

## 6.3. History icon

Dùng icon lịch sử nhỏ cạnh `?`.

Bấm vào mở drawer lịch sử.

Không hiển thị grid lịch sử thường trực trong main screen.

---

# 7. Currency mini hub

## 7.1. Chọn phương án 1

Dùng mini hub trong suốt, mỗi tiền tệ là một khối nhỏ.

Hiển thị:

```text
[125K] [5.2K] [620] [120] [68]
```

Không hiện chữ viết tắt.

Thứ tự từ trái sang phải:

```text
Vụn → Hạ → Trung → Thượng → Thần
```

Thần Tinh nằm ngoài cùng bên phải.

## 7.2. Cấu trúc

```html
<div class="currency-mini-hub">
  <button class="currency-mini-item" data-currency="shard">125K</button>
  <button class="currency-mini-item" data-currency="lower">5.2K</button>
  <button class="currency-mini-item" data-currency="middle">620</button>
  <button class="currency-mini-item" data-currency="upper">120</button>
  <button class="currency-mini-item" data-currency="divine">68</button>
</div>
```

## 7.3. Visual

- Không có border riêng từng item.
- Có nền trong suốt hoặc rất mờ.
- Cả hub có thể dùng một lớp nền chung.
- Mỗi item có padding ngang nhỏ.
- Số canh giữa.
- Màu số trắng hoặc hơi khác nhau nhẹ.
- Sau này sẽ thêm icon/asset chìm dưới số.

Ví dụ:

```css
.currency-mini-hub {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
  border-radius: 12px;
  background: rgba(7, 15, 24, 0.42);
  backdrop-filter: blur(10px);
}

.currency-mini-item {
  position: relative;
  min-width: 44px;
  padding: 5px 7px;
  border: 0;
  background: rgba(255, 255, 255, 0.035);
  border-radius: 9px;
}
```

## 7.4. Định dạng số

Dùng formatter thống nhất:

```text
999 → 999
1,200 → 1.2K
12,500 → 12.5K
125,000 → 125K
1,250,000 → 1.25M
```

Không làm mất độ chính xác khi bấm tooltip.

## 7.5. Tooltip

Khi tap/click/long-press vào item:

Hiện:

```text
Vụn Nguyên Tinh
125,000
```

Tooltip tự đóng khi:

- Chạm chỗ khác.
- Chuyển banner.
- Mở drawer.
- Sau timeout ngắn nếu phù hợp.

## 7.6. Chuẩn bị asset tương lai

Mỗi `currency-mini-item` phải hỗ trợ pseudo-element hoặc background image:

```css
.currency-mini-item::before {
  content: "";
  position: absolute;
  inset: 2px;
  background-image: var(--currency-icon);
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  opacity: 0.16;
  pointer-events: none;
}
```

Số nằm trên asset.

---

# 8. Banner panel chính

## 8.1. Khi chưa có asset

Dùng:

- Gradient tối nhẹ.
- Overlay mờ.
- Không dùng noise nặng.
- Không dùng animation lòe loẹt.
- Có placeholder tinh tế.

Ví dụ nội dung tối thiểu:

```text
Tên pool
Mô tả ngắn
Featured unit names
```

Không nhồi quá nhiều text.

## 8.2. Khi có asset

Asset banner:

- `object-fit: cover`.
- Có overlay tối từ trái/phải để đảm bảo chữ đọc được.
- Không thay đổi layout.
- Không khiến currency mất tương phản.

## 8.3. Kích thước

```text
Banner panel height:
- bình thường: 46–56% chiều cao main
- màn hình thấp: 38–46%
Border radius: 14–18px
```

## 8.4. Placeholder

Không dùng checkerboard hoặc màu trắng.

Có thể dùng:

```css
background:
  linear-gradient(135deg, #0b1622 0%, #101d2c 50%, #0a111a 100%);
```

---

# 9. Featured / Rate-up section

## 9.1. Layout

Một hàng ngang:

```text
RATE-UP   [SSR Thiên Lưu] [SSR Mộ Dạ]
```

Nếu nhiều unit:

- Cho horizontal scroll riêng.
- Không wrap thành nhiều dòng nếu chiều cao thấp.

## 9.2. Chip

Mỗi chip gồm:

```text
Rank badge + Name
```

Ví dụ:

```text
SSR  Thiên Lưu
```

Style:

- Nền card rất mờ.
- Badge rank có màu.
- Không viền dày.
- Padding thấp.
- Font 11–13px.
- Bo góc 9–11px.

---

# 10. Pity section

## 10.1. Chỉ hiện pity liên quan

Banner thường:

```text
SSR
```

Banner UR:

```text
SSR + UR
```

Banner Prime:

```text
SSR + UR + Prime
```

## 10.2. Dạng chip

Ví dụ:

```text
SSR 24/40
UR 51/70
Prime 87/120
```

Mỗi chip có:

- Label.
- Current/max.
- Progress bar siêu mảnh 2–3px.
- Không dùng thanh dài chiếm toàn width.

## 10.3. Không hiển thị phần “Tỉ lệ & bảo hiểm” ở góc trái

Toàn bộ thông tin chi tiết chuyển vào drawer `?`.

Pity chip chỉ là quick status.

---

# 11. Summon buttons

## 11.1. Layout

Hai nút nằm ngang, luôn nhìn thấy.

```text
[ TRIỆU HỒI ×1   250 ]
[ TRIỆU HỒI ×10  2,500 ]
```

Tỉ lệ width:

```text
x1: 42%
x10: 58%
```

## 11.2. Cost nằm trong nút

Không có hàng cost riêng.

Mỗi nút gồm:

```text
Primary label
Cost row nhỏ hơn
```

Ví dụ:

```text
TRIỆU HỒI ×10
2,500
```

Sau này icon currency đặt trước cost.

## 11.3. Visual hierarchy

Nút x10:

- CTA chính.
- Nền accent mạnh hơn.
- Không glow.
- Có press state.

Nút x1:

- Nền nhẹ hơn.
- Vẫn rõ là clickable.

## 11.4. Disabled state

Khi không đủ tiền:

- Giảm opacity.
- Không chỉ dựa vào màu đỏ.
- Hiển thị tooltip hoặc message ngắn.
- Giữ label đọc được.

## 11.5. Confirm flow

Nếu setting xác nhận đang bật:

- Mở modal confirm nhỏ, centered.
- Không dùng full-screen modal.
- Có nút hủy và xác nhận.
- Hiện cost và banner hiện tại.

Nếu setting xác nhận tắt:

- Quay trực tiếp.

Setting xác nhận không nằm thường trực ở góc trái.  
Đưa vào drawer `?` hoặc settings gacha.

---

# 12. Drawer thông tin

## 12.1. Hành vi

Bấm `?`:

- Drawer trượt từ phải.
- Rộng khoảng 32–38% viewport.
- Có backdrop tối nhẹ.
- Chạm ngoài drawer thì đóng.
- Bấm `?` lần nữa thì đóng.
- Phím Back/Escape đóng.
- Không reload trang.

## 12.2. Tabs

Drawer có 3 tab:

```text
Tỉ lệ
Bảo hiểm
Quy tắc
```

## 12.3. Tỉ lệ

Hiển thị toàn bộ rate theo banner hiện tại.

Ví dụ:

```text
N      25.00%
R      12.00%
SR     60.00%
SSR     3.00%
```

Banner UR/Prime hiển thị thêm rank tương ứng.

## 12.4. Bảo hiểm

Hiển thị:

- Current pity.
- Hard pity.
- Soft pity nếu có.
- Khi nào reset.
- Pity có chuyển banner hay không.
- Rate-up guarantee nếu có.

## 12.5. Quy tắc

Hiển thị:

- Banner duration.
- Featured pool.
- Duplicate conversion.
- Cost.
- Các quy tắc khác hiện có.

## 12.6. Click outside

Bắt buộc:

- Click/tap ngoài drawer đóng drawer.
- Không đóng nếu click trong drawer.
- Backdrop phải nhận pointer event.
- Focus quay lại nút đã mở drawer.

---

# 13. Drawer lịch sử

Bấm icon history:

- Dùng cùng drawer shell.
- Nội dung là lịch sử summon.
- Có filter nếu logic hiện có hỗ trợ.
- Không hiển thị lịch sử thường trực ở main screen.

Mỗi record:

```text
Thời gian
Banner
Rank
Tên nhân vật
```

Nếu chỉ có dữ liệu demo:

- Vẫn hiển thị compact list.
- Không giữ grid chiếm diện tích chính.

---

# 14. Responsive behavior

## 14.1. Breakpoints đề xuất

```css
@media (min-width: 960px) { ... }
@media (min-width: 760px) and (max-width: 959px) { ... }
@media (max-width: 759px) { ... }
@media (max-height: 420px) { ... }
```

## 14.2. Màn hình rộng

- Rail cố định.
- Main content lớn.
- Currency mini hub có thể ở cột phải.
- Drawer mở trên cột phải hoặc overlay.

## 14.3. Màn hình trung bình

- Rail nhỏ hơn.
- Currency nằm trong topbar main.
- Không có side area riêng.
- Drawer overlay từ phải.

## 14.4. Chiều cao thấp

Khi `max-height: 420px`:

- Giảm padding root.
- Banner panel thấp hơn.
- Subtitle có thể ẩn.
- Featured chip nhỏ hơn.
- Pity chip giảm padding.
- Button height tối thiểu 42px.
- Không ẩn nút triệu hồi.

## 14.5. Portrait

Game ưu tiên landscape.

Nếu người dùng mở portrait:

- Có thể vẫn render fallback.
- Nhưng ưu tiên hiện thông báo nhẹ yêu cầu xoay ngang nếu game đã có cơ chế đó.
- Không cần tối ưu portrait ngang bằng landscape.

---

# 15. Safe area

Bắt buộc dùng:

```css
.gacha-screen {
  padding-left: max(10px, env(safe-area-inset-left));
  padding-right: max(10px, env(safe-area-inset-right));
  padding-top: max(8px, env(safe-area-inset-top));
  padding-bottom: max(8px, env(safe-area-inset-bottom));
}
```

Không đặt:

- Rail item.
- Currency cuối cùng.
- Nút triệu hồi.
- Drawer close button.

quá sát notch hoặc camera hole.

---

# 16. Design tokens

Đề xuất token:

```css
:root {
  --gacha-bg: #071019;
  --gacha-surface-1: rgba(255, 255, 255, 0.035);
  --gacha-surface-2: rgba(255, 255, 255, 0.055);
  --gacha-surface-3: rgba(255, 255, 255, 0.075);

  --gacha-text-primary: rgba(255, 255, 255, 0.94);
  --gacha-text-secondary: rgba(255, 255, 255, 0.68);
  --gacha-text-muted: rgba(255, 255, 255, 0.46);

  --gacha-accent: #6f7cff;
  --gacha-accent-soft: rgba(111, 124, 255, 0.18);
  --gacha-accent-pressed: #5d69df;

  --gacha-danger: #d96a72;
  --gacha-success: #77bfa3;

  --gacha-radius-sm: 8px;
  --gacha-radius-md: 12px;
  --gacha-radius-lg: 16px;

  --gacha-gap-xs: 4px;
  --gacha-gap-sm: 8px;
  --gacha-gap-md: 12px;
  --gacha-gap-lg: 16px;

  --gacha-shadow-soft: 0 8px 24px rgba(0, 0, 0, 0.20);
}
```

Không cần dùng đúng màu nếu project đã có theme token.  
Ưu tiên tái sử dụng theme hiện có.

---

# 17. Typography

Nếu game đã có font chính, dùng font đó.

Phân cấp:

```text
Banner title: 18–22px, 700
Banner subtitle: 11–12px, 500
Section label: 10–11px, 600, uppercase optional
Chip: 11–13px, 500–600
Currency: 11–13px, 600
Summon button title: 13–15px, 700
Summon cost: 10–12px, 600
Drawer body: 11–13px
```

Không dùng quá nhiều cỡ chữ.

---

# 18. Accessibility và input

## 18.1. Touch target

Mọi nút:

```text
Tối thiểu 40×40px
Khuyến nghị 44×44px
```

## 18.2. Keyboard

Nếu chạy desktop browser:

- Tab order hợp lý.
- Escape đóng drawer/modal.
- Enter/Space kích hoạt button.

## 18.3. Aria

Nút icon phải có:

```html
aria-label="Xem tỉ lệ và quy tắc"
aria-label="Xem lịch sử triệu hồi"
```

Currency item:

```html
aria-label="Vụn Nguyên Tinh: 125000"
```

## 18.4. Focus

- Có focus-visible rõ.
- Không dùng outline mặc định xấu nếu có custom outline thay thế.
- Khi drawer đóng, focus quay lại nút mở.

---

# 19. State và data binding

Không hardcode dữ liệu nếu hệ thống đã có state.

Cần tái sử dụng:

```text
currentBanner
bannerList
currencyBalances
pityState
featuredUnits
summonCosts
summonHistory
confirmSummonSetting
```

Nếu tên khác, dùng data hiện có.

## 19.1. Currency model

UI chỉ format số, không thay đổi giá trị gốc.

Pseudo:

```ts
type CurrencyDisplay = {
  id: 'shard' | 'lower' | 'middle' | 'upper' | 'divine';
  amount: number;
  fullName: string;
};
```

## 19.2. Banner model

Pseudo:

```ts
type GachaBannerView = {
  id: string;
  title: string;
  subtitle?: string;
  durationLabel?: string;
  featuredUnits: FeaturedUnitView[];
  pityEntries: PityEntryView[];
  summonCostSingle: number;
  summonCostTen: number;
  costCurrencyId: string;
};
```

Không tạo model mới nếu project đã có model tương đương.

---

# 20. Component đề xuất

Nếu project đang dùng component hóa:

```text
GachaScreen
GachaBannerRail
GachaTopbar
CurrencyMiniHub
GachaBannerPanel
FeaturedChipList
PityChipRow
SummonActionRow
GachaInfoDrawer
GachaHistoryDrawer
CurrencyTooltip
SummonConfirmModal
```

Nếu project chưa có framework component rõ ràng:

- Vẫn chia function/module theo trách nhiệm.
- Không dồn toàn bộ render và event listener vào một file khổng lồ.
- Không tạo function trùng logic hiện có.

---

# 21. Animation

Chỉ dùng animation ngắn và nhẹ:

```text
Drawer slide: 160–220ms
Backdrop fade: 120–180ms
Banner switch fade: 120–180ms
Button press: 80–120ms
Tooltip fade: 100–140ms
```

Không dùng:

- Aura lặp vô hạn.
- Pulse mạnh.
- Glow chớp.
- Particle nền.
- Parallax nặng.
- Animation gây lag trên điện thoại.

Tôn trọng:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

# 22. Performance

## 22.1. Không nhúng asset base64 vào bundle

Asset sau này đặt riêng:

```text
public/assets/gacha/
public/assets/currency/
public/assets/characters/
```

## 22.2. Không render lại toàn bộ màn hình khi chỉ đổi tooltip

Cập nhật theo phạm vi nhỏ.

## 22.3. Drawer

- Có thể mount sẵn hidden hoặc lazy render.
- Không tạo event listener trùng sau mỗi lần mở.

## 22.4. Resize

- Dùng CSS responsive là chính.
- Tránh tính layout liên tục bằng JavaScript.
- Nếu cần resize observer, debounce hợp lý.

---

# 23. Các phần phải xóa khỏi UI cũ

Xóa hoặc ẩn hoàn toàn:

- Hai vạch trắng góc trên trái.
- Block “Tỉ lệ & bảo hiểm” nằm góc trái dưới.
- Block “Xác nhận triệu hồi” nằm góc trái dưới.
- Dòng “Demo UI — chưa có quay thật” nếu không còn cần.
- Nút “Quy tắc” dạng chữ lớn.
- Chữ viết tắt tiền tệ: VNT, HNT, TNT, ThNT, TT.
- Viền cứng quanh từng currency item.
- Hàng cost tách riêng khỏi nút summon.
- Grid lịch sử kết quả luôn hiển thị trong main screen.

---

# 24. Hành vi click outside

Dùng chung cho:

- Info drawer.
- History drawer.
- Tooltip tiền tệ.
- Confirm modal nếu phù hợp.

Quy tắc:

```text
Click vào backdrop → đóng
Click bên trong hub/drawer → không đóng
Click nút mở lần nữa → toggle đóng
Chuyển banner → đóng tooltip/drawer hiện tại
Back/Escape → đóng lớp trên cùng
```

Không để nhiều overlay mở cùng lúc.

Ưu tiên thứ tự đóng:

```text
Confirm modal
→ Drawer
→ Tooltip
```

---

# 25. Acceptance criteria

Codex chỉ hoàn thành task khi đạt đủ:

## Layout

- [ ] UI ưu tiên landscape.
- [ ] Không còn hai vạch trắng góc trái.
- [ ] Không còn block tỉ lệ/bảo hiểm rơi ở góc trái dưới.
- [ ] Không còn block xác nhận triệu hồi rơi ở góc trái dưới.
- [ ] Banner rail gọn hơn.
- [ ] Main banner chiếm phần lớn không gian.
- [ ] Nút triệu hồi luôn nhìn thấy.

## Currency

- [ ] Currency mini hub dùng phương án 1.
- [ ] Có 5 item.
- [ ] Thứ tự Vụn, Hạ, Trung, Thượng, Thần.
- [ ] Không hiển thị viết tắt.
- [ ] Thần nằm ngoài cùng bên phải.
- [ ] Có format K/M.
- [ ] Tap/click hiện full name và full value.
- [ ] Chuẩn bị được background asset sau này.

## Info

- [ ] Có icon `?`.
- [ ] Bấm mở drawer.
- [ ] Drawer có Tỉ lệ, Bảo hiểm, Quy tắc.
- [ ] Click ngoài đóng drawer.
- [ ] Back/Escape đóng drawer.
- [ ] Focus quay lại nút mở.

## History

- [ ] Lịch sử không còn nằm thường trực.
- [ ] Có icon history.
- [ ] Bấm mở drawer lịch sử.

## Summon

- [ ] Cost nằm trong nút.
- [ ] Nút x1 và x10 nằm ngang.
- [ ] x10 nổi bật hơn nhẹ.
- [ ] Không thay logic summon.
- [ ] Confirm vẫn hoạt động.

## Responsive

- [ ] Hoạt động ở 16:9.
- [ ] Hoạt động ở 20:9.
- [ ] Hoạt động khi chiều cao dưới 420px.
- [ ] Không có scroll dọc trong trạng thái bình thường.
- [ ] Safe area hoạt động.

## Code quality

- [ ] Không chỉnh `dist/app.js`.
- [ ] Không hardcode logic gacha mới.
- [ ] Không nhân bản function đã có.
- [ ] Reuse state/data hiện tại.
- [ ] Build qua `node build.mjs`.
- [ ] Không có lỗi TypeScript.
- [ ] Không có lỗi runtime console.

---

# 26. Thứ tự triển khai đề xuất

## Phase 1 — Layout

1. Xóa các block cũ.
2. Tạo root landscape layout.
3. Thu gọn rail trái.
4. Tạo main content.
5. Tạo currency mini hub.
6. Gộp summon cost vào button.

## Phase 2 — Drawer

1. Tạo drawer shell.
2. Tạo backdrop.
3. Tạo tab Tỉ lệ/Bảo hiểm/Quy tắc.
4. Click outside.
5. Back/Escape.
6. Focus management.

## Phase 3 — History và tooltip

1. Tạo currency tooltip.
2. Tạo history drawer.
3. Format K/M.
4. Đóng overlay đúng thứ tự.

## Phase 4 — Responsive

1. 16:9.
2. 20:9.
3. max-height 420px.
4. Safe area.
5. Touch target.

## Phase 5 — Polish

1. Chuyển banner animation nhẹ.
2. Button press.
3. Reduced motion.
4. Kiểm tra accessibility.
5. Kiểm tra build.

---

# 27. Ghi chú cho Codex

- Trước khi sửa, đọc code hiện tại để xác định component/page gacha thật.
- Dùng selector và state hiện có nếu hợp lý.
- Không tự dựng một gacha page mới song song nếu page hiện tại đã tồn tại.
- Không chỉnh file bundle.
- Không đổi data model nếu không cần.
- Không tự thay rate hoặc pity.
- Không thêm dependency UI nặng.
- Ưu tiên CSS thuần và component hiện có.
- Không dùng canvas cho layout.
- Không dùng absolute positioning cho toàn màn hình nếu flex/grid giải quyết được.
- Hạn chế magic number.
- Giữ code dễ thêm asset sau này.

---

# 28. Kết quả mong muốn

Sau khi hoàn thành:

- UI gacha nhìn như một màn hình game landscape thật sự.
- Không có cảm giác web form hoặc dev demo.
- Không cần asset vẫn sạch và có hierarchy.
- Tiền tệ gọn ở góc phải.
- Người chơi chỉ thấy số tiền cần thiết.
- Tỉ lệ và pity chi tiết được giấu sau `?`.
- Lịch sử được giấu sau icon.
- Nút quay rõ, gọn và luôn sẵn.
- Toàn bộ layout sẵn sàng nhận asset banner và asset tiền tệ sau này.
