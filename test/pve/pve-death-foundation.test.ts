import { ROSTER } from '../src/catalog.ts';
import { dealAbilityDamage, pickTarget } from '../src/combat.ts';
import { ensureCombatIdentity } from '../src/combat/kernel/index.ts';
import { projectCombatPresence } from '../src/combat/presence.ts';
import { slotToCell } from '../src/engine.ts';
import { spawnQueuedIfDue } from '../src/turns.ts';
import type { SessionState } from '../src/types/combat.ts';
import type { UnitToken } from '../src/types/units.ts';

const declaresExceptionalLethal = (entry: (typeof ROSTER)[number]): boolean => {
  const encoded = JSON.stringify(entry.kit ?? {});
  return /surviveAtOneHP|phaseShiftWhenCriticalHP|"type":"revive"|immediate.?revive/i.test(encoded);
};

const enemy = (): UnitToken => ensureCombatIdentity({
  id: 'foundation_attacker', iid: 'foundation:enemy', side: 'enemy', ...slotToCell('enemy', 1),
  hp: 1_000_000, hpMax: 1_000_000, atk: 1_000_000, wil: 0, arm: 0, res: 0,
  alive: true, lifeState: 'alive', statuses: [],
} as UnitToken, 'summoned-creep');

function spawnRosterEntry(entry: (typeof ROSTER)[number]): { game: SessionState; target: UnitToken; attacker: UnitToken } {
  const attacker = enemy();
  const position = slotToCell('ally', 1);
  const game = {
    tokens: [attacker], runtime: {}, actionChain: [],
    meta: new Map(ROSTER.map(unit => [unit.id, unit])),
    queued: { ally: new Map([[1, { unitId: entry.id, side: 'ally', slot: 1, source: 'deck', ...position }]]), enemy: new Map() },
    turn: { cycle: 0 },
  } as unknown as SessionState;
  expect(spawnQueuedIfDue(game, { side: 'ally', slot: 1 }).spawned).toBe(true);
  const target = game.tokens.find(token => token.id === entry.id)!;
  expect(target).toBeDefined();
  return { game, target, attacker };
}

describe('frozen PvE death foundation', () => {
  test.each(ROSTER.filter(entry => !declaresExceptionalLethal(entry)).map(entry => [entry.id, entry] as const))(
    '%s confirms ordinary death on the first production lethal action', (_id, entry) => {
      const { game, target, attacker } = spawnRosterEntry(entry);
      const deadLife = target.lifeSerial;
      const result = dealAbilityDamage(game, attacker, target, { base: Number(target.hpMax) * 100, attackType: 'basic', dtype: 'physical' });
      expect(result.dealt).toBeGreaterThan(0);
      expect(target).toMatchObject({ hp: 0, alive: false, lifeState: 'dead-confirmed', lifeSerial: deadLife });
      const events = ((game.runtime as { combatEvents?: Array<Record<string, unknown>> }).combatEvents ?? []);
      expect(events.filter(event => event.type === 'HP_ZERO')).toHaveLength(1);
      expect(events.filter(event => event.type === 'DEATH_CONFIRMED')).toHaveLength(1);
      expect(events.filter(event => event.type === 'DEATH_PREVENTED')).toHaveLength(0);
      expect(events.filter(event => event.type === 'REVIVE_COMMITTED')).toHaveLength(0);
      expect(projectCombatPresence(target)).toMatchObject({ isTargetable: false, isTurnEligible: false, isAuthoritativeOccupant: false, isLiveRenderable: false, isCorpseRenderable: true });
      expect(pickTarget(game, attacker)).toBeNull();
      expect(dealAbilityDamage(game, attacker, target, { base: 100, attackType: 'basic' }).dealt).toBe(0);
      expect(events.filter(event => event.type === 'DEATH_CONFIRMED')).toHaveLength(1);
    },
  );

  test('all non-live lifecycle states share one absent gameplay projection', () => {
    for (const lifeState of ['hp-zero', 'death-prevention', 'dead-confirmed', 'removed', 'erased'] as const) {
      const unit = { ...enemy(), hp: lifeState === 'removed' ? 10 : 0, alive: false, lifeState } as UnitToken;
      expect(projectCombatPresence(unit)).toMatchObject({ isCombatAlive: false, isTargetable: false, isTurnEligible: false, isAuthoritativeOccupant: false, isLiveRenderable: false });
    }
  });
});
