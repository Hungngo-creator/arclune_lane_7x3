import { getSessionAether } from '../src/aether.ts';
import { createTargetPlan } from '../src/combat/canonical-action-executor.ts';
import { executeCanonicalAction } from '../src/combat/canonical-action-executor.ts';
import { compileCatalogAction } from '../src/combat/executable-character-definition.ts';
import { initializeFury } from '../src/utils/fury.ts';

const unit = (id: string, side: 'ally' | 'enemy', cx: number) => ({ id, iid: id, side, cx, cy: 0, alive: true, hp: 100, hpMax: 100, aeMax: 100 });

describe('canonical action preparation contracts', () => {
  test('a random declared selection is drawn once and remains stable', () => {
    const actor = unit('actor', 'ally', 0);
    const game: any = { tokens: [actor, unit('a', 'enemy', 0), unit('b', 'enemy', 1)], rng: { seed: 123, calls: 0 } };
    const spec = { kind: 'random', side: 'enemy', count: 1 } as const;
    const plan = createTargetPlan(game, actor as any, spec);
    const first = plan.resolve(spec);
    game.tokens.reverse();
    expect(plan.resolve(spec)).toBe(first);
    expect(plan.resolve(spec).map(target => target.id)).toEqual(plan.actionTargetIds);
    expect(game.rng.calls).toBe(1);
  });

  test('simultaneous sessions own isolated AE ledgers without DOM', () => {
    const gameA: any = { tokens: [unit('a', 'ally', 0)] };
    const gameB: any = { tokens: [unit('b', 'ally', 0)] };
    const a = getSessionAether(gameA);
    const b = getSessionAether(gameB);
    expect(a.current('ally')).toBe(50);
    expect(a.consume('ally', 20)).toBe(true);
    expect(a.current('ally')).toBe(30);
    expect(b.current('ally')).toBe(50);
  });
});

test('catalog compilation canonicalizes aliases once and rejects placeholder gameplay', () => {
  const compiled = compileCatalogAction('author', 'skill1', { damageMultiplier: 1, targets: 'allEnemies', tags: ['aoe', 'aether-cost'], cost: { aether: 5 } })!;
  expect(compiled.metadataTags).toEqual(expect.arrayContaining(['target:enemy', 'target:all', 'damage:physical', 'cost:aether']));
  expect(() => compileCatalogAction('author', 'skill2', { cooldown: 2 })).toThrow('author at skill2.cooldown');
  expect(JSON.stringify(compiled)).not.toContain('mechanic:');
});

test('preflight is cost-free and successful multi-effect actions charge exactly once with unique evidence', () => {
  const actor: any = { ...unit('actor', 'ally', 0), trueSelfId: 'actor', incarnationSerial: 1, lifeSerial: 1, fury: 50, statuses: [] };
  const enemy: any = { ...unit('enemy', 'enemy', 1), trueSelfId: 'enemy', incarnationSerial: 1, lifeSerial: 1, statuses: [] };
  const game: any = { tokens: [actor, enemy], queued: [], runtime: {}, rng: { seed: 3, calls: 0 } };
  getSessionAether(game).gain('ally', 100);
  initializeFury(actor, actor.id, 50);
  const before = { ae: getSessionAether(game).current('ally'), fury: actor.fury, hp: actor.hp };
  const reserved: any = { actionId: 'actor:bad', target: { kind: 'self' }, effects: [{ type: 'request-revive', target: { kind: 'self' }, payload: { effectId: 'x' } }], cost: { aether: 7, fury: 5, hp: .1 }, conditions: [], metadataTags: [], authority: 'none', ordering: 0, modeScope: ['pve'] };
  expect(executeCanonicalAction(game, actor, reserved).ok).toBe(false);
  expect({ ae: getSessionAether(game).current('ally'), fury: actor.fury, hp: actor.hp }).toEqual(before);
  const action: any = { ...reserved, actionId: 'actor:good', effects: [{ type: 'heal', target: { kind: 'self' }, payload: { amount: .1 } }, { type: 'grant-shield', target: { kind: 'self' }, payload: { amount: .1 } }] };
  const result = executeCanonicalAction(game, actor, action);
  expect(result.ok).toBe(true);
  expect(getSessionAether(game).current('ally')).toBe(before.ae - 7);
  expect(actor.fury).toBe(before.fury - 5);
  expect(new Set(result.receipts.map(receipt => receipt.eventSerial)).size).toBe(2);
  expect(new Set(result.receipts.map(receipt => receipt.stateRevision)).size).toBe(2);
  expect(result.receipts.every(receipt => receipt.actionId && receipt.chainId && receipt.targetLifeIds[0] === 'actor:1:1')).toBe(true);
});