# Kế hoạch tách `session-runtime-impl` theo module (reuse-first)

## 0) One-page quickstart (để bắt tay làm ngay, không sót bước)

1. **Chọn đúng phase** (A/B/C/D/E/F) và khóa scope theo mục 2.1 + mục 16.
2. **Chuẩn bị reuse map**: liệt kê helper/hàm hiện có sẽ dùng lại (không tạo logic song song).
3. **Tách theo copy-move** trước, tránh chỉnh thuật toán trong cùng commit.
4. **Inject deps tường minh** theo bảng mục 8, không đọc global ngầm.
5. **Tự kiểm invariants** mục 3.4 + chạy test tối thiểu mục 9.
6. **Rà soát nhanh bằng `rg -n`** theo mục 17 để chắc không còn shadow implementation.
7. **Gate trước merge** theo mục 18; thiếu 1 gate thì không merge.
8. **Ghi phase report** theo mẫu mục 11; nếu có hàm mới phải kèm reuse justification mục 19.

> Quy tắc vàng: **ưu tiên tối đa hàm hiện có trước khi tạo hàm/tệp mới**.

## 1) Mục tiêu và ràng buộc

- Ưu tiên **tận dụng tối đa hàm sẵn có** trong `src/modes/pve/session-runtime-impl.ts`, chỉ di chuyển và gom luồng, tránh viết lại logic.
- Gom các hàm khác tên nhưng cùng trách nhiệm về 1 luồng module rõ ràng:
  - `session-loop`
  - `session-deck`
  - `session-events`
  - `session-render`
- Không chỉnh sửa `app.js`.

---

## 2) Quét impl hiện tại: phân cụm theo trách nhiệm

### Cụm A — Loop / runtime tick (ưu tiên tách trước)

Các điểm nóng của vòng lặp runtime đang dồn trong `init()`:

- Khởi tạo context cho `stepTurn` và battle-end check closure.
- Khối `updateTimerAndCost(timestamp?)` chứa:
  - đồng bộ clock/session time,
  - cấp cost theo thời gian,
  - gọi AI khi cost đổi,
  - gate turn theo `busyUntil`,
  - chạy `stepTurn(...)` nhiều vòng/tick,
  - battle-end checks (`leader-immediate`, `post-turn`, `timeout`).
- Lịch tick bằng RAF/timeout + pause theo visibility.

**Nhận định:** Đây là cụm có độ kết dính cao, tách được sớm mà ít ảnh hưởng UI render nếu chỉ giữ contract callback.

### Cụm B — Deck & summon flow

- `ensureDeck`, `ensureLockedPlayerDeck`, `isCardInLockedDeck`, `removeDeckEntryAtIndex`.
- `refillDeck`, `selectFirstAffordable`, `renderSummonBar`.
- Luồng chọn card + click canvas để queue summon + trừ cost + cập nhật HUD.

### Cụm C — Session events / lifecycle bindings

- Bind/unbind listener:
  - canvas click/mousemove,
  - window resize,
  - visualViewport resize/scroll,
  - visibilitychange,
  - art sprite event.
- `clearSessionTimers`, `clearSessionListeners`, `stopSession`, `startSession`, `bindSession`.
- Event bridge qua `emitGameEvent`, `addGameEventListener`, battle-result finalize.

### Cụm D — Render

- `draw()` và toàn bộ helper vẽ scene/UI:
  - grid/token/queue/scene props,
  - HP/fury bar,
  - status icon pipeline,
  - tooltip hover,
  - gradient cache / melee offsets.
- `scheduleDraw`, `cancelScheduledDraw`, resize scheduling.

---

## 2.1 Bản đồ hàm ưu tiên di chuyển (để tránh sót phạm vi)

> Mục tiêu của bảng này là khóa rõ “hàm nào thuộc module nào” trước khi bắt đầu refactor, giảm nguy cơ kéo nhầm logic giữa các phase.

