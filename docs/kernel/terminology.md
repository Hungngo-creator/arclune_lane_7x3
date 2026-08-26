# ARCLUNE — TERMINOLOGY
## Canonical Combat & Engine Terminology v0.1

> Mục đích: đây là từ điển thuật ngữ chuẩn của Arclune. Mỗi thuật ngữ có một nghĩa canonical trong kernel. Character kit, Tag Registry, Primitive Registry, Ability Schema, Damage Contract, Death Lifecycle, AI/Thiên Cơ và các mode phải dùng các định nghĩa tại đây thay vì tự diễn giải lại. File này định nghĩa ý nghĩa của khái niệm; behavior implementation cụ thể nằm ở Primitive/Contract.

> Quy tắc nền: một thuật ngữ đã canonical thì không dùng từ khác để biểu diễn cùng concept trong code/spec. Giá trị số, cost, duration, threshold và parameter không phải definition của thuật ngữ.

## 1. Identity

### Character
**VI:** Nhân vật  
**ID:** `CHARACTER`  
Một nội dung chiến đấu có Character Definition riêng, có thể sở hữu Ability, Rank, Class, Element, stat, resource và state.

### Character Instance
**VI:** Bản thể nhân vật đang tồn tại  
**ID:** `CHARACTER_INSTANCE`  
Một instance cụ thể của Character đang tồn tại trong một Combat Instance. Character Definition và Character Instance không phải cùng một khái niệm.

### Leader
**VI:** Thủ lĩnh  
**ID:** `LEADER`  
Actor được engine xác định là Leader của một phe trong Combat Instance. Leader là một Identity/target category đặc biệt và có thể có rule riêng về targetability, death, Arena, summon hoặc combat resolution.

### Deck
**VI:** Bộ bài  
**ID:** `DECK`  
Tập character/definition đang được phe sở hữu và có thể được đưa vào battlefield theo luật summon/deployment. Deck không phải battlefield hiện tại và một character nằm trong Deck không đồng nghĩa đang là Actor trên sân.

### Summon
**VI:** Triệu hồi / Thể triệu hồi  
**ID:** `SUMMON`  
Một Actor được tạo vào battlefield bởi một Ability/Effect thay vì được triển khai như một character instance thông thường. Summon có thể có hoặc không có Chân Ngã, Rank, Class, AE/Rage và các stat riêng theo contract.

### Actor
**VI:** Thực thể tham chiến  
**ID:** `ACTOR`  
Một entity có thể được SSI, Target Selection, Event, Effect hoặc Combat Rule xử lý trong Combat Instance. Character Instance, Summon, và các entity đặc biệt có thể là Actor; không phải mọi object/field đều là Actor.

### Caster
**VI:** Người thực hiện / Caster  
**ID:** `CASTER`  
Actor trực tiếp khởi tạo hoặc thực hiện một Ability/Action. Caster không mặc định là Owner của Ability/Effect và không mặc định là Damage Source.

### Owner
**VI:** Chủ thể sở hữu  
**ID:** `OWNER`  
Actor/entity mà Ability, Effect, Summon, Field, Container hoặc resource thuộc về theo contract. Owner không mặc định là Caster hoặc Damage Source.

### Source
**VI:** Nguồn  
**ID:** `SOURCE`  
Actor/entity được dùng làm nguồn attribution của một Effect/Action/Damage theo contract. Source có thể khác Caster, Owner hoặc Trigger Cause.

### Trigger Cause
**VI:** Nguyên nhân kích hoạt  
**ID:** `TRIGGER_CAUSE`  
Event/entity trực tiếp khiến một Reaction hoặc Effect được kích hoạt. Trigger Cause không mặc định là Source hoặc Caster của Effect được tạo ra.

### Side
**VI:** Phe  
**ID:** `SIDE`  
Nhóm combat mà Actor thuộc về trong một Combat Instance. Quan hệ Ally/Enemy giữa hai Actor được xác định từ Side theo Combat Contract, không phải thuộc tính cố định của Character Definition.

### Ally
**VI:** Đồng minh  
**ID:** `ALLY`  
Actor thuộc cùng Side hợp lệ với source/caster theo Combat Contract.

### Enemy
**VI:** Kẻ địch  
**ID:** `ENEMY`  
Actor thuộc Side đối nghịch với source/caster theo Combat Contract.

### Identity
**VI:** Bản sắc  
**ID:** `IDENTITY`  
Thông tin xác định “ai” một entity ở tầng hệ thống/lore, tách khỏi Presentation Definition và Combat Definition.

### Chân Ngã
**EN:** True Self  
**ID:** `TRUE_SELF`  
Identity cốt lõi của một sinh mệnh trong hệ Luân Hồi. Chân Ngã không đồng nghĩa với ngoại hình hoặc Combat Definition hiện tại.

### trueSelfId
**VI:** ID Chân Ngã  
**ID:** `TRUE_SELF_ID`  
Định danh ổn định của cùng một Chân Ngã xuyên qua các đời tái sinh theo contract Luân Hồi.

### lifeSerial
**VI:** Số đời  
**ID:** `LIFE_SERIAL`  
Giá trị phân biệt các đời sống khác nhau của cùng một Chân Ngã. Reincarnation có thể tạo lifeSerial mới; Revive thông thường không mặc định tạo lifeSerial mới.

### Presentation Definition
**VI:** Định nghĩa hiển thị  
**ID:** `PRESENTATION_DEFINITION`  
Nguồn của ngoại hình, skeleton, animation, VFX, SFX/voice presentation và fallback hiển thị. Có thể khác Combat Definition.

