# ARCLUNE — TAG REGISTRY
## Canonical Tag Taxonomy v0.1

> **Nguồn chuẩn:** `terminology.md`. Tag Registry chỉ chứa semantic tag cơ bản đủ dùng để mô tả Ability/Effect. Tag không phải code behavior; Primitive mới là building block thực thi. Một semantic chỉ có **một Canonical Tag**. Không tạo alias chỉ vì tên Việt/Anh/lore khác nhau. Number, percent, cost, duration, threshold, count và parameter cụ thể không phải Tag.

> **Quy trình tạo Tag mới:** trước khi tạo Tag, phải so sánh Definition + Semantic Boundary + Includes/Does Not Include của toàn bộ Tag hiện có. Nếu cùng logic → dùng Tag cũ. Chỉ tạo Tag mới khi semantic boundary thực sự khác.

## 0. Tag Attachment Rules

Tags are attached to the smallest canonical object whose semantics they describe.

- Ability-level Tag: mô tả capability/behavior mà toàn bộ Ability có.
- Effect-level Tag: dùng khi một Ability chứa nhiều Effect có semantics độc lập và cần được query riêng.
- Primitive-level Tag: chỉ gắn khi Primitive cần được query bằng semantic đó; không mặc định sao chép toàn bộ Tag của Primitive lên mọi Ability sử dụng Primitive.
- Không lặp Tag ở Ability và Effect nếu Ability-level Tag đã đủ và engine không cần query granular hơn.
- Không tạo Tag chỉ để biểu diễn một Parameter, Condition, Duration, Cost hoặc giá trị số.
- Một Ability có nhiều Effect có thể mang nhiều Tag; việc một Tag xuất hiện trên Ability không có nghĩa mọi Effect con đều mang semantic đó.

## 1. Ability / Action Semantics

## 1. Ability / Action Semantics

> `PASSIVE`, `BASIC_ATTACK`, `SKILL`, `ULTIMATE` là Ability Type, không phải Functional Tag. Chúng được khai báo trong `Ability Schema` và chỉ được dùng làm `Ability Type` field. Không lặp lại chúng trong Canonical Functional Tag Registry.

### FORCED_ACTION
ID: `FORCED_ACTION`
Tên Việt: Hành động cưỡng chế
Tên Anh: Forced Action
Definition: Action được engine ép Actor thực hiện thay vì Actor tự chọn trong SSI.
Semantic Boundary: Mô tả action behavior, không thay đổi Ability Type của Ability tạo ra nó.
Includes: Ép một Actor Basic Attack, Skill hoặc action khác theo contract.
Does Not Include: Natural Action do Actor tự chọn; Passive Trigger không tạo Action.

### FOLLOW_UP
ID: `FOLLOW_UP`
Tên Việt: Đòn nối tiếp
Tên Anh: Follow-up
Definition: Attack/effect phụ phát sinh từ Action/Event khác và không mặc định là Natural Action.
Semantic Boundary: Không phải mọi reaction attack đều là Follow-up; contract phải xác định identity.
Includes: Các đòn phụ được định nghĩa là Follow-up.
Does Not Include: Counter nếu contract nhận diện riêng; Natural Action.

### COUNTER
ID: `COUNTER`
Tên Việt: Phản kích
Tên Anh: Counter
Definition: Action phản ứng với attack/event của đối phương theo Counter Contract.
Semantic Boundary: Counter không mặc định là Natural Action hoặc Follow-up.
Includes: Phản kích được kích hoạt bởi incoming attack/event.
Does Not Include: Natural Action thông thường; Follow-up nếu contract không gọi nó là Counter.

### REACTION
ID: `REACTION`
Tên Việt: Phản ứng
Tên Anh: Reaction
Definition: Ability/Effect được trigger bởi Event thay vì Actor trực tiếp chọn.
Semantic Boundary: Reaction là cơ chế trigger; nội dung reaction có thể là Damage, Heal, Buff, Debuff hoặc action khác.
Includes: Auto effects triggered by events.
Does Not Include: Action người chơi/AI chọn trực tiếp.

