# Combat Kernel audit (Phase 1, characterization baseline)

> Phạm vi: runtime PvE/SSI hiện tại, chụp tại Phase 0–1. Tài liệu này **không**
> thay đổi công thức gameplay và không phải đặc tả Luân Hồi/Awaken/trang bị.

## 1. Call graph và ranh giới action hiện tại

```text
stepTurn
 ├─ nextTurnInterleaved | sequential sparse cursor
 ├─ TURN_START
 └─ doActionOrSkip
     ├─ passive onTurnStart → regen → Statuses.onTurnStart → runtime hooks
     ├─ ACTION_START
     ├─ CC gate (canAct)
     ├─ Ultimate: readiness → performUlt → spendFury (sau cast thành công)
     ├─ active: evaluateGambit → performActiveSkill
     │   ├─ metadata/tag target dispatch
     │   ├─ AE precheck/consume (không có reserve/refund chung)
     │   └─ dealAbilityDamage | healUnit | grantShield | direct kit mutation
     └─ basicAttack → target → dealAbilityDamage → follow-up queue
         └─ calculateFinalDamage → shield → applyDamage → lethal hooks
     → Statuses.onTurnEnd → runtime hooks → ACTION_END
 └─ forced processActionChain → TURN_END
```

`ACTION_END` hiện nằm trong `doActionOrSkip`, còn `TURN_END` nằm trong
`resolveTurnAction`; vì vậy forced chain được xử lý sau natural `ACTION_END` nhưng
trước `TURN_END`. Không có `ActionCommand`, `actionId`, reserve record hay commit
record serializable xuyên suốt pipeline.

## 2. Mutation entry points

| State | Entry point chính | Bypass/kit-specific đã thấy |
|---|---|---|
| Current HP/die | `dealAbilityDamage` → `applyDamage`; `healUnit` | `statuses.ts` DoT/lethal; `passives.ts`; `tag-dispatch.ts`; `perform-active-skill.ts`; Chap Minh và runtime hooks |
| Max HP | spawn/stat resolver | `passives.ts` tăng/giảm/đặt; Duong Ha/Chap Minh hooks; lineup/mutation buff trong `turns.ts` |
| Shield | `grantShield`, `Statuses.absorbShield` | absolute-law bypass; legacy `Statuses` shield helpers; shield-cost skill |
| AE | `globalAetherPool`, per-unit turn regen | tag dispatcher callback và Blood Avatar có nhánh consume riêng |
| Fury/Rage | fury utility (`startFury*`, `gainFury`, `spendFury`, `setFury`) | spawn/revive initialization và leader Uyên bookkeeping |
| buff/debuff/mark | `Statuses.add/remove/onTurnStart/onTurnEnd` | tag dispatcher, passives và kit runtime hooks mutate list trực tiếp/gián tiếp |
| position | spawn queue + `slotToCell`; movement tags | kit/tag board-position utilities |
| alive/dead/removal | `applyDamage`, lethal hook | `statuses.ts`, `passives.ts`, PvE ult revive; TTL removes token bằng `splice` (despawn giả death) |

Các action entry point gồm basic, active skill, Ultimate callback, queued
follow-up/counter/forced action, summon natural action, status DoT/HoT và passive/
tag hooks. Linked cast chưa có abstraction riêng: nó là callback/forced chain nên
ownership và cost phụ thuộc call site.

## 3. Phân loại HP hiện tại

| Nhóm canonical cần có | Runtime hiện tại | Kết luận audit |
|---|---|---|
| A Damage: physical | `dtype='physical'`, ARM rating | đi qua defense + reduction + shield trong `dealAbilityDamage` |
| A Damage: will | tên runtime là `arcane`, dùng RES | thuật ngữ WIL/arcane chưa thống nhất |
| A Damage: mixed | weighted ARM/RES, mặc định 50/50 | tính thành một packet tổng, không phải hai packet |
| A Damage: true | không có first-class enum/packet | một số `applyDamage`/direct HP loss thực tế bypass defense, nhưng không phân biệt true damage với HP loss |
| B Healing | `healUnit` trả `{healed, overheal}` | một số passive/hook cộng HP trực tiếp nên bypass heal efficiency/overheal result |
| C HP cost | active skill trừ HP và clamp tối thiểu 1 | direct mutation; không mang tag cost nên hiện không reflect/lifesteal, nhưng cũng không có ledger/refund |
| D Non-damage HP change | set/subtract trực tiếp trong passive, status, kit | thường không emit event; vài nơi gọi `applyDamage`, làm lẫn damage với HP loss |
| E Max HP mutation | passive và runtime hooks | temporary/permanent không có duration/restore ledger thống nhất |