### `session-loop` (Phase 1)

- `createClock`
- `resolveClockTurnIntervalMs`
- khối `updateTimerAndCost(timestamp?)` (đang nằm trong `init()`)
- phần tick scheduler dùng RAF/timeout + pause gate liên quan loop
- các nhánh battle-end check trong loop (`leader-immediate`, `post-turn`, `timeout`)

### `session-deck` (Phase sau)

- `ensureDeck`, `ensureLockedPlayerDeck`, `isCardInLockedDeck`
- `findDeckEntryIndexById`, `removeDeckEntryAtIndex`, `getCardCost`
- `refillDeck`, `selectFirstAffordable`, `renderSummonBar`, `flushSummonBarRender`
- phần xử lý chọn card và queue summon từ canvas click

### `session-events` (Phase sau)

- `bindVisibility`, `unbindVisibility`, `handleVisibilityChange`
- `bindArtSpriteListener`, `unbindArtSpriteListener`
- `clearSessionTimers`, `clearSessionListeners`
- `bindSession`, `stopSession`, `startSession` (tách dần theo adapter để không vỡ API)
- bind/unbind `resize`, `visualViewport.resize`, `visualViewport.scroll`, `mousemove`, `click`

### `session-render` (Phase sau)

- `draw`, `drawHPBars`, toàn bộ status icon pipeline
- `scheduleDraw`, `cancelScheduledDraw`
- `scheduleResize`, `flushScheduledResize`, `scheduleViewportResizeIfChanged`
- helper render phụ trợ (`cellCenterObliqueLocal`, `ensureHpBarGradient`, tooltip hover)

---

## 3) Nhiệm vụ tách phần 1 (thực thi ngay): `session-loop`

## 3.1 Scope chính xác

Tạo module mới: `src/modes/pve/session-loop.ts` (hoặc `session-runtime/session-loop.ts` nếu muốn cấu trúc thư mục con).

Di chuyển theo nguyên tắc **copy-move, không đổi hành vi**:

1. Kiểu/const liên quan loop:
   - `ClockState`, `LOGIC_MIN_INTERVAL_MS`, `MAX_TURNS_PER_TICK`, hằng drift liên quan clock.
2. Nhóm hàm clock:
   - `createClock`, `resolveClockTurnIntervalMs`, logic normalize timestamp/sessionNow.
3. Core loop runner:
   - phần tạo `updateTimerAndCost` hiện ở trong `init()` -> tách thành hàm factory kiểu:
     - `createSessionLoopController(deps)`
   - expose API:
     - `startLoop()`
     - `stopLoop()`
     - `tick(timestamp?)` (nếu cần test)
4. Tất cả callback phụ thuộc được inject qua `deps` để reuse logic cũ:
   - `getGame`, `onHudUpdate`, `onDeckReevaluate`, `onRenderSummonBar`, `onAiCostChanged`,
   - `stepTurn`, `checkBattleEnd`, `syncLeaderUltControls`, `applyCostGain`, `sessionNow/safeNow`.

## 3.2 Reuse checklist (bắt buộc)

- Không viết lại `stepTurn` / `aiMaybeAct` / `applyCostGain`.
- Không tách nhỏ công thức thời gian thành bản mới nếu đã có helper (`normalizeAnimationFrameTimestamp`, `sessionNow`, `safeNow`, `mergeBusyUntil`).
- Không đổi thứ tự battle-end checks.

## 3.3 Điều kiện hoàn thành phase 1

- `session-runtime-impl.ts` vẫn export/contract y như cũ (`createPveSession`, `__getActiveGame`, events export).
- Test liên quan session runtime/turn vẫn pass.
- Diff hành vi bằng log/timer text không thay đổi đáng kể (same-second output).

## 3.4 Invariants bắt buộc phải giữ nguyên khi tách `session-loop`

