import { ensureStyleTag, mountSection } from '../../ui/dom.ts';
import {
  createIrregularBoard,
  MIN_CORE_SIZE,
  randomSeedText,
  resolveEnemyUnitsForChess,
  resolvePlayerUnits,
  resolveValidSeed,
} from './battle.ts';
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
  resolveRescueBarrier,
  scoreAliveUnitPoints,
  type MatchCommandType,
  type MatchState,
  type TeamId,
  type ObjectiveMode,
} from './turn-state.ts';
import { resolveTacticalAiProfile, type TacticalAiProfile } from './seed.ts';

const STYLE_ID = 'chess-strategy-rpg-match-style';
const CARDINAL_DIRS = Object.freeze([{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }]);

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

interface UnitState {
  id: string;
  label: string;
  classId: string;
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
  moveRange: number;
  basicRange: number;
  zocImmune: boolean;
  slotIndex: number;
  isSummon: boolean;
  isObjectiveNpc?: boolean;
}

interface MatchCommand {
  readonly type: MatchCommandType;
  readonly team: TeamId;
  readonly payload?: Record<string, number>;
}

type OffensiveAction = Extract<MatchCommandType, 'basicAttack' | 'castSkill' | 'castUlt'>;
type ActionChoice = OffensiveAction | 'skipAction';

interface ScoredAction {
  action: ActionChoice;
  target: UnitState | null;
  score: number;
}

const CLASS_PROFILE: Record<string, { move: number; basicRange: number; zocImmune?: boolean }> = {
  tanker: { move: 3, basicRange: 1 },
  warrior: { move: 3, basicRange: 1 },
  assassin: { move: 4, basicRange: 1, zocImmune: true },
  mage: { move: 3, basicRange: 2 },
  support: { move: 3, basicRange: 2 },
  summoner: { move: 3, basicRange: 2 },
  ranger: { move: 3, basicRange: 3 },
};

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

function resolveClassProfile(classId: string): { move: number; basicRange: number; zocImmune: boolean } {
  const normalized = classId.trim().toLowerCase();
  const profile = CLASS_PROFILE[normalized] ?? CLASS_PROFILE.warrior ?? { move: 3, basicRange: 1 };
  return {
    move: profile.move,
    basicRange: profile.basicRange,
    zocImmune: Boolean(profile.zocImmune),
  };
}

function hasEnemyZoc(unit: UnitState, x: number, y: number, all: UnitState[]): boolean {
  if (unit.zocImmune) return false;
  for (const other of all) {
    if (other.hp <= 0 || other.team === unit.team) continue;
    if (Math.abs(other.x - x) + Math.abs(other.y - y) === 1) return true;
  }
  return false;
}

function findShortestPaths(unit: UnitState, playable: Set<string>, occupied: Set<string>, all: UnitState[]): Map<string, string[]> {
  const startKey = keyOf(unit.x, unit.y);
  const queue: Array<{ x: number; y: number; cost: number; path: string[] }> = [{ x: unit.x, y: unit.y, cost: 0, path: [startKey] }];
  const best = new Map<string, number>([[startKey, 0]]);
  const paths = new Map<string, string[]>([[startKey, [startKey]]]);
  while (queue.length > 0) {
    const node = queue.shift();
    if (!node) continue;
    for (const dir of CARDINAL_DIRS) {
      const nx = node.x + dir.dx;
      const ny = node.y + dir.dy;
      const key = keyOf(nx, ny);
      if (!playable.has(key) || occupied.has(key)) continue;
      let cost = 1;
      if (hasEnemyZoc(unit, node.x, node.y, all) && !hasEnemyZoc(unit, nx, ny, all)) cost += 1;
      if (hasEnemyZoc(unit, nx, ny, all)) cost = unit.moveRange + 1;
      const nextCost = node.cost + cost;
      if (nextCost > unit.moveRange) continue;
      const currentBest = best.get(key);
      if (currentBest != null && currentBest <= nextCost) continue;
      best.set(key, nextCost);
      const nextPath = [...node.path, key];
      paths.set(key, nextPath);
      queue.push({ x: nx, y: ny, cost: nextCost, path: nextPath });
    }
  }
  paths.delete(startKey);
  return paths;
}