Điểm trộn quan trọng: `applyDamage` chỉ là primitive trừ HP + `alive=false`, không
biết source/type. DoT trong `statuses.ts` có damage calculation riêng rồi gọi
primitive; tag “damage-like” gọi primitive trực tiếp; self/reflect/Chap Minh cũng
có đường riêng. Vì vậy không thể suy ra category từ mutation cuối.

## 4. Transaction tài nguyên hiện tại

* **Active skill:** đọc metadata và quota, precheck AE; tag dispatcher có callback
  consume trong lúc dispatch. Sau dispatch mới phát hiện consume thất bại ở một số
  nhánh. Không có reserve và rollback chung; payload/tag trước điểm failure có thể
  đã mutate state.
* **Ultimate:** kiểm tra Fury + block, gọi `performUlt`, rồi mới `spendFury` nếu
  callback không throw. Callback trả `void`, nên “không làm gì nhưng không throw”
  vẫn được coi thành công. Leader Uyên dùng queue/readiness riêng.
* **HP cost/shield cost:** consume ngay tại kit branch; không có reserve/refund.
* **Target:** basic chọn ngay trước resolve; active/tag có thể chọn/dispatch nhiều
  lần. Không có target snapshot chuẩn; target chết hoặc di chuyển trước callback
  được xử lý khác nhau theo call site.
* **Cap:** AE/Fury setters clamp; phần vượt cap bị bỏ, không có event chứa overflow.
* **Cancel/interrupt/refund:** chỉ có result reason (`missing-skill`,
  `insufficient-aether`, `blocked`, status/ult failure); không có refund hoặc
  partial refund. Rewind không thể phục hồi transaction vì thiếu ledger.

Characterization trước refactor phải khóa từng điểm side effect xảy ra trước/sau
failure, đặc biệt tag AE cost, Blood Avatar, linked free cast và Ultimate callback.

## 5. Stat units và công thức damage hiện tại

ARM và RES là **defense rating**, không phải tỷ lệ: runtime dùng
`100 / (100 + rating)`. Ví dụ raw 1,000 vào ARM 100 còn 500 trước reduction;
penetration 25% làm effective ARM 75 và còn `floor(1000*100/175)=571`.
`mixed` 50/50 với ARM 100, RES 300 có multiplier
`0.5*(100/200)+0.5*(100/400)=0.375`, tức 375.

Tuy nhiên nguồn stat mâu thuẫn: growth/resolver và damage xem ARM/RES là rating,
trong khi mutation creep trong `turns.ts` clamp ARM về `0..1` và lineup buff nhân
phần trăm trực tiếp. Giá trị 0.2 theo rating chỉ giảm khoảng 0.2%, không phải 20%.
Đây là blocker thiết kế cần chốt trước khi chuẩn hóa.

Pipeline chuẩn hiện tại:

```text
base (ATK/WIL hoặc payload) → skill multiplier + realm flat
→ outgoing status multiplier
→ class + element + synergy (cộng rồi nhân)
→ weighted ARM/RES after max(defPen)
→ incoming reduction
→ Chap Minh mitigation
→ shield absorption (trừ absolute-law bypass)
→ shared-HP split hoặc applyDamage
→ lethal/death passive → fury/on-hit/reflect/lifesteal/follow-up
```

Mỗi bước floor theo `calculateFinalDamage`; thứ tự floor là observable behavior.
ATK/WIL/HP bắt nguồn từ class/unit base + level/star instance stats, sau đó collection
TP/cultivation/rank/runtime modifiers và lineup buffs. Equipment/cultivation/star
không có một provenance record trong packet, nên audit ngược một con số runtime
không thể tách contribution ổn định.

## 6. Bypass kernel và inconsistency

1. `statuses.ts` tự dựng DoT pipeline, shield rồi `applyDamage`; dễ lệch counter,
   Chap Minh, attribution và event metadata.
2. `tag-dispatch.ts` damage-like gọi `applyDamage` trực tiếp: bỏ ARM/RES, shield và
   reduction; hiện không thể biết đó là true damage hay non-damage HP loss.
3. `passives.ts` có cộng/trừ HP và `alive=false` trực tiếp: bỏ heal efficiency,
   shield, lethal/death dedupe và attribution.
