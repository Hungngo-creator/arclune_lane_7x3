# CỐ SỰ CHI THẦN
## Prime — Hoá Thân của Hoang Ngôn Chi Thần
### Chuẩn hóa concept / Narrative System

> **Khái quát gameplay:** Chọn Vật Chứa + Cố Sự → tìm Bearer/Proof Subject phù hợp bằng Capability Tag → gieo Cố Sự vào chiến trường → tích Causal Belief từ các Chân Ngã đủ điều kiện → tạo và vượt qua Proof Event/Counter-Proof → Thực Hóa → giữ Vật Chứa cho đồng minh hoặc Hấp Thu để biến thuộc tính đã thành thật thành một phần bản thân.
>
> **Khái quát bản chất:** Hoang Ngôn Chi Thần không cần biến một điều hoàn toàn giả thành thật. Hắn tạo một câu chuyện có phần lớn bằng chứng là thật nhưng gài sai quan hệ nhân quả; người khác tin rằng nguyên nhân là thứ hắn kể, và khi Causal Belief đủ lớn, hiện thực tự sửa để nguyên nhân sai ấy trở thành sự thật.

## I. Thân phận và bản chất

**Tên sử dụng:** Cố Sự Chi Thần. **Bản chất thật:** Hoang Ngôn Chi Thần. Hắn luôn tự xưng với chư thần là **Cố Sự Chi Thần** và không kể Cố Sự về chính mình vì một lời nói dối tự thuật về bản thân dễ bị nghi ngờ hơn. Hắn kể chuyện về vật thể, người khác và sự kiện bên ngoài. Nguyên lý cốt lõi là **9 phần thực, 1 phần giả**: phần lớn sự kiện được chứng kiến là thật; phần giả nằm ở lời giải thích/quan hệ nhân quả. Khi đủ người tin vào quan hệ nhân quả sai đó, Reality sửa lại chính nó.

Ví dụ: một character vốn đã có True Damage. Cố Sự Chi Thần cho character đó cầm một thanh kiếm và kể rằng “thanh kiếm này ban cho người sử dụng khả năng gây True Damage”. Witness thấy kiếm → tấn công → True Damage và ngộ nhận kiếm là nguyên nhân. Nếu đủ Causal Belief, kiếm thực sự trở thành nguồn của property. Nếu một Witness đã từng thấy Bearer gây True Damage trước khi cầm kiếm thì nó biết causal claim là sai và không cung cấp Causal Belief cho Story.

## II. Rank / Class / Element / Lục Cực Đồ

**Rank:** Prime. Prime phù hợp vì character thao túng narrative/causal belief ở cấp hệ thống và tiêu thụ Capability Tags của roster. **Class:** Mage là lựa chọn phù hợp; identity đến từ nhận thức, câu chuyện và hiện thực, không phải summon hay physical combat. **Element:** chưa cần cố định; Effective Element có thể do build/Công Pháp quyết định.

**Lục Cực Đồ:** DMG 4/5, SUR 3/5, CTL 5/5, CMP 5/5, MIC 5/5, VIS 2/5. DMG 4 vì property Realized có thể rất mạnh nhưng damage không phải core của mọi Story. SUR 3 vì survival không phải identity chính. CTL 5 vì hắn chọn narrative objective, Bearer và cách battlefield phải bảo vệ/kiểm chứng. CMP/MIC 5 vì phải đọc Tag, Target Requirement, Proof Event, Belief, Stability, Realization và Absorption. VIS 2 vì nếu UI không tốt player khó hiểu “đang kể chuyện / đang được tin / bị phản chứng / đã thành sự thật”.

**Engine Risk:** 5/5. **Mechanic Profile:** Narrative Container, Causal Belief, Witness System, Proof/Counter-Proof, Reality Realization, Property Transfer, Capability-Tag Targeting.

## III. Tag là nền tảng bắt buộc

Tag của Passive/Basic/Skill/Ultimate đã tồn tại trong game nhưng hiện là legacy/tạp nham do kernel chưa hoàn thiện. Cố Sự Chi Thần là một trong các character chứng minh Tag phải được chuẩn hóa trước implementation của Narrative System. Ideas hiện tại không sai; vocabulary/semantics cần quy nhất.

