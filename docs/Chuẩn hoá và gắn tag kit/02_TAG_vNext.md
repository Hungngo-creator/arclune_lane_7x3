# ARCLUNE — TAG REGISTRY vNext
## Chặng C — Canonical Semantic Tag Taxonomy
**Version:** 2026-09-10-C  
**Status:** Working Canonical Candidate  
**Depends on:** `01_TERMINOLOGY_vNext.md`  
**Provenance:** legacy `tag.md` + Canonical Recovery Audit + stress-test character files + current project corrections.  
**Scope:** Canonical Functional Tags only. This file does **not** define Ability Type, TargetSpec, TriggerSpec, Authority, Primitive behavior, Contract timing, or Kernel execution order.

---

# 0. KẾT LUẬN KIẾN TRÚC CỦA CHẶNG C

Tag Registry vNext được xây theo một nguyên tắc cố ý **nhỏ hơn** legacy registry:

> **Không phải mọi semantic cần query đều phải trở thành Tag.**

Arclune có ba nguồn semantic query khác nhau:

1. **Canonical Functional Tag**
   - semantic capability/effect identity thực sự cần một nhãn chuẩn cross-system.

2. **Schema Facet**
   - semantic đã có field canonical rõ ràng trong Ability/Action/Target/Trigger/Authority schema.
   - ví dụ `AbilityType`, `ActionBehavior`, `TargetScope`, `TriggerEvent`.

3. **System / Axiom Metadata**
   - identity/law/system membership.
   - ví dụ Thần Tính, Duy Nhất, Authority Tier.

Điều này giải quyết mâu thuẫn của legacy Tag Registry:
nếu mọi thứ queryable đều bị biến thành Tag thì Tag Registry sẽ trở thành một bản sao thứ hai của toàn bộ Ability Schema.

**Canonical design:**

> Tag là semantic index, không phải schema clone.

---

# 1. FIVE-GATE TEST — ĐIỀU KIỆN ĐỂ MỘT TAG ĐƯỢC TỒN TẠI

Mọi Candidate Tag mới phải vượt qua cả năm gate.

## Gate 1 — Semantic Distinctness

Candidate phải có semantic boundary khác thật sự với Tag đang tồn tại.

Nếu:
- wording khác;
- lore khác;
- tên Việt khác;
- tên Anh khác;
- character khác;
nhưng behavior semantic giống nhau:

> **không tạo Tag mới.**

---

## Gate 2 — Queryability

Phải có lý do hợp lệ để system/AI/Story/kit query semantic này như một capability hoặc effect identity.

Ví dụ hợp lệ:

> “Tìm Ability có khả năng gây True Damage.”

Tag `TRUE_DAMAGE` có giá trị.

Ví dụ không đủ:

> “Ability này target Enemy.”

Vì Target Scope đã là structured Schema Facet và có thể query trực tiếp.

---

## Gate 3 — Parameter Test

Nếu candidate chỉ là:
- số;
- phần trăm;
- duration;
- cost;
- target count;
- threshold;
- phase;
- selection mode;
- cooldown;
- authority value;

thì:

> **không Tag.**

Nó phải là Parameter/Schema field.

---

## Gate 4 — Layer Test

Nếu semantic đã có canonical home rõ ràng ở:

- Ability Type;
- Action Identity;
- Action Behavior;
- TargetSpec;
- TriggerSpec;
- Condition;
- Authority;
- State;
- Axiom Identity;
- Presentation;

thì mặc định **không tạo Functional Tag**.

Chỉ ngoại lệ khi một cross-system capability query không thể được giải quyết sạch bằng structured facet.

---

## Gate 5 — Duplicate Test

Trước khi thêm Tag mới phải so với:
- Definition;
- Semantic Boundary;
- Includes;
- Does Not Include;
của toàn registry.

Nếu cùng boundary:
> reuse existing Tag.

---

# 2. TAG ATTACHMENT RULES

## 2.1 Smallest Semantic Owner

Tag gắn vào object nhỏ nhất thực sự sở hữu semantic.

Ví dụ:

Một Ultimate có:
- child effect A = Damage;
- child effect B = Heal.

Không mặc định gắn `HEAL` lên child Damage effect.

Có thể aggregate Tag ở Ability level cho search/index nếu hệ thống hỗ trợ **derived aggregation**, nhưng source-of-truth vẫn ở smallest semantic owner.

---

## 2.2 Ability-level Tag

Dùng khi toàn Ability có capability semantic đó hoặc Ability-level query cần aggregate từ child effects.

Ví dụ:
- Ability tạo Summon → `SUMMON`.
- Ability gây Damage qua các child effect → derived ability capability `DAMAGE`.

---

## 2.3 Effect-level Tag

Đây là level ưu tiên cho:
- Damage type;
- Heal;
- Shield;
- status;
- position mutation;
- lifecycle effect.

---

## 2.4 State-level Tag

Chỉ dùng nếu một persistent State thực sự sở hữu semantic queryable.

Ví dụ:
- một State tạo `IMMUNITY`;
- một Airborne State mang semantic `AIRBORNE`.

---

## 2.5 Không sao chép vô điều kiện

Việc Primitive implementation hỗ trợ semantic X không có nghĩa:
> mọi Ability gọi Primitive đó tự động phải lưu Tag X thủ công.

Tag có thể:
- explicit trong data;
- hoặc được compiler/indexer derive từ normalized effect spec.

Exact storage strategy thuộc Schema/Kernel.

---

# 3. CAPABILITY INDEX — QUERY KHÔNG CHỈ BẰNG TAG

Để hỗ trợ Cố Sự Chi Thần, AI, search, rule resolver và tooling mà không làm Tag Registry phình vô hạn, Arclune dùng concept **Capability Index**.

Capability Index là normalized query view, có thể đọc ba nguồn:

## 3.1 Functional Tags

Ví dụ:

- `TRUE_DAMAGE`
- `HEAL`
- `DEBUFF_CLEANSE`
- `REVIVE`

Query:
> actor có Ability mang capability `TRUE_DAMAGE` không?

---

## 3.2 Schema Facets

Ví dụ:

- `abilityType = ULTIMATE`
- `actionBehavior = FOLLOW_UP`
- `targetScope includes ALLY`
- `targetSelection = RANDOM`
- `areaGeometry = COLUMN`
- `triggerEvent = DEATH_CONFIRMED`
- `triggerMode = AUTO`
- `authorityTier = QUY_TAC`

Những semantic này **không cần Functional Tag chỉ để query**.

---

## 3.3 System / Axiom Metadata

Ví dụ:

- `axiomIdentity = DIVINE_NATURE`
- `axiomIdentity = UNIQUENESS`
- `worldSystem = REINCARNATION`
- `combatInstanceInteraction = ARENA`

Một Story Requirement hoặc AI query có thể query metadata trực tiếp.

---

## 3.4 Capability Requirement

Consumer không nên giả định:
> mọi requirement luôn là Tag ID.

Một requirement có thể là expression:

- Functional Tag condition;
- Schema Facet condition;
- metadata condition;
- AND/OR/NOT composition;
- Parameter threshold;
- Rank/Class/Element relation.

Ví dụ:

> “Tìm enemy Mage có Ultimate gây True Damage.”

Không cần tạo Tags:
- ENEMY
- MAGE
- ULTIMATE

Query có thể là:

- relationship = ENEMY;
- class = MAGE;
- abilityType = ULTIMATE;
- functionalTag includes TRUE_DAMAGE.

---

# 4. CANONICAL TAG REGISTRY

Mỗi Tag dưới đây có **đúng 7 field**:

1. ID
2. Tên Việt
3. Tên Anh
4. Definition
5. Semantic Boundary
6. Includes
7. Does Not Include

Không thêm field thứ tám vào một Tag riêng lẻ.

---

# 5. CORE EFFECT TAGS

## 5.1 DAMAGE

ID: `DAMAGE`  
Tên Việt: Gây sát thương  
Tên Anh: Damage  
Definition: Ability/Effect tạo một hoặc nhiều Damage Packet và đưa chúng qua Damage Contract để tác động lên defensive layer hoặc Current HP.  
Semantic Boundary: `DAMAGE` xác nhận effect thuộc damage system; nó không đồng nghĩa Damage Packet amount, Actual HP Damage, HP Loss hoặc kết quả target chết.  
Includes: Physical Damage, Will Damage, True Damage, Mixed Damage, reflected damage nếu reflected instance vẫn là Damage theo Contract.  
Does Not Include: HP Cost; non-Damage HP Loss; Max HP Mutation; Heal; Shield removal không được định nghĩa là Damage.

---

## 5.2 HEAL