4. Active skill và runtime hooks có HP cost/heal/max-HP direct mutation.
5. Reflect có mini-pipeline riêng. Nó dùng defense/reduction/shield nhưng không có
   packet/chain ledger chung; special-case equal reflect ngăn ping-pong bằng logic
   cục bộ thay vì proc guard canonical.
6. Shared HP áp tuần tự và lethal hook ngay trong vòng lặp, nên target trước có thể
   phát death reaction trước target sau.

## 7. Attribution, simultaneous resolve và loop risk

Hiện source chủ yếu là object `attacker`; DoT lưu `sourceUnitId` (definition id,
không bảo đảm iid); summon có `ownerIid`; forced/mind-control/linked action không
có owner chain canonical. Kill credit tăng `_directKills` cho attacker tại call
site. Environment damage không có source instance. Vì thế summon → owner → true
self có thể truy một phần nhưng bị mất khi đi qua status/tag.

AoE thường là loop tuần tự. Stats, alive state, on-kill, Fury và passive của target
đầu có thể ảnh hưởng target sau. Multihit là nhiều lần gọi damage nên thresholds
quan sát theo hit; không có action aggregate. Multiple HP_ZERO/death theo thứ tự
array/target loop, không phải batch. Leader death có thể khiến battle-end check xảy
ra sau turn/action trong khi death reactions đã chạy.

Nguy cơ proc loop: reflect mini-pipeline, follow-up/action-chain cap không đồng nhất,
counter sinh forced action, DoT/passive re-entry và multihit phát cùng proc nhiều
lần. Hiện có vài marker/cap (`_passiveDeathAt`, follow-up cap, creep death set),
nhưng không có `chainId`, `reactionDepth`, `procKey` hay per-action trigger ledger.

## 8. Death lifecycle hiện tại

Thực tế chỉ có `hp<=0`, `alive=false`, `deadAt`, lethal hook có thể revive, và token
removal. `applyDamage` đặt dead trước cửa sổ prevention; các caller lại gọi
`hookOnLethalDamage`, passive death và runtime death theo thứ tự khác nhau.
`statuses.ts` cũng làm lethal riêng. Dedupe `_passiveDeathAt` dựa timestamp có thể
va chạm khi clock bằng nhau; không phải death id. Revive đặt HP/alive và gọi hook,
nhưng corpse/revivable/removal không first-class. TTL/fusion/despawn có thể splice
token, không phân biệt death, consume hay erase.

Lifecycle v1 đề xuất:

```text
ALIVE → HP_ZERO → DEATH_PREVENTION_WINDOW
 → DEATH_PREVENTED | DEATH_CONFIRMED
 → REVIVABLE/CORPSE
 → REVIVED | REMOVED | ENTERED_REINCARNATION | ERASED
```

Chỉ `DEATH_CONFIRMED` được phép cấp kill/on-kill và là event Luân Hồi tương lai.
Fusion/despawn phát removal reason, không giả death. Batch death cần collect mọi
HP_ZERO, chạy prevention theo packet order ổn định, confirm death, attribution,
death reactions, rồi battle-end đúng một lần.

## 9. Determinism và replay

Session SSI starting side dùng seeded session RNG. Combat vẫn có fallback
`Math.random` ở tag dispatch khi `game.rng` thiếu; target utilities/engine shuffle
cũng có default `Math.random`, và VFX dùng random không nên lọt vào combat state.
Do event detail giữ object mutable và timestamp, cùng seed + commands chưa bảo đảm
byte-identical log. Không có ActionCommand log hay snapshot schema/version.

Contract serializable tối thiểu cần gồm:

* `ActionCommand {commandId, actorIid, kind, skillId?, targetIntent?, issuedAtTurn}`;
* `ActionResult {actionId, accepted, reason, costs, targetIids, packetIds}`;
* `CombatEvent {seq, actionId, chainId, type, sourceIid?, targetIid?, payload}`;
* `GameStateSnapshot {schemaVersion, seed, rngState, turn, resources, tokens,
  queues, triggerLedger}`.

Blocker: Map/WeakMap/callback/object references, timestamps, anonymous iid fallback,
unseeded RNG fallbacks và mutable event payload.

## 10. Contract v1 đề xuất (chưa triển khai)

Transaction:

```text
ACTION_DECLARE → COST_VALIDATE → COST_RESERVE → TARGET_SNAPSHOT → ACTION_START
→ COST_COMMIT → PAYLOAD_RESOLVE → ACTION_COMMIT → ACTION_END
```

Mọi exit phải có đúng một `ACTION_END`; cancel trước commit release reserve, cancel
sau commit dùng explicit refund policy. Free linked cast vẫn tạo transaction với
cost 0 và parent action id.

