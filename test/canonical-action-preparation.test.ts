import { getSessionAether } from '../src/aether.ts';
import { createTargetPlan } from '../src/combat/canonical-action-executor.ts';

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
