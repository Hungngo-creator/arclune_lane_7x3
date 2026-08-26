# Warrior SSR — Stance / Execute / Yone-style Ultimate

Đây là char thứ 3 trong ý tưởng nhân vật 4.md
## 1. Chốt Rank, Class và Identity
**Rank:** SSR  
**Class:** Warrior  
**Element:** chưa chỉ định.

**Lục Cực Đồ:** DMG 4/5 | SUR 3/5 | CTL 3/5 | CMP 4/5 | MIC 4/5 | VIS 5/5

**Identity:** sustained-DPS / stance fighter / execution finisher. Nhân vật không lấy burst làm signature; sức mạnh nằm ở Basic Attack + Skill rotation, đổi Đơn Kiếm/Song Kiếm và tích DEATH_CONFIRMED để tạo Execute. Warrior phù hợp hơn Assassin vì loop chính là sustained damage và stance management; Execute chỉ là finisher.

## 2. State Đơn Kiếm / Song Kiếm
Đơn Kiếm và Song Kiếm là State của Character Instance, không phải hai Character Definition.
- Đơn Kiếm: Basic Attack = 100% ATK + 100% WIL.
- Song Kiếm: Basic Attack = 150% **Base Basic Attack Profile**, đồng thời bỏ qua 10% ARM + 10% RES của target.
- Hai form vẫn có cùng Basic Attack identity; Damage Profile thay đổi theo State.
- Mỗi lần vào sân hoặc tái nhập sân sau khi rời sân: bắt đầu Đơn Kiếm.
- Ultimate hoàn thành sẽ toggle sang state còn lại.

**Ultimate state timing:** snapshot form ở đầu Ultimate → toàn bộ Ultimate dùng form đã snapshot → resolve damage/reaction/death → Action Completion → toggle state. Không toggle giữa chừng.

## 3. Skill 1 — Song Kiếm Cuồng Trảm
Chỉ dùng ở Song Kiếm.

**Damage:** 165% **Base Basic Attack Profile**. Không nhân tiếp 150% của Song Kiếm. Vì vậy nếu Base Basic = 100%, Skill 1 = 165%, không phải 247,5%.

Nếu target bị `DEATH_CONFIRMED` bởi chính Natural Action này:
- nhận Frenzy;
- Frenzy: Basic Attack damage +10%;
- duration: 2 Natural Actions của bản thân;
- không stack;
- kích hoạt lại chỉ refresh duration về 2 Natural Actions.

Kill chỉ hợp lệ khi DEATH_CONFIRMED được attribution cho damage của Natural Action này. Không tính DoT, phản damage, Follow-up, reaction damage ngoài action hoặc Execute từ nguồn khác.

**Tags:** `DAMAGE`, `TARGET_ENEMY`, `BUFF`, `STAT_MODIFIER`.

## 4. Skill 2 — Đơn Kiếm Hồi Sinh
Chỉ dùng ở Đơn Kiếm.

**Damage:** 180% Base Basic Attack Profile.

**Heal:** 25% tổng `ACTUAL_HP_DAMAGE` Skill 2 gây ra lên target.

Không tính damage bị Shield hấp thụ và không tính Overkill.

**Tags:** `DAMAGE`, `HEAL`, `TARGET_ENEMY`, `TARGET_SELF`.

## 5. Skill 3 — Execute Counter
Mỗi Natural Action của hắn gây `DEATH_CONFIRMED` cho target:
- counter +1.

Khi counter đạt 2:
- tạo 1 Execute instance;
- Execute tồn tại 2 Natural Actions của bản thân;
- counter reset về 0 sau khi Execute được tạo.

Một Natural Action có thể tạo nhiều DEATH_CONFIRMED; phải aggregate toàn bộ death sau khi Natural Action resolve xong, rồi mới update counter. Không được tạo Execute giữa chừng để ảnh hưởng chính Action đang xử lý.

## 6. Execute
### Candidate Tag: `EXECUTE`
**Tên Việt:** Kết liễu  
**Tên Anh:** Execute

**Definition:** Effect cho phép một damage event đủ điều kiện biến target đang dưới một ngưỡng HP xác định thành lethal, dẫn tới DEATH_CONFIRMED theo Execute Contract.

**Semantic Boundary:** Conditional lethal behavior; không phải damage amplification, True Damage hay chỉ là threshold trigger.

**Includes:** Target dưới 10% Max HP và nhận damage từ source → bị kết liễu; conditional lethal effect gắn với damage event.

**Does Not Include:** Damage chỉ tăng khi target thấp HP; True Damage; Overkill; DEATH_CONFIRMED không do Execute gây ra.

Execute kill từ Skill 3 **không cộng lại** vào Skill 3 death counter.

## 7. Execute Authority và Dynamic Anti-Heal
Execute của Skill 3 có Authority = **Pháp Tắc**; Skill 3 vẫn là Skill thường, không cần toàn Ability trở thành Pháp Tắc.