`DamagePacket` chứa `actionId`, `chainId`, `packetId`, source combat iid,
`ownerTrueSelfId`, target iid, `damageType`, tags, `isDot`, `isReflect`,
`isFollowup`, `reactionDepth`. `DamageContext` giữ immutable stat/target snapshot.
`DamageResolution` giữ riêng `declaredDamage`, `incomingDamage`,
`postMitigationDamage`, `shieldDamage`, `hpDamage`, `overkillDamage`,
`preventedDamage`.

AoE/multi-target hướng tới:

```text
TARGET_SNAPSHOT → PACKET_CALCULATE → BATCH_APPLY
→ REACTION_QUEUE → DEATH_RESOLUTION
```

Attribution canonical là `sourceCombatInstanceId` (actor thực thi) + owner chain
đến `ownerTrueSelfId`; mind-control bổ sung controller iid, environment dùng source
kind/id. Kill/lifesteal/on-kill đọc resolved attribution, không đoán từ last hit.
Proc guard dùng `(actionId, procKey, sourceIid, targetIid)` ledger, max reaction
depth và default: reflect không reflect/lifesteal; DoT chỉ proc hook được whitelist;
follow-up/counter không tự tái kích cùng proc key. Đây là quyết định cần designer
phê duyệt, không hard-code tên nhân vật.

## 11. Invariants/assertions cần bổ sung tại commit boundary

* `0 <= hp <= hpMax`, `hpMax >= 0`, shield/resource hữu hạn và không âm;
* damage/heal hữu hạn; dead instance không nhận natural turn; iid unique;
* một action đúng một `ACTION_END`, cost commit tối đa một lần;
* một death id đúng một `DEATH_CONFIRMED`;
* packet/action/event sequence tăng đơn điệu và replay không phụ thuộc wall clock.

Intermediate negative/over-max values chỉ hợp lệ trong private calculation, không
được lộ ở committed `GameStateSnapshot`.

## 12. Characterization coverage và khoảng trống

Baseline hiện có khóa basic physical/WIL scaling, final multiplier order, shield,
tag effects, Fury, active SSI, counter/follow-up, lethal/undying, revive và các kit
runtime. Phase 0 bổ sung skewed/empty cycle, delayed summon, seeded side và CC turn.
Các case chưa có first-class runtime (true packet, explicit non-damage packet,
batch resolution, cancellation refund) chỉ có thể ghi nhận bypass/absence; không
được viết test giả định thiết kế v1 đã tồn tại.

Cần PR characterization kế tiếp tách fixture packet-level cho mixed, AoE/multihit,
reflect/lifesteal, DoT/HoT, HP cost/max-HP loss, overheal/overkill, simultaneous
leader death và canceled cost, rồi mới thay kernel.

## 13. Quyết định designer phải chốt

1. ARM/RES rating canonical và migration cho dữ liệu `0..1` hay percentage?
2. WIL damage tên `arcane` hay `will`; true damage có qua shield/reduction nào?
3. HP cost/self damage/sacrifice có phát HP_ZERO, on-damage, Fury, reflect,
   lifesteal và kill credit không?
4. AoE/multihit snapshot stat theo action, hit hay target; threshold aggregate nào?
5. Refund matrix cho miss/invalid target/interrupt/free linked cast/rewind?
6. Default proc matrix reflect, lifesteal, DoT, counter và max reaction depth?
7. Shared HP, fusion, summon despawn và leader batch death map vào lifecycle nào?
8. Permanent-in-battle Max HP modifier restore/reset ở boundary nào?

## 14. Roadmap PR nhỏ

1. **Schemas + event ids only:** ActionCommand/Event/packet types và immutable log,
   không đổi formula.
2. **HP gateway:** route direct mutations qua typed damage/heal/cost/change/max-HP
   commands, giữ kết quả characterization.
3. **Cost transaction:** validate/reserve/commit/refund ledger.
4. **Damage adapter:** bọc pipeline cũ vào Packet/Resolution, rồi migrate DoT/tag/
   reflect từng đường.
5. **Batch resolver:** snapshot/calculate/apply/reaction/death queues cho AoE.
6. **Death state machine:** prevention/confirmed/removal reasons và batch battle end.
7. **Attribution/proc guard:** owner chain, ledger, reaction depth.
8. **Deterministic replay gate:** seeded-only combat RNG, snapshots và replay test.

Mỗi PR phải chạy lại characterization và không đổi công thức trừ khi có quyết định
designer + migration note riêng.