ID: `HEAL`  
Tên Việt: Hồi phục HP  
Tên Anh: Heal  
Definition: Ability/Effect tăng Current HP theo Healing Contract.  
Semantic Boundary: `HEAL` chỉ mô tả restoration của Current HP; Overheal là outcome của Healing Contract, không phải một Heal type độc lập.  
Includes: Direct Heal; self Heal; ally Heal; AoE Heal; reactive Heal; Heal tính từ Actual HP Damage nếu effect thực sự hồi Current HP.  
Does Not Include: Revive; Shield creation; Max HP increase; Current HP materialization của Revive; Overheal conversion thành stat nếu conversion effect nằm ở effect khác.

---

## 5.3 SHIELD

ID: `SHIELD`  
Tên Việt: Khiên  
Tên Anh: Shield  
Definition: Ability/Effect tạo, bổ sung, giảm, chuyển hoặc trực tiếp thao túng một Shield defensive layer theo Shield Contract.  
Semantic Boundary: Shield là defensive layer độc lập với Current HP và Damage Reduction; Tag này dùng khi effect thực sự thao túng Shield state.  
Includes: Create Shield; add Shield value; restore Shield; transfer Shield; consume Shield như effect nếu semantic chính là Shield manipulation.  
Does Not Include: Heal; ARM/RES; generic Damage Reduction; effect chỉ “gây thêm damage lên target có Shield” nhưng không thao túng Shield state.

---

## 5.4 BUFF

ID: `BUFF`  
Tên Việt: Buff  
Tên Anh: Buff  
Definition: Effect tạo hoặc thao túng một beneficial status có Buff Identity theo Status Contract.  
Semantic Boundary: `BUFF` là status identity, không phải synonym của mọi thay đổi có lợi; một positive Stat Modifier có thể được định nghĩa là non-Buff.  
Includes: Apply Buff; extend Buff; copy Buff; transfer Buff; query/manipulate Buff nếu effect semantic trực tiếp tác động Buff identity.  
Does Not Include: Innate stat; permanent baseline mutation; non-Buff Stat Modifier; Divine Nature; beneficial Mark không được định nghĩa là Buff.

---

## 5.5 DEBUFF

ID: `DEBUFF`  
Tên Việt: Debuff  
Tên Anh: Debuff  
Definition: Effect tạo hoặc thao túng một harmful status có Debuff Identity theo Status Contract.  
Semantic Boundary: `DEBUFF` là harmful status identity; raw Damage, Position Mutation hoặc Mark không tự trở thành Debuff chỉ vì bất lợi cho target.  
Includes: Apply Debuff; extend Debuff; copy Debuff; transform Debuff; effects whose state identity is explicitly Debuff.  
Does Not Include: Raw Damage; Mark không có Debuff identity; generic Position Mutation; Target Exclusion state không được định nghĩa là Debuff; Axiom restriction không mang Debuff identity.

---

## 5.6 MARK

ID: `MARK`  
Tên Việt: Đánh dấu thực thể  
Tên Anh: Entity Mark  
Definition: Effect tạo hoặc thao túng một queryable Mark Identity gắn trên Runtime Entity thay vì trên Position.  
Semantic Boundary: `MARK` không mặc định là Buff hoặc Debuff và không dùng cho marker thuộc battlefield Position.  
Includes: Target mark; tracking mark; death-observer mark; identity mark gắn trên Character/Combat Unit/Combat Object nếu Contract cho phép.  
Does Not Include: `POSITION_MARK`; Buff/Debuff chỉ vì chúng persistent; UI-only icon; Tag metadata của Ability.

---

## 5.7 DEBUFF_CLEANSE

ID: `DEBUFF_CLEANSE`  
Tên Việt: Xóa Debuff  
Tên Anh: Debuff Cleanse  
Definition: Effect loại bỏ một hoặc nhiều Debuff đã tồn tại khỏi target theo Cleanse/Authority Contract.  
Semantic Boundary: `DEBUFF_CLEANSE` là removal của Debuff hiện hữu; nó không ngăn Debuff tương lai và không tạo resistance.  
Includes: Remove one Debuff; remove selected Debuff category; remove multiple/all eligible Debuffs.  
Does Not Include: Debuff Immunity; Debuff resistance; prevention before application; remove Mark nếu Mark không phải Debuff; arbitrary state reset.

---

## 5.8 STAT_MODIFIER

ID: `STAT_MODIFIER`  
Tên Việt: Biến đổi chỉ số  
Tên Anh: Stat Modifier  
Definition: Ability/Effect thay đổi một hoặc nhiều combat Stat hoặc modifier contribution mà không bắt buộc tạo Buff/Debuff Identity.  
Semantic Boundary: `STAT_MODIFIER` nói effect tác động stat layer; Buff/Debuff classification là semantic độc lập và có thể cùng xuất hiện hoặc không.  
Includes: ATK/WIL/ARM/RES increase/decrease; HP Regen modifier; percentage modifier; temporary modifier; persistent modifier nếu Stat Contract cho phép.  
Does Not Include: Rank/Class/Element metadata; direct Current HP Heal/Loss; Max HP Mutation khi effect được phân loại riêng là `MAX_HP_MUTATION`; derived formula chỉ đọc stat mà không sửa stat.

---

## 5.9 RESOURCE_MODIFIER

ID: `RESOURCE_MODIFIER`  
Tên Việt: Biến đổi tài nguyên  
Tên Anh: Resource Modifier  
Definition: Ability/Effect trực tiếp làm tăng, giảm, đặt lại, chuyển hoặc biến đổi value/capacity của một Resource Pool.  
Semantic Boundary: `RESOURCE_MODIFIER` mô tả effect thay đổi resource state; việc một Ability có Resource Cost không đủ để nhận Tag này.  
Includes: Gain AE; lose AE; gain Rage; drain Rage; set resource; transfer resource; modify resource cap nếu Contract coi cap là resource state.  
Does Not Include: Cost field chỉ tiêu tài nguyên để cast; HP Cost; local economy conversion nếu không dùng combat Resource semantic; stat modifier không tác động Resource Pool.

---

## 5.10 POSITION_MUTATION

ID: `POSITION_MUTATION`  
Tên Việt: Biến đổi vị trí  
Tên Anh: Position Mutation  
Definition: Ability/Effect thay đổi Position authoritative của Runtime Entity trong Combat Instance.  
Semantic Boundary: `POSITION_MUTATION` yêu cầu gameplay Position thực sự thay đổi; animation/VFX di chuyển không đủ.  
Includes: Push; pull; swap; teleport; forced relocation; random reposition; return-to-position khi operation thực sự mutate Position.  
Does Not Include: VFX dash không đổi authoritative Position; Airborne chỉ như status nếu Position không đổi; leaving entire Combat Instance nếu semantic là Arena/Temporary Absence.

---

## 5.11 FIELD

ID: `FIELD`  
Tên Việt: Vùng hiệu ứng chiến trường  
Tên Anh: Battlefield Field  
Definition: Ability/Effect tạo hoặc thao túng một persistent battlefield Field state có spatial hoặc battlefield-wide rules riêng.  
Semantic Boundary: `FIELD` là persistent environmental state, không phải instant AoE và không mặc định là Combat Unit/Combat Object chiếm slot.  
Includes: Create field; modify field; remove field; persistent spatial zone; battlefield-wide persistent rule zone.  
Does Not Include: Instant area Damage; Summon; Position Mark; deployed Combat Object có object identity riêng mà không phải Field.

---

# 6. DAMAGE CAPABILITY TAGS

## 6.1 PHYSICAL_DAMAGE

ID: `PHYSICAL_DAMAGE`  
Tên Việt: Sát thương Vật lý  
Tên Anh: Physical Damage  
Definition: Damage Effect có ít nhất một Damage component được resolve theo Physical/ARM Contract.  
Semantic Boundary: Tag mô tả damage component identity, không formula source; Damage scale bằng ATK chưa chắc là Physical nếu Contract định nghĩa type khác.  
Includes: Pure Physical Damage; Physical component trong Mixed Damage; Physical component có Penetration.  
Does Not Include: True Damage scale bằng ATK; Will Damage; effect chỉ giảm ARM mà không gây Physical Damage.

---

## 6.2 WILL_DAMAGE

ID: `WILL_DAMAGE`  
Tên Việt: Sát thương Ý chí  
Tên Anh: Will Damage  
Definition: Damage Effect có ít nhất một Damage component được resolve theo Will/RES Contract.  
Semantic Boundary: Tag mô tả damage component identity, không đơn thuần dựa vào WIL scaling.  
Includes: Pure Will Damage; Will component trong Mixed Damage; Will component có RES Penetration.  
Does Not Include: True Damage scale bằng WIL; Physical Damage; effect chỉ giảm RES.

