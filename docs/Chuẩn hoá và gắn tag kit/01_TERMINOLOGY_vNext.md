# ARCLUNE — TERMINOLOGY vNext
## Canonical Combat, Runtime & System Terminology
**Version:** 2026-09-10-B  
**Stage:** Chặng B — Terminology Reconstruction  
**Source basis:** `terminology.md` + `00_CANONICAL_RECOVERY_AUDIT.md` + các correction hiện hành của user được Audit ghi nhận.  
**Scope:** định nghĩa nghĩa canonical của khái niệm. File này **không** phải Tag Registry, Primitive Registry, Ability Schema, Contract hay Kernel implementation.

---

# 0. MỤC ĐÍCH VÀ QUY TẮC ĐỌC

`TERMINOLOGY vNext` là từ điển semantic nền của Arclune.

Nó trả lời:

> **“Khái niệm này là gì, khác khái niệm gần nó ở đâu?”**

Nó **không** trả lời đầy đủ:

> “Kernel phải chạy từng bước ra sao?”

Phần đó thuộc `CONTRACTS` và `KERNEL_RUNTIME`.

Nó cũng **không** quyết định:

> “Khái niệm nào chắc chắn phải là Functional Tag?”

Phần đó thuộc `TAG vNext`.

## 0.1 Trạng thái thuật ngữ

Các nhãn sau dùng trong file:

- **CANONICAL CORE** — semantic boundary đủ ổn để dùng làm nền.
- **CANONICAL DEFAULT** — default hiện hành nhưng có thể được Ability/Character/Mode Contract override.
- **MODE-SPECIFIC** — chỉ có nghĩa trong một Mode Profile nhất định.
- **SYSTEM-SPECIFIC** — thuộc subsystem cụ thể như Luân Hồi, Narrative, Arena.
- **UNRESOLVED CONTRACT** — semantic tồn tại nhưng exact timing/order/policy chưa chốt.
- **CHARACTER-SPECIFIC OVERRIDE POSSIBLE** — global terminology cho phép kit riêng override bằng Contract rõ ràng.

## 0.2 Source precedence khi đọc file này

Nếu có conflict trong tương lai:

1. correction mới nhất của user;
2. Terminology vNext mới hơn đã được user chấp nhận;
3. Contract canonical mới hơn;
4. Tag/Primitive/Schema canonical mới hơn nếu chúng chỉ cụ thể hóa chứ không đổi nghĩa;
5. file character chuẩn hóa;
6. legacy files;
7. model inference.

## 0.3 Nguyên tắc không “điền hộ”

Nếu một semantic chưa đủ dữ kiện:

> **giữ UNRESOLVED**

Không được tự chọn một implementation “hợp lý nhất” rồi biến nó thành canon.

---

# 1. KIẾN TRÚC SEMANTIC NỀN

## 1.1 Character as Data
**VI:** Nhân vật là dữ liệu/composition  
**ID:** `CHARACTER_AS_DATA`  
**Status:** CANONICAL CORE

Nguyên tắc kiến trúc:

> **AI khai báo kit bằng semantic + composition; kernel thực thi bằng primitive.**

Tương đương:

> **Character = data/composition. Kernel = behavior/runtime.**

Điều này không có nghĩa mọi mechanic phải được ép thành một Primitive siêu nhỏ. System-level subsystem vẫn được phép tồn tại nếu mechanic thật sự có lifecycle riêng như Arena, Luân Hồi routing hoặc Narrative System.

---

## 1.2 Terminology
**VI:** Thuật ngữ chuẩn  
**ID:** `TERMINOLOGY`  
**Status:** CANONICAL CORE

Tập định nghĩa nghĩa của các khái niệm.

Terminology:
- định nghĩa semantic;
- định nghĩa boundary với concept gần;
- không phải executable behavior;
- không phải list Tag;
- không phải schema instance;
- không phải code.

---

## 1.3 Tag
**VI:** Tag  
**ID:** `TAG`  
**Status:** CANONICAL CORE

Nhãn semantic dùng để mô tả/query một capability, effect identity, system interaction hoặc semantic property khi Tag Registry quyết định concept đó cần tồn tại dưới dạng Tag.

Tag:
- declarative;
- semantic;
- queryable;
- không trực tiếp thực thi behavior;
- không nên chứa value/percentage/duration/cost;
- không được dùng chỉ để lặp một Schema field nếu không có lý do queryability riêng.

---

## 1.4 Canonical Tag
**VI:** Tag chuẩn duy nhất  
**ID:** `CANONICAL_TAG`  
**Status:** CANONICAL CORE

Một Tag đại diện duy nhất cho một semantic boundary trong Tag Registry.

Nguyên tắc:

> **Một semantic → một Canonical Tag.**

Không tạo alias chỉ vì:
- tên lore khác;
- tên Việt/Anh khác;
- Character khác;
- VFX khác;
- cùng logic nhưng wording khác.

---

## 1.5 Functional Tag
**VI:** Tag chức năng  
**ID:** `FUNCTIONAL_TAG`  
**Status:** CANONICAL CORE

Tag mô tả semantic capability/effect/system interaction của Ability/Effect/object được Tag Registry chấp nhận.

Ví dụ lịch sử:
- DAMAGE
- HEAL
- SHIELD
- REINCARNATION

**Lưu ý:** việc một concept tồn tại trong Terminology không tự động chứng minh nó phải là Functional Tag.

---

## 1.6 Primitive
**VI:** Khối hành vi thực thi  
**ID:** `PRIMITIVE`  
**Status:** CANONICAL CORE

Building block behavior mà Kernel có thể thực thi.

Primitive trả lời:

> **“Kernel thực hiện operation nào?”**

Primitive:
- executable;
- parameterized;
- reusable;
- composable;
- deterministic theo Contract;
- không nên chứa tên Character;
- không đồng nghĩa Tag.

Quan hệ:

> **Tag ↔ Primitive là many-to-many.**

Một Tag có thể cần nhiều Primitive.
Một Primitive có thể phục vụ nhiều Tag.

---

## 1.7 Parameter
**VI:** Tham số  
**ID:** `PARAMETER`  
**Status:** CANONICAL CORE

Giá trị cụ thể dùng bởi Ability/Effect/Primitive/Contract.

Ví dụ:
- `25%`
- `20 AE`
- `3 target`
- `2 Natural Actions`
- `30% Max HP`
- threshold `>= 3`

Parameter không phải Tag.

---

## 1.8 Ability Schema
**VI:** Cấu trúc khai báo Ability  
**ID:** `ABILITY_SCHEMA`  
**Status:** CANONICAL CORE

Schema canonical dùng để mô tả Ability bằng data/composition.

Schema có thể chứa:
- Ability Type;
- Action Identity;
- Trigger;
- Condition;
- Cost;
- Target specification;
- Effect/Primitive specification;
- Parameter;
- Duration;
- State;
- Authority;
- Attribution;
- Resolution policy;
- Tag;
- Presentation reference.

---

## 1.9 Contract
**VI:** Hợp đồng phân giải  
**ID:** `CONTRACT`  
**Status:** CANONICAL CORE

Rule canonical định nghĩa exact behavior của một semantic hoặc Primitive khi resolve.

Contract chịu trách nhiệm cho các câu hỏi như:

- snapshot lúc nào;
- target có re-query không;
- simultaneous hay sequential;
- cost trả lúc nào;
- Shield resolve phase nào;
- DEATH_CONFIRMED emit lúc nào;
- child action kế thừa authority thế nào;
- duration tiến theo clock nào;
- same-tier conflict xử lý ra sao.

Terminology định nghĩa **khái niệm**.  
Contract định nghĩa **exact resolution**.

---

## 1.10 Kernel
**VI:** Kernel runtime  
**ID:** `KERNEL`  
**Status:** CANONICAL CORE

Runtime authoritative của combat/system.

Kernel:
- đọc declarative data;
- gọi Primitive;
- áp Contract;
- mutate state;
- emit Event;
- resolve Trigger/Reaction;
- xử lý death/lifecycle;
- advance mode clock/order;
- dùng deterministic RNG;
- ghi Execution Trace.

Kernel không nên giải mechanic thông thường bằng `switch(characterName)`.

---

## 1.11 Mode Profile
**VI:** Hồ sơ luật theo mode  
**ID:** `MODE_PROFILE`  
**Status:** CANONICAL CORE

Tập rule bật/tắt/override semantic runtime cho một game mode.

Mode Profile giải quyết việc:

- cùng roster nhưng combat khác;
- cùng terminology nhưng scheduling khác;
- cùng Character identity nhưng Ability profile khác.

Ví dụ hiện tại:
- Turn-based Mode dùng SSI và Luân Hồi.
- Exploration/Defense Mode hiện không dùng SSI và Luân Hồi.

---

# 2. IDENTITY & DEFINITION

## 2.1 Character
**VI:** Nhân vật  
**ID:** `CHARACTER`  
**Status:** CANONICAL CORE

Một nội dung chiến đấu có Character Definition riêng và có thể sở hữu:

- Ability;
- Rank;
- Class;
- Element;
- stat;
- resource;
- state;
- mode-specific combat profile.

Character là content definition concept, không phải một runtime instance cụ thể.

---

## 2.2 Character Instance
**VI:** Bản thể nhân vật đang tồn tại  
**ID:** `CHARACTER_INSTANCE`  
**Status:** CANONICAL CORE

Một runtime instance cụ thể của Character trong một Combat Instance.

Character Definition và Character Instance không phải cùng concept.

---

## 2.3 Runtime Entity
**VI:** Thực thể runtime  
**ID:** `RUNTIME_ENTITY`  
**Status:** CANONICAL CORE

Bất kỳ object nào được authoritative state nhận diện bằng runtime identity/reference.

Có thể gồm:
- Character Instance;
- Summon;
- NPC;
- Boss;
- Creep;
- Leader;
- Puppet;
- Combat Object;
- Container;
- Field-related object nếu schema yêu cầu.

Không phải mọi Runtime Entity đều có Chân Ngã hoặc natural turn.

---

## 2.4 Combat Unit
**VI:** Đơn vị chiến đấu  
**ID:** `COMBAT_UNIT`  
**Status:** CANONICAL CORE

Runtime Entity có thể tham gia combat state/action theo Mode Profile.

Một Combat Unit có thể có:
- HP;
- Position;
- Action;
- Rage;
- status;
- targetability.

Nhưng các property này không mặc định giống nhau cho mọi unit type.

---

## 2.5 Combat Object
**VI:** Vật thể chiến đấu  
**ID:** `COMBAT_OBJECT`  
**Status:** CANONICAL CORE

Runtime Entity có gameplay state trong Combat Instance nhưng không nhất thiết là Combat Unit/Character.

Ví dụ có thể gồm:
- Kén Luân Hồi;
- deployed Narrative Container;
- objective object;
- destructible system object.

Combat Object không mặc định:
- có Chân Ngã;
- có Natural Action;
- dùng Class/Rank như Character.

---

## 2.6 Identity
**VI:** Bản sắc  
**ID:** `IDENTITY`  
**Status:** CANONICAL CORE

Lớp trả lời:

> **“Đây là ai ở tầng hệ thống/lore?”**

Identity được tách khỏi:
- Presentation Definition;
- Combat Definition;
- runtime Position;
- temporary state.

---

## 2.7 Chân Ngã
**EN:** True Self  
**ID:** `TRUE_SELF`  
**Status:** CANONICAL CORE / SYSTEM-SPECIFIC TO LIFE-CYCLE

Identity cốt lõi của một sinh mệnh trong hệ Luân Hồi.

Chân Ngã không đồng nghĩa với:
- ngoại hình;
- Character Definition hiện tại;
- Combat Definition hiện tại;
- iid;
- lifeSerial.

Một Chân Ngã có thể tiếp tục xuyên qua nhiều đời nếu Contract cho phép.

---

## 2.8 trueSelfId
**VI:** ID Chân Ngã  
**ID:** `TRUE_SELF_ID`  
**Status:** CANONICAL CORE

Định danh ổn định của một Chân Ngã xuyên qua các life state/đời tái sinh hợp lệ.

---

## 2.9 lifeSerial
**VI:** Số đời / mã đời  
**ID:** `LIFE_SERIAL`  
**Status:** CANONICAL CORE + UNRESOLVED GLOBAL CONTRACT

Giá trị phân biệt các life instance khác nhau của cùng Chân Ngã.

Canonical boundary:

- Reincarnation có thể tạo lifeSerial mới.
- Ordinary Revive **không có global rule bắt buộc** phải tăng lifeSerial.
- Character-specific Contract có thể yêu cầu tăng lifeSerial khi Revive.

Ví dụ đã tồn tại trong legacy character:
Hoá Thân Ký Ức Chi Chủ có thiết kế `lifeSerial` tăng khi revive.

Điều đó không tự biến thành global Revive rule.

---

## 2.10 definitionId
**VI:** ID Definition  
**ID:** `DEFINITION_ID`  
**Status:** CANONICAL CORE

Identifier của một Definition/type.

Nó trả lời:

> “Entity này đang tham chiếu definition nào?”

Không dùng `definitionId` để thay thế runtime identity.

---

## 2.11 iid
**VI:** Instance ID  
**ID:** `INSTANCE_ID`  
**Status:** CANONICAL CORE

Unique identifier của runtime instance cụ thể.

Hai entity cùng `definitionId` vẫn phải có `iid` khác nhau.

---

## 2.12 Presentation Definition
**VI:** Định nghĩa hiển thị  
**ID:** `PRESENTATION_DEFINITION`  
**Status:** CANONICAL CORE

Nguồn dữ liệu presentation của entity:

- model/sprite;
- skeleton;
- animation;
- VFX;
- SFX;
- voice presentation;
- fallback presentation.

Presentation Definition có thể khác Combat Definition.

---

## 2.13 Combat Definition
**VI:** Định nghĩa chiến đấu  
**ID:** `COMBAT_DEFINITION`  
**Status:** CANONICAL CORE

Nguồn định nghĩa combat behavior của đời/runtime form hiện tại.

Có thể gồm:
- Passive;
- Basic Attack;
- Skill;
- Ultimate;
- Class;
- Rank;
- damage/effect logic;
- behavior references.

Combat Definition không nhất thiết quyết định Presentation Definition.

---

## 2.14 Combat Definition Inheritance
**VI:** Kế thừa Định nghĩa chiến đấu  
**ID:** `COMBAT_DEFINITION_INHERITANCE`  
**Status:** CANONICAL CORE AS CONCEPT / CONTRACT UNRESOLVED PER SYSTEM

Cơ chế một host entity dùng một Combat Definition khác làm nguồn behavior trong khi vẫn giữ các property host được Contract bảo toàn.

Không được hiểu như:
> “copy/replace toàn bộ mọi field của source definition”.

Phải khai báo:
- property nào kế thừa;
- property nào giữ host;
- Class có đổi không;
- Element có đổi không;
- stat basis có đổi không;
- presentation có đổi không;
- attribution thuộc ai.

