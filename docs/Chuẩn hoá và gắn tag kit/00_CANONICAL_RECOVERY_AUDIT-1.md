# ARCLUNE — CANONICAL RECOVERY / AUDIT
## Chặng A — Khôi phục trạng thái canonical trước khi tiếp tục chuẩn hóa
**Version:** 2026-09-10-A  
**Mục tiêu:** xác định cái gì thực sự đã được chuẩn hóa, cái gì chỉ là legacy/proposal, cái gì mâu thuẫn, cái gì đã bị phiên bản sau phủ định, và cái gì tuyệt đối không được âm thầm “điền hộ” trước khi tạo `TERMINOLOGY vNext`, `TAG vNext`, `PRIMITIVE`, `ABILITY_SCHEMA`, `CONTRACTS`, `KERNEL_RUNTIME`.

---

# 0. KẾT LUẬN NGẮN TRƯỚC

Quá trình chuẩn hóa Arclune **chưa hoàn tất**.

Các file hiện có không tạo thành một bộ canonical đóng kín. Chúng là hỗn hợp của:

- quyết định đã được ghi là “đã chốt”;
- semantic nền tương đối ổn định;
- các bản refactor về sau;
- khuyến nghị của model trước;
- câu hỏi còn mở;
- các ví dụ minh họa;
- một số mâu thuẫn thật sự giữa file;
- một số “mâu thuẫn giả” thực ra là rule global và override riêng của character;
- một số Tag đang nằm sai layer hoặc ít nhất chưa chứng minh được tại sao cần tồn tại song song với Schema field.

**Không được lấy bất kỳ file legacy nào rồi tuyên bố toàn bộ file đó là canonical.**

Kết quả của Chặng A không phải là “chốt lại mọi thứ”.  
Kết quả của Chặng A là dựng được **ranh giới tin cậy** để Chặng B/C không tiếp tục xây trên semantic sai.

---

# 1. NGUYÊN TẮC CHỐNG “NHIỄM” TỪ MODEL CŨ

Vì quá trình Tag từng dừng giữa chừng, mọi nội dung do model cũ chuẩn hóa phải được đọc theo **bằng chứng trong file**, không theo uy tín của model đã viết nó.

Chặng A sử dụng 6 mức trạng thái:

## `RECOVERED_LOCK`
Một rule được coi là đủ mạnh để mang sang vòng chuẩn hóa kế tiếp vì ít nhất một trong các điều kiện sau:

- file gọi rõ là “đã chốt”, “Engine invariant”, “Canonical Rule” và không bị nguồn mới hơn phản bác;
- nhiều source độc lập hội tụ cùng semantic;
- rule là ranh giới kiến trúc nền đã được giữ nhất quán qua nhiều file;
- hoặc user đã sửa/chốt trực tiếp sau các file legacy.

`RECOVERED_LOCK` **không có nghĩa** mọi chi tiết implementation xung quanh rule đó cũng đã chốt.

## `STRONG_CANDIDATE`
Semantic có bằng chứng tốt và rất có khả năng đúng, nhưng chưa nên đóng băng trước audit vNext.

## `LAYER_REVIEW`
Concept có thật, nhưng chưa xác định nó nên nằm ở:
- Tag,
- Schema Field,
- Contract,
- Primitive,
- State,
- Metadata,
- hay subsystem.

Không được xóa concept; chỉ chưa được quyết định layer.

## `LEGACY_PROPOSAL`
Nội dung có từ ngữ như:
- khuyến nghị,
- đề xuất,
- nên,
- ưu tiên,
- có thể,
- cần chọn,
- cần quyết định.

Không được nâng thành canonical chỉ vì nó nằm trong file “chuẩn hóa”.

## `UNRESOLVED`
File tự ghi cần chốt, hoặc các nguồn không đủ để quyết định.

## `SUPERSEDED`
Một rule cũ đã bị rule mới hơn phủ định rõ.

---

# 2. INVENTORY NGUỒN VÀ VAI TRÒ

## 2.1 `terminology.md`

### Vai trò
Đây là baseline semantic rộng nhất hiện có.

Nó đã có các lớp quan trọng:

- Character / Character Instance.
- Identity / True Self.
- `trueSelfId`.
- `lifeSerial`.
- Presentation Definition.
- Combat Definition.
- Combat Instance.
- Ability / Ability Type.
- Action / Natural Action.
- Turn Boundary.
- Action Completion.
- Action Snapshot.
- Action Identity.
- Action Behavior.
- Composite Action.
- Multihit.
- Event / Trigger / Reaction.
- Target Selection pipeline.
- Damage Action / Damage Packet / Damage Profile.
- Actual HP Damage / Overkill.
- HP Loss / Self HP Cost.
- Death lifecycle vocabulary.
- Authority / Pháp Tắc / Quy Tắc / Axiom.
- Divine Nature / Uniqueness.
- Resource.
- Stat.
- Effective Element.
- Tag / Primitive / Parameter / Ability Schema.
- Narrative System.
- Resolution Order / Commit / Cleanup.

### Mức tin cậy
**Cao với vai trò từ điển working baseline, nhưng không phải canonical hoàn tất.**

Lý do:
- có vài semantic còn quá rộng;
- có chỗ xung đột với rule mới hơn;
- thiếu các distinction về attribution/source đã xuất hiện về sau;
- một số câu mô tả death lifecycle chưa đủ chính xác.

### Quyết định
Dùng file này làm **base chính cho `TERMINOLOGY vNext`**, nhưng phải patch, không copy nguyên xi.

---

## 2.2 `tag.md`

### Vai trò
Registry đời sớm.

### Vấn đề lớn
File còn xem:

- `PASSIVE`
- `SKILL`
- `ULTIMATE`
- `BASIC_ATTACK`

là Tag.

Điều này xung đột với refactor về sau:
> Ability Type và Functional Tag là hai layer khác nhau.

### Quyết định
`tag.md` là **historical baseline**, không phải base để tiếp tục.

Nó hữu ích để:
- truy dấu semantic cũ;
- kiểm tra Tag nào từng tồn tại;
- phát hiện migration/supersession.

Không dùng nó làm registry canonical kế tiếp.

---

## 2.3 `tag_v0.2_silas.md`

### Vai trò
Checkpoint Tag tiến hơn.

Nó đã:

- thêm Tag Attachment Rules;
- loại `PASSIVE/SKILL/ULTIMATE/BASIC_ATTACK` khỏi Functional Tag Registry;
- định nghĩa Tag vs Schema Field;
- thêm `AIRBORNE`;
- thêm `POSITION_MARK`;
- thêm `SELF_HP_COST`;
- củng cố governance “một semantic → một Tag”;
- yêu cầu chứng minh semantic boundary trước khi tạo Tag mới.

### Dấu hiệu chưa hoàn tất
- tên file là `v0.2`, header vẫn ghi `Canonical Tag Taxonomy v0.1`;
- section numbering chưa sạch;
- Governance item `12.` bị bỏ trống;
- chính file giữ nhiều Tag có semantic rất gần với Schema Field trong khi đồng thời nói “không tạo Tag chỉ vì Schema field đã có cùng semantic”.

### Quyết định
Đây là **checkpoint Tag tốt nhất hiện có**, nhưng chỉ là working draft.

Không gọi toàn bộ registry là canonical.

---

## 2.4 `Hoa_Than_Ky_Uc_Chi_Chu_Prime_Mage_chuan_hoa.md`

### Vai trò
Stress test mạnh cho:

- Identity qua nhiều life.
- stat snapshot qua death.
- `trueSelfId` / `lifeSerial`.
- Revive.
- Forgotten / target exclusion.
- Target Selection ≠ Area Resolution.
- Damage Action aggregation.
- Actual HP Damage.
- True Damage echo.
- trigger recursion prevention.
- Natural Action sequence tracking.
- Thần Tính.
- Authority.

### Mức tin cậy
File có cả:
- Engine invariants;
- canon/đã đồng ý;
- câu hỏi còn mở;
- khuyến nghị.

Phải phân loại theo từng rule, không theo cả file.

---

## 2.5 `Luan_Hoi_Chi_Chu_Prime_Mage_chuan_hoa.md`

### Vai trò
Stress test mạnh cho:

- Identity ≠ Presentation ≠ Combat Definition.
- True Self / lifeSerial.
- Reincarnation.
- Cocoon/container.
- lifecycle stage.
- temporary absence.
- materialization.
- Max HP mutation.
- composite action.
- per-effect authority.
- Uniqueness.
- Arena Combat Instance.
- transfer/cleanup giữa Combat Instance.

### Mức tin cậy
Ngay đầu file tự ghi rằng nội dung gồm “đề xuất/đồng thuận” và phần thiếu dữ kiện cần chốt.