1. **Monotonic timer:** text timer không được nhảy lùi trong cùng phiên khi có drift/rebase.
2. **Cost safety:** cost tăng theo tick nhưng không âm/không NaN.
3. **Turn cadence:** không gọi `stepTurn` khi chưa qua `turnEveryMs` hoặc còn `busyUntil`.
4. **Battle end priority:** timeout và leader-immediate vẫn giữ thứ tự phán định như cũ.
5. **No side-effect leakage:** stop loop phải hủy sạch handle RAF/timeout.

---

## 4) Backlog sau phase 1: `session-deck`, `session-events`, `session-render`

## 4.1 `session-deck`

- Mục tiêu: gom toàn bộ deck lifecycle + summon bar logic thành module độc lập.
- Ưu tiên reuse các hàm đã có: `ensureDeck`, `getCardCost`, `isCardInLockedDeck`, `refillDeckEnemy`, `isUniqueGlobalSummonBlocked`.
- API đề xuất:
  - `createSessionDeckController(deps)`
  - `refill()`, `selectFirstAffordable()`, `handleCanvasSummonClick(cell)`, `renderSummonBar()`.

## 4.2 `session-events`

- Mục tiêu: tách bind/unbind listener + lifecycle cleanup thành một luồng duy nhất.
- API đề xuất:
  - `createSessionEventBindings(deps)`
  - `bindAll()`, `unbindAll()`, `clearTimers()`, `disposeSessionDomRefs()`.
- Giữ nguyên hành vi cleanup theo thứ tự hiện tại để tránh rò listener.

## 4.3 `session-render`

- Mục tiêu: tách draw scheduler + draw pipeline + status icon renderer.
- API đề xuất:
  - `createSessionRenderController(deps)`
  - `scheduleDraw()`, `drawNow()`, `scheduleResize()`, `updateTooltip()`.
- Reuse cache hiện tại (`hpBarGradientCache`, `statusIconCache`) thay vì tạo hệ cache mới.

---

## 5) Prompt triển khai — vòng 1 (dùng ngay cho task `session-loop`)

> Hãy refactor `src/modes/pve/session-runtime-impl.ts` theo hướng **reuse-first**:
>
> 1. Tách phần session loop (clock/tick/cost/turn gate/battle-end check) sang module mới `session-loop`.
> 2. Không đổi hành vi runtime và không đổi public API của `createPveSession`.
> 3. Ưu tiên di chuyển nguyên khối logic hiện tại; chỉ dùng dependency injection để giảm phụ thuộc chéo.
> 4. Không chỉnh sửa `app.js`.
> 5. Sau refactor, chạy các test session runtime/turn/combat liên quan và báo cáo rõ command + kết quả.

---

## 6) Phân tích lại lần 2 để tối ưu prompt (anti-missing)

### 6.1 Rủi ro prompt vòng 1

- Chưa khóa rõ **ranh giới scope**: có thể lỡ kéo cả deck/render vào phase 1.
- Chưa yêu cầu rõ **danh sách callback deps tối thiểu** nên implement dễ hard-code reference toàn cục.
- Chưa ép kiểm tra **invariant hành vi** (turn cadence, timeout, cost-credit monotonic).

### 6.2 Prompt tối ưu (khuyến nghị dùng thay prompt vòng 1)

