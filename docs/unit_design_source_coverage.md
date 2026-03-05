# Unit design source coverage (v1 / v2.3 / v3.2)

Bảng này đối chiếu roster trong `src/units.ts` với 3 file nguồn ý tưởng:
- `ý tưởng nhân vật v1.txt`
- `ý tưởng nhân vật v2.3.txt`
- `ý tưởng nhân vật 3.2.txt`

Quy ước:
- `✓`: tìm thấy keyword tên nhân vật trong file.
- `—`: không tìm thấy keyword.
- `placeholder`: chưa có nguồn thiết kế đáng tin cậy để điền kit runtime.

|unitId|name|v1|v2.3|v3.2|coverage status|
|---|---|---|---|---|---|
|thien_luu|Thiên Lưu|—|—|—|placeholder (blocked by missing source)|
|vu_thien|Vũ Thiên|—|✓|—|covered|
|anna|Anna|—|✓|—|covered|
|lao_khat_cai|Lão Khất Cái|—|✓|—|covered|
|ai_lan|Ái Lân|—|✓|—|covered|
|faun|Faun|—|✓|—|covered|
|basil_thorne|Basil Thorne|✓|✓|—|covered|
|mong_yem|Mộng Yểm|✓|—|—|covered|
|chan_nga|Chân Ngã|✓|—|—|covered|
|ma_ton_diep_lam|Ma Tôn - Diệp Lâm|✓|—|—|covered|
|mo_da|Mộ Dạ|✓|—|—|covered|
|ngao_binh|Ngao Bính|✓|—|—|covered|
|lau_khac_ma_chu|Lậu Khắc Ma Chủ|✓|—|—|covered|
|phe|Phệ|✓|✓|✓|covered|
|kiemtruongda|Kiếm Trường Dạ|✓|—|—|covered|
|loithienanh|Lôi Thiên Ảnh|✓|—|—|covered|
|laky|La Kỳ|✓|✓|—|covered|
|kydieu|Kỳ Diêu|✓|—|—|covered|
|doanminh|Doãn Minh|✓|—|—|covered|
|tranquat|Trần Quát|✓|—|—|covered|
|linhgac|Lính Gác|✓|—|—|covered|

## Placeholder control policy

`thien_luu` tiếp tục giữ trạng thái placeholder trong `src/data/skills.config.ts` với cờ kiểm soát:
- `designStatus: 'placeholder'`
- `placeholderControl.allowSyntheticFill: false`
- `placeholderControl.requiredSourceFiles`: bắt buộc đủ bộ `v1 / v2.3 / v3.2` trước khi điền kit

Mục tiêu của cờ này là chặn việc “đầy giả” (auto-fill kỹ năng khi chưa có nguồn thiết kế).