Cố Sự **không được target Bearer bằng random thuần** nếu Story yêu cầu capability cụ thể. Story phải đọc **Capability Tag** để tìm actor phù hợp. Ví dụ Skill 1 của actor A có tag `XOA_DEBUFF`, Story của Vòng Cổ cần `CURSE_RESISTANCE`/capability tương ứng: engine phải tìm actor phù hợp thay vì random actor không có khả năng liên quan. Không hardcode từng character; Story đọc Capability Tags.

Nên tách:
- **Functional Tag:** skill làm gì, ví dụ `XOA_DEBUFF`, `TRUE_DAMAGE`, `HEAL`, `SHIELD`, `REVIVE`, `TAUNT`, `BLEED`, `MARK`, `AOE_FIXED`, `AOE_RANDOM`.
- **Story/Capability Requirement:** Story cần capability nào ở Bearer/Proof Subject.
- **Narrative Tag:** thuộc tính mà Cố Sự tuyên bố, ví dụ `UNBREAKABLE`, `CURSE_RESISTANT`, `GODSLAYER`, `UNFAILING`.
Authority Tier vẫn tách khỏi Axiom Identity.

## IV. Vật Chứa không phải một summon/object schema duy nhất

**Vật Chứa = phương tiện để một Cố Sự biểu hiện và có thể được chứng thực trong hiện thực**, không đồng nghĩa với “một object đặt lên slot”. Các kiểu:
- **Deployed:** tồn tại độc lập trên sân; phù hợp Khiên, Hộp, Cờ, Bia.
- **Wielded:** được một actor cầm và sử dụng; phù hợp Kiếm, Dao, Trượng.
- **Equipped/Bound:** gắn lên một Bearer; phù hợp Vòng Cổ, Nhẫn, Mặt Nạ.
- **Event/Phenomenon:** Cố Sự tồn tại như hiện tượng/sự kiện thay vì item.

Không ép mọi Container có cùng HP bar. Schema chung chỉ cần bảo đảm Story Instance, Belief, Proof, Stability, Realization, Failure, Absorption và các rule riêng.

## V. Story Instance lifecycle

Các state chính: **ARMED → CREATED → IN_PROGRESS → REALIZED** hoặc **FAILED**.

Thành phần:
- **Container:** vật/hình thức mang Cố Sự.
- **Story Claim:** mệnh đề/quan hệ nhân quả.
- **Witness:** Chân Ngã có HP bar, ALIVE, hiện diện trong cùng Combat Instance và đủ điều kiện nhận thức theo rule.
- **Causal Belief:** mức Witness tin vào quan hệ nhân quả của Story.
- **Stability/Integrity:** mức Vật Chứa/Cố Sự còn phù hợp với hiện thực.
- **Proof Event:** sự kiện phù hợp với Story và củng cố Belief.
- **Counter-Proof:** sự kiện chứng minh causal claim sai.
- **Realization:** Belief đủ threshold khi Story chưa bị phản chứng.
- **Absorption:** chuyển property Realized về Cố Sự Chi Thần.

## VI. Tín Niệm / Witness

Không nên chỉ là timer `+X/turn`. Turn Boundary của Cố Sự Chi Thần có thể cho baseline gain, nhưng tốc độ nên phụ thuộc số Witness.

Mô hình đơn giản:
**Belief Gain = Story Base Rate × Witness Count.**

Witness hợp lệ:
- có Chân Ngã;
- có HP bar;
- ALIVE;
- đang hiện diện trong cùng Combat Instance.

Không tính:
- summon/creep không có Chân Ngã;
- actor đã chết;
- Chân Ngã đang waiting window;
- actor đang `ISOLATED_IN_DUEL` trong Giác Đấu Trường;
- object không có Chân Ngã/HP bar.

Witness Count là dynamic. Thêm/bớt character thật trên sân làm Story nhanh/chậm theo thời gian.

## VII. Knowledge và ngộ nhận

Witness không chỉ có “tin/không tin”. Có thể có:
**UNKNOWN → BELIEVES → DOUBTS → KNOWS_FALSE.**

