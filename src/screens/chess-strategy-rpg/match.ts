import { ensureStyleTag, mountSection } from '../../ui/dom.ts';
import {
  createIrregularBoard,
  MIN_CORE_SIZE,
  randomSeedText,
  resolveEnemyUnitsForChess,
  resolvePlayerUnits,
  resolveValidSeed,
} from './battle.ts';
import { createRngState, nextRngValue } from '../../utils/rng.ts';
import {
  advanceTurn,
  canUseCommand,
  createInitialMatchState,
  applyActionCommand,
  applySkipAction,
  evaluateObjectiveResult,
  chooseFallbackAction,
  consumeDecisionTime,
  PLAYER_TURN_CAP,
  recordMove,
  resolveAction,
  resolveActionUiEffects,
  type MatchCommandType,
  type MatchState,
  type TeamId,
  type ObjectiveMode,
} from './turn-state.ts';

const STYLE_ID = 'chess-strategy-rpg-match-style';
const MAX_LINEAR_MOVE_STEPS = 6;

const CSS = /* css */ `
  .app--chess-strategy-rpg-match{min-height:100dvh;padding:16px;box-sizing:border-box;}
  .chess-rpg-match{max-width:1320px;margin:0 auto;min-height:calc(100dvh - 32px);border-radius:20px;border:1px solid rgba(126,208,255,.3);background:linear-gradient(170deg,rgba(8,18,31,.98),rgba(14,35,57,.92));padding:18px;color:#e7f3ff;display:grid;gap:14px;}
  .chess-rpg-match__top{display:flex;align-items:center;justify-content:space-between;gap:10px;}
  .chess-rpg-match__back{border:1px solid rgba(143,198,255,.5);background:rgba(8,19,31,.85);color:#e6f2ff;width:34px;height:34px;display:grid;place-items:center;border-radius:10px;padding:0;cursor:pointer;font-size:18px;line-height:1;}
  .chess-rpg-match__meta{font-size:13px;color:#8ec4df;}
  .chess-rpg-match__field{position:relative;overflow:auto;border:1px solid rgba(121,187,228,.32);border-radius:14px;background:radial-gradient(circle at 35% 20%, rgba(43,106,146,.26), rgba(5,13,23,.95));padding:12px;min-height:78dvh;display:grid;align-content:start;justify-content:start;}
  .chess-rpg-match__board{display:grid;gap:2px;align-self:start;justify-self:start;background:rgba(8,20,29,.82);padding:8px;border-radius:12px;border:1px solid rgba(131,213,255,.2);}
  .chess-rpg-match__cell{width:var(--chess-cell-size, 42px);height:var(--chess-cell-size, 42px);border-radius:8px;border:1px solid rgba(145,198,228,.2);display:grid;place-items:center;font-size:11px;}
  .chess-rpg-match__cell--void{opacity:.2;border-style:dashed;}
  .chess-rpg-match__cell--play{background:rgba(22,66,92,.56);}
  .chess-rpg-match__cell--player{background:rgba(26,117,90,.74);border-color:rgba(130,255,219,.6);font-weight:700;color:#95ffd9;}
  .chess-rpg-match__cell--enemy{background:rgba(126,42,72,.68);border-color:rgba(255,149,196,.56);font-weight:700;color:#ffc3dd;}
  .chess-rpg-match__cell--selected{outline:2px solid rgba(255,229,142,.96);outline-offset:-2px;}
  .chess-rpg-match__cell--move{background:rgba(50,170,83,.72);border-color:rgba(150,255,176,.94);color:#e8fff0;cursor:pointer;}
  .chess-rpg-match__turn{margin:0;font-size:13px;color:#bce2ff;}
  .chess-rpg-match__pieces{display:flex;flex-wrap:wrap;gap:6px;}
  .chess-rpg-match__piece{font-size:12px;border:1px solid rgba(161,216,255,.4);border-radius:999px;padding:2px 8px;background:rgba(31,74,107,.5);color:#e6f3ff;}
  .chess-rpg-match__piece--active{border-color:rgba(163,255,183,.78);background:rgba(43,121,72,.52);color:#ebffef;}
  .chess-rpg-match__actions{display:flex;flex-wrap:wrap;gap:8px;}
  .chess-rpg-match__action-btn{border:1px solid rgba(149,210,248,.5);background:rgba(19,47,73,.82);color:#ecf7ff;border-radius:10px;padding:6px 12px;font-size:12px;cursor:pointer;}
  .chess-rpg-match__action-btn:disabled{opacity:.45;cursor:not-allowed;}
  .chess-rpg-match__result{padding:10px 12px;border-radius:10px;border:1px solid rgba(247,192,124,.6);background:rgba(76,38,19,.4);font-size:13px;color:#ffe4ca;}
`;