Do đó:
- Engine invariant có trọng lượng cao;
- câu “khuyến nghị” vẫn là proposal;
- mục “lỗ hổng cần chốt” giữ nguyên là unresolved.

---

## 2.6 `Co_Su_Chi_Than_Prime_Mage_chuan_hoa.md`

### Vai trò
Stress test hệ thống, không chỉ stress test damage/turn.

Nó buộc kiến trúc phải hỗ trợ:

- Narrative Container.
- Story Instance.
- Capability Tag query.
- Witness.
- Causal Belief.
- Proof Event.
- Counter-Proof.
- Knowledge Propagation.
- Realization.
- property transfer.
- persistent subsystem state.
- Story-specific target requirements.
- Realized property với Authority riêng.

### Điểm rất quan trọng
File tự nói Tag legacy đang **tạp nham / chưa hoàn thiện** và Narrative System phụ thuộc vào việc vocabulary được chuẩn hóa.

Đây là bằng chứng trực tiếp rằng không được coi Tag Registry hiện tại là final.

---

## 2.7 `Arclune_SSR_Warrior_TrueDamage_Overheal_TurnBoundary.md`

### Vai trò
Stress test cho:

- Mixed Damage.
- True Damage.
- Max HP Mutation.
- HP Loss / Self HP Cost.
- Rage gain.
- Death Prevention.
- Overheal.
- Basic Attack identity vs damage-profile reuse.
- Debuff Identity.
- sequential composite Ultimate.
- authority inheritance khác nhau theo action.
- personal Turn Boundary.

### Mức tin cậy
Có hẳn mục “Các quyết định đã chốt”, nên các rule trong mục này có trọng lượng lớn hơn các giải thích/đề xuất bên ngoài.

---

# 3. KIẾN TRÚC GỐC ĐƯỢC KHÔI PHỤC

## 3.1 Bộ 4 file lõi ban đầu — `RECOVERED_LOCK`

Hướng ban đầu đúng là xoay quanh:

1. `terminology.md`
2. `tag.md`
3. `primitive.md`
4. `ability_schema.md`

Đây là bộ bốn để biến Character thành data/composition.

### Vai trò canonical

`TERMINOLOGY`
> khái niệm này nghĩa là gì?

`TAG`
> object này có semantic capability/identity gì?

`PRIMITIVE`
> Kernel thực thi thao tác gì?

`ABILITY_SCHEMA`
> một kit khai báo trigger/target/effect/cost/state/order/authority/tag như thế nào?

## 3.2 Câu trục kiến trúc — `RECOVERED_LOCK`

> **AI khai báo kit bằng semantic + composition; kernel thực thi bằng primitive.**

Tương đương:

> **Character = data/composition. Kernel = behavior/runtime.**

Không được chuyển thành:
> “Tag = code”.

Tag không trực tiếp thực thi behavior.

## 3.3 Tag ↔ Primitive — `RECOVERED_LOCK`

Không có ánh xạ 1 Tag = 1 Primitive.

Quan hệ phải là many-to-many.

Ví dụ semantic:

`DAMAGE + TRUE_DAMAGE + DAMAGE_TRIGGER`

có thể yêu cầu pipeline primitive kiểu:

`Snapshot → SelectTargets → BuildDamagePacket → ResolveDamage → AggregateActualHPDamage → EmitEvent → EvaluateTrigger`

Ngược lại một Primitive như `ApplyState` có thể phục vụ nhiều Tag.

## 3.4 Mở rộng từ 4 file thành nhiều layer — `STRONG_CANDIDATE`

Sau khi nhìn các stress test, việc tách thêm:

- `CONTRACTS`
- `KERNEL_RUNTIME`
- `MODE_PROFILES`
- `STRESS_TESTS`

là hợp lý về kiến trúc.

Điểm cần giữ:
**đây là mở rộng của bộ bốn, không phải phủ định bộ bốn.**

Cấu trúc đề xuất:

`TERMINOLOGY`
→ `TAG`
→ `ABILITY_SCHEMA`
→ `PRIMITIVE`
→ `CONTRACT`
→ `KERNEL_RUNTIME`
→ `MODE_PROFILE`

Trong thực tế Primitive và Contract liên hệ ngang mạnh hơn là pipeline một chiều tuyệt đối.

---

# 4. RECOVERED LOCKS — CÁC RANH GIỚI NỀN ĐỦ MẠNH ĐỂ GIỮ

## 4.1 Một semantic → một Canonical Tag

**Status: `RECOVERED_LOCK`**

Không tạo alias chỉ vì:
- tên Việt khác;
- tên Anh khác;
- lore khác;
- character khác;
- VFX khác.

Nếu Definition + Semantic Boundary giống nhau:
> dùng lại Tag cũ.

## 4.2 Number/value không phải Tag

**Status: `RECOVERED_LOCK`**

Không biến:
- 25%.
- 20 AE.
- 3 mục tiêu.
- 2 Natural Actions.
- 30% Max HP.
- cooldown 2.

thành Tag.

Đó là Parameter/Schema data.

## 4.3 Ability Type ≠ Functional Tag

**Status: `RECOVERED_LOCK`**

`PASSIVE`, `BASIC_ATTACK`, `SKILL`, `ULTIMATE` thuộc Ability Type.

Chúng không được giữ trong Canonical Functional Tag Registry chỉ để lặp lại `ability.type`.

### Hệ quả
Các entry tương ứng trong `tag.md` cũ:
> `SUPERSEDED`

## 4.4 Ability Type ≠ Action Identity ≠ Action Behavior ≠ Functional Tag

**Status: `RECOVERED_LOCK`**

Ví dụ:
- Skill có thể dùng damage profile của Basic Attack nhưng vẫn không phải Basic Attack.
- Forced Action có thể ép actor thực hiện Basic Attack.
- Follow-up có thể dùng Basic Attack behavior nhưng không mặc định là Natural Action.
- một outer Ultimate có thể gọi Skill bên trong mà không biến các Skill thành Ability Type Ultimate.

Đây là một trong những distinction quan trọng nhất của toàn hệ.

## 4.5 Target Selection ≠ Area Resolution

**Status: `RECOVERED_LOCK`**

Forgotten của Ký Ức Chi Chủ chứng minh:

- không được chọn làm direct/random target;
- nhưng fixed/full-field AoE đã resolve geometry vẫn có thể trúng.

Do đó:
> “không thể target” không đồng nghĩa “không thể bị AoE tác động”.

## 4.6 Damage Packet ≠ Actual HP Damage ≠ Overkill

**Status: `RECOVERED_LOCK`**

Actual HP Damage không bao gồm:
- damage bị Shield hấp thụ;
- overkill.

Nhiều mechanic đọc Actual HP Damage:
- echo;
- heal từ damage;
- threshold;
- lifesteal-like logic.

## 4.7 True Damage ≠ Shield Piercing

**Status: `RECOVERED_LOCK`**

True Damage không mặc định xuyên Shield.

Đây phải là hai semantic riêng.

## 4.8 HP Loss / HP Cost ≠ Damage

**Status: `RECOVERED_LOCK`**

Non-damage HP reduction không được phát Damage semantics chỉ vì HP giảm.

Tuy nhiên:
> **HP Loss và Self HP Cost vẫn cần phân biệt rõ hơn**, xem Conflict C-006.

## 4.9 HP_ZERO ≠ DEATH_CONFIRMED

**Status: `RECOVERED_LOCK`**

HP_ZERO chỉ bắt đầu death-evaluation.

Death Prevention có quyền can thiệp trước confirmed death.

Kill/on-death/on-kill/Luân Hồi không được phát sớm tại HP_ZERO.

## 4.10 Identity ≠ Presentation Definition ≠ Combat Definition

**Status: `RECOVERED_LOCK`**

Luân Hồi Chi Chủ và Pygmalion đều yêu cầu separation này.

Một entity có thể:
- mang một True Self;
- hiển thị bằng presentation A;
- dùng combat behavior B.

Không được merge tất cả thành một `characterId`.

## 4.11 Presentation ≠ gameplay state

**Status: `RECOVERED_LOCK`**

Invisible/Forgotten presentation không được tự biến thành:
- damage immunity;
- geometry removal;
- non-occupancy.

Animation/VFX không quyết định timing kernel nếu Contract không nói vậy.

## 4.12 Authority Tier ≠ Axiom Identity

**Status: `RECOVERED_LOCK`**

Một character liên quan Axiom không làm mọi ability của nó tự động thành Axiom authority.

Một effect có thể có:
- Axiom identity/system interaction;
- nhưng authority riêng.

## 4.13 Composite Action cần authority policy riêng

