# Arclune — Phòng đấu thử

Một prototype trình duyệt độc lập để chơi một trận 3 vs 3 và đối chiếu luật bằng trace. Không cần cài dependency. Đây là công việc triển khai thử nghiệm được người dùng yêu cầu; toàn bộ dự án vẫn tiếp tục giai đoạn kiến trúc/canon.

```sh
npm run prototype
# Mở http://localhost:4173
```

Hoặc tạo một file HTML duy nhất, mở trực tiếp trong trình duyệt, kể cả offline:

```sh
npm run build:prototype
# prototypes/gameplay-sandbox/artifacts/arclune-sandbox.html
```

Node 20+ để chạy server/tests/build. Trình duyệt hiện đại có ES modules và structuredClone. Dùng `SANDBOX_PORT=4174 npm run prototype` nếu port mặc định bận.

## Chơi đến đâu?

- Một trận có điều kiện thắng/thua theo Leader đã xác nhận chết; hai đội, mỗi đội ba Actor trong chín Slot.
- SSI luân phiên Side, mỗi Side đi theo Slot tăng dần, bỏ Slot trống/chết. Layout mirror theo ảnh [Giải thích về lượt đánh](../../Giải%20thích%20về%20lượt%20đánh.jpg); Leader ở Slot8.
- Đội A: Gideon, Phần Tinh, Leader Support thử nghiệm. Đội B: Gideon, quân thử với class/rank có thể đổi, Leader Support thử nghiệm.
- Tự chọn Action/mục tiêu của đội A; nút AI cho từng Action, điều khiển cả hai đội, hoặc tự chạy và dừng. Full Rage ưu tiên Ultimate hợp lệ ngay trong Natural Action hiện có.
- AE dùng chung mỗi đội; gain theo Effective Class chỉ sau Natural Action thực sự hoàn tất. CC mất cơ hội và child không có class gain.
- Class/element bonus cộng vào một hệ số matchup; PHYSICAL/Will tách mitigation và receipt. TRUE bỏ ARM/RES nhưng vẫn dùng Shield. Có seeded Hit/Stun; target compulsion không biến thành Guaranteed Hit.
- Gideon gồm Passive, Skill1/2/3 và Ultimate đúng các lock Q1–Q7. Phần Tinh gồm HP Cost bắt buộc, Basic/Skill/Ultimate, multiplier trả HP và conditional TRUE theo snapshot chung.
- Attack mặc định giữ Slot; chọn một recipient không đồng nghĩa với Entity tracking. UI hiển thị Slot/Entity lock, trace giữ reference và recipient thực sự được resolve.
- Replay ghi profile/source, seed, fixture và các lệnh đã chấp nhận. Replay chạy lại cùng engine, không ghi đè kết quả HP. Có dedup theo requestId. Trace JSON có Action/parent/root, snapshot, Cost, từng component, Actual HP Damage, State revision, nguồn AE, đồng hồ và draw.

## Canon và thử nghiệm là hai thứ khác nhau

Mặc định tải **Báo cáo gọn**: metadata, số cơ hội/lý do kết thúc, tổng theo Actor, trạng thái hiện tại, sáu Action đầu và12 Action gần nhất. Đây là tóm tắt để đọc nhanh; không thay receipt/snapshot/checkpoint đầy đủ để chứng minh luật. Chọn **Trace chi tiết** khi cần toàn bộ event. Hai dạng xuất JSON không thụt dòng; trace trong bộ nhớ và số học engine vẫn nguyên vẹn. Replay vẫn là file riêng.

UI hiển thị giới hạn400 cơ hội và nói rõ khi dừng hòa do hết giới hạn. Đây là policy sandbox, không phải luật canon. Hồi máu có thể kéo dài trận; bản thử không thêm anti-heal hoặc đổi kit để ép thắng/thua. Regression tái hiện seed79: chọn Skill1 Gideon đầu trận rồi AI → dừng hòa ở400; chọn Skill2 rồi AI → độiB thắng ở34.

