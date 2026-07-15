# HÓA THÂN VỊ TRI CHI CHỦ — KHÁI NIỆM, CƠ CHẾ NỀN VÀ KHUNG KIT

> Tài liệu này gom những phần đã thống nhất về khái niệm **Chưa Biết / Vị Tri**, cách biểu diễn trong code và khung kit cụ thể đã đề xuất.  
> Các hệ số, chi phí AE, cooldown và tên kỹ năng vẫn là **số đề xuất để phát triển tiếp**, chưa phải bản cân bằng cuối.

---

# 1. Vấn đề trung tâm của khái niệm “Chưa Biết”

“Chưa Biết” rất dễ bị thiết kế lệch thành một trong ba thứ:

```text
Random
Che giấu thông tin
Một tập hợp nhánh nếu–thì
```

Ba thứ đó có thể xuất hiện trong kit, nhưng không phải bản chất sâu nhất của Vị Tri.

Điểm cốt lõi nên là:

> **Một kết quả chưa được sinh ra, chứ không chỉ là một kết quả đã tồn tại nhưng chưa được nhìn thấy.**

Do đó phải tách ba trạng thái.

## 1.1. Đã xác định nhưng bị che giấu

Code đã biết:

```text
Tag thật là Quy Tắc.
Mục tiêu đã được chọn.
Kết quả đã được chốt.
```

Player hoặc phe địch chưa thấy.

Đây là:

```text
Bí mật
Che giấu
Thông tin ẩn
```

Nó không phải Vị Tri theo nghĩa sâu nhất.

## 1.2. Chưa được xác định

Code chưa chốt kết quả ở thời điểm hiệu ứng xuất hiện.

Ví dụ:

```text
Hiệu ứng đã tồn tại.
Nó có nhiều khả năng hợp lệ.
Kết quả chỉ được sinh ra khi một điều kiện xảy ra.
```

Đây là:

```text
Chưa Định
```

Đây là tầng thích hợp nhất để chuyển thành gameplay.

## 1.3. Không thể được biết

Không player, AI, tiên tri hay cơ chế kiểm tra nào có thể biết.

Đây là:

```text
Bất Khả Tri
```

Bất Khả Tri tuyệt đối không nên vận hành toàn bộ kit, vì engine vẫn cần quy trình resolve rõ ràng và player phải hiểu tại sao một tương tác xảy ra.

Tầng này chỉ nên dùng cho:

```text
Lore
Thần Tính
Axiom
Một ngoại lệ cực hiếm
```

---

# 2. Biết quy luật không làm Vị Tri biến mất

Nghịch lý:

```text
Nếu ta hiểu nhân vật Chưa Biết thì nó đâu còn là Chưa Biết?
```

Cách giải quyết:

> **Ta có thể biết quy luật của Vị Tri nhưng vẫn không biết kết quả mà quy luật đó sẽ sinh ra trong từng tình huống.**

Vị Tri là một quan hệ:

```text
Chủ thể X chưa biết dữ kiện hoặc kết quả Y tại thời điểm T.
```

Tác giả và engine có thể biết:

- Điều kiện nào tạo Khả Thể.
- Khi nào một Khả Thể phải resolve.
- Ai có quyền can thiệp.
- Những giới hạn nào không được vượt qua.

Nhưng tại thời điểm hiệu ứng vừa xuất hiện:

```text
Kết quả cuối vẫn chưa tồn tại.
```

Câu định nghĩa phù hợp:

> **“Ta không phải điều vĩnh viễn không thể biết. Ta là khoảnh khắc trước khi sự biết trở thành khả dĩ.”**

> **“Ngươi có thể hiểu quy luật của ta. Nhưng quy luật ấy không cho ngươi biết kết quả.”**

> **“Khi ngươi biết ta, ta không biến mất. Ta chỉ lùi lại phía sau điều tiếp theo ngươi chưa biết.”**

---

# 3. Ba lớp dữ liệu phải tách riêng

Để code sạch, luôn tách:

