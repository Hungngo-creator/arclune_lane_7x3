import { inventoryCertifiedRoster } from '../../src/combat/roster-certification';

test('current roster action and capability matrix is complete', () => {
  const report = inventoryCertifiedRoster();
  expect(report.declaredActions).toBeGreaterThan(0);
  expect(report.executedActions).toBe(report.declaredActions);
  expect(report.executedCapabilities).toBe(report.declaredCapabilities);
  expect(report.actionFaults).toBe(0);
  expect(report.stalls).toBe(0);
  console.log(`[pve-foundation] roster=${report.rosterCount} declared-actions=${report.declaredActions} executed-actions=${report.executedActions} declared-capabilities=${report.declaredCapabilities} executed-capabilities=${report.executedCapabilities} battles=${report.battlesCompleted} stalls=${report.stalls} action-faults=${report.actionFaults}`);
});