### FORCED_ACTION
ID: `FORCED_ACTION`
Tên Việt: Hành động cưỡng chế
Tên Anh: Forced Action
Definition: Action được engine ép Actor thực hiện thay vì Actor tự chọn trong SSI.
Semantic Boundary: Mô tả action behavior, không thay đổi Ability Type của Ability tạo ra nó.
Includes: Ép một Actor Basic Attack, Skill hoặc action khác theo contract.
Does Not Include: Natural Action do Actor tự chọn; Passive Trigger không tạo Action.

### FOLLOW_UP
ID: `FOLLOW_UP`
Tên Việt: Đòn nối tiếp
Tên Anh: Follow-up
Definition: Attack/effect phụ phát sinh từ Action/Event khác và không mặc định là Natural Action.
Semantic Boundary: Không phải mọi reaction attack đều là Follow-up; contract phải xác định identity.
Includes: Các đòn phụ được định nghĩa là Follow-up.
Does Not Include: Counter nếu contract nhận diện riêng; Natural Action.

### COUNTER
ID: `COUNTER`
Tên Việt: Phản kích
Tên Anh: Counter
Definition: Action phản ứng với attack/event của đối phương theo Counter Contract.
Semantic Boundary: Counter không mặc định là Natural Action hoặc Follow-up.
Includes: Phản kích được kích hoạt bởi incoming attack/event.
Does Not Include: Natural Action thông thường; Follow-up nếu contract không gọi nó là Counter.

### REACTION
ID: `REACTION`
Tên Việt: Phản ứng
Tên Anh: Reaction
Definition: Ability/Effect được trigger bởi Event thay vì Actor trực tiếp chọn.
Semantic Boundary: Reaction là cơ chế trigger; nội dung reaction có thể là Damage, Heal, Buff, Debuff hoặc action khác.
Includes: Auto effects triggered by events.
Does Not Include: Action người chơi/AI chọn trực tiếp.

## 2. Target Scope

### TARGET_SELF
ID: `TARGET_SELF`
Tên Việt: Mục tiêu bản thân
Tên Anh: Self Target
Definition: Effect/Ability có target scope chỉ áp dụng lên Caster/Owner bản thân theo contract.
Semantic Boundary: Scope, không phải effect.
Includes: Self heal, self stat modification, self shield.
Does Not Include: Ally target hoặc enemy target.

### TARGET_ALLY
ID: `TARGET_ALLY`
Tên Việt: Mục tiêu đồng minh
Tên Anh: Ally Target
Definition: Effect/Ability có target scope áp dụng lên Actor đồng minh.
Semantic Boundary: Ally là quan hệ runtime theo Side; không phải Character classification.
Includes: Heal ally, buff ally, cleanse ally.
Does Not Include: Self target trừ khi ability contract explicitly includes both.

### TARGET_ENEMY
ID: `TARGET_ENEMY`
Tên Việt: Mục tiêu kẻ địch
Tên Anh: Enemy Target
Definition: Effect/Ability có target scope áp dụng lên Actor kẻ địch.
Semantic Boundary: Enemy là quan hệ runtime theo Side.
Includes: Enemy damage, enemy debuff, enemy mark.
Does Not Include: Ally/self target.

### TARGET_AOE
ID: `TARGET_AOE`
Tên Việt: Mục tiêu diện rộng
Tên Anh: Area Target
Definition: Ability/Effect tác động lên nhiều entity theo một Target/Area contract thay vì chỉ một single target.
Semantic Boundary: Chỉ mô tả multi-target scope; Geometry và selection method nằm ở tag/rule khác.
Includes: Fixed AOE, Random AOE, full-field multi-target effects.
Does Not Include: Một single-target effect chỉ gây damage nhiều lần lên cùng một target.