**Status: `RECOVERED_LOCK` ở cấp kiến trúc**

Không tồn tại một global rule đơn giản:
> “outer action luôn truyền authority cho child”
hoặc
> “outer action không bao giờ truyền authority”.

Hai character file đã cần hai behavior khác nhau.

Do đó Schema/Contract phải cho phép khai báo **authority inheritance policy per composite**.

## 4.14 Natural Action ≠ Follow-up/Counter/Reaction/Forced Action

**Status: `RECOVERED_LOCK`**

Các action behavior ngoài Natural Action phải có identity riêng và không mặc định:
- advance SSI;
- giảm CD theo Natural Action;
- tạo AE/Rage như Natural Action;
- count vào “Basic Natural Action”.

## 4.15 Multihit ≠ nhiều Natural Actions

**Status: `RECOVERED_LOCK`**

Một Action chứa nhiều Damage Packet vẫn có thể chỉ là một Natural Action.

---

# 5. CONFLICT REGISTER — MÂU THUẪN / ĐIỂM KHÔNG ĐƯỢC ÂM THẦM HỢP NHẤT

# C-001 — Ability Type bị dùng làm Functional Tag trong `tag.md`

### Source A
`tag.md` có:
- PASSIVE
- SKILL
- ULTIMATE
- BASIC_ATTACK

như Tag.

### Source B
`tag_v0.2_silas.md` nói rõ:
> các concept này là Ability Type trong Ability Schema, không phải Canonical Functional Tag.

### Recovery outcome
**`SUPERSEDED`**

Không mang 4 entry này sang `TAG vNext`.

`BASIC_ATTACK` vẫn tồn tại như:
- enum/value của Ability Type;
- Action Identity khi action thực sự là Basic Attack.

Chỉ không tồn tại như Functional Tag để lặp thông tin.

---

# C-002 — Tag Registry giữ nhiều concept trùng layer với Schema Field

### Vấn đề
`tag_v0.2_silas.md` đồng thời nói:

> không tạo Tag chỉ vì Schema field đã có cùng semantic

nhưng vẫn giữ:
- TARGET_SELF
- TARGET_ALLY
- TARGET_ENEMY
- TARGET_AOE
- TARGET_SELECTION
- AOE_FIXED
- AOE_RANDOM
- FORCED_ACTION
- FOLLOW_UP
- COUNTER
- REACTION
- AUTO_TRIGGER
- THRESHOLD_TRIGGER
- DAMAGE_TRIGGER
- ACTION_COUNTER

Trong khi nhiều cái trong số này rõ ràng cũng là:
- Target Scope;
- Target Selection Rule;
- Action Behavior;
- Trigger configuration;
- Counter state.

### Recovery outcome
**`LAYER_REVIEW`**

Không xóa chúng ngay.

Chặng C phải trả lời cho từng concept:

> Engine có cần query semantic capability này độc lập với Schema field hay không?

Nếu **không**:
> chỉ giữ ở Schema/Contract.

Nếu **có**:
> Tag có thể tồn tại như queryable semantic, nhưng phải chứng minh use-case.

---

# C-003 — Revive nằm trước hay sau DEATH_CONFIRMED?

### Legacy wording A
`terminology.md` mô tả HP_ZERO chưa phải death nếu còn “Death Prevention/Revive có quyền can thiệp”.

### Legacy wording B
`Luan_Hoi_Chi_Chu...` có câu:
> Death Prevention/Revive thông thường có thể xử lý trước DEATH_CONFIRMED.

### Wording C
`tag_v0.2_silas.md` định nghĩa:
> REVIVE đưa actor **đã chết** trở lại life/combat state và phân biệt với Death Prevention.

### Wording D
`Hoa_Than_Ky_Uc...`:
> khi DEATH_CONFIRMED thì passive mở cửa sổ revive.

### Recovery outcome
**Legacy pre-confirmation Revive wording = `SUPERSEDED / MUST PATCH`.**

Canonical direction hiện tại:

`ALIVE`
→ `HP_ZERO`
→ `DEATH_PREVENTION`
→ `DEATH_PREVENTED` hoặc `DEATH_CONFIRMED`
→ sau confirmed death mới có `REVIVE` nếu được phép.

Nếu một mechanic cứu ở HP_ZERO trước confirmed death:
> đó là Death Prevention / death replacement, không nên gọi là ordinary Revive.

### Chú ý
Có thể sau này tồn tại một effect có tên lore “hồi sinh” nhưng semantics thực tế là Death Prevention. Kernel phải theo semantic, không theo tên lore.

---

# C-004 — `lifeSerial` và Revive

### Global terminology
`lifeSerial`:
> Reincarnation có thể tạo lifeSerial mới; ordinary Revive không mặc định tạo mới.

### Ký Ức Chi Chủ
File character ghi:
> trueSelfId giữ nguyên, lifeSerial tăng khi revive.

### Recovery outcome
**Không phải global contradiction bắt buộc.**

Đây có thể là:
- global default;
- character-specific revive contract override.

Do đó `lifeSerial` phải được thiết kế sao cho:
- global revive không mặc định tăng;
- một kit có thể yêu cầu tăng.

### Status
`UNRESOLVED` ở Contract global.
`STRONG_CANDIDATE` cho Ký Ức Chi Chủ riêng nếu user không phủ định.

Không biến rule riêng của Ký Ức thành rule cho mọi Revive.

---

# C-005 — `Damage Source` đang gộp quá nhiều semantic

### Legacy terminology
`Damage Source` được mô tả theo hướng:
> Ability/Effect/Actor chịu attribution cho Damage Packet.

Điều này trộn:
- immediate source;
- behavior provider;
- semantic effect owner;
- damage credit.

### Stress test
Pygmalion cần:
- Puppet dùng inherited Combat Definition để chạy behavior;
- Ultimate của Pygmalion tạo follow-up;
- damage vẫn có thể attribute cho Pygmalion.

### Recovery outcome
`Damage Source` legacy **không đủ**.

`TERMINOLOGY vNext` cần tách tối thiểu:

- Caster.
- Owner.
- Source.
- Behavior Source.
- Effect Source.
- Effect Attribution.
- Damage Source.
- Damage Attribution.
- Kill Attribution.
- Trigger Cause.

### Status
`RECOVERED_LOCK` cho **việc phải tách attribution layers**.
Tên field cuối cùng vẫn có thể chỉnh.

---

# C-006 — HP Loss hay Self HP Cost ở SSR Warrior?

### File Warrior
Mục heading:
> “HP Loss / Self HP Cost mỗi Turn”

và mô tả:
> sau Action mất 1% Max HP, +4 Rage, xảy ra mỗi Turn.

### Terminology
`SELF_HP_COST` =
> HP Loss do chính Ability/Action dùng làm **cost**.

### Tag v0.2
`SELF_HP_COST`:
> là cost; **Does Not Include: HP Loss không phải cost**.

### Vấn đề
Nếu 1% HP sau Action xảy ra tự động như hậu quả/passive pressure, nó chưa chắc là “cost”.

### Recovery outcome
**`UNRESOLVED SEMANTIC CLASSIFICATION`**

Không gắn `SELF_HP_COST` cho mechanic này chỉ vì legacy heading có cụm đó.

Cần hỏi/chuẩn hóa:
> 1% HP là giá phải trả để Action hợp lệ/nhận +4 Rage, hay là post-action HP Loss bắt buộc?

Nếu:
- payment để kích hoạt → `SELF_HP_COST`.
- hậu quả tự động, không phải payment → `HP_LOSS` semantic, có thể cần Tag riêng nếu queryable.

Điều này rất quan trọng vì:
- cost validation;
- “cannot pay cost” behavior;
- death behavior;
- trigger behavior;
- refund/cancel;
khác nhau.

---

# C-007 — Turn Boundary chưa có exact runtime point thống nhất

### Terminology
Turn Boundary là mốc dùng cho duration/periodic/state transition.

### Warrior
Turn Boundary được diễn giải như ranh giới giữa hai Turn của **chính actor**, và reset cap khi actor tới chu kỳ Turn tiếp theo.

### Các kit khác
Có mô tả:
- “1 Turn Boundary của caster”.
- “Turn Boundary của Leader”.
- Natural Action progression + Boundary commit.
- slot-death timers.

### Recovery outcome
Concept **Turn Boundary tồn tại thật**:
`RECOVERED_LOCK`

Nhưng exact event model:
`UNRESOLVED`

Cần Contract tách rõ ít nhất:
- `NATURAL_ACTION_BEGIN`
- `NATURAL_ACTION_COMMIT/COMPLETE`
- `ACTOR_TURN_BOUNDARY`
- có Boundary khi actor bị CC mất action hay không;
- có Boundary khi actor dead/absent hay không;
- boundary gắn với actor, slot, side pointer hay mode clock.

