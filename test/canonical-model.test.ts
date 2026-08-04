import { CANONICAL_METADATA_TAGS, EFFECT_TYPES, assertAllEffectHandlersRegistered, compareAuthorityV1, createEffectExecutionServices, directlyConflicts, dispatchEffect, registeredEffectHandlerCount, requireCanonicalMetadataTag, resolveDirectConflictV1, type MechanicClaim } from '../src/combat/canonical-model';

const claim = (overrides: Partial<MechanicClaim> = {}): MechanicClaim => ({ claimId: 'a', effectInstanceId: 'e1', sourceTrueSelfId: 'u1', sourceIid: 1, targetLifeKey: 'target:1', kitKey: 'kit', effectType: 'apply-status', conflictDomain: 'buff-reception', operation: 'deny', authority: 'doctrine', authoritySnapshot: { rank: 'SSR', cultivation: 2, combatPower: 100, stars: 9, awaken: 9 }, createdEventSerial: 1, ...overrides });

test('canonical tag and effect registries are closed', () => {
  expect(CANONICAL_METADATA_TAGS).toHaveLength(45);
  expect(EFFECT_TYPES).toHaveLength(24);
  expect(requireCanonicalMetadataTag('cc:fear', 'x', 'kit.tags[0]')).toBe('cc:fear');
  expect(() => requireCanonicalMetadataTag('fear', 'x', 'kit.tags[0]')).toThrow('namespaced canonical');
  expect(registeredEffectHandlerCount()).toBe(EFFECT_TYPES.length);
  expect(() => assertAllEffectHandlersRegistered()).not.toThrow();
  const effect = { type: 'heal', payload: { amount: 10 }, target: { kind: 'selected-ally' } } as const;
  const commit = () => ({ eventSerial: 1, stateRevision: 1 });
  const commits = Object.fromEntries(['damageGateway','healingGateway','shieldGateway','hpMutationGateway','lifecycleGateway','statusGateway','resourceGateway','summonGateway','fieldGateway','movementGateway','reactionGateway','characterStateGateway'].map(key => [key, commit])) as any;
  const context: any = { session: {}, action: {}, sourceTrueSelfId: 'x', sourceLifeId: 'x:1', resolvedTargetIds: [2], kitKey: 'skill1', authority: 'none', mode: 'pve', random: () => 0.5, services: createEffectExecutionServices(commits) };
  expect(dispatchEffect(effect, context, 'x', 'kit.skill1.effect')).toEqual({ effectType: 'heal', committed: true, eventSerial: 1, stateRevision: 1 });
});

test('authority resolves only directly contradictory effect claims and V1 ignores stars/awaken', () => {
  const deny = claim(); const apply = claim({ claimId: 'b', effectInstanceId: 'e2', operation: 'must-apply', authoritySnapshot: { rank: 'SSR', cultivation: 2, combatPower: 101, stars: 0, awaken: 0 }, createdEventSerial: 2 });
  expect(directlyConflicts(deny, apply)).toBe(true);
  expect(compareAuthorityV1(deny, apply)).toBeLessThan(0);
  expect(resolveDirectConflictV1(deny, apply)).toBe(apply);
  expect(resolveDirectConflictV1(deny, apply as MechanicClaim & { conflictDomain: string })).toBe(apply);
  expect(directlyConflicts(deny, claim({ conflictDomain: 'movement' }))).toBe(false);
});