### Combat Definition
**VI:** Định nghĩa chiến đấu  
**ID:** `COMBAT_DEFINITION`  
Nguồn định nghĩa Passive, Basic Attack, Skill, Ultimate, Class, Rank và combat behavior của một đời hiện tại.

### Combat Instance
**VI:** Phiên giao tranh  
**ID:** `COMBAT_INSTANCE`  
Không gian logic nơi actor, action, event, target selection, state và rule được resolve. Main Battle và Arena có thể là Combat Instance khác nhau.

## 2. Ability & Action

### Ability
**VI:** Năng lực  
**ID:** `ABILITY`  
Một định nghĩa có thể được engine resolve để tạo action, reaction hoặc effect.

### Ability Type
**VI:** Loại Ability  
**ID:** `ABILITY_TYPE`  
Phân loại cấp cao của Ability: `PASSIVE` — Nội tại; `BASIC_ATTACK` — Đánh thường; `SKILL` — Kỹ năng; `ULTIMATE` — Tuyệt kỹ. Ability Type trả lời “ability này là gì?”, không mô tả toàn bộ behavior.

### Action
**VI:** Hành động  
**ID:** `ACTION`  
Một lần một actor thực hiện một ability/action được engine resolve. Action có thể chứa nhiều effect hoặc internal action.

### Natural Action
**VI:** Hành động tự nhiên  
**ID:** `NATURAL_ACTION`  
Action thực sự do actor thực hiện trong lượt tự nhiên của chính nó theo SSI. Basic Attack, Skill hoặc Ultimate do actor tự thực hiện có thể là Natural Action. Natural Action không mặc định bao gồm Passive Trigger, Reaction, Follow-up, Counter, Forced Action hoặc damage packet ngoài lượt.

### SSI
**VI:** Hệ thống thứ tự lượt  
**ID:** `SSI`  
Hệ thống quyết định thứ tự và thời điểm actor được xét để thực hiện Turn/Natural Action trong Combat Instance. SSI là nguồn sự thật cho trình tự hành động; các mechanic phụ thuộc thứ tự lượt không được tự tạo một clock riêng nếu không có contract riêng.

### Personal Turn
**VI:** Lượt cá nhân  
**ID:** `PERSONAL_TURN`  
Một lượt thuộc về riêng một actor trong SSI. Actor có thể thực hiện Natural Action trong lượt đó hoặc mất lượt theo trạng thái/Rule. Personal Turn khác Natural Action: một lượt có thể bị tiêu hao mà actor không thực hiện action do CC hoặc trạng thái khác.

### Turn
**VI:** Lượt  
**ID:** `TURN`  
Thuật ngữ chung chỉ một đơn vị lượt trong combat. Khi một mechanic yêu cầu độ chính xác, phải ghi rõ Natural Action, Personal Turn hoặc Turn Boundary; không dùng “Turn” mơ hồ nếu có thể gây nhầm lẫn.

### Valid Action
**VI:** Hành động hợp lệ  
**ID:** `VALID_ACTION`  
Một action được Combat Contract công nhận là hành động chính hợp lệ để áp dụng các hệ quả như tiêu lượt, nhận AE theo Class, giảm cooldown theo action hoặc tăng Action Counter. Valid Action không mặc định bao gồm Linked Cast, Echo, Follow-up, Counter, Reaction hoặc các action phụ.

### Linked Cast
**VI:** Cast liên kết  
**ID:** `LINKED_CAST`  
Một Ability/Effect được một Ability khác gọi trong cùng resolution nhưng không trở thành một Natural Action độc lập của actor phụ. Linked Cast không mặc định tạo AE, giảm cooldown hoặc tiêu lượt của actor phụ.

### Reactive Skill
**VI:** Kỹ năng phản ứng  
**ID:** `REACTIVE_SKILL`  
Skill chỉ có thể resolve do Trigger/Event hợp lệ, không được player chọn thủ công trong thời điểm trigger. Reactive Skill không mặc định là Natural Action.

### Turn Boundary
**VI:** Biên lượt  
**ID:** `TURN_BOUNDARY`  
Mốc thời gian dùng cho duration/periodic/state transition được định nghĩa theo Boundary. Turn Boundary không phải Natural Action. CC/mất lượt không mặc định làm Boundary biến mất nếu contract của effect vẫn cho Boundary tiến triển.

### Action Completion
**VI:** Hoàn tất hành động  
**ID:** `ACTION_COMPLETION`  
Điểm toàn bộ resolution trực tiếp của một Action đã hoàn tất và engine có thể chuyển sang các hậu quả hậu-action theo resolution order.

### Action Snapshot
**VI:** Snapshot hành động  
**ID:** `ACTION_SNAPSHOT`  
Tập target/source/stat/state được chụp tại một điểm xác định của Action để ngăn mutation giữa các hit/target làm thay đổi cùng một Action ngoài ý muốn.

### Action Identity
**VI:** Bản sắc hành động  
**ID:** `ACTION_IDENTITY`  
Nhận dạng loại Action thực sự đang resolve. Ví dụ Basic Attack action thực sự khác với một Skill chỉ dùng Basic Attack damage profile.

### Action Behavior
**VI:** Hành vi hành động  
**ID:** `ACTION_BEHAVIOR`  
Cách một Action vận hành mà không nhất thiết thay đổi Ability Type. Ví dụ dùng Basic Attack profile, composite behavior, forced behavior.

### Composite Action
**VI:** Hành động tổ hợp  
**ID:** `COMPOSITE_ACTION`  
Một outer Action chứa nhiều internal action/effect nhưng được resolve theo một contract chung. Phải chỉ rõ snapshot, resource, reaction và Natural Action behavior.