---

## 6.3 TRUE_DAMAGE

ID: `TRUE_DAMAGE`  
Tên Việt: Sát thương chuẩn  
Tên Anh: True Damage  
Definition: Damage Effect có ít nhất một True Damage component được resolve theo True Damage Contract.  
Semantic Boundary: True Damage là damage type/property bỏ qua ARM/RES theo Contract; nó không tự đồng nghĩa xuyên Shield, miễn Authority hoặc lethal execution.  
Includes: Pure True Damage; True component trong Mixed Damage; echo được tạo dưới dạng True Damage.  
Does Not Include: Penetration; ignore một phần ARM/RES; Shield Piercing; HP Loss; Execute; Damage chỉ vì không dùng ATK/WIL.

---

## 6.4 PENETRATION

ID: `PENETRATION`  
Tên Việt: Xuyên phòng thủ  
Tên Anh: Penetration  
Definition: Damage Effect có cơ chế giảm hoặc bỏ qua một phần defensive stat dùng trong mitigation.  
Semantic Boundary: Penetration thao túng mitigation input; nó không thay Damage component thành True Damage.  
Includes: ARM penetration; RES penetration; percentage defense ignore nếu Damage Contract phân loại là Penetration.  
Does Not Include: True Damage; Shield Piercing; generic Damage amplification; debuff giảm ARM/RES nếu semantic là external `STAT_MODIFIER` thay vì packet-level Penetration.

---

## 6.5 DAMAGE_REDUCTION

ID: `DAMAGE_REDUCTION`  
Tên Việt: Giảm sát thương  
Tên Anh: Damage Reduction  
Definition: Ability/Effect/State làm giảm qualifying Damage amount theo một Damage Contract phase được khai báo.  
Semantic Boundary: `DAMAGE_REDUCTION` là semantic giảm Damage, còn phase như normal/final là Parameter/Contract field chứ không tạo Tag khác trong vNext.  
Includes: Generic received-damage reduction; outgoing damage reduction nếu effect semantic là reduce damage; final-phase reduction khi `reductionPhase=FINAL`.  
Does Not Include: ARM/RES stat; Shield; damage avoidance; immunity; Max HP increase; `FINAL_DAMAGE_REDUCTION` như một Tag riêng.

---

## 6.6 SHIELD_PIERCING

ID: `SHIELD_PIERCING`  
Tên Việt: Xuyên khiên  
Tên Anh: Shield Piercing  
Definition: Damage/Effect có capability bỏ qua toàn phần hoặc một phần Shield defensive layer theo Shield Interaction Contract.  
Semantic Boundary: Shield Piercing chỉ nói về Shield; nó không tự bypass ARM/RES, Damage Reduction, Immunity hoặc Authority.  
Includes: Full Shield bypass; partial Shield bypass; damage component được quy định đi thẳng Current HP qua Shield.  
Does Not Include: True Damage chỉ vì là True Damage; Penetration; effect phá Shield bằng Damage bình thường; Shield removal effect không gây bypass.

---

# 7. HP / MAX HP TAGS

## 7.1 HP_LOSS

ID: `HP_LOSS`  
Tên Việt: Mất HP phi-sát-thương  
Tên Anh: Non-Damage HP Loss  
Definition: Ability/Effect trực tiếp làm giảm Current HP bằng non-Damage semantics và không phải payment Cost bắt buộc theo `SELF_HP_COST`.  
Semantic Boundary: `HP_LOSS` phân loại HP reduction không đi qua Damage Contract; nó khác Self HP Cost vì không đòi payment semantics.  
Includes: Post-action HP loss; periodic non-Damage HP loss; rule-level Current HP reduction được định nghĩa rõ không phải Damage và không phải Cost.  
Does Not Include: Damage; Self Damage; Self HP Cost; Max HP Mutation; Sacrifice nếu Sacrifice có lifecycle semantic riêng cần effect type khác.

---

## 7.2 SELF_HP_COST

ID: `SELF_HP_COST`  
Tên Việt: Chi phí HP bản thân  
Tên Anh: Self HP Cost  
Definition: Ability/Effect yêu cầu chính Caster/Owner trả Current HP như một Cost để action/trigger/effect được phép resolve.  
Semantic Boundary: `SELF_HP_COST` bắt buộc có payment semantics; non-Damage self HP loss xảy ra như hậu quả sau action không tự thuộc Tag này.  
Includes: Pay 5% Max HP to cast; pay Current HP to trigger; HP payment validated by Cost Contract.  
Does Not Include: Post-action HP loss không phải payment; Self Damage; Sacrifice không được định nghĩa là Cost; AE/Rage Cost.

---

## 7.3 MAX_HP_MUTATION

ID: `MAX_HP_MUTATION`  
Tên Việt: Biến đổi Max HP  
Tên Anh: Max HP Mutation  
Definition: Ability/Effect trực tiếp thay đổi Max HP hoặc Current Max HP bằng mutation semantics cần Health Reconciliation Contract.  
Semantic Boundary: `MAX_HP_MUTATION` không phải Heal, Damage hay generic Stat Modifier vì thay đổi HP capacity có lifecycle/reconciliation riêng.  
Includes: Permanent Max HP growth; temporary Max HP reduction; temporary Max HP bonus; return/expire Max HP contribution.  
Does Not Include: Heal Current HP; Shield; ordinary HP Loss; modifier chỉ tăng HP Regen; fake UI Max HP change không mutate gameplay state.

---

# 8. STATUS / TARGETABILITY TAGS

## 8.1 IMMUNITY

ID: `IMMUNITY`  
Tên Việt: Miễn nhiễm  
Tên Anh: Immunity  
Definition: Ability/Effect/State ngăn một explicitly scoped category of Effect/Status/interaction được áp dụng hoặc resolve lên target.  
Semantic Boundary: `IMMUNITY` luôn có scope; Tag không có nghĩa global invulnerability và không tự đồng nghĩa Divine Nature.  
Includes: Debuff immunity; specific status immunity; specific mechanic immunity; effect-category immunity nếu Contract xác định rõ.  
Does Not Include: Resistance chance; Damage Reduction; Target Exclusion; Shield; Divine Nature identity tự thân; high Authority chỉ vì khó bị override.

---

## 8.2 TARGET_EXCLUSION

ID: `TARGET_EXCLUSION`  
Tên Việt: Loại khỏi chọn mục tiêu trực tiếp  
Tên Anh: Target Exclusion  
Definition: Ability/Effect/State loại Runtime Entity khỏi một hoặc nhiều Candidate Pool của direct Target Selection theo explicit scope.  
Semantic Boundary: Target Exclusion tác động selection eligibility, không tự xóa Position/geometry occupancy và không ngăn Area Resolution đã xác lập.  
Includes: Forgotten actor không thể single-target; actor bị loại khỏi random target pool; explicit blacklist khỏi direct targeting.  
Does Not Include: Damage Immunity; fixed AoE immunity; removal khỏi battlefield; invisibility presentation nếu không có gameplay filter; untargetable vì entity đã chết/absent theo lifecycle state.

---

## 8.3 AIRBORNE

ID: `AIRBORNE`  
Tên Việt: Hất Tung / Trạng thái trên không  
Tên Anh: Airborne  
Definition: Ability/Effect/State trực tiếp áp dụng, tạo, thao túng hoặc mang semantic Airborne để system có thể query và observe event “Actor enters/is Airborne”.  
Semantic Boundary: `AIRBORNE` là control/state identity riêng; không đồng nghĩa mọi displacement hoặc Crowd Control.  
Includes: Apply Airborne; extend Airborne; react specifically to Airborne; effect chỉ tác động target đang Airborne; Airborne state object.  
Does Not Include: Stun; Freeze; Root; generic Position Mutation không tạo Airborne state; animation nhấc target lên nhưng gameplay không có Airborne.

---

# 9. POSITION / MARK TAGS

## 9.1 POSITION_MARK

ID: `POSITION_MARK`  
Tên Việt: Đánh dấu vị trí  
Tên Anh: Position Mark  
Definition: Ability/Effect tạo hoặc thao túng một persistent queryable marker gắn với battlefield Position/Slot thay vì Runtime Entity.  
Semantic Boundary: Position Mark giữ identity theo Position; Actor đi vào/rời Position không tự mang marker theo mình.  
Includes: Tọa Độ Truy Nã; trap-like marker thuộc slot nếu semantic là marker; progress/state query gắn trên ô.  
Does Not Include: `MARK` gắn Actor; `FIELD` persistent area có area rules; UI-only highlight; Position itself.

---

# 10. LIFE / DEATH TAGS