Pygmalion và Luân Hồi Chi Chủ đều là stress test của concept này.

---

## 2.15 Combat Instance
**VI:** Phiên giao tranh  
**ID:** `COMBAT_INSTANCE`  
**Status:** CANONICAL CORE

Không gian logic độc lập nơi:
- Runtime Entity;
- Action;
- Event;
- Target Selection;
- state;
- lifecycle;
- authority;
- resource;
được resolve.

Main Battle và Arena có thể là các Combat Instance khác nhau.

---

## 2.16 Main Battle
**VI:** Chiến trường chính  
**ID:** `MAIN_BATTLE`  
**Status:** CANONICAL CORE

Combat Instance chính của encounter.

---

## 2.17 Isolated Combat Instance
**VI:** Phiên giao tranh cô lập  
**ID:** `ISOLATED_COMBAT_INSTANCE`  
**Status:** CANONICAL CORE

Combat Instance tách khỏi Main Battle để resolve subsystem như Arena.

Isolation không tự có nghĩa:
- death law khác;
- Chân Ngã khác;
- World Axiom khác.

Những thứ đó do Combat Instance Contract và World Axiom Contract quyết định.

---

# 3. SOURCE, OWNERSHIP & ATTRIBUTION

## 3.1 Caster
**VI:** Người thi triển  
**ID:** `CASTER`  
**Status:** CANONICAL CORE

Entity thực hiện hoặc khởi tạo một cast/action khi action có caster.

Caster là action-centric.

---

## 3.2 Owner
**VI:** Chủ sở hữu  
**ID:** `OWNER`  
**Status:** CANONICAL CORE

Entity sở hữu/tạo/điều khiển một subordinate runtime object hoặc effect lineage.

Ví dụ:
- Summon owner;
- Mark owner;
- Field owner;
- projectile owner;
- trap owner;
- Container owner.

Owner có thể vẫn là cùng entity dù immediate Source của downstream effect đã khác.

---

## 3.3 Source
**VI:** Nguồn trực tiếp  
**ID:** `SOURCE`  
**Status:** CANONICAL CORE

Runtime origin trực tiếp của một effect/event instance.

Source không tự đồng nghĩa:
- Caster;
- Owner;
- Behavior Source;
- Damage Attribution.

---

## 3.4 Behavior Source
**VI:** Nguồn hành vi  
**ID:** `BEHAVIOR_SOURCE`  
**Status:** CANONICAL CORE

Entity/Definition cung cấp logic behavior đang được thực thi.

Ví dụ:
Pygmalion Puppet có thể dùng Basic Attack behavior từ inherited Combat Definition.

---

## 3.5 Effect Source
**VI:** Nguồn effect  
**ID:** `EFFECT_SOURCE`  
**Status:** CANONICAL CORE

Action/entity được coi là semantic origin của effect instance.

Effect Source dùng khi lineage quan trọng hơn immediate object emitter.

---

## 3.6 Damage Source
**VI:** Nguồn Damage Packet  
**ID:** `DAMAGE_SOURCE`  
**Status:** CANONICAL CORE

Immediate source gắn với Damage Packet.

Damage Source không tự quyết định ai được credit damage.

---

## 3.7 Effect Attribution
**VI:** Quy công effect  
**ID:** `EFFECT_ATTRIBUTION`  
**Status:** CANONICAL CORE

Entity/identity được credit semantic ownership của một effect.

---

## 3.8 Damage Attribution
**VI:** Quy công sát thương  
**ID:** `DAMAGE_ATTRIBUTION`  
**Status:** CANONICAL CORE

Entity/identity được credit damage cho:
- combat statistics;
- damage-based trigger;
- attribution queries;
- downstream kill routing nếu Contract dùng damage credit.

Damage Attribution có thể khác:
- Caster;
- Source;
- Behavior Source.

---

## 3.9 Kill Attribution
**VI:** Quy công tiêu diệt  
**ID:** `KILL_ATTRIBUTION`  
**Status:** CANONICAL CORE

Entity/identity được credit khi target đạt DEATH_CONFIRMED.

Không dùng heuristic:
> “hit cuối cùng nhìn thấy trên animation”.

Kill Attribution phải dựa trên authoritative damage/effect/lifecycle attribution.

---

## 3.10 Trigger Cause
**VI:** Nguyên nhân kích hoạt  
**ID:** `TRIGGER_CAUSE`  
**Status:** CANONICAL CORE

Event/condition instance cụ thể làm Trigger thỏa.

Ví dụ:
- target nhận qualifying Actual HP Damage;
- enemy bước vào Airborne;
- DEATH_CONFIRMED xảy ra;
- Natural Action hoàn tất;
- threshold được đạt.

---

# 4. ABILITY & ACTION

## 4.1 Ability
**VI:** Năng lực  
**ID:** `ABILITY`  
**Status:** CANONICAL CORE

Một definition có thể được Kernel resolve để:
- tạo Action;
- tạo Reaction;
- tạo persistent effect/state;
- cung cấp static behavior.

---

## 4.2 Ability Type
**VI:** Loại Ability  
**ID:** `ABILITY_TYPE`  
**Status:** CANONICAL CORE

Phân loại cấp cao của Ability:

- `PASSIVE`
- `BASIC_ATTACK`
- `SKILL`
- `ULTIMATE`

Ability Type trả lời:

> **“Ability này thuộc loại nào?”**

Nó không mô tả toàn bộ behavior.

**Canonical rule:**
Ability Type không phải Functional Tag.

---

## 4.3 Action
**VI:** Hành động  
**ID:** `ACTION`  
**Status:** CANONICAL CORE

Một runtime resolution unit do Actor/Kernel thực hiện.

Action có thể chứa:
- nhiều Effect;
- nhiều Damage Packet;
- child/internal Action;
- sequential steps;
- simultaneous batch.

---

## 4.4 Action Instance
**VI:** Phiên hành động runtime  
**ID:** `ACTION_INSTANCE`  
**Status:** CANONICAL CORE

Một execution cụ thể của Action trong Combat Instance.

Nên có unique runtime id để trace parent/child, source, target và result.

---

## 4.5 Natural Action
**VI:** Hành động tự nhiên  
**ID:** `NATURAL_ACTION`  
**Status:** CANONICAL CORE / TURN-BASED MODE

Action cơ hội do actor thực hiện trong natural scheduling của SSI.

Basic Attack, Skill hoặc Ultimate do actor tự thực hiện trong natural slot có thể là Natural Action.

Natural Action không mặc định bao gồm:
- Passive Trigger;
- Reaction;
- Follow-up;
- Counter;
- Forced Action;
- damage packet;
- Linked Cast.

---

## 4.6 Action Identity
**VI:** Bản sắc hành động  
**ID:** `ACTION_IDENTITY`  
**Status:** CANONICAL CORE

Nhận dạng action thực sự đang resolve.

Ví dụ:
- Basic Attack action;
- Skill 1 action;
- Ultimate action;
- child Basic Attack;
- system action.

Action Identity khác Ability Type vì một outer Ability có thể tạo child Action identity khác.

---

## 4.7 Action Behavior
**VI:** Hành vi hành động  
**ID:** `ACTION_BEHAVIOR`  
**Status:** CANONICAL CORE

Mô tả cách Action vận hành/scheduling mà không nhất thiết đổi Ability Type.

Ví dụ:
- Follow-up;
- Counter;
- Forced Action;
- Reaction-driven;
- interrupt;
- copied Basic Attack profile;
- child action.

---

## 4.8 Basic Attack
**VI:** Đánh thường  
**ID:** `BASIC_ATTACK_ACTION`  
**Status:** CANONICAL CORE

Action Identity đại diện một Basic Attack thực sự.

Canonical distinction:

> **Dùng damage profile của Basic Attack ≠ thực hiện Basic Attack.**

Do đó:
- Skill copy Basic Attack damage profile không tự trigger mechanic “khi Basic Attack”.
- Follow-up dùng Basic Attack behavior chỉ được tính là Basic Attack nếu Action Contract gán identity đó.

---

## 4.9 Skill
**VI:** Kỹ năng  
**ID:** `SKILL_ABILITY`  
**Status:** CANONICAL CORE

Ability Type đại diện kỹ năng thường.

Không suy ra active/manual/auto chỉ từ Ability Type; Trigger/Action Behavior quyết định điều đó.

---

## 4.10 Ultimate
**VI:** Tuyệt kỹ  
**ID:** `ULTIMATE_ABILITY`  
**Status:** CANONICAL CORE

Ability Type đại diện Ultimate.

Ultimate có thể:
- tạo một Action đơn;
- Composite Action;
- child Skills;
- interrupting behavior;
- special resource policy.

---

## 4.11 Passive
**VI:** Nội tại  
**ID:** `PASSIVE_ABILITY`  
**Status:** CANONICAL CORE

Ability Type đại diện persistent/triggered/static behavior.

Không phải mọi Passive đều Auto Trigger.

Một Passive có thể chỉ cung cấp:
- static modifier;
- rule override;
- listener;
- lifecycle behavior.

---

## 4.12 Composite Action
**VI:** Hành động tổ hợp  
**ID:** `COMPOSITE_ACTION`  
**Status:** CANONICAL CORE

Outer Action chứa nhiều child Action/effect components và resolve theo một Contract chung.

Composite Action phải cho phép khai báo:
- child order;
- child snapshot relation;
- child cost policy;
- child authority inheritance policy;
- reaction boundaries;
- Natural Action behavior;
- attribution.

**Không có global rule rằng outer Authority luôn truyền xuống child.**

---

## 4.13 Child Action
**VI:** Hành động con  
**ID:** `CHILD_ACTION`  
**Status:** CANONICAL CORE

Action được tạo bên trong một parent/outer Action.

Child Action có thể:
- giữ identity riêng;
- giữ Authority riêng;
- inherit outer Authority;
- share snapshot;
- có snapshot riêng;
tùy Contract.

---

## 4.14 Multihit
**VI:** Đa hit  
**ID:** `MULTIHIT`  
**Status:** CANONICAL CORE

Một Action chứa nhiều hit/Damage Packet.

Canonical rule:

> **Multihit không tự động bằng nhiều Natural Actions.**

---

## 4.15 Follow-up
**VI:** Đòn nối tiếp  
**ID:** `FOLLOW_UP`  
**Status:** CANONICAL CORE

Action/effect phụ phát sinh từ một Action/Event khác.

CANONICAL DEFAULT:
- không phải Natural Action;
- không advance SSI pointer;
- không tự count như original Ability Type nếu chỉ mượn behavior/profile.

---

## 4.16 Counter
**VI:** Phản kích  
**ID:** `COUNTER`  
**Status:** CANONICAL CORE

Reactive Action đáp lại qualifying enemy Action/Event.

CANONICAL DEFAULT:
- không phải Natural Action;
- không advance SSI pointer.

Counter khác generic Reaction vì nó mang retaliation identity.

---

## 4.17 Forced Action
**VI:** Hành động cưỡng chế  
**ID:** `FORCED_ACTION`  
**Status:** CANONICAL CORE

Action do hệ thống/effect ép Actor thực hiện thay vì Actor tự chọn natural action của mình.

CANONICAL DEFAULT:
- không tự trở thành Natural Action;
- không advance SSI pointer.

---

## 4.18 Reaction
**VI:** Phản ứng  
**ID:** `REACTION`  
**Status:** CANONICAL CORE AS CONCEPT

Ability/Effect/Action được kích hoạt bởi Event thay vì Actor chủ động chọn tại thời điểm đó.

**UNRESOLVED LAYER:**
việc `REACTION` có cần trở thành Functional Tag hay chỉ là Trigger/Action field sẽ được quyết định ở Tag vNext.

---

## 4.19 Linked Cast
**VI:** Thi triển liên kết  
**ID:** `LINKED_CAST`  
**Status:** CANONICAL CORE

Một cast/action được tạo như phần liên kết của một parent action.

CANONICAL DEFAULT:
- non-natural;
- không advance SSI pointer;
trừ Contract override.

---

## 4.20 Interrupting Action
**VI:** Hành động chen/ngắt  
**ID:** `INTERRUPTING_ACTION`  
**Status:** CANONICAL CORE

Action được chèn vào một resolution window đang diễn ra.

Exact:
- priority;
- pause/resume;
- child/parent relation;
- event ordering;
thuộc Contract.

---

## 4.21 Action Completion
**VI:** Hoàn tất hành động  
**ID:** `ACTION_COMPLETION`  
**Status:** CANONICAL CORE

Checkpoint khi toàn bộ **direct resolution** của Action được xem là hoàn tất và Kernel có thể chuyển sang hậu quả hậu-action theo Resolution Contract.

Cần phân biệt:
- direct effect completion;
- Reaction queue;
- Death resolution;
- post-action hooks;
tùy Contract.

---

## 4.22 Action Snapshot
**VI:** Snapshot hành động  
**ID:** `ACTION_SNAPSHOT`  
**Status:** CANONICAL CORE

Snapshot được chụp tại một timing point của Action để một hoặc nhiều component dùng chung dữ liệu ổn định.

---

## 4.23 Simultaneous Batch
**VI:** Phân giải đồng thời theo batch  
**ID:** `SIMULTANEOUS_BATCH`  
**Status:** CANONICAL CORE

Nhiều component/target được tính từ cùng relevant snapshot rồi commit như một batch trước downstream reaction/death effects theo Contract.

Canonical consequence:

> một target chết trong cùng simultaneous AoE không tự thay đổi damage tính cho target khác trong cùng batch.

---

## 4.24 Sequential Resolution
**VI:** Phân giải tuần tự  
**ID:** `SEQUENTIAL_RESOLUTION`  
**Status:** CANONICAL CORE

Components resolve lần lượt.

Component sau có thể quan sát mutation của component trước nếu Contract cho phép.

---

# 5. SSI & CLOCK

## 5.1 SSI
**EN:** Sequential Simultaneous Instant  
**ID:** `SSI`  
**Status:** CANONICAL CORE / TURN-BASED MODE

Mô hình turn/action ordering của turn-based mode.

Mỗi side có natural-action slot pointer riêng.

Các Natural Action của hai side xen kẽ.

SSI không phải:
> “phe A đánh hết rồi tới phe B”.

---

## 5.2 Natural Pointer
**VI:** Con trỏ hành động tự nhiên  
**ID:** `NATURAL_POINTER`  
**Status:** CANONICAL CORE / TURN-BASED MODE

Per-side pointer xác định slot candidate tiếp theo cho Natural Action.

---

## 5.3 Side Pass
**VI:** Chu kỳ quét slot của phe  
**ID:** `SIDE_PASS`  
**Status:** CANONICAL CORE / TURN-BASED MODE

Traversal logic của một side từ slot hiện tại qua sequence cho đến wrap.

Không có nghĩa side đó hành động liên tục không xen kẽ.

---

