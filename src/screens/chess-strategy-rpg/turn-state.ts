export type TeamId = 'player' | 'enemy';
export type ObjectiveMode = 'elimination' | 'rescue' | 'boss';
export type MatchResultStatus = 'ongoing' | 'win' | 'lose';
export type ObjectiveHook = 'onTurnStart' | 'onAction' | 'onTurnEnd';
export type CollapseTiming = 'beforeAction' | 'afterAction';

export type MatchCommandType = 'move' | 'basicAttack' | 'castSkill' | 'castUlt' | 'endTurn' | 'skipAction';

export type ActionKind = 'basicAttack' | 'castSkill' | 'castUlt';

export interface TeamResourceState {
  ae: number;
  noSkillTurns: number;
  bankTimeMs: number;
}

export interface TurnFlags {
  hasMoved: boolean;
  hasActed: boolean;
}

export interface ObjectiveRuntimeState {
  rescueTargetAlive?: boolean;
  bossAlive?: boolean;
}

export interface ObjectiveContext {
  readonly aliveByTeam: Readonly<Record<TeamId, number>>;
  readonly objectiveState?: ObjectiveRuntimeState;
}

export interface ObjectiveEvaluationPayload {
  hook: ObjectiveHook;
  context: ObjectiveContext;
}

export interface MatchState {
  phase: TeamId;
  activeTeam: TeamId;
  activeIndexInLineup: number;
  turnCountPlayer: number;
  turn: TurnFlags;
  inputLocked: boolean;
  movedTiles: number;
  readonly lineupSize: number;
  readonly objectiveMode: ObjectiveMode;
  readonly collapseTiming: CollapseTiming;
  readonly collapsePolicyLocked: true;
  collapseRings: number;
  resources: Record<TeamId, TeamResourceState>;
  roundSkillUsed: Record<TeamId, boolean>;
  unitTimer: {
    maxMs: number;
    remainingMs: number;
  };
  result: {
    status: MatchResultStatus;
    reason: string | null;
    winner: TeamId | null;
  };
}

export interface CommandCheckOptions {
  skillCost?: number;
  ae?: number;
  manualUlt?: boolean;
  rage?: number;
  ultCost?: number;
}

export interface ApplyActionOptions {
  skillCost?: number;
  manualUlt?: boolean;
  rage?: number;
  ultCost?: number;
}

export interface ActionResolverInput {
  readonly actorTeam: TeamId;
  readonly action: ActionKind;
  readonly inRange: boolean;
  readonly validTarget: boolean;
  readonly skillCost?: number;
  readonly aeBefore: number;
  readonly damage?: number;
  readonly heal?: number;
  readonly actorRage?: number;
  readonly targetHp?: number;
  readonly buffIds?: ReadonlyArray<string>;
  readonly requireManualUlt?: boolean;
  readonly ultCost?: number;
}

export interface ActionResolverResult {
  ok: boolean;
  nextAe: number;
  nextRage?: number;
  targetHp: number | null;
  isTargetDead: boolean;
  log: string[];
  buffsApplied?: string[];
}

export interface FallbackAction {
  type: 'basicAttack' | 'skipAction';
  reason: 'timeout' | 'no-safe-attack';
}

export interface FallbackHeuristicInput {
  hasSafeBasicTarget?: boolean;
  lethalRisk?: number;
}

export interface ActionUiEffect {
  type: 'floatingText' | 'flash' | 'sound';
  key: string;
}

export const MOVE_AE_PER_TILE = 1;
export const MOVE_AE_CAP_PER_TURN = 3;
export const BASIC_ATTACK_AE_GAIN = 2;
export const ANTI_HOARD_DECAY_AFTER_TURNS = 2;
export const ANTI_HOARD_AE_DECAY = 3;
export const PLAYER_TURN_CAP = 9;
export const UNIT_TURN_BASE_TIME_MS = 8_000;
export const SHRINK_START_PLAYER_TURN = 4;