## 10.1 DEATH_PREVENTION

ID: `DEATH_PREVENTION`  
Tên Việt: Ngăn tử vong  
Tên Anh: Death Prevention  
Definition: Ability/Effect can thiệp sau HP_ZERO nhưng trước DEATH_CONFIRMED để ngăn hoặc thay thế confirmed death.  
Semantic Boundary: `DEATH_PREVENTION` là pre-confirmation lifecycle intervention; nó không phải ordinary Revive.  
Includes: Survive at 1 HP; replace lethal outcome; consume a life-token before DEATH_CONFIRMED; other pre-confirmation save effects.  
Does Not Include: Revive sau DEATH_CONFIRMED; Reincarnation; Heal không can thiệp death pipeline; invulnerability trước HP_ZERO nếu semantic không phải death-prevention checkpoint.

---

## 10.2 REVIVE

ID: `REVIVE`  
Tên Việt: Hồi sinh  
Tên Anh: Revive  
Definition: Ability/Effect đưa một entity đã đạt DEATH_CONFIRMED từ revive-eligible dead/pending state trở lại living/materialized state theo Revive Contract.  
Semantic Boundary: `REVIVE` diễn ra sau confirmed death và khác Death Prevention, Healing, Reincarnation, Rebirth.  
Includes: Immediate Revive; delayed Revive; Revive Pending materialization; character-specific Revive giữ/chuyển stat theo Contract.  
Does Not Include: Death Prevention; Heal Current HP; Reincarnation; resurrection-like lore effect thực chất cứu trước DEATH_CONFIRMED.

---

## 10.3 REINCARNATION

ID: `REINCARNATION`  
Tên Việt: Luân Hồi / Tái sinh  
Tên Anh: Reincarnation  
Definition: Ability/Effect trực tiếp tạo, ép, sửa, route, chặn hoặc materialize behavior thuộc World Axiom Luân Hồi đối với Chân Ngã.  
Semantic Boundary: `REINCARNATION` chỉ dùng khi effect thật sự tương tác lifecycle Reincarnation/True Self; ordinary Revive không nhận Tag này.  
Includes: Force-enter Reincarnation; shorten/manipulate waiting route if effect trực tiếp sửa Luân Hồi lifecycle; create a new life from True Self; route True Self vào host; block a reincarnation route.  
Does Not Include: Ordinary Revive; Death Prevention; Summon không có Chân Ngã; cosmetic rebirth animation; generic respawn không thuộc World Axiom Luân Hồi.

---

## 10.4 TEMPORARY_ABSENCE

ID: `TEMPORARY_ABSENCE`  
Tên Việt: Tạm rời chiến trường  
Tên Anh: Temporary Battlefield Absence  
Definition: Ability/Effect chuyển một entity đang sống sang state tạm thời không hiện diện trên active battlefield mà không tạo DEATH_CONFIRMED hoặc permanent removal.  
Semantic Boundary: `TEMPORARY_ABSENCE` là lifecycle/presence transition có expectation quay lại; nó khác Position Mutation, Arena isolation, Death và permanent Removal.  
Includes: Luân Hồi Chi Chủ tạm rời hiện thế rồi materialize lại; phase-out effect có return condition; temporarily unavailable battlefield presence.  
Does Not Include: Death; Revive Pending; Arena transfer nếu entity vẫn present trong Arena Combat Instance; ordinary teleport trong cùng battlefield; permanent banish/removal không có return lifecycle.

---

# 11. ENTITY / SYSTEM CREATION TAGS

## 11.1 SUMMON

ID: `SUMMON`  
Tên Việt: Triệu hồi  
Tên Anh: Summon  
Definition: Ability/Effect tạo một Summon combat entity theo Summon Lifecycle Contract.  
Semantic Boundary: `SUMMON` chỉ dùng khi effect thật sự tạo Summon entity; persistent Field, Container hoặc VFX object không tự là Summon.  
Includes: Creep summon; auxiliary combat unit; owner-linked summon; summoned actor có own action nếu Contract cho phép.  
Does Not Include: Field; Narrative Container không phải Summon; Kén nếu schema phân loại Combat Object riêng; visual clone không có runtime entity; Reincarnation life materialization.

---

## 11.2 ARENA

ID: `ARENA`  
Tên Việt: Giác Đấu Trường / Giao tranh cô lập  
Tên Anh: Arena Interaction  
Definition: Ability/Effect trực tiếp tạo, đưa entity vào, hoặc thao túng một isolated Arena Combat Instance.  
Semantic Boundary: `ARENA` là subsystem interaction với separate Combat Instance; không phải Field, teleport hoặc ordinary Position Mutation.  
Includes: Create Arena; transfer duel participants into Arena; effect whose primary semantic is Arena-instance interaction.  
Does Not Include: Ordinary battlefield reposition; Temporary Absence; visual duel cutscene không tạo isolated Combat Instance; persistent Field.

---

## 11.3 COMBAT_DEFINITION_INHERITANCE

ID: `COMBAT_DEFINITION_INHERITANCE`  
Tên Việt: Kế thừa Định nghĩa chiến đấu  
Tên Anh: Combat Definition Inheritance  
Definition: Ability/Effect/System operation khiến một host Runtime Entity sử dụng Combat Definition hoặc selected behavior lineage của một definition khác trong khi host vẫn có thể giữ Identity, stat basis hoặc Presentation riêng theo Contract.  
Semantic Boundary: Đây là behavior-definition inheritance, không phải clone toàn bộ Character, Summon, shapeshift presentation đơn thuần hoặc copy một damage formula.  
Includes: Pygmalion Puppet nhận inherited Combat Definition; reincarnated life dùng inherited combat lineage; host giữ Presentation nhưng dùng kit source khác.  
Does Not Include: Copy riêng một Damage Profile; mimic một Skill duy nhất nếu không đổi/inherit Combat Definition; costume/presentation swap; Summon chỉ dùng same definition as owner; raw stat inheritance không có behavior definition.

---

# 12. TAGS BỊ LOẠI KHỎI FUNCTIONAL REGISTRY

Các semantic dưới đây **không bị xóa khỏi Arclune**.

Chúng chỉ được chuyển về canonical layer phù hợp hơn.

---

## 12.1 Ability Type — không phải Functional Tag

### Legacy IDs removed
- `PASSIVE`
- `BASIC_ATTACK`
- `SKILL`
- `ULTIMATE`

### Canonical home
`AbilitySchema.abilityType`

Basic Attack thực sự còn có:
`ActionIdentity = BASIC_ATTACK`

### Lý do
Tag sẽ chỉ duplicate type/identity field.

---

## 12.2 Action Behavior — không phải Functional Tag trong vNext

### Legacy IDs removed
- `FORCED_ACTION`
- `FOLLOW_UP`
- `COUNTER`
- `REACTION`

### Canonical home
- `ActionBehavior`
- `TriggerSpec`
- parent/child Action relation
- Event/Reaction scheduling

### Lý do
Các mechanic khác có thể query trực tiếp normalized Action Behavior.

Không cần tạo duplicate tag chỉ để biết:
> action này là Follow-up hay Counter.

---

## 12.3 Target Scope — không phải Functional Tag trong vNext

### Legacy IDs removed
- `TARGET_SELF`
- `TARGET_ALLY`
- `TARGET_ENEMY`
- `TARGET_AOE`

### Canonical home
`TargetSpec`

Có thể gồm:
- scope;
- relation;
- count;
- target kind;
- geometry.

### Lý do
Self/Ally/Enemy là Target relationship/facet, không phải effect capability độc lập.

Cố Sự/AI vẫn query được qua Capability Index.

---

## 12.4 Area / selection mode — không phải Functional Tag trong vNext

### Legacy IDs removed
- `AOE_FIXED`
- `AOE_RANDOM`
- `TARGET_SELECTION`

### Canonical home
- `TargetSpec.selectionRule`
- `AreaSpec.geometry`
- `TargetSpec.count`
- `TargetLock/Requery policy`

### Migration
Legacy `AOE_RANDOM` không được giữ nguyên chỉ vì tên cũ.

Một mechanic:
> random 3 enemy

nên được mô tả kiểu:
- relation = ENEMY;
- selectionRule = RANDOM;
- count = 3;

chứ không buộc gọi là “AOE”.

Một mechanic:
> đánh cả cột

dùng:
- Geometry = COLUMN;
- Area Resolution = FIXED;
không cần Tag `AOE_FIXED`.

---

## 12.5 Trigger configuration — không phải Functional Tag trong vNext

### Legacy IDs removed
- `AUTO_TRIGGER`
- `THRESHOLD_TRIGGER`
- `DAMAGE_TRIGGER`
- `ACTION_COUNTER`