## 5.4 Turn Boundary
**VI:** Biên giữa hai Natural Action  
**ID:** `TURN_BOUNDARY`  
**Status:** CANONICAL CORE

Ranh giới SSI nằm giữa hai Natural Action liên tiếp trong turn-based mode.

Canonical sequence:

`Natural Action → Turn Boundary → Natural Action → Turn Boundary → ...`

Turn Boundary:
- không phải Natural Action;
- không phải Round;
- không phải riêng “lượt của cùng một Actor”;
- là global SSI boundary giữa hai Natural Action opportunities đã được resolve/consumed.

Các mechanic kiểu:
- “1 lần trong lượt bản thân”;
- “tới Natural Action tiếp theo của chính Actor”;
- “2 Natural Actions của target”;

không dùng `TURN_BOUNDARY` như một personal clock. Chúng dùng `ACTOR_NATURAL_ACTION_WINDOW` hoặc `NATURAL_ACTION_OF_ACTOR`.

---

## 5.4A Actor Natural Action Window
**VI:** Cửa sổ Natural Action của Actor  
**ID:** `ACTOR_NATURAL_ACTION_WINDOW`  
**Status:** CANONICAL CORE

Per-actor clock/window dùng cho cap, reset và duration gắn với chu kỳ Natural Action riêng của Actor.

Ví dụ:
- tối đa 1 trigger trong own-action window;
- tồn tại tới Natural Action tiếp theo của bản thân;
- tối đa 3 conversion trước own Natural Action kế tiếp.

CC làm Actor mất Natural Action opportunity vẫn có thể làm actor-window tiến triển theo SSI Contract.

`ACTOR_NATURAL_ACTION_WINDOW ≠ TURN_BOUNDARY`.

---

## 5.5 Slot Clock
**VI:** Đồng hồ theo slot  
**ID:** `SLOT_CLOCK`  
**Status:** CANONICAL CORE AS CONCEPT / CONTRACT UNRESOLVED

Clock gắn với slot/position progression thay vì Actor identity.

Được giữ vì legacy kit có timer:
> “2 lượt theo slot nơi actor chết”,
không phụ thuộc occupancy.

Slot Clock không được giả vờ là Actor Turn Boundary.

---

## 5.6 Round
**VI:** Vòng  
**ID:** `ROUND`  
**Status:** CANONICAL CORE AS DISTINCT CONCEPT

Nếu mode có Round, Round là global/side-cycle concept.

Canonical rule:

> **Round ≠ Turn Boundary ≠ Actor Natural Action Window.**

Không dùng “round” làm synonym cho Natural Action hoặc personal turn.

---

# 6. EVENT & TRIGGER

## 6.1 Event
**VI:** Sự kiện  
**ID:** `EVENT`  
**Status:** CANONICAL CORE

Occurrence được Kernel emit để listeners/system/Trigger quan sát.

Ví dụ:
- Action completed;
- Damage Action completed;
- Debuff applied/removed;
- HP_ZERO;
- DEATH_CONFIRMED;
- Airborne entered.

Exact event catalog thuộc Contract/Kernel.

---

## 6.2 Trigger
**VI:** Kích hoạt  
**ID:** `TRIGGER`  
**Status:** CANONICAL CORE

Rule xác định **khi nào** một Ability/Effect/system behavior được phép resolve.

Trigger có thể phụ thuộc:
- Event;
- state;
- threshold;
- counter;
- resource;
- lifecycle;
- Authority;
- target existence.

---

## 6.3 Auto Trigger
**VI:** Tự động kích hoạt  
**ID:** `AUTO_TRIGGER`  
**Status:** CANONICAL CORE AS CONCEPT

Ability/Effect tự resolve khi trigger conditions thỏa mà không cần player/AI chủ động chọn ở thời điểm đó.

Không phải mọi Passive đều Auto Trigger.

---

## 6.4 Threshold Trigger
**VI:** Kích hoạt theo ngưỡng  
**ID:** `THRESHOLD_TRIGGER`  
**Status:** CANONICAL CORE AS CONCEPT

Trigger có condition dựa trên value đạt/vượt/giảm xuống dưới threshold.

Threshold value là Parameter.

---

## 6.5 Damage Trigger
**VI:** Kích hoạt theo sát thương  
**ID:** `DAMAGE_TRIGGER`  
**Status:** CANONICAL CORE AS CONCEPT

Trigger quan sát:
- Damage Event;
- Damage Packet;
- Damage Action;
- Actual HP Damage;
tùy Contract.

Phải khai báo observer level, không dùng “damage trigger” mơ hồ.

---

## 6.6 Death Trigger
**VI:** Kích hoạt theo tử vong  
**ID:** `DEATH_TRIGGER`  
**Status:** CANONICAL CORE AS CONCEPT / TAG STATUS UNRESOLVED

Trigger quan sát **DEATH_CONFIRMED**.

Death Trigger không được emit tại HP_ZERO.

Việc concept này có cần Functional Tag riêng sẽ do Tag vNext quyết định.

---

## 6.7 Action Counter
**VI:** Bộ đếm hành động  
**ID:** `ACTION_COUNTER`  
**Status:** CANONICAL CORE AS STATE/CONCEPT

State/progress đếm qualifying Action/Natural Action tới threshold.

Action Counter khác:
- Counter reactive action;
- cooldown;
- timer.

---

## 6.8 Cooldown
**VI:** Hồi chiêu  
**ID:** `COOLDOWN`  
**Status:** CANONICAL CORE

State giới hạn thời điểm Ability được dùng/trigger lại.

Cooldown phải khai báo clock:
- Natural Action;
- Turn Boundary;
- slot;
- Action count;
- Combat-wide;
- mode-specific time.

---

## 6.9 Trigger Frequency
**VI:** Tần suất kích hoạt  
**ID:** `TRIGGER_FREQUENCY`  
**Status:** CANONICAL CORE

Rule giới hạn tốc độ Trigger theo scope.

---

## 6.10 Trigger Cap
**VI:** Giới hạn kích hoạt  
**ID:** `TRIGGER_CAP`  
**Status:** CANONICAL CORE

Maximum successful activation trong một defined scope/window.

Exact question:
> trigger fail vì thiếu cost có consume cap không?

thuộc Contract.

---

## 6.11 Activation Window
**VI:** Cửa sổ kích hoạt  
**ID:** `ACTIVATION_WINDOW`  
**Status:** CANONICAL CORE

Khoảng logic trong đó:
- counter;
- cap;
- stack;
- trigger frequency;
được theo dõi.

Ví dụ:
> giữa hai Natural Action của Silas.

---

# 7. TARGETING & AREA

## 7.1 Target
**VI:** Mục tiêu  
**ID:** `TARGET`  
**Status:** CANONICAL CORE

Entity/Position/Object được chọn hoặc bị ảnh hưởng bởi Ability/Effect.

---

## 7.2 Target Selection
**VI:** Chọn mục tiêu  
**ID:** `TARGET_SELECTION`  
**Status:** CANONICAL CORE

Quá trình tạo target result từ:
- Candidate Pool;
- Target Scope;
- Filter;
- Selection Rule;
- count;
- RNG;
- special priority.

Target Selection là phase khác Area Resolution.

---

## 7.3 Candidate Pool
**VI:** Tập mục tiêu ứng viên  
**ID:** `CANDIDATE_POOL`  
**Status:** CANONICAL CORE

Tập entity/object/position còn hợp lệ trước selection.

Candidate Pool có thể bị filter bởi:
- Side;
- alive state;
- class;
- rank;
- Leader exclusion;
- direct-target exclusion;
- system eligibility.

---

## 7.4 Target Scope
**VI:** Phạm vi mục tiêu  
**ID:** `TARGET_SCOPE`  
**Status:** CANONICAL CORE

Quan hệ cấp cao của target:
- Self;
- Ally;
- Enemy;
- Object;
- Position;
- mode-specific categories.

**UNRESOLVED TAG LAYER:**
Self/Ally/Enemy có cần Functional Tag riêng hay chỉ TargetSpec field sẽ quyết định ở Tag vNext.

---

## 7.5 Target Filter
**VI:** Bộ lọc mục tiêu  
**ID:** `TARGET_FILTER`  
**Status:** CANONICAL CORE

Condition loại/giữ candidate.

Ví dụ:
- exclude Leader;
- exclude Forgotten;
- require Rank relation;
- require capability;
- require Mark.

---

## 7.6 Target Selection Rule
**VI:** Quy tắc chọn mục tiêu  
**ID:** `TARGET_SELECTION_RULE`  
**Status:** CANONICAL CORE

Logic chọn final target từ Candidate Pool.

Ví dụ:
- random;
- lowest HP%;
- highest shield;
- highest Max HP;
- taunt priority;
- class priority.

---

## 7.7 Target Resolution
**VI:** Phán định mục tiêu  
**ID:** `TARGET_RESOLUTION`  
**Status:** CANONICAL CORE

Quá trình kết thúc Target Selection và tạo target result authoritative cho Action/Effect.

---

## 7.8 Target Snapshot
**VI:** Snapshot mục tiêu  
**ID:** `TARGET_SNAPSHOT`  
**Status:** CANONICAL CORE

Immutable capture của selected target identities/positions tại timing point.

Dùng khi Action cần giữ original targets dù Position/state thay đổi sau đó.

---

## 7.9 Target Lock
**VI:** Khóa mục tiêu  
**ID:** `TARGET_LOCK`  
**Status:** CANONICAL CORE

Policy dùng target snapshot/reference cũ thay vì re-run selection.

---

## 7.9A Hit Admission
**VI:** Phán định trúng đòn  
**ID:** `HIT_ADMISSION`  
**Status:** CANONICAL CORE / POLICY INTERFACE

Semantic interface xác định một effect/hit đã có target hợp lệ có được phép đi tiếp qua ordinary hit-resolution gate hay không.

Canonical distinction:

> `TARGET_LOCK ≠ HIT_ADMISSION`.

Target Lock trả lời:
> Effect đang tham chiếu target nào?

Hit Admission trả lời:
> Ordinary hit system có cho phép effect trúng target hợp lệ đó hay không?

Target Lock không tự bypass:
- Miss;
- Dodge;
- Evasion.

Hit Admission không tự thay đổi target identity.

---

## 7.9B Guaranteed Hit
**VI:** Tất trúng / bảo đảm trúng  
**ID:** `GUARANTEED_HIT`  
**Status:** CANONICAL CORE / HIT-ADMISSION POLICY

Hit Admission policy cho phép hit bypass ordinary:
- Miss;
- Dodge;
- Evasion.

Guaranteed Hit không tự:
- tạo Target Lock;
- giữ target hợp lệ sau lifecycle invalidation;
- rematerialize/revive target;
- bypass Authority conflict;
- bypass protection/immunity không thuộc ordinary Miss/Dodge/Evasion.

Nếu một rule có Authority trực tiếp tuyên bố special hit denial / forced avoidance / special dodge trên cùng semantic scope:

> conflict đó dùng Authority Adjudication hiện hành.

`GUARANTEED_HIT` không tự thắng rule có Authority.

Exact Accuracy/Evasion formula không được định nghĩa ở đây.

---

## 7.10 Re-query
**VI:** Chọn lại / tái truy vấn  
**ID:** `TARGET_REQUERY`  
**Status:** CANONICAL CORE

Chạy lại target eligibility/selection sau state mutation.

Không được reroll/re-query chỉ vì target chết nếu Ability Contract không cho phép.

---

## 7.11 Geometry
**VI:** Hình học vùng tác động  
**ID:** `GEOMETRY`  
**Status:** CANONICAL CORE

Mô tả spatial/slot geometry dùng cho Area Resolution.

Ví dụ:
- row;
- column;
- cross;
- radius;
- full board;
- fixed positions.

---

## 7.12 Area Resolution
**VI:** Phân giải vùng tác động  
**ID:** `AREA_RESOLUTION`  
**Status:** CANONICAL CORE

Quá trình xác định entity nào nằm trong Geometry/area đã được xác lập.

Canonical distinction:

> **Target Selection ≠ Area Resolution.**

---

## 7.13 Fixed AOE
**VI:** AOE cố định  
**ID:** `AOE_FIXED`  
**Status:** CANONICAL CORE AS CONCEPT

Multi-target/area effect xác định vùng bằng Geometry/Position cố định hoặc rule-deterministic.

---

## 7.14 Random Multi-target
**VI:** Đa mục tiêu ngẫu nhiên  
**ID:** `RANDOM_MULTI_TARGET`  
**Status:** CANONICAL CORE AS CONCEPT

Chọn nhiều target bằng RNG từ Candidate Pool.

Tên này được dùng ở Terminology để tránh mặc định rằng mọi random multi-target đều là “Area” theo geometry.

**Lưu ý migration:**
legacy `AOE_RANDOM` có thể tương ứng concept này, nhưng Tag naming sẽ được audit ở Chặng C.

---

## 7.15 Target Exclusion
**VI:** Loại khỏi chọn mục tiêu  
**ID:** `TARGET_EXCLUSION`  
**Status:** CANONICAL CORE

Rule loại entity khỏi direct Target Selection Candidate Pool.

Canonical rule:

> Target Exclusion không tự loại entity khỏi battlefield geometry.

Do đó Forgotten actor có thể:
- không được single/random target;
- nhưng vẫn bị fixed/full-board AoE trúng nếu Position nằm trong vùng.

Target Exclusion ≠ Damage Immunity.

---

# 8. BATTLEFIELD, SIDE & POSITION

## 8.1 Battlefield
**VI:** Chiến trường  
**ID:** `BATTLEFIELD`  
**Status:** CANONICAL CORE

Combat space của một Combat Instance.

---

## 8.1A Field Presence
**VI:** Trạng thái hiện diện trên sân  
**ID:** `FIELD_PRESENCE`  
**Status:** CANONICAL CORE

Gameplay state cho biết một Runtime Entity có đang active-present trong Battlefield của một Combat Instance cụ thể hay không.

Field Presence được xác định theo:
Runtime Entity × Combat Instance
Nó là authoritative gameplay state.

Nó không được suy ra từ:
- model visibility;
- camera visibility;
- animation;
- VFX;
- việc entity có đang được render hay không.

Một entity có thể tồn tại trong encounter nhưng không active-present trong một Combat Instance cụ thể.

---

## 8.1B Enter Field
**VI:** Vào sân  
**ID:** `ENTER_FIELD`  
**Status:** CANONICAL CORE

Presence transition trong một Combat Instance:

not active-present in Combat Instance X
→ active-present in Combat Instance X
ENTER_FIELD mô tả kết quả presence transition, không mô tả nguyên nhân.
Các mechanic khác nhau có thể gây ENTER_FIELD, ví dụ:
Deploy từ Deck;
Revive materialization;
Return;
transfer vào một Combat Instance khác;
nếu và chỉ nếu active presence thực sự chuyển từ false sang true trong instance đang xét.
ENTER_FIELD không tự đồng nghĩa:
Deploy;
Revive;
Rebirth;
Summon;
Materialization cause.

---

