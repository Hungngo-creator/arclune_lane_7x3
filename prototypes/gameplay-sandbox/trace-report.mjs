import { NUMERIC_PROFILE, PROFILE_VERSION, SOURCE_REF } from './profiles.mjs';

// Read-only summary; full receipts, precision and engine execution stay intact.
export function summarizeTrace({ options, outcome, trace, currentUnits = [] }) {
  const eventCounts = {}, actors = new Map(), actions = new Map();
  let opportunities = 0, consumedOpportunities = 0, ending = 'IN_PROGRESS';
  const actor = id => {
    if (!actors.has(id)) actors.set(id, { actorId: id, naturalActions: 0, nonNaturalActions: 0, ccLostOpportunities: 0, damageDealt: 0, damageReceived: 0, healingReceived: 0, aePaid: 0, hpCostPaid: 0 });
    return actors.get(id);
  };
  for (const event of trace) {
    eventCounts[event.type] = (eventCounts[event.type] ?? 0) + 1;
    if (event.type === 'OPPORTUNITY_BEGIN') opportunities++;
    if (['OPPORTUNITY_END', 'OPPORTUNITY_TERMINATED'].includes(event.type)) consumedOpportunities++;
    if (event.type === 'BATTLE_ENDED') ending = event.reason;
    if (event.type === 'SANDBOX_LIMIT') ending = 'SANDBOX_LIMIT';
    if (event.type === 'ACTION_BEGIN') {
      const a = actor(event.actorId); a[event.natural ? 'naturalActions' : 'nonNaturalActions']++;
      actions.set(event.actionId, { seq: event.seq, actionId: event.actionId, actorId: event.actorId, abilityId: event.abilityId, natural: event.natural, targets: event.targets, damage: [], healing: [] });
    }
    if (event.type === 'CC_OPPORTUNITY_LOST') actor(event.actorId).ccLostOpportunities++;
    if (event.type === 'COST_COMMITTED') { actor(event.actorId).aePaid += event.ae; actor(event.actorId).hpCostPaid += event.hp; }
    if (event.type === 'DAMAGE_RECEIPT') {
      actor(event.actorId).damageDealt += event.actualHpDamage;
      actor(event.targetId).damageReceived += event.actualHpDamage;
      actions.get(event.actionId)?.damage.push({ targetId: event.targetId, actualHpDamage: event.actualHpDamage });
    }
    if (event.type === 'HEAL_RECEIPT') {
      actor(event.actorId).healingReceived += event.actual;
      actions.get(event.cause)?.healing.push({ targetId: event.actorId, actual: event.actual });
    }
  }
  const natural = [...actions.values()].filter(a => a.natural);
  return {
    format: 'arclune-summary-v1', profile: PROFILE_VERSION, sourceRef: SOURCE_REF, options, outcome,
    progress: { opportunities, consumedOpportunities, opportunityLimit: NUMERIC_PROFILE.maxOpportunities, ending },
    eventCount: trace.length, eventCounts,
    actors: [...actors.values()].sort((a, b) => a.actorId.localeCompare(b.actorId)), currentUnits,
    firstActions: natural.slice(0, 6), recentActions: natural.slice(-12),
    detail: 'Summary only: source snapshots, component receipts, RNG draws and intermediate checkpoints remain in the full trace.',
  };
}

export function traceReport(source, detail = 'summary') {
  if (!['summary', 'full'].includes(detail)) throw new Error('Unsupported trace report detail');
  if (detail === 'full') return { format: 'arclune-trace-v1', profile: PROFILE_VERSION, sourceRef: SOURCE_REF, options: source.options, outcome: source.outcome, trace: source.trace };
  return summarizeTrace(source);
}
