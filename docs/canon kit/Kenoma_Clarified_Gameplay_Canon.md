# Kenoma — Clarified Gameplay Canon

**Revision:** R0

**Status:** GAMEPLAY_PARTIALLY_CLARIFIED / NORMALIZATION_BLOCKED_BY_INTERNAL_GAMEPLAY

**Source:** mục `61) Kenoma` trong [Ý tưởng nhân vật 4.md](../../Ý%20tưởng%20nhân%20vật%204.md), cùng mô tả explicit của designer. Kit ở hai nguồn trùng nhau. Phần đã rõ được giữ dưới đây; các đề xuất Q1–Q9 ở §7 **chưa được designer chấp thuận**, không phải executable gameplay defaults.

## 1. Identity và Passive — Life Before the Soul / Sinh Mệnh Có Trước Linh Hồn

Kenoma là sinh vật **huyết nhục kết hợp cơ giới**, có thể hoạt động bằng kit của mình **khi không có Chân Ngã**. Không tự gán entity kind SUMMON/PUPPET hoặc miễn Damage/Death từ việc không có Chân Ngã.

Raw nói **vào sân không có Chân Ngã**, và khi Chân Ngã đầu thai vào thì những phần được chỉ định của kit tăng sức mạnh. Cần phân biệt initial empty body, actual field reentry, received True Self và inherited Combat Definition; phạm vi binding/routing/retention còn ở Q1. Không tự copy kit của entrant, tạo Chân Ngã mới, chọn phe/host hoặc suy routing của Pygmalion cho Kenoma.

**Vào trận, giảm deployment cost trên Deck2, không stack.** Đây là Current Character Deployment Cost, không phải AE, Rage hoặc Side Deployment Cost Bar. Cùng trận, leave/Return-to-Deck/redeploy không lặp lại khoản giảm2. External kit thực sự sửa cost vẫn có thể tác động theo law riêng; “không stack” không phải LOCK_CURRENT hoặc miễn cost mutation từ nguồn khác. Ví dụ Current cost trước khoản giảm là17 → còn15; nếu không có nguồn khác, redeploy bao lần vẫn15. Ví dụ không định nghĩa Base Deployment Cost của Kenoma. New battle dùng battle initialization riêng.

Rank, Class, Native Element, Basic Attack profile và numeric deployment budget chưa được cung cấp; không suy từ cơ giới/vũ khí hoặc từ một Character khác.

## 2. Skill1 — Three Shots Against Wrath / Tam Đạn Trấn Nộ

Target **ba enemy có Current Rage cao nhất trên sân**, ba viên đạn, **mỗi selected enemy một viên**, không ba viên dồn vào một enemy.

| Mode | Damage mỗi recipient | Rage reduction mỗi recipient | AE Cost |
| --- | --- | --- | --- |
| Không có Chân Ngã nhập | `135% WIL + 135% ATK` | 15 | 30 |
| Có Chân Ngã nhập | `150% WIL + 150% ATK` | 20 | 25 |

Hai phần hệ số đều dùng stat của Kenoma; không nhân chúng với nhau hoặc bỏ một phần. Damage types/source snapshot/strengthened-mode checkpoint ở Q2; metric tie, target/recipient checkpoints, empty/invalid policy và hit/group settlement ở Q3. Không suy Guaranteed Hit hoặc Entity chase từ việc chọn enemy có Rage cao nhất.

Damage và Rage reduction được mô tả **“đồng thời”**. Không có câu yêu cầu positive Actual HP Damage để giảm Rage; không tự thêm gate đó. Exact Hit/recipient policy và coherent Damage/Rage group còn cần Q3 chốt, thay vì cho một Effect âm thầm chọn lại target.

## 3. Skill2 — Flesh Becomes Armor, Armor Becomes Flesh / Huyết Nhục Hóa Giáp, Giáp Hoàn Huyết Nhục

### 3.1 Trigger và Cost

Đây là **received-Damage reactive Skill**, không phải nút chủ động được mô tả để tự tiêu một Natural Action. Trigger khi Kenoma nhận qualifying Damage **strictly greater than35% MaxHP** từ **enemy Natural Action**. Equal35% không qualify.

Explicit scope: **không DoT**, nhưng **có damaging Passive kiểu Follow-up hoặc cường hóa Damage**, và **TRUE Damage cũng tính**. Raw không tự biến mọi cùng-root Damage thành qualifying; membership, completion checkpoint và MaxHP reference còn ở Q4.