## 8.1C Leave Field
VI: Rời sân
ID: LEAVE_FIELD
Status: CANONICAL CORE
Presence transition trong một Combat Instance:
active-present in Combat Instance X
→ not active-present in Combat Instance X
LEAVE_FIELD là cause-neutral.
Nó không tự đồng nghĩa:
DEATH_CONFIRMED;
REMOVED;
DESPAWNED;
FUSION_CONSUMED;
ERASED;
TEMPORARILY_ABSENT;
Return to Deck.
Các lifecycle outcome trên có thể gây Leave Field nếu chúng thực sự kết thúc active presence trong Combat Instance đang xét.
Canonical test:
entity có còn active-present trong Combat Instance đó hay không?

---

## 8.1D Deck
VI: Deck chiến đấu
ID: DECK
Status: CANONICAL CORE / BATTLE ROSTER CONCEPT
Deck là battle-roster container/membership xác định Character nào đã được mang vào encounter theo Deck của Side/player.
Deck membership không tự có nghĩa Character:
hiện đang chờ trên Deck Bar;
hiện chưa được deploy;
hiện đang deployable;
hiện không active-present;
hiện không ở trạng thái Death/Waiting/Removed khác.
Do đó:
DECK_MEMBERSHIP ≠ CURRENT_DEPLOYMENT_STATE.
Current deployment state / deployability là runtime state riêng.
Deck membership cũng không biến roster Character thành SUMMON.

---

## 8.1E Deploy From Deck
VI: Triển khai Character từ Deck lên sân
ID: DEPLOY_FROM_DECK
Status: CANONICAL CORE
Deployment transaction đưa một Deck-member roster Character từ một deployment state cho phép Deploy sang active Battlefield presence.
Canonical distinction:
DEPLOY_FROM_DECK ≠ SUMMON.
Deploy từ Deck có thể cần:
valid Deck membership;
current deployment state cho phép Deploy;
deployment eligibility;
Deployment Cost;
valid Battlefield Position;
placement reservation;
successful transaction commit.
Deck membership một mình không đủ chứng minh Character hiện có thể Deploy.
Deploy thành công không tự cấp bonus Natural Action ngoài SSI.

---

## 8.2 Side
**VI:** Phe  
**ID:** `SIDE`  
**Status:** CANONICAL CORE

Runtime allegiance partition.

Side không phải immutable Character property.

---

## 8.3 Ally
**VI:** Đồng minh  
**ID:** `ALLY`  
**Status:** CANONICAL CORE

Quan hệ runtime giữa reference entity và target có friendly Side relation.

---

## 8.4 Enemy
**VI:** Kẻ địch  
**ID:** `ENEMY`  
**Status:** CANONICAL CORE

Quan hệ runtime giữa reference entity và target có hostile Side relation.

---

## 8.5 Position
**VI:** Vị trí  
**ID:** `POSITION`  
**Status:** CANONICAL CORE

Location/slot/coordinate logic của Runtime Entity/Object trong current mode.

---

## 8.6 Slot
**VI:** Ô / vị trí rời rạc  
**ID:** `SLOT`  
**Status:** CANONICAL CORE / TURN-BASED MODE

Discrete battlefield Position dùng bởi turn-based grid/SSI.

## 8.6A Side-relative Direction
**VI:** Hướng tương đối theo phe  
**ID:** `SIDE_RELATIVE_DIRECTION`  
**Status:** CANONICAL CORE / SPATIAL CONCEPT

Directional semantic được resolve tương đối theo facing/orientation của một reference Side trong Spatial Profile hiện hành.

Canonical directions:
FRONT
BACK
LEFT
RIGHT
Meaning:
FRONT = hướng về opposing Side;
BACK = hướng về hậu tuyến của reference Side;
LEFT / RIGHT = trái/phải theo orientation của reference Side đó.
Hai Side đối diện nhau có thể mirror cùng một directional rule.
Không được mặc định Side-relative Direction là một universal:
screen-left;
screen-right;
world-axis positive/negative direction.
Exact mapping từ direction semantic sang Slot/coordinate thuộc Mode Spatial Profile.

---

## 8.7 Position Mutation
**VI:** Biến đổi vị trí  
**ID:** `POSITION_MUTATION`  
**Status:** CANONICAL CORE

Effect/state operation thay đổi Position authoritative.

Ví dụ:
- swap;
- push;
- pull;
- teleport;
- forced relocation;
- return.

VFX movement không tạo Position Mutation nếu gameplay state không đổi.

---

## 8.8 Displacement
**VI:** Dịch chuyển cưỡng bức  
**ID:** `DISPLACEMENT`  
**Status:** CANONICAL CORE

Position Mutation do force/effect thay vì voluntary movement.

---

## 8.9 Airborne
**VI:** Hất Tung / trên không  
**ID:** `AIRBORNE`  
**Status:** CANONICAL CORE

Semantic state/event của Actor bị đưa vào trạng thái Airborne.

Airborne:
- có thể được apply;
- có thể được observed;
- có thể là Trigger Cause;
- có thể chịu resistance/authority.

Airborne không đồng nghĩa toàn bộ Crowd Control.

---

## 8.10 Position Mark
**VI:** Đánh dấu vị trí  
**ID:** `POSITION_MARK`  
**Status:** CANONICAL CORE

Persistent marker gắn với Position/Slot thay vì Actor identity.

Position Mark ≠ Mark trên Actor.

---

## 8.11 Battlefield Field
**VI:** Vùng hiệu ứng chiến trường  
**ID:** `FIELD`  
**Status:** CANONICAL CORE

Persistent state tồn tại theo spatial/time rules trên Battlefield.

Field:
- không mặc định là Actor;
- không tự chiếm Actor slot;
- có thể có Owner/Source/Authority riêng.

---

# 9. DAMAGE MODEL

## 9.1 Damage Action
**VI:** Hành động gây sát thương  
**ID:** `DAMAGE_ACTION`  
**Status:** CANONICAL CORE

Action hoặc action-scope có damage payload được theo dõi như một đơn vị để:
- aggregate Actual HP Damage;
- trigger action-level observer;
- resolve heal/echo sau toàn action.

Một Damage Action có thể có nhiều Damage Packet.

---

## 9.2 Damage Packet
**VI:** Gói sát thương  
**ID:** `DAMAGE_PACKET`  
**Status:** CANONICAL CORE

Đơn vị damage cụ thể trước final HP-loss outcome.

Damage Packet có thể chứa:
- Damage Source;
- Damage Attribution;
- target;
- Damage Profile/component;
- raw amount;
- penetration;
- authority;
- Shield policy;
- parent Action/hit identity.

---

## 9.3 Damage Profile
**VI:** Hồ sơ sát thương  
**ID:** `DAMAGE_PROFILE`  
**Status:** CANONICAL CORE

Cấu trúc mô tả component/formula của damage.

Ví dụ:
- Physical component;
- Will component;
- True component;
- Max-HP-based component.

Copy Damage Profile không đồng nghĩa copy Action Identity.

---

## 9.4 Physical Damage
**VI:** Sát thương Vật lý  
**ID:** `PHYSICAL_DAMAGE`  
**Status:** CANONICAL CORE

Damage component resolve qua Physical/ARM contract.

---

## 9.5 Will Damage
**VI:** Sát thương Ý chí  
**ID:** `WILL_DAMAGE`  
**Status:** CANONICAL CORE

Damage component resolve qua Will/RES contract.

---

## 9.6 Mixed Damage
**VI:** Sát thương hỗn hợp  
**ID:** `MIXED_DAMAGE`  
**Status:** CANONICAL CORE

Damage Profile có nhiều typed components được giữ tách semantic trong calculation.

Ví dụ:
- Physical chịu ARM;
- Will chịu RES;
không lấy trung bình ARM/RES nếu Profile không định nghĩa như vậy.

---

## 9.7 True Damage
**VI:** Sát thương chuẩn  
**ID:** `TRUE_DAMAGE`  
**Status:** CANONICAL CORE

Damage component không chịu ARM/RES mitigation theo current Damage Contract direction.

Canonical default:
- bypass ARM;
- bypass RES;
- bypass generic Damage Reduction;
- **không tự bypass Shield**.

True Damage ≠ Penetration.
True Damage ≠ Shield Piercing.

Exact interaction với Final Damage Reduction:
**UNRESOLVED CONTRACT**.

---

## 9.8 Penetration
**VI:** Xuyên phòng thủ  
**ID:** `PENETRATION`  
**Status:** CANONICAL CORE

Cơ chế giảm/bỏ qua một phần defensive stat.

Penetration không biến Damage thành True Damage.

---

## 9.9 Damage Reduction
**VI:** Giảm sát thương  
**ID:** `DAMAGE_REDUCTION`  
**Status:** CANONICAL CORE

Effect/property làm giảm qualifying Damage ở một phase được Damage Contract xác định.

---

## 9.10 Final Damage Reduction
**VI:** Giảm sát thương cuối  
**ID:** `FINAL_DAMAGE_REDUCTION`  
**Status:** CANONICAL CORE AS CONCEPT / TAG & EXACT PHASE UNRESOLVED

Reduction ở final/later phase so với upstream mitigation.

Terminology giữ concept vì legacy mechanic dùng nó.

Nhưng chưa chốt:
- có cần Tag riêng;
- chính xác phase nào;
- True Damage có bypass không.

---

## 9.11 Shield
**VI:** Khiên  
**ID:** `SHIELD`  
**Status:** CANONICAL CORE

Defensive layer intercept qualifying Damage trước Current HP theo Shield Contract.

Shield ≠ HP.
Shield ≠ Damage Reduction.

---

## 9.12 Shield Interaction
**VI:** Tương tác với Shield  
**ID:** `SHIELD_INTERACTION`  
**Status:** CANONICAL CORE

Rule xác định:
- Damage Packet có đi qua Shield không;
- Shield absorb bao nhiêu;
- bypass/pierce;
- spillover;
- damage credit.

---

## 9.13 Shield Piercing
**VI:** Xuyên khiên  
**ID:** `SHIELD_PIERCING`  
**Status:** CANONICAL CORE

Property cho phép Damage/Effect bypass toàn phần/một phần Shield.

Canonical rule:

> **Shield Piercing ≠ True Damage.**

---

## 9.14 Actual HP Damage
**VI:** Sát thương HP thực tế  
**ID:** `ACTUAL_HP_DAMAGE`  
**Status:** CANONICAL CORE

Lượng Current HP thực sự bị Damage làm mất sau relevant mitigation và Shield interaction.

Không bao gồm:
- amount bị Shield hấp thụ;
- Overkill.

---

## 9.15 Overkill
**VI:** Sát thương vượt tử  
**ID:** `OVERKILL`  
**Status:** CANONICAL CORE

Phần damage vượt quá Current HP cần thiết để hạ target.

Overkill không mặc định tính là Actual HP Damage.

---

## 9.16 Damage Threshold
**VI:** Ngưỡng sát thương  
**ID:** `DAMAGE_THRESHOLD`  
**Status:** CANONICAL DEFAULT

Condition so sánh qualifying Damage/Actual HP Damage với threshold.

Default direction:
> mechanic kiểu “nhận >15% Max HP damage” đọc aggregate qualifying HP damage của whole Action, không đọc animation frames.

Per-hit/sequential override phải explicit.

---

## 9.17 Lifesteal
**VI:** Hút máu từ damage  
**ID:** `LIFESTEAL`  
**Status:** CANONICAL DEFAULT

Healing generated từ qualifying damage.

Default basis:
> Actual HP Damage.

Không mặc định tính:
- Shield absorption;
- Overkill.

---

## 9.18 Reflected Damage
**VI:** Sát thương phản lại  
**ID:** `REFLECTED_DAMAGE`  
**Status:** CANONICAL DEFAULT

Damage event mới phát sinh từ reflect semantics.

Default direction:
- không recursive reverse-reflect;
- không tự lifesteal;
- không tự Counter-trigger;
trừ explicit Contract.

---

# 10. HP, HEALING & NON-DAMAGE HP CHANGE

## 10.1 Current HP
**VI:** HP hiện tại  
**ID:** `CURRENT_HP`  
**Status:** CANONICAL CORE

HP hiện có của relevant life/entity state.

---

## 10.2 Max HP
**VI:** HP tối đa  
**ID:** `MAX_HP`  
**Status:** CANONICAL CORE

Maximum HP capacity trước/giữa mutation theo stat model.

---

## 10.3 Current Max HP
**VI:** Max HP hiện tại  
**ID:** `CURRENT_MAX_HP`  
**Status:** CANONICAL CORE

Max HP sau mọi active mutation/modifier hợp lệ tại thời điểm query.

---

## 10.4 Heal
**VI:** Hồi phục  
**ID:** `HEAL`  
**Status:** CANONICAL CORE

Operation tăng Current HP theo Healing Contract.

Heal không phải:
- Shield;
- Revive;
- Max HP Mutation.

---

## 10.5 Overheal
**VI:** Hồi phục vượt mức  
**ID:** `OVERHEAL`  
**Status:** CANONICAL CORE

Phần healing amount vượt lượng cần để đạt Current Max HP tại healing resolution.

Overheal có thể bị:
- bỏ qua;
- chuyển thành mechanic khác;
tùy Ability/Contract.

---

## 10.6 HP Loss
**VI:** Mất HP phi-Damage  
**ID:** `HP_LOSS`  
**Status:** CANONICAL CORE

Giảm Current HP theo non-Damage semantics.

HP Loss:
- không tự phát Damage Event;
- không tự interact Shield;
- không tự reflect/lifesteal;
trừ Contract riêng.

HP Loss là family rộng.

---

## 10.7 Cost
**VI:** Chi phí  
**ID:** `COST`  
**Status:** CANONICAL CORE

Resource/state phải trả để một Action/Effect/Trigger được phép resolve.

Cost có **payment semantics**:
- validate affordability;
- consume;
- possible cancel;
- possible waiver;
- possible refund policy.

---

## 10.8 Self HP Cost
**VI:** Chi phí HP bản thân  
**ID:** `SELF_HP_COST`  
**Status:** CANONICAL CORE

HP Loss do chính Caster/Owner trả **như Cost**.

Canonical default:
- không phải Damage;
- bypass Shield;
- không Reflect;
- không Lifesteal;
- không kích hoạt ordinary Damage Trigger;
- không giết payer, để lại ≥1 HP, trừ explicit Contract.

### Boundary quan trọng
Một passive hậu-action tự làm mất HP **không tự là Self HP Cost** nếu nó không có payment semantics.

---

## 10.9 Self Damage
**VI:** Sát thương tự gây  
**ID:** `SELF_DAMAGE`  
**Status:** CANONICAL CORE

Damage có target là chính Source/Caster.

Self Damage vẫn là Damage:
- tạo Damage Packet;
- đi qua Damage Contract;
- có thể interact với Damage Trigger nếu Contract cho phép.

Self Damage ≠ Self HP Cost.

---

