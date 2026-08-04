import { executeCharacterRuntimeScenario, assertScenarioCertification, registerCharacterRuntimeScenario, resetScenarioExecutions } from '../src/combat/scenario-registry';
import { beginActionExecution, finalizeCombatAction, endActionExecution } from '../src/combat/kernel/action-context';

const scenario = { scenarioId: 'registry:test:basic', characterId: 'registry_test', capability: 'basic' as const, setup: () => ({ hp: 10, runtime: {}, tokens: [], battle: { over: false }, events: {} } as any), executeProduction: (fixture: any) => { const before = fixture.hp; const context = beginActionExecution(fixture, { actionId: 'registry:test:action:1', chainId: 'registry:test:action:1', parentActionId: null, actionKind: 'test', actionSerial: 1 }); fixture.hp--; const actionFinalization = finalizeCombatAction(fixture, context); endActionExecution(fixture, context); return { productionPaths: ['basic'], canonicalEvents: ['ACTION_FINALIZED'], finalState: { hp: fixture.hp }, actionFinalization, actionIds: [String(actionFinalization.actionId), String(actionFinalization.chainId)], eventSerials: [actionFinalization.emittedEventSerialRange.first, actionFinalization.emittedEventSerialRange.last], stateChanges: [{ key: 'hp', before, after: fixture.hp }] }; }, expectedCanonicalEvents: ['ACTION_FINALIZED'], assertFinalState: (state: Readonly<Record<string, unknown>>) => { if (state.hp !== 9) throw new Error('bad final state'); } };

beforeEach(() => resetScenarioExecutions());
beforeAll(() => registerCharacterRuntimeScenario(scenario));

test('certification is fail-closed and requires production execution', () => {
  expect(() => assertScenarioCertification('registry_test', 'basic', scenario.scenarioId)).toThrow('was not executed');
  executeCharacterRuntimeScenario(scenario.scenarioId);
  expect(() => assertScenarioCertification('registry_test', 'basic', scenario.scenarioId)).not.toThrow();
  expect(() => assertScenarioCertification('other', 'basic', scenario.scenarioId)).toThrow('belongs to');
  expect(() => assertScenarioCertification('registry_test', 'ultimate', scenario.scenarioId)).toThrow('certifies');
  expect(() => assertScenarioCertification('registry_test', 'basic', 'missing')).toThrow('does not exist');
});
