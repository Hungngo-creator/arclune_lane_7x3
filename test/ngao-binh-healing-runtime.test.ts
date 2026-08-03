import { doBasicWithFollowups } from '../src/combat.ts';
import { getMetaById } from '../src/catalog.ts';
import { ensureCombatIdentity } from '../src/combat/kernel/index.ts';
import { emitPassiveEvent } from '../src/passives.ts';
import { slotToCell } from '../src/engine.ts';
import type { SessionState } from '../src/types/combat.ts';

describe('Ngao Bính production passive healing path', () => {
  test.each([
    ['au_long', 5],
    ['thanh_nien', 10],
    ['truong_thanh', 17],
    ['long_than', 30],
  ])('%s commits Long Cốt Bất Diệt once after a natural basic', (form, expectedHeal) => {
    const ngao = ensureCombatIdentity({ id: 'ngao_binh', iid: 'ngao-real', side: 'ally', ...slotToCell('ally', 1), alive: true, lifeState: 'alive', hp: 800.8, hpMax: 1000.9, atk: 54, wil: 0, form, statuses: [] } as any, 'collection-unit');
    const creep = ensureCombatIdentity({ id: 'creep_1', iid: 'creep_1#4', side: 'enemy', ...slotToCell('enemy', 3), alive: true, lifeState: 'alive', hp: 500, hpMax: 500, arm: 0, res: 0, statuses: [] } as any, 'summoned-creep');
    const meta = getMetaById('ngao_binh');
    expect(meta?.kit?.passives).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'dragon_form_scaling', when: 'onTurnEnd', effect: 'applyFormRegen' })]));
    const game = { tokens: [ngao, creep], runtime: {}, meta: new Map([['ngao_binh', meta], ['creep_1', getMetaById('creep_1')]]) } as unknown as SessionState;

    const hit = doBasicWithFollowups(game, ngao);
    expect(hit).toBeTruthy();
    emitPassiveEvent(game, ngao, 'onTurnEnd', {});

    expect(ngao.hp).toBe(800 + expectedHeal);
    expect(ngao.hpMax).toBe(1000);
    expect(((game.runtime as any).combatEvents ?? []).filter((event: any) => event.type === 'HEAL_RESOLVED')).toHaveLength(1);
  });
});