Witness từng thấy Bearer có capability trước khi Container xuất hiện có thể biết causal claim là sai và không cung cấp Causal Belief. Nếu một Witness đang tin nhưng sau đó phát hiện bằng chứng ngược, nó chuyển sang DOUBTS/KNOWS_FALSE theo rule.

Không cần actor chat trực tiếp. Có thể dùng **Knowledge Propagation Event**.

### Knowledge Propagation
Mô hình:
**Discovery → Delay → Propagation.**

Actor phát hiện Story sai không lập tức làm cả sân biết. Trong Delay, nó có thể im lặng. Sau Delay, knowledge được propagate tới ally/Witness đủ điều kiện; những actor đó có thể mất Causal Belief.

Bản đầu nên deterministic, ví dụ propagate sau X Natural Actions/Boundary; không cần mô phỏng tính cách hội thoại.

## VIII. Stability / Counter-Proof

Không nên trừ Belief trực tiếp chỉ vì Container bị đánh. **Belief = niềm tin; Stability = mức hiện thực đang chống lại Story.**

Ví dụ Khiên Max HP 1.000:
- mất ít HP → Stability giảm ít/không đáng kể;
- mất rất nhiều HP → Stability giảm mạnh;
- HP về 0 → Container BROKEN → Story FAILED.

Witness vẫn có thể tin Khiên bất bại khi nó đang nứt; khi Khiên thật sự vỡ, Reality phản chứng Story.

## IX. Proof Loop — Khiên

Story:
> **“Chiếc khiên này không thể bị phá vỡ.”**

Hoang Ngôn Chi Thần tạo Deployed Container tại một slot hợp lệ của phe mình. Vị trí spawn nên **random trong tập slot hợp lệ bằng seeded RNG**, không phải player chọn chính xác. Player biết vị trí sau khi spawn để có thể bảo vệ nó.

Mỗi Turn Boundary của Cố Sự Chi Thần → Belief tăng theo Witness Count. Khi Khiên nhận damage mà không vỡ → Proof Event củng cố Story. Khi Stability giảm → Story vẫn có thể tiếp tục.

Nếu Shield HP = 0:
> `Container BROKEN → Story FAILED`.

Nếu Belief đạt threshold trước khi vỡ:
> `STORY_REALIZED → Khiên thực sự không thể bị phá`.

Realized Container **không cần hấp thu ngay**; nó có thể ở lại trên sân và bảo vệ/ban property cho ally.

## X. Proof Loop — Kiếm

Không đặt kiếm đứng trên một slot. Kiếm là **Wielded Container**, cần Bearer.

Story ví dụ:
> **“Thanh kiếm này ban cho người cầm khả năng gây True Damage.”**

Story đọc Capability Tags để tìm Bearer phù hợp. Actor không có capability liên quan không phải target hợp lệ cho Story này.

Witness thấy:
> Sword equipped → Bearer attacks → True Damage.

Nếu Witness không biết Bearer vốn đã có True Damage, Causal Belief tăng.

Nếu Witness từng thấy Bearer gây True Damage **không cần Sword**, nó đã biết causal claim sai và không cung cấp Belief cho Story.

Nếu Story chưa REALIZED và có Counter-Proof:
> Bearer demonstrably gây True Damage mà không có Sword → Story có thể fail/không đạt threshold tùy Story contract.

Nếu Story REALIZED:
> quan hệ nhân quả “Sword → True Damage” trở thành thật.

Khi Cố Sự Chi Thần hấp thu property của Sword, Bearer chỉ mất True Damage do Sword cung cấp; nếu Bearer có nguồn True Damage độc lập thì vẫn giữ nguồn đó.

## XI. Proof Loop — Vòng Cổ

Story:
> **“Vòng cổ này miễn nhiễm lời nguyền.”**

Vòng Cổ là Equipped/Bound Container và phải gắn lên Bearer phù hợp. Story đọc Capability Tags liên quan tới Curse/Debuff; không random actor không có khả năng tương tác với Curse.

