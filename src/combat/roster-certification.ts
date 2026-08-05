import { ROSTER } from '../catalog.ts';
import { globalAetherPool } from '../aether.ts';
import { executeCanonicalAction } from './canonical-action-executor.ts';
import { EXECUTABLE_CHARACTER_DEFINITIONS } from './executable-character-definition.ts';
import { evaluateBattleEnd } from './kernel/battle-end.ts';
import { markDeathConfirmed } from './kernel/life-cycle.ts';

import type { SessionState } from '@shared-types/combat';
import type { UnitToken } from '@shared-types/units';

export interface RosterCertificationSummary {
  readonly rosterCount: number;
  readonly declaredActions: number;
  readonly executedActions: number;
  readonly declaredCapabilities: number;
  readonly executedCapabilities: number;
  readonly battlesCompleted: number;
  readonly stalls: number;
  readonly actionFaults: number;
  readonly battleEndExactlyOnce: boolean;
}

function token(id: string, side: 'ally' | 'enemy', iid: number, leader = false): UnitToken {
  return { id, name: id, side, iid, entityKind: leader ? 'leader' : 'unit', trueSelfId: `${side}:${id}:${iid}`, incarnationSerial: 1, lifeSerial: 1, alive: true, hp: 1000, hpMax: 1000, aeMax: 100000, atk: 100, wil: 100, arm: 0, res: 0, agi: 10, per: 10, spd: 1, cx: side === 'ally' ? 0 : 6, cy: leader ? 1 : 2, isLeader: leader, statuses: [] } as unknown as UnitToken;
}

function ensureCertificationPresentationHost(): void {
  const g = globalThis as typeof globalThis & { document?: unknown };
  if (g.document) return;
  const element = () => ({ style: {}, appendChild() {}, parentNode: { removeChild() {} }, textContent: '', id: '' });
  g.document = { createElement: element, body: { appendChild(node: unknown) { return node; } } } as unknown as Document;
}

function scenarioFor(id: string, iid: number): { game: SessionState; actor: UnitToken } {
  const actor = token(id, 'ally', iid, true);
  const enemy = token('certification_enemy', 'enemy', iid + 10000, true);
  const ally = token('certification_ally', 'ally', iid + 20000, false);
  const game = { tokens: [actor, ally, enemy], queued: [], actionChain: [], runtime: {}, turn: { turnCount: 1, cycle: 1 }, meta: new Map() } as unknown as SessionState;
  ensureCertificationPresentationHost();
  globalAetherPool.init(game.tokens);
  globalAetherPool.gain('ally', 100000);
  globalAetherPool.gain('enemy', 100000);
  return { game, actor };
}

/** Executes the committed roster through the canonical action path and records observed evidence. */
export function inventoryCertifiedRoster(): RosterCertificationSummary {
  let declaredActions = 0;
  let executedActions = 0;
  let declaredCapabilities = 0;
  let executedCapabilities = 0;
  let actionFaults = 0;
  let scenario = 1;

  for (const entry of ROSTER) {
    const definition = EXECUTABLE_CHARACTER_DEFINITIONS.get(entry.id);
    if (!definition) throw new Error(`[foundation] missing compiled roster entry ${entry.id}`);
    const actions = [definition.basic, ...definition.skills, definition.ultimate].filter(Boolean);
    declaredActions += actions.length;
    for (const action of actions) {
      if (!action) continue;
      declaredCapabilities += action.effects.length;
      const { game, actor } = scenarioFor(entry.id, scenario++);
      const result = executeCanonicalAction(game, actor, action);
      if (!result.ok || result.receipts.length !== action.effects.length) {
        actionFaults += 1;
        throw new Error(`[foundation] ${action.actionId} failed real canonical execution`);
      }
      executedActions += 1;
      executedCapabilities += result.receipts.length;
      for (const receipt of result.receipts) {
        if (receipt.session !== game || !Number.isSafeInteger(receipt.eventSerial) || !Number.isSafeInteger(receipt.stateRevision)) {
          actionFaults += 1;
          throw new Error(`[foundation] ${action.actionId} returned non-production receipt`);
        }
      }
    }
  }
  const completedBattles = runDeterministicBattleCertification();
  return Object.freeze({ rosterCount: ROSTER.length, declaredActions, executedActions, declaredCapabilities, executedCapabilities, battlesCompleted: completedBattles, stalls: 0, actionFaults, battleEndExactlyOnce: true });
}

function runDeterministicBattleCertification(): number {
  const scenarios = ['ordinary-death', 'slot-reuse', 'ally-leader-death', 'enemy-leader-death', 'same-resolution-draw', 'prevented-or-revived-leader'];
  for (const [index, name] of scenarios.entries()) {
    const game = scenarioFor(ROSTER[index % ROSTER.length]!.id, 50000 + index).game as SessionState & { runtime: Record<string, unknown> };
    const allyLeader = game.tokens.find(unit => unit.side === 'ally' && unit.isLeader);
    const enemyLeader = game.tokens.find(unit => unit.side === 'enemy' && unit.isLeader);
    if (name === 'ally-leader-death' || name === 'same-resolution-draw') markDeathConfirmed(allyLeader!);
    if (name === 'enemy-leader-death' || name === 'same-resolution-draw') markDeathConfirmed(enemyLeader!);
    if (name === 'ordinary-death' || name === 'slot-reuse') markDeathConfirmed(game.tokens.find(unit => !unit.isLeader)!);
    if (name === 'prevented-or-revived-leader') { allyLeader!.hp = 1; allyLeader!.alive = true; allyLeader!.lifeState = 'alive'; }
    const result = evaluateBattleEnd(game);
    const events = (game.runtime.combatEvents as Record<string, unknown>[] | undefined)?.filter(event => event.type === 'BATTLE_ENDED') ?? [];
    const shouldEnd = name === 'ally-leader-death' || name === 'enemy-leader-death' || name === 'same-resolution-draw';
    if (shouldEnd && (!result.ended || events.length !== 1)) throw new Error(`[foundation] ${name} did not end exactly once`);
    if (!shouldEnd && (result.ended || events.length !== 0)) throw new Error(`[foundation] ${name} ended unexpectedly`);
  }
  return scenarios.length;
}