### Candidate cũ không thêm
- `DEATH_TRIGGER`

### Canonical home
`TriggerSpec`, `ConditionSpec`, `CounterSpec`

Ví dụ:

“Khi một enemy DEATH_CONFIRMED và count đạt 3” có thể biểu diễn:

- event = `DEATH_CONFIRMED`
- observerRelation = ENEMY
- counter.increment = 1
- threshold = 3

Không cần Tags:
- DEATH_TRIGGER
- ACTION_COUNTER
- THRESHOLD_TRIGGER

---

## 12.6 Final Damage Reduction — không phải Tag riêng trong vNext

### Legacy ID removed
- `FINAL_DAMAGE_REDUCTION`

### Canonical representation
Tag:
`DAMAGE_REDUCTION`

Schema/Contract field:
`reductionPhase = FINAL`

### Lý do
“Final” là phase của cùng semantic giảm Damage.

Nếu sau stress test chứng minh final reduction có một semantic capability khác ngoài phase:
> có thể mở lại Candidate Review.

Hiện tại không đủ lý do để giữ hai Tag cho cùng core logic.

---

## 12.7 Divine Nature — không phải Functional Tag mặc định

### Legacy ID removed from Functional Registry
- `DIVINE_NATURE`

### Canonical home
`AxiomIdentity / Character-System Metadata`

Ability thực sự:
- grant;
- remove;
- bypass;
- suppress;
- mutate;
Thần Tính trong tương lai có thể cần một **interaction tag mới**, nhưng không được dùng `DIVINE_NATURE` như tag của mọi Ability thuộc character có Thần Tính.

---

## 12.8 Uniqueness — không phải Functional Tag mặc định

### Legacy ID removed from Functional Registry
- `UNIQUENESS`

### Canonical home
`AxiomIdentity / Definition-System Metadata`

Effect tương tác trực tiếp với Duy Nhất có thể dùng:
- structured SystemInteraction;
- hoặc Candidate Tag riêng trong tương lai nếu queryability chứng minh cần.

Không dùng `UNIQUENESS` Functional Tag chỉ để nói:
> definition này có Axiom Duy Nhất.

---

# 13. CANDIDATE TAGS CỐ Ý CHƯA CANONICALIZE

Chặng C không cố “đủ mọi mechanic tương lai”.

Tag chỉ được thêm khi có stress-test và semantic boundary đủ mạnh.

---

## 13.1 EXECUTE

**Status:** DEFERRED

Concept có thể là:
> conditional lethal effect khiến target đi tới confirmed-death outcome theo một rule riêng.

Nhưng hiện chưa khóa:
- Execute là Damage hay lifecycle effect;
- có đi qua HP_ZERO không;
- có Death Prevention không;
- Authority xử lý thế nào;
- target threshold đọc lúc nào;
- có cần capability query riêng ngoài EffectSpec hay không.

Do đó:
> chưa thêm Tag `EXECUTE`.

---

## 13.2 DEATH_TRIGGER

**Status:** REJECTED AS FUNCTIONAL TAG FOR NOW

Semantic Trigger quan sát DEATH_CONFIRMED là thật.

Nhưng canonical home đã rõ:
`TriggerSpec.event = DEATH_CONFIRMED`.

Nếu sau này Story/AI bắt buộc query capability này bằng Tag mà Schema facet không đủ:
> mở lại review.

---

## 13.3 OVERHEAL

**Status:** NOT A TAG

Overheal là Healing outcome/value:

`requestedHeal - actualRestorableHP`

Không phải capability độc lập của Heal.

Effect chuyển Overheal thành stat có thể dùng:
- trigger/condition trên `OVERHEAL`;
- effect `STAT_MODIFIER`.

---

## 13.4 LIFESTEAL

**Status:** DEFERRED

Có semantic thật:
> Heal dựa trên qualifying Actual HP Damage.

Nhưng hiện có thể composition hóa bằng:
- Damage;
- aggregate Actual HP Damage;
- Heal formula referencing result.

Chỉ thêm `LIFESTEAL` khi:
- kit/system cần query “lifesteal capability” như semantic identity,
không chỉ execution formula.

---

## 13.5 REFLECT

**Status:** DEFERRED

Reflected Damage có lifecycle/recursion semantics riêng nhưng chưa có đủ Tag-use case trong current corpus.

Có thể biểu diễn bằng:
- Damage Source relation;
- reaction/effect spec;
- recursion guard.

---

## 13.6 SACRIFICE

**Status:** DEFERRED

Terminology giữ Sacrifice riêng vì lifecycle semantics có thể khác HP Loss/Cost.

Chưa có canonical corpus đủ để xác định:
- Tag riêng;
- HP Cost subtype;
- lifecycle effect type.

Không ép vào `SELF_HP_COST`.

---

## 13.7 REMOVAL / ERASE

**Status:** DEFERRED

`REMOVED`, `DESPAWNED`, `FUSION_CONSUMED`, `ERASED` là lifecycle states/transitions.

Chưa biến chúng thành Tags.

Nếu một Ability trực tiếp “erase existence” cần queryable capability:
> review candidate `ERASURE` sau.

---

## 13.8 NARRATIVE TAG NAMESPACE

**Status:** DEFERRED

Không thêm ngay:
- UNBREAKABLE
- GODSLAYER
- UNFAILING
- CURSE_RESISTANT
hoặc lore property tương tự.

Phải tách:
- Functional Capability;
- Story Requirement;
- Narrative Claim;
- Realized Property;
- Axiom/Authority.

---

# 14. LEGACY → vNext MIGRATION TABLE

## 14.1 Removed as Tag

| Legacy ID | vNext canonical home |
|---|---|
| `PASSIVE` | `AbilityType=PASSIVE` |
| `BASIC_ATTACK` | `AbilityType=BASIC_ATTACK` / `ActionIdentity=BASIC_ATTACK` |
| `SKILL` | `AbilityType=SKILL` |
| `ULTIMATE` | `AbilityType=ULTIMATE` |
| `FORCED_ACTION` | `ActionBehavior=FORCED_ACTION` |
| `FOLLOW_UP` | `ActionBehavior=FOLLOW_UP` |
| `COUNTER` | `ActionBehavior=COUNTER` |
| `REACTION` | `Trigger/ActionBehavior` |
| `TARGET_SELF` | `TargetSpec.scope/relation=SELF` |
| `TARGET_ALLY` | `TargetSpec.relation=ALLY` |
| `TARGET_ENEMY` | `TargetSpec.relation=ENEMY` |
| `TARGET_AOE` | `TargetSpec.count/AreaSpec` |
| `AOE_FIXED` | `AreaSpec.geometry/resolution=FIXED` |
| `AOE_RANDOM` | `TargetSpec.selection=RANDOM + count>1` |
| `TARGET_SELECTION` | `TargetSpec / TargetSelectionRule` |
| `AUTO_TRIGGER` | `TriggerSpec.activation=AUTO` |
| `THRESHOLD_TRIGGER` | `ConditionSpec.threshold` |
| `DAMAGE_TRIGGER` | `TriggerSpec.event/source=DAMAGE_*` |
| `ACTION_COUNTER` | `CounterSpec` |
| `FINAL_DAMAGE_REDUCTION` | `DAMAGE_REDUCTION + reductionPhase=FINAL` |
| `DIVINE_NATURE` | Axiom Identity/System Metadata |
| `UNIQUENESS` | Axiom Identity/System Metadata |

---

## 14.2 Kept and refined

- `DAMAGE`
- `HEAL`
- `SHIELD`
- `BUFF`
- `DEBUFF`
- `MARK`
- `DEBUFF_CLEANSE`
- `STAT_MODIFIER`
- `RESOURCE_MODIFIER`
- `POSITION_MUTATION`
- `FIELD`
- `PHYSICAL_DAMAGE`
- `WILL_DAMAGE`
- `TRUE_DAMAGE`
- `PENETRATION`
- `DAMAGE_REDUCTION`
- `IMMUNITY`
- `TARGET_EXCLUSION`
- `DEATH_PREVENTION`
- `REVIVE`
- `REINCARNATION`
- `SUMMON`
- `ARENA`
- `AIRBORNE`
- `POSITION_MARK`
- `SELF_HP_COST`

---

## 14.3 Added in vNext because current semantic corpus requires them

- `SHIELD_PIERCING`
- `HP_LOSS`
- `MAX_HP_MUTATION`
- `TEMPORARY_ABSENCE`
- `COMBAT_DEFINITION_INHERITANCE`

### Why these were added

`SHIELD_PIERCING`
> required to preserve canonical distinction `True Damage ≠ Shield Piercing`.

