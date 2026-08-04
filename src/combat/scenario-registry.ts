import type { CharacterCapability } from './character-runtime.ts';
import { isProductionActionFinalization, type ActionFinalizationResult } from './kernel/action-context.ts';

export interface ScenarioExecutionReceipt {
  readonly productionPaths: readonly string[];
  readonly canonicalEvents: readonly string[];
  readonly finalState: Readonly<Record<string, unknown>>;
  /** Runtime-owned receipt minted only by finalizeCombatAction. */
  readonly actionFinalization: ActionFinalizationResult;
  readonly actionIds: readonly string[];
  readonly eventSerials: readonly number[];
  readonly stateChanges: readonly { readonly key: string; readonly before: unknown; readonly after: unknown }[];
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
  const receipt = scenario.executeProduction(fixture);
  if (!isProductionActionFinalization(receipt.actionFinalization)) throw new Error(`[scenario-registry] ${scenarioId} returned an unauthenticated production receipt`);
  if (!receipt.actionIds.includes(String(receipt.actionFinalization.actionId)) || !receipt.actionIds.includes(String(receipt.actionFinalization.chainId))) throw new Error(`[scenario-registry] ${scenarioId} evidence does not match its finalized action`);
  const { first, last } = receipt.actionFinalization.emittedEventSerialRange;
  if (!receipt.eventSerials.includes(first) || !receipt.eventSerials.includes(last)) throw new Error(`[scenario-registry] ${scenarioId} evidence does not match canonical event serials`);
  if (receipt.productionPaths.length === 0 || receipt.canonicalEvents.length === 0 || Object.keys(receipt.finalState).length === 0) {
    throw new Error(`[scenario-registry] ${scenarioId} did not produce authoritative evidence`);
  }
  if (!receipt.productionPaths.includes(scenario.capability)) throw new Error(`[scenario-registry] ${scenarioId} did not exercise production path ${scenario.capability}`);
  if (receipt.actionIds.length === 0 || receipt.eventSerials.length === 0 || receipt.stateChanges.length === 0) throw new Error(`[scenario-registry] ${scenarioId} returned synthetic evidence`);
  if (receipt.eventSerials.some((serial, index) => !Number.isSafeInteger(serial) || serial <= 0 || (index > 0 && serial <= receipt.eventSerials[index - 1]!))) throw new Error(`[scenario-registry] ${scenarioId} returned invalid event serials`);
  if (!receipt.stateChanges.some(change => change.before !== change.after)) throw new Error(`[scenario-registry] ${scenarioId} produced no meaningful authoritative state change`);
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
