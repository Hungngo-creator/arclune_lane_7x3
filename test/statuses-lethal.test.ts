import { dealAbilityDamage } from '../src/combat.ts';
import { createNaturalAction, withActionExecution } from '../src/combat/kernel/index.ts';
import { Statuses, makeStatusEffect } from '../src/statuses.ts';
import type { SessionState } from '../src/types/combat.ts';
import type { UnitToken } from '../src/types/units.ts';

const unit = (iid: number, side: UnitToken['side'] = 'ally', hp = 100, hpMax = 100): UnitToken => ({
  id: `unit-${iid}`, iid, trueSelfId: `true-self:${iid}`, lifeSerial: 1, lifeState: 'alive', name: `Unit ${iid}`,
  side, cx: 0, cy: 0, alive: true, hp, hpMax, atk: 100, wil: 100, arm: 0, res: 0, statuses: [],
} as UnitToken);
const game = (...tokens: UnitToken[]): SessionState => ({ tokens, runtime: {}, actionChain: [], queued: { ally: new Map(), enemy: new Map() } } as unknown as SessionState);
const add = (target: UnitToken, key: keyof typeof Statuses.make, spec?: Record<string, unknown>): void => {
  const status = makeStatusEffect(key, spec); if (!status) throw new Error('missing status'); Statuses.add(target, status);
};

describe('canonical status lethal handling', () => {
  test('bleed ticks through a dot action and confirms death', () => {
    const target = unit(1, 'ally', 5, 100); const source = unit(2, 'enemy'); const state = game(target, source);
    add(target, 'bleed', { turns: 1, sourceIid: source.iid, creditTrueSelfId: source.trueSelfId });
    Statuses.onTurnEnd(target, { game: state });
    expect(target.lifeState).toBe('dead-confirmed');
    expect((state.runtime as any).combatEvents.map((event:any)=>event.type)).toEqual(expect.arrayContaining(['ACTION_START','DAMAGE_BATCH_RESOLVED','HP_ZERO','DEATH_CONFIRMED','ACTION_END']));
  });

  test('Undying is consumed only by the winning prevention decision', () => {
    const target = unit(3, 'ally', 5, 100); const source = unit(4, 'enemy'); const state = game(target, source);
    add(target, 'bleed', { turns: 1, sourceIid: source.iid }); add(target, 'undying');
    Statuses.onTurnEnd(target, { game: state });
    expect(target.lifeState).toBe('alive'); expect(target.hp).toBe(1); expect(Statuses.has(target, 'undying')).toBe(false);
  });

  test('Venom damage is a linked action and grants one confirmed kill', () => {
    const attacker = unit(5); const target = unit(6, 'enemy', 10, 30); const state = game(attacker, target); add(attacker, 'venom', { pct: 1 });
    withActionExecution(state, createNaturalAction(state, 'skill'), () => dealAbilityDamage(state, attacker, target, { base: 5, attackType: 'skill' }));
    expect(target.lifeState).toBe('dead-confirmed');
    const starts = (state.runtime as any).combatEvents.filter((event:any)=>event.type==='ACTION_START');
    expect(starts).toHaveLength(2); expect(starts[1].parentActionId).toBe(starts[0].actionId);
    expect((state.runtime as any).trueSelfRecords[attacker.trueSelfId!].confirmedKills).toBe(1);
  });

  test('Execute creates a lethal mutation and still opens prevention', () => {
    const attacker = unit(7); const target = unit(8, 'enemy', 5, 40); const state = game(attacker, target); add(attacker, 'execute'); add(target, 'undying');
    withActionExecution(state, createNaturalAction(state, 'skill'), () => dealAbilityDamage(state, attacker, target, { base: 1, attackType: 'skill' }));
    expect(target.lifeState).toBe('alive'); expect(target.hp).toBe(1);
    expect((state.runtime as any).combatEvents.some((event:any)=>event.type==='HP_MUTATION_RESOLVED' && event.kind==='execute')).toBe(true);
  });

  test('reflected damage does not recursively reflect', () => {
    const attacker = unit(9); const target = unit(10, 'enemy'); const state = game(attacker, target); add(attacker, 'reflect', { pct: 1 }); add(target, 'reflect', { pct: 1 });
    withActionExecution(state, createNaturalAction(state, 'skill'), () => dealAbilityDamage(state, attacker, target, { base: 10, attackType: 'skill' }));
    const reflected = (state.runtime as any).combatEvents.filter((event:any)=>event.actionKind==='reflected-damage');
    expect(reflected).toHaveLength(2);
    expect(reflected.every((event:any)=>event.parentActionId===reflected[0].parentActionId)).toBe(true);
  });
});