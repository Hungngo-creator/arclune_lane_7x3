# Vĩnh Dạ Spec Coverage QA Checklist

Tài liệu này là checklist QA bắt buộc trước khi tuyên bố mode Vĩnh Dạ đạt **100% spec**. Mỗi lần thêm/tune logic liên quan, cập nhật trạng thái và bằng chứng code ở đây trước khi chốt nghiệm thu.

## Quy ước trạng thái

- **Not started**: chưa có cấu trúc dữ liệu/UI/simulation tương ứng.
- **Partial**: đã có một phần playable nhưng thiếu nhánh, cấp, rule phụ, hoặc chưa khớp số liệu spec.
- **Implemented**: có dữ liệu, UI và simulation chính; chỉ còn bug lẻ nếu phát hiện.
- **Needs tuning**: đã đủ khung chính nhưng số liệu/cân bằng/hành vi cần đối chiếu thêm với spec.

## Checklist coverage theo spec

| Mục spec | Trạng thái | Code chịu trách nhiệm | QA checklist / phần còn thiếu |
| --- | --- | --- | --- |
| Base pha lê | **Partial** | `src/screens/vinh-da/structures.ts`, `src/screens/vinh-da/simulation.ts`, `src/screens/vinh-da/gameplay.ts` | Có HP/cấp base, hồi HP, emergency heal và upkeep Dạ Thạch/Huyết Tinh. Thiếu/đang đơn giản hóa: phạm vi buff chỉ trong tường lãnh địa, khiên leader lv5 theo đêm, hồi leader lv6 đúng 20% max HP + base mất 10% max HP + CD 2 đêm, logic dời base giữa map và giữ năng lượng chưa rút. |
| Wall / tường lãnh địa | **Partial** | `src/screens/vinh-da/structures.ts`, `src/screens/vinh-da/simulation.ts`, `src/screens/vinh-da/gameplay.ts` | Có slot tường, HP/arm/res/regen, nhánh lv3, nhánh lv5, link và mount structure lv6. Cần QA thêm tương tác thu hẹp vùng buff khi tường vỡ, phân biệt rõ tường lãnh địa với tường chặn đường, và tuning nhánh trơn/trùng kích/nguyền/sinh hóa theo số liệu spec. |
| Watchtower / tháp thường | **Needs tuning** | `src/screens/vinh-da/structures.ts`, `src/screens/vinh-da/simulation.ts` | Có tháp bắn mục tiêu trong range, max targets, cooldown, damage theo level. Cần đối chiếu damage/tốc độ đạn/range/cấp nâng với spec cuối, và kiểm tra UI/build menu không gọi nhầm với nhóm bẫy/đao phủ. |
| Elemental tower / tháp nguyên tố | **Partial** | `src/screens/vinh-da/structures.ts`, `src/screens/vinh-da/simulation.ts` | Có 9 hệ Hỏa/Mộc/Thủy/Thổ/Kim/Lôi/Huyết/Ánh Sáng/Phong và effect cơ bản trong simulation. Thiếu hoặc cần tuning: yêu cầu Nguyên Tố Thạch, nhánh/cấp chi tiết theo từng hệ, phản ứng với địa hình/khí hậu/tier vật liệu, và đối chiếu số liệu từng cấp. |
| Barracks / nhà lính | **Partial** | `src/screens/vinh-da/structures.ts`, `src/screens/vinh-da/simulation.ts`, `src/screens/vinh-da/types.ts` | Có soldier cap, rank, spawn timer, ultimate permission lv6 và runtime soldiers; Sứ Đồ chuyển hóa có state đánh lén riêng khi xuất hiện sau wave. Thiếu/đơn giản hóa: AI lính/NPC đầy đủ, nâng cấp kỹ năng lính, chi phí duy trì và tương tác hộ tống pha lê. |
| Church / nhà thờ | **Partial** | `src/screens/vinh-da/structures.ts`, `src/screens/vinh-da/simulation.ts` | Có buff chỉ số, healing bonus, prayer heal, cleanse contamination đúng timer 2 giờ lore (`cleanseContaminationSeconds = 120`) và prayer heal đi qua cap hồi phục tổng hợp của base. Thiếu/đơn giản hóa: phạm vi buff theo lãnh địa cũ/mới khi base dời map, logic NPC đến nhà thờ sau wave và exception cho Sứ Đồ. |
| Teleport / truyền tống trận | **Not started** | `src/screens/vinh-da/structures.ts`, `src/screens/vinh-da/gameplay.ts`, `src/screens/vinh-da/simulation.ts` | Chưa có `StructureType`/build option/runtime cho truyền tống trận. Cần thêm kích hoạt đưa leader + base về map cũ đã phong ấn, điều kiện nguy cấp, chi phí, cooldown, trạng thái map cũ và xử lý tài nguyên/base energy khi rút lui. |
| Enemy / kẻ thù | **Partial** | `src/screens/vinh-da/enemies.ts`, `src/screens/vinh-da/simulation.ts`, `src/screens/vinh-da/types.ts` | Có template nhiều loại địch, tier scaling, bleed/contamination, bay, pháp sư, Thiết Hán regen, Oán Long phá kiến trúc/ultimate, Sứ Đồ với aura chỉ huy không stack và state đánh lén/ưu tiên base/công trình. Cần hoàn thiện đủ roster spec, đường tấn công theo ký ức cũ chi tiết hơn, đánh lén lính ngủ đầy đủ, drop vật liệu theo tier map và cân bằng số liệu từng enemy. |
| Contamination / ô nhiễm | **Partial** | `src/screens/vinh-da/enemies.ts`, `src/screens/vinh-da/simulation.ts`, `src/screens/vinh-da/types.ts` | Có contamination-on-hit dùng `baseStatuses.contaminationStacks` làm nguồn sự thật, ngưỡng 5 stack chuyển thành Sứ Đồ sau wave, Sứ Đồ vẫn spawn được ở hậu wave/ngày và nhà thờ cleanse theo timer 120s. Cần QA rule cooldown cùng nguồn, tương tác NPC/lính bị chuyển hóa, hiển thị cảnh báo, và hậu quả dài hạn giữa các ngày/map. |
| Healing cap / giới hạn hồi phục | **Needs tuning** | `src/screens/vinh-da/structures.ts`, `src/screens/vinh-da/simulation.ts` | Base/church/Mộc/Huyết/base support đều đi qua `healBase()`, cap tổng 8% max HP/s theo mục 15 spec (`STRUCTURE_HEALING_CAP_MAX_HP_PER_SECOND = 0.08`). Cần QA thêm bằng test/manual cho các nguồn heal chạy đồng thời và mở rộng cap tương tự khi có heal trực tiếp lên đơn vị/công trình khác. |
| Resources / tài nguyên | **Partial** | `src/screens/vinh-da/enemies.ts`, `src/screens/vinh-da/simulation.ts`, `src/screens/vinh-da/gameplay.ts`, `src/screens/vinh-da/types.ts` | Có reward/dropped resources/economy render và spend build cost. Thiếu/đơn giản hóa: Vụn/Hạ/Trung/Thượng/Thần Nguyên Tinh, Dạ Thạch -> base chắt lọc 0.9 rồi ngưng tụ hao 10%, Nguyên Tố Thạch theo khí hậu/tier, Niệm Thạch cho Đao Phủ, Hồng Lôi Quả và quy đổi đa tiền tệ. |
| Đao Phủ / lưỡi đao vô hệ | **Partial** | `docs/vinh-da-defense-mode-spec.md`, `src/screens/vinh-da/structures.ts`, `src/screens/vinh-da/simulation.ts` | **Thiếu rõ ràng:** hiện chưa có `StructureType` riêng cho Đao Phủ/lưỡi đao vô hệ; spec mới chỉ được ghi ở tài liệu. Lv1 yêu cầu lưỡi đao vô hệ bay, bỏ qua res/arm dưới 1, tối đa 5 mục tiêu. **Lv2+ chưa đủ**: chưa có + tốc độ bay, + sát thương, tăng CD, nhánh lv3 Nguyên Tố Hóa và các cấp sau. Không được đánh dấu Implemented cho nhóm tower cho tới khi Đao Phủ lv2+ có code + test/QA riêng. |

## Tiêu chí bắt buộc trước khi tuyên bố 100% spec

- [ ] Mọi dòng trong bảng trên đạt **Implemented** hoặc có ticket/commit rõ ràng nếu chủ ý cắt scope.
- [ ] Không còn mục **Not started** trong checklist core: base, wall, watchtower, elemental tower, barracks, church, teleport, enemy, contamination, healing cap, resources.
- [ ] Đao Phủ/lưỡi đao vô hệ có implementation tối thiểu lv1-lv3 và phần **lv2+** được test riêng; nếu chưa có, mode không được claim 100% spec.
- [ ] Các số liệu HP/damage/range/cooldown/cost/drop được đối chiếu lại với `docs/vinh-da-defense-mode-spec.md`.
- [ ] Có QA manual hoặc automated test cho ít nhất: xây/nâng cấp, enemy wave, contamination -> Sứ Đồ, cleanse nhà thờ, healing cap, spend/earn tài nguyên, truyền tống, và Đao Phủ lv2+.
- [ ] `dist/app.js` không được chỉnh trong quá trình cập nhật checklist hoặc code nguồn liên quan.