### Multihit
**VI:** Đa hit  
**ID:** `MULTIHIT`  
Một Damage Action chứa nhiều hit/Damage Packet. Multihit không tự động bằng nhiều Natural Action hoặc nhiều trigger.

### Follow-up
**VI:** Đòn nối tiếp  
**ID:** `FOLLOW_UP`  
Attack/effect phụ phát sinh từ một action/event, không mặc định là Natural Action.

### Counter
**VI:** Phản kích  
**ID:** `COUNTER`  
Action phản ứng với attack/event của đối phương, không mặc định là Natural Action.

### Forced Action
**VI:** Hành động cưỡng chế  
**ID:** `FORCED_ACTION`  
Action do hệ thống ép actor thực hiện thay vì actor tự chọn trong SSI. Không mặc định là Natural Action.

## 3. Trigger & Event

### Event
**VI:** Sự kiện  
**ID:** `EVENT`  
Occurrence được engine emit để listener/reaction theo dõi, ví dụ `DAMAGE_ACTION_COMPLETED`, `DEBUFF_REMOVED`, `DEATH_CONFIRMED`.

### Trigger
**VI:** Kích hoạt  
**ID:** `TRIGGER`  
Cơ chế xác định khi nào một Ability/Effect được phép resolve.

### Reaction
**VI:** Phản ứng  
**ID:** `REACTION`  
Ability/Effect được kích hoạt bởi một Event thay vì actor trực tiếp chọn action.

### Auto Trigger
**VI:** Tự động kích hoạt  
**ID:** `AUTO_TRIGGER`  
Ability/Effect tự kiểm tra điều kiện và resolve khi điều kiện thỏa.

### Threshold Trigger
**VI:** Kích hoạt theo ngưỡng  
**ID:** `THRESHOLD_TRIGGER`  
Trigger dựa trên việc một giá trị đạt/vượt một threshold.

### Damage Trigger
**VI:** Kích hoạt theo sát thương  
**ID:** `DAMAGE_TRIGGER`  
Trigger dựa trên Damage Event/Action/Packet theo contract.

### Action Counter
**VI:** Bộ đếm hành động  
**ID:** `ACTION_COUNTER`  
State đếm số Action/Natural Action hợp lệ cho tới khi đạt threshold. Số cụ thể là parameter, không phải tag riêng.

### Cooldown
**VI:** Hồi chiêu  
**ID:** `COOLDOWN`  
Khoảng thời gian được tính bằng Natural Action, Turn Boundary hoặc đơn vị khác theo contract trước khi Ability có thể trigger lại.

### Trigger Frequency
**VI:** Tần suất kích hoạt  
**ID:** `TRIGGER_FREQUENCY`  
Quy tắc giới hạn tần suất trigger theo Action, Boundary, Turn hoặc Combat.

### Trigger Cap
**VI:** Giới hạn kích hoạt  
**ID:** `TRIGGER_CAP`  
Giới hạn số lần trigger trong một scope xác định.

## 4. Targeting & Battlefield

### Target
**VI:** Mục tiêu  
**ID:** `TARGET`  
Entity được chọn để nhận Effect.

### Target Selection
**VI:** Chọn mục tiêu  
**ID:** `TARGET_SELECTION`  
Quá trình tạo candidate pool, filter và chọn target trước khi Effect resolve.

### Candidate Pool
**VI:** Tập mục tiêu hợp lệ  
**ID:** `CANDIDATE_POOL`  
Tập entity còn hợp lệ sau filter trước khi selection rule chọn target.

### Target Resolution
**VI:** Phán định mục tiêu  
**ID:** `TARGET_RESOLUTION`  
Quy trình chọn target cuối cùng theo Target Selection Rule.

### Target Scope
**VI:** Phạm vi mục tiêu  
**ID:** `TARGET_SCOPE`  
Phân loại đối tượng có thể nhận Effect: Self, Ally, Enemy, v.v.

### Target Filter
**VI:** Bộ lọc mục tiêu  
**ID:** `TARGET_FILTER`  
Điều kiện loại/giữ entity trong Candidate Pool, ví dụ exclude Leader, exclude Divine Nature, exclude Forgotten.

### Target Selection Rule
**VI:** Quy tắc chọn mục tiêu  
**ID:** `TARGET_SELECTION_RULE`  
Logic quyết định target cuối cùng từ Candidate Pool: random, lowest HP%, highest shield ratio, taunt priority, class priority, v.v.

### Geometry
**VI:** Hình học vùng tác động  
**ID:** `GEOMETRY`  
Mô tả hình dạng/vị trí của AOE hoặc spatial effect.

### Fixed AOE
**VI:** AOE cố định  
**ID:** `AOE_FIXED`  
AOE xác định vùng bằng geometry/position thay vì random target selection.

### Random AOE
**VI:** AOE ngẫu nhiên  
**ID:** `AOE_RANDOM`  
Nhiều target được chọn bởi random target resolution thay vì một vùng geometry cố định.

### Position
**VI:** Vị trí  
**ID:** `POSITION`  
Slot/coordinate/không gian logic của actor trên battlefield.

### Position Mutation
**VI:** Biến đổi vị trí  
**ID:** `POSITION_MUTATION`  
Effect thay đổi Position của actor.

### Slot
**VI:** Ô / vị trí ô  
**ID:** `SLOT`  
Một vị trí rời rạc trên battlefield grid mà Actor có thể chiếm hoặc được dùng làm mốc cho Geometry/Position Resolution. Slot là thuộc tính của battlefield, không phải của Actor.