Không được dùng chữ “turn” chung chung để thay các clock này.

---

# C-008 — Composite Ultimate truyền Authority khác nhau theo character

### SSR Warrior
Ultimate Pháp Tắc:
> khi Skill 1/2 được cast qua Ultimate, xung đột dùng Authority Pháp Tắc của Ultimate.

### Luân Hồi Chi Chủ
Ultimate composite:
> Skill 1/3 giữ authority riêng; outer Ultimate không nâng authority của chúng.

### Recovery outcome
Không phải mâu thuẫn character design.

Nó là bằng chứng rằng:
> **Authority inheritance là một field/policy của composite action.**

Có thể cần schema kiểu:

`authorityPolicy = INHERIT_OUTER`
hoặc
`authorityPolicy = PRESERVE_CHILD`
hoặc policy chi tiết hơn theo effect.

Tên enum chưa canonical.

---

# C-009 — `DAMAGE_REDUCTION` vs `FINAL_DAMAGE_REDUCTION`

### Tag v0.2
Giữ hai Tag vì phase khác nhau.

Chính file cũng ghi:
> nếu Damage Contract sau này quy chúng về cùng phase, phải hợp nhất.

### Recovery outcome
`DAMAGE_REDUCTION` = `STRONG_CANDIDATE`

`FINAL_DAMAGE_REDUCTION` = `UNRESOLVED / CONTRACT-DEPENDENT`

Không khóa hai Tag trước khi Damage Contract định nghĩa pipeline phase.

Nếu final reduction có observer/query semantics thật sự riêng:
> giữ.

Nếu chỉ là parameter `phase=FINAL` của cùng primitive:
> có thể không cần Tag riêng.

---

# C-010 — `AOE_RANDOM` có thể đang đặt sai tên/layer

### Current definition
“Random AOE” thực tế mô tả:
> chọn nhiều target random thay vì geometry cố định.

### Vấn đề
Đây không nhất thiết là “Area of Effect” theo nghĩa geometry.

Ví dụ:
> chọn random 3 enemy khác nhau

là multi-target random selection, không nhất thiết có area.

### Recovery outcome
`LAYER_REVIEW`

Có ba hướng:
1. giữ `AOE_RANDOM` vì project dùng AOE theo nghĩa multi-target;
2. đổi semantic thành `RANDOM_MULTI_TARGET`;
3. bỏ Tag, biểu diễn bằng `TargetSelectionRule=random + count`.

Không quyết định trong Chặng A.

---

# C-011 — `REACTION` là Tag hay Trigger/Action field?

### Terminology
Reaction = Ability/Effect kích hoạt bởi Event.

### Tag v0.2
Reaction cũng là Functional Tag.

### Governance
Trigger/Action Behavior là Schema fields và Tag không nên lặp field nếu không cần query.

### Recovery outcome
`LAYER_REVIEW`

Reaction concept chắc chắn phải tồn tại.
Chưa chốt:
> nó có cần tồn tại thêm dưới dạng Tag hay chỉ là `trigger.mode/eventDriven` / `actionBehavior`.

---

# C-012 — Target Scope có cần Tag?

Các semantic:
- TARGET_SELF
- TARGET_ALLY
- TARGET_ENEMY

là thật.

Nhưng `TargetScope` đã tồn tại như Terminology/Schema concept.

### Recovery outcome
`LAYER_REVIEW`

Nếu Story/AI/other kits cần query:
> “ability có khả năng target ally không?”
mà không muốn parse target schema, Tag có thể hữu ích.

Nếu engine đã query TargetSpec trực tiếp:
> các Tag này có thể dư thừa.

Không giữ chỉ vì legacy đã có.

---

# C-013 — Trigger tags có cần tồn tại song song TriggerSpec?

Các Tag:
- AUTO_TRIGGER
- THRESHOLD_TRIGGER
- DAMAGE_TRIGGER
- ACTION_COUNTER

đều có semantic thật.

Nhưng có thể biểu diễn trực tiếp bằng:
- TriggerSpec.event
- Condition
- CounterSpec
- ThresholdSpec
- Frequency/Cap.

### Recovery outcome
`LAYER_REVIEW`

Chặng C phải dùng **queryability test**:
> Có mechanic nào cần tìm “mọi ability có DAMAGE_TRIGGER” như một capability, hay chỉ cần runtime đọc TriggerSpec?

---

# C-014 — Narrative Capability Tags không đồng nghĩa mọi Narrative term là Tag

`Cố Sự Chi Thần` cần capability query.

Ví dụ file dùng các ví dụ:
- TRUE_DAMAGE.
- XOA_DEBUFF.
- CURSE_RESISTANCE.
- GODSLAYER.
- UNFAILING.
- UNBREAKABLE.

### Recovery outcome
Không được tự động thêm toàn bộ ví dụ đó vào Tag Registry.

Phải tách:

1. Existing Functional Capability.
2. Story Requirement.
3. Narrative Claim/Property.
4. Narrative state.

Ví dụ:
`TRUE_DAMAGE`
có thể là capability đã có.

Nhưng:
`UNBREAKABLE`
có thể chỉ là `RealizedProperty` của Story, không nhất thiết là global Functional Tag.

### Status
Narrative subsystem = `STRONG_CANDIDATE / REQUIRED STRESS TEST`.
Từng Tag narrative = `UNRESOLVED`.

---

# C-015 — `UNIQUENESS` vừa là Axiom identity vừa là Tag interaction

### Terminology
Duy Nhất = Axiom/identity rule.

### Tag
UNIQUENESS = ability/effect tương tác trực tiếp với system Duy Nhất.

### Luân Hồi Chi Chủ
Có câu:
> nếu definition có tag Duy Nhất thì kiểm tra Duy Nhất trước materialize.

### Vấn đề
Có thể đang dùng cùng từ “tag” cho hai thứ:
- metadata/Axiom identity của Definition;
- Functional system-interaction tag của Effect.

### Recovery outcome
`LAYER_REVIEW`

`TERMINOLOGY vNext` phải tách:
- `AxiomIdentity.UNIQUENESS` hoặc equivalent metadata;
- Functional Tag `UNIQUENESS` chỉ khi effect **thực sự thao túng/query** Duy Nhất.

Không được hiểu:
> “character có Axiom Duy Nhất”
= mọi ability mang Functional Tag UNIQUENESS.

---

# C-016 — `DIVINE_NATURE` có cùng vấn đề identity-vs-interaction

Thần Tính là Axiom identity/protection.

Functional Tag `DIVINE_NATURE` chỉ hợp lý nếu:
- ability/effect grant,
- remove,
- query,
- bypass,
- mutate,
- hoặc trực tiếp tương tác Thần Tính.

Không gắn Tag này lên mọi skill của Prime chỉ vì character có Thần Tính.

### Status
`RECOVERED_LOCK` cho distinction.
Tag placement cụ thể = `LAYER_REVIEW`.

---

# C-017 — Combat Object / Container ≠ Summon

Luân Hồi Chi Chủ:
> Kén là combat object/container, không phải Chân Ngã mới.

Cố Sự Chi Thần:
> Vật Chứa không đồng nghĩa summon/object đứng slot; có deployed/wielded/equipped/event forms.

### Recovery outcome
Kernel object model cần rộng hơn `Actor + Summon`.

Ít nhất phải phân biệt:
- Combat Unit.
- Summon Unit.
- Combat Object.
- Container.
- Field.
- Attached/Bound object.
- Phenomenon/System instance.

### Status
`STRONG_CANDIDATE`

Không ép mọi persistent entity vào `SUMMON`.

---

# 6. TAG RECOVERY MATRIX

Mục này **không phải TAG vNext**.  
Nó chỉ phân loại Tag legacy để Chặng C biết xử lý.

## 6.1 Nhóm A — semantic effect/system tương đối vững

### `DAMAGE`
Status: `STRONG_CANDIDATE → likely keep`

Lý do:
- effect identity queryable;
- không thể thay chỉ bằng numeric damage parameter;
- nhiều system cần đọc “đây có phải Damage không?”.

### `HEAL`
Status: `STRONG_CANDIDATE → likely keep`

### `SHIELD`
Status: `STRONG_CANDIDATE → likely keep`

### `BUFF`
Status: `STRONG_CANDIDATE → likely keep`

### `DEBUFF`
Status: `STRONG_CANDIDATE → likely keep`

### `MARK`
Status: `STRONG_CANDIDATE → likely keep`

### `DEBUFF_CLEANSE`
Status: `STRONG_CANDIDATE → likely keep`

