import { AxiomModuleSet, listAxiomDefinitions, preflightAxiomModules, registerAxiomCommandHandler, registerAxiomDefinition } from '../src/combat/axiom-runtime';

for (const type of ['record-death','enter-reincarnation','finalize-rebirth','depart-true-self','commit-rebirth','record-transgression','issue-judgment','route-judgment','request-lightning-damage','submit-protected-claim'] as const) registerAxiomCommandHandler(type, command => command);

test('builtins have distinct activation and permissions', () => { expect(listAxiomDefinitions().map(item => item.id)).toEqual(['reincarnation','heavenly-thunder','divine-nature']); const set = new AxiomModuleSet('pve'); set.load('reincarnation'); expect(set.loaded.has('reincarnation')).toBe(true); });

test('optional modules load from undeployed possibilities and snapshot only on an explicit stable command', () => {
  let context: any; registerAxiomDefinition({ id: 'light-shadow-river', version: 1, activationPolicy: 'participant-required', supportedModes: ['pve'], observedEvents: [], allowedCommands: ['create-temporal-anchor'], createRuntime: value => { context = value; return { onEvent() {} }; } });
  const unused = new AxiomModuleSet('pve'); preflightAxiomModules(unused, { decks: [] }); expect(unused.snapshotCount).toBe(0); expect(unused.loaded.has('light-shadow-river')).toBe(false);
  const loaded = new AxiomModuleSet('pve'); preflightAxiomModules(loaded, { undeployedDeck: [{ requiresAxiom: 'light-shadow-river' }] }); expect(loaded.loaded.has('light-shadow-river')).toBe(true); expect(loaded.snapshotCount).toBe(0); context.submit({ type: 'create-temporal-anchor', payload: {} }); expect(loaded.snapshotCount).toBe(1);
  const unstable = new AxiomModuleSet('pve', () => false); unstable.load('light-shadow-river'); expect(() => context.submit({ type: 'create-temporal-anchor', payload: {} })).toThrow('stable boundary'); expect(unstable.snapshotCount).toBe(0);
});