### Battlefield Field
**VI:** Vùng hiệu ứng chiến trường  
**ID:** `FIELD`  
State tồn tại trên battlefield theo vùng/thời gian; không phải actor và không tự chiếm actor slot.

### Main Battle
**VI:** Chiến trường chính  
**ID:** `MAIN_BATTLE`  
Combat Instance chính của encounter.

### Arena
**VI:** Giác Đấu Trường  
**ID:** `ARENA`  
Combat Instance cô lập để xử lý duel/sub-combat theo contract của Giác Đấu Trường.

### Isolated Combat Instance
**VI:** Phiên giao tranh cô lập  
**ID:** `ISOLATED_COMBAT_INSTANCE`  
Combat Instance tách khỏi Main Battle để resolve subsystem như Arena mà không cần biến nó thành một phần trực tiếp của main timeline.

## 5. Damage

### Damage Action
**VI:** Hành động gây sát thương  
**ID:** `DAMAGE_ACTION`  
Một Action có damage payload được resolve như một đơn vị action-level.

### Damage Packet
**VI:** Gói sát thương  
**ID:** `DAMAGE_PACKET`  
Một đơn vị damage cụ thể trong Damage Action.

### Damage Source
**VI:** Nguồn sát thương  
**ID:** `DAMAGE_SOURCE`  
Ability/Effect/Actor chịu attribution cho Damage Packet.

### Effect Attribution
**VI:** Quy nguồn hiệu ứng  
**ID:** `EFFECT_ATTRIBUTION`  
Thông tin xác định Effect được ghi nhận cho Actor/Ability/Owner nào khi một Effect được tạo hoặc resolve. Effect Attribution có thể khác Caster, Owner và Trigger Cause.

### Damage Attribution
**VI:** Quy nguồn sát thương  
**ID:** `DAMAGE_ATTRIBUTION`  
Thông tin xác định Damage Packet được ghi nhận cho Actor/Ability/Effect nào về mặt combat statistics, passive interaction và damage history. Damage Attribution không mặc định trùng với Actor trực tiếp tạo animation hoặc Trigger Cause.

### Damage Profile
**VI:** Hồ sơ sát thương  
**ID:** `DAMAGE_PROFILE`  
Cấu trúc thành phần damage: Physical, Will, True, Max-HP component, v.v.

### Actual HP Damage
**VI:** Sát thương HP thực tế  
**ID:** `ACTUAL_HP_DAMAGE`  
Lượng Current HP thực sự bị mất sau mitigation và Shield interaction theo Damage Contract. Không bao gồm damage chỉ bị Shield hấp thụ và không bao gồm overkill.

### Overkill
**VI:** Sát thương vượt tử  
**ID:** `OVERKILL`  
Phần damage vượt HP còn lại sau lethal. Không mặc định là Actual HP Damage.

### Raw Damage
**VI:** Sát thương thô  
**ID:** `RAW_DAMAGE`  
Giá trị damage trước khi áp dụng ARM/RES và các mitigation/Reduction upstream.

### Final Damage
**VI:** Sát thương cuối  
**ID:** `FINAL_DAMAGE`  
Giá trị damage sau các scaling và mitigation/reduction được quy định cho Damage Resolution nhưng trước khi damage được commit vào Shield/Current HP. Final Damage không đồng nghĩa Actual HP Damage.

### Damage Mitigation
**VI:** Giảm thiểu sát thương  
**ID:** `DAMAGE_MITIGATION`  
Quá trình làm giảm Damage trước khi trở thành Final Damage, bao gồm các cơ chế defensive stat và reduction được định nghĩa ở upstream phase. Damage Mitigation khác Final Damage Reduction.

### True Damage
**VI:** Sát thương chuẩn  
**ID:** `TRUE_DAMAGE`  
Damage component không bị ARM/RES mitigation theo Damage Contract. True Damage không mặc định xuyên Shield.

### Physical Damage
**VI:** Sát thương Vật lý  
**ID:** `PHYSICAL_DAMAGE`  
Damage component theo Physical/ARM contract.

### Will Damage
**VI:** Sát thương Ý chí  
**ID:** `WILL_DAMAGE`  
Damage component theo Will/RES contract.

### Damage Reduction
**VI:** Giảm sát thương  
**ID:** `DAMAGE_REDUCTION`  
Effect giảm damage theo phase được chỉ định.

### Final Damage Reduction
**VI:** Giảm sát thương cuối  
**ID:** `FINAL_DAMAGE_REDUCTION`  
Effect giảm damage sau upstream mitigation được chỉ định và trước final HP/Shield commit. Không đồng nghĩa với ARM/RES hoặc Shield.

### Penetration
**VI:** Xuyên phòng thủ  
**ID:** `PENETRATION`  
Cơ chế làm giảm/tạm bỏ qua một phần defensive stat theo Damage Contract. Penetration không tự đồng nghĩa True Damage.

### Shield Interaction
**VI:** Tương tác với khiên  
**ID:** `SHIELD_INTERACTION`  
Rule xác định Damage Packet đi qua Shield/HP thế nào.

## 6. HP & Recovery

### Heal
**VI:** Hồi phục  
**ID:** `HEAL`  
Tăng Current HP theo Healing Contract.

### Overheal
**VI:** Hồi phục vượt mức  
**ID:** `OVERHEAL`  
Phần healing vượt lượng cần thiết để đạt Max HP.

### HP Loss
**VI:** Mất HP  
**ID:** `HP_LOSS`  
Giảm Current HP theo contract nhưng không phải Damage.

### Self HP Cost
**VI:** Chi phí HP bản thân  
**ID:** `SELF_HP_COST`  
HP Loss do chính Ability/Action dùng làm cost.