```ts
type UnknownState = {
  objectiveTruth: ObjectiveTruth;
  observerKnowledge: ObserverKnowledge;
  resolutionState: ResolutionState;
};
```

## 3.1. `objectiveTruth` — Sự thật khách quan

Những thứ engine buộc phải biết để game hoạt động:

- `trueTag`
- nguồn hiệu ứng
- chủ sở hữu
- danh sách khả năng hợp lệ
- quy tắc resolve
- giới hạn tag
- loại payload

## 3.2. `observerKnowledge` — Tri thức của từng phe

Mỗi phe có thể biết khác nhau:

```ts
type KnowledgeState = "UNKNOWN" | "OBSERVED" | "KNOWN";

type ObserverKnowledge = {
  ally: KnowledgeState;
  enemy: KnowledgeState;
};
```

Ví dụ:

```ts
trueTag = "RULE";

knownTagBySide = {
  ally: "RULE",
  enemy: "UNKNOWN"
};
```

## 3.3. `resolutionState` — Kết quả đã được sinh ra chưa

```ts
type ResolutionState =
  | "UNRESOLVED"
  | "RESOLVED"
  | "ERASED";
```

Một hiệu ứng có thể đồng thời:

```text
Có trueTag rõ ràng trong engine.
Tag chưa được phe địch biết.
Kết quả số cuối vẫn chưa được resolve.
```

Đây là ranh giới giữa **Sự thật**, **Tri thức** và **Kết quả**.

---

# 4. Tag vẫn phải tồn tại trong code

Vị Tri Chi Chủ không thay đổi tag như Danh Chủ.

Danh Chủ:

```text
Thay đổi recognizedTag.
Quy Tắc có thể bị thế giới công nhận thành Pháp Tắc.
```

Vị Tri Chi Chủ:

```text
trueTag vẫn giữ nguyên.
Chỉ trì hoãn thời điểm phe đối phương biết tag đó là gì.
```

Ví dụ:

```ts
trueTag = "RULE";

knownTagBySide = {
  ally: "RULE",
  enemy: "UNKNOWN"
};
```

Engine vẫn resolve bằng:

```ts
resolveTagConflict(attacker.trueTag, defender.trueTag);
```

UI/VFX phe địch dùng:

```ts
displayTag =
  knowledgeRecord.enemy === "KNOWN"
    ? skill.trueTag
    : "UNKNOWN";
```

---

# 5. Khi phán định xung đột tag

## 5.1. Trước xung đột

Phe địch thấy:

```text
Tag: ?
```

VFX không công bố rõ Pháp Tắc hay Quy Tắc.

Các cơ chế cần biết trước tag không được tự kích hoạt dựa trên một thông tin chưa được nhận diện.

Ví dụ:

```text
“Nếu đối phương sắp dùng Quy Tắc, tự dựng khiên.”
```

Không được kích hoạt trước nếu tag vẫn là `UNKNOWN`.

## 5.2. Khi xung đột xảy ra

Engine dùng `trueTag`.

VFX có thể lóe tag thật tại khoảnh khắc va chạm:

```text
? → Quy Tắc
```

Combat log phải hiển thị đủ để player hiểu vì sao phán định thắng hoặc thua.

Ví dụ:

```text
Quyền năng chưa xác định đã biểu lộ là Quy Tắc.
Phán định xung đột hoàn tất.
```

## 5.3. Sau xung đột

Thông tin đó trở thành `Đã Quan Sát` hoặc `Đã Biết` với phe trực tiếp chứng kiến.

Nguyên tắc:

> **Một điều đã bị quan sát thì trở thành Đã Biết. Vị Tri không xóa kiến thức cũ; nó sinh ra điều chưa biết mới.**

Không nên giấu lại cùng một tag cố định vô hạn, vì như vậy sẽ lấn sang quyền năng Ký Ức hoặc chỉ còn là che UI.

---

# 6. Random chỉ là công cụ phụ

Không nên xây toàn kit bằng:

```text
Ngẫu nhiên mục tiêu.
Ngẫu nhiên hiệu ứng.
Ngẫu nhiên tag.
Ngẫu nhiên kết quả.
```

Như vậy người chơi chỉ cảm thấy đang đánh bạc.

Một Prime Vị Tri chất lượng nên có ba tầng:

```text
1. Thông tin chưa được công bố.
2. Kết quả chưa được chốt.
3. Hành động trên chiến trường buộc kết quả thành hình.
```

Player điều khiển:

- Phạm vi các khả năng.
- Thời điểm resolve.
- Khả Thể nào được giữ.
- Khả Thể nào bị xóa.
- Có cưỡng ép kết quả hay để nó tự nhiên hình thành.

---

# 7. Bộ thuật ngữ cốt lõi

## 7.1. Chưa Định

Trạng thái một hiện tượng đã bắt đầu tồn tại nhưng chưa có kết quả cuối.

```text
outcomeId = null
```

Không phải kết quả đã được chọn rồi giấu đi.

## 7.2. Khả Thể

Một kết quả có quyền trở thành hiện thực nhưng chưa được xác nhận.

Khả Thể có thể chứa:

```text
Damage
Heal
Shield
Một hình thái vật thể
Một vùng lợi/hại
Một kết quả hành động
```

## 7.3. Quan Trắc

Một hành động hoặc sự kiện khiến Chưa Định phải biểu lộ.

Quan Trắc có thể là:

- Một phe tương tác đầu tiên.
- Mục tiêu hành động.
- Hiệu ứng hết thời hạn.
- Skill của Vị Tri Chi Chủ chủ động can thiệp.
- Nguồn Khả Thể tử vong.
- Một xung đột tag thực sự xảy ra.

## 7.4. Định Luận

Một Khả Thể được chọn làm kết quả thật.

```text
UNRESOLVED → RESOLVED
```

Các khả năng còn lại mất quyền trở thành hiện thực.

## 7.5. Xóa Khả Thể

Một kết quả chưa được sinh ra bị loại bỏ.

```text
UNRESOLVED → ERASED
```

Không phải giảm sát thương sau khi damage đã xảy ra.  
Phần bị xóa chưa từng hoàn tất thành sự thật.

## 7.6. Dư Nghi

Tài nguyên riêng của nhân vật.

Dư Nghi sinh ra khi một điều mới lần đầu được bộc lộ:

- Skill địch lần đầu xuất hiện.
- Ultimate lần đầu xuất hiện.
- Dạng biến hóa mới lần đầu xuất hiện.
- Loại summon mới xuất hiện.
- Tag chưa từng biết lần đầu tham gia xung đột.

Mỗi hiện tượng duy nhất chỉ cấp Dư Nghi một lần, tránh farm lặp.

Đề xuất:

```text
Dư Nghi tối đa: 6
```

Số cuối chưa chốt.

## 7.7. Biên Tri Thức

Ranh giới giữa điều đã biết và điều chưa biết.

Khi một điều được biết, Vị Tri không mất đi hoàn toàn.  
Đường biên nhận thức mở rộng và sinh ra câu hỏi mới.

## 7.8. Điểm Mù

Đại diện cho:

```text
Điều mà mục tiêu còn không biết rằng mình đang thiếu.
```

Điểm Mù không nên dùng tràn lan trong skill thường.  
Nó phù hợp với Axiom hoặc một cơ chế cực hiếm.

---

# 8. Bản sắc khái niệm

Ba Hóa Thân có thể phân biệt:

```text
Danh Chủ:
Xác định đó là thứ nào và thế giới công nhận nó ở địa vị nào.

Ký Ức Chi Chủ:
Giữ lại kết quả sau khi nó đã xảy ra.

Vị Tri Chi Chủ:
Can thiệp vào khoảng khắc trước khi kết quả được xác định.
```

Hoặc:

```text
Trước khi xảy ra: Vị Tri
Khi được xác định: Danh
Sau khi đã xảy ra: Ký Ức
```

Câu phân biệt:

> **“Danh Chủ thay đổi cách thế giới công nhận một thứ đã được xác định. Vị Tri Chi Chủ trì hoãn việc thứ đó được xác định là gì.”**

> **“Ký Ức tái hiện điều đã xảy ra. Vị Tri giữ lại phần chưa từng hoàn tất để không có gì phải được nhớ.”**

---

# 9. Hướng class

Đề xuất:

```text
Prime
Support / Summoner
Controller
```

Vai trò:

- Trì hoãn sát thương.
- Tạo vật thể chưa có tính chất cuối.
- Thu thập Dư Nghi từ thông tin mới.
- Xóa một phần hậu quả chưa hoàn tất.
- Ép Khả Thể có lợi hoặc có hại phải Định Luận.
- Kiểm soát thời điểm kết quả trở thành thật.

Không phải healer truyền thống.  
Không phải tanker.  
Không phải nhân vật thuần RNG.

---

# 10. Axiom đề xuất — Đáp Án Chưa Từng Được Sinh Ra

## 10.1. Cơ chế

Đối với mọi Khả Thể do Vị Tri Chi Chủ tạo:

```text
Kết quả cuối không tồn tại trước thời điểm Định Luận.
```

Do đó, trước khi resolve, các kit khác không thể:

- Đọc trước kết quả cuối.
- Sao chép kết quả chưa tồn tại.
- Phản ứng dựa trên một kết quả cụ thể chưa được sinh ra.
- Đổi kết quả A thành B khi A còn chưa tồn tại.
- Xóa riêng một kết quả chưa được lựa chọn.

Nhưng đối phương vẫn có thể:

- Ngăn trạng thái Chưa Định được tạo.
- Xóa toàn bộ trạng thái Chưa Định nếu quyền năng đủ mạnh và tương tác cho phép.
- Ép Định Luận sớm.
- Giết nguồn Khả Thể.
- Tác động vào vật mang Khả Thể.
- Dùng Axiom thích hợp để bảo vệ một kết quả hoặc quá trình.

Axiom không đồng nghĩa miễn nhiễm toàn bộ.

## 10.2. Câu thoại

> **“Ta không che giấu đáp án. Đáp án chưa từng được sinh ra.”**

> **“Ngươi đang tìm đáp án cho một câu hỏi chưa được sinh ra.”**

---

# 11. Nội tại đề xuất — Biên Giới Tri Thức

## 11.1. Theo dõi điều chưa từng xuất hiện

Mọi active skill, ultimate, dạng biến hóa và loại summon của kẻ địch bắt đầu trận ở trạng thái:

```text
Chưa Được Quan Sát
```

Lần đầu xuất hiện:

```text
Chưa Được Quan Sát
→ Đã Quan Sát
→ nhận 1 Dư Nghi
```

Không tính lặp:

- Linked cast.
- Echo.
- Đòn đánh phụ.
- Cùng một summon được triệu hồi lần thứ hai.
- Cùng một skill dùng lại.
- Bản sao không tạo dữ kiện mới.

## 11.2. Tag của kỹ năng bản thân

Tag thật luôn tồn tại trong engine.

Phe địch chưa trực tiếp chứng kiến xung đột chỉ thấy:

```text
Tag: ?
```

Sau lần xung đột đầu, tag của skill đó trở thành đã biết đối với phe đã quan sát.

Không xóa kiến thức này về sau.

## 11.3. Cấu trúc dữ liệu

```ts
type KnowledgeRecord = {
  subjectId: string;
  trueTag: TagLevel;

  stateBySide: {
    ally: "UNKNOWN" | "OBSERVED" | "KNOWN";
    enemy: "UNKNOWN" | "OBSERVED" | "KNOWN";
  };

  doubtGranted: boolean;
};
```

---

# 12. Skill 1 đề xuất — Chưa Có Kết Luận

```text
Chủ động
25 AE đề xuất
CD 2 lượt hành động của bản thân đề xuất
Tag: Quy Tắc đề xuất
```

## 12.1. Cơ chế

Chọn một kẻ địch.

