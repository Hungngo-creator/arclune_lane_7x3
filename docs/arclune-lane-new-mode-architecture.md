# Arclune Lane — Kiến trúc mode mới (không phải 7x3)

## 1) Tóm tắt định hướng kiến trúc (1 trang)

Mode mới của Arclune Lane được tách khỏi tư duy đấu trường 7x3 bằng cách dùng **Board Domain độc lập**: bản đồ vòng ngoài 40 ô + dual-track (inner/outer) + junction tại 4 góc, vận hành bằng **graph-based traversal** thay vì lưới chiến đấu tĩnh. Luồng lõi theo pipeline: `Roll/ChooseStep -> RouteDecision -> MoveTick -> CellResolve -> AutoCombat/EventChain -> SurvivalTick -> EndTurn -> YearProgress`.

Kiến trúc đề xuất gồm 4 lớp lõi:
- **Application Layer**: điều phối lượt, state machine, telemetry.
- **Domain Layer**: Player/Cell/BoardGraph/WorldManager/Survival/Combat/EventResolver.
- **Data Layer**: static config (biome, weight, loot, class synergy, global events).
- **Integration Layer**: adapter tái dùng engine RNG/combat/events/config serializer đang có.

Nguyên tắc chính:
1. **Tái dùng tối đa hệ cũ**: RNG, combat công thức, status/effect tick, hệ event dispatcher, cấu hình economy/currency.
2. **Viết mới tối thiểu nhưng đúng miền bài toán**: board graph dual-track, world rift/underworld, year progression 8 người hoàn tất lap.
3. **Deterministic simulation trước** (Python) để cân bằng xác suất; **production path C# Unity** giữ cùng contract dữ liệu.
4. **Luck additive rõ ràng**: `P_good_final = clamp(P_base + 0.02 * Luck, 0, P_cap)`.
5. **Tick-time chuẩn hóa**:
   - `on_move_each_5_cells`: Hunger/Thirst decay
   - `on_enter_cell`: kích hoạt hiệu ứng ô
   - `turn_start/turn_end`: DOT/HOT/buff duration
   - `year_end`: Global Event
6. **Chống snowball** bằng cơ chế catch-up đa tầng: trợ cấp sinh tồn, world-rift ưu đãi cho nhóm cuối, diminishing return cho CP lead.

---

## 2) Audit tái sử dụng hàm/hệ thống cũ

| Thành phần | Mức tái dùng | Cách tích hợp | Rủi ro |
|---|---|---|---|
| RNG utility (`src/utils/rng.ts`) | Dùng lại nguyên trạng | Bọc `IRngService` cho Python/C# cùng seed contract | Sai lệch deterministic giữa JS/Python/C# nếu không đồng bộ thuật toán |
| Combat damage pipeline (`src/combat/*`) | Mở rộng | Giữ công thức damage/tag dispatch, thêm pre-combat hook cho cell/biome modifier | Combat hiện tối ưu cho đấu đội, cần adapter cho encounter 1 ô |
| Status system (`src/statuses.ts`) | Dùng lại + mở rộng | Tái dùng tick buff/debuff, thêm trigger `on_enter_cell`, `on_year_end` | Duration semantics cũ có thể lệch với turn economy mode mới |
| Event bus (`src/events.ts`) | Dùng lại nguyên trạng | Dùng event-driven orchestration cho world events/telemetry | Nếu event ordering không cố định có thể gây race-condition |
| Currency/economy helper (`src/utils/currency.ts`, `src/data/economy.ts`) | Dùng lại + mở rộng | Giữ 100 Silver = 1 Gold; bổ sung chi phí sinh tồn, phí express | Làm tròn đơn vị tiền khi trừ theo % có thể tạo exploit |
| Turn engine (`src/turns.ts`, `src/turns/interleaved.ts`) | Bọc adapter | Dùng scheduler lượt người chơi, bổ sung state machine board mode | Interleaved logic cũ cho combat loop, chưa có route decision state |
| Config loader/validation (`src/data/load-config.ts`) | Dùng lại nguyên trạng | Đọc cell-effect table, biome config, underworld config theo schema | Schema hiện tại có thể chưa đủ field branch/junction |
| PVE session runtime (`src/modes/pve/session*.ts`) | Cần mở rộng lớn | Tái dùng telemetry/runtime frame loop, tách domain board riêng | Dễ kéo theo phụ thuộc PVE-specific không cần thiết |
| Serialization/profile helper (`src/utils/player-profile.ts`) | Dùng lại + mở rộng | Lưu player runtime state: soul/boss/lap/year flags | Migration save cũ -> mode mới cần versioning |
| Board dual-track graph | Buộc viết mới | Tạo `BoardGraph`, `LaneEdge`, `JunctionRule` | Không có abstraction tương đương trong mode 7x3 |
| Underworld manager 5x4 + Boss transfer | Buộc viết mới | Module độc lập map phụ + state boss kế vị | Quy tắc chuyển map và rebirth phức tạp, cần test state transition dày |