## 10.10 Sacrifice
**VI:** Hiến tế  
**ID:** `SACRIFICE`  
**Status:** CANONICAL CORE AS CONCEPT

Non-Damage HP/state payment/loss có lifecycle semantics đặc thù.

Phải khai báo:
- có thể lethal không;
- có Death Prevention không;
- insufficient HP xử lý thế nào;
- trigger nào quan sát.

---

## 10.11 Max HP Mutation
**VI:** Biến đổi Max HP  
**ID:** `MAX_HP_MUTATION`  
**Status:** CANONICAL CORE

Operation thay đổi Max HP/current Max HP.

Phải có Contract cho:
- increase;
- decrease;
- expiry;
- Current HP reconciliation;
- stat baseline vs temporary contribution;
- trả lại Max HP không được tạo “heal giả” ngoài ý muốn.

---

# 11. STATUS, MARK & MODIFIER

## 11.1 State
**VI:** Trạng thái  
**ID:** `STATE`  
**Status:** CANONICAL CORE

Authoritative runtime configuration có identity/fields/lifecycle.

---

## 11.2 State Transition
**VI:** Chuyển trạng thái  
**ID:** `STATE_TRANSITION`  
**Status:** CANONICAL CORE

Chuyển từ valid State A sang valid State B do canonical cause.

---

## 11.3 State Machine
**VI:** Máy trạng thái  
**ID:** `STATE_MACHINE`  
**Status:** CANONICAL CORE

Graph/table mô tả:
- valid states;
- transition conditions;
- forbidden transitions.

Dùng khi boolean không đủ an toàn.

---

## 11.4 Buff
**VI:** Buff  
**ID:** `BUFF`  
**Status:** CANONICAL CORE

Status/modifier mang beneficial Buff identity theo Contract.

Không phải mọi positive stat change đều là Buff.

---

## 11.5 Debuff
**VI:** Debuff  
**ID:** `DEBUFF`  
**Status:** CANONICAL CORE

Status/modifier mang harmful Debuff identity.

Không phải mọi negative state đều bắt buộc là Debuff.

---

## 11.6 Debuff Identity
**VI:** Bản sắc Debuff  
**ID:** `DEBUFF_IDENTITY`  
**Status:** CANONICAL CORE

Identifier dùng để phân biệt “cùng loại Debuff” ở semantic-specific mechanics.

Hai Debuff cùng category nhưng khác Debuff Identity không mặc định là cùng loại.

---

## 11.7 Mark
**VI:** Đánh dấu Actor  
**ID:** `MARK`  
**Status:** CANONICAL CORE

Persistent/queryable marker gắn lên target Actor/Runtime Entity.

Mark không mặc định là Buff hoặc Debuff.

---

## 11.8 Position Mark
Xem mục `8.10`.

Canonical distinction:
> Position Mark thuộc Position, không thuộc Actor identity.

---

## 11.9 Modifier
**VI:** Modifier  
**ID:** `MODIFIER`  
**Status:** CANONICAL CORE

Thay đổi một value/state nhưng không nhất thiết tạo Buff/Debuff identity.

---

## 11.10 Stat Modifier
**VI:** Modifier chỉ số  
**ID:** `STAT_MODIFIER`  
**Status:** CANONICAL CORE

Effect/property thay đổi một hoặc nhiều stat theo modifier semantics.

---

## 11.11 Stat Mutation
**VI:** Mutation chỉ số  
**ID:** `STAT_MUTATION`  
**Status:** CANONICAL CORE

State operation thay đổi Current/Base Stat theo lifecycle contract.

Difference với Modifier có thể nằm ở:
- baseline mutation;
- layer;
- permanence;
và phải được Stat Contract chốt.

---

## 11.12 Debuff Cleanse
**VI:** Xóa Debuff  
**ID:** `DEBUFF_CLEANSE`  
**Status:** CANONICAL CORE

Effect loại bỏ Debuff đã tồn tại.

Debuff Cleanse ≠:
- immunity;
- resistance;
- prevention.

---

## 11.13 Immunity
**VI:** Miễn nhiễm  
**ID:** `IMMUNITY`  
**Status:** CANONICAL CORE

Rule ngăn một nhóm Effect/Status được áp dụng hoặc resolve.

Immunity phải có explicit scope.

Immunity không tự nghĩa:
- damage immunity;
- all-effect immunity;
- Divine Nature.

---

## 11.14 Crowd Control
**VI:** Khống chế  
**ID:** `CROWD_CONTROL`  
**Status:** CANONICAL CORE AS FAMILY

Family effects hạn chế:
- action;
- movement;
- targeting;
- behavior.

Full taxonomy chưa chốt.

---

## 11.15 Hard CC
**VI:** Khống chế cứng  
**ID:** `HARD_CC`  
**Status:** UNRESOLVED TAXONOMY

Control đủ mạnh để ngăn relevant action theo Contract.

Exact category list chưa canonical.

---

## 11.16 Taunt
**VI:** Khiêu khích / cưỡng mục tiêu  
**ID:** `TAUNT`  
**Status:** CANONICAL CORE AS CONCEPT

Control thay đổi target/action-choice behavior theo explicit Contract.

---

# 12. SNAPSHOT & HISTORY

## 12.1 Snapshot
**VI:** Snapshot  
**ID:** `SNAPSHOT`  
**Status:** CANONICAL CORE

Immutable capture của declared state fields tại một timing point.

---

## 12.2 Source Snapshot
**VI:** Snapshot nguồn  
**ID:** `SOURCE_SNAPSHOT`  
**Status:** CANONICAL CORE

Snapshot của Source/Caster stats/state dùng để tính effect sau đó.

---

## 12.3 Target Snapshot
Xem `7.8`.

---

## 12.4 Stat Snapshot
**VI:** Snapshot chỉ số  
**ID:** `STAT_SNAPSHOT`  
**Status:** CANONICAL CORE

Snapshot của selected stats.

Không tự copy:
- Buff object;
- Debuff object;
- Mark object;
- cooldown object;
- duration object;
trừ Contract nói rõ.

---

## 12.5 Entrance Snapshot
**VI:** Snapshot khi vào sân/tạo entity  
**ID:** `ENTRANCE_SNAPSHOT`  
**Status:** CANONICAL CORE

Snapshot chụp tại moment entity materialize/được tạo/enter Combat Instance.

---

## 12.6 Shared Snapshot
**VI:** Snapshot dùng chung  
**ID:** `SHARED_SNAPSHOT`  
**Status:** CANONICAL CORE

Một snapshot được nhiều component/hit/target dùng để đảm bảo cùng start-state semantics.

---

## 12.7 Historical Snapshot
**VI:** Snapshot lịch sử  
**ID:** `HISTORICAL_SNAPSHOT`  
**Status:** CANONICAL CORE

Snapshot được lưu để query/regress ở thời điểm sau.

---

## 12.8 Regression
**VI:** Hồi quy trạng thái  
**ID:** `REGRESSION`  
**Status:** CANONICAL CORE / CONTRACT HEAVY

Operation khôi phục selected state từ Historical Snapshot.

Phải khai báo scope:
- full battlefield;
- single entity;
- stats;
- position;
- resource;
- lifecycle;
- summons;
- cooldown;
- state objects.

Regression không được tự suy ra toàn bộ event history rollback nếu Contract không nói vậy.

---

# 13. DEATH & LIFE CYCLE

## 13.1 ALIVE
**VI:** Đang sống  
**ID:** `ALIVE`  
**Status:** CANONICAL CORE

Life state trong đó entity được coi là sống và có eligibility tương ứng.

---

## 13.2 HP_ZERO
**VI:** HP bằng 0  
**ID:** `HP_ZERO`  
**Status:** CANONICAL CORE

Checkpoint khi Current HP đạt 0 và death evaluation bắt đầu.

Canonical rule:

> **HP_ZERO không phải DEATH_CONFIRMED.**

---

## 13.3 Death Prevention
**VI:** Ngăn tử vong  
**ID:** `DEATH_PREVENTION`  
**Status:** CANONICAL CORE

Mechanic can thiệp **sau HP_ZERO nhưng trước DEATH_CONFIRMED** để:
- ngăn death;
- thay thế death;
- đưa entity về non-dead outcome.

Nếu mechanic cứu entity ở phase này:
> semantic của nó là Death Prevention/death replacement, không phải ordinary Revive.

---

## 13.4 DEATH_PREVENTED
**VI:** Tử vong đã bị ngăn  
**ID:** `DEATH_PREVENTED`  
**Status:** CANONICAL CORE

Outcome khi Death Prevention thành công.

Không emit ordinary confirmed-death observers.

---

## 13.5 DEATH_CONFIRMED
**VI:** Xác nhận tử vong  
**ID:** `DEATH_CONFIRMED`  
**Status:** CANONICAL CORE

Checkpoint/event khi mọi prevention có quyền can thiệp đã resolve và entity chính thức chết theo lifecycle.

Canonical observers có thể gồm:
- kill credit;
- on-death;
- on-kill;
- Luân Hồi;
- Chân Ngã death record.

---

## 13.6 Revive
**VI:** Hồi sinh  
**ID:** `REVIVE`  
**Status:** CANONICAL CORE

Transition đưa entity đã đạt **DEATH_CONFIRMED** từ revive-eligible dead/pending state trở lại living/materialized state.

Canonical rule:

> **Revive ≠ Death Prevention.**

Revive không mặc định:
- reset toàn bộ state;
- reset resource;
- đổi lifeSerial;
- đổi trueSelfId.

Tất cả thuộc Revive Contract.

---

## 13.7 Revive Pending
**VI:** Chờ hồi sinh  
**ID:** `REVIVE_PENDING`  
**Status:** CANONICAL CORE

State sau confirmed death khi entity có quyền Revive nhưng chưa materialize trở lại.

---

## 13.8 Waiting Window
**VI:** Cửa sổ chờ Luân Hồi  
**ID:** `REINCARNATION_WAITING_WINDOW`  
**Status:** CANONICAL CORE / TURN-BASED LIFE SYSTEM

Khoảng logic sau DEATH_CONFIRMED trong đó Chân Ngã còn ở trạng thái chờ trước khi chính thức vào Luân Hồi/Reincarnation.

Current design value thường dùng:
> `4`

Nhưng exact clock/event decrement:
**UNRESOLVED CONTRACT**.

Không hiểu là wall-clock time.

---

## 13.9 Reincarnation
**VI:** Luân Hồi / tái sinh  
**ID:** `REINCARNATION`  
**Status:** CANONICAL CORE / WORLD AXIOM SYSTEM

Transition trong đó Chân Ngã đi vào state/đời mới theo World Axiom Luân Hồi.

Canonical default:
- sau khi Chân Ngã đã vào Reincarnation, ordinary Revive không còn truy hồi được nó;
- special rebirth/routing mechanic có thể can thiệp nếu Contract cho phép.

---

## 13.10 Rebirth
**VI:** Đầu thai  
**ID:** `REBIRTH`  
**Status:** CANONICAL CORE AS DISTINCT CONCEPT

Special return/materialization route từ Reincarnation tạo đời mới.

Rebirth ≠ ordinary Revive.

---

## 13.11 Reincarnation Candidate
**VI:** Chân Ngã ứng viên Luân Hồi  
**ID:** `REINCARNATION_CANDIDATE`  
**Status:** CANONICAL CORE

Chân Ngã đang đủ eligibility để được một routing mechanic xử lý.

---

## 13.12 Reincarnation Routing
**VI:** Định tuyến Luân Hồi  
**ID:** `REINCARNATION_ROUTING`  
**Status:** CANONICAL CORE

Process chọn/validate:
- destination;
- host;
- presentation;
- combat definition;
- side;
- materialization;
cho Chân Ngã đi vào đời mới.

Pygmalion Puppet và Luân Hồi Chi Chủ là stress tests.

---

## 13.13 Reincarnation Block
**VI:** Chặn tuyến Luân Hồi  
**ID:** `REINCARNATION_BLOCK`  
**Status:** CANONICAL CORE

Rule ngăn một candidate sử dụng một reincarnation route cụ thể.

---

## 13.14 Reincarnation Exhausted
**VI:** Cạn quyền tái sinh  
**ID:** `REINCARNATION_EXHAUSTED`  
**Status:** CANONICAL CORE

State cho biết Chân Ngã không được sử dụng một hoặc nhiều reincarnation route tiếp trong encounter theo Contract.

Canonical distinction:

> `REINCARNATION_EXHAUSTED ≠ ERASED`.

---

## 13.15 Removed
**VI:** Rời chiến trường  
**ID:** `REMOVED`  
**Status:** CANONICAL CORE

Entity rời current battlefield/combat presence mà không phải DEATH_CONFIRMED.
`REMOVED` là một lifecycle outcome cụ thể.

Một transition sang `REMOVED` có thể gây `LEAVE_FIELD` nếu active presence trong Combat Instance kết thúc, nhưng:

> `LEAVE_FIELD ≠ REMOVED`.

Leave Field rộng hơn Removed và không tự xác định lifecycle destination sau khi entity rời sân.

---

## 13.16 Despawned
**VI:** Biến mất do despawn  
**ID:** `DESPAWNED`  
**Status:** CANONICAL CORE

Summon/entity bị kết thúc vì summon/despawn lifecycle.

Không tự emit death semantics.

---

## 13.17 Fusion Consumed
**VI:** Bị tiêu thụ bởi dung hợp  
**ID:** `FUSION_CONSUMED`  
**Status:** CANONICAL CORE

Entity bị consume làm input của fusion.

Fusion Consumed ≠ Death.

---

## 13.18 Erased
**VI:** Bị xóa khỏi tồn tại  
**ID:** `ERASED`  
**Status:** CANONICAL CORE

Existence-deletion semantic.

Erasure không tự đồng nghĩa DEATH_CONFIRMED nếu rule không nói vậy.

---

## 13.19 Temporarily Absent
**VI:** Tạm vắng khỏi chiến trường  
**ID:** `TEMPORARILY_ABSENT`  
**Status:** CANONICAL CORE

Entity không present trên battlefield hiện tại nhưng chưa chết và không mặc định vào Reincarnation waiting window.

Ví dụ:
Luân Hồi Chi Chủ dùng Skill 2 rời hiện thế.

---

## 13.20 Return
**VI:** Trở về / hoàn trả  
**ID:** `RETURN`  
**Status:** CANONICAL CORE

Transfer entity/object/property về destination/Owner theo Contract.

Return ≠ Death.

---

## 13.21 Lifecycle
**VI:** Vòng đời hệ thống  
**ID:** `LIFECYCLE`  
**Status:** CANONICAL CORE

State machine govern:
- creation;
- active;
- transition;
- death/removal;
- materialization;
- quota;
- termination.

---

## 13.22 Life Cycle
**VI:** Một chu kỳ đời  
**ID:** `LIFE_CYCLE`  
**Status:** CANONICAL CORE

Một lifecycle instance của entity/Chân Ngã có repeat-life semantics.