### Shield
**VI:** Khiên  
**ID:** `SHIELD`  
Một lượng hấp thụ/giảm damage theo Shield Contract.

### Shield Cap
**VI:** Giới hạn Khiên  
**ID:** `SHIELD_CAP`  
Giá trị tối đa mà một Shield cụ thể được phép tồn tại theo chính Shield Contract của nó. Shield Cap có thể phụ thuộc Max HP hoặc một stat khác. Khi Max HP thay đổi, chỉ Shield có contract phụ thuộc Max HP mới phải recalibrate theo Cap của chính nó; không áp một Shield Cap chung cho mọi Shield.

## 7. Status, Modifier & State

### Buff
**VI:** Buff  
**ID:** `BUFF`  
Status/modifier mang beneficial status identity theo contract.

### Debuff
**VI:** Debuff  
**ID:** `DEBUFF`  
Status/modifier mang harmful status identity theo contract.

### Debuff Identity
**VI:** Bản sắc Debuff  
**ID:** `DEBUFF_IDENTITY`  
Định danh riêng của một Debuff effect dùng để xác định hai Debuff có phải cùng một Debuff hay không. Hai Debuff có cùng category nhưng khác Debuff Identity không mặc định được xem là cùng loại; các mechanic yêu cầu “không nhận lại Debuff cùng loại” phải query Debuff Identity.

### Mark
**VI:** Đánh dấu  
**ID:** `MARK`  
Identity gắn trên target để Ability/Effect khác query. Mark không mặc định là Buff hoặc Debuff.

### Modifier
**VI:** Modifier  
**ID:** `MODIFIER`  
Thay đổi một giá trị/state mà không nhất thiết tạo Buff/Debuff identity.

### State
**VI:** Trạng thái  
**ID:** `STATE`  
Một điều kiện có thể tồn tại và được query/đọc bởi Combat Kernel tại một thời điểm. State có thể là tạm thời hoặc kéo dài và có thể thay đổi qua Event/Action/Commit.

### State Transition
**VI:** Chuyển trạng thái  
**ID:** `STATE_TRANSITION`  
Sự thay đổi canonical từ một State sang State khác do Event, Action, Rule hoặc Lifecycle Contract gây ra.

### Stat Mutation
**VI:** Biến đổi chỉ số  
**ID:** `STAT_MUTATION`  
Thay đổi trực tiếp Current/Base Stat theo lifecycle contract.

### Max HP Mutation
**VI:** Biến đổi Max HP  
**ID:** `MAX_HP_MUTATION`  
Thay đổi Max HP theo một mutation instance. Khi mutation hết hạn, Current HP phải được điều chỉnh theo health contract; không “heal lại” phần giảm Max HP một cách giả tạo.

### Snapshot
**VI:** Snapshot  
**ID:** `SNAPSHOT`  
Giá trị được chụp tại một thời điểm và dùng làm nguồn cố định cho effect/state về sau.

### Stat Snapshot
**VI:** Snapshot chỉ số  
**ID:** `STAT_SNAPSHOT`  
Snapshot của stat tại thời điểm được chỉ định.

### Current HP
**VI:** HP hiện tại  
**ID:** `CURRENT_HP`  
Lượng HP actor đang có tại thời điểm query, nằm trong khoảng từ 0 đến Current Max HP theo Health Contract.

### Max HP
**VI:** Max HP  
**ID:** `MAX_HP`  
Giới hạn HP của actor theo stat/state hiện hành trước khi áp dụng các query cần Current Max HP.

### Health State
**VI:** Trạng thái HP  
**ID:** `HEALTH_STATE`  
Tập trạng thái liên quan đến Current HP/Max HP như đang sống, HP_ZERO, Death Prevention và các transition trong Death Lifecycle.

### Persistent State
**VI:** Trạng thái kéo dài  
**ID:** `PERSISTENT_STATE`  
State tồn tại qua nhiều Action/Boundary tới khi có expiry/termination condition.

### Temporary State
**VI:** Trạng thái tạm thời  
**ID:** `TEMPORARY_STATE`  
State có duration/termination condition hữu hạn.

### Crowd Control
**VI:** Hiệu ứng khống chế  
**ID:** `CROWD_CONTROL`  
Nhóm trạng thái hoặc effect làm hạn chế khả năng thực hiện hành động/target/hoặc tiến trình thông thường của Actor theo CC Contract. Crowd Control là nhóm semantic; từng loại CC cụ thể phải có Identity/Contract riêng. CC không tự động làm Turn Boundary dừng.

## 8. Death / Life Cycle

### HP Zero
**VI:** HP bằng 0  
**ID:** `HP_ZERO`  
Current HP đạt 0. Không đồng nghĩa tự động với death nếu còn Death Prevention/Revive có quyền can thiệp.

### Death Prevention
**VI:** Phòng tử vong  
**ID:** `DEATH_PREVENTION`  
Cơ chế ngăn HP_ZERO trở thành DEATH_CONFIRMED hoặc thay thế death theo contract.

### DEATH_CONFIRMED
**VI:** Xác nhận tử vong  
**ID:** `DEATH_CONFIRMED`  
Checkpoint/event sau khi mọi cơ chế có quyền ngăn chết/thay thế death đã resolve và actor chính thức chết.

### Revive
**VI:** Hồi sinh  
**ID:** `REVIVE`  
Transition đưa actor đã chết trở lại combat/life state theo contract. Revive không mặc định reset toàn bộ state.

### Revive Pending
**VI:** Đang chờ hồi sinh  
**ID:** `REVIVE_PENDING`  
State trong đó actor có quyền revive nhưng chưa materialize trở lại.