Hành động gây damage chính kế tiếp của mục tiêu bị chia:

```text
60% damage xảy ra ngay.
40% damage trở thành Chưa Định.
```

Phần Chưa Định được lưu thành một gói Khả Thể.

Nó tự Định Luận tại đầu lượt cá nhân kế tiếp của nguồn hành động.

## 12.2. Ví dụ

Kẻ địch đáng lẽ gây:

```text
1.000 actual HP damage
```

Kết quả:

```text
600 damage xảy ra ngay.
400 damage trở thành Khả Thể.
```

Nếu không ai can thiệp:

```text
Đầu lượt kế tiếp của nguồn:
400 damage Định Luận.
```

Nếu nguồn chết hoặc rời sân trước đó:

```text
Khả Thể mất nguồn quy chiếu.
400 damage bị xóa hoặc giải quyết theo quy tắc cuối được chốt.
```

Quy tắc mất nguồn vẫn cần khóa chính thức khi hoàn thiện kit.

## 12.3. Chỉ tách payload số

Có thể tách:

```text
Actual HP damage
Heal
Shield
```

Tùy bản skill cuối.

Không nên tách:

- Mark độc bản.
- Đổi phe.
- Biến hình.
- Triệu hồi.
- Tử vong trực tiếp.
- Xóa sổ.
- Nội tại.
- Axiom.
- Hiệu ứng không thể phân chia.

## 12.4. Câu thoại

> **“Chỉ vì ngươi đã ra tay, không có nghĩa kết quả đã được sinh ra.”**

---

# 13. Skill 2 đề xuất — Dị Vật Chưa Định

```text
Chủ động
20 AE đề xuất
CD 2 lượt đề xuất
Tag: Pháp Tắc hoặc Quy Tắc, chưa chốt
```

## 13.1. Cơ chế

Đặt một Dị Vật Chưa Định tại:

- Một ô trong Chess.
- Một vị trí trong Vĩnh Dạ.
- Một hàng, cột hoặc slot tương đương trong turn-based.

Trong trạng thái Chưa Định, Dị Vật:

- Không thuộc phe nào.
- Không có class.
- Không có rank.
- Không hành động.
- Không nhận buff dành riêng cho đồng minh.
- Không bị chọn bởi skill yêu cầu mục tiêu là đồng minh hoặc kẻ thù.
- Vẫn có thể bị AoE cố định vị trí tác động nếu thiết kế cho phép.

## 13.2. Định Luận theo tương tác đầu tiên

### Đồng minh tương tác đầu tiên

Dị Vật trở thành:

```text
Điềm Lành
```

Có thể:

- Tạo khiên.
- Tăng ARM/RES.
- Tạo vùng bảo hộ.
- Scale theo WIL.

### Kẻ địch tương tác đầu tiên

Dị Vật trở thành:

```text
Tai Họa
```

Có thể:

- Phát nổ.
- Gây AoE.
- Rút rage.
- Giảm tốc.
- Đặt một debuff nhẹ.

### Không ai tương tác trước khi hết hạn

Dị Vật trở thành:

```text
Dị Tượng
```

Tạo cả:

- Một Điềm Lành yếu hơn.
- Một Tai Họa yếu hơn.

Điểm quan trọng:

```text
Template cuối chưa được chọn sẵn.
Tương tác đầu tiên mới sinh ra template.
```

## 13.3. Pseudo-code

```ts
function observeUnknownObject(
  object: UnknownObject,
  interaction: Interaction
): void {
  if (object.state !== "UNRESOLVED") return;

  if (interaction.sourceSide === object.ownerSide) {
    resolvePossibility(object, "BENIGN");
    return;
  }

  resolvePossibility(object, "CALAMITY");
}
```

## 13.4. Câu thoại

> **“Đừng hỏi nó là gì. Hãy cẩn thận với thứ sẽ khiến nó trở thành như vậy.”**

> **“Đừng vội chống lại. Nó còn chưa quyết định mình là gì.”**

---