export function createInitialMatchState(lineupSize: number, objectiveMode: ObjectiveMode = 'elimination'): MatchState {
  return {
    phase: 'player',
    activeTeam: 'player',
    activeIndexInLineup: 0,
    turnCountPlayer: 1,
    turn: {
      hasMoved: false,
      hasActed: false,
    },
    inputLocked: false,
    movedTiles: 0,
    lineupSize: Math.max(1, Math.floor(lineupSize)),
    objectiveMode,
    collapseTiming: 'afterAction',
    collapsePolicyLocked: true,
    collapseRings: 0,
    resources: {
      player: { ae: 0, noSkillTurns: 0, bankTimeMs: 0 },
      enemy: { ae: 0, noSkillTurns: 0, bankTimeMs: 0 },
    },
    roundSkillUsed: {
      player: false,
      enemy: false,
    },
    unitTimer: {
      maxMs: UNIT_TURN_BASE_TIME_MS,
      remainingMs: UNIT_TURN_BASE_TIME_MS,
    },
    result: {
      status: 'ongoing',
      reason: null,
      winner: null,
    },
  };
}

export function canUseCommand(state: MatchState, command: MatchCommandType, options: CommandCheckOptions = {}): boolean {
  if (state.result.status !== 'ongoing') return false;
  if (command === 'endTurn') return state.turn.hasActed;
  if (state.inputLocked) return false;
  if (command === 'move') return !state.turn.hasMoved && !state.turn.hasActed;
  if (command === 'skipAction') return !state.turn.hasActed;
  if (state.turn.hasActed) return false;
  if (command === 'castSkill') {
    return (options.ae ?? state.resources[state.activeTeam].ae) >= (options.skillCost ?? 0);
  }
  if (command === 'castUlt') {
    if (!options.manualUlt) return false;
    return (options.rage ?? 0) >= (options.ultCost ?? 100);
  }
  return true;
}

export function recordMove(state: MatchState, tileSteps: number): MatchState {
  if (!canUseCommand(state, 'move')) return state;
  const steps = Math.max(0, Math.floor(tileSteps));
  const nextMovedTiles = state.movedTiles + steps;
  const prevEligible = Math.min(MOVE_AE_CAP_PER_TURN, state.movedTiles);
  const nextEligible = Math.min(MOVE_AE_CAP_PER_TURN, nextMovedTiles);
  const aeGain = Math.max(0, nextEligible - prevEligible) * MOVE_AE_PER_TILE;
  const activeResources = state.resources[state.activeTeam];
  return {
    ...state,
    movedTiles: nextMovedTiles,
    turn: {
      ...state.turn,
      hasMoved: true,
    },
    resources: {
      ...state.resources,
      [state.activeTeam]: {
        ...activeResources,
        ae: Number((activeResources.ae + aeGain).toFixed(1)),
      },
    },
  };
}

export function markActionUsed(state: MatchState): MatchState {
  return {
    ...state,
    inputLocked: true,
    turn: {
      ...state.turn,
      hasActed: true,
    },
  };
}

export function applyActionCommand(state: MatchState, command: ActionKind, options: ApplyActionOptions = {}): MatchState {
  if (!canUseCommand(state, command, {
    skillCost: options.skillCost,
    manualUlt: options.manualUlt,
    rage: options.rage,
    ultCost: options.ultCost,
  })) return state;
  const activeResources = state.resources[state.activeTeam];
  if (command === 'basicAttack') {
    return {
      ...markActionUsed(state),
      resources: {
        ...state.resources,
        [state.activeTeam]: {
          ...activeResources,
          ae: Number((activeResources.ae + BASIC_ATTACK_AE_GAIN).toFixed(1)),
        },
      },
    };
  }

  if (command === 'castSkill') {
    const skillCost = Math.max(0, options.skillCost ?? 0);
    return {
      ...markActionUsed(state),
      resources: {
        ...state.resources,
        [state.activeTeam]: {
          ...activeResources,
          ae: Number(Math.max(0, activeResources.ae - skillCost).toFixed(1)),
          noSkillTurns: 0,
        },
      },
      roundSkillUsed: {
        ...state.roundSkillUsed,
        [state.activeTeam]: true,
      },
    };
  }

  return markActionUsed(state);
}