Proof Event:
> Curse Attempt lên Bearer → Bearer không chịu effect → Witnesses thấy outcome → Causal Belief tăng.

Nếu Curse thành công trước Realization:
> Counter-Proof → Story FAIL hoặc stability/Belief bị ảnh hưởng theo contract.

Ảo ảnh có thể khiến Witness tin rằng vòng đang kháng Curse, nhưng ảo ảnh một mình không biến property thành thật; cần đủ Causal Belief và proof conditions.

Sau Realization, Vòng Cổ có thể ở lại với Bearer và cung cấp property thật. Story có thể quy định `BearerLock` hoặc `PortableAfterRealization`.

## XII. Player Preparation / Story Hub

Player **được chọn Vật Chứa + Cố Sự**, nhưng không tự tạo arbitrary effect.

Mini-hub **CỐ SỰ**:
1. Chọn Vật Chứa.
2. Chọn một Cố Sự trong Story Pool của Container.
3. Arm Story cho Ultimate kế tiếp.
4. Ultimate tạo Container và bắt đầu Story.

Không nên random Story nếu muốn giữ tactical agency. Random có thể nằm trong Proof Event/secondary detail, không thay identity Story.

Preparation không nên cho reactive menu spam; Story được arm cho Ultimate kế tiếp.

## XIII. Spawn Position

Vật Chứa spawn ở slot random hợp lệ:
- thuộc phe Cố Sự Chi Thần;
- tuân Story ContainerType;
- không lấy slot bất hợp lệ/occupancy sai;
- seeded RNG.

Player biết vị trí sau khi spawn. Đây tạo gameplay:
> chọn đúng Story nhưng phải bảo vệ objective.

## XIV. Realization / Absorption

Khi:
`Belief >= Threshold`
và
`Story chưa FAILED`
→ `STORY_REALIZED`.

Realized Container có hai hướng:
**A. Stay:** ở lại với Bearer/ally và cấp property thật.
**B. Absorb:** Ultimate/Hấp Thu thu hồi Container và chuyển property về Cố Sự Chi Thần.

Nếu Bearer chết:
> Realized Container **không DEATH_CONFIRMED**; nó `RETURNED` về Cố Sự Chi Thần vì bản chất vật chứa là một phần của hắn.

Nếu Story chưa Realized và Bearer chết:
> cần Story rule; mặc định có thể FAIL nếu Bearer là Proof Subject bắt buộc.

Không auto-absorb lúc Realization. Việc giữ property trên ally hay thu về caster là tactical choice.

## XV. Bearer Rules

Container có thể khai báo:
- `BearerRequired`
- `BearerLocked`
- `PortableAfterRealization`
- `ReturnOnBearerDeath`

Ví dụ “Vòng cổ miễn Curse” có thể portable; một Story nói về “người này không thể chết” có thể bound.

Transfer của Container không phải death event; Return là state transfer.

## XVI. Gameplay / Counterplay

Player không vote “thật/giả”. Player:
> **chọn Container + Story, chọn/tạo Bearer phù hợp bằng Tag, bảo vệ Container/Proof Subject, tạo Proof Event và giữ Story sống đủ lâu để Causal Belief vượt threshold.**

Enemy counter:
- phá Container;
- tạo Counter-Proof;
- khiến Witness biết causal claim sai;
- lan Knowledge;
- giết Bearer nếu Story cần Bearer;
- làm giảm Witness Count để chậm Belief.

Cố Sự Chi Thần là **objective-control Prime**:
> hắn không trực tiếp viết “+50% damage”; hắn làm chiến trường tin rằng một property đã tồn tại, rồi khiến property đó thật sự tồn tại.

## XVII. 9 thực 1 giả

Nguyên lý narrative:
> **Hắn không cần nói một câu hoàn toàn sai. Hắn nói chín phần đúng và cài một phần sai vào quan hệ nhân quả mà người khác dễ ngộ nhận.**

Ví dụ:
- “A có True Damage” = thật.
- “A có True Damage vì Sword” = giả.
- Witness chỉ thấy Sword + True Damage → tin causal claim.
- Belief đủ → Sword thật sự trở thành nguồn.