Theo ordinary Damage contracts, dùng committed **Actual HP Damage** và whole qualifying Action aggregate, không Shield absorption/Overkill hoặc animation-hit frames. HP Cost/non-Damage HP Loss không tự thành Damage. “MaxHP đã mất” ở bước chuyển đổi chưa đồng nghĩa với D của ngưỡng; hai quantities phải được chốt riêng.

**Cost5 AE mỗi successful activation**, không cap số activation/trận. Required Cost validation/payment precedes conversion Effects; failed payment không cho partial MaxHP loss/Shield. Không tự lưu retry token, biến failed payment thành activation, miễn mandatory lifecycle hoặc thêm Death Prevention/Revive cho Skill này.

### 3.2 Exchange, Shield nguồn riêng và kết thúc

Chuyển **100% lượng HP/MaxHP đã mất** thành Shield, đồng thời **giảm MaxHP bằng lượng đem chuyển**. Quantity cụ thể ở Q5; không suy decrease CurrentHP thêm lần nữa bằng Damage.

Shield là đóng góp **riêng của Skill2** trong pool Shield nhiều nguồn. Ordinary Standard Shield absorption trừ các nguồn **proportionally theo remaining contribution**, không trừ cùng một absolute amount ở từng nguồn và không ưu tiên khiên Skill2. Khi tính terminal Heal, chỉ lấy remaining Skill2 contribution của đúng activation, không total Shield hoặc remaining của nguồn khác.

Controller tồn tại **ba Natural Actions của Kenoma**. Sau bộ đếm đó, remove remaining Skill2 Shield nếu còn, restore MaxHP, và nếu còn Skill2 Shield thì **self-Heal bằng đúng lượng remaining đó**. Shield đã vỡ không tự tạo remaining entitlement; không kết thúc bộ đếm/CD sớm chỉ vì Shield vỡ. Restoration không xóa Shield từ nguồn khác còn hợp lệ/chưa hết duration.

Ví dụ raw không có nguồn/modifier khác:

- `HP100/MaxHP200` đổi capacity100 → `HP100/MaxHP100`, Skill2 Shield100.
- Khi kết thúc, nếu Skill2 Shield còn30: restore MaxHP200, rồi requested Heal30 → `HP130/MaxHP200`.
- Nếu Skill2 Shield còn0: restore MaxHP200, không có terminal Shield Heal → `HP100/MaxHP200`.

Restore MaxHP không tự Heal100 capacity đã lấy đi. Heal vẫn là ordinary Heal, không Revive hoặc bypass Heal admission/modifiers. Vấn đề lượng exchange, paired mutation/removal, overlapping activations, field-leave retention và exact expiry/CD checkpoint ở Q5–Q6.

Theo clock luật chung, duration/CD tính các **qualifying owner Natural-Action opportunities đã consumed**; CC-lost opportunity count nếu không có exception explicit, non-Natural Follow-up/Counter/Reaction không count. Actor không nhận opportunity không tiến clock chỉ vì global TURN_BOUNDARY. Không tự gán exception “actual successful Actions only”.

### 3.3 Cooldown và strengthened growth

Khi **bộ đếm ba Natural Actions kết thúc**, Skill2 vào **CD hai Natural Actions của Kenoma**. Không cap activation/trận khác được mô tả. Active-window recast/refresh/stack và CD start/decrement/leave behavior chưa được chọn thay designer.

Nếu có Chân Ngã nhập, tại điểm **Skill2 vào CD** tăng **5% MaxHP**, basis tính tại checkpoint đó; bonus reset khi actual LEAVE_FIELD. Current-versus-restored basis, accumulation/reconciliation và live-versus-captured True Self gate còn ở Q7. Không suy tăng5% từ snapshot đầu trận hoặc tăng CurrentHP5% như một Heal mặc định.

Nhận xét “tốt hay xấu” là design discussion, không định nghĩa BUFF/DEBUFF, Cleanse eligibility hoặc Authority. Numeric-negative MaxHP mutation không tự thành Debuff. Không suy Rank/Authority của effect từ hình tượng cơ giới.

## 4. Skill3 — Core-Piercing Round / Đạn Xuyên Sinh Lõi

Target enemy ở **Slot8**, **không target Leader identity**. Nếu Leader hợp lệ di chuyển, giữ Slot8; không chase Leader hoặc đổi về Slot Leader mới. Actor không được dịch chuyển bởi bullet VFX.

Base Damage **`160% WIL + 160% ATK`**, Cost **25 AE** theo resource context của kit. Khi có Chân Ngã nhập, Cost giảm5 → **20 AE**.