> Refactor theo phase 1, chỉ tách `session-loop` khỏi `session-runtime-impl.ts`.
>
> **Scope bắt buộc (in-scope):**
> - Clock state + tick scheduling.
> - Logic cập nhật timer/cost mỗi tick.
> - Turn gating theo `busyUntil` + cadence `turnEveryMs`.
> - Battle-end checks trong loop (`leader-immediate`, `post-turn`, `timeout`).
>
> **Out-of-scope tuyệt đối:**
> - Deck/summon selection flow.
> - Render/draw/status-icon pipeline.
> - DOM binding lifecycle (trừ phần cần thiết tối thiểu để loop start/stop).
>
> **Implementation rules:**
> 1. Reuse tối đa hàm hiện có (`stepTurn`, `applyCostGain`, `aiMaybeAct`, `sessionNow`, `safeNow`, `normalizeAnimationFrameTimestamp`, `mergeBusyUntil`).
> 2. Không viết lại thuật toán nếu chỉ cần move + inject dependencies.
> 3. Không chỉnh sửa `app.js`, không đổi public API `createPveSession`.
> 4. Tạo `createSessionLoopController(deps)` với deps tường minh, không đọc trực tiếp biến global ngoài module loop (trừ primitive constants truyền vào).
>
> **Validation bắt buộc:**
> - So sánh hành vi trước/sau với các bất biến:
>   - cost không giảm âm do tick,
>   - timer không nhảy lùi khi drift/rebase,
>   - turn không chạy khi còn `busyUntil`,
>   - battle timeout vẫn kết thúc đúng.
> - Chạy test liên quan session runtime/turn order/combat.
>
> **Output yêu cầu:**
> - Danh sách hàm đã move.
> - Danh sách deps đã inject.
> - Danh sách invariant đã tự kiểm chứng.

---

## 6.3 Prompt QA (dùng để tự rà soát sau khi code xong)

> Hãy review patch tách `session-loop` và trả lời checklist pass/fail:
>
> 1. Có hàm nào ngoài phạm vi loop bị move nhầm không (deck/render/events)?
> 2. `createPveSession` public API có giữ nguyên chữ ký và hành vi không?
> 3. Loop có còn phụ thuộc biến global ngầm thay vì deps inject không?
> 4. 5 invariants ở mục 3.4 có được chứng minh bằng test/log không?
> 5. Có đoạn nào viết lại thuật toán cũ thay vì move + reuse helper không?
> 6. Có sửa `app.js` hoặc tạo đường code song song dư thừa không?

---

## 7) Danh sách nhiệm vụ chi tiết (ready-to-run)

1. **Task A (thực thi ngay):** Tách `session-loop` theo prompt tối ưu ở mục 6.2.
2. **Task B:** Sau khi Task A ổn định, tách `session-deck` (deck + summon bar + affordability flow).
3. **Task C:** Tách `session-events` (bind/unbind/timer cleanup/lifecycle).
4. **Task D:** Tách `session-render` (draw scheduler + draw pipeline + status icons).
5. **Task E:** Dọn phụ thuộc vòng tròn và chuẩn hóa `deps` contracts giữa 4 module.
6. **Task F:** Chạy full regression cho session runtime + combat + UI canvas tests.

## 7.1 Definition of Done theo từng task

- **Task A done khi:**
  - Tách xong `session-loop`, không lẫn deck/render/events.
  - Có bảng liệt kê deps inject + lý do từng deps.
  - Pass test trọng điểm runtime turn loop.
- **Task B done khi:**
  - Deck controller hoạt động độc lập, summon bar không đổi hành vi.
- **Task C done khi:**
  - Không rò listener/timer khi start-stop nhiều lần.
- **Task D done khi:**
  - Render pipeline tách module nhưng output khung hình không đổi đáng kể.
- **Task E/F done khi:**
  - Không còn import vòng quan trọng.
  - Regression chính pass.

---

## 8) Bảng phụ thuộc `deps` khuyến nghị cho `createSessionLoopController`

> Mục tiêu: chuẩn hóa deps ngay từ đầu để tránh “tiện tay” truy cập global state trong module mới.