Do đó hắn lừa thế giới về **nguyên nhân**, không nhất thiết về **sự kiện**.

## XVIII. Narrative Contract mẫu

Mỗi Story nên khai báo tối thiểu:
- `ContainerType`
- `StoryIdentity`
- `NarrativeClaim`
- `RequiredCapabilityTags`
- `BearerRules`
- `WitnessRules`
- `BeliefThreshold`
- `BeliefGainRule`
- `ProofEvents`
- `CounterProofEvents`
- `StabilityRule`
- `RealizedProperty`
- `AbsorptionRule`
- `ReturnRule`

Ví dụ **Sword / True Damage**:
`ContainerType = WIELDED`
`RequiredCapabilityTags = TRUE_DAMAGE`
`NarrativeClaim = "Sword grants True Damage"`
`Proof = Bearer deals True Damage while equipped`
`CounterProof = Bearer demonstrably deals same True Damage without Sword`
`RealizedProperty = Sword can truly provide True Damage`
`Absorption = transfer property to Cố Sự Chi Thần`

Ví dụ **Necklace / Curse Resistance**:
`ContainerType = EQUIPPED`
`RequiredCapabilityTags = CURSE_RELEVANT`
`Proof = Curse Attempt fails on Bearer while equipped`
`CounterProof = Curse succeeds before realization`
`RealizedProperty = Necklace truly provides Curse Resistance`

Ví dụ **Shield / Unbreakable**:
`ContainerType = DEPLOYED`
`Proof = survives valid damage events`
`CounterProof = Shield HP reaches zero`
`RealizedProperty = Container cannot be destroyed by ordinary damage`

## XIX. Identity thiết kế

Cố Sự Chi Thần không phải character “có một đống vật phẩm”. Hắn là một **Narrative System Character** đọc capability của toàn roster và dùng battlefield làm môi trường chứng thực.

> **Vật Chứa → Cố Sự → Witness/Causal Belief → Proof/Counter-Proof → Thực Hóa → Giữ lại hoặc Hấp Thu.**

Một câu ngắn về gameplay:
> **“Đọc chiến trường và chọn lời nói dối mà thế giới dễ tin nhất.”**

Một câu ngắn về bản chất:
> **“Hắn khiến người khác tin sai lý do cho một điều đang đúng, rồi bắt hiện thực biến lời giải thích sai thành sự thật.”**

## XX. Authority / Axiom

Cố Sự Chi Thần là Prime và có thể dùng Story có Authority cao, nhưng **không mặc định mọi Story là Axiom**. Authority Tier của từng Story/Proof/Property phải khai báo riêng; Authority Tier và Axiom Identity là hai khái niệm độc lập.

## XXI. Engine Risk và các câu hỏi cần chốt

**Engine Risk 5/5.** Trước implementation cần chốt:
1. Exact Belief Gain formula: Base Rate × Witness Count hay có Witness Weight.
2. Story có Stability meter riêng hay chỉ event-driven Counter-Proof.
3. Knowledge Propagation delay.
4. Quyền nhận thức của Witness nếu game chưa có Perception/Line-of-Sight.
5. Final Capability Tag vocabulary sau khi quy nhất Tag.
6. Tie-break khi nhiều actor cùng Capability Tag.
7. Preparation Hub chỉ arm cho Ultimate kế tiếp hay có giới hạn thay đổi.
8. Realized Container đi đâu nếu Bearer rời sân nhưng chưa chết.
9. Realized Container bị ERASED thì property Return hay mất.
10. Story đang IN_PROGRESS khi caster vào Luân Hồi/Arena: pause, transfer hay fail.
11. Interaction với Duy Nhất/Axiom khác khi Realized Property tạo bản thể/definition đặc biệt.
12. Exact absorption transaction và timing.

## XXII. Canon identity

**Cố Sự Chi Thần là Hoá Thân của Hoang Ngôn Chi Thần.** Như các thần khác trong Arclune, đây là một **Hoá Thân**, không phải bản thể tối cao của thần. “Cố Sự Chi Thần” là danh xưng hắn tự nhận trong thế giới; “Hoang Ngôn Chi Thần” là bản chất thật.
