# Skills batch 02 (8-10 nhân vật)

Batch này nhập **9 nhân vật** từ ma trận `v1/v2.3/v3.2`, tách riêng khỏi batch 01 để tránh đẩy 20 nhân vật một lần.

## Danh sách unit trong batch 02
- `mong_yem`
- `chan_nga`
- `ma_ton_diep_lam`
- `mo_da`
- `ngao_binh`
- `lau_khac_ma_chu`
- `phe`
- `kiemtruongda`
- `loithienanh`

## Chuẩn hóa dữ liệu
- Gắn `importBatch: ideas-matrix-batch-02` + `sourceRefs` cho 9 unit ở `skills.config.ts`.
- Giữ placeholder có chủ đích cho `thien_luu` (thiếu nguồn mô tả kit).
- Bổ sung rule runtime rõ ràng cho cơ chế phức tạp:
  - `chan_nga`: ràng buộc cast ult theo clone-link.
  - `ngao_binh`: chu kỳ trứng/chuyển form/prime awaken.
  - `lau_khac_ma_chu`: nhánh coinflip nghịch-lưu / thuận-lưu.

## Tag alias bổ sung
Để giảm unknown-tag warning khi matrix dùng biến thể tag cũ:
- `transform`, `dual-form` → `stance`
- `coin-flip` → `control`
- `clone_body` → `summon`
- `heal-share` → `non-heal-hp-change`
