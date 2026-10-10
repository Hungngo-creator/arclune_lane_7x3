Axiom là một mệnh đề nền tảng mà hệ thống bắt buộc phải duy trì. Nó không nhất thiết tác động lên mọi đơn vị, nhưng phần nằm trong phạm vi của nó không thể bị Pháp Tắc hoặc Quy Tắc sửa đổi.
World Axiom hoặc Thiên Điều là Axiom được Arclune triển khai trên toàn chiến trường. Nó ghi nhận hoặc chi phối mọi đối tượng đủ điều kiện; các nhân vật thông thường chỉ chịu tác động, còn UR và Prime mới có quyền truy cập, khai thác hoặc ra lệnh cho một phần cơ chế của nó.
Phân loại:
Axiom cá thể
Thần Tính thuộc nhóm này.
Nó là một mệnh đề gắn với bản thân Prime, đại khái:
Bản thể này không tiếp nhận buff, debuff và mark từ ngoại nguồn.
Nó không phải luật toàn chiến trường. Toàn bộ đơn vị vẫn tồn tại bình thường dù không có Thần Tính.
Các thứ như:
Bất Diệt Bá Thể không vào Luân Hồi.
Vị Tri: đáp án chưa từng được sinh ra.
Không thể follow-up.
Một cái chết là kết thúc tuyệt đối.
cũng có thể là Axiom cá thể nếu được thiết kế ở cấp đó.
Axiom thế giới hoặc Thiên Điều
tự động tồn tại trong mọi trận và theo dõi tất cả đối tượng hợp lệ.
Hiện có thể tính:
Luân Hồi — quản lý thời hạn phục sinh, Chân Ngã và trạng thái bước vào vòng đầu thai.
Thiên Lôi Vô Tư — mệnh đề Lôi Kiếp không thiên vị phe nào. Phần kiểm tra điều kiện và gây sát thương vẫn do Quy Tắc triển khai, không phải toàn bộ cú sét đều mang Axiom.
Quang Ảnh Chi Hà — World-Axiom History provider; ngoại lệ CONDITIONAL_IMPORT, không tự động resident trong mọi trận. Chi tiết ghi nhận/quyền hồi quy ở phần Quang Ảnh Chi Hà dưới đây.
## Quang Ảnh Chi Hà

**Axiom Identity:** `RIVER_OF_LIGHT_AND_SHADOW`.
Tên gọi thông thường: **Thời Gian Trường Hà**. Đơn vị dữ liệu: **Quang Ảnh**. Điểm lưu lịch sử: **Mốc Quang Ảnh**.

Quang Ảnh Chi Hà là **World-Axiom History provider**, dùng chung cho các kit thời gian. Phạm vi World-Axiom không đồng nghĩa mặc định resident trong mọi Combat Instance. Provider áp dụng **CONDITIONAL_IMPORT**:

- Combat Instance không chứa nội dung có normalized dependency vào River: không import.
- Participant, Deck hoặc definition có dependency: import lúc Combat Instance initialize, trước gameplay, kể cả Character thời gian đang trong Deck.
- Capability xuất hiện động giữa trận: import tại checkpoint đó và tạo baseline tại thời điểm import; không giả tạo lịch sử trước đó.
- Một khi import, giữ provider tới hết Combat Instance dù Character truy cập nó chết/rời sân. Import có thể có Presentation event/VFX; Presentation không quyết định Kernel timing.

Lậu Khắc chỉ là một Character có quyền truy cập; River không thuộc riêng Character và không ban AXIOM Authority cho mọi Skill của họ. Reuse Snapshot Primitive, HIS Contracts và generic History Runtime hiện hành; không tạo History subsystem khác.

### Baseline và capture profile

At import tạo immutable **BASELINE**. Sau đó capture checkpoint theo profile, không theo luật global “snapshot sau mọi complete Action”. Current Lậu Khắc Side-access profile:

```text
actually performed allied Natural root
→ blocking child/outcome/settlement hoàn tất
→ ACTION_COMPLETED
→ capture committed Side Mốc Quang Ảnh
→ SSI tiếp tục
```

CC-lost Natural opportunity không thực hiện Action, Forced/Follow-up/Counter/Reaction, child riêng, mỗi hit và State tick không tạo checkpoint riêng. Blocking work đã nằm trong resulting state của root.

Mốc cần thiết cho selection phải được giữ immutable/available, gồm baseline. Cách lưu snapshot/delta là implementation detail; không được dùng inverse delta để vượt restore whitelist hoặc tùy tiện bỏ mốc còn được gameplay truy cập.

### Ghi nhận khác quyền hồi quy