`HP_LOSS`
> required because non-Damage HP reduction that is not Cost cannot be mislabeled `SELF_HP_COST`.

`MAX_HP_MUTATION`
> multiple current kits manipulate Max HP with lifecycle reconciliation; generic `STAT_MODIFIER` is too weak a boundary.

`TEMPORARY_ABSENCE`
> Luân Hồi Chi Chủ proves “alive but not present on active battlefield, then return” is distinct from Position Mutation, Death, Arena and Remove.

`COMBAT_DEFINITION_INHERITANCE`
> Pygmalion/Luân Hồi-style systems require queryable behavior-definition inheritance while preserving host identity/presentation/stat layers.

---

# 15. TAG COMPOSITION EXAMPLES

Các ví dụ dưới đây minh họa semantic composition, không phải final Ability Schema syntax.

---

## 15.1 Pure Physical Damage

Effect:
> gây 100% ATK Physical Damage.

Tags:
- `DAMAGE`
- `PHYSICAL_DAMAGE`

Không cần:
- TARGET_ENEMY
- BASIC_ATTACK
- SKILL

Những thứ đó ở Schema Facet.

---

## 15.2 Mixed Basic Attack

Effect:
> 100% ATK Physical + 100% WIL Will.

Tags:
- `DAMAGE`
- `PHYSICAL_DAMAGE`
- `WILL_DAMAGE`

Không cần Tag:
- `MIXED_DAMAGE`

Vì Mixed là composition:
> một Damage Effect có nhiều component type.

Nếu tooling muốn hiển thị “Mixed”:
> derive từ profile có ≥2 distinct component types.

---

## 15.3 True Damage vẫn bị Shield chặn

Effect:
> 20% component là True Damage nhưng không xuyên Shield.

Tags:
- `DAMAGE`
- `TRUE_DAMAGE`

Không có:
- `SHIELD_PIERCING`

---

## 15.4 True Damage xuyên Shield

Effect:
> True Damage đi thẳng HP, bypass Shield.

Tags:
- `DAMAGE`
- `TRUE_DAMAGE`
- `SHIELD_PIERCING`

Hai capability độc lập.

---

## 15.5 Skill copy Basic Attack Damage Profile

Ability Type:
- `SKILL`

Action Identity:
- `SKILL`

Effect tags:
- `DAMAGE`
- damage component tags tương ứng.

Không gắn Tag:
- BASIC_ATTACK

Dù formula được lấy từ Basic Attack Damage Profile.

---

## 15.6 Follow-up Basic behavior

Action Behavior:
- FOLLOW_UP

Action Identity:
- tùy Contract có thể BASIC_ATTACK hoặc special follow-up identity.

Effect tags:
- `DAMAGE`
- component tags.

Không có Tag `FOLLOW_UP`.

Mechanic query:
> “đây có phải Follow-up không?”
đọc `ActionBehavior`.

---

## 15.7 Forgotten

State/effect có:
- `TARGET_EXCLUSION`

Presentation:
- visibility hidden đối với observer thích hợp.

Không có:
- `IMMUNITY` chỉ vì không target được;
- `FIELD`;
- `POSITION_MUTATION`.

Fixed AoE vẫn có thể hit.

---

## 15.8 Post-action mất 1% HP nhưng không phải Cost

Nếu canonical character decision xác nhận:
> HP tự mất sau Action như hậu quả bắt buộc, không phải payment.

Tag:
- `HP_LOSS`

Không:
- `SELF_HP_COST`
- `DAMAGE`

Nếu user xác nhận đó thực sự là payment để nhận effect:
> mới chuyển sang `SELF_HP_COST`.

---

## 15.9 Pay 5% Max HP để trigger

Tag:
- `SELF_HP_COST`

CostSpec:
- resourceKind = Current HP;
- amount = 5% Max HP;
- payment rule = non-Damage.

Không:
- `HP_LOSS` nếu source-of-truth semantic là Cost;
- `DAMAGE`.

---

## 15.10 Temporary Max HP reduction

Tag:
- `MAX_HP_MUTATION`

Có thể cùng:
- `STAT_MODIFIER` **không bắt buộc** nếu normalized schema coi Max HP Mutation là specialized stat operation.

vNext recommendation:
> dùng specialized `MAX_HP_MUTATION`, không cần duplicate `STAT_MODIFIER` chỉ để nói Max HP là stat.

---

## 15.11 Pygmalion Puppet inheritance

Effect/system operation:
- create Puppet → có thể `SUMMON` **chỉ nếu Puppet canonical object model được xác định là Summon**.
- inherit combat behavior → `COMBAT_DEFINITION_INHERITANCE`
- route Chân Ngã → `REINCARNATION`

Không dùng:
- `REVIVE`
- `BASIC_ATTACK`
- `UNIQUENESS`
trừ child semantic thật sự cần.

**Important unresolved object classification:**
Puppet có thể là special Summon-like Combat Unit; exact `SUMMON` attachment phải được Pygmalion Contract chốt.

---

## 15.12 Luân Hồi Chi Chủ Skill 2

Main semantic:
- `TEMPORARY_ABSENCE`
- `HEAL`
- `MAX_HP_MUTATION`

Không:
- `REVIVE`
- `REINCARNATION`
chỉ vì tên Skill/lore có chữ Luân Hồi nếu operation không đưa Chân Ngã vào Reincarnation.

Lore name không quyết định Tag.

---

# 16. STORY / CAPABILITY QUERY EXAMPLES

## 16.1 Story cần actor gây True Damage

Requirement:
- Functional Tag contains `TRUE_DAMAGE`.

Không cần biết:
- Ability là Skill hay Ultimate trừ Story yêu cầu thêm.

---

## 16.2 Story cần Ultimate gây True Damage

Requirement:
- `abilityType = ULTIMATE`
AND
- Tag contains `TRUE_DAMAGE`.

Không tạo Tag:
`TRUE_DAMAGE_ULTIMATE`.

---

## 16.3 Story cần Ability target Ally và Heal

Requirement:
- `targetRelation includes ALLY`
AND
- Tag contains `HEAL`.

Không tạo:
- `TARGET_ALLY`
- `ALLY_HEAL`.

---

## 16.4 Story cần auto reaction khi DEATH_CONFIRMED

Requirement:
- `trigger.activation = AUTO`
- `trigger.event = DEATH_CONFIRMED`

Nếu effect sau trigger là Revive:
- Tag `REVIVE`.

Không cần:
- AUTO_TRIGGER
- DEATH_TRIGGER
làm Tags.

---

## 16.5 Story cần character có Thần Tính

Requirement:
- `axiomIdentity = DIVINE_NATURE`

Không query Functional Tag `DIVINE_NATURE`.

---

# 17. TAG GOVERNANCE

## 17.1 Exact-entry rule

Mọi Canonical Tag phải có đúng 7 field:

1. `ID`
2. `Tên Việt`
3. `Tên Anh`
4. `Definition`
5. `Semantic Boundary`
6. `Includes`
7. `Does Not Include`

Không thêm field tùy tiện cho Tag riêng.

---

## 17.2 No alias rule

Không tạo:
- PURIFY
- CLEANSE
- REMOVE_DEBUFF

nếu cùng semantic với:
`DEBUFF_CLEANSE`.

---

## 17.3 No lore-tag rule

Tên skill/character/lore không tự tạo Tag.

Ví dụ:
Skill tên “Ẩn Nhập Luân Hồi” không mặc định mang `REINCARNATION` nếu effect chỉ Temporary Absence.

---

## 17.4 No parameter-tag rule

Không tạo Tag:
- THREE_TARGETS
- COST_25_AE
- DURATION_2_TURNS
- THRESHOLD_30_PERCENT
- FINAL_PHASE

---

## 17.5 No presentation-tag rule

Không tạo gameplay Tag chỉ vì:
- animation;
- VFX;
- voice;
- camera;
- invisible rendering.

Nếu presentation có gameplay effect:
> gameplay semantic phải được khai báo riêng.

---

## 17.6 No negative-tag rule

Không tạo:
- NOT_DAMAGE
- NO_SHIELD_PIERCE
- CANNOT_REVIVE
- NOT_NATURAL_ACTION

Absence/constraint dùng:
- Schema;
- Condition;
- State;
- Contract;
- exclusion field.

---

## 17.7 No character-specific-tag rule

Không tạo:
- SILAS_SHOT
- PYGMALION_PUPPET_ATTACK
- MEMORY_GOD_REVIVE

nếu semantic có thể composition từ canonical pieces.

---

## 17.8 New Tag proposal rule

Mọi proposal phải cung cấp:

- candidate seven-field definition;
- nearest existing Tag;
- exact semantic boundary difference;
- at least one real kit/system use case;
- reason Schema Facet không đủ;
- queryability use case;
- whether capability can be derived instead.