**Lý do phần buộc viết mới**: hệ cũ thiên về combat arena/PVE wave, không có khái niệm vòng lap 40 ô, lane branching, world-rift map chuyển vùng, và vai trò Boss kế vị xuyên map.

---

## 3) Module structure (Python)

```text
arclune_lane_mode/
  app/
    game_runner.py
    turn_orchestrator.py
    state_machine.py
  domain/
    entities/
      player.py
      cell.py
      world_state.py
    board/
      board_graph.py
      lane_rules.py
      iso_mapper.py
    systems/
      world_manager.py
      movement_system.py
      event_resolver.py
      combat_resolver.py
      survival_system.py
      global_year_system.py
      underworld_manager.py
      economy_system.py
      class_synergy_system.py
      anti_snowball_system.py
  data/
    cell_effects.py
    biome_tables.py
    global_events.py
    item_defs.py
  integration/
    rng_adapter.py
    combat_formula_adapter.py
    event_bus_adapter.py
    serializer.py
  tests/
    unit/
    integration/
    simulation/
```

**Luồng gọi hàm chính**:
1. `TurnOrchestrator.begin_turn(player_id)`
2. `MovementSystem.roll_or_choose_step()`
3. `BoardGraph.resolve_route_at_junction()`
4. `MovementSystem.apply_move_ticks()` (đếm mỗi 5 ô)
5. `EventResolver.resolve_on_enter(cell, player)`
6. `CombatResolver.auto_resolve_if_multi_entity(cell)`
7. `SurvivalSystem.tick_end_turn(player)`
8. `GlobalYearSystem.check_lap_completion(all_players)`
9. `TurnOrchestrator.end_turn()`

---

## 4) Module structure (C# Unity)

```text
Assets/Scripts/ArcluneLaneMode/
  Application/
    GameBootstrap.cs
    TurnOrchestrator.cs
    GameStateMachine.cs
  Domain/
    Entities/
      Player.cs
      Cell.cs
      WorldState.cs
    Board/
      BoardGraph.cs
      JunctionRule.cs
      IsoMapper.cs
    Systems/
      WorldManager.cs
      MovementSystem.cs
      EventResolver.cs
      CombatResolver.cs
      SurvivalSystem.cs
      GlobalYearSystem.cs
      UnderworldManager.cs
      EconomySystem.cs
      AntiSnowballSystem.cs
  Data/
    ScriptableObjects/
      CellEffectTable.asset
      BiomeTable.asset
      ItemTable.asset
      GlobalEventTable.asset
  Integration/
    Legacy/
      RngAdapter.cs
      CombatAdapter.cs
      EventBusAdapter.cs
      SaveAdapter.cs
  Presentation/
    BoardView/
      IsoBoardRenderer.cs
      CellView.cs
      PlayerPawnView.cs
```