**Canon quyết định gameplay. Giới hạn hoặc cách triển khai của prototype không ràng buộc thiết kế kit mới. Kit chưa hỗ trợ phải được ghi nhận hoặc từ chối, không sửa canon để vừa code.** Một trận chạy đúng không chứng minh toàn bộ kiến trúc 00–08. Trước khi mở rộng sandbox phải đối chiếu assumption liên quan với latest merged canon và designer locks. AGENTS.md §4A ghi quy trình chống drift này; raw kit, Character Canon, 00–08 và runtime game cũ giữ nguyên.

`engine.mjs` diễn giải các operation/profile có kiểu hữu hạn trong `profiles.mjs`; không rẽ nhánh theo Character ID. Định dạng prototype là tập con thực nghiệm, **không phải compiler/Normalized IR hoàn chỉnh của 04**. Bộ validator từ chối operation, trường, clock, binding, dependency, child cycle và shared-AE automatic contention chưa hỗ trợ. Không có callback gameplay hoặc priority registry. Multiple khác-recipient Taunt không có composition law bị từ chối khi chọn, trước Cost của lệnh sandbox; đây không phải refund một Cost đã commit.

Nguồn đã xác minh: merged main `0a474a73223246c7d8496629003ec89f36538ff9`; profile `sandbox-v2` thay `sandbox-v1` vì sửa semantics targeting.

| Phần | Nguồn / mức tin cậy |
|---|---|
| Gideon | [Canon R2](../../docs/canon%20kit/Gideon_Vale_Clarified_Gameplay_Canon.md), tất cả Q1–Q7 đã chốt |
| Phần Tinh | [Canon R2](../../docs/canon%20kit/Phan_Tinh_Clarified_Gameplay_Canon.md), gồm riêng snapshot/cost/multiplier/TRUE |
| 7 class, matchup class/element | [01](../../docs/Chuẩn%20hoá%20và%20gắn%20tag%20kit/01_TERMINOLOGY_vNext_PILOT4_MERGED.md) §18; dùng đúng bảng canon |
| AE gain theo class, SSI, Leader, Ultimate priority | [07](../../docs/Chuẩn%20hoá%20và%20gắn%20tag%20kit/07_MODE_PROFILES.md) §7–9, §12.1, §13A |
| Exact Action, typed Damage, proportional shared receipt, own-excluding stats, child cost | [05](../../docs/Chuẩn%20hoá%20và%20gắn%20tag%20kit/05_CONTRACTS.md), với các giới hạn bên dưới |
| Binding theo từng attack owner | [04 §11.11](../../docs/Chuẩn%20hoá%20và%20gắn%20tag%20kit/04_ABILITY_SCHEMA-1.md), [05 TGT-008](../../docs/Chuẩn%20hoá%20và%20gắn%20tag%20kit/05_CONTRACTS.md); reuse luật hiện có, đối chiếu M-100–102/M-169 trong [08](../../docs/Chuẩn%20hoá%20và%20gắn%20tag%20kit/08_STRESS_TESTS.md) |
| N/R/SR/SSR/UR/Prime multiplier | Giá trị legacy `src/catalog.ts`: .80/.85/.95/1.10/1.30/1.55; **profile số tạm**, 01 chỉ khóa khái niệm/order. Chỉ nhân HP/ATK/WIL/ARM/RES khi khởi tạo, không nhân Damage lại |
| Stat class | Bộ số mới cho fixture trong `CLASS_STATS`, **không phải chỉ số chính thức** của hai Character |
| Native element, Basic Gideon | **Fixture rõ ràng**: native element chưa chốt; Basic Gideon dùng ATK+WIL hỗn hợp chỉ cho thử nghiệm, không bổ sung vào Canon |
| AE cap/khởi tạo, Rage | Cap AE100, Max Rage100, initial AE35/Rage0; +20 Rage sau completed root Natural, không Rage từ Damage/child/CC. **Công thức thử nghiệm**, không thay global Rage law |
| Numeric Damage/Heal/Cost | Float64 không làm tròn giữa pipeline; UI làm tròn khi hiển thị. Mitigation `100/(100+stat)`, matchup `1+classBonus+elementBonus`, rồi own-direct multiplier trước Shield/HP. **Numeric profile tạm** |
| Hit, AI, giới hạn trận | Hit96% (hoặc chọn100%), AI ưu tiên Heal khi HP<65%, rồi damaging Skill/Basic; target HP-ratio thấp nhất, tie theo seed/opportunity. Hòa ở400 cơ hội. **Policy fixture**, không priority cho các Trigger |