### AOE_FIXED
ID: `AOE_FIXED`
Tên Việt: AOE cố định
Tên Anh: Fixed Area of Effect
Definition: Multi-target effect xác định vùng tác động bằng Geometry/Position trước khi Area Resolution.
Semantic Boundary: Targeting theo vùng cố định, không phải random target selection.
Includes: Row, column, cross, full-board region, slot-based fixed area.
Does Not Include: Randomly selected targets không dựa trên vùng Geometry.

### AOE_RANDOM
ID: `AOE_RANDOM`
Tên Việt: AOE ngẫu nhiên
Tên Anh: Random Area of Effect
Definition: Multi-target effect chọn nhiều target bằng random target resolution thay vì Geometry cố định.
Semantic Boundary: Random target selection là bản chất; không cần Geometry cố định.
Includes: 2/3/4/5 mục tiêu random, random multi-target.
Does Not Include: Fixed row/column/full-field Geometry.

### TARGET_SELECTION
ID: `TARGET_SELECTION`
Tên Việt: Chọn mục tiêu
Tên Anh: Target Selection
Definition: Ability/Effect có logic chủ động xác định target pool/selection rule ngoài target scope cơ bản.
Semantic Boundary: Không tự định nghĩa cụ thể lowest HP, taunt, shield ratio hay random; những rule đó là parameters/contracts của Target Selection.
Includes: Target priority, target re-selection, custom target resolver.
Does Not Include: Chỉ có TARGET_SELF/ALLY/ENEMY mà không có custom selection logic.

## 3. Core Combat Effects

### DAMAGE
ID: `DAMAGE`
Tên Việt: Gây sát thương
Tên Anh: Damage
Definition: Ability/Effect có Damage payload làm giảm defensive layer/HP theo Damage Contract.
Semantic Boundary: Damage là combat effect; không đồng nghĩa Actual HP Damage.
Includes: Physical, Will, True, mixed damage.
Does Not Include: HP Loss/Self HP Cost không được định nghĩa là Damage.

### HEAL
ID: `HEAL`
Tên Việt: Hồi phục
Tên Anh: Heal
Definition: Ability/Effect làm tăng Current HP theo Healing Contract.
Semantic Boundary: Không bao gồm Shield creation hoặc stat gain.
Includes: Direct heal, AoE heal, reactive heal, self heal.
Does Not Include: Overheal conversion nếu được định nghĩa như effect khác; Shield.

### SHIELD
ID: `SHIELD`
Tên Việt: Khiên
Tên Anh: Shield
Definition: Ability/Effect tạo hoặc thay đổi một Shield theo Shield Contract.
Semantic Boundary: Shield là defensive layer, không phải heal và không tự động là Damage Reduction.
Includes: Self shield, ally shield, field-created shield.
Does Not Include: Heal HP; generic damage reduction không tạo Shield.

### BUFF
ID: `BUFF`
Tên Việt: Buff
Tên Anh: Buff
Definition: Effect tạo một beneficial status/modifier có Buff identity.
Semantic Boundary: Một stat modification không phải Buff nếu contract explicitly định nghĩa nó là non-Buff modifier.
Includes: Time-limited beneficial status, dispellable beneficial modifier khi được xác định là Buff.
Does Not Include: Innate stat state; non-Buff STAT_MODIFIER.

### DEBUFF
ID: `DEBUFF`
Tên Việt: Debuff
Tên Anh: Debuff
Definition: Effect tạo một harmful status/modifier có Debuff identity.
Semantic Boundary: Debuff có Identity riêng để các mechanic có thể query.
Includes: Bleed, Slow, harmful status theo contract.
Does Not Include: Mark không harmful; raw damage không tạo Debuff.

### MARK
ID: `MARK`
Tên Việt: Đánh dấu
Tên Anh: Mark
Definition: Effect gắn Mark Identity lên target để Ability/Effect khác query.
Semantic Boundary: Mark không mặc định là Buff hay Debuff.
Includes: Persistent target mark, identity mark.
Does Not Include: Debuff chỉ vì nó kéo dài; Buff chỉ vì nó có lợi.