**Luồng production trong Unity**:
- `TurnOrchestrator` phát state `AwaitInput`.
- UI chọn roll hoặc chọn bước (nếu là Boss Diêm Vương).
- `MovementSystem` đi qua từng edge của `BoardGraph`.
- Mỗi bước gọi `WorldManager.OnStepPassed` để tick survival.
- Khi enter cell: `EventResolver.ResolveCellEffect`.
- Nếu >=2 entity cùng cell: `CombatResolver.ResolveAutoBattle`.
- Kết thúc turn: `StatusTick + EconomySettlement`.
- Khi đủ 8 người hoàn tất lap: `GlobalYearSystem.TriggerYearEvent`.

---

## 5) Class design chi tiết

### `Player`

```python
class Player:
    id: str
    name: str
    level: int = 1
    rank: str
    player_class: str

    hp: float
    hp_max: float
    hunger: float
    thirst: float
    spirit: float
    spirit_max: float = 100

    atk: float
    wil: float
    cp: float
    luck: int  # 0..20

    silver: int
    gold: int

    position_cell_id: str
    lane: str  # inner|outer
    is_soul: bool
    is_underworld_boss: bool
    soul_essence: int

    moved_cells_this_turn: int
    moved_cells_accum_for_survival: int
    lap_count: int
    has_completed_lap_this_year: bool

    active_effects: list
    inventory: dict
    flags: dict
```

**Hàm chính**:
- `apply_stat_delta(delta, source)`
- `convert_currency()`
- `get_good_event_bonus()` trả `0.02 * luck`
- `tick_effects(phase)`
- `enter_soul_state()` / `try_rebirth()`
- `record_move(step_count)`

### `Cell`

```python
class Cell:
    id: str
    biome: str
    cell_type: str
    lane: str
    index_on_lane: int
    is_junction: bool
    branch_id: str | None
    tags: set[str]

    trigger_limit_per_turn: int
    occupancy_ids: list[str]
    metadata: dict
```

**Hàm chính**:
- `can_enter(player, world_state)`
- `on_enter(player, context)`
- `on_stay(player, turns)`
- `get_effect_key()`

### `WorldManager`

```python
class WorldManager:
    board_graph: BoardGraph
    players: dict[str, Player]
    cells: dict[str, Cell]
    underworld_manager: UnderworldManager
    global_year_system: GlobalYearSystem

    def start_turn(self, player_id): ...
    def resolve_movement(self, player_id, move_points, route_choice): ...
    def resolve_cell(self, player_id): ...
    def resolve_auto_combat(self, cell_id): ...
    def end_turn(self, player_id): ...
    def advance_year_if_ready(self): ...
```

### Lớp phụ quan trọng
- `BoardGraph`: adjacency list cho dual-track + branch Thánh Tông + warp edge World Rift.
- `EventResolver`: nhận `CellType`, đọc table effect, resolve theo weight.
- `CombatResolver`: dùng adapter combat cũ + modifier biome/class synergy.
- `SurvivalSystem`: trừ Hunger/Thirst mỗi 5 ô; áp penalty khi đói/khát.
- `GlobalYearSystem`: kiểm tra đủ 8 người hoàn lap -> phát global event.
- `UnderworldManager`: map 5x4, boss transfer, rebirth rule.
- `AntiSnowballSystem`: trợ cấp top-bottom gap, thuế dẫn đầu mềm.

---

## 6) Cell effect dictionary/switch đầy đủ