function expectedIncomingDamageAt(
  candidateX: number,
  candidateY: number,
  actor: UnitState,
  enemies: UnitState[],
): number {
  let incoming = 0;
  for (const enemy of enemies) {
    if (enemy.hp <= 0 || enemy.team === actor.team) continue;
    const distance = Math.abs(enemy.x - candidateX) + Math.abs(enemy.y - candidateY);
    if (distance <= enemy.basicRange) {
      incoming += Math.max(1, Math.floor(enemy.atk - actor.arm));
    }
  }
  return incoming;
}

export function chooseBestCombatAction(params: {
  actor: UnitState;
  enemies: UnitState[];
  teamAe: number;
  aiProfile: TacticalAiProfile;
  canUse: (command: MatchCommandType, options?: { skillCost?: number; ae?: number; manualUlt?: boolean; rage?: number; ultCost?: number }) => boolean;
}): ScoredAction {
  const { actor, enemies, teamAe, aiProfile, canUse } = params;
  const evaluateBaseScore = (action: OffensiveAction, target: UnitState): number => {
    const distance = Math.abs(actor.x - target.x) + Math.abs(actor.y - target.y);
    const actionRange = action === 'basicAttack' ? actor.basicRange : action === 'castSkill' ? 2 : 3;
    if (distance > actionRange) return Number.NEGATIVE_INFINITY;
    const projectedDamage = action === 'castUlt'
      ? Math.max(1, Math.floor(actor.atk - target.arm)) + 12
      : action === 'castSkill'
        ? Math.max(1, Math.floor(actor.atk - target.arm)) + 5
        : Math.max(1, Math.floor(actor.atk - target.arm));
    const lethalBonus = projectedDamage >= target.hp ? 10 : 0;
    const pressureBias = aiProfile === 'Aggressive' ? 1.35 : aiProfile === 'Defensive' ? 0.9 : 1.1;
    const defensivePenalty = aiProfile === 'Defensive'
      ? expectedIncomingDamageAt(actor.x, actor.y, actor, enemies) * 0.5
      : 0;
    const resourcePenalty = action === 'castSkill' ? Math.max(0, 6 - teamAe) * 0.15 : 0;
    return pressureBias * projectedDamage + lethalBonus - distance * 0.3 - defensivePenalty - resourcePenalty;
  };

  const bestOfAction = (action: OffensiveAction): ScoredAction => {
    let best: ScoredAction = { action, target: null, score: Number.NEGATIVE_INFINITY };
    for (const target of enemies) {
      const score = evaluateBaseScore(action, target);
      if (score > best.score) best = { action, target, score };
    }
    return best;
  };

  const candidates: ScoredAction[] = [];
  if (canUse('basicAttack')) candidates.push(bestOfAction('basicAttack'));
  if (canUse('castSkill', { skillCost: actor.skillCost, ae: teamAe })) {
    candidates.push(bestOfAction('castSkill'));
  }
  if (canUse('castUlt', { manualUlt: true, rage: actor.rage, ultCost: actor.maxRage })) {
    candidates.push(bestOfAction('castUlt'));
  }

  const viable = candidates
    .filter((item) => item.target && Number.isFinite(item.score))
    .sort((a, b) => b.score - a.score)[0];
  if (viable && viable.target) return viable;
  return { action: 'skipAction', target: null, score: 0 };
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
      <div class="chess-rpg-match__meta">Trận chính · Seed ${seed} · Tu vi ${realm} · Tactical loop: move 1 lần + 1 action.</div>
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
        const classProfile = resolveClassProfile(unit.classId);
        return parsed
          ? {
              id: unit.id,
              label: `P${index + 1}`,
              classId: unit.classId,
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
              moveRange: classProfile.move,
              basicRange: classProfile.basicRange,
              zocImmune: classProfile.zocImmune,
              slotIndex: index,
              isSummon: false,
            }
          : null;
      })
      .filter((item): item is UnitState => item !== null);
      const enemyStates: UnitState[] = enemyUnits
      .slice(0, enemySlots.length)
      .map((unit, index) => {
        const parsed = parseKey(enemySlots[index] ?? '');
        const classProfile = resolveClassProfile(unit.classId);
        return parsed
          ? {
              id: `${unit.id}#${index + 1}`,
              label: `E${index + 1}`,
              classId: unit.classId,
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
              moveRange: classProfile.move,
              basicRange: classProfile.basicRange,
              zocImmune: classProfile.zocImmune,
              slotIndex: index,
              isSummon: false,
            }
          : null;
      })
      .filter((item): item is UnitState => item !== null);
    const lineupSize = Math.min(4, Math.max(playerSlots.length, enemySlots.length));
    const objectiveFromParam = typeof params?.objective === 'string' ? params.objective : 'elimination';
    const objectiveMode: ObjectiveMode = objectiveFromParam === 'rescue' || objectiveFromParam === 'boss' ? objectiveFromParam : 'elimination';
    const rescueNpcSpawn = parseKey(`${coreStart + 1},${coreStart + 1}`);
    const rescueNpc: UnitState | null = objectiveMode === 'rescue' && rescueNpcSpawn
      ? {
          id: 'rescue-npc',
          label: 'NPC',
          classId: 'npc',
          team: 'player',
          x: rescueNpcSpawn.x,
          y: rescueNpcSpawn.y,
          hp: Math.max(1, Math.floor((playerStates[0]?.maxHp ?? 100) * 0.75)),
          maxHp: Math.max(1, Math.floor((playerStates[0]?.maxHp ?? 100) * 0.75)),
          atk: 0,
          arm: playerStates[0]?.arm ?? 0,
          rage: 0,
          maxRage: 100,
          skillCost: 0,
          moveRange: 0,
          basicRange: 0,
          zocImmune: true,
          slotIndex: -1,
          isSummon: false,
          isObjectiveNpc: true,
        }
      : null;
    let rescueTargetAlive = rescueNpc ? rescueNpc.hp > 0 : true;
    let rescueBarrierCharges = objectiveMode === 'rescue' ? 1 : 0;
    let bossAlive = true;
    let matchState: MatchState = createInitialMatchState(lineupSize, objectiveMode);
    let unitTurnStartedAtMs = Date.now();
    let selectedUnitId = playerStates[0]?.id ?? null;
    const reachableById = new Map<string, Map<string, string[]>>();
    const aliveByTeam = {
      player: playerStates,
      enemy: enemyStates,
    };

    const resolveActiveUnit = (): UnitState | null => {
      const teamUnits = aliveByTeam[matchState.activeTeam];
      return teamUnits.find((unit) => unit.slotIndex === matchState.activeIndexInLineup && unit.hp > 0) ?? null;
    };

    const allUnits = (): UnitState[] => {
      const objectiveUnits = rescueNpc && rescueNpc.hp > 0 ? [rescueNpc] : [];
      return [...aliveByTeam.player, ...aliveByTeam.enemy, ...objectiveUnits].filter((unit) => unit.hp > 0);
    };

    const removeDeadUnits = (): void => {
      for (const team of ['player', 'enemy'] as const) {
        for (const unit of aliveByTeam[team]) {
          if (unit.hp <= 0) unit.hp = 0;
        }
      }
    };
    const syncMatchResult = (hook: 'onTurnStart' | 'onAction' | 'onTurnEnd' = 'onAction'): void => {
      rescueTargetAlive = rescueNpc ? rescueNpc.hp > 0 : true;
      const summarizeTeamHpPct = (team: TeamId): number => {
        const units = aliveByTeam[team];
        return units.reduce((total, unit) => {
          const max = Math.max(1, unit.maxHp);
          const ratio = Math.max(0, Math.min(1, unit.hp / max));
          return total + ratio;
        }, 0);
      };
      matchState = evaluateObjectiveResult(matchState, {
        hook,
        context: {
          aliveByTeam: {
            player: aliveByTeam.player.filter((unit) => unit.hp > 0).length,
            enemy: aliveByTeam.enemy.filter((unit) => unit.hp > 0).length,
          },
          hpPctByTeam: {
            player: summarizeTeamHpPct('player'),
            enemy: summarizeTeamHpPct('enemy'),
          },
          unitPointsByTeam: {
            player: scoreAliveUnitPoints(aliveByTeam.player),
            enemy: scoreAliveUnitPoints(aliveByTeam.enemy),
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
    const resolveActionDamage = (action: OffensiveAction, attacker: UnitState, defender: UnitState): number => {
      const base = basicDamage(attacker, defender);
      if (action === 'castUlt') return base + 12;
      if (action === 'castSkill') return base + 5;
      return base;
    };
    const aiProfileFromParam = params?.aiProfile;
    const aiProfile: TacticalAiProfile = aiProfileFromParam === 'Aggressive' || aiProfileFromParam === 'Defensive' || aiProfileFromParam === 'Neutral'
      ? aiProfileFromParam
      : resolveTacticalAiProfile(seed);
    const distance = (a: UnitState, b: UnitState): number => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    const resolveActionRange = (actor: UnitState, action: 'basicAttack' | 'castSkill' | 'castUlt'): number => {
      if (action === 'basicAttack') return Math.max(1, actor.basicRange);
      if (action === 'castSkill') return 2;
      return 3;
    };
    const resolveDefaultTarget = (actor: UnitState, action: 'basicAttack' | 'castSkill' | 'castUlt'): UnitState | null => {
      const range = resolveActionRange(actor, action);
      const enemies = allUnits().filter((unit) => unit.team !== actor.team);
      let picked: UnitState | null = null;
      let bestDistance = Number.POSITIVE_INFINITY;
      for (const enemy of enemies) {
        const d = distance(actor, enemy);
        if (d > range) continue;
        if (d < bestDistance) {
          picked = enemy;
          bestDistance = d;
        }
      }
      return picked;
    };

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
    const hasRescueLethalThreat = (): boolean => {
      if (matchState.objectiveMode !== 'rescue') return false;
      const rescueUnit = rescueNpc;
      if (!rescueUnit || rescueUnit.hp <= 0) return false;
      return aliveByTeam.enemy.some((enemy) => (
        enemy.hp > 0
        && rescueBarrierCharges <= 0
        && distance(enemy, rescueUnit) <= enemy.basicRange
        && basicDamage(enemy, rescueUnit) >= rescueUnit.hp
      ));
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

      if (command.type === 'basicAttack' || command.type === 'castSkill' || command.type === 'castUlt') {
        const actionType = command.type;
        const actorRageBeforeAction = active.rage;
        const targetX = command.payload?.targetX;
        const targetY = command.payload?.targetY;
        const explicitTarget = allUnits().find((unit) => unit.team !== active.team && unit.x === targetX && unit.y === targetY) ?? null;
        const target = explicitTarget ?? resolveDefaultTarget(active, actionType);
        const actionRange = resolveActionRange(active, actionType);
        const hasValidTarget = Boolean(target);
        const inRange = target ? distance(active, target) <= actionRange : false;
        if (actionType === 'castSkill' && !canUseCommand(matchState, actionType, { skillCost: active.skillCost })) return;
        if (actionType === 'castUlt' && !canUseCommand(matchState, actionType, { manualUlt: true, rage: active.rage, ultCost: active.maxRage })) return;
        if (actionType === 'basicAttack' && !canUseCommand(matchState, actionType)) return;
        resolveCollapseAt('beforeAction');
        const rawDamage = target ? resolveActionDamage(actionType, active, target) : 0;
        const rescueBarrier = resolveRescueBarrier({
          enabled: Boolean(
            target
            && matchState.objectiveMode === 'rescue'
            && target.isObjectiveNpc
            && active.team === 'enemy',
          ),
          charges: rescueBarrierCharges,
          targetHp: target?.hp ?? 0,
          incomingDamage: rawDamage,
        });
        if (rescueBarrier.triggered) {
          rescueBarrierCharges = rescueBarrier.remainingCharges;
        }
        const actionResult = resolveAction({
          actorTeam: matchState.activeTeam,
          action: actionType,
          inRange,
          validTarget: hasValidTarget,
          aeBefore: matchState.resources[matchState.activeTeam].ae,
          skillCost: actionType === 'castSkill' ? active.skillCost : undefined,
          actorRage: actionType === 'castUlt' ? active.rage : undefined,
          requireManualUlt: actionType === 'castUlt' ? true : undefined,
          ultCost: actionType === 'castUlt' ? active.maxRage : undefined,
          damage: target ? rescueBarrier.damageAfterBarrier : undefined,
          targetHp: target?.hp,
          buffIds: actionType === 'castSkill'
            ? ['skill-cast']
            : actionType === 'castUlt'
              ? ['ult-cast']
              : rescueBarrier.triggered
                ? ['rescue-barrier']
                : undefined,
        });
        if (!actionResult.ok) return;
        if (target && actionResult.targetHp != null) {
          target.hp = actionResult.targetHp;
          if (target.team === 'enemy' && matchState.objectiveMode === 'boss' && target.slotIndex === 0 && target.hp <= 0) {
            bossAlive = false;
          }
        }
        if (actionType === 'castUlt') {
          active.rage = actionResult.nextRage ?? 0;
        } else {
          active.rage = Math.min(active.maxRage, active.rage + (actionType === 'basicAttack' ? 35 : 20));
        }
        removeDeadUnits();
        if (actionType === 'castSkill') {
          matchState = applyActionCommand(matchState, actionType, { skillCost: active.skillCost });
        } else if (actionType === 'castUlt') {
          matchState = applyActionCommand(matchState, actionType, {
            manualUlt: true,
            rage: actorRageBeforeAction,
            ultCost: active.maxRage,
          });
        } else {
          matchState = applyActionCommand(matchState, actionType);
        }
        resolveActionUiEffects(actionResult);
        resolveCollapseAt('afterAction');
        syncMatchResult('onAction');
        return;
      }

      if (command.type === 'skipAction') {
        if (!canUseCommand(matchState, command.type)) return;
        resolveCollapseAt('beforeAction');
        matchState = applySkipAction(matchState);
        resolveCollapseAt('afterAction');
        syncMatchResult('onAction');
        return;
      }

      if (!canUseCommand(matchState, 'endTurn')) return;
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
      const enemies = allUnits().filter((unit) => unit.team !== active.team);
      const choice = chooseBestCombatAction({
        actor: active,
        enemies,
        teamAe: matchState.resources[active.team].ae,
        aiProfile: active.team === 'enemy' ? aiProfile : 'Defensive',
        canUse: (command, options) => canUseCommand(matchState, command, options),
      });
      const fallback = chooseFallbackAction(matchState, {
        hasSafeBasicTarget: choice.action === 'basicAttack' && Boolean(choice.target),
        lethalRisk: choice.action === 'skipAction' ? 1 : 0,
      });
      if (fallback.type === 'basicAttack' && choice.target) {
        executeCommand({ type: 'basicAttack', team: active.team, payload: { targetX: choice.target.x, targetY: choice.target.y } });
      } else {
        executeCommand({ type: 'skipAction', team: active.team });
      }
      executeCommand({ type: 'endTurn', team: active.team });
      return true;
    };

    const refreshBoardUi = (): void => {
      prepareReachable();
      renderHUD();
      renderBoard();
    };
    const queueEnemyIfNeeded = (): void => {
      if (matchState.activeTeam === 'enemy' && matchState.result.status === 'ongoing') {
        window.setTimeout(processEnemyTurn, 240);
      }
    };
    const finalizePlayerProgress = (): void => {
      refreshBoardUi();
      queueEnemyIfNeeded();
    };

    const renderBoard = (): void => {
      boardHost.innerHTML = '';

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
                finalizePlayerProgress();
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
                if (target.isObjectiveNpc) return;
                if (target.team !== actingUnit.team) {
                  executeCommand({ type: 'basicAttack', team: 'player', payload: { targetX: x, targetY: y } });
                  executeCommand({ type: 'endTurn', team: 'player' });
                  finalizePlayerProgress();
                }
                return;
              }
              const path = reachableById.get(actingUnit.id)?.get(key);
              if (!path) return;
              const tileSteps = Math.max(1, path.length - 1);
              actingUnit.x = x;
              actingUnit.y = y;
              executeCommand({ type: 'move', team: 'player', payload: { tileSteps } });
              refreshBoardUi();
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
        const missionAlert = hasRescueLethalThreat() ? ' | 🚨 Cảnh báo: NPC có nguy cơ bị kết liễu lượt kế.' : '';
        turnHost.textContent = active
          ? active.team === 'player'
           ? `Pha Player · lượt ${matchState.turnCountPlayer}/${PLAYER_TURN_CAP} · ${active.label} (slot ${matchState.activeIndexInLineup + 1}/${lineupSize}) · ${objectiveLabel}${missionAlert} · Move:${matchState.turn.hasMoved ? 'xong' : 'chưa'} · Action:${matchState.turn.hasActed ? 'xong' : 'chưa'} · Timer:${Math.ceil(matchState.unitTimer.remainingMs / 1000)}s + Bank ${Math.ceil(matchState.resources.player.bankTimeMs / 1000)}s.`
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
          const rescueBarrierInfo = matchState.objectiveMode === 'rescue'
            ? ` | Barrier NPC ${rescueBarrierCharges > 0 ? 'sẵn sàng' : 'đã vỡ'}`
            : '';
          status.textContent = `Class ${active.classId} | Tầm đánh cơ bản ${active.basicRange} | AE ${teamResource.ae.toFixed(1)} | Rage ${active.rage}/${active.maxRage} | Skill ${canSkill ? 'mở' : 'khóa'} | Ult ${canUlt ? 'mở tay' : 'khóa'} | AI ${aiProfile}${rescueBarrierInfo}`;
          piecesHost.appendChild(status);
        }
      }
      if (resultHost instanceof HTMLElement) {
        if (matchState.result.status === 'ongoing') {
          resultHost.hidden = true;
        } else {
          resultHost.hidden = false;
          if (matchState.result.status === 'win') {
            resultHost.textContent = matchState.result.reason?.startsWith('turn-cap-tiebreak')
              ? 'Thắng trận (tie-break khi hết turn cap).'
              : 'Thắng trận (hoàn thành objective).';
          } else if (matchState.result.status === 'lose') {
            resultHost.textContent = matchState.result.reason === 'turn-cap-tiebreak:unit-points' || matchState.result.reason === 'turn-cap-tiebreak:hp-pct'
              ? 'Thua trận (tie-break khi hết turn cap).'
              : `Thua trận (${matchState.result.reason === 'turn-cap' ? 'hết turn cap 9 lượt Player' : 'bị tiêu diệt'}).`;
          } else {
            resultHost.textContent = 'Hòa trận (tie-break không phân thắng bại).';
          }
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
            finalizePlayerProgress();
          },
          !activePlayer || !canUseCommand(matchState, 'castSkill', { skillCost: activePlayer.skillCost }) || matchState.result.status !== 'ongoing',
        );
        buildActionButton(
          'Dùng Ultimate',
          () => {
            if (!activePlayer) return;
            executeCommand({ type: 'castUlt', team: 'player' });
            executeCommand({ type: 'endTurn', team: 'player' });
            finalizePlayerProgress();
          },
          !activePlayer || !canUseCommand(matchState, 'castUlt', { manualUlt: true, rage: activePlayer.rage, ultCost: activePlayer.maxRage }) || matchState.result.status !== 'ongoing',
        );
        buildActionButton(
          'Bỏ qua hành động',
          () => {
            if (!activePlayer) return;
            executeCommand({ type: 'skipAction', team: 'player' });
            executeCommand({ type: 'endTurn', team: 'player' });
            finalizePlayerProgress();
          },
          !activePlayer || !canUseCommand(matchState, 'skipAction') || matchState.result.status !== 'ongoing',
        );
        buildActionButton(
          'Kết thúc lượt',
          () => {
            if (!activePlayer) return;
            executeCommand({ type: 'endTurn', team: 'player' });
            finalizePlayerProgress();
          },
          !activePlayer || !canUseCommand(matchState, 'endTurn') || matchState.result.status !== 'ongoing',
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
      reachableById.set(active.id, findShortestPaths(active, board.playable, occupied, allUnits()));
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
      const moves = Array.from(reachableById.get(active.id)?.entries() ?? []);
      const enemies = aliveByTeam.player.filter((unit) => unit.hp > 0);
      if (moves.length > 0 && enemies.length > 0) {
        let bestMove: { key: string; score: number; steps: number } | null = null;
        for (const [key, path] of moves) {
          const parsed = parseKey(key);
          if (!parsed) continue;
          const nearest = enemies.reduce((min, enemy) => Math.min(min, Math.abs(enemy.x - parsed.x) + Math.abs(enemy.y - parsed.y)), Number.POSITIVE_INFINITY);
          const defensiveBias = aiProfile === 'Defensive' ? active.hp / Math.max(1, active.maxHp) : 0;
          const aggressiveBias = aiProfile === 'Aggressive' ? 1.3 : aiProfile === 'Neutral' ? 1 : 0.7;
          const score = aggressiveBias * (10 - nearest) + defensiveBias * 2 - path.length * 0.05;
          if (!bestMove || score > bestMove.score) {
            bestMove = { key, score, steps: Math.max(1, path.length - 1) };
          }
        }
        const parsed = bestMove ? parseKey(bestMove.key) : null;
        if (parsed && bestMove) {
          active.x = parsed.x;
          active.y = parsed.y;
          executeCommand({ type: 'move', team: 'enemy', payload: { tileSteps: bestMove.steps } });
        }
      }
      const timerStep = consumeDecisionTime(matchState, 7_600);
      matchState = timerStep.state;
      const actionChoice = chooseBestCombatAction({
        actor: active,
        enemies: aliveByTeam.player.filter((unit) => unit.hp > 0),
        teamAe: matchState.resources.enemy.ae,
        aiProfile,
        canUse: (command, options) => canUseCommand(matchState, command, options),
      });
      if (timerStep.timeout) {
        const fallback = chooseFallbackAction(matchState, {
          hasSafeBasicTarget: actionChoice.action === 'basicAttack' && Boolean(actionChoice.target),
          lethalRisk: actionChoice.action === 'skipAction' ? 1 : 0,
        });
        if (fallback.type === 'basicAttack' && actionChoice.target) {
          executeCommand({ type: 'basicAttack', team: 'enemy', payload: { targetX: actionChoice.target.x, targetY: actionChoice.target.y } });
        } else {
          executeCommand({ type: 'skipAction', team: 'enemy' });
        }
      } else if (actionChoice.action === 'castUlt' && actionChoice.target) {
        executeCommand({ type: 'castUlt', team: 'enemy', payload: { targetX: actionChoice.target.x, targetY: actionChoice.target.y } });
      } else if (actionChoice.action === 'castSkill' && actionChoice.target) {
        executeCommand({ type: 'castSkill', team: 'enemy', payload: { targetX: actionChoice.target.x, targetY: actionChoice.target.y } });
      } else if (actionChoice.action === 'basicAttack' && actionChoice.target) {
        executeCommand({ type: 'basicAttack', team: 'enemy', payload: { targetX: actionChoice.target.x, targetY: actionChoice.target.y } });
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
    syncMatchResult('onTurnStart');
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