Ngay khi bản thân nhận Execute instance từ Skill 3:
- nhận Debuff `Không Thể Hồi Phục`;
- Authority của Debuff = Authority của Execute instance tạo nó.

Không hard-code `antiHealAuthority = PHAP_TAC`. Phải dùng `antiHeal.authority = sourceExecute.authority`. Nếu Execute sau này đổi thành Quy Tắc, anti-heal tự đổi theo.

`Không Thể Hồi Phục`:
- không nhận Heal từ nguồn ngoài bản thân;
- ngoại lệ: nguồn có Authority >= Authority của anti-heal;
- Heal từ bản thân được phép.

Chưa tạo Tag `HEAL_BLOCK`; hiện có thể biểu diễn bằng `DEBUFF` + `IMMUNITY` với scope HEAL và exception theo Authority. Chỉ tạo Tag riêng nếu roster sau này chứng minh có semantic độc lập rõ ràng.

## 8. Execute Priority
Nếu nhiều Execute cùng hợp lệ:
1. Ưu tiên Execute do chính character tạo.
2. Nếu nhiều self-generated Execute, dùng creation order/timestamp deterministic.
3. Không random.

Đây là resolution priority, không phải Tag.

## 9. Death Trigger
### Candidate Tag: `DEATH_TRIGGER`
**Tên Việt:** Kích hoạt theo tử vong  
**Tên Anh:** Death Trigger

**Definition:** Trigger phụ thuộc vào `DEATH_CONFIRMED` của Actor theo Death Lifecycle Contract.

**Semantic Boundary:** Trigger sau khi death đã được xác nhận; không dùng cho HP_ZERO hoặc lethal damage trước DEATH_CONFIRMED.

**Includes:** “Mỗi khi target DEATH_CONFIRMED...”.

**Does Not Include:** HP_ZERO; Death Prevention; Revive.

Skill 3 Tags:
- `AUTO_TRIGGER`
- `ACTION_COUNTER`
- `DEATH_TRIGGER`
- `TARGET_SELF`
- `EXECUTE`
- `DEBUFF`
- `IMMUNITY` nếu Anti-Heal được biểu diễn bằng immunity scope.

## 10. Ultimate — Yone-style Composite Action
Ultimate:
- xác định 1 cột enemy tùy vị trí caster;
- tối đa 3 enemy trên cột được chọn;
- hất/gom các target vào hàng đích;
- mỗi selected target nhận đúng 1 Basic Attack damage profile theo stance hiện tại;
- caster trở về slot đã snapshot khi Ultimate bắt đầu;
- mỗi target bị Ultimate tính là nhận 1 Basic Attack hit từ caster;
- Ultimate không phải Basic Attack.

### Cột
- Caster 1/4/7 → target column 3/6/9.
- Caster 2/5/8 → target column 2/5/8.
- Caster 3/6/9 → target column 1/4/7.

Taunt là ngoại lệ nếu Target Contract cho phép Taunt override selection. Nếu không có Taunt override, selection theo column là deterministic.

## 11. Ultimate Target Snapshot — điểm quan trọng nhất
Resolution đề xuất:
1. Snapshot caster position/state.
2. Determine target column.
3. Build Candidate Pool.
4. Apply Taunt override nếu có.
5. Select tối đa 3 target Actor.
6. Snapshot target Actor IDs.
7. Move/group chính các target đã snapshot.
8. Resolve đúng 1 Basic Attack damage profile lên từng selected target.
9. Resolve reaction/death.
10. Return caster về original position snapshot.
11. Toggle stance.
12. Action Completion.

### Nếu slot trống
Không có Actor thì không có target, không có damage.

### Nếu Actor mới bước vào slot sau Target Selection
Actor mới **không trở thành target** chỉ vì chiếm slot đó. Target đã snapshot bằng Actor Instance ID.

### Nếu selected target đổi slot
Vẫn nhận damage vì target identity đã snapshot.

### Nếu selected target chết/biến mất trước damage commit
Không chuyển damage sang actor khác. Target không còn hợp lệ thì packet không có valid target.

**Do đó câu hỏi “kẻ mới đến có nhận sát thương không?” → Không**, nếu hắn xuất hiện sau target snapshot. Chỉ actor đã được select trước đó mới là target.

## 12. Có “Actor không phải target” trong cột không?
Theo luật hiện tại: không, trừ khi có Filter/Rule như Taunt, Leader restriction hoặc target invalid.
- Nếu cả 3 slot của column có enemy hợp lệ → cả 3 là target.
- Nếu slot trống → không có target ở slot đó.
- Không cần fallback sang column khác chỉ vì slot trống.

Vì vậy Ultimate có thể snapshot các Actor hợp lệ trên column trước khi Position Mutation.

## 13. Ultimate không phải Basic Attack
**Ability Type:** `ULTIMATE`  
**Action Behavior:** `COMPOSITE_ACTION`

Không gắn `BASIC_ATTACK` chỉ vì damage sub-effect dùng Basic Attack profile.