### DEBUFF_CLEANSE
ID: `DEBUFF_CLEANSE`
Tên Việt: Xóa Debuff
Tên Anh: Debuff Cleanse
Definition: Effect loại bỏ một hoặc nhiều Debuff đã tồn tại khỏi target.
Semantic Boundary: Chỉ là removal của Debuff hiện hữu; không phải prevention/resistance/immunity.
Includes: Xóa 1 Debuff, xóa nhiều Debuff, xóa toàn bộ Debuff nếu contract cho phép.
Does Not Include: Debuff immunity, Debuff resistance, ngăn Debuff trước khi apply.

### STAT_MODIFIER
ID: `STAT_MODIFIER`
Tên Việt: Biến đổi chỉ số
Tên Anh: Stat Modifier
Definition: Effect thay đổi một hoặc nhiều Stat theo contract mà không nhất thiết tạo Buff/Debuff identity.
Semantic Boundary: Không mặc định là Buff/Debuff.
Includes: Temporary ATK/WIL increase không phải Buff, stat increase/decrease theo contract.
Does Not Include: Rank Multiplier bản thân; Element/Rank/Class metadata.

### RESOURCE_MODIFIER
ID: `RESOURCE_MODIFIER`
Tên Việt: Biến đổi tài nguyên
Tên Anh: Resource Modifier
Definition: Effect thay đổi AE, Rage hoặc Resource Pool value theo contract.
Semantic Boundary: Resource value là parameter; tag này chỉ nói effect tác động lên resource.
Includes: Gain/loss/increase/decrease AE or Rage.
Does Not Include: Cost field của Ability chỉ vì ability có cost; damage/heal.

### POSITION_MUTATION
ID: `POSITION_MUTATION`
Tên Việt: Biến đổi vị trí
Tên Anh: Position Mutation
Definition: Effect thay đổi Position của Actor.
Semantic Boundary: Phải thay đổi battlefield position; VFX teleport không có gameplay mutation không dùng tag này.
Includes: Swap, random reposition, forced relocation.
Does Not Include: VFX-only movement.

### FIELD
ID: `FIELD`
Tên Việt: Vùng hiệu ứng
Tên Anh: Battlefield Field
Definition: Effect tạo một Field state tồn tại trên battlefield và áp dụng rule theo vùng/thời gian.
Semantic Boundary: Field không phải Actor và không tự chiếm Actor Slot.
Includes: Spatial curtain, persistent battlefield region, area modifier.
Does Not Include: Một instant AOE attack không tạo persistent Field.

## 4. Damage Semantics

### TRUE_DAMAGE
ID: `TRUE_DAMAGE`
Tên Việt: Sát thương chuẩn
Tên Anh: True Damage
Definition: Damage component không chịu ARM/RES mitigation theo Damage Contract.
Semantic Boundary: True Damage không mặc định xuyên Shield, immunity hoặc Authority.
Includes: Explicit True Damage component.
Does Not Include: RES/ARM penetration; damage chỉ vì nó bỏ qua một defensive stat.

### PHYSICAL_DAMAGE
ID: `PHYSICAL_DAMAGE`
Tên Việt: Sát thương Vật lý
Tên Anh: Physical Damage
Definition: Damage component được resolve theo Physical/ARM Contract.
Semantic Boundary: Chỉ mô tả damage component.
Includes: ATK-based physical component theo contract.
Does Not Include: True Damage chỉ vì scale bằng ATK.

### WILL_DAMAGE
ID: `WILL_DAMAGE`
Tên Việt: Sát thương Ý chí
Tên Anh: Will Damage
Definition: Damage component được resolve theo Will/RES Contract.
Semantic Boundary: Chỉ mô tả damage component.
Includes: WIL-based will component theo contract.
Does Not Include: True Damage chỉ vì scale bằng WIL.