Đây là ví dụ tốt cho “một semantic một tag”:
không thêm PURIFY/CLEANSE/REMOVE_DEBUFF nếu cùng boundary.

### `STAT_MODIFIER`
Status: `STRONG_CANDIDATE`

Cần xem lại nomenclature với `STAT_MUTATION`, nhưng semantic “modifies stat” có giá trị query.

### `RESOURCE_MODIFIER`
Status: `STRONG_CANDIDATE`

Không gắn chỉ vì ability có Cost.

### `POSITION_MUTATION`
Status: `STRONG_CANDIDATE`

### `FIELD`
Status: `STRONG_CANDIDATE`

### `TRUE_DAMAGE`
Status: `STRONG_CANDIDATE`

### `PHYSICAL_DAMAGE`
Status: `STRONG_CANDIDATE`

### `WILL_DAMAGE`
Status: `STRONG_CANDIDATE`

### `PENETRATION`
Status: `STRONG_CANDIDATE`

### `DAMAGE_REDUCTION`
Status: `STRONG_CANDIDATE`

### `DEATH_PREVENTION`
Status: `STRONG_CANDIDATE`

### `REVIVE`
Status: `STRONG_CANDIDATE`

Definition phải patch để nhất quán:
> ordinary Revive xảy ra sau DEATH_CONFIRMED, không phải pre-death save.

### `REINCARNATION`
Status: `STRONG_CANDIDATE`

### `IMMUNITY`
Status: `STRONG_CANDIDATE`

Scope phải là Parameter/Contract, không tự động global immunity.

### `TARGET_EXCLUSION`
Status: `STRONG_CANDIDATE`

Ký Ức Chi Chủ chứng minh đây là semantic khác Damage Immunity/Area Exclusion.

### `SUMMON`
Status: `STRONG_CANDIDATE`

Chỉ dùng khi thực sự tạo Summon actor/unit.

### `ARENA`
Status: `STRONG_CANDIDATE`

System-interaction semantic rõ ràng.

### `AIRBORNE`
Status: `STRONG_CANDIDATE`

Có giá trị vì kits có thể query:
> “khi enemy **vào trạng thái Airborne**”.

Không thể thay hoàn toàn bằng generic `POSITION_MUTATION`.

### `POSITION_MARK`
Status: `STRONG_CANDIDATE`

Semantic khác `MARK` vì owner object là Position/Slot thay vì Actor.

### `SELF_HP_COST`
Status: `STRONG_CANDIDATE`, **nhưng chỉ cho payment semantics**.

Không dùng để bắt mọi non-damage self HP loss.

---

## 6.2 Nhóm B — giữ concept nhưng phải audit layer trước khi giữ Tag

- `FORCED_ACTION`
- `FOLLOW_UP`
- `COUNTER`
- `REACTION`
- `TARGET_SELF`
- `TARGET_ALLY`
- `TARGET_ENEMY`
- `TARGET_AOE`
- `AOE_FIXED`
- `AOE_RANDOM`
- `TARGET_SELECTION`
- `AUTO_TRIGGER`
- `THRESHOLD_TRIGGER`
- `DAMAGE_TRIGGER`
- `ACTION_COUNTER`
- `FINAL_DAMAGE_REDUCTION`
- `UNIQUENESS`
- `DIVINE_NATURE`

Status chung:
`LAYER_REVIEW`

Không được xóa semantics.  
Không được mặc định giữ dưới dạng Functional Tag.

---

## 6.3 Nhóm C — không mang sang Functional Tag Registry

- `PASSIVE`
- `BASIC_ATTACK`
- `SKILL`
- `ULTIMATE`

Status:
`SUPERSEDED AS FUNCTIONAL TAG`

Vẫn tồn tại ở:
- Ability Type.
- Action Identity khi phù hợp.

---

## 6.4 Candidate từ conversation nhưng chưa được recovered trong registry gửi lên

### `EXECUTE`
Status:
`NOT YET RECOVERED FROM PROVIDED TAG REGISTRY`

Có lý do semantic tốt nếu Execute là:
> conditional lethal resolution khác damage amp/true damage/threshold trigger.

Nhưng Chặng A **không thêm**.

Chặng C phải chứng minh:
- queryability;
- exact lifecycle semantics;
- khác `DEATH_PREVENTION`, `DAMAGE`, `THRESHOLD_TRIGGER`.

### `DEATH_TRIGGER`
Status:
`NOT YET RECOVERED FROM PROVIDED TAG REGISTRY`

Concept “trigger quan sát DEATH_CONFIRMED” có semantic rõ.

Nhưng cần quyết định:
- chỉ là TriggerSpec `event=DEATH_CONFIRMED`;
- hay cần Functional Tag để query capability.

Không tự thêm ở Chặng A.

---

# 7. TERMINOLOGY RECOVERY MATRIX

## 7.1 Nhóm nên giữ làm nền trong `TERMINOLOGY vNext`

Các concept sau có semantic boundary đủ rõ:

- Character.
- Character Instance.
- Identity.
- True Self / Chân Ngã.
- trueSelfId.
- lifeSerial.
- Presentation Definition.
- Combat Definition.
- Combat Instance.
- Ability.
- Ability Type.
- Action.
- Natural Action.
- Action Completion.
- Action Snapshot.
- Action Identity.
- Action Behavior.
- Composite Action.
- Multihit.
- Follow-up.
- Counter.
- Forced Action.
- Event.
- Trigger.
- Reaction.
- Cooldown.
- Trigger Frequency.
- Trigger Cap.
- Target.
- Target Selection.
- Candidate Pool.
- Target Resolution.
- Target Scope.
- Target Filter.
- Target Selection Rule.
- Geometry.
- Position.
- Position Mutation.
- Field.
- Main Battle.
- Arena.
- Isolated Combat Instance.
- Damage Action.
- Damage Packet.
- Damage Profile.
- Actual HP Damage.
- Overkill.
- True Damage.
- Physical Damage.
- Will Damage.
- Damage Reduction.
- Penetration.
- Heal.
- Overheal.
- HP Loss.
- Self HP Cost.
- Shield.
- Buff.
- Debuff.
- Mark.
- Modifier.
- Max HP Mutation.
- Snapshot.
- Stat Snapshot.
- Persistent State.
- Temporary State.
- HP_ZERO.
- Death Prevention.
- DEATH_CONFIRMED.
- Revive.
- Revive Pending.
- Temporarily Absent.
- Waiting Window.
- Reincarnation.
- Reincarnation Exhausted.
- Return.
- Authority.
- Pháp Tắc.
- Quy Tắc.
- Axiom.
- Authority Conflict.
- Explicit Exception.
- Divine Nature.
- Uniqueness.
- AE.
- Rage.
- Resource Pool.
- Cost.
- Gain.
- Stat.
- Base Stat.
- Current Stat.
- Derived Stat.
- Rank Multiplier.
- Current Max HP.
- Element.
- Effective Element.
- Class.
- Rank.
- Tag.
- Canonical Tag.
- Functional Tag.
- Primitive.
- Parameter.
- Ability Schema.
- Presentation.
- VFX.
- Resolution Order.
- Commit.
- Cleanup.

Các definition vẫn có thể cần wording patch, nhưng concept không nên bị vứt.

---

## 7.2 Các concept cần bổ sung vào `TERMINOLOGY vNext`

### Source / attribution family

- Caster.
- Owner.
- Source.
- Behavior Source.
- Effect Source.
- Damage Source.
- Effect Attribution.
- Damage Attribution.
- Kill Attribution.
- Trigger Cause.

Lý do:
Pygmalion/inheritance/follow-up khiến một `source` duy nhất không đủ.

### Side relationship family

- Side.
- Ally.
- Enemy.

Không để “ally/enemy” thành immutable character property.

### Lifecycle/object family

- Runtime Entity.
- Combat Unit.
- Combat Object.
- Container.
- Lifecycle.
- Life Cycle.
- Lifecycle Quota.
- Materialize.
- Despawned.
- Removed.
- Fusion Consumed.
- Erased.

### Snapshot family

- Source Snapshot.
- Target Snapshot.
- Entrance Snapshot.
- Shared Snapshot.
- Regression.

### Pygmalion stress-test family

- Combat Definition Inheritance.
- Puppet.
- Empty Puppet.
- Inhabited Puppet.
- Puppet Stat Basis.

### Mode-profile family

- Mode Profile.
- turn-based profile.
- exploration/defense profile.

---

# 8. PATCHES BẮT BUỘC CHO TERMINOLOGY vNext

## T-PATCH-001 — HP_ZERO wording

Không dùng:
> “Death Prevention/Revive có quyền can thiệp trước death”

nếu “Revive” là ordinary Revive.

