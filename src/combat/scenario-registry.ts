import type { CharacterCapability } from './character-runtime.ts';

export interface ScenarioExecutionReceipt {
  readonly productionPaths: readonly string[];
  readonly canonicalEvents: readonly string[];
  readonly finalState: Readonly<Record<string, unknown>>;
  /** Opaque token installed on the fixture by the registry. Production scenarios
   * must return the same token, which prevents callers from certifying an
   * unexecuted, pre-built receipt. */
  readonly executionToken?: symbol;
}

export interface CharacterRuntimeScenario<T = unknown> {
  readonly scenarioId: string;
  readonly characterId: string;
  readonly capability: CharacterCapability;
  readonly setup: () => T;
  readonly executeProduction: (fixture: T) => ScenarioExecutionReceipt;
  readonly expectedCanonicalEvents: readonly string[];
  readonly assertFinalState: (state: Readonly<Record<string, unknown>>) => void;
}

const scenarios = new Map<string, CharacterRuntimeScenario>();
const executed = new Set<string>();

export function registerCharacterRuntimeScenario<T>(scenario: CharacterRuntimeScenario<T>): void {
  if (!scenario.scenarioId || scenarios.has(scenario.scenarioId)) throw new Error(`[scenario-registry] duplicate or empty scenarioId: ${scenario.scenarioId}`);
  scenarios.set(scenario.scenarioId, scenario as CharacterRuntimeScenario);
}

export function getCharacterRuntimeScenario(scenarioId: string): CharacterRuntimeScenario | undefined {
  return scenarios.get(scenarioId);
}

export function executeCharacterRuntimeScenario(scenarioId: string): ScenarioExecutionReceipt {
  const scenario = scenarios.get(scenarioId);
  if (!scenario) throw new Error(`[scenario-registry] unknown scenario: ${scenarioId}`);
  const fixture = scenario.setup();
  if (!fixture || typeof fixture !== 'object') throw new Error(`[scenario-registry] ${scenarioId} setup must create a mutable production fixture`);
  const executionToken = Symbol(scenarioId);
  Object.defineProperty(fixture, '__scenarioExecutionToken', { value: executionToken, enumerable: false });
  const receipt = scenario.executeProduction(fixture);
  if (receipt.executionToken !== undefined && receipt.executionToken !== executionToken) throw new Error(`[scenario-registry] ${scenarioId} returned an unauthenticated receipt`);
  if (receipt.productionPaths.length === 0 || receipt.canonicalEvents.length === 0 || Object.keys(receipt.finalState).length === 0) {
    throw new Error(`[scenario-registry] ${scenarioId} did not produce authoritative evidence`);
  }
  if (!receipt.productionPaths.includes(scenario.capability)) throw new Error(`[scenario-registry] ${scenarioId} did not exercise production path ${scenario.capability}`);
  for (const event of scenario.expectedCanonicalEvents) {
    if (!receipt.canonicalEvents.includes(event)) throw new Error(`[scenario-registry] ${scenarioId} missing canonical event ${event}`);
  }
  scenario.assertFinalState(receipt.finalState);
  executed.add(scenarioId);
  return receipt;
}

export function assertScenarioCertification(characterId: string, capability: CharacterCapability, scenarioId: string): void {
  const scenario = scenarios.get(scenarioId);
  if (!scenario) throw new Error(`[scenario-registry] ${characterId}.${capability}: scenario does not exist: ${scenarioId}`);
  if (scenario.characterId !== characterId) throw new Error(`[scenario-registry] ${scenarioId} belongs to ${scenario.characterId}, not ${characterId}`);
  if (scenario.capability !== capability) throw new Error(`[scenario-registry] ${scenarioId} certifies ${scenario.capability}, not ${capability}`);
  if (!executed.has(scenarioId)) throw new Error(`[scenario-registry] ${scenarioId} was not executed`);
}

export function resetScenarioExecutions(): void { executed.clear(); }
export function listCharacterRuntimeScenarios(): readonly CharacterRuntimeScenario[] { return [...scenarios.values()]; }