### Temporarily Absent
**VI:** Tạm thời vắng mặt  
**ID:** `TEMPORARILY_ABSENT`  
Actor không hiện diện trên battlefield hiện tại nhưng chưa DEATH_CONFIRMED và không nằm trong Luân Hồi waiting window nếu contract nói khác.

### Waiting Window
**VI:** Cửa sổ chờ Luân Hồi  
**ID:** `REINCARNATION_WAITING_WINDOW`  
Khoảng giữa DEATH_CONFIRMED và bước xử lý Chân Ngã vào Luân Hồi.

### Reincarnation
**VI:** Luân Hồi / Tái sinh  
**ID:** `REINCARNATION`  
Transition trong đó một Chân Ngã bước sang life state/đời mới theo World Axiom Luân Hồi.

### Reincarnation Exhausted
**VI:** Cạn quyền tái sinh  
**ID:** `REINCARNATION_EXHAUSTED`  
State chỉ ra Chân Ngã không được tái sinh tiếp trong encounter theo contract.

### Return
**VI:** Trở về / Hoàn trả  
**ID:** `RETURN`  
Transfer object/state/property về owner/source theo contract; Return không phải death.

## 9. Authority & Axiom

### Authority
**VI:** Quyền phán định  
**ID:** `AUTHORITY`  
Cấp quyền của Ability/Effect trong việc thắng, bị override hoặc tương tác với rule khác.

### Pháp Tắc
**EN:** Law  
**ID:** `PHAP_TAC`  
Cấp Authority theo hierarchy hiện tại, cao hơn effect thường và thấp hơn Quy Tắc/Axiom theo authority contract.

### Quy Tắc
**EN:** Rule  
**ID:** `QUY_TAC`  
Cấp Authority có thể override effect/logic thấp hơn theo Authority Contract.

### Axiom
**VI:** Axiom  
**ID:** `AXIOM`  
Luật nền của thế giới/hệ thống, cao hơn Ability/Status thông thường theo Axiom Contract.

### Authority Conflict
**VI:** Xung đột quyền phán định  
**ID:** `AUTHORITY_CONFLICT`  
Tình huống nhiều rule/effect có quyền tác động lên cùng state và cần Authority Resolver xác định rule thắng.

### Explicit Exception
**VI:** Ngoại lệ chỉ định  
**ID:** `EXPLICIT_EXCEPTION`  
Ngoại lệ được khai báo rõ cho một interaction cụ thể. Không biến ngoại lệ cục bộ thành immunity global.

### Authority Resolution
**VI:** Phân giải quyền phán định  
**ID:** `AUTHORITY_RESOLUTION`  
Quy trình xác định effect/rule nào thắng khi nhiều Authority cùng tác động lên một state hoặc event.

### Authority Tier
**VI:** Cấp quyền phán định  
**ID:** `AUTHORITY_TIER`  
Giá trị xác định vị trí của một Ability/Effect trong Authority hierarchy, ví dụ thường, Pháp Tắc, Quy Tắc hoặc Axiom.

## 10. Divine Nature & Uniqueness

### Thần Tính
**EN:** Divine Nature  
**ID:** `DIVINE_NATURE`  
Axiom identity cho phép actor chống external status/effect theo contract của Thần Tính. Thần Tính không mặc định là damage immunity.

### Duy Nhất
**EN:** Uniqueness  
**ID:** `UNIQUENESS`  
Axiom/identity rule giới hạn bản thể hợp lệ của một Identity/Definition tại một thời điểm theo contract.

## 11. Resource

### Aether / AE
**VI:** Aether / AE  
**ID:** `AE`  
Resource dùng cho Skill/Ability theo Resource Contract.

### Rage
**VI:** Rage / Nộ  
**ID:** `RAGE`  
Resource dùng cho Ultimate và effect yêu cầu Rage.

### Resource Pool
**VI:** Kho tài nguyên  
**ID:** `RESOURCE_POOL`  
Nguồn resource mà actor/team/subsystem có quyền lấy hoặc trả theo contract.

### Cost
**VI:** Chi phí  
**ID:** `COST`  
Resource/state phải trả để Ability/Effect resolve.

### Gain
**VI:** Nhận tài nguyên  
**ID:** `GAIN`  
Resource/state tăng do Action/Event.

## 12. Stat & Scaling

### Stat
**VI:** Chỉ số  
**ID:** `STAT`  
Giá trị combat như Max HP, ATK, WIL, ARM, RES, HP Regen và các stat khác được kernel công nhận.

### Base Stat
**VI:** Chỉ số nền  
**ID:** `BASE_STAT`  
Stat trước các runtime modifier theo contract.

### Current Stat
**VI:** Chỉ số hiện tại  
**ID:** `CURRENT_STAT`  
Stat sau các modifier/mutation đang hoạt động.

### Derived Stat
**VI:** Chỉ số dẫn xuất  
**ID:** `DERIVED_STAT`  
Stat được tính từ stat khác theo formula.

### Rank Multiplier
**VI:** Hệ số Rank  
**ID:** `RANK_MULTIPLIER`  
Hệ số stat dựa trên Rank.

### Star
**VI:** Sao  
**ID:** `STAR`  
Cấp tiến triển của character trong roster, được dùng cùng Rank/Awaken theo progression contract để xác định stat hoặc capability bổ sung. Star không đồng nghĩa Rank.

### Awaken
**VI:** Thức tỉnh  
**ID:** `AWAKEN`  
Trạng thái/cấp tiến triển mở khóa hoặc thay đổi capability của character theo Awaken Contract. Awaken không đồng nghĩa Rank hoặc Star.