### PENETRATION
ID: `PENETRATION`
Tên Việt: Xuyên phòng thủ
Tên Anh: Penetration
Definition: Effect/ability có cơ chế làm giảm hoặc bỏ qua một phần defensive stat theo Damage Contract.
Semantic Boundary: Penetration không biến damage thành True Damage.
Includes: RES/ARM penetration, percentage ignore của defense nếu contract phân loại là penetration.
Does Not Include: TRUE_DAMAGE.

### DAMAGE_REDUCTION
ID: `DAMAGE_REDUCTION`
Tên Việt: Giảm sát thương
Tên Anh: Damage Reduction
Definition: Effect làm giảm Damage ở một phase được contract xác định.
Semantic Boundary: Nếu effect bắt buộc áp sau upstream mitigation và trước HP/Shield commit thì dùng FINAL_DAMAGE_REDUCTION thay vì tag này.
Includes: Generic damage reduction.
Does Not Include: ARM/RES stat itself; Shield; Final Damage Reduction nếu semantics cụ thể hơn.

### FINAL_DAMAGE_REDUCTION
ID: `FINAL_DAMAGE_REDUCTION`
Tên Việt: Giảm sát thương cuối
Tên Anh: Final Damage Reduction
Definition: Effect giảm Damage sau các upstream mitigation được chỉ định và trước final HP/Shield commit.
Semantic Boundary: Đây là phase-specific reduction; không đồng nghĩa ARM/RES, Penetration, Shield hoặc generic pre-mitigation reduction.
Includes: “Giảm 25% sát thương cuối”, “giảm final damage nhận vào”.
Does Not Include: Defense stat; Shield; raw damage reduction trước ARM/RES nếu contract định nghĩa phase khác.

## 5. Trigger Semantics

### AUTO_TRIGGER
ID: `AUTO_TRIGGER`
Tên Việt: Tự động kích hoạt
Tên Anh: Auto Trigger
Definition: Ability/Effect tự kiểm tra điều kiện và resolve mà không cần player/AI trực tiếp chọn nó tại thời điểm trigger.
Semantic Boundary: Không phải mọi Passive đều Auto Trigger; chỉ dùng khi ability thực sự tự resolve theo condition/event.
Includes: Threshold auto-skill, event-driven auto-effect.
Does Not Include: Passive chỉ cung cấp static modifier; active Skill do player chọn.

### THRESHOLD_TRIGGER
ID: `THRESHOLD_TRIGGER`
Tên Việt: Kích hoạt theo ngưỡng
Tên Anh: Threshold Trigger
Definition: Trigger xảy ra khi một giá trị đạt hoặc vượt threshold định trước.
Semantic Boundary: Threshold number là parameter.
Includes: HP <= 20%, incoming damage > 20% Max HP, count >= 3.
Does Not Include: Trigger chỉ dựa trên event nhưng không có threshold.

### DAMAGE_TRIGGER
ID: `DAMAGE_TRIGGER`
Tên Việt: Kích hoạt theo sát thương
Tên Anh: Damage Trigger
Definition: Trigger condition phụ thuộc vào Damage Event/Action/Packet hoặc damage amount.
Semantic Boundary: Không nói damage effect làm gì sau khi trigger; chỉ mô tả trigger source.
Includes: “khi nhận sát thương”, “sau khi gây sát thương”, damage threshold trigger.
Does Not Include: Heal/cleanse trigger.

### ACTION_COUNTER
ID: `ACTION_COUNTER`
Tên Việt: Bộ đếm hành động
Tên Anh: Action Counter
Definition: Trigger/state theo dõi số Action hoặc Natural Action hợp lệ cho tới threshold.
Semantic Boundary: Threshold count là parameter.
Includes: “sau 3 action”, “mỗi 3 Basic Attack”.
Does Not Include: Cooldown timer nếu không có counting semantic.

## 6. Lifecycle / Identity Effects

### DEATH_PREVENTION
ID: `DEATH_PREVENTION`
Tên Việt: Phòng tử vong
Tên Anh: Death Prevention
Definition: Effect ngăn hoặc thay thế transition từ HP_ZERO thành DEATH_CONFIRMED.
Semantic Boundary: Chỉ xử lý death transition; không tự đồng nghĩa Revive.
Includes: Death Prevention, “không chết khi HP về 0”.
Does Not Include: Revive sau DEATH_CONFIRMED.