Nếu không trả lời được:
> reject/defer.

---

## 17.9 Deprecation rule

Nếu hai Tags về sau được chứng minh cùng semantic:

1. chọn một Canonical ID;
2. migrate data;
3. legacy ID chỉ tồn tại trong migration map;
4. runtime không tiếp tục support hai aliases vô hạn.

---

## 17.10 Tag versioning rule

Tag semantic không được đổi nghĩa âm thầm.

Nếu Definition thay đổi boundary:
- version;
- migration note;
- affected character audit.

---

# 18. TAG AGGREGATION & DERIVATION

## 18.1 Explicit vs Derived

Một effect có explicit Tags.

Ability-level Capability Index có thể derive union của child semantic để search/tooling.

Ví dụ Ultimate:
- child A `DAMAGE + TRUE_DAMAGE`
- child B `HEAL`

Ability derived capabilities:
- DAMAGE
- TRUE_DAMAGE
- HEAL

Nhưng runtime effect B không tự có TRUE_DAMAGE.

---

## 18.2 Do not propagate downward

Parent Tag không tự gắn xuống mọi child.

Ví dụ:
Ability-level search cho thấy `HEAL`.
Không có nghĩa từng Damage Packet là Heal.

---

## 18.3 Do not propagate across source lineage

Pygmalion Ultimate mang Damage Attribution Pygmalion không làm inherited Puppet Combat Definition nhận Tags vĩnh viễn từ Pygmalion.

Tag thuộc semantic object đang resolve, không phải attribution owner mặc định.

---

# 19. TAG QUERY SEMANTICS

## 19.1 `HAS_TAG`

Query true khi canonical semantic object trực tiếp hoặc derived index hợp lệ chứa Tag.

Query caller phải biết đang hỏi:
- Effect?
- Ability?
- Character capability index?
- State?
- Combat Object?

Không dùng một `hasTag` global không scope.

---

## 19.2 `HAS_CAPABILITY`

Higher-level query có thể đọc:
- Functional Tags;
- Schema Facets;
- System Metadata.

`HAS_CAPABILITY` không đồng nghĩa `HAS_TAG`.

---

## 19.3 Story Requirements

Narrative System nên query:
`CapabilityRequirement`

thay vì chỉ list Tag IDs.

Điều này tránh nhu cầu tạo hàng trăm Tags cho:
- target scope;
- trigger mode;
- Ability Type;
- Rank/Class;
- Authority;
- geometry.

---

# 20. STRESS-TEST COVERAGE

Tag Registry vNext phải đủ semantic cho current hard corpus mà không fake bằng Tag thừa.

---

## 20.1 SSR Warrior — True Damage / Overheal / Turn Boundary

Needed Tags:
- `DAMAGE`
- `PHYSICAL_DAMAGE`
- `WILL_DAMAGE`
- `TRUE_DAMAGE`
- `HEAL`
- `HP_LOSS` hoặc `SELF_HP_COST` sau khi exact mechanic được chốt
- `MAX_HP_MUTATION`
- `STAT_MODIFIER`
- `RESOURCE_MODIFIER`
- `DEBUFF`
- `IMMUNITY` nếu Skill 3 được normalized như same-Debuff Identity immunity

Not Tags:
- BASIC_ATTACK
- SKILL
- ULTIMATE
- Turn Boundary
- sequential
- threshold
- Authority

Kết quả:
Tag Registry không cần biết Ultimate dual-cast order; Contract/Schema xử lý.

---

## 20.2 Hoá Thân Ký Ức Chi Chủ

Needed Tags:
- `REVIVE`
- `TARGET_EXCLUSION`
- `DAMAGE`
- `TRUE_DAMAGE`
- `HEAL`
- có thể `STAT_MODIFIER` tùy normalized snapshot effect

Not Tags:
- DEATH_TRIGGER
- AUTO_TRIGGER
- TARGET_ENEMY
- AOE_FIXED
- DIVINE_NATURE

Thần Tính:
- Axiom metadata.

Forgotten:
- `TARGET_EXCLUSION` + presentation/visibility state.

Skill 2:
- TriggerSpec observes Damage Action completion;
- effect `DAMAGE + TRUE_DAMAGE`.

---

## 20.3 Luân Hồi Chi Chủ

Needed Tags:
- `REINCARNATION`
- `TEMPORARY_ABSENCE`
- `MAX_HP_MUTATION`
- `HEAL`
- `DAMAGE`
- `MARK`
- possibly `COMBAT_DEFINITION_INHERITANCE`
- `ARENA` only for abilities that actually interact Arena, not merely because character can exist in Arena.

Not Tags:
- DIVINE_NATURE
- UNIQUENESS
- ULTIMATE
- RANDOM_AOE
- Natural Action count.

---

## 20.4 Cố Sự Chi Thần

The Narrative subsystem intentionally does **not** force dozens of Tags.

Capability examples can use:
- `TRUE_DAMAGE`
- `HEAL`
- `SHIELD`
- `DEBUFF_CLEANSE`
- `REVIVE`
- `IMMUNITY`
plus Schema Facets and system metadata.

Narrative-specific properties:
- Story;
- Belief;
- Proof;
- Realization;
remain subsystem state/metadata unless later cross-character query proves Tag need.

---

## 20.5 Pygmalion

Needed semantic:
- `REINCARNATION`
- `COMBAT_DEFINITION_INHERITANCE`
- `RESOURCE_MODIFIER`
- `SELF_HP_COST` if Skill 1 payment uses HP Cost
- possibly `SUMMON` depending canonical Puppet object classification
- Damage tags of inherited/basic effects.

Not Tags:
- FOLLOW_UP
- BASIC_ATTACK
- Life Cycle count
- same-rank
- one Puppet per life
- Damage Attribution

Those live in:
- Action Behavior;
- Action Identity;
- LifecycleQuota;
- parameters;
- AttributionSpec.

---

# 21. CANONICAL TAG COUNT

vNext currently defines **28 Canonical Functional Tags**:

1. DAMAGE
2. HEAL
3. SHIELD
4. BUFF
5. DEBUFF
6. MARK
7. DEBUFF_CLEANSE
8. STAT_MODIFIER
9. RESOURCE_MODIFIER
10. POSITION_MUTATION
11. FIELD
12. PHYSICAL_DAMAGE
13. WILL_DAMAGE
14. TRUE_DAMAGE
15. PENETRATION
16. DAMAGE_REDUCTION
17. SHIELD_PIERCING
18. HP_LOSS
19. SELF_HP_COST
20. MAX_HP_MUTATION
21. IMMUNITY
22. TARGET_EXCLUSION
23. AIRBORNE
24. POSITION_MARK
25. DEATH_PREVENTION
26. REVIVE
27. REINCARNATION
28. TEMPORARY_ABSENCE
29. SUMMON
30. ARENA
31. COMBAT_DEFINITION_INHERITANCE

**Correction:** actual total is **31**, not 28.

This correction is written explicitly to prevent a silent counting error from becoming project metadata.

Canonical count for this version:

> **31 Functional Tags**

Count can grow only through governance review.

---

# 22. WHY THE REGISTRY IS SMALLER THAN LEGACY

Legacy mixed together:

- taxonomy;
- schema fields;
- trigger configuration;
- action behavior;
- target configuration;
- Axiom identity;
- effect semantics.

vNext separates them.

### Legacy style
`SKILL + TARGET_ENEMY + AOE_RANDOM + DAMAGE + TRUE_DAMAGE + AUTO_TRIGGER`

### vNext style

Schema:
- AbilityType = SKILL
- TargetRelation = ENEMY
- Selection = RANDOM
- Count = N
- TriggerActivation = AUTO

Tags:
- DAMAGE
- TRUE_DAMAGE

Kết quả:
- ít duplicate;
- semantic rõ hơn;
- Tag Registry ổn định hơn;
- Primitive mapping dễ hơn;
- AI không phải đoán xem “AOE_RANDOM là Tag hay target rule”.

---

# 23. PRIMITIVE BOUNDARY PREVIEW

Chặng C **không tạo Primitive**, nhưng Tag decisions tạo ranh giới cho Chặng D.

Ví dụ:

Tag:
`TRUE_DAMAGE`

không đòi Primitive tên:
`TrueDamagePrimitive`.

Kernel có thể dùng:
- BuildDamagePacket
- ResolveDamageComponent
- ShieldInteraction
- CommitHPDamage

với component type/contract parameters.

Tag:
`REVIVE`

có thể cần nhiều operation:
- ValidateReviveEligibility
- CreateRevivePending
- RestoreLifeState
- MaterializeEntity
- RestoreSelectedState