```python
CELL_EFFECTS = {
  "LAC_DUONG_START": {
    "trigger": "on_enter",
    "weights": [
      {"event": "SMALL_FATE", "p": 0.20},
      {"event": "SECRET_CRUSH", "p": 0.10},
      {"event": "NONE", "p": 0.70}
    ],
    "good_event_formula": "p_final = min(p_base + 0.02*Luck, p_cap)",
    "effects": {
      "SMALL_FATE": {"currency": {"gold": +5}},
      "SECRET_CRUSH": {"item": "OLD_STONE_RING", "flag": "LEADS_LARGE_FATE"},
      "BASE_COST": {"currency": {"silver": -20}}
    },
    "duration": "instant",
    "success_fail": "none",
    "hooks": []
  },

  "VO_DANH_SON": {
    "trigger": "on_enter",
    "weights": [{"event":"SPIRIT_DRAIN","p":1.0}],
    "effects": {
      "SPIRIT_DRAIN": {"spirit_pct_by_index": [0.20,0.35,0.50,0.35,0.20]},
      "WILD_BEAST_ATTACK": {"condition":"spirit<20", "p_range":[0.20,0.50], "hook":"AUTO_COMBAT_WILD"},
      "HIDDEN_QUEST": {"item":"NAMELESS_JADE", "result":"OLD_ANCESTOR_HELPER"}
    },
    "duration": "instant/helper_persistent",
    "success_fail": "win_beast->loot, lose->hp_loss",
    "hooks": ["combat_chain"]
  },

  "THANH_MAO_SON": {
    "trigger":"on_enter",
    "weights":[{"event":"MOVE_FREEDOM","p":1.0}],
    "effects": {
      "MOVE_FREEDOM":{"move_delta_choice":[-1,+1],"duration_turns":1},
      "LITTLE_SHOP":{"forced_sleep":1,"spirit_restore_flat":20,"forced_food_cost_silver":30},
      "BLACKSMITH":{"gear_price_mod_pct":-15}
    },
    "duration":"1_turn_or_instant",
    "success_fail":"none",
    "hooks":[]
  },

  "MONG_TRACH": {
    "trigger":"on_stay_or_enter",
    "weights":[{"event":"NIGHTMARE","p":0.40},{"event":"NONE","p":0.60}],
    "effects": {
      "FORCED_SLEEP":{"condition":"stay_turns>=2","sleep_turns":1},
      "NIGHTMARE":{"spirit_max_pct":-0.10,"permanent":True,"hook":"AUTO_COMBAT_NIGHTMARE"},
      "DREAM_STONE":{"item":"DREAM_STONE","use":"spirit_max+5"}
    },
    "duration":"permanent_or_instant",
    "success_fail":"nightmare_win->escape, lose->extra_spirit_loss",
    "hooks":["combat_chain"]
  },

  "HOA_DIEM_SON": {
    "trigger":"turn_end_if_in_cell",
    "weights":[{"event":"FIRE_LOTUS","p":0.30},{"event":"NONE","p":0.70}],
    "effects": {
      "LAVA_BURN":{"condition":"cp<threshold","hp_pct":-0.10},
      "FIRE_LOTUS":{"item":"FIRE_LOTUS","buff":{"atk_pct":+0.10,"wil_pct":+0.10}}
    },
    "duration":"buff_3_turns_default",
    "success_fail":"none",
    "hooks":[]
  },

  "LOI_TONG": {
    "trigger":"on_enter",
    "weights":[{"event":"LIGHTNING_STRIKE","p":0.10},{"event":"SHOP","p":0.90}],
    "effects": {
      "LIGHTNING_STRIKE":{"hp_max_pct":-0.10,"permanent":True},
      "THUNDER_BLOOD_PILL":{"shop_item":True,"buff":{"atk_pct":+0.25,"wil_pct":+0.25},"duration_turns":3}
    },
    "duration":"instant_or_3_turns",
    "success_fail":"none",
    "hooks":[]
  },

  "KIEM_NHAI": {
    "trigger":"on_enter",
    "weights":[{"event":"SWORD_HEART","p":0.20},{"event":"NONE","p":0.80}],
    "effects": {
      "SWORD_HEART":{"sword_dmg_pct":+0.20,"permanent":True}
    },
    "duration":"permanent",
    "success_fail":"none",
    "hooks":[]
  },

  "HUYET_ANH_TONG": {
    "trigger":"on_enter",
    "weights":[
      {"event":"ENSLAVED","p_dynamic":"0.15_to_0.30"},
      {"event":"ROBBED","p":0.40},
      {"event":"BLACK_MARKET","p":"remaining"}
    ],
    "effects": {
      "ENSLAVED":{"state":"MINING_SLAVE","duration_turns":2,"move_locked":True},
      "ROBBED":{"hp_pct":-0.30,"silver_pct":-0.90},
      "BLACK_MARKET":{"shop_modifier":"high_risk_high_reward"}
    },
    "duration":"2_turns_or_instant",
    "success_fail":"escape_check_success->reduce_duration",
    "hooks":["event_chain"]
  },

  "THANH_TONG_BRANCH": {
    "trigger":"on_interact",
    "weights":[{"event":"BUFF_EXTRACTION","p":1.0}],
    "effects": {
      "BUFF_EXTRACTION":{"convert_active_effect_to_item":True},
      "DEBUFF_EXTRACTION":{"convert_debuff_to_cursed_item":True},
      "EXPRESS_DELIVERY":{"send_item_to_player":True,"cost_silver":50}
    },
    "duration":"instant",
    "success_fail":"delivery_fail_if_target_full_inventory",
    "hooks":["inventory_chain"]
  },

  "WORLD_RIFT_RING": {
    "trigger":"on_enter",
    "weights":[
      {"event":"TELEPORT","p_dynamic":"0.10_to_0.40_by_ring_depth"},
      {"event":"NONE","p":"remaining"}
    ],
    "effects": {
      "TELEPORT":{"destinations":["BI_CANH","QUY_VUC"],"split":[0.7,0.3]},
      "SOUL_REBIRTH_GATE":{"condition":"is_soul","attempt_possession":True}
    },
    "duration":"instant",
    "success_fail":"rebirth_fail->soul_remain",
    "hooks":["underworld_transition"]
  },

  "QUY_VUC_FIRE_HELL": {
    "trigger":"turn_end_if_in_cell",
    "weights":[{"event":"HELLFIRE","p":1.0}],
    "effects":{"HELLFIRE":{"hp_pct":-0.10}},
    "duration":"instant",
    "success_fail":"none",
    "hooks":[]
  },

  "QUY_VUC_VO_THUONG": {
    "trigger":"on_enter",
    "weights":[{"event":"PUNISHMENT","p":1.0}],
    "effects":{"PUNISHMENT":{"condition":"killer_flag=True","debuff":"judgment_chain"}},
    "duration":"2_turns",
    "success_fail":"none",
    "hooks":["combat_chain"]
  },

  "QUY_VUC_HAN_LAO": {
    "trigger":"on_interact",
    "weights":[{"event":"SOUL_FORGE","p":1.0}],
    "effects":{"SOUL_FORGE":{"currency":"SOUL_ESSENCE","trade_table":"ghost_blacksmith"}},
    "duration":"instant",
    "success_fail":"none",
    "hooks":["economy_chain"]
  },

  "QUY_VUC_DIEM_VUONG": {
    "trigger":"on_boss_defeat",
    "weights":[{"event":"BOSS_TRANSFER","p":1.0}],
    "effects": {
      "BOSS_TRANSFER":{"winner_becomes_boss":True,"boss_move_mode":"choose_1_to_6","cp_bonus_pct":+0.25},
      "BOSS_DEATH_IN_HUMAN_WORLD":{"rebirth_level":1,"remove_boss_flag":True}
    },
    "duration":"until_death_or_replace",
    "success_fail":"none",
    "hooks":["role_transition"]
  }
}
```