export function applySkipAction(state: MatchState): MatchState {
  if (!canUseCommand(state, 'skipAction')) return state;
  return markActionUsed(state);
}

export function resolveAction(input: ActionResolverInput): ActionResolverResult {
  const log: string[] = [];
  const normalizedSkillCost = Math.max(0, input.skillCost ?? 0);
  const normalizedUltCost = Math.max(0, input.ultCost ?? 100);
  const actorRage = Math.max(0, input.actorRage ?? 0);

  if (!input.inRange || !input.validTarget) {
    return { ok: false, nextAe: input.aeBefore, targetHp: input.targetHp ?? null, isTargetDead: false, log: ['invalid-target'] };
  }

  if (input.action === 'castSkill' && input.aeBefore < normalizedSkillCost) {
    return { ok: false, nextAe: input.aeBefore, targetHp: input.targetHp ?? null, isTargetDead: false, log: ['insufficient-ae'] };
  }
  if (input.action === 'castUlt' && input.requireManualUlt === false) {
    return { ok: false, nextAe: input.aeBefore, targetHp: input.targetHp ?? null, isTargetDead: false, log: ['ult-not-manual'] };
  }
  if (input.action === 'castUlt' && actorRage < normalizedUltCost) {
    return { ok: false, nextAe: input.aeBefore, targetHp: input.targetHp ?? null, isTargetDead: false, log: ['insufficient-rage'] };
  }

  const damage = Math.max(0, Math.floor(input.damage ?? 0));
  const heal = Math.max(0, Math.floor(input.heal ?? 0));
  const currentHp = Math.max(0, Math.floor(input.targetHp ?? 0));
  const afterDeltaHp = Math.max(0, currentHp - damage + heal);
  const isTargetDead = afterDeltaHp <= 0 && damage > 0;
  const buffsApplied = Array.isArray(input.buffIds) ? input.buffIds.filter((buff): buff is string => typeof buff === 'string' && buff.length > 0) : [];

  let nextAe = input.aeBefore;
  let nextRage = actorRage;
  if (input.action === 'basicAttack') nextAe = Number((nextAe + BASIC_ATTACK_AE_GAIN).toFixed(1));
  if (input.action === 'castSkill') nextAe = Number(Math.max(0, nextAe - normalizedSkillCost).toFixed(1));
  if (input.action === 'castUlt') nextRage = Math.max(0, actorRage - normalizedUltCost);

  log.push('validate:ok', 'apply:delta', buffsApplied.length > 0 ? 'apply:buff' : 'apply:no-buff', isTargetDead ? 'death-check:dead' : 'death-check:alive', 'resource:update');
  return {
    ok: true,
    nextAe,
    nextRage,
    targetHp: afterDeltaHp,
    isTargetDead,
    log,
    buffsApplied,
  };
}

export function resolveActionUiEffects(result: ActionResolverResult): ActionUiEffect[] {
  if (!result.ok) {
    return [{ type: 'floatingText', key: 'action-invalid' }];
  }
  const effects: ActionUiEffect[] = [{ type: 'flash', key: 'action-hit' }];
  if (result.isTargetDead) effects.push({ type: 'sound', key: 'target-down' });
  if ((result.buffsApplied?.length ?? 0) > 0) effects.push({ type: 'floatingText', key: 'buff-applied' });
  return effects;
}