Tag:
`COMBAT_DEFINITION_INHERITANCE`

có thể cần:
- ResolveDefinitionSource
- ValidateInheritance
- BindBehaviorDefinition
- PreserveHostLayers
- RebuildCapabilityIndex

Do đó:

> **Tag Registry không được dùng như danh sách tên Primitive.**

---

# 24. ABILITY SCHEMA REQUIREMENTS EXPOSED BY TAG vNext

Chặng E phải có structured fields đủ để những semantic đã bị loại khỏi Tag vẫn query được.

Required facets include at least:

## Ability
- abilityType
- abilityId

## Action
- actionIdentity
- actionBehavior
- parentAction
- childAction policy

## Trigger
- activation mode
- event
- condition
- threshold
- counter
- cap/frequency
- cooldown clock

## Target
- target kind
- relation/scope
- candidate filter
- selection rule
- count
- geometry
- duplicate policy
- reroll policy
- target lock/re-query

## Damage
- component type
- formula
- penetration
- reduction phase
- Shield policy
- attribution

## State
- state identity
- duration clock
- lifecycle

## Authority
- authority tier
- dynamic authority
- composite inheritance policy

## System
- Axiom Identity
- system interaction
- Combat Instance interaction

Nếu Schema không có các facets này:
> việc xóa legacy Tags sẽ làm mất information.

Do đó đây là hard requirement cho Ability Schema.

---

# 25. COMPILER / VALIDATOR RULES RECOMMENDED

Tooling sau này nên reject hoặc warn các trường hợp:

## Error
Ability có:
`abilityType=ULTIMATE`
và Tag `ULTIMATE`.

Reason:
> Ability Type duplicated as Functional Tag.

---

## Error
Damage có:
`TRUE_DAMAGE`
nhưng schema tự suy ra True Damage từ `penetration=100%` mà không explicit component type.

Reason:
> 100% penetration không canonicalize thành True Damage.

---

## Error
Effect có:
`SELF_HP_COST`
nhưng không có CostSpec/payment semantics.

Reason:
> Tag boundary violated.

---

## Error
Effect có:
`TARGET_EXCLUSION`
và engine tự remove entity khỏi geometry.

Reason:
> Target Selection ≠ Area Resolution.

---

## Warning
Effect có:
`DAMAGE_REDUCTION`
và custom Tag `FINAL_DAMAGE_REDUCTION`.

Reason:
> vNext deprecates final reduction as separate Tag; use phase field.

---

## Error
Character mang Thần Tính và tất cả abilities tự được gắn `DIVINE_NATURE`.

Reason:
> Axiom Identity ≠ Functional Tag.

---

## Error
Pygmalion inherited behavior thay đổi Damage Attribution chỉ vì Behavior Source đổi.

Reason:
> Behavior Source ≠ Damage Attribution.

Tag system không trực tiếp sửa attribution, nhưng validator phải giữ distinction.

---

# 26. FILE PRECEDENCE AFTER STAGE C

Sau Chặng C, semantic source priority đề xuất:

1. newest user correction;
2. `01_TERMINOLOGY_vNext.md`;
3. `02_TAG_vNext.md`;
4. `00_CANONICAL_RECOVERY_AUDIT.md`;
5. character standardized files;
6. legacy `terminology.md`;
7. legacy `tag.md`;
8. assistant inference.

### Important

`tag.md` legacy lúc này không còn cần cho runtime/canonical design.

Nó chỉ còn:
> historical migration evidence.

Nếu user không cần giữ lịch sử:
> có thể xóa sau khi `02_TAG_vNext.md` được chấp nhận.

---

# 27. OPEN TAG QUESTIONS AFTER STAGE C

Chỉ các câu hỏi thực sự chưa đủ bằng chứng mới còn mở:

1. `EXECUTE` có cần Functional Tag không?
2. `LIFESTEAL` có cần Tag hay chỉ composition formula?
3. `REFLECT` có cần Tag hay reaction/damage-source spec đủ?
4. `SACRIFICE` có cần Tag riêng?
5. direct `ERASURE` có cần Tag khi character tương ứng được stress-test?
6. Narrative Property có cần namespace riêng?
7. Một ability trực tiếp bypass Thần Tính có cần candidate tag kiểu `DIVINE_NATURE_INTERACTION` hay SystemInteraction field đủ?
8. Một ability trực tiếp sửa Duy Nhất có cần Tag riêng hay SystemInteraction field đủ?
9. Puppet canonical object type có phải Summon không?
10. Max HP Mutation có cần đồng thời `STAT_MODIFIER` derived capability hay chỉ specialized tag?
11. Một effect chỉ “remove Shield” có `SHIELD` hay nên có future `SHIELD_REMOVAL` nếu query semantics yêu cầu?
12. Status control taxonomy ngoài `AIRBORNE` như STUN/FREEZE/ROOT sẽ được Tag hóa tới mức nào?

Không trả lời các câu này bằng suy đoán.

Stress-test character mới sẽ quyết định.

---

# 28. STAGE C ACCEPTANCE CHECKLIST

`02_TAG_vNext.md` đạt yêu cầu nếu:

- [x] Ability Type không còn là Functional Tag.
- [x] Action Behavior không bị duplicate thành Functional Tag.
- [x] Target Scope không bị duplicate thành Tag.
- [x] Trigger configuration không bị duplicate thành Tag.
- [x] Authority/Axiom Identity không bị nhét vào Tag Registry.
- [x] One semantic → one Tag.
- [x] Tag entries có đúng 7 fields.
- [x] True Damage tách Shield Piercing.
- [x] HP Loss tách Self HP Cost.
- [x] Max HP Mutation có semantic riêng.
- [x] Revive tách Death Prevention.
- [x] Target Exclusion không đồng nghĩa AoE immunity.
- [x] Position Mark tách Actor Mark.
- [x] Combat Definition Inheritance được biểu diễn riêng.
- [x] Capability query vẫn hỗ trợ Story/AI thông qua Tag + Schema Facet + Metadata.
- [x] Final Damage Reduction không giữ duplicate Tag chỉ vì phase.
- [x] Narrative Properties chưa bị tạo Tag hàng loạt.
- [x] `EXECUTE` chưa bị canonicalize khi thiếu evidence.
- [x] `DEATH_TRIGGER` giữ ở TriggerSpec thay vì Tag.
- [x] Registry không ánh xạ 1:1 sang Primitive.

---

# 29. FINAL CANONICAL SUMMARY

Tag vNext không cố mô tả toàn Arclune bằng Tag.

Nó chỉ giữ các semantic capability/effect identities có lý do cross-system rõ ràng:

### Core Effects
- DAMAGE
- HEAL
- SHIELD
- BUFF
- DEBUFF
- MARK
- DEBUFF_CLEANSE
- STAT_MODIFIER
- RESOURCE_MODIFIER
- POSITION_MUTATION
- FIELD

### Damage Capabilities
- PHYSICAL_DAMAGE
- WILL_DAMAGE
- TRUE_DAMAGE
- PENETRATION
- DAMAGE_REDUCTION
- SHIELD_PIERCING

### HP / Max HP
- HP_LOSS
- SELF_HP_COST
- MAX_HP_MUTATION

### Status / Targetability
- IMMUNITY
- TARGET_EXCLUSION
- AIRBORNE

### Position
- POSITION_MARK

### Life / Death
- DEATH_PREVENTION
- REVIVE
- REINCARNATION
- TEMPORARY_ABSENCE

### Entity / System
- SUMMON
- ARENA
- COMBAT_DEFINITION_INHERITANCE

Total:

> **31 Canonical Functional Tags**

Mọi thứ khác được query qua:
- Schema Facets;
- System/Axiom Metadata;
- Parameters;
- State;
- Contracts.

Đây là ranh giới được chọn để giữ Tag Registry:
- đủ mạnh cho semantic composition;
- đủ nhỏ để không trở thành một ngôn ngữ lập trình trá hình;
- đủ ổn định để 200+ Character không tạo hàng trăm alias;
- đủ queryable cho AI/Narrative/Story systems;
- và không khóa Primitive implementation quá sớm.

---

# 30. NEXT STAGE

Sau khi user review/chấp nhận Chặng C:

> **Chặng D — `03_PRIMITIVE.md`**

Chặng D phải xuất phát từ:
- `01_TERMINOLOGY_vNext.md`;
- `02_TAG_vNext.md`;
- stress-test corpus.

Không được tạo:
> một Primitive cho mỗi Tag.

Primitive Registry phải được thiết kế từ **state operations và resolution responsibilities**, sau đó chứng minh rằng các Character khó có thể composition từ chúng.