# 14. Skill 3 đề xuất — Cưỡng Ép Định Luận

```text
Chủ động
15 AE + 1 Dư Nghi đề xuất
Target một trạng thái Chưa Định
Tag: Quy Tắc đề xuất
```

Đây là công cụ cho player chủ động điều khiển hệ thống Khả Thể.

## 14.1. Chọn Khả Thể có hại cho đồng minh

Ép resolve ngay, nhưng chỉ một phần lượng đang treo trở thành hiện thực.

Ví dụ:

```text
400 damage đang Chưa Định.

Cưỡng Ép Định Luận:
200 damage xảy ra.
200 damage bị xóa.
```

Tỷ lệ `50%` là số đề xuất.

## 14.2. Chọn Khả Thể có lợi

Có thể ép nó Định Luận ngay với hiệu suất cao hơn.

Ví dụ đề xuất:

```text
125% lượng heal hoặc shield đang Chưa Định trở thành hiện thực.
```

Số cuối chưa chốt.

## 14.3. Chọn Dị Vật Chưa Định

Tiêu Dư Nghi để trực tiếp ép nó thành:

```text
Điềm Lành
hoặc
Tai Họa
```

Thay vì chờ tương tác đầu tiên.

## 14.4. Câu thoại

> **“Đủ rồi. Ta sẽ chọn thứ được phép trở thành sự thật.”**

> **“Một khả năng được chọn. Những khả năng còn lại chưa từng tồn tại.”**

---

# 15. Ultimate đề xuất — Vạn Khả Chưa Sinh

```text
Toàn chiến trường
Tag: Quy Tắc đề xuất
Thời gian: 1 vòng phe địch hoặc tương đương theo mode
```

## 15.1. Cơ chế

Trong thời gian ultimate:

```text
50% actual HP damage phe địch gây lên đồng minh xảy ra ngay.
50% còn lại trở thành Chưa Định.
```

Không ảnh hưởng:

- HP cost.
- Hiến tế.
- Tự sát.
- Damage môi trường.
- Tử vong trực tiếp không phải damage.
- Axiom không thể bị trì hoãn.
- Damage đã xác nhận trước lúc ultimate kích hoạt.

Mỗi hành động chỉ tạo tối đa một gói Khả Thể cho mỗi mục tiêu, tránh multi-hit sinh quá nhiều object.

## 15.2. Khi ultimate kết thúc

Các gói Khả Thể được liệt kê.

Vị Tri Chi Chủ có thể tiêu:

```text
1 Dư Nghi → xóa 1 gói Khả Thể
```

Các gói không bị xóa sẽ Định Luận bình thường.

## 15.3. Ví dụ

Phe địch tạo:

```text
5 gói damage Chưa Định
```

Vị Tri Chi Chủ có:

```text
3 Dư Nghi
```

Player xóa ba gói nguy hiểm nhất.  
Hai gói còn lại trở thành damage thật.

AI ưu tiên xóa:

1. Gói có thể giết leader.
2. Gói có thể giết đồng minh.
3. Gói damage cao nhất.
4. Gói đánh vào mục tiêu thấp HP nhất.

## 15.4. Câu thoại

> **“Mọi kết quả vẫn còn sống. Ta chỉ cần quyết định kết quả nào sẽ không bao giờ được sinh ra.”**

> **“Chỉ vì một việc đã bắt đầu, không có nghĩa kết quả của nó đã được sinh ra.”**

---

# 16. Cấu trúc dữ liệu Khả Thể

```ts
type PossibilityState =
  | "UNRESOLVED"
  | "RESOLVED"
  | "ERASED";

type NumericPossibilityPayload = {
  type: "damage" | "heal" | "shield";
  amount: number;
};

type Possibility = {
  id: string;

  ownerId: string;
  sourceId?: string;
  sourceActionId?: string;
  targetId?: string;

  state: PossibilityState;

  trueTag: TagLevel;

  possibleTemplates: string[];
  resolvedTemplateId?: string;

  numericPayload?: NumericPossibilityPayload;

  naturalResolveTrigger: Trigger;
  createdAtActionIndex: number;
};
```