export function evaluateObjectiveResult(state: MatchState, payload: ObjectiveEvaluationPayload): MatchState {
  if (state.result.status !== 'ongoing') return state;
   type ObjectiveRuleHandler = (current: MatchState, runtime: ObjectiveEvaluationPayload) => MatchState | null;
  const eliminationObjectiveHandler: ObjectiveRuleHandler = (current, runtime) => (
    evaluateMatchResult(current, runtime.context.aliveByTeam)
  );
  const rescueObjectiveHandler: ObjectiveRuleHandler = (current, runtime) => {
    if (runtime.context.objectiveState?.rescueTargetAlive === false) {
      return {
        ...current,
        result: { status: 'lose', reason: `rescue-failed:${runtime.hook}`, winner: 'enemy' },
      };
    }
    return null;
  };
  const bossObjectiveHandler: ObjectiveRuleHandler = (current, runtime) => {
    const { objectiveState, aliveByTeam } = runtime.context;
    if (objectiveState?.bossAlive === false) {
      return {
       ...current,
        result: { status: 'win', reason: `boss-eliminated:${runtime.hook}`, winner: 'player' },
      };
    }
    if (Math.max(0, Math.floor(aliveByTeam.player)) <= 0) {
      return {
        ...current,
        result: { status: 'lose', reason: `boss-player-wiped:${runtime.hook}`, winner: 'enemy' },
      };
    }
  return null;
  };

  const objectiveFramework: Record<ObjectiveMode, Record<ObjectiveHook, ReadonlyArray<ObjectiveRuleHandler>>> = {
    elimination: {
      onTurnStart: [eliminationObjectiveHandler],
      onAction: [eliminationObjectiveHandler],
      onTurnEnd: [eliminationObjectiveHandler],
    },
    rescue: {
      onTurnStart: [rescueObjectiveHandler, eliminationObjectiveHandler],
      onAction: [rescueObjectiveHandler, eliminationObjectiveHandler],
      onTurnEnd: [rescueObjectiveHandler, eliminationObjectiveHandler],
    },
    boss: {
      onTurnStart: [bossObjectiveHandler, eliminationObjectiveHandler],
      onAction: [bossObjectiveHandler, eliminationObjectiveHandler],
      onTurnEnd: [bossObjectiveHandler, eliminationObjectiveHandler],
    },
  };

  let next = state;
  const handlers = objectiveFramework[state.objectiveMode]?.[payload.hook] ?? [];
  for (const handler of handlers) {
    const resolved = handler(next, payload);
    if (resolved) {
      next = resolved;
      if (next.result.status !== 'ongoing') return next;
    }
  }
  return next;
}

export function consumeDecisionTime(state: MatchState, spentMs: number): { state: MatchState; timeout: boolean } {
  const spent = Math.max(0, Math.floor(spentMs));
  const totalBudget = state.unitTimer.remainingMs + state.resources[state.activeTeam].bankTimeMs;
  if (spent <= state.unitTimer.remainingMs) {
    const leftover = state.unitTimer.remainingMs - spent;
    return {
      timeout: false,
      state: {
        ...state,
        unitTimer: { ...state.unitTimer, remainingMs: leftover },
      },
    };
  }

  if (spent <= totalBudget) {
    const bankSpent = spent - state.unitTimer.remainingMs;
    const nextBank = Math.max(0, state.resources[state.activeTeam].bankTimeMs - bankSpent);
    return {
      timeout: false,
      state: {
        ...state,
        unitTimer: { ...state.unitTimer, remainingMs: 0 },
        resources: {
          ...state.resources,
          [state.activeTeam]: {
            ...state.resources[state.activeTeam],
            bankTimeMs: nextBank,
          },
        },
      },
    };
  }

  return {
    timeout: true,
    state: {
      ...state,
      unitTimer: { ...state.unitTimer, remainingMs: 0 },
      resources: {
        ...state.resources,
        [state.activeTeam]: {
          ...state.resources[state.activeTeam],
          bankTimeMs: 0,
        },
      },
    },
  };
}