### Công Pháp
**VI:** Công Pháp  
**ID:** `CULTIVATION_ART`  
Hệ thống progression/equipment-like definition có thể sửa đổi stat, capability, tag, Element hoặc behavior của actor theo Công Pháp Contract. Công Pháp không phải innate kit của Character.

### Progression State
**VI:** Trạng thái tiến triển  
**ID:** `PROGRESSION_STATE`  
Tập trạng thái progression của một character như Rank, Star, Awaken và Công Pháp; từng hệ có contract riêng và không được gộp semantic nếu behavior khác nhau.

### Current Max HP
**VI:** Max HP hiện tại  
**ID:** `CURRENT_MAX_HP`  
Max HP sau tất cả Max HP Mutation/modifier hiện hành tại thời điểm query.

## 13. Element & Classification

### Element
**VI:** Nguyên tố  
**ID:** `ELEMENT`

### Element Tag
**VI:** Tag nguyên tố  
**ID:** `ELEMENT_TAG`  
Metadata chỉ ra Element identity đang được dùng trong Element resolution.

### Effective Element
**VI:** Nguyên tố hiệu dụng  
**ID:** `EFFECTIVE_ELEMENT`  
Element cuối cùng sau native element, gear, Công Pháp và modifier hợp lệ.
Effective Element được xác định từ toàn bộ nguồn Element hợp lệ theo Element Resolution Contract; native Element, Gear, Công Pháp và các modifier chỉ được tham gia nếu contract của từng nguồn cho phép thay đổi Effective Element.

### Class
**VI:** Class  
**ID:** `CLASS`  
Phân loại combat như Mage, Ranger, Warrior, Tanker, Assassin, Support, Summoner.

### Rank
**VI:** Rank  
**ID:** `RANK`  
Cấp sức mạnh/rarity trong roster, dùng cùng Rank Multiplier.

### Class Bonus Map
**VI:** Bản đồ lợi thế Class  
**ID:** `CLASS_BONUS_MAP`  
Bảng xác định modifier matchup giữa hai Class. Bonus được resolve từ Class của source và target theo canonical matchup rules; đây là hệ thống matchup, không phải Tag.

### Class Bonus
**VI:** Lợi thế Class  
**ID:** `CLASS_BONUS`  
Modifier được tạo khi source Class có matchup lợi thế với target Class theo Class Bonus Map. Class Bonus là kết quả matchup, không phải bản thân Class.

### Element Cycle
**VI:** Chu kỳ Nguyên tố  
**ID:** `ELEMENT_CYCLE`  
Quan hệ matchup canonical giữa các Element dùng để xác định Element Counter.

### Element Counter
**VI:** Khắc chế Nguyên tố  
**ID:** `ELEMENT_COUNTER`  
Modifier matchup sinh ra khi Effective Element của source khắc chế Effective Element của target theo Element Cycle. Element Counter là kết quả resolution, không phải Element identity.

## 14. Tag / Primitive / Schema

### Effect
**VI:** Hiệu ứng  
**ID:** `EFFECT`  
Một kết quả gameplay được áp dụng hoặc resolve lên state/target, ví dụ Damage, Heal, Debuff Cleanse, Stat Mutation.

### Effect Primitive
**VI:** Primitive hiệu ứng  
**ID:** `EFFECT_PRIMITIVE`  
Primitive chuyên biệt để engine thực thi một loại Effect canonical. Effect Primitive là behavior executable; Functional Tag chỉ mô tả semantic của Effect đó.

### Condition
**VI:** Điều kiện  
**ID:** `CONDITION`  
Một biểu thức phải được kiểm tra trước khi Trigger/Primitive/Effect được phép resolve.

### Resolution Contract
**VI:** Hợp đồng phân giải  
**ID:** `RESOLUTION_CONTRACT`  
Tập quy tắc xác định cách một Action/Effect được snapshot, target, resolve, commit, phản ứng và cleanup.

### Tag
**VI:** Tag  
**ID:** `TAG`  
Nhãn semantic canonical mô tả capability, scope, identity hoặc thuộc tính. Tag không tự động là executable behavior.

### Canonical Tag
**VI:** Tag chuẩn duy nhất  
**ID:** `CANONICAL_TAG`  
Tag đại diện duy nhất cho một semantic trong Tag Registry. Cùng semantic → cùng canonical tag, không alias.

### Functional Tag
**VI:** Tag chức năng  
**ID:** `FUNCTIONAL_TAG`  
Tag mô tả Ability/Effect thực sự làm gì, ví dụ HEAL, DEBUFF_CLEANSE, TRUE_DAMAGE.

### Primitive
**VI:** Khối hành vi  
**ID:** `PRIMITIVE`  
Building block behavior được kernel thực thi và tái sử dụng, ví dụ Heal Effect, Remove Debuff Effect, Final Damage Reduction Effect.

### Parameter
**VI:** Tham số  
**ID:** `PARAMETER`  
Giá trị cụ thể của Primitive/Ability: 25%, 20 AE, 3 target, 2 Natural Actions.

### Ability Schema
**VI:** Cấu trúc Ability  
**ID:** `ABILITY_SCHEMA`  
Schema canonical để mô tả Passive/Basic/Skill/Ultimate bằng Identity, Trigger, Target, Effect/Primitive, Parameter, Duration, Authority, Tags và Resolution Order.

## 15. Presentation

### Presentation
**VI:** Trình bày  
**ID:** `PRESENTATION`  
Lớp hiển thị: animation, VFX, SFX, voice, UI. Không tự tạo gameplay state.