Nên phân:
- pre-confirmation → Death Prevention/death replacement;
- post-confirmation → Revive.

---

## T-PATCH-002 — Damage Source

Không để Damage Source đồng nghĩa attribution.

Cần trường riêng.

---

## T-PATCH-003 — `lifeSerial`

Definition global cần nói rõ:
- một life transition có thể đổi lifeSerial;
- ordinary Revive default phải theo Contract;
- character-specific rule có thể override.

Không hardcode Ký Ức Chi Chủ thành global default.

---

## T-PATCH-004 — Self HP Cost

Definition phải nhấn mạnh:
> payment semantics.

Nếu HP tự mất như periodic/post-action consequence:
> đó không mặc định là Cost.

---

## T-PATCH-005 — Turn Boundary

Terminology chỉ định nghĩa khái niệm.
Exact ordering phải chuyển sang Contract.

---

## T-PATCH-006 — Axiom Identity / Authority

Tách rõ metadata “belongs/interacts with Axiom” và `authorityTier`.

---

## T-PATCH-007 — Duy Nhất / Thần Tính

Không dùng Functional Tag để thay thế Axiom Identity.

---

# 9. RECOVERED REQUIREMENTS CHO `PRIMITIVE.md`

Đây **không phải danh sách Primitive canonical cuối cùng**.

Nó là requirement map rút ra từ stress tests.

Primitive layer phải đủ để biểu diễn ít nhất:

## 9.1 Action / execution

- validate action.
- create child/internal action.
- schedule follow-up.
- schedule counter.
- schedule forced action.
- emit reaction.
- sequential execution.
- simultaneous batch execution.
- action completion.

## 9.2 Snapshot

- capture source state.
- capture target set.
- capture stat snapshot.
- shared snapshot.
- entrance snapshot.
- read historical snapshot.
- regression/restore selected state.

## 9.3 Target

- build candidate pool.
- filter target.
- select by rule.
- random deterministic select.
- fixed geometry resolution.
- lock target IDs.
- re-query target.
- exclude direct targeting without removing geometry occupancy.

## 9.4 Damage

- build Damage Packet.
- resolve typed component.
- Physical mitigation.
- Will mitigation.
- True Damage.
- penetration.
- Shield interaction.
- generic reduction.
- final-phase reduction if retained.
- commit HP damage.
- compute Actual HP Damage.
- compute Overkill.
- aggregate by Damage Action.
- echo/copy damage quantity without copying secondary effects.
- reflection with recursion guard.

## 9.5 HP / heal

- apply Heal.
- compute Overheal.
- consume HP Cost.
- apply non-damage HP Loss.
- apply Self Damage as Damage.
- Max HP Mutation.
- reconcile Current HP after Max HP mutation.

## 9.6 Status/state

- create Buff.
- create Debuff.
- create Mark.
- create Position Mark.
- remove Debuff.
- remove state.
- immunity check.
- status identity matching.
- target exclusion state.
- Airborne state/transition.
- duration/cap/counter state.

## 9.7 Resource

- validate Cost.
- consume AE.
- consume Rage.
- gain AE.
- gain Rage.
- resource modification.
- shared-pool ownership.

## 9.8 Death / life

- detect HP_ZERO.
- evaluate Death Prevention.
- confirm death.
- emit DEATH_CONFIRMED.
- assign kill attribution.
- create Revive Pending.
- materialize Revive.
- enter waiting window.
- decrement/advance waiting rule.
- enter Reincarnation.
- route Reincarnation.
- mark reincarnation exhausted.
- remove/despawn/erase as distinct operations.

## 9.9 Identity / inheritance

- preserve trueSelfId.
- increment/set lifeSerial by contract.
- swap/attach Presentation Definition.
- inherit Combat Definition.
- inherit selected stat lineage.
- preserve host stat basis.
- check Uniqueness before materialization.
- lifecycle quota consumption.

## 9.10 Combat Instance

- create isolated combat instance.
- transfer actor into instance.
- detach from Main Battle.
- return actor.
- cleanup child instance.
- resolve death under shared World Axiom where applicable.

## 9.11 Narrative subsystem

Do **not** model toàn bộ Narrative bằng một primitive khổng lồ `DO_STORY`.

Cần các operation/subsystem interfaces đủ để:

- create Story Instance.
- bind Container/Bearer.
- query Capability.
- register Witness.
- update Causal Belief.
- register Proof Event.
- register Counter-Proof.
- update Stability.
- Realize Property.
- transfer/absorb Property.
- return Container.
- propagate Knowledge.

Tên primitive cuối cùng chưa chốt.

---

# 10. RECOVERED REQUIREMENTS CHO `ABILITY_SCHEMA.md`

Schema phải đủ biểu đạt một kit mà không cần custom behavior per character.

Ít nhất cần các family field:

## Identity
- abilityId.
- abilityType.
- actionIdentity.

## Trigger
- trigger mode.
- event.
- condition.
- threshold.
- counter.
- frequency/cap.
- cooldown clock.

## Prerequisite
- alive/on-field/absent state.
- resource availability.
- rank/class/authority constraint.
- target existence.
- system eligibility.

## Cost
- AE.
- Rage.
- HP Cost.
- other pools.
- waive/refund policy.
- cost timing.

## Target
- scope.
- candidate pool.
- filter.
- selection rule.
- count.
- geometry.
- duplicate policy.
- reroll policy.
- snapshot/re-query policy.

## Action behavior
- Natural Action or non-natural.
- Follow-up/Counter/Forced/Reaction behavior.
- parent action.
- child action.
- pointer/turn consumption rule.

## Resolution
- simultaneous/sequential.
- internal order.
- snapshot moment.
- commit boundary.
- recursion guard.

## Effects
- primitive/effect specs.
- parameters.
- duration.
- state identity.
- damage profile.
- resource changes.
- lifecycle mutation.

## Authority
- effect authority.
- outer action authority.
- child authority inheritance policy.
- explicit exception.

## Attribution
- caster.
- owner.
- behavior source.
- effect source.
- damage attribution.
- kill attribution override if any.

## Tags
Only Canonical Tags after Tag Registry is actually stabilized.

## Presentation
Reference only.
Gameplay runtime must not depend on VFX timing unless explicitly bound.

---

# 11. RECOVERED REQUIREMENTS CHO `CONTRACTS.md`

Các file stress test chứng minh Primitive một mình không đủ.

Contract layer phải chốt:

## Action Contract
- action begin.
- snapshot.
- target.
- effect execution.
- commit.
- reaction.
- death.
- completion.

## SSI Contract
- Natural Action ownership.
- side pointers.
- empty slot skip.
- CC lost-turn behavior.
- summon insertion.
- pointer advancement.
- non-natural action handling.

## Snapshot Contract
- source snapshot.
- target snapshot.
- same-action batch.
- sequential re-query.
- historical snapshot/regression.

## Damage Contract
- component order.
- ARM/RES.
- penetration.
- reduction phases.
- Shield.
- True Damage.
- Actual HP Damage.
- Overkill.
- reflect.
- lifesteal.

## HP Cost / HP Loss Contract
- payment validation.
- lethal/nonlethal.
- shield bypass.
- damage-event exclusion.
- cancel/refund.

## Healing / Overheal Contract
- Current HP commit.
- Overheal computation.
- conversion observer timing.

## Max HP Mutation Contract
- increase/decrease.
- expiry.
- Current HP reconciliation.
- “return Max HP” vs artificial healing.

## Trigger Contract
- enqueue order.
- action-level aggregation.
- cap consumption.
- failed-cost trigger.
- recursion prevention.

## Death Contract
- HP_ZERO.
- Death Prevention.
- DEATH_PREVENTED.
- DEATH_CONFIRMED.
- kill attribution.
- cleanup.

## Revive Contract
- eligibility.
- pending state.
- lifeSerial policy.
- stat/state restoration.
- materialization timing.

## Reincarnation Contract
- waiting window clock.
- True Self routing.
- exhausted state.
- destination eligibility.
- block/override.

## Authority Contract
- hierarchy.
- same-tier conflict.
- outer/child inheritance.
- explicit exception.
- dynamic authority.

## Combat Instance Contract
- Main Battle ↔ Arena.
- ownership of objects.
- transfer.
- cleanup.
- shared World Axiom observers.

## Narrative Contract
- Witness eligibility.
- Belief.
- Proof.
- Counter-Proof.
- Stability.
- Realization.
- property transfer.

---

# 12. RECOVERED REQUIREMENTS CHO KERNEL

Kernel không nên là “một đống switch theo characterId”.

Canonical runtime direction:

1. Nhận Action Intent / Trigger activation.
2. Validate state và cost prerequisites.
3. Capture required snapshot.
4. Resolve candidate pool / target selection.
5. Tạo execution plan từ data composition.
6. Thực thi Primitive theo Contract.
7. Commit state deltas.
8. Emit Events.
9. Enqueue/resolve Trigger/Reaction.
10. Xử lý HP_ZERO.
11. Xử lý Death Prevention.
12. Emit DEATH_CONFIRMED nếu death thắng.
13. Attribution / kill / lifecycle observers.
14. Revive/Reincarnation/Removal nếu được schedule.
15. Action Completion.
16. Mode-specific clock/pointer advancement.
17. Snapshot/history systems như Quang Ảnh Chi Hà.
18. deterministic queue drain.

## Kernel trace là requirement

Mỗi resolution phức tạp cần inspect được:

- action instance id.
- parent/child action.
- caster.
- owner.
- behavior source.
- effect source.
- damage attribution.
- targets before/after filter.
- RNG choice.
- snapshot id.
- primitive sequence.
- damage packets.
- Actual HP Damage.
- resource deltas.
- state transitions.
- authority checks.
- trigger causes.
- death transitions.
- cleanup.

Nếu không có trace:
> debug các kit như Ký Ức / Luân Hồi / Pygmalion / Cố Sự sẽ rất khó.

---

# 13. STRESS-TEST CORPUS ĐƯỢC RECOVERED

Không nên thiết kế Primitive chỉ từ các kit dễ.

## ST-01 — SSR Warrior True Damage / Overheal
Phải chứng minh:
- Mixed profile.
- True Damage.
- damage-profile reuse ≠ Basic Attack identity.
- Max HP Mutation.
- HP Loss vs Cost.
- Overheal.
- action cap.
- sequential composite.
- authority override.

## ST-02 — Hoá Thân Ký Ức Chi Chủ
Phải chứng minh:
- death snapshot.
- per-character revive policy.
- Target Selection exclusion ≠ Area Resolution.
- action-level Actual HP Damage aggregation.
- echo without secondary effects.
- recursion guard.
- Natural Action sequence counter.
- perception/presentation decoupling.

## ST-03 — Luân Hồi Chi Chủ
Phải chứng minh:
- True Self.
- lifeSerial.
- Presentation ≠ Combat Definition.
- Reincarnation materialization.
- Combat Object.
- temporary absence.
- inherited stat stages.
- Max HP decay.
- Uniqueness.
- isolated Combat Instance.
- per-child authority.

## ST-04 — Cố Sự Chi Thần
Phải chứng minh:
- capability query.
- persistent subsystem state.
- object/container modes.
- Witness dynamic set.
- Proof/Counter-Proof.
- causal belief.
- delayed knowledge.
- property realization.
- property transfer/return.
- distinction Tag capability vs Narrative property.

## ST-05 — Pygmalion
Không nằm trong các file legacy gửi ở đây nhưng là stress test bắt buộc từ rule hiện tại.

**LOCKED current correction:**
- mỗi Pygmalion Life Cycle tạo một Puppet mới;
- Puppet cũ không biến mất chỉ vì Pygmalion sang Life Cycle mới;
- nhiều Puppet có thể cùng tồn tại;
- nhiều Puppet có thể cùng chứa các Chân Ngã khác nhau.

Architecture phải chịu được:
- lifecycle quota ≠ singleton;
- combat definition inheritance;
- host stat basis;
- True Self routing;
- Behavior Source ≠ Damage Attribution.

---

# 14. MODE PROFILE — KHÔNG ĐỂ TURN-BASED KERNEL NUỐT MỌI MODE

Mode mới Exploration/Defense đang được thiết kế có rule khác.

Current direction:

- không SSI.
- không Luân Hồi.
- roster character dùng combat profile đơn giản hơn.
- vẫn có Rage.
- action có thể gain AE.
- có movement speed / attack speed / weight.
- room spatial combat.
- Base / Resource / Energy / structure / extraction.

### Recovery rule
Không biến:
> “không dùng SSI ở mode mới”
thành
> “xóa SSI khỏi global project terminology”.

Phải có:
- global semantic core;
- mode-specific scheduling/resource/lifecycle profile.

`MODE_PROFILE` là cách để cùng một Character Definition family có data khác theo mode mà không fork toàn project.

---

# 15. NHỮNG THỨ TUYỆT ĐỐI KHÔNG ĐƯỢC CANONICALIZE Ở CHẶNG A

1. Không thêm Tag mới chỉ vì có tên hay.
2. Không tạo Primitive 1:1 theo từng Tag.
3. Không tạo Primitive theo từng character.
4. Không quyết định `REACTION` chắc chắn là Tag.
5. Không quyết định `TARGET_*` chắc chắn là Tag.
6. Không quyết định `AUTO_TRIGGER/DAMAGE_TRIGGER/...` chắc chắn là Tag.
7. Không giữ `FINAL_DAMAGE_REDUCTION` chỉ vì legacy có.
8. Không thêm `EXECUTE` chỉ từ memory/conversation.
9. Không thêm `DEATH_TRIGGER` chỉ từ memory/conversation.
10. Không biến Narrative Properties thành global Tag hàng loạt.
11. Không dùng `DIVINE_NATURE` Functional Tag như đồng nghĩa “Prime character”.
12. Không dùng `UNIQUENESS` Functional Tag như metadata bản thể.
13. Không chốt same-tier Authority resolver.
14. Không chốt Reincarnation waiting-window clock.
15. Không chốt global revive lifeSerial policy.
16. Không chốt Pygmalion Class/Element inheritance.
17. Không dùng model recommendation trong character file như user-confirmed rule nếu source chỉ ghi “khuyến nghị”.
18. Không copy bản `01_TERMINOLOGY.md` reconstruction trước Chặng A rồi gọi nó canonical.
19. Không copy `00_READ_FIRST_ARCLUNE.md` reconstruction rồi coi mọi inference trong đó là source truth.

---

# 16. STATUS CỦA HAI FILE RECONSTRUCTION ĐÃ TẠO TRƯỚC CHẶNG A

## `00_READ_FIRST_ARCLUNE.md`
Status:
`PROVISIONAL HANDOFF / NON-CANONICAL`

Giá trị:
- gom context.
- giúp model mới không mất phương hướng.

Không được dùng để thắng khi xung đột với:
- user correction;
- audit này;
- source legacy có bằng chứng tốt hơn;
- canonical vNext sau này.

## `01_TERMINOLOGY.md`
Status:
`PROVISIONAL RECONSTRUCTION / SUPERSEDED AS NEXT BASE`

Không tiếp tục chỉnh trực tiếp file này.

Chặng B nên:
> lấy `terminology.md` user gửi làm lexical baseline + dùng Audit này làm patch map.

---

# 17. SOURCE PRECEDENCE SAU CHẶNG A

Khi Sol/AI mới đọc project, precedence nên là:

## Tier 0 — User current correction
Lời user sửa trực tiếp mới nhất thắng.

## Tier 1 — Canonical vNext files
Sau khi được audit/chấp nhận:
- Terminology vNext.
- Tag vNext.
- Primitive.
- Ability Schema.
- Contracts.
- Kernel Runtime.

## Tier 2 — `00_CANONICAL_RECOVERY_AUDIT.md`
Dùng để:
- biết nguồn nào legacy;
- biết conflict nào chưa chốt;
- không hồi sinh semantic đã bị supersede.

## Tier 3 — legacy terminology/tag files
Dùng như historical evidence, không tự override vNext.

## Tier 4 — character standardized files
Dùng làm:
- kit-specific contract;
- stress test;
- evidence.

Nhưng câu “khuyến nghị/cần chốt” trong chúng không được biến thành global law.

## Tier 5 — assistant reconstruction / inference
Thấp nhất.

---

# 18. GATE TRƯỚC KHI BẮT ĐẦU CHẶNG B

Chặng A được coi là đạt nếu Chặng B tuân thủ các gate:

### Gate 1
Không copy nguyên `terminology.md`.

### Gate 2
Không copy nguyên `01_TERMINOLOGY.md` reconstruction.

### Gate 3
Phải patch death terminology:
> Revive ≠ Death Prevention.

### Gate 4
Phải thêm attribution/source separation.

### Gate 5
Phải giữ Identity / Presentation / Combat Definition separation.

### Gate 6
Phải giữ Ability Type / Action Identity / Action Behavior / Tag separation.

### Gate 7
Phải giữ Target Selection / Area Resolution separation.

### Gate 8
Phải giữ Damage Packet / Actual HP Damage / Overkill separation.

### Gate 9
Phải giữ HP Loss / Cost / Damage separation.

### Gate 10
Không chốt exact implementation của unresolved clocks trong Terminology.

