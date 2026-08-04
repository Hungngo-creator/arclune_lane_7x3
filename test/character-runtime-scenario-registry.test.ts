import { executeCharacterRuntimeScenario, assertScenarioCertification, registerCharacterRuntimeScenario, resetScenarioExecutions } from '../src/combat/scenario-registry';

const scenario = { scenarioId: 'registry:test:basic', characterId: 'registry_test', capability: 'basic' as const, setup: () => ({ hp: 10 }), executeProduction: () => ({ productionPaths: ['basic'], canonicalEvents: ['ACTION_FINALIZED'], finalState: { hp: 9 } }), expectedCanonicalEvents: ['ACTION_FINALIZED'], assertFinalState: (state: Readonly<Record<string, unknown>>) => { if (state.hp !== 9) throw new Error('bad final state'); } };

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