---

## 7) Logic flow step-by-step + state machine

### Step-by-step
1. `TURN_START`: tick effect đầu lượt.
2. `INPUT_PHASE`:
   - Người thường: roll dice.
   - Boss Diêm Vương: chọn bước 1-6.
3. `ROUTE_PHASE`: nếu ở junction thì chọn inner/outer/branch hợp lệ.
4. `MOVE_PHASE`: đi từng ô; mỗi 5 ô gọi `SurvivalSystem.apply_decay()`.
5. `ENTER_CELL_PHASE`: resolve effect theo `CELL_EFFECTS`.
6. `COMBAT_CHECK_PHASE`: nếu ô có >=2 entity thì auto-combat.
7. `POST_COMBAT_PHASE`: loot, death->soul, boss transfer check.
8. `TURN_END_PHASE`: tick duration cuối lượt, economy settle.
9. `YEAR_CHECK_PHASE`: nếu đủ 8 người `has_completed_lap_this_year == true` -> phát `GLOBAL_YEAR_EVENT`.

### State machine chính
- `AwaitTurnStart -> AwaitInput -> AwaitRouteDecision -> Moving -> ResolvingCell -> ResolvingCombat -> EndTurnSettlement -> NextPlayer`
- Nhánh đặc biệt:
  - `SoulState`: hạn chế mua/land action, chỉ cho phép route đến World Rift ưu tiên.
  - `UnderworldState`: map context đổi sang 5x4, vẫn theo turn loop chuẩn.

