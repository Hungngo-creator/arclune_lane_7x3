import { AxiomModuleSet, listAxiomDefinitions, preflightAxiomModules, registerAxiomDefinition } from '../src/combat/axiom-runtime';

test('builtins have distinct activation and permissions', () => { expect(listAxiomDefinitions().map(item => item.id)).toEqual(['reincarnation','heavenly-thunder','divine-nature']); const set = new AxiomModuleSet('pve'); expect([...set.loaded]).toEqual(['reincarnation', 'heavenly-thunder']); expect(() => set.load('divine-nature')).toThrow('requires a source True Self'); set.load('divine-nature', 'holder'); expect(set.loaded.has('divine-nature')).toBe(true); });

test('optional modules load from undeployed possibilities and snapshot only on an explicit stable command', () => {
  let context: any; registerAxiomDefinition({ id: 'light-shadow-river', version: 1, activationPolicy: 'participant-required', supportedModes: ['pve'], observedEvents: [], allowedCommands: ['create-temporal-anchor'], createRuntime: value => { context = value; return { onEvent() {} }; } });
  const unused = new AxiomModuleSet('pve'); preflightAxiomModules(unused, { decks: [] }); expect(unused.snapshotCount).toBe(0); expect(unused.loaded.has('light-shadow-river')).toBe(false);
  const loaded = new AxiomModuleSet('pve'); preflightAxiomModules(loaded, { undeployedDeck: [{ requiresAxiom: 'light-shadow-river' }] }); expect(loaded.loaded.has('light-shadow-river')).toBe(true); expect(loaded.snapshotCount).toBe(0); context.submit({ type: 'create-temporal-anchor', payload: { anchorId: 'anchor-1' } }); expect(loaded.snapshotCount).toBe(1);
  const unstable = new AxiomModuleSet('pve', () => false); unstable.load('light-shadow-river'); expect(() => context.submit({ type: 'create-temporal-anchor', payload: { anchorId: 'anchor-2' } })).toThrow('stable boundary'); expect(unstable.snapshotCount).toBe(0);
});
