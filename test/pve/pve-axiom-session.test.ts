import { createSession } from '../src/modes/pve/session-state.ts';
import { AxiomModuleSet } from '../src/combat/axiom-runtime.ts';

test('a real PVE session owns exactly one axiom runtime without temporal allocation', () => {
  const session = createSession({});
  const axioms = (session.runtime as any).axiomSession;
  expect(axioms).toBeInstanceOf(AxiomModuleSet);
  expect(axioms.loaded).toEqual(new Set(['reincarnation', 'heavenly-thunder']));
  expect(axioms.snapshotCount).toBe(0);
  axioms.dispose();
  expect(axioms.loaded.size).toBe(0);
});