### Gate 11
Terminology chỉ định nghĩa semantic; không trở thành pseudo-Primitive file.

### Gate 12
Mọi điểm chưa chốt phải ghi `UNRESOLVED`, không “tự hợp lý hóa”.

---

# 19. GATE TRƯỚC KHI BẮT ĐẦU CHẶNG C — TAG vNext

Tag vNext chỉ được làm sau Terminology vNext.

Mỗi candidate Tag phải qua 5 câu hỏi:

## Q1 — Semantic distinctness
Nó có semantic boundary riêng thật không?

## Q2 — Queryability
Có hệ thống/kit nào cần query:
> “object này có capability X không?”
hay chỉ runtime đọc Schema field?

## Q3 — Parameter test
Nó có chỉ là một value/threshold/duration/method parameter không?

Nếu có:
> không Tag.

## Q4 — Layer test
Nó thực ra là:
- Ability Type?
- Action Behavior?
- TargetSpec?
- TriggerSpec?
- State?
- Authority?
- Primitive?
- Presentation?

Nếu có:
> chỉ giữ Tag nếu queryability thực sự cần.

## Q5 — Duplicate test
Có Tag hiện tại cùng Definition + Semantic Boundary không?

Nếu có:
> reuse.

---

# 20. GATE TRƯỚC KHI TẠO `PRIMITIVE.md`

Không tạo Primitive cho mọi noun.

Một candidate Primitive chỉ nên tồn tại nếu trả lời được:

> “Kernel cần một operation tái sử dụng nào để thực thi state transition này?”

Primitive phải:
- executable;
- composable;
- deterministic;
- parameterized;
- không chứa tên character;
- không gánh toàn bộ Contract timing;
- không gánh lore;
- không thay Tag Registry.

Primitive Registry phải được kiểm thử bằng 4 file character hiện có + Pygmalion + ít nhất một kit simple.

---

# 21. CÁC CÂU HỎI CANONICAL CẦN GIỮ MỞ

## Death / Life
1. Global Revive có đổi lifeSerial không?
2. Waiting Window = 4 tiến theo event nào?
3. Actor absent/dead có personal Turn Boundary không?
4. Revive materialization chiếm slot theo rule nào?
5. death của combat object khác actor thế nào?

## Damage
6. Final Damage Reduction là Tag riêng hay phase parameter?
7. True Damage tương tác với Final Damage Reduction ra sao?
8. reflect/lifesteal/counter recursion global default chính xác thế nào?

## Action
9. Exact nested Action Completion order?
10. reaction queue chạy trước hay sau DEATH_CONFIRMED ở từng phase?
11. child action có snapshot riêng hay reuse parent snapshot bằng policy nào?

## Authority
12. same-tier conflict resolver.
13. specificity vs Authority.
14. Axiom vs explicit exception.
15. dynamic authority timing.

## Target
16. random duplicate policy canonical defaults.
17. dead/invalid target reroll defaults.
18. direct target exclusion vs effect immunity.

## Tag
19. Reaction có cần Functional Tag?
20. Target Scope có cần Functional Tag?
21. Trigger families có cần Tag?
22. `AOE_RANDOM` có nên đổi semantic/name?
23. `FINAL_DAMAGE_REDUCTION` có giữ?
24. `SELF_HP_COST` có cần đi cùng một generic `HP_LOSS` Tag?
25. `DEATH_TRIGGER` có cần Tag?
26. `EXECUTE` có cần Tag?

## Pygmalion
27. inherit Class?
28. inherit Element?
29. Skill 1 target scope?
30. inherited secondary-effect attribution?
31. inhabited Puppet Revive exact contract?

## Narrative
32. Capability Tag vocabulary final?
33. Story Requirement có query only tags hay query structured schema capability?
34. Narrative Property có global tag namespace riêng không?
35. Witness perception model?
36. Realization authority policy?

## New mode
37. AE là team pool hay entity/local pool?
38. local resources reset ở stage/run boundary nào?
39. Base movement/failure state?
40. settlement conversion formula?

---

# 22. RECOMMENDED OUTPUT SEQUENCE SAU CHẶNG A

## Chặng B
Tạo:
`01_TERMINOLOGY_vNext.md`

Nguồn:
- `terminology.md` user gửi.
- Audit này.
- newest user corrections.

Không dùng Tag Registry để định nghĩa ngược Terminology.

## Chặng C
Tạo:
`02_TAG_vNext.md`

Nguồn:
- `tag_v0.2_silas.md` như checkpoint.
- Terminology vNext.
- stress-test queries.

Mỗi Tag đúng 7 trường:
- ID
- Tên Việt
- Tên Anh
- Definition
- Semantic Boundary
- Includes
- Does Not Include

## Chặng D
Tạo:
`03_PRIMITIVE.md`

Phải có:
- primitive family;
- input/output;
- precondition;
- state mutation;
- emitted events;
- atomicity;
- forbidden responsibilities;
- Contract dependency;
- Tag relationship examples;
- stress-test coverage.

## Chặng E
Tạo:
`04_ABILITY_SCHEMA.md`

Không nên là pseudo-code quá sớm.
Trước hết khóa semantic structure.

## Chặng F
Tạo:
`05_CONTRACTS.md`

## Chặng G
Tạo:
`06_KERNEL_RUNTIME.md`

## Chặng H
Tạo:
`07_MODE_PROFILES.md`

## Chặng I
Tạo:
`08_STRESS_TESTS.md`

---

# 23. FINAL RECOVERY VERDICT

## Có thể tin ở mức kiến trúc

Những điểm mạnh nhất đã được recover:

1. **Character phải là data/composition.**
2. **Kernel mới là behavior runtime.**
3. **Tag là semantic, không phải code.**
4. **Primitive là executable building block.**
5. **Một semantic chỉ có một Canonical Tag.**
6. **Ability Type không phải Functional Tag.**
7. **Action Identity khác Action Behavior.**
8. **Target Selection khác Area Resolution.**
9. **Damage Packet khác Actual HP Damage và Overkill.**
10. **True Damage không tự xuyên Shield.**
11. **HP loss/cost không phải Damage.**
12. **HP_ZERO khác DEATH_CONFIRMED.**
13. **Identity khác Presentation khác Combat Definition.**
14. **Authority khác Axiom identity.**
15. **Composite Action phải khai báo policy, không dựa global assumption.**
16. **Pygmalion/Narrative/Arena/Reincarnation là stress tests bắt buộc.**
17. **Tag Registry hiện tại chưa hoàn tất.**
18. **Primitive.md hiện chưa có canonical implementation.**

## Không được giả vờ đã chốt

Các phần sau vẫn dang dở:

- exact Tag layer.
- exact Primitive registry.
- Ability Schema.
- Contract.
- Kernel Runtime.
- exact Turn Boundary event model.
- exact Revive/lifeSerial default.
- Reincarnation clock.
- same-tier Authority.
- several target/trigger Tags.
- Narrative tag namespace.
- Pygmalion inheritance details.
- new mode runtime profile.

### Quy tắc quan trọng nhất cho model tiếp theo

> **Không “hoàn thiện” Arclune bằng cách đoán. Hãy hoàn thiện nó bằng cách tách semantic, đánh dấu ambiguity, rồi chỉ canonicalize sau khi semantic boundary được chứng minh.**

---

# 24. CHECKSUM TƯ DUY CHO SOL/MAX CHAT MỚI

Nếu model mới hiểu đúng project, nó phải đồng ý được các câu sau mà không tự mâu thuẫn:

- Một Skill copy Basic Attack damage profile không tự trở thành Basic Attack.
- Follow-up dùng Basic Attack behavior không tự trở thành Natural Action.
- True Damage không tự xuyên Shield.
- HP Cost không tự phát Damage Event.
- HP_ZERO chưa phải confirmed death.
- Death Prevention không phải Revive.
- Direct Target Exclusion không khiến fixed AoE miss.
- Presentation invisibility không xóa battlefield occupancy.
- Combat Definition có thể khác Presentation Definition.
- Damage Attribution có thể khác Behavior Source.
- Outer Ultimate có thể preserve hoặc override child authority tùy chính ability contract.
- Axiom identity không tự nâng mọi skill lên Axiom Authority.
- Pygmalion một Puppet mỗi Life Cycle không có nghĩa chỉ tồn tại một Puppet.
- Story cần capability query không có nghĩa mọi Story property phải trở thành Functional Tag.
- Tag không thực thi logic.
- Primitive không được thiết kế 1:1 theo Tag.
- Kernel không được switch theo character name để giải quyết mechanic thông thường.

Nếu model không giữ được các distinction này:
> chưa nên cho nó chuẩn hóa Tag/Primitive của Arclune.