export function chooseFallbackAction(state: MatchState, heuristic: FallbackHeuristicInput = {}): FallbackAction {
  const hasSafeTarget = heuristic.hasSafeBasicTarget ?? true;
  const lethalRisk = Math.max(0, heuristic.lethalRisk ?? 0);
  if (!state.turn.hasActed && hasSafeTarget && lethalRisk < 1 && canUseCommand(state, 'basicAttack')) {
    return { type: 'basicAttack', reason: 'timeout' };
  }
  return { type: 'skipAction', reason: 'no-safe-attack' };
}

export function maybeApplyShrinkAtTeamEnd(state: MatchState): MatchState {
  if (state.turnCountPlayer < SHRINK_START_PLAYER_TURN) return state;
  return {
    ...state,
    collapseRings: state.collapseRings + 1,
  };
}

export function advanceTurn(state: MatchState): MatchState {
  if (state.result.status !== 'ongoing') return state;
  const nextIndex = state.activeIndexInLineup + 1;
  if (nextIndex < state.lineupSize) {
    return {
      ...state,
      activeIndexInLineup: nextIndex,
      turn: { hasMoved: false, hasActed: false },
      inputLocked: false,
      movedTiles: 0,
      unitTimer: {
        ...state.unitTimer,
        remainingMs: UNIT_TURN_BASE_TIME_MS,
      },
    };
  }

  const previousTeam = state.activeTeam;
  const previousResources = state.resources[previousTeam];
  const noSkillTurns = state.roundSkillUsed[previousTeam] ? 0 : previousResources.noSkillTurns + 1;
  const shouldDecay = noSkillTurns >= ANTI_HOARD_DECAY_AFTER_TURNS;
  const previousTeamResources: TeamResourceState = {
    ae: shouldDecay ? Math.max(0, previousResources.ae - ANTI_HOARD_AE_DECAY) : previousResources.ae,
    noSkillTurns: shouldDecay ? 0 : noSkillTurns,
    bankTimeMs: previousResources.bankTimeMs + state.unitTimer.remainingMs,
  };

  const nextPhase: TeamId = state.activeTeam === 'player' ? 'enemy' : 'player';
  const nextTurnCountPlayer = nextPhase === 'player' ? state.turnCountPlayer + 1 : state.turnCountPlayer;
  const withShrink = maybeApplyShrinkAtTeamEnd(state);
  return {
    ...withShrink,
    phase: nextPhase,
    activeTeam: nextPhase,
    activeIndexInLineup: 0,
    turnCountPlayer: nextTurnCountPlayer,
    turn: { hasMoved: false, hasActed: false },
    inputLocked: false,
    movedTiles: 0,
    unitTimer: {
      ...state.unitTimer,
      remainingMs: UNIT_TURN_BASE_TIME_MS,
    },
    resources: {
      ...withShrink.resources,
      [previousTeam]: previousTeamResources,
    },
    roundSkillUsed: {
      ...withShrink.roundSkillUsed,
      [previousTeam]: false,
    },
  };
}

export function evaluateMatchResult(
  state: MatchState,
  aliveByTeam: Readonly<Record<TeamId, number>>,
): MatchState {
  if (state.result.status !== 'ongoing') return state;
  const playerAlive = Math.max(0, Math.floor(aliveByTeam.player));
  const enemyAlive = Math.max(0, Math.floor(aliveByTeam.enemy));
  if (enemyAlive <= 0) {
    return {
      ...state,
      result: {
        status: 'win',
        reason: 'elimination',
        winner: 'player',
      },
    };
  }
  if (playerAlive <= 0) {
    return {
      ...state,
      result: {
        status: 'lose',
        reason: 'elimination',
        winner: 'enemy',
      },
    };
  }
  if (state.turnCountPlayer > PLAYER_TURN_CAP) {
    return {
      ...state,
      result: {
        status: 'lose',
        reason: 'turn-cap',
        winner: 'enemy',
      },
    };
  }
  return state;
}