### REVIVE
ID: `REVIVE`
Tên Việt: Hồi sinh
Tên Anh: Revive
Definition: Effect/Ability đưa một actor đã chết trở lại life/combat state theo Revive Contract.
Semantic Boundary: Revive diễn ra sau death state/DEATH_CONFIRMED theo contract; không phải Death Prevention.
Includes: Immediate revive, delayed revive, limited revive.
Does Not Include: Death Prevention.

### REINCARNATION
ID: `REINCARNATION`
Tên Việt: Luân Hồi / Tái sinh
Tên Anh: Reincarnation
Definition: Effect/Ability tương tác trực tiếp với transition của Chân Ngã sang một đời mới theo World Axiom Luân Hồi.
Semantic Boundary: Không dùng cho Revive thông thường.
Includes: Forcing entry into Luân Hồi, creating a new life from a True Self, reincarnation-specific manipulation.
Does Not Include: Ordinary Revive.

### IMMUNITY
ID: `IMMUNITY`
Tên Việt: Miễn nhiễm
Tên Anh: Immunity
Definition: Effect/State ngăn một nhóm Effect/Status được áp dụng hoặc resolve lên target theo explicit immunity scope.
Semantic Boundary: Immunity scope phải được contract xác định; không tự động là Damage Immunity.
Includes: Debuff immunity, Curse immunity, specific effect immunity.
Does Not Include: Resistance; general Damage Reduction; Divine Nature itself.

### TARGET_EXCLUSION
ID: `TARGET_EXCLUSION`
Tên Việt: Loại khỏi chọn mục tiêu
Tên Anh: Target Exclusion
Definition: Rule loại Actor khỏi Candidate Pool của Target Selection nhưng không nhất thiết loại Actor khỏi Area Resolution.
Semantic Boundary: Không phải damage immunity hoặc invisibility tổng quát.
Includes: Forgotten actor cannot be directly targeted; special target blacklist.
Does Not Include: AOE immunity; damage immunity; Area Resolution exclusion.

## 7. System Interaction Tags

### SUMMON
ID: `SUMMON`
Tên Việt: Triệu hồi
Tên Anh: Summon
Definition: Ability/Effect tạo một Summon Actor vào battlefield theo Summon Contract.
Semantic Boundary: Chỉ dùng khi effect thực sự tạo Summon actor.
Includes: Creep, Tử Thể, auxiliary unit nếu contract gọi là Summon.
Does Not Include: Field, VFX object, permanent object không phải Actor.

### ARENA
ID: `ARENA`
Tên Việt: Giác Đấu Trường
Tên Anh: Arena
Definition: Ability/Effect khởi tạo hoặc đưa Actor vào một isolated Arena Combat Instance.
Semantic Boundary: Không phải Field hoặc ordinary teleport.
Includes: Giác Đấu Trường isolate two actors.
Does Not Include: Ordinary battlefield reposition.

### UNIQUENESS
ID: `UNIQUENESS`
Tên Việt: Duy Nhất
Tên Anh: Uniqueness
Definition: Ability/Effect trực tiếp tương tác với Axiom Duy Nhất hoặc uniqueness state của một Identity/Definition.
Semantic Boundary: Duy Nhất là Axiom/identity rule, không phải tag “unique visual”.
Includes: Create/resolve uniqueness conflict, uniqueness exclusion.
Does Not Include: Character being rare, SSR/UR/Prime or merely having one copy in normal deck.

### DIVINE_NATURE
ID: `DIVINE_NATURE`
Tên Việt: Thần Tính
Tên Anh: Divine Nature
Definition: Ability/Effect trực tiếp mang hoặc tương tác với Divine Nature identity theo Axiom contract.
Semantic Boundary: Divine Nature không mặc định là Damage Immunity và không đồng nghĩa immunity global.
Includes: Grant/interact with Divine Nature.
Does Not Include: Ordinary buff/debuff immunity nếu không có Divine Nature semantics.