Trong strengthened mode, nếu target nhận **Actual HP Damage từ Skill3**, nhận thêm **TRUE Damage bằng5% MaxHP của Kenoma lúc dùng Skill3**. Shield-only absorption không thỏa positive ActualHP gate. Source MaxHP là Kenoma, không target; không đọc lại MaxHP tại bonus commit thay cast-time basis. No implicit recursion từ chính bonus Damage, không thêm Natural Action cho một additional Damage clause.

Damage base types/strengthened checkpoint ở Q2. Slot recipient timing, empty/admission/invalid policy, snapshot và exact main-hit→bonus identity/order ở Q8. Ordinary TRUE Damage không tự Shield Piercing, Execute hoặc Guaranteed Hit; mandatory target lifecycle vẫn áp dụng.

## 5. Ultimate — Reclamation Salvo / Loạt Đạn Thu Hồi

Cast **một lần Skill1, Cost0**, sau đó **self-Heal50% Actual HP Damage gây ra**. Không thêm một lần Skill1 unenhanced rồi lại enhanced; Skill1 strengthened mode vẫn là conditional profile đã nêu.

Không đổi Heal basis thành nominal coefficients, Shield absorption hoặc Overkill. Skill1 Cost waiver không tự miễn root Ultimate readiness/Rage hoặc cấp extra Natural Action/SSI/class resource generation. Không có native Overheal-to-Shield clause cho Ultimate; không copy Passive Renchu vào Kenoma.

Real Skill child identity, exact result projection, một-versus-per-recipient Heal và ordinary Counter/Reaction gate ở Q9. Không tự inline-copy Skill1 hoặc lấy mọi same-root Damage làm Heal credit.

## 6. Source fidelity và lifecycle guards

Không thêm actor movement, native immunity, Authority tier, hidden cap, custom HP damage, restore toàn bộ snapshot stat/Shield hay Chân Ngã synthetic từ presentation.

Actual LEAVE_FIELD/Death/Return-to-Deck/Revive/routing là những transitions khác nhau. Cost reduction battle-scoped khác với growth reset-on-leave; Skill2 active/CD/paired MaxHP retention còn cần Q6. Terminal Shield removal cause phải giữ distinct: natural controller end, Shield depletion, explicit removal và lifecycle cleanup không tự thành cùng một event/reward.

## 7. UNRESOLVED — Q1–Q9 cần designer chốt

Các nhóm này thay đổi observable gameplay và chặn phần normalization phụ thuộc. **Mọi “đề xuất” dưới đây vẫn chưa được duyệt.** Không dùng chúng như khóa đã có hoặc generic architecture defaults.