## Resolve

```ts
function resolvePossibility(
  possibility: Possibility,
  templateId: string
): void {
  if (possibility.state !== "UNRESOLVED") return;

  possibility.resolvedTemplateId = templateId;
  possibility.state = "RESOLVED";

  applyPossibilityTemplate(possibility, templateId);
}
```

## Xóa

```ts
function erasePossibility(
  possibility: Possibility
): void {
  if (possibility.state !== "UNRESOLVED") return;

  possibility.state = "ERASED";
}
```

## Không cho proc dây chuyền

Payload Định Luận hoặc bị xóa nên có nguồn sự kiện riêng:

```text
POSSIBILITY_RESOLVE
POSSIBILITY_ERASE
PENDING_DAMAGE_RESOLVE
```

Không mặc định tính là:

- Một hành động mới.
- Một skill cast mới.
- Nguồn tạo AE.
- Nguồn giảm cooldown.
- Nguồn tự kích hoạt lại chính cơ chế Chưa Định.

---

# 17. Những điểm cần khóa khi hoàn thiện kit

## 17.1. Nguồn Khả Thể chết

Cần chốt một trong các hướng:

```text
A. Khả Thể bị xóa vì nguồn không còn.
B. Khả Thể vẫn resolve vì nó đã tách khỏi nguồn.
C. Player được chọn bằng Dư Nghi.
```

Khung trước đang nghiêng về A cho Skill 1, nhưng chưa phải quyết định cuối.

## 17.2. Damage treo và các trigger

Phải xác định:

- Có tính damage taken để kích hoạt passive lúc tạo Khả Thể không?
- Hay chỉ khi Khả Thể Định Luận?
- Hút máu xảy ra lúc nào?
- Phản damage xảy ra lúc nào?
- Damage record cho Ký Ức Chi Chủ ghi lúc nào?
- Có bị khiên hiện tại hấp thụ khi resolve không?
- Dùng ARM/RES lúc tạo hay lúc resolve?

Hướng logic nhất:

```text
Payload được tạo từ actual HP damage đã tính ở thời điểm hành động.
Khi resolve, không tính ARM/RES lần hai.
```

Nhưng khiên và miễn damage phát sinh sau đó cần chốt riêng.

## 17.3. Axiom

Axiom không bị trì hoãn hoặc xóa chỉ vì nó tạo damage.

Cần phân biệt:

```text
Damage thường do skill Axiom tạo ra
và
Kết quả Axiom tuyên bố bắt buộc phải xảy ra
```

Không phải mọi damage từ một Prime đều bất khả xâm phạm.

## 17.4. Dư Nghi

Cần test:

- Cap.
- Tốc độ sinh trong 4v4 và 10v10.
- Summon có tạo quá nhiều hay không.
- Mỗi dạng biến hóa tính một lần hay từng phase.
- Tag lộ lần đầu theo skill hay theo nguồn.
- Có giữ qua hồi sinh không.
- Có mất khi nhân vật chết không.

## 17.5. UI

Player phải thấy:

- Bao nhiêu Dư Nghi.
- Bao nhiêu gói damage đang treo.
- Gói nào sắp resolve.
- Mục tiêu nào bị ảnh hưởng.
- Tag nào còn `?`.
- Dị Vật đang Chưa Định hay đã thành Điềm Lành/Tai Họa.

Nếu UI không rõ, “huyền bí” sẽ biến thành “không hiểu game đang làm gì”.

---

# 18. Những hướng không nên dùng làm trụ cột

Không nên để toàn bộ nhân vật chỉ là:

```text
Ẩn thanh HP.
Ẩn skill.
Tàng hình.
Random mục tiêu.
Random hậu quả.
Sai combat log.
Không giải thích kết quả.
```

Không nên:

- Giấu tag sau khi đã phán định nhưng không cho player biết vì sao.
- Đổi tag trực tiếp như Danh Chủ.
- Xóa ký ức về tag đã lộ như Ký Ức Chi Chủ.
- Tạo quá nhiều nhánh nếu–thì không liên hệ.
- Cho player luôn chọn kết quả có lợi mà không trả tài nguyên.
- Dùng Axiom làm lý do miễn mọi counterplay.

---

# 19. Các câu thoại đã đề xuất

## Đại diện

> **“Ta không che giấu đáp án. Đáp án chưa từng được sinh ra.”**

> **“Ngươi có thể hiểu quy luật của ta. Nhưng quy luật ấy không cho ngươi biết kết quả.”**

> **“Ta không phải điều vĩnh viễn không thể biết. Ta là khoảnh khắc trước khi sự biết trở thành khả dĩ.”**

> **“Khi ngươi biết ta, ta không biến mất. Ta chỉ lùi lại phía sau điều tiếp theo ngươi chưa biết.”**

> **“Thứ đã biết có biên. Thứ chưa biết không có hình để đo.”**

> **“Điều đáng sợ không phải là ngươi không biết. Là ngươi không biết mình còn thiếu điều gì.”**

## Khi tạo Chưa Định

> **“Đừng vội chống lại. Nó còn chưa quyết định mình là gì.”**

> **“Mọi kết quả vẫn còn sống.”**

> **“Ngươi đã thấy câu hỏi. Chưa có nghĩa ngươi sẽ sống tới khi thấy đáp án.”**

> **“Chỉ vì ngươi đã ra tay, không có nghĩa kết quả đã được sinh ra.”**

## Khi Định Luận

> **“Một khả năng được chọn. Những khả năng còn lại chưa từng tồn tại.”**

> **“Giờ thì ngươi đã biết. Quá muộn rồi.”**

> **“Đáp án chỉ xuất hiện sau khi cái giá đã được trả.”**

> **“Đủ rồi. Ta sẽ chọn thứ được phép trở thành sự thật.”**

## Khi đối phương cố dự đoán

> **“Dự đoán cần một tương lai đã có hình.”**

> **“Ngươi đang tìm đáp án cho một câu hỏi chưa được sinh ra.”**

> **“Mọi kẻ tiên tri đều dừng lại tại ranh giới của ta.”**

## Khi bị nhận biết

> **“Ngươi đã biết hình dạng này của ta. Vậy ta sẽ trở thành điều ngươi chưa biết tiếp theo.”**

> **“Khi ngươi biết ta, thứ ngươi biết đã không còn là ta.”**

## Dị Vật

> **“Đừng hỏi nó là gì. Hãy cẩn thận với thứ sẽ khiến nó trở thành như vậy.”**

## Ultimate

> **“Mọi kết quả vẫn còn sống. Ta chỉ cần quyết định kết quả nào sẽ không bao giờ được sinh ra.”**

---

# 20. Tóm tắt ngắn để phát triển tiếp

```text
Vị Tri không phải random.
Vị Tri không chỉ là giấu thông tin.
Vị Tri không thay đổi tag như Danh Chủ.
Vị Tri không xóa kiến thức như Ký Ức Chi Chủ.

Vị Tri:
- Giữ kết quả ở trạng thái chưa hoàn tất.
- Biến phần chưa hoàn tất thành Khả Thể.
- Thu Dư Nghi khi điều mới được bộc lộ.
- Dùng Dư Nghi để xóa hoặc cưỡng ép Khả Thể.
- Công bố tag khi xung đột thực sự xảy ra.
- Không che lại cùng một sự thật sau khi nó đã được biết.
```

Vòng gameplay đề xuất:

```text
Địch bộc lộ điều mới
→ nhận Dư Nghi
→ damage hoặc hiện tượng bị trì hoãn thành Khả Thể
→ player chọn giữ, xóa hoặc cưỡng ép Định Luận
→ phần bị xóa chưa từng hoàn tất thành hiện thực
```

Câu chốt:

> **“Quy luật của hắn có thể được hiểu. Kết quả của quy luật ấy thì chỉ tồn tại khi thời điểm biết đã đến.”**