| Nhóm | Dep đề xuất | Bắt buộc | Lý do |
|---|---|---:|---|
| Game access | `getGame(): SessionState \| null` | ✅ | Tránh giữ stale reference sau stop/start session. |
| Clock/time | `sessionNow()`, `safeNow()`, `normalizeAnimationFrameTimestamp()` | ✅ | Reuse trực tiếp helper hiện có, không viết lại logic thời gian. |
| Turn | `stepTurn(game, ctx)` | ✅ | Giữ single source của turn engine. |
| Busy gating | `normalizeTurnBusyUntil(turn)` | ✅ | Đảm bảo cùng semantics busy gate như bản cũ. |
| Economy | `applyCostGain(target, amount)` | ✅ | Không tách riêng cost formula mới. |
| AI | `aiMaybeAct(game, reason)` | ✅ | Giữ hành vi auto-act theo cost và trigger cũ. |
| Battle check | `checkBattleEnd(game, info)` | ✅ | Giữ thứ tự/điểm gọi battle-end checks. |
| UI sync | `onHudUpdate(game)`, `onRenderSummonBar()`, `onSelectFirstAffordable()` | ✅ | Tách loop nhưng không làm mất đồng bộ UI tối thiểu. |
| Controls | `syncLeaderUltControls()` | ✅ | Tránh lệch trạng thái nút Ult khi tick thay đổi fury/cost. |
| Scheduler | `requestFrame(cb)`, `cancelFrame(id)`, `setTimeoutFn(cb, ms)`, `clearTimeoutFn(id)` | ✅ | Đóng gói timer primitive để test được và cleanup an toàn. |
| Constants | `turnEveryMs`, `logicMinIntervalMs`, `maxTurnsPerTick`, `driftToleranceMs` | ✅ | Cấu hình hóa thay vì hard-code rải rác. |

---

## 9) Kịch bản kiểm thử tối thiểu sau khi tách `session-loop`

### 9.1 Smoke/runtime

1. Start session -> tick chạy bình thường, timer giảm đều.
2. Stop session -> không còn RAF/timeout pending.
3. Start lại session mới -> không bị nhân đôi tick loop.

### 9.2 Deterministic invariants

1. **Timer monotonic:** không có frame nào timer text tăng ngược.
2. **Cost monotonic:** cost chỉ tăng hoặc giữ nguyên theo tick (trừ lúc mua summon).
3. **Turn gate:** khi `busyUntil > now` thì `stepTurn` không bị gọi.
4. **Timeout end:** khi hết 240s thì battle end kích hoạt đúng 1 lần.
5. **Leader immediate check:** nếu điều kiện kết thúc sớm đúng thì thoát loop branch ngay.

### 9.3 Regression commands (khuyến nghị)

- `npm test -- test/pve-session-runtime.test.ts`
- `npm test -- test/pve-session-stepturn-combat.test.mjs`
- `npm test -- test/pve-session-turn-order.test.ts`
- `npm test -- test/pve-session-raf-fallback.test.mjs`

> Nếu repo có script nhanh hơn (ví dụ `npm run test:pve`), ưu tiên dùng script có sẵn thay vì tạo command mới.

---

## 10) Kế hoạch rollback an toàn theo phase

1. **Rollback cấp commit (ưu tiên):** mỗi phase tách module phải đi thành commit độc lập để revert nhanh.
2. **Rollback cấp wiring:** giữ adapter bridge trong `session-runtime-impl.ts` để có thể chuyển về đường cũ bằng 1 cờ tạm thời (chỉ trong giai đoạn refactor, xóa sau khi ổn định).
3. **Rollback cấp runtime:** khi phát hiện drift hành vi loop ở production-like test, ưu tiên tắt wiring module mới, không sửa nóng thuật toán core.

---

## 11) Mẫu báo cáo kết quả cho từng phase (để review nhanh)

```md
### Phase X Report
- Scope thực hiện:
  - ...
- Hàm đã move:
  - ...
- Hàm tái sử dụng giữ nguyên:
  - ...
- Deps inject:
  - ...
- Invariants kiểm chứng:
  - [pass/fail] ...
- Test đã chạy:
  - `...` => pass/fail
- Ghi chú rủi ro còn lại:
  - ...
```

Mẫu này giúp reviewer so sánh nhanh giữa kế hoạch và thực thi, giảm rủi ro “đúng ý tưởng nhưng thiếu phần”.

---