---

## 13.23 Lifecycle Quota
**VI:** Hạn ngạch theo Life Cycle  
**ID:** `LIFECYCLE_QUOTA`  
**Status:** CANONICAL CORE

Counter/allowance scoped theo Life Cycle.

Canonical Pygmalion correction:

> **Mỗi Life Cycle của Pygmalion tạo đúng một Puppet mới.**

Điều này không nghĩa:
> chỉ được tồn tại một Puppet.

---

## 13.24 Materialization
**VI:** Hiện thân vào battlefield  
**ID:** `MATERIALIZATION`  
**Status:** CANONICAL CORE

Transition tạo/đưa entity/form từ pending/absent/reincarnation/container state vào active battlefield presence.

Materialization có thể cần:
- slot validity;
- Uniqueness check;
- side assignment;
- Presentation Definition;
- Combat Definition;
- life state.
Materialization là process/operation đưa entity hoặc form vào active battlefield presence; `ENTER_FIELD` là semantic của resulting presence transition.

Do đó:

> `MATERIALIZATION ≠ ENTER_FIELD`.

Nếu một successful Materialization làm entity chuyển từ not active-present sang active-present trong Combat Instance X, transition đó đồng thời produce `ENTER_FIELD(X)`.

Deploy, Revive, Return và Rebirth có thể dùng chung materialization machinery nhưng vẫn giữ cause semantic riêng.

---

# 14. AUTHORITY & AXIOM

## 14.1 Authority
**VI:** Quyền phán định  
**ID:** `AUTHORITY`  
**Status:** CANONICAL CORE

Cấp precedence/force của Ability/Effect/Rule trong conflict resolution.

---

## 14.2 Authority Tier
**VI:** Cấp Authority  
**ID:** `AUTHORITY_TIER`  
**Status:** CANONICAL CORE

Current hierarchy:

`Normal Effect < Pháp Tắc < Quy Tắc < Axiom`

---

## 14.3 Pháp Tắc
**EN:** Law  
**ID:** `PHAP_TAC`  
**Status:** CANONICAL CORE

Authority tier cao hơn ordinary effect và thấp hơn Quy Tắc/Axiom.

---

## 14.4 Quy Tắc
**EN:** Rule  
**ID:** `QUY_TAC`  
**Status:** CANONICAL CORE

Authority tier trên Pháp Tắc.

---

## 14.5 Axiom
**VI:** Axiom  
**ID:** `AXIOM`  
**Status:** CANONICAL CORE

Khái niệm dùng cho foundational law/system identity và highest current authority tier context.

Canonical distinction:

> **Axiom Identity / World Law ≠ mọi effect liên quan tự có Axiom Authority.**

---

## 14.6 Axiom Identity
**VI:** Bản sắc Axiom  
**ID:** `AXIOM_IDENTITY`  
**Status:** CANONICAL CORE

Metadata/system identity chỉ ra entity/ability/property thuộc hoặc tương tác một Axiom cụ thể.

Không thay thế `authorityTier`.

---

## 14.7 Authority Conflict
**VI:** Xung đột quyền phán định  
**ID:** `AUTHORITY_CONFLICT`  
**Status:** CANONICAL CORE

Tình huống hai hay nhiều rule/effect tranh quyền mutate/deny/override cùng semantic state.

Higher tier là một yếu tố chính.

Exact same-tier resolver:
**UNRESOLVED CONTRACT**.

---

## 14.8 Dynamic Authority
**VI:** Authority động  
**ID:** `DYNAMIC_AUTHORITY`  
**Status:** CANONICAL CORE

Authority được tính từ runtime state thay vì cố định vĩnh viễn.

---

## 14.9 Explicit Exception
**VI:** Ngoại lệ chỉ định  
**ID:** `EXPLICIT_EXCEPTION`  
**Status:** CANONICAL CORE

Ngoại lệ được khai báo rõ cho một interaction cụ thể.

Canonical rule:
> exception cục bộ không tự biến thành immunity global.

---

## 14.10 Composite Authority Policy
**VI:** Chính sách Authority của Composite Action  
**ID:** `COMPOSITE_AUTHORITY_POLICY`  
**Status:** CANONICAL CORE / CONTRACT-DEFINED

Policy xác định child action/effect:
- preserve own authority;
- inherit outer authority;
- override theo rule khác.

Không có global default duy nhất đủ cho mọi kit hiện có.

---

# 15. AXIOM SYSTEMS

## 15.1 Thần Tính
**EN:** Divine Nature  
**ID:** `DIVINE_NATURE`  
**Status:** SYSTEM-SPECIFIC / CANONICAL CORE

Axiom identity/protection của một số high-order characters.

Canonical:
- có thể chặn external status/effect theo scope;
- exact scope thuộc Thần Tính Contract/kit;
- **không mặc định chặn direct Damage**;
- không làm mọi Ability của character thành Axiom Authority.

Thần Tính ≠ Damage Immunity.

---

## 15.2 Duy Nhất
**EN:** Uniqueness  
**ID:** `UNIQUENESS`  
**Status:** SYSTEM-SPECIFIC / CANONICAL CORE

Axiom/identity rule giới hạn bản thể/definition hợp lệ theo Contract.

Canonical distinction:
- Character có Axiom Duy Nhất là metadata/identity issue;
- Ability tương tác với Duy Nhất là system-interaction issue;
- không gắn Functional Tag UNIQUENESS lên mọi Ability chỉ vì Character mang Axiom này.

---

## 15.3 Luân Hồi
**EN:** Reincarnation World Axiom  
**ID:** `WORLD_AXIOM_REINCARNATION`  
**Status:** SYSTEM-SPECIFIC / CANONICAL CORE

World Axiom govern:
- Chân Ngã;
- DEATH_CONFIRMED observation;
- waiting window;
- entry into Reincarnation;
- rebirth/routing.

---

## 15.4 Thiên Lôi Vô Tư
**ID:** `HEAVENLY_THUNDER_IMPARTIALITY`  
**Status:** SYSTEM-SPECIFIC / CANONICAL CORE AS AXIOM IDENTITY

Axiom/Thiên Điều liên quan Lôi Kiếp và phán xét vô tư.

Exact effect semantics thuộc character/system file riêng.

---

## 15.5 Quang Ảnh Chi Hà
**ID:** `RIVER_OF_LIGHT_AND_SHADOW`  
**Status:** SYSTEM-SPECIFIC / CANONICAL CORE

World Axiom ghi snapshot battlefield sau complete Action và hỗ trợ time-regression mechanics.

Snapshot có thể chứa:
- Position;
- HP/Max HP;
- Rage;
- AE/resource;
- stats;
- Buff/Debuff/Mark;
- cooldown;
- deck/field/dead state;
- Summon;
- lifecycle state.

Full-field regression ≠ single-entity regression.

---

# 16. RESOURCE

## 16.1 Resource
**VI:** Tài nguyên  
**ID:** `RESOURCE`  
**Status:** CANONICAL CORE

Value/pool được system sử dụng để:
- Cost;
- Gain;
- conversion;
- progression;
- action gating.

---

## 16.2 Resource Pool
**VI:** Kho tài nguyên  
**ID:** `RESOURCE_POOL`  
**Status:** CANONICAL CORE

Nguồn giữ resource với ownership scope:
- Actor;
- Side/team;
- subsystem;
- mode;
- Base.

---

## 16.3 AE
**VI:** Aether / AE  
**ID:** `AE`  
**Status:** CANONICAL CORE

Combat resource dùng bởi Skill/Ability.

Turn-based current direction:
> AE thường là shared team resource.

Mode khác có thể override ownership.

---

## 16.4 Rage
**VI:** Nộ / Rage  
**ID:** `RAGE`  
**Status:** CANONICAL CORE

Resource thường mang tính per-unit và dùng cho Ultimate/other mechanic.
Canonical Ultimate resource-readiness relation:
Current Rage >= Max Rage
nghĩa là Actor đã đạt Rage readiness cho Ultimate.

Rage readiness không tự bảo đảm:
- Ultimate hiện legal;
- Actor không bị restriction;
- target/prerequisite khác hợp lệ;
- Ultimate tự động được cast.

Canonical distinction:

> `FULL_RAGE ≠ AUTO_CAST_ULTIMATE`.

Exact Rage consume/reset sau khi Ultimate resolve thuộc Rage Contract riêng và không được suy ra từ readiness.

---

## 16.4A Deployment Cost Bar
**VI:** Thanh Cost triển khai  
**ID:** `DEPLOYMENT_COST_BAR`  
**Status:** CANONICAL CORE / DEPLOYMENT RESOURCE

Resource Pool thuộc deployment system dùng để trả chi phí đưa roster Character từ Deck lên Battlefield.

Deployment Cost Bar độc lập với:
- AE;
- Rage.

Không được dùng Deployment Cost Bar làm Ability Cost trừ khi một mechanic explicit tạo conversion/link giữa các resource system.

Canonical distinction:

> `DEPLOYMENT_COST_BAR ≠ AE ≠ RAGE`.

---

## 16.4B Deployment Cost
**VI:** Cost triển khai Character  
**ID:** `DEPLOYMENT_COST`  
**Status:** CANONICAL CORE / CHARACTER DEPLOYMENT METADATA

Numeric deployment value của một Character dùng trong `DEPLOY_FROM_DECK`.

Deployment Cost:
- được trả từ Deployment Cost Bar;
- không phải AE Cost;
- không phải Rage Cost;
- không phải Ability `CostSpec` của Skill/Ultimate.

Trong Pilot Normalization, Character chưa được Cost Budget system tính xong có thể mang authored placeholder:
TBD_BY_COST_BUDGET
Placeholder này không định nghĩa Cost Budget formula.
Execution-ready battle content phải có resolved numeric Deployment Cost trước khi deployment transaction có thể thực thi payment.

---

## 16.5 Gain
**VI:** Nhận tài nguyên  
**ID:** `GAIN`  
**Status:** CANONICAL CORE

Increase của Resource Pool do Action/Event/effect.

Gain ≠ Cost refund trừ Contract nói vậy.

---

## 16.6 Resource Modifier
**VI:** Biến đổi tài nguyên  
**ID:** `RESOURCE_MODIFIER`  
**Status:** CANONICAL CORE

Effect thay đổi value/capacity/rate của Resource Pool.

Có Cost không tự nghĩa Ability có Resource Modifier semantic.

---

# 17. STAT & SCALING

## 17.1 Stat
**VI:** Chỉ số  
**ID:** `STAT`  
**Status:** CANONICAL CORE

Combat value được Kernel công nhận.

Ví dụ:
- Max HP;
- ATK;
- WIL;
- ARM;
- RES;
- HP Regen;
- mode-specific stats.

---

## 17.2 Base Stat
**VI:** Chỉ số nền  
**ID:** `BASE_STAT`  
**Status:** CANONICAL CORE

Stat baseline trước runtime modifier/mutation theo Stat Contract.

---

## 17.3 Current Stat
**VI:** Chỉ số hiện tại  
**ID:** `CURRENT_STAT`  
**Status:** CANONICAL CORE

Stat sau active modifier/mutation tại thời điểm query.

---

## 17.4 Derived Stat
**VI:** Chỉ số dẫn xuất  
**ID:** `DERIVED_STAT`  
**Status:** CANONICAL CORE

Stat được tính từ stat khác theo formula.

---

## 17.5 Rank Multiplier
**VI:** Hệ số Rank  
**ID:** `RANK_MULTIPLIER`  
**Status:** CANONICAL CORE

Hệ số stat phụ thuộc Rank.

---

## 17.6 ATK
**VI:** Công vật lý / ATK  
**ID:** `ATK`  
**Status:** CANONICAL CORE

Offensive stat dùng trong Physical-oriented formula khi Ability định nghĩa.

---

## 17.7 WIL
**VI:** Ý chí / WIL  
**ID:** `WIL`  
**Status:** CANONICAL CORE

Offensive Will stat dùng trong Will-oriented formula khi Ability định nghĩa.

WIL ≠ RES.

---

## 17.8 ARM
**VI:** Giáp / ARM  
**ID:** `ARM`  
**Status:** CANONICAL CORE

Physical mitigation stat.

---

## 17.9 RES
**VI:** Kháng Ý chí / RES  
**ID:** `RES`  
**Status:** CANONICAL CORE

Will mitigation stat.

---

# 18. CLASS, RANK & ELEMENT

## 18.1 Rank
**VI:** Rank  
**ID:** `RANK`  
**Status:** CANONICAL CORE

Current rank order:

`N < R < SR < SSR < UR < Prime`

Rank ≠ Authority.

---

## 18.2 Class
**VI:** Class  
**ID:** `CLASS`  
**Status:** CANONICAL CORE

Canonical classes:

- Tanker
- Mage
- Ranger
- Warrior
- Support
- Assassin
- Summoner

---

## 18.3 Effective Class
**VI:** Class hiệu dụng  
**ID:** `EFFECTIVE_CLASS`  
**Status:** CANONICAL CORE AS CONCEPT

Class được dùng tại runtime sau inheritance/transformation nếu system cho phép.

Pygmalion inherit Class hay không:
**UNRESOLVED CHARACTER CONTRACT**.

---

## 18.4 Class Bonus Map
**ID:** `CLASS_BONUS_MAP`  
**Status:** CANONICAL CORE / GLOBAL DATA RULE

Current mapping:

- Assassin > Mage +10%; secondary Support +5%.
- Mage > Warrior +10%; secondary Tanker +5%.
- Tanker > Assassin +10%; secondary Summoner +5%.
- Warrior > Tanker +10%; secondary Ranger +5%.
- Ranger > Mage +10%; secondary Support +5%.
- Summoner > Ranger +10%; secondary Warrior +5%.
- Support > Summoner +10%; secondary Mage +5%.

Không encode map này lặp lại trong mỗi Character.

---

## 18.5 Element
**VI:** Nguyên tố  
**ID:** `ELEMENT`  
**Status:** CANONICAL CORE

Element identity/property dùng trong elemental interaction.

---

## 18.6 Effective Element
**VI:** Nguyên tố hiệu dụng  
**ID:** `EFFECTIVE_ELEMENT`  
**Status:** CANONICAL CORE

Element cuối cùng dùng tại runtime sau:
- native element;
- Công Pháp;
- gear;
- modifier;
- transformation;
nếu các layer đó tồn tại.

Combat Definition inheritance không được tự overwrite Effective Element nếu Contract không nói vậy.

---

## 18.7 Element Counter Map
**ID:** `ELEMENT_COUNTER_MAP`  
**Status:** CANONICAL CORE / GLOBAL DATA RULE

Current direct cycle:

- Fire > Metal +10%.
- Metal > Wood +10%.
- Wood > Earth +10%.
- Earth > Lightning +10%.
- Lightning > Blood +10%.
- Blood > Water +10%.
- Water > Fire +10%.
- Light > Dark +10%.
- Dark > Light +10%.
- Wind: no direct counter.
- Neutral: no direct counter.