### VFX
**VI:** Hiệu ứng hình ảnh  
**ID:** `VFX`  
Visual effect không tự động là gameplay effect.

## 16. Narrative System

### Narrative Container
**VI:** Vật Chứa  
**ID:** `NARRATIVE_CONTAINER`  
Phương tiện để một Cố Sự biểu hiện và có thể được chứng thực trong Reality. Không mặc định là summon/object đứng trên slot.

### Story
**VI:** Cố Sự  
**ID:** `STORY`  
Narrative Claim có thể tạo Causal Belief, Proof Event, Counter-Proof và Realization.

### Witness
**VI:** Nhân chứng  
**ID:** `WITNESS`  
Actor đủ điều kiện quan sát/nhận thức Story và có thể đóng góp Causal Belief.

### Causal Belief
**VI:** Tín Niệm Nhân Quả  
**ID:** `CAUSAL_BELIEF`  
Mức Witness tin vào quan hệ nhân quả mà Story tuyên bố, không chỉ tin rằng event có xảy ra.

### Proof Event
**VI:** Sự kiện Chứng Thực  
**ID:** `PROOF_EVENT`  
Event củng cố Causal Belief/Story.

### Counter-Proof
**VI:** Phản Chứng  
**ID:** `COUNTER_PROOF`  
Event chứng minh causal claim không đúng hoặc làm Story thất bại theo contract.

### Realization
**VI:** Thực Hóa / Thành Sự  
**ID:** `REALIZATION`  
Transition trong đó Story đủ điều kiện để thuộc tính được coi là thật.

### Knowledge Propagation
**VI:** Lan Truyền Nhận Thức  
**ID:** `KNOWLEDGE_PROPAGATION`  
Quá trình truyền nhận thức về Story/Counter-Proof giữa các actor theo delay/propagation contract.

## 17. Resolution & State Commit

### Resolution Order
**VI:** Thứ tự phân giải  
**ID:** `RESOLUTION_ORDER`  
Thứ tự canonical mà engine xử lý snapshot, target, effect, reaction, state mutation, death và cleanup.

### Commit
**VI:** Ghi nhận  
**ID:** `COMMIT`  
Điểm state được biến thành kết quả chính thức của Combat Instance.

### Cleanup
**VI:** Dọn dẹp  
**ID:** `CLEANUP`  
Xử lý entity/effect/state không còn hợp lệ sau Commit, ví dụ remove actor sau DEATH_CONFIRMED.

## 18. Canonical Rules

1. Một semantic → một Canonical Tag.
2. Không tạo alias Tag cho cùng logic.
3. Number, percent, duration, cost, threshold và count là Parameter.
4. Authority là field/contract riêng, không encode mọi Authority bằng Tag.
5. Lifecycle property là state/contract, không biến mọi lifecycle property thành Tag.
6. Presentation/VFX không tự tạo gameplay state.
7. Ability Type và Functional Tag là hai lớp khác nhau.
8. Action Identity và Action Behavior là hai lớp khác nhau.
9. Một SKILL có thể thực hiện một Basic Attack action thật sự nếu contract nói rõ; một Skill chỉ dùng Basic Attack damage profile thì không vì thế trở thành Basic Attack.
10. Target Selection và Area Resolution là hai phase khác nhau.
11. HP_ZERO và DEATH_CONFIRMED là hai trạng thái khác nhau.
12. Actual HP Damage khác Damage Packet và khác Overkill.
13. True Damage không mặc định xuyên Shield.
14. HP Loss/Self HP Cost không phải Damage.
15. Follow-up/Counter/Forced Action không mặc định là Natural Action.
16. Multihit không mặc định là nhiều Natural Action.
17. Thần Tính không mặc định là Damage Immunity.
18. Explicit Exception là exception cục bộ, không biến thành immunity global.
19. Tag Registry là nguồn canonical duy nhất cho semantic vocabulary.
20. Nếu phát hiện một mechanic mới, trước khi tạo Tag mới phải so sánh Definition + Boundary với toàn bộ Tag hiện có.
21. Nếu có cùng semantic → dùng Tag cũ.
22. Nếu khác semantic thật → chỉ khi đó mới đề xuất Candidate Tag.
23. Primitive là behavior thực thi; Tag chỉ mô tả semantic.
24. Character Kit là composition của Ability Type + Action/Trigger/Target/Primitive/Parameter/State/Authority/Tag, không phải một tập custom behavior riêng cho từng character trừ khi thật sự cần primitive mới.

## 19. Canonical Distinction Summary

**Ability Type** trả lời:
> “Đây là Passive, Basic Attack, Skill hay Ultimate?”

**Action Identity** trả lời:
> “Action thực sự đang resolve là loại gì?”

**Action Behavior** trả lời:
> “Action vận hành theo behavior nào?”

**Functional Tag** trả lời:
> “Ability/Effect có semantic capability gì?”

**Targeting** trả lời:
> “Nó chọn/tác động lên ai và theo hình thức nào?”

**Trigger/Event** trả lời:
> “Khi nào nó chạy?”

**Primitive** trả lời:
> “Kernel thực sự thực thi behavior gì?”

**Parameter** trả lời:
> “Giá trị cụ thể là bao nhiêu?”

**State/Lifecycle** trả lời:
> “Effect tồn tại và kết thúc thế nào?”

**Authority** trả lời:
> “Nó có quyền phán định tới đâu?”

**Resolution Order** trả lời:
> “Các bước được resolve theo thứ tự nào?”

**Presentation** trả lời:
> “Player nhìn thấy nó như thế nào?”

> Đây là ranh giới nền giữa Terminology, Tag Registry, Primitive Registry, Ability Schema và Character Kit.