interface RenderContext {
  readonly root: HTMLElement;
  readonly shell?: { enterScreen?: (screenId: string) => void } | null;
  readonly params?: Record<string, unknown> | null;
}

type PieceType = 'rook' | 'knight' | 'bishop';

interface UnitState {
  id: string;
  label: string;
  team: 'player' | 'enemy';
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  atk: number;
  arm: number;
  rage: number;
  maxRage: number;
  skillCost: number;
  pieces: PieceType[];
  slotIndex: number;
}

interface MatchCommand {
  readonly type: MatchCommandType;
  readonly team: TeamId;
  readonly payload?: Record<string, number>;
}

const PIECE_LABEL: Record<PieceType, string> = {
  rook: 'Xe',
  knight: 'Ngựa',
  bishop: 'Tượng',
};

function hashSeedText(seedText: string): number {
  let hash = 2166136261 >>> 0;
  for (let i = 0; i < seedText.length; i += 1) {
    hash ^= seedText.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash >>> 0;
}

function numberParam(input: unknown, fallback = 1): number {
  const value = Number(input);
  if (!Number.isFinite(value)) return fallback;
  return Math.max(1, Math.floor(value));
}

function keyOf(x: number, y: number): string {
  return `${x},${y}`;
}

function parseKey(key: string): { x: number; y: number } | null {
  const [rawX, rawY] = key.split(',');
  const x = Number(rawX);
  const y = Number(rawY);
  if (!Number.isInteger(x) || !Number.isInteger(y)) return null;
  return { x, y };
}

function randomPieces(seed: string, unitId: string): PieceType[] {
  const pool: PieceType[] = ['rook', 'knight', 'bishop'];
  const rng = createRngState(hashSeedText(`${seed}:${unitId}`));
  const picks: PieceType[] = [];
  for (let i = 0; i < 3; i += 1) {
    const index = Math.floor(nextRngValue(rng) * pool.length);
    picks.push(pool[index] ?? 'rook');
  }
  return picks;
}

function collectLinearMoves(
  origin: { x: number; y: number },
  vectors: Array<{ dx: number; dy: number }>,
  playable: Set<string>,
  occupied: Set<string>,
): string[] {
  const moves: string[] = [];
  for (const vector of vectors) {
    for (let step = 1; step <= MAX_LINEAR_MOVE_STEPS; step += 1) {
      const x = origin.x + vector.dx * step;
      const y = origin.y + vector.dy * step;
      const key = keyOf(x, y);
      if (!playable.has(key)) break;
      if (occupied.has(key)) break;
      moves.push(key);
    }
  }
  return moves;
}

function resolveReachableCells(unit: UnitState, playable: Set<string>, occupied: Set<string>): Set<string> {
  const unique = new Set<string>();
  const origin = { x: unit.x, y: unit.y };
  for (const piece of unit.pieces) {
    if (piece === 'rook') {
      const options = collectLinearMoves(origin, [
        { dx: 1, dy: 0 },
        { dx: -1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: 0, dy: -1 },
      ], playable, occupied);
      options.forEach((move) => unique.add(move));
      continue;
    }
    if (piece === 'bishop') {
      const options = collectLinearMoves(origin, [
        { dx: 1, dy: 1 },
        { dx: 1, dy: -1 },
        { dx: -1, dy: 1 },
        { dx: -1, dy: -1 },
      ], playable, occupied);
      options.forEach((move) => unique.add(move));
      continue;
    }
    const knightOffsets = [
      { dx: 1, dy: 2 },
      { dx: 1, dy: -2 },
      { dx: -1, dy: 2 },
      { dx: -1, dy: -2 },
      { dx: 2, dy: 1 },
      { dx: 2, dy: -1 },
      { dx: -2, dy: 1 },
      { dx: -2, dy: -1 },
    ];
    for (const offset of knightOffsets) {
      const targetKey = keyOf(origin.x + offset.dx, origin.y + offset.dy);
      if (!playable.has(targetKey) || occupied.has(targetKey)) continue;
      unique.add(targetKey);
    }
  }
  return unique;
}

export function renderScreen(context: RenderContext): { destroy: () => void } {
  const { root, shell = null, params = null } = context;
  ensureStyleTag(STYLE_ID, { css: CSS });

  const seedInput = typeof params?.seed === 'string' ? params.seed : randomSeedText(10);
  const seed = resolveValidSeed(seedInput);
  const realm = numberParam(params?.realm, 1);
  const playerUnits = resolvePlayerUnits(realm);
  const enemyUnits = resolveEnemyUnitsForChess(realm, seed, playerUnits);

  const section = document.createElement('section');
  section.className = 'chess-rpg-match';
  const mount = mountSection({ root, section, rootClasses: 'app--chess-strategy-rpg-match' });

  section.innerHTML = `
    <div class="chess-rpg-match__top">
      <button type="button" class="chess-rpg-match__back" aria-label="Về hub mô phỏng">←</button>
      <div class="chess-rpg-match__meta">Trận chính · Seed ${seed} · Tu vi ${realm} · Luật quân cờ chuẩn cờ vua.</div>
    </div>
    <p class="chess-rpg-match__turn" data-role="turn"></p>
    <div class="chess-rpg-match__pieces" data-role="pieces"></div>
    <div class="chess-rpg-match__actions" data-role="actions"></div>
    <p class="chess-rpg-match__result" data-role="result"></p>
    <div class="chess-rpg-match__field">
      <div class="chess-rpg-match__board" data-role="board"></div>
    </div>
  `;

  const boardHost = section.querySelector('[data-role="board"]');
  const backButton = section.querySelector('.chess-rpg-match__back');
  const turnHost = section.querySelector('[data-role="turn"]');
  const piecesHost = section.querySelector('[data-role="pieces"]');
  const actionsHost = section.querySelector('[data-role="actions"]');
  const resultHost = section.querySelector('[data-role="result"]');

  if (boardHost instanceof HTMLElement) {
    const board = createIrregularBoard(seed);
    const viewportWidth = Math.max(320, root.clientWidth || window.innerWidth || 360);
    const availableWidth = Math.max(240, viewportWidth - 72);
    const cellSize = Math.max(30, Math.floor(availableWidth / board.width));
    boardHost.style.setProperty('--chess-cell-size', `${cellSize}px`);
    boardHost.style.gridTemplateColumns = `repeat(${board.width}, var(--chess-cell-size))`;
    const coreStart = Math.floor((board.width - MIN_CORE_SIZE) / 2);
    const playerSlots = [
      `${coreStart},${coreStart}`,
      `${coreStart + 1},${coreStart}`,
      `${coreStart + 2},${coreStart}`,
      `${coreStart + 3},${coreStart}`,
    ];
    const coreEnd = coreStart + MIN_CORE_SIZE - 1;
    const enemySlots = [
      `${coreEnd},${coreEnd}`,
      `${coreEnd - 1},${coreEnd}`,
      `${coreEnd - 2},${coreEnd}`,
      `${coreEnd - 3},${coreEnd}`,
    ];
    const playerStates: UnitState[] = playerUnits
      .slice(0, playerSlots.length)
      .map((unit, index) => {
        const parsed = parseKey(playerSlots[index] ?? '');
        return parsed
          ? {
              id: unit.id,
              label: `P${index + 1}`,
              team: 'player',
              x: parsed.x,
              y: parsed.y,
              hp: unit.hp,
              maxHp: unit.hp,
              atk: unit.atk,
              arm: unit.arm,
              rage: 0,
              maxRage: 100,
              skillCost: 4,
              pieces: randomPieces(seed, unit.id),
              slotIndex: index,
            }
          : null;
      })
      .filter((item): item is UnitState => item !== null);
      const enemyStates: UnitState[] = enemyUnits
      .slice(0, enemySlots.length)
      .map((unit, index) => {
        const parsed = parseKey(enemySlots[index] ?? '');
        return parsed
          ? {
              id: `${unit.id}#${index + 1}`,
              label: `E${index + 1}`,
              team: 'enemy',
              x: parsed.x,
              y: parsed.y,
              hp: unit.hp,
              maxHp: unit.hp,
              atk: unit.atk,
              arm: unit.arm,
              rage: 0,
              maxRage: 100,
              skillCost: 4,
              pieces: randomPieces(`${seed}:enemy`, unit.id),
              slotIndex: index,
            }
          : null;
      })
      .filter((item): item is UnitState => item !== null);
    const lineupSize = Math.min(4, Math.max(playerSlots.length, enemySlots.length));
    const objectiveFromParam = typeof params?.objective === 'string' ? params.objective : 'elimination';
    const objectiveMode: ObjectiveMode = objectiveFromParam === 'rescue' || objectiveFromParam === 'boss' ? objectiveFromParam : 'elimination';
    let rescueTargetAlive = true;
    let bossAlive = true;
    let matchState: MatchState = createInitialMatchState(lineupSize, objectiveMode);
    let unitTurnStartedAtMs = Date.now();
    let selectedUnitId = playerStates[0]?.id ?? null;
    const reachableById = new Map<string, Set<string>>();
    const aliveByTeam = {
      player: playerStates,
      enemy: enemyStates,
    };

    const resolveActiveUnit = (): UnitState | null => {
      const teamUnits = aliveByTeam[matchState.activeTeam];
      return teamUnits.find((unit) => unit.slotIndex === matchState.activeIndexInLineup && unit.hp > 0) ?? null;
    };

    const allUnits = (): UnitState[] => [...aliveByTeam.player, ...aliveByTeam.enemy].filter((unit) => unit.hp > 0);

    const removeDeadUnits = (): void => {
      for (const team of ['player', 'enemy'] as const) {
        for (const unit of aliveByTeam[team]) {
          if (unit.hp <= 0) unit.hp = 0;
        }
      }
    };
    const syncMatchResult = (hook: 'onTurnStart' | 'onAction' | 'onTurnEnd' = 'onAction'): void => {
      matchState = evaluateObjectiveResult(matchState, {
        hook,
        context: {
          aliveByTeam: {
            player: aliveByTeam.player.filter((unit) => unit.hp > 0).length,
            enemy: aliveByTeam.enemy.filter((unit) => unit.hp > 0).length,
          },
          objectiveState: {
            rescueTargetAlive,
            bossAlive,
          },
        },
      });
    };

    const normalizeActiveSlot = (): void => {
      if (matchState.result.status !== 'ongoing') return;
      let guard = 0;
      const maxGuard = Math.max(1, lineupSize * 4);
      while (!resolveActiveUnit() && guard < maxGuard) {
        const nextState = advanceTurn(matchState);
        if (nextState === matchState) break;
        matchState = nextState;
        guard += 1;
        syncMatchResult();
        if (matchState.result.status !== 'ongoing') return;
      }
    };

    const basicDamage = (attacker: UnitState, defender: UnitState): number => Math.max(1, Math.floor(attacker.atk - defender.arm));

    const isAdjacent = (a: UnitState, b: UnitState): boolean => Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;

    const applyCollapseResolution = (): void => {
      if (matchState.collapseRings <= 0) return;
      const ring = matchState.collapseRings;
      const min = ring;
      const maxX = board.width - 1 - ring;
      const maxY = board.height - 1 - ring;
      for (const unit of allUnits()) {
        const outside = unit.x < min || unit.y < min || unit.x > maxX || unit.y > maxY;
        if (outside) {
          unit.hp = 0;
          if (unit.team === 'enemy' && matchState.objectiveMode === 'boss' && unit.slotIndex === 0) {
            bossAlive = false;
          }
        }
      }
      removeDeadUnits();
    };

    const executeCommand = (command: MatchCommand): void => {
      const active = resolveActiveUnit();
      if (!active || command.team !== matchState.activeTeam) return;
      if (matchState.result.status !== 'ongoing') return;
      const resolveCollapseAt = (timing: 'beforeAction' | 'afterAction'): void => {
        if (matchState.collapseTiming !== timing) return;
        applyCollapseResolution();
      };

      if (command.type === 'move') {
        if (!canUseCommand(matchState, command.type)) return;
        matchState = recordMove(matchState, command.payload?.tileSteps ?? 0);
        return;
      }

      if (command.type === 'basicAttack') {
        const targetX = command.payload?.targetX;
        const targetY = command.payload?.targetY;
        const target = allUnits().find((unit) => unit.team !== active.team && unit.x === targetX && unit.y === targetY);
        if (!target || !isAdjacent(active, target)) return;
        if (!canUseCommand(matchState, command.type)) return;
        resolveCollapseAt('beforeAction');
        const actionResult = resolveAction({
          actorTeam: matchState.activeTeam,
          action: 'basicAttack',
          inRange: true,
          validTarget: true,
          aeBefore: matchState.resources[matchState.activeTeam].ae,
          damage: basicDamage(active, target),
          targetHp: target.hp,
        });
        if (!actionResult.ok || actionResult.targetHp == null) return;
        target.hp = actionResult.targetHp;
        active.rage = Math.min(active.maxRage, active.rage + 35);
        removeDeadUnits();
        matchState = applyActionCommand(matchState, 'basicAttack');
        resolveActionUiEffects(actionResult);
        resolveCollapseAt('afterAction');
        syncMatchResult('onAction');
        return;
      }

      if (command.type === 'castSkill') {
        if (!canUseCommand(matchState, command.type, { skillCost: active.skillCost })) return;
        resolveCollapseAt('beforeAction');
        const actionResult = resolveAction({
          actorTeam: matchState.activeTeam,
          action: 'castSkill',
          inRange: true,
          validTarget: true,
          aeBefore: matchState.resources[matchState.activeTeam].ae,
          skillCost: active.skillCost,
          buffIds: ['skill-cast'],
        });
        if (!actionResult.ok) return;
        matchState = applyActionCommand(matchState, 'castSkill', { skillCost: active.skillCost });
        resolveActionUiEffects(actionResult);
        resolveCollapseAt('afterAction');
        syncMatchResult('onAction');
        return;
      }

      if (command.type === 'castUlt') {
        if (!canUseCommand(matchState, command.type, { manualUlt: true, rage: active.rage, ultCost: active.maxRage })) return;
        resolveCollapseAt('beforeAction');
        const actionResult = resolveAction({
          actorTeam: matchState.activeTeam,
          action: 'castUlt',
          inRange: true,
          validTarget: true,
          aeBefore: matchState.resources[matchState.activeTeam].ae,
          actorRage: active.rage,
          requireManualUlt: true,
          ultCost: active.maxRage,
          buffIds: ['ult-cast'],
        });
        if (!actionResult.ok) return;
        active.rage = 0;
        matchState = applyActionCommand(matchState, 'castUlt');
        resolveActionUiEffects(actionResult);
        resolveCollapseAt('afterAction');
        syncMatchResult('onAction');
        return;
      }

      if (command.type === 'skipAction') {
        if (!canUseCommand(matchState, command.type)) return;
        matchState = applySkipAction(matchState);
        return;
      }

      matchState = advanceTurn(matchState);
      syncMatchResult('onTurnEnd');
      normalizeActiveSlot();
      syncMatchResult('onTurnStart');
      const newActive = resolveActiveUnit();
      selectedUnitId = newActive?.id ?? null;
      unitTurnStartedAtMs = Date.now();
    };

    const consumeTurnBudgetOrFallback = (): boolean => {
      const now = Date.now();
      const spentMs = Math.max(0, now - unitTurnStartedAtMs);
      const timed = consumeDecisionTime(matchState, spentMs);
      matchState = timed.state;
      unitTurnStartedAtMs = now;
      if (!timed.timeout) return false;
      const active = resolveActiveUnit();
      if (!active) return true;
      const adjacentTarget = allUnits().find((unit) => unit.team !== active.team && isAdjacent(active, unit));
      const fallback = chooseFallbackAction(matchState, {
        hasSafeBasicTarget: Boolean(adjacentTarget),
        lethalRisk: adjacentTarget ? 0 : 1,
      });
      if (fallback.type === 'basicAttack' && adjacentTarget) {
        executeCommand({ type: 'basicAttack', team: active.team, payload: { targetX: adjacentTarget.x, targetY: adjacentTarget.y } });
      } else {
        executeCommand({ type: 'skipAction', team: active.team });
      }
      executeCommand({ type: 'endTurn', team: active.team });
      return true;
    };

    const renderBoard = (): void => {
      boardHost.innerHTML = '';
      const occupied = new Set(allUnits().map((unit) => keyOf(unit.x, unit.y)));

      for (let y = 0; y < board.height; y += 1) {
        for (let x = 0; x < board.width; x += 1) {
          const key = keyOf(x, y);
          const cell = document.createElement('div');
          cell.dataset.coord = key;
          cell.className = board.playable.has(key)
            ? 'chess-rpg-match__cell chess-rpg-match__cell--play'
            : 'chess-rpg-match__cell chess-rpg-match__cell--void';

  const unit = allUnits().find((entry) => entry.x === x && entry.y === y);
          if (unit) {
            cell.className = unit.team === 'player'
              ? 'chess-rpg-match__cell chess-rpg-match__cell--player'
              : 'chess-rpg-match__cell chess-rpg-match__cell--enemy';
            cell.textContent = unit.label;
            if (unit.id === selectedUnitId) {
              cell.classList.add('chess-rpg-match__cell--selected');
            }
          }

          const currentUnit = resolveActiveUnit();
          const canMoveTo = currentUnit ? reachableById.get(currentUnit.id)?.has(key) : false;
          if (canMoveTo) {
            cell.classList.add('chess-rpg-match__cell--move');
          }

          if (board.playable.has(key)) {
            cell.addEventListener('click', () => {
              const actingUnit = resolveActiveUnit();
              if (matchState.result.status !== 'ongoing') return;
              if (actingUnit?.team !== 'player') return;
              if (!actingUnit) return;
              if (consumeTurnBudgetOrFallback()) {
                prepareReachable();
                renderHUD();
                renderBoard();
                if (matchState.activeTeam === 'enemy' && matchState.result.status === 'ongoing') {
                  window.setTimeout(processEnemyTurn, 240);
                }
                return;
              }
              const target = allUnits().find((entry) => entry.x === x && entry.y === y);
              if (target) {
                if (target.id === actingUnit.id) {
                  selectedUnitId = actingUnit.id;
                  renderHUD();
                  renderBoard();
               return;
                }
                if (target.team !== actingUnit.team) {
                  executeCommand({ type: 'basicAttack', team: 'player', payload: { targetX: x, targetY: y } });
                  executeCommand({ type: 'endTurn', team: 'player' });
                  prepareReachable();
                  renderHUD();
                  renderBoard();
                  if (matchState.activeTeam === 'enemy' && matchState.result.status === 'ongoing') {
                    window.setTimeout(processEnemyTurn, 240);
                  }
                }
                return;
              }
              if (!reachableById.get(actingUnit.id)?.has(key)) return;
              const tileSteps = Math.abs(actingUnit.x - x) + Math.abs(actingUnit.y - y);
              actingUnit.x = x;
              actingUnit.y = y;
              executeCommand({ type: 'move', team: 'player', payload: { tileSteps } });
              prepareReachable();
              renderHUD();
              renderBoard();
            });
          }
          boardHost.appendChild(cell);
        }
      }
    };

   const renderHUD = (): void => {
      const active = resolveActiveUnit();
      if (turnHost instanceof HTMLElement) {
        const objectiveLabel = matchState.objectiveMode === 'elimination' ? 'Objective: Diệt sạch địch' : matchState.objectiveMode === 'rescue' ? 'Objective: Bảo vệ mục tiêu giải cứu' : 'Objective: Hạ boss';
        turnHost.textContent = active
          ? active.team === 'player'
           ? `Pha Player · lượt ${matchState.turnCountPlayer}/${PLAYER_TURN_CAP} · ${active.label} (slot ${matchState.activeIndexInLineup + 1}/${lineupSize}) · ${objectiveLabel} · Move:${matchState.turn.hasMoved ? 'xong' : 'chưa'} · Action:${matchState.turn.hasActed ? 'xong' : 'chưa'} · Timer:${Math.ceil(matchState.unitTimer.remainingMs / 1000)}s + Bank ${Math.ceil(matchState.resources.player.bankTimeMs / 1000)}s.`
            : `Pha AI · ${active.label} (slot ${matchState.activeIndexInLineup + 1}/${lineupSize}) đang xử lý tự động.`
            : 'Không có nhân vật khả dụng.';
      }
  if (piecesHost instanceof HTMLElement) {
        piecesHost.innerHTML = '';
        if (active) {
          const teamResource = matchState.resources[active.team];
          const status = document.createElement('span');
          const canSkill = canUseCommand(matchState, 'castSkill', { skillCost: active.skillCost, ae: teamResource.ae });
          const canUlt = canUseCommand(matchState, 'castUlt', { manualUlt: true, rage: active.rage, ultCost: active.maxRage });
          status.className = 'chess-rpg-match__piece chess-rpg-match__piece--active';
          status.textContent = `AE ${teamResource.ae.toFixed(1)} | Rage ${active.rage}/${active.maxRage} | Skill ${canSkill ? 'mở' : 'khóa'} | Ult ${canUlt ? 'mở tay' : 'khóa'}`;
          piecesHost.appendChild(status);
          active.pieces.forEach((piece) => {
            const pill = document.createElement('span');
            pill.className = 'chess-rpg-match__piece chess-rpg-match__piece--active';
            pill.textContent = PIECE_LABEL[piece];
            piecesHost.appendChild(pill);
          });
        }
      }
      if (resultHost instanceof HTMLElement) {
        if (matchState.result.status === 'ongoing') {
          resultHost.hidden = true;
        } else {
          resultHost.hidden = false;
          resultHost.textContent = matchState.result.status === 'win'
            ? 'Thắng trận (elimination).'
            : `Thua trận (${matchState.result.reason === 'turn-cap' ? 'hết turn cap 9 lượt Player' : 'bị tiêu diệt'}).`;
        }
      }
      if (actionsHost instanceof HTMLElement) {
        actionsHost.innerHTML = '';
        const activePlayer = active && active.team === 'player' ? active : null;
        const buildActionButton = (label: string, onClick: () => void, disabled: boolean): void => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'chess-rpg-match__action-btn';
          button.textContent = label;
          button.disabled = disabled;
          button.addEventListener('click', onClick);
          actionsHost.appendChild(button);
        };
        buildActionButton(
          'Dùng Skill',
          () => {
            if (!activePlayer) return;
            executeCommand({ type: 'castSkill', team: 'player' });
            executeCommand({ type: 'endTurn', team: 'player' });
            prepareReachable();
            renderHUD();
            renderBoard();
          },
          !activePlayer || !canUseCommand(matchState, 'castSkill', { skillCost: activePlayer.skillCost }) || matchState.result.status !== 'ongoing',
        );
        buildActionButton(
          'Dùng Ultimate',
          () => {
            if (!activePlayer) return;
            executeCommand({ type: 'castUlt', team: 'player' });
            executeCommand({ type: 'endTurn', team: 'player' });
            prepareReachable();
            renderHUD();
            renderBoard();
          },
          !activePlayer || !canUseCommand(matchState, 'castUlt', { manualUlt: true, rage: activePlayer.rage, ultCost: activePlayer.maxRage }) || matchState.result.status !== 'ongoing',
        );
        buildActionButton(
          'Bỏ qua hành động',
          () => {
            if (!activePlayer) return;
            executeCommand({ type: 'skipAction', team: 'player' });
            executeCommand({ type: 'endTurn', team: 'player' });
            prepareReachable();
            renderHUD();
            renderBoard();
            if (matchState.activeTeam === 'enemy' && matchState.result.status === 'ongoing') {
              window.setTimeout(processEnemyTurn, 240);
            }
          },
          !activePlayer || !canUseCommand(matchState, 'skipAction') || matchState.result.status !== 'ongoing',
        );
        buildActionButton(
          'Kết thúc lượt',
          () => {
            if (!activePlayer) return;
            executeCommand({ type: 'endTurn', team: 'player' });
            prepareReachable();
            renderHUD();
            renderBoard();
            if (matchState.activeTeam === 'enemy') {
              window.setTimeout(processEnemyTurn, 240);
            }
          },
          !activePlayer || matchState.result.status !== 'ongoing',
        );
      }
    };

    const prepareReachable = (): void => {
      reachableById.clear();
      const active = resolveActiveUnit();
      if (!active) return;
      if (!canUseCommand(matchState, 'move')) return;
      const occupied = new Set(allUnits().map((unit) => keyOf(unit.x, unit.y)));
      occupied.delete(keyOf(active.x, active.y));
      reachableById.set(active.id, resolveReachableCells(active, board.playable, occupied));
    };

    const processEnemyTurn = (): void => {
      const active = resolveActiveUnit();
      if (!active || active.team !== 'enemy') return;
      if (matchState.result.status !== 'ongoing') return;
      if (consumeTurnBudgetOrFallback()) {
        prepareReachable();
        renderHUD();
        renderBoard();
        if (matchState.activeTeam === 'enemy' && matchState.result.status === 'ongoing') {
          window.setTimeout(processEnemyTurn, 240);
        }
        return;
      }
      const moves = Array.from(reachableById.get(active.id) ?? []);
      if (moves.length > 0) {
        const aiRng = createRngState(hashSeedText(`${seed}:${active.id}:${active.x},${active.y}:${matchState.activeIndexInLineup}`));
        const picked = moves[Math.floor(nextRngValue(aiRng) * moves.length)] ?? null;
        const parsed = picked ? parseKey(picked) : null;
        if (parsed) {
          const tileSteps = Math.abs(active.x - parsed.x) + Math.abs(active.y - parsed.y);
          active.x = parsed.x;
          active.y = parsed.y;
          executeCommand({ type: 'move', team: 'enemy', payload: { tileSteps } });
        }
      }
      const timerStep = consumeDecisionTime(matchState, 7_600);
      matchState = timerStep.state;
      const enemyTarget = aliveByTeam.player.find((unit) => unit.hp > 0 && isAdjacent(active, unit));
      if (timerStep.timeout) {
        const fallback = chooseFallbackAction(matchState, {
          hasSafeBasicTarget: Boolean(enemyTarget),
          lethalRisk: enemyTarget ? 0 : 1,
        });
        if (fallback.type === 'basicAttack' && enemyTarget) {
          executeCommand({ type: 'basicAttack', team: 'enemy', payload: { targetX: enemyTarget.x, targetY: enemyTarget.y } });
        } else {
          executeCommand({ type: 'skipAction', team: 'enemy' });
        }
      } else if (enemyTarget) {
        executeCommand({ type: 'basicAttack', team: 'enemy', payload: { targetX: enemyTarget.x, targetY: enemyTarget.y } });
      } else {
        executeCommand({ type: 'skipAction', team: 'enemy' });
      }
      executeCommand({ type: 'endTurn', team: 'enemy' });
      prepareReachable();
      renderHUD();
      renderBoard();
      if (matchState.activeTeam === 'enemy' && matchState.result.status === 'ongoing') {
        window.setTimeout(processEnemyTurn, 240);
      }
    };

    normalizeActiveSlot();
    prepareReachable();
    renderHUD();
    renderBoard();
    if (matchState.activeTeam === 'enemy') {
      window.setTimeout(processEnemyTurn, 240);
    }
  }

  const onBack = () => shell?.enterScreen?.('chess-strategy-rpg-battle');
  backButton?.addEventListener('click', onBack);

  return {
    destroy() {
      backButton?.removeEventListener('click', onBack);
      mount.destroy();
    },
  };
}

export const render = renderScreen;