Mỗi selected target vẫn nhận một Basic Attack hit event theo contract để effect “khi bị Basic Attack đánh” có thể tương tác. Nhưng đó không phải một Natural Action mới của caster.

## 14. Position Mutation
Ultimate có gameplay Position Mutation thật:
- `POSITION_MUTATION`
- `TARGET_ENEMY`
- `AOE_FIXED`
- `DAMAGE`

“Hất tung” chỉ là VFX/presentation nếu không có CC contract.

### Destination occupancy
Nếu destination slot đã có Actor không phải selected target, đây là vấn đề của **Position Collision/Relocation Contract chung của kernel**, không hard-code riêng cho character.

Các phương án có thể có: swap, displace, fallback hoặc visual-only grouping. Chưa tạo Tag mới cho việc này.

## 15. Return Position
Caster snapshot vị trí trước Ultimate. Sau resolution:
- return về slot snapshot;
- nếu slot không còn hợp lệ, dùng fallback deterministic theo Position Contract;
- không random chỉ vì slot cũ đã bị chiếm.

## 16. Ultimate và Skill 3 Counter
Nếu Ultimate gây DEATH_CONFIRMED:
- 1 target → counter +1;
- 2 target → counter +2;
- 3 target → counter +3.

Toàn bộ death được aggregate sau Ultimate. Nếu threshold tạo Execute, Execute chỉ available **sau Action Completion**, không retroactively áp dụng cho target đã nhận damage trong chính Ultimate.

## 17. Final Tag Map
### Passive / Stance
Không cần Tag mới cho stance switching. Basic:
- `DAMAGE`
- `TARGET_ENEMY`
- `PHYSICAL_DAMAGE` và/hoặc `WILL_DAMAGE`
- Song Kiếm thêm `PENETRATION`

### Skill 1
- `DAMAGE`
- `TARGET_ENEMY`
- `BUFF`
- `STAT_MODIFIER`

### Skill 2
- `DAMAGE`
- `HEAL`
- `TARGET_ENEMY`
- `TARGET_SELF`

### Skill 3
- `AUTO_TRIGGER`
- `ACTION_COUNTER`
- `DEATH_TRIGGER`
- `TARGET_SELF`
- `EXECUTE`
- `DEBUFF`
- `IMMUNITY` nếu dùng immunity scope cho Anti-Heal

### Ultimate
- `AOE_FIXED`
- `TARGET_ENEMY`
- `DAMAGE`
- `POSITION_MUTATION`

`COMPOSITE_ACTION` không cần trở thành Functional Tag nếu Ability Schema đã biểu diễn nó ở Action Behavior.

## 18. Hai Tag mới thực sự cần
Chỉ có:
1. `EXECUTE`
2. `DEATH_TRIGGER`

Không tạo:
- `STANCE_SWITCH`
- `YONE_ULT`
- `POSITION_COLLISION`
- `HEAL_BLOCK` lúc này
- `BASIC_ATTACK_PROFILE`
- `COMPOSITE_ACTION` như Functional Tag.

## 19. Balance sau khi chốt Base Basic Attack Profile
Skill 1 = 165% Base Basic Attack Profile.  
Skill 2 = 180% Base Basic Attack Profile.  
Frenzy = +10% Basic Attack damage, không stack, re-trigger chỉ refresh duration.

Điều này giảm burst so với cách hiểu 165% × 150%, giữ identity sustained DPS rõ hơn.

Skill 1 không còn biến Song Kiếm thành một burst multiplier cực lớn. Skill 2 cung cấp sustain. Execute tạo pressure cuối vòng nhưng không trực tiếp làm raw damage snowball.

**Mục tiêu “damage trung bình cao, dùng skill liên tục, đánh lâu” phù hợp với thiết kế hiện tại.**

## 20. Final Score
**Rank:** SSR  
**Class:** Warrior  
**Element:** chưa chỉ định

**Lục Cực Đồ:** DMG 4/5 | SUR 3/5 | CTL 3/5 | CMP 4/5 | MIC 4/5 | VIS 5/5

## 21. Ultimate Resolution Contract — bản ngắn
```text
Ultimate Start
→ Snapshot caster state/position
→ Target Selection by column
→ Taunt override if applicable
→ Snapshot target Actor IDs
→ Position Mutation / grouping
→ One Basic Attack damage profile per selected target
→ Resolve damage/reactions/death
→ Aggregate DEATH_CONFIRMED
→ Update Skill 3 counter
→ Create Execute if threshold reached
→ Return caster to original position
→ Toggle stance
→ Action Completion
```

## 22. Kết luận về câu hỏi Target Mutation
Câu hỏi của user **không làm thay đổi kết quả tag map hoặc balance**. Nó chỉ làm rõ Resolution Contract của Ultimate: target phải được snapshot **trước** Position Mutation. Actor mới xuất hiện sau snapshot không bị damage; selected target vẫn bị damage dù vị trí đã thay đổi. Các Tag `AOE_FIXED`, `TARGET_ENEMY`, `DAMAGE`, `POSITION_MUTATION` vẫn đúng.
