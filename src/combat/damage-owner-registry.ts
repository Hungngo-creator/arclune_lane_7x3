import type { SessionState } from '@shared-types/combat';
import type { UnitToken } from '@shared-types/units';
import type { ActionExecutionContext } from './kernel/public.ts';

export type CanonicalDamageOwner = (game: SessionState, actor: UnitToken, target: UnitToken, options: { base: number; dtype: string; attackType: string; actionIdentity: ActionExecutionContext['identity'] }) => unknown;
var owner: CanonicalDamageOwner | undefined;
export function registerCanonicalDamageOwner(next: CanonicalDamageOwner): void { if (owner && owner !== next) throw new Error('[canonical-effect] duplicate damage owner'); owner = next; }
export function requireCanonicalDamageOwner(): CanonicalDamageOwner { if (!owner) throw new Error('[canonical-effect] production damage owner is not registered'); return owner; }
