# Ghi chú bundle offline trên Termux

## Lý do `node build.mjs --mode=production` báo lỗi tràn stack
Trong môi trường hoàn toàn offline, các thư mục stub được cài bằng `tools/install-stubs.mjs` chỉ mang lại bộ giả lập `esbuild` và `typescript-transpiler`. Khi thực thi `node build.mjs --mode=production`, `esbuild` giả lập sẽ gọi ngược lại `typescript-transpiler` để chuyển đổi TypeScript sang JavaScript. Tuy nhiên `typescript-transpiler` trong chế độ stub lại cố dùng chính `esbuild` làm bộ biên dịch tạm thời. Hai stub này gọi qua lại lẫn nhau vô hạn dẫn tới lỗi `RangeError: Maximum call stack size exceeded` như ghi nhận trên Termux.

## Cách khắc phục khi không có Internet
Bạn cần cung cấp gói TypeScript thật cho dự án trước khi bundle. Có thể thực hiện bằng một trong các cách sau:

1. **Chép tay từ máy khác**: trên máy có mạng, chạy `npm pack typescript@5.4.0` để lấy gói `.tgz`, sau đó copy file này sang điện thoại và giải nén vào `node_modules/typescript`.
2. **Sao chép trọn thư mục `node_modules/typescript`** từ một môi trường đã chạy `npm install`, rồi dán vào cùng vị trí trên Termux.

Sau khi đã có `node_modules/typescript`, chạy lại:
```bash
node tools/install-stubs.mjs
node tools/generate-loithienanh-svg.mjs
node build.mjs --mode=production
```
Lúc này `typescript-transpiler` sẽ ưu tiên dùng bộ TypeScript thật, tránh vòng lặp giữa hai stub và build sẽ tạo được `dist/app.js`.

> **Lưu ý:** bộ stub `typescript-transpiler` đi kèm script `tools/install-stubs.mjs` đã được cập nhật để luôn cung cấp hằng số `ImportsNotUsedAsValues` (các giá trị `Remove`, `Preserve`, `Error`). Nếu tự chỉnh sửa hoặc cài đặt thủ công, hãy chắc chắn phần xuất của stub vẫn giữ nguyên hằng số này để các bài kiểm thử PvE không gặp lỗi thiếu thuộc tính.

## Ghi đè `app.js` trong bộ nhớ điện thoại
File bundle kết quả luôn nằm ở `dist/app.js`. Bạn có thể sao chép file này sang bộ nhớ chung để ghi đè bản cũ:
```bash
cp dist/app.js "/sdcard/arclune lane 7x3/app.js"
```
Hoặc nếu muốn giữ bản sao lưu:
```bash
cp dist/app.js "/sdcard/arclune lane 7x3/app_$(date +%Y%m%d_%H%M).js"
```
Hãy bảo đảm Termux đã được cấp quyền truy cập bộ nhớ chung (`termux-setup-storage`).