Phần Tinh HP Cost15% CurrentHP và multiplier1.40 có nguồn canon; luật float normalization của bản thử chỉ minh họa, không kết luận global rounding. Mixed Damage cùng một hit đọc chung trước commit; receipt component phân bổ theo tỷ lệ Shield/ActualHP, không lấy overkill làm Damage thực nhận. Bộ số class/matchup có thể được bật/tắt khi khởi tạo trận để so sánh; thao tác không sửa canon.

## Targeting và phạm vi kiểm tra movement

`SELECTABLE_SINGLE` là shape chọn một mục tiêu; `POSITION`/`ENTITY` là binding riêng. Generic single/Basic và AoE của fixture giữ các tọa độ đã chọn. Taunt có thể ép lựa chọn một Slot có Gideon hợp lệ, nhưng không đổi binding hoặc ép Hit. Fixed Slot8 và AoE không bị Taunt chuyển hướng.

Tại target context, giữ selection data (tọa độ và identity) một lần. `normalizeKits` giải quyết binding độc lập cho từng Action và Damage Effect: attack không author exception nhận `POSITION`; không thừa hưởng Entity từ parent, sibling, template hay Character. Mỗi Damage owner khai báo checkpoint `PRE_DAMAGE`, empty `MISS` và invalid `SKIP`. Runtime đọc occupant hợp lệ của Slot giữ lại ngay trước batch Damage, rồi đóng recipient/calculation đến commit. Slot trống không Damage và không chase/reroll; legal replacement nhận hit. Child dùng selection data giữ lại nhưng binding riêng; không chạy lại selection/Taunt. Skill2 Stun tiếp tục trên recipient của nhóm Damage, kể cả ordinary miss, và skip nếu recipient đó đã invalid sau Damage.

**Ngoại lệ đã author:** Phần Tinh Canon R2 §§3–4 giữ Entity IDs cho Basic, Skill1 và Ultimate. Profile khai báo rõ ở từng Action/consuming Damage owner; Ultimate giữ common target HP snapshot đã khóa. Self/Leader/Heal/State references không đổi sang Slot chỉ vì luật attack default. `ENTITY` không cấp Guaranteed Hit. Both, checkpoint khác, chase/reroll và child selection khác parent chưa hỗ trợ bị từ chối.

Tests targeting dùng fixture thay Position **giữa lock và impact** để kiểm tra Slot→replacement/empty, Entity tracking, owner exception isolation và Taunt giữ binding; có permutation của Entity enumeration. Đây là kiểm tra target resolver trong tập con hiện tại, **chưa triển khai movement transaction, POS-008 interposition, kit Savitar hoặc full M-100–102**. Không đưa kit mobility vào rồi âm thầm bỏ mechanic movement; phải triển khai/audit các dependency cần thiết trước.

## Phần chưa hỗ trợ

Deck/deployment và Cost Bar; Luân Hồi/True Self recovery, Revive/Death Prevention; Shield source-ledger đa family và Overheal conversion; Reflect/Counter/Follow-up; Authority; multi-part body; movement/Arena; save/resume giữa Action; simultaneous multi-root death cohort; gear/stars/tu vi/TP; synergy; lớp CC protection/Heal/Damage modifiers của foreign kit. Không đánh dấu các case08 này là đã pass chỉ nhờ prototype.