## 12) Non-goals và anti-patterns (để tránh refactor sai hướng)

## 12.1 Non-goals (không làm trong đợt này)

1. Không tối ưu gameplay balance/fomula trong khi tách module.
2. Không đổi UX/UI behavior của summon bar, status icon, hay timer text.
3. Không đổi contract public của `createPveSession`.
4. Không đổi format event payload hiện tại.
5. Không sửa `app.js`.

## 12.2 Anti-patterns cần tránh

1. **“Refactor tiện tay”**: vừa move module vừa chỉnh thuật toán loop/cost/turn.
2. **Tạo helper trùng logic** trong khi đã có helper cũ (`sessionNow`, `safeNow`, `mergeBusyUntil`, `applyCostGain`...).
3. **Cross-module ngược chiều**: `session-loop` import trực tiếp `session-render` internals.
4. **Hidden global read**: module mới đọc biến toàn cục thay vì nhận qua deps.
5. **Commit quá to**: gom nhiều phase vào một commit làm mất khả năng rollback.

---

## 13) Kế hoạch commit theo phase (khuyến nghị)

1. `refactor(pve): extract session-loop controller (no behavior change)`
2. `refactor(pve): extract session-deck controller`
3. `refactor(pve): extract session-event bindings`
4. `refactor(pve): extract session-render controller`
5. `refactor(pve): normalize shared deps contracts and remove temporary bridges`
6. `test(pve): add/adjust regression coverage for split modules`

> Mỗi commit phải kèm ghi chú “no behavior change” (nếu đúng) và liệt kê invariant đã check.

---

## 14) Ma trận rủi ro và cách giảm thiểu

| Rủi ro | Tác động | Dấu hiệu | Giảm thiểu |
|---|---|---|---|
| Timer drift sau tách loop | Cao | Timer nhảy lùi/nhảy nhanh | Giữ nguyên helper time hiện có + test monotonic |
| Double tick sau start/stop | Cao | stepTurn chạy nhanh bất thường | Bắt buộc cleanup RAF/timeout khi stop |
| Lệch UI afford/select | Trung bình | summon bar không chọn đúng card | Giữ callback UI sync trong deps loop/deck |
| Rò listener viewport/mouse | Trung bình | memory tăng, event bắn lặp | Tách rõ bind/unbind trong `session-events` |
| Regression battle-end | Cao | trận không kết thúc đúng | Khóa thứ tự check `leader-immediate`/`post-turn`/`timeout` |

---

## 15) Checklist pre-flight trước khi bắt đầu từng task

1. Scope task hiện tại có đúng 1 module mục tiêu không?
2. Danh sách hàm cần move đã được đánh dấu rõ trong mục 2.1 chưa?
3. Đã liệt kê helper/hàm cũ sẽ reuse chưa?
4. Đã xác định invariant nào cần check sau patch chưa?
5. Đã chuẩn bị commit nhỏ theo phase chưa?

Nếu bất kỳ câu nào là “chưa”, dừng và cập nhật kế hoạch trước khi code.

---

## 16) Traceability matrix: neo phạm vi vào vị trí hiện tại trong `session-runtime-impl.ts`

> Mục này giúp tránh tranh luận “hàm này có thuộc phase hiện tại không?” bằng cách neo vào vị trí hiện tại của code.

### 16.1 Nhóm `session-loop` (ưu tiên Phase 1)

- `createClock` (khối clock state ban đầu)
- `resolveClockTurnIntervalMs`
- `init()` phần tạo `stepTurnContext`, `runBattleEndCheck`, `updateTimerAndCost`, và tick scheduler
- `clearSessionTimers` (phần stop loop handle)

### 16.2 Nhóm `session-deck`

- `ensureDeck`, `ensureLockedPlayerDeck`, `isCardInLockedDeck`
- `findDeckEntryIndexById`, `removeDeckEntryAtIndex`, `getCardCost`
- `selectFirstAffordable`, `refillDeck`, `renderSummonBar`, `flushSummonBarRender`
- `init()` phần xử lý click canvas để queue summon và trừ cost