---

# 19. PRESENTATION

## 19.1 Presentation
**VI:** Lớp trình bày  
**ID:** `PRESENTATION`  
**Status:** CANONICAL CORE

Visual/audio/UI representation.

Bao gồm:
- animation;
- VFX;
- SFX;
- voice;
- model/sprite;
- UI visibility;
- camera.

Presentation không tự tạo gameplay state.

---

## 19.2 VFX
**VI:** Hiệu ứng hình ảnh  
**ID:** `VFX`  
**Status:** CANONICAL CORE

Visual effect.

VFX không tự:
- gây Damage;
- tạo Position Mutation;
- xác định target;
- xác định timing;
nếu gameplay Contract không bind.

---

## 19.3 Presentation Identity
**VI:** Bản sắc hiển thị  
**ID:** `PRESENTATION_IDENTITY`  
**Status:** CANONICAL CORE

Cách Runtime Entity được trình bày cho player.

Có thể khác Identity/Combat Definition.

---

## 19.4 Visibility
**VI:** Khả năng hiển thị  
**ID:** `VISIBILITY`  
**Status:** CANONICAL CORE AS PRESENTATION/GAMEPLAY BRIDGE

State về việc entity có được hiển thị cho observer/UI không.

Visibility không tự quyết định:
- Target Exclusion;
- geometry occupancy;
- Damage Immunity.

Nếu gameplay targeting phụ thuộc invisibility:
> phải có gameplay state/filter riêng.

---

# 20. FORGOTTEN / TARGET EXCLUSION CASE

## 20.1 Forgotten
**VI:** Lãng Quên  
**ID:** `FORGOTTEN`  
**Status:** CHARACTER/SYSTEM-SPECIFIC STATE

State của Hoá Thân Ký Ức Chi Chủ dùng để tách:

- presentation hiding;
- direct Target Exclusion;
- battlefield occupancy;
- Area Resolution.

Canonical architecture lesson:

> entity có thể bị loại khỏi Target Selection nhưng vẫn tồn tại trong Geometry.

Forgotten không phải generic Damage Immunity.

---

# 21. PYGmalion / PUPPET TERMINOLOGY

## 21.1 Puppet
**VI:** Con Rối  
**ID:** `PYGMALION_PUPPET`  
**Status:** CHARACTER-SPECIFIC SYSTEM CONCEPT

Combat entity được Pygmalion tạo.

LOCKED current correction:

> **Mỗi Life Cycle của Pygmalion tạo đúng một Puppet mới.**

Puppet cũ:
- không tự biến mất khi Pygmalion qua Life Cycle mới;
- tiếp tục tồn tại độc lập cho tới khi chính nó bị remove;
- có thể cùng tồn tại với nhiều Puppet khác.

---

## 21.2 Empty Puppet
**VI:** Con Rối rỗng  
**ID:** `EMPTY_PUPPET`  
**Status:** CHARACTER-SPECIFIC

Puppet chưa chứa Chân Ngã được route vào.

---

## 21.3 Inhabited Puppet
**VI:** Con Rối có Chân Ngã  
**ID:** `INHABITED_PUPPET`  
**Status:** CHARACTER-SPECIFIC

Puppet đang chứa/host một Chân Ngã.

Current architecture direction:
> một Puppet host một Chân Ngã tại một thời điểm.

Exact exception nếu có:
UNRESOLVED.

---

## 21.4 Puppet Stat Basis
**VI:** Nền chỉ số của Puppet  
**ID:** `PUPPET_STAT_BASIS`  
**Status:** CHARACTER-SPECIFIC

Stat basis được xác lập khi Puppet được tạo.

Combat Definition inheritance không mặc định overwrite stat basis này.

Inherited kit vẫn có thể modify Current Stat nếu chính kit có modifier.

---

## 21.5 Multiple Puppet Persistence
**VI:** Tồn tại đồng thời nhiều Puppet  
**ID:** `MULTIPLE_PUPPET_PERSISTENCE`  
**Status:** LOCKED CHARACTER INVARIANT

Một Pygmalion có thể tích lũy nhiều Puppet qua nhiều Life Cycle nếu Puppet cũ chưa bị remove.

Canonical rule:

> `one Puppet per Life Cycle` ≠ `one Puppet active total`.

---

# 22. ARENA

## 22.1 Arena
**VI:** Giác Đấu Trường  
**ID:** `ARENA`  
**Status:** SYSTEM-SPECIFIC / CANONICAL CORE

Isolated Combat Instance dùng cho duel/subcombat.

Arena cần Contract riêng cho:
- participant transfer;
- resource isolation;
- timing;
- death;
- return;
- Position fallback;
- interaction với Main Battle.

Arena không tự có death law riêng nếu World Axiom vẫn observe death.

---

# 23. NARRATIVE SYSTEM

## 23.1 Narrative System
**VI:** Hệ Cố Sự  
**ID:** `NARRATIVE_SYSTEM`  
**Status:** SYSTEM-SPECIFIC / CANONICAL CORE AS STRESS-TEST

Subsystem dùng bởi Cố Sự Chi Thần để:
- tạo Story;
- dùng Container;
- tìm Bearer bằng capability;
- theo dõi Witness;
- tích Causal Belief;
- xử lý Proof/Counter-Proof;
- Realize property;
- transfer/absorb property.

Narrative System là bằng chứng rằng Tag/Schema/Primitive phải hỗ trợ system query chứ không chỉ damage/heal.

---

## 23.2 Narrative Container
**VI:** Vật Chứa  
**ID:** `NARRATIVE_CONTAINER`  
**Status:** SYSTEM-SPECIFIC

Phương tiện để một Story biểu hiện và được chứng thực trong Reality.

Container không mặc định là Summon.

Container form có thể là:
- Deployed;
- Wielded;
- Equipped/Bound;
- Event/Phenomenon.

---

## 23.3 Story
**VI:** Cố Sự  
**ID:** `STORY`  
**Status:** SYSTEM-SPECIFIC

Narrative Claim có lifecycle:
- setup/armed;
- created;
- in progress;
- realized;
- failed;
theo Story Contract.

---

## 23.4 Narrative Claim
**VI:** Mệnh đề Cố Sự  
**ID:** `NARRATIVE_CLAIM`  
**Status:** SYSTEM-SPECIFIC

Quan hệ/mệnh đề mà Story yêu cầu Witness tin.

Core fantasy hiện tại:
> phần giả có thể nằm ở quan hệ nhân quả hơn là event bản thân.

---

## 23.5 Bearer
**VI:** Người mang Vật Chứa  
**ID:** `BEARER`  
**Status:** SYSTEM-SPECIFIC

Actor/entity được gắn/cầm Container hoặc là subject của Story.

---

## 23.6 Capability
**VI:** Khả năng semantic  
**ID:** `CAPABILITY`  
**Status:** CANONICAL CORE AS QUERY CONCEPT

Khả năng mà system có thể query từ Ability/Effect/Character data.

Capability có thể được biểu diễn bằng:
- Canonical Tag;
- structured Schema field;
- subsystem metadata;
tùy Tag/Schema design cuối.

Canonical lesson:

> Story cần “actor có capability X” không có nghĩa mọi Narrative Property phải trở thành Functional Tag.

---

## 23.7 Capability Requirement
**VI:** Yêu cầu capability  
**ID:** `CAPABILITY_REQUIREMENT`  
**Status:** SYSTEM-SPECIFIC / CANONICAL CORE AS QUERY STRUCTURE

Requirement dùng để tìm Bearer/Proof Subject phù hợp.

---

## 23.8 Witness
**VI:** Nhân chứng  
**ID:** `WITNESS`  
**Status:** SYSTEM-SPECIFIC

Actor đủ điều kiện quan sát/nhận thức Story và đóng góp Causal Belief.

Current legacy direction:
- có Chân Ngã;
- có HP bar;
- ALIVE;
- hiện diện cùng Combat Instance.

Exact perception rule:
UNRESOLVED.

---

## 23.9 Causal Belief
**VI:** Tín Niệm Nhân Quả  
**ID:** `CAUSAL_BELIEF`  
**Status:** SYSTEM-SPECIFIC

Mức Witness tin vào causal claim của Story.

Không đơn giản là:
> “Witness thấy event xảy ra”.

---

## 23.10 Proof Event
**VI:** Sự kiện Chứng Thực  
**ID:** `PROOF_EVENT`  
**Status:** SYSTEM-SPECIFIC

Event củng cố Story/Causal Belief theo Story Contract.

---

## 23.11 Counter-Proof
**VI:** Phản Chứng  
**ID:** `COUNTER_PROOF`  
**Status:** SYSTEM-SPECIFIC

Event làm giảm/phá causal claim hoặc làm Story fail theo Contract.

---

## 23.12 Stability
**VI:** Độ ổn định / Integrity của Cố Sự  
**ID:** `STORY_STABILITY`  
**Status:** SYSTEM-SPECIFIC / EXACT MODEL UNRESOLVED

State phản ánh mức Container/Story còn đứng vững trước reality/counterplay.

Belief ≠ Stability.

---

## 23.13 Realization
**VI:** Thực Hóa / Thành Sự  
**ID:** `REALIZATION`  
**Status:** SYSTEM-SPECIFIC

Transition khi Story đủ điều kiện để claimed property trở thành gameplay-real property.

---

## 23.14 Realized Property
**VI:** Thuộc tính đã Thực Hóa  
**ID:** `REALIZED_PROPERTY`  
**Status:** SYSTEM-SPECIFIC

Property thật được tạo ra sau Realization.

Canonical warning:
> không tự biến mọi Realized Property thành global Functional Tag.

---

## 23.15 Knowledge State
**VI:** Trạng thái nhận thức  
**ID:** `KNOWLEDGE_STATE`  
**Status:** SYSTEM-SPECIFIC

State của Witness về Story.

Legacy states có thể gồm:
- UNKNOWN;
- BELIEVES;
- DOUBTS;
- KNOWS_FALSE.

Exact state machine chưa chốt.

---

## 23.16 Knowledge Propagation
**VI:** Lan truyền nhận thức  
**ID:** `KNOWLEDGE_PROPAGATION`  
**Status:** SYSTEM-SPECIFIC

Process truyền knowledge/counter-knowledge giữa Witness theo delay/propagation Contract.

---

## 23.17 Absorption
**VI:** Hấp Thu property  
**ID:** `ABSORPTION`  
**Status:** SYSTEM-SPECIFIC

Transfer Realized Property từ Container/Bearer về Cố Sự Chi Thần hoặc destination được Contract chỉ định.

---

# 24. RESOLUTION, COMMIT & CLEANUP

## 24.1 Resolution Order
**VI:** Thứ tự phân giải  
**ID:** `RESOLUTION_ORDER`  
**Status:** CANONICAL CORE

Canonical ordering mà Kernel xử lý:
- validate;
- snapshot;
- target;
- primitive;
- state mutation;
- Event;
- Trigger/Reaction;
- death;
- cleanup;
tùy Contract.

Terminology không chốt exact full pipeline.

---

## 24.2 Commit
**VI:** Ghi nhận state  
**ID:** `COMMIT`  
**Status:** CANONICAL CORE

Checkpoint state delta trở thành authoritative result của resolution phase.

Simultaneous Batch có thể calculate nhiều result trước rồi commit batch.

---

## 24.3 Cleanup
**VI:** Dọn dẹp  
**ID:** `CLEANUP`  
**Status:** CANONICAL CORE

Phase loại/điều chỉnh object/state không còn hợp lệ sau resolution/lifecycle.

Cleanup không được giả làm Death.

---

## 24.4 Atomicity
**VI:** Tính nguyên tử của operation  
**ID:** `ATOMICITY`  
**Status:** CANONICAL CORE

Property xác định operation/state group được commit như một đơn vị hay có thể bị observable ở giữa.

Exact atomic boundary thuộc Contract.

---

# 25. DETERMINISM & TRACE

## 25.1 Deterministic RNG
**VI:** RNG xác định bằng seed  
**ID:** `DETERMINISTIC_RNG`  
**Status:** CANONICAL CORE

Randomness phải reproducible khi cùng authoritative state/seed/stream.

Dùng cho:
- first-side RNG;
- random target;
- random appearance;
- random Combat Definition;
- reroll.

---

## 25.2 RNG Candidate Set
**VI:** Tập ứng viên RNG  
**ID:** `RNG_CANDIDATE_SET`  
**Status:** CANONICAL CORE

Exact set eligible tại random selection timing point.

---

## 25.3 Reroll
**VI:** Roll lại  
**ID:** `REROLL`  
**Status:** CANONICAL CORE

Thực hiện random draw mới khi explicit policy cho phép.

Không tự reroll vì target invalid/dead nếu Contract không nói vậy.

---

## 25.4 Execution Trace
**VI:** Nhật ký phân giải  
**ID:** `EXECUTION_TRACE`  
**Status:** CANONICAL CORE REQUIREMENT

Ordered diagnostic record của authoritative simulation.

Nên có:
- action instance;
- parent/child action;
- caster;
- owner;
- source;
- behavior source;
- effect source;
- damage attribution;
- target candidate/result;
- snapshot;
- primitive execution;
- damage packet;
- Actual HP Damage;
- resource delta;
- state transition;
- authority comparison;
- Trigger Cause;
- DEATH_CONFIRMED;
- RNG.

Execution Trace là requirement kiến trúc, không chỉ debug convenience.

---

# 26. EXPLORATION / DEFENSE MODE TERMINOLOGY

## 26.1 Exploration/Defense Mode
**VI:** Mode Khai Hoang / Phòng Thủ  
**ID:** `EXPLORATION_DEFENSE_MODE`  
**Status:** MODE-SPECIFIC / CURRENT DESIGN

Mode nơi player trực tiếp điều khiển NPC khai hoang trong bí cảnh/khe nứt, khám phá nhiều Room, dẫn roster characters vào chiến đấu/khai thác, xây structures và đưa Base tới extraction.

Current explicit mode differences:
- không dùng SSI;
- không dùng Luân Hồi;
- roster character kit đơn giản hơn turn-based;
- vẫn có Rage;
- actions có thể gain AE;
- có spatial movement;
- có movement speed/attack speed/weight.

---

## 26.2 Explorer NPC
**VI:** NPC khai hoang do player điều khiển  
**ID:** `EXPLORER_NPC`  
**Status:** MODE-SPECIFIC

Player avatar/commander của một expedition run.

Không mặc định là roster Character.

---

## 26.3 Room
**VI:** Phòng / khu vực bí cảnh  
**ID:** `ROOM`  
**Status:** MODE-SPECIFIC

Spatial region của stage.

Room có thể:
- unknown;
- cleared;
- controlled;
- abandoned;
- hostile;
- resource-bearing;
- fortified.

Room ≠ turn-based Slot.

---

## 26.4 Structure
**VI:** Kiến trúc  
**ID:** `STRUCTURE`  
**Status:** MODE-SPECIFIC

Buildable object dùng tài nguyên local.