---

## 8) Isometric conversion + dual-track graph rule

### Công thức grid -> screen (2:1)
Với `tileW`, `tileH = tileW/2`:

```text
screenX = (gridX - gridY) * (tileW / 2)
screenY = (gridX + gridY) * (tileH / 2)
```

Offset camera:

```text
screenX += originX
screenY += originY
```

### Biểu diễn dual-track + junction
- Node: `CellNode(id, lane, biome, flags)`.
- Edge có hướng: `LaneEdge(from, to, move_cost=1, condition)`.
- Junction có `JunctionRule`:
  - Chỉ xuất hiện tại 4 góc.
  - Nếu người chơi không chọn lane trong thời gian input -> mặc định giữ lane hiện tại.
  - Nếu lane đích bị khóa (event lock) -> fallback lane còn lại.

### Rule kiểm tra ô hợp lệ
1. `can_enter` kiểm tra lock/soul/boss restrictions.
2. `can_branch` kiểm tra quyền vào Thánh Tông branch hoặc World Rift transition.
3. `route_validation` xác nhận path không vượt move_points.

---

## 9) Kế hoạch 6 phase + test strategy

### Phase 1 — Vertical Slice
- **Input**: 8 player mock, 12 ô mẫu, 3 loại biome.
- **Output**: loop turn hoàn chỉnh từ roll tới end-turn.
- **DoD**: chạy 1000 lượt không crash, deterministic theo seed.
- **Test**:
  - Unit: state transition không skip state.
  - Integration: cùng seed cho cùng timeline.
- **Rủi ro**: coupling mạnh giữa turn và event.

### Phase 2 — Board + Movement
- **Input**: graph 40 ô dual-track + 4 junction.
- **Output**: route decision ổn định, lane switching đúng luật.
- **DoD**: coverage > 90% cho movement rules.
- **Test**: junction fallback, blocked lane, wrap lap count.
- **Rủi ro**: off-by-one khi wrap vòng.

### Phase 3 — Cell Events + Survival
- **Input**: full `CELL_EFFECTS`, hunger/thirst decay.
- **Output**: toàn bộ biome trigger đúng thời điểm.
- **DoD**: simulation 10k turn, không có event weight âm/sum sai.
- **Test**: probability sanity, effect duration tick chính xác.
- **Rủi ro**: stack buff/debuff tạo exploit.

### Phase 4 — Combat + Class Synergy
- **Input**: adapter combat cũ + class synergy 7 class.
- **Output**: auto-combat trên ô hoạt động đầy đủ.
- **DoD**: combat result reproducible theo seed + config.
- **Test**: multi-entity conflict, tie-break, death->soul.
- **Rủi ro**: combat pacing quá dài làm chậm nhịp bàn cờ.