### 16.3 Nhóm `session-events`

- `bindVisibility`, `unbindVisibility`, `handleVisibilityChange`
- `bindArtSpriteListener`, `unbindArtSpriteListener`
- `clearSessionListeners`, `bindSession`, `stopSession`, `startSession`
- `configureRoot`, `resolveTimerElement` (chuyển qua event/lifecycle adapter theo phase sau)

### 16.4 Nhóm `session-render`

- `draw`, `drawHPBars`, status icon helpers
- `scheduleDraw`, `cancelScheduledDraw`
- `scheduleResize`, `flushScheduledResize`, `scheduleViewportResizeIfChanged`
- helper render geometry và style (`cellCenterObliqueLocal`, `ensureHpBarGradient`, ...)

> Lưu ý: line number có thể thay đổi theo commit; khi bắt đầu mỗi phase cần chạy lại `rg -n` để refresh anchor.

---

## 17) Câu lệnh rà soát nhanh trước khi mở PR của từng phase

1. `rg -n \"createClock|resolveClockTurnIntervalMs|clearSessionTimers\" src/modes/pve/session-runtime-impl.ts src/modes/pve`
2. `rg -n \"ensureDeck|refillDeck|selectFirstAffordable|renderSummonBar\" src/modes/pve/session-runtime-impl.ts src/modes/pve`
3. `rg -n \"bindVisibility|clearSessionListeners|startSession|stopSession\" src/modes/pve/session-runtime-impl.ts src/modes/pve`
4. `rg -n \"function draw\\(|drawHPBars|scheduleDraw|scheduleResize\" src/modes/pve/session-runtime-impl.ts src/modes/pve`

Mục tiêu: xác nhận hàm đã move đúng module đích và không để sót “shadow implementation”.

---

## 18) Cơ chế sign-off trước khi merge từng phase

> Mỗi phase chỉ được merge khi qua đủ 4 cổng sau:

1. **Scope gate**
   - Chỉ đụng đúng module mục tiêu của phase.
   - Không phát sinh thay đổi ngoài scope (đặc biệt deck/render/events khi làm phase loop).
2. **Reuse gate**
   - Chứng minh đã tái sử dụng helper/hàm hiện có thay vì tạo logic song song.
   - Mọi hàm mới phải có lý do (không thể tái dùng hàm cũ).
3. **Behavior gate**
   - Invariants trong mục 3.4 pass.
   - Không đổi API public (`createPveSession`) và không đổi payload event hiện tại.
4. **Verification gate**
   - Chạy bộ test tối thiểu của phase.
   - Có output command + kết quả trong phase report.

Nếu thiếu 1 gate => **không merge**.

---

## 19) Mẫu “Reuse justification” bắt buộc khi thêm hàm mới

```md
### New Function Justification
- Tên hàm mới:
- Phase:
- Lý do không tái sử dụng hàm hiện có:
- Hàm hiện có đã cân nhắc:
  - ...
- Rủi ro nếu tái sử dụng cưỡng bức:
  - ...
- Cách đảm bảo không tạo logic trùng:
  - ...
```

Mục này áp dụng trực tiếp cho yêu cầu: **ưu tiên tối đa hàm hiện có trước khi tạo hàm/tệp mới**.

---

## 20) Exit criteria toàn chiến dịch tách module

1. `session-runtime-impl.ts` chỉ còn vai trò orchestrator/wiring, không chứa core logic lớn.
2. 4 controller (`session-loop`, `session-deck`, `session-events`, `session-render`) có ranh giới rõ, không import vòng nghiêm trọng.
3. Regression suite cho runtime/session/combat pass ổn định.
4. Không có thay đổi ngoài phạm vi (đặc biệt `app.js`).
5. Tài liệu phase report đầy đủ cho tất cả phase A→F.