Có thể gồm:
- defense tower;
- utility;
- resource converter;
- gravity-related structure;
- Base support.

---

## 26.5 Local Resource
**VI:** Tài nguyên nội bộ mode  
**ID:** `LOCAL_RESOURCE`  
**Status:** MODE-SPECIFIC

Resource dùng trong Exploration/Defense economy.

Không phải cross-mode currency.

---

## 26.6 Base
**VI:** Căn cứ  
**ID:** `BASE`  
**Status:** MODE-SPECIFIC

Stage objective/economic core.

Current design:
- có thể giữ/chuyển đổi local resources;
- chứa Energy;
- phải được đưa tới Extraction Point để complete stage.

---

## 26.7 Energy
**VI:** Năng lượng nội bộ  
**ID:** `BASE_ENERGY`  
**Status:** MODE-SPECIFIC

Unified economic intermediate.

Current design:
- local resources → Energy;
- Energy → local resources có hao hụt;
- settlement đếm Energy trong Base.

---

## 26.8 Extraction Point
**VI:** Điểm rút lui  
**ID:** `EXTRACTION_POINT`  
**Status:** MODE-SPECIFIC

Location stage completion khi Base được đưa tới đó theo current design.

---

## 26.9 Settlement Ratio
**VI:** Tỉ lệ kết toán  
**ID:** `SETTLEMENT_RATIO`  
**Status:** MODE-SPECIFIC

Multiplier áp lên eligible Base Energy khi stage kết thúc.

Current default:
> không Rune → `1.0`

Unconverted local resources hiện không được tính trực tiếp vào settlement.

---

## 26.10 Rune
**VI:** Rune điều chỉnh stage  
**ID:** `RUNE_MODIFIER`  
**Status:** MODE-SPECIFIC

Stage modifier làm thay đổi difficulty/reward configuration.

Exact Rune taxonomy chưa chốt.

---

## 26.11 Global Currency
**VI:** Tiền tệ toàn game  
**ID:** `GLOBAL_CURRENCY`  
**Status:** CANONICAL CORE / ECONOMY

Currency dùng qua nhiều mode.

Current named tiers:
- Vụn Nguyên Tinh;
- Hạ Nguyên Tinh;
- Trung Nguyên Tinh;
- Thượng Nguyên Tinh;
- Thần Tinh.

---

## 26.12 Movement Speed
**VI:** Tốc độ di chuyển  
**ID:** `MOVEMENT_SPEED`  
**Status:** MODE-SPECIFIC STAT

Spatial movement speed của unit.

---

## 26.13 Attack Speed
**VI:** Tốc độ tấn công  
**ID:** `ATTACK_SPEED`  
**Status:** MODE-SPECIFIC STAT

Attack cadence/speed của unit.

---

## 26.14 Weight
**VI:** Trọng lượng  
**ID:** `WEIGHT`  
**Status:** MODE-SPECIFIC STAT

Physical property dùng cho gravity/displacement/structure interaction.

---

# 27. CANONICAL DISTINCTION SUMMARY

Các cặp/nhóm sau **không được collapse**:

1. `Terminology ≠ Tag ≠ Primitive ≠ Contract ≠ Kernel`.
2. `Ability Type ≠ Action Identity ≠ Action Behavior ≠ Functional Tag`.
3. `Character Definition ≠ Character Instance`.
4. `Identity ≠ Presentation Definition ≠ Combat Definition`.
5. `definitionId ≠ iid ≠ trueSelfId ≠ lifeSerial`.
6. `Caster ≠ Owner ≠ Source`.
7. `Behavior Source ≠ Effect Source ≠ Damage Attribution`.
8. `Damage Source ≠ Damage Attribution ≠ Kill Attribution`.
9. `Natural Action ≠ Follow-up ≠ Counter ≠ Forced Action`.
10. `Multihit ≠ multiple Natural Actions`.
11. `Target Selection ≠ Area Resolution`.
12. `Target Exclusion ≠ Area Immunity`.
13. `Position Mark ≠ Actor Mark`.
14. `Damage Action ≠ Damage Packet`.
15. `Damage Packet ≠ Actual HP Damage ≠ Overkill`.
16. `Physical Damage ≠ Will Damage ≠ True Damage`.
17. `True Damage ≠ Penetration`.
18. `True Damage ≠ Shield Piercing`.
19. `Shield ≠ Damage Reduction`.
20. `Heal ≠ Shield ≠ Revive`.
21. `HP Loss ≠ Self HP Cost ≠ Self Damage`.
22. `Max HP Mutation ≠ Heal`.
23. `HP_ZERO ≠ DEATH_CONFIRMED`.
24. `Death Prevention ≠ Revive`.
25. `Revive ≠ Reincarnation ≠ Rebirth`.
26. `Removed ≠ Despawned ≠ Fusion Consumed ≠ Erased ≠ Death`.
27. `Rank ≠ Class ≠ Element ≠ Authority`.
28. `Axiom Identity ≠ Authority Tier`.
29. `Thần Tính ≠ Damage Immunity`.
30. `Presentation visibility ≠ battlefield occupancy`.
31. `one Puppet per Life Cycle ≠ one active Puppet total`.
32. `Capability Requirement ≠ Realized Property`.
33. `Narrative Property ≠ automatically Functional Tag`.
34. `Turn Boundary ≠ Actor Natural Action Window ≠ Natural Action ≠ Round ≠ Slot Clock`.
35. `Local Resource ≠ Base Energy ≠ Global Currency`.
36. `turn-based Slot ≠ Exploration Room`.
37. `Target Lock ≠ Hit Admission ≠ Guaranteed Hit`.
38. `ENTER_FIELD / LEAVE_FIELD ≠ cause-specific Deploy / Revive / Death / Removed`.
39. `Deck membership ≠ current deployment state / deployability`.
40. `Deployment Cost Bar ≠ AE ≠ Rage`.
41. `Full Rage ≠ Ultimate autocast`.
42. `Materialization ≠ presence-transition cause identity`.

---

# 28. CANONICAL RULES RECOVERED

1. **Một semantic chỉ có một Canonical Tag nếu semantic đó được Tag Registry chọn làm Tag.**
2. Không tạo Tag alias cho cùng semantic.
3. Number/percent/cost/duration/threshold/count là Parameter.
4. Ability Type không phải Functional Tag.
5. Action Identity và Action Behavior là hai lớp khác nhau.
6. Tag không thực thi logic.
7. Primitive mới là executable building block.
8. Primitive không ánh xạ 1:1 với Tag.
9. Character Kit là composition, không phải custom behavior class mặc định.
10. Target Selection và Area Resolution là hai phase khác nhau.
11. Direct Target Exclusion không tự làm fixed AoE miss.
12. Basic Attack damage profile reuse không tự biến Action thành Basic Attack.
13. Follow-up/Counter/Forced Action không mặc định là Natural Action.
14. Multihit không mặc định tạo nhiều Natural Action.
15. Damage Packet khác Actual HP Damage.
16. Actual HP Damage không tính Shield absorption hoặc Overkill.
17. True Damage không mặc định xuyên Shield.
18. HP Loss/Self HP Cost không phải Damage.
19. Self HP Cost phải có payment semantics.
20. HP_ZERO chưa phải confirmed death.
21. Death Prevention xảy ra trước DEATH_CONFIRMED.
22. Ordinary Revive xảy ra sau DEATH_CONFIRMED.
23. Identity khác Presentation khác Combat Definition.
24. Axiom Identity khác Authority Tier.
25. Thần Tính không mặc định chặn direct Damage.
26. Composite child action có thể preserve hoặc inherit Authority tùy Contract.
27. Presentation/VFX không được dùng làm authoritative gameplay state nếu không có explicit binding.
28. Deterministic RNG cần candidate set + timing + policy rõ.
29. Execution Trace là first-class architecture requirement.
30. Mode Profile phải cho phép mode mới bỏ SSI/Luân Hồi mà không phá semantic global.
31. Pygmalion mỗi Life Cycle tạo một Puppet mới; Puppet cũ vẫn tồn tại tới khi chính nó bị remove.
32. Narrative System cần capability query nhưng không được ép mọi Narrative Property thành Functional Tag.

---

# 29. UNRESOLVED REGISTER

Các điểm dưới đây **cố ý chưa chốt** trong Terminology vNext.

## 29.1 Death / Life
1. Global default Revive có tăng `lifeSerial` không?
2. Reincarnation Waiting Window = 4 decrement theo event/clock nào?
3. Actor chết/absent có personal Turn Boundary không?
4. Revive materialization chọn Position/Slot thế nào?
5. Death của Combat Object khác Combat Unit ra sao ở event taxonomy?
6. `REINCARNATION_EXHAUSTED` scope là per-route hay toàn encounter theo từng system?

## 29.2 Turn / Clock
7. Exact runtime point của `TURN_BOUNDARY`.
8. CC mất Natural Action ảnh hưởng Boundary event ordering thế nào?
9. Slot Clock canonical API.
10. Side Pass có event riêng không?
11. Natural Action begin/complete/commit event taxonomy.

## 29.3 Damage
12. `FINAL_DAMAGE_REDUCTION` exact phase.
13. True Damage có bypass Final Damage Reduction không?
14. Reflect recursion default chi tiết.
15. Lifesteal observer timing.
16. Damage threshold dùng Action-start Max HP hay current-at-commit Max HP theo default nào?

## 29.4 Target
17. Default duplicate policy của random multi-target.
18. Default reroll khi target chết/invalid.
19. Random selection snapshot timing.
20. Target Scope có cần Functional Tags riêng không?
21. `AOE_RANDOM` legacy sẽ giữ tên hay migrate sang random multi-target representation?

## 29.5 Trigger
22. REACTION có cần Functional Tag không?
23. AUTO_TRIGGER có cần Functional Tag không?
24. DAMAGE_TRIGGER có cần Functional Tag không?
25. THRESHOLD_TRIGGER có cần Functional Tag không?
26. ACTION_COUNTER có cần Functional Tag không?
27. DEATH_TRIGGER có cần Functional Tag không?

## 29.6 Authority
28. Same-tier Authority resolver.
29. Specificity vs higher Authority.
30. Explicit Exception vs same-tier Axiom.
31. Dynamic Authority sampling timing.
32. Default Composite Authority Policy.

## 29.7 Pygmalion
33. Puppet inherit Class?
34. Puppet inherit Element?
35. Exact Pygmalion Skill 1 target scope.
36. Attribution của inherited secondary effects.
37. Inhabited Puppet Revive semantics.
38. Một Puppet có luôn max 1 Chân Ngã tại một thời điểm không?

## 29.8 Narrative
39. Capability query chỉ đọc Tag hay cả structured Schema?
40. Narrative Property có namespace riêng không?
41. Witness perception model.
42. Exact Belief gain formula.
43. Knowledge Propagation delay.
44. Realized Property Authority.
45. Container erase/return behavior.

## 29.9 New Mode
46. AE ownership trong Exploration/Defense.
47. Action cadence model.
48. Local Resource persistence scope.
49. Base movement mechanics.
50. Base failure state.
51. Rune difficulty/reward rule.
52. Settlement → Global Currency conversion formula.

---

# 30. CHẶNG TIẾP THEO — KHÔNG THỰC HIỆN TRONG FILE NÀY

Sau khi Terminology vNext được review/chấp nhận:

## Chặng C — `02_TAG_vNext.md`

Mỗi candidate Tag phải qua:

1. **Semantic Distinctness Test**
2. **Queryability Test**
3. **Parameter Test**
4. **Layer Test**
5. **Duplicate Test**

Không được copy Tag Registry legacy nguyên xi.

Các group cần Layer Review đặc biệt:
- Target Scope tags;
- Trigger tags;
- Reaction;
- Action Behavior tags;
- AOE_RANDOM;
- FINAL_DAMAGE_REDUCTION;
- UNIQUENESS;
- DIVINE_NATURE;
- DEATH_TRIGGER;
- EXECUTE.

---

# 31. CHECKSUM CHO MODEL MỚI

Một model hiểu đúng Terminology vNext phải chấp nhận đồng thời:

- Skill copy Basic Attack damage profile không tự là Basic Attack.
- Follow-up dùng Basic Attack behavior không tự là Natural Action.
- Multihit không tự là nhiều Natural Action.
- True Damage không tự xuyên Shield.
- HP Cost không tự phát Damage Event.
- HP Loss hậu-action không tự là Cost.
- HP_ZERO chưa phải DEATH_CONFIRMED.
- Death Prevention không phải ordinary Revive.
- Revive không phải Reincarnation.
- Direct Target Exclusion không làm fixed AoE miss.
- Invisible presentation không xóa battlefield occupancy.
- Identity có thể giữ trong khi Presentation Definition thay đổi.
- Combat Definition có thể khác Presentation Definition.
- Behavior Source có thể khác Damage Attribution.
- Outer Ultimate có thể preserve hoặc override child Authority tùy Contract.
- Character mang Axiom không làm mọi skill thành Axiom Authority.
- Pygmalion tạo một Puppet mỗi Life Cycle nhưng có thể có nhiều Puppet cùng lúc.
- Story query capability không có nghĩa mọi Story property phải thành Tag.
- Tag không thực thi logic.
- Primitive không được thiết kế 1:1 với Tag.
- Kernel không được dùng character-specific switch cho mechanic có thể composition hóa.
- Mode mới có thể bỏ SSI/Luân Hồi mà không làm thay đổi nghĩa global của SSI/Luân Hồi.
- Target Lock không tự là Guaranteed Hit.
- Guaranteed Hit chỉ bypass ordinary Miss/Dodge/Evasion, không tự thắng Authority.
- Enter/Leave Field được xác định bằng Combat-Instance-local presence transition, không bằng animation/visibility.
- DEATH_CONFIRMED không tự đồng nghĩa LEAVE_FIELD.
- Deck membership không tự đồng nghĩa currently deployable.
- Deployment Cost Bar, AE và Rage là ba resource semantic khác nhau.
- Full Rage không tự tạo hoặc cast Ultimate.

Nếu model không giữ được các distinction này:
> chưa nên cho model đó canonicalize `TAG vNext` hoặc `PRIMITIVE.md`.

---

# 32. END STATE OF STAGE B

Sau file này:

- `terminology.md` legacy vẫn có giá trị lịch sử.
- `01_TERMINOLOGY_vNext.md` là working canonical candidate mới.
- `00_CANONICAL_RECOVERY_AUDIT.md` vẫn là provenance/conflict ledger.
- Tag legacy không còn được xem là nguồn quyết định Terminology.
- `TAG vNext` chưa được tạo.
- `PRIMITIVE.md` chưa được tạo.
- `ABILITY_SCHEMA.md` chưa được tạo.
- `CONTRACTS.md` chưa được tạo.
- `KERNEL_RUNTIME.md` chưa được tạo.

Điều này là chủ ý.

Terminology phải ổn semantic trước khi các layer dưới bắt đầu khóa execution.
