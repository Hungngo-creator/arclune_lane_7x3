# Arclune Lane 7x3

## Cài đặt phụ thuộc
1. Cài đặt Node.js phiên bản mới nhất.
2. Chạy lệnh `npm install` tại thư mục gốc để tải `typescript`, `ts-node`, `jest`, `ts-jest`, `@types/jest` cùng các phụ thuộc cần thiết.

## Build bundle
- `npm run build:dev` hoặc `npm run build:prod` sẽ tạo `dist/app.js` và xuất thêm báo cáo `dist/build-report.json` chứa metafile của esbuild.
- Sau mỗi lượt build, terminal sẽ in danh sách bundle có kích thước lớn nhất để giúp nhóm dev theo dõi các thay đổi trọng yếu.
- Có thể mở `dist/build-report.json` bằng trình xem JSON hoặc công cụ `jq`, ví dụ: `jq '.outputs | to_entries[] | {file: .key, bytes: .value.bytes}' dist/build-report.json`.

## Chạy mô phỏng
- Sử dụng `npm start` để khởi động mô phỏng trận C1-1 (NORMAL) bằng `ts-node src/main.ts`.
- Kết quả mô phỏng sẽ hiển thị đội hình yêu cầu và trình tự các pha giao chiến trong terminal.

## Kiểm thử
- Thực thi `npm test` để chạy bộ kiểm thử Jest trong chế độ `--runInBand`, đảm bảo khả năng biên dịch và chạy các tệp TypeScript.

## Trận mô phỏng C1-1 (NORMAL)
- Đội hình yêu cầu: Vanguard Astra, Guardian Lumen, Tactician Arclight, Hexseer Mira, Chanter Lys.
- Bố trí: hai đơn vị tiền tuyến (Vanguard Astra, Guardian Lumen), một đơn vị trung tuyến (Tactician Arclight) và hai đơn vị hậu tuyến (Hexseer Mira, Chanter Lys).
- Mục tiêu: kích hoạt đầy đủ buff mở màn, duy trì kiểm soát nhịp giao chiến và kết thúc gọn gàng theo kịch bản NORMAL.
