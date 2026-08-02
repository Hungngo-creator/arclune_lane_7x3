import type { DamageOrigin, ReactionPolicy } from './types.ts';

const policy = (values: Partial<ReactionPolicy>): ReactionPolicy => ({
  canLifesteal: false, canReflect: false, canCounter: false, canTriggerOnDamage: true,
  canTriggerOnHit: false, canGrantRage: true, canTriggerOnKill: true, aggregation: 'action', ...values,
});

export const DEFAULT_REACTION_POLICIES: Readonly<Record<DamageOrigin, ReactionPolicy>> = {
  direct: policy({ canLifesteal: true, canReflect: true, canCounter: true, canTriggerOnHit: true }),
  followup: policy({ canLifesteal: true, canReflect: true, canTriggerOnHit: true }),
  counter: policy({ canLifesteal: true, canReflect: true, canTriggerOnHit: true }),
  dot: policy({ canGrantRage: true }), reflected: policy({ canGrantRage: true }),
  environment: policy({ canGrantRage: true }), 'self-damage': policy({ canGrantRage: false, canTriggerOnKill: false }),
};

export function resolveReactionPolicy(origin: DamageOrigin, override: Partial<ReactionPolicy> = {}): ReactionPolicy {
  return { ...DEFAULT_REACTION_POLICIES[origin], ...override };
}

