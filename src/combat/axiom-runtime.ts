export type AxiomId = 'reincarnation' | 'heavenly-thunder' | 'divine-nature' | 'light-shadow-river' | (string & {});
export type ModeId = 'pve' | 'arena' | 'chess';
export type CanonicalEventType = 'DEATH_CONFIRMED' | 'REVIVE_COMMITTED' | 'DELAYED_REVIVE_SCHEDULED' | 'DELAYED_REVIVE_RESOLVED' | 'REBIRTH_CLAIMED' | 'TRANSGRESSION_RECORDED' | 'CLAIM_CONFLICT';
export type AxiomCommandType = 'record-death' | 'enter-reincarnation' | 'finalize-rebirth' | 'depart-true-self' | 'commit-rebirth' | 'record-transgression' | 'issue-judgment' | 'route-judgment' | 'request-lightning-damage' | 'submit-protected-claim' | 'create-temporal-anchor';
export type AxiomActivationPolicy = 'global' | 'trait' | 'participant-required';
export interface AxiomCommand { readonly type: AxiomCommandType; readonly payload: Readonly<Record<string, unknown>> }
export interface ReadonlyAxiomContext { readonly mode: ModeId; readonly sourceTrueSelfId?: string; readonly read: (query: string) => unknown; readonly submit: (command: AxiomCommand) => unknown }
export interface AxiomRuntime { onEvent(event: CanonicalEventType, payload: Readonly<Record<string, unknown>>): void }
export interface AxiomDefinition { readonly id: AxiomId; readonly version: number; readonly activationPolicy: AxiomActivationPolicy; readonly supportedModes: readonly ModeId[]; readonly observedEvents: readonly CanonicalEventType[]; readonly allowedCommands: readonly AxiomCommandType[]; createRuntime(context: ReadonlyAxiomContext): AxiomRuntime }

const definitions = new Map<AxiomId, AxiomDefinition>();
const commandHandlers = new Map<AxiomCommandType, (command: AxiomCommand) => unknown>();
export function registerAxiomDefinition(definition: AxiomDefinition): void {
  if (definitions.has(definition.id)) throw new Error(`[axiom] duplicate definition ${definition.id}`);
  if (!definition.version || !definition.supportedModes.length || !definition.createRuntime) throw new Error(`[axiom] incomplete definition ${definition.id}`);
  definitions.set(definition.id, Object.freeze(definition));
}
export function registerAxiomCommandHandler(type: AxiomCommandType, handler: (command: AxiomCommand) => unknown): void { if (commandHandlers.has(type)) throw new Error(`[axiom] duplicate command handler ${type}`); commandHandlers.set(type, handler); }
export function listAxiomDefinitions(): readonly AxiomDefinition[] { return [...definitions.values()]; }

export class AxiomModuleSet {
  readonly loaded = new Set<AxiomId>();
  readonly active: Array<{ definition: AxiomDefinition; runtime: AxiomRuntime }> = [];
  snapshotCount = 0;
  constructor(readonly mode: ModeId, private readonly stableBoundary: () => boolean = () => true) {}
  load(id: AxiomId, sourceTrueSelfId?: string): void {
    const definition = definitions.get(id);
    if (!definition || !definition.supportedModes.includes(this.mode)) throw new Error(`[axiom] unavailable module ${id} in ${this.mode}`);
    for (const command of definition.allowedCommands) if (!commandHandlers.has(command) && command !== 'create-temporal-anchor') throw new Error(`[axiom] ${id}: missing handler for ${command}`);
    const submit = (command: AxiomCommand): unknown => {
      if (!definition.allowedCommands.includes(command.type)) throw new Error(`[axiom] ${id}: unauthorized command ${command.type}`);
      if (command.type === 'create-temporal-anchor') { if (!this.stableBoundary()) throw new Error('[axiom] temporal anchor requires a stable boundary'); this.snapshotCount++; return this.snapshotCount; }
      return commandHandlers.get(command.type)!(command);
    };
    const runtime = definition.createRuntime(Object.freeze({ mode: this.mode, sourceTrueSelfId, read: () => undefined, submit }));
    this.loaded.add(id); this.active.push({ definition, runtime });
  }
  publish(event: CanonicalEventType, payload: Readonly<Record<string, unknown>> = {}): void { for (const item of this.active) if (item.definition.observedEvents.includes(event)) item.runtime.onEvent(event, payload); }
}

export function preflightAxiomModules(set: AxiomModuleSet, possibleParticipants: unknown): void {
  const required = new Set<AxiomId>();
  const scan = (value: unknown): void => { if (Array.isArray(value)) { value.forEach(scan); return; } if (!value || typeof value !== 'object') return; for (const [key, child] of Object.entries(value as Record<string, unknown>)) { if (key === 'requiresAxiom' && typeof child === 'string') required.add(child as AxiomId); else scan(child); } };
  scan(possibleParticipants); for (const id of required) if (!set.loaded.has(id)) set.load(id);
}

const emptyRuntime = (): AxiomRuntime => ({ onEvent: () => undefined });
const builtins: readonly AxiomDefinition[] = [
  { id: 'reincarnation', version: 1, activationPolicy: 'global', supportedModes: ['pve','arena','chess'], observedEvents: ['DEATH_CONFIRMED','REVIVE_COMMITTED','DELAYED_REVIVE_SCHEDULED','DELAYED_REVIVE_RESOLVED','REBIRTH_CLAIMED'], allowedCommands: ['record-death','enter-reincarnation','finalize-rebirth','depart-true-self','commit-rebirth'], createRuntime: emptyRuntime },
  { id: 'heavenly-thunder', version: 1, activationPolicy: 'global', supportedModes: ['pve','arena','chess'], observedEvents: ['TRANSGRESSION_RECORDED','REVIVE_COMMITTED','CLAIM_CONFLICT'], allowedCommands: ['record-transgression','issue-judgment','route-judgment','request-lightning-damage'], createRuntime: emptyRuntime },
  { id: 'divine-nature', version: 1, activationPolicy: 'trait', supportedModes: ['pve','arena','chess'], observedEvents: ['CLAIM_CONFLICT'], allowedCommands: ['submit-protected-claim'], createRuntime: emptyRuntime },
];
for (const definition of builtins) registerAxiomDefinition(definition);
