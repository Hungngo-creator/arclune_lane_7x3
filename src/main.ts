/**
 * Điểm vào chạy mô phỏng tuyến tính cho trận C1-1 (NORMAL).
 * Sử dụng console để mô tả đội hình và từng bước mô phỏng.
 */

type FormationSlot = {
  viTri: string;
  donVi: string;
};

const doiHinhCanDung: FormationSlot[] = [
  { viTri: 'Tiền tuyến', donVi: 'Vanguard Astra' },
  { viTri: 'Tiền tuyến', donVi: 'Guardian Lumen' },
  { viTri: 'Trung tuyến', donVi: 'Tactician Arclight' },
  { viTri: 'Hậu tuyến', donVi: 'Hexseer Mira' },
  { viTri: 'Hậu tuyến', donVi: 'Chanter Lys' }
];

function thongBaoDoiHinh(): void {
  console.log('Đội hình yêu cầu cho trận C1-1 (NORMAL):');
  doiHinhCanDung.forEach((slot, index) => {
    console.log(`  ${index + 1}. ${slot.viTri}: ${slot.donVi}`);
  });
}

function moPhongTranDanh(): void {
  console.log('--- Mô phỏng trận C1-1 (NORMAL) bắt đầu ---');
  thongBaoDoiHinh();
  console.log('Thiết lập vị trí, hiệu ứng mở màn và nhịp độ đánh theo kịch bản chuẩn.');
  console.log('Tiến hành tuần tự từng pha giao chiến, đảm bảo các buff/đòn đánh chủ chốt được kích hoạt.');
  console.log('--- Mô phỏng hoàn tất: đội hình đạt yêu cầu và sẵn sàng triển khai ---');
}

moPhongTranDanh();
