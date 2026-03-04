# Buff/Debuff Audit (game + bộ ý tưởng nhân vật + lưu ý)

## Phạm vi quét
- Code game: `src/statuses.ts` (registry status chung đang chạy trong engine).
- Tài liệu ý tưởng: `ý tưởng nhân vật v1.txt`, `ý tưởng nhân vật v2.3.txt`, `ý tưởng nhân vật 3.2.txt`.
- Ghi chú hệ thống: `lưu ý.txt`.

## Kết quả đếm đã chuẩn hoá
- **Trong game hiện tại (status chung đã implement): 20**.
- **Trong combo 3 file ý tưởng + lưu ý (chỉ lấy nhóm hiệu ứng chung, bỏ hiệu ứng kit riêng): 24**.
- **Phần có trong tài liệu nhưng chưa thấy trong status registry chung của game: 4**
  - `burn` (Thiêu Đốt)
  - `freeze` (Đóng Băng)
  - `vulnerability` (Tăng sát thương nhận vào)
  - `antiRegen` (Giảm hồi phục/regen)

## Danh sách chuẩn hoá đề xuất (24 hiệu ứng chung)
> Quy ước đề xuất: **ID code dùng English (camelCase/lowercase)**, UI có thể hiển thị tiếng Việt.

| # | ID chuẩn (code) | Tên hiển thị VI | Loại | Mô tả ngắn tiếng Việt | Trạng thái hiện tại |
|---|---|---|---|---|---|
| 1 | stun | Choáng | Debuff | Không thể hành động trong thời gian hiệu lực. | Đã có trong game |
| 2 | sleep | Ngủ | Debuff | Không thể hành động (thường là khống chế mềm/cứng tuỳ luật). | Đã có trong game |
| 3 | taunt | Khiêu khích | Debuff | Ép mục tiêu ưu tiên đánh người gây hiệu ứng. | Đã có trong game |
| 4 | silence | Câm lặng | Debuff | Không thể dùng kỹ năng/ultimate. | Đã có trong game |
| 5 | daze | Hoa mắt/Choáng váng | Debuff | Giảm khả năng chiến đấu (stat/control nhẹ). | Đã có trong game |
| 6 | fear | Sợ hãi | Debuff | Giảm/khóa hiệu suất tấn công theo luật combat. | Đã có trong game |
| 7 | weaken | Suy yếu | Debuff | Giảm sức mạnh đầu ra (ATK/damage output). | Đã có trong game |
| 8 | fatigue | Kiệt sức | Debuff | Giảm hiệu quả chiến đấu tạm thời (thường ATK/SPD/output). | Đã có trong game |
| 9 | bleed | Chảy máu | Debuff | Mất HP theo lượt (DoT). | Đã có trong game |
|10 | burn | Thiêu đốt | Debuff | Mất HP theo lượt kiểu Hỏa (DoT). | Chưa thấy trong registry chung |
|11 | venom | Nhiễm độc | Debuff | Hiệu ứng độc/poison theo thời gian hoặc phụ trợ đòn đánh. | Đã có trong game |
|12 | freeze | Đóng băng | Debuff | Khóa hành động hoặc đóng băng tài nguyên theo luật mode. | Chưa thấy trong registry chung |
|13 | vulnerability | Dễ tổn thương | Debuff | Tăng sát thương nhận vào từ mọi nguồn. | Chưa thấy trong registry chung |
|14 | antiRegen | Giảm hồi phục | Debuff | Giảm hiệu quả hồi máu/regen hoặc AE regen. | Chưa thấy trong registry chung |
|15 | shield | Khiên | Buff | Tạo lớp hấp thụ sát thương trước HP. | Đã có trong game |
|16 | damageCut (giữ alias `dmgCut`) | Giảm sát thương nhận | Buff | Giảm phần trăm sát thương đầu vào. | Đã có trong game (ID hiện dùng `dmgCut`) |
|17 | reflect | Phản đòn | Buff | Phản lại một phần sát thương khi bị đánh. | Đã có trong game |
|18 | haste | Gia tốc | Buff | Tăng tốc độ/chỉ số hành động (SPD/tempo). | Đã có trong game |
|19 | stealth | Tàng hình | Buff | Khó bị chọn mục tiêu hoặc né/miễn tác động theo luật. | Đã có trong game |
|20 | exalt | Cường hoá | Buff | Tăng hiệu quả gây sát thương (output buff). | Đã có trong game |
|21 | pierce | Xuyên phá | Buff | Tăng xuyên giáp/xuyên kháng hoặc bỏ qua phòng thủ. | Đã có trong game |
|22 | frenzy | Cuồng nộ | Buff | Tăng sức tấn công liên tục/ngắn hạn. | Đã có trong game |
|23 | execute | Kết liễu | Buff | Tăng khả năng kết liễu mục tiêu thấp máu. | Đã có trong game |
|24 | undying | Bất khuất | Buff | Chống chết 1 lần hoặc tạm không thể chết. | Đã có trong game |

## Gợi ý thống nhất naming
1. **Chuẩn hoá ID tiếng Anh trong code**, ví dụ:
   - Giữ `damageCut` làm tên canonical, chỉ giữ `dmgCut` là alias tương thích ngược.
   - Dùng nhất quán `vulnerability` thay vì nơi khác ghi “takeMoreDmg”, “recvUp”, “nhận thêm sát thương”.
2. **Tên hiển thị tiếng Việt tách riêng** trong bảng localization/UI.
3. **Không đưa hiệu ứng kit đặc thù** (vd: ma_chung, sa_an, mark_devour, me_hoac...) vào nhóm “status chung”.

## Ghi chú nguồn
- `src/statuses.ts` hiện có 20 factory status chung.
- Các cụm “đóng băng/thiêu đốt/nhận thêm sát thương/giảm regen” xuất hiện ở bộ tài liệu ý tưởng và lưu ý nhưng chưa thấy trong status registry chung hiện tại.