### Phase 5 — Underworld + Boss Transfer
- **Input**: map 5x4, boss entity, rebirth rules.
- **Output**: teleport/quỷ vực/boss kế vị vận hành end-to-end.
- **DoD**: boss transfer pass 100% case bắt buộc.
- **Test**: boss kill in underworld, boss chết human world -> lv1.
- **Rủi ro**: lỗi đồng bộ role flag giữa 2 map.

### Phase 6 — Telemetry + Balancing
- **Input**: metric hooks (winrate, lap time, death cause, economy delta).
- **Output**: dashboard balancing + anti-snowball tuning.
- **DoD**: data đủ để cân bằng Luck/CP/economy sau 100 trận giả lập.
- **Test**: regression balance, fairness by percentile.
- **Rủi ro**: overfit vào bot simulation, lệch hành vi người chơi thật.

---

## 10) 3 vòng tự phản biện và bản chốt cuối

### Vòng 1
- **Lỗ hổng**: xác suất event tốt có thể vượt trần khi Luck cao + bonus vùng.
- **Sửa**: thêm `P_cap` theo từng cell (mặc định 0.85), chuẩn hóa clamp sau mọi modifier.
- **Cập nhật**: `good_event_formula` có `min(..., p_cap)`.
- **Điểm**:
  - Mở rộng: 8.8
  - Nhất quán luật: 8.7
  - Dễ test: 9.0
  - Tái dùng code cũ: 8.9
  - Ship Unity: 8.8

### Vòng 2
- **Lỗ hổng**: state Soul và teleport World Rift thiếu ưu tiên đường đi, dễ “kẹt vĩnh viễn”.
- **Sửa**: thêm route bias cho Soul (`soul_path_priority`) + pity counter sau N lượt không gặp rift.
- **Cập nhật**: `UnderworldManager` nhận nhiệm vụ anti-stall; event rift tăng dần xác suất theo pity.
- **Điểm**:
  - Mở rộng: 9.1
  - Nhất quán luật: 9.0
  - Dễ test: 9.1
  - Tái dùng code cũ: 9.0
  - Ship Unity: 9.0

### Vòng 3
- **Lỗ hổng**: nguy cơ runaway leader do boss perk chọn bước 1-6 quá mạnh ở late game.
- **Sửa**: giới hạn perk bằng “Heat”:
  - Nếu top CP lead > 25% median: boss chọn bước trong [1..4].
  - Thuế mềm 5-12% silver gain theo lead bracket.
- **Cập nhật**: bổ sung `AntiSnowballSystem` vào end-turn settlement.
- **Điểm**:
  - Mở rộng: 9.3
  - Nhất quán luật: 9.2
  - Dễ test: 9.2
  - Tái dùng code cũ: 9.1
  - Ship Unity: 9.2

### Bản chốt cuối
Đáp án đạt điều kiện dừng: không còn mâu thuẫn logic lớn, dependency rõ qua adapter, có kế hoạch test unit/integration/simulation khả thi cho toàn bộ vòng đời triển khai.

---

## 11) Danh sách giả định mở cần Product Owner xác nhận

1. Mức trần `P_cap` cho Good Event theo từng vùng (mặc định 85%) có chốt cố định không?
2. Công thức CP chính thức là input trực tiếp hay suy từ Atk/Wil/gear/rank?
3. “Mining Slave” bị khóa bao nhiêu hành động ngoài di chuyển?
4. Forced Sleep có bỏ qua lượt hoàn toàn hay chỉ khóa một số action?
5. Tỷ lệ teleport `Bí Cảnh`/`Quỷ Vực` có phụ thuộc năm hoặc trạng thái Soul?
6. Phạm vi gửi item qua Express Delivery: cùng map hay xuyên map?
7. Boss Diêm Vương khi kế vị có reset hiệu ứng tạm thời hiện có không?
8. Global Event theo năm áp lên toàn bộ map hay chỉ main board?
9. Pity mechanic cho Soul có hiển thị UI cho người chơi hay ẩn?
10. Mức anti-snowball (thuế mềm/trợ cấp) ưu tiên cân bằng PvP hay giữ cảm giác power fantasy?