**HISTORY_RECORD_SCOPE ≠ HISTORY_RESTORE_SCOPE.** Profile có thể ghi battlefield/Deck/waiting membership, Position, CurrentHP/CurrentMaxHP, effective stats/stat contributions, Shield/contribution ledger, Buff/Debuff/Mark, counter/stack/duration, cooldown/form/Character battle state, Side AE, actor Rage và other resources cùng source/provenance. Historical observation không cấp quyền mutation.

Đối với Nghịch Lưu / **SIDE_BATTLE_STATE_NON_RESOURCE**:

- Eligible allied HP/MaxHP/State/Position/membership và battle fields đã khai báo có thể restore.
- Side AE và mọi actor Rage: **OBSERVABLE_ONLY / NON_RESTORABLE**, kể cả caster. Current values tại restore barrier giữ nguyên chính xác; không SET snapshot, tạo delta, refund Cost, undo gain hoặc reset/clamp qua Field-entry/derived resource logic.
- RNG stream/cursor: **NON_RESTORABLE**; dòng sông lưu state history, không rewind future destiny.
- Reincarnation ledger/progress/death order và True-Self/new-life identity: **NON_RESTORABLE**.
- Side Deployment Cost Bar: **NON_RESTORABLE** từ snapshot.

```text
AE_before_restore == AE_after_restore
Rage_before_restore(actor) == Rage_after_restore(actor)
```

AE/Rage có mặt trong Quang Ảnh vẫn chỉ là dữ liệu quan sát. Không có exception cho Ultimate caster; Rage đã tiêu không được hoàn.

### Bounded History Restore

Nghịch Lưu chọn latest committed allied Side Mốc **strictly before current Ultimate Natural Action**, fallback BASELINE nếu chưa có previous Natural snapshot. Current Ultimate chỉ có thể capture resulting state sau completion, không ghi đè input nó đang đọc.

Restore phe đồng minh bằng **SIDE_SCOPED_HISTORY_RESTORE** typed transaction. Enemy HP/State/Sa/Position/resources giữ nguyên. Historical state changes không là ordinary Damage/Heal/Overheal/HP Loss/Cleanse/Buff apply/Debuff apply/Revive/Return-to-Deck/deploy và không kích hoạt các trigger đó; explicit HISTORY_RESTORE observation có thể đọc cause riêng. Không xóa trace hay un-emit Event cũ.

Allied same life DEATH_CONFIRMED còn Waiting, chưa ENTERED_REINCARNATION, có thể về snapshot alive/on Field bằng HISTORY_RESTORE, không ON_REVIVE. Reconcile active battle/waiting eligibility nhưng không rewind ledger/progress. Old life đã ENTERED_REINCARNATION local fail; giữ Chân Ngã/new life/progress hiện tại và tiếp tục other eligible branches. Không thiết kế lại Luân Hồi foundation.

Derive desired allied snapshot layout trước, stage out rewindable post-snapshot occupants, commit occupancy atomically. Protected Reincarnation result chiếm old-life Slot làm old-life branch fail; không displace new life hoặc chọn owner theo iteration. Eligible allied entity created after snapshot và absent trong snapshot bị remove bằng HISTORY_RESTORE reconciliation, không DEATH_CONFIRMED/summon-death. Protected non-rewindable Reincarnation results không thuộc removal branch này.

### Character-authored deployment refund riêng

Nếu roster Character ở Deck tại snapshot, nay Field qua paid DEPLOY_FROM_DECK sau snapshot và Presence đó bị undo, restore về Deck. Kit có thể author partial refund riêng từ **actual committed deployment payment receipt**. Current Lậu Khắc lock:

```text
floor(actualCommittedDeploymentCost ×0.50)
15→7; 14→7; 9→4; 7→3; 1→0
```

Cộng vào current Side Deployment Cost Bar theo active cap; overflow mất. Không dùng Base/Current/nominal cost, không copy snapshot Bar, không double refund. Return/refund/undone receipt commit cùng transaction; replay không trả lại lần hai. Unpaid creations không nhận refund. History return không phải ordinary RETURN_TO_DECK cause.

Phần này thay thế mọi proposal cũ về rewind AE/Rage/Cost, ACTION_COMMIT sau mọi Action, full-field rollback mặc định hoặc Thần Tính exemption suy từ ví dụ. Nó không bổ sung thiết kế Thiên Lôi, Thần Tính, Duy Nhất hay cơ chế Luân Hồi ngoài interaction đã khóa. Exact eligibility/conflicts còn lại dùng Contract hiện hành, không suy Authority từ tên Axiom.