Scenario không khai báo recovery entitlement: HP_ZERO → reset nguồn passive → DEATH_CONFIRMED. Khi Leader chết terminal, kết thúc trước child/auto/class grant hoặc SSI handoff mới; action đang chạy unwind với `ACTION_TERMINATED`. Một kit cần recovery không được đưa vào sandbox bằng cách âm thầm bỏ recovery. Reset nguồn MaxHP/gain/clamp có thể kiểm tra trực tiếp qua operation; chuyển Deck/Reincarnation/Field chưa được mô phỏng như một transaction đầy đủ.

Một Side chỉ có một automatic waiting observer dùng AE trong tập con hiện tại. Nếu kit tương lai cần cạnh tranh, prototype phải báo chưa hỗ trợ thay vì chọn theo thứ tự mảng. Window dùng owner opportunity serial + revision; creating opportunity không giảm duration, refresh thay một family. Replay ghi từ đầu trận; execution là đồng bộ nên không có con trỏ giữa một Action để resume.

## Kiểm tra

```sh
npm run test:prototype
npm run check:prototype:browser
```

Engine tests đối chiếu Q1–Q7, Phần Tinh, targeting regression bên trên, class/element/rank/resource, SSI, failed Cost, replay/dedup, negative-space validation và100 trận seeded. Server tests kiểm tra route/MIME/phương thức/path. Browser smoke dùng Node22+ và Chromium (đặt `CHROMIUM_BIN` nếu cần), thao tác Action/target/AI, thay profile, import/export replay, hoàn tất trận, mobile layout và module entry; ảnh nằm ngoài git trong `artifacts/`. Chromium của executor chặn `file://`: cùng file standalone được phục vụ qua loopback rồi ngắt networking sau khi load; các thao tác chơi/replay vẫn phải hoạt động. Người dùng có thể tải và mở HTML ở trình duyệt cho phép file local.

Replay import chỉ chấp nhận đúng định nghĩa kit của phiên bản này; sửa kit trong JSON không được coi là canon cùng sourceRef. Các số fixture/options vẫn được validate rồi tái lập. Custom kit cho bài test được author trong code và không được nhập như replay của profile chuẩn.

Replay `sandbox-v1` bị từ chối, không tự chuyển thành v2 hay diễn giải lại lệnh cũ với binding mới. Báo cáo/trace lịch sử giữ profile/source gốc và chỉ là chứng cứ cho bản thử đã tạo chúng; kết quả targeting v1 không xác nhận runtime tương lai. Không sửa hoặc đọc lại toàn bộ các trace người dùng đã gửi để thực hiện thay đổi này.

Các kiểm tra này là chứng cứ cho **phạm vi sandbox**, không thay architecture audit hoặc bộ runtime test chính thức tương lai. Game cũ không được import hay rebuild để chạy sandbox.

## Six-pass audit trong phạm vi thay đổi

1. Semantic fidelity: đối chiếu trực tiếp các lock Gideon/Phần Tinh và bảng Mode/class/element; tách các giá trị fixture trong bảng nguồn trên.
2. Independent composition: chỉ diễn giải tập con operation/clock/cost/target hiện có, không đề xuất kiến trúc vì code khó viết.
3. Layer/lifetime: data kit tách engine và UI; snapshot theo exact Action, contribution theo nguồn, waiting theo owner, State theo owner serial/revision, command theo requestId. Cleanup ở opportunity/state/lifecycle/battle terminal đã được kiểm tra.
4. Negative space: strict30%, Shield/overkill, child cùng root, CC loss, refresh, no-op/wrong-side resource, failed atomic Cost, miss dù Taunt, fixed Slot/AoE, duplicate/replay và contention rejection.
5. Source/scope: user chỉ cho phép prototype; không chuyển toàn dự án sang implementation, không sửa canon theo giới hạn bản thử; numeric/routing/recovery còn thiếu được ghi rõ.
6. Delivery: kiểm tra diff, script/version và link; chạy engine/server/browser checks; xác minh PR head, latest base và nội dung sau merge. Không dùng các test này để tuyên bố full00–08 đã được implement.