## 8. Notes on Minimal Taxonomy

- `PASSIVE`, `SKILL`, `ULTIMATE`, `BASIC_ATTACK` là Ability Type trong `ABILITY_SCHEMA`, không phải Canonical Functional Tag.
- `TARGET_SELF`, `TARGET_ALLY`, `TARGET_ENEMY` mô tả target scope; chúng không thay thế Target Filter/Selection Rule.
- `AOE_FIXED` và `AOE_RANDOM` là hai semantic khác nhau vì khác resolution method.
- `DAMAGE`, `HEAL`, `SHIELD`, `BUFF`, `DEBUFF`, `MARK` là effect-level semantic cơ bản.
- `DEBUFF_CLEANSE` là canonical semantic cho “xóa Debuff”; không tạo `PURIFY`, `CLEANSE`, `REMOVE_DEBUFF` hoặc tên tương đương nếu definition không khác.
- `DAMAGE_REDUCTION` và `FINAL_DAMAGE_REDUCTION` chỉ được tách vì semantic phase khác nhau. Nếu Damage Contract sau này quy về cùng một phase, phải xem xét hợp nhất thay vì giữ hai tên cho cùng logic.
- `THRESHOLD_TRIGGER` + `DAMAGE_TRIGGER` có thể cùng tồn tại trên một Ability nếu trigger vừa phụ thuộc Damage vừa phụ thuộc threshold.
- Parameter như `25%`, `20 AE`, `3 targets`, `2 Natural Actions` không được biến thành Tag.
- `DIVINE_NATURE`, `UNIQUENESS`, `ARENA`, `REINCARNATION` là system-interaction tags và chỉ dùng khi Ability/Effect thực sự tương tác trực tiếp với system đó.
- Không tạo Tag chỉ vì một mechanic có tên/lore khác; phải xét Definition + Semantic Boundary trước.

## 8.1 Tag vs Schema Field

Tag không thay thế các field canonical của Ability Schema.

Các khái niệm như `ABILITY_TYPE`, `ACTION_IDENTITY`, `ACTION_BEHAVIOR`, `TRIGGER`, `TARGET`, `CONDITION`, `COST`, `DURATION`, `AUTHORITY` là Schema/Contract fields; chỉ tạo Functional Tag khi semantic đó cần được query như một capability hoặc effect identity ngoài chính field của nó.

Không tạo một Tag chỉ vì một Schema field đã có cùng semantic.
Nếu cần query Authority, engine đọc:
ability.authority
không cần tạo Tag PHAP_TAC.

## 9. Tag Governance

1. Mọi Tag mới phải có đúng 7 trường:
   - `ID`
   - `Tên Việt`
   - `Tên Anh`
   - `Definition`
   - `Semantic Boundary`
   - `Includes`
   - `Does Not Include`
2. Không thêm field mới vào Tag Registry chỉ vì một Tag riêng cần chúng.
3. Không dùng Tag để lưu value/percentage/duration/cost/threshold.
4. Không dùng Tag để lưu presentation/VFX.
5. Không dùng Tag để thay thế Primitive.
6. Khi chuẩn hóa một Character, luôn tìm Tag hiện có trước khi đề xuất Tag mới.
7. Nếu đề xuất Tag mới, phải chỉ ra ít nhất một Tag hiện có gần nhất và giải thích chính xác semantic boundary khác nhau ở đâu.
8. Nếu không chứng minh được boundary khác nhau, không tạo Tag mới.
9. Character file chỉ tham chiếu Canonical Tag ID; không lặp lại Definition của Tag.
10. Tag là affirmative semantic declaration. Không tạo Negative Tag chỉ để biểu diễn việc một Ability không có một capability.
11. Việc một Tag không xuất hiện nghĩa là Ability/Effect không được khai báo semantic đó.
12. 