1. **Q1 — Chân Ngã/host/route/lifetime.** “Vào sân không Chân Ngã” chỉ initial creation hay mọi reentry? Kenoma tự nhận entrant bằng route nào, hay chỉ là host khi route khác explicit đưa vào? Nếu tự nhận: eligible Side/pool, alive/presence/empty-host gate, selection khi nhiều entrants/hosts, blockers và local failure phải được chỉ định. Có tối đa một Chân Ngã, không overwrite; giữ Side/body/stats/kit Kenoma và chỉ bật strengthened clauses? Soul/upgrade giữ hay rời host khi leave/Return-to-Deck/Death/Revive? Kenoma collection body chưa có Chân Ngã chết có count cho waiting progress của Chân Ngã khác không? Không có identity record thì không tạo waiting/ordinary Revive cho một Chân Ngã không tồn tại.
2. **Q2 — Base Damage và strengthened cast snapshot.** Đề xuất Skill1/Skill3 mỗi bullet/main hit chứa PHYSICAL từ ATK + WILL từ WIL; chỉ bonus Skill3 explicit TRUE. Bind has-True-Self flag cùng successful cast admission/Cost read, dùng cùng flag cho Cost và coefficients của execution đó; snapshot ATK/WIL sau required Cost. Không re-read enhanced mode giữa Cost/hits; Skill3 MaxHP snapshot ở cast start. Cần chốt, không tự suy types từ stat names.
3. **Q3 — Skill1 selection/hit/Drain profile.** Đề xuất snapshot Rage và top3 sau Cost, cutoff ties seeded RANDOM_AMONG_TIED/NO_DUPLICATES; tối đa available legal enemies, không dồn đạn còn dư. Không có legal enemy lúc admission thì không cast. Lock selected current Slots theo project default, settle pre-Damage movement, đọc occupants rồi freeze; empty OMIT_LOCAL, invalid DROP_LOCAL, no chase/retarget/reroll. Mọi bullet và Rage drains commit một coherent simultaneous group; legal recipient nhận drain dù Shield chặn HP Damage, MISS/invalid branch không drain. Cần chốt exact checkpoints/grouping và tie policy.
4. **Q4 — Skill2 qualifying outcome/threshold checkpoint.** Chốt exact passive/follow-up membership; có exclude independent Counter/Reaction/Mark/unrelated same-root Effects không? Đề xuất D là per-Kenoma committed ActualHP aggregate của enemy Natural outcome và damaging Passive Follow-ups/cường hóa được outcome đó kích theo declared scope, không DoT/Shield/Overkill/unrelated Effects. Snapshot Kenoma CurrentMaxHP ở enemy Natural Action start, strict `D > 0.35M`; chờ toàn bộ qualifying Damage/lifecycle terminal rồi xét một lần. Exact closure/window không được chọn chỉ từ shared root ID hoặc incidental Reaction order.
5. **Q5 — Exchange quantity và paired MaxHP restore.** Đổi tổng missingHP tại conversion hay chỉ D của triggering Action? Ở HP160/200 nhận D80 → HP80/200: missingHP120 sẽ cho MaxHP80/Shield120; dùng D80 sẽ cho MaxHP120/Shield80. Đề xuất missingHP tại successful post-Cost conversion checkpoint, giữ absolute CurrentHP, một temporary capacity-loss record -H + Skill2 Shield H, restore bằng removal đúng record đó thay rewind baseline/snapshot của nguồn khác. Không tự tái dựng threshold D từ missingHP.
6. **Q6 — Active lock, clock/CD và leave.** Đề xuất tối đa một controller ACTIVE; đang active hoặc CD thì không tạo/refresh/stack activation mới. Break/removal riêng Shield không kết thúc controller; sau third consumed owner opportunity capture own remaining contribution → remove own Shield/own -H record → ordinary Heal remaining → start fresh CD2, không trừ CD mới ở chính expiry opportunity. Actual leave/death cleanup hủy controller/CD/paired penalty theo field-scoped lifetime, không terminal Heal/growth/expiry reward; reentry không chạy callback cũ. Clock opportunity/CC default ở §3.2 không phải unresolved mới.
7. **Q7 — Growth5%.** Đề xuất check has-bound-True-Self tại natural controller end/CD start, **sau restore MaxHP**; `g=0.05×CurrentMaxHP` tại checkpoint đó, thêm source-traceable +g MaxHP contribution mỗi successful cycle, cumulative/compounding khi không có nguồn khác, preserve absolute CurrentHP/no auto Heal. Remove own accumulated contributions khi actual leave, không rewind foreign stat changes. Soul nhận giữa active window có đủ điều kiện ở expiry? Basis trước restore, nonstack hoặc other reconciliation sẽ cho outcome khác.
8. **Q8 — Skill3 recipient/bonus settlement.** Đề xuất require legal enemy Slot8 ở admission; post-Cost lock Slot8/snapshot, settle pre-Damage movement, read current occupant; empty MISS/locally omitted, later invalid DROP_LOCAL, no chase/retarget. Một main hit2components → mandatory lifecycle → positive committed ActualHP gate của đúng main hit → một direct additional TRUE hit `0.05×castMaxHP`, chỉ nếu cùng recipient còn legal; bonus không tự trigger lại. Ordinary Counter/Reaction sau direct main+bonus chain; positive result không cho bắn vào corpse hoặc Entity mới thay ô sau main commit.
9. **Q9 — Ultimate child/outcome/Heal order.** Đề xuất một ULTIMATE Natural root request đúng một real SKILL child non-Natural, waive child AE0, giữ conditional Skill1 profile/identity. Sau all exact child own-direct Damage/drain/lifecycle terminal, D=sum actualHP receipts của child direct Damage, một self-Heal0.5D trước root ACTION_DIRECT_EFFECTS_COMPLETE/ordinary Counter/Reaction. Exclude independent same-root Counter/Reaction/DoT/Passive; không Heal theo target/hit hoặc cần future root completion trước Heal. Ordinary Heal/Overheal law áp dụng, không native Shield conversion mới.

## 8. UNRESOLVED / NOT BLOCKING

Rank/Class/Element, Basic profile, Base Deployment Cost/numeric budget và declared deployment floor còn thiếu; không tự chọn numeric payment hoặc Basic fallback khi metadata chưa đủ. Chúng không chặn việc giữ nghĩa các Skill đã mô tả hoặc hỏi Q1–Q9.

Future Mode adapters, unrelated router-family contention, external capacity/Shield caps, explicit status removal hoặc special restore profiles dùng governing law khi thực sự gặp. Không tạo ưu tiên mới hoặc hỏi trước về mọi hypothetical external kit để thay các quyết định nội bộ ở